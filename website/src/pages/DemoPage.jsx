import { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  Search, 
  ArrowRight, 
  Cloud, 
  Users, 
  Monitor, 
  Lock, 
  Building2, 
  ShoppingCart, 
  Stethoscope, 
  GraduationCap, 
  Briefcase, 
  HardHat, 
  Truck, 
  Hotel,
  Award,
  Clock,
  Headphones,
  Menu,
  X,
  MessageSquare,
  Server,
  Settings,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  CheckCircle2,
  Sparkles,
  Zap,
  Shield
} from 'lucide-react';
import logoImg from '../assets/net-infotech-final-logo-2-1-e1782735646883.png.webp';
import sfdcLogo from '../assets/SFDC_logo.png';
import teaBoardLogo from '../assets/tea_board_logo.png';
import './DemoPage.css';

/* SVG Social Icons */
const LinkedinIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const FacebookIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YoutubeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const InstagramIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

/* Styled Partner Logo Components */
const PartnerTally = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <img 
      src="https://cdn.brandfetch.io/tally.so/w/400/h/400" 
      alt="Tally Logo" 
      className="demo-partner-logo-img"
      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
    />
    <span style={{ display: 'none', fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: '1.2rem', color: '#062B4F' }}>Tally</span>
  </div>
);

const PartnerMicrosoft = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <img 
      src="https://cdn.brandfetch.io/microsoft.com/w/400/h/400" 
      alt="Microsoft Logo" 
      className="demo-partner-logo-img"
      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
    />
    <div style={{ display: 'none', alignItems: 'center', gap: '6px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', width: '16px', height: '16px' }}>
        <div style={{ background: '#F25022' }} /><div style={{ background: '#7FBA00' }} />
        <div style={{ background: '#00A4EF' }} /><div style={{ background: '#FFB900' }} />
      </div>
      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#737373' }}>Microsoft</span>
    </div>
  </div>
);

const PartnerGoogle = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <img 
      src="https://cdn.brandfetch.io/google.com/w/400/h/400" 
      alt="Google Workspace Logo" 
      className="demo-partner-logo-img"
      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
    />
    <span style={{ display: 'none', fontWeight: 800, fontSize: '0.95rem', color: '#4285F4' }}>Google Workspace</span>
  </div>
);

const PartnerCtrlS = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <img 
      src="https://cdn.brandfetch.io/ctrls.in/w/400/h/400" 
      alt="CtrlS Datacenter Logo" 
      className="demo-partner-logo-img"
      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
    />
    <span style={{ display: 'none', fontWeight: 900, fontSize: '1.1rem', color: '#00A651' }}>Ctrl<span style={{ color: '#062B4F' }}>S</span></span>
  </div>
);

const PartnerLenovo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <img 
      src="https://cdn.brandfetch.io/lenovo.com/w/400/h/400" 
      alt="Lenovo Logo" 
      className="demo-partner-logo-img"
      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
    />
    <div style={{ display: 'none', background: '#E2231A', color: '#FFF', padding: '2px 8px', fontWeight: 900, fontStyle: 'italic', borderRadius: '3px' }}>Lenovo</div>
  </div>
);

