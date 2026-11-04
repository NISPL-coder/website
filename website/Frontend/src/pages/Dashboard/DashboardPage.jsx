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
import ProfilePage from '../login/Admin/ProfilePage';
import CloudPortalOverview from '../login/customer/overview';
import ProductsSection from '../login/customer/product';
import CartSection from '../login/customer/cart';
import PaymentSection from './components/PaymentSection';
import ReceiptSection from '../login/customer/receipt';
import HelpSection from '../login/customer/help';
import SupportTicketModal from './components/SupportTicketModal';
import { customerAuthService } from '../CustomerRegister/services/customerAuthService';
import { authApi } from '../../services/authApi';
import { cartApi } from '../../services/cartApi';
import { INITIAL_INVOICES } from './data/mockDashboardData';
import './Dashboard.css';

const NAV_TO_PATH = {
  overview: '/customer/overview',
  products: '/customer/product',
  cart: '/customer/cart',
  receipt: '/customer/receipt',
  payment: '/customer/payment',
  help: '/customer/help',
  profile: '/customer/profile'
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
    if (pathname.includes('/customer/profile')) return 'profile';
    return 'overview';
  };

  // State
  const [customer, setCustomer] = useState(null);

  // Options: 'overview' | 'products' | 'payment' | 'cart' | 'receipt'
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
  const [receipts, setReceipts] = useState(INITIAL_INVOICES);

  // Cart mirrors the backend cart for this account
  const [cartItems, setCartItems] = useState([]);
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
    const targetPath = NAV_TO_PATH[navId];
    if (targetPath && location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  // The header search filters the solution catalogue, so it pulls the user there.
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value && activeNav !== 'products') handleSelectNav('products');
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
      if (updated?.items) {
        setCartItems(updated.items);
      }
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
        navItems={navItems}
        activeNav={activeNav}
        onNavigate={(item) => handleSelectNav(item.id)}
        sidebarAriaLabel="Customer Portal Navigation"
        profile={{
          name: customer?.name || 'NISPL Customer',
          email: customer?.email || '',
          role: customer?.role || 'customer',
          profilePath: '/customer/profile'
        }}
        onSignOut={handleSignOut}
      >
          {/* TAB 1: OVERVIEW */}
          {activeNav === 'overview' && (
            <CloudPortalOverview
              customer={customer}
              onNavigateTab={handleSelectNav}
              onOpenSupport={() => setIsSupportModalOpen(true)}
            />
          )}

          {/* TAB 2: PRODUCTS */}
          {activeNav === 'products' && (
            <div className="flowmail-overview-container animate-fade-in">
              <ProductsSection
                onAddToCart={handleAddToCart}
                onGoToCart={() => handleSelectNav('cart')}
                cartItemIds={cartItems.map((c) => c.id)}
                externalSearch={searchTerm}
              />
            </div>
          )}

          {/* TAB 3: PAYMENT */}
          {activeNav === 'payment' && (
            <div className="flowmail-overview-container animate-fade-in">
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
            <div className="flowmail-overview-container animate-fade-in">
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
            <div className="flowmail-overview-container animate-fade-in">
              <ReceiptSection receipts={receipts} customer={customer} />
            </div>
          )}

          {/* TAB 6: HELP CENTER */}
          {activeNav === 'help' && (
            <div className="flowmail-overview-container animate-fade-in">
              <HelpSection customer={customer} />
            </div>
          )}
          {/* TAB 7: PROFILE (same account page the console uses) */}
          {activeNav === 'profile' && (
            <ProfilePage
              adminName={customer?.name}
              adminEmail={customer?.email}
              portalName="NISPL Customer Portal"
            />
          )}
      </ConsoleShell>

      {/* Support & Inquiry Modal */}
      <SupportTicketModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        customer={customer}
      />
    </>
  );
}
