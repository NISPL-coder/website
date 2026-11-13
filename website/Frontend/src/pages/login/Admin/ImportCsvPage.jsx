import React, { useMemo, useRef, useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  XCircle,
  FileUp,
  Trash2,
  Building2,
  Users2,
  Copy,
  Check,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  ExternalLink,
  Search,
  Sparkles,
  RefreshCw,
  FileCheck2,
  FileSignature,
  CreditCard,
  Receipt as ReceiptIcon,
  Clock,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { customerApi } from '../../../services/customerApi';
import { notificationApi } from '../../../services/notificationApi';
import { usePermissions } from './PermissionsContext';
import {
  contractStatusTone,
  normalizeContractStatus,
  normalizeContractType,
  periodFromDates
} from './contractVocabulary';
import './AdminTools.css';

/* ------------------------------------------------------------------ *
 * RFC-4180 CSV Parser
 * ------------------------------------------------------------------ */
function parseCsvText(text) {
  const rows = [];
  let current = [''];
  let inQuotes = false;
  let rowIdx = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        current[current.length - 1] += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current[current.length - 1] += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        current.push('');
      } else if (ch === '\r' && next === '\n') {
        rows.push(current);
        current = [''];
        rowIdx++;
        i++;
      } else if (ch === '\n' || ch === '\r') {
        rows.push(current);
        current = [''];
        rowIdx++;
      } else {
        current[current.length - 1] += ch;
      }
    }
  }

  if (current.length > 1 || (current.length === 1 && current[0].trim().length > 0)) {
    rows.push(current);
  }

  return rows.filter((r) => r.some((cell) => String(cell || '').trim().length > 0));
}

