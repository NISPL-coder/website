import User from '../models/User.js';
import Session from '../models/Session.js';
import { HttpError } from '../utils/httpError.js';
import { normalizePermissions } from '../middleware/permission.js';
import { logActivity } from '../utils/activityLogger.js';
import { logNotification } from '../services/notificationService.js';
import { redactRecords } from '../utils/columnPermissions.js';

/**
 * List all administrative and support staff members
 */
export async function listStaff(req, res) {
  // Query all users with administrative or staff roles
  let staffList = await User.find({
    role: { $in: ['admin', 'manager', 'support'] }
  }).sort({ createdAt: 1 });

  // If no user is marked as primary admin yet, mark the earliest admin
  const hasPrimary = staffList.some(u => u.isPrimaryAdmin);
  if (!hasPrimary && staffList.length > 0) {
    const primaryCandidate = staffList.find(u => u.role === 'admin') || staffList[0];
    primaryCandidate.isPrimaryAdmin = true;
    await primaryCandidate.save();
  }

  // Reload to reflect any primary admin flag update (latest staff first)
  staffList = await User.find({
    role: { $in: ['admin', 'manager', 'support'] }
  }).sort({ createdAt: -1 });

  const formatted = redactRecords(req.user, 'user_access', staffList.map(u => ({
    id: u._id.toString(),
    _id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.accountStatus,
    isPrimaryAdmin: Boolean(u.isPrimaryAdmin),
    permissions: u.permissions || [],
    designation: u.designation || '',
    tier: u.tier || '',
    lastLoginAt: u.lastLoginAt,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt
  })));

  res.json({
    success: true,
    count: formatted.length,
    staff: formatted
  });
}

/**
 * Create a new staff account (Admin, Manager, Support)
 */
export async function createStaff(req, res) {
  const {
    name,
    email,
    password,
    role = 'support',
    status = 'active',
    permissions = [],
    designation = ''
  } = req.body;

  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanRole = String(role || 'support').toLowerCase();
  const cleanStatus = status === 'inactive' ? 'inactive' : 'active';

  if (!cleanName) throw new HttpError(400, 'Staff name is required.');
  if (!cleanEmail) throw new HttpError(400, 'Staff email is required.');
  if (!password || String(password).length < 6) {
    throw new HttpError(400, 'Password must be at least 6 characters.');
  }
  if (!['admin', 'manager', 'support'].includes(cleanRole)) {
    throw new HttpError(400, 'Role must be Admin, Manager, or Support.');
  }

  const existing = await User.findOne({ email: cleanEmail });
  if (existing) {
    throw new HttpError(409, `An account with email "${cleanEmail}" already exists.`);
  }

  const newStaff = await User.create({
    name: cleanName,
    email: cleanEmail,
    password: String(password),
    role: cleanRole,
    accountStatus: cleanStatus,
    permissions: normalizePermissions(permissions),
    designation: String(designation || '').trim(),
    createdBy: req.user?._id || null,
    isPrimaryAdmin: false
  });

  // Record audit log
  await logActivity(req, {
    action: 'CREATE_STAFF',
    category: 'staff',
    resource: 'Staff',
    resourceId: newStaff.email,
    details: `Created new ${cleanRole} account "${cleanName}" (${cleanEmail})`,
    changes: {
      staffId: newStaff._id.toString(),
      name: cleanName,
      email: cleanEmail,
      role: cleanRole,
      status: cleanStatus,
      permissions: newStaff.permissions,
      assignedBy: req.user?.name || 'Primary Admin'
    }
  });

  // Push administrative notification
  await logNotification({
    type: 'admin_created',
    title: `New Staff Member Added: ${cleanName}`,
    message: `${req.user?.name || 'Primary Admin'} added ${cleanName} as ${cleanRole.toUpperCase()} with ${cleanStatus} status.`,
    severity: 'info',
    entityType: 'admin',
    entityId: newStaff._id.toString(),
    user: {
      name: cleanName,
      email: cleanEmail,
      role: cleanRole
    },
    metadata: {
      staffId: newStaff._id.toString(),
      role: cleanRole,
      status: cleanStatus
    }
  });

  res.status(201).json({
    success: true,
    message: `Staff member "${cleanName}" created successfully.`,
    staff: newStaff.toSafeJSON()
  });
}

