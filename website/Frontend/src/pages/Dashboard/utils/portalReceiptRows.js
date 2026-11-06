import { formatINR } from './pricingUtils';

const SETTLED = ['received', 'cleared', 'paid'];

const amountOf = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const printed = (value) =>
  value ? value.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const dateOf = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : printed(date);
};

export const isSettledStatus = (status) =>
  SETTLED.includes(String(status || '').trim().toLowerCase());

/**
 * The portal receipt ledger is this account's own payment rows, so every figure
 * on the invoice and every KPI below it is read off the ledger: what was
 * billed, what actually arrived, what the desk booked as GST, and — for money
 * that came in by cheque or bank transfer — which bank instrument it cleared
 * against.
 */
export const toPortalReceiptRow = (payment) => {
  const gross = amountOf(payment.amount);
  const gst = amountOf(payment.gstAmount);
  const taxable = amountOf(payment.taxableAmount) || Math.max(gross - gst, 0);
  const hasSplit = gst > 0 || taxable > 0;
  const cgst = gst > 0 ? Math.round(gst / 2) : 0;

  return {
    id: payment.invoiceNumber || payment.id,
    service: payment.service,
    date: dateOf(payment.date),
    expiryDate: dateOf(payment.dueDate),
    paymentMode: payment.paymentMethod || '—',
    totalAmount: formatINR(gross),
    paidAmount: formatINR(amountOf(payment.received)),
    pendingAmount: formatINR(amountOf(payment.pending)),
    baseAmount: hasSplit ? formatINR(taxable) : formatINR(gross),
    taxAmount: gst > 0 ? formatINR(gst) : 'Not separately recorded',
    gstBasis: payment.gstBasis || '',
    cgst,
    sgst: gst > 0 ? Math.max(gst - cgst, 0) : 0,
    sacCode: payment.sacCode || '',
    salesPerson: payment.salesPerson || '',
    // Set when the finance desk booked the payment from a bank instrument rather
    // than the gateway, so the customer can tie the invoice to their own
    // statement. The scan itself stays inside the console.
    bookedOffline: payment.source === 'manual',
    recordedBy: payment.source === 'manual' ? payment.raisedBy?.name || '' : '',
    referenceNumber: payment.referenceNumber || '',
    bankName: payment.bankName || '',
    depositDate: dateOf(payment.depositDate),
    status: payment.status || (amountOf(payment.pending) > 0 ? 'Pending' : 'Paid')
  };
};

export const toPortalReceiptRows = (payments = []) => payments.map(toPortalReceiptRow);

/**
 * Totals the receipt KPI cards print. Only money that reached the account is
 * counted as paid, so a cheque still with the bank shows as outstanding.
 */
export const receiptTotals = (rows = []) => {
  const numeric = (value) => parseFloat(String(value || '').replace(/[^\d.]/g, '')) || 0;

  return rows.reduce(
    (sum, row) => ({
      billed: sum.billed + numeric(row.totalAmount),
      paid: sum.paid + numeric(row.paidAmount),
      gst: sum.gst + (row.taxAmount === 'Not separately recorded' ? 0 : numeric(row.taxAmount)),
      pending: sum.pending + numeric(row.pendingAmount),
      settled: sum.settled + (isSettledStatus(row.status) ? 1 : 0)
    }),
    { billed: 0, paid: 0, gst: 0, pending: 0, settled: 0 }
  );
};
