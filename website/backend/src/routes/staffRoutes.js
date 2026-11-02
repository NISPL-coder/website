import { Router } from 'express';
import { authenticate, authorizeRole } from '../middleware/authenticate.js';
import {
  listStaff,
  createStaff,
  toggleStaffStatus,
  updateStaffPermissions,
  deleteStaff
} from '../controllers/staffController.js';

const router = Router();

// Require valid authentication for all staff routes
router.use(authenticate);

// List staff accounts (Admin or Manager)
router.get('/', authorizeRole('admin', 'manager'), listStaff);

// Only full Admin can create, modify permissions, toggle status, or delete staff
router.post('/', authorizeRole('admin'), createStaff);
router.patch('/:id/status', authorizeRole('admin'), toggleStaffStatus);
router.put('/:id/status', authorizeRole('admin'), toggleStaffStatus);
router.patch('/:id/permissions', authorizeRole('admin'), updateStaffPermissions);
router.put('/:id/permissions', authorizeRole('admin'), updateStaffPermissions);
router.delete('/:id', authorizeRole('admin'), deleteStaff);

export default router;

