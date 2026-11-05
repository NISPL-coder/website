import Payment, { getPaymentsFromFile, savePaymentsToFile } from '../models/Payment.js';
import Customer from '../models/Customer.js';
import Contract from '../models/Contract.js';
import mongoose from 'mongoose';
import { logActivity } from '../utils/activityLogger.js';
import { logNotification } from '../services/notificationService.js';
import { redactRecords } from '../utils/columnPermissions.js';
import { parseAmount, findCatalogueRow, resolveDisplayName, nextReference } from './portalController.js';

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

/**
 * The purchased term is written on the receipt line, so the header reports the
 * first line that carries one instead of assuming every line shares it.
 */
const termOf = (items) => {
  const line = items.find((item) => item.startDate || item.endDate || item.durationMonths);
  if (!line) return null;

  return {
    period: line.billingCycle || '',
    months: Number(line.durationMonths) || 0,
    startDate: line.startDate || '',
    endDate: line.endDate || '',
    description: line.description || ''
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
    term: termOf(items),
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

export const createPayment = async (req, res) => {
  try {
    const p = req.body || {};
    const year = new Date().getFullYear();
    const today = new Date().toISOString().split('T')[0];
    const company = cleanText(p.company || p.accountName || p.customer || p.name, 200);

    if (!cleanText(p.amount)) {
      return res.status(400).json({ success: false, error: 'Amount is required to record a payment.' });
    }

    const paymentId = cleanText(p.paymentId) || (await nextReference('paymentId', `PAY-${year}-`));
    const invoiceNumber =
      cleanText(p.invoiceNumber || p.invoiceRef) || (await nextReference('invoiceNumber', `INV-${year}-`));

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

export default {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment
};

