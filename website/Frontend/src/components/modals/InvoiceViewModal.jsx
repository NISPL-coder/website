import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Building2, FileText } from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import { COMPANY_INFO } from '../../data/mockData';

export default function InvoiceViewModal({ isOpen, onClose, invoice }) {
  if (!isOpen || !invoice) return null;

  return (
    <div className="nis-modal-backdrop" onClick={onClose}>
      <div 
        className="nis-invoice-modal animate-fade-in" 
        style={{ maxWidth: '780px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-bar">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <FileText size={20} color="#FFFFFF" />
            </div>
            <div>
              <h2 className="modal-main-title">Tax Invoice Preview: {invoice.invoiceNo}</h2>
              <span className="modal-sub-title">Status: {invoice.status} • GSTIN: {invoice.gstin || '27AAACR1234M1Z2'}</span>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body-scrollable" style={{ background: '#FFFFFF' }}>
          {/* Printable Invoice Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border)', paddingBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'linear-gradient(135deg, #1239A6, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 800, fontSize: '0.85rem' }}>
                  NIS
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {COMPANY_INFO.name}
                </h3>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {COMPANY_INFO.address}<br />
                <b>GSTIN:</b> {COMPANY_INFO.gstin} | <b>Phone:</b> {COMPANY_INFO.phone}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary-light)', fontWeight: 800, borderRadius: '4px', fontSize: '0.9rem', marginBottom: '8px' }}>
                TAX INVOICE
              </span>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <b>Invoice #:</b> {invoice.invoiceNo}<br />
                <b>Date:</b> {invoice.date}<br />
                <b>Due Date:</b> {invoice.dueDate || '20 Oct 2026'}
              </p>
            </div>
          </div>

          {/* Billed To */}
          <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', margin: '16px 0' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-light)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Billed To Customer
            </span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
              {invoice.party}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              GSTIN: {invoice.gstin || '27AAACR1234M1Z2'} • State: Maharashtra (27)
            </p>
          </div>

          {/* Items Summary Table */}
          <table className="nis-data-table" style={{ border: '1px solid var(--border)' }}>
            <thead>
              <tr>
                <th>Description</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Unit Rate (₹)</th>
                <th className="text-center">GST</th>
                <th className="text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>Enterprise IT & Accounting Solutions Deployment</b>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HSN/SAC: 998314 • Taxable Supply</div>
                </td>
                <td className="text-center">1</td>
                <td className="text-right font-medium">{formatINR(invoice.amount * 0.847)}</td>
                <td className="text-center font-bold">18%</td>
                <td className="text-right font-bold">{formatINR(invoice.amount)}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals & Seal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px', color: '#047857', fontSize: '0.78rem' }}>
              <ShieldCheck size={18} />
              <span>Digitally Signed & NIC e-Way Gateway Reconciled</span>
            </div>

            <div style={{ textAlign: 'right', minWidth: '220px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>Taxable Value:</span>
                <span>{formatINR(invoice.amount * 0.847)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>CGST (9%) + SGST (9%):</span>
                <span>{formatINR(invoice.amount * 0.153)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', borderTop: '2px solid var(--border)', paddingTop: '6px' }}>
                <span>Invoice Total:</span>
                <span>{formatINR(invoice.amount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer-bar">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Close
          </button>
          <div className="footer-right-buttons">
            <button 
              type="button" 
              className="btn-secondary-action"
              onClick={() => {
                alert(`Invoice ${invoice.invoiceNo} PDF downloaded.`);
              }}
            >
              <Download size={15} />
              <span>Download PDF</span>
            </button>
            <button 
              type="button" 
              className="btn-primary-action"
              onClick={() => window.print()}
            >
              <Printer size={15} />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
