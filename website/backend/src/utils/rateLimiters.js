import rateLimit from 'express-rate-limit';
import { logSecurityEvent } from '../middleware/cloudflareSecurity.js';

const enforceLimits =
  process.env.NODE_ENV === 'production' || process.env.ENFORCE_RATE_LIMITS === 'true';

const keyByClientIp = (req) => req.clientIp || req.ip || 'unknown';

const makeSecurityHandler = (eventType, riskLevel, message) => async (req, res) => {
  await logSecurityEvent({
    ipAddress: keyByClientIp(req),
    country: req.clientCountry || 'Unknown',
    requestUrl: req.originalUrl,
    userAgent: req.headers['user-agent'],
    method: req.method,
    eventType,
    cloudflareAction: 'block',
    riskLevel,
    identifier: String(req.body?.identifier || req.body?.email || '').slice(0, 120),
    details: `Rate limit exceeded: ${message}`,
    cfRay: req.cfRay || ''
  });
  return res.status(429).json({ success: false, message });
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: enforceLimits ? 20 : 1000,
  keyGenerator: keyByClientIp,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: makeSecurityHandler(
    'auth_endpoint_probe',
    'Medium',
    'Too many authentication attempts. Please try again later.'
  )
});

// Admin login: 5 failed attempts per 15 minutes
export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: enforceLimits ? 5 : 1000,
  skipSuccessfulRequests: true,
  keyGenerator: keyByClientIp,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: makeSecurityHandler(
    'admin_login_failure',
    'High',
    'Too many failed admin login attempts. Please try again in 15 minutes.'
  )
});

// Customer login: 10 failed attempts per 15 minutes
export const customerLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: enforceLimits ? 10 : 1000,
  skipSuccessfulRequests: true,
  keyGenerator: keyByClientIp,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: makeSecurityHandler(
    'customer_login_brute_force',
    'High',
    'Too many failed login attempts. Please try again in 15 minutes.'
  )
});

// Dynamically selects admin (5/15m) vs customer (10/15m) login limiter
export const loginPortalLimiter = (req, res, next) => {
  const portal = String(req.body?.portal || '').trim().toLowerCase();
  if (portal === 'admin') {
    return adminLoginLimiter(req, res, next);
  }
  return customerLoginLimiter(req, res, next);
};

// OTP verification: 5 attempts per 10 minutes
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: enforceLimits ? 5 : 500,
  keyGenerator: keyByClientIp,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: makeSecurityHandler(
    'otp_failure',
    'High',
    'Too many OTP verification attempts. Please wait 10 minutes before trying again.'
  )
});

// Password reset: 3 requests per 15 minutes
export const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: enforceLimits ? 3 : 100,
  keyGenerator: keyByClientIp,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: makeSecurityHandler(
    'password_reset_abuse',
    'Medium',
    'Too many password reset requests. Please try again in 15 minutes.'
  )
});
