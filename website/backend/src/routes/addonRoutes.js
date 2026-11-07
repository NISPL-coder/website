import express from 'express';
import {
  getAddons,
  getAdminAddons,
  createAddon,
  updateAddon,
  toggleAddon,
  toggleCheckoutAddons,
  deleteAddon
} from '../controllers/addonController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/permission.js';

const router = express.Router();

// Public & Customer checkout fetch
router.get('/', getAddons);

// Admin routes
router.get('/admin/all', authenticate, getAdminAddons);
router.patch('/toggle-checkout', authenticate, requirePermission('product', 'edit'), toggleCheckoutAddons);
router.post('/', authenticate, requirePermission('product', 'create'), createAddon);
router.put('/:id', authenticate, requirePermission('product', 'edit'), updateAddon);
router.patch('/:id/toggle', authenticate, requirePermission('product', 'edit'), toggleAddon);
router.delete('/:id', authenticate, requirePermission('product', 'delete'), deleteAddon);

export default router;

