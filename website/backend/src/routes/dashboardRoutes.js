import express from 'express';
import { getDashboardOverview } from '../controllers/dashboardController.js';
import { getCustomerOverview } from '../controllers/portalController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.get('/overview', getDashboardOverview);
router.get('/me', authenticate, getCustomerOverview);

export default router;

