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
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { customerApi } from '../../../services/customerApi';
import { notificationApi } from '../../../services/notificationApi';
import { usePermissions } from './PermissionsContext';
import {
  contractStatusTone,
  normalizeContractStatus,
  normalizeContractType
} from './contractVocabulary';
import './AdminTools.css';

/* ------------------------------------------------------------------ *
 * RFC-4180 CSV Parser
 * ------------------------------------------------------------------ */
function parseCsvText(text) {
  const rows = [];
  let current = [''];
  let row = current;
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          row[row.length - 1] += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        row[row.length - 1] += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push('');
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      rows.push(row);
      row = [''];
      current = row;
    } else {
      row[row.length - 1] += ch;
    }
  }
  rows.push(row);
  return rows.filter((r) => r.some((cell) => String(cell).trim() !== ''));
}

function normalizeHeader(header) {
  return String(header || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function headerMatchers(field) {
  return [...field.aliases.map(normalizeHeader), normalizeHeader(field.label)];
}

/* ------------------------------------------------------------------ *
 * Unified Master CSV Field Specification
 * Maps Company, Contact, Contract, Payment, and Receipt generation
 * ------------------------------------------------------------------ */
const MASTER_FIELDS = [
  // 1. Company & Account Details
  { key: 'companyName', label: 'Company Name', required: true, aliases: ['companyname', 'company', 'accountname', 'account', 'firm', 'organization'] },
  { key: 'contactPerson', label: 'Contact Person', required: true, aliases: ['contactperson', 'person', 'name', 'customername', 'customer', 'firstname', 'fullname'] },
  { key: 'email', label: 'Email', required: true, aliases: ['email', 'emailaddress', 'mail', 'corporateemail', 'contactemail'] },
  { key: 'phone', label: 'Phone', required: false, aliases: ['phone', 'phonenumber', 'mobile', 'contact'] },
  { key: 'designation', label: 'Designation', required: false, aliases: ['designation', 'role', 'title', 'position'] },
  { key: 'industry', label: 'Industry', required: false, aliases: ['industry', 'industrydd'] },
  { key: 'tallySerialNo', label: 'Tally SL No', required: false, aliases: ['tallyslno', 'tallyserialno', 'tallysl', 'tally'] },
  { key: 'address', label: 'Address', required: false, aliases: ['address', 'addressstreet', 'street'] },
  { key: 'city', label: 'City', required: false, aliases: ['city', 'addresscity'] },
  { key: 'state', label: 'State', required: false, aliases: ['state', 'addressstate'] },
  { key: 'postalCode', label: 'Postal Code', required: false, aliases: ['postalcode', 'pincode', 'zip', 'addresspostalcode'] },
  { key: 'gstin', label: 'GSTIN', required: false, aliases: ['gstin', 'gst', 'gstno'] },
  { key: 'pan', label: 'PAN', required: false, aliases: ['pan', 'panno'] },
  { key: 'website', label: 'Website', required: false, aliases: ['website', 'url'] },

  // 2. Contract Details
  { key: 'contractId', label: 'Contract ID', required: false, aliases: ['contractid', 'contractname', 'name', 'agreement', 'contracttitle', 'dealname'] },
  { key: 'service', label: 'Service / Product', required: false, aliases: ['service', 'product', 'servicename', 'productname', 'plan'] },
  { key: 'contractType', label: 'Contract Type', required: false, aliases: ['contracttype', 'type', 'dealtype'] },
  { key: 'duration', label: 'Duration', required: false, aliases: ['duration', 'subscriptionperiod', 'period', 'term', 'validity'] },
  { key: 'productCategory', label: 'Product Category', required: false, aliases: ['productcategory', 'category', 'subcategory'] },
  { key: 'totalContractValue', label: 'Total Contract Value', required: false, aliases: ['totalcontractvalue', 'contractvalue', 'value', 'amount', 'tcv'] },
  { key: 'orderDate', label: 'Order Date', required: false, aliases: ['orderdate', 'orderedon', 'bookingdate'] },
  { key: 'startDate', label: 'Start Date', required: false, aliases: ['startdate', 'start', 'fromdate'] },
  { key: 'endDate', label: 'End Date', required: false, aliases: ['enddate', 'end', 'expirydate', 'validupto'] },

  // 3. Payment & Settlement (Yes -> Active & Paid, No -> Demo & Trial)
  { key: 'paymentStatus', label: 'Payment Status', required: false, aliases: ['paymentstatus', 'paid', 'ispaid', 'payment', 'paidstatus', 'payment_status', 'status'] },
  { key: 'paymentMode', label: 'Payment Mode', required: false, aliases: ['paymentmode', 'paymentmethod', 'method', 'mode', 'instrument'] },
  { key: 'referenceNumber', label: 'Cheque / Ref No.', required: false, aliases: ['chequenumber', 'referencenumber', 'refno', 'utr', 'chequeno'] },
  { key: 'bankName', label: 'Bank / Branch', required: false, aliases: ['bankname', 'bankbranch', 'bank', 'branch'] },
  { key: 'salesPerson', label: 'Sales Person', required: false, aliases: ['salesperson', 'sales', 'owner', 'accountmanager'] },
  { key: 'slaTier', label: 'SLA Tier', required: false, aliases: ['slatier', 'sla', 'slatype'] },
  { key: 'description', label: 'Description', required: false, aliases: ['description', 'notes', 'summary', 'remarks'] }
];

/* ------------------------------------------------------------------ *
 * Master Demo Template CSV matching all fields
 * ------------------------------------------------------------------ */
const DEMO_MASTER_CSV = `Company Name,Contact Person,Email,Phone,Designation,Industry,Tally Serial No,Address,City,State,Postal Code,GSTIN,PAN,Website,Contract ID,Service / Product,Contract Type,Duration,Product Category,Total Contract Value,Order Date,Start Date,End Date,Payment Status,Payment Mode,Cheque / Ref No.,Bank / Branch,Sales Person,SLA Tier,Description
Northgate Textiles Pvt Ltd,Priya Nair,billing@northgate.com,9823456780,Finance Director,Manufacturing,784512963,Galaxy Complex S.G. Highway,Ahmedabad,Gujarat,380015,24AAACN1234F1Z5,AAACN1234F,https://northgate.com,NISPL Cloud Services Agreement,Tally Prime Cloud + VPS Gold,Comprehensive,1 Year,Service,"₹1,85,000",12-03-2026,01-04-2026,31-03-2027,Yes,NEFT / RTGS,CMS982374619,HDFC Bank - Salt Lake,Sourav Mukherjee,Tier-1 Priority NOC 99.99%,Managed Tally Prime hosting with daily automated backups
Mahadev Logistics,Anil Ghosh,accounts@mahadevlogistics.com,9123456789,Accounts Head,Logistics,987654321,24 Netaji Subhash Road,Kolkata,West Bengal,700001,19AABCM5678K1ZQ,AABCM5678K,https://mahadevlogistics.com,AMC Support Contract,Tally AMC & Remote Support,AMC,12 Months,Service,"₹60,000",02-04-2026,15-04-2026,14-04-2027,Yes,Cheque,CHQ-482019,State Bank of India - Dalhousie,Nilmoni Ghosal,Tier-2 Business Hours NOC 99.9%,Annual maintenance and license support
Kaveri Foods,Rina Das,private@kaverifoods.com,9876501234,Operations Lead,Food Processing,456123789,12 Industrial Area Phase 2,Valsad,Gujarat,396001,24AABCK9012P1ZN,AABCK9012P,https://kaverifoods.com,Trial Proof Of Concept,Tally Prime Cloud Trial,SHARED,1 Month,Software,0,10-10-2026,20-10-2026,19-11-2026,No,NEFT Wire,,Online Customer Portal,Nilmoni Ghosal,Tier-3 Standard NOC 99.5%,30-day evaluation trial of Cloud setup before commercial purchase`;

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
   * File Handling
   * ------------------------------------------------------------------ */
  const handleFileSelect = async (file) => {
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) {
      toast.error('Please choose a valid .csv file.');
      return;
    }

    try {
      const text = await file.text();
      const rows = parseCsvText(text);
      if (rows.length < 2) {
        toast.error('The CSV file contains no data rows.');
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
        toast.error(`Missing required column(s) in CSV header: ${missingRequired.join(', ')}`);
        return;
      }

      const parsed = rows.slice(1).map((cells) => {
        const item = {};
        map.forEach((f) => {
          item[f.key] = f.index >= 0 ? String(cells[f.index] ?? '').trim() : '';
        });
        return item;
      });

      setFileName(file.name);
      setFileSize((file.size / 1024).toFixed(1) + ' KB');
      setRecords(parsed);
      setImportResults(null);
      setCredentials(null);
      toast.success(`Successfully parsed ${parsed.length} master record(s) from ${file.name}`);
    } catch (err) {
      toast.error(`Failed to read CSV file: ${err.message}`);
    }
  };

  /* ------------------------------------------------------------------ *
   * Calculations for Summary Cards on Loaded Records
   * ------------------------------------------------------------------ */
  const previewStats = useMemo(() => {
    if (!records.length) return { total: 0, active: 0, demo: 0 };
    let active = 0;
    let demo = 0;
    records.forEach((r) => {
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
      demo
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

      notificationApi.createNotification({
        type: 'customer_created',
        title: 'Master CSV Imported',
        message: `Imported ${res.succeeded} master records (${res.activeCount} active, ${res.demoCount} demo trials, ${res.paymentsCount} payments, ${res.receiptsCount} receipts).`,
        severity: res.failed > 0 ? 'warning' : 'success',
        entityType: 'customer',
        metadata: { succeeded: res.succeeded, failed: res.failed, activeCount: res.activeCount, demoCount: res.demoCount, paymentsCount: res.paymentsCount }
      });

      if (res.succeeded === records.length) {
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
   * Template Download Helper
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
              <h1>Bulk Import (CSV) — Master Unified Import</h1>
              <p>
                Upload a single master CSV to simultaneously provision Customers, Contracts, settled Payments, and official Receipts.
                Rows with <strong>Payment Status: Yes</strong> populate the <strong>Active list</strong>, record a settled payment in the ledger, and generate an official receipt. Rows with <strong>Payment Status: No</strong> populate the <strong>Demo list</strong> with an unbilled trial agreement.
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
         SINGLE MASTER CSV UPLOAD & SPECIFICATION SECTION
         ========================================================================= */}
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
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
            <h3 className="adm-import-dropzone-title">Click or drag &amp; drop Master CSV</h3>
            <p className="adm-import-dropzone-sub">
              Upload all customer, contract, and payment data in a single file. Supports standard RFC-4180 CSV files with auto-detected headers.
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
              <span>Browse Master CSV File</span>
            </button>
          </div>

          {/* Right: Specification Guide & Download Demo Template */}
          <div className="adm-import-guide-card">
            <div>
              <div className="adm-import-guide-header">
                <h4 className="adm-import-guide-title">Master CSV Specification</h4>
                <span className="adm-import-guide-meta">All-in-One Format ({MASTER_FIELDS.length} columns)</span>
              </div>

              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0' }}>
                Required headers must be present in the CSV header row:
              </p>

              {/* Grouped Specification Chips */}
              <div className="adm-import-chip-list">
                <span className="adm-import-col-chip required">Company Name *</span>
                <span className="adm-import-col-chip required">Contact Person *</span>
                <span className="adm-import-col-chip required">Email *</span>
                <span className="adm-import-col-chip">Phone</span>
                <span className="adm-import-col-chip">Designation</span>
                <span className="adm-import-col-chip">Address / City / State / PIN</span>
                <span className="adm-import-col-chip">GSTIN / PAN / Website</span>
                <span className="adm-import-col-chip">Contract ID</span>
                <span className="adm-import-col-chip">Service / Product</span>
                <span className="adm-import-col-chip">Contract Type</span>
                <span className="adm-import-col-chip">Duration</span>
                <span className="adm-import-col-chip">Total Contract Value</span>
                <span className="adm-import-col-chip">Start &amp; End Dates</span>
                <span className="adm-import-col-chip" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857', fontWeight: 700 }}>
                  Payment Status (Yes / No) *
                </span>
                <span className="adm-import-col-chip">Payment Mode</span>
                <span className="adm-import-col-chip">Cheque / Ref No.</span>
                <span className="adm-import-col-chip">Bank / Branch</span>
                <span className="adm-import-col-chip">Sales Person</span>
                <span className="adm-import-col-chip">SLA Tier</span>
              </div>

              {/* Dynamic Routing Explanation */}
              <div className="adm-import-guide-note">
                <strong>Dynamic List Storage &amp; Receipt Generation:</strong>
                <ul style={{ margin: '6px 0 0 16px', padding: 0, fontSize: '0.76rem', color: '#475569', lineHeight: 1.5 }}>
                  <li>
                    <strong>Payment Status = Yes:</strong> Customer is stored in the <strong>Active list</strong>, Contract is marked <strong>In Progress</strong>, a settled Payment is created in the <strong>Payment list</strong>, and an official <strong>Receipt is generated</strong>.
                  </li>
                  <li>
                    <strong>Payment Status = No:</strong> Customer is stored in the <strong>Demo list</strong> with a trial agreement registered; no payment or receipt is created.
                  </li>
                  <li>
                    Customer Portal login credentials (username &amp; secure password) are automatically provisioned for every company.
                  </li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              className="adm-import-template-download-btn"
              onClick={() => downloadTemplate(DEMO_MASTER_CSV, 'nispl_master_import_template.csv')}
            >
              <Download size={16} />
              <span>Download Master Demo Template (.csv)</span>
            </button>
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
                File Size: {fileSize} • All master columns recognized • Ready to import into respective lists
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
              <span className="adm-cust-stat-desc">Parsed from uploaded CSV</span>
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
                      <tr key={idx}>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{rec.companyName}</td>
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
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{rec.duration || '1 Year'}</span>
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
                className="adm-creds-copy-btn"
                style={{ textDecoration: 'none' }}
              >
                <ExternalLink size={13} />
                <span>Test Login Portal</span>
              </a>
            </div>
          </div>

          {/* Filter bar */}
          <div className="adm-creds-filter-bar">
            <div className="adm-creds-search-input">
              <Search size={14} style={{ color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search by company, customer ID, or email..."
                value={credSearchQuery}
                onChange={(e) => setCredSearchQuery(e.target.value)}
              />
            </div>
            <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
              Showing {filteredCredentials.length} of {credentials.length} credentials
            </span>
          </div>

          <div className="adm-creds-table-wrap">
            <table className="adm-creds-table">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>S/No.</th>
                  <th>Company</th>
                  <th>Contact Person</th>
                  <th>Customer ID (Username)</th>
                  <th>Email (Username)</th>
                  <th>Generated Password</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCredentials.map((c, i) => (
                  <tr key={c.customerId || i}>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{i + 1}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{c.company}</td>
                    <td style={{ color: '#334155', fontWeight: 600 }}>{c.name}</td>
                    <td>
                      <span className="adm-creds-mono">{c.customerId || c.username}</span>
                    </td>
                    <td>{c.email}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="adm-creds-pw">
                          {showPasswords[`master-${i}`] ? c.password : '••••••••••'}
                        </span>
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                          onClick={() =>
                            setShowPasswords((prev) => ({ ...prev, [`master-${i}`]: !prev[`master-${i}`] }))
                          }
                          title={showPasswords[`master-${i}`] ? 'Hide' : 'Show'}
                        >
                          {showPasswords[`master-${i}`] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className={`adm-status-pill ${c.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                        {c.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="adm-creds-copy-btn"
                        onClick={() => copySingleCredential(c, `master-${i}`)}
                      >
                        {copiedIndex === `master-${i}` ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                        <span>{copiedIndex === `master-${i}` ? 'Copied' : 'Copy'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
