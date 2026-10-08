import React, { useState, useId } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  Wallet,
  Scale,
  Lightbulb,
  Users,
  Award,
  Handshake,
  HeartHandshake,
  GraduationCap,
  PartyPopper,
  Code,
  Server,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Star,
  UploadCloud,
  Send,
  Sparkles,
  Search,
  Filter,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  Mail,
  Phone,
  Building2,
  Calendar,
  Coffee,
  Heart,
  Compass,
  Check
} from 'lucide-react';
import './CareersPage.css';

// ─── TABS ───────────────────────────────────────────────────────────
const TABS = [
  { id: 'openings', label: 'Current Openings', count: 12, icon: Briefcase },
  { id: 'why', label: 'Why NISPL?', icon: Sparkles },
  { id: 'culture', label: 'Our Work Culture', icon: HeartHandshake },
  { id: 'process', label: 'Hiring Process', icon: Compass },
];

// ─── DEPARTMENTS & JOBS ─────────────────────────────────────────────
const DEPARTMENTS = [
  { id: 'all', name: 'All Departments' },
  { id: 'dev', name: 'Software Development' },
  { id: 'cloud', name: 'Cloud & Data Center' },
  { id: 'infra', name: 'IT Infrastructure & AMC' },
  { id: 'security', name: 'Cybersecurity & Network' },
  { id: 'tally', name: 'Tally ERP Solutions' },
  { id: 'sales', name: 'Sales & Business Dev' },
];

