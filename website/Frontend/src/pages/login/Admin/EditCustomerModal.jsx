import { notificationApi } from '../../../services/notificationApi';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Save, User, Building2, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { customerApi } from '../../../services/customerApi';
import { customerLifecycleLabel } from '../../../utils/customerLifecycle';

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
  const [additionalEmails, setAdditionalEmails] = useState([]);
  const [additionalPhones, setAdditionalPhones] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    alternatePhone: '',
    website: '',
    industry: 'Technology',
    accountRelationship: 'Customer',
    plan: '',
    serverNode: '',
    status: 'Inactive',
    mrr: '',
    street: '',
    area: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    gstNo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customer) {
      setAdditionalEmails(Array.isArray(customer.additionalEmails) ? customer.additionalEmails : []);
      setAdditionalPhones(Array.isArray(customer.additionalPhones) ? customer.additionalPhones : []);
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
        plan: customer.plan || '',
        serverNode: customer.serverNode || '',
        status: customer.status || 'Inactive',
        mrr: customer.mrr || '',
        street: addr.street || '',
        area: addr.area || '',
        city: addr.city || customer.city?.split(',')?.[0] || '',
        state: addr.state || '',
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

    const cleanPhone = formData.phone.trim().replace(/\D/g, '');
    if (cleanPhone && (cleanPhone.length < 7 || cleanPhone.length > 15)) {
      toast.error(`Phone number must be between 7 and 15 digits (currently ${cleanPhone.length} digits).`);
      return;
    }

    for (let i = 0; i < additionalPhones.length; i++) {
      const cleanExtraPhone = additionalPhones[i].trim().replace(/\D/g, '');
      if (cleanExtraPhone && (cleanExtraPhone.length < 7 || cleanExtraPhone.length > 15)) {
        toast.error(`Secondary phone #${i + 1} must be between 7 and 15 digits (currently ${cleanExtraPhone.length} digits).`);
        return;
      }
    }

    // A row saved before the field was capped can still hold a longer PIN.
    if (formData.postalCode.trim().length > 6) {
      toast.error('PIN code must be at most 6 digits.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Saving updates & syncing to Sangam CRM...');

    const payload = {
      name: formData.name.trim(),
      company: formData.company.trim(),
      email: formData.email.trim(),
      additionalEmails: additionalEmails.map((e) => e.trim()).filter(Boolean),
      phone: cleanPhone,
      additionalPhones: additionalPhones.map((p) => p.trim().replace(/\D/g, '')).filter(Boolean),
      alternatePhone: formData.alternatePhone.trim(),
      website: formData.website.trim(),
      industry: formData.industry,
      accountRelationship: formData.accountRelationship,
      plan: formData.plan,
      serverNode: formData.serverNode,
      mrr: formData.mrr,
      address: {
        street: formData.street,
        area: formData.area,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.postalCode
      },
      city: `${formData.city}, ${formData.state}`,
      gstNo: formData.gstNo.trim().toUpperCase()
    };

    try {
      const cId = customer.id || customer.customerId;
      const res = await customerApi.updateCustomer(cId, payload);
      const updated = res.customer || { ...customer, ...payload };

      onUpdated?.(updated);

      notificationApi.createNotification({
        type: 'customer_updated',
        title: 'Customer Profile Updated',
        message: `Customer "${payload.name || payload.company}" (${cId}) profile details were updated.`,
        severity: 'info',
        entityType: 'customer',
        entityId: cId,
        user: {
          name: payload.name,
          email: payload.email,
          company: payload.company
        },
        metadata: {
          plan: payload.plan,
          status: customer.status,
          serverNode: payload.serverNode
        }
      });
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label className="adm-form-label">Corporate Email (Primary Login) *</label>
                <input
                  type="email"
                  className="adm-form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="adm-form-label">Primary Phone (10 digits) *</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  className="adm-form-input"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  required
                />
              </div>
            </div>

            {/* Additional Secondary Emails */}
            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                  Secondary / Additional Emails ({additionalEmails.length})
                </span>
                <button
                  type="button"
                  style={{
                    background: '#ede9fe',
                    color: '#6d28d9',
                    border: '1px solid #ddd6fe',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  onClick={() => setAdditionalEmails((prev) => [...prev, ''])}
                >
                  + Add Email
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {additionalEmails.map((extraEm, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="email"
                      className="adm-form-input"
                      placeholder={`Secondary email ${idx + 1}`}
                      value={extraEm}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAdditionalEmails((prev) => {
                          const copy = [...prev];
                          copy[idx] = val;
                          return copy;
                        });
                      }}
                      style={{ flex: 1, padding: '5px 10px', fontSize: '0.82rem' }}
                    />
                    <button
                      type="button"
                      style={{
                        background: '#fee2e2',
                        color: '#ef4444',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        fontSize: '0.76rem',
                        fontWeight: 700
                      }}
                      onClick={() => setAdditionalEmails((prev) => prev.filter((_, i) => i !== idx))}
                      title="Remove email"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {additionalEmails.length === 0 && (
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    No secondary emails added. Click "+ Add Email" to add one.
                  </span>
                )}
              </div>
            </div>

            {/* Additional Secondary Phones */}
            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                  Secondary / Additional Phones ({additionalPhones.length})
                </span>
                <button
                  type="button"
                  style={{
                    background: '#ede9fe',
                    color: '#6d28d9',
                    border: '1px solid #ddd6fe',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  onClick={() => setAdditionalPhones((prev) => [...prev, ''])}
                >
                  + Add Phone
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {additionalPhones.map((extraPh, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      className="adm-form-input"
                      placeholder={`10-digit secondary phone ${idx + 1}`}
                      value={extraPh}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setAdditionalPhones((prev) => {
                          const copy = [...prev];
                          copy[idx] = val;
                          return copy;
                        });
                      }}
                      style={{ flex: 1, padding: '5px 10px', fontSize: '0.82rem' }}
                    />
                    <button
                      type="button"
                      style={{
                        background: '#fee2e2',
                        color: '#ef4444',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        fontSize: '0.76rem',
                        fontWeight: 700
                      }}
                      onClick={() => setAdditionalPhones((prev) => prev.filter((_, i) => i !== idx))}
                      title="Remove phone"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {additionalPhones.length === 0 && (
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    No secondary phones added. Click "+ Add Phone" to add one.
                  </span>
                )}
              </div>
            </div>

            {/* Alternate Phone & Website */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
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
                <label className="adm-form-label">Lifecycle Status</label>
                <input
                  type="text"
                  className="adm-form-input"
                  value={customerLifecycleLabel(formData.status)}
                  readOnly
                  title="Derived automatically from demo, purchase, payment and activation records"
                  style={{ background: '#f8fafc', color: '#475569', cursor: 'default' }}
                />
              </div>
            </div>

            {/* Address Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
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
                  inputMode="numeric"
                  maxLength={6}
                  className="adm-form-input"
                  placeholder="6-digit PIN code"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                />
              </div>
            </div>

            {/* Plan & MRR */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
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