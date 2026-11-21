import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Package,
  X,
  ChevronDown,
  Clock,
  Server,
  Calendar,
  UserCheck,
  Activity,
  FileText,
  ShieldCheck,
  Cpu,
  MemoryStick,
  HardDrive,
  Inbox,
  AlertTriangle,
  Users,
  Globe,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { findPrimaryContract, checkClientAdditionalProductEligibility } from '../../../../utils/contractEligibility';
import './ActiveProductsModal.css';

/**
 * Full inventory of every contract on the customer account.
 * Renders all confirmed and active services directly from GET /api/dashboard/me.
 */
function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function dueInWords(daysLeft) {
  if (daysLeft === null || daysLeft === undefined) return 'No due date recorded';
  if (daysLeft < 0) return `Expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'} ago`;
  if (daysLeft === 0) return 'Expires today';
  return `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`;
}

function productState(product) {
  const raw = String(product.status || '').toUpperCase();
  const isDemo = Boolean(
    product.isDemoTrial ||
    raw === 'DEMO' ||
    raw === 'DEMO-INACTIVE' ||
    product.contractType === 'Trial' ||
    product.category === 'Trial' ||
    /demo|trial/i.test(product.name || '')
  );

  if (isDemo) {
    if (product.convertedToPaid || raw === 'CONVERTED' || raw === 'DEMO-INACTIVE') {
      return { label: 'Converted', tone: 'completed' };
    }
    return { label: 'Demo Trial', tone: 'due' };
  }

  if (product.confirmationStatus === 'Pending' || product.adminConfirmed === false) {
    return { label: 'Pending Confirmation', tone: 'due' };
  }

  if (product.expired) return { label: 'Expired', tone: 'overdue' };
  if (['INACTIVE', 'DISABLED', 'CLOSED', 'SUSPENDED', 'PAUSED'].includes(raw)) {
    return { label: 'Inactive', tone: 'completed' };
  }

  // Confirmed purchased products are Active
  return { label: 'Active', tone: 'active' };
}

