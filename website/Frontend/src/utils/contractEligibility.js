/**
 * Contract Eligibility & 15-day Cut-off Utilities for Frontend
 * Business Timezone: Asia/Kolkata (+05:30)
 */

export const BUSINESS_TIMEZONE = 'Asia/Kolkata';

export const RESTRICTION_MESSAGE =
  'Additional product purchases are unavailable during the last 15 days of your current contract. Please renew your existing contract to add more products.';

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

export const parseDateOnly = (val) => {
  if (!val) return null;
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return null;
  return getKolkataDateString(d);
};

export const subtractCalendarDays = (isoDateStr, days = 15) => {
  const dateOnly = parseDateOnly(isoDateStr);
  if (!dateOnly) return null;
  const [y, m, d] = dateOnly.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
};

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

  const explicitPrimary = nonDemoContracts.find((c) => Boolean(c.isPrimary || c.isPrimaryContract));
  if (explicitPrimary) return explicitPrimary;

  const childParentIds = new Set(
    nonDemoContracts.map((c) => c.parentContractId || c.primaryContractId).filter(Boolean)
  );
  if (childParentIds.size > 0) {
    const parent = nonDemoContracts.find((c) =>
      childParentIds.has(c.contractId) || childParentIds.has(c.id) || childParentIds.has(c._id)
    );
    if (parent) return parent;
  }

  const standalone = nonDemoContracts.filter(
    (c) => !c.isAdditionalContract && !c.parentContractId && !c.primaryContractId
  );
  const candidates = standalone.length > 0 ? standalone : nonDemoContracts;

  // Prefer standard long-term contracts over temporary daily custom plans
  const regularTermPool = candidates.filter((c) => !(c.subscriptionPeriod && /day/i.test(c.subscriptionPeriod)));
  const pool = regularTermPool.length > 0 ? regularTermPool : candidates;

  // Business Rule: The customer's FIRST purchased product is the Primary Contract that determines Master Expiry Date!
  // Sort candidates by earliest start date (when subscription began) so the initial contract defines the primary relationship
  return [...pool].sort((a, b) => {
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

export const checkClientAdditionalProductEligibility = ({
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
  const cutOffDate = subtractCalendarDays(masterExpiryDate, 15);
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
      primaryContract: activeContract,
      masterExpiryDate,
      cutOffDate,
      lastEligibleDate,
      daysUntilExpiry,
      daysUntilCutOff,
      restrictionMessage: RESTRICTION_MESSAGE
    };
  }

  if (today >= cutOffDate) {
    return {
      eligible: false,
      reason: 'restricted_period',
      isRestricted: true,
      isExpired: false,
      message: RESTRICTION_MESSAGE,
      primaryContract: activeContract,
      masterExpiryDate,
      cutOffDate,
      lastEligibleDate,
      daysUntilExpiry,
      daysUntilCutOff,
      restrictionMessage: RESTRICTION_MESSAGE
    };
  }

  return {
    eligible: true,
    reason: 'active_allowed',
    isRestricted: false,
    isExpired: false,
    message: 'Eligible for additional product purchase.',
    primaryContract: activeContract,
    masterExpiryDate,
    cutOffDate,
    lastEligibleDate,
    daysUntilExpiry,
    daysUntilCutOff,
    restrictionMessage: RESTRICTION_MESSAGE
  };
};
