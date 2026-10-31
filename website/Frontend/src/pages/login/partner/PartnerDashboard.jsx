import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../../../assets/NISPL Cloud Tech Logo Black.png';
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
  CheckCircle,
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  DollarSign,
  Download,
  AlertCircle
} from 'lucide-react';
import { CountUp } from '../../Dashboard/utils/useCountUp';
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
                    <div className="pnd-nav-item-left">
                      <Icon size={18} className="pnd-nav-icon" />
                      <span className="pnd-nav-label">{item.label}</span>
                    </div>
                    <div className="pnd-nav-item-right">
                      {item.badge && (
                        <span className={`pnd-nav-badge ${item.badge === 'New' ? 'badge-new' : ''}`}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight size={14} className="pnd-nav-arrow" />}
                    </div>
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
                    <div className="pnd-nav-item-left">
                      <Icon size={18} className="pnd-nav-icon" />
                      <span className="pnd-nav-label">{item.label}</span>
                    </div>
                    <div className="pnd-nav-item-right">
                      {isActive && <ChevronRight size={14} className="pnd-nav-arrow" />}
                    </div>
                  </button>
                );
              })}
            </nav>
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
          <span className="pnd-metric-number">
            <CountUp end={148} duration={1500} />
          </span>
          <span className="pnd-metric-label">Subscription</span>
        </div>

        {/* Thin vertical divider */}
        <div className="pnd-metric-divider" />

        {/* Metric 2: User */}
        <div className="pnd-metric-item">
          <span className="pnd-metric-number">
            <CountUp end={892} separator="," duration={1600} />
          </span>
          <span className="pnd-metric-label">User</span>
        </div>
      </div>

      {/* Subtle decorative bottom accent */}
      <div className="pnd-paid-card-footer">
        <span className="pnd-paid-status-chip">
          Active Subscriptions Overview (+18.4% YoY)
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
        <span className="pnd-stat-val">
          <CountUp end={84} duration={1400} />
        </span>
      </div>

      {/* Stat 2: Renewed (Light Blue) */}
      <div className="pnd-stat-pill blue">
        <span className="pnd-stat-label">Renewed</span>
        <span className="pnd-stat-val">
          <CountUp end={56} duration={1400} />
        </span>
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
          <span className="pnd-stat-val">
            <CountUp end={22} duration={1500} />
          </span>
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
          <span className="pnd-stat-val">
            <CountUp end={6} duration={1300} />
          </span>
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
            <td className="pnd-td-sub">
              <CountUp end={84} duration={1400} />
            </td>
            <td className="pnd-td-user">
              <CountUp end={460} separator="," duration={1500} />
            </td>
            <td className="pnd-td-amount">
              ₹<CountUp end={420000} separator="," duration={1500} />
            </td>
          </tr>

          {/* Row 2: Renewed */}
          <tr className="pnd-row">
            <td className="pnd-td-name">
              <div className="pnd-name-cell">
                <span className="pnd-row-num">2</span>
                <span className="pnd-item-title">Renewed</span>
              </div>
            </td>
            <td className="pnd-td-sub">
              <CountUp end={56} duration={1400} />
            </td>
            <td className="pnd-td-user">
              <CountUp end={312} separator="," duration={1500} />
            </td>
            <td className="pnd-td-amount">
              ₹<CountUp end={280000} separator="," duration={1500} />
            </td>
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
            <td className="pnd-td-sub">
              <CountUp end={22} duration={1500} />
            </td>
            <td className="pnd-td-user">
              <CountUp end={118} separator="," duration={1500} />
            </td>
            <td className="pnd-td-amount">
              ₹<CountUp end={118000} separator="," duration={1500} />
            </td>
          </tr>

          {/* Upgrades Nested Rows: 3.1, 3.2, 3.3 */}
          {isUpgradesExpanded && (
            <>
              <tr className="pnd-row pnd-child-row">
                <td className="pnd-td-name child">
                  <div className="pnd-child-cell">
                    <span className="pnd-tree-line" />
                    <span className="pnd-child-num">3.1</span>
                    <span className="pnd-child-title">Subscription Tier</span>
                  </div>
                </td>
                <td className="pnd-td-sub">
                  <CountUp end={22} duration={1300} />
                </td>
                <td className="pnd-td-user">-</td>
                <td className="pnd-td-amount">
                  ₹<CountUp end={118000} separator="," duration={1400} />
                </td>
              </tr>
              <tr className="pnd-row pnd-child-row">
                <td className="pnd-td-name child">
                  <div className="pnd-child-cell">
                    <span className="pnd-tree-line" />
                    <span className="pnd-child-num">3.2</span>
                    <span className="pnd-child-title">User Expansion</span>
                  </div>
                </td>
                <td className="pnd-td-sub">-</td>
                <td className="pnd-td-user">
                  <CountUp end={118} duration={1300} />
                </td>
                <td className="pnd-td-amount">
                  ₹<CountUp end={48000} separator="," duration={1400} />
                </td>
              </tr>
              <tr className="pnd-row pnd-child-row">
                <td className="pnd-td-name child">
                  <div className="pnd-child-cell">
                    <span className="pnd-tree-line" />
                    <span className="pnd-child-num">3.3</span>
                    <span className="pnd-child-title">Compute / Storage Add-on</span>
                  </div>
                </td>
                <td className="pnd-td-sub">-</td>
                <td className="pnd-td-user">-</td>
                <td className="pnd-td-amount">
                  ₹<CountUp end={70000} separator="," duration={1400} />
                </td>
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
            <td className="pnd-td-sub">
              <CountUp end={6} duration={1300} />
            </td>
            <td className="pnd-td-user">
              <CountUp end={30} duration={1300} />
            </td>
            <td className="pnd-td-amount">
              ₹<CountUp end={22000} separator="," duration={1400} />
            </td>
          </tr>

          {/* Downgrades Nested Rows: 4.1, 4.2, 4.3 */}
          {isDowngradesExpanded && (
            <>
              <tr className="pnd-row pnd-child-row">
                <td className="pnd-td-name child">
                  <div className="pnd-child-cell">
                    <span className="pnd-tree-line" />
                    <span className="pnd-child-num">4.1</span>
                    <span className="pnd-child-title">License Downgrade</span>
                  </div>
                </td>
                <td className="pnd-td-sub">
                  <CountUp end={6} duration={1200} />
                </td>
                <td className="pnd-td-user">-</td>
                <td className="pnd-td-amount">
                  ₹<CountUp end={22000} separator="," duration={1300} />
                </td>
              </tr>
              <tr className="pnd-row pnd-child-row">
                <td className="pnd-td-name child">
                  <div className="pnd-child-cell">
                    <span className="pnd-tree-line" />
                    <span className="pnd-child-num">4.2</span>
                    <span className="pnd-child-title">User Reductions</span>
                  </div>
                </td>
                <td className="pnd-td-sub">-</td>
                <td className="pnd-td-user">
                  <CountUp end={30} duration={1200} />
                </td>
                <td className="pnd-td-amount">
                  ₹<CountUp end={12000} separator="," duration={1300} />
                </td>
              </tr>
              <tr className="pnd-row pnd-child-row">
                <td className="pnd-td-name child">
                  <div className="pnd-child-cell">
                    <span className="pnd-tree-line" />
                    <span className="pnd-child-num">4.3</span>
                    <span className="pnd-child-title">Plan Reductions</span>
                  </div>
                </td>
                <td className="pnd-td-sub">-</td>
                <td className="pnd-td-user">-</td>
                <td className="pnd-td-amount">
                  ₹<CountUp end={10000} separator="," duration={1300} />
                </td>
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
            <td className="pnd-td-sub">
              <CountUp end={14} duration={1400} />
            </td>
            <td className="pnd-td-user">
              <CountUp end={78} duration={1400} />
            </td>
            <td className="pnd-td-amount">
              ₹<CountUp end={72500} separator="," duration={1500} />
            </td>
          </tr>

          {/* Row 6: Expired */}
          <tr className="pnd-row">
            <td className="pnd-td-name">
              <div className="pnd-name-cell">
                <span className="pnd-row-num">6</span>
                <span className="pnd-item-title">Expired</span>
              </div>
            </td>
            <td className="pnd-td-sub">
              <CountUp end={4} duration={1300} />
            </td>
            <td className="pnd-td-user">
              <CountUp end={18} duration={1300} />
            </td>
            <td className="pnd-td-amount">
              ₹<CountUp end={18000} separator="," duration={1400} />
            </td>
          </tr>

          {/* Row 7: Deleted */}
          <tr className="pnd-row">
            <td className="pnd-td-name">
              <div className="pnd-name-cell">
                <span className="pnd-row-num">7</span>
                <span className="pnd-item-title">Deleted</span>
              </div>
            </td>
            <td className="pnd-td-sub">
              <CountUp end={2} duration={1200} />
            </td>
            <td className="pnd-td-user">
              <CountUp end={6} duration={1200} />
            </td>
            <td className="pnd-td-amount">
              ₹<CountUp end={8500} separator="," duration={1300} />
            </td>
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
      amount: 48500,
      subscription: 18,
      color: 'blue',
      icon: UserPlus,
      bgClass: 'pnd-trial-blue'
    },
    {
      id: 'trial-expired',
      title: 'Trial Expired',
      amount: 12400,
      subscription: 4,
      color: 'red',
      icon: Clock,
      bgClass: 'pnd-trial-red'
    },
    {
      id: 'trial-to-paid',
      title: 'Trial to Paid',
      amount: 96800,
      subscription: 28,
      color: 'green',
      icon: CheckCircle2,
      bgClass: 'pnd-trial-green'
    },
    {
      id: 'live-trials',
      title: 'Live Trials',
      amount: 32600,
      subscription: 12,
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
                  <span className="pnd-trial-metric-val">
                    ₹<CountUp end={card.amount} separator="," duration={1500} />
                  </span>
                  <span className="pnd-trial-metric-label">Amount</span>
                </div>

                <div className="pnd-trial-metric-divider" />

                <div className="pnd-trial-metric-item">
                  <span className="pnd-trial-metric-val">
                    <CountUp end={card.subscription} duration={1300} />
                  </span>
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
function generateSvgPaths(pts) {
  if (!pts || pts.length === 0) return { strokePath: '', areaPath: '' };
  if (pts.length === 1) {
    return {
      strokePath: `M ${pts[0].x} ${pts[0].y}`,
      areaPath: `M ${pts[0].x} ${pts[0].y} L ${pts[0].x} 155 L ${pts[0].x} 155 Z`
    };
  }

  let strokeD = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const mx = (p0.x + p1.x) / 2;
    strokeD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  const firstX = pts[0].x;
  const lastX = pts[pts.length - 1].x;
  const areaD = `${strokeD} L ${lastX} 155 L ${firstX} 155 Z`;

  return { strokePath: strokeD, areaPath: areaD };
}

export function DashboardChartsSection() {
  const [activeTimeframe, setActiveTimeframe] = useState('Monthly');
  const [activePointIndex, setActivePointIndex] = useState(3);
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  // Timeframe datasets demonstrating progressive order increments
  const timeframeData = {
    Daily: [
      { label: 'Mon', x: 50, y: 138, subs: 18, revenue: '₹24,500' },
      { label: 'Tue', x: 120, y: 120, subs: 26, revenue: '₹34,800' },
      { label: 'Wed', x: 190, y: 98, subs: 42, revenue: '₹55,200' },
      { label: 'Thu', x: 260, y: 82, subs: 58, revenue: '₹76,400' },
      { label: 'Fri', x: 330, y: 64, subs: 74, revenue: '₹97,200' },
      { label: 'Sat', x: 400, y: 45, subs: 96, revenue: '₹1,26,000' },
      { label: 'Sun', x: 470, y: 28, subs: 118, revenue: '₹1,54,800' }
    ],
    Weekly: [
      { label: 'Week 1', x: 60, y: 130, subs: 48, revenue: '₹64,000' },
      { label: 'Week 2', x: 195, y: 92, subs: 86, revenue: '₹1,15,000' },
      { label: 'Week 3', x: 330, y: 58, subs: 134, revenue: '₹1,78,000' },
      { label: 'Week 4', x: 470, y: 26, subs: 182, revenue: '₹2,42,800' }
    ],
    Monthly: [
      { label: 'May', x: 50, y: 140, subs: 112, revenue: '₹1,48,000' },
      { label: 'Jun', x: 134, y: 118, subs: 148, revenue: '₹1,96,000' },
      { label: 'Jul', x: 218, y: 94, subs: 195, revenue: '₹2,58,000' },
      { label: 'Aug', x: 302, y: 70, subs: 240, revenue: '₹3,18,000' },
      { label: 'Sep', x: 386, y: 48, subs: 298, revenue: '₹3,95,000' },
      { label: 'Oct', x: 470, y: 25, subs: 365, revenue: '₹4,86,000' }
    ]
  };

  const currentPoints = timeframeData[activeTimeframe] || timeframeData.Monthly;
  const safeActiveIndex = (activePointIndex !== null && activePointIndex < currentPoints.length)
    ? activePointIndex 
    : Math.floor(currentPoints.length / 2);
  const activePoint = currentPoints[safeActiveIndex] || currentPoints[0];

  const { strokePath, areaPath } = generateSvgPaths(currentPoints);

  const handleTimeframeChange = (tf) => {
    setActiveTimeframe(tf);
    const pts = timeframeData[tf] || [];
    setActivePointIndex(Math.floor(pts.length / 2));
  };

  // Pie / Donut Chart Slices (Total 1,280 subs)
  const pieSlices = [
    { id: 'tally', name: 'Tally on Cloud', pct: '42%', count: 538, color: '#6366f1', dasharray: '158.3 218.7', dashoffset: '0' },
    { id: 'vps', name: 'Dedicated Cloud VPS', pct: '28%', count: 358, color: '#06b6d4', dasharray: '105.6 271.4', dashoffset: '-158.3' },
    { id: 'm365', name: 'Microsoft 365 Enterprise', pct: '18%', count: 230, color: '#8b5cf6', dasharray: '67.9 309.1', dashoffset: '-263.9' },
    { id: 'noc', name: 'Managed Security / NOC', pct: '12%', count: 154, color: '#10b981', dasharray: '45.2 331.8', dashoffset: '-331.8' }
  ];

  // Bar Chart Data (Renewal & Conversion Performance)
  const barData = [
    { label: 'Renewed', count: 84, height: '88%', color: '#10B981', bgClass: 'bar-green' },
    { label: 'Upgraded', count: 42, height: '52%', color: '#8B5CF6', bgClass: 'bar-purple' },
    { label: 'Trial to Paid', count: 30, height: '40%', color: '#6366F1', bgClass: 'bar-blue' },
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
                  onClick={() => handleTimeframeChange(tf)}
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
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.38" />
                  <stop offset="60%" stopColor="#6366f1" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal grid lines */}
              <line x1="30" y1="35" x2="500" y2="35" stroke="#E2E8F0" strokeDasharray="4 4" opacity="0.7" />
              <line x1="30" y1="75" x2="500" y2="75" stroke="#E2E8F0" strokeDasharray="4 4" opacity="0.7" />
              <line x1="30" y1="115" x2="500" y2="115" stroke="#E2E8F0" strokeDasharray="4 4" opacity="0.7" />
              <line x1="30" y1="155" x2="500" y2="155" stroke="#E2E8F0" opacity="0.9" />

              {/* Area Gradient Fill with CSS path transition */}
              <path
                d={areaPath}
                fill="url(#pndTrendGrad)"
                className="pnd-area-path"
              />

              {/* Stroke Line Curve */}
              <path
                d={strokePath}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3.2"
                strokeLinecap="round"
                className="pnd-stroke-path"
              />

              {/* Interactive Data Points */}
              {currentPoints.map((pt, idx) => {
                const isSelected = safeActiveIndex === idx;
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
                        fill="#6366f1"
                        opacity="0.22"
                        className="pnd-pulse-circle"
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? "6" : "4.5"}
                      fill="#FFFFFF"
                      stroke="#6366f1"
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
                  <span className="tooltip-subs">
                    <b><CountUp end={activePoint.subs} duration={600} /></b> Subs
                  </span>
                  <span className="tooltip-rev">{activePoint.revenue}</span>
                </div>
              </div>
            )}

            {/* X-Axis Labels */}
            <div className="pnd-axis-x-row">
              {currentPoints.map((pt) => (
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
                  <CountUp 
                    end={hoveredSlice !== null ? pieSlices[hoveredSlice].count : 1280} 
                    separator="," 
                    duration={1000} 
                  />
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
                    <span className="legend-count">
                      <CountUp end={slice.count} duration={1200} />
                    </span>
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
                  <span><CountUp end={bar.count} duration={1000} /> Subs</span>
                </div>
                
                <span className="pnd-bar-count">
                  <CountUp end={bar.count} duration={1200} />
                </span>
                
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
   EXTRA PARTNER VIEWS: SUBSCRIPTIONS, CUSTOMERS, REPORTS, SUPPORT, SETTINGS
   ========================================================================= */

export function PartnerSubscriptionsView({ onBack }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const subsData = [
    { id: 'SUB-2026-901', client: 'Tata Steel Processing Ltd', plan: 'Dedicated Xeon Node (16GB)', users: '25 Users', expiry: '24 Nov 2026', amount: '₹14,500', status: 'Active' },
    { id: 'SUB-2026-902', client: 'Sawansukha Jewellers Pvt Ltd', plan: 'Tally on Cloud Multi-User', users: '10 Users', expiry: '12 Dec 2026', amount: '₹8,260', status: 'Active' },
    { id: 'SUB-2026-903', client: 'Sampurna Finance Corporation', plan: 'Biz Analyst Mobile Sync', users: '15 Users', expiry: '05 Nov 2026', amount: '₹5,310', status: 'Expiring Soon' },
    { id: 'SUB-2026-904', client: 'Kolkata Port Logistics Ltd', plan: 'Enterprise Cloud Instance', users: '50 Users', expiry: '18 Jan 2027', amount: '₹28,400', status: 'Active' },
    { id: 'SUB-2026-905', client: 'Burdwan University Tech Park', plan: 'Tally Prime TSS Renewal', users: '5 Users', expiry: '02 Nov 2026', amount: '₹5,310', status: 'Expiring Soon' },
    { id: 'SUB-2026-906', client: 'Eastern Metal Works LLP', plan: 'Cloud Node 8GB RAM', users: '8 Users', expiry: '14 Feb 2027', amount: '₹7,800', status: 'Active' }
  ];

  const filtered = subsData.filter(item => {
    const matchesSearch = item.client.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase()) || item.plan.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pnd-tab-container animate-fade-in">
      <div className="pnd-page-header">
        <div className="pnd-page-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="pnd-page-title">Subscriptions Management</h1>
            <span className="pnd-nav-badge" style={{ fontSize: '0.8rem', padding: '3px 10px' }}>12 Active</span>
          </div>
          <p className="pnd-page-subtitle">
            Track client software licenses, renewal deadlines, and recurring cloud subscriptions.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="pnd-cal-action-btn secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '12px' }}
        >
          <ArrowLeft size={15} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="pnd-tab-kpi-grid">
        <div className="pnd-trial-card">
          <span className="pnd-trial-title" style={{ fontSize: '0.85rem', color: '#64748b' }}>Active Subscriptions</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              <CountUp end={12} duration={1200} />
            </span>
            <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700 }}>100% Deployed</span>
          </div>
        </div>
        <div className="pnd-trial-card">
          <span className="pnd-trial-title" style={{ fontSize: '0.85rem', color: '#64748b' }}>Expiring in 30 Days</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444' }}>
              <CountUp end={3} duration={1200} />
            </span>
            <span style={{ background: '#fef2f2', color: '#dc2626', padding: '3px 8px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700 }}>Action Required</span>
          </div>
        </div>
        <div className="pnd-trial-card">
          <span className="pnd-trial-title" style={{ fontSize: '0.85rem', color: '#64748b' }}>Annual Recurring (ARR)</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              ₹<CountUp end={486000} separator="," duration={1500} />
            </span>
            <span style={{ background: '#ede9fe', color: '#6366f1', padding: '3px 8px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700 }}>+14% MoM</span>
          </div>
        </div>
        <div className="pnd-trial-card">
          <span className="pnd-trial-title" style={{ fontSize: '0.85rem', color: '#64748b' }}>Auto-Renewal Rate</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              <CountUp end={94.8} decimals={1} suffix="%" duration={1400} />
            </span>
            <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700 }}>SLA Protected</span>
          </div>
        </div>
      </div>

      {/* Subscriptions Table Card */}
      <div className="pnd-tab-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Active Subscriptions Registry</h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Showing verified enterprise licenses managed by your partner account</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Filter by client or plan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pnd-filter-control"
              style={{ width: '220px', height: '36px' }}
            />
            <button type="button" className="pnd-cal-action-btn secondary" style={{ height: '36px', borderRadius: '10px' }} onClick={() => setFilterStatus(filterStatus === 'All' ? 'Expiring Soon' : 'All')}>
              {filterStatus === 'All' ? 'Show Expiring' : 'Show All'}
            </button>
          </div>
        </div>

        <div className="pnd-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="pnd-table">
            <thead>
              <tr>
                <th>Subscription ID</th>
                <th>Client / Enterprise</th>
                <th>Plan &amp; Node Specs</th>
                <th style={{ textAlign: 'center' }}>Seats</th>
                <th>Expiry Date</th>
                <th style={{ textAlign: 'right' }}>Annual Billing</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.id} className="pnd-row">
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#6366f1', fontFamily: 'monospace' }}>{row.id}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>{row.client}</td>
                  <td style={{ padding: '14px 18px', color: '#64748b' }}>{row.plan}</td>
                  <td style={{ padding: '14px 18px', textAlign: 'center', fontWeight: 600 }}>{row.users}</td>
                  <td style={{ padding: '14px 18px', color: '#0f172a' }}>{row.expiry}</td>
                  <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{row.amount}</td>
                  <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      background: row.status === 'Active' ? '#ecfdf5' : '#fef2f2',
                      color: row.status === 'Active' ? '#059669' : '#dc2626'
                    }}>
                      {row.status}
                    </span>
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

export function PartnerCustomersView({ onBack }) {
  const [search, setSearch] = useState('');
  const customers = [
    { id: 'CUST-101', name: 'Tata Steel Processing Ltd', contact: 'Mr. R. Sengupta (CTO)', email: 'r.sengupta@tatasteel.com', nodes: '3 Dedicated', plan: 'Tally Cloud Enterprise', city: 'Jamshedpur' },
    { id: 'CUST-102', name: 'Sawansukha Jewellers Pvt Ltd', contact: 'Siddharth Sawansukha (Director)', email: 'accounts@sawansukha.com', nodes: '2 Hybrid', plan: 'Tally Prime Gold', city: 'Kolkata' },
    { id: 'CUST-103', name: 'Sampurna Finance Corporation', contact: 'Amitabh Roy (Finance Head)', email: 'amitabh@sampurnafinance.in', nodes: '4 Virtual', plan: 'Biz Analyst Cloud', city: 'Bhubaneswar' },
    { id: 'CUST-104', name: 'Kolkata Port Logistics Ltd', contact: 'P. K. Chatterjee (IT GM)', email: 'it@kolkataport.gov.in', nodes: '8 Dedicated', plan: 'Enterprise VPS Cluster', city: 'Kolkata' },
    { id: 'CUST-105', name: 'Burdwan University Tech Park', contact: 'Dr. Debabrata Das (Dean)', email: 'dean.tech@burdwanuniv.ac.in', nodes: '2 Cloud', plan: 'Tally Prime Multi-User', city: 'Burdwan' },
    { id: 'CUST-106', name: 'Eastern Metal Works LLP', contact: 'Vikas Agarwal (Partner)', email: 'vikas@easternmetals.co.in', nodes: '2 Dedicated', plan: 'Tally Prime & Cloud', city: 'Siliguri' }
  ];

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="pnd-tab-container animate-fade-in">
      <div className="pnd-page-header">
        <div className="pnd-page-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="pnd-page-title">Enterprise Customer Directory</h1>
            <span className="pnd-nav-badge" style={{ fontSize: '0.8rem', padding: '3px 10px' }}>48 Clients</span>
          </div>
          <p className="pnd-page-subtitle">
            Manage your partner client accounts, primary organization contacts, and deployed cloud instances.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="pnd-cal-action-btn secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '12px' }}
        >
          <ArrowLeft size={15} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="pnd-tab-kpi-grid">
        <div className="pnd-trial-card">
          <span className="pnd-trial-title" style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Corporate Accounts</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              <CountUp end={48} duration={1200} />
            </span>
            <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700 }}>+6 This Quarter</span>
          </div>
        </div>
        <div className="pnd-trial-card">
          <span className="pnd-trial-title" style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Active Nodes</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              <CountUp end={124} duration={1300} />
            </span>
            <span style={{ background: '#ede9fe', color: '#6366f1', padding: '3px 8px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700 }}>99.98% SLA</span>
          </div>
        </div>
        <div className="pnd-trial-card">
          <span className="pnd-trial-title" style={{ fontSize: '0.85rem', color: '#64748b' }}>GST Compliance Rate</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              <CountUp end={100} suffix="%" duration={1200} />
            </span>
            <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700 }}>Verified B2B</span>
          </div>
        </div>
        <div className="pnd-trial-card">
          <span className="pnd-trial-title" style={{ fontSize: '0.85rem', color: '#64748b' }}>Client Retention</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              <CountUp end={98.2} decimals={1} suffix="%" duration={1400} />
            </span>
            <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700 }}>Top Tier</span>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="pnd-tab-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Assigned Customer Directory</h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Direct portfolio accounts tagged with your partner identifier #NIS-9042</span>
          </div>
          <input
            type="text"
            placeholder="Search company, city, contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pnd-filter-control"
            style={{ width: '260px', height: '36px' }}
          />
        </div>

        <div className="pnd-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="pnd-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Company Name</th>
                <th>Primary Contact</th>
                <th>Email Address</th>
                <th>Linked Nodes</th>
                <th>Active Plan</th>
                <th>Region</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="pnd-row">
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#6366f1', fontFamily: 'monospace' }}>{c.id}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>{c.name}</td>
                  <td style={{ padding: '14px 18px', color: '#475569' }}>{c.contact}</td>
                  <td style={{ padding: '14px 18px', color: '#64748b' }}>{c.email}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ background: '#f1f5f9', color: '#0f172a', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>{c.nodes}</span>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#0f172a', fontWeight: 500 }}>{c.plan}</td>
                  <td style={{ padding: '14px 18px', color: '#64748b' }}>{c.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function PartnerReportsView({ onBack }) {
  const reports = [
    { period: 'October 2026', totalGMV: '₹1,84,200', commRate: '20%', commAmount: '₹36,840', tds: '₹1,842', netPayout: '₹34,998', status: 'Settled' },
    { period: 'September 2026', totalGMV: '₹2,12,000', commRate: '20%', commAmount: '₹42,400', tds: '₹2,120', netPayout: '₹40,280', status: 'Settled' },
    { period: 'August 2026', totalGMV: '₹1,95,000', commRate: '20%', commAmount: '₹39,000', tds: '₹1,950', netPayout: '₹37,050', status: 'Settled' },
    { period: 'July 2026', totalGMV: '₹1,64,000', commRate: '20%', commAmount: '₹32,800', tds: '₹1,640', netPayout: '₹31,160', status: 'Settled' },
  ];

  return (
    <div className="pnd-tab-container animate-fade-in">
      <div className="pnd-page-header">
        <div className="pnd-page-header-text">
          <h1 className="pnd-page-title">Financial Reports &amp; Commission Payouts</h1>
          <p className="pnd-page-subtitle">
            Download certified partner settlement receipts, monthly commission vouchers, and GST tax credit certificates.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="pnd-cal-action-btn secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '12px' }}
        >
          <ArrowLeft size={15} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="pnd-tab-kpi-grid">
        <div className="pnd-trial-card">
          <span className="pnd-trial-title" style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Partner Commission</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              ₹<CountUp end={368400} separator="," duration={1500} />
            </span>
            <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700 }}>20% Gold Tier</span>
          </div>
        </div>
        <div className="pnd-trial-card">
          <span className="pnd-trial-title" style={{ fontSize: '0.85rem', color: '#64748b' }}>Settled This Month</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              ₹<CountUp end={34998} separator="," duration={1400} />
            </span>
            <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700 }}>Direct NEFT</span>
          </div>
        </div>
        <div className="pnd-trial-card">
          <span className="pnd-trial-title" style={{ fontSize: '0.85rem', color: '#64748b' }}>Next Settlement Date</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#6366f1' }}>05 Nov 2026</span>
            <span style={{ background: '#ede9fe', color: '#6366f1', padding: '3px 8px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700 }}>Auto-Disburse</span>
          </div>
        </div>
        <div className="pnd-trial-card">
          <span className="pnd-trial-title" style={{ fontSize: '0.85rem', color: '#64748b' }}>Form 16A TDS Deducted</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              ₹<CountUp end={18420} separator="," duration={1300} />
            </span>
            <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '3px 8px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700 }}>TRACES File</span>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="pnd-tab-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Monthly Settlement Statements</h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Historical statements credited to your bank account</span>
          </div>
          <button
            type="button"
            className="pnd-cal-action-btn primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px' }}
            onClick={() => alert('Downloading official Consolidated Partner Statement PDF...')}
          >
            <Download size={14} />
            <span>Export Statement (PDF)</span>
          </button>
        </div>

        <div className="pnd-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="pnd-table">
            <thead>
              <tr>
                <th>Billing Period</th>
                <th style={{ textAlign: 'right' }}>Gross Partner GMV</th>
                <th style={{ textAlign: 'center' }}>Commission Rate</th>
                <th style={{ textAlign: 'right' }}>Gross Commission</th>
                <th style={{ textAlign: 'right' }}>TDS (5%)</th>
                <th style={{ textAlign: 'right' }}>Net Disbursed</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={i} className="pnd-row">
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>{r.period}</td>
                  <td style={{ padding: '14px 18px', textAlign: 'right', color: '#64748b' }}>{r.totalGMV}</td>
                  <td style={{ padding: '14px 18px', textAlign: 'center', fontWeight: 600, color: '#6366f1' }}>{r.commRate}</td>
                  <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>{r.commAmount}</td>
                  <td style={{ padding: '14px 18px', textAlign: 'right', color: '#dc2626' }}>{r.tds}</td>
                  <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, color: '#059669', fontFamily: 'monospace', fontSize: '0.94rem' }}>{r.netPayout}</td>
                  <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                    <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700 }}>
                      {r.status}
                    </span>
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

export function PartnerSupportView({ onBack }) {
  const tickets = [
    { id: 'TKT-991', client: 'Tata Steel Processing Ltd', issue: 'Tally Multi-user Sync Delay (Node #2)', priority: 'High', opened: '28 Oct 2026', status: 'In Progress', engineer: 'Debojyoti M. (L3 Senior)' },
    { id: 'TKT-988', client: 'Sawansukha Jewellers Pvt Ltd', issue: 'SSL Certificate Renewal on Cloud Port', priority: 'Medium', opened: '24 Oct 2026', status: 'Resolved', engineer: 'Priya N. (Cloud Ops)' },
    { id: 'TKT-982', client: 'Kolkata Port Logistics Ltd', issue: 'Firewall IP Whitelisting for Office LAN', priority: 'Low', opened: '19 Oct 2026', status: 'Resolved', engineer: 'Amitabh S. (NOC Desk)' },
  ];

  return (
    <div className="pnd-tab-container animate-fade-in">
      <div className="pnd-page-header">
        <div className="pnd-page-header-text">
          <h1 className="pnd-page-title">Partner NOC &amp; Priority Support Desk</h1>
          <p className="pnd-page-subtitle">
            Direct priority escalation matrix for authorized partners with 15-minute SLA on enterprise workloads.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="pnd-cal-action-btn secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '12px' }}
        >
          <ArrowLeft size={15} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* 3 Hot Support Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
        <div className="pnd-tab-card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ede9fe', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Phone size={20} />
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '0.96rem', fontWeight: 700, color: '#0f172a' }}>24/7 Dedicated Partner NOC</h4>
            <p style={{ margin: '0 0 8px', fontSize: '0.84rem', color: '#64748b' }}>Emergency server outage / sync halt priority hotline</p>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#6366f1', fontFamily: 'monospace' }}>+91 (033) 4004-9988</span>
          </div>
        </div>

        <div className="pnd-tab-card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Mail size={20} />
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '0.96rem', fontWeight: 700, color: '#0f172a' }}>Priority Helpdesk Email</h4>
            <p style={{ margin: '0 0 8px', fontSize: '0.84rem', color: '#64748b' }}>Tickets dispatched directly to senior cloud L3 team</p>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#059669' }}>partner-noc@netinfotechsystem.in</span>
          </div>
        </div>

        <div className="pnd-tab-card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '0.96rem', fontWeight: 700, color: '#0f172a' }}>Assigned Partner RM</h4>
            <p style={{ margin: '0 0 8px', fontSize: '0.84rem', color: '#64748b' }}>Senior Channel RM: Suman Banerjee</p>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0284c7' }}>Direct: +91 98301 22445</span>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="pnd-tab-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Active Support &amp; Escalation Tickets</h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Real-time status of technical inquiries logged for client accounts</span>
          </div>
          <button
            type="button"
            className="pnd-cal-action-btn primary"
            style={{ padding: '8px 16px', borderRadius: '10px' }}
            onClick={() => alert('Opening Partner Priority Ticket Portal...')}
          >
            + Create New Ticket
          </button>
        </div>

        <div className="pnd-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="pnd-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Client Organization</th>
                <th>Subject &amp; Issue Summary</th>
                <th>Priority</th>
                <th>Opened Date</th>
                <th>Assigned Engineer</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id} className="pnd-row">
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#6366f1', fontFamily: 'monospace' }}>{t.id}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>{t.client}</td>
                  <td style={{ padding: '14px 18px', color: '#475569' }}>{t.issue}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: t.priority === 'High' ? '#fef2f2' : t.priority === 'Medium' ? '#fef3c7' : '#f1f5f9',
                      color: t.priority === 'High' ? '#dc2626' : t.priority === 'Medium' ? '#d97706' : '#64748b'
                    }}>
                      {t.priority}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748b' }}>{t.opened}</td>
                  <td style={{ padding: '14px 18px', color: '#0f172a', fontWeight: 500 }}>{t.engineer}</td>
                  <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      background: t.status === 'Resolved' ? '#ecfdf5' : '#ede9fe',
                      color: t.status === 'Resolved' ? '#059669' : '#6366f1'
                    }}>
                      {t.status}
                    </span>
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

