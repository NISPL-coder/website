import mongoose from 'mongoose';
import Customer, { getCustomersFromFile, saveCustomersToFile } from '../models/Customer.js';
import Contract, { getContractsFromFile, saveContractsToFile } from '../models/Contract.js';
import Payment, { getPaymentsFromFile } from '../models/Payment.js';
import Cart from '../models/Cart.js';
import Product, { getProductsFromFile } from '../models/Product.js';
import { Addon, getAddonsFromFile } from '../models/Addon.js';
import { logNotification } from '../services/notificationService.js';
import { crmRecordId, provisionContractsForPayment, syncContractToCrm } from '../services/contractProvisioning.js';
import { deriveCustomerLifecycle, refreshCustomerLifecycle } from '../services/customerLifecycle.js';
import { hasPermission } from '../middleware/permission.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

const PAID_STATUSES = new Set(['received', 'cleared', 'paid']);
const DUE_STATUSES = new Set(['pending', 'overdue', 'unpaid']);

// Money is stored as display text ("₹1,00,000", "₹6500 / 1 year"), so totals are
// taken from the numeric head of the string rather than trusting how a row was typed.
export const parseAmount = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  const head = String(value).split('/')[0].replace(/[^0-9.]/g, '');
  const parsed = parseFloat(head);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const daysUntil = (date) => {
  if (!date) return null;
  const utc = (value) => Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
  return Math.round((utc(date) - utc(new Date())) / 86400000);
};

const isoDate = (date) => (date ? date.toISOString().slice(0, 10) : null);

// Payments and contracts carry the customer as free text, not as an ObjectId, so
// every row that names this account on any of its identity fields belongs to it.
const IDENTITY_FIELDS = ['email', 'company', 'customer', 'accountName', 'customerId', 'accountId'];

const buildIdentityMatch = (values) => ({
  $or: values.flatMap((value) => IDENTITY_FIELDS.map((field) => ({ [field]: value })))
});

// The JSON fallback files hold the same free-text fields, so the scan mirrors
// the Mongo match: contact details have to agree exactly, while the account can
// be named loosely because legacy rows append "Pvt Ltd" and similar suffixes.
const IDENTITY_EXACT_FIELDS = ['email', 'customerId', 'accountId'];

const filterByIdentity = (rows, identity) => {
  const needle = identity.map((value) => String(value).toLowerCase());

  return rows.filter((row) =>
    IDENTITY_FIELDS.some((field) => {
      const value = String(row?.[field] || '').trim().toLowerCase();
      if (!value) return false;
      return needle.some((id) =>
        IDENTITY_EXACT_FIELDS.includes(field) ? value === id : value.includes(id)
      );
    })
  );
};

const collectIdentityValues = (user, customer) => {
  const values = [
    user?.email,
    user?.customerId,
    customer?.email,
    customer?.customerId,
    customer?.company
  ];
  return [...new Set(values.filter((v) => typeof v === 'string' && v.trim()).map((v) => v.trim()))];
};

const findAccountRecord = async (user) => {
  if (!isMongoConnected()) {
    const email = String(user?.email || '').trim().toLowerCase();
    const rows = getCustomersFromFile();
    const byCustomerId = String(user?.customerId || '').trim().toUpperCase();

    return (
      (byCustomerId &&
        rows.find((c) => String(c.customerId || '').trim().toUpperCase() === byCustomerId)) ||
      (email && rows.find((c) => String(c.email || '').trim().toLowerCase() === email)) ||
      null
    );
  }

  if (user?.customerId) {
    const byCustomerId = await Customer.findOne({ customerId: user.customerId }).lean();
    if (byCustomerId) return byCustomerId;
  }
  if (user?.email) return Customer.findOne({ email: user.email }).lean();
  return null;
};

/* ── Product naming ───────────────────────────────────────────────────────
   Contracts and payments store the product as free text typed by whoever
   raised it, so the portal resolves it against the catalogue and falls back
   to a readable form rather than echoing "tally on clouds".
───────────────────────────────────────────────────────────────────────── */
const normalizeKey = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const ACRONYMS = {
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'GCP',
  noc: 'NOC',
  sla: 'SLA',
  vps: 'VPS',
  ssl: 'SSL',
  tls: 'TLS',
  erp: 'ERP',
  crm: 'CRM',
  api: 'API',
  vm: 'VM',
  os: 'OS',
  ai: 'AI',
  ml: 'ML',
  tss: 'TSS',
  gst: 'GST',
  ip: 'IP',
  id: 'ID',
  saas: 'SaaS',
  ctrls: 'CtrlS'
};

const MINOR_WORDS = new Set(['on', 'and', 'for', 'the', 'of', 'in', 'with', 'to', 'a', 'an', 'at', 'by']);

const humanize = (text) =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => {
      const clean = word.toLowerCase().replace(/[.,;:!?]+$/, '');
      if (ACRONYMS[clean]) return ACRONYMS[clean];
      if (index > 0 && MINOR_WORDS.has(clean)) return clean;
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    })
    .join(' ');

const CATALOGUE_TTL_MS = 10 * 60 * 1000;
let catalogueCache = { at: 0, byKey: new Map() };

const loadCatalogue = async () => {
  if (catalogueCache.byKey.size && Date.now() - catalogueCache.at < CATALOGUE_TTL_MS) return catalogueCache;

  let rows = [];
  if (isMongoConnected()) {
    rows = await Product.find({}).lean().catch(() => []);
  }

  const byKey = new Map();
  rows.forEach((row) => {
    [row.productId, row.id, row.name].forEach((key) => {
      const normalized = normalizeKey(key);
      if (normalized && !byKey.has(normalized)) byKey.set(normalized, row);
    });
  });

  catalogueCache = { at: Date.now(), byKey };
  return catalogueCache;
};

export const findCatalogueRow = async (raw) => {
  const text = String(raw || '').trim();
  if (!text) return null;

  const catalogue = await loadCatalogue();
  return catalogue.byKey.get(normalizeKey(text)) || null;
};

export const resolveDisplayName = async (raw, fallback = 'Subscription') => {
  const text = String(raw || '').trim();
  if (!text) return fallback;

  const match = await findCatalogueRow(text);
  if (match?.name) return match.name;

  // Only re-case text that was typed in lower case; anything already mixed is
  // left exactly as the admin wrote it.
  if (text === text.toLowerCase()) return humanize(text);
  return text;
};

const mapContract = async (contract) => {
  const expiry = toDate(contract.expiryDate) || toDate(contract.endDate);
  const start = toDate(contract.startDate);
  const isDemo = Boolean(
    contract.isDemoTrial ||
    contract.contractType === 'Trial' ||
    contract.productCategory === 'Trial' ||
    String(contract.status).toUpperCase() === 'DEMO' ||
    /demo/i.test(contract.name || '') ||
    /trial/i.test(contract.name || '')
  );

  return {
    id: contract.contractId || String(contract._id),
    contractId: contract.contractId || String(contract._id),
    name: await resolveDisplayName(contract.name || contract.service || contract.productCategory, 'Subscription'),
    category: contract.productCategory || null,
    contractType: contract.contractType || null,
    productId: contract.productId || null,
    salesPerson: contract.salesPerson || null,
    status: contract.status || null,
    startDate: isoDate(start),
    expiryDate: isoDate(expiry),
    endDate: isoDate(expiry),
    rawExpiryDate: contract.expiryDate || contract.endDate || null,
    daysLeft: daysUntil(expiry),
    amount: parseAmount(contract.value || contract.totalContractValue),
    amountLabel: contract.value || contract.totalContractValue || null,
    expired: Boolean(expiry) && daysUntil(expiry) < 0,
    source: 'contract',
    isDemoTrial: isDemo,
    subscriptionPeriod: contract.subscriptionPeriod || null,
    description: contract.description || null,
    slaTier: contract.slaTier || null,
    serverConfiguration: contract.serverConfiguration || null,
    serverNode: contract.serverNode || null,
    cores: contract.cores || null,
    ram: contract.ram || null,
    storage: contract.storage || null,
    extensionAllowed: Boolean(contract.extensionAllowed),
    extensionDays: Number(contract.extensionDays || 0),
    trialUsed: Boolean(contract.trialUsed)
  };
};

