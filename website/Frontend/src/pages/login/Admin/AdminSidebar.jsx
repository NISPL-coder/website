import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronDown
} from 'lucide-react';
import { usePermissions } from './PermissionsContext';

export default function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  isCustomerOpen,
  setIsCustomerOpen,
  activeNav
}) {
  const navigate = useNavigate();
  const { can } = usePermissions();

  const handleNavClick = (path) => {
    navigate(path);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  // A manager granted only a child module still needs a working parent entry
  const canCustomer = can('customer');
  const canContract = can('contract');
  const canPayment = can('payment');
  const canCustomerGroup = canCustomer || canContract || canPayment;
  const customerTarget = canCustomer
    ? '/admin/customer'
    : canContract
      ? '/admin/customer/contract'
      : '/admin/customer/payment';

  const canImportCsv = can('import_csv') || can('data_tools');
  const canSangamSync = can('sangam_sync') || can('data_tools');
  const canAdministration = can('user_access') || can('activity_logs');
  const canDataTools = canImportCsv || canSangamSync;

  const handleCustomerClick = () => {
    navigate(customerTarget);
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
        {can('overview') && (
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
        )}

        {/* 2. CUSTOMER (Parent item opens customer listing + expandable submenu) */}
        {canCustomerGroup && (
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
              {(canContract || canPayment) && (
                <span
                  className={`adm-nav-chevron ${isCustomerOpen ? 'open' : ''}`}
                  onClick={toggleCustomerSubmenu}
                  title={isCustomerOpen ? 'Collapse Submenu' : 'Expand Submenu'}
                >
                  <ChevronDown size={16} />
                </span>
              )}
            </button>

            {/* Submenu: Contract & Payment */}
            {isCustomerOpen && !isCollapsed && (canContract || canPayment) && (
              <div className="adm-submenu animate-fade-in">
                {canContract && (
                  <button
                    type="button"
                    className={`adm-submenu-item ${activeNav === 'contract' ? 'active' : ''}`}
                    onClick={() => handleNavClick('/admin/customer/contract')}
                    title="Customer Contracts"
                  >
                    <FileText size={16} />
                    <span>Contract</span>
                  </button>
                )}

                {canPayment && (
                  <button
                    type="button"
                    className={`adm-submenu-item ${activeNav === 'payment' ? 'active' : ''}`}
                    onClick={() => handleNavClick('/admin/customer/payment')}
                    title="Customer Payments"
                  >
                    <CreditCard size={16} />
                    <span>Payment</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. PRODUCT */}
        {can('product') && (
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
        )}

        {/* 4. RECEIPT */}
        {can('receipt') && (
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
        )}

        {/* DATA TOOLS */}
        {canDataTools && !isCollapsed && (
          <div className="adm-sidebar-divider" aria-hidden="true" />
        )}
        {canDataTools && !isCollapsed && <div className="adm-sidebar-tools-label">Data Tools</div>}

        {/* 5. IMPORT CSV */}
        {canImportCsv && (
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
        )}

        {/* 6. SANGAM SYNC */}
        {canSangamSync && (
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
        )}

        {/* ADMINISTRATION & SECURITY */}
        {canAdministration && !isCollapsed && (
          <div className="adm-sidebar-divider" aria-hidden="true" />
        )}
        {canAdministration && !isCollapsed && (
          <div className="adm-sidebar-tools-label">Administration</div>
        )}

        {/* 7. USER ACCESS */}
        {can('user_access') && (
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
        )}

        {/* 8. ACTIVITY LOGS */}
        {can('activity_logs') && (
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
        )}

        {!canAdministration && !canDataTools && !isCollapsed && (
          <div className="adm-sidebar-empty-note">
            No modules have been granted to your account yet.
          </div>
        )}
      </nav>
    </aside>
  );
}
