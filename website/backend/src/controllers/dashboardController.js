import mongoose from 'mongoose';
import Customer, { getCustomersFromFile } from '../models/Customer.js';
import Contract, { getContractsFromFile } from '../models/Contract.js';
import Payment, { getPaymentsFromFile } from '../models/Payment.js';
import { normalizeContractStatus } from '../utils/contractVocabulary.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/** The Indian financial year opens on 1 April, so month index 3 starts the window. */
const FISCAL_START_MONTH = 3;

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Palette for the solution-share donut; categories are named by the ledger, not here. */
const SOLUTION_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#a855f7', '#ef4444', '#14b8a6', '#f97316'];

const PERIOD_SUFFIX = { monthly: 'MoM', quarterly: 'QoQ', yearly: 'YoY' };

/** Parse currency string like "₹15,000", "₹ 1,80,000", "15000" into raw integer number */
function parseRupee(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num);
}

/** Format number into Indian Rupee format e.g. 2865000 -> "₹28,65,000" */
function formatRupee(num) {
  if (!num && num !== 0) return '₹0';
  return '₹' + Math.round(num).toLocaleString('en-IN');
}

/** Format into Lakhs or Crores for chart labels */
function formatLakhCrore(num) {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  return `₹${(num / 100000).toFixed(2)} L`;
}

/** Date objects, "2026-10-31" and ISO timestamps all appear in the ledger. */
function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value).trim());
  return Number.isNaN(date.getTime()) ? null : date;
}

/** The day money counts for: the day it landed, else the day it was invoiced. */
const collectionDate = (p) => toDate(p.paymentReceivedDate || p.invoiceDate || p.date || p.createdAt);

/** The day an unsettled invoice is judged against: when it is expected, else issued. */
const billingDate = (p) => toDate(p.expectedPaymentDate || p.invoiceDate || p.date || p.createdAt);

const accountStartDate = (c) => toDate(c.createdAt || c.registered);

function fiscalWindow(fy) {
  const startYear = parseInt(String(fy || '').slice(0, 4), 10) || new Date().getFullYear();
  return {
    startYear,
    label: `FY ${startYear}-${String(startYear + 1).slice(-2)}`,
    start: new Date(startYear, FISCAL_START_MONTH, 1),
    end: new Date(startYear + 1, FISCAL_START_MONTH, 0, 23, 59, 59, 999)
  };
}

/**
 * The buckets the sales curve is drawn against. A financial year that is still
 * running stops at the current month, so the curve never plots months that have
 * not happened yet.
 */
function buildBuckets(window, period, now) {
  const months = [];
  for (let i = 0; i < 12; i += 1) {
    const start = new Date(window.startYear, FISCAL_START_MONTH + i, 1);
    months.push({
      label: MONTH_LABELS[start.getMonth()],
      start,
      end: new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999)
    });
  }

  const isRunning = window.start <= now && window.end >= now;
  const visible = isRunning ? months.filter((month) => month.start <= now) : months;

  if (period === 'yearly') {
    return [{ label: window.label, start: window.start, end: window.end }];
  }

  if (period === 'quarterly') {
    const quarters = [];
    for (let i = 0; i < visible.length; i += 3) {
      const slice = visible.slice(i, i + 3);
      quarters.push({
        label: `Q${Math.floor(i / 3) + 1}`,
        start: slice[0].start,
        end: slice[slice.length - 1].end
      });
    }
    return quarters;
  }

  return visible;
}

const bucketIndexFor = (buckets, date) =>
  buckets.findIndex((bucket) => date && date >= bucket.start && date <= bucket.end);

const isReceived = (p) => {
  const status = (p.status || '').toLowerCase();
  return status === 'received' || status === 'cleared';
};

const isPending = (p) => {
  const status = (p.status || '').toLowerCase();
  return status === 'pending' || status === 'overdue';
};

const receivedAmount = (p) => parseRupee(p.receivedAmount) || parseRupee(p.amount) || 0;
const pendingAmount = (p) => parseRupee(p.pendingPayment) || parseRupee(p.amount) || 0;

/**
 * What a payment was actually spent on. The line items freeze the catalogue
 * category at the moment of sale, so the division split reads those instead of
 * trusting `solutionCategory`, which carries a schema default rather than a
 * decision anyone made.
 */
