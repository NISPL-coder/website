import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Sparkles, 
  Menu, 
  X,
  ArrowRight,
  Briefcase, 
  Users, 
  Check
} from 'lucide-react';
import logoImg from '../assets/Transparent Tech Logo with Cloud Mark.png';
import './Header.css';

// Inline Indian flag (Windows does not render the 🇮🇳 emoji)
const IndiaFlag = ({ size = 16 }) => (
  <svg width={size * 1.25} height={size} viewBox="0 0 24 16" style={{ borderRadius: 2, display: 'inline-block', verticalAlign: 'middle' }}>
    <rect width="24" height="5.33" y="0" fill="#FF9933" />
    <rect width="24" height="5.34" y="5.33" fill="#FFFFFF" />
    <rect width="24" height="5.33" y="10.67" fill="#138808" />
    <circle cx="12" cy="8" r="2" fill="none" stroke="#000080" strokeWidth="0.8" />
  </svg>
);

export default function Header({ 
  onOpenDemo, 
  onOpenSearch 
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('IN'); // 'IN' or 'GLOBAL' — India by default
  const [mobileExpandedSection, setMobileExpandedSection] = useState(null);

  const countryRef = useRef(null);
  const location = useLocation();

  // Scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
    setIsCountryOpen(false);
  }, [location.pathname]);

  // Click outside listener for country dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (countryRef.current && !countryRef.current.contains(e.target)) {
        setIsCountryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation Items configuration exactly in requested order:
  // 1. Home
  // 2. About Us ▼
  // 3. Partners ▼
  // 4. Products ▼
  // 5. Industries ▼
  // 6. Services / Solutions ▼
  // 7. Contact ▼
  const navMenuItems = [
    {
      id: 'about',
      label: 'About Us',
      path: '/about',
      items: [
        {
          label: 'Partners',
          path: '/partners'
        }
      ]
    },
    {
      id: 'products',
      label: 'Products',
      path: '/products'
    },
    {
      id: 'industries',
      label: 'Industries',
      path: '/industries'
    },
    {
      id: 'services',
      label: 'Services',
      path: '/services',
      items: [
        { label: 'Managed IT Services', path: '/services' },
        { label: 'IT AMC & Support', path: '/services' },
        { label: 'Server & Network Management', path: '/services' },
        { label: 'Cloud Migration & Management', path: '/services' },
        { label: 'Tally Implementation & Support', path: '/services' },
        { label: 'Microsoft 365 Support', path: '/services' },
        { label: 'Cyber Security Management', path: '/services' },
        { label: 'CCTV & Wi-Fi Support', path: '/services' },
        { label: 'On-site / Remote IT Support', path: '/services' }
      ]
    },
    {
      id: 'solutions',
      label: 'Solutions',
      path: '/solutions',
      items: [
        { label: 'TallyPrime & ERP Solutions', path: '/solutions' },
        { label: 'Tally on Cloud', path: '/solutions' },
        { label: 'Cloud & Hosting Solutions', path: '/solutions' },
        { label: 'Cyber Security Solutions', path: '/solutions' },
        { label: 'Microsoft 365 & Licensing Solutions', path: '/solutions' },
        { label: 'Business Management Portal Solutions', path: '/solutions' },
        { label: 'IT Infrastructure Solutions', path: '/solutions' },
        { label: 'Backup & Disaster Recovery Solutions', path: '/solutions' }
      ]
    }
  ];

  return (
    <>
      <header className={`nis-two-row-header ${isScrolled ? 'is-scrolled' : ''}`}>
        
        {/* ========================================================
            ROW 1 — TOP COMPANY INFORMATION BAR
            ======================================================== */}
        <div className="nis-top-info-bar">
          <div className="nis-header-inner nis-top-info-inner">
            
            {/* FAR LEFT: NISPL Logo, Company Name, Tagline & Certified Badge */}
            <div className="nis-brand-block">
              <Link to="/" className="nis-brand-link" title="Net Infotech System Pvt. Ltd.">
                
                {/* Logo Frame: displays the official cloud emblem + NISPL */}
                <div className="nis-brand-logo-frame">
                  <img 
                    src={logoImg} 
                    alt="Net Infotech System Logo" 
                    className="nis-brand-logo-img"
                  />
                </div>

                {/* Company Name, Tagline, and Certified Badge */}
                <div className="nis-brand-text-col">
                  <div className="nis-brand-title">Net Infotech System Pvt. Ltd.</div>
                  <div className="nis-brand-tagline">Connects People | Drives Growth</div>
                  <div className="nis-tally-certified-badge" title="Official 3 Years Certified Tally Partner">
                    <span className="nis-tally-star">★</span>
                    <span className="nis-tally-badge-text">3 Years Certified Tally Partner</span>
                  </div>
                </div>

              </Link>
            </div>

            {/* RIGHT: 25 Years Badge + Email + Phone + Country Dropdown */}
            <div className="nis-top-info-right">
              
              {/* 25 YEARS OF EXCELLENCE */}
              <div className="nis-badge-25" title="Celebrating 25 Years of Technology Excellence">
                <span className="num-25">25</span>
                <div className="text-25">
                  <span className="line-1">YEARS OF</span>
                  <span className="line-2">EXCELLENCE</span>
                </div>
              </div>

              {/* Email Pill */}
              <a 
                href="mailto:info@netinfotechsystem.com" 
                className="nis-contact-pill nis-email-pill"
                title="Email Us: info@netinfotechsystem.com"
              >
                <div className="nis-contact-circle nis-circle-blue">
                  <Mail size={14} />
                </div>
                <span className="nis-contact-label">info@netinfotechsystem.com</span>
              </a>

              {/* Phone Pill */}
              <a 
                href="tel:+919330113000" 
                className="nis-contact-pill nis-phone-pill"
                title="Call Hotline: +91 9330113000"
              >
                <div className="nis-contact-circle nis-circle-orange">
                  <Phone size={14} />
                </div>
                <span className="nis-contact-label nis-phone-val">+91 9330113000</span>
              </a>

              {/* COUNTRY SELECTOR BUTTON & FLOATING DROPDOWN */}
              <div className="nis-country-container" ref={countryRef}>
                <button
                  type="button"
                  className={`nis-country-btn ${isCountryOpen ? 'active' : ''}`}
                  onClick={() => setIsCountryOpen(!isCountryOpen)}
                  onMouseEnter={() => setIsCountryOpen(true)}
                  aria-label="Select Country or Global Region"
                  aria-expanded={isCountryOpen}
                >
                  <span className="nis-country-flag">{selectedCountry === 'IN' ? <IndiaFlag size={16} /> : '🌐'}</span>
                  <span className="nis-country-name">{selectedCountry === 'IN' ? 'India' : 'Global'}</span>
                  <ChevronDown size={13} className={`nis-country-chevron ${isCountryOpen ? 'rotated' : ''}`} />
                </button>

                {/* Country Floating Dropdown */}
                <div 
                  className={`nis-country-dropdown ${isCountryOpen ? 'show' : ''}`}
                  onMouseLeave={() => setIsCountryOpen(false)}
                >
                  <button
                    type="button"
                    className={`nis-country-menu-item ${selectedCountry === 'GLOBAL' ? 'selected' : ''}`}
                    onClick={() => { setSelectedCountry('GLOBAL'); setIsCountryOpen(false); }}
                  >
                    <span className="country-item-flag">🌐</span>
                    <span className="country-item-name">Global</span>
                    {selectedCountry === 'GLOBAL' && <span className="country-active-dot" />}
                  </button>
                  <button
                    type="button"
                    className={`nis-country-menu-item ${selectedCountry === 'IN' ? 'selected' : ''}`}
                    onClick={() => { setSelectedCountry('IN'); setIsCountryOpen(false); }}
                  >
                    <span className="country-item-flag"><IndiaFlag size={15} /></span>
                    <span className="country-item-name">India</span>
                    {selectedCountry === 'IN' && <span className="country-active-dot" />}
                  </button>
                </div>
              </div>

              {/* Mobile Hamburger Menu Button */}
              <button 
                type="button" 
                className="nis-hamburger-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

            </div>

          </div>
        </div>

        {/* ========================================================
            ROW 2 — MAIN NAVIGATION
            ======================================================== */}
        <div className="nis-main-nav-bar">
          <div className="nis-header-inner nis-main-nav-inner">
            
            <nav className="nis-nav-wrapper" aria-label="Main Website Navigation">
              <ul className="nis-nav-list">

                {/* 1. Home (Blue rounded-pill active button with white text) */}
                <li className="nis-nav-item">
                  <Link
                    to="/"
                    className={`nis-nav-home-pill ${location.pathname === '/' ? 'active' : ''}`}
                  >
                    Home
                  </Link>
                </li>

                {/* 2 to 6: About Us, Partners, Products, Industries, Services / Solutions */}
                {navMenuItems.map((menu) => {
                  const isCurrentActive = location.pathname.startsWith(menu.path);

                  // Plain link (no dropdown)
                  if (!menu.items || menu.items.length === 0) {
                    return (
                      <li key={menu.id} className="nis-nav-item">
                        <Link
                          to={menu.path}
                          className={`nis-nav-link ${isCurrentActive ? 'active' : ''}`}
                        >
                          <span>{menu.label}</span>
                        </Link>
                      </li>
                    );
                  }

                  return (
                    <li 
                      key={menu.id}
                      className="nis-nav-item has-dropdown"
                      onMouseEnter={() => setOpenDropdown(menu.id)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <Link
                        to={menu.path}
                        className={`nis-nav-link ${isCurrentActive ? 'active' : ''}`}
                        onClick={() => setOpenDropdown(null)}
                      >
                        <span>{menu.label}</span>
                        <ChevronDown 
                          size={13} 
                          className={`nav-chevron ${openDropdown === menu.id ? 'rotated' : ''}`} 
                        />
                      </Link>

                      {/* Dropdown Menu */}
                      <div className={`nis-nav-dropdown ${menu.id === 'about' ? 'nis-contact-dropdown' : ''} ${openDropdown === menu.id ? 'show' : ''}`}>
                        {menu.id === 'about' ? (
                          <div className="nis-contact-dropdown-card">
                            {menu.items.map((subItem, sIdx) => (
                              <Link
                                key={sIdx}
                                to={subItem.path}
                                className="nis-contact-sub-item"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <div className="nis-contact-sub-icon">
                                  <Users size={16} />
                                </div>
                                <div className="nis-contact-sub-info">
                                  <span className="nis-contact-sub-title">{subItem.label}</span>
                                  <span className="nis-contact-sub-subtitle">Our technology alliances</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        ) : (
                        <div className="nis-dropdown-inner">
                          {menu.items.map((subItem, sIdx) => (
                            <Link 
                              key={sIdx} 
                              to={subItem.path}
                              className="nis-dropdown-item"
                              onClick={() => setOpenDropdown(null)}
                            >
                              <div className="nis-dropdown-item-header">
                                <span className="nis-dropdown-item-title">{subItem.label}</span>
                                <ArrowRight size={13} className="item-arrow" />
                              </div>
                              {subItem.desc && (
                                <p className="nis-dropdown-item-desc">{subItem.desc}</p>
                              )}
                            </Link>
                          ))}
                        </div>
                        )}
                      </div>
                    </li>
                  );
                })}

                {/* 7. Contact ▼ (Contact Dropdown with Business & Careers) */}
                <li 
                  className="nis-nav-item has-dropdown"
                  onMouseEnter={() => setOpenDropdown('contact')}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    to="/contact"
                    className={`nis-nav-link ${location.pathname.startsWith('/contact') ? 'active' : ''}`}
                    onClick={() => setOpenDropdown(null)}
                  >
                    <span>Contact</span>
                    <ChevronDown 
                      size={13} 
                      className={`nav-chevron ${openDropdown === 'contact' ? 'rotated' : ''}`} 
                    />
                  </Link>

                  {/* CONTACT DROPDOWN (Directly underneath with Business & Careers) */}
                  <div className={`nis-nav-dropdown nis-contact-dropdown ${openDropdown === 'contact' ? 'show' : ''}`}>
                    <div className="nis-contact-dropdown-card">
                      
                      {/* Business Item */}
                      <Link 
                        to="/contact/business"
                        className="nis-contact-sub-item"
                        onClick={() => setOpenDropdown(null)}
                      >
                        <div className="nis-contact-sub-icon">
                          <Briefcase size={16} />
                        </div>
                        <div className="nis-contact-sub-info">
                          <span className="nis-contact-sub-title">Business</span>
                          <span className="nis-contact-sub-subtitle">Inquiries & Corporate Solutions</span>
                        </div>
                      </Link>

                      {/* Careers Item */}
                      <Link 
                        to="/contact/careers" 
                        className="nis-contact-sub-item"
                        onClick={() => setOpenDropdown(null)}
                      >
                        <div className="nis-contact-sub-icon">
                          <Users size={16} />
                        </div>
                        <div className="nis-contact-sub-info">
                          <span className="nis-contact-sub-title">Careers</span>
                          <span className="nis-contact-sub-subtitle">Join our Team & Open Roles</span>
                        </div>
                      </Link>

                    </div>
                  </div>
                </li>

              </ul>
            </nav>

            {/* QUICK ACTIONS ON FAR RIGHT OF NAV ROW: Search + Get a Quote */}
            <div className="nis-nav-actions-group">
              <button 
                type="button" 
                className="nis-nav-search-btn" 
                title="Quick Search (Ctrl + K)"
                onClick={onOpenSearch}
                aria-label="Search website"
              >
                <Search size={16} />
              </button>

              <button 
                type="button" 
                className="nis-nav-quote-btn"
                onClick={onOpenDemo}
                title="Request an Instant Customized Quote"
              >
                <Sparkles size={14} />
                <span>Get a Quote</span>
              </button>
            </div>

          </div>
        </div>

      </header>

      {/* ========================================================
          MOBILE NAVIGATION DRAWER OVERLAY
          ======================================================== */}
      {mobileMenuOpen && (
        <div className="nis-mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="nis-mobile-drawer" onClick={(e) => e.stopPropagation()}>
            
            {/* Drawer Top Bar */}
            <div className="nis-drawer-top">
              <div className="nis-drawer-brand">
                <div className="nis-brand-logo-frame">
                  <img src={logoImg} alt="NISPL" className="nis-brand-logo-img" />
                </div>
                <div>
                  <div className="nis-brand-title" style={{ fontSize: '0.95rem' }}>Net Infotech System</div>
                  <div className="nis-brand-tagline">Connects People | Drives Growth</div>
                </div>
              </div>

              <button 
                type="button" 
                className="nis-drawer-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation"
              >
                <X size={20} />
              </button>
            </div>

            {/* Badges in Drawer */}
            <div className="nis-drawer-badges-strip">
              <div className="nis-badge-25">
                <span className="num-25" style={{ fontSize: '1.6rem' }}>25</span>
                <div className="text-25">
                  <span className="line-1">YEARS OF</span>
                  <span className="line-2">EXCELLENCE</span>
                </div>
              </div>
              <div className="nis-tally-certified-badge">
                <span className="nis-tally-star">★</span>
                <span>3 Years Certified Tally Partner</span>
              </div>
            </div>

            {/* Country Selector in Mobile Drawer */}
            <div className="nis-drawer-country-box">
              <span className="drawer-country-title">Selected Country:</span>
              <div className="drawer-country-toggle">
                <button
                  type="button"
                  className={`drawer-country-btn ${selectedCountry === 'IN' ? 'active' : ''}`}
                  onClick={() => setSelectedCountry('IN')}
                >
                  <IndiaFlag size={15} /> India {selectedCountry === 'IN' && <Check size={13} />}
                </button>
                <button
                  type="button"
                  className={`drawer-country-btn ${selectedCountry === 'GLOBAL' ? 'active' : ''}`}
                  onClick={() => setSelectedCountry('GLOBAL')}
                >
                  🌐 Global {selectedCountry === 'GLOBAL' && <Check size={13} />}
                </button>
              </div>
            </div>

            {/* Search Bar in Mobile Drawer */}
            <div 
              className="nis-drawer-search-bar"
              onClick={() => { setMobileMenuOpen(false); onOpenSearch(); }}
            >
              <Search size={15} />
              <span>Search products, services, Tally...</span>
            </div>

            {/* Navigation List Accordion in Drawer */}
            <div className="nis-drawer-nav-list">
              
              {/* Home */}
              <Link
                to="/"
                className="nis-drawer-home-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Home</span>
                <ChevronRight size={16} />
              </Link>

              {/* Dynamic Accordion items */}
              {navMenuItems.map((menu) => {
                const isExpanded = mobileExpandedSection === menu.id;

                // Plain link (no submenu)
                if (!menu.items || menu.items.length === 0) {
                  return (
                    <Link
                      key={menu.id}
                      to={menu.path}
                      className="nis-drawer-home-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>{menu.label}</span>
                      <ChevronRight size={16} />
                    </Link>
                  );
                }

                return (
                  <div key={menu.id} className="nis-drawer-accordion-group">
                    <button
                      type="button"
                      className="nis-drawer-accordion-trigger"
                      onClick={() => setMobileExpandedSection(isExpanded ? null : menu.id)}
                    >
                      <span>{menu.label}</span>
                      <ChevronDown 
                        size={16} 
                        className={`drawer-chevron ${isExpanded ? 'rotated' : ''}`} 
                      />
                    </button>

                    {isExpanded && menu.items && (
                      <div className="nis-drawer-sub-menu animate-fade-in">
                        {menu.items.map((sub, sIdx) => (
                          <Link
                            key={sIdx}
                            to={sub.path}
                            className="nis-drawer-sub-item"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {menu.id === 'about' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Users size={14} color="#0284C7" />
                                <span>{sub.label}</span>
                              </div>
                            ) : (
                              <span>{sub.label}</span>
                            )}
                            <ArrowRight size={13} />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Contact Accordion */}
              <div className="nis-drawer-accordion-group">
                <button
                  type="button"
                  className="nis-drawer-accordion-trigger"
                  onClick={() => setMobileExpandedSection(mobileExpandedSection === 'contact' ? null : 'contact')}
                >
                  <span>Contact</span>
                  <ChevronDown 
                    size={16} 
                    className={`drawer-chevron ${mobileExpandedSection === 'contact' ? 'rotated' : ''}`} 
                  />
                </button>

                {mobileExpandedSection === 'contact' && (
                  <div className="nis-drawer-sub-menu animate-fade-in">
                    <Link
                      to="/contact/business"
                      className="nis-drawer-sub-item"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Briefcase size={14} color="#0284C7" />
                        <span>Business</span>
                      </div>
                      <ArrowRight size={13} />
                    </Link>
                    <Link
                      to="/contact/careers"
                      className="nis-drawer-sub-item"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={14} color="#0284C7" />
                        <span>Careers</span>
                      </div>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                )}
              </div>

            </div>

            {/* Drawer Bottom Contacts & CTA */}
            <div className="nis-drawer-bottom-contacts">
              <a href="tel:+919330113000" className="nis-drawer-contact-card">
                <div className="nis-contact-circle nis-circle-orange">
                  <Phone size={14} />
                </div>
                <div>
                  <span className="sub-lbl">Call Hotline</span>
                  <strong>+91 9330113000</strong>
                </div>
              </a>

              <a href="mailto:info@netinfotechsystem.com" className="nis-drawer-contact-card">
                <div className="nis-contact-circle nis-circle-blue">
                  <Mail size={14} />
                </div>
                <div>
                  <span className="sub-lbl">Email Support</span>
                  <strong>info@netinfotechsystem.com</strong>
                </div>
              </a>

              <button 
                type="button" 
                className="nis-drawer-quote-cta"
                onClick={() => { setMobileMenuOpen(false); onOpenDemo(); }}
              >
                <Sparkles size={15} />
                <span>Get a Free Quote</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
