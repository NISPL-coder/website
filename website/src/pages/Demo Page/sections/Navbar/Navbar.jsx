import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronDown, 
  Menu, 
  X, 
  ArrowRight,
  Users
} from 'lucide-react';
import logoImg from '../../../../assets/Net Infotech Transparent Logo.webp';
import { NAV_ITEMS, MEGA_MENU_CONFIG } from './megaMenuData';


export default function Navbar({ onOpenContact, onOpenConsultation }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubItemMap, setActiveSubItemMap] = useState({});
  const menuTimeoutRef = useRef(null);

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
    if (!activeSubItemMap[catId] && MEGA_MENU_CONFIG[catId]?.items?.length) {
      setActiveSubItemMap((prev) => ({
        ...prev,
        [catId]: MEGA_MENU_CONFIG[catId].items?.[0]?.id
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
      <header className={`demo-header-wrapper ${isScrolled ? 'scrolled' : ''}`}>
        
        {/* Floating Pill Nav Bar */}
        <nav className="demo-pill-navbar" aria-label="Main Navigation">
          {/* Brand Logo (Left) */}
          <Link to="/" className="demo-brand" title="Net Infotech System Pvt. Ltd.">
            <div className="demo-brand-logo-frame">
              <img 
                src="/logo.webp" 
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
          MEGA_MENU_CONFIG[activeCategory].isComingSoon ? (
            <div 
              key={activeCategory}
              className="demo-nomad-dropdown-card demo-cs-dropdown-card font-w-400"
              onMouseEnter={handleMenuContainerEnter}
              onMouseLeave={handleMenuContainerLeave}
            >
              <span className="demo-cs-wip-title">Work in progress...</span>
              <p className="demo-cs-wip-sub">Please check back soon.</p>
            </div>
          ) : (
            <div 
              key={activeCategory}
              className={`demo-nomad-dropdown-card demo-nomad-cols-${MEGA_MENU_CONFIG[activeCategory].columns.length}`}
              onMouseEnter={handleMenuContainerEnter}
              onMouseLeave={handleMenuContainerLeave}
            >
              <div 
                className="demo-nomad-grid"
                style={{
                  gridTemplateColumns: `repeat(${MEGA_MENU_CONFIG[activeCategory].columns.length}, minmax(0, 1fr))`
                }}
              >
                {MEGA_MENU_CONFIG[activeCategory].columns.map((column) => (
                  <div key={column.id} className="demo-nomad-column demo-tree-column">
                    {/* Top Tree Header: "Work Culture" */}
                    <div 
                      className="demo-tree-root-header"
                      onClick={() => handleMenuItemClick(column.path)}
                      role="button"
                      tabIndex={0}
                    >
                     
                      <div className="demo-tree-root-info">
                        <h3 className="demo-tree-root-title">{column.title}</h3>
                        <span className="demo-tree-root-sub">Life &amp; People at NISPL</span>
                      </div>
                      
                    </div>

                    {/* Tree Hierarchy Structure with proper connecting arrow lines */}
                    <div className="demo-tree-hierarchy" role="tree">
                      <div className="demo-tree-stem-line" aria-hidden="true" />

                      <ul className="demo-tree-links-list">
                        {column.links.map((link, lIdx) => (
                          <li key={lIdx} className="demo-tree-link-item">
                            {/* Branch connector arm with arrow marker */}
                            <div className="demo-tree-branch-arm" aria-hidden="true">
                              <span className="demo-tree-branch-line" />
                              <svg 
                                className="demo-tree-branch-arrow" 
                                viewBox="0 0 8 10" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path 
                                  d="M1.5 1.5L6.5 5L1.5 8.5" 
                                  stroke="currentColor" 
                                  strokeWidth="1.6" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                />
                              </svg>
                            </div>

                            <button
                              type="button"
                              className="demo-tree-link-btn"
                              onClick={() => handleMenuItemClick(link.path)}
                            >
                              <span className="demo-tree-link-text">{link.label}</span>
                              {link.badge && (
                                <span className={`demo-nomad-badge badge-${link.badge.toLowerCase()}`}>
                                  {link.badge}
                                </span>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
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
                  {MEGA_MENU_CONFIG[item.id].isComingSoon ? (
                    <div className="demo-mobile-cs-box">
                      <span className="demo-mobile-cs-badge">Work in progress...</span>
                      <p className="demo-mobile-cs-text">
                        Please check back soon.
                      </p>
                    </div>
                  ) : (
                    MEGA_MENU_CONFIG[item.id].items.map((sub) => (
                      <a
                        key={sub.id}
                        href={sub.path}
                        className="demo-mobile-sub-link"
                        onClick={(e) => {
                          setMobileMenuOpen(false);
                          if (sub.path.includes('#')) {
                            e.preventDefault();
                            const [targetPath, hash] = sub.path.split('#');
                            if (targetPath && targetPath !== location.pathname) {
                              navigate(sub.path);
                            } else {
                              const target = document.getElementById(hash) || document.querySelector(`#${hash}`);
                              if (target) target.scrollIntoView({ behavior: 'smooth' });
                            }
                          }
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