const JOB_OPENINGS = [
  {
    id: 'job-1',
    title: 'Senior .NET / C# Developer',
    deptId: 'dev',
    deptName: 'Software Development',
    expRange: '3 - 6 Years',
    expCategory: '2-5',
    location: 'Kolkata (Salt Lake Sector-V)',
    type: 'Full-time • Hybrid Available',
    urgent: true,
    skills: ['.NET Core', 'C#', 'SQL Server', 'REST APIs', 'Entity Framework', 'Microservices'],
    description: 'Design and build high-performance web APIs, backend enterprise services, and custom desktop enterprise software for mission-critical client operations.',
    responsibilities: [
      'Architect robust ASP.NET Core RESTful services and relational database schemas.',
      'Optimize complex SQL stored procedures and performance queries.',
      'Integrate third-party payment gateways, ERP webhooks, and cloud data pipelines.',
      'Mentor junior developers and participate in automated code reviews.'
    ],
    requirements: [
      'Strong proficiency in C#, .NET 6/8, and Entity Framework Core.',
      'Experience with SQL Server query tuning, indexing, and transactional integrity.',
      'Knowledge of Docker containers and cloud deployment on Azure or AWS is a plus.'
    ]
  },
  {
    id: 'job-2',
    title: 'Fullstack PHP / Laravel Developer',
    deptId: 'dev',
    deptName: 'Software Development',
    expRange: '2 - 5 Years',
    expCategory: '2-5',
    location: 'Kolkata (Salt Lake Sector-V)',
    type: 'Full-time • On-site',
    urgent: false,
    skills: ['PHP 8+', 'Laravel', 'MySQL', 'Vue.js / React', 'RESTful APIs', 'Git'],
    description: 'Lead web portal and customer dashboard developments, building intuitive user interfaces connected to reliable Laravel microservices.',
    responsibilities: [
      'Develop scalable web applications using modern Laravel patterns.',
      'Build responsive frontend components in React / Vue integrated with backend APIs.',
      'Implement authentication, role-based access control (RBAC), and audit trails.',
      'Ensure web application security best practices against OWASP Top 10 vulnerabilities.'
    ],
    requirements: [
      'Hands-on experience with Laravel framework, Blade, and Eloquent ORM.',
      'Solid command of frontend JavaScript/TypeScript and CSS frameworks.',
      'Familiarity with Git workflows and CI/CD pipelines.'
    ]
  },
  {
    id: 'job-3',
    title: 'Frontend React & UI Engineer',
    deptId: 'dev',
    deptName: 'Software Development',
    expRange: '2 - 4 Years',
    expCategory: '2-5',
    location: 'Kolkata (Salt Lake Sector-V)',
    type: 'Full-time • Hybrid',
    urgent: false,
    skills: ['React.js', 'TypeScript', 'Tailwind / Vanilla CSS', 'REST API', 'Figma to Code'],
    description: 'Transform Figma design systems into pixel-perfect, accessible, and fast web experiences across corporate and SaaS portals.',
    responsibilities: [
      'Build modular, reusable React component systems with high performance and accessibility.',
      'Collaborate with UI/UX designers to implement sleek micro-animations and data charts.',
      'Optimize web vitals, Lighthouse scores, and responsive mobile layouts.'
    ],
    requirements: [
      'Deep understanding of React hooks, state management, and modern CSS.',
      'Eye for design details, typography, and responsive ergonomics.'
    ]
  },
  {
    id: 'job-4',
    title: 'Cloud & Data Center Systems Engineer',
    deptId: 'cloud',
    deptName: 'Cloud & Data Center',
    expRange: '2 - 5 Years',
    expCategory: '2-5',
    location: 'Kolkata (Tier-III Data Center)',
    type: 'Full-time • On-site / Rotational',
    urgent: true,
    skills: ['Windows Server', 'Linux / Ubuntu', 'VMware ESXi', 'AWS / Azure', 'Hyper-V', 'Storage SAN'],
    description: 'Manage virtual machine clusters, enterprise cloud hosting, and Tier-3 datacenter server instances with 99.99% uptime guarantees.',
    responsibilities: [
      'Provision, configure, and monitor Windows and Linux cloud virtual machines.',
      'Manage VMware and Hyper-V virtualization host environments and storage pools.',
      'Execute daily automated server backups and test disaster recovery protocols.',
      'Troubleshoot network routing, port binding, and SSL/TLS certificate configurations.'
    ],
    requirements: [
      'Hands-on experience with server OS administration and virtualization tools.',
      'Certifications such as Microsoft MCSA, AWS Solutions Architect, or VMware VCP preferred.'
    ]
  },
  {
    id: 'job-5',
    title: 'Cloud Migration & Backup Specialist',
    deptId: 'cloud',
    deptName: 'Cloud & Data Center',
    expRange: '3 - 6 Years',
    expCategory: '2-5',
    location: 'Kolkata (Salt Lake Sector-V)',
    type: 'Full-time • Hybrid',
    urgent: false,
    skills: ['Azure Migration', 'Veeam Backup', 'Disaster Recovery', 'Hybrid Cloud', 'Tally Cloud'],
    description: 'Assist mid-market and enterprise clients in migrating on-premise workloads, accounting databases, and file servers smoothly to cloud environments.',
    responsibilities: [
      'Design cloud migration roadmaps with zero downtime and verified data integrity.',
      'Implement Veeam backup architectures, snapshot routines, and ransomware-proof vaults.',
      'Provide escalation support for Tally-on-Cloud multi-user performance bottlenecks.'
    ],
    requirements: [
      'Demonstrated experience with on-prem to cloud workload migrations.',
      'Familiarity with Veeam, Acronis, or Azure Site Recovery.'
    ]
  },
  {
    id: 'job-6',
    title: 'Senior IT Systems Administrator',
    deptId: 'infra',
    deptName: 'IT Infrastructure & AMC',
    expRange: '3 - 7 Years',
    expCategory: '5+',
    location: 'Kolkata & Client Sites',
    type: 'Full-time • On-site',
    urgent: false,
    skills: ['Active Directory', 'Microsoft 365', 'Exchange Server', 'DNS/DHCP', 'NAS/SAN', 'Hardware RAID'],
    description: 'Lead corporate IT infrastructure implementations, enterprise domain controllers, email migrations, and comprehensive client IT AMC operations.',
    responsibilities: [
      'Administer on-prem Active Directory forests, Group Policies (GPO), and hybrid Azure AD.',
      'Manage enterprise Microsoft 365 tenancies, Exchange mailboxes, and security baselines.',
      'Supervise server hardware deployment, rack mounting, and high-availability RAID setups.'
    ],
    requirements: [
      'B.Tech / MCA or equivalent with 3+ years in enterprise IT infrastructure management.',
      'Excellent troubleshooting skills in Windows Server environments.'
    ]
  },
  {
    id: 'job-7',
    title: 'IT Support & Desktop Hardware Engineer',
    deptId: 'infra',
    deptName: 'IT Infrastructure & AMC',
    expRange: '1 - 3 Years',
    expCategory: '0-2',
    location: 'Kolkata (Client Locations)',
    type: 'Full-time • Field / On-site',
    urgent: true,
    skills: ['Desktop Troubleshooting', 'Laptop Chip-level / OS', 'LAN Cabling', 'Printers', 'Windows 10/11'],
    description: 'Provide prompt on-site and remote technical assistance for desktop hardware, laptops, peripherals, and client network connectivity.',
    responsibilities: [
      'Diagnose and resolve hardware faults, motherboard issues, and peripheral errors.',
      'Install, patch, and maintain Windows OS, business software, and endpoint antivirus.',
      'Configure Wi-Fi routers, network printers, and structured Ethernet cabling.'
    ],
    requirements: [
      'Diploma / Degree in Hardware & Networking (Jetking, CCNA, or equivalent).',
      'Positive customer communication and fast troubleshooting attitude.'
    ]
  },
  {
    id: 'job-8',
    title: 'Cybersecurity & UTM Firewall Engineer',
    deptId: 'security',
    deptName: 'Cybersecurity & Network',
    expRange: '2 - 5 Years',
    expCategory: '2-5',
    location: 'Kolkata (Salt Lake Sector-V)',
    type: 'Full-time • On-site',
    urgent: true,
    skills: ['Sophos UTM/XGS', 'Fortinet FortiGate', 'IPSec VPN', 'Endpoint EDR', 'SOC Monitoring', 'SIEM'],
    description: 'Configure and monitor enterprise perimeter firewalls, secure site-to-site tunnels, intrusion prevention, and endpoint security suites.',
    responsibilities: [
      'Deploy and manage next-generation firewalls (Sophos, Fortinet, SonicWall).',
      'Create granular firewall policies, content filtering, and multi-factor authentication.',
      'Investigate security alerts, malware incidents, and unauthorized traffic anomalies.'
    ],
    requirements: [
      'Certified in Sophos Certified Engineer or Fortinet NSE 4 preferred.',
      'Deep understanding of TCP/IP, NAT, VPN tunnels, and port security.'
    ]
  },
  {
    id: 'job-9',
    title: 'Network Infrastructure & CCTV Specialist',
    deptId: 'security',
    deptName: 'Cybersecurity & Network',
    expRange: '2 - 4 Years',
    expCategory: '2-5',
    location: 'Kolkata & Client Sites',
    type: 'Full-time • On-site',
    urgent: false,
    skills: ['Cisco Switches', 'VLAN Configuration', 'IP CCTV Cameras', 'NVR/DVR', 'Access Control', 'Wi-Fi APs'],
    description: 'Design and deploy enterprise LAN architectures, managed switches, corporate Wi-Fi access points, and IP CCTV surveillance solutions.',
    responsibilities: [
      'Configure L2/L3 managed switches, VLAN segmentations, and QoS traffic priority.',
      'Install and commission IP CCTV cameras, NVR recording servers, and remote viewing apps.',
      'Conduct site surveys for Wi-Fi heatmaps and cable infrastructure.'
    ],
    requirements: [
      'Hands-on experience with managed switches (Cisco, Aruba, D-Link) and IP CCTV systems.',
      'CCNA certification is an added advantage.'
    ]
  },
  {
    id: 'job-10',
    title: 'Tally Prime Implementation Consultant',
    deptId: 'tally',
    deptName: 'Tally ERP Solutions',
    expRange: '2 - 5 Years',
    expCategory: '2-5',
    location: 'Kolkata (Salt Lake Sector-V)',
    type: 'Full-time • On-site / Client visits',
    urgent: true,
    skills: ['Tally Prime 4.x', 'GST E-Invoice & E-Way Bill', 'Inventory Management', 'Payroll', 'Audit & Accounts'],
    description: 'Assist clients in setting up Tally Prime ERP, configuring complex GST accounting structures, inventory controls, and financial reporting.',
    responsibilities: [
      'Lead end-to-end Tally Prime implementations for trading, manufacturing, and service firms.',
      'Train client accountants and finance teams on e-invoicing, GST returns, and voucher workflows.',
      'Troubleshoot company data corruption, synchronization errors, and split database issues.'
    ],
    requirements: [
      'Certified Tally Professional or B.Com / M.Com with in-depth Tally Prime mastery.',
      'Clear understanding of Indian GST, TDS, TCS, and accounting principles.'
    ]
  },
  {
    id: 'job-11',
    title: 'Tally TDL Developer & Customizer',
    deptId: 'tally',
    deptName: 'Tally ERP Solutions',
    expRange: '2 - 5 Years',
    expCategory: '2-5',
    location: 'Kolkata (Salt Lake Sector-V)',
    type: 'Full-time • Hybrid',
    urgent: false,
    skills: ['TDL (Tally Definition Language)', 'Tally XML / ODBC', 'Custom Invoices', 'Report Customization', 'API Sync'],
    description: 'Develop custom TDL plugins, barcode integration, automated PDF voucher generators, and external API integrations for Tally Prime.',
    responsibilities: [
      'Code custom TDL reports, collection definitions, forms, and validation rules.',
      'Build automated data synchronization between third-party web apps and Tally via XML/JSON.',
      'Create bespoke invoice formats, batch print routines, and customized user security controls.'
    ],
    requirements: [
      'Proven expertise in writing clean TDL code for Tally.ERP 9 and Tally Prime.',
      'Experience in integrating Tally with web applications or SQL databases is highly valued.'
    ]
  },
  {
    id: 'job-12',
    title: 'Enterprise IT Sales & Business Development',
    deptId: 'sales',
    deptName: 'Sales & Business Dev',
    expRange: '1 - 4 Years',
    expCategory: '0-2',
    location: 'Kolkata (Salt Lake Sector-V)',
    type: 'Full-time • On-site',
    urgent: false,
    skills: ['B2B Sales', 'IT AMC Proposals', 'Tally Licensing', 'Cloud Solutions', 'Client Relationship', 'Lead Gen'],
    description: 'Drive B2B sales of enterprise IT solutions, annual maintenance contracts (AMC), cloud server hosting, and Tally Prime licensing across eastern India.',
    responsibilities: [
      'Identify new corporate prospects, pitch tailored IT solutions, and conduct product demos.',
      'Prepare comprehensive technical commercial proposals and tender bids.',
      'Nurture ongoing relationships with CIOs, IT managers, and business owners.'
    ],
    requirements: [
      'BBA / MBA / Any Graduate with proven track record in B2B corporate tech sales.',
      'Energetic communication skills and passion for technology consulting.'
    ]
  }
];

