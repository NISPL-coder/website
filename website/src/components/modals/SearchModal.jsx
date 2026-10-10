import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  ArrowRight, 
  FileText, 
  Cloud, 
  Server, 
  ShieldCheck, 
  Wrench, 
  Laptop, 
  Globe, 
  ShoppingCart, 
  Code, 
  Sparkles, 
  Building2, 
  PhoneCall, 
  Award,
  Layers
} from 'lucide-react';
import './SearchModal.css';

export default function SearchModal({ 
  isOpen, 
  onClose, 
  transactions = [], 
  products = [] 
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const catalog = [
    {
      id: 'tally-prime',
      title: 'Tally Prime Solutions',
      desc: 'Licensing, GST setup, inventory management, billing & business reporting',
      badge: 'Service',
      badgeClass: 'badge-service',
      path: '/services/tally-prime',
      keywords: 'tally prime gst inventory accounting billing invoicing licensing tallyprime'
    },
    {
      id: 'tally-cloud',
      title: 'Tally on Cloud',
      desc: 'Secure remote cloud hosting, anywhere 24/7 access, automated daily backups',
      badge: 'Service',
      badgeClass: 'badge-service',
      path: '/services/tally-on-cloud',
      keywords: 'tally on cloud remote access hosting cloud server tallycloud backup'
    },
    {
      id: 'cloud-hosting',
      title: 'Data Center, Cloud Server & Hosting',
      desc: 'Windows/Linux server deployment, Microsoft Azure & AWS hybrid cloud infrastructure',
      badge: 'Service',
      badgeClass: 'badge-service',
      path: '/services/data-center-cloud',
      keywords: 'data center cloud server hosting azure aws windows linux tier 4 datacenter'
    },
    {
      id: 'it-infra',
      title: 'IT Infrastructure & Security',
      desc: 'Server/network management, firewalls, CCTV, Wi-Fi, Microsoft 365 & IT AMC',
      badge: 'Service',
      badgeClass: 'badge-service',
      path: '/services/it-infra-security',
      keywords: 'it infrastructure security firewall network cctv wifi amc m365 microsoft'
    },
    {
      id: 'it-repair',
      title: 'IT Product Repair & Maintenance',
      desc: 'Desktop, laptop, printer, server & hardware troubleshooting and repair',
      badge: 'Service',
      badgeClass: 'badge-service',
      path: '/services/it-repair-maintenance',
      keywords: 'repair maintenance hardware laptop desktop printer server motherboard fixing'
    },
    {
      id: 'it-rental',
      title: 'IT Product Sales & Rental',
      desc: 'Laptops, desktops, workstations & networking equipment procurement and rental',
      badge: 'Service',
      badgeClass: 'badge-service',
      path: '/services/it-sales-rental',
      keywords: 'sales rental lease rent laptop desktop workstation hardware procurement'
    },
    {
      id: 'business-websites',
      title: 'Business Websites & Web Apps',
      desc: 'Modern, high-converting responsive corporate portals and web platforms',
      badge: 'Solution',
      badgeClass: 'badge-solution',
      path: '/solutions',
      keywords: 'business websites website web design development portal corporate web'
    },
    {
      id: 'ecommerce',
      title: 'E-Commerce Solutions',
      desc: 'Online shopping platforms, payment gateway integration & Tally inventory sync',
      badge: 'Solution',
      badgeClass: 'badge-solution',
      path: '/solutions',
      keywords: 'ecommerce e-commerce online store shop cart payments gateway tally sync'
    },
    {
      id: 'custom-software',
      title: 'Custom Software & ERP',
      desc: 'Tailor-made web/desktop ERP, CRM & custom enterprise business workflows',
      badge: 'Solution',
      badgeClass: 'badge-solution',
      path: '/solutions',
      keywords: 'custom software erp crm automation workflow web application desktop'
    },
    {
      id: 'portfolio',
      title: 'Client Portfolio & Case Studies',
      desc: 'Proven digital transformation for 1,000+ corporate clients across India',
      badge: 'Case Study',
      badgeClass: 'badge-case',
      path: '/portfolio',
      keywords: 'portfolio case studies clients success stories projects retail manufacturing'
    },
    {
      id: 'contact',
      title: 'Contact & Registered Office',
      desc: 'Webel Tower 1, Salt Lake Sector V, Kolkata • Hotline: 033-4004 1899 / +91 9330113000',
      badge: 'Contact',
      badgeClass: 'badge-company',
      path: '/contact',
      keywords: 'contact phone call email address location webel tower sector v salt lake kolkata support'
    }
  ];

  // Filter catalog items
  const cleanQ = query.trim().toLowerCase();
  const matchedCatalog = cleanQ
    ? catalog.filter(item => 
        item.title.toLowerCase().includes(cleanQ) ||
        item.desc.toLowerCase().includes(cleanQ) ||
        item.keywords.toLowerCase().includes(cleanQ)
      )
    : [];

  // Filter mock invoices if matching query
  const matchedInvoices = cleanQ
    ? transactions.filter(t =>
        t.party.toLowerCase().includes(cleanQ) ||
        t.invoiceNo.toLowerCase().includes(cleanQ)
      ).slice(0, 3)
    : [];

  const handleNavigate = (path) => {
    onClose();
    if (path.includes('#')) {
      const [route, hash] = path.split('#');
      navigate(route);
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      navigate(path);
    }
  };

  return (
    <div 
      className="nis-search-backdrop" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Global Search"
    >
      <div 
        className="nis-search-dialog" 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Search Input Bar */}
        <div className="nis-search-input-bar">
          <Search size={20} className="nis-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="nis-search-input"
            placeholder="Search Tally, Cloud, IT Services, Solutions, Invoices..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="nis-search-actions-bar">
            {query && (
              <button 
                type="button" 
                className="nis-search-close-btn"
                onClick={() => setQuery('')}
                title="Clear input"
              >
                <X size={16} />
              </button>
            )}
            <button 
              type="button" 
              className="nis-search-close-btn"
              onClick={onClose}
              title="Close search"
              aria-label="Close search"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Results Body */}
        <div className="nis-search-results-body">
          
          {/* 1. Quick Navigation when search query is empty */}
          {!cleanQ && (
            <div>
              <span className="nis-search-section-label">Quick Navigation</span>
              <div className="nis-search-quick-grid">
                <button
                  type="button"
                  className="nis-search-quick-pill"
                  onClick={() => handleNavigate('/services/tally-prime')}
                >
                  <div className="quick-icon-wrap quick-icon-blue">
                    <FileText size={16} />
                  </div>
                  <div>
                    <span className="quick-text-title">Tally Prime</span>
                    <span className="quick-text-sub">Licensing & Support</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="nis-search-quick-pill"
                  onClick={() => handleNavigate('/services/tally-on-cloud')}
                >
                  <div className="quick-icon-wrap quick-icon-indigo">
                    <Cloud size={16} />
                  </div>
                  <div>
                    <span className="quick-text-title">Tally on Cloud</span>
                    <span className="quick-text-sub">Anywhere Access</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="nis-search-quick-pill"
                  onClick={() => handleNavigate('/services/data-center-cloud')}
                >
                  <div className="quick-icon-wrap quick-icon-purple">
                    <Server size={16} />
                  </div>
                  <div>
                    <span className="quick-text-title">Cloud Servers</span>
                    <span className="quick-text-sub">Azure & AWS Hosting</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="nis-search-quick-pill"
                  onClick={() => handleNavigate('/contact')}
                >
                  <div className="quick-icon-wrap quick-icon-emerald">
                    <PhoneCall size={16} />
                  </div>
                  <div>
                    <span className="quick-text-title">Contact NISPL</span>
                    <span className="quick-text-sub">Kolkata Webel Tower 1</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* 2. Matched Catalog Results */}
          {cleanQ && matchedCatalog.length > 0 && (
            <div>
              <span className="nis-search-section-label">
                Matching Services & Pages ({matchedCatalog.length})
              </span>
              <div className="nis-search-items-list">
                {matchedCatalog.map((item) => (
                  <div
                    key={item.id}
                    className="nis-search-item"
                    onClick={() => handleNavigate(item.path)}
                  >
                    <div className="search-item-left">
                      <span className={`search-item-badge ${item.badgeClass}`}>
                        {item.badge}
                      </span>
                      <div className="search-item-info">
                        <span className="search-item-title">{item.title}</span>
                        <span className="search-item-desc">{item.desc}</span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="search-item-arrow" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Matched Invoices */}
          {cleanQ && matchedInvoices.length > 0 && (
            <div>
              <span className="nis-search-section-label">Matching Invoices & Vouchers</span>
              <div className="nis-search-items-list">
                {matchedInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="nis-search-item"
                    onClick={() => handleNavigate('/contact')}
                  >
                    <div className="search-item-left">
                      <span className="search-item-badge badge-invoice">
                        INV
                      </span>
                      <div className="search-item-info">
                        <span className="search-item-title">
                          <b>{inv.invoiceNo}</b> — {inv.party}
                        </span>
                        <span className="search-item-desc">
                          Amount: ₹{inv.amount.toLocaleString('en-IN')} • Status: {inv.status}
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="search-item-arrow" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Empty state */}
          {cleanQ && matchedCatalog.length === 0 && matchedInvoices.length === 0 && (
            <div className="nis-search-empty">
              <Search size={36} color="#94A3B8" />
              <p>No results found for "<b>{query}</b>"</p>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Try searching for "Tally", "Cloud", "Server", "Security", or "Contact"
              </span>
            </div>
          )}

        </div>    
      </div>
    </div>
  );
}
