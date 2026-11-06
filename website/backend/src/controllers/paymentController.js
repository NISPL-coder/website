import Payment, {
  getPaymentsFromFile,
  savePaymentsToFile,
  savePaymentProof,
  getPaymentProof
} from '../models/Payment.js';
import Customer from '../models/Customer.js';
import Contract from '../models/Contract.js';
import mongoose from 'mongoose';
import { logActivity } from '../utils/activityLogger.js';
import { logNotification } from '../services/notificationService.js';
import { redactRecords } from '../utils/columnPermissions.js';
import { parseAmount, findCatalogueRow, resolveDisplayName } from './portalController.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

const GST_RATE = 0.18;

const norm = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const inrText = (value) => `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`;

const isoDay = (...dates) => {
  for (const value of dates) {
    if (!value) continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }
  return '';
};

// An email is a legal identifier and a product name is prose, so each record is
// filed under both its exact text and its slug. Every side of a join is keyed
// the same way, which is what lets "tally on clouds" and "Tally On Clouds"
// resolve to one product.
const identityKeys = (value) => {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return [];
  const slug = norm(raw);
  return slug === raw ? [raw] : [raw, slug];
};

const addLink = (map, values, record) => {
  values.forEach((value) => {
    identityKeys(value).forEach((key) => {
      if (!map.has(key)) map.set(key, record);
    });
  });
};

const findLink = (map, values) => {
  for (const value of values) {
    for (const key of identityKeys(value)) {
      const hit = map.get(key);
      if (hit) return hit;
    }
  }
  return null;
};

/* ── Receipt assembly ─────────────────────────────────────────────────────
   The admin receipt list is the payment ledger seen whole: the money as it
   was booked, plus the account it came from, the subscription it settled and
   the product that was sold. Links are resolved once per request from the
   same collections the rest of the console reads, so a receipt shows recorded
   values and nothing invented.
───────────────────────────────────────────────────────────────────────── */
const gstSplit = (row, total) => {
  const recordedBase = parseAmount(row.taxableAmount);
  const recordedGst = parseAmount(row.gstAmount);

  if (recordedBase && recordedGst) {
    return {
      baseAmount: recordedBase,
      taxAmount: recordedGst,
      gstBasis: row.gstBasis || 'Recorded when this payment was taken'
    };
  }

  if (recordedBase) return { baseAmount: recordedBase, taxAmount: Math.max(total - recordedBase, 0), gstBasis: row.gstBasis || 'Taxable value recorded; GST is the balance' };
  if (recordedGst) return { baseAmount: Math.max(total - recordedGst, 0), taxAmount: recordedGst, gstBasis: row.gstBasis || 'GST recorded; taxable value is the balance' };

  // Legacy rows carry only the gross figure. Showing a split means deriving it,
  // so the basis says exactly that instead of letting it read as a quote.
  const base = total > 0 ? Math.round(total / (1 + GST_RATE)) : 0;
  return {
    baseAmount: base,
    taxAmount: Math.max(total - base, 0),
    gstBasis: row.gstBasis || `Not recorded on this payment — modelled at ${GST_RATE * 100}% of the gross for display`
  };
};

const loadReceiptContext = async (rows) => {
  const context = {
    contracts: [],
    linkable: [],
    contractById: new Map(),
    customerByKey: new Map(),
    catalogue: new Map()
  };

  if (!isMongoConnected()) return context;

  const [customers, contracts] = await Promise.all([
    Customer.find({}).lean().catch(() => []),
    Contract.find({}).lean().catch(() => [])
  ]);

  context.contracts = contracts;
  context.linkable = buildContractLinkIndex(contracts);
  customers.forEach((c) => addLink(context.customerByKey, [c.email, c.loginEmail, c.customerId, c.company, c.name], c));
  contracts.forEach((c) => addLink(context.contractById, [c.contractId, c.id], c));

  // The ledger names a product as free text and a contract names it another
  // way, so every wording gathered from both sides is resolved against the
  // catalogue once per request rather than once per row.
  const termKeys = new Set();
  const collectTerms = (values) =>
    values.forEach((v) => {
      const key = norm(v);
      if (key) termKeys.add(key);
    });

  rows.forEach((row) =>
    [row.solutionCategory, row.productName, row.service, row.contractId].forEach((value) =>
      collectTerms(labelVariants(value))
    )
  );
  contracts.forEach((c) => collectTerms([c.productId, c.name, c.service, c.productCategory]));

  for (const key of termKeys) {
    const product = await findCatalogueRow(key);
    if (product) context.catalogue.set(key, product);
  }

  return context;
};

