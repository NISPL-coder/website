import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calculator, 
  Cloud, 
  Server, 
  ShieldCheck, 
  Wrench, 
  Laptop, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Phone, 
  ChevronRight,
  ExternalLink,
  Award,
  Lock,
  Layers
} from 'lucide-react';
import { CORE_SERVICES, COMPANY_INFO } from '../data/mockData';
import AccountingModule from '../components/AccountingModule';
import { 
  INITIAL_METRICS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_PRODUCTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_SUPPLIERS 
} from '../data/mockData';
import './Pages.css';

const ICON_MAP = {
  Calculator,
  Cloud,
  Server,
  ShieldCheck,
  Wrench,
  Laptop
};

export default function ServicesPage({ onOpenDemo, onShowToast }) {
  const [activeTab, setActiveTab] = useState('all');
  const [showLiveTallyDemo, setShowLiveTallyDemo] = useState(false);

  // Accounting module state for embedded sandbox
  const [erpTab, setErpTab] = useState('accounting');
  const [erpSubTab, setErpSubTab] = useState('sales');
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  return (
    <div className="services-page-view">
      
      {/* 1. PAGE HERO BANNER */}
      <div className="page-header-banner">
        <div className="page-header-ambient" />
        <div className="container page-header-content">
          <div className="page-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Products & Services</span>
          </div>
          <h1 className="page-header-title">Our Products & Services</h1>
          <p className="page-header-desc">
            Complete enterprise software, cloud infrastructure, IT security, and hardware lifecycle solutions backed by Net Infotech System's 25+ years of excellence.
          </p>
        </div>
      </div>

      {/* 2. SERVICES OVERVIEW & DETAILED BLOCKS */}
      <section className="page-body-section">
        <div className="container">
          
          <div className="section-title-center">
            <div className="nis-section-badge">
              <Sparkles size={14} className="badge-sparkle" />
              <span>THE 6 PILLARS OF OUR EXPERTISE</span>
            </div>
            <h2 className="nis-section-h2">
              End-to-End Enterprise <span className="gradient-text">IT & Software</span>
            </h2>
            <p className="nis-section-sub">
              Browse our comprehensive product and service portfolio. Each offering is backed by certified implementation specialists and guaranteed service-level agreements.
            </p>
          </div>

          {/* Detailed Service Blocks */}
          <div className="service-details-container">
            {CORE_SERVICES.map((srv) => {
              const IconComp = ICON_MAP[srv.icon] || Server;
              return (
                <div key={srv.id} id={srv.id} className="service-detail-block">
                  
                  {/* Top Header */}
                  <div className="service-detail-header">
                    <div className="service-detail-header-left">
                      <div className="service-detail-icon" style={{ background: srv.gradient }}>
                        <IconComp size={28} />
                      </div>
                      <div>
                        <h3 className="service-detail-title">{srv.number}. {srv.title}</h3>
                        <span className="service-detail-tagline">{srv.tagline}</span>
                      </div>
                    </div>
                    <span className="service-cta-badge">{srv.badge}</span>
                  </div>

                  <p className="nis-service-desc">{srv.description}</p>

                  {/* 2-Column Content: Feature Matrix + Action Box */}
                  <div className="service-detail-grid">
                    
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: '#0F172A' }}>
                        Key Capabilities & Deliverables:
                      </h4>
                      <div className="service-feature-box-list">
                        {srv.features.map((feat, fIdx) => (
                          <div key={fIdx} className="service-feature-box-item">
                            <CheckCircle2 size={16} />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Action / CTA Card */}
                    <div className="service-detail-cta-card">
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                        Need {srv.title}?
                      </h4>
                      <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: '1.5' }}>
                        Get customized configuration, pricing options, and seamless rollout from our Kolkata headquarters.
                      </p>
                      
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <Link 
                          to={`/services/${srv.id}`} 
                          className="nis-primary-btn"
                          style={{ padding: '8px 18px', fontSize: '0.84rem' }}
                        >
                          <span>Explore Dedicated Page</span>
                          <ArrowRight size={14} />
                        </Link>

                        <Link 
                          to="/contact" 
                          className="nis-secondary-btn"
                          style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                        >
                          <span>Get Quote</span>
                        </Link>
                        
                        {srv.id === 'tally-prime' && (
                          <button
                            type="button"
                            className="nis-secondary-btn"
                            style={{ padding: '8px 16px', fontSize: '0.84rem', background: '#F0FDF4', borderColor: '#86EFAC', color: '#166534' }}
                            onClick={() => setShowLiveTallyDemo(!showLiveTallyDemo)}
                          >
                            <span>{showLiveTallyDemo ? 'Hide Live Sandbox' : 'Try Live Tally Demo'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 3. INTERACTIVE TALLY DEMO SANDBOX (Embedded for prospective clients!) */}
      {showLiveTallyDemo && (
        <section className="page-body-section alt-bg animate-fade-in">
          <div className="container">
            <div className="section-title-center">
              <div className="nis-section-badge">
                <Calculator size={14} className="badge-sparkle" />
                <span>LIVE TALLYPRIME ERP TEST DRIVE</span>
              </div>
              <h2 className="nis-section-h2">
                Interactive <span className="gradient-text">Accounting & Invoicing Demo</span>
              </h2>
              <p className="nis-section-sub">
                Experience how TallyPrime handles sales invoices, stock inventory, double-entry bookkeeping, and automated financial reports in real time.
              </p>
            </div>

            <AccountingModule
              activeTab={erpTab}
              activeSubTab={erpSubTab}
              onTabChange={(t, s) => { setErpTab(t); setErpSubTab(s); }}
              metrics={INITIAL_METRICS}
              transactions={transactions}
              products={products}
              customers={INITIAL_CUSTOMERS}
              suppliers={INITIAL_SUPPLIERS}
              onOpenCreateInvoice={() => {}}
              onOpenAddProduct={() => {}}
              onOpenAddParty={() => {}}
              onToggleTxStatus={() => {}}
              onViewInvoice={() => {}}
              onShowToast={onShowToast}
            />
          </div>
        </section>
      )}

      {/* 4. CALL TO ACTION BANNER */}
      <section className="nis-cta-banner-section">
        <div className="container">
          <div className="nis-cta-banner-card">
            <div className="cta-left">
              <span className="cta-badge">OFFICIAL TALLY 3-STAR PARTNER</span>
              <h2 className="cta-title">Upgrade Your Business IT Infrastructure Today</h2>
              <p className="cta-desc">
                Contact our specialists at Webel Tower 1, Salt Lake Sector V, Kolkata for Tally licensing, cloud servers, or IT hardware rental.
              </p>
            </div>
            <div className="cta-right">
              <Link to="/contact" className="cta-btn-primary">
                <span>Request a Free Quote</span>
                <ArrowRight size={16} />
              </Link>
              <a href="tel:+919330113000" className="cta-btn-secondary">
                <Phone size={16} />
                <span>Call 9330113000</span>
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
