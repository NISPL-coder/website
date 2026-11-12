import mongoose from 'mongoose';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Customer, { getCustomersFromFile, saveCustomersToFile } from '../models/Customer.js';
import { HttpError } from '../utils/httpError.js';
import { logActivity } from '../utils/activityLogger.js';

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

export async function getOwnProfile(req, res) {
  const safeUser = req.user.toSafeJSON();

  // If customer, merge latest Customer record details (company, gstNo, address, etc.)
  if (req.user.role === 'customer' || req.user.customerId) {
    let customerDoc = null;
    const custId = req.user.customerId;
    const email = req.user.email;

    if (isMongoConnected()) {
      if (custId) {
        customerDoc = await Customer.findOne({ customerId: custId }).lean();
      }
      if (!customerDoc && email) {
        customerDoc = await Customer.findOne({ email }).lean();
      }
    }

    if (!customerDoc) {
      const fileList = getCustomersFromFile();
      customerDoc = fileList.find((c) => (custId && c.customerId === custId) || (email && c.email === email));
    }

    if (customerDoc) {
      safeUser.company = customerDoc.company || safeUser.company || '';
      safeUser.gstNo = customerDoc.gstNo || safeUser.gstNo || '';
      safeUser.designation = customerDoc.designation || safeUser.designation || '';
      safeUser.phone = customerDoc.phone || safeUser.phone || '';
      safeUser.additionalEmails = Array.isArray(customerDoc.additionalEmails) && customerDoc.additionalEmails.length > 0
        ? customerDoc.additionalEmails
        : safeUser.additionalEmails || [];
      safeUser.additionalPhones = Array.isArray(customerDoc.additionalPhones) && customerDoc.additionalPhones.length > 0
        ? customerDoc.additionalPhones
        : (customerDoc.alternatePhone ? [customerDoc.alternatePhone] : safeUser.additionalPhones || []);
      safeUser.address = customerDoc.address || safeUser.address || null;
      if (customerDoc.customerId && !safeUser.customerId) {
        safeUser.customerId = customerDoc.customerId;
      }
    }
  }

  res.json({ success: true, user: safeUser });
}

