import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CreditCard,
  Package,
  ReceiptText,
  Plus,
  CheckCircle2,
  ChevronRight,
  Server,
  ArrowUpRight,
  Users,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles,
  XCircle,
  Search,
  Activity,
  Layers,
  ArrowRight,
  Zap,
  Calendar,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { CountUp } from '../../Dashboard/utils/useCountUp';
import {
  PERIOD_OPTIONS,
  FINANCIAL_YEARS,
  getOverviewFilteredData
} from './overviewFilterData';
import { compactSelectStyles } from './reactSelectStyles';
import { dashboardApi } from '../../../services/dashboardApi';
import AdminDataTable from './AdminDataTable';
import DateRangeFilter from './DateRangeFilter';
import RowActionMenu from './RowActionMenu';
import { usePermissions } from './PermissionsContext';
import ViewCustomerModal from './ViewCustomerModal';
import EditCustomerModal from './EditCustomerModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import ViewContractModal from './ViewContractModal';
import EditContractModal from './EditContractModal';
import { generateCustomerPdf } from './utils/generateCustomerPdf';
import { generateContractPdf } from './utils/generateContractPdf';
import { compareDate, compareNumber, compareText, isWithinDateRange } from './adminTableUtils';
import {
  CONTRACT_STATUSES,
  contractStatusTone,
  matchesStatusFilter,
  normalizeContractStatus
} from './contractVocabulary';
import {
  normalizeCustomerLifecycle,
  customerLifecycleLabel,
  customerLifecycleTone
} from '../../../utils/customerLifecycle';

const CUSTOMER_STATUS_FILTERS = [
  { value: 'all', label: 'All Statuses', countKey: 'total' },
  { value: 'inactive', label: 'Inactive', countKey: 'inactive' },
  { value: 'demo', label: 'Demo / Trials', countKey: 'demo' },
  { value: 'inprogress', label: 'In Progress', countKey: 'inprogress' },
  { value: 'active', label: 'Active Only', countKey: 'active' }
];

const CONTRACT_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  ...CONTRACT_STATUSES.map((status) => ({
    value: status.toLowerCase().replace(/\s+/g, ''),
    label: status
  }))
];

// Geometry helper for Donut Pie Chart slices
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

function describeDonutSlice(x, y, innerRadius, outerRadius, startAngle, endAngle) {
  const startOuter = polarToCartesian(x, y, outerRadius, endAngle);
  const endOuter = polarToCartesian(x, y, outerRadius, startAngle);
  const startInner = polarToCartesian(x, y, innerRadius, endAngle);
  const endInner = polarToCartesian(x, y, innerRadius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', startOuter.x, startOuter.y,
    'A', outerRadius, outerRadius, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
    'L', endInner.x, endInner.y,
    'A', innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
    'Z'
  ].join(' ');
}

/** Signed change read off the ledger, or null when there is no baseline period. */
function formatTrend(value, direction, suffix) {
  if (value === null || value === undefined) return null;
  return `${direction === 'down' ? '-' : '+'}${Math.abs(value)}% ${suffix}`;
}

