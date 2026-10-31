// Mock data for Net Infotech System (NIS) ERP & Accounting Platform

export const COMPANY_INFO = {
  name: "Net Infotech System Pvt. Ltd.",
  shortName: "NISPL",
  tagline: "Smart IT Solutions for a Digital Future",
  gstin: "19AABCN4321Q1ZM",
  phone: "+91 9330113000",
  landline: "033 - 4004 1899",
  email: "info@netinfotechsystem.com",
  directEmail: "nghosal@netinfotechsystem.com",
  supportEmail: "support@netinfotechsystem.com",
  address: "Webel Tower 1, IT Park, BN Block, Sector V, Salt Lake City, Kolkata, West Bengal, India",
  pinCode: "700091",
  businessHours: "Monday – Saturday: 10:00 AM – 7:00 PM",
  experienceYears: "25+",
  tallyPartnerStatus: "3 Years Certified Tally Partner",
};

export const INITIAL_METRICS = {
  totalSales: 1245000,
  totalPurchases: 782000,
  receivables: 345000,
  payables: 218000,
  cashBalance: 182500,
  bankBalance: 845000,
  salesGrowth: "+14.8%",
  purchasesControl: "-3.2%",
  activeCustomers: 142,
  activeVendors: 68,
};

export const INITIAL_TRANSACTIONS = [
  {
    id: 1,
    date: "05 Oct 2026",
    invoiceNo: "INV-1024",
    party: "ABC Traders",
    gstin: "27AAACR1234M1Z2",
    type: "Sales",
    amount: 45000,
    status: "Paid",
    dueDate: "20 Oct 2026",
    paymentMode: "UPI / NEFT",
    category: "Hardware",
  },
  {
    id: 2,
    date: "04 Oct 2026",
    invoiceNo: "PUR-2081",
    party: "XYZ Suppliers",
    gstin: "29AADCB4567K1Z8",
    type: "Purchase",
    amount: 32500,
    status: "Pending",
    dueDate: "18 Oct 2026",
    paymentMode: "Bank Transfer",
    category: "Raw Material",
  },
  {
    id: 3,
    date: "03 Oct 2026",
    invoiceNo: "INV-1023",
    party: "Global Enterprises",
    gstin: "07AAGFG7890P1ZQ",
    type: "Sales",
    amount: 72800,
    status: "Paid",
    dueDate: "15 Oct 2026",
    paymentMode: "Cheque (HDFC)",
    category: "IT Solutions",
  },
  {
    id: 4,
    date: "02 Oct 2026",
    invoiceNo: "REC-3012",
    party: "Kaveri Technologies",
    gstin: "33AAECK5544N1ZV",
    type: "Receipt",
    amount: 28000,
    status: "Paid",
    dueDate: "02 Oct 2026",
    paymentMode: "IMPS",
    category: "Services",
  },
  {
    id: 5,
    date: "01 Oct 2026",
    invoiceNo: "PAY-4055",
    party: "Apex Logistics India",
    gstin: "27AABCA3322R1Z1",
    type: "Payment",
    amount: 14200,
    status: "Paid",
    dueDate: "01 Oct 2026",
    paymentMode: "Net Banking",
    category: "Freight",
  },
  {
    id: 6,
    date: "29 Sep 2026",
    invoiceNo: "INV-1022",
    party: "Siddhivinayak Retail",
    gstin: "27AAZCS9988D1Z9",
    type: "Sales",
    amount: 58900,
    status: "Pending",
    dueDate: "14 Oct 2026",
    paymentMode: "Credit (15 Days)",
    category: "Consumer Goods",
  },
  {
    id: 7,
    date: "28 Sep 2026",
    invoiceNo: "PUR-2080",
    party: "Delta Manufacturing Co.",
    gstin: "24AAACD1122E1Z5",
    type: "Purchase",
    amount: 95000,
    status: "Overdue",
    dueDate: "25 Sep 2026",
    paymentMode: "LC / Escrow",
    category: "Machinery Parts",
  },
  {
    id: 8,
    date: "27 Sep 2026",
    invoiceNo: "INV-1021",
    party: "Hindustan Solutions",
    gstin: "19AABCH6677F1Z3",
    type: "Sales",
    amount: 115000,
    status: "Paid",
    dueDate: "10 Oct 2026",
    paymentMode: "RTGS",
    category: "Enterprise License",
  },
];

