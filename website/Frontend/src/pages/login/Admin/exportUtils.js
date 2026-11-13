import * as XLSX from 'xlsx';
import { formatStamp, receiptDuration } from './adminTableUtils';
import {
  normalizeContractStatus,
  normalizeContractType,
  contractPersonEmail,
  contractPersonMobile,
  contractActorName,
  formatContractStamp
} from './contractVocabulary';
import { customerLifecycleLabel } from '../../../utils/customerLifecycle';

/**
 * Clean & write data to .xlsx file with auto-fitted column widths
 */
export function exportToExcel(data, fileName = 'export') {
  if (!data || data.length === 0) return false;

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Compute maximum width per column
  const colWidths = {};
  data.forEach((row) => {
    Object.keys(row).forEach((key) => {
      const val = row[key] ? String(row[key]) : '';
      colWidths[key] = Math.max(colWidths[key] || key.length, val.length);
    });
  });

  worksheet['!cols'] = Object.keys(colWidths).map((key) => ({
    wch: Math.min(Math.max(colWidths[key] + 4, 14), 45)
  }));

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
  return true;
}

/**
 * Clean & write data to .csv file with UTF-8 BOM
 */
export function exportToCsv(data, fileName = 'export') {
  if (!data || data.length === 0) return false;

  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);

  // UTF-8 BOM (\uFEFF) ensures Excel and standard CSV viewers correctly render currency symbols and special chars
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Format Customer records for clean spreadsheet export: the same columns, in the
 * same order, as the directory table.
 */
export function formatCustomersForExport(customers) {
  return customers.map((c) => ({
    'Customer ID': c.id || '—',
    'Customer Name': c.name || '—',
    'Designation': c.designation || '—',
    'Company Name': c.company || '—',
    'Email': c.email || c.loginEmail || '—',
    'Password': c.password || c.portalPassword || '—',
    'Phone No.': c.phone || '—',
    'Orders': c.orderCount || 0,
    'City': c.address?.city || c.city || '—',
    'State': c.address?.state || c.state || '—',
    'Status': c.status ? customerLifecycleLabel(c.status) : '—',
    'Created At': formatStamp(c.createdAt || c.registered),
    'Updated At': formatStamp(c.updatedAt)
  }));
}

/**
 * Format Contract records for clean spreadsheet export
 */
export function formatContractsForExport(contracts) {
  return contracts.map((ctr) => ({
    'Contract ID': ctr.name || '—',
    'Company Name': ctr.company || '—',
    'Status': normalizeContractStatus(ctr.status) || '—',
    'Payment Status': ['yes', 'true', '1', 'paid'].includes(String(ctr.paymentStatus || '').toLowerCase())
      ? 'Yes'
      : ['no', 'false', '0', 'unpaid'].includes(String(ctr.paymentStatus || '').toLowerCase())
      ? 'No'
      : (ctr.paymentStatus || 'No'),
    'Person Email': contractPersonEmail(ctr) || '—',
    'Person Mobile': contractPersonMobile(ctr) || '—',
    'Contract Type': normalizeContractType(ctr.contractType) || '—',
    'Total Contract Value': ctr.totalContractValue || ctr.value || '—',
    'Start Date': ctr.startDate || '—',
    'End Date': ctr.endDate || ctr.expiryDate || '—',
    'Updated At': formatContractStamp(ctr.updatedAt),
    'Updated By': contractActorName(ctr.updatedBy) || '—',
    'Created At': formatContractStamp(ctr.createdAt),
    'Created By': contractActorName(ctr.createdBy) || '—'
  }));
}

/**
 * Format Payment records for clean spreadsheet export matching 10 fields
 */
export function formatPaymentsForExport(payments) {
  return payments.map((p) => ({
    'Transaction ID': p.id,
    'Name': p.name || p.customer || '—',
    'Account Name': p.accountName || p.company || '—',
    'Product / Plan': p.items?.[0]?.name || p.solutionCategory || p.productName || '—',
    'Invoice Number': p.invoiceNumber || p.invoiceRef || '—',
    'Invoice Date': p.invoiceDate || '—',
    'Received Amount': p.receivedAmount || p.amount || '—',
    'Pending Payment': p.pendingPayment || '₹0',
    'Taxable Amount': p.taxableAmount || '—',
    'GST Amount': p.gstAmount || '—',
    'Expected Payment Date': p.expectedPaymentDate || '—',
    'Payment Received Date': p.paymentReceivedDate || p.date || '—',
    'Payment Method': p.paymentMethod || p.method || '—',
    'Cheque / Ref No.': p.referenceNumber || p.chequeNumber || p.utrNumber || '—',
    'Bank / Branch': p.bankName || p.bank || '—',
    'Realisation Date': p.depositDate || p.realisationDate || '—',
    'Sales Person': p.salesPerson || p.staff || '—',
    'Notes / Remarks': p.notes || '—',
    'Proof Document': p.proof?.fileName || '—',
    'Status': (p.status || '').toUpperCase()
  }));
}

/**
 * Format Receipt records for clean spreadsheet export
 */
export function formatReceiptsForExport(receipts) {
  return receipts.map((r) => ({
    'Receipt / Invoice No': r.invoiceNumber || r.id || '—',
    'Payment ID': r.paymentId || '—',
    Organization: r.customer?.company || '—',
    Client: r.customer?.name || '—',
    'Customer Email': r.customer?.email || '—',
    'Customer ID': r.customer?.customerId || '—',
    GSTIN: r.customer?.gstNo || '—',
    'Product / Plan': r.productName || '—',
    'Sales Person': r.salesPerson || 'Not recorded',
    Duration: receiptDuration(r).label || 'Not recorded',
    'Valid From': r.term?.startDate || '—',
    'Valid To': r.term?.endDate || '—',
    'Contract No': r.contract?.id || 'Unlinked',
    'Taxable Value': r.baseAmount ?? '—',
    '18% GST': r.taxAmount ?? '—',
    CGST: r.cgst ?? '—',
    SGST: r.sgst ?? '—',
    'GST Basis': r.gstBasis || '—',
    'Total Paid': r.amount ?? '—',
    'Payment Mode': r.paymentMode || '—',
    'Recorded Through': r.source || '—',
    'Invoice Date': r.invoiceDate || '—',
    'Received Date': r.paymentReceivedDate || r.date || '—',
    Status: (r.status || '').toUpperCase()
  }));
}
