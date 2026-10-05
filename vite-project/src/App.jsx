import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroCarousel from './components/HeroCarousel';
import DashboardOverview from './components/DashboardOverview';
import AccountingModule from './components/AccountingModule';
import MarketingSections from './components/MarketingSections';
import Footer from './components/Footer';
import InvoiceModal from './components/InvoiceModal';
import DemoModal from './components/modals/DemoModal';
import LoginModal from './components/modals/LoginModal';
import SearchModal from './components/modals/SearchModal';
import ProductModal from './components/modals/ProductModal';
import PartyModal from './components/modals/PartyModal';
import InvoiceViewModal from './components/modals/InvoiceViewModal';
import Toast from './components/Toast';
import { 
  INITIAL_METRICS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_PRODUCTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_SUPPLIERS 
} from './data/mockData';
import { formatINR } from './utils/formatters';
import './App.css';

export default function App() {
  // Navigation & View state
  const [activeNav, setActiveNav] = useState('home');
  const [activeErpTab, setActiveErpTab] = useState('dashboard');
  const [activeErpSubTab, setActiveErpSubTab] = useState('sales');

  // Business state
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);

  // Modals state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [partyModalConfig, setPartyModalConfig] = useState({ isOpen: false, type: 'customers' });
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState(null);

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

  // Handlers for Carousel CTAs
  const handleExploreNIS = () => {
    setActiveNav('solutions');
    const el = document.getElementById('overview-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExploreAccounting = () => {
    setActiveNav('accounting');
    setActiveErpTab('accounting');
    setActiveErpSubTab('sales');
    const el = document.getElementById('accounting-module');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleManageInventory = () => {
    setActiveNav('inventory');
    setActiveErpTab('inventory');
    setActiveErpSubTab('products');
    const el = document.getElementById('accounting-module');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewReports = () => {
    setActiveNav('reports');
    setActiveErpTab('reports');
    setActiveErpSubTab('pl');
    const el = document.getElementById('accounting-module');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Handler for clicking one of the 8 Overview Cards
  const handleOverviewCardClick = (tabKey, subKey) => {
    setActiveErpTab(tabKey);
    setActiveErpSubTab(subKey);
    setActiveNav(tabKey);
    const el = document.getElementById('accounting-module');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // ERP Tab change handler
  const handleErpTabChange = (tabId, subId) => {
    setActiveErpTab(tabId);
    setActiveErpSubTab(subId);
  };

  // Save new invoice handler
  const handleSaveInvoice = (newTx) => {
    setTransactions((prev) => [newTx, ...prev]);
    setMetrics((prev) => ({
      ...prev,
      totalSales: prev.totalSales + newTx.amount,
      receivables: prev.receivables + newTx.amount,
    }));
    showToast(`Invoice ${newTx.invoiceNo} for ${formatINR(newTx.amount)} created successfully!`);
  };

  // Add new product handler
  const handleAddProduct = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Product "${newProduct.name}" added to inventory.`);
  };

  // Add new customer/supplier handler
  const handleAddParty = (type, newParty) => {
    if (type === 'customers') {
      setCustomers((prev) => [newParty, ...prev]);
      showToast(`Customer "${newParty.name}" created.`);
    } else {
      setSuppliers((prev) => [newParty, ...prev]);
      showToast(`Supplier "${newParty.name}" created.`);
    }
  };

  // Toggle transaction status
  const handleToggleTxStatus = (id) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === 'Paid' ? 'Pending' : (t.status === 'Pending' ? 'Overdue' : 'Paid');
          showToast(`Transaction ${t.invoiceNo} marked as ${nextStatus}.`);
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  return (
    <div className="app-wrapper">
      {/* 1. FIXED TOP HEADER */}
      <Header
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onOpenDemo={() => setIsDemoModalOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
      />

      <main className="main-content">
        {/* 2. HERO CAROUSEL (Critical 5000ms Auto-timer) */}
        <HeroCarousel
          onExploreNIS={handleExploreNIS}
          onExploreAccounting={handleExploreAccounting}
          onManageInventory={handleManageInventory}
          onViewReports={handleViewReports}
          onBookDemo={() => setIsDemoModalOpen(true)}
        />

        {/* 3. "EVERYTHING YOUR BUSINESS NEEDS" - 8 CARDS */}
        <DashboardOverview
          onCardClick={handleOverviewCardClick}
        />

        {/* 4. TALLY-STYLE ACCOUNTING & ERP WORKSPACE */}
        <div id="inventory-anchor" className="section-anchor" />
        <div id="reports-anchor" className="section-anchor" />
        <AccountingModule
          activeTab={activeErpTab}
          activeSubTab={activeErpSubTab}
          onTabChange={handleErpTabChange}
          metrics={metrics}
          transactions={transactions}
          products={products}
          customers={customers}
          suppliers={suppliers}
          onOpenCreateInvoice={() => setIsInvoiceModalOpen(true)}
          onOpenAddProduct={() => setIsProductModalOpen(true)}
          onOpenAddParty={(type) => setPartyModalConfig({ isOpen: true, type })}
          onToggleTxStatus={handleToggleTxStatus}
          onViewInvoice={(tx) => setSelectedInvoiceForView(tx)}
          onShowToast={showToast}
        />

        {/* 5. MARKETING & COMPANY WEBSITE SECTIONS */}
        <MarketingSections
          onOpenDemo={() => setIsDemoModalOpen(true)}
          onOpenContact={() => {
            const el = document.getElementById('footer-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </main>

      {/* 6. PROFESSIONAL CORPORATE FOOTER */}
      <Footer
        onNavClick={setActiveNav}
      />

      {/* MODALS */}
      {/* Invoice Creation Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSaveInvoice={handleSaveInvoice}
      />

      {/* Book a Demo Modal */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSubmitSuccess={(msg) => showToast(msg)}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(msg) => showToast(msg)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        transactions={transactions}
        products={products}
        onSelectAction={handleOverviewCardClick}
      />

      {/* Add Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddProduct={handleAddProduct}
      />

      {/* Add Party Modal */}
      <PartyModal
        isOpen={partyModalConfig.isOpen}
        defaultType={partyModalConfig.type}
        onClose={() => setPartyModalConfig({ isOpen: false, type: 'customers' })}
        onAddParty={handleAddParty}
      />

      {/* View Printable Invoice Modal */}
      <InvoiceViewModal
        isOpen={!!selectedInvoiceForView}
        invoice={selectedInvoiceForView}
        onClose={() => setSelectedInvoiceForView(null)}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
