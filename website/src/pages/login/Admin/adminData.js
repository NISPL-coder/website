// Mock Datasets & Analytics Telemetry for NISPL Admin Portal

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
  },
  // DEMO / TRIAL ACCOUNTS
  {
    id: 'CUST-8826',
    name: 'Rohan Roy',
    company: 'NexGen AI Solutions',
    email: 'rohan.roy@nexgenai.tech',
    phone: '+91 98305 11840',
    city: 'Kolkata, Sector V',
    plan: '14-Day Cloud VPS Sandbox Trial',
    serverNode: 'CtrlS-KOL-NODE-03',
    status: 'demo',
    registered: '2026-10-27',
    mrr: '₹0 (Trial)'
  },
  {
    id: 'CUST-8827',
    name: 'Moumita Das',
    company: 'Horizon BioPharma Labs',
    email: 'moumita@horizonbio.in',
    phone: '+91 98314 22930',
    city: 'Kolkata, New Town Action Area II',
    plan: 'Tally Prime Cloud Trial Demo',
    serverNode: 'CtrlS-KOL-NODE-01',
    status: 'demo',
    registered: '2026-10-28',
    mrr: '₹0 (Trial)'
  },
  {
    id: 'CUST-8828',
    name: 'Anirban Ghosh',
    company: 'Pinnacle Retail Ventures',
    email: 'anirban@pinnacleretail.co',
    phone: '+91 98322 77410',
    city: 'Howrah Commercial Zone',
    plan: 'Multi-User ERP Sandbox Node',
    serverNode: 'CtrlS-KOL-NODE-02',
    status: 'demo',
    registered: '2026-10-29',
    mrr: '₹0 (Trial)'
  },
  // INACTIVE / SUSPENDED ACCOUNTS
  {
    id: 'CUST-8829',
    name: 'Subrata Mukherjee',
    company: 'Heritage Tea & Spice Exporters',
    email: 'subrata@heritagetea.com',
    phone: '+91 98311 66320',
    city: 'Siliguri Commercial Hub',
    plan: 'Tally Single User Silver (Paused)',
    serverNode: 'CtrlS-KOL-NODE-02',
    status: 'inactive',
    registered: '2026-08-10',
    mrr: '₹6,500'
  },
  {
    id: 'CUST-8830',
    name: 'Pradip Sen',
    company: 'Eastern Freight Movers',
    email: 'pradip@easternfreight.in',
    phone: '+91 98309 88470',
    city: 'Kolkata, Port Area',
    plan: 'Cloud VPS Standard Node (Expired)',
    serverNode: 'CtrlS-KOL-NODE-03',
    status: 'inactive',
    registered: '2026-07-15',
    mrr: '₹14,000'
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
    name: 'Tally Prime Cloud ERP Monthly License',
    accountName: 'FlowMail Agency Pvt Ltd',
    invoiceNumber: 'INV-2026-1049',
    invoiceDate: '2026-10-15',
    status: 'paid',
    receivedAmount: '₹14,500',
    pendingPayment: '₹0',
    expectedPaymentDate: '2026-10-25',
    paymentMethod: 'NEFT / RTGS Wire',
    paymentReceivedDate: '2026-10-28',
    // Aliases
    customer: 'Debasish Chakraborty',
    company: 'FlowMail Agency Pvt Ltd',
    amount: '₹14,500',
    method: 'NEFT / RTGS Wire',
    date: '2026-10-28 14:22',
    invoiceRef: 'INV-2026-1049'
  },
  {
    id: 'TXN-994100',
    name: 'Enterprise VPS Dedicated 8-Core Node Renewal',
    accountName: 'Bengal Logistics Corp',
    invoiceNumber: 'INV-2026-1048',
    invoiceDate: '2026-10-14',
    status: 'paid',
    receivedAmount: '₹28,000',
    pendingPayment: '₹0',
    expectedPaymentDate: '2026-10-24',
    paymentMethod: 'Corporate NetBanking (HDFC)',
    paymentReceivedDate: '2026-10-27',
    // Aliases
    customer: 'Amitabh Sengupta',
    company: 'Bengal Logistics Corp',
    amount: '₹28,000',
    method: 'Corporate NetBanking (HDFC)',
    date: '2026-10-27 11:05',
    invoiceRef: 'INV-2026-1048'
  },
  {
    id: 'TXN-994099',
    name: 'Tally Multi-User Gold Cloud + TSS Sync',
    accountName: 'SawanSukha Jewellers',
    invoiceNumber: 'INV-2026-1047',
    invoiceDate: '2026-10-12',
    status: 'paid',
    receivedAmount: '₹22,500',
    pendingPayment: '₹0',
    expectedPaymentDate: '2026-10-22',
    paymentMethod: 'Razorpay UPI Gateway',
    paymentReceivedDate: '2026-10-26',
    // Aliases
    customer: 'Rajesh Agrawal',
    company: 'SawanSukha Jewellers',
    amount: '₹22,500',
    method: 'Razorpay UPI Gateway',
    date: '2026-10-26 18:40',
    invoiceRef: 'INV-2026-1047'
  },
  {
    id: 'TXN-994098',
    name: 'Tally Prime Single User Silver License',
    accountName: 'Kolkata Health Diagnostics',
    invoiceNumber: 'INV-2026-1046',
    invoiceDate: '2026-10-10',
    status: 'paid',
    receivedAmount: '₹6,500',
    pendingPayment: '₹0',
    expectedPaymentDate: '2026-10-20',
    paymentMethod: 'Corporate Visa Card',
    paymentReceivedDate: '2026-10-25',
    // Aliases
    customer: 'Dr. Suniti Mukherjee',
    company: 'Kolkata Health Diagnostics',
    amount: '₹6,500',
    method: 'Corporate Visa Card',
    date: '2026-10-25 09:15',
    invoiceRef: 'INV-2026-1046'
  },
  {
    id: 'TXN-994097',
    name: 'High-Mem Cloud VPS Node Hypervisor Cluster',
    accountName: 'Eastern Metal Refineries',
    invoiceNumber: 'INV-2026-1045',
    invoiceDate: '2026-10-18',
    status: 'partial',
    receivedAmount: '₹20,000',
    pendingPayment: '₹14,000',
    expectedPaymentDate: '2026-10-31',
    paymentMethod: 'RTGS Bank Transfer',
    paymentReceivedDate: '2026-10-24',
    // Aliases
    customer: 'Vikram Burman',
    company: 'Eastern Metal Refineries',
    amount: '₹20,000',
    method: 'RTGS Bank Transfer',
    date: '2026-10-24 16:30',
    invoiceRef: 'INV-2026-1045'
  },
  {
    id: 'TXN-994096',
    name: 'Tally Single User Silver Annual Maintenance Pack',
    accountName: 'Heritage Tea & Spice Exporters',
    invoiceNumber: 'INV-2026-1044',
    invoiceDate: '2026-10-16',
    status: 'pending',
    receivedAmount: '₹0',
    pendingPayment: '₹6,500',
    expectedPaymentDate: '2026-11-05',
    paymentMethod: 'NEFT Bank Transfer',
    paymentReceivedDate: '—',
    // Aliases
    customer: 'Subrata Mukherjee',
    company: 'Heritage Tea & Spice Exporters',
    amount: '₹6,500',
    method: 'NEFT Bank Transfer',
    date: '2026-10-21 11:15',
    invoiceRef: 'INV-2026-1044'
  },
  {
    id: 'TXN-994095',
    name: 'CtrlS Kolkata Enterprise Cloud Node Q4 Settlement',
    accountName: 'Eastern Freight Movers',
    invoiceNumber: 'INV-2026-1043',
    invoiceDate: '2026-10-11',
    status: 'pending',
    receivedAmount: '₹0',
    pendingPayment: '₹14,000',
    expectedPaymentDate: '2026-11-02',
    paymentMethod: 'Cheque Clearance',
    paymentReceivedDate: '—',
    // Aliases
    customer: 'Pradip Sen',
    company: 'Eastern Freight Movers',
    amount: '₹14,000',
    method: 'Cheque Clearance',
    date: '2026-10-18 15:45',
    invoiceRef: 'INV-2026-1043'
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

// Telemetry & Financial Analytics Constants
export const FINANCIAL_METRICS = {
  totalReceived: '₹28,65,000',
  totalDue: '₹4,82,000',
  totalBilled: '₹33,47,000',
  collectionRate: '85.6%',
  activeMRR: '₹99,000',
  arrValue: '₹1.84 Cr'
};

// Monthly Total Sales Data for Graph (6 Months)
export const MONTHLY_SALES_DATA = [
  { month: 'May', sales: 1480000, label: '₹14.8 L', growth: '+11.2%' },
  { month: 'Jun', sales: 1720000, label: '₹17.2 L', growth: '+16.2%' },
  { month: 'Jul', sales: 1950000, label: '₹19.5 L', growth: '+13.4%' },
  { month: 'Aug', sales: 2210000, label: '₹22.1 L', growth: '+13.3%' },
  { month: 'Sep', sales: 2540000, label: '₹25.4 L', growth: '+14.9%' },
  { month: 'Oct', sales: 2865000, label: '₹28.65 L', growth: '+12.8%' }
];

// Yearly Total Sales Data for Graph (12 Months)
export const YEARLY_SALES_DATA = [
  { month: 'Nov', sales: 1120000, label: '₹11.2 L', growth: '+8.4%' },
  { month: 'Dec', sales: 1250000, label: '₹12.5 L', growth: '+11.6%' },
  { month: 'Jan', sales: 1310000, label: '₹13.1 L', growth: '+4.8%' },
  { month: 'Feb', sales: 1380000, label: '₹13.8 L', growth: '+5.3%' },
  { month: 'Mar', sales: 1620000, label: '₹16.2 L', growth: '+17.4%' },
  { month: 'Apr', sales: 1420000, label: '₹14.2 L', growth: '-12.3%' },
  { month: 'May', sales: 1480000, label: '₹14.8 L', growth: '+4.2%' },
  { month: 'Jun', sales: 1720000, label: '₹17.2 L', growth: '+16.2%' },
  { month: 'Jul', sales: 1950000, label: '₹19.5 L', growth: '+13.4%' },
  { month: 'Aug', sales: 2210000, label: '₹22.1 L', growth: '+13.3%' },
  { month: 'Sep', sales: 2540000, label: '₹25.4 L', growth: '+14.9%' },
  { month: 'Oct', sales: 2865000, label: '₹28.65 L', growth: '+12.8%' }
];

// Revenue Breakdown by Product Category for Donut / Pie Chart
export const CATEGORY_REVENUE_PIE = [
  {
    name: 'Tally Prime & Customization',
    percentage: 42,
    amount: '₹12,03,300',
    color: '#6366f1',
    lightColor: '#e0e7ff'
  },
  {
    name: 'Dedicated Cloud VPS',
    percentage: 33,
    amount: '₹9,45,450',
    color: '#0ea5e9',
    lightColor: '#e0f2fe'
  },
  {
    name: 'Managed IT & Security',
    percentage: 15,
    amount: '₹4,29,750',
    color: '#10b981',
    lightColor: '#d1fae5'
  },
  {
    name: 'WhatsApp & Add-on Tools',
    percentage: 10,
    amount: '₹2,86,500',
    color: '#f59e0b',
    lightColor: '#fef3c7'
  }
];
