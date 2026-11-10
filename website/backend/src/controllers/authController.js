import { logNotification } from '../services/notificationService.js';
import crypto from 'node:crypto';
import User from '../models/User.js';
import Session from '../models/Session.js';
import AdminOtp from '../models/AdminOtp.js';
import EmailVerificationOtp from '../models/EmailVerificationOtp.js';
import Customer, { getCustomersFromFile, saveCustomersToFile } from '../models/Customer.js';
import { sangamCrmService } from '../services/sangamCrmService.js';
import { logActivity } from '../utils/activityLogger.js';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';
import { createAccessToken, createRefreshToken, hashToken, verifyAccessToken, verifyRefreshToken } from '../utils/tokens.js';
import { sendPasswordResetEmail, sendAdminOtpEmail, sendCustomerVerificationOtpEmail } from '../utils/mailer.js';

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}
function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: '/',
    maxAge: env.SESSION_MAX_SECONDS * 1000
  };
}

async function issueSession(user, req, res, startedAt = new Date()) {
  const refreshToken = createRefreshToken(user);
  const decoded = verifyRefreshToken(refreshToken);
  const session = await Session.create({
    user: user._id,
    refreshTokenHash: hashToken(refreshToken),
    expiresAt: new Date(Math.min(decoded.exp * 1000, startedAt.getTime() + env.SESSION_MAX_SECONDS * 1000)),
    startedAt,
    lastActivityAt: new Date(),
    userAgent: req.get('user-agent'),
    ipAddress: req.ip
  });
  res.cookie(env.REFRESH_COOKIE_NAME, refreshToken, cookieOptions());
  return { accessToken: createAccessToken(user, session._id), session };
}

const sessionPolicy = (session) => ({
  expiresAt: session.expiresAt.toISOString(),
  idleMinutes: env.SESSION_IDLE_MINUTES,
  maxHours: env.SESSION_MAX_SECONDS / 3600
});

