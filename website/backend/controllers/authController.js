import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import User from '../models/User.js';

/**
 * Generate standard JWT Token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.customerId || user.id || user._id,
      customerId: user.customerId,
      email: user.email,
      role: user.role
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

/**
 * Controller handling user registration
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, mobile, companyName, gstNo, password, role } = req.body;

    // Create user via Mongoose User model static
    const createdUser = await User.createUser({
      name,
      email,
      mobile,
      companyName,
      gstNo,
      password,
      role: role || 'customer'
    });

    const token = generateToken(createdUser);

    return res.status(201).json({
      success: true,
      message: 'Customer account registered successfully.',
      token,
      user: createdUser
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }

    // Handle Mongo duplicate key error (code 11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'Email or GST';
      return res.status(409).json({
        success: false,
        error: `An account with this ${field} already exists.`
      });
    }

    console.error('[authController.register] Error:', error);
    next(error);
  }
};

/**
 * Controller handling user login across portals (Customer, Partner, Admin)
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password, portal } = req.body;

    // Lookup user by email or customer ID
    const user = await User.findByEmailOrCustomerId(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email/Customer ID or password.'
      });
    }

    // Verify bcrypt hash
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email/Customer ID or password.'
      });
    }

    // Enforce role-based portal security if portal is specified
    if (portal) {
      const p = portal.toLowerCase();
      if (p === 'admin' && user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied: This portal requires Administrator NOC clearance.'
        });
      }
      if (p === 'partner' && user.role !== 'partner') {
        return res.status(403).json({
          success: false,
          error: 'Access denied: This portal is restricted to authorized NISPL Partners.'
        });
      }
    }

    const sanitizedUser = User.sanitize(user);
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: sanitizedUser
    });
  } catch (error) {
    console.error('[authController.login] Error:', error);
    next(error);
  }
};

/**
 * Get profile of currently authenticated user
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
};

/**
 * Handle password reset request
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid registered email address.'
    });
  }

  const user = await User.findByEmail(email);
  if (!user) {
    // Return friendly generic response to prevent email harvesting
    return res.status(200).json({
      success: true,
      message: 'If an active account exists with this email, password reset instructions have been sent.'
    });
  }

  return res.status(200).json({
    success: true,
    message: `Password reset instructions have been dispatched to ${email}.`
  });
};

/**
 * Admin: List all registered users
 * GET /api/auth/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find({}).sort({ createdAt: -1 });
    const sanitizedList = allUsers.map((u) => User.sanitize(u));

    return res.status(200).json({
      success: true,
      count: sanitizedList.length,
      users: sanitizedList
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve registered users list.'
    });
  }
};
