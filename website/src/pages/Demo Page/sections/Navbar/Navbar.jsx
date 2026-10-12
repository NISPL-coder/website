import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronDown, 
  Menu, 
  X, 
  ArrowUpRight, 
  ArrowRight 
} from 'lucide-react';
import logoImg from '../../../../assets/nispl-logo-transparent.png';
import { NAV_ITEMS, MEGA_MENU_CONFIG } from './megaMenuData';

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
          1. FLOATING PILL HEADER NAVBAR (CodeLogicX-Style Mega Menu Integration)
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

        {activeCategory && MEGA_MENU_CONFIG[activeCategory] && (
          <div 
            className="demo-mega-menu-container animate-fade-in"
            onMouseEnter={handleMenuContainerEnter}
            onMouseLeave={handleMenuContainerLeave}
          >
            <div className="demo-mega-menu-inner">
              
              {/* ---------------------------------------------------------------
                  COLUMN 1 (LEFT PANEL ~32%): Category Heading, Feature Composite
                  Image with holographic border & glow, Feature Pills, Overview, CTA
                  --------------------------------------------------------------- */}
              <div className="demo-mega-left-panel">
                <div className="demo-mega-left-content">
                  <div className="demo-mega-heading-row">
                    <h3 className="demo-mega-heading">{MEGA_MENU_CONFIG[activeCategory].title}</h3>
                  </div>

                  {/* High-Tech Generated Feature Showcase Graphic */}
                  {MEGA_MENU_CONFIG[activeCategory].image && (
                    <div className="demo-mega-feature-banner-frame">
                      <img 
                        src={MEGA_MENU_CONFIG[activeCategory].image} 
                        alt={`${MEGA_MENU_CONFIG[activeCategory].title} Feature Ecosystem`} 
                        className="demo-mega-feature-banner-img"
                      />
                    </div>
                  )}

                  <p className="demo-mega-overview">{MEGA_MENU_CONFIG[activeCategory].overview}</p>
                </div>

                {/* Consultation Call CTA */}
                <button 
                  type="button" 
                  className="demo-mega-cta-btn"
                  onClick={() => {
                    setActiveCategory(null);
                    handleCtaClick();
                  }}
                >
                  <span>Book a Free Consultation Call</span>
                  <ArrowUpRight size={16} />
                </button>
              </div>

              {/* ---------------------------------------------------------------
                  COLUMN 2 (SUBMENU ITEMS LIST ~56%): Clean, ultra-premium item list
                  without arrows, with glowing hover micro-interactions
                  --------------------------------------------------------------- */}
              <div className="demo-mega-middle-panel">
                <div className="demo-mega-middle-list">
                  {MEGA_MENU_CONFIG[activeCategory].items.map((subItem) => {
                    const isSubActive = (activeSubItemMap[activeCategory] || MEGA_MENU_CONFIG[activeCategory].items[0]?.id) === subItem.id;
                    return (
                      <div
                        key={subItem.id}
                        className={`demo-mega-menu-item ${isSubActive ? 'active' : ''}`}
                        onMouseEnter={() => {
                          setActiveSubItemMap((prev) => ({ ...prev, [activeCategory]: subItem.id }));
                        }}
                        onClick={() => {
                          handleMenuItemClick(subItem.path);
                        }}
                      >
                        <span className="demo-mega-item-title">{subItem.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

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