export default function OverviewSection({
  adminName,
  contracts = [],
  setContracts,
  payments = [],
  products = [],
  receipts = [],
  customers = [],
  setCustomers,
  setIsAddContractModalOpen
}) {
  const navigate = useNavigate();
  const { visibleColumns } = usePermissions();

  // Card-specific Date Range Filters (Card 1: Total Received & Dues, Card 2: Inactive Value, Card 4: Total Customers)
  const [receivedRange, setReceivedRange] = useState({ from: '', to: '' });
  const [dueRange, setDueRange] = useState({ from: '', to: '' });
  const [accountsRange, setAccountsRange] = useState({ from: '', to: '' });

  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedFY, setSelectedFY] = useState('2026-2027');
  const [apiOverview, setApiOverview] = useState(null);
  const [apiOverviewError, setApiOverviewError] = useState(null);

  // Fetch dynamic overview metrics directly from backend API
  useEffect(() => {
    let isMounted = true;
    dashboardApi
      .getOverview({
        period: selectedPeriod,
        fy: selectedFY,
        receivedFrom: receivedRange.from,
        receivedTo: receivedRange.to,
        dueFrom: dueRange.from,
        dueTo: dueRange.to,
        accountsFrom: accountsRange.from,
        accountsTo: accountsRange.to
      })
      .then((data) => {
        if (isMounted && data) {
          setApiOverview(data);
        }
      })
      .catch((err) => {
        console.warn('Dashboard overview API note:', err.message);
        if (isMounted) setApiOverviewError(err.message);
      });
    return () => {
      isMounted = false;
    };
  }, [
    receivedRange.from,
    receivedRange.to,
    dueRange.from,
    dueRange.to,
    accountsRange.from,
    accountsRange.to,
    customers.length,
    contracts.length,
    payments.length
  ]);

  // The figures come from the API; the live collections only ride along so the
  // tables on this page have rows to show.
  const activeOverviewData = useMemo(() => {
    return getOverviewFilteredData(selectedPeriod, selectedFY, customers, contracts, apiOverview);
  }, [selectedPeriod, selectedFY, customers, contracts, apiOverview]);

  // Overview Customer List Filter and Search
  const [custSearch, setCustSearch] = useState('');
  const [custStatusFilter, setCustStatusFilter] = useState('all'); // 'all' | 'inactive' | 'demo' | 'inprogress' | 'active'
  const [custDateFrom, setCustDateFrom] = useState('');
  const [custDateTo, setCustDateTo] = useState('');

  // Overview Contract List Filter and Search
  const [contSearch, setContSearch] = useState('');
  const [contStatusFilter, setContStatusFilter] = useState('all'); // 'all' | 'inprogress' | 'notstarted' | 'closed' | 'demo' | 'disabled'
  const [contDateFrom, setContDateFrom] = useState('');
  const [contDateTo, setContDateTo] = useState('');

  // Customer modals state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [isDeletingCustomer, setIsDeletingCustomer] = useState(false);
  const [syncingIds, setSyncingIds] = useState({});

  // Contract modals state
  const [viewingContract, setViewingContract] = useState(null);
  const [editingContract, setEditingContract] = useState(null);
  const [deletingContract, setDeletingContract] = useState(null);
  const [isDeletingContract, setIsDeletingContract] = useState(false);

  // Active chart hover data state
  const [hoveredSalesPoint, setHoveredSalesPoint] = useState(null);
  const [hoveredPieSlice, setHoveredPieSlice] = useState(null);
  const [chartAnimKey, setChartAnimKey] = useState(0);

  // Sync hovered point whenever active overview dataset changes
  useEffect(() => {
    const series = activeOverviewData.salesChart?.points;
    if (series?.length) {
      setHoveredSalesPoint(series[series.length - 1]);
      setChartAnimKey((prev) => prev + 1);
    } else {
      // A year with no billing must not keep the previous selection on screen.
      setHoveredSalesPoint(null);
    }
  }, [activeOverviewData]);

  // Customer status breakdown counts for current filtered view
  const customerCounts = useMemo(() => {
    const list = activeOverviewData.filteredCustomers || [];
    const counts = { total: list.length, active: 0, demo: 0, inprogress: 0, inactive: 0 };
    for (const c of list) {
      const stage = normalizeCustomerLifecycle(c.status);
      if (stage === 'Active') counts.active += 1;
      else if (stage === 'Demo') counts.demo += 1;
      else if (stage === 'InProgress') counts.inprogress += 1;
      else counts.inactive += 1;
    }
    return counts;
  }, [activeOverviewData]);

  const customerStatusOptions = useMemo(
    () =>
      CUSTOMER_STATUS_FILTERS.map((f) => ({
        value: f.value,
        label: `${f.label} (${customerCounts[f.countKey]})`
      })),
    [customerCounts]
  );

  // Filtered customer list for the Overview Customer Table
  const filteredOverviewCustomers = useMemo(() => {
    const list = activeOverviewData.filteredCustomers || [];
    return list.filter((c) => {
      const q = custSearch.toLowerCase();
      const matchesSearch =
        !q ||
        (c.name || '').toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.id || '').toLowerCase().includes(q) ||
        (c.plan && c.plan.toLowerCase().includes(q));

      const stage = normalizeCustomerLifecycle(c.status);
      let matchesStatus = true;
      if (custStatusFilter === 'active') matchesStatus = stage === 'Active';
      else if (custStatusFilter === 'demo') matchesStatus = stage === 'Demo';
      else if (custStatusFilter === 'inprogress') matchesStatus = stage === 'InProgress';
      else if (custStatusFilter === 'inactive') matchesStatus = stage === 'Inactive';

      const matchesDateRange = isWithinDateRange(
        c.registered || c.createdAt || c.lastSyncedAt,
        custDateFrom,
        custDateTo
      );

      return matchesSearch && matchesStatus && matchesDateRange;
    }).sort((a, b) => {
      const dateA = new Date(a.createdAt || a.registered || 0).getTime();
      const dateB = new Date(b.createdAt || b.registered || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });
  }, [activeOverviewData, custSearch, custStatusFilter, custDateFrom, custDateTo]);

  // Filtered contract list for the Overview Contract Table
  const filteredOverviewContracts = useMemo(() => {
    const list = activeOverviewData.filteredContracts || [];
    return list.filter((c) => {
      const q = contSearch.toLowerCase();
      const matchesSearch =
        !q ||
        (c.id || c.contractId || '').toLowerCase().includes(q) ||
        (c.name || '').toLowerCase().includes(q) ||
        (c.company || c.customer || '').toLowerCase().includes(q) ||
        (c.service || '').toLowerCase().includes(q);

      const matchesStatus = matchesStatusFilter(c, contStatusFilter);

      const matchesDateRange = isWithinDateRange(
        c.startDate || c.createdAt || c.expiryDate,
        contDateFrom,
        contDateTo
      );

      return matchesSearch && matchesStatus && matchesDateRange;
    }).sort((a, b) => {
      const dateA = new Date(a.startDate || a.createdAt || 0).getTime();
      const dateB = new Date(b.startDate || b.createdAt || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });
  }, [activeOverviewData, contSearch, contStatusFilter, contDateFrom, contDateTo]);

  // Customer modal handlers
  const handleCustomerUpdated = (updated) => {
    const cId = updated.id || updated.customerId;
    setCustomers((prev) => prev.map((c) => ((c.id === cId || c.customerId === cId) ? updated : c)));
    if (selectedCustomer && (selectedCustomer.id === cId || selectedCustomer.customerId === cId)) {
      setSelectedCustomer(updated);
    }
  };

  const handleConfirmDeleteCustomer = async () => {
    if (!deletingCustomer) return;
    setIsDeletingCustomer(true);
    const cId = deletingCustomer.id || deletingCustomer.customerId;
    try {
      const { customerApi } = await import('../../../services/customerApi');
      await customerApi.deleteCustomer(cId);
      setCustomers((prev) => prev.filter((c) => c.id !== cId && c.customerId !== cId));
      setDeletingCustomer(null);
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
    } finally {
      setIsDeletingCustomer(false);
    }
  };

  const handleRetrySync = async (e, customer) => {
    if (e) e.stopPropagation();
    const custId = customer.id || customer.customerId;
    setSyncingIds((prev) => ({ ...prev, [custId]: true }));
    try {
      const { customerApi } = await import('../../../services/customerApi');
      const res = await customerApi.retrySangamSync(custId);
      if (res.success) {
        setCustomers((prev) => prev.map((c) => (c.id === custId || c.customerId === custId) ? { ...c, sangamCrm: res.sangamCrm } : c));
        if (selectedCustomer && (selectedCustomer.id === custId || selectedCustomer.customerId === custId)) {
          setSelectedCustomer((prev) => ({ ...prev, sangamCrm: res.sangamCrm }));
        }
        toast.success('Synchronized to Sangam CRM!');
      } else {
        toast.error(`Sync failed: ${res.sangamCrm?.syncError || 'Unknown error'}`);
      }
    } catch (err) {
      toast.error(`Sync failed: ${err.message}`);
    } finally {
      setSyncingIds((prev) => ({ ...prev, [custId]: false }));
    }
  };

  // Contract modal handlers
  const getContractId = (row) => row.id || row.contractId;
  const handleContractUpdated = (updated) => {
    const cId = getContractId(updated);
    setContracts((prev) => prev.map((item) => (item.id === cId || item.contractId === cId ? updated : item)));
  };

  const handleConfirmDeleteContract = async () => {
    if (!deletingContract) return;
    setIsDeletingContract(true);
    const cId = getContractId(deletingContract);
    try {
      const { contractApi } = await import('../../../services/contractApi');
      await contractApi.deleteContract(cId);
      setContracts((prev) => prev.filter((item) => (item.id || item.contractId) !== cId));
      setDeletingContract(null);
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
    } finally {
      setIsDeletingContract(false);
    }
  };
  const svgWidth = 620;
  const svgHeight = 220;
  const paddingX = 42;
  const paddingY = 32;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const currentSalesPoints = activeOverviewData.salesChart?.points || [];
  const hasSalesSeries = currentSalesPoints.length > 0;

  const { minSales, maxSales } = useMemo(() => {
    if (!currentSalesPoints.length) return { minSales: 0, maxSales: 0 };
    const values = currentSalesPoints.map((d) => d.sales);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const span = maxVal - minVal || 100000;
    return {
      minSales: Math.max(0, Math.floor((minVal - span * 0.15) / 100000) * 100000),
      maxSales: Math.ceil((maxVal + span * 0.15) / 100000) * 100000
    };
  }, [currentSalesPoints]);

  const points = useMemo(() => {
    if (!currentSalesPoints.length) return [];
    return currentSalesPoints.map((d, i) => {
      const divisor = currentSalesPoints.length > 1 ? currentSalesPoints.length - 1 : 1;
      const x = paddingX + (i / divisor) * chartW;
      const denom = maxSales - minSales || 1;
      const normalizedY = (d.sales - minSales) / denom;
      const y = svgHeight - paddingY - normalizedY * chartH;
      return { x, y, ...d };
    });
  }, [currentSalesPoints, chartW, chartH, paddingX, paddingY, svgHeight, minSales, maxSales]);

  // Curved line generator
  const linePathD = useMemo(() => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) / 2;
      const cy1 = p0.y;
      const cx2 = p0.x + (p1.x - p0.x) / 2;
      const cy2 = p1.y;
      d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  const areaPathD = useMemo(() => {
    if (!linePathD) return '';
    const last = points[points.length - 1];
    const first = points[0];
    const bottomY = svgHeight - paddingY;
    return `${linePathD} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  }, [linePathD, points, svgHeight, paddingY]);

  // Donut slices geometry
  const donutCenter = 110;
  const donutOuterR = 88;
  const donutInnerR = 56;
  const pieCategories = activeOverviewData.pieChart?.categories || [];
  const donutSlices = useMemo(() => {
    let currentAngle = 0;
    const categories = activeOverviewData.pieChart?.categories || [];
    return categories.map((cat) => {
      const angle = (cat.percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;
      return {
        ...cat,
        startAngle,
        endAngle,
        pathD: describeDonutSlice(donutCenter, donutCenter, donutInnerR, donutOuterR, startAngle, endAngle)
      };
    });
  }, [activeOverviewData]);

  const overviewWindowLabel = activeOverviewData.window?.label || selectedFY;

  const parseRupee = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : Math.round(num);
  };

  const isDateInRange = (dateVal, from, to) => {
    if (!from && !to) return true;
    if (!dateVal) return false;
    const d = new Date(dateVal).getTime();
    if (isNaN(d)) return true;
    if (from && d < new Date(from).getTime()) return false;
    if (to && d > new Date(to + 'T23:59:59.999Z').getTime()) return false;
    return true;
  };

  // Card 1: Total Payment Received & Total Dues; Card 2: Inactive Value calculations
  const paymentMetrics = useMemo(() => {
    const list = Array.isArray(payments) ? payments : [];

    // 1. Total Payment Received calculation
    let receivedTotal = 0;
    let clearedCount = 0;
    let totalDues = 0;
    list.forEach((p) => {
      const pDate = p.paymentReceivedDate || p.date || p.createdAt || p.invoiceDate;
      if (!isDateInRange(pDate, receivedRange.from, receivedRange.to)) return;

      const total = parseRupee(p.total || p.totalAmount || p.amount || 0);
      let rec = parseRupee(p.receivedAmount || p.received || 0);
      const st = String(p.status || '').toLowerCase();
      if ((st === 'received' || st === 'cleared') && rec === 0) rec = total;

      if (st === 'received' || st === 'cleared' || rec > 0) {
        receivedTotal += rec;
        clearedCount += 1;
      }

      const explicitPending = parseRupee(p.pendingPayment || p.pending || 0);
      const diff = Math.max(0, total - rec);
      const pendingVal = explicitPending > 0 ? explicitPending : diff;
      if (pendingVal > 0 || ['pending', 'overdue', 'partially paid', 'partial', 'in progress'].includes(st)) {
        totalDues += pendingVal;
      }
    });

    // 2. Inactive Value calculation (Pending / Due balance for Card 2)
    let inactiveTotal = 0;
    let pendingCount = 0;
    list.forEach((p) => {
      const pDate = p.expectedPaymentDate || p.date || p.createdAt || p.invoiceDate;
      if (!isDateInRange(pDate, dueRange.from, dueRange.to)) return;

      const total = parseRupee(p.total || p.totalAmount || p.amount || 0);
      let rec = parseRupee(p.receivedAmount || p.received || 0);
      const st = String(p.status || '').toLowerCase();
      if ((st === 'received' || st === 'cleared') && rec === 0) rec = total;

      const explicitPending = parseRupee(p.pendingPayment || p.pending || 0);
      const diff = Math.max(0, total - rec);
      const pendingVal = explicitPending > 0 ? explicitPending : diff;

      if (pendingVal > 0 || ['pending', 'overdue', 'partially paid', 'partial', 'in progress'].includes(st)) {
        inactiveTotal += pendingVal;
        pendingCount += 1;
      }
    });

    // Fallbacks to API data if no date filter is applied and API returned values
    if (!receivedRange.from && !receivedRange.to && apiOverview?.kpi?.receivedNumeric != null) {
      receivedTotal = apiOverview.kpi.receivedNumeric;
      clearedCount = apiOverview.kpi.invoicesCleared || clearedCount;
      if (totalDues === 0 && apiOverview?.kpi?.dueNumeric != null) {
        totalDues = apiOverview.kpi.dueNumeric;
      }
    }
    if (!dueRange.from && !dueRange.to && apiOverview?.kpi?.dueNumeric != null) {
      inactiveTotal = apiOverview.kpi.dueNumeric;
      pendingCount = apiOverview.kpi.invoicesPending || pendingCount;
    }

    const totalBilled = receivedTotal + totalDues;
    const settledRatio = totalBilled > 0 ? ((receivedTotal / totalBilled) * 100).toFixed(1) : '100.0';

    return {
      receivedTotal,
      clearedCount,
      totalDues,
      inactiveTotal,
      pendingCount,
      settledPercentage: `${settledRatio}% Settled`
    };
  }, [payments, receivedRange, dueRange, apiOverview]);

  // Card 3: Annual Net Revenue (No Date Range)
  const arrMetrics = useMemo(() => {
    const custs = Array.isArray(customers) ? customers : [];
    const ctrs = Array.isArray(contracts) ? contracts : [];

    const activeCusts = custs.filter((c) => normalizeCustomerLifecycle(c.status) === 'Active');
    const activeMRR = activeCusts.reduce((sum, c) => sum + parseRupee(c.mrr || 0), 0);

    const inProgressCtrs = ctrs.filter((c) => {
      const st = normalizeContractStatus(c.status, c);
      return st === 'In Progress';
    });

    const commitments = inProgressCtrs.reduce(
      (sum, c) => sum + parseRupee(c.totalContractValue || c.value || 0),
      0
    );

    let totalARR = activeMRR * 12 + commitments;
    let arrInCrores = parseFloat((totalARR / 10000000).toFixed(2));

    if (apiOverview?.kpi?.arrValueNumeric != null) {
      arrInCrores = apiOverview.kpi.arrValueNumeric;
      totalARR = apiOverview.kpi.totalARR || totalARR;
    }

    return {
      totalARR,
      arrInCrores,
      activeMRR,
      commitments,
      inProgressCount: inProgressCtrs.length
    };
  }, [customers, contracts, apiOverview]);

  // Card 4: Total Accounts
  const accountsMetrics = useMemo(() => {
    const custs = Array.isArray(customers) ? customers : [];
    const filtered = custs.filter((c) => {
      const d = c.createdAt || c.registered || c.lastSyncedAt;
      return isDateInRange(d, accountsRange.from, accountsRange.to);
    });

    let active = 0;
    let inProgress = 0;
    let demo = 0;
    let inactive = 0;

    filtered.forEach((c) => {
      const stage = normalizeCustomerLifecycle(c.status);
      if (stage === 'Active') active += 1;
      else if (stage === 'InProgress') inProgress += 1;
      else if (stage === 'Demo') demo += 1;
      else inactive += 1;
    });

    let total = filtered.length;
    if (!accountsRange.from && !accountsRange.to && apiOverview?.kpi?.totalPipelineCount != null) {
      total = apiOverview.kpi.totalPipelineCount;
      active = apiOverview.kpi.activeCount ?? active;
      inProgress = apiOverview.kpi.inProgressCount ?? inProgress;
      demo = apiOverview.kpi.demoCount ?? demo;
      inactive = apiOverview.kpi.inactiveCount ?? inactive;
    }

    return {
      total,
      active,
      inProgress,
      demo,
      inactive
    };
  }, [customers, accountsRange, apiOverview]);

  const receivedTrend = formatTrend(
    activeOverviewData.kpi.trendValue,
    activeOverviewData.kpi.trendDirection,
    activeOverviewData.kpi.trendSuffix
  );
  const receivedTrendDown = activeOverviewData.kpi.trendDirection === 'down';
  const receivedTrendClass = receivedTrend ? (receivedTrendDown ? 'down' : 'up') : 'neutral';
  // Which rails the money actually came in on, straight from the ledger rows.
  const collectionMethodText = activeOverviewData.kpi.collectionMethods?.length
    ? `Cleared through ${activeOverviewData.kpi.collectionMethods.join(', ')}.`
    : 'Collections recorded against the payment ledger.';
  // What the charts say when there is nothing drawn in them.
  const ledgerNote = apiOverviewError
    ? `Overview metrics unavailable: ${apiOverviewError}`
    : apiOverview
    ? `No billing rows were returned for ${overviewWindowLabel}.`
    : `Reading the payment ledger for ${overviewWindowLabel}…`;

  // Helper for dynamic Y-axis label formatting (Lakhs vs Crores)
  const formatYAxisLabel = (value) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(value / 100000).toFixed(1)} L`;
  };

  const overviewCustomerColumns = [
    {
      id: 'id',
      name: 'Customer ID',
      selector: (row) => row.id,
      sortable: true,
      sortFunction: compareText((row) => row.id),
      width: '135px',
      cell: (cust) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6366f1' }}>{cust.id}</span>
      )
    },
    {
      id: 'company',
      name: 'Organization & Client',
      selector: (row) => row.company,
      sortable: true,
      sortFunction: compareText((row) => row.company),
      minWidth: '190px',
      grow: 1.1,
      cell: (cust) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{cust.company}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{cust.name}</div>
        </div>
      )
    },
    {
      id: 'email',
      name: 'Contact Details',
      selector: (row) => row.email,
      sortable: true,
      sortFunction: compareText((row) => row.email),
      minWidth: '220px',
      grow: 1,
      cell: (cust) => (
        <div>
          <div style={{ fontSize: '0.8rem', color: '#334155' }}>{cust.email}</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{cust.phone}</div>
        </div>
      )
    },
    {
      id: 'plan',
      name: 'Subscribed Plan',
      selector: (row) => row.plan,
      sortable: true,
      sortFunction: compareText((row) => row.plan),
      minWidth: '155px',
      cell: (cust) =>
        cust.plan ? (
          <span className="adm-status-pill info">{cust.plan}</span>
        ) : (
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Not recorded</span>
        )
    },
    {
      id: 'serverNode',
      name: 'Server Node',
      selector: (row) => row.serverNode,
      sortable: true,
      sortFunction: compareText((row) => row.serverNode),
      minWidth: '165px',
      cell: (cust) =>
        cust.serverNode ? (
          <span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{cust.serverNode}</span>
        ) : (
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Not recorded</span>
        )
    },
    {
      id: 'mrr',
      name: 'Monthly MRR',
      selector: (row) => row.mrr,
      sortable: true,
      sortFunction: compareNumber((row) => row.mrr),
      width: '130px',
      cell: (cust) =>
        cust.mrr ? (
          <span style={{ fontWeight: 700, color: '#0f172a' }}>{cust.mrr}</span>
        ) : (
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Not recorded</span>
        )
    },
    {
      id: 'status',
      name: 'Status',
      selector: (row) => row.status,
      sortable: true,
      sortFunction: compareText((row) => row.status),
      minWidth: '160px',
      width: '170px',
      cell: (cust) => {
        const stage = normalizeCustomerLifecycle(cust.status);
        return (
          <span className={`adm-status-pill ${customerLifecycleTone(cust.status)}`}>
            {stage === 'Active' && <CheckCircle2 size={12} />}
            {stage === 'Demo' && <Clock size={12} />}
            {stage === 'InProgress' && <Activity size={12} />}
            {stage === 'Inactive' && <XCircle size={12} />}
            <span>{customerLifecycleLabel(cust.status)}</span>
          </span>
        );
      },
      searchType: 'select'
    },
    {
      id: 'actions',
      name: 'Quick Action',
      center: true,
      width: '120px',
      button: true,
      allowOverflow: true,
      ignoreRowClick: true,
      cell: (cust) => (
        <RowActionMenu
          module="customer"
          onView={() => setSelectedCustomer(cust)}
          onEdit={() => setEditingCustomer(cust)}
          onPrint={() => {
            generateCustomerPdf(cust);
            toast.success(`PDF generated for ${cust.company || cust.name}`);
          }}
          onDelete={() => setDeletingCustomer(cust)}
        />
      )
    }
  ];

  const recentContractColumns = [
    {
      id: 'id',
      name: 'Contract No',
      selector: (row) => row.id,
      sortable: true,
      sortFunction: compareText((row) => row.id),
      width: '140px',
      cell: (c) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.id}</span>
    },
    {
      id: 'company',
      name: 'Customer / Company',
      selector: (row) => row.company,
      sortable: true,
      sortFunction: compareText((row) => row.company),
      minWidth: '185px',
      grow: 1.1,
      cell: (c) => (
        <div>
          <div style={{ fontWeight: 600 }}>{c.company}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.customer}</div>
        </div>
      )
    },
    {
      id: 'service',
      name: 'Service SLA',
      selector: (row) => row.service,
      sortable: true,
      sortFunction: compareText((row) => row.service),
      minWidth: '210px',
      grow: 1,
      cell: (c) => <span style={{ color: '#334155' }}>{c.service}</span>
    },
    {
      id: 'value',
      name: 'Annual Value',
      selector: (row) => row.value,
      sortable: true,
      sortFunction: compareNumber((row) => row.value),
      width: '145px',
      cell: (c) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>{c.value}</span>
      )
    },
    {
      id: 'expiryDate',
      name: 'Expiry Date',
      selector: (row) => row.expiryDate,
      sortable: true,
      sortFunction: compareDate((row) => row.expiryDate),
      width: '130px',
      cell: (c) => (
        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{c.expiryDate}</span>
      )
    },
    {
      id: 'status',
      name: 'Status',
      selector: (row) => normalizeContractStatus(row.status, row),
      sortable: true,
      sortFunction: compareText((row) => normalizeContractStatus(row.status, row)),
      minWidth: '165px',
      width: '180px',
      cell: (c) => {
        const status = normalizeContractStatus(c.status, c);
        const tone = contractStatusTone(status, c);
        return (
          <span className={`adm-status-pill ${tone}`}>
            {tone === 'active' && <CheckCircle2 size={12} />}
            <span>{status}</span>
          </span>
        );
      },
      searchType: 'select'
    },
    {
      id: 'actions',
      name: 'Action',
      center: true,
      width: '120px',
      button: true,
      allowOverflow: true,
      ignoreRowClick: true,
      cell: (c) => (
        <RowActionMenu
          module="contract"
          onView={() => setViewingContract(c)}
          onEdit={() => setEditingContract(c)}
          onPrint={() => {
            generateContractPdf(c);
            toast.success(`PDF generated for ${c.company || c.customer}`);
          }}
          onDelete={() => setDeletingContract(c)}
        />
      )
    }
  ];

  return (
    <div className="adm-overview-container animate-fade-in">
      {/* =========================================================================
         1. TOP EXECUTIVE TELEMETRY HEADER
         ========================================================================= */}
      <div className="adm-overview-header-bar">
        <div className="adm-overview-header-info">
          <div className="adm-overview-eyebrow">
            <Activity size={13} className="adm-eyebrow-icon" />
            <span>EXECUTIVE TELEMETRY</span>
          </div>
          <h1 className="adm-overview-heading">Overview</h1>
          <p className="adm-overview-subheading">
            Consolidated enterprise revenue, subscription collections &amp; cloud infrastructure telemetry.
          </p>
        </div>
      </div>

      {/* =========================================================================
         4. CUSTOMER LIST ON ADMIN OVERVIEW SECTION (WITH COUNT-UP & FILTERING)
         ========================================================================= */}
      <div className="adm-table-card animate-fade-in" style={{ marginBottom: '28px' }}>
        <div className="adm-card-header">
          <div className="adm-card-header-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 className="adm-section-title">Customer List</h2>
              <span className="adm-status-pill info">
                <Users size={12} />
                <span>
                  <CountUp end={customerCounts.total} duration={1200} /> Registered Accounts
                </span>
              </span>
            </div>
            <p className="adm-section-sub">
              View and manage all registered customer accounts.
            </p>
          </div>

          <div className="adm-card-header-action">
            <button
              type="button"
              className="adm-btn-primary"
              onClick={() => navigate('/admin/customer')}
            >
              <span>Manage Customers</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Filter Section: search + status dropdown + date range */}
        <div className="adm-table-toolbar">
          {/* Search Box */}
          <div className="adm-search-box adm-search-box-toolbar">
            <Search size={16} className="adm-search-icon" />
            <input
              type="text"
              placeholder="Search customers or company..."
              value={custSearch}
              onChange={(e) => setCustSearch(e.target.value)}
              className="adm-search-input"
            />
            {custSearch && (
              <button
                type="button"
                className="adm-search-clear"
                aria-label="Clear search"
                onClick={() => setCustSearch('')}
              >
                <XCircle size={14} />
              </button>
            )}
          </div>

          <div className="adm-table-filters" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <DateRangeFilter
              from={custDateFrom}
              to={custDateTo}
              onChange={(from, to) => {
                setCustDateFrom(from);
                setCustDateTo(to);
              }}
            />

            <div className="adm-filter-select-wrap">
              <Select
                styles={compactSelectStyles}
                isSearchable={false}
                options={customerStatusOptions}
                value={
                  customerStatusOptions.find((option) => option.value === custStatusFilter) ||
                  customerStatusOptions[0]
                }
                onChange={(opt) => setCustStatusFilter(opt ? opt.value : 'all')}
                classNamePrefix="react-select"
              />
            </div>
          </div>
        </div>

        <AdminDataTable
          columns={visibleColumns('overview', overviewCustomerColumns)}
          data={filteredOverviewCustomers}
          keyField="id"
          defaultSortFieldId="registered"
          defaultSortAsc={false}
          resetPageToken={`${custSearch}|${custStatusFilter}|${custDateFrom}|${custDateTo}`}
          minWidth={1350}
          noDataMessage="No customer accounts match this filter"
          noDataHint="Try adjusting the status filters or search text."
          ariaLabel="Overview customer accounts"
          scrollHeight="600px"
        />
      </div>

      {/* =========================================================================
         5. RECENT CONTRACT COMMITMENTS TABLE
         ========================================================================= */}
      <div className="adm-table-card">
        <div className="adm-card-header">
          <div className="adm-card-header-info">
            <h2 className="adm-section-title">Contract List</h2>
            <p className="adm-section-sub">
              View and manage all customer contracts and subscriptions.
            </p>
          </div>
          <div className="adm-card-header-action">
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={() => navigate('/admin/customer/contract')}
            >
              <span>View All Contracts</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Filter Section: search + status dropdown + date range */}
        <div className="adm-table-toolbar">
          <div className="adm-search-box adm-search-box-toolbar">
            <Search size={16} className="adm-search-icon" />
            <input
              type="text"
              placeholder="Search by code, company, client..."
              value={contSearch}
              onChange={(e) => setContSearch(e.target.value)}
              className="adm-search-input"
            />
            {contSearch && (
              <button
                type="button"
                className="adm-search-clear"
                aria-label="Clear search"
                onClick={() => setContSearch('')}
              >
                <XCircle size={14} />
              </button>
            )}
          </div>

          <div className="adm-table-filters" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <DateRangeFilter
              from={contDateFrom}
              to={contDateTo}
              onChange={(from, to) => {
                setContDateFrom(from);
                setContDateTo(to);
              }}
            />

            <div className="adm-filter-select-wrap">
              <Select
                styles={compactSelectStyles}
                isSearchable={false}
                options={CONTRACT_STATUS_FILTER_OPTIONS}
                value={
                  CONTRACT_STATUS_FILTER_OPTIONS.find(
                    (option) => option.value === contStatusFilter
                  ) || CONTRACT_STATUS_FILTER_OPTIONS[0]
                }
                onChange={(opt) => setContStatusFilter(opt ? opt.value : 'all')}
                classNamePrefix="react-select"
              />
            </div>
          </div>
        </div>

        <AdminDataTable
          columns={visibleColumns('overview', recentContractColumns)}
          data={filteredOverviewContracts.slice(0, 5)}
          keyField="id"
          defaultSortFieldId="startDate"
          defaultSortAsc={false}
          pagination={false}
          minWidth={1150}
          scrollHeight="clamp(220px, 32vh, 320px)"
          resetPageToken={`${contSearch}|${contStatusFilter}|${contDateFrom}|${contDateTo}`}
          noDataMessage="No recent contracts found"
          noDataHint="Contracts you create will appear here."
          ariaLabel="Recent contract commitments"
          scrollHeight="600px"
        />
      </div>

      {/* =========================================================================
         2. FINANCIAL HIGHLIGHT CARDS: PAYMENT RECEIVED & PAYMENT DUE SECTION
         (2X2 GRID — ONLY BOTTOM-RIGHT BUTTONS ARE CLICKABLE TO NAVIGATE)
         ========================================================================= */}
      <div className="adm-finance-grid">
        {/* CARD 1: TOTAL RECEIVED & TOTAL DUES (TWO PARTS) */}
        <div className="adm-finance-card payment-received">
          <div className="adm-finance-header">
            <div className="adm-finance-badge emerald">
              <CheckCircle2 size={16} />
              <span>{paymentMetrics.settledPercentage}</span>
            </div>
            <DateRangeFilter
              from={receivedRange.from}
              to={receivedRange.to}
              onChange={(from, to) => setReceivedRange({ from, to })}
              compact={true}
              label="Date Range"
            />
          </div>

          <div className="adm-finance-content">
            <div className="adm-dual-metric-row">
              <div className="adm-metric-part">
                <span className="adm-finance-label">Total Received</span>
                <div className="adm-finance-value emerald-val compact-val">
                  ₹<CountUp end={paymentMetrics.receivedTotal} useIndianFormat={true} duration={1400} />
                </div>
              </div>
              <div className="adm-metric-divider" />
              <div className="adm-metric-part">
                <span className="adm-finance-label">Total Dues</span>
                <div className="adm-finance-value amber-val compact-val">
                  ₹<CountUp end={paymentMetrics.totalDues} useIndianFormat={true} duration={1400} />
                </div>
              </div>
            </div>
            <p className="adm-finance-caption">
              {collectionMethodText} Cleared collections &amp; total invoice obligations.
            </p>
          </div>

          <div className="adm-finance-footer">
            <span className="adm-finance-status-tag">
              <span className="adm-dot emerald" />
              <span>
                <CountUp end={paymentMetrics.clearedCount} duration={1200} /> cleared • <CountUp end={paymentMetrics.pendingCount} duration={1200} /> pending
              </span>
            </span>
            <button
              type="button"
              className="adm-finance-link emerald-link"
              onClick={() => navigate('/admin/customer/payment')}
              title="Navigate to Payment Management"
            >
              <span>View Payments</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* CARD 2: INACTIVE VALUE */}
        <div className="adm-finance-card payment-due">
          <div className="adm-finance-header">
            <div className="adm-finance-badge amber">
              <AlertCircle size={16} />
              <span>Pending Balance</span>
            </div>
            <DateRangeFilter
              from={dueRange.from}
              to={dueRange.to}
              onChange={(from, to) => setDueRange({ from, to })}
              compact={true}
              label="Date Range"
            />
          </div>

          <div className="adm-finance-content">
            <span className="adm-finance-label">Inactive Value</span>
            <div className="adm-finance-value amber-val">
              ₹<CountUp end={paymentMetrics.inactiveTotal} useIndianFormat={true} duration={1400} />
            </div>
            <p className="adm-finance-caption">
              Unsettled balances, overdue payments and partial payment differences.
            </p>
          </div>

          <div className="adm-finance-footer">
            <span className="adm-finance-status-tag">
              <span className="adm-dot amber" />
              <span>
                <CountUp end={paymentMetrics.pendingCount} duration={1200} /> invoices awaiting clearance
              </span>
            </span>
            <button
              type="button"
              className="adm-finance-link amber-link"
              onClick={() => navigate('/admin/customer/payment')}
              title="Inspect pending payment dues"
            >
              <span>Inspect Dues</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* CARD 3: ANNUAL NET REVENUE (NO DATE RANGE) */}
        <div className="adm-finance-card mrr-arr">
          <div className="adm-finance-header">
            <div className="adm-finance-badge purple">
              <FileText size={16} />
              <span>Contract ARR</span>
            </div>
            <span className="adm-finance-trend neutral">
              <span>Annualised MRR + commitments</span>
            </span>
          </div>

          <div className="adm-finance-content">
            <span className="adm-finance-label">Annual Net Revenue</span>
            <div className="adm-finance-value purple-val">
              ₹<CountUp end={arrMetrics.arrInCrores} decimals={2} duration={1400} /> Cr
            </div>
            <p className="adm-finance-caption">
              Monthly recurring of{' '}
              <strong>
                ₹<CountUp end={arrMetrics.activeMRR} useIndianFormat={true} duration={1400} />
              </strong>{' '}
              on active accounts plus ₹{arrMetrics.commitments.toLocaleString('en-IN')} of in-progress contracts.
            </p>
          </div>

          <div className="adm-finance-footer">
            <span className="adm-finance-status-tag">
              <span className="adm-dot purple" />
              <CountUp end={arrMetrics.inProgressCount} duration={1200} /> contracts in progress
            </span>
            <button
              type="button"
              className="adm-finance-link purple-link"
              onClick={() => navigate('/admin/customer/contract')}
              title="Navigate to Customer Contracts"
            >
              <span>Contracts</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* CARD 4: TOTAL CUSTOMERS */}
        <div className="adm-finance-card customer-ratio">
          <div className="adm-finance-header">
            <div className="adm-finance-badge blue">
              <Users size={16} />
              <span>Total Customers</span>
            </div>
            <DateRangeFilter
              from={accountsRange.from}
              to={accountsRange.to}
              onChange={(from, to) => setAccountsRange({ from, to })}
              compact={true}
              label="Date Range"
            />
          </div>

          <div className="adm-finance-content">
            <span className="adm-finance-label">Total Customers</span>
            <div className="adm-finance-value blue-val">
              <CountUp end={accountsMetrics.total} duration={1200} /> Customers
            </div>
            <p className="adm-finance-caption">
              <strong style={{ color: '#059669' }}>
                <CountUp end={accountsMetrics.active} duration={1200} /> Active
              </strong>{' '}
              •{' '}
              <strong style={{ color: '#6366f1' }}>
                <CountUp end={accountsMetrics.inProgress} duration={1200} /> In Progress
              </strong>{' '}
              •{' '}
              <strong style={{ color: '#d97706' }}>
                <CountUp end={accountsMetrics.demo} duration={1200} /> Demo Trial
              </strong>{' '}
              •{' '}
              <strong style={{ color: '#64748b' }}>
                <CountUp end={accountsMetrics.inactive} duration={1200} /> Inactive
              </strong>
            </p>
          </div>

          <div className="adm-finance-footer">
            <span className="adm-finance-status-tag">
              <span className="adm-dot blue" />
              <CountUp end={accountsMetrics.total} duration={1200} /> registered customers in range
            </span>
            <button
              type="button"
              className="adm-finance-link blue-link"
              onClick={() => navigate('/admin/customer')}
              title="Navigate to Customer List"
            >
              <span>Customer List</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
         3. INTERACTIVE CHARTS SECTION: ANIMATED TOTAL SALES GRAPH + ANIMATED PIE
         ========================================================================= */}
      <div className="adm-charts-grid">
        {/* CHART 1: TOTAL SALES GRAPH (DYNAMIC ANIMATED DRAW-IN CURVE & MOVEMENT) */}
        <div className="adm-chart-card sales-chart-box">
          <div className="adm-chart-card-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className="adm-chart-title">Total Sales &amp; Revenue Progression</h2>
              </div>
              <p className="adm-chart-sub">
                {activeOverviewData.salesChart.timeframeDescription}
              </p>
            </div>

            <div className="adm-chart-actions">
              <span className="adm-chart-filter-indicator">
                <Filter size={12} />
                <span>
                  {selectedPeriod.toUpperCase()} • {FINANCIAL_YEARS.find((f) => f.id === selectedFY)?.label.replace(' (Current)', '') || selectedFY}
                </span>
              </span>
            </div>
          </div>

          {/* Dynamic Hover Metric Bar */}
          <div className="adm-sales-metric-row">
            <div className="adm-metric-block">
              <span className="adm-metric-caption">
                {hoveredSalesPoint ? `${hoveredSalesPoint.month} Verified Sales` : activeOverviewData.salesChart.periodLabel}
              </span>
              <span className="adm-metric-value">
                {hoveredSalesPoint?.label ||
                  activeOverviewData.salesChart.points[activeOverviewData.salesChart.points.length - 1]?.label ||
                  'No collections'}
              </span>
            </div>
            <div className="adm-metric-block">
              <span className="adm-metric-caption">Growth Velocity</span>
              <span className="adm-metric-growth">
                {hoveredSalesPoint?.growth ||
                  activeOverviewData.salesChart.growthLabel ||
                  `No ${activeOverviewData.kpi.trendSuffix} baseline`}
              </span>
            </div>
            <div className="adm-metric-block">
              <span className="adm-metric-caption">Cumulative Gross Total</span>
              <span className="adm-metric-val-sm">
                ₹<CountUp end={activeOverviewData.salesChart.cumulativeGross} decimals={2} duration={1400} /> Crore
              </span>
            </div>
          </div>

          {/* SVG Area Chart with Animated Movement */}
          {hasSalesSeries ? (
          <div className="adm-svg-chart-wrapper" key={`chart-wrap-${chartAnimKey}`}>
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="adm-sales-svg"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Area Gradient */}
                <linearGradient id="salesAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.38" />
                  <stop offset="65%" stopColor="#818cf8" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                </linearGradient>

                {/* Line Gradient */}
                <linearGradient id="salesLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>

                {/* Drop Shadow for Line */}
                <filter id="lineGlow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#6366f1" floodOpacity="0.35" />
                </filter>
              </defs>

              {/* Horizontal Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const y = paddingY + pct * chartH;
                const value = maxSales - pct * (maxSales - minSales);
                const valueLabel = formatYAxisLabel(value);
                return (
                  <g key={idx}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 4}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="end"
                      fontWeight="500"
                    >
                      {valueLabel}
                    </text>
                  </g>
                );
              })}

              {/* Animated Area Under Curve */}
              <path
                d={areaPathD}
                fill="url(#salesAreaGradient)"
                className="adm-chart-area-path"
              />

              {/* Animated Curved Line (Stroke Draw Animation) */}
              <path
                d={linePathD}
                fill="none"
                stroke="url(#salesLineGradient)"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#lineGlow)"
                className="adm-chart-stroke-path"
              />

              {/* Interactive Data Points with Staggered Entrance & Pulsing Hover */}
              {points.map((pt, idx) => {
                const isHovered = hoveredSalesPoint?.month === pt.month;
                return (
                  <g
                    key={`${selectedPeriod}-${selectedFY}-${idx}`}
                    className="adm-chart-point-group"
                    onMouseEnter={() => setHoveredSalesPoint(pt)}
                    style={{
                      cursor: 'pointer',
                      animationDelay: `${idx * 80 + 300}ms`
                    }}
                  >
                    {/* Hover Reference Vertical Line */}
                    {isHovered && (
                      <line
                        x1={pt.x}
                        y1={paddingY}
                        x2={pt.x}
                        y2={svgHeight - paddingY}
                        stroke="#6366f1"
                        strokeWidth="1.4"
                        strokeDasharray="2 3"
                        className="adm-chart-guide-line"
                      />
                    )}

                    {/* Outer Pulse Radar Beacon */}
                    {isHovered && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="12"
                        fill="#6366f1"
                        className="adm-chart-pulse-radar"
                      />
                    )}

                    {/* Inner Solid Point */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 4.5}
                      fill={isHovered ? '#4338ca' : '#ffffff'}
                      stroke="#6366f1"
                      strokeWidth={isHovered ? 2.8 : 2.4}
                      className="adm-chart-point-circle"
                    />

                    {/* X-axis Month Label */}
                    <text
                      x={pt.x}
                      y={svgHeight - 10}
                      fill={isHovered ? '#4338ca' : '#64748b'}
                      fontSize="10.5"
                      fontWeight={isHovered ? '700' : '500'}
                      textAnchor="middle"
                      className="adm-chart-x-label"
                    >
                      {pt.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          ) : (
            <div className="adm-chart-empty">
              <Activity size={20} />
              <span>{ledgerNote}</span>
            </div>
          )}
        </div>

        {/* CHART 2: PIE / DONUT CHART WITH ROTATIONAL ENTRANCE & EXPANDING SLICES */}
        <div className="adm-chart-card pie-chart-box">
          <div className="adm-chart-card-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className="adm-chart-title">Revenue Share by Solution</h2>
                <span className="adm-status-pill info" style={{ fontSize: '0.7rem' }}>
                  <Layers size={11} />
                  <span>{pieCategories.length} {pieCategories.length === 1 ? 'Category' : 'Categories'}</span>
                </span>
              </div>
              <p className="adm-chart-sub">
                Distribution of gross billings across product divisions.
              </p>
            </div>
          </div>

          {pieCategories.length > 0 ? (
          <div className="adm-donut-flex">
            {/* Interactive Animated SVG Donut */}
            <div className="adm-donut-svg-wrap">
              <svg
                viewBox={`0 0 ${donutCenter * 2} ${donutCenter * 2}`}
                className="adm-donut-svg"
              >
                {donutSlices.map((slice, idx) => {
                  const isHovered = hoveredPieSlice?.name === slice.name;
                  return (
                    <path
                      key={slice.name}
                      d={slice.pathD}
                      fill={slice.color}
                      className="adm-donut-slice"
                      style={{
                        animationDelay: `${idx * 140}ms`,
                        transform: isHovered
                          ? `scale(1.06) translate(-${donutCenter * 0.06}px, -${donutCenter * 0.06}px)`
                          : undefined,
                        opacity: hoveredPieSlice && !isHovered ? 0.4 : 1,
                        filter: isHovered ? `drop-shadow(0 6px 12px ${slice.color}40)` : 'none'
                      }}
                      onMouseEnter={() => setHoveredPieSlice(slice)}
                      onMouseLeave={() => setHoveredPieSlice(null)}
                    />
                  );
                })}

                {/* Donut Center Display with CountUp */}
                <circle cx={donutCenter} cy={donutCenter} r={donutInnerR - 3} fill="#ffffff" className="adm-donut-center-circle" />
                <text
                  x={donutCenter}
                  y={donutCenter - 7}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9.5"
                  fontWeight="600"
                  letterSpacing="0.04em"
                >
                  {hoveredPieSlice
                    ? `${Number(hoveredPieSlice.percentage).toFixed(1)}% SHARE`
                    : 'TOTAL REVENUE'}
                </text>
                <text
                  x={donutCenter}
                  y={donutCenter + 13}
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="13.5"
                  fontWeight="800"
                >
                  {hoveredPieSlice ? hoveredPieSlice.amount : activeOverviewData.pieChart.total}
                </text>
              </svg>
            </div>

            {/* Legend & Breakdown Details with CountUp */}
            <div className="adm-donut-legend">
              {pieCategories.map((cat, idx) => {
                const isHovered = hoveredPieSlice?.name === cat.name;
                return (
                  <div
                    key={idx}
                    className={`adm-donut-legend-item ${isHovered ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredPieSlice(cat)}
                    onMouseLeave={() => setHoveredPieSlice(null)}
                    style={{ animationDelay: `${idx * 100 + 200}ms` }}
                  >
                    <div className="adm-legend-left">
                      <span
                        className="adm-legend-color-dot"
                        style={{ backgroundColor: cat.color }}
                      />
                      <div>
                        <span className="adm-legend-cat-name">{cat.name}</span>
                        <div className="adm-legend-amount">{cat.amount}</div>
                      </div>
                    </div>
                    <span className="adm-legend-pct" style={{ color: cat.color }}>
                      <CountUp end={cat.percentage} decimals={1} duration={1200} />%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          ) : (
            <div className="adm-chart-empty">
              <Layers size={20} />
              <span>{ledgerNote}</span>
            </div>
          )}

          {/* Where the split comes from */}
          <div className="adm-donut-bottom-note">
            <ReceiptText size={14} style={{ color: '#059669' }} />
            <span>
              Split by the product category recorded on each cleared invoice line
              {activeOverviewData.kpi.invoicesCleared
                ? ` (${activeOverviewData.kpi.invoicesCleared} invoices in ${overviewWindowLabel}).`
                : '.'}
            </span>
          </div>
        </div>
      </div>



      {/* View Customer Modal (React Portal) */}
      <ViewCustomerModal
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onEdit={(cust) => {
          setSelectedCustomer(null);
          setEditingCustomer(cust);
        }}
        onRetrySync={handleRetrySync}
        isSyncing={selectedCustomer ? !!syncingIds[selectedCustomer.id || selectedCustomer.customerId] : false}
      />

      {/* Edit Customer Modal */}
      <EditCustomerModal
        customer={editingCustomer}
        isOpen={!!editingCustomer}
        onClose={() => setEditingCustomer(null)}
        onUpdated={handleCustomerUpdated}
      />

      {/* Delete Confirmation Modal (Customer) */}
      <DeleteConfirmModal
        isOpen={!!deletingCustomer}
        title="Delete Customer"
        itemName={deletingCustomer?.company || deletingCustomer?.name || 'this customer'}
        itemType="customer"
        onConfirm={handleConfirmDeleteCustomer}
        onCancel={() => setDeletingCustomer(null)}
        isDeleting={isDeletingCustomer}
      />

      {/* View Contract Modal */}
      <ViewContractModal
        contract={viewingContract}
        isOpen={!!viewingContract}
        onClose={() => setViewingContract(null)}
        onEdit={(c) => {
          setViewingContract(null);
          setEditingContract(c);
        }}
      />

      {/* Edit Contract Modal */}
      <EditContractModal
        contract={editingContract}
        isOpen={!!editingContract}
        onClose={() => setEditingContract(null)}
        onUpdated={handleContractUpdated}
      />

      {/* Delete Confirmation Modal (Contract) */}
      <DeleteConfirmModal
        isOpen={!!deletingContract}
        title="Delete Contract"
        itemName={deletingContract?.company || deletingContract?.customer || 'this contract'}
        itemType="contract"
        onConfirm={handleConfirmDeleteContract}
        onCancel={() => setDeletingContract(null)}
        isDeleting={isDeletingContract}
      />
    </div>
  );
}
