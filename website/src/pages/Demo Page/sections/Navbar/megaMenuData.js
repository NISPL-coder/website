import imgDatacenter from '../../../../assets/bg_digital_datacenter.jpg';
import imgMicrosoft from '../../../../assets/bg_digital_microsoft.jpg';
import imgInfra from '../../../../assets/bg_digital_infra.jpg';
import imgOfficeIT from '../../../../assets/bg_digital_office_it.jpg';
import imgFinancial from '../../../../assets/bg_digital_financial.jpg';
import imgEngineers from '../../../../assets/office_engineers_collaborating.jpg';
import imgHandshake from '../../../../assets/corporate_team_handshake.jpg';
import imgCelebration from '../../../../assets/client_team_celebration.jpg';

export const NAV_ITEMS = [
  { id: 'about', label: 'About Us', path: '/about' },
  { id: 'products', label: 'Products', path: '/products' },
  { id: 'industries', label: 'Industries', path: '/industries' },
  { id: 'services', label: 'Services', path: '/services' },
  { id: 'solutions', label: 'Solutions', path: '/solutions' },
  { id: 'career', label: 'Career', path: '/career' }
];

export const MEGA_MENU_CONFIG = {
  // =========================================================================
  // PRODUCTS MEGA MENU (Nomad Style 4 Columns)
  // =========================================================================
  products: {
    id: 'products',
    label: 'Products',
    title: 'Enterprise Products',
    columns: [
      {
        id: 'col-prod-tally',
        title: 'Tally & Cloud ERP',
        image: imgDatacenter,
        path: '/solutions',
        links: [
          { label: 'TallyPrime on Cloud', path: '/solutions', badge: 'HOT' },
          { label: 'Tally on AWS Cloud', path: '/solutions' },
          { label: 'Multi-Branch Sync', path: '/solutions', badge: 'BEST SELLER' },
          { label: 'TallyPrime Gold (Multi-User)', path: '/solutions' },
          { label: 'TallyPrime Silver (Single-User)', path: '/solutions' },
          { label: 'Hourly Automated Backups', path: '/solutions' },
          { label: 'Connected GST E-Invoicing', path: '/solutions' }
        ]
      },
      {
        id: 'col-prod-m365',
        title: 'Microsoft 365 Suites',
        image: imgMicrosoft,
        path: '/solutions',
        links: [
          { label: 'Microsoft 365 Business Basic', path: '/solutions' },
          { label: 'Microsoft 365 Business Standard', path: '/solutions', badge: 'BEST SELLER' },
          { label: 'Microsoft 365 Business Premium', path: '/solutions', badge: 'HOT' },
          { label: 'Exchange Online 50GB Email', path: '/solutions' },
          { label: 'Microsoft Teams & SharePoint', path: '/solutions' },
          { label: 'Microsoft Intune MDM Security', path: '/solutions' },
          { label: 'Turnkey Cloud Tenant Migration', path: '/solutions' }
        ]
      },
      {
        id: 'col-prod-vps',
        title: 'Datacenter Cloud VPS',
        image: imgInfra,
        path: '/solutions',
        links: [
          { label: 'High-Speed NVMe VPS', path: '/solutions', badge: 'HOT' },
          { label: 'Dedicated Windows / Linux VM', path: '/solutions' },
          { label: 'Tier-4 Indian Datacenter', path: '/solutions' },
          { label: 'Sub-12ms Network Latency', path: '/solutions' },
          { label: 'Anti-DDoS Shielded IPs', path: '/solutions' },
          { label: '99.95% Network Uptime SLA', path: '/solutions' }
        ]
      },
      {
        id: 'col-prod-security',
        title: 'Security & Biometrics',
        image: imgOfficeIT,
        path: '/services',
        links: [
          { label: 'Hardware UTM Firewalls', path: '/services', badge: 'BEST SELLER' },
          { label: 'Sophos & Fortinet Appliances', path: '/services' },
          { label: 'AI Facial Biometrics Attendance', path: '/services', badge: 'NEW' },
          { label: '4K IP Surveillance Grids', path: '/services' },
          { label: 'Centralized Multi-Site NVR', path: '/services' },
          { label: 'Zero-Trust Remote SSL-VPN', path: '/services' }
        ]
      }
    ],
    items: [
      { id: 'tally-cloud', label: 'TallyPrime on Cloud', path: '/solutions' },
      { id: 'm365-suite', label: 'Microsoft 365 Business Suites', path: '/solutions' },
      { id: 'datacenter-vps', label: 'Enterprise Datacenter Cloud VPS', path: '/solutions' },
      { id: 'utm-defense', label: 'Cybersecurity & UTM Firewalls', path: '/services' },
      { id: 'smart-biometrics', label: 'Smart Biometrics & CCTV Systems', path: '/services' }
    ]
  },

  // =========================================================================
  // INDUSTRIES MEGA MENU (Nomad Style 4 Columns)
  // =========================================================================
  industries: {
    id: 'industries',
    label: 'Industries',
    title: 'Industry Solutions',
    columns: [
      {
        id: 'col-ind-mfg',
        title: 'Manufacturing & Plants',
        image: imgInfra,
        path: '/industries',
        links: [
          { label: 'Plant Floor Fiber Networks', path: '/industries', badge: 'HOT' },
          { label: 'Multi-Plant ERP Sync', path: '/industries', badge: 'BEST SELLER' },
          { label: 'Weighbridge & Barcode Sync', path: '/industries' },
          { label: 'Surge-Proof Server Racks', path: '/industries' },
          { label: 'Heavy Engineering Systems', path: '/industries' },
          { label: 'Zero Production Stoppage IT', path: '/industries' }
        ]
      },
      {
        id: 'col-ind-retail',
        title: 'Retail & FMCG Chains',
        image: imgEngineers,
        path: '/industries',
        links: [
          { label: 'Multi-Store POS Terminal Sync', path: '/industries', badge: 'BEST SELLER' },
          { label: 'Instant E-Way Bills & Invoices', path: '/industries', badge: 'HOT' },
          { label: 'Multi-Warehouse Stock Visibility', path: '/industries' },
          { label: 'High-Density Handheld Wi-Fi', path: '/industries' },
          { label: 'Automated Re-order Alerts', path: '/industries' },
          { label: 'Consolidated Branch Ledgers', path: '/industries' }
        ]
      },
      {
        id: 'col-ind-health',
        title: 'Healthcare & Pharma',
        image: imgMicrosoft,
        path: '/industries',
        links: [
          { label: '24/7 Hospital IT Infrastructure', path: '/industries', badge: 'HOT' },
          { label: 'Drug Batch & FEFO Expiry Logic', path: '/industries', badge: 'BEST SELLER' },
          { label: 'Encrypted Patient Data Vaults', path: '/industries' },
          { label: 'Medical Diagnostic VLAN Isolation', path: '/industries' },
          { label: 'NABH & HIPAA Compliant Systems', path: '/industries' },
          { label: 'Continuous ICU Power Continuity', path: '/industries' }
        ]
      },
      {
        id: 'col-ind-public',
        title: 'Govt & Financial Firms',
        image: imgFinancial,
        path: '/industries',
        links: [
          { label: 'WB SFDC & Tea Board of India', path: '/industries', badge: 'PROVEN' },
          { label: 'Long-Range Plantation Wireless', path: '/industries' },
          { label: 'CA Firm Client Sandboxing', path: '/industries', badge: 'HOT' },
          { label: 'Peak Tax Audit Concurrency', path: '/industries', badge: 'BEST SELLER' },
          { label: '1-Click GST Return Filing', path: '/industries' },
          { label: 'Immutable CAG Audit Trails', path: '/industries' }
        ]
      }
    ],
    items: [
      { id: 'ind-mfg', label: 'Manufacturing & Heavy Engineering', path: '/industries' },
      { id: 'ind-retail-fmcg', label: 'Retail, FMCG & Wholesale Distribution', path: '/industries' },
      { id: 'ind-health', label: 'Healthcare, Hospitals & Pharmaceuticals', path: '/industries' },
      { id: 'ind-public', label: 'Government, Public Sector & Tea Estates', path: '/industries' },
      { id: 'ind-ca-fin', label: 'Chartered Accountants & Financial Services', path: '/industries' }
    ]
  },

  // =========================================================================
  // SERVICES MEGA MENU (Nomad Style 4 Columns)
  // =========================================================================
  services: {
    id: 'services',
    label: 'Services',
    title: 'Enterprise Services',
    columns: [
      {
        id: 'col-serv-noc',
        title: 'Managed IT & 24/7 NOC',
        image: imgEngineers,
        path: '/services',
        links: [
          { label: '24/7 Proactive NOC Monitoring', path: '/services', badge: 'HOT' },
          { label: 'Sub-15 Min Incident Triage', path: '/services' },
          { label: 'Automated Patch Management', path: '/services' },
          { label: 'Quarterly Systems Health Audits', path: '/services' },
          { label: 'Monthly Executive CTO Reports', path: '/services' },
          { label: 'Dedicated Resident Engineers', path: '/services', badge: 'POPULAR' }
        ]
      },
      {
        id: 'col-serv-amc',
        title: 'Corporate IT AMC Support',
        image: imgOfficeIT,
        path: '/services',
        links: [
          { label: 'Comprehensive Hardware AMC', path: '/services', badge: 'BEST SELLER' },
          { label: '2 to 4 Hr On-Site Response SLA', path: '/services', badge: 'HOT' },
          { label: 'Laptops, Desktops & Printers', path: '/services' },
          { label: 'Online UPS Power Conditioning', path: '/services' },
          { label: 'Buffer Spare Component Stock', path: '/services' },
          { label: 'Multi-Brand Factory Escalation', path: '/services' }
        ]
      },
      {
        id: 'col-serv-lan',
        title: 'Server & Structured LAN',
        image: imgInfra,
        path: '/services',
        links: [
          { label: '10G Fiber Backbone Cabling', path: '/services', badge: 'HOT' },
          { label: 'Cisco & Aruba Managed Switches', path: '/services' },
          { label: 'Zero-Deadzone Wi-Fi 6 Mesh', path: '/services' },
          { label: '42U/24U Server Rack Deployments', path: '/services' },
          { label: 'Active Directory & Domain Policies', path: '/services' },
          { label: '15-Year Cabling Certification', path: '/services' }
        ]
      },
      {
        id: 'col-serv-cloud',
        title: 'Cloud & Cybersecurity',
        image: imgDatacenter,
        path: '/services',
        links: [
          { label: 'Zero-Downtime Cloud Migration', path: '/services', badge: 'NEW' },
          { label: 'Next-Gen Firewall (NGFW) Setup', path: '/services', badge: 'BEST SELLER' },
          { label: 'Endpoint EDR & Anti-Ransomware', path: '/services' },
          { label: 'Tally Custom TDL & WhatsApp Bills', path: '/services' },
          { label: 'NDAA Smart IP CCTV Surveillance', path: '/services' },
          { label: 'Zero-Trust Secure Remote Access', path: '/services' }
        ]
      }
    ],
    items: [
      { id: 'srv-managed-noc', label: 'Managed IT Services & 24/7 NOC', path: '/services' },
      { id: 'srv-it-amc', label: 'IT AMC & Comprehensive Hardware', path: '/services' },
      { id: 'srv-lan-server', label: 'Server & Structured Network Management', path: '/services' },
      { id: 'srv-cloud-mig', label: 'Cloud Migration & Hybrid Infrastructure', path: '/services' },
      { id: 'srv-tally-supp', label: 'Tally Implementation & TDL Customization', path: '/services' },
      { id: 'srv-cyber-mgmt', label: 'Cyber Security & Zero-Trust Defense', path: '/services' }
    ]
  },

  // =========================================================================
  // SOLUTIONS MEGA MENU (Nomad Style 4 Columns)
  // =========================================================================
  solutions: {
    id: 'solutions',
    label: 'Solutions',
    title: 'Technology Solutions',
    columns: [
      {
        id: 'col-sol-cloud',
        title: 'Enterprise Cloud Hosting',
        image: imgDatacenter,
        path: '/solutions',
        links: [
          { label: 'TallyPrime Cloud Access', path: '/solutions', badge: 'HOT' },
          { label: 'Tier-4 Indian Datacenter VPS', path: '/solutions', badge: 'BEST SELLER' },
          { label: 'Dedicated Compute vCPU & RAM', path: '/solutions' },
          { label: 'Hourly Automated Snapshots', path: '/solutions' },
          { label: 'Direct GST & E-Way Portal Sync', path: '/solutions' },
          { label: 'Multi-Device Any-OS Access', path: '/solutions' }
        ]
      },
      {
        id: 'col-sol-workplace',
        title: 'Modern Workplace Suites',
        image: imgMicrosoft,
        path: '/solutions',
        links: [
          { label: 'Microsoft 365 Cloud Licensing', path: '/solutions', badge: 'HOT' },
          { label: 'Turnkey Tenant Mail Migration', path: '/solutions' },
          { label: 'SharePoint Collaborative Portals', path: '/solutions' },
          { label: 'Microsoft Intune Device Security', path: '/solutions', badge: 'BEST SELLER' },
          { label: 'Advanced Phishing Protection', path: '/solutions' },
          { label: 'Microsoft Teams Enterprise Voice', path: '/solutions' }
        ]
      },
      {
        id: 'col-sol-cyber',
        title: 'Cybersecurity & Defense',
        image: imgOfficeIT,
        path: '/services',
        links: [
          { label: 'Hardware UTM Perimeter Shield', path: '/services', badge: 'BEST SELLER' },
          { label: 'Deep Packet Inspection (IPS)', path: '/services' },
          { label: 'Multi-WAN Auto Failover Lines', path: '/services' },
          { label: 'Encrypted Remote SSL-VPN', path: '/services', badge: 'HOT' },
          { label: 'Web Content & Bandwidth Filters', path: '/services' },
          { label: 'Corporate Ransomware EDR', path: '/services' }
        ]
      },
      {
        id: 'col-sol-infra',
        title: 'Workplace Tech & Power',
        image: imgInfra,
        path: '/services',
        links: [
          { label: 'AI Facial Biometrics Attendance', path: '/services', badge: 'NEW' },
          { label: '4K IP Security Camera Networks', path: '/services' },
          { label: 'Industrial Server Rack Hardware', path: '/services' },
          { label: 'Online UPS Power Conditioning', path: '/services' },
          { label: 'Automated Shift Payroll Sync', path: '/services' },
          { label: 'Centralized NVR Video Archives', path: '/services' }
        ]
      }
    ],
    items: [
      { id: 'sol-cloud', label: 'Enterprise Cloud Hosting', path: '/solutions' },
      { id: 'sol-workplace', label: 'Modern Workplace Suites', path: '/solutions' },
      { id: 'sol-cyber', label: 'Cybersecurity & Defense', path: '/services' },
      { id: 'sol-infra', label: 'Workplace Tech & Power', path: '/services' }
    ]
  },

  // =========================================================================
  // ABOUT US MEGA MENU (Nomad Style 2 Columns)
  // =========================================================================
  about: {
    id: 'about',
    label: 'About Us',
    title: 'About Net Infotech System',
    columns: [
      {
        id: 'col-about-profile',
        title: 'Company Overview',
        image: imgHandshake,
        path: '/about',
        links: [
          { label: 'About NISPL Overview', path: '/about', badge: '25+ YEARS' },
          { label: 'Our Mission & Leadership', path: '/about' },
          { label: 'Eastern India Enterprise Reach', path: '/about' },
          { label: '1,000+ Corporate Engagements', path: '/about' },
          { label: 'ISO 9001:2015 Certification', path: '/about' },
          { label: 'Pan-India 24/7 Operations Hub', path: '/about' }
        ]
      },
      {
        id: 'col-about-culture',
        title: 'Work Culture',
        image: imgCelebration,
        path: '/about#work-culture',
        links: [
          { label: 'Inside NISPL: Work Culture', path: '/about#work-culture', badge: 'HOT' },
          { label: 'Workplace Excellence Award', path: '/about#work-culture', badge: 'TALLY' },
          { label: 'Aikyam: One Team Synergy', path: '/about#work-culture' },
          { label: 'Continuous Skill Sprints', path: '/about#work-culture' },
          { label: 'Festive Traditions & Events', path: '/about#work-culture' },
          { label: 'Collaborative Open Floors', path: '/about#work-culture' }
        ]
      }
    ],
    items: [
      { id: 'about-nispl', label: 'Company Overview', path: '/about' },
      { id: 'work-culture', label: 'Work Culture & Life at NISPL', path: '/about#work-culture' }
    ]
  }
};
