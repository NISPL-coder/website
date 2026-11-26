import mongoose from 'mongoose';
import SecurityEvent from '../models/SecurityEvent.js';

const SENSITIVE_KEYS = new Set([
  'password',
  'newpassword',
  'currentpassword',
  'confirmpassword',
  'otp',
  'code',
  'token',
  'accesstoken',
  'refreshtoken',
  'turnstiletoken',
  'secret'
]);

const SQLI_PATTERNS = [
  /(\bunion\b\s+\bselect\b)/i,
  /(\bselect\b.+\bfrom\b.+\bwhere\b)/i,
  /(\bdrop\b\s+\b(table|database|collection)\b)/i,
  /(['"]\s*or\s+['"]?\d+['"]?\s*=\s*['"]?\d+)/i,
  /(;\s*--\s*$)/i
];

const XSS_PATTERNS = [
  /<script[\s>]/i,
  /javascript\s*:/i,
  /\bon(error|load|click|mouseover)\s*=/i,
  /<iframe[\s>]/i
];

const SCANNER_PATHS = [
  /\/\.env/i,
  /\/\.git/i,
  /\/wp-admin/i,
  /\/wp-login/i,
  /\/phpmyadmin/i,
  /\/actuator/i,
  /\/etc\/passwd/i
];

export const logSecurityEvent = async (payload) => {
  if (mongoose.connection.readyState !== 1) return null;
  try {
    return await SecurityEvent.create({
      ipAddress: payload.ipAddress || 'unknown',
      country: payload.country || 'Unknown',
      requestUrl: String(payload.requestUrl || '/').slice(0, 500),
      userAgent: String(payload.userAgent || '').slice(0, 300),
      method: payload.method || 'GET',
      eventType: payload.eventType,
      cloudflareAction: payload.cloudflareAction || 'log',
      riskLevel: payload.riskLevel || 'Medium',
      identifier: String(payload.identifier || '').slice(0, 160),
      details: String(payload.details || '').slice(0, 500),
      cfRay: String(payload.cfRay || '').slice(0, 120),
      timestamp: payload.timestamp || new Date()
    });
  } catch (err) {
    console.warn('[SecurityEvent] Log write skipped:', err.message);
    return null;
  }
};

/**
 * Extract original client IP & Cloudflare metadata.
 * Only trusts CF-Connecting-IP when CF-Ray is present (request arrived via Cloudflare),
 * or falls back to Express's req.ip (which respects `trust proxy`).
 */
export const cloudflareContextMiddleware = (req, res, next) => {
  const cfRay = String(req.headers['cf-ray'] || '').trim();
  const cfConnectingIp = String(req.headers['cf-connecting-ip'] || '').trim();
  const cfCountry = String(req.headers['cf-ipcountry'] || '').trim().toUpperCase();

  req.isCloudflareProxied = Boolean(cfRay);
  req.cfRay = cfRay;
  req.clientCountry = cfCountry || 'Unknown';
  req.clientIp = (cfRay && cfConnectingIp) ? cfConnectingIp : (req.ip || req.socket?.remoteAddress || 'unknown');
  next();
};

/**
 * Optional strict origin guard: when CLOUDFLARE_STRICT_ORIGIN=true, rejects
 * direct-to-origin requests that bypass Cloudflare (except localhost health checks).
 */
export const cloudflareOriginGuard = async (req, res, next) => {
  if (process.env.CLOUDFLARE_STRICT_ORIGIN !== 'true') return next();

  const ip = req.ip || req.socket?.remoteAddress || '';
  const isLocal = ip === '127.0.0.1' || ip === '::1' || ip.endsWith('127.0.0.1');
  if (isLocal || req.path === '/health') return next();

  const expectedSecret = String(process.env.CLOUDFLARE_ORIGIN_SECRET || '').trim();
  const providedSecret = String(req.headers['x-cf-origin-secret'] || '').trim();

  if (!req.isCloudflareProxied || (expectedSecret && providedSecret !== expectedSecret)) {
    await logSecurityEvent({
      ipAddress: req.clientIp,
      country: req.clientCountry,
      requestUrl: req.originalUrl,
      userAgent: req.headers['user-agent'],
      method: req.method,
      eventType: 'cloudflare_bypass',
      cloudflareAction: 'block',
      riskLevel: 'Critical',
      details: 'Direct origin access attempted without valid Cloudflare proxy headers',
      cfRay: req.cfRay
    });
    return res.status(403).json({
      success: false,
      message: 'Direct origin access is forbidden. Route requests through Cloudflare.'
    });
  }
  return next();
};

const scanValueForThreats = (value) => {
  if (typeof value !== 'string' || !value) return null;
  for (const rx of SQLI_PATTERNS) {
    if (rx.test(value)) return 'sqli_attempt';
  }
  for (const rx of XSS_PATTERNS) {
    if (rx.test(value)) return 'xss_attempt';
  }
  return null;
};

const inspectObject = (obj, depth = 0) => {
  if (!obj || typeof obj !== 'object' || depth > 3) return null;
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase())) continue;
    if (typeof v === 'string') {
      const hit = scanValueForThreats(v);
      if (hit) return hit;
    } else if (v && typeof v === 'object') {
      const hit = inspectObject(v, depth + 1);
      if (hit) return hit;
    }
  }
  return null;
};

