import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Save, User, Building2, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { customerApi } from '../../../services/customerApi';

const STATUS_OPTIONS = ['active', 'demo', 'inactive', 'suspended'];
const RELATIONSHIP_OPTIONS = ['Customer', 'Partner', 'Prospect', 'Competitor', 'Integrator', 'Other'];
const INDUSTRY_OPTIONS = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Government',
  'Energy',
  'Transportation',
  'Other'
];

export default function EditCustomerModal({ customer, isOpen, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    alternatePhone: '',
    website: '',
    industry: 'Technology',
    accountRelationship: 'Customer',
    plan: 'Tally Prime Cloud + VPS Gold',
    serverNode: 'CtrlS-KOL-NODE-01',
    status: 'active',
    mrr: '₹15,000',
    street: '',
    area: '',
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    postalCode: '',
    gstNo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customer) {
      const addr = customer.address || {};
      setFormData({
        name: customer.name || '',
        company: customer.company || customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        alternatePhone: customer.alternatePhone || '',
        website: customer.website || '',
        industry: customer.industry || 'Technology',
        accountRelationship: customer.accountRelationship || 'Customer',
        plan: customer.plan || 'Tally Prime Cloud + VPS Gold',
        serverNode: customer.serverNode || 'CtrlS-KOL-NODE-01',
        status: customer.status || 'active',
        mrr: customer.mrr || '₹15,000',
        street: addr.street || '',
        area: addr.area || '',
        city: addr.city || customer.city?.split(',')?.[0] || 'Kolkata',
        state: addr.state || 'West Bengal',
        country: addr.country || 'India',
        postalCode: addr.postalCode || '',
        gstNo: customer.gstNo || ''
      });
    }
  }, [customer]);

    useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isSubmitting) onClose?.();
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen || !customer) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.company.trim()) {
      toast.error('Please enter contact name and company name.');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter email address.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Saving updates & syncing to Sangam CRM...');

    const payload = {
      name: formData.name.trim(),
      company: formData.company.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      alternatePhone: formData.alternatePhone.trim(),
      website: formData.website.trim(),
      industry: formData.industry,
      accountRelationship: formData.accountRelationship,
      plan: formData.plan,
      serverNode: formData.serverNode,
      status: formData.status,
      mrr: formData.mrr,
      address: {
        street: formData.street,
        area: formData.area,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.postalCode,
        addressType: 'Office / Billing'
      },
      city: `${formData.city}, ${formData.state}`,
      gstNo: formData.gstNo.trim().toUpperCase()
    };

    try {
      const cId = customer.id || customer.customerId;
      const res = await customerApi.updateCustomer(cId, payload);
      const updated = res.customer || { ...customer, ...payload };

      onUpdated?.(updated);
      toast.success('Customer updated & synced with Sangam CRM Companies!', { id: toastId });
      onClose();
    } catch (err) {
      toast.error(`Update failed: ${err.message}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          maxWidth: '720px',
          width: '100%',
          borderRadius: '18px',
          background: '#ffffff',
          padding: '28px 32px',
          boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.25)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '16px',
            marginBottom: '20px'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Edit Customer Profile
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Customer ID: <strong style={{ fontFamily: 'monospace' }}>{customer.customerId || customer.id}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
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

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Name & Company */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="adm-form-label">Contact Person Name *</label>
                <input
                  type="text"
                  className="adm-form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="adm-form-label">Company Name *</label>
                <input
                  type="text"
                  className="adm-form-input"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="adm-form-label">Corporate Email *</label>
                <input
                  type="email"
                  className="adm-form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="adm-form-label">Primary Phone *</label>
                <input
                  type="tel"
                  className="adm-form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Alternate Phone & Website */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="adm-form-label">Alternate Phone</label>
                <input
                  type="tel"
                  className="adm-form-input"
                  value={formData.alternatePhone}
                  onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                />
              </div>

              <div>
                <label className="adm-form-label">Website</label>
                <input
                  type="url"
                  className="adm-form-input"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* Industry, Relationship, Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div>
                <label className="adm-form-label">Industry</label>
                <select
                  className="adm-form-input"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                >
                  {INDUSTRY_OPTIONS.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="adm-form-label">Account Relationship</label>
                <select
                  className="adm-form-input"
                  value={formData.accountRelationship}
                  onChange={(e) => setFormData({ ...formData, accountRelationship: e.target.value })}
                >
                  {RELATIONSHIP_OPTIONS.map((rel) => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="adm-form-label">Status</label>
                <select
                  className="adm-form-input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>{st.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="adm-form-label">Street / Location</label>
                <input
                  type="text"
                  className="adm-form-input"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                />
              </div>

              <div>
                <label className="adm-form-label">Area / Locality</label>
                <input
                  type="text"
                  className="adm-form-input"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px' }}>
              <div>
                <label className="adm-form-label">City</label>
                <input
                  type="text"
                  className="adm-form-input"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div>
                <label className="adm-form-label">State</label>
                <input
                  type="text"
                  className="adm-form-input"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>

              <div>
                <label className="adm-form-label">Country</label>
                <input
                  type="text"
                  className="adm-form-input"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>

              <div>
                <label className="adm-form-label">PIN / Postal Code</label>
                <input
                  type="text"
                  className="adm-form-input"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                />
              </div>
            </div>

            {/* Plan & MRR */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="adm-form-label">Cloud Plan</label>
                <input
                  type="text"
                  className="adm-form-input"
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                />
              </div>

              <div>
                <label className="adm-form-label">MRR</label>
                <input
                  type="text"
                  className="adm-form-input"
                  value={formData.mrr}
                  onChange={(e) => setFormData({ ...formData, mrr: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="adm-btn-primary"
              disabled={isSubmitting}
              style={{ padding: '8px 20px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={15} />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}