const matchCustomer = (row, context) =>
  findLink(context.customerByKey, [row.email, row.customerId, row.company, row.customer, row.accountName]);

// Words that appear in nearly every plan name carry no identifying weight, so
// they are dropped before two product descriptions are compared.
const WORD_STOP = new Set([
  'on', 'and', 'for', 'the', 'of', 'in', 'with', 'to', 'a', 'an', 'at', 'by',
  'service', 'services', 'plan', 'plans', 'package', 'packages', 'solution', 'solutions'
]);

const words = (value) =>
  String(value || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word && !WORD_STOP.has(word) && !/^\d+$/.test(word))
    .map((word) => (word.length > 3 && word.endsWith('s') ? word.slice(0, -1) : word));

const dayValue = (iso) => (iso ? Date.parse(`${iso}T00:00:00Z`) : NaN);

// Every signal a payment can be matched on is read off the contract once per
// request instead of once per payment row.
const buildContractLinkIndex = (contracts) =>
  contracts.map((contract) => ({
    contract,
    email: norm(contract.email),
    company: norm(contract.company),
    customer: norm(contract.customer),
    words: [contract.name, contract.service, contract.productId, contract.productCategory].flatMap(words),
    startDay: dayValue(isoDay(contract.startDate)),
    endDay: dayValue(isoDay(contract.expiryDate, contract.endDate)),
    value: parseAmount(contract.totalContractValue || contract.value)
  }));

/**
 * A payment names its account and its product in prose and stores no contract
 * code, so the subscription it settled is scored rather than guessed on one
 * field. The account always has to match; the product wording, the payment date
 * falling inside the contract term, the contract value and being the account's
 * only contract each add confidence. Below the threshold the receipt says the
 * payment is unlinked instead of attaching a plausible-looking contract.
 */
const linkContract = (row, context) => {
  if (row.contractId) {
    const exact = findLink(context.contractById, [row.contractId]);
    if (exact) return { contract: exact, basis: 'Contract code recorded on this payment' };
  }

  const rowEmail = norm(row.email);
  const rowCompany = norm(row.company || row.accountName);
  const rowCustomer = norm(row.customer);
  const rowWords = [row.solutionCategory, row.productName, row.service].flatMap(words);
  const invoice = dayValue(isoDay(row.invoiceDate, row.date, row.createdAt));
  const amount = parseAmount(row.amount);
  const candidates = [];

  for (const entry of context.linkable) {
    const signals = [];
    if (rowEmail && entry.email === rowEmail) signals.push('email');
    if (rowCompany && entry.company === rowCompany) signals.push('firm');
    if (rowCustomer && (entry.customer === rowCustomer || entry.company === rowCustomer)) {
      signals.push('client');
    }
    if (!signals.length) continue;

    let score = 3;

    const termOverlap = rowWords.filter((word) => entry.words.includes(word)).length;
    if (termOverlap) {
      score += Math.min(termOverlap, 3);
      signals.push('product');
    }

    if (
      Number.isFinite(invoice) &&
      Number.isFinite(entry.startDay) &&
      Number.isFinite(entry.endDay) &&
      invoice >= entry.startDay &&
      invoice <= entry.endDay
    ) {
      score += 2;
      signals.push('term dates');
    }

    if (amount && entry.value && Math.abs(amount - entry.value) <= 1) {
      score += 2;
      signals.push('contract value');
    }

    candidates.push({ contract: entry.contract, score, signals });
  }

  if (candidates.length === 1) {
    candidates[0].score += 2;
    candidates[0].signals.push('sole contract for this account');
  }

  const best = candidates.reduce((top, item) => (!top || item.score > top.score ? item : top), null);
  if (!best || best.score < 5) return { contract: null, basis: '' };

  return { contract: best.contract, basis: `Matched on ${best.signals.join(', ')}` };
};

/**
 * The ledger writes a charge as prose — "Cloud Services - 2 User (3 Core/3 GB/50 GB SSD)
 * (1 Month)" — while the catalogue stores the plan itself, so a label is
 * retried without its duration suffix and without the plan segment before it
 * is called unmatched.
 */
const labelVariants = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return [];
  const withoutDuration = raw.replace(/\s*\([^)]*\)\s*$/, '').trim();
  const head = raw.split(/\s+-\s+/)[0].trim();
  return [...new Set([raw, withoutDuration, head].filter(Boolean))];
};

const lookupProduct = (label, context) => {
  for (const variant of labelVariants(label)) {
    const hit = context.catalogue.get(norm(variant));
    if (hit) return hit;
  }
  return null;
};

