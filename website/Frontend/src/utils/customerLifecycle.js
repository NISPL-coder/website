// Mirrors Backend/src/services/customerLifecycle.js: the stage is derived from
// the contract and payment registers, so legacy stored words still translate.

export const CUSTOMER_LIFECYCLE = ['Active', 'Demo', 'Inactive'];

const squash = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, '');

const LOOKUP = {
  inactive: 'Inactive',
  suspended: 'Inactive',
  paused: 'Inactive',
  closed: 'Inactive',
  demoinactive: 'Inactive',
  'demo-inactive': 'Inactive',
  demo: 'Demo',
  trial: 'Demo',
  inprogress: 'Active',
  'in progress': 'Active',
  active: 'Active'
};

export const normalizeCustomerLifecycle = (value) => LOOKUP[squash(value)] || 'Inactive';

const LABEL = {
  Active: 'Active',
  Demo: 'Demo Trial',
  Inactive: 'Inactive'
};

const TONE = {
  Active: 'active',
  Demo: 'demo',
  Inactive: 'inactive'
};

export const customerLifecycleLabel = (value) => LABEL[normalizeCustomerLifecycle(value)] || value;

export const customerLifecycleTone = (value) => TONE[normalizeCustomerLifecycle(value)] || 'inactive';
