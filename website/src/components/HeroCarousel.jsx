import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, ArrowRight,
  Shield, Cloud, Server, Globe, Wrench, Lock, Monitor, Cpu,
  Database, Wifi, HardDrive, ShieldCheck, BarChart3, Package,
  FileText, Zap, Check, Award, Users, CheckCircle2
} from 'lucide-react';

/* ── Custom Banner Images ── */
import bgTallyPrime from '../assets/tally prime.png';
import bgTallyCloud from '../assets/Tally on cloud.png';
import bgItInfrastructure from '../assets/IT Infrastructure Management.png';
import bgCloudHosting from '../assets/Cloud Server Hosting.png';
import bgManagedIt from '../assets/Managed IT Services Hub.png';
import bgCyberSecurity from '../assets/Cybersecurity Solutions.png';
import bgMicrosoftLicensing from '../assets/Microsoft Licensing Solutions.png';

/* ── Custom Looping Video Banners ── */
import videoTallyPrime from '../assets/tallyprime_animated_5sec.mp4';
import videoTallyCloud from '../assets/tally_cloud_animated_5sec.mp4';
import videoCloudHosting from '../assets/cloud_hosting_professional_5sec.mp4';
import videoManagedIt from '../assets/managed_it_services_animated_5sec.mp4';
import videoCyberSecurity from '../assets/security_solutions_animated_5sec.mp4';
import videoMicrosoftLicensing from '../assets/microsoft_licensing_solutions_animated_5sec.mp4';
import AnimatedCounter from './AnimatedCounter';

import './HeroCarousel.css';

const slides = [
  {
    id: 1,
    title: 'TallyPrime',
    subtitle: 'Accounting & Business Management',
    description: 'Complete business accounting with GST compliance, inventory management, and advanced MIS reporting — trusted for over 26+ years.',
    perks: ['GST Ready & e-Invoicing', 'Inventory & Multi-Godown', 'Advanced MIS Financial Reports'],
    background: bgTallyPrime,
    video: videoTallyPrime,
    accentColor: '#0284C7',
    ctaText: 'Explore Tally Solutions',
    ctaPath: '/services/tally-prime',
    badge: 'Tally 3-Star Certified Partner',
    hasCustomImageRight: true,
  },
  {
    id: 2,
    title: 'Tally On Cloud',
    subtitle: 'Anywhere, Anytime Secure Access',
    description: 'Access your Tally data from any device with bank-grade encrypted cloud hosting. Zero setup time, instant connectivity.',
    perks: ['Any Device Remote Access', '256-Bit SSL Data Encryption', '99.9% Guaranteed Uptime'],
    background: bgTallyCloud,
    video: videoTallyCloud,
    accentColor: '#4F46E5',
    ctaText: 'Explore Cloud Tally',
    ctaPath: '/services/tally-on-cloud',
    badge: '256-Bit Encrypted Access',
    hasCustomImageRight: true,
  },
  {
    id: 3,
    title: 'IT Infrastructure Management',
    subtitle: 'End-to-End IT Setup & Operations',
    description: 'Complete IT infrastructure planning, deployment, and proactive management for maximum enterprise performance and reliability.',
    perks: ['Server & Network Setup', 'NOC 24/7 Monitoring', 'Annual Maintenance AMC'],
    background: bgItInfrastructure,
    accentColor: '#0D9488',
    ctaText: 'Explore IT Infrastructure',
    ctaPath: '/services/it-infra-security',
    badge: 'Enterprise NOC Operations',
    hasCustomImageRight: true,
  },
  {
    id: 4,
    title: 'Cloud Server & Hosting',
    subtitle: 'Scalable Cloud Infrastructure',
    description: 'Enterprise-grade cloud servers, website hosting, and hybrid cloud solutions engineered on Microsoft Azure & AWS.',
    perks: ['Multi-Cloud Azure & AWS', 'High-Speed SSD Storage', 'DDoS Shield Included'],
    background: bgCloudHosting,
    video: videoCloudHosting,
    accentColor: '#0284C7',
    ctaText: 'Explore Cloud Hosting',
    ctaPath: '/services/data-center-cloud',
    badge: 'Tier-4 Multi-Cloud Infrastructure',
    hasCustomImageRight: true,
  },
  {
    id: 5,
    title: 'Managed IT Services',
    subtitle: 'Proactive IT Support & AMC',
    description: 'Comprehensive managed IT with 24/7 proactive monitoring, expert helpdesk, and rapid annual maintenance support.',
    perks: ['Dedicated IT Helpdesk', 'Proactive Health Checks', 'Rapid On-Site Support'],
    background: bgManagedIt,
    video: videoManagedIt,
    accentColor: '#059669',
    ctaText: 'Explore Managed IT',
    ctaPath: '/services/it-infra-security',
    badge: 'Proactive 24/7 Monitoring',
    hasCustomImageRight: true,
  },
  {
    id: 6,
    title: 'Cyber Security Solutions',
    subtitle: 'Protect. Detect. Respond.',
    description: 'End-to-end cybersecurity with next-gen firewall, endpoint protection, and real-time SOC threat intelligence.',
    perks: ['Next-Gen UTM Firewall', 'Endpoint EDR Shield', 'ISO 27001 Certified SOC'],
    background: bgCyberSecurity,
    video: videoCyberSecurity,
    accentColor: '#D97706',
    ctaText: 'Explore Cyber Security',
    ctaPath: '/services/it-infra-security',
    badge: 'Enterprise Threat Defense',
    hasCustomImageRight: true,
  },
  {
    id: 7,
    title: 'Microsoft Licensing Solutions',
    subtitle: 'Authorized Microsoft Partner',
    description: 'Genuine Microsoft 365, Windows Server, Azure and enterprise software licensing at best-in-class pricing.',
    perks: ['Microsoft 365 Enterprise', 'Windows Server & SQL', 'License Management & Deployment'],
    background: bgMicrosoftLicensing,
    video: videoMicrosoftLicensing,
    accentColor: '#2563EB',
    ctaText: 'Explore Microsoft Solutions',
    ctaPath: '/services/it-infra-security',
    badge: 'Authorized Microsoft Reseller',
    hasCustomImageRight: true,
  },
];

