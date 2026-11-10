import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Save, Server, Users, Wallet, Clock, UserCheck, Lock, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { productApi } from '../../../services/productApi';
import { customerApi } from '../../../services/customerApi';
import { GST_RATE_DEFAULT, formatINR } from '../../Dashboard/utils/pricingUtils';

const SERVER_TYPES = [
  { value: 'shared', label: 'Shared Server', hint: 'Cost-effective, suitable for most businesses' },
  { value: 'dedicated', label: 'Dedicated Server', hint: 'Exclusive resources, higher performance' }
];

const DURATION_OPTIONS = ['7 Days', '15 Days', '1 Month', '3 Months', '6 Months', '1 Year'];

const PLAN_TYPES = [
  {
    value: 'custom',
    label: 'Custom Plan',
    hint: 'Per-user monthly rate for any user count'
  },
  {
    value: 'demo',
    label: 'Demo Plan',
    hint: 'Time-boxed trial, free or flat price'
  }
];

const EMPTY_FORM = {
  name: '',
  users: '1',
  pricePerUser: '',
  serverType: 'shared',
  duration: DURATION_OPTIONS[0],
  priceAmount: '0',
  isCustomerSpecific: false,
  targetCustomerEmail: '',
  targetCustomerId: '',
  targetCustomerName: ''
};

const initialForm = (plan, type) => {
  if (!plan) return { ...EMPTY_FORM };
  if (type === 'demo') {
    return {
      ...EMPTY_FORM,
      name: plan.name || '',
      duration: plan.duration || DURATION_OPTIONS[0],
      priceAmount: plan.monthlyPrice != null ? String(plan.monthlyPrice) : '0'
    };
  }
  return {
    ...EMPTY_FORM,
    name: plan.name || '',
    users: String(plan.users || 1),
    pricePerUser: plan.pricePerUser != null ? String(plan.pricePerUser) : '',
    serverType: plan.serverType === 'dedicated' ? 'dedicated' : 'shared',
    isCustomerSpecific: Boolean(plan.isCustomerSpecific || plan.targetCustomerEmail),
    targetCustomerEmail: plan.targetCustomerEmail || '',
    targetCustomerId: plan.targetCustomerId || '',
    targetCustomerName: plan.targetCustomerName || ''
  };
};

