import { getContractsFromFile } from '../models/Contract.js';
import mongoose from 'mongoose';
import Contract from '../models/Contract.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * Standard business timezone is Asia/Kolkata (+05:30)
 */
export const BUSINESS_TIMEZONE = 'Asia/Kolkata';

export const RESTRICTION_MESSAGE =
  'Additional product purchases are unavailable during the last 15 days of your current contract. Please renew your existing contract to add more products.';

/**
 * Format any date or timestamp into YYYY-MM-DD in Asia/Kolkata timezone
 */
export const getKolkataDateString = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);
};

/**
 * Parse an ISO date or date string into consistent YYYY-MM-DD date-only format
 */
export const parseDateOnly = (val) => {
  if (!val) return null;
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return null;
  return getKolkataDateString(d);
};

/**
 * Subtract calendar days from a YYYY-MM-DD string
 */
export const subtractCalendarDays = (isoDateStr, days = 15) => {
  const dateOnly = parseDateOnly(isoDateStr);
  if (!dateOnly) return null;
  const [y, m, d] = dateOnly.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
};

export const calculateCutOffDate = (masterExpiryDate, days = 15) => subtractCalendarDays(masterExpiryDate, days);
export const calculateLastEligibleDate = (masterExpiryDate, days = 16) => subtractCalendarDays(masterExpiryDate, days);

/**
 * Calculate difference in calendar days between two dates
 */
export const getCalendarDayDifference = (targetDateStr, fromDateStr = getKolkataDateString()) => {
  const t = parseDateOnly(targetDateStr);
  const f = parseDateOnly(fromDateStr);
  if (!t || !f) return null;
  const [ty, tm, td] = t.split('-').map(Number);
  const [fy, fm, fd] = f.split('-').map(Number);
  const utcTarget = Date.UTC(ty, tm - 1, td);
  const utcFrom = Date.UTC(fy, fm - 1, fd);
  return Math.round((utcTarget - utcFrom) / 86400000);
};

/**
 * Identifies the Primary Contract for a customer from a list of contracts
 */
export const findPrimaryContract = (contracts = []) => {
  if (!Array.isArray(contracts) || contracts.length === 0) return null;

  const isDemo = (c) => Boolean(
    c.isDemoTrial ||
    c.contractType === 'Trial' ||
    c.productCategory === 'Trial' ||
    c.category === 'Trial' ||
    String(c.status || '').toUpperCase() === 'DEMO' ||
    String(c.status || '').toUpperCase() === 'DEMO-INACTIVE' ||
    /demo|trial/i.test(c.name || '')
  );

  const nonDemoContracts = contracts.filter((c) => !isDemo(c));
  if (nonDemoContracts.length === 0) return null;

  // 1. Explicitly designated primary contract
  const explicitPrimary = nonDemoContracts.find((c) => Boolean(c.isPrimary || c.isPrimaryContract));
  if (explicitPrimary) return explicitPrimary;

  // 2. Contracts that act as a parent for other additional products
  const childParentIds = new Set(
    nonDemoContracts.map((c) => c.parentContractId || c.primaryContractId).filter(Boolean)
  );
  if (childParentIds.size > 0) {
    const parent = nonDemoContracts.find((c) =>
      childParentIds.has(c.contractId) || childParentIds.has(c.id) || childParentIds.has(c._id)
    );
    if (parent) return parent;
  }

  // 3. Contracts that are standalone subscriptions (not an additional product themselves)
  const standalone = nonDemoContracts.filter(
    (c) => !c.isAdditionalContract && !c.parentContractId && !c.primaryContractId
  );
  const candidates = standalone.length > 0 ? standalone : nonDemoContracts;

  // Prefer active/confirmed contracts over inactive/closed
  const activeCandidates = candidates.filter((c) => {
    const s = String(c.status || '').toLowerCase().trim();
    return ['active', 'in progress', 'inprogress', 'confirmed', 'live'].includes(s) || c.paymentStatus === 'Yes';
  });

  const pool = activeCandidates.length > 0 ? activeCandidates : candidates;

  // Prefer standard long-term contracts over temporary daily custom plans
  const regularTermPool = pool.filter((c) => !(c.subscriptionPeriod && /day/i.test(c.subscriptionPeriod)));
  const finalPool = regularTermPool.length > 0 ? regularTermPool : pool;

  // Business Rule: The customer's FIRST purchased product is the Primary Contract that determines Master Expiry Date!
  // Sort candidates by earliest start date (when subscription began) so the initial contract defines the primary relationship
  return [...finalPool].sort((a, b) => {
    const startA = a.startDate || a.createdAt || '';
    const startB = b.startDate || b.createdAt || '';
    if (startA && startB && startA !== startB) {
      return startA.localeCompare(startB);
    }
    const expA = a.expiryDate || a.endDate || '';
    const expB = b.expiryDate || b.endDate || '';
    return expA.localeCompare(expB);
  })[0] || null;
};

/**
 * Centralized Validation Function for Additional Product Purchase Eligibility
 *
 * Rules:
 * - Additional product purchases must be disabled during the final 15 calendar days before the Expiry Date.
 * - Current date on or after cut-off date (Master Expiry - 15 days) -> Blocked.
 * - Contract expired -> Blocked until contract renewal.
 * - Current date before cut-off date -> Allowed.
 */
