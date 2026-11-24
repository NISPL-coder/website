import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, Moon, Search, Sun, X } from 'lucide-react';
import toast from 'react-hot-toast';
import logoImg from '../../../assets/new_logo/BLACK NEW.png';
import logoDarkImg from '../../../assets/new_logo/WHITE NEW.png';
import ConsoleSidebar from './ConsoleSidebar';
import AdminProfileMenu from './AdminProfileMenu';
import NotificationPopover from './NotificationPopover';
import {
  notificationApi,
  isNotificationAllowedForRole
} from '../../../services/notificationApi';
import { authApi } from '../../../services/authApi';
import { useIsMobile } from '../../../utils/useResponsive';
import { AdminNotificationsSkeleton } from './AdminSkeleton';
import {
  ADMIN_THEMES,
  applyAdminTheme,
  clearAdminTheme,
  persistAdminTheme,
  readAdminTheme
} from '../../../utils/adminTheme';
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
  themeToggle = false,
  children
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [theme, setTheme] = useState(readAdminTheme);
  const searchInputRef = useRef(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifLoading, setIsNotifLoading] = useState(false);

  // The theme attribute lives on <html> so body-portal dialogs inherit it.
  // Portals that opt in (Admin & Customer portals) restore the saved dark/light
  // theme before the browser paints without a flash on first render.
  useLayoutEffect(() => {
    if (!themeToggle) {
      clearAdminTheme();
      return undefined;
    }
    applyAdminTheme(theme);
    return () => clearAdminTheme();
  }, [theme, themeToggle]);

  const toggleTheme = useCallback((event) => {
    const next = theme === ADMIN_THEMES.DARK ? ADMIN_THEMES.LIGHT : ADMIN_THEMES.DARK;

    // Determine circular expansion coordinates from event or button position
    let x = event?.clientX;
    let y = event?.clientY;
    if ((x === undefined || y === undefined || (x === 0 && y === 0)) && event?.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }
    x = x ?? window.innerWidth / 2;
    y = y ?? 40;

    const isReduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Native View Transition API with circular clipPath (Chrome, Edge, modern browsers)
    if (typeof document.startViewTransition === 'function' && !isReduceMotion) {
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      document.documentElement.classList.add('adm-theme-transitioning');

      const transition = document.startViewTransition(() => {
        flushSync(() => {
          applyAdminTheme(next);
          persistAdminTheme(next);
          setTheme(next);
        });
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 550,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      });

      transition.finished.finally(() => {
        document.documentElement.classList.remove('adm-theme-transitioning');
      });
      return;
    }

    // Fallback circular reveal animation for browsers without View Transition API
    if (!isReduceMotion && typeof document !== 'undefined') {
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const overlay = document.createElement('div');
      overlay.className = 'adm-circular-theme-overlay';
      overlay.style.setProperty('--circle-x', `${x}px`);
      overlay.style.setProperty('--circle-y', `${y}px`);
      overlay.style.setProperty('--circle-r', `${endRadius}px`);
      overlay.style.backgroundColor = next === ADMIN_THEMES.DARK ? '#0a1020' : '#ffffff';
      document.body.appendChild(overlay);

      setTimeout(() => {
        applyAdminTheme(next);
        persistAdminTheme(next);
        setTheme(next);
        overlay.classList.add('adm-circular-fade');
        setTimeout(() => {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 300);
      }, 400);
      return;
    }

    // Direct toggle when reduced motion is preferred
    applyAdminTheme(next);
    persistAdminTheme(next);
    setTheme(next);
  }, [theme]);

  const isDarkTheme = theme === ADMIN_THEMES.DARK;

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
            <img 
              src={isDarkTheme ? logoDarkImg : logoImg} 
              alt="Net Infotech System Pvt. Ltd." 
              className="adm-brand-logo" 
            />
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
                    <div className="adm-search-status adm-search-skeleton">
                      <AdminNotificationsSkeleton rows={3} compact label="Searching your account" />
                    </div>
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

            {themeToggle && (
              <button
                type="button"
                className={`adm-theme-switch-pill ${isDarkTheme ? 'is-dark' : 'is-light'}`}
                onClick={toggleTheme}
                aria-label={isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-pressed={isDarkTheme}
                title={isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {/* Sun icon on the left (visible in light mode) */}
                <span className="adm-switch-icon adm-switch-icon-sun" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4.5" />
                    <line x1="12" y1="2" x2="12" y2="4.2" />
                    <line x1="12" y1="19.8" x2="12" y2="22" />
                    <line x1="4.93" y1="4.93" x2="6.5" y2="6.5" />
                    <line x1="17.5" y1="17.5" x2="19.07" y2="19.07" />
                    <line x1="2" y1="12" x2="4.2" y2="12" />
                    <line x1="19.8" y1="12" x2="22" y2="12" />
                    <line x1="4.93" y1="19.07" x2="6.5" y2="17.5" />
                    <line x1="17.5" y1="6.5" x2="19.07" y2="4.93" />
                  </svg>
                </span>

                {/* Moon with stars icon on the right (visible in dark mode) */}
                <span className="adm-switch-icon adm-switch-icon-moon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10.2 3.2a8.5 8.5 0 1 0 8.6 8.6c0-.46-.04-.92-.11-1.36a6.5 6.5 0 0 1-7.13-7.13c-.44-.07-.9-.11-1.36-.11z" />
                    <path d="M18.8 2.2l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5-1.5-.6 1.5-.6z" />
                    <path d="M21.2 7.2l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4z" />
                  </svg>
                </span>

                {/* Sliding Circular Knob (visible on desktop, hidden in responsive modes via CSS) */}
                <span className="adm-switch-knob" aria-hidden="true" />
              </button>
            )}

            <div className="adm-header-notif-wrap" style={{ position: 'relative' }}>
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
                userRole={profile?.role || authApi.getCurrentUser()?.role || 'admin'}
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
