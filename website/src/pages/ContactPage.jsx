import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  Navigation,
  ExternalLink,
  Sparkles,
  Headphones,
  Server,
  Award,
  Shield,
  HelpCircle
} from 'lucide-react';
import { COMPANY_INFO } from '../data/mockData';
import AnimatedCounter from '../components/AnimatedCounter';
import './ContactPage.css';

const DEPARTMENT_DESKS = [
  {
    title: 'Enterprise Sales & Tally',
    desc: 'New implementations, Tally licensing & corporate cloud quotes',
    email: 'info@netinfotechsystem.com',
    phone: '+91 9330113000',
    icon: Award,
    badge: 'Sales & Quotes'
  },
  {
    title: 'Cloud NOC & 24/7 Hosting',
    desc: 'Tier-III cloud server monitoring, backups & Tally cloud support',
    email: 'support@netinfotechsystem.com',
    phone: '033 - 4001 3000',
    icon: Server,
    badge: '24/7 Support'
  },
  {
    title: 'IT Infrastructure & AMC Lab',
    desc: 'Hardware repair, firewall configs & corporate network AMC',
    email: 'nghosal@netinfotechsystem.com',
    phone: '+91 9330113000',
    icon: Shield,
    badge: 'Hardware AMC'
  },
  {
    title: 'Human Resources & Careers',
    desc: 'Job openings, campus recruitment & talent acquisitions',
    email: 'careers@netinfotechsystem.com',
    phone: '+91 9330113000',
    icon: Headphones,
    badge: 'HR & Careers'
  }
];

