import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X,
  Plus,
  Sparkles,
  Globe,
  ArrowUpRight,
  Star,
  Quote,
  Network,
  Server,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ArrowRight,
  Zap,
  Lock,
  Cpu,
  Cloud,
  Laptop,
  Activity,
  HardDrive,
  Shield,
  Radio,
  FileCheck2,
  MessageSquareShare
} from 'lucide-react';
import logoImg from '../../assets/Transparent Tech Logo with Cloud Mark.png';
import heroVideo from '../../assets/gemini_generated_video_61d17737.mp4';
import teamHandshakeImg from '../../assets/corporate_team_handshake.jpg';
import engineersImg from '../../assets/office_engineers_collaborating.jpg';

// Service Accordion Imagery Assets
import itInfraImg from '../../assets/IT Infrastructure Management.png';
import cloudHostingImg from '../../assets/Cloud Server Hosting.png';
import managedItImg from '../../assets/Managed IT Services Hub.png';
import microsoftImg from '../../assets/Microsoft Licensing Solutions.png';
import tallyPrimeImg from '../../assets/tally prime.png';
import cybersecurityImg from '../../assets/Cybersecurity Solutions.png';
import sfdcLogo from '../../assets/SFDC_logo.png';
import teaBoardLogo from '../../assets/tea_board_logo.png';

// Authentic Professional Enterprise Photography (Real IT Engineers & Specialists)
import photoInfraEngineer from '../../assets/it_infrastructure_engineer.jpg';
import photoDatacenterArchitect from '../../assets/photo_datacenter_architect.jpg';
import photoOfficeNetworkEng from '../../assets/photo_office_network_eng.jpg';
import photoMicrosoftCloudEng from '../../assets/photo_microsoft_cloud_eng.jpg';
import photoFinancialSpecialist from '../../assets/photo_financial_erp_specialist.jpg';

// Global Shared Components
import GoogleReviewsSection from '../../components/GoogleReviewsSection';
import Footer from '../../components/Footer';
import './Homepage.css';

// Carousel Slides Configuration
const SLIDES = [
  {
    id: 1,
    eyebrow: 'Building the Future with',
    line1: 'INTELLIGENT TECHNOLOGY.',
    line2: 'SEAMLESS BUSINESS.',
    subtitle: 'Professional, modern, and suitable for your complete range of IT services.',
    ctaText: 'Book a Free Consultation Call',
    action: 'consultation'
  },
  {
    id: 2,
    eyebrow: 'Empowering Businesses with',
    line1: 'NEXT-GEN CLOUD',
    line2: '& CYBER DEFENSE',
    subtitle: 'Enterprise cloud hosting, zero-trust cybersecurity, and automated disaster recovery tailored for high uptime.',
    ctaText: 'Explore Cloud & Security',
    action: 'cloud'
  },
  {
    id: 3,
    eyebrow: 'Accelerating Efficiency with',
    line1: 'INTELLIGENT BUSINESS',
    line2: 'AUTOMATION',
    subtitle: 'Certified TallyPrime on Cloud, Microsoft 365 migrations, and proactive 24/7 managed infrastructure support.',
    ctaText: 'Discover Smart IT Solutions',
    action: 'tally'
  }
];

