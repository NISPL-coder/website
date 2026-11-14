import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Save,
  AlertTriangle,
  Building2,
  User,
  Mail,
  Phone,
  FileText,
  IndianRupee,
  Briefcase
} from 'lucide-react';

export default function MasterRecordEditModal({ isOpen, onClose, record, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (record) {
      setFormData({
        companyName: record.companyName || '',
        contactPerson: record.contactPerson || '',
        designation: record.designation || '',
        email: record.email || '',
        phone: record.phone || '',
        contractId: record.contractId || '',
        service: record.service || '',
        contractType: record.contractType || 'Comprehensive',
        duration: record.duration || '1 Year',
        totalContractValue: record.totalContractValue || '₹0',
        paymentStatus: record.paymentStatus || 'Yes',
        paymentMode: record.paymentMode || 'NEFT Wire',
        referenceNumber: record.referenceNumber || '',
        salesPerson: record.salesPerson || '',
        _focusField: record._focusField || ''
      });
    }
  }, [record]);

  // Lock body scroll and handle Escape key like all other admin modals
  useEffect(() => {
    if (!isOpen) return;
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

  if (!isOpen || !record) return null;

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const missingPill = (
    <span
      style={{
        fontSize: '0.70rem',
        color: '#b45309',
        background: '#fef3c7',
        border: '1px solid #fde68a',
        padding: '1px 6px',
        borderRadius: '4px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        fontWeight: 600
      }}
    >
      <AlertTriangle size={10} /> Missing
    </span>
  );

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
        {/* Modal Header */}
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={20} style={{ color: '#6366f1' }} />
              Edit Master Record #{record._origIdx != null ? record._origIdx + 1 : ''}
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Update missing or incomplete spreadsheet data before importing
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: '#f1f5f9',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e2e8f0';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Section 1: Customer & Contact */}
            <div>
              <div
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#6366f1',
                  background: '#eef2ff',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  marginBottom: '14px',
                  display: 'inline-block'
                }}
              >
                Customer &amp; Contact Details
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div>
                  <label className="adm-form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span>Company Name *</span>
                    {!formData.companyName && missingPill}
                  </label>
                  <input
                    type="text"
                    className="adm-form-input"
                    style={{ width: '100%' }}
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    placeholder="Enter company name..."
                    autoFocus={formData._focusField === 'companyName'}
                  />
                </div>

                <div>
                  <label className="adm-form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span>Contact Person</span>
                    {!formData.contactPerson && missingPill}
                  </label>
                  <input
                    type="text"
                    className="adm-form-input"
                    style={{ width: '100%' }}
                    value={formData.contactPerson}
                    onChange={(e) => handleChange('contactPerson', e.target.value)}
                    placeholder="Enter contact person name..."
                    autoFocus={formData._focusField === 'contactPerson'}
                  />
                </div>

                <div>
                  <label className="adm-form-label" style={{ marginBottom: '6px' }}>Designation</label>
                  <input
                    type="text"
                    className="adm-form-input"
                    style={{ width: '100%' }}
                    value={formData.designation}
                    onChange={(e) => handleChange('designation', e.target.value)}
                    placeholder="e.g. Director, Accountant, IT Head"
                  />
                </div>

                <div>
                  <label className="adm-form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span>Corporate Email</span>
                    {!formData.email && missingPill}
                  </label>
                  <input
                    type="email"
                    className="adm-form-input"
                    style={{ width: '100%' }}
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="client@company.com"
                    autoFocus={formData._focusField === 'email'}
                  />
                </div>

                <div>
                  <label className="adm-form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span>Phone Number</span>
                    {!formData.phone && missingPill}
                  </label>
                  <input
                    type="tel"
                    className="adm-form-input"
                    style={{ width: '100%' }}
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="10-digit mobile number..."
                    autoFocus={formData._focusField === 'phone'}
                  />
                </div>

                <div>
                  <label className="adm-form-label" style={{ marginBottom: '6px' }}>Sales Person</label>
                  <input
                    type="text"
                    className="adm-form-input"
                    style={{ width: '100%' }}
                    value={formData.salesPerson}
                    onChange={(e) => handleChange('salesPerson', e.target.value)}
                    placeholder="Assigned sales executive..."
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Contract & Payment Ledger */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <div
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#059669',
                  background: '#ecfdf5',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  marginBottom: '14px',
                  display: 'inline-block'
                }}
              >
                Contract &amp; Payment Ledger
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div>
                  <label className="adm-form-label" style={{ marginBottom: '6px' }}>Contract ID / Name</label>
                  <input
                    type="text"
                    className="adm-form-input"
                    style={{ width: '100%' }}
                    value={formData.contractId}
                    onChange={(e) => handleChange('contractId', e.target.value)}
                    placeholder="e.g. D8Y25260368"
                  />
                </div>

                <div>
                  <label className="adm-form-label" style={{ marginBottom: '6px' }}>Product / Plan</label>
                  <input
                    type="text"
                    className="adm-form-input"
                    style={{ width: '100%' }}
                    value={formData.service}
                    onChange={(e) => handleChange('service', e.target.value)}
                    placeholder="e.g. Tally Prime on Cloud"
                  />
                </div>

                <div>
                  <label className="adm-form-label" style={{ marginBottom: '6px' }}>Contract Type</label>
                  <select
                    className="adm-form-input"
                    style={{ width: '100%' }}
                    value={formData.contractType}
                    onChange={(e) => handleChange('contractType', e.target.value)}
                  >
                    <option value="Comprehensive">Comprehensive</option>
                    <option value="SHARED">SHARED</option>
                    <option value="DEDICATED">DEDICATED</option>
                    <option value="Non Comprehensive Rental">Non Comprehensive Rental</option>
                    <option value="Subscription">Subscription</option>
                    <option value="AMC">AMC</option>
                    <option value="Trial">Trial</option>
                  </select>
                </div>

                <div>
                  <label className="adm-form-label" style={{ marginBottom: '6px' }}>Duration</label>
                  <input
                    type="text"
                    className="adm-form-input"
                    style={{ width: '100%' }}
                    value={formData.duration}
                    onChange={(e) => handleChange('duration', e.target.value)}
                    placeholder="e.g. 1 Year, 3 Months"
                  />
                </div>

                <div>
                  <label className="adm-form-label" style={{ marginBottom: '6px' }}>Total Contract Value</label>
                  <input
                    type="text"
                    className="adm-form-input"
                    style={{ width: '100%' }}
                    value={formData.totalContractValue}
                    onChange={(e) => handleChange('totalContractValue', e.target.value)}
                    placeholder="₹0"
                  />
                </div>

                <div>
                  <label className="adm-form-label" style={{ marginBottom: '6px' }}>Payment Status</label>
                  <select
                    className="adm-form-input"
                    style={{
                      width: '100%',
                      fontWeight: 700,
                      color: formData.paymentStatus === 'Yes' ? '#047857' : '#b45309',
                      background: formData.paymentStatus === 'Yes' ? '#ecfdf5' : '#fffbeb'
                    }}
                    value={formData.paymentStatus}
                    onChange={(e) => handleChange('paymentStatus', e.target.value)}
                  >
                    <option value="Yes">Yes (Active Client + Receipt)</option>
                    <option value="No">No (Demo Trial)</option>
                  </select>
                </div>

                <div>
                  <label className="adm-form-label" style={{ marginBottom: '6px' }}>Payment Mode</label>
                  <input
                    type="text"
                    className="adm-form-input"
                    style={{ width: '100%' }}
                    value={formData.paymentMode}
                    onChange={(e) => handleChange('paymentMode', e.target.value)}
                    placeholder="e.g. NEFT Wire, Cheque, UPI"
                  />
                </div>

                <div>
                  <label className="adm-form-label" style={{ marginBottom: '6px' }}>Cheque / Ref No.</label>
                  <input
                    type="text"
                    className="adm-form-input"
                    style={{ width: '100%' }}
                    value={formData.referenceNumber}
                    onChange={(e) => handleChange('referenceNumber', e.target.value)}
                    placeholder="e.g. UTR-98234123"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '24px',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '16px'
            }}
          >
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={onClose}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="adm-btn-primary"
              style={{
                padding: '8px 20px',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Save size={15} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
