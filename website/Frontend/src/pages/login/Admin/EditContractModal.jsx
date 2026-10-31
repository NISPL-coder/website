import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Save, FileText, Layers, Calendar, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { contractApi } from '../../../services/contractApi';

const STATUS_OPTIONS = ['Active', 'NotStarted', 'Inactive'];
const PERIOD_OPTIONS = ['1 Month', '3 Months', '6 Months', '1 Year', '2 Years', '3 Years'];
const TYPE_OPTIONS = ['Subscription', 'AMC'];

export default function EditContractModal({ contract, isOpen, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    customer: '',
    email: '',
    contractType: 'Subscription',
    subscriptionPeriod: '1 Year',
    totalContractValue: '',
    startDate: '',
    endDate: '',
    status: 'Active',
    slaTier: 'Tier-1 Priority NOC 99.99%',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (contract) {
      setFormData({
        name: contract.name || '',
        company: contract.company || contract.customer || '',
        customer: contract.customer || contract.company || '',
        email: contract.email || 'contracts@nispl.in',
        contractType: contract.contractType || 'Subscription',
        subscriptionPeriod: contract.subscriptionPeriod || '1 Year',
        totalContractValue: contract.totalContractValue || contract.value || '',
        startDate: contract.startDate || '',
        endDate: contract.endDate || contract.expiryDate || '',
        status: contract.status || 'Active',
        slaTier: contract.slaTier || 'Tier-1 Priority NOC 99.99%',
        description: contract.description || ''
      });
    }
  }, [contract]);

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

  if (!isOpen || !contract) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter the contract name.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Saving updates & syncing to Sangam CRM...');

    try {
      const cId = contract.id || contract.contractId;
      const res = await contractApi.updateContract(cId, formData);
      const updated = res.contract || { ...contract, ...formData };

      onUpdated?.(updated);
      toast.success('Contract updated & synced with Sangam CRM!', { id: toastId });
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
          maxWidth: '680px',
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
              Edit Contract Agreement
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Ref ID: <strong style={{ fontFamily: 'monospace' }}>{contract.contractId || contract.id}</strong>
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
            {/* Contract Name */}
            <div>
              <label className="adm-form-label">Contract Name / Title *</label>
              <input
                type="text"
                className="adm-form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Account / Company & Contact Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="adm-form-label">Client / Account Name *</label>
                <input
                  type="text"
                  className="adm-form-input"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value, customer: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="adm-form-label">Contact Email</label>
                <input
                  type="email"
                  className="adm-form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Contract Type, Subscription Period, Total Value */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div>
                <label className="adm-form-label">Contract Type</label>
                <select
                  className="adm-form-input"
                  value={formData.contractType}
                  onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                >
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="adm-form-label">Subscription Period</label>
                <select
                  className="adm-form-input"
                  value={formData.subscriptionPeriod}
                  onChange={(e) => setFormData({ ...formData, subscriptionPeriod: e.target.value })}
                >
                  {PERIOD_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="adm-form-label">Total Contract Value *</label>
                <input
                  type="text"
                  className="adm-form-input"
                  value={formData.totalContractValue}
                  onChange={(e) => setFormData({ ...formData, totalContractValue: e.target.value })}
                  placeholder="e.g. ₹50,000"
                  required
                />
              </div>
            </div>

            {/* Start Date, End Date, Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div>
                <label className="adm-form-label">Start Date *</label>
                <input
                  type="date"
                  className="adm-form-input"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="adm-form-label">End Date *</label>
                <input
                  type="date"
                  className="adm-form-input"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="adm-form-label">Status</label>
                <select
                  className="adm-form-input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* SLA Tier */}
            <div>
              <label className="adm-form-label">SLA Tier</label>
              <input
                type="text"
                className="adm-form-input"
                value={formData.slaTier}
                onChange={(e) => setFormData({ ...formData, slaTier: e.target.value })}
              />
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