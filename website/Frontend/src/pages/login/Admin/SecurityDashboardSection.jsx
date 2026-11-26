import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Globe,
  Search,
  RefreshCw,
  AlertTriangle,
  Lock,
  Activity,
  XCircle
} from 'lucide-react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { securityApi } from '../../../services/securityApi';
import AdminDataTable from './AdminDataTable';
import DateRangeFilter from './DateRangeFilter';
import { compactSelectStyles } from './reactSelectStyles';

const RISK_STYLE = {
  Critical: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  High: { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  Medium: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  Low: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' }
};

const ACTION_STYLE = {
  block: { bg: '#fee2e2', color: '#dc2626', label: 'Blocked' },
  challenge: { bg: '#fef3c7', color: '#b45309', label: 'Challenged' },
  allow: { bg: '#dcfce7', color: '#15803d', label: 'Allowed' },
  log: { bg: '#e0f2fe', color: '#0369a1', label: 'Logged' }
};

const EVENT_LABELS = {
  admin_login_failure: 'Admin Login Failure',
  customer_login_brute_force: 'Customer Login Brute Force',
  automated_bot: 'Automated Bot',
  api_scanning: 'API Scanning',
  suspicious_admin_access: 'Suspicious Admin Access',
  auth_endpoint_probe: 'Auth Endpoint Probe',
  sqli_attempt: 'SQL Injection Attempt',
  xss_attempt: 'XSS Attempt',
  rate_limit_exceeded: 'Rate Limit Exceeded',
  cloudflare_bypass: 'Cloudflare Bypass Attempt',
  turnstile_failed: 'Turnstile Failed',
  otp_failure: 'OTP Failure',
  password_reset_abuse: 'Password Reset Abuse'
};

const EVENT_TYPE_OPTIONS = [
  { value: 'all', label: 'All Attack / Event Types' },
  ...Object.entries(EVENT_LABELS).map(([value, label]) => ({ value, label }))
];

const RISK_OPTIONS = [
  { value: 'all', label: 'All Risk Levels' },
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' }
];

const ACTION_OPTIONS = [
  { value: 'all', label: 'All Actions' },
  { value: 'block', label: 'Blocked' },
  { value: 'challenge', label: 'Challenged' },
  { value: 'log', label: 'Logged' },
  { value: 'allow', label: 'Allowed' }
];

export default function SecurityDashboardSection() {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState({
    totalEvents: 0,
    blockedCount: 0,
    criticalHighCount: 0,
    uniqueIps: 0,
    topEventTypes: [],
    topCountries: []
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState('all');
  const [riskLevel, setRiskLevel] = useState('all');
  const [cloudflareAction, setCloudflareAction] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsRes, statusRes] = await Promise.all([
        securityApi.getSecurityEvents({
          search: search.trim(),
          eventType,
          riskLevel,
          cloudflareAction,
          from: dateFrom,
          to: dateTo,
          limit: 100
        }),
        securityApi.getSecurityStatus().catch(() => null)
      ]);
      setEvents(eventsRes.events || []);
      if (eventsRes.summary) setSummary(eventsRes.summary);
      if (statusRes) setStatus(statusRes);
    } catch (err) {
      toast.error(err.message || 'Unable to load security events');
    } finally {
      setLoading(false);
    }
  }, [search, eventType, riskLevel, cloudflareAction, dateFrom, dateTo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns = useMemo(
    () => [
      {
        id: 'timestamp',
        name: 'Timestamp',
        selector: (row) => row.timestamp,
        sortable: true,
        width: '175px',
        cell: (row) => (
          <span style={{ fontSize: '0.78rem', color: '#475569' }}>
            {row.timestamp ? new Date(row.timestamp).toLocaleString('en-IN') : '—'}
          </span>
        )
      },
      {
        id: 'ipAddress',
        name: 'IP Address',
        selector: (row) => row.ipAddress,
        sortable: true,
        width: '155px',
        cell: (row) => (
          <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem', color: '#0f172a' }}>
            {row.ipAddress || 'unknown'}
          </span>
        )
      },
      {
        id: 'country',
        name: 'Country',
        selector: (row) => row.country,
        sortable: true,
        width: '100px',
        cell: (row) => (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
            <Globe size={12} color="#64748b" />
            {row.country || 'Unknown'}
          </span>
        )
      },
      {
        id: 'eventType',
        name: 'Event Type',
        selector: (row) => EVENT_LABELS[row.eventType] || row.eventType,
        sortable: true,
        minWidth: '185px',
        cell: (row) => (
          <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#1e293b' }}>
            {EVENT_LABELS[row.eventType] || row.eventType}
          </span>
        )
      },
      {
        id: 'riskLevel',
        name: 'Risk Level',
        selector: (row) => row.riskLevel,
        sortable: true,
        width: '115px',
        cell: (row) => {
          const st = RISK_STYLE[row.riskLevel] || RISK_STYLE.Medium;
          return (
            <span
              style={{
                background: st.bg,
                color: st.color,
                border: `1px solid ${st.border}`,
                padding: '2px 9px',
                borderRadius: '12px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}
            >
              {row.riskLevel || 'Medium'}
            </span>
          );
        }
      },
      {
        id: 'cloudflareAction',
        name: 'Action',
        selector: (row) => row.cloudflareAction,
        sortable: true,
        width: '115px',
        cell: (row) => {
          const act = ACTION_STYLE[row.cloudflareAction] || ACTION_STYLE.log;
          return (
            <span
              style={{
                background: act.bg,
                color: act.color,
                padding: '2px 9px',
                borderRadius: '12px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}
            >
              {act.label}
            </span>
          );
        }
      },
      {
        id: 'requestUrl',
        name: 'Target URL',
        selector: (row) => `${row.method || 'GET'} ${row.requestUrl || '/'}`,
        sortable: true,
        minWidth: '210px',
        grow: 1,
        cell: (row) => (
          <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#334155', wordBreak: 'break-all' }}>
            <strong>{row.method || 'GET'}</strong> {row.requestUrl || '/'}
          </span>
        )
      },
      {
        id: 'details',
        name: 'Details / User-Agent',
        selector: (row) => row.details || row.userAgent,
        minWidth: '240px',
        grow: 1.2,
        cell: (row) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.74rem' }}>
            <span style={{ color: '#0f172a', fontWeight: 500 }}>{row.details || '—'}</span>
            {row.identifier && (
              <span style={{ color: '#475569' }}>Account: {row.identifier}</span>
            )}
            {row.userAgent && (
              <span style={{ color: '#94a3b8', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.userAgent}>
                UA: {row.userAgent}
              </span>
            )}
          </div>
        )
      }
    ],
    []
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Security KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        <div className="adm-kpi-card" style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Security Events</span>
            <Activity size={18} color="#2563eb" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>{summary.totalEvents}</div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>Logged in MongoDB security_events</div>
        </div>

        <div className="adm-kpi-card" style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Blocked Requests</span>
            <ShieldAlert size={18} color="#dc2626" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#dc2626', marginTop: '6px' }}>{summary.blockedCount}</div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>WAF, Rate Limit & Origin Guard</div>
        </div>

        <div className="adm-kpi-card" style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>High & Critical</span>
            <AlertTriangle size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#d97706', marginTop: '6px' }}>{summary.criticalHighCount}</div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>Brute-force, SQLi, bypass probes</div>
        </div>

        <div className="adm-kpi-card" style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Unique Suspicious IPs</span>
            <Globe size={18} color="#7c3aed" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#7c3aed', marginTop: '6px' }}>{summary.uniqueIps}</div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>Distinct client IPs flagged</div>
        </div>
      </div>

      {/* Live Protection Posture */}
      {status && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
            <ShieldCheck size={18} color="#16a34a" />
            <span>Active Protection Posture:</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.76rem' }}>
            <span style={{ padding: '4px 10px', borderRadius: '20px', background: '#dcfce7', color: '#15803d', fontWeight: 600 }}>
              Trust Proxy: Active (CF-Connecting-IP)
            </span>
            <span style={{ padding: '4px 10px', borderRadius: '20px', background: status.turnstileEnabled ? '#dcfce7' : '#fef3c7', color: status.turnstileEnabled ? '#15803d' : '#b45309', fontWeight: 600 }}>
              Turnstile: {status.turnstileEnabled ? 'Enabled' : 'Set TURNSTILE_SECRET_KEY'}
            </span>
            <span style={{ padding: '4px 10px', borderRadius: '20px', background: status.cloudflareStrictOrigin ? '#dcfce7' : '#e0f2fe', color: status.cloudflareStrictOrigin ? '#15803d' : '#0369a1', fontWeight: 600 }}>
              Origin Guard: {status.cloudflareStrictOrigin ? 'Strict (CF Only)' : 'Permissive (Set CLOUDFLARE_STRICT_ORIGIN=true in Prod)'}
            </span>
            <span style={{ padding: '4px 10px', borderRadius: '20px', background: '#ede9fe', color: '#6d28d9', fontWeight: 600 }}>
              <Lock size={11} style={{ display: 'inline', marginRight: '4px' }} />
              Admin: 5/15m · Customer: 10/15m · OTP: 5/10m
            </span>
          </div>
        </div>
      )}

      {/* Security Events Table */}
      <div className="adm-table-card animate-fade-in">
        <div className="adm-card-header">
          <div className="adm-card-header-info">
            <h1 className="adm-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={22} color="#2563eb" />
              <span>Security &amp; WAF Event Logs</span>
            </h1>
            <p className="adm-section-sub">
              Monitor blocked bots, brute-force login attempts, SQLi/XSS probes, and Cloudflare actions.
            </p>
          </div>
          <div className="adm-card-header-action">
            <button type="button" className="adm-btn-secondary" onClick={loadData} disabled={loading}>
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="adm-table-toolbar">
          <div className="adm-search-box adm-search-box-toolbar">
            <Search size={16} className="adm-search-icon" />
            <input
              type="text"
              placeholder="Search IP, country, URL, account..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="adm-search-input"
            />
            {search && (
              <button
                type="button"
                className="adm-search-clear"
                aria-label="Clear search"
                onClick={() => setSearch('')}
              >
                <XCircle size={14} />
              </button>
            )}
          </div>

          <div className="adm-table-filters" style={{ flexWrap: 'wrap', gap: '10px' }}>
            <DateRangeFilter
              from={dateFrom}
              to={dateTo}
              onChange={(from, to) => {
                setDateFrom(from);
                setDateTo(to);
              }}
            />

            <div className="adm-filter-select-wrap">
              <Select
                styles={compactSelectStyles}
                isSearchable={false}
                options={EVENT_TYPE_OPTIONS}
                value={EVENT_TYPE_OPTIONS.find((o) => o.value === eventType) || EVENT_TYPE_OPTIONS[0]}
                onChange={(opt) => setEventType(opt ? opt.value : 'all')}
                classNamePrefix="react-select"
              />
            </div>

            <div className="adm-filter-select-wrap">
              <Select
                styles={compactSelectStyles}
                isSearchable={false}
                options={RISK_OPTIONS}
                value={RISK_OPTIONS.find((o) => o.value === riskLevel) || RISK_OPTIONS[0]}
                onChange={(opt) => setRiskLevel(opt ? opt.value : 'all')}
                classNamePrefix="react-select"
              />
            </div>

            <div className="adm-filter-select-wrap">
              <Select
                styles={compactSelectStyles}
                isSearchable={false}
                options={ACTION_OPTIONS}
                value={ACTION_OPTIONS.find((o) => o.value === cloudflareAction) || ACTION_OPTIONS[0]}
                onChange={(opt) => setCloudflareAction(opt ? opt.value : 'all')}
                classNamePrefix="react-select"
              />
            </div>
          </div>
        </div>

        <AdminDataTable
          columns={columns}
          data={events}
          keyField="_id"
          progressPending={loading}
          minWidth={1350}
          noDataMessage="No security events recorded yet"
          noDataHint="Suspicious logins, rate-limit hits, and blocked probes will appear here."
          ariaLabel="Security events"
          scrollHeight="560px"
        />
      </div>
    </div>
  );
}
