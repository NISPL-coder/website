import React, { useEffect, useState } from 'react';
import { X, Percent, IndianRupee, Calendar, Save, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentApi } from '../../../services/paymentApi';

const DEFAULT_POLICY = {
  enabled: true,
  method: 'interest',
  annualInterestRate: 18,
  fixedTiers: [
    { minDays: 1, maxDays: 15, fee: 250 },
    { minDays: 16, maxDays: 30, fee: 500 },
    { minDays: 31, maxDays: null, fee: 1000 }
  ],
  monthlyRate: 2
};

function computePreview(policy, amount = 50000, days = 25) {
  if (!policy.enabled) return 0;
  if (policy.method === 'interest') {
    return Math.round(((amount * (Number(policy.annualInterestRate) || 0) * days) / 36500) * 100) / 100;
  }
  if (policy.method === 'fixed') {
    const tiers = Array.isArray(policy.fixedTiers) ? policy.fixedTiers : DEFAULT_POLICY.fixedTiers;
    const match =
      tiers.find((t) => days >= t.minDays && (t.maxDays == null || days <= t.maxDays)) ||
      tiers[tiers.length - 1];
    return Number(match?.fee || 0);
  }
  if (policy.method === 'monthly') {
    const months = Math.max(1, Math.ceil(days / 30));
    return Math.round(amount * ((Number(policy.monthlyRate) || 0) / 100) * months * 100) / 100;
  }
  return 0;
}

export default function OverduePolicyModal({ isOpen, onClose }) {
  const [policy, setPolicy] = useState(DEFAULT_POLICY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    paymentApi
      .getOverduePolicy()
      .then((res) => {
        if (!cancelled && res) {
          setPolicy({ ...DEFAULT_POLICY, ...res });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const updateTier = (idx, field, val) => {
    setPolicy((prev) => {
      const nextTiers = [...(prev.fixedTiers || DEFAULT_POLICY.fixedTiers)];
      nextTiers[idx] = {
        ...nextTiers[idx],
        [field]: field === 'maxDays' && val === '' ? null : Number(val)
      };
      return { ...prev, fixedTiers: nextTiers };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await paymentApi.updateOverduePolicy(policy);
      setPolicy(saved);
      toast.success('Overdue charge policy saved!');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save overdue policy');
    } finally {
      setSaving(false);
    }
  };

  const preview25 = computePreview(policy, 50000, 25);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '580px',
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.22)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                Overdue Charge Settings
              </h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                Applied automatically to overdue renewals and pending invoices
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px',
              display: 'inline-flex'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
              Loading policy...
            </div>
          ) : (
            <>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>
                  Enable Overdue Charges
                </span>
                <input
                  type="checkbox"
                  checked={policy.enabled}
                  onChange={(e) => setPolicy({ ...policy, enabled: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                />
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: policy.enabled ? 1 : 0.55 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Calculation Method
                </span>

                {/* 1. Interest-based */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: policy.method === 'interest' ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                    background: policy.method === 'interest' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="overdueMethod"
                    checked={policy.method === 'interest'}
                    onChange={() => setPolicy({ ...policy, method: 'interest' })}
                    style={{ marginTop: '3px', accentColor: '#2563eb' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Percent size={14} color="#2563eb" />
                      1. Interest-Based Overdue Charges
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                      (Outstanding Amount × Annual Rate × Overdue Days) / 36500
                    </div>
                    {policy.method === 'interest' && (
                      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                          Annual Rate (%):
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={policy.annualInterestRate}
                          onChange={(e) => setPolicy({ ...policy, annualInterestRate: Number(e.target.value) })}
                          style={{ width: '90px', padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 600 }}
                        />
                      </div>
                    )}
                  </div>
                </label>

                {/* 2. Fixed late payment fee */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: policy.method === 'fixed' ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                    background: policy.method === 'fixed' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="overdueMethod"
                    checked={policy.method === 'fixed'}
                    onChange={() => setPolicy({ ...policy, method: 'fixed' })}
                    style={{ marginTop: '3px', accentColor: '#2563eb' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IndianRupee size={14} color="#2563eb" />
                      2. Fixed Late Payment Fee
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                      Tiered flat penalty based on overdue days
                    </div>
                    {policy.method === 'fixed' && (
                      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {(policy.fixedTiers || []).map((tier, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
                            <input
                              type="number"
                              min="1"
                              value={tier.minDays}
                              onChange={(e) => updateTier(idx, 'minDays', e.target.value)}
                              style={{ width: '58px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            />
                            <span>to</span>
                            <input
                              type="number"
                              min="1"
                              placeholder="∞"
                              value={tier.maxDays ?? ''}
                              onChange={(e) => updateTier(idx, 'maxDays', e.target.value)}
                              style={{ width: '58px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            />
                            <span>days → ₹</span>
                            <input
                              type="number"
                              min="0"
                              value={tier.fee}
                              onChange={(e) => updateTier(idx, 'fee', e.target.value)}
                              style={{ width: '80px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </label>

                {/* 3. Monthly overdue charges */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: policy.method === 'monthly' ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                    background: policy.method === 'monthly' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="overdueMethod"
                    checked={policy.method === 'monthly'}
                    onChange={() => setPolicy({ ...policy, method: 'monthly' })}
                    style={{ marginTop: '3px', accentColor: '#2563eb' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="#2563eb" />
                      3. Monthly Overdue Charges
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                      Percentage of outstanding amount per month until paid
                    </div>
                    {policy.method === 'monthly' && (
                      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                          Monthly Rate (%):
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={policy.monthlyRate}
                          onChange={(e) => setPolicy({ ...policy, monthlyRate: Number(e.target.value) })}
                          style={{ width: '90px', padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 600 }}
                        />
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px dashed #cbd5e1', fontSize: '0.8rem', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Preview (₹50,000 overdue by 25 days):</span>
                <strong style={{ color: '#dc2626' }}>+₹{preview25.toLocaleString('en-IN')}</strong>
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              className="adm-btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="adm-btn-primary"
              disabled={loading || saving}
            >
              <Save size={15} />
              <span>{saving ? 'Saving...' : 'Save Policy'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
