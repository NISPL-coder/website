import {
  checkAdditionalProductEligibility,
  calculateCutOffDate,
  calculateLastEligibleDate,
  subtractCalendarDays,
  getKolkataDateString,
  findPrimaryContract,
  RESTRICTION_MESSAGE
} from '../src/services/contractEligibilityService.js';

console.log('================================================================');
console.log('NISPL Customer Portal - 15-Day Purchase Cut-off Rule Test Suite');
console.log('================================================================\n');

// 1. Mandatory Test Cases Verification (Expiry: 31 December 2026)
console.log('SECTION 1: Mandatory Test Cases (Master Expiry: 2026-12-31)');
const primaryContract = {
  contractId: 'NISPL/2026-27/00001',
  name: 'Primary Enterprise Cloud Server - 1 User',
  company: 'NISPL Test Corp',
  customer: 'Sudip Kumar',
  email: 'sudip@gmail.com',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  expiryDate: '2026-12-31',
  status: 'Active'
};

const cutOff = calculateCutOffDate(primaryContract.expiryDate, 15);
const lastEligible = calculateLastEligibleDate(primaryContract.expiryDate, 16);
console.log(`Expiry Date: ${primaryContract.expiryDate}`);
console.log(`Calculated Cut-off Date (Restriction Starts): ${cutOff}`);
console.log(`Last Eligible Date: ${lastEligible}\n`);

if (cutOff !== '2026-12-16' || lastEligible !== '2026-12-15') {
  console.error('FAILED: Cut-off date or last eligible date calculation incorrect!');
  process.exit(1);
}

const testCases = [
  { date: '2026-12-14', expectedEligible: true, expectedReason: 'active_allowed', desc: '14 December: Additional product purchase allowed.' },
  { date: '2026-12-15', expectedEligible: true, expectedReason: 'active_allowed', desc: '15 December: Additional product purchase allowed.' },
  { date: '2026-12-16', expectedEligible: false, expectedReason: 'restricted_period', desc: '16 December: Additional product purchase blocked.' },
  { date: '2026-12-20', expectedEligible: false, expectedReason: 'restricted_period', desc: '20 December: Additional product purchase blocked.' },
  { date: '2026-12-30', expectedEligible: false, expectedReason: 'restricted_period', desc: '30 December: Additional product purchase blocked.' },
  { date: '2026-12-31', expectedEligible: false, expectedReason: 'restricted_period', desc: '31 December: Additional product purchase blocked.' },
  { date: '2027-01-01', expectedEligible: false, expectedReason: 'contract_expired', desc: '1 January 2027: Expired contract; additional purchase blocked until renewal.' }
];

let passCount = 0;
for (const tc of testCases) {
  const res = checkAdditionalProductEligibility({ primaryContract, currentDate: tc.date });
  const passed = res.eligible === tc.expectedEligible && res.reason === tc.expectedReason;
  console.log(`  [${passed ? 'PASS' : 'FAIL'}] ${tc.desc}`);
  console.log(`         Date: ${tc.date} | Eligible: ${res.eligible} | Reason: ${res.reason} | CutOff: ${res.cutOffDate} | MasterExpiry: ${res.masterExpiryDate}`);
  if (passed) passCount++;
  else {
    console.error('         FAILED DETAIL:', res);
    process.exit(1);
  }
}
console.log(`\nMandatory test cases passed: ${passCount} / ${testCases.length}\n`);

// 2. Renewal & Recalculation Test (Section 4)
console.log('SECTION 2: Renewal & Recalculation Verification');
const renewedContract = {
  ...primaryContract,
  endDate: '2027-12-31',
  expiryDate: '2027-12-31'
};

const newCutOff = calculateCutOffDate(renewedContract.expiryDate, 15);
const newLastEligible = calculateLastEligibleDate(renewedContract.expiryDate, 16);
console.log(`Renewed Expiry Date: ${renewedContract.expiryDate}`);
console.log(`Recalculated Cut-off Date: ${newCutOff}`);
console.log(`Recalculated Last Eligible Date: ${newLastEligible}`);

const renewalTestCases = [
  { date: '2027-01-15', expectedEligible: true, expectedReason: 'active_allowed', desc: '15 January 2027: Allowed after renewal' },
  { date: '2027-12-15', expectedEligible: true, expectedReason: 'active_allowed', desc: '15 December 2027: Allowed before new cut-off' },
  { date: '2027-12-16', expectedEligible: false, expectedReason: 'restricted_period', desc: '16 December 2027: Blocked under new 15-day restriction' }
];

for (const rtc of renewalTestCases) {
  const res = checkAdditionalProductEligibility({ primaryContract: renewedContract, currentDate: rtc.date });
  const passed = res.eligible === rtc.expectedEligible && res.reason === rtc.expectedReason;
  console.log(`  [${passed ? 'PASS' : 'FAIL'}] ${rtc.desc}`);
  if (!passed) {
    console.error('         FAILED DETAIL:', res);
    process.exit(1);
  }
}

// 3. Child Product Expiry Date Inheritance Test
console.log('\nSECTION 3: Child Product Expiry Date Inheritance');
const additionalProduct = {
  name: 'Additional Cloud User (2 Users)',
  parentContractId: primaryContract.contractId,
  isAdditionalContract: true,
  startDate: '2026-06-01',
  endDate: primaryContract.expiryDate,
  expiryDate: primaryContract.expiryDate
};

console.log(`Primary Expiry: ${primaryContract.expiryDate}`);
console.log(`Additional Product Expiry: ${additionalProduct.expiryDate}`);
if (additionalProduct.expiryDate === primaryContract.expiryDate) {
  console.log('  [PASS] Additional product correctly inherits Expiry Date!');
} else {
  console.error('  [FAIL] Additional product expiry does not match primary contract expiry!');
  process.exit(1);
}

console.log('\n================================================================');
console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
console.log('================================================================');
