import { logNotification } from '../services/notificationService.js';
import crypto from 'node:crypto';
import User from '../models/User.js';
import Session from '../models/Session.js';
import AdminOtp from '../models/AdminOtp.js';
import Customer, { getCustomersFromFile, saveCustomersToFile } from '../models/Customer.js';
import { sangamCrmService } from '../services/sangamCrmService.js';
import { logActivity } from '../utils/activityLogger.js';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';
import { createAccessToken, createRefreshToken, hashToken, verifyRefreshToken } from '../utils/tokens.js';
import { sendPasswordResetEmail, sendAdminOtpEmail } from '../utils/mailer.js';

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}
function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

async function issueSession(user, req, res) {
  const refreshToken = createRefreshToken(user);
  const decoded = verifyRefreshToken(refreshToken);
  await Session.create({
    user: user._id,
    refreshTokenHash: hashToken(refreshToken),
    expiresAt: new Date(decoded.exp * 1000),
    userAgent: req.get('user-agent'),
    ipAddress: req.ip
  });
  res.cookie(env.REFRESH_COOKIE_NAME, refreshToken, cookieOptions());
  return createAccessToken(user);
}

export async function login(req, res) {
  const { identifier, password, portal } = req.body;
  const user = await User.findByEmailOrCustomerId(identifier);

  if (!user || !(await user.comparePassword(password))) {
    throw new HttpError(401, 'Invalid email/account ID or password.');
  }
  if (user.accountStatus !== 'active') throw new HttpError(403, 'Your account is not active. Contact an administrator.');
  const isAdminPortalUser = ['admin', 'manager', 'support'].includes(user.role);
  if (portal === 'admin' ? !isAdminPortalUser : user.role !== portal) {
    throw new HttpError(403, `This account is not authorized for the ${portal} portal.`);
  }

  user.lastLoginAt = new Date();
  await user.save();

  if (['admin', 'manager', 'support'].includes(user.role)) {
    await logActivity(req, {
      action: 'ADMIN_SIGN_IN',
      category: 'auth',
      resource: 'UserAccess',
      resourceId: user.email,
      details: `${user.name} (${user.role.toUpperCase()}) authenticated via email & password`,
      changes: {
        adminId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        portal,
        loginTime: user.lastLoginAt
      },
      adminOverride: user
    });
  }

  const accessToken = await issueSession(user, req, res);
  res.json({ success: true, message: 'Login successful.', accessToken, user: user.toSafeJSON() });
}

