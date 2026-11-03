import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/permission.js';
import { listActivityLogs, getActivityLogById } from '../controllers/activityLogController.js';

const router = Router();

// Admins always see the audit trail; other roles need an explicit activity_logs grant
router.use(authenticate);
router.use(requirePermission('activity_logs', 'view'));

router.get('/', listActivityLogs);
router.get('/:id', getActivityLogById);

export default router;

