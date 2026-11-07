import mongoose from 'mongoose';
import Contract, { getContractsFromFile, saveContractsToFile } from '../models/Contract.js';
import Payment from '../models/Payment.js';
import Product from '../models/Product.js';
import { sangamCrmService } from './sangamCrmService.js';
import { logNotification } from './notificationService.js';
import { contractTypeCategory, normalizeContractType, periodFromDates } from '../utils/contractVocabulary.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * The next CTR code. Random four-digit codes collide, and a duplicate
 * contractId would make every downstream lookup — payments and receipts
 * included — resolve to the wrong subscription.
 */
export const nextContractCode = async () => {
  const prefix = `CTR-${new Date().getFullYear()}-`;
  const pattern = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);

  let latest = null;
  if (isMongoConnected()) {
    latest = await Contract.findOne({ contractId: pattern }).sort({ contractId: -1 }).lean();
  } else {
    latest = getContractsFromFile()
      .filter((c) => String(c.contractId || '').startsWith(prefix))
      .sort((a, b) => String(b.contractId).localeCompare(String(a.contractId)))[0] || null;
  }

  const tail = parseInt(String(latest?.contractId || '').split('-').pop(), 10);
  return `${prefix}${Number.isFinite(tail) ? tail + 1 : 1000}`;
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

        const record = {
          contractId: contractCode,
          name: String(line.name || '').trim() || subscriptionPeriod,
          company,
          customer: person || company,
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
          status: startDate > paidOn ? 'Not Started' : 'In Progress',
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
      } catch (lineErr) {
        console.error(
          `[ContractProvisioning] ${invoiceNumber}: could not raise a contract for "${line.name}":`,
          lineErr.message
        );
      }
    }

    await linkPayment(payment, created);
    return created.map(summarize);
  } catch (err) {
    console.error(`[ContractProvisioning] could not process invoice ${invoiceNumber}:`, err.message);
    return [];
  }
};