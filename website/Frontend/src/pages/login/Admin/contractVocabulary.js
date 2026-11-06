/**
 * Contract vocabulary, mirrored from the backend so the console renders exactly
 * the words the register stores. Older rows still carry the previous statuses,
 * so every filter, badge and modal reads through these helpers instead of
 * comparing raw strings.
 */

import { formatStamp } from './adminTableUtils';

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

const STATUS_TONE = {
  'In Progress': 'active',
  'Not Started': 'pending',
  Closed: 'inactive',
  DEMO: 'info',
  DISABLED: 'suspended'
};

export const normalizeContractStatus = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  return STATUS_LOOKUP[squash(raw)] || raw;
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

export const contractStatusTone = (value) => STATUS_TONE[normalizeContractStatus(value)] || 'inactive';

// The same five states for the places that paint a value rather than a pill.
const STATUS_COLOR = {
  'In Progress': '#059669',
  'Not Started': '#d97706',
  Closed: '#64748b',
  DEMO: '#6366f1',
  DISABLED: '#e11d48'
};

export const contractStatusColor = (value) =>
  STATUS_COLOR[normalizeContractStatus(value)] || '#64748b';

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
export const contractPersonEmail = (row) => String(row?.personEmail || row?.email || '').trim();

export const contractPersonMobile = (row) => String(row?.personMobile || '').trim();

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
  const status = normalizeContractStatus(contract?.status);
  if (filter === 'inprogress') return status === 'In Progress';
  if (filter === 'notstarted') return status === 'Not Started';
  if (filter === 'closed') return status === 'Closed';
  if (filter === 'demo') return status === 'DEMO';
  if (filter === 'disabled') return status === 'DISABLED';
  return true;
};
