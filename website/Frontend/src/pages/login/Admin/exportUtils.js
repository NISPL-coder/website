import * as XLSX from 'xlsx';
import { receiptDuration } from './adminTableUtils';

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
 * Format Customer records for clean spreadsheet export
 */
export function formatCustomersForExport(customers) {
  return customers.map((c) => ({
    'Customer ID': c.id,
    'Company / Organization': c.company,
    'Contact Representative': c.name,
    'Login Email': c.loginEmail || c.email,
    'Password': c.password || c.portalPassword || '—',
    'Last Login': c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleString('en-IN') : 'Never logged in',
    'Email Address': c.email,
    'Mobile / Phone': c.phone || '—',
    'Subscription Tier': c.plan || '—',
    'Monthly Recurring Revenue (MRR)': c.mrr || '—',
    'Account Status': (c.status || '').toUpperCase(),
    'Country': c.address?.country || c.country || 'India',
    'State': c.address?.state || c.state || 'West Bengal',
    'City': c.address?.city || c.city || 'Kolkata',
    'Street / Area': [c.address?.street, c.address?.area].filter(Boolean).join(', ') || '—',
    'Postal Code': c.address?.postalCode || c.postalCode || '—',
    'Sangam CRM Status': (c.sangamCrm?.status || 'synced').toUpperCase(),
    'Sangam CRM Record ID': c.sangamCrm?.recordId || '—',
    'Last Synced At': c.sangamCrm?.lastSyncedAt || '—',
    'Member Since': c.since || c.registered || '—'
  }));
}

/**
 * Format Contract records for clean spreadsheet export
 */
export function formatContractsForExport(contracts) {
  return contracts.map((ctr) => ({
    'Contract ID': ctr.id,
    'Contract Name': ctr.name || ctr.company || 'Enterprise Contract',
    'Company / Organization': ctr.company || ctr.name || '—',
    'Contact Person': ctr.customer || ctr.client || 'Authorized Signatory',
    'Contract Type': ctr.contractType || 'Subscription',
    'Subscription Period': ctr.subscriptionPeriod || '1 Year',
    'Total Contract Value': ctr.totalContractValue || ctr.value || '₹0',
    'Start Date': ctr.startDate || ctr.start || '—',
    'End Date': ctr.endDate || ctr.expiryDate || ctr.end || '—',
    'Contract Status': (ctr.status || '').toUpperCase(),
    'Service SLA Tier': ctr.service || ctr.plan || 'Cloud SLA Tier-1'
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
    'Invoice Number': p.invoiceNumber || p.invoiceRef || '—',
    'Invoice Date': p.invoiceDate || '—',
    'Received Amount': p.receivedAmount || p.amount || '—',
    'Pending Payment': p.pendingPayment || '₹0',
    'Expected Payment Date': p.expectedPaymentDate || '—',
    'Payment Received Date': p.paymentReceivedDate || p.date || '—',
    'Payment Method': p.paymentMethod || p.method || '—',
    'Bank Reference': p.referenceNumber || '—',
    'Bank / Branch': p.bankName || '—',
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
