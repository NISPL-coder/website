import express from 'express';
import {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// Optional or required authentication for API consumption
router.get('/', getPayments);
router.post('/', authenticate, createPayment);
router.put('/:id', authenticate, updatePayment);
router.delete('/:id', authenticate, deletePayment);

export default router;

