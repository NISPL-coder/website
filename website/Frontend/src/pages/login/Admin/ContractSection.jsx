import { notificationApi } from '../../../services/notificationApi';
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  X,
  Search,
  Eye,
  Edit3,
  Printer,
  Trash2,
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
import { compareDate, compareNumber, compareText, isWithinDateRange } from './adminTableUtils';
import {
  CONTRACT_STATUSES,
  normalizeContractStatus,
  normalizeContractType,
  contractStatusTone,
  contractPersonEmail,
  contractPersonMobile,
  contractActorName,
  formatContractStamp,
  matchesStatusFilter
} from './contractVocabulary';
import { usePermissions } from './PermissionsContext';

const getContractId = (row) => row.id || row.contractId;

export default function ContractSection({ contracts, setContracts, customers = [], externalSearch = '' }) {
  const navigate = useNavigate();
  const { can, visibleColumns } = usePermissions();
  const [searchQuery, setSearchQuery] = useState(externalSearch || '');

  useEffect(() => {
    if (externalSearch !== undefined && externalSearch !== null) {
      setSearchQuery(externalSearch);
    }
  }, [externalSearch]);
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
      const company = (c.company || '').toLowerCase();
      const email = contractPersonEmail(c, customers).toLowerCase();
      const mobile = contractPersonMobile(c, customers).toLowerCase();
      const type = normalizeContractType(c.contractType).toLowerCase();
      const amount = String(c.totalContractValue || c.value || '').toLowerCase();

      const matchesSearch =
        !q ||
        code.includes(q) ||
        name.includes(q) ||
        company.includes(q) ||
        email.includes(q) ||
        mobile.includes(q) ||
        type.includes(q) ||
        amount.includes(q);

      const matchesStatus = matchesStatusFilter(c, statusFilter);

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

  // One option per status in the register, counted from the rows themselves.
  const statusFilterOptions = useMemo(() => {
    const counts = CONTRACT_STATUSES.reduce((map, status) => {
      const next = { ...map };
      next[status] = contracts.filter((c) => normalizeContractStatus(c.status) === status).length;
      return next;
    }, {});

    return [
      { value: 'all', label: `All Statuses (${contracts.length})` },
      ...CONTRACT_STATUSES.map((status) => ({
        value: status.toLowerCase().replace(/\s+/g, ''),
        label: `${status} (${counts[status]})`
      }))
    ];
  }, [contracts]);

  const columns = [
    {
      id: 'name',
      name: 'Contract ID',
      selector: (row) => row.name,
      sortable: true,
      sortFunction: compareText((row) => row.name),
      minWidth: '220px',
      grow: 1.2,
      wrap: true,
      cell: (c) => <div className="adm-primary-text">{c.name || '—'}</div>
    },
    {
      id: 'company',
      name: 'Company Name',
      selector: (row) => row.company,
      sortable: true,
      sortFunction: compareText((row) => row.company),
      minWidth: '180px',
      grow: 1,
      wrap: true,
      cell: (c) => <div className="adm-primary-text">{c.company || '—'}</div>
    },
    {
      id: 'status',
      name: 'Status',
      selector: (row) => normalizeContractStatus(row.status),
      sortable: true,
      sortFunction: compareText((row) => normalizeContractStatus(row.status)),
      width: '130px',
      cell: (c) => (
        <span className={`adm-status-pill ${contractStatusTone(c.status)}`}>
          {normalizeContractStatus(c.status) || '—'}
        </span>
      ),
      searchType: 'select'
    },
    {
      id: 'personEmail',
      name: 'Person Email',
      selector: (row) => contractPersonEmail(row, customers),
      sortable: true,
      sortFunction: compareText((row) => contractPersonEmail(row, customers)),
      minWidth: '200px',
      grow: 1,
      wrap: true,
      cell: (c) => <span style={{ fontSize: '0.82rem', color: '#475569' }}>{contractPersonEmail(c, customers) || '—'}</span>
    },
    {
      id: 'personMobile',
      name: 'Person Mobile',
      selector: (row) => contractPersonMobile(row, customers),
      sortable: true,
      sortFunction: compareText((row) => contractPersonMobile(row, customers)),
      width: '140px',
      cell: (c) => <span style={{ fontSize: '0.82rem', color: '#475569' }}>{contractPersonMobile(c, customers) || '—'}</span>
    },
    {
      id: 'contractType',
      name: 'Contract Type',
      selector: (row) => normalizeContractType(row.contractType),
      sortable: true,
      sortFunction: compareText((row) => normalizeContractType(row.contractType)),
      minWidth: '170px',
      grow: 1,
      wrap: true,
      cell: (c) => (
        <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
          {normalizeContractType(c.contractType) || '—'}
        </span>
      )
    },
    {
      id: 'value',
      name: 'Total Contract Value',
      selector: (row) => row.totalContractValue || row.value,
      sortable: true,
      sortFunction: compareNumber((row) => row.totalContractValue || row.value),
      width: '150px',
      cell: (c) => (
        <span className="adm-mrr-text" style={{ fontSize: '0.92rem' }}>
          {c.totalContractValue || c.value || '—'}
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
      cell: (c) => <span style={{ fontSize: '0.82rem', color: '#475569' }}>{c.startDate || '—'}</span>
    },
    {
      id: 'endDate',
      name: 'End Date',
      selector: (row) => row.endDate || row.expiryDate,
      sortable: true,
      sortFunction: compareText((row) => row.endDate || row.expiryDate),
      width: '130px',
      cell: (c) => (
        <span style={{ fontSize: '0.82rem', color: '#475569' }}>{c.endDate || c.expiryDate || '—'}</span>
      )
    },
    {
      id: 'updatedAt',
      name: 'Updated At',
      selector: (row) => row.updatedAt || '',
      sortable: true,
      sortFunction: compareDate((row) => row.updatedAt || ''),
      width: '165px',
      cell: (c) => <span style={{ fontSize: '0.78rem', color: '#475569' }}>{formatContractStamp(c.updatedAt)}</span>
    },
    {
      id: 'updatedBy',
      name: 'Updated By',
      selector: (row) => contractActorName(row.updatedBy),
      sortable: true,
      sortFunction: compareText((row) => contractActorName(row.updatedBy)),
      minWidth: '160px',
      grow: 0.9,
      wrap: true,
      cell: (c) => <span style={{ fontSize: '0.8rem', color: '#475569' }}>{contractActorName(c.updatedBy) || '—'}</span>
    },
    {
      id: 'createdAt',
      name: 'Created At',
      selector: (row) => row.createdAt || '',
      sortable: true,
      sortFunction: compareDate((row) => row.createdAt || ''),
      width: '165px',
      cell: (c) => <span style={{ fontSize: '0.78rem', color: '#475569' }}>{formatContractStamp(c.createdAt)}</span>
    },
    {
      id: 'createdBy',
      name: 'Created By',
      selector: (row) => contractActorName(row.createdBy),
      sortable: true,
      sortFunction: compareText((row) => contractActorName(row.createdBy)),
      minWidth: '160px',
      grow: 0.9,
      wrap: true,
      cell: (c) => <span style={{ fontSize: '0.8rem', color: '#475569' }}>{contractActorName(c.createdBy) || '—'}</span>
    },
    {
      id: 'actions',
      name: 'Actions',
      center: true,
      width: '120px',
      button: true,
      allowOverflow: true,
      ignoreRowClick: true,
      cell: (c) => {
        const cId = getContractId(c);
        const isSyncing = !!syncingIds[cId];
        const crmStatus = c.sangamCrm?.status || 'pending';

        return (
          <RowActionMenu
            module="contract"
            items={[
              { label: 'View', icon: Eye, tone: 'blue', onClick: () => setViewingContract(c) },
              {
                label: 'Edit',
                icon: Edit3,
                tone: 'purple',
                hidden: !can('contract', 'edit'),
                onClick: () => setEditingContract(c)
              },
              {
                label: 'Print (PDF)',
                icon: Printer,
                tone: 'green',
                onClick: () => {
                  generateContractPdf(c);
                  toast.success(`PDF generated for ${c.name}`);
                }
              },
              {
                label: isSyncing ? 'Syncing...' : 'Retry CRM Sync',
                icon: RotateCw,
                tone: 'orange',
                hidden: crmStatus === 'synced' || !can('contract', 'edit'),
                onClick: (e) => handleRetrySync(e, c)
              },
              {
                label: 'Delete',
                icon: Trash2,
                tone: 'red',
                danger: true,
                divider: true,
                hidden: !can('contract', 'delete'),
                onClick: () => setDeletingContract(c)
              }
            ]}
          />
        );
      }
    }
  ];

  return (
    <div className="adm-table-card animate-fade-in">
      {/* 1. Header with Title and Create Contract button */}
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <h1 className="adm-section-title">Contract List</h1>
          <p className="adm-section-sub">
            Complete data of all assigned contracts
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
            placeholder="Search by contract ID, company, person, type..."
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
              options={statusFilterOptions}
              value={
                statusFilterOptions.find((option) => option.value === statusFilter) ||
                statusFilterOptions[0]
              }
              onChange={(opt) => setStatusFilter(opt ? opt.value : 'all')}
              classNamePrefix="react-select"
            />
          </div>
        </div>
      </div>

      {/* 3. React DataTable */}
      <AdminDataTable
        columns={visibleColumns('contract', columns)}
        data={filteredContracts}
        keyField="id"
        defaultSortFieldId="startDate"
        defaultSortAsc={false}
        resetPageToken={`${searchQuery}|${statusFilter}|${dateFrom}|${dateTo}`}
        minWidth={2200}
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
