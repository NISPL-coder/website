import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Server,
  Activity,
  HardDrive,
  ShieldCheck,
  Monitor,
  Globe,
  Clock,
  RotateCw,
  Copy,
  Check,
  Download,
  Search,
  Filter,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  UserCheck,
  Layers,
  Sparkles,
  Wifi,
  ExternalLink,
  Headphones,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Key,
  Cpu,
  FileText,
  Smartphone,
  ArrowRight,
  Building2,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  Mail,
  Shield,
  X,
  User,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import RemindersPanel from './RemindersPanel';

const CURRENT_PLAN_DETAILS = {
  planName: 'Enterprise Tally Cloud + TSS Gold Multi-User',
  planCode: 'PLN-ENT-TALLY-CLOUD-2026',
  status: 'Active',
  statusBadge: 'Healthy & Certified',
  billingFrequency: 'Annual Subscription',
  startDate: '25 Nov 2025',
  renewalDate: '24 Nov 2026',
  daysRemaining: 28,
  basePrice: '₹18,000',
  taxAmount: '₹3,240 (18% CGST + SGST)',
  totalAmount: '₹21,240 / year',
  paymentMethod: 'Corporate NetBanking (HDFC Bank • Auto-Debit)',
  lastInvoiceNo: 'INV-2025-9941',
  modulesIncluded: [
    { title: 'TallyPrime Gold Release 5.0', desc: 'Unlimited concurrent LAN workstations with full statutory compliance' },
    { title: 'Dedicated Windows Cloud VPS', desc: '8 GB Dedicated ECC RAM, 4 vCPU Xeon, 100 GB NVMe Storage' },
    { title: 'e-Invoice & e-Way Bill API', desc: 'Automated 1-click GSP & NIC direct JSON generation' },
    { title: 'Biz Analyst Mobile App', desc: '2 Registered Smartphone Accounts with live reporting' },
    { title: 'Daily Cloud Backup Sync', desc: 'Automated 02:00 AM offsite snapshot with 30-day retention' },
    { title: 'Tier-4 Datacenter SLA', desc: '99.98% High Availability guaranteed uptime from CtrlS Kolkata' }
  ],
  quotas: [
    { label: 'Workstation Nodes', used: '4 Nodes Active', total: '10 Allowed' },
    { label: 'Dedicated Storage', used: '14.6 GB Used', total: '100 GB NVMe' },
    { label: 'RAM Utilization', used: '2.4 GB Used', total: '8.0 GB ECC' },
    { label: 'WhatsApp Dispatches', used: '3,842 Sent', total: '10,000 / mo' }
  ]
};

const ACCOUNT_DETAILS = {
  companyName: 'Acme InfoTech Solutions Pvt Ltd',
  legalEntity: 'Private Limited Company (Registered under MCA)',
  customerId: 'NIS-CUST-849201',
  adminName: 'Debasish Chakraborty',
  designation: 'Managing Director & IT Systems Head',
  adminEmail: 'debasish@acme-cloud.in',
  billingEmail: 'accounts@acmeinfotech.in',
  contactPhone: '+91 98300 12345',
  landline: '+91 (033) 4004-8800',
  gstin: '19AAACA1234A1Z5',
  pan: 'AAACA1234A',
  stateCode: '19 — West Bengal',
  registeredAddress: 'Sector V, Salt Lake City, Bidhannagar, Kolkata, West Bengal - 700091',
  primaryNodeCluster: 'CtrlS Rated-4 Datacenter (IP: 103.145.54.18)',
  security2FA: 'Enabled (SMS OTP & Google Authenticator)',
  whitelistedSubnet: '103.145.54.0/24 (Corporate Office Subnet)',
  accountManager: 'Siddharth Roy (Senior Cloud Solutions Architect)',
  accountManagerEmail: 'siddharth@nisplcloud.com',
  accountManagerPhone: '+91 (033) 4004-8800 (Ext: 204)'
};