// Specs copied onto the payment line at settlement win; whatever the line does
// not carry is filled from the catalogue row the label resolves to.
const fillProduct = (recorded, found) => {
  const merged = fromProduct(found);
  Object.entries(fromProduct(recorded)).forEach(([key, value]) => {
    if (value !== '' && value !== 0) merged[key] = value;
  });
  return merged;
};

const fromProduct = (product) => ({
  productId: product?.productId || product?.id || '',
  sku: product?.sku || '',
  category: product?.category || '',
  provider: product?.provider || '',
  users: Number(product?.users) || 0,
  serverConfiguration: product?.serverConfiguration || '',
  cores: product?.cores || '',
  ram: product?.ram || '',
  storage: product?.storage || ''
});

const CYCLE_UNITS = {
  day: { days: 1, months: 0 },
  week: { days: 7, months: 0 },
  month: { days: 30, months: 1 },
  year: { days: 365, months: 12 }
};

/**
 * A billing cycle is prose ("1 Month", "Monthly", "2 Years"), so the span is
 * read off the leading count and the first unit word it mentions.
 */
const cycleSpan = (cycle) => {
  const text = String(cycle || '').toLowerCase();
  const unit = Object.keys(CYCLE_UNITS).find((key) => new RegExp(`\\b${key}(ly|s)?\\b`).test(text));
  if (!unit) return null;
  const count = parseInt(text.match(/\d+/)?.[0] || '', 10);
  const times = Number.isFinite(count) && count > 0 ? count : 1;
  return { days: times * CYCLE_UNITS[unit].days, months: times * CYCLE_UNITS[unit].months };
};

const addTerm = (iso, { months, days }) => {
  const [year, month, day] = iso.split('-').map(Number);
  if (!months) {
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }

  // A month is a month, not thirty days: the last day of the shorter target
  // month is the honest end of the term.
  const total = year * 12 + (month - 1) + months;
  const targetYear = Math.floor(total / 12);
  const targetMonth = total % 12;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  return new Date(Date.UTC(targetYear, targetMonth, Math.min(day, lastDay))).toISOString().slice(0, 10);
};

/**
 * The purchased term is written on the receipt line when the order form
 * supplies it. Older ledger rows carry only the billing cycle, so their
 * validity is measured from the day the money was taken and says so rather
 * than passing itself off as a recorded term.
 */
const termOf = (items, paidOn) => {
  const line = items.find((item) => item.startDate || item.endDate || item.durationMonths);
  if (line) {
    return {
      period: line.billingCycle || '',
      months: Number(line.durationMonths) || 0,
      startDate: line.startDate || '',
      endDate: line.endDate || '',
      description: line.description || '',
      derived: false
    };
  }

  const cycle = items.map((item) => item.billingCycle).find(Boolean) || '';
  const span = cycleSpan(cycle);
  if (!span || !paidOn) return null;

  return {
    period: cycle,
    months: span.months,
    startDate: paidOn,
    endDate: addTerm(paidOn, span),
    description: '',
    derived: true
  };
};

const receiptItems = async (row, contract, context, split) => {
  if (Array.isArray(row.items) && row.items.length) {
    return row.items.map((item) => ({ ...item }));
  }

  const rawLabel = row.solutionCategory || row.productName || row.service || contract?.name || '';
  const product = lookupProduct(rawLabel, context) || context.catalogue.get(norm(contract?.productId));
  const name = await resolveDisplayName(rawLabel, contract?.name || 'Subscription');

  if (!product && !contract) {
    // Nothing in the catalogue or the contracts names this charge. Show the
    // line the ledger actually holds rather than dressing it up as a product.
    return [
      {
        name,
        quantity: 1,
        basePrice: split.baseAmount,
        gstAmount: split.taxAmount,
        finalPrice: split.baseAmount + split.taxAmount
      }
    ];
  }

  return [
    {
      ...fromProduct(product),
      name,
      billingCycle: contract?.subscriptionPeriod || product?.frequency || '',
      quantity: 1,
      basePrice: split.baseAmount,
      gstAmount: split.taxAmount,
      finalPrice: split.baseAmount + split.taxAmount
    }
  ];
};

