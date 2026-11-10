import User from '../models/User.js';
import Session from '../models/Session.js';
import { verifyAccessToken } from '../utils/tokens.js';
import { HttpError } from '../utils/httpError.js';
import { env } from '../config/env.js';

const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.';

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
    } catch {
      throw new HttpError(401, SESSION_EXPIRED_MESSAGE);
    }

    if (payload.type !== 'access') throw new HttpError(401, 'Invalid access token.');

    const user = await User.findById(payload.sub);
    if (!user || user.accountStatus !== 'active') {
      throw new HttpError(401, 'Account is unavailable.');
    }

    // Tokens must carry a tracked session; legacy untracked tokens are refused
    // so no login can outlive the one-day / idle policy.
    if (!payload.sid) throw new HttpError(401, SESSION_EXPIRED_MESSAGE);

    const session = await Session.findById(payload.sid);
    const now = Date.now();
    if (!session || session.revokedAt || session.expiresAt.getTime() <= now) {
      throw new HttpError(401, SESSION_EXPIRED_MESSAGE);
    }
    if (now - session.lastActivityAt.getTime() > env.SESSION_IDLE_MINUTES * 60 * 1000) {
      throw new HttpError(401, 'You were signed out after a period of inactivity. Please sign in again.');
    }
    if (now - session.lastActivityAt.getTime() > 60 * 1000) {
      await Session.updateOne({ _id: session._id }, { $set: { lastActivityAt: new Date() } });
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