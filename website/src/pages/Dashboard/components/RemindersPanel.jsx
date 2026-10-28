import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Bell, AlertTriangle, Clock, CheckCircle2, ArrowRight, RefreshCw, X } from 'lucide-react';
import { PLAN_RENEWALS } from '../data/mockDashboardData';
import { dashboardApi } from '../../../services/dashboardApi';

/* ─────────────────────────────────────────────────────────────────
   Urgency helpers
───────────────────────────────────────────────────────────────── */
function getUrgency(daysLeft) {
  if (daysLeft < 0)  return { label: 'Expired',  color: '#dc2626', bg: '#fef2f2', dot: '#dc2626',  icon: 'critical' };
  if (daysLeft <= 7) return { label: 'Critical',  color: '#dc2626', bg: '#fef2f2', dot: '#ef4444',  icon: 'critical' };
  if (daysLeft <= 30)return { label: 'Due Soon',  color: '#d97706', bg: '#fffbeb', dot: '#f59e0b',  icon: 'warning'  };
  return               { label: 'Upcoming',      color: '#059669', bg: '#f0fdf4', dot: '#10b981',  icon: 'ok'       };
}

function UrgencyIcon({ kind, size = 15 }) {
  if (kind === 'critical') return <AlertTriangle size={size} />;
  if (kind === 'warning')  return <Clock size={size} />;
  return <CheckCircle2 size={size} />;
}

/* ─────────────────────────────────────────────────────────────────
   Individual toast renderer (Professional Card with Top-Right X)
───────────────────────────────────────────────────────────────── */
function RenewalToastContent({ plan, onNavigate, toastId, visible }) {
  const urgency = getUrgency(plan.daysLeft);
  const isCritical = urgency.icon === 'critical';

  return (
    <div
      className={`renewal-pro-toast-card ${isCritical ? 'is-critical' : 'is-warning'} ${visible ? 'toast-show' : 'toast-hide'}`}
      role="alert"
    >
      {/* ── Top Header: Urgency Pill + Top-Right Close "X" Button ── */}
      <div className="pro-toast-topbar">
        <div
          className="pro-toast-status-badge"
          style={{ color: urgency.color, backgroundColor: urgency.bg }}
        >
          <UrgencyIcon kind={urgency.icon} size={13} />
          <span>{urgency.label.toUpperCase()} &mdash; RENEWAL REQUIRED</span>
        </div>

        {/* Top-Right Dismiss X Icon Button */}
        <button
          type="button"
          className="pro-toast-x-btn"
          onClick={(e) => {
            e.stopPropagation();
            toast.dismiss(toastId);
          }}
          aria-label="Dismiss notification"
          title="Dismiss"
        >
          <X size={15} />
        </button>
      </div>

      {/* ── Main Content Area: Title, Expiry & Renew Action ── */}
      <div className="pro-toast-body-row">
        <div className="pro-toast-info-block">
          <h4 className="pro-toast-plan-name" title={plan.planName}>
            {plan.planName}
          </h4>
          <div className="pro-toast-meta-line">
            <span className="pro-toast-expiry">Expires: {plan.expiryDate}</span>
            <span className="pro-toast-dot">&middot;</span>
            <span
              className={`pro-toast-countdown ${isCritical ? 'critical-text' : 'warning-text'}`}
              style={{ color: urgency.color }}
            >
              {plan.daysLeft < 0
                ? 'Service has lapsed'
                : plan.daysLeft === 0
                ? 'Expires today'
                : `${plan.daysLeft} day${plan.daysLeft === 1 ? '' : 's'} remaining`}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="pro-toast-renew-action"
          onClick={() => {
            toast.dismiss(toastId);
            onNavigate && onNavigate('products');
          }}
          title="Renew now"
        >
          <span>Renew</span>
          <ArrowRight size={13} className="renew-arrow-icon" />
        </button>
      </div>
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

    async function triggerRenewalToasts() {
      let plans = PLAN_RENEWALS;
      try {
        const data = await dashboardApi.getOverview();
        const apiPlans = data?.renewal_reminders?.plans || data?.Renewals_Reminders?.plans;
        if (Array.isArray(apiPlans) && apiPlans.length > 0) {
          plans = apiPlans;
        }
      } catch (err) {
        console.warn('Notice loading dynamic renewal toasts:', err.message);
      }

      // Only show plans that need attention (within 30 days or expired)
      const urgent = plans.filter(p => p.daysLeft <= 30);
      if (!urgent.length) return;

      // Stagger toasts so they don't pile up immediately
      urgent.forEach((plan, i) => {
        setTimeout(() => {
          const id = `renewal-${plan.id}`;
          toast.custom(
            (t) => (
              <RenewalToastContent
                plan={plan}
                onNavigate={onNavigate}
                toastId={t.id}
                visible={t.visible}
              />
            ),
            {
              id,
              duration: 9000,
              position: 'top-right'
            }
          );
        }, i * 900);
      });
    }

    triggerRenewalToasts();
  }, [onNavigate]);
}

/* ─────────────────────────────────────────────────────────────────
   Reminders Panel Widget (embedded in Overview)
───────────────────────────────────────────────────────────────── */
export default function RemindersPanel({ onNavigate, remindersData }) {
  const allPlans = remindersData?.plans || PLAN_RENEWALS;
  const urgentPlans = allPlans.filter(p => p.daysLeft <= 30);
  const panelTitle = remindersData?.title || 'Renewal Reminders';
  const panelSubtitle = remindersData?.subtitle || (
    urgentPlans.length > 0
      ? `${urgentPlans.length} plan${urgentPlans.length > 1 ? 's require' : ' requires'} your attention`
      : 'All plans are up to date'
  );
  const urgentBadgeText = remindersData?.badge || (urgentPlans.length > 0 ? `${urgentPlans.length} Urgent` : null);

  return (
    <div className="reminder-panel-card cust-section-card">
      {/* Header */}
      <div className="reminder-panel-header">
        <div className="reminder-panel-title-group">
          <div className="reminder-panel-icon-bubble">
            <Bell size={18} />
          </div>
          <div>
            <h3 className="cust-section-title">{panelTitle}</h3>
            <span className="cust-section-desc">{panelSubtitle}</span>
          </div>
        </div>
        {urgentBadgeText && (
          <span className="reminder-urgent-badge">{urgentBadgeText}</span>
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
          <span>{remindersData?.viewAllText || 'View all renewal plans'}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
