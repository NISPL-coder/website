import { Router } from 'express';
import { getSecurityEvents, getSecurityStatus } from '../controllers/securityController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/permission.js';

const router = Router();

router.get('/events', authenticate, requirePermission('activity_logs', 'view'), getSecurityEvents);
router.get('/status', authenticate, requirePermission('activity_logs', 'view'), getSecurityStatus);

export default router;
