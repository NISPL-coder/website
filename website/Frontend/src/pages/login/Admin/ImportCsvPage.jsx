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
  FileSignature,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { customerApi } from '../../../services/customerApi';
import { contractApi } from '../../../services/contractApi';
import { notificationApi } from '../../../services/notificationApi';
import { usePermissions } from './PermissionsContext';
import {
  contractStatusTone,
  normalizeContractStatus,
  normalizeContractType
} from './contractVocabulary';
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

/**
 * A header matches a field when it equals one of the field's aliases or the
 * field's own label, so a spec column such as "Service / Product" is readable
 * without having to repeat the label in the alias list.
 */
function headerMatchers(field) {
  return [...field.aliases.map(normalizeHeader), normalizeHeader(field.label)];
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

/* ------------------------------------------------------------------ *
 * Contracts Field Specification — mapped to the Contract register and
 * the Sangam CRM Contract module fields
 * ------------------------------------------------------------------ */
const CONTRACT_FIELDS = [
  { key: 'contractId', label: 'Register Code', required: false, aliases: ['contractcode', 'contractno', 'ctr', 'registercode'] },
  { key: 'name', label: 'Contract ID', required: true, aliases: ['contractid', 'contractname', 'name', 'title', 'agreement', 'contracttitle'] },
  { key: 'company', label: 'Company Name', required: false, aliases: ['companyname', 'accountname', 'company', 'organization', 'firm', 'client'] },
  { key: 'customer', label: 'Person', required: false, aliases: ['person', 'customer', 'contactperson', 'signatory', 'clientname', 'authorizedsignatory'] },
  { key: 'email', label: 'Email', required: false, aliases: ['email', 'emailaddress', 'contactemail', 'mail'] },
  { key: 'service', label: 'Service / Product', required: false, aliases: ['service', 'product', 'servicename', 'productname', 'plan'] },
  { key: 'contractType', label: 'Contract Type', required: false, aliases: ['contracttype', 'type', 'dealtype'] },
  { key: 'subscriptionPeriod', label: 'Duration', required: false, aliases: ['duration', 'subscriptionperiod', 'period', 'term', 'planduration', 'validity'] },
  { key: 'productCategory', label: 'Product Category', required: false, aliases: ['productcategory', 'category', 'subcategory', 'productssubcategory'] },
  { key: 'totalContractValue', label: 'Total Contract Value', required: true, aliases: ['totalcontractvalue', 'contractvalue', 'value', 'amount', 'tcv', 'totalvalue'] },
  { key: 'orderDate', label: 'Order Date', required: false, aliases: ['orderdate', 'orderedon', 'bookingdate', 'purchasedate'] },
  { key: 'startDate', label: 'Start Date', required: true, aliases: ['startdate', 'start', 'commencementdate', 'fromdate'] },
  { key: 'endDate', label: 'End Date', required: true, aliases: ['enddate', 'end', 'expirydate', 'validupto', 'todate'] },
  { key: 'status', label: 'Status', required: false, aliases: ['status', 'contractstatus', 'dealstatus'] },
  { key: 'salesPerson', label: 'Sales Person', required: false, aliases: ['salesperson', 'sales', 'owner', 'accountmanager', 'salespersonname'] },
  { key: 'slaTier', label: 'SLA Tier', required: false, aliases: ['slatier', 'sla', 'slatype'] },
  { key: 'description', label: 'Description', required: false, aliases: ['description', 'notes', 'summary', 'remarks'] }
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

/* Column order follows CONTRACT_FIELDS; values containing commas are quoted. */
const DEMO_CONTRACTS_CSV = `Contract ID,Company Name,Person,Email,Service / Product,Contract Type,Duration,Product Category,Total Contract Value,Order Date,Start Date,End Date,Status,Sales Person,SLA Tier,Description
NISPL Cloud Services Agreement,Northgate Textiles Pvt Ltd,Priya Nair,billing@northgate.com,Tally Prime Cloud + VPS Gold,Comprehensive,1 Year,Service,"₹1,85,000",12-03-2026,01-04-2026,31-03-2027,In Progress,Sourav Mukherjee,Tier-1 Priority NOC 99.99%,Managed Tally Prime hosting with daily backups
AMC Support Contract,Mahadev Logistics,Anil Ghosh,accounts@mahadevlogistics.com,Tally AMC & Remote Support,AMC,12 Months,Service,"₹60,000",02-04-2026,15-04-2026,14-04-2027,In Progress,Nilmoni Ghosal,Tier-2 Business Hours NOC 99.9%,Annual maintenance and licence care
Trial Proof Of Concept,Kaveri Foods,Rina Das,private@kaverifoods.com,Tally Prime Cloud Trial,SHARED,1 Month,Software,0,10-10-2026,20-10-2026,19-11-2026,DEMO,Online Customer Portal,Tier-3 Standard NOC 99.5%,Evaluation of the cloud setup before purchase`;

export default function ImportCsvPage({ setCustomers }) {
  const { can } = usePermissions();
  const canImport = can('customer', 'create') || can('import_csv') || can('data_tools');
  // The contracts endpoint is guarded by contract:create, so mirror that here.
  const canImportContracts = can('contract', 'create');

  // Active section tab: 'companies', 'contacts' or 'contracts'
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

  // State for Contracts
  const fileInputCtrRef = useRef(null);
  const [isDraggingCtr, setIsDraggingCtr] = useState(false);
  const [ctrFileName, setCtrFileName] = useState('');
  const [ctrFileSize, setCtrFileSize] = useState('');
  const [ctrRecords, setCtrRecords] = useState([]);
  const [isImportingCtr, setIsImportingCtr] = useState(false);
  const [ctrResults, setCtrResults] = useState(null);

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
        const matchers = headerMatchers(f);
        const index = headerRow.findIndex((h) => matchers.includes(h));
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
        const matchers = headerMatchers(f);
        const index = headerRow.findIndex((h) => matchers.includes(h));
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
   * File Handlers: Contracts
   * ------------------------------------------------------------------ */
  const handleContractsFile = async (file) => {
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
      const map = CONTRACT_FIELDS.map((f) => {
        const matchers = headerMatchers(f);
        const index = headerRow.findIndex((h) => matchers.includes(h));
        return { ...f, index };
      });

      const unmatched = map.filter((f) => f.required && f.index < 0).map((f) => f.label);
      if (unmatched.length) {
        toast.error(`Missing required column(s) in the header: ${unmatched.join(', ')}`);
        return;
      }

      const parsed = rows.slice(1).map((cells) => {
        const item = {};
        map.forEach((f) => {
          item[f.key] = f.index >= 0 ? String(cells[f.index] ?? '').trim() : '';
        });
        return item;
      });

      setCtrFileName(file.name);
      setCtrFileSize((file.size / 1024).toFixed(1) + ' KB');
      setCtrRecords(parsed);
      setCtrResults(null);
      toast.success(`Parsed ${parsed.length} contract record(s) from ${file.name}`);
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

      notificationApi.createNotification({
        type: 'customer_created',
        title: 'Bulk Companies Imported',
        message: 'Imported ' + res.succeeded + ' company account(s) and generated customer portal credentials.',
        severity: 'success',
        entityType: 'customer',
        metadata: { succeeded: res.succeeded, failed: res.failed }
      });

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

      notificationApi.createNotification({
        type: 'customer_created',
        title: 'Bulk Contacts Imported',
        message: 'Imported ' + res.succeeded + ' contact record(s) and generated login credentials.',
        severity: 'success',
        entityType: 'customer',
        metadata: { succeeded: res.succeeded, failed: res.failed }
      });

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
   * Execute Import: Contracts
   * ------------------------------------------------------------------ */
  const handleImportContracts = async () => {
    if (!ctrRecords.length || isImportingCtr) return;
    setIsImportingCtr(true);
    const toastId = toast.loading(`Importing ${ctrRecords.length} contracts & synchronizing with Sangam CRM...`);

    try {
      const res = await contractApi.importContracts(ctrRecords);
      setCtrResults(res);

      const failureNote = res.failed ? `, ${res.failed} failed` : '';
      if (res.succeeded === ctrRecords.length) {
        toast.success(
          `All ${res.succeeded} contract(s) imported. ${res.synced} synchronized with Sangam CRM${failureNote}.`,
          { id: toastId }
        );
      } else {
        toast.success(`Import finished: ${res.succeeded} imported, ${res.failed} rejected.`, { id: toastId });
      }

      notificationApi.createNotification({
        type: 'contract_created',
        title: 'Bulk Contracts Imported',
        message: `Imported ${res.succeeded} contract(s); ${res.synced} synchronized with Sangam CRM.`,
        severity: res.failed ? 'warning' : 'success',
        entityType: 'contract',
        metadata: { succeeded: res.succeeded, failed: res.failed, synced: res.synced }
      });
    } catch (err) {
      toast.error(`Import failed: ${err.message}`, { id: toastId });
    } finally {
      setIsImportingCtr(false);
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
                Seamlessly import Companies, Contacts and Contracts into the database. Records are mapped,
                synchronized in real-time with Sangam CRM, and customer records are automatically provisioned with
                Customer Portal login credentials.
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

        {/* Tab 3: Contracts */}
        <button
          type="button"
          className={`adm-import-segment-item ${activeTab === 'contracts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contracts')}
        >
          <div className="adm-import-segment-content">
            <div className="adm-import-segment-icon">
              <FileSignature size={18} />
            </div>
            <div className="adm-import-segment-text">
              <h4>
                <span>Contracts Upload</span>
                {ctrRecords.length > 0 && (
                  <span className="adm-import-segment-badge">{ctrRecords.length} Loaded</span>
                )}
              </h4>
              <p>Signed agreements, TCV, validity, SLA tier & Sangam CRM Contract sync</p>
            </div>
          </div>
          <ArrowRight size={16} style={{ color: activeTab === 'contracts' ? '#6366f1' : '#cbd5e1' }} />
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

      {/* =========================================================================
         SECTION 3: CONTRACTS UPLOAD
         ========================================================================= */}
      {activeTab === 'contracts' && (
        <div className="animate-fade-in">
          {/* File Input */}
          <input
            ref={fileInputCtrRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) handleContractsFile(e.target.files[0]);
            }}
          />

          {!ctrFileName ? (
            /* Studio 2-Column: Upload Zone + Sample Template Card */
            <div className="adm-import-grid">
              {/* Left: Drag & Drop Zone */}
              <div
                className={`adm-import-dropzone ${isDraggingCtr ? 'is-dragging' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingCtr(true);
                }}
                onDragLeave={() => setIsDraggingCtr(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingCtr(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleContractsFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputCtrRef.current && fileInputCtrRef.current.click()}
              >
                <div className="adm-import-dropzone-icon">
                  <Upload size={26} />
                </div>
                <h3 className="adm-import-dropzone-title">Click or drag & drop Contracts CSV</h3>
                <p className="adm-import-dropzone-sub">
                  Supports RFC-4180 standard .csv files with auto-detected headers.
                </p>
                <button
                  type="button"
                  className="adm-import-btn-browse"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputCtrRef.current && fileInputCtrRef.current.click();
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
                    <h4 className="adm-import-guide-title">Contracts CSV Specification</h4>
                    <span className="adm-import-guide-meta">15 columns mapped</span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0' }}>
                    Required columns must be present in the CSV header row:
                  </p>

                  <div className="adm-import-chip-list">
                    <span className="adm-import-col-chip required">Contract ID *</span>
                    <span className="adm-import-col-chip required">Total Contract Value *</span>
                    <span className="adm-import-col-chip required">Start Date *</span>
                    <span className="adm-import-col-chip required">End Date *</span>
                    <span className="adm-import-col-chip">Register Code</span>
                    <span className="adm-import-col-chip">Account Name</span>
                    <span className="adm-import-col-chip">Email</span>
                    <span className="adm-import-col-chip">Service / Product</span>
                    <span className="adm-import-col-chip">Contract Type</span>
                    <span className="adm-import-col-chip">Duration</span>
                    <span className="adm-import-col-chip">Product Category</span>
                    <span className="adm-import-col-chip">Status</span>
                    <span className="adm-import-col-chip">Sales Person</span>
                    <span className="adm-import-col-chip">SLA Tier</span>
                    <span className="adm-import-col-chip">Description</span>
                  </div>

                  <div className="adm-import-guide-note">
                    <strong>Auto Mapping &amp; CRM Sync:</strong> Dates are read day-first, values are normalised to ₹
                    and terms are converted to the months Sangam CRM counts. Each row is upserted into the contract
                    register — re-uploading the same sheet updates the deal it already described — then pushed to the
                    Sangam CRM Contract module against its Account. A contract code is issued when the sheet has none.
                  </div>
                </div>

                <button
                  type="button"
                  className="adm-import-template-download-btn"
                  onClick={() => downloadTemplate(DEMO_CONTRACTS_CSV, 'contracts_import_template.csv')}
                >
                  <Download size={15} />
                  <span>Download Contracts Demo Template (.csv)</span>
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
                    <span>{ctrFileName}</span>
                    <span className="adm-status-pill active" style={{ fontSize: '0.72rem' }}>
                      {ctrRecords.length} Records Parsed
                    </span>
                  </h4>
                  <p>
                    File Size: {ctrFileSize} • All required contract headers mapped successfully
                  </p>
                </div>
              </div>

              <div className="adm-import-file-actions">
                <button
                  type="button"
                  className="adm-import-btn-clear"
                  onClick={() => {
                    setCtrFileName('');
                    setCtrFileSize('');
                    setCtrRecords([]);
                    setCtrResults(null);
                    if (fileInputCtrRef.current) fileInputCtrRef.current.value = '';
                  }}
                >
                  <Trash2 size={14} />
                  <span>Remove File</span>
                </button>

                <button
                  type="button"
                  className="adm-import-btn-browse"
                  onClick={() => fileInputCtrRef.current && fileInputCtrRef.current.click()}
                >
                  <RefreshCw size={14} />
                  <span>Replace File</span>
                </button>

                <button
                  type="button"
                  className="adm-btn-primary"
                  onClick={handleImportContracts}
                  disabled={isImportingCtr || !canImportContracts}
                  title={canImportContracts ? undefined : 'Requires create access on the Contract module'}
                  style={{ padding: '9px 18px', fontSize: '0.86rem' }}
                >
                  <FileUp size={16} />
                  <span>
                    {isImportingCtr
                      ? 'Importing & Synchronizing with Sangam CRM...'
                      : `Import ${ctrRecords.length} Contracts & Sync to Sangam CRM`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {!canImportContracts && (
            <div className="adm-import-guide-note" style={{ marginTop: '12px' }}>
              <ShieldCheck size={13} style={{ color: '#b45309', marginRight: '6px', verticalAlign: '-2px' }} />
              Your role can prepare the sheet, but importing contracts needs create access on the Contract module. Ask
              an administrator for the &quot;Contract — Add&quot; permission.
            </div>
          )}

          {/* Contracts Preview Table */}
          {ctrRecords.length > 0 && (
            <div className="adm-import-preview-section">
              <div className="adm-import-preview-header">
                <div className="adm-import-preview-title">
                  <FileSignature size={18} style={{ color: '#6366f1' }} />
                  <span>Parsed Contracts Preview ({ctrRecords.length} records ready)</span>
                </div>
                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  Showing first {Math.min(ctrRecords.length, 8)} records
                </span>
              </div>

              <div className="adm-import-preview-table-wrap">
                <table className="adm-import-preview-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px', textAlign: 'center' }}>S/No.</th>
                      <th>Contract ID</th>
                      <th>Company Name</th>
                      <th>Person</th>
                      <th>Service / Product</th>
                      <th>Type</th>
                      <th>Duration</th>
                      <th>Total Value</th>
                      <th>Validity</th>
                      <th>Status</th>
                      <th>Sales Person</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ctrRecords.slice(0, 8).map((rec, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{rec.name}</td>
                        <td>{rec.company || <span style={{ color: '#94a3b8' }}>— Auto Link —</span>}</td>
                        <td>{rec.customer || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                        <td style={{ color: '#475569' }}>{rec.service || '—'}</td>
                        <td>{normalizeContractType(rec.contractType) || '—'}</td>
                        <td>{rec.subscriptionPeriod || '—'}</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{rec.totalContractValue || '—'}</td>
                        <td style={{ fontSize: '0.76rem' }}>
                          {[rec.startDate, rec.endDate].filter(Boolean).join(' → ') || '—'}
                        </td>
                        <td>
                          <span className={`adm-status-pill ${contractStatusTone(rec.status)}`}>
                            {normalizeContractStatus(rec.status) || '—'}
                          </span>
                        </td>
                        <td>{rec.salesPerson || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sangam CRM Synchronization Report */}
          {ctrResults && (
            <div className="adm-import-preview-section">
              <div className="adm-import-preview-header">
                <div className="adm-import-preview-title">
                  <CheckCircle2 size={18} style={{ color: '#059669' }} />
                  <span>Sangam CRM Synchronization Report</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="adm-status-pill info">{ctrResults.total} rows</span>
                  <span className="adm-status-pill active">{ctrResults.succeeded} imported</span>
                  <span className="adm-status-pill pending">{ctrResults.synced} synced</span>
                  <span className={`adm-status-pill ${ctrResults.failed ? 'suspended' : 'inactive'}`}>
                    {ctrResults.failed} rejected
                  </span>
                  <a
                    href="/admin/customer/contract"
                    className="adm-creds-copy-btn"
                    style={{ textDecoration: 'none', padding: '4px 10px' }}
                  >
                    <ExternalLink size={12} />
                    <span>Open Contract Register</span>
                  </a>
                </div>
              </div>

              <div className="adm-import-preview-table-wrap">
                <table className="adm-import-preview-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px', textAlign: 'center' }}>Row</th>
                      <th>Register Code</th>
                      <th>Contract ID</th>
                      <th>Account</th>
                      <th>Register</th>
                      <th>Sangam CRM</th>
                      <th>CRM Record / Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(ctrResults.results || []).map((r, idx) => (
                      <tr key={`${r.contractId || 'row'}-${idx}`}>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{r.row}</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                          {r.contractId || <span style={{ color: '#94a3b8' }}>—</span>}
                        </td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{r.name}</td>
                        <td>{r.company || '—'}</td>
                        <td>
                          {r.ok ? (
                            <span className={`adm-status-pill ${r.created ? 'active' : 'info'}`}>
                              {r.created ? 'Created' : 'Updated'}
                            </span>
                          ) : (
                            <span className="adm-status-pill inactive">Skipped</span>
                          )}
                        </td>
                        <td>
                          {r.sangamStatus === 'synced' ? (
                            <span className="adm-status-pill active">
                              <CheckCircle2 size={12} />
                              <span>Synced</span>
                            </span>
                          ) : r.sangamStatus === 'failed' ? (
                            <span className="adm-status-pill suspended">
                              <XCircle size={12} />
                              <span>Sync Failed</span>
                            </span>
                          ) : (
                            <span className="adm-status-pill suspended">
                              <AlertCircle size={12} />
                              <span>Rejected</span>
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          <span style={{ fontFamily: 'monospace' }}>{r.sangamRecordId || ''}</span>
                          {r.error || r.sangamError || ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '10px 2px 0 2px' }}>
                Rows rejected for missing values never reach the database. Rows whose CRM push failed are stored with
                their contract code and can be retried from the Contract register.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
