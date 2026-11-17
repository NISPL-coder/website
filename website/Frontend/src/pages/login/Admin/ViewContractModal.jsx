import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  FileText,
  Building2,
  Calendar,
  CreditCard,
  Shield,
  Layers,
  ExternalLink,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Mail,
  Phone,
  UserCheck,
  Tag,
  Download,
  IndianRupee,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { contractApi } from '../../../services/contractApi';
import { paymentApi } from '../../../services/paymentApi';
import { generateContractPdf } from './utils/generateContractPdf';
import { generateReceiptPdf } from '../../Dashboard/utils/generateReceiptPdf';
import {
  contractStatusColor,
  contractPersonEmail,
  contractPersonMobile,
  describeContractTerm,
  normalizeContractStatus
} from './contractVocabulary';
import './ViewContractModal.css';

function formatDisplayDate(val) {
  if (!val) return 'Not recorded';
  const parsed = new Date(val);
  if (isNaN(parsed.getTime())) return String(val);
  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function getRenewalInfo(contract) {
  const renewalRaw = contract.renewalDate || contract.endDate || contract.expiryDate;
  if (!renewalRaw) return { dateStr: 'Not set', daysLeft: null, tone: 'neutral' };

  const targetDate = new Date(renewalRaw);
  if (isNaN(targetDate.getTime())) {
    return { dateStr: String(renewalRaw), daysLeft: null, tone: 'neutral' };
  }

  const dateStr = targetDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      dateStr,
      daysLeft: diffDays,
      badgeText: `Expired (${Math.abs(diffDays)}d ago)`,
      tone: 'expired'
    };
  }
  if (diffDays <= 7) {
    return {
      dateStr,
      daysLeft: diffDays,
      badgeText: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
      tone: 'warning'
    };
  }
  if (diffDays <= 30) {
    return {
      dateStr,
      daysLeft: diffDays,
      badgeText: `Due in ${diffDays} days`,
      tone: 'warning'
    };
  }
  return {
    dateStr,
    daysLeft: diffDays,
    badgeText: `Due in ${diffDays} days`,
    tone: 'active'
  };
}