// ─── BENEFITS DATA ──────────────────────────────────────────────────
const BENEFITS = [
  {
    icon: TrendingUp,
    title: 'Fast-Track Career Growth',
    desc: 'Transparent biannual appraisals and performance-based promotions. Your initiative dictates your career speed.',
    color: '#0284C7',
    bg: '#E0F2FE'
  },
  {
    icon: Wallet,
    title: 'Competitive Compensation & Bonuses',
    desc: 'Industry-leading fixed compensation, annual performance bonuses, project rewards, and festive perks.',
    color: '#10B981',
    bg: '#D1FAE5'
  },
  {
    icon: GraduationCap,
    title: '100% Sponsored Certifications',
    desc: 'We sponsor your official credentials in Microsoft, AWS, Cisco CCNA, Sophos Firewall, and Tally Prime.',
    color: '#8B5CF6',
    bg: '#EDE9FE'
  },
  {
    icon: Heart,
    title: 'Comprehensive Health Insurance',
    desc: 'Group mediclaim and personal accident coverage for you and your dependents with cashless hospital access.',
    color: '#EC4899',
    bg: '#FCE7F3'
  },
  {
    icon: Scale,
    title: 'Balanced Work Environment',
    desc: 'Standardized 5-day work week, paid festive holidays, compensatory offs, and supportive personal leave policies.',
    color: '#F59E0B',
    bg: '#FEF3C7'
  },
  {
    icon: Lightbulb,
    title: 'Real Enterprise Tech Exposure',
    desc: 'Hands-on experience with Tier-III data centers, enterprise hypervisors, SOC environments, and ERP integrations.',
    color: '#06B6D4',
    bg: '#CFFAFE'
  },
  {
    icon: Building2,
    title: 'State-of-the-Art Workstation',
    desc: 'Ergonomic chairs, dual monitors, high-speed fiber internet, and comfortable breakout zones in Salt Lake Sector-V.',
    color: '#3B82F6',
    bg: '#DBEAFE'
  },
  {
    icon: Award,
    title: 'Recognition & Gala Celebrations',
    desc: 'Quarterly Spot Awards, Employee of the Year trophies, annual gala nights, and sponsored team offsites.',
    color: '#EA580C',
    bg: '#FFEDD5'
  }
];

// ─── CULTURE STORIES ────────────────────────────────────────────────
const CULTURE_STORIES = [
  {
    title: 'Collaborative Problem Solving',
    tag: 'TEAMWORK',
    desc: 'Engineers, architects, and consultants work shoulder-to-shoulder to tackle complex cloud migrations and network bottlenecks.',
    img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Continuous Learning & Tech Talks',
    tag: 'LEARNING',
    desc: 'Weekly internal knowledge-sharing sessions, hands-on firewall simulation labs, and Tally masterclasses led by veterans.',
    img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Festive Joy & Cultural Extravaganza',
    tag: 'CELEBRATIONS',
    desc: 'From Durga Puja grand feasts and Diwali sweet boxes to New Year office celebrations, we celebrate life together.',
    img: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Fun, Sports & Hack Days',
    tag: 'RECREATION',
    desc: 'Annual intra-office cricket matches, table tennis tournaments, gaming days, and hackathons keep the energy vibrant.',
    img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
  }
];

