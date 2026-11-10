// Mirrors Backend/src/services/customerLifecycle.js: the stage is derived from
// the contract and payment registers, so legacy stored words still translate.

export const CUSTOMER_LIFECYCLE = ['Inactive', 'Demo', 'DemoInactive', 'InProgress', 'Active'];

const squash = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, '');

const LOOKUP = {
  inactive: 'Inactive',
  suspended: 'Inactive',
  paused: 'Inactive',
  demo: 'Demo',
  trial: 'Demo',
  demoinactive: 'DemoInactive',
  'demo-inactive': 'DemoInactive',
  inprogress: 'InProgress',
  active: 'Active'
};

export const normalizeCustomerLifecycle = (value) => LOOKUP[squash(value)] || 'Inactive';

const LABEL = {
  Inactive: 'Inactive',
  Demo: 'Demo Trial',
  DemoInactive: 'DEMO-Inactive',
  InProgress: 'In Progress',
  Active: 'Active'
};

const TONE = {
  Inactive: 'inactive',
  Demo: 'demo',
  DemoInactive: 'demoinactive',
  InProgress: 'info',
  Active: 'active'
};

export const customerLifecycleLabel = (value) => LABEL[normalizeCustomerLifecycle(value)] || value;

export const customerLifecycleTone = (value) => TONE[normalizeCustomerLifecycle(value)] || 'inactive';
