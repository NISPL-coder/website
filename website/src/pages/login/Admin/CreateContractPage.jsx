import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Building2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateContractPage({ contracts, setContracts, customers = [] }) {
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const nextYearDate = new Date();
  nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
  const oneYearFromNow = nextYearDate.toISOString().split('T')[0];

  const [formState, setFormState] = useState({
    customer: customers[0]?.name || '',
    company: customers[0]?.company || '',
    email: customers[0]?.email || '',
    service: 'Tally Prime Cloud + VPS Dedicated SLA',
    value: '₹1,80,000 / yr',
    startDate: today,
    expiryDate: oneYearFromNow,
    status: 'active',
    slaTier: 'Tier-1 Priority NOC 99.99%'
  });

  // Pre-fill if customer selected from existing customers
  const handleSelectCustomer = (companyName) => {
    const matched = customers.find((c) => c.company === companyName);
    if (matched) {
      setFormState((prev) => ({
        ...prev,
        customer: matched.name,
        company: matched.company,
        email: matched.email
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.customer.trim() || !formState.company.trim() || !formState.value.trim()) {
      toast.error('Please enter customer details and contract value.');
      return;
    }

    const newContract = {
      id: `CTR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: formState.customer.trim(),
      company: formState.company.trim(),
      email: formState.email.trim() || 'billing@clientcorp.in',
      service: formState.service,
      value: formState.value.trim(),
      startDate: formState.startDate,
      expiryDate: formState.expiryDate,
      status: formState.status,
      slaTier: formState.slaTier
    };

    setContracts([newContract, ...contracts]);
    toast.success(`Contract ${newContract.id} created for ${newContract.company}!`, {
      style: {
        borderRadius: '12px',
        background: '#0f172a',
        color: '#ffffff',
        fontSize: '0.85rem'
      }
    });

    navigate('/admin/customer/contract');
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
              onClick={() => navigate('/admin/customer/contract')}
            >
              Contracts
            </span>
            <span className="adm-breadcrumb-sep">/</span>
            <span className="adm-breadcrumb-active">Create Contract</span>
          </div>

          <div className="adm-create-title-group">
            <h1 className="adm-section-title">Create Customer Service Contract</h1>
            <p className="adm-section-sub">
              Establish legal Master Service Agreements (MSA), define SLA performance commitments, and bind cloud resources.
            </p>
          </div>
        </div>

        <div className="adm-create-header-action">
          <button
            type="button"
            className="adm-back-btn"
            onClick={() => navigate('/admin/customer/contract')}
          >
            <ArrowLeft size={16} />
            <span>Back to Contracts</span>
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="adm-table-card adm-form-card">
        <form onSubmit={handleSubmit}>
          {/* Section 1: Client Binding */}
          <div className="adm-form-section">
            <div className="adm-form-section-title">
              <Building2 size={18} className="adm-form-section-icon purple" />
              <span>Contracting Client Profile</span>
            </div>

            {customers && customers.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <label className="adm-form-label">Auto-Fill from Existing Customer Directory</label>
                <select
                  className="adm-form-input"
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>-- Select existing customer organization --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.company}>
                      {c.company} ({c.name})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label className="adm-form-label">Client Organization / Legal Entity *</label>
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
                <label className="adm-form-label">Signatory Representative Name *</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter your name"
                  value={formState.customer}
                  onChange={(e) => setFormState({ ...formState, customer: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-field full-width" style={{ gridColumn: '1 / -1' }}>
                <label className="adm-form-label">Corporate Email Address</label>
                <input
                  type="email"
                  className="adm-form-input"
                  placeholder="Enter your email address"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: SLA & Commitment Scope */}
          <div className="adm-form-section" style={{ marginTop: '28px' }}>
            <div className="adm-form-section-title">
              <ShieldCheck size={18} className="adm-form-section-icon emerald" />
              <span>Service Scope &amp; Financial Terms</span>
            </div>

            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label className="adm-form-label">Service SLA Tier *</label>
                <select
                  className="adm-form-input"
                  value={formState.service}
                  onChange={(e) => setFormState({ ...formState, service: e.target.value })}
                >
                  <option>Tally Prime Cloud + VPS Dedicated SLA</option>
                  <option>Enterprise Cloud VPS Dedicated 8-Core Node</option>
                  <option>Tally Multi-User Gold Cloud + TSS Sync</option>
                  <option>Tally Prime Single User Silver</option>
                  <option>High-Mem Cloud VPS Node Hypervisor</option>
                </select>
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Annual Value (ARR / Year) *</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter contract annual value"
                  value={formState.value}
                  onChange={(e) => setFormState({ ...formState, value: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">SLA Support Grade</label>
                <select
                  className="adm-form-input"
                  value={formState.slaTier}
                  onChange={(e) => setFormState({ ...formState, slaTier: e.target.value })}
                >
                  <option>Tier-1 Priority NOC 99.99%</option>
                  <option>24/7 Dedicated Support Hotline</option>
                  <option>Annual Gold Maintenance &amp; Upgrade Pack</option>
                  <option>Standard Cloud Hosting SLA</option>
                </select>
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Contract Effective Start Date *</label>
                <input
                  type="date"
                  className="adm-form-input"
                  value={formState.startDate}
                  onChange={(e) => setFormState({ ...formState, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Contract Expiry / Renewal Date *</label>
                <input
                  type="date"
                  className="adm-form-input"
                  value={formState.expiryDate}
                  onChange={(e) => setFormState({ ...formState, expiryDate: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Contract Initial Status</label>
                <select
                  className="adm-form-input"
                  value={formState.status}
                  onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                >
                  <option value="active">Active (SLA Executed)</option>
                  <option value="expiring">Expiring Soon (30-Day Window)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="adm-form-footer">
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={() => navigate('/admin/customer/contract')}
            >
              Cancel
            </button>
            <button type="submit" className="adm-btn-primary">
              <FileText size={16} />
              <span>Generate &amp; Execute Contract</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