export const INITIAL_PRODUCTS = [
  {
    sku: "NIS-PRD-001",
    name: "Enterprise ERP Cloud License",
    category: "Software",
    hsn: "998314",
    purchasePrice: 18000,
    sellingPrice: 28000,
    stock: 85,
    minStock: 20,
    gst: 18,
    status: "In Stock",
    unit: "User / Year",
  },
  {
    sku: "NIS-PRD-002",
    name: "Thermal Barcode POS Printer 80mm",
    category: "Hardware",
    hsn: "844332",
    purchasePrice: 4200,
    sellingPrice: 6500,
    stock: 34,
    minStock: 10,
    gst: 18,
    status: "In Stock",
    unit: "Pcs",
  },
  {
    sku: "NIS-PRD-003",
    name: "2D Wireless Barcode Scanner",
    category: "Hardware",
    hsn: "847160",
    purchasePrice: 1950,
    sellingPrice: 3200,
    stock: 6,
    minStock: 15,
    gst: 18,
    status: "Low Stock",
    unit: "Pcs",
  },
  {
    sku: "NIS-PRD-004",
    name: "GST e-Invoicing & e-Way API Pack",
    category: "Software Add-on",
    hsn: "998313",
    purchasePrice: 2500,
    sellingPrice: 4999,
    stock: 120,
    minStock: 25,
    gst: 18,
    status: "In Stock",
    unit: "Credits Pack",
  },
  {
    sku: "NIS-PRD-005",
    name: "Biometric Attendance Terminal",
    category: "Hardware",
    hsn: "854370",
    purchasePrice: 6800,
    sellingPrice: 9800,
    stock: 0,
    minStock: 5,
    gst: 18,
    status: "Out of Stock",
    unit: "Pcs",
  },
  {
    sku: "NIS-PRD-006",
    name: "High-Speed Thermal Paper Rolls (Pack of 50)",
    category: "Consumables",
    hsn: "481190",
    purchasePrice: 650,
    sellingPrice: 1100,
    stock: 45,
    minStock: 12,
    gst: 12,
    status: "In Stock",
    unit: "Boxes",
  },
  {
    sku: "NIS-PRD-007",
    name: "Accounting Ledger Data Migration Service",
    category: "Services",
    hsn: "998311",
    purchasePrice: 3500,
    sellingPrice: 8500,
    stock: 99,
    minStock: 10,
    gst: 18,
    status: "In Stock",
    unit: "Per Company",
  },
];

export const INITIAL_CUSTOMERS = [
  { id: "CUST-01", name: "ABC Traders", gstin: "27AAACR1234M1Z2", phone: "+91 98201 12345", city: "Mumbai", balance: 45000, state: "Maharashtra" },
  { id: "CUST-02", name: "Global Enterprises", gstin: "07AAGFG7890P1ZQ", phone: "+91 98110 54321", city: "New Delhi", balance: 0, state: "Delhi" },
  { id: "CUST-03", name: "Kaveri Technologies", gstin: "33AAECK5544N1ZV", phone: "+91 94440 98765", city: "Chennai", balance: 18500, state: "Tamil Nadu" },
  { id: "CUST-04", name: "Siddhivinayak Retail", gstin: "27AAZCS9988D1Z9", phone: "+91 99220 33445", city: "Pune", balance: 58900, state: "Maharashtra" },
  { id: "CUST-05", name: "Hindustan Solutions", gstin: "19AABCH6677F1Z3", phone: "+91 98300 22114", city: "Kolkata", balance: 0, state: "West Bengal" },
];

