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
  Clock,
  Sparkles,
  XCircle,
  Search,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Calendar,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { useTableSort, SortableTh } from './tableSortUtils';
import { CountUp } from '../../Dashboard/utils/useCountUp';
import {
  PERIOD_OPTIONS,
  FINANCIAL_YEARS,
  getOverviewFilteredData
} from './overviewFilterData';
import { compactSelectStyles } from './reactSelectStyles';

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

export default function OverviewSection({
  adminName,
  contracts = [],
  payments = [],
  products = [],
  receipts = [],
  customers = [],
  setCustomers,
  setIsAddContractModalOpen
}) {
  const navigate = useNavigate();

  // Overview Filters: Period (Monthly, Quarterly, Yearly) & Financial Year
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedFY, setSelectedFY] = useState('2026-2027');

  // Consolidated Telemetry Filter Engine
  const activeOverviewData = useMemo(() => {
    return getOverviewFilteredData(selectedPeriod, selectedFY, customers, contracts);
  }, [selectedPeriod, selectedFY, customers, contracts]);

  // Overview Customer List Filter and Search
  const [custFilter, setCustFilter] = useState('all'); // 'all' | 'active' | 'demo' | 'inactive'
  const [custSearch, setCustSearch] = useState('');

  // Active chart hover data state
  const [hoveredSalesPoint, setHoveredSalesPoint] = useState(null);
  const [hoveredPieSlice, setHoveredPieSlice] = useState(null);
  const [chartAnimKey, setChartAnimKey] = useState(0);

  // Sync hovered point whenever active overview dataset changes
  useEffect(() => {
    if (activeOverviewData.salesChart?.points?.length) {
      setHoveredSalesPoint(
        activeOverviewData.salesChart.points[activeOverviewData.salesChart.points.length - 1]
      );
      setChartAnimKey((prev) => prev + 1);
    }
  }, [activeOverviewData]);

  // Customer status breakdown counts for current filtered view
  const customerCounts = useMemo(() => {
    const list = activeOverviewData.filteredCustomers || [];
    const total = list.length;
    const active = list.filter((c) => c.status?.toLowerCase() === 'active').length;
    const demo = list.filter((c) => c.status?.toLowerCase() === 'demo').length;
    const inactive = list.filter(
      (c) => c.status?.toLowerCase() === 'inactive' || c.status?.toLowerCase() === 'suspended'
    ).length;

    return { total, active, demo, inactive };
  }, [activeOverviewData]);

  // Filtered customer list for the Overview Customer Table
  const filteredOverviewCustomers = useMemo(() => {
    const list = activeOverviewData.filteredCustomers || [];
    return list.filter((c) => {
      const q = custSearch.toLowerCase();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.plan && c.plan.toLowerCase().includes(q));

      const status = c.status?.toLowerCase();
      let matchesStatus = true;
      if (custFilter === 'active') matchesStatus = status === 'active';
      else if (custFilter === 'demo') matchesStatus = status === 'demo';
      else if (custFilter === 'inactive') matchesStatus = status === 'inactive' || status === 'suspended';

      return matchesSearch && matchesStatus;
    });
  }, [activeOverviewData, custSearch, custFilter]);

  // Multi-column sorting for Overview Customer List
  const { sortedItems: sortedOverviewCustomers, sortConfig: custSortConfig, requestCustSort: requestCustSortOriginal, requestSort: requestCustSort } = useTableSort(
    filteredOverviewCustomers,
    'id',
    'asc'
  );

  // Multi-column sorting for recent commitments
  const { sortedItems: sortedRecentContracts, sortConfig: contractSortConfig, requestSort: requestContractSort } = useTableSort(
    activeOverviewData.filteredContracts,
    'expiryDate',
    'asc'
  );

  // SVG Coordinates for Sales Area Chart
  const svgWidth = 620;
  const svgHeight = 220;
  const paddingX = 42;
  const paddingY = 32;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const currentSalesPoints = activeOverviewData.salesChart?.points || [];

  const { minSales, maxSales } = useMemo(() => {
    if (!currentSalesPoints.length) return { minSales: 1000000, maxSales: 3000000 };
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

  // Helper for dynamic Y-axis label formatting (Lakhs vs Crores)
  const formatYAxisLabel = (value) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(value / 100000).toFixed(1)} L`;
  };

  return (
    <div className="adm-overview-container animate-fade-in">
      {/* =========================================================================
         1. TOP-RIGHT OVERVIEW FILTERS TOOLBAR (PERIOD + FINANCIAL YEAR)
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

        {/* Filters positioned directly in the top-right highlighted section */}
        <div className="adm-overview-filters-panel">
          {/* Cadence Segmented Pills (Monthly, Quarterly, Yearly) */}
          <div className="adm-cadence-pills">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`adm-cadence-pill ${selectedPeriod === opt.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedPeriod(opt.id);
                  const fyLabel = FINANCIAL_YEARS.find((f) => f.id === selectedFY)?.label || selectedFY;
                  toast.success(`Overview filtered: ${opt.label} (${fyLabel})`, { id: 'filter-toast' });
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Financial Year Selector with React Select */}
          <div style={{ minWidth: '190px' }}>
            <Select
              styles={compactSelectStyles}
              isSearchable={false}
              options={FINANCIAL_YEARS.map((fy) => ({ value: fy.id, label: fy.label }))}
              value={{
                value: selectedFY,
                label: FINANCIAL_YEARS.find((f) => f.id === selectedFY)?.label || selectedFY
              }}
              onChange={(opt) => {
                if (opt) {
                  setSelectedFY(opt.value);
                  toast.success(`Overview filtered for ${opt.label}`, { id: 'filter-toast' });
                }
              }}
              classNamePrefix="react-select"
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
         2. FINANCIAL HIGHLIGHT CARDS: PAYMENT RECEIVED & PAYMENT DUE SECTION
         (2X2 GRID — ONLY BOTTOM-RIGHT BUTTONS ARE CLICKABLE TO NAVIGATE)
         ========================================================================= */}
      <div className="adm-finance-grid">
        {/* CARD 1: TOTAL PAYMENT RECEIVED */}
        <div className="adm-finance-card payment-received">
          <div className="adm-finance-header">
            <div className="adm-finance-badge emerald">
              <CheckCircle2 size={16} />
              <span>{activeOverviewData.kpi.settledPercentage}</span>
            </div>
            <span className="adm-finance-trend up">
              <TrendingUp size={13} />
              <span>{activeOverviewData.kpi.trendReceived}</span>
            </span>
          </div>

          <div className="adm-finance-content">
            <span className="adm-finance-label">Total Payment Received</span>
            <div className="adm-finance-value emerald-val">
              ₹<CountUp end={activeOverviewData.kpi.receivedNumeric} useIndianFormat={true} duration={1400} />
            </div>
            <p className="adm-finance-caption">
              Total cleared collections via NEFT/RTGS, UPI, and Corporate NetBanking across active contracts.
            </p>
          </div>

          <div className="adm-finance-footer">
            <span className="adm-finance-status-tag">
              <span className="adm-dot emerald" />
              <span>{activeOverviewData.kpi.invoicesClearedText}</span>
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

        {/* CARD 2: TOTAL PAYMENT DUE */}
        <div className="adm-finance-card payment-due">
          <div className="adm-finance-header">
            <div className="adm-finance-badge amber">
              <AlertCircle size={16} />
              <span>Awaiting Clearance</span>
            </div>
            <span className="adm-finance-trend due-tag">{activeOverviewData.kpi.dueTag}</span>
          </div>

          <div className="adm-finance-content">
            <span className="adm-finance-label">Total Payment Due</span>
            <div className="adm-finance-value amber-val">
              ₹<CountUp end={activeOverviewData.kpi.dueNumeric} useIndianFormat={true} duration={1400} />
            </div>
            <p className="adm-finance-caption">
              Unsettled invoices and renewal invoices currently awaiting client accounts clearance.
            </p>
          </div>

          <div className="adm-finance-footer">
            <span className="adm-finance-status-tag">
              <span className="adm-dot amber" />
              <span>{activeOverviewData.kpi.invoicesPendingText}</span>
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

        {/* CARD 3: ACTIVE MRR & ARR */}
        <div className="adm-finance-card mrr-arr">
          <div className="adm-finance-header">
            <div className="adm-finance-badge purple">
              <FileText size={16} />
              <span>Contract ARR</span>
            </div>
            <span className="adm-finance-trend up">
              <TrendingUp size={13} />
              <span>+14% YoY</span>
            </span>
          </div>

          <div className="adm-finance-content">
            <span className="adm-finance-label">Active Annual Value (ARR)</span>
            <div className="adm-finance-value purple-val">
              ₹<CountUp end={activeOverviewData.kpi.arrValueNumeric} decimals={2} duration={1400} /> Cr
            </div>
            <p className="adm-finance-caption">
              {activeOverviewData.kpi.mrrLabel}{' '}
              <strong>
                ₹<CountUp end={activeOverviewData.kpi.activeMRRNumeric} useIndianFormat={true} duration={1400} />
              </strong>{' '}
              across cloud nodes.
            </p>
          </div>

          <div className="adm-finance-footer">
            <span className="adm-finance-status-tag">
              <span className="adm-dot purple" />
              <CountUp end={activeOverviewData.kpi.enterpriseSLACount} duration={1200} /> Enterprise SLAs Active
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

        {/* CARD 4: CUSTOMER PIPELINE SUMMARY */}
        <div className="adm-finance-card customer-ratio">
          <div className="adm-finance-header">
            <div className="adm-finance-badge blue">
              <Users size={16} />
              <span>Customer Accounts</span>
            </div>
            <span className="adm-finance-trend up" style={{ color: '#0284c7' }}>
              <span>CtrlS Tier-4</span>
            </span>
          </div>

          <div className="adm-finance-content">
            <span className="adm-finance-label">Total Accounts Pipeline</span>
            <div className="adm-finance-value blue-val">
              <CountUp end={activeOverviewData.kpi.totalPipelineCount} duration={1200} /> Accounts
            </div>
            <p className="adm-finance-caption">
              <strong style={{ color: '#059669' }}>
                <CountUp end={activeOverviewData.kpi.activeCount} duration={1200} /> Active
              </strong>{' '}
              •{' '}
              <strong style={{ color: '#d97706' }}>
                <CountUp end={activeOverviewData.kpi.demoCount} duration={1200} /> Demo Trial
              </strong>{' '}
              •{' '}
              <strong style={{ color: '#64748b' }}>
                <CountUp end={activeOverviewData.kpi.inactiveCount} duration={1200} /> Inactive
              </strong>
            </p>
          </div>

          <div className="adm-finance-footer">
            <span className="adm-finance-status-tag">
              <span className="adm-dot blue" />
              {activeOverviewData.kpi.uptime}
            </span>
            <button
              type="button"
              className="adm-finance-link blue-link"
              onClick={() => navigate('/admin/customer')}
              title="Navigate to Customer Directory"
            >
              <span>Directory</span>
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
                {hoveredSalesPoint?.label || activeOverviewData.salesChart.points[activeOverviewData.salesChart.points.length - 1]?.label}
              </span>
            </div>
            <div className="adm-metric-block">
              <span className="adm-metric-caption">Growth Velocity</span>
              <span className="adm-metric-growth">
                {hoveredSalesPoint?.growth || activeOverviewData.salesChart.growthLabel}
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
        </div>

        {/* CHART 2: PIE / DONUT CHART WITH ROTATIONAL ENTRANCE & EXPANDING SLICES */}
        <div className="adm-chart-card pie-chart-box">
          <div className="adm-chart-card-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className="adm-chart-title">Revenue Share by Solution</h2>
                <span className="adm-status-pill info" style={{ fontSize: '0.7rem' }}>
                  <Layers size={11} />
                  <span>4 Categories</span>
                </span>
              </div>
              <p className="adm-chart-sub">
                Distribution of gross billings across product divisions.
              </p>
            </div>
          </div>

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
                  {hoveredPieSlice ? `${hoveredPieSlice.percentage}% SHARE` : 'TOTAL REVENUE'}
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
              {activeOverviewData.pieChart.categories.map((cat, idx) => {
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
                      <CountUp end={cat.percentage} duration={1200} />%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick SLA / Infrastructure Status Tag */}
          <div className="adm-donut-bottom-note">
            <ShieldCheck size={14} style={{ color: '#059669' }} />
            <span>All solutions verified &amp; hosted on CtrlS Kolkata Tier-4 clusters.</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
         4. CUSTOMER LIST ON ADMIN OVERVIEW SECTION (WITH COUNT-UP & FILTERING)
         ========================================================================= */}
      <div className="adm-table-card animate-fade-in" style={{ marginBottom: '28px' }}>
        <div className="adm-card-header">
          <div className="adm-card-header-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 className="adm-section-title">Customer Accounts Directory</h2>
              <span className="adm-status-pill info">
                <Users size={12} />
                <span>
                  <CountUp end={customerCounts.total} duration={1200} /> Registered Accounts
                </span>
              </span>
            </div>
            <p className="adm-section-sub">
              Live enterprise client list, active cloud ERP deployments, and prospective demo trials.
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

        {/* Filter Section: Demo, Active, Inactive + Search */}
        <div className="adm-table-toolbar">
          <div className="adm-table-filters" style={{ flexWrap: 'wrap', gap: '12px' }}>
            {/* Search Box */}
            <div className="adm-search-box" style={{ width: '260px' }}>
              <Search size={15} className="adm-search-icon" />
              <input
                type="text"
                placeholder="Search customers or company..."
                value={custSearch}
                onChange={(e) => setCustSearch(e.target.value)}
                className="adm-search-input"
                style={{ width: '100%', height: '36px' }}
              />
            </div>

            {/* Filter Pills for Active, Demo, Inactive with CountUp */}
            <div className="adm-filter-pills">
              <button
                type="button"
                className={`adm-pill-btn ${custFilter === 'all' ? 'active' : ''}`}
                onClick={() => setCustFilter('all')}
              >
                All (<CountUp end={customerCounts.total} duration={1000} />)
              </button>
              <button
                type="button"
                className={`adm-pill-btn ${custFilter === 'active' ? 'active active-tab' : ''}`}
                onClick={() => setCustFilter('active')}
              >
                <span className="adm-filter-dot active-dot" />
                Active (<CountUp end={customerCounts.active} duration={1000} />)
              </button>
              <button
                type="button"
                className={`adm-pill-btn ${custFilter === 'demo' ? 'active demo-tab' : ''}`}
                onClick={() => setCustFilter('demo')}
              >
                <span className="adm-filter-dot demo-dot" />
                Demo (<CountUp end={customerCounts.demo} duration={1000} />)
              </button>
              <button
                type="button"
                className={`adm-pill-btn ${custFilter === 'inactive' ? 'active inactive-tab' : ''}`}
                onClick={() => setCustFilter('inactive')}
              >
                <span className="adm-filter-dot inactive-dot" />
                Inactive (<CountUp end={customerCounts.inactive} duration={1000} />)
              </button>
            </div>
          </div>

          <div className="adm-table-record-count">
            Showing <strong>{filteredOverviewCustomers.length}</strong> accounts
          </div>
        </div>

        {/* Customer Table with Horizontal & Vertical Scrolling */}
        <div className="adm-table-responsive">
          <table className="adm-table" style={{ minWidth: '1020px' }}>
            <thead>
              <tr>
                <SortableTh
                  label="Customer ID"
                  sortKey="id"
                  currentSort={custSortConfig}
                  onSort={requestCustSort}
                />
                <SortableTh
                  label="Organization & Client"
                  sortKey="company"
                  currentSort={custSortConfig}
                  onSort={requestCustSort}
                />
                <SortableTh
                  label="Contact Details"
                  sortKey="email"
                  currentSort={custSortConfig}
                  onSort={requestCustSort}
                />
                <SortableTh
                  label="Subscribed Plan"
                  sortKey="plan"
                  currentSort={custSortConfig}
                  onSort={requestCustSort}
                />
                <SortableTh
                  label="Server Node"
                  sortKey="serverNode"
                  currentSort={custSortConfig}
                  onSort={requestCustSort}
                />
                <SortableTh
                  label="Monthly MRR"
                  sortKey="mrr"
                  currentSort={custSortConfig}
                  onSort={requestCustSort}
                />
                <SortableTh
                  label="Status"
                  sortKey="status"
                  currentSort={custSortConfig}
                  onSort={requestCustSort}
                />
                <th>Quick Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedOverviewCustomers.length > 0 ? (
                sortedOverviewCustomers.map((cust) => {
                  const s = cust.status?.toLowerCase();
                  return (
                    <tr key={cust.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6366f1' }}>
                        {cust.id}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{cust.company}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{cust.name}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem', color: '#334155' }}>{cust.email}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{cust.phone}</div>
                      </td>
                      <td>
                        <span className="adm-status-pill info">{cust.plan}</span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                        {cust.serverNode}
                      </td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{cust.mrr}</td>
                      <td>
                        {s === 'demo' && (
                          <span className="adm-status-pill demo">
                            <Clock size={12} />
                            <span>Demo Trial</span>
                          </span>
                        )}
                        {(s === 'inactive' || s === 'suspended') && (
                          <span className="adm-status-pill inactive">
                            <XCircle size={12} />
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="adm-action-pill"
                          onClick={() => {
                            toast.success(`Opening profile for ${cust.company}...`);
                            navigate('/admin/customer');
                          }}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No customer accounts match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="adm-table-footer">
          <span>Enterprise client accounts connected to CtrlS Kolkata Tier-4 datacenter</span>
          <button
            type="button"
            className="adm-action-pill"
            style={{ fontWeight: 600, color: '#6366f1' }}
            onClick={() => navigate('/admin/customer')}
          >
            <span>Open Complete Customer Console →</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
         5. RECENT CONTRACT COMMITMENTS TABLE
         ========================================================================= */}
      <div className="adm-table-card">
        <div className="adm-card-header">
          <div className="adm-card-header-info">
            <h2 className="adm-section-title">Recent Contract Commitments</h2>
            <p className="adm-section-sub">
              Latest client SLAs signed across Eastern India enterprise accounts.
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

        <div className="adm-table-responsive">
          <table className="adm-table" style={{ minWidth: '950px' }}>
            <thead>
              <tr>
                <SortableTh
                  label="Contract No"
                  sortKey="id"
                  currentSort={contractSortConfig}
                  onSort={requestContractSort}
                />
                <SortableTh
                  label="Customer / Company"
                  sortKey="company"
                  currentSort={contractSortConfig}
                  onSort={requestContractSort}
                />
                <SortableTh
                  label="Service SLA"
                  sortKey="service"
                  currentSort={contractSortConfig}
                  onSort={requestContractSort}
                />
                <SortableTh
                  label="Annual Value"
                  sortKey="value"
                  currentSort={contractSortConfig}
                  onSort={requestContractSort}
                />
                <SortableTh
                  label="Expiry Date"
                  sortKey="expiryDate"
                  currentSort={contractSortConfig}
                  onSort={requestContractSort}
                />
                <SortableTh
                  label="Status"
                  sortKey="status"
                  currentSort={contractSortConfig}
                  onSort={requestContractSort}
                />
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedRecentContracts.slice(0, 5).map((c) => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.company}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.customer}</div>
                  </td>
                  <td style={{ color: '#334155' }}>{c.service}</td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{c.value}</td>
                  <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{c.expiryDate}</td>
                  <td>
                    <span
                      className={`adm-status-pill ${
                        c.status === 'active' ? 'active' : 'expiring'
                      }`}
                    >
                      <CheckCircle2 size={12} />
                      <span style={{ textTransform: 'capitalize' }}>{c.status}</span>
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="adm-action-pill"
                      onClick={() => {
                        toast.success(`Viewing ${c.company} contract details`);
                        navigate('/admin/customer/contract');
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
