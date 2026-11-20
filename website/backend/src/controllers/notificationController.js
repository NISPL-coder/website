import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import { logNotification } from '../services/notificationService.js';
import { verifyAccessToken } from '../utils/tokens.js';
import User from '../models/User.js';
import Customer, { getCustomersFromFile } from '../models/Customer.js';
import Contract, { getContractsFromFile } from '../models/Contract.js';
import Payment, { getPaymentsFromFile } from '../models/Payment.js';

export const MANAGER_ALLOWED_TYPES = [
  'customer_created',
  'customer_updated',
  'customer_registered',
  'customer_query',
  'support_ticket',
  'payment_received',
  'payment_created',
  'payment_due_soon',
  'payment_due',
  'contract_renewal'
];

export const MANAGER_FORBIDDEN_ENTITIES = ['user', 'admin'];

export const SUPPORT_ALLOWED_TYPES = [
  'customer_query',
  'support_ticket',
  'customer_created',
  'customer_updated',
  'payment_due_soon'
];

/** Tabs on the notifications page map to these catalogue types. */
export const NOTIFICATION_CATEGORIES = {
  payment: [
    'payment_received',
    'payment_created',
    'payment_updated',
    'payment_deleted',
    'payment_due_soon',
    'payment_due'
  ],
  customer: [
    'customer_created',
    'customer_updated',
    'customer_deleted',
    'customer_registered',
    'customer_query',
    'support_ticket'
  ],
  contract: ['contract_created', 'contract_updated', 'contract_deleted'],
  renewal: ['contract_renewal', 'payment_due_soon', 'payment_due'],
  product: ['product_created', 'product_updated', 'product_deleted', 'receipt_created'],
  staff: ['admin_created', 'staff_created'],
  system: ['system']
};

/**
 * The type list a caller's role already confines them to, if any. A category or
 * type filter must intersect this, never replace it, or an untrusted caller
 * could widen their own stream by naming a category.
 */
function roleTypeAllowlist(roleFilter) {
  const constraint = roleFilter?.type;
  if (!constraint) return null;
  if (Array.isArray(constraint)) return constraint;
  if (Array.isArray(constraint.$in)) return constraint.$in;
  return [];
}

/**
 * Determine who is calling. The bearer token is the only trusted source, and the
 * email travels with the role because a customer's stream is scoped to their own
 * account — a client-supplied role header alone must never widen it.
 */
async function resolveCaller(req) {
  if (req.user?.role) {
    return {
      role: req.user.role,
      email: String(req.user.email || '').toLowerCase(),
      trusted: true
    };
  }

  const headerEmail = req.headers['x-user-email'] || req.headers['x-customer-email'] || '';
  const queryEmail = req.query.email || req.query.userEmail || '';
  const fallbackEmail = String(headerEmail || queryEmail || '').trim().toLowerCase();

  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token && token !== 'null' && token !== 'undefined') {
      const decoded = verifyAccessToken(token);
      if (decoded?.sub) {
        const user = await User.findById(decoded.sub).select('role email isPrimaryAdmin').lean();
        if (user) {
          return {
            role: user.role,
            email: String(user.email || fallbackEmail || '').toLowerCase(),
            trusted: true
          };
        }
      }
    }
  } catch {
    // ignore token decode issues
  }

  const headerRole = req.headers['x-user-role'];
  if (headerRole) {
    return {
      role: String(headerRole).toLowerCase(),
      email: fallbackEmail,
      trusted: false
    };
  }

  const queryRole = req.query.role;
  if (queryRole) {
    return {
      role: String(queryRole).toLowerCase(),
      email: fallbackEmail,
      trusted: false
    };
  }

  return { role: 'anonymous', email: fallbackEmail, trusted: false };
}

const escapeForRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Build dynamic database query filter based on the user's role
 */
function buildRoleFilter(caller) {
  const { role, email, trusted } = caller;

  // Full visibility needs a verified admin session, or local development mode.
  if (role === 'admin') return (trusted || process.env.NODE_ENV !== 'production') ? {} : { type: { $in: [] } };

  if (role === 'manager') {
    return {
      type: { $in: MANAGER_ALLOWED_TYPES },
      entityType: { $nin: MANAGER_FORBIDDEN_ENTITIES }
    };
  }
  if (role === 'support') {
    return {
      type: { $in: SUPPORT_ALLOWED_TYPES },
      entityType: { $nin: MANAGER_FORBIDDEN_ENTITIES }
    };
  }
  // Customers, partners and any unrecognised role only see notices about their own account.
  if (!email) return { type: { $in: [] } };
  return { 'user.email': new RegExp(`^${escapeForRegex(email)}$`, 'i') };
}