export default function ActiveProductsModal({
  isOpen,
  onClose,
  products = [],
  account = null,
  onNavigateTab = null,
  initialExpandedId = null
}) {
  const [expandedIds, setExpandedIds] = useState(new Set());

  const primaryContract = findPrimaryContract(products);
  const eligibility = checkClientAdditionalProductEligibility({
    primaryContract,
    contracts: products
  });
  const isRestricted = Boolean(eligibility?.isRestricted || eligibility?.eligible === false);
  const masterExpiryDate = eligibility?.masterExpiryDate || primaryContract?.expiryDate || primaryContract?.endDate;
  const cutOffDate = eligibility?.cutOffDate;

  // Whenever modal opens, auto-expand all items (or the specifically clicked item) so complete details are shown
  useEffect(() => {
    if (!isOpen) return;
    if (initialExpandedId) {
      setExpandedIds(new Set([initialExpandedId]));
    } else {
      const allKeys = new Set(products.map((p, idx) => p.id || p.contractId || idx));
      setExpandedIds(allKeys);
    }
  }, [isOpen, initialExpandedId, products]);

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

  if (!isOpen) return null;

  const isDemoCheck = (p) => Boolean(
    p.isDemoTrial ||
    p.contractType === 'Trial' ||
    p.category === 'Trial' ||
    String(p.status || '').toUpperCase().startsWith('DEMO') ||
    /demo|trial/i.test(p.name || '')
  );

  const isConfirmedActive = (p) =>
    !p.expired &&
    !isDemoCheck(p) &&
    p.adminConfirmed !== false &&
    p.confirmationStatus !== 'Pending' &&
    !['inactive', 'disabled', 'closed', 'suspended', 'paused'].includes(String(p.status || '').toLowerCase());

  const counts = {
    total: products.length,
    active: products.filter(isConfirmedActive).length,
    pending: products.filter((p) => !isDemoCheck(p) && (p.confirmationStatus === 'Pending' || p.adminConfirmed === false)).length,
    demo: products.filter((p) => isDemoCheck(p)).length,
    expired: products.filter((p) => p.expired).length
  };

  const toggleExpand = (itemId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const isAllExpanded = products.length > 0 && expandedIds.size === products.length;

  const toggleAll = () => {
    if (isAllExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(products.map((p, idx) => p.id || p.contractId || idx)));
    }
  };

  const modalContent = (
    <div className="demo-details-overlay apm-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="demo-details-modal apm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="demo-details-header apm-header">
          <div className="demo-details-header-left">
            <div className="apm-badge-row">
              <span className="apm-badge">
                <Package size={13} />
                <span>Product Inventory</span>
              </span>
              <span className="apm-total-count-badge">
                {counts.total} {counts.total === 1 ? 'Subscription' : 'Subscriptions'}
              </span>
            </div>
            <h2 className="demo-details-title apm-title">Your Active Products</h2>
            <p className="demo-details-subtitle apm-subtitle">
              Every contract, trial and subscription linked to{' '}
              <strong>{account?.company || account?.name || 'your account'}</strong> — served live from the portal API.
            </p>
          </div>
          <button
            type="button"
            className="demo-details-close-btn apm-close-btn"
            onClick={onClose}
            aria-label="Close modal"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Summary strip with Expand/Collapse toggle */}
        {products.length > 0 && (
          <div className="apm-summary-strip">
            <span className="apm-summary-chip is-total">
              <strong>{counts.total}</strong> Total
            </span>
            <span className="apm-summary-chip is-ok">
              <span className="apm-chip-dot" />
              <strong>{counts.active}</strong> Active
            </span>
            {counts.pending > 0 && (
              <span className="apm-summary-chip is-pending">
                <span className="apm-chip-dot pending" />
                <strong>{counts.pending}</strong> Pending Confirmation
              </span>
            )}
            {counts.demo > 0 && (
              <span className="apm-summary-chip is-demo">
                <strong>{counts.demo}</strong> Demo
              </span>
            )}
            {counts.expired > 0 && (
              <span className="apm-summary-chip is-expired">
                <strong>{counts.expired}</strong> Expired
              </span>
            )}

            {products.length > 0 && (
              <button
                type="button"
                className="apm-expand-toggle-btn"
                onClick={toggleAll}
                title={isAllExpanded ? "Collapse all specifications" : "Expand all specifications"}
              >
                {isAllExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                <span>{isAllExpanded ? 'Collapse All' : 'Expand All'}</span>
              </button>
            )}
          </div>
        )}

        {/* 15-Day Cut-off Purchase Restriction Banner */}
        {primaryContract && isRestricted && (
          <div className="flowmail-cutoff-warning-banner" style={{ margin: '14px 24px 0' }}>
            <div className="flowmail-cutoff-warning-header">
              <AlertTriangle size={17} color="#d97706" />
              <strong>Additional Product Purchases Restricted (15-Day Cut-off)</strong>
            </div>
            <p className="flowmail-cutoff-warning-msg">
              Additional product purchases are unavailable during the last 15 days of your current contract. Please renew your existing contract to add more products.
            </p>
            <div className="flowmail-cutoff-dates-row">
              <span><strong>Contract Expiry Date:</strong> {formatDate(masterExpiryDate)}</span>
              {cutOffDate && <span><strong>Purchases Restricted From:</strong> {formatDate(cutOffDate)}</span>}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="demo-details-body apm-body">
          {products.length === 0 ? (
            <div className="demo-empty-state">
              <div className="demo-empty-icon-wrap" style={{ background: '#eef2ff' }}>
                <Inbox size={36} color="#6366f1" />
              </div>
              <h3 className="demo-empty-title">No Products On This Account</h3>
              <p className="demo-empty-text">
                Nothing is subscribed yet. Explore our cloud server plans and software
                subscriptions to provision your first product.
              </p>
            </div>
          ) : (
            <div className="apm-product-list">
              {products.map((product, index) => {
                const state = productState(product);
                const itemId = product.id || product.contractId || index;
                const isExpanded = expandedIds.has(itemId);
                const effectiveExpiry = (!isDemoCheck(product) && masterExpiryDate) ? masterExpiryDate : product.expiryDate;
                const specCount = [
                  product.contractId,
                  product.contractType || product.category,
                  product.startDate,
                  effectiveExpiry,
                  product.users,
                  product.cores,
                  product.ram,
                  product.storage,
                  product.serverNode || product.serverConfiguration,
                  product.ipAddress || product.wanIp,
                  product.slaTier,
                  product.salesPerson
                ].filter(Boolean).length;

                return (
                  <div
                    key={itemId}
                    className={`apm-product-card ${isExpanded ? 'is-expanded' : ''} ${product.expired ? 'is-expired' : ''}`}
                  >
                    {/* Collapsed header row */}
                    <button
                      type="button"
                      className="apm-product-head"
                      onClick={() => toggleExpand(itemId)}
                      aria-expanded={isExpanded}
                    >
                      <span className="apm-product-icon">
                        <Server size={17} />
                      </span>
                      <div className="apm-product-titlebox">
                        <span className="apm-product-name">{product.name || product.service || 'Subscription'}</span>
                        <span className="apm-product-sub">
                          {product.subscriptionPeriod ? `${product.subscriptionPeriod} · ` : ''}
                          {effectiveExpiry ? `Valid till ${formatDate(effectiveExpiry)}` : 'Validity not recorded'}
                          {' · '}
                          <span className="apm-spec-count">{specCount} specifications</span>
                        </span>
                      </div>
                      <div className="apm-product-side">
                        {product.amountLabel || product.amount != null ? (
                          <span className="apm-product-amount">
                            {product.amountLabel || `₹${Number(product.amount).toLocaleString('en-IN')}`}
                          </span>
                        ) : null}
                        <span className={`apm-status-pill tone-${state.tone}`}>
                          <span className="apm-status-dot" />
                          {state.label}
                        </span>
                        <ChevronDown size={16} className="apm-chevron" />
                      </div>
                    </button>

                    {/* Expanded detail grid — complete specifications */}
                    {isExpanded && (
                      <div className="apm-product-detail">
                        <div className="demo-section-heading apm-heading">
                          <Activity size={15} />
                          <span>Contract &amp; Specification Details</span>
                        </div>

                        <div className="demo-specs-grid">
                          {product.contractId && (
                            <div className="demo-spec-item">
                              <span className="demo-spec-label">Contract Reference</span>
                              <span className="demo-spec-value mono">{product.contractId}</span>
                            </div>
                          )}
                          {(product.contractType || product.category) && (
                            <div className="demo-spec-item">
                              <span className="demo-spec-label">Contract Type / Category</span>
                              <span className="demo-spec-value highlight">
                                {[product.contractType, product.category].filter(Boolean).join(' · ')}
                              </span>
                            </div>
                          )}
                          {product.users && (
                            <div className="demo-spec-item">
                              <span className="demo-spec-label">User Licenses</span>
                              <span className="demo-spec-value">
                                <Users size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                                {product.users} {Number(product.users) === 1 ? 'User' : 'Users'}
                              </span>
                            </div>
                          )}
                          {product.subscriptionPeriod && (
                            <div className="demo-spec-item">
                              <span className="demo-spec-label">Subscription Period</span>
                              <span className="demo-spec-value">
                                <Clock size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                                {product.subscriptionPeriod}
                              </span>
                            </div>
                          )}
                          {product.startDate && (
                            <div className="demo-spec-item">
                              <span className="demo-spec-label">Start Date</span>
                              <span className="demo-spec-value">
                                <Calendar size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                                {formatDate(product.startDate)}
                              </span>
                            </div>
                          )}
                          {effectiveExpiry && (
                            <div className="demo-spec-item">
                              <span className="demo-spec-label">Expiry / Valid Till</span>
                              <span className="demo-spec-value">
                                <Calendar size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                                {formatDate(effectiveExpiry)}
                              </span>
                            </div>
                          )}
                          {product.daysLeft != null && (
                            <div className={`demo-spec-item apm-days ${product.expired ? 'is-late' : ''}`}>
                              <span className="demo-spec-label">Validity Status</span>
                              <span className="demo-spec-value">{dueInWords(product.daysLeft)}</span>
                            </div>
                          )}
                          {(product.amountLabel || product.amount != null) && (
                            <div className="demo-spec-item">
                              <span className="demo-spec-label">Contract Value</span>
                              <span className="demo-spec-value badge-free">
                                {product.amountLabel || `₹${Number(product.amount).toLocaleString('en-IN')}`}
                              </span>
                            </div>
                          )}
                          {(product.cores || product.ram || product.storage) && (
                            <div className="demo-spec-item">
                              <span className="demo-spec-label">Compute Allocation</span>
                              <span className="demo-spec-value">
                                <Cpu size={13} style={{ verticalAlign: '-2px', margin: '0 2px 0 0' }} />
                                {product.cores || '—'}
                                <MemoryStick size={13} style={{ verticalAlign: '-2px', margin: '0 2px 0 8px' }} />
                                {product.ram || '—'}
                                <HardDrive size={13} style={{ verticalAlign: '-2px', margin: '0 2px 0 8px' }} />
                                {product.storage || '—'}
                              </span>
                            </div>
                          )}
                          {(product.serverNode || product.serverConfiguration) && (
                            <div className="demo-spec-item">
                              <span className="demo-spec-label">Server / Node</span>
                              <span className="demo-spec-value">
                                <Server size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                                {product.serverNode || product.serverConfiguration}
                              </span>
                            </div>
                          )}
                          {(product.ipAddress || product.wanIp || product.lanIp) && (
                            <div className="demo-spec-item">
                              <span className="demo-spec-label">IP &amp; Access Point</span>
                              <span className="demo-spec-value mono">
                                <Globe size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                                {product.ipAddress || product.wanIp || product.lanIp}
                                {product.rdpPort ? `:${product.rdpPort}` : ''}
                              </span>
                            </div>
                          )}
                          {product.slaTier && (
                            <div className="demo-spec-item">
                              <span className="demo-spec-label">SLA Tier</span>
                              <span className="demo-spec-value">
                                <ShieldCheck size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                                {product.slaTier}
                              </span>
                            </div>
                          )}
                          {product.salesPerson && (
                            <div className="demo-spec-item">
                              <span className="demo-spec-label">Sales Representative</span>
                              <span className="demo-spec-value">
                                <UserCheck size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                                {product.salesPerson}
                              </span>
                            </div>
                          )}
                          <div className="demo-spec-item">
                            <span className="demo-spec-label">Lifecycle Status</span>
                            <span className="demo-spec-value highlight">{state.label}</span>
                          </div>
                        </div>

                        {product.description && (
                          <div className="demo-description-box">
                            <div className="demo-description-title">
                              <FileText size={14} />
                              <span>Scope &amp; Provisioning Notes</span>
                            </div>
                            <p className="demo-description-text">{product.description}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