// Navigation menu data matching user requested options & submenus:
// Home | About Us ˅ | Products | Industries | Services ˅ | Solutions ˅ | Contact ˅
const NAV_ITEMS = [
  {
    id: 'about',
    label: 'About Us',
    path: '/about',
    items: [
      { label: 'About NISPL', path: '#innovators-partners', desc: 'Our 25+ years journey, vision & engineering values' },
      { label: 'Partners', path: '#authorized-partners', desc: 'Certified enterprise technology alliances & cloud networks' },
      { label: 'Client Success & Reviews', path: '#client-reviews', desc: 'Authentic 4.5★ Google verified ratings' }
    ]
  },
  {
    id: 'products',
    label: 'Products',
    path: '/products',
    // Plain link (no chevron in header)
  },
  {
    id: 'industries',
    label: 'Industries',
    path: '/industries',
    // Plain link (no chevron in header)
  },
  {
    id: 'services',
    label: 'Services',
    path: '/services',
    isWide: true,
    items: [
      { label: 'Managed IT Services', path: '/services', desc: 'Comprehensive 24/7 IT management & maintenance' },
      { label: 'IT AMC & Support', path: '/services', desc: 'Proactive annual hardware & systems support' },
      { label: 'Server & Network Management', path: '/services', desc: 'High-availability networking & structured cabling' },
      { label: 'Cloud Migration & Management', path: '/services', desc: 'Seamless enterprise cloud hosting transitions' },
      { label: 'Tally Implementation & Support', path: '/services', desc: '3-Star certified TallyPrime customization' },
      { label: 'Microsoft 365 Support', path: '/services', desc: 'Productivity suites, exchange & tenant governance' },
      { label: 'Cyber Security Management', path: '/services', desc: 'Zero-trust endpoint defense, firewall & CCTV' },
      { label: 'CCTV & Wi-Fi Support', path: '/services', desc: 'Enterprise surveillance & smart connectivity' },
      { label: 'On-site / Remote IT Support', path: '/services', desc: 'SLA-backed rapid technician assistance' }
    ]
  },
  {
    id: 'solutions',
    label: 'Solutions',
    path: '/solutions',
    isWide: true,
    items: [
      { label: 'TallyPrime & ERP Solutions', path: '/solutions', desc: 'Statutory compliance & multi-branch finance' },
      { label: 'Tally on Cloud', path: '/solutions', desc: 'Bank-grade SSL encrypted anywhere access' },
      { label: 'Cloud & Hosting Solutions', path: '/solutions', desc: 'Scalable data center virtual instances' },
      { label: 'Cyber Security Solutions', path: '/solutions', desc: 'UTM firewalls & ransomware threat defense' },
      { label: 'Microsoft 365 & Licensing Solutions', path: '/solutions', desc: 'Authorized Microsoft volume licensing tiers' },
      { label: 'Business Management Portal Solutions', path: '/solutions', desc: 'Centralized helpdesk & client portals' },
      { label: 'IT Infrastructure Solutions', path: '/solutions', desc: 'Structured cabling, rack servers & power backup' },
      { label: 'Backup & Disaster Recovery Solutions', path: '/solutions', desc: 'Automated encrypted offsite recovery protocols' }
    ]
  },
  {
    id: 'contact',
    label: 'Contact',
    path: '/contact',
    items: [
      { label: 'Business Inquiries', path: '/contact/business', desc: 'Talk to our solution architects & sales team' },
      { label: 'Careers', path: '/contact/careers', desc: 'Explore tech roles & join the NISPL team' },
      { label: 'Contact Us', path: '/contact', desc: 'Call, email or visit our Kolkata headquarters' }
    ]
  }
];

