import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Server,
  Activity,
  HardDrive,
  ShieldCheck,
  Monitor,
  Globe,
  Clock,
  RotateCw,
  Copy,
  Check,
  Download,
  Search,
  Filter,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  UserCheck,
  Layers,
  Sparkles,
  Wifi,
  ExternalLink,
  Headphones,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Key,
  Cpu,
  FileText,
  Smartphone,
  ArrowRight,
  Building2,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  Mail,
  Shield,
  X,
  Users,
  TrendingUp,
  TrendingDown,
  Plus,
  Play,
  Share2,
  MoreVertical,
  HelpCircle,
  Bot
} from 'lucide-react';
import toast from 'react-hot-toast';
import RemindersPanel from './RemindersPanel';
import { CountUp } from '../utils/useCountUp';
import AiInsightModal from './AiInsightModal';
import { dashboardApi } from '../../../services/dashboardApi';

const CURRENT_PLAN_DETAILS = {
  planName: 'Enterprise Tally Cloud + TSS Gold Multi-User',
  planCode: 'PLN-ENT-TALLY-CLOUD-2026',
  status: 'Active',
  statusBadge: 'Healthy & Certified',
  billingFrequency: 'Annual Subscription',
  startDate: '25 Nov 2025',
  renewalDate: '24 Nov 2026',
  daysRemaining: 28,
  basePrice: '₹18,000',
  taxAmount: '₹3,240 (18% CGST + SGST)',
  totalAmount: '₹21,240 / year',
  paymentMethod: 'Corporate NetBanking (HDFC Bank • Auto-Debit)',
  lastInvoiceNo: 'INV-2025-9941',
  modulesIncluded: [
    { title: 'TallyPrime Gold Release 5.0', desc: 'Unlimited concurrent LAN workstations with full statutory compliance' },
    { title: 'Dedicated Windows Cloud VPS', desc: '8 GB Dedicated ECC RAM, 4 vCPU Xeon, 100 GB NVMe Storage' },
    { title: 'e-Invoice & e-Way Bill API', desc: 'Automated 1-click GSP & NIC direct JSON generation' },
    { title: 'Biz Analyst Mobile App', desc: '2 Registered Smartphone Accounts with live reporting' },
    { title: 'Daily Cloud Backup Sync', desc: 'Automated 02:00 AM offsite snapshot with 30-day retention' },
    { title: 'Tier-4 Datacenter SLA', desc: '99.98% High Availability guaranteed uptime from CtrlS Kolkata' }
  ],
  quotas: [
    { label: 'Workstation Nodes', used: '4 Nodes Active', total: '10 Allowed' },
    { label: 'Dedicated Storage', used: '14.6 GB Used', total: '100 GB NVMe' },
    { label: 'RAM Utilization', used: '2.4 GB Used', total: '8.0 GB ECC' },
    { label: 'WhatsApp Dispatches', used: '3,842 Sent', total: '10,000 / mo' }
  ]
};

const ACCOUNT_DETAILS = {
  companyName: 'FlowMail Systems Pvt Ltd',
  legalEntity: 'Private Limited Company (Registered under MCA)',
  customerId: 'FM-CUST-849201',
  adminName: 'Debasish Chakraborty',
  designation: 'Managing Director & IT Systems Head',
  adminEmail: 'debasish@flowmail.agency',
  billingEmail: 'accounts@flowmail.agency',
  contactPhone: '+91 98300 12345',
  landline: '+91 (033) 4004-8800',
  gstin: '19AAACA1234A1Z5',
  pan: 'AAACA1234A',
  stateCode: '19 — West Bengal',
  registeredAddress: 'Sector V, Salt Lake City, Bidhannagar, Kolkata, West Bengal - 700091',
  primaryNodeCluster: 'CtrlS Rated-4 Datacenter (IP: 103.145.54.18)',
  security2FA: 'Enabled (SMS OTP & Google Authenticator)',
  whitelistedSubnet: '103.145.54.0/24 (Corporate Office Subnet)',
  accountManager: 'Siddharth Roy (Senior Solutions Architect)',
  accountManagerEmail: 'siddharth@flowmail.agency',
  accountManagerPhone: '+91 (033) 4004-8800 (Ext: 204)'
};

