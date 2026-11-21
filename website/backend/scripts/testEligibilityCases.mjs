import {
  checkAdditionalProductEligibility,
  calculateCutOffDate,
  subtractCalendarDays,
  RESTRICTION_MESSAGE
} from '../src/services/contractEligibilityService.js';

console.log('--- RUNNING MANDATORY TEST CASES ---');

const primaryContract = {
  contractId: 'NISPL/2026-27/00001',
  name: 'Primary Enterprise Cloud Server',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  expiryDate: '2026-12-31',
  status: 'Active'
};

const testCases = [
  { date: '2026-12-14', expectedEligible: true, expectedReason: 'active_allowed', desc: '14 December: Additional product purchase allowed.' },
  { date: '2026-12-15', expectedEligible: true, expectedReason: 'active_allowed', desc: '15 December: Additional product purchase allowed.' },
  { date: '2026-12-16', expectedEligible: false, expectedReason: 'restricted_period', desc: '16 December: Additional product purchase blocked.' },
  { date: '2026-12-20', expectedEligible: false, expectedReason: 'restricted_period', desc: '20 December: Additional product purchase blocked.' },
  { date: '2026-12-30', expectedEligible: false, expectedReason: 'restricted_period', desc: '30 December: Additional product purchase blocked.' },
  { date: '2026-12-31', expectedEligible: false, expectedReason: 'restricted_period', desc: '31 December: Additional product purchase blocked.' },
  { date: '2027-01-01', expectedEligible: false, expectedReason: 'contract_expired', desc: '1 January 2027: Expired contract; additional purchase blocked until renewal.' }
];

let allPassed = true;

for (const tc of testCases) {
  const result = checkAdditionalProductEligibility({ primaryContract, currentDate: tc.date });
  const passed = result.eligible === tc.expectedEligible && result.reason === tc.expectedReason;
  console.log(
    `[${passed ? 'PASS' : 'FAIL'}] ${tc.desc}\n` +
    `       Date: ${tc.date} | Eligible: ${result.eligible} | Reason: ${result.reason} | CutOff: ${result.cutOffDate} | MasterExpiry: ${result.masterExpiryDate}`
  );
  if (!passed) {
    allPassed = false;
    console.error('      Mismatch:', { expected: tc, actual: result });
  }
}

if (allPassed) {
  console.log('\n ALL 7 MANDATORY TEST CASES PASSED PERFECTLY!');
} else {
  console.error('\n SOME TEST CASES FAILED!');
  process.exit(1);
}
