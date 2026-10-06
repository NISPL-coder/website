import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, ArrowRight,
  Shield, Cloud, Server, Globe, Wrench, Lock, Monitor, Cpu,
  Database, Wifi, HardDrive, ShieldCheck, BarChart3, Package,
  FileText, Zap, CheckCircle,
} from 'lucide-react';

import bgTallyPrime from '../assets/bg-tally-prime.jpg';
import bgTallyCloud from '../assets/bg-tally-cloud.jpg';
import bgItInfrastructure from '../assets/bg-it-infrastructure.jpg';
import bgCloudHosting from '../assets/bg-cloud-hosting.jpg';
import bgManagedIt from '../assets/bg-managed-it.jpg';
import bgCyberSecurity from '../assets/bg-cyber-security.jpg';
import bgMicrosoftLicensing from '../assets/bg-microsoft-licensing.jpg';

import './HeroCarousel.css';

const slides = [
  {
    id: 1,
    title: 'TallyPrime',
    subtitle: 'Accounting & Business Management',
    description: 'Complete business accounting with GST compliance, inventory management, and advanced MIS reporting — trusted by 26+ years.',
    background: bgTallyPrime,
    accentColor: '#0EA5E9',
    ctaText: 'Explore Tally Solutions',
    ctaPath: '/services/tally-prime',
    badge: 'Tally 3-Star Certified Partner',
    centerLabel: 'Tally\nPrime',
    centerIcon: BarChart3,
    orbitItems: [
      { icon: BarChart3, label: 'Accounting', angle: 0 },
      { icon: FileText, label: 'GST Filing', angle: 51.4 },
      { icon: Package, label: 'Inventory', angle: 102.8 },
      { icon: Zap, label: 'Payroll', angle: 154.2 },
      { icon: Database, label: 'MIS Reports', angle: 205.7 },
      { icon: ShieldCheck, label: 'e-Way Bill', angle: 257.1 },
      { icon: Globe, label: 'Multi-Branch', angle: 308.5 },
    ],
  },
  {
    id: 2,
    title: 'Tally Cloud',
    subtitle: 'Anywhere, Anytime Secure Access',
    description: 'Access your Tally data from any device with bank-grade encrypted cloud hosting. Zero setup, instant connectivity.',
    background: bgTallyCloud,
    accentColor: '#818CF8',
    ctaText: 'Explore Cloud Tally',
    ctaPath: '/services/tally-on-cloud',
    badge: '256-Bit Encrypted Access',
    centerLabel: 'Tally\nCloud',
    centerIcon: Cloud,
    orbitItems: [
      { icon: Cloud, label: 'Cloud Hosting', angle: 0 },
      { icon: ShieldCheck, label: 'Data Security', angle: 51.4 },
      { icon: Monitor, label: 'Remote Desktop', angle: 102.8 },
      { icon: Database, label: 'Auto Backup', angle: 154.2 },
      { icon: Wifi, label: 'Multi-Device', angle: 205.7 },
      { icon: Wrench, label: '24/7 Support', angle: 257.1 },
      { icon: Zap, label: '99.9% Uptime', angle: 308.5 },
    ],
  },
  {
    id: 3,
    title: 'IT Infrastructure',
    subtitle: 'End-to-End IT Setup & Operations',
    description: 'Complete IT infrastructure planning, deployment, and proactive management for enterprise performance and reliability.',
    background: bgItInfrastructure,
    accentColor: '#2DD4BF',
    ctaText: 'Explore IT Infrastructure',
    ctaPath: '/services/it-infra-security',
    badge: 'Enterprise NOC Operations',
    centerLabel: 'IT\nInfra',
    centerIcon: Server,
    orbitItems: [
      { icon: Server, label: 'Server Mgmt', angle: 0 },
      { icon: Wifi, label: 'Network LAN', angle: 51.4 },
      { icon: HardDrive, label: 'Storage NAS', angle: 102.8 },
      { icon: Monitor, label: 'CCTV Setup', angle: 154.2 },
      { icon: Cpu, label: 'Virtualization', angle: 205.7 },
      { icon: Globe, label: 'Structured Cabling', angle: 257.1 },
      { icon: ShieldCheck, label: 'AMC Contracts', angle: 308.5 },
    ],
  },
  {
    id: 4,
    title: 'Cloud Server & Hosting',
    subtitle: 'Scalable Cloud Infrastructure',
    description: 'Enterprise-grade cloud servers, website hosting, and hybrid cloud solutions on Microsoft Azure & AWS.',
    background: bgCloudHosting,
    accentColor: '#38BDF8',
    ctaText: 'Explore Cloud Hosting',
    ctaPath: '/services/data-center-cloud',
    badge: 'Tier-4 Multi-Cloud Infrastructure',
    centerLabel: 'Cloud\nHosting',
    centerIcon: Cloud,
    orbitItems: [
      { icon: Cloud, label: 'Cloud Servers', angle: 0 },
      { icon: Globe, label: 'Web Hosting', angle: 51.4 },
      { icon: Database, label: 'Azure & AWS', angle: 102.8 },
      { icon: Zap, label: 'Load Balancing', angle: 154.2 },
      { icon: ShieldCheck, label: 'DDoS Shield', angle: 205.7 },
      { icon: HardDrive, label: 'SSD Storage', angle: 257.1 },
      { icon: Monitor, label: '99.99% SLA', angle: 308.5 },
    ],
  },
  {
    id: 5,
    title: 'Managed IT Services',
    subtitle: 'Proactive IT Support & AMC',
    description: 'Comprehensive managed IT with proactive monitoring, expert helpdesk, and annual maintenance contracts.',
    background: bgManagedIt,
    accentColor: '#34D399',
    ctaText: 'Explore Managed IT',
    ctaPath: '/services/it-infra-security',
    badge: 'Proactive 24/7 Monitoring',
    centerLabel: 'Managed\nIT',
    centerIcon: Monitor,
    orbitItems: [
      { icon: Monitor, label: 'Remote NOC', angle: 0 },
      { icon: Wrench, label: 'IT Helpdesk', angle: 51.4 },
      { icon: FileText, label: 'AMC Contract', angle: 102.8 },
      { icon: Cpu, label: 'Patch Mgmt', angle: 154.2 },
      { icon: Server, label: 'Server Support', angle: 205.7 },
      { icon: Wifi, label: 'Network Support', angle: 257.1 },
      { icon: ShieldCheck, label: 'Health Checks', angle: 308.5 },
    ],
  },
  {
    id: 6,
    title: 'Cyber Security',
    subtitle: 'Protect. Detect. Respond.',
    description: 'End-to-end cybersecurity with next-gen firewall, endpoint protection, and real-time threat intelligence.',
    background: bgCyberSecurity,
    accentColor: '#FBBF24',
    ctaText: 'Explore Cyber Security',
    ctaPath: '/services/it-infra-security',
    badge: 'Enterprise Threat Defense',
    centerLabel: 'Cyber\nSecurity',
    centerIcon: Shield,
    orbitItems: [
      { icon: Shield, label: 'Endpoint EDR', angle: 0 },
      { icon: Lock, label: 'UTM Firewall', angle: 51.4 },
      { icon: ShieldCheck, label: 'ISO 27001', angle: 102.8 },
      { icon: Zap, label: 'SOC Services', angle: 154.2 },
      { icon: Globe, label: 'VPN & SSL', angle: 205.7 },
      { icon: Monitor, label: 'Threat Watch', angle: 257.1 },
      { icon: FileText, label: 'Pen Testing', angle: 308.5 },
    ],
  },
  {
    id: 7,
    title: 'Microsoft Licensing',
    subtitle: 'Authorized Microsoft Partner',
    description: 'Genuine Microsoft 365, Windows Server, Azure and enterprise software licensing at best-in-class pricing.',
    background: bgMicrosoftLicensing,
    accentColor: '#60A5FA',
    ctaText: 'Explore Microsoft Solutions',
    ctaPath: '/services/it-infra-security',
    badge: 'Authorized Microsoft Reseller',
    centerLabel: 'Microsoft\nLicensing',
    centerIcon: Monitor,
    orbitItems: [
      { icon: Monitor, label: 'Microsoft 365', angle: 0 },
      { icon: Server, label: 'Windows Server', angle: 51.4 },
      { icon: Cloud, label: 'Azure Cloud', angle: 102.8 },
      { icon: ShieldCheck, label: 'MS Defender', angle: 154.2 },
      { icon: Cpu, label: 'Intune MDM', angle: 205.7 },
      { icon: Database, label: 'SQL Server', angle: 257.1 },
      { icon: Globe, label: 'Entra ID', angle: 308.5 },
    ],
  },
];