function normalizeHeader(header) {
  return String(header || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function headerMatchers(field) {
  return [...field.aliases.map(normalizeHeader), normalizeHeader(field.label)];
}

/* ------------------------------------------------------------------ *
 * Master Spreadsheet Field Specification (Sections A, B, and C)
 * ------------------------------------------------------------------ */
const MASTER_FIELDS = [
  // SECTION A: Customer Columns (CustomerSection)
  { key: 'customerId', label: 'Customer ID', required: false, aliases: ['customerid', 'id', 'custid', 'clientid'] },
  { key: 'contactPerson', label: 'Customer Name', required: true, aliases: ['customername', 'contactperson', 'name', 'person', 'customer', 'firstname', 'fullname'] },
  { key: 'designation', label: 'Designation', required: false, aliases: ['designation', 'role', 'title', 'position'] },
  { key: 'companyName', label: 'Company Name', required: true, aliases: ['companyname', 'company', 'accountname', 'account', 'firm', 'organization'] },
  { key: 'email', label: 'Email', required: true, aliases: ['email', 'emailaddress', 'mail', 'corporateemail', 'contactemail'] },
  { key: 'loginEmail', label: 'Login Email', required: false, aliases: ['loginemail', 'useremail', 'usernameemail'] },
  { key: 'additionalEmails', label: 'Additional Emails', required: false, aliases: ['additionalemails', 'extraemails', 'ccemails', 'otheremails'] },
  { key: 'password', label: 'Password', required: false, aliases: ['password', 'portalpassword', 'pass'] },
  { key: 'phone', label: 'Phone Number', required: false, aliases: ['phonenumber', 'phone', 'mobile', 'contact', 'contactnumber'] },
  { key: 'additionalPhones', label: 'Additional Phones', required: false, aliases: ['additionalphones', 'extraphones', 'otherphones'] },
  { key: 'alternatePhone', label: 'Alternate Phone', required: false, aliases: ['alternatephone', 'altphone', 'landline'] },
  { key: 'city', label: 'City', required: false, aliases: ['city', 'addresscity'] },
  { key: 'state', label: 'State', required: false, aliases: ['state', 'addressstate'] },
  { key: 'postalCode', label: 'Postal Code', required: false, aliases: ['postalcode', 'pincode', 'zip', 'addresspostalcode'] },
  { key: 'address', label: 'Address', required: false, aliases: ['address', 'addressstreet', 'street'] },
  { key: 'gstin', label: 'GSTIN', required: false, aliases: ['gstin', 'gst', 'gstno'] },
  { key: 'pan', label: 'PAN', required: false, aliases: ['pan', 'panno'] },
  { key: 'website', label: 'Website', required: false, aliases: ['website', 'url'] },
  { key: 'industry', label: 'Industry', required: false, aliases: ['industry', 'industrydd'] },
  { key: 'tallySerialNo', label: 'Tally Serial No', required: false, aliases: ['tallyserialno', 'tallyslno', 'tallysl', 'tally'] },
  { key: 'customerStatus', label: 'Customer Status', required: false, aliases: ['customerstatus', 'clientstatus', 'accountstatus'] },

  // SECTION B: Contract Columns (ContractSection)
  { key: 'contractId', label: 'Contract Name / ID', required: false, aliases: ['contractnameid', 'contractname', 'contractid', 'agreement', 'dealname', 'name'] },
  { key: 'contractStatus', label: 'Contract Status', required: false, aliases: ['contractstatus', 'dealstatus', 'agreementstatus'] },
  { key: 'paymentStatus', label: 'Payment Status', required: false, aliases: ['paymentstatus', 'paid', 'ispaid', 'payment', 'paidstatus', 'payment_status', 'status'] },
  { key: 'personEmail', label: 'Person Email', required: false, aliases: ['personemail', 'signatoryemail'] },
  { key: 'personMobile', label: 'Person Mobile', required: false, aliases: ['personmobile', 'signatorymobile'] },
  { key: 'service', label: 'Product / Plan', required: false, aliases: ['productplan', 'serviceproduct', 'service', 'product', 'servicename', 'productname', 'plan'] },
  { key: 'contractType', label: 'Contract Type', required: false, aliases: ['contracttype', 'type', 'dealtype'] },
  { key: 'duration', label: 'Duration', required: false, aliases: ['duration', 'subscriptionperiod', 'period', 'term', 'validity'] },
  { key: 'productCategory', label: 'Product Category', required: false, aliases: ['productcategory', 'category', 'subcategory'] },
  { key: 'totalContractValue', label: 'Total Contract Value', required: false, aliases: ['totalcontractvalue', 'contractvalue', 'value', 'amount', 'tcv'] },
  { key: 'orderDate', label: 'Order Date', required: false, aliases: ['orderdate', 'orderedon', 'bookingdate'] },
  { key: 'startDate', label: 'Start Date', required: false, aliases: ['startdate', 'start', 'fromdate'] },
  { key: 'endDate', label: 'End Date', required: false, aliases: ['enddate', 'end', 'expirydate', 'validupto'] },
  { key: 'salesPerson', label: 'Sales Person', required: false, aliases: ['salesperson', 'sales', 'owner', 'accountmanager'] },
  { key: 'slaTier', label: 'SLA Tier', required: false, aliases: ['slatier', 'sla', 'slatype'] },
  { key: 'description', label: 'Remarks / Notes', required: false, aliases: ['remarksnotes', 'description', 'notes', 'summary', 'remarks'] },

  // SECTION C: Payment Columns (PaymentSection)
  { key: 'accountName', label: 'Account Name', required: false, aliases: ['accountname', 'billingname', 'partyname'] },
  { key: 'invoiceNumber', label: 'Invoice Number', required: false, aliases: ['invoicenumber', 'invoiceno', 'billno'] },
  { key: 'invoiceDate', label: 'Invoice Date', required: false, aliases: ['invoicedate', 'billdate'] },
  { key: 'receivedAmount', label: 'Received Amount', required: false, aliases: ['receivedamount', 'paidamount', 'settledamount'] },
  { key: 'pendingPayment', label: 'Pending Payment', required: false, aliases: ['pendingpayment', 'dueamount', 'balance'] },
  { key: 'taxableAmount', label: 'Taxable Amount', required: false, aliases: ['taxableamount', 'baseamount', 'taxablevalue'] },
  { key: 'gstAmount', label: 'GST Amount', required: false, aliases: ['gstamount', 'gstval', 'taxamount'] },
  { key: 'expectedPaymentDate', label: 'Expected Payment Date', required: false, aliases: ['expectedpaymentdate', 'duedate'] },
  { key: 'paymentReceivedDate', label: 'Payment Received Date', required: false, aliases: ['paymentreceiveddate', 'receiptdate', 'paidon'] },
  { key: 'paymentMode', label: 'Payment Method', required: false, aliases: ['paymentmethod', 'paymentmode', 'method', 'mode', 'instrument'] },
  { key: 'referenceNumber', label: 'Cheque / Reference Number', required: false, aliases: ['chequereferencenumber', 'chequenumber', 'referencenumber', 'refno', 'utr', 'chequeno'] },
  { key: 'bankName', label: 'Bank / Branch', required: false, aliases: ['bankbranch', 'bankname', 'bank', 'branch'] },
  { key: 'depositDate', label: 'Realisation Date', required: false, aliases: ['realisationdate', 'depositdate', 'clearingdate'] },
  { key: 'proof', label: 'Payment Proof', required: false, aliases: ['paymentproof', 'proof', 'receipturl', 'slip'] },
  { key: 'paymentRecordStatus', label: 'Payment Record Status', required: false, aliases: ['paymentrecordstatus', 'paymentstatusrecord', 'settlementstatus'] }
];

/* ------------------------------------------------------------------ *
 * Master Demo Template CSV matching all fields
 * ------------------------------------------------------------------ */
const DEMO_MASTER_CSV = `Customer ID,Customer Name,Designation,Company Name,Email,Login Email,Additional Emails,Password,Phone Number,Additional Phones,Alternate Phone,City,State,Postal Code,Address,GSTIN,PAN,Website,Industry,Tally Serial No,Customer Status,Contract Name / ID,Contract Status,Payment Status,Person Email,Person Mobile,Product / Plan,Contract Type,Duration,Product Category,Total Contract Value,Order Date,Start Date,End Date,Sales Person,SLA Tier,Remarks / Notes,Account Name,Invoice Number,Invoice Date,Received Amount,Pending Payment,Taxable Amount,GST Amount,Expected Payment Date,Payment Received Date,Payment Method,Cheque / Reference Number,Bank / Branch,Realisation Date,Payment Proof,Payment Record Status
CUST-1001,Priya Nair,Finance Director,Northgate Textiles Pvt Ltd,billing@northgate.com,billing@northgate.com,,Northgate@2026,9823456780,,,Ahmedabad,Gujarat,380015,Galaxy Complex S.G. Highway,24AAACN1234F1Z5,AAACN1234F,https://northgate.com,Manufacturing,784512963,Active,NISPL Cloud Agreement,In Progress,Yes,billing@northgate.com,9823456780,Tally Prime Cloud + VPS Gold,Comprehensive,1 Year,Service,"₹1,85,000",12-03-2026,01-04-2026,31-03-2027,Sourav Mukherjee,Tier-1 Priority NOC 99.99%,Managed Tally Prime hosting with automated backups,Northgate Textiles Pvt Ltd,INV-2026-1001,01-04-2026,"₹1,85,000",₹0,"₹1,56,780","₹28,220",01-04-2026,01-04-2026,NEFT / RTGS,CMS982374619,HDFC Bank - Salt Lake,01-04-2026,,Received
CUST-1002,Anil Ghosh,Accounts Head,Mahadev Logistics,accounts@mahadevlogistics.com,accounts@mahadevlogistics.com,,Mahadev@2026,9123456789,,,Kolkata,West Bengal,700001,24 Netaji Subhash Road,19AABCM5678K1ZQ,AABCM5678K,https://mahadevlogistics.com,Logistics,987654321,Active,AMC Support Contract,In Progress,Yes,accounts@mahadevlogistics.com,9123456789,Tally AMC & Remote Support,AMC,12 Months,Service,"₹60,000",02-04-2026,15-04-2026,14-04-2027,Nilmoni Ghosal,Tier-2 Business Hours NOC 99.9%,Annual maintenance and license support,Mahadev Logistics,INV-2026-1002,15-04-2026,"₹60,000",₹0,"₹50,847","₹9,153",15-04-2026,15-04-2026,Cheque,CHQ-482019,State Bank of India - Dalhousie,15-04-2026,,Received
CUST-1003,Rina Das,Operations Lead,Kaveri Foods,private@kaverifoods.com,private@kaverifoods.com,,Kaveri@2026,9876501234,,,Valsad,Gujarat,396001,12 Industrial Area Phase 2,24AABCK9012P1ZN,AABCK9012P,https://kaverifoods.com,Food Processing,456123789,Demo,Trial Proof Of Concept,DEMO,No,private@kaverifoods.com,9876501234,Tally Prime Cloud Trial,SHARED,1 Month,Software,₹0,10-10-2026,20-10-2026,19-11-2026,Nilmoni Ghosal,Tier-3 Standard NOC 99.5%,30-day evaluation trial of Cloud setup before purchase,Kaveri Foods,,,,,,,,,,,,Unpaid`;

export default function ImportCsvPage({ setCustomers }) {
  const { can } = usePermissions();
  const canImport = can('customer', 'create') || can('import_csv') || can('data_tools') || can('contract', 'create');

  // File Upload State
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [records, setRecords] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [credentials, setCredentials] = useState(null);

  // Credentials Search and Copy
  const [credSearchQuery, setCredSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});

  /* ------------------------------------------------------------------ *
   * File Handling (Supports Excel .xlsx/.xls and CSV .csv)
   * ------------------------------------------------------------------ */
  const handleFileSelect = async (file) => {
    if (!file) return;
    const isCsv = /\.csv$/i.test(file.name);
    const isExcel = /\.(xlsx|xls)$/i.test(file.name);
    if (!isCsv && !isExcel) {
      toast.error('Please choose a valid Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    try {
      let rows = [];
      if (isExcel) {
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: 'array', cellDates: false });
        const sheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];
        rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
      } else {
        const text = await file.text();
        rows = parseCsvText(text);
      }

      if (rows.length < 2) {
        toast.error('The spreadsheet file contains no data rows.');
        return;
      }

      const headerRow = rows[0].map(normalizeHeader);
      const map = MASTER_FIELDS.map((f) => {
        const matchers = headerMatchers(f);
        const index = headerRow.findIndex((h) => matchers.includes(h));
        return { ...f, index };
      });

      // Validate core required headers
      const missingRequired = map.filter((f) => f.required && f.index < 0).map((f) => f.label);
      if (missingRequired.length > 0) {
        toast.error(`Missing required column(s) in sheet header: ${missingRequired.join(', ')}`);
        return;
      }

      let autoCalcCount = 0;
      let duplicateInFileCount = 0;
      const seenInSheet = new Set();

      const parsed = rows.slice(1).map((cells) => {
        const item = {};
        map.forEach((f) => {
          item[f.key] = f.index >= 0 ? String(cells[f.index] ?? '').trim() : '';
        });

        // Auto-calculate Duration from Start Date and End Date if duration is blank
        if (!item.duration && item.startDate && item.endDate) {
          const computed = periodFromDates(item.startDate, item.endDate);
          if (computed) {
            item.duration = computed;
            item._durationAutoCalculated = true;
            autoCalcCount += 1;
          }
        }

        // Duplicate validation check (Company Name + Phone Number)
        const compNorm = String(item.companyName || '').trim().toLowerCase();
        const pDigits = String(item.phone || '').replace(/[^0-9]/g, '');
        const pLast10 = pDigits.length >= 10 ? pDigits.slice(-10) : pDigits;
        const key = `${compNorm}|${pLast10 || item.phone}`;

        if (compNorm && (pLast10 || item.phone)) {
          if (seenInSheet.has(key)) {
            item._isDuplicateInFile = true;
            duplicateInFileCount += 1;
          } else {
            seenInSheet.add(key);
          }
        }

        return item;
      });

      setFileName(file.name);
      setFileSize((file.size / 1024).toFixed(1) + ' KB');
      setRecords(parsed);
      setImportResults(null);
      setCredentials(null);

      const notes = [];
      if (autoCalcCount > 0) notes.push(`${autoCalcCount} duration(s) calculated`);
      if (duplicateInFileCount > 0) notes.push(`${duplicateInFileCount} duplicate(s) flagged`);

      toast.success(
        `Parsed ${parsed.length} master record(s)${notes.length ? ` (${notes.join(', ')})` : ''} from ${file.name}`
      );
    } catch (err) {
      toast.error(`Failed to read spreadsheet file: ${err.message}`);
    }
  };

  /* ------------------------------------------------------------------ *
   * Calculations for Summary Cards on Loaded Records
   * ------------------------------------------------------------------ */
  const previewStats = useMemo(() => {
    if (!records.length) return { total: 0, active: 0, demo: 0, duplicates: 0 };
    let active = 0;
    let demo = 0;
    let duplicates = 0;
    records.forEach((r) => {
      if (r._isDuplicateInFile) duplicates += 1;
      const statusRaw = String(r.paymentStatus || '').toLowerCase();
      if (['yes', 'true', '1', 'paid', 'y', 'active'].includes(statusRaw)) {
        active += 1;
      } else {
        demo += 1;
      }
    });
    return {
      total: records.length,
      active,
      demo,
      duplicates
    };
  }, [records]);

  /* ------------------------------------------------------------------ *
   * Execute Unified Master Import
   * ------------------------------------------------------------------ */
  const handleExecuteImport = async () => {
    if (!records.length || isImporting) return;
    setIsImporting(true);
    const toastId = toast.loading(`Importing ${records.length} records & provisioning Customer, Contract, Payment, and Receipt data...`);

    try {
      const res = await customerApi.importMaster(records);
      setImportResults(res);
      setCredentials(res.credentials || []);

      // Refresh global customer list for real-time dashboard updates
      try {
        const live = await customerApi.getCustomers();
        if (live && Array.isArray(live) && setCustomers) setCustomers(live);
      } catch (custErr) {
        console.warn('Customer list refresh note:', custErr.message);
      }

      // Broadcast update event across all open admin views
      try {
        window.dispatchEvent(new CustomEvent('nispl_data_changed', { detail: { resources: ['*'] } }));
      } catch {
        // Safe fallback
      }

      notificationApi.createNotification({
        type: 'customer_created',
        title: 'Master Import Completed',
        message: `Imported ${res.succeeded} master records (${res.activeCount} active, ${res.demoCount} demo trials, ${res.duplicateCount || 0} duplicates skipped, ${res.paymentsCount} payments, ${res.receiptsCount} receipts).`,
        severity: res.failed > 0 ? 'warning' : 'success',
        entityType: 'customer',
        metadata: { succeeded: res.succeeded, failed: res.failed, duplicateCount: res.duplicateCount, activeCount: res.activeCount, demoCount: res.demoCount, paymentsCount: res.paymentsCount }
      });

      if (res.duplicateCount > 0) {
        toast.success(`Import finished: ${res.succeeded} imported, ${res.duplicateCount} duplicate(s) prevented.`, { id: toastId });
      } else if (res.succeeded === records.length) {
        toast.success(`All ${res.succeeded} record(s) imported! Active accounts, demo trials, payments & receipts provisioned.`, { id: toastId });
      } else {
        toast.success(`Import finished: ${res.succeeded} succeeded, ${res.failed} failed. Credentials and receipts generated.`, { id: toastId });
      }
    } catch (err) {
      toast.error(`Import failed: ${err.message}`, { id: toastId });
    } finally {
      setIsImporting(false);
    }
  };

  /* ------------------------------------------------------------------ *
   * Template Download Helpers (Excel with Formula & CSV)
   * ------------------------------------------------------------------ */
  const downloadTemplate = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const downloadMasterExcelTemplate = () => {
    try {
      const headers = MASTER_FIELDS.map((f) => f.label);
      const sampleRows = [
        [
          'CUST-1001', 'Priya Nair', 'Finance Director', 'Northgate Textiles Pvt Ltd',
          'billing@northgate.com', 'billing@northgate.com', '', 'Northgate@2026', '9823456780', '', '',
          'Ahmedabad', 'Gujarat', '380015', 'Galaxy Complex S.G. Highway', '24AAACN1234F1Z5', 'AAACN1234F',
          'https://northgate.com', 'Manufacturing', '784512963', 'Active',
          'NISPL Cloud Agreement', 'In Progress', 'Yes', 'billing@northgate.com', '9823456780',
          'Tally Prime Cloud + VPS Gold', 'Comprehensive', '1 Year', 'Service', '₹1,85,000',
          '12-03-2026', '01-04-2026', '31-03-2027', 'Sourav Mukherjee', 'Tier-1 Priority NOC 99.99%',
          'Managed Tally Prime hosting with automated backups',
          'Northgate Textiles Pvt Ltd', 'INV-2026-1001', '01-04-2026', '₹1,85,000', '₹0', '₹1,56,780', '₹28,220',
          '01-04-2026', '01-04-2026', 'NEFT / RTGS', 'CMS982374619', 'HDFC Bank - Salt Lake', '01-04-2026', '', 'Received'
        ],
        [
          'CUST-1002', 'Anil Ghosh', 'Accounts Head', 'Mahadev Logistics',
          'accounts@mahadevlogistics.com', 'accounts@mahadevlogistics.com', '', 'Mahadev@2026', '9123456789', '', '',
          'Kolkata', 'West Bengal', '700001', '24 Netaji Subhash Road', '19AABCM5678K1ZQ', 'AABCM5678K',
          'https://mahadevlogistics.com', 'Logistics', '987654321', 'Active',
          'AMC Support Contract', 'In Progress', 'Yes', 'accounts@mahadevlogistics.com', '9123456789',
          'Tally AMC & Remote Support', 'AMC', '1 Year', 'Service', '₹60,000',
          '02-04-2026', '15-04-2026', '14-04-2027', 'Nilmoni Ghosal', 'Tier-2 Business Hours NOC 99.9%',
          'Annual maintenance and license support',
          'Mahadev Logistics', 'INV-2026-1002', '15-04-2026', '₹60,000', '₹0', '₹50,847', '₹9,153',
          '15-04-2026', '15-04-2026', 'Cheque', 'CHQ-482019', 'State Bank of India - Dalhousie', '15-04-2026', '', 'Received'
        ],
        [
          'CUST-1003', 'Rina Das', 'Operations Lead', 'Kaveri Foods',
          'private@kaverifoods.com', 'private@kaverifoods.com', '', 'Kaveri@2026', '9876501234', '', '',
          'Valsad', 'Gujarat', '396001', '12 Industrial Area Phase 2', '24AABCK9012P1ZN', 'AABCK9012P',
          'https://kaverifoods.com', 'Food Processing', '456123789', 'Demo',
          'Trial Proof Of Concept', 'DEMO', 'No', 'private@kaverifoods.com', '9876501234',
          'Tally Prime Cloud Trial', 'SHARED', '1 Month', 'Software', '₹0',
          '10-10-2026', '20-10-2026', '19-11-2026', 'Nilmoni Ghosal', 'Tier-3 Standard NOC 99.5%',
          '30-day evaluation trial before purchase',
          'Kaveri Foods', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Unpaid'
        ]
      ];

      const wsData = [headers, ...sampleRows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Duration Column is column AC (index 28), Start Date is AG (col 32), End Date is AH (col 33)
      const durationColLetter = XLSX.utils.encode_col(headers.indexOf('Duration'));
      const startColLetter = XLSX.utils.encode_col(headers.indexOf('Start Date'));
      const endColLetter = XLSX.utils.encode_col(headers.indexOf('End Date'));

      for (let r = 2; r <= sampleRows.length + 1; r++) {
        const formula = `IF(OR(${startColLetter}${r}="",${endColLetter}${r}=""), "", IF(DATEDIF(${startColLetter}${r},${endColLetter}${r}+1,"Y")>0, DATEDIF(${startColLetter}${r},${endColLetter}${r}+1,"Y") & IF(DATEDIF(${startColLetter}${r},${endColLetter}${r}+1,"Y")=1," Year"," Years"), DATEDIF(${startColLetter}${r},${endColLetter}${r}+1,"M") & IF(DATEDIF(${startColLetter}${r},${endColLetter}${r}+1,"M")=1," Month"," Months")))`;
        ws[`${durationColLetter}${r}`] = {
          t: 's',
          f: formula,
          v: r === 4 ? '1 Month' : '1 Year'
        };
      }

      ws['!cols'] = headers.map((h) => ({ wch: Math.max(h.length + 4, 16) }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Master_Template');
      XLSX.writeFile(wb, 'nispl_master_import_template.xlsx');
      toast.success('Downloaded Master Excel Template (.xlsx) with auto-calculating Duration formula!');
    } catch (err) {
      toast.error(`Failed to export Excel template: ${err.message}`);
    }
  };

  /* ------------------------------------------------------------------ *
   * Credentials Vault Helpers
   * ------------------------------------------------------------------ */
  const copySingleCredential = (cred, indexKey) => {
    const text = `Company: ${cred.company}\nCustomer ID / Username: ${cred.customerId || cred.username}\nEmail: ${cred.email}\nPassword: ${cred.password}\nLogin URL: ${window.location.origin}/customer/login`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(indexKey);
    toast.success(`Copied login credentials for "${cred.company || cred.name}"`);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllCredentials = (credsList) => {
    if (!credsList || !credsList.length) return;
    const header = 'Company\tContact Person\tCustomer ID (Username)\tEmail\tPassword\tStatus\tLogin URL\n';
    const rows = credsList
      .map(
        (c) =>
          `${c.company}\t${c.name}\t${c.customerId || c.username}\t${c.email}\t${c.password}\t${c.status}\t${window.location.origin}/customer/login`
      )
      .join('\n');
    navigator.clipboard.writeText(header + rows);
    toast.success(`Copied all ${credsList.length} customer credentials to clipboard!`);
  };

  const downloadCredentialsCsv = (credsList, filenamePrefix = 'NISPL_Customer_Credentials') => {
    if (!credsList || !credsList.length) return;
    const headers = ['Company', 'Contact Person', 'Customer ID (Username)', 'Email', 'Password', 'Role', 'Status', 'Login URL'];
    const rows = credsList.map((c) => [
      `"${c.company || ''}"`,
      `"${c.name || ''}"`,
      `"${c.customerId || c.username || ''}"`,
      `"${c.email || ''}"`,
      `"${c.password || ''}"`,
      `"${c.role || 'customer'}"`,
      `"${c.status || 'Active'}"`,
      `"${window.location.origin}/customer/login"`
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filenamePrefix}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${credsList.length} customer credentials as CSV.`);
  };

  const filteredCredentials = useMemo(() => {
    if (!credentials) return [];
    if (!credSearchQuery.trim()) return credentials;
    const q = credSearchQuery.toLowerCase();
    return credentials.filter(
      (c) =>
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.customerId && c.customerId.toLowerCase().includes(q))
    );
  }, [credentials, credSearchQuery]);

  return (
    <div className="animate-fade-in" style={{ padding: '0 2px' }}>
      {/* =========================================================================
         TOP HERO HEADER CARD
         ========================================================================= */}
      <div className="adm-import-header-card">
        <div className="adm-import-header-top">
          <div className="adm-import-header-title-box">
            <div className="adm-import-header-icon-badge">
              <FileSpreadsheet size={26} />
            </div>
            <div className="adm-import-title-text">
              <h1>Bulk Import (CSV / Excel) — Master Unified Import</h1>
              <p>
                Upload a single master spreadsheet to simultaneously provision Customers, Contracts, settled Payments, and official Receipts.
                Rows with <strong>Payment Status: Yes</strong> populate the <strong>Active list</strong> and <strong>Demo/Active Directory</strong>, record a settled payment in the ledger, and generate an official receipt. Rows with <strong>Payment Status: No</strong> populate the <strong>Demo list</strong> with an unbilled trial agreement.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
          <span className="adm-status-pill active" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Building2 size={12} />
            Customer Accounts (Active &amp; Demo)
          </span>
          <span className="adm-status-pill active" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <FileSignature size={12} />
            Contracts (Sangam CRM Sync)
          </span>
          <span className="adm-status-pill active" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <CreditCard size={12} />
            Payment Ledger (For Paid Records)
          </span>
          <span className="adm-status-pill active" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <ReceiptIcon size={12} />
            Official Receipts Generated
          </span>
        </div>
      </div>

      {/* =========================================================================
         SINGLE MASTER UPLOAD & SPECIFICATION SECTION
         ========================================================================= */}
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) handleFileSelect(e.target.files[0]);
        }}
      />

      {!fileName ? (
        /* 2-Column Studio: Left Drag & Drop Zone + Right Requirements & Demo Download */
        <div className="adm-import-grid">
          {/* Left: Drag & Drop Zone */}
          <div
            className={`adm-import-dropzone ${isDragging ? 'is-dragging' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelect(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <div className="adm-import-dropzone-icon">
              <Upload size={30} />
            </div>
            <h3 className="adm-import-dropzone-title">Click or drag &amp; drop Master Spreadsheet</h3>
            <p className="adm-import-dropzone-sub">
              Upload all customer, contract, and payment data in a single file. Supports Excel (.xlsx, .xls) and CSV (.csv) files with auto-detected headers.
            </p>
            <button
              type="button"
              className="adm-import-btn-browse"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current && fileInputRef.current.click();
              }}
            >
              <FileUp size={16} style={{ color: '#6366f1' }} />
              <span>Browse Master Spreadsheet (Excel / CSV)</span>
            </button>
          </div>

          {/* Right: Specification Guide & Download Demo Template */}
          <div className="adm-import-guide-card">
            <div>
              <div className="adm-import-guide-header">
                <h4 className="adm-import-guide-title">Master Spreadsheet Specification</h4>
                <span className="adm-import-guide-meta">Sections A, B, and C ({MASTER_FIELDS.length} columns)</span>
              </div>

              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0' }}>
                Unified headers recognized across Customer, Contract, and Payment modules:
              </p>

              {/* Grouped Specification Chips */}
              <div className="adm-import-chip-list">
                <span className="adm-import-col-chip required">Customer Name *</span>
                <span className="adm-import-col-chip required">Company Name *</span>
                <span className="adm-import-col-chip required">Email *</span>
                <span className="adm-import-col-chip">Phone Number</span>
                <span className="adm-import-col-chip">Designation</span>
                <span className="adm-import-col-chip">City / State / Postal Code</span>
                <span className="adm-import-col-chip">Contract Name / ID</span>
                <span className="adm-import-col-chip">Product / Plan</span>
                <span className="adm-import-col-chip">Contract Type</span>
                <span className="adm-import-col-chip" style={{ background: '#ede9fe', borderColor: '#c4b5fd', color: '#6d28d9', fontWeight: 600 }}>
                  Duration (Auto-Calculated)
                </span>
                <span className="adm-import-col-chip">Total Contract Value</span>
                <span className="adm-import-col-chip" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d', fontWeight: 600 }}>
                  Start &amp; End Dates
                </span>
                <span className="adm-import-col-chip" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857', fontWeight: 700 }}>
                  Payment Status (Yes / No) *
                </span>
                <span className="adm-import-col-chip">Payment Method</span>
                <span className="adm-import-col-chip">Cheque / Ref No.</span>
                <span className="adm-import-col-chip">Bank / Branch</span>
                <span className="adm-import-col-chip">Sales Person</span>
                <span className="adm-import-col-chip">Remarks / Notes</span>
              </div>

              {/* Dynamic Routing Explanation */}
              <div className="adm-import-guide-note">
                <strong>Dynamic List Storage, Calculations &amp; Duplicate Protection:</strong>
                <ul style={{ margin: '6px 0 0 16px', padding: 0, fontSize: '0.76rem', color: '#475569', lineHeight: 1.5 }}>
                  <li>
                    <strong>Payment Status = Yes:</strong> Stored in the <strong>Active list</strong> and <strong>Demo/Active Directory</strong>, Contract marked <strong>In Progress</strong>, settled Payment created, and an official <strong>Receipt is generated</strong>.
                  </li>
                  <li>
                    <strong>Payment Status = No:</strong> Stored in the <strong>Demo list</strong> and <strong>Demo/Active Directory</strong> with a trial agreement registered; no payment or receipt is created.
                  </li>
                  <li>
                    <strong>Auto-Calculated Duration:</strong> Derived from Start Date and End Date (e.g. 10-01-2024 to 09-01-2027 = 3 Years) and synced to Sangam CRM as subscription period (36 months).
                  </li>
                  <li>
                    <strong>Duplicate Prevention:</strong> If <strong>Company Name</strong> and <strong>Phone Number</strong> repeat in the upload sheet or the exact contract is already provisioned, the duplicate entry will be skipped.
                  </li>
                  <li>
                    Customer Portal login credentials (username &amp; secure password) are automatically provisioned for every company.
                  </li>
                </ul>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <button
                type="button"
                className="adm-btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '9px 16px', fontSize: '0.82rem' }}
                onClick={downloadMasterExcelTemplate}
              >
                <FileSpreadsheet size={16} />
                <span>Download Master Excel Template (.xlsx) [Auto-Formula]</span>
              </button>

              <button
                type="button"
                className="adm-import-template-download-btn"
                style={{ width: '100%', justifyContent: 'center', margin: 0 }}
                onClick={() => downloadTemplate(DEMO_MASTER_CSV, 'nispl_master_import_template.csv')}
              >
                <Download size={15} />
                <span>Download Master Demo Template (.csv)</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* File Loaded State Banner */
        <div className="adm-import-file-card">
          <div className="adm-import-file-details">
            <div className="adm-import-file-icon">
              <FileCheck2 size={26} />
            </div>
            <div className="adm-import-file-text">
              <h4>
                <span>{fileName}</span>
                <span className="adm-status-pill active" style={{ fontSize: '0.72rem' }}>
                  {records.length} Records Parsed
                </span>
              </h4>
              <p>
                File Size: {fileSize} • Master columns recognized • Ready to import into respective lists
              </p>
            </div>
          </div>

          <div className="adm-import-file-actions">
            <button
              type="button"
              className="adm-import-btn-clear"
              onClick={() => {
                setFileName('');
                setFileSize('');
                setRecords([]);
                setImportResults(null);
                setCredentials(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              <Trash2 size={14} />
              <span>Remove File</span>
            </button>

            <button
              type="button"
              className="adm-import-btn-browse"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <RefreshCw size={14} />
              <span>Replace File</span>
            </button>

            <button
              type="button"
              className="adm-btn-primary"
              onClick={handleExecuteImport}
              disabled={isImporting || !canImport}
              title={canImport ? undefined : 'Requires create permission on customer/data tools'}
              style={{ padding: '9px 20px', fontSize: '0.88rem' }}
            >
              <FileUp size={16} />
              <span>
                {isImporting
                  ? 'Importing Master Data & Provisioning...'
                  : `Import ${records.length} Master Records`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Permission Warning if unauthorized */}
      {!canImport && (
        <div className="adm-import-guide-note" style={{ marginTop: '12px' }}>
          <ShieldCheck size={14} style={{ color: '#b45309', marginRight: '6px', verticalAlign: '-2px' }} />
          Your role can inspect the master sheet, but importing requires create permissions. Ask an administrator for &quot;Customer — Add&quot; or &quot;Data Tools&quot; access.
        </div>
      )}

      {/* =========================================================================
         LIVE PARSED RECORDS PREVIEW & SUMMARY STATS
         ========================================================================= */}
      {records.length > 0 && (
        <div className="animate-fade-in" style={{ marginTop: '18px' }}>
          {/* Summary Metric Counters */}
          <div className="adm-customer-summary-grid" style={{ marginBottom: '16px' }}>
            <div className="adm-cust-stat-card">
              <div className="adm-cust-stat-top">
                <span className="adm-cust-stat-label">Total Records</span>
                <FileSpreadsheet size={18} className="adm-cust-stat-icon purple" />
              </div>
              <span className="adm-cust-stat-val" style={{ color: '#6366f1' }}>{previewStats.total}</span>
              <span className="adm-cust-stat-desc">Parsed from uploaded sheet</span>
            </div>

            <div className="adm-cust-stat-card">
              <div className="adm-cust-stat-top">
                <span className="adm-cust-stat-label">Active Clients (Paid)</span>
                <CheckCircle2 size={18} className="adm-cust-stat-icon emerald" />
              </div>
              <span className="adm-cust-stat-val" style={{ color: '#059669' }}>{previewStats.active}</span>
              <span className="adm-cust-stat-desc">Payment: Yes → Active + Receipt</span>
            </div>

            <div className="adm-cust-stat-card">
              <div className="adm-cust-stat-top">
                <span className="adm-cust-stat-label">Demo Trials (Unpaid)</span>
                <Clock size={18} className="adm-cust-stat-icon amber" />
              </div>
              <span className="adm-cust-stat-val" style={{ color: '#d97706' }}>{previewStats.demo}</span>
              <span className="adm-cust-stat-desc">Payment: No → Demo listing</span>
            </div>

            <div className="adm-cust-stat-card">
              <div className="adm-cust-stat-top">
                <span className="adm-cust-stat-label">Duplicates In Sheet</span>
                <AlertTriangle size={18} className="adm-cust-stat-icon rose" />
              </div>
              <span className="adm-cust-stat-val" style={{ color: previewStats.duplicates > 0 ? '#e11d48' : '#64748b' }}>
                {previewStats.duplicates}
              </span>
              <span className="adm-cust-stat-desc">
                {previewStats.duplicates > 0 ? 'Same Company + Phone (Skipped)' : 'No duplicates detected'}
              </span>
            </div>
          </div>

          {/* Parsed Master Table */}
          <div className="adm-import-preview-section">
            <div className="adm-import-preview-header">
              <div className="adm-import-preview-title">
                <FileCheck2 size={18} style={{ color: '#6366f1' }} />
                <span>Parsed Master Preview ({records.length} records ready)</span>
              </div>
              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                Showing first {Math.min(records.length, 8)} rows
              </span>
            </div>

            <div className="adm-import-preview-table-wrap">
              <table className="adm-import-preview-table">
                <thead>
                  <tr>
                    <th style={{ width: '55px', textAlign: 'center' }}>S/No.</th>
                    <th>Company Name</th>
                    <th>Contact Person</th>
                    <th>Email &amp; Phone</th>
                    <th>Contract / Service</th>
                    <th>Type &amp; Duration</th>
                    <th>Total Value</th>
                    <th style={{ textAlign: 'center' }}>Payment Status</th>
                    <th>Payment Mode / Ref</th>
                    <th>Sales Person</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 8).map((rec, idx) => {
                    const isPaid = ['yes', 'true', '1', 'paid', 'y', 'active'].includes(String(rec.paymentStatus || '').toLowerCase());
                    return (
                      <tr key={idx} style={rec._isDuplicateInFile ? { backgroundColor: '#fff1f2' } : undefined}>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>
                          <div>{rec.companyName}</div>
                          {rec._isDuplicateInFile && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', fontWeight: 600, color: '#e11d48', background: '#ffe4e6', padding: '1px 6px', borderRadius: '4px', marginTop: '3px' }}>
                              <AlertTriangle size={10} /> Duplicate in File (Will Skip)
                            </span>
                          )}
                        </td>
                        <td style={{ fontWeight: 600, color: '#334155' }}>
                          <div>{rec.contactPerson}</div>
                          {rec.designation && <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{rec.designation}</span>}
                        </td>
                        <td style={{ fontSize: '0.78rem' }}>
                          <div style={{ color: '#475569' }}>{rec.email}</div>
                          <div style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{rec.phone || '—'}</div>
                        </td>
                        <td style={{ fontSize: '0.80rem', color: '#334155' }}>
                          <div style={{ fontWeight: 600 }}>{rec.service || rec.contractId || 'Cloud Server'}</div>
                          {rec.contractId && <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{rec.contractId}</span>}
                        </td>
                        <td style={{ fontSize: '0.78rem' }}>
                          <div>{normalizeContractType(rec.contractType) || rec.contractType || 'Comprehensive'}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{rec.duration || '1 Year'}</span>
                            {rec._durationAutoCalculated && (
                              <span style={{ fontSize: '0.65rem', background: '#e0e7ff', color: '#4338ca', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>
                                Auto-calc
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                          {rec.totalContractValue || '₹0'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`adm-status-pill ${isPaid ? 'active' : 'inactive'}`}>
                            {isPaid ? 'Yes (Active)' : 'No (Demo)'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.76rem' }}>
                          <div>{rec.paymentMode || (isPaid ? 'NEFT Wire' : '—')}</div>
                          {rec.referenceNumber && <span style={{ fontFamily: 'monospace', color: '#64748b' }}>Ref: {rec.referenceNumber}</span>}
                        </td>
                        <td style={{ fontSize: '0.78rem', color: '#475569' }}>{rec.salesPerson || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         IMPORT RESULTS BREAKDOWN & GENERATED CREDENTIALS VAULT
         ========================================================================= */}
      {importResults && (
        <div className="adm-import-preview-section" style={{ marginTop: '22px' }}>
          <div className="adm-import-preview-header">
            <div className="adm-import-preview-title">
              <Sparkles size={18} style={{ color: '#16a34a' }} />
              <span>Import Execution Results</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="adm-status-pill active">{importResults.succeeded} Succeeded</span>
              {importResults.duplicateCount > 0 && <span className="adm-status-pill inactive" style={{ background: '#ffe4e6', color: '#e11d48' }}>{importResults.duplicateCount} Duplicates Skipped</span>}
              {importResults.failed > 0 && <span className="adm-status-pill inactive">{importResults.failed} Failed</span>}
            </div>
          </div>

          <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Active Clients</span>
              <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#059669', fontSize: '1.05rem' }}>{importResults.activeCount || 0}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Demo Trials</span>
              <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#d97706', fontSize: '1.05rem' }}>{importResults.demoCount || 0}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Duplicates Prevented</span>
              <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#e11d48', fontSize: '1.05rem' }}>{importResults.duplicateCount || 0}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Payments Settled</span>
              <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#2563eb', fontSize: '1.05rem' }}>{importResults.paymentsCount || 0}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Official Receipts</span>
              <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#6366f1', fontSize: '1.05rem' }}>{importResults.receiptsCount || 0}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Sangam CRM Synced</span>
              <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>{importResults.crmSyncCount || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Generated Customer Credentials Vault */}
      {credentials && credentials.length > 0 && (
        <div className="adm-creds-container" style={{ marginTop: '20px' }}>
          <div className="adm-creds-header">
            <div className="adm-creds-title-group">
              <div className="adm-creds-icon">
                <Key size={22} />
              </div>
              <div>
                <h3 className="adm-creds-title">Customer Login Credentials Generated</h3>
                <p className="adm-creds-subtitle">
                  {credentials.length} customer portal accounts provisioned with login credentials
                </p>
              </div>
            </div>

            <div className="adm-creds-actions">
              <button
                type="button"
                className="adm-creds-copy-btn"
                onClick={() => copyAllCredentials(credentials)}
              >
                <Copy size={13} />
                <span>Copy All Credentials</span>
              </button>

              <button
                type="button"
                className="adm-btn-primary"
                style={{ fontSize: '0.78rem', padding: '7px 14px' }}
                onClick={() => downloadCredentialsCsv(credentials, 'NISPL_Master_Customer_Credentials')}
              >
                <Download size={13} />
                <span>Download CSV</span>
              </button>

              <a
                href="/customer/login"
                target="_blank"
                rel="noreferrer"
                className="adm-btn-secondary"
                style={{ fontSize: '0.78rem', padding: '7px 14px', textDecoration: 'none' }}
              >
                <ExternalLink size={13} />
                <span>Customer Login</span>
              </a>
            </div>
          </div>

          {/* Search Box */}
          <div className="adm-creds-search-row">
            <div className="adm-creds-search-box">
              <Search size={14} className="adm-creds-search-icon" />
              <input
                type="text"
                placeholder="Search generated accounts by company, person, or email..."
                value={credSearchQuery}
                onChange={(e) => setCredSearchQuery(e.target.value)}
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Showing {filteredCredentials.length} of {credentials.length} accounts
            </span>
          </div>

          {/* Credentials Card Grid */}
          <div className="adm-creds-grid">
            {filteredCredentials.map((cred, idx) => {
              const isCopied = copiedIndex === idx;
              const isPassVisible = Boolean(showPasswords[idx]);
              return (
                <div key={idx} className="adm-cred-card">
                  <div className="adm-cred-card-header">
                    <div>
                      <h4 className="adm-cred-card-company">{cred.company || 'Enterprise Client'}</h4>
                      <p className="adm-cred-card-person">{cred.name || cred.contactPerson}</p>
                    </div>
                    <span className={`adm-status-pill ${cred.status === 'Active' ? 'active' : 'inactive'}`}>
                      {cred.status}
                    </span>
                  </div>

                  <div className="adm-cred-fields">
                    <div className="adm-cred-field-row">
                      <span className="adm-cred-field-label">Username / ID:</span>
                      <span className="adm-cred-field-val mono">{cred.customerId || cred.username}</span>
                    </div>
                    <div className="adm-cred-field-row">
                      <span className="adm-cred-field-label">Email:</span>
                      <span className="adm-cred-field-val">{cred.email}</span>
                    </div>
                    <div className="adm-cred-field-row">
                      <span className="adm-cred-field-label">Password:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="adm-cred-field-val mono" style={{ letterSpacing: isPassVisible ? '0' : '2px' }}>
                          {isPassVisible ? cred.password : '••••••••••••'}
                        </span>
                        <button
                          type="button"
                          className="adm-cred-toggle-btn"
                          onClick={() =>
                            setShowPasswords((prev) => ({ ...prev, [idx]: !prev[idx] }))
                          }
                          title={isPassVisible ? 'Hide password' : 'Show password'}
                        >
                          {isPassVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="adm-cred-card-copy-btn"
                    onClick={() => copySingleCredential(cred, idx)}
                  >
                    {isCopied ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
                    <span>{isCopied ? 'Copied' : 'Copy Credentials'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