export async function login(req, res) {
  const rawIdentifier = req.body.identifier || req.body.email || req.body.username;
  const { password, portal } = req.body;
  const user = await User.findByEmailOrCustomerId(rawIdentifier);

  if (!user || !(await user.comparePassword(password))) {
    throw new HttpError(401, 'Invalid email/account ID or password.');
  }
  if (user.accountStatus !== 'active') throw new HttpError(403, 'Your account is not active. Contact an administrator.');

  const requestedPortal = String(portal || '').trim().toLowerCase();

  // Strict Portal & Role Access Control:
  // 1. Manager accounts can ONLY log in through the Admin Portal
  if (user.role === 'manager') {
    if (requestedPortal && requestedPortal !== 'admin' && requestedPortal !== 'auto') {
      throw new HttpError(403, 'Manager accounts can only log in through the Admin Portal.');
    }
  }

  // 2. Admin Portal: ONLY Admin itself and Manager can log in
  if (requestedPortal === 'admin') {
    const isAllowedInAdminPortal = user.role === 'admin' || user.role === 'manager' || Boolean(user.isPrimaryAdmin);
    if (!isAllowedInAdminPortal) {
      if (user.role === 'customer') {
        throw new HttpError(403, 'Customer accounts cannot log in through the Admin Portal. Please use the Customer Portal to log in.');
      }
      throw new HttpError(403, 'This account is not authorized for the Admin portal. Only Admin and Manager accounts can log in here.');
    }
  }

  // 3. Customer Portal: ONLY Customer accounts can log in
  if (requestedPortal === 'customer') {
    if (user.role !== 'customer') {
      if (user.role === 'manager') {
        throw new HttpError(403, 'Manager accounts can only log in through the Admin Portal.');
      }
      if (user.role === 'admin' || user.isPrimaryAdmin) {
        throw new HttpError(403, 'Admin accounts must log in through the Admin Portal.');
      }
      throw new HttpError(403, 'This account is not authorized for the Customer Portal. Only Customer accounts can log in here.');
    }
  }

  // 4. Partner Portal: ONLY Partner accounts can log in
  if (requestedPortal === 'partner') {
    if (user.role !== 'partner') {
      throw new HttpError(403, 'This account is not authorized for the Partner Portal.');
    }
  }

  const isAdminPortalUser = user.role === 'admin' || user.role === 'manager' || Boolean(user.isPrimaryAdmin);
  let resolvedPortal = requestedPortal && requestedPortal !== 'auto'
    ? requestedPortal
    : (user.role === 'customer' ? 'customer' : (isAdminPortalUser ? 'admin' : user.role));

  user.lastLoginAt = new Date();
  await user.save();

  if (user.role === 'customer' && isMongoConnected()) {
    Customer.findOneAndUpdate(
      { $or: [{ email: user.email }, { customerId: user.customerId }] },
      { $set: { lastLoginAt: user.lastLoginAt } }
    ).catch(() => {});
  }

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
        portal: resolvedPortal,
        loginTime: user.lastLoginAt
      },
      adminOverride: user
    });
  }

  const { accessToken, session } = await issueSession(user, req, res);
  res.json({
    success: true,
    message: 'Login successful.',
    accessToken,
    user: user.toSafeJSON(),
    role: user.role,
    portal: resolvedPortal,
    session: sessionPolicy(session),
    redirect: user.role === 'customer' ? '/customer/overview' : (isAdminPortalUser ? '/admin/overview' : '/partner-dashboard')
  });
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
  const cleanPhone = String(phone || mobile || '').trim();
  const cleanGst = String(gstNo || '').trim().toUpperCase();
  const cleanPlan = String(plan || '').trim();

  if (!cleanName) throw new HttpError(400, 'Customer name is required.');
  if (!cleanEmail) throw new HttpError(400, 'Customer email is required.');
  if (!cleanPhone) throw new HttpError(400, 'Contact mobile number is required.');

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
    phone: cleanPhone,
    password,
    portalPassword: password,
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
    loginEmail: cleanEmail,
    portalPassword: password,
    phone: cleanPhone,
    gstNo: cleanGst,
    // Registration alone proves nothing was taken or bought; the lifecycle
    // moves only on demo activation, settled payment and provisioning.
    status: 'Inactive',
    registered: new Date().toISOString().split('T')[0],
    plan: cleanPlan,
    address: {
      city: address?.city || city || '',
      state: address?.state || '',
      country: address?.country || '',
      street: address?.street || '',
      area: address?.area || '',
      postalCode: address?.postalCode || '',
      addressType: address?.addressType || ''
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

  const { accessToken, session } = await issueSession(user, req, res);
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
    customer: savedCustomer,
    session: sessionPolicy(session)
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
  if (Date.now() - session.lastActivityAt.getTime() > env.SESSION_IDLE_MINUTES * 60 * 1000) {
    throw new HttpError(401, 'You were signed out after a period of inactivity. Please sign in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user || user.accountStatus !== 'active') throw new HttpError(401, 'Account is unavailable.');

  session.revokedAt = new Date();
  await session.save();
  // Rotating the refresh token must not reset the one-day login cap.
  const { accessToken, session: nextSession } = await issueSession(user, req, res, session.startedAt || session.createdAt);
  res.json({ success: true, accessToken, user: user.toSafeJSON(), session: sessionPolicy(nextSession) });
}

export async function logout(req, res) {
  const token = req.cookies?.[env.REFRESH_COOKIE_NAME];
  if (token) await Session.updateOne({ refreshTokenHash: hashToken(token), revokedAt: null }, { $set: { revokedAt: new Date() } });
  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (bearer) {
    try {
      const payload = verifyAccessToken(bearer);
      if (payload?.sid) {
        await Session.updateOne({ _id: payload.sid, revokedAt: null }, { $set: { revokedAt: new Date() } });
      }
    } catch {
      // Expired token on logout: nothing left to revoke.
    }
  }
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

/**
 * In-memory fallback cache for OTPs if Mongo is temporarily disconnected
 */
const fallbackCustomerOtps = new Map();

/**
 * Send 6-digit OTP to customer's primary email address
 */
export async function sendCustomerVerificationOtp(req, res) {
  const targetEmail = String(req.user?.email || req.body?.email || '').trim().toLowerCase();
  if (!targetEmail) {
    throw new HttpError(400, 'Customer primary email address is required.');
  }

  // Find user to ensure existence
  let user = null;
  if (isMongoConnected()) {
    user = await User.findOne({ email: targetEmail });
  } else {
    const fileCustomers = getCustomersFromFile();
    const match = fileCustomers.find((c) => (c.email || '').toLowerCase() === targetEmail);
    if (match) {
      user = { _id: match._id || match.id || 'cust-dev-id', name: match.name, email: targetEmail, isEmailVerified: Boolean(match.isEmailVerified) };
    }
  }

  if (!user && req.user) {
    user = req.user;
  }

  if (!user) {
    throw new HttpError(404, 'Customer account not found for this email address.');
  }

  if (user.isEmailVerified) {
    return res.json({
      success: true,
      alreadyVerified: true,
      message: 'Your primary email is already verified.',
      email: targetEmail
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  if (isMongoConnected()) {
    await EmailVerificationOtp.deleteMany({ email: targetEmail });
    await EmailVerificationOtp.create({
      email: targetEmail,
      userId: user._id,
      otpHash,
      expiresAt
    });
  }

  fallbackCustomerOtps.set(targetEmail, {
    otpHash,
    expiresAt,
    userId: user._id
  });

  try {
    await sendCustomerVerificationOtpEmail(targetEmail, otp, user.name);
  } catch (err) {
    console.error('Failed to send customer verification OTP via SMTP:', err);
    if (env.NODE_ENV === 'production' && env.SMTP_HOST) {
      throw new HttpError(500, `Email dispatch error: ${err.message}`);
    }
  }

  res.json({
    success: true,
    message: `Verification code sent to ${targetEmail}`,
    email: targetEmail,
    devOtp: (!env.SMTP_HOST || !env.SMTP_USER || env.NODE_ENV !== 'production') ? otp : undefined
  });
}

/**
 * Verify 6-digit OTP and mark customer primary email as verified
 */
export async function verifyCustomerEmailOtp(req, res) {
  const targetEmail = String(req.user?.email || req.body?.email || '').trim().toLowerCase();
  const rawOtp = String(req.body?.otp || '').trim();

  if (!targetEmail) {
    throw new HttpError(400, 'Customer primary email address is required.');
  }
  if (!rawOtp || rawOtp.length !== 6) {
    throw new HttpError(400, 'Valid 6-digit verification OTP is required.');
  }

  const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');

  let isValid = false;
  if (isMongoConnected()) {
    const record = await EmailVerificationOtp.findOne({
      email: targetEmail,
      otpHash,
      expiresAt: { $gt: new Date() }
    });
    if (record) {
      isValid = true;
      await EmailVerificationOtp.deleteMany({ email: targetEmail });
    }
  }

  if (!isValid) {
    const fallback = fallbackCustomerOtps.get(targetEmail);
    if (fallback && fallback.otpHash === otpHash && fallback.expiresAt > new Date()) {
      isValid = true;
      fallbackCustomerOtps.delete(targetEmail);
    }
  }

  if (!isValid) {
    throw new HttpError(400, 'Invalid or expired OTP. Please request a new verification code.');
  }

  const verifiedDate = new Date();

  // Update User
  let updatedUser = null;
  if (isMongoConnected()) {
    updatedUser = await User.findOneAndUpdate(
      { email: targetEmail },
      { $set: { isEmailVerified: true, emailVerifiedAt: verifiedDate } },
      { new: true }
    );

    // Update Customer collection
    await Customer.findOneAndUpdate(
      { $or: [{ email: targetEmail }, { loginEmail: targetEmail }] },
      { $set: { isEmailVerified: true, emailVerifiedAt: verifiedDate } }
    ).catch(() => {});
  }

  // Update local file fallback
  try {
    const fileCustomers = getCustomersFromFile();
    const updatedCusts = fileCustomers.map((c) => {
      if (c.email === targetEmail || c.loginEmail === targetEmail) {
        return { ...c, isEmailVerified: true, emailVerifiedAt: verifiedDate.toISOString() };
      }
      return c;
    });
    saveCustomersToFile(updatedCusts);
  } catch (e) {
    console.warn('[verifyCustomerEmailOtp] Error updating file customers:', e.message);
  }

  await logActivity(req, {
    action: 'CUSTOMER_EMAIL_VERIFIED',
    category: 'auth',
    resource: 'User',
    resourceId: targetEmail,
    details: `Customer primary email (${targetEmail}) successfully verified via OTP`,
    changes: {
      email: targetEmail,
      isEmailVerified: true,
      emailVerifiedAt: verifiedDate
    }
  });

  await logNotification({
    type: 'email_verified',
    title: 'Primary Email Verified',
    message: `Customer ${targetEmail} successfully verified their primary email address via OTP.`,
    severity: 'success',
    entityType: 'customer',
    entityId: updatedUser?.customerId || targetEmail
  });

  res.json({
    success: true,
    message: 'Primary email verified successfully!',
    isEmailVerified: true,
    emailVerifiedAt: verifiedDate,
    user: updatedUser ? updatedUser.toSafeJSON() : { email: targetEmail, isEmailVerified: true, emailVerifiedAt: verifiedDate }
  });
}