/**
 * Translate the page's filters (tab, read state, text, date range) into a Mongo
 * query. Returns false when the caller's role can never match, so the handler
 * answers with an empty page instead of an unfiltered one.
 */
function buildListFilter(caller, query) {
  const filter = { ...buildRoleFilter(caller) };

  const { type, category, read, entityType, search, from, to } = query;
  const allowlist = roleTypeAllowlist(filter);

  let wantedTypes = null;
  if (type && type !== 'all') wantedTypes = [type];
  else if (category && category !== 'all' && NOTIFICATION_CATEGORIES[category]) {
    wantedTypes = [...NOTIFICATION_CATEGORIES[category]];
  }

  if (wantedTypes) {
    const scoped = allowlist ? wantedTypes.filter((t) => allowlist.includes(t)) : wantedTypes;
    if (scoped.length === 0) return { filter: null, caller };
    filter.type = { $in: scoped };
  }

  if (read !== undefined && read !== '' && read !== 'all') {
    filter.read = read === 'true';
  }

  if (entityType) {
    // Manager, support and untrusted callers are capped by type; they must not
    // name a forbidden entity to lift that cap.
    const roleLimited = allowlist !== null;
    if (roleLimited && MANAGER_FORBIDDEN_ENTITIES.includes(entityType)) {
      return { filter: null, caller };
    }
    filter.entityType = entityType;
  }

  const range = {};
  if (from) {
    const fromDate = new Date(from);
    if (!Number.isNaN(fromDate.getTime())) range.$gte = fromDate;
  }
  if (to) {
    // A bare yyyy-mm-dd means "through the end of that day", not midnight.
    const toDate = /^\d{4}-\d{2}-\d{2}$/.test(to)
      ? new Date(`${to}T23:59:59.999Z`)
      : new Date(to);
    if (!Number.isNaN(toDate.getTime())) range.$lte = toDate;
  }
  if (range.$gte || range.$lte) filter.createdAt = range;

  const term = String(search || '').trim();
  if (term) {
    const rx = new RegExp(escapeForRegex(term), 'i');
    filter.$and = [
      {
        $or: [
          { title: rx },
          { message: rx },
          { entityId: rx },
          { 'user.name': rx },
          { 'user.email': rx },
          { 'user.company': rx }
        ]
      }
    ];
  }

  return { filter, caller };
}

function emptyResult(res, caller) {
  return res.json({
    success: true,
    count: 0,
    total: 0,
    page: 1,
    pages: 1,
    limit: 50,
    unreadCount: 0,
    role: caller.role,
    notifications: []
  });
}

/**
 * Dynamically compile customer-centric notifications from the customer's live portal data:
 * - Online purchases pending admin confirmation
 * - Active subscriptions and user allocation
 * - Upcoming renewal / expiry notices
 * - Demo status (active / expired)
 * - Tax invoices ready for download
 * - Email verification state
 * Excludes internal admin audit logs.
 */
