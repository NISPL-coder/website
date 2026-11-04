import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Save, Server, Users, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { productApi } from '../../../services/productApi';
import { GST_RATE_DEFAULT, formatINR } from '../../Dashboard/utils/pricingUtils';

const SERVER_TYPES = [
  {
    value: 'shared',
    label: 'Shared Server',
    hint: 'Cost-effective, suitable for most businesses'
  },
  {
    value: 'dedicated',
    label: 'Dedicated Server',
    hint: 'Exclusive resources, higher performance'
  }
];

const EMPTY_FORM = {
  name: '',
  users: '1',
  pricePerUser: '',
  serverType: 'shared'
};

const initialForm = (plan) =>
  plan
    ? {
        name: plan.name || '',
        users: String(plan.users || 1),
        pricePerUser: plan.pricePerUser != null ? String(plan.pricePerUser) : '',
        serverType: plan.serverType === 'dedicated' ? 'dedicated' : 'shared'
      }
    : EMPTY_FORM;

export default function CustomPricingModal({ onClose, plan = null, onSaved }) {
  const [form, setForm] = useState(() => initialForm(plan));
  const [isSaving, setIsSaving] = useState(false);

  const isEdit = Boolean(plan);

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

  const breakdown = useMemo(() => {
    const users = Math.floor(Number(form.users) || 0);
    const pricePerUser = Number(form.pricePerUser) || 0;
    const monthlyBase = Math.round(users * pricePerUser);
    const gstAmount = Math.round(monthlyBase * GST_RATE_DEFAULT);
    const grandTotalPerMonth = monthlyBase + gstAmount;

    return {
      users,
      pricePerUser,
      monthlyBase,
      gstAmount,
      grandTotalPerMonth,
      sixMonths: grandTotalPerMonth * 6,
      oneYear: grandTotalPerMonth * 12,
      twoYears: grandTotalPerMonth * 24
    };
  }, [form.users, form.pricePerUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Please enter a plan name.');
      return;
    }
    if (breakdown.users < 1) {
      toast.error('Number of users must be at least 1.');
      return;
    }
    if (breakdown.pricePerUser <= 0) {
      toast.error('Price per user per month must be above ₹0.');
      return;
    }

    setIsSaving(true);

    const payload = {
      name: form.name.trim(),
      users: breakdown.users,
      pricePerUser: breakdown.pricePerUser,
      serverType: form.serverType,
      isCustomPlan: true,
      provider: 'ctrls-cloud',
      category: 'Infrastructure',
      ipAddress: plan?.ipAddress || '',
      serverConfiguration: '',
      description: `Custom pricing plan — ${breakdown.users} user${
        breakdown.users > 1 ? 's' : ''
      } at ${formatINR(breakdown.pricePerUser)} per user per month (${
        form.serverType === 'dedicated' ? 'Dedicated' : 'Shared'
      } Server).`,
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
      toast.success(isEdit ? 'Custom plan updated.' : 'Custom plan added to catalog.', {
        id: toastId
      });
      onClose?.();
    } catch (err) {
      console.error('Failed to save custom plan:', err);
      toast.error(err.message || 'Failed to save custom plan.', { id: toastId });
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
          maxWidth: '620px',
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
                background: '#eef2ff',
                color: '#4f46e5',
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
                {isEdit ? 'Edit Custom Plan' : 'Add Custom Plan'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
                Price any user count per month — GST and term totals update live.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close custom pricing"
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
            {/* Plan Name */}
            <div>
              <label className="adm-form-label">
                Plan Name <span className="adm-required-star">*</span>
              </label>
              <input
                type="text"
                className="adm-form-input"
                placeholder="e.g. Enterprise 10 Users"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Users & Price Per User */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '14px'
              }}
            >
              <div>
                <label className="adm-form-label">
                  Number of Users <span className="adm-required-star">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Users
                    size={15}
                    style={{
                      position: 'absolute',
                      left: '11px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8'
                    }}
                  />
                  <input
                    type="number"
                    min="1"
                    max="500"
                    className="adm-form-input"
                    placeholder="e.g. 7"
                    value={form.users}
                    onChange={(e) => setForm({ ...form, users: e.target.value })}
                    style={{ paddingLeft: '34px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="adm-form-label">
                  Price per User/Month (₹) <span className="adm-required-star">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  className="adm-form-input"
                  placeholder="e.g. 350"
                  value={form.pricePerUser}
                  onChange={(e) => setForm({ ...form, pricePerUser: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Server Type */}
            <div>
              <label className="adm-form-label">
                Server Type <span className="adm-required-star">*</span>
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '12px',
                  marginTop: '6px'
                }}
              >
                {SERVER_TYPES.map((type) => {
                  const isSelected = form.serverType === type.value;
                  return (
                    <label
                      key={type.value}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: isSelected ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                        background: isSelected ? '#eef2ff' : '#ffffff',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input
                        type="radio"
                        name="custom-plan-server-type"
                        value={type.value}
                        checked={isSelected}
                        onChange={() => setForm({ ...form, serverType: type.value })}
                        style={{ marginTop: '3px', accentColor: '#4f46e5' }}
                      />
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: 700,
                            fontSize: '0.86rem',
                            color: isSelected ? '#4338ca' : '#0f172a'
                          }}
                        >
                          <Server size={14} />
                          <span>{type.label}</span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px', lineHeight: 1.4 }}>
                          {type.hint}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Live pricing breakdown */}
            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#f8fafc'
              }}
            >
              {[
                { label: 'Users', value: String(breakdown.users || 0) },
                { label: 'Price/User/Month', value: formatINR(breakdown.pricePerUser, true) },
                { label: 'Monthly Base', value: formatINR(breakdown.monthlyBase, true) },
                { label: 'GST (18%)', value: formatINR(breakdown.gstAmount, true) },
                {
                  label: 'Grand Total/Month',
                  value: formatINR(breakdown.grandTotalPerMonth, true),
                  highlight: true
                },
                { label: '6 Months Payable', value: formatINR(breakdown.sixMonths, true) },
                { label: '1 Year Payable', value: formatINR(breakdown.oneYear, true) },
                { label: '2 Years Payable', value: formatINR(breakdown.twoYears, true) }
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: row.highlight ? '10px 16px' : '8px 16px',
                    background: row.highlight ? '#e0e7ff' : 'transparent',
                    borderBottom: row.highlight ? '1px solid #c7d2fe' : '1px solid #eef2f6'
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: row.highlight ? 700 : 500,
                      color: row.highlight ? '#3730a3' : '#475569'
                    }}
                  >
                    {row.label}
                  </span>
                  <span
                    style={{
                      fontSize: row.highlight ? '0.92rem' : '0.85rem',
                      fontWeight: row.highlight ? 800 : 600,
                      color: row.highlight ? '#1e1b4b' : '#0f172a',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
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
              <span>
                {isSaving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Plan'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
