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
  Briefcase,
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
  Filter,
  Eye,
  EyeOff,
  Edit3,
  Printer,
  Trash2,
  RotateCw,
  Power,
  Copy,
  Check
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
import { compareDate, compareNumber, compareText, formatStamp, isWithinDateRange } from './adminTableUtils';
import {
  CONTRACT_STATUSES,
  normalizeContractStatus,
  normalizeContractType,
  contractStatusTone,
  contractPersonEmail,
  contractPersonMobile,
  contractActorName,
  formatContractStamp,
  matchesStatusFilter
} from './contractVocabulary';
import {
  normalizeCustomerLifecycle,
  customerLifecycleLabel,
  customerLifecycleTone
} from '../../../utils/customerLifecycle';

function addressPart(cust, key) {
  const fromAddress = cust.address && typeof cust.address === 'object' ? cust.address[key] : '';
  return String(fromAddress || cust[key] || '').trim();
}

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
  const { can, visibleColumns } = usePermissions();

  // Card-specific Date Range Filters (Card 1: Total Amount Received, Card 2: Total Business, Card 4: Total Customers)
  const [receivedRange, setReceivedRange] = useState({ from: '', to: '' });
  const [businessRange, setBusinessRange] = useState({ from: '', to: '' });
  const [accountsRange, setAccountsRange] = useState({ from: '', to: '' });

  // Card 3 Unit Selection ('cr' | 'lakhs' | 'k')
  const [revenueUnit, setRevenueUnit] = useState('cr');

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
        businessFrom: businessRange.from,
        businessTo: businessRange.to,
        dueFrom: businessRange.from,
        dueTo: businessRange.to,
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
    businessRange.from,
    businessRange.to,
    accountsRange.from,
    accountsRange.to,
    selectedPeriod,
    selectedFY,
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
  const [showPasswords, setShowPasswords] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  // Contract modals state
  const [viewingContract, setViewingContract] = useState(null);
  const [editingContract, setEditingContract] = useState(null);
  const [deletingContract, setDeletingContract] = useState(null);
  const [isDeletingContract, setIsDeletingContract] = useState(false);
  const [updatingContractStatusIds, setUpdatingContractStatusIds] = useState({});
  const [syncingContractIds, setSyncingContractIds] = useState({});

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

  const contractStatusFilterOptions = useMemo(() => {
    const list = activeOverviewData.filteredContracts || contracts || [];
    const counts = CONTRACT_STATUSES.reduce((map, status) => {
      const next = { ...map };
      next[status] = list.filter((c) => normalizeContractStatus(c.status, c) === status).length;
      return next;
    }, {});

    return [
      { value: 'all', label: `All Statuses (${list.length})` },
      ...CONTRACT_STATUSES.map((status) => ({
        value: status.toLowerCase().replace(/[\s_-]+/g, ''),
        label: `${status} (${counts[status] || 0})`
      }))
    ];
  }, [activeOverviewData, contracts]);

  const copyToClipboard = (text, key, label = 'Text') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAuthorizeDemoExtension = async (cust) => {
    const daysStr = window.prompt(
      `Authorize demo trial extension for ${cust.name || cust.company} (${cust.email}):\nEnter additional trial days:`,
      '7'
    );
    if (!daysStr) return;
    const days = parseInt(daysStr, 10);
    if (isNaN(days) || days <= 0) {
      toast.error('Please enter a valid positive number of days.');
      return;
    }

    const toastId = toast.loading(`Authorizing ${days} extra trial days for ${cust.email}...`);
    try {
      const { customerApi } = await import('../../../services/customerApi');
      const res = await customerApi.authorizeDemoExtension(cust.id || cust.customerId, days);
      if (res.success && res.customer) {
        handleCustomerUpdated(res.customer);
        toast.success(`Demo trial extension of ${days} days approved!`, { id: toastId });
      } else {
        toast.error(res.message || 'Failed to authorize demo extension', { id: toastId });
      }
    } catch (err) {
      toast.error(`Error: ${err.message}`, { id: toastId });
    }
  };

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
        (c.loginEmail || '').toLowerCase().includes(q) ||
        (c.id || '').toLowerCase().includes(q) ||
        (c.designation || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        addressPart(c, 'city').toLowerCase().includes(q) ||
        addressPart(c, 'state').toLowerCase().includes(q);

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
      const code = (c.id || c.contractId || '').toLowerCase();
      const name = (c.name || '').toLowerCase();
      const company = (c.company || '').toLowerCase();
      const email = contractPersonEmail(c, customers).toLowerCase();
      const mobile = contractPersonMobile(c, customers).toLowerCase();
      const type = normalizeContractType(c.contractType).toLowerCase();
      const amount = String(c.totalContractValue || c.value || '').toLowerCase();

      const matchesSearch =
        !q ||
        code.includes(q) ||
        name.includes(q) ||
        company.includes(q) ||
        email.includes(q) ||
        mobile.includes(q) ||
        type.includes(q) ||
        amount.includes(q);

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
  }, [activeOverviewData, contSearch, contStatusFilter, contDateFrom, contDateTo, customers]);

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
      toast.success(`Customer deleted successfully.`);
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

  const handleQuickContractStatusChange = async (contract, nextStatus) => {
    const cId = getContractId(contract);
    const currentStatus = normalizeContractStatus(contract.status, contract);
    if (nextStatus === currentStatus) return;

    setUpdatingContractStatusIds((prev) => ({ ...prev, [cId]: true }));
    const toastId = toast.loading(`Updating status of "${contract.name || cId}" to ${nextStatus} & syncing Sangam CRM...`);

    // Optimistic UI update
    setContracts((prev) =>
      prev.map((item) =>
        getContractId(item) === cId ? { ...item, status: nextStatus } : item
      )
    );

    try {
      const { contractApi } = await import('../../../services/contractApi');
      const res = await contractApi.updateContract(cId, { status: nextStatus });
      const updated = res.contract || { ...contract, status: nextStatus };

      setContracts((prev) =>
        prev.map((item) =>
          getContractId(item) === cId ? { ...item, ...updated, status: nextStatus } : item
        )
      );

      toast.success(
        `Contract status changed to "${nextStatus}" & synchronized to Sangam CRM!`,
        { id: toastId }
      );
    } catch (err) {
      console.error('Failed to update contract status:', err);
      // Revert on failure
      setContracts((prev) =>
        prev.map((item) =>
          getContractId(item) === cId ? { ...item, status: currentStatus } : item
        )
      );
      toast.error(`Status update failed: ${err.message}`, { id: toastId });
    } finally {
      setUpdatingContractStatusIds((prev) => ({ ...prev, [cId]: false }));
    }
  };

  const handleRetryContractSync = async (e, contract) => {
    if (e) e.stopPropagation();
    const cId = getContractId(contract);
    setSyncingContractIds((prev) => ({ ...prev, [cId]: true }));
    toast.loading(`Synchronizing "${contract.name || cId}" to Sangam CRM Contracts...`, {
      id: `sync-${cId}`
    });

    try {
      const { contractApi } = await import('../../../services/contractApi');
      const res = await contractApi.retrySangamSync(cId);
      if (res.success && res.sangamCrm) {
        setContracts((prev) =>
          prev.map((item) =>
            (item.id === cId || item.contractId === cId)
              ? { ...item, sangamCrm: res.sangamCrm }
              : item
          )
        );
        toast.success(`Synchronized to Sangam CRM! Record ID: ${res.sangamCrm.recordId}`, {
          id: `sync-${cId}`
        });
      } else {
        toast.error(`Sync notice: ${res.message || 'Retry failed'}`, { id: `sync-${cId}` });
      }
    } catch (err) {
      toast.error(`Sync error: ${err.message}`, { id: `sync-${cId}` });
    } finally {
      setSyncingContractIds((prev) => ({ ...prev, [cId]: false }));
    }
  };

  const handleConfirmDeleteContract = async () => {
    if (!deletingContract) return;
    setIsDeletingContract(true);
    const cId = getContractId(deletingContract);
    try {
      const { contractApi } = await import('../../../services/contractApi');
      await contractApi.deleteContract(cId);
      setContracts((prev) => prev.filter((item) => (item.id || item.contractId) !== cId));
      toast.success(`Contract deleted successfully.`);
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

    // Pending payment count
    let pendingCount = 0;
    list.forEach((p) => {
      const pDate = p.expectedPaymentDate || p.date || p.createdAt || p.invoiceDate;
      if (!isDateInRange(pDate, receivedRange.from, receivedRange.to)) return;

      const total = parseRupee(p.total || p.totalAmount || p.amount || 0);
      let rec = parseRupee(p.receivedAmount || p.received || 0);
      const st = String(p.status || '').toLowerCase();
      if ((st === 'received' || st === 'cleared') && rec === 0) rec = total;

      const explicitPending = parseRupee(p.pendingPayment || p.pending || 0);
      const diff = Math.max(0, total - rec);
      const pendingVal = explicitPending > 0 ? explicitPending : diff;

      if (pendingVal > 0 || ['pending', 'overdue', 'partially paid', 'partial', 'in progress'].includes(st)) {
        pendingCount += 1;
      }
    });

    // Fallbacks to API data if no date filter is applied and API returned values
    if (!receivedRange.from && !receivedRange.to) {
      if (apiOverview?.kpi?.receivedNumeric != null) {
        receivedTotal = apiOverview.kpi.receivedNumeric;
        clearedCount = apiOverview.kpi.invoicesCleared || clearedCount;
        if (totalDues === 0 && apiOverview?.kpi?.dueNumeric != null) {
          totalDues = apiOverview.kpi.dueNumeric;
        }
      }
      if (apiOverview?.kpi?.invoicesPending != null) {
        pendingCount = apiOverview.kpi.invoicesPending;
      }
    }

    const totalBilled = receivedTotal + totalDues;
    const settledRatio = totalBilled > 0 ? ((receivedTotal / totalBilled) * 100).toFixed(1) : '100.0';

    return {
      receivedTotal,
      clearedCount,
      totalDues,
      pendingCount,
      settledPercentage: `${settledRatio}% Settled`
    };
  }, [payments, receivedRange, apiOverview]);

  // Card 2: Total Business (Total Renewals & Total Acquisition)
  const businessMetrics = useMemo(() => {
    const custs = Array.isArray(customers) ? customers : [];
    const ctrs = Array.isArray(contracts) ? contracts : [];
    const pymts = Array.isArray(payments) ? payments : [];

    // Map non-demo contracts per customer to identify 1st contract (acquisition) vs subsequent (renewal)
    const contractsByCust = new Map();
    ctrs.forEach((c) => {
      const isDemo =
        Boolean(c.isDemoTrial) ||
        c.contractType === 'Trial' ||
        c.productCategory === 'Trial' ||
        normalizeContractStatus(c.status, c) === 'DEMO';
      if (isDemo) return;
      const key = String(c.customerId || c.accountId || c.email || c.company || c.customer || '')
        .trim()
        .toLowerCase();
      if (!key) return;
      if (!contractsByCust.has(key)) contractsByCust.set(key, []);
      contractsByCust.get(key).push(c);
    });

    let totalRenewals = 0;
    const countedRenewalIds = new Set();

    contractsByCust.forEach((custCtrs) => {
      // Sort by date ascending to isolate initial contract
      custCtrs.sort(
        (a, b) =>
          new Date(a.startDate || a.orderDate || a.createdAt || 0) -
          new Date(b.startDate || b.orderDate || b.createdAt || 0)
      );
      custCtrs.forEach((ctr, idx) => {
        const d = ctr.startDate || ctr.orderDate || ctr.createdAt;
        if (!isDateInRange(d, businessRange.from, businessRange.to)) return;

        const isExplicitRenewal = /renew/i.test(
          ctr.name || ctr.service || ctr.description || ctr.contractType || ''
        );
        if (idx > 0 || isExplicitRenewal || Boolean(ctr.isRenewal)) {
          totalRenewals += 1;
          countedRenewalIds.add(ctr.contractId || ctr.id || ctr._id);
        }
      });
    });

    // Also check payments with explicit renewal intent
    pymts.forEach((p) => {
      const isExplicit = p.mode === 'renewal' || /renew/i.test(p.description || p.label || p.solutionCategory || '');
      if (!isExplicit) return;
      const pDate = p.paymentReceivedDate || p.date || p.createdAt || p.invoiceDate;
      if (!isDateInRange(pDate, businessRange.from, businessRange.to)) return;
      if (p.contractId && countedRenewalIds.has(p.contractId)) return;
      totalRenewals += 1;
    });

    // Total Acquisition: numbers of new customers after registration
    let totalAcquisition = 0;
    custs.forEach((c) => {
      const regDate = c.createdAt || c.registered;
      if (!isDateInRange(regDate, businessRange.from, businessRange.to)) return;

      const lifecycle = normalizeCustomerLifecycle(c.status);
      const custKey = String(c.customerId || c.accountId || c.email || c.company || c.name || '')
        .trim()
        .toLowerCase();
      const hasPaidContract = (contractsByCust.get(custKey) || []).length > 0;

      if (lifecycle === 'Active' || lifecycle === 'InProgress' || hasPaidContract) {
        totalAcquisition += 1;
      }
    });

    if (!businessRange.from && !businessRange.to) {
      if (apiOverview?.kpi?.totalRenewals != null) {
        totalRenewals = apiOverview.kpi.totalRenewals;
      }
      if (apiOverview?.kpi?.totalAcquisition != null) {
        totalAcquisition = apiOverview.kpi.totalAcquisition;
      }
    }

    return {
      totalRenewals,
      totalAcquisition,
      totalBusiness: totalRenewals + totalAcquisition
    };
  }, [customers, contracts, payments, businessRange, apiOverview]);

  // Card 3: Annual Net Revenue for financial years
  const arrMetrics = useMemo(() => {
    const custs = Array.isArray(customers) ? customers : [];
    const ctrs = Array.isArray(contracts) ? contracts : [];

    const startYear = parseInt(String(selectedFY || '').slice(0, 4), 10) || new Date().getFullYear();
    const fyStart = new Date(startYear, 3, 1).getTime();
    const fyEnd = new Date(startYear + 1, 3, 0, 23, 59, 59, 999).getTime();

    const activeCusts = custs.filter((c) => {
      const isAct = normalizeCustomerLifecycle(c.status) === 'Active';
      if (!isAct) return false;
      const cDate = new Date(c.createdAt || c.registered || 0).getTime();
      return !cDate || cDate <= fyEnd;
    });
    const activeMRR = activeCusts.reduce((sum, c) => sum + parseRupee(c.mrr || 0), 0);

    const inProgressCtrs = ctrs.filter((c) => {
      const st = normalizeContractStatus(c.status, c);
      if (st !== 'In Progress') return false;
      const cStart = new Date(c.startDate || c.orderDate || c.createdAt || 0).getTime();
      return !cStart || (cStart <= fyEnd && cStart >= fyStart - 365 * 86400000);
    });

    const commitments = inProgressCtrs.reduce(
      (sum, c) => sum + parseRupee(c.totalContractValue || c.value || 0),
      0
    );

    let totalARR = activeMRR * 12 + commitments;

    if (apiOverview?.kpi?.totalARR != null && (!selectedFY || selectedFY === '2026-2027')) {
      totalARR = apiOverview.kpi.totalARR;
    } else if (apiOverview?.kpi?.arrValueNumeric != null && (!selectedFY || selectedFY === '2026-2027')) {
      totalARR = Math.round(apiOverview.kpi.arrValueNumeric * 10000000);
    }

    return {
      totalARR,
      activeMRR,
      commitments,
      inProgressCount: inProgressCtrs.length
    };
  }, [customers, contracts, apiOverview, selectedFY]);

  // Card 3: Dynamic Unit Formatting (Cr., Lakhs, K)
  const revenueDisplay = useMemo(() => {
    const total = arrMetrics.totalARR;
    if (revenueUnit === 'lakhs') {
      return {
        value: parseFloat((total / 100000).toFixed(2)),
        unit: 'Lakhs',
        decimals: 2
      };
    }
    if (revenueUnit === 'k') {
      return {
        value: parseFloat((total / 1000).toFixed(2)),
        unit: 'K',
        decimals: 2
      };
    }
    // Default 'cr'
    return {
      value: parseFloat((total / 10000000).toFixed(2)),
      unit: 'Cr',
      decimals: 2
    };
  }, [arrMetrics.totalARR, revenueUnit]);

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
      id: 'name',
      name: 'Customer Name',
      selector: (row) => row.name,
      sortable: true,
      sortFunction: compareText((row) => row.name),
      minWidth: '170px',
      grow: 1,
      cell: (cust) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>{cust.name || '—'}</span>
      )
    },
    {
      id: 'designation',
      name: 'Designation',
      selector: (row) => row.designation,
      sortable: true,
      sortFunction: compareText((row) => row.designation),
      minWidth: '130px',
      cell: (cust) => (
        <span style={{ fontSize: '0.78rem', color: '#475569' }}>{cust.designation || '—'}</span>
      )
    },
    {
      id: 'company',
      name: 'Company Name',
      selector: (row) => row.company,
      sortable: true,
      sortFunction: compareText((row) => row.company),
      minWidth: '190px',
      grow: 1.1,
      cell: (cust) => <span style={{ color: '#1e293b' }}>{cust.company || '—'}</span>
    },
    {
      id: 'email',
      name: 'Email(s)',
      selector: (row) => row.email || row.loginEmail,
      sortable: true,
      sortFunction: compareText((row) => row.email || row.loginEmail),
      minWidth: '220px',
      cell: (cust) => {
        const email = cust.email || cust.loginEmail || '—';
        const additional = Array.isArray(cust.additionalEmails) ? cust.additionalEmails.filter(Boolean) : [];
        const isCopied = copiedKey === `email-${cust.id}`;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '4px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 600 }}>{email}</span>
              {additional.length > 0 && (
                <span
                  style={{
                    fontSize: '0.64rem',
                    background: '#ede9fe',
                    color: '#6d28d9',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}
                  title="Primary Login Email"
                >
                  Primary
                </span>
              )}
              {email !== '—' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(email, `email-${cust.id}`, 'Primary Email');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isCopied ? '#16a34a' : '#94a3b8',
                    padding: '2px',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                  title={isCopied ? 'Copied' : 'Copy Primary Email'}
                >
                  {isCopied ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                </button>
              )}
            </div>
            {additional.map((extraEm, idx) => {
              const isExtraCopied = copiedKey === `email-${cust.id}-extra-${idx}`;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.74rem',
                    color: '#64748b'
                  }}
                >
                  <span style={{ color: '#a5b4fc', fontSize: '0.8rem' }}>↳</span>
                  <span>{extraEm}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(extraEm, `email-${cust.id}-extra-${idx}`, 'Secondary Email');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: isExtraCopied ? '#16a34a' : '#94a3b8',
                      padding: '1px 2px',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                    title={isExtraCopied ? 'Copied' : 'Copy Secondary Email'}
                  >
                    {isExtraCopied ? <Check size={10} color="#16a34a" /> : <Copy size={10} />}
                  </button>
                </div>
              );
            })}
          </div>
        );
      }
    },
    {
      id: 'password',
      name: 'Password',
      selector: (row) => row.password || row.portalPassword || '',
      sortable: false,
      minWidth: '175px',
      cell: (cust) => {
        const pw = cust.password || cust.portalPassword || '••••••••';
        const isVisible = showPasswords[cust.id];
        const isCopied = copiedKey === `pw-${cust.id}`;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontWeight: 600,
                fontSize: '0.78rem',
                background: '#fef3c7',
                color: '#92400e',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid #fde68a',
                letterSpacing: isVisible ? '0.02em' : '0.12em'
              }}
            >
              {isVisible ? pw : '••••••••'}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPasswords((prev) => ({ ...prev, [cust.id]: !prev[cust.id] }));
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                padding: '2px',
                display: 'inline-flex',
                alignItems: 'center'
              }}
              title={isVisible ? 'Hide Password' : 'Show Password'}
            >
              {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(pw, `pw-${cust.id}`, 'Password');
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isCopied ? '#16a34a' : '#94a3b8',
                padding: '2px',
                display: 'inline-flex',
                alignItems: 'center'
              }}
              title={isCopied ? 'Copied' : 'Copy Password'}
            >
              {isCopied ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
            </button>
          </div>
        );
      }
    },
    {
      id: 'phone',
      name: 'Phone No.(s)',
      selector: (row) => row.phone,
      sortable: true,
      sortFunction: compareText((row) => row.phone),
      minWidth: '160px',
      cell: (cust) => {
        const primaryPhone = cust.phone || '—';
        const additionalPhones = [
          ...(Array.isArray(cust.additionalPhones) ? cust.additionalPhones : []),
          ...(cust.alternatePhone && !cust.additionalPhones?.includes(cust.alternatePhone) ? [cust.alternatePhone] : [])
        ].filter(Boolean);
        const isCopied = copiedKey === `phone-${cust.id}`;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '4px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#1e293b', fontWeight: 600 }}>
                {primaryPhone}
              </span>
              {additionalPhones.length > 0 && (
                <span
                  style={{
                    fontSize: '0.64rem',
                    background: '#f1f5f9',
                    color: '#475569',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}
                  title="Primary Phone"
                >
                  Primary
                </span>
              )}
              {primaryPhone !== '—' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(primaryPhone, `phone-${cust.id}`, 'Primary Phone');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isCopied ? '#16a34a' : '#94a3b8',
                    padding: '2px',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                  title={isCopied ? 'Copied' : 'Copy Primary Phone'}
                >
                  {isCopied ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                </button>
              )}
            </div>
            {additionalPhones.map((extraPh, idx) => {
              const isExtraCopied = copiedKey === `phone-${cust.id}-extra-${idx}`;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.74rem',
                    color: '#64748b',
                    fontFamily: 'monospace'
                  }}
                >
                  <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>↳</span>
                  <span>{extraPh}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(extraPh, `phone-${cust.id}-extra-${idx}`, 'Secondary Phone');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: isExtraCopied ? '#16a34a' : '#94a3b8',
                      padding: '1px 2px',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                    title={isExtraCopied ? 'Copied' : 'Copy Secondary Phone'}
                  >
                    {isExtraCopied ? <Check size={10} color="#16a34a" /> : <Copy size={10} />}
                  </button>
                </div>
              );
            })}
          </div>
        );
      }
    },
    {
      id: 'orders',
      name: 'Orders',
      selector: (row) => row.orderCount || 0,
      sortable: true,
      sortFunction: compareNumber((row) => row.orderCount || 0),
      width: '90px',
      center: true,
      cell: (cust) => (
        <span style={{ fontWeight: 700, color: cust.orderCount ? '#0f172a' : '#94a3b8' }}>
          {cust.orderCount || 0}
        </span>
      )
    },
    {
      id: 'city',
      name: 'City',
      selector: (row) => addressPart(row, 'city'),
      sortable: true,
      sortFunction: compareText((row) => addressPart(row, 'city')),
      minWidth: '120px',
      cell: (cust) => <span style={{ fontSize: '0.78rem', color: '#475569' }}>{addressPart(cust, 'city') || '—'}</span>
    },
    {
      id: 'state',
      name: 'State',
      selector: (row) => addressPart(row, 'state'),
      sortable: true,
      sortFunction: compareText((row) => addressPart(row, 'state')),
      minWidth: '130px',
      cell: (cust) => <span style={{ fontSize: '0.78rem', color: '#475569' }}>{addressPart(cust, 'state') || '—'}</span>
    },
    {
      id: 'status',
      name: 'Status',
      selector: (row) => row.status,
      sortable: true,
      sortFunction: compareText((row) => row.status),
      minWidth: '190px',
      cell: (cust) => {
        const stage = normalizeCustomerLifecycle(cust.status);
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span className={`adm-status-pill ${customerLifecycleTone(cust.status)}`}>
              {stage === 'Active' && <CheckCircle2 size={12} />}
              {stage === 'Demo' && <Clock size={12} />}
              {stage === 'DemoInactive' && <XCircle size={12} />}
              {stage === 'InProgress' && <Activity size={12} />}
              {stage === 'Inactive' && <XCircle size={12} />}
              <span>{customerLifecycleLabel(cust.status)}</span>
            </span>
          </div>
        );
      },
      searchType: 'select',
      searchOptions: [
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Demo', label: 'Demo Trial' },
        { value: 'InProgress', label: 'In Progress' },
        { value: 'Active', label: 'Active' }
      ]
    },
    {
      id: 'createdAt',
      name: 'Created At',
      selector: (row) => row.createdAt || row.registered,
      sortable: true,
      sortFunction: compareDate((row) => row.createdAt || row.registered),
      width: '165px',
      cell: (cust) => (
        <span style={{ fontSize: '0.78rem', color: '#475569' }}>
          {formatStamp(cust.createdAt || cust.registered)}
        </span>
      )
    },
    {
      id: 'updatedAt',
      name: 'Updated At',
      selector: (row) => row.updatedAt || '',
      sortable: true,
      sortFunction: compareDate((row) => row.updatedAt || ''),
      width: '165px',
      cell: (cust) => (
        <span style={{ fontSize: '0.78rem', color: '#475569' }}>{formatStamp(cust.updatedAt)}</span>
      )
    },
    {
      id: 'actions',
      name: 'Actions',
      center: true,
      width: '120px',
      button: true,
      allowOverflow: true,
      ignoreRowClick: true,
      cell: (cust) => {
        const crmStatus = String(cust.sangamCrm?.status || '').toLowerCase();
        const isSyncing = syncingIds[cust.id || cust.customerId];
        return (
          <RowActionMenu
            module="customer"
            items={[
              { label: 'View Profile', icon: Eye, tone: 'blue', onClick: () => setSelectedCustomer(cust) },
              can('customer', 'edit') && { label: 'Edit Customer', icon: Edit3, tone: 'purple', onClick: () => setEditingCustomer(cust) },
              can('customer', 'edit') && {
                label: cust.demoExtensionAllowed ? `Extend (+${cust.demoExtensionDays || 7}d approved)` : 'Allow Demo Extension',
                icon: Clock,
                tone: 'amber',
                onClick: () => handleAuthorizeDemoExtension(cust)
              },
              {
                label: 'Print (PDF)',
                icon: Printer,
                tone: 'green',
                onClick: () => {
                  generateCustomerPdf(cust);
                  toast.success(`PDF generated for ${cust.company || cust.name}`);
                }
              },
              can('customer', 'edit') &&
                (!crmStatus || crmStatus === 'failed' || crmStatus === 'pending') && {
                  label: isSyncing ? 'Syncing...' : 'Sync to Sangam CRM',
                  icon: RotateCw,
                  tone: 'indigo',
                  disabled: isSyncing,
                  onClick: (e) => handleRetrySync(e, cust)
                },
              can('customer', 'delete') && {
                label: 'Delete Customer',
                icon: Trash2,
                tone: 'red',
                onClick: () => setDeletingCustomer(cust)
              }
            ].filter(Boolean)}
          />
        );
      }
    }
  ];

  const overviewContractColumns = [
    {
      id: 'name',
      name: 'Contract Name/ID',
      selector: (row) => row.name,
      sortable: true,
      sortFunction: compareText((row) => row.name),
      minWidth: '220px',
      grow: 1.2,
      wrap: true,
      cell: (c) => <div className="adm-primary-text">{c.name || '—'}</div>
    },
    {
      id: 'company',
      name: 'Company Name',
      selector: (row) => row.company,
      sortable: true,
      sortFunction: compareText((row) => row.company),
      minWidth: '180px',
      grow: 1,
      wrap: true,
      cell: (c) => <div className="adm-primary-text">{c.company || '—'}</div>
    },
    {
      id: 'status',
      name: 'Status',
      selector: (row) => normalizeContractStatus(row.status, row),
      sortable: true,
      sortFunction: compareText((row) => normalizeContractStatus(row.status, row)),
      minWidth: '170px',
      width: '185px',
      cell: (c) => {
        const status = normalizeContractStatus(c.status, c);
        const tone = contractStatusTone(status, c);
        const cId = getContractId(c);
        const isUpdating = !!updatingContractStatusIds[cId];

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start' }}>
            <span className={`adm-status-pill ${tone}`}>
              {status || '—'}
            </span>
            {can('contract', 'edit') && status === 'In Progress' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickContractStatusChange(c, 'Inactive');
                }}
                disabled={isUpdating}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#dc2626',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: isUpdating ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  textDecoration: 'underline'
                }}
                title="Mark this contract as Inactive and update in Sangam CRM"
              >
                {isUpdating ? 'Updating...' : '+ Set Inactive'}
              </button>
            )}
            {can('contract', 'edit') && status === 'Inactive' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickContractStatusChange(c, 'In Progress');
                }}
                disabled={isUpdating}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#059669',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: isUpdating ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  textDecoration: 'underline'
                }}
                title="Mark this contract as In Progress and update in Sangam CRM"
              >
                {isUpdating ? 'Updating...' : '+ Set In Progress'}
              </button>
            )}
          </div>
        );
      },
      searchType: 'select'
    },
    {
      id: 'personEmail',
      name: 'Person Email',
      selector: (row) => contractPersonEmail(row, customers),
      sortable: true,
      sortFunction: compareText((row) => contractPersonEmail(row, customers)),
      minWidth: '200px',
      grow: 1,
      wrap: true,
      cell: (c) => <span style={{ fontSize: '0.82rem', color: '#475569' }}>{contractPersonEmail(c, customers) || '—'}</span>
    },
    {
      id: 'personMobile',
      name: 'Person Mobile',
      selector: (row) => contractPersonMobile(row, customers),
      sortable: true,
      sortFunction: compareText((row) => contractPersonMobile(row, customers)),
      width: '140px',
      cell: (c) => <span style={{ fontSize: '0.82rem', color: '#475569' }}>{contractPersonMobile(c, customers) || '—'}</span>
    },
    {
      id: 'contractType',
      name: 'Contract Type',
      selector: (row) => normalizeContractType(row.contractType),
      sortable: true,
      sortFunction: compareText((row) => normalizeContractType(row.contractType)),
      minWidth: '170px',
      grow: 1,
      wrap: true,
      cell: (c) => (
        <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
          {normalizeContractType(c.contractType) || '—'}
        </span>
      )
    },
    {
      id: 'value',
      name: 'Total Contract Value',
      selector: (row) => row.totalContractValue || row.value,
      sortable: true,
      sortFunction: compareNumber((row) => row.totalContractValue || row.value),
      width: '150px',
      cell: (c) => (
        <span className="adm-mrr-text" style={{ fontSize: '0.92rem' }}>
          {c.totalContractValue || c.value || '—'}
        </span>
      )
    },
    {
      id: 'startDate',
      name: 'Start Date',
      selector: (row) => row.startDate,
      sortable: true,
      sortFunction: compareText((row) => row.startDate),
      width: '130px',
      cell: (c) => <span style={{ fontSize: '0.82rem', color: '#475569' }}>{c.startDate || '—'}</span>
    },
    {
      id: 'endDate',
      name: 'End Date',
      selector: (row) => row.endDate || row.expiryDate,
      sortable: true,
      sortFunction: compareText((row) => row.endDate || row.expiryDate),
      width: '130px',
      cell: (c) => (
        <span style={{ fontSize: '0.82rem', color: '#475569' }}>{c.endDate || c.expiryDate || '—'}</span>
      )
    },
    {
      id: 'updatedAt',
      name: 'Updated At',
      selector: (row) => row.updatedAt || '',
      sortable: true,
      sortFunction: compareDate((row) => row.updatedAt || ''),
      width: '165px',
      cell: (c) => <span style={{ fontSize: '0.78rem', color: '#475569' }}>{formatContractStamp(c.updatedAt)}</span>
    },
    {
      id: 'updatedBy',
      name: 'Updated By',
      selector: (row) => contractActorName(row.updatedBy),
      sortable: true,
      sortFunction: compareText((row) => contractActorName(row.updatedBy)),
      minWidth: '160px',
      grow: 0.9,
      wrap: true,
      cell: (c) => <span style={{ fontSize: '0.8rem', color: '#475569' }}>{contractActorName(c.updatedBy) || '—'}</span>
    },
    {
      id: 'createdAt',
      name: 'Created At',
      selector: (row) => row.createdAt || '',
      sortable: true,
      sortFunction: compareDate((row) => row.createdAt || ''),
      width: '165px',
      cell: (c) => <span style={{ fontSize: '0.78rem', color: '#475569' }}>{formatContractStamp(c.createdAt)}</span>
    },
    {
      id: 'createdBy',
      name: 'Created By',
      selector: (row) => contractActorName(row.createdBy),
      sortable: true,
      sortFunction: compareText((row) => contractActorName(row.createdBy)),
      minWidth: '160px',
      grow: 0.9,
      wrap: true,
      cell: (c) => <span style={{ fontSize: '0.8rem', color: '#475569' }}>{contractActorName(c.createdBy) || '—'}</span>
    },
    {
      id: 'actions',
      name: 'Actions',
      center: true,
      width: '120px',
      button: true,
      allowOverflow: true,
      ignoreRowClick: true,
      cell: (c) => {
        const cId = getContractId(c);
        const isSyncing = !!syncingContractIds[cId];
        const crmStatus = c.sangamCrm?.status || 'pending';

        return (
          <RowActionMenu
            module="contract"
            items={[
              { label: 'View', icon: Eye, tone: 'blue', onClick: () => setViewingContract(c) },
              {
                label: 'Edit',
                icon: Edit3,
                tone: 'purple',
                hidden: !can('contract', 'edit'),
                onClick: () => setEditingContract(c)
              },
              {
                label: 'Set Inactive',
                icon: Power,
                tone: 'red',
                hidden: !can('contract', 'edit') || normalizeContractStatus(c.status, c) !== 'In Progress',
                onClick: () => handleQuickContractStatusChange(c, 'Inactive')
              },
              {
                label: 'Set In Progress',
                icon: CheckCircle2,
                tone: 'green',
                hidden: !can('contract', 'edit') || normalizeContractStatus(c.status, c) !== 'Inactive',
                onClick: () => handleQuickContractStatusChange(c, 'In Progress')
              },
              {
                label: 'Print (PDF)',
                icon: Printer,
                tone: 'green',
                onClick: () => {
                  generateContractPdf(c);
                  toast.success(`PDF generated for ${c.name}`);
                }
              },
              {
                label: isSyncing ? 'Syncing...' : 'Retry CRM Sync',
                icon: RotateCw,
                tone: 'orange',
                hidden: crmStatus === 'synced' || !can('contract', 'edit'),
                onClick: (e) => handleRetryContractSync(e, c)
              },
              {
                label: 'Delete',
                icon: Trash2,
                tone: 'red',
                danger: true,
                divider: true,
                hidden: !can('contract', 'delete'),
                onClick: () => setDeletingContract(c)
              }
            ]}
          />
        );
      }
    }
  ];
  const recentContractColumns = overviewContractColumns;

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
          columns={visibleColumns('customer', overviewCustomerColumns)}
          data={filteredOverviewCustomers}
          keyField="id"
          defaultSortFieldId="createdAt"
          defaultSortAsc={false}
          resetPageToken={`${custSearch}|${custStatusFilter}|${custDateFrom}|${custDateTo}`}
          minWidth={2100}
          noDataMessage="No customer records found"
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
                options={contractStatusFilterOptions}
                value={
                  contractStatusFilterOptions.find(
                    (option) => option.value === contStatusFilter
                  ) || contractStatusFilterOptions[0]
                }
                onChange={(opt) => setContStatusFilter(opt ? opt.value : 'all')}
                classNamePrefix="react-select"
              />
            </div>
          </div>
        </div>

        <AdminDataTable
          columns={visibleColumns('contract', overviewContractColumns)}
          data={filteredOverviewContracts}
          keyField="id"
          defaultSortFieldId="startDate"
          defaultSortAsc={false}
          minWidth={2200}
          resetPageToken={`${contSearch}|${contStatusFilter}|${contDateFrom}|${contDateTo}`}
          noDataMessage="No contract agreements found"
          noDataHint="Contracts you create will appear here."
          ariaLabel="Customer contracts"
          scrollHeight="600px"
        />
      </div>

      {/* =========================================================================
         2. FINANCIAL HIGHLIGHT CARDS: PAYMENT RECEIVED & PAYMENT DUE SECTION
         (2X2 GRID — ONLY BOTTOM-RIGHT BUTTONS ARE CLICKABLE TO NAVIGATE)
         ========================================================================= */}
      <div className="adm-finance-grid">
        {/* CARD 1: TOTAL AMOUNT RECEIVED */}
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
            <span className="adm-finance-label">Total Amount Received</span>
            <div className="adm-finance-value emerald-val">
              ₹<CountUp end={paymentMetrics.receivedTotal} useIndianFormat={true} duration={1400} />
            </div>
            <p className="adm-finance-caption">
              {collectionMethodText} Cleared collections recorded in the payment ledger.
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

        {/* CARD 2: TOTAL BUSINESS (TOTAL RENEWALS & TOTAL ACQUISITION) */}
        <div className="adm-finance-card payment-due">
          <div className="adm-finance-header">
            <div className="adm-finance-badge amber">
              <Briefcase size={16} />
              <span>Total Business</span>
            </div>
            <DateRangeFilter
              from={businessRange.from}
              to={businessRange.to}
              onChange={(from, to) => setBusinessRange({ from, to })}
              compact={true}
              label="Date Range"
            />
          </div>

          <div className="adm-finance-content">
            <div className="adm-dual-metric-row">
              <div className="adm-metric-part">
                <span className="adm-finance-label">Total Renewals</span>
                <div className="adm-finance-value amber-val compact-val">
                  <CountUp end={businessMetrics.totalRenewals} duration={1200} />
                </div>
                <p className="adm-metric-hint">Renewals done by customers</p>
              </div>
              <div className="adm-metric-divider" />
              <div className="adm-metric-part">
                <span className="adm-finance-label">Total Acquisition</span>
                <div className="adm-finance-value blue-val compact-val">
                  <CountUp end={businessMetrics.totalAcquisition} duration={1200} />
                </div>
                <p className="adm-metric-hint">New customers post-registration</p>
              </div>
            </div>
            <p className="adm-finance-caption">
              Customer retention &amp; expansion: renewed agreements and new customer acquisitions post-registration.
            </p>
          </div>

          <div className="adm-finance-footer">
            <span className="adm-finance-status-tag">
              <span className="adm-dot amber" />
              <span>
                <CountUp end={businessMetrics.totalBusiness} duration={1200} /> total engagements
              </span>
            </span>
            <button
              type="button"
              className="adm-finance-link amber-link"
              onClick={() => navigate('/admin/customer/contract')}
              title="Inspect customer contracts and renewals"
            >
              <span>Contracts</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* CARD 3: ANNUAL NET REVENUE (FINANCIAL YEARS & UNIT SWITCHER) */}
        <div className="adm-finance-card mrr-arr">
          <div className="adm-finance-header">
            <div className="adm-finance-badge purple">
              <FileText size={16} />
              <span>Annual Net Revenue</span>
            </div>
            <div className="adm-header-right-controls">
              <select
                className="adm-card-select"
                value={selectedFY}
                onChange={(e) => setSelectedFY(e.target.value)}
                title="Select Financial Year"
              >
                {FINANCIAL_YEARS.map((fy) => (
                  <option key={fy.id} value={fy.id}>
                    {fy.label.replace(' (Current)', '')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="adm-finance-content">
            <div className="adm-revenue-header-row">
              <span className="adm-finance-label">Annual Net Revenue</span>
              <div className="adm-unit-pill-group" role="group" aria-label="Revenue Unit">
                <button
                  type="button"
                  className={`adm-unit-pill ${revenueUnit === 'cr' ? 'active' : ''}`}
                  onClick={() => setRevenueUnit('cr')}
                  title="Show in Crores (Cr)"
                >
                  Cr.
                </button>
                <button
                  type="button"
                  className={`adm-unit-pill ${revenueUnit === 'lakhs' ? 'active' : ''}`}
                  onClick={() => setRevenueUnit('lakhs')}
                  title="Show in Lakhs"
                >
                  Lakhs
                </button>
                <button
                  type="button"
                  className={`adm-unit-pill ${revenueUnit === 'k' ? 'active' : ''}`}
                  onClick={() => setRevenueUnit('k')}
                  title="Show in Thousands (K)"
                >
                  K (thousand)
                </button>
              </div>
            </div>

            <div className="adm-finance-value purple-val">
              ₹<CountUp end={revenueDisplay.value} decimals={revenueDisplay.decimals} duration={1200} /> {revenueDisplay.unit}
            </div>
            <p className="adm-finance-caption">
              Annualised revenue for {FINANCIAL_YEARS.find((f) => f.id === selectedFY)?.label.replace(' (Current)', '') || selectedFY}: monthly recurring of{' '}
              <strong>
                ₹<CountUp end={arrMetrics.activeMRR} useIndianFormat={true} duration={1200} />
              </strong>{' '}
              on active accounts plus ₹{arrMetrics.commitments.toLocaleString('en-IN')} contract commitments.
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
