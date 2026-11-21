import dns from 'node:dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

import mongoose from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../src/config/env.js';
import Contract, { getContractsFromFile, saveContractsToFile } from '../src/models/Contract.js';
import Payment, { getPaymentsFromFile, savePaymentsToFile } from '../src/models/Payment.js';
import Notification from '../src/models/Notification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('[Migration] Starting Contract ID format migration...');

  // Connect to MongoDB Atlas
  let isMongo = false;
  try {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    isMongo = true;
    console.log('[Migration] Connected to MongoDB Atlas successfully.');
  } catch (err) {
    console.warn('[Migration] Could not connect to MongoDB, proceeding with JSON files only:', err.message);
  }

  // Define ID Mapping Dictionary
  const idMap = {
    // Commercial subscription contracts
    'CTR-2026-1000': 'NISPL/2026-27/00001',
    'CTR-2026-1001': 'NISPL/2026-27/00002',
    'CTR-2026-1002': 'NISPL/2026-27/00003',
    'CTR-2026-1003': 'NISPL/2026-27/00004',
    'CTR-2026-1004': 'NISPL/2026-27/00005',
    'CTR-2026-1005': 'NISPL/2026-27/00006',
    'CTR-2026-1006': 'NISPL/2026-27/00007',
    'CTR-2026-1007': 'NISPL/2026-27/00008',
    'CTR-2026-1008': 'NISPL/2026-27/00009',
    'CTR-2026-1009': 'NISPL/2026-27/00010',
    'CTR-2026-1010': 'NISPL/2026-27/00011',
    'CTR-2026-1011': 'NISPL/2026-27/00012',
    'CTR-2026-1012': 'NISPL/2026-27/00013',

    // Demo trial contracts
    'CTR-DEMO-9653': 'NISPL/2026-27/00014',
    'CTR-DEMO-1391': 'NISPL/2026-27/00015',
    'CTR-DEMO-9003': 'NISPL/2026-27/00016',
    'CTR-DEMO-4285': 'NISPL/2026-27/00017',
    'CTR-DEMO-2275': 'NISPL/2026-27/00018',
    'CTR-DEMO-2885': 'NISPL/2026-27/00019',
    'CTR-DEMO-4640': 'NISPL/2026-27/00020',
    'CTR-DEMO-1636': 'NISPL/2026-27/00021'
  };

  console.log('[Migration] Total mapped Contract IDs:', Object.keys(idMap).length);

  // 1. Update contracts.json
  const fileContracts = getContractsFromFile();
  let fileContractsUpdated = 0;
  fileContracts.forEach((c) => {
    const oldId = c.contractId || c.id;
    if (idMap[oldId]) {
      c.contractId = idMap[oldId];
      c.id = idMap[oldId];
      fileContractsUpdated++;
    }
    if (c.convertedToContractId && idMap[c.convertedToContractId]) {
      c.convertedToContractId = idMap[c.convertedToContractId];
    }
  });
  saveContractsToFile(fileContracts);
  console.log(`[Migration] Updated ${fileContractsUpdated} records in contracts.json`);

  // 2. Update payments.json
  const filePayments = getPaymentsFromFile();
  let filePaymentsUpdated = 0;
  filePayments.forEach((p) => {
    if (p.contractId && idMap[p.contractId]) {
      p.contractId = idMap[p.contractId];
      filePaymentsUpdated++;
    }
    if (Array.isArray(p.contractIds)) {
      p.contractIds = p.contractIds.map((cid) => idMap[cid] || cid);
    }
  });
  savePaymentsToFile(filePayments);
  console.log(`[Migration] Updated ${filePaymentsUpdated} records in payments.json`);

  // 3. Update MongoDB if connected
  if (isMongo) {
    let mongoContractsUpdated = 0;
    for (const [oldId, newId] of Object.entries(idMap)) {
      const res = await Contract.updateMany(
        { $or: [{ contractId: oldId }, { id: oldId }] },
        { $set: { contractId: newId, id: newId } }
      );
      mongoContractsUpdated += res.modifiedCount;

      // Also update convertedToContractId
      await Contract.updateMany(
        { convertedToContractId: oldId },
        { $set: { convertedToContractId: newId } }
      );

      // Update Payments
      await Payment.updateMany(
        { contractId: oldId },
        { $set: { contractId: newId } }
      );
      await Payment.updateMany(
        { contractIds: oldId },
        { $set: { 'contractIds.$': newId } }
      );

      // Update Notifications
      await Notification.updateMany(
        { entityId: oldId },
        { $set: { entityId: newId, 'metadata.contractId': newId } }
      );
    }
    console.log(`[Migration] Updated ${mongoContractsUpdated} contracts in MongoDB Atlas.`);
  }

  console.log('[Migration] All available contracts successfully updated to NISPL/{financial_year}/00001 format!');
  if (isMongo) await mongoose.disconnect();
}

runMigration().catch((err) => {
  console.error('[Migration] Failed:', err);
  process.exit(1);
});