const buildReceipt = async (row, context) => {
  const total = parseAmount(row.amount);
  const received = parseAmount(row.receivedAmount) || (String(row.status || '').toLowerCase() === 'received' ? total : 0);
  const pending = parseAmount(row.pendingPayment) || Math.max(total - received, 0);
  const split = gstSplit(row, total);
  const { contract, basis: contractLink } = linkContract(row, context);
  const customer = matchCustomer(row, context);
  const items = await receiptItems(row, contract, context, split);
  const catalogueProduct =
    lookupProduct(items[0]?.name || row.solutionCategory || row.productName || row.service, context) ||
    context.catalogue.get(norm(contract?.productId));
  const cgst = Math.round(split.taxAmount / 2);
  const sgst = Math.max(split.taxAmount - cgst, 0);

  return {
    id: row.invoiceNumber || row.invoiceRef || row.paymentId || String(row._id),
    paymentId: row.paymentId || row.id || null,
    invoiceNumber: row.invoiceNumber || row.invoiceRef || null,
    customer: {
      name: customer?.name || row.customer || '',
      company: customer?.company || row.company || row.accountName || '',
      email: customer?.email || row.email || '',
      customerId: customer?.customerId || row.customerId || '',
      phone: customer?.phone || '',
      gstNo: customer?.gstNo || '',
      pan: customer?.pan || '',
      address: Array.isArray(customer?.address) ? customer.address : []
    },
    salesPerson: row.salesPerson || contract?.salesPerson || '',
    raisedBy: row.raisedBy?.name ? row.raisedBy : { name: '', email: '', role: '' },
    items,
    term: termOf(items, isoDay(row.paymentReceivedDate, row.invoiceDate, row.date, row.createdAt)),
    productName: items[0]?.name || '',
    product: {
      ...fillProduct(items[0], catalogueProduct),
      billingCycle: items[0]?.billingCycle || catalogueProduct?.frequency || ''
    },
    contractId: row.contractId || contract?.contractId || '',
    contract: contract
      ? {
          id: contract.contractId || contract.id || '',
          name: contract.name || '',
          type: contract.contractType || '',
          subscriptionPeriod: contract.subscriptionPeriod || '',
          startDate: isoDay(contract.startDate),
          endDate: isoDay(contract.expiryDate, contract.endDate),
          value: contract.totalContractValue || contract.value || '',
          status: contract.status || '',
          slaTier: contract.slaTier || ''
        }
      : null,
    contractLink,
    amount: total,
    amountLabel: row.amount || inrText(total),
    receivedAmount: received,
    pendingPayment: pending,
    baseAmount: split.baseAmount,
    taxAmount: split.taxAmount,
    gstBasis: split.gstBasis,
    cgst,
    sgst,
    date: isoDay(row.invoiceDate, row.date, row.createdAt),
    invoiceDate: isoDay(row.invoiceDate, row.date, row.createdAt),
    paymentReceivedDate: isoDay(row.paymentReceivedDate),
    dueDate: isoDay(row.expectedPaymentDate),
    paymentMode: row.paymentMethod || row.method || '',
    paymentMethod: row.paymentMethod || row.method || '',
    source: row.source || '',
    status: row.status || '',
    service: items.map((item) => item.name).join(', '),
    solutionCategory: row.solutionCategory || '',
    // What a payment taken outside the gateway was reconciled with. The bytes
    // of a proof are never carried here; only its name, so the list can offer
    // to open it.
    referenceNumber: row.referenceNumber || '',
    bankName: row.bankName || '',
    depositDate: isoDay(row.depositDate),
    notes: row.notes || '',
    proof: row.proof?.fileName
      ? {
          fileName: row.proof.fileName || '',
          mimeType: row.proof.mimeType || '',
          sizeBytes: Number(row.proof.sizeBytes) || 0
        }
      : null,
    razorpayOrderId: row.razorpayOrderId || '',
    razorpayPaymentId: row.razorpayPaymentId || ''
  };
};