/** One dialog for both plan kinds; the type switch decides the fields and payload. */
export default function PlanFormModal({ plan = null, defaultType = 'custom', onClose, onSaved }) {
  const [type, setType] = useState(() => (plan?.isDemoPlan ? 'demo' : defaultType));
  const [form, setForm] = useState(() => initialForm(plan, plan?.isDemoPlan ? 'demo' : defaultType));
  const [isSaving, setIsSaving] = useState(false);
  const [customersList, setCustomersList] = useState([]);

  useEffect(() => {
    let isMounted = true;
    customerApi
      .getCustomers()
      .then((list) => {
        if (isMounted && Array.isArray(list)) {
          setCustomersList(list);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

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

  const buildPayload = () =>
    type === 'demo'
      ? {
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
        }
      : {
          name: form.name.trim(),
          users: breakdown.users,
          pricePerUser: breakdown.pricePerUser,
          serverType: form.serverType,
          isCustomPlan: true,
          isCustomerSpecific: Boolean(form.isCustomerSpecific && form.targetCustomerEmail),
          targetCustomerEmail: form.isCustomerSpecific ? (form.targetCustomerEmail || '').trim().toLowerCase() : '',
          targetCustomerId: form.isCustomerSpecific ? (form.targetCustomerId || '').trim() : '',
          targetCustomerName: form.isCustomerSpecific ? (form.targetCustomerName || '').trim() : '',
          provider: 'ctrls-cloud',
          category: 'Infrastructure',
          ipAddress: plan?.ipAddress || '',
          serverConfiguration: '',
          description: `Custom pricing plan — ${breakdown.users} user${
            breakdown.users > 1 ? 's' : ''
          } at ${formatINR(breakdown.pricePerUser)} per user per month (${
            form.serverType === 'dedicated' ? 'Dedicated' : 'Shared'
          } Server)${
            form.isCustomerSpecific && form.targetCustomerEmail
              ? ` [Private Custom Plan for ${form.targetCustomerName || form.targetCustomerEmail}]`
              : ''
          }.`,
          available: plan ? plan.available !== false && plan.status !== 'inactive' : true,
          specs: [],
          features: []
        };

  const validate = () => {
    if (!form.name.trim()) {
      toast.error('Please enter a plan name.');
      return false;
    }
    if (type === 'demo') {
      if (amount < 0) {
        toast.error('The demo price cannot be negative.');
        return false;
      }
      return true;
    }
    if (breakdown.users < 1) {
      toast.error('Number of users must be at least 1.');
      return false;
    }
    if (breakdown.pricePerUser <= 0) {
      toast.error('Price per user per month must be above ₹0.');
      return false;
    }
    if (form.isCustomerSpecific && !form.targetCustomerEmail) {
      toast.error('Please select a specific customer for this custom plan.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    const payload = buildPayload();
    const kindLabel = type === 'demo' ? 'Demo plan' : 'Custom plan';

    const toastId = toast.loading(
      isEdit ? `Updating "${payload.name}"...` : `Creating "${payload.name}"...`
    );

    try {
      const saved = isEdit
        ? await productApi.updateProduct(plan.id || plan._id, payload)
        : await productApi.createProduct(payload);

      onSaved?.(saved || payload);
      toast.success(isEdit ? `${kindLabel} updated.` : `${kindLabel} added to catalog.`, {
        id: toastId
      });
      onClose?.();
    } catch (err) {
      console.error('Failed to save plan:', err);
      toast.error(err.message || `Failed to save ${kindLabel.toLowerCase()}.`, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const title = isEdit
    ? type === 'demo'
      ? 'Edit Demo Plan'
      : 'Edit Custom Plan'
    : 'Add Plan';

  const modalContent = (
    <div
      className="adm-modal-backdrop-portal"
      onClick={isSaving ? undefined : onClose}
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
                background: type === 'demo' ? '#ecfdf5' : '#eef2ff',
                color: type === 'demo' ? '#059669' : '#4f46e5',
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
                {title}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
                {type === 'demo'
                  ? 'A time-boxed trial offer for prospects.'
                  : 'Price any user count per month — GST and term totals update live.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close plan form"
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
            {/* Plan type switch */}
            <div>
              <label className="adm-form-label">
                Plan Type <span className="adm-required-star">*</span>
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '12px',
                  marginTop: '6px'
                }}
              >
                {PLAN_TYPES.map((option) => {
                  const isSelected = type === option.value;
                  return (
                    <label
                      key={option.value}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        cursor: isEdit ? 'not-allowed' : 'pointer',
                        opacity: isEdit && !isSelected ? 0.55 : 1,
                        border: isSelected ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                        background: isSelected ? '#eef2ff' : '#ffffff',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input
                        type="radio"
                        name="plan-type"
                        value={option.value}
                        checked={isSelected}
                        disabled={isEdit}
                        onChange={() => {
                          setType(option.value);
                          setForm(initialForm(null, option.value));
                        }}
                        style={{ marginTop: '3px', accentColor: '#4f46e5' }}
                      />
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: '0.86rem',
                            color: isSelected ? '#4338ca' : '#0f172a'
                          }}
                        >
                          {option.label}
                        </div>
                        <div
                          style={{
                            fontSize: '0.74rem',
                            color: '#64748b',
                            marginTop: '3px',
                            lineHeight: 1.4
                          }}
                        >
                          {option.hint}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
              {isEdit && (
                <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '8px 0 0 0' }}>
                  The plan type is fixed once published.
                </p>
              )}
            </div>

            {/* Plan Name */}
            <div>
              <label className="adm-form-label">
                Plan Name <span className="adm-required-star">*</span>
              </label>
              <input
                type="text"
                className="adm-form-input"
                placeholder={type === 'demo' ? 'e.g. Demo - 7 Days' : 'e.g. Enterprise 10 Users'}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {type === 'demo' ? (
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
            ) : (
              <>
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
                    {SERVER_TYPES.map((server) => {
                      const isSelected = form.serverType === server.value;
                      return (
                        <label
                          key={server.value}
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
                            value={server.value}
                            checked={isSelected}
                            onChange={() => setForm({ ...form, serverType: server.value })}
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
                              <span>{server.label}</span>
                            </div>
                            <div
                              style={{
                                fontSize: '0.74rem',
                                color: '#64748b',
                                marginTop: '3px',
                                lineHeight: 1.4
                              }}
                            >
                              {server.hint}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Specific Customer Section */}
                <div style={{ marginTop: '6px', paddingTop: '16px', borderTop: '1px dashed #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className="adm-form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <UserCheck size={16} color="#4f46e5" />
                      <span>Customer Visibility &amp; Custom Price Access</span>
                    </label>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Target specific customer
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '10px',
                      marginBottom: '12px'
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: !form.isCustomerSpecific ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                        background: !form.isCustomerSpecific ? '#eef2ff' : '#ffffff'
                      }}
                    >
                      <input
                        type="radio"
                        name="custom-plan-audience"
                        checked={!form.isCustomerSpecific}
                        onChange={() => {
                          setForm((prev) => ({
                            ...prev,
                            isCustomerSpecific: false,
                            targetCustomerEmail: '',
                            targetCustomerId: '',
                            targetCustomerName: ''
                          }));
                        }}
                        style={{ accentColor: '#4f46e5' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.84rem', color: '#0f172a' }}>All Customers</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Standard custom plan visible to all</div>
                      </div>
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: form.isCustomerSpecific ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                        background: form.isCustomerSpecific ? '#eef2ff' : '#ffffff'
                      }}
                    >
                      <input
                        type="radio"
                        name="custom-plan-audience"
                        checked={form.isCustomerSpecific}
                        onChange={() => {
                          setForm((prev) => ({
                            ...prev,
                            isCustomerSpecific: true
                          }));
                        }}
                        style={{ accentColor: '#4f46e5' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.84rem', color: '#4338ca' }}>Specific Customer Only</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Private custom price only for one customer</div>
                      </div>
                    </label>
                  </div>

                  {form.isCustomerSpecific && (
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <label className="adm-form-label" style={{ marginBottom: '4px' }}>
                        Select Target Customer <span className="adm-required-star">*</span>
                      </label>
                      <select
                        className="adm-form-input"
                        value={form.targetCustomerEmail}
                        onChange={(e) => {
                          const selectedEmail = e.target.value;
                          const matched = customersList.find(
                            (c) => (c.email || '').toLowerCase() === selectedEmail.toLowerCase()
                          );
                          setForm((prev) => ({
                            ...prev,
                            targetCustomerEmail: selectedEmail,
                            targetCustomerId: matched?.customerId || matched?.id || '',
                            targetCustomerName: matched?.company || matched?.name || matched?.clientName || ''
                          }));
                        }}
                        required
                      >
                        <option value="">Select customer from registered accounts...</option>
                        {customersList.map((c) => {
                          const email = c.email || '';
                          const name = c.company || c.name || c.clientName || 'Unnamed';
                          const cid = c.customerId || c.id || '';
                          return (
                            <option key={email || cid} value={email}>
                              {name} — {email} {cid ? `(${cid})` : ''}
                            </option>
                          );
                        })}
                      </select>

                      {form.targetCustomerEmail && (
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: '#0369a1',
                            background: '#e0f2fe',
                            border: '1px solid #bae6fd',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <Lock size={14} style={{ flexShrink: 0 }} />
                          <span>
                            <strong>Private Custom Price:</strong> Only <strong>{form.targetCustomerName || form.targetCustomerEmail}</strong> ({form.targetCustomerEmail}) will be able to see and purchase this plan. It will remain hidden from all other customers.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Live pricing preview */}
            {type === 'demo' ? (
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
            ) : (
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
            )}
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
              <span>{isSaving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Plan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
