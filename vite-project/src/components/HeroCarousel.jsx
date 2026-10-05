import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Receipt, 
  ShieldCheck, 
  Boxes, 
  BarChart3, 
  PieChart, 
  IndianRupee,
  Layers,
  FileCheck,
  Building,
  BellRing
} from 'lucide-react';
import './HeroCarousel.css';

export default function HeroCarousel({ 
  onExploreNIS, 
  onExploreAccounting, 
  onManageInventory, 
  onViewReports, 
  onBookDemo 
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const slides = [
    {
      id: 1,
      badge: "ENTERPRISE ACCREDITED ERP",
      headline: "Smart Accounting.\nPowerful Business.",
      subheading: "Manage your accounts, inventory, sales and business operations from one intelligent platform.",
      supporting: "Everything your business needs to stay organized, profitable and in control.",
      ctaText: "Explore NIS",
      ctaAction: onExploreNIS,
      secondaryCtaText: "Book a Free Demo",
      secondaryCtaAction: onBookDemo,
      themeClass: "hero-slide-theme-blue",
      visualType: "general",
    },
    {
      id: 2,
      badge: "GST READY & TALLY COMPATIBLE",
      headline: "Complete Accounting,\nMade Simple.",
      subheading: "Powerful accounting tools designed for modern businesses.",
      features: [
        "Sales & Purchase",
        "GST & Tax Management",
        "Ledgers",
        "Receivables & Payables",
        "Automated Reports",
      ],
      ctaText: "Explore Accounting",
      ctaAction: onExploreAccounting,
      secondaryCtaText: "Book a Free Demo",
      secondaryCtaAction: onBookDemo,
      themeClass: "hero-slide-theme-indigo",
      visualType: "accounting",
    },
    {
      id: 3,
      badge: "REAL-TIME LOGISTICS & WAREHOUSING",
      headline: "Inventory Under Control.",
      subheading: "Track stock, products, warehouses and inventory movement in real time.",
      features: [
        "Stock Management",
        "Multi-Warehouse",
        "Low Stock Alerts",
        "Product Management",
        "Stock Reports",
      ],
      ctaText: "Manage Inventory",
      ctaAction: onManageInventory,
      secondaryCtaText: "Book a Free Demo",
      secondaryCtaAction: onBookDemo,
      themeClass: "hero-slide-theme-purple",
      visualType: "inventory",
    },
    {
      id: 4,
      badge: "EXECUTIVE FINANCIAL INTELLIGENCE",
      headline: "Business Insights\nThat Drive Growth.",
      subheading: "Turn your business data into clear, actionable decisions.",
      features: [
        "Profit & Loss",
        "Balance Sheet",
        "Sales Analytics",
        "Expense Analytics",
        "Business Dashboard",
      ],
      ctaText: "View Reports",
      ctaAction: onViewReports,
      secondaryCtaText: "Book a Free Demo",
      secondaryCtaAction: onBookDemo,
      themeClass: "hero-slide-theme-magenta",
      visualType: "reports",
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // CRITICAL REQUIREMENT: Automatic timer advances every exactly 5000ms
  // Pauses on hover, resets upon manual navigation, cleans up on unmount
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, currentSlide, slides.length]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide]);

  // Touch & Swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <section 
      id="hero-section" 
      className="nis-hero-carousel-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Net Infotech System Highlights"
    >
      {/* Background Ambience & Gradient Orbs */}
      <div className="nis-hero-ambient-layer">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-grid-overlay" />
      </div>

      {/* Slides Container */}
      <div className="nis-hero-slides">
        {slides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div 
              key={slide.id} 
              className={`nis-hero-slide ${isActive ? 'active' : ''} ${slide.themeClass}`}
              aria-hidden={!isActive}
            >
              <div className="container nis-hero-content-container">
                
                {/* LEFT CONTENT COLUMN */}
                <div className="nis-hero-text-col">
                  {/* Badge */}
                  <div className="nis-hero-badge animate-fade-in">
                    <Sparkles size={14} className="badge-sparkle" />
                    <span>{slide.badge}</span>
                  </div>

                  {/* Headline */}
                  <h1 className="nis-hero-headline">
                    {slide.headline.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {i === 1 ? (
                          <span className="nis-hero-highlight">{line}</span>
                        ) : (
                          <span>{line}</span>
                        )}
                        <br />
                      </React.Fragment>
                    ))}
                  </h1>

                  {/* Subheading */}
                  <p className="nis-hero-subheading">{slide.subheading}</p>

                  {/* Supporting text or feature checklist */}
                  {slide.supporting && (
                    <p className="nis-hero-supporting">{slide.supporting}</p>
                  )}

                  {slide.features && (
                    <ul className="nis-hero-feature-list">
                      {slide.features.map((feat, fIdx) => (
                        <li key={fIdx} className="nis-hero-feature-item">
                          <CheckCircle2 size={18} className="feat-check-icon" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* CTA Buttons */}
                  <div className="nis-hero-actions">
                    <button 
                      type="button" 
                      className="nis-hero-primary-btn"
                      onClick={slide.ctaAction}
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight size={18} />
                    </button>

                    {slide.secondaryCtaText && (
                      <button 
                        type="button" 
                        className="nis-hero-secondary-btn"
                        onClick={slide.secondaryCtaAction}
                      >
                        <Sparkles size={16} />
                        <span>{slide.secondaryCtaText}</span>
                      </button>
                    )}
                  </div>

                  {/* Quick Trust Bar */}
                  <div className="nis-hero-trust-bar">
                    <div className="trust-item">
                      <ShieldCheck size={16} className="trust-icon" />
                      <span>100% GST & e-Way Compliant</span>
                    </div>
                    <div className="trust-divider" />
                    <div className="trust-item">
                      <IndianRupee size={16} className="trust-icon" />
                      <span>Indian Rupee & Multi-Currency</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT VISUAL COMPOSITION COLUMN */}
                <div className="nis-hero-visual-col">
                  {/* Dynamic Visual depending on slide */}
                  {slide.visualType === 'general' && (
                    <div className="visual-composition visual-general">
                      {/* Central Live ERP Dashboard Preview Card */}
                      <div className="hero-card hero-card-main animate-float">
                        <div className="hero-card-header">
                          <div className="card-header-badge">
                            <span className="live-dot" />
                            <span>NIS LIVE ERP v4.2</span>
                          </div>
                          <span className="card-date">FY 2026-27</span>
                        </div>
                        <div className="hero-stat-row">
                          <div className="hero-stat-box">
                            <span className="stat-label">Net Sales</span>
                            <span className="stat-val text-primary">₹12,45,000</span>
                            <span className="stat-growth text-success"><TrendingUp size={12} /> +14.8%</span>
                          </div>
                          <div className="hero-stat-box">
                            <span className="stat-label">GST Input Credit</span>
                            <span className="stat-val text-accent">₹94,200</span>
                            <span className="stat-sub">100% Matched</span>
                          </div>
                        </div>

                        {/* Mini Bar Graph preview */}
                        <div className="hero-mini-chart">
                          <div className="chart-bar-group">
                            <div className="bar-fill" style={{ height: '45%' }} />
                            <span>Mon</span>
                          </div>
                          <div className="chart-bar-group">
                            <div className="bar-fill" style={{ height: '65%' }} />
                            <span>Tue</span>
                          </div>
                          <div className="chart-bar-group">
                            <div className="bar-fill" style={{ height: '52%' }} />
                            <span>Wed</span>
                          </div>
                          <div className="chart-bar-group">
                            <div className="bar-fill" style={{ height: '80%' }} />
                            <span>Thu</span>
                          </div>
                          <div className="chart-bar-group highlight">
                            <div className="bar-fill" style={{ height: '95%' }} />
                            <span>Fri</span>
                          </div>
                          <div className="chart-bar-group">
                            <div className="bar-fill" style={{ height: '70%' }} />
                            <span>Sat</span>
                          </div>
                        </div>
                      </div>

                      {/* Floating Card 1: Bank Balance */}
                      <div className="hero-floating-card floating-bank glass-panel-dark">
                        <div className="floating-icon-wrap bg-blue">
                          <Building size={18} />
                        </div>
                        <div>
                          <span className="floating-title">Bank Balance</span>
                          <span className="floating-value">₹8,45,000</span>
                          <span className="floating-sub text-success">HDFC + SBI Reconciled</span>
                        </div>
                      </div>

                      {/* Floating Card 2: GST Ready Pill */}
                      <div className="hero-floating-card floating-gst glass-panel-dark">
                        <div className="floating-icon-wrap bg-magenta">
                          <FileCheck size={18} />
                        </div>
                        <div>
                          <span className="floating-title">GSTR-1 & 3B</span>
                          <span className="floating-value text-success">Auto-Generated</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {slide.visualType === 'accounting' && (
                    <div className="visual-composition visual-accounting">
                      <div className="hero-card hero-card-main animate-float">
                        <div className="hero-card-header">
                          <div className="card-header-badge">
                            <Receipt size={14} />
                            <span>TALLY-GRADE LEDGER</span>
                          </div>
                          <span className="badge badge-success">Double Entry Balanced</span>
                        </div>

                        <div className="ledger-preview-table">
                          <div className="ledger-header-row">
                            <span>Voucher</span>
                            <span>Particulars</span>
                            <span>Debit (₹)</span>
                            <span>Credit (₹)</span>
                          </div>
                          <div className="ledger-row">
                            <span className="code">SL-1024</span>
                            <span className="party">ABC Traders Sales</span>
                            <span className="dr">45,000</span>
                            <span>—</span>
                          </div>
                          <div className="ledger-row">
                            <span className="code">GST-OUT</span>
                            <span className="party">Output CGST (9%)</span>
                            <span>—</span>
                            <span className="cr">4,050</span>
                          </div>
                          <div className="ledger-row">
                            <span className="code">GST-OUT</span>
                            <span className="party">Output SGST (9%)</span>
                            <span>—</span>
                            <span className="cr">4,050</span>
                          </div>
                          <div className="ledger-row highlight">
                            <span className="code">TOT</span>
                            <span className="party">Net Receivable</span>
                            <span className="dr">₹53,100</span>
                            <span className="cr">₹53,100</span>
                          </div>
                        </div>

                        <div className="hero-card-footer">
                          <span>Real-time Day Book & Ledger Posting</span>
                          <span className="text-primary font-bold">1 Click e-Invoice</span>
                        </div>
                      </div>

                      <div className="hero-floating-card floating-gst glass-panel-dark">
                        <div className="floating-icon-wrap bg-green">
                          <CheckCircle2 size={18} />
                        </div>
                        <div>
                          <span className="floating-title">Receivables Tracking</span>
                          <span className="floating-value">₹3,45,000</span>
                          <span className="floating-sub">Automated WhatsApp Reminders</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {slide.visualType === 'inventory' && (
                    <div className="visual-composition visual-inventory">
                      <div className="hero-card hero-card-main animate-float">
                        <div className="hero-card-header">
                          <div className="card-header-badge">
                            <Boxes size={14} />
                            <span>STOCK MANAGEMENT HUB</span>
                          </div>
                          <span className="badge badge-primary">3 Warehouses Active</span>
                        </div>

                        <div className="inventory-visual-meter">
                          <div className="meter-label-row">
                            <span>Inventory Health</span>
                            <span className="font-bold text-success">94% Optimal</span>
                          </div>
                          <div className="meter-track">
                            <div className="meter-fill" style={{ width: '94%' }} />
                          </div>
                        </div>

                        <div className="stock-alert-list">
                          <div className="stock-item-pill">
                            <span className="stock-name">Enterprise Cloud Licenses</span>
                            <span className="stock-badge in-stock">85 In Stock</span>
                          </div>
                          <div className="stock-item-pill">
                            <span className="stock-name">Thermal Barcode Printers</span>
                            <span className="stock-badge in-stock">34 Units</span>
                          </div>
                          <div className="stock-item-pill alert">
                            <span className="stock-name">2D Wireless Barcode Scanners</span>
                            <span className="stock-badge low-stock">6 Units (Reorder)</span>
                          </div>
                        </div>
                      </div>

                      <div className="hero-floating-card floating-bank glass-panel-dark">
                        <div className="floating-icon-wrap bg-purple">
                          <BellRing size={18} />
                        </div>
                        <div>
                          <span className="floating-title">Auto-Reorder Point</span>
                          <span className="floating-value text-warning">Low Stock Alert</span>
                          <span className="floating-sub">PO generated automatically</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {slide.visualType === 'reports' && (
                    <div className="visual-composition visual-reports">
                      <div className="hero-card hero-card-main animate-float">
                        <div className="hero-card-header">
                          <div className="card-header-badge">
                            <BarChart3 size={14} />
                            <span>EXECUTIVE FINANCIAL INTELLIGENCE</span>
                          </div>
                          <span className="badge badge-magenta">FY26 Q3 Live</span>
                        </div>

                        <div className="reports-split-view">
                          <div className="report-metric-col">
                            <span className="rep-label">Gross Margin</span>
                            <span className="rep-val text-success">38.4%</span>
                            <span className="rep-sub">+4.2% vs Last Quarter</span>
                          </div>
                          <div className="report-metric-col">
                            <span className="rep-label">Net Profit (EBITDA)</span>
                            <span className="rep-val text-primary">₹3,01,000</span>
                            <span className="rep-sub">Tax Provision Set</span>
                          </div>
                        </div>

                        <div className="hero-report-bars">
                          <div className="rep-bar-row">
                            <span className="rep-cat">Sales Revenue</span>
                            <div className="rep-bar-track">
                              <div className="rep-bar-fill fill-blue" style={{ width: '88%' }} />
                            </div>
                            <span className="rep-amt">₹12.45L</span>
                          </div>
                          <div className="rep-bar-row">
                            <span className="rep-cat">Purchases</span>
                            <div className="rep-bar-track">
                              <div className="rep-bar-fill fill-purple" style={{ width: '58%' }} />
                            </div>
                            <span className="rep-amt">₹7.82L</span>
                          </div>
                          <div className="rep-bar-row">
                            <span className="rep-cat">Overheads</span>
                            <div className="rep-bar-track">
                              <div className="rep-bar-fill fill-magenta" style={{ width: '22%' }} />
                            </div>
                            <span className="rep-amt">₹1.62L</span>
                          </div>
                        </div>
                      </div>

                      <div className="hero-floating-card floating-gst glass-panel-dark">
                        <div className="floating-icon-wrap bg-magenta">
                          <PieChart size={18} />
                        </div>
                        <div>
                          <span className="floating-title">Balance Sheet</span>
                          <span className="floating-value">Auditor Approved</span>
                          <span className="floating-sub">Export to Excel / PDF</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* ARROWS (Previous / Next) */}
      <button 
        type="button" 
        className="nis-carousel-arrow nis-arrow-prev" 
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <ChevronLeft size={28} />
      </button>

      <button 
        type="button" 
        className="nis-carousel-arrow nis-arrow-next" 
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <ChevronRight size={28} />
      </button>

      {/* PAGINATION DOTS & PROGRESS BAR */}
      <div className="nis-carousel-dots" role="tablist">
        {slides.map((s, idx) => {
          const isActive = idx === currentSlide;
          return (
            <button
              key={s.id}
              type="button"
              className={`nis-dot ${isActive ? 'active' : ''}`}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}: ${s.headline.replace('\n', ' ')}`}
              aria-selected={isActive}
              role="tab"
            >
              <span className="dot-label">0{idx + 1}</span>
              <div className="dot-bar">
                {isActive && !isPaused && <div className="dot-bar-fill" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Slide Auto-timer status indicator */}
      <div className="nis-carousel-status">
        <span className="status-badge">
          {isPaused ? "Paused (Hover)" : "Auto-advance (5s)"}
        </span>
      </div>
    </section>
  );
}
