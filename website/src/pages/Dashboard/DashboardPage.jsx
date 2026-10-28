import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import DashboardSidebar from './components/DashboardSidebar';
import DashboardNavbar from './components/DashboardNavbar';
import CloudPortalOverview from './components/CloudPortalOverview';
import CustomerProfileCard from './components/CustomerProfileCard';
import DashboardStats from './components/DashboardStats';
import CloudInstancesSection from './components/CloudInstancesSection';
import ProductsSection from './components/ProductsSection';
import CartSection from './components/CartSection';
import PaymentSection from './components/PaymentSection';
import ReceiptSection from './components/ReceiptSection';
import HelpSection from './components/HelpSection';
import SupportTicketModal from './components/SupportTicketModal';
import { useRenewalToasts } from './components/RemindersPanel';
import { customerAuthService } from '../CustomerRegister/services/customerAuthService';
import { authApi } from '../../services/authApi';
import { cartApi } from '../../services/cartApi';
import { INITIAL_NOTIFICATIONS, INITIAL_INVOICES } from './data/mockDashboardData';
import './Dashboard.css';

const PATH_TO_NAV = {
  '/customer/overview': 'overview',
  '/customer/product': 'products',
  '/customer/products': 'products',
  '/customer/cart': 'cart',
  '/customer/receipt': 'receipt',
  '/customer/payment': 'payment',
  '/customer/help': 'help'
};

const NAV_TO_PATH = {
  overview: '/customer/overview',
  products: '/customer/product',
  cart: '/customer/cart',
  receipt: '/customer/receipt',
  payment: '/customer/payment',
  help: '/customer/help'
};

