import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  IndianRupee 
} from 'lucide-react';

import bannerTallyPrime from '../assets/banner-tally-prime.jpg';
import bannerTallyCloud from '../assets/banner-tally-cloud.jpg';
import bannerCloudHosting from '../assets/banner-cloud-hosting.jpg';
import bannerItInfrastructure from '../assets/banner-it-infrastructure.jpg';
import bannerItRepair from '../assets/banner-it-repair.jpg';
import bannerItRental from '../assets/banner-it-rental.jpg';

import './HeroCarousel.css';

export default function HeroCarousel({ onBookDemo }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    if (path.includes('#')) {
      const [route, hash] = path.split('#');
      navigate(route);
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      navigate(path);
    }
  };

  const slides = [
    {
      id: 1,
      badge: "TALLY 3-STAR CERTIFIED PARTNER • 26+ YEARS OF EXCELLENCE",
      headline: "TallyPrime Licensing &\nBusiness Solutions.",
      subheading: "Accounting, GST, inventory management, billing, business reporting - comprehensive TallyPrime solutions.",
      features: [
        "Official TallyPrime licensing & version upgrades",
        "GST & e-Way bill automated setup & filing",
        "Multi-warehouse inventory & barcode billing",
        "Business MIS reporting, training & support",
      ],
      ctaText: "Explore Tally Solutions",
      ctaPath: "/services/tally-prime",
      secondaryCtaText: "Get a Quote",
      themeClass: "hero-slide-theme-blue",
      image: bannerTallyPrime,
      imageAlt: "TallyPrime Accounting, GST & Business Software",
      floatingTag: "Official Tally 3-Star Partner",
    },
    {
      id: 2,
      badge: "ANYWHERE SECURE ACCESS • HIGH-SPEED CLOUD HOSTING",
      headline: "Tally on Cloud -\nAnywhere, Anytime Access.",
      subheading: "Anywhere access - cloud-based Tally hosting solutions with high-speed remote desktop.",
      features: [
        "Seamless multi-device Tally on Cloud setup",
        "Bank-grade 256-bit encrypted remote access",
        "High-speed dedicated cloud server management",
        "Automated daily backups & 24/7 technical support",
      ],
      ctaText: "Explore Cloud Tally",
      ctaPath: "/services/tally-on-cloud",
      secondaryCtaText: "Get a Quote",
      themeClass: "hero-slide-theme-indigo",
      image: bannerTallyCloud,
      imageAlt: "Tally on Cloud Remote Hosting Solutions",
      floatingTag: "256-Bit Encrypted Cloud Access",
    },
    {
      id: 3,
      badge: "DATA CENTER, CLOUD SERVER & HOSTING",
      headline: "Cloud Infrastructure &\nEnterprise Hosting.",
      subheading: "Business applications, websites workloads - cloud infrastructure & hosting solutions.",
      features: [
        "High-performance dedicated cloud server deployment",
        "Enterprise Windows and Linux server hosting",
        "Microsoft Azure & AWS hybrid cloud architecture",
        "Zero-downtime cloud migration & pro-active 24/7 monitoring",
      ],
      ctaText: "Explore Cloud Hosting",
      ctaPath: "/services/data-center-cloud",
      secondaryCtaText: "Get a Quote",
      themeClass: "hero-slide-theme-purple",
      image: bannerCloudHosting,
      imageAlt: "Tier-4 Enterprise Data Center & Cloud Hosting",
      floatingTag: "Tier-4 Multi-Cloud Infrastructure",
    },
    {
      id: 4,
      badge: "END-TO-END IT NETWORKING & CYBERSECURITY",
      headline: "Business IT Infrastructure\n& Security Solutions.",
      subheading: "Business IT infrastructure - setup, management, monitoring & protection for complete business continuity.",
      features: [
        "Enterprise server and network management",
        "Next-Gen UTM firewall and endpoint security",
        "High-definition CCTV and structured Wi-Fi solutions",
        "Microsoft 365 licensing & comprehensive IT AMC",
      ],
      ctaText: "Explore IT Infrastructure",
      ctaPath: "/services/it-infra-security",
      secondaryCtaText: "Get a Quote",
      themeClass: "hero-slide-theme-cyan",
      image: bannerItInfrastructure,
      imageAlt: "Corporate NOC & Cybersecurity Infrastructure",
      floatingTag: "Enterprise NOC & Threat Defense",
    },
    {
      id: 5,
      badge: "CHIP-LEVEL DIAGNOSTICS & MULTI-BRAND REPAIR",
      headline: "IT Product Repair &\nPreventive Maintenance.",
      subheading: "Desktop, laptop, printer, server & hardware troubleshooting and precision repair.",
      features: [
        "Chip-level motherboard repair & diagnostics",
        "Enterprise server, laser printer & scanner servicing",
        "Data recovery & emergency hardware restoration",
        "Comprehensive IT AMC contracts & certified lab engineers",
      ],
      ctaText: "Explore Repair Services",
      ctaPath: "/services/it-repair-maintenance",
      secondaryCtaText: "Get a Quote",
      themeClass: "hero-slide-theme-emerald",
      image: bannerItRepair,
      imageAlt: "Professional IT Hardware Repair & Maintenance Lab",
      floatingTag: "Certified Chip-Level Engineers",
    },
    {
      id: 6,
      badge: "FLEXIBLE PROCUREMENT & HARDWARE RENTAL FLEETS",
      headline: "IT Product Sales &\nCorporate Rental Solutions.",
      subheading: "Laptop, desktop, server & networking equipment rental & procurement with flexible terms.",
      features: [
        "Short & long-term commercial laptop & desktop rentals",
        "High-performance workstation & rack server leasing",
        "Cisco, HP, Dell & Lenovo hardware procurement",
        "Pre-configured deployment with full warranty & onsite support",
      ],
      ctaText: "Explore Sales & Rentals",
      ctaPath: "/services/it-sales-rental",
      secondaryCtaText: "Get a Quote",
      themeClass: "hero-slide-theme-amber",
      image: bannerItRental,
      imageAlt: "Enterprise IT Hardware Showroom & Rental Depots",
      floatingTag: "Flexible IT Hardware Rental Fleets",
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

  // Automatic timer advances every 5000ms, pauses on hover
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, currentSlide, slides.length]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 60) {
      nextSlide();
    }
    if (touchStartX.current - touchEndX.current < -60) {
      prevSlide();
    }
  };

  return (
    <section 
      className="nis-hero-carousel-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Net Infotech System Solutions Showcase"
    >
      {/* Ambient Atmospheric Glow Layer */}
      <div className="nis-hero-ambient-layer">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-grid-overlay" />
      </div>

      {/* Slide Deck */}
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
                    <ShieldCheck size={14} className="badge-shield" />
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

                  {/* Feature checklist */}
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
                      onClick={() => handleNavigate(slide.ctaPath)}
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight size={18} />
                    </button>

                    {slide.secondaryCtaText && (
                      <button 
                        type="button" 
                        className="nis-hero-secondary-btn"
                        onClick={onBookDemo}
                      >
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
                  <div className="hero-banner-image-showcase">
                    <div className="banner-image-frame">
                      <img 
                        src={slide.image} 
                        alt={slide.imageAlt || slide.headline} 
                        className="banner-hero-img" 
                        loading={idx === 0 ? "eager" : "lazy"}
                      />
                      
                      {/* Contextual caption badge on image */}
                      {slide.floatingTag && (
                        <div className="banner-floating-tag">
                          <span>{slide.floatingTag}</span>
                        </div>
                      )}
                    </div>
                  </div>
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

     

    </section>
  );
}
