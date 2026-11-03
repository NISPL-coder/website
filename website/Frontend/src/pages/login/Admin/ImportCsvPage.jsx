import React, { useMemo, useRef, useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  XCircle,
  FileUp,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { customerApi } from '../../../services/customerApi';
import { usePermissions } from './PermissionsContext';
import './AdminTools.css';

const EXPECTED_FIELDS = [
  { key: 'name', label: 'Name', required: true, aliases: ['name', 'fullname', 'full name', 'contact name'] },
  { key: 'email', label: 'Email', required: true, aliases: ['email', 'email address', 'mail'] },
  { key: 'mobile', label: 'Mobile', required: true, aliases: ['mobile', 'phone', 'mobile number', 'contact', 'contact number'] },
  { key: 'companyName', label: 'Company Name', required: true, aliases: ['companyname', 'company', 'organization', 'organisation', 'firm'] },
  { key: 'plan', label: 'Subscribed Plan', required: false, aliases: ['plan', 'subscribedplan', 'subscribed plan', 'product'] },
  { key: 'serverNode', label: 'Server Node', required: false, aliases: ['servernode', 'server node', 'node'] },
  { key: 'mrr', label: 'Monthly MRR', required: false, aliases: ['mrr', 'monthlymrr', 'monthly mrr', 'monthly', 'price'] },
  { key: 'status', label: 'Status', required: false, aliases: ['status', 'account status'] }
];

/* Minimal RFC-4180-style CSV parser (handles quoted cells & escaped quotes). */
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
      rows[rows.length - 1] = rows[rows.length - 1];
    } else {
      row[row.length - 1] += ch;
    }
  }
  rows.push(row);
  return rows.filter((r) => r.some((cell) => String(cell).trim() !== ''));
}

function normalizeHeader(header) {
  return String(header || '').trim().toLowerCase().replace(/[^a-z]/g, '');
}

function mapHeaders(headerRow) {
  const normalized = headerRow.map(normalizeHeader);
  return EXPECTED_FIELDS.map((field) => {
    const index = normalized.findIndex((h) => field.aliases.map(normalizeHeader).includes(h));
    return { ...field, index };
  });
}

function formatMrr(value) {
  const raw = String(value ?? '').replace(/[^0-9.]/g, '');
  const num = Number(raw);
  if (!raw || Number.isNaN(num)) return '';
  return `₹${num.toLocaleString('en-IN')}`;
}

function buildTemplateCsv() {
  const header = EXPECTED_FIELDS.map((f) => f.label).join(',');
  const sample = [
    'Demo Traders Pvt. Ltd.,demo@example.com,9876543210,Demo Traders Pvt. Ltd.,Tally Prime Cloud + VPS Gold,CtrlS-KOL-NODE-01,15000,active',
    '"Anand, Verma & Associates",anand@example.com,9123456780,AV Associates,Tally Prime Cloud + VPS Silver,CtrlS-KOL-NODE-01,9000,demo'
  ].join('\n');
  return `${header}\n${sample}`;
}

