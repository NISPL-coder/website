import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  Clock,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Server,
  UserCheck,
  Package,
  X,
  ChevronRight,
  ArrowRight,
  FileText,
  Hourglass,
  Activity,
  Layers,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import './DemoProductDetailsModal.css';

/**
 * Robustly parses various date formats (YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, ISO, natural English)
 * and returns unix timestamp in ms.
 */
function parseAnyDate(val, isEnd = false) {
  if (!val) return null;
  if (val instanceof Date) {
    const t = val.getTime();
    return Number.isNaN(t) ? null : t;
  }
  if (typeof val === 'number') {
    return Number.isNaN(val) ? null : val;
  }

  const str = String(val).trim();
  if (!str) return null;

  // DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10) - 1;
    const y = parseInt(dmyMatch[3], 10);
    if (dmyMatch[4] !== undefined) {
      const hh = parseInt(dmyMatch[4], 10);
      const mm = parseInt(dmyMatch[5], 10);
      const ss = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;
      return new Date(y, m, d, hh, mm, ss).getTime();
    }
    return isEnd
      ? new Date(y, m, d, 23, 59, 59, 999).getTime()
      : new Date(y, m, d, 0, 0, 0, 0).getTime();
  }

  // YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (ymdMatch) {
    const y = parseInt(ymdMatch[1], 10);
    const m = parseInt(ymdMatch[2], 10) - 1;
    const d = parseInt(ymdMatch[3], 10);
    if (ymdMatch[4] !== undefined) {
      const hh = parseInt(ymdMatch[4], 10);
      const mm = parseInt(ymdMatch[5], 10);
      const ss = ymdMatch[6] ? parseInt(ymdMatch[6], 10) : 0;
      return new Date(y, m, d, hh, mm, ss).getTime();
    }
    return isEnd
      ? new Date(y, m, d, 23, 59, 59, 999).getTime()
      : new Date(y, m, d, 0, 0, 0, 0).getTime();
  }

  // Fallback to standard Date.parse
  const parsed = Date.parse(str);
  if (!Number.isNaN(parsed)) {
    if (isEnd && !str.includes(':')) {
      const d = new Date(parsed);
      d.setHours(23, 59, 59, 999);
      return d.getTime();
    }
    return parsed;
  }

  return null;
}

