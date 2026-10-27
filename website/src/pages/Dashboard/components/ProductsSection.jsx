import React, { useState, useMemo } from 'react';
import {
  Package,
  ShoppingCart,
  Check,
  Server,
  Smartphone,
  MessageSquare,
  ArrowRight,
  Search,
  ShieldCheck,
  Zap,
  Headphones,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';

export const CATALOG_PRODUCTS = [
  {
    id: 'prod-tss-single',
    category: 'tss',
    categoryLabel: 'TSS Renewal',
    name: 'TSS Single User',
    fullName: 'Tally Software Service — Single User',
    badge: 'Popular',
    badgeVariant: 'badge-blue',
    desc: 'Annual TSS renewal with automated e-Invoice, e-Way Bill, and statutory updates for a single workstation.',
    basePrice: 4500,
    displayPrice: '₹4,500',
    period: '/ year',
    taxNote: '+18% GST (₹810)',
    accentColor: '#2563eb',
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
    icon: Package,
    specs: ['Single PC', 'e-Invoice API', 'v5.0 Ready'],
    features: [
      'Automated e-Invoice & e-Way Bill direct generation',
      'Connected Banking & Automated Bank Reconciliation',
      'Continuous statutory & GST compliance updates',
      'Free software version upgrades for 1 full year'
    ]
  },
  {
    id: 'prod-tss-multi',
    category: 'tss',
    categoryLabel: 'TSS Renewal',
    name: 'TSS Multi User',
    fullName: 'Tally Software Service — Multi User',
    badge: 'Best Value',
    badgeVariant: 'badge-emerald',
    desc: 'Unlimited LAN concurrent users with real-time sync, remote browser access, and full statutory compliance.',
    basePrice: 13500,
    displayPrice: '₹13,500',
    period: '/ year',
    taxNote: '+18% GST (₹2,430)',
    accentColor: '#059669',
    iconBg: '#ecfdf5',
    iconColor: '#059669',
    icon: Layers,
    specs: ['Unlimited LAN', 'Remote Access', 'Auditor Edition'],
    features: [
      'Unlimited concurrent LAN users on local network',
      'Anywhere web browser reporting & financial sheets',
      'Free TallyPrime Auditor Edition license included',
      'Multi-branch real-time data sync & consolidation'
    ]
  },
  {
    id: 'prod-cloud-pro',
    category: 'cloud',
    categoryLabel: 'Cloud Server',
    name: 'Cloud VPS — Business',
    fullName: 'Dedicated Tally Cloud Server — Business',
    badge: 'Recommended',
    badgeVariant: 'badge-indigo',
    desc: 'High-speed dedicated cloud server optimized for small teams with daily automated backups.',
    basePrice: 2499,
    displayPrice: '₹2,499',
    period: '/ month',
    taxNote: '+18% GST (₹450)',
    accentColor: '#4f46e5',
    iconBg: '#eef2ff',
    iconColor: '#4f46e5',
    icon: Server,
    specs: ['4 GB Dedicated RAM', '50 GB NVMe', 'Up to 3 Users'],
    features: [
      'Tier-4 Datacenter hosted with 99.98% uptime SLA',
      'Blazing fast NVMe SSD storage with RAID protection',
      'Any-device access: Windows, Mac, iPad & Android',
      'Daily automated cloud backups & disaster recovery'
    ]
  },
  {
    id: 'prod-cloud-host',
    category: 'cloud',
    categoryLabel: 'Cloud Server',
    name: 'Cloud Server Node',
    fullName: 'Dedicated Tally Cloud Server — Enterprise',
    badge: 'High Performance',
    badgeVariant: 'badge-purple',
    desc: 'Enterprise-grade Windows Server with dedicated compute, NVMe storage, and priority dedicated bandwidth.',
    basePrice: 4500,
    displayPrice: '₹4,500',
    period: '/ month',
    taxNote: '+18% GST (₹810)',
    accentColor: '#7c3aed',
    iconBg: '#f5f3ff',
    iconColor: '#7c3aed',
    icon: Cpu,
    specs: ['8 GB Dedicated RAM', '100 GB NVMe', 'Unlimited Users'],
    features: [
      'Dedicated Intel Xeon compute node with zero lag',
      'Clientless HTML5 browser terminal & native RDP',
      'Enterprise firewall, DDoS shield & malware defense',
      'Hourly automated snapshots with 30-day retention'
    ]
  },
  {
    id: 'prod-tally-mobile',
    category: 'addons',
    categoryLabel: 'Productivity Add-on',
    name: 'Biz Analyst Mobile',
    fullName: 'Biz Analyst Tally on Mobile App (1 Year)',
    badge: 'Mobile App',
    badgeVariant: 'badge-amber',
    desc: 'Access your complete Tally business data on iOS and Android with live outstanding and customer analytics.',
    basePrice: 2124,
    displayPrice: '₹2,124',
    period: '/ year',
    taxNote: '+18% GST (₹382)',
    accentColor: '#d97706',
    iconBg: '#fffbeb',
    iconColor: '#d97706',
    icon: Smartphone,
    specs: ['iOS & Android', 'Offline Mode', 'WhatsApp Direct'],
    features: [
      'Real-time cashflow, sales, and inventory analytics',
      'Direct customer payment reminders via WhatsApp',
      'Create sales orders & receipts offline on phone',
      'Role-based granular user permissions & data access'
    ]
  },
  {
    id: 'prod-whatsapp-module',
    category: 'addons',
    categoryLabel: 'Productivity Add-on',
    name: 'WhatsApp Tally Integration',
    fullName: 'Tally WhatsApp Automated Messaging Module',
    badge: 'Automation',
    badgeVariant: 'badge-emerald',
    desc: 'Send GST invoices, receipts, statements, and payment reminders directly from Tally via official WhatsApp API.',
    basePrice: 3000,
    displayPrice: '₹3,000',
    period: '/ year',
    taxNote: '+18% GST (₹540)',
    accentColor: '#059669',
    iconBg: '#ecfdf5',
    iconColor: '#059669',
    icon: MessageSquare,
    specs: ['Official API', 'Custom Templates', 'Bulk Dispatch'],
    features: [
      '1-Click automated PDF invoice dispatch upon voucher save',
      'Instant payment receipt confirmation to customers',
      'Bulk ledger statements & overdue payment reminders',
      'Fully customizable greeting & message templates'
    ]
  }
];

const TABS = [
  { id: 'all',    label: 'All Products' },
  { id: 'tss',    label: 'TSS Renewals' },
  { id: 'cloud',  label: 'Cloud Hosting' },
  { id: 'addons', label: 'Add-ons' }
];

function ProductCard({ product, isInCart, isJustAdded, onAdd }) {
  const Icon = product.icon;

  return (
    <div className={`cliento-pro-card ${isInCart ? 'in-cart' : ''}`}>
      {/* Card Header */}
      <div className="cliento-pro-card-header">
        <div className="cliento-pro-icon-wrap" style={{ background: product.iconBg, color: product.iconColor }}>
          <Icon size={20} />
        </div>
        <div className="cliento-pro-badges">
          <span className="cliento-pro-cat-tag">{product.categoryLabel}</span>
          {product.badge && (
            <span className={`cliento-pro-status-badge ${product.badgeVariant}`}>
              {product.badge}
            </span>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <div className="cliento-pro-body">
        <h4 className="cliento-pro-title" title={product.fullName}>
          {product.fullName}
        </h4>
        <p className="cliento-pro-desc">
          {product.desc}
        </p>

        {/* Spec Highlights Row */}
        {product.specs && (
          <div className="cliento-pro-specs-row">
            {product.specs.map((spec, si) => (
              <span key={si} className="cliento-pro-spec-pill">
                {spec}
              </span>
            ))}
          </div>
        )}

        {/* Feature List */}
        <div className="cliento-pro-features-wrap">
          <span className="cliento-pro-features-title">What's included:</span>
          <ul className="cliento-pro-features-list">
            {product.features.map((f, i) => (
              <li key={i} className="cliento-pro-feature-item">
                <span className="cliento-pro-check-circle" style={{ color: product.accentColor }}>
                  <Check size={12} strokeWidth={2.5} />
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer / Pricing & Action */}
      <div className="cliento-pro-footer">
        <div className="cliento-pro-pricing">
          <span className="cliento-pro-tax-hint">Starting {product.taxNote}</span>
          <div className="cliento-pro-price-row">
            <span className="cliento-pro-amount">{product.displayPrice}</span>
            <span className="cliento-pro-period">{product.period}</span>
          </div>
        </div>

        <button
          type="button"
          className={`cliento-pro-btn ${isInCart ? 'btn-in-cart' : isJustAdded ? 'btn-added' : ''}`}
          onClick={() => !isInCart && onAdd(product)}
        >
          {isJustAdded ? (
            <>
              <Check size={14} strokeWidth={2.5} />
              <span>Added!</span>
            </>
          ) : isInCart ? (
            <>
              <Check size={14} strokeWidth={2.5} />
              <span>In Cart</span>
            </>
          ) : (
            <>
              <ShoppingCart size={14} />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function ProductsSection({
  onAddToCart,
  onGoToCart,
  cartItemIds = []
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [justAddedId, setJustAddedId] = useState(null);

  const filteredProducts = useMemo(() => {
    return CATALOG_PRODUCTS.filter(p => {
      const matchesTab = activeTab === 'all' || p.category === activeTab;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesTab;

      const matchesSearch =
        p.fullName.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.features.some(f => f.toLowerCase().includes(q)) ||
        (p.specs && p.specs.some(s => s.toLowerCase().includes(q)));

      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  const handleAdd = (product) => {
    onAddToCart(product);
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1800);
  };

  const getTabCount = (tabId) => {
    if (tabId === 'all') return CATALOG_PRODUCTS.length;
    return CATALOG_PRODUCTS.filter(p => p.category === tabId).length;
  };

  return (
    <div className="cliento-products-container animate-fade-in">
      {/* ── 1. Top Controls Bar: Tabs + Search + Cart CTA ──── */}
      <div className="cliento-card cliento-products-controls-bar">
        {/* Left: Category Filter Pills */}
        <div className="cliento-products-tabs-row" role="tablist">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`cliento-pro-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.label}</span>
              <span className="cliento-pro-tab-count">{getTabCount(tab.id)}</span>
            </button>
          ))}
        </div>

        {/* Right: Quick Search Box & Cart Button */}
        <div className="cliento-products-controls-right">
          <div className="cliento-products-search-box">
            <Search size={14} className="cliento-products-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search solutions or specs..."
              className="cliento-products-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="cliento-products-search-clear"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {cartItemIds.length > 0 && (
            <button
              type="button"
              className="cliento-products-cart-btn"
              onClick={onGoToCart}
              title="Proceed to Cart"
            >
              <ShoppingCart size={14} />
              <span>Cart ({cartItemIds.length})</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Information & Trust Sub-Header ──────────────── */}
      <div className="cliento-products-substrip">
        <div className="cliento-substrip-left">
          <span>
            Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'solution' : 'solutions'}
            {activeTab !== 'all' && (
              <> in <strong>{TABS.find(t => t.id === activeTab)?.label}</strong></>
            )}
            {searchQuery && (
              <> matching "<em>{searchQuery}</em>"</>
            )}
          </span>
        </div>

        <div className="cliento-substrip-right">
          <ShieldCheck size={14} color="#059669" />
          <span>Official Tally Certified Partner • Instant Digital Activation</span>
        </div>
      </div>

      {/* ── 3. Unified Product Grid (Proper 3-Column Symmetrical Alignment) ── */}
      {filteredProducts.length > 0 ? (
        <div className="cliento-products-unified-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isInCart={cartItemIds.includes(product.id)}
              isJustAdded={justAddedId === product.id}
              onAdd={handleAdd}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="cliento-card cliento-products-empty-card">
          <div className="cliento-empty-icon-ring">
            <Package size={28} color="#94a3b8" />
          </div>
          <h4>No matching solutions found</h4>
          <p>We couldn't find any products matching "{searchQuery}". Try searching with different terms or reset filters.</p>
          <button
            type="button"
            className="cliento-empty-reset-btn"
            onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* ── 4. Enterprise Trust & Assurance Pillars ────────── */}
      <div className="cliento-products-trust-row">
        <div className="cliento-card cliento-trust-box">
          <div className="cliento-trust-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <ShieldCheck size={20} />
          </div>
          <div className="cliento-trust-text">
            <h5>100% Genuine Licenses</h5>
            <p>Direct authentic Tally licenses with valid account keys & automatic compliance updates.</p>
          </div>
        </div>

        <div className="cliento-card cliento-trust-box">
          <div className="cliento-trust-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <Zap size={20} />
          </div>
          <div className="cliento-trust-text">
            <h5>Instant Provisioning</h5>
            <p>Dedicated Tier-4 CtrlS datacenter servers provisioned with high-speed NVMe storage.</p>
          </div>
        </div>

        <div className="cliento-card cliento-trust-box">
          <div className="cliento-trust-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <Headphones size={20} />
          </div>
          <div className="cliento-trust-text">
            <h5>Priority Remote Support</h5>
            <p>Dedicated certified engineers on WhatsApp, phone & AnyDesk remote support.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
