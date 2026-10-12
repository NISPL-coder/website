import megaProductsImg from '../../../../assets/products_mega_features.jpg';
import megaServicesImg from '../../../../assets/services_mega_features.jpg';
import megaSolutionsImg from '../../../../assets/solutions_mega_features.jpg';
import megaAboutImg from '../../../../assets/about_mega_features.jpg';

const NAV_ITEMS = [
  { id: 'about', label: 'About Us', path: '/about' },
  { id: 'products', label: 'Products', path: '/products' },
  { id: 'industries', label: 'Industries', path: '/industries' },
  { id: 'services', label: 'Services', path: '/services' },
  { id: 'solutions', label: 'Solutions', path: '/solutions' },
  { id: 'career', label: 'Career', path: '/career' }
];

// CodeLogicX-style 3-panel Mega Menu data configuration:
// Left Panel: Heading, Generated Feature Composite Image, Feature Pills, Overview, Consultation CTA
// Middle Panel: Interactive list of items with active gradient styling
// Right Panel: Proficient Enterprise Preview with SLA metrics, 2x2 capabilities checklist, tech specs, and quote actions
const MEGA_MENU_CONFIG = {
  about: {
    id: 'about',
    label: 'About Us',
    title: 'About Us',
    image: megaAboutImg,
    imageTag: '25+ Years Technology Excellence & Alliances',
    overview: 'Net Infotech System Pvt. Ltd. (NISPL) is Eastern India’s leading IT infrastructure, enterprise cloud, and business automation powerhouse with over 25 years of technology excellence.',
    featurePills: ['25+ Yrs Excellence', 'Tally 3-Star', '1000+ Clients', 'Pan-India NOC', 'Tier-4 Datacenter'],
    cards: [
      { id: 'ab1', label: '25+ Years', sub: 'Industry Excellence', badge: 'Silver Jubilee' },
      { id: 'ab2', label: 'Tally 3-Star', sub: 'Certified Partner', badge: 'Official Tier' },
      { id: 'ab3', label: '1000+ Clients', sub: 'Corporate Network', badge: 'Pan-India' },
      { id: 'ab4', label: '24/7 NOC Hub', sub: 'SLA Support Center', badge: 'Tier-4 Reliability' }
    ],
    items: [
      {
        id: 'about-nispl',
        label: 'About NISPL',
        path: '/about',
        badge: 'Enterprise Overview',
        heading: 'About Net Infotech System',
        slaGrade: 'ISO 9001:2015 Certified Operations',
        metrics: ['🏆 25+ Years of Excellence', '🌐 Pan-India Enterprise Reach', '⚡ 99.9% Infrastructure Uptime', '👥 1,000+ Corporate Engagements'],
        desc1: 'Founded with a core commitment to connect people and accelerate organizational efficiency, Net Infotech System Pvt. Ltd. has evolved into Eastern India’s most trusted IT infrastructure, datacenter, and cloud powerhouse.',
        desc2: 'From high-throughput enterprise networks and structured server cabling to bank-grade cloud migrations and proactive 24/7 hardware maintenance, our certified architects deliver 99.9% uptime and uncompromising system security for growing enterprises.',
        capabilities: [
          { title: 'Turnkey Systems Integration', desc: 'End-to-end datacenter, cloud, hardware AMC, and software deployment under one roof.' },
          { title: 'Proactive 24/7 Operations', desc: 'Centralized Network Operations Center (NOC) providing predictive hardware and network health tracking.' },
          { title: 'Strict Enterprise SLAs', desc: 'Guaranteed 2 to 4 hour emergency technician dispatch with SLA replacement hardware.' },
          { title: 'Certified Technical Team', desc: 'Microsoft Certified Systems Engineers (MCSE) and Tally Certified Specialists.' }
        ],
        techSpecs: 'Headquarters: Kolkata, India • Facilities: 24/7 NOC & Certified Hardware Lab • Pan-India Remote SLA Dispatch'
      },
      {
        id: 'work-culture',
        label: 'Work Culture & Life',
        path: '/about#work-culture',
        badge: 'Our People & Spirit',
        heading: 'Inside NISPL: People, Culture & Milestones',
        slaGrade: 'Inspiring Workplace Excellence FY 2024–25',
        metrics: ['🏅 Workplace Excellence Award', '🤝 Aikyam: One Team Synergy', '💡 Continuous Skill Sprints', '🎉 Festive Family Spirit'],
        desc1: 'Experience our vibrant open-floor workspace, high-tech war rooms, prestigious industry accolades, and rich cultural traditions that make NISPL a truly inspiring workplace.',
        desc2: 'From everyday innovation to national technology summits and auspicious celebrations, our people-first ethos drives Eastern India’s digital transformation.',
        capabilities: [
          { title: 'Inspiring Workplace Honor', desc: 'Conferred the Workplace Excellence Award FY 2024-25 by Tally leadership.' },
          { title: 'Aikyam (Unified Team)', desc: 'Zero silos, cross-functional collaboration, and mutual mentorship across every team.' },
          { title: 'Knowledge & Thought Leadership', desc: 'Active keynote speakers and panel delegates at national enterprise technology forums.' },
          { title: 'Warm Festive Traditions', desc: 'Year-round festive togetherness, Vishwakarma Puja, and family-like camaraderie.' }
        ],
        techSpecs: 'Location: Salt Lake Sector-V, Kolkata • Modern Tech Floor & Collaborative Suites'
      },
      {
        id: 'partners',
        label: 'Authorized Partners',
        path: '#authorized-partners',
        badge: 'Technology Alliances',
        heading: 'Certified Global Technology Alliances',
        slaGrade: 'Direct Vendor Authorized Channel',
        metrics: ['★ Tally Certified 3-Star', '☁️ Microsoft Solutions Partner', '🚀 AWS Partner Network', '🖥️ Dell & CtrlS Datacenter'],
        desc1: 'We maintain certified direct partnerships with the world\'s leading enterprise technology providers, including Microsoft Solutions Partner, Tally Certified 3-Star Partner, AWS Partner Network, Google Cloud, Dell Technologies, and CtrlS Datacenters.',
        desc2: 'These premier alliances ensure that your enterprise receives genuine volume software licensing, factory-backed hardware warranties, Tier-4 datacenter uptime, and certified engineering deployments without third-party intermediaries.',
        capabilities: [
          { title: 'Genuine Licensing Tier', desc: 'Direct authorized procurement for Microsoft 365, Windows Server, and TallyPrime licenses.' },
          { title: 'Tier-4 Datacenter Hosting', desc: 'Enterprise colocation and cloud infrastructure backed by CtrlS and AWS enterprise networks.' },
          { title: 'Direct Factory Escalation', desc: 'Priority technical support and warranty dispatch directly with Dell, Sophos, and HPE.' },
          { title: 'Periodic Vendor Audits', desc: 'Compliant licensing structures that pass all statutory corporate IT audits.' }
        ],
        techSpecs: 'Partner Tiers: Tier-1 Direct Cloud Solution Provider (CSP) • Tier-4 Indian Datacenter Colocation'
      }
    ]
  },
  products: {
    id: 'products',
    label: 'Products',
    title: 'Products',
    image: megaProductsImg,
    imageTag: 'Integrated Enterprise Product Ecosystem',
    overview: 'NISPL delivers a versatile suite of advanced enterprise software, secure cloud platforms, and hardware products to drive operational efficiency.',
    featurePills: ['TallyPrime Cloud', 'Microsoft 365', 'Datacenter VPS', 'UTM Firewalls', 'AI Biometrics'],
    cards: [
      { id: 'pr1', label: 'TallyPrime Cloud', sub: 'Anywhere Access', badge: 'SSL Encrypted' },
      { id: 'pr2', label: 'Microsoft 365', sub: 'Productivity Suites', badge: 'Cloud Governance' },
      { id: 'pr3', label: 'Datacenter VPS', sub: 'High-Speed Hosting', badge: 'Tier-4 Datacenter' },
      { id: 'pr4', label: 'SecureNet UTM', sub: 'Hardware Firewalls', badge: 'Zero-Trust Defense' }
    ],
    items: [
      {
        id: 'tally-cloud',
        label: 'TallyPrime on Cloud',
        path: '/solutions',
        badge: 'Accounting & ERP',
        heading: 'TallyPrime on Cloud — Anywhere Access',
        slaGrade: 'Tier-4 Datacenter • 99.9% Guaranteed Uptime',
        metrics: ['⚡ 99.9% Uptime SLA', '🔒 SSL 256-Bit Bank-Grade', '⏱️ < 15 Min NOC Response', '🔄 Hourly Automated Backups'],
        desc1: 'Run your complete TallyPrime accounting, inventory, and GST compliance software securely over the cloud from any Windows, Mac, or tablet device with zero latency.',
        desc2: 'Eliminates expensive on-premise server maintenance while providing automated hourly encrypted snapshots, granular role permissions, and multi-branch data synchronization.',
        capabilities: [
          { title: 'Anywhere Remote Access', desc: 'Seamless access from laptop, desktop, Mac, or tablet over broadband or mobile 4G/5G.' },
          { title: 'Automated Hourly Backups', desc: 'Point-in-time automated snapshots replicated to isolated offsite cloud storage.' },
          { title: 'Multi-Branch Concurrency', desc: 'Zero lag when 50+ concurrent users generate vouchers, bills, and tax reports.' },
          { title: 'Connected GST E-Invoicing', desc: 'Direct API integrations for e-Way bills, e-Invoices with QR codes, and bank reconciliations.' }
        ],
        techSpecs: 'Architecture: Tier-4 Indian Datacenter • Dedicated NVMe SSD Storage • 1 Gbps Unmetered Port'
      },
      {
        id: 'm365-suite',
        label: 'Microsoft 365 Business Suites',
        path: '/solutions',
        badge: 'Enterprise Productivity',
        heading: 'Microsoft 365 Modern Workplace Suites',
        slaGrade: 'Microsoft Authorized Direct Partner Deployment',
        metrics: ['🛡️ Microsoft Entra ID', '☁️ 1 TB OneDrive Per User', '📧 50 GB Exchange Mail', '📱 Intune Endpoint Security'],
        desc1: 'Empower your workforce with genuine Microsoft 365 Business Basic, Standard, and Premium licenses backed by NISPL’s certified migration, deployment, and ongoing administration support.',
        desc2: 'Includes enterprise Exchange email, Microsoft Teams collaboration, OneDrive cloud storage, SharePoint intranet portals, and Intune mobile device security to safeguard company data across laptops and smartphones.',
        capabilities: [
          { title: 'Turnkey Tenant Migration', desc: 'Seamless migration of legacy PST mailboxes, Google Workspace, and IMAP servers.' },
          { title: 'Microsoft Intune MDM', desc: 'Remotely wipe lost corporate smartphones, enforce passcode policies, and restrict USBs.' },
          { title: 'Advanced Threat Protection', desc: 'Safeguard email attachments from phishing campaigns, zero-day malware, and spoofing.' },
          { title: 'SharePoint Document Vaults', desc: 'Centralized collaborative intranet workspaces with granular permission matrices.' }
        ],
        techSpecs: 'Licensing: Business Basic, Standard, Premium & Enterprise E3/E5 • Full Tenant Governance'
      },
      {
        id: 'datacenter-vps',
        label: 'Enterprise Datacenter Cloud VPS',
        path: '/solutions',
        badge: 'Dedicated Hosting',
        heading: 'Tier-4 Indian Datacenter Cloud VPS',
        slaGrade: 'ISO 27001 Certified • Tier-4 Indian Datacenter',
        metrics: ['⚡ High IOPS NVMe SSD', '🛡️ Anti-DDoS Protection', '⏱️ 99.95% Network Uptime', '📈 Scalable vCPU & RAM'],
        desc1: 'Deploy dedicated high-speed Windows and Linux virtual servers hosted in Tier-4 Indian datacenters with low latency, NVMe SSD storage arrays, and integrated DDoS protection.',
        desc2: 'Engineered for hosting mission-critical ERP systems, corporate CRM databases, web portals, and centralized file servers with 24/7 proactive monitoring and automated disaster snapshots.',
        capabilities: [
          { title: 'Dedicated Dedicated vCPU', desc: 'Guaranteed compute resources with zero resource-stealing by neighboring tenants.' },
          { title: 'Automated Snapshot Schedules', desc: 'Scheduled full-system VM snapshots with one-click restore capabilities.' },
          { title: 'Carrier-Neutral Routing', desc: 'Sub-12ms domestic latency across all major Indian telecom networks and ISPs.' },
          { title: 'Managed OS Patching', desc: 'Routine security patching, kernel updates, and firewall rule auditing included.' }
        ],
        techSpecs: 'Datacenter: Tier-4 Certified Facility • Redundant N+N Power & Cooling • DDoS Filtered IP'
      },
      {
        id: 'utm-defense',
        label: 'Cybersecurity & UTM Firewalls',
        path: '/services',
        badge: 'Perimeter Defense',
        heading: 'Unified Threat Management (UTM) Firewalls',
        slaGrade: 'Zero-Trust Perimeter & Endpoint Shield',
        metrics: ['🛡️ Deep Packet Inspection', '🌐 Multi-WAN Failover', '🔒 IPsec / SSL VPN', '🚫 Anti-Ransomware EDR'],
        desc1: 'Enterprise-grade hardware firewall appliances and zero-trust cloud security software from Sophos, Fortinet, and SonicWall to shield your corporate network from ransomware, malware, and intrusions.',
        desc2: 'Features deep packet inspection, automated web content filtering, secure IPSec/SSL VPN tunnels for remote branches and workforces, and centralized security posture auditing.',
        capabilities: [
          { title: 'Intrusion Prevention (IPS)', desc: 'Blocks port scans, brute-force attempts, and unauthorized lateral network movements.' },
          { title: 'Multi-WAN Auto Failover', desc: 'Seamless failover between primary fiber and backup leased lines with zero session drops.' },
          { title: 'Web Category Filtering', desc: 'Restrict bandwidth-hogging websites, malicious downloads, and unauthorized file sharing.' },
          { title: 'Remote Workforce VPN', desc: 'Bank-grade encrypted SSL-VPN client access for work-from-home team members.' }
        ],
        techSpecs: 'Hardware: Sophos XGS, FortiGate, SonicWall • Throughput: Up to 10 Gbps Firewall Inspection'
      },
      {
        id: 'smart-biometrics',
        label: 'Smart Biometrics & CCTV Systems',
        path: '/services',
        badge: 'Workplace Surveillance',
        heading: 'AI Facial Biometrics & 4K Surveillance Grids',
        slaGrade: 'Real-Time Sync • NDAA Compliant Hardware',
        metrics: ['👁️ AI Facial Recognition', '📹 4K Ultra HD IP Cameras', '⏱️ < 0.2s Biometric Scan', '💾 60-Day Video Retention'],
        desc1: 'Turnkey physical security integration featuring high-definition IP camera networks, network video recorders (NVR), and cloud-synchronized facial recognition attendance systems.',
        desc2: 'Directly integrates with corporate payroll and HRMS platforms to automate staff attendance logs while providing 24/7 continuous video recording and mobile remote viewing.',
        capabilities: [
          { title: 'Touchless Mask-Friendly Scan', desc: 'Sub-second optical facial recognition with live anti-spoofing fraud protection.' },
          { title: 'Centralized Multi-Site NVR', desc: 'Monitor plant floors, warehouse docks, and reception desks from a unified phone app.' },
          { title: 'Automated Shift Payroll Sync', desc: 'Daily punch logs sync directly into HR payroll and TallyPrime attendance modules.' },
          { title: 'Power-over-Ethernet (PoE)', desc: 'Structured single-cable camera deployments with centralized UPS battery backup.' }
        ],
        techSpecs: 'Video: H.265+ Compression • Storage: WD Purple Surveillance HDDs • Night Vision: 50m IR Smart EXIR'
      }
    ]
  },
  industries: {
    id: 'industries',
    label: 'Industries',
    title: 'Industries',
    image: megaSolutionsImg,
    imageTag: 'Sector-Specific Digital Architectures',
    overview: 'We engineer tailored IT architectures, high-performance networks, and statutory compliance software specifically calibrated for the operating demands and regulatory standards of each sector.',
    featurePills: ['Manufacturing', 'Retail & FMCG', 'Healthcare', 'Tea Estates', 'Finance & CA'],
    cards: [
      { id: 'in1', label: 'Manufacturing', sub: 'Plant Networks', badge: 'Shop-Floor ERP' },
      { id: 'in2', label: 'Retail & FMCG', sub: 'Multi-Store POS', badge: 'Instant Sync' },
      { id: 'in3', label: 'Healthcare', sub: 'Hospital Systems', badge: 'Zero Downtime' },
      { id: 'in4', label: 'Govt & Tea Board', sub: 'Institutional IT', badge: 'Proven Scale' }
    ],
    items: [
      {
        id: 'ind-mfg',
        label: 'Manufacturing & Heavy Engineering',
        path: '/industries',
        badge: 'Industrial Solutions',
        heading: 'Manufacturing & Plant Floor IT Infrastructure',
        slaGrade: '24/7 Continuous Plant Floor Uptime',
        metrics: ['🏭 Industrial Fiber LAN', '📦 Multi-Plant ERP Sync', '⚡ Surge-Proof Server Racks', '⏱️ Zero Production Stoppage'],
        desc1: 'Industrial plants require continuous shop-floor network reliability, ruggedized edge computing hardware, and seamless Tally/ERP synchronization between factories and corporate headquarters.',
        desc2: 'NISPL deploys redundant industrial fiber backbones, surge-protected server racks, and automated supply-chain inventory synchronization to keep production lines operating with zero unexpected interruptions.',
        capabilities: [
          { title: 'Harsh Environment Cabling', desc: 'Armored industrial fiber optic backbones resistant to dust, heat, and electromagnetic noise.' },
          { title: 'Centralized Bill of Materials (BOM)', desc: 'Multi-unit production sync ensuring raw material stock matches head-office accounts.' },
          { title: 'Weighbridge & Barcode Sync', desc: 'Automated hardware integration capturing truck weighment and lot numbers directly.' },
          { title: 'Redundant Power Backup', desc: 'Dual-conversion Online UPS power conditioning for critical plant server racks.' }
        ],
        techSpecs: 'Scope: Foundry, Fabrication, Textile, Steel, Chemical & Packaging Facilities'
      },
      {
        id: 'ind-retail-fmcg',
        label: 'Retail, FMCG & Wholesale Distribution',
        path: '/industries',
        badge: 'High-Volume Commerce',
        heading: 'Retail Chains & Multi-Warehouse Distribution',
        slaGrade: 'Real-Time Inventory Synchronization',
        metrics: ['🛒 POS Terminal Sync', '⚡ Instant E-Way Bills', '📊 Multi-Outlet Stock View', '🔍 Barcode Dispatch Speed'],
        desc1: 'Speed, stock accuracy, and statutory compliance are paramount for multi-store retail brands and high-volume distributors. We provide synchronized multi-branch Tally setups, automated e-Way bill creation, and cloud-synced POS systems.',
        desc2: 'Empowers logistics and store managers with instant visibility across regional warehouses, automated low-stock re-order thresholds, and integrated barcode scanner networks.',
        capabilities: [
          { title: 'Instant Branch Consolidations', desc: 'Consolidated balance sheets across 100+ stores with instant inter-branch stock transfers.' },
          { title: 'Rapid POS Checkout', desc: 'Sub-second thermal receipt generation and integrated QR code payment reconciliation.' },
          { title: 'Automated Purchase Indents', desc: 'Alerts store managers when inventory hits minimum safety thresholds.' },
          { title: 'High-Density Store Wi-Fi', desc: 'Reliable handheld scanner wireless roaming across sprawling fulfillment warehouses.' }
        ],
        techSpecs: 'Scale: 10 to 500+ Outlets • Cloud Sync Engine: Multi-Master Database Replication'
      },
      {
        id: 'ind-health',
        label: 'Healthcare, Hospitals & Pharmaceuticals',
        path: '/industries',
        badge: 'Critical Care Infrastructure',
        heading: 'Healthcare & Pharmaceutical IT Systems',
        slaGrade: 'HIPAA & NABH Infrastructure Alignment',
        metrics: ['🏥 99.99% Hospital Uptime', '💊 Drug Expiry Alerts', '🔒 Encrypted Medical Records', '⏱️ 24/7 ICU Power Continuity'],
        desc1: 'Hospitals, diagnostic clinics, and pharmaceutical distributors require continuous system availability, patient data confidentiality, and strict batch-expiry tracking compliance.',
        desc2: 'We architect high-availability server clusters, doctor-patient tele-workstations, biometric ward access, and redundant uninterruptible power backups to support continuous care delivery.',
        capabilities: [
          { title: 'Batch & Expiry Governance', desc: 'Strict first-expiry-first-out (FEFO) automated picking logic preventing expired sales.' },
          { title: 'Patient Data Vaults', desc: 'Encrypted storage arrays ensuring complete diagnostic and prescription record privacy.' },
          { title: 'Diagnostic Equipment LAN', desc: 'Isolated medical VLAN networks for MRI, CT scanners, and pathology testing analyzers.' },
          { title: 'Zero-Downtime Clean Power', desc: 'Medical-grade isolation transformer UPS setups defending life-support computing.' }
        ],
        techSpecs: 'Compliance: Drug Inspector Statutory Audit Ready • NABH Infrastructure Compliant'
      },
      {
        id: 'ind-public',
        label: 'Government, Public Sector & Tea Estates',
        path: '/industries',
        badge: 'Public Sector Excellence',
        heading: 'Government Enterprises & Tea Plantations',
        slaGrade: 'High-Security Institutional Deployment',
        metrics: ['🏛️ WB SFDC & Tea Board', '☕ Remote Plantation Links', '🔒 Government Intranet Sync', '🛡️ Audit-Ready Systems'],
        desc1: 'With prestigious public sector engagements including West Bengal SFDC and the Tea Board of India, NISPL has proven engineering competence in managing large institutional systems and remote plantation connectivity.',
        desc2: 'From solar-assisted plantation wireless links across vast tea gardens to secured state intranet backbones, our solutions withstand demanding operating environments and strict audit standards.',
        capabilities: [
          { title: 'Long-Range Wireless Bridges', desc: 'Point-to-point wireless links connecting remote tea estate factory sheds across hills.' },
          { title: 'Green Leaf Weighment Sync', desc: 'Real-time plucking data transmission from garden weigh-scales into central accounts.' },
          { title: 'Government Audit Trails', desc: 'Immutable activity logs ensuring 100% compliance with CAG and state scrutiny.' },
          { title: 'Ruggedized Terminal Hardware', desc: 'High-humidity and dust-sealed computing appliances for outdoor field weighment.' }
        ],
        techSpecs: 'Reach: Darjeeling, Dooars, Assam Tea Gardens & State Secretariats'
      },
      {
        id: 'ind-ca-fin',
        label: 'Chartered Accountants & Financial Services',
        path: '/industries',
        badge: 'Financial Confidentiality',
        heading: 'CA Firms, Audit Practices & Corporate Finance',
        slaGrade: 'Bank-Grade Isolated Client Instances',
        metrics: ['📊 Peak Audit Concurrency', '🔒 Client-Wise Folders', '⚡ 1-Click GST & Tax Filing', '💾 Zero Data Corruption'],
        desc1: 'Chartered accountants and financial consultants handle sensitive client audit books and require blazing-fast concurrent multi-user Tally performance during peak tax audit deadlines.',
        desc2: 'Our dedicated Tally on Cloud instances provide isolated bank-grade data security, client-wise folder access permissions, automated audit trails, and instant GST return filing capabilities.',
        capabilities: [
          { title: 'Client Folder Sandboxing', desc: 'Strict access controls so junior article clerks only access authorized company books.' },
          { title: 'Tax Deadline High Performance', desc: 'Burst compute capacity during September and March tax filing rush without slow-downs.' },
          { title: 'Remote Client Audits', desc: 'CA partners can review client books remotely without requiring physical visit or pendrives.' },
          { title: 'Automated Audit History', desc: 'Trace every voucher edit, deletion, or backdated voucher entry with detailed user logs.' }
        ],
        techSpecs: 'Platform: Dedicated Windows Server 2022 • 256-Bit TLS VPN Gateway'
      }
    ]
  },
  services: {
    id: 'services',
    label: 'Services',
    title: 'Services',
    image: megaServicesImg,
    imageTag: '24/7 Managed NOC & Systems Operations',
    overview: 'From 24/7 proactive Network Operations Center (NOC) monitoring to SLA-backed hardware AMC and cloud migrations, NISPL delivers end-to-end IT lifecycle management for modern enterprises.',
    featurePills: ['24/7 NOC Monitoring', 'IT AMC Hardware', 'Server & LAN Racks', 'AWS & Azure Cloud', 'Zero-Trust Cyber'],
    cards: [
      { id: 'sv1', label: 'Managed IT', sub: '24/7 NOC Monitoring', badge: 'Proactive SLA' },
      { id: 'sv2', label: 'IT AMC Support', sub: 'Comprehensive Hardware', badge: '2-4 Hr Response' },
      { id: 'sv3', label: 'Server & LAN', sub: 'Structured Cabling', badge: 'High-Throughput' },
      { id: 'sv4', label: 'Cloud Migration', sub: 'Zero Downtime', badge: 'AWS & Azure' }
    ],
    items: [
      {
        id: 'srv-managed-noc',
        label: 'Managed IT Services',
        path: '/services',
        badge: '24/7 Operations Hub',
        heading: 'Managed IT Services & Proactive NOC',
        slaGrade: '24/7 SLA Backed • Guaranteed < 15 Min Triage',
        metrics: ['⚡ 24/7 Live Monitoring', '⏱️ < 15 Min NOC Triage', '📊 Monthly Health Audits', '🛡️ Proactive Patch Management'],
        desc1: 'Offload day-to-day IT complexities to our certified Network Operations Center (NOC). We monitor your servers, firewalls, workstations, and network switches around the clock to detect and resolve anomalies before they impact operations.',
        desc2: 'Includes proactive patch governance, performance optimization, antivirus definitions updates, and comprehensive monthly IT health audit reports with guaranteed SLA response times.',
        capabilities: [
          { title: 'Real-Time Telemetry Gauges', desc: 'Continuous CPU load, memory utilization, disk IOPS, and network bandwidth tracking.' },
          { title: 'Automated Threat Remediation', desc: 'Instant isolation of compromised endpoints before lateral infection spreads.' },
          { title: 'Scheduled Preventive Audits', desc: 'Thermal scans, dust cleaning, and UPS battery load testing every quarter.' },
          { title: 'Monthly Executive Reports', desc: 'Uptime percentages, incident summaries, and hardware lifecycle forecasts for CTOs.' }
        ],
        techSpecs: 'Operations: Central NOC in Kolkata • Monitoring Protocols: SNMPv3, WMI, Cloud Telemetry'
      },
      {
        id: 'srv-it-amc',
        label: 'IT AMC & Support',
        path: '/services',
        badge: 'Hardware Lifecycle',
        heading: 'Comprehensive Corporate IT AMC Contracts',
        slaGrade: 'Guaranteed 2 to 4 Hour On-Site Technician SLA',
        metrics: ['⏱️ 2-4 Hr Response SLA', '🔄 Standby Hardware Stock', '💻 Laptops, PCs & Printers', '🔋 Online UPS Battery AMC'],
        desc1: 'Safeguard your corporate IT assets with our Annual Maintenance Contracts. We cover server hardware, desktop workstation fleets, laptops, network routers, switches, printers, and UPS power units.',
        desc2: 'Enjoy guaranteed technician response times within 2 to 4 hours, standby replacement hardware, and scheduled preventive maintenance visits by experienced field engineers.',
        capabilities: [
          { title: 'Non-Comprehensive & Comprehensive', desc: 'Flexible contract tiers covering labor-only or full component replacements.' },
          { title: 'Buffer Spare Inventory', desc: 'We hold identical motherboards, RAM, and power supplies in stock for zero lead time.' },
          { title: 'Resident Engineer Placements', desc: 'Dedicated full-time certified IT engineers deployed on-site for larger corporate clients.' },
          { title: 'Annual Systems Health Certification', desc: 'Official compliance certification of IT electrical earthing and asset lifecycle.' }
        ],
        techSpecs: 'Coverage: All major brands — Dell, HP, Lenovo, Cisco, APC, Microtek, Epson, Canon'
      },
      {
        id: 'srv-lan-server',
        label: 'Server & Network Management',
        path: '/services',
        badge: 'Enterprise Networking',
        heading: 'High-Performance Switching & Server Racks',
        slaGrade: 'Fluke Certified Structured Cabling',
        metrics: ['🌐 10G Fiber Backbone', '🎛️ Cisco / Aruba Switching', '🛡️ VLAN Segmentation', '📶 Wi-Fi 6 Zero Deadzones'],
        desc1: 'We design, deploy, and manage enterprise networks with structured Cat6/Fiber cabling, managed Gigabit switches, VLAN segmentation, and enterprise Wi-Fi 6 access points.',
        desc2: 'Our certified engineers configure and administer Windows Server, Linux, Active Directory domain controllers, DHCP, DNS, and network-attached storage (NAS) backup arrays.',
        capabilities: [
          { title: 'Structured Server Racks', desc: 'Cable-managed 42U/24U server racks with labeled patch panels and thermal exhaust airflow.' },
          { title: 'Zero-Deadzone Mesh Wi-Fi', desc: 'Centralized cloud-managed wireless controllers with seamless roaming across corporate floors.' },
          { title: 'Active Directory Governance', desc: 'Centralized group policies, user login permissions, and automated mapped network drives.' },
          { title: 'Network Fault Tolerance', desc: 'Spanning Tree Protocol (STP) and link aggregation preventing broadcast storms and outages.' }
        ],
        techSpecs: 'Standards: TIA/EIA 568-C • Testing: Fluke DTX Cable Certifier • Warranty: 15-Year Cabling Warranty'
      },
      {
        id: 'srv-cloud-mig',
        label: 'Cloud Migration & Management',
        path: '/services',
        badge: 'Zero Downtime',
        heading: 'Cloud Migration & Hybrid Infrastructure',
        slaGrade: 'Zero-Downtime Lift & Shift Guarantee',
        metrics: ['☁️ AWS & Azure Certified', '⚡ Zero Production Loss', '💰 Cloud Cost Optimization', '🔄 Hybrid Cloud Sync'],
        desc1: 'Transition legacy on-premises databases, ERP systems, and file servers into modern, resilient cloud environments without disrupting ongoing day-to-day business operations.',
        desc2: 'We manage cloud resource sizing, cost optimization, automated snapshot backups, and high-availability failover architectures across Tier-4 data centers.',
        capabilities: [
          { title: 'Pre-Migration Readiness Audit', desc: 'Detailed assessment of database dependencies, bandwidth throughput, and cloud sizing.' },
          { title: 'Parallel Cutover Protocols', desc: 'Live data replication allowing weekend cutovers with zero weekday downtime.' },
          { title: 'Reserved Instance Savings', desc: 'Optimize AWS/Azure monthly commitments reducing cloud infrastructure bills up to 40%.' },
          { title: 'Hybrid Cloud Direct Connect', desc: 'Encrypted site-to-site IPsec tunnels bridging on-premise offices with cloud workloads.' }
        ],
        techSpecs: 'Cloud Providers: AWS, Microsoft Azure, Google Cloud Platform, Indian Tier-4 Private Clouds'
      },
      {
        id: 'srv-tally-supp',
        label: 'Tally Implementation & Support',
        path: '/services',
        badge: 'Certified 3-Star',
        heading: 'Tally Implementation, Customization & Support',
        slaGrade: 'Official Certified Tally 3-Star Partner',
        metrics: ['★ 3-Star Partner Level', '🧾 Custom Invoice Layouts', '📱 WhatsApp Dispatch Tool', '🔍 Multi-Company Sync'],
        desc1: 'Unlock the full capabilities of TallyPrime with custom invoice formats, statutory module configurations, WhatsApp automated dispatch, and barcode scanner integration.',
        desc2: 'Our certified Tally specialists provide end-user staff training, chart of accounts setup, multi-company data synchronization, and rapid troubleshooting.',
        capabilities: [
          { title: 'Custom TDL Development', desc: 'Tailored reports, specialized approval workflows, and industry-specific voucher layouts.' },
          { title: 'WhatsApp PDF Invoicing', desc: '1-click automated delivery of invoices, outstanding ledgers, and payment receipts.' },
          { title: 'Banking Reconciliations', desc: 'Auto bank feed synchronization with ICICI, HDFC, SBI, and Axis Bank.' },
          { title: 'Data Audit & Repair', desc: 'Fix corrupt company data files and verify statutory tax balances before GST filing.' }
        ],
        techSpecs: 'Platform: TallyPrime Release 4.x / 5.x • TDL Architecture • REST API Integrations'
      },
      {
        id: 'srv-cyber-mgmt',
        label: 'Cyber Security Management',
        path: '/services',
        badge: 'Zero-Trust Security',
        heading: 'Enterprise Cybersecurity & Threat Defense',
        slaGrade: 'Zero-Trust Threat Defense & SOC Monitoring',
        metrics: ['🛡️ Next-Gen Firewall (NGFW)', '🦠 Endpoint EDR Defense', '🔒 Ransomware Decoy Traps', '🚫 Data Leak Prevention'],
        desc1: 'Defend your corporate perimeter with next-generation firewalls, real-time intrusion prevention, cloud endpoint detection and response (EDR), and employee phishing awareness training.',
        desc2: 'We conduct periodic security vulnerability assessments, audit open network ports, and enforce strict zero-trust data access policies across all endpoints.',
        capabilities: [
          { title: 'Managed EDR Agents', desc: 'AI-driven process behavior analysis halting ransomware encryption in milliseconds.' },
          { title: 'Vulnerability Port Scans', desc: 'Quarterly vulnerability assessments identifying open router ports and outdated software.' },
          { title: 'Phishing Awareness Drill', desc: 'Simulated phishing attacks training staff to recognize fraudulent invoice emails.' },
          { title: 'USB & Removable Media Lock', desc: 'Block unauthorised pendrive insertions preventing internal corporate data theft.' }
        ],
        techSpecs: 'Alliances: Sophos Intercept X, Fortinet Security Fabric, Seqrite Endpoint Security'
      },
      {
        id: 'srv-cctv-wifi',
        label: 'CCTV & Wi-Fi Support',
        path: '/services',
        badge: 'Surveillance & Wireless',
        heading: 'Smart IP Surveillance & High-Density Wi-Fi',
        slaGrade: 'NDAA High-Security Enterprise Surveillance',
        metrics: ['📹 4K IP Dome & Bullet', '📶 Wi-Fi 6 Seamless Roam', '📱 Mobile Live Streaming', '💾 High-Retention NVR'],
        desc1: 'Turnkey installation and maintenance of IP camera surveillance grids, remote mobile streaming, long-retention NVR storage, and high-density office Wi-Fi arrays.',
        desc2: 'Eliminate office wireless dead zones with seamless roaming Wi-Fi access points and guest portal bandwidth controls for modern collaborative work environments.',
        capabilities: [
          { title: 'Infrared Night Vision', desc: 'High-power SMART IR LEDs delivering crisp facial identification in complete darkness.' },
          { title: 'Bandwidth QoS Controls', desc: 'Prioritize executive video calls over guest Wi-Fi browsing during peak office hours.' },
          { title: 'Motion Area Triggers', desc: 'Instant push notifications to security managers when movement is detected after hours.' },
          { title: 'Structured Fiber Linking', desc: 'Interconnect remote gatehouse cameras with main administration building NVR racks.' }
        ],
        techSpecs: 'Hardware: Hikvision, CP Plus, Ubiquiti UniFi, TP-Link Omada Enterprise'
      },
      {
        id: 'srv-remote-supp',
        label: 'On-site / Remote IT Support',
        path: '/services',
        badge: 'Rapid Helpdesk',
        heading: 'Rapid Remote Helpdesk & SLA Field Dispatch',
        slaGrade: 'Instant Screen Share • < 20 Min Fix Average',
        metrics: ['⚡ Instant Remote Connect', '⏱️ < 20 Min Fix Average', '🎫 Web Ticketing Portal', '🚗 Rapid Technician Van'],
        desc1: 'Resolve desktop crashes, software errors, and connectivity glitches instantly via our secure remote desktop helpdesk or request immediate on-site engineer dispatch.',
        desc2: 'Backed by ticketing portal tracking, clear escalation matrix, and strict turnaround SLAs to keep your staff productive at all times.',
        capabilities: [
          { title: 'Secure Remote Control', desc: 'Encrypted screen-sharing tools requiring end-user acceptance for complete privacy.' },
          { title: 'Priority Dispatch Van', desc: 'Field engineers equipped with toolkits, diagnostic testers, and replacement cables.' },
          { title: 'Clear Escalation Matrix', desc: 'Level 1 to Level 3 escalation paths with direct access to senior infrastructure architects.' },
          { title: 'User Ticket Feedback', desc: 'Transparent client rating system ensuring continuous technician accountability.' }
        ],
        techSpecs: 'Tools: AnyDesk Enterprise, TeamViewer Tensor, NISPL Cloud Helpdesk Ticketing'
      }
    ]
  },
  solutions: {
    id: 'solutions',
    label: 'Solutions',
    title: 'Solutions',
    image: megaSolutionsImg,
    imageTag: 'Turnkey Enterprise Digital Ecosystem',
    overview: 'Engineered solutions designed to solve critical business bottlenecks, guarantee regulatory compliance, and provide resilient business continuity for modern corporate enterprises.',
    featurePills: ['Tally ERP Solutions', 'Tally Cloud Anywhere', 'Dedicated VPS', 'Disaster Recovery', 'M365 Licensing'],
    cards: [
      { id: 'sl1', label: 'TallyPrime ERP', sub: 'GST Compliance', badge: 'Connected Banking' },
      { id: 'sl2', label: 'Tally on Cloud', sub: 'Anywhere Access', badge: 'SSL 256-Bit' },
      { id: 'sl3', label: 'Microsoft 365', sub: 'Cloud Workplace', badge: 'Certified Partner' },
      { id: 'sl4', label: 'Disaster Recovery', sub: 'Automated 3-2-1', badge: 'Encrypted Backups' }
    ],
    items: [
      {
        id: 'sol-tally-prime',
        label: 'TallyPrime & ERP Solutions',
        path: '/solutions',
        badge: 'Statutory Compliance',
        heading: 'TallyPrime & Integrated Business Automation',
        slaGrade: 'Connected Banking & GST Compliance Certified',
        metrics: ['⚡ 1-Click E-Invoice QR', '🧾 Auto GSTR-1, 3B, 9', '🏦 Bank Auto-Reconcile', '📱 WhatsApp Dispatch'],
        desc1: 'Automate tax invoicing, GST return preparations (GSTR-1, 3B, 9), real-time e-Way bill creation, e-Invoicing QR codes, and direct bank reconciliations in seconds.',
        desc2: 'Provides C-suite dashboards, cash-flow forecasts, multi-branch consolidated ledgers, and inventory re-order alerts to accelerate strategic business decisions.',
        capabilities: [
          { title: 'Connected Banking Module', desc: 'Direct electronic bank reconciliations and automated ledger payment vouchers.' },
          { title: 'Audit Trail (Edit Log) Ready', desc: 'MCA statutory compliance with immutable tamper-evident audit log recording.' },
          { title: 'Barcode Inventory Picking', desc: 'Integrated barcode printing on invoices and handheld scanner verification.' },
          { title: 'Multi-Location Ledgers', desc: 'Synchronize accounts across factory plants, warehouses, and sales branches.' }
        ],
        techSpecs: 'Tally Solutions Certified • GST Suvidha Provider (GSP) API Integrations'
      },
      {
        id: 'sol-cloud-tally',
        label: 'Tally on Cloud Solutions',
        path: '/solutions',
        badge: 'Anywhere Access',
        heading: 'Tally on Cloud — Secure Anywhere Accounting',
        slaGrade: 'Tier-4 Hosted • SSL 256-Bit Bank Encryption',
        metrics: ['🔒 256-Bit SSL Gateway', '⚡ 99.9% Uptime Guarantee', '🔄 Hourly Backup Snapshots', '📱 Multi-Device Ready'],
        desc1: 'Experience lightning-fast Tally operations with zero dependency on expensive in-house physical servers. Works seamlessly over 4G/5G, broadband, and mobile hotspots.',
        desc2: 'Features dedicated isolated compute resources, automated multi-version daily backups, print-from-anywhere support, and SSL 256-bit encryption.',
        capabilities: [
          { title: 'Dedicated Isolated VM', desc: 'Dedicated memory and storage allocations with zero interference from other users.' },
          { title: 'Local Printer Redirection', desc: 'Print directly to your desk receipt or laser printer without driver conflicts.' },
          { title: 'Multi-Factor Access (2FA)', desc: 'SMS OTP or authenticator app verification preventing unauthorized ledger access.' },
          { title: 'Offsite Encrypted Vault', desc: 'Automatic hourly backup copies synced to secure offsite secondary datacenters.' }
        ],
        techSpecs: 'Hosting: Tier-4 Datacenter • Dedicated NVMe Arrays • 1 Gbps Unmetered Network'
      },
      {
        id: 'sol-cloud-vps',
        label: 'Cloud & Hosting Solutions',
        path: '/solutions',
        badge: 'Tier-4 Datacenter',
        heading: 'Enterprise Virtual Private Servers & Hosting',
        slaGrade: '99.95% Network Availability SLA',
        metrics: ['⚡ High IOPS Storage', '🛡️ Integrated Anti-DDoS', '📈 Dynamic Scaling', '⏱️ 99.95% Network SLA'],
        desc1: 'Deploy high-performance Windows and Linux virtual servers, enterprise mail servers, and high-capacity database clusters with low latency and 99.95% uptime guarantees.',
        desc2: 'Includes dedicated IP addresses, automated daily backup snapshots, DDoS mitigation, and fully managed OS patching.',
        capabilities: [
          { title: 'High-Throughput IOPS', desc: 'Enterprise NVMe storage arrays engineered for heavy database transactions.' },
          { title: 'Carrier-Neutral Datacenter', desc: 'Direct connectivity to major telecom backbones guaranteeing minimal latency.' },
          { title: 'Proactive Health Alerts', desc: 'Automated monitoring alerting our engineers before resource exhaustion occurs.' },
          { title: 'Root / Administrator Access', desc: 'Full administrative control with secure web console and SSH/RDP access.' }
        ],
        techSpecs: 'Virtualization: KVM / Hyper-V • Datacenter: Tier-4 Certified Facility in India'
      },
      {
        id: 'sol-cyber-sec',
        label: 'Cyber Security Solutions',
        path: '/solutions',
        badge: 'Zero-Trust Defense',
        heading: 'Zero-Trust Threat Defense & Data Protection',
        slaGrade: 'Multi-Layered Ransomware & Perimeter Defense',
        metrics: ['🛡️ UTM Hardware Firewalls', '🚫 Anti-Ransomware Decoys', '🔒 Encrypted Site VPNs', '📊 ISO 27001 Alignment'],
        desc1: 'Protect corporate data from modern extortion, phishing campaigns, and malware attacks with multi-layered endpoint protection, UTM hardware firewalls, and encrypted VPN tunnels.',
        desc2: 'Ensures strict data loss prevention (DLP), USB port lockouts, and regulatory compliance for financial and healthcare standards.',
        capabilities: [
          { title: 'Zero-Day Behavioral Analysis', desc: 'Halt malicious executable payloads before virus signatures are even published.' },
          { title: 'Encrypted Branch Tunnels', desc: 'Link head offices and branch warehouses over secure IPsec 256-bit VPNs.' },
          { title: 'Data Loss Prevention (DLP)', desc: 'Detect and block unauthorized credit card or confidential PAN/GST exports.' },
          { title: 'Comprehensive Posture Audit', desc: 'Identify configuration loopholes and weak passwords across employee accounts.' }
        ],
        techSpecs: 'Framework: Zero-Trust Network Access (ZTNA) • UTM Firewall Appliances'
      },
      {
        id: 'sol-m365-lic',
        label: 'Microsoft 365 & Licensing Solutions',
        path: '/solutions',
        badge: 'Volume Licensing',
        heading: 'Authorized Microsoft Cloud & OS Licensing',
        slaGrade: 'Microsoft Authorized Direct Cloud Solution Provider',
        metrics: ['☁️ Microsoft Teams Hub', '📧 Exchange Business Email', '🛡️ Entra ID Identity Guard', '📱 Intune Mobile Defense'],
        desc1: 'Streamline corporate productivity with genuine Microsoft licenses for Outlook, Teams, Word, Excel, SharePoint, and Entra ID cloud identity management.',
        desc2: 'We manage tenant migration, legacy PST email imports, user provisioning, and multi-factor authentication (MFA) enforcement.',
        capabilities: [
          { title: 'Authorized Partner Volume Tiers', desc: 'Competitive corporate pricing on Annual Commitments and monthly flexibility.' },
          { title: 'Centralized User Provisioning', desc: 'Instant onboarding and de-provisioning of employee accounts with 1 click.' },
          { title: 'Cross-Device Office Apps', desc: 'Install full desktop Office apps on up to 5 PCs/Macs and 5 mobile devices per user.' },
          { title: 'Cloud Intranet Portals', desc: 'Secure company-wide file sharing with version history and recycle bin protection.' }
        ],
        techSpecs: 'Tiers: M365 Business Basic, Standard, Premium, Apps for Business, Enterprise E3'
      },
      {
        id: 'sol-bus-portal',
        label: 'Business Management Portal Solutions',
        path: '/solutions',
        badge: 'Custom Portals',
        heading: 'Centralized Helpdesks & Client Portals',
        slaGrade: 'Custom Built Workflows & SLA Analytics',
        metrics: ['🎫 Ticketing Helpdesks', '👥 Client Self-Service', '📊 SLA Analytics Dashboard', '📱 Mobile Friendly UI'],
        desc1: 'Deploy custom ticketing helpdesks, asset tracking databases, and customer self-service portals tailored to your operational workflows.',
        desc2: 'Empower department managers with real-time performance analytics, SLA compliance monitoring, and automated customer notifications.',
        capabilities: [
          { title: 'Custom Ticket Categorization', desc: 'Route IT and customer tickets automatically to designated engineering teams.' },
          { title: 'SLA Breach Alarms', desc: 'Escalate pending customer requests before response deadlines elapse.' },
          { title: 'Client Knowledge Base', desc: 'Reduce inbound calls with searchable FAQs and self-help technical guides.' },
          { title: 'Role-Based Access Control', desc: 'Granular permissions ensuring staff only view their assigned tasks and tickets.' }
        ],
        techSpecs: 'Architecture: Cloud-Native Microservices • Responsive PWA • REST Webhooks'
      },
      {
        id: 'sol-it-infra',
        label: 'IT Infrastructure Solutions',
        path: '/solutions',
        badge: 'Datacenter Racks',
        heading: 'Rack Servers, SAN Storage & Power Continuity',
        slaGrade: 'Enterprise Datacenter Tier Architecture',
        metrics: ['🖥️ Dell / HPE Rack Servers', '💾 High-Throughput SAN Storage', '🔋 Online Smart UPS Backup', '🎛️ 42U Server Rack Enclosures'],
        desc1: 'Turnkey server room and data center setup including Dell/HPE rack servers, high-capacity NAS/SAN storage arrays, structured cabling, and smart UPS power backups.',
        desc2: 'Built with redundancy at every layer to ensure zero downtime during power outages or hardware faults.',
        capabilities: [
          { title: 'Dual-Power Server Blades', desc: 'Redundant hot-swappable power supplies connected to isolated UPS feeds.' },
          { title: 'High-Speed SAN Fiber Fabric', desc: 'Massive throughput for concurrent ERP and database virtualization.' },
          { title: 'Precision Cooling & Airflow', desc: 'Cold-aisle containment and temperature sensors preventing heat throttling.' },
          { title: 'Automated Generator Handover', desc: 'Zero-interruption power transfer during city electricity grid failures.' }
        ],
        techSpecs: 'Hardware: Dell PowerEdge, HPE ProLiant, Synology Enterprise NAS, APC Symmetra'
      },
      {
        id: 'sol-backup-dr',
        label: 'Backup & Disaster Recovery Solutions',
        path: '/solutions',
        badge: 'Business Continuity',
        heading: 'Automated Encrypted 3-2-1 Offsite Backups',
        slaGrade: 'RTO < 30 Mins • RPO < 15 Mins Disaster Recovery',
        metrics: ['🔄 Automated Hourly Backups', '🔒 Encrypted 3-2-1 Storage', '⏱️ Rapid Virtualization', '🛡️ Air-Gapped Ransomware Safe'],
        desc1: 'Never lose critical enterprise data to ransomware, disk failure, or human error. Our automated backup systems replicate your databases and file servers offsite every hour.',
        desc2: 'Features rapid one-click disaster recovery virtualization to resume operations within minutes of an incident.',
        capabilities: [
          { title: '3-2-1 Backup Rule', desc: '3 copies of data, across 2 different media types, with 1 copy stored offsite.' },
          { title: 'Air-Gapped Immutable Snapshots', desc: 'Backup copies that ransomware code cannot delete, encrypt, or modify.' },
          { title: 'Instant Cloud Spin-Up', desc: 'Boot dead server backups as live virtual machines in the cloud in under 30 minutes.' },
          { title: 'Automated Recovery Drills', desc: 'Scheduled quarterly mock disaster recovery drills proving backup integrity.' }
        ],
        techSpecs: 'Protocols: AES 256-Bit Encryption • Block-Level Incremental Sync • WAN Acceleration'
      }
    ]
  },
  
};

export { NAV_ITEMS, MEGA_MENU_CONFIG };
