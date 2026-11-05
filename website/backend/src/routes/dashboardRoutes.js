import express from 'express';
import { getDashboardOverview } from '../controllers/dashboardController.js';
import {
  getCustomerOverview,
  searchCustomerPortal,
  payPortalDues,
  activateCustomerDemo
} from '../controllers/portalController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.get('/overview', getDashboardOverview);
router.get('/me', authenticate, getCustomerOverview);
router.get('/search', authenticate, searchCustomerPortal);
router.post('/payments', authenticate, payPortalDues);
router.post('/activate-demo', authenticate, activateCustomerDemo);

export default router;

