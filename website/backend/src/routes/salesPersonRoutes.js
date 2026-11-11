import express from 'express';
import {
  getSalesPersons,
  getActiveSalesPersons,
  createSalesPerson,
  updateSalesPerson,
  deleteSalesPerson
} from '../controllers/salesPersonController.js';

const router = express.Router();

// GET /api/v1/sales-persons/active — Fast endpoint for Customer Portal & forms
router.get('/active', getActiveSalesPersons);

// GET /api/v1/sales-persons — Full list with stats for Admin Portal
router.get('/', getSalesPersons);

// POST /api/v1/sales-persons — Create sales person (Admin)
router.post('/', createSalesPerson);

// PUT /api/v1/sales-persons/:id — Update sales person (Admin)
router.put('/:id', updateSalesPerson);

// DELETE /api/v1/sales-persons/:id — Delete sales person (Admin)
router.delete('/:id', deleteSalesPerson);

export default router;

