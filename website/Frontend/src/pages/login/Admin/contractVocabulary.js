/**
 * Contract vocabulary, mirrored from the backend so the console renders exactly
 * the words the register stores. Older rows still carry the previous statuses,
 * so every filter, badge and modal reads through these helpers instead of
 * comparing raw strings.
 */

import { formatStamp } from './adminTableUtils';

export const CONTRACT_STATUSES = ['Not Started', 'In Progress', 'Closed', 'DEMO', 'DEMO-Inactive', 'DISABLED'];

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
  demoinactive: 'DEMO-Inactive',
  'demo-inactive': 'DEMO-Inactive',
  converted: 'DEMO-Inactive',
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

const STATUS_TONE = {
  'In Progress': 'active',
  'Not Started': 'pending',
  Closed: 'inactive',
  DEMO: 'info',
  'DEMO-Inactive': 'demoinactive',
  DISABLED: 'suspended'
};

export const normalizeContractStatus = (value, contract = null) => {
  const ctx = (value && typeof value === 'object') ? value : (contract || {});
  const raw = String((typeof value === 'object' ? value.status : value) ?? '').trim();
  if (!raw) return '';

  const squashed = squash(raw);
  if (squashed === 'demoinactive' || squashed === 'converted') {
    return 'DEMO-Inactive';
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
    const isConverted = Boolean(ctx.convertedToPaid) || squashed === 'converted';

    if (isConverted || isExpired) {
      return 'DEMO-Inactive';
    }
    return 'DEMO';
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
  'In Progress': '#059669',
  'Not Started': '#d97706',
  Closed: '#64748b',
  DEMO: '#6366f1',
  'DEMO-Inactive': '#dc2626',
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
  if (filterNorm === 'inprogress') return status === 'In Progress';
  if (filterNorm === 'notstarted') return status === 'Not Started';
  if (filterNorm === 'closed') return status === 'Closed';
  if (filterNorm === 'demo') return status === 'DEMO';
  if (filterNorm === 'demoinactive') return status === 'DEMO-Inactive';
  if (filterNorm === 'disabled') return status === 'DISABLED';
  return squash(status) === filterNorm;
};
