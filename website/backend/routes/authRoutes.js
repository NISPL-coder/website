import { Router } from 'express';
import multer from 'multer';
import { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  getAllUsers 
} from '../controllers/authController.js';
import { 
  validateRegister, 
  validateLogin 
} from '../middlewares/validateAuth.js';
import { 
  authenticate, 
  authorizeRole 
} from '../middlewares/authMiddleware.js';

const router = Router();
const upload = multer();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new customer account
 * @access  Public
 */
router.post('/register', upload.none(), validateRegister, register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user (Customer, Partner, Admin) & get JWT token
 * @access  Public
 */
router.post('/login', upload.none(), validateLogin, login);

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user profile
 * @access  Private (JWT Required)
 */
router.get('/me', authenticate, getMe);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset instructions
 * @access  Public
 */
router.post('/forgot-password', upload.none(), forgotPassword);

/**
 * @route   GET /api/auth/users
 * @desc    List all registered users (Admin only)
 * @access  Private (Admin Role Required)
 */
router.get('/users', authenticate, authorizeRole('admin'), getAllUsers);

export default router;
