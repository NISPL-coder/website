import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronDown, 
  Menu, 
  X, 
  ArrowUpRight, 
  ArrowRight,
  Factory,
  ShoppingBag,
  HeartPulse,
  Landmark,
  Calculator,
  Cloud,
  Server,
  ShieldCheck,
  Cpu,
  Laptop,
  Database,
  RefreshCw,
  Workflow,
  Wrench,
  Network,
  Users,
  Award,
  Building2,
  FileText,
  Briefcase,
  PhoneCall,
  Sparkles
} from 'lucide-react';
import logoImg from '../../../../assets/Net Infotech Transparent Logo.png';
import { NAV_ITEMS, MEGA_MENU_CONFIG } from './megaMenuData';

const ITEM_ICON_MAP = {
  // About
  'about-nispl': Building2,
  'work-culture': Users,
  'partners': Award,
  'noc-facility': Server,

  // Products
  'tally-cloud': Cloud,
  'm365-suite': Briefcase,
  'datacenter-vps': Server,
  'utm-defense': ShieldCheck,
  'smart-biometrics': Cpu,
  'antivirus-edr': RefreshCw,

  // Industries
  'ind-mfg': Factory,
  'ind-retail-fmcg': ShoppingBag,
  'ind-health': HeartPulse,
  'ind-public': Landmark,
  'ind-ca-fin': Calculator,
  'ind-corp': Building2,

  // Services
  'srv-managed-noc': Workflow,
  'srv-it-amc': Wrench,
  'srv-lan-server': Network,
  'srv-cloud-mig': Cloud,
  'srv-tally-supp': FileText,
  'srv-cyber-mgmt': ShieldCheck,
  'srv-cctv-wifi': Laptop,
  'srv-remote-supp': RefreshCw,

  // Solutions
  'sol-tally-prime': FileText,
  'sol-cloud-tally': Cloud,
  'sol-cloud-vps': Server,
  'sol-cyber-sec': ShieldCheck,
  'sol-m365-lic': Briefcase,
  'sol-backup-dr': Database,
  'sol-it-infra': Server,
  'sol-crm-helpdesk': Workflow,
};

