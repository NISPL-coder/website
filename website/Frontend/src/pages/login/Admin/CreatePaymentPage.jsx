import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import {
  ArrowLeft,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { customSelectStyles } from './reactSelectStyles';

const PAYMENT_METHODS = [
  { value: 'NEFT / RTGS Wire', label: 'NEFT / RTGS Wire' },
  { value: 'Razorpay UPI Gateway', label: 'Razorpay UPI Gateway' },
  { value: 'Corporate NetBanking (HDFC)', label: 'Corporate NetBanking (HDFC)' },
  { value: 'Corporate Visa Card', label: 'Corporate Visa Card' },
  { value: 'Cheque Clearance', label: 'Cheque Clearance' }
];

const SETTLEMENT_STATUSES = [
  { value: 'paid', label: 'Paid & Cleared (Settled)' },
  { value: 'pending', label: 'Pending Bank Verification' }
];

export default function CreatePaymentPage({ payments, setPayments, customers = [], contracts = [] }) {
  const navigate = useNavigate();

  const now = new Date();
  const formattedNow = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [formState, setFormState] = useState({
    company: customers[0]?.company || '',
    customer: customers[0]?.name || '',
    amount: '₹18,500',
    method: 'NEFT / RTGS Wire',
    invoiceRef: `INV-2026-${Math.floor(1050 + Math.random() * 50)}`,
    date: formattedNow,
    status: 'paid'
  });

  const customerOptions = useMemo(() => {
    return customers.map((c) => ({
      value: c.company,
      label: `${c.company} (${c.name})`
    }));
  }, [customers]);

  const handleSelectCustomer = (companyName) => {
    const matched = customers.find((c) => c.company === companyName);
    if (matched) {
      setFormState((prev) => ({
        ...prev,
        company: matched.company,
        customer: matched.name,
        amount: matched.mrr !== '₹0 (Trial)' && matched.mrr ? matched.mrr : '₹18,500'
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.company.trim() || !formState.amount.trim()) {
      toast.error('Please enter company and payment amount.');
      return;
    }

    const newPayment = {
      id: `TXN-${Math.floor(994100 + Math.random() * 900)}`,
      customer: formState.customer.trim() || 'Accounts Representative',
      company: formState.company.trim(),
      amount: formState.amount.startsWith('₹') ? formState.amount.trim() : `₹${formState.amount.trim()}`,
      method: formState.method,
      date: formState.date || formattedNow,
      invoiceRef: formState.invoiceRef.trim() || `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: formState.status
    };

    setPayments([newPayment, ...payments]);
    toast.success(`Payment ${newPayment.id} recorded successfully!`, {
      style: {
        borderRadius: '12px',
        background: '#0f172a',
        color: '#ffffff',
        fontSize: '0.85rem'
      }
    });

    navigate('/admin/customer/payment');
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
              onClick={() => navigate('/admin/customer')}
            >
              Customer
            </span>
            <span className="adm-breadcrumb-sep">/</span>
            <span
              className="adm-breadcrumb-link"
              onClick={() => navigate('/admin/customer/payment')}
            >
              Payments
            </span>
            <span className="adm-breadcrumb-sep">/</span>
            <span className="adm-breadcrumb-active">Record Payment</span>
          </div>

          <div className="adm-create-title-group">
            <h1 className="adm-section-title">Record Incoming Customer Payment</h1>
            <p className="adm-section-sub">
              Log incoming wire transfers, UPI gateway receipts, and client corporate settlements with automated invoice reconciliation.
            </p>
          </div>
        </div>

        <div className="adm-create-header-action">
          <button
            type="button"
            className="adm-back-btn"
            onClick={() => navigate('/admin/customer/payment')}
          >
            <ArrowLeft size={16} />
            <span>Back to Payments</span>
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="adm-table-card adm-form-card">
        <form onSubmit={handleSubmit}>
          {/* Section 1: Payer Details */}
          <div className="adm-form-section">
            <div className="adm-form-section-title">
              <Building2 size={18} className="adm-form-section-icon purple" />
              <span>Payer &amp; Invoice Reference</span>
            </div>

            {customers && customers.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <label className="adm-form-label">Auto-Fill Payer from Customers</label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={true}
                  options={customerOptions}
                  onChange={(opt) => handleSelectCustomer(opt?.value)}
                  placeholder="Search and select paying client account..."
                  classNamePrefix="react-select"
                />
              </div>
            )}

            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Paying Organization <span className="adm-required-star">*</span>
                </label>
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
                <label className="adm-form-label">Contact / Billing Contact Name</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter your name"
                  value={formState.customer}
                  onChange={(e) => setFormState({ ...formState, customer: e.target.value })}
                />
              </div>

              <div className="adm-form-field full-width" style={{ gridColumn: '1 / -1' }}>
                <label className="adm-form-label">
                  Invoice Number Reference <span className="adm-required-star">*</span>
                </label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter your invoice reference number"
                  value={formState.invoiceRef}
                  onChange={(e) => setFormState({ ...formState, invoiceRef: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Parameters */}
          <div className="adm-form-section" style={{ marginTop: '28px' }}>
            <div className="adm-form-section-title">
              <CreditCard size={18} className="adm-form-section-icon emerald" />
              <span>Settlement &amp; Transaction Details</span>
            </div>

            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Settled Amount (₹) <span className="adm-required-star">*</span>
                </label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter payment amount"
                  value={formState.amount}
                  onChange={(e) => setFormState({ ...formState, amount: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">
                  Payment Channel / Mode <span className="adm-required-star">*</span>
                </label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={false}
                  options={PAYMENT_METHODS}
                  value={PAYMENT_METHODS.find((m) => m.value === formState.method) || PAYMENT_METHODS[0]}
                  onChange={(opt) => setFormState({ ...formState, method: opt?.value || 'NEFT / RTGS Wire' })}
                  classNamePrefix="react-select"
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Settlement Status</label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={false}
                  options={SETTLEMENT_STATUSES}
                  value={SETTLEMENT_STATUSES.find((s) => s.value === formState.status) || SETTLEMENT_STATUSES[0]}
                  onChange={(opt) => setFormState({ ...formState, status: opt?.value || 'paid' })}
                  classNamePrefix="react-select"
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Transaction Date &amp; Time</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter transaction date & time"
                  value={formState.date}
                  onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="adm-form-footer">
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={() => navigate('/admin/customer/payment')}
            >
              Cancel
            </button>
            <button type="submit" className="adm-btn-primary">
              <FileCheck size={16} />
              <span>Log &amp; Reconcile Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
