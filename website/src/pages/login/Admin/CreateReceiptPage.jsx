import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ReceiptText,
  Building2,
  Calendar,
  CheckCircle2,
  FileCheck,
  Send,
  CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateReceiptPage({ receipts, setReceipts, payments = [], customers = [] }) {
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  const firstPayment = payments.find((p) => p.status === 'paid') || payments[0];

  const [formState, setFormState] = useState({
    paymentId: firstPayment?.id || 'TXN-994101',
    company: firstPayment?.company || 'FlowMail Agency Pvt Ltd',
    customer: firstPayment?.customer || 'Debasish Chakraborty',
    amount: firstPayment?.amount || '₹14,500',
    baseAmount: '₹12,288',
    taxAmount: '₹2,212',
    date: today,
    mode: firstPayment?.method || 'NEFT / RTGS',
    status: 'Issued & Dispatched'
  });

  const handleSelectPayment = (paymentId) => {
    const matched = payments.find((p) => p.id === paymentId);
    if (matched) {
      const rawNum = parseInt(matched.amount.replace(/[^0-9]/g, '')) || 10000;
      const base = Math.round(rawNum / 1.18);
      const tax = rawNum - base;

      setFormState({
        paymentId: matched.id,
        company: matched.company,
        customer: matched.customer,
        amount: matched.amount,
        baseAmount: `₹${base.toLocaleString('en-IN')}`,
        taxAmount: `₹${tax.toLocaleString('en-IN')}`,
        date: matched.date ? matched.date.split(' ')[0] : today,
        mode: matched.method,
        status: 'Issued & Dispatched'
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.company.trim() || !formState.amount.trim()) {
      toast.error('Please provide company and receipt amount.');
      return;
    }

    const newReceipt = {
      id: `REC-2026-${Math.floor(1050 + Math.random() * 50)}`,
      customer: formState.customer.trim() || 'Accounts Representative',
      company: formState.company.trim(),
      amount: formState.amount,
      baseAmount: formState.baseAmount,
      taxAmount: formState.taxAmount,
      date: formState.date,
      mode: formState.mode,
      status: formState.status
    };

    setReceipts([newReceipt, ...receipts]);
    toast.success(`Receipt ${newReceipt.id} generated and dispatched!`, {
      style: {
        borderRadius: '12px',
        background: '#0f172a',
        color: '#ffffff',
        fontSize: '0.85rem'
      }
    });

    navigate('/admin/receipt');
  };

  return (
    <div className="adm-create-page-container animate-fade-in">
      {/* Top Navigation & Header */}
      <div className="adm-create-page-header">
        <div className="adm-create-header-left">
          <div className="adm-breadcrumb-row">
            <span className="adm-breadcrumb-mute">Admin</span>
            <span className="adm-breadcrumb-sep">/</span>
            <span
              className="adm-breadcrumb-link"
              onClick={() => navigate('/admin/receipt')}
            >
              Receipt Management
            </span>
            <span className="adm-breadcrumb-sep">/</span>
            <span className="adm-breadcrumb-active">Generate Receipt</span>
          </div>

          <div className="adm-create-title-group">
            <h1 className="adm-section-title">Generate Certified GST Payment Receipt</h1>
            <p className="adm-section-sub">
              Issue certified tax payment receipts, calculate 18% IGST/CGST breakdown, and trigger automated WhatsApp &amp; Email client dispatches.
            </p>
          </div>
        </div>

        <div className="adm-create-header-action">
          <button
            type="button"
            className="adm-back-btn"
            onClick={() => navigate('/admin/receipt')}
          >
            <ArrowLeft size={16} />
            <span>Back to Receipts</span>
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="adm-table-card adm-form-card">
        <form onSubmit={handleSubmit}>
          {/* Section 1: Transaction Binding */}
          <div className="adm-form-section">
            <div className="adm-form-section-title">
              <CreditCard size={18} className="adm-form-section-icon purple" />
              <span>Link Payment Transaction &amp; Client</span>
            </div>

            {payments && payments.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <label className="adm-form-label">Select Cleared Transaction Record</label>
                <select
                  className="adm-form-input"
                  value={formState.paymentId}
                  onChange={(e) => handleSelectPayment(e.target.value)}
                >
                  {payments.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} — {p.company} ({p.amount}) [{p.status.toUpperCase()}]
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label className="adm-form-label">Client / Organization Name *</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter your company name"
                  value={formState.company}
                  onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Client Signatory / Billing Contact</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter your name"
                  value={formState.customer}
                  onChange={(e) => setFormState({ ...formState, customer: e.target.value })}
                />
              </div>

              <div className="adm-form-field full-width" style={{ gridColumn: '1 / -1' }}>
                <label className="adm-form-label">Payment Channel / Settlement Mode</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter payment channel / mode (e.g. NEFT, UPI, NetBanking)"
                  value={formState.mode}
                  onChange={(e) => setFormState({ ...formState, mode: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Financial & Tax Breakdown */}
          <div className="adm-form-section" style={{ marginTop: '28px' }}>
            <div className="adm-form-section-title">
              <ReceiptText size={18} className="adm-form-section-icon emerald" />
              <span>Financials &amp; Statutory GST Breakdown</span>
            </div>

            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label className="adm-form-label">Total Amount Received (Gross) *</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter total payment amount"
                  value={formState.amount}
                  onChange={(e) => setFormState({ ...formState, amount: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Net Base Value (Excl. Tax)</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter net base amount"
                  value={formState.baseAmount}
                  onChange={(e) => setFormState({ ...formState, baseAmount: e.target.value })}
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Tax Deduction (18% GST)</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter tax amount (18% GST)"
                  value={formState.taxAmount}
                  onChange={(e) => setFormState({ ...formState, taxAmount: e.target.value })}
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Receipt Clearance Date *</label>
                <input
                  type="date"
                  className="adm-form-input"
                  value={formState.date}
                  onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Dispatch Status</label>
                <select
                  className="adm-form-input"
                  value={formState.status}
                  onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                >
                  <option value="Issued & Dispatched">Issued &amp; Dispatched (WhatsApp &amp; Email)</option>
                  <option value="Pending Verification">Pending Verification</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="adm-form-footer">
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={() => navigate('/admin/receipt')}
            >
              Cancel
            </button>
            <button type="submit" className="adm-btn-primary">
              <Send size={16} />
              <span>Generate &amp; Dispatch Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
