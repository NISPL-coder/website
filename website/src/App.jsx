import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
// import WhatsAppButton from './components/WhatsAppButton';
import DemoHomepage from './pages/Demo Page/Homepage';
import ContactPage from './pages/ContactPage/ContactPage';
import CareerPage from './pages/CareerPage/CareerPage';
import DemoModal from './components/modals/DemoModal';
import LoginModal from './components/modals/LoginModal';
import SearchModal from './components/modals/SearchModal';
import { INITIAL_TRANSACTIONS, INITIAL_PRODUCTS } from './data/mockData';
import './App.css';

// Smooth scroll to top on route change or handle hash anchors
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

function MainApp() {
  const [transactions] = useState(INITIAL_TRANSACTIONS);
  const [products] = useState(INITIAL_PRODUCTS);

  // Modals state
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

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
      <ScrollToTop />
      
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
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/career" element={<CareerPage />} />
        {/* All routes fallback directly to the official Homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating WhatsApp Contact Widget */}
      {/* <WhatsAppButton /> */}

      {/* Global Interactive Modals */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSubmitSuccess={(msg) => console.log(msg)}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(msg) => console.log(msg)}
      />
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        transactions={transactions}
        products={products}
        onSelectAction={() => {}}
      />
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
