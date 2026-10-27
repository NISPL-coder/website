import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  LogOut,
  Sparkles,
  Command,
  TrendingUp,
  LayoutDashboard,
  Package,
  CreditCard,
  ShoppingCart,
  Receipt
} from 'lucide-react';

export default function DashboardNavbar({
  customer,
  onToggleMobileSidebar,
  notifications = [],
  onSignOut,
  activeNav = 'overview'
}) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const unreadCount = notifications.filter(n => n.unread).length;

  const getPageTitle = () => {
    switch (activeNav) {
      case 'products':
        return { label: 'Products', icon: Package };
      case 'payment':
        return { label: 'Payment', icon: CreditCard };
      case 'cart':
        return { label: 'Cart', icon: ShoppingCart };
      case 'receipt':
        return { label: 'Receipt', icon: Receipt };
      default:
        return { label: 'Overview', icon: TrendingUp };
    }
  };

  const currentPage = getPageTitle();
  const PageIcon = currentPage.icon;

  return (
    <header className="cliento-navbar">
      {/* ── Left: Page Title ─────────────────────────────────── */}
      <div className="cliento-nav-left">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="cliento-mobile-toggle"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div className="cliento-page-header-title">
          <PageIcon size={20} className="cliento-page-icon" />
          <h1 className="cliento-page-title-text">{currentPage.label}</h1>
        </div>
      </div>

      {/* ── Right: Search + Quick Tools ──────────────────────── */}
      <div className="cliento-nav-right">
        {/* Search input with ⌘K badge */}
        <div className="cliento-search-bar">
          <Search size={15} className="cliento-search-icon" />
          <input
            type="text"
            className="cliento-search-input"
            placeholder="Search Anything..."
          />
          <div className="cliento-search-shortcut">
            <span>⌘K</span>
          </div>
        </div>

        {/* Notifications */}
        <div className="cliento-notif-wrapper">
          <button
            type="button"
            className="cliento-icon-btn"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="cliento-notif-dot" />}
          </button>

          {isNotificationsOpen && (
            <div className="cliento-notif-dropdown animate-fade-in">
              <div className="cliento-notif-head">
                <span>Notifications</span>
                <span className="cliento-notif-badge">{unreadCount} new</span>
              </div>
              <div className="cliento-notif-list">
                {notifications.map((n) => (
                  <div key={n.id} className={`cliento-notif-item ${n.unread ? 'unread' : ''}`}>
                    <div className="cliento-notif-item-title">{n.title}</div>
                    <div className="cliento-notif-item-desc">{n.desc}</div>
                    <span className="cliento-notif-item-time">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