// 5 Core Strategic Services (Bespoke Enterprise Slit Accordion)
// Based exactly on user requirements:
// 1 | IT & Security Services | CCTV, LAN, UPS, Antivirus, AMC, Attendance
// 2 | IT Infrastructure | Servers, Network, Storage, Wi-Fi
// 3 | Office IT & Security | Integrated IT & security solutions
// 4 | Microsoft Solutions | Microsoft 365, Windows, Server, Entra ID, Intune
// 5 | TallyPrime Solutions | Banking, GST, e-Invoice, e-Way Bill, WhatsApp
const SERVICES_ACCORDION = [
  {
    id: 'it-security-services',
    tabTitle: 'IT & Security Services',
    icon: Shield,
    tag: 'IT & Security Services',
    mainHeading: 'IT & Security Services',
    headline: 'Continuous Workplace Protection & Power Reliability',
    description: 'We deliver comprehensive workplace IT and physical security solutions designed to ensure uninterrupted business continuity. Our unified service integrates structured high-speed LAN connectivity, centralized 24/7 CCTV surveillance monitoring, biometric attendance and access control, reliable online UPS power continuity, proactive IT AMC maintenance contracts, and multi-layered endpoint antivirus defense.',
    focus: 'CCTV, LAN, UPS, Antivirus, AMC, Attendance',
    badge: 'Proactive 24/7 Monitoring • Zero-Downtime Power • Multi-Layered Threat Defense',
    image: managedItImg,
    bgImage: photoInfraEngineer,
    ctaText: 'Consult Security Specialist'
  },
  {
    id: 'it-infrastructure',
    tabTitle: 'IT Infrastructure',
    icon: Network,
    tag: 'IT Infrastructure',
    mainHeading: 'IT Infrastructure',
    headline: 'High-Performance Enterprise Servers, Storage & Networks',
    description: 'Empowering mission-critical enterprise workloads with scalable, robust IT infrastructure built for maximum performance. We architect, deploy, and manage high-availability rack and blade servers, carrier-neutral low-latency network switching fabrics, secure high-density storage arrays, and enterprise-grade business Wi-Fi to support high-throughput operations across all your offices.',
    focus: 'Servers, Network, Storage, Wi-Fi',
    badge: 'Redundant Core Architecture • Low-Latency Switching • High Data Availability',
    image: itInfraImg,
    bgImage: photoDatacenterArchitect,
    ctaText: 'Explore Infrastructure Solutions'
  },
  {
    id: 'office-it-security',
    tabTitle: 'Office IT & Security',
    icon: Laptop,
    tag: 'Office IT & Security',
    mainHeading: 'Office IT & Security',
    headline: 'Seamlessly Integrated Office Computing & Security Ecosystems',
    description: 'A complete, single-window technology integration designed for modern offices and enterprise workplaces. We bridge office workstation networks, zero-trust network firewalls, perimeter cybersecurity, surveillance monitoring, smart biometric gate systems, and rapid SLA-backed IT maintenance into an intelligent, cohesive environment that accelerates team productivity while defending company assets.',
    focus: 'Integrated IT & security solutions',
    badge: 'End-to-End Enterprise Workspace Architecture & Proactive SLA Support',
    image: cybersecurityImg,
    bgImage: photoOfficeNetworkEng,
    ctaText: 'Schedule Office IT Assessment'
  },
  {
    id: 'microsoft-solutions',
    tabTitle: 'Microsoft Solutions',
    icon: Layers,
    tag: 'Microsoft Solutions',
    mainHeading: 'Microsoft Solutions',
    headline: 'Cloud Productivity, Identity Protection & Modern Endpoint Management',
    description: 'Maximize corporate collaboration and ensure enterprise compliance with genuine Microsoft cloud and licensing solutions. As an authorized partner, we provide turnkey deployment and migration for Microsoft 365 productivity suites, genuine Windows OS and Windows Server environments, cloud-native identity governance with Microsoft Entra ID, and centralized device fleet management through Microsoft Intune.',
    focus: 'Microsoft 365, Windows, Server, Entra ID, Intune',
    badge: 'Official Microsoft Cloud Sync • Zero-Trust Identity • Automated Endpoint Compliance',
    image: microsoftImg,
    bgImage: photoMicrosoftCloudEng,
    ctaText: 'Consult Microsoft Licensing Advisor'
  },
  {
    id: 'tallyprime-solutions',
    tabTitle: 'TallyPrime Solutions',
    icon: FileCheck2,
    tag: 'TallyPrime Solutions',
    mainHeading: 'TallyPrime Solutions',
    headline: 'Automated Accounting, Real-Time Compliance & Connected Commerce',
    description: 'Accelerate your financial administration with certified TallyPrime business automation. Our comprehensive solution empowers enterprises with direct connected banking reconciliations, real-time GST tax compliance and filing, instant electronic invoice (e-Invoice) generation, seamless e-Way bill creation, automated WhatsApp invoice dispatch, and secure 256-bit encrypted multi-user cloud access from anywhere.',
    focus: 'Banking, GST, e-Invoice, e-Way Bill, WhatsApp',
    badge: 'Certified 3-Star Tally Partner • 256-Bit SSL Encrypted Anywhere Access',
    image: tallyPrimeImg,
    bgImage: photoFinancialSpecialist,
    ctaText: 'Request Tally Consultation'
  }
];