export const mapPayment = async (payment) => {
  const date = toDate(payment.invoiceDate) || toDate(payment.date) || toDate(payment.createdAt);
  const due = toDate(payment.expectedPaymentDate);
  const status = String(payment.status || '').trim();
  const amount = parseAmount(payment.amount);
  const received = parseAmount(payment.receivedAmount);
  const isPaid = PAID_STATUSES.has(status.toLowerCase());
  const isDue = DUE_STATUSES.has(status.toLowerCase());
  const pending = isDue
    ? parseAmount(payment.pendingPayment) || Math.max(amount - received, 0)
    : 0;

  return {
    id: payment.paymentId || payment.id || String(payment._id),
    invoiceNumber: payment.invoiceNumber || payment.invoiceRef || payment.paymentId || null,
    service: await resolveDisplayName(
      payment.solutionCategory || payment.productName || payment.service,
      'Services'
    ),
    date: isoDate(date),
    dueDate: isoDate(due),
    daysLeft: daysUntil(due),
    amount,
    received: isPaid ? (received || amount) : received,
    pending,
    status: status || null,
    paymentMethod: payment.paymentMethod || payment.method || null,
    // What the money bought, frozen when the payment was taken. Legacy rows
    // predate this and arrive with none of it, which the receipt UI shows as
    // "not recorded" rather than filling in.
    contractId: payment.contractId || null,
    salesPerson: payment.salesPerson || null,
    source: payment.source || null,
    raisedBy: payment.raisedBy?.name ? payment.raisedBy : null,
    taxableAmount: parseAmount(payment.taxableAmount),
    gstAmount: parseAmount(payment.gstAmount),
    gstBasis: payment.gstBasis || null,
    // How the money reached NISPL when a desk booked it in from a bank
    // instrument instead of the gateway. The customer sees the same bank facts
    // their own statement carries; internal remarks and the scan stay inside
    // the console.
    referenceNumber: payment.referenceNumber || null,
    bankName: payment.bankName || null,
    depositDate: isoDate(toDate(payment.depositDate)),
    lines: Array.isArray(payment.items) ? payment.items : []
  };
};

const pickRenewal = (products) =>
  products
    .filter((product) => product.expiryDate && product.daysLeft !== null && product.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)[0] || null;

// A renewal only asks for money once the term is actually coming up and nothing
// has been booked against that term yet — a contract valid for another year is
// information, not a demand.
const RENEWAL_REMINDER_WINDOW_DAYS = 45;

const isTermPaid = (product, payments) => {
  const key = normalizeKey(product.name);
  if (!key) return false;

  return payments.some(
    (payment) =>
      PAID_STATUSES.has(String(payment.status || '').toLowerCase()) &&
      normalizeKey(payment.service) === key &&
      (!product.startDate || !payment.date || payment.date >= product.startDate)
  );
};

const pickRenewalReminder = (products, payments) =>
  products
    .filter((product) => product.expiryDate && product.daysLeft !== null && product.amount > 0)
    .filter((product) => product.daysLeft <= RENEWAL_REMINDER_WINDOW_DAYS)
    .filter((product) => !isTermPaid(product, payments))
    .sort((a, b) => a.daysLeft - b.daysLeft)[0] || null;

const pickReminder = (payments, products) => {
  const dues = payments
    .filter((payment) => payment.pending > 0)
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

  if (dues.length > 0) {
    const soonest = dues[0];
    return {
      kind: 'payment',
      title: soonest.service,
      invoiceNumber: soonest.invoiceNumber,
      amount: soonest.pending,
      dueDate: soonest.dueDate,
      daysLeft: soonest.daysLeft,
      overdue: soonest.daysLeft !== null && soonest.daysLeft < 0
    };
  }

  const renewal = pickRenewalReminder(products, payments);
  if (renewal) {
    return {
      kind: 'renewal',
      contractId: renewal.id,
      title: renewal.name,
      invoiceNumber: null,
      amount: renewal.amount,
      dueDate: renewal.expiryDate,
      daysLeft: renewal.daysLeft,
      overdue: renewal.daysLeft < 0
    };
  }

  return null;
};

const collectAllReminders = (payments, products) => {
  const list = [];
  const dues = payments
    .filter((payment) => payment.pending > 0)
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

  for (const due of dues) {
    list.push({
      id: due.id || due.invoiceNumber,
      kind: 'payment',
      title: due.service,
      invoiceNumber: due.invoiceNumber,
      amount: due.pending,
      dueDate: due.dueDate,
      daysLeft: due.daysLeft,
      overdue: due.daysLeft !== null && due.daysLeft < 0
    });
  }

  const upcomingRenewals = products
    .filter((product) => product.expiryDate && product.daysLeft !== null && product.amount > 0)
    .filter((product) => product.daysLeft <= RENEWAL_REMINDER_WINDOW_DAYS)
    .filter((product) => !isTermPaid(product, payments))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  for (const renewal of upcomingRenewals) {
    list.push({
      id: renewal.id || renewal.name,
      kind: 'renewal',
      contractId: renewal.id,
      title: renewal.name,
      invoiceNumber: null,
      amount: renewal.amount,
      dueDate: renewal.expiryDate,
      daysLeft: renewal.daysLeft,
      overdue: renewal.daysLeft < 0
    });
  }

  return list;
};

// What the account already owns, resolved back to catalogue rows so the Products
// page can mark the plan the customer actually paid for.
const resolveCatalogueId = async (name) => {
  const catalogue = await loadCatalogue();
  return catalogue.byKey.get(normalizeKey(name))?.productId || null;
};

const buildEntitlements = async (products, payments) => {
  const byKey = new Map();

  const remember = async (name, meta) => {
    const key = normalizeKey(name);
    if (!key || byKey.has(key)) return;
    byKey.set(key, { name, productId: await resolveCatalogueId(name), ...meta });
  };

  for (const product of products) {
    if (product.expired) continue;
    await remember(product.name, {
      source: 'subscription',
      contractId: product.source === 'contract' ? product.id : null,
      expiryDate: product.expiryDate
    });
  }

  for (const payment of payments) {
    if (!PAID_STATUSES.has(String(payment.status || '').toLowerCase())) continue;
    await remember(payment.service, { source: 'purchase', date: payment.date });
  }

  return [...byKey.values()];
};

