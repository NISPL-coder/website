import {
  deriveCustomerLifecycle,
  normalizeLifecycle,
  CUSTOMER_LIFECYCLE
} from '../src/services/customerLifecycle.js';

let pass = 0;
let fail = 0;
const check = (label, actual, expected) => {
  const ok = actual === expected;
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${label} | got=${actual} expected=${expected}`);
  ok ? pass++ : fail++;
};

const today = new Date().toISOString().split('T')[0];
const future = '2027-12-31';
const past = '2020-01-01';

// Unique identity per scenario so matchesCustomer links only its own records.
const cust = (n, extra = {}) => ({
  customerId: `CUST-S${n}`,
  email: `s${n}@scenario.test`,
  company: `Scenario ${n} Company`,
  name: `Scenario ${n}`,
  status: 'Inactive',
  ...extra
});
const paidCtr = (n, status, end = future) => ({
  contractId: `CTR-S${n}`,
  company: `Scenario ${n} Company`,
  email: `s${n}@scenario.test`,
  contractType: 'Subscription',
  productCategory: 'Software',
  isDemoTrial: false,
  status,
  startDate: today,
  endDate: end
});
const demoCtr = (n, end = future) => ({
  contractId: `CTR-DEMO-S${n}`,
  company: `Scenario ${n} Company`,
  email: `s${n}@scenario.test`,
  contractType: 'Trial',
  productCategory: 'Trial',
  isDemoTrial: true,
  status: 'DEMO',
  startDate: today,
  endDate: end
});
const pay = (n, status, amount = '₹1,000') => ({
  invoiceNumber: `INV-S${n}`,
  company: `Scenario ${n} Company`,
  email: `s${n}@scenario.test`,
  status,
  amount,
  receivedAmount: status === 'Received' || status === 'Cleared' ? amount : '₹0'
});

// 1. Registration -> Inactive (no contracts, no payments)
check('1 register -> Inactive', deriveCustomerLifecycle(cust(1), [], []), 'Inactive');

// 2. Login-only -> Inactive (login adds no commercial records)
check('2 login-only -> Inactive', deriveCustomerLifecycle(cust(2, { status: 'Inactive' }), [], []), 'Inactive');

// 3. Demo activation -> Demo
check('3 demo -> Demo', deriveCustomerLifecycle(cust(3, { demoTrialUsed: true }), [demoCtr(3)], []), 'Demo');

// 4. Multiple demos -> still Demo
check('4 multiple demos -> Demo', deriveCustomerLifecycle(cust(4, { demoTrialUsed: true }), [demoCtr(4), { ...demoCtr(4), contractId: 'CTR-DEMO-S4b' }], []), 'Demo');

// 5. Purchase + settled payment, service not started -> InProgress
check('5 purchase settled -> InProgress', deriveCustomerLifecycle(cust(5), [paidCtr(5, 'Not Started')], [pay(5, 'Received')]), 'InProgress');

// 6. Failed/pending payment changes nothing (still Demo)
check('6a failed payment -> unchanged Demo', deriveCustomerLifecycle(cust(6, { demoTrialUsed: true }), [demoCtr(6)], [pay(6, 'Failed')]), 'Demo');
check('6b pending payment -> unchanged Demo', deriveCustomerLifecycle(cust(6, { demoTrialUsed: true }), [demoCtr(6)], [pay(6, 'Pending')]), 'Demo');

// 7. Settled payment derives InProgress; derivation is deterministic (idempotent read)
const s7cust = cust(7);
const s7ctr = [paidCtr(7, 'Not Started')];
const s7pay = [pay(7, 'Received')];
const first = deriveCustomerLifecycle(s7cust, s7ctr, s7pay);
const second = deriveCustomerLifecycle(s7cust, s7ctr, s7pay);
check('7 webhook-settled -> InProgress', first, 'InProgress');
check('7 derivation idempotent', second, first);

// 8. Provisioning complete (live paid contract) -> Active
check('8 provisioned -> Active', deriveCustomerLifecycle(cust(8), [paidCtr(8, 'In Progress')], [pay(8, 'Received')]), 'Active');

// 9. Existing Active buys another -> account stays Active (live paid wins over new Not Started)
check('9 active + new purchase -> Active', deriveCustomerLifecycle(cust(9), [paidCtr(9, 'In Progress'), { ...paidCtr(9, 'Not Started'), contractId: 'CTR-S9b' }], [pay(9, 'Received')]), 'Active');

// Extra: admin suspension always reads Inactive
check('X suspended -> Inactive', deriveCustomerLifecycle(cust(10, { status: 'suspended' }), [paidCtr(10, 'In Progress')], [pay(10, 'Received')]), 'Inactive');

// Extra: a paid live product elsewhere does not suppress an unrelated demo (multi-product)
check('X demo + live paid -> Active', deriveCustomerLifecycle(cust(11, { demoTrialUsed: true }), [demoCtr(11), paidCtr(11, 'In Progress')], [pay(11, 'Received')]), 'Active');

// Extra: expired paid contract (end in past) is not live -> InProgress if settled, not Active
check('X expired paid + settled -> InProgress', deriveCustomerLifecycle(cust(12), [paidCtr(12, 'In Progress', past)], [pay(12, 'Received')]), 'InProgress');

// Extra: all paid contracts Closed (churned) + settled -> not InProgress
check('X churned + settled -> Inactive', deriveCustomerLifecycle(cust(13), [paidCtr(13, 'Closed')], [pay(13, 'Received')]), 'Inactive');

// Extra: legacy lowercase words normalize to canonical buckets
check('X normalize demo', normalizeLifecycle('demo'), 'Demo');
check('X normalize trial', normalizeLifecycle('trial'), 'Demo');
check('X normalize in progress', normalizeLifecycle('in progress'), 'InProgress');
check('X normalize active', normalizeLifecycle('active'), 'Active');
check('X normalize unknown -> Inactive', normalizeLifecycle('whatever'), 'Inactive');
check('X canonical enum', CUSTOMER_LIFECYCLE.join(','), 'Inactive,Demo,InProgress,Active');

console.log(`\n[scenario] ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);