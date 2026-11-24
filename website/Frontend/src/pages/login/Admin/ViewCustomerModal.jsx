import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ExternalLink,
  Printer,
  RotateCw,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  ReceiptText,
  Package,
  Globe,
  Server
} from 'lucide-react';
import toast from 'react-hot-toast';
import { customerApi } from '../../../services/customerApi';
import { contractApi } from '../../../services/contractApi';
import { generateCustomerPdf } from './utils/generateCustomerPdf';
import { usePermissions } from './PermissionsContext';
import { receiptsForCustomer } from './adminTableUtils';
import { customerLifecycleLabel } from '../../../utils/customerLifecycle';
import {
  generateDedicatedIp,
  normalizeContractStatus,
  contractStatusTone
} from './contractVocabulary';

const inr = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const prettyDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const STATUS_COLORS = {
  received: '#059669',
  cleared: '#059669',
  pending: '#d97706',
  overdue: '#dc2626'
};

function formatCustomerAddress(cust) {
  if (!cust) return null;
  let addr = cust.address;
  if (Array.isArray(addr) && addr.length > 0) {
    addr = addr[0];
  }

  const parts = [];
  if (typeof addr === 'string' && addr.trim()) {
    parts.push(addr.trim());
  } else if (addr && typeof addr === 'object') {
    parts.push(
      addr.street || addr.addressLine1 || addr.line1,
      addr.area || addr.addressLine2 || addr.line2,
      addr.city,
      addr.state,
      addr.postalCode || addr.pincode || addr.pinCode,
      addr.country
    );
  }

  // Fallback to top-level customer fields
  if (parts.filter(Boolean).length === 0) {
    parts.push(
      cust.street || cust.addressStreet,
      cust.area || cust.addressArea,
      cust.city || cust.addressCity,
      cust.state || cust.addressState,
      cust.postalCode || cust.pincode || cust.pinCode || cust.addressPostalCode,
      cust.country || cust.addressCountry
    );
  }

  // Additional fallback to billingAddress / shippingAddress
  if (parts.filter(Boolean).length === 0) {
    const fallbackObj = cust.billingAddress || cust.shippingAddress || cust.registeredAddress;
    if (typeof fallbackObj === 'string' && fallbackObj.trim()) {
      parts.push(fallbackObj.trim());
    } else if (fallbackObj && typeof fallbackObj === 'object') {
      parts.push(
        fallbackObj.street || fallbackObj.line1,
        fallbackObj.area || fallbackObj.line2,
        fallbackObj.city,
        fallbackObj.state,
        fallbackObj.postalCode || fallbackObj.pincode,
        fallbackObj.country
      );
    }
  }

  const formatted = parts
    .filter(Boolean)
    .map((s) => String(s).trim())
    .filter((s) => s.length > 0)
    .join(', ');

  return formatted || null;
}

