import express from 'express';
import {
  getPayments,
  getReceipts,
  createPayment,
  updatePayment,
  deletePayment
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/permission.js';

const router = express.Router();

// The ledger holds customer money, so every read and write needs a signed-in
// account with the matching module grant.
router.get('/receipts', authenticate, requirePermission('receipt', 'view'), getReceipts);
router.get('/', authenticate, requirePermission('payment', 'view'), getPayments);
router.post('/', authenticate, requirePermission('payment', 'create'), createPayment);
router.put('/:id', authenticate, requirePermission('payment', 'edit'), updatePayment);
router.delete('/:id', authenticate, requirePermission('payment', 'delete'), deletePayment);

export default router;
