/**
 * Enterprise Tally & Cloud Products Catalog Data
 * Certified software licenses, cloud compute tiers, and enterprise add-ons for NISPL
 */

import { calculatePricing } from '../utils/pricingUtils';
import tallyLogo from '../../../assets/partners/tally.png';
import ctrlsLogo from '../../../assets/partners/ctrls.png';
import tallyPrimeImg from '../../../assets/Industries/Tally Prime and Tally on Cloud.webp';
import cloudHostingImg from '../../../assets/Industries/Clous Server & Hosting.webp';
import itInfraImg from '../../../assets/Industries/IT infrastructure Managment.webp';
import managedImg from '../../../assets/Industries/Managed IT services.webp';

/* ─────────────────────────────────────────────────────────────────────────────
   TALLY SOLUTIONS CATALOG
───────────────────────────────────────────────────────────────────────────── */
export const TALLY_CATEGORIES = [
  { id: 'all', label: 'All Tally Products' },
  { id: 'software', label: 'TallyPrime Software' },
  { id: 'tss', label: 'TSS Renewals' },
  { id: 'cloud', label: 'Tally on Cloud' },
  { id: 'addons', label: 'Customization & Add-ons' }
];

export const TALLY_PRODUCTS = [
  {
    id: 'tally-prime-silver',
    category: 'software',
    categoryLabel: 'TallyPrime Software',
    name: 'TallyPrime Silver',
    fullName: 'TallyPrime Release 5.0 — Silver (Single-User Perpetual)',
    shortDesc: 'Official perpetual standalone ERP license for small businesses, retail shops, and standalone workstations.',
    conciseDesc: 'Single-user standalone accounting & tax compliance.',
    image: tallyPrimeImg,
    rating: 4.8,
    reviewsCount: 89,
    licenseType: 'Perpetual License (Lifetime)',
    userType: 'Single PC / Workstation',
    duration: 'Perpetual (Includes 1-Yr Free TSS)',
    billingCycle: 'One-Time Purchase',
    basePrice: 22500,
    discountPercent: 5,
    badge: 'Standard Edition',
    badgeVariant: 'badge-blue',
    availability: 'Instant Activation',
    inStock: true,
    accentColor: '#dc2626',
    iconName: 'Package',
    specs: [
      { label: 'Workstation Limit', value: '1 Desktop / Laptop' },
      { label: 'License Model', value: 'Perpetual (Lifetime)' },
      { label: 'Version', value: 'TallyPrime v5.0 (64-Bit)' },
      { label: 'Compliance', value: 'GSTR-1, 3B, 2B Auto Sync' }
    ],
    features: [
      'Complete invoicing, inventory tracking, GST & TDS statutory compliance',
      'Integrated e-Way Bill & direct e-Invoice generation with QR code',
      'Automated Connected Banking & 1-click bank reconciliation',
      'Secure local data storage with granular user password authorization',
      'Free 12 months Tally Software Services (TSS) software updates included'
    ]
  },
  {
    id: 'tally-prime-gold',
    category: 'software',
    categoryLabel: 'TallyPrime Software',
    name: 'TallyPrime Gold',
    fullName: 'TallyPrime Release 5.0 — Gold (Multi-User Unlimited LAN)',
    shortDesc: 'Enterprise edition for multi-workstation offices, enabling simultaneous concurrent billing, ledger posting, and reporting.',
    conciseDesc: 'Multi-user concurrent billing & real-time LAN sync.',
    image: tallyPrimeImg,
    badge: 'BEST SELLER',
    badgeVariant: 'badge-amber',
    rating: 4.9,
    reviewsCount: 142,
    licenseType: 'Perpetual License (Lifetime)',
    userType: 'Unlimited Concurrent LAN Users',
    duration: 'Perpetual (Includes 1-Yr Free TSS)',
    billingCycle: 'One-Time Purchase',
    basePrice: 67500,
    discountPercent: 8,
    availability: 'Instant Digital Key',
    inStock: true,
    accentColor: '#dc2626',
    iconName: 'Layers',
    specs: [
      { label: 'Workstation Limit', value: 'Unlimited LAN Nodes' },
      { label: 'License Model', value: 'Multi-User Concurrent' },
      { label: 'Auditor Support', value: 'Free Tally Auditor License' },
      { label: 'Multi-Branch Sync', value: 'Real-time Tally.NET Sync' }
    ],
    features: [
      'Unlimited simultaneous concurrent billing and accounting terminals on LAN',
      'Includes complementary Tally.NET remote auditor license access',
      'Multi-currency, cost-center tracking, job-costing, and manufacturing vouchers',
      'Automated data synchronization between branches and central headquarters',
      '1 Full year of free TSS renewal upgrades and 24/7 priority support'
    ]
  },
  {
    id: 'tally-tss-single',
    category: 'tss',
    categoryLabel: 'TSS Renewals',
    name: 'TSS Renewal Silver',
    fullName: 'Tally Software Services (TSS) — Silver Single User',
    shortDesc: 'Annual software maintenance contract providing latest statutory tax patches, government portal sync, and mobile reports.',
    conciseDesc: 'Annual software maintenance & tax patches.',
    image: tallyLogo,
    badge: 'POPULAR',
    badgeVariant: 'badge-blue',
    rating: 4.7,
    reviewsCount: 65,
    licenseType: 'Annual Subscription',
    userType: 'Single User',
    duration: '1 Year (12 Months)',
    billingCycle: 'Annual Renewal',
    basePrice: 4500,
    discountPercent: 10,
    availability: 'Instant Sync',
    inStock: true,
    accentColor: '#e11d48',
    iconName: 'RotateCw',
    specs: [
      { label: 'Coverage', value: '1 Year All Minor & Major Upgrades' },
      { label: 'e-Invoicing', value: 'Direct IRP Government Portal' },
      { label: 'Banking', value: 'Direct API Auto Bank Sync' },
      { label: 'Web Reports', value: 'Any Browser Financial Reports' }
    ],
    features: [
      'Continuous compliance updates for GST changes, e-Way bills, and TDS rates',
      'Direct 1-click JSON upload to government GST portal without excel utilities',
      'Anywhere web browser access for Balance Sheet, P&L, and Cashflow reports',
      'Automatic payment reconciliation with partner banks (HDFC, ICICI, SBI)',
      'Free software version upgrades including future TallyPrime releases'
    ]
  },
  {
    id: 'tally-tss-multi',
    category: 'tss',
    categoryLabel: 'TSS Renewals',
    name: 'TSS Renewal Gold',
    fullName: 'Tally Software Services (TSS) — Gold Multi-User',
    shortDesc: 'Annual software service renewal for Gold multi-user licenses, maintaining continuous multi-branch synchronization and compliance.',
    conciseDesc: 'Multi-user TSS updates & web browser reports.',
    image: tallyLogo,
    badge: 'TRENDING',
    badgeVariant: 'badge-emerald',
    rating: 4.9,
    reviewsCount: 98,
    licenseType: 'Annual Subscription',
    userType: 'Unlimited Multi-User LAN',
    duration: '1 Year (12 Months)',
    billingCycle: 'Annual Renewal',
    basePrice: 13500,
    discountPercent: 10,
    availability: 'Instant Sync',
    inStock: true,
    accentColor: '#059669',
    iconName: 'ShieldCheck',
    specs: [
      { label: 'Coverage', value: 'Full Multi-User Enterprise Coverage' },
      { label: 'Auditor Gateway', value: 'Continuous CA Remote Validation' },
      { label: 'Branch Sync', value: 'High-speed encrypted Tally.NET' },
      { label: 'SLA', value: 'NISPL 5-Star Priority Support' }
    ],
    features: [
      'All enterprise users receive continuous government statutory updates',
      'Unlimited remote browser sessions for branch managers & field staff',
      'Encrypted company data sync across geographically dispersed offices',
      'Complementary remote audit access authorization for your Chartered Accountant',
      'Priority telephone, remote desktop & WhatsApp engineer support from NISPL'
    ]
  },
  {
    id: 'tally-cloud-standard',
    category: 'cloud',
    categoryLabel: 'Tally on Cloud',
    name: 'Tally on Cloud Basic',
    fullName: 'Dedicated Tally on Cloud — Standard Edition (Monthly)',
    shortDesc: 'Secure, high-availability Tally hosting on dedicated Windows Server VPS located in Tier-4 CtrlS Kolkata Datacenter.',
    conciseDesc: 'Work on Tally from any device, anytime with high security.',
    image: cloudHostingImg,
    badge: 'RECOMMENDED',
    badgeVariant: 'badge-indigo',
    rating: 4.8,
    reviewsCount: 74,
    licenseType: 'Cloud Infrastructure Service',
    userType: 'Up to 3 Users Dedicated',
    duration: 'Monthly Subscription',
    billingCycle: 'Monthly',
    basePrice: 2499,
    discountPercent: 10,
    availability: 'Active Node Provisioning',
    inStock: true,
    accentColor: '#2563eb',
    iconName: 'Server',
    specs: [
      { label: 'Compute', value: '4 vCPU Intel Xeon Dedicated' },
      { label: 'RAM', value: '4 GB DDR4 ECC RAM' },
      { label: 'Storage', value: '50 GB Enterprise NVMe SSD' },
      { label: 'Datacenter', value: 'CtrlS Kolkata (Tier-4, 99.98% SLA)' }
    ],
    features: [
      'Access Tally from Windows, Mac, Linux, iPad, Android, or browser terminal',
      'Zero local installation needed; connect instantly via high-speed RDP',
      'Nightly automated offsite backup snapshot with 15-day recovery retention',
      'Enterprise hardware firewall, DDoS protection & antivirus included',
      'Local printer redirection & local folder file transfer enabled'
    ]
  },
  {
    id: 'tally-whatsapp-automation',
    category: 'addons',
    categoryLabel: 'Customization & Add-ons',
    name: 'WhatsApp Automation',
    fullName: 'Tally WhatsApp Automated Messaging & PDF Dispatch Module',
    shortDesc: 'Directly dispatch GST invoices, receipts, overdue reminders, and account statements to clients via Official WhatsApp API.',
    conciseDesc: 'Instant PDF invoices & ledger dispatches via WhatsApp.',
    image: managedImg,
    badge: 'NEW',
    badgeVariant: 'badge-emerald',
    rating: 4.9,
    reviewsCount: 110,
    licenseType: 'Annual Module Add-on',
    userType: 'Multi-User Organization',
    duration: '1 Year Subscription',
    billingCycle: 'Annual',
    basePrice: 3000,
    discountPercent: 10,
    availability: 'Plugin Installation',
    inStock: true,
    accentColor: '#059669',
    iconName: 'MessageSquare',
    specs: [
      { label: 'Integration', value: 'Official Meta WhatsApp Cloud API' },
      { label: 'Templates', value: 'Customizable PDF & Text Templates' },
      { label: 'Automation', value: 'Auto-Send on Voucher Accept / Save' },
      { label: 'Reports', value: 'Bulk Ledger & Aging Reminders' }
    ],
    features: [
      '1-Click automated PDF invoice delivery instantly upon voucher saving',
      'Instant payment receipt confirmation with branded company header',
      'Bulk ledger statement dispatch with interactive outstanding payment links',
      'Verified Meta Business Green Tick API compatibility without phone heating',
      'Full dispatch log with delivery receipts tracked directly within Tally'
    ]
  },
  {
    id: 'tally-einvoice-api',
    category: 'addons',
    categoryLabel: 'Customization & Add-ons',
    name: 'e-Invoice Direct API',
    fullName: 'Tally Direct NIC / GSP e-Invoice & e-Way Bill Connector',
    shortDesc: 'Direct API bridge connecting TallyPrime to government IRP portals for sub-second IRN and QR code generation.',
    conciseDesc: 'Direct 1-click IRP portal e-invoice generation.',
    image: managedImg,
    badge: 'POPULAR',
    badgeVariant: 'badge-purple',
    rating: 4.8,
    reviewsCount: 52,
    licenseType: 'Annual API License',
    userType: 'Corporate Enterprise',
    duration: '1 Year Subscription',
    billingCycle: 'Annual',
    basePrice: 2500,
    discountPercent: 0,
    availability: 'API Provisioned',
    inStock: true,
    accentColor: '#7c3aed',
    iconName: 'Zap',
    specs: [
      { label: 'API Gateway', value: 'Authorized GSP Direct Channel' },
      { label: 'Speed', value: '< 1 Second IRN Generation' },
      { label: 'Compatibility', value: 'TallyPrime v3.0, v4.0, v5.0' },
      { label: 'Cancel & Re-print', value: 'Direct Cancel from Tally Voucher' }
    ],
    features: [
      'Real-time automated Invoice Reference Number (IRN) generation on save',
      'Signed QR code and digital signature automatically imprinted on invoice',
      'Simultaneous e-Way Bill generation alongside e-Invoice in a single keystroke',
      'Auto validation of customer GSTIN before sending dispatch request',
      'Bulk generation tool for high-volume end-of-day billing dispatches'
    ]
  }
];

