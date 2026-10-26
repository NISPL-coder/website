import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../../assets/NISPL Cloud Tech Logo Black.png';
import {
  LayoutDashboard,
  Layers,
  Users,
  FileText,
  Headphones,
  Settings,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Database,
  RefreshCw,
  Search,
  X,
  User,
  Shield,
  LogOut,
  ChevronRight,
  Menu,
  Check,
  TrendingUp,
  SlidersHorizontal,
  ExternalLink,
  Info,
  UserPlus,
  Clock,
  CheckCircle2,
  Activity,
  PieChart,
  BarChart3,
  Bell,
  HelpCircle,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import './PartnerDashboard.css';

/* =========================================================================
   1. TOP HEADER COMPONENT
   ========================================================================= */
export function DashboardHeader({ 
  userSession, 
  onSignOut, 
  onToggleSidebar, 
  isSidebarOpen 
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const partnerName = userSession?.user 
    ? userSession.user.split('@')[0].replace('.', ' ') 
    : 'Authorized Partner';
  const partnerEmail = userSession?.user || 'partner@netinfotechsystem.in';

  return (
    <header className="pnd-header" role="banner">
      {/* 1. Header Left: Mobile Button + Brand Logo + Company Tagline */}
      <div className="pnd-header-left">
        <button 
          type="button" 
          className="pnd-mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          <Menu size={20} />
        </button>

        <Link to="/" className="pnd-brand-link" title="Net Infotech System Pvt. Ltd.">
          <img 
            src={logoImg} 
            alt="Net Infotech System Pvt. Ltd." 
            className="pnd-brand-logo" 
          />
        </Link>

      </div>

      {/* 2. Header Center: Global Quick Search with Shortcut */}
      <div className="pnd-header-center">
        <div className="pnd-global-search">
          <Search size={15} className="pnd-search-icon" />
          <input 
            type="text" 
            placeholder="Search subscriptions, customers, plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pnd-search-input"
          />
          <kbd className="pnd-search-kbd">⌘K</kbd>
        </div>
      </div>

      {/* 3. Header Right: Live Node Status + Notifications + Help + Portal Badge + User Profile */}
      <div className="pnd-header-right">
        {/* Notifications Quick Icon */}
        <button 
          type="button" 
          className="pnd-header-icon-btn" 
          title="Notifications (2 unread)"
          onClick={() => alert("You have 2 upcoming subscription renewals scheduled this week.")}
        >
          <Bell size={18} />
          <span className="pnd-icon-badge">2</span>
        </button>

        {/* Profile Pill & Dropdown */}
        <div className="pnd-profile-container" ref={dropdownRef}>
          <button 
            type="button" 
            className={`pnd-profile-trigger ${isProfileOpen ? 'open' : ''}`}
            onClick={() => setIsProfileOpen(prev => !prev)}
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            <div className="pnd-avatar-circle">
              <span className="pnd-avatar-initials">
                {partnerName.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="pnd-profile-meta">
              <span className="pnd-partner-name">{partnerName}</span>
              <span className="pnd-partner-role-badge">Gold Partner</span>
            </div>
            <ChevronDown size={14} className={`pnd-profile-chevron ${isProfileOpen ? 'rotate' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="pnd-profile-dropdown animate-scale-in" role="menu">
              <div className="pnd-dropdown-header">
                <div className="pnd-dropdown-user-info">
                  <div className="pnd-dropdown-avatar-row">
                    <div className="pnd-avatar-circle sm">
                      <span>{partnerName.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <strong className="pnd-user-display-name">{partnerName}</strong>
                      <span className="pnd-partner-id">ID: #NIS-PT-9042</span>
                    </div>
                  </div>
                  <span className="pnd-user-email">{partnerEmail}</span>
                  <div className="pnd-tier-pill">
                    <ShieldCheck size={13} />
                    <span>Certified Gold Partner</span>
                  </div>
                </div>
              </div>
              <div className="pnd-dropdown-divider" />
              <button 
                type="button" 
                className="pnd-dropdown-item" 
                role="menuitem"
                onClick={() => {
                  setIsProfileOpen(false);
                  alert("Opening Partner Profile & Agreement Details...");
                }}
              >
                <User size={15} />
                <span>Partner Profile</span>
              </button>
              <button 
                type="button" 
                className="pnd-dropdown-item" 
                role="menuitem"
                onClick={() => {
                  setIsProfileOpen(false);
                  alert("Opening Partner Commission & Settlement Settings...");
                }}
              >
                <Settings size={15} />
                <span>Account &amp; Payout Settings</span>
              </button>
              <div className="pnd-dropdown-divider" />
              <button 
                type="button" 
                className="pnd-dropdown-item danger" 
                role="menuitem"
                onClick={() => {
                  setIsProfileOpen(false);
                  onSignOut();
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* =========================================================================
   2. LEFT SIDEBAR COMPONENT (HIGH-END ENTERPRISE NAVY)
   ========================================================================= */
export function DashboardSidebar({ activeNav, setActiveNav, isOpen, onClose }) {
  const navSectionMain = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subscriptions', label: 'Subscriptions', icon: Layers, badge: '12' },
    { id: 'customers', label: 'Customers', icon: Users, badge: '48' },
    { id: 'reports', label: 'Reports', icon: FileText, badge: 'New' },
  ];

  const navSectionPrefs = [
    { id: 'support', label: 'Support & NOC', icon: Headphones },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Backdrop for mobile drawer */}
      {isOpen && <div className="pnd-sidebar-backdrop" onClick={onClose} aria-hidden="true" />}

      <aside className={`pnd-sidebar ${isOpen ? 'mobile-open' : ''}`} aria-label="Sidebar Navigation">
        {/* Navigation Groups Container */}
        <div className="pnd-sidebar-nav-container">
          
          {/* Section 1: Main Menu */}
          <div className="pnd-nav-section">
            <nav className="pnd-nav-menu">
              {navSectionMain.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`pnd-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setActiveNav(item.id);
                      if (onClose) onClose();
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={18} className="pnd-nav-icon" />
                    <span className="pnd-nav-label">{item.label}</span>
                    {item.badge && (
                      <span className={`pnd-nav-badge ${item.badge === 'New' ? 'badge-new' : ''}`}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && <div className="pnd-active-indicator" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Section 2: Management & Preferences */}
          <div className="pnd-nav-section" style={{ marginTop: '20px' }}>
            <span className="pnd-nav-section-title">MANAGEMENT &amp; SUPPORT</span>
            <nav className="pnd-nav-menu">
              {navSectionPrefs.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`pnd-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setActiveNav(item.id);
                      if (onClose) onClose();
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={18} className="pnd-nav-icon" />
                    <span className="pnd-nav-label">{item.label}</span>
                    {isActive && <div className="pnd-active-indicator" />}
                  </button>
                );
              })}
            </nav>
          </div>

        </div>

        {/* Sidebar Footer Slogan Card */}
        <div className="pnd-sidebar-footer">
          <div className="pnd-slogan-card">
            <div className="pnd-slogan-top-row">
              <span className="pnd-slogan-icon">🤝</span>
              <span className="pnd-partner-tier-chip">Gold Tier Partner</span>
            </div>
            <p className="pnd-slogan-text">
              Growing Together With Our Partners
            </p>
            <div className="pnd-slogan-meta">
              <span>Partner ID: #NIS-9042</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

/* =========================================================================
   3. FILTER TOOLBAR COMPONENT
   ========================================================================= */
export function DashboardFilters({
  timeline,
  setTimeline,
  customerDate,
  setCustomerDate,
  salesman,
  setSalesman,
  rm,
  setRm
}) {
  // Dropdown open states
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isSalesmanOpen, setIsSalesmanOpen] = useState(false);
  const [isRmOpen, setIsRmOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Calendar state
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const timelineRef = useRef(null);
  const calRef = useRef(null);
  const salesmanRef = useRef(null);
  const rmRef = useRef(null);

  // Options
  const timelineOptions = [
    'Today',
    'This Week',
    'This Month',
    'Last Month',
    'Last 3 Months',
    'This Year',
    'Custom Range'
  ];

  const salesmanOptions = [
    'All Salesmen',
    'Amit Verma (Kolkata)',
    'Priya Nair (Mumbai)',
    'Rahul Sen (Bhubaneswar)',
    'Vikram Malhotra (Delhi)',
    'Debjit Ghosh (Siliguri)'
  ];

  const rmOptions = [
    'All Relationship Managers',
    'Ananya Roy (Enterprise RM)',
    'Suman Banerjee (Cloud Partner RM)',
    'Deepa Patel (Corporate RM)',
    'Rohit Sengupta (Tally Channel RM)'
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (timelineRef.current && !timelineRef.current.contains(e.target)) {
        setIsTimelineOpen(false);
      }
      if (calRef.current && !calRef.current.contains(e.target)) {
        setIsCalendarOpen(false);
      }
      if (salesmanRef.current && !salesmanRef.current.contains(e.target)) {
        setIsSalesmanOpen(false);
      }
      if (rmRef.current && !rmRef.current.contains(e.target)) {
        setIsRmOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format Date Helper
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Calendar Generator
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const handleSelectDay = (day) => {
    const mm = String(calMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const selected = `${calYear}-${mm}-${dd}`;
    setCustomerDate(selected);
    setIsCalendarOpen(false);
  };

  const daysArray = [];
  const totalDays = daysInMonth(calMonth, calYear);
  const startDay = firstDayOfMonth(calMonth, calYear);

  for (let i = 0; i < startDay; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    daysArray.push(i);
  }

  return (
    <div className="pnd-filter-toolbar" role="region" aria-label="Dashboard Filters">
      
      {/* 1. TIMELINE FILTER */}
      <div className="pnd-filter-field" ref={timelineRef}>
        <label className="pnd-filter-label" id="timeline-label">Timeline</label>
        <button
          type="button"
          className={`pnd-filter-control ${isTimelineOpen ? 'active' : ''}`}
          onClick={() => setIsTimelineOpen(prev => !prev)}
          aria-labelledby="timeline-label"
          aria-haspopup="listbox"
          aria-expanded={isTimelineOpen}
        >
          <span className="pnd-filter-val">{timeline}</span>
          <ChevronDown size={15} className={`pnd-filter-chevron ${isTimelineOpen ? 'rotate' : ''}`} />
        </button>

        {isTimelineOpen && (
          <div className="pnd-dropdown-panel animate-fade-in" role="listbox">
            {timelineOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`pnd-option-item ${timeline === opt ? 'selected' : ''}`}
                onClick={() => {
                  setTimeline(opt);
                  setIsTimelineOpen(false);
                }}
                role="option"
                aria-selected={timeline === opt}
              >
                <span>{opt}</span>
                {timeline === opt && <Check size={14} className="pnd-check-icon" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. CUSTOMER DATA DATE PICKER */}
      <div className="pnd-filter-field" ref={calRef}>
        <label className="pnd-filter-label" id="cust-data-label">Customer Data</label>
        <div 
          className={`pnd-filter-control pnd-date-control ${isCalendarOpen ? 'active' : ''}`}
          onClick={() => setIsCalendarOpen(prev => !prev)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') setIsCalendarOpen(prev => !prev); }}
          aria-labelledby="cust-data-label"
          aria-expanded={isCalendarOpen}
        >
          <CalendarIcon size={15} className="pnd-date-icon" />
          <span className={`pnd-filter-val ${!customerDate ? 'placeholder' : ''}`}>
            {customerDate ? formatDateDisplay(customerDate) : 'Select Date'}
          </span>
          {customerDate ? (
            <button
              type="button"
              className="pnd-clear-date-btn"
              onClick={(e) => {
                e.stopPropagation();
                setCustomerDate('');
              }}
              title="Clear date"
              aria-label="Clear date"
            >
              <X size={14} />
            </button>
          ) : (
            <ChevronDown size={15} className={`pnd-filter-chevron ${isCalendarOpen ? 'rotate' : ''}`} />
          )}
        </div>

        {/* Custom Calendar Popup */}
        {isCalendarOpen && (
          <div className="pnd-calendar-popover animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="pnd-cal-header">
              <button 
                type="button" 
                className="pnd-cal-nav"
                onClick={() => {
                  if (calMonth === 0) {
                    setCalMonth(11);
                    setCalYear(y => y - 1);
                  } else {
                    setCalMonth(m => m - 1);
                  }
                }}
                aria-label="Previous month"
              >
                ‹
              </button>
              <span className="pnd-cal-title">
                {monthNames[calMonth]} {calYear}
              </span>
              <button 
                type="button" 
                className="pnd-cal-nav"
                onClick={() => {
                  if (calMonth === 11) {
                    setCalMonth(0);
                    setCalYear(y => y + 1);
                  } else {
                    setCalMonth(m => m + 1);
                  }
                }}
                aria-label="Next month"
              >
                ›
              </button>
            </div>

            <div className="pnd-cal-weekdays">
              <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>

            <div className="pnd-cal-days">
              {daysArray.map((day, idx) => {
                if (!day) return <span key={`empty-${idx}`} className="pnd-cal-empty" />;
                const mm = String(calMonth + 1).padStart(2, '0');
                const dd = String(day).padStart(2, '0');
                const iso = `${calYear}-${mm}-${dd}`;
                const isSelected = customerDate === iso;

                return (
                  <button
                    key={day}
                    type="button"
                    className={`pnd-cal-day ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectDay(day)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="pnd-cal-footer">
              <button 
                type="button" 
                className="pnd-cal-action-btn secondary"
                onClick={() => {
                  setCustomerDate('');
                  setIsCalendarOpen(false);
                }}
              >
                Clear
              </button>
              <button 
                type="button" 
                className="pnd-cal-action-btn primary"
                onClick={() => {
                  const today = new Date();
                  const mm = String(today.getMonth() + 1).padStart(2, '0');
                  const dd = String(today.getDate()).padStart(2, '0');
                  setCustomerDate(`${today.getFullYear()}-${mm}-${dd}`);
                  setIsCalendarOpen(false);
                }}
              >
                Today
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. SALESMAN FILTER */}
      <div className="pnd-filter-field" ref={salesmanRef}>
        <label className="pnd-filter-label" id="salesman-label">Salesman</label>
        <button
          type="button"
          className={`pnd-filter-control ${isSalesmanOpen ? 'active' : ''}`}
          onClick={() => setIsSalesmanOpen(prev => !prev)}
          aria-labelledby="salesman-label"
          aria-haspopup="listbox"
          aria-expanded={isSalesmanOpen}
        >
          <span className={`pnd-filter-val ${salesman === 'Select Salesman' ? 'placeholder' : ''}`}>
            {salesman}
          </span>
          <ChevronDown size={15} className={`pnd-filter-chevron ${isSalesmanOpen ? 'rotate' : ''}`} />
        </button>

        {isSalesmanOpen && (
          <div className="pnd-dropdown-panel animate-fade-in" role="listbox">
            {salesmanOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`pnd-option-item ${salesman === opt ? 'selected' : ''}`}
                onClick={() => {
                  setSalesman(opt);
                  setIsSalesmanOpen(false);
                }}
                role="option"
                aria-selected={salesman === opt}
              >
                <span>{opt}</span>
                {salesman === opt && <Check size={14} className="pnd-check-icon" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. RELATIONSHIP MANAGER FILTER */}
      <div className="pnd-filter-field" ref={rmRef}>
        <label className="pnd-filter-label" id="rm-label">Relationship Manager</label>
        <button
          type="button"
          className={`pnd-filter-control ${isRmOpen ? 'active' : ''}`}
          onClick={() => setIsRmOpen(prev => !prev)}
          aria-labelledby="rm-label"
          aria-haspopup="listbox"
          aria-expanded={isRmOpen}
        >
          <span className={`pnd-filter-val ${rm === 'Select RM' ? 'placeholder' : ''}`}>
            {rm}
          </span>
          <ChevronDown size={15} className={`pnd-filter-chevron ${isRmOpen ? 'rotate' : ''}`} />
        </button>

        {isRmOpen && (
          <div className="pnd-dropdown-panel animate-fade-in" role="listbox">
            {rmOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`pnd-option-item ${rm === opt ? 'selected' : ''}`}
                onClick={() => {
                  setRm(opt);
                  setIsRmOpen(false);
                }}
                role="option"
                aria-selected={rm === opt}
              >
                <span>{opt}</span>
                {rm === opt && <Check size={14} className="pnd-check-icon" />}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

/* =========================================================================
   4. TOTAL PAID SUBSCRIPTION CARD (LEFT ~25%)
   ========================================================================= */
export function TotalPaidSubscriptionCard() {
  return (
    <div className="pnd-paid-card">
      {/* Header with Title & Database Icon */}
      <div className="pnd-paid-header">
        <h3 className="pnd-paid-title">Total Paid Subscription</h3>
        <div className="pnd-paid-icon-wrap" aria-hidden="true">
          <Database size={19} className="pnd-paid-icon" />
        </div>
      </div>

      {/* Metrics Row: Subscription | User */}
      <div className="pnd-paid-metrics-row">
        {/* Metric 1: Subscription */}
        <div className="pnd-metric-item">
          <span className="pnd-metric-number">0</span>
          <span className="pnd-metric-label">Subscription</span>
        </div>

        {/* Thin vertical divider */}
        <div className="pnd-metric-divider" />

        {/* Metric 2: User */}
        <div className="pnd-metric-item">
          <span className="pnd-metric-number">0</span>
          <span className="pnd-metric-label">User</span>
        </div>
      </div>

      {/* Subtle decorative bottom accent */}
      <div className="pnd-paid-card-footer">
        <span className="pnd-paid-status-chip">
          Active Subscriptions Overview
        </span>
      </div>
    </div>
  );
}

/* =========================================================================
   5. RENEWALS STATS PILLS (RIGHT PANEL TOP)
   ========================================================================= */
export function RenewalsStats({
  isUpgradesExpanded,
  onToggleUpgrades,
  isDowngradesExpanded,
  onToggleDowngrades
}) {
  return (
    <div className="pnd-renewals-stats-grid">
      {/* Stat 1: Total Renewals (Light Green) */}
      <div className="pnd-stat-pill green">
        <span className="pnd-stat-label">Total Renewals</span>
        <span className="pnd-stat-val">0</span>
      </div>

      {/* Stat 2: Renewed (Light Blue) */}
      <div className="pnd-stat-pill blue">
        <span className="pnd-stat-label">Renewed</span>
        <span className="pnd-stat-val">0</span>
      </div>

      {/* Stat 3: Upgrades (Light Purple with toggle button) */}
      <div 
        className="pnd-stat-pill purple clickable"
        onClick={onToggleUpgrades}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') onToggleUpgrades(); }}
        title="Click to toggle Upgrades in table"
      >
        <span className="pnd-stat-label">Upgrades</span>
        <div className="pnd-stat-val-group">
          <span className="pnd-stat-val">0</span>
          <span className="pnd-stat-pill-arrow">
            {isUpgradesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </div>
      </div>

      {/* Stat 4: Downgrades (Light Red with toggle button) */}
      <div 
        className="pnd-stat-pill red clickable"
        onClick={onToggleDowngrades}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') onToggleDowngrades(); }}
        title="Click to toggle Downgrades in table"
      >
        <span className="pnd-stat-label">Downgrades</span>
        <div className="pnd-stat-val-group">
          <span className="pnd-stat-val">0</span>
          <span className="pnd-stat-pill-arrow">
            {isDowngradesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   6. SUBSCRIPTION DETAILS TABLE
   ========================================================================= */
export function SubscriptionSummaryTable({
  isUpgradesExpanded,
  setIsUpgradesExpanded,
  isDowngradesExpanded,
  setIsDowngradesExpanded
}) {
  return (
    <div className="pnd-table-container">
      <table className="pnd-table" aria-label="Subscription summary renewal details">
        <thead>
          <tr>
            <th className="pnd-th-name" scope="col">Renewals</th>
            <th className="pnd-th-sub" scope="col">Subscription</th>
            <th className="pnd-th-user" scope="col">User</th>
            <th className="pnd-th-amount" scope="col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {/* Row 1: Total Renewals */}
          <tr className="pnd-row">
            <td className="pnd-td-name">
              <div className="pnd-name-cell">
                <span className="pnd-row-num">1</span>
                <span className="pnd-item-title">Total Renewals</span>
              </div>
            </td>
            <td className="pnd-td-sub">0</td>
            <td className="pnd-td-user">0</td>
            <td className="pnd-td-amount">₹0.00</td>
          </tr>

          {/* Row 2: Renewed */}
          <tr className="pnd-row">
            <td className="pnd-td-name">
              <div className="pnd-name-cell">
                <span className="pnd-row-num">2</span>
                <span className="pnd-item-title">Renewed</span>
              </div>
            </td>
            <td className="pnd-td-sub">0</td>
            <td className="pnd-td-user">0</td>
            <td className="pnd-td-amount">₹0.00</td>
          </tr>

          {/* Row 3: Upgrades (Expandable) */}
          <tr 
            className={`pnd-row pnd-expandable-row ${isUpgradesExpanded ? 'expanded' : ''}`}
            onClick={() => setIsUpgradesExpanded(prev => !prev)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setIsUpgradesExpanded(prev => !prev); }}
            aria-expanded={isUpgradesExpanded}
          >
            <td className="pnd-td-name">
              <div className="pnd-expandable-cell">
                <span className="pnd-row-num">3</span>
                <span className="pnd-expand-trigger-icon">
                  {isUpgradesExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </span>
                <span className="pnd-item-title">Upgrades</span>
              </div>
            </td>
            <td className="pnd-td-sub">0</td>
            <td className="pnd-td-user">0</td>
            <td className="pnd-td-amount">₹0.00</td>
          </tr>

          {/* Upgrades Nested Rows: 3.1, 3.2, 3.3 */}
          {isUpgradesExpanded && (
            <>
              <tr className="pnd-row pnd-child-row">
                <td className="pnd-td-name child">
                  <div className="pnd-child-cell">
                    <span className="pnd-tree-line" />
                    <span className="pnd-child-num">3.1</span>
                    <span className="pnd-child-title">Subscription</span>
                  </div>
                </td>
                <td className="pnd-td-sub">0</td>
                <td className="pnd-td-user">0</td>
                <td className="pnd-td-amount">₹0.00</td>
              </tr>
              <tr className="pnd-row pnd-child-row">
                <td className="pnd-td-name child">
                  <div className="pnd-child-cell">
                    <span className="pnd-tree-line" />
                    <span className="pnd-child-num">3.2</span>
                    <span className="pnd-child-title">User</span>
                  </div>
                </td>
                <td className="pnd-td-sub">0</td>
                <td className="pnd-td-user">0</td>
                <td className="pnd-td-amount">₹0.00</td>
              </tr>
              <tr className="pnd-row pnd-child-row">
                <td className="pnd-td-name child">
                  <div className="pnd-child-cell">
                    <span className="pnd-tree-line" />
                    <span className="pnd-child-num">3.3</span>
                    <span className="pnd-child-title">Amount</span>
                  </div>
                </td>
                <td className="pnd-td-sub">0</td>
                <td className="pnd-td-user">0</td>
                <td className="pnd-td-amount">₹0.00</td>
              </tr>
            </>
          )}

          {/* Row 4: Downgrades (Expandable) */}
          <tr 
            className={`pnd-row pnd-expandable-row ${isDowngradesExpanded ? 'expanded' : ''}`}
            onClick={() => setIsDowngradesExpanded(prev => !prev)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setIsDowngradesExpanded(prev => !prev); }}
            aria-expanded={isDowngradesExpanded}
          >
            <td className="pnd-td-name">
              <div className="pnd-expandable-cell">
                <span className="pnd-row-num">4</span>
                <span className="pnd-expand-trigger-icon">
                  {isDowngradesExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </span>
                <span className="pnd-item-title">Downgrades</span>
              </div>
            </td>
            <td className="pnd-td-sub">0</td>
            <td className="pnd-td-user">0</td>
            <td className="pnd-td-amount">₹0.00</td>
          </tr>

          {/* Downgrades Nested Rows: 4.1, 4.2, 4.3 */}
          {isDowngradesExpanded && (
            <>
              <tr className="pnd-row pnd-child-row">
                <td className="pnd-td-name child">
                  <div className="pnd-child-cell">
                    <span className="pnd-tree-line" />
                    <span className="pnd-child-num">4.1</span>
                    <span className="pnd-child-title">Subscription</span>
                  </div>
                </td>
                <td className="pnd-td-sub">0</td>
                <td className="pnd-td-user">0</td>
                <td className="pnd-td-amount">₹0.00</td>
              </tr>
              <tr className="pnd-row pnd-child-row">
                <td className="pnd-td-name child">
                  <div className="pnd-child-cell">
                    <span className="pnd-tree-line" />
                    <span className="pnd-child-num">4.2</span>
                    <span className="pnd-child-title">User</span>
                  </div>
                </td>
                <td className="pnd-td-sub">0</td>
                <td className="pnd-td-user">0</td>
                <td className="pnd-td-amount">₹0.00</td>
              </tr>
              <tr className="pnd-row pnd-child-row">
                <td className="pnd-td-name child">
                  <div className="pnd-child-cell">
                    <span className="pnd-tree-line" />
                    <span className="pnd-child-num">4.3</span>
                    <span className="pnd-child-title">Amount</span>
                  </div>
                </td>
                <td className="pnd-td-sub">0</td>
                <td className="pnd-td-user">0</td>
                <td className="pnd-td-amount">₹0.00</td>
              </tr>
            </>
          )}

          {/* Row 5: Upcoming Renewals */}
          <tr className="pnd-row">
            <td className="pnd-td-name">
              <div className="pnd-name-cell">
                <span className="pnd-row-num">5</span>
                <span className="pnd-item-title">Upcoming Renewals</span>
              </div>
            </td>
            <td className="pnd-td-sub">0</td>
            <td className="pnd-td-user">0</td>
            <td className="pnd-td-amount">₹0.00</td>
          </tr>

          {/* Row 6: Expired */}
          <tr className="pnd-row">
            <td className="pnd-td-name">
              <div className="pnd-name-cell">
                <span className="pnd-row-num">6</span>
                <span className="pnd-item-title">Expired</span>
              </div>
            </td>
            <td className="pnd-td-sub">0</td>
            <td className="pnd-td-user">0</td>
            <td className="pnd-td-amount">₹0.00</td>
          </tr>

          {/* Row 7: Deleted */}
          <tr className="pnd-row">
            <td className="pnd-td-name">
              <div className="pnd-name-cell">
                <span className="pnd-row-num">7</span>
                <span className="pnd-item-title">Deleted</span>
              </div>
            </td>
            <td className="pnd-td-sub">0</td>
            <td className="pnd-td-user">0</td>
            <td className="pnd-td-amount">₹0.00</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================================
   7. TRIALS AND CONVERSION OVERVIEW (4-BOX SECTION)
   ========================================================================= */
export function TrialsSummarySection() {
  const trialCards = [
    {
      id: 'trial-signup',
      title: 'Trial Signup',
      amount: '0',
      subscription: '0',
      color: 'blue',
      icon: UserPlus,
      bgClass: 'pnd-trial-blue'
    },
    {
      id: 'trial-expired',
      title: 'Trial Expired',
      amount: '0',
      subscription: '0',
      color: 'red',
      icon: Clock,
      bgClass: 'pnd-trial-red'
    },
    {
      id: 'trial-to-paid',
      title: 'Trial to Paid',
      amount: '0',
      subscription: '0',
      color: 'green',
      icon: CheckCircle2,
      bgClass: 'pnd-trial-green'
    },
    {
      id: 'live-trials',
      title: 'Live Trials',
      amount: '0',
      subscription: '0',
      color: 'purple',
      icon: Activity,
      bgClass: 'pnd-trial-purple'
    }
  ];

  return (
    <section className="pnd-trials-section" aria-labelledby="trials-overview-heading">
      <h2 id="trials-overview-heading" className="pnd-section-heading">
        Trials Overview
      </h2>

      <div className="pnd-trials-grid">
        {trialCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} className={`pnd-trial-card ${card.bgClass}`}>
              <div className="pnd-trial-header">
                <h3 className="pnd-trial-title">{card.title}</h3>
                <div className={`pnd-trial-icon-wrap ${card.color}`}>
                  <Icon size={18} />
                </div>
              </div>

              <div className="pnd-trial-metrics-row">
                <div className="pnd-trial-metric-item">
                  <span className="pnd-trial-metric-val">{card.amount}</span>
                  <span className="pnd-trial-metric-label">Amount</span>
                </div>

                <div className="pnd-trial-metric-divider" />

                <div className="pnd-trial-metric-item">
                  <span className="pnd-trial-metric-val">{card.subscription}</span>
                  <span className="pnd-trial-metric-label">Subscription</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* =========================================================================
   8. VISUAL ANALYTICS: GRAPHS & PIE CHART WITH CSS TRANSITIONS
   ========================================================================= */
export function DashboardChartsSection() {
  const [activeTimeframe, setActiveTimeframe] = useState('Monthly');
  const [activePointIndex, setActivePointIndex] = useState(3);
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  // Spline Graph Data Points
  const trendPoints = [
    { label: 'May 01', x: 50, y: 135, subs: 28, revenue: '₹34,800' },
    { label: 'May 08', x: 120, y: 95, subs: 45, revenue: '₹56,200' },
    { label: 'May 15', x: 190, y: 110, subs: 38, revenue: '₹49,000' },
    { label: 'May 22', x: 260, y: 55, subs: 72, revenue: '₹94,500' },
    { label: 'May 29', x: 330, y: 80, subs: 58, revenue: '₹76,100' },
    { label: 'Jun 05', x: 400, y: 35, subs: 94, revenue: '₹1,24,000' },
    { label: 'Jun 12', x: 470, y: 50, subs: 86, revenue: '₹1,12,300' }
  ];

  const activePoint = activePointIndex !== null ? trendPoints[activePointIndex] : trendPoints[3];

  // Pie / Donut Chart Slices (Total 1,280 subs)
  const pieSlices = [
    { id: 'tally', name: 'Tally on Cloud', pct: '42%', count: 538, color: '#2F70D0', dasharray: '158.3 218.7', dashoffset: '0' },
    { id: 'vps', name: 'Dedicated Cloud VPS', pct: '28%', count: 358, color: '#06B6D4', dasharray: '105.6 271.4', dashoffset: '-158.3' },
    { id: 'm365', name: 'Microsoft 365 Enterprise', pct: '18%', count: 230, color: '#8B5CF6', dasharray: '67.9 309.1', dashoffset: '-263.9' },
    { id: 'noc', name: 'Managed Security / NOC', pct: '12%', count: 154, color: '#10B981', dasharray: '45.2 331.8', dashoffset: '-331.8' }
  ];

  // Bar Chart Data (Renewal & Conversion Performance)
  const barData = [
    { label: 'Renewed', count: 84, height: '88%', color: '#10B981', bgClass: 'bar-green' },
    { label: 'Upgraded', count: 42, height: '52%', color: '#8B5CF6', bgClass: 'bar-purple' },
    { label: 'Trial to Paid', count: 30, height: '40%', color: '#2F70D0', bgClass: 'bar-blue' },
    { label: 'Pending', count: 18, height: '26%', color: '#F59E0B', bgClass: 'bar-amber' },
    { label: 'Expired', count: 8, height: '14%', color: '#F43F5E', bgClass: 'bar-rose' }
  ];

  return (
    <section className="pnd-charts-section" aria-labelledby="analytics-heading">
      <h2 id="analytics-heading" className="pnd-section-heading">
        Performance Analytics
      </h2>

      {/* Top Charts Row: Spline Area Chart (62%) + Pie/Donut Chart (38%) */}
      <div className="pnd-charts-dual-grid">
        
        {/* CHART 1: Subscription & Revenue Trend Area Chart */}
        <div className="pnd-chart-panel pnd-trend-panel">
          <div className="pnd-chart-panel-header">
            <div>
              <div className="pnd-chart-title-group">
                <TrendingUp size={18} className="pnd-chart-icon text-blue" />
                <h3 className="pnd-chart-title">Subscription &amp; Revenue Trends</h3>
              </div>
              <span className="pnd-chart-subtitle">Active subscriptions and monthly revenue curve</span>
            </div>

            {/* Interactive Timeframe Toggle with CSS transition */}
            <div className="pnd-timeframe-toggle" role="tablist">
              {['Daily', 'Weekly', 'Monthly'].map((tf) => (
                <button
                  key={tf}
                  type="button"
                  className={`pnd-tf-btn ${activeTimeframe === tf ? 'active' : ''}`}
                  onClick={() => setActiveTimeframe(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Spline Area SVG Graph */}
          <div className="pnd-spline-wrapper">
            <svg viewBox="0 0 520 190" className="pnd-spline-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="pndTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2F70D0" stopOpacity="0.38" />
                  <stop offset="60%" stopColor="#2F70D0" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#2F70D0" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal grid lines */}
              <line x1="30" y1="35" x2="500" y2="35" stroke="#E2E8F0" strokeDasharray="4 4" opacity="0.7" />
              <line x1="30" y1="75" x2="500" y2="75" stroke="#E2E8F0" strokeDasharray="4 4" opacity="0.7" />
              <line x1="30" y1="115" x2="500" y2="115" stroke="#E2E8F0" strokeDasharray="4 4" opacity="0.7" />
              <line x1="30" y1="155" x2="500" y2="155" stroke="#E2E8F0" opacity="0.9" />

              {/* Area Gradient Fill with CSS path transition */}
              <path
                d="M 50 135 Q 85 115 120 95 T 190 110 T 260 55 T 330 80 T 400 35 T 470 50 L 470 155 L 50 155 Z"
                fill="url(#pndTrendGrad)"
                className="pnd-area-path"
              />

              {/* Stroke Line Curve */}
              <path
                d="M 50 135 Q 85 115 120 95 T 190 110 T 260 55 T 330 80 T 400 35 T 470 50"
                fill="none"
                stroke="#2F70D0"
                strokeWidth="3.2"
                strokeLinecap="round"
                className="pnd-stroke-path"
              />

              {/* Interactive Data Points */}
              {trendPoints.map((pt, idx) => {
                const isSelected = activePointIndex === idx;
                return (
                  <g 
                    key={pt.label} 
                    className="pnd-point-group" 
                    onMouseEnter={() => setActivePointIndex(idx)}
                    tabIndex={0}
                  >
                    {/* Pulsing ring on selected point */}
                    {isSelected && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="11"
                        fill="#2F70D0"
                        opacity="0.22"
                        className="pnd-pulse-circle"
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? "6" : "4.5"}
                      fill="#FFFFFF"
                      stroke="#2F70D0"
                      strokeWidth={isSelected ? "3" : "2.2"}
                      className="pnd-graph-dot"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Dynamic Floating Tooltip positioned smoothly */}
            {activePoint && (
              <div 
                className="pnd-graph-tooltip animate-fade-in"
                style={{ 
                  left: `${(activePoint.x / 520) * 100}%`,
                  top: `${Math.max(activePoint.y - 48, 8)}px`
                }}
              >
                <span className="tooltip-date">{activePoint.label}</span>
                <div className="tooltip-metrics">
                  <span className="tooltip-subs"><b>{activePoint.subs}</b> Subs</span>
                  <span className="tooltip-rev">{activePoint.revenue}</span>
                </div>
              </div>
            )}

            {/* X-Axis Labels */}
            <div className="pnd-axis-x-row">
              {trendPoints.map((pt) => (
                <span key={pt.label} className="pnd-axis-lbl">{pt.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* CHART 2: Subscription Plans Pie / Donut Chart */}
        <div className="pnd-chart-panel pnd-pie-panel">
          <div className="pnd-chart-panel-header">
            <div>
              <div className="pnd-chart-title-group">
                <PieChart size={18} className="pnd-chart-icon text-purple" />
                <h3 className="pnd-chart-title">Plan Distribution</h3>
              </div>
              <span className="pnd-chart-subtitle">Active subscriptions by product category</span>
            </div>
          </div>

          <div className="pnd-pie-body">
            {/* Donut SVG with smooth stroke-dasharray & hover transitions */}
            <div className="pnd-donut-container">
              <svg viewBox="0 0 160 160" className="pnd-donut-svg">
                {/* Background Ring Track */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="20"
                />

                {/* Slices with transitions */}
                {pieSlices.map((slice, idx) => {
                  const isHovered = hoveredSlice === idx;
                  return (
                    <circle
                      key={slice.id}
                      cx="80"
                      cy="80"
                      r="60"
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={isHovered ? "24" : "19"}
                      strokeDasharray={slice.dasharray}
                      strokeDashoffset={slice.dashoffset}
                      className={`pnd-donut-slice ${isHovered ? 'hovered' : ''}`}
                      onMouseEnter={() => setHoveredSlice(idx)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  );
                })}
              </svg>

              {/* Dynamic Center Badge */}
              <div className="pnd-donut-center">
                <span className="donut-center-val">
                  {hoveredSlice !== null ? pieSlices[hoveredSlice].count : '1,280'}
                </span>
                <span className="donut-center-lbl">
                  {hoveredSlice !== null ? pieSlices[hoveredSlice].name.split(' ')[0] : 'Total Subs'}
                </span>
              </div>
            </div>

            {/* Interactive Legend List */}
            <div className="pnd-pie-legend">
              {pieSlices.map((slice, idx) => {
                const isHovered = hoveredSlice === idx;
                return (
                  <div
                    key={slice.id}
                    className={`pnd-legend-row ${isHovered ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredSlice(idx)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  >
                    <span className="legend-dot" style={{ backgroundColor: slice.color }} />
                    <span className="legend-name">{slice.name}</span>
                    <span className="legend-count">{slice.count}</span>
                    <span className="legend-badge" style={{ backgroundColor: `${slice.color}15`, color: slice.color }}>
                      {slice.pct}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Chart: Renewal & Conversion Performance Bar Chart */}
      <div className="pnd-chart-panel pnd-bars-panel">
        <div className="pnd-chart-panel-header">
          <div>
            <div className="pnd-chart-title-group">
              <BarChart3 size={18} className="pnd-chart-icon text-green" />
              <h3 className="pnd-chart-title">Renewal Status Breakdown</h3>
            </div>
            <span className="pnd-chart-subtitle">Monthly volume of renewals, upgrades, trial conversions &amp; churn</span>
          </div>
        </div>

        {/* Animated Bar Columns with CSS Transitions */}
        <div className="pnd-bar-chart-body">
          {barData.map((bar, idx) => {
            const isHovered = hoveredBarIndex === idx;
            return (
              <div 
                key={bar.label} 
                className="pnd-bar-col"
                onMouseEnter={() => setHoveredBarIndex(idx)}
                onMouseLeave={() => setHoveredBarIndex(null)}
              >
                <div className={`pnd-bar-popover ${isHovered ? 'visible' : ''}`}>
                  <span>{bar.count} Subs</span>
                </div>
                
                <span className="pnd-bar-count">{bar.count}</span>
                
                <div className="pnd-bar-track">
                  <div 
                    className={`pnd-bar-fill ${bar.bgClass} ${isHovered ? 'highlight' : ''}`} 
                    style={{ height: bar.height }} 
                  />
                </div>
                
                <span className="pnd-bar-label">{bar.label}</span>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}

/* =========================================================================
   9. MAIN PARTNER DASHBOARD CONTAINER
   ========================================================================= */
export default function PartnerDashboard({ userSession, onSignOut }) {
  const navigate = useNavigate();

  // Sidebar navigation state
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filters state
  const [timeline, setTimeline] = useState('This Month');
  const [customerDate, setCustomerDate] = useState('');
  const [salesman, setSalesman] = useState('Select Salesman');
  const [rm, setRm] = useState('Select RM');

  // Expandable table rows state
  const [isUpgradesExpanded, setIsUpgradesExpanded] = useState(false);
  const [isDowngradesExpanded, setIsDowngradesExpanded] = useState(false);

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      navigate('/login?portal=partner');
    }
  };

  return (
    <div className="pnd-layout">
      {/* Top Header */}
      <DashboardHeader 
        userSession={userSession}
        onSignOut={handleSignOut}
        onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        isSidebarOpen={isMobileSidebarOpen}
      />

      {/* Main App Workspace (Sidebar + Scrollable Content) */}
      <div className="pnd-workspace">
        
        {/* Left Sidebar */}
        <DashboardSidebar 
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="pnd-main-content">
          <div className="pnd-content-inner">

            {/* 1. Main Page Heading */}
            <div className="pnd-page-header">
              <h1 className="pnd-page-title">Dashboard and Statistics</h1>
              <p className="pnd-page-subtitle">
                Get a complete overview of your subscriptions and customer activity.
              </p>
            </div>

            {/* 2. Filter Toolbar (4 interactive controls) */}
            <DashboardFilters 
              timeline={timeline}
              setTimeline={setTimeline}
              customerDate={customerDate}
              setCustomerDate={setCustomerDate}
              salesman={salesman}
              setSalesman={setSalesman}
              rm={rm}
              setRm={setRm}
            />

            {/* 3. Trials Overview Section (4 colored cards at top) */}
            <TrialsSummarySection />

            {/* 4. Subscription Summary Section */}
            <section className="pnd-summary-section" aria-labelledby="sub-summary-heading">
              <h2 id="sub-summary-heading" className="pnd-section-heading">
                Subscription summary
              </h2>

              <div className="pnd-summary-grid">
                
                {/* Left Card: Total Paid Subscription (~25% width on desktop) */}
                <div className="pnd-summary-left">
                  <TotalPaidSubscriptionCard />
                </div>

                {/* Right Panel: Renewals Details Card (~75% width on desktop) */}
                <div className="pnd-summary-right">
                  <div className="pnd-renewals-panel">
                    
                    {/* Renewals Header */}
                    <div className="pnd-renewals-panel-header">
                      <div className="pnd-renewals-title-group">
                        <RefreshCw size={19} className="pnd-renewals-icon" />
                        <h3 className="pnd-renewals-title">Renewals</h3>
                      </div>
                    </div>

                    {/* Compact 4 Stats Pills */}
                    <RenewalsStats 
                      isUpgradesExpanded={isUpgradesExpanded}
                      onToggleUpgrades={() => setIsUpgradesExpanded(prev => !prev)}
                      isDowngradesExpanded={isDowngradesExpanded}
                      onToggleDowngrades={() => setIsDowngradesExpanded(prev => !prev)}
                    />

                    {/* Structured Subscription Details Table */}
                    <SubscriptionSummaryTable 
                      isUpgradesExpanded={isUpgradesExpanded}
                      setIsUpgradesExpanded={setIsUpgradesExpanded}
                      isDowngradesExpanded={isDowngradesExpanded}
                      setIsDowngradesExpanded={setIsDowngradesExpanded}
                    />

                  </div>
                </div>

              </div>
            </section>

            {/* 5. Performance Graphs, Pie Chart & Renewal Status Section */}
            <DashboardChartsSection />

          </div>
        </main>

      </div>
    </div>
  );
}