// ─── HIRING PROCESS STEPS ───────────────────────────────────────────
const HIRING_STEPS = [
  {
    step: '01',
    title: 'Application Review',
    time: 'Within 48 Hours',
    desc: 'Our Talent Acquisition team carefully reviews your resume, project portfolio, and domain compatibility.',
    icon: FileText
  },
  {
    step: '02',
    title: 'Technical & Practical Round',
    time: '2 - 4 Days',
    desc: 'A hands-on discussion with senior engineers to explore real-world scenarios, troubleshooting, and code quality.',
    icon: Code
  },
  {
    step: '03',
    title: 'Leadership & Culture Fitment',
    time: '1 - 2 Days',
    desc: 'An open conversation with Department Heads about mutual expectations, career aspirations, and team alignment.',
    icon: Users
  },
  {
    step: '04',
    title: 'Formal Offer & Welcome',
    time: 'Within 48 Hours',
    desc: 'Clear, transparent offer proposal followed by smooth digital onboarding, starter kit, and mentor assignment on Day 1.',
    icon: CheckCircle2
  }
];

// ─── EMPLOYEE TESTIMONIALS ──────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Subhajit Roy',
    role: 'Cloud Infrastructure Lead',
    tenure: '4 Years at NISPL',
    quote: 'I joined as a Junior Support Engineer. The leadership trusted my abilities and sponsored my AWS and VMware certifications. Today, I lead our entire Tier-III data center operations.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'
  },
  {
    name: 'Priyanka Mukherjee',
    role: 'Senior Tally ERP Consultant',
    tenure: '3 Years at NISPL',
    quote: 'Net Infotech System is recognized as one of eastern India’s top Tally partners. The sheer breadth of custom TDL projects and enterprise clients I handle here has elevated my expertise tremendously.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80'
  },
  {
    name: 'Rohan Sharma',
    role: 'Cybersecurity Analyst',
    tenure: '2.5 Years at NISPL',
    quote: 'Zero micromanagement, genuine work-life balance, and friendly colleagues who are always ready to jump in and help solve a tricky firewall configuration. Proud to be an NISPLian!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80'
  }
];