export const INITIAL_SUPPLIERS = [
  { id: "SUPP-01", name: "XYZ Suppliers", gstin: "29AADCB4567K1Z8", phone: "+91 98450 11223", city: "Bengaluru", balance: 32500, state: "Karnataka" },
  { id: "SUPP-02", name: "Apex Logistics India", gstin: "27AABCA3322R1Z1", phone: "+91 98200 44556", city: "Navi Mumbai", balance: 14200, state: "Maharashtra" },
  { id: "SUPP-03", name: "Delta Manufacturing Co.", gstin: "24AAACD1122E1Z5", phone: "+91 97230 77889", city: "Ahmedabad", balance: 95000, state: "Gujarat" },
  { id: "SUPP-04", name: "Sun Micro Components", gstin: "36AABCS4455M1Z7", phone: "+91 99880 99001", city: "Hyderabad", balance: 41000, state: "Telangana" },
];

export const TIME_SERIES_ANALYTICS = {
  "7 Days": [
    { label: "Mon", sales: 125000, purchases: 78000, expenses: 22000, profit: 25000 },
    { label: "Tue", sales: 185000, purchases: 94000, expenses: 18000, profit: 73000 },
    { label: "Wed", sales: 142000, purchases: 81000, expenses: 19500, profit: 41500 },
    { label: "Thu", sales: 210000, purchases: 110000, expenses: 24000, profit: 76000 },
    { label: "Fri", sales: 275000, purchases: 145000, expenses: 31000, profit: 99000 },
    { label: "Sat", sales: 198000, purchases: 120000, expenses: 20000, profit: 58000 },
    { label: "Sun", sales: 110000, purchases: 54000, expenses: 12000, profit: 44000 },
  ],
  "30 Days": [
    { label: "Week 1", sales: 310000, purchases: 195000, expenses: 45000, profit: 70000 },
    { label: "Week 2", sales: 285000, purchases: 180000, expenses: 38000, profit: 67000 },
    { label: "Week 3", sales: 365000, purchases: 220000, expenses: 52000, profit: 93000 },
    { label: "Week 4", sales: 285000, purchases: 187000, expenses: 42000, profit: 56000 },
  ],
  "3 Months": [
    { label: "Aug 2026", sales: 1080000, purchases: 720000, expenses: 140000, profit: 220000 },
    { label: "Sep 2026", sales: 1190000, purchases: 750000, expenses: 155000, profit: 285000 },
    { label: "Oct 2026", sales: 1245000, purchases: 782000, expenses: 162000, profit: 301000 },
  ],
  "6 Months": [
    { label: "May", sales: 940000, purchases: 610000, expenses: 125000, profit: 205000 },
    { label: "Jun", sales: 990000, purchases: 650000, expenses: 130000, profit: 210000 },
    { label: "Jul", sales: 1040000, purchases: 690000, expenses: 138000, profit: 212000 },
    { label: "Aug", sales: 1080000, purchases: 720000, expenses: 140000, profit: 220000 },
    { label: "Sep", sales: 1190000, purchases: 750000, expenses: 155000, profit: 285000 },
    { label: "Oct", sales: 1245000, purchases: 782000, expenses: 162000, profit: 301000 },
  ],
  "1 Year": [
    { label: "Q1 FY26", sales: 2850000, purchases: 1820000, expenses: 380000, profit: 650000 },
    { label: "Q2 FY26", sales: 3120000, purchases: 1980000, expenses: 410000, profit: 730000 },
    { label: "Q3 FY26", sales: 3450000, purchases: 2190000, expenses: 445000, profit: 815000 },
    { label: "Q4 FY26 (Est)", sales: 3800000, purchases: 2350000, expenses: 480000, profit: 970000 },
  ],
};

