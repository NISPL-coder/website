import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ReceiptIndianRupee, 
  ShoppingBag, 
  Boxes, 
  Users, 
  FileSpreadsheet, 
  Settings, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Building2, 
  Wallet, 
  TrendingUp, 
  ChevronRight,
  BookOpen,
  Scale,
  Calendar,
  FileCheck,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { formatINR } from '../utils/formatters';
import SalesAnalyticsChart from './accounting/SalesAnalyticsChart';
import TransactionsTable from './accounting/TransactionsTable';
import InventoryTab from './accounting/InventoryTab';
import PartiesTab from './accounting/PartiesTab';
import ReportsTab from './accounting/ReportsTab';
import './AccountingModule.css';

export default function AccountingModule({
  activeTab = 'dashboard',
  activeSubTab = 'all',
  onTabChange,
  metrics,
  transactions,
  products,
  customers,
  suppliers,
  onOpenCreateInvoice,
  onOpenAddProduct,
  onOpenAddParty,
  onToggleTxStatus,
  onViewInvoice,
  onShowToast,
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Navigation sidebar configuration
  const sidebarNav = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: 'Live',
    },
    {
      id: 'accounting',
      label: 'Accounting',
      icon: ReceiptIndianRupee,
      subItems: [
        { id: 'sales', label: 'Sales' },
        { id: 'purchases', label: 'Purchases' },
        { id: 'receipts', label: 'Receipts' },
        { id: 'payments', label: 'Payments' },
        { id: 'journal', label: 'Journal' },
        { id: 'ledger', label: 'Ledger' },
        { id: 'dayBook', label: 'Day Book' },
        { id: 'chartOfAccounts', label: 'Chart of Accounts' },
      ],
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Boxes,
      subItems: [
        { id: 'products', label: 'Products' },
        { id: 'stock', label: 'Stock' },
        { id: 'warehouses', label: 'Warehouses' },
        { id: 'categories', label: 'Categories' },
        { id: 'stockAdjustment', label: 'Stock Adjustment' },
      ],
    },
    {
      id: 'parties',
      label: 'Parties',
      icon: Users,
      subItems: [
        { id: 'customers', label: 'Customers' },
        { id: 'suppliers', label: 'Suppliers' },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileSpreadsheet,
      subItems: [
        { id: 'pl', label: 'Profit & Loss' },
        { id: 'bs', label: 'Balance Sheet' },
        { id: 'trial', label: 'Trial Balance' },
        { id: 'salesReport', label: 'Sales Report' },
        { id: 'purchaseReport', label: 'Purchase Report' },
        { id: 'stockReport', label: 'Stock Report' },
        { id: 'outstanding', label: 'Outstanding Report' },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      subItems: [
        { id: 'company', label: 'Company' },
        { id: 'users', label: 'Users' },
        { id: 'preferences', label: 'Preferences' },
      ],
    },
  ];

  const handleNavSelect = (tabId, subId = 'all') => {
    onTabChange(tabId, subId);
    setMobileSidebarOpen(false);
  };

  return (
    <section id="accounting-module" className="nis-erp-workspace-section">
      <div className="container">
        
        {/* Workspace Card Container */}
        <div className="erp-app-frame">
          
          {/* Top Bar for ERP Shell */}
          <div className="erp-shell-header">
            <div className="shell-left">
              <button 
                type="button" 
                className="mobile-erp-sidebar-toggle"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                aria-label="Toggle ERP Navigation"
              >
                {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div className="shell-company-badge">
                <span className="shell-dot" />
                <span className="shell-company-name">NET INFOTECH SYSTEM ERP</span>
                <span className="shell-fy">FY 2026-2027</span>
              </div>
            </div>

            <div className="shell-right">
              <span className="shell-gstin-tag">GSTIN: 27AABCU9603R1ZM (Regular Taxpayer)</span>
              <div className="shell-status-pill">
                <ShieldCheck size={14} color="#10B981" />
                <span>e-Way & e-Invoice Active</span>
              </div>
            </div>
          </div>

          <div className="erp-body-layout">
            
            {/* LEFT SIDEBAR: Tally-Style Navigation */}
            <aside className={`erp-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
              <div className="erp-sidebar-content">
                <div className="erp-sidebar-group-title">MAIN NAVIGATION</div>

                <nav className="erp-side-nav">
                  {sidebarNav.map((nav) => {
                    const isTabActive = activeTab === nav.id;
                    const Icon = nav.icon;

                    return (
                      <div key={nav.id} className="erp-nav-group">
                        <button
                          type="button"
                          className={`erp-nav-item ${isTabActive ? 'active' : ''}`}
                          onClick={() => handleNavSelect(nav.id, nav.subItems ? nav.subItems[0].id : 'all')}
                        >
                          <div className="nav-item-left">
                            <Icon size={18} className="nav-icon" />
                            <span>{nav.label}</span>
                          </div>
                          {nav.badge && <span className="nav-badge-pill">{nav.badge}</span>}
                          {nav.subItems && <ChevronRight size={14} className={`nav-arrow ${isTabActive ? 'rotated' : ''}`} />}
                        </button>

                        {/* Sub-items (expanded when tab active) */}
                        {nav.subItems && isTabActive && (
                          <div className="erp-sub-nav animate-fade-in">
                            {nav.subItems.map((sub) => {
                              const isSubActive = activeSubTab === sub.id;
                              return (
                                <button
                                  key={sub.id}
                                  type="button"
                                  className={`erp-sub-item ${isSubActive ? 'active' : ''}`}
                                  onClick={() => handleNavSelect(nav.id, sub.id)}
                                >
                                  <span>{sub.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>

                {/* Tally Keyboard Shortcut Guide hint */}
                <div className="erp-sidebar-tally-tip">
                  <div className="tip-title">
                    <BookOpen size={13} />
                    <span>Quick Tally Keys</span>
                  </div>
                  <div className="tip-keys">
                    <div><span>F4:</span> Contra</div>
                    <div><span>F5:</span> Payment</div>
                    <div><span>F6:</span> Receipt</div>
                    <div><span>F8:</span> Sales</div>
                    <div><span>F9:</span> Purchase</div>
                  </div>
                </div>
              </div>
            </aside>

            {/* MAIN ERP CONTENT AREA */}
            <main className="erp-main-viewport">
              
              {/* Top Financial Dashboard Metrics Bar */}
              <div className="erp-financial-metrics-bar">
                
                {/* Total Sales */}
                <div className="fin-metric-tile">
                  <div className="fin-tile-header">
                    <span className="fin-label">Total Sales</span>
                    <ReceiptIndianRupee size={16} className="text-primary" />
                  </div>
                  <span className="fin-value">{formatINR(metrics.totalSales)}</span>
                  <span className="fin-growth text-success">
                    <TrendingUp size={12} /> {metrics.salesGrowth} vs last month
                  </span>
                </div>

                {/* Total Purchases */}
                <div className="fin-metric-tile">
                  <div className="fin-tile-header">
                    <span className="fin-label">Total Purchases</span>
                    <ShoppingBag size={16} className="text-secondary" />
                  </div>
                  <span className="fin-value">{formatINR(metrics.totalPurchases)}</span>
                  <span className="fin-growth text-primary">
                    {metrics.purchasesControl} optimized
                  </span>
                </div>

                {/* Receivables */}
                <div className="fin-metric-tile">
                  <div className="fin-tile-header">
                    <span className="fin-label">Receivables</span>
                    <ArrowDownLeft size={16} className="text-success" />
                  </div>
                  <span className="fin-value text-success">{formatINR(metrics.receivables)}</span>
                  <span className="fin-growth text-muted">18 Pending Invoices</span>
                </div>

                {/* Payables */}
                <div className="fin-metric-tile">
                  <div className="fin-tile-header">
                    <span className="fin-label">Payables</span>
                    <ArrowUpRight size={16} className="text-warning" />
                  </div>
                  <span className="fin-value text-warning">{formatINR(metrics.payables)}</span>
                  <span className="fin-growth text-muted">Next due in 7 days</span>
                </div>

                {/* Cash Balance */}
                <div className="fin-metric-tile">
                  <div className="fin-tile-header">
                    <span className="fin-label">Cash Balance</span>
                    <Wallet size={16} color="#059669" />
                  </div>
                  <span className="fin-value">{formatINR(metrics.cashBalance)}</span>
                  <span className="fin-growth text-muted">Office Vault & Drawer</span>
                </div>

                {/* Bank Balance */}
                <div className="fin-metric-tile">
                  <div className="fin-tile-header">
                    <span className="fin-label">Bank Balance</span>
                    <Building2 size={16} color="#0284C7" />
                  </div>
                  <span className="fin-value">{formatINR(metrics.bankBalance)}</span>
                  <span className="fin-growth text-primary">HDFC & SBI Connected</span>
                </div>

              </div>

              {/* QUICK ACTIONS BAR */}
              <div className="erp-quick-actions-bar">
                <span className="quick-actions-label">QUICK ACTIONS:</span>
                
                <div className="quick-actions-list">
                  {/* + Sales Invoice */}
                  <button 
                    type="button" 
                    className="quick-action-btn primary-qa"
                    onClick={onOpenCreateInvoice}
                  >
                    <PlusCircle size={15} />
                    <span>+ Sales Invoice</span>
                  </button>

                  {/* + Purchase Invoice */}
                  <button 
                    type="button" 
                    className="quick-action-btn"
                    onClick={() => onShowToast("Purchase Invoice Creator ready")}
                  >
                    <ShoppingBag size={15} />
                    <span>+ Purchase Invoice</span>
                  </button>

                  {/* + Receipt */}
                  <button 
                    type="button" 
                    className="quick-action-btn"
                    onClick={() => onShowToast("Receipt Voucher (F6) opened")}
                  >
                    <ArrowDownLeft size={15} color="#10B981" />
                    <span>+ Receipt</span>
                  </button>

                  {/* + Payment */}
                  <button 
                    type="button" 
                    className="quick-action-btn"
                    onClick={() => onShowToast("Payment Voucher (F5) opened")}
                  >
                    <ArrowUpRight size={15} color="#F59E0B" />
                    <span>+ Payment</span>
                  </button>

                  {/* + Customer */}
                  <button 
                    type="button" 
                    className="quick-action-btn"
                    onClick={() => onOpenAddParty('customers')}
                  >
                    <Users size={15} />
                    <span>+ Customer</span>
                  </button>

                  {/* + Supplier */}
                  <button 
                    type="button" 
                    className="quick-action-btn"
                    onClick={() => onOpenAddParty('suppliers')}
                  >
                    <Building2 size={15} />
                    <span>+ Supplier</span>
                  </button>

                  {/* + Product */}
                  <button 
                    type="button" 
                    className="quick-action-btn"
                    onClick={onOpenAddProduct}
                  >
                    <Boxes size={15} color="#C026D3" />
                    <span>+ Product</span>
                  </button>

                  {/* + Journal Entry */}
                  <button 
                    type="button" 
                    className="quick-action-btn"
                    onClick={() => onShowToast("Journal Entry (F7) opened")}
                  >
                    <Scale size={15} />
                    <span>+ Journal Entry</span>
                  </button>
                </div>
              </div>

              {/* DYNAMIC VIEW ROUTING BASED ON SELECTED TAB */}
              <div className="erp-active-view-container animate-fade-in">
                
                {/* 1. Dashboard View or Sales / Purchases view */}
                {(activeTab === 'dashboard' || activeTab === 'accounting') && (
                  <>
                    <SalesAnalyticsChart />
                    <TransactionsTable 
                      transactions={transactions}
                      onViewInvoice={onViewInvoice}
                      onToggleStatus={onToggleTxStatus}
                      onCreateInvoice={onOpenCreateInvoice}
                    />
                  </>
                )}

                {/* 2. Inventory View */}
                {activeTab === 'inventory' && (
                  <InventoryTab 
                    products={products}
                    onAddProduct={onOpenAddProduct}
                  />
                )}

                {/* 3. Parties View */}
                {activeTab === 'parties' && (
                  <PartiesTab 
                    customers={customers}
                    suppliers={suppliers}
                    onAddParty={onOpenAddParty}
                  />
                )}

                {/* 4. Reports View */}
                {activeTab === 'reports' && (
                  <ReportsTab />
                )}

                {/* 5. Settings View */}
                {activeTab === 'settings' && (
                  <div className="nis-inventory-card">
                    <div className="inv-header-block">
                      <div>
                        <h3 className="inv-title">Enterprise System Configuration</h3>
                        <p className="inv-sub">Manage company profile, GSTIN tax configuration, multi-user permissions & Tally sync</p>
                      </div>
                      <span className="badge badge-success">✓ Cloud Backup Enabled</span>
                    </div>

                    <div style={{ padding: '24px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        <div style={{ background: 'var(--bg-subtle)', padding: '18px', borderRadius: 'var(--radius-md)' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>Company Information</h4>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '4px' }}><b>Legal Name:</b> NET INFOTECH SYSTEM PVT. LTD.</p>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '4px' }}><b>GSTIN:</b> 27AABCU9603R1ZM</p>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '4px' }}><b>PAN:</b> AABCU9603R</p>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}><b>Financial Year:</b> 01-Apr-2026 to 31-Mar-2027</p>
                        </div>

                        <div style={{ background: 'var(--bg-subtle)', padding: '18px', borderRadius: 'var(--radius-md)' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>GST & e-Invoice Settings</h4>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '4px' }}><b>IRP Portal:</b> NIC / ClearTax Gateway (Connected)</p>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '4px' }}><b>e-Way Bill Auto-Gen:</b> Enabled (&gt; ₹50,000 threshold)</p>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '4px' }}><b>Auto Round-Off:</b> Nearest Rupee</p>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}><b>Reverse Charge (RCM):</b> Configured</p>
                        </div>

                        <div style={{ background: 'var(--bg-subtle)', padding: '18px', borderRadius: 'var(--radius-md)' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>Data Security & Auditing</h4>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '4px' }}><b>Audit Trail (MCA):</b> Active & Compliant</p>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '4px' }}><b>Encryption:</b> AES-256 Bit Bank Grade</p>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}><b>Last Cloud Backup:</b> Today at 02:15 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </main>

          </div>

        </div>

      </div>
    </section>
  );
}
