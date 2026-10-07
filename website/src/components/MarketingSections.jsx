import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Clock, 
  Users, 
  Headphones, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  Server, 
  Cloud, 
  Calculator, 
  Wrench, 
  Laptop, 
  Globe, 
  ShoppingBag, 
  Code2, 
  Zap, 
  Send, 
  Check, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  Lock
} from 'lucide-react';
import { 
  COMPANY_INFO, 
  CORE_SERVICES, 
  OUR_SOLUTIONS, 
  WHY_CHOOSE_US, 
  PORTFOLIO_CASES 
} from '../data/mockData';
import './MarketingSections.css';

const SERVICE_ICON_MAP = {
  Calculator: Calculator,
  Cloud: Cloud,
  Server: Server,
  ShieldCheck: ShieldCheck,
  Wrench: Wrench,
  Laptop: Laptop,
};

const SOLUTION_ICON_MAP = {
  Globe: Globe,
  ShoppingBag: ShoppingBag,
  Code2: Code2,
  Zap: Zap,
};

const WHY_ICON_MAP = {
  Users: Users,
  Award: Award,
  Clock: Clock,
  Headphones: Headphones,
};

export default function MarketingSections({ onOpenDemo, onShowToast }) {
  // Contact Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    serviceRequired: 'Tally Prime',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Active category filter for services or portfolio
  const [selectedServiceTab, setSelectedServiceTab] = useState('all');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone) {
      if (onShowToast) onShowToast('Please fill in your name, email, and phone number.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
      if (onShowToast) {
        onShowToast(`Thank you, ${formData.fullName}! Your enquiry for ${formData.serviceRequired} has been received. Our team will contact you shortly.`);
      }
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        serviceRequired: 'Tally Prime',
        message: ''
      });
    }, 900);
  };

  return (
    <div className="nis-marketing-wrapper">

      {/* ===================================================
          1. ABOUT US SECTION
          =================================================== */}
      <section id="about-section" className="nis-section nis-about-section">
        <div className="container">
          <div className="nis-about-grid">
            
            {/* Left Content */}
            <div className="nis-about-content">
              <div className="nis-section-badge">
                <Award size={14} className="badge-sparkle" />
                <span>25+ YEARS OF TRUSTED LEADERSHIP</span>
              </div>
              <h2 className="nis-section-h2">
                About <span className="gradient-text">Net Infotech System</span>
              </h2>
              <p className="nis-about-lead">
                Headquartered at <b>Webel Tower 1, IT Park, Salt Lake Sector V, Kolkata</b>, Net Infotech System Pvt. Ltd. (NISPL) has been a trusted pioneer in IT infrastructure, business software, and enterprise cloud solutions since 1999.
              </p>
              <p className="nis-about-body">
                As an accredited <b>Tally 3-Star Certified Partner</b>, we deliver end-to-end digital transformation for more than 1,000 corporate clients across West Bengal and nationwide. We specialize in TallyPrime deployment, Tally on Cloud, robust data center hosting, managed IT security, hardware procurement, and enterprise support.
              </p>

              {/* Key Highlights Grid */}
              <div className="nis-about-highlights-grid">
                <div className="nis-about-highlight-card">
                  <span className="highlight-num">25+</span>
                  <span className="highlight-lbl">Years of Excellence</span>
                </div>
                <div className="nis-about-highlight-card">
                  <span className="highlight-num">1000+</span>
                  <span className="highlight-lbl">Active Corporate Clients</span>
                </div>
                <div className="nis-about-highlight-card">
                  <span className="highlight-num">99.9%</span>
                  <span className="highlight-lbl">Uptime Guarantee</span>
                </div>
                <div className="nis-about-highlight-card">
                  <span className="highlight-num">50+</span>
                  <span className="highlight-lbl">Certified Engineers</span>
                </div>
              </div>

              <div className="nis-about-actions">
                <button 
                  type="button" 
                  className="nis-primary-btn"
                  onClick={() => {
                    const el = document.getElementById('services-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>Explore Our Services</span>
                  <ArrowRight size={16} />
                </button>
                <button 
                  type="button" 
                  className="nis-secondary-btn"
                  onClick={() => {
                    const el = document.getElementById('contact-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>Contact Our Team</span>
                </button>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="nis-about-visual">
              <div className="nis-about-card-frame">
                <div className="nis-about-card-badge">
                  <ShieldCheck size={18} />
                  <span>ISO 27001 Certified & Tally 3-Star Partner</span>
                </div>

                <div className="nis-about-feature-box">
                  <div className="feature-icon-circle blue">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h4>Webel Tower 1 Headquarters</h4>
                    <p>Strategic IT Park presence in Sector V, Kolkata with high-speed fiber backbone and 24/7 technical team.</p>
                  </div>
                </div>

                <div className="nis-about-feature-box">
                  <div className="feature-icon-circle purple">
                    <Cloud size={24} />
                  </div>
                  <div>
                    <h4>Next-Gen Data Center & Cloud</h4>
                    <p>Redundant Tier-4 cloud infrastructure, AWS & Azure multi-cloud hybrid architecture.</p>
                  </div>
                </div>

                <div className="nis-about-feature-box">
                  <div className="feature-icon-circle orange">
                    <Cpu size={24} />
                  </div>
                  <div>
                    <h4>Complete Hardware & IT Lifecycle</h4>
                    <p>Component-level repairs, sales, structured networking, and flexible short/long-term hardware rentals.</p>
                  </div>
                </div>

                <div className="nis-about-quote-strip">
                  <p>"Technology made reliable, transparent, and profitable for Indian businesses."</p>
                  <span>— Leadership Team, Net Infotech System Pvt. Ltd.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===================================================
          2. PRODUCTS & SERVICES SECTION (6 Core Items)
          =================================================== */}
      <section id="services-section" className="nis-section nis-services-section">
        <div className="container">
          
          <div className="section-title-center">
            <div className="nis-section-badge">
              <Sparkles size={14} className="badge-sparkle" />
              <span>CORE PRODUCTS & SERVICES</span>
            </div>
            <h2 className="nis-section-h2">
              Comprehensive IT & <span className="gradient-text">Software Solutions</span>
            </h2>
            <p className="nis-section-sub">
              Empowering enterprise operations with licensed Tally solutions, cloud servers, managed cybersecurity, hardware maintenance, and IT equipment rentals.
            </p>
          </div>

          {/* 6 Services Grid */}
          <div className="nis-services-grid">
            {CORE_SERVICES.map((srv) => {
              const IconComp = SERVICE_ICON_MAP[srv.icon] || Server;
              return (
                <div key={srv.id} className="nis-service-card">
                  {/* Top Bar with Number & Badge */}
                  <div className="nis-service-card-top">
                    <div 
                      className="nis-service-icon-box"
                      style={{ background: srv.gradient }}
                    >
                      <IconComp size={24} color="#FFFFFF" />
                    </div>
                    <div className="nis-service-num-badge">
                      <span className="nis-service-badge-pill">{srv.badge}</span>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="nis-service-title">{srv.title}</h3>
                  <p className="nis-service-tagline">{srv.tagline}</p>

                  {/* Description */}
                  <p className="nis-service-desc">{srv.description}</p>

                  {/* Features Checklist */}
                  <ul className="nis-service-feature-list">
                    {srv.features.map((feat, fIdx) => (
                      <li key={fIdx} className="nis-service-feature-item">
                        <CheckCircle2 size={16} className="feat-check" style={{ color: srv.color }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Card Bottom CTA */}
                  <div className="nis-service-card-footer">
                    <button 
                      type="button" 
                      className="nis-service-action-btn"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, serviceRequired: srv.title }));
                        const el = document.getElementById('contact-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <span>Enquire Now</span>
                      <ArrowRight size={15} />
                    </button>
                    {srv.id === 'tally-prime' && (
                      <button 
                        type="button" 
                        className="nis-service-demo-link"
                        onClick={() => {
                          const el = document.getElementById('accounting-module');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        Try Live Demo ↗
                      </button>
                    )}
                  </div>

                  {/* Accent Border on Hover */}
                  <div className="nis-card-border-glow" style={{ borderColor: srv.color }} />
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ===================================================
          3. OUR SOLUTIONS SECTION (4 Solutions from prompt)
          =================================================== */}
      <section id="solutions-section" className="nis-section nis-solutions-section">
        <div className="container">
          
          <div className="section-title-center">
            <div className="nis-section-badge">
              <Globe size={14} className="badge-sparkle" />
              <span>CUSTOM BUSINESS SOLUTIONS</span>
            </div>
            <h2 className="nis-section-h2">
              Tailored Solutions For <span className="gradient-text">Modern Businesses</span>
            </h2>
            <p className="nis-section-sub">
              From responsive business websites and e-Commerce stores to custom software architecture and end-to-end digital transformation.
            </p>
          </div>

          <div className="nis-solutions-grid">
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

                  <button 
                    type="button" 
                    className="solution-btn"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, serviceRequired: sol.title }));
                      const el = document.getElementById('contact-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <span>Request Proposal</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ===================================================
          4. WHY CHOOSE US SECTION (4 Pillars from prompt)
          =================================================== */}
      <section id="why-us-section" className="nis-section nis-why-section">
        <div className="container">
          
          <div className="section-title-center">
            <div className="nis-section-badge">
              <Award size={14} className="badge-sparkle" />
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
            {WHY_CHOOSE_US.map((why) => {
              const IconComp = WHY_ICON_MAP[why.icon] || Award;
              return (
                <div key={why.id} className="nis-why-card">
                  <div className="why-card-header">
                    <div className="why-icon-box">
                      <IconComp size={24} />
                    </div>
                    <span className="why-stat-pill">{why.stat}</span>
                  </div>
                  <h3 className="why-title">{why.title}</h3>
                  <p className="why-desc">{why.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ===================================================
          5. PORTFOLIO & SUCCESS STORIES SECTION
          =================================================== */}
      <section id="portfolio-section" className="nis-section nis-portfolio-section">
        <div className="container">
          
          <div className="section-title-center">
            <div className="nis-section-badge">
              <TrendingUp size={14} className="badge-sparkle" />
              <span>PROVEN CLIENT RESULTS</span>
            </div>
            <h2 className="nis-section-h2">
              Our <span className="gradient-text">Portfolio & Case Studies</span>
            </h2>
            <p className="nis-section-sub">
              Explore how we have empowered companies across India to streamline operations, reduce IT overhead, and scale securely.
            </p>
          </div>

          <div className="nis-portfolio-grid">
            {PORTFOLIO_CASES.map((item) => (
              <div key={item.id} className="nis-portfolio-card">
                <div className="portfolio-top-bar">
                  <span className="portfolio-industry">{item.industry}</span>
                  <span className="portfolio-metric-badge">{item.metric}</span>
                </div>
                <h4 className="portfolio-client">{item.client}</h4>
                <span className="portfolio-category">{item.category}</span>
                <p className="portfolio-result">{item.result}</p>
                <div className="portfolio-footer">
                  <span className="verified-tag">✓ Fully Deployed & Managed</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ===================================================
          6. HIGH-IMPACT CALL TO ACTION BANNER
          =================================================== */}
      <section className="nis-cta-banner-section">
        <div className="container">
          <div className="nis-cta-banner-card">
            <div className="cta-left">
              <span className="cta-badge">⚡ INSTANT CONSULTATION AVAILABLE</span>
              <h2 className="cta-title">Ready to Elevate Your IT & Cloud Systems?</h2>
              <p className="cta-desc">
                Partner with Net Infotech System Pvt. Ltd. Get certified TallyPrime deployment, enterprise cloud servers, and comprehensive IT support backed by 25+ years of excellence.
              </p>
            </div>
            <div className="cta-right">
              <button 
                type="button" 
                className="cta-btn-primary"
                onClick={() => {
                  const el = document.getElementById('contact-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
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

      {/* ===================================================
          7. CONTACT SECTION (Exact User Specification)
          =================================================== */}
      <section id="contact-section" className="nis-section nis-contact-section">
        <div className="container">
          
          <div className="section-title-center">
            <div className="nis-section-badge">
              <Mail size={14} className="badge-sparkle" />
              <span>GET IN TOUCH</span>
            </div>
            <h2 className="nis-section-h2">
              Let's Talk About <span className="gradient-text">Your Project</span>
            </h2>
            <p className="nis-section-sub">
              Have questions regarding TallyPrime, Cloud Hosting, IT Infrastructure, or Equipment Rentals? Our Kolkata headquarters team is ready to assist you.
            </p>
          </div>

          <div className="nis-contact-grid">
            
            {/* Left: Official Company Info & Office Details */}
            <div className="nis-contact-info-col">
              <div className="nis-contact-info-card">
                <h3 className="info-card-company-name">{COMPANY_INFO.name}</h3>
                <p className="info-card-tagline">{COMPANY_INFO.tagline}</p>
                <div className="info-divider" />

                {/* Address */}
                <div className="info-block">
                  <div className="info-icon-circle">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span className="info-label">Office Address</span>
                    <p className="info-text">
                      Webel Tower 1, IT Park, BN Block<br />
                      Sector V, Salt Lake City<br />
                      Kolkata, West Bengal, India - 700091
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="info-block">
                  <div className="info-icon-circle">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="info-label">Phone & Hotline</span>
                    <p className="info-text">
                      <a href="tel:03340013000">033 - 4001 3000</a><br />
                      <a href="tel:+919330113000" className="phone-bold">+91 9330113000</a>
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="info-block">
                  <div className="info-icon-circle">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="info-label">Email Enquiries</span>
                    <p className="info-text">
                      <a href="mailto:info@netinfotechsystem.com">info@netinfotechsystem.com</a><br />
                      <a href="mailto:nghosal@netinfotechsystem.com">nghosal@netinfotechsystem.com</a>
                    </p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="info-block">
                  <div className="info-icon-circle">
                    <Clock size={18} />
                  </div>
                  <div>
                    <span className="info-label">Business Hours</span>
                    <p className="info-text">
                      Monday – Saturday<br />
                      10:00 AM – 7:00 PM
                    </p>
                  </div>
                </div>

                {/* Trust Badges in Card */}
                <div className="contact-card-trust-row">
                  <span className="trust-pill">⭐ Tally 3-Star Certified</span>
                  <span className="trust-pill">🔒 ISO 27001</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Contact & Enquiry Form */}
            <div className="nis-contact-form-col">
              <div className="nis-contact-form-card">
                <div className="form-header">
                  <h3 className="form-title">Send Us a Direct Enquiry</h3>
                  <p className="form-sub">Fill in your requirements below for an instant response and quotation.</p>
                </div>

                {formSubmitted ? (
                  <div className="form-success-box animate-fade-in">
                    <CheckCircle2 size={48} className="success-icon" />
                    <h4>Enquiry Submitted Successfully!</h4>
                    <p>Thank you for reaching out. A senior IT consultant from Net Infotech System will call or email you within 2 business hours.</p>
                    <button 
                      type="button" 
                      className="form-reset-btn"
                      onClick={() => setFormSubmitted(false)}
                    >
                      Send Another Enquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="nis-actual-form">
                    
                    <div className="form-row-2">
                      <div className="form-group">
                        <label htmlFor="fullName">Full Name *</label>
                        <input 
                          type="text" 
                          id="fullName" 
                          name="fullName" 
                          placeholder="e.g. Rahul Sen" 
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="email">Email Address *</label>
                        <input 
                          type="email" 
                          id="email" 
                          name="email" 
                          placeholder="e.g. rahul@company.com" 
                          value={formData.email}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label htmlFor="phone">Phone Number *</label>
                        <input 
                          type="tel" 
                          id="phone" 
                          name="phone" 
                          placeholder="e.g. +91 98765 43210" 
                          value={formData.phone}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="company">Company Name</label>
                        <input 
                          type="text" 
                          id="company" 
                          name="company" 
                          placeholder="e.g. Bengal Traders Pvt. Ltd." 
                          value={formData.company}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="serviceRequired">Service Required *</label>
                      <select 
                        id="serviceRequired" 
                        name="serviceRequired" 
                        value={formData.serviceRequired}
                        onChange={handleInputChange}
                      >
                        <option value="Tally Prime">1. Tally Prime (Licensing, GST & Setup)</option>
                        <option value="Tally on Cloud">2. Tally on Cloud (Remote Access & Hosting)</option>
                        <option value="Data Center, Cloud Server & Hosting">3. Data Center, Cloud Server & Hosting</option>
                        <option value="IT Infrastructure & Security">4. IT Infrastructure & Security (Firewall, CCTV, AMC)</option>
                        <option value="IT Product Repair & Maintenance">5. IT Product Repair & Maintenance</option>
                        <option value="IT Product Sales & Rental">6. IT Product Sales & Rental (Laptops/Servers)</option>
                        <option value="Business Websites">Business Websites Development</option>
                        <option value="E-Commerce Solutions">E-Commerce Solutions</option>
                        <option value="Custom Software">Custom Software / ERP</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="message">Message / Project Details</label>
                      <textarea 
                        id="message" 
                        name="message" 
                        rows={4} 
                        placeholder="Tell us about your requirements, existing setup, or questions..."
                        value={formData.message}
                        onChange={handleInputChange}
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="form-submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span>Sending Enquiry...</span>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Send Enquiry</span>
                        </>
                      )}
                    </button>

                    <p className="form-disclaimer">
                      🔒 Your details are secure. We respect your privacy and will never share your information.
                    </p>
                  </form>
                )}
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
