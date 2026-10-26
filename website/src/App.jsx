import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import DemoHomepage from './pages/Demo Page/Homepage';
import CookieConsent from './components/CookieConsent/CookieConsent';
import { INITIAL_TRANSACTIONS, INITIAL_PRODUCTS } from './data/mockData';
import NetworkBackground from './components/background/NetworkBackground';
import SEOManager from './components/SEO/SEOManager';
import './App.css';

// Code-split secondary routes & heavy modals for instant LCP and minimal initial bundle
const AboutPage = lazy(() => import('./pages/AboutPage/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage/ContactPage'));
const CareerPage = lazy(() => import('./pages/CareerPage/CareerPage'));
const LoginPage = lazy(() => import('./pages/login/LoginPage'));
const Dashboard = lazy(() => import('./pages/login/Dashboard'));
const PartnerDashboard = lazy(() => import('./pages/login/PartnerDashboard'));
const CustomerLoginPage = lazy(() => import('./pages/login/CustomerLoginPage'));
const CustomerRegisterPage = lazy(() => import('./pages/login/CustomerRegisterPage'));
const DemoModal = lazy(() => import('./components/modals/DemoModal'));
const LoginModal = lazy(() => import('./components/modals/LoginModal'));
const SearchModal = lazy(() => import('./components/modals/SearchModal'));

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
    '/dashboard',
    '/partner-dashboard'
  ].some((path) => location.pathname.startsWith(path));

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
          <Route path="/dashboard" element={<Dashboard onSignOut={() => window.location.href = '/login'} />} />
          <Route path="/partner-dashboard" element={<PartnerDashboard onSignOut={() => window.location.href = '/login?portal=partner'} />} />
          <Route path="/customer-login" element={<LoginPage lockedPortal="customer" />} />
          <Route path="/customer-register" element={<CustomerRegisterPage />} />
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
