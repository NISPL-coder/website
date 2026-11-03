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
  ArrowRight,
  Search,
  Sparkles,
  RefreshCw,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { customerApi } from '../../../services/customerApi';
import { usePermissions } from './PermissionsContext';
import './AdminTools.css';

/* ------------------------------------------------------------------ *
 * RFC-4180 CSV parser
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

/* ------------------------------------------------------------------ *
 * Companies Field Specification (matching user's exact demo CSV)
 * ------------------------------------------------------------------ */
const COMPANY_FIELDS = [
  { key: 'accountName', label: 'Account Name', required: true, aliases: ['accountname', 'accountnamerequired', 'company', 'companyname'] },
  { key: 'email', label: 'Email', required: true, aliases: ['email', 'corporateemail', 'mail'] },
  { key: 'phone', label: 'Phone', required: true, aliases: ['phone', 'phonerequired', 'mobile', 'contact'] },
  { key: 'industry', label: 'Industry', required: false, aliases: ['industry', 'industrydd'] },
  { key: 'tallySerialNo', label: 'Tally SL No', required: false, aliases: ['tallyslno', 'tallyserialno', 'tallysl', 'tally'] },
  { key: 'addressStreet', label: 'Address Street', required: false, aliases: ['addressstreet', 'street'] },
  { key: 'addressCountry', label: 'Address Country', required: false, aliases: ['addresscountry', 'country'] },
  { key: 'addressState', label: 'Address State', required: false, aliases: ['addressstate', 'state'] },
  { key: 'addressCity', label: 'Address City', required: false, aliases: ['addresscity', 'city'] },
  { key: 'addressArea', label: 'Address Area', required: false, aliases: ['addressarea', 'area'] },
  { key: 'addressPostalCode', label: 'Address Postal Code', required: false, aliases: ['addresspostalcode', 'postalcode', 'pincode', 'zip'] },
  { key: 'accountStatus', label: 'Account Status', required: false, aliases: ['accountstatus', 'accountstatusdd', 'status'] },
  { key: 'autoUpdatedAt', label: 'Auto Updated At', required: false, aliases: ['autoupdatedat', 'updatedat'] },
  { key: 'gstin', label: 'GSTIN', required: false, aliases: ['gstin', 'gst', 'gstno'] },
  { key: 'pan', label: 'PAN', required: false, aliases: ['pan', 'panno'] },
  { key: 'website', label: 'Website', required: false, aliases: ['website', 'url'] }
];

/* ------------------------------------------------------------------ *
 * Contacts Field Specification (matching user's exact demo CSV)
 * ------------------------------------------------------------------ */
const CONTACT_FIELDS = [
  { key: 'firstName', label: 'First Name', required: true, aliases: ['firstname', 'first', 'fname'] },
  { key: 'lastName', label: 'Last Name', required: false, aliases: ['lastname', 'last', 'lname', 'surname'] },
  { key: 'accountName', label: 'Account Name', required: false, aliases: ['accountname', 'company', 'companyname', 'organization'] },
  { key: 'phone', label: 'Phone', required: false, aliases: ['phone', 'mobile', 'phonenumber', 'contact'] },
  { key: 'email', label: 'Email', required: true, aliases: ['email', 'emailaddress', 'mail'] },
  { key: 'designation', label: 'Designation', required: false, aliases: ['designation', 'title', 'role', 'position'] }
];

