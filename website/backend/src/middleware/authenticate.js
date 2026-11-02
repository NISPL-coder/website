import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verifyAccessToken, createAccessToken } from '../utils/tokens.js';
import { HttpError } from '../utils/httpError.js';
import { env } from '../config/env.js';

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token || token === 'null' || token === 'undefined') {
      throw new HttpError(401, 'Authentication required.');
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (jwtErr) {
      // If access token expired, verify if user is still valid & active
      if (jwtErr.name === 'TokenExpiredError') {
        try {
          const decoded = jwt.decode(token);
          if (decoded && decoded.sub) {
            const user = await User.findById(decoded.sub);
            if (user && user.accountStatus === 'active') {
              const freshToken = createAccessToken(user);
              res.setHeader('x-refreshed-token', freshToken);
              res.setHeader('Access-Control-Expose-Headers', 'x-refreshed-token');
              req.user = user;
              return next();
            }
          }
        } catch {
          // fall through
        }
      }
      throw new HttpError(401, 'Invalid or expired access token.');
    }

    if (payload.type !== 'access') throw new HttpError(401, 'Invalid access token.');

    const user = await User.findById(payload.sub);
    if (!user || user.accountStatus !== 'active') {
      throw new HttpError(401, 'Account is unavailable.');
    }
    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : new HttpError(401, 'Invalid or expired access token.'));
  }
}

export const authorizeRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new HttpError(403, 'You do not have permission to perform this action.'));
  }
  next();
};
