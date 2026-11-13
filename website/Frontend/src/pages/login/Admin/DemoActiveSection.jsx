import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  X,
  Copy,
  Check,
  Eye,
  Printer,
  RotateCw,
  ToggleRight,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { CountUp } from '../../Dashboard/utils/useCountUp';
import { compactSelectStyles } from './reactSelectStyles';
import ExportDropdown from './ExportDropdown';
import AdminDataTable from './AdminDataTable';
import DateRangeFilter from './DateRangeFilter';
import ViewCustomerModal from './ViewCustomerModal';
import { generateCustomerPdf } from './utils/generateCustomerPdf';
import { compareDate, compareNumber, compareText, formatStamp, isWithinDateRange } from './adminTableUtils';
import { usePermissions } from './PermissionsContext';
import {
  normalizeCustomerLifecycle,
  customerLifecycleLabel,
  customerLifecycleTone
} from '../../../utils/customerLifecycle';
import { customerApi } from '../../../services/customerApi';

function formatDemoActiveForExport(records) {
  return records.map((c) => ({
    'Customer ID': c.customerId || c.id || '—',
    'Customer Name': c.name || '—',
    'Company Name': c.company || '—',
    'Designation': c.designation || '—',
    'Email': c.email || c.loginEmail || '—',
    'Phone No.': c.phone || '—',
    'Plan / Service': c.plan || c.service || '—',
    'Lifecycle Status': customerLifecycleLabel(c.status),
    'Orders / Contracts': c.orderCount || c.orders || 0,
    'City': c.address?.city || c.city || '—',
    'State': c.address?.state || c.state || '—',
    'Registered Date': formatStamp(c.createdAt || c.registered)
  }));
}