/* Demo templates matching user-provided files */
const DEMO_COMPANIES_CSV = `Account Name (Required),Email,Phone (Required),Industry (DD),TALLY SL NO,Address Street,Address Country,Address State,Address City,Address Area,Address Postal_code,Account Status (DD),Auto Updated At,GSTIN,PAN,Website
Wiley,georgette.kuhn@treutel.com,5498355808,Healthcare,Nash, Galaxy Street, India, Gujarat, Valsad, Landmark,123456,Active,3/11/2026 7:12,Damon,Bryce,nistally.sangamcrm.com
Soledad,piper.morar@mosciski.info,6557310824,Hospitality,Jamir, Galaxy Street, India, Gujarat, Valsad, Landmark,123456,Inactive,3/11/2026 7:12,Tommie,Doyle,nistally.sangamcrm.com
Major,cullen18@hotmail.com,9114883705,Electronics,Hugh, Galaxy Street, India, Gujarat, Valsad, Landmark,123456,Inactive,3/11/2026 7:12,Montana,Mitchel,nistally.sangamcrm.com
Timothy,dave02@herman.biz,6187802553,Chemicals,Neil, Galaxy Street, India, Gujarat, Valsad, Landmark,123456,,3/11/2026 7:12,Ben,Coby,nistally.sangamcrm.com
Robb,izulauf@gmail.com,9339589446,Communications,Roosevelt, Galaxy Street, India, Gujarat, Valsad, Landmark,123456,Inactive,3/11/2026 7:12,Dallin,Cristian,nistally.sangamcrm.com`;

const DEMO_CONTACTS_CSV = `First Name,Last Name,Account Name,Phone,Email,Designation
Domenico,Keshaun,,7556269487,stoltenberg.hubert@hansen.com,Mathias
Jamir,Uriah,,7597555703,nolan.brown@yahoo.com,Leif
Alvah,Julio,,6159729440,abelardo92@yahoo.com,Tatum
Guy,Miller,,9240490510,kevin.flatley@hotmail.com,Edwardo
Abe,Sylvester,,9047571021,esta.labadie@rutherford.biz,Keven`;

