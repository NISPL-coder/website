import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Package,
  ReceiptText,
  FileUp,
  RefreshCw,
  UserCheck,
  Activity,
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

        {/* DATA TOOLS */}
        {!isCollapsed && (
          <div className="adm-sidebar-divider" aria-hidden="true" />
        )}
        {!isCollapsed && (
          <div className="adm-sidebar-tools-label">Data Tools</div>
        )}

        {/* 5. IMPORT CSV */}
        <button
          type="button"
          className={`adm-nav-item ${activeNav === 'import-csv' ? 'active' : ''}`}
          onClick={() => handleNavClick('/admin/import-csv')}
          title="Bulk Import Customers via CSV"
        >
          <div className="adm-nav-item-left">
            <FileUp size={19} />
            <span>Import CSV</span>
          </div>
        </button>

        {/* 6. SANGAM SYNC */}
        <button
          type="button"
          className={`adm-nav-item ${activeNav === 'sangam-sync' ? 'active' : ''}`}
          onClick={() => handleNavClick('/admin/sangam-sync')}
          title="Sangam CRM Synchronization Status"
        >
          <div className="adm-nav-item-left">
            <RefreshCw size={19} />
            <span>Sangam Sync</span>
          </div>
        </button>

        {/* ADMINISTRATION & SECURITY */}
        {!isCollapsed && (
          <div className="adm-sidebar-divider" aria-hidden="true" />
        )}
        {!isCollapsed && (
          <div className="adm-sidebar-tools-label">Administration</div>
        )}

        {/* 7. USER ACCESS */}
        <button
          type="button"
          className={`adm-nav-item ${activeNav === 'user-access' || activeNav === 'staff' ? 'active' : ''}`}
          onClick={() => handleNavClick('/admin/user-access')}
          title="User Access & Staff Permissions"
        >
          <div className="adm-nav-item-left">
            <UserCheck size={19} />
            <span>User Access</span>
          </div>
        </button>

        {/* 8. ACTIVITY LOGS */}
        <button
          type="button"
          className={`adm-nav-item ${activeNav === 'activity-logs' ? 'active' : ''}`}
          onClick={() => handleNavClick('/admin/activity-logs')}
          title="Admin Activity Logs & Audit Trail"
        >
          <div className="adm-nav-item-left">
            <Activity size={19} />
            <span>Activity Logs</span>
          </div>
        </button>
      </nav>
    </aside>
  );
}
