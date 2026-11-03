import React, { useMemo, useState } from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, ExternalLink, RotateCw, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { CountUp } from '../../Dashboard/utils/useCountUp';
import { customerApi } from '../../../services/customerApi';
import AdminDataTable from './AdminDataTable';
import { compareText, compareDate } from './adminTableUtils';
import { usePermissions } from './PermissionsContext';
import './AdminTools.css';

function getCrmStatus(customer) {
  return (customer.sangamCrm?.status || 'synced').toLowerCase();
}

function SyncStatusPill({ status, syncError }) {
  if (status === 'synced') {
    return (
      <span className="adm-status-pill active" title="Synced with Sangam CRM">
        <CheckCircle2 size={12} />
        <span>Synced</span>
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="adm-status-pill demo" title="Waiting for Sangam CRM synchronization">
        <Clock size={12} />
        <span>Pending</span>
      </span>
    );
  }
  return (
    <span className="adm-status-pill inactive" title={`Sync error: ${syncError || 'API failed'}`}>
      <AlertCircle size={12} />
      <span>Failed</span>
    </span>
  );
}

export default function SangamSyncPage({ customers, setCustomers }) {
  const { can, visibleColumns } = usePermissions();
  const canSync = can('customer', 'edit');
  const [syncingIds, setSyncingIds] = useState({});
  const [isSyncAllRunning, setIsSyncAllRunning] = useState(false);

  const counts = useMemo(() => {
    const tally = { total: customers.length, synced: 0, pending: 0, failed: 0 };
    customers.forEach((c) => {
      const status = getCrmStatus(c);
      if (status === 'synced') tally.synced += 1;
      else if (status === 'pending') tally.pending += 1;
      else tally.failed += 1;
    });
    return tally;
  }, [customers]);

  const outOfSync = useMemo(
    () => customers.filter((c) => getCrmStatus(c) !== 'synced'),
    [customers]
  );

  const sortedCustomers = useMemo(() => {
    return [...customers].sort(
      (a, b) =>
        new Date(b.createdAt || b.registered || b.sangamCrm?.lastSyncedAt || 0) -
        new Date(a.createdAt || a.registered || a.sangamCrm?.lastSyncedAt || 0)
    );
  }, [customers]);

  const applySyncResult = (customerId, sangamCrm) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId || c.customerId === customerId ? { ...c, sangamCrm } : c
      )
    );
  };

  const handleRetry = async (customer) => {
    const custId = customer.id || customer.customerId;
    if (syncingIds[custId] || isSyncAllRunning) return;

    setSyncingIds((prev) => ({ ...prev, [custId]: true }));
    try {
      const res = await customerApi.retrySangamSync(custId);
      if (res.success) {
        applySyncResult(custId, res.sangamCrm);
        toast.success(`${customer.company} synchronized to Sangam CRM.`);
      } else {
        applySyncResult(custId, res.sangamCrm);
        toast.error(`Sync failed for ${customer.company}: ${res.sangamCrm?.syncError || 'Unknown error'}`);
      }
    } catch (err) {
      toast.error(`Sync failed for ${customer.company}: ${err.message}`);
    } finally {
      setSyncingIds((prev) => ({ ...prev, [custId]: false }));
    }
  };

  const handleSyncAll = async () => {
    if (!outOfSync.length || isSyncAllRunning) return;
    setIsSyncAllRunning(true);
    const toastId = toast.loading(`Synchronizing ${outOfSync.length} record(s) to Sangam CRM...`);

    let succeeded = 0;
    for (const customer of outOfSync) {
      const custId = customer.id || customer.customerId;
      setSyncingIds((prev) => ({ ...prev, [custId]: true }));
      try {
        const res = await customerApi.retrySangamSync(custId);
        if (res.success) {
          succeeded += 1;
          applySyncResult(custId, res.sangamCrm);
        } else {
          applySyncResult(custId, res.sangamCrm);
        }
      } catch {
        // Individual failures are reflected by the refreshed status; keep going.
      } finally {
        setSyncingIds((prev) => ({ ...prev, [custId]: false }));
      }
    }

    setIsSyncAllRunning(false);
    if (succeeded === outOfSync.length) {
      toast.success(`All ${succeeded} record(s) synchronized to Sangam CRM.`, { id: toastId });
    } else {
      toast.error(`Sync finished: ${succeeded} succeeded, ${outOfSync.length - succeeded} failed.`, { id: toastId });
    }
  };

  const columns = [
    {
      id: 'company',
      name: 'Organization & Client',
      selector: (row) => row.company,
      sortable: true,
      sortFunction: compareText((row) => row.company),
      minWidth: '220px',
      grow: 1.2,
      cell: (cust) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{cust.company}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{cust.email}</div>
        </div>
      )
    },
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
      id: 'syncStatus',
      name: 'Sync Status',
      selector: (row) => getCrmStatus(row),
      sortable: true,
      sortFunction: compareText((row) => getCrmStatus(row)),
      width: '150px',
      cell: (cust) => (
        <SyncStatusPill status={getCrmStatus(cust)} syncError={cust.sangamCrm?.syncError} />
      ),
      searchType: 'select',
      searchOptions: [
        { value: 'synced', label: 'Synced' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' }
      ]
    },
    {
      id: 'recordId',
      name: 'CRM Record ID',
      selector: (row) => row.sangamCrm?.recordId || '',
      sortable: true,
      sortFunction: compareText((row) => row.sangamCrm?.recordId || ''),
      minWidth: '220px',
      cell: (cust) => {
        const recordId = cust.sangamCrm?.recordId;
        if (!recordId) return <span style={{ color: '#94a3b8' }}>—</span>;
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>
            {recordId}
            <a
              href={customerApi.getSangamRecordUrl(recordId)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#6366f1', display: 'inline-flex' }}
              title="View Company in Sangam CRM"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={12} />
            </a>
          </span>
        );
      }
    },
    {
      id: 'lastSyncedAt',
      name: 'Last Synced',
      selector: (row) => row.sangamCrm?.lastSyncedAt || row.registered || '',
      sortable: true,
      sortFunction: compareDate((row) => row.sangamCrm?.lastSyncedAt || row.registered),
      width: '170px',
      cell: (cust) => {
        const raw = cust.sangamCrm?.lastSyncedAt || cust.registered;
        if (!raw) return <span style={{ color: '#94a3b8' }}>—</span>;
        return (
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            {new Date(raw).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        );
      }
    },
    {
      id: 'actions',
      name: 'Actions',
      center: true,
      width: '130px',
      button: true,
      allowOverflow: true,
      ignoreRowClick: true,
      cell: (cust) => {
        const custId = cust.id || cust.customerId;
        const isSyncing = !!syncingIds[custId];
        if (!canSync) {
          return (
            <span style={{ color: '#94a3b8', fontSize: '0.74rem', whiteSpace: 'nowrap' }}>
              Read-only
            </span>
          );
        }
        return (
          <button
            type="button"
            className="adm-action-pill"
            onClick={(e) => {
              e.stopPropagation();
              handleRetry(cust);
            }}
            disabled={isSyncing || isSyncAllRunning}
            style={{ color: '#6366f1', borderColor: '#c7d2fe', background: '#f5f3ff' }}
            title="Retry Sangam CRM synchronization"
          >
            <RotateCw size={12} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Retry Sync'}</span>
          </button>
        );
      }
    }
  ];

  return (
    <div className="adm-table-card animate-fade-in">
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <h1 className="adm-section-title">Sangam CRM Synchronization</h1>
          <p className="adm-section-sub">
            Monitor and retry synchronization of NISPL customer accounts to Sangam CRM Companies.
          </p>
        </div>
        <div className="adm-card-header-action">
          {canSync && (
            <button
              type="button"
              className="adm-btn-primary"
              onClick={handleSyncAll}
              disabled={!outOfSync.length || isSyncAllRunning}
              style={{ opacity: outOfSync.length ? 1 : 0.6 }}
            >
              <RefreshCw size={16} className={isSyncAllRunning ? 'animate-spin' : ''} />
              <span>
                {isSyncAllRunning
                  ? 'Syncing...'
                  : outOfSync.length
                  ? `Sync ${outOfSync.length} Pending Record(s)`
                  : 'All Records Synced'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Sync health stat cards */}
      <div className="adm-customer-summary-grid">
        <div className="adm-cust-stat-card selected">
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Total Accounts</span>
            <XCircle size={18} className="adm-cust-stat-icon slate" />
          </div>
          <span className="adm-cust-stat-val">
            <CountUp end={counts.total} duration={1000} />
          </span>
          <span className="adm-cust-stat-desc">Registered customer records</span>
        </div>

        <div className="adm-cust-stat-card">
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Synced</span>
            <CheckCircle2 size={18} className="adm-cust-stat-icon emerald" />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#059669' }}>
            <CountUp end={counts.synced} duration={1000} />
          </span>
          <span className="adm-cust-stat-desc">Live in Sangam CRM Companies</span>
        </div>

        <div className="adm-cust-stat-card">
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Pending</span>
            <Clock size={18} className="adm-cust-stat-icon amber" />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#d97706' }}>
            <CountUp end={counts.pending} duration={1000} />
          </span>
          <span className="adm-cust-stat-desc">Queued for synchronization</span>
        </div>

        <div className="adm-cust-stat-card">
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Failed</span>
            <AlertCircle size={18} className="adm-cust-stat-icon slate" />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#dc2626' }}>
            <CountUp end={counts.failed} duration={1000} />
          </span>
          <span className="adm-cust-stat-desc">Require manual retry</span>
        </div>
      </div>

      <AdminDataTable
        columns={visibleColumns('sangam_sync', columns)}
        data={sortedCustomers}
        keyField="id"
        defaultSortFieldId="lastSyncedAt"
        defaultSortAsc={false}
        minWidth={1100}
        noDataMessage="No customer records found"
        noDataHint="Import or create customers to monitor Sangam CRM sync."
        ariaLabel="Sangam CRM synchronization status"
        scrollHeight="600px"
      />
    </div>
  );
}
