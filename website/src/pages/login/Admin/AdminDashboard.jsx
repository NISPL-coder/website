import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, LogOut, Menu, X, RefreshCw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import logoImg from '../../../assets/NISPL Cloud Tech Logo Black.png';
import './AdminDashboard.css';

// Components & Modular Sections
import AdminSidebar from './AdminSidebar';
import OverviewSection from './OverviewSection';
import CustomerSection from './CustomerSection';
import ContractSection from './ContractSection';
import PaymentSection from './PaymentSection';
import ProductSection from './ProductSection';
import ReceiptSection from './ReceiptSection';

// Initial Datasets
import {
  INITIAL_CUSTOMERS,
  INITIAL_CONTRACTS,
  INITIAL_PAYMENTS,
  INITIAL_PRODUCTS,
  INITIAL_RECEIPTS
} from './adminData';

export default function AdminDashboard({ userSession, onSignOut }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Desktop sidebar collapsed state
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Mobile drawer open state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Derive active view from current URL pathname
  const activeNav = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/admin/customer/contract')) return 'contract';
    if (path.includes('/admin/customer/payment')) return 'payment';
    if (path === '/admin/customer' || path.startsWith('/admin/customer')) return 'customer';
    if (path.includes('/admin/product')) return 'product';
    if (path.includes('/admin/receipt')) return 'receipt';
    return 'overview';
  }, [location.pathname]);

  // Customer parent menu expandable state
  const isCustomerRelated =
    activeNav === 'customer' || activeNav === 'contract' || activeNav === 'payment';
  const [isCustomerOpen, setIsCustomerOpen] = useState(() => isCustomerRelated);

  // Automatically expand Customer submenu when child route or customer page is active
  useEffect(() => {
    if (isCustomerRelated) {
      setIsCustomerOpen(true);
    }
  }, [isCustomerRelated]);

  // Global search & refresh states
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Persistent Datasets in State
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [contracts, setContracts] = useState(INITIAL_CONTRACTS);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [receipts, setReceipts] = useState(INITIAL_RECEIPTS);

  const adminName = userSession?.name || userSession?.user || 'NISPL Administrator';
  const adminEmail = userSession?.user || 'admin@netinfotechsystem.in';

  // Manual Refresh Telemetry simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Live administrative records & telemetry synchronized!', {
        style: {
          borderRadius: '12px',
          background: '#0f172a',
          color: '#ffffff',
          fontSize: '0.85rem'
        }
      });
    }, 500);
  };

  return (
    <div className="adm-dashboard-viewport">
      <Toaster position="top-right" />

      {/* =========================================================================
         TOP FIXED NAVBAR / HEADER (Aligned with 260px Sidebar)
         ========================================================================= */}
      <header className="adm-header">
        {/* Left Brand Area — Exactly 260px wide (matching sidebar right border) */}
        <div className={`adm-header-left ${isCollapsed ? 'collapsed' : ''}`}>
          <button
            type="button"
            className="adm-mobile-menu-btn"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle Navigation Drawer"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/admin/overview" className="adm-brand-link" title="Net Infotech System">
            <img src={logoImg} alt="NISPL Cloud Tech" className="adm-brand-logo" />
            </Link>
        </div>

        {/* Header Main Bar — Starts at 260px, perfectly aligned with the main content below */}
        <div className="adm-header-main">
          {/* Center Search & Live NOC Heartbeat */}
          <div className="adm-header-center">
            <div className="adm-search-box">
              <Search size={16} className="adm-search-icon" />
              <input
                type="text"
                placeholder="Search contracts, payments, products, receipts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="adm-search-input"
              />
            </div>

          </div>

          {/* Right Actions */}
          <div className="adm-header-right">
            <button
              type="button"
              className="adm-header-icon-btn"
              onClick={handleRefresh}
              title="Refresh System Data"
            >
              <RefreshCw size={17} className={isRefreshing ? 'animate-spin' : ''} />
            </button>

            <button type="button" className="adm-header-icon-btn" title="Pending Notifications">
              <Bell size={17} />
              <span className="adm-badge-count">{contracts.filter((c) => c.status === 'expiring').length}</span>
            </button>

            {/* Admin Profile Pill */}
            <div className="adm-user-profile-btn" title={adminEmail}>
              <div className="adm-user-avatar">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="adm-user-meta">
                <span className="adm-user-name">{adminName}</span>
                <span className="adm-user-role">Administrator</span>
              </div>
            </div>

            <button
              type="button"
              className="adm-signout-btn"
              onClick={onSignOut}
              title="Sign out of Admin Session"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
         BODY LAYOUT: SIDEBAR + MAIN SECTION CONTENT
         ========================================================================= */}
      <div className="adm-body-wrapper">
        {/* Modular Sidebar Component */}
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isCustomerOpen={isCustomerOpen}
          setIsCustomerOpen={setIsCustomerOpen}
          activeNav={activeNav}
          adminName={adminName}
          adminEmail={adminEmail}
          onSignOut={onSignOut}
        />

        {/* Main Routed View Container */}
        <main className="adm-main-content">
          {activeNav === 'overview' && (
            <OverviewSection
              adminName={adminName}
              contracts={contracts}
              payments={payments}
              products={products}
              receipts={receipts}
              customers={customers}
              setCustomers={setCustomers}
            />
          )}

          {activeNav === 'customer' && (
            <CustomerSection
              customers={customers}
              setCustomers={setCustomers}
            />
          )}

          {activeNav === 'contract' && (
            <ContractSection
              contracts={contracts}
              setContracts={setContracts}
            />
          )}

          {activeNav === 'payment' && (
            <PaymentSection
              payments={payments}
              setPayments={setPayments}
              contracts={contracts}
              onGoToReceipt={() => navigate('/admin/receipt')}
            />
          )}

          {activeNav === 'product' && (
            <ProductSection
              products={products}
              setProducts={setProducts}
            />
          )}

          {activeNav === 'receipt' && (
            <ReceiptSection
              receipts={receipts}
              setReceipts={setReceipts}
              payments={payments}
            />
          )}
        </main>
      </div>
    </div>
  );
}
