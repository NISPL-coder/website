import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Package,
  ReceiptText,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  LogOut
} from 'lucide-react';

export default function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  isCustomerOpen,
  setIsCustomerOpen,
  activeNav,
  adminName,
  adminEmail,
  onSignOut
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (path) => {
    navigate(path);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const handleCustomerClick = () => {
    // Navigate to customer listing page AND ensure submenu expands
    navigate('/admin/customer');
    setIsCustomerOpen(true);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const toggleCustomerSubmenu = (e) => {
    e.stopPropagation();
    setIsCustomerOpen((prev) => !prev);
  };

  return (
    <aside
      className={`adm-sidebar ${isCollapsed ? 'collapsed' : ''} ${
        isMobileOpen ? 'mobile-open' : ''
      }`}
    >
      {/* Nav Hierarchy */}
      <nav className="adm-sidebar-nav" aria-label="Admin Navigation Hierarchy">
        {/* 1. OVERVIEW */}
        <button
          type="button"
          className={`adm-nav-item ${activeNav === 'overview' ? 'active' : ''}`}
          onClick={() => handleNavClick('/admin/overview')}
          title="Overview"
        >
          <div className="adm-nav-item-left">
            <LayoutDashboard size={19} />
            <span>Overview</span>
          </div>
        </button>

        {/* 2. CUSTOMER (Parent item opens customer listing + expandable submenu) */}
        <div className="adm-nav-group">
          <button
            type="button"
            className={`adm-nav-item has-submenu ${activeNav === 'customer' ? 'active' : ''}`}
            onClick={handleCustomerClick}
            title="Customer Listing & Management"
            aria-expanded={isCustomerOpen}
          >
            <div className="adm-nav-item-left">
              <Users size={19} />
              <span>Customer</span>
            </div>
            <span
              className={`adm-nav-chevron ${isCustomerOpen ? 'open' : ''}`}
              onClick={toggleCustomerSubmenu}
              title={isCustomerOpen ? 'Collapse Submenu' : 'Expand Submenu'}
            >
              <ChevronDown size={16} />
            </span>
          </button>

          {/* Submenu: Contract & Payment */}
          {isCustomerOpen && !isCollapsed && (
            <div className="adm-submenu animate-fade-in">
              <button
                type="button"
                className={`adm-submenu-item ${activeNav === 'contract' ? 'active' : ''}`}
                onClick={() => handleNavClick('/admin/customer/contract')}
                title="Customer Contracts"
              >
                <FileText size={16} />
                <span>Contract</span>
              </button>

              <button
                type="button"
                className={`adm-submenu-item ${activeNav === 'payment' ? 'active' : ''}`}
                onClick={() => handleNavClick('/admin/customer/payment')}
                title="Customer Payments"
              >
                <CreditCard size={16} />
                <span>Payment</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. PRODUCT */}
        <button
          type="button"
          className={`adm-nav-item ${activeNav === 'product' ? 'active' : ''}`}
          onClick={() => handleNavClick('/admin/product')}
          title="Product Catalog & Availability"
        >
          <div className="adm-nav-item-left">
            <Package size={19} />
            <span>Product</span>
          </div>
        </button>

        {/* 4. RECEIPT */}
        <button
          type="button"
          className={`adm-nav-item ${activeNav === 'receipt' ? 'active' : ''}`}
          onClick={() => handleNavClick('/admin/receipt')}
          title="Payment Receipts"
        >
          <div className="adm-nav-item-left">
            <ReceiptText size={19} />
            <span>Receipt</span>
          </div>
        </button>
      </nav>
    </aside>
  );
}

