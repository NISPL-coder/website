import React, { useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { contractApi } from '../../../services/contractApi';
import { generateContractPdf } from './utils/generateContractPdf';

export default function ViewContractModal({ contract, isOpen, onClose }) {
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

  if (!isOpen || !contract) return null;

  const crm = contract.sangamCrm || {};
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
          maxWidth: '680px',
          width: '100%',
          borderRadius: '18px',
          background: '#ffffff',
          padding: '28px 32px',
          boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(0,0,0,0.06)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Modal Header */}
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
              <h2 style={{ fontSize: '1.30rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {contract.name}
              </h2>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.80rem',
                  background: '#ede9fe',
                  color: '#6366f1',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontWeight: 700
                }}
              >
                {contract.contractId || contract.id}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Account Holder: <strong>{contract.company || contract.customer || 'N/A'}</strong> • Type:{' '}
              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                {contract.contractType || 'Subscription'} ({contract.subscriptionPeriod || '1 Year'})
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

        {/* Status & Quick Metrics Banner */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '22px'
          }}
        >
          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
              Contract Status
            </span>
            <span
              style={{
                fontSize: '0.92rem',
                fontWeight: 700,
                color: contract.status?.toLowerCase() === 'active' ? '#059669' : '#d97706',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                marginTop: '4px'
              }}
            >
              <CheckCircle2 size={13} />
              {contract.status || 'Active'}
            </span>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
              Total Value
            </span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1d4ed8', display: 'block', marginTop: '2px' }}>
              {contract.totalContractValue || contract.value || 'N/A'}
            </span>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
              Category
            </span>
            <span style={{ fontSize: '0.90rem', fontWeight: 600, color: '#334155', display: 'block', marginTop: '4px' }}>
              {contract.productCategory || 'Software'}
            </span>
          </div>
        </div>

        {/* Detailed Attribute Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '22px' }}>
          <div>
            <label style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Service Scope & SLA Tier
            </label>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
              {contract.service || `${contract.contractType || 'Subscription'} (${contract.subscriptionPeriod || '1 Year'})`}
            </p>
            <span style={{ fontSize: '0.76rem', color: '#6366f1', fontWeight: 600 }}>
              {contract.slaTier || 'Tier-1 Priority NOC 99.99%'}
            </span>
          </div>

          <div>
            <label style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Registered Contact Email
            </label>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
              {contract.email || 'contracts@nispl.in'}
            </p>
          </div>

          <div>
            <label style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Effective Start Date
            </label>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
              {contract.startDate || 'N/A'}
            </p>
          </div>

          <div>
            <label style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Contract Expiry Date
            </label>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
              {contract.endDate || contract.expiryDate || 'N/A'}
            </p>
          </div>
        </div>

        {/* Sangam CRM Status Section */}
        <div
          style={{
            background: crmStatus === 'synced' ? '#f0fdf4' : '#fffbeb',
            border: `1px solid ${crmStatus === 'synced' ? '#bbf7d0' : '#fde68a'}`,
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '24px'
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

          <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '16px' }}>
            <span>Record ID: <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{crmId || 'None'}</strong></span>
            {crm.lastSyncedAt && (
              <span>Last Synced: <strong>{new Date(crm.lastSyncedAt).toLocaleString('en-IN')}</strong></span>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="adm-btn-secondary"
            onClick={() => generateContractPdf(contract)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <Printer size={15} />
            <span>Print (PDF)</span>
          </button>
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
