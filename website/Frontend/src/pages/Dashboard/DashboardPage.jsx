import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ReceiptText,
  LifeBuoy
} from 'lucide-react';
import ConsoleShell from '../login/Admin/ConsoleShell';
import CustomerProfilePage from './components/CustomerProfilePage';
import CloudPortalOverview from '../login/customer/overview';
import ProductsSection from '../login/customer/product';
import CartSection from '../login/customer/cart';
import ReceiptSection from '../login/customer/receipt';
import HelpSection from '../login/customer/help';
import SupportTicketModal from './components/SupportTicketModal';
import CustomerEmailOtpModal from '../../components/modals/CustomerEmailOtpModal';
import { customerAuthService } from '../CustomerRegister/services/customerAuthService';
import { authApi } from '../../services/authApi';
import { cartApi } from '../../services/cartApi';
import { dashboardApi } from '../../services/dashboardApi';
import { formatINR } from './utils/pricingUtils';
import { toPortalReceiptRows } from './utils/portalReceiptRows';
import { useRazorpayCheckout } from '../../utils/useRazorpayCheckout';
import './Dashboard.css';

const NAV_TO_PATH = {
  overview: '/customer/overview',
  products: '/customer/product',
  cart: '/customer/cart',
  receipt: '/customer/receipt',
  help: '/customer/help',
  profile: '/customer/profile'
};

const formatReceiptDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Portal sections the header search can jump to. Record matches come from the
// API; these are the pages themselves, matched on the words customers use.
const SEARCH_PAGES = [
  { target: 'overview', title: 'Overview', subtitle: 'Products, payments and renewals at a glance', keywords: 'overview home dashboard summary start' },
  { target: 'products', title: 'Products & plans', subtitle: 'Browse and buy NISPL plans', keywords: 'product products plan plans catalogue buy store tally cloud subscription' },
  { target: 'cart', title: 'Cart', subtitle: 'Items waiting for checkout', keywords: 'cart checkout basket order items' },
  { target: 'receipt', title: 'Receipts', subtitle: 'Invoices and payment history', keywords: 'receipt receipts invoice invoices history download gst bill' },
  { target: 'help', title: 'Help Center', subtitle: 'Support, FAQs and contact', keywords: 'help support faq contact ticket raise issue' },
  { target: 'profile', title: 'Profile', subtitle: 'Account and company details', keywords: 'profile account details company address contact password' }
];

// A section only qualifies when the term names it: title match or one of its
// own keywords. Descriptions never decide, so "payment" does not list every
// page that happens to mention payments.
const pageRelevance = (page, term) => {
  const title = page.title.toLowerCase();
  const words = page.keywords.split(' ');
  if (title === term) return 0;
  if (title.startsWith(term)) return 1;
  if (words.includes(term)) return 2;
  if (title.includes(term)) return 3;
  return -1;
};

const buildPagesGroup = (term) => {
  const needle = term.toLowerCase();
  const items = SEARCH_PAGES.map((page) => ({ page, score: pageRelevance(page, needle) }))
    .filter(({ score }) => score >= 0 && score <= 3)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map(({ page }) => ({ ...page, id: `page-${page.target}`, trailing: 'Page', seed: term }));

  return items.length ? [{ key: 'pages', label: 'Go to', items }] : [];
};

// Plans the account already owns, straight from the ledger, so the catalogue
// always shows what is running before anything new is bought.
function CurrentPlansStrip({ entitlements = [] }) {
  if (!entitlements.length) return null;

  return (
    <div
      className="flowmail-card"
      style={{
        padding: '14px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap'
      }}
    >
      <span
        style={{
          fontSize: '0.78rem',
          fontWeight: '700',
          color: '#64748b',
          letterSpacing: '0.04em',
          textTransform: 'uppercase'
        }}
      >
        Active on your account
      </span>
      {entitlements.map((entitlement) => (
        <span
          key={entitlement.productId || entitlement.name}
          className="flowmail-trend-pill positive"
          style={{ fontSize: '0.78rem', padding: '5px 12px' }}
        >
          {entitlement.name}
          {entitlement.expiryDate ? ` • valid till ${formatReceiptDate(entitlement.expiryDate)}` : ''}
        </span>
      ))}
    </div>
  );
}

