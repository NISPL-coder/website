import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
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
  Bell
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Shared console chrome (header + navigation rail + notification bell)
import ConsoleShell from './ConsoleShell';

// Components & Modular Sections
import OverviewSection from './OverviewSection';
import CustomerSection from './CustomerSection';
import ContractSection from './ContractSection';
import PaymentSection from './PaymentSection';
import ProductSection from './ProductSection';
import ReceiptSection from './ReceiptSection';
import UserAccessSection from './UserAccessSection';
import ActivityLogsSection from './ActivityLogsSection';
import NotificationsSection from './NotificationsSection';

// Dedicated Separate Create Pages (Replacing Modals with /create URLs)
import CreateCustomerPage from './CreateCustomerPage';
import CreateContractPage from './CreateContractPage';
import CreatePaymentPage from './CreatePaymentPage';
import CreateProductPage from './CreateProductPage';

// Admin Tools: Profile Page, CSV Import & Sangam CRM Sync
import ProfilePage from './ProfilePage';
import ImportCsvPage from './ImportCsvPage';
import SangamSyncPage from './SangamSyncPage';
import { authApi } from '../../../services/authApi';

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
import { contractApi } from '../../../services/contractApi';
import { paymentApi } from '../../../services/paymentApi';
import { productApi } from '../../../services/productApi';
import { PermissionsProvider, usePermissions, MODULE_LABELS } from './PermissionsContext';

// Which permission module unlocks each admin view
const NAV_MODULE = {
  overview: 'overview',
  customer: 'customer',
  contract: 'contract',
  payment: 'payment',
  product: 'product',
  receipt: 'receipt',
  'import-csv': 'import_csv',
  'sangam-sync': 'sangam_sync',
  'user-access': 'user_access',
  'activity-logs': 'activity_logs',
  profile: null
};

const FIRST_ALLOWED_ROUTE = [
  ['overview', '/admin/overview'],
  ['customer', '/admin/customer'],
  ['contract', '/admin/customer/contract'],
  ['payment', '/admin/customer/payment'],
  ['product', '/admin/product'],
  ['receipt', '/admin/receipt'],
  ['import_csv', '/admin/import-csv'],
  ['sangam_sync', '/admin/sangam-sync'],
  ['data_tools', '/admin/sangam-sync'],
  ['user_access', '/admin/user-access'],
  ['activity_logs', '/admin/activity-logs']
];

function NoAccessCard({ moduleName, action = 'view', target }) {
  const navigate = useNavigate();
  const label = MODULE_LABELS[moduleName] || moduleName;
  return (
    <div className="adm-noaccess">
      <div className="adm-noaccess-icon">
        <ShieldAlert size={26} />
      </div>
      <h3>Access restricted</h3>
      <p>
        Your role has not been granted{' '}
        <strong>{action === 'view' ? 'access to' : `permission to ${action} in`}</strong> the {label} module. Ask a
        primary administrator to extend your access from User Access &rarr; Grant Access.
      </p>
      {target && (
        <button type="button" className="adm-btn-primary" onClick={() => navigate(target[1])}>
          Go to {MODULE_LABELS[target[0]]}
        </button>
      )}
    </div>
  );
}

export default function AdminDashboard(props) {
  return (
    <PermissionsProvider>
      <AdminDashboardShell {...props} />
    </PermissionsProvider>
  );
}

