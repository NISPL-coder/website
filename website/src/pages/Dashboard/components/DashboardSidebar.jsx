import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  CreditCard,
  ShoppingCart,
  Receipt,
  ChevronRight,
  ChevronsUpDown,
  LifeBuoy
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  // { id: 'payment',  label: 'Payment',  icon: CreditCard },
  { id: 'cart',     label: 'Cart',     icon: ShoppingCart },
  { id: 'receipt',  label: 'Receipt',  icon: Receipt }
];

/**
 * Extract clean 2-letter company initials (filtering out common legal suffixes)
 */
function getCompanyInitials(companyName, customerName) {
  const target = (companyName || customerName || 'Net Infotech System').trim();
  const words = target
    .split(/\s+/)
    .filter((w) => !/^(pvt|ltd|pvt\.|ltd\.|inc|llc|corp|co|private|limited)$/i.test(w));
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (words.length === 1 && words[0].length >= 2) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return target.slice(0, 2).toUpperCase() || 'NI';
}

export default function DashboardSidebar({
  isCollapsed,
  onToggleCollapse,
  activeNav,
  onSelectNav,
  onSignOut,
  customer,
  cartCount = 0,
  isMobileOpen = false,
  onCloseMobile
}) {
  const navigate = useNavigate();
  const customerName = customer?.name || 'NISPL Developer';
  const customerEmail = customer?.email || 'demo1@gmail.com';
  const customerInitial = customerName.charAt(0).toUpperCase();

  const [logoError, setLogoError] = useState(false);
  const companyLogo = customer?.companyLogo || customer?.logo || null;
  const companyName = customer?.companyName || 'Net Infotech System';
  const companyInitials = useMemo(() => {
    return getCompanyInitials(customer?.companyName, customer?.name);
  }, [customer?.companyName, customer?.name]);

  // Reset logo error on customer profile update
  useEffect(() => {
    setLogoError(false);
  }, [companyLogo]);

  const hasValidLogo = companyLogo && !logoError;

  return (
    <aside className={`cliento-sidebar flowmail-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* ── Top Highlighted Section: Centered Logo with Company Name Below ── */}
      <div className="cliento-sidebar-brand-section">
        <div
          className={`cliento-sidebar-brand-container centered-brand ${hasValidLogo ? 'has-logo-img' : 'has-initials'}`}
          title={companyName}
          onClick={() => onSelectNav && onSelectNav('overview')}
          style={{ cursor: 'pointer' }}
        >
          <div className="cliento-sidebar-logo-box">
            {hasValidLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="cliento-sidebar-brand-logo company-logo-img"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="cliento-sidebar-initials-badge" aria-label={companyName}>
                <span className="cliento-initials-text">{companyInitials}</span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div className="cliento-sidebar-company-meta">
              <span className="cliento-sidebar-company-title" title={companyName}>
                {companyName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Navigation (Exact Previous Labels & Logic) ────── */}
      <nav className="cliento-nav-menu flowmail-nav-menu" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          const hasBadge = item.id === 'cart' && cartCount > 0;

          return (
            <button
              key={item.id}
              type="button"
              className={`cliento-nav-item flowmail-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                onSelectNav(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="cliento-nav-item-left">
                <Icon
                  size={18}
                  className="cliento-nav-icon"
                  style={isActive ? { color: '#6366f1' } : undefined}
                />
                {!isCollapsed && (
                  <span
                    className="cliento-nav-label"
                    style={isActive ? { color: '#0f172a', fontWeight: '600' } : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </div>

              {!isCollapsed && (
                <div className="cliento-nav-item-right">
                  {hasBadge && (
                    <span className="cliento-nav-badge flowmail-cart-badge">{cartCount}</span>
                  )}
                  {isActive && (
                    <ChevronRight
                      size={14}
                      className="cliento-nav-arrow"
                      style={{ color: '#6366f1' }}
                    />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Help Center Option (Navigates to /customer/help) ── */}
      <div className="cliento-sidebar-help-section flowmail-help-wrap">
        <button
          type="button"
          className={`cliento-nav-item cliento-help-nav-item flowmail-nav-item ${activeNav === 'help' ? 'active' : ''}`}
          onClick={() => {
            onSelectNav('help');
            if (onCloseMobile) onCloseMobile();
          }}
          title={isCollapsed ? 'Help Center' : undefined}
          aria-label="Open Help Center"
        >
          <div className="cliento-nav-item-left">
            <LifeBuoy
              size={18}
              className="cliento-nav-icon cliento-help-icon"
              style={activeNav === 'help' ? { color: '#6366f1' } : undefined}
            />
            {!isCollapsed && (
              <span
                className="cliento-nav-label"
                style={activeNav === 'help' ? { color: '#0f172a', fontWeight: '600' } : undefined}
              >
                Help Center
              </span>
            )}
          </div>
          {!isCollapsed && (
            <div className="cliento-nav-item-right">
              <span className="cliento-help-pill">24/7</span>
              <ChevronRight size={14} className="cliento-nav-arrow" />
            </div>
          )}
        </button>
      </div>

      {/* ── Bottom Section (Profile) ────────────────────────── */}
      <div className="cliento-sidebar-footer flowmail-footer">
        <div className="cliento-user-card flowmail-user-card" onClick={onSignOut} title="Click to Sign Out">
          <div className="cliento-user-avatar flowmail-avatar">
            {customerInitial}
          </div>
          {!isCollapsed && (
            <>
              <div className="cliento-user-details">
                <span className="cliento-user-name flowmail-user-name">{customerName}</span>
                <span className="cliento-user-email flowmail-user-plan">{customerEmail}</span>
              </div>
              <ChevronsUpDown size={15} className="cliento-user-chevron" />
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
