import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  customerId: { type: String, unique: true, sparse: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'partner', 'customer'], required: true, index: true },
  accountStatus: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active', index: true },
  tier: { type: String, default: null, trim: true },
  designation: { type: String, default: null, trim: true },
  permissions: { type: [String], default: [] },
  securityLevel: { type: String, default: null, trim: true },
  location: { type: String, default: null, trim: true },
  passwordResetTokenHash: { type: String, select: false },
  passwordResetExpiresAt: { type: Date, select: false },
  lastLoginAt: { type: Date, default: null }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, env.BCRYPT_ROUNDS);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    customerId: this.customerId || null,
    role: this.role,
    accountStatus: this.accountStatus,
    tier: this.tier,
    designation: this.designation || null,
    permissions: this.permissions,
    securityLevel: this.securityLevel,
    location: this.location,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

userSchema.statics.findByEmailOrCustomerId = function (identifier) {
  const value = String(identifier || '').trim();
  return this.findOne({
    $or: [
      { email: value.toLowerCase() },
      { customerId: value }
    ]
  }).select('+password');
};

userSchema.statics.makeCustomerId = function () {
  return `NIS-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
};

export default mongoose.model('User', userSchema);
