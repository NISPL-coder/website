import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

export const createAccessToken = user => jwt.sign(
  { sub: user._id.toString(), role: user.role, type: 'access' },
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
