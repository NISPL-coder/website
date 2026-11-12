// Filter options and the payload model for the NISPL Admin Overview.
// Every figure is measured server-side by /api/dashboard/overview; this module
// only carries the filter choices and the shape the page renders before the
// first response arrives.

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

function fiscalLabel(fy) {
  const startYear = parseInt(String(fy || '').slice(0, 4), 10) || new Date().getFullYear();
  return `FY ${startYear}-${String(startYear + 1).slice(-2)}`;
}

/**
 * What the page shows before the API has answered. Nothing here is a guess at
 * the business: the money figures are zero and the charts are empty, which is
 * what the console actually knows until the ledger payload lands.
 */
function pendingOverview(period, fy) {
  const label = fiscalLabel(fy);
  return {
    window: { label, range: label, period },
    kpi: {
      receivedNumeric: 0,
      receivedFormatted: '₹0',
      invoicesCleared: 0,
      settledPercentage: '0.0% Settled',
      trendValue: null,
      trendDirection: null,
      trendSuffix: 'MoM',
      collectionMethods: [],
      dueNumeric: 0,
      dueFormatted: '₹0',
      invoicesPending: 0,
      dueTag: 'Nothing Outstanding',
      arrValueNumeric: 0,
      arrValueFormatted: '₹0 Cr',
      activeMRRNumeric: 0,
      activeMRRFormatted: '₹0',
      contractCommitmentsFormatted: '₹0',
      contractsInProgress: 0,
      totalPipelineCount: 0,
      activeCount: 0,
      demoCount: 0,
      inProgressCount: 0,
      inactiveCount: 0,
      accountsAdded: 0,
      totalRenewals: 0,
      totalAcquisition: 0,
      totalBusiness: 0
    },
    salesChart: {
      points: [],
      periodLabel: 'NO BILLING DATA',
      growthLabel: null,
      cumulativeGross: 0,
      cumulativeGrossFormatted: '₹0',
      timeframeDescription: `Collections recorded in the payment ledger for ${label}.`
    },
    pieChart: { total: '₹0', categories: [] },
    counts: {
      customers: 0,
      activeCustomers: 0,
      contracts: 0,
      payments: 0,
      receivedPayments: 0,
      pendingPayments: 0
    }
  };
}

/**
 * The overview dataset: the API payload untouched, plus the live customer and
 * contract arrays the tables on the same page render.
 */
export function getOverviewFilteredData(
  period = 'monthly',
  fy = '2026-2027',
  customers = [],
  contracts = [],
  apiOverview = null
) {
  const base = apiOverview?.kpi && apiOverview?.salesChart && apiOverview?.pieChart
    ? apiOverview
    : pendingOverview(period, fy);

  return {
    ...base,
    filteredCustomers: customers,
    filteredContracts: contracts
  };
}

export default {
  FINANCIAL_YEARS,
  PERIOD_OPTIONS,
  getOverviewFilteredData
};