export default function DemoActiveSection({
  customers = [],
  setCustomers,
  contracts = [],
  receipts = [],
  externalSearch = ''
}) {
  const { visibleColumns } = usePermissions();
  const [searchQuery, setSearchQuery] = useState(externalSearch || '');

  useEffect(() => {
    if (externalSearch !== undefined && externalSearch !== null) {
      setSearchQuery(externalSearch);
    }
  }, [externalSearch]);

  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'demo' | 'demoinactive'
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key, label = 'Text') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getCustomerPlan = (cust) => {
    if (cust.plan) return cust.plan;
    const match = (contracts || []).find(
      (ctr) =>
        (ctr.customerId && (ctr.customerId === cust.id || ctr.customerId === cust.customerId)) ||
        (ctr.email && ctr.email.toLowerCase() === (cust.email || '').toLowerCase()) ||
        (ctr.company && ctr.company.toLowerCase() === (cust.company || '').toLowerCase())
    );
    return match?.name || match?.service || match?.contractType || 'Cloud Plan';
  };

  // Base dataset: accounts categorized as Demo or Active (or DemoInactive)
  const demoActivePool = useMemo(() => {
    return (customers || []).filter((c) => {
      const stage = normalizeCustomerLifecycle(c.status);
      return stage === 'Active' || stage === 'Demo' || stage === 'DemoInactive';
    });
  }, [customers]);

  // Aggregate metrics
  const counts = useMemo(() => {
    let active = 0;
    let demo = 0;
    let demoInactive = 0;

    (customers || []).forEach((c) => {
      const stage = normalizeCustomerLifecycle(c.status);
      if (stage === 'Active') active += 1;
      else if (stage === 'Demo') demo += 1;
      else if (stage === 'DemoInactive') demoInactive += 1;
    });

    const total = active + demo + demoInactive;

    return {
      total,
      active,
      demo,
      demoInactive
    };
  }, [customers]);

  // Status Filter Options for Dropdown
  const statusOptions = useMemo(
    () => [
      { value: 'all', label: `All Demo & Active (${counts.total})` },
      { value: 'active', label: `Active Clients (${counts.active})` },
      { value: 'demo', label: `Demo / Trials (${counts.demo})` },
      { value: 'demoinactive', label: `Expired Trials (${counts.demoInactive})` }
    ],
    [counts]
  );

  // Filtered customer listing
  const filteredCustomers = useMemo(() => {
    return demoActivePool
      .filter((c) => {
        const q = searchQuery.trim().toLowerCase();

        const searchable = [
          c.id,
          c.customerId,
          c.name,
          c.company,
          c.email,
          c.loginEmail,
          c.phone,
          c.designation,
          getCustomerPlan(c),
          c.status
        ]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase());

        const matchesSearch = !q || searchable.some((v) => v.includes(q));

        const stage = normalizeCustomerLifecycle(c.status);
        let matchesStatus = true;
        if (statusFilter === 'active') {
          matchesStatus = stage === 'Active';
        } else if (statusFilter === 'demo') {
          matchesStatus = stage === 'Demo';
        } else if (statusFilter === 'demoinactive') {
          matchesStatus = stage === 'DemoInactive';
        }

        const matchesDateRange = isWithinDateRange(c.createdAt || c.registered, dateFrom, dateTo);

        return matchesSearch && matchesStatus && matchesDateRange;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.registered || 0).getTime();
        const dateB = new Date(b.createdAt || b.registered || 0).getTime();
        if (dateB !== dateA) return dateB - dateA;
        return String(b.id || '').localeCompare(String(a.id || ''));
      });
  }, [demoActivePool, searchQuery, statusFilter, dateFrom, dateTo, contracts]);

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

    const toastId = toast.loading(`Authorizing ${days} extra trial days...`);
    try {
      const cId = cust.id || cust.customerId;
      const res = await customerApi.extendDemoTrial(cId, days);
      if (res?.customer && setCustomers) {
        setCustomers((prev) =>
          prev.map((c) => ((c.id === cId || c.customerId === cId) ? res.customer : c))
        );
      }
      toast.success(`Authorized ${days} additional trial days!`, { id: toastId });
    } catch (err) {
      toast.error(err.message || 'Failed to authorize demo extension.', { id: toastId });
    }
  };

  const columns = [
    {
      id: 'id',
      name: 'Customer ID',
      selector: (row) => row.customerId || row.id,
      sortable: true,
      sortFunction: compareText((row) => row.customerId || row.id),
      minWidth: '140px',
      cell: (cust) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 700,
            color: '#6366f1',
            fontSize: '0.86rem'
          }}
        >
          {cust.customerId || cust.id || '—'}
        </span>
      )
    },
    {
      id: 'name',
      name: 'Customer Name',
      selector: (row) => row.name,
      sortable: true,
      sortFunction: compareText((row) => row.name),
      minWidth: '180px',
      grow: 1.1,
      cell: (cust) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{cust.name || '—'}</div>
          {cust.designation && (
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{cust.designation}</div>
          )}
        </div>
      )
    },
    {
      id: 'company',
      name: 'Company Name',
      selector: (row) => row.company,
      sortable: true,
      sortFunction: compareText((row) => row.company),
      minWidth: '170px',
      grow: 1,
      cell: (cust) => (
        <span style={{ fontWeight: 600, color: '#1e293b' }}>{cust.company || '—'}</span>
      )
    },
    {
      id: 'email',
      name: 'Email Address',
      selector: (row) => row.email || row.loginEmail,
      sortable: true,
      sortFunction: compareText((row) => row.email || row.loginEmail),
      minWidth: '220px',
      cell: (cust) => {
        const mail = cust.email || cust.loginEmail || '—';
        const isCopied = copiedKey === `email-${cust.id}`;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', color: '#334155' }}>{mail}</span>
            {mail !== '—' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(mail, `email-${cust.id}`, 'Email');
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
                title={isCopied ? 'Copied' : 'Copy Email'}
              >
                {isCopied ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
              </button>
            )}
          </div>
        );
      }
    },
    {
      id: 'phone',
      name: 'Phone No.',
      selector: (row) => row.phone,
      sortable: true,
      sortFunction: compareText((row) => row.phone),
      minWidth: '150px',
      cell: (cust) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#334155' }}>
          {cust.phone || '—'}
        </span>
      )
    },
    {
      id: 'plan',
      name: 'Subscribed Plan',
      selector: (row) => getCustomerPlan(row),
      sortable: true,
      sortFunction: compareText((row) => getCustomerPlan(row)),
      minWidth: '170px',
      cell: (cust) => (
        <span style={{ fontSize: '0.82rem', color: '#1e293b', fontWeight: 500 }}>
          {getCustomerPlan(cust)}
        </span>
      )
    },
    {
      id: 'status',
      name: 'Lifecycle Status',
      selector: (row) => row.status,
      sortable: true,
      sortFunction: compareText((row) => row.status),
      minWidth: '160px',
      cell: (cust) => {
        const tone = customerLifecycleTone(cust.status);
        const label = customerLifecycleLabel(cust.status);
        const isDemo = normalizeCustomerLifecycle(cust.status) === 'Demo';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className={`adm-status-pill ${tone}`}>
              {tone === 'active' && <CheckCircle2 size={12} />}
              {tone === 'demo' && <Clock size={12} />}
              {tone === 'demoinactive' && <XCircle size={12} />}
              <span>{label}</span>
            </span>
            {isDemo && (
              <button
                type="button"
                className="adm-action-pill"
                style={{ padding: '2px 7px', fontSize: '0.72rem', color: '#b45309' }}
                title="Authorize trial extension"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAuthorizeDemoExtension(cust);
                }}
              >
                +Extend
              </button>
            )}
          </div>
        );
      }
    },
    {
      id: 'orders',
      name: 'Orders',
      selector: (row) => row.orderCount || row.orders || 0,
      sortable: true,
      sortFunction: compareNumber((row) => row.orderCount || row.orders || 0),
      width: '100px',
      center: true,
      cell: (cust) => (
        <span className="adm-count-badge">
          {cust.orderCount || cust.orders || 0}
        </span>
      )
    },
    {
      id: 'createdAt',
      name: 'Onboarded Date',
      selector: (row) => row.createdAt || row.registered,
      sortable: true,
      sortFunction: compareDate((row) => row.createdAt || row.registered),
      width: '140px',
      cell: (cust) => (
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {formatStamp(cust.createdAt || cust.registered)}
        </span>
      )
    },
    {
      id: 'actions',
      name: 'Action',
      center: true,
      width: '120px',
      button: true,
      allowOverflow: true,
      searchable: false,
      ignoreRowClick: true,
      cell: (cust) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="adm-action-pill"
            onClick={() => setSelectedCustomer(cust)}
            title="View customer profile"
          >
            <Eye size={12} />
            <span>View</span>
          </button>
          <button
            type="button"
            className="adm-action-pill"
            onClick={() => generateCustomerPdf(cust)}
            title="Print PDF statement"
          >
            <Printer size={12} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="adm-table-card animate-fade-in">
      {/* 1. Header with Title on Left and Export Action on Right */}
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="adm-section-title">Demo / Active Directory</h1>
            <span
              className="adm-status-pill info"
              style={{ fontSize: '0.74rem', padding: '2px 8px' }}
            >
              {counts.total} Total
            </span>
          </div>
          <p className="adm-section-sub">
            Monitor and track active customer subscriptions alongside active demo trial engagements.
          </p>
        </div>

        <div className="adm-card-header-action">
          <ExportDropdown
            data={filteredCustomers}
            formatter={formatDemoActiveForExport}
            fileName="NISPL_Demo_Active_Accounts"
            itemLabel="accounts"
          />
        </div>
      </div>

      {/* 2. Interactive Clickable Summary Cards (Filters on click) */}
      <div className="adm-customer-summary-grid">
        {/* Total Card */}
        <div
          className={`adm-cust-stat-card ${statusFilter === 'all' ? 'selected' : ''}`}
          onClick={() => setStatusFilter('all')}
          title="Click to show all Demo and Active accounts"
          role="button"
          tabIndex={0}
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Total Accounts</span>
            <Users size={18} className="adm-cust-stat-icon purple" />
          </div>
          <span className="adm-cust-stat-val">
            <CountUp end={counts.total} duration={1000} />
          </span>
          <span className="adm-cust-stat-desc">All demo &amp; active clients</span>
        </div>

        {/* Active Accounts Card */}
        <div
          className={`adm-cust-stat-card ${statusFilter === 'active' ? 'selected' : ''}`}
          onClick={() => setStatusFilter((prev) => (prev === 'active' ? 'all' : 'active'))}
          title="Click to filter Active clients only"
          role="button"
          tabIndex={0}
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Active Clients</span>
            <CheckCircle2 size={18} className="adm-cust-stat-icon emerald" />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#059669' }}>
            <CountUp end={counts.active} duration={1000} />
          </span>
          <span className="adm-cust-stat-desc">Paid &amp; running subscriptions</span>
        </div>

        {/* Demo / Trials Card */}
        <div
          className={`adm-cust-stat-card ${statusFilter === 'demo' ? 'selected' : ''}`}
          onClick={() => setStatusFilter((prev) => (prev === 'demo' ? 'all' : 'demo'))}
          title="Click to filter Demo trials only"
          role="button"
          tabIndex={0}
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Demo / Trials</span>
            <Clock size={18} className="adm-cust-stat-icon amber" />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#d97706' }}>
            <CountUp end={counts.demo} duration={1000} />
          </span>
          <span className="adm-cust-stat-desc">Active demonstration trials</span>
        </div>

        {/* Expired Trials Card */}
        <div
          className={`adm-cust-stat-card ${statusFilter === 'demoinactive' ? 'selected' : ''}`}
          onClick={() => setStatusFilter((prev) => (prev === 'demoinactive' ? 'all' : 'demoinactive'))}
          title="Click to filter expired Demo trials"
          role="button"
          tabIndex={0}
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Expired Trials</span>
            <XCircle size={18} className="adm-cust-stat-icon slate" />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#64748b' }}>
            <CountUp end={counts.demoInactive} duration={1000} />
          </span>
          <span className="adm-cust-stat-desc">Completed demo periods</span>
        </div>
      </div>

      {/* 3. Filter Toolbar */}
      <div className="adm-table-toolbar">
        {/* Search Input */}
        <div className="adm-search-box adm-search-box-toolbar">
          <Search size={16} className="adm-search-icon" />
          <input
            type="text"
            placeholder="Search demo & active accounts by name, company, email, plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="adm-search-input"
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
              value={statusOptions.find((o) => o.value === statusFilter) || statusOptions[0]}
              onChange={(opt) => setStatusFilter(opt ? opt.value : 'all')}
              classNamePrefix="react-select"
            />
          </div>
        </div>
      </div>

      {/* 4. DataTable */}
      <AdminDataTable
        columns={columns}
        data={filteredCustomers}
        keyField="id"
        defaultSortFieldId="createdAt"
        defaultSortAsc={false}
        resetPageToken={`${searchQuery}|${statusFilter}|${dateFrom}|${dateTo}`}
        minWidth={1400}
        noDataMessage="No demo or active accounts found"
        noDataHint={
          statusFilter !== 'all'
            ? 'Try switching to "All Demo & Active" to see more accounts.'
            : 'Try a different search term or date range.'
        }
        ariaLabel="Demo and Active customer accounts"
        scrollHeight="600px"
      />

      {/* View Customer Details Modal */}
      {selectedCustomer && (
        <ViewCustomerModal
          customer={selectedCustomer}
          isOpen={Boolean(selectedCustomer)}
          onClose={() => setSelectedCustomer(null)}
          onPrint={(cust) => generateCustomerPdf(cust)}
          contracts={contracts}
          receipts={receipts}
        />
      )}
    </div>
  );
}

