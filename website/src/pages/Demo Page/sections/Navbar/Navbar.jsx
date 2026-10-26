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
  Server,
  Shield,
  Lock,
  Cloud
} from 'lucide-react';
import logoImg from '../../../../assets/NISPL Cloud Tech Logo (2).png';
import { NAV_ITEMS, MEGA_MENU_CONFIG } from './megaMenuData';

export default function Navbar({ onOpenContact, onOpenConsultation }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isPinnedByClick, setIsPinnedByClick] = useState(false);
  const closeTimeoutRef = useRef(null);
  const navbarRef = useRef(null);
  const mobileDrawerRef = useRef(null);

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

  // Click outside and Escape key to close dropdown & mobile drawer
  useEffect(() => {
    const handleDocumentClick = (e) => {
      const isInsideNavbar = navbarRef.current && navbarRef.current.contains(e.target);
      const isInsideDrawer = mobileDrawerRef.current && mobileDrawerRef.current.contains(e.target);

      // Close desktop dropdown when clicking outside header
      if (!isInsideNavbar) {
        setActiveCategory(null);
        setIsPinnedByClick(false);
      }

      // Close mobile drawer when clicking outside drawer and navbar toggle
      if (mobileMenuOpen && !isInsideDrawer && !isInsideNavbar) {
        setMobileMenuOpen(false);
        setMobileExpandedCat(null);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveCategory(null);
        setIsPinnedByClick(false);
        setMobileMenuOpen(false);
        setMobileExpandedCat(null);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('touchstart', handleDocumentClick, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('touchstart', handleDocumentClick);
      window.removeEventListener('keydown', handleKeyDown);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [mobileMenuOpen]);

  // Auto-close drawer and reset state on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileExpandedCat(null);
    setActiveCategory(null);
    setIsPinnedByClick(false);
  }, [location.pathname, location.hash]);

  // Lock body scrolling when mobile drawer is open to prevent background scrolling
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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
    setMobileMenuOpen(false);
    setMobileExpandedCat(null);
    if (!path) return;

    if (path.includes('#')) {
      const [targetPath, hash] = path.split('#');
      const isCurrentPage = 
        (targetPath === '' && location.pathname === '/') || 
        location.pathname === targetPath ||
        (targetPath === '/' && location.pathname === '/');

      if (isCurrentPage) {
        const target = document.getElementById(hash) || document.querySelector(`#${hash}`);
        if (target) {
          const yOffset = -75;
          const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
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
    setMobileMenuOpen(false);
    setMobileExpandedCat(null);
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
                      className={`demo-aerokit-dropdown ${item.id === 'login' ? 'align-right' : 'align-center'}`}
                      onMouseEnter={handleMenuEnter}
                      onMouseLeave={handleMenuLeave}
                      role="region"
                      aria-label={`${item.label} submenu`}
                    >
                      <div className="demo-aerokit-notch" aria-hidden="true" />

                      {menuData.isComingSoon ? (
                        <div className="demo-aerokit-cs-content">
                          <span className="demo-aerokit-cs-badge">{menuData.categoryBadge || 'NISPL Enterprise'}</span>
                          <h4 className="demo-aerokit-cs-title">{menuData.title}</h4>
                          <p className="demo-aerokit-cs-sub">{menuData.subtitle}</p>
                          <p className="demo-aerokit-cs-desc">{menuData.message}</p>
                          <button
                            type="button"
                            className="demo-aerokit-cs-btn"
                            onClick={() => handleMenuItemClick(menuData.ctaPath || '/contact')}
                          >
                            <span>{menuData.ctaText || 'Contact Us'}</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          {menuData.categoryBadge && (
                            <div className="demo-aerokit-header">
                              <span className="demo-aerokit-chip-tag">{menuData.categoryBadge}</span>
                              <span className="demo-aerokit-header-title">{menuData.title}</span>
                            </div>
                          )}

                          <div className="demo-aerokit-list">
                            {menuData.links?.map((link) => {
                              const IconComp = 
                                link.icon === 'Award' ? Award : 
                                link.icon === 'Sparkles' ? Sparkles : 
                                link.icon === 'Server' ? Server :
                                link.icon === 'Shield' ? Shield :
                                link.icon === 'Lock' ? Lock :
                                link.icon === 'Cloud' ? Cloud :
                                Users;

                              return (
                                <button
                                  key={link.id}
                                  type="button"
                                  className="demo-aerokit-item"
                                  onClick={() => handleMenuItemClick(link.path)}
                                >
                                  <div className="demo-aerokit-icon-wrap">
                                    <IconComp size={18} />
                                  </div>
                                  <div className="demo-aerokit-content">
                                    <span className="demo-aerokit-title">{link.label}</span>
                                    <span className="demo-aerokit-desc">{link.desc}</span>
                                  </div>
                                  <ChevronRight size={15} className="demo-aerokit-arrow" />
                                </button>
                              );
                            })}
                          </div>

                          {menuData.footer && (
                            <div className="demo-aerokit-footer">
                              <span className="demo-aerokit-footer-text">{menuData.footer.text}</span>
                              <button
                                type="button"
                                className="demo-aerokit-footer-link"
                                onClick={() => handleMenuItemClick(menuData.footer.path)}
                              >
                                <span>{menuData.footer.linkText}</span>
                                <ChevronRight size={13} />
                              </button>
                            </div>
                          )}
                        </>
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
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (mobileMenuOpen) setMobileExpandedCat(null);
              }}
              aria-label="Toggle Navigation"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="demo-mobile-backdrop open"
          onClick={() => {
            setMobileMenuOpen(false);
            setMobileExpandedCat(null);
          }}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Navigation */}
      <div 
        ref={mobileDrawerRef} 
        className={`demo-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}
        role="dialog"
        aria-label="Mobile Navigation Menu"
      >
        <div className="demo-mobile-drawer-inner">
          {NAV_ITEMS.map((item) => {
            const hasDropdown = Boolean(MEGA_MENU_CONFIG[item.id]);
            const isExpanded = mobileExpandedCat === item.id;
            const menuData = MEGA_MENU_CONFIG[item.id];
            const isCurrentPage = location.pathname === item.path;

            return (
              <div key={item.id} className="demo-mobile-item-wrap">
                <button
                  type="button"
                  className={`demo-mobile-nav-link ${isCurrentPage ? 'active-page' : ''} ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => {
                    if (hasDropdown) {
                      setMobileExpandedCat(isExpanded ? null : item.id);
                    } else if (item.path) {
                      setMobileMenuOpen(false);
                      setMobileExpandedCat(null);
                      navigate(item.path);
                    }
                  }}
                  aria-expanded={hasDropdown ? isExpanded : undefined}
                >
                  <span className="demo-mobile-label">{item.label}</span>
                  {hasDropdown ? (
                    <ChevronDown size={16} className={`demo-mobile-chevron ${isExpanded ? 'rotated' : ''}`} />
                  ) : (
                    <ArrowRight size={14} className="demo-mobile-direct-arrow" />
                  )}
                </button>

                {hasDropdown && isExpanded && menuData && (
                  <div className="demo-mobile-sub-list animate-fade-in">
                    {menuData.isComingSoon ? (
                      <div className="demo-mobile-cs-box">
                        <span className="demo-mobile-cs-badge">{menuData.categoryBadge || 'Coming Soon'}</span>
                        <p className="demo-mobile-cs-text">
                          {menuData.message || 'Please check back soon.'}
                        </p>
                        <button
                          type="button"
                          className="demo-mobile-cs-btn"
                          onClick={() => handleMenuItemClick(menuData.ctaPath || '/contact')}
                        >
                          <span>{menuData.ctaText || 'Inquire With NISPL'}</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Direct Section/Page Overview Link */}
                        {item.path && (
                          <button
                            type="button"
                            className="demo-mobile-sub-link demo-mobile-sub-overview"
                            onClick={() => handleMenuItemClick(item.path)}
                          >
                            <span className="demo-mobile-sub-title">Overview • All {item.label}</span>
                            <ArrowRight size={13} />
                          </button>
                        )}

                        {menuData.links?.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            className="demo-mobile-sub-link"
                            onClick={() => handleMenuItemClick(sub.path)}
                          >
                            <div className="demo-mobile-sub-content">
                              <span className="demo-mobile-sub-title">{sub.label}</span>
                              {sub.desc && (
                                <span className="demo-mobile-sub-desc">{sub.desc}</span>
                              )}
                            </div>
                            <ChevronRight size={14} className="demo-mobile-sub-arrow" />
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <button 
            type="button" 
            className="demo-contact-pill-btn demo-mobile-contact-btn"
            onClick={handleContactClick}
          >
            Contact Us
          </button>
        </div>
      </div>
    </>
  );
}
