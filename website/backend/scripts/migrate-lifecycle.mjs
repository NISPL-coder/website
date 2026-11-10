import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import Customer, { getCustomersFromFile, saveCustomersToFile } from '../src/models/Customer.js';
import Contract, { getContractsFromFile, saveContractsToFile } from '../src/models/Contract.js';
import Payment, { getPaymentsFromFile } from '../src/models/Payment.js';
import {
  deriveCustomerLifecycle,
  normalizeLifecycle,
  CUSTOMER_LIFECYCLE
} from '../src/services/customerLifecycle.js';
import { normalizeContractStatus } from '../src/utils/contractVocabulary.js';

const APPLY = process.argv.includes('--apply');
const connected = () => mongoose.connection.readyState === 1;

const isDemoFlagged = (ctr) =>
  Boolean(ctr.isDemoTrial || ctr.contractType === 'Trial' || ctr.productCategory === 'Trial');

async function main() {
  try {
    await connectDatabase();
  } catch (err) {
    console.warn('[migrate] Mongo connect failed, using file ledgers only:', err.message);
  }

  const customers = connected() ? await Customer.find().lean() : getCustomersFromFile();
  const contracts = connected() ? await Contract.find().lean() : getContractsFromFile();
  const payments = connected() ? await Payment.find().lean() : getPaymentsFromFile();

  console.log(`[migrate] source=${connected() ? 'mongo' : 'file'} customers=${customers.length} contracts=${contracts.length} payments=${payments.length}`);
  console.log(`[migrate] mode=${APPLY ? 'APPLY' : 'DRY-RUN'}`);

  // 1. Customer lifecycle repair: derive the bucket from the registers.
  const customerChanges = [];
  for (const cust of customers) {
    const next = deriveCustomerLifecycle(cust, contracts, payments);
    const storedCanonical = CUSTOMER_LIFECYCLE.includes(cust.status);
    if (storedCanonical && normalizeLifecycle(cust.status) === next) continue;
    customerChanges.push({ key: cust.customerId || String(cust._id), company: cust.company, from: cust.status, to: next });
  }

  // 2. Demo contracts mislabelled with a paid-looking status -> DEMO.
  const contractChanges = [];
  for (const ctr of contracts) {
    if (!isDemoFlagged(ctr) || ctr.convertedToPaid) continue;
    const norm = normalizeContractStatus(ctr.status);
    if (norm === 'In Progress') {
      contractChanges.push({ key: ctr.contractId || String(ctr._id), company: ctr.company, from: ctr.status, to: 'DEMO' });
    }
  }

  console.log(`\n[migrate] customer status repairs: ${customerChanges.length}`);
  for (const c of customerChanges) console.log(`  ${c.key} | ${c.company} | ${c.from} -> ${c.to}`);
  console.log(`\n[migrate] demo contract status repairs: ${contractChanges.length}`);
  for (const c of contractChanges) console.log(`  ${c.key} | ${c.company} | ${c.from} -> ${c.to}`);

  if (!APPLY) {
    console.log('\n[migrate] DRY-RUN complete. Re-run with --apply to persist.');
    await mongoose.disconnect();
    return;
  }

  // Persist customer statuses.
  if (connected()) {
    for (const c of customerChanges) {
      await Customer.updateOne({ customerId: c.key }, { $set: { status: c.to } });
    }
    for (const c of contractChanges) {
      await Contract.updateOne({ contractId: c.key }, { $set: { status: c.to } });
    }
  }

  // Mirror into the JSON ledgers by key, preserving every other row/field.
  const custByKey = new Map(customerChanges.map((c) => [c.key, c.to]));
  if (custByKey.size) {
    const fileCusts = getCustomersFromFile().map((row) => {
      const next = custByKey.get(row.customerId);
      return next ? { ...row, status: next } : row;
    });
    saveCustomersToFile(fileCusts);
  }
  const ctrByKey = new Map(contractChanges.map((c) => [c.key, c.to]));
  if (ctrByKey.size) {
    const fileCtrs = getContractsFromFile().map((row) => {
      const next = ctrByKey.get(row.contractId);
      return next ? { ...row, status: next } : row;
    });
    saveContractsToFile(fileCtrs);
  }

  console.log(`\n[migrate] APPLIED: ${customerChanges.length} customer + ${contractChanges.length} contract repairs (mongo=${connected()}, file mirrors updated).`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('[migrate] fatal:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});