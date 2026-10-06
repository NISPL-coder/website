import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  Phone, 
  Mail, 
  Globe, 
  Building2,
  Server,
  Cloud,
  Calculator,
  Wrench,
  Laptop,
  Users
} from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import GoogleReviewsSection from '../components/GoogleReviewsSection';
import OurClientsSection from '../components/OurClientsSection';
import { 
  COMPANY_INFO, 
  CORE_SERVICES, 
  OUR_SOLUTIONS, 
  WHY_CHOOSE_US, 
  PORTFOLIO_CASES 
} from '../data/mockData';
import '../components/MarketingSections.css';

const ICON_MAP = {
  Calculator,
  Cloud,
  Server,
  ShieldCheck,
  Wrench,
  Laptop
};

export default function HomePage({ onOpenDemo }) {
  return (
    <div className="home-page-view">
      
      {/* 1. HERO SECTION */}
      <HeroCarousel 
        onExploreAccounting={() => {}}
        onExploreNIS={() => {}}
        onManageInventory={() => {}}
        onViewReports={() => {}}
        onBookDemo={onOpenDemo}
      />

      {/* 2. 6 CORE PRODUCTS & SERVICES */}
      <section className="nis-section nis-services-section">
        <div className="container">
          <div className="section-title-center">
            <div className="nis-section-badge">
              <span>CORE PRODUCTS & SERVICES</span>
            </div>
            <h2 className="nis-section-h2">
              Comprehensive IT & <span className="gradient-text">Software Solutions</span>
            </h2>
            <p className="nis-section-sub">
              Explore our 6 dedicated business divisions — each with specialized enterprise licensing, high-availability infrastructure, chip-level labs, and SLA guarantees.
            </p>
          </div>

          <div className="nis-services-grid">
            {CORE_SERVICES.map((srv) => {
              const IconComp = ICON_MAP[srv.icon] || Server;
              return (
                <div key={srv.id} className="nis-service-card">
                  <div className="nis-service-card-top">
                    <div className="nis-service-icon-box">
                      <IconComp size={22} color="#0284C7" />
                    </div>
                    <div className="nis-service-num-badge">
                      <span className="nis-service-badge-pill">{srv.badge}</span>
                      <span className="nis-service-num">{srv.number}</span>
                    </div>
                  </div>

                  <h3 className="nis-service-title">{srv.title}</h3>
                  <p className="nis-service-tagline">{srv.tagline}</p>
                  <p className="nis-service-desc" style={{ marginBottom: '24px', flex: 1 }}>{srv.description}</p>

                  <div className="nis-service-card-footer">
                    <Link to={`/services/${srv.id}`} className="nis-service-action-btn">
                      <span>Visit Dedicated Page</span>
                      <ArrowRight size={15} />
                    </Link>
                    <Link to="/contact" className="nis-service-demo-link">
                      Enquire ↗
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Direct Link Directory */}
          <div className="nis-services-strip-portal">
            <span className="nis-strip-portal-title">Direct Service Portals:</span>
            <div className="nis-strip-portal-links">
              <Link to="/services/tally-prime" className="portal-pill-link">1. Tally Prime</Link>
              <Link to="/services/tally-on-cloud" className="portal-pill-link">2. Tally on Cloud</Link>
              <Link to="/services/data-center-cloud" className="portal-pill-link">3. Data Center & Cloud</Link>
              <Link to="/services/it-infra-security" className="portal-pill-link">4. IT Infrastructure</Link>
              <Link to="/services/it-repair-maintenance" className="portal-pill-link">5. Hardware Repair</Link>
              <Link to="/services/it-sales-rental" className="portal-pill-link">6. IT Rentals & Sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. GOOGLE REVIEWS SECTION (AUTO HORIZONTAL SCROLL) */}
      <GoogleReviewsSection />

      {/* 4. OUR CLIENTS SECTION */}
      <OurClientsSection onOpenDemo={onOpenDemo} />

      {/* 5. WHY CHOOSE US */}
      <section className="nis-section nis-why-section">
        <div className="container">
          <div className="section-title-center">
            <div className="nis-section-badge">
              <span>THE NISPL ADVANTAGE</span>
            </div>
            <h2 className="nis-section-h2">
              Why Choose <span className="gradient-text">Net Infotech System</span>
            </h2>
            <p className="nis-section-sub">
              Our commitment to technical mastery, reliable SLA delivery, and responsive customer support sets us apart as your preferred technology partner.
            </p>
          </div>

          <div className="nis-why-grid">
            {WHY_CHOOSE_US.map((why) => (
              <div key={why.id} className="nis-why-card">
                <div className="why-card-header">
                  <div className="why-icon-box">
                    <Users size={24} />
                  </div>
                  <span className="why-stat-pill">{why.stat}</span>
                </div>
                <h3 className="why-title">{why.title}</h3>
                <p className="why-desc">{why.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SOLUTIONS OVERVIEW */}
      <section className="nis-section nis-solutions-section">
        <div className="container">
          <div className="section-title-center">
            <div className="nis-section-badge">
              <span>ENTERPRISE SOLUTIONS</span>
            </div>
            <h2 className="nis-section-h2">
              Our <span className="gradient-text">Solutions</span>
            </h2>
            <p className="nis-section-sub">
              From responsive business websites and e-Commerce stores to custom software architecture and end-to-end digital transformation.
            </p>
          </div>

          <div className="nis-solutions-grid">
            {OUR_SOLUTIONS.map((sol) => (
              <div key={sol.id} className="nis-solution-card">
                <div className="solution-icon-wrap">
                  <Globe size={28} />
                </div>
                <h3 className="solution-title">{sol.title}</h3>
                <p className="solution-desc">{sol.description}</p>
                <Link to="/solutions" className="solution-btn">
                  <span>Explore Solution</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION BANNER */}
      <section className="nis-cta-banner-section">
        <div className="container">
          <div className="nis-cta-banner-card">
            <div className="cta-left">
              <span className="cta-badge">ENTERPRISE CONSULTATION & ADVISORY</span>
              <h2 className="cta-title">Ready to Elevate Your IT & Cloud Systems?</h2>
              <p className="cta-desc">
                Partner with Net Infotech System Pvt. Ltd. Get certified TallyPrime deployment, enterprise cloud servers, and comprehensive IT support backed by 25+ years of excellence.
              </p>
            </div>
            <div className="cta-right">
              <button 
                type="button" 
                className="cta-btn-primary"
                onClick={onOpenDemo}
              >
                <span>Get a Free Quote</span>
                <ArrowRight size={16} />
              </button>
              <a href="tel:+919330113000" className="cta-btn-secondary">
                <Phone size={16} />
                <span>Call +91 9330113000</span>
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

