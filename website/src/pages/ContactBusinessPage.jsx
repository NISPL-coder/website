import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Briefcase,
  Building2,
  Clock,
  Server,
  Shield,
  Cloud,
  Award,
  ArrowRight,
  Star,
  Headphones,
  Check,
  HelpCircle
} from 'lucide-react';
import AnimatedCounter from '../components/AnimatedCounter';
import LinkedInQRCode from '../components/LinkedInQRCode';
import './ContactBusinessPage.css';

const INDUSTRIES = [
  'Manufacturing & Production',
  'Retail, Wholesale & Distribution',
  'Healthcare & Pharmaceuticals',
  'Banking, Financial Services & Insurance (BFSI)',
  'Education & University Campuses',
  'IT, Software & Tech Startups',
  'Construction & Real Estate',
  'Logistics & Supply Chain',
  'Other Corporate Sector'
];

const SERVICES = [
  'Tally Prime ERP Licensing & Implementation',
  'Tally on Cloud (Anywhere Multi-User Access)',
  'Data Center Hosting & Dedicated Cloud Servers',
  'IT Infrastructure Setup & Annual Maintenance (AMC)',
  'Next-Gen Firewall, UTM & Cybersecurity Solutions',
  'Enterprise Hardware Sales & Equipment Rental',
  'Custom Software Development & ERP Integration',
  'Microsoft 365 & Cloud Email Migration'
];

// Official Corporate Business Contacts for Net Infotech System
const CONTACTS = [
  {
    name: 'Business Solutions Desk',
    designation: 'Enterprise Client Engagements',
    email: 'business@netinfotechsystem.com',
    phone: '+91 9330113000',
    address: 'Salt Lake Sector-V, Kolkata - 700091, West Bengal',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=260&q=80',
    badge: 'Primary Inquiries'
  },
  {
    name: 'Tally & Cloud Advisory Team',
    designation: 'Tally Prime & Cloud Hosting Head',
    email: 'tally@netinfotechsystem.com',
    phone: '033 - 4001 3000',
    address: 'Salt Lake Sector-V, Kolkata - 700091, West Bengal',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=260&q=80',
    badge: 'Tally Certified'
  },
  {
    name: 'IT Infrastructure & AMC Support',
    designation: 'Hardware, Network & AMC Services',
    email: 'support@netinfotechsystem.com',
    phone: '+91 9330113000',
    address: 'Salt Lake Sector-V, Kolkata - 700091, West Bengal',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=260&q=80',
    badge: 'Hardware & AMC'
  }
];

const FAQS = [
  {
    q: 'How fast will an IT Consultant respond to our enquiry?',
    a: 'Our dedicated enterprise account managers respond within 2 to 4 business hours with an initial assessment or consultation schedule.'
  },
  {
    q: 'Can NISPL provide on-site technical deployment outside Kolkata?',
    a: 'Yes. We support Pan-India deployments for multi-branch corporate networks, remote Tally cloud hosting, and centralized datacenter infrastructure.'
  },
  {
    q: 'Do you offer custom Proof-of-Concept (PoC) or trial demos?',
    a: 'Yes, we provide live PoC demonstrations for Tally on Cloud, next-generation firewall testing, and cloud server workload migration.'
  }
];