function formatDate(value) {
  if (!value) return '—';
  const ts = parseAnyDate(value, false);
  if (!ts) return String(value);
  const date = new Date(ts);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DemoProductDetailsModal({
  isOpen,
  onClose,
  demoProducts = [],
  customer = null,
  account = null,
  hasConvertedDemo = false,
  onNavigateTab = null,
  onOpenSupport = null
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Keep index in range
  useEffect(() => {
    if (selectedIndex >= demoProducts.length && demoProducts.length > 0) {
      setSelectedIndex(0);
    }
  }, [demoProducts, selectedIndex]);

  // Handle escape key and lock body scrolling while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const activeDemo = demoProducts[selectedIndex] || demoProducts[0] || null;

  // Real-time countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    isExpired: false,
    percentRemaining: 100
  });

  useEffect(() => {
    if (!isOpen || !activeDemo) return;

    // Resolve target expiry time with multiple fallbacks
    let targetTime =
      parseAnyDate(activeDemo.rawExpiryDate, true) ||
      parseAnyDate(activeDemo.expiryDate, true) ||
      parseAnyDate(activeDemo.endDate, true);

    // If targetTime couldn't be parsed directly from date strings, check if daysLeft is present
    if (!targetTime && typeof activeDemo.daysLeft === 'number' && activeDemo.daysLeft >= 0) {
      targetTime = Date.now() + activeDemo.daysLeft * 24 * 60 * 60 * 1000;
    }

    const startTime =
      parseAnyDate(activeDemo.startDate, false) ||
      (targetTime ? targetTime - 7 * 24 * 60 * 60 * 1000 : null);

    const updateTimer = () => {
      if (!targetTime) {
        const isExp = Boolean(activeDemo.expired);
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
          isExpired: isExp,
          percentRemaining: isExp ? 0 : 100
        });
        return;
      }

      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
          isExpired: true,
          percentRemaining: 0
        });
        return;
      }

      const totalDuration = startTime ? Math.max(targetTime - startTime, 1000) : 7 * 86400000;
      const percent = Math.max(0, Math.min(100, Math.round((diff / totalDuration) * 100)));

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        totalSeconds: Math.floor(diff / 1000),
        isExpired: false,
        percentRemaining: percent
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isOpen, activeDemo]);

  if (!isOpen) return null;

  const handleExplorePlans = () => {
    onClose();
    if (onNavigateTab) onNavigateTab('products');
  };


  const pad = (n) => String(Math.max(0, Number(n) || 0)).padStart(2, '0');

  const expiryFormatted = activeDemo
    ? formatDate(activeDemo.rawExpiryDate || activeDemo.expiryDate || activeDemo.endDate)
    : '—';

  const startDateFormatted = activeDemo
    ? formatDate(activeDemo.startDate)
    : '—';

  const modalContent = (
    <div className="demo-details-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="demo-details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="demo-details-header">
          <div className="demo-details-header-left">
            <span className="demo-details-badge">
              <Sparkles size={14} className="demo-badge-icon" />
              Demo Trial Environment
            </span>
            <h2 className="demo-details-title">
              {activeDemo?.name || activeDemo?.service || 'Trail'}
            </h2>
            <p className="demo-details-subtitle">
              Dynamic sandbox configuration, specifications and live duration timer.
            </p>
          </div>
          <button
            type="button"
            className="demo-details-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Multi-product tab bar if multiple demo products exist */}
        {demoProducts.length > 1 && (
          <div className="demo-details-tabs-bar">
            {demoProducts.map((p, idx) => (
              <button
                key={p.id || p.contractId || idx}
                type="button"
                className={`demo-details-tab ${selectedIndex === idx ? 'active' : ''}`}
                onClick={() => setSelectedIndex(idx)}
              >
                <Package size={14} />
                <span>{p.name || `Demo #${idx + 1}`}</span>
              </button>
            ))}
          </div>
        )}

        {/* Modal Body */}
        <div className="demo-details-body">
          {!activeDemo ? (
            <div className="demo-empty-state">
              <div
                className="demo-empty-icon-wrap"
                style={{ background: hasConvertedDemo ? '#ecfdf5' : '#eef2ff' }}
              >
                {hasConvertedDemo ? (
                  <CheckCircle2 size={36} color="#10b981" />
                ) : (
                  <Sparkles size={36} color="#6366f1" />
                )}
              </div>
              <h3 className="demo-empty-title">
                {hasConvertedDemo
                  ? 'Demo Converted to Paid Subscription'
                  : 'No Active Demo Product'}
              </h3>
              <p className="demo-empty-text">
                {hasConvertedDemo
                  ? 'Your demo trial was converted after a verified purchase payment. The paid subscription is listed under Your Products.'
                  : 'There is currently no demo trial active on this account. Explore our cloud server and software trial options to get instant sandbox access.'}
              </p>
              <button
                type="button"
                className="flowmail-btn-primary"
                onClick={handleExplorePlans}
              >
                {hasConvertedDemo ? 'View Active Products' : 'Explore Available Products'}
              </button>
            </div>
          ) : (
            <>
              {/* ── 1. Live Countdown Timer Box ── */}
              <div
                className={`demo-countdown-card ${
                  timeLeft.isExpired
                    ? 'is-expired'
                    : timeLeft.days <= 2
                    ? 'is-expiring-soon'
                    : 'is-active'
                }`}
              >
                <div className="demo-countdown-top">
                  <div className="demo-countdown-header">
                    <Hourglass size={18} className="demo-pulse-icon" />
                    <span className="demo-countdown-label">
                      {timeLeft.isExpired
                        ? 'DEMO TRIAL STATUS'
                        : 'TIME REMAINING FOR DEMO TO LAST'}
                    </span>
                  </div>

                  <span
                    className={`demo-status-pill ${
                      timeLeft.isExpired
                        ? 'expired'
                        : timeLeft.days <= 2
                        ? 'warning'
                        : 'active'
                    }`}
                  >
                    <span className="demo-status-dot" />
                    {timeLeft.isExpired
                      ? 'Trial Ended'
                      : timeLeft.days <= 2
                      ? 'Expiring Soon'
                      : 'Active Sandbox'}
                  </span>
                </div>

                {timeLeft.isExpired ? (
                  <div className="demo-expired-notice">
                    <h4 className="demo-expired-heading">Demo Trial Period Has Ended</h4>
                    <p className="demo-expired-sub">
                      The sandbox trial expired on <strong>{expiryFormatted}</strong>. You can upgrade to a
                      full subscription or contact our enterprise team for an extension.
                    </p>
                  </div>
                ) : (
                  <div className="demo-timer-content">
                    {/* Digit Blocks */}
                    <div className="demo-timer-grid">
                      <div className="demo-timer-block">
                        <span className="demo-timer-digit">{pad(timeLeft.days)}</span>
                        <span className="demo-timer-unit">DAYS</span>
                      </div>
                      <span className="demo-timer-sep">:</span>
                      <div className="demo-timer-block">
                        <span className="demo-timer-digit">{pad(timeLeft.hours)}</span>
                        <span className="demo-timer-unit">HOURS</span>
                      </div>
                      <span className="demo-timer-sep">:</span>
                      <div className="demo-timer-block">
                        <span className="demo-timer-digit">{pad(timeLeft.minutes)}</span>
                        <span className="demo-timer-unit">MINS</span>
                      </div>
                      <span className="demo-timer-sep">:</span>
                      <div className="demo-timer-block demo-timer-block-seconds">
                        <span className="demo-timer-digit">{pad(timeLeft.seconds)}</span>
                        <span className="demo-timer-unit">SECS</span>
                      </div>
                    </div>

                    {/* Visual Progress Bar Track */}
                    <div className="demo-progress-track">
                      <div
                        className="demo-progress-fill"
                        style={{ width: `${Math.max(3, timeLeft.percentRemaining)}%` }}
                      />
                    </div>
                    <div className="demo-progress-meta">
                      <span>Valid until: <strong>{expiryFormatted}</strong></span>
                      <span><strong>{timeLeft.percentRemaining}%</strong> of trial remaining</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── 2. Detailed Specifications Grid ── */}
              <div className="demo-specs-section">
                <h4 className="demo-section-heading">
                  <Activity size={16} />
                  <span>Demo Product Specifications</span>
                </h4>

                <div className="demo-specs-grid">
                  <div className="demo-spec-item">
                    <span className="demo-spec-label">Product / Plan</span>
                    <span className="demo-spec-value highlight">
                      {activeDemo.name || activeDemo.service || 'Trail'}
                    </span>
                  </div>

                  <div className="demo-spec-item">
                    <span className="demo-spec-label">Contract Reference</span>
                    <span className="demo-spec-value mono">
                      {activeDemo.contractId || activeDemo.id || 'CTR-DEMO-4743'}
                    </span>
                  </div>

                  <div className="demo-spec-item">
                    <span className="demo-spec-label">Trial Duration</span>
                    <span className="demo-spec-value">
                      {activeDemo.subscriptionPeriod || '7 Days'}
                    </span>
                  </div>

                  <div className="demo-spec-item">
                    <span className="demo-spec-label">Start Date</span>
                    <span className="demo-spec-value">{startDateFormatted}</span>
                  </div>

                  <div className="demo-spec-item">
                    <span className="demo-spec-label">Expiry Date</span>
                    <span className="demo-spec-value">{expiryFormatted}</span>
                  </div>

                  <div className="demo-spec-item">
                    <span className="demo-spec-label">Price / Value</span>
                    <span className="demo-spec-value badge-free">
                      {activeDemo.amountLabel || (activeDemo.amount === 0 ? '₹0' : 'FREE')}
                    </span>
                  </div>

                  <div className="demo-spec-item">
                    <span className="demo-spec-label">Assigned Node / Server</span>
                    <span className="demo-spec-value">
                      {activeDemo.serverNode ||
                        activeDemo.serverConfiguration ||
                        'Dynamic Sandbox Node-01'}
                    </span>
                  </div>

                  <div className="demo-spec-item">
                    <span className="demo-spec-label">SLA Tier</span>
                    <span className="demo-spec-value">
                      {activeDemo.slaTier || 'Demo Trial 99.99%'}
                    </span>
                  </div>

                  <div className="demo-spec-item">
                    <span className="demo-spec-label">Sales Representative</span>
                    <span className="demo-spec-value">
                      {activeDemo.salesPerson || 'Sourav Mukherjee (Assigned)'}
                    </span>
                  </div>

                  <div className="demo-spec-item">
                    <span className="demo-spec-label">Account Company</span>
                    <span className="demo-spec-value">
                      {account?.company || customer?.companyName || customer?.company || 'Net Infotech System'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── 3. Description & Scope Note ── */}
              {activeDemo.description && (
                <div className="demo-description-box">
                  <div className="demo-description-title">
                    <FileText size={15} />
                    <span>Trial Scope & Provisioning Details</span>
                  </div>
                  <p className="demo-description-text">{activeDemo.description}</p>
                </div>
              )}

              {/* ── 4. Extension authorized banner (if applicable) ── */}
              {activeDemo.extensionAllowed && (
                <div className="demo-extension-alert">
                  <ShieldCheck size={18} color="#059669" />
                  <div>
                    <strong>Extension Authorized by Administrator:</strong> You have been
                    granted an additional {activeDemo.extensionDays || 7} days extension on this trial.
                    Contact our support team to apply it.
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="demo-details-footer">
          <div className="demo-footer-left">
          </div>

          <div className="demo-footer-right">
            <button
              type="button"
              className="demo-btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="demo-btn-primary"
              onClick={handleExplorePlans}
            >
              <span>Explore Full Plans</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
