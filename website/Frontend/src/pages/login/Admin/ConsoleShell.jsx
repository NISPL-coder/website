import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import logoImg from '../../../assets/NISPL Cloud Tech Logo Black.png';
import ConsoleSidebar from './ConsoleSidebar';
import AdminProfileMenu from './AdminProfileMenu';
import NotificationPopover from './NotificationPopover';
import {
  notificationApi,
  isNotificationAllowedForRole
} from '../../../services/notificationApi';
import { authApi } from '../../../services/authApi';
import './AdminDashboard.css';
import './AdminTools.css';

const NOTIF_POLL_MS = 25000;

/**
 * The signed-in console chrome: fixed brand header with global search, live
 * notification bell, profile chip with the account role, and the navigation
 * rail. Every portal (admin, manager, customer) renders through this so the
 * shell is identical and only the nav config, search and body differ.
 */
export default function ConsoleShell({
  brandTo = '/admin/overview',
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  navItems,
  activeNav,
  onNavigate,
  sidebarAriaLabel = 'Portal Navigation',
  sidebarEmptyNote = '',
  notificationsPath,
  profile = {},
  onSignOut,
  refreshKey = 0,
  children
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifLoading, setIsNotifLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      setIsNotifLoading(true);
      const data = await notificationApi.getNotifications();
      if (data && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadCount(typeof data.unreadCount === 'number' ? data.unreadCount : 0);
      }
    } catch (err) {
      console.warn('[console] Failed to load notifications:', err);
    } finally {
      setIsNotifLoading(false);
    }
  }, []);

  // Live stream: first paint, polling, and any in-app notification event.
  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, NOTIF_POLL_MS);

    const handleNewNotif = (event) => {
      const notif = event.detail;
      if (!notif) return;
      const role = authApi.getCurrentUser()?.role || 'admin';
      if (!isNotificationAllowedForRole(notif, role)) return;
      setNotifications((prev) => [
        notif,
        ...prev.filter((n) => (n._id || n.id) !== (notif._id || notif.id))
      ]);
      setUnreadCount((prev) => prev + 1);
    };

    window.addEventListener('nispl_new_notification', handleNewNotif);
    return () => {
      clearInterval(timer);
      window.removeEventListener('nispl_new_notification', handleNewNotif);
    };
  }, [loadNotifications, refreshKey]);

  // The navigation rail badges the unread count on its own entry.
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('nispl_unread_notifications', { detail: { count: unreadCount } })
    );
  }, [unreadCount]);

  // Drawer housekeeping: close on navigation, on Escape, and lock the body.
  useEffect(() => {
    setIsMobileOpen(false);
    setIsNotifOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileOpen) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isMobileOpen]);

  const handleNavigate = (item) => {
    if (!item?.path) return;
    if (onNavigate) onNavigate(item);
    else navigate(item.path);
    setIsMobileOpen(false);
  };

  const handleMarkAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id || n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await notificationApi.markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    toast.success('All notifications marked as read');
    await notificationApi.markAllAsRead();
  };

  const handleDeleteNotif = async (id) => {
    const target = notifications.find((n) => n._id === id || n.id === id);
    setNotifications((prev) => prev.filter((n) => n._id !== id && n.id !== id));
    if (target && !target.read) setUnreadCount((prev) => Math.max(0, prev - 1));
    await notificationApi.deleteNotification(id);
  };

  const handleClearAllNotif = async () => {
    setNotifications([]);
    setUnreadCount(0);
    toast.success('All notifications cleared');
    await notificationApi.clearAll();
  };

  // A portal that owns the full page gets the row click; others keep the
  // in-popover mark-as-read behaviour.
  const handleOpenNotification = (item) => {
    const id = item._id || item.id;
    if (!item.read) handleMarkAsRead(id);
    navigate(`${notificationsPath}?focus=${encodeURIComponent(id)}`);
  };

  return (
    <div className="adm-dashboard-viewport">
      <header className="adm-header">
        <div className="adm-header-left">
          <button
            type="button"
            className="adm-mobile-menu-btn"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-label="Toggle Navigation Drawer"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to={brandTo} className="adm-brand-link" title="Net Infotech System">
            <img src={logoImg} alt="NISPL Cloud Tech" className="adm-brand-logo" />
          </Link>
        </div>

        <div className="adm-header-main">
          <div className="adm-header-center">
            <div className="adm-search-box">
              <Search size={16} className="adm-search-icon" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="adm-search-input"
                aria-label={searchPlaceholder}
              />
            </div>
          </div>

          <div className="adm-header-right">
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className={`adm-header-icon-btn ${isNotifOpen ? 'is-active' : ''}`}
                title="Notifications & Activity Stream"
                onClick={() => setIsNotifOpen((prev) => !prev)}
                aria-expanded={isNotifOpen}
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="adm-badge-count">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </button>

              <NotificationPopover
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onDelete={handleDeleteNotif}
                onClearAll={handleClearAllNotif}
                onRefresh={loadNotifications}
                onOpenItem={notificationsPath ? handleOpenNotification : undefined}
                onViewAll={notificationsPath ? () => navigate(notificationsPath) : undefined}
                isLoading={isNotifLoading}
              />
            </div>

            <AdminProfileMenu
              name={profile.name}
              email={profile.email}
              role={profile.role}
              isPrimaryAdmin={profile.isPrimaryAdmin}
              profilePath={profile.profilePath}
              onSignOut={onSignOut}
            />
          </div>
        </div>
      </header>

      <div className="adm-body-wrapper">
        <ConsoleSidebar
          items={navItems}
          activeNav={activeNav}
          onNavigate={handleNavigate}
          isMobileOpen={isMobileOpen}
          ariaLabel={sidebarAriaLabel}
          emptyNote={sidebarEmptyNote}
        />

        {isMobileOpen && (
          <div className="adm-mobile-backdrop" onClick={() => setIsMobileOpen(false)} aria-hidden="true" />
        )}

        <main className="adm-main-content">{children}</main>
      </div>
    </div>
  );
}
