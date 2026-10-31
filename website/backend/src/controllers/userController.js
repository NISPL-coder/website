import User from '../models/User.js';
import Session from '../models/Session.js';
import { HttpError } from '../utils/httpError.js';

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
  const allowed = ['name', 'tier', 'permissions', 'securityLevel', 'location', 'accountStatus'];
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
  res.json({ success: true, message: 'Password updated. Please sign in again.' });
}
