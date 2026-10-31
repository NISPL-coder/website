import express from 'express';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  syncCustomerToSangam
} from '../controllers/customerController.js';

const router = express.Router();

// GET /api/customers - List all customers with Sangam CRM status
router.get('/', getCustomers);

// POST /api/customers - Create customer locally and automatically sync to Sangam CRM Companies
router.post('/', createCustomer);

// PUT /api/customers/:id - Update customer and sync to Sangam CRM
router.put('/:id', updateCustomer);

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', deleteCustomer);

// POST /api/customers/:id/sync - Trigger or retry sync to Sangam CRM
router.post('/:id/sync', syncCustomerToSangam);

export default router;

