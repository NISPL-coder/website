import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/permission.js';
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

// Admins always have access; managers/support must be granted the user_access module
router.get('/', requirePermission('user_access', 'view'), listStaff);
router.post('/', requirePermission('user_access', 'create'), createStaff);
router.patch('/:id/status', requirePermission('user_access', 'edit'), toggleStaffStatus);
router.put('/:id/status', requirePermission('user_access', 'edit'), toggleStaffStatus);
router.patch('/:id/permissions', requirePermission('user_access', 'edit'), updateStaffPermissions);
router.put('/:id/permissions', requirePermission('user_access', 'edit'), updateStaffPermissions);
router.delete('/:id', requirePermission('user_access', 'delete'), deleteStaff);

export default router;
