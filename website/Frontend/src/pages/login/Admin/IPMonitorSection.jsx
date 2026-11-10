import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Network,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  Plus,
  Trash2,
  Copy,
  Server,
  Layers,
  Radio,
  ExternalLink
} from 'lucide-react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { compactSelectStyles } from './reactSelectStyles';
import AdminDataTable from './AdminDataTable';
import DateRangeFilter from './DateRangeFilter';
import { compareDate, compareText, isWithinDateRange } from './adminTableUtils';
import { ipApi } from '../../../services/ipApi';

export default function IPMonitorSection({ externalSearch }) {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(externalSearch || '');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serverFilter, setServerFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const data = await ipApi.getIps();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to fetch IP records:', err?.message);
      toast.error('Could not load IP records from server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    if (externalSearch !== undefined && externalSearch !== null) {
      setSearchQuery(externalSearch);
    }
  }, [externalSearch]);

  const handleDelete = async (id, wanIp) => {
    if (!window.confirm(`Are you sure you want to delete IP record for ${wanIp || 'this entry'}?`)) {
      return;
    }
    try {
      await ipApi.deleteIp(id);
      toast.success('IP record deleted successfully');
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete IP record');
    }
  };

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const counts = useMemo(() => {
    const active = records.filter((r) => String(r.status).toLowerCase() === 'active').length;
    const inactive = records.filter((r) => String(r.status).toLowerCase() === 'inactive').length;
    const dedicated = records.filter((r) => String(r.serverType).toLowerCase() === 'dedicated').length;
    const shared = records.filter((r) => String(r.serverType).toLowerCase() === 'shared').length;
    return { total: records.length, active, inactive, dedicated, shared };
  }, [records]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return records
      .filter((r) => {
        const matchesSearch =
          !q ||
          (r.wanIp || '').toLowerCase().includes(q) ||
          (r.lanIp || '').toLowerCase().includes(q) ||
          (r.rdpPort || '').toLowerCase().includes(q) ||
          (r.httpPort || '').toLowerCase().includes(q) ||
          (r.vmId || '').toLowerCase().includes(q) ||
          (r.status || '').toLowerCase().includes(q) ||
          (r.serverType || '').toLowerCase().includes(q) ||
          (r.notes || '').toLowerCase().includes(q);

        const matchesStatus =
          statusFilter === 'all' ||
          String(r.status).toLowerCase() === statusFilter.toLowerCase();

        const matchesServer =
          serverFilter === 'all' ||
          String(r.serverType).toLowerCase() === serverFilter.toLowerCase();

        const matchesDateRange = isWithinDateRange(r.createdAt, dateFrom, dateTo);

        return matchesSearch && matchesStatus && matchesServer && matchesDateRange;
      })
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [records, searchQuery, statusFilter, serverFilter, dateFrom, dateTo]);

  const statusOptions = [
    { value: 'all', label: `All Statuses (${counts.total})` },
    { value: 'active', label: `Active (${counts.active})` },
    { value: 'inactive', label: `Inactive (${counts.inactive})` }
  ];

  const serverOptions = [
    { value: 'all', label: `All Servers (${counts.total})` },
    { value: 'dedicated', label: `Dedicated (${counts.dedicated})` },
    { value: 'shared', label: `Shared (${counts.shared})` }
  ];

  const columns = [
    {
      id: 'sNo',
      name: 'S/No.',
      width: '70px',
      cell: (_row, index) => (
        <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          {index + 1}
        </span>
      )
    },
    {
      id: 'wanIp',
      name: 'WAN IP',
      sortable: true,
      minWidth: '150px',
      sortFunction: compareText((row) => row.wanIp),
      cell: (row) => (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontFamily: "'SFMono-Regular', Consolas, Menlo, monospace",
              fontWeight: 700,
              fontSize: '0.88rem',
              color: '#0f172a'
            }}
          >
            {row.wanIp}
          </span>
          <button
            type="button"
            onClick={() => handleCopy(row.wanIp, `wan-${row.id}`)}
            title="Copy WAN IP"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: copiedId === `wan-${row.id}` ? '#10b981' : '#94a3b8',
              padding: '2px',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            <Copy size={13} />
          </button>
        </div>
      )
    },
    {
      id: 'lanIp',
      name: 'LAN IP',
      sortable: true,
      minWidth: '150px',
      sortFunction: compareText((row) => row.lanIp),
      cell: (row) => (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontFamily: "'SFMono-Regular', Consolas, Menlo, monospace",
              fontWeight: 600,
              fontSize: '0.86rem',
              color: '#334155'
            }}
          >
            {row.lanIp}
          </span>
          <button
            type="button"
            onClick={() => handleCopy(row.lanIp, `lan-${row.id}`)}
            title="Copy LAN IP"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: copiedId === `lan-${row.id}` ? '#10b981' : '#94a3b8',
              padding: '2px',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            <Copy size={13} />
          </button>
        </div>
      )
    },
    {
      id: 'rdpPort',
      name: 'RDP PORT',
      sortable: true,
      minWidth: '110px',
      cell: (row) => (
        <span
          style={{
            fontFamily: "'SFMono-Regular', Consolas, Menlo, monospace",
            fontSize: '0.84rem',
            fontWeight: 600,
            color: '#4f46e5',
            background: '#eef2ff',
            padding: '2px 8px',
            borderRadius: '6px',
            border: '1px solid #e0e7ff'
          }}
        >
          {row.rdpPort || '3389'}
        </span>
      )
    },
    {
      id: 'httpPort',
      name: 'HTTP PORT',
      sortable: true,
      minWidth: '110px',
      cell: (row) => (
        <span
          style={{
            fontFamily: "'SFMono-Regular', Consolas, Menlo, monospace",
            fontSize: '0.84rem',
            fontWeight: 600,
            color: '#0891b2',
            background: '#ecfeff',
            padding: '2px 8px',
            borderRadius: '6px',
            border: '1px solid #cffafe'
          }}
        >
          {row.httpPort || '80'}
        </span>
      )
    },
    {
      id: 'vmId',
      name: 'VM ID',
      sortable: true,
      minWidth: '130px',
      sortFunction: compareText((row) => row.vmId),
      cell: (row) => (
        <span
          style={{
            fontWeight: 700,
            fontSize: '0.84rem',
            color: '#1e293b',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '3px 8px',
            borderRadius: '6px'
          }}
        >
          {row.vmId}
        </span>
      )
    },
    {
      id: 'status',
      name: 'STATUS',
      searchType: 'select',
      searchOptions: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' }
      ],
      sortable: true,
      minWidth: '120px',
      cell: (row) => {
        const isActive = String(row.status).toLowerCase() === 'active';
        return (
          <span
            className={`adm-status-pill ${isActive ? 'active' : 'suspended'}`}
            style={{ fontSize: '0.74rem', padding: '3px 12px', fontWeight: 700 }}
          >
            {isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        );
      }
    },
    {
      id: 'serverType',
      name: 'SERVER',
      searchType: 'select',
      searchOptions: [
        { value: 'Dedicated', label: 'Dedicated' },
        { value: 'Shared', label: 'Shared' }
      ],
      sortable: true,
      minWidth: '130px',
      cell: (row) => {
        const isDedicated = String(row.serverType).toLowerCase() === 'dedicated';
        return (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '999px',
              background: isDedicated ? '#f5f3ff' : '#f0fdf4',
              color: isDedicated ? '#6d28d9' : '#15803d',
              border: `1px solid ${isDedicated ? '#ddd6fe' : '#bbf7d0'}`
            }}
          >
            {isDedicated ? 'DEDICATED' : 'SHARED'}
          </span>
        );
      }
    },
    {
      id: 'actions',
      name: 'Action',
      minWidth: '90px',
      searchable: false,
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="adm-action-btn delete"
            onClick={() => handleDelete(row.id, row.wanIp)}
            title="Delete IP entry"
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>
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
          </div>
          <p className="adm-section-sub">
            Monitor and manage active and inactive network IPs, WAN/LAN bindings, RDP/HTTP ports, and VM IDs.
          </p>
        </div>

        <div className="adm-card-header-action" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="adm-btn-primary"
            onClick={() => navigate('/admin/ip-monitor/create')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              fontSize: '0.88rem',
              fontWeight: 600
            }}
          >
            <Plus size={16} />
            <span>Create IP</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="adm-customer-summary-grid" style={{ margin: '0 24px 16px' }}>
        <div
          className={`adm-cust-stat-card ${statusFilter === 'all' && serverFilter === 'all' ? 'selected' : ''}`}
          onClick={() => {
            setStatusFilter('all');
            setServerFilter('all');
          }}
          role="button"
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Total Network IPs</span>
            <Network size={18} className="adm-cust-stat-icon purple" />
          </div>
          <span className="adm-cust-stat-val">{counts.total}</span>
          <span className="adm-cust-stat-desc">All registered WAN/LAN pool</span>
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
          <span className="adm-cust-stat-desc">Operational active servers</span>
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
          <span className="adm-cust-stat-desc">Inactive / standby allocations</span>
        </div>

        <div
          className={`adm-cust-stat-card ${serverFilter === 'dedicated' ? 'selected' : ''}`}
          onClick={() => setServerFilter('dedicated')}
          role="button"
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Dedicated Servers</span>
            <Server size={18} className="adm-cust-stat-icon amber" />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#6d28d9' }}>{counts.dedicated}</span>
          <span className="adm-cust-stat-desc">Dedicated VM instances</span>
        </div>
      </div>

      {/* Toolbar: search left, filters right */}
      <div className="adm-table-toolbar">
        <div className="adm-search-box adm-search-box-toolbar">
          <Search className="adm-search-icon" size={16} />
          <input
            type="text"
            placeholder="Search by WAN, LAN, ports, VM ID..."
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

          <div className="adm-filter-select-wrap">
            <Select
              styles={compactSelectStyles}
              isSearchable={false}
              options={serverOptions}
              value={serverOptions.find((option) => option.value === serverFilter) || serverOptions[0]}
              onChange={(opt) => setServerFilter(opt ? opt.value : 'all')}
              classNamePrefix="react-select"
            />
          </div>
        </div>
      </div>

      {/* React Data Table */}
      <AdminDataTable
        columns={columns}
        data={filteredRecords}
        keyField="id"
        defaultSortFieldId="wanIp"
        defaultSortAsc={true}
        resetPageToken={`${searchQuery}|${statusFilter}|${serverFilter}|${dateFrom}|${dateTo}`}
        minWidth={980}
        noDataMessage={isLoading ? 'Loading network IP records...' : 'No IP records registered'}
        noDataHint={
          isLoading
            ? 'Fetching latest WAN/LAN configurations from server...'
            : "Click '+ Create IP' to register a new network IP configuration."
        }
        ariaLabel="Active and inactive IP addresses"
      />
    </div>
  );
}
