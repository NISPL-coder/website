import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import SolutionsPage from './pages/SolutionsPage';
import PortfolioPage from './pages/PortfolioPage';
import ContactPage from './pages/ContactPage';

import DemoModal from './components/modals/DemoModal';
import LoginModal from './components/modals/LoginModal';
import SearchModal from './components/modals/SearchModal';
import Toast from './components/Toast';
import WhatsAppButton from './components/WhatsAppButton';

import { 
  INITIAL_METRICS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_PRODUCTS 
} from './data/mockData';
import './components/InvoiceModal.css';
import './App.css';

export default function App() {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  // Modals state
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  // Keyboard shortcut: Ctrl + K or Cmd + K for global search
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
    <BrowserRouter>
      <ScrollToTop />
      
      <div className="app-wrapper">
        {/* GLOBAL FIXED HEADER */}
        <Header
          onOpenDemo={() => setIsDemoModalOpen(true)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenSearch={() => setIsSearchModalOpen(true)}
        />

        {/* MULTI-PAGE ROUTED CONTENT */}
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  onOpenDemo={() => setIsDemoModalOpen(true)} 
                />
              } 
            />
            {/* Redirect /about to home */}
            <Route path="/about" element={<Navigate to="/" replace />} />
            {/* /demo route: same homepage design as the image */}
            <Route
              path="/demo"
              element={
                <HomePage
                  onOpenDemo={() => setIsDemoModalOpen(true)}
                />
              }
            />
            <Route 
              path="/services" 
              element={
                <ServicesPage 
                  onOpenDemo={() => setIsDemoModalOpen(true)} 
                  onShowToast={showToast}
                />
              } 
            />
            <Route 
              path="/services/:serviceId" 
              element={
                <ServiceDetailPage 
                  onOpenDemo={() => setIsDemoModalOpen(true)} 
                />
              } 
            />
            {/* Direct service aliases */}
            <Route path="/tally-prime" element={<Navigate to="/services/tally-prime" replace />} />
            <Route path="/tally-cloud" element={<Navigate to="/services/tally-on-cloud" replace />} />
            <Route path="/tally-on-cloud" element={<Navigate to="/services/tally-on-cloud" replace />} />
            <Route path="/cloud-hosting" element={<Navigate to="/services/data-center-cloud" replace />} />
            <Route path="/it-infrastructure" element={<Navigate to="/services/it-infra-security" replace />} />
            <Route path="/it-repair" element={<Navigate to="/services/it-repair-maintenance" replace />} />
            <Route path="/it-rental" element={<Navigate to="/services/it-sales-rental" replace />} />
            <Route 
              path="/solutions" 
              element={
                <SolutionsPage 
                  onOpenDemo={() => setIsDemoModalOpen(true)} 
                />
              } 
            />
            <Route 
              path="/portfolio" 
              element={
                <PortfolioPage 
                  onOpenDemo={() => setIsDemoModalOpen(true)} 
                />
              } 
            />
            <Route 
              path="/contact" 
              element={
                <ContactPage 
                  onShowToast={showToast} 
                />
              } 
            />
            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* GLOBAL OFFICIAL FOOTER */}
        <Footer />

        {/* FLOATING WHATSAPP CHAT BUTTON */}
        <WhatsAppButton />

        {/* GLOBAL MODALS */}
        {/* Get a Quote / Demo Modal */}
        <DemoModal
          isOpen={isDemoModalOpen}
          onClose={() => setIsDemoModalOpen(false)}
          onSubmitSuccess={(msg) => showToast(msg)}
        />

        {/* Client Login Modal */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={(msg) => showToast(msg)}
        />

        {/* Global Search Modal (Ctrl + K) */}
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          transactions={transactions}
          products={products}
          onSelectAction={() => {}}
        />

        {/* Toast Notification */}
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      </div>
    </BrowserRouter>
  );
}
