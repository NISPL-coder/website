import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  PhoneCall, 
  LogIn, 
  Sparkles, 
  Menu, 
  X, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import './Header.css';

export default function Header({ 
  activeNav, 
  setActiveNav, 
  onOpenDemo, 
  onOpenLogin, 
  onOpenSearch 
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home', target: '#hero-section' },
    { id: 'solutions', label: 'Solutions', target: '#overview-section' },
    { id: 'accounting', label: 'Accounting', target: '#accounting-module' },
    { id: 'inventory', label: 'Inventory', target: '#inventory-anchor' },
    { id: 'reports', label: 'Reports', target: '#reports-anchor' },
    { id: 'features', label: 'Features', target: '#features-section' },
    { id: 'about', label: 'About Us', target: '#why-us-section' },
    { id: 'contact', label: 'Contact', target: '#footer-section' },
  ];

  const handleNavClick = (nav) => {
    setActiveNav(nav.id);
    setMobileMenuOpen(false);

    if (nav.id === 'accounting' || nav.id === 'inventory' || nav.id === 'reports') {
      const el = document.getElementById('accounting-module');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      const el = document.querySelector(nav.target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className={`nis-header ${isScrolled ? 'nis-header-scrolled' : ''}`}>
      <div className="container nis-header-container">
        
        {/* LEFT: Logo Brand */}
        <div className="nis-logo-wrapper" onClick={() => handleNavClick({ id: 'home', target: '#hero-section' })}>
          <div className="nis-logo-icon">
            <span className="nis-logo-monogram">NIS</span>
            <div className="nis-logo-glow" />
          </div>
          <div className="nis-brand-text">
            <div className="nis-brand-title">
              <span className="nis-brand-net">NET INFOTECH</span>
              <span className="nis-brand-system">SYSTEM</span>
            </div>
            <span className="nis-brand-sub">Enterprise Accounting & ERP</span>
          </div>
        </div>

        {/* CENTER: Desktop Navigation */}
        <nav className="nis-desktop-nav" aria-label="Main Navigation">
          <ul className="nis-nav-list">
            {navLinks.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <li key={item.id} className="nis-nav-item">
                  <button
                    type="button"
                    className={`nis-nav-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(item)}
                  >
                    {item.label}
                    {isActive && <span className="nis-nav-indicator" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* RIGHT: Quick Action Buttons */}
        <div className="nis-header-actions">
          {/* Quick Search */}
          <button 
            type="button" 
            className="nis-icon-btn" 
            title="Search Invoices, Products, Ledgers (Ctrl + K)" 
            onClick={onOpenSearch}
          >
            <Search size={18} />
          </button>

          {/* Direct Phone / Contact */}
          <a 
            href="tel:+919876543210" 
            className="nis-phone-btn" 
            title="Call Support: +91 98765 43210"
          >
            <PhoneCall size={16} />
            <span className="nis-phone-text">+91 98765 43210</span>
          </a>

          {/* Login Button */}
          <button 
            type="button" 
            className="nis-login-btn" 
            onClick={onOpenLogin}
          >
            <LogIn size={16} />
            <span>Login</span>
          </button>

          {/* Primary CTA: Free Demo */}
          <button 
            type="button" 
            className="nis-cta-btn" 
            onClick={onOpenDemo}
          >
            <Sparkles size={16} className="nis-cta-sparkle" />
            <span>Book Free Demo</span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button 
            type="button" 
            className="nis-hamburger-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="nis-mobile-drawer animate-fade-in">
          <div className="nis-mobile-nav-list">
            {navLinks.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nis-mobile-nav-link ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item)}
              >
                <span>{item.label}</span>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>

          <div className="nis-mobile-actions">
            <a href="tel:+919876543210" className="nis-mobile-phone">
              <PhoneCall size={16} />
              <span>Call +91 98765 43210</span>
            </a>

            <div className="nis-mobile-btn-grid">
              <button 
                type="button" 
                className="nis-login-btn" 
                onClick={() => { setMobileMenuOpen(false); onOpenLogin(); }}
              >
                <LogIn size={16} />
                <span>Client Login</span>
              </button>
              <button 
                type="button" 
                className="nis-cta-btn" 
                onClick={() => { setMobileMenuOpen(false); onOpenDemo(); }}
              >
                <Sparkles size={16} />
                <span>Free Demo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
