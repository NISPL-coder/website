import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  Phone, 
  Mail, 
  Globe, 
  Building2,
  Server,
  Cloud,
  Wrench,
  Laptop,
  Users,
  Lock,
  Cpu,
  Monitor,
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  HardDrive,
  Briefcase,
  Layers,
  Shield,
  Clock,
  ThumbsUp,
  HeartHandshake
} from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import TrustedPartnersSection from '../components/TrustedPartnersSection';
import OurClientsSection from '../components/OurClientsSection';
import { useScrollReveal } from '../utils/useScrollReveal';
import '../components/MarketingSections.css';

/* ── ORIGINAL PREMIUM PRODUCT & SERVICE LOGOS ── */

// 1. Tally Prime Official 3-Tone Grid Logo
const LogoTallyPrime = () => (
  <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
    <rect x="3" y="3" width="12" height="12" rx="3" fill="#EAB308" />
    <rect x="17" y="3" width="12" height="12" rx="3" fill="#0284C7" />
    <rect x="3" y="17" width="12" height="12" rx="3" fill="#10B981" />
    <rect x="17" y="17" width="12" height="12" rx="3" fill="#2563EB" />
  </svg>
);

// 2. Tally Cloud Gradient Cloud & Check Logo
const LogoTallyCloud = () => (
  <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
    <path d="M22 14C22 9.58172 18.4183 6 14 6C10.125 6 6.88374 8.75133 6.13672 12.4414C3.77344 13.1562 2 15.3438 2 18C2 21.3137 4.68629 24 8 24H23C26.3137 24 29 21.3137 29 18C29 14.8828 26.6211 12.3125 23.5703 12.0391C23.8477 12.6719 24 13.3633 24 14.0898V14Z" fill="url(#tallyCloudGrad)" />
    <path d="M12 15L15 18L21 12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="tallyCloudGrad" x1="2" y1="6" x2="29" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
    </defs>
  </svg>
);

// 3. IT Infrastructure Network Server Blade Logo
const LogoItInfra = () => (
  <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
    <rect x="3" y="4" width="26" height="9" rx="2.5" fill="#0284C7" />
    <circle cx="7.5" cy="8.5" r="1.5" fill="#34D399" />
    <circle cx="12" cy="8.5" r="1.5" fill="#38BDF8" />
    <rect x="3" y="19" width="26" height="9" rx="2.5" fill="#1E3A8A" />
    <circle cx="7.5" cy="23.5" r="1.5" fill="#34D399" />
    <circle cx="12" cy="23.5" r="1.5" fill="#38BDF8" />
    <path d="M16 13V19" stroke="#0284C7" strokeWidth="2" strokeDasharray="2 2" />
  </svg>
);

// 4. Cloud Server & Hosting Azure/AWS Stack Logo
const LogoCloudHosting = () => (
  <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
    <path d="M26 15.5C26 11.3579 22.6421 8 18.5 8C15.0234 8 12.0938 10.3633 11.2227 13.5781C9.07031 14.1914 7.5 16.1562 7.5 18.5C7.5 21.5376 9.96243 24 13 24H24.5C27.5376 24 30 21.5376 30 18.5C30 15.8242 28.0859 13.5938 25.4805 13.0859C25.8164 13.8477 26 14.6562 26 15.5Z" fill="#38BDF8" opacity="0.45" />
    <rect x="3" y="11" width="22" height="7" rx="2" fill="#0284C7" />
    <circle cx="6.5" cy="14.5" r="1.2" fill="#10B981" />
    <rect x="3" y="20" width="22" height="7" rx="2" fill="#2563EB" />
    <circle cx="6.5" cy="23.5" r="1.2" fill="#10B981" />
  </svg>
);