/**
 * Lightweight application-level WAF & scanner detector.
 * Blocks SQLi, XSS, and known scanner probes while logging to SecurityEvent.
 */
export const securityThreatDetector = async (req, res, next) => {
  const url = req.originalUrl || req.url || '';
  const ua = String(req.headers['user-agent'] || '');

  // 1. Scanner / sensitive file probes
  if (SCANNER_PATHS.some((rx) => rx.test(url))) {
    await logSecurityEvent({
      ipAddress: req.clientIp,
      country: req.clientCountry,
      requestUrl: url,
      userAgent: ua,
      method: req.method,
      eventType: 'api_scanning',
      cloudflareAction: 'block',
      riskLevel: 'Medium',
      details: 'Blocked automated probe for sensitive path',
      cfRay: req.cfRay
    });
    return res.status(404).json({ success: false, message: 'Not found.' });
  }

  // 2. SQLi / XSS inspection on URL, query, and non-secret body fields
  const threat =
    scanValueForThreats(decodeSafe(url)) ||
    inspectObject(req.query) ||
    inspectObject(req.body);

  if (threat) {
    await logSecurityEvent({
      ipAddress: req.clientIp,
      country: req.clientCountry,
      requestUrl: url,
      userAgent: ua,
      method: req.method,
      eventType: threat,
      cloudflareAction: 'block',
      riskLevel: threat === 'sqli_attempt' ? 'Critical' : 'High',
      details: `Blocked ${threat === 'sqli_attempt' ? 'SQL injection' : 'XSS'} payload pattern`,
      cfRay: req.cfRay
    });
    return res.status(403).json({ success: false, message: 'Request blocked by security policy.' });
  }

  // 3. Automated bot / empty User-Agent on auth endpoints
  if (url.startsWith('/api/auth/') && req.method === 'POST' && (!ua.trim() || /^(curl|python-requests|go-http-client|scrapy|masscan|nikto|sqlmap)/i.test(ua))) {
    await logSecurityEvent({
      ipAddress: req.clientIp,
      country: req.clientCountry,
      requestUrl: url,
      userAgent: ua || '(empty)',
      method: req.method,
      eventType: 'automated_bot',
      cloudflareAction: 'log',
      riskLevel: 'Medium',
      details: 'Automated CLI/bot User-Agent targeting authentication endpoint',
      cfRay: req.cfRay
    });
  }

  return next();
};

function decodeSafe(str) {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}