export async function buildDynamicCustomerNotifications(caller, query = {}) {
  const targetEmail = String(caller.email || '').trim().toLowerCase();
  if (!targetEmail) return { notifications: [], total: 0, unreadCount: 0 };

  let custDoc = await Customer.findOne({
    $or: [
      { email: targetEmail },
      { loginEmail: targetEmail },
      { email: new RegExp(`^${escapeForRegex(targetEmail)}$`, 'i') }
    ]
  }).lean();

  if (!custDoc) {
    const fileCustomers = getCustomersFromFile();
    custDoc = fileCustomers.find(c =>
      String(c.email || c.loginEmail || '').toLowerCase() === targetEmail
    );
  }

  const custId = custDoc?.customerId || custDoc?._id;
  const custCompany = custDoc?.company;

  const contractMatch = [
    { email: targetEmail },
    { personEmail: targetEmail },
    { 'createdBy.email': targetEmail }
  ];
  if (custId) contractMatch.push({ customerId: custId });
  if (custDoc?.accountId) contractMatch.push({ accountId: custDoc.accountId });
  if (custCompany) contractMatch.push({ company: custCompany });

  let contracts = await Contract.find({ $or: contractMatch }).lean();
  const fileContracts = getContractsFromFile().filter(c =>
    String(c.email || c.personEmail || c.createdBy?.email || '').toLowerCase() === targetEmail ||
    (custId && (c.customerId === custId || c.accountId === custId)) ||
    (custCompany && String(c.company || '').toLowerCase() === String(custCompany).toLowerCase())
  );

  const contractMap = new Map();
  for (const c of [...(contracts || []), ...fileContracts]) {
    const key = c.contractId || c.id || c._id?.toString();
    if (key && !contractMap.has(key)) contractMap.set(key, c);
  }
  contracts = Array.from(contractMap.values());

  const paymentMatch = [
    { email: targetEmail },
    { customerEmail: targetEmail }
  ];
  if (custId) paymentMatch.push({ customerId: custId });
  if (custCompany) paymentMatch.push({ company: custCompany });

  let payments = await Payment.find({ $or: paymentMatch }).sort({ createdAt: -1 }).lean();
  const filePayments = getPaymentsFromFile().filter(p =>
    String(p.email || p.customerEmail || '').toLowerCase() === targetEmail ||
    (custId && p.customerId === custId) ||
    (custCompany && String(p.company || '').toLowerCase() === String(custCompany).toLowerCase())
  );

  const paymentMap = new Map();
  for (const p of [...(payments || []), ...filePayments]) {
    const key = p.paymentInvoiceNumber || p.invoiceNumber || p.receiptNumber || p.paymentId || p._id?.toString();
    if (key && !paymentMap.has(key)) paymentMap.set(key, p);
  }
  payments = Array.from(paymentMap.values()).sort((a, b) => new Date(b.createdAt || b.paymentDate || 0) - new Date(a.createdAt || a.paymentDate || 0));

  const notifUser = {
    name: custDoc?.name || custDoc?.customer || custDoc?.company || 'Customer',
    email: targetEmail,
    company: custCompany || ''
  };

  const dynamicList = [];
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const isDemo = (c) => {
    const name = String(c?.name || c?.planName || '').toLowerCase();
    const type = String(c?.contractType || '').toLowerCase();
    const cat = String(c?.productCategory || '').toLowerCase();
    return name.includes('demo') || name.includes('trial') || type.includes('demo') || type.includes('trial') || cat.includes('trial');
  };

  // 1. Pending payment confirmation
  const pendingContracts = contracts.filter((c) =>
    c.confirmationStatus === 'Pending' || (c.adminConfirmed === false && c.confirmationStatus !== 'None' && c.confirmationStatus !== 'Confirmed')
  );
  for (const c of pendingContracts) {
    dynamicList.push({
      _id: `dyn_pending_${c.contractId || c._id}`,
      id: `dyn_pending_${c.contractId || c._id}`,
      type: 'payment_received',
      title: 'Payment Received — Confirmation Pending',
      message: `Thank you for your payment of ${c.totalContractValue || c.value || '₹' + c.amount} for ${c.name || 'your plan'}. Services will resume shortly once verified by our team.`,
      severity: 'info',
      entityType: 'payment',
      entityId: c.paymentInvoiceNumber || c.contractId,
      user: notifUser,
      read: false,
      metadata: {
        contractId: c.contractId,
        amount: c.totalContractValue || c.value,
        status: 'Confirmation Pending'
      },
      createdAt: c.createdAt || new Date().toISOString()
    });
  }

  // 2. Active subscriptions
  const activeContracts = contracts.filter((c) => {
    if (isDemo(c)) return false;
    if (c.confirmationStatus === 'Pending' || c.adminConfirmed === false) return false;
    const s = String(c.status || '').toLowerCase().trim();
    if (s !== 'active' && s !== 'in progress' && s !== 'inprogress') return false;
    const end = String(c.endDate || c.expiryDate || '').trim();
    return !end || end >= todayStr;
  });

  for (const c of activeContracts) {
    dynamicList.push({
      _id: `dyn_active_${c.contractId || c._id}`,
      id: `dyn_active_${c.contractId || c._id}`,
      type: 'payment_confirmed',
      title: 'Subscription Active',
      message: `Your ${c.name} subscription is active and running. Valid until ${c.endDate || c.expiryDate}.`,
      severity: 'success',
      entityType: 'contract',
      entityId: c.contractId,
      user: notifUser,
      read: true,
      metadata: {
        contractId: c.contractId,
        expiryDate: c.endDate || c.expiryDate,
        users: c.users || c.userCount
      },
      createdAt: c.updatedAt || c.startDate || c.createdAt
    });

    // 3. Upcoming renewals within 30 days
    const end = c.endDate || c.expiryDate;
    if (end) {
      const expDate = new Date(end);
      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      if (diffDays >= 0 && diffDays <= 30) {
        dynamicList.push({
          _id: `dyn_renewal_${c.contractId || c._id}`,
          id: `dyn_renewal_${c.contractId || c._id}`,
          type: 'contract_renewal',
          title: diffDays <= 5 ? 'Subscription Expiring Soon' : 'Subscription Renewal Due',
          message: `Your ${c.name} subscription is due for renewal on ${end} (in ${diffDays} days). Renew online in Products.`,
          severity: diffDays <= 5 ? 'warning' : 'info',
          entityType: 'contract',
          entityId: c.contractId,
          user: notifUser,
          read: diffDays > 7,
          metadata: {
            contractId: c.contractId,
            expiryDate: end
          },
          createdAt: c.updatedAt || new Date().toISOString()
        });
      }
    }
  }

  // 4. Demo trial status
  const demoContracts = contracts.filter(isDemo);
  for (const demo of demoContracts) {
    const end = demo.endDate || demo.expiryDate;
    const isExpired = end ? new Date(end).getTime() < today.getTime() : false;
    if (!isExpired && activeContracts.length === 0) {
      dynamicList.push({
        _id: `dyn_demo_${demo.contractId || demo._id}`,
        id: `dyn_demo_${demo.contractId || demo._id}`,
        type: 'contract_created',
        title: 'Free Demo Trial Active',
        message: `Your free trial for ${demo.name} is running until ${end}. Choose a plan in Products to upgrade without interruption.`,
        severity: 'info',
        entityType: 'contract',
        entityId: demo.contractId,
        user: notifUser,
        read: true,
        metadata: { expiryDate: end },
        createdAt: demo.createdAt
      });
    } else if (isExpired && activeContracts.length === 0) {
      dynamicList.push({
        _id: `dyn_demo_exp_${demo.contractId || demo._id}`,
        id: `dyn_demo_exp_${demo.contractId || demo._id}`,
        type: 'payment_due',
        title: 'Demo Trial Expired',
        message: `Your demo trial has ended. Select an active plan from Products to continue cloud services.`,
        severity: 'warning',
        entityType: 'contract',
        entityId: demo.contractId,
        user: notifUser,
        read: false,
        createdAt: demo.endDate || demo.createdAt
      });
    } else if (activeContracts.length > 0) {
      dynamicList.push({
        _id: `dyn_demo_conv_${demo.contractId || demo._id}`,
        id: `dyn_demo_conv_${demo.contractId || demo._id}`,
        type: 'payment_confirmed',
        title: 'Demo Trial Converted',
        message: `Your demo trial has been converted to an active cloud subscription.`,
        severity: 'success',
        entityType: 'contract',
        entityId: demo.contractId,
        user: notifUser,
        read: true,
        metadata: { status: 'Converted' },
        createdAt: demo.updatedAt || demo.createdAt
      });
    }
  }

  // 5. Invoices & Receipts
  const seenInvoices = new Set();
  for (const p of payments) {
    const isSettled = ['settled', 'paid', 'success', 'received', 'yes'].includes(String(p.status || p.paymentStatus || '').toLowerCase());
    const invNum = p.paymentInvoiceNumber || p.receiptNumber || p.invoiceNumber || p.invoiceRef || p.receiptId;
    if (isSettled && invNum && !seenInvoices.has(invNum)) {
      seenInvoices.add(invNum);
      dynamicList.push({
        _id: `dyn_rcpt_${p._id || invNum}`,
        id: `dyn_rcpt_${p._id || invNum}`,
        type: 'payment_received',
        title: 'Tax Invoice Available',
        message: `Tax invoice ${invNum} for ${p.amount || ('₹' + p.totalPaidAmount)} is settled and ready for download in Receipts.`,
        severity: 'success',
        entityType: 'receipt',
        entityId: invNum,
        user: notifUser,
        read: true,
        metadata: {
          amount: p.amount || ('₹' + p.totalPaidAmount),
          method: p.paymentMethod || 'Razorpay',
          invoiceRef: invNum
        },
        createdAt: p.paymentDate || p.createdAt
      });
    }
  }

  // 6. Email verification notice
  if (custDoc && !custDoc.isEmailVerified) {
    dynamicList.push({
      _id: 'dyn_verify_email',
      id: 'dyn_verify_email',
      type: 'customer_updated',
      title: 'Verify Primary Email Address',
      message: `Your email address (${targetEmail}) is not yet verified. Please verify in your Profile to ensure account security.`,
      severity: 'warning',
      entityType: 'customer',
      entityId: custDoc.customerId || '',
      user: notifUser,
      read: false,
      createdAt: custDoc.createdAt || new Date().toISOString()
    });
  }

  // 7. Any customer-targeted notifications in DB (support tickets, custom admin messages to customer)
  const customerAllowedDbTypes = [
    'support_ticket',
    'customer_query',
    'system',
    'email_verified',
    'demo_extended'
  ];
  const dbNotifs = await Notification.find({
    'user.email': new RegExp(`^${escapeForRegex(targetEmail)}$`, 'i'),
    type: { $in: customerAllowedDbTypes }
  }).sort({ createdAt: -1 }).limit(20).lean();

  for (const n of dbNotifs) {
    const exists = dynamicList.some(d => d.entityId && d.entityId === n.entityId && d.type === n.type);
    if (!exists) {
      dynamicList.push({
        ...n,
        _id: n._id.toString(),
        id: n._id.toString()
      });
    }
  }

  // Sort newest first
  dynamicList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  let filtered = dynamicList;
  if (query.type && query.type !== 'all') {
    filtered = filtered.filter(n => n.type === query.type);
  } else if (query.category && query.category !== 'all' && NOTIFICATION_CATEGORIES[query.category]) {
    filtered = filtered.filter(n => NOTIFICATION_CATEGORIES[query.category].includes(n.type));
  }
  if (query.read === 'true') {
    filtered = filtered.filter(n => n.read);
  } else if (query.read === 'false') {
    filtered = filtered.filter(n => !n.read);
  }

  const unreadCount = filtered.filter(n => !n.read).length;

  return {
    notifications: filtered,
    total: filtered.length,
    unreadCount
  };
}

