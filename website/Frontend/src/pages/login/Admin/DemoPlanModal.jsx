import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Save, Clock, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { productApi } from '../../../services/productApi';
import { formatINR } from '../../Dashboard/utils/pricingUtils';

const DURATION_OPTIONS = ['7 Days', '15 Days', '1 Month', '3 Months', '6 Months', '1 Year'];

const initialForm = (plan) => ({
  name: plan?.name || '',
  duration: plan?.duration || DURATION_OPTIONS[0],
  priceAmount: plan?.monthlyPrice != null ? String(plan.monthlyPrice) : '0'
});

export default function DemoPlanModal({ onClose, plan = null, onSaved }) {
  const [form, setForm] = useState(() => initialForm(plan));
  const [isSaving, setIsSaving] = useState(false);

  const isEdit = Boolean(plan);
  const amount = Number(form.priceAmount) || 0;

  // A plan saved with an older duration label stays selectable when edited.
  const durationChoices =
    form.duration && !DURATION_OPTIONS.includes(form.duration)
      ? [form.duration, ...DURATION_OPTIONS]
      : DURATION_OPTIONS;

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isSaving) onClose?.();
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, isSaving]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Please enter a plan name.');
      return;
    }
    if (amount < 0) {
      toast.error('The demo price cannot be negative.');
      return;
    }

    setIsSaving(true);

    const payload = {
      name: form.name.trim(),
      duration: form.duration,
      priceAmount: amount,
      isDemoPlan: true,
      provider: 'demo',
      category: 'Trial',
      ipAddress: plan?.ipAddress || '',
      serverConfiguration: '',
      description: `${form.name.trim()} trial for ${form.duration}${
        amount > 0 ? ` at ${formatINR(amount)}` : ' — free of charge'
      }.`,
      available: plan ? plan.available !== false && plan.status !== 'inactive' : true,
      specs: [],
      features: []
    };

    const toastId = toast.loading(
      isEdit ? `Updating "${payload.name}"...` : `Creating "${payload.name}"...`
    );

    try {
      const saved = isEdit
        ? await productApi.updateProduct(plan.id || plan._id, payload)
        : await productApi.createProduct(payload);

      onSaved?.(saved || payload);
      toast.success(isEdit ? 'Demo plan updated.' : 'Demo plan added.', { id: toastId });
      onClose?.();
    } catch (err) {
      console.error('Failed to save demo plan:', err);
      toast.error(err.message || 'Failed to save demo plan.', { id: toastId });
    } finally {
      setIsSaving(false);
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
          maxWidth: '520px',
          width: '100%',
          borderRadius: '18px',
          background: '#ffffff',
          padding: '28px 32px',
          boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.25)'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '16px',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Wallet size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {isEdit ? 'Edit Demo Plan' : 'Add Demo Plan'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
                A time-boxed trial offer for prospects.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close demo plan"
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
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="adm-form-label">
                Plan Name <span className="adm-required-star">*</span>
              </label>
              <input
                type="text"
                className="adm-form-input"
                placeholder="e.g. Demo - 1 Week"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px'
              }}
            >
              <div>
                <label className="adm-form-label">
                  Duration <span className="adm-required-star">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Clock
                    size={15}
                    style={{
                      position: 'absolute',
                      left: '11px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8'
                    }}
                  />
                  <select
                    className="adm-form-input"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    style={{ paddingLeft: '34px' }}
                    required
                  >
                    {durationChoices.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="adm-form-label">Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="adm-form-input"
                  placeholder="0"
                  value={form.priceAmount}
                  onChange={(e) => setForm({ ...form, priceAmount: e.target.value })}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '10px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0'
              }}
            >
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
                Published price
              </span>
              <span
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: amount === 0 ? '#047857' : '#4338ca',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
                }}
              >
                {amount === 0 ? 'FREE' : formatINR(amount, true)}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '22px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9'
            }}
          >
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={onClose}
              disabled={isSaving}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="adm-btn-primary"
              disabled={isSaving}
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              {isEdit ? <Save size={14} /> : <Plus size={15} />}
              <span>{isSaving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Plan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