/* ─────────────────────────────────────────────────────────────────────────────
   CLOUD INFRASTRUCTURE SOLUTIONS CATALOG
───────────────────────────────────────────────────────────────────────────── */
export const CLOUD_CATEGORIES = [
  { id: 'all', label: 'All Cloud Services' },
  { id: 'tally-cloud', label: 'Tally on Cloud' },
  { id: 'vps', label: 'Virtual Private Server (VPS)' },
  { id: 'dedicated', label: 'Dedicated Server Hosting' },
  { id: 'managed', label: 'Managed Cloud Services' }
];

export const CLOUD_PRODUCTS = [
  {
    id: 'cloud-tally-business',
    category: 'tally-cloud',
    categoryLabel: 'Tally on Cloud',
    name: 'Dedicated Cloud Starter',
    fullName: 'Dedicated Tally Cloud Server — Business Starter',
    shortDesc: 'Dedicated compute node specifically optimized for high-concurrency Tally accounting with zero latency.',
    conciseDesc: 'Optimized cloud compute for SMB Tally accounting.',
    image: cloudHostingImg,
    badge: 'BEST SELLER',
    badgeVariant: 'badge-amber',
    rating: 4.9,
    reviewsCount: 120,
    planName: 'Cloud VPS Business Starter',
    cpu: '4 vCPU (Intel Xeon E5)',
    ram: '4 GB DDR4 ECC RAM',
    storage: '50 GB Enterprise NVMe SSD',
    os: 'Windows Server 2022 Datacenter',
    connections: 'Up to 3 Users Concurrent',
    billingCycle: 'Monthly',
    basePrice: 2499,
    discountPercent: 10,
    availability: 'Ready to Deploy',
    inStock: true,
    accentColor: '#2563eb',
    iconName: 'Server',
    specs: [
      { label: 'Compute Cores', value: '4 vCPU Dedicated' },
      { label: 'System Memory', value: '4 GB DDR4 ECC' },
      { label: 'Storage Array', value: '50 GB NVMe PCIe SSD' },
      { label: 'Network SLA', value: '1 Gbps Unmetered Port' },
      { label: 'Concurrent Users', value: 'Up to 3 Sessions' },
      { label: 'Backup Strategy', value: 'Daily Snapshot 02:00 AM' }
    ],
    features: [
      'Dedicated Intel Xeon CPU cores with zero noisy-neighbor slowdown',
      'Ultra-fast NVMe storage with 3,500 MB/s read/write speed for instant reports',
      'HTML5 Web Terminal: Access Tally from any web browser without RDP client',
      'Automated nightly snapshot backup with 15-day point-in-time recovery',
      'Free Windows Server 2022 DC license with Remote Desktop CALs included'
    ]
  },
  {
    id: 'cloud-tally-enterprise',
    category: 'tally-cloud',
    categoryLabel: 'Tally on Cloud',
    name: 'Enterprise Multi-Node',
    fullName: 'Dedicated Tally Cloud Server — Enterprise Multi-User Node',
    shortDesc: 'High-performance cloud server engineered for medium-to-large corporate organizations managing heavy multi-branch Tally operations.',
    conciseDesc: 'Engineered for high-volume enterprise operations.',
    image: cloudHostingImg,
    badge: 'POPULAR',
    badgeVariant: 'badge-purple',
    rating: 4.9,
    reviewsCount: 95,
    planName: 'Dedicated Cloud VPS Enterprise',
    cpu: '8 vCPU (Intel Xeon Gold)',
    ram: '8 GB DDR4 ECC Dedicated',
    storage: '100 GB High-Speed NVMe',
    os: 'Windows Server 2022 Datacenter',
    connections: 'Up to 10 Users Concurrent',
    billingCycle: 'Monthly',
    basePrice: 4500,
    discountPercent: 10,
    availability: 'Active Node Cluster',
    inStock: true,
    accentColor: '#7c3aed',
    iconName: 'Cpu',
    specs: [
      { label: 'Compute Cores', value: '8 vCPU Xeon Gold' },
      { label: 'System Memory', value: '8 GB ECC RAM' },
      { label: 'Storage Array', value: '100 GB NVMe Storage' },
      { label: 'Network SLA', value: '99.98% High Availability' },
      { label: 'Concurrent Users', value: '10 Concurrent Sessions' },
      { label: 'Datacenter Cluster', value: 'CtrlS Rated-4 Kolkata' }
    ],
    features: [
      '8 dedicated virtual cores handling heavy ledger voucher posting smoothly',
      'Double RAM allocation for seamless execution of multiple concurrent vouchers',
      'Multi-level hardware firewall, DDoS protection & automated ransomware shield',
      'Dedicated IP address with whitelisted IP subnet corporate restriction option',
      '24/7 dedicated system monitoring and 30-minute priority response SLA'
    ]
  },
  {
    id: 'cloud-vps-ultra',
    category: 'vps',
    categoryLabel: 'Virtual Private Server (VPS)',
    name: 'Cloud VPS Ultra',
    fullName: 'Dedicated Windows / Linux Cloud VPS — Ultra Compute Node',
    shortDesc: 'Heavy-duty virtual private server with dedicated root/administrator credentials, ideal for ERP, database, and business apps.',
    conciseDesc: 'Full root access VPS for ERP, MSSQL & databases.',
    image: itInfraImg,
    badge: 'TRENDING',
    badgeVariant: 'badge-indigo',
    rating: 4.8,
    reviewsCount: 68,
    planName: 'Cloud VPS Ultra 16GB',
    cpu: '12 vCPU (Intel Xeon Scalable)',
    ram: '16 GB Dedicated ECC',
    storage: '250 GB Enterprise NVMe SSD',
    os: 'Windows Server 2022 / Ubuntu 24.04',
    connections: 'Up to 25 Users Concurrent',
    billingCycle: 'Monthly',
    basePrice: 8500,
    discountPercent: 15,
    availability: 'Fast Provisioning',
    inStock: true,
    accentColor: '#4f46e5',
    iconName: 'HardDrive',
    specs: [
      { label: 'Compute Cores', value: '12 vCPU Scalable Xeon' },
      { label: 'System Memory', value: '16 GB DDR4 ECC' },
      { label: 'Storage Array', value: '250 GB NVMe Hardware RAID' },
      { label: 'Access Rights', value: 'Full Administrator / Root' },
      { label: 'Concurrent Users', value: 'Up to 25 Sessions' },
      { label: 'Bandwidth', value: '1 Gbps Unmetered' }
    ],
    features: [
      'Full administrative access for custom third-party ERP and database deployments',
      'Hardware RAID-10 storage configuration ensuring zero single point of failure',
      'Native support for MSSQL, MySQL, PostgreSQL, and IIS / Apache web servers',
      'Custom IP reverse-DNS configuration and dedicated VLAN isolation option',
      'Weekly full disaster recovery images stored in a geographically distinct zone'
    ]
  },
  {
    id: 'cloud-dedicated-baremetal',
    category: 'dedicated',
    categoryLabel: 'Dedicated Server Hosting',
    name: 'Bare-Metal Dedicated',
    fullName: 'Dedicated Bare-Metal Enterprise Server — Dual Xeon Silver',
    shortDesc: '100% dedicated physical server hardware with uncompromised compute power, zero virtualization overhead, and dedicated chassis.',
    conciseDesc: 'Non-virtualized 100% dedicated hardware & 1 Gbps port.',
    image: itInfraImg,
    badge: 'RECOMMENDED',
    badgeVariant: 'badge-red',
    rating: 5.0,
    reviewsCount: 42,
    planName: 'Bare-Metal Enterprise Host',
    cpu: 'Dual Intel Xeon Silver (16 Cores / 32 Threads)',
    ram: '32 GB DDR4 ECC Reg',
    storage: '2 x 500 GB NVMe Datacenter Edition',
    os: 'Windows Server / VMware ESXi / Proxmox',
    connections: 'Unlimited Organization Users',
    billingCycle: 'Monthly',
    basePrice: 16000,
    discountPercent: 12,
    availability: 'Custom Provisioned',
    inStock: true,
    accentColor: '#dc2626',
    iconName: 'Server',
    specs: [
      { label: 'Processors', value: 'Dual Intel Xeon Silver (32 Threads)' },
      { label: 'System Memory', value: '32 GB ECC Registered' },
      { label: 'Storage Hardware', value: '2x 500GB NVMe Hardware RAID 1' },
      { label: 'Out-of-Band Mgt', value: 'Dedicated IPMI / iLO KVM Console' },
      { label: 'Network Uplink', value: '2 x 10 Gbps Redundant NICs' },
      { label: 'Uptime SLA', value: '99.99% Hardware Guaranteed' }
    ],
    features: [
      '100% single-tenant physical server: all CPU, RAM, and PCIe bus exclusively yours',
      'Hardware RAID controller with battery-backed cache for instant write-back',
      'Dedicated out-of-band IPMI remote management for BIOS-level hardware control',
      'Dual redundant power supplies (A+B feeds) connected to UPS & generator backup',
      'Engineered for large multi-branch enterprises running central ERP consolidation'
    ]
  },
  {
    id: 'cloud-managed-backup',
    category: 'managed',
    categoryLabel: 'Managed Cloud Services',
    name: 'Managed Cloud & DR',
    fullName: 'NISPL 24/7 Managed Cloud Infrastructure & Disaster Recovery Suite',
    shortDesc: 'Comprehensive cloud system administration, automated offsite ransomware backup, security patching, and proactive NOC monitoring.',
    conciseDesc: '24/7 DevOps management, patching & 99.98% SLA.',
    image: managedImg,
    badge: 'NEW',
    badgeVariant: 'badge-emerald',
    rating: 4.9,
    reviewsCount: 56,
    planName: 'Enterprise Cloud Management SLA',
    cpu: 'Managed Cloud Service',
    ram: 'Managed Service',
    storage: 'Up to 500 GB Cloud Backup Storage',
    os: 'Windows & Linux Cloud Servers',
    connections: 'All Company Cloud Instances',
    billingCycle: 'Annual Subscription',
    basePrice: 6000,
    discountPercent: 10,
    availability: 'Instant Protection',
    inStock: true,
    accentColor: '#059669',
    iconName: 'ShieldCheck',
    specs: [
      { label: 'NOC Monitoring', value: '24/7 Uptime & Resource Alerts' },
      { label: 'Backup Engine', value: 'Hourly Immutable Snapshot' },
      { label: 'Patch Management', value: 'Monthly OS & Security Updates' },
      { label: 'Incident Response', value: '< 15 Minutes SLA Guaranteed' }
    ],
    features: [
      'Proactive 24/7 NOC monitoring with automatic alert dispatch on memory/CPU spikes',
      'Hourly immutable snapshots protected against ransomware deletion and tampering',
      'Automated disaster recovery drill tested every quarter with failover validation',
      'Regular OS kernel security patching, firewall optimization, and port audit',
      'Dedicated certified Cloud Solutions Architect assigned to your business account'
    ]
  },
  {
    id: 'cloud-biz-analyst-sync',
    category: 'tally-cloud',
    categoryLabel: 'Tally on Cloud',
    name: 'Biz Analyst Mobile',
    fullName: 'Biz Analyst Tally on Mobile App — Cloud Sync Edition',
    shortDesc: 'Access live Tally analytics, sales orders, outstanding receivables, and inventory on iOS and Android devices anywhere, anytime.',
    conciseDesc: 'Mobile cloud sync for Android & iOS business app.',
    image: cloudHostingImg,
    badge: 'POPULAR',
    badgeVariant: 'badge-amber',
    rating: 4.8,
    reviewsCount: 88,
    planName: 'Mobile Analytics 2-User Pack',
    cpu: 'Cloud Sync Engine',
    ram: 'Real-time Sync',
    storage: 'Cloud Database Replicated',
    os: 'iOS, Android & Web App',
    connections: '2 Registered Smartphone Devices',
    billingCycle: 'Annual Subscription',
    basePrice: 2124,
    discountPercent: 0,
    availability: 'Instant QR Setup',
    inStock: true,
    accentColor: '#d97706',
    iconName: 'Smartphone',
    specs: [
      { label: 'Mobile Platforms', value: 'Apple iOS & Google Android' },
      { label: 'Device Seats', value: '2 Registered Mobile Accounts' },
      { label: 'Data Security', value: '256-Bit Bank Grade Encryption' },
      { label: 'Offline Support', value: 'View Cached Ledgers Without Internet' }
    ],
    features: [
      'Real-time financial dashboard: Sales, Purchases, Receipts, and Bank Balances',
      'Field sales agents can create sales orders and receipts directly on phone',
      'One-tap customer payment reminders with PDF ledger dispatch on WhatsApp',
      'Granular data permission: restrict salesmen to only view their assigned customers',
      'Biometric fingerprint and FaceID app lock for enhanced business confidentiality'
    ]
  }
];