/**
 * Toggle staff active/inactive status
 */
export async function toggleStaffStatus(req, res) {
  const { id } = req.params;
  const staff = await User.findById(id);
  if (!staff) throw new HttpError(404, 'Staff member not found.');

  // Prevent primary admin from deactivating themselves
  if (staff._id.toString() === req.user?._id.toString() && staff.accountStatus === 'active') {
    throw new HttpError(400, 'You cannot deactivate your own administrative account.');
  }
  if (staff.isPrimaryAdmin) {
    throw new HttpError(400, 'The primary administrator account cannot be deactivated.');
  }

  const previousStatus = staff.accountStatus;
  const nextStatus = req.body.status
    ? (req.body.status === 'active' ? 'active' : 'inactive')
    : (staff.accountStatus === 'active' ? 'inactive' : 'active');

  staff.accountStatus = nextStatus;
  await staff.save();

  if (nextStatus !== 'active') {
    await Session.updateMany({ user: staff._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  }

  await logActivity(req, {
    action: 'TOGGLE_STAFF_STATUS',
    category: 'staff',
    resource: 'Staff',
    resourceId: staff.email,
    details: `Changed staff "${staff.name}" status from ${previousStatus} to ${nextStatus}`,
    changes: {
      staffId: staff._id.toString(),
      name: staff.name,
      email: staff.email,
      previousStatus,
      newStatus: nextStatus
    }
  });

  res.json({
    success: true,
    message: `Staff member "${staff.name}" is now ${nextStatus}.`,
    staff: staff.toSafeJSON()
  });
}

/**
 * Grant access & update role/permissions for an assigned staff
 */
export async function updateStaffPermissions(req, res) {
  const { id } = req.params;
  const { role, permissions, designation } = req.body;

  const staff = await User.findById(id);
  if (!staff) throw new HttpError(404, 'Staff member not found.');

  const previousState = {
    role: staff.role,
    permissions: [...(staff.permissions || [])],
    designation: staff.designation || ''
  };

  if (role) {
    if (!['admin', 'manager', 'support'].includes(role.toLowerCase())) {
      throw new HttpError(400, 'Role must be Admin, Manager, or Support.');
    }
    // Prevent changing role of primary admin
    if (staff.isPrimaryAdmin && role.toLowerCase() !== 'admin') {
      throw new HttpError(400, 'Primary administrator role cannot be altered.');
    }
    staff.role = role.toLowerCase();
  }

  if (Array.isArray(permissions)) {
    staff.permissions = normalizePermissions(permissions);
  }

  if (designation !== undefined) {
    staff.designation = String(designation).trim();
  }

  await staff.save();

  await logActivity(req, {
    action: 'UPDATE_STAFF_PERMISSIONS',
    category: 'staff',
    resource: 'Staff',
    resourceId: staff.email,
    details: `Updated permissions and access grant for staff "${staff.name}"`,
    changes: {
      staffId: staff._id.toString(),
      name: staff.name,
      email: staff.email,
      before: previousState,
      after: {
        role: staff.role,
        permissions: staff.permissions,
        designation: staff.designation
      }
    }
  });

  res.json({
    success: true,
    message: `Access and permissions updated for "${staff.name}".`,
    staff: staff.toSafeJSON()
  });
}

/**
 * Delete a staff member account
 */
export async function deleteStaff(req, res) {
  const { id } = req.params;
  const staff = await User.findById(id);
  if (!staff) throw new HttpError(404, 'Staff member not found.');

  if (staff._id.toString() === req.user?._id.toString()) {
    throw new HttpError(400, 'You cannot delete your own account.');
  }

  if (staff.isPrimaryAdmin) {
    throw new HttpError(400, 'Primary administrator account cannot be deleted.');
  }

  await Session.deleteMany({ user: staff._id });
  await User.findByIdAndDelete(id);

  await logActivity(req, {
    action: 'DELETE_STAFF',
    category: 'staff',
    resource: 'Staff',
    resourceId: staff.email,
    details: `Deleted staff member "${staff.name}" (${staff.email})`,
    changes: {
      deletedStaff: {
        id: staff._id.toString(),
        name: staff.name,
        email: staff.email,
        role: staff.role
      }
    }
  });

  res.json({
    success: true,
    message: `Staff member "${staff.name}" deleted successfully.`
  });
}
