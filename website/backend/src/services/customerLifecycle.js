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
  demoinactive: 'Inactive',
  'demo-inactive': 'Inactive',
  inprogress: 'Active',
  'in progress': 'Active',
  active: 'Active'
};

/** Legacy lowercase rows and the canonical words read as the same bucket. */
export const normalizeLifecycle = (value) => LOOKUP[squash(value)] || 'Inactive';

const rupees = (value) => {
  const digits = String(value ?? '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return digits ? Number(digits[0]) : 0;
};

export const matchesCustomer = (customer, record) => {
  if (!customer || !record) return false;

  const custCompany = String(customer.company || '').trim().toLowerCase();
  const recCompany = String(record.company || record.accountName || '').trim().toLowerCase();
  // If both have explicit, non-empty, different company names, they are not the same entity
  if (custCompany && recCompany && custCompany !== recCompany) {
    return false;
  }

  // 1. Email match (exact case-insensitive)
  const custEmail = String(customer.email || customer.loginEmail || '').trim().toLowerCase();
  const recEmail = String(record.email || record.customerEmail || '').trim().toLowerCase();
  if (custEmail && recEmail && custEmail === recEmail) return true;

  // 2. Customer ID match (exact case-insensitive)
  const custId = String(customer.customerId || customer.id || customer._id || '').trim().toLowerCase();
  const recCustId = String(record.customerId || '').trim().toLowerCase();
  if (custId && recCustId && custId === recCustId) return true;

  // 3. CRM account ID match (exact)
  const custCrmId = String(customer.sangamCrm?.recordId || customer.accountId || '').trim();
  const recCrmId = String(record.accountId || record.sangamCrm?.recordId || '').trim();
  if (custCrmId && recCrmId && custCrmId === recCrmId) return true;

  // 4. Company match (exact case-insensitive, must not be empty or generic)
  if (custCompany && recCompany && custCompany === recCompany) return true;

  // 5. Name match: exact match only, never substring, and ignore generic words
  const custName = String(customer.name || '').trim().toLowerCase();
  const recCustomer = String(record.customer || record.name || '').trim().toLowerCase();
  if (
    custName &&
    recCustomer &&
    custName === recCustomer &&
    !['demo', 'test', 'admin', 'user', 'customer', 'trial'].includes(custName)
  ) {
    return true;
  }

  return false;
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
  // An explicit suspended or paused status on customer profile always wins
  if (['suspended', 'paused'].includes(stored)) return 'Inactive';

  const today = new Date().toISOString().split('T')[0];
  const own = (contracts || []).filter((ctr) => matchesCustomer(customer, ctr));
  const paid = own.filter((ctr) => !isDemoContract(ctr));
  const settled = (payments || []).some((p) => isSettledPayment(p) && matchesCustomer(customer, p));

  // Helper to check if a paid contract is actively running (not Inactive, Closed, DISABLED, Not Started, or Draft)
  // Note: If status is 'In Progress' or 'Active', it is considered Active.
  const isContractLive = (ctr) => {
    if (isDemoContract(ctr)) return false;
    const s = normalizeContractStatus(ctr.status);
    if (['Inactive', 'Closed', 'DISABLED', 'Not Started', 'Draft'].includes(s)) return false;
    const end = String(ctr.endDate || ctr.expiryDate || '').trim();
    return !end || end >= today;
  };

  const hasLivePaidContract = paid.some(isContractLive);

  // An explicit paid contract is one that is live/active AND marked paid
  const hasExplicitPaidContract = paid.some((ctr) =>
    isContractLive(ctr) &&
    ['yes', 'true', '1', 'paid', 'y', 'active'].includes(String(ctr.paymentStatus || '').trim().toLowerCase())
  );

  // A live in-progress or active contract is considered Active
  const hasLiveInProgressContract = paid.some((ctr) =>
    isContractLive(ctr) &&
    ['In Progress', 'Active', 'active', 'in progress', 'inprogress'].includes(normalizeContractStatus(ctr.status) || ctr.status)
  );

  // 1. If customer has a live, active paid contract -> Active
  if (hasExplicitPaidContract || (settled && hasLivePaidContract) || hasLiveInProgressContract) {
    return 'Active';
  }

  // 2. If customer has paid contracts but ALL of them are Inactive, Closed, or DISABLED by admin -> Inactive
  const hasOnlyInactiveContracts = paid.length > 0 && paid.every((ctr) => {
    const s = normalizeContractStatus(ctr.status);
    return ['Inactive', 'Closed', 'DISABLED'].includes(s);
  });
  if (hasOnlyInactiveContracts) {
    return 'Inactive';
  }

  // 3. If customer has taken a demo pack and it is live/unexpired and no active plans purchased -> Demo
  const hasLiveDemo = own.some(
    (ctr) =>
      isDemoContract(ctr) &&
      !ctr.convertedToPaid &&
      !['Closed', 'Converted', 'DEMO-Inactive'].includes(normalizeContractStatus(ctr.status, ctr)) &&
      (!ctr.endDate || String(ctr.endDate).split('T')[0] >= today)
  );
  if (hasLiveDemo && paid.length === 0 && !settled) {
    return 'Demo';
  }

  // 4. If demo trial expired / ended without purchasing active plans -> Inactive
  // 5. If customer logged in for first time without demo/active plans -> Inactive
  // 6. If customer has not purchased any active product -> Inactive
  if (stored === 'active' && paid.length > 0) {
    return 'Active';
  }

  return 'Inactive';
};

const customerQuery = ({ customerId, email, company, customer, accountId, _id }) => {
  const or = [];
  if (_id) or.push({ _id });
  if (customerId) or.push({ customerId });
  if (email) or.push({ email: new RegExp(`^${String(email).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
  if (accountId) or.push({ 'sangamCrm.recordId': accountId });
  if (company) or.push({ company: new RegExp(`^${String(company).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
  if (customer) or.push({ name: new RegExp(`^${String(customer).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
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
  const customers = isMongoConnected()
    ? await Customer.find(query).lean()
    : getCustomersFromFile().filter(
        (c) =>
          matchesCustomer(identity, c) ||
          (identity.customerId && c.customerId === identity.customerId) ||
          (identity.email && String(c.email || '').toLowerCase() === String(identity.email).toLowerCase()) ||
          (identity.company && String(c.company || '').toLowerCase() === String(identity.company).toLowerCase()) ||
          (identity.customer && String(c.name || '').toLowerCase() === String(identity.customer).toLowerCase())
      );

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