export const REPORT_P_AND_L = {
  operatingRevenue: [
    { item: "Domestic Sales Revenue", amount: 1185000 },
    { item: "Export & Service Revenue", amount: 60000 },
  ],
  costOfGoodsSold: [
    { item: "Opening Stock", amount: 240000 },
    { item: "Purchases of Goods", amount: 782000 },
    { item: "Direct Wages & Labour", amount: 48000 },
    { item: "Freight & Carriage Inward", amount: 24000 },
    { item: "Less: Closing Stock", amount: -280000 },
  ],
  operatingExpenses: [
    { item: "Staff Salaries & Allowances", amount: 75000 },
    { item: "Rent & Office Utilities", amount: 32000 },
    { item: "Cloud Server & IT Software", amount: 18500 },
    { item: "Audit & Professional Fees", amount: 15000 },
    { item: "Marketing & Customer Outreach", amount: 21500 },
  ],
};

export const REPORT_BALANCE_SHEET = {
  assets: {
    fixed: [
      { item: "Computer & Server Equipment", amount: 320000 },
      { item: "Office Furniture & Fixtures", amount: 110000 },
      { item: "Software Intellectual Property", amount: 250000 },
    ],
    current: [
      { item: "Cash in Vault / Hand", amount: 182500 },
      { item: "Bank Balance (HDFC & SBI)", amount: 845000 },
      { item: "Sundry Debtors (Receivables)", amount: 345000 },
      { item: "Closing Inventory at Cost", amount: 280000 },
      { item: "GST Input Tax Credit (ITC)", amount: 94200 },
    ],
  },
  liabilities: {
    capital: [
      { item: "Promoter Capital Account", amount: 1200000 },
      { item: "Retained Earnings / Surplus", amount: 788700 },
    ],
    current: [
      { item: "Sundry Creditors (Payables)", amount: 218000 },
      { item: "GST Output Tax Liability", amount: 142000 },
      { item: "Outstanding Expenses Payable", amount: 78000 },
    ],
  },
};

export const GST_SLABS = [
  { rate: 0, label: "0% (Exempt)" },
  { rate: 5, label: "5% (Standard Essential)" },
  { rate: 12, label: "12% (Standard Medium)" },
  { rate: 18, label: "18% (Standard Services/Goods)" },
  { rate: 28, label: "28% (Luxury / De-merit)" },
];