/* ── Orbit diagram component ── */
function OrbitDiagram({ slide }) {
  const CenterIcon = slide.centerIcon;
  const radius1 = 108; // inner ring
  const radius2 = 172; // outer ring
  const cx = 210;
  const cy = 210;
  const size = 420;

  return (
    <div className="nis-orbit-wrapper">
      <div 
        className="nis-orbit-glow-aura" 
        style={{ background: `radial-gradient(circle, ${slide.accentColor}40 0%, ${slide.accentColor}12 45%, transparent 70%)` }}
      />
      <svg
        className="nis-orbit-svg"
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`centerGradient-${slide.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={slide.accentColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0B132B" stopOpacity="0.95" />
          </radialGradient>
          <filter id={`glow-${slide.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer ring - rotating */}
        <circle 
          className="nis-orbit-spin-outer"
          cx={cx} cy={cy} r={radius2} 
          fill="none" 
          stroke={`${slide.accentColor}50`} 
          strokeWidth="1.8" 
          strokeDasharray="8 6" 
        />
        {/* Inner ring - reverse rotating */}
        <circle 
          className="nis-orbit-spin-inner"
          cx={cx} cy={cy} r={radius1} 
          fill="none" 
          stroke={`${slide.accentColor}60`} 
          strokeWidth="1.5" 
          strokeDasharray="6 4" 
        />
        {/* Innermost glow ring */}
        <circle 
          cx={cx} cy={cy} r={58} 
          fill={`${slide.accentColor}18`} 
          stroke={`${slide.accentColor}80`} 
          strokeWidth="1.5" 
        />

        {/* Spoke lines to outer orbit items */}
        {slide.orbitItems.map((item, idx) => {
          const isOuter = idx % 2 === 0;
          const r = isOuter ? radius2 : radius1;
          const angleRad = ((item.angle - 90) * Math.PI) / 180;
          const x = cx + r * Math.cos(angleRad);
          const y = cy + r * Math.sin(angleRad);
          return (
            <line
              key={idx}
              x1={cx} y1={cy}
              x2={x} y2={y}
              stroke={`${slide.accentColor}30`}
              strokeWidth="1.2"
            />
          );
        })}

        {/* Center circle */}
        <circle 
          cx={cx} cy={cy} r={52} 
          fill={`url(#centerGradient-${slide.id})`} 
          stroke={slide.accentColor} 
          strokeWidth="2" 
          style={{ filter: `drop-shadow(0 0 12px ${slide.accentColor}60)` }}
        />
      </svg>

      {/* Center label (HTML overlay, centered) */}
      <div className="nis-orbit-center">
        <div className="nis-orbit-center-icon" style={{ color: slide.accentColor, filter: `drop-shadow(0 0 8px ${slide.accentColor})` }}>
          <CenterIcon size={28} />
        </div>
        <span className="nis-orbit-center-label" style={{ color: '#fff' }}>
          {slide.centerLabel.split('\n').map((l, i) => (
            <span key={i}>{l}<br /></span>
          ))}
        </span>
      </div>

      {/* Orbit icon nodes (HTML overlay) */}
      {slide.orbitItems.map((item, idx) => {
        const isOuter = idx % 2 === 0;
        const r = isOuter ? 172 : 108;
        const angleRad = ((item.angle - 90) * Math.PI) / 180;
        const px = 50 + (r / 210) * 50 * Math.cos(angleRad);
        const py = 50 + (r / 210) * 50 * Math.sin(angleRad);
        const IconComp = item.icon;
        return (
          <div
            key={idx}
            className="nis-orbit-node"
            style={{ left: `${px}%`, top: `${py}%` }}
          >
            <div
              className="nis-orbit-node-icon"
              style={{
                background: 'rgba(9, 18, 38, 0.88)',
                borderColor: `${slide.accentColor}85`,
                color: slide.accentColor,
                boxShadow: `0 0 16px ${slide.accentColor}40, 0 4px 16px rgba(0,0,0,0.6)`,
              }}
            >
              <IconComp size={17} />
            </div>
            <span className="nis-orbit-node-label" style={{ color: '#FFFFFF' }}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

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

  const nextSlide = useCallback(() => setCurrentSlide((p) => (p + 1) % slides.length), []);
  const prevSlide = useCallback(() => setCurrentSlide((p) => (p - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(() => setCurrentSlide((p) => (p + 1) % slides.length), 6000);
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

      {/* ── Background image layers ── */}
      {slides.map((s, idx) => (
        <div
          key={s.id}
          className={`nis-slide-full ${idx === currentSlide ? 'nis-slide-active' : ''}`}
          aria-hidden={idx !== currentSlide}
        >
          <img
            src={s.background}
            alt=""
            className="nis-slide-bg-img"
            loading={idx === 0 ? 'eager' : 'lazy'}
          />
          <div className="nis-slide-overlay" />
        </div>
      ))}

      {/* ── Content layer ── */}
      <div className="nis-slide-content-layer">
        <div className="container nis-slide-inner">

          {/* LEFT: Text */}
          <div className="nis-slide-left">
            <div
              className="nis-slide-badge"
              style={{ 
                borderColor: `${slide.accentColor}90`, 
                color: slide.accentColor,
                boxShadow: `0 0 15px ${slide.accentColor}30`
              }}
            >
              <ShieldCheck size={14} />
              <span>{slide.badge}</span>
            </div>

            <h1 className="nis-slide-title">{slide.title}</h1>
            <p className="nis-slide-subtitle" style={{ color: slide.accentColor }}>{slide.subtitle}</p>
            <p className="nis-slide-desc">{slide.description}</p>

            <div className="nis-slide-actions">
              <button
                type="button"
                className="nis-slide-primary-btn"
                style={{ 
                  background: `linear-gradient(135deg, ${slide.accentColor} 0%, #1E40AF 100%)`,
                  boxShadow: `0 8px 25px -4px ${slide.accentColor}70` 
                }}
                onClick={() => handleNavigate(slide.ctaPath)}
              >
                <span>{slide.ctaText}</span>
                <ArrowRight size={17} />
              </button>
              <button
                type="button"
                className="nis-slide-secondary-btn"
                onClick={onBookDemo}
              >
                Get a Quote
              </button>
            </div>

            {/* Slide counter */}
            <div className="nis-slide-counter">
              <span className="counter-current" style={{ color: slide.accentColor, textShadow: `0 0 12px ${slide.accentColor}60` }}>
                {String(currentSlide + 1).padStart(2, '0')}
              </span>
              <span className="counter-sep">/</span>
              <span className="counter-total">{String(slides.length).padStart(2, '0')}</span>
            </div>
          </div>

          {/* RIGHT: Orbit diagram */}
          <div className="nis-slide-right">
            <OrbitDiagram slide={slide} />
          </div>

        </div>
      </div>

      {/* ── Arrows ── */}
      <button type="button" className="nis-carousel-arrow nis-arrow-prev" onClick={prevSlide} aria-label="Previous slide">
        <ChevronLeft size={24} />
      </button>
      <button type="button" className="nis-carousel-arrow nis-arrow-next" onClick={nextSlide} aria-label="Next slide">
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
  );
}