export const checkAdditionalProductEligibility = ({
  primaryContract = null,
  contracts = [],
  currentDate = getKolkataDateString()
} = {}) => {
  const activeContract = primaryContract || findPrimaryContract(contracts);

  if (!activeContract) {
    return {
      eligible: false,
      reason: 'no_active_contract',
      isRestricted: false,
      isExpired: false,
      message: 'No active primary contract found. An active contract is required to add additional products.',
      primaryContract: null,
      masterExpiryDate: null,
      cutOffDate: null,
      lastEligibleDate: null,
      daysUntilExpiry: null,
      daysUntilCutOff: null,
      restrictionMessage: RESTRICTION_MESSAGE
    };
  }

  const masterExpiryDate = parseDateOnly(activeContract.expiryDate || activeContract.endDate);
  if (!masterExpiryDate) {
    return {
      eligible: false,
      reason: 'invalid_expiry',
      isRestricted: false,
      isExpired: false,
      message: 'Primary contract does not have a valid expiry date.',
      primaryContract: activeContract,
      masterExpiryDate: null,
      cutOffDate: null,
      lastEligibleDate: null,
      daysUntilExpiry: null,
      daysUntilCutOff: null,
      restrictionMessage: RESTRICTION_MESSAGE
    };
  }

  const today = parseDateOnly(currentDate) || getKolkataDateString();
  // Cut-off date: 15 calendar days before Expiry Date (e.g. 2026-12-31 - 15 days = 2026-12-16)
  const cutOffDate = subtractCalendarDays(masterExpiryDate, 15);
  // Last eligible date: the day prior to cut-off (e.g. 2026-12-15)
  const lastEligibleDate = subtractCalendarDays(masterExpiryDate, 16);

  const daysUntilExpiry = getCalendarDayDifference(masterExpiryDate, today);
  const daysUntilCutOff = getCalendarDayDifference(cutOffDate, today);

  const isContractExpired =
    today > masterExpiryDate ||
    daysUntilExpiry < 0 ||
    String(activeContract.status || '').toLowerCase() === 'expired' ||
    Boolean(activeContract.expired);

  if (isContractExpired) {
    return {
      eligible: false,
      reason: 'contract_expired',
      isRestricted: true,
      isExpired: true,
      message: 'Your contract has expired. Additional product purchases are blocked until contract renewal.',
      primaryContract: {
        contractId: activeContract.contractId || activeContract.id,
        name: activeContract.name,
        startDate: activeContract.startDate,
        expiryDate: masterExpiryDate,
        status: activeContract.status
      },
      masterExpiryDate,
      cutOffDate,
      lastEligibleDate,
      daysUntilExpiry,
      daysUntilCutOff,
      restrictionMessage: RESTRICTION_MESSAGE
    };
  }

  // If current date is on or after the cut-off date (final 15 calendar days)
  if (today >= cutOffDate) {
    return {
      eligible: false,
      reason: 'restricted_period',
      isRestricted: true,
      isExpired: false,
      message: RESTRICTION_MESSAGE,
      primaryContract: {
        contractId: activeContract.contractId || activeContract.id,
        name: activeContract.name,
        startDate: activeContract.startDate,
        expiryDate: masterExpiryDate,
        status: activeContract.status
      },
      masterExpiryDate,
      cutOffDate,
      lastEligibleDate,
      daysUntilExpiry,
      daysUntilCutOff,
      restrictionMessage: RESTRICTION_MESSAGE
    };
  }

  // Allowed: current date is before cut-off date
  return {
    eligible: true,
    reason: 'active_allowed',
    isRestricted: false,
    isExpired: false,
    message: 'Eligible for additional product purchase.',
    primaryContract: {
      contractId: activeContract.contractId || activeContract.id,
      name: activeContract.name,
      startDate: activeContract.startDate,
      expiryDate: masterExpiryDate,
      status: activeContract.status
    },
    masterExpiryDate,
    cutOffDate,
    lastEligibleDate,
    daysUntilExpiry,
    daysUntilCutOff,
    restrictionMessage: RESTRICTION_MESSAGE
  };
};

/**
 * Helper to fetch customer contracts and check eligibility in one call
 */
export const getCustomerContractsAndEligibility = async (user, scope, currentDate) => {
  let contracts = [];
  if (isMongoConnected() && scope) {
    contracts = await Contract.find(scope).lean();
  } else {
    const list = getContractsFromFile();
    const idSet = new Set(
      [user?.email, user?.customerId, user?.company]
        .filter(Boolean)
        .map((s) => String(s).toLowerCase().trim())
    );
    contracts = list.filter((c) =>
      [c.email, c.customerId, c.customer, c.company].some(
        (v) => v && idSet.has(String(v).toLowerCase().trim())
      )
    );
  }

  const primaryContract = findPrimaryContract(contracts);
  const eligibility = checkAdditionalProductEligibility({
    primaryContract,
    contracts,
    currentDate
  });

  return { contracts, primaryContract, eligibility };
};