export const OVERVIEW_CARDS = [
  {
    id: "sales",
    title: "Sales Management",
    shortTitle: "Sales",
    subtitle: "Invoices, Quotations, POS, Challans",
    metric: "₹12,45,000",
    change: "+14.8%",
    isPositive: true,
    description: "Generate compliant tax invoices, delivery challans, and manage customer receivables effortlessly.",
    icon: "ReceiptIndianRupee",
    color: "#2563EB",
    gradient: "linear-gradient(135deg, #1239A6, #2563EB)",
    tabKey: "accounting",
    subKey: "sales",
  },
  {
    id: "purchases",
    title: "Purchases & Vendor Bills",
    shortTitle: "Purchases",
    subtitle: "Vendor Bills, POs, GRN Verification",
    metric: "₹7,82,000",
    change: "-3.2%",
    isPositive: true,
    description: "Record supplier invoices with automated 2B ITC reconciliation and vendor payment schedules.",
    icon: "ShoppingBag",
    color: "#4F46E5",
    gradient: "linear-gradient(135deg, #4338CA, #6366F1)",
    tabKey: "accounting",
    subKey: "purchases",
  },
  {
    id: "expenses",
    title: "Expenses & Petty Cash",
    shortTitle: "Expenses",
    subtitle: "Direct & Indirect Overhead Control",
    metric: "₹1,62,000",
    change: "+1.5%",
    isPositive: false,
    description: "Categorize operational expenditure, track vouchers, and maintain strict petty cash control.",
    icon: "CreditCard",
    color: "#7C3AED",
    gradient: "linear-gradient(135deg, #6D28D9, #9333EA)",
    tabKey: "accounting",
    subKey: "dayBook",
  },
  {
    id: "receivables",
    title: "Accounts Receivable",
    shortTitle: "Receivables",
    subtitle: "Customer Aging & Outstanding Reminders",
    metric: "₹3,45,000",
    change: "18 Invoices",
    isPositive: true,
    description: "Track overdue balances, send automated payment reminders on WhatsApp/Email, and reduce DSO.",
    icon: "ArrowDownLeft",
    color: "#059669",
    gradient: "linear-gradient(135deg, #047857, #10B981)",
    tabKey: "parties",
    subKey: "customers",
  },
  {
    id: "payables",
    title: "Accounts Payable",
    shortTitle: "Payables",
    subtitle: "Vendor Outstandings & Due Dates",
    metric: "₹2,18,000",
    change: "Due in 7 Days",
    isPositive: false,
    description: "Manage vendor cashflow, avoid late fees, and claim prompt payment discounts smoothly.",
    icon: "ArrowUpRight",
    color: "#D97706",
    gradient: "linear-gradient(135deg, #B45309, #F59E0B)",
    tabKey: "parties",
    subKey: "suppliers",
  },
  {
    id: "cash-bank",
    title: "Cash & Bank Accounts",
    shortTitle: "Cash & Bank",
    subtitle: "Real-Time Balances & Reconciliation",
    metric: "₹10,27,500",
    change: "Live Feeds",
    isPositive: true,
    description: "Instant one-click bank reconciliation with HDFC, ICICI, SBI, Axis and cash vault monitoring.",
    icon: "Building2",
    color: "#0284C7",
    gradient: "linear-gradient(135deg, #0369A1, #0EA5E9)",
    tabKey: "accounting",
    subKey: "ledger",
  },
  {
    id: "inventory",
    title: "Inventory & Warehouses",
    shortTitle: "Inventory",
    subtitle: "Stock Tracking, HSN, Low-Stock Alerts",
    metric: "7 Items (1 Low)",
    change: "94% Optimal",
    isPositive: true,
    description: "Multi-warehouse stock movements, batch/expiry control, auto-reorder points, and live valuations.",
    icon: "Boxes",
    color: "#C026D3",
    gradient: "linear-gradient(135deg, #A21CAF, #D946EF)",
    tabKey: "inventory",
    subKey: "products",
  },
  {
    id: "reports",
    title: "Financial & Tax Reports",
    shortTitle: "Reports",
    subtitle: "P&L, Balance Sheet, GST 1 & 3B",
    metric: "12 Reports",
    change: "Audit Ready",
    isPositive: true,
    description: "Generate instant Balance Sheets, Profit & Loss, Trial Balances, and ready-to-file GST summaries.",
    icon: "FileSpreadsheet",
    color: "#E11D48",
    gradient: "linear-gradient(135deg, #BE123C, #F43F5E)",
    tabKey: "reports",
    subKey: "pl",
  },
];