export default function ContactPage({ onShowToast }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    serviceRequired: 'Tally Prime',
    message: '',
    agree: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.message) {
      if (onShowToast) onShowToast('Please complete all required fields (*)');
      return;
    }
    if (!formData.agree) {
      if (onShowToast) onShowToast('Please agree to the privacy policy.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
      if (onShowToast) {
        onShowToast(`Thank you, ${formData.fullName}! Your enquiry has been received at our Webel Tower 1 headquarters. Our solutions engineer will contact you shortly.`);
      }
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        serviceRequired: 'Tally Prime',
        message: '',
        agree: true
      });
    }, 700);
  };

  const scrollToForm = () => {
    const el = document.getElementById('contact-direct-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="cp-enhanced-page">
      
      {/* ── 1. BREADCRUMB ─────────────────────────────────────────── */}
      <nav className="cp-breadcrumb-bar" aria-label="Breadcrumb">
        <div className="container cp-breadcrumbs">
          <Link to="/">Home</Link>
          <span className="cp-breadcrumb-sep">&gt;</span>
          <span className="cp-crumb-current">Contact Us</span>
        </div>
      </nav>

      {/* ── 2. HERO BANNER (MATCHING CAREERS & BUSINESS PAGES) ─────── */}
      <section className="cp-hero-banner">
        <div className="cp-hero-backdrop" />
        <div className="container cp-hero-container">
          
          <div className="cp-hero-content">
            <div className="cp-hero-badge">
              <Sparkles size={14} className="cp-hero-badge-sparkle" />
              <span>GET IN TOUCH • 25+ YEARS OF EXCELLENCE</span>
            </div>

            <h1 className="cp-hero-title">
              Let’s Connect &amp; Collaborate.<br />
              <span className="cp-title-gradient">Reach Out to Net Infotech System.</span>
            </h1>

            <p className="cp-hero-subtext">
              Visit our Kolkata corporate headquarters at Webel Tower 1, Sector-V, Salt Lake City,
              or reach out online. Our certified engineers and IT consultants are ready to assist with your next project.
            </p>

            <div className="cp-hero-actions">
              <button 
                type="button" 
                className="cp-btn-primary"
                onClick={scrollToForm}
              >
                <Send size={16} />
                <span>Send a Direct Message</span>
              </button>

              <a 
                href="tel:+919330113000" 
                className="cp-btn-secondary"
              >
                <Phone size={16} />
                <span>Call Hotline: +91 9330113000</span>
              </a>
            </div>
          </div>

          {/* Right Hero Stats Floating Card */}
          <div className="cp-hero-stats-card">
            <div className="cp-hero-stat-badge">
              <span className="cp-stat-val"><AnimatedCounter value="25+" duration={1800} /></span>
              <span className="cp-stat-label">Years Technology Legacy</span>
            </div>
            <div className="cp-hero-stat-badge">
              <span className="cp-stat-val"><AnimatedCounter value="500+" duration={2000} /></span>
              <span className="cp-stat-label">Satisfied Enterprise Clients</span>
            </div>
            <div className="cp-hero-stat-badge">
              <span className="cp-stat-val">&lt; 2 Hrs</span>
              <span className="cp-stat-label">Average Response Time SLA</span>
            </div>
            <div className="cp-hero-stat-badge">
              <span className="cp-stat-val">24/7</span>
              <span className="cp-stat-label">Emergency Cloud &amp; NOC Desk</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. HIGHLIGHT PILLARS BAR ──────────────────────────────── */}
      <section className="cp-pillars-bar">
        <div className="container cp-pillars-grid">
          <div className="cp-pillar-item">
            <div className="cp-pillar-icon" style={{ background: '#E0F2FE', color: '#0284C7' }}>
              <Building2 size={20} />
            </div>
            <div>
              <strong>Webel Tower 1 Headquarters</strong>
              <p>Salt Lake Sector-V IT Park, Kolkata corporate office.</p>
            </div>
          </div>

          <div className="cp-pillar-item">
            <div className="cp-pillar-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
              <Clock size={20} />
            </div>
            <div>
              <strong>Fast 2-Hour Response</strong>
              <p>Rapid technical evaluation &amp; expert callback.</p>
            </div>
          </div>

          <div className="cp-pillar-item">
            <div className="cp-pillar-icon" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <strong>Enterprise Confidentiality</strong>
              <p>Non-disclosure security on all project consultations.</p>
            </div>
          </div>

          <div className="cp-pillar-item">
            <div className="cp-pillar-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
              <Headphones size={20} />
            </div>
            <div>
              <strong>24/7 Cloud NOC Helpline</strong>
              <p>Continuous uptime monitoring &amp; emergency escalation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. MAIN CONTACT SECTION (INFO CARD & FORM) ────────────── */}
      <section className="cp-main-section" id="contact-direct-form">
        <div className="container cp-grid">

          {/* Left Column: Official Headquarters Card */}
          <div className="cp-info-col">
            <div className="cp-info-card">
              
              <div className="cp-card-header">
                <span className="cp-card-badge">CORPORATE HEADQUARTERS</span>
                <h2 className="cp-info-title">{COMPANY_INFO.name}</h2>
                <p className="cp-info-tagline">{COMPANY_INFO.tagline}</p>
              </div>

              {/* Contact Info Items */}
              <div className="cp-info-list">
                
                {/* Address */}
                <div className="cp-info-item">
                  <div className="cp-info-icon-circle cp-circle-blue">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span className="cp-info-label">Office Location</span>
                    <p className="cp-info-text">
                      <strong>Webel Tower 1, IT Park, BN Block</strong><br />
                      Sector-V, Salt Lake City<br />
                      Kolkata, West Bengal, India - 700091
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="cp-info-item">
                  <div className="cp-info-icon-circle cp-circle-orange">
                    <Phone size={20} />
                  </div>
                  <div>
                    <span className="cp-info-label">Direct Hotlines</span>
                    <p className="cp-info-text">
                      Mobile &amp; WhatsApp: <a href="tel:+919330113000"><strong>+91 9330113000</strong></a><br />
                      Landline PBX: <a href="tel:03340013000">033 - 4001 3000</a>
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="cp-info-item">
                  <div className="cp-info-icon-circle cp-circle-green">
                    <Mail size={20} />
                  </div>
                  <div>
                    <span className="cp-info-label">Official Emails</span>
                    <p className="cp-info-text">
                      Enquiries: <a href="mailto:info@netinfotechsystem.com"><strong>info@netinfotechsystem.com</strong></a><br />
                      Executive Desk: <a href="mailto:nghosal@netinfotechsystem.com">nghosal@netinfotechsystem.com</a>
                    </p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="cp-info-item">
                  <div className="cp-info-icon-circle cp-circle-purple">
                    <Clock size={20} />
                  </div>
                  <div>
                    <span className="cp-info-label">Operating Hours</span>
                    <p className="cp-info-text">
                      Monday – Saturday: <strong>10:00 AM – 7:00 PM</strong><br />
                      <span className="cp-sub-notice">Sunday: Closed (Emergency Cloud Server Hotline Active)</span>
                    </p>
                  </div>
                </div>

              </div>

              {/* Map & Directions Box */}
              <div className="cp-map-box">
                <div className="cp-map-content">
                  <div>
                    <h4>Webel Tower 1, Salt Lake Sector-V</h4>
                    <p>Prime IT hub, near Ring Road &amp; Salt Lake Central Station</p>
                  </div>
                  <a 
                    href="https://maps.google.com/?q=Webel+Tower+1+Sector+V+Salt+Lake+Kolkata" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="cp-map-link-btn"
                  >
                    <Navigation size={14} />
                    <span>Open in Google Maps</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Direct Message Form */}
          <div className="cp-form-col">
            <div className="cp-form-card">
              
              <div className="cp-card-header">
                <span className="cp-card-badge">DIRECT COMMUNICATION</span>
                <h3 className="cp-form-title">Send Us a Direct Message</h3>
                <p className="cp-form-sub">
                  Have a question about Tally, cloud hosting, firewalls, or hardware AMC?
                  Submit your enquiry below and our technical consulting team will respond swiftly.
                </p>
              </div>

              {formSubmitted ? (
                <div className="cp-success-view animate-fade-in">
                  <div className="cp-success-icon-box">
                    <CheckCircle2 size={50} />
                  </div>
                  <h3>Thank You for Contacting NISPL!</h3>
                  <p>
                    Your message has been received by our client solutions desk at Webel Tower 1.
                    A senior IT engineer will get in touch with you shortly.
                  </p>
                  <button 
                    type="button" 
                    className="cp-reset-btn"
                    onClick={() => setFormSubmitted(false)}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="cp-form">
                  
                  <div className="cp-form-row">
                    <div className="cp-field">
                      <label htmlFor="cp-name">Full Name *</label>
                      <input 
                        type="text" 
                        id="cp-name" 
                        name="fullName" 
                        placeholder="e.g. Debasish Roy"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>

                    <div className="cp-field">
                      <label htmlFor="cp-email">Email Address *</label>
                      <input 
                        type="email" 
                        id="cp-email" 
                        name="email" 
                        placeholder="roy@company.com" 
                        value={formData.email}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                  </div>

                  <div className="cp-form-row">
                    <div className="cp-field">
                      <label htmlFor="cp-phone">Phone / WhatsApp *</label>
                      <input 
                        type="tel" 
                        id="cp-phone" 
                        name="phone" 
                        placeholder="+91 93301 13000" 
                        value={formData.phone}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>

                    <div className="cp-field">
                      <label htmlFor="cp-company">Company / Organization</label>
                      <input 
                        type="text" 
                        id="cp-company" 
                        name="company" 
                        placeholder="e.g. Bengal Steel Pvt. Ltd." 
                        value={formData.company}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="cp-field">
                    <label htmlFor="cp-service">Service or Solution Needed *</label>
                    <select 
                      id="cp-service" 
                      name="serviceRequired"
                      value={formData.serviceRequired}
                      onChange={handleInputChange}
                    >
                      <option value="Tally Prime">1. Tally Prime (Licensing, GST Setup &amp; Customization)</option>
                      <option value="Tally on Cloud">2. Tally on Cloud (Anywhere Remote Access &amp; Backup)</option>
                      <option value="Data Center, Cloud Server & Hosting">3. Data Center, Cloud Server &amp; Hosting</option>
                      <option value="IT Infrastructure & Security">4. IT Infrastructure &amp; Security (Firewall, CCTV, AMC)</option>
                      <option value="IT Product Repair & Maintenance">5. IT Product Repair &amp; Maintenance</option>
                      <option value="IT Product Sales & Rental">6. IT Product Sales &amp; Hardware Rental</option>
                      <option value="Business Websites & Portals">Business Websites &amp; Web Portals</option>
                      <option value="Custom Software & ERP">Custom Software &amp; ERP Solutions</option>
                      <option value="General Consultation">General Technical Inquiry</option>
                    </select>
                  </div>

                  <div className="cp-field">
                    <label htmlFor="cp-message">Detailed Scope of Work / Message *</label>
                    <textarea 
                      id="cp-message" 
                      name="message" 
                      rows={4} 
                      placeholder="Please describe your requirements, number of users, branch locations, or specific IT issues..."
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <label className="cp-agree-checkbox">
                    <input 
                      type="checkbox" 
                      name="agree" 
                      checked={formData.agree} 
                      onChange={handleInputChange} 
                    />
                    <span>
                      I agree to the <Link to="/">Privacy Policy</Link> and allow Net Infotech System to contact me regarding this enquiry.
                    </span>
                  </label>

                  <div className="cp-submit-row">
                    <button 
                      type="submit" 
                      className="cp-submit-btn"
                      disabled={isSubmitting}
                    >
                      <Send size={16} />
                      <span>{isSubmitting ? 'Submitting Message...' : 'Send Message'}</span>
                    </button>

                    <p className="cp-privacy-text">
                      <ShieldCheck size={16} />
                      <span>Confidentiality guaranteed. Zero spam.</span>
                    </p>
                  </div>

                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ── 5. DEPARTMENTAL DESKS STRIP ───────────────────────────── */}
      <section className="cp-desks-section">
        <div className="container">
          <div className="cp-section-header">
            <span className="cp-card-badge">SPECIALIZED TEAMS</span>
            <h2>Direct Departmental Escalations</h2>
            <p>Connect straight to the relevant department head for targeted assistance.</p>
          </div>

          <div className="cp-desks-grid">
            {DEPARTMENT_DESKS.map((desk, idx) => {
              const DIcon = desk.icon;
              return (
                <div className="cp-desk-card" key={idx}>
                  <div className="cp-desk-card-top">
                    <div className="cp-desk-icon-box">
                      <DIcon size={20} />
                    </div>
                    <span className="cp-desk-badge">{desk.badge}</span>
                  </div>
                  <h3>{desk.title}</h3>
                  <p>{desk.desc}</p>
                  <div className="cp-desk-links">
                    <a href={`mailto:${desk.email}`} className="cp-desk-link">
                      <Mail size={13} />
                      <span>{desk.email}</span>
                    </a>
                    <a href={`tel:${desk.phone.replace(/[^+\d]/g, '')}`} className="cp-desk-link">
                      <Phone size={13} />
                      <span>{desk.phone}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. ALLIANCES STRIP ────────────────────────────────────── */}
      <section className="cp-alliances-strip">
        <div className="container cp-alliances-inner">
          <div className="cp-alliances-text">
            <span className="cp-alliances-tag">VERIFIED ECOSYSTEM</span>
            <h3>Authorized Technology Alliances</h3>
            <p>Certified tier-1 partnership with industry-defining tech platforms.</p>
          </div>
          
          <div className="cp-alliances-badges">
            <span className="alliance-pill">Tally Prime Certified</span>
            <span className="alliance-pill">Microsoft Partner</span>
            <span className="alliance-pill">AWS Cloud</span>
            <span className="alliance-pill">Sophos Gold Partner</span>
            <span className="alliance-pill">Dell Technologies</span>
            <span className="alliance-pill">Lenovo</span>
            <span className="alliance-pill">CtrlS Datacenter</span>
          </div>
        </div>
      </section>

    </div>
  );
}
