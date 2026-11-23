import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

export const createAccessToken = (user, sessionId) => jwt.sign(
  { sub: user._id.toString(), role: user.role, type: 'access', sid: sessionId ? sessionId.toString() : undefined },
  env.JWT_ACCESS_SECRET,
  { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
);

export const createRefreshToken = user => jwt.sign(
  { sub: user._id.toString(), type: 'refresh', nonce: crypto.randomUUID() },
  env.JWT_REFRESH_SECRET,
  { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
);

export const hashToken = token => crypto.createHash('sha256').update(token).digest('hex');

export const verifyAccessToken = token => jwt.verify(token, env.JWT_ACCESS_SECRET);
export const verifyRefreshToken = token => jwt.verify(token, env.JWT_REFRESH_SECRET);

export const create2FATempToken = (user, type = '2fa_login', rememberMe = false, secret = null) => jwt.sign(
  {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    type,
    rememberMe: Boolean(rememberMe),
    ...(secret ? { secret } : {})
  },
  env.JWT_ACCESS_SECRET,
  { expiresIn: '15m' }
);

export const verify2FATempToken = token => {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
  if (!payload || !payload.type || !payload.type.startsWith('2fa_')) {
    throw new Error('Invalid or expired 2FA token.');
  }
  return payload;
};

