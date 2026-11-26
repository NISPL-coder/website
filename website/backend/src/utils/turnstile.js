import SecurityEvent from '../models/SecurityEvent.js';
import mongoose from 'mongoose';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export const isTurnstileEnabled = () => Boolean(String(process.env.TURNSTILE_SECRET_KEY || '').trim());

export const getTurnstileSiteKey = () => String(process.env.TURNSTILE_SITE_KEY || '').trim();

/**
 * Verify a Cloudflare Turnstile token server-side.
 * When TURNSTILE_SECRET_KEY is not configured, verification is skipped cleanly
 * so local/UAT environments without Cloudflare keys continue to work.
 */
export const verifyTurnstileToken = async (token, req) => {
  const secret = String(process.env.TURNSTILE_SECRET_KEY || '').trim();
  if (!secret) {
    return { success: true, skipped: true };
  }

  const originOrHost = String(req?.headers?.origin || req?.headers?.host || '').toLowerCase();
  const isLocalRequest =
    process.env.NODE_ENV !== 'production' &&
    (originOrHost.includes('localhost') || originOrHost.includes('127.0.0.1'));
  if (isLocalRequest) {
    return { success: true, skipped: true };
  }

  const responseToken = String(token || '').trim();
  if (!responseToken) {
    await logTurnstileFailure(req, 'Missing Cloudflare Turnstile verification token');
    return { success: false, error: 'Please complete the Cloudflare security check.' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secret);
    formData.append('response', responseToken);
    if (req?.clientIp) {
      formData.append('remoteip', req.clientIp);
    }

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
      signal: AbortSignal.timeout(5000)
    });

    const data = await res.json();
    if (!data.success) {
      await logTurnstileFailure(
        req,
        `Turnstile rejected token (${(data['error-codes'] || []).join(', ') || 'invalid-input-response'})`
      );
      return { success: false, error: 'Security verification failed. Please retry the Turnstile check.' };
    }

    return { success: true, skipped: false };
  } catch (err) {
    console.warn('[Turnstile] Verification request error:', err.message);
    return { success: false, error: 'Unable to verify security check. Please try again.' };
  }
};

async function logTurnstileFailure(req, details) {
  if (mongoose.connection.readyState !== 1) return;
  try {
    await SecurityEvent.create({
      ipAddress: req?.clientIp || req?.ip || 'unknown',
      country: req?.clientCountry || 'Unknown',
      requestUrl: req?.originalUrl || '/api/auth/login',
      userAgent: String(req?.headers?.['user-agent'] || '').slice(0, 300),
      method: req?.method || 'POST',
      eventType: 'turnstile_failed',
      cloudflareAction: 'challenge',
      riskLevel: 'High',
      details,
      cfRay: req?.cfRay || ''
    });
  } catch {
    // Never break request flow on audit log error
  }
}
