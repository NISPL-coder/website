import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import SupportTicketModal from './components/SupportTicketModal';
import { useRenewalToasts } from './components/RemindersPanel';
import { customerAuthService } from '../CustomerRegister/services/customerAuthService';
import { INITIAL_NOTIFICATIONS, INITIAL_INVOICES } from './data/mockDashboardData';
import './Dashboard.css';

export default function DashboardPage({ onSignOut: propOnSignOut }) {
  const navigate = useNavigate();

  // State
  const [customer, setCustomer] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Options: 'overview' | 'products' | 'payment' | 'cart' | 'receipt'
  const [activeNav, setActiveNav] = useState('overview');
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [notifications] = useState(INITIAL_NOTIFICATIONS);
  const [receipts, setReceipts] = useState(INITIAL_INVOICES);

  // Cart State
  const [cartItems, setCartItems] = useState([
    {
      id: 'prod-tss-single',
      name: 'TSS Renewal (Single User)',
      basePrice: 4500,
      quantity: 1
    }
  ]);

  // Load active customer session
  useEffect(() => {
    const activeCustomer = customerAuthService.getCurrentCustomer();
    setCustomer(activeCustomer);
  }, []);

  const handleSelectNav = (navId) => {
    setActiveNav(navId);
    setIsMobileSidebarOpen(false);
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

  // Cart Handlers
  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Payment Handlers
  const handlePaymentSuccess = (newReceipt) => {
    setReceipts((prev) => [newReceipt, ...prev]);
    // Clear cart after successful payment
    setCartItems([]);
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
      />

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
                onGoToCart={() => setActiveNav('cart')}
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
                onViewReceipts={() => setActiveNav('receipt')}
              />
            </div>
          )}

          {/* TAB 4: CART */}
          {activeNav === 'cart' && (
            <div className="cliento-overview-wrapper animate-fade-in">
              <CartSection
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onProceedToPayment={() => setActiveNav('payment')}
                onBrowseProducts={() => setActiveNav('products')}
              />
            </div>
          )}

          {/* TAB 5: RECEIPT */}
          {activeNav === 'receipt' && (
            <div className="cliento-overview-wrapper animate-fade-in">
              <ReceiptSection receipts={receipts} customer={customer} />
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
