import { notificationApi } from '../../../services/notificationApi';
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  X,
  ExternalLink,
  RotateCw,
  XCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { CountUp } from '../../Dashboard/utils/useCountUp';
import { compactSelectStyles } from './reactSelectStyles';
import ExportDropdown from './ExportDropdown';
import { formatCustomersForExport } from './exportUtils';
import { customerApi } from '../../../services/customerApi';
import RowActionMenu from './RowActionMenu';
import ViewCustomerModal from './ViewCustomerModal';
import EditCustomerModal from './EditCustomerModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { generateCustomerPdf } from './utils/generateCustomerPdf';
import AdminDataTable from './AdminDataTable';
import DateRangeFilter from './DateRangeFilter';
import { compareDate, compareNumber, compareText, isWithinDateRange } from './adminTableUtils';
import { usePermissions } from './PermissionsContext';

export default function CustomerSection({
  customers,
  setCustomers,
  customerStats,
  setCustomerStats
}) {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'demo' | 'inactive'
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [syncingIds, setSyncingIds] = useState({});

  // Dynamic card stats from API (with seamless fallback to computed data)
  const apiStats = customerStats || customers?.stats;

  const dynamicCards = useMemo(() => {
    const total = apiStats?.totalAccounts ?? customers.length;
    const active =
      apiStats?.activeClients ??
      customers.filter((c) => c.status?.toLowerCase() === 'active').length;
    const demo =
      apiStats?.demoTrials ??
      customers.filter((c) => {
        const s = c.status?.toLowerCase();
        return s === 'demo' || s === 'trial';
      }).length;
    const inactive =
      apiStats?.inactivePaused ??
      customers.filter((c) => {
        const s = c.status?.toLowerCase();
        return s === 'inactive' || s === 'suspended' || s === 'paused';
      }).length;

    const mrrNum =
      typeof apiStats?.monthlyMrr === 'number'
        ? apiStats.monthlyMrr
        : customers
            .filter((c) => c.status?.toLowerCase() === 'active')
            .reduce((acc, c) => acc + (parseInt(String(c.mrr || '').replace(/[^0-9]/g, ''), 10) || 0), 0);

    const formattedMrr = apiStats?.formattedMonthlyMrr || `₹${mrrNum.toLocaleString('en-IN')}`;

    return {
      total,
      active,
      demo,
      inactive,
      mrr: mrrNum,
      formattedMrr,
      totalDesc: apiStats?.descriptions?.totalAccounts || 'All customer records',
      activeDesc: apiStats?.descriptions?.activeClients || `Monthly MRR: ${formattedMrr}`,
      demoDesc: apiStats?.descriptions?.demoTrials || '14-Day sandbox trials',
      inactiveDesc: apiStats?.descriptions?.inactivePaused || 'Expired / pending renewals'
    };
  }, [apiStats, customers]);

  // Backward-compatible counts object for filters
  const counts = useMemo(() => ({
    all: dynamicCards.total,
    active: dynamicCards.active,
    demo: dynamicCards.demo,
    inactive: dynamicCards.inactive
  }), [dynamicCards]);

  // Filtered customer listing
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase();
      const sangamId = (c.sangamCrm?.recordId || '').toLowerCase();
      const sangamStatus = (c.sangamCrm?.status || '').toLowerCase();

      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        sangamId.includes(q) ||
        sangamStatus.includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.plan && c.plan.toLowerCase().includes(q));

      const custStatus = c.status?.toLowerCase();
      let matchesStatus = true;
      if (statusFilter === 'active') {
        matchesStatus = custStatus === 'active';
      } else if (statusFilter === 'demo') {
        matchesStatus = custStatus === 'demo';
      } else if (statusFilter === 'inactive') {
        matchesStatus = custStatus === 'inactive' || custStatus === 'suspended';
      }

      const matchesDateRange = isWithinDateRange(
        c.registered || c.createdAt || c.lastSyncedAt,
        dateFrom,
        dateTo
      );

      return matchesSearch && matchesStatus && matchesDateRange;
    }).sort((a, b) => {
      const dateA = new Date(a.createdAt || a.registered || 0).getTime();
      const dateB = new Date(b.createdAt || b.registered || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });
  }, [customers, searchQuery, statusFilter, dateFrom, dateTo]);

  const handleCustomerUpdated = (updated) => {
    const cId = updated.id || updated.customerId;
    setCustomers((prev) =>
      prev.map((c) => ((c.id === cId || c.customerId === cId) ? updated : c))
    );
    if (selectedCustomer && (selectedCustomer.id === cId || selectedCustomer.customerId === cId)) {
      setSelectedCustomer(updated);
    }
    // Re-fetch dynamic stats from customer listing API
    customerApi.getCustomerListing().then((res) => {
      if (res?.stats && setCustomerStats) {
        setCustomerStats(res.stats);
      }
    });
  };

  const handleConfirmDeleteCustomer = async () => {
    if (!deletingCustomer) return;
    setIsDeleting(true);
    const cId = deletingCustomer.id || deletingCustomer.customerId;
    try {
      await customerApi.deleteCustomer(cId);
      setCustomers((prev) => prev.filter((c) => c.id !== cId && c.customerId !== cId));
      // Re-fetch dynamic stats from customer listing API
      customerApi.getCustomerListing().then((res) => {
        if (res?.stats && setCustomerStats) {
          setCustomerStats(res.stats);
        }
      });
      toast.success(`Customer "${deletingCustomer.company || deletingCustomer.name}" deleted successfully.`);
      notificationApi.createNotification({
        type: 'customer_deleted',
        title: 'Customer Account Deleted',
        message: `Customer "${deletingCustomer.company || deletingCustomer.name}" (${cId}) was removed from directory.`,
        severity: 'warning',
        entityType: 'customer',
        entityId: cId,
        user: {
          name: deletingCustomer.name,
          company: deletingCustomer.company,
          email: deletingCustomer.email
        }
      });
      setDeletingCustomer(null);
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Retry Sangam CRM Synchronization
  const handleRetrySync = async (e, customer) => {
    if (e) e.stopPropagation();
    const custId = customer.id || customer.customerId;
    setSyncingIds((prev) => ({ ...prev, [custId]: true }));
    const toastId = toast.loading(`Retrying Sangam CRM sync for ${customer.company}...`);

    try {
      const res = await customerApi.retrySangamSync(custId);
      if (res.success) {
        setCustomers((prev) =>
          prev.map((c) =>
            (c.id === custId || c.customerId === custId)
              ? { ...c, sangamCrm: res.sangamCrm }
              : c
          )
        );
        if (selectedCustomer && (selectedCustomer.id === custId || selectedCustomer.customerId === custId)) {
          setSelectedCustomer((prev) => ({ ...prev, sangamCrm: res.sangamCrm }));
        }
        toast.success(
          `Synchronized to Sangam CRM Companies! (Record ID: ${res.sangamCrm.recordId})`,
          { id: toastId, duration: 4000 }
        );
      } else {
        toast.error(`Sync failed: ${res.sangamCrm?.syncError || 'Unknown error'}`, { id: toastId });
      }
    } catch (err) {
      toast.error(`Sync failed: ${err.message}`, { id: toastId });
    } finally {
      setSyncingIds((prev) => ({ ...prev, [custId]: false }));
    }
  };

  const columns = [
    {
      id: 'id',
      name: 'Customer ID',
      selector: (row) => row.id,
      sortable: true,
      sortFunction: compareText((row) => row.id),
      width: '140px',
      cell: (cust) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6366f1' }}>{cust.id}</span>
      )
    },
    {
      id: 'company',
      name: 'Organization & Client',
      selector: (row) => row.company,
      sortable: true,
      sortFunction: compareText((row) => row.company),
      minWidth: '200px',
      grow: 1.1,
      cell: (cust) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{cust.company}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{cust.name}</div>
        </div>
      )
    },
    {
      id: 'email',
      name: 'Contact Details',
      selector: (row) => row.email,
      sortable: true,
      sortFunction: compareText((row) => row.email),
      minWidth: '220px',
      grow: 1,
      cell: (cust) => (
        <div>
          <div style={{ fontSize: '0.8rem', color: '#334155' }}>{cust.email}</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{cust.phone}</div>
        </div>
      )
    },
    {
      id: 'plan',
      name: 'Subscribed Plan',
      selector: (row) => row.plan,
      sortable: true,
      sortFunction: compareText((row) => row.plan),
      minWidth: '160px',
      cell: (cust) => <span className="adm-status-pill info">{cust.plan}</span>
    },
    {
      id: 'serverNode',
      name: 'Server Node',
      selector: (row) => row.serverNode,
      sortable: true,
      sortFunction: compareText((row) => row.serverNode),
      minWidth: '180px',
      cell: (cust) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', display: 'inline-block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{cust.serverNode}</span>
      )
    },
    {
      id: 'mrr',
      name: 'Monthly (MRR)',
      selector: (row) => row.mrr,
      sortable: true,
      sortFunction: compareNumber((row) => row.mrr),
      width: '135px',
      cell: (cust) => (
        <span style={{ fontWeight: 700, color: '#0f172a' }}>{cust.mrr}</span>
      )
    },
    {
      id: 'status',
      name: 'Status',
      selector: (row) => row.status,
      sortable: true,
      sortFunction: compareText((row) => row.status),
      width: '145px',
      cell: (cust) => {
        const s = cust.status?.toLowerCase();
        return (
          <>
            {s === 'active' && (
              <span className="adm-status-pill active">
                <CheckCircle2 size={12} />
                <span>Active</span>
              </span>
            )}
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
          </>
        );
      },
      searchType: 'select',
      searchOptions: [
        { value: 'active', label: 'Active' },
        { value: 'demo', label: 'Demo' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'suspended', label: 'Suspended' },
      ]
    },
    {
      id: 'registered',
      name: 'Registered',
      selector: (row) => row.registered,
      sortable: true,
      sortFunction: compareDate((row) => row.registered),
      width: '130px',
      cell: (cust) => (
        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{cust.registered}</span>
      )
    },
    {
      id: 'sangam',
      name: 'Sangam CRM Status',
      selector: (row) => row.sangamCrm?.status || 'synced',
      sortable: true,
      sortFunction: compareText((row) => row.sangamCrm?.status || 'synced'),
      minWidth: '240px',
      grow: 0.9,
      cell: (cust) => {
        const crm = cust.sangamCrm || {
          status: 'synced',
          recordId: `SGM-ACC-${cust.id.replace('CUST-', '')}`,
          lastSyncedAt: cust.registered
        };
        const crmStatus = crm.status?.toLowerCase() || 'synced';
        const crmId = crm.recordId;
        const isSyncing = syncingIds[cust.id || cust.customerId];

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '160px', whiteSpace: 'nowrap' }}>
            <div>
              {crmStatus === 'synced' && (
                <span
                  className="adm-status-pill active"
                  style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}
                  title={`Synced with Sangam CRM (Record ID: ${crmId})`}
                >
                  <CheckCircle2 size={11} />
                  <span>Synced</span>
                </span>
              )}
              {crmStatus === 'pending' && (
                <span
                  className="adm-status-pill demo"
                  style={{ background: '#fffbeb', color: '#d97706', borderColor: '#fde68a' }}
                  title="Waiting for Sangam CRM synchronization"
                >
                  <Clock size={11} />
                  <span>Pending</span>
                </span>
              )}
              {crmStatus === 'failed' && (
                <span
                  className="adm-status-pill inactive"
                  style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}
                  title={`Sync error: ${crm.syncError || 'API Failed'}`}
                >
                  <AlertCircle size={11} />
                  <span>Failed</span>
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '0.70rem', fontFamily: 'monospace', color: '#475569', fontWeight: 600 }}>
                {crmId || 'No Record ID'}
              </span>
              {crmId && (
                <a
                  href={customerApi.getSangamRecordUrl(crmId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#6366f1', display: 'inline-flex', alignItems: 'center' }}
                  title="View Company in Sangam CRM"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={11} />
                </a>
              )}
            </div>

            {crm.lastSyncedAt && (
              <span style={{ fontSize: '0.67rem', color: '#94a3b8' }}>
                {new Date(crm.lastSyncedAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}

            {(crmStatus === 'failed' || crmStatus === 'pending') && can('customer', 'edit') && (
              <button
                type="button"
                className="adm-action-pill"
                onClick={(e) => handleRetrySync(e, cust)}
                disabled={isSyncing}
                style={{
                  marginTop: '2px',
                  padding: '2px 8px',
                  fontSize: '0.68rem',
                  color: '#6366f1',
                  borderColor: '#c7d2fe',
                  background: '#f5f3ff',
                  alignSelf: 'flex-start'
                }}
              >
                <RotateCw size={10} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? 'Syncing...' : 'Retry Sync'}</span>
              </button>
            )}
          </div>
        );
      }
    },
    {
      id: 'actions',
      name: 'Actions',
      center: true,
      width: '120px',
      button: true,
      allowOverflow: true,
      ignoreRowClick: true,
      cell: (cust) => (
        <RowActionMenu
          module="customer"
          onView={() => setSelectedCustomer(cust)}
          onEdit={() => setEditingCustomer(cust)}
          onPrint={() => {
            generateCustomerPdf(cust);
            toast.success(`PDF generated for ${cust.company || cust.name}`);
          }}
          onDelete={() => setDeletingCustomer(cust)}
        />
      )
    }
  ];

  return (
    <div className="adm-table-card animate-fade-in">
      {/* 1. Card Header with Title on Left and Primary Action Button on Right */}
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <h1 className="adm-section-title">
            Customer Directory &amp; Accounts
          </h1>
          <p className="adm-section-sub">
            Manage all NISPL customer records, active clients, live demo trials, and inactive accounts.
          </p>
        </div>

        <div className="adm-card-header-action">
          <ExportDropdown
            data={filteredCustomers}
            formatter={formatCustomersForExport}
            fileName="NISPL_Customers"
            itemLabel="customers"
          />
          {can('customer', 'create') && (
            <button
              type="button"
              className="adm-btn-primary"
              onClick={() => navigate('/admin/customer/create')}
            >
              <Plus size={16} />
              <span>Create Customer</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Customer Quick Stat Cards (Total, Active, Demo, Inactive with CountUp) */}
      <div className="adm-customer-summary-grid">
        <div
          className={`adm-cust-stat-card ${statusFilter === 'all' ? 'selected' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Total Accounts</span>
            <Users size={18} className="adm-cust-stat-icon purple" />
          </div>
          <span className="adm-cust-stat-val">
            <CountUp end={dynamicCards.total} duration={1200} />
          </span>
          <span className="adm-cust-stat-desc">{dynamicCards.totalDesc}</span>
        </div>

        <div
          className={`adm-cust-stat-card ${statusFilter === 'active' ? 'selected' : ''}`}
          onClick={() => setStatusFilter('active')}
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Active Clients</span>
            <CheckCircle2 size={18} className="adm-cust-stat-icon emerald" />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#059669' }}>
            <CountUp end={dynamicCards.active} duration={1200} />
          </span>
          <span className="adm-cust-stat-desc">
            Monthly MRR: ₹
            <CountUp
              end={dynamicCards.mrr}
              useIndianFormat={true}
              duration={1400}
            />
          </span>
        </div>

        <div
          className={`adm-cust-stat-card ${statusFilter === 'demo' ? 'selected' : ''}`}
          onClick={() => setStatusFilter('demo')}
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Demo / Trials</span>
            <Clock size={18} className="adm-cust-stat-icon amber" />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#d97706' }}>
            <CountUp end={dynamicCards.demo} duration={1200} />
          </span>
          <span className="adm-cust-stat-desc">{dynamicCards.demoDesc}</span>
        </div>

        <div
          className={`adm-cust-stat-card ${statusFilter === 'inactive' ? 'selected' : ''}`}
          onClick={() => setStatusFilter('inactive')}
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Inactive / Paused</span>
            <XCircle size={18} className="adm-cust-stat-icon slate" />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#64748b' }}>
            <CountUp end={dynamicCards.inactive} duration={1200} />
          </span>
          <span className="adm-cust-stat-desc">{dynamicCards.inactiveDesc}</span>
        </div>
      </div>

      {/* 3. Filter Section of Demo, Active, and Inactive + Search */}
      <div className="adm-table-toolbar">
        {/* Search Box */}
        <div className="adm-search-box adm-search-box-toolbar">
          <Search size={16} className="adm-search-icon" />
          <input
            type="text"
            placeholder="Search by name, company, email..."
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

          {/* React Select Filter */}
          <div className="adm-filter-select-wrap">
            <Select
              styles={compactSelectStyles}
              isSearchable={false}
              options={[
                { value: 'all', label: `All Statuses (${counts.all})` },
                { value: 'active', label: `Active Only (${counts.active})` },
                { value: 'demo', label: `Demo / Trials (${counts.demo})` },
                { value: 'inactive', label: `Inactive (${counts.inactive})` }
              ]}
              value={{
                value: statusFilter,
                label:
                  statusFilter === 'all'
                    ? `All Statuses (${counts.all})`
                    : statusFilter === 'active'
                    ? `Active Only (${counts.active})`
                    : statusFilter === 'demo'
                    ? `Demo / Trials (${counts.demo})`
                    : `Inactive (${counts.inactive})`
              }}
              onChange={(opt) => setStatusFilter(opt ? opt.value : 'all')}
              classNamePrefix="react-select"
            />
          </div>
        </div>
      </div>

      {/* 4. React DataTable */}
      <AdminDataTable
        columns={columns}
        data={filteredCustomers}
        keyField="id"
        defaultSortFieldId="registered"
        defaultSortAsc={false}
        resetPageToken={`${searchQuery}|${statusFilter}|${dateFrom}|${dateTo}`}
        minWidth={1750}
        noDataMessage="No customer records found"
        noDataHint="Try a different search term or account status."
        ariaLabel="Customer accounts"
        scrollHeight="600px"
      />

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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingCustomer}
        title="Delete Customer"
        itemName={deletingCustomer?.company || deletingCustomer?.name || 'this customer'}
        itemType="customer"
        onConfirm={handleConfirmDeleteCustomer}
        onCancel={() => setDeletingCustomer(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
