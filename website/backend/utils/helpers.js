import crypto from 'crypto';

/**
 * Get current date & time information localized to Asia/Kolkata
 * @param {string} timezone - e.g. 'Asia/Kolkata'
 * @returns {{ year: string, month: string, dateTimeFormatted: string, timestamp: Date }}
 */
export function getKolkataTimeInfo(timezone = 'Asia/Kolkata') {
  const now = new Date();

  // Year (e.g. 2026)
  const yearFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: timezone,
    year: 'numeric'
  });
  const year = yearFormatter.format(now);

  // Full Month (e.g. October)
  const monthFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: timezone,
    month: 'long'
  });
  const month = monthFormatter.format(now);

  // Full readable Date & Time with IST
  const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: timezone,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  const dateTimeFormatted = `${dateTimeFormatter.format(now)} IST`;

  return {
    year,
    month,
    dateTimeFormatted,
    timestamp: now
  };
}

/**
 * Generate a cryptographically strong unique Application ID
 * Format: APP-YYYYMMDD-[4-char-hex]
 * @param {string} timezone 
 * @returns {string}
 */
export function generateApplicationId(timezone = 'Asia/Kolkata') {
  const now = new Date();
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now).replace(/-/g, ''); // e.g. 20261022

  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
  return `APP-${dateStr}-${randomHex}`;
}

/**
 * Prevent CSV / Spreadsheet Formula Injection (CWE-1236)
 * If a string begins with =, +, -, @, tab, or carriage return,
 * prefix it with a single quote (') so Sheets interprets it strictly as text.
 * @param {any} val 
 * @returns {string}
 */
export function escapeFormula(val) {
  if (val === null || val === undefined) return '';
  const rawStr = String(val);
  if (/^[=+\-@\t\r]/.test(rawStr) || /^[=+\-@]/.test(rawStr.trim())) {
    return `'${rawStr}`;
  }
  return rawStr.trim();
}

/**
 * Sanitize candidate string for file naming
 * @param {string} name 
 * @returns {string}
 */
export function sanitizeFilename(name) {
  if (!name) return 'candidate';
  return name
    .trim()
    .replace(/^[^a-zA-Z0-9]+/, '')
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 40) || 'candidate';
}

/**
 * In-memory simple mutex queue to prevent concurrent race conditions
 * during Sheets append / tab initialization
 */
export class AsyncLock {
  constructor() {
    this.queue = Promise.resolve();
  }

  acquire(fn) {
    const next = this.queue.then(() => fn());
    this.queue = next.catch(() => {});
    return next;
  }
}
