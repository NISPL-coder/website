import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import User from '../models/User.js';

/**
 * Authentication Middleware: Validates JWT token from Authorization header
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token missing or malformed. Format: Bearer <token>'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token missing.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        error: jwtErr.name === 'TokenExpiredError' 
          ? 'Session token expired. Please log in again.' 
          : 'Invalid or forged token.'
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User account associated with this token no longer exists.'
      });
    }

    if (user.accountStatus === 'Suspended') {
      return res.status(403).json({
        success: false,
        error: 'User account has been suspended. Please contact NISPL support.'
      });
    }

    // Attach sanitized user to request object
    req.user = User.sanitize(user);
    next();
  } catch (error) {
    console.error('[authMiddleware.authenticate] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Authentication verification error.'
    });
  }
};

/**
 * Role-Based Access Control Middleware
 * @param  {...string} roles Allowed roles (e.g. 'admin', 'partner', 'customer')
 */
export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied: Requires one of [${roles.join(', ')}] permissions.`
      });
    }

    next();
  };
};

/**
 * Optional Authentication Middleware:
 * If Authorization Bearer token is provided and valid, attaches req.user.
 * Otherwise proceeds with req.user = null without throwing a 401 error.
 */
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.id);
      if (user && user.accountStatus !== 'Suspended') {
        req.user = User.sanitize(user);
      } else {
        req.user = null;
      }
    } catch {
      req.user = null;
    }
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

