import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  CreditCard,
  UserPlus,
  UserCheck,
  UserMinus,
  FilePlus,
  FileText,
  FileX,
  Package,
  RefreshCw,
  Clock,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import './NotificationPopover.css';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

const getNotificationMeta = (item) => {
  const type = item.type || 'system';

  switch (type) {
    case 'payment_received':
    case 'payment_created':
      return {
        icon: CreditCard,
        color: '#10b981',
        bg: '#ecfdf5',
        badge: 'Payment Received',
        badgeClass: 'adm-notif-tag-payment'
      };
    case 'payment_updated':
      return {
        icon: RefreshCw,
        color: '#06b6d4',
        bg: '#ecfeff',
        badge: 'Payment Updated',
        badgeClass: 'adm-notif-tag-cyan'
      };
    case 'payment_deleted':
      return {
        icon: Trash2,
        color: '#ef4444',
        bg: '#fef2f2',
        badge: 'Payment Removed',
        badgeClass: 'adm-notif-tag-danger'
      };
    case 'contract_renewal':
      return {
        icon: Clock,
        color: '#f59e0b',
        bg: '#fffbeb',
        badge: 'Renewal Due',
        badgeClass: 'adm-notif-tag-amber'
      };
    case 'customer_created':
      return {
        icon: UserPlus,
        color: '#3b82f6',
        bg: '#eff6ff',
        badge: 'Customer Created',
        badgeClass: 'adm-notif-tag-customer'
      };
    case 'customer_updated':
      return {
        icon: UserCheck,
        color: '#f59e0b',
        bg: '#fffbeb',
        badge: 'Customer Updated',
        badgeClass: 'adm-notif-tag-amber'
      };
    case 'customer_deleted':
      return {
        icon: UserMinus,
        color: '#ef4444',
        bg: '#fef2f2',
        badge: 'Customer Deleted',
        badgeClass: 'adm-notif-tag-danger'
      };
    case 'contract_created':
      return {
        icon: FilePlus,
        color: '#6366f1',
        bg: '#eef2ff',
        badge: 'Contract Created',
        badgeClass: 'adm-notif-tag-contract'
      };
    case 'contract_updated':
      return {
        icon: FileText,
        color: '#8b5cf6',
        bg: '#f5f3ff',
        badge: 'Contract Updated',
        badgeClass: 'adm-notif-tag-purple'
      };
    case 'contract_deleted':
      return {
        icon: FileX,
        color: '#ef4444',
        bg: '#fef2f2',
        badge: 'Contract Deleted',
        badgeClass: 'adm-notif-tag-danger'
      };
    case 'product_created':
    case 'product_updated':
    case 'product_deleted':
      return {
        icon: Package,
        color: '#06b6d4',
        bg: '#ecfeff',
        badge: 'Product Catalog',
        badgeClass: 'adm-notif-tag-cyan'
      };
    default:
      return {
        icon: Bell,
        color: '#64748b',
        bg: '#f8fafc',
        badge: 'System Notice',
        badgeClass: 'adm-notif-tag-gray'
      };
  }
};

