import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/permission.js';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  syncCustomerToSangam
} from '../controllers/customerController.js';

const router = express.Router();

router.use(authenticate);

// GET /api/customers - List all customers with Sangam CRM status
router.get('/', requirePermission('customer', 'view'), getCustomers);

// POST /api/customers - Create customer locally and automatically sync to Sangam CRM Companies
router.post('/', requirePermission('customer', 'create'), createCustomer);

// PUT /api/customers/:id - Update customer and sync to Sangam CRM
router.put('/:id', requirePermission('customer', 'edit'), updateCustomer);

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', requirePermission('customer', 'delete'), deleteCustomer);

// POST /api/customers/:id/sync - Trigger or retry sync to Sangam CRM
router.post('/:id/sync', requirePermission('customer', 'edit'), syncCustomerToSangam);

export default router;
