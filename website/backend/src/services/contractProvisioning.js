import mongoose from 'mongoose';
import Contract, { getContractsFromFile, saveContractsToFile } from '../models/Contract.js';
import Customer, { getCustomersFromFile, saveCustomersToFile } from '../models/Customer.js';
import Payment from '../models/Payment.js';
import Product from '../models/Product.js';
import { sangamCrmService } from './sangamCrmService.js';
import { logNotification } from './notificationService.js';
import { contractTypeCategory, normalizeContractType, periodFromDates } from '../utils/contractVocabulary.js';
import { refreshCustomerLifecycle } from './customerLifecycle.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * Calculate Indian Financial Year (e.g., '2026-27' for Nov 2026).
 * Financial year runs from April 1 (month 3, 0-indexed) to March 31.
 */
export const getFinancialYear = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth(); // 0 = Jan, 3 = Apr, 11 = Dec
  const startYear = month >= 3 ? year : year - 1;
  const endYearShort = String(startYear + 1).slice(-2);
  return `${startYear}-${endYearShort}`;
};

/**
 * Check if a contractId already exists in MongoDB or local fallback JSON file.
 */
export const isContractIdExists = async (contractId) => {
  if (!contractId || !String(contractId).trim()) return false;
  const targetId = String(contractId).trim().toLowerCase();
  const escaped = targetId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  if (isMongoConnected()) {
    const exists = await Contract.exists({
      $or: [
        { contractId: new RegExp(`^${escaped}$`, 'i') },
        { id: new RegExp(`^${escaped}$`, 'i') }
      ]
    });
    if (exists) return true;
  }

  const fileList = getContractsFromFile();
  return fileList.some((c) => {
    const cid = String(c.contractId || c.id || '').trim().toLowerCase();
    return cid === targetId;
  });
};

/**
 * Generates the next sequential Contract ID in the format:
 * NISPL/{financial_year}/00001 (auto-incrementing 5-digit number).
 * Guarantees uniqueness, prevents duplicate IDs, and handles financial year boundaries.
 */
