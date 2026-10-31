import User from '../models/User.js';
import { verifyAccessToken } from '../utils/tokens.js';
import { HttpError } from '../utils/httpError.js';

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new HttpError(401, 'Authentication required.');

    const payload = verifyAccessToken(token);
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
