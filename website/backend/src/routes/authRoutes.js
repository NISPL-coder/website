import { Router } from 'express';
import {
  login, registerCustomer, getMe, refresh, logout, forgotPassword, resetPassword,
  getAdminConfig, sendAdminOtp, verifyAndCreateAdmin
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateBody, loginSchema, registerSchema, forgotSchema, resetSchema } from '../middleware/validate.js';
import { authLimiter, resetLimiter } from '../utils/rateLimiters.js';

const router = Router();

router.get('/admin-config', getAdminConfig);
router.post('/admin/send-otp', authLimiter, sendAdminOtp);
router.post('/admin/verify-and-create', authLimiter, verifyAndCreateAdmin);

router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/register', authLimiter, validateBody(registerSchema), registerCustomer);
router.get('/me', authenticate, getMe);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', resetLimiter, validateBody(forgotSchema), forgotPassword);
router.post('/reset-password', resetLimiter, validateBody(resetSchema), resetPassword);

export default router;
