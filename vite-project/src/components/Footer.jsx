import React from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Share2,
  ExternalLink
} from 'lucide-react';
import { COMPANY_INFO } from '../data/mockData';
import './Footer.css';

export default function Footer({ onNavClick }) {
  return (
    <footer id="footer-section" className="nis-footer">
      <div className="container">
        
        {/* Main Footer Grid */}
        <div className="footer-main-grid">
          
          {/* Brand Info Column */}
          <div className="footer-brand-col">
            <div className="footer-logo-block">
              <div className="footer-logo-icon">
                <span>NIS</span>
              </div>
              <div>
                <h3 className="footer-brand-title">NET INFOTECH SYSTEM</h3>
                <span className="footer-brand-sub">Enterprise Accounting & Business ERP</span>
              </div>
            </div>

            <p className="footer-desc">
              India's leading intelligent accounting and business management platform. Empowers enterprises with real-time double entry ledgers, automated GST e-Invoicing, and inventory control.
            </p>

            <div className="footer-gstin-badge">
              <ShieldCheck size={16} color="#34D399" />
              <span>GST Registered: {COMPANY_INFO.gstin}</span>
            </div>

            {/* Social Media Links */}
            <div className="footer-socials-row">
              <a href="#linkedin" className="social-icon-btn" aria-label="LinkedIn" title="LinkedIn">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
              </a>
              <a href="#twitter" className="social-icon-btn" aria-label="X / Twitter" title="X / Twitter">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#facebook" className="social-icon-btn" aria-label="Facebook" title="Facebook">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/></svg>
              </a>
              <a href="#youtube" className="social-icon-btn" aria-label="YouTube" title="YouTube">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 22c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 2c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 1: Company */}
          <div className="footer-nav-col">
            <h4 className="footer-col-title">Company</h4>
            <ul className="footer-links-list">
              <li><a href="#why-us-section">About Us</a></li>
              <li><a href="#careers">Careers <span className="footer-tag">Hiring</span></a></li>
              <li><a href="#footer-section">Contact Us</a></li>
              <li><a href="#leadership">Corporate Leadership</a></li>
              <li><a href="#partners">Partner Program</a></li>
            </ul>
          </div>

          {/* Column 2: Solutions */}
          <div className="footer-nav-col">
            <h4 className="footer-col-title">Solutions</h4>
            <ul className="footer-links-list">
              <li><a href="#accounting-module">Accounting & Ledger</a></li>
              <li><a href="#accounting-module">Inventory & Warehouse</a></li>
              <li><a href="#accounting-module">GST & e-Invoicing</a></li>
              <li><a href="#accounting-module">Financial Reports</a></li>
              <li><a href="#accounting-module">Bank Reconciliation</a></li>
              <li><a href="#accounting-module">Tally Data Migration</a></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="footer-nav-col">
            <h4 className="footer-col-title">Resources</h4>
            <ul className="footer-links-list">
              <li><a href="#blog">GST & Accounting Blog</a></li>
              <li><a href="#docs">API & User Documentation</a></li>
              <li><a href="#support">24x7 Customer Support</a></li>
              <li><a href="#faq">Frequently Asked Questions</a></li>
              <li><a href="#security">Data Security Whitepaper</a></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="footer-contact-col">
            <h4 className="footer-col-title">Contact & Support</h4>
            
            <div className="contact-item">
              <Phone size={16} className="contact-icon" />
              <div>
                <span className="contact-label">Toll-Free Phone:</span>
                <a href={`tel:${COMPANY_INFO.phone}`} className="contact-val font-bold">
                  {COMPANY_INFO.phone}
                </a>
              </div>
            </div>

            <div className="contact-item">
              <Mail size={16} className="contact-icon" />
              <div>
                <span className="contact-label">Corporate Email:</span>
                <a href={`mailto:${COMPANY_INFO.email}`} className="contact-val">
                  {COMPANY_INFO.email}
                </a>
              </div>
            </div>

            <div className="contact-item">
              <MapPin size={16} className="contact-icon" />
              <div>
                <span className="contact-label">Headquarters:</span>
                <p className="contact-val">{COMPANY_INFO.address}</p>
                <span className="contact-branch">{COMPANY_INFO.branch}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Legal Strip */}
        <div className="footer-bottom-strip">
          <p className="copyright-text">
            © {new Date().getFullYear()} <b>NET INFOTECH SYSTEM</b> (NIS). All rights reserved. Indian GST & MCA Compliant.
          </p>

          <div className="legal-links">
            <a href="#privacy">Privacy Policy</a>
            <span className="dot-sep">•</span>
            <a href="#terms">Terms of Service</a>
            <span className="dot-sep">•</span>
            <a href="#security">Security & Backup</a>
            <span className="dot-sep">•</span>
            <a href="#sitemap">Sitemap</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