export default function ImportCsvPage({ setCustomers }) {
  const { can } = usePermissions();
  const canImport = can('customer', 'create') || can('import_csv') || can('data_tools');

  // Active section tab: 'companies' or 'contacts'
  const [activeTab, setActiveTab] = useState('companies');

  // State for Companies
  const fileInputCompRef = useRef(null);
  const [isDraggingComp, setIsDraggingComp] = useState(false);
  const [compFileName, setCompFileName] = useState('');
  const [compFileSize, setCompFileSize] = useState('');
  const [compRecords, setCompRecords] = useState([]);
  const [isImportingComp, setIsImportingComp] = useState(false);
  const [compResults, setCompResults] = useState(null);
  const [compCredentials, setCompCredentials] = useState(null);

  // State for Contacts
  const fileInputContRef = useRef(null);
  const [isDraggingCont, setIsDraggingCont] = useState(false);
  const [contFileName, setContFileName] = useState('');
  const [contFileSize, setContFileSize] = useState('');
  const [contRecords, setContRecords] = useState([]);
  const [isImportingCont, setIsImportingCont] = useState(false);
  const [contResults, setContResults] = useState(null);
  const [contCredentials, setContCredentials] = useState(null);

  // State for password visibility toggles, clipboard feedback, and search filter
  const [showPasswords, setShowPasswords] = useState({});
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [credSearchQuery, setCredSearchQuery] = useState('');

  /* ------------------------------------------------------------------ *
   * File Handlers: Companies
   * ------------------------------------------------------------------ */
  const handleCompaniesFile = async (file) => {
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
      const map = COMPANY_FIELDS.map((f) => {
        const index = headerRow.findIndex((h) => f.aliases.map(normalizeHeader).includes(h));
        return { ...f, index };
      });

      const parsed = rows.slice(1).map((cells) => {
        const item = {};
        map.forEach((f) => {
          item[f.key] = f.index >= 0 ? String(cells[f.index] ?? '').trim() : '';
        });
        return item;
      });

      setCompFileName(file.name);
      setCompFileSize((file.size / 1024).toFixed(1) + ' KB');
      setCompRecords(parsed);
      setCompResults(null);
      setCompCredentials(null);
      toast.success(`Parsed ${parsed.length} company record(s) from ${file.name}`);
    } catch (err) {
      toast.error(`Failed to read CSV file: ${err.message}`);
    }
  };

  /* ------------------------------------------------------------------ *
   * File Handlers: Contacts
   * ------------------------------------------------------------------ */
  const handleContactsFile = async (file) => {
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
      const map = CONTACT_FIELDS.map((f) => {
        const index = headerRow.findIndex((h) => f.aliases.map(normalizeHeader).includes(h));
        return { ...f, index };
      });

      const parsed = rows.slice(1).map((cells) => {
        const item = {};
        map.forEach((f) => {
          item[f.key] = f.index >= 0 ? String(cells[f.index] ?? '').trim() : '';
        });
        return item;
      });

      setContFileName(file.name);
      setContFileSize((file.size / 1024).toFixed(1) + ' KB');
      setContRecords(parsed);
      setContResults(null);
      setContCredentials(null);
      toast.success(`Parsed ${parsed.length} contact record(s) from ${file.name}`);
    } catch (err) {
      toast.error(`Failed to read CSV file: ${err.message}`);
    }
  };

  /* ------------------------------------------------------------------ *
   * Execute Import: Companies
   * ------------------------------------------------------------------ */
  const handleImportCompanies = async () => {
    if (!compRecords.length || isImportingComp) return;
    setIsImportingComp(true);
    const toastId = toast.loading(`Importing ${compRecords.length} companies & generating credentials...`);

    try {
      const res = await customerApi.importCompanies(compRecords);
      setCompResults(res);
      setCompCredentials(res.credentials || []);
      setIsImportingComp(false);

      // Refresh global customer directory
      const live = await customerApi.getCustomers();
      if (live && Array.isArray(live) && setCustomers) setCustomers(live);

      if (res.succeeded === compRecords.length) {
        toast.success(`All ${res.succeeded} company record(s) imported & credentials generated!`, { id: toastId });
      } else {
        toast.success(
          `Import finished: ${res.succeeded} succeeded, ${res.failed} failed. Credentials generated for active customers.`,
          { id: toastId }
        );
      }
    } catch (err) {
      setIsImportingComp(false);
      toast.error(`Import failed: ${err.message}`, { id: toastId });
    }
  };

  /* ------------------------------------------------------------------ *
   * Execute Import: Contacts
   * ------------------------------------------------------------------ */
  const handleImportContacts = async () => {
    if (!contRecords.length || isImportingCont) return;
    setIsImportingCont(true);
    const toastId = toast.loading(`Importing ${contRecords.length} contacts & generating credentials...`);

    try {
      const res = await customerApi.importContacts(contRecords);
      setContResults(res);
      setContCredentials(res.credentials || []);
      setIsImportingCont(false);

      // Refresh global customer directory
      const live = await customerApi.getCustomers();
      if (live && Array.isArray(live) && setCustomers) setCustomers(live);

      if (res.succeeded === contRecords.length) {
        toast.success(`All ${res.succeeded} contact record(s) imported & credentials generated!`, { id: toastId });
      } else {
        toast.success(
          `Import finished: ${res.succeeded} succeeded, ${res.failed} failed. Credentials generated for active customers.`,
          { id: toastId }
        );
      }
    } catch (err) {
      setIsImportingCont(false);
      toast.error(`Import failed: ${err.message}`, { id: toastId });
    }
  };

  /* ------------------------------------------------------------------ *
   * Helpers: Download CSV Templates
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
   * Helpers: Copy and Export Generated Credentials
   * ------------------------------------------------------------------ */
  const copySingleCredential = (cred, indexKey) => {
    const text = `Customer ID / Username: ${cred.customerId}\nEmail: ${cred.email}\nPassword: ${cred.password}\nLogin URL: ${window.location.origin}/customer/login`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(indexKey);
    toast.success(`Copied login credentials for "${cred.company || cred.name}"`);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllCredentials = (credsList) => {
    if (!credsList || !credsList.length) return;
    const header = 'Company\tCustomer ID (Username)\tEmail\tPassword\tLogin URL\n';
    const rows = credsList
      .map(
        (c) =>
          `${c.company || c.name}\t${c.customerId}\t${c.email}\t${c.password}\t${window.location.origin}/customer/login`
      )
      .join('\n');
    navigator.clipboard.writeText(header + rows);
    toast.success(`Copied all ${credsList.length} customer credentials to clipboard!`);
  };

  const downloadCredentialsCsv = (credsList, filenamePrefix = 'NISPL_Customer_Credentials') => {
    if (!credsList || !credsList.length) return;
    const headers = ['Company', 'Name', 'Customer ID (Username)', 'Email', 'Password', 'Role', 'Status', 'Login URL'];
    const rows = credsList.map((c) => [
      `"${c.company || ''}"`,
      `"${c.name || ''}"`,
      `"${c.customerId || ''}"`,
      `"${c.email || ''}"`,
      `"${c.password || ''}"`,
      `"${c.role || 'customer'}"`,
      `"${c.status || 'active'}"`,
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

  // Filtered credentials list based on search term
  const activeCredentials = activeTab === 'companies' ? compCredentials : contCredentials;
  const filteredCredentials = useMemo(() => {
    if (!activeCredentials) return [];
    if (!credSearchQuery.trim()) return activeCredentials;
    const q = credSearchQuery.toLowerCase();
    return activeCredentials.filter(
      (c) =>
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.customerId && c.customerId.toLowerCase().includes(q))
    );
  }, [activeCredentials, credSearchQuery]);

  return (
    <div className="animate-fade-in" style={{ padding: '0 2px' }}>
      {/* =========================================================================
         TOP HERO HEADER CARD
         ========================================================================= */}
      <div className="adm-import-header-card">
        <div className="adm-import-header-top">
          <div className="adm-import-header-title-box">
            <div className="adm-import-header-icon-badge">
              <FileSpreadsheet size={24} />
            </div>
            <div className="adm-import-title-text">
              <h1>Bulk Import (CSV)</h1>
              <p>
                Seamlessly import Companies and Contacts into the database. Records are mapped,
                synchronized in real-time with Sangam CRM, and automatically provisioned with Customer Portal login credentials.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
         MODERN SEGMENTED NAVIGATION PILL BAR
         ========================================================================= */}
      <div className="adm-import-segmented-bar">
        {/* Tab 1: Companies */}
        <button
          type="button"
          className={`adm-import-segment-item ${activeTab === 'companies' ? 'active' : ''}`}
          onClick={() => setActiveTab('companies')}
        >
          <div className="adm-import-segment-content">
            <div className="adm-import-segment-icon">
              <Building2 size={18} />
            </div>
            <div className="adm-import-segment-text">
              <h4>
                <span>Companies Upload</span>
                {compRecords.length > 0 && (
                  <span className="adm-import-segment-badge">{compRecords.length} Loaded</span>
                )}
              </h4>
              <p>Account profiles, Tally Serial No, Address, GSTIN, PAN & Website</p>
            </div>
          </div>
          <ArrowRight size={16} style={{ color: activeTab === 'companies' ? '#6366f1' : '#cbd5e1' }} />
        </button>

        {/* Tab 2: Contacts */}
        <button
          type="button"
          className={`adm-import-segment-item ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacts')}
        >
          <div className="adm-import-segment-content">
            <div className="adm-import-segment-icon">
              <Users2 size={18} />
            </div>
            <div className="adm-import-segment-text">
              <h4>
                <span>Contacts Upload</span>
                {contRecords.length > 0 && (
                  <span className="adm-import-segment-badge">{contRecords.length} Loaded</span>
                )}
              </h4>
              <p>Individual personnel, Phone, Email, Designation & Portal Access</p>
            </div>
          </div>
          <ArrowRight size={16} style={{ color: activeTab === 'contacts' ? '#6366f1' : '#cbd5e1' }} />
        </button>
      </div>

      {/* =========================================================================
         SECTION 1: COMPANIES UPLOAD
         ========================================================================= */}
      {activeTab === 'companies' && (
        <div className="animate-fade-in">
          {/* File Input */}
          <input
            ref={fileInputCompRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) handleCompaniesFile(e.target.files[0]);
            }}
          />

          {!compFileName ? (
            /* Studio 2-Column: Upload Zone + Sample Template Card */
            <div className="adm-import-grid">
              {/* Left: Drag & Drop Zone */}
              <div
                className={`adm-import-dropzone ${isDraggingComp ? 'is-dragging' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingComp(true);
                }}
                onDragLeave={() => setIsDraggingComp(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingComp(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleCompaniesFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputCompRef.current && fileInputCompRef.current.click()}
              >
                <div className="adm-import-dropzone-icon">
                  <Upload size={26} />
                </div>
                <h3 className="adm-import-dropzone-title">Click or drag & drop Companies CSV</h3>
                <p className="adm-import-dropzone-sub">
                  Supports RFC-4180 standard .csv files with auto-detected headers.
                </p>
                <button
                  type="button"
                  className="adm-import-btn-browse"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputCompRef.current && fileInputCompRef.current.click();
                  }}
                >
                  <FileUp size={15} style={{ color: '#6366f1' }} />
                  <span>Browse CSV File</span>
                </button>
              </div>

              {/* Right: Requirements & Download Template */}
              <div className="adm-import-guide-card">
                <div>
                  <div className="adm-import-guide-header">
                    <h4 className="adm-import-guide-title">Companies CSV Specification</h4>
                    <span className="adm-import-guide-meta">16 columns mapped</span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0' }}>
                    Required columns must be present in the CSV header row:
                  </p>

                  <div className="adm-import-chip-list">
                    <span className="adm-import-col-chip required">Account Name *</span>
                    <span className="adm-import-col-chip required">Email *</span>
                    <span className="adm-import-col-chip required">Phone *</span>
                    <span className="adm-import-col-chip">Industry</span>
                    <span className="adm-import-col-chip">Tally SL NO</span>
                    <span className="adm-import-col-chip">Address</span>
                    <span className="adm-import-col-chip">City / State</span>
                    <span className="adm-import-col-chip">GSTIN</span>
                    <span className="adm-import-col-chip">PAN</span>
                    <span className="adm-import-col-chip">Website</span>
                  </div>

                  <div className="adm-import-guide-note">
                    <strong>Auto Sync & Credentials:</strong> Each company row is upserted into MongoDB,
                    pushed to Sangam CRM Account module, and assigned a Customer Portal login ID and secure password.
                  </div>
                </div>

                <button
                  type="button"
                  className="adm-import-template-download-btn"
                  onClick={() => downloadTemplate(DEMO_COMPANIES_CSV, 'companies_import_template.csv')}
                >
                  <Download size={15} />
                  <span>Download Companies Demo Template (.csv)</span>
                </button>
              </div>
            </div>
          ) : (
            /* File Loaded State Banner */
            <div className="adm-import-file-card">
              <div className="adm-import-file-details">
                <div className="adm-import-file-icon">
                  <FileCheck2 size={24} />
                </div>
                <div className="adm-import-file-text">
                  <h4>
                    <span>{compFileName}</span>
                    <span className="adm-status-pill active" style={{ fontSize: '0.72rem' }}>
                      {compRecords.length} Records Parsed
                    </span>
                  </h4>
                  <p>
                    File Size: {compFileSize} • All required company headers mapped successfully
                  </p>
                </div>
              </div>

              <div className="adm-import-file-actions">
                <button
                  type="button"
                  className="adm-import-btn-clear"
                  onClick={() => {
                    setCompFileName('');
                    setCompFileSize('');
                    setCompRecords([]);
                    setCompResults(null);
                    setCompCredentials(null);
                    if (fileInputCompRef.current) fileInputCompRef.current.value = '';
                  }}
                >
                  <Trash2 size={14} />
                  <span>Remove File</span>
                </button>

                <button
                  type="button"
                  className="adm-import-btn-browse"
                  onClick={() => fileInputCompRef.current && fileInputCompRef.current.click()}
                >
                  <RefreshCw size={14} />
                  <span>Replace File</span>
                </button>

                <button
                  type="button"
                  className="adm-btn-primary"
                  onClick={handleImportCompanies}
                  disabled={isImportingComp || !canImport}
                  style={{ padding: '9px 18px', fontSize: '0.86rem' }}
                >
                  <FileUp size={16} />
                  <span>
                    {isImportingComp
                      ? 'Importing & Generating Credentials...'
                      : `Import ${compRecords.length} Companies & Generate Logins`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Companies Preview Table */}
          {compRecords.length > 0 && (
            <div className="adm-import-preview-section">
              <div className="adm-import-preview-header">
                <div className="adm-import-preview-title">
                  <FileSpreadsheet size={18} style={{ color: '#6366f1' }} />
                  <span>Parsed Companies Preview ({compRecords.length} records ready)</span>
                </div>
                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  Showing first {Math.min(compRecords.length, 8)} records
                </span>
              </div>

              <div className="adm-import-preview-table-wrap">
                <table className="adm-import-preview-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px', textAlign: 'center' }}>S/No.</th>
                      <th>Account Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Industry</th>
                      <th>Tally S/N</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>GSTIN / PAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compRecords.slice(0, 8).map((rec, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{rec.accountName}</td>
                        <td style={{ color: '#475569' }}>{rec.email}</td>
                        <td style={{ fontFamily: 'monospace', color: '#334155' }}>{rec.phone}</td>
                        <td>{rec.industry || '—'}</td>
                        <td style={{ fontFamily: 'monospace' }}>{rec.tallySerialNo || '—'}</td>
                        <td>{[rec.addressCity, rec.addressState].filter(Boolean).join(', ') || '—'}</td>
                        <td>
                          <span className={`adm-status-pill ${rec.accountStatus?.toLowerCase() === 'inactive' ? 'inactive' : 'active'}`}>
                            {rec.accountStatus || 'Active'}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.74rem' }}>
                          {[rec.gstin, rec.pan].filter(Boolean).join(' / ') || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Generated Credentials Vault for Companies */}
          {compCredentials && compCredentials.length > 0 && (
            <div className="adm-creds-container">
              <div className="adm-creds-header">
                <div className="adm-creds-title-group">
                  <div className="adm-creds-icon">
                    <Key size={22} />
                  </div>
                  <div>
                    <h3 className="adm-creds-title">Customer Login Credentials Generated</h3>
                    <p className="adm-creds-subtitle">
                      {compCredentials.length} customer accounts active and provisioned for login
                    </p>
                  </div>
                </div>

                <div className="adm-creds-actions">
                  <button
                    type="button"
                    className="adm-creds-copy-btn"
                    onClick={() => copyAllCredentials(compCredentials)}
                  >
                    <Copy size={13} />
                    <span>Copy All Credentials</span>
                  </button>

                  <button
                    type="button"
                    className="adm-btn-primary"
                    style={{ fontSize: '0.78rem', padding: '7px 14px' }}
                    onClick={() => downloadCredentialsCsv(compCredentials, 'NISPL_Companies_Credentials')}
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
                  Showing {filteredCredentials.length} of {compCredentials.length} credentials
                </span>
              </div>

              <div className="adm-creds-table-wrap">
                <table className="adm-creds-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px', textAlign: 'center' }}>S/No.</th>
                      <th>Company</th>
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
                        <td>
                          <span className="adm-creds-mono">{c.customerId}</span>
                        </td>
                        <td>{c.email}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="adm-creds-pw">
                              {showPasswords[`comp-${i}`] ? c.password : '••••••••••'}
                            </span>
                            <button
                              type="button"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                              onClick={() =>
                                setShowPasswords((prev) => ({ ...prev, [`comp-${i}`]: !prev[`comp-${i}`] }))
                              }
                              title={showPasswords[`comp-${i}`] ? 'Hide' : 'Show'}
                            >
                              {showPasswords[`comp-${i}`] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className="adm-status-pill active">{c.status || 'Active'}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="adm-creds-copy-btn"
                            onClick={() => copySingleCredential(c, `comp-${i}`)}
                          >
                            {copiedIndex === `comp-${i}` ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                            <span>{copiedIndex === `comp-${i}` ? 'Copied' : 'Copy'}</span>
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
      )}

      {/* =========================================================================
         SECTION 2: CONTACTS UPLOAD
         ========================================================================= */}
      {activeTab === 'contacts' && (
        <div className="animate-fade-in">
          {/* File Input */}
          <input
            ref={fileInputContRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) handleContactsFile(e.target.files[0]);
            }}
          />

          {!contFileName ? (
            /* Studio 2-Column: Upload Zone + Sample Template Card */
            <div className="adm-import-grid">
              {/* Left: Drag & Drop Zone */}
              <div
                className={`adm-import-dropzone ${isDraggingCont ? 'is-dragging' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingCont(true);
                }}
                onDragLeave={() => setIsDraggingCont(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingCont(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleContactsFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputContRef.current && fileInputContRef.current.click()}
              >
                <div className="adm-import-dropzone-icon">
                  <Upload size={26} />
                </div>
                <h3 className="adm-import-dropzone-title">Click or drag & drop Contacts CSV</h3>
                <p className="adm-import-dropzone-sub">
                  Supports RFC-4180 standard .csv files with auto-detected headers.
                </p>
                <button
                  type="button"
                  className="adm-import-btn-browse"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputContRef.current && fileInputContRef.current.click();
                  }}
                >
                  <FileUp size={15} style={{ color: '#6366f1' }} />
                  <span>Browse CSV File</span>
                </button>
              </div>

              {/* Right: Requirements & Download Template */}
              <div className="adm-import-guide-card">
                <div>
                  <div className="adm-import-guide-header">
                    <h4 className="adm-import-guide-title">Contacts CSV Specification</h4>
                    <span className="adm-import-guide-meta">6 columns mapped</span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0' }}>
                    Required columns must be present in the CSV header row:
                  </p>

                  <div className="adm-import-chip-list">
                    <span className="adm-import-col-chip required">First Name *</span>
                    <span className="adm-import-col-chip required">Email *</span>
                    <span className="adm-import-col-chip">Last Name</span>
                    <span className="adm-import-col-chip">Account Name</span>
                    <span className="adm-import-col-chip">Phone</span>
                    <span className="adm-import-col-chip">Designation</span>
                  </div>

                  <div className="adm-import-guide-note">
                    <strong>Auto Link & Credentials:</strong> Contacts are automatically linked to matching companies
                    in Sangam CRM, added to the customer contacts directory, and given active dashboard login credentials.
                  </div>
                </div>

                <button
                  type="button"
                  className="adm-import-template-download-btn"
                  onClick={() => downloadTemplate(DEMO_CONTACTS_CSV, 'contacts_import_template.csv')}
                >
                  <Download size={15} />
                  <span>Download Contacts Demo Template (.csv)</span>
                </button>
              </div>
            </div>
          ) : (
            /* File Loaded State Banner */
            <div className="adm-import-file-card">
              <div className="adm-import-file-details">
                <div className="adm-import-file-icon">
                  <FileCheck2 size={24} />
                </div>
                <div className="adm-import-file-text">
                  <h4>
                    <span>{contFileName}</span>
                    <span className="adm-status-pill active" style={{ fontSize: '0.72rem' }}>
                      {contRecords.length} Records Parsed
                    </span>
                  </h4>
                  <p>
                    File Size: {contFileSize} • All required contact headers mapped successfully
                  </p>
                </div>
              </div>

              <div className="adm-import-file-actions">
                <button
                  type="button"
                  className="adm-import-btn-clear"
                  onClick={() => {
                    setContFileName('');
                    setContFileSize('');
                    setContRecords([]);
                    setContResults(null);
                    setContCredentials(null);
                    if (fileInputContRef.current) fileInputContRef.current.value = '';
                  }}
                >
                  <Trash2 size={14} />
                  <span>Remove File</span>
                </button>

                <button
                  type="button"
                  className="adm-import-btn-browse"
                  onClick={() => fileInputContRef.current && fileInputContRef.current.click()}
                >
                  <RefreshCw size={14} />
                  <span>Replace File</span>
                </button>

                <button
                  type="button"
                  className="adm-btn-primary"
                  onClick={handleImportContacts}
                  disabled={isImportingCont || !canImport}
                  style={{ padding: '9px 18px', fontSize: '0.86rem' }}
                >
                  <FileUp size={16} />
                  <span>
                    {isImportingCont
                      ? 'Importing & Generating Credentials...'
                      : `Import ${contRecords.length} Contacts & Generate Logins`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Contacts Preview Table */}
          {contRecords.length > 0 && (
            <div className="adm-import-preview-section">
              <div className="adm-import-preview-header">
                <div className="adm-import-preview-title">
                  <FileSpreadsheet size={18} style={{ color: '#6366f1' }} />
                  <span>Parsed Contacts Preview ({contRecords.length} records ready)</span>
                </div>
                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  Showing first {Math.min(contRecords.length, 8)} records
                </span>
              </div>

              <div className="adm-import-preview-table-wrap">
                <table className="adm-import-preview-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px', textAlign: 'center' }}>S/No.</th>
                      <th>Contact Name</th>
                      <th>Account / Company</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Designation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contRecords.slice(0, 8).map((rec, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>
                          {[rec.firstName, rec.lastName].filter(Boolean).join(' ')}
                        </td>
                        <td>{rec.accountName || <span style={{ color: '#94a3b8' }}>— Auto Link —</span>}</td>
                        <td style={{ color: '#475569' }}>{rec.email}</td>
                        <td style={{ fontFamily: 'monospace' }}>{rec.phone || '—'}</td>
                        <td>{rec.designation || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Generated Credentials Vault for Contacts */}
          {contCredentials && contCredentials.length > 0 && (
            <div className="adm-creds-container">
              <div className="adm-creds-header">
                <div className="adm-creds-title-group">
                  <div className="adm-creds-icon">
                    <Key size={22} />
                  </div>
                  <div>
                    <h3 className="adm-creds-title">Contact Login Credentials Generated</h3>
                    <p className="adm-creds-subtitle">
                      {contCredentials.length} contact accounts active and provisioned for login
                    </p>
                  </div>
                </div>

                <div className="adm-creds-actions">
                  <button
                    type="button"
                    className="adm-creds-copy-btn"
                    onClick={() => copyAllCredentials(contCredentials)}
                  >
                    <Copy size={13} />
                    <span>Copy All Credentials</span>
                  </button>

                  <button
                    type="button"
                    className="adm-btn-primary"
                    style={{ fontSize: '0.78rem', padding: '7px 14px' }}
                    onClick={() => downloadCredentialsCsv(contCredentials, 'NISPL_Contacts_Credentials')}
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
                    placeholder="Search by contact, company, or email..."
                    value={credSearchQuery}
                    onChange={(e) => setCredSearchQuery(e.target.value)}
                  />
                </div>
                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  Showing {filteredCredentials.length} of {contCredentials.length} credentials
                </span>
              </div>

              <div className="adm-creds-table-wrap">
                <table className="adm-creds-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px', textAlign: 'center' }}>S/No.</th>
                      <th>Contact Name</th>
                      <th>Account Name</th>
                      <th>Customer ID (Username)</th>
                      <th>Email (Username)</th>
                      <th>Generated Password</th>
                      <th>Designation</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCredentials.map((c, i) => (
                      <tr key={c.customerId || i}>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{i + 1}</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{c.name}</td>
                        <td>{c.company}</td>
                        <td>
                          <span className="adm-creds-mono">{c.customerId}</span>
                        </td>
                        <td>{c.email}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="adm-creds-pw">
                              {showPasswords[`cont-${i}`] ? c.password : '••••••••••'}
                            </span>
                            <button
                              type="button"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                              onClick={() =>
                                setShowPasswords((prev) => ({ ...prev, [`cont-${i}`]: !prev[`cont-${i}`] }))
                              }
                              title={showPasswords[`cont-${i}`] ? 'Hide' : 'Show'}
                            >
                              {showPasswords[`cont-${i}`] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </td>
                        <td>{c.designation || 'Customer'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="adm-creds-copy-btn"
                            onClick={() => copySingleCredential(c, `cont-${i}`)}
                          >
                            {copiedIndex === `cont-${i}` ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                            <span>{copiedIndex === `cont-${i}` ? 'Copied' : 'Copy'}</span>
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
      )}
    </div>
  );
}
