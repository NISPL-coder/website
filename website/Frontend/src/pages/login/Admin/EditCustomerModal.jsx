import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Save,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Plus,
  Trash2,
  FileText,
  ShieldCheck,
  Server
} from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationApi } from '../../../services/notificationApi';
import { customerApi } from '../../../services/customerApi';
import { customerLifecycleLabel } from '../../../utils/customerLifecycle';
import './EditCustomerModal.css';

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
    designation: '',
    tallySerialNo: '',
    alternatePhone: '',
    website: '',
    industry: 'Technology',
    accountRelationship: 'Customer',
    plan: '',
    users: 0,
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
        designation: customer.designation || '',
        tallySerialNo: customer.tallySerialNo || '',
        alternatePhone: customer.alternatePhone || '',
        website: customer.website || '',
        industry: customer.industry || 'Technology',
        accountRelationship: customer.accountRelationship || 'Customer',
        plan: customer.plan || '',
        users:
          customer.users != null
            ? Number(customer.users)
            : customer.plan
            ? Number(customer.plan.match(/(\d+)\s*(?:user|users|usr)/i)?.[1] || 0)
            : 0,
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
      designation: formData.designation.trim(),
      tallySerialNo: formData.tallySerialNo.trim(),
      additionalEmails: additionalEmails.map((e) => e.trim()).filter(Boolean),
      phone: cleanPhone,
      additionalPhones: additionalPhones.map((p) => p.trim().replace(/\D/g, '')).filter(Boolean),
      alternatePhone: formData.alternatePhone.trim(),
      website: formData.website.trim(),
      industry: formData.industry,
      accountRelationship: formData.accountRelationship,
      plan: formData.plan,
      users: Number(formData.users) || 0,
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
    <div className="adm-modal-backdrop-portal" onClick={onClose}>
      <div
        className="edit-cust-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-cust-title"
      >
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}
        >
          {/* ── Fixed Header ── */}
          <div className="edit-cust-header">
            <div className="edit-cust-header-left">
              <div className="edit-cust-icon-wrap">
                <User size={22} />
              </div>
              <div>
                <h2 id="edit-cust-title" className="edit-cust-title">
                  Edit Customer Profile
                </h2>
                <div className="edit-cust-meta">
                  <span className="edit-cust-chip">
                    Customer ID: {customer.customerId || customer.id}
                  </span>
                  <span className="edit-cust-status-badge">
                    Status: {customerLifecycleLabel(formData.status)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="edit-cust-close-btn"
              onClick={onClose}
              disabled={isSubmitting}
              title="Close modal"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Scrollable Body ── */}
          <div className="edit-cust-body">
            {/* CARD 1: Contact Overview */}
            <div className="edit-cust-card">
              <div className="edit-cust-card-header">
                <span className="edit-cust-card-title">
                  <User size={15} color="#4f46e5" />
                  <span>Contact Overview</span>
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="edit-cust-grid-2">
                  <div className="edit-cust-field">
                    <label className="edit-cust-label">
                      <span>Contact Person Name</span>
                      <span className="edit-cust-required">*</span>
                    </label>
                    <input
                      type="text"
                      className="edit-cust-input"
                      placeholder="e.g. Rahul Sarkar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="edit-cust-field">
                    <label className="edit-cust-label">
                      <span>Company Name</span>
                      <span className="edit-cust-required">*</span>
                    </label>
                    <input
                      type="text"
                      className="edit-cust-input"
                      placeholder="e.g. ABC Pvt Ltd"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="edit-cust-grid-2">
                  <div className="edit-cust-field">
                    <label className="edit-cust-label">
                      <span>Corporate Email (Primary Login)</span>
                      <span className="edit-cust-required">*</span>
                    </label>
                    <input
                      type="email"
                      className="edit-cust-input"
                      placeholder="user@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="edit-cust-field">
                    <label className="edit-cust-label">
                      <span>Primary Phone (10 digits)</span>
                      <span className="edit-cust-required">*</span>
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      className="edit-cust-input"
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="edit-cust-grid-2">
                  <div className="edit-cust-field">
                    <label className="edit-cust-label">Designation / Role</label>
                    <input
                      type="text"
                      className="edit-cust-input"
                      placeholder="e.g. Finance Manager / Director"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    />
                  </div>

                  <div className="edit-cust-field">
                    <label className="edit-cust-label">GSTIN (Tax ID)</label>
                    <input
                      type="text"
                      className="edit-cust-input"
                      placeholder="15-character GSTIN"
                      value={formData.gstNo}
                      onChange={(e) => setFormData({ ...formData, gstNo: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>

                <div className="edit-cust-grid-2">
                  <div className="edit-cust-field">
                    <label className="edit-cust-label">Tally Serial Number</label>
                    <input
                      type="text"
                      className="edit-cust-input"
                      placeholder="e.g. 753421890"
                      value={formData.tallySerialNo}
                      onChange={(e) => setFormData({ ...formData, tallySerialNo: e.target.value })}
                    />
                  </div>

                  <div className="edit-cust-field">
                    <label className="edit-cust-label">Website</label>
                    <input
                      type="url"
                      className="edit-cust-input"
                      placeholder="https://example.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: Additional Communication Channels (Side by Side) */}
            <div className="edit-cust-card">
              <div className="edit-cust-card-header">
                <span className="edit-cust-card-title">
                  <Mail size={15} color="#4f46e5" />
                  <span>Secondary Communication Channels</span>
                </span>
              </div>

              <div className="edit-cust-grid-2">
                {/* Column 1: Secondary Emails */}
                <div className="edit-cust-channel-subcard">
                  <div className="edit-cust-channel-header">
                    <span className="edit-cust-channel-title">
                      <Mail size={13} color="#6366f1" />
                      <span>Secondary Emails ({additionalEmails.length})</span>
                    </span>
                    <button
                      type="button"
                      className="edit-cust-add-btn"
                      onClick={() => setAdditionalEmails((prev) => [...prev, ''])}
                    >
                      <Plus size={11} />
                      <span>Add Email</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {additionalEmails.map((extraEm, idx) => (
                      <div key={idx} className="edit-cust-item-row">
                        <input
                          type="email"
                          className="edit-cust-item-input"
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
                        />
                        <button
                          type="button"
                          className="edit-cust-del-btn"
                          onClick={() => setAdditionalEmails((prev) => prev.filter((_, i) => i !== idx))}
                          title="Remove email"
                          aria-label="Remove email"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    {additionalEmails.length === 0 && (
                      <span className="edit-cust-empty-hint">
                        No secondary emails added. Click "+ Add Email" to add one.
                      </span>
                    )}
                  </div>
                </div>

                {/* Column 2: Secondary Phones & Alternate */}
                <div className="edit-cust-channel-subcard">
                  <div className="edit-cust-channel-header">
                    <span className="edit-cust-channel-title">
                      <Phone size={13} color="#6366f1" />
                      <span>Secondary Phones ({additionalPhones.length})</span>
                    </span>
                    <button
                      type="button"
                      className="edit-cust-add-btn"
                      onClick={() => setAdditionalPhones((prev) => [...prev, ''])}
                    >
                      <Plus size={11} />
                      <span>Add Phone</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {additionalPhones.map((extraPh, idx) => (
                      <div key={idx} className="edit-cust-item-row">
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          className="edit-cust-item-input"
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
                        />
                        <button
                          type="button"
                          className="edit-cust-del-btn"
                          onClick={() => setAdditionalPhones((prev) => prev.filter((_, i) => i !== idx))}
                          title="Remove phone"
                          aria-label="Remove phone"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    {additionalPhones.length === 0 && (
                      <span className="edit-cust-empty-hint">
                        No secondary phones added. Click "+ Add Phone" to add one.
                      </span>
                    )}

                    <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '8px', marginTop: '4px' }}>
                      <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Alternate / Landline Phone
                      </label>
                      <input
                        type="tel"
                        className="edit-cust-item-input"
                        style={{ width: '100%' }}
                        placeholder="e.g. 033-24567890"
                        value={formData.alternatePhone}
                        onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: Physical Address Information */}
            <div className="edit-cust-card">
              <div className="edit-cust-card-header">
                <span className="edit-cust-card-title">
                  <MapPin size={15} color="#4f46e5" />
                  <span>Address Information</span>
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="edit-cust-grid-2">
                  <div className="edit-cust-field">
                    <label className="edit-cust-label">Street / Location</label>
                    <input
                      type="text"
                      className="edit-cust-input"
                      placeholder="e.g. Sector 5, Salt Lake"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    />
                  </div>

                  <div className="edit-cust-field">
                    <label className="edit-cust-label">Area / Locality</label>
                    <input
                      type="text"
                      className="edit-cust-input"
                      placeholder="e.g. Bidhannagar"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    />
                  </div>
                </div>

                <div className="edit-cust-grid-4">
                  <div className="edit-cust-field">
                    <label className="edit-cust-label">City</label>
                    <input
                      type="text"
                      className="edit-cust-input"
                      placeholder="e.g. Kolkata"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div className="edit-cust-field">
                    <label className="edit-cust-label">State</label>
                    <input
                      type="text"
                      className="edit-cust-input"
                      placeholder="e.g. West Bengal"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>

                  <div className="edit-cust-field">
                    <label className="edit-cust-label">Country</label>
                    <input
                      type="text"
                      className="edit-cust-input"
                      placeholder="e.g. India"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>

                  <div className="edit-cust-field">
                    <label className="edit-cust-label">PIN / Postal Code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      className="edit-cust-input"
                      placeholder="6-digit PIN"
                      value={formData.postalCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          postalCode: e.target.value.replace(/\D/g, '').slice(0, 6)
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: Account, CRM & Subscription Details */}
            <div className="edit-cust-card">
              <div className="edit-cust-card-header">
                <span className="edit-cust-card-title">
                  <Building2 size={15} color="#4f46e5" />
                  <span>Account & Subscription Details</span>
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="edit-cust-grid-3">
                  <div className="edit-cust-field">
                    <label className="edit-cust-label">Industry</label>
                    <select
                      className="edit-cust-select"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    >
                      {INDUSTRY_OPTIONS.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="edit-cust-field">
                    <label className="edit-cust-label">Account Relationship</label>
                    <select
                      className="edit-cust-select"
                      value={formData.accountRelationship}
                      onChange={(e) => setFormData({ ...formData, accountRelationship: e.target.value })}
                    >
                      {RELATIONSHIP_OPTIONS.map((rel) => (
                        <option key={rel} value={rel}>
                          {rel}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="edit-cust-field">
                    <label className="edit-cust-label">Lifecycle Status</label>
                    <input
                      type="text"
                      className="edit-cust-input"
                      value={customerLifecycleLabel(formData.status)}
                      readOnly
                      title="Derived automatically from demo, purchase, payment and activation records"
                    />
                  </div>
                </div>

                <div className="edit-cust-grid-3">
                  <div className="edit-cust-field">
                    <label className="edit-cust-label">Cloud Plan</label>
                    <input
                      type="text"
                      className="edit-cust-input"
                      placeholder="e.g. Enterprise Cloud Server — 3 User"
                      value={formData.plan}
                      onChange={(e) => {
                        const newPlan = e.target.value;
                        const match = newPlan.match(/(\d+)\s*(?:user|users|usr)/i);
                        const autoUsers = match ? Number(match[1]) : formData.users;
                        setFormData({ ...formData, plan: newPlan, users: autoUsers });
                      }}
                    />
                  </div>

                  <div className="edit-cust-field">
                    <label className="edit-cust-label">Users Taken (Capacity)</label>
                    <input
                      type="number"
                      min="0"
                      className="edit-cust-input"
                      placeholder="e.g. 3"
                      value={formData.users || ''}
                      onChange={(e) => setFormData({ ...formData, users: Number(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="edit-cust-field">
                    <label className="edit-cust-label">MRR (Monthly Recurring)</label>
                    <input
                      type="text"
                      className="edit-cust-input"
                      placeholder="e.g. ₹5,000"
                      value={formData.mrr}
                      onChange={(e) => setFormData({ ...formData, mrr: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Fixed Footer ── */}
          <div className="edit-cust-footer">
            <div className="edit-cust-sync-badge">
              <span className="edit-cust-sync-dot" />
              <span>Sangam CRM Auto-Sync Active</span>
            </div>

            <div className="edit-cust-actions">
              <button
                type="button"
                className="edit-cust-btn-cancel"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="edit-cust-btn-save"
                disabled={isSubmitting}
              >
                <Save size={15} />
                <span>{isSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
