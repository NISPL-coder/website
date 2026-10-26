import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../../assets/NISPL Cloud Tech Logo Black.png';
import {
  LayoutDashboard,
  BarChart3,
  ShoppingBag,
  Users,
  Package,
  MessageSquare,
  CreditCard,
  FileText,
  Settings,
  Search,
  Calendar,
  Bell,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Check,
  Clock,
  Sparkles,
  Crown,
  Sun,
  Moon,
  LogOut,
  ArrowUpRight,
  Shield,
  Layers,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import './Dashboard.css';

export default function Dashboard({ userSession, onSignOut }) {
  const navigate = useNavigate();

  // State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState('May 12 - Jun 10, 2024');
  const [chartView, setChartView] = useState('Daily');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Task list items with interactive checkbox
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Update cloud server configurations', progress: 75, completed: true, color: '#3b82f6' },
    { id: 2, title: 'Review Tally Prime partner feedback', progress: 60, completed: true, color: '#06b6d4' },
    { id: 3, title: 'Prepare monthly NOC compliance report', progress: 40, completed: false, color: '#8b5cf6' },
    { id: 4, title: 'Optimize datacenter bandwidth throughput', progress: 20, completed: false, color: '#f59e0b' }
  ]);

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // User details fallback from session
  const userName = userSession?.user ? userSession.user.split('@')[0] : 'John Doe';
  const userRole = userSession?.role || 'Administrator';
  const portalTitle = userSession?.portal || 'NISPL Enterprise';

  const handleLogout = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      navigate('/login');
    }
  };

  return (
    <div className={`nx-dashboard-layout ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      
      {/* =====================================================================
          1. LEFT SIDEBAR
          ===================================================================== */}
      <aside className="nx-sidebar">
        {/* Brand Header */}
        <div className="nx-sidebar-header">
          <Link to="/" className="nx-brand-link">
            <img 
              src={logoImg} 
              alt="NISPL Logo" 
              className="nx-brand-logo-img" 
            />
          </Link>
          <button 
            type="button" 
            className="nx-collapse-btn" 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar"
          >
            {isSidebarCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="nx-nav-list" aria-label="Dashboard Navigation">
          <button 
            type="button" 
            className={`nx-nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveNav('dashboard')}
          >
            <LayoutDashboard size={19} className="nx-nav-icon" />
            <span className="nx-nav-label">Dashboard</span>
          </button>

          <button 
            type="button" 
            className={`nx-nav-item ${activeNav === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveNav('analytics')}
          >
            <BarChart3 size={19} className="nx-nav-icon" />
            <span className="nx-nav-label">Analytics</span>
          </button>

          <button 
            type="button" 
            className={`nx-nav-item ${activeNav === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveNav('orders')}
          >
            <ShoppingBag size={19} className="nx-nav-icon" />
            <span className="nx-nav-label">Orders</span>
          </button>

          <button 
            type="button" 
            className={`nx-nav-item ${activeNav === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveNav('customers')}
          >
            <Users size={19} className="nx-nav-icon" />
            <span className="nx-nav-label">Customers</span>
          </button>

          <button 
            type="button" 
            className={`nx-nav-item ${activeNav === 'products' ? 'active' : ''}`}
            onClick={() => setActiveNav('products')}
          >
            <Package size={19} className="nx-nav-icon" />
            <span className="nx-nav-label">Products</span>
          </button>

          <button 
            type="button" 
            className={`nx-nav-item ${activeNav === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveNav('messages')}
          >
            <MessageSquare size={19} className="nx-nav-icon" />
            <span className="nx-nav-label">Messages</span>
            <span className="nx-nav-badge">8</span>
          </button>

          <button 
            type="button" 
            className={`nx-nav-item ${activeNav === 'finance' ? 'active' : ''}`}
            onClick={() => setActiveNav('finance')}
          >
            <CreditCard size={19} className="nx-nav-icon" />
            <span className="nx-nav-label">Finance</span>
          </button>

          <button 
            type="button" 
            className={`nx-nav-item ${activeNav === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveNav('reports')}
          >
            <FileText size={19} className="nx-nav-icon" />
            <span className="nx-nav-label">Reports</span>
          </button>

          <button 
            type="button" 
            className={`nx-nav-item ${activeNav === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveNav('settings')}
          >
            <Settings size={19} className="nx-nav-icon" />
            <span className="nx-nav-label">Settings</span>
          </button>
        </nav>

        {/* Sidebar Footer Callout Card */}
        <div className="nx-sidebar-footer">
          {!isSidebarCollapsed && (
            <div className="nx-upgrade-card">
              <div className="nx-crown-chip">
                <Crown size={18} color="#D97706" />
              </div>
              <h4 className="nx-upgrade-title">Upgrade to Pro</h4>
              <p className="nx-upgrade-desc">
                Unlock advanced analytics, reports and priority NOC support.
              </p>
              <button 
                type="button" 
                className="nx-upgrade-btn"
                onClick={() => alert("Redirecting to NISPL Enterprise Tier Licensing...")}
              >
                Upgrade Now
              </button>
            </div>
          )}

          {/* Theme & Sign Out Row */}
          <div className="nx-sidebar-bottom-actions">
            <div className="nx-mode-pill">
              <Sun size={15} />
              <span className="nx-mode-label">Light</span>
              <ChevronDown size={14} className="nx-mode-arrow" />
            </div>

            <button 
              type="button" 
              className="nx-logout-icon-btn"
              onClick={handleLogout}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* =====================================================================
          2. MAIN CONTENT AREA (Header + Dashboard Body)
          ===================================================================== */}
      <div className="nx-main-wrapper">
        
        {/* Top Header Bar */}
        <header className="nx-top-header">
          {/* Search Bar with Shortcut */}
          <div className="nx-header-search">
            <Search size={16} className="nx-search-icon" />
            <input 
              type="text" 
              className="nx-search-input" 
              placeholder="Search for anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="nx-search-kbd">⌘ K</div>
          </div>

          {/* Right Header Utilities */}
          <div className="nx-header-actions">
            {/* Date Range Picker */}
            <div className="nx-date-picker-btn">
              <Calendar size={15} />
              <span>{selectedPeriod}</span>
              <ChevronDown size={14} />
            </div>

            {/* Notification Bell */}
            <div className="nx-notify-wrap">
              <button 
                type="button" 
                className="nx-icon-action-btn"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className="nx-icon-badge red">12</span>
              </button>
            </div>

            {/* Messages Quick Icon */}
            <button 
              type="button" 
              className="nx-icon-action-btn"
              onClick={() => setActiveNav('messages')}
              aria-label="Messages"
            >
              <MessageSquare size={18} />
              <span className="nx-icon-badge purple">5</span>
            </button>

            {/* User Profile Pill & Dropdown */}
            <div className="nx-profile-dropdown-wrap">
              <button 
                type="button" 
                className="nx-profile-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
                  alt={userName} 
                  className="nx-avatar-img"
                />
                <div className="nx-profile-text">
                  <span className="nx-profile-name">{userName}</span>
                  <span className="nx-profile-role">{userRole}</span>
                </div>
              </button>

              {isProfileMenuOpen && (
                <div className="nx-profile-popover animate-fade-in">
                  <div className="nx-popover-user-info">
                    <strong>{userName}</strong>
                    <small>{userSession?.user || 'admin@netinfotechsystem.in'}</small>
                    <span className="nx-popover-badge">{portalTitle}</span>
                  </div>
                  <div className="nx-popover-divider" />
                  <button type="button" className="nx-popover-item" onClick={() => setActiveNav('settings')}>
                    <Settings size={15} />
                    <span>Account Settings</span>
                  </button>
                  <button type="button" className="nx-popover-item" onClick={() => setActiveNav('analytics')}>
                    <Activity size={15} />
                    <span>System Status</span>
                  </button>
                  <div className="nx-popover-divider" />
                  <button type="button" className="nx-popover-item text-danger" onClick={handleLogout}>
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="nx-dashboard-body">
          
          {/* Welcome Headline */}
          <div className="nx-welcome-banner">
            <h1 className="nx-welcome-title">Admin Dashboard</h1>
            <p className="nx-welcome-sub">
              Welcome back, <b>{userName}</b>! Here's what's happening with your store today.
            </p>
          </div>

          {/* ===================================================================
              3. TOP 4 METRIC CARDS (KPIs with Sparklines)
              =================================================================== */}
          <div className="nx-kpi-grid">
            {/* Card 1: Revenue */}
            <div className="nx-kpi-card">
              <div className="nx-kpi-top">
                <div className="nx-kpi-icon-box blue">
                  <span className="nx-kpi-symbol">$</span>
                </div>
                <div className="nx-kpi-sparkline">
                  <svg viewBox="0 0 100 35" fill="none" className="spark-svg">
                    <path d="M0 25 Q25 30 50 15 T100 8" stroke="#3b82f6" strokeWidth="2.5" fill="none" />
                  </svg>
                </div>
              </div>
              <div className="nx-kpi-body">
                <span className="nx-kpi-label">Revenue</span>
                <h3 className="nx-kpi-val">$128,430.50</h3>
                <div className="nx-kpi-trend green">
                  <TrendingUp size={14} />
                  <span><b>12.5%</b> vs Apr 12 - May 11</span>
                </div>
              </div>
            </div>

            {/* Card 2: Orders */}
            <div className="nx-kpi-card">
              <div className="nx-kpi-top">
                <div className="nx-kpi-icon-box purple">
                  <ShoppingBag size={18} />
                </div>
                <div className="nx-kpi-sparkline">
                  <svg viewBox="0 0 100 35" fill="none" className="spark-svg">
                    <path d="M0 20 Q20 8 40 22 T80 10 T100 15" stroke="#a855f7" strokeWidth="2.5" fill="none" />
                  </svg>
                </div>
              </div>
              <div className="nx-kpi-body">
                <span className="nx-kpi-label">Orders</span>
                <h3 className="nx-kpi-val">1,542</h3>
                <div className="nx-kpi-trend green">
                  <TrendingUp size={14} />
                  <span><b>8.3%</b> vs Apr 12 - May 11</span>
                </div>
              </div>
            </div>

            {/* Card 3: Users */}
            <div className="nx-kpi-card">
              <div className="nx-kpi-top">
                <div className="nx-kpi-icon-box teal">
                  <Users size={18} />
                </div>
                <div className="nx-kpi-sparkline">
                  <svg viewBox="0 0 100 35" fill="none" className="spark-svg">
                    <path d="M0 28 Q30 18 60 24 T100 6" stroke="#06b6d4" strokeWidth="2.5" fill="none" />
                  </svg>
                </div>
              </div>
              <div className="nx-kpi-body">
                <span className="nx-kpi-label">Users</span>
                <h3 className="nx-kpi-val">8,458</h3>
                <div className="nx-kpi-trend green">
                  <TrendingUp size={14} />
                  <span><b>15.7%</b> vs Apr 12 - May 11</span>
                </div>
              </div>
            </div>

            {/* Card 4: Conversion Rate */}
            <div className="nx-kpi-card">
              <div className="nx-kpi-top">
                <div className="nx-kpi-icon-box rose">
                  <Activity size={18} />
                </div>
                <div className="nx-kpi-sparkline">
                  <svg viewBox="0 0 100 35" fill="none" className="spark-svg">
                    <path d="M0 18 Q20 30 40 12 T80 26 T100 8" stroke="#f43f5e" strokeWidth="2.5" fill="none" />
                  </svg>
                </div>
              </div>
              <div className="nx-kpi-body">
                <span className="nx-kpi-label">Conversion Rate</span>
                <h3 className="nx-kpi-val">3.27%</h3>
                <div className="nx-kpi-trend green">
                  <TrendingUp size={14} />
                  <span><b>5.4%</b> vs Apr 12 - May 11</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================
              4. MIDDLE 3-PANEL CHARTS SECTION
              =================================================================== */}
          <div className="nx-charts-grid">
            
            {/* Chart 1: Revenue Overview Curve with Tooltip */}
            <div className="nx-panel-card nx-revenue-panel">
              <div className="nx-panel-header">
                <div>
                  <h4 className="nx-panel-title">Revenue Overview</h4>
                </div>
                <div className="nx-panel-select-wrap">
                  <select 
                    value={chartView} 
                    onChange={(e) => setChartView(e.target.value)}
                    className="nx-panel-select"
                  >
                    <option value="Daily">Daily ▾</option>
                    <option value="Weekly">Weekly ▾</option>
                    <option value="Monthly">Monthly ▾</option>
                  </select>
                </div>
              </div>

              {/* Spline Area Chart */}
              <div className="nx-spline-chart-wrap">
                <svg viewBox="0 0 500 180" className="nx-spline-svg" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="revenueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  <line x1="40" y1="20" x2="490" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="40" y1="60" x2="490" y2="60" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="40" y1="100" x2="490" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="40" y1="140" x2="490" y2="140" stroke="#f1f5f9" strokeDasharray="3 3" />

                  {/* Gradient Area Fill */}
                  <path 
                    d="M 50 120 Q 110 110 160 65 T 260 90 T 360 40 T 470 70 L 470 150 L 50 150 Z" 
                    fill="url(#revenueAreaGrad)" 
                  />

                  {/* Spline Stroke */}
                  <path 
                    d="M 50 120 Q 110 110 160 65 T 260 90 T 360 40 T 470 70" 
                    fill="none" 
                    stroke="#0284c7" 
                    strokeWidth="3" 
                  />

                  {/* Data Points */}
                  <circle cx="50" cy="120" r="4.5" fill="#ffffff" stroke="#0284c7" strokeWidth="2.5" />
                  <circle cx="160" cy="65" r="4.5" fill="#ffffff" stroke="#0284c7" strokeWidth="2.5" />
                  <circle cx="260" cy="90" r="5" fill="#ffffff" stroke="#0284c7" strokeWidth="3" />
                  <circle cx="360" cy="40" r="4.5" fill="#ffffff" stroke="#0284c7" strokeWidth="2.5" />
                  <circle cx="470" cy="70" r="4.5" fill="#ffffff" stroke="#0284c7" strokeWidth="2.5" />
                </svg>

                {/* Simulated Floating Tooltip */}
                <div className="nx-spline-tooltip">
                  <span className="tooltip-date">May 22, 2024</span>
                  <span className="tooltip-val">$24,780.00</span>
                </div>

                {/* X Axis labels */}
                <div className="nx-axis-x">
                  <span>May 12</span>
                  <span>May 17</span>
                  <span>May 22</span>
                  <span>May 27</span>
                  <span>Jun 1</span>
                  <span>Jun 6</span>
                  <span>Jun 10</span>
                </div>
              </div>
            </div>

            {/* Chart 2: Orders by Status Bar Chart */}
            <div className="nx-panel-card nx-orders-panel">
              <div className="nx-panel-header">
                <h4 className="nx-panel-title">Orders by Status</h4>
                <div className="nx-panel-select-wrap">
                  <select className="nx-panel-select">
                    <option>This Month ▾</option>
                    <option>Last Month ▾</option>
                  </select>
                </div>
              </div>

              {/* Bar Columns Container */}
              <div className="nx-bar-chart-body">
                <div className="nx-bar-col">
                  <span className="bar-count">820</span>
                  <div className="bar-track">
                    <div className="bar-fill bar-blue" style={{ height: '88%' }} />
                  </div>
                  <span className="bar-label">Completed</span>
                </div>

                <div className="nx-bar-col">
                  <span className="bar-count">420</span>
                  <div className="bar-track">
                    <div className="bar-fill bar-teal" style={{ height: '54%' }} />
                  </div>
                  <span className="bar-label">Processing</span>
                </div>

                <div className="nx-bar-col">
                  <span className="bar-count">180</span>
                  <div className="bar-track">
                    <div className="bar-fill bar-purple" style={{ height: '32%' }} />
                  </div>
                  <span className="bar-label">Shipped</span>
                </div>

                <div className="nx-bar-col">
                  <span className="bar-count">90</span>
                  <div className="bar-track">
                    <div className="bar-fill bar-orange" style={{ height: '18%' }} />
                  </div>
                  <span className="bar-label">Cancelled</span>
                </div>

                <div className="nx-bar-col">
                  <span className="bar-count">32</span>
                  <div className="bar-track">
                    <div className="bar-fill bar-pink" style={{ height: '8%' }} />
                  </div>
                  <span className="bar-label">Refunded</span>
                </div>
              </div>
            </div>

            {/* Chart 3: Traffic by Source Donut Chart */}
            <div className="nx-panel-card nx-traffic-panel">
              <div className="nx-panel-header">
                <h4 className="nx-panel-title">Traffic by Source</h4>
                <div className="nx-panel-select-wrap">
                  <select className="nx-panel-select">
                    <option>This Month ▾</option>
                  </select>
                </div>
              </div>

              <div className="nx-traffic-content">
                {/* Donut SVG */}
                <div className="nx-donut-wrapper">
                  <svg viewBox="0 0 160 160" className="nx-donut-svg">
                    {/* Ring Segments */}
                    <circle cx="80" cy="80" r="60" fill="transparent" stroke="#f1f5f9" strokeWidth="20" />
                    <circle cx="80" cy="80" r="60" fill="transparent" stroke="#0284c7" strokeWidth="20" strokeDasharray="120 260" strokeDashoffset="0" />
                    <circle cx="80" cy="80" r="60" fill="transparent" stroke="#06b6d4" strokeWidth="20" strokeDasharray="95 285" strokeDashoffset="-120" />
                    <circle cx="80" cy="80" r="60" fill="transparent" stroke="#a855f7" strokeWidth="20" strokeDasharray="65 315" strokeDashoffset="-215" />
                    <circle cx="80" cy="80" r="60" fill="transparent" stroke="#f59e0b" strokeWidth="20" strokeDasharray="45 335" strokeDashoffset="-280" />
                    <circle cx="80" cy="80" r="60" fill="transparent" stroke="#f43f5e" strokeWidth="20" strokeDasharray="30 350" strokeDashoffset="-325" />
                  </svg>
                  <div className="nx-donut-center-text">
                    <span className="donut-num">12,458</span>
                    <span className="donut-label">Total Visits</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="nx-traffic-legend">
                  <div className="legend-row">
                    <span className="dot dot-blue" />
                    <span className="legend-name">Direct</span>
                    <span className="legend-pct">32.6%</span>
                  </div>
                  <div className="legend-row">
                    <span className="dot dot-teal" />
                    <span className="legend-name">Organic Search</span>
                    <span className="legend-pct">28.4%</span>
                  </div>
                  <div className="legend-row">
                    <span className="dot dot-purple" />
                    <span className="legend-name">Social Media</span>
                    <span className="legend-pct">18.7%</span>
                  </div>
                  <div className="legend-row">
                    <span className="dot dot-orange" />
                    <span className="legend-name">Referral</span>
                    <span className="legend-pct">12.3%</span>
                  </div>
                  <div className="legend-row">
                    <span className="dot dot-pink" />
                    <span className="legend-name">Email</span>
                    <span className="legend-pct">8.0%</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ===================================================================
              5. BOTTOM SECTION: Recent Orders, Categories, Schedule & Feed
              =================================================================== */}
          <div className="nx-bottom-grid">
            
            {/* Column 1: Recent Orders Table */}
            <div className="nx-panel-card nx-orders-table-panel">
              <div className="nx-panel-header">
                <h4 className="nx-panel-title">Recent Orders</h4>
                <button type="button" className="nx-view-all-link">View All</button>
              </div>

              <div className="nx-table-responsive">
                <table className="nx-data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-mono">#ORD-10485</td>
                      <td>
                        <div className="nx-customer-cell">
                          <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80" alt="avatar" className="cell-avatar" />
                          <span>Esther Howard</span>
                        </div>
                      </td>
                      <td>Jun 10, 2024</td>
                      <td><b>$1,248.00</b></td>
                      <td><span className="status-badge completed">Completed</span></td>
                      <td><button type="button" className="btn-table-more"><MoreVertical size={14} /></button></td>
                    </tr>
                    <tr>
                      <td className="font-mono">#ORD-10484</td>
                      <td>
                        <div className="nx-customer-cell">
                          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80" alt="avatar" className="cell-avatar" />
                          <span>Cody Fisher</span>
                        </div>
                      </td>
                      <td>Jun 10, 2024</td>
                      <td><b>$98.90</b></td>
                      <td><span className="status-badge processing">Processing</span></td>
                      <td><button type="button" className="btn-table-more"><MoreVertical size={14} /></button></td>
                    </tr>
                    <tr>
                      <td className="font-mono">#ORD-10483</td>
                      <td>
                        <div className="nx-customer-cell">
                          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80" alt="avatar" className="cell-avatar" />
                          <span>Jane Cooper</span>
                        </div>
                      </td>
                      <td>Jun 9, 2024</td>
                      <td><b>$560.00</b></td>
                      <td><span className="status-badge shipped">Shipped</span></td>
                      <td><button type="button" className="btn-table-more"><MoreVertical size={14} /></button></td>
                    </tr>
                    <tr>
                      <td className="font-mono">#ORD-10482</td>
                      <td>
                        <div className="nx-customer-cell">
                          <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80" alt="avatar" className="cell-avatar" />
                          <span>Dianne Russell</span>
                        </div>
                      </td>
                      <td>Jun 9, 2024</td>
                      <td><b>$145.90</b></td>
                      <td><span className="status-badge cancelled">Cancelled</span></td>
                      <td><button type="button" className="btn-table-more"><MoreVertical size={14} /></button></td>
                    </tr>
                    <tr>
                      <td className="font-mono">#ORD-10481</td>
                      <td>
                        <div className="nx-customer-cell">
                          <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80" alt="avatar" className="cell-avatar" />
                          <span>Devon Lane</span>
                        </div>
                      </td>
                      <td>Jun 8, 2024</td>
                      <td><b>$220.29</b></td>
                      <td><span className="status-badge completed">Completed</span></td>
                      <td><button type="button" className="btn-table-more"><MoreVertical size={14} /></button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Column 2: Top Categories & Upcoming Schedule */}
            <div className="nx-middle-widgets-col">
              {/* Top Categories */}
              <div className="nx-panel-card">
                <div className="nx-panel-header">
                  <h4 className="nx-panel-title">Top Categories</h4>
                  <button type="button" className="nx-view-all-link">View All</button>
                </div>
                <div className="nx-categories-list">
                  <div className="cat-row">
                    <span className="cat-icon-chip blue">💻</span>
                    <span className="cat-name">Electronics</span>
                    <div className="cat-bar-track">
                      <div className="cat-bar-fill blue" style={{ width: '68%' }} />
                    </div>
                    <span className="cat-val"><b>$48,920</b> 38%</span>
                  </div>

                  <div className="cat-row">
                    <span className="cat-icon-chip teal">👕</span>
                    <span className="cat-name">Fashion</span>
                    <div className="cat-bar-track">
                      <div className="cat-bar-fill teal" style={{ width: '48%' }} />
                    </div>
                    <span className="cat-val"><b>$32,480</b> 25%</span>
                  </div>

                  <div className="cat-row">
                    <span className="cat-icon-chip purple">🏠</span>
                    <span className="cat-name">Home &amp; Kitchen</span>
                    <div className="cat-bar-track">
                      <div className="cat-bar-fill purple" style={{ width: '32%' }} />
                    </div>
                    <span className="cat-val"><b>$18,760</b> 14%</span>
                  </div>

                  <div className="cat-row">
                    <span className="cat-icon-chip orange">💄</span>
                    <span className="cat-name">Beauty &amp; Health</span>
                    <div className="cat-bar-track">
                      <div className="cat-bar-fill orange" style={{ width: '24%' }} />
                    </div>
                    <span className="cat-val"><b>$15,340</b> 12%</span>
                  </div>

                  <div className="cat-row">
                    <span className="cat-icon-chip pink">⚽</span>
                    <span className="cat-name">Sports &amp; Outdoors</span>
                    <div className="cat-bar-track">
                      <div className="cat-bar-fill pink" style={{ width: '15%' }} />
                    </div>
                    <span className="cat-val"><b>$9,030</b> 7%</span>
                  </div>
                </div>
              </div>

              {/* Upcoming Schedule Mini Widget */}
              <div className="nx-panel-card">
                <div className="nx-panel-header">
                  <h4 className="nx-panel-title">Upcoming Schedule</h4>
                  <button type="button" className="nx-view-all-link">View Calendar</button>
                </div>
                <div className="nx-schedule-split">
                  <div className="nx-mini-cal">
                    <div className="cal-month-head">
                      <span>June 2024</span>
                    </div>
                    <div className="cal-days-grid">
                      <span className="cal-d">Su</span><span className="cal-d">Mo</span><span className="cal-d">Tu</span><span className="cal-d">We</span><span className="cal-d">Th</span><span className="cal-d">Fr</span><span className="cal-d">Sa</span>
                      <span className="cal-n muted">28</span><span className="cal-n muted">29</span><span className="cal-n muted">30</span><span className="cal-n muted">31</span><span className="cal-n">1</span><span className="cal-n">2</span><span className="cal-n">3</span>
                      <span className="cal-n">4</span><span className="cal-n">5</span><span className="cal-n">6</span><span className="cal-n">7</span><span className="cal-n">8</span><span className="cal-n">9</span><span className="cal-n">10</span>
                      <span className="cal-n active-dot">11</span><span className="cal-n">12</span><span className="cal-n">13</span><span className="cal-n">14</span><span className="cal-n">15</span><span className="cal-n">16</span><span className="cal-n">17</span>
                    </div>
                  </div>

                  <div className="nx-events-list">
                    <div className="event-item">
                      <span className="ev-dot blue" />
                      <div className="ev-info">
                        <span className="ev-title">Team Stand-up</span>
                        <span className="ev-time">10:00 AM - 11:30 AM</span>
                      </div>
                    </div>

                    <div className="event-item">
                      <span className="ev-dot teal" />
                      <div className="ev-info">
                        <span className="ev-title">Marketing Review</span>
                        <span className="ev-time">11:30 AM - 12:30 PM</span>
                      </div>
                    </div>

                    <div className="event-item">
                      <span className="ev-dot purple" />
                      <div className="ev-info">
                        <span className="ev-title">Product Meeting</span>
                        <span className="ev-time">2:00 PM - 3:00 PM</span>
                      </div>
                    </div>

                    <div className="event-item">
                      <span className="ev-dot orange" />
                      <div className="ev-info">
                        <span className="ev-title">Client Call</span>
                        <span className="ev-time">4:00 PM - 5:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Activity Feed & Tasks */}
            <div className="nx-right-widgets-col">
              {/* Activity Feed */}
              <div className="nx-panel-card">
                <div className="nx-panel-header">
                  <h4 className="nx-panel-title">Activity Feed</h4>
                  <button type="button" className="nx-view-all-link">View All</button>
                </div>
                <div className="nx-feed-list">
                  <div className="feed-item">
                    <span className="feed-icon-box green">🏷️</span>
                    <div className="feed-text">
                      <p>New order <b>#ORD-10485</b> has been placed</p>
                      <span className="feed-time">2m ago</span>
                    </div>
                  </div>

                  <div className="feed-item">
                    <span className="feed-icon-box blue">👤</span>
                    <div className="feed-text">
                      <p><b>Jane Cooper</b> created a new account</p>
                      <span className="feed-time">15m ago</span>
                    </div>
                  </div>

                  <div className="feed-item">
                    <span className="feed-icon-box purple">📦</span>
                    <div className="feed-text">
                      <p>Order <b>#ORD-10433</b> has been shipped</p>
                      <span className="feed-time">1h ago</span>
                    </div>
                  </div>

                  <div className="feed-item">
                    <span className="feed-icon-box orange">💳</span>
                    <div className="feed-text">
                      <p>Refund issued for order <b>#ORD-10430</b></p>
                      <span className="feed-time">2h ago</span>
                    </div>
                  </div>

                  <div className="feed-item">
                    <span className="feed-icon-box pink">⭐</span>
                    <div className="feed-text">
                      <p>New review received for Bluetooth Headphones</p>
                      <span className="feed-time">3h ago</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks List with interactive check */}
              <div className="nx-panel-card">
                <div className="nx-panel-header">
                  <h4 className="nx-panel-title">Tasks</h4>
                  <button type="button" className="nx-view-all-link">View All</button>
                </div>
                <div className="nx-tasks-list">
                  {tasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`task-row ${task.completed ? 'is-done' : ''}`}
                      onClick={() => toggleTask(task.id)}
                    >
                      <div className={`task-checkbox ${task.completed ? 'checked' : ''}`}>
                        {task.completed && <Check size={12} strokeWidth={3} />}
                      </div>
                      <span className="task-title">{task.title}</span>
                      <div className="task-progress-track">
                        <div 
                          className="task-progress-fill" 
                          style={{ width: `${task.progress}%`, backgroundColor: task.color }} 
                        />
                      </div>
                      <span className="task-pct">{task.progress}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>

    </div>
  );
}