export default function DashboardPage({ onSignOut: propOnSignOut }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getNavFromPath = (pathname) => {
    if (pathname.includes('/customer/product')) return 'products';
    if (pathname.includes('/customer/cart')) return 'cart';
    if (pathname.includes('/customer/receipt')) return 'receipt';
    if (pathname.includes('/customer/help')) return 'help';
    if (pathname.includes('/customer/profile')) return 'profile';
    return 'overview';
  };

  // State
  const [customer, setCustomer] = useState(null);

  // Options: 'overview' | 'products' | 'cart' | 'receipt' | 'help' | 'profile'
  const [activeNav, setActiveNav] = useState(() => getNavFromPath(location.pathname));

  useEffect(() => {
    setActiveNav(getNavFromPath(location.pathname));
  }, [location.pathname]);

  // Authentication guard: ensure valid token & customer privileges
  useEffect(() => {
    if (!authApi.isAuthenticated(['customer'])) {
      if (propOnSignOut) {
        propOnSignOut();
      } else {
        navigate('/customer-login', { replace: true });
      }
    }
  }, [navigate, propOnSignOut]);

  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  // Term handed to the section a search result opened, so it lands pre-filtered.
  const [sectionSearch, setSectionSearch] = useState('');
  const [receipts, setReceipts] = useState([]);

  // Cart mirrors the backend cart for this account
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState(null);

  // The account's own ledger from /api/dashboard/me: KPIs, products, payments, reminder
  const [portal, setPortal] = useState(null);

  // Email verification modal state
  const [isEmailOtpModalOpen, setIsEmailOtpModalOpen] = useState(false);
  const [hasDismissedOtpModal, setHasDismissedOtpModal] = useState(false);

  const isEmailVerified = Boolean(customer?.isEmailVerified || portal?.account?.isEmailVerified);

  // Active Demo Trial status check — When demo is taken, product purchases are locked until demo expires
  const activeDemos = portal?.demoProducts || [];
  const activeDemo =
    activeDemos.find((d) => !d.expired && String(d.status).toUpperCase() !== 'DEMO-INACTIVE') ||
    (portal?.products || []).find((p) =>
      Boolean(p.isDemoTrial || p.contractType === 'Trial' || p.category === 'Trial' || String(p.status).toUpperCase() === 'DEMO') &&
      !p.expired &&
      String(p.status).toUpperCase() !== 'DEMO-INACTIVE'
    ) ||
    null;

  const isDemoActive = Boolean(
    activeDemo ||
    portal?.account?.status === 'Demo' ||
    customer?.status === 'Demo' ||
    (portal?.kpi?.demoProducts > 0)
  );

  const demoExpiryDate = activeDemo?.expiryDate || activeDemo?.endDate || null;

  // Automatically prompt customer to verify their primary email via OTP upon logging into their portal
  useEffect(() => {
    if (customer && !isEmailVerified && !hasDismissedOtpModal) {
      setIsEmailOtpModalOpen(true);
    }
  }, [customer, isEmailVerified, hasDismissedOtpModal]);

  const handleEmailVerified = (result) => {
    setCustomer((prev) => ({
      ...prev,
      isEmailVerified: true,
      emailVerifiedAt: result?.emailVerifiedAt || new Date().toISOString()
    }));
    setPortal((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        account: {
          ...prev.account,
          isEmailVerified: true,
          emailVerifiedAt: result?.emailVerifiedAt || new Date().toISOString()
        }
      };
    });
    setIsEmailOtpModalOpen(false);
  };

  const applyCartPayload = (cartData) => {
    if (!cartData) return;
    if (Array.isArray(cartData.items)) setCartItems(cartData.items);
    if (cartData.summary) setCartSummary(cartData.summary);
  };

  const syncPortal = async () => {
    try {
      const data = await dashboardApi.getMyOverview();
      setPortal(data);
      // The receipt ledger is this account's own payment rows.
      setReceipts(toPortalReceiptRows(data?.payments));
      return data;
    } catch (err) {
      console.warn('Account ledger API fallback:', err?.message);
      return null;
    }
  };

  // Load active customer session and sync initial cart from backend API
  useEffect(() => {
    const activeCustomer = customerAuthService.getCurrentCustomer();
    setCustomer(activeCustomer);

    // Dynamic sync with backend API profile
    authApi.getMe().then((freshUser) => {
      if (freshUser) {
        setCustomer(freshUser);
      }
    }).catch((err) => {
      console.warn('Backend API profile sync fallback:', err?.message);
    });

    const syncInitialCart = async () => {
      try {
        applyCartPayload(await cartApi.getCart());
      } catch (err) {
        console.warn('Initial cart sync fallback:', err);
      }
    };

    syncInitialCart();
    syncPortal();
  }, []);

  // A payment the finance desk books in from a cheque or bank transfer is not
  // pushed into this session, so the ledger is re-read when the account holder
  // returns to the tab rather than only on a full reload.
  useEffect(() => {
    const refreshLedger = () => {
      if (document.visibilityState === 'visible') syncPortal();
    };

    document.addEventListener('visibilitychange', refreshLedger);
    return () => document.removeEventListener('visibilitychange', refreshLedger);
  }, []);

  const handleSelectNav = (navId) => {
    setActiveNav(navId);
    const targetPath = NAV_TO_PATH[navId];
    if (targetPath && location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  const handleSearchChange = (value) => setSearchTerm(value);

  // Dropdown results: portal pages matched locally, records matched by the
  // account-scoped search API.
  useEffect(() => {
    const term = searchTerm.trim();
    if (term.length < 3) {
      setSearchResults([]);
      setIsSearchLoading(false);
      return undefined;
    }

    let cancelled = false;
    setIsSearchLoading(true);

    const timer = setTimeout(async () => {
      try {
        const data = await dashboardApi.searchPortal(term);
        if (cancelled) return;
        const recordGroups = (data?.groups || []).map((group) => ({
          ...group,
          items: group.items.map((item) => ({
            ...item,
            seed: item.title,
            trailing: item.amount ? formatINR(item.amount) : item.meta || '—'
          }))
        }));
        setSearchResults([...buildPagesGroup(term), ...recordGroups]);
      } catch (err) {
        console.warn('Portal search API unreachable:', err?.message);
        if (!cancelled) setSearchResults(buildPagesGroup(term));
      } finally {
        if (!cancelled) setIsSearchLoading(false);
      }
    }, 260);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const handleSearchResultSelect = (item) => {
    if (!item?.target) return;
    setSectionSearch(item.seed || searchTerm.trim());
    setSearchTerm('');
    handleSelectNav(item.target);
  };

  const handleSignOut = () => {
    customerAuthService.logout();
    if (propOnSignOut) {
      propOnSignOut();
    } else {
      navigate('/customer-login');
    }
  };

  // Dynamic Cart Handlers with Backend API Sync
  const handleAddToCart = async (product) => {
    // 1. Optimistic UI update
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + (product.quantity || 1) }
            : item
        );
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });

    // 2. Real-time API Sync
    try {
      const updated = await cartApi.addToCart(product);
      applyCartPayload(updated);
      // The customer asked for the cart immediately after adding
      handleSelectNav('cart');
    } catch (e) {
      console.warn('Add to cart API sync fallback:', e);
      toast.error('Cart service unreachable — the item is held locally until the API is back.');
    }
  };

  const handleUpdateQuantity = async (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    // Optimistic UI update
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );

    // API Sync
    try {
      applyCartPayload(await cartApi.updateQuantity(id, newQty));
    } catch (e) {
      console.warn('Update quantity API sync fallback:', e);
    }
  };

  const handleRemoveItem = async (id) => {
    // Optimistic UI update
    setCartItems((prev) => prev.filter((item) => item.id !== id));

    // API Sync
    try {
      applyCartPayload(await cartApi.removeItem(id));
    } catch (e) {
      console.warn('Remove item API sync fallback:', e);
    }
  };

  // Payment Handlers
  const handlePaymentSuccess = async () => {
    // The server already emptied the cart for a cart checkout, so both the
    // ledger and the cart are re-read rather than patched locally.
    setCartItems([]);
    setCartSummary(null);
    await syncPortal();
    try {
      applyCartPayload(await cartApi.getCart());
    } catch (e) {
      console.warn('Cart re-sync after payment fallback:', e);
    }
    handleSelectNav('receipt');
  };

  const { pay, isPaying } = useRazorpayCheckout({ onSuccess: handlePaymentSuccess });

  // What this account can pay right now, in priority order: a quoted cart, then
  // open invoices on the ledger, then the nearest renewal.
  const checkout = useMemo(() => {
    const grand = Math.round(Number(cartSummary?.grandTotal) || 0);
    if (cartItems.length > 0 && grand > 0) {
      return {
        mode: 'cart',
        label: cartItems.length === 1 ? cartItems[0].name : `${cartItems.length} items in your cart`,
        amount: grand,
        subtotal: Math.round(Number(cartSummary?.subtotal) || 0),
        gst: Math.round(Number(cartSummary?.gstAmount) || 0)
      };
    }

    const kpi = portal?.kpi || {};
    const totalPending = Math.round(Number(kpi.totalPending) || 0);
    if (totalPending > 0) {
      const reminder = portal?.reminder;
      const openCount = Math.max(Number(kpi.pendingInvoices) || 1, 1);
      const invoice = reminder?.kind === 'payment' ? reminder.invoiceNumber : null;
      return {
        mode: 'dues',
        label: invoice
          ? openCount === 1
            ? `Invoice ${invoice}`
            : `Invoice ${invoice} + ${openCount - 1} more`
          : 'Open invoices on your account',
        invoiceCount: openCount,
        amount: totalPending,
        subtotal: totalPending,
        gst: 0
      };
    }

    const renewal = portal?.reminder?.kind === 'renewal' ? portal.reminder : null;
    if (renewal?.contractId && renewal.amount > 0) {
      const total = Math.round(renewal.amount);
      return {
        mode: 'renewal',
        label: `Renewal: ${renewal.title}`,
        contractId: renewal.contractId,
        amount: total,
        subtotal: total,
        gst: 0
      };
    }

    return { mode: 'none', amount: 0, subtotal: 0, gst: 0 };
  }, [cartItems, cartSummary, portal]);

  // Without a scope the prioritized checkout is priced: cart, then open
  // invoices, then the nearest renewal. Overview passes an explicit scope
  // when a specific invoice or renewal is being paid.
  const startPayment = (scope) => {
    pay(scope || checkout);
  };

  const navItems = useMemo(
    () => [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/customer/overview' },
      { id: 'products', label: 'Products', icon: Package, path: '/customer/product' },
      { id: 'cart', label: 'Cart', icon: ShoppingCart, path: '/customer/cart', badge: cartItems.length },
      { id: 'receipt', label: 'Receipt', icon: ReceiptText, path: '/customer/receipt' },
      { id: 'help', label: 'Help Center', icon: LifeBuoy, path: '/customer/help', group: 'Support' }
    ],
    [cartItems.length]
  );

  return (
    <>
      {/* React Hot Toast — positioned top-right, wide enough for renewal cards */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
          }
        }}
      />

      <ConsoleShell
        brandTo="/customer/overview"
        searchPlaceholder="Search products, plans, receipts..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchResults={searchResults}
        isSearchLoading={isSearchLoading}
        onSearchResultSelect={handleSearchResultSelect}
        navItems={navItems}
        activeNav={activeNav}
        onNavigate={(item) => handleSelectNav(item.id)}
        sidebarAriaLabel="Customer Portal Navigation"
        profile={{
          name: customer?.name || portal?.account?.name || portal?.account?.company || 'NISPL Customer',
          email: customer?.email || portal?.account?.email || '',
          role: customer?.role || 'customer',
          profilePath: '/customer/profile'
        }}
        onSignOut={handleSignOut}
      >
          {/* TAB 1: OVERVIEW */}
          {activeNav === 'overview' && (
            <CloudPortalOverview
              customer={customer}
              portalData={portal}
              onNavigateTab={handleSelectNav}
              onPay={startPayment}
              onOpenSupport={() => setIsSupportModalOpen(true)}
              onOpenVerifyEmail={() => setIsEmailOtpModalOpen(true)}
            />
          )}

          {/* TAB 2: PRODUCTS */}
          {activeNav === 'products' && (
            <div className="flowmail-overview-container animate-fade-in">
              <ProductsSection
                customer={customer}
                account={portal?.account}
                portalData={portal}
                isReadOnly={false}
                isDemoActive={false}
                demoExpiryDate={demoExpiryDate}
                onAddToCart={handleAddToCart}
                onGoToCart={() => handleSelectNav('cart')}
                cartItemIds={cartItems.map((c) => c.id)}
                entitlements={portal?.entitlements}
                externalSearch={sectionSearch}
              />
            </div>
          )}

          {/* TAB 3: CART */}
          {activeNav === 'cart' && (
            <div className="flowmail-overview-container animate-fade-in">
              <CartSection
                cartItems={cartItems}
                isReadOnly={false}
                isDemoActive={false}
                demoExpiryDate={demoExpiryDate}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onProceedToPayment={() => pay(checkout)}
                isCheckingOut={isPaying}
                onBrowseProducts={() => handleSelectNav('products')}
                onAddToCart={handleAddToCart}
              />
            </div>
          )}

          {/* TAB 5: RECEIPT */}
          {activeNav === 'receipt' && (
            <div className="flowmail-overview-container animate-fade-in">
              <ReceiptSection
                receipts={receipts}
                customer={customer}
                account={portal?.account}
                externalSearch={sectionSearch}
              />
            </div>
          )}

          {/* TAB 6: HELP CENTER */}
          {activeNav === 'help' && (
            <div className="flowmail-overview-container animate-fade-in">
              <HelpSection customer={customer} />
            </div>
          )}
          {/* TAB 7: PROFILE */}
          {activeNav === 'profile' && (
            <CustomerProfilePage
              customer={customer}
              onSignOut={propOnSignOut}
            />
          )}
      </ConsoleShell>

      {/* Support & Inquiry Modal */}
      <SupportTicketModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        customer={customer}
      />

      {/* Customer Primary Email Verification OTP Modal */}
      <CustomerEmailOtpModal
        isOpen={isEmailOtpModalOpen}
        onClose={() => {
          setIsEmailOtpModalOpen(false);
          setHasDismissedOtpModal(true);
        }}
        customerEmail={customer?.email || portal?.account?.email || ''}
        customerName={customer?.name || portal?.account?.name || ''}
        onVerified={handleEmailVerified}
      />
    </>
  );
}
