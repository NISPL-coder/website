import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  CreditCard,
  ShoppingCart,
  Receipt,
  ChevronRight,
  ChevronsUpDown
} from 'lucide-react';
import logoImg from '../../../assets/NISPL Cloud Tech Logo Black.png';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'payment',  label: 'Payment',  icon: CreditCard },
  { id: 'cart',     label: 'Cart',     icon: ShoppingCart },
  { id: 'receipt',  label: 'Receipt',  icon: Receipt }
];

export default function DashboardSidebar({
  isCollapsed,
  onToggleCollapse,
  activeNav,
  onSelectNav,
  onSignOut,
  customer,
  cartCount = 0
}) {
  const customerName = customer?.name || 'Debasish Ghosh';
  const customerEmail = customer?.email || 'debasish@acme-cloud.in';
  const customerInitial = customerName.charAt(0).toUpperCase();

  return (
    <aside className={`cliento-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* ── Top Highlighted Section: Only Company Logo ───────── */}
      <div className="cliento-sidebar-brand-section">
        <Link to="/" className="cliento-sidebar-brand-link" title="Net Infotech System Pvt. Ltd.">
          <img
            src={logoImg}
            alt="NISPL Cloud Tech"
            className="cliento-sidebar-brand-logo"
          />
        </Link>
      </div>

      {/* ── Main Navigation ─────────────────────────────────── */}
      <nav className="cliento-nav-menu" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          const hasBadge = item.id === 'cart' && cartCount > 0;

          return (
            <button
              key={item.id}
              type="button"
              className={`cliento-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectNav(item.id)}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="cliento-nav-item-left">
                <Icon size={18} className="cliento-nav-icon" />
                {!isCollapsed && <span className="cliento-nav-label">{item.label}</span>}
              </div>

              {!isCollapsed && (
                <div className="cliento-nav-item-right">
                  {hasBadge && (
                    <span className="cliento-nav-badge">{cartCount}</span>
                  )}
                  {isActive && <ChevronRight size={15} className="cliento-nav-arrow" />}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Bottom Section (Profile) ────────────────────────── */}
      <div className="cliento-sidebar-footer">
        {/* User Profile Card */}
        <div className="cliento-user-card" onClick={onSignOut} title="Click to Sign Out">
          <div className="cliento-user-avatar">
            {customerInitial}
          </div>
          {!isCollapsed && (
            <>
              <div className="cliento-user-details">
                <span className="cliento-user-name">{customerName}</span>
                <span className="cliento-user-email">{customerEmail}</span>
              </div>
              <ChevronsUpDown size={15} className="cliento-user-chevron" />
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