export async function registerCustomer(req, res) {
  const {
    name,
    email,
    password,
    company,
    companyName,
    phone,
    mobile,
    gstNo,
    plan,
    address,
    city
  } = req.body;

  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanCompany = String(company || companyName || cleanName).trim();
  const cleanPhone = String(phone || mobile || '').trim() || '9876543210';
  const cleanGst = String(gstNo || '').trim().toUpperCase();
  const cleanPlan = plan || 'Tally Prime Cloud + VPS Gold';

  if (!cleanName) throw new HttpError(400, 'Customer name is required.');
  if (!cleanEmail) throw new HttpError(400, 'Customer email is required.');

  // 1. Check existing account in User and Customer collections
  const existing = await User.findOne({ email: cleanEmail });
  if (existing) throw new HttpError(409, 'An account with this email address already exists.');

  if (isMongoConnected()) {
    const existingCust = await Customer.findOne({
      $or: [{ email: cleanEmail }, { phone: cleanPhone }]
    });
    if (existingCust) {
      throw new HttpError(409, `Customer already exists with email "${cleanEmail}" or phone "${cleanPhone}".`);
    }
  }

  // 2. Unified Customer Identifier
  const customerId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;

  // 3. Create User Login Record
  const user = await User.create({
    name: cleanName,
    email: cleanEmail,
    password,
    role: 'customer',
    customerId,
    accountStatus: 'active'
  });

  // 4. Create and Save Customer Entity in the shared 'customers' collection
  let savedCustomer = {
    customerId,
    id: customerId,
    name: cleanName,
    company: cleanCompany,
    email: cleanEmail,
    phone: cleanPhone,
    gstNo: cleanGst,
    status: 'active',
    registered: new Date().toISOString().split('T')[0],
    plan: cleanPlan,
    serverNode: 'CtrlS-KOL-NODE-01',
    mrr: '₹15,000',
    address: {
      city: address?.city || city || 'Kolkata',
      state: address?.state || 'West Bengal',
      country: address?.country || 'India',
      street: address?.street || '',
      area: address?.area || '',
      postalCode: address?.postalCode || '',
      addressType: address?.addressType || 'Office / Billing'
    },
    sangamCrm: { status: 'pending', recordId: null, lastSyncedAt: null, syncError: null }
  };

  if (isMongoConnected()) {
    const doc = new Customer(savedCustomer);
    await doc.save();
    savedCustomer = doc.toJSON();
  }
  const fileList = getCustomersFromFile();
  saveCustomersToFile([savedCustomer, ...fileList.filter(c => c.customerId !== customerId)]);

  // 5. Automatically Sync to Sangam CRM Companies
  try {
    const sangamResult = await sangamCrmService.createOrUpdateCompany(savedCustomer);
    if (sangamResult.success) {
      savedCustomer.sangamCrm = {
        status: 'synced',
        recordId: sangamResult.recordId,
        lastSyncedAt: new Date().toISOString(),
        syncError: null
      };
      if (isMongoConnected()) {
        await Customer.findByIdAndUpdate(savedCustomer._id, {
          $set: { sangamCrm: savedCustomer.sangamCrm }
        });
      }
    }
  } catch (syncErr) {
    console.warn('[registerCustomer] Sangam CRM sync exception:', syncErr.message);
  }

  const accessToken = await issueSession(user, req, res);
  await logNotification({
    type: 'customer_created',
    title: 'Customer Self-Registration',
    message: `Customer "${cleanName}" (${cleanCompany}) registered online.`,
    severity: 'success',
    entityType: 'customer',
    entityId: customerId,
    user: { name: cleanName, email: cleanEmail, company: cleanCompany },
    metadata: { customerId, plan: cleanPlan }
  });

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    accessToken,
    user: user.toSafeJSON(),
    customer: savedCustomer
  });
}

export async function getMe(req, res) {
  res.json({ success: true, user: req.user.toSafeJSON() });
}

export async function refresh(req, res) {
  const token = req.cookies?.[env.REFRESH_COOKIE_NAME];
  if (!token) throw new HttpError(401, 'Refresh session is missing.');

  let payload;
  try { payload = verifyRefreshToken(token); }
  catch { throw new HttpError(401, 'Refresh session is invalid or expired.'); }
  if (payload.type !== 'refresh') throw new HttpError(401, 'Invalid refresh token.');

  const tokenHash = hashToken(token);
  const session = await Session.findOne({ refreshTokenHash: tokenHash, revokedAt: null });
  if (!session || session.expiresAt <= new Date()) throw new HttpError(401, 'Refresh session has expired.');

  const user = await User.findById(payload.sub);
  if (!user || user.accountStatus !== 'active') throw new HttpError(401, 'Account is unavailable.');

  session.revokedAt = new Date();
  await session.save();
  const accessToken = await issueSession(user, req, res);
  res.json({ success: true, accessToken, user: user.toSafeJSON() });
}

