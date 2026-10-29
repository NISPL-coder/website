// Mock Initial Datasets for NISPL Admin Portal

export const INITIAL_CUSTOMERS = [
  {
    id: 'CUST-8821',
    name: 'Debasish Chakraborty',
    company: 'FlowMail Agency Pvt Ltd',
    email: 'debasish@flowmail.agency',
    phone: '+91 98301 22419',
    city: 'Kolkata, Salt Lake Sec V',
    plan: 'Tally Prime Cloud + VPS Gold',
    serverNode: 'CtrlS-KOL-NODE-01',
    status: 'active',
    registered: '2026-10-24',
    mrr: '₹14,500'
  },
  {
    id: 'CUST-8822',
    name: 'Amitabh Sengupta',
    company: 'Bengal Logistics Corp',
    email: 'amitabh@bengallogistics.in',
    phone: '+91 98310 99401',
    city: 'Kolkata, Dalhousie',
    plan: 'Enterprise VPS Dedicated Node',
    serverNode: 'CtrlS-KOL-NODE-02',
    status: 'active',
    registered: '2026-10-20',
    mrr: '₹28,000'
  },
  {
    id: 'CUST-8823',
    name: 'Rajesh Agrawal',
    company: 'SawanSukha Jewellers Hub',
    email: 'it@sawansukha.com',
    phone: '+91 98300 44102',
    city: 'Kolkata, Burrabazar',
    plan: 'Tally Multi-User Cloud + TSS',
    serverNode: 'CtrlS-KOL-NODE-01',
    status: 'active',
    registered: '2026-10-18',
    mrr: '₹22,500'
  },
  {
    id: 'CUST-8824',
    name: 'Dr. Suniti Mukherjee',
    company: 'Kolkata Health Diagnostics',
    email: 'admin@khdlabs.org',
    phone: '+91 98315 77120',
    city: 'Kolkata, Gariahat',
    plan: 'Tally Prime Single User Silver',
    serverNode: 'CtrlS-KOL-NODE-03',
    status: 'pending',
    registered: '2026-10-28',
    mrr: '₹6,500'
  },
  {
    id: 'CUST-8825',
    name: 'Vikram Burman',
    company: 'Eastern Metal Refineries',
    email: 'v.burman@emrindustries.com',
    phone: '+91 98302 55910',
    city: 'Durgapur Industrial Belt',
    plan: 'High-Mem Cloud VPS Node',
    serverNode: 'CtrlS-KOL-NODE-02',
    status: 'active',
    registered: '2026-10-12',
    mrr: '₹34,000'
  }
];

export const INITIAL_CONTRACTS = [
  {
    id: 'CTR-2026-0891',
    customer: 'Debasish Chakraborty',
    company: 'FlowMail Agency Pvt Ltd',
    email: 'debasish@flowmail.agency',
    service: 'Tally Prime Cloud + VPS Dedicated SLA',
    value: '₹1,74,000 / yr',
    startDate: '2026-01-15',
    expiryDate: '2027-01-14',
    status: 'active',
    slaTier: 'Tier-1 Priority NOC'
  },
  {
    id: 'CTR-2026-0890',
    customer: 'Amitabh Sengupta',
    company: 'Bengal Logistics Corp',
    email: 'amitabh@bengallogistics.in',
    service: 'Enterprise Cloud VPS Dedicated 8-Core Node',
    value: '₹3,36,000 / yr',
    startDate: '2026-03-01',
    expiryDate: '2027-02-28',
    status: 'active',
    slaTier: '24/7 Dedicated Support'
  },
  {
    id: 'CTR-2026-0889',
    customer: 'Rajesh Agrawal',
    company: 'SawanSukha Jewellers Hub',
    email: 'it@sawansukha.com',
    service: 'Tally Multi-User Gold Cloud + TSS Sync',
    value: '₹2,70,000 / yr',
    startDate: '2025-11-10',
    expiryDate: '2026-11-09',
    status: 'expiring',
    slaTier: 'Annual Gold Maintenance'
  },
  {
    id: 'CTR-2026-0888',
    customer: 'Dr. Suniti Mukherjee',
    company: 'Kolkata Health Diagnostics',
    email: 'admin@khdlabs.org',
    service: 'Tally Prime Single User Silver',
    value: '₹78,000 / yr',
    startDate: '2026-08-01',
    expiryDate: '2027-07-31',
    status: 'active',
    slaTier: 'Standard Cloud Hosting'
  },
  {
    id: 'CTR-2026-0887',
    customer: 'Vikram Burman',
    company: 'Eastern Metal Refineries',
    email: 'v.burman@emrindustries.com',
    service: 'High-Mem Cloud VPS Node Hypervisor',
    value: '₹4,08,000 / yr',
    startDate: '2026-05-10',
    expiryDate: '2027-05-09',
    status: 'active',
    slaTier: 'Mission-Critical SLA 99.99%'
  }
];