// 5. Managed IT Proactive NOC Monitor Screen Logo
const LogoManagedIt = () => (
  <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
    <rect x="2" y="4" width="28" height="18" rx="3" fill="#0284C7" />
    <rect x="5" y="7" width="22" height="12" rx="1.5" fill="#F0F9FF" />
    <path d="M12 26H20M16 22V26" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="16" cy="13" r="4.5" fill="#2563EB" />
    <path d="M14.5 13L15.8 14.3L18 11.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 6. Cyber Security Shield & Lock Logo
const LogoCyberSecurity = () => (
  <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
    <path d="M16 3L27 7V15C27 21.5 22.2 27.2 16 29C9.8 27.2 5 21.5 5 15V7L16 3Z" fill="url(#secShieldGrad)" />
    <rect x="12" y="14" width="8" height="7" rx="1.5" fill="#FFFFFF" />
    <path d="M14 14V12C14 10.9 14.9 10 16 10C17.1 10 18 10.9 18 12V14" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="16" cy="17.5" r="1" fill="#0284C7" />
    <defs>
      <linearGradient id="secShieldGrad" x1="5" y1="3" x2="27" y2="29" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0284C7" />
        <stop offset="1" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
  </svg>
);

// 7. Official Microsoft Windows 4-Pane Logo
const LogoMicrosoftLicensing = () => (
  <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
    <path d="M3 5.5L14 4V15H3V5.5Z" fill="#00A4EF" />
    <path d="M15.5 3.8L29 2V15H15.5V3.8Z" fill="#00A4EF" />
    <path d="M3 17H14V28L3 26.5V17Z" fill="#00A4EF" />
    <path d="M15.5 17H29V30L15.5 28.2V17Z" fill="#00A4EF" />
  </svg>
);

// 8. IT Product Repair Crossed Tools & Gear Logo
const LogoItRepair = () => (
  <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="10" stroke="#0284C7" strokeWidth="2.5" strokeDasharray="3 2" />
    <path d="M11 21L21 11M19 9L23 13M9 19L13 23" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="16" cy="16" r="3" fill="#D97706" />
  </svg>
);

// 9. Data Center & Server Solutions Server Blade Logo
const LogoDataCenterServer = () => (
  <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
    <rect x="3" y="4" width="26" height="7" rx="2" fill="#0284C7" />
    <circle cx="7" cy="7.5" r="1.2" fill="#10B981" />
    <circle cx="11" cy="7.5" r="1.2" fill="#38BDF8" />
    <rect x="3" y="12.5" width="26" height="7" rx="2" fill="#2563EB" />
    <circle cx="7" cy="16" r="1.2" fill="#10B981" />
    <circle cx="11" cy="16" r="1.2" fill="#38BDF8" />
    <rect x="3" y="21" width="26" height="7" rx="2" fill="#1E3A8A" />
    <circle cx="7" cy="24.5" r="1.2" fill="#10B981" />
    <circle cx="11" cy="24.5" r="1.2" fill="#38BDF8" />
  </svg>
);

// Official style CtrlS Partner Logo SVG
const LogoCtrlS = () => (
  <svg width="110" height="32" viewBox="0 0 130 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="27" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="900" fontSize="28" fill="#0284C7" letterSpacing="-0.5px">Ctrl</text>
    <text x="62" y="27" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="900" fontSize="30" fill="#16A34A">S</text>
    <circle cx="100" cy="10" r="4" fill="#DC2626" />
  </svg>
);

// Core Services matching reference design
const HOMEPAGE_CORE_SERVICES = [
  {
    id: "tally-prime",
    title: "Tally Prime",
    desc: "Accounting software for your business growth.",
    logo: LogoTallyPrime,
    path: "/services/tally-prime",
  },
  {
    id: "tally-on-cloud",
    title: "Tally On Cloud",
    desc: "Access your data anytime, anywhere, securely.",
    logo: LogoTallyCloud,
    path: "/services/tally-on-cloud",
  },
  {
    id: "it-infra-security",
    title: "IT Infrastructure Management",
    desc: "Server, Network, Storage, Wi-Fi.",
    logo: LogoItInfra,
    path: "/services/it-infra-security",
  },
  {
    id: "datacenter-server-solutions",
    title: "Data Center & Server Solutions",
    desc: "Data Center Colocation, Server Setup & Maintenance.",
    logo: LogoDataCenterServer,
    path: "/services/data-center-cloud",
    badge: "NEW",
  },
  {
    id: "data-center-cloud",
    title: "Cloud Server & Hosting",
    desc: "IaaS, Microsoft Azure, AWS.",
    logo: LogoCloudHosting,
    path: "/services/data-center-cloud",
  },
  {
    id: "managed-it",
    title: "Managed IT Services",
    desc: "Proactive support for uninterrupted business operations.",
    logo: LogoManagedIt,
    path: "/services/it-infra-security",
  },
  {
    id: "cyber-security",
    title: "Cyber Security Solutions",
    desc: "Endpoint, Network, Security.",
    logo: LogoCyberSecurity,
    path: "/services/it-infra-security",
  },
  {
    id: "microsoft-licensing",
    title: "Microsoft Licensing Solutions",
    desc: "Microsoft 365, Windows, Server, Entra ID, Intune.",
    logo: LogoMicrosoftLicensing,
    path: "/services/it-infra-security",
  },
  {
    id: "it-repair-maintenance",
    title: "IT Product Repair & Maintenance",
    desc: "Desktop, laptop, printer, server & IT equipment repair & maintenance services.",
    logo: LogoItRepair,
    path: "/services/it-repair-maintenance",
  },
];

// Data Center Sub-Services / Pillars
const DATACENTER_PILLARS = [
  { id: 'colocation', title: 'Colocation', icon: Server },
  { id: 'server-installation', title: 'Server Installation', icon: HardDrive },
  { id: 'configuration', title: 'Configuration', icon: Cpu },
  { id: 'monitoring', title: 'Monitoring', icon: Clock },
  { id: 'maintenance', title: 'Maintenance', icon: Wrench },
  { id: 'disaster-recovery', title: 'Disaster Recovery', icon: ShieldCheck },
];

// Why Choose Us Pillars matching reference layout
const WHY_CHOOSE_ITEMS = [
  {
    id: 1,
    title: "Proven Experience",
    desc: "25+ years in IT industry",
    icon: Award,
  },
  {
    id: 2,
    title: "Skilled Professionals",
    desc: "Certified & experienced team",
    icon: Users,
  },
  {
    id: 3,
    title: "End-to-End Support",
    desc: "From setup to maintenance",
    icon: HeartHandshake,
  },
  {
    id: 4,
    title: "Customized Solutions",
    desc: "As per your business needs",
    icon: Layers,
  },
  {
    id: 5,
    title: "Scalable & Future Ready",
    desc: "Grow without limits",
    icon: Cpu,
  },
  {
    id: 6,
    title: "Client Satisfaction",
    desc: "Long-term partnerships",
    icon: ThumbsUp,
  },
];

// Industries We Serve matching reference layout
const INDUSTRIES_ITEMS = [
  { id: 1, name: "Healthcare", icon: HeartHandshake },
  { id: 2, name: "Education", icon: Building2 },
  { id: 3, name: "Manufacturing", icon: Cpu },
  { id: 4, name: "Retail", icon: Briefcase },
  { id: 5, name: "Real Estate", icon: Building2 },
  { id: 6, name: "Government", icon: Shield },
  { id: 7, name: "Others", icon: Globe },
];

// Testimonials matching reference layout
const TESTIMONIALS_DATA = [
  {
    id: 1,
    name: "Rajesh Kumar",
    role: "Business Owner",
    rating: 5,
    quote: "Net Infotech System has been our go-to IT partner for years. Their support and proactive approach have made a huge difference in our operations.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "IT Manager",
    rating: 5,
    quote: "Their team is highly skilled and responsive. They helped us set up a secure and efficient IT infrastructure seamlessly.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: 3,
    name: "Amit Verma",
    role: "Director",
    rating: 5,
    quote: "Excellent service, quick resolution and very supportive team. Highly recommended for all enterprise IT needs.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
  },
];

export default function HomePage({ onOpenDemo }) {
  useScrollReveal();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const prevTestimonial = () => {
    setActiveTestimonial((p) => (p - 1 + TESTIMONIALS_DATA.length) % TESTIMONIALS_DATA.length);
  };

  const nextTestimonial = () => {
    setActiveTestimonial((p) => (p + 1) % TESTIMONIALS_DATA.length);
  };

  return (
    <div className="home-page-view page-enter-active">
      
      {/* 1. HERO CAROUSEL SECTION */}
      <HeroCarousel onBookDemo={onOpenDemo} />

      {/* 2. OUR TRUSTED TECHNOLOGY PARTNERS BAR */}
      <TrustedPartnersSection />

      {/* 3. OUR CORE SERVICES (8 Grid Cards with Original Product Logos) */}
      <section className="nis-section nis-services-section reveal-fade-up">
        <div className="container">
          <div className="nis-services-header-row">
            <div>
              <div className="nis-section-badge-left">
                <span>OUR SERVICES</span>
              </div>
              <h2 className="nis-section-h2">
                Our <span className="gradient-text">Core Services</span>
              </h2>
              <p className="nis-section-sub-left">
                Comprehensive IT solutions to help your business operate smarter, safer and faster.
              </p>
            </div>
            <Link to="/services/tally-prime" className="nis-view-all-link">
              <span>View All Services</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="nis-services-grid-8">
            {HOMEPAGE_CORE_SERVICES.map((srv) => {
              const LogoComponent = srv.logo;
              return (
                <div key={srv.id} className="nis-core-service-card">
                  {srv.badge && (
                    <span className="nis-card-new-badge">{srv.badge}</span>
                  )}
                  <div className="nis-card-top-row">
                    <div className="nis-card-icon-box">
                      <LogoComponent />
                    </div>
                    <Link to={srv.path} className="nis-card-arrow-btn" aria-label={`Explore ${srv.title}`}>
                      <ArrowRight size={16} />
                    </Link>
                  </div>

                  <h3 className="nis-core-card-title">{srv.title}</h3>
                  <p className="nis-core-card-desc">{srv.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3.5. DEDICATED DATA CENTER & SERVER SOLUTIONS SECTION */}
      <section className="nis-section nis-datacenter-section reveal-fade-up">
        <div className="container">
          <div className="nis-datacenter-banner-wrapper">
            <div className="nis-datacenter-bg-overlay" />

            <div className="nis-datacenter-split-grid">
              {/* Left Content */}
              <div className="nis-datacenter-left">
                <div className="nis-datacenter-badge">
                  <span>DATA CENTER & SERVER SOLUTIONS</span>
                </div>
                <h2 className="nis-datacenter-h2">
                  Enterprise Infrastructure. <br />
                  <span className="gradient-text-sky">Professionally Managed.</span>
                </h2>
                <p className="nis-datacenter-sub">
                  From server procurement and installation to data center colocation, configuration, monitoring and ongoing maintenance, we provide complete server and infrastructure management for your business.
                </p>
                <div className="nis-datacenter-btn-wrapper">
                  <Link to="/services/data-center-cloud" className="nis-datacenter-primary-btn">
                    <span>Explore Data Center Solutions</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>

              {/* Right Side: Strategic Partnership CtrlS Card */}
              <div className="nis-datacenter-partner-card">
                <div className="nis-ctrls-header">
                  <span className="nis-ctrls-tag">Strategic Partnership with</span>
                  <div className="nis-ctrls-brand-row">
                    <LogoCtrlS />
                    <span className="nis-ctrls-tagline">Asia's Largest Rated 4 Datacenter</span>
                  </div>
                </div>

                <div className="nis-ctrls-features-list">
                  <div className="nis-ctrls-feature-item">
                    <CheckCircle2 size={18} className="nis-ctrls-check" />
                    <span>Rescue Solar-Cooling Environment</span>
                  </div>
                  <div className="nis-ctrls-feature-item">
                    <CheckCircle2 size={18} className="nis-ctrls-check" />
                    <span>Reliable Power & Cooling</span>
                  </div>
                  <div className="nis-ctrls-feature-item">
                    <CheckCircle2 size={18} className="nis-ctrls-check" />
                    <span>High-Speed Connectivity</span>
                  </div>
                  <div className="nis-ctrls-feature-item">
                    <CheckCircle2 size={18} className="nis-ctrls-check" />
                    <span>Remote Hands Support</span>
                  </div>
                  <div className="nis-ctrls-feature-item">
                    <CheckCircle2 size={18} className="nis-ctrls-check" />
                    <span>24/7 Monitoring & Security</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 6-Pillar Sub-Services Strip */}
            <div className="nis-datacenter-pillars-bar">
              {DATACENTER_PILLARS.map((pillar) => {
                const IconComponent = pillar.icon;
                return (
                  <div key={pillar.id} className="nis-dc-pillar-item">
                    <div className="nis-dc-pillar-icon">
                      <IconComponent size={20} />
                    </div>
                    <span className="nis-dc-pillar-title">{pillar.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. ABOUT NISPL / YOUR PARTNER IN DIGITAL TRANSFORMATION */}
      <section className="nis-section nis-about-section reveal-fade-up">
        <div className="container">
          <div className="nis-about-split-grid">
            {/* Left Side: Office Building Image with Stats Overlay */}
            <div className="nis-about-image-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000" 
                alt="Net Infotech System Corporate Office" 
                className="nis-about-building-img"
              />
              <div className="nis-about-image-badge-overlay">
                <div className="nis-about-overlay-stat">
                  <strong>25+</strong>
                  <span>Years of Excellence</span>
                </div>
                <div className="nis-about-overlay-stat">
                  <strong>500+</strong>
                  <span>Happy Clients</span>
                </div>
                <div className="nis-about-overlay-stat">
                  <strong>1000+</strong>
                  <span>Projects Delivered</span>
                </div>
              </div>
            </div>

            {/* Right Side: Text + 4 Feature Cards */}
            <div className="nis-about-content">
              <div className="nis-section-badge-left">
                <span>ABOUT NISPL</span>
              </div>
              <h2 className="nis-section-h2">
                Your Partner in <br />
                <span className="gradient-text">Digital Transformation</span>
              </h2>
              <p className="nis-about-body">
                Net Infotech System Pvt. Ltd. (NISPL) is a trusted IT solutions provider, delivering innovative and reliable technology services to businesses across various industries. With 25+ years of experience, we help organizations build secure, scalable and efficient IT environments.
              </p>

              <div className="nis-about-actions-row">
                <Link to="/about" className="nis-primary-btn">
                  <span>Learn More About Us</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* 4 Feature Cards Stack */}
              <div className="nis-about-pillars-grid">
                <div className="nis-pillar-card">
                  <div className="nis-pillar-icon"><Award size={18} /></div>
                  <div>
                    <h4>Expertise & Experience</h4>
                    <p>25+ years in IT industry</p>
                  </div>
                </div>

                <div className="nis-pillar-card">
                  <div className="nis-pillar-icon"><Users size={18} /></div>
                  <div>
                    <h4>Client-Centric Approach</h4>
                    <p>Long-term partnerships</p>
                  </div>
                </div>

                <div className="nis-pillar-card">
                  <div className="nis-pillar-icon"><ShieldCheck size={18} /></div>
                  <div>
                    <h4>Reliable & Secure</h4>
                    <p>Your data, our priority</p>
                  </div>
                </div>

                <div className="nis-pillar-card">
                  <div className="nis-pillar-icon"><Cpu size={18} /></div>
                  <div>
                    <h4>Innovation Driven</h4>
                    <p>Future-ready solutions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US SECTION */}
      <section className="nis-section nis-why-section reveal-fade-up">
        <div className="container">
          <div className="section-title-center reveal-fade-up">
            <div className="nis-section-badge">
              <span>WHY CHOOSE US</span>
            </div>
            <h2 className="nis-section-h2">
              Why Choose Us
            </h2>
            <p className="nis-section-sub">
              We combine technology, expertise and commitment to deliver the best IT solutions for your business needs.
            </p>
          </div>

          <div className="nis-why-split-container">
            {/* 6 Feature Cards */}
            <div className="nis-why-cards-grid">
              {WHY_CHOOSE_ITEMS.map((item) => {
                const IconComp = item.icon;
                return (
                  <div key={item.id} className="nis-why-mini-card">
                    <div className="nis-why-mini-icon">
                      <IconComp size={20} color="#0284C7" />
                    </div>
                    <h4 className="nis-why-mini-title">{item.title}</h4>
                    <p className="nis-why-mini-desc">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Right Callout Banner Card */}
            <div className="nis-why-callout-card">
              <div className="nis-why-callout-content">
                <h3>Building Smarter Businesses Together</h3>
                <button type="button" className="nis-why-callout-btn" onClick={onOpenDemo}>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INDUSTRIES WE SERVE (Dark Navy Blue Section matching reference screenshot) */}
      <section className="nis-section nis-industries-dark-section reveal-fade-up">
        <div className="container">
          <div className="nis-industries-split-grid">
            {/* Left Content */}
            <div className="nis-industries-left">
              <div className="nis-dark-badge">
                <span>INDUSTRIES</span>
              </div>
              <h2 className="nis-dark-h2">
                Industries <span className="gradient-text-sky">We Serve</span>
              </h2>
              <p className="nis-dark-sub">
                We provide tailored IT solutions for a wide range of industries, helping them achieve efficiency, security and growth.
              </p>
              <Link to="/solutions" className="nis-dark-outline-btn">
                <span>View All Industries</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right Industry Cards Grid */}
            <div className="nis-industries-grid">
              {INDUSTRIES_ITEMS.map((ind) => {
                const IconComp = ind.icon;
                return (
                  <div key={ind.id} className="nis-industry-card">
                    <div className="nis-industry-icon">
                      <IconComp size={22} />
                    </div>
                    <span className="nis-industry-name">{ind.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS (What Our Clients Say) */}
      <section className="nis-section nis-testimonials-section reveal-fade-up">
        <div className="container">
          <div className="nis-testimonials-header-row">
            <div>
              <div className="nis-section-badge-left">
                <span>TESTIMONIALS</span>
              </div>
              <h2 className="nis-section-h2">
                What Our Clients Say
              </h2>
              <p className="nis-section-sub-left">
                We take pride in building long-term relationships with our clients. Here's what they have to say about us.
              </p>
            </div>

            {/* Slider Navigation Arrows */}
            <div className="nis-testimonial-nav-arrows">
              <button type="button" className="nis-testi-arrow" onClick={prevTestimonial} aria-label="Previous testimonial">
                <ChevronLeft size={20} />
              </button>
              <button type="button" className="nis-testi-arrow" onClick={nextTestimonial} aria-label="Next testimonial">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="nis-testimonials-grid">
            {TESTIMONIALS_DATA.map((t, idx) => (
              <div 
                key={t.id} 
                className={`nis-testimonial-card ${idx === activeTestimonial ? 'active-testi-card' : ''}`}
              >
                <p className="nis-testi-quote">"{t.quote}"</p>
                <div className="nis-testi-user-row">
                  <img src={t.avatar} alt={t.name} className="nis-testi-avatar" />
                  <div className="nis-testi-user-info">
                    <h4>{t.name}</h4>
                    <span>{t.role}</span>
                    <div className="nis-testi-stars">
                      {[...Array(t.rating)].map((_, sIdx) => (
                        <Star key={sIdx} size={14} fill="#F59E0B" color="#F59E0B" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. OUR CLIENTS LOGO SHOWCASE */}
      <OurClientsSection onOpenDemo={onOpenDemo} />

      {/* 9. CALL TO ACTION BANNER (Ready to Build Your IT Future?) */}
      <section className="nis-cta-banner-section reveal-fade-up">
        <div className="container">
          <div className="nis-cta-banner-card reveal-scale">
            <div className="cta-left">
              <span className="cta-badge">LET'S WORK TOGETHER</span>
              <h2 className="cta-title">Ready to Build Your IT Future?</h2>
              <p className="cta-desc">
                Get in touch with our experts for the right IT solution tailored to your business.
              </p>
            </div>
            <div className="cta-right">
              <button 
                type="button" 
                className="cta-btn-primary"
                onClick={onOpenDemo}
              >
                <span>Get a Quote</span>
                <ArrowRight size={16} />
              </button>
              <Link to="/contact" className="cta-btn-secondary">
                <span>Contact Us</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
