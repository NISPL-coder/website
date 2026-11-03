import { notificationApi } from '../../../services/notificationApi';
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  X,
  CheckCircle2,
  Search,
  ExternalLink,
  Clock,
  AlertCircle,
  RotateCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { compactSelectStyles } from './reactSelectStyles';
import ExportDropdown from './ExportDropdown';
import { formatContractsForExport } from './exportUtils';
import { contractApi } from '../../../services/contractApi';
import RowActionMenu from './RowActionMenu';
import ViewContractModal from './ViewContractModal';
import EditContractModal from './EditContractModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { generateContractPdf } from './utils/generateContractPdf';
import AdminDataTable from './AdminDataTable';
import DateRangeFilter from './DateRangeFilter';
import { compareNumber, compareText, isWithinDateRange } from './adminTableUtils';
import { usePermissions } from './PermissionsContext';

const getContractId = (row) => row.id || row.contractId;

export default function ContractSection({ contracts, setContracts }) {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [syncingIds, setSyncingIds] = useState({});

  // Modals state
  const [viewingContract, setViewingContract] = useState(null);
  const [editingContract, setEditingContract] = useState(null);
  const [deletingContract, setDeletingContract] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRetrySync = async (e, contract) => {
    e.stopPropagation();
    const cId = getContractId(contract);
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
    const cId = getContractId(updated);
    setContracts((prev) =>
      prev.map((item) => (item.id === cId || item.contractId === cId ? updated : item))
    );
  };

  const handleConfirmDelete = async () => {
    if (!deletingContract) return;
    setIsDeleting(true);
    const cId = getContractId(deletingContract);
    try {
      await contractApi.deleteContract(cId);
      setContracts((prev) => prev.filter((item) => item.id !== cId && item.contractId !== cId));
      toast.success(`Contract "${deletingContract.name}" deleted successfully.`);
      notificationApi.createNotification({
        type: 'contract_deleted',
        title: 'Contract Agreement Deleted',
        message: `Contract "${deletingContract.name || cId}" for ${deletingContract.company || 'client'} was deleted.`,
        severity: 'warning',
        entityType: 'contract',
        entityId: cId
      });
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

      const matchesDateRange = isWithinDateRange(
        c.startDate || c.createdAt || c.expiryDate,
        dateFrom,
        dateTo
      );

      return matchesSearch && matchesStatus && matchesDateRange;
    }).sort((a, b) => {
      const dateA = new Date(a.startDate || a.createdAt || 0).getTime();
      const dateB = new Date(b.startDate || b.createdAt || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });
  }, [contracts, searchQuery, statusFilter, dateFrom, dateTo]);

  const columns = [
    {
      id: 'id',
      name: 'Contract Code',
      selector: (row) => getContractId(row),
      sortable: true,
      sortFunction: compareText(getContractId),
      width: '150px',
      cell: (c) => <span className="adm-code-badge blue">{getContractId(c)}</span>
    },
    {
      id: 'name',
      name: 'Contract Title',
      selector: (row) => row.name,
      sortable: true,
      sortFunction: compareText((row) => row.name),
      minWidth: '220px',
      grow: 1.2,
      wrap: true,
      cell: (c) => (
        <div>
          <div className="adm-primary-text">{c.name || 'Cloud Services Agreement'}</div>
          <div className="adm-secondary-text">
            Type: {c.contractType || 'Subscription'} ({c.subscriptionPeriod || '1 Year'})
          </div>
        </div>
      )
    },
    {
      id: 'customer',
      name: 'Client / Representative',
      selector: (row) => row.company || row.customer,
      sortable: true,
      sortFunction: compareText((row) => row.company || row.customer),
      minWidth: '210px',
      grow: 1,
      wrap: true,
      cell: (c) => (
        <div>
          <div className="adm-primary-text">{c.company || c.customer}</div>
          <div className="adm-secondary-text">{c.customer}</div>
        </div>
      )
    },
    {
      id: 'service',
      name: 'Service Scope & Tier',
      selector: (row) => row.service,
      sortable: true,
      sortFunction: compareText((row) => row.service),
      minWidth: '220px',
      grow: 1.1,
      wrap: true,
      cell: (c) => (
        <div>
          <div className="adm-primary-text">
            {c.service || `${c.contractType} (${c.subscriptionPeriod})`}
          </div>
          <div className="adm-secondary-text" style={{ color: '#6366f1', fontWeight: 600 }}>
            {c.slaTier || 'Tier-1 Priority NOC 99.99%'}
          </div>
        </div>
      )
    },
    {
      id: 'value',
      name: 'Contract Value',
      selector: (row) => row.totalContractValue || row.value,
      sortable: true,
      sortFunction: compareNumber((row) => row.totalContractValue || row.value),
      width: '150px',
      cell: (c) => (
        <span className="adm-mrr-text" style={{ fontSize: '0.92rem' }}>
          {c.totalContractValue || c.value}
        </span>
      )
    },
    {
      id: 'startDate',
      name: 'Start Date',
      selector: (row) => row.startDate,
      sortable: true,
      sortFunction: compareText((row) => row.startDate),
      width: '130px',
      cell: (c) => <span style={{ fontSize: '0.82rem', color: '#475569' }}>{c.startDate}</span>
    },
    {
      id: 'expiryDate',
      name: 'Expiry Date',
      selector: (row) => row.endDate || row.expiryDate,
      sortable: true,
      sortFunction: compareText((row) => row.endDate || row.expiryDate),
      width: '130px',
      cell: (c) => (
        <span style={{ fontSize: '0.82rem', color: '#475569' }}>{c.endDate || c.expiryDate}</span>
      )
    },
    {
      id: 'status',
      name: 'Status',
      selector: (row) => row.status,
      sortable: true,
      sortFunction: compareText((row) => row.status),
      width: '130px',
      cell: (c) => (
        <>
          {c.status?.toLowerCase() === 'active' && (
            <span className="adm-status-pill active">Active</span>
          )}
          {(c.status?.toLowerCase() === 'notstarted' || c.status?.toLowerCase() === 'draft') && (
            <span className="adm-status-pill demo">Not Started</span>
          )}
          {(c.status?.toLowerCase() === 'inactive' || c.status?.toLowerCase() === 'expired') && (
            <span className="adm-status-pill inactive">Inactive</span>
          )}
        </>
      ),
      searchType: 'select'
    },
    {
      id: 'sangam',
      name: 'Sangam CRM',
      selector: (row) => row.sangamCrm?.status || 'pending',
      sortable: true,
      sortFunction: compareText((row) => row.sangamCrm?.status || 'pending'),
      minWidth: '200px',
      grow: 0.9,
      cell: (c) => {
        const cId = getContractId(c);
        const isSyncing = !!syncingIds[cId];
        const crm = c.sangamCrm || {};
        const crmStatus = crm.status || 'pending';
        const crmId = crm.recordId;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '160px', whiteSpace: 'nowrap' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {crmStatus === 'synced' && (
                <span
                  className="adm-status-pill active"
                  style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0', whiteSpace: 'nowrap' }}
                  title={`Synced with Sangam CRM Contracts (Record ID: ${crmId})`}
                >
                  <CheckCircle2 size={11} />
                  <span>Synced</span>
                </span>
              )}
              {crmStatus === 'pending' && (
                <span
                  className="adm-status-pill demo"
                  style={{ background: '#fffbeb', color: '#d97706', borderColor: '#fde68a', whiteSpace: 'nowrap' }}
                  title="Waiting for Sangam CRM contract synchronization"
                >
                  <Clock size={11} />
                  <span>Pending</span>
                </span>
              )}
              {crmStatus === 'failed' && (
                <span
                  className="adm-status-pill inactive"
                  style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca', whiteSpace: 'nowrap' }}
                  title={`Sync error: ${crm.syncError || 'API Failed'}`}
                >
                  <AlertCircle size={11} />
                  <span>Failed</span>
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
              <span
                style={{
                  fontSize: '0.70rem',
                  fontFamily: 'monospace',
                  color: '#475569',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                {crmId ? (crmId.length > 18 ? `${crmId.substring(0, 15)}...` : crmId) : 'No Record ID'}
              </span>
              {crmId && (
                <a
                  href={contractApi.getSangamContractUrl(crmId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#6366f1', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
                  title="View Contract in Sangam CRM"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={11} />
                </a>
              )}
            </div>

            {crm.lastSyncedAt && (
              <span style={{ fontSize: '0.67rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                {new Date(crm.lastSyncedAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}

            {(crmStatus === 'failed' || crmStatus === 'pending') && can('contract', 'edit') && (
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
                  alignSelf: 'flex-start',
                  whiteSpace: 'nowrap'
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
      cell: (c) => (
        <RowActionMenu
          module="contract"
          onView={() => setViewingContract(c)}
          onEdit={() => setEditingContract(c)}
          onPrint={() => {
            generateContractPdf(c);
            toast.success(`PDF generated for ${c.name}`);
          }}
          onDelete={() => setDeletingContract(c)}
        />
      )
    }
  ];

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
          {can('contract', 'create') && (
            <button
              type="button"
              className="adm-btn-primary"
              onClick={() => navigate('/admin/customer/contract/create')}
            >
              <Plus size={16} />
              <span>Create Contract</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Controls & Search Toolbar */}
      <div className="adm-table-toolbar">
        <div className="adm-search-box adm-search-box-toolbar">
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
      </div>

      {/* 3. React DataTable */}
      <AdminDataTable
        columns={columns}
        data={filteredContracts}
        keyField="id"
        defaultSortFieldId="startDate"
        defaultSortAsc={false}
        resetPageToken={`${searchQuery}|${statusFilter}|${dateFrom}|${dateTo}`}
        minWidth={1680}
        noDataMessage="No contract agreements found"
        noDataHint="Try a different search term or status filter."
        ariaLabel="Customer contracts"
        scrollHeight="600px"
      />

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
