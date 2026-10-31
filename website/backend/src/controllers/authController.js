import crypto from 'node:crypto';
import User from '../models/User.js';
import Session from '../models/Session.js';
import AdminOtp from '../models/AdminOtp.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';
import { createAccessToken, createRefreshToken, hashToken, verifyRefreshToken } from '../utils/tokens.js';
import { sendPasswordResetEmail, sendAdminOtpEmail } from '../utils/mailer.js';

function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: '/api/v1/auth',
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
  if (user.role !== portal) throw new HttpError(403, `This account is not authorized for the ${portal} portal.`);

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = await issueSession(user, req, res);
  res.json({ success: true, message: 'Login successful.', accessToken, user: user.toSafeJSON() });
}

export async function registerCustomer(req, res) {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw new HttpError(409, 'An account with this email address already exists.');

  const user = await User.create({
    name, email, password, role: 'customer',
    customerId: User.makeCustomerId(),
    accountStatus: 'active'
  });
  const accessToken = await issueSession(user, req, res);
  res.status(201).json({ success: true, message: 'Account created successfully.', accessToken, user: user.toSafeJSON() });
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
  const user = await User.findOne({ email }).select('+passwordResetTokenHash +passwordResetExpiresAt');
  // Same response whether the account exists or not, to prevent email enumeration.
  if (user && user.accountStatus === 'active') {
    const rawToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetTokenHash = hashToken(rawToken);
    user.passwordResetExpiresAt = new Date(Date.now() + env.PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000);
    await user.save();
    const resetUrl = `${env.APP_BASE_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;
    await sendPasswordResetEmail(user.email, resetUrl);
  }
  res.json({ success: true, message: 'If an active account exists for that email, password reset instructions have been sent.' });
}

export async function resetPassword(req, res) {
  const { token, password } = req.body;
  const user = await User.findOne({
    passwordResetTokenHash: hashToken(token),
    passwordResetExpiresAt: { $gt: new Date() }
  }).select('+password +passwordResetTokenHash +passwordResetExpiresAt');

  if (!user) throw new HttpError(400, 'Reset link is invalid or has expired.');
  user.password = password;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();
  await Session.updateMany({ user: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  res.json({ success: true, message: 'Password has been reset. Please log in again.' });
}

export async function getAdminConfig(req, res) {
  res.json({
    success: true,
    adminEmail: env.ADMIN_EMAIL
  });
}

export async function sendAdminOtp(req, res) {
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
