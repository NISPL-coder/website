import { Router } from 'express';
import { authenticate, authorizeRole } from '../middleware/authenticate.js';
import { listActivityLogs, getActivityLogById } from '../controllers/activityLogController.js';

const router = Router();

// Require admin authentication for viewing activity logs
router.use(authenticate);
router.use(authorizeRole('admin'));

router.get('/', listActivityLogs);
router.get('/:id', getActivityLogById);

export default router;

