// Analytics, Datasets & Real-time Filter Model for NISPL Admin Overview
// Supports multi-period (Monthly, Quarterly, Yearly) and multi-year (FY 2026-27, FY 2025-26, FY 2024-25)

export const FINANCIAL_YEARS = [
  { id: '2026-2027', label: 'FY 2026-27 (Current)' },
  { id: '2025-2026', label: 'FY 2025-26' },
  { id: '2024-2025', label: 'FY 2024-25' }
];

export const PERIOD_OPTIONS = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'yearly', label: 'Yearly' }
];

// Telemetry datasets mapped across Period x Financial Year matrix
const OVERVIEW_METRICS_MATRIX = {
  '2026-2027': {
    monthly: {
      kpi: {
        receivedNumeric: 2865000,
        receivedFormatted: '₹28,65,000',
        settledPercentage: '99.8% Settled',
        trendReceived: '+18.4% MoM',
        invoicesClearedText: '4 Invoices Cleared & Dispatched',
        dueNumeric: 482000,
        dueFormatted: '₹4,82,000',
        dueTag: 'Action Required',
        invoicesPendingText: '3 Invoices Pending Verification',
        arrValueNumeric: 1.84,
        arrValueFormatted: '₹1.84 Cr',
        activeMRRNumeric: 99000,
        activeMRRFormatted: '₹99,000',
        mrrLabel: 'Monthly Recurring Revenue running at',
        enterpriseSLACount: 5,
        totalPipelineCount: 9,
        activeCount: 4,
        demoCount: 3,
        inactiveCount: 2,
        uptime: 'CtrlS Kolkata 99.99% Uptime'
      },
      salesChart: {
        points: [
          { month: 'May', sales: 1480000, label: '₹14.8 L', growth: '+11.2%' },
          { month: 'Jun', sales: 1720000, label: '₹17.2 L', growth: '+16.2%' },
          { month: 'Jul', sales: 1950000, label: '₹19.5 L', growth: '+13.4%' },
          { month: 'Aug', sales: 2210000, label: '₹22.1 L', growth: '+13.3%' },
          { month: 'Sep', sales: 2540000, label: '₹25.4 L', growth: '+14.9%' },
          { month: 'Oct', sales: 2865000, label: '₹28.65 L', growth: '+12.8%' }
        ],
        periodLabel: 'OCT VERIFIED SALES',
        growthLabel: '+12.8% MoM',
        cumulativeGross: 1.27,
        cumulativeGrossLabel: '₹1.27 Crore',
        timeframeDescription: 'Monthly revenue curve showing October billing progression.'
      },
      pieChart: {
        total: '₹28.65 L',
        categories: [
          { name: 'Tally Prime & Customization', percentage: 42, amount: '₹12,03,300', color: '#6366f1', lightColor: '#e0e7ff' },
          { name: 'Dedicated Cloud VPS', percentage: 33, amount: '₹9,45,450', color: '#0ea5e9', lightColor: '#e0f2fe' },
          { name: 'Managed IT & Security', percentage: 15, amount: '₹4,29,750', color: '#10b981', lightColor: '#d1fae5' },
          { name: 'WhatsApp & Add-on Tools', percentage: 10, amount: '₹2,86,500', color: '#f59e0b', lightColor: '#fef3c7' }
        ]
      }
    },
    quarterly: {
      kpi: {
        receivedNumeric: 8420000,
        receivedFormatted: '₹84,20,000',
        settledPercentage: '98.6% Settled',
        trendReceived: '+22.4% QoQ',
        invoicesClearedText: '14 Invoices Cleared & Dispatched',
        dueNumeric: 950000,
        dueFormatted: '₹9,50,000',
        dueTag: 'Action Required',
        invoicesPendingText: '6 Invoices Pending Verification',
        arrValueNumeric: 1.84,
        arrValueFormatted: '₹1.84 Cr',
        activeMRRNumeric: 297000,
        activeMRRFormatted: '₹2,97,000',
        mrrLabel: 'Quarterly Recurring Collections running at',
        enterpriseSLACount: 5,
        totalPipelineCount: 11,
        activeCount: 5,
        demoCount: 4,
        inactiveCount: 2,
        uptime: 'CtrlS Kolkata 99.98% Uptime'
      },
      salesChart: {
        points: [
          { month: 'Q1 (Apr-Jun)', sales: 5150000, label: '₹51.5 L', growth: '+14.2%' },
          { month: 'Q2 (Jul-Sep)', sales: 6700000, label: '₹67.0 L', growth: '+30.1%' },
          { month: 'Q3 (Oct-Dec)', sales: 8420000, label: '₹84.2 L', growth: '+25.7%' },
          { month: 'Q4 (Jan-Mar)', sales: 9650000, label: '₹96.5 L', growth: '+14.6%' }
        ],
        periodLabel: 'Q3 VERIFIED REVENUE',
        growthLabel: '+25.7% QoQ',
        cumulativeGross: 2.03,
        cumulativeGrossLabel: '₹2.03 Crore',
        timeframeDescription: 'Quarterly consolidated velocity across enterprise contracts.'
      },
      pieChart: {
        total: '₹84.20 L',
        categories: [
          { name: 'Tally Prime & Customization', percentage: 40, amount: '₹33,68,000', color: '#6366f1', lightColor: '#e0e7ff' },
          { name: 'Dedicated Cloud VPS', percentage: 35, amount: '₹29,47,000', color: '#0ea5e9', lightColor: '#e0f2fe' },
          { name: 'Managed IT & Security', percentage: 16, amount: '₹13,47,200', color: '#10b981', lightColor: '#d1fae5' },
          { name: 'WhatsApp & Add-on Tools', percentage: 9, amount: '₹7,57,800', color: '#f59e0b', lightColor: '#fef3c7' }
        ]
      }
    },
    yearly: {
      kpi: {
        receivedNumeric: 31250000,
        receivedFormatted: '₹3,12,50,000',
        settledPercentage: '97.4% Settled',
        trendReceived: '+28.6% YoY',
        invoicesClearedText: '52 Invoices Cleared & Dispatched',
        dueNumeric: 1875000,
        dueFormatted: '₹18,75,000',
        dueTag: 'Action Required',
        invoicesPendingText: '12 Invoices Pending Verification',
        arrValueNumeric: 1.84,
        arrValueFormatted: '₹1.84 Cr',
        activeMRRNumeric: 1188000,
        activeMRRFormatted: '₹11,88,000',
        mrrLabel: 'Annual Cumulative Recurring Velocity at',
        enterpriseSLACount: 5,
        totalPipelineCount: 14,
        activeCount: 7,
        demoCount: 4,
        inactiveCount: 3,
        uptime: 'CtrlS Kolkata 99.99% Uptime'
      },
      salesChart: {
        points: [
          { month: 'Apr', sales: 1420000, label: '₹14.2 L', growth: '+4.2%' },
          { month: 'May', sales: 1480000, label: '₹14.8 L', growth: '+4.2%' },
          { month: 'Jun', sales: 1720000, label: '₹17.2 L', growth: '+16.2%' },
          { month: 'Jul', sales: 1950000, label: '₹19.5 L', growth: '+13.4%' },
          { month: 'Aug', sales: 2210000, label: '₹22.1 L', growth: '+13.3%' },
          { month: 'Sep', sales: 2540000, label: '₹25.4 L', growth: '+14.9%' },
          { month: 'Oct', sales: 2865000, label: '₹28.65 L', growth: '+12.8%' },
          { month: 'Nov (P)', sales: 3020000, label: '₹30.2 L', growth: '+5.4%' },
          { month: 'Dec (P)', sales: 3200000, label: '₹32.0 L', growth: '+6.0%' },
          { month: 'Jan (P)', sales: 3450000, label: '₹34.5 L', growth: '+7.8%' },
          { month: 'Feb (P)', sales: 3600000, label: '₹36.0 L', growth: '+4.3%' },
          { month: 'Mar (P)', sales: 3800000, label: '₹38.0 L', growth: '+5.6%' }
        ],
        periodLabel: 'FY 2026-27 ANNUAL GROSS',
        growthLabel: '+28.6% YoY',
        cumulativeGross: 3.12,
        cumulativeGrossLabel: '₹3.12 Crore',
        timeframeDescription: 'Annual fiscal revenue projection and cumulative SLA realizations.'
      },
      pieChart: {
        total: '₹3.12 Cr',
        categories: [
          { name: 'Tally Prime & Customization', percentage: 44, amount: '₹1,37,50,000', color: '#6366f1', lightColor: '#e0e7ff' },
          { name: 'Dedicated Cloud VPS', percentage: 34, amount: '₹1,06,25,000', color: '#0ea5e9', lightColor: '#e0f2fe' },
          { name: 'Managed IT & Security', percentage: 14, amount: '₹43,75,000', color: '#10b981', lightColor: '#d1fae5' },
          { name: 'WhatsApp & Add-on Tools', percentage: 8, amount: '₹25,00,000', color: '#f59e0b', lightColor: '#fef3c7' }
        ]
      }
    }
  },

  '2025-2026': {
    monthly: {
      kpi: {
        receivedNumeric: 2140000,
        receivedFormatted: '₹21,40,000',
        settledPercentage: '98.2% Settled',
        trendReceived: '+14.6% MoM',
        invoicesClearedText: '3 Invoices Cleared & Dispatched',
        dueNumeric: 380000,
        dueFormatted: '₹3,80,000',
        dueTag: 'Action Required',
        invoicesPendingText: '2 Invoices Pending Verification',
        arrValueNumeric: 1.45,
        arrValueFormatted: '₹1.45 Cr',
        activeMRRNumeric: 78000,
        activeMRRFormatted: '₹78,000',
        mrrLabel: 'Monthly Recurring Revenue running at',
        enterpriseSLACount: 4,
        totalPipelineCount: 7,
        activeCount: 3,
        demoCount: 2,
        inactiveCount: 2,
        uptime: 'CtrlS Kolkata 99.95% Uptime'
      },
      salesChart: {
        points: [
          { month: 'Oct', sales: 1580000, label: '₹15.8 L', growth: '+6.8%' },
          { month: 'Nov', sales: 1680000, label: '₹16.8 L', growth: '+6.3%' },
          { month: 'Dec', sales: 1790000, label: '₹17.9 L', growth: '+6.5%' },
          { month: 'Jan', sales: 1910000, label: '₹19.1 L', growth: '+6.7%' },
          { month: 'Feb', sales: 2020000, label: '₹20.2 L', growth: '+5.8%' },
          { month: 'Mar', sales: 2140000, label: '₹21.4 L', growth: '+5.9%' }
        ],
        periodLabel: 'MAR 2026 VERIFIED SALES',
        growthLabel: '+14.6% MoM',
        cumulativeGross: 1.11,
        cumulativeGrossLabel: '₹1.11 Crore',
        timeframeDescription: 'Audited monthly performance curve for FY 2025-26.'
      },
      pieChart: {
        total: '₹21.40 L',
        categories: [
          { name: 'Tally Prime & Customization', percentage: 46, amount: '₹9,84,400', color: '#6366f1', lightColor: '#e0e7ff' },
          { name: 'Dedicated Cloud VPS', percentage: 30, amount: '₹6,42,000', color: '#0ea5e9', lightColor: '#e0f2fe' },
          { name: 'Managed IT & Security', percentage: 14, amount: '₹2,99,600', color: '#10b981', lightColor: '#d1fae5' },
          { name: 'WhatsApp & Add-on Tools', percentage: 10, amount: '₹2,14,000', color: '#f59e0b', lightColor: '#fef3c7' }
        ]
      }
    },
    quarterly: {
      kpi: {
        receivedNumeric: 6420000,
        receivedFormatted: '₹64,20,000',
        settledPercentage: '97.5% Settled',
        trendReceived: '+18.2% QoQ',
        invoicesClearedText: '11 Invoices Cleared & Dispatched',
        dueNumeric: 740000,
        dueFormatted: '₹7,40,000',
        dueTag: 'Action Required',
        invoicesPendingText: '4 Invoices Pending Verification',
        arrValueNumeric: 1.45,
        arrValueFormatted: '₹1.45 Cr',
        activeMRRNumeric: 234000,
        activeMRRFormatted: '₹2,34,000',
        mrrLabel: 'Quarterly Recurring Collections running at',
        enterpriseSLACount: 4,
        totalPipelineCount: 8,
        activeCount: 4,
        demoCount: 2,
        inactiveCount: 2,
        uptime: 'CtrlS Kolkata 99.95% Uptime'
      },
      salesChart: {
        points: [
          { month: 'Q1 (Apr-Jun)', sales: 4820000, label: '₹48.2 L', growth: '+12.4%' },
          { month: 'Q2 (Jul-Sep)', sales: 5890000, label: '₹58.9 L', growth: '+22.2%' },
          { month: 'Q3 (Oct-Dec)', sales: 6740000, label: '₹67.4 L', growth: '+14.4%' },
          { month: 'Q4 (Jan-Mar)', sales: 7440000, label: '₹74.4 L', growth: '+10.4%' }
        ],
        periodLabel: 'Q4 FY 25-26 REVENUE',
        growthLabel: '+18.2% QoQ',
        cumulativeGross: 2.49,
        cumulativeGrossLabel: '₹2.49 Crore',
        timeframeDescription: 'Audited quarterly performance benchmarks across FY 2025-26.'
      },
      pieChart: {
        total: '₹64.20 L',
        categories: [
          { name: 'Tally Prime & Customization', percentage: 44, amount: '₹28,24,800', color: '#6366f1', lightColor: '#e0e7ff' },
          { name: 'Dedicated Cloud VPS', percentage: 32, amount: '₹20,54,400', color: '#0ea5e9', lightColor: '#e0f2fe' },
          { name: 'Managed IT & Security', percentage: 15, amount: '₹9,63,000', color: '#10b981', lightColor: '#d1fae5' },
          { name: 'WhatsApp & Add-on Tools', percentage: 9, amount: '₹5,77,800', color: '#f59e0b', lightColor: '#fef3c7' }
        ]
      }
    },
    yearly: {
      kpi: {
        receivedNumeric: 24890000,
        receivedFormatted: '₹2,48,90,000',
        settledPercentage: '96.8% Settled',
        trendReceived: '+24.2% YoY',
        invoicesClearedText: '42 Invoices Cleared & Dispatched',
        dueNumeric: 1450000,
        dueFormatted: '₹14,50,000',
        dueTag: 'Action Required',
        invoicesPendingText: '9 Invoices Pending Verification',
        arrValueNumeric: 1.45,
        arrValueFormatted: '₹1.45 Cr',
        activeMRRNumeric: 936000,
        activeMRRFormatted: '₹9,36,000',
        mrrLabel: 'Annual Recurring Velocity audited at',
        enterpriseSLACount: 4,
        totalPipelineCount: 10,
        activeCount: 5,
        demoCount: 3,
        inactiveCount: 2,
        uptime: 'CtrlS Kolkata 99.96% Uptime'
      },
      salesChart: {
        points: [
          { month: 'Apr', sales: 1120000, label: '₹11.2 L', growth: '+8.4%' },
          { month: 'May', sales: 1250000, label: '₹12.5 L', growth: '+11.6%' },
          { month: 'Jun', sales: 1310000, label: '₹13.1 L', growth: '+4.8%' },
          { month: 'Jul', sales: 1380000, label: '₹13.8 L', growth: '+5.3%' },
          { month: 'Aug', sales: 1620000, label: '₹16.2 L', growth: '+17.4%' },
          { month: 'Sep', sales: 1420000, label: '₹14.2 L', growth: '-12.3%' },
          { month: 'Oct', sales: 1480000, label: '₹14.8 L', growth: '+4.2%' },
          { month: 'Nov', sales: 1720000, label: '₹17.2 L', growth: '+16.2%' },
          { month: 'Dec', sales: 1950000, label: '₹19.5 L', growth: '+13.4%' },
          { month: 'Jan', sales: 2210000, label: '₹22.1 L', growth: '+13.3%' },
          { month: 'Feb', sales: 2540000, label: '₹25.4 L', growth: '+14.9%' },
          { month: 'Mar', sales: 2865000, label: '₹28.65 L', growth: '+12.8%' }
        ],
        periodLabel: 'FY 2025-26 AUDITED GROSS',
        growthLabel: '+24.2% YoY',
        cumulativeGross: 2.49,
        cumulativeGrossLabel: '₹2.49 Crore',
        timeframeDescription: 'Audited full fiscal year turnover and cloud cluster billing.'
      },
      pieChart: {
        total: '₹2.49 Cr',
        categories: [
          { name: 'Tally Prime & Customization', percentage: 45, amount: '₹1,12,05,000', color: '#6366f1', lightColor: '#e0e7ff' },
          { name: 'Dedicated Cloud VPS', percentage: 31, amount: '₹77,19,000', color: '#0ea5e9', lightColor: '#e0f2fe' },
          { name: 'Managed IT & Security', percentage: 15, amount: '₹37,35,000', color: '#10b981', lightColor: '#d1fae5' },
          { name: 'WhatsApp & Add-on Tools', percentage: 9, amount: '₹22,41,000', color: '#f59e0b', lightColor: '#fef3c7' }
        ]
      }
    }
  },

  '2024-2025': {
    monthly: {
      kpi: {
        receivedNumeric: 1620000,
        receivedFormatted: '₹16,20,000',
        settledPercentage: '96.5% Settled',
        trendReceived: '+10.2% MoM',
        invoicesClearedText: '3 Invoices Cleared & Dispatched',
        dueNumeric: 290000,
        dueFormatted: '₹2,90,000',
        dueTag: 'Action Required',
        invoicesPendingText: '2 Invoices Pending Verification',
        arrValueNumeric: 1.12,
        arrValueFormatted: '₹1.12 Cr',
        activeMRRNumeric: 58000,
        activeMRRFormatted: '₹58,000',
        mrrLabel: 'Monthly Recurring Revenue running at',
        enterpriseSLACount: 3,
        totalPipelineCount: 5,
        activeCount: 2,
        demoCount: 1,
        inactiveCount: 2,
        uptime: 'CtrlS Kolkata 99.92% Uptime'
      },
      salesChart: {
        points: [
          { month: 'Oct', sales: 1180000, label: '₹11.8 L', growth: '+4.2%' },
          { month: 'Nov', sales: 1250000, label: '₹12.5 L', growth: '+5.9%' },
          { month: 'Dec', sales: 1340000, label: '₹13.4 L', growth: '+7.2%' },
          { month: 'Jan', sales: 1420000, label: '₹14.2 L', growth: '+6.0%' },
          { month: 'Feb', sales: 1510000, label: '₹15.1 L', growth: '+6.3%' },
          { month: 'Mar', sales: 1620000, label: '₹16.2 L', growth: '+7.3%' }
        ],
        periodLabel: 'MAR 2025 VERIFIED SALES',
        growthLabel: '+10.2% MoM',
        cumulativeGross: 0.83,
        cumulativeGrossLabel: '₹83.2 Lakhs',
        timeframeDescription: 'Audited monthly baseline for FY 2024-25.'
      },
      pieChart: {
        total: '₹16.20 L',
        categories: [
          { name: 'Tally Prime & Customization', percentage: 50, amount: '₹8,10,000', color: '#6366f1', lightColor: '#e0e7ff' },
          { name: 'Dedicated Cloud VPS', percentage: 28, amount: '₹4,53,600', color: '#0ea5e9', lightColor: '#e0f2fe' },
          { name: 'Managed IT & Security', percentage: 14, amount: '₹2,26,800', color: '#10b981', lightColor: '#d1fae5' },
          { name: 'WhatsApp & Add-on Tools', percentage: 8, amount: '₹1,29,600', color: '#f59e0b', lightColor: '#fef3c7' }
        ]
      }
    },
    quarterly: {
      kpi: {
        receivedNumeric: 4860000,
        receivedFormatted: '₹48,60,000',
        settledPercentage: '95.8% Settled',
        trendReceived: '+14.5% QoQ',
        invoicesClearedText: '8 Invoices Cleared & Dispatched',
        dueNumeric: 580000,
        dueFormatted: '₹5,80,000',
        dueTag: 'Action Required',
        invoicesPendingText: '3 Invoices Pending Verification',
        arrValueNumeric: 1.12,
        arrValueFormatted: '₹1.12 Cr',
        activeMRRNumeric: 174000,
        activeMRRFormatted: '₹1,74,000',
        mrrLabel: 'Quarterly Recurring Collections running at',
        enterpriseSLACount: 3,
        totalPipelineCount: 6,
        activeCount: 3,
        demoCount: 1,
        inactiveCount: 2,
        uptime: 'CtrlS Kolkata 99.93% Uptime'
      },
      salesChart: {
        points: [
          { month: 'Q1 (Apr-Jun)', sales: 3200000, label: '₹32.0 L', growth: '+10.1%' },
          { month: 'Q2 (Jul-Sep)', sales: 4150000, label: '₹41.5 L', growth: '+29.7%' },
          { month: 'Q3 (Oct-Dec)', sales: 4920000, label: '₹49.2 L', growth: '+18.5%' },
          { month: 'Q4 (Jan-Mar)', sales: 5680000, label: '₹56.8 L', growth: '+15.4%' }
        ],
        periodLabel: 'Q4 FY 24-25 REVENUE',
        growthLabel: '+14.5% QoQ',
        cumulativeGross: 1.80,
        cumulativeGrossLabel: '₹1.80 Crore',
        timeframeDescription: 'Historical quarterly financials across FY 2024-25.'
      },
      pieChart: {
        total: '₹48.60 L',
        categories: [
          { name: 'Tally Prime & Customization', percentage: 48, amount: '₹23,32,800', color: '#6366f1', lightColor: '#e0e7ff' },
          { name: 'Dedicated Cloud VPS', percentage: 29, amount: '₹14,09,400', color: '#0ea5e9', lightColor: '#e0f2fe' },
          { name: 'Managed IT & Security', percentage: 15, amount: '₹7,29,000', color: '#10b981', lightColor: '#d1fae5' },
          { name: 'WhatsApp & Add-on Tools', percentage: 8, amount: '₹3,88,800', color: '#f59e0b', lightColor: '#fef3c7' }
        ]
      }
    },
    yearly: {
      kpi: {
        receivedNumeric: 19540000,
        receivedFormatted: '₹1,95,40,000',
        settledPercentage: '95.2% Settled',
        trendReceived: '+19.8% YoY',
        invoicesClearedText: '28 Invoices Cleared & Dispatched',
        dueNumeric: 1150000,
        dueFormatted: '₹11,50,000',
        dueTag: 'Action Required',
        invoicesPendingText: '5 Invoices Pending Verification',
        arrValueNumeric: 1.12,
        arrValueFormatted: '₹1.12 Cr',
        activeMRRNumeric: 696000,
        activeMRRFormatted: '₹6,96,000',
        mrrLabel: 'Audited Annual Run-Rate volume at',
        enterpriseSLACount: 3,
        totalPipelineCount: 8,
        activeCount: 4,
        demoCount: 2,
        inactiveCount: 2,
        uptime: 'CtrlS Kolkata 99.94% Uptime'
      },
      salesChart: {
        points: [
          { month: 'Apr', sales: 980000, label: '₹9.8 L', growth: '+6.2%' },
          { month: 'May', sales: 1050000, label: '₹10.5 L', growth: '+7.1%' },
          { month: 'Jun', sales: 1170000, label: '₹11.7 L', growth: '+11.4%' },
          { month: 'Jul', sales: 1290000, label: '₹12.9 L', growth: '+10.2%' },
          { month: 'Aug', sales: 1390000, label: '₹13.9 L', growth: '+7.7%' },
          { month: 'Sep', sales: 1470000, label: '₹14.7 L', growth: '+5.7%' },
          { month: 'Oct', sales: 1540000, label: '₹15.4 L', growth: '+4.8%' },
          { month: 'Nov', sales: 1610000, label: '₹16.1 L', growth: '+4.5%' },
          { month: 'Dec', sales: 1770000, label: '₹17.7 L', growth: '+9.9%' },
          { month: 'Jan', sales: 1840000, label: '₹18.4 L', growth: '+3.9%' },
          { month: 'Feb', sales: 1910000, label: '₹19.1 L', growth: '+3.8%' },
          { month: 'Mar', sales: 1954000, label: '₹19.54 L', growth: '+2.3%' }
        ],
        periodLabel: 'FY 2024-25 AUDITED GROSS',
        growthLabel: '+19.8% YoY',
        cumulativeGross: 1.95,
        cumulativeGrossLabel: '₹1.95 Crore',
        timeframeDescription: 'Historical full fiscal year performance for FY 2024-25.'
      },
      pieChart: {
        total: '₹1.95 Cr',
        categories: [
          { name: 'Tally Prime & Customization', percentage: 49, amount: '₹95,74,600', color: '#6366f1', lightColor: '#e0e7ff' },
          { name: 'Dedicated Cloud VPS', percentage: 28, amount: '₹54,71,200', color: '#0ea5e9', lightColor: '#e0f2fe' },
          { name: 'Managed IT & Security', percentage: 15, amount: '₹29,31,000', color: '#10b981', lightColor: '#d1fae5' },
          { name: 'WhatsApp & Add-on Tools', percentage: 8, amount: '₹15,63,200', color: '#f59e0b', lightColor: '#fef3c7' }
        ]
      }
    }
  }
};

