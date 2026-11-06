import express from 'express';
import {
  getPayments,
  getReceipts,
  createPayment,
  recordManualPayment,
  getManualPaymentProof,
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

// Money that arrived on a cheque or a plain bank transfer is recorded through
// its own grant, so the offline workflow can be given to accounts staff without
// opening the gateway ledger to them.
router.post('/manual', authenticate, requirePermission('manual_payment', 'create'), recordManualPayment);

// The scan is opened from the payment list, the receipt modal and the manual
// page, so any of those three grants may read it.
router.get(
  '/:paymentId/proof',
  authenticate,
  requirePermission(['payment', 'receipt', 'manual_payment'], 'view'),
  getManualPaymentProof
);

router.put('/:id', authenticate, requirePermission('payment', 'edit'), updatePayment);
router.delete('/:id', authenticate, requirePermission('payment', 'delete'), deletePayment);

export default router;