export default function CloudPortalOverview({ customer, onNavigateTab }) {
  // Modal states
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Chart interactivity state
  const [activeTooltip, setActiveTooltip] = useState(true);
  const [animateGraphs, setAnimateGraphs] = useState(false);

  // Trigger progressive animations on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateGraphs(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const customerName = customer?.name || 'Be';
  const companyName = customer?.companyName || 'FlowMail Agency';
  const currentPlan = CURRENT_PLAN_DETAILS;
  const accountDetails = ACCOUNT_DETAILS;

  // Escape key closes modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsPlanModalOpen(false);
        setIsAccountModalOpen(false);
        setIsAiModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flowmail-overview-container animate-fade-in">
      {/* ── 1. Top Greeting Row with Action Buttons (FlowMail Style) ── */}
      <section className="flowmail-welcome-banner">
        <div className="flowmail-welcome-text">
          <h2 className="flowmail-welcome-title">Welcome back, {customerName}!</h2>
          <p className="flowmail-welcome-sub">Welcome back! Here's what's happening today.</p>
        </div>
      </section>

      {/* ── 2. Top 4 Metric Cards with CountUp Animations from 0 ── */}
      <section className="flowmail-kpi-grid" aria-label="Key Performance Indicators">
        {/* Card 1: Total Campaigns */}
        <div className="flowmail-kpi-card">
          <div className="flowmail-kpi-top">
            <div className="flowmail-kpi-label-group">
              <Mail size={16} className="flowmail-kpi-icon" />
              <span className="flowmail-kpi-label">Total Campaigns</span>
            </div>
            <button type="button" className="flowmail-dots-btn" aria-label="More options">
              <MoreVertical size={15} />
            </button>
          </div>

          <div className="flowmail-kpi-middle">
            <div className="flowmail-kpi-number">
              <CountUp end={24} duration={1500} />
            </div>
            <div className="flowmail-trend-pill positive">
              <TrendingUp size={13} />
              <span>+<CountUp end={12} duration={1400} />%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Contacts */}
        <div className="flowmail-kpi-card">
          <div className="flowmail-kpi-top">
            <div className="flowmail-kpi-label-group">
              <Users size={16} className="flowmail-kpi-icon" />
              <span className="flowmail-kpi-label">Active Contacts</span>
            </div>
            <button type="button" className="flowmail-dots-btn" aria-label="More options">
              <MoreVertical size={15} />
            </button>
          </div>

          <div className="flowmail-kpi-middle">
            <div className="flowmail-kpi-number">
              <CountUp end={8429} separator="," duration={1600} />
            </div>
            <div className="flowmail-trend-pill positive">
              <TrendingUp size={13} />
              <span>+<CountUp end={23} duration={1500} />%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Avg. Open Rate */}
        <div className="flowmail-kpi-card">
          <div className="flowmail-kpi-top">
            <div className="flowmail-kpi-label-group">
              <Activity size={16} className="flowmail-kpi-icon" />
              <span className="flowmail-kpi-label">Avg. Open Rate</span>
            </div>
            <button type="button" className="flowmail-dots-btn" aria-label="More options">
              <MoreVertical size={15} />
            </button>
          </div>

          <div className="flowmail-kpi-middle">
            <div className="flowmail-kpi-number">
              <CountUp end={42.8} decimals={1} duration={1700} suffix="%" />
            </div>
            <div className="flowmail-trend-pill positive">
              <TrendingUp size={13} />
              <span>+<CountUp end={5.2} decimals={1} duration={1600} />%</span>
            </div>
          </div>
        </div>

        {/* Card 4: Revenue (MTD) */}
        <div className="flowmail-kpi-card">
          <div className="flowmail-kpi-top">
            <div className="flowmail-kpi-label-group">
              <CreditCard size={16} className="flowmail-kpi-icon" />
              <span className="flowmail-kpi-label">Revenue (MTD)</span>
            </div>
            <button type="button" className="flowmail-dots-btn" aria-label="More options">
              <MoreVertical size={15} />
            </button>
          </div>

          <div className="flowmail-kpi-middle">
            <div className="flowmail-kpi-number">
              <CountUp end={12450} prefix="$" separator="," duration={1800} />
            </div>
            <div className="flowmail-trend-pill negative">
              <TrendingDown size={13} />
              <span>-<CountUp end={2.4} decimals={1} duration={1600} />%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Middle Section: Performance Chart, Donut Chart, Top Automations ── */}
      <section className="flowmail-middle-grid">
        {/* Middle Left: Campaign Performance Spline Chart */}
        <div className="flowmail-card flowmail-chart-card">
          <div className="flowmail-card-header-row">
            <div>
              <h3 className="flowmail-card-title">Campaign Performance</h3>
              <p className="flowmail-card-subtitle">Last 30 days overview</p>
            </div>
            <div className="flowmail-chart-legend">
              <span className="legend-dot-item">
                <span className="legend-dot purple" /> Opens
              </span>
              <span className="legend-dot-item">
                <span className="legend-dot blue" /> Clicks
              </span>
              <span className="legend-dot-item">
                <span className="legend-dot orange" /> Conversions
              </span>
            </div>
          </div>

          <div className="flowmail-chart-wrapper">
            <svg
              className={`flowmail-spline-svg ${animateGraphs ? 'is-animated' : ''}`}
              viewBox="0 0 600 240"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.00" />
                </linearGradient>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.00" />
                </linearGradient>
                <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="50" y1="30" x2="580" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="50" y1="80" x2="580" y2="80" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="50" y1="130" x2="580" y2="130" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="50" y1="180" x2="580" y2="180" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="50" y1="210" x2="580" y2="210" stroke="#e2e8f0" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="38" y="34" className="chart-axis-text">3200</text>
              <text x="38" y="84" className="chart-axis-text">2400</text>
              <text x="38" y="134" className="chart-axis-text">1600</text>
              <text x="38" y="184" className="chart-axis-text">800</text>
              <text x="38" y="214" className="chart-axis-text">0</text>

              {/* Area Fills */}
              <path
                d="M 60 170 Q 110 50, 160 55 T 260 110 T 360 80 T 460 110 T 560 110 L 560 210 L 60 210 Z"
                fill="url(#purpleGradient)"
                className="flowmail-area-fill"
              />

              {/* Purple Curve (Opens) */}
              <path
                d="M 60 170 Q 110 50, 160 55 T 260 110 T 360 80 T 460 110 T 560 110"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.8"
                strokeLinecap="round"
                className="flowmail-chart-line path-purple"
              />

              {/* Blue Curve (Clicks) */}
              <path
                d="M 60 185 Q 110 115, 160 120 T 260 145 T 360 135 T 460 140 T 560 140"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeLinecap="round"
                className="flowmail-chart-line path-blue"
              />

              {/* Orange Curve (Conversions) */}
              <path
                d="M 60 195 Q 110 170, 160 170 T 260 180 T 360 175 T 460 165 T 560 165"
                fill="none"
                stroke="#f97316"
                strokeWidth="2"
                strokeLinecap="round"
                className="flowmail-chart-line path-orange"
              />

              {/* Dashed Indicator Line for Active Tooltip */}
              <line
                x1="260"
                y1="30"
                x2="260"
                y2="210"
                stroke="#cbd5e1"
                strokeDasharray="4 4"
                strokeWidth="1.5"
                className="flowmail-cursor-line"
              />

              {/* Dots on Curves */}
              <circle cx="260" cy="110" r="4.5" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
              <circle cx="260" cy="145" r="4" fill="#94a3b8" stroke="#ffffff" strokeWidth="2" />
              <circle cx="260" cy="180" r="4" fill="#f97316" stroke="#ffffff" strokeWidth="2" />
            </svg>

            {/* Interactive Tooltip Card Floating on Chart */}
            <div className="flowmail-chart-tooltip" style={{ left: '43%', top: '35%' }}>
              <div className="tooltip-title">March</div>
              <div className="tooltip-row">
                <span className="tooltip-dot purple" />
                <span className="tooltip-label">Opens:</span>
                <span className="tooltip-value font-semibold">
                  <CountUp end={2600} duration={1400} />
                </span>
              </div>
              <div className="tooltip-row">
                <span className="tooltip-dot blue" />
                <span className="tooltip-label">Clicks:</span>
                <span className="tooltip-value font-semibold">
                  <CountUp end={1200} duration={1500} />
                </span>
              </div>
              <div className="tooltip-row">
                <span className="tooltip-dot orange" />
                <span className="tooltip-label">Conversions:</span>
                <span className="tooltip-value font-semibold">
                  <CountUp end={800} duration={1600} />
                </span>
              </div>
            </div>

            {/* X Axis Labels */}
            <div className="flowmail-x-axis">
              <span>Mar 1</span>
              <span>Mar 5</span>
              <span>Mar 10</span>
              <span>Mar 15</span>
              <span>Mar 20</span>
              <span>Mar 25</span>
              <span>Mar 31</span>
            </div>
          </div>
        </div>

        {/* Middle Center: Campaign Types Donut Chart */}
        <div className="flowmail-card flowmail-donut-card">
          <div className="flowmail-card-header-row">
            <div>
              <h3 className="flowmail-card-title">Campaign Types</h3>
              <p className="flowmail-card-subtitle">Distribution</p>
            </div>
          </div>

          <div className="flowmail-donut-body">
            <div className="flowmail-donut-container">
              <svg className="flowmail-donut-svg" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="15"
                />
                {/* Animated Primary Violet Segment (35%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#6366f1"
                  strokeWidth="15"
                  strokeDasharray="238.7"
                  strokeDashoffset={animateGraphs ? '155.15' : '238.7'}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  className="flowmail-donut-segment"
                />
              </svg>

              <div className="flowmail-donut-center">
                <span className="donut-center-label">Newsletter</span>
                <span className="donut-center-percent">
                  <CountUp end={35} duration={1600} suffix="%" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Right: Top Automations */}
        <div className="flowmail-card flowmail-automations-card">
          <div className="flowmail-card-header-row">
            <div>
              <h3 className="flowmail-card-title">Top Automations</h3>
              <p className="flowmail-card-subtitle">Best performers</p>
            </div>
            <button
              type="button"
              className="flowmail-view-all-link"
              onClick={() => onNavigateTab && onNavigateTab('products')}
            >
              View All
            </button>
          </div>

          <div className="flowmail-automations-list">
            {/* Automation Item 1 */}
            <div className="flowmail-auto-item">
              <div className="flowmail-auto-meta">
                <span className="flowmail-auto-name">Welcome Series</span>
                <span className="flowmail-auto-rate">
                  <CountUp end={87.1} decimals={1} duration={1600} suffix="%" />
                </span>
              </div>
              <div className="flowmail-auto-subs">
                <span>342 triggered</span>
                <span>298 completed</span>
              </div>
              <div className="flowmail-progress-track">
                <div
                  className="flowmail-progress-bar"
                  style={{ width: animateGraphs ? '87.1%' : '0%' }}
                />
              </div>
            </div>

            {/* Automation Item 2 */}
            <div className="flowmail-auto-item">
              <div className="flowmail-auto-meta">
                <span className="flowmail-auto-name">Re-engagement Campaign</span>
                <span className="flowmail-auto-rate">
                  <CountUp end={57.0} decimals={1} duration={1700} suffix="%" />
                </span>
              </div>
              <div className="flowmail-auto-subs">
                <span>156 triggered</span>
                <span>89 completed</span>
              </div>
              <div className="flowmail-progress-track">
                <div
                  className="flowmail-progress-bar"
                  style={{ width: animateGraphs ? '57%' : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Bottom Section: Audience Growth, Recent Campaigns, AI Insights ── */}
      <section className="flowmail-bottom-grid">
        {/* Bottom Left: Audience Growth Bar Chart */}
        <div className="flowmail-card flowmail-growth-card">
          <div className="flowmail-card-header-row">
            <div>
              <h3 className="flowmail-card-title">Audience Growth</h3>
            </div>
          </div>

          <div className="flowmail-bar-chart-body">
            {/* Y axis numbers */}
            <div className="flowmail-bar-y-axis">
              <span>10000</span>
              <span>7500</span>
              <span>5000</span>
              <span>2500</span>
              <span>0</span>
            </div>

            {/* Bars wrapper */}
            <div className="flowmail-bars-columns">
              {/* Oct */}
              <div className="flowmail-bar-col">
                <div className="flowmail-bar-track">
                  <div
                    className="flowmail-bar-fill"
                    style={{ height: animateGraphs ? '48%' : '0%' }}
                  />
                </div>
                <span className="flowmail-bar-month">Oct</span>
              </div>

              {/* Nov */}
              <div className="flowmail-bar-col">
                <div className="flowmail-bar-track">
                  <div
                    className="flowmail-bar-fill"
                    style={{ height: animateGraphs ? '64%' : '0%' }}
                  />
                </div>
                <span className="flowmail-bar-month">Nov</span>
              </div>

              {/* Dec (Highlighted Purple with floating Badge 9800) */}
              <div className="flowmail-bar-col highlight">
                <div className="flowmail-bar-track">
                  <div
                    className="flowmail-bar-fill active-purple"
                    style={{ height: animateGraphs ? '96%' : '0%' }}
                  >
                    <span className="flowmail-active-badge">
                      <CountUp end={9800} duration={1700} />
                    </span>
                  </div>
                </div>
                <span className="flowmail-bar-month active">Dec</span>
              </div>

              {/* Jan */}
              <div className="flowmail-bar-col">
                <div className="flowmail-bar-track">
                  <div
                    className="flowmail-bar-fill"
                    style={{ height: animateGraphs ? '52%' : '0%' }}
                  />
                </div>
                <span className="flowmail-bar-month">Jan</span>
              </div>

              {/* Feb */}
              <div className="flowmail-bar-col">
                <div className="flowmail-bar-track">
                  <div
                    className="flowmail-bar-fill"
                    style={{ height: animateGraphs ? '70%' : '0%' }}
                  />
                </div>
                <span className="flowmail-bar-month">Feb</span>
              </div>

              {/* Mar */}
              <div className="flowmail-bar-col">
                <div className="flowmail-bar-track">
                  <div
                    className="flowmail-bar-fill"
                    style={{ height: animateGraphs ? '60%' : '0%' }}
                  />
                </div>
                <span className="flowmail-bar-month">Mar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Center: Recent Campaigns Table */}
        <div className="flowmail-card flowmail-recent-card">
          <div className="flowmail-card-header-row">
            <div>
              <h3 className="flowmail-card-title">Recent Campaigns</h3>
            </div>
            <button
              type="button"
              className="flowmail-view-all-link"
              onClick={() => onNavigateTab && onNavigateTab('products')}
            >
              View All
            </button>
          </div>

          <div className="flowmail-table-wrap">
            <table className="flowmail-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th>Sent</th>
                  <th>Opens</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium text-slate-800">Spring Sale Launch</td>
                  <td>
                    <span className="flowmail-status-badge active">Active</span>
                  </td>
                  <td>
                    <CountUp end={2450} separator="," duration={1500} />
                  </td>
                  <td>
                    <CountUp end={1089} separator="," duration={1500} />
                  </td>
                  <td>
                    <button type="button" className="flowmail-row-menu" aria-label="Row options">
                      <MoreVertical size={14} />
                    </button>
                  </td>
                </tr>

                <tr>
                  <td className="font-medium text-slate-800">Weekly Newslett...</td>
                  <td>
                    <span className="flowmail-status-badge scheduled">Scheduled</span>
                  </td>
                  <td>
                    <CountUp end={2450} separator="," duration={1500} />
                  </td>
                  <td>
                    <CountUp end={1089} separator="," duration={1500} />
                  </td>
                  <td>
                    <button type="button" className="flowmail-row-menu" aria-label="Row options">
                      <MoreVertical size={14} />
                    </button>
                  </td>
                </tr>

                <tr>
                  <td className="font-medium text-slate-800">Abandoned Cart...</td>
                  <td>
                    <span className="flowmail-status-badge active">Active</span>
                  </td>
                  <td>
                    <CountUp end={2450} separator="," duration={1500} />
                  </td>
                  <td>
                    <CountUp end={1089} separator="," duration={1500} />
                  </td>
                  <td>
                    <button type="button" className="flowmail-row-menu" aria-label="Row options">
                      <MoreVertical size={14} />
                    </button>
                  </td>
                </tr>

                <tr>
                  <td className="font-medium text-slate-800">Product Update...</td>
                  <td>
                    <span className="flowmail-status-badge completed">Completed</span>
                  </td>
                  <td>
                    <CountUp end={2450} separator="," duration={1500} />
                  </td>
                  <td>
                    <CountUp end={1089} separator="," duration={1500} />
                  </td>
                  <td>
                    <button type="button" className="flowmail-row-menu" aria-label="Row options">
                      <MoreVertical size={14} />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Right: AI Insights Widget */}
        <div className="flowmail-card flowmail-insights-card">
          <div className="flowmail-card-header-row">
            <div>
              <h3 className="flowmail-card-title">AI Insights</h3>
            </div>
          </div>

          <div className="flowmail-insights-items-wrap">
            {/* Item 1 */}
            <div className="flowmail-insight-pill-box">
              <div className="flowmail-insight-icon-box">
                <Clock size={16} />
              </div>
              <div className="flowmail-insight-text">
                <span className="flowmail-insight-heading">Best Send Time</span>
                <span className="flowmail-insight-sub">Tuesday at 10 AM shows highest open rates.</span>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flowmail-insight-pill-box">
              <div className="flowmail-insight-icon-box">
                <Mail size={16} />
              </div>
              <div className="flowmail-insight-text">
                <span className="flowmail-insight-heading">Subject Line Tip</span>
                <span className="flowmail-insight-sub">Adding personalization boosts conversions by 22%.</span>
              </div>
            </div>

            {/* Open AI Assistant Gradient Button */}
            <button
              type="button"
              className="flowmail-open-assistant-btn"
              onClick={() => setIsAiModalOpen(true)}
            >
              <Sparkles size={16} />
              <span>Open AI Assistant</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 5. Plan Reminders Section (FlowMail Clean Card Styling) ── */}
      <section className="flowmail-reminders-section" aria-label="Renewal Reminders">
        <RemindersPanel onNavigate={onNavigateTab} />
      </section>

      {/* ── 6. Plan Details & Account Details Cards ── */}
      <section className="flowmail-details-grid" aria-label="Plan and Account Overview">
        {/* Current Plan Details */}
        <div className="flowmail-card flowmail-plan-box">
          <div className="flowmail-card-header-row">
            <div className="flowmail-card-title-group">
              <div className="flowmail-plan-icon-wrap">
                <Package size={18} />
              </div>
              <div>
                <h3 className="flowmail-card-title">Current Plan Details</h3>
                <span className="flowmail-card-subtitle">{currentPlan.planName}</span>
              </div>
            </div>
            <button
              type="button"
              className="flowmail-card-details-btn"
              onClick={() => setIsPlanModalOpen(true)}
              title="Click to view all plan details"
            >
              <span>Details</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="flowmail-plan-quick-grid">
            <div className="flowmail-plan-quick-item">
              <span className="flowmail-lbl">Plan Code</span>
              <span className="flowmail-val">{currentPlan.planCode}</span>
            </div>
            <div className="flowmail-plan-quick-item">
              <span className="flowmail-lbl">Renewal Due</span>
              <span className="flowmail-val text-amber">
                {currentPlan.renewalDate} (<CountUp end={currentPlan.daysRemaining} /> days left)
              </span>
            </div>
            <div className="flowmail-plan-quick-item">
              <span className="flowmail-lbl">Annual Rate</span>
              <span className="flowmail-val font-semibold">{currentPlan.totalAmount}</span>
            </div>
            <div className="flowmail-plan-quick-item">
              <span className="flowmail-lbl">Status</span>
              <span className="flowmail-status-badge active">{currentPlan.status}</span>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="flowmail-card flowmail-account-box">
          <div className="flowmail-card-header-row">
            <div className="flowmail-card-title-group">
              <div className="flowmail-account-icon-wrap">
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="flowmail-card-title">Account Details</h3>
                <span className="flowmail-card-subtitle">Verified Profile & Security</span>
              </div>
            </div>
            <button
              type="button"
              className="flowmail-card-details-btn"
              onClick={() => setIsAccountModalOpen(true)}
              title="Click to view account details"
            >
              <span>Details</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="flowmail-plan-quick-grid">
            <div className="flowmail-plan-quick-item">
              <span className="flowmail-lbl">Company</span>
              <span className="flowmail-val">{companyName}</span>
            </div>
            <div className="flowmail-plan-quick-item">
              <span className="flowmail-lbl">Admin Email</span>
              <span className="flowmail-val">{accountDetails.adminEmail}</span>
            </div>
            <div className="flowmail-plan-quick-item">
              <span className="flowmail-lbl">GSTIN</span>
              <span className="flowmail-val font-mono">{accountDetails.gstin}</span>
            </div>
            <div className="flowmail-plan-quick-item">
              <span className="flowmail-lbl">2FA Protection</span>
              <span className="flowmail-val text-emerald">
                <CheckCircle2 size={13} style={{ display: 'inline', marginRight: 4 }} />
                Enabled
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODALS: Plan Details & Account Details ── */}
      {isPlanModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="cliento-modal-backdrop" onClick={() => setIsPlanModalOpen(false)}>
          <div className="cliento-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="cliento-modal-header">
              <div className="cliento-modal-title-group">
                <div className="cliento-modal-icon-wrap" style={{ background: '#ede9fe', color: '#6366f1' }}>
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="cliento-modal-title">Comprehensive Plan Specifications</h3>
                  <span className="cliento-modal-subtitle">
                    Full breakdown of entitlements, billing schedule & datacenter SLA
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="cliento-modal-close-btn"
                onClick={() => setIsPlanModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="cliento-modal-body">
              <div className="cliento-modal-hero-bar">
                <div>
                  <span className="cliento-modal-tag">{currentPlan.planCode}</span>
                  <h4 className="cliento-modal-plan-title">{currentPlan.planName}</h4>
                  <span className="cliento-modal-plan-meta">
                    Billing: {currentPlan.billingFrequency} &middot; Started: {currentPlan.startDate}
                  </span>
                </div>
                <div className="cliento-modal-hero-right">
                  <span className="cliento-modal-price">{currentPlan.totalAmount}</span>
                  <span className="cliento-modal-tax-note">Includes 18% GST ({currentPlan.taxAmount})</span>
                </div>
              </div>

              <div className="cliento-modal-alert-box">
                <Clock size={16} color="#d97706" />
                <span>
                  Next Plan Renewal is due on <strong>{currentPlan.renewalDate}</strong> (<CountUp end={currentPlan.daysRemaining} /> days remaining).
                </span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Account Details Modal */}
      {isAccountModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="cliento-modal-backdrop" onClick={() => setIsAccountModalOpen(false)}>
          <div className="cliento-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="cliento-modal-header">
              <div className="cliento-modal-title-group">
                <div className="cliento-modal-icon-wrap" style={{ background: '#ede9fe', color: '#6366f1' }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="cliento-modal-title">Official Customer & Tax Profile</h3>
                  <span className="cliento-modal-subtitle">
                    Corporate entity registration & verified credentials
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="cliento-modal-close-btn"
                onClick={() => setIsAccountModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="cliento-modal-body">
              <div className="cliento-modal-hero-bar">
                <div>
                  <span className="cliento-modal-tag">ID: {accountDetails.customerId}</span>
                  <h4 className="cliento-modal-plan-title">{accountDetails.companyName}</h4>
                  <span className="cliento-modal-plan-meta">{accountDetails.legalEntity}</span>
                </div>
              </div>

              <div className="cliento-modal-specs-grid">
                <div className="cliento-spec-box">
                  <span className="cliento-spec-lbl">Primary Admin</span>
                  <span className="cliento-spec-val">{accountDetails.adminName}</span>
                </div>
                <div className="cliento-spec-box">
                  <span className="cliento-spec-lbl">Official Email</span>
                  <span className="cliento-spec-val">{accountDetails.adminEmail}</span>
                </div>
                <div className="cliento-spec-box">
                  <span className="cliento-spec-lbl">GSTIN</span>
                  <span className="cliento-spec-val font-mono">{accountDetails.gstin}</span>
                </div>
                <div className="cliento-spec-box">
                  <span className="cliento-spec-lbl">2FA Status</span>
                  <span className="cliento-spec-val text-emerald">{accountDetails.security2FA}</span>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* AI Assistant Insight Modal */}
      <AiInsightModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
    </div>
  );
}