// The header search scans a wider window than it shows, so the strongest title
// matches survive ranking rather than whichever rows Mongo happened to return.
const SEARCH_SCAN_LIMIT = 12;
const SEARCH_GROUP_LIMIT = 5;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatLabelDate = (iso) => {
  if (!iso) return null;
  const date = toDate(iso);
  if (!date) return null;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const rankByTitle = (items, query) => {
  const needle = query.toLowerCase();
  const score = (title) => {
    const value = String(title || '').toLowerCase();
    if (value === needle) return 0;
    if (value.startsWith(needle)) return 1;
    if (value.includes(needle)) return 2;
    return 3;
  };
  return [...items]
    .sort((a, b) => score(a.title) - score(b.title) || String(a.title).localeCompare(String(b.title)))
    .slice(0, SEARCH_GROUP_LIMIT);
};

export const searchCustomerPortal = async (req, res) => {
  try {
    const query = String(req.query.q || '').trim().slice(0, 60);
    const groups = [];

    if (query.length < 2) {
      return res.json({ success: true, data: { query, groups } });
    }

    const user = req.user || {};
    const userRole = String(user.role || '').toLowerCase();
    const isAdminStaff = ['admin', 'manager', 'support'].includes(userRole);
    const rx = new RegExp(escapeRegex(query), 'i');
    const allowed = (module) => hasPermission(user, module);

    // ─────────────────────────────────────────────────────────────────────────
    // 1. ADMIN / STAFF GLOBAL SEARCH ACROSS ALL RECORDS
    // ─────────────────────────────────────────────────────────────────────────
    if (isAdminStaff) {
      let rawCustomers = [];
      let rawContracts = [];
      let rawPayments = [];
      let rawProducts = [];
      let rawAddons = [];

      if (isMongoConnected()) {
        const [custRes, contRes, payRes, prodRes, addonRes] = await Promise.all([
          Customer.find({
            $or: [
              { name: rx },
              { companyName: rx },
              { company: rx },
              { email: rx },
              { phone: rx },
              { customerId: rx },
              { gstNo: rx },
              { city: rx },
              { additionalEmails: rx },
              { additionalPhones: rx }
            ]
          }).limit(SEARCH_SCAN_LIMIT).lean(),

          Contract.find({
            $or: [
              { name: rx },
              { company: rx },
              { customer: rx },
              { contractCode: rx },
              { contractId: rx },
              { service: rx },
              { serviceTier: rx },
              { tier: rx },
              { productCategory: rx },
              { contractType: rx },
              { status: rx }
            ]
          }).limit(SEARCH_SCAN_LIMIT).lean(),

          Payment.find({
            $or: [
              { invoiceNumber: rx },
              { invoiceRef: rx },
              { paymentId: rx },
              { company: rx },
              { customer: rx },
              { accountName: rx },
              { productName: rx },
              { service: rx },
              { solutionCategory: rx },
              { paymentMethod: rx },
              { paymentMode: rx },
              { referenceNumber: rx },
              { status: rx }
            ]
          }).limit(SEARCH_SCAN_LIMIT).lean(),

          Product.find({
            $or: [
              { name: rx },
              { category: rx },
              { provider: rx },
              { serverConfiguration: rx },
              { ipAddress: rx },
              { tier: rx }
            ]
          }).limit(SEARCH_SCAN_LIMIT).lean(),

          Addon.find({
            $or: [
              { name: rx },
              { category: rx },
              { spec: rx },
              { desc: rx }
            ]
          }).limit(SEARCH_SCAN_LIMIT).lean()
        ]);

        rawCustomers = custRes || [];
        rawContracts = contRes || [];
        rawPayments = payRes || [];
        rawProducts = prodRes || [];
        rawAddons = addonRes || [];
      } else {
        // Fallback from local data files
        rawCustomers = getCustomersFromFile().filter(
          (c) =>
            rx.test(c.name || '') ||
            rx.test(c.companyName || '') ||
            rx.test(c.company || '') ||
            rx.test(c.email || '') ||
            rx.test(c.phone || '') ||
            rx.test(c.customerId || '')
        ).slice(0, SEARCH_SCAN_LIMIT);

        rawContracts = getContractsFromFile().filter(
          (c) =>
            rx.test(c.name || '') ||
            rx.test(c.company || '') ||
            rx.test(c.customer || '') ||
            rx.test(c.contractCode || '') ||
            rx.test(c.service || '')
        ).slice(0, SEARCH_SCAN_LIMIT);

        rawPayments = getPaymentsFromFile().filter(
          (p) =>
            rx.test(p.invoiceNumber || '') ||
            rx.test(p.invoiceRef || '') ||
            rx.test(p.company || '') ||
            rx.test(p.customer || '') ||
            rx.test(p.service || '')
        ).slice(0, SEARCH_SCAN_LIMIT);

        rawProducts = getProductsFromFile().filter(
          (p) => rx.test(p.name || '') || rx.test(p.category || '') || rx.test(p.provider || '')
        ).slice(0, SEARCH_SCAN_LIMIT);

        rawAddons = getAddonsFromFile().filter(
          (a) => rx.test(a.name || '') || rx.test(a.category || '') || rx.test(a.spec || '')
        ).slice(0, SEARCH_SCAN_LIMIT);
      }

      // 1. Customers Group
      const customerItems = rankByTitle(
        rawCustomers.map((c) => ({
          id: c.id || c._id || c.customerId,
          title: c.companyName || c.company || c.name || 'Customer Account',
          subtitle: [c.name, c.email, c.phone].filter(Boolean).join(' · '),
          meta: c.customerId ? `#${c.customerId}` : 'Customer',
          target: 'customer',
          path: '/admin/customer',
          seed: c.companyName || c.company || c.name || c.customerId
        })),
        query
      );

      // 2. Contracts Group
      const contractItems = rankByTitle(
        rawContracts.map((c) => ({
          id: c.id || c._id || c.contractCode,
          title: c.name || c.contractCode || c.service || 'Contract Agreement',
          subtitle: [
            c.company || c.customer,
            c.serviceTier || c.tier || c.service,
            formatLabelDate(c.expiryDate) ? `Renews ${formatLabelDate(c.expiryDate)}` : null
          ].filter(Boolean).join(' · '),
          meta: c.status || 'Active',
          amount: parseAmount(c.contractValue || c.value || c.totalContractValue),
          target: 'contract',
          path: '/admin/customer/contract',
          seed: c.contractCode || c.name || c.company
        })),
        query
      );

      // 3. Payments Group
      const paymentItems = rankByTitle(
        rawPayments.map((p) => ({
          id: p.id || p._id || p.invoiceNumber,
          title: p.invoiceNumber || p.invoiceRef || p.paymentId || 'Payment Invoice',
          subtitle: [
            p.company || p.customer || p.accountName,
            p.service || p.productName,
            formatLabelDate(p.paymentDate || p.date)
          ].filter(Boolean).join(' · '),
          meta: p.status || 'Paid',
          amount: parseAmount(p.receivedAmount || p.amount || p.pendingPayment),
          target: 'payment',
          path: '/admin/customer/payment',
          seed: p.invoiceNumber || p.company
        })),
        query
      );

      // 4. Products & Add-ons Group
      const combinedProducts = [
        ...rawProducts.map((p) => ({
          id: p.id || p._id || p.productId,
          title: p.name,
          subtitle: [p.category || 'Cloud Hosting', p.serverConfiguration || p.tier || p.provider].filter(Boolean).join(' · '),
          meta: p.available !== false && p.status !== 'inactive' ? 'Available' : 'Disabled',
          amount: parseAmount(p.price || p.monthlyPrice),
          target: 'product',
          path: /tally/i.test(`${p.category || ''} ${p.name || ''}`) ? '/admin/product/tally' : '/admin/product/cloud',
          seed: p.name
        })),
        ...rawAddons.map((a) => ({
          id: a.id || a._id,
          title: a.name,
          subtitle: [a.category || 'Checkout Add-on', a.spec || a.desc].filter(Boolean).join(' · '),
          meta: a.available !== false ? 'Add-on' : 'Disabled',
          amount: parseAmount(a.amount || a.basePrice),
          target: 'addons',
          path: '/admin/product/addons',
          seed: a.name
        }))
      ];
      const productItems = rankByTitle(combinedProducts, query);

      // 5. Receipts Group (settled ledger rows)
      const receiptItems = allowed('receipt')
        ? rankByTitle(
          rawPayments
            .filter((p) => PAID_STATUSES.has(String(p.status || '').toLowerCase()))
            .map((p) => ({
              id: `receipt-${p.id || p._id || p.invoiceNumber}`,
              title: p.invoiceNumber || p.invoiceRef || p.paymentId || 'Receipt',
              subtitle: [p.company || p.customer || p.accountName, formatLabelDate(p.paymentDate || p.date)].filter(Boolean).join(' · '),
              meta: p.status,
              amount: parseAmount(p.receivedAmount || p.amount),
              target: 'receipt',
              path: '/admin/receipt',
              seed: p.invoiceNumber || p.invoiceRef || p.paymentId
            })),
          query
        )
        : [];

      // Search must never surface a module the staff role cannot open.
      if (allowed('customer') && customerItems.length > 0) {
        groups.push({ key: 'customers', label: 'Customers', items: customerItems });
      }
      if (allowed('contract') && contractItems.length > 0) {
        groups.push({ key: 'contracts', label: 'Contracts & Subscriptions', items: contractItems });
      }
      if ((allowed('payment') || allowed('manual_payment')) && paymentItems.length > 0) {
        groups.push({ key: 'payments', label: 'Payments & Receipts', items: paymentItems });
      }
      if (allowed('product') && productItems.length > 0) {
        groups.push({ key: 'products', label: 'Products & Add-Ons', items: productItems });
      }
      if (receiptItems.length > 0) {
        groups.push({ key: 'receipts', label: 'Receipts & Proofs', items: receiptItems });
      }

      return res.json({ success: true, data: { query, role: userRole, groups } });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. CUSTOMER IDENTITY-SCOPED SEARCH (ONLY THEIR OWN RECORDS)
    // ─────────────────────────────────────────────────────────────────────────
    const customer = await findAccountRecord(user);
    const identity = collectIdentityValues(user, customer);

    if (identity.length === 0) {
      return res.json({ success: true, data: { query, role: userRole, groups } });
    }

    let contracts = [];
    let paymentRows = [];

    if (isMongoConnected()) {
      const scope = buildIdentityMatch(identity);
      const [contRes, payRes] = await Promise.all([
        Contract.find({
          $and: [
            scope,
            {
              $or: [
                { name: rx },
                { service: rx },
                { productCategory: rx },
                { contractType: rx },
                { contractId: rx },
                { status: rx },
                { value: rx },
                { totalContractValue: rx }
              ]
            }
          ]
        }).limit(SEARCH_SCAN_LIMIT).lean(),
        Payment.find({
          $and: [
            scope,
            {
              $or: [
                { invoiceNumber: rx },
                { invoiceRef: rx },
                { paymentId: rx },
                { productName: rx },
                { service: rx },
                { solutionCategory: rx },
                { paymentMethod: rx },
                { referenceNumber: rx },
                { status: rx },
                { amount: rx },
                { receivedAmount: rx },
                { pendingPayment: rx }
              ]
            }
          ]
        }).limit(SEARCH_SCAN_LIMIT).lean()
      ]);
      contracts = contRes || [];
      paymentRows = payRes || [];
    } else {
      contracts = filterByIdentity(getContractsFromFile(), identity).filter(
        (c) => rx.test(c.name || '') || rx.test(c.service || '')
      ).slice(0, SEARCH_SCAN_LIMIT);

      paymentRows = filterByIdentity(getPaymentsFromFile(), identity).filter(
        (p) => rx.test(p.invoiceNumber || '') || rx.test(p.service || '')
      ).slice(0, SEARCH_SCAN_LIMIT);
    }

    const productItems = rankByTitle(
      (await Promise.all(contracts.map(mapContract))).map((product) => ({
        id: product.id,
        title: product.name,
        subtitle: [
          product.contractType || product.category || 'Subscription',
          product.expiryDate
            ? `Renews ${formatLabelDate(product.expiryDate)}`
            : 'Validity not recorded'
        ].join(' · '),
        meta: product.status,
        amount: product.amount,
        target: 'products',
        path: '/customer/product',
        seed: product.name
      })),
      query
    );

    const paymentItems = rankByTitle(
      (await Promise.all(paymentRows.map(mapPayment))).map((payment) => ({
        id: payment.id,
        title: payment.invoiceNumber || payment.service,
        subtitle: [payment.service, formatLabelDate(payment.date)].filter(Boolean).join(' · '),
        meta: payment.status,
        amount: payment.pending || payment.received || payment.amount,
        target: 'receipt',
        path: '/customer/receipt',
        seed: payment.invoiceNumber || payment.service
      })),
      query
    );

    if (productItems.length > 0) {
      groups.push({ key: 'products', label: 'Products & plans', items: productItems });
    }
    if (paymentItems.length > 0) {
      groups.push({ key: 'payments', label: 'Payments & receipts', items: paymentItems });
    }

    return res.json({ success: true, data: { query, role: userRole, groups } });
  } catch (err) {
    console.error('Error searching portal:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getCustomerOverview = async (req, res) => {
  try {
    const user = req.user || {};
    const customer = await findAccountRecord(user);
    const identity = collectIdentityValues(user, customer);

    let products = [];
    let payments = [];
    let rawContracts = [];
    let rawPayments = [];

    if (isMongoConnected() && identity.length > 0) {
      const match = buildIdentityMatch(identity);
      const [contracts, paymentRows] = await Promise.all([
        Contract.find(match).lean(),
        Payment.find(match).lean()
      ]);
      rawContracts = contracts;
      rawPayments = paymentRows;
      products = await Promise.all(contracts.map(mapContract));
      payments = await Promise.all(paymentRows.map(mapPayment));
    }

    products.sort((a, b) => (a.expiryDate || '9999').localeCompare(b.expiryDate || '9999'));

    // The ledger files are what the local server writes when Mongo is not
    // connected, so an account has to be read out of them the same way.
    if (products.length === 0 && identity.length > 0) {
      const matched = filterByIdentity(getContractsFromFile(), identity);
      if (matched.length > 0) {
        rawContracts = matched;
        products = await Promise.all(matched.map(mapContract));
        products.sort((a, b) => (a.expiryDate || '9999').localeCompare(b.expiryDate || '9999'));
      }
    }

    if (payments.length === 0 && identity.length > 0) {
      const matchedPayments = filterByIdentity(getPaymentsFromFile(), identity);
      if (matchedPayments.length > 0) {
        rawPayments = matchedPayments;
        payments = await Promise.all(matchedPayments.map(mapPayment));
      }
    }

    payments.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    const totalPaid = payments.reduce((sum, payment) => sum + (payment.received || 0), 0);
    const totalPending = payments.reduce((sum, payment) => sum + (payment.pending || 0), 0);

    // Identify demo contracts vs regular paid contracts
    const isDemoProduct = (p) =>
      Boolean(
        p.isDemoTrial ||
        p.contractType === 'Trial' ||
        p.category === 'Trial' ||
        String(p.status).toUpperCase() === 'DEMO' ||
        String(p.status).toUpperCase() === 'DEMO-INACTIVE'
      );

    const regularProducts = products.filter((product) => !isDemoProduct(product));
    const activePaidCount = regularProducts.filter(
      (p) => !p.expired && ['in progress', 'active'].includes(String(p.status || '').toLowerCase())
    ).length;

    const demoProducts = products.filter((product) => isDemoProduct(product));

    const hasPurchasedPaidProduct =
      activePaidCount > 0 ||
      totalPaid > 0 ||
      payments.some((p) => ['received', 'cleared'].includes(String(p.status || '').toLowerCase()));

    // Rule: "once demo is issued and then purchased the products the demo will be convert.
    // both demo and active product cannot be there."
    // Admin requirement: "once the Demo is over or customer purchased the product at that time it will be DEMO-Inactive (in red) for the Admin portal"
    let activeDemos = [];
    let hasConvertedDemo = false;

    if (hasPurchasedPaidProduct) {
      const unconvertedDemoIds = [];
      const conversionTimestamp = new Date().toISOString();

      products.forEach((p) => {
        if (isDemoProduct(p) || p.convertedToPaid) {
          hasConvertedDemo = true;
          p.status = 'DEMO-Inactive';
          p.convertedToPaid = true;
          p.isDemoTrial = false;
          p.convertedAt = p.convertedAt || conversionTimestamp;
          if (p.id) unconvertedDemoIds.push(p.id);
          if (p.contractId) unconvertedDemoIds.push(p.contractId);
        }
      });

      // Persist conversion in MongoDB if connected
      if (isMongoConnected() && unconvertedDemoIds.length > 0) {
        try {
          const objectIds = unconvertedDemoIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
          await Contract.updateMany(
            {
              $or: [
                { _id: { $in: objectIds } },
                { contractId: { $in: unconvertedDemoIds } }
              ],
              status: { $ne: 'DEMO-Inactive' }
            },
            {
              $set: {
                status: 'DEMO-Inactive',
                convertedToPaid: true,
                convertedAt: new Date(),
                convertedToContractId: regularProducts[0]?.id || regularProducts[0]?.contractId || ''
              }
            }
          );

          await Customer.updateMany(
            {
              $or: identity.map((id) => ({ email: id })).concat(identity.map((id) => ({ customerId: id })))
            },
            {
              $set: {
                demoTrialUsed: true,
                plan: regularProducts[0]?.name || customer?.plan
              }
            }
          );
        } catch (dbErr) {
          console.warn('[PortalController] Demo auto-conversion persistence note:', dbErr.message);
        }
      }

      // Persist conversion to file store
      try {
        const fileCtrs = getContractsFromFile();
        let changed = false;
        const updated = fileCtrs.map((c) => {
          const matches =
            filterByIdentity([c], identity).length > 0 &&
            (Boolean(c.isDemoTrial) || c.contractType === 'Trial' || c.productCategory === 'Trial' || String(c.status).toUpperCase() === 'DEMO' || String(c.status).toUpperCase() === 'DEMO-INACTIVE');
          if (matches && c.status !== 'DEMO-Inactive') {
            changed = true;
            return { ...c, status: 'DEMO-Inactive', convertedToPaid: true, convertedAt: conversionTimestamp };
          }
          return c;
        });
        if (changed) saveContractsToFile(updated);
      } catch (fileErr) {
        console.warn('[PortalController] File fallback update note:', fileErr.message);
      }

      // Both demo and active product cannot be there
      activeDemos = [];
    } else {
      activeDemos = demoProducts.filter(
        (p) => !p.expired && !p.convertedToPaid && String(p.status).toUpperCase() === 'DEMO'
      );
      hasConvertedDemo = products.some(
        (p) => p.convertedToPaid || ['CONVERTED', 'DEMO-INACTIVE'].includes(String(p.status).toUpperCase())
      );
    }

    const activeDemoCount = activeDemos.length;
    const renewal = pickRenewal(regularProducts.length > 0 ? regularProducts : products);
    const entitlements = await buildEntitlements(products, payments);

    res.json({
      success: true,
      data: {
        account: {
          customerId: customer?.customerId || user.customerId || null,
          name: customer?.name || user.name || null,
          company: customer?.company || user.company || null,
          email: customer?.email || user.email || null,
          phone: customer?.phone || user.phone || null,
          plan: customer?.plan || null,
          status: deriveCustomerLifecycle(
            customer || {
              email: user.email,
              customerId: user.customerId,
              company: user.company,
              name: user.name
            },
            rawContracts,
            rawPayments
          ),
          serverNode: customer?.serverNode || null,
          gstNo: customer?.gstNo || null,
          registered: customer?.registered || null,
          avatar: customer?.avatar || customer?.companyLogo || user?.avatar || user?.companyLogo || '',
          companyLogo: customer?.companyLogo || customer?.avatar || user?.companyLogo || user?.avatar || '',
          demoTrialUsed: Boolean(customer?.demoTrialUsed || hasConvertedDemo),
          demoExtensionAllowed: Boolean(customer?.demoExtensionAllowed),
          demoExtensionDays: Number(customer?.demoExtensionDays || 0),
          isEmailVerified: Boolean(customer?.isEmailVerified || user?.isEmailVerified),
          emailVerifiedAt: customer?.emailVerifiedAt || user?.emailVerifiedAt || null
        },
        kpi: {
          activeProducts: activePaidCount,
          demoProducts: activeDemoCount,
          activeDemoProducts: activeDemoCount,
          totalPaid,
          totalPending,
          pendingInvoices: payments.filter((payment) => payment.pending > 0).length,
          renewalName: renewal?.name || null,
          renewalDate: renewal?.expiryDate || null,
          renewalDaysLeft: renewal?.daysLeft ?? null
        },
        products,
        allProducts: products,
        demoProducts: activeDemos,
        hasConvertedDemo,
        payments,
        entitlements,
        recentPayments: payments.slice(0, 50),
        reminders: collectAllReminders(payments, products),
        reminder: pickReminder(payments, products),
        identityMatched: identity.length > 0 && Boolean(customer)
      }
    });
  } catch (err) {
    console.error('Error building customer overview:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ── Checkout ─────────────────────────────────────────────────────────────
   A payment only counts once it is on the ledger, otherwise the dashboard,
   receipts and reminders keep showing the state from before the customer paid.
   Amounts come from the quote stored on the account's own cart, never from the
   request body, so the client cannot set what it owes.
───────────────────────────────────────────────────────────────────────── */
const GST_RATE = 0.18;
const MAX_LINE_QUANTITY = 99;

const roundMoney = (value) => Math.round(Number(value) || 0);

const inr = (value) => `₹${roundMoney(value).toLocaleString('en-IN')}`;

const todayIso = () => new Date().toISOString().slice(0, 10);

/* ── Receipt lines ────────────────────────────────────────────────────────
   A receipt has to say what was sold even after the catalogue is edited, so
   the product's identity and specifications are copied onto the payment when
   money lands instead of being looked up again when an admin opens the row.
───────────────────────────────────────────────────────────────────────── */
const buildReceiptLine = (item, product) => {
  const quantity = Math.min(Math.max(roundMoney(item.quantity) || 1, 1), MAX_LINE_QUANTITY);
  const basePrice = roundMoney(item.basePrice);
  const lineBase = basePrice * quantity;

  return {
    productId: product?.productId || item.planId || item.productId || '',
    name: product?.name || item.name || 'Plan',
    sku: product?.sku || item.sku || product?.productId || '',
    category: product?.category || item.category || '',
    provider: product?.provider || '',
    users: roundMoney(item.users) || roundMoney(product?.users) || 0,
    serverConfiguration: item.serverConfiguration || product?.serverConfiguration || '',
    cores: product?.cores || '',
    ram: product?.ram || '',
    storage: product?.storage || '',
    billingCycle: item.billingCycle || item.duration || product?.frequency || '',
    quantity,
    basePrice,
    gstAmount: roundMoney(lineBase * GST_RATE),
    finalPrice: roundMoney(lineBase * (1 + GST_RATE)),

    // What the order form actually showed when this was quoted: the
    // price of one unit, how many were bought and the term they cover.
    unitPrice: roundMoney(item.unitPrice),
    planQuantity: Math.min(Math.max(roundMoney(item.planQuantity) || 1, 1), MAX_LINE_QUANTITY),
    durationMonths: Math.max(roundMoney(item.durationMonths), 0),
    startDate: String(item.startDate || '').slice(0, 20),
    endDate: String(item.endDate || '').slice(0, 20),
    description: String(item.description || product?.description || '').slice(0, 500)
  };
};

export const nextReference = async (field, prefix) => {
  const pattern = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
  const latest = await Payment.findOne({ [field]: pattern }).sort({ [field]: -1 }).lean();
  const tail = parseInt(String(latest?.[field] || '').split('-').pop(), 10);
  return `${prefix}${Number.isFinite(tail) ? tail + 1 : 1001}`;
};

const findAccountCart = async (user, req) => {
  const own = await Cart.findOne({ 'account.userId': user._id }).sort({ updatedAt: -1 });
  if (own) return own;

  const sessionId = String(req.headers['x-session-id'] || '').trim();
  if (!sessionId) return null;

  const bySession = await Cart.findOne({ sessionId });
  const sameAccount =
    String(bySession?.account?.email || '').toLowerCase() === String(user.email || '').toLowerCase();
  return sameAccount ? bySession : null;
};

const createAccountPayment = async ({
  user,
  customer,
  method,
  total,
  label,
  lines = [],
  contractId = '',
  salesPerson = '',
  subtotal = null,
  gst = null,
  gstBasis = ''
}) => {
  const year = new Date().getFullYear();
  const invoiceNumber = await nextReference('invoiceNumber', `INV-${year}-`);
  const paymentId = await nextReference('paymentId', `PAY-${year}-`);
  const amountText = inr(total);
  const accountName = customer?.company || user.company || customer?.name || user.name || user.email || '';
  const splitKnown = subtotal !== null && gst !== null;

  return Payment.create({
    paymentId,
    invoiceNumber,
    customer: customer?.name || accountName,
    company: accountName,
    email: user.email || customer?.email || '',
    customerId: user.customerId || customer?.customerId || '',
    amount: amountText,
    receivedAmount: amountText,
    pendingPayment: '₹0',
    paymentMethod: method,
    invoiceDate: todayIso(),
    paymentReceivedDate: todayIso(),
    status: 'Received',
    solutionCategory: label,
    contractId,
    items: lines,
    taxableAmount: splitKnown ? inr(subtotal) : '',
    gstAmount: splitKnown ? inr(gst) : '',
    gstBasis,
    salesPerson,
    source: 'portal',
    raisedBy: {
      name: user?.name || customer?.name || '',
      email: user?.email || '',
      role: user?.role || 'customer'
    }
  });
};

const notifyPaymentReceived = (user, customer, payment) =>
  logNotification({
    type: 'payment_received',
    title: 'Payment Received',
    message: `${payment.amount} received from ${payment.company} via ${payment.paymentMethod}.`,
    severity: 'success',
    entityType: 'payment',
    entityId: payment.invoiceNumber,
    user: {
      name: customer?.name || user.name,
      email: user.email,
      role: user.role,
      company: payment.company
    },
    metadata: { invoiceNumber: payment.invoiceNumber, source: 'customer_portal' }
  });

// A row is settled for the balance the portal showed the customer, which is
// the stored pending amount and falls back to amount minus what is received.
const outstandingOf = (payment) => {
  const pending = parseAmount(payment.pendingPayment);
  const received = parseAmount(payment.receivedAmount);
  return pending || Math.max(parseAmount(payment.amount) - received, 0);
};

const isOpenRow = (payment) =>
  !PAID_STATUSES.has(String(payment.status || '').toLowerCase()) && outstandingOf(payment) > 0;

const findScopedPayment = (scope, reference) =>
  Payment.findOne({
    $and: [
      scope,
      { $or: [{ invoiceNumber: reference }, { invoiceRef: reference }, { paymentId: reference }] }
    ]
  });

const settleRow = async ({ payment, user, customer, method }) => {
  if (!isOpenRow(payment)) return { settled: false, outstanding: 0 };

  const outstanding = outstandingOf(payment);

  payment.status = 'Received';
  payment.receivedAmount = inr(parseAmount(payment.receivedAmount) + outstanding);
  payment.pendingPayment = '₹0';
  payment.paymentReceivedDate = todayIso();
  if (!payment.paymentMethod) payment.paymentMethod = method;
  await payment.save();

  await notifyPaymentReceived(user, customer, payment);
  return { settled: true, outstanding };
};

const checkoutError = (statusCode, message) => Object.assign(new Error(message), { statusCode });

/* ── Account scope ────────────────────────────────────────────────────────
   Payments and contracts name the customer as free text, so every row that
   matches any identity value of this login belongs to it. Both the direct
   checkout and the gateway checkout settle inside this scope.
───────────────────────────────────────────────────────────────────────── */
export const buildAccountScope = async (user) => {
  const customer = await findAccountRecord(user);
  const identity = collectIdentityValues(user, customer);

  if (!identity.length) {
    throw checkoutError(
      400,
      'This login is not linked to a NISPL account yet, so payments cannot be recorded.'
    );
  }

  return { customer, scope: buildIdentityMatch(identity) };
};

/* ── Quote ────────────────────────────────────────────────────────────────
   Prices what the account owes right now. Every rupee comes from the
   database; the request body only selects which flow to price, never how
   much to charge. The snapshot it returns is exactly what settlePortalCharge
   later writes, so a payment gateway can quote first, take the money second,
   and still land the same amount on the ledger.
───────────────────────────────────────────────────────────────────────── */
export const quotePortalCharge = async ({ user, req, body = {}, scope }) => {
  const invoiceNumber = String(body.invoiceNumber || '').trim();
  const contractId = String(body.contractId || '').trim();
  const settleAll = Boolean(body.settleAll);

  // 1. A single open invoice already on this account.
  if (invoiceNumber) {
    const payment = await findScopedPayment(scope, invoiceNumber);
    if (!payment) throw checkoutError(404, 'That invoice is not on your account.');

    const settled = isOpenRow(payment);
    return {
      mode: 'invoice',
      label: `Invoice ${payment.invoiceNumber}`,
      amount: settled ? outstandingOf(payment) : 0,
      alreadySettled: !settled,
      snapshot: { invoiceNumber: payment.invoiceNumber }
    };
  }

  // 2. Every open invoice on the account in one transaction.
  if (settleAll) {
    const rows = await Payment.find({
      $and: [scope, { status: { $regex: '^(pending|overdue|unpaid)$', $options: 'i' } }]
    });
    const open = rows.filter(isOpenRow);

    if (!open.length) throw checkoutError(400, 'No invoice on your account is open right now.');

    return {
      mode: 'dues',
      label: `${open.length} open invoice${open.length === 1 ? '' : 's'}`,
      amount: open.reduce((sum, row) => sum + outstandingOf(row), 0),
      alreadySettled: false,
      snapshot: { invoiceNumbers: open.map((row) => row.invoiceNumber) }
    };
  }

  // 3. A subscription renewal the account holds.
  if (contractId) {
    const contract = await Contract.findOne({
      $and: [scope, { $or: [{ contractId }, { id: contractId }] }]
    }).lean();

    if (!contract) throw checkoutError(404, 'That subscription is not on your account.');

    const total = parseAmount(contract.value || contract.totalContractValue);
    if (!total) {
      throw checkoutError(400, 'The renewal value is not recorded, so it cannot be paid online yet.');
    }

    const label = await resolveDisplayName(contract.name || contract.service, 'Subscription renewal');
    const product = await findCatalogueRow(
      contract.productId || contract.name || contract.service || contract.productCategory
    );

    // A renewal is billed as one lump sum, so the taxable head is derived from
    // it at the same 18% the cart uses. gstBasis records that the split was
    // calculated here rather than quoted line by line.
    const taxable = roundMoney(total / (1 + GST_RATE));
    const gstAmount = total - taxable;
    const line = buildReceiptLine(
      {
        productId: contract.productId,
        name: label,
        sku: contract.productId,
        category: contract.productCategory,
        basePrice: taxable,
        quantity: 1,
        billingCycle: contract.subscriptionPeriod
      },
      product
    );

    return {
      mode: 'renewal',
      label,
      amount: total,
      alreadySettled: false,
      snapshot: {
        contractId: contract.contractId || contract.id || contractId,
        total,
        subtotal: taxable,
        gst: gstAmount,
        lines: [line],
        gstBasis: `Renewal value taken as GST-inclusive and split at ${GST_RATE * 100}%`,
        salesPerson: contract.salesPerson || ''
      }
    };
  }

  // 4. The account's own cart.
  const cart = await findAccountCart(user, req);
  if (!cart || !cart.items.length) throw checkoutError(400, 'Your cart is empty.');

  const lines = await Promise.all(
    cart.items.map(async (item) => {
      // A subscription line keeps its own catalogue id, because the cart line id
      // is unique per purchase so two terms of one plan stay two separate lines.
      const product = await findCatalogueRow(item.planId || item.productId || item.sku || item.name);
      const line = buildReceiptLine(item, product);
      if (!product) line.name = await resolveDisplayName(item.name, 'Plan');
      return line;
    })
  );

  if (lines.some((line) => line.basePrice <= 0)) {
    throw checkoutError(
      400,
      'One of the cart items has no price recorded. Contact support to complete this payment.'
    );
  }

  const subtotal = lines.reduce((sum, line) => sum + line.basePrice * line.quantity, 0);
  const gst = roundMoney(subtotal * GST_RATE);
  const total = subtotal + gst;
  // Whoever sold the plan is entered on the order form, so the first
  // named sales person on the cart is the one credited for the payment.
  const salesPerson = cart.items.map((item) => item.salesPerson).find(Boolean) || '';

  return {
    mode: 'cart',
    label: lines.length === 1 ? lines[0].name : `${lines[0].name} + ${lines.length - 1} more`,
    amount: total,
    alreadySettled: false,
    snapshot: {
      cartId: String(cart._id),
      lines,
      subtotal,
      gst,
      total,
      salesPerson,
      gstBasis: `GST added at ${GST_RATE * 100}% on the quoted subtotal`
    }
  };
};

/* ── Settle ───────────────────────────────────────────────────────────────
   Writes a quote onto the ledger. Rows already marked paid are reported as
   settled rather than paid twice, so a retry after a slow gateway response
   never duplicates income.
───────────────────────────────────────────────────────────────────────── */
export const settlePortalCharge = async ({ user, customer, scope, quote, method }) => {
  // The label lives on the quote itself: a gateway intent persists the snapshot
  // separately, so reading it from there would lose what was sold.
  const { mode, label, snapshot } = quote;

  if (mode === 'invoice') {
    const payment = await findScopedPayment(scope, snapshot.invoiceNumber);
    if (!payment) throw checkoutError(404, 'That invoice is not on your account.');

    const { settled, outstanding } = await settleRow({ payment, user, customer, method });

    return {
      statusCode: 200,
      data: {
        alreadySettled: !settled,
        payment: await mapPayment(payment.toObject()),
        totals: { total: settled ? outstanding : 0 }
      }
    };
  }

  if (mode === 'dues') {
    const settledPayments = [];
    let total = 0;

    for (const reference of snapshot.invoiceNumbers) {
      const payment = await findScopedPayment(scope, reference);
      if (!payment) continue;

      const { settled, outstanding } = await settleRow({ payment, user, customer, method });
      if (!settled) continue;

      total += outstanding;
      settledPayments.push(await mapPayment(payment.toObject()));
    }

    if (!settledPayments.length) {
      throw checkoutError(400, 'No invoice on your account is open right now.');
    }

    return {
      statusCode: 200,
      data: {
        alreadySettled: false,
        payments: settledPayments,
        payment: settledPayments[0],
        totals: { subtotal: total, gst: 0, total, lines: [] }
      }
    };
  }

  if (mode === 'renewal') {
    const created = await createAccountPayment({
      user,
      customer,
      method,
      total: snapshot.total,
      label,
      lines: snapshot.lines,
      contractId: snapshot.contractId,
      salesPerson: snapshot.salesPerson,
      subtotal: snapshot.subtotal,
      gst: snapshot.gst,
      gstBasis: snapshot.gstBasis
    });
    await notifyPaymentReceived(user, customer, created);

    return {
      statusCode: 201,
      data: {
        payment: await mapPayment(created.toObject()),
        totals: {
          subtotal: snapshot.subtotal,
          gst: snapshot.gst,
          total: snapshot.total,
          lines: snapshot.lines
        }
      }
    };
  }

  const created = await createAccountPayment({
    user,
    customer,
    method,
    total: snapshot.total,
    label,
    lines: snapshot.lines,
    salesPerson: snapshot.salesPerson || '',
    subtotal: snapshot.subtotal,
    gst: snapshot.gst,
    gstBasis: snapshot.gstBasis
  });

  const cart = await Cart.findById(snapshot.cartId);
  if (cart) {
    cart.items = [];
    cart.markModified('items');
    await cart.save();
  }

  await notifyPaymentReceived(user, customer, created);

  // Verified money moves the account to InProgress; provisioning below moves
  // it on to Active once the subscription contract is actually raised.
  await refreshCustomerLifecycle({
    customerId: user.customerId || customer?.customerId,
    email: user.email || customer?.email,
    company: customer?.company || user.company
  });

  // What the customer just bought is now a subscription the business owes them,
  // so the contract register is written from the same receipt the ledger holds.
  const contracts = await provisionContractsForPayment({
    payment: created,
    user,
    customer,
    lines: snapshot.lines
  });

  return {
    statusCode: 201,
    data: {
      payment: await mapPayment(created.toObject()),
      contracts,
      totals: {
        subtotal: snapshot.subtotal,
        gst: snapshot.gst,
        total: snapshot.total,
        lines: snapshot.lines
      }
    }
  };
};

export const payPortalDues = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res
        .status(503)
        .json({ success: false, error: 'Payments need the ledger database, which is offline right now.' });
    }

    const user = req.user;
    const { customer, scope } = await buildAccountScope(user);
    const method = String(req.body?.method || '').trim().slice(0, 60) || 'Online Banking';

    const quote = await quotePortalCharge({ user, req, body: req.body, scope });
    const { statusCode, data } = await settlePortalCharge({ user, customer, scope, quote, method });

    res.status(statusCode).json({ success: true, data });
  } catch (err) {
    console.error('Error recording customer payment:', err);
    const status = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
    res.status(status).json({ success: false, error: err.message });
  }
};

export const activateCustomerDemo = async (req, res) => {
  try {
    const user = req.user || {};
    const customer = await findAccountRecord(user);
    const targetEmail = (req.body?.customerEmail || user?.email || customer?.email || '').trim();

    if (!targetEmail) {
      return res.status(400).json({
        success: false,
        error: 'Customer email is required to activate a demo.'
      });
    }

    const planName = String(req.body?.planName || 'Demo Trial').trim();
    const duration = String(req.body?.duration || '7 Days').trim();
    const startDate = String(req.body?.startDate || isoDate(new Date())).trim();
    const endDate = String(req.body?.endDate || '').trim();
    const salesPerson = String(req.body?.salesPerson || 'Online Customer Portal').trim();
    const productId = String(req.body?.productId || 'demo-plan').trim();

    // Derive end date if missing
    let effectiveEndDate = endDate;
    if (!effectiveEndDate) {
      const start = toDate(startDate) || new Date();
      const end = new Date(start.getTime());
      const dur = duration.toLowerCase();
      if (dur.includes('day')) {
        const days = parseInt(dur.replace(/[^0-9]/g, ''), 10) || 7;
        end.setDate(end.getDate() + days);
      } else if (dur.includes('week')) {
        const weeks = parseInt(dur.replace(/[^0-9]/g, ''), 10) || 1;
        end.setDate(end.getDate() + weeks * 7);
      } else if (dur.includes('year')) {
        const years = parseInt(dur.replace(/[^0-9]/g, ''), 10) || 1;
        end.setFullYear(end.getFullYear() + years);
      } else {
        const months = parseInt(dur.replace(/[^0-9]/g, ''), 10) || 1;
        end.setMonth(end.getMonth() + months);
      }
      effectiveEndDate = isoDate(end);
    }

    let targetCustomer = customer;
    if (isMongoConnected()) {
      targetCustomer =
        (await Customer.findOne({ email: new RegExp(`^${targetEmail}$`, 'i') })) ||
        (await Customer.findOne({
          $or: [{ email: targetEmail }, { customerId: targetEmail }]
        })) ||
        customer;
    }

    // Single demo plan policy: Check if customer has already used a demo trial once
    let existingTrial = null;
    if (isMongoConnected()) {
      existingTrial = await Contract.findOne({
        $and: [
          {
            $or: [
              { email: new RegExp(`^${targetEmail}$`, 'i') },
              { customer: targetEmail },
              { accountName: targetEmail }
            ]
          },
          {
            $or: [
              { contractType: 'Trial' },
              { productCategory: 'Trial' },
              { isDemoTrial: true }
            ]
          }
        ]
      });
    }

    const trialAlreadyUsed = Boolean(existingTrial || targetCustomer?.demoTrialUsed);

    if (trialAlreadyUsed) {
      // Check if admin has authorized an extension for this specific customer
      const isExtensionAllowed = Boolean(
        targetCustomer?.demoExtensionAllowed || existingTrial?.extensionAllowed
      );

      if (!isExtensionAllowed) {
        return res.status(403).json({
          success: false,
          trialAlreadyUsed: true,
          error:
            'You have already used your free demo trial once. Extensions are only permitted if an administrator authorizes additional trial days for your account. Please contact NISPL support.'
        });
      }

      // Admin has authorized an extension!
      const additionalDays =
        Number(targetCustomer?.demoExtensionDays || existingTrial?.extensionDays) || 7;

      const baseDate =
        existingTrial?.expiryDate && new Date(existingTrial.expiryDate) > new Date()
          ? new Date(existingTrial.expiryDate)
          : new Date();
      baseDate.setDate(baseDate.getDate() + additionalDays);
      const extendedEndDate = isoDate(baseDate);

      if (existingTrial && isMongoConnected()) {
        existingTrial.endDate = extendedEndDate;
        existingTrial.expiryDate = extendedEndDate;
        // An extension adds trial days; it is not a purchase, so the contract
        // stays a demo until a payment settles.
        existingTrial.status = 'DEMO';
        existingTrial.extensionAllowed = false; // consume authorization
        existingTrial.extensionDays = 0;
        existingTrial.description = `Demo trial extended by administrator authorization until ${extendedEndDate} (+${additionalDays} days).`;
        await existingTrial.save();
        await syncContractToCrm(existingTrial);
      }

      if (targetCustomer && isMongoConnected()) {
        targetCustomer.demoExtensionAllowed = false;
        targetCustomer.demoExtensionDays = 0;
        targetCustomer.plan = `${planName} (Trial Extended)`;
        await targetCustomer.save();
      }

      await logNotification({
        type: 'demo_extended',
        title: 'Demo Plan Extended',
        message: `Demo trial extended for ${targetEmail} until ${extendedEndDate} with administrator authorization (+${additionalDays} days).`,
        severity: 'success',
        entityType: 'contract',
        entityId: existingTrial?.contractId || 'CTR-DEMO',
        metadata: { email: targetEmail, extendedEndDate, additionalDays }
      });

      return res.status(200).json({
        success: true,
        message: `Demo trial successfully extended until ${extendedEndDate} with administrator authorization!`,
        data: existingTrial || { expiryDate: extendedEndDate, status: 'DEMO' }
      });
    }

    const contractId = `CTR-DEMO-${Math.floor(1000 + Math.random() * 9000)}`;
    const effectiveCompany = targetCustomer?.company || targetCustomer?.name || customer?.company || customer?.name || 'demo';
    const effectiveCustomer = targetCustomer?.name || targetCustomer?.company || customer?.name || customer?.company || 'demo';

    const newContractData = {
      contractId,
      id: contractId,
      name: planName,
      service: planName,
      company: effectiveCompany,
      customer: effectiveCustomer,
      accountName: effectiveCompany,
      email: targetEmail,
      customerId: targetCustomer?.customerId || customer?.customerId || '',
      // Links the trial to the company's Sangam account, the same way a contract
      // raised by an admin or by a paid order is linked.
      accountId: crmRecordId(targetCustomer?.sangamCrm?.recordId),
      contractType: 'Trial',
      subscriptionPeriod: duration,
      productCategory: 'Trial',
      isDemoTrial: true,
      trialUsed: true,
      extensionAllowed: false,
      extensionDays: 0,
      totalContractValue: '₹0',
      value: '₹0',
      startDate,
      endDate: effectiveEndDate,
      expiryDate: effectiveEndDate,
      status: 'DEMO',
      slaTier: 'Demo Trial 99.99%',
      description: `Active ${planName} trial for ${duration} (valid until ${effectiveEndDate}).`,
      productId,
      salesPerson,
      // A self-served trial is raised by the account holder, not by an admin.
      createdBy: {
        name: effectiveCustomer,
        email: targetEmail || '',
        role: 'customer'
      },
      createdAt: new Date().toISOString()
    };

    let savedContract = newContractData;
    if (isMongoConnected()) {
      savedContract = await Contract.create(newContractData);
      if (targetCustomer) {
        await Customer.findOneAndUpdate(
          { _id: targetCustomer._id },
          {
            $set: {
              plan: `${planName} (Trial)`,
              demoTrialUsed: true,
              demoExtensionAllowed: false,
              demoExtensionDays: 0
            }
          }
        );
      }
    }

    try {
      const fileCustomers = getCustomersFromFile();
      const updatedCusts = fileCustomers.map((fc) => {
        if (fc.email === targetEmail || (targetCustomer && fc.customerId === targetCustomer.customerId)) {
          return {
            ...fc,
            plan: `${planName} (Trial)`,
            demoTrialUsed: true
          };
        }
        return fc;
      });
      saveCustomersToFile(updatedCusts);
    } catch (e) {
      console.warn('Could not save customer status to file:', e.message);
    }

    // The trial contract now exists, so the derived lifecycle is Demo — unless
    // a paid subscription is already live, which must never be downgraded.
    await refreshCustomerLifecycle({
      customerId: targetCustomer?.customerId || customer?.customerId,
      email: targetEmail,
      company: effectiveCompany
    });

    try {
      const existing = getContractsFromFile();
      saveContractsToFile([newContractData, ...existing]);
    } catch (e) {
      console.warn('Could not save contract to file:', e.message);
    }

    // A self-served trial is a contract like any other, so it reaches Sangam
    // without an admin having to press Retry CRM Sync on it.
    savedContract = await syncContractToCrm(savedContract);

    await logNotification({
      type: 'demo_activated',
      title: 'Demo Plan Activated',
      message: `${planName} demo activated for ${targetEmail} (${duration}). Valid until ${effectiveEndDate}.`,
      severity: 'success',
      entityType: 'contract',
      entityId: contractId,
      metadata: newContractData
    });

    res.status(201).json({
      success: true,
      message: `Demo trial for ${planName} activated until ${effectiveEndDate}!`,
      data: savedContract
    });
  } catch (err) {
    console.error('Error activating customer demo:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
