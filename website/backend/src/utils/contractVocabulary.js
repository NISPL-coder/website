/**
 * Contract vocabulary.
 *
 * The create form, the register, the Sangam CRM payload and the portal all speak
 * from this file. Rows written before the current field set — older contracts,
 * uploaded sheets, portal trials — still carry the previous words, so every
 * reader normalizes instead of comparing, and every writer stores the canonical
 * spelling.
 */

export const CONTRACT_STATUSES = ['Active', 'Inactive', 'DEMO', 'Not Started', 'Closed', 'DISABLED'];

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
  inprogress: 'Active',
  closed: 'Closed',
  converted: 'Active',
  demo: 'DEMO',
  demoinactive: 'Inactive',
  'demo-inactive': 'Inactive',
  disabled: 'DISABLED',
  // Previous vocabulary.
  active: 'Active',
  signed: 'Active',
  expiring: 'Active',
  live: 'Active',
  draft: 'Not Started',
  pending: 'Not Started',
  inactive: 'Inactive',
  expired: 'Inactive',
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
export const normalizeContractStatus = (value, contract = null) => {
  const ctx = (value && typeof value === 'object') ? value : (contract || {});
  const raw = String((typeof value === 'object' ? value.status : value) ?? '').trim();
  if (!raw) return '';

  const squashed = squash(raw);
  if (squashed === 'demoinactive') {
    return 'Inactive';
  }

  const isDemo =
    squashed === 'demo' ||
    Boolean(ctx.isDemoTrial) ||
    ctx.contractType === 'Trial' ||
    ctx.productCategory === 'Trial';

  if (isDemo) {
    const isExpired = ctx.endDate || ctx.expiryDate
      ? new Date(ctx.endDate || ctx.expiryDate).getTime() < Date.now()
      : false;
    const isConverted = Boolean(ctx.convertedToPaid) || squashed === 'converted' || squashed === 'demoinactive';

    if (isConverted || isExpired) {
      return 'Inactive';
    }
    return 'DEMO';
  }

  if (['inactive', 'closed', 'expired'].includes(squashed)) {
    return squashed === 'closed' ? 'Closed' : 'Inactive';
  }

  if (squashed === 'disabled' || squashed === 'suspended') {
    return 'DISABLED';
  }

  if (squashed === 'notstarted' || squashed === 'draft' || squashed === 'pending') {
    return 'Not Started';
  }

  if (['active', 'inprogress', 'in progress', 'converted', 'signed', 'live', 'expiring'].includes(squashed)) {
    return 'Active';
  }

  return STATUS_LOOKUP[squashed] || raw;
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
 * Robust date parser supporting DD-MM-YYYY, DD/MM/YYYY, and standard ISO formats
 */
export const parseDateRobust = (value) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const s = String(value).trim();
  const ddmmyyyy = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ddmmyyyy) {
    const day = parseInt(ddmmyyyy[1], 10);
    const month = parseInt(ddmmyyyy[2], 10) - 1;
    const year = parseInt(ddmmyyyy[3], 10);
    return new Date(year, month, day);
  }
  const yyyymmdd = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (yyyymmdd) {
    const year = parseInt(yyyymmdd[1], 10);
    const month = parseInt(yyyymmdd[2], 10) - 1;
    const day = parseInt(yyyymmdd[3], 10);
    return new Date(year, month, day);
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * The term is no longer typed by hand — it is whatever the validity dates say,
 * so the receipt Duration and the CRM subscription_period cannot disagree with
 * the start and end dates printed on the same contract.
 */
export const periodFromDates = (startDate, endDate) => {
  const start = parseDateRobust(startDate);
  const end = parseDateRobust(endDate);
  if (!start || !end || end <= start) return '';

  const effectiveEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1);

  let months =
    (effectiveEnd.getFullYear() - start.getFullYear()) * 12 +
    (effectiveEnd.getMonth() - start.getMonth());
  if (effectiveEnd.getDate() < start.getDate()) months -= 1;
  if (months < 1) months = 1;

  if (months % 12 === 0) {
    const years = months / 12;
    return years === 1 ? '1 Year' : `${years} Years`;
  }
  return months === 1 ? '1 Month' : `${months} Months`;
};

/**
 * Checks if a contract record represents a Demo / Trial contract
 */
export const isDemoContract = (ctr) => {
  if (!ctr) return false;
  return Boolean(
    ctr.isDemoTrial ||
    ctr.contractType === 'Trial' ||
    ctr.productCategory === 'Trial' ||
    String(ctr.contractId || ctr.id || '').toUpperCase().includes('DEMO') ||
    String(ctr.name || '').toLowerCase().includes('demo') ||
    ctr.convertedToPaid
  );
};

/**
 * Checks if the customer associated with this contract has purchased any active/paid plans.
 * Once a customer purchases plans, demo trials are permanently converted and cannot be set back to Active.
 */
export const customerHasPurchasedPlans = (ctr, allContracts = []) => {
  if (!ctr) return false;
  if (ctr.convertedToPaid || ctr.convertedToContractId) return true;
  if (!Array.isArray(allContracts) || allContracts.length === 0) return false;

  const targetCustId = String(ctr.customerId || '').trim().toLowerCase();
  const targetEmail = String(ctr.email || ctr.personEmail || '').trim().toLowerCase();
  const targetCompany = String(ctr.company || '').trim().toLowerCase();

  return allContracts.some((other) => {
    if (isDemoContract(other)) return false;

    const otherCustId = String(other.customerId || '').trim().toLowerCase();
    const otherEmail = String(other.email || other.personEmail || '').trim().toLowerCase();
    const otherCompany = String(other.company || '').trim().toLowerCase();

    return (
      (targetCustId && otherCustId && targetCustId === otherCustId) ||
      (targetEmail && otherEmail && targetEmail === otherEmail) ||
      (targetCompany && otherCompany && targetCompany === otherCompany)
    );
  });
};
