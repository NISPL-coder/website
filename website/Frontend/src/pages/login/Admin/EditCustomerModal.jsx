import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Save,
  User,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationApi } from '../../../services/notificationApi';
import { customerApi } from '../../../services/customerApi';
import { customerLifecycleLabel } from '../../../utils/customerLifecycle';
import './EditCustomerModal.css';

export default function EditCustomerModal({ customer, isOpen, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    designation: '',
    gstNo: '',
    tallySerialNo: '',
    street: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: ''
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
        designation: customer.designation || '',
        gstNo: customer.gstNo || '',
        tallySerialNo: customer.tallySerialNo || '',
        street: addr.street || customer.street || '',
        city: addr.city || customer.city?.split(',')?.[0]?.trim() || '',
        state: addr.state || customer.city?.split(',')?.[1]?.trim() || '',
        country: addr.country || customer.country || 'India',
        postalCode: addr.postalCode || customer.postalCode || ''
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

    if (formData.postalCode.trim().length > 6) {
      toast.error('PIN code must be at most 6 digits.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Saving customer updates...');

    const payload = {
      name: formData.name.trim(),
      company: formData.company.trim(),
      email: formData.email.trim(),
      phone: cleanPhone,
      designation: formData.designation.trim(),
      gstNo: formData.gstNo.trim().toUpperCase(),
      tallySerialNo: formData.tallySerialNo.trim(),
      address: {
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim() || 'India',
        postalCode: formData.postalCode.trim()
      },
      city: [formData.city.trim(), formData.state.trim()].filter(Boolean).join(', '),
      // Preserve auxiliary customer records in the background so data is never lost:
      additionalEmails: customer.additionalEmails || [],
      additionalPhones: customer.additionalPhones || [],
      alternatePhone: customer.alternatePhone || '',
      website: customer.website || '',
      industry: customer.industry || 'Technology',
      accountRelationship: customer.accountRelationship || 'Customer',
      plan: customer.plan || '',
      users: customer.users || 0,
      serverNode: customer.serverNode || '',
      mrr: customer.mrr || ''
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
      toast.success('Customer profile updated successfully!', { id: toastId });
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
                    Status: {customerLifecycleLabel(customer.status)}
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
            {/* CARD 1: Contact & Business Overview */}
            <div className="edit-cust-card">
              <div className="edit-cust-card-header">
                <span className="edit-cust-card-title">
                  <User size={15} color="#1d4ed8" />
                  <span>Contact & Business Overview</span>
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

                <div className="edit-cust-grid-3">
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
                </div>
              </div>
            </div>

            {/* CARD 2: Location & Address */}
            <div className="edit-cust-card">
              <div className="edit-cust-card-header">
                <span className="edit-cust-card-title">
                  <MapPin size={15} color="#1d4ed8" />
                  <span>Address Information</span>
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