/**
 * Hydrate catalog items with dynamic pricing formulas
 * @param {Array} list
 * @returns {Array} List of products with calculated pricing objects attached
 */
export function hydrateCatalogWithPricing(list) {
  return list.map(item => {
    const pricing = calculatePricing({
      basePrice: item.basePrice,
      discountPercent: item.discountPercent || 0,
      gstRate: 0.18
    });

    return {
      ...item,
      pricing
    };
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   CLOUD PROVIDERS & 4-TIER PACKS (STARTER, SILVER, GOLD, PREMIUM)
───────────────────────────────────────────────────────────────────────────── */
export const CLOUD_PROVIDERS = [
  {
    id: 'aws-cloud',
    name: 'Amazon Web Services (AWS)',
    badge: 'Global Hyperscale Cloud',
    shortDesc: 'Scalable global cloud compute, high-availability EC2 instances & enterprise AWS infrastructure.',
    accentColor: '#FF9900',
    logoType: 'aws',
    gradient: 'from-amber-500/10 to-orange-500/10',
    plans: [
      {
        id: 'aws-starter',
        tier: 'Starter',
        tierName: 'Starters',
        userBadge: 't3.small instance',
        name: 'AWS Cloud — Starter (t3.small)',
        monthlyPrice: 999,
        originalPrice: 1110,
        discountText: 'Save 10% annually',
        isPopular: false,
        theme: 'default',
        specs: [
          { label: 'Instance', value: 'AWS EC2 t3.small' },
          { label: 'vCPU', value: '2 vCPU' },
          { label: 'RAM', value: '3 GB' },
          { label: 'Storage', value: '60 GB gp3 SSD' },
          { label: 'Data Transfer', value: 'Unlimited' }
        ],
        features: [
          'Dedicated AWS Elastic Compute (EC2)',
          'Automated AWS EBS snapshot backup',
          'High availability 99.99% AWS SLA',
          'Fast RDP / SSH access & firewall security'
        ]
      },
      {
        id: 'aws-silver',
        tier: 'Silver',
        tierName: 'Silver',
        userBadge: 't3.medium instance',
        name: 'AWS Cloud — Silver (t3.medium)',
        monthlyPrice: 1499,
        originalPrice: 1665,
        discountText: 'Save 10% annually',
        isPopular: true,
        popularBadge: 'Most Popular',
        theme: 'blue',
        specs: [
          { label: 'Instance', value: 'AWS EC2 t3.medium' },
          { label: 'vCPU', value: '2 vCPU' },
          { label: 'RAM', value: '4 GB' },
          { label: 'Storage', value: '60 GB gp3 SSD' },
          { label: 'Data Transfer', value: 'Unlimited' }
        ],
        features: [
          'High memory bandwidth for concurrent users',
          'AWS IAM security & VPC network isolation',
          '99.99% High-availability SLA',
          'Automated data encryption & anti-ransomware'
        ]
      },
      {
        id: 'aws-gold',
        tier: 'Gold',
        tierName: 'Gold',
        userBadge: 't3.large instance',
        name: 'AWS Cloud — Gold (t3.large)',
        monthlyPrice: 2499,
        originalPrice: 2777,
        discountText: 'Save 10% annually',
        isPopular: false,
        theme: 'default',
        specs: [
          { label: 'Instance', value: 'AWS EC2 t3.large' },
          { label: 'vCPU', value: '2 vCPU' },
          { label: 'RAM', value: '8 GB' },
          { label: 'Storage', value: '100 GB gp3 SSD' },
          { label: 'Data Transfer', value: 'Unlimited' }
        ],
        features: [
          'High-performance compute & 8 GB RAM',
          'Expanded 100 GB gp3 SSD enterprise storage',
          'Multi-branch synchronized company accounts',
          'Priority 24/7 technical engineer support'
        ]
      },
      {
        id: 'aws-premium',
        tier: 'Premium',
        tierName: 'Premium',
        userBadge: 't3.xlarge instance',
        name: 'AWS Cloud — Premium (t3.xlarge)',
        monthlyPrice: 4999,
        originalPrice: 5554,
        discountText: 'Save 10% annually',
        isPopular: false,
        theme: 'gold',
        specs: [
          { label: 'Instance', value: 'AWS EC2 t3.xlarge' },
          { label: 'vCPU', value: '4 vCPU' },
          { label: 'RAM', value: '16 GB' },
          { label: 'Storage', value: '150 GB gp3 SSD' },
          { label: 'Data Transfer', value: 'Unlimited' }
        ],
        features: [
          '4 vCPU enterprise compute speed',
          'Dedicated Elastic IP & AWS WAF security',
          'Dedicated account manager & 99.99% SLA',
          'Automated cross-region disaster recovery snapshot'
        ]
      }
    ]
  },
  {
    id: 'ctrls-cloud',
    name: 'CtrlS Cloud server',
    badge: 'Tier-4 Datacenter Hosting',
    shortDesc: 'Rated-4 fault-tolerant datacenter cloud VPS infrastructure with 99.995% uptime SLA.',
    accentColor: '#0284c7',
    logoType: 'ctrls',
    logo: ctrlsLogo,
    gradient: 'from-cyan-500/10 to-blue-500/10',
    plans: [
      {
        id: 'ctrls-starter',
        tier: 'Starter',
        tierName: 'Starters',
        userBadge: '2 + 1 FREE USER',
        name: 'CtrlS Cloud Server — Starter Pack',
        monthlyPrice: 999,
        originalPrice: 1110,
        discountText: 'Save 10% annually',
        isPopular: false,
        theme: 'default',
        specs: [
          { label: 'CPU', value: '2 Core' },
          { label: 'RAM', value: '3 GB' },
          { label: 'Storage', value: '60 GB SSD' },
          { label: 'Data Transfer', value: 'Unlimited' },
          { label: 'Dedicated IP', value: '1 IP' }
        ],
        features: [
          'Tier-4 CtrlS Kolkata Datacenter hosting',
          'N+N dual power feed redundancy',
          'Dedicated enterprise SSD storage array',
          'Active DDoS protection and firewall'
        ]
      },
      {
        id: 'ctrls-silver',
        tier: 'Silver',
        tierName: 'Silver',
        userBadge: '3 + 1 FREE USER',
        name: 'CtrlS Cloud Server — Silver Pack',
        monthlyPrice: 1499,
        originalPrice: 1665,
        discountText: 'Save 10% annually',
        isPopular: true,
        popularBadge: 'Most Popular',
        theme: 'blue',
        specs: [
          { label: 'CPU', value: '2 Core' },
          { label: 'RAM', value: '4 GB' },
          { label: 'Storage', value: '60 GB SSD' },
          { label: 'Data Transfer', value: 'Unlimited' },
          { label: 'Dedicated IP', value: '1 IP' }
        ],
        features: [
          'Tier-4 CtrlS high compute performance',
          'Carrier-neutral high speed network pipe',
          'Dedicated Windows Server environment',
          'Automated daily backup image retention'
        ]
      },
      {
        id: 'ctrls-gold',
        tier: 'Gold',
        tierName: 'Gold',
        userBadge: '5 + 1 FREE USER',
        name: 'CtrlS Cloud Server — Gold Pack',
        monthlyPrice: 2499,
        originalPrice: 2777,
        discountText: 'Save 10% annually',
        isPopular: false,
        theme: 'default',
        specs: [
          { label: 'CPU', value: '2 Core' },
          { label: 'RAM', value: '8 GB' },
          { label: 'Storage', value: '100 GB SSD' },
          { label: 'Data Transfer', value: 'Unlimited' },
          { label: 'Dedicated IP', value: '1 IP' }
        ],
        features: [
          '8 GB ECC RAM for intensive database workloads',
          'High IOPS enterprise NVMe/SSD cluster',
          'Sub-2ms ultra-low latency connectivity',
          'Dedicated SLA monitoring & instant alerts'
        ]
      },
      {
        id: 'ctrls-premium',
        tier: 'Premium',
        tierName: 'Premium',
        userBadge: '10 + 2 FREE USER',
        name: 'CtrlS Cloud Server — Premium Pack',
        monthlyPrice: 4999,
        originalPrice: 5554,
        discountText: 'Save 10% annually',
        isPopular: false,
        theme: 'gold',
        specs: [
          { label: 'CPU', value: '4 Core' },
          { label: 'RAM', value: '10 GB' },
          { label: 'Storage', value: '100 GB SSD' },
          { label: 'Data Transfer', value: 'Unlimited' },
          { label: 'Dedicated IP', value: '1 IP' }
        ],
        features: [
          '4 Dedicated vCPU cores with zero noisy neighbor',
          '100 GB enterprise storage with hot snapshots',
          'Layered military-grade perimeter security',
          'Direct senior systems engineer hotline'
        ]
      }
    ]
  },
  {
    id: 'azure-cloud',
    name: 'Microsoft azure',
    badge: 'Enterprise Hyperscale Cloud',
    shortDesc: 'Scalable Microsoft Azure enterprise cloud VMs, managed security, and high-availability architecture.',
    accentColor: '#0078d4',
    logoType: 'azure',
    gradient: 'from-blue-600/10 to-sky-500/10',
    plans: [
      {
        id: 'azure-starter',
        tier: 'Starter',
        tierName: 'Starters',
        userBadge: '4 GB RAM PLAN',
        name: 'Microsoft Azure — 4 GB RAM Plan',
        monthlyPrice: 4499,
        originalPrice: 4949,
        discountText: 'Save 10% annually',
        isPopular: false,
        theme: 'default',
        specs: [
          { label: 'RAM', value: '4 GB Dedicated' },
          { label: 'CPU', value: '2 Core' },
          { label: 'Disk', value: '80 GB SSD' },
          { label: 'Transfer', value: '4 TB' },
          { label: 'Services', value: 'Managed' }
        ],
        features: [
          'Microsoft Azure certified enterprise instance',
          'Fully managed OS patching and security shields',
          'Global high availability and SLA reliability',
          'NISPL certified Azure architect assistance'
        ]
      },
      {
        id: 'azure-silver',
        tier: 'Silver',
        tierName: 'Silver',
        userBadge: '8 GB RAM PLAN',
        name: 'Microsoft Azure — 8 GB RAM Plan',
        monthlyPrice: 7499,
        originalPrice: 8249,
        discountText: 'Save 10% annually',
        isPopular: true,
        popularBadge: 'Most Popular',
        theme: 'blue',
        specs: [
          { label: 'RAM', value: '8 GB Dedicated' },
          { label: 'CPU', value: '2 Core' },
          { label: 'Disk', value: '160 GB SSD' },
          { label: 'Transfer', value: '5 TB' },
          { label: 'Services', value: 'Managed' }
        ],
        features: [
          'Ideal for growing businesses & active ERP nodes',
          '160 GB High-performance managed SSD disk',
          '5 TB high-speed monthly data transfer',
          'Automated daily Azure backup snapshots'
        ]
      },
      {
        id: 'azure-gold',
        tier: 'Gold',
        tierName: 'Gold',
        userBadge: '16 GB RAM PLAN',
        name: 'Microsoft Azure — 16 GB RAM Plan',
        monthlyPrice: 10999,
        originalPrice: 12099,
        discountText: 'Save 10% annually',
        isPopular: false,
        theme: 'default',
        specs: [
          { label: 'RAM', value: '16 GB Dedicated' },
          { label: 'CPU', value: '4 Core' },
          { label: 'Disk', value: '320 GB SSD' },
          { label: 'Transfer', value: '7 TB' },
          { label: 'Services', value: 'Managed' }
        ],
        features: [
          '4 Core high-compute Azure enterprise VM',
          '320 GB Premium SSD storage array',
          '7 TB outbound data bandwidth included',
          'Managed disaster recovery & 24/7 monitoring'
        ]
      },
      {
        id: 'azure-premium',
        tier: 'Premium',
        tierName: 'Premium',
        userBadge: '32 GB RAM PLAN',
        name: 'Microsoft Azure — 32 GB RAM Plan',
        monthlyPrice: 19999,
        originalPrice: 21449,
        discountText: 'Save 10% annually',
        isPopular: false,
        theme: 'gold',
        specs: [
          { label: 'RAM', value: '32 GB Dedicated' },
          { label: 'CPU', value: '8 Core' },
          { label: 'Disk', value: '640 GB SSD' },
          { label: 'Transfer', value: '8 TB' },
          { label: 'Services', value: 'Managed' }
        ],
        features: [
          '8 Core compute powerhouse for heavy workloads',
          '640 GB enterprise SSD storage pool',
          '8 TB unmetered high throughput pipe',
          'Enterprise mission-critical SLA & dedicated architect'
        ]
      }
    ]
  }
];

export default {
  TALLY_CATEGORIES,
  TALLY_PRODUCTS,
  CLOUD_CATEGORIES,
  CLOUD_PRODUCTS,
  CLOUD_PROVIDERS,
  hydrateCatalogWithPricing
};

