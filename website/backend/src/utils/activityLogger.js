import ActivityLog from '../models/ActivityLog.js';

/**
 * Extracts client IP address accurately from request.
 */
export function getClientIp(req) {
  if (!req) return '127.0.0.1';
  const forwarded = req.headers?.['x-forwarded-for'];
  if (forwarded) {
    const list = String(forwarded).split(',');
    if (list.length > 0 && list[0].trim()) {
      return list[0].trim();
    }
  }
  return req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || '127.0.0.1';
}

/**
 * Logs an administrative action into MongoDB activity_logs collection.
 * Designed to never throw or disrupt the host request.
 */
export async function logActivity(req, {
  action,
  category = 'general',
  resource = '',
  resourceId = '',
  details = '',
  changes = {},
  status = 'success',
  adminOverride = null
} = {}) {
  try {
    const admin = adminOverride || req?.user;
    const ipAddress = getClientIp(req);
    const userAgent = req?.headers?.['user-agent'] || '';

    const entry = await ActivityLog.create({
      adminId: admin?._id || admin?.id || null,
      adminName: admin?.name || 'System Admin',
      adminEmail: (admin?.email || 'admin@nispl.in').toLowerCase(),
      adminRole: admin?.role || 'admin',
      action: String(action || 'GENERAL_ACTION').toUpperCase(),
      category: category || 'general',
      resource: String(resource || ''),
      resourceId: String(resourceId || ''),
      details: String(details || action || 'Administrative activity recorded'),
      ipAddress,
      userAgent,
      status: status || 'success',
      changes: changes || {}
    });

    return entry;
  } catch (err) {
    console.error('Failed to record activity log:', err.message);
    return null;
  }
}