const PURCHASED_PRODUCTS = {
  tally: {
    id: 'tally',
    name: 'TallyPrime Gold (Multi-User)',
    tag: 'ERP License & TSS',
    version: 'Release 5.0 (64-bit)',
    serialNumber: '762094183',
    accountEmail: 'debasish@acme-cloud.in',
    licenseType: 'Multi-User Unlimited LAN Edition',
    tssExpiry: '24 Nov 2026',
    tssDaysLeft: 28,
    status: 'Active',
    cloudHostNode: 'CtrlS Tier-4 Datacenter (IP: 103.145.54.18)',
    workstations: 'Unlimited LAN + 10 Cloud Remote Terminals',
    einvoiceApi: 'Connected & Verified (Auto E-Way Bill)',
    activationKey: 'TPLY-8849-2041-9920',
    gatewayPort: '9000 (Encrypted Tunnel)',
    auditorLicense: 'Enabled (One-click Auditor Remote Access)',
    renewalPrice: '₹13,500/year (+18% GST)',
    iconColor: '#2563eb',
    iconBg: '#eff6ff'
  },
  cloud: {
    id: 'cloud',
    name: 'Dedicated Tally Cloud Node',
    tag: 'Cloud Infrastructure',
    version: 'Windows Server 2022 DC',
    serialNumber: 'NIS-KOL-NODE-04',
    accountEmail: 'debasish@acme-cloud.in',
    licenseType: 'Enterprise Dedicated Compute Node',
    tssExpiry: '24 Nov 2026',
    tssDaysLeft: 28,
    status: 'Online',
    cloudHostNode: 'CtrlS Datacenter Node #04 (IP: 103.145.54.18:3389)',
    workstations: '10 Concurrent User Sessions Dedicated',
    einvoiceApi: 'Dedicated Port 8443 / 3389 RDP',
    activationKey: 'SRV-ENT-9942-0144-IN',
    gatewayPort: '3389 (RDP) & 8443 (HTML5 Terminal)',
    auditorLicense: 'Automated Snapshot (Daily 02:00 AM)',
    renewalPrice: '₹4,500/month (+18% GST)',
    iconColor: '#7c3aed',
    iconBg: '#f5f3ff'
  },
  mobile: {
    id: 'mobile',
    name: 'Biz Analyst Tally on Mobile',
    tag: 'Mobile Analytics App',
    version: 'App Store v4.8 (iOS & Android)',
    serialNumber: 'BIZ-MOB-99420-IN',
    accountEmail: 'debasish@acme-cloud.in',
    licenseType: '1 Year Multi-Device Subscription',
    tssExpiry: '15 Dec 2026',
    tssDaysLeft: 49,
    status: 'Synced',
    cloudHostNode: 'Cloud Sync Engine (5-min interval)',
    workstations: '2 Registered Smartphone Devices Active',
    einvoiceApi: 'Live WhatsApp Outstanding Reminders',
    activationKey: 'BA-APP-1184-9021-XA',
    gatewayPort: 'HTTPS 443 Sync API',
    auditorLicense: 'Offline Data Access & Sales Orders',
    renewalPrice: '₹2,124/year (+18% GST)',
    iconColor: '#d97706',
    iconBg: '#fffbeb'
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'Tally WhatsApp Automation',
    tag: 'Communication Add-on',
    version: 'Meta Cloud API Module v2.4',
    serialNumber: 'WATP-MOD-5521',
    accountEmail: 'debasish@acme-cloud.in',
    licenseType: 'Automated Messaging Add-on',
    tssExpiry: '28 Jan 2027',
    tssDaysLeft: 93,
    status: 'Connected',
    cloudHostNode: 'Official Meta WhatsApp Business Cloud API',
    workstations: 'Direct Integration inside Tally Prime Vouchers',
    einvoiceApi: 'Automated PDF Dispatch on Voucher Save',
    activationKey: 'WA-MSG-8841-3320-IN',
    gatewayPort: 'Webhook Port 443',
    auditorLicense: 'Bulk Ledger & Overdue Reminders',
    renewalPrice: '₹3,000/year (+18% GST)',
    iconColor: '#059669',
    iconBg: '#ecfdf5'
  }
};

