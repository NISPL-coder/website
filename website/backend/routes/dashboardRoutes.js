import express from 'express';
import { optionalAuthenticate } from '../middlewares/authMiddleware.js';
import { getDashboardOverview } from '../controllers/dashboardController.js';

const router = express.Router();

/**
 * @route   GET /api/dashboard/overview
 * @desc    Retrieve complete overview section data including KPI cards, renewal reminders,
 *          services telemetry, current plan, and account details.
 *          Supports optional JWT Bearer authentication to personalize account details.
 * @access  Public / Authenticated
 */
router.get('/overview', optionalAuthenticate, getDashboardOverview);

export default router;