export default function Navbar({ onOpenContact, onOpenConsultation }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubItemMap, setActiveSubItemMap] = useState({});
  const menuTimeoutRef = useRef(null);
  const lastScrollY = useRef(0);

  // Smart scroll effect for navbar hide/show
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      if (currentScrollY > 140) {
        if (currentScrollY > lastScrollY.current + 8) {
          setNavVisible(false); // Hide on scroll down
          setActiveCategory(null);
        } else if (currentScrollY < lastScrollY.current - 8) {
          setNavVisible(true); // Show on scroll up
        }
      } else {
        setNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mega menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveCategory(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Smooth hover handlers with small debounce to prevent accidental menu closing
  const handleNavEnter = (catId) => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    setActiveCategory(catId);
    if (!activeSubItemMap[catId] && MEGA_MENU_CONFIG[catId]) {
      setActiveSubItemMap((prev) => ({
        ...prev,
        [catId]: MEGA_MENU_CONFIG[catId].items[0]?.id
      }));
    }
  };

  const handleNavLeave = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    menuTimeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 180);
  };

  const handleMenuContainerEnter = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
  };

  const handleMenuContainerLeave = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    menuTimeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 180);
  };

  const handleMenuItemClick = (path) => {
    setActiveCategory(null);
    if (!path) return;
    if (path.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/' + path);
      } else {
        const target = document.querySelector(path);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else if (path.startsWith('/')) {
      navigate(path);
    } else {
      window.location.href = path;
    }
  };

  const handleCtaClick = () => {
    if (onOpenConsultation) {
      onOpenConsultation();
    } else if (onOpenContact) {
      onOpenContact();
    } else {
      window.location.href = '/contact';
    }
  };

  const handleContactClick = () => {
    navigate('/contact');
  };

  return (
    <>
      {/* =====================================================================
          1. FLOATING PILL HEADER NAVBAR
          ===================================================================== */}
      <header className={`demo-header-wrapper ${isScrolled ? 'scrolled' : ''} ${!navVisible ? 'nav-hidden' : ''}`}>
        
        {/* Floating Pill Nav Bar */}
        <nav className="demo-pill-navbar" aria-label="Main Navigation">
          {/* Brand Logo (Left) */}
          <Link to="/" className="demo-brand" title="Net Infotech System Pvt. Ltd.">
            <div className="demo-brand-logo-frame">
              <img 
                src={logoImg} 
                alt="Net Infotech System Pvt. Ltd." 
                className="demo-brand-logo-img" 
              />
            </div>
          </Link>

          {/* Desktop Navigation Links (Center) */}
          <ul className="demo-nav-links">
            {NAV_ITEMS.map((item) => {
              const hasDropdown = Boolean(MEGA_MENU_CONFIG[item.id]);
              const isOpen = activeCategory === item.id;
              return (
                <li 
                  key={item.id}
                  className={`demo-nav-item ${hasDropdown ? 'has-dropdown' : ''} ${isOpen ? 'active' : ''}`}
                  onMouseEnter={() => {
                    if (hasDropdown) handleNavEnter(item.id);
                  }}
                  onMouseLeave={() => {
                    if (hasDropdown) handleNavLeave();
                  }}
                >
                  <button 
                    type="button" 
                    className={`demo-nav-link ${isOpen ? 'active' : ''}`}
                    onClick={() => {
                      if (hasDropdown) {
                        if (activeCategory === item.id) {
                          setActiveCategory(null);
                        } else {
                          handleNavEnter(item.id);
                        }
                      } else if (item.path) {
                        setActiveCategory(null);
                        navigate(item.path);
                      }
                    }}
                    aria-expanded={isOpen}
                  >
                    <span>{item.label}</span>
                    {hasDropdown && <ChevronDown className="demo-nav-chevron" />}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Right Action: Pill Contact Button & Mobile Toggle */}
          <div className="demo-nav-actions">
            <button 
              type="button"
              className={`demo-contact-pill-btn ${location.pathname === '/contact' ? 'active' : ''}`}
              onClick={handleContactClick}
            >
              Contact Us
            </button>

            {/* Mobile Hamburger Toggle */}
            <button 
              type="button" 
              className="demo-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {activeCategory && MEGA_MENU_CONFIG[activeCategory] && (() => {
          const catData = MEGA_MENU_CONFIG[activeCategory];
          return (
            <div 
              className="demo-mega-menu-container animate-fade-in"
              onMouseEnter={handleMenuContainerEnter}
              onMouseLeave={handleMenuContainerLeave}
            >
              <div className="demo-mega-menu-inner">
                
                {/* ---------------------------------------------------------------
                    LEFT PANEL: "Use Cases" Style 2-Column Grid with Black Squircles
                    --------------------------------------------------------------- */}
                <div className="demo-mega-left-panel">
                  <div className="demo-mega-section-title">
                    {catData.leftTitle || 'Use Cases'}
                  </div>

                  <div className="demo-mega-left-grid">
                    {catData.items.map((subItem) => {
                      const IconComponent = ITEM_ICON_MAP[subItem.id] || Briefcase;
                      const shortDesc = subItem.desc1 
                        ? (subItem.desc1.split('.')[0] + '.') 
                        : (subItem.badge || 'Enterprise IT solution tailored for scalability.');

                      return (
                        <div
                          key={subItem.id}
                          className="demo-mega-item-card"
                          onClick={() => handleMenuItemClick(subItem.path)}
                        >
                          <div className="demo-mega-squircle-icon">
                            <IconComponent size={20} strokeWidth={2.2} />
                          </div>
                          <div className="demo-mega-item-text">
                            <span className="demo-mega-item-title">{subItem.label}</span>
                            <p className="demo-mega-item-sub">{shortDesc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ---------------------------------------------------------------
                    RIGHT PANEL: "AI Features" Style 3 Sub-Columns + Bottom Card
                    --------------------------------------------------------------- */}
                <div className="demo-mega-right-panel">
                  <div className="demo-mega-right-top">
                    <div className="demo-mega-section-title">
                      {catData.rightTitle || 'Key Capabilities'}
                    </div>

                    <div className="demo-mega-columns-grid">
                      {(catData.rightColumns || []).map((col, cIdx) => (
                        <div key={cIdx} className="demo-mega-sub-col">
                          <span className="demo-mega-col-header">{col.title}</span>
                          <ul className="demo-mega-link-list">
                            {col.items.map((item, iIdx) => (
                              <li key={iIdx}>
                                <button
                                  type="button"
                                  className="demo-mega-text-link"
                                  onClick={() => handleMenuItemClick(item.path)}
                                >
                                  <span>{item.label}</span>
                                  {item.badge && (
                                    <span className="demo-mega-pill-badge">{item.badge}</span>
                                  )}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom "Meet Underlord" style Callout Card */}
                  {catData.callout && (
                    <div 
                      className="demo-mega-callout-card"
                      onClick={() => {
                        setActiveCategory(null);
                        handleCtaClick();
                      }}
                    >
                      <div className="demo-mega-callout-action">
                        <span>{catData.callout.actionLabel || 'Book Call'}</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>
          );
        })()}

      </header>

      {/* Mobile Drawer Navigation */}
      <div className={`demo-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        {NAV_ITEMS.map((item) => {
          const hasDropdown = Boolean(MEGA_MENU_CONFIG[item.id]);
          return (
            <div key={item.id} className="demo-mobile-item-wrap">
              <button
                type="button"
                className="demo-mobile-nav-link"
                onClick={() => {
                  if (hasDropdown) {
                    setActiveCategory(activeCategory === item.id ? null : item.id);
                  } else if (item.path) {
                    setMobileMenuOpen(false);
                    navigate(item.path);
                  }
                }}
              >
                <span>{item.label}</span>
                {hasDropdown && (
                  <ChevronDown size={15} className={activeCategory === item.id ? 'rotated' : ''} />
                )}
              </button>
              {hasDropdown && activeCategory === item.id && (
                <div className="demo-mobile-sub-list animate-fade-in">
                  {MEGA_MENU_CONFIG[item.id].items.map((sub) => (
                    <a
                      key={sub.id}
                      href={sub.path}
                      className="demo-mobile-sub-link"
                      onClick={(e) => {
                        if (sub.path.startsWith('#')) {
                          e.preventDefault();
                          setMobileMenuOpen(false);
                          const target = document.querySelector(sub.path);
                          if (target) target.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          setMobileMenuOpen(false);
                        }
                      }}
                    >
                      <span>{sub.label}</span>
                      <ArrowRight size={13} opacity={0.6} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <button 
          type="button" 
          className="demo-contact-pill-btn"
          style={{ width: '100%', marginTop: '16px' }}
          onClick={() => {
            setMobileMenuOpen(false);
            handleContactClick();
          }}
        >
          Contact Us
        </button>
      </div>
    </>
  );
}