const PartnerZHMPO = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <div style={{ background: 'linear-gradient(135deg, #078BE8, #062B4F)', color: '#FFF', padding: '3px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '0.78rem' }}>ZHMPO</div>
    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>Authorized Partner</span>
  </div>
);

/* The 8 Official Services Data */
const OFFICIAL_8_SERVICES = [
  {
    id: 1,
    title: "Enterprise Cloud",
    category: "CLOUD",
    bullets: ["Cloud migration", "Cloud consulting"],
    icon: Cloud,
    desc: "Seamless cloud migration strategy, multi-cloud management, and enterprise cloud architecture tailored for maximum scalability and cost optimization."
  },
  {
    id: 2,
    title: "IT Infrastructure Management",
    category: "INFRA",
    bullets: ["Server", "Network", "Storage", "Wi-Fi"],
    icon: Server,
    desc: "Complete lifecycle management of high-performance servers, enterprise SAN storage, LAN switching, and structured cabling for seamless operations."
  },
  {
    id: 3,
    title: "Cloud Server & Hosting",
    category: "CLOUD",
    bullets: ["CtrlS", "Microsoft Azure", "AWS"],
    icon: Cloud,
    desc: "Dedicated cloud hosting on CtrlS Tier-IV datacenter, Microsoft Azure, and AWS with high availability, high IOPS SSD storage, and automated failover."
  },
  {
    id: 4,
    title: "Managed IT Services",
    category: "INFRA",
    bullets: ["CCTV", "LAN Setup", "Attendance System", "Online UPS", "Antivirus", "AMC"],
    icon: Settings,
    desc: "Comprehensive IT upkeep including surveillance, biometric access, structured cabling, UPS power backup, centralized endpoint security, and annual maintenance."
  },
  {
    id: 5,
    title: "Cyber Security Solutions",
    category: "SECURITY",
    bullets: ["Endpoint", "Network", "Security"],
    icon: Lock,
    desc: "Next-generation network firewalls, endpoint protection (EDR), email filtering, ransomware mitigation, and continuous vulnerability monitoring."
  },
  {
    id: 6,
    title: "Microsoft Licensing Solutions",
    category: "BUSINESS",
    bullets: ["Microsoft 365", "Windows", "Server Entra ID", "Intune"],
    icon: Monitor,
    desc: "Authorized procurement, deployment, and cloud identity management for Microsoft 365, Windows Server, Entra ID (Azure AD), and Intune endpoint control."
  },
  {
    id: 7,
    title: "Tally Solutions",
    category: "BUSINESS",
    bullets: ["Accounting for a better tomorrow"],
    icon: ShieldCheck,
    desc: "Authorized TallyPrime sales, multi-user customization, Tally Server implementation, and ongoing financial accounting tech support."
  },
  {
    id: 8,
    title: "Tally on Cloud",
    category: "BUSINESS",
    bullets: ["Access Anytime", "Anywhere", "Securely"],
    icon: Cloud,
    desc: "High-speed cloud server hosting for TallyPrime with bank-grade encryption, multi-user concurrent access from any device, and automated daily backups."
  }
];

/* Data Center Dynamic Tabs Data */
const DATACENTER_TABS = [
  {
    id: 0,
    label: 'Colocation',
    title: 'Tier IV Datacenter Colocation',
    desc: 'Host your mission-critical servers in Asia\'s largest Rated-4 datacenter with 99.999% SLA uptime, redundant power feeds, and advanced biometric perimeter security.',
    features: ['Asia\'s Largest Rated 4 Datacenter (CtrlS)', 'Dual Active-Active Power Substation Feeds', 'Biometric & Mantrap Perimeter Security', 'Precision HVAC Temperature & Humidity Control']
  },
  {
    id: 1,
    label: 'Server Installation',
    title: 'Precision Rack & Hardware Setup',
    desc: 'Expert deployment of rack-mounted servers, SAN/NAS storage arrays, hyper-converged infrastructure, and high-density network switches.',
    features: ['Custom Rack Architecture & Cable Management', 'SAN / NAS Fibre Channel Storage Configuration', 'Firmware Updates & Hardware Diagnostics', 'Power Distribution Unit (PDU) Balancing']
  },
  {
    id: 2,
    label: 'Configuration',
    title: 'Hypervisor & Enterprise OS Tuning',
    desc: 'End-to-end setup of VMware ESXi, Hyper-V, Proxmox, Active Directory Domain Services, VLAN routing, and enterprise SAN volume mapping.',
    features: ['Enterprise VMware & Microsoft Hyper-V Deployment', 'Active Directory, GPO & DNS Architecture', 'VLAN Segmentation & Next-Gen Firewall Routing', 'High Availability Cluster & Live Migration Setup']
  },
  {
    id: 3,
    label: 'Monitoring',
    title: '24x7 NOC Telemetry & Threat Watch',
    desc: 'Continuous real-time monitoring of CPU utilization, memory thresholds, disk IOPS, network latency, thermal telemetry, and intrusion logs.',
    features: ['24x7x365 Network Operations Center (NOC)', 'Automated Instant Alert Escalation (SMS/Email)', 'Bandwidth Latency & Traffic Telemetry', 'Thermal, Power & Hardware Sensor Audit']
  },
  {
    id: 4,
    label: 'Maintenance',
    title: 'Preventative Maintenance & SLAs',
    desc: 'Comprehensive Annual Maintenance Contracts (AMC) with strict SLA turnaround times, preventative health audits, and spare part replacement guarantees.',
    features: ['Guaranteed On-Site SLA Response Times', 'Quarterly Preventative Health Audits', 'Hot-Swappable Spare Component Management', 'Vendor Warranty & RMA Logistics Handling']
  },
  {
    id: 5,
    label: 'Disaster Recovery',
    title: 'Business Continuity & Cloud Backup',
    desc: 'Robust Disaster Recovery as a Service (DRaaS) with automated delta replication to secondary datacenter zones, achieving near-zero data loss.',
    features: ['Automated Off-Site Data Synchronization', 'RPO < 15 Mins & RTO < 60 Mins SLA', 'Encrypted Cloud & Immutable Storage Snapshots', 'Bi-Annual Disaster Failover Drills']
  }
];

/* FAQ Accordion Data */
const FAQ_ITEMS = [
  {
    q: "What makes Net Infotech System the preferred IT partner in India?",
    a: "With over 26 years of engineering excellence and a portfolio of 2,500+ satisfied clients across corporate and government sectors, Net Infotech System offers comprehensive end-to-end IT solutions. We combine authorized tier-1 partnerships (Microsoft, Tally, CtrlS, Lenovo) with dedicated pan-India support and guaranteed SLA response times."
  },
  {
    q: "How does Tally on Cloud enhance daily accounting & business management?",
    a: "Tally on Cloud enables your team to securely access TallyPrime anytime, anywhere from any device (Windows, Mac, tablet). It eliminates the need for expensive local servers, guarantees automated daily offsite backups, protects against ransomware attacks, and supports multi-location concurrent user access with fast local printing."
  },
  {
    q: "What services are included under Managed IT Services & AMC?",
    a: "Our Managed IT Services & Annual Maintenance Contracts (AMC) cover full IT infrastructure lifecycle management: server and workstation upkeep, LAN/Wi-Fi network optimization, CCTV surveillance, biometric attendance systems, online UPS management, centralized antivirus deployment, regular preventative audits, and 24/7 helpdesk support."
  },
  {
    q: "How do you handle Microsoft 365 licensing, deployment, and cloud migration?",
    a: "As a Microsoft Authorized Licensing Partner, we provide complete advisory, procurement, and technical deployment for Microsoft 365, Windows Server, Entra ID (Azure AD), and Intune. Our cloud engineers manage seamless zero-downtime mailbox migrations from legacy servers or Google Workspace to Microsoft 365."
  },
  {
    q: "What cybersecurity measures do you implement to protect corporate data?",
    a: "We deploy multi-layered security architectures including UTM Next-Gen Firewalls, Endpoint Detection & Response (EDR), cloud-encrypted backup systems with ransomware protection, identity access management, and regular security vulnerability assessments to keep your business resilient against cyber threats."
  },
  {
    q: "How fast can your team begin an IT infrastructure audit for our company?",
    a: "We can initiate an initial digital & infrastructure assessment within 24 hours of receiving your request. Our team conducts on-site or remote analysis, identifies operational bottlenecks and security gaps, and provides a customized transformation roadmap free of charge."
  }
];

export default function DemoPage({ onOpenDemo }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [datacenterTab, setDatacenterTab] = useState(0);
  const [solutionsCategory, setSolutionsCategory] = useState('ALL');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAssessmentClick = () => {
    if (onOpenDemo) {
      onOpenDemo();
    } else {
      window.location.href = '#contact';
    }
  };

  const filteredServices = OFFICIAL_8_SERVICES.filter(srv => {
    if (solutionsCategory === 'ALL') return true;
    return srv.category === solutionsCategory;
  });

  return (
    <div className="demo-page-container">
      {/* ===================================================
         1. TOP INFORMATION BAR
         =================================================== */}
      <div className="demo-top-bar">
        <div className="demo-container demo-top-bar-inner">
          <div className="demo-top-bar-left">
            <span className="demo-pulse-badge"><span className="demo-pulse-dot" /> 24/7 Support Active</span>
            <span className="demo-top-bar-divider">|</span>
            <span>26+ Years of IT Excellence</span>
            <span className="demo-top-bar-divider">|</span>
            <span>2,500+ Corporate Clients</span>
            <span className="demo-top-bar-divider">|</span>
            <span>Kolkata & Pan-India Support</span>
          </div>
          <div className="demo-top-bar-right">
            <div className="demo-top-bar-links">
              <a href="#portal">Customer Portal</a>
              <span className="demo-top-bar-divider">|</span>
              <a href="#partner">Partner Portal</a>
              <span className="demo-top-bar-divider">|</span>
              <a href="#support">Support</a>
              <span className="demo-top-bar-divider">|</span>
            </div>
            <div className="demo-top-bar-socials">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <LinkedinIcon size={14} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <FacebookIcon size={14} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                <YoutubeIcon size={14} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <InstagramIcon size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================
         2. MAIN HEADER / NAVIGATION
         =================================================== */}
      <header className="demo-header">
        <div className="demo-container demo-header-inner">
          <a href="/demo" className="demo-brand-logo">
            {!imgError ? (
              <img 
                src={logoImg} 
                alt="Net Infotech System Logo" 
                className="demo-logo-img" 
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="demo-brand-emblem-fallback">N</div>
            )}
          </a>

          <div className="demo-header-contact-actions">
            <div className="demo-header-info-item">
              <div className="demo-header-icon-box">
                <Phone size={18} />
              </div>
              <div className="demo-header-info-content">
                <span className="demo-header-info-label">Call Us Today</span>
                <a href="tel:+913340645300" className="demo-header-info-val">+91 33 4064 5300</a>
              </div>
            </div>

            <div className="demo-header-info-item">
              <div className="demo-header-icon-box">
                <Mail size={18} />
              </div>
              <div className="demo-header-info-content">
                <span className="demo-header-info-label">Email Support</span>
                <a href="mailto:info@netinfotechsystem.com" className="demo-header-info-val">info@netinfotechsystem.com</a>
              </div>
            </div>

            <button className="demo-btn-assess" onClick={handleAssessmentClick}>
              <Sparkles size={16} /> Get Free Assessment
            </button>

            <a href="https://wa.me/913340645300" target="_blank" rel="noreferrer" className="demo-btn-whatsapp">
              <MessageSquare size={16} /> WhatsApp Us
            </a>
          </div>

          <button 
            className="demo-mobile-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </header>

      {/* HORIZONTAL NAVIGATION BAR */}
      <nav className="demo-nav-bar">
        <div className="demo-container demo-nav-inner">
          <ul className={`demo-nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <li className="demo-nav-item active"><a href="/demo">Home</a></li>
            <li className="demo-nav-item"><a href="#solutions">Solutions</a></li>
            <li className="demo-nav-item"><a href="#cloud">Cloud</a></li>
            <li className="demo-nav-item"><a href="#datacenter">Data Center</a></li>
            <li className="demo-nav-item"><a href="#business-apps">Business Applications</a></li>
            <li className="demo-nav-item"><a href="#clients">Our Clients</a></li>
            <li className="demo-nav-item"><a href="#industries">Industries</a></li>
            <li className="demo-nav-item"><a href="#faq">FAQ</a></li>
            <li className="demo-nav-item"><a href="#contact">Contact</a></li>
          </ul>
          <button className="demo-nav-search-btn" onClick={handleAssessmentClick} aria-label="Search website">
            <Search size={19} />
          </button>
        </div>
      </nav>

      {/* ===================================================
         3. HERO SECTION (OFFICIAL 8-SERVICES BANNER MATRIX)
         =================================================== */}
      <section className="demo-hero">
        <div className="demo-hero-grid-pattern"></div>
        <div className="demo-hero-glow-orb orb-1"></div>
        <div className="demo-hero-glow-orb orb-2"></div>

        <div className="demo-container">
          <div className="demo-hero-grid">
            <div className="demo-hero-content">
              <div className="demo-hero-badge-glow">
                <Zap size={14} style={{ color: '#00AEEF' }} />
                <span>EASTERN INDIA&apos;S PREMIER ENTERPRISE IT INTEGRATOR</span>
              </div>
              
              <h1 className="demo-hero-title">
                Your Trusted<br />
                <span className="demo-gradient-text-cyan">IT Partner</span>
              </h1>

              <div className="demo-hero-slogan-handwriting">
                <span>Build</span> • <span>Manage</span> • <span>Grow</span>
              </div>

              <div className="demo-hero-services-line">
                Enterprise Cloud • IT Infrastructure • Cloud Server & Hosting<br />
                Managed IT Services • Cyber Security • Microsoft Licensing<br />
                Tally Solutions • Tally on Cloud
              </div>

              <p className="demo-hero-desc">
                We empower enterprises, SMBs, and government institutions with robust IT infrastructure, cloud acceleration, next-gen cybersecurity, and automated business workflows.
              </p>

              <div className="demo-hero-btns">
                <button className="demo-btn-primary-hero" onClick={handleAssessmentClick}>
                  Get a Free Digital Assessment <ArrowRight size={18} />
                </button>
                <a href="tel:+913340645300" className="demo-btn-secondary-hero">
                  <Phone size={16} /> Talk to an Expert
                </a>
              </div>

              <div className="demo-hero-trust-proof">
                <div className="demo-trust-check-item">
                  <CheckCircle2 size={16} style={{ color: '#00AEEF' }} /> <span>Authorized Microsoft Partner</span>
                </div>
                <div className="demo-trust-check-item">
                  <CheckCircle2 size={16} style={{ color: '#00AEEF' }} /> <span>CtrlS Tier IV Datacenter</span>
                </div>
                <div className="demo-trust-check-item">
                  <CheckCircle2 size={16} style={{ color: '#00AEEF' }} /> <span>Tally 5-Star Partner</span>
                </div>
              </div>
            </div>

            {/* THE ENHANCED HIGH-TECH GLASSMORPHISM HERO BANNER CARD */}
            <div className="demo-hero-banner-proficient-card">
              <img 
                src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop" 
                alt="IT Data Center Background" 
                className="demo-hero-card-bg-photo"
              />

              <div className="demo-matrix-header-bar-proficient">
                <div className="demo-matrix-brand-text-proficient">
                  <strong>NET INFOTECH SYSTEM PVT. LTD.</strong>
                  <span>Your Trusted IT Partner</span>
                </div>
                <div className="demo-matrix-badge-pill-proficient">OUR 8 CORE SERVICES</div>
              </div>

              <div className="demo-matrix-8-grid-proficient">
                {OFFICIAL_8_SERVICES.map((srv) => {
                  const IconComp = srv.icon;
                  return (
                    <div key={srv.id} className="demo-matrix-service-box-proficient">
                      <div className="demo-matrix-icon-circle-proficient">
                        <IconComp size={18} />
                      </div>
                      <div className="demo-matrix-service-info-proficient">
                        <strong>{srv.title}</strong>
                        <p>{srv.bullets.join(' • ')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Credibility Stats Bar */}
        <div className="demo-hero-stats-bar">
          <div className="demo-container demo-hero-stats-grid">
            <div className="demo-stat-item">
              <div className="demo-stat-icon"><Award /></div>
              <div>
                <div className="demo-stat-num">26+</div>
                <div className="demo-stat-label">Years of IT Excellence</div>
              </div>
            </div>
            <div className="demo-stat-item">
              <div className="demo-stat-icon"><Users /></div>
              <div>
                <div className="demo-stat-num">2,500+</div>
                <div className="demo-stat-label">Corporate Clients</div>
              </div>
            </div>
            <div className="demo-stat-item">
              <div className="demo-stat-icon"><Clock /></div>
              <div>
                <div className="demo-stat-num">99.99%</div>
                <div className="demo-stat-label">Guaranteed Uptime</div>
              </div>
            </div>
            <div className="demo-stat-item">
              <div className="demo-stat-icon"><Headphones /></div>
              <div>
                <div className="demo-stat-num">Pan-India</div>
                <div className="demo-stat-label">24/7 Rapid Helpdesk</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
         4. TECHNOLOGY PARTNERS SECTION
         =================================================== */}
      <section className="demo-partners-section">
        <div className="demo-container">
          <h3 className="demo-partners-title">Strategic Strategic Technology Alliances</h3>
          <div className="demo-partners-row">
            <div className="demo-partner-card-real"><PartnerTally /></div>
            <div className="demo-partner-card-real"><PartnerMicrosoft /></div>
            <div className="demo-partner-card-real"><PartnerZHMPO /></div>
            <div className="demo-partner-card-real"><PartnerGoogle /></div>
            <div className="demo-partner-card-real"><PartnerCtrlS /></div>
            <div className="demo-partner-card-real"><PartnerLenovo /></div>
          </div>
        </div>
      </section>

      {/* ===================================================
         5. PRESTIGIOUS CLIENTS GRID
         =================================================== */}
      <section className="demo-clients-section" id="clients">
        <div className="demo-container">
          <div className="demo-section-header">
            <span className="demo-section-tag">PRESTIGIOUS CLIENTELE</span>
            <h2 className="demo-section-heading">Trusted by Industry Pioneers & Govt. Enterprises</h2>
            <p className="demo-section-sub">
              Delivering secure, scalable, and resilient digital solutions for India&apos;s leading brands.
            </p>
          </div>

          <div className="demo-clients-grid">
            {[
              { id: 1, name: "Tata Steel", url: "https://cdn.brandfetch.io/tatasteel.com/w/400/h/400", fallback: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Tata_logo.svg" },
              { id: 2, name: "Larsen & Toubro", url: "https://cdn.brandfetch.io/larsentoubro.com/w/400/h/400", fallback: "https://upload.wikimedia.org/wikipedia/commons/e/e5/L%26T.png" },
              { id: 3, name: "ITC Limited", url: "https://cdn.brandfetch.io/itcportal.com/w/400/h/400", fallback: "https://upload.wikimedia.org/wikipedia/commons/f/ff/ITC_Limited_Logo.svg" },
              { id: 4, name: "Govt. of WB (SFDC)", url: sfdcLogo, fallback: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Emblem_of_West_Bengal.svg" },
              { id: 5, name: "Tea Board of India", url: teaBoardLogo, fallback: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Emblem_of_India.svg" },
              { id: 6, name: "Reliance Industries", url: "https://cdn.brandfetch.io/ril.com/w/400/h/400", fallback: "https://upload.wikimedia.org/wikipedia/en/9/99/Reliance_Industries_Logo.svg" },
              { id: 7, name: "Emami Group", url: "https://cdn.brandfetch.io/emamigroup.com/w/400/h/400" },
              { id: 8, name: "Exide Industries", url: "https://cdn.brandfetch.io/exideindustries.com/w/400/h/400" }
            ].map((client) => (
              <div key={client.id} className="demo-client-card">
                <img 
                  src={client.url} 
                  alt={`${client.name} Original Logo`}
                  style={{ maxHeight: '44px', maxWidth: '140px', objectFit: 'contain' }}
                  onError={(e) => {
                    if (client.fallback && e.target.src !== client.fallback) {
                      e.target.src = client.fallback;
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================
         6. OUR SOLUTIONS SECTION (WITH INTERACTIVE FILTERING)
         =================================================== */}
      <section className="demo-solutions-section" id="solutions">
        <div className="demo-container">
          <div className="demo-section-header">
            <span className="demo-section-tag">OUR SOLUTIONS & SERVICES</span>
            <h2 className="demo-section-heading">Everything Your Enterprise Needs to Scale</h2>
            <p className="demo-section-sub">
              Filter by service line to explore our core technology capabilities.
            </p>

            {/* Interactive Service Category Filter Tabs */}
            <div className="demo-solutions-filter-bar">
              <button 
                className={`demo-filter-pill ${solutionsCategory === 'ALL' ? 'active' : ''}`}
                onClick={() => setSolutionsCategory('ALL')}
              >
                All 8 Services
              </button>
              <button 
                className={`demo-filter-pill ${solutionsCategory === 'CLOUD' ? 'active' : ''}`}
                onClick={() => setSolutionsCategory('CLOUD')}
              >
                Cloud Solutions
              </button>
              <button 
                className={`demo-filter-pill ${solutionsCategory === 'INFRA' ? 'active' : ''}`}
                onClick={() => setSolutionsCategory('INFRA')}
              >
                IT Infrastructure
              </button>
              <button 
                className={`demo-filter-pill ${solutionsCategory === 'SECURITY' ? 'active' : ''}`}
                onClick={() => setSolutionsCategory('SECURITY')}
              >
                Cybersecurity
              </button>
              <button 
                className={`demo-filter-pill ${solutionsCategory === 'BUSINESS' ? 'active' : ''}`}
                onClick={() => setSolutionsCategory('BUSINESS')}
              >
                Business Apps & Tally
              </button>
            </div>
          </div>

          <div className="demo-solutions-grid-4">
            {filteredServices.map((srv) => {
              const IconComponent = srv.icon;
              return (
                <div key={srv.id} className="demo-sol-card">
                  <div className="demo-sol-icon-header">
                    <IconComponent size={24} />
                  </div>
                  <h3 className="demo-sol-card-title">{srv.title}</h3>
                  <p className="demo-sol-card-desc">{srv.desc}</p>
                  <ul className="demo-sol-bullets">
                    {srv.bullets.map((b, idx) => (
                      <li key={idx}><CheckCircle2 size={13} style={{ color: '#00AEEF', flexShrink: 0 }} /> {b}</li>
                    ))}
                  </ul>
                  <button className="demo-sol-btn" onClick={handleAssessmentClick}>
                    Learn More <ArrowRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================
         7. DATA CENTER / SERVER FEATURE BANNER WITH LIVE TABS
         =================================================== */}
      <section className="demo-datacenter-section" id="datacenter">
        <div className="demo-container">
          <div className="demo-datacenter-grid">
            <div className="demo-datacenter-text">
              <span className="demo-datacenter-tag">ENTERPRISE DATA CENTER & SERVERS</span>
              <h2 className="demo-datacenter-title">Mission-Critical Datacenter.<br />Zero Compromise Security.</h2>
              <p className="demo-datacenter-desc">
                From server procurement, colocation, SAN storage clustering to 24/7/365 NOC telemetry, we engineer high-performance data center backbones for business resilience.
              </p>

              {/* Dynamic Active Feature Detail Display */}
              <div className="demo-datacenter-active-card">
                <div className="demo-datacenter-active-header">
                  <Shield size={20} style={{ color: '#00AEEF' }} />
                  <h4>{DATACENTER_TABS[datacenterTab].title}</h4>
                </div>
                <p className="demo-datacenter-active-desc">{DATACENTER_TABS[datacenterTab].desc}</p>
                <div className="demo-datacenter-active-features">
                  {DATACENTER_TABS[datacenterTab].features.map((feat, idx) => (
                    <div key={idx} className="demo-dc-feature-item">
                      <span className="demo-dc-check">✓</span> {feat}
                    </div>
                  ))}
                </div>
              </div>

              <button className="demo-btn-primary-hero" onClick={handleAssessmentClick} style={{ marginTop: '20px' }}>
                Explore Data Center Infrastructure <ArrowRight size={18} />
              </button>
            </div>

            <div className="demo-datacenter-img-box">
              <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop" alt="Data Center Server Room" />
              <div className="demo-datacenter-floating-card">
                <div className="demo-floating-partner-tag">Strategic Datacenter Partner</div>
                <div className="demo-floating-partner-brand">CtrlS</div>
                <div className="demo-floating-partner-sub">Asia's Largest Rated 4 Datacenter</div>
                <ul className="demo-floating-checklist">
                  <li><span>✓</span> 99.999% SLA Datacenter Uptime</li>
                  <li><span>✓</span> Dual Power & Precision Cooling</li>
                  <li><span>✓</span> High-Bandwidth Low-Latency Backbone</li>
                  <li><span>✓</span> On-Site Remote Hands Support</li>
                  <li><span>✓</span> 24x7 Physical & Logical Security</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Interactive Horizontal Tabs Selector */}
          <div className="demo-datacenter-tabs-row">
            {DATACENTER_TABS.map((tab) => (
              <button 
                key={tab.id}
                className={`demo-datacenter-tab ${datacenterTab === tab.id ? 'active' : ''}`}
                onClick={() => setDatacenterTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================
         8. DIGITAL TRANSFORMATION JOURNEY
         =================================================== */}
      <section className="demo-journey-section">
        <div className="demo-container">
          <div className="demo-section-header">
            <span className="demo-section-tag">TRANSFORMATION METHODOLOGY</span>
            <h2 className="demo-section-heading">Your 6-Step Digital Growth Journey</h2>
            <p className="demo-section-sub">
              A structured roadmap ensuring seamless implementation, maximum security, and business continuity.
            </p>
          </div>

          <div className="demo-journey-grid">
            <div className="demo-journey-card">
              <div className="demo-journey-step">01</div>
              <h3 className="demo-journey-title">Assess</h3>
              <p className="demo-journey-desc">Audit current infrastructure, security posture & workflow requirements</p>
              <div className="demo-journey-arrow">→</div>
            </div>

            <div className="demo-journey-card">
              <div className="demo-journey-step">02</div>
              <h3 className="demo-journey-title">Secure</h3>
              <p className="demo-journey-desc">Deploy firewall defenses, EDR endpoints & data encryption</p>
              <div className="demo-journey-arrow">→</div>
            </div>

            <div className="demo-journey-card">
              <div className="demo-journey-step">03</div>
              <h3 className="demo-journey-title">Modernize</h3>
              <p className="demo-journey-desc">Migrate workloads to high-speed cloud servers & Microsoft 365</p>
              <div className="demo-journey-arrow">→</div>
            </div>

            <div className="demo-journey-card">
              <div className="demo-journey-step">04</div>
              <h3 className="demo-journey-title">Automate</h3>
              <p className="demo-journey-desc">Streamline operations with Tally on Cloud & CRM workflows</p>
              <div className="demo-journey-arrow">→</div>
            </div>

            <div className="demo-journey-card">
              <div className="demo-journey-step">05</div>
              <h3 className="demo-journey-title">Integrate</h3>
              <p className="demo-journey-desc">Connect hybrid systems, SAN storage & remote workspaces</p>
              <div className="demo-journey-arrow">→</div>
            </div>

            <div className="demo-journey-card">
              <div className="demo-journey-step">06</div>
              <h3 className="demo-journey-title">Optimize</h3>
              <p className="demo-journey-desc">Provide 24/7 NOC monitoring, AMC maintenance & proactive health checks</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
         9. INDUSTRIES WE SERVE
         =================================================== */}
      <section className="demo-industries-section" id="industries">
        <div className="demo-container">
          <div className="demo-section-header">
            <span className="demo-section-tag">DOMAINS & VERTICALS</span>
            <h2 className="demo-section-heading">Tailored Solutions Across Key Industries</h2>
            <p className="demo-section-sub">
              Custom-built technology architectures designed for specific regulatory, operational, and performance demands.
            </p>
          </div>

          <div className="demo-industries-row">
            <div className="demo-industry-card">
              <div className="demo-industry-icon"><Building2 size={20} /></div>
              <span className="demo-industry-name">Manufacturing</span>
            </div>
            <div className="demo-industry-card">
              <div className="demo-industry-icon"><Truck size={20} /></div>
              <span className="demo-industry-name">Trading & Distribution</span>
            </div>
            <div className="demo-industry-card">
              <div className="demo-industry-icon"><ShoppingCart size={20} /></div>
              <span className="demo-industry-name">Retail & FMCG</span>
            </div>
            <div className="demo-industry-card">
              <div className="demo-industry-icon"><Stethoscope size={20} /></div>
              <span className="demo-industry-name">Healthcare</span>
            </div>
            <div className="demo-industry-card">
              <div className="demo-industry-icon"><GraduationCap size={20} /></div>
              <span className="demo-industry-name">Education</span>
            </div>
            <div className="demo-industry-card">
              <div className="demo-industry-icon"><Briefcase size={20} /></div>
              <span className="demo-industry-name">Professional Services</span>
            </div>
            <div className="demo-industry-card">
              <div className="demo-industry-icon"><HardHat size={20} /></div>
              <span className="demo-industry-name">Construction & Real Estate</span>
            </div>
            <div className="demo-industry-card">
              <div className="demo-industry-icon"><Truck size={20} /></div>
              <span className="demo-industry-name">Logistics & Supply Chain</span>
            </div>
            <div className="demo-industry-card">
              <div className="demo-industry-icon"><Hotel size={20} /></div>
              <span className="demo-industry-name">Hospitality & Media</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
         10. CYBERSECURITY CTA SECTION
         =================================================== */}
      <section className="demo-cyber-section">
        <div className="demo-container">
          <div className="demo-cyber-grid">
            <div className="demo-cyber-content">
              <div className="demo-cyber-badge">
                <Lock size={14} style={{ color: '#38BDF8' }} /> ENTERPRISE THREAT PROTECTION
              </div>
              <h2 className="demo-cyber-title">
                Is Your Corporate Data Secure<br />Against Ransomware & Threats?
              </h2>
              <p className="demo-cyber-desc">
                Don&apos;t wait for a security breach. Our security operations defend your servers, cloud assets, endpoints, and employee credentials 24/7/365.
              </p>
              <button className="demo-btn-primary-hero" onClick={handleAssessmentClick}>
                Get a Free Security Audit <ArrowRight size={18} />
              </button>
            </div>

            <div className="demo-cyber-graphic">
              <div className="demo-shield-wrapper">
                <Lock className="demo-shield-icon" />
              </div>
            </div>

            <div className="demo-cyber-feature-card">
              <h4 className="demo-cyber-feature-title">Cybersecurity Defense Suite</h4>
              <ul className="demo-cyber-feature-list">
                <li><span>✓</span> Next-Gen Firewall & UTM Security</li>
                <li><span>✓</span> Endpoint EDR & Ransomware Shield</li>
                <li><span>✓</span> Microsoft 365 Email Security</li>
                <li><span>✓</span> Entra ID Identity Access Management</li>
                <li><span>✓</span> Encrypted Immutable Cloud Backup</li>
                <li><span>✓</span> Vulnerability Scanning & Compliance Audit</li>
                <li><span>✓</span> 24/7 Security Incident Response</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
         11. REAL BUSINESS RESULTS (CASE STUDIES)
         =================================================== */}
      <section className="demo-cases-section">
        <div className="demo-container">
          <div className="demo-section-header">
            <span className="demo-section-tag">SUCCESS STORIES</span>
            <h2 className="demo-section-heading">Proven Track Record. Measurable Impact.</h2>
            <p className="demo-section-sub">
              See how our IT engineering helped leading companies achieve operational excellence.
            </p>
          </div>

          <div className="demo-cases-grid">
            <div className="demo-case-card">
              <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop" alt="Manufacturing Client Case Study" className="demo-case-img" />
              <div className="demo-case-content">
                <span className="demo-case-industry">Manufacturing Enterprise</span>
                <h3 className="demo-case-title">Implemented Tally on Cloud, VDI and high-availability server clusters.</h3>
                <ul className="demo-case-results">
                  <li>✓ 100% Secure multi-location remote access</li>
                  <li>✓ 45% Increase in accounting team productivity</li>
                  <li>✓ Zero ransomware incidents in 3+ years</li>
                </ul>
              </div>
            </div>

            <div className="demo-case-card">
              <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop" alt="Trading Client Case Study" className="demo-case-img" />
              <div className="demo-case-content">
                <span className="demo-case-industry">National Trading House</span>
                <h3 className="demo-case-title">Deployed cloud CRM with automated WhatsApp order status integration.</h3>
                <ul className="demo-case-results">
                  <li>✓ 3x Faster customer inquiry follow-up</li>
                  <li>✓ Real-time inventory visibility across branches</li>
                  <li>✓ 28% Growth in repeat order conversions</li>
                </ul>
              </div>
            </div>

            <div className="demo-case-card">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop" alt="Professional Services Case Study" className="demo-case-img" />
              <div className="demo-case-content">
                <span className="demo-case-industry">Professional Consulting Firm</span>
                <h3 className="demo-case-title">Migrated multi-site workforce to Microsoft 365 and cloud servers.</h3>
                <ul className="demo-case-results">
                  <li>✓ Anywhere, multi-device secure access</li>
                  <li>✓ Seamless real-time document collaboration</li>
                  <li>✓ Standardized Intune device security policy</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
         11.5 FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION)
         =================================================== */}
      <section className="demo-faq-section" id="faq">
        <div className="demo-container">
          <div className="demo-section-header">
            <span className="demo-section-tag">FREQUENTLY ASKED QUESTIONS</span>
            <h2 className="demo-section-heading">Got Questions? We Have Answers.</h2>
            <p className="demo-section-sub">
              Clear insights into our IT services, implementation timelines, and security standards.
            </p>
          </div>

          <div className="demo-faq-wrapper">
            {FAQ_ITEMS.map((item, idx) => (
              <div key={idx} className={`demo-faq-card ${openFaqIndex === idx ? 'open' : ''}`}>
                <button 
                  className="demo-faq-question-btn" 
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                >
                  <span className="demo-faq-question-text">{item.q}</span>
                  <span className="demo-faq-icon">
                    {openFaqIndex === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </span>
                </button>
                {openFaqIndex === idx && (
                  <div className="demo-faq-answer-body">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================
         12. FINAL CALL TO ACTION BANNER
         =================================================== */}
      <section className="demo-final-cta-section">
        <div className="demo-container">
          <div className="demo-final-cta-inner">
            <h2 className="demo-final-cta-title">Ready to Modernize Your IT Infrastructure?</h2>
            <p className="demo-final-cta-sub">
              Schedule a complimentary 1-on-1 digital assessment with our senior IT solution architects today.
            </p>

            <div className="demo-final-cta-btns">
              <button className="demo-btn-primary-hero" onClick={handleAssessmentClick}>
                Get Free Assessment <ArrowRight size={18} />
              </button>
              <a href="tel:+913340645300" className="demo-btn-cta-phone">
                <Phone size={18} /> Direct Call: +91 33 4064 5300
              </a>
              <a href="https://wa.me/913340645300" target="_blank" rel="noreferrer" className="demo-btn-whatsapp" style={{ padding: '14px 26px', fontSize: '0.95rem' }}>
                <MessageSquare size={18} /> WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
         13. FOOTER
         =================================================== */}
      <footer className="demo-footer">
        <div className="demo-container demo-footer-grid">
          {/* Column 1 */}
          <div className="demo-footer-col">
            <h3 className="demo-footer-brand-title">NET INFOTECH SYSTEM PVT. LTD.</h3>
            <p className="demo-footer-desc">
              Your trusted enterprise partner for cloud migration, IT infrastructure, cybersecurity defense, and financial software automation.
            </p>
            <div className="demo-footer-socials">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="demo-footer-social-icon" aria-label="LinkedIn">
                <LinkedinIcon size={16} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="demo-footer-social-icon" aria-label="Facebook">
                <FacebookIcon size={16} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="demo-footer-social-icon" aria-label="YouTube">
                <YoutubeIcon size={16} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="demo-footer-social-icon" aria-label="Instagram">
                <InstagramIcon size={16} />
              </a>
            </div>
          </div>

          {/* Column 2 */}
          <div className="demo-footer-col">
            <h4 className="demo-footer-col-title">Solutions</h4>
            <ul className="demo-footer-links">
              <li><a href="#solutions">Digital Transformation</a></li>
              <li><a href="#cloud">Enterprise Cloud Services</a></li>
              <li><a href="#cybersecurity">Cybersecurity Solutions</a></li>
              <li><a href="#datacenter">Datacenter Colocation</a></li>
              <li><a href="#infra">IT Infrastructure Management</a></li>
              <li><a href="#managed">Managed IT & AMC</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="demo-footer-col">
            <h4 className="demo-footer-col-title">Business Applications</h4>
            <ul className="demo-footer-links">
              <li><a href="#tally">TallyPrime Licensing</a></li>
              <li><a href="#tally-cloud">Tally on Cloud</a></li>
              <li><a href="#m365">Microsoft 365 Solutions</a></li>
              <li><a href="#zoho">Zoho CRM & Workplace</a></li>
              <li><a href="#custom">Custom Software Solutions</a></li>
              <li><a href="#support">24/7 Technical Support</a></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className="demo-footer-col">
            <h4 className="demo-footer-col-title">Company</h4>
            <ul className="demo-footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#clients">Our Clients</a></li>
              <li><a href="#industries">Industries We Serve</a></li>
              <li><a href="#cases">Case Studies</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#contact">Contact Support</a></li>
            </ul>
          </div>

          {/* Column 5 */}
          <div className="demo-footer-col">
            <h4 className="demo-footer-col-title">Contact Information</h4>
            <div className="demo-footer-contact-info">
              <p><strong>Corporate Hotline:</strong><br />+91 33 4064 5300</p>
              <p style={{ marginTop: '10px' }}><strong>Email Support:</strong><br />info@netinfotechsystem.com</p>
              <p style={{ marginTop: '10px' }}><strong>Headquarters:</strong><br />Kolkata, West Bengal<br />India</p>
            </div>
          </div>
        </div>

        <div className="demo-footer-bottom">
          <div className="demo-container demo-footer-bottom-inner">
            <div>
              © 2026 Net Infotech System Pvt. Ltd. All Rights Reserved.
            </div>
            <div className="demo-footer-bottom-links">
              <a href="#privacy">Privacy Policy</a>
              <span>|</span>
              <a href="#terms">Terms & Conditions</a>
              <span>|</span>
              <a href="#sitemap">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>

      {/* FLOATING BACK TO TOP BUTTON */}
      {showBackToTop && (
        <button 
          className="demo-back-to-top-btn" 
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}
