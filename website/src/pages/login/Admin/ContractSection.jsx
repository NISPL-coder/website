import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Download,
  X,
  CheckCircle2,
  FileText,
  Search,
  Filter,
  ExternalLink,
  Clock,
  AlertCircle,
  RotateCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { useTableSort, SortableTh } from './tableSortUtils';
import { compactSelectStyles } from './reactSelectStyles';
import ExportDropdown from './ExportDropdown';
import { formatContractsForExport } from './exportUtils';
import { contractApi } from '../../../services/contractApi';

export default function ContractSection({ contracts, setContracts }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [syncingIds, setSyncingIds] = useState({});

  const handleRetrySync = async (e, contract) => {
    e.stopPropagation();
    const cId = contract.id || contract.contractId;
    setSyncingIds((prev) => ({ ...prev, [cId]: true }));
    toast.loading(`Synchronizing "${contract.name || cId}" to Sangam CRM Contracts...`, {
      id: `sync-${cId}`
    });

    try {
      const res = await contractApi.retrySangamSync(cId);
      if (res.success && res.sangamCrm) {
        setContracts((prev) =>
          prev.map((item) =>
            (item.id === cId || item.contractId === cId)
              ? { ...item, sangamCrm: res.sangamCrm }
              : item
          )
        );
        toast.success(`Synchronized to Sangam CRM! Record ID: ${res.sangamCrm.recordId}`, {
          id: `sync-${cId}`
        });
      } else {
        toast.error(`Sync notice: ${res.message || 'Retry failed'}`, { id: `sync-${cId}` });
      }
    } catch (err) {
      toast.error(`Sync error: ${err.message}`, { id: `sync-${cId}` });
    } finally {
      setSyncingIds((prev) => ({ ...prev, [cId]: false }));
    }
  };

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        (c.id && c.id.toLowerCase().includes(q)) ||
        (c.contractId && c.contractId.toLowerCase().includes(q)) ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.customer && c.customer.toLowerCase().includes(q)) ||
        (c.contractType && c.contractType.toLowerCase().includes(q)) ||
        (c.service && c.service.toLowerCase().includes(q)) ||
        (c.sangamCrm?.recordId && c.sangamCrm.recordId.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' || (c.status && c.status.toLowerCase() === statusFilter.toLowerCase());

      return matchesSearch && matchesStatus;
    });
  }, [contracts, searchQuery, statusFilter]);

  // Multi-column Ascending/Descending Sorting Hook
  const { sortedItems: sortedContracts, sortConfig, requestSort } = useTableSort(
    filteredContracts,
    'id',
    'asc'
  );

  return (
    <div className="adm-table-card">
      {/* 1. Header with Title on Left and Primary Action Button on Right */}
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <h1 className="adm-section-title">
            Customer Contract Management
          </h1>
          <p className="adm-section-sub">
            Monitor customer master service agreements (MSA), SLA performance tiers, contract terms, and renewal cycles.
          </p>
        </div>

        <div className="adm-card-header-action">
          <ExportDropdown
            data={filteredContracts}
            formatter={formatContractsForExport}
            fileName="NISPL_Contracts"
            itemLabel="contracts"
          />
          <button
            type="button"
            className="adm-btn-primary"
            onClick={() => navigate('/admin/customer/contract/create')}
          >
            <Plus size={16} />
            <span>Create Contract</span>
          </button>
        </div>
      </div>

      {/* 2. Filter / Search Toolbar */}
      <div className="adm-table-toolbar">
        <div className="adm-table-filters">
          <div className="adm-search-box" style={{ width: '280px' }}>
            <Search size={15} className="adm-search-icon" />
            <input
              type="text"
              placeholder="Search by code, company, client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="adm-search-input"
              style={{ width: '100%', height: '36px' }}
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <Select
              styles={compactSelectStyles}
              isSearchable={false}
              options={[
                { value: 'all', label: `All Statuses (${contracts.length})` },
                { value: 'active', label: 'Active' },
                { value: 'notstarted', label: 'NotStarted' },
                { value: 'inactive', label: 'Inactive' }
              ]}
              value={{
                value: statusFilter,
                label:
                  statusFilter === 'all'
                    ? `All Statuses (${contracts.length})`
                    : statusFilter === 'active'
                    ? 'Active'
                    : statusFilter === 'notstarted'
                    ? 'NotStarted'
                    : 'Inactive'
              }}
              onChange={(opt) => setStatusFilter(opt ? opt.value : 'all')}
              classNamePrefix="react-select"
            />
          </div>
        </div>

        <div className="adm-table-record-count">
          Showing <strong>{filteredContracts.length}</strong> of <strong>{contracts.length}</strong> contracts
        </div>
      </div>

      {/* 3. Table with Vertical & Horizontal Scrolling */}
      <div className="adm-table-responsive">
        <table className="adm-table" style={{ minWidth: '1100px' }}>
          <thead>
            <tr>
              <SortableTh
                label="Contract Code"
                sortKey="id"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Client Organization"
                sortKey="company"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Authorized Representative"
                sortKey="customer"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Service Scope & Tier"
                sortKey="service"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Contract Value"
                sortKey="value"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Start Date"
                sortKey="startDate"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Expiry Date"
                sortKey="expiryDate"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Status"
                sortKey="status"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <th>Sangam CRM</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedContracts.length > 0 ? (
              sortedContracts.map((c) => {
                const crm = c.sangamCrm || { status: 'pending', recordId: null };
                const crmStatus = crm.status?.toLowerCase() || 'pending';
                const crmId = crm.recordId;
                const isSyncing = syncingIds[c.id || c.contractId];

                return (
                  <tr key={c.id || c.contractId}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6366f1' }}>
                      {c.id || c.contractId}
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.company || c.name}</td>
                    <td>
                      <div>{c.customer || c.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.email || 'contracts@nispl.in'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{c.service || `${c.contractType || 'Subscription'} (${c.subscriptionPeriod || '1 Year'})`}</div>
                      <span style={{ fontSize: '0.7rem', color: '#6366f1' }}>{c.slaTier || c.contractType || 'Subscription SLA'}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{c.totalContractValue || c.value}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.startDate}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.endDate || c.expiryDate}</td>
                    <td>
                      <span
                        className={`adm-status-pill ${
                          (c.status || '').toLowerCase() === 'active'
                            ? 'active'
                            : (c.status || '').toLowerCase() === 'notstarted'
                            ? 'demo'
                            : 'inactive'
                        }`}
                      >
                        <span>
                          {(c.status || '').toLowerCase() === 'notstarted'
                            ? 'NotStarted'
                            : (c.status || '').toLowerCase() === 'inactive'
                            ? 'Inactive'
                            : 'Active'}
                        </span>
                      </span>
                    </td>

                    {/* Sangam CRM Status Column */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '135px' }}>
                        <div>
                          {crmStatus === 'synced' && (
                            <span
                              className="adm-status-pill active"
                              style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}
                              title={`Synced with Sangam CRM Contracts (Record ID: ${crmId})`}
                            >
                              <CheckCircle2 size={11} />
                              <span>Synced</span>
                            </span>
                          )}
                          {crmStatus === 'pending' && (
                            <span
                              className="adm-status-pill demo"
                              style={{ background: '#fffbeb', color: '#d97706', borderColor: '#fde68a' }}
                              title="Waiting for Sangam CRM contract synchronization"
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

                        {/* Sangam Record ID & Link */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ fontSize: '0.70rem', fontFamily: 'monospace', color: '#475569', fontWeight: 600 }}>
                            {crmId ? (crmId.length > 18 ? `${crmId.substring(0, 15)}...` : crmId) : 'No Record ID'}
                          </span>
                          {crmId && (
                            <a
                              href={contractApi.getSangamContractUrl(crmId)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#6366f1', display: 'inline-flex', alignItems: 'center' }}
                              title="View Contract in Sangam CRM"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>

                        {/* Last Sync Timestamp */}
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

                        {/* Retry Sync Button if Failed or Pending */}
                        {(crmStatus === 'failed' || crmStatus === 'pending') && (
                          <button
                            type="button"
                            className="adm-action-pill"
                            onClick={(e) => handleRetrySync(e, c)}
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
                    </td>

                    <td>
                      <button
                        type="button"
                        className="adm-action-pill"
                        onClick={() =>
                          toast.success(`Contract ${c.id || c.contractId} document dispatched to ${c.email || 'contracts@nispl.in'}`)
                        }
                      >
                        <Download size={13} />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b' }}>
                  No contract agreements match your search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Table Footer */}
      <div className="adm-table-footer">
        <span>Corporate MSAs backed by 99.99% Cloud Node Uptime Guarantee</span>
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          Active SLA Commitments: {contracts.filter(c => c.status === 'active').length}
        </span>
      </div>

    </div>
  );
}