function SummaryTile({ label, value, tone = '#0f172a' }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px' }}>
      <span style={{ fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.98rem', fontWeight: 800, color: tone, display: 'block', marginTop: '2px' }}>
        {value}
      </span>
    </div>
  );
}

export default function ViewCustomerModal({
  customer,
  isOpen,
  onClose,
  onEdit,
  onRetrySync,
  isSyncing = false,
  receipts = [],
  contracts = []
}) {
  const { can } = usePermissions();
  const canEdit = can('customer', 'edit');
  const canSeeReceipts = can('receipt', 'view');
  const [showPw, setShowPw] = useState(false);
  const [copied, setCopied] = useState(false);
  const [internalContracts, setInternalContracts] = useState(contracts || []);

  useEffect(() => {
    if (contracts && contracts.length > 0) {
      setInternalContracts(contracts);
    } else if (isOpen) {
      contractApi.getContracts().then((res) => {
        const list = res.contracts || res.data || res || [];
        if (Array.isArray(list)) setInternalContracts(list);
      }).catch((e) => console.warn('Failed to fetch contracts for modal:', e));
    }
  }, [contracts, isOpen]);

  // Active/purchased products for this customer
  const customerProducts = useMemo(() => {
    if (!customer) return [];
    const cId = String(customer.customerId || customer.id || '').trim().toLowerCase();
    const cEmail = String(customer.email || customer.corporateEmail || customer.loginEmail || '').trim().toLowerCase();
    const cComp = String(customer.company || '').trim().toLowerCase();
    const cName = String(customer.name || '').trim().toLowerCase();

    return (internalContracts || []).filter((c) => {
      const matchId = String(c.customerId || c.accountId || '').trim().toLowerCase();
      const matchEmail = String(c.email || c.personEmail || '').trim().toLowerCase();
      const matchComp = String(c.company || '').trim().toLowerCase();
      const matchCust = String(c.customer || '').trim().toLowerCase();

      return (
        (cId && matchId === cId) ||
        (cEmail && matchEmail === cEmail) ||
        (cComp && matchComp === cComp) ||
        (cName && matchCust === cName)
      );
    });
  }, [customer, internalContracts]);

  // The ledger rows the server already resolved to this account, newest first.
  const history = useMemo(() => receiptsForCustomer(receipts, customer), [receipts, customer]);
  const billed = history.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const settled = history.reduce((sum, r) => sum + Number(r.receivedAmount || 0), 0);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !customer) return null;

  const portalPassword = customer.password || customer.portalPassword || '';

  const crm = customer.sangamCrm || {};
  const crmStatus = crm.status || 'pending';
  const crmId = crm.recordId;

  const modalContent = (
    <div
      className="adm-modal-backdrop-portal"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <div
        className="adm-modal-container animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '850px',
          width: '100%',
          borderRadius: '18px',
          background: '#ffffff',
          padding: '28px 32px',
          boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(0,0,0,0.06)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '16px',
            marginBottom: '20px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {customer.company || customer.name}
              </h2>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.80rem',
                  background: '#eff6ff',
                  color: '#2563eb',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontWeight: 700
                }}
              >
                {customer.customerId || customer.id}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Contact Representative: <strong>{customer.name}</strong> • Account Status:{' '}
              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                {customerLifecycleLabel(customer.status)}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: '#f1f5f9',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Sangam CRM Integration Card */}
        <div
          style={{
            background: crmStatus === 'synced' ? '#f0fdf4' : '#fffbeb',
            border: `1px solid ${crmStatus === 'synced' ? '#bbf7d0' : '#fde68a'}`,
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '22px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} color="#2563eb" />
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.94rem' }}>
                Sangam CRM Integration
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {crmStatus === 'synced' && (
                <span
                  style={{
                    background: '#dcfce7',
                    color: '#15803d',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <CheckCircle2 size={12} />
                  <span>Synced to Companies List</span>
                </span>
              )}
              {crmStatus === 'pending' && (
                <span
                  style={{
                    background: '#fef3c7',
                    color: '#b45309',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Clock size={12} />
                  <span>Pending Sync</span>
                </span>
              )}
              {crmStatus === 'failed' && (
                <span
                  style={{
                    background: '#fee2e2',
                    color: '#b91c1c',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <AlertCircle size={12} />
                  <span>Sync Failed</span>
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              fontSize: '0.82rem',
              color: '#475569'
            }}
          >
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Sangam CRM Record ID:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1d4ed8' }}>
                {crmId || 'Pending synchronization'}
              </span>
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Last Synchronized:</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                {crm.lastSyncedAt ? new Date(crm.lastSyncedAt).toLocaleString('en-IN') : 'Never'}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            {crmId && (
              <a
                href={customerApi.getSangamRecordUrl(crmId)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#1d4ed8',
                  color: '#ffffff',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '0.80rem',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                <span>View in Sangam CRM</span>
                <ExternalLink size={12} />
              </a>
            )}

            {(crmStatus === 'failed' || crmStatus === 'pending') && canEdit && onRetrySync && (
              <button
                type="button"
                className="adm-btn-secondary"
                onClick={(e) => onRetrySync(e, customer)}
                disabled={isSyncing}
                style={{
                  padding: '7px 14px',
                  fontSize: '0.80rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RotateCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                <span>Retry Sync</span>
              </button>
            )}
          </div>
        </div>

        {/* Customer Portal Credentials & Access */}
        <div
          style={{
            background: '#faf5ff',
            border: '1px solid #e9d5ff',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '22px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} color="#2563eb" />
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.94rem' }}>
                Customer Portal Login Credentials
              </span>
            </div>
            <a
              href="/customer/login"
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '0.75rem',
                color: '#2563eb',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Test Portal Login</span>
              <ExternalLink size={11} />
            </a>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              fontSize: '0.84rem'
            }}
          >
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Login Username / ID:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>
                {customer.customerId || customer.id}
              </span>
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Login Email:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>
                  {customer.loginEmail || customer.email}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(customer.loginEmail || customer.email);
                    toast.success('Copied login email to clipboard!');
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', padding: '2px' }}
                  title="Copy Login Email"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Password:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    background: '#fef3c7',
                    color: '#92400e',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid #fde68a'
                  }}
                >
                  {showPw ? portalPassword || 'Not on record' : '••••••••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '2px' }}
                  title={showPw ? 'Hide Password' : 'Show Password'}
                >
                  {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!portalPassword) {
                      toast.error('No portal password is stored on this record.');
                      return;
                    }
                    navigator.clipboard.writeText(portalPassword);
                    setCopied(true);
                    toast.success('Copied password to clipboard!');
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#16a34a' : '#2563eb', padding: '2px' }}
                  title={copied ? 'Copied' : 'Copy Password'}
                >
                  {copied ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Last Login:</span>
              <span style={{ fontWeight: 600, color: customer.lastLoginAt ? '#059669' : '#94a3b8' }}>
                {customer.lastLoginAt ? new Date(customer.lastLoginAt).toLocaleString('en-IN') : 'Never logged in'}
              </span>
            </div>
          </div>
        </div>

        {/* Purchased Products & Subscriptions (with Dedicated Server IP) */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '22px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={18} color="#2563eb" />
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.94rem' }}>
                Purchased Products &amp; Cloud Subscriptions
              </span>
            </div>

            {customerProducts.length > 0 && (
              <span
                style={{
                  background: '#dbeafe',
                  color: '#4338ca',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                {customerProducts.length} product{customerProducts.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {customerProducts.length === 0 ? (
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
              No active products or contracts found for this customer account.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.80rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '6px 8px', fontWeight: 700 }}>Contract ID</th>
                    <th style={{ padding: '6px 8px', fontWeight: 700 }}>Product / Plan</th>
                    <th style={{ padding: '6px 8px', fontWeight: 700 }}>Dedicated Server IP</th>
                    <th style={{ padding: '6px 8px', fontWeight: 700 }}>Validity / Expiry</th>
                    <th style={{ padding: '6px 8px', fontWeight: 700, textAlign: 'right' }}>Value</th>
                    <th style={{ padding: '6px 8px', fontWeight: 700, textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customerProducts.map((p) => {
                    const ip = p.ipAddress || p.dedicatedIp || p.wanIp || generateDedicatedIp(p.contractId || p.id);
                    const normStatus = normalizeContractStatus(p.status, p);
                    const tone = contractStatusTone(normStatus, p);
                    return (
                      <tr key={p.id || p.contractId} style={{ borderTop: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px', fontFamily: 'monospace', color: '#2563eb', fontWeight: 600 }}>
                          {p.contractId || p.id}
                        </td>
                        <td style={{ padding: '8px', color: '#0f172a', fontWeight: 600 }}>
                          <div>{p.name || p.service || 'Cloud Server'}</div>
                          {p.subscriptionPeriod && (
                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                              {p.subscriptionPeriod} • {p.contractType || 'Subscription'}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '8px' }}>
                          {ip ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                              <span
                                style={{
                                  fontFamily: "'SFMono-Regular', Consolas, Menlo, monospace",
                                  fontWeight: 600,
                                  fontSize: '0.80rem',
                                  color: '#1d4ed8',
                                  background: '#eff6ff',
                                  padding: '2px 7px',
                                  borderRadius: '5px',
                                  border: '1px solid #bfdbfe',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Globe size={11} style={{ color: '#2563eb' }} />
                                {ip}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(ip);
                                  toast.success(`Copied IP: ${ip}`);
                                }}
                                title="Copy Dedicated IP"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#94a3b8',
                                  padding: '2px',
                                  display: 'inline-flex',
                                  alignItems: 'center'
                                }}
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '8px', color: '#475569', fontSize: '0.78rem' }}>
                          <div>{prettyDate(p.endDate || p.expiryDate)}</div>
                          <span style={{ fontSize: '0.70rem', color: '#94a3b8' }}>
                            From {prettyDate(p.startDate)}
                          </span>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, color: '#1d4ed8' }}>
                          {p.totalContractValue || p.value || '—'}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <span className={`adm-status-pill ${tone}`} style={{ fontSize: '0.70rem', padding: '2px 8px' }}>
                            {normStatus || 'Active'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment History */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '22px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ReceiptText size={18} color="#2563eb" />
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.94rem' }}>Payment History</span>
            </div>

            {canSeeReceipts && history.length > 0 && (
              <span
                style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                {history.length} payment{history.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {!canSeeReceipts && (
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
              Payments are outside the access granted to this account.
            </p>
          )}

          {canSeeReceipts && history.length === 0 && (
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
              No payment has reached the ledger for this account yet. Record one from Customer → Payments →
              Record Payment, or wait for the customer to pay through the portal.
            </p>
          )}

          {canSeeReceipts && history.length > 0 && (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '12px',
                  marginBottom: '14px'
                }}
              >
                <SummaryTile label="Total billed" value={inr(billed)} />
                <SummaryTile label="Received" value={inr(settled)} tone="#059669" />
                <SummaryTile label="Outstanding" value={inr(Math.max(billed - settled, 0))} tone={billed - settled > 0 ? '#d97706' : '#059669'} />
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.80rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '6px 8px', fontWeight: 700 }}>Invoice</th>
                      <th style={{ padding: '6px 8px', fontWeight: 700 }}>Plan</th>
                      <th style={{ padding: '6px 8px', fontWeight: 700 }}>Received on</th>
                      <th style={{ padding: '6px 8px', fontWeight: 700, textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '6px 8px', fontWeight: 700 }}>Mode</th>
                      <th style={{ padding: '6px 8px', fontWeight: 700 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((row) => (
                      <tr key={row.paymentId || row.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '7px 8px', fontFamily: 'monospace', color: '#334155' }}>
                          {row.invoiceNumber || row.id}
                        </td>
                        <td style={{ padding: '7px 8px', color: '#0f172a', fontWeight: 600 }}>
                          {row.productName || row.solutionCategory || '—'}
                        </td>
                        <td style={{ padding: '7px 8px', color: '#475569' }}>
                          {prettyDate(row.paymentReceivedDate || row.date)}
                        </td>
                        <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 700, color: '#1d4ed8' }}>
                          {inr(row.amount)}
                        </td>
                        <td style={{ padding: '7px 8px', color: '#475569' }}>{row.paymentMode || '—'}</td>
                        <td
                          style={{
                            padding: '7px 8px',
                            fontWeight: 700,
                            color: STATUS_COLORS[String(row.status || '').toLowerCase()] || '#64748b'
                          }}
                        >
                          {row.status || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Profile Overview Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            fontSize: '0.86rem'
          }}
        >
          <div>
            <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block', marginBottom: '4px' }}>
              Corporate Email(s)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>{customer.email || '—'}</div>
              <span style={{ fontSize: '0.64rem', background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                Primary
              </span>
            </div>
            {Array.isArray(customer.additionalEmails) && customer.additionalEmails.length > 0 && (
              <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {customer.additionalEmails.map((extraEm, idx) => (
                  <div key={idx} style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#94a3b8' }}>↳</span>
                    <span>{extraEm}</span>
                    <span style={{ fontSize: '0.62rem', background: '#f1f5f9', color: '#64748b', padding: '0 4px', borderRadius: '3px' }}>
                      Secondary
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block', marginBottom: '4px' }}>
              Phone / WhatsApp
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>{customer.phone || '—'}</div>
              <span style={{ fontSize: '0.64rem', background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                Primary
              </span>
            </div>
            {(() => {
              const extraPhones = [
                ...(Array.isArray(customer.additionalPhones) ? customer.additionalPhones : []),
                ...(customer.alternatePhone && !customer.additionalPhones?.includes(customer.alternatePhone) ? [customer.alternatePhone] : [])
              ].filter(Boolean);
              if (extraPhones.length === 0) return null;
              return (
                <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {extraPhones.map((extraPh, idx) => (
                    <div key={idx} style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'monospace' }}>
                      <span style={{ color: '#94a3b8' }}>↳</span>
                      <span>{extraPh}</span>
                      <span style={{ fontSize: '0.62rem', background: '#f1f5f9', color: '#64748b', padding: '0 4px', borderRadius: '3px' }}>
                        Secondary
                      </span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          <div>
            <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Subscribed Tier &amp; Users</span>
            <div style={{ fontWeight: 600, color: customer.plan || customer.users ? '#0f172a' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>{customer.plan || 'Not recorded'}</span>
              {Boolean(customer.users || (customer.plan && /(\d+)\s*(?:user|users|usr)/i.test(customer.plan))) && (() => {
                const uCount = Number(customer.users || (customer.plan?.match(/(\d+)\s*(?:user|users|usr)/i)?.[1])) || 0;
                return (
                  <span className="adm-status-pill purple" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                    {uCount} {uCount === 1 ? 'User' : 'Users'}
                  </span>
                );
              })()}
            </div>
          </div>

          <div>
            <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Server Hypervisor Node</span>
            <div style={{ fontFamily: 'monospace', fontWeight: 600, color: customer.serverNode ? '#2563eb' : '#94a3b8' }}>
              {customer.serverNode || 'Not recorded'}
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Billing & Physical Address</span>
            <div style={{ fontWeight: 500, color: formatCustomerAddress(customer) ? '#334155' : '#94a3b8', marginTop: '2px' }}>
              {formatCustomerAddress(customer) || 'Not recorded'}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            marginTop: '24px',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '16px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
          }}
        >
          <button
            type="button"
            className="adm-btn-secondary"
            onClick={() => generateCustomerPdf(customer)}
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={15} />
            <span>Print (PDF)</span>
          </button>
          {canEdit && (
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={() => {
                onClose?.();
                onEdit?.(customer);
              }}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Edit Profile
            </button>
          )}
          <button
            type="button"
            className="adm-btn-primary"
            onClick={onClose}
            style={{ padding: '8px 20px', fontSize: '0.85rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

