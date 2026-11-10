import React, { useState, useEffect, useMemo } from 'react';
import {
  Network,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  WifiOff
} from 'lucide-react';
import Select from 'react-select';
import { compactSelectStyles } from './reactSelectStyles';
import AdminDataTable from './AdminDataTable';
import DateRangeFilter from './DateRangeFilter';
import { compareDate, compareText, isWithinDateRange } from './adminTableUtils';

/**
 * Active / Inactive IP monitor.
 *
 * Reads the network operations feed for every Ness/hosting node NISPL serves.
 * The records currently come from the demo dataset below; once the Network Data
 * Collector lands on the backend this component reads from that API instead, so
 * the field names double as the API contract.
 */
const DEMO_IP_RECORDS = [
  { id: 'IP-001', ip: '103.208.72.14', serverNode: 'CtrlS-KOL-NODE-01', company: 'Tim Dog Pvt. Ltd.', region: 'Kolkata, IN', ipType: 'Dedicated', status: 'Active', lastSeen: '2026-11-10T09:42:00', uptimePercent: 99.98, notes: 'Primary egress for Tally Prime Cloud' },
  { id: 'IP-002', ip: '103.208.72.15', serverNode: 'CtrlS-KOL-NODE-01', company: 'Demo Customer', region: 'Kolkata, IN', ipType: 'Dedicated', status: 'Active', lastSeen: '2026-11-10T09:40:00', uptimePercent: 99.91, notes: 'Trial sandbox node' },
  { id: 'IP-003', ip: '103.208.72.22', serverNode: 'CtrlS-KOL-NODE-02', company: 'Sangam Traders', region: 'Kolkata, IN', ipType: 'Shared', status: 'Inactive', lastSeen: '2026-11-09T18:12:00', uptimePercent: 87.40, notes: 'Offline since yesterday evening' },
  { id: 'IP-004', ip: '49.205.78.63', serverNode: 'AWS-MUM-NODE-04', company: 'Bengal Tools Ltd.', region: 'Mumbai, IN', ipType: 'Dedicated', status: 'Active', lastSeen: '2026-11-10T09:44:00', uptimePercent: 99.99, notes: 'Cloud VPS customer production IP' },
  { id: 'IP-005', ip: '49.205.78.64', serverNode: 'AWS-MUM-NODE-04', company: 'Meridian Health LLP', region: 'Mumbai, IN', ipType: 'Shared', status: 'Active', lastSeen: '2026-11-10T09:43:00', uptimePercent: 99.82, notes: 'Tally audit build' },
  { id: 'IP-006', ip: '139.5.116.90', serverNode: 'CtrlS-HYD-NODE-07', company: 'Decca Metal Works', region: 'Hyderabad, IN', ipType: 'Dedicated', status: 'Inactive', lastSeen: '2026-11-10T06:05:00', uptimePercent: 94.15, notes: 'Awaiting customer firewall whitelist approval' },
  { id: 'IP-007', ip: '139.5.116.91', serverNode: 'CtrlS-HYD-NODE-07', company: 'Orchid Diagnostics', region: 'Hyderabad, IN', ipType: 'Shared', status: 'Active', lastSeen: '2026-11-10T09:38:00', uptimePercent: 99.87, notes: 'RDP Gateway pool' },
  { id: 'IP-008', ip: '182.71.190.120', serverNode: 'AWS-MUM-NODE-09', company: 'Nova Apparel Pvt. Ltd.', region: 'Mumbai, IN', ipType: 'Dedicated', status: 'Active', lastSeen: '2026-11-10T09:41:00', uptimePercent: 99.95, notes: 'Nightly TDS sync on 23:00 IST' },
  { id: 'IP-009', ip: '182.71.190.121', serverNode: 'AWS-MUM-NODE-09', company: 'Eastern Logistics', region: 'Mumbai, IN', ipType: 'Shared', status: 'Inactive', lastSeen: '2026-11-08T22:47:00', uptimePercent: 71.60, notes: 'Maintenance window pending fix approval' },
  { id: 'IP-010', ip: '115.114.42.7', serverNode: 'CtrlS-KOL-NODE-01', company: 'Sourav Industries', region: 'Kolkata, IN', ipType: 'Static', status: 'Active', lastSeen: '2026-11-10T09:44:00', uptimePercent: 99.99, notes: 'Add-on storage replica' },
  { id: 'IP-011', ip: '115.114.42.8', serverNode: 'CtrlS-KOL-NODE-02', company: 'Demo Customer', region: 'Kolkata, IN', ipType: 'Static', status: 'Active', lastSeen: '2026-11-10T09:42:00', uptimePercent: 99.93, notes: 'Trial extension granted — renewed sandbox' },
  { id: 'IP-012', ip: '115.114.42.9', serverNode: 'CtrlS-HYD-NODE-07', company: 'Siliguri Transport Co.', region: 'Hyderabad, IN', ipType: 'Dedicated', status: 'Inactive', lastSeen: '2026-11-04T14:20:00', uptimePercent: 45.30, notes: 'Account suspended — non-payment' }
];

const prettyDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export default function IPMonitorSection({ externalSearch }) {
  const [searchQuery, setSearchQuery] = useState(externalSearch || '');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    if (externalSearch !== undefined && externalSearch !== null) {
      setSearchQuery(externalSearch);
    }
  }, [externalSearch]);

  const records = DEMO_IP_RECORDS;

  const counts = useMemo(() => {
    const active = records.filter((r) => r.status === 'Active').length;
    const inactive = records.filter((r) => r.status === 'Inactive').length;
    // Anything that has not pinged back for over 24h counts as attention-worthy.
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const attention = records.filter(
      (r) => r.status === 'Inactive' && new Date(r.lastSeen).getTime() < cutoff
    ).length;
    const avgUptime = records.length
      ? records.reduce((sum, r) => sum + Number(r.uptimePercent || 0), 0) / records.length
      : 0;
    return { total: records.length, active, inactive, attention, avgUptime };
  }, [records]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return records
      .filter((r) => {
        const matchesSearch =
          !q ||
          r.ip.toLowerCase().includes(q) ||
          r.serverNode.toLowerCase().includes(q) ||
          (r.company || '').toLowerCase().includes(q) ||
          (r.region || '').toLowerCase().includes(q) ||
          (r.ipType || '').toLowerCase().includes(q);

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && r.status === 'Active') ||
          (statusFilter === 'inactive' && r.status === 'Inactive');

        const matchesDateRange = isWithinDateRange(r.lastSeen, dateFrom, dateTo);

        return matchesSearch && matchesStatus && matchesDateRange;
      })
      .sort((a, b) => new Date(b.lastSeen || 0).getTime() - new Date(a.lastSeen || 0).getTime());
  }, [records, searchQuery, statusFilter, dateFrom, dateTo]);

  const statusOptions = [
    { value: 'all', label: `All Statuses (${counts.total})` },
    { value: 'active', label: `Active (${counts.active})` },
    { value: 'inactive', label: `Inactive (${counts.inactive})` }
  ];

  const columns = [
    {
      id: 'ip',
      name: 'IP Address',
      sortable: true,
      minWidth: '170px',
      sortFunction: compareText((row) => row.ip),
      cell: (row) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '0.87rem',
            color: '#0f172a'
          }}
        >
          {row.ip}
        </span>
      )
    },
    {
      id: 'serverNode',
      name: 'Server Node',
      sortable: true,
      minWidth: '180px',
      cell: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: '#4f46e5' }}>
            {row.serverNode}
          </span>
          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{row.region}</span>
        </div>
      )
    },
    {
      id: 'company',
      name: 'Assigned Customer',
      sortable: true,
      minWidth: '200px',
      sortFunction: compareText((row) => row.company),
      cell: (row) => (
        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
          {row.company || '— Unassigned —'}
        </span>
      )
    },
    {
      id: 'ipType',
      name: 'Allocation Type',
      searchType: 'select',
      searchOptions: [
        { value: 'dedicated', label: 'Dedicated' },
        { value: 'shared', label: 'Shared' },
        { value: 'static', label: 'Static' }
      ],
      sortable: true,
      minWidth: '140px',
      cell: (row) => (
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '2px 10px',
            borderRadius: '999px',
            background: '#f1f5f9',
            color: '#475569',
            border: '1px solid #e2e8f0'
          }}
        >
          {row.ipType}
        </span>
      )
    },
    {
      id: 'status',
      name: 'Status',
      searchType: 'select',
      searchOptions: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ],
      sortable: true,
      minWidth: '130px',
      cell: (row) => (
        <span
          className={`adm-status-pill ${row.status === 'Active' ? 'active' : 'suspended'}`}
          style={{ fontSize: '0.72rem', padding: '3px 10px', fontWeight: 700 }}
        >
          {row.status}
        </span>
      )
    },
    {
      id: 'lastSeen',
      name: 'Last Pinged',
      sortable: true,
      minWidth: '160px',
      sortFunction: compareDate((row) => row.lastSeen),
      cell: (row) => (
        <span style={{ fontSize: '0.8rem', color: '#475569', whiteSpace: 'nowrap' }}>
          {prettyDateTime(row.lastSeen)}
        </span>
      )
    },
    {
      id: 'uptime',
      name: '30-day Uptime',
      sortable: true,
      minWidth: '130px',
      cell: (row) => {
        const uptime = Number(row.uptimePercent || 0);
        const tone = uptime >= 99 ? '#059669' : uptime >= 95 ? '#d97706' : '#dc2626';
        return (
          <span
            style={{
              fontWeight: 800,
              fontSize: '0.84rem',
              color: tone,
              textAlign: 'right',
              display: 'inline-block',
              width: '100%'
            }}
          >
            {uptime.toFixed(2)}%
          </span>
        );
      }
    },
    {
      id: 'notes',
      name: 'Network Notes',
      searchable: false,
      minWidth: '240px',
      cell: (row) => (
        <span style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
          {row.notes || '—'}
        </span>
      )
    }
  ];

  return (
    <div className="adm-table-card animate-fade-in">
      {/* Header */}
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="adm-section-title">Active / Inactive IP</h1>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.4px',
                padding: '3px 9px',
                borderRadius: '999px',
                background: '#ede9fe',
                color: '#6366f1',
                border: '1px solid #ddd6fe'
              }}
            >
              DEMO DATA
            </span>
          </div>
          <p className="adm-section-sub">
            Live liveness of every public IP NISPL serves across its hosting nodes.
          </p>
        </div>

        <div className="adm-card-header-action">
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#475569',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '999px',
              padding: '7px 14px'
            }}
          >
            <Network size={15} className="adm-cust-stat-icon purple" />
            <span>Avg 30-day uptime: {counts.avgUptime.toFixed(2)}%</span>
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="adm-customer-summary-grid" style={{ margin: '0 24px 16px' }}>
        <div
          className={`adm-cust-stat-card ${statusFilter === 'all' ? 'selected' : ''}`}
          onClick={() => setStatusFilter('all')}
          role="button"
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Total Monitored IPs</span>
            <Network size={18} className="adm-cust-stat-icon purple" />
          </div>
          <span className="adm-cust-stat-val">{counts.total}</span>
          <span className="adm-cust-stat-desc">Across {new Set(records.map((r) => r.serverNode)).size} server nodes</span>
        </div>

        <div
          className={`adm-cust-stat-card ${statusFilter === 'active' ? 'selected' : ''}`}
          onClick={() => setStatusFilter('active')}
          role="button"
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Active IPs</span>
            <CheckCircle2 size={18} className="adm-cust-stat-icon emerald" />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#059669' }}>{counts.active}</span>
          <span className="adm-cust-stat-desc">Pinged back within the last scan cycle</span>
        </div>

        <div
          className={`adm-cust-stat-card ${statusFilter === 'inactive' ? 'selected' : ''}`}
          onClick={() => setStatusFilter('inactive')}
          role="button"
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Inactive IPs</span>
            <WifiOff size={18} className="adm-cust-stat-icon red" />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#dc2626' }}>{counts.inactive}</span>
          <span className="adm-cust-stat-desc">No response on the latest sweep</span>
        </div>

        <div className="adm-cust-stat-card" role="button">
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Needs Attention</span>
            <AlertTriangle size={18} className="adm-cust-stat-icon amber" />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#d97706' }}>{counts.attention}</span>
          <span className="adm-cust-stat-desc">Inactive for over 24 hours</span>
        </div>
      </div>

      {/* Toolbar: search left, filters right */}
      <div className="adm-table-toolbar">
        <div className="adm-search-box adm-search-box-toolbar">
          <Search className="adm-search-icon" size={16} />
          <input
            type="text"
            placeholder="Search by IP, node, customer, region..."
            className="adm-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="adm-search-clear"
              aria-label="Clear search"
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="adm-table-filters">
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
              options={statusOptions}
              value={statusOptions.find((option) => option.value === statusFilter) || statusOptions[0]}
              onChange={(opt) => setStatusFilter(opt ? opt.value : 'all')}
              classNamePrefix="react-select"
            />
          </div>
        </div>
      </div>

      {/* React Data Table with per-column filter row */}
      <AdminDataTable
        columns={columns}
        data={filteredRecords}
        keyField="id"
        defaultSortFieldId="lastSeen"
        defaultSortAsc={false}
        resetPageToken={`${searchQuery}|${statusFilter}|${dateFrom}|${dateTo}`}
        minWidth={1100}
        noDataMessage="No IP records matched"
        noDataHint="Adjust the search term, status filter or date range."
        ariaLabel="Active and inactive IP addresses"
      />
    </div>
  );
}
