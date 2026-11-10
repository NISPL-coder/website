import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  RefreshCw,
  Check,
  RotateCcw,
  Trash2,
  X,
  Inbox,
  CreditCard,
  Users,
  FileText,
  Clock,
  Package,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  AlertTriangle,
  CheckCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import DateRangeFilter from './DateRangeFilter';
import {
  getNotificationMeta,
  formatTimeAgo
} from './NotificationPopover';
import { notificationApi } from '../../../services/notificationApi';
import './NotificationsSection.css';

const CATEGORY_TABS = [
  { id: 'all', label: 'All', icon: Inbox },
  { id: 'payment', label: 'Payments', icon: CreditCard },
  { id: 'customer', label: 'Customers', icon: Users },
  { id: 'contract', label: 'Contracts', icon: FileText },
  { id: 'renewal', label: 'Renewals', icon: Clock },
  { id: 'product', label: 'Products', icon: Package },
  { id: 'staff', label: 'Staff', icon: UserCheck },
  { id: 'system', label: 'System', icon: Settings }
];

const SEVERITY_STYLES = {
  info: { bg: '#eff6ff', color: '#2563eb', label: 'Info' },
  success: { bg: '#f0fdf4', color: '#16a34a', label: 'Success' },
  warning: { bg: '#fffbeb', color: '#d97706', label: 'Warning' },
  error: { bg: '#fef2f2', color: '#dc2626', label: 'Critical' }
};

const ENTITY_ROUTES = {
  customer: '/admin/customer',
  contract: '/admin/customer/contract',
  payment: '/admin/customer/payment',
  product: '/admin/product',
  receipt: '/admin/receipt',
  user: '/admin/user-access',
  admin: '/admin/user-access'
};

const PAGE_SIZES = [20, 50, 100];
const AUTO_REFRESH_MS = 30000;

const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatMetaValue = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  const asDate = new Date(value);
  if (!/^\d+$/.test(String(value)) && !Number.isNaN(asDate.getTime()) && asDate.getFullYear() > 1970) {
    return formatDateTime(value);
  }
  return String(value);
};

const humanizeKey = (key) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());