/**
 * Fetch live dynamic notifications with strict role-based isolation
 */
export const getNotifications = async (req, res) => {
  const caller = await resolveCaller(req);

  // For customer role: dynamically generate notifications from their live portal data
  if (caller.role === 'customer') {
    const dyn = await buildDynamicCustomerNotifications(caller, req.query);
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const paged = dyn.notifications.slice((page - 1) * limit, page * limit);
    return res.json({
      success: true,
      count: paged.length,
      total: dyn.total,
      page,
      pages: Math.max(1, Math.ceil(dyn.total / limit)),
      limit,
      unreadCount: dyn.unreadCount,
      role: 'customer',
      notifications: paged
    });
  }

  const { filter } = buildListFilter(caller, req.query);

  if (!filter) return emptyResult(res, caller);

  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const roleFilter = buildRoleFilter(caller);

  const [total, unreadCount, notifications] = await Promise.all([
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...roleFilter, read: false }),
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
  ]);

  res.json({
    success: true,
    count: notifications.length,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    limit,
    unreadCount,
    role: caller.role,
    notifications
  });
};

/**
 * Live counts behind the page's stat cards and filter tabs
 */
export const getNotificationStats = async (req, res) => {
  const caller = await resolveCaller(req);

  if (caller.role === 'customer') {
    const dyn = await buildDynamicCustomerNotifications(caller, {});
    const byCategory = {};
    Object.entries(NOTIFICATION_CATEGORIES).forEach(([name, types]) => {
      byCategory[name] = dyn.notifications.filter(n => types.includes(n.type)).length;
    });
    return res.json({
      success: true,
      role: 'customer',
      stats: { total: dyn.total, unread: dyn.unreadCount, byCategory }
    });
  }

  const roleFilter = buildRoleFilter(caller);
  const allowlist = roleTypeAllowlist(roleFilter);

  const categories = Object.entries(NOTIFICATION_CATEGORIES);
  const counts = await Promise.all(
    categories.map(([, types]) => {
      const scoped = allowlist ? types.filter((t) => allowlist.includes(t)) : types;
      if (scoped.length === 0) return Promise.resolve(0);
      return Notification.countDocuments({ ...roleFilter, type: { $in: scoped } });
    })
  );

  const byCategory = {};
  categories.forEach(([name], index) => {
    byCategory[name] = counts[index];
  });

  const [total, unread] = await Promise.all([
    Notification.countDocuments(roleFilter),
    Notification.countDocuments({ ...roleFilter, read: false })
  ]);

  res.json({
    success: true,
    role: caller.role,
    stats: { total, unread, byCategory }
  });
};