export default function ContactBusinessPage({ onShowToast }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    industry: 'Manufacturing & Production',
    requirement: 'Tally Prime ERP Licensing & Implementation',
    details: '',
    agree: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.company || !formData.details) {
      if (onShowToast) onShowToast('Please complete all required fields (*)');
      return;
    }
    if (!formData.agree) {
      if (onShowToast) onShowToast('Please accept the Privacy Policy to proceed.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      if (onShowToast) {
        onShowToast(`Thank you, ${formData.fullName}! Your business enquiry has been assigned to our senior solutions architect.`);
      }
    }, 700);
  };

  const scrollToForm = () => {
    const el = document.getElementById('business-enquiry-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="cbp-enhanced-page">
      
      {/* ── 1. BREADCRUMB ─────────────────────────────────────────── */}
      <nav className="cbp-breadcrumb-bar" aria-label="Breadcrumb">
        <div className="container cbp-breadcrumbs">
          <Link to="/">Home</Link>
          <span className="cbp-breadcrumb-sep">&gt;</span>
          <Link to="/contact">Contact</Link>
          <span className="cbp-breadcrumb-sep">&gt;</span>
          <span className="cbp-crumb-current">Business Solutions</span>
        </div>
      </nav>

      {/* ── 2. HERO BANNER (MATCHING CAREERS PAGE BANNER STRUCTURE) ── */}
      <section className="cbp-hero-banner">
        <div className="cbp-hero-backdrop" />
        <div className="container cbp-hero-container">
          
          <div className="cbp-hero-content">
            <div className="cbp-hero-badge">
              <Sparkles size={14} className="cbp-hero-badge-sparkle" />
              <span>ENTERPRISE IT SOLUTIONS • 25+ YEARS OF EXCELLENCE</span>
            </div>

            <h1 className="cbp-hero-title">
              Power Your Enterprise.<br />
              <span className="cbp-title-gradient">Partner With Net Infotech System.</span>
            </h1>

            <p className="cbp-hero-subtext">
              Accelerate your digital transformation with Tier-III Datacenter Cloud Hosting,
              Certified Tally Prime ERP Deployments, Next-Gen Cybersecurity SOC, and End-to-End Corporate IT AMC.
            </p>

            <div className="cbp-hero-actions">
              <button 
                type="button" 
                className="cbp-btn-primary"
                onClick={scrollToForm}
              >
                <Send size={16} />
                <span>Request Custom Business Proposal</span>
              </button>

              <a 
                href="tel:+919330113000" 
                className="cbp-btn-secondary"
              >
                <Phone size={16} />
                <span>Call Hotline: +91 9330113000</span>
              </a>
            </div>
          </div>

          {/* Right Hero Stats Floating Card */}
          <div className="cbp-hero-stats-card">
            <div className="cbp-hero-stat-badge">
              <span className="cbp-stat-val"><AnimatedCounter value="500+" duration={2000} /></span>
              <span className="cbp-stat-label">Enterprise Clients Served</span>
            </div>
            <div className="cbp-hero-stat-badge">
              <span className="cbp-stat-val"><AnimatedCounter value="99.9%" duration={2000} decimals={1} /></span>
              <span className="cbp-stat-label">Cloud & Uptime SLA Guarantee</span>
            </div>
            <div className="cbp-hero-stat-badge">
              <span className="cbp-stat-val"><AnimatedCounter value="25+" duration={1800} /></span>
              <span className="cbp-stat-label">Years of Technology Leadership</span>
            </div>
            <div className="cbp-hero-stat-badge">
              <span className="cbp-stat-val"><AnimatedCounter value="4.8★" duration={1800} decimals={1} /></span>
              <span className="cbp-stat-label">Client Satisfaction Rating</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. HIGHLIGHT PILLARS BAR ──────────────────────────────── */}
      <section className="cbp-pillars-bar">
        <div className="container cbp-pillars-grid">
          <div className="cbp-pillar-item">
            <div className="cbp-pillar-icon" style={{ background: '#E0F2FE', color: '#0284C7' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <strong>ISO & SOC Certified</strong>
              <p>Enterprise data security with 24/7 dedicated monitoring.</p>
            </div>
          </div>

          <div className="cbp-pillar-item">
            <div className="cbp-pillar-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
              <Award size={20} />
            </div>
            <div>
              <strong>3-Star Certified Tally Partner</strong>
              <p>Official sales, customization plugins & multi-branch sync.</p>
            </div>
          </div>

          <div className="cbp-pillar-item">
            <div className="cbp-pillar-icon" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
              <Server size={20} />
            </div>
            <div>
              <strong>Tier-III Cloud Datacenter</strong>
              <p>High-speed AWS, Azure & domestic Indian cloud hosting.</p>
            </div>
          </div>

          <div className="cbp-pillar-item">
            <div className="cbp-pillar-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
              <Headphones size={20} />
            </div>
            <div>
              <strong>Dedicated Account Manager</strong>
              <p>Fast SLA response with single-point escalation desk.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. MAIN ENQUIRY & CONTACT SECTION ─────────────────────── */}
      <section className="cbp-main-section" id="business-enquiry-form">
        <div className="container cbp-grid">

          {/* LEFT — ENQUIRY FORM */}
          <div className="cbp-form-col">
            <div className="cbp-form-card">
              
              <div className="cbp-card-header">
                <span className="cbp-card-badge">ENTERPRISE CONSULTING</span>
                <h2 className="cbp-form-title">Let’s Discuss Your Business Requirements</h2>
                <p className="cbp-form-sub">
                  Fill in your details below and our senior solution architect will prepare a tailored proposal
                  and consultation schedule for your organization.
                </p>
              </div>

              {submitted ? (
                <div className="cbp-success-view animate-fade-in">
                  <div className="cbp-success-icon-box">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3>Thank You for Your Enquiry!</h3>
                  <p>
                    Your business requirements have been recorded under reference. Our technical consulting
                    team will reach out to <strong>{formData.email}</strong> / <strong>{formData.phone}</strong> within 2-4 business hours.
                  </p>
                  <button 
                    type="button" 
                    className="cbp-reset-btn" 
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        fullName: '',
                        email: '',
                        phone: '',
                        company: '',
                        industry: 'Manufacturing & Production',
                        requirement: 'Tally Prime ERP Licensing & Implementation',
                        details: '',
                        agree: true,
                      });
                    }}
                  >
                    Send Another Requirement
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="cbp-form">
                  
                  <div className="cbp-form-row">
                    <div className="cbp-field">
                      <label htmlFor="bus-name">Full Name *</label>
                      <input 
                        id="bus-name"
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={handleChange} 
                        placeholder="e.g. Anirban Ghosh" 
                        required 
                      />
                    </div>
                    <div className="cbp-field">
                      <label htmlFor="bus-email">Official Business Email *</label>
                      <input 
                        id="bus-email"
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="anirban@company.com" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="cbp-form-row">
                    <div className="cbp-field">
                      <label htmlFor="bus-phone">Phone / WhatsApp Number *</label>
                      <input 
                        id="bus-phone"
                        type="tel"
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        placeholder="+91 98300 12345" 
                        required 
                      />
                    </div>
                    <div className="cbp-field">
                      <label htmlFor="bus-comp">Company / Organization *</label>
                      <input 
                        id="bus-comp"
                        name="company" 
                        value={formData.company} 
                        onChange={handleChange} 
                        placeholder="e.g. Apex Industrial Pvt. Ltd." 
                        required 
                      />
                    </div>
                  </div>

                  <div className="cbp-form-row">
                    <div className="cbp-field">
                      <label htmlFor="bus-ind">Industry Sector *</label>
                      <select id="bus-ind" name="industry" value={formData.industry} onChange={handleChange}>
                        {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <div className="cbp-field">
                      <label htmlFor="bus-req">Primary Solution Needed *</label>
                      <select id="bus-req" name="requirement" value={formData.requirement} onChange={handleChange}>
                        {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="cbp-field">
                    <label htmlFor="bus-details">Detailed Business Scope &amp; Specifications *</label>
                    <textarea 
                      id="bus-details"
                      rows={4} 
                      name="details" 
                      value={formData.details} 
                      onChange={handleChange} 
                      placeholder="Please specify expected user count, current setup, timeline, branch locations, or specific customization challenges..." 
                      required 
                    />
                  </div>

                  <label className="cbp-agree-checkbox">
                    <input 
                      type="checkbox" 
                      name="agree" 
                      checked={formData.agree} 
                      onChange={handleChange} 
                    />
                    <span>
                      I agree to the <Link to="/">Privacy Policy</Link> and authorize Net Infotech System to contact me regarding this proposal.
                    </span>
                  </label>

                  <div className="cbp-submit-row">
                    <button type="submit" className="cbp-submit-btn" disabled={isSubmitting}>
                      <Send size={16} />
                      <span>{isSubmitting ? 'Submitting Requirement...' : 'Submit Business Enquiry'}</span>
                    </button>
                    <p className="cbp-privacy-text">
                      <ShieldCheck size={16} />
                      <span>Enterprise NDA-grade data confidentiality. Zero spam.</span>
                    </p>
                  </div>

                </form>
              )}
            </div>
          </div>

          {/* RIGHT — CONTACT CARDS & ADVISORY DESK */}
          <div className="cbp-contacts-col">
            <div className="cbp-contacts-header">
              <span className="cbp-card-badge">DIRECT ASSISTANCE</span>
              <h2 className="cbp-contacts-title">Our Business Advisory Team</h2>
              <p className="cbp-contacts-sub">
                Connect directly with our specialized department heads for instant quotes, technical consultations, or RFP tendering.
              </p>
            </div>

            <div className="cbp-contacts-list">
              {CONTACTS.map((c, idx) => (
                <div className="cbp-contact-card-rich" key={idx}>
                  <img src={c.image} alt={c.name} className="cbp-contact-img" />
                  <div className="cbp-contact-info">
                    <div className="cbp-contact-badge">{c.badge}</div>
                    <strong className="cbp-contact-name">{c.name}</strong>
                    <span className="cbp-contact-role">{c.designation}</span>
                    
                    <div className="cbp-contact-line">
                      <Mail size={14} />
                      <a href={`mailto:${c.email}`}>{c.email}</a>
                    </div>
                    
                    <div className="cbp-contact-line">
                      <Phone size={14} />
                      <a href={`tel:${c.phone.replace(/[^+\d]/g, '')}`}>{c.phone}</a>
                    </div>
                    
                    <div className="cbp-contact-line">
                      <MapPin size={14} />
                      <span>{c.address}</span>
                    </div>
                  </div>

                  {/* LinkedIn QR Code */}
                  <LinkedInQRCode url={c.linkedinUrl || 'https://www.linkedin.com/company/net-infotech-system/'} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
