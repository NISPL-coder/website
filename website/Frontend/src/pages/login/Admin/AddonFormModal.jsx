import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, Sparkles, Tag, DollarSign, Layers, FileText, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { addonApi } from '../../../services/addonApi';

const BADGE_PRESETS = [
  { label: 'Popular', badge: 'POPULAR', color: '#059669', bg: '#ecfdf5' },
  { label: 'Essential', badge: 'ESSENTIAL', color: '#2563eb', bg: '#eff6ff' },
  { label: 'Compliance', badge: 'COMPLIANCE', color: '#7c3aed', bg: '#f5f3ff' },
  { label: 'Best Seller', badge: 'BEST SELLER', color: '#d97706', bg: '#fef3c7' },
  { label: 'Tax Updates', badge: 'TAX UPDATES', color: '#dc2626', bg: '#fef2f2' },
  { label: 'Utility', badge: 'UTILITY', color: '#0891b2', bg: '#ecfeff' }
];

const BILLING_CYCLES = ['Annual', 'Monthly', 'One-time', 'Quarterly'];

const CATEGORIES = [
  'Automation Add-on',
  'Security & Backup',
  'Government Compliance',
  'Cloud Hosting',
  'Software Maintenance',
  'Network Optimization',
  'General Add-on'
];

export default function AddonFormModal({ addon = null, onClose, onSaved }) {
  const isEdit = Boolean(addon);

  const [name, setName] = useState(addon?.name || '');
  const [category, setCategory] = useState(addon?.category || CATEGORIES[0]);
  const [amount, setAmount] = useState(addon?.amount != null ? String(addon.amount) : (addon?.basePrice != null ? String(addon.basePrice) : ''));
  const [billingCycle, setBillingCycle] = useState(addon?.billingCycle || 'Annual');
  const [spec, setSpec] = useState(addon?.spec || '');
  const [desc, setDesc] = useState(addon?.desc || '');
  const [badge, setBadge] = useState(addon?.badge || 'POPULAR');
  const [badgeColor, setBadgeColor] = useState(addon?.badgeColor || '#059669');
  const [badgeBg, setBadgeBg] = useState(addon?.badgeBg || '#ecfdf5');
  const [available, setAvailable] = useState(addon?.available !== false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSelectBadgePreset = (preset) => {
    setBadge(preset.badge);
    setBadgeColor(preset.color);
    setBadgeBg(preset.bg);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Add-on name is required.');
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      toast.error('Please enter a valid non-negative amount.');
      return;
    }

    const payload = {
      name: name.trim(),
      category: category.trim(),
      amount: numAmount,
      basePrice: numAmount,
      billingCycle,
      spec: spec.trim(),
      desc: desc.trim(),
      badge: badge.trim(),
      badgeColor,
      badgeBg,
      available
    };

    setIsSubmitting(true);
    const toastId = toast.loading(isEdit ? 'Updating add-on product…' : 'Creating add-on product…');

    try {
      if (isEdit) {
        const id = addon.id || addon._id;
        const res = await addonApi.updateAddon(id, payload);
        toast.success(res.message || 'Add-on updated successfully!', { id: toastId });
        if (onSaved) onSaved(res.addon);
      } else {
        const res = await addonApi.createAddon(payload);
        toast.success(res.message || 'Add-on created successfully!', { id: toastId });
        if (onSaved) onSaved(res.addon);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save add-on:', err);
      toast.error(err.message || 'Failed to save add-on product.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const gstAmount = Math.round((Number(amount) || 0) * 0.18);
  const totalWithTax = (Number(amount) || 0) + gstAmount;

  return createPortal(
    <div className="adm-modal-backdrop-portal" onClick={onClose}>
      <div
        className="adm-modal-container animate-fade-in"
        style={{
          maxWidth: '620px',
          width: '92%',
          background: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="adm-modal-header"
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#ede9fe',
                color: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h2
                className="adm-modal-title"
                style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}
              >
                {isEdit ? 'Edit Checkout Add-On Product' : 'Create New Checkout Add-On Product'}
              </h2>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Configure pricing, specifications, and display badge for customer checkout.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="adm-modal-close"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: '#f1f5f9',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              padding: '24px',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              maxHeight: 'calc(85vh - 150px)',
              overflowY: 'auto'
            }}
          >
            {/* Row 1: Name */}
            <div>
              <label
                style={{
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: '#1e293b',
                  display: 'block',
                  marginBottom: '6px'
                }}
              >
                Add-on Product Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                className="adm-form-input"
                placeholder="e.g. Dedicated Static IP Allocation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  height: '42px',
                  padding: '0 12px',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* Row 2: Category & Billing Cycle */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '14px'
              }}
            >
              <div>
                <label
                  style={{
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    color: '#1e293b',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  Category
                </label>
                <select
                  className="adm-form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    height: '42px',
                    padding: '0 12px',
                    fontSize: '0.9rem'
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    color: '#1e293b',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  Billing Cycle
                </label>
                <select
                  className="adm-form-input"
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    height: '42px',
                    padding: '0 12px',
                    fontSize: '0.9rem'
                  }}
                >
                  {BILLING_CYCLES.map((cycle) => (
                    <option key={cycle} value={cycle}>{cycle}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Amount & Live Price Preview */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '14px'
              }}
            >
              <div>
                <label
                  style={{
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    color: '#1e293b',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  Base Amount (₹) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontWeight: 700,
                      color: '#64748b'
                    }}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="adm-form-input"
                    placeholder="e.g. 1500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      paddingLeft: '28px',
                      background: '#ffffff',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      height: '42px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <span
                  style={{
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    color: '#64748b',
                    fontWeight: 700,
                    letterSpacing: '0.04em'
                  }}
                >
                  Customer Price (incl. 18% GST)
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                  ₹{totalWithTax.toLocaleString('en-IN')}
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500, marginLeft: '6px' }}>
                    (₹{(Number(amount) || 0).toLocaleString('en-IN')} + ₹{gstAmount.toLocaleString('en-IN')} GST)
                  </span>
                </span>
              </div>
            </div>

            {/* Row 4: Specifications & Highlights */}
            <div>
              <label
                style={{
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: '#1e293b',
                  display: 'block',
                  marginBottom: '6px'
                }}
              >
                Technical Specification / Highlight
              </label>
              <input
                type="text"
                className="adm-form-input"
                placeholder="e.g. 1 Dedicated Static IPv4 / 100 GB NVMe / Meta Official API"
                value={spec}
                onChange={(e) => setSpec(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  height: '42px',
                  padding: '0 12px',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* Row 5: Description */}
            <div>
              <label
                style={{
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: '#1e293b',
                  display: 'block',
                  marginBottom: '6px'
                }}
              >
                Description / Benefit Note
              </label>
              <textarea
                className="adm-form-input"
                rows={2}
                placeholder="Explain the benefit of this add-on to the customer during checkout..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Row 6: Badge Settings & Presets */}
            <div>
              <label
                style={{
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: '#1e293b',
                  display: 'block',
                  marginBottom: '6px'
                }}
              >
                Checkout Badge &amp; Tag
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {BADGE_PRESETS.map((p) => (
                  <button
                    key={p.badge}
                    type="button"
                    onClick={() => handleSelectBadgePreset(p)}
                    style={{
                      border: badge === p.badge ? `2px solid ${p.color}` : '1px solid #cbd5e1',
                      borderRadius: '999px',
                      padding: '4px 12px',
                      background: p.bg,
                      color: p.color,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {p.badge}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Custom Badge (e.g. RECOMMENDED)"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    height: '40px',
                    padding: '0 12px',
                    fontSize: '0.86rem'
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    value={badgeColor}
                    onChange={(e) => setBadgeColor(e.target.value)}
                    style={{
                      width: '40px',
                      height: '38px',
                      padding: 0,
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: 'transparent'
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                    Badge Accent Color
                  </span>
                </div>
              </div>
            </div>

            {/* Row 7: Availability Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px'
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    display: 'block'
                  }}
                >
                  Active Availability
                </span>
                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  When enabled, this add-on product can be selected by customers in the checkout carousel.
                </span>
              </div>
              <label className="adm-switch">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                />
                <span className="adm-slider" />
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}
          >
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="adm-btn-primary"
              disabled={isSubmitting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {isSubmitting ? <Loader2 size={15} className="adm-spinner" /> : <Save size={15} />}
              <span>{isSubmitting ? 'Saving…' : isEdit ? 'Update Add-on' : 'Create Add-on'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