export default function ImportCsvPage({ setCustomers }) {
  const { can } = usePermissions();
  const canImport = can('customer', 'create');
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fieldMap, setFieldMap] = useState(null);
  const [records, setRecords] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [results, setResults] = useState(null);

  const missingRequired = useMemo(
    () => (fieldMap ? fieldMap.filter((f) => f.required && f.index === -1) : []),
    [fieldMap]
  );

  const handleFile = async (file) => {
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) {
      toast.error('Please choose a .csv file.');
      return;
    }
    try {
      const text = await file.text();
      const rows = parseCsvText(text);
      if (rows.length < 2) {
        toast.error('The CSV file has no data rows.');
        return;
      }
      const map = mapHeaders(rows[0]);
      const parsed = rows.slice(1).map((cells) => {
        const record = {};
        map.forEach((f) => {
          record[f.key] = f.index >= 0 ? String(cells[f.index] ?? '').trim() : '';
        });
        record.mrr = formatMrr(record.mrr);
        if (!record.status) record.status = 'active';
        if (!record.serverNode) record.serverNode = 'CtrlS-KOL-NODE-01';
        return record;
      });
      setFileName(file.name);
      setFieldMap(map);
      setRecords(parsed);
      setResults(null);
      setProgress({ done: 0, total: 0 });
      toast.success(`Parsed ${parsed.length} record(s) from ${file.name}`);
    } catch (err) {
      toast.error(`Failed to read file: ${err.message}`);
    }
  };

  const validateRecord = (record) => {
    if (!record.name) return 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) return 'Valid email is required';
    if (!record.mobile) return 'Mobile is required';
    if (!record.companyName) return 'Company name is required';
    return null;
  };

  const handleImport = async () => {
    if (!records.length || isImporting) return;
    setIsImporting(true);
    const importResults = [];
    let succeeded = 0;

    for (let i = 0; i < records.length; i += 1) {
      const record = records[i];
      const validationError = validateRecord(record);
      if (validationError) {
        importResults.push({ row: i + 2, company: record.companyName || record.name, ok: false, error: validationError });
      } else {
        try {
          await customerApi.createCustomer({
            name: record.name,
            company: record.companyName,
            email: record.email,
            phone: record.mobile,
            city: '',
            address: {
              street: '',
              area: '',
              city: '',
              state: '',
              country: 'India',
              postalCode: '',
              addressType: 'Billing'
            },
            plan: record.plan || 'Tally Prime Cloud + VPS Gold',
            serverNode: record.serverNode || 'CtrlS-KOL-NODE-01',
            status: record.status || 'active',
            mrr: record.mrr || '₹15,000',
            accountRelationship: 'Customer'
          });
          importResults.push({ row: i + 2, company: record.companyName, ok: true });
          succeeded += 1;
        } catch (err) {
          importResults.push({ row: i + 2, company: record.companyName || record.name, ok: false, error: err.message });
        }
      }
      setProgress({ done: i + 1, total: records.length });
    }

    setResults({ total: records.length, succeeded, rows: importResults });
    setIsImporting(false);

    const live = await customerApi.getCustomers();
    if (live && Array.isArray(live)) setCustomers(live);

    if (succeeded === records.length) {
      toast.success(`All ${succeeded} customer(s) imported & synced to Sangam CRM.`);
    } else {
      toast.error(`Import finished: ${succeeded} succeeded, ${records.length - succeeded} failed.`);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([buildTemplateCsv()], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'NISPL_Customer_Import_Template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFileName('');
    setFieldMap(null);
    setRecords([]);
    setResults(null);
    setProgress({ done: 0, total: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="adm-table-card animate-fade-in">
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <h1 className="adm-section-title">Import Customers (CSV)</h1>
          <p className="adm-section-sub">
            Bulk onboard customer accounts from a spreadsheet. Every imported record is automatically
            synchronized to Sangam CRM Companies.
          </p>
        </div>
        <div className="adm-card-header-action">
          <button type="button" className="adm-btn-primary" style={{ background: '#ffffff', color: '#334155', border: '1px solid #e2e8f0' }} onClick={handleDownloadTemplate}>
            <Download size={16} />
            <span>Download Template</span>
          </button>
        </div>
      </div>

      {/* Upload dropzone */}
      <div
        className={`adm-import-dropzone ${isDragging ? 'is-dragging' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') fileInputRef.current?.click(); }}
      >
        <span className="adm-import-dropzone-icon">
          <Upload size={24} />
        </span>
        <p className="adm-import-dropzone-title">Drag &amp; drop your CSV here, or click to browse</p>
        <p className="adm-import-dropzone-sub">
          Required columns: Name, Email, Mobile, Company Name. Optional: Subscribed Plan, Server Node, Monthly MRR, Status.
        </p>
        {fileName && (
          <span className="adm-import-file-chip">
            <FileSpreadsheet size={14} color="#6366f1" />
            {fileName} — {records.length} row(s)
          </span>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Column mapping feedback */}
      {fieldMap && missingRequired.length > 0 && (
        <div className="ebolt-alert-error" role="alert" style={{ marginTop: '14px' }}>
          <XCircle size={15} style={{ flexShrink: 0 }} />
          <span>
            Missing required column(s): {missingRequired.map((f) => f.label).join(', ')}.
            Please fix the CSV header row or download the template.
          </span>
        </div>
      )}

      {/* Preview */}
      {records.length > 0 && (
        <div style={{ marginTop: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
              Preview (first 5 of {records.length} rows)
            </h3>
            {!isImporting && (
              <button
                type="button"
                className="adm-action-pill"
                onClick={handleReset}
                style={{ color: '#64748b', borderColor: '#e2e8f0' }}
              >
                <Trash2 size={12} />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="adm-import-preview-table-wrap">
            <table className="adm-import-preview-table">
              <thead>
                <tr>
                  {EXPECTED_FIELDS.map((f) => (
                    <th key={f.key}>
                      {f.label}
                      {f.required && <span style={{ color: '#ef4444' }}> *</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 5).map((record, idx) => (
                  <tr key={idx}>
                    {EXPECTED_FIELDS.map((f) => (
                      <td key={f.key}>{record[f.key] || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Import action */}
          {canImport ? (
            <button
              type="button"
              className="adm-btn-primary"
              onClick={handleImport}
              disabled={isImporting || missingRequired.length > 0 || records.length === 0}
              style={{ marginTop: '16px', width: '100%', height: '44px' }}
            >
              <FileUp size={16} />
              <span>
                {isImporting
                  ? `Importing ${progress.done}/${progress.total}...`
                  : `Import ${records.length} Customer Record(s)`}
              </span>
            </button>
          ) : (
            <p className="adm-section-sub" style={{ marginTop: '16px' }}>
              Your account can read customer records but cannot import them. Ask an administrator for
              Add access on the Customer module.
            </p>
          )}

          {isImporting && (
            <div className="adm-import-progress-bar">
              <div
                className="adm-import-progress-fill"
                style={{ width: progress.total ? `${(progress.done / progress.total) * 100}%` : '0%' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {results && (
        <div style={{ marginTop: '18px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
            Import Results — {results.succeeded} of {results.total} succeeded
          </h3>
          <div style={{ maxHeight: '260px', overflowY: 'auto', border: '1px solid #eef0f6', borderRadius: '12px', padding: '6px 14px' }}>
            {results.rows.map((row, idx) => (
              <div key={idx} className="adm-import-result-row">
                {row.ok ? (
                  <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0, marginTop: '1px' }} />
                ) : (
                  <XCircle size={15} color="#dc2626" style={{ flexShrink: 0, marginTop: '1px' }} />
                )}
                <span>
                  <strong>Row {row.row}</strong> — {row.company}
                  {!row.ok && <span style={{ color: '#dc2626' }}> ({row.error})</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