// ===================================================
// 6 CORE PRODUCTS & SERVICES (Exact User Specification)
// ===================================================
export const CORE_SERVICES = [
  {
    id: "tally-prime",
    number: "01",
    title: "Tally Prime",
    tagline: "Accounting, GST, inventory management, billing, business reporting - TallyPrime solutions.",
    description: "Complete business financial operations with India's most trusted accounting software. Certified implementation, customized invoicing formats, and comprehensive staff training.",
    icon: "Calculator",
    color: "#0284C7",
    gradient: "linear-gradient(135deg, #0284C7, #0369A1)",
    features: [
      "TallyPrime licensing (Silver / Gold / Multi-user)",
      "Tally implementation and on-site support",
      "GST, e-Way Bill and accounting setup",
      "Business reporting, MIS customization and staff training"
    ],
    popular: true,
    badge: "Tally 3-Star Partner"
  },
  {
    id: "tally-on-cloud",
    number: "02",
    title: "Tally on Cloud",
    tagline: "Anywhere access - cloud-based Tally hosting solutions.",
    description: "Access your company accounts from your home, branch offices, or mobile devices 24/7 with zero lag, 99.9% uptime, and military-grade automated backups.",
    icon: "Cloud",
    color: "#7C3AED",
    gradient: "linear-gradient(135deg, #7C3AED, #5B21B6)",
    features: [
      "Tally on Cloud quick setup & zero data loss migration",
      "Secure remote access across Windows, Mac, Linux & mobile",
      "High-speed cloud server management & resource scaling",
      "Automated daily encrypted backup and 24/7 technical support"
    ],
    popular: true,
    badge: "99.99% Uptime"
  },
  {
    id: "data-center-cloud",
    number: "03",
    title: "Data Center, Cloud Server & Hosting",
    tagline: "Business applications, websites workloads - cloud infrastructure & hosting solutions.",
    description: "Scalable enterprise data center hosting powered by top-tier Tier-4 architecture, Microsoft Azure, and AWS with managed disaster recovery and pro-active monitoring.",
    icon: "Server",
    color: "#2563EB",
    gradient: "linear-gradient(135deg, #2563EB, #1D4ED8)",
    features: [
      "High-performance cloud server deployment & optimization",
      "Managed Windows and Linux enterprise hosting",
      "Microsoft Azure and AWS multi-cloud architecture",
      "Seamless cloud migration, load balancing & 24/7 management"
    ],
    popular: false,
    badge: "Tier-4 Infrastructure"
  },
  {
    id: "it-infra-security",
    number: "04",
    title: "IT Infrastructure & Security",
    tagline: "Business IT infrastructure - setup, management, monitoring & protection.",
    description: "Complete turnkey IT setup for offices, corporate branches, and server rooms. Protect your digital assets against ransomware, unauthorized access, and hardware failure.",
    icon: "ShieldCheck",
    color: "#059669",
    gradient: "linear-gradient(135deg, #059669, #047857)",
    features: [
      "Server and structured network management (LAN/WAN/VPN)",
      "Next-Gen Firewall, UTM & endpoint antivirus security",
      "CCTV surveillance, biometric access and enterprise Wi-Fi",
      "Microsoft 365 licensing, IT AMC & managed IT services"
    ],
    popular: false,
    badge: "Total Security"
  },
  {
    id: "it-repair-maintenance",
    number: "05",
    title: "IT Product Repair & Maintenance",
    tagline: "Desktop, laptop, printer, server & IT equipment - repair & maintenance services.",
    description: "Certified component-level repair and preventative maintenance for all corporate IT hardware with rapid SLA turnaround times and genuine replacement parts.",
    icon: "Wrench",
    color: "#D97706",
    gradient: "linear-gradient(135deg, #D97706, #B45309)",
    features: [
      "Rapid hardware troubleshooting & chip-level diagnostics",
      "Corporate laptop and desktop repair & screen replacement",
      "Server, NAS and network device maintenance & BIOS updates",
      "Preventive maintenance contracts & on-site technical support"
    ],
    popular: false,
    badge: "Quick SLA"
  },
  {
    id: "it-sales-rental",
    number: "06",
    title: "IT Product Sales & Rental",
    tagline: "Business requirements - IT hardware sales & rental services.",
    description: "Cost-effective short-term and long-term hardware rental programs, along with authorized sales of leading brand laptops, enterprise servers, and networking equipment.",
    icon: "Laptop",
    color: "#EA580C",
    gradient: "linear-gradient(135deg, #EA580C, #C2410C)",
    features: [
      "High-spec laptop and desktop rental for projects & events",
      "Enterprise server, switch and networking equipment leases",
      "Heavy-duty printer and peripheral rental programs",
      "Authorized IT hardware procurement with manufacturer warranty",
      "Flexible short-term and long-term rental agreements"
    ],
    popular: false,
    badge: "Flexible Terms"
  }
];