export function PartnerSettingsView({ onBack }) {
  return (
    <div className="pnd-tab-container animate-fade-in">
      <div className="pnd-page-header">
        <div className="pnd-page-header-text">
          <h1 className="pnd-page-title">Partner Account &amp; Payout Settings</h1>
          <p className="pnd-page-subtitle">
            Configure direct NEFT/RTGS bank settlement details, GST compliance certificates, and technical webhooks.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="pnd-cal-action-btn secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '12px' }}
        >
          <ArrowLeft size={15} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '22px' }}>
        {/* Card 1: Bank Settlement */}
        <div className="pnd-tab-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Direct Payout Bank Account</h3>
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>Monthly commissions are automatically disbursed to this verified bank account on the 5th of every month.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Account Holder / Firm Name</label>
              <input type="text" readOnly value="Net Infotech System Partner Solutions LLP" className="pnd-filter-control" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Bank Name &amp; Branch</label>
                <input type="text" readOnly value="HDFC Bank Ltd, Salt Lake Sector V" className="pnd-filter-control" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>IFSC Code</label>
                <input type="text" readOnly value="HDFC0001244" className="pnd-filter-control" style={{ fontFamily: 'monospace', fontWeight: 700 }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Current Account Number</label>
              <input type="text" readOnly value="50200088912344" className="pnd-filter-control" style={{ fontFamily: 'monospace', fontWeight: 700 }} />
            </div>
          </div>
        </div>

        {/* Card 2: Legal & Compliance */}
        <div className="pnd-tab-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Tax &amp; Legal Verification</h3>
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>Active compliance documents registered with NISPL Corporate Partner Registry.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>GSTIN Identifier</label>
              <input type="text" readOnly value="19AAACN8899K1Z5" className="pnd-filter-control" style={{ fontFamily: 'monospace', fontWeight: 700 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Corporate PAN</label>
              <input type="text" readOnly value="AAACN8899K" className="pnd-filter-control" style={{ fontFamily: 'monospace', fontWeight: 700 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Partner Tier Status</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="pnd-tier-pill" style={{ margin: 0 }}>
                  <ShieldCheck size={14} />
                  <span>Gold Tier Partner (20% Revenue Share)</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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

            {/* TAB 1: DASHBOARD (ALL 5 ORIGINAL SECTIONS PRESERVED 100%) */}
            {activeNav === 'dashboard' && (
              <>
                {/* 1. Main Page Heading */}
                <div className="pnd-page-header">
                  <div className="pnd-page-header-text">
                    <h1 className="pnd-page-title">Overview and Statistics</h1>
                    <p className="pnd-page-subtitle">
                      Get a complete overview of your subscriptions and customer activity.
                    </p>
                  </div>
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
              </>
            )}

            {/* TAB 2: SUBSCRIPTIONS */}
            {activeNav === 'subscriptions' && (
              <PartnerSubscriptionsView onBack={() => setActiveNav('dashboard')} />
            )}

            {/* TAB 3: CUSTOMERS */}
            {activeNav === 'customers' && (
              <PartnerCustomersView onBack={() => setActiveNav('dashboard')} />
            )}

            {/* TAB 4: REPORTS */}
            {activeNav === 'reports' && (
              <PartnerReportsView onBack={() => setActiveNav('dashboard')} />
            )}

            {/* TAB 5: SUPPORT & NOC */}
            {activeNav === 'support' && (
              <PartnerSupportView onBack={() => setActiveNav('dashboard')} />
            )}

            {/* TAB 6: SETTINGS */}
            {activeNav === 'settings' && (
              <PartnerSettingsView onBack={() => setActiveNav('dashboard')} />
            )}

          </div>
        </main>

      </div>
    </div>
  );
}