export default function NotificationsSection({ focusId }) {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1, limit: 20, unreadCount: 0 });
  const [stats, setStats] = useState({ total: 0, unread: 0, byCategory: {} });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [readState, setReadState] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [expandedId, setExpandedId] = useState(null);
  const focusedRef = useRef('');

  // Typing should not spam the API.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadPage = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setIsLoading(true);
      setIsRefreshing(true);
      try {
        const [paged, liveStats] = await Promise.all([
          notificationApi.getPage({
            page,
            limit,
            category,
            read: readState === 'all' ? '' : readState === 'unread' ? 'false' : 'true',
            search,
            from: dateFrom,
            to: dateTo
          }),
          notificationApi.getStats()
        ]);

        setRows(paged.notifications);
        setMeta({
          total: paged.total,
          page: paged.page,
          pages: paged.pages,
          limit: paged.limit,
          unreadCount: paged.unreadCount
        });
        setStats(liveStats);
        setLoadError('');
      } catch (err) {
        setLoadError(
          'The notification service is unreachable, so this page is showing nothing rather than stored data.'
        );
        console.warn('[notifications] load failed:', err.message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [page, limit, category, readState, search, dateFrom, dateTo]
  );

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  // Keep the stream moving while the page is open.
  useEffect(() => {
    const timer = setInterval(() => loadPage({ silent: true }), AUTO_REFRESH_MS);
    return () => clearInterval(timer);
  }, [loadPage]);

  // A bell click deep-links here with the notification to reveal.
  useEffect(() => {
    if (!focusId || isLoading) return;
    const target = rows.find((row) => (row._id || row.id) === focusId);
    if (!target || focusedRef.current === focusId) return;
    focusedRef.current = focusId;
    setExpandedId(target._id || target.id);
  }, [focusId, isLoading, rows]);

  useEffect(() => {
    if (!expandedId) return;
    document
      .getElementById(`nts-item-${expandedId}`)
      ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [expandedId]);

  const handleMarkRead = async (item, nextRead) => {
    const id = item._id || item.id;
    setRows((prev) => prev.map((row) => ((row._id || row.id) === id ? { ...row, read: nextRead } : row)));
    setMeta((prev) => ({
      ...prev,
      unreadCount: Math.max(0, prev.unreadCount + (nextRead ? -1 : 1))
    }));
    setStats((prev) => ({ ...prev, unread: Math.max(0, prev.unread + (nextRead ? -1 : 1)) }));

    try {
      if (nextRead) await notificationApi.markAsRead(id);
      else await notificationApi.markAsUnread(id);
    } catch (err) {
      toast.error('Could not update the notification on the server.');
      loadPage({ silent: true });
    }
  };

  const handleDelete = async (item) => {
    const id = item._id || item.id;
    setRows((prev) => prev.filter((row) => (row._id || row.id) !== id));
    setExpandedId((prev) => (prev === id ? null : prev));
    try {
      await notificationApi.deleteNotification(id);
      toast.success('Notification removed');
      loadPage({ silent: true });
    } catch (err) {
      toast.error('Could not delete the notification on the server.');
      loadPage({ silent: true });
    }
  };

  const handleMarkAllRead = async () => {
    setRows((prev) => prev.map((row) => ({ ...row, read: true })));
    await notificationApi.markAllAsRead();
    toast.success('All notifications marked as read');
    loadPage({ silent: true });
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete every notification for this account? This cannot be undone.')) return;
    setRows([]);
    setExpandedId(null);
    await notificationApi.clearAll();
    toast.success('Notification stream cleared');
    loadPage({ silent: true });
  };

  const goToEntity = (item) => {
    const path = ENTITY_ROUTES[item.entityType];
    if (!path) return;
    navigate(path, { state: { focusId: item.entityId } });
  };

  const statCards = useMemo(
    () => [
      { label: 'Total Notifications', value: stats.total, icon: Bell, bg: '#eff6ff', color: '#2563eb' },
      { label: 'Unread', value: stats.unread, icon: AlertTriangle, bg: '#fff7ed', color: '#f97316' },
      { label: 'Payment Events', value: stats.byCategory.payment || 0, icon: CreditCard, bg: '#f0fdf4', color: '#16a34a' },
      { label: 'Renewals Due', value: stats.byCategory.renewal || 0, icon: Clock, bg: '#fffbeb', color: '#d97706' }
    ],
    [stats]
  );

  const rangeStart = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const rangeEnd = meta.total === 0 ? 0 : Math.min(meta.total, meta.page * meta.limit);

  return (
    <div className="nts-section-wrapper animate-fade-in">
      <div className="nts-header-bar">
        <div className="nts-header-left">
          <div className="nts-header-icon-box">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="nts-header-title">Notifications</h1>
            <p className="nts-header-subtitle">
              View all customer, contract, payment and staff events.
            </p>
          </div>
        </div>

        <div className="nts-header-actions">
          {meta.unreadCount > 0 && (
            <button type="button" className="nts-btn-outline" onClick={handleMarkAllRead}>
              <CheckCheck size={15} />
              <span>Mark all read</span>
            </button>
          )}
          {stats.total > 0 && (
            <button type="button" className="nts-btn-outline nts-btn-danger" onClick={handleClearAll}>
              <Trash2 size={15} />
              <span>Clear all</span>
            </button>
          )}
          <button
            type="button"
            className="nts-btn-primary"
            onClick={() => loadPage({ silent: true })}
            disabled={isRefreshing}
          >
            <RefreshCw size={15} className={isRefreshing ? 'usr-spinner' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      <div className="nts-stats-grid">
        {statCards.map((card) => (
          <div className="nts-stat-card" key={card.label}>
            <div
              className="nts-stat-icon-box"
              style={{ background: card.bg, color: card.color }}
            >
              <card.icon size={19} />
            </div>
            <div>
              <div className="nts-stat-value">{card.value}</div>
              <div className="nts-stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="nts-tabs-bar">
        {CATEGORY_TABS.map((tab) => {
          const count = tab.id === 'all' ? stats.total : stats.byCategory[tab.id] || 0;
          return (
            <button
              key={tab.id}
              type="button"
              className={`nts-tab ${category === tab.id ? 'active' : ''}`}
              onClick={() => {
                setCategory(tab.id);
                setPage(1);
              }}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
              <em>{count}</em>
            </button>
          );
        })}
      </div>

      <div className="nts-toolbar">
        <div className="nts-search-box">
          <Search size={16} className="nts-search-icon" />
          <input
            type="text"
            className="nts-search-input"
            placeholder="Search title, message, customer, company, email or reference..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button type="button" className="nts-search-clear" onClick={() => setSearchInput('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="nts-toolbar-filters">
          <DateRangeFilter
            from={dateFrom}
            to={dateTo}
            onChange={(nextFrom, nextTo) => {
              setDateFrom(nextFrom);
              setDateTo(nextTo);
              setPage(1);
            }}
          />

          <select
            className="nts-filter-select"
            value={readState}
            onChange={(e) => {
              setReadState(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">Read &amp; unread</option>
            <option value="unread">Unread only</option>
            <option value="read">Read only</option>
          </select>

          <select
            className="nts-filter-select"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadError && (
        <div className="nts-error-banner">
          <AlertTriangle size={16} />
          <span>{loadError}</span>
        </div>
      )}

      <div className="nts-list-card">
        {isLoading ? (
          <div className="nts-loading-state">
            <RefreshCw size={20} className="usr-spinner" />
            <span>Loading live notification stream...</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="nts-empty-state">
            <div className="nts-empty-icon">
              <Inbox size={24} />
            </div>
            <div className="nts-empty-title">No notifications match these filters</div>
            <div className="nts-empty-hint">
              {search || dateFrom || dateTo || category !== 'all' || readState !== 'all'
                ? 'Clear the search, date range or category filter to see the full stream.'
                : 'The platform has not raised any events yet.'}
            </div>
          </div>
        ) : (
          rows.map((item) => {
            const id = item._id || item.id;
            const metaInfo = getNotificationMeta(item);
            const IconComponent = metaInfo.icon;
            const severity = SEVERITY_STYLES[item.severity] || SEVERITY_STYLES.info;
            const chips = [
              item.user?.company,
              item.user?.name,
              item.user?.email,
              item.entityId,
              item.metadata?.invoiceNumber || item.metadata?.invoiceRef,
              item.metadata?.amount,
              item.metadata?.contractCode,
              item.metadata?.expiryDate || item.metadata?.expectedPaymentDate
            ].filter(Boolean);

            const detailFields = [
              { label: 'Event type', value: item.type },
              { label: 'Severity', value: severity.label },
              {
                label: 'Related record',
                value: `${item.entityType || 'other'}${item.entityId ? ` · ${item.entityId}` : ''}`
              },
              {
                label: 'Status',
                value: item.read
                  ? item.readAt
                    ? `Read on ${formatDateTime(item.readAt)}`
                    : 'Read'
                  : 'Unread'
              },
              { label: 'Person', value: item.user?.name },
              { label: 'Company', value: item.user?.company },
              { label: 'Email', value: item.user?.email, wide: true }
            ];

            const isExpanded = expandedId === id;

            return (
              <article
                key={id}
                id={`nts-item-${id}`}
                className={`nts-item ${item.read ? '' : 'is-unread'} ${isExpanded ? 'is-expanded' : ''}`}
                onClick={() => setExpandedId((prev) => (prev === id ? null : id))}
                aria-expanded={isExpanded}
              >
                <div
                  className="nts-item-icon"
                  style={{ color: metaInfo.color, backgroundColor: metaInfo.bg }}
                >
                  <IconComponent size={18} strokeWidth={2.2} />
                </div>

                <div className="nts-item-body">
                  <div className="nts-item-top">
                    <div className="nts-item-heading">
                      <h3 className="nts-item-title">{item.title}</h3>
                      <span className={`nts-tag ${metaInfo.badgeClass}`}>{metaInfo.badge}</span>
                      <span className="nts-tag nts-severity" style={{ background: severity.bg, color: severity.color }}>
                        {severity.label}
                      </span>
                      {!item.read && <span className="nts-tag nts-tag-unread">New</span>}
                    </div>
                    <div className="nts-item-time" title={formatDateTime(item.createdAt)}>
                      {formatTimeAgo(item.createdAt)}
                    </div>
                  </div>

                  {/* The complete message, never truncated */}
                  <p className="nts-item-message">{item.message}</p>

                  {chips.length > 0 && (
                    <div className="nts-item-chips">
                      {chips.map((chip, index) => (
                        <span className="nts-chip" key={`${chip}-${index}`}>
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}

                  {isExpanded && (
                    <div className="nts-item-details">
                      <div className="nts-detail-grid">
                        {detailFields.map((field) => (
                          <div
                            className={`nts-detail-field ${field.wide ? 'nts-detail-field-wide' : ''}`}
                            key={field.label}
                          >
                            <div className="nts-detail-label">{field.label}</div>
                            <div className="nts-detail-val">{formatMetaValue(field.value)}</div>
                          </div>
                        ))}
                      </div>

                      {Object.keys(item.metadata || {}).length > 0 && (
                        <div className="nts-detail-block">
                          <div className="nts-detail-label">Event details</div>
                          <div className="nts-meta-table">
                            {Object.entries(item.metadata).map(([key, value]) => (
                              <div className="nts-meta-row" key={key}>
                                <span className="nts-meta-key">{humanizeKey(key)}</span>
                                <span className="nts-meta-val">{formatMetaValue(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className={`nts-item-caret ${isExpanded ? 'is-open' : ''}`}>
                  <ChevronDown size={16} />
                </div>

                <div className="nts-item-actions" onClick={(e) => e.stopPropagation()}>
                  {ENTITY_ROUTES[item.entityType] && (
                    <button
                      type="button"
                      className="nts-row-btn"
                      title={`Open ${item.entityType} records`}
                      onClick={() => goToEntity(item)}
                    >
                      <ExternalLink size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="nts-row-btn"
                    title={item.read ? 'Mark as unread' : 'Mark as read'}
                    onClick={() => handleMarkRead(item, !item.read)}
                  >
                    {item.read ? <RotateCcw size={14} /> : <Check size={14} />}
                  </button>
                  <button
                    type="button"
                    className="nts-row-btn nts-row-btn-danger"
                    title="Delete notification"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      {meta.total > 0 && (
        <div className="nts-pagination-bar">
          <span className="nts-range-text">
            Showing {rangeStart}&ndash;{rangeEnd} of {meta.total} notifications
            {meta.unreadCount > 0 ? ` · ${meta.unreadCount} unread` : ''}
          </span>

          <div className="nts-pager">
            <button
              type="button"
              className="nts-pager-btn"
              disabled={meta.page <= 1 || isRefreshing}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeft size={15} />
              <span>Previous</span>
            </button>
            <span className="nts-pager-page">
              Page {meta.page} of {meta.pages}
            </span>
            <button
              type="button"
              className="nts-pager-btn"
              disabled={meta.page >= meta.pages || isRefreshing}
              onClick={() => setPage((prev) => prev + 1)}
            >
              <span>Next</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