// ===================================================
// OUR SOLUTIONS (Exact User Specification)
// ===================================================
export const OUR_SOLUTIONS = [
  {
    id: "business-websites",
    title: "Business Websites",
    description: "Modern, ultra-fast, responsive corporate websites engineered to convert visitors into loyal clients. Built with SEO best practices and seamless mobile compatibility.",
    icon: "Globe",
    features: ["Custom UI/UX Design", "Mobile-First Architecture", "SEO & Speed Optimized", "CMS / Admin Dashboard"]
  },
  {
    id: "ecommerce",
    title: "E-Commerce Solutions",
    description: "Robust e-Commerce stores with payment gateway integrations, real-time inventory synchronization, order management, and automated GST billing.",
    icon: "ShoppingBag",
    features: ["Payment Gateway Setup", "Tally & ERP Inventory Sync", "Secure Checkout", "Order & Shipping Tracking"]
  },
  {
    id: "custom-software",
    title: "Custom Software",
    description: "Tailor-made web and desktop software developed specifically for your industry workflows, billing needs, CRM, and internal operational automation.",
    icon: "Code2",
    features: ["Bespoke Architecture", "Role-Based Permissions", "API & Third-party Sync", "Scalable Database Systems"]
  },
  {
    id: "digital-solutions",
    title: "Digital Solutions",
    description: "Comprehensive digital transformation packages including Microsoft 365, Google Workspace, cloud backups, remote work setup, and digital marketing.",
    icon: "Zap",
    features: ["Cloud Office Suites", "Data Migration Services", "Cyber Security Audits", "24/7 Digital Support"]
  }
];

// ===================================================
// WHY CHOOSE US (The 4 Pillars from User Specification)
// ===================================================
export const WHY_CHOOSE_US = [
  {
    id: "team",
    title: "Professional Team",
    desc: "Over 50+ certified IT engineers, Tally implementation experts, and cloud architects with deep domain knowledge.",
    icon: "Users",
    stat: "50+ Experts"
  },
  {
    id: "quality",
    title: "Quality Solutions",
    desc: "Certified Tally 3-Star Partner and ISO 27001 standard adherence ensures robust, secure, and bug-free deployments.",
    icon: "Award",
    stat: "Tally 3-Star"
  },
  {
    id: "delivery",
    title: "On-Time Delivery",
    desc: "Structured project management methodologies with strict timelines, zero unexpected delays, and smooth onboarding.",
    icon: "Clock",
    stat: "99.8% On-Time"
  },
  {
    id: "support",
    title: "Customer Support",
    desc: "Dedicated support desk at Webel IT Park, Salt Lake Sector V with guaranteed phone, remote, and on-site assistance.",
    icon: "Headphones",
    stat: "24/7 Available"
  }
];

// ===================================================
// PORTFOLIO / CLIENT TRANSFORMATIONS
// ===================================================
export const PORTFOLIO_CASES = [
  {
    id: 1,
    client: "Eastern Steel & Alloys Ltd.",
    category: "Tally on Cloud & ERP",
    result: "Unified 6 manufacturing plants into a centralized Tally on Cloud system with zero downtime and real-time inventory tracking.",
    metric: "40% Faster Billing",
    industry: "Manufacturing"
  },
  {
    id: 2,
    client: "Kolkata Mega Retailers Network",
    category: "IT Infrastructure & Security",
    result: "Deployed Next-Gen Firewalls, managed Wi-Fi, and 12-location POS terminal hardware rental across Bengal outlets.",
    metric: "99.99% Uptime",
    industry: "Retail & Supply"
  },
  {
    id: 3,
    client: "CarePlus Diagnostic Centers",
    category: "Cloud Server & Hosting",
    result: "Migrated on-premise medical records to secure AWS cloud server with automated encrypted daily backups.",
    metric: "100% HIPAA Ready",
    industry: "Healthcare"
  },
  {
    id: 4,
    client: "Bengal Logistic Freight Corp",
    category: "Custom Software & Web Portal",
    result: "Developed automated e-Way bill and consignment tracking system integrated seamlessly with TallyPrime.",
    metric: "3,000+ Daily Bills",
    industry: "Logistics"
  }
];

