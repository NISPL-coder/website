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

/**
 * The term a payment actually bought, in the words the order form used. Rows
 * taken before the term was recorded fall back to the contract's period.
 * @param {object} receipt
 */
export function receiptDuration(receipt) {
  const term = receipt?.term || {};
  const recordedMonths = Number(term.months) || 0;
  const label =
    term.period ||
    (recordedMonths ? `${recordedMonths} month${recordedMonths === 1 ? '' : 's'}` : '') ||
    receipt?.contract?.subscriptionPeriod ||
    '';

  return { label, months: durationInMonths(label, recordedMonths) };
}

function durationInMonths(label, recordedMonths) {
  if (recordedMonths) return recordedMonths;
  const text = String(label).toLowerCase();
  const count = parseInt(text, 10);
  const times = Number.isFinite(count) ? count : 1;
  if (text.includes('year') || text.includes('annual')) return times * 12;
  if (text.includes('quarter')) return times * 3;
  if (text.includes('month')) return times;
  if (text.includes('week')) return (times * 7) / 30;
  if (text.includes('day')) return times / 30;
  return 0;
}

/**
 * Map an admin receipt row to the flat shape the receipt PDF writer reads.
 * @param {object} receipt
 */
export function toReceiptPdfRow(receipt) {
  return {
    id: receipt.invoiceNumber || receipt.id,
    service: receipt.service || receipt.productName,
    date: receipt.date,
    expiryDate: receipt.contract?.endDate || '',
    paymentMode: receipt.paymentMode,
    // The instrument details an offline payment was reconciled with, printed on
    // the invoice beside the payment mode.
    referenceNumber: receipt.referenceNumber || '',
    bankName: receipt.bankName || '',
    baseAmount: receipt.baseAmount,
    cgst: receipt.cgst,
    sgst: receipt.sgst,
    totalAmount: receipt.amount,
    status: receipt.status,
    sacCode: receipt.product?.category || ''
  };
}

/**
 * Payments a customer account has actually made, taken from the receipt
 * payload where the server already resolved the identity. Newest first.
 * @param {Array<object>} receipts
 * @param {object} customer
 */
export function receiptsForCustomer(receipts, customer) {
  const keys = new Set(
    [
      customer?.customerId,
      customer?.id,
      customer?.company,
      customer?.name,
      customer?.email,
      customer?.loginEmail
    ]
      .map((value) => String(value ?? '').trim().toLowerCase())
      .filter(Boolean)
  );

  if (!keys.size) return [];

  return (receipts || [])
    .filter((receipt) => {
      const party = receipt.customer || {};
      return [party.customerId, party.company, party.name, party.email]
        .map((value) => String(value ?? '').trim().toLowerCase())
        .some((value) => value && keys.has(value));
    })
    .sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')));
}
