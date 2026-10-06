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
  ExternalLink
} from 'lucide-react';
import { COMPANY_INFO } from '../data/mockData';
import './Pages.css';
import '../components/MarketingSections.css';

export default function ContactPage({ onShowToast }) {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone) {
      if (onShowToast) onShowToast('Please complete all required fields (*)');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
      if (onShowToast) {
        onShowToast(`Thank you, ${formData.fullName}! Your enquiry has been routed to our Webel Tower 1 team. We will call you shortly.`);
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
    <div className="contact-page-view">
      
      {/* 1. PAGE HERO BANNER */}
      <div className="page-header-banner">
        <div className="page-header-ambient" />
        <div className="container page-header-content">
          <div className="page-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Contact Us</span>
          </div>
          <h1 className="page-header-title">Let's Talk About Your Project</h1>
          <p className="page-header-desc">
            Connect with Net Infotech System Pvt. Ltd. Visit our Kolkata headquarters at Webel Tower 1, Sector V, Salt Lake, or submit your project enquiry online.
          </p>
        </div>
      </div>

      {/* 2. CONTACT SECTION BODY */}
      <section className="page-body-section">
        <div className="container">
          
          <div className="nis-contact-grid">
            
            {/* Left Column: Official Contact Card */}
            <div className="nis-contact-info-col">
              <div className="nis-contact-info-card">
                <h2 className="info-card-company-name">{COMPANY_INFO.name}</h2>
                <p className="info-card-tagline">{COMPANY_INFO.tagline}</p>
                <div className="info-divider" />

                {/* Address */}
                <div className="info-block">
                  <div className="info-icon-circle">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span className="info-label">Corporate Headquarters</span>
                    <p className="info-text">
                      <b>Webel Tower 1, IT Park, BN Block</b><br />
                      Sector V, Salt Lake City<br />
                      Kolkata, West Bengal, India - 700091
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="info-block">
                  <div className="info-icon-circle">
                    <Phone size={20} />
                  </div>
                  <div>
                    <span className="info-label">Direct Phone & Hotline</span>
                    <p className="info-text">
                      Landline: <a href="tel:03340013000"><b>033 - 4001 3000</b></a><br />
                      Mobile / 24/7 Helpline: <a href="tel:+919330113000" className="phone-bold"><b>+91 9330113000</b></a>
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="info-block">
                  <div className="info-icon-circle">
                    <Mail size={20} />
                  </div>
                  <div>
                    <span className="info-label">Official Emails</span>
                    <p className="info-text">
                      Enquiries: <a href="mailto:info@netinfotechsystem.com"><b>info@netinfotechsystem.com</b></a><br />
                      Direct Desk: <a href="mailto:nghosal@netinfotechsystem.com">nghosal@netinfotechsystem.com</a>
                    </p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="info-block">
                  <div className="info-icon-circle">
                    <Clock size={20} />
                  </div>
                  <div>
                    <span className="info-label">Business Hours</span>
                    <p className="info-text">
                      Monday – Saturday: <b>10:00 AM – 7:00 PM</b><br />
                      <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Sunday: Closed (Emergency Cloud Hotline Active)</span>
                    </p>
                  </div>
                </div>

                {/* Location Map Representation */}
                <div className="contact-map-placeholder">
                  <div className="map-inner-content">
                    <h5>Webel Tower 1, Sector V</h5>
                    <p>BN Block, Salt Lake IT Park, Kolkata</p>
                    <a 
                      href="https://maps.google.com/?q=Webel+Tower+1+Sector+V+Kolkata" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="map-dir-link"
                    >
                      <Navigation size={14} />
                      <span>Get Directions on Google Maps</span>
                    </a>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="nis-contact-form-col">
              <div className="nis-contact-form-card">
                <div className="form-header">
                  <h3 className="form-title">Send Us a Direct Message</h3>
                  <p className="form-sub">Our technical consultants will review your requirement and get back to you within 2 business hours.</p>
                </div>

                {formSubmitted ? (
                  <div className="form-success-box animate-fade-in">
                    <CheckCircle2 size={52} className="success-icon" />
                    <h4>Thank You for Contacting NISPL!</h4>
                    <p>Your enquiry has been received. Our senior engineer will call or email you with the quotation and technical roadmap.</p>
                    <button 
                      type="button" 
                      className="form-reset-btn"
                      onClick={() => setFormSubmitted(false)}
                    >
                      Submit Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="nis-actual-form">
                    
                    <div className="form-row-2">
                      <div className="form-group">
                        <label htmlFor="fullName">Full Name *</label>
                        <input 
                          type="text" 
                          id="fullName" 
                          name="fullName" 
                          placeholder="e.g. Debasish Roy"
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
                          placeholder="e.g. roy@company.com" 
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
                          placeholder="e.g. +91 93301 13000" 
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
                          placeholder="e.g. Bengal Steel Pvt. Ltd." 
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
                        <option value="Tally Prime">1. Tally Prime (Licensing, GST & Accounting Setup)</option>
                        <option value="Tally on Cloud">2. Tally on Cloud (Anywhere Access & Hosting)</option>
                        <option value="Data Center, Cloud Server & Hosting">3. Data Center, Cloud Server & Hosting</option>
                        <option value="IT Infrastructure & Security">4. IT Infrastructure & Security (Firewall, CCTV, AMC)</option>
                        <option value="IT Product Repair & Maintenance">5. IT Product Repair & Maintenance</option>
                        <option value="IT Product Sales & Rental">6. IT Product Sales & Rental (Laptops/Servers)</option>
                        <option value="Business Websites">Business Websites Development</option>
                        <option value="E-Commerce Solutions">E-Commerce Solutions</option>
                        <option value="Custom Software">Custom Software / ERP</option>
                        <option value="General Inquiry">Other IT Consultation</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="message">Message / Scope of Work</label>
                      <textarea 
                        id="message" 
                        name="message" 
                        rows={5} 
                        placeholder="Please share details such as number of Tally users, server requirements, or repair issues..."
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
                        <span>Submitting Enquiry...</span>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Send Enquiry</span>
                        </>
                      )}
                    </button>

                    <p className="form-disclaimer">
                      🔒 Your details are stored securely. We respect your confidentiality.
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