export default function CloudPortalOverview({ customer, onNavigateTab }) {
  const [selectedProductKey, setSelectedProductKey] = useState('tally');
  const [copiedIp, setCopiedIp] = useState(false);
  const [copiedSerial, setCopiedSerial] = useState(false);
  const [remoteRequested, setRemoteRequested] = useState(false);

  // Modals state for Plan Details & Account Details
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const companyName = customer?.companyName || 'Acme InfoTech Solutions Pvt Ltd';
  const customerName = customer?.name || 'Debasish Chakraborty';
  const customerEmail = customer?.email || 'debasish@acme-cloud.in';
  const customerId = customer?.customerId || 'NIS-CUST-849201';

  const cloudIp = '103.145.54.18';
  const rdpPort = 3389;

  const activeProduct = PURCHASED_PRODUCTS[selectedProductKey] || PURCHASED_PRODUCTS.tally;

  // Escape key closes modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsPlanModalOpen(false);
        setIsAccountModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock background scroll when any modal is open
  useEffect(() => {
    if (isPlanModalOpen || isAccountModalOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
      };
    }
  }, [isPlanModalOpen, isAccountModalOpen]);

  const handleCopyIp = () => {
    navigator.clipboard.writeText(`${cloudIp}:${rdpPort}`);
    setCopiedIp(true);
    toast.success('Dedicated RDP IP copied to clipboard!');
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const handleCopySerial = () => {
    navigator.clipboard.writeText(activeProduct.serialNumber);
    setCopiedSerial(true);
    toast.success(`Copied ${activeProduct.name} Serial No: ${activeProduct.serialNumber}`);
    setTimeout(() => setCopiedSerial(false), 2000);
  };

  const handleRequestRemote = () => {
    setRemoteRequested(true);
    toast.success('Live Remote Support Requested! Engineer Siddharth Roy will connect shortly.');
    setTimeout(() => setRemoteRequested(false), 4000);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  return (
    <div className="cliento-overview-wrapper animate-fade-in">
      {/* ── 1. Sub-Header Toolbar (Customer Node Info & Quick Connect) ─ */}
      <div className="cliento-toolbar-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
         
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
         
          <a
            href={`rdp://${cloudIp}:${rdpPort}`}
            className="cliento-btn-filter"
            style={{ textDecoration: 'none' }}
            title="Launch Remote Desktop Connection"
          >
            <Monitor size={14} />
            <span>Remote Login</span>
          </a>
        </div>
      </div>
{/* ── 5. TOP 4 CUSTOMER KPI METRIC CARDS ──────────────────────── */}
      <div className="cliento-kpi-grid">
        {/* KPI 1: Tally License & Serial */}
        <div className="cliento-kpi-card">
          <div className="cliento-kpi-header">
            <Key size={16} className="cliento-kpi-icon" />
            <span className="cliento-kpi-title">Tally Serial & TSS</span>
          </div>
          <div className="cliento-kpi-value">762094183</div>
          <div className="cliento-kpi-footer">
            <span className="cliento-change-pill positive">TSS Active</span>
            <span className="cliento-kpi-comp">Release 5.0 Gold</span>
          </div>
        </div>

        {/* KPI 2: Active User Workstations */}
        <div className="cliento-kpi-card">
          <div className="cliento-kpi-header">
            <Users size={16} className="cliento-kpi-icon" />
            <span className="cliento-kpi-title">Active Workstations</span>
          </div>
          <div className="cliento-kpi-value">4 / 10 Active</div>
          <div className="cliento-kpi-footer">
            <span className="cliento-change-pill positive">6 Free Seats</span>
            <span className="cliento-kpi-comp">Multi-User Concurrent</span>
          </div>
        </div>

        {/* KPI 3: Automated Cloud Backup */}
        <div className="cliento-kpi-card">
          <div className="cliento-kpi-header">
            <ShieldCheck size={16} className="cliento-kpi-icon" />
            <span className="cliento-kpi-title">Cloud Data Backup</span>
          </div>
          <div className="cliento-kpi-value">Today, 02:00 AM</div>
          <div className="cliento-kpi-footer">
            <span className="cliento-change-pill positive">100% Safe</span>
            <span className="cliento-kpi-comp">Auto Daily Snapshot</span>
          </div>
        </div>

        {/* KPI 4: TSS & Cloud Expiry */}
        <div className="cliento-kpi-card">
          <div className="cliento-kpi-header">
            <Clock size={16} className="cliento-kpi-icon" />
            <span className="cliento-kpi-title">Next Plan Renewal</span>
          </div>
          <div className="cliento-kpi-value">28 Days</div>
          <div className="cliento-kpi-footer">
            <span className="cliento-change-pill positive">Active Node</span>
            <span className="cliento-kpi-comp">Due 24 Nov 2026</span>
          </div>
        </div>
      </div>
      {/* ── 2. AT FIRST: RENEWAL REMINDERS SECTION ──────────────────── */}
      {/* The reminders section is prominently placed first per user request */}
      <section className="cliento-overview-reminders-section" aria-label="Renewal Reminders">
        <RemindersPanel onNavigate={onNavigateTab} />
      </section>
      
   {/* ── 6. CLOUD TELEMETRY CHART + SERVICES BREAKDOWN ───────────── */}
      <div className="cliento-middle-grid">
        {/* Right: Active Services & Infrastructure Breakdown */}
        <div className="cliento-card cliento-status-breakdown-card">
          <div className="cliento-card-head">
            <div className="cliento-card-title-group">
              <Layers size={18} className="cliento-card-icon" />
              <h3 className="cliento-card-title">Services & Infrastructure</h3>
            </div>
          </div>

          <div className="cliento-breakdown-body">
            <div className="cliento-breakdown-total-row">
              <span className="cliento-breakdown-big-num">4 Active</span>
              <span className="cliento-change-pill positive">Healthy 99.9%</span>
            </div>

            <div className="cliento-status-bars-list">
              <div className="cliento-bar-item">
                <span className="cliento-bar-label">Tally Prime 5.0</span>
                <div className="cliento-bar-track">
                  <div className="cliento-bar-fill bar-blue-1" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="cliento-bar-item">
                <span className="cliento-bar-label">Cloud VPS Node</span>
                <div className="cliento-bar-track">
                  <div className="cliento-bar-fill bar-blue-2" style={{ width: '92%' }} />
                </div>
              </div>

              <div className="cliento-bar-item">
                <span className="cliento-bar-label">HTML5 Terminal</span>
                <div className="cliento-bar-track">
                  <div className="cliento-bar-fill bar-purple-1" style={{ width: '85%' }} />
                </div>
              </div>

              <div className="cliento-bar-item">
                <span className="cliento-bar-label">Backup Sync</span>
                <div className="cliento-bar-track">
                  <div className="cliento-bar-fill bar-purple-2" style={{ width: '80%' }} />
                </div>
              </div>

              <div className="cliento-bar-item">
                <span className="cliento-bar-label">e-Invoice API</span>
                <div className="cliento-bar-track">
                  <div className="cliento-bar-fill bar-violet" style={{ width: '65%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ── 3. PLAN DETAILS & ACCOUNT DETAILS CARDS (WITH "DETAILS" ON TOP RIGHT) ── */}
      <section className="cliento-plans-account-grid" aria-label="Plan and Account Details Overview">
        {/* Card 1: Plan Details Card */}
        <div className="cliento-card cliento-plan-overview-card">
          <div className="cliento-plan-card-header">
            <div className="cliento-plan-card-title-group">
              <div className="cliento-plan-card-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <Package size={18} />
              </div>
              <div>
                <h3 className="cliento-card-title">Current Plan Details</h3>
                <span className="cliento-plan-card-sub">Active Enterprise Cloud + TSS Subscription</span>
              </div>
            </div>

            {/* Top Right "Details" button */}
            <button
              type="button"
              className="cliento-card-details-btn"
              onClick={() => setIsPlanModalOpen(true)}
              title="Click to view all plan details"
            >
              <span>Details</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="cliento-plan-card-body">
            <div className="cliento-plan-highlight-banner">
              <div className="cliento-plan-banner-info">
                <span className="cliento-plan-code-tag">{CURRENT_PLAN_DETAILS.planCode}</span>
                <h4 className="cliento-plan-name-text">{CURRENT_PLAN_DETAILS.planName}</h4>
              </div>
              <span className="cliento-plan-status-pill">
                <CheckCircle2 size={12} /> {CURRENT_PLAN_DETAILS.status}
              </span>
            </div>

            <div className="cliento-plan-quick-grid">
              <div className="cliento-plan-quick-item">
                <span className="cliento-quick-lbl">Billing Frequency</span>
                <span className="cliento-quick-val">{CURRENT_PLAN_DETAILS.billingFrequency}</span>
              </div>
              <div className="cliento-plan-quick-item">
                <span className="cliento-quick-lbl">Next Renewal Due</span>
                <span className="cliento-quick-val" style={{ color: '#d97706', fontWeight: 600 }}>
                  {CURRENT_PLAN_DETAILS.renewalDate} ({CURRENT_PLAN_DETAILS.daysRemaining} days left)
                </span>
              </div>
              <div className="cliento-plan-quick-item">
                <span className="cliento-quick-lbl">Total Plan Rate</span>
                <span className="cliento-quick-val font-outfit" style={{ fontSize: '1.05rem', color: '#0f172a' }}>
                  {CURRENT_PLAN_DETAILS.totalAmount}
                </span>
              </div>
              <div className="cliento-plan-quick-item">
                <span className="cliento-quick-lbl">Primary Entitlement</span>
                <span className="cliento-quick-val">Tally Gold + 8 GB RAM VPS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Account Details Card */}
        <div className="cliento-card cliento-account-overview-card">
          <div className="cliento-plan-card-header">
            <div className="cliento-plan-card-title-group">
              <div className="cliento-plan-card-icon-wrap" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="cliento-card-title">Account Details</h3>
                <span className="cliento-plan-card-sub">Verified Customer Entity & Tax Profile</span>
              </div>
            </div>

            {/* Top Right "Details" button */}
            <button
              type="button"
              className="cliento-card-details-btn"
              onClick={() => setIsAccountModalOpen(true)}
              title="Click to view all account details"
            >
              <span>Details</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="cliento-plan-card-body">
            <div className="cliento-account-highlight-banner">
              <div className="cliento-account-banner-info">
                <span className="cliento-account-cust-id">CUSTOMER ID: {customerId}</span>
                <h4 className="cliento-account-name-text">{companyName}</h4>
              </div>
              <span className="cliento-account-tier-pill">
                <ShieldCheck size={12} /> Tier-Gold Client
              </span>
            </div>

            <div className="cliento-plan-quick-grid">
              <div className="cliento-plan-quick-item">
                <span className="cliento-quick-lbl">Authorized Admin</span>
                <span className="cliento-quick-val">{customerName}</span>
              </div>
              <div className="cliento-plan-quick-item">
                <span className="cliento-quick-lbl">Official Email</span>
                <span className="cliento-quick-val">{customerEmail}</span>
              </div>
              <div className="cliento-plan-quick-item">
                <span className="cliento-quick-lbl">GSTIN (West Bengal)</span>
                <span className="cliento-quick-val font-mono">{ACCOUNT_DETAILS.gstin}</span>
              </div>
              <div className="cliento-plan-quick-item">
                <span className="cliento-quick-lbl">Security 2FA</span>
                <span className="cliento-quick-val text-emerald">
                  <CheckCircle2 size={12} style={{ display: 'inline', marginRight: 4 }} />
                  {ACCOUNT_DETAILS.security2FA}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODAL 1: FULL PLAN DETAILS (TRIGGERED ON CLICKING "DETAILS") ── */}
      {isPlanModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="cliento-modal-backdrop" onClick={() => setIsPlanModalOpen(false)}>
          <div className="cliento-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="cliento-modal-header">
              <div className="cliento-modal-title-group">
                <div className="cliento-modal-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="cliento-modal-title">Comprehensive Plan Specifications</h3>
                  <span className="cliento-modal-subtitle">
                    Full breakdown of entitlements, billing schedule & datacenter SLA
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="cliento-modal-close-btn"
                onClick={() => setIsPlanModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="cliento-modal-body">
              {/* Highlight Bar */}
              <div className="cliento-modal-hero-bar">
                <div>
                  <span className="cliento-modal-tag">{CURRENT_PLAN_DETAILS.planCode}</span>
                  <h4 className="cliento-modal-plan-title">{CURRENT_PLAN_DETAILS.planName}</h4>
                  <span className="cliento-modal-plan-meta">
                    Billing: {CURRENT_PLAN_DETAILS.billingFrequency} &middot; Started: {CURRENT_PLAN_DETAILS.startDate}
                  </span>
                </div>
                <div className="cliento-modal-hero-right">
                  <span className="cliento-modal-price">{CURRENT_PLAN_DETAILS.totalAmount}</span>
                  <span className="cliento-modal-tax-note">Includes 18% GST ({CURRENT_PLAN_DETAILS.taxAmount})</span>
                </div>
              </div>

              {/* Status & Renewal Alert */}
              <div className="cliento-modal-alert-box">
                <Clock size={16} color="#d97706" />
                <span>
                  Next Plan Renewal is due on <strong>{CURRENT_PLAN_DETAILS.renewalDate}</strong> ({CURRENT_PLAN_DETAILS.daysRemaining} days remaining). Auto-debit via Corporate NetBanking is active.
                </span>
              </div>

              {/* Resource Quotas Grid */}
              <h5 className="cliento-modal-section-heading">Resource Quotas & Allocations</h5>
              <div className="cliento-modal-quotas-grid">
                {CURRENT_PLAN_DETAILS.quotas.map((q, qi) => (
                  <div key={qi} className="cliento-modal-quota-item">
                    <span className="cliento-quota-label">{q.label}</span>
                    <span className="cliento-quota-used">{q.used}</span>
                    <span className="cliento-quota-total">Cap: {q.total}</span>
                  </div>
                ))}
              </div>

              {/* Included Modules & Entitlements List */}
              <h5 className="cliento-modal-section-heading" style={{ marginTop: 18 }}>Included Modules & Services</h5>
              <div className="cliento-modal-modules-list">
                {CURRENT_PLAN_DETAILS.modulesIncluded.map((m, mi) => (
                  <div key={mi} className="cliento-modal-module-item">
                    <div className="cliento-module-check">
                      <Check size={13} strokeWidth={2.5} />
                    </div>
                    <div className="cliento-module-info">
                      <span className="cliento-module-title">{m.title}</span>
                      <span className="cliento-module-desc">{m.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Invoicing & Reference */}
              <div className="cliento-modal-billing-footer">
                <div className="cliento-billing-ref-item">
                  <span className="cliento-spec-name">Last Billed Invoice</span>
                  <span className="cliento-spec-data font-mono">{CURRENT_PLAN_DETAILS.lastInvoiceNo}</span>
                </div>
                <div className="cliento-billing-ref-item">
                  <span className="cliento-spec-name">Payment Method</span>
                  <span className="cliento-spec-data">{CURRENT_PLAN_DETAILS.paymentMethod}</span>
                </div>
              </div>
            </div>

            <div className="cliento-modal-footer">
              <button
                type="button"
                className="cliento-modal-secondary-btn"
                onClick={() => {
                  setIsPlanModalOpen(false);
                  onNavigateTab && onNavigateTab('receipt');
                }}
              >
                <FileText size={14} />
                <span>View Tax Invoices</span>
              </button>
              <button
                type="button"
                className="cliento-modal-primary-btn"
                onClick={() => {
                  setIsPlanModalOpen(false);
                  onNavigateTab && onNavigateTab('products');
                }}
              >
                <RotateCw size={14} />
                <span>Renew / Upgrade Plan</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── MODAL 2: FULL ACCOUNT DETAILS (TRIGGERED ON CLICKING "DETAILS") ── */}
      {isAccountModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="cliento-modal-backdrop" onClick={() => setIsAccountModalOpen(false)}>
          <div className="cliento-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="cliento-modal-header">
              <div className="cliento-modal-title-group">
                <div className="cliento-modal-icon-wrap" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="cliento-modal-title">Customer Account & Organization Profile</h3>
                  <span className="cliento-modal-subtitle">
                    Verified entity credentials, statutory GST registration & security status
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="cliento-modal-close-btn"
                onClick={() => setIsAccountModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="cliento-modal-body">
              {/* Account Hero Card */}
              <div className="cliento-modal-hero-bar" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f8fafc 100%)', borderColor: '#e9d5ff' }}>
                <div>
                  <span className="cliento-modal-tag" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                    CUSTOMER ID: {customerId}
                  </span>
                  <h4 className="cliento-modal-plan-title">{companyName}</h4>
                  <span className="cliento-modal-plan-meta">
                    {ACCOUNT_DETAILS.legalEntity}
                  </span>
                </div>
                <div className="cliento-modal-hero-right">
                  <span className="cliento-account-tier-pill" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>
                    <ShieldCheck size={14} /> Tier-Gold Enterprise
                  </span>
                </div>
              </div>

              {/* Account Key Properties Grid */}
              <h5 className="cliento-modal-section-heading">Tax, Statutory & Identification</h5>
              <div className="cliento-account-props-grid">
                <div className="cliento-prop-card">
                  <span className="cliento-prop-name">Goods & Services Tax ID (GSTIN)</span>
                  <div className="cliento-prop-val-row">
                    <span className="cliento-prop-val font-mono">{ACCOUNT_DETAILS.gstin}</span>
                    <button
                      type="button"
                      className="cliento-prop-copy-btn"
                      onClick={() => copyToClipboard(ACCOUNT_DETAILS.gstin, 'GSTIN')}
                      title="Copy GSTIN"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>

                <div className="cliento-prop-card">
                  <span className="cliento-prop-name">Permanent Account Number (PAN)</span>
                  <span className="cliento-prop-val font-mono">{ACCOUNT_DETAILS.pan}</span>
                </div>

                <div className="cliento-prop-card">
                  <span className="cliento-prop-name">Jurisdiction & State</span>
                  <span className="cliento-prop-val">{ACCOUNT_DETAILS.stateCode}</span>
                </div>

                <div className="cliento-prop-card">
                  <span className="cliento-prop-name">Primary Datacenter Node</span>
                  <span className="cliento-prop-val">{ACCOUNT_DETAILS.primaryNodeCluster}</span>
                </div>
              </div>

              {/* Contact & Administration */}
              <h5 className="cliento-modal-section-heading" style={{ marginTop: 18 }}>Authorized Administrator & Contacts</h5>
              <div className="cliento-account-props-grid">
                <div className="cliento-prop-card">
                  <span className="cliento-prop-name">Primary Admin</span>
                  <span className="cliento-prop-val">{customerName}</span>
                  <span className="cliento-prop-sub">{ACCOUNT_DETAILS.designation}</span>
                </div>

                <div className="cliento-prop-card">
                  <span className="cliento-prop-name">Admin Email</span>
                  <span className="cliento-prop-val">{customerEmail}</span>
                  <span className="cliento-prop-sub">Billing Email: {ACCOUNT_DETAILS.billingEmail}</span>
                </div>

                <div className="cliento-prop-card">
                  <span className="cliento-prop-name">Phone & WhatsApp</span>
                  <span className="cliento-prop-val">{ACCOUNT_DETAILS.contactPhone}</span>
                  <span className="cliento-prop-sub">Landline: {ACCOUNT_DETAILS.landline}</span>
                </div>

                <div className="cliento-prop-card">
                  <span className="cliento-prop-name">Security Status</span>
                  <span className="cliento-prop-val text-emerald">
                    <CheckCircle2 size={13} style={{ display: 'inline', marginRight: 4 }} />
                    {ACCOUNT_DETAILS.security2FA}
                  </span>
                  <span className="cliento-prop-sub">Whitelisted: {ACCOUNT_DETAILS.whitelistedSubnet}</span>
                </div>
              </div>

              {/* Registered Address */}
              <div className="cliento-modal-address-box">
                <MapPin size={16} className="cliento-address-icon" />
                <div className="cliento-address-info">
                  <span className="cliento-spec-name">Registered Business & Invoicing Address</span>
                  <span className="cliento-address-text">{ACCOUNT_DETAILS.registeredAddress}</span>
                </div>
              </div>

              {/* Assigned Account Manager */}
              <div className="cliento-modal-manager-strip">
                <div className="cliento-manager-avatar">
                  <span>SR</span>
                </div>
                <div className="cliento-manager-info">
                  <span className="cliento-manager-tag">Assigned Account Manager</span>
                  <h6 className="cliento-manager-name">{ACCOUNT_DETAILS.accountManager}</h6>
                  <span className="cliento-manager-contact">
                    {ACCOUNT_DETAILS.accountManagerEmail} &middot; {ACCOUNT_DETAILS.accountManagerPhone}
                  </span>
                </div>
              </div>
            </div>

            <div className="cliento-modal-footer">
              <button
                type="button"
                className="cliento-modal-secondary-btn"
                onClick={() => copyToClipboard(`Company: ${companyName}\nCustomer ID: ${customerId}\nGSTIN: ${ACCOUNT_DETAILS.gstin}\nAdmin: ${customerName} (${customerEmail})`, 'Account Summary')}
              >
                <Copy size={14} />
                <span>Copy Summary</span>
              </button>
              <button
                type="button"
                className="cliento-modal-primary-btn"
                onClick={() => setIsAccountModalOpen(false)}
              >
                <span>Close Details</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