// =========================================================================
// AUTHORIZED PARTNERS LOGOS (MATCHING USER REFERENCE IMAGE - BIG LOGOS)
// =========================================================================
const AUTHORIZED_PARTNERS = [
  {
    id: 'google',
    name: 'Google Partner',
    render: () => (
      <div className="demo-big-logo-item demo-google-partner">
        <div className="google-bar-mark" aria-hidden="true" />
        <div className="google-partner-stack">
          <span className="google-word">Google</span>
          <span className="partner-word">Partner</span>
        </div>
      </div>
    )
  },
  {
    id: 'aws',
    name: 'AWS Partner Network',
    render: () => (
      <div className="demo-big-logo-item demo-aws-partner">
        <div className="aws-brand-block">
          <span className="aws-text">aws</span>
          <svg width="40" height="9" viewBox="0 0 38 9" fill="none" className="aws-smile-svg" aria-hidden="true">
            <path d="M1 3.5C9 7.5 28 7.5 36 2" stroke="#FF9900" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M33 2L37 3L35 6" stroke="#FF9900" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="aws-sub-text">
          <span>partner</span>
          <span>network</span>
        </div>
      </div>
    )
  },
  {
    id: 'adobe',
    name: 'Adobe Solution Partner',
    render: () => (
      <div className="demo-big-logo-item demo-adobe-partner">
        <svg width="32" height="28" viewBox="0 0 30 26" fill="none" className="adobe-svg" aria-hidden="true">
          <path d="M19 0H30V26L19 0Z" fill="#FA0F00" />
          <path d="M11 0H0V26L11 0Z" fill="#FA0F00" />
          <path d="M15 9.5L20.8 24H16.8L15 19H12.5L15 9.5Z" fill="#FA0F00" />
        </svg>
        <div className="adobe-sub-text">
          <span className="adobe-name">Adobe</span>
          <span className="adobe-partner-tag">SOLUTION PARTNER</span>
        </div>
      </div>
    )
  },
  {
    id: 'linode',
    name: 'Linode',
    render: () => (
      <div className="demo-big-logo-item demo-linode-partner">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" className="linode-svg" aria-hidden="true">
          <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="#00B0FF" strokeWidth="2.2" strokeLinejoin="round" fill="rgba(0, 176, 255, 0.12)" />
          <circle cx="12" cy="12" r="3.2" fill="#00B0FF" />
        </svg>
        <span className="linode-name">linode</span>
      </div>
    )
  },
  {
    id: 'microsoft',
    name: 'Microsoft Solutions Partner',
    render: () => (
      <div className="demo-big-logo-item demo-ms-partner">
        <div className="ms-quad-squares" aria-hidden="true">
          <div style={{ background: '#F25022' }} />
          <div style={{ background: '#7FBA00' }} />
          <div style={{ background: '#00A4EF' }} />
          <div style={{ background: '#FFB900' }} />
        </div>
        <div className="partner-name-stack">
          <span className="partner-main-text">Microsoft</span>
          <span className="partner-sub-text">Solutions Partner</span>
        </div>
      </div>
    )
  },
  {
    id: 'tally',
    name: 'Tally Certified 3-Star Partner',
    render: () => (
      <div className="demo-big-logo-item demo-tally-partner">
        <span className="tally-brand-title">Tally</span>
        <div className="partner-name-stack">
          <span className="tally-stars">★★★</span>
          <span className="partner-sub-text">Certified Partner</span>
        </div>
      </div>
    )
  },
  {
    id: 'ctrls',
    name: 'CtrlS Datacenter Partner',
    render: () => (
      <div className="demo-big-logo-item demo-ctrls-partner">
        <div className="ctrls-text-logo">
          <span className="ctrl-part">Ctrl</span>
          <span className="s-part">S</span>
        </div>
        <span className="partner-sub-text">Datacenter Cloud</span>
      </div>
    )
  },
  {
    id: 'dell',
    name: 'Dell Technologies',
    render: () => (
      <div className="demo-big-logo-item demo-dell-partner">
        <div className="dell-circle-emblem">DELL</div>
        <span className="partner-sub-text">Technologies</span>
      </div>
    )
  }
];

// =========================================================================
// OUR CLIENTS LOGOS (MATCHING USER REFERENCE IMAGE - BIG LOGOS ONLY)
// =========================================================================
const CLIENT_SHOWCASE_LOGOS = [
  {
    id: 'tata-steel',
    name: 'Tata Steel',
    render: () => (
      <div className="demo-big-client-item">
        <div className="tata-logo-mark" aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path d="M3 6H21M12 6V20M8 12H16" stroke="#0052CC" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="client-text-name tata-blue">TATA STEEL</span>
      </div>
    )
  },
  {
    id: 'lt',
    name: 'Larsen & Toubro',
    render: () => (
      <div className="demo-big-client-item">
        <div className="lt-circle-emblem" aria-hidden="true">L&T</div>
        <span className="client-text-name lt-blue">LARSEN & TOUBRO</span>
      </div>
    )
  },
  {
    id: 'itc',
    name: 'ITC Limited',
    render: () => (
      <div className="demo-big-client-item">
        <div className="itc-triangle-mark" aria-hidden="true">
          <span>ITC</span>
        </div>
        <span className="client-text-name itc-maroon">ITC Limited</span>
      </div>
    )
  },
  {
    id: 'sfdc',
    name: 'Govt. of West Bengal (SFDC)',
    render: () => (
      <div className="demo-big-client-item">
        <img src={sfdcLogo} alt="Govt. of West Bengal SFDC" className="client-brand-img" />
        <span className="client-text-name sfdc-blue">Govt. of West Bengal (SFDC)</span>
      </div>
    )
  },
  {
    id: 'tea-board',
    name: 'Tea Board of India',
    render: () => (
      <div className="demo-big-client-item">
        <img src={teaBoardLogo} alt="Tea Board of India" className="client-brand-img" />
        <span className="client-text-name teaboard-green">Tea Board of India</span>
      </div>
    )
  },
  {
    id: 'reliance',
    name: 'Reliance Industries',
    render: () => (
      <div className="demo-big-client-item">
        <div className="reliance-emblem" aria-hidden="true">
          <div className="reliance-inner-crest" />
        </div>
        <span className="client-text-name reliance-blue">Reliance Industries</span>
      </div>
    )
  },
  {
    id: 'emami',
    name: 'Emami Group',
    render: () => (
      <div className="demo-big-client-item">
        <span className="client-wordmark emami-red">emami</span>
      </div>
    )
  },
  {
    id: 'exide',
    name: 'Exide Industries',
    render: () => (
      <div className="demo-big-client-item">
        <span className="client-wordmark exide-red">EXIDE</span>
      </div>
    )
  }
];

