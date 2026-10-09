import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
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

  return (
    <div className="cbp-enhanced-page">

      {/* ── 2. TWO-COLUMN MAIN SECTION: FORM ON LEFT, ADVISORY ON RIGHT ── */}
      <section className="cbp-main-section" id="business-enquiry-form">
        <div className="container cbp-grid">
          
          {/* LEFT SIDE: BLUE & WHITE GRADIENT FORM (MATCHED TO REFERENCE) */}
          <div className="cbp-form-col">
            <div className="cbp-form-card">
              <div className="cbp-card-header">
                <h1 className="cbp-form-title">Get In Touch With Us</h1>
                <p className="cbp-form-sub">
                  Fill in your details below and our team will prepare a tailored proposal for your organization.
                </p>
              </div>

              {submitted ? (
                <div className="cbp-success-view animate-fade-in">
                  <div className="cbp-success-icon-box">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3>Thank You for Your Enquiry!</h3>
                  <p>
                    Your business requirements have been recorded. Our technical consulting
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
                      <label htmlFor="bus-name">Name:</label>
                      <input 
                        id="bus-name"
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={handleChange} 
                        placeholder="Enter your name" 
                        required 
                      />
                    </div>
                    <div className="cbp-field">
                      <label htmlFor="bus-email">Email:</label>
                      <input 
                        id="bus-email"
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="Enter your business email" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="cbp-form-row">
                    <div className="cbp-field">
                      <label htmlFor="bus-phone">Phone:</label>
                      <input 
                        id="bus-phone"
                        type="tel"
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        placeholder="Enter your phone or WhatsApp" 
                        required 
                      />
                    </div>
                    <div className="cbp-field">
                      <label htmlFor="bus-comp">Company:</label>
                      <input 
                        id="bus-comp"
                        name="company" 
                        value={formData.company} 
                        onChange={handleChange} 
                        placeholder="Enter company name" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="cbp-form-row">
                    <div className="cbp-field">
                      <label htmlFor="bus-ind">Industry Sector:</label>
                      <select id="bus-ind" name="industry" value={formData.industry} onChange={handleChange}>
                        {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <div className="cbp-field">
                      <label htmlFor="bus-req">Primary Solution Needed:</label>
                      <select id="bus-req" name="requirement" value={formData.requirement} onChange={handleChange}>
                        {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="cbp-field">
                    <label htmlFor="bus-details">Message:</label>
                    <textarea 
                      id="bus-details"
                      rows={4} 
                      name="details" 
                      value={formData.details} 
                      onChange={handleChange} 
                      placeholder="Describe your requirements, current setup, user count, or timeline..." 
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

                  <button type="submit" className="cbp-submit-btn" disabled={isSubmitting}>
                    <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
                  </button>

                </form>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: BUSINESS ADVISORY TEAM (JUST LIKE PREVIOUSLY) */}
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
