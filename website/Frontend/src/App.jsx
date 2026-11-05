import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import DemoHomepage from './pages/Demo Page/Homepage';
import CookieConsent from './components/CookieConsent/CookieConsent';
import { INITIAL_TRANSACTIONS, INITIAL_PRODUCTS } from './data/mockData';
import NetworkBackground from './components/background/NetworkBackground';
import SEOManager from './components/SEO/SEOManager';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { authApi } from './services/authApi';
import './App.css';

// Safe lazy-loader that gracefully reloads if a stale chunk hash fails after a new deployment.
// Shares the guard key with the bootstrap script in index.html so one tab reloads at most once.
function lazyWithRetry(componentImport) {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      const pageHasRefreshed = sessionStorage.getItem('nispl_asset_reload');
      if (!pageHasRefreshed) {
        sessionStorage.setItem('nispl_asset_reload', '1');
        window.location.reload();
        return { default: () => null };
      }
      throw error;
    }
  });
}

// Code-split secondary routes & heavy modals for instant LCP and minimal initial bundle
const AboutPage = lazyWithRetry(() => import('./pages/AboutPage/AboutPage'));
const ContactPage = lazyWithRetry(() => import('./pages/ContactPage/ContactPage'));
const CareerPage = lazyWithRetry(() => import('./pages/CareerPage/CareerPage'));
const HelpPage = lazyWithRetry(() => import('./pages/Help/Help'));
const LoginPage = lazyWithRetry(() => import('./pages/login/LoginPage'));
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'));
const PartnerDashboard = lazyWithRetry(() => import('./pages/login/partner/PartnerDashboard'));
const AdminDashboard = lazyWithRetry(() => import('./pages/login/Admin/AdminDashboard'));
const CustomerLoginPage = lazyWithRetry(() => import('./pages/login/customer/CustomerLoginPage'));
const CustomerRegisterPage = lazyWithRetry(() => import('./pages/CustomerRegister'));
const CreateAdminPage = lazyWithRetry(() => import('./pages/login/Admin/CreateAdminPage'));
const ResetPasswordPage = lazyWithRetry(() => import('./pages/login/ResetPasswordPage'));
const DemoModal = lazyWithRetry(() => import('./components/modals/DemoModal'));
const LoginModal = lazyWithRetry(() => import('./components/modals/LoginModal'));
const SearchModal = lazyWithRetry(() => import('./components/modals/SearchModal'));

