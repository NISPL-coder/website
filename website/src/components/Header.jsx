import React, { useState, useEffect } from 'react';
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
  ArrowRight
} from 'lucide-react';
import logoImg from '../assets/net-infotech-final-logo-2-1-e1782735646883.png.webp';
import './Header.css';

export default function Header({ 
  onOpenDemo, 
  onOpenSearch 
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileExpandedSection, setMobileExpandedSection] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  const navMenuData = [
    {
      id: 'home',
      label: 'Home',
      path: '/',
      isPill: true,
    },
    {
      id: 'services',
      label: 'Services',
      path: '/services',
      hasDropdown: true,
      items: [
        { 
          label: '1. Tally Prime', 
          desc: 'Licensing, GST, inventory management, billing & accounting setup', 
          path: '/services/tally-prime' 
        },
        { 
          label: '2. Tally on Cloud', 
          desc: 'Anywhere secure remote access, high-speed cloud hosting & backups', 
          path: '/services/tally-on-cloud' 
        },
        { 
          label: '3. Data Center, Cloud Server & Hosting', 
          desc: 'Windows/Linux hosting, Azure & AWS solutions, cloud migration', 
          path: '/services/data-center-cloud' 
        },
        { 
          label: '4. IT Infrastructure & Security', 
          desc: 'Server/network management, firewalls, CCTV, Wi-Fi & IT AMC', 
          path: '/services/it-infra-security' 
        },
        { 
          label: '5. IT Product Repair & Maintenance', 
          desc: 'Desktop, laptop, printer, server & hardware troubleshooting', 
          path: '/services/it-repair-maintenance' 
        },
        { 
          label: '6. IT Product Sales & Rental', 
          desc: 'Laptop, desktop, server & networking equipment rental & procurement', 
          path: '/services/it-sales-rental' 
        },
      ],
    },
    {
      id: 'solutions',
      label: 'Solutions',
      path: '/solutions',
      hasDropdown: true,
      items: [
        { 
          label: 'Business Websites', 
          desc: 'Modern, high-converting responsive corporate web platforms', 
          path: '/solutions' 
        },
        { 
          label: 'E-Commerce Solutions', 
          desc: 'Online stores, payment gateway integration & Tally inventory sync', 
          path: '/solutions' 
        },
        { 
          label: 'Custom Software', 
          desc: 'Tailor-made web/desktop ERP, CRM & workflow automation', 
          path: '/solutions' 
        },
        { 
          label: 'Digital Solutions', 
          desc: 'Microsoft 365, Google Workspace & digital transformation', 
          path: '/solutions' 
        },
      ],
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      path: '/portfolio',
      isPill: false,
    },
    {
      id: 'contact',
      label: 'Contact',
      path: '/contact',
      isPill: false,
    },
  ];

  return (
    <>
      <header className={`nis-official-header ${isScrolled ? 'nis-official-scrolled' : ''}`}>
        <div className="nis-official-container">
          
          {/* LEFT: Official Logo + 3 Years Certified Tally Partner Badge */}
          <div className="nis-logo-group">
            <Link 
              to="/" 
              className="nis-official-logo-wrapper"
              title="Net Infotech System Pvt. Ltd. - 3 Years Certified Tally Partner"
            >
              <img 
                src={logoImg} 
                alt="Net Infotech System Pvt. Ltd. - 3 Years Certified Tally Partner" 
                className="nis-official-logo-img"
              />
            </Link>
            <div className="nis-tally-certified-pill" title="3 Years Certified Tally Partner">
              <span className="tally-pill-star">★</span>
              <span className="tally-pill-text">3 Years Certified Tally Partner</span>
            </div>
          </div>

          {/* RIGHT: Top Info Row + Bottom Navigation Row */}
          <div className="nis-official-right-col">
            
            {/* 1. TOP ROW: 25 Years Badge + Email + Phone */}
            <div className="nis-official-top-row">
              
              {/* 25 Years of Excellence Badge */}
              <div className="nis-badge-25" title="Celebrating 25+ Years of Technology Excellence">
                <span className="num-25">25</span>
                <div className="text-25">
                  <span className="line-1">YEARS OF</span>
                  <span className="line-2">EXCELLENCE</span>
                </div>
              </div>

              {/* Email Pill */}
              <a 
                href="mailto:info@netinfotechsystem.com" 
                className="nis-header-contact-link nis-email-link"
                title="Email: info@netinfotechsystem.com"
              >
                <div className="nis-contact-circle nis-circle-blue">
                  <Mail size={15} />
                </div>
                <span className="nis-contact-label">info@netinfotechsystem.com</span>
              </a>

              {/* Phone Pill */}
              <a 
                href="tel:+919330113000" 
                className="nis-header-contact-link nis-phone-link"
                title="Call Hotline: 033 - 4001 3000 / +91 9330113000"
              >
                <div className="nis-contact-circle nis-circle-orange">
                  <Phone size={15} />
                </div>
                <span className="nis-contact-label nis-phone-val">+91 9330113000</span>
              </a>

              {/* Mobile Hamburger Toggle */}
              <button 
                type="button" 
                className="nis-official-hamburger-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* 2. BOTTOM ROW: Navigation Menu Items */}
            <nav className="nis-official-nav-bar" aria-label="Main Navigation">
              <ul className="nis-official-nav-list">
                {navMenuData.map((menu) => {
                  const isActive = location.pathname === menu.path;

                  if (menu.isPill) {
                    return (
                      <li key={menu.id} className="nis-official-nav-item">
                        <Link
                          to={menu.path}
                          className={`nis-nav-pill-btn ${isActive ? 'active' : ''}`}
                        >
                          {menu.label}
                        </Link>
                      </li>
                    );
                  }

                  if (!menu.hasDropdown) {
                    return (
                      <li key={menu.id} className="nis-official-nav-item">
                        <Link
                          to={menu.path}
                          className={`nis-official-nav-link ${isActive ? 'active' : ''}`}
                        >
                          <span>{menu.label}</span>
                        </Link>
                      </li>
                    );
                  }

                  return (
                    <li 
                      key={menu.id} 
                      className="nis-official-nav-item has-dropdown"
                      onMouseEnter={() => setOpenDropdown(menu.id)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <Link
                        to={menu.path}
                        className={`nis-official-nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setOpenDropdown(null)}
                      >
                        <span>{menu.label}</span>
                        <ChevronDown size={14} className="nav-chevron" />
                      </Link>

                      {/* DROPDOWN MENU */}
                      <div className={`nis-nav-dropdown ${openDropdown === menu.id ? 'show' : ''}`}>
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
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Quick Action Helpers on Far Right of Nav */}
              <div className="nis-official-nav-actions">
                <button 
                  type="button" 
                  className="nis-nav-icon-action" 
                  title="Quick Search (Ctrl + K)"
                  onClick={onOpenSearch}
                >
                  <Search size={16} />
                </button>
                <button 
                  type="button" 
                  className="nis-nav-demo-cta"
                  onClick={onOpenDemo}
                  title="Request an Instant Customized Quote"
                >
                  <Sparkles size={13} />
                  <span>Get a Quote</span>
                </button>
              </div>
            </nav>

          </div>

        </div>
      </header>

      {/* MOBILE DRAWER OVERLAY (Rendered outside header to ensure full 100vh overlay) */}
      {mobileMenuOpen && (
        <div className="nis-official-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="nis-official-drawer" onClick={(e) => e.stopPropagation()}>
            
            {/* Drawer Header */}
            <div className="nis-drawer-top">
              <img 
                src={logoImg} 
                alt="NISPL Logo" 
                className="nis-drawer-logo" 
              />
              <button 
                type="button" 
                className="nis-drawer-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close Navigation"
              >
                <X size={20} />
              </button>
            </div>

            {/* 25 Years Banner in Drawer */}
            <div className="nis-drawer-badge-box">
              <div className="nis-badge-25">
                <span className="num-25">25</span>
                <div className="text-25">
                  <span className="line-1">YEARS OF</span>
                  <span className="line-2">EXCELLENCE</span>
                </div>
              </div>
              <span className="nis-drawer-tag">3 Years Certified Tally Partner</span>
            </div>

            {/* Search Bar in Drawer */}
            <div 
              className="nis-drawer-search-bar"
              onClick={() => { setMobileMenuOpen(false); onOpenSearch(); }}
            >
              <Search size={15} />
              <span>Search products, services, accounting...</span>
            </div>

            {/* Nav links accordion */}
            <div className="nis-drawer-links-list">
              {navMenuData.map((menu) => {
                if (menu.isPill || !menu.hasDropdown) {
                  return (
                    <Link
                      key={menu.id}
                      to={menu.path}
                      className="nis-drawer-pill-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>{menu.label}</span>
                      <ChevronRight size={16} />
                    </Link>
                  );
                }

                const isExpanded = mobileExpandedSection === menu.id;

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
                      <div className="nis-drawer-sub-list animate-fade-in">
                        {menu.items.map((sub, sIdx) => (
                          <Link
                            key={sIdx}
                            to={sub.path}
                            className="nis-drawer-sub-link"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <span>{sub.label}</span>
                            <ArrowRight size={13} />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Drawer Bottom Contacts */}
            <div className="nis-drawer-contacts">
              <a href="tel:+919330113000" className="nis-drawer-contact-item">
                <div className="nis-contact-circle nis-circle-orange">
                  <Phone size={15} />
                </div>
                <div>
                  <span className="sub-lbl">Call Hotline</span>
                  <strong>+91 9330113000</strong>
                </div>
              </a>

              <a href="mailto:info@netinfotechsystem.com" className="nis-drawer-contact-item">
                <div className="nis-contact-circle nis-circle-blue">
                  <Mail size={15} />
                </div>
                <div>
                  <span className="sub-lbl">Email Support</span>
                  <strong>info@netinfotechsystem.com</strong>
                </div>
              </a>

              <button 
                type="button" 
                className="nis-drawer-cta-btn"
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
