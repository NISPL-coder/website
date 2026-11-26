import { DEFAULT_OVERDUE_POLICY, normalizeOverduePolicy } from '../models/BillingSettings.js';

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/**
 * Calculate overdue charges for an overdue invoice or subscription renewal.
 *
 * Supported methods:
 *  1. 'interest': (baseAmount * annualInterestRate * overdueDays) / 36500
 *  2. 'fixed':    Tiered fixed penalty by overdue days (e.g. 1-15: 250, 16-30: 500, >30: 1000)
 *  3. 'monthly':  baseAmount * (monthlyRate / 100) * Math.ceil(overdueDays / 30)
 */
export const calculateOverdueCharge = (baseAmount, overdueDays, policyInput = DEFAULT_OVERDUE_POLICY) => {
  const base = Math.max(0, Number(baseAmount) || 0);
  const days = Math.max(0, Math.floor(Number(overdueDays) || 0));
  const policy = normalizeOverduePolicy(policyInput);

  if (!policy.enabled || base <= 0 || days <= 0) {
    return {
      overdueDays: days,
      baseAmount: round2(base),
      overdueCharge: 0,
      totalAmount: round2(base),
      method: policy.method,
      breakdownLabel: null
    };
  }

  let overdueCharge = 0;
  let breakdownLabel = null;

  if (policy.method === 'interest') {
    const rate = policy.annualInterestRate;
    overdueCharge = round2((base * rate * days) / 36500);
    breakdownLabel = `${rate}% p.a. × ${days} day${days === 1 ? '' : 's'}`;
  } else if (policy.method === 'fixed') {
    const tiers = policy.fixedTiers;
    const matched =
      tiers.find((t) => days >= t.minDays && (t.maxDays === null || days <= t.maxDays)) ||
      tiers[tiers.length - 1];
    overdueCharge = round2(matched?.fee || 0);
    breakdownLabel = `Fixed late fee (${days} day${days === 1 ? '' : 's'} overdue)`;
  } else if (policy.method === 'monthly') {
    const rate = policy.monthlyRate;
    const months = Math.max(1, Math.ceil(days / 30));
    overdueCharge = round2(base * (rate / 100) * months);
    breakdownLabel = `${rate}%/mo × ${months} month${months === 1 ? '' : 's'}`;
  }

  return {
    overdueDays: days,
    baseAmount: round2(base),
    overdueCharge,
    totalAmount: round2(base + overdueCharge),
    method: policy.method,
    breakdownLabel
  };
};