/**
 * One notification, addressed to the caller's role only
 */
export const getNotificationById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ success: false, message: 'Notification not found.' });
  }

  const caller = await resolveCaller(req);
  const roleFilter = buildRoleFilter(caller);

  const notification = await Notification.findOne({ _id: id, ...roleFilter }).lean();
  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found or access denied.'
    });
  }

  res.json({ success: true, notification });
};

/**
 * Create a live dynamic notification (called when payments, customers, contracts, or queries occur)
 */
export const createNotification = async (req, res) => {
  const {
    type,
    title,
    message,
    severity = 'info',
    entityType = 'other',
    entityId = '',
    user = {},
    metadata = {}
  } = req.body;

  if (!title || !message) {
    return res.status(400).json({
      success: false,
      message: 'Title and message are required.'
    });
  }

  // Callers re-raise the same condition on every poll (a payment still due, a
  // contract still expiring), so a known entityId is an idempotency key.
  if (entityId) {
    const existing = await Notification.findOne({ entityId }).lean();
    if (existing) {
      return res.json({ success: true, notification: existing, deduplicated: true });
    }
  }

  const notification = await logNotification({
    type: type || 'system',
    title,
    message,
    severity,
    entityType,
    entityId,
    user,
    metadata
  });

  res.status(201).json({
    success: true,
    notification
  });
};