export default function DashboardPage({ onSignOut: propOnSignOut }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getNavFromPath = (pathname) => {
    if (pathname.includes('/customer/product')) return 'products';
    if (pathname.includes('/customer/cart')) return 'cart';
    if (pathname.includes('/customer/receipt')) return 'receipt';
    if (pathname.includes('/customer/payment')) return 'payment';
    if (pathname.includes('/customer/help')) return 'help';
    return 'overview';
  };

  // State
  const [customer, setCustomer] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Options: 'overview' | 'products' | 'payment' | 'cart' | 'receipt'
  const [activeNav, setActiveNav] = useState(() => getNavFromPath(location.pathname));

  useEffect(() => {
    setActiveNav(getNavFromPath(location.pathname));
  }, [location.pathname]);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [notifications] = useState(INITIAL_NOTIFICATIONS);
  const [receipts, setReceipts] = useState(INITIAL_INVOICES);

  // Cart State (Backed by live API)
  const [cartItems, setCartItems] = useState([
    {
      id: 'prod-tss-single',
      name: 'TSS Renewal (Single User)',
      basePrice: 4500,
      quantity: 1
    }
  ]);
  const [fulfillmentMode, setFulfillmentMode] = useState('digital');

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
        const cartData = await cartApi.getCart();
        if (cartData && Array.isArray(cartData.items)) {
          setCartItems(cartData.items);
          if (cartData.fulfillmentMode) {
            setFulfillmentMode(cartData.fulfillmentMode);
          }
        }
      } catch (err) {
        console.warn('Initial cart sync fallback:', err);
      }
    };

    syncInitialCart();
  }, []);

  const handleSelectNav = (navId) => {
    setActiveNav(navId);
    setIsMobileSidebarOpen(false);
    const targetPath = NAV_TO_PATH[navId];
    if (targetPath && location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  const handleSignOut = () => {
    customerAuthService.logout();
    if (propOnSignOut) {
      propOnSignOut();
    } else {
      navigate('/customer-login');
    }
  };

  // Fire plan renewal toast reminders on first load
  useRenewalToasts(handleSelectNav);

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
      if (updated?.items) {
        setCartItems(updated.items);
      }
    } catch (e) {
      console.warn('Add to cart API sync fallback:', e);
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
      const updated = await cartApi.updateQuantity(id, newQty);
      if (updated?.items) {
        setCartItems(updated.items);
      }
    } catch (e) {
      console.warn('Update quantity API sync fallback:', e);
    }
  };

  const handleRemoveItem = async (id) => {
    // Optimistic UI update
    setCartItems((prev) => prev.filter((item) => item.id !== id));

    // API Sync
    try {
      const updated = await cartApi.removeItem(id);
      if (updated?.items) {
        setCartItems(updated.items);
      }
    } catch (e) {
      console.warn('Remove item API sync fallback:', e);
    }
  };

  const handleUpdateFulfillmentMode = async (mode) => {
    setFulfillmentMode(mode);
    try {
      await cartApi.updateFulfillmentMode(mode);
    } catch (e) {
      console.warn('Fulfillment mode sync fallback:', e);
    }
  };

  // Payment Handlers
  const handlePaymentSuccess = async (newReceipt) => {
    setReceipts((prev) => [newReceipt, ...prev]);
    // Clear cart both locally and in backend database
    setCartItems([]);
    try {
      await cartApi.clearCart();
    } catch (e) {
      console.warn('Clear cart API sync fallback:', e);
    }
  };

  // Calculate cart total for payment screen
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.basePrice * (item.quantity || 1),
    0
  );
  const payableAmount = subtotal > 0 ? Math.round(subtotal * 1.18) : 5310;

  return (
    <div className="cust-dash-layout">
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
      {/* 1. Left Sidebar Navigation - ONLY: Overview, Products, Payment, Cart, Receipt */}
      <DashboardSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeNav={activeNav}
        onSelectNav={handleSelectNav}
        onSignOut={handleSignOut}
        customer={customer}
        cartCount={cartItems.length}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="cliento-sidebar-mobile-backdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-label="Close sidebar backdrop"
        />
      )}

      {/* 2. Main Content Area */}
      <div className="cust-dash-main-area">
        {/* Top Navbar */}
        <DashboardNavbar
          customer={customer}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          notifications={notifications}
          onSignOut={handleSignOut}
          activeNav={activeNav}
        />

        {/* Dashboard Dynamic Tab Contents */}
        <main className="cust-dash-content-body animate-fade-in">
          {/* TAB 1: OVERVIEW */}
          {activeNav === 'overview' && (
            <CloudPortalOverview
              customer={customer}
              onNavigateTab={handleSelectNav}
            />
          )}

          {/* TAB 2: PRODUCTS */}
          {activeNav === 'products' && (
            <div className="cliento-overview-wrapper animate-fade-in">
              <ProductsSection
                onAddToCart={handleAddToCart}
                onGoToCart={() => handleSelectNav('cart')}
                cartItemIds={cartItems.map((c) => c.id)}
              />
            </div>
          )}

          {/* TAB 3: PAYMENT */}
          {activeNav === 'payment' && (
            <div className="cliento-overview-wrapper animate-fade-in">
              <PaymentSection
                pendingAmount={payableAmount}
                onPaymentSuccess={handlePaymentSuccess}
                customer={customer}
                onViewReceipts={() => handleSelectNav('receipt')}
              />
            </div>
          )}

          {/* TAB 4: CART */}
          {activeNav === 'cart' && (
            <div className="cliento-overview-wrapper animate-fade-in">
              <CartSection
                cartItems={cartItems}
                fulfillmentMode={fulfillmentMode}
                onUpdateFulfillmentMode={handleUpdateFulfillmentMode}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onProceedToPayment={() => handleSelectNav('payment')}
                onBrowseProducts={() => handleSelectNav('products')}
                onAddToCart={handleAddToCart}
              />
            </div>
          )}

          {/* TAB 5: RECEIPT */}
          {activeNav === 'receipt' && (
            <div className="cliento-overview-wrapper animate-fade-in">
              <ReceiptSection receipts={receipts} customer={customer} />
            </div>
          )}

          {/* TAB 6: HELP CENTER */}
          {activeNav === 'help' && (
            <div className="cliento-overview-wrapper animate-fade-in">
              <HelpSection customer={customer} />
            </div>
          )}
        </main>
      </div>

      {/* Support & Inquiry Modal */}
      <SupportTicketModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        customer={customer}
      />
    </div>
  );
}
