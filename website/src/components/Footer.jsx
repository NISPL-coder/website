import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock 
} from 'lucide-react';
import { COMPANY_INFO } from '../data/mockData';
import logoImg from '../assets/NISPL Cloud Tech Logo (2).png';
import './Footer.css';

export default function Footer() {
  return (
    <footer id="footer-section" className="nis-official-footer">
      {/* Background Ambience Layers */}
      <div className="footer-bg-glow-orb footer-bg-glow-center" aria-hidden="true" />
      <div className="footer-bg-glow-orb footer-bg-glow-right" aria-hidden="true" />
      <div className="footer-bg-grid-mesh" aria-hidden="true" />
      <div className="footer-top-accent-line" aria-hidden="true" />

      <div className="container footer-content-container">
        
        {/* Main Compact Footer Grid */}
        <div className="footer-main-grid">
          
          {/* Brand Info Column */}
          <div className="footer-brand-col">
            <div className="footer-logo-block">
              <Link to="/">
                <img 
                  src={logoImg} 
                  alt="Net Infotech System Pvt. Ltd." 
                  className="footer-official-logo"
                  width="220"
                  height="74"
                  loading="lazy"
                  decoding="async"
                />
              </Link>
            </div>

            <p className="footer-desc">
              Net Infotech System Pvt. Ltd. provides reliable software solutions, cloud services and IT support to empower modern businesses.
            </p>

            <div className="footer-partner-badges">
              <span className="badge-item star-partner">
                ⭐ Tally 3-Star Certified Partner
              </span>
            </div>

            {/* Social Media Links */}
            <div className="footer-socials-row">
              <a href="#linkedin" className="social-icon-btn" aria-label="LinkedIn" title="LinkedIn">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
              </a>
              <a href="#twitter" className="social-icon-btn" aria-label="Twitter / X" title="Twitter / X">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#facebook" className="social-icon-btn" aria-label="Facebook" title="Facebook">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 1: Products & Services */}
          <div className="footer-nav-col">
            <h3 className="footer-col-title">Products & Services</h3>
            <div className="footer-wip-box">
              <span className="footer-wip-text">Work in progress...</span>
              <span className="footer-wip-sub">Please check back soon.</span>
            </div>
          </div>

          {/* Column 2: Our Solutions */}
          <div className="footer-nav-col">
            <h3 className="footer-col-title">Our Solutions</h3>
            <div className="footer-wip-box">
              <span className="footer-wip-text">Work in progress...</span>
              <span className="footer-wip-sub">Please check back soon.</span>
            </div>
          </div>

          {/* Column 3: Contact & Headquarters */}
          <div className="footer-contact-col">
            <h3 className="footer-col-title">Kolkata Office</h3>
            
            <div className="contact-item">
              <MapPin size={15} className="contact-icon" />
              <div>
                <span className="contact-label">Registered Office:</span>
                <p className="contact-val">
                  {COMPANY_INFO.address} - {COMPANY_INFO.pinCode}
                </p>
              </div>
            </div>

            <div className="contact-item">
              <Phone size={15} className="contact-icon" />
              <div>
                <span className="contact-label">Landline & Mobile:</span>
                <div className="contact-inline-links">
                  <a href="tel:03340041899" className="contact-val">
                    {COMPANY_INFO.landline}
                  </a>
                  <span className="sep">•</span>
                  <a href="tel:+919330113000" className="contact-val font-bold highlight-phone">
                    {COMPANY_INFO.phone}
                  </a>
                </div>
              </div>
            </div>

            <div className="contact-item">
              <Mail size={15} className="contact-icon" />
              <div>
                <span className="contact-label">Email:</span>
                <div className="contact-inline-links">
                  <a href={`mailto:${COMPANY_INFO.email}`} className="contact-val">
                    {COMPANY_INFO.email}
                  </a>
                  <span className="sep">•</span>
                  <a href={`mailto:${COMPANY_INFO.directEmail}`} className="contact-val highlight-phone">
                    {COMPANY_INFO.directEmail}
                  </a>
                </div>
              </div>
            </div>

            <div className="contact-item">
              <Clock size={15} className="contact-icon" />
              <div>
                <span className="contact-label">Business Hours:</span>
                <span className="contact-val">{COMPANY_INFO.businessHours}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Legal Strip */}
        <div className="footer-bottom-strip">
          <p className="copyright-text">
            © {new Date().getFullYear()} <b>Net Infotech System Pvt. Ltd.</b> All rights reserved.
          </p>
          <p className="footer-copyright-highlight">
            25+ Years of Excellence.
          </p>
          <div className="legal-links">
            <Link to="/">Home</Link>
            <span className="dot-sep">•</span>
            <Link to="/about">About Us</Link>
            <span className="dot-sep">•</span>
            <Link to="/services">Services</Link>
            <span className="dot-sep">•</span>
            <Link to="/solutions">Solutions</Link>
            <span className="dot-sep">•</span>
            <Link to="/career">Careers</Link>
            <span className="dot-sep">•</span>
            <Link to="/contact">Contact</Link>
            <span className="dot-sep">•</span>
            <button 
              type="button" 
              className="footer-cookie-link"
              onClick={() => window.dispatchEvent(new Event('open-cookie-settings'))}
            >
              Cookie Settings
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
