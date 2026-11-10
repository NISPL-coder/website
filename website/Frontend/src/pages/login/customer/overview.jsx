import React, { useCallback, useEffect, useState } from 'react';
import {
  Package,
  CreditCard,
  Clock,
  AlertTriangle,
  Download,
  Headphones,
  FileText,
  UserCheck,
  ChevronRight,
  CheckCircle2,
  Inbox,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  MailCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { dashboardApi } from '../../../services/dashboardApi';
import { generateReceiptPdf } from '../../Dashboard/utils/generateReceiptPdf';
import { toPortalReceiptRow } from '../../Dashboard/utils/portalReceiptRows';
import { formatINR } from '../../../utils/formatters';
import { normalizeCustomerLifecycle, customerLifecycleLabel } from '../../../utils/customerLifecycle';
import DemoProductDetailsModal from './components/DemoProductDetailsModal';

const LIFECYCLE_BADGE = {
  Active: { background: '#ecfdf5', color: '#047857', border: '#a7f3d0', icon: CheckCircle2 },
  Demo: { background: '#fffbeb', color: '#b45309', border: '#fde68a', icon: Sparkles },
  InProgress: { background: '#eef2ff', color: '#4338ca', border: '#c7d2fe', icon: Clock },
  Inactive: { background: '#f1f5f9', color: '#475569', border: '#e2e8f0', icon: Inbox }
};

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function dueInWords(daysLeft) {
  if (daysLeft === null || daysLeft === undefined) return 'No due date recorded';
  if (daysLeft < 0) return `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'}`;
  if (daysLeft === 0) return 'Due today';
  return `Due in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
}

function statusTone(status) {
  const normalized = String(status || '').toLowerCase();
  if (['received', 'cleared', 'paid', 'active'].includes(normalized)) return 'active';
  if (['overdue', 'unpaid'].includes(normalized)) return 'overdue';
  if (normalized === 'pending') return 'due';
  return 'completed';
}

function KpiCard({ icon: Icon, label, value, note, actionLabel, onAction, onClick, isClickable = false }) {
  const handleClick = () => {
    if (onClick) onClick();
    else if (onAction) onAction();
  };

  return (
    <div
      className={`flowmail-kpi-card ${isClickable ? 'is-clickable' : ''}`}
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
    >
      <div className="flowmail-kpi-top">
        <div className="flowmail-kpi-label-group">
          <Icon size={16} className="flowmail-kpi-icon" />
          <span className="flowmail-kpi-label">{label}</span>
        </div>
      </div>

      <div className="flowmail-kpi-middle">
        <div className="flowmail-kpi-number">{value}</div>
      </div>

      <div className="flowmail-kpi-foot">
        {note ? <span className="flowmail-kpi-note">{note}</span> : <span />}
        {actionLabel ? (
          <button
            type="button"
            className="flowmail-kpi-link"
            onClick={(e) => {
              e.stopPropagation();
              if (onAction) onAction();
              else if (onClick) onClick();
            }}
          >
            <span>{actionLabel}</span>
            <ChevronRight size={13} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function CloudPortalOverview({ customer, portalData = null, onNavigateTab, onPay, onOpenSupport, onOpenVerifyEmail }) {
  const [view, setView] = useState(() => ({
    status: portalData ? 'ready' : 'loading',
    data: portalData || null,
    error: ''
  }));

  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const load = useCallback(async () => {
    if (!portalData) {
      setView((prev) => ({ ...prev, status: 'loading', error: '' }));
    }
    try {
      const data = await dashboardApi.getMyOverview();
      setView({ status: 'ready', data, error: '' });
    } catch (err) {
      if (!portalData) {
        setView({
          status: 'error',
          data: null,
          error: err?.message || 'Unable to load your account overview.'
        });
      }
    }
  }, [portalData]);

  useEffect(() => {
    if (portalData) {
      setView({ status: 'ready', data: portalData, error: '' });
    } else {
      load();
    }
  }, [portalData, load]);

  const goTo = (tab) => {
    if (onNavigateTab) onNavigateTab(tab);
  };

  // A reminder pays exactly its own charge: one invoice, or one renewal.
  // Without a scope the portal prices whatever is due in priority order.
  const payReminder = (rem) => {
    if (!onPay) return;
    if (rem.kind === 'renewal' && rem.contractId) {
      onPay({ mode: 'renewal', contractId: rem.contractId, amount: rem.amount });
    } else if (rem.invoiceNumber) {
      onPay({ mode: 'invoice', invoiceNumber: rem.invoiceNumber, amount: rem.amount });
    } else {
      onPay();
    }
  };

  const data = view.data;
  const account = data?.account || {};
  const kpi = data?.kpi || {};
  const isEmailVerified = Boolean(customer?.isEmailVerified || account?.isEmailVerified);
  const primaryEmail = customer?.email || account?.email || '';
  const payments = (data?.recentPayments && data.recentPayments.length > 0)
    ? data.recentPayments
    : (data?.payments || []);
  const products = data?.products || [];

  const activeCount = kpi.activeProducts ?? products.filter(
    (p) =>
      !p.expired &&
      ['in progress', 'active'].includes(String(p.status || '').toLowerCase()) &&
      String(p.status).toUpperCase() !== 'DEMO' &&
      !p.isDemoTrial
  ).length;

  const hasPurchasedPaidProduct =
    activeCount > 0 ||
    (kpi.totalPaid && kpi.totalPaid > 0) ||
    Boolean(data?.hasConvertedDemo) ||
    products.some((p) => p.convertedToPaid || String(p.status).toUpperCase() === 'CONVERTED');

  const hasConvertedDemo =
    Boolean(data?.hasConvertedDemo) ||
    (hasPurchasedPaidProduct &&
      products.some(
        (p) =>
          p.isDemoTrial ||
          p.contractType === 'Trial' ||
          p.category === 'Trial' ||
          String(p.status).toUpperCase() === 'DEMO' ||
          p.convertedToPaid ||
          String(p.status).toUpperCase() === 'CONVERTED'
      ));

  // Rule: "once demo is issued and then purchased the products the demo will be convert.
  // both demo and active product cannot be there."
  // If activeCount > 0 or hasPurchasedPaidProduct, demoCount MUST be 0 and demoProducts empty.
  const demoProducts = hasPurchasedPaidProduct
    ? []
    : Array.isArray(data?.demoProducts)
    ? data.demoProducts
    : products.filter(
        (p) =>
          (p.isDemoTrial ||
            p.contractType === 'Trial' ||
            p.category === 'Trial' ||
            String(p.status).toUpperCase() === 'DEMO') &&
          String(p.status).toUpperCase() !== 'CONVERTED' &&
          !p.convertedToPaid &&
          !p.expired
      );

  const demoCount = hasPurchasedPaidProduct ? 0 : (kpi.demoProducts ?? demoProducts.length);

  const reminder = data?.reminder || null;
  const reminders = Array.isArray(data?.reminders) && data.reminders.length > 0
    ? data.reminders
    : (reminder ? [reminder] : []);

  const greeting =
    account?.company || account?.name || customer?.companyName || customer?.company || customer?.name || 'there';

  const lifecycleStage = normalizeCustomerLifecycle(account?.status || customer?.status);
  const lifecycleBadge = LIFECYCLE_BADGE[lifecycleStage];
  const LifecycleIcon = lifecycleBadge.icon;

  // The portal's account row is the billing identity printed on the invoice.
  const billing = {
    ...customer,
    companyName: account?.company || customer?.companyName || customer?.company || account?.name || 'Customer',
    name: account?.name || customer?.name || 'Customer',
    email: account?.email || customer?.email || '',
    phone: account?.phone || customer?.phone || '',
    gstNo: account?.gstNo || customer?.gstNo || '',
    customerId: account?.customerId || customer?.customerId || ''
  };

  const handleReceiptDownload = (payment) => {
    try {
      // The same ledger row the Receipt tab lists, so both prints agree on the
      // billed total, the booked GST split and any bank instrument reference.
      generateReceiptPdf(toPortalReceiptRow(payment), billing);
    } catch (err) {
      console.warn('Receipt generation failed:', err);
      toast.error('The receipt could not be generated for this invoice.');
    }
  };

  return (
    <div className="flowmail-overview-container animate-fade-in">
      {/* ── 1. Welcome Banner ── */}
      <section className="flowmail-welcome-banner">
        <div className="flowmail-welcome-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 className="flowmail-welcome-title">Hello {greeting}!</h2>
            {data && (
              <span
                title="Account lifecycle status"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: lifecycleBadge.background,
                  color: lifecycleBadge.color,
                  border: `1px solid ${lifecycleBadge.border}`,
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}
              >
                <LifecycleIcon size={13} />
                <span>{customerLifecycleLabel(lifecycleStage)}</span>
              </span>
            )}
            {isEmailVerified ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}
              >
                <CheckCircle2 size={13} color="#059669" />
                <span>Verified Email</span>
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#fffbeb',
                  color: '#b45309',
                  border: '1px solid #fde68a',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}
              >
                <ShieldAlert size={13} color="#d97706" />
                <span>Email Unverified</span>
              </span>
            )}
          </div>
          <p className="flowmail-welcome-sub">
            Manage your products, payments and stay updated with your account.
          </p>
        </div>
      </section>

      {/* ── Primary Email Verification Alert Banner (if unverified) ── */}
      {!isEmailVerified && (
        <section
          className="flowmail-card animate-fade-in"
          style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 1px 3px rgba(245, 158, 11, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#fef3c7',
                border: '1px solid #f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706',
                flexShrink: 0
              }}
            >
              <ShieldAlert size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#92400e' }}>
                Primary Email Verification Required
              </div>
              <div style={{ fontSize: '0.82rem', color: '#b45309', marginTop: '2px' }}>
                Please verify your primary email ({primaryEmail || 'your email'}) via OTP to secure your account.
              </div>
            </div>
          </div>
          {onOpenVerifyEmail && (
            <button
              type="button"
              onClick={onOpenVerifyEmail}
              style={{
                background: '#d97706',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 14px',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)',
                transition: 'background 0.15s ease'
              }}
            >
              <MailCheck size={15} />
              <span>Verify Email Now</span>
            </button>
          )}
        </section>
      )}

      {view.status === 'loading' && (
        <section className="flowmail-state-card">
          <span className="flowmail-state-spinner" />
          <p className="flowmail-state-text">Loading your account…</p>
        </section>
      )}

      {view.status === 'error' && (
        <section className="flowmail-state-card">
          <AlertTriangle size={22} color="#d97706" />
          <p className="flowmail-state-text">{view.error}</p>
          <button type="button" className="flowmail-btn-secondary" onClick={load}>
            Try again
          </button>
        </section>
      )}

      {view.status === 'ready' && (
        <>
          {/* ── 2. Account KPIs ── */}
          <section className="flowmail-kpi-grid" aria-label="Account key figures">
            <KpiCard
              icon={Package}
              label="Active Products"
              value={activeCount}
              note={activeCount > 0 ? `${activeCount} on this account` : 'Nothing subscribed yet'}
              actionLabel="View products"
              onAction={() => goTo('products')}
            />
            <KpiCard
              icon={Sparkles}
              label="Demo Product"
              value={demoCount}
              note={
                demoCount > 0
                  ? (demoProducts[0]?.name ? `${demoProducts[0].name}` : `${demoCount} on this account`)
                  : (hasConvertedDemo ? 'Converted to paid plan' : 'No demo active')
              }
              actionLabel="View demo"
              onAction={() => setIsDemoModalOpen(true)}
              onClick={() => setIsDemoModalOpen(true)}
              isClickable
            />
            <KpiCard
              icon={CreditCard}
              label="Total Paid Amount"
              value={formatINR(kpi.totalPaid || 0)}
              note="Settled against your invoices"
              actionLabel="View receipts"
              onAction={() => goTo('receipt')}
            />
            <KpiCard
              icon={Clock}
              label="Upcoming Renewal"
              value={kpi.renewalDate ? formatDate(kpi.renewalDate) : 'Not set'}
              note={
                kpi.renewalName
                  ? `${kpi.renewalName} · ${dueInWords(kpi.renewalDaysLeft)}`
                  : 'No future expiry recorded'
              }
              actionLabel="View products"
              onAction={() => goTo('products')}
            />
            <KpiCard
              icon={AlertTriangle}
              label="Pending Amount"
              value={formatINR(kpi.totalPending || 0)}
              note={`${kpi.pendingInvoices || 0} open invoice${kpi.pendingInvoices === 1 ? '' : 's'}`}
              actionLabel="Pay now"
              onAction={() => onPay?.({ mode: 'dues', amount: kpi.totalPending || 0 })}
            />
          </section>

          {/* ── 3. Recent Payments + Payment Reminder ── */}
          <section className="flowmail-overview-split flowmail-split-payments">
            <div className="flowmail-card">
              <div className="flowmail-card-header-row">
                <div>
                  <h3 className="flowmail-card-title">Recent Payments</h3>
                  <p className="flowmail-card-subtitle">Latest invoices on your account</p>
                </div>
                <button type="button" className="flowmail-view-all-link" onClick={() => goTo('receipt')}>
                  View All
                </button>
              </div>

              <div className="flowmail-table-wrap">
                <table className="flowmail-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Product</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <span className="flowmail-empty-row">
                            <Inbox size={15} />
                            No payments are linked to this account yet.
                          </span>
                        </td>
                      </tr>
                    ) : (
                      payments.map((payment) => {
                        const isPaid = statusTone(payment.status) === 'active';
                        // An entry the finance desk booked from a bank instrument
                        // says so, so it is never mistaken for a gateway payment.
                        const offline = payment.source === 'manual';
                        return (
                          <tr key={payment.id}>
                            <td>{formatDate(payment.date)}</td>
                            <td className="font-medium text-slate-800">
                              {payment.service}
                              {offline && (
                                <span
                                  style={{
                                    display: 'block',
                                    fontSize: '0.72rem',
                                    fontWeight: 500,
                                    color: '#94a3b8'
                                  }}
                                >
                                  {payment.paymentMethod}
                                  {payment.referenceNumber ? ` · Ref ${payment.referenceNumber}` : ''}
                                  {payment.raisedBy?.name ? ` · booked by ${payment.raisedBy.name}` : ''}
                                </span>
                              )}
                            </td>
                            <td>{formatINR(payment.amount)}</td>
                            <td>
                              <span className={`flowmail-status-badge ${statusTone(payment.status)}`}>
                                {payment.status || 'Unknown'}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="flowmail-receipt-download"
                                onClick={() => handleReceiptDownload(payment)}
                                disabled={!isPaid}
                                title={isPaid ? 'Download receipt' : 'Receipt opens once the payment is received'}
                                aria-label={`Download receipt for ${payment.invoiceNumber || payment.id}`}
                              >
                                <Download size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={`flowmail-card flowmail-reminder-card ${reminders.length ? '' : 'is-clear'}`}>
              <div className="flowmail-card-header-row">
                <div>
                  <h3 className="flowmail-card-title">Payment Reminder</h3>
                  <p className="flowmail-card-subtitle">
                    {reminders.length
                      ? `${reminders.length} item${reminders.length === 1 ? '' : 's'} requiring attention`
                      : 'Nothing outstanding'}
                  </p>
                </div>
              </div>

              {reminders.length > 0 ? (
                <div className="flowmail-reminder-scroll-wrap">
                  {reminders.map((rem, idx) => (
                    <div key={rem.id || rem.invoiceNumber || idx} className="flowmail-reminder-item">
                      <div className="flowmail-reminder-item-header">
                        <span className={`flowmail-reminder-pill ${rem.overdue ? 'is-overdue' : ''}`}>
                          {dueInWords(rem.daysLeft)}
                        </span>
                        <span className="flowmail-reminder-item-amount">{formatINR(rem.amount)}</span>
                      </div>
                      <h4 className="flowmail-reminder-item-title">{rem.title}</h4>
                      <p className="flowmail-reminder-item-meta">
                        {rem.invoiceNumber ? `Invoice ${rem.invoiceNumber}` : 'Subscription renewal'}
                        {rem.dueDate ? ` · Due ${formatDate(rem.dueDate)}` : ''}
                      </p>
                      <div className="flowmail-reminder-item-actions">
                        <button type="button" className="flowmail-btn-primary" onClick={() => payReminder(rem)}>
                          Pay Now
                        </button>
                        <button type="button" className="flowmail-btn-secondary" onClick={() => goTo('receipt')}>
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flowmail-reminder-body flowmail-reminder-clear">
                  <CheckCircle2 size={20} color="#10b981" />
                  <p>
                    {kpi.totalPaid > 0
                      ? 'All invoices on this account are settled. No payment is due right now.'
                      : 'There is nothing due on this account yet.'}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ── 4. Your Products + Quick Actions ── */}
          <section className="flowmail-overview-split flowmail-split-products">
            <div className="flowmail-card">
              <div className="flowmail-card-header-row">
                <div>
                  <h3 className="flowmail-card-title">Your Products</h3>
                  <p className="flowmail-card-subtitle">Subscriptions & contracts</p>
                </div>
                <button type="button" className="flowmail-view-all-link" onClick={() => goTo('products')}>
                  View All
                </button>
              </div>

              <div className="flowmail-product-list">
                {products.length === 0 ? (
                  <p className="flowmail-empty-row">
                    <Inbox size={15} />
                    No products are linked to this account yet.
                  </p>
                ) : (
                  products.map((product) => {
                    const isRawDemo = Boolean(
                      product.isDemoTrial ||
                      product.contractType === 'Trial' ||
                      product.category === 'Trial' ||
                      String(product.status).toUpperCase() === 'DEMO' ||
                      String(product.status).toUpperCase() === 'DEMO-INACTIVE'
                    );
                    const isConverted =
                      Boolean(product.convertedToPaid) ||
                      String(product.status).toUpperCase() === 'CONVERTED' ||
                      String(product.status).toUpperCase() === 'DEMO-INACTIVE' ||
                      (hasPurchasedPaidProduct && isRawDemo);
                    const isDemo = !isConverted && isRawDemo && !product.expired;
                    const metaParts = [
                      product.contractType || product.category || null,
                      isConverted
                        ? 'Converted to paid plan'
                        : product.expiryDate
                        ? `Valid till ${formatDate(product.expiryDate)}`
                        : 'Validity not recorded'
                    ].filter(Boolean);
                    const displayStatus = isConverted
                      ? 'Converted'
                      : product.expired
                      ? 'Expired'
                      : isDemo
                      ? 'Demo Trial'
                      : product.status || 'Active';
                    const badgeTone = isConverted
                      ? 'completed'
                      : product.expired
                      ? 'overdue'
                      : isDemo
                      ? 'due'
                      : 'active';
                    return (
                      <div key={product.id || product.name} className="flowmail-product-row">
                        <span className="flowmail-product-icon">
                          <Package size={16} />
                        </span>
                        <div className="flowmail-product-info">
                          <span className="flowmail-product-name">{product.name}</span>
                          <span className="flowmail-product-meta">{metaParts.join(' · ')}</span>
                        </div>
                        <span className={`flowmail-status-badge ${badgeTone}`}>
                          {displayStatus}
                        </span>
                        <button
                          type="button"
                          className="flowmail-product-open"
                          onClick={() => goTo('products')}
                          aria-label={`Open ${product.name}`}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flowmail-card">
              <div className="flowmail-card-header-row">
                <div>
                  <h3 className="flowmail-card-title">Quick Actions</h3>
                  <p className="flowmail-card-subtitle">Jump straight to a task</p>
                </div>
              </div>

              <div className="flowmail-quick-action-grid">
                <button type="button" className="flowmail-quick-action" onClick={() => onPay?.()}>
                  <CreditCard size={17} />
                  <span>Make Payment</span>
                </button>
                <button type="button" className="flowmail-quick-action" onClick={() => goTo('receipt')}>
                  <FileText size={17} />
                  <span>Download Receipt</span>
                </button>
                <button type="button" className="flowmail-quick-action" onClick={onOpenSupport}>
                  <Headphones size={17} />
                  <span>Raise Support Request</span>
                </button>
                <button type="button" className="flowmail-quick-action" onClick={() => goTo('profile')}>
                  <UserCheck size={17} />
                  <span>Update Profile</span>
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── Demo Product Details Modal ── */}
      <DemoProductDetailsModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        demoProducts={demoProducts}
        customer={customer}
        account={account}
        hasConvertedDemo={hasConvertedDemo}
        onNavigateTab={goTo}
        onOpenSupport={onOpenSupport}
      />
    </div>
  );
}
