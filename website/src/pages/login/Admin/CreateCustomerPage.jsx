import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Server,
  CreditCard,
  ShieldCheck,
  Check,
  UserCheck,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateCustomerPage({ customers, setCustomers }) {
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    city: 'Kolkata, WB',
    plan: 'Tally Prime Cloud + VPS Gold',
    serverNode: 'CtrlS-KOL-NODE-01',
    status: 'active',
    mrr: '₹15,000'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.company.trim() || !formState.email.trim()) {
      toast.error('Please enter all required customer fields.');
      return;
    }

    const isDemo = formState.status === 'demo';
    const computedMrr = isDemo
      ? '₹0 (Trial)'
      : formState.mrr || (formState.status === 'inactive' ? '₹0' : '₹15,000');

    const newCustomer = {
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formState.name.trim(),
      company: formState.company.trim(),
      email: formState.email.trim(),
      phone: formState.phone.trim() || '+91 98300 00000',
      city: formState.city.trim() || 'Eastern India',
      plan: formState.plan,
      serverNode: formState.serverNode,
      status: formState.status,
      registered: new Date().toISOString().split('T')[0],
      mrr: computedMrr
    };

    setCustomers([newCustomer, ...customers]);
    toast.success(`Customer "${newCustomer.company}" created successfully!`, {
      style: {
        borderRadius: '12px',
        background: '#0f172a',
        color: '#ffffff',
        fontSize: '0.85rem'
      }
    });

    // Navigate back to the customer directory listing
    navigate('/admin/customer');
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
              Customer Accounts
            </span>
            <span className="adm-breadcrumb-sep">/</span>
            <span className="adm-breadcrumb-active">Create Customer</span>
          </div>

          <div className="adm-create-title-group">
            <h1 className="adm-section-title">Create New Customer Account</h1>
            <p className="adm-section-sub">
              Register client organizations, setup cloud ERP environments, and provision CtrlS Kolkata Tier-4 hypervisor nodes.
            </p>
          </div>
        </div>

        <div className="adm-create-header-action">
          <button
            type="button"
            className="adm-back-btn"
            onClick={() => navigate('/admin/customer')}
          >
            <ArrowLeft size={16} />
            <span>Back to Customers</span>
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="adm-table-card adm-form-card">
        <form onSubmit={handleSubmit}>
          {/* Section 1: Client & Contact Details */}
          <div className="adm-form-section">
            <div className="adm-form-section-title">
              <Building2 size={18} className="adm-form-section-icon purple" />
              <span>Organization &amp; Primary Representative</span>
            </div>

            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label className="adm-form-label">Company / Firm Legal Name *</label>
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
                <label className="adm-form-label">Customer Contact Representative *</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter your name"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Corporate Email Address *</label>
                <input
                  type="email"
                  className="adm-form-input"
                  placeholder="Enter your email address"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Mobile / WhatsApp Number *</label>
                <input
                  type="tel"
                  className="adm-form-input"
                  placeholder="Enter your mobile number"
                  value={formState.phone}
                  onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">City &amp; Commercial Hub</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter your city / region"
                  value={formState.city}
                  onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Account Lifecycle Status *</label>
                <select
                  className="adm-form-input"
                  value={formState.status}
                  onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                >
                  <option value="active">Active (Production Client)</option>
                  <option value="demo">Demo (14-Day Sandbox Trial)</option>
                  <option value="inactive">Inactive / Paused</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Cloud Infrastructure & Plan */}
          <div className="adm-form-section">
            <div className="adm-form-section-title">
              <Server size={18} className="adm-form-section-icon blue" />
              <span>Subscription Tier &amp; Datacenter Allocation</span>
            </div>

            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label className="adm-form-label">Cloud ERP Subscription Tier</label>
                <select
                  className="adm-form-input"
                  value={formState.plan}
                  onChange={(e) => setFormState({ ...formState, plan: e.target.value })}
                >
                  <option>Tally Prime Cloud + VPS Gold</option>
                  <option>Enterprise VPS Dedicated Node</option>
                  <option>Tally Multi-User Cloud + TSS</option>
                  <option>Tally Prime Single User Silver</option>
                  <option>High-Mem Cloud VPS Node</option>
                  <option>14-Day Cloud VPS Sandbox Trial</option>
                  <option>Tally Prime Cloud Trial Demo</option>
                </select>
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">CtrlS Kolkata Datacenter Cluster</label>
                <select
                  className="adm-form-input"
                  value={formState.serverNode}
                  onChange={(e) => setFormState({ ...formState, serverNode: e.target.value })}
                >
                  <option>CtrlS-KOL-NODE-01 (Primary Production)</option>
                  <option>CtrlS-KOL-NODE-02 (Enterprise Hypervisor)</option>
                  <option>CtrlS-KOL-NODE-03 (Sandbox &amp; Backup Vault)</option>
                </select>
              </div>

              {formState.status === 'active' && (
                <div className="adm-form-field">
                  <label className="adm-form-label">Monthly MRR Value (₹)</label>
                  <input
                    type="text"
                    className="adm-form-input"
                    placeholder="Enter monthly MRR amount"
                    value={formState.mrr}
                    onChange={(e) => setFormState({ ...formState, mrr: e.target.value })}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="adm-form-footer">
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={() => navigate('/admin/customer')}
            >
              Cancel
            </button>
            <button type="submit" className="adm-btn-primary">
              <UserCheck size={16} />
              <span>Save &amp; Provision Customer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