export default function NotificationPopover({
  isOpen,
  onClose,
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onRefresh,
  isLoading = false
}) {
  const popoverRef = useRef(null);
  const [activeTab, setActiveTab] = useState('all');

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        if (e.target.closest('.adm-header-icon-btn')) return;
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Filtered notifications based on active tab
  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter((n) => !n.read);
      case 'payment':
        return notifications.filter((n) => (n.type || '').includes('payment'));
      case 'customer':
        return notifications.filter((n) => (n.type || '').includes('customer'));
      case 'contract':
        return notifications.filter((n) => (n.type || '').includes('contract') && n.type !== 'contract_renewal');
      case 'renewal':
        return notifications.filter((n) => n.type === 'contract_renewal' || (n.title || '').toLowerCase().includes('renewal'));
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="adm-notif-popover animate-fade-in" ref={popoverRef} role="dialog" aria-label="Notifications">
      {/* Popover Header */}
      <div className="adm-notif-header">
        <div className="adm-notif-header-left">
          <div className="adm-notif-header-title-row">
            <span className="adm-notif-title">Notifications</span>
            {unreadCount > 0 ? (
              <span className="adm-notif-new-pill">{unreadCount} New</span>
            ) : (
              <span className="adm-notif-all-read-pill">All caught up</span>
            )}
          </div>
        </div>

        <div className="adm-notif-header-actions">
          {onRefresh && (
            <button
              type="button"
              className={`adm-notif-action-btn ${isLoading ? 'is-spinning' : ''}`}
              title="Refresh notifications"
              onClick={onRefresh}
            >
              <RefreshCw size={14} />
            </button>
          )}

          {unreadCount > 0 && onMarkAllAsRead && (
            <button
              type="button"
              className="adm-notif-action-btn"
              title="Mark all as read"
              onClick={onMarkAllAsRead}
            >
              <CheckCheck size={15} />
            </button>
          )}

          {notifications.length > 0 && onClearAll && (
            <button
              type="button"
              className="adm-notif-action-btn adm-notif-action-btn-danger"
              title="Clear all notifications"
              onClick={onClearAll}
            >
              <Trash2 size={14} />
            </button>
          )}

          <button
            type="button"
            className="adm-notif-action-btn"
            title="Close"
            onClick={onClose}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="adm-notif-tabs">
        <button
          type="button"
          className={`adm-notif-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          className={`adm-notif-tab ${activeTab === 'unread' ? 'active' : ''}`}
          onClick={() => setActiveTab('unread')}
        >
          Unread ({unreadCount})
        </button>
        <button
          type="button"
          className={`adm-notif-tab ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          Payments
        </button>
        <button
          type="button"
          className={`adm-notif-tab ${activeTab === 'customer' ? 'active' : ''}`}
          onClick={() => setActiveTab('customer')}
        >
          Customers
        </button>
        <button
          type="button"
          className={`adm-notif-tab ${activeTab === 'contract' ? 'active' : ''}`}
          onClick={() => setActiveTab('contract')}
        >
          Contracts
        </button>
        <button
          type="button"
          className={`adm-notif-tab ${activeTab === 'renewal' ? 'active' : ''}`}
          onClick={() => setActiveTab('renewal')}
        >
          Renewals
        </button>
      </div>

      {/* Notifications List */}
      <div className="adm-notif-list">
        {filteredNotifications.length === 0 ? (
          <div className="adm-notif-empty">
            <div className="adm-notif-empty-icon">
              <Sparkles size={22} />
            </div>
            <span className="adm-notif-empty-title">No notifications here</span>
            <span className="adm-notif-empty-hint">
              {activeTab === 'unread'
                ? "You've caught up with all latest updates."
                : 'No recent activity matching this filter.'}
            </span>
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const meta = getNotificationMeta(item);
            const IconComponent = meta.icon;
            const timeAgo = formatTimeAgo(item.createdAt);

            return (
              <div
                key={item._id || item.id}
                className={`adm-notif-item ${!item.read ? 'is-unread' : ''}`}
                onClick={() => {
                  if (!item.read && onMarkAsRead) {
                    onMarkAsRead(item._id || item.id);
                  }
                }}
              >
                {/* Left Icon with category color */}
                <div
                  className="adm-notif-item-icon"
                  style={{ color: meta.color, backgroundColor: meta.bg }}
                >
                  <IconComponent size={16} strokeWidth={2.2} />
                </div>

                {/* Main Content */}
                <div className="adm-notif-item-content">
                  <div className="adm-notif-item-top">
                    <div className="adm-notif-item-heading">
                      <span className="adm-notif-item-title">{item.title}</span>
                      <span className={`adm-notif-item-tag ${meta.badgeClass}`}>
                        {meta.badge}
                      </span>
                    </div>
                    <span className="adm-notif-item-time">{timeAgo}</span>
                  </div>

                  {/* Detailed Description */}
                  <p className="adm-notif-item-desc">{item.message}</p>

                  {/* Metadata Chips (e.g. from which user / customer, amount, ref) */}
                  <div className="adm-notif-item-meta-chips">
                    {item.user?.company && (
                      <span className="adm-notif-chip">
                        {item.user.company}
                      </span>
                    )}
                    {item.user?.name && !item.user.company && (
                      <span className="adm-notif-chip">
                        {item.user.name}
                      </span>
                    )}
                    {item.user?.email && (
                      <span className="adm-notif-chip adm-notif-chip-email">
                        {item.user.email}
                      </span>
                    )}
                    {item.metadata?.amount && (
                      <span className="adm-notif-chip adm-notif-chip-amount">
                        {item.metadata.amount}
                      </span>
                    )}
                    {item.metadata?.method && (
                      <span className="adm-notif-chip">
                        {item.metadata.method}
                      </span>
                    )}
                    {item.metadata?.invoiceRef && (
                      <span className="adm-notif-chip">
                        {item.metadata.invoiceRef}
                      </span>
                    )}
                    {item.metadata?.expiryDate && (
                      <span className="adm-notif-chip" style={{ color: '#d97706', background: '#fffbeb' }}>
                        {item.metadata.expiryDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Actions on Hover */}
                <div className="adm-notif-item-actions">
                  {!item.read && onMarkAsRead && (
                    <button
                      type="button"
                      className="adm-notif-row-action"
                      title="Mark as read"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(item._id || item.id);
                      }}
                    >
                      <Check size={13} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      className="adm-notif-row-action adm-notif-row-action-delete"
                      title="Dismiss notification"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item._id || item.id);
                      }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Unread Glow Dot */}
                {!item.read && <span className="adm-notif-unread-dot" title="Unread" />}
              </div>
            );
          })
        )}
      </div>

      {/* Popover Footer */}
      <div className="adm-notif-footer">
        <span className="adm-notif-footer-text">
          <Clock size={12} /> Live stream: Customer, Contract, Payment & Renewal events
        </span>
      </div>
    </div>
  );
}
