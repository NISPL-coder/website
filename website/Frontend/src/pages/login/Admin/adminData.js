// Empty starting collections for the admin console. Every list is filled from
// the API; nothing here is sample business data.

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