function solutionOf(payment) {
  const items = Array.isArray(payment.items) ? payment.items : [];
  const weighable = items.filter((item) => parseRupee(item.finalPrice) || parseRupee(item.basePrice) > 0);
  if (!weighable.length) return [{ name: 'Not categorised', amount: receivedAmount(payment) }];

  const weights = weighable.map((item) => parseRupee(item.finalPrice) || parseRupee(item.basePrice) * (item.quantity || 1));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const amount = receivedAmount(payment);

  return weighable.map((item, idx) => ({
    name: String(item.category || '').trim() || 'Not categorised',
    amount: totalWeight > 0 ? Math.round((amount * weights[idx]) / totalWeight) : Math.round(amount / weighable.length)
  }));
}

/** Signed percentage change, or null when there is no baseline to compare with. */
function changeFromPrevious(previous, current) {
  if (!previous || previous <= 0) return null;
  const pct = ((current - previous) / previous) * 100;
  return {
    value: parseFloat(pct.toFixed(1)),
    direction: pct >= 0 ? 'up' : 'down'
  };
}

export const getDashboardOverview = async (req, res) => {
  try {
    const { period = 'monthly', fy = '2026-2027' } = req.query;

    let customers = [];
    let contracts = [];
    let payments = [];

    if (isMongoConnected()) {
      customers = await Customer.find({}).lean();
      contracts = await Contract.find({}).lean();
      payments = await Payment.find({}).lean();
    } else {
      customers = getCustomersFromFile();
      contracts = getContractsFromFile();
      payments = getPaymentsFromFile();
    }

    const window = fiscalWindow(fy);
    const now = new Date();
    const buckets = buildBuckets(window, period, now);
    const inWindow = (date) => date && date >= window.start && date <= window.end;

    // 1. Customer pipeline
    const activeCustomers = customers.filter((c) => (c.status || '').toLowerCase() === 'active');
    const demoCustomers = customers.filter((c) => (c.status || '').toLowerCase() === 'demo');
    const inactiveCustomers = customers.filter((c) => {
      const status = (c.status || '').toLowerCase();
      return status === 'inactive' || status === 'suspended';
    });
    const accountsAddedInWindow = customers.filter((c) => inWindow(accountStartDate(c))).length;

    // 2. Recurring revenue: only what an account actually pays each month.
    // This is the run-rate as of today, so it does not move with the selected
    // financial year — the accounts are live now, and history is not stored.
    const activeMRR = activeCustomers.reduce((sum, c) => sum + parseRupee(c.mrr), 0);

    const inProgressContracts = contracts.filter((c) => normalizeContractStatus(c.status) === 'In Progress');
    const contractCommitments = inProgressContracts.reduce(
      (sum, c) => sum + parseRupee(c.totalContractValue || c.value),
      0
    );

    // Annual value = annualised monthly retainers plus live contract commitments
    const totalARR = activeMRR * 12 + contractCommitments;
    const arrInCrores = parseFloat((totalARR / 10000000).toFixed(2));

    // 3. Collections and dues inside the selected financial year
    const receivedList = payments.filter((p) => isReceived(p) && inWindow(collectionDate(p)));
    const pendingList = payments.filter((p) => isPending(p) && inWindow(billingDate(p)));

    const receivedNumeric = receivedList.reduce((sum, p) => sum + receivedAmount(p), 0);
    const dueNumeric = pendingList.reduce((sum, p) => sum + pendingAmount(p), 0);

    const totalBilled = receivedNumeric + dueNumeric;
    const settledRatio = totalBilled > 0 ? (receivedNumeric / totalBilled) * 100 : 0;

    const collectionMethods = [...new Set(
      receivedList.map((p) => String(p.paymentMethod || p.method || '').trim()).filter(Boolean)
    )];

    // 4. Sales curve: money received per bucket, straight off the ledger
    const bucketTotals = buckets.map(() => 0);
    payments.forEach((p) => {
      if (!isReceived(p)) return;
      const stamp = collectionDate(p);
      // A receipt stamped ahead of today is still cash in hand, and the curve
      // never draws a month that has not arrived, so it joins the current
      // period. Without this the curve would quietly drop the money the card
      // counts and the two totals would disagree.
      const dated = stamp && stamp > now ? now : stamp;
      const idx = bucketIndexFor(buckets, dated);
      if (idx !== -1) bucketTotals[idx] += receivedAmount(p);
    });

    const points = buckets.map((bucket, idx) => {
      const change = idx > 0 ? changeFromPrevious(bucketTotals[idx - 1], bucketTotals[idx]) : null;
      return {
        month: bucket.label,
        sales: bucketTotals[idx],
        label: formatLakhCrore(bucketTotals[idx]),
        growth: change ? `${change.direction === 'up' ? '+' : '-'}${Math.abs(change.value)}%` : null
      };
    });

    const latestPoint = points[points.length - 1] || null;
    const previousPoint = points.length > 1 ? points[points.length - 2] : null;
    const trend = latestPoint && previousPoint
      ? changeFromPrevious(previousPoint.sales, latestPoint.sales)
      : null;
    const trendSuffix = PERIOD_SUFFIX[period] || PERIOD_SUFFIX.monthly;

    const cumulativeGrossTotal = bucketTotals.reduce((sum, total) => sum + total, 0);
    const cumulativeGross = parseFloat((cumulativeGrossTotal / 10000000).toFixed(2));

    // 5. Revenue share by the solution the money was billed against
    const solutionTally = new Map();
    receivedList.forEach((p) => {
      solutionOf(p).forEach(({ name, amount }) => {
        if (amount <= 0) return;
        const entry = solutionTally.get(name) || { name, amount: 0, invoices: 0 };
        entry.amount += amount;
        entry.invoices += 1;
        solutionTally.set(name, entry);
      });
    });

    const solutionEntries = [...solutionTally.values()].sort((a, b) => b.amount - a.amount);
    const totalSolutionAmount = solutionEntries.reduce((sum, entry) => sum + entry.amount, 0);

    const categories = solutionEntries.map((entry, idx) => ({
      name: entry.name,
      percentage: totalSolutionAmount > 0 ? (entry.amount / totalSolutionAmount) * 100 : 0,
      amount: formatRupee(entry.amount),
      color: SOLUTION_COLORS[idx % SOLUTION_COLORS.length]
    }));

    const periodWord = period === 'yearly' ? 'Annual' : period === 'quarterly' ? 'Quarterly' : 'Monthly';
    const windowRange = buckets.length
      ? `${buckets[0].label} – ${buckets[buckets.length - 1].label}`
      : window.label;

    res.json({
      success: true,
      data: {
        window: { label: window.label, range: windowRange, period },
        kpi: {
          receivedNumeric,
          receivedFormatted: formatRupee(receivedNumeric),
          invoicesCleared: receivedList.length,
          settledPercentage: `${settledRatio.toFixed(1)}% Settled`,
          trendValue: trend ? trend.value : null,
          trendDirection: trend ? trend.direction : null,
          trendSuffix,
          collectionMethods,
          dueNumeric,
          dueFormatted: formatRupee(dueNumeric),
          invoicesPending: pendingList.length,
          dueTag: dueNumeric > 0 ? 'Action Required' : 'Nothing Outstanding',
          arrValueNumeric: arrInCrores,
          arrValueFormatted: `₹${arrInCrores} Cr`,
          activeMRRNumeric: activeMRR,
          activeMRRFormatted: formatRupee(activeMRR),
          contractCommitmentsFormatted: formatRupee(contractCommitments),
          contractsInProgress: inProgressContracts.length,
          totalPipelineCount: customers.length,
          activeCount: activeCustomers.length,
          demoCount: demoCustomers.length,
          inactiveCount: inactiveCustomers.length,
          accountsAdded: accountsAddedInWindow
        },
        salesChart: {
          points,
          // A year with nothing collected is not "verified sales" for its last
          // month — the ledger simply holds nothing.
          periodLabel: cumulativeGrossTotal > 0 && latestPoint
            ? `${latestPoint.month.toUpperCase()} VERIFIED SALES`
            : 'NO BILLING DATA',
          growthLabel: trend
            ? `${trend.direction === 'up' ? '+' : '-'}${Math.abs(trend.value)}% ${trendSuffix}`
            : null,
          cumulativeGross,
          cumulativeGrossFormatted: formatLakhCrore(cumulativeGrossTotal),
          timeframeDescription: `${periodWord} collections recorded in the payment ledger for ${window.label} (${windowRange}).`
        },
        pieChart: {
          total: formatLakhCrore(totalSolutionAmount),
          categories
        },
        counts: {
          customers: customers.length,
          activeCustomers: activeCustomers.length,
          contracts: contracts.length,
          payments: payments.length,
          receivedPayments: receivedList.length,
          pendingPayments: pendingList.length
        }
      }
    });
  } catch (err) {
    console.error('Error in getDashboardOverview:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export default {
  getDashboardOverview
};
