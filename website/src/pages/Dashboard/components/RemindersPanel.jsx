import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Bell, AlertTriangle, Clock, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import { PLAN_RENEWALS } from '../data/mockDashboardData';

/* ─────────────────────────────────────────────────────────────────
   Urgency helpers
───────────────────────────────────────────────────────────────── */
function getUrgency(daysLeft) {
  if (daysLeft < 0)  return { label: 'Expired',  color: '#dc2626', bg: '#fef2f2', dot: '#dc2626',  icon: 'critical' };
  if (daysLeft <= 7) return { label: 'Critical',  color: '#dc2626', bg: '#fef2f2', dot: '#ef4444',  icon: 'critical' };
  if (daysLeft <= 30)return { label: 'Due Soon',  color: '#d97706', bg: '#fffbeb', dot: '#f59e0b',  icon: 'warning'  };
  return               { label: 'Upcoming',      color: '#059669', bg: '#f0fdf4', dot: '#10b981',  icon: 'ok'       };
}

function UrgencyIcon({ kind, size = 16 }) {
  if (kind === 'critical') return <AlertTriangle size={size} />;
  if (kind === 'warning')  return <Clock size={size} />;
  return <CheckCircle2 size={size} />;
}

/* ─────────────────────────────────────────────────────────────────
   Individual toast renderer (custom)
───────────────────────────────────────────────────────────────── */
function RenewalToastContent({ plan, onNavigate, toastId }) {
  const urgency = getUrgency(plan.daysLeft);
  return (
    <div className="reminder-toast-body">
      <div className="reminder-toast-icon" style={{ color: urgency.color }}>
        <UrgencyIcon kind={urgency.icon} size={18} />
      </div>
      <div className="reminder-toast-text">
        <span className="reminder-toast-label" style={{ color: urgency.color }}>
          {urgency.label} — Renewal Required
        </span>
        <span className="reminder-toast-plan">{plan.planName}</span>
        <span className="reminder-toast-meta">
          Expires: {plan.expiryDate} &nbsp;&middot;&nbsp;
          {plan.daysLeft < 0
            ? 'Service has lapsed'
            : plan.daysLeft === 0
            ? 'Expires today'
            : `${plan.daysLeft} day${plan.daysLeft === 1 ? '' : 's'} remaining`}
        </span>
      </div>
      <button
        className="reminder-toast-renew-btn"
        onClick={() => {
          toast.dismiss(toastId);
          onNavigate && onNavigate('products');
        }}
      >
        Renew <ArrowRight size={13} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Hook: fire toast reminders on first mount
───────────────────────────────────────────────────────────────── */
export function useRenewalToasts(onNavigate) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    // Only show plans that need attention (within 30 days or expired)
    const urgent = PLAN_RENEWALS.filter(p => p.daysLeft <= 30);
    if (!urgent.length) return;

    // Stagger toasts so they don't pile up immediately
    urgent.forEach((plan, i) => {
      setTimeout(() => {
        const urgency = getUrgency(plan.daysLeft);
        const toastFn = urgency.icon === 'critical' ? toast.error : toast;

        const id = `renewal-${plan.id}`;
        toastFn(
          (t) => (
            <RenewalToastContent plan={plan} onNavigate={onNavigate} toastId={t.id} />
          ),
          {
            id,
            duration: 8000,
            style: {
              background: '#fff',
              color: '#0f172a',
              border: `1px solid ${urgency.color}40`,
              boxShadow: `0 4px 24px rgba(0,0,0,0.10)`,
              borderRadius: '12px',
              padding: '0',
              maxWidth: '440px',
            },
          }
        );
      }, i * 900);
    });
  }, [onNavigate]);
}

/* ─────────────────────────────────────────────────────────────────
   Reminders Panel Widget (embedded in Overview)
───────────────────────────────────────────────────────────────── */
export default function RemindersPanel({ onNavigate }) {
  const urgentPlans = PLAN_RENEWALS.filter(p => p.daysLeft <= 30);
  const allPlans = PLAN_RENEWALS;

  return (
    <div className="reminder-panel-card cust-section-card">
      {/* Header */}
      <div className="reminder-panel-header">
        <div className="reminder-panel-title-group">
          <div className="reminder-panel-icon-bubble">
            <Bell size={18} />
          </div>
          <div>
            <h3 className="cust-section-title">Renewal Reminders</h3>
            <span className="cust-section-desc">
              {urgentPlans.length > 0
                ? `${urgentPlans.length} plan${urgentPlans.length > 1 ? 's require' : ' requires'} your attention`
                : 'All plans are up to date'}
            </span>
          </div>
        </div>
        {urgentPlans.length > 0 && (
          <span className="reminder-urgent-badge">{urgentPlans.length} Urgent</span>
        )}
      </div>

      {/* Plan List */}
      <div className="reminder-plan-list">
        {allPlans.map((plan, idx) => {
          const urgency = getUrgency(plan.daysLeft);
          return (
            <div
              key={plan.id}
              className="reminder-plan-row"
              style={{ '--reminder-delay': `${idx * 80}ms` }}
            >
              {/* Left urgency strip */}
              <div
                className="reminder-plan-strip"
                style={{ background: urgency.dot }}
              />

              {/* Plan info */}
              <div className="reminder-plan-info">
                <div className="reminder-plan-name-row">
                  <span className="reminder-plan-name">{plan.planName}</span>
                  <span
                    className="reminder-plan-badge"
                    style={{ background: urgency.bg, color: urgency.color }}
                  >
                    <UrgencyIcon kind={urgency.icon} size={11} />
                    {urgency.label}
                  </span>
                </div>
                <div className="reminder-plan-meta-row">
                  <span className="reminder-plan-expiry">
                    Expires: <strong>{plan.expiryDate}</strong>
                  </span>
                  <span className="reminder-plan-days" style={{ color: urgency.color }}>
                    {plan.daysLeft < 0
                      ? 'Service lapsed'
                      : plan.daysLeft === 0
                      ? 'Expires today'
                      : `${plan.daysLeft} day${plan.daysLeft === 1 ? '' : 's'} left`}
                  </span>
                  <span className="reminder-plan-price">{plan.price}</span>
                </div>
              </div>

              {/* CTA */}
              {plan.daysLeft <= 30 && (
                <button
                  className="reminder-renew-btn"
                  style={{ '--btn-color': urgency.color, '--btn-bg': urgency.bg }}
                  onClick={() => onNavigate && onNavigate('products')}
                  title={`Renew ${plan.planName}`}
                >
                  <RefreshCw size={13} />
                  Renew
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="reminder-panel-footer">
        <button
          className="reminder-view-all-btn"
          onClick={() => onNavigate && onNavigate('products')}
        >
          <span>View all renewal plans</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
