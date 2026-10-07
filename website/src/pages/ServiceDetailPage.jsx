import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { 
  Calculator, 
  Cloud, 
  Server, 
  ShieldCheck, 
  Wrench, 
  Laptop, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Phone, 
  Mail, 
  Award, 
  Lock, 
  Building2, 
  Cpu, 
  FileCheck, 
  HardDrive, 
  Settings, 
  Headphones,
  Check
} from 'lucide-react';

import bannerTallyPrime from '../assets/tally prime.png';
import bannerTallyCloud from '../assets/Tally on cloud.png';
import bannerCloudHosting from '../assets/banner-cloud-hosting.jpg';
import bannerItInfrastructure from '../assets/banner-it-infrastructure.jpg';
import bannerItRepair from '../assets/banner-it-repair.jpg';
import bannerItRental from '../assets/banner-it-rental.jpg';

import AccountingModule from '../components/AccountingModule';
import { 
  COMPANY_INFO, 
  INITIAL_METRICS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_PRODUCTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_SUPPLIERS 
} from '../data/mockData';
import './ServiceDetail.css';

const SERVICES_MAP = {
  'tally-prime': {
    id: 'tally-prime',
    number: '01',
    title: 'Tally Prime Solutions',
    badge: 'Tally 3-Star Certified Partner',
    floatingTag: 'Official Tally 3-Star Partner',
    headline: 'Transform Your Business Accounting with India\'s Most Trusted Software',
    lead: 'Accounting, GST, inventory management, billing & business reporting - comprehensive TallyPrime licensing, implementation, and corporate training.',
    image: bannerTallyPrime,
    gradient: 'linear-gradient(135deg, #0284C7, #0369A1)',
    color: '#0284C7',
    icon: Calculator,
    modules: [
      {
        title: 'TallyPrime Licensing & Upgrades',
        desc: 'Authorized new multi-user (Gold) and single-user (Silver) licensing, rental licenses, and renewal of Tally Software Services (TSS).',
        checks: ['Single User (Silver) & Multi-User (Gold)', 'TSS Renewal & Version Upgrades', 'Multi-company & Multi-branch licensing']
      },
      {
        title: 'GST, e-Invoicing & e-Way Bill Automation',
        desc: 'Automate GSTR-1, GSTR-3B, e-Way bills, and QR code generation with 100% compliance directly inside TallyPrime.',
        checks: ['Direct portal integration', 'Zero-mismatch GST reconciliation', 'Automated e-Invoicing with QR codes']
      },
      {
        title: 'Inventory & Multi-Warehouse Management',
        desc: 'Advanced batch management, expiry date tracking, serial numbers, re-order levels, and automated purchase orders.',
        checks: ['Multi-location stock tracking', 'Barcode label generation & scanning', 'Bill of Materials (BOM) & manufacturing']
      },
      {
        title: 'Customized MIS & Executive Reporting',
        desc: 'Tailored financial dashboards, cash-flow projections, cost center analysis, and automated executive email/WhatsApp reporting.',
        checks: ['Profit & Loss, Balance sheet customization', 'Receivables & payables age-wise tracking', 'Auditor & CA remote access export']
      },
      {
        title: 'Implementation & Corporate Staff Training',
        desc: 'On-site implementation by certified Tally engineers, existing software data migration, and hands-on staff training.',
        checks: ['Clean data migration from legacy ERP', 'Practical accounting team training', 'Priority SLA telephone & on-site support']
      },
      {
        title: 'Tally TDL & Custom Module Development',
        desc: 'Custom invoice printing formats, custom validation fields, SMS integration, and bespoke workflow extensions.',
        checks: ['Bespoke TDL programming', 'Third-party CRM/ERP API sync', 'Specialized industrial reporting']
      }
    ],
    showSandbox: true
  },
  'tally-on-cloud': {
    id: 'tally-on-cloud',
    number: '02',
    title: 'Tally on Cloud Hosting',
    badge: '99.9% Uptime Guarantee • 256-Bit SSL',
    floatingTag: '256-Bit Encrypted Cloud Access',
    headline: 'Access Tally 24/7 from Anywhere on Any Device with Zero Lag',
    lead: 'Anywhere access - cloud-based Tally hosting solutions with high-speed remote desktop, multi-device sync, and daily automated encrypted backups.',
    image: bannerTallyCloud,
    gradient: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
    color: '#7C3AED',
    icon: Cloud,
    modules: [
      {
        title: 'Anywhere Multi-Device Remote Access',
        desc: 'Work seamlessly on TallyPrime from your Windows PC, MacBook, iPad, Android tablet, or smartphone from anywhere in the world.',
        checks: ['Universal device compatibility', 'High-speed Remote Desktop Protocol (RDP)', 'Simultaneous multi-user concurrent logins']
      },
      {
        title: 'High-Performance Dedicated Cloud Servers',
        desc: 'Hosted in state-of-the-art Indian Tier-4 data centers with ultra-fast NVMe SSD storage, ensuring snappy response times.',
        checks: ['Sub-millisecond query response', 'Dedicated RAM & CPU resource allocation', '99.9% network uptime SLA']
      },
      {
        title: 'Automated Daily Encrypted Backups',
        desc: 'Triple-redundant automated data backups with point-in-time recovery, safeguarding your financial ledgers against ransomware.',
        checks: ['Daily automated snapshot backups', 'Off-site geographic disaster recovery', 'Anti-ransomware immutable storage']
      },
      {
        title: 'Bank-Grade Cybersecurity & Access Control',
        desc: 'Granular user permission controls, IP whitelisting, multi-factor authentication (MFA), and 256-bit SSL encryption.',
        checks: ['Restricted export/print permissions', 'Two-factor authentication (2FA)', 'No local data download vulnerability']
      },
      {
        title: 'Zero Local IT Maintenance Overhead',
        desc: 'Say goodbye to expensive local server hardware, UPS batteries, and air-conditioned server rooms. Everything is managed in cloud.',
        checks: ['Automatic Windows & security patches', 'Scalable user license expansion', 'Zero hardware obsolescence cost']
      },
      {
        title: '24/7 Dedicated Technical Support',
        desc: 'Experienced cloud engineers available round the clock via hotline, WhatsApp, and remote desktop to assist your accounts team.',
        checks: ['15-minute emergency response SLA', 'Direct engineer phone line', 'Pro-active system health monitoring']
      }
    ],
    showSandbox: false
  },
  'data-center-cloud': {
    id: 'data-center-cloud',
    number: '03',
    title: 'Data Center, Cloud Server & Hosting',
    badge: 'Tier-4 Indian Data Centers • AWS & Azure Partner',
    floatingTag: 'Tier-4 Multi-Cloud Infrastructure',
    headline: 'Enterprise Cloud Infrastructure Engineered for Mission-Critical Workloads',
    lead: 'Business applications, websites workloads - cloud infrastructure & enterprise hosting solutions powered by Microsoft Azure, AWS, and private cloud.',
    image: bannerCloudHosting,
    gradient: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
    color: '#2563EB',
    icon: Server,
    modules: [
      {
        title: 'Dedicated Cloud Virtual Private Servers (VPS)',
        desc: 'High-performance cloud servers tailored for ERP, CRM, database engines, and high-traffic corporate business applications.',
        checks: ['Custom CPU, RAM & NVMe SSD sizing', 'Full root/administrator access', 'Windows Server & Enterprise Linux']
      },
      {
        title: 'Microsoft Azure & AWS Cloud Solutions',
        desc: 'Certified cloud architects designing scalable, cost-optimized public and hybrid cloud environments tailored to Indian enterprises.',
        checks: ['Azure Virtual Machines & Blob Storage', 'AWS EC2, S3 & Relational Database (RDS)', 'Multi-region redundancy & failover']
      },
      {
        title: 'Zero-Downtime Cloud Migration',
        desc: 'Seamless migration of on-premise physical servers, legacy databases, and web applications to secure cloud infrastructure.',
        checks: ['Pre-migration compatibility audit', 'Staged cutover with zero data loss', 'Post-migration performance optimization']
      },
      {
        title: 'Enterprise Corporate Web & App Hosting',
        desc: 'High-availability web hosting with managed cPanel, LiteSpeed web server, Cloudflare enterprise CDN, and automated SSL.',
        checks: ['DDoS mitigation & web application firewall', 'Staging environments & Git deployment', 'Automated daily website backups']
      },
      {
        title: 'Disaster Recovery as a Service (DRaaS)',
        desc: 'Comprehensive business continuity planning with real-time database replication and automated failover orchestration.',
        checks: ['RPO under 15 minutes, RTO under 1 hour', 'Geographically separated DR sites', 'Quarterly failover drill testing']
      },
      {
        title: 'Managed Server Monitoring & DevOps',
        desc: 'Proactive 24/7 monitoring of CPU load, memory utilization, disk I/O, security alerts, and automated threshold alerts.',
        checks: ['Real-time telemetry & log auditing', 'Automated security patch management', 'Dedicated system administrator support']
      }
    ],
    showSandbox: false
  },
  'it-infra-security': {
    id: 'it-infra-security',
    number: '04',
    title: 'IT Infrastructure & Cybersecurity',
    badge: 'Turnkey IT Setup • UTM Firewall • IT AMC',
    floatingTag: 'Enterprise NOC & Threat Defense',
    headline: 'Complete Business IT Infrastructure Setup, Management & Protection',
    lead: 'Business IT infrastructure - setup, management, monitoring & protection for complete business continuity, office networking, and cyber defense.',
    image: bannerItInfrastructure,
    gradient: 'linear-gradient(135deg, #059669, #047857)',
    color: '#059669',
    icon: ShieldCheck,
    modules: [
      {
        title: 'Enterprise Server & Network Architecture',
        desc: 'End-to-end design and deployment of structured LAN cabling, gigabit managed switches, routers, and inter-branch VPN links.',
        checks: ['Cat6/Fiber optic structured cabling', 'Managed Cisco/HP Aruba switches', 'Secure site-to-site IPsec VPN tunnels']
      },
      {
        title: 'Next-Gen UTM Firewall & Cybersecurity',
        desc: 'Robust perimeter defense with Fortinet, SonicWall, and Sophos UTM firewalls, intrusion prevention (IPS), and web filtering.',
        checks: ['Deep packet inspection & anti-malware', 'Application & bandwidth throttling', 'Ransomware endpoint protection']
      },
      {
        title: 'IP CCTV Surveillance & Biometric Access',
        desc: 'High-definition IP camera networks with network video recorders (NVR), remote live viewing, and biometric attendance integration.',
        checks: ['4K night-vision surveillance cameras', 'Biometric fingerprint & facial recognition', 'Automated payroll attendance integration']
      },
      {
        title: 'Enterprise High-Density Wi-Fi Solutions',
        desc: 'Seamless mesh Wi-Fi deployments for multi-floor corporate offices, warehouses, and factories with zero dead zones.',
        checks: ['Controller-based access point management', 'Guest portal with SMS OTP verification', 'Seamless client roaming between floors']
      },
      {
        title: 'Microsoft 365 & Corporate Email Solutions',
        desc: 'Authorized licensing, setup, and migration of business emails to Microsoft 365 Exchange, Teams, and Google Workspace.',
        checks: ['Exchange Online & custom domain setup', 'OneDrive & SharePoint team collaboration', 'Advanced anti-phishing spam filters']
      },
      {
        title: 'Annual Maintenance Contracts (IT AMC)',
        desc: 'Comprehensive non-comprehensive and comprehensive AMC plans with on-site resident engineers and preventive maintenance.',
        checks: ['Guaranteed 2-hour emergency response SLA', 'Monthly preventive maintenance checks', 'Unlimited remote & telephone support']
      }
    ],
    showSandbox: false
  },
  'it-repair-maintenance': {
    id: 'it-repair-maintenance',
    number: '05',
    title: 'IT Product Repair & Maintenance',
    badge: 'Chip-Level Lab • Genuine Spares • Quick SLA',
    floatingTag: 'Certified Chip-Level Engineers',
    headline: 'Certified Multi-Brand Hardware Diagnostics, Chip-Level Repair & Restoration',
    lead: 'Desktop, laptop, printer, server & IT equipment - professional repair & maintenance services backed by certified lab engineers and genuine spares.',
    image: bannerItRepair,
    gradient: 'linear-gradient(135deg, #D97706, #B45309)',
    color: '#D97706',
    icon: Wrench,
    modules: [
      {
        title: 'Chip-Level Motherboard Diagnostics & Repair',
        desc: 'Advanced micro-soldering and BGA chip replacement for dead, water-damaged, or short-circuited laptop and desktop motherboards.',
        checks: ['Precision BGA rework stations', 'Power IC and VRM circuit tracing', 'BIOS flashing and chip programming']
      },
      {
        title: 'Corporate Laptop & Desktop Servicing',
        desc: 'Screen replacements, keyboard fixes, hinge repairs, thermal paste overhaul, and SSD/RAM hardware upgrades for office fleets.',
        checks: ['Genuine OEM replacement displays & batteries', 'Thermal overhaul & fan servicing', 'High-speed NVMe SSD speed upgrades']
      },
      {
        title: 'Enterprise Server & Storage Array Maintenance',
        desc: 'Hardware diagnostics and hot-swap replacement of server power supplies (SMPS), RAID controllers, SAS drives, and ECC RAM.',
        checks: ['RAID reconstruction & fault recovery', 'Redundant power supply servicing', 'Enterprise server thermal optimization']
      },
      {
        title: 'Laser Printer, Plotter & Scanner Repair',
        desc: 'Comprehensive servicing of commercial HP, Canon, Epson laser printers, fuser unit overhaul, logic board fixes, and roller replacements.',
        checks: ['Teflon sleeve and fuser assembly overhaul', 'Laser scanner unit diagnostics', 'Paper feed and pickup roller replacement']
      },
      {
        title: 'Clean-Room Hard Drive Data Recovery',
        desc: 'Emergency data recovery from crashed hard drives, clicking HDDs, formatted volumes, corrupted SSDs, and failed NAS systems.',
        checks: ['Head and platter clean-bench recovery', 'Corrupted partition file restoration', 'Strict non-disclosure confidentiality']
      },
      {
        title: 'Preventive Hardware Health Audits',
        desc: 'Periodic on-site hardware inspections, internal dust cleaning, voltage stability checks, and proactive component replacement.',
        checks: ['Thermal imaging heat inspections', 'UPS battery impedance health testing', 'Detailed asset diagnostic report']
      }
    ],
    showSandbox: false
  },
  'it-sales-rental': {
    id: 'it-sales-rental',
    number: '06',
    title: 'IT Product Sales & Corporate Rental',
    badge: 'Fleet Rentals • Brand-New Laptops • Flexible Terms',
    floatingTag: 'Flexible IT Hardware Rental Fleets',
    headline: 'Scalable Corporate Hardware Rental Fleets & Authorized IT Equipment Procurement',
    lead: 'Business requirements - IT hardware sales & rental services. High-spec laptops, workstations, servers, and networking hardware with flexible terms.',
    image: bannerItRental,
    gradient: 'linear-gradient(135deg, #EA580C, #C2410C)',
    color: '#EA580C',
    icon: Laptop,
    modules: [
      {
        title: 'Corporate Laptop & Desktop Rentals',
        desc: 'Short-term and long-term rental fleets of Intel Core i5/i7 and Apple MacBook laptops for temporary projects, trainees, and remote teams.',
        checks: ['Flexible monthly / quarterly / annual tenures', 'Same-day bulk deployment in Kolkata & WB', 'Pre-installed licensed OS & software']
      },
      {
        title: 'High-Performance Workstation Rentals',
        desc: 'Heavy-duty rendering workstations equipped with NVIDIA RTX graphics and Xeon/Ryzen processors for CAD, 3D design, and video editing.',
        checks: ['High-memory 32GB/64GB configurations', 'NVIDIA Quadro / RTX workstation GPUs', 'Color-accurate 4K professional monitors']
      },
      {
        title: 'Enterprise Server & Network Equipment Leasing',
        desc: 'Leasing of Dell PowerEdge and HP ProLiant rack servers, storage enclosures, and Cisco switches for data center workloads.',
        checks: ['Multi-core dual processor server nodes', 'Redundant SAS RAID storage controllers', '24/7 hardware standby replacement']
      },
      {
        title: 'Event & Conference IT Equipment Rentals',
        desc: 'Temporary IT infrastructure rentals for corporate seminars, training workshops, exams, exhibitions, and hackathons.',
        checks: ['High-speed Wi-Fi router setup', 'PA audio, projectors & large display screens', 'Dedicated on-site technical engineer']
      },
      {
        title: 'Authorized Hardware Procurement & Sales',
        desc: 'Authorized partner pricing for bulk purchases of brand-new laptops, desktops, servers, and peripherals with OEM warranty.',
        checks: ['HP, Dell, Lenovo & Acer corporate tier pricing', 'Commercial models with 3-year onsite warranty', 'Zero-markup transparent procurement']
      },
      {
        title: 'Buyback & Fleet Lifecycle Replacement',
        desc: 'Trade in older, slow office IT hardware against brand-new rental fleets or upgrades with certified secure data wiping.',
        checks: ['Asset residual value evaluation', 'DoD-compliant hard drive wiping', 'Zero upfront capital expenditure (OpEx)']
      }
    ],
    showSandbox: false
  }
};