function AdminDashboardShell({ userSession, onSignOut }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { can, isReady, user: liveUser } = usePermissions();

  // Authentication guard: ensure valid token & admin/staff privileges
  useEffect(() => {
    if (!authApi.isAuthenticated(['admin', 'manager', 'support'])) {
      if (onSignOut) {
        onSignOut();
      } else {
        navigate('/login?portal=admin', { replace: true });
      }
    }
  }, [navigate, onSignOut]);

  // Derive active view from current URL pathname
  const activeNav = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/admin/customer/contract')) return 'contract';
    if (path.includes('/admin/customer/payment')) return 'payment';
    if (path === '/admin/customer' || path.startsWith('/admin/customer')) return 'customer';
    if (path.includes('/admin/user-access') || path.includes('/admin/staff')) return 'user-access';
    if (path.includes('/admin/activity-logs') || path.includes('/admin/activity_logs')) return 'activity-logs';
    if (path.includes('/admin/notifications')) return 'notifications';
    if (path.includes('/admin/import-csv')) return 'import-csv';
    if (path.includes('/admin/sangam-sync')) return 'sangam-sync';
    if (path.includes('/admin/profile')) return 'profile';
    if (path.includes('/admin/product')) return 'product';
    if (path.includes('/admin/receipt')) return 'receipt';
    return 'overview';
  }, [location.pathname]);

  // Permission module backing the current view
  const viewModule = NAV_MODULE[activeNav] ?? null;

  const createModule = useMemo(() => {
    const path = location.pathname;
    if (path === '/admin/customer/create') return 'customer';
    if (path === '/admin/customer/contract/create' || path === '/admin/contract/create') return 'contract';
    if (path === '/admin/customer/payment/create' || path === '/admin/payment/create') return 'payment';
    if (path.startsWith('/admin/product/') && path.endsWith('/create')) return 'product';
    return null;
  }, [location.pathname]);

  const blockedView = Boolean(viewModule) && isReady && !can(viewModule);
  const blockedCreate = Boolean(createModule) && isReady && !can(createModule, 'create');

  const allowedTarget = useMemo(
    () =>
      FIRST_ALLOWED_ROUTE.find(
        ([navModule]) => navModule !== viewModule && navModule !== createModule && can(navModule)
      ),
    [can, viewModule, createModule]
  );

  // Land an under-privileged staff on the first module they can actually open
  useEffect(() => {
    if (!isReady) return;
    if (location.pathname !== '/admin/overview') return;
    if (can('overview')) return;
    const target = FIRST_ALLOWED_ROUTE.find(([navModule]) => can(navModule));
    if (target) navigate(target[1], { replace: true });
  }, [isReady, can, location.pathname, navigate]);

  // Global search & refresh states
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Bumped after a manual sync so the shell's bell re-reads the live stream.
  const [notifRefreshKey, setNotifRefreshKey] = useState(0);

  // Handle removed receipt/product create page redirects
  useEffect(() => {
    if (location.pathname === '/admin/receipt/create') {
      navigate('/admin/receipt', { replace: true });
    }
    if (location.pathname === '/admin/product/create') {
      navigate('/admin/product', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Persistent Datasets in State
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [customerStats, setCustomerStats] = useState(null);
  const [contracts, setContracts] = useState(INITIAL_CONTRACTS);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [receipts, setReceipts] = useState(INITIAL_RECEIPTS);

  // Dynamic Customer Payment Due Date Check: generates notification if payment is coming soon or pending
  useEffect(() => {
    if (!payments || !payments.length) return;
    const now = new Date();

    payments.forEach((p) => {
      const expDateStr = p.expectedPaymentDate || p.dueDate;
      const isPending = p.status === 'Pending' || p.status === 'Overdue';
      let isComingSoon = false;

      if (expDateStr) {
        const expDate = new Date(expDateStr);
        if (!isNaN(expDate.getTime())) {
          const daysRemaining = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
          // If due within next 14 days or due today/overdue
          if (daysRemaining <= 14) {
            isComingSoon = true;
          }
        }
      }

      if (isComingSoon || isPending) {
        const dueId = `payment_due_${p.id || p.invoiceNumber || p.invoiceRef}`;
        // The backend treats entityId as an idempotency key, so re-raising a due
        // payment on the next poll cannot flood the stream with duplicates.
        notificationApi.createNotification({
          type: 'payment_due_soon',
          title: 'Customer Payment Due Soon',
          message: `Customer payment of ${p.pendingPayment || p.receivedAmount || p.amount || 'dues'} from ${p.accountName || p.company || p.customer || 'Customer'} is due on ${expDateStr || 'upcoming billing cycle'}.`,
          severity: 'warning',
          entityType: 'payment',
          entityId: dueId,
          user: {
            name: p.name || p.customer,
            company: p.accountName || p.company
          },
          metadata: {
            paymentId: p.id,
            invoiceNumber: p.invoiceNumber || p.invoiceRef,
            expectedPaymentDate: expDateStr,
            amount: p.pendingPayment || p.amount,
            status: p.status
          }
        });
      }
    });
  }, [payments]);

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
    });
  }, [contracts]);

  // Load live customers & contracts with Sangam CRM synchronization status from backend
  useEffect(() => {
    let isMounted = true;
    if (can('customer', 'view')) {
      customerApi.getCustomers().then((data) => {
        if (isMounted && data && Array.isArray(data)) {
          setCustomers(data);
          if (data.stats) {
            setCustomerStats(data.stats);
          }
        }
      });
    }
    if (can('contract', 'view')) {
      contractApi.getContracts().then((data) => {
        if (isMounted && data && Array.isArray(data)) {
          setContracts(data);
        }
      });
    }
    if (can('payment', 'view')) {
      paymentApi.getPayments().then((data) => {
        if (isMounted && data && Array.isArray(data) && data.length) {
          setPayments(data);
        }
      });
    }
    // Load live product catalog from database
    productApi.getProducts().then((data) => {
      if (isMounted && data && Array.isArray(data) && data.length) {
        setProducts(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [can]);

  // The receipt list is the payment ledger read back with its customer,
  // subscription and product joined, so it reloads whenever money lands.
  useEffect(() => {
    if (!can('receipt', 'view')) return undefined;

    let isMounted = true;
    paymentApi.getReceipts().then((data) => {
      if (isMounted && Array.isArray(data)) setReceipts(data);
    });
    return () => {
      isMounted = false;
    };
  }, [can, payments]);

  const currentUser = authApi.getCurrentUser();
  const adminName =
    userSession?.name || currentUser?.name || userSession?.user || 'NISPL Administrator';
  const adminEmail =
    userSession?.email || currentUser?.email || userSession?.user || 'admin@netinfotechsystem.in';
  // liveUser is the /users/me response, so a role change shows up without a sign-out.
  const adminRole = liveUser?.role || currentUser?.role || userSession?.role || '';
  const adminIsPrimaryAdmin = Boolean(
    liveUser?.isPrimaryAdmin ?? currentUser?.isPrimaryAdmin ?? userSession?.isPrimaryAdmin
  );

  // The full stream page is an administrator tool, not an RBAC module.
  const isAdminPortal = adminRole === 'admin';

  // The bell owns the unread count; the navigation rail mirrors it.
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  useEffect(() => {
    const handleUnread = (event) => setUnreadNotifCount(event.detail?.count || 0);
    window.addEventListener('nispl_unread_notifications', handleUnread);
    return () => window.removeEventListener('nispl_unread_notifications', handleUnread);
  }, []);

  // Notification the bell deep-linked us to, if any
  const focusNotificationId = useMemo(
    () => new URLSearchParams(location.search).get('focus') || '',
    [location.search]
  );

  // Navigation rail — only the modules this account has actually been granted.
  const navItems = useMemo(() => {
    const items = [];

    if (can('overview')) {
      items.push({ id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/admin/overview' });
    }

    const canCustomer = can('customer');
    const canContract = can('contract');
    const canPayment = can('payment');
    if (canCustomer || canContract || canPayment) {
      const submenu = [];
      if (canContract) {
        submenu.push({ id: 'contract', label: 'Contract', icon: FileText, path: '/admin/customer/contract', title: 'Customer Contracts' });
      }
      if (canPayment) {
        submenu.push({ id: 'payment', label: 'Payment', icon: CreditCard, path: '/admin/customer/payment', title: 'Customer Payments' });
      }
      items.push({
        id: 'customer',
        label: 'Customer',
        icon: Users,
        title: 'Customer Listing & Management',
        // A manager granted only a child module still needs a working parent entry
        path: canCustomer ? '/admin/customer' : canContract ? '/admin/customer/contract' : '/admin/customer/payment',
        submenu: submenu.length ? submenu : undefined
      });
    }

    if (can('product')) {
      items.push({ id: 'product', label: 'Product', icon: Package, path: '/admin/product', title: 'Product Catalog & Availability' });
    }
    if (can('receipt')) {
      items.push({ id: 'receipt', label: 'Receipt', icon: ReceiptText, path: '/admin/receipt', title: 'Payment Receipts' });
    }

    const canImportCsv = can('import_csv') || can('data_tools');
    const canSangamSync = can('sangam_sync') || can('data_tools');
    if (canImportCsv) {
      items.push({ id: 'import-csv', group: 'Data Tools', label: 'Import CSV', icon: FileUp, path: '/admin/import-csv', title: 'Bulk Import Customers via CSV' });
    }
    if (canSangamSync) {
      items.push({ id: 'sangam-sync', group: canImportCsv ? undefined : 'Data Tools', label: 'Sangam Sync', icon: RefreshCw, path: '/admin/sangam-sync', title: 'Sangam CRM Synchronization Status' });
    }

    const canUserAccess = can('user_access');
    const canActivityLogs = can('activity_logs');
    if (canUserAccess) {
      items.push({ id: 'user-access', group: 'Administration', label: 'User Access', icon: UserCheck, path: '/admin/user-access', title: 'User Access & Staff Permissions' });
    }
    if (canActivityLogs) {
      items.push({ id: 'activity-logs', group: canUserAccess ? undefined : 'Administration', label: 'Activity Logs', icon: Activity, path: '/admin/activity-logs', title: 'Admin Activity Logs & Audit Trail' });
    }
    if (isAdminPortal) {
      items.push({
        id: 'notifications',
        group: canUserAccess || canActivityLogs ? undefined : 'Administration',
        label: 'Notifications',
        icon: Bell,
        path: '/admin/notifications',
        badge: unreadNotifCount,
        title: 'Full Notification Stream & Event Details'
      });
    }

    return items;
  }, [can, isAdminPortal, unreadNotifCount]);

  const sidebarEmptyNote =
    !can('user_access') &&
    !can('activity_logs') &&
    !can('import_csv') &&
    !can('sangam_sync') &&
    !can('data_tools')
      ? 'No modules have been granted to your account yet.'
      : '';

  // Manual Refresh Telemetry & Sangam CRM Sync
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [liveCustomers, liveContracts] = await Promise.all([
        can('customer', 'view') ? customerApi.getCustomers() : null,
        can('contract', 'view') ? contractApi.getContracts() : null
      ]);
      if (liveCustomers && Array.isArray(liveCustomers)) {
        setCustomers(liveCustomers);
        if (liveCustomers.stats) {
          setCustomerStats(liveCustomers.stats);
        }
      }
      if (liveContracts && Array.isArray(liveContracts)) {
        setContracts(liveContracts);
      }
      setNotifRefreshKey((prev) => prev + 1);
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
    <>
      <Toaster position="top-right" />

      <ConsoleShell
        brandTo="/admin/overview"
        searchPlaceholder="Search contracts, payments, products, receipts..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        navItems={navItems}
        activeNav={activeNav}
        sidebarAriaLabel="Admin Navigation Hierarchy"
        sidebarEmptyNote={sidebarEmptyNote}
        notificationsPath={isAdminPortal ? '/admin/notifications' : undefined}
        profile={{
          name: adminName,
          email: adminEmail,
          role: adminRole || 'admin',
          isPrimaryAdmin: adminIsPrimaryAdmin
        }}
        onSignOut={onSignOut}
        refreshKey={notifRefreshKey}
      >
          {/* 1. DEDICATED SEPARATE /CREATE PAGES */}
          {blockedCreate ? (
            <NoAccessCard moduleName={createModule} action="create" target={allowedTarget} />
          ) : (
            <>
              {location.pathname === '/admin/customer/create' && (
                <CreateCustomerPage customers={customers} setCustomers={setCustomers} />
              )}

              {(location.pathname === '/admin/customer/contract/create' ||
                location.pathname === '/admin/contract/create') && (
                <CreateContractPage contracts={contracts} setContracts={setContracts} customers={customers} />
              )}

              {(location.pathname === '/admin/customer/payment/create' ||
                location.pathname === '/admin/payment/create') && (
                <CreatePaymentPage
                  payments={payments}
                  setPayments={setPayments}
                  customers={customers}
                  contracts={contracts}
                  products={products}
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
            </>
          )}

          {/* 2. REGULAR DIRECTORY & MANAGEMENT VIEWS */}
          {!location.pathname.endsWith('/create') &&
            (blockedView ? (
              <NoAccessCard moduleName={viewModule} target={allowedTarget} />
            ) : (
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
                  customerStats={customerStats}
                  setCustomerStats={setCustomerStats}
                  receipts={receipts}
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

              {activeNav === 'receipt' && <ReceiptSection receipts={receipts} />}

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
                />
              )}

              {activeNav === 'user-access' && (
                <UserAccessSection />
              )}

              {activeNav === 'activity-logs' && (
                <ActivityLogsSection />
              )}

              {activeNav === 'notifications' &&
                (isAdminPortal ? (
                  <NotificationsSection focusId={focusNotificationId} />
                ) : (
                  <div className="adm-noaccess">
                    <div className="adm-noaccess-icon">
                      <ShieldAlert size={26} />
                    </div>
                    <h3>Administrators only</h3>
                    <p>
                      The complete notification stream is available to administrator accounts. Staff
                      roles keep their filtered alerts in the header bell.
                    </p>
                  </div>
                ))}
            </>
            ))}
      </ConsoleShell>
    </>
  );
}
