/**
 * Contract vocabulary, mirrored from the backend so the console renders exactly
 * the words the register stores. Older rows still carry the previous statuses,
 * so every filter, badge and modal reads through these helpers instead of
 * comparing raw strings.
 */

import { formatStamp } from './adminTableUtils';

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

const STATUS_TONE = {
  Active: 'active',
  'In Progress': 'active',
  Inactive: 'inactive',
  'Not Started': 'pending',
  Closed: 'inactive',
  Converted: 'active',
  DEMO: 'info',
  'DEMO-Inactive': 'inactive',
  DISABLED: 'suspended'
};

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

/** The type is free text on legacy rows, so only translate what is recognised. */
export const normalizeContractType = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const match = [...CONTRACT_TYPES, ...LEGACY_CONTRACT_TYPES].find(
    (type) => squash(type) === squash(raw)
  );
  return match || raw;
};

export const contractStatusTone = (value, contract = null) =>
  STATUS_TONE[normalizeContractStatus(value, contract)] || 'inactive';

// The same states for the places that paint a value rather than a pill.
const STATUS_COLOR = {
  Active: '#059669',
  'In Progress': '#059669',
  Inactive: '#64748b',
  'Not Started': '#d97706',
  Closed: '#64748b',
  Converted: '#059669',
  DEMO: '#6366f1',
  'DEMO-Inactive': '#64748b',
  DISABLED: '#e11d48'
};

export const contractStatusColor = (value, contract = null) =>
  STATUS_COLOR[normalizeContractStatus(value, contract)] || '#64748b';

/**
 * The commercial shape and its length as one line. A row that carries neither
 * prints a dash rather than an invented 'Subscription (1 Year)'.
 */
export const describeContractTerm = (contract) => {
  const type = normalizeContractType(contract?.contractType);
  const period = String(contract?.subscriptionPeriod || '').trim();
  if (type && period) return `${type} (${period})`;
  return type || period || '—';
};

/**
 * Generates or derives a dedicated IP address for a purchased product/contract.
 * Returns static IP in 103.115.220.xx range.
 */
export const generateDedicatedIp = (contractId, line = {}, product = null) => {
  if (line?.ipAddress && String(line.ipAddress).trim()) return String(line.ipAddress).trim();
  if (product?.ipAddress && String(product.ipAddress).trim()) return String(product.ipAddress).trim();

  let num = 0;
  if (contractId) {
    const m = String(contractId).match(/(\d+)$/);
    if (m) num = parseInt(m[1], 10);
  }
  if (!num || Number.isNaN(num)) {
    let hash = 0;
    const s = String(contractId || Date.now());
    for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) % 200;
    num = Math.abs(hash) + 40;
  }
  const subnet = 40 + (num % 210);
  return `103.115.220.${subnet}`;
};

/**
 * Resolves the Customer Contact Name with full fallback hierarchy.
 */
export const contractPersonName = (row, customers = []) => {
  if (row?.customer && String(row.customer).trim()) return String(row.customer).trim();
  if (row?.person && String(row.person).trim()) return String(row.person).trim();
  if (row?.contactPerson && String(row.contactPerson).trim()) return String(row.contactPerson).trim();
  if (row?.createdBy?.name && row.createdBy.role === 'customer') return String(row.createdBy.name).trim();

  if (Array.isArray(customers) && customers.length > 0) {
    const custId = String(row?.customerId || '').trim().toLowerCase();
    const email = String(row?.email || row?.personEmail || '').trim().toLowerCase();
    const comp = String(row?.company || '').trim().toLowerCase();

    const matched = customers.find((c) => {
      const cId = String(c.customerId || c.id || '').trim().toLowerCase();
      const cEmail = String(c.email || c.loginEmail || '').trim().toLowerCase();
      const cComp = String(c.company || '').trim().toLowerCase();
      return (custId && cId === custId) || (email && cEmail === email) || (comp && cComp === comp);
    });

    if (matched && matched.name) {
      return String(matched.name).trim();
    }
  }

  return row?.customer || '';
};

/**
 * The register stores the person's name, not their contact details: the list
 * endpoint joins the customer master and puts the result on `personEmail` /
 * `personMobile`. A row raised before that link existed, or one the console
 * added locally before the refresh, still has its own email.
 */
export const contractPersonEmail = (row, customers = []) => {
  if (row?.personEmail) return String(row.personEmail).trim();
  if (row?.email) return String(row.email).trim();

  if (Array.isArray(customers) && customers.length > 0) {
    const comp = String(row?.company || '').trim().toLowerCase();
    const cust = String(row?.customer || '').trim().toLowerCase();

    const matched = customers.find((c) => {
      const cComp = String(c.company || '').trim().toLowerCase();
      const cName = String(c.name || '').trim().toLowerCase();
      return (comp && cComp === comp) || (cust && cName === cust);
    });

    if (matched) {
      return String(matched.email || matched.loginEmail || '').trim();
    }
  }

  return '';
};

export const contractPersonMobile = (row, customers = []) => {
  if (row?.personMobile) return String(row.personMobile).trim();
  if (row?.phone) return String(row.phone).trim();
  if (row?.mobile) return String(row.mobile).trim();

  if (Array.isArray(customers) && customers.length > 0) {
    const comp = String(row?.company || '').trim().toLowerCase();
    const cust = String(row?.customer || '').trim().toLowerCase();
    const email = String(row?.email || row?.personEmail || '').trim().toLowerCase();

    const matched = customers.find((c) => {
      const cComp = String(c.company || '').trim().toLowerCase();
      const cName = String(c.name || '').trim().toLowerCase();
      const cEmail = String(c.email || '').trim().toLowerCase();
      return (comp && cComp === comp) || (cust && cName === cust) || (email && cEmail === email);
    });

    if (matched) {
      return String(matched.phone || matched.alternatePhone || matched.mobile || '').trim();
    }
  }

  return '';
};

/** Whoever raised or edited the row, printed as a name and falling back to their email. */
export const contractActorName = (actor) => {
  if (!actor) return '';
  return String(actor.name || actor.email || '').trim();
};

/** A stamp the register never filled prints as a dash rather than "Invalid Date". */
export const formatContractStamp = formatStamp;

/**
 * The dropdown filters group the vocabulary the way an operator reads it: a
 * live term, a term that has not begun, and everything that is finished or
 * switched off.
 */
export const matchesStatusFilter = (contract, filter) => {
  if (!filter || filter === 'all') return true;
  const status = normalizeContractStatus(contract?.status, contract);
  const filterNorm = squash(filter);
  if (filterNorm === 'active' || filterNorm === 'inprogress') return status === 'Active';
  if (filterNorm === 'inactive' || filterNorm === 'demoinactive') return status === 'Inactive';
  if (filterNorm === 'notstarted') return status === 'Not Started';
  if (filterNorm === 'closed') return status === 'Closed';
  if (filterNorm === 'converted') return status === 'Active' || status === 'Converted';
  if (filterNorm === 'demo') return status === 'DEMO';
  if (filterNorm === 'disabled') return status === 'DISABLED';
  return squash(status) === filterNorm;
};

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
 * Calculates human duration string from contract start & end dates
 * E.g. 10-01-2024 to 09-01-2027 -> "3 Years"
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
