import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  Award, 
  Phone,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { PORTFOLIO_CASES } from '../data/mockData';
import './Pages.css';

export default function PortfolioPage({ onOpenDemo }) {
  const [filter, setFilter] = useState('all');

  const detailedCases = [
    ...PORTFOLIO_CASES,
    {
      id: 5,
      client: "Howrah Engineering Works",
      category: "IT Product Rental & AMC",
      result: "Supplied 45 high-performance workstation laptops and dedicated server rental with 24/7 on-site IT support for an infrastructure expansion project.",
      metric: "Zero Downtime in 18 Mos",
      industry: "Heavy Engineering"
    },
    {
      id: 6,
      client: "East India Pharma Distributors",
      category: "Tally on Cloud & Batch Management",
      result: "Integrated automated medicine batch tracking, expiry alerts, and multi-godown stock transfers in TallyPrime with automated WhatsApp invoicing.",
      metric: "99.4% Order Accuracy",
      industry: "Pharmaceuticals"
    }
  ];

  const filteredCases = filter === 'all' 
    ? detailedCases 
    : detailedCases.filter((c) => c.industry.toLowerCase().includes(filter.toLowerCase()) || c.category.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="portfolio-page-view">
      
      {/* 1. PAGE HERO BANNER */}
      <div className="page-header-banner">
        <div className="page-header-ambient" />
        <div className="container page-header-content">
          <div className="page-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Portfolio</span>
          </div>
          <h1 className="page-header-title">Our Portfolio & Case Studies</h1>
          <p className="page-header-desc">
            Explore how Net Infotech System has solved mission-critical IT, cloud hosting, and accounting challenges for top enterprises across West Bengal and nationwide.
          </p>
        </div>
      </div>

      {/* 2. CASE STUDIES GRID */}
      <section className="page-body-section">
        <div className="container">
          
          <div className="section-title-center">
            <div className="nis-section-badge">
              <TrendingUp size={14} className="badge-sparkle" />
              <span>MEASURABLE BUSINESS IMPACT</span>
            </div>
            <h2 className="nis-section-h2">
              Transforming Operations <span className="gradient-text">Across Industries</span>
            </h2>
            <p className="nis-section-sub">
              Every case study below represents real-world ROI, seamless cloud migration, and bulletproof security delivered by our team.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
            {['all', 'Manufacturing', 'Retail', 'Healthcare', 'Logistics', 'Engineering'].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`nis-nav-pill-btn ${filter === cat ? 'active' : ''}`}
                style={{
                  background: filter === cat ? '#0284C7' : '#F1F5F9',
                  color: filter === cat ? '#FFFFFF' : '#475569',
                  border: 'none',
                  padding: '7px 16px',
                  borderRadius: '20px',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
                onClick={() => setFilter(cat)}
              >
                {cat === 'all' ? 'All Case Studies' : cat}
              </button>
            ))}
          </div>

          <div className="nis-portfolio-grid">
            {filteredCases.map((item) => (
              <div key={item.id} className="nis-portfolio-card">
                <div className="portfolio-top-bar">
                  <span className="portfolio-industry">{item.industry}</span>
                  <span className="portfolio-metric-badge">{item.metric}</span>
                </div>
                <h4 className="portfolio-client">{item.client}</h4>
                <span className="portfolio-category">{item.category}</span>
                <p className="portfolio-result">{item.result}</p>
                <div className="portfolio-footer">
                  <span className="verified-tag">✓ Fully Deployed & Managed by NISPL</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. CALL TO ACTION BANNER */}
      <section className="nis-cta-banner-section">
        <div className="container">
          <div className="nis-cta-banner-card">
            <div className="cta-left">
              <span className="cta-badge">GET MEASURABLE RESULTS</span>
              <h2 className="cta-title">Want Similar Results for Your Business?</h2>
              <p className="cta-desc">
                Consult with our enterprise architects at Webel Tower 1, Sector V, Kolkata to discuss your specific infrastructure or software goals.
              </p>
            </div>
            <div className="cta-right">
              <Link to="/contact" className="cta-btn-primary">
                <span>Start Your Project</span>
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
