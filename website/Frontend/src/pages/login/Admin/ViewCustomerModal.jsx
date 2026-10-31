import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ExternalLink,
  Printer,
  Edit3,
  RotateCw,
  Building2,
  Mail,
  Phone,
  Server,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { customerApi } from '../../../services/customerApi';
import { generateCustomerPdf } from './utils/generateCustomerPdf';

export default function ViewCustomerModal({
  customer,
  isOpen,
  onClose,
  onEdit,
  onRetrySync,
  isSyncing = false
}) {
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
                  background: '#ede9fe',
                  color: '#6366f1',
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
              <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#0f172a' }}>
                {customer.status}
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
              <Building2 size={18} color="#4f46e5" />
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
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '12px',
              fontSize: '0.82rem',
              color: '#475569'
            }}
          >
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Sangam CRM Record ID:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#4f46e5' }}>
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
                  background: '#4f46e5',
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

            {(crmStatus === 'failed' || crmStatus === 'pending') && onRetrySync && (
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

        {/* Profile Overview Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '16px',
            fontSize: '0.86rem'
          }}
        >
          <div>
            <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Corporate Email</span>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{customer.email}</div>
          </div>

          <div>
            <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Phone / WhatsApp</span>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{customer.phone}</div>
          </div>

          <div>
            <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Subscribed Tier</span>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{customer.plan}</div>
          </div>

          <div>
            <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Server Hypervisor Node</span>
            <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#6366f1' }}>
              {customer.serverNode}
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Billing & Physical Address</span>
            <div style={{ fontWeight: 500, color: '#334155', marginTop: '2px' }}>
              {typeof customer.address === 'object'
                ? [
                    customer.address.street,
                    customer.address.area,
                    customer.address.city,
                    customer.address.state,
                    customer.address.postalCode,
                    customer.address.country
                  ]
                    .filter(Boolean)
                    .join(', ')
                : customer.address || customer.city}
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

