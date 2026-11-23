import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isDev ? 1000 : 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' }
});

export const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isDev ? 100 : 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many password reset attempts. Please try again later.' }
});