// ===================================================
// OUR CLIENTS DATA
// ===================================================
export const OUR_CLIENTS_DATA = [
  {
    id: 1,
    name: "Tata Steel",
    category: "Steel & Manufacturing",
    logoText: "TATA STEEL",
    shortCode: "TATA",
    logoColor: "#0052CC",
    location: "Jamshedpur & Kolkata",
    serviceUsed: "Enterprise Tally & Server AMC",
    partnership: "Enterprise Client",
    quote: "Centralized multi-plant inventory, GST compliance, and high-availability IT infrastructure.",
    badge: "Enterprise Partner"
  },
  {
    id: 2,
    name: "L&T (Larsen & Toubro)",
    category: "Engineering & Construction",
    logoText: "L&T",
    shortCode: "L&T",
    logoColor: "#005691",
    location: "Kolkata & Pan-India",
    serviceUsed: "IT Infrastructure & Workstation Rental",
    partnership: "Enterprise Client",
    quote: "End-to-end IT deployment, high-performance workstation rentals, and on-site SLA operations.",
    badge: "Tier-1 Partner"
  },
  {
    id: 3,
    name: "Bengal Faith Hospital",
    category: "Healthcare & Medical",
    logoText: "BENGAL FAITH",
    shortCode: "BFH",
    logoColor: "#059669",
    location: "Burdwan & Kolkata, WB",
    serviceUsed: "Hospital IT Security & Cloud Backup",
    partnership: "Healthcare Partner",
    quote: "24/7 high-reliability server management, cloud backup, and medical data infrastructure.",
    badge: "24/7 Active SLA"
  },
  {
    id: 4,
    name: "4 Star International",
    category: "International Trade & Logistics",
    logoText: "4 STAR INT.",
    shortCode: "4STAR",
    logoColor: "#D97706",
    location: "Kolkata, WB",
    serviceUsed: "Tally on Cloud & Multi-User ERP",
    partnership: "Corporate Client",
    quote: "Seamless multi-branch accounting access and secure remote desktop infrastructure.",
    badge: "Multi-Branch Cloud"
  },
  {
    id: 5,
    name: "Kawasaki Solar",
    category: "Renewable Energy & Solar",
    logoText: "KAWASAKI SOLAR",
    shortCode: "SOLAR",
    logoColor: "#16A34A",
    location: "West Bengal & Odisha",
    serviceUsed: "Custom ERP Sync & Hardware Support",
    partnership: "Energy Sector Client",
    quote: "Integrated financial reporting and robust hardware maintenance across site offices.",
    badge: "Green Energy IT"
  },
  {
    id: 6,
    name: "State Fisheries Development Corporation",
    category: "Government & Public Sector",
    logoText: "STATE FISHERIES",
    shortCode: "SFDC",
    logoColor: "#0284C7",
    location: "Govt. of West Bengal",
    serviceUsed: "Licensed Tally Solutions & AMC",
    partnership: "Govt. Enterprise",
    quote: "Certified Tally implementation, inventory tracking, and annual maintenance contracts.",
    badge: "Government Sector"
  },
  {
    id: 7,
    name: "Tea Board of India",
    category: "Government & Statutory Body",
    logoText: "TEA BOARD",
    shortCode: "TEA BOARD",
    logoColor: "#15803D",
    location: "Kolkata (Headquarters)",
    serviceUsed: "IT Infrastructure & Security AMC",
    partnership: "Statutory Enterprise",
    quote: "Complete IT infrastructure planning, hardware support, and network maintenance.",
    badge: "National Body"
  },
  {
    id: 8,
    name: "ITC Limited",
    category: "FMCG & Conglomerate",
    logoText: "ITC LIMITED",
    shortCode: "ITC",
    logoColor: "#B91C1C",
    location: "Kolkata Headquarters",
    serviceUsed: "Cloud Hosting & Hardware Services",
    partnership: "Enterprise Client",
    quote: "Mission-critical hardware maintenance, cloud server architecture, and rapid tech support.",
    badge: "Fortune Partner"
  },
  {
    id: 9,
    name: "National Cooperative Housing Society",
    category: "Cooperative & Real Estate",
    logoText: "NATIONAL COOP",
    shortCode: "NCHS",
    logoColor: "#7C3AED",
    location: "West Bengal Circle",
    serviceUsed: "Tally Accounting & Member Billing",
    partnership: "Cooperative Client",
    quote: "Automated billing systems, GST return filing modules, and dedicated helpdesk support.",
    badge: "Co-op Housing SLA"
  }
];