export default function ViewContractModal({ contract, isOpen, onClose }) {
  const [payments, setPayments] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loadingFinancials, setLoadingFinancials] = useState(false);

  // Lock body scroll and Escape listener
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

  // Load payment records and receipts matching this contract
  useEffect(() => {
    if (!isOpen || !contract) return;
    let isMounted = true;
    setLoadingFinancials(true);

    Promise.allSettled([
      paymentApi.getPayments().catch(() => []),
      paymentApi.getReceipts().catch(() => [])
    ]).then(([payRes, recRes]) => {
      if (!isMounted) return;
      if (payRes.status === 'fulfilled' && Array.isArray(payRes.value)) {
        setPayments(payRes.value);
      }
      if (recRes.status === 'fulfilled' && Array.isArray(recRes.value)) {
        setReceipts(recRes.value);
      }
      setLoadingFinancials(false);
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, contract]);

  // Filter linked payment records
  const linkedPayments = useMemo(() => {
    if (!contract || !payments.length) return [];
    const cId = String(contract.contractId || contract.id || contract._id || '').trim();
    const cName = String(contract.name || '').trim().toLowerCase();
    const invoiceNum = String(contract.paymentInvoiceNumber || '').trim().toLowerCase();
    const compName = String(contract.company || '').trim().toLowerCase();

    return payments.filter((p) => {
      // 1. Direct contractId link
      if (p.contractId && (p.contractId === cId || p.contractId.toLowerCase() === cName)) return true;
      if (Array.isArray(p.contractIds) && (p.contractIds.includes(cId) || p.contractIds.map(x => x.toLowerCase()).includes(cName))) return true;

      // 2. Invoice number match
      const pInv = String(p.invoiceNumber || p.invoiceRef || p.paymentId || '').trim().toLowerCase();
      if (invoiceNum && pInv && (pInv === invoiceNum || invoiceNum.includes(pInv) || pInv.includes(invoiceNum))) return true;

      // 3. Exact company match & same solution category or recent
      const pComp = String(p.company || p.accountName || '').trim().toLowerCase();
      if (compName && pComp && compName === pComp) {
        return true;
      }

      return false;
    });
  }, [contract, payments]);

  if (!isOpen || !contract) return null;

  const crm = contract.sangamCrm || {};
  const crmStatus = crm.status || 'pending';
  const crmId = crm.recordId;
  const renewalInfo = getRenewalInfo(contract);
  const isPaid = ['yes', 'true', '1', 'paid'].includes(String(contract.paymentStatus || '').toLowerCase());

  // Download / Print Receipt Helper
  const handlePrintReceipt = (paymentRecord) => {
    // Check if receipt object exists
    const matchingReceipt = receipts.find(
      (r) =>
        r.invoiceNumber === paymentRecord.invoiceNumber ||
        r.receiptNumber === paymentRecord.invoiceNumber ||
        r.id === paymentRecord.id
    );

    const pdfPayload = matchingReceipt || {
      receiptNumber: paymentRecord.invoiceNumber || paymentRecord.paymentId,
      invoiceNumber: paymentRecord.invoiceNumber,
      date: paymentRecord.invoiceDate || paymentRecord.date || new Date().toISOString(),
      amount: paymentRecord.receivedAmount || paymentRecord.amount,
      receivedAmount: paymentRecord.receivedAmount || paymentRecord.amount,
      paymentMethod: paymentRecord.paymentMethod || paymentRecord.method || 'NEFT Wire',
      referenceNumber: paymentRecord.referenceNumber || '',
      company: paymentRecord.company || contract.company,
      customer: paymentRecord.customer || contract.customer,
      items: [
        {
          name: contract.service || contract.name,
          category: contract.productCategory || 'Cloud Server',
          quantity: 1,
          finalPrice: paymentRecord.receivedAmount || paymentRecord.amount
        }
      ]
    };

    try {
      generateReceiptPdf(pdfPayload, {
        name: contract.customer,
        company: contract.company,
        email: contractPersonEmail(contract),
        phone: contractPersonMobile(contract)
      });
    } catch (err) {
      console.error('[ViewContractModal] Failed to generate receipt PDF:', err);
    }
  };

  const modalContent = (
    <div className="adm-modal-backdrop-portal" onClick={onClose}>
      <div
        className="vcm-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="vcm-title"
      >
        {/* Modal Header */}
        <div className="vcm-header">
          <div className="vcm-header-left">
            <div className="vcm-header-icon-wrap">
              <FileText size={22} />
            </div>
            <div>
              <h2 id="vcm-title" className="vcm-header-title">
                <span>{contract.name}</span>
                <span className="vcm-ref-chip">
                  {contract.contractId || contract.id || 'N/A'}
                </span>
              </h2>
              <div className="vcm-header-meta">
                <span style={{ fontWeight: 600, color: '#0f172a' }}>
                  {contract.company || 'N/A'}
                </span>
                {contract.customerId && (
                  <span style={{ color: '#4f46e5', fontFamily: 'monospace', fontWeight: 700 }}>
                    • Customer ID: {contract.customerId}
                  </span>
                )}
                {contract.customer && (
                  <span style={{ color: '#64748b' }}>
                    • Signed by <strong>{contract.customer}</strong>
                  </span>
                )}
                <span style={{ color: '#64748b' }}>
                  • Type: <strong style={{ color: '#4f46e5' }}>{describeContractTerm(contract)}</strong>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="vcm-close-btn"
            onClick={onClose}
            title="Close (Esc)"
          >
            <X size={17} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="vcm-body">
          {/* Top 4-Metric Banner */}
          <div className="vcm-metrics-banner">
            {/* 1. Contract Status */}
            <div className="vcm-metric-card">
              <span className="vcm-metric-label">Contract Status</span>
              <div
                className="vcm-metric-value"
                style={{ color: contractStatusColor(contract.status, contract) }}
              >
                {normalizeContractStatus(contract.status, contract) === 'In Progress' ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Clock size={16} />
                )}
                <span>{normalizeContractStatus(contract.status, contract) || '—'}</span>
              </div>
            </div>

            {/* 2. Payment Status */}
            <div className="vcm-metric-card">
              <span className="vcm-metric-label">Payment Status</span>
              <div
                className="vcm-metric-value"
                style={{ color: isPaid ? '#059669' : '#d97706' }}
              >
                <CheckCircle2 size={16} />
                <span>{isPaid ? 'Yes (Active & Paid)' : 'No (Demo Trial)'}</span>
              </div>
            </div>

            {/* 3. Total Value */}
            <div className="vcm-metric-card">
              <span className="vcm-metric-label">Total Contract Value</span>
              <div className="vcm-metric-value" style={{ color: '#2563eb' }}>
                <IndianRupee size={16} />
                <span>{contract.totalContractValue || contract.value || '₹0'}</span>
              </div>
            </div>

            {/* 4. Next Renewal Date */}
            <div className="vcm-metric-card">
              <span className="vcm-metric-label">Next Renewal Date</span>
              <div className="vcm-metric-value" style={{ color: '#4f46e5', fontSize: '0.96rem' }}>
                <Calendar size={15} />
                <span>{renewalInfo.dateStr}</span>
              </div>
              {renewalInfo.badgeText && (
                <div style={{ marginTop: '4px' }}>
                  <span
                    className={`vcm-renewal-chip vcm-renewal-${renewalInfo.tone}`}
                  >
                    <Clock size={11} />
                    {renewalInfo.badgeText}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 1: Customer & Account Identity */}
          <div className="vcm-card">
            <div className="vcm-card-header">
              <span className="vcm-card-badge vcm-badge-indigo">
                <Building2 size={13} /> Customer &amp; Account Identity
              </span>
            </div>

            <div className="vcm-grid-2">
              <div className="vcm-item">
                <span className="vcm-item-label">Company / Account Name</span>
                <span className="vcm-item-val">{contract.company || 'N/A'}</span>
              </div>

              <div className="vcm-item">
                <span className="vcm-item-label">Signatory / Contact Person</span>
                <span className="vcm-item-val">{contract.customer || 'N/A'}</span>
              </div>

              <div className="vcm-item">
                <span className="vcm-item-label">Registered Contact Email</span>
                <span className="vcm-item-val">{contractPersonEmail(contract) || '—'}</span>
              </div>

              <div className="vcm-item">
                <span className="vcm-item-label">Registered Contact Mobile</span>
                <span className="vcm-item-val">{contractPersonMobile(contract) || '—'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Product, Service & Sales Attribution */}
          <div className="vcm-card">
            <div className="vcm-card-header">
              <span className="vcm-card-badge vcm-badge-blue">
                <Layers size={13} /> Product, Service &amp; Sales Attribution
              </span>
            </div>

            <div className="vcm-grid-3">
              <div className="vcm-item">
                <span className="vcm-item-label">Product / Service Plan</span>
                <span className="vcm-item-val">{contract.service || contract.name}</span>
                <span className="vcm-item-sub">Category: {contract.productCategory || 'Software'}</span>
              </div>

              <div className="vcm-item">
                <span className="vcm-item-label">Assigned Sales Executive</span>
                <span className="vcm-item-val" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <UserCheck size={14} style={{ color: '#6366f1' }} />
                  {contract.salesPerson || 'Sales Team Direct'}
                </span>
                <span className="vcm-item-sub">Attributed in CRM</span>
              </div>

              <div className="vcm-item">
                <span className="vcm-item-label">SLA Guarantee Tier</span>
                <span className="vcm-item-val" style={{ color: '#4f46e5' }}>
                  {contract.slaTier || 'Tier-1 Priority NOC 99.99%'}
                </span>
                <span className="vcm-item-sub">Type: {contract.contractType || 'Comprehensive'}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Validity, Duration & Renewal Schedule */}
          <div className="vcm-card">
            <div className="vcm-card-header">
              <span className="vcm-card-badge vcm-badge-amber">
                <Calendar size={13} /> Validity, Duration &amp; Renewal Schedule
              </span>
              {contract.subscriptionPeriod && (
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#b45309',
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Clock size={12} /> Term: {contract.subscriptionPeriod}
                </span>
              )}
            </div>

            <div className="vcm-grid-4">
              <div className="vcm-item">
                <span className="vcm-item-label">Order Date</span>
                <span className="vcm-item-val">{formatDisplayDate(contract.orderDate)}</span>
              </div>

              <div className="vcm-item">
                <span className="vcm-item-label">Effective Start Date</span>
                <span className="vcm-item-val">{formatDisplayDate(contract.startDate)}</span>
              </div>

              <div className="vcm-item">
                <span className="vcm-item-label">Contract Expiry Date</span>
                <span className="vcm-item-val">{formatDisplayDate(contract.endDate || contract.expiryDate)}</span>
              </div>

              <div className="vcm-item">
                <span className="vcm-item-label">Next Renewal Date</span>
                <span className="vcm-item-val" style={{ color: '#4f46e5', fontWeight: 700 }}>
                  {renewalInfo.dateStr}
                </span>
                {renewalInfo.badgeText && (
                  <span className={`vcm-renewal-chip vcm-renewal-${renewalInfo.tone}`} style={{ marginTop: '4px' }}>
                    {renewalInfo.badgeText}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Linked Payment Records & Financial Ledger */}
          <div className="vcm-card">
            <div className="vcm-card-header">
              <span className="vcm-card-badge vcm-badge-emerald">
                <CreditCard size={13} /> Linked Payment Records &amp; Invoices
              </span>
              {loadingFinancials && (
                <span style={{ fontSize: '0.72rem', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={11} className="animate-spin" /> Fetching ledger...
                </span>
              )}
            </div>

            {linkedPayments.length > 0 ? (
              <div>
                {linkedPayments.map((p, i) => (
                  <div key={p.id || p.paymentId || i} className="vcm-payment-item">
                    <div className="vcm-payment-left">
                      <div className="vcm-payment-icon">
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <div className="vcm-payment-invoice">
                          {p.invoiceNumber || p.paymentId || 'Settled Payment'}
                        </div>
                        <div className="vcm-payment-meta">
                          <span>Date: <strong>{formatDisplayDate(p.invoiceDate || p.date || p.paymentReceivedDate)}</strong></span>
                          <span>•</span>
                          <span>Mode: <strong>{p.paymentMethod || p.method || 'NEFT Wire'}</strong></span>
                          {p.referenceNumber && (
                            <>
                              <span>•</span>
                              <span>Ref: <strong style={{ fontFamily: 'monospace' }}>{p.referenceNumber}</strong></span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="vcm-payment-right">
                      <div>
                        <div className="vcm-payment-amount">
                          {p.receivedAmount || p.amount || contract.totalContractValue || '₹0'}
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '2px' }}>
                          <span
                            style={{
                              fontSize: '0.70rem',
                              fontWeight: 700,
                              color: '#059669',
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              padding: '1px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            {p.status || 'Received'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePrintReceipt(p)}
                        style={{
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          color: '#334155',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f1f5f9';
                          e.currentTarget.style.borderColor = '#94a3b8';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#ffffff';
                          e.currentTarget.style.borderColor = '#cbd5e1';
                        }}
                        title="Download official payment receipt"
                      >
                        <Download size={13} style={{ color: '#059669' }} />
                        <span>Receipt</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  textAlign: 'center'
                }}
              >
                <p style={{ margin: 0, fontSize: '0.84rem', fontWeight: 600, color: '#64748b' }}>
                  {isPaid
                    ? 'Payment is recorded as Active on this agreement. Official ledger entry will appear as transactions synchronize.'
                    : 'No settled payment records found. This agreement is currently on Demo / Unpaid status.'}
                </p>
                {contract.paymentInvoiceNumber && (
                  <p style={{ margin: '6px 0 0 0', fontSize: '0.76rem', color: '#94a3b8' }}>
                    Linked Invoice Reference: <strong style={{ fontFamily: 'monospace', color: '#475569' }}>{contract.paymentInvoiceNumber}</strong>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Section 5: Sangam CRM Status Section */}
          <div
            style={{
              background: crmStatus === 'synced' ? '#f0fdf4' : '#fffbeb',
              border: `1px solid ${crmStatus === 'synced' ? '#bbf7d0' : '#fde68a'}`,
              borderRadius: '12px',
              padding: '14px 18px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {crmStatus === 'synced' ? (
                  <CheckCircle2 size={16} color="#16a34a" />
                ) : (
                  <Clock size={16} color="#d97706" />
                )}
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: crmStatus === 'synced' ? '#166534' : '#92400e' }}>
                  Sangam CRM Status: {crmStatus.toUpperCase()}
                </span>
              </div>

              {crmId && (
                <a
                  href={contractApi.getSangamContractUrl(crmId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#4f46e5',
                    textDecoration: 'none'
                  }}
                >
                  <span>Open in Sangam CRM</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>

            <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span>Record ID: <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{crmId || 'None'}</strong></span>
              {crm.lastSyncedAt && (
                <span>Last Synced: <strong>{new Date(crm.lastSyncedAt).toLocaleString('en-IN')}</strong></span>
              )}
            </div>
          </div>

          {/* Section 6: Agreement Scope & Notes (if any) */}
          {contract.description && (
            <div className="vcm-card" style={{ marginBottom: 0 }}>
              <div className="vcm-card-header">
                <span className="vcm-card-badge vcm-badge-slate">
                  <FileText size={13} /> Agreement Scope &amp; Notes
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {contract.description}
              </p>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer Actions */}
        <div className="vcm-footer">
          <button
            type="button"
            className="adm-btn-secondary"
            onClick={() => generateContractPdf(contract)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', fontSize: '0.85rem' }}
          >
            <Printer size={15} />
            <span>Print Contract (PDF)</span>
          </button>

          <button
            type="button"
            className="adm-btn-primary"
            onClick={onClose}
            style={{ padding: '8px 22px', fontSize: '0.85rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
