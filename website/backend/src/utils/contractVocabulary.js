/**
 * Contract vocabulary.
 *
 * The create form, the register, the Sangam CRM payload and the portal all speak
 * from this file. Rows written before the current field set — older contracts,
 * uploaded sheets, portal trials — still carry the previous words, so every
 * reader normalizes instead of comparing, and every writer stores the canonical
 * spelling.
 */

export const CONTRACT_STATUSES = ['Not Started', 'In Progress', 'Closed', 'DEMO', 'DISABLED'];

export const CONTRACT_TYPES = ['Comprehensive', 'Non Comprehensive Rental', 'SHARED', 'DEDICATED'];

// Still readable because existing rows and the portal trial flow carry them.
export const LEGACY_CONTRACT_TYPES = ['Subscription', 'AMC', 'Trial'];

const squash = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, '');

const STATUS_LOOKUP = {
  notstarted: 'Not Started',
  inprogress: 'In Progress',
  closed: 'Closed',
  demo: 'DEMO',
  disabled: 'DISABLED',
  // Previous vocabulary.
  active: 'In Progress',
  signed: 'In Progress',
  expiring: 'In Progress',
  live: 'In Progress',
  draft: 'Not Started',
  pending: 'Not Started',
  inactive: 'Closed',
  expired: 'Closed',
  completed: 'Closed',
  cancelled: 'Closed',
  suspended: 'DISABLED'
};

const TYPE_LOOKUP = CONTRACT_TYPES.reduce(
  (map, type) => ({ ...map, [squash(type)]: type }),
  {
    ...LEGACY_CONTRACT_TYPES.reduce((m, t) => ({ ...m, [squash(t)]: t }), {}),
    noncomprehensive: 'Non Comprehensive Rental',
    noncomprehensiverentals: 'Non Comprehensive Rental'
  }
);

/** 'NotStarted', 'active', 'INACTIVE' → the one spelling the console renders. */
export const normalizeContractStatus = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  return STATUS_LOOKUP[squash(raw)] || raw;
};

/** '' when the word is unknown, so the caller decides the default. */
export const normalizeContractType = (value) => TYPE_LOOKUP[squash(value)] || '';

/**
 * The CRM only classifies a subscription as software, service or hardware, and
 * a rental with support cover is a service engagement.
 */
export const contractTypeCategory = (type) =>
  type === 'AMC' || type === 'Comprehensive' || type === 'Non Comprehensive Rental'
    ? 'Service'
    : 'Software';

/**
 * The term is no longer typed by hand — it is whatever the validity dates say,
 * so the receipt Duration and the CRM subscription_period cannot disagree with
 * the start and end dates printed on the same contract.
 */
export const periodFromDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return '';

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) months -= 1;
  if (months < 1) months = 1;

  if (months % 12 === 0) {
    const years = months / 12;
    return years === 1 ? '1 Year' : `${years} Years`;
  }
  return months === 1 ? '1 Month' : `${months} Months`;
};
