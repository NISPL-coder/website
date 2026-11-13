import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { useIsMobile } from '../../../utils/useResponsive';
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
  searchResults,
  isSearchLoading = false,
  onSearchResultSelect,
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
  const isMobile = useIsMobile();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
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
    setIsMobileSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileSearchOpen) return undefined;

    const handleKey = (e) => {
      if (e.key === 'Escape') setIsMobileSearchOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    searchInputRef.current?.focus();

    return () => window.removeEventListener('keydown', handleKey);
  }, [isMobileSearchOpen]);

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
    if (!item?.path || item?.readOnly || item?.disabled) return;
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

  // Global search dropdown: only portals that supply onSearchResultSelect get it,
  // so the rest keep the plain filter-style input.
  const hasSearchDropdown = Boolean(onSearchResultSelect);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeResult, setActiveResult] = useState(0);
  const searchBoxRef = useRef(null);

  const flatResults = useMemo(() => {
    const list = [];
    (searchResults || []).forEach((group) => {
      (group.items || []).forEach((item) => {
        list.push({
          ...item,
          groupKey: group.key,
          flatIndex: list.length,
          key: `${group.key}:${item.id ?? list.length}`
        });
      });
    });
    return list;
  }, [searchResults]);

  useEffect(() => {
    setActiveResult(0);
  }, [searchValue]);

  useEffect(() => {
    if (!searchValue) setIsSearchOpen(false);
  }, [searchValue]);

  useEffect(() => {
    if (!isSearchOpen) return undefined;
    const handlePointerDown = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isSearchOpen]);

  const chooseSearchResult = (item) => {
    if (!item) return;
    onSearchResultSelect?.(item);
    setIsSearchOpen(false);
    setIsMobileSearchOpen(false);
  };

  const handleSearchKeyDown = (event) => {
    if (!hasSearchDropdown) return;

    if (event.key === 'Escape') {
      setIsSearchOpen(false);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!flatResults.length) return;
      event.preventDefault();
      setIsSearchOpen(true);
      setActiveResult((prev) => {
        const step = event.key === 'ArrowDown' ? 1 : -1;
        return (prev + step + flatResults.length) % flatResults.length;
      });
      return;
    }
    if (event.key === 'Enter') {
      if (!isSearchOpen || !flatResults.length) return;
      event.preventDefault();
      chooseSearchResult(flatResults[activeResult]);
    }
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
      <header className={`adm-header${isMobile && isMobileSearchOpen ? ' has-mobile-search' : ''}`}>
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
            <div className="adm-search-box" ref={searchBoxRef}>
              <Search size={16} className="adm-search-icon" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                ref={searchInputRef}
                onChange={(e) => {
                  onSearchChange?.(e.target.value);
                  if (hasSearchDropdown) setIsSearchOpen(true);
                }}
                onFocus={() => hasSearchDropdown && setIsSearchOpen(true)}
                onKeyDown={handleSearchKeyDown}
                className="adm-search-input"
                aria-label={searchPlaceholder}
                aria-expanded={hasSearchDropdown ? isSearchOpen : undefined}
                aria-controls={hasSearchDropdown ? 'console-search-results' : undefined}
                role={hasSearchDropdown ? 'combobox' : undefined}
                aria-autocomplete={hasSearchDropdown ? 'list' : undefined}
              />

              {hasSearchDropdown && isSearchOpen && (
                <div
                  id="console-search-results"
                  className="adm-search-results"
                  role="listbox"
                  aria-label="Search results"
                >
                  {isSearchLoading && (
                    <div className="adm-search-status">Searching your account…</div>
                  )}

                  {!isSearchLoading && !flatResults.length && (
                    <div className="adm-search-status">
                      {searchValue.trim().length < 2
                        ? 'Start typing to search products, plans and receipts.'
                        : `Nothing on your account matches “${searchValue.trim()}”.`}
                    </div>
                  )}

                  {!isSearchLoading &&
                    (searchResults || [])
                      .filter((group) => group.items?.length)
                      .map((group) => (
                        <div className="adm-search-group" key={group.key}>
                          {group.label && (
                            <div className="adm-search-group-title">{group.label}</div>
                          )}
                          {flatResults
                            .filter((item) => item.groupKey === group.key)
                            .map((item) => (
                              <button
                                type="button"
                                key={item.key}
                                role="option"
                                aria-selected={activeResult === item.flatIndex}
                                className={`adm-search-result ${
                                  activeResult === item.flatIndex ? 'is-active' : ''
                                }`}
                                onMouseEnter={() => setActiveResult(item.flatIndex)}
                                onClick={() => chooseSearchResult(item)}
                                ref={(node) => {
                                  if (node && activeResult === item.flatIndex) {
                                    node.scrollIntoView({ block: 'nearest' });
                                  }
                                }}
                              >
                                <span className="adm-search-result-main">
                                  <span className="adm-search-result-title">{item.title}</span>
                                  {item.subtitle && (
                                    <span className="adm-search-result-subtitle">{item.subtitle}</span>
                                  )}
                                </span>
                                {(item.trailing || item.meta) && (
                                  <span className="adm-search-result-trailing">
                                    {item.trailing || item.meta}
                                  </span>
                                )}
                              </button>
                            ))}
                        </div>
                      ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="adm-mobile-search-close"
              onClick={() => setIsMobileSearchOpen(false)}
              aria-label="Close search"
              title="Close search"
            >
              <X size={18} />
            </button>
          </div>

          <div className="adm-header-right">
            <button
              type="button"
              className="adm-mobile-search-btn"
              onClick={() => setIsMobileSearchOpen((prev) => !prev)}
              aria-label={searchPlaceholder}
              title={searchPlaceholder}
              aria-expanded={isMobileSearchOpen}
            >
              <Search size={17} />
            </button>

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
              user={profile.user}
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
