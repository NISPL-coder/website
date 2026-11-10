import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Lock,
  Plus,
  Save,
  Shield,
  UserCheck,
  Users,
  Wallet
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productApi } from '../../../services/productApi';
import { customerApi } from '../../../services/customerApi';
import { GST_RATE_DEFAULT, formatINR } from '../../Dashboard/utils/pricingUtils';

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
    isCustomerSpecific: Boolean(plan.isCustomerSpecific || plan.targetCustomerEmail),
    targetCustomerEmail: plan.targetCustomerEmail || '',
    targetCustomerId: plan.targetCustomerId || '',
    targetCustomerName: plan.targetCustomerName || ''
  };
};

export default function CreateCustomPlanPage({ products = [], setProducts }) {
  const navigate = useNavigate();
  const location = useLocation();
  const editPlan = location.state?.plan || null;
  const isEdit = Boolean(editPlan);

  const [type, setType] = useState(() => (editPlan?.isDemoPlan ? 'demo' : 'custom'));
  const [form, setForm] = useState(() =>
    initialForm(editPlan, editPlan?.isDemoPlan ? 'demo' : 'custom')
  );
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

  const amount = Number(form.priceAmount) || 0;

  const durationChoices =
    form.duration && !DURATION_OPTIONS.includes(form.duration)
      ? [form.duration, ...DURATION_OPTIONS]
      : DURATION_OPTIONS;

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
          ipAddress: editPlan?.ipAddress || '',
          serverConfiguration: '',
          description: `${form.name.trim()} trial for ${form.duration}${
            amount > 0 ? ` at ${formatINR(amount)}` : ' — free of charge'
          }.`,
          available: editPlan ? editPlan.available !== false && editPlan.status !== 'inactive' : true,
          specs: [],
          features: []
        }
      : {
          name: form.name.trim(),
          users: breakdown.users,
          pricePerUser: breakdown.pricePerUser,
          isCustomPlan: true,
          isCustomerSpecific: Boolean(form.isCustomerSpecific && form.targetCustomerEmail),
          targetCustomerEmail: form.isCustomerSpecific ? (form.targetCustomerEmail || '').trim().toLowerCase() : '',
          targetCustomerId: form.isCustomerSpecific ? (form.targetCustomerId || '').trim() : '',
          targetCustomerName: form.isCustomerSpecific ? (form.targetCustomerName || '').trim() : '',
          provider: 'ctrls-cloud',
          category: 'Infrastructure',
          ipAddress: editPlan?.ipAddress || '',
          serverConfiguration: '',
          description: `Custom pricing plan — ${breakdown.users} user${
            breakdown.users > 1 ? 's' : ''
          } at ${formatINR(breakdown.pricePerUser)} per user per month${
            form.isCustomerSpecific && form.targetCustomerEmail
              ? ` [Private Custom Plan for ${form.targetCustomerName || form.targetCustomerEmail}]`
              : ''
          }.`,
          available: editPlan ? editPlan.available !== false && editPlan.status !== 'inactive' : true,
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
        ? await productApi.updateProduct(editPlan.id || editPlan._id, payload)
        : await productApi.createProduct(payload);

      if (setProducts) {
        const savedRecord = saved || payload;
        const savedKey = savedRecord.productId || savedRecord.id || savedRecord._id;
        setProducts((prev) =>
          prev.some((p) => (p.productId || p.id || p._id) === savedKey)
            ? prev.map((p) => ((p.productId || p.id || p._id) === savedKey ? { ...p, ...savedRecord } : p))
            : [savedRecord, ...prev]
        );
      }

      toast.success(
        isEdit
          ? `${kindLabel} "${payload.name}" updated successfully.`
          : `${kindLabel} "${payload.name}" published to catalog.`,
        { id: toastId }
      );

      navigate('/admin/product/cloud/custom-pricing');
    } catch (err) {
      console.error('Failed to save plan:', err);
      toast.error(err.message || 'Could not save the plan. Please check the form and retry.', {
        id: toastId
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="adm-create-page-container animate-fade-in">
      {/* Top Navigation & Action Header (Matches other create pages with back button on top right) */}
      <div className="adm-create-page-header">
        <div className="adm-create-header-left">
          <div className="adm-breadcrumb-row">
            <span className="adm-breadcrumb-mute">Products</span>
            <span className="adm-breadcrumb-sep">/</span>
            <span
              className="adm-breadcrumb-link"
              onClick={() => navigate('/admin/product/cloud/custom-pricing')}
            >
              Custom Pricing
            </span>
            <span className="adm-breadcrumb-sep">/</span>
            <span className="adm-breadcrumb-active">{isEdit ? 'Edit' : 'Create'}</span>
          </div>

          <div className="adm-create-title-group">
            <h1
              className="adm-section-title"
              style={{
                fontSize: '1.45rem',
                fontWeight: 600,
                color: '#0f172a',
                letterSpacing: '-0.01em',
                marginBottom: '4px'
              }}
            >
              {isEdit ? `Edit Plan: ${editPlan?.name}` : 'Create Custom & Demo Pricing Plan'}
            </h1>
            <p className="adm-section-sub" style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 400, margin: 0 }}>
              {type === 'demo'
                ? 'Publish a time-boxed demo trial offer with custom duration and pricing.'
                : 'Configure custom per-user pricing with optional specific-customer private access.'}
            </p>
          </div>
        </div>

        {/* Top-Right Action Button */}
        <div className="adm-create-header-action adm-header-actions-group">
          <button
            type="button"
            className="adm-back-btn"
            onClick={() => navigate('/admin/product/cloud/custom-pricing')}
            disabled={isSaving}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="adm-table-card adm-form-card" style={{ padding: '28px 32px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Section: Plan Type */}
          <div className="adm-form-section">
            <div className="adm-form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wallet size={18} className="adm-form-section-icon purple" />
              <span style={{ fontWeight: 600, fontSize: '0.96rem', color: '#1e293b' }}>
                Plan Type &amp; Classification
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '14px',
                marginTop: '12px'
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
                      gap: '12px',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      cursor: isEdit ? 'not-allowed' : 'pointer',
                      opacity: isEdit && !isSelected ? 0.6 : 1,
                      border: isSelected ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                      background: isSelected ? '#f5f3ff' : '#ffffff',
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
                          fontWeight: 500,
                          fontSize: '0.9rem',
                          color: isSelected ? '#4338ca' : '#0f172a'
                        }}
                      >
                        {option.label}
                      </div>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: '#64748b',
                          marginTop: '3px',
                          lineHeight: 1.4,
                          fontWeight: 400
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
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '8px 0 0 0', fontWeight: 400 }}>
                The plan type cannot be changed after publication.
              </p>
            )}
          </div>

          {/* Section: Configuration */}
          <div className="adm-form-section">
            <div className="adm-form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} className="adm-form-section-icon indigo" />
              <span style={{ fontWeight: 600, fontSize: '0.96rem', color: '#1e293b' }}>
                {type === 'demo' ? 'Trial Plan Configuration' : 'Custom Pricing Configuration'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              {/* Plan Name */}
              <div className="adm-form-field">
                <label className="adm-form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                  Plan Name <span className="adm-required-star">*</span>
                </label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder={type === 'demo' ? 'e.g. Demo Trial - 7 Days' : 'e.g. Enterprise 10 Users Custom'}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ fontWeight: 400 }}
                  required
                />
              </div>

              {type === 'demo' ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px'
                  }}
                >
                  <div className="adm-form-field">
                    <label className="adm-form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                      Duration <span className="adm-required-star">*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Clock
                        size={15}
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#94a3b8'
                        }}
                      />
                      <select
                        className="adm-form-input"
                        value={form.duration}
                        onChange={(e) => setForm({ ...form, duration: e.target.value })}
                        style={{ paddingLeft: '34px', fontWeight: 400 }}
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

                  <div className="adm-form-field">
                    <label className="adm-form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                      Price (₹) — Enter 0 for Free
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="adm-form-input"
                      placeholder="0"
                      value={form.priceAmount}
                      onChange={(e) => setForm({ ...form, priceAmount: e.target.value })}
                      style={{ fontWeight: 400 }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Users and Price Per User */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '16px'
                    }}
                  >
                    <div className="adm-form-field">
                      <label className="adm-form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                        Number of Users <span className="adm-required-star">*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Users
                          size={15}
                          style={{
                            position: 'absolute',
                            left: '12px',
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
                          style={{ paddingLeft: '34px', fontWeight: 400 }}
                          required
                        />
                      </div>
                    </div>

                    <div className="adm-form-field">
                      <label className="adm-form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>
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
                        style={{ fontWeight: 400 }}
                        required
                      />
                    </div>
                  </div>

                  {/* Customer Visibility & Custom Price Access */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      marginTop: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label
                        className="adm-form-label"
                        style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 500 }}
                      >
                        <UserCheck size={17} color="#4f46e5" />
                        <span>Customer Visibility &amp; Custom Price Access</span>
                      </label>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>
                        Assign to a specific client or make public
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '12px'
                      }}
                    >
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: !form.isCustomerSpecific ? '1.5px solid #6366f1' : '1px solid #cbd5e1',
                          background: !form.isCustomerSpecific ? '#eef2ff' : '#ffffff',
                          transition: 'all 0.15s ease'
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
                          <div style={{ fontWeight: 500, fontSize: '0.85rem', color: '#0f172a' }}>
                            All Customers
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', fontWeight: 400 }}>
                            Standard custom plan visible in catalog
                          </div>
                        </div>
                      </label>

                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: form.isCustomerSpecific ? '1.5px solid #6366f1' : '1px solid #cbd5e1',
                          background: form.isCustomerSpecific ? '#eef2ff' : '#ffffff',
                          transition: 'all 0.15s ease'
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
                          <div style={{ fontWeight: 500, fontSize: '0.85rem', color: '#4338ca' }}>
                            Specific Customer Only
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', fontWeight: 400 }}>
                            Private custom price for one customer
                          </div>
                        </div>
                      </label>
                    </div>

                    {form.isCustomerSpecific && (
                      <div
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          marginTop: '4px'
                        }}
                      >
                        <label className="adm-form-label" style={{ marginBottom: 0, fontWeight: 500, fontSize: '0.84rem' }}>
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
                          style={{ fontWeight: 400 }}
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
                              fontSize: '0.8rem',
                              color: '#0369a1',
                              background: '#f0f9ff',
                              border: '1px solid #bae6fd',
                              borderRadius: '8px',
                              padding: '10px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              lineHeight: 1.5,
                              fontWeight: 400
                            }}
                          >
                            <Lock size={15} color="#0284c7" style={{ flexShrink: 0 }} />
                            <span>
                              Only <strong>{form.targetCustomerName || form.targetCustomerEmail}</strong> ({form.targetCustomerEmail}) will be able to see and purchase this plan. It will remain hidden from all other customers.
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section: Live Pricing Summary */}
          <div className="adm-form-section">
            <div className="adm-form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} className="adm-form-section-icon blue" />
              <span style={{ fontWeight: 600, fontSize: '0.96rem', color: '#1e293b' }}>
                Live Pricing &amp; Billing Calculation
              </span>
            </div>

            {type === 'demo' ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  marginTop: '12px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#334155' }}>
                    Published Trial Rate
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', fontWeight: 400 }}>
                    Fixed fee quoted for {form.duration}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    color: amount === 0 ? '#059669' : '#4338ca',
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
                  background: '#ffffff',
                  marginTop: '12px'
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                    gap: '1px',
                    background: '#e2e8f0'
                  }}
                >
                  {[
                    { label: 'Users', value: String(breakdown.users || 0) },
                    { label: 'Price / User / Month', value: formatINR(breakdown.pricePerUser, true) },
                    { label: 'Monthly Base', value: formatINR(breakdown.monthlyBase, true) },
                    { label: 'GST (18%)', value: formatINR(breakdown.gstAmount, true) },
                    {
                      label: 'Grand Total / Month',
                      value: formatINR(breakdown.grandTotalPerMonth, true),
                      highlight: true
                    },
                    { label: '6 Months Total', value: formatINR(breakdown.sixMonths, true) },
                    { label: '1 Year Total', value: formatINR(breakdown.oneYear, true) },
                    { label: '2 Years Total', value: formatINR(breakdown.twoYears, true) }
                  ].map((row) => (
                    <div
                      key={row.label}
                      style={{
                        padding: '12px 16px',
                        background: row.highlight ? '#f5f3ff' : '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '3px'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 500,
                          color: row.highlight ? '#4338ca' : '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em'
                        }}
                      >
                        {row.label}
                      </span>
                      <span
                        style={{
                          fontSize: row.highlight ? '1rem' : '0.9rem',
                          fontWeight: 600,
                          color: row.highlight ? '#312e81' : '#0f172a',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
                        }}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Form Actions */}
          <div className="adm-form-footer">
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={() => navigate('/admin/product/cloud/custom-pricing')}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button type="submit" className="adm-btn-primary" disabled={isSaving}>
              {isEdit ? <Save size={15} /> : <Plus size={15} />}
              <span>{isSaving ? 'Saving Plan...' : isEdit ? 'Save Changes' : 'Publish Plan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