export const INITIAL_PAYMENTS = [
  {
    id: 'TXN-994101',
    customer: 'Debasish Chakraborty',
    company: 'FlowMail Agency Pvt Ltd',
    amount: '₹14,500',
    method: 'NEFT / RTGS Wire',
    date: '2026-10-28 14:22',
    invoiceRef: 'INV-2026-1049',
    status: 'paid'
  },
  {
    id: 'TXN-994100',
    customer: 'Amitabh Sengupta',
    company: 'Bengal Logistics Corp',
    amount: '₹28,000',
    method: 'Corporate NetBanking (HDFC)',
    date: '2026-10-27 11:05',
    invoiceRef: 'INV-2026-1048',
    status: 'paid'
  },
  {
    id: 'TXN-994099',
    customer: 'Rajesh Agrawal',
    company: 'SawanSukha Jewellers',
    amount: '₹22,500',
    method: 'Razorpay UPI Gateway',
    date: '2026-10-26 18:40',
    invoiceRef: 'INV-2026-1047',
    status: 'paid'
  },
  {
    id: 'TXN-994098',
    customer: 'Dr. Suniti Mukherjee',
    company: 'Kolkata Health Diagnostics',
    amount: '₹6,500',
    method: 'Corporate Visa Card',
    date: '2026-10-25 09:15',
    invoiceRef: 'INV-2026-1046',
    status: 'paid'
  },
  {
    id: 'TXN-994097',
    customer: 'Vikram Burman',
    company: 'Eastern Metal Refineries',
    amount: '₹34,000',
    method: 'RTGS Bank Transfer',
    date: '2026-10-24 16:30',
    invoiceRef: 'INV-2026-1045',
    status: 'pending'
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: 'PROD-TALLY-GOLD',
    name: 'Tally Prime Multi-User Gold',
    sku: 'NIS-TP-GOLD-2026',
    category: 'ERP Solutions',
    price: '₹54,000',
    frequency: '/ year',
    description: 'Unlimited concurrent accounting nodes across network with full audit trail compliance.',
    available: true
  },
  {
    id: 'PROD-TALLY-SILVER',
    name: 'Tally Prime Single User Silver',
    sku: 'NIS-TP-SILVER-2026',
    category: 'ERP Solutions',
    price: '₹18,000',
    frequency: '/ year',
    description: 'Dedicated single PC business edition for MSMEs with automated e-invoicing & GST returns.',
    available: true
  },
  {
    id: 'PROD-VPS-ENT',
    name: 'Enterprise Cloud VPS Dedicated 8-Core',
    sku: 'NIS-VPS-8CORE-NVME',
    category: 'Infrastructure',
    price: '₹38,000',
    frequency: '/ month',
    description: 'High-IOPS virtual server hosted at CtrlS Kolkata Tier-4 datacenter with root credentials.',
    available: true
  },
  {
    id: 'PROD-VPS-TALLY',
    name: 'Tally on Cloud Managed VPS 4-Core',
    sku: 'NIS-TOC-4CORE',
    category: 'Cloud Hosting',
    price: '₹16,500',
    frequency: '/ month',
    description: 'Optimized 4-core remote desktop environment with automated offsite daily snapshots.',
    available: true
  },
  {
    id: 'PROD-ADDON-WA',
    name: 'WhatsApp Automated Invoicing Module',
    sku: 'NIS-ADDON-WA-META',
    category: 'Automation',
    price: '₹3,000',
    frequency: '/ year',
    description: 'Direct Meta cloud API integration for dispatching PDF bills & receipts to clients instantly.',
    available: true
  },
  {
    id: 'PROD-BACKUP-100',
    name: 'Encrypted Cloud Backup Vault (100GB)',
    sku: 'NIS-SEC-VAULT-100G',
    category: 'Security & Backup',
    price: '₹1,499',
    frequency: '/ month',
    description: 'Immutable ransomware-safe offsite storage vault with 256-bit AES military-grade encryption.',
    available: true
  }
];

export const INITIAL_RECEIPTS = [
  {
    id: 'REC-2026-1049',
    customer: 'Debasish Chakraborty',
    company: 'FlowMail Agency Pvt Ltd',
    amount: '₹14,500',
    baseAmount: '₹12,288',
    taxAmount: '₹2,212',
    date: '2026-10-28',
    mode: 'NEFT / RTGS',
    status: 'Issued & Dispatched'
  },
  {
    id: 'REC-2026-1048',
    customer: 'Amitabh Sengupta',
    company: 'Bengal Logistics Corp',
    amount: '₹28,000',
    baseAmount: '₹23,728',
    taxAmount: '₹4,272',
    date: '2026-10-27',
    mode: 'Corporate NetBanking',
    status: 'Issued & Dispatched'
  },
  {
    id: 'REC-2026-1047',
    customer: 'Rajesh Agrawal',
    company: 'SawanSukha Jewellers Hub',
    amount: '₹22,500',
    baseAmount: '₹19,068',
    taxAmount: '₹3,432',
    date: '2026-10-26',
    mode: 'Razorpay UPI',
    status: 'Issued & Dispatched'
  },
  {
    id: 'REC-2026-1046',
    customer: 'Dr. Suniti Mukherjee',
    company: 'Kolkata Health Diagnostics',
    amount: '₹6,500',
    baseAmount: '₹5,508',
    taxAmount: '₹992',
    date: '2026-10-25',
    mode: 'Corporate Visa Card',
    status: 'Issued & Dispatched'
  },
  {
    id: 'REC-2026-1045',
    customer: 'Vikram Burman',
    company: 'Eastern Metal Refineries',
    amount: '₹34,000',
    baseAmount: '₹28,814',
    taxAmount: '₹5,186',
    date: '2026-10-24',
    mode: 'RTGS Bank Wire',
    status: 'Pending Verification'
  }
];

