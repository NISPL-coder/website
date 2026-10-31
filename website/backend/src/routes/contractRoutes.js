import express from 'express';
import {
  getContracts,
  createContract,
  updateContract,
  deleteContract,
  syncContractToSangam
} from '../controllers/contractController.js';

const router = express.Router();

// GET /api/contracts - List all contracts with Sangam CRM sync status
router.get('/', getContracts);

// POST /api/contracts - Create contract locally and automatically sync to Sangam CRM Contracts
router.post('/', createContract);

// PUT /api/contracts/:id - Update contract and sync to Sangam CRM Contracts
router.put('/:id', updateContract);

// DELETE /api/contracts/:id - Delete contract
router.delete('/:id', deleteContract);

// POST /api/contracts/:id/sync - Trigger or retry sync to Sangam CRM Contracts
router.post('/:id/sync', syncContractToSangam);

export default router;