export default function Homepage({ 
  onOpenContact, 
  onOpenConsultation 
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeServiceIndex, setActiveServiceIndex] = useState(null); // All sections closed by default
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef(null);
  const lastScrollY = useRef(0);

  // Auto-slide effect (cycles every 6.5s unless hovered)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6500);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Smart scroll effect for navbar hide/show
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      if (currentScrollY > 140) {
        if (currentScrollY > lastScrollY.current + 8) {
          setNavVisible(false); // Hide on scroll down
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

  // Ensure background video plays automatically
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn('Autoplay prevented on video:', err);
      });
    }
  }, []);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
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
    if (onOpenContact) {
      onOpenContact();
    } else {
      window.location.href = '/contact';
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <div className="demo-page-container">
      {/* =====================================================================
          1. FLOATING PILL HEADER NAVBAR (Matching CodeLogicX Reference Image)
          ===================================================================== */}
      <header className={`demo-header-wrapper ${isScrolled ? 'scrolled' : ''} ${!navVisible ? 'nav-hidden' : ''}`}>
        <nav className="demo-pill-navbar" aria-label="Main Navigation">
          {/* Brand Logo (Left) */}
          <a href="/" className="demo-brand" title="Net Infotech System Pvt. Ltd.">
            <div className="demo-brand-logo-frame">
              <img 
                src={logoImg} 
                alt="Net Infotech System Pvt. Ltd." 
                className="demo-brand-logo-img" 
              />
            </div>
          </a>

          {/* Desktop Navigation Links (Center) */}
          <ul className="demo-nav-links">
            {NAV_ITEMS.map((item, index) => {
              // 1. Home (Blue active pill button like screenshot)
              if (item.isHomePill) {
                return (
                  <li key={item.id} className="demo-nav-item">
                    <a
                      href={item.path}
                      className="demo-nav-home-pill active"
                      title="Net Infotech System Home"
                    >
                      {item.label}
                    </a>
                  </li>
                );
              }

              // 2. Direct links with no dropdown / no chevron (Products, Industries)
              if (!item.items || item.items.length === 0) {
                return (
                  <li key={item.id} className="demo-nav-item">
                    <a
                      href={item.path}
                      className="demo-nav-link"
                      onClick={(e) => {
                        if (item.path.startsWith('#')) {
                          e.preventDefault();
                          const target = document.querySelector(item.path);
                          if (target) target.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      <span>{item.label}</span>
                    </a>
                  </li>
                );
              }

              // 3. Dropdown menus (About Us ˅, Services ˅, Solutions ˅, Contact ˅)
              const isOpen = activeDropdown === index;
              return (
                <li 
                  key={item.id}
                  className={`demo-nav-item has-dropdown ${isOpen ? 'active' : ''}`}
                  onMouseEnter={() => setActiveDropdown(index)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button 
                    type="button" 
                    className="demo-nav-link"
                    onClick={() => setActiveDropdown(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className="demo-nav-chevron" />
                  </button>

                  {/* Dropdown Menu */}
                  <div className={`demo-dropdown-menu ${item.isWide ? 'is-wide' : ''}`}>
                    {item.items.map((subItem) => (
                      <a 
                        key={subItem.label} 
                        href={subItem.path} 
                        className="demo-dropdown-item"
                        onClick={(e) => {
                          if (subItem.path.startsWith('#')) {
                            e.preventDefault();
                            setActiveDropdown(null);
                            const target = document.querySelector(subItem.path);
                            if (target) target.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                      >
                        <span className="demo-dropdown-item-bullet" />
                        <div className="demo-dropdown-item-content">
                          <span className="demo-dropdown-item-title">{subItem.label}</span>
                          {subItem.desc && (
                            <span className="demo-dropdown-item-desc">{subItem.desc}</span>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Right Action: Pill Contact Button & Mobile Toggle */}
          <div className="demo-nav-actions">
            <button 
              type="button"
              className="demo-contact-pill-btn"
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
        {NAV_ITEMS.map((item) => (
          <div key={item.id} className="demo-mobile-item-wrap">
            <a
              href={item.path}
              className={`demo-mobile-nav-link ${item.isHomePill ? 'mobile-home-pill' : ''}`}
              onClick={(e) => {
                if (item.path.startsWith('#')) {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  const target = document.querySelector(item.path);
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                } else if (!item.items) {
                  setMobileMenuOpen(false);
                }
              }}
            >
              <span>{item.label}</span>
              {item.items && <ChevronDown size={15} opacity={0.6} />}
            </a>
            {item.items && (
              <div className="demo-mobile-sub-list">
                {item.items.map((sub) => (
                  <a
                    key={sub.label}
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
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
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

      {/* =====================================================================
          2. HERO CAROUSEL SECTION (BACKGROUND VIDEO + TYPOGRAPHY)
          ===================================================================== */}
      <section 
        className="demo-hero-section"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background Video (gemini_generated_video_61d17737.mp4) */}
        <div className="demo-video-container">
          <video
            ref={videoRef}
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="demo-bg-video"
          />
          {/* Meticulous gradient contrast overlays matching reference image */}
          <div className="demo-video-overlay-gradient" />
          <div className="demo-video-grid-pattern" />
        </div>

        {/* Hero Content Area */}
        <div className="demo-hero-inner">
          <div className="demo-hero-content-box" key={slide.id}>
            {/* Orange Tagline Eyebrow */}
            <span className="demo-hero-eyebrow">
              {slide.eyebrow}
            </span>

            {/* Bold White Headline */}
            <h1 className="demo-hero-headline">
              <span className="headline-line">{slide.line1}</span>
              <span className="headline-line">{slide.line2}</span>
            </h1>

            {/* Subtitle Description */}
            <p className="demo-hero-subtitle">
              {slide.subtitle}
            </p>

            {/* Outline Consultation CTA Button with Circle Arrow */}
            <button 
              type="button"
              className="demo-hero-cta-btn"
              onClick={handleCtaClick}
            >
              <span>{slide.ctaText}</span>
              <div className="demo-cta-arrow-circle" aria-hidden="true">
                <ArrowUpRight size={15} />
              </div>
            </button>
          </div>
        </div>

        {/* Carousel Indicators & Controls */}
        <div className="demo-carousel-controls">
          {/* Indicator Bars */}
          <div className="demo-carousel-indicators" role="tablist" aria-label="Slide Selection">
            {SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                className={`demo-indicator-bar ${currentSlide === idx ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                aria-selected={currentSlide === idx}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="demo-carousel-arrows">
            <button 
              type="button" 
              className="demo-arrow-btn" 
              onClick={handlePrevSlide}
              aria-label="Previous Slide"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              type="button" 
              className="demo-arrow-btn" 
              onClick={handleNextSlide}
              aria-label="Next Slide"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. INNOVATORS. PARTNERS. CATALYSTS. SECTION (BELOW CAROUSEL)
          ===================================================================== */}
      <section className="demo-partners-section" id="innovators-partners">
        <div className="demo-partners-container">
          {/* Left Column: Rich Photo Collage with Floating Testimonial Badges */}
          <div className="demo-collage-wrapper">
            <div className="demo-collage-grid">
              {/* Primary Image: Team Handshake & Partnership */}
              <div className="demo-img-frame demo-img-primary-frame">
                <img 
                  src={teamHandshakeImg} 
                  alt="Net Infotech System team celebrating corporate success" 
                  className="demo-collage-img" 
                  loading="lazy"
                />
              </div>

              {/* Secondary Image: Engineers in Tech Workspace */}
              <div className="demo-img-frame demo-img-secondary-frame">
                <img 
                  src={engineersImg} 
                  alt="Modern engineers collaborating on cloud solutions" 
                  className="demo-collage-img" 
                  loading="lazy"
                />
              </div>
            </div>

            {/* Floating Element 1: Top-Left Orange Badge */}
            <div className="demo-floating-badge demo-badge-orange">
              <span>Great place</span>
              <span>with work</span>
            </div>

            {/* Floating Element 2: Top-Right Client Quotes Card */}
            <div className="demo-floating-card demo-card-testimonials">
              <div className="demo-card-quote-item">
                <div className="demo-quote-icon-badge demo-quote-icon-teal">
                  <Sparkles size={14} />
                </div>
                <p className="demo-quote-text">
                  They deliver exactly what I am looking for...
                </p>
              </div>
              <div className="demo-card-quote-divider" />
              <div className="demo-card-quote-item">
                <div className="demo-quote-icon-badge demo-quote-icon-orange">
                  <Quote size={13} />
                </div>
                <p className="demo-quote-text">
                  Net Infotech System is able to translate complicated requirements into efficient and secure solutions...
                </p>
              </div>
            </div>

            {/* Floating Element 3: Bottom-Left Employee / Client Rating Card */}
            <div className="demo-floating-card demo-card-ratings">
              <div className="demo-rating-item">
                <div className="demo-stars-row">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="demo-star-icon" fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p className="demo-rating-review">
                  Net Infotech System is an incredible place to work!
                </p>
                <span className="demo-rating-author">Kunal P (PM)</span>
              </div>

              <div className="demo-card-rating-divider" />

              <div className="demo-rating-item">
                <div className="demo-stars-row">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="demo-star-icon" fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p className="demo-rating-review">
                  One of the best IT solution teams in Kolkata.
                </p>
                <span className="demo-rating-author">Avijit M (Tech Lead)</span>
              </div>
            </div>

            {/* Floating Element 4: Bottom-Right Cyan Badge */}
            <div className="demo-floating-badge demo-badge-cyan">
              <span>Great place</span>
              <span>to work</span>
            </div>
          </div>

          {/* Right Column: Editorial & Narrative Typography */}
          <div className="demo-partners-content">
            <h2 className="demo-partners-title">Innovators. Partners. Catalysts.</h2>
            
            <div className="demo-partners-accent-line" aria-hidden="true" />

            <h3 className="demo-partners-subtitle">
              Your Trusted Engineering & Modernization Partner
            </h3>

            <div className="demo-partners-body">
              <p>
                We embrace the latest technologies and methodologies, pushing the boundaries of what’s possible. With creativity and forward-thinking strategies, we turn your ideas into impactful realities.
              </p>
              <p>
                More than just a vendor, we are an extension of your team. By immersing ourselves in your goals and vision, we craft personalized solutions that improve efficiency and ensure opening up new revenue streams.
              </p>
              <p>
                We don’t just adapt to change- we accelerate it. By helping you harness the power of data, automation, and next-gen technologies, we empower your business to make smarter decisions and stay ahead in an ever-evolving market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. STRATEGIC SERVICES ACCORDION SLIDER (MATCHING CODE LOGIC X STYLE)
          ===================================================================== */}
      <section className="demo-services-section" id="strategic-services">
        <div className="demo-section-unified-header demo-services-header">
          <h2 className="demo-unified-title demo-services-title">
            Engineering the Future with Strategic Services Designed for Growth
          </h2>
          <p className="demo-unified-subtitle demo-services-subtitle">
            Explore our advanced engineering suite armed with impressive capabilities to catalyze your business growth.
          </p>
        </div>

        {/* Horizontal Slit / Accordion Card Slider */}
        <div className="demo-accordion-wrapper">
          <div className="demo-accordion-container">
            {SERVICES_ACCORDION.map((service, index) => {
              const isActive = activeServiceIndex === index;
              const hasActiveCard = activeServiceIndex !== null;
              const cardClass = isActive 
                ? 'active' 
                : hasActiveCard 
                  ? 'collapsed' 
                  : 'default-closed';

              return (
                <div 
                  key={service.id}
                  className={`demo-accordion-card ${cardClass}`}
                  onClick={() => setActiveServiceIndex(isActive ? null : index)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isActive}
                >
                  {/* Service Digital Information Background Image */}
                  <div className="demo-card-bg-wrap">
                    <img 
                      src={service.bgImage || service.image} 
                      alt={service.mainHeading} 
                      className="demo-card-bg-img" 
                      loading="lazy"
                    />
                    <div className="demo-card-bg-overlay" />
                  </div>

                  {/* Vertical Spine: Visible when collapsed or all closed */}
                  <div className="demo-card-vertical-spine">
                    <div className="demo-spine-top-icon">
                      {service.icon && React.createElement(service.icon, { size: 18 })}
                    </div>
                    <span className="demo-spine-number">0{index + 1}</span>
                    <span className="demo-card-vertical-title">{service.tabTitle}</span>
                    <div className="demo-spine-bottom-indicator">
                      <Plus size={16} />
                    </div>
                  </div>

                  {/* Expanded View: Two-Column Split (Left: Content Panel, Right: Dedicated Service Image Showcase) */}
                  <div className="demo-card-expanded-content">
                    {/* Left Column: Concise, Clean, Professional Content Panel */}
                    <div 
                      className="demo-card-content-panel"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Top Meta Bar with Category Tag & Close Button */}
                      <div className="demo-card-top-meta">
                        <div className="demo-card-tag-group">
                          <span className="demo-card-tag">{service.tag}</span>
                          <span className="demo-card-number">0{index + 1} / 05</span>
                        </div>
                        <button 
                          type="button" 
                          className="demo-card-close-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveServiceIndex(null);
                          }}
                          aria-label="Close section"
                          title="Close section"
                        >
                          <X size={15} />
                        </button>
                      </div>

                      {/* Concise Editorial Headings */}
                      <div className="demo-card-heading-group">
                        <h3 className="demo-card-main-heading">{service.mainHeading}</h3>
                        <h4 className="demo-card-headline">{service.headline}</h4>
                      </div>

                      {/* Professional Brief Narrative (Without bullet points) */}
                      <div className="demo-card-brief-overview">
                        <p className="demo-card-overview-text">
                          {service.description}
                        </p>
                        <div className="demo-card-focus-capsule">
                          <span className="demo-focus-label">Main Focus:</span>
                          <span className="demo-focus-value">{service.focus}</span>
                        </div>
                      </div>

                      {/* Architecture Interconnect Badge */}
                      <div className="demo-card-connection-banner">
                        <span className="demo-status-pulse" />
                        <span className="demo-connection-text">{service.badge}</span>
                      </div>

                      {/* Action Consultation Button */}
                      <div className="demo-card-panel-footer">
                        <button 
                          type="button" 
                          className="demo-card-cta-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenConsultation) onOpenConsultation();
                          }}
                        >
                          <span>{service.ctaText || 'Consult Solution Specialist'}</span>
                          <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Dedicated Service Image Showcase */}
                    <div 
                      className="demo-card-image-showcase"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="demo-showcase-frame">
                        <img 
                          src={service.image} 
                          alt={service.mainHeading} 
                          className="demo-showcase-img"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. AUTHORIZED PARTNERS SECTION (MATCHING USER REFERENCE IMAGE)
          ===================================================================== */}
      <section className="demo-trusted-partners-section" id="authorized-partners">
        <div className="demo-partners-box-wrapper">
          <div className="demo-section-unified-header">
            <h2 className="demo-unified-title">Authorized Partners</h2>
            <p className="demo-unified-subtitle">
              Certified Enterprise Technology Alliances & Global Cloud Ecosystem Partners
            </p>
          </div>

          {/* Big Logos Enclosed Container matching reference image */}
          <div className="demo-logo-showcase-box">
            <div className="demo-logos-row-grid">
              {AUTHORIZED_PARTNERS.map((partner) => (
                <div key={partner.id} className="demo-logo-outer-cell">
                  {partner.render()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. CLIENT REVIEWS SECTION (GOOGLE REVIEWS & VERIFIED TESTIMONIALS)
          ===================================================================== */}
      <GoogleReviewsSection />

      {/* =====================================================================
          7. OUR CLIENTS SECTION (ONLY BIG LOGOS - SAME LIKE REFERENCE IMAGE)
          ===================================================================== */}
      <section className="demo-our-clients-section" id="our-clients">
        <div className="demo-partners-box-wrapper">
          <div className="demo-section-unified-header">
            <h2 className="demo-unified-title">Our Clients</h2>
            <p className="demo-unified-subtitle">
              Trusted by Premier Enterprises, Public Sector Units & Leading Brands Across India
            </p>
          </div>

          {/* Big Logos Enclosed Container matching reference image */}
          <div className="demo-logo-showcase-box">
            <div className="demo-logos-row-grid demo-clients-row-grid">
              {CLIENT_SHOWCASE_LOGOS.map((client) => (
                <div key={client.id} className="demo-logo-outer-cell">
                  {client.render()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          8. OFFICIAL COMPREHENSIVE FOOTER
          ===================================================================== */}
      <Footer />
    </div>
  );
}
