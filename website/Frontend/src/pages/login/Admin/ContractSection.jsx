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
import RowActionMenu from './RowActionMenu';
import ViewContractModal from './ViewContractModal';
import EditContractModal from './EditContractModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { generateContractPdf } from './utils/generateContractPdf';

export default function ContractSection({ contracts, setContracts }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [syncingIds, setSyncingIds] = useState({});

  // Modals state
  const [viewingContract, setViewingContract] = useState(null);
  const [editingContract, setEditingContract] = useState(null);
  const [deletingContract, setDeletingContract] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleContractUpdated = (updated) => {
    const cId = updated.id || updated.contractId;
    setContracts((prev) =>
      prev.map((item) => (item.id === cId || item.contractId === cId ? updated : item))
    );
  };

  const handleConfirmDelete = async () => {
    if (!deletingContract) return;
    setIsDeleting(true);
    const cId = deletingContract.id || deletingContract.contractId;
    try {
      await contractApi.deleteContract(cId);
      setContracts((prev) => prev.filter((item) => item.id !== cId && item.contractId !== cId));
      toast.success(`Contract "${deletingContract.name}" deleted successfully.`);
      setDeletingContract(null);
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const q = searchQuery.toLowerCase();
      const code = (c.id || c.contractId || '').toLowerCase();
      const name = (c.name || '').toLowerCase();
      const client = (c.customer || c.company || '').toLowerCase();
      const service = (c.service || '').toLowerCase();
      const sangamId = (c.sangamCrm?.recordId || '').toLowerCase();
      const sangamStatus = (c.sangamCrm?.status || '').toLowerCase();

      const matchesSearch =
        !q ||
        code.includes(q) ||
        name.includes(q) ||
        client.includes(q) ||
        service.includes(q) ||
        sangamId.includes(q) ||
        sangamStatus.includes(q);

      const contractStatus = (c.status || '').toLowerCase();
      let matchesStatus = true;
      if (statusFilter === 'active') {
        matchesStatus = contractStatus === 'active';
      } else if (statusFilter === 'notstarted') {
        matchesStatus = contractStatus === 'notstarted' || contractStatus === 'draft';
      } else if (statusFilter === 'inactive') {
        matchesStatus = contractStatus === 'inactive' || contractStatus === 'expired';
      }

      return matchesSearch && matchesStatus;
    });
  }, [contracts, searchQuery, statusFilter]);

  // Sort Hook
  const { sortedItems: sortedContracts, sortConfig, requestSort } = useTableSort(
    filteredContracts,
    'id',
    'desc'
  );

  return (
    <div className="adm-table-card animate-fade-in">
      {/* 1. Header with Title and Create Contract button */}
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <h1 className="adm-section-title">Customer Contract Management</h1>
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

      {/* 2. Controls & Search Toolbar */}
      <div className="adm-toolbar">
        <div className="adm-toolbar-left">
          <div className="adm-search-input-wrap">
            <Search className="adm-search-icon" size={16} />
            <input
              type="text"
              placeholder="Search by code, company, client..."
              className="adm-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="adm-search-clear"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="adm-filter-select-wrap">
            <Select
              styles={compactSelectStyles}
              isSearchable={false}
              options={[
                { value: 'all', label: `All Statuses (${contracts.length})` },
                { value: 'active', label: 'Active Only' },
                { value: 'notstarted', label: 'Not Started / Draft' },
                { value: 'inactive', label: 'Inactive / Closed' }
              ]}
              value={{
                value: statusFilter,
                label:
                  statusFilter === 'all'
                    ? `All Statuses (${contracts.length})`
                    : statusFilter === 'active'
                    ? 'Active Only'
                    : statusFilter === 'notstarted'
                    ? 'Not Started / Draft'
                    : 'Inactive / Closed'
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

      {/* 3. Contracts Table */}
      <div className="adm-table-responsive">
        <table className="adm-table" style={{ minWidth: '1360px' }}>
          <thead>
            <tr>
              <SortableTh
                label="Contract Code"
                sortKey="id"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Contract Title"
                sortKey="name"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Client / Representative"
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
              <th>SANGAM CRM</th>
              <th style={{ textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {sortedContracts.length > 0 ? (
              sortedContracts.map((c) => {
                const cId = c.id || c.contractId;
                const isSyncing = !!syncingIds[cId];
                const crm = c.sangamCrm || {};
                const crmStatus = crm.status || 'pending';
                const crmId = crm.recordId;

                return (
                  <tr key={cId} className="adm-table-row">
                    <td>
                      <span className="adm-code-badge blue">
                        {cId}
                      </span>
                    </td>

                    <td>
                      <div className="adm-primary-text">
                        {c.name || 'Cloud Services Agreement'}
                      </div>
                      <div className="adm-secondary-text">
                        Type: {c.contractType || 'Subscription'} ({c.subscriptionPeriod || '1 Year'})
                      </div>
                    </td>

                    <td>
                      <div className="adm-primary-text">{c.company || c.customer}</div>
                      <div className="adm-secondary-text">{c.customer}</div>
                    </td>

                    <td>
                      <div className="adm-primary-text">{c.service || `${c.contractType} (${c.subscriptionPeriod})`}</div>
                      <div className="adm-secondary-text" style={{ color: '#6366f1', fontWeight: 600 }}>
                        {c.slaTier || 'Tier-1 Priority NOC 99.99%'}
                      </div>
                    </td>

                    <td>
                      <span className="adm-mrr-text" style={{ fontSize: '0.92rem' }}>
                        {c.totalContractValue || c.value}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.80rem', color: '#475569' }}>
                        {c.startDate}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.80rem', color: '#475569' }}>
                        {c.endDate || c.expiryDate}
                      </span>
                    </td>

                    <td>
                      {c.status?.toLowerCase() === 'active' && (
                        <span className="adm-status-pill active">Active</span>
                      )}
                      {(c.status?.toLowerCase() === 'notstarted' || c.status?.toLowerCase() === 'draft') && (
                        <span className="adm-status-pill demo">Not Started</span>
                      )}
                      {(c.status?.toLowerCase() === 'inactive' || c.status?.toLowerCase() === 'expired') && (
                        <span className="adm-status-pill inactive">Inactive</span>
                      )}
                    </td>

                    {/* Sangam CRM Status */}
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

                    {/* Three Dots Action Column */}
                    <td style={{ textAlign: 'center' }}>
                      <RowActionMenu
                        onView={() => setViewingContract(c)}
                        onEdit={() => setEditingContract(c)}
                        onPrint={() => {
                          generateContractPdf(c);
                          toast.success(`PDF generated for ${c.name}`);
                        }}
                        onDelete={() => setDeletingContract(c)}
                      />
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

      {/* View Modal */}
      <ViewContractModal
        contract={viewingContract}
        isOpen={!!viewingContract}
        onClose={() => setViewingContract(null)}
      />

      {/* Edit Modal */}
      <EditContractModal
        contract={editingContract}
        isOpen={!!editingContract}
        onClose={() => setEditingContract(null)}
        onUpdated={handleContractUpdated}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingContract}
        title="Delete Contract"
        itemName={deletingContract?.name || 'this contract'}
        itemType="contract"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingContract(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
