import mongoose from 'mongoose';

export const DEFAULT_OVERDUE_POLICY = {
  enabled: true,
  method: 'interest', // 'interest' | 'fixed' | 'monthly'
  annualInterestRate: 18, // % annually -> (amount * rate * days) / 36500
  fixedTiers: [
    { minDays: 1, maxDays: 15, fee: 250 },
    { minDays: 16, maxDays: 30, fee: 500 },
    { minDays: 31, maxDays: null, fee: 1000 }
  ],
  monthlyRate: 2 // % per month on outstanding amount
};

const fixedTierSchema = new mongoose.Schema(
  {
    minDays: { type: Number, required: true, min: 1 },
    maxDays: { type: Number, default: null },
    fee: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const billingSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'default' },
    enabled: { type: Boolean, default: true },
    method: {
      type: String,
      enum: ['interest', 'fixed', 'monthly'],
      default: 'interest'
    },
    annualInterestRate: { type: Number, default: 18, min: 0 },
    fixedTiers: {
      type: [fixedTierSchema],
      default: () => DEFAULT_OVERDUE_POLICY.fixedTiers.map((t) => ({ ...t }))
    },
    monthlyRate: { type: Number, default: 2, min: 0 },
    updatedBy: { type: String, default: '' }
  },
  { timestamps: true }
);

const BillingSettings =
  mongoose.models.BillingSettings || mongoose.model('BillingSettings', billingSettingsSchema);

export const normalizeOverduePolicy = (doc) => {
  const src = doc && typeof doc === 'object' ? doc : {};
  const method = ['interest', 'fixed', 'monthly'].includes(src.method)
    ? src.method
    : DEFAULT_OVERDUE_POLICY.method;

  const annualInterestRate =
    Number.isFinite(Number(src.annualInterestRate)) && Number(src.annualInterestRate) >= 0
      ? Number(src.annualInterestRate)
      : DEFAULT_OVERDUE_POLICY.annualInterestRate;

  const monthlyRate =
    Number.isFinite(Number(src.monthlyRate)) && Number(src.monthlyRate) >= 0
      ? Number(src.monthlyRate)
      : DEFAULT_OVERDUE_POLICY.monthlyRate;

  const rawTiers = Array.isArray(src.fixedTiers) && src.fixedTiers.length > 0
    ? src.fixedTiers
    : DEFAULT_OVERDUE_POLICY.fixedTiers;

  const fixedTiers = rawTiers
    .map((tier) => ({
      minDays: Math.max(1, Math.round(Number(tier.minDays) || 1)),
      maxDays:
        tier.maxDays === null || tier.maxDays === '' || tier.maxDays === undefined
          ? null
          : Math.max(1, Math.round(Number(tier.maxDays))),
      fee: Math.max(0, Number(tier.fee) || 0)
    }))
    .sort((a, b) => a.minDays - b.minDays);

  return {
    enabled: src.enabled !== false,
    method,
    annualInterestRate,
    fixedTiers,
    monthlyRate
  };
};

let cachedPolicy = null;

export const getOverduePolicy = async () => {
  if (mongoose.connection.readyState !== 1) {
    return normalizeOverduePolicy(cachedPolicy || DEFAULT_OVERDUE_POLICY);
  }
  const doc = await BillingSettings.findOne({ key: 'default' }).lean();
  if (!doc) {
    return normalizeOverduePolicy(DEFAULT_OVERDUE_POLICY);
  }
  const normalized = normalizeOverduePolicy(doc);
  cachedPolicy = normalized;
  return normalized;
};

export const saveOverduePolicy = async (updates = {}, updatedBy = '') => {
  const next = normalizeOverduePolicy({ ...(await getOverduePolicy()), ...updates });
  cachedPolicy = next;
  if (mongoose.connection.readyState !== 1) {
    return next;
  }
  const doc = await BillingSettings.findOneAndUpdate(
    { key: 'default' },
    { $set: { ...next, key: 'default', updatedBy } },
    { upsert: true, new: true }
  ).lean();
  return normalizeOverduePolicy(doc);
};

export default BillingSettings;
