import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronDown, 
  Menu, 
  X, 
  ArrowRight,
  Users,
  Award,
  Sparkles,
  ChevronRight,
  Clock,
  Server
} from 'lucide-react';
import logoImg from '../../../../assets/NISPL Cloud Tech Logo (2).png';
import { NAV_ITEMS, MEGA_MENU_CONFIG } from './megaMenuData';

export default function Navbar({ onOpenContact, onOpenConsultation }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isPinnedByClick, setIsPinnedByClick] = useState(false);
  const closeTimeoutRef = useRef(null);
  const navbarRef = useRef(null);

  // Fixed navbar scroll effect for smooth backdrop transitions
  useEffect(() => {
    let rafId = null;

    const handleScroll = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 20);
        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Click outside and Escape key to close dropdown
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (navbarRef.current && !navbarRef.current.contains(e.target)) {
        setActiveCategory(null);
        setIsPinnedByClick(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveCategory(null);
        setIsPinnedByClick(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('touchstart', handleDocumentClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('touchstart', handleDocumentClick);
      window.removeEventListener('keydown', handleKeyDown);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  // Hover handlers
  const handleNavEnter = (catId) => {
    clearCloseTimeout();
    setActiveCategory(catId);
  };

  const handleNavLeave = () => {
    if (isPinnedByClick) return; // Keep open if pinned by user click
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 240);
  };

  const handleMenuEnter = () => {
    clearCloseTimeout();
  };

  const handleMenuLeave = () => {
    if (isPinnedByClick) return;
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 240);
  };

  // Click handler (Opens & pins open, or toggles closed if already pinned)
  const handleNavClick = (itemId, hasDropdown, path) => {
    if (hasDropdown) {
      if (activeCategory === itemId && isPinnedByClick) {
        // Toggle closed
        setActiveCategory(null);
        setIsPinnedByClick(false);
      } else {
        // Open and pin open
        clearCloseTimeout();
        setActiveCategory(itemId);
        setIsPinnedByClick(true);
      }
    } else if (path) {
      setActiveCategory(null);
      setIsPinnedByClick(false);
      navigate(path);
    }
  };

  const handleMenuItemClick = (path) => {
    setActiveCategory(null);
    setIsPinnedByClick(false);
    if (!path) return;

    if (path.includes('#')) {
      const [targetPath, hash] = path.split('#');
      const isCurrentPage = 
        (targetPath === '' && location.pathname === '/') || 
        location.pathname === targetPath;

      if (isCurrentPage) {
        const target = document.getElementById(hash) || document.querySelector(`#${hash}`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
    }

    if (path.startsWith('/')) {
      navigate(path);
    } else {
      window.location.href = path;
    }
  };

  const handleContactClick = () => {
    setActiveCategory(null);
    setIsPinnedByClick(false);
    navigate('/contact');
  };

  return (
    <>
      {/* =====================================================================
          1. FLOATING PILL HEADER NAVBAR
          ===================================================================== */}
      <header ref={navbarRef} className={`demo-header-wrapper ${isScrolled ? 'scrolled' : ''}`}>
        
        {/* Floating Pill Nav Bar */}
        <nav className="demo-pill-navbar" aria-label="Main Navigation">
          {/* Brand Logo (Left) */}
          <Link to="/" className="demo-brand" title="Net Infotech System Pvt. Ltd.">
            <div className="demo-brand-logo-frame">
              <img 
                src={logoImg} 
                alt="Net Infotech System Pvt. Ltd." 
                className="demo-brand-logo-img" 
                width="240"
                height="80"
                fetchPriority="high"
                decoding="async"
              />
            </div>
          </Link>

          {/* Desktop Navigation Links (Center) */}
          <ul className="demo-nav-links">
            {NAV_ITEMS.map((item) => {
              const hasDropdown = Boolean(MEGA_MENU_CONFIG[item.id]);
              const isOpen = activeCategory === item.id;
              const menuData = MEGA_MENU_CONFIG[item.id];

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
                    onClick={() => handleNavClick(item.id, hasDropdown, item.path)}
                    aria-expanded={isOpen}
                    aria-haspopup={hasDropdown ? 'true' : undefined}
                  >
                    <span>{item.label}</span>
                    {hasDropdown && (
                      <ChevronDown className={`demo-nav-chevron ${isOpen ? 'rotated' : ''}`} size={14} />
                    )}
                  </button>

                  {/* High-End Enterprise Dropdown Menu (Open with Hover and Click) */}
                  {isOpen && hasDropdown && menuData && (
                    <div 
                      className={`demo-pro-dropdown-menu ${menuData.isComingSoon ? 'is-coming-soon' : ''}`}
                      onMouseEnter={handleMenuEnter}
                      onMouseLeave={handleMenuLeave}
                      role="region"
                      aria-label={`${item.label} submenu`}
                    >
                      <div className="demo-pro-top-accent" aria-hidden="true" />
                      <div className="demo-pro-notch" aria-hidden="true" />

                      {menuData.isComingSoon ? (
                        <div className="demo-pro-cs-content">
                          <h4 className="demo-pro-cs-title">{menuData.title}</h4>
                          <p className="demo-pro-cs-sub">{menuData.subtitle}</p>
                          <p className="demo-pro-cs-desc">{menuData.message}</p>
                          <button
                            type="button"
                            className="demo-pro-cs-btn"
                            onClick={() => handleMenuItemClick(menuData.ctaPath || '/contact')}
                          >
                            <span>{menuData.ctaText || 'Contact Us'}</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="demo-pro-culture-content">
                          {/* Header Bar */}
                          <div className="demo-pro-header">
                            <div className="demo-pro-header-left">
                              <div className="demo-pro-icon-chip">
                                <Users size={16} />
                              </div>
                              <div className="demo-pro-header-titles">
                                <span className="demo-pro-chip-tag">{menuData.categoryBadge}</span>
                                <h4 className="demo-pro-header-title">{menuData.title}</h4>
                              </div>
                            </div>
                          </div>

                          <div className="demo-pro-divider" />

                          {/* Items List */}
                          <div className="demo-pro-links-list">
                            {menuData.links?.map((link) => {
                              const IconComp = 
                                link.icon === 'Award' ? Award : 
                                link.icon === 'Sparkles' ? Sparkles : 
                                link.icon === 'Server' ? Server :
                                Users;

                              return (
                                <button
                                  key={link.id}
                                  type="button"
                                  className="demo-pro-link-card"
                                  onClick={() => handleMenuItemClick(link.path)}
                                >
                                  <div className="demo-pro-link-icon-wrap">
                                    <IconComp size={17} />
                                  </div>
                                  <div className="demo-pro-link-info">
                                    <div className="demo-pro-link-title-row">
                                      <span className="demo-pro-link-title">{link.label}</span>
                                    </div>
                                    <p className="demo-pro-link-desc">{link.desc}</p>
                                  </div>
                                  <ChevronRight size={15} className="demo-pro-link-arrow" />
                                </button>
                              );
                            })}
                          </div>

                          
                        </div>
                      )}
                    </div>
                  )}
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
      </header>

      {/* Mobile Drawer Navigation */}
      <div className={`demo-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        {NAV_ITEMS.map((item) => {
          const hasDropdown = Boolean(MEGA_MENU_CONFIG[item.id]);
          const menuData = MEGA_MENU_CONFIG[item.id];
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
              {hasDropdown && activeCategory === item.id && menuData && (
                <div className="demo-mobile-sub-list animate-fade-in">
                  {menuData.isComingSoon ? (
                    <div className="demo-mobile-cs-box">
                      <span className="demo-mobile-cs-badge">{menuData.categoryBadge || 'Coming Soon'}</span>
                      <p className="demo-mobile-cs-text">
                        {menuData.message || 'Please check back soon.'}
                      </p>
                    </div>
                  ) : (
                    menuData.links.map((sub) => (
                      <a
                        key={sub.id}
                        href={sub.path}
                        className="demo-mobile-sub-link"
                        onClick={(e) => {
                          e.preventDefault();
                          setMobileMenuOpen(false);
                          handleMenuItemClick(sub.path);
                        }}
                      >
                        <span>{sub.label}</span>
                        <ArrowRight size={13} opacity={0.6} />
                      </a>
                    ))
                  )}
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
