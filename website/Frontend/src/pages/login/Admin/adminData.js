// Mock Datasets & Analytics Telemetry for NISPL Admin Portal

export const INITIAL_CUSTOMERS = [];

export const INITIAL_CONTRACTS = [];

export const INITIAL_PAYMENTS = [];

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

export const INITIAL_RECEIPTS = [];

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
