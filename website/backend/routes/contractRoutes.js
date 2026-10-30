import express from 'express';
import {
  getContracts,
  createContract,
  syncContractToSangam
} from '../controllers/contractController.js';

const router = express.Router();

// GET /api/contracts - List all contracts with Sangam CRM sync status
router.get('/', getContracts);

// POST /api/contracts - Create contract locally and automatically sync to Sangam CRM Contracts
router.post('/', createContract);

// POST /api/contracts/:id/sync - Trigger or retry sync to Sangam CRM Contracts
router.post('/:id/sync', syncContractToSangam);

export default router;

