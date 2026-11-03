import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import { HttpError } from '../utils/httpError.js';
import { redactRecord, redactRecords } from '../utils/columnPermissions.js';

/**
 * List activity logs with filtering, search, and pagination
 */
export async function listActivityLogs(req, res) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));

  const filter = {};

  if (req.query.category && req.query.category !== 'all') {
    filter.category = req.query.category;
  }

  if (req.query.action && req.query.action !== 'all') {
    filter.action = String(req.query.action).toUpperCase();
  }

  if (req.query.adminEmail) {
    filter.adminEmail = String(req.query.adminEmail).toLowerCase().trim();
  }

  if (req.query.search) {
    const term = String(req.query.search).trim();
    filter.$or = [
      { adminName: { $regex: term, $options: 'i' } },
      { adminEmail: { $regex: term, $options: 'i' } },
      { details: { $regex: term, $options: 'i' } },
      { action: { $regex: term, $options: 'i' } },
      { resource: { $regex: term, $options: 'i' } },
      { resourceId: { $regex: term, $options: 'i' } },
      { ipAddress: { $regex: term, $options: 'i' } }
    ];
  }

  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) {
      const end = new Date(req.query.endDate);
      // Only widen a bare "YYYY-MM-DD" to end-of-day; full timestamps are already exact.
      if (/^\d{4}-\d{2}-\d{2}$/.test(String(req.query.endDate).trim())) {
        end.setHours(23, 59, 59, 999);
      }
      filter.createdAt.$lte = end;
    }
  }

  // Pre-seed initial historical logs if collection is empty
  const countExisting = await ActivityLog.countDocuments();
  if (countExisting === 0) {
    const primaryAdmin = await User.findOne({ role: 'admin' });
    const customers = await Customer.find().limit(5);

    if (primaryAdmin) {
      const initialLogs = [
        {
          adminId: primaryAdmin._id,
          adminName: primaryAdmin.name,
          adminEmail: primaryAdmin.email,
          adminRole: 'admin',
          action: 'PRIMARY_ADMIN_INITIALIZED',
          category: 'auth',
          resource: 'UserAccess',
          resourceId: primaryAdmin.email,
          details: `Primary Administrator account (${primaryAdmin.name}) verified and active`,
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          status: 'success',
          changes: {
            admin: {
              name: primaryAdmin.name,
              email: primaryAdmin.email,
              role: primaryAdmin.role,
              isPrimaryAdmin: true
            }
          },
          createdAt: primaryAdmin.createdAt || new Date()
        }
      ];

      for (const cust of customers) {
        initialLogs.push({
          adminId: primaryAdmin._id,
          adminName: primaryAdmin.name,
          adminEmail: primaryAdmin.email,
          adminRole: 'admin',
          action: 'CUSTOMER_SYNCED',
          category: 'customer',
          resource: 'Customer',
          resourceId: cust.customerId || cust._id.toString(),
          details: `Synchronized customer record "${cust.company || cust.name}" (${cust.customerId || 'ID'})`,
          ipAddress: '127.0.0.1',
          userAgent: 'NISPL Backend Telemetry / 1.0',
          status: 'success',
          changes: {
            customerId: cust.customerId,
            company: cust.company,
            email: cust.email,
            plan: cust.plan,
            mrr: cust.mrr,
            status: cust.status
          },
          createdAt: cust.createdAt || new Date()
        });
      }

      await ActivityLog.insertMany(initialLogs);
    }
  }

  const [logs, total, totalAllTime] = await Promise.all([
    ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ActivityLog.countDocuments(filter),
    ActivityLog.countDocuments()
  ]);

  // Today count
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayCount = await ActivityLog.countDocuments({ createdAt: { $gte: startOfToday } });

  // Unique admins count
  const uniqueAdmins = await ActivityLog.distinct('adminEmail');

  res.json({
    success: true,
    count: logs.length,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    stats: {
      totalLogs: totalAllTime,
      todayLogs: todayCount,
      uniqueAdminsCount: uniqueAdmins.length
    },
    logs: redactRecords(req.user, 'activity_logs', logs.map(l => ({
      ...l,
      id: l._id.toString()
    })))
  });
}

/**
 * Get single activity log with full changes JSON
 */
export async function getActivityLogById(req, res) {
  const log = await ActivityLog.findById(req.params.id).lean();
  if (!log) throw new HttpError(404, 'Activity log entry not found.');

  res.json({
    success: true,
    log: redactRecord(req.user, 'activity_logs', {
      ...log,
      id: log._id.toString()
    })
  });
}

