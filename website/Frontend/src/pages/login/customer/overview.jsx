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
  Inbox
} from 'lucide-react';
import toast from 'react-hot-toast';
import { dashboardApi } from '../../../services/dashboardApi';
import { generateReceiptPdf } from '../../Dashboard/utils/generateReceiptPdf';
import { toPortalReceiptRow } from '../../Dashboard/utils/portalReceiptRows';
import { formatINR } from '../../../utils/formatters';

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

function KpiCard({ icon: Icon, label, value, note, actionLabel, onAction }) {
  return (
    <div className="flowmail-kpi-card">
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
          <button type="button" className="flowmail-kpi-link" onClick={onAction}>
            <span>{actionLabel}</span>
            <ChevronRight size={13} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function CloudPortalOverview({ customer, portalData = null, onNavigateTab, onOpenSupport }) {
  const [view, setView] = useState(() => ({
    status: portalData ? 'ready' : 'loading',
    data: portalData || null,
    error: ''
  }));

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

  const data = view.data;
  const account = data?.account || {};
  const kpi = data?.kpi || {};
  const payments = (data?.recentPayments && data.recentPayments.length > 0)
    ? data.recentPayments
    : (data?.payments || []);
  const products = data?.products || [];
  const reminder = data?.reminder || null;
  const reminders = Array.isArray(data?.reminders) && data.reminders.length > 0
    ? data.reminders
    : (reminder ? [reminder] : []);

  const greeting =
    account?.company || account?.name || customer?.companyName || customer?.company || customer?.name || 'there';

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
          <h2 className="flowmail-welcome-title">Hello {greeting}!</h2>
          <p className="flowmail-welcome-sub">
            Manage your products, payments and stay updated with your account.
          </p>
        </div>
      </section>

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
              value={kpi.activeProducts ?? 0}
              note={products.length ? `${products.length} on this account` : 'Nothing subscribed yet'}
              actionLabel="View products"
              onAction={() => goTo('products')}
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
              onAction={() => goTo('payment')}
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
                        <button type="button" className="flowmail-btn-primary" onClick={() => goTo('payment')}>
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
                    const metaParts = [
                      product.contractType || product.category || null,
                      product.expiryDate ? `Valid till ${formatDate(product.expiryDate)}` : 'Validity not recorded'
                    ].filter(Boolean);
                    return (
                      <div key={product.id || product.name} className="flowmail-product-row">
                        <span className="flowmail-product-icon">
                          <Package size={16} />
                        </span>
                        <div className="flowmail-product-info">
                          <span className="flowmail-product-name">{product.name}</span>
                          <span className="flowmail-product-meta">{metaParts.join(' · ')}</span>
                        </div>
                        <span className={`flowmail-status-badge ${product.expired ? 'overdue' : 'active'}`}>
                          {product.expired ? 'Expired' : product.status || 'Active'}
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
                <button type="button" className="flowmail-quick-action" onClick={() => goTo('payment')}>
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
    </div>
  );
}
