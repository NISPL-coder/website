import mongoose from 'mongoose';
import Customer, { getCustomersFromFile, saveCustomersToFile } from '../models/Customer.js';
import Contract, { getContractsFromFile } from '../models/Contract.js';
import Payment, { getPaymentsFromFile } from '../models/Payment.js';
import { normalizeContractStatus } from '../utils/contractVocabulary.js';

/**
 * The one authoritative account lifecycle. Every writer stores these words and
 * every reader normalizes to them; the bucket a customer lands in is derived
 * from the contract register and the payment ledger, never from login alone.
 *
 * Inactive  — registered, nothing taken yet
 * Demo      — a trial is running, nothing paid
 * InProgress— money settled, service not provisioned/started yet
 * Active    — a paid subscription is live
 */
export const CUSTOMER_LIFECYCLE = ['Inactive', 'Demo', 'DemoInactive', 'InProgress', 'Active'];

const isMongoConnected = () => mongoose.connection.readyState === 1;

const squash = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, '');

const LOOKUP = {
  inactive: 'Inactive',
  suspended: 'Inactive',
  paused: 'Inactive',
  demo: 'Demo',
  trial: 'Demo',
  demoinactive: 'DemoInactive',
  'demo-inactive': 'DemoInactive',
  inprogress: 'InProgress',
  active: 'Active'
};

/** Legacy lowercase rows and the canonical words read as the same bucket. */
export const normalizeLifecycle = (value) => LOOKUP[squash(value)] || 'Inactive';

const rupees = (value) => {
  const digits = String(value ?? '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return digits ? Number(digits[0]) : 0;
};

const identityValues = (row) =>
  [row?.email, row?.customerId, row?.company, row?.customer, row?.accountName, row?.name]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase().trim());

export const matchesCustomer = (customer, record) => {
  const custIds = identityValues(customer);
  const recIds = identityValues(record);
  return custIds.some((cid) => recIds.some((rid) => rid === cid || rid.includes(cid) || cid.includes(rid)));
};

const isDemoContract = (ctr) =>
  Boolean(
    ctr.isDemoTrial ||
    ctr.contractType === 'Trial' ||
    ctr.productCategory === 'Trial' ||
    normalizeContractStatus(ctr.status) === 'DEMO'
  );

const isSettledPayment = (p) =>
  ['received', 'cleared'].includes(String(p.status || '').toLowerCase()) &&
  rupees(p.receivedAmount || p.amount) > 0;

const isLivePaid = (ctr, today) => {
  if (isDemoContract(ctr)) return false;
  if (normalizeContractStatus(ctr.status) !== 'In Progress') return false;
  const end = String(ctr.endDate || ctr.expiryDate || '').trim();
  return !end || end >= today;
};

/**
 * Derive the bucket from what the account actually holds. Priority: a live paid
 * subscription wins over everything; settled money without a live service is
 * InProgress; an unconverted trial is Demo; anything else is Inactive. An admin
 * suspension always reads Inactive.
 */
export const deriveCustomerLifecycle = (customer, contracts = [], payments = []) => {
  const stored = squash(customer?.status);
  if (['suspended', 'paused'].includes(stored)) return 'Inactive';

  const today = new Date().toISOString().split('T')[0];
  const own = (contracts || []).filter((ctr) => matchesCustomer(customer, ctr));
  const paid = own.filter((ctr) => !isDemoContract(ctr));

  if (paid.some((ctr) => isLivePaid(ctr, today))) return 'Active';

  const settled = (payments || []).some((p) => isSettledPayment(p) && matchesCustomer(customer, p));
  const awaitingStart = paid.some((ctr) => normalizeContractStatus(ctr.status) === 'Not Started');
  const churned = paid.length > 0 && paid.every((ctr) => normalizeContractStatus(ctr.status) === 'Closed');
  if ((settled && !churned) || awaitingStart) return 'InProgress';

  const hasLiveDemo = own.some(
    (ctr) =>
      isDemoContract(ctr) &&
      !ctr.convertedToPaid &&
      !['Closed', 'Converted', 'DEMO-Inactive'].includes(normalizeContractStatus(ctr.status, ctr)) &&
      (!ctr.endDate || String(ctr.endDate).split('T')[0] >= today)
  );
  if (hasLiveDemo) return 'Demo';

  const hasExpiredOrConvertedDemo = own.some(
    (ctr) =>
      isDemoContract(ctr) &&
      (ctr.convertedToPaid ||
       ['Converted', 'DEMO-Inactive'].includes(normalizeContractStatus(ctr.status, ctr)) ||
       (ctr.endDate && String(ctr.endDate).split('T')[0] < today))
  );

  if (hasExpiredOrConvertedDemo || Boolean(customer?.demoTrialUsed) || ['demoinactive', 'demo-inactive'].includes(stored)) {
    return 'DemoInactive';
  }

  return 'Inactive';
};

const customerQuery = ({ customerId, email, company, accountId, _id }) => {
  const or = [];
  if (_id) or.push({ _id });
  if (customerId) or.push({ customerId });
  if (email) or.push({ email: new RegExp(`^${String(email).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
  if (accountId) or.push({ 'sangamCrm.recordId': accountId });
  if (company) or.push({ company });
  return or.length ? { $or: or } : null;
};

/**
 * Recompute and persist the lifecycle for the accounts behind an identity.
 * Called only by write events (registration, demo activation, settled payment,
 * contract provisioning); readers derive without writing.
 */
export const refreshCustomerLifecycle = async (identity = {}) => {
  const query = customerQuery(identity);
  if (!query) return [];

  const contracts = isMongoConnected() ? await Contract.find().lean() : getContractsFromFile();
  const payments = isMongoConnected() ? await Payment.find().lean() : getPaymentsFromFile();
  const customers = isMongoConnected() ? await Customer.find(query).lean() : getCustomersFromFile().filter((c) => matchesCustomer(identity, c) || (identity.customerId && c.customerId === identity.customerId) || (identity.email && String(c.email || '').toLowerCase() === String(identity.email).toLowerCase()) || (identity.company && String(c.company || '').toLowerCase() === String(identity.company).toLowerCase()));

  const changed = [];
  for (const customer of customers) {
    const next = deriveCustomerLifecycle(customer, contracts, payments);
    if (normalizeLifecycle(customer.status) === next && CUSTOMER_LIFECYCLE.includes(customer.status)) continue;
    if (isMongoConnected()) {
      await Customer.updateOne({ _id: customer._id }, { $set: { status: next } });
    }
    changed.push({ ...customer, status: next });
  }

  if (changed.length > 0) {
    try {
      const byId = new Map(changed.map((c) => [c.customerId || String(c._id), c.status]));
      const updated = getCustomersFromFile().map((c) => {
        const next = byId.get(c.customerId || String(c._id));
        return next ? { ...c, status: next } : c;
      });
      saveCustomersToFile(updated);
    } catch (err) {
      console.warn('[CustomerLifecycle] File mirror note:', err.message);
    }
  }

  return changed;
};