export default function HeroCarousel({ onBookDemo }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const navigate = useNavigate();
  const videoRefs = useRef({});

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

  const nextSlide = useCallback(() => setCurrentSlide((p) => (p + 1) % slides.length), []);
  const prevSlide = useCallback(() => setCurrentSlide((p) => (p - 1 + slides.length) % slides.length), []);

  // Manage video playback cleanly across slides
  useEffect(() => {
    slides.forEach((s, idx) => {
      const vid = videoRefs.current[idx];
      if (vid) {
        if (idx === currentSlide) {
          vid.muted = true;
          vid.currentTime = 0;
          const p = vid.play();
          if (p !== undefined) p.catch(() => {});
        } else {
          vid.pause();
        }
      }
    });
  }, [currentSlide]);

  useEffect(() => {
    if (isPaused) return;
    // Allow 5-second videos to complete full cycle before auto-advancing
    const duration = slides[currentSlide]?.video ? 6000 : 4000;
    const t = setInterval(() => setCurrentSlide((p) => (p + 1) % slides.length), duration);
    return () => clearInterval(t);
  }, [isPaused, currentSlide]);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 60) nextSlide();
    if (touchStartX.current - touchEndX.current < -60) prevSlide();
  };

  const slide = slides[currentSlide];

  return (
    <div className="nis-hero-carousel-container">
      <section
        className="nis-hero-carousel-wrapper"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-label="Net Infotech System Solutions Showcase"
      >
        {/* Dynamic Ambient Background Glows */}
        <div 
          className="nis-slide-ambient-glow nis-glow-left"
          style={{ background: `radial-gradient(circle, ${slide.accentColor}35 0%, transparent 70%)` }}
        />
        <div 
          className="nis-slide-ambient-glow nis-glow-right"
          style={{ background: `radial-gradient(circle, ${slide.accentColor}30 0%, transparent 70%)` }}
        />

        {/* ── Background media layers (Images & Seamless Looping Videos) ── */}
        {slides.map((s, idx) => (
          <div
            key={s.id}
            className={`nis-slide-full ${idx === currentSlide ? 'nis-slide-active' : ''} ${s.video ? 'nis-slide-has-video' : ''}`}
            aria-hidden={idx !== currentSlide}
          >
            {s.video ? (
              <video
                ref={(el) => {
                  if (el) videoRefs.current[idx] = el;
                }}
                src={s.video}
                poster={s.background}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="nis-slide-bg-video"
              />
            ) : (
              <img
                src={s.background}
                alt=""
                className="nis-slide-bg-img"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            )}
            <div className="nis-slide-overlay" />
          </div>
        ))}

        {/* ── Content layer ── */}
        <div className="nis-slide-content-layer">
          <div className="container nis-slide-inner">

            {/* LEFT: Direct Text Content (Zero white card background box) */}
            <div className="nis-slide-left" key={slide.id}>
              {/* Badge */}
              <div
                className="nis-slide-badge"
                style={{ 
                  borderColor: `${slide.accentColor}40`, 
                  color: slide.accentColor,
                  background: `${slide.accentColor}12`,
                  boxShadow: `0 4px 16px ${slide.accentColor}15`
                }}
              >
                <ShieldCheck size={16} />
                <span>{slide.badge}</span>
              </div>

              {/* Title & Subtitle */}
              <h1 className="nis-slide-title">{slide.title}</h1>
              <p className="nis-slide-subtitle" style={{ color: slide.accentColor }}>{slide.subtitle}</p>

              {/* Description */}
              <p className="nis-slide-desc">{slide.description}</p>

              {/* Perks / Key Feature Chips */}
              <div className="nis-slide-perks">
                {slide.perks.map((perk, pIdx) => (
                  <div className="nis-slide-perk-item" key={pIdx}>
                    <div 
                      className="nis-perk-icon"
                      style={{ background: `${slide.accentColor}18`, color: slide.accentColor }}
                    >
                      <Check size={13} strokeWidth={3} />
                    </div>
                    <span>{perk}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="nis-slide-actions">
                <button
                  type="button"
                  className="nis-slide-primary-btn"
                  style={{ 
                    background: `linear-gradient(135deg, ${slide.accentColor} 0%, #1D4ED8 100%)`,
                    boxShadow: `0 10px 25px -4px ${slide.accentColor}50` 
                  }}
                  onClick={() => handleNavigate(slide.ctaPath)}
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  className="nis-slide-secondary-btn"
                  onClick={onBookDemo}
                >
                  Get a Quote
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ── Carousel Arrows ── */}
        <button
          type="button"
          className="nis-carousel-arrow nis-arrow-prev"
          onClick={prevSlide}
          aria-label="Previous Slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          type="button"
          className="nis-carousel-arrow nis-arrow-next"
          onClick={nextSlide}
          aria-label="Next Slide"
        >
          <ChevronRight size={24} />
        </button>

        {/* ── Dots ── */}
        <div className="nis-carousel-dots">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              className={`nis-dot ${idx === currentSlide ? 'nis-dot-active' : ''}`}
              style={idx === currentSlide ? { background: slide.accentColor } : {}}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ── Integrated Hero Stats Bar (Positioned overlay on desktop, moved below slide on mobile right before Trusted Partners) ── */}
      <div className="nis-hero-stats-overlay">
        <div className="container">
          <div className="nis-hero-stats-grid">
            <div className="nis-hero-stat-item">
              <div className="nis-hero-stat-icon"><Award size={18} /></div>
              <div className="nis-hero-stat-text">
                <strong><AnimatedCounter value="25+" duration={1800} /> Years</strong>
                <span>of Excellence</span>
              </div>
            </div>

            <div className="nis-hero-stat-item">
              <div className="nis-hero-stat-icon"><Users size={18} /></div>
              <div className="nis-hero-stat-text">
                <strong><AnimatedCounter value="500+" duration={2000} /></strong>
                <span>Happy Clients</span>
              </div>
            </div>

            <div className="nis-hero-stat-item">
              <div className="nis-hero-stat-icon"><CheckCircle2 size={18} /></div>
              <div className="nis-hero-stat-text">
                <strong><AnimatedCounter value="1000+" duration={2200} /></strong>
                <span>Projects Delivered</span>
              </div>
            </div>

            <div className="nis-hero-stat-item">
              <div className="nis-hero-stat-icon"><ShieldCheck size={18} /></div>
              <div className="nis-hero-stat-text">
                <strong><AnimatedCounter value="99%" duration={1800} /></strong>
                <span>Client Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