// Retrieve consolidated filtered metrics & slice customers/contracts accordingly
export function getOverviewFilteredData(period = 'monthly', fy = '2026-2027', customers = [], contracts = []) {
  const fyData = OVERVIEW_METRICS_MATRIX[fy] || OVERVIEW_METRICS_MATRIX['2026-2027'];
  const metrics = fyData[period] || fyData.monthly;

  // Filter customers based on Financial Year and period
  // FY 2026-27 uses 2026, FY 2025-26 uses 2025, FY 2024-25 uses 2024
  const startYear = parseInt(fy.split('-')[0], 10);
  const endYear = parseInt(fy.split('-')[1], 10);

  // Filter contracts matching the Financial Year
  let filteredContracts = contracts.filter((c) => {
    if (!c.startDate) return true;
    const year = parseInt(c.startDate.split('-')[0], 10);
    return year === startYear || year === endYear;
  });

  if (filteredContracts.length === 0) {
    filteredContracts = contracts.slice(0, metrics.kpi.enterpriseSLACount);
  }

  // Filter customer accounts matching target count
  let targetCustomers = [...customers];
  if (fy === '2025-2026') {
    targetCustomers = customers.slice(0, metrics.kpi.totalPipelineCount);
  } else if (fy === '2024-2025') {
    targetCustomers = customers.slice(0, metrics.kpi.totalPipelineCount);
  } else {
    targetCustomers = customers;
  }

  return {
    ...metrics,
    filteredCustomers: targetCustomers,
    filteredContracts
  };
}

