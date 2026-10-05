import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  ShoppingBag, 
  Code2, 
  Zap, 
  Check, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Cpu,
  Layers,
  Phone
} from 'lucide-react';
import { OUR_SOLUTIONS } from '../data/mockData';
import './Pages.css';

const SOLUTION_ICON_MAP = {
  Globe: Globe,
  ShoppingBag: ShoppingBag,
  Code2: Code2,
  Zap: Zap,
};

export default function SolutionsPage({ onOpenDemo }) {
  const workflowSteps = [
    {
      num: "01",
      title: "Discovery & Architecture",
      desc: "We analyze your business workflows, accounting integration requirements, and user touchpoints to design a rock-solid solution blueprint."
    },
    {
      num: "02",
      title: "UI/UX & Prototyping",
      desc: "Creating intuitive, responsive wireframes and interactive prototypes that ensure seamless usability for your employees and customers."
    },
    {
      num: "03",
      title: "Agile Development",
      desc: "Robust code written with modern tech stacks, automated testing, and secure API integrations with Tally, payment gateways, and cloud servers."
    },
    {
      num: "04",
      title: "Deployment & 24/7 AMC",
      desc: "Zero-downtime production launch, staff training, automated backup schedules, and proactive ongoing maintenance contracts."
    }
  ];

  return (
    <div className="solutions-page-view">
      
      {/* 1. PAGE HERO BANNER */}
      <div className="page-header-banner">
        <div className="page-header-ambient" />
        <div className="container page-header-content">
          <div className="page-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Solutions</span>
          </div>
          <h1 className="page-header-title">Enterprise Software & Digital Solutions</h1>
          <p className="page-header-desc">
            Custom business websites, high-conversion e-Commerce portals, custom ERP systems, and end-to-end digital transformation tailored for growing Indian enterprises.
          </p>
        </div>
      </div>

      {/* 2. THE 4 SOLUTIONS DETAILS */}
      <section className="page-body-section">
        <div className="container">
          
          <div className="section-title-center">
            <div className="nis-section-badge">
              <Globe size={14} className="badge-sparkle" />
              <span>TRANSFORMING DIGITAL OPERATIONS</span>
            </div>
            <h2 className="nis-section-h2">
              Bespoke Digital <span className="gradient-text">Platforms & Software</span>
            </h2>
            <p className="nis-section-sub">
              Engineered with modern architectures, bulletproof cybersecurity, and seamless accounting integration.
            </p>
          </div>

          <div className="nis-solutions-grid" style={{ marginBottom: '60px' }}>
            {OUR_SOLUTIONS.map((sol) => {
              const IconComp = SOLUTION_ICON_MAP[sol.icon] || Globe;
              return (
                <div key={sol.id} className="nis-solution-card">
                  <div className="solution-icon-wrap">
                    <IconComp size={28} />
                  </div>
                  <h3 className="solution-title">{sol.title}</h3>
                  <p className="solution-desc">{sol.description}</p>
                  
                  <div className="solution-features">
                    {sol.features.map((item, i) => (
                      <span key={i} className="solution-tag">
                        <Check size={12} /> {item}
                      </span>
                    ))}
                  </div>

                  <Link to="/contact" className="solution-btn">
                    <span>Request Proposal</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 3. DEVELOPMENT LIFECYCLE / PROCESS */}
      <section className="page-body-section alt-bg">
        <div className="container">
          <div className="section-title-center">
            <div className="nis-section-badge">
              <Layers size={14} className="badge-sparkle" />
              <span>STRUCTURED DELIVERY</span>
            </div>
            <h2 className="nis-section-h2">
              Our 4-Step <span className="gradient-text">Delivery Framework</span>
            </h2>
            <p className="nis-section-sub">
              Every project delivered by Net Infotech System follows an enterprise-grade development and deployment lifecycle.
            </p>
          </div>

          <div className="nis-why-grid">
            {workflowSteps.map((step, idx) => (
              <div key={idx} className="nis-why-card">
                <div className="why-card-header">
                  <span className="why-stat-pill" style={{ background: '#E0F2FE', color: '#0369A1' }}>
                    Step {step.num}
                  </span>
                </div>
                <h3 className="why-title">{step.title}</h3>
                <p className="why-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="nis-cta-banner-section">
        <div className="container">
          <div className="nis-cta-banner-card">
            <div className="cta-left">
              <span className="cta-badge">CUSTOM ARCHITECTURE</span>
              <h2 className="cta-title">Need a Custom Software or E-Commerce Portal?</h2>
              <p className="cta-desc">
                Schedule a technical discovery session with our software architects at Webel Tower 1, Sector V, Kolkata.
              </p>
            </div>
            <div className="cta-right">
              <Link to="/contact" className="cta-btn-primary">
                <span>Request a Proposal</span>
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