export const nextContractCode = async (date = new Date()) => {
  const fy = getFinancialYear(date);
  const prefix = `NISPL/${fy}/`;
  const escapedFy = fy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^NISPL/${escapedFy}/(\\d+)`, 'i');

  let maxSeq = 0;

  if (isMongoConnected()) {
    const list = await Contract.find(
      { contractId: pattern },
      { contractId: 1 }
    ).lean();
    for (const c of list) {
      const match = String(c.contractId || '').match(pattern);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (Number.isFinite(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
  }

  const fileList = getContractsFromFile();
  for (const c of fileList) {
    const match = String(c.contractId || '').match(pattern);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (Number.isFinite(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  // Next sequential number starting at 1 (00001)
  let nextSeq = maxSeq + 1;
  let candidate = `${prefix}${String(nextSeq).padStart(5, '0')}`;

  // Double-check existence to ensure absolutely no collision
  while (await isContractIdExists(candidate)) {
    nextSeq += 1;
    candidate = `${prefix}${String(nextSeq).padStart(5, '0')}`;
  }

  return candidate;
};

const PRODUCT_CATEGORIES = ['Software', 'Service', 'Hardware', 'Trial'];

const isoDay = (value) => {
  const raw = String(value || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : '';
};

const todayIso = () => isoDay(new Date().toISOString());

const inr = (value) => `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`;

const addDays = (iso, days) => {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

// Adding a month to the 31st must not spill into the month after next.
const addMonths = (iso, months) => {
  const date = new Date(`${iso}T00:00:00Z`);
  const day = date.getUTCDate();
  date.setUTCMonth(date.getUTCMonth() + months);
  if (date.getUTCDate() < day) date.setUTCDate(0);
  return date.toISOString().slice(0, 10);
};

const WORD_MONTHS = { quarter: 3, quarterly: 3, halfyearly: 6, semiyearly: 6, annual: 12, annually: 12, yearly: 12 };

/**
 * The term a line was sold for. The order form sends explicit dates and a month
 * count; a catalogue card added straight to the cart only carries its billing
 * cycle, so that wording is read instead of assuming a year.
 */
const soldTerm = (line, product) => {
  const months = Math.max(Math.round(Number(line.durationMonths) || 0), 0);
  if (months > 0) return { months, days: 0 };

  const text = String(line.billingCycle || product?.duration || product?.frequency || '').toLowerCase();
  if (!text.trim()) return null;

  const counted = parseInt(text.match(/\d+/)?.[0] || '0', 10) || 1;
  if (text.includes('day')) return { months: 0, days: counted };
  if (text.includes('week')) return { months: 0, days: counted * 7 };
  if (text.includes('year') || text.includes('annual')) return { months: counted * 12, days: 0 };

  const word = Object.keys(WORD_MONTHS).find((key) => text.includes(key));
  if (word) return { months: counted * WORD_MONTHS[word], days: 0 };
  return text.includes('month') ? { months: counted, days: 0 } : null;
};

const termLabel = ({ months, days }) => {
  if (months > 0) {
    if (months % 12 === 0) return months === 12 ? '1 Year' : `${months / 12} Years`;
    return months === 1 ? '1 Month' : `${months} Months`;
  }
  return days === 1 ? '1 Day' : `${days} Days`;
};

const findCatalogueProduct = async (line) => {
  const keys = [line.productId, line.sku, line.name].map((value) => String(value || '').trim()).filter(Boolean);
  if (!keys.length || !isMongoConnected()) return null;
  return Product.findOne({ $or: keys.flatMap((key) => [{ productId: key }, { id: key }, { name: key }]) })
    .lean()
    .catch(() => null);
};

export const crmRecordId = (value) => {
  const raw = String(value || '').trim();
  return raw && !raw.startsWith('SGM-ACC-') ? raw : null;
};

const contractsForInvoice = async (invoiceNumber) => {
  if (isMongoConnected()) {
    return Contract.find({ paymentInvoiceNumber: invoiceNumber }).sort({ contractId: 1 }).lean();
  }
  return getContractsFromFile()
    .filter((row) => row.paymentInvoiceNumber === invoiceNumber)
    .sort((a, b) => String(a.contractId).localeCompare(String(b.contractId)));
};

const writeContract = async (record) => {
  let saved = record;
  if (isMongoConnected()) {
    const doc = await Contract.create(record);
    saved = doc.toObject();
  }

  const fileRow = { ...record, id: record.contractId, createdAt: new Date().toISOString() };
  saveContractsToFile([fileRow, ...getContractsFromFile()]);
  return saved;
};

const stampSync = async (contract, sangamCrm) => {
  if (isMongoConnected() && contract._id) {
    await Contract.updateOne({ _id: contract._id }, { $set: { sangamCrm } });
  }

  const rows = getContractsFromFile();
  const index = rows.findIndex((row) => row.contractId === contract.contractId);
  if (index !== -1) {
    rows[index] = { ...rows[index], sangamCrm };
    saveContractsToFile(rows);
  }

  // A mongoose doc must stay a doc: callers serialize it straight into the
  // response, and spreading it would leak its internal state instead.
  if (typeof contract.toObject === 'function') {
    contract.sangamCrm = sangamCrm;
    return contract;
  }

  return { ...contract, sangamCrm };
};

/**
 * Pushes one contract row to Sangam and stamps the outcome on both stores.
 * Every writer of a contract uses this so a row raised outside the admin
 * console cannot sit unsynced forever. Never throws: the local record is
 * already saved and a CRM outage must not undo it.
 */
export const syncContractToCrm = async (contract) => {
  try {
    const result = await sangamCrmService.createOrUpdateContract(contract);
    return stampSync(contract, {
      status: result.success ? 'synced' : result.disabled ? 'pending' : 'failed',
      recordId: result.recordId || null,
      lastSyncedAt: result.success ? new Date() : null,
      syncError: result.success
        ? null
        : result.disabled
        ? 'Sangam CRM synchronization disabled in configuration.'
        : result.message
    });
  } catch (err) {
    console.warn('[SangamCRM] contract sync failed:', err.message);
    return contract;
  }
};

const linkPayment = async (payment, contracts) => {
  const ids = contracts.map((contract) => contract.contractId).filter(Boolean);
  if (!ids.length) return;

  // The receipt reads these off the object it was handed, while the ledger has
  // to hold them for every later read of the same invoice.
  payment.contractId = payment.contractId || ids[0];
  payment.contractIds = ids;

  if (isMongoConnected() && payment._id) {
    await Payment.updateOne(
      { _id: payment._id },
      { $set: { contractId: payment.contractId, contractIds: ids } }
    );
  }
};

const summarize = (contract) => ({
  contractId: contract.contractId,
  name: contract.name,
  company: contract.company,
  status: contract.status,
  startDate: contract.startDate,
  endDate: contract.endDate,
  totalContractValue: contract.totalContractValue
});

/**
 * A paid purchase is a subscription the business now owes the customer, so the
 * contract register gets a row per product bought without an admin retyping it.
 * Everything on the row comes from the settled receipt: the term, the value and
 * the product the customer actually chose. Never throws — the money is already
 * with the merchant, so a provisioning problem must not fail the checkout or
 * make a gateway retry write a second payment.
 */
export const provisionContractsForPayment = async ({ payment, user, customer, lines = [] }) => {
  const invoiceNumber = String(payment?.invoiceNumber || '').trim();
  if (!invoiceNumber || !Array.isArray(lines) || lines.length === 0) return [];

  try {
    // A retry of the same settled invoice reuses the rows it already raised.
    const existing = await contractsForInvoice(invoiceNumber);
    if (existing.length) {
      await linkPayment(payment, existing);
      return existing.map(summarize);
    }

    const company = String(customer?.company || user?.company || payment.company || '').trim();
    const person = String(customer?.name || user?.name || payment.customer || company).trim();
    const email = String(user?.email || customer?.email || payment.email || '').trim();
    const accountId = crmRecordId(customer?.sangamCrm?.recordId);
    const paidOn = isoDay(payment.paymentReceivedDate) || isoDay(payment.invoiceDate) || todayIso();
    const raisedBy = { name: person, email, role: String(user?.role || 'customer') };

    const created = [];

    for (const line of lines) {
      try {
        const product = await findCatalogueProduct(line);
        const term = soldTerm(line, product);
        const startDate = isoDay(line.startDate) || paidOn;
        const endDate =
          isoDay(line.endDate) ||
          (term ? addDays(addMonths(startDate, term.months), term.days) : '');

        if (!endDate || endDate <= startDate) {
          console.warn(
            `[ContractProvisioning] ${invoiceNumber}: "${line.name}" has no readable term, so no contract was raised.`
          );
          continue;
        }

        const contractType = normalizeContractType(product?.serverType) || 'Subscription';
        const subscriptionPeriod = periodFromDates(startDate, endDate) || (term ? termLabel(term) : '');
        const value = inr(line.finalPrice);
        const contractCode = await nextContractCode();

        const isOnlineCustomerPurchase = Boolean(user && (user.role === 'customer' || !user.role || user.role === 'user'));

        const record = {
          contractId: contractCode,
          name: String(line.name || '').trim() || subscriptionPeriod,
          company,
          customer: person || company,
          customerId: String(customer?.customerId || user?.customerId || payment?.customerId || '').trim(),
          accountId,
          email,
          service: `${contractType} (${subscriptionPeriod})`,
          contractType,
          subscriptionPeriod,
          productCategory: PRODUCT_CATEGORIES.includes(line.category)
            ? line.category
            : contractTypeCategory(contractType),
          totalContractValue: value,
          value: `${value} / ${subscriptionPeriod.toLowerCase()}`,
          orderDate: paidOn,
          startDate,
          endDate,
          expiryDate: endDate,
          status: isOnlineCustomerPurchase ? 'Inactive' : (startDate > paidOn ? 'Not Started' : 'Active'),
          paymentStatus: isOnlineCustomerPurchase ? 'No' : 'Yes',
          confirmationStatus: isOnlineCustomerPurchase ? 'Pending' : 'Confirmed',
          adminConfirmed: !isOnlineCustomerPurchase,
          // No support cover was sold with the plan, so none is claimed here.
          slaTier: '',
          description: [
            String(line.description || '').trim(),
            `Purchased online against invoice ${invoiceNumber} (${payment.paymentId || 'payment recorded'}).`
          ]
            .filter(Boolean)
            .join(' '),
          productId: String(line.productId || line.sku || '').trim(),
          salesPerson: String(payment.salesPerson || '').trim(),
          paymentInvoiceNumber: invoiceNumber,
          createdBy: raisedBy,
          sangamCrm: { status: 'pending', recordId: null, lastSyncedAt: null, syncError: null }
        };

        const saved = await syncContractToCrm(await writeContract(record));
        created.push(saved);

        if (isOnlineCustomerPurchase) {
          await logNotification({
            type: 'payment_confirmation_required',
            title: 'Payment Confirmation Required',
            message: `Customer "${company || person}" has paid ${value} for "${record.name}" (${invoiceNumber}). Services pending activation until confirmation is set to Yes.`,
            severity: 'warning',
            entityType: 'contract',
            entityId: contractCode,
            user: { name: person, email, role: raisedBy.role, company },
            metadata: {
              contractId: contractCode,
              invoiceNumber,
              paymentId: payment.paymentId || '',
              amount: value,
              customerName: person,
              company,
              customerId: record.customerId,
              planName: record.name,
              confirmationStatus: 'Pending',
              actionRequired: true
            }
          });
        } else {
          await logNotification({
            type: 'contract_created',
            title: 'Contract Created',
            message: `Contract "${record.name}" (${company || person}) was raised automatically from payment ${invoiceNumber}.`,
            severity: 'success',
            entityType: 'contract',
            entityId: contractCode,
            user: { name: person, email, role: raisedBy.role, company },
            metadata: {
              contractId: contractCode,
              invoiceNumber,
              paymentId: payment.paymentId || '',
              source: 'customer_portal',
              value,
              expiryDate: endDate
            }
          });
        }
      } catch (lineErr) {
        console.error(
          `[ContractProvisioning] ${invoiceNumber}: could not raise a contract for "${line.name}":`,
          lineErr.message
        );
      }
    }

    const isOnlineCustomerPurchase = Boolean(user && (user.role === 'customer' || !user.role || user.role === 'user'));

    if (isOnlineCustomerPurchase) {
      // Customer paid online: flag customer for pending confirmation until admin sets to Yes
      try {
        const custId = customer?.customerId || user?.customerId;
        const custQuery = custId ? { $or: [{ customerId: custId }, { email }] } : { email };
        if (isMongoConnected()) {
          await Customer.updateMany(custQuery, { $set: { pendingPaymentConfirmation: true } });
        } else {
          const custs = getCustomersFromFile().map((c) =>
            (c.customerId === custId || c.email === email)
              ? { ...c, pendingPaymentConfirmation: true }
              : c
          );
          saveCustomersToFile(custs);
        }
      } catch (custErr) {
        console.warn('[ContractProvisioning] Customer pending flag update note:', custErr.message);
      }
    } else {
      // For staff/admin direct creation, activate immediately
      if (created.length > 0) {
        try {
          await activateAccountAfterPayment({
            email,
            company,
            person,
            accountId,
            customerId: customer?.customerId,
            planName: created[0]?.name || lines[0]?.name || 'Active Cloud Subscription',
            contractId: created[0]?.contractId || ''
          });
        } catch (autoConvertErr) {
          console.warn('[ContractProvisioning] Auto-converting demo status warning:', autoConvertErr.message);
        }
      }
    }

    await linkPayment(payment, created);
    return created.map(summarize);
  } catch (err) {
    console.error(`[ContractProvisioning] could not process invoice ${invoiceNumber}:`, err.message);
    return [];
  }
};

/**
 * A demo becomes a paid account only when money has actually been received —
 * a settled checkout, an admin-recorded payment or a cleared offline instrument.
 * Registration, trial activation and overview reads must never call this.
 */
export const activateAccountAfterPayment = async ({
  email = '',
  company = '',
  person = '',
  accountId = '',
  customerId = '',
  planName = '',
  contractId = ''
} = {}) => {
  const custOrConditions = [];
  if (email) custOrConditions.push({ email: new RegExp(`^${String(email).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
  if (customerId) custOrConditions.push({ customerId });
  if (accountId) custOrConditions.push({ accountId });
  if (company) custOrConditions.push({ company });
  if (custOrConditions.length === 0) return { activated: false, converted: 0 };

  const customerSet = planName ? { plan: planName, status: 'Active' } : { status: 'Active' };

  const demoOrConditions = [];
  if (email) demoOrConditions.push({ email: new RegExp(`^${String(email).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
  if (company) demoOrConditions.push({ company });
  if (person) demoOrConditions.push({ customer: person });
  if (accountId) demoOrConditions.push({ accountId });
  if (customerId) demoOrConditions.push({ customerId });

  const demoMarker = {
    $or: [
      { isDemoTrial: true },
      { contractType: 'Trial' },
      { productCategory: 'Trial' },
      { status: 'DEMO' },
      { status: 'demo' },
      { status: 'DEMO-Inactive' },
      { status: 'DEMO-INACTIVE' }
    ]
  };
  const conversionSet = {
    status: 'Inactive',
    convertedToPaid: true,
    isDemoTrial: false,
    convertedAt: new Date().toISOString(),
    convertedToContractId: contractId
  };

  let converted = 0;
  if (isMongoConnected()) {
    if (customerSet) await Customer.updateMany({ $or: custOrConditions }, { $set: customerSet });
    if (demoOrConditions.length > 0) {
      const result = await Contract.updateMany(
        {
          $and: [
            { $or: demoOrConditions },
            demoMarker,
            { status: { $nin: ['Closed', 'Converted', 'closed', 'converted'] } }
          ]
        },
        { $set: conversionSet }
      );
      converted = result.modifiedCount ?? result.nModified ?? 0;
    }
  }

  // File-based update for fallback
  try {
    const matchesCustomer = (c) =>
      (email && String(c.email || '').toLowerCase() === String(email).toLowerCase()) ||
      (company && String(c.company || '').toLowerCase() === String(company).toLowerCase()) ||
      (customerId && c.customerId === customerId);
    const updatedCusts = getCustomersFromFile().map((c) =>
      matchesCustomer(c) && customerSet ? { ...c, ...customerSet } : c
    );
    saveCustomersToFile(updatedCusts);

    const updatedCtrs = getContractsFromFile().map((c) => {
      const matches =
        (email && String(c.email || '').toLowerCase() === String(email).toLowerCase()) ||
        (company && String(c.company || '').toLowerCase() === String(company).toLowerCase()) ||
        (customerId && c.customerId === customerId);
      const isDemo =
        Boolean(c.isDemoTrial) ||
        c.contractType === 'Trial' ||
        c.productCategory === 'Trial' ||
        String(c.status).toUpperCase() === 'DEMO';
      if (matches && isDemo && c.status !== 'Converted' && c.status !== 'Closed') {
        converted += 1;
        return { ...c, ...conversionSet };
      }
      return c;
    });
    saveContractsToFile(updatedCtrs);
  } catch (fileErr) {
    console.warn('[ContractProvisioning] File fallback update note:', fileErr.message);
  }

  // InProgress while the service is unprovisioned, Active once a live paid
  // contract exists — the lifecycle service reads both registers to decide.
  await refreshCustomerLifecycle({ email, company, customerId, accountId });

  if (converted > 0) {
    await logNotification({
      type: 'demo_converted_to_active',
      title: 'Account Upgraded to Active Subscription',
      message: `${company || person || email} has paid for a subscription (${planName || 'Active Product'}). Demo trials converted.`,
      severity: 'success',
      entityType: 'customer',
      entityId: customerId || email,
      metadata: { email, plan: planName, contractId }
    });
  }

  return { activated: true, converted };
};