import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ReceiptText,
  Building2,
  Calendar,
  CreditCard,
  Layers,
  Cpu,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { generateReceiptPdf } from '../../Dashboard/utils/generateReceiptPdf';
import { usePermissions } from './PermissionsContext';
import { toReceiptPdfRow } from './adminTableUtils';

const inr = (value) =>
  value === undefined || value === null || value === ''
    ? '—'
    : `₹${Number(value).toLocaleString('en-IN')}`;

const text = (value) => value || 'Not recorded';

const labelStyle = {
  fontSize: '0.72rem',
  color: '#94a3b8',
  textTransform: 'uppercase',
  fontWeight: 700,
  display: 'block'
};

const valueStyle = {
  margin: '4px 0 0 0',
  fontSize: '0.88rem',
  fontWeight: 600,
  color: '#0f172a',
  wordBreak: 'break-word'
};

function Field({ label, value, mono }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <p style={{ ...valueStyle, ...(mono ? { fontFamily: 'monospace' } : null) }}>{value}</p>
    </div>
  );
}

function Tile({ label, value, tone }) {
  return (
    <div
      style={{
        background: '#f8fafc',
        padding: '12px 14px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0'
      }}
    >
      <span style={labelStyle}>{label}</span>
      <span
        style={{
          fontSize: '1.05rem',
          fontWeight: 800,
          color: tone || '#1d4ed8',
          display: 'block',
          marginTop: '2px'
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function ViewReceiptModal({ receipt, isOpen, onClose }) {
  const { canSeeColumn } = usePermissions();

  useEffect(() => {
    if (!isOpen) return undefined;
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

  if (!isOpen || !receipt) return null;

  const showCustomer = canSeeColumn('receipt', 'customer');
  const showProduct = canSeeColumn('receipt', 'product') || canSeeColumn('receipt', 'items');
  const showContract = canSeeColumn('receipt', 'contract');
  const showSales = canSeeColumn('receipt', 'salesPerson');
  const showTax = canSeeColumn('receipt', 'taxAmount') || canSeeColumn('receipt', 'baseAmount');
  const showChannel = canSeeColumn('receipt', 'mode');

  const customer = receipt.customer || {};
  const product = receipt.product || {};
  const contract = receipt.contract || null;
  const items = Array.isArray(receipt.items) ? receipt.items : [];
  const paymentTaken = receipt.paymentReceivedDate || receipt.date;

  const modalContent = (
    <div
      className="adm-modal-backdrop-portal"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
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
          maxWidth: '760px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <ReceiptText size={18} color="#1d4ed8" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {receipt.productName || receipt.service || 'Payment receipt'}
              </h2>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  background: '#ede9fe',
                  color: '#6366f1',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontWeight: 700
                }}
              >
                {receipt.invoiceNumber || receipt.id}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '6px 0 0 0' }}>
              {customer.company || customer.name || '—'} • Paid{' '}
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{paymentTaken || '—'}</span>
              {showSales && receipt.salesPerson ? (
                <>
                  {' '}
                  • Sold by{' '}
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{receipt.salesPerson}</span>
                </>
              ) : null}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close receipt"
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
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Money tiles */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(170px, 100%), 1fr))',
            gap: '12px',
            marginBottom: '22px'
          }}
        >
          <Tile label="Amount Received" value={inr(receipt.amount)} />
          {showTax && <Tile label="Taxable Value" value={inr(receipt.baseAmount)} tone="#334155" />}
          {showTax && (
            <Tile
              label="18% GST"
              value={`${inr(receipt.taxAmount)}${
                receipt.cgst ? ` (CGST ${inr(receipt.cgst)} + SGST ${inr(receipt.sgst)})` : ''
              }`}
              tone="#334155"
            />
          )}
          <Tile
            label="Status"
            value={receipt.status || '—'}
            tone={String(receipt.status).toLowerCase() === 'received' || String(receipt.status).toLowerCase() === 'cleared' ? '#059669' : '#d97706'}
          />
        </div>

        {showTax && receipt.gstBasis ? (
          <p
            style={{
              margin: '-12px 0 20px 0',
              fontSize: '0.76rem',
              color: '#64748b',
              fontStyle: 'italic'
            }}
          >
            GST basis: {receipt.gstBasis}
          </p>
        ) : null}

        {/* What was sold */}
        {showProduct && (
          <div style={{ marginBottom: '22px' }}>
            <h3
              style={{
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#475569',
                fontWeight: 700,
                margin: '0 0 10px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Layers size={13} /> Items covered by this payment
            </h3>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                    <th style={{ padding: '9px 12px', color: '#64748b', fontWeight: 700 }}>Product</th>
                    <th style={{ padding: '9px 12px', color: '#64748b', fontWeight: 700 }}>Configuration</th>
                    <th style={{ padding: '9px 12px', color: '#64748b', fontWeight: 700, textAlign: 'right' }}>
                      Taxable
                    </th>
                    <th style={{ padding: '9px 12px', color: '#64748b', fontWeight: 700, textAlign: 'right' }}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={`${item.productId || item.name}-${index}`} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          {[item.sku, item.category, item.provider, item.billingCycle]
                            .filter(Boolean)
                            .join(' • ')}
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#475569', verticalAlign: 'top' }}>
                        {[
                          item.serverConfiguration,
                          [item.cores, item.ram, item.storage].filter(Boolean).join(' / '),
                          item.users ? `${item.users} users` : ''
                        ]
                          .filter(Boolean)
                          .join(' • ') || '—'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#475569' }}>
                        {inr(item.basePrice)} × {item.quantity || 1}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                        {inr(item.finalPrice)}
                      </td>
                    </tr>
                  ))}
                  {!items.length && (
                    <tr>
                      <td colSpan={4} style={{ padding: '12px', color: '#64748b' }}>
                        No product line was recorded against this payment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Attribute grids */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '18px', marginBottom: '22px' }}>
          {showCustomer && (
            <div style={{ display: 'grid', gap: '14px' }}>
              <h3 style={{ gridColumn: '1 / -1', ...labelStyle, color: '#475569' }}>
                <Building2 size={13} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                Customer &amp; billing
              </h3>
              <Field label="Organization" value={text(customer.company)} />
              <Field label="Contact person" value={text(customer.name)} />
              <Field label="Login email" value={text(customer.email)} />
              <Field label="Customer ID" value={text(customer.customerId)} mono />
              <Field label="GSTIN" value={text(customer.gstNo)} mono />
              <Field label="PAN" value={text(customer.pan)} mono />
              <Field label="Phone" value={text(customer.phone)} />
            </div>
          )}

          <div style={{ display: 'grid', gap: '14px' }}>
            <h3 style={{ gridColumn: '1 / -1', ...labelStyle, color: '#475569' }}>
              <CreditCard size={13} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
              Payment
            </h3>
            <Field label="Payment ID" value={text(receipt.paymentId)} mono />
            <Field label="Invoice date" value={text(receipt.invoiceDate)} />
            <Field label="Received on" value={text(paymentTaken)} />
            {receipt.dueDate ? <Field label="Due date" value={receipt.dueDate} /> : null}
            {showChannel && (
              <>
                <Field label="Channel" value={text(receipt.paymentMode)} />
                <Field
                  label="Recorded through"
                  value={text(receipt.source === 'gateway' ? 'Razorpay gateway' : receipt.source)}
                />
                {receipt.razorpayPaymentId ? (
                  <Field label="Gateway payment ref" value={receipt.razorpayPaymentId} mono />
                ) : null}
              </>
            )}
            {showSales && receipt.raisedBy?.name ? (
              <Field label="Entered by" value={`${receipt.raisedBy.name}${receipt.raisedBy.role ? ` (${receipt.raisedBy.role})` : ''}`} />
            ) : null}
          </div>

          {showContract && (
            <div style={{ display: 'grid', gap: '14px' }}>
              <h3 style={{ gridColumn: '1 / -1', ...labelStyle, color: '#475569' }}>
                <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                Subscription
              </h3>
              {contract ? (
                <>
                  <Field label="Contract" value={text(contract.name)} />
                  <Field label="Contract code" value={text(contract.id)} mono />
                  <Field
                    label="Type & term"
                    value={text([contract.type, contract.subscriptionPeriod].filter(Boolean).join(' • '))}
                  />
                  <Field label="Start date" value={text(contract.startDate)} />
                  <Field label="Expiry date" value={text(contract.endDate)} />
                  <Field label="Contract value" value={text(contract.value)} />
                  <Field label="SLA tier" value={text(contract.slaTier)} />
                  {showSales ? <Field label="Sales person" value={text(receipt.salesPerson)} /> : null}
                </>
              ) : (
                <p style={{ ...valueStyle, fontWeight: 500, color: '#64748b' }}>
                  This payment is not linked to a subscription on record.
                </p>
              )}
            </div>
          )}

          {showProduct && Object.keys(product).length > 0 && (
            <div style={{ display: 'grid', gap: '14px' }}>
              <h3 style={{ gridColumn: '1 / -1', ...labelStyle, color: '#475569' }}>
                <Cpu size={13} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                Product on record
              </h3>
              <Field label="Product ID" value={text(product.productId)} mono />
              <Field label="Category" value={text(product.category)} />
              <Field label="Provider" value={text(product.provider)} />
              <Field label="Billing cycle" value={text(product.billingCycle)} />
              <Field label="Server configuration" value={text(product.serverConfiguration)} />
              <Field
                label="Cores / RAM / Storage"
                value={text([product.cores, product.ram, product.storage].filter(Boolean).join(' / '))}
              />
              <Field label="Users" value={product.users ? String(product.users) : 'Not recorded'} />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="adm-btn-secondary"
            onClick={() => generateReceiptPdf(toReceiptPdfRow(receipt), customer)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '0.85rem'
            }}
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
            <CheckCircle2 size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