export async function updateOwnProfile(req, res) {
  const user = await User.findById(req.user._id);
  if (!user) throw new HttpError(404, 'User not found.');

  const {
    name,
    phone,
    additionalEmails,
    additionalPhones,
    company,
    gstNo,
    designation,
    address,
    avatar,
    companyLogo
  } = req.body;

  if (name !== undefined) {
    const cleanName = String(name).trim();
    if (!cleanName) throw new HttpError(400, 'Name cannot be empty.');
    user.name = cleanName;
  }

  if (phone !== undefined) {
    const digitsOnly = String(phone).replace(/\D/g, '');
    if (digitsOnly && digitsOnly.length !== 10) {
      throw new HttpError(400, `Primary phone number must be exactly 10 digits (received ${digitsOnly.length} digits).`);
    }
    user.phone = digitsOnly;
  }

  // Validate and sanitize additional emails (cannot contain primary login email)
  let cleanAdditionalEmails = undefined;
  if (additionalEmails !== undefined) {
    if (!Array.isArray(additionalEmails)) {
      throw new HttpError(400, 'additionalEmails must be an array of email strings.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    cleanAdditionalEmails = [];
    for (const em of additionalEmails) {
      const trimmed = String(em || '').trim().toLowerCase();
      if (!trimmed) continue;
      if (!emailRegex.test(trimmed)) {
        throw new HttpError(400, `Invalid email address format: "${trimmed}"`);
      }
      if (trimmed === user.email.toLowerCase()) {
        continue; // primary email already handles login, ignore duplicate
      }
      if (!cleanAdditionalEmails.includes(trimmed)) {
        cleanAdditionalEmails.push(trimmed);
      }
    }
    user.additionalEmails = cleanAdditionalEmails;
  }

  // Validate and sanitize additional phones (must be 10 digits)
  let cleanAdditionalPhones = undefined;
  if (additionalPhones !== undefined) {
    if (!Array.isArray(additionalPhones)) {
      throw new HttpError(400, 'additionalPhones must be an array of phone strings.');
    }
    cleanAdditionalPhones = [];
    for (const ph of additionalPhones) {
      const digitsOnly = String(ph || '').replace(/\D/g, '');
      if (!digitsOnly) continue;
      if (digitsOnly.length !== 10) {
        throw new HttpError(400, `Secondary phone number "${ph}" must be exactly 10 digits (received ${digitsOnly.length} digits).`);
      }
      if (!cleanAdditionalPhones.includes(digitsOnly)) {
        cleanAdditionalPhones.push(digitsOnly);
      }
    }
    user.additionalPhones = cleanAdditionalPhones;
  }

  if (company !== undefined) user.company = String(company).trim();
  if (gstNo !== undefined) user.gstNo = String(gstNo).trim().toUpperCase();
  if (designation !== undefined) user.designation = String(designation).trim();
  if (avatar !== undefined) {
    user.avatar = String(avatar).trim();
    user.companyLogo = String(avatar).trim();
  } else if (companyLogo !== undefined) {
    user.avatar = String(companyLogo).trim();
    user.companyLogo = String(companyLogo).trim();
  }

  await user.save();

  // If customer, also synchronize changes with Customer collection and local customers.json
  let updatedCustomerDoc = null;
  const custId = user.customerId;
  const primaryEmail = user.email;

  const customerUpdates = {};
  if (user.name) customerUpdates.name = user.name;
  if (user.phone) customerUpdates.phone = user.phone;
  if (user.avatar) {
    customerUpdates.avatar = user.avatar;
    customerUpdates.companyLogo = user.companyLogo;
  }
  if (cleanAdditionalEmails !== undefined) customerUpdates.additionalEmails = cleanAdditionalEmails;
  if (cleanAdditionalPhones !== undefined) {
    customerUpdates.additionalPhones = cleanAdditionalPhones;
    customerUpdates.alternatePhone = cleanAdditionalPhones[0] || '';
  }
  if (company !== undefined) customerUpdates.company = String(company).trim();
  if (gstNo !== undefined) customerUpdates.gstNo = String(gstNo).trim().toUpperCase();
  if (designation !== undefined) customerUpdates.designation = String(designation).trim();
  if (address && typeof address === 'object') customerUpdates.address = address;

  if (Object.keys(customerUpdates).length > 0) {
    const custQuery = custId ? { customerId: custId } : { email: primaryEmail };

    if (isMongoConnected()) {
      updatedCustomerDoc = await Customer.findOneAndUpdate(
        custQuery,
        { $set: customerUpdates },
        { new: true }
      ).lean();
    }

    const fileList = getCustomersFromFile();
    const idx = fileList.findIndex((c) => (custId && c.customerId === custId) || (primaryEmail && c.email === primaryEmail));
    if (idx !== -1) {
      fileList[idx] = { ...fileList[idx], ...customerUpdates, updatedAt: new Date().toISOString() };
      saveCustomersToFile(fileList);
      if (!updatedCustomerDoc) updatedCustomerDoc = fileList[idx];
    }
  }

  const safeUser = user.toSafeJSON();
  if (updatedCustomerDoc) {
    safeUser.company = updatedCustomerDoc.company || safeUser.company || '';
    safeUser.gstNo = updatedCustomerDoc.gstNo || safeUser.gstNo || '';
    safeUser.additionalEmails = updatedCustomerDoc.additionalEmails || safeUser.additionalEmails || [];
    safeUser.additionalPhones = updatedCustomerDoc.additionalPhones || safeUser.additionalPhones || [];
    safeUser.phone = updatedCustomerDoc.phone || safeUser.phone || '';
    safeUser.address = updatedCustomerDoc.address || null;
  }

  await logActivity(req, {
    action: 'PROFILE_UPDATED',
    category: 'auth',
    resource: 'User',
    resourceId: user.email,
    details: `${user.name} (${user.role.toUpperCase()}) updated profile information`,
    changes: {
      name: user.name,
      additionalEmails: user.additionalEmails,
      additionalPhones: user.additionalPhones,
      phone: user.phone
    }
  });

  res.json({
    success: true,
    message: 'Profile updated successfully.',
    user: safeUser
  });
}

export async function listUsers(req, res) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const filter = {};
  if (req.query.role && ['admin', 'partner', 'customer'].includes(req.query.role)) filter.role = req.query.role;
  if (req.query.status && ['active', 'inactive', 'suspended'].includes(req.query.status)) filter.accountStatus = req.query.status;
  if (req.query.search) {
    const term = String(req.query.search).trim();
    filter.$or = [
      { name: { $regex: term, $options: 'i' } },
      { email: { $regex: term, $options: 'i' } },
      { customerId: { $regex: term, $options: 'i' } }
    ];
  }
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter)
  ]);
  res.json({ success: true, data: users.map(u => u.toSafeJSON()), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

export async function createUser(req, res) {
  const data = req.body;
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new HttpError(409, 'An account with this email address already exists.');
  const user = await User.create(data);
  res.status(201).json({ success: true, message: 'User created successfully.', user: user.toSafeJSON() });
}

export async function updateUser(req, res) {
  const allowed = ['name', 'designation', 'tier', 'permissions', 'securityLevel', 'location', 'accountStatus'];
  const updates = {};
  for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];
  if (updates.accountStatus && !['active', 'inactive', 'suspended'].includes(updates.accountStatus)) {
    throw new HttpError(400, 'Invalid account status.');
  }
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!user) throw new HttpError(404, 'User not found.');
  if (user.accountStatus !== 'active') {
    await Session.updateMany({ user: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  }
  res.json({ success: true, message: 'User updated successfully.', user: user.toSafeJSON() });
}

export async function changeOwnPassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) throw new HttpError(400, 'Current password is incorrect.');
  if (String(newPassword || '').length < 10) throw new HttpError(400, 'New password must contain at least 10 characters.');
  user.password = newPassword;
  await user.save();
  await Session.updateMany({ user: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });

  await logActivity(req, {
    action: 'PASSWORD_UPDATED',
    category: 'auth',
    resource: 'UserAccess',
    resourceId: user.email,
    details: `${user.name} (${user.role.toUpperCase()}) updated their password`,
    changes: {
      adminId: user._id.toString(),
      email: user.email,
      timestamp: new Date()
    }
  });

  res.json({ success: true, message: 'Password updated. Please sign in again.' });
}
