import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getKolkataTimeInfo,
  escapeFormula,
  generateApplicationId,
  sanitizeFilename,
  AsyncLock
} from '../utils/helpers.js';

test('helpers - getKolkataTimeInfo generates accurate time in Asia/Kolkata', () => {
  const timeInfo = getKolkataTimeInfo();
  assert.ok(timeInfo.year, 'Year should exist');
  assert.match(timeInfo.year, /^\d{4}$/, 'Year should be 4 digits');
  assert.ok(timeInfo.month, 'Month should exist');
  // Full month name test
  const validMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  assert.ok(validMonths.includes(timeInfo.month), `Month "${timeInfo.month}" should be full month name`);
  assert.ok(timeInfo.dateTimeFormatted.includes('IST'), 'DateTime string should include IST');
});

test('helpers - escapeFormula protects against spreadsheet formula injection (CWE-1236)', () => {
  assert.equal(escapeFormula('=1+1'), "'=1+1");
  assert.equal(escapeFormula('+cmd|/C calc!A0'), "'+cmd|/C calc!A0");
  assert.equal(escapeFormula('-2*5'), "'-2*5");
  assert.equal(escapeFormula('@SUM(A1:A10)'), "'@SUM(A1:A10)");
  assert.equal(escapeFormula('\tTabbedValue'), "'\tTabbedValue");
  assert.equal(escapeFormula('John Doe'), 'John Doe');
  assert.equal(escapeFormula('debasish@nispl.in'), 'debasish@nispl.in');
  assert.equal(escapeFormula(12345), '12345');
});

test('helpers - generateApplicationId produces unique IDs in APP-YYYYMMDD-[HEX] format', () => {
  const id1 = generateApplicationId();
  const id2 = generateApplicationId();
  assert.match(id1, /^APP-\d{8}-[A-Z0-9]{6}$/);
  assert.match(id2, /^APP-\d{8}-[A-Z0-9]{6}$/);
  assert.notEqual(id1, id2, 'Generated IDs should be unique');
});

test('helpers - sanitizeFilename strips unsafe path traversal and special characters from candidate names', () => {
  assert.equal(sanitizeFilename('../../etc/passwd'), 'etc_passwd');
  assert.equal(sanitizeFilename('Debasish Ray (DevOps)'), 'Debasish_Ray_DevOps_');
  assert.equal(sanitizeFilename('Amit_Sharma-2026'), 'Amit_Sharma-2026');
  assert.equal(sanitizeFilename(''), 'candidate');
});

test('helpers - AsyncLock ensures strictly serialized queue execution', async () => {
  const lock = new AsyncLock();
  const executionOrder = [];

  const task1 = lock.acquire(async () => {
    await new Promise((res) => setTimeout(res, 50));
    executionOrder.push(1);
    return 'res1';
  });

  const task2 = lock.acquire(async () => {
    executionOrder.push(2);
    return 'res2';
  });

  const [r1, r2] = await Promise.all([task1, task2]);
  assert.equal(r1, 'res1');
  assert.equal(r2, 'res2');
  assert.deepEqual(executionOrder, [1, 2], 'Lock must execute tasks sequentially');
});
