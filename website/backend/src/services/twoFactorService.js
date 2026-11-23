import crypto from 'node:crypto';
import { createRequire } from 'module';
import qrcode from 'qrcode';

const require = createRequire(import.meta.url);
const { generateSecret, verifySync, generateURI } = require('otplib');

const ISSUER_NAME = 'NISPL Operations';

/**
 * Generate a new TOTP secret and QR code for Google Authenticator setup.
 * @param {Object} user
 * @param {string} [existingSecret]
 * @returns {Promise<{ secret: string, uri: string, qrCode: string }>}
 */
export async function generateTwoFactorSetup(user, existingSecret = null) {
  const secret = existingSecret || generateSecret();
  const email = user.email || user.loginEmail || 'admin@nispl.in';
  const uri = generateURI({
    issuer: ISSUER_NAME,
    label: email,
    secret
  });

  const qrCode = await qrcode.toDataURL(uri, {
    margin: 2,
    width: 256,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    }
  });

  return { secret, uri, qrCode };
}

/**
 * Verify a 6-digit TOTP token against a secret.
 * Supports +/- 120 seconds of clock drift (epochTolerance) to accommodate
 * discrepancy between phone clock and system clock.
 * @param {string|number} token
 * @param {string} secret
 * @param {number} [toleranceSeconds=120]
 * @returns {boolean}
 */
export function verifyTwoFactorToken(token, secret, toleranceSeconds = 120) {
  if (!token || !secret) return false;
  const cleanToken = String(token).trim().replace(/\D/g, '');
  if (cleanToken.length !== 6) return false;

  try {
    const result = verifySync({
      token: cleanToken,
      secret,
      epochTolerance: toleranceSeconds
    });
    return Boolean(result?.valid);
  } catch (err) {
    console.error('[twoFactorService] Token verification error:', err);
    return false;
  }
}

/**
 * Generate formatted recovery backup codes.
 * @param {number} count
 * @returns {string[]}
 */
export function generateRecoveryCodes(count = 8) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    codes.push(`${part1}-${part2}`);
  }
  return codes;
}

/**
 * Verify and consume a backup recovery code.
 * @param {Object} user
 * @param {string} candidateCode
 * @returns {boolean}
 */
export function verifyAndConsumeRecoveryCode(user, candidateCode) {
  if (!user || !user.twoFactorRecoveryCodes || !candidateCode) return false;
  const normalizedCandidate = String(candidateCode).trim().toUpperCase();

  const index = user.twoFactorRecoveryCodes.findIndex((code) => {
    const norm = String(code).trim().toUpperCase();
    return norm === normalizedCandidate || norm.replace(/-/g, '') === normalizedCandidate.replace(/-/g, '');
  });

  if (index !== -1) {
    user.twoFactorRecoveryCodes.splice(index, 1);
    return true;
  }
  return false;
}
