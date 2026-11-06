import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/permission.js';
import {
  getContracts,
  createContract,
  updateContract,
  deleteContract,
  importContracts,
  syncContractToSangam
} from '../controllers/contractController.js';

const router = express.Router();

router.use(authenticate);

// GET /api/contracts - List all contracts with Sangam CRM sync status
router.get('/', requirePermission('contract', 'view'), getContracts);

// POST /api/contracts - Create contract locally and automatically sync to Sangam CRM Contracts
router.post('/', requirePermission('contract', 'create'), createContract);

// POST /api/contracts/import - Bulk import contracts from CSV and sync each to Sangam CRM
router.post('/import', requirePermission('contract', 'create'), importContracts);

// PUT /api/contracts/:id - Update contract and sync to Sangam CRM Contracts
router.put('/:id', requirePermission('contract', 'edit'), updateContract);

// DELETE /api/contracts/:id - Delete contract
router.delete('/:id', requirePermission('contract', 'delete'), deleteContract);

// POST /api/contracts/:id/sync - Trigger or retry sync to Sangam CRM Contracts
router.post('/:id/sync', requirePermission('contract', 'edit'), syncContractToSangam);

export default router;