export async function logout(req, res) {
  const token = req.cookies?.[env.REFRESH_COOKIE_NAME];
  if (token) await Session.updateOne({ refreshTokenHash: hashToken(token), revokedAt: null }, { $set: { revokedAt: new Date() } });
  res.clearCookie(env.REFRESH_COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  res.json({ success: true, message: 'Logged out successfully.' });
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  const user = await User.findOne({
    $or: [
      { email: normalizedEmail },
      { customerId: String(email || '').trim().toUpperCase() }
    ]
  }).select('+passwordResetTokenHash +passwordResetExpiresAt');

  let devResetUrl = undefined;

  // Same general response whether the account exists or not, to prevent email enumeration.
  if (user && user.accountStatus === 'active') {
    const rawToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetTokenHash = hashToken(rawToken);
    user.passwordResetExpiresAt = new Date(Date.now() + env.PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000);
    await user.save();

    const resetUrl = `${env.APP_BASE_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (mailErr) {
      console.error('Failed to send password reset email via SMTP:', mailErr.message);
      if (env.NODE_ENV === 'production' && env.SMTP_HOST) {
        throw new HttpError(500, `Email dispatch error: ${mailErr.message}`);
      }
    }

    if (env.NODE_ENV !== 'production') {
      devResetUrl = resetUrl;
    }
  }

  res.json({
    success: true,
    message: 'If an active account exists for that email, password reset instructions have been sent.',
    devResetUrl
  });
}

export async function resetPassword(req, res) {
  const { token, password } = req.body;
  if (!token) throw new HttpError(400, 'Password reset token is required.');
  if (!password || String(password).length < 6) {
    throw new HttpError(400, 'New password must contain at least 6 characters.');
  }

  const user = await User.findOne({
    passwordResetTokenHash: hashToken(token),
    passwordResetExpiresAt: { $gt: new Date() }
  }).select('+password +passwordResetTokenHash +passwordResetExpiresAt');

  if (!user) throw new HttpError(400, 'Reset link is invalid or has expired. Please request a new link.');

  user.password = String(password);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();

  // Revoke all existing sessions
  await Session.updateMany({ user: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });

  res.json({
    success: true,
    message: 'Password has been reset successfully. You can now log in.'
  });
}

export async function getAdminConfig(req, res) {
  const existingAdmin = await User.findOne({ role: 'admin' });
  res.json({
    success: true,
    adminEmail: env.ADMIN_EMAIL,
    adminExists: Boolean(existingAdmin)
  });
}

export async function sendAdminOtp(req, res) {
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) {
    throw new HttpError(400, 'An administrator account already exists. Multiple admin accounts are not permitted.');
  }

  const adminEmail = env.ADMIN_EMAIL;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

  // Clear any existing OTP for this admin email
  await AdminOtp.deleteMany({ email: adminEmail });

  // Store new OTP valid for 10 minutes
  await AdminOtp.create({
    email: adminEmail,
    otpHash,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  });

  try {
    await sendAdminOtpEmail(adminEmail, otp);
  } catch (err) {
    console.error('Failed to send OTP via SMTP:', err);
    throw new HttpError(500, `Email dispatch error: ${err.message}`);
  }

  res.json({
    success: true,
    message: `Verification code sent to ${adminEmail}`,
    devOtp: env.NODE_ENV !== 'production' && (!env.SMTP_HOST || !env.SMTP_USER) ? otp : undefined
  });
}

export async function verifyAndCreateAdmin(req, res) {
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) {
    throw new HttpError(400, 'An administrator account already exists. Multiple admin accounts are not permitted.');
  }

  const { name, designation, password, otp } = req.body;
  const adminEmail = env.ADMIN_EMAIL;

  if (!name || String(name).trim().length < 2) {
    throw new HttpError(400, 'Name is required (at least 2 characters).');
  }
  if (!password || String(password).length < 6) {
    throw new HttpError(400, 'Password is required (at least 6 characters).');
  }
  if (!otp || String(otp).trim().length !== 6) {
    throw new HttpError(400, 'Valid 6-digit verification OTP is required.');
  }

  const otpHash = crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
  const record = await AdminOtp.findOne({
    email: adminEmail,
    otpHash,
    expiresAt: { $gt: new Date() }
  });

  if (!record) {
    throw new HttpError(400, 'Invalid or expired OTP. Please request a new OTP.');
  }

  // Find existing admin user or create a new one
  let user = await User.findOne({ email: adminEmail }).select('+password');
  if (user) {
    user.name = String(name).trim();
    user.designation = designation ? String(designation).trim() : null;
    user.password = String(password);
    user.role = 'admin';
    user.accountStatus = 'active';
    await user.save();
  } else {
    user = await User.create({
      name: String(name).trim(),
      email: adminEmail,
      designation: designation ? String(designation).trim() : null,
      password: String(password),
      role: 'admin',
      accountStatus: 'active'
    });
  }

  // Clear used OTP
  await AdminOtp.deleteMany({ email: adminEmail });

  res.status(201).json({
    success: true,
    message: 'Admin account created successfully! You can now log in.',
    user: user.toSafeJSON()
  });
}