export const markAsRead = async (req, res) => {
  const { id } = req.params;
  if (String(id).startsWith('dyn_')) {
    return res.json({
      success: true,
      notification: { _id: id, id, read: true, readAt: new Date() },
      unreadCount: 0
    });
  }
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ success: false, message: 'Notification not found.' });
  }

  const caller = await resolveCaller(req);
  const roleFilter = buildRoleFilter(caller);

  const notification = await Notification.findOneAndUpdate(
    { _id: id, ...roleFilter },
    { read: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found or access denied.'
    });
  }

  const unreadCount = await Notification.countDocuments({
    ...roleFilter,
    read: false
  });

  res.json({
    success: true,
    notification,
    unreadCount
  });
};

export const markAsUnread = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ success: false, message: 'Notification not found.' });
  }

  const caller = await resolveCaller(req);
  const roleFilter = buildRoleFilter(caller);

  const notification = await Notification.findOneAndUpdate(
    { _id: id, ...roleFilter },
    { read: false, readAt: null },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found or access denied.'
    });
  }

  const unreadCount = await Notification.countDocuments({
    ...roleFilter,
    read: false
  });

  res.json({ success: true, notification, unreadCount });
};

export const markAllAsRead = async (req, res) => {  const caller = await resolveCaller(req);
  const roleFilter = buildRoleFilter(caller);

  await Notification.updateMany(
    { ...roleFilter, read: false },
    { $set: { read: true, readAt: new Date() } }
  );

  const unreadCount = await Notification.countDocuments({
    ...roleFilter,
    read: false
  });

  res.json({
    success: true,
    message: 'Notifications marked as read.',
    unreadCount
  });
};

export const deleteNotification = async (req, res) => {
  const { id } = req.params;
  if (String(id).startsWith('dyn_')) {
    return res.json({
      success: true,
      message: 'Notification dismissed.',
      unreadCount: 0
    });
  }
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ success: false, message: 'Notification not found.' });
  }

  const caller = await resolveCaller(req);
  const roleFilter = buildRoleFilter(caller);

  const notification = await Notification.findOneAndDelete({
    _id: id,
    ...roleFilter
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found or access denied.'
    });
  }

  const unreadCount = await Notification.countDocuments({
    ...roleFilter,
    read: false
  });

  res.json({
    success: true,
    message: 'Notification deleted.',
    unreadCount
  });
};

export const clearAllNotifications = async (req, res) => {
  const caller = await resolveCaller(req);
  const roleFilter = buildRoleFilter(caller);

  // A wipe of the whole collection is reserved for a token-verified admin, so an
  // unauthenticated or guessed role header can never erase every account's history.
  if (caller.role === 'admin' && caller.trusted) {
    await Notification.deleteMany({});
  } else {
    await Notification.deleteMany(roleFilter);
  }

  res.json({
    success: true,
    message: 'Notifications cleared.',
    unreadCount: 0
  });
};