export const getReceipts = async (req, res) => {
  try {
    let rows = [];
    if (isMongoConnected()) {
      rows = await Payment.find({}).sort({ createdAt: -1 }).lean();
    }
    if (!rows.length) rows = getPaymentsFromFile();

    const context = await loadReceiptContext(rows);
    const receipts = await Promise.all(rows.map((row) => buildReceipt(row, context)));
    const visible = redactRecords(req.user, 'receipt', receipts);

    res.json({ success: true, count: visible.length, data: visible });
  } catch (err) {
    console.error('Error fetching receipts:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getPayments = async (req, res) => {
  try {
    let payments = [];
    if (isMongoConnected()) {
      payments = await Payment.find({}).sort({ createdAt: -1 }).lean();
    }
    if (!payments || payments.length === 0) {
      payments = getPaymentsFromFile();
    }

    const visible = redactRecords(req.user, 'payment', payments);
    res.json({
      success: true,
      count: visible.length,
      data: visible
    });
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const cleanText = (value, max = 120) => String(value ?? '').trim().slice(0, max);

// A receipt line is written once and must outlive catalogue edits, so each
// field is taken from the request by name. Spreading the body would let a
// caller set _id, createdAt or the gateway references directly.
const cleanItems = (items) =>
  (Array.isArray(items) ? items : [])
    .slice(0, 50)
    .map((item) => ({
      productId: cleanText(item?.productId),
      name: cleanText(item?.name),
      sku: cleanText(item?.sku),
      category: cleanText(item?.category),
      provider: cleanText(item?.provider),
      users: Number(item?.users) || 0,
      serverConfiguration: cleanText(item?.serverConfiguration),
      cores: cleanText(item?.cores),
      ram: cleanText(item?.ram),
      storage: cleanText(item?.storage),
      billingCycle: cleanText(item?.billingCycle),
      quantity: Math.min(Math.max(Number(item?.quantity) || 1, 1), 99),
      basePrice: Math.round(Number(item?.basePrice) || 0),
      gstAmount: Math.round(Number(item?.gstAmount) || 0),
      finalPrice: Math.round(Number(item?.finalPrice) || 0),
      unitPrice: Math.max(Math.round(Number(item?.unitPrice) || 0), 0),
      planQuantity: Math.min(Math.max(Number(item?.planQuantity) || 1, 1), 99),
      durationMonths: Math.max(Math.round(Number(item?.durationMonths) || 0), 0),
      startDate: cleanText(item?.startDate, 20),
      endDate: cleanText(item?.endDate, 20),
      description: cleanText(item?.description, 500)
    }))
    .filter((item) => item.name);

const STATUSES = ['Received', 'Cleared', 'Pending', 'Overdue'];

/**
 * A ledger code has to be unique or every later lookup that starts from it —
 * the payment list, the receipt ledger, a bank reconciliation — resolves to two
 * different rows, so the next number is taken from the highest one already on
 * file. Mongo is queried directly; on the JSON fallback the same scan happens in
 * memory instead of through a model call that would never connect.
 */
const nextLedgerReference = async (field, prefix) => {
  const pattern = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);

  let latest = null;
  if (isMongoConnected()) {
    latest = await Payment.findOne({ [field]: pattern }).sort({ [field]: -1 }).lean();
  } else {
    latest =
      getPaymentsFromFile()
        .filter((p) => String(p[field] || '').startsWith(prefix))
        .sort((a, b) => String(b[field]).localeCompare(String(a[field])))[0] || null;
  }

  const tail = parseInt(String(latest?.[field] || '').split('-').pop(), 10);
  return `${prefix}${Number.isFinite(tail) ? tail + 1 : 1001}`;
};

// How money physically reached the company when it did not come through the
// payment gateway. Each one is reconciled against a different document, which
// is why the reference and proof rules below differ per instrument.
const MANUAL_INSTRUMENTS = [
  'Cheque',
  'Demand Draft',
  'NEFT / RTGS',
  'IMPS',
  'Bank Transfer',
  'UPI Transfer',
  'Card Swipe',
  'Cash'
];

// An instrument-based payment is only real once the paper is with the bank, and
// the teller's copy is the sole evidence for it.
const PROOF_REQUIRED_INSTRUMENTS = ['Cheque', 'Demand Draft'];

// Cash has no bank-issued identifier, so it is the one instrument recorded on a
// voucher number the admin may not have to hand.
const REFERENCE_OPTIONAL_INSTRUMENTS = ['Cash'];

const PROOF_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
const MAX_PROOF_BYTES = 5 * 1024 * 1024;

/**
 * A proof is sent as a data URL, so both its type and its size are read back
 * from the bytes rather than trusted from the declaration next to them — a
 * "photo of the cheque" field that accepts whatever mime type the browser names
 * is a file upload with no checks at all.
 */
const readProof = (proof) => {
  const fileName = cleanText(proof?.fileName, 120);
  const match = /^data:([a-z]+\/[a-z0-9.+-]+);base64,([a-z0-9+/=]+)$/i.exec(String(proof?.data || ''));

  if (!match) {
    return { fileName, error: 'The proof document could not be read. Please attach it again.' };
  }

  const mimeType = match[1].toLowerCase();
  if (!PROOF_MIME_TYPES.includes(mimeType)) {
    return { fileName, error: 'Proof must be a PNG, JPG, WEBP image or a PDF.' };
  }

  const sizeBytes = Buffer.from(match[2], 'base64').length;
  if (!sizeBytes) return { fileName, error: 'The proof document is empty.' };
  if (sizeBytes > MAX_PROOF_BYTES) {
    return { fileName, sizeBytes, error: 'Proof document must be 5 MB or smaller.' };
  }

  return { fileName, mimeType, sizeBytes, data: `data:${mimeType};base64,${match[2]}`, error: null };
};

const isIsoDay = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) && !Number.isNaN(Date.parse(value));

export const createPayment = async (req, res) => {
  try {
    const p = req.body || {};
    const year = new Date().getFullYear();
    const today = new Date().toISOString().split('T')[0];
    const company = cleanText(p.company || p.accountName || p.customer || p.name, 200);

    if (!cleanText(p.amount)) {
      return res.status(400).json({ success: false, error: 'Amount is required to record a payment.' });
    }

    const paymentId = cleanText(p.paymentId) || (await nextLedgerReference('paymentId', `PAY-${year}-`));
    const invoiceNumber =
      cleanText(p.invoiceNumber || p.invoiceRef) || (await nextLedgerReference('invoiceNumber', `INV-${year}-`));

    const newPaymentData = {
      paymentId,
      invoiceNumber,
      customer: cleanText(p.customer) || company,
      company,
      email: cleanText(p.email, 160),
      customerId: cleanText(p.customerId),
      amount: cleanText(p.amount),
      receivedAmount: cleanText(p.receivedAmount) || cleanText(p.amount),
      pendingPayment: p.pendingPayment === undefined ? '₹0' : cleanText(p.pendingPayment),
      paymentMethod: cleanText(p.paymentMethod || p.method) || 'NEFT Wire',
      invoiceDate: cleanText(p.invoiceDate || p.date) || today,
      paymentReceivedDate: cleanText(p.paymentReceivedDate) || today,
      expectedPaymentDate: cleanText(p.expectedPaymentDate),
      status: STATUSES.includes(p.status) ? p.status : 'Received',
      solutionCategory: cleanText(p.solutionCategory || p.productName || company, 200),
      contractId: cleanText(p.contractId),
      items: cleanItems(p.items),
      taxableAmount: cleanText(p.taxableAmount),
      gstAmount: cleanText(p.gstAmount),
      gstBasis: cleanText(p.gstBasis, 240),
      salesPerson: cleanText(p.salesPerson),
      source: 'admin',
      raisedBy: {
        name: cleanText(req.user?.name),
        email: cleanText(req.user?.email, 160),
        role: cleanText(req.user?.role)
      }
    };

    let savedPayment = newPaymentData;
    if (isMongoConnected()) {
      savedPayment = await Payment.create(newPaymentData);
    }

    // Update fallback file
    const list = getPaymentsFromFile();
    savePaymentsToFile([{ ...newPaymentData, id: paymentId, invoiceRef: invoiceNumber }, ...list]);

    await logActivity(req, {
      action: 'PAYMENT_RECORDED',
      category: 'payment',
      resource: 'Payment',
      resourceId: paymentId,
      details: `Payment ${paymentId} recorded for ${newPaymentData.company} (${newPaymentData.amount})`
    });

    if (newPaymentData.status === 'Received' || newPaymentData.status === 'Cleared') {
      await logNotification({
        type: 'payment_received',
        title: 'Payment Received',
        message: `Payment of ${newPaymentData.amount} received from ${newPaymentData.company} via ${newPaymentData.paymentMethod}.`,
        severity: 'success',
        entityType: 'payment',
        entityId: paymentId,
        user: { name: newPaymentData.customer, company: newPaymentData.company },
        metadata: newPaymentData
      });
    }

    res.status(201).json({
      success: true,
      data: savedPayment
    });
  } catch (err) {
    console.error('Error creating payment:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const EDITABLE_TEXT_FIELDS = [
  'customer',
  'company',
  'accountName',
  'email',
  'customerId',
  'amount',
  'receivedAmount',
  'pendingPayment',
  'paymentMethod',
  'method',
  'invoiceNumber',
  'invoiceRef',
  'invoiceDate',
  'date',
  'paymentReceivedDate',
  'expectedPaymentDate',
  'solutionCategory',
  'contractId',
  'taxableAmount',
  'gstAmount',
  'gstBasis',
  'salesPerson'
];

export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    // Named fields only, so an edit cannot rewrite the row's identity, its
    // gateway references or who raised it.
    const updates = {};
    EDITABLE_TEXT_FIELDS.forEach((field) => {
      if (body[field] === undefined) return;
      updates[field] = cleanText(body[field], field.toLowerCase().includes('date') ? 40 : 200);
    });
    if (STATUSES.includes(body.status)) updates.status = body.status;
    if (body.items !== undefined) updates.items = cleanItems(body.items);

    if (!Object.keys(updates).length) {
      return res.status(400).json({ success: false, error: 'No editable payment fields were sent.' });
    }

    const query = {
      $or: [{ paymentId: id }, { id }, { invoiceNumber: id }, { _id: mongoose.isValidObjectId(id) ? id : null }]
    };

    let updated = null;
    if (isMongoConnected()) {
      updated = await Payment.findOneAndUpdate(query, { $set: updates }, { new: true }).lean();
    }

    await logActivity(req, {
      action: 'PAYMENT_UPDATED',
      category: 'payment',
      resource: 'Payment',
      resourceId: id,
      details: `Payment ${id} updated (${Object.keys(updates).join(', ')})`
    });

    const list = getPaymentsFromFile();
    const updatedList = list.map((p) =>
      p.paymentId === id || p.id === id || p.invoiceNumber === id ? { ...p, ...updates } : p
    );
    savePaymentsToFile(updatedList);

    res.json({
      success: true,
      data: updated || updates
    });
  } catch (err) {
    console.error('Error updating payment:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      await Payment.findOneAndDelete({
        $or: [{ paymentId: id }, { id: id }, { _id: mongoose.isValidObjectId(id) ? id : null }]
      });
    }

    const list = getPaymentsFromFile();
    const updatedList = list.filter((p) => p.paymentId !== id && p.id !== id);
    savePaymentsToFile(updatedList);

    res.json({
      success: true,
      message: 'Payment deleted successfully.'
    });
  } catch (err) {
    console.error('Error deleting payment:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ── Money received outside the payment gateway ─────────────────────────────
   A cheque or a bank transfer lands in the same ledger as an online payment,
   but nothing verifies it on the way in: the evidence is the bank's own
   reference number and a scan of the instrument. Both are required here, and
   the row is written with the same shape the receipt ledger already reads, so
   an offline payment needs no special handling anywhere downstream.
───────────────────────────────────────────────────────────────────────── */
const rupeeText = (value) => inrText(rupeeAmount(value));

/**
 * An amount typed by hand arrives as "Rs. 1,85,000/-" as readily as "₹18500",
 * and reading it the wrong way books a lakh as twelve paise — the grouping
 * commas go first, then the first run of digits is the money.
 */
function rupeeAmount(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const digits = String(value ?? '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return digits ? Number(digits[0]) : 0;
}

export const recordManualPayment = async (req, res) => {
  try {
    const p = req.body || {};
    const year = new Date().getFullYear();
    const today = new Date().toISOString().split('T')[0];
    const reject = (field, error) => res.status(400).json({ success: false, field, error });

    const company = cleanText(p.company || p.accountName || p.customer || p.name, 200);
    if (!company) return reject('company', 'Choose the customer whose payment is being recorded.');

    const instrument = cleanText(p.paymentMethod || p.method || p.instrument, 60);
    if (!MANUAL_INSTRUMENTS.includes(instrument)) {
      return reject('paymentMethod', `Payment mode must be one of ${MANUAL_INSTRUMENTS.join(', ')}.`);
    }

    const amount = rupeeAmount(p.amount);
    if (!(amount > 0)) return reject('amount', 'Enter the amount the customer paid.');

    const receivedDate = cleanText(p.paymentReceivedDate || p.date, 20) || today;
    if (!isIsoDay(receivedDate)) return reject('paymentReceivedDate', 'Enter the date the money was received.');

    const referenceNumber = cleanText(p.referenceNumber || p.utr || p.chequeNumber, 80);
    if (!referenceNumber && !REFERENCE_OPTIONAL_INSTRUMENTS.includes(instrument)) {
      return reject(
        'referenceNumber',
        `The ${instrument} reference or UTR number is needed to match this payment against the bank statement.`
      );
    }

    let proof = { fileName: '', mimeType: '', sizeBytes: 0 };
    let proofBytes = '';
    if (p.proof && p.proof.data) {
      const parsed = readProof(p.proof);
      if (parsed.error) return reject('proof', parsed.error);
      proof = { fileName: parsed.fileName, mimeType: parsed.mimeType, sizeBytes: parsed.sizeBytes };
      proofBytes = parsed.data;
    } else if (PROOF_REQUIRED_INSTRUMENTS.includes(instrument)) {
      return reject('proof', `Attach a scan or photo of the ${instrument.toLowerCase()} as proof of payment.`);
    }

    // An empty string means the admin recorded the cheque as not yet realised,
    // so only a field that was never sent falls back to the full amount.
    const received = p.receivedAmount === undefined ? amount : rupeeAmount(p.receivedAmount);
    const pending =
      p.pendingPayment === undefined ? Math.max(amount - received, 0) : rupeeAmount(p.pendingPayment);

    const paymentId = cleanText(p.paymentId) || (await nextLedgerReference('paymentId', `PAY-${year}-`));
    const invoiceNumber =
      cleanText(p.invoiceNumber || p.invoiceRef) || (await nextLedgerReference('invoiceNumber', `INV-${year}-`));

    const newPaymentData = {
      paymentId,
      invoiceNumber,
      customer: cleanText(p.customer) || company,
      company,
      email: cleanText(p.email, 160),
      customerId: cleanText(p.customerId),
      amount: rupeeText(amount),
      receivedAmount: rupeeText(received),
      pendingPayment: rupeeText(pending),
      paymentMethod: instrument,
      method: instrument,
      invoiceDate: cleanText(p.invoiceDate, 20) || receivedDate,
      paymentReceivedDate: receivedDate,
      expectedPaymentDate: cleanText(p.expectedPaymentDate, 20),
      status: STATUSES.includes(p.status) ? p.status : 'Received',
      solutionCategory: cleanText(p.solutionCategory || p.productName || company, 200),
      contractId: cleanText(p.contractId),
      items: cleanItems(p.items),
      taxableAmount: cleanText(p.taxableAmount),
      gstAmount: cleanText(p.gstAmount),
      gstBasis: cleanText(p.gstBasis, 240),
      salesPerson: cleanText(p.salesPerson),
      referenceNumber,
      bankName: cleanText(p.bankName, 120),
      depositDate: cleanText(p.depositDate, 20),
      notes: cleanText(p.notes, 500),
      proof,
      source: 'manual',
      raisedBy: {
        name: cleanText(req.user?.name),
        email: cleanText(req.user?.email, 160),
        role: cleanText(req.user?.role)
      }
    };

    if (isMongoConnected()) {
      // Render has no persistent disk, so on production the bytes have to ride
      // with the row; `select: false` keeps them out of every list query.
      await Payment.create({ ...newPaymentData, proof: { ...proof, data: proofBytes } });
    } else if (proofBytes) {
      savePaymentProof({ paymentId, ...proof, data: proofBytes });
    }

    // The JSON ledger only ever carries the description of the attachment.
    const list = getPaymentsFromFile();
    savePaymentsToFile([{ ...newPaymentData, id: paymentId, invoiceRef: invoiceNumber }, ...list]);

    await logActivity(req, {
      action: 'MANUAL_PAYMENT_RECORDED',
      category: 'payment',
      resource: 'Payment',
      resourceId: paymentId,
      details: `Offline payment ${paymentId} of ${newPaymentData.amount} recorded for ${company} via ${instrument}${
        referenceNumber ? ` (reference ${referenceNumber})` : ''
      }${proof.fileName ? ` with proof ${proof.fileName}` : ''}`
    });

    await logNotification({
      type: 'payment_received',
      title: 'Manual Payment Recorded',
      message: `${instrument} payment of ${newPaymentData.receivedAmount} from ${company} recorded${
        referenceNumber ? ` against reference ${referenceNumber}` : ''
      }.`,
      severity: 'success',
      entityType: 'payment',
      entityId: paymentId,
      user: { name: newPaymentData.customer, company },
      metadata: newPaymentData
    });

    res.status(201).json({
      success: true,
      data: { ...newPaymentData, id: paymentId, invoiceRef: invoiceNumber }
    });
  } catch (err) {
    console.error('Error recording manual payment:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Proof bytes are deliberately absent from the ledger lists — a receipt table
 * with five hundred cheque images is not a table — so the console asks for one
 * document when the admin actually opens it.
 */
export const getManualPaymentProof = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (isMongoConnected()) {
      const row = await Payment.findOne({
        $or: [
          { paymentId },
          { id: paymentId },
          { invoiceNumber: paymentId },
          { _id: mongoose.isValidObjectId(paymentId) ? paymentId : null }
        ]
      })
        .select('+proof.data')
        .lean();

      if (row?.proof?.data) {
        return res.json({
          success: true,
          data: {
            paymentId: row.paymentId,
            fileName: row.proof.fileName,
            mimeType: row.proof.mimeType,
            sizeBytes: row.proof.sizeBytes,
            data: row.proof.data
          }
        });
      }
    }

    const stored = getPaymentProof(paymentId);
    if (!stored?.data) {
      return res.status(404).json({ success: false, error: 'No proof document is attached to this payment.' });
    }

    res.json({ success: true, data: stored });
  } catch (err) {
    console.error('Error fetching payment proof:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export default {
  getPayments,
  createPayment,
  recordManualPayment,
  getManualPaymentProof,
  updatePayment,
  deletePayment
};


