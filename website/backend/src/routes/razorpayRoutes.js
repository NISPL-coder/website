import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getRazorpayConfig,
  createRazorpayOrder,
  verifyRazorpayPayment
} from '../controllers/razorpayController.js';

const router = express.Router();

router.get('/config', getRazorpayConfig);
router.post('/order', authenticate, createRazorpayOrder);
router.post('/verify', authenticate, verifyRazorpayPayment);

export default router;