export default function CareersPage({ onShowToast }) {
  const [activeTab, setActiveTab] = useState('openings');
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExp, setSelectedExp] = useState('all');
  const [expandedJobId, setExpandedJobId] = useState(null);

  // Application Modal state
  const [applyModalJob, setApplyModalJob] = useState(null);
  const [applyForm, setApplyForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    experience: '2 - 5 Years',
    noticePeriod: '30 Days',
    currentLocation: 'Kolkata',
    portfolioUrl: '',
    resumeFileName: '',
    notes: ''
  });
  const [isApplying, setIsApplying] = useState(false);

  // Quick Resume Drop Form state
  const [quickForm, setQuickForm] = useState({
    position: '',
    fullName: '',
    email: '',
    phone: '',
    resumeFileName: ''
  });
  const [isQuickSubmitting, setIsQuickSubmitting] = useState(false);

  // Filter jobs based on selected department, search query, and experience filter
  const filteredJobs = JOB_OPENINGS.filter((job) => {
    const matchesDept = selectedDept === 'all' || job.deptId === selectedDept;
    const matchesSearch =
      searchQuery === '' ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      job.deptName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesExp = selectedExp === 'all' || job.expCategory === selectedExp;

    return matchesDept && matchesSearch && matchesExp;
  });

  const handleOpenApplyModal = (job) => {
    setApplyModalJob(job);
    setApplyForm((prev) => ({
      ...prev,
      position: job.title
    }));
  };

  const handleCloseApplyModal = () => {
    setApplyModalJob(null);
  };

  const handleModalFormSubmit = (e) => {
    e.preventDefault();
    if (!applyForm.fullName || !applyForm.email || !applyForm.phone) {
      if (onShowToast) onShowToast('Please fill in your full name, email, and phone number.');
      return;
    }
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setApplyModalJob(null);
      if (onShowToast) {
        onShowToast(`Application submitted successfully for ${applyModalJob.title}! Our HR team will reach out within 48 hours.`);
      }
      setApplyForm({
        fullName: '',
        email: '',
        phone: '',
        experience: '2 - 5 Years',
        noticePeriod: '30 Days',
        currentLocation: 'Kolkata',
        portfolioUrl: '',
        resumeFileName: '',
        notes: ''
      });
    }, 600);
  };

  const handleQuickFormSubmit = (e) => {
    e.preventDefault();
    if (!quickForm.email || !quickForm.phone) {
      if (onShowToast) onShowToast('Please provide your email and contact number.');
      return;
    }
    setIsQuickSubmitting(true);
    setTimeout(() => {
      setIsQuickSubmitting(false);
      if (onShowToast) {
        onShowToast('Resume received! Your profile is added to our priority talent pool.');
      }
      setQuickForm({
        position: '',
        fullName: '',
        email: '',
        phone: '',
        resumeFileName: ''
      });
    }, 600);
  };

  const scrollToOpenings = () => {
    setActiveTab('openings');
    const el = document.getElementById('career-portal-tabs');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToResume = () => {
    const el = document.getElementById('career-resume-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="car-enhanced-page">
      
      {/* ── BREADCRUMB ────────────────────────────────────────────── */}
      <nav className="car-breadcrumb-bar" aria-label="Breadcrumb">
        <div className="container car-breadcrumbs">
          <Link to="/">Home</Link>
          <span className="car-breadcrumb-sep">&gt;</span>
          <Link to="/contact">Contact</Link>
          <span className="car-breadcrumb-sep">&gt;</span>
          <span className="car-crumb-current">Careers</span>
        </div>
      </nav>

      {/* ── HERO BANNER ───────────────────────────────────────────── */}
      <section className="car-hero-banner">
        <div className="car-hero-backdrop" />
        <div className="container car-hero-container">
          
          <div className="car-hero-content">
            <div className="car-hero-badge">
              <Sparkles size={14} className="car-hero-badge-sparkle" />
              <span>CAREERS AT NISPL • WE ARE ACTIVELY HIRING</span>
            </div>

            <h1 className="car-hero-title">
              Build What Matters.<br />
              <span className="car-title-gradient">Be The Next NISPLian.</span>
            </h1>

            <p className="car-hero-subtext">
              Celebrating 25+ years of technology leadership in IT Infrastructure, Tier-III Cloud Servers,
              Cybersecurity Defense, and Enterprise Tally Solutions. Accelerate your career alongside passionate engineers.
            </p>

            <div className="car-hero-actions">
              <button 
                type="button" 
                className="car-btn-primary"
                onClick={scrollToOpenings}
              >
                <Briefcase size={16} />
                <span>Explore Open Roles ({JOB_OPENINGS.length})</span>
              </button>
              
              <button 
                type="button" 
                className="car-btn-secondary"
                onClick={scrollToResume}
              >
                <UploadCloud size={16} />
                <span>Drop Your Resume</span>
              </button>
            </div>
          </div>

          {/* Right Hero Stats Floating Card */}
          <div className="car-hero-stats-card">
            <div className="car-hero-stat-badge">
              <span className="car-stat-val">25+</span>
              <span className="car-stat-label">Years of Tech Excellence</span>
            </div>
            <div className="car-hero-stat-badge">
              <span className="car-stat-val">150+</span>
              <span className="car-stat-label">Talented Engineers & Staff</span>
            </div>
            <div className="car-hero-stat-badge">
              <span className="car-stat-val">96%</span>
              <span className="car-stat-label">Employee Retention & Growth</span>
            </div>
            <div className="car-hero-stat-badge">
              <span className="car-stat-val">4.3★</span>
              <span className="car-stat-label">Glassdoor & AmbitionBox</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── HIGHLIGHT PILLARS BAR ─────────────────────────────────── */}
      <section className="car-pillars-bar">
        <div className="container car-pillars-grid">
          <div className="car-pillar-item">
            <div className="car-pillar-icon" style={{ background: '#E0F2FE', color: '#0284C7' }}>
              <TrendingUp size={18} />
            </div>
            <div>
              <strong>Fast-Track Growth</strong>
              <p>Promotions based on impact and merit, not tenure.</p>
            </div>
          </div>

          <div className="car-pillar-item">
            <div className="car-pillar-icon" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
              <GraduationCap size={18} />
            </div>
            <div>
              <strong>Sponsored Upskilling</strong>
              <p>100% reimbursement for AWS, Cisco, Azure & Tally certs.</p>
            </div>
          </div>

          <div className="car-pillar-item">
            <div className="car-pillar-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
              <Server size={18} />
            </div>
            <div>
              <strong>Tier-III Tech Stack</strong>
              <p>Direct exposure to enterprise cloud, SOC, and ERP systems.</p>
            </div>
          </div>

          <div className="car-pillar-item">
            <div className="car-pillar-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
              <HeartHandshake size={18} />
            </div>
            <div>
              <strong>Collaborative Culture</strong>
              <p>5-day work week with approachable, supportive mentors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── NAVIGATION TABS ───────────────────────────────────────── */}
      <div className="car-tabs-nav-bar" id="career-portal-tabs">
        <div className="container car-tabs-container">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`car-nav-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.count && <span className="car-tab-count">{tab.count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN TABBED CONTENT AREA ──────────────────────────────── */}
      <main className="car-content-section">
        <div className="container">

          {/* ────────────────────────────────────────────────────────
              TAB 1: CURRENT OPENINGS
              ──────────────────────────────────────────────────────── */}
          {activeTab === 'openings' && (
            <div className="car-openings-view animate-fade-in">
              
              {/* Filter Bar */}
              <div className="car-filters-panel">
                <div className="car-search-box">
                  <Search size={16} className="car-search-icon" />
                  <input
                    type="text"
                    placeholder="Search roles by title, skill (.NET, Tally, Firewall, Azure)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="car-search-input"
                  />
                  {searchQuery && (
                    <button 
                      type="button" 
                      className="car-clear-search" 
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search query"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="car-filter-dropdowns">
                  <div className="car-filter-select-wrapper">
                    <Filter size={14} className="filter-select-icon" />
                    <select
                      value={selectedExp}
                      onChange={(e) => setSelectedExp(e.target.value)}
                      className="car-filter-select"
                      aria-label="Filter by experience level"
                    >
                      <option value="all">All Experience Levels</option>
                      <option value="0-2">Entry Level (0 - 2 Years)</option>
                      <option value="2-5">Mid Level (2 - 5 Years)</option>
                      <option value="5+">Senior / Lead (5+ Years)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Department Pills */}
              <div className="car-dept-pills-bar">
                {DEPARTMENTS.map((dept) => {
                  const isDeptActive = selectedDept === dept.id;
                  const deptCount = dept.id === 'all' 
                    ? JOB_OPENINGS.length 
                    : JOB_OPENINGS.filter((j) => j.deptId === dept.id).length;

                  return (
                    <button
                      key={dept.id}
                      type="button"
                      className={`car-dept-pill ${isDeptActive ? 'active' : ''}`}
                      onClick={() => setSelectedDept(dept.id)}
                    >
                      <span>{dept.name}</span>
                      <span className="car-dept-pill-count">{deptCount}</span>
                    </button>
                  );
                })}
              </div>

              {/* Results count & status */}
              <div className="car-results-header">
                <p>Showing <strong>{filteredJobs.length}</strong> available career opportunities</p>
                {(searchQuery || selectedExp !== 'all' || selectedDept !== 'all') && (
                  <button
                    type="button"
                    className="car-reset-filters-btn"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDept('all');
                      setSelectedExp('all');
                    }}
                  >
                    Reset all filters
                  </button>
                )}
              </div>

              {/* Job Cards Grid */}
              {filteredJobs.length > 0 ? (
                <div className="car-jobs-grid">
                  {filteredJobs.map((job) => {
                    const isExpanded = expandedJobId === job.id;

                    return (
                      <div className="car-job-card-rich" key={job.id}>
                        
                        {/* Card Header */}
                        <div className="car-job-card-top">
                          <div className="car-job-badges-row">
                            <span className="car-job-dept-tag">{job.deptName}</span>
                            <span className="car-job-type-tag">{job.type}</span>
                            {job.urgent && (
                              <span className="car-job-urgent-tag">🔥 Urgent Hiring</span>
                            )}
                          </div>

                          <h3 className="car-job-title">{job.title}</h3>

                          <div className="car-job-meta-row">
                            <span className="car-job-meta-item">
                              <Clock size={14} />
                              <span>{job.expRange}</span>
                            </span>
                            <span className="car-job-meta-item">
                              <MapPin size={14} />
                              <span>{job.location}</span>
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="car-job-card-body">
                          <p className="car-job-desc">{job.description}</p>

                          {/* Skill Tags */}
                          <div className="car-job-skills-list">
                            {job.skills.map((skill, sIdx) => (
                              <span key={sIdx} className="car-job-skill-chip">{skill}</span>
                            ))}
                          </div>

                          {/* Expanded Details Section */}
                          {isExpanded && (
                            <div className="car-job-expanded-details animate-fade-in">
                              <div className="car-job-details-block">
                                <h4>Key Responsibilities:</h4>
                                <ul>
                                  {job.responsibilities.map((r, rIdx) => (
                                    <li key={rIdx}>{r}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="car-job-details-block">
                                <h4>Requirements & Skills:</h4>
                                <ul>
                                  {job.requirements.map((req, reqIdx) => (
                                    <li key={reqIdx}>{req}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Card Footer Actions */}
                        <div className="car-job-card-footer">
                          <button
                            type="button"
                            className="car-job-toggle-btn"
                            onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                          >
                            <span>{isExpanded ? 'Hide Details' : 'View Job Details'}</span>
                            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>

                          <button
                            type="button"
                            className="car-job-apply-btn"
                            onClick={() => handleOpenApplyModal(job)}
                          >
                            <span>Apply Now</span>
                            <ArrowRight size={15} />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="car-no-jobs-card">
                  <Briefcase size={40} className="car-no-jobs-icon" />
                  <h3>No matching openings found</h3>
                  <p>Try searching for a different keyword or clear your filters to view all openings.</p>
                  <button
                    type="button"
                    className="car-btn-primary"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDept('all');
                      setSelectedExp('all');
                    }}
                  >
                    View All {JOB_OPENINGS.length} Positions
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ────────────────────────────────────────────────────────
              TAB 2: WHY NISPL? (BENEFITS & PERKS)
              ──────────────────────────────────────────────────────── */}
          {activeTab === 'why' && (
            <div className="car-why-view animate-fade-in">
              <div className="car-section-heading-box">
                <span className="car-section-tag">INVESTED IN YOUR SUCCESS</span>
                <h2>Perks & Benefits of Being an NISPLian</h2>
                <p>
                  We believe when our people grow, our company thrives. We offer comprehensive rewards,
                  sponsored education, and a work culture designed for long-term satisfaction.
                </p>
              </div>

              <div className="car-benefits-grid">
                {BENEFITS.map((benefit, bIdx) => {
                  const BIcon = benefit.icon;
                  return (
                    <div className="car-benefit-rich-card" key={bIdx}>
                      <div
                        className="car-benefit-icon-wrapper"
                        style={{ background: benefit.bg, color: benefit.color }}
                      >
                        <BIcon size={24} />
                      </div>
                      <h3>{benefit.title}</h3>
                      <p>{benefit.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Learning & Growth Callout Banner */}
              <div className="car-learning-callout">
                <div className="car-learning-content">
                  <div className="car-learning-icon-box">
                    <GraduationCap size={32} />
                  </div>
                  <div>
                    <h3>Continuous Learning & Certifications Sponsorship</h3>
                    <p>
                      Want to get certified in AWS Solutions Architect, Cisco CCNA, Sophos Firewall, or Tally Prime Expert?
                      NISPL covers 100% of the exam registration and study materials for eligible employees.
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="car-btn-white"
                  onClick={scrollToOpenings}
                >
                  Join Our Team
                </button>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────
              TAB 3: OUR WORK CULTURE
              ──────────────────────────────────────────────────────── */}
          {activeTab === 'culture' && (
            <div className="car-culture-view animate-fade-in">
              <div className="car-section-heading-box">
                <span className="car-section-tag">LIFE AT NET INFOTECH SYSTEM</span>
                <h2>A Community Driven by Passion & Care</h2>
                <p>
                  We combine enterprise-level technology delivery with the warmth, transparency,
                  and camaraderie of an approachable family.
                </p>
              </div>

              {/* Culture Stories Grid */}
              <div className="car-culture-stories-grid">
                {CULTURE_STORIES.map((item, cIdx) => (
                  <div className="car-culture-story-card" key={cIdx}>
                    <div className="car-story-img-frame">
                      <img src={item.img} alt={item.title} className="car-story-img" />
                      <span className="car-story-badge">{item.tag}</span>
                    </div>
                    <div className="car-story-info">
                      <h3>{item.title}</h3>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Core Values Strip */}
              <div className="car-values-strip">
                <h3>Our Core Pillars</h3>
                <div className="car-values-list">
                  <div className="car-value-item">
                    <CheckCircle2 size={18} color="#0284C7" />
                    <strong>Integrity First</strong>
                    <span>Ethical and transparent in all client & peer relations.</span>
                  </div>
                  <div className="car-value-item">
                    <CheckCircle2 size={18} color="#0284C7" />
                    <strong>Extreme Ownership</strong>
                    <span>We take pride in our deliverables from start to finish.</span>
                  </div>
                  <div className="car-value-item">
                    <CheckCircle2 size={18} color="#0284C7" />
                    <strong>Continuous Curiosity</strong>
                    <span>Never settle; always learn the next version and framework.</span>
                  </div>
                  <div className="car-value-item">
                    <CheckCircle2 size={18} color="#0284C7" />
                    <strong>Empathy & Respect</strong>
                    <span>Inclusive, welcoming environment for people of all backgrounds.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────
              TAB 4: HIRING PROCESS
              ──────────────────────────────────────────────────────── */}
          {activeTab === 'process' && (
            <div className="car-process-view animate-fade-in">
              <div className="car-section-heading-box">
                <span className="car-section-tag">FAST & TRANSPARENT</span>
                <h2>Our 4-Step Hiring Journey</h2>
                <p>
                  We respect your time. Our hiring process is streamlined, clear, and provides prompt feedback at every milestone.
                </p>
              </div>

              <div className="car-steps-timeline">
                {HIRING_STEPS.map((step, sIdx) => {
                  const SIcon = step.icon;
                  return (
                    <div className="car-step-card" key={sIdx}>
                      <div className="car-step-badge">{step.step}</div>
                      <div className="car-step-icon">
                        <SIcon size={22} />
                      </div>
                      <h3>{step.title}</h3>
                      <span className="car-step-timeline-tag">
                        <Clock size={12} /> {step.time}
                      </span>
                      <p>{step.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="car-process-tip-box">
                <Lightbulb size={24} className="car-tip-icon" />
                <div>
                  <strong>Interview Tip from our Engineering Leads:</strong>
                  <p>
                    We value practical problem-solving ability, clear communication, and a willingness to learn
                    more than textbook definitions. Bring your past project stories and real-world challenges!
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── EMPLOYEE TESTIMONIALS SPOTLIGHT ───────────────────────── */}
      <section className="car-testimonials-section">
        <div className="container">
          <div className="car-section-heading-box">
            <span className="car-section-tag">VOICES OF NISPLIANS</span>
            <h2>Why Our Team Loves Working Here</h2>
          </div>

          <div className="car-testimonials-grid">
            {TESTIMONIALS.map((t, tIdx) => (
              <div className="car-testimonial-card" key={tIdx}>
                <div className="car-quote-mark">“</div>
                <p className="car-testimonial-text">{t.quote}</p>
                <div className="car-testimonial-author">
                  <img src={t.avatar} alt={t.name} className="car-author-avatar" />
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                    <span className="car-author-tenure">{t.tenure}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAST APPLICATION / DROP RESUME SECTION ────────────────── */}
      <section className="car-resume-section" id="career-resume-section">
        <div className="car-resume-backdrop" />
        <div className="container car-resume-container">
          
          <div className="car-resume-left">
            <div className="car-resume-tag">
              <Sparkles size={14} />
              <span>TALENT POOL INVITATION</span>
            </div>
            <h2>Don't See Your Dream Role Open Today?</h2>
            <p>
              We are constantly growing. Even if your exact title isn't listed, submit your CV below.
              Our HR directors review spontaneous applications every week and reach out for upcoming project expansions.
            </p>

            <div className="car-hr-contact-pills">
              <div className="car-hr-pill">
                <Mail size={16} color="#0284C7" />
                <div>
                  <span className="lbl">Direct HR Email</span>
                  <strong>careers@netinfotechsystem.com</strong>
                </div>
              </div>

              <div className="car-hr-pill">
                <Phone size={16} color="#EA580C" />
                <div>
                  <span className="lbl">HR Recruitment Hotline</span>
                  <strong>+91 9330113000</strong>
                </div>
              </div>

              <div className="car-hr-pill">
                <MapPin size={16} color="#10B981" />
                <div>
                  <span className="lbl">Headquarters</span>
                  <strong>Salt Lake Sector-V, Kolkata - 700091</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Apply Form Card */}
          <div className="car-resume-card-wrapper">
            <div className="car-resume-card-rich">
              <h3>Fast-Track Resume Drop</h3>
              <p className="car-resume-sub">Direct route to our HR recruitment desk</p>

              <form onSubmit={handleQuickFormSubmit} className="car-quick-form">
                <div className="car-form-group">
                  <label htmlFor="quick-pos">Interested Role / Domain *</label>
                  <select
                    id="quick-pos"
                    value={quickForm.position}
                    onChange={(e) => setQuickForm({ ...quickForm, position: e.target.value })}
                    required
                  >
                    <option value="">Select Domain / Position</option>
                    <option value="Software Development">Software & Web Development (.NET, PHP, React)</option>
                    <option value="Cloud & Data Center">Cloud & Data Center Engineering</option>
                    <option value="IT Infrastructure">IT Infrastructure & Hardware AMC</option>
                    <option value="Cybersecurity">Cybersecurity & UTM Firewall</option>
                    <option value="Tally ERP">Tally Prime Implementation / TDL</option>
                    <option value="B2B Sales">Enterprise IT Sales & Marketing</option>
                    <option value="Other">Other Specialized Role</option>
                  </select>
                </div>

                <div className="car-form-row">
                  <div className="car-form-group">
                    <label htmlFor="quick-name">Your Full Name *</label>
                    <input
                      id="quick-name"
                      type="text"
                      placeholder="e.g. Rahul Sen"
                      value={quickForm.fullName}
                      onChange={(e) => setQuickForm({ ...quickForm, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="car-form-group">
                    <label htmlFor="quick-phone">Phone Number *</label>
                    <input
                      id="quick-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={quickForm.phone}
                      onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="car-form-group">
                  <label htmlFor="quick-email">Email Address *</label>
                  <input
                    id="quick-email"
                    type="email"
                    placeholder="your.email@domain.com"
                    value={quickForm.email}
                    onChange={(e) => setQuickForm({ ...quickForm, email: e.target.value })}
                    required
                  />
                </div>

                {/* Upload File Input */}
                <div className="car-form-group">
                  <label>Attach Resume / CV (.pdf, .docx, max 5MB)</label>
                  <label className="car-dropzone-label">
                    <UploadCloud size={20} className="car-drop-icon" />
                    <span>
                      {quickForm.resumeFileName ? (
                        <strong className="car-file-chosen">{quickForm.resumeFileName}</strong>
                      ) : (
                        'Click to browse or drop your CV here'
                      )}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      hidden
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setQuickForm({ ...quickForm, resumeFileName: e.target.files[0].name });
                        }
                      }}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="car-submit-btn"
                  disabled={isQuickSubmitting}
                >
                  <Send size={16} />
                  <span>{isQuickSubmitting ? 'Submitting...' : 'Send Application'}</span>
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* ── RATINGS & TRUST STRIP ───────────────────────────────── */}
        <div className="container">
          <div className="car-ratings-strip">
            <div className="car-rating-box">
              <span className="car-rating-tag">EMPLOYEE REPUTATION</span>
              <strong>4.3</strong>
              <div className="car-stars">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={13} fill="#F59E0B" stroke="#F59E0B" />
                ))}
              </div>
              <span className="car-rating-company glassdoor">glassdoor</span>
            </div>

            <div className="car-rating-box">
              <span className="car-rating-tag">CAREER SATISFACTION</span>
              <strong>4.2</strong>
              <div className="car-stars">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={13} fill="#F59E0B" stroke="#F59E0B" />
                ))}
              </div>
              <span className="car-rating-company ambitionbox">AmbitionBox</span>
            </div>

            <div className="car-rating-box">
              <span className="car-rating-tag">CLIENT & PARTNER TRUST</span>
              <strong>4.8</strong>
              <div className="car-stars">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={13} fill="#F59E0B" stroke="#F59E0B" />
                ))}
              </div>
              <span className="car-rating-company google">Google Reviews</span>
            </div>
          </div>
        </div>

      </section>

      {/* ── JOB APPLICATION MODAL ─────────────────────────────────── */}
      {applyModalJob && (
        <div className="car-modal-overlay" onClick={handleCloseApplyModal}>
          <div className="car-modal-dialog" onClick={(e) => e.stopPropagation()}>
            
            <div className="car-modal-header">
              <div>
                <span className="car-modal-badge">{applyModalJob.deptName}</span>
                <h3 className="car-modal-title">Apply for {applyModalJob.title}</h3>
                <span className="car-modal-sub">
                  <MapPin size={13} /> {applyModalJob.location} • <Clock size={13} /> {applyModalJob.expRange}
                </span>
              </div>
              <button
                type="button"
                className="car-modal-close"
                onClick={handleCloseApplyModal}
                aria-label="Close application dialog"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleModalFormSubmit} className="car-modal-form">
              <div className="car-form-row">
                <div className="car-form-group">
                  <label htmlFor="modal-name">Full Name *</label>
                  <input
                    id="modal-name"
                    type="text"
                    required
                    placeholder="e.g. Sourav Mukherjee"
                    value={applyForm.fullName}
                    onChange={(e) => setApplyForm({ ...applyForm, fullName: e.target.value })}
                  />
                </div>

                <div className="car-form-group">
                  <label htmlFor="modal-email">Email Address *</label>
                  <input
                    id="modal-email"
                    type="email"
                    required
                    placeholder="sourav@example.com"
                    value={applyForm.email}
                    onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="car-form-row">
                <div className="car-form-group">
                  <label htmlFor="modal-phone">Phone / WhatsApp *</label>
                  <input
                    id="modal-phone"
                    type="tel"
                    required
                    placeholder="+91 98300 12345"
                    value={applyForm.phone}
                    onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                  />
                </div>

                <div className="car-form-group">
                  <label htmlFor="modal-exp">Total Relevant Experience *</label>
                  <select
                    id="modal-exp"
                    value={applyForm.experience}
                    onChange={(e) => setApplyForm({ ...applyForm, experience: e.target.value })}
                  >
                    <option>Fresher / &lt; 1 Year</option>
                    <option>1 - 2 Years</option>
                    <option>2 - 5 Years</option>
                    <option>5 - 8 Years</option>
                    <option>8+ Years</option>
                  </select>
                </div>
              </div>

              <div className="car-form-row">
                <div className="car-form-group">
                  <label htmlFor="modal-notice">Notice Period *</label>
                  <select
                    id="modal-notice"
                    value={applyForm.noticePeriod}
                    onChange={(e) => setApplyForm({ ...applyForm, noticePeriod: e.target.value })}
                  >
                    <option>Immediate / Available Now</option>
                    <option>15 Days</option>
                    <option>30 Days</option>
                    <option>60 Days</option>
                    <option>90 Days</option>
                  </select>
                </div>

                <div className="car-form-group">
                  <label htmlFor="modal-loc">Current City *</label>
                  <input
                    id="modal-loc"
                    type="text"
                    placeholder="e.g. Kolkata / Howrah"
                    value={applyForm.currentLocation}
                    onChange={(e) => setApplyForm({ ...applyForm, currentLocation: e.target.value })}
                  />
                </div>
              </div>

              <div className="car-form-group">
                <label htmlFor="modal-port">LinkedIn / Portfolio Link (Optional)</label>
                <input
                  id="modal-port"
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={applyForm.portfolioUrl}
                  onChange={(e) => setApplyForm({ ...applyForm, portfolioUrl: e.target.value })}
                />
              </div>

              {/* Upload CV */}
              <div className="car-form-group">
                <label>Upload Resume / Curriculum Vitae (.pdf, .docx) *</label>
                <label className="car-modal-dropzone">
                  <UploadCloud size={20} />
                  <span>
                    {applyForm.resumeFileName ? (
                      <strong className="car-file-chosen">{applyForm.resumeFileName}</strong>
                    ) : (
                      'Click to upload your resume (PDF or DOCX)'
                    )}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    hidden
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setApplyForm({ ...applyForm, resumeFileName: e.target.files[0].name });
                      }
                    }}
                  />
                </label>
              </div>

              <div className="car-form-group">
                <label htmlFor="modal-notes">Short Note / Why you are a great fit (Optional)</label>
                <textarea
                  id="modal-notes"
                  rows={3}
                  placeholder="Tell us briefly about your core achievements or why this role excites you..."
                  value={applyForm.notes}
                  onChange={(e) => setApplyForm({ ...applyForm, notes: e.target.value })}
                />
              </div>

              <div className="car-modal-actions">
                <button
                  type="button"
                  className="car-modal-cancel"
                  onClick={handleCloseApplyModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="car-modal-submit"
                  disabled={isApplying}
                >
                  <Send size={15} />
                  <span>{isApplying ? 'Submitting Application...' : 'Submit Application'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