export default function ServiceDetailPage({ onOpenDemo }) {
  const { serviceId } = useParams();
  
  // Normalize slug
  const currentKey = (serviceId || 'tally-prime').toLowerCase();
  const service = SERVICES_MAP[currentKey];

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  const IconComp = service.icon;

  // Accounting sandbox state for Tally Prime demo
  const [erpTab, setErpTab] = useState('accounting');
  const [erpSubTab, setErpSubTab] = useState('sales');
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  const steps = [
    { num: '01', title: 'Consultation & Discovery', desc: 'Understanding your business workflow, technical specifications, and scale requirements.' },
    { num: '02', title: 'Solution Sizing & Architecture', desc: 'Designing the optimal hardware, cloud server, or licensing tier for maximum cost-efficiency.' },
    { num: '03', title: 'Deployment & Data Migration', desc: 'Professional installation, seamless data transition, and hands-on user acceptance testing.' },
    { num: '04', title: '24/7 Ongoing SLA Support', desc: 'Continuous performance monitoring, preventive AMC maintenance, and dedicated hotline support.' }
  ];

  return (
    <div className="service-detail-view">
      
      {/* 1. HERO BANNER */}
      <section className="service-hero-banner">
        <div className="service-hero-ambient" />
        <div className="container">
          <div className="service-hero-grid">
            
            {/* Left Content */}
            <div className="service-hero-left">
              <div className="service-breadcrumbs">
                <Link to="/">Home</Link>
                <span>/</span>
                <Link to="/services">Services</Link>
                <span>/</span>
                <span>{service.title}</span>
              </div>

              <div className="service-badge-pill">
                <ShieldCheck size={14} />
                <span>{service.badge}</span>
              </div>

              <h1 className="service-hero-title">{service.headline}</h1>
              <p className="service-hero-sub">{service.lead}</p>

              <div className="service-hero-actions">
                <button
                  type="button"
                  className="nis-primary-btn"
                  onClick={onOpenDemo}
                >
                  <span>Request a Custom Quote</span>
                  <ArrowRight size={16} />
                </button>
                <a href="tel:+919330113000" className="nis-secondary-btn">
                  <Phone size={16} />
                  <span>Call +91 9330113000</span>
                </a>
              </div>
            </div>

            {/* Right Visual Image */}
            <div className="service-hero-right">
              <div className="service-banner-frame">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="service-banner-img" 
                />
                <div className="service-banner-tag">
                  <span>{service.floatingTag}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CORE CAPABILITIES / MODULES GRID */}
      <section className="service-section-wrap">
        <div className="container">
          <div className="section-title-center">
            <div className="nis-section-badge">
              <span>CAPABILITIES & SPECIFICATIONS</span>
            </div>
            <h2 className="nis-section-h2">
              Comprehensive <span className="gradient-text">{service.title}</span> Offerings
            </h2>
            <p className="nis-section-sub">
              Every deployment is backed by certified Net Infotech System engineers, proven SLAs, and 25+ years of technology leadership.
            </p>
          </div>

          <div className="service-features-grid">
            {service.modules.map((mod, mIdx) => (
              <div key={mIdx} className="service-feature-card">
                <div className="feature-card-header">
                  <div className="feature-card-icon-circle" style={{ background: service.gradient }}>
                    <IconComp size={22} />
                  </div>
                  <h3 className="feature-card-title">{mod.title}</h3>
                </div>
                <p className="feature-card-desc">{mod.desc}</p>
                <ul className="feature-checklist">
                  {mod.checks.map((chk, cIdx) => (
                    <li key={cIdx} className="feature-check-item">
                      <Check size={15} />
                      <span>{chk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE TALLY SANDBOX (Only for Tally Prime) */}
      {service.showSandbox && (
        <section className="service-section-wrap service-section-alt">
          <div className="container">
            <div className="section-title-center">
              <div className="nis-section-badge">
                <span>INTERACTIVE DEMO</span>
              </div>
              <h2 className="nis-section-h2">
                Experience Tally-Grade <span className="gradient-text">Accounting & GST Ledger</span>
              </h2>
              <p className="nis-section-sub">
                Explore our live interactive financial dashboard and double-entry ledger sandbox below.
              </p>
            </div>

            <div style={{ marginTop: '30px' }}>
              <AccountingModule 
                activeTab={erpTab}
                activeSubTab={erpSubTab}
                onTabChange={(t, s) => { setErpTab(t); setErpSubTab(s); }}
                metrics={INITIAL_METRICS}
                transactions={transactions}
                products={products}
                customers={INITIAL_CUSTOMERS}
                suppliers={INITIAL_SUPPLIERS}
                onOpenCreateInvoice={() => onOpenDemo && onOpenDemo()}
                onOpenAddProduct={() => onOpenDemo && onOpenDemo()}
                onOpenAddParty={() => onOpenDemo && onOpenDemo()}
                onViewInvoice={() => onOpenDemo && onOpenDemo()}
                onShowToast={() => {}}
              />
            </div>
          </div>
        </section>
      )}

      {/* 4. DEPLOYMENT & DELIVERY PROCESS */}
      <section className="service-section-wrap">
        <div className="container">
          <div className="section-title-center">
            <div className="nis-section-badge">
              <span>STRUCTURED DELIVERY</span>
            </div>
            <h2 className="nis-section-h2">
              Our 4-Step <span className="gradient-text">Implementation Process</span>
            </h2>
            <p className="nis-section-sub">
              How Net Infotech System ensures zero downtime, flawless configuration, and total client satisfaction.
            </p>
          </div>

          <div className="service-steps-grid">
            {steps.map((st) => (
              <div key={st.num} className="service-step-card">
                <span className="step-num">{st.num}</span>
                <h4 className="step-title">{st.title}</h4>
                <p className="step-desc">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. EXPLORE OTHER SERVICES STRIP */}
      <section className="other-services-strip">
        <div className="container">
          <div className="section-title-center" style={{ color: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>
              Explore Other Core Services
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.92rem' }}>
              Comprehensive IT solutions designed to support your entire enterprise infrastructure.
            </p>
          </div>

          <div className="other-services-grid">
            {Object.values(SERVICES_MAP).filter(s => s.id !== service.id).map((other) => (
              <Link 
                key={other.id} 
                to={`/services/${other.id}`} 
                className="other-service-pill"
              >
                <span>{other.title}</span>
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION CARD */}
      <section className="nis-cta-banner-section">
        <div className="container">
          <div className="nis-cta-banner-card">
            <div className="cta-left">
              <span className="cta-badge">⚡ INSTANT CONSULTATION AVAILABLE</span>
              <h2 className="cta-title">Ready to Deploy {service.title}?</h2>
              <p className="cta-desc">
                Consult with our senior technology team at Webel Tower 1, Sector V, Kolkata. We provide customized assessments, transparent pricing, and rapid on-site implementation.
              </p>
            </div>
            <div className="cta-right">
              <button 
                type="button" 
                className="cta-btn-primary"
                onClick={onOpenDemo}
              >
                <span>Request a Free Quote</span>
                <ArrowRight size={16} />
              </button>
              <a href="tel:+919330113000" className="cta-btn-secondary">
                <Phone size={16} />
                <span>+91 9330113000</span>
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
