import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import { logNotification } from '../services/notificationService.js';
import { verifyAccessToken } from '../utils/tokens.js';
import User from '../models/User.js';

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
            email: String(user.email || '').toLowerCase(),
            trusted: true
          };
        }
      }
    }
  } catch {
    // ignore token decode issues
  }

  const headerRole = req.headers['x-user-role'];
  if (headerRole) return { role: String(headerRole).toLowerCase(), email: '', trusted: false };

  const queryRole = req.query.role;
  if (queryRole) return { role: String(queryRole).toLowerCase(), email: '', trusted: false };

  return { role: 'anonymous', email: '', trusted: false };
}

const escapeForRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Build dynamic database query filter based on the user's role
 */
function buildRoleFilter(caller) {
  const { role, email, trusted } = caller;

  // Full visibility needs a verified admin session, never a role header alone.
  if (role === 'admin') return trusted ? {} : { type: { $in: [] } };

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
 * Fetch live dynamic notifications with strict role-based isolation
 */
export const getNotifications = async (req, res) => {
  const caller = await resolveCaller(req);
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
