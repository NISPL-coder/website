import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Menu, X } from 'lucide-react';
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

// Dedicated Separate Create Pages (Replacing Modals with /create URLs)
import CreateCustomerPage from './CreateCustomerPage';
import CreateContractPage from './CreateContractPage';
import CreatePaymentPage from './CreatePaymentPage';
import CreateProductPage from './CreateProductPage';

// Admin Tools: Profile Menu, Profile Page, CSV Import & Sangam CRM Sync
import AdminProfileMenu from './AdminProfileMenu';
import ProfilePage from './ProfilePage';
import ImportCsvPage from './ImportCsvPage';
import SangamSyncPage from './SangamSyncPage';
import { authApi } from '../../../services/authApi';
import './AdminTools.css';

// Initial Datasets
import {
  INITIAL_CUSTOMERS,
  INITIAL_CONTRACTS,
  INITIAL_PAYMENTS,
  INITIAL_PRODUCTS,
  INITIAL_RECEIPTS
} from './adminData';
import { customerApi } from '../../../services/customerApi';
import { notificationApi } from '../../../services/notificationApi';
import NotificationPopover from './NotificationPopover';
import { contractApi } from '../../../services/contractApi';

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
    if (path.includes('/admin/import-csv')) return 'import-csv';
    if (path.includes('/admin/sangam-sync')) return 'sangam-sync';
    if (path.includes('/admin/profile')) return 'profile';
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

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Handle removed receipt/product create page redirects
  useEffect(() => {
    if (location.pathname === '/admin/receipt/create') {
      navigate('/admin/receipt', { replace: true });
    }
    if (location.pathname === '/admin/product/create') {
      navigate('/admin/product', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Close the mobile drawer on Escape key press
  useEffect(() => {
    if (!isMobileOpen) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isMobileOpen]);

  // Prevent background scrolling while the mobile drawer is open
  useEffect(() => {
    if (!isMobileOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileOpen]);

  // Persistent Datasets in State
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [contracts, setContracts] = useState(INITIAL_CONTRACTS);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [receipts, setReceipts] = useState(INITIAL_RECEIPTS);

  // Live Notifications State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifLoading, setIsNotifLoading] = useState(false);

  const loadNotifications = React.useCallback(async () => {
    try {
      setIsNotifLoading(true);
      const data = await notificationApi.getNotifications();
      if (data && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadCount(typeof data.unreadCount === 'number' ? data.unreadCount : 0);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setIsNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 25000);

    // Listen to real-time notification events dispatched across the app
    const handleNewNotif = (event) => {
      if (event.detail) {
        const notif = event.detail;
        setNotifications((prev) => [notif, ...prev.filter((n) => (n._id || n.id) !== (notif._id || notif.id))]);
        setUnreadCount((prev) => prev + 1);
      }
    };

    window.addEventListener('nispl_new_notification', handleNewNotif);

    return () => {
      clearInterval(timer);
      window.removeEventListener('nispl_new_notification', handleNewNotif);
    };
  }, [loadNotifications]);

  // Dynamic Contract Renewal Check: generates renewal notifications for expiring agreements
  useEffect(() => {
    if (!contracts || !contracts.length) return;
    const now = new Date();

    contracts.forEach((c) => {
      const isExpiringStatus = c.status === 'expiring';
      let isNearExpiry = false;

      if (c.expiryDate) {
        const expDate = new Date(c.expiryDate);
        const daysRemaining = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
        if (daysRemaining <= 60) {
          isNearExpiry = true;
        }
      }

      if (isExpiringStatus || isNearExpiry) {
        const renewalId = `renewal_${c.id || c.contractCode || c._id}`;
        const stored = localStorage.getItem('nispl_admin_notifications_store') || '';
        if (!stored.includes(renewalId)) {
          notificationApi.createNotification({
            type: 'contract_renewal',
            title: 'Contract Renewal Due',
            message: `Contract "${c.name || c.contractCode}" for ${c.company} is due for renewal on ${c.expiryDate || 'upcoming cycle'}.`,
            severity: 'warning',
            entityType: 'contract',
            entityId: renewalId,
            user: {
              name: c.customer || c.primaryContact?.name || c.company,
              company: c.company,
              email: c.email || c.primaryContact?.email
            },
            metadata: {
              contractCode: c.contractCode || c.id,
              expiryDate: c.expiryDate,
              serviceTier: c.serviceTier || c.tier,
              value: c.contractValue
            }
          });
        }
      }
    });
  }, [contracts]);

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
    if (target && !target.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    await notificationApi.deleteNotification(id);
  };

  const handleClearAllNotif = async () => {
    setNotifications([]);
    setUnreadCount(0);
    toast.success('All notifications cleared');
    await notificationApi.clearAll();
  };

  // Load live customers & contracts with Sangam CRM synchronization status from backend
  useEffect(() => {
    let isMounted = true;
    customerApi.getCustomers().then((data) => {
      if (isMounted && data && Array.isArray(data) ) {
        setCustomers(data);
      }
    });
    contractApi.getContracts().then((data) => {
      if (isMounted && data && Array.isArray(data) ) {
        setContracts(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const currentUser = authApi.getCurrentUser();
  const adminName =
    userSession?.name || currentUser?.name || userSession?.user || 'NISPL Administrator';
  const adminEmail =
    userSession?.email || currentUser?.email || userSession?.user || 'admin@netinfotechsystem.in';

  // Manual Refresh Telemetry & Sangam CRM Sync
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [liveCustomers, liveContracts] = await Promise.all([
        customerApi.getCustomers(),
        contractApi.getContracts()
      ]);
      if (liveCustomers && Array.isArray(liveCustomers)) {
        setCustomers(liveCustomers);
      }
      if (liveContracts && Array.isArray(liveContracts)) {
        setContracts(liveContracts);
      }
      loadNotifications();
      toast.success('Live administrative records & Sangam CRM telemetry synchronized!', {
        style: {
          borderRadius: '12px',
          background: '#0f172a',
          color: '#ffffff',
          fontSize: '0.85rem'
        }
      });
    } catch (e) {
      toast.error('Failed to sync live telemetry from server.');
    } finally {
      setIsRefreshing(false);
    }
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
                isLoading={isNotifLoading}
              />
            </div>

            <AdminProfileMenu name={adminName} email={adminEmail} onSignOut={onSignOut} />
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

        {/* Mobile Drawer Backdrop — closes the off-canvas sidebar on tap */}
        {isMobileOpen && (
          <div
            className="adm-mobile-backdrop"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main Routed View Container */}
        <main className="adm-main-content">
          {/* 1. DEDICATED SEPARATE /CREATE PAGES */}
          {location.pathname === '/admin/customer/create' && (
            <CreateCustomerPage customers={customers} setCustomers={setCustomers} />
          )}

          {(location.pathname === '/admin/customer/contract/create' || location.pathname === '/admin/contract/create') && (
            <CreateContractPage contracts={contracts} setContracts={setContracts} customers={customers} />
          )}

          {(location.pathname === '/admin/customer/payment/create' || location.pathname === '/admin/payment/create') && (
            <CreatePaymentPage
              payments={payments}
              setPayments={setPayments}
              customers={customers}
              contracts={contracts}
            />
          )}

          {location.pathname === '/admin/product/tally/create' && (
            <CreateProductPage
              products={products}
              setProducts={setProducts}
              productType="tally"
            />
          )}

          {location.pathname === '/admin/product/cloud/create' && (
            <CreateProductPage
              products={products}
              setProducts={setProducts}
              productType="cloud"
            />
          )}

          {/* 2. REGULAR DIRECTORY & MANAGEMENT VIEWS */}
          {!location.pathname.endsWith('/create') && (
            <>
              {activeNav === 'overview' && (
                <OverviewSection
                  adminName={adminName}
                  contracts={contracts}
                  setContracts={setContracts}
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

              {activeNav === 'import-csv' && (
                <ImportCsvPage setCustomers={setCustomers} />
              )}

              {activeNav === 'sangam-sync' && (
                <SangamSyncPage customers={customers} setCustomers={setCustomers} />
              )}

              {activeNav === 'profile' && (
                <ProfilePage
                  adminName={adminName}
                  adminEmail={adminEmail}
                  onSignOut={onSignOut}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