// Smooth scroll to top on route change or handle hash anchors
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const scrollToEl = () => {
        try {
          const el = document.querySelector(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            return true;
          }
        } catch {
          // ignore invalid query selectors
        }
        return false;
      };

      if (!scrollToEl()) {
        const timer1 = setTimeout(scrollToEl, 120);
        const timer2 = setTimeout(scrollToEl, 320);
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

function MainApp() {
  const location = useLocation();
  const [transactions] = useState(INITIAL_TRANSACTIONS);
  const [products] = useState(INITIAL_PRODUCTS);

  // Modals state
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Exclude NetworkBackground from login and auth-related pages
  const isAuthPage = [
    '/login',
    '/customer-login',
    '/customer-register',
    '/customer_register',
    '/customer',
    '/dashboard',
    '/partner-dashboard',
    '/partner_dashboard',
    '/admin-dashboard',
    '/admin_dashboard',
    '/admin',
    '/help'
  ].some((path) => location.pathname.startsWith(path));

  // Handle session cleanup on sign-out across all portals
  const handleSignOut = (portal = 'admin') => {
    authApi.clearAuthSession();
    if (portal === 'customer') {
      window.location.href = '/customer-login';
    } else if (portal === 'partner') {
      window.location.href = '/login?portal=partner';
    } else {
      window.location.href = '/login?portal=admin';
    }
  };

  // Keyboard shortcut: Ctrl + K or Cmd + K for global search palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="demo-app-root">
      <SEOManager />
      <ScrollToTop />
      {/* Universal Interactive Constellation Background (excluded on login/auth routes) */}
      {!isAuthPage && <NetworkBackground />}
      
      <Suspense fallback={null}>
        <Routes>
          <Route 
            path="/" 
            element={
              <DemoHomepage 
                onOpenContact={() => setIsDemoModalOpen(true)}
                onOpenConsultation={() => setIsDemoModalOpen(true)}
              />
            } 
          />
          <Route 
            path="/about" 
            element={
              <AboutPage 
                onOpenContact={() => setIsDemoModalOpen(true)}
                onOpenConsultation={() => setIsDemoModalOpen(true)}
              />
            } 
          />
          <Route 
            path="/about-us" 
            element={
              <AboutPage 
                onOpenContact={() => setIsDemoModalOpen(true)}
                onOpenConsultation={() => setIsDemoModalOpen(true)}
              />
            } 
          />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/career" element={<CareerPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Customer Portal Routes with Sidebar & Header (Protected) */}
          <Route path="/customer/overview" element={<ProtectedRoute allowedRoles={['customer']} redirectTo="/customer-login"><Dashboard onSignOut={() => handleSignOut('customer')} /></ProtectedRoute>} />
          <Route path="/customer/product" element={<ProtectedRoute allowedRoles={['customer']} redirectTo="/customer-login"><Dashboard onSignOut={() => handleSignOut('customer')} /></ProtectedRoute>} />
          <Route path="/customer/product/tally" element={<ProtectedRoute allowedRoles={['customer']} redirectTo="/customer-login"><Dashboard onSignOut={() => handleSignOut('customer')} /></ProtectedRoute>} />
          <Route path="/customer/product/cloud" element={<ProtectedRoute allowedRoles={['customer']} redirectTo="/customer-login"><Dashboard onSignOut={() => handleSignOut('customer')} /></ProtectedRoute>} />
          <Route path="/customer/products" element={<Navigate to="/customer/product" replace />} />
          <Route path="/customer/cart" element={<ProtectedRoute allowedRoles={['customer']} redirectTo="/customer-login"><Dashboard onSignOut={() => handleSignOut('customer')} /></ProtectedRoute>} />
          <Route path="/customer/receipt" element={<ProtectedRoute allowedRoles={['customer']} redirectTo="/customer-login"><Dashboard onSignOut={() => handleSignOut('customer')} /></ProtectedRoute>} />
          <Route path="/customer/payment" element={<ProtectedRoute allowedRoles={['customer']} redirectTo="/customer-login"><Dashboard onSignOut={() => handleSignOut('customer')} /></ProtectedRoute>} />
          <Route path="/customer/help" element={<ProtectedRoute allowedRoles={['customer']} redirectTo="/customer-login"><Dashboard onSignOut={() => handleSignOut('customer')} /></ProtectedRoute>} />
          <Route path="/customer/profile" element={<ProtectedRoute allowedRoles={['customer']} redirectTo="/customer-login"><Dashboard onSignOut={() => handleSignOut('customer')} /></ProtectedRoute>} />
          <Route path="/help" element={<Navigate to="/customer/help" replace />} />
          <Route path="/help-center" element={<Navigate to="/customer/help" replace />} />
          <Route path="/customer/dashboard" element={<Navigate to="/customer/overview" replace />} />
          <Route path="/customer" element={<Navigate to="/customer/overview" replace />} />
          <Route path="/dashboard" element={<Navigate to="/customer/overview" replace />} />
          
          <Route path="/partner-dashboard" element={<ProtectedRoute allowedRoles={['partner']} redirectTo="/login?portal=partner"><PartnerDashboard onSignOut={() => handleSignOut('partner')} /></ProtectedRoute>} />
          <Route path="/partner_dashboard" element={<ProtectedRoute allowedRoles={['partner']} redirectTo="/login?portal=partner"><PartnerDashboard onSignOut={() => handleSignOut('partner')} /></ProtectedRoute>} />
          
          {/* Admin Portal Routes with Sidebar & Header (Protected) */}
          <Route path="/admin/create" element={<CreateAdminPage />} />
          <Route path="/admin/overview" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'support']} redirectTo="/login?portal=admin"><AdminDashboard onSignOut={() => handleSignOut('admin')} /></ProtectedRoute>} />
          <Route path="/admin/customer/create" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'support']} redirectTo="/login?portal=admin"><AdminDashboard onSignOut={() => handleSignOut('admin')} /></ProtectedRoute>} />
          <Route path="/admin/customer/contract/create" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'support']} redirectTo="/login?portal=admin"><AdminDashboard onSignOut={() => handleSignOut('admin')} /></ProtectedRoute>} />
          <Route path="/admin/customer/payment/create" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'support']} redirectTo="/login?portal=admin"><AdminDashboard onSignOut={() => handleSignOut('admin')} /></ProtectedRoute>} />
          <Route path="/admin/customer/contract" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'support']} redirectTo="/login?portal=admin"><AdminDashboard onSignOut={() => handleSignOut('admin')} /></ProtectedRoute>} />
          <Route path="/admin/customer/payment" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'support']} redirectTo="/login?portal=admin"><AdminDashboard onSignOut={() => handleSignOut('admin')} /></ProtectedRoute>} />
          <Route path="/admin/customer" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'support']} redirectTo="/login?portal=admin"><AdminDashboard onSignOut={() => handleSignOut('admin')} /></ProtectedRoute>} />
          <Route path="/admin/customers" element={<Navigate to="/admin/customer" replace />} />
          <Route path="/admin/product/tally" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'support']} redirectTo="/login?portal=admin"><AdminDashboard onSignOut={() => handleSignOut('admin')} /></ProtectedRoute>} />
          <Route path="/admin/product/tally/create" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'support']} redirectTo="/login?portal=admin"><AdminDashboard onSignOut={() => handleSignOut('admin')} /></ProtectedRoute>} />
          <Route path="/admin/product/cloud" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'support']} redirectTo="/login?portal=admin"><AdminDashboard onSignOut={() => handleSignOut('admin')} /></ProtectedRoute>} />
          <Route path="/admin/product/cloud/create" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'support']} redirectTo="/login?portal=admin"><AdminDashboard onSignOut={() => handleSignOut('admin')} /></ProtectedRoute>} />
          <Route path="/admin/product/cloud/custom-pricing" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'support']} redirectTo="/login?portal=admin"><AdminDashboard onSignOut={() => handleSignOut('admin')} /></ProtectedRoute>} />
          <Route path="/admin/product/create" element={<Navigate to="/admin/product" replace />} />
          <Route path="/admin/product" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'support']} redirectTo="/login?portal=admin"><AdminDashboard onSignOut={() => handleSignOut('admin')} /></ProtectedRoute>} />
          <Route path="/admin/products" element={<Navigate to="/admin/product" replace />} />
          <Route path="/admin/receipt/create" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'support']} redirectTo="/login?portal=admin"><AdminDashboard onSignOut={() => handleSignOut('admin')} /></ProtectedRoute>} />
          <Route path="/admin/receipt" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'support']} redirectTo="/login?portal=admin"><AdminDashboard onSignOut={() => handleSignOut('admin')} /></ProtectedRoute>} />
          <Route path="/admin/receipts" element={<Navigate to="/admin/receipt" replace />} />
          <Route path="/admin/import-csv" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'support']} redirectTo="/login?portal=admin"><AdminDashboard onSignOut={() => handleSignOut('admin')} /></ProtectedRoute>} />
          <Route path="/admin/sangam-sync" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'support']} redirectTo="/login?portal=admin"><AdminDashboard onSignOut={() => handleSignOut('admin')} /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'support']} redirectTo="/login?portal=admin"><AdminDashboard onSignOut={() => handleSignOut('admin')} /></ProtectedRoute>} />
          <Route path="/admin/user-access" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'support']} redirectTo="/login?portal=admin"><AdminDashboard onSignOut={() => handleSignOut('admin')} /></ProtectedRoute>} />
          <Route path="/admin/staff" element={<Navigate to="/admin/user-access" replace />} />
          <Route path="/admin/activity-logs" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'support']} redirectTo="/login?portal=admin"><AdminDashboard onSignOut={() => handleSignOut('admin')} /></ProtectedRoute>} />
          <Route path="/admin/activity_logs" element={<Navigate to="/admin/activity-logs" replace />} />
          <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'support']} redirectTo="/login?portal=admin"><AdminDashboard onSignOut={() => handleSignOut('admin')} /></ProtectedRoute>} />
          <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
          <Route path="/admin-dashboard" element={<Navigate to="/admin/overview" replace />} />
          <Route path="/admin_dashboard" element={<Navigate to="/admin/overview" replace />} />
          <Route path="/customer-login" element={<LoginPage lockedPortal="customer" />} />
          <Route path="/customer/login" element={<LoginPage lockedPortal="customer" />} />
          <Route path="/customer_login" element={<LoginPage lockedPortal="customer" />} />
          <Route path="/customer-register" element={<CustomerRegisterPage />} />
          <Route path="/customer_register" element={<CustomerRegisterPage />} />
          {/* All routes fallback directly to the official Homepage */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* Global Interactive Modals (Loaded on demand) */}
      <Suspense fallback={null}>
        {isDemoModalOpen && (
          <DemoModal
            isOpen={isDemoModalOpen}
            onClose={() => setIsDemoModalOpen(false)}
            onSubmitSuccess={(msg) => console.log(msg)}
          />
        )}
        {isLoginModalOpen && (
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onLoginSuccess={(msg) => console.log(msg)}
          />
        )}
        {isSearchModalOpen && (
          <SearchModal
            isOpen={isSearchModalOpen}
            onClose={() => setIsSearchModalOpen(false)}
            transactions={transactions}
            products={products}
            onSelectAction={() => {}}
          />
        )}
      </Suspense>

      {/* Global First-Visit Cookie & Privacy Consent */}
      <CookieConsent />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
}
