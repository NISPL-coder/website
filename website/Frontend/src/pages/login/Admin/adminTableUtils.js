/**
 * Small helpers shared by the admin data tables.
 */

/** Convert "₹1,28,65,000", "85.6%", 12865000 into a comparable number. */
export function toNumber(value, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const cleaned = String(value ?? '').replace(/[^0-9.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Compare two rows by a numeric getter (currency, percentages, counts). */
export function compareNumber(getValue) {
  return (a, b) => toNumber(getValue(a)) - toNumber(getValue(b));
}

/** Compare two rows by a date getter. */
export function compareDate(getValue) {
  return (a, b) => {
    const left = new Date(getValue(a) || 0).getTime() || 0;
    const right = new Date(getValue(b) || 0).getTime() || 0;
    return left - right;
  };
}

const MONTHS = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

/**
 * Parse the date values used across the admin tables. Accepts ISO dates
 * ("2026-10-31"), ISO timestamps, "31 Oct 2026" and "31/10/2026".
 * Returns a timestamp (local midnight for date-only values) or null.
 */
export function parseDateValue(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.getTime();

  const str = String(value).trim();
  if (!str || str === '—' || str === '-') return null;

  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])).getTime();
  }

  const dmy = str.match(/^(\d{1,2})[\s/\-.]([A-Za-z]{3,9})[\s/\-.](\d{4})/);
  if (dmy) {
    const month = MONTHS[dmy[2].toLowerCase()];
    if (month != null) {
      return new Date(Number(dmy[3]), month, Number(dmy[1])).getTime();
    }
  }

  const numeric = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/);
  if (numeric) {
    return new Date(Number(numeric[3]), Number(numeric[2]) - 1, Number(numeric[1])).getTime();
  }

  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
}

/** True when a row date falls inside the inclusive [from, to] range. */
export function isWithinDateRange(value, from, to) {
  if (!from && !to) return true;

  const time = parseDateValue(value);
  if (time == null) return false;

  if (from) {
    const start = parseDateValue(from);
    if (start != null && time < start) return false;
  }

  if (to) {
    const end = parseDateValue(to);
    if (end != null) {
      const endOfDay = new Date(end);
      endOfDay.setHours(23, 59, 59, 999);
      if (time > endOfDay.getTime()) return false;
    }
  }

  return true;
}

/** Case-insensitive string comparison for nested values. */
export function compareText(getValue) {
  return (a, b) =>
    String(getValue(a) ?? '').localeCompare(String(getValue(b) ?? ''), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
}
