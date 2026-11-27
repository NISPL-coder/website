import { notificationApi } from '../../../services/notificationApi';
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  X,
  Search,
  Eye,
  Edit3,
  Printer,
  Trash2,
  RotateCw,
  Power,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Copy,
  Check,
  Globe
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
import AwaitingConfirmationModal from './AwaitingConfirmationModal';
import ViewCustomerModal from './ViewCustomerModal';
import { generateContractPdf } from './utils/generateContractPdf';
import AdminDataTable from './AdminDataTable';
import DateRangeFilter from './DateRangeFilter';
import { compareDate, compareNumber, compareText, isWithinDateRange, parseDateValue, toNumber } from './adminTableUtils';
import {
  CONTRACT_STATUSES,
  normalizeContractStatus,
  normalizeContractType,
  contractStatusTone,
  contractPersonName,
  contractPersonEmail,
  contractPersonMobile,
  contractActorName,
  formatContractStamp,
  matchesStatusFilter,
  isDemoContract,
  customerHasPurchasedPlans,
  generateDedicatedIp
} from './contractVocabulary';
import { usePermissions } from './PermissionsContext';

const getContractId = (row) => row.id || row.contractId;

const formatINR = (val) => {
  const num = Number(val);
  if (Number.isNaN(num) || num === 0) return '₹0';
  return `₹${Math.round(num).toLocaleString('en-IN')}`;
};

export default function ContractSection({ contracts, setContracts, customers = [], externalSearch = '' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { can, visibleColumns } = usePermissions();

  const [highlightedId, setHighlightedId] = useState(
    () => location.state?.highlightId || location.state?.search || externalSearch || null
  );
  const [searchQuery, setSearchQuery] = useState(
    () => location.state?.search || externalSearch || ''
  );

  useEffect(() => {
    const stateSearch = location.state?.search;
    const stateHighlight = location.state?.highlightId || stateSearch;
    const urlParams = new URLSearchParams(location.search);
    const querySearch = urlParams.get('search') || urlParams.get('id') || urlParams.get('contractId');
    const target = stateSearch || querySearch;

    if (target) {
      setSearchQuery(target);
      setStatusFilter('all');
      setDateFrom('');
      setDateTo('');
      setHighlightedId(stateHighlight || target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.key, location.state, location.search]);

  useEffect(() => {
    if (externalSearch !== undefined && externalSearch !== null && externalSearch !== '') {
      setSearchQuery(externalSearch);
      setHighlightedId(externalSearch);
    }
  }, [externalSearch]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [copiedIpId, setCopiedIpId] = useState(null);
  const [editingIpId, setEditingIpId] = useState(null);
  const [editingIpValue, setEditingIpValue] = useState('');
  const [savingIpId, setSavingIpId] = useState(null);
  const [syncingIds, setSyncingIds] = useState({});
  const [updatingStatusIds, setUpdatingStatusIds] = useState({});

  const handleStartEditIp = (contract, currentIp) => {
    const cId = getContractId(contract);
    setEditingIpId(cId);
    setEditingIpValue(currentIp || '');
  };

  const handleCancelEditIp = () => {
    setEditingIpId(null);
    setEditingIpValue('');
  };

  const handleSaveDedicatedIp = async (contract) => {
    const cId = getContractId(contract);
    const trimmedIp = editingIpValue.trim();
    const prevIp = contract.ipAddress || contract.dedicatedIp || contract.wanIp || '';

    if (trimmedIp === prevIp) {
      handleCancelEditIp();
      return;
    }

    setSavingIpId(cId);
    const toastId = toast.loading(`Updating Dedicated IP for "${contract.name || cId}"...`);
    try {
      const res = await contractApi.updateContract(cId, { ipAddress: trimmedIp });
      const updated = res.contract || { ...contract, ipAddress: trimmedIp, dedicatedIp: trimmedIp };
      setContracts((prev) =>
        prev.map((item) => (getContractId(item) === cId ? { ...item, ...updated } : item))
      );
      toast.success(trimmedIp ? `Dedicated IP updated to ${trimmedIp}` : 'Dedicated IP cleared', { id: toastId });
      handleCancelEditIp();
    } catch (err) {
      toast.error(`Failed to update IP: ${err.message}`, { id: toastId });
    } finally {
      setSavingIpId(null);
    }
  };

  const handleQuickStatusChange = async (contract, nextStatus) => {
    const cId = getContractId(contract);
    const currentStatus = normalizeContractStatus(contract.status, contract);
    if (nextStatus === currentStatus) return;

    setUpdatingStatusIds((prev) => ({ ...prev, [cId]: true }));
    const toastId = toast.loading(`Updating status of "${contract.name || cId}" to ${nextStatus} & syncing Sangam CRM...`);

    // Optimistic UI update
    setContracts((prev) =>
      prev.map((item) =>
        getContractId(item) === cId ? { ...item, status: nextStatus } : item
      )
    );

    try {
      const res = await contractApi.updateContract(cId, { status: nextStatus });
      const updated = res.contract || { ...contract, status: nextStatus };

      setContracts((prev) =>
        prev.map((item) =>
          getContractId(item) === cId ? { ...item, ...updated, status: nextStatus } : item
        )
      );

      toast.success(
        `Contract status changed to "${nextStatus}" & synchronized to Sangam CRM!`,
        { id: toastId }
      );
    } catch (err) {
      console.error('Failed to update contract status:', err);
      // Revert on failure
      setContracts((prev) =>
        prev.map((item) =>
          getContractId(item) === cId ? { ...item, status: currentStatus } : item
        )
      );
      toast.error(`Status update failed: ${err.message}`, { id: toastId });
    } finally {
      setUpdatingStatusIds((prev) => ({ ...prev, [cId]: false }));
    }
  };

  const handleConfirmPayment = async (contract) => {
    const cId = getContractId(contract);
    setUpdatingStatusIds((prev) => ({ ...prev, [cId]: true }));
    const toastId = toast.loading(`Confirming payment and activating services for "${contract.name || cId}"...`);
    try {
      await contractApi.confirmPayment(cId);
      toast.success(`Payment confirmed! Status set to Active and customer account activated.`, { id: toastId });
      setContracts((prev) =>
        prev.map((item) =>
          getContractId(item) === cId
            ? {
                ...item,
                status: 'Active',
                paymentStatus: 'Yes',
                confirmationStatus: 'Confirmed',
                adminConfirmed: true
              }
            : item
        )
      );
    } catch (err) {
      console.error('Failed to confirm payment:', err);
      toast.error(`Confirmation failed: ${err.message}`, { id: toastId });
    } finally {
      setUpdatingStatusIds((prev) => ({ ...prev, [cId]: false }));
    }
  };

  // Modals state
  const [viewingContract, setViewingContract] = useState(null);
  const [editingContract, setEditingContract] = useState(null);
  const [deletingContract, setDeletingContract] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAwaitingModalOpen, setIsAwaitingModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleViewCustomerForContract = (c) => {
    if (!c) return;
    const custId = String(c.customerId || resolveCustomerId(c) || '').trim().toLowerCase();
    const email = String(c.email || c.personEmail || c.customerEmail || '').trim().toLowerCase();
    const comp = String(c.company || '').trim().toLowerCase();
    const name = String(c.customer || c.person || c.contactPerson || '').trim().toLowerCase();

    let matched = (customers || []).find((cust) => {
      const cId = String(cust.customerId || cust.id || '').trim().toLowerCase();
      const cEmail = String(cust.email || cust.loginEmail || '').trim().toLowerCase();
      const cComp = String(cust.company || '').trim().toLowerCase();
      const cName = String(cust.name || '').trim().toLowerCase();
      return (
        (custId && cId === custId) ||
        (email && cEmail === email) ||
        (comp && cComp === comp) ||
        (name && cName === name)
      );
    });

    if (!matched) {
      const person = contractPersonName(c, customers);
      matched = {
        customerId: c.customerId || resolveCustomerId(c) || 'CUST-RECORD',
        id: c.customerId || resolveCustomerId(c) || 'CUST-RECORD',
        name: person || c.company || 'Customer',
        company: c.company || person || 'Client Company',
        email: contractPersonEmail(c, customers),
        phone: contractPersonMobile(c, customers),
        plan: c.name || c.contractName || '',
        users: c.users || 1,
        serverNode: c.serverNode || '',
        status: normalizeContractStatus(c.status, c) === 'ACTIVE' ? 'Active' : 'Inactive',
        address: c.address || {
          street: '',
          city: 'Kolkata',
          state: 'West Bengal',
          country: 'India',
          postalCode: ''
        }
      };
    }

    setSelectedCustomer(matched);
  };

  // Contracts awaiting payment confirmation
  const awaitingConfirmationContracts = useMemo(() => {
    return (contracts || []).filter((c) => {
      if (!c) return false;
      const conf = String(c.confirmationStatus || '').trim().toLowerCase();
      if (conf === 'pending') return true;
      if (c.adminConfirmed === false && conf !== 'none' && conf !== 'confirmed') return true;
      return false;
    });
  }, [contracts]);

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

  const resolveCustomerId = (c) => {
    if (c.customerId) return c.customerId;
    if (c.accountId && String(c.accountId).startsWith('CUST-')) return c.accountId;
    const comp = String(c.company || '').trim().toLowerCase();
    const pers = String(c.customer || c.person || '').trim().toLowerCase();
    const mail = String(c.personEmail || c.email || '').trim().toLowerCase();

    const matched = (customers || []).find((cust) => {
      const custComp = String(cust.company || '').trim().toLowerCase();
      const custName = String(cust.name || '').trim().toLowerCase();
      const custMail = String(cust.email || '').trim().toLowerCase();
      return (
        (comp && custComp === comp) ||
        (mail && custMail === mail) ||
        (pers && custName === pers)
      );
    });
    return matched?.customerId || matched?.id || '';
  };

  // Upcoming renewal payments calculation (responsive to DateRangeFilter)
  const upcomingRenewalMetrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hasFilter = Boolean(dateFrom || dateTo);

    const targetContracts = (contracts || []).filter((c) => {
      const normStatus = normalizeContractStatus(c?.status, c);
      if (['Closed', 'Cancelled', 'Terminated'].includes(normStatus)) return false;

      const renewalDateVal = c?.endDate || c?.expiryDate;
      if (!renewalDateVal) return false;

      if (hasFilter) {
        return isWithinDateRange(renewalDateVal, dateFrom, dateTo);
      }

      // Default when no filter: upcoming renewals from today onwards
      const time = parseDateValue(renewalDateVal);
      return time != null && time >= today.getTime();
    });

    const totalAmount = targetContracts.reduce((sum, c) => {
      const val = toNumber(c?.totalContractValue || c?.value || c?.amount || 0);
      return sum + val;
    }, 0);

    return {
      totalAmount,
      count: targetContracts.length,
      hasFilter
    };
  }, [contracts, dateFrom, dateTo]);

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const q = searchQuery.toLowerCase();
      const code = (c.id || c.contractId || '').toLowerCase();
      const custId = String(c.customerId || resolveCustomerId(c) || '').toLowerCase();
      const custName = contractPersonName(c, customers).toLowerCase();
      const dedicatedIp = String(c.ipAddress || c.dedicatedIp || c.wanIp || generateDedicatedIp(c.contractId || c.id)).toLowerCase();
      const name = (c.name || '').toLowerCase();
      const company = (c.company || '').toLowerCase();
      const email = contractPersonEmail(c, customers).toLowerCase();
      const mobile = contractPersonMobile(c, customers).toLowerCase();
      const type = normalizeContractType(c.contractType).toLowerCase();
      const amount = String(c.totalContractValue || c.value || '').toLowerCase();

      const matchesSearch =
        !q ||
        code.includes(q) ||
        custId.includes(q) ||
        custName.includes(q) ||
        dedicatedIp.includes(q) ||
        name.includes(q) ||
        company.includes(q) ||
        email.includes(q) ||
        mobile.includes(q) ||
        type.includes(q) ||
        amount.includes(q);

      const matchesStatus = matchesStatusFilter(c, statusFilter);

      const matchesDateRange =
        isWithinDateRange(c.endDate || c.expiryDate, dateFrom, dateTo) ||
        isWithinDateRange(c.startDate, dateFrom, dateTo) ||
        isWithinDateRange(c.createdAt, dateFrom, dateTo);

      return matchesSearch && matchesStatus && matchesDateRange;
    }).sort((a, b) => {
      const dateA = new Date(a.startDate || a.createdAt || 0).getTime();
      const dateB = new Date(b.startDate || b.createdAt || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });
  }, [contracts, searchQuery, statusFilter, dateFrom, dateTo, customers]);

  // One option per status in the register, counted from the rows themselves.
  const statusFilterOptions = useMemo(() => {
    const counts = CONTRACT_STATUSES.reduce((map, status) => {
      const next = { ...map };
      next[status] = contracts.filter((c) => normalizeContractStatus(c.status, c) === status).length;
      return next;
    }, {});

    return [
      { value: 'all', label: `All Statuses (${contracts.length})` },
      ...CONTRACT_STATUSES.map((status) => ({
        value: status.toLowerCase().replace(/[\s_-]+/g, ''),
        label: `${status} (${counts[status] || 0})`
      }))
    ];
  }, [contracts]);

  const conditionalRowStyles = useMemo(() => {
    if (!highlightedId) return [];
    const target = String(highlightedId).trim().toLowerCase();
    return [
      {
        when: (row) => {
          const cId = String(row.id || row.contractId || '').trim().toLowerCase();
          const cName = String(row.name || '').trim().toLowerCase();
          const custId = String(row.customerId || resolveCustomerId(row) || '').trim().toLowerCase();
          return cId === target || cName === target || (custId && custId === target);
        },
        style: {
          backgroundColor: '#eff6ff',
          boxShadow: 'inset 4px 0 0 #2563eb'
        },
        classNames: ['adm-row-target-highlight']
      }
    ];
  }, [highlightedId, customers]);

  const columns = [
    {
      id: 'customerId',
      name: 'Customer ID',
      selector: (row) => row.customerId || resolveCustomerId(row) || '',
      sortable: true,
      sortFunction: compareText((row) => row.customerId || resolveCustomerId(row) || ''),
      minWidth: '140px',
      width: '150px',
      cell: (c) => {
        const custId = c.customerId || resolveCustomerId(c);
        const isTarget = highlightedId && custId && String(custId).trim().toLowerCase() === String(highlightedId).trim().toLowerCase();
        if (!custId) {
          return <span style={{ color: '#94a3b8' }}>—</span>;
        }
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              className="adm-clickable-id-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/customer?search=${encodeURIComponent(custId)}`, {
                  state: {
                    search: custId,
                    highlightId: custId
                  }
                });
              }}
              title={`View customer ${custId} in Customer List`}
            >
              <span>{custId}</span>
              <ArrowUpRight size={13} className="adm-clickable-id-icon" />
            </button>
          </div>
        );
      }
    },
    {
      id: 'customer',
      name: 'Customer Name',
      selector: (row) => contractPersonName(row, customers),
      sortable: true,
      sortFunction: compareText((row) => contractPersonName(row, customers)),
      minWidth: '175px',
      grow: 1,
      wrap: true,
      cell: (c) => {
        const pName = contractPersonName(c, customers) || '—';
        return (
          <button
            type="button"
            onClick={() => handleViewCustomerForContract(c)}
            className="adm-clickable-name-btn"
            title={`View profile details for ${pName}`}
          >
            <span>{pName}</span>
          </button>
        );
      },
      searchType: 'text'
    },
    {
      id: 'name',
      name: 'Contract Name/ID',
      selector: (row) => row.name,
      sortable: true,
      sortFunction: compareText((row) => row.name),
      minWidth: '220px',
      grow: 1.2,
      wrap: true,
      cell: (c) => {
        const cId = c.id || c.contractId;
        const isTarget = highlightedId && (
          String(cId || '').trim().toLowerCase() === String(highlightedId).trim().toLowerCase() ||
          String(c.name || '').trim().toLowerCase() === String(highlightedId).trim().toLowerCase()
        );
        return (
          <div className="adm-primary-text">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 600 }}>{c.name || '—'}</span>
            </div>
            {cId && cId !== c.name && (
              <div style={{ fontFamily: 'monospace', fontSize: '0.74rem', color: '#2563eb', fontWeight: 600 }}>
                {cId}
              </div>
            )}
          </div>
        );
      }
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
      id: 'dedicatedIp',
      name: 'Dedicated IP Address',
      selector: (row) => row.ipAddress || row.dedicatedIp || row.wanIp || generateDedicatedIp(row.contractId || row.id),
      sortable: true,
      sortFunction: compareText((row) => row.ipAddress || row.dedicatedIp || row.wanIp || generateDedicatedIp(row.contractId || row.id)),
      minWidth: '250px',
      cell: (c) => {
        const cId = getContractId(c);
        const ip = c.ipAddress || c.dedicatedIp || c.wanIp || generateDedicatedIp(c.contractId || c.id);
        const isCopied = copiedIpId === cId;
        const isEditing = editingIpId === cId;
        const isSaving = savingIpId === cId;
        const canEdit = can('contract', 'edit');

        if (isEditing) {
          return (
            <div
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', width: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={editingIpValue}
                onChange={(e) => setEditingIpValue(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveDedicatedIp(c);
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    handleCancelEditIp();
                  }
                }}
                placeholder="e.g. 103.115.220.44"
                autoFocus
                disabled={isSaving}
                style={{
                  fontFamily: "'SFMono-Regular', Consolas, Menlo, monospace",
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '4px 7px',
                  borderRadius: '6px',
                  border: '1px solid #3b82f6',
                  outline: 'none',
                  width: '138px',
                  color: '#0f172a',
                  background: '#ffffff'
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveDedicatedIp(c);
                }}
                disabled={isSaving}
                title="Save Dedicated IP"
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '4px',
                  cursor: isSaving ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                <Check size={13} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelEditIp();
                }}
                disabled={isSaving}
                title="Cancel"
                style={{
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: '1px solid #cbd5e1',
                  borderRadius: '5px',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                <X size={13} />
              </button>
            </div>
          );
        }

        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', maxWidth: '100%', minWidth: 0 }}>
            <span
              onDoubleClick={(e) => {
                if (!canEdit) return;
                e.stopPropagation();
                handleStartEditIp(c, c.ipAddress || c.dedicatedIp || c.wanIp || ip);
              }}
              title={canEdit ? 'Double-click or click edit to change Dedicated IP' : undefined}
              style={{
                fontFamily: "'SFMono-Regular', Consolas, Menlo, monospace",
                fontWeight: 600,
                fontSize: '0.82rem',
                color: ip ? '#1d4ed8' : '#94a3b8',
                background: ip ? '#eff6ff' : 'transparent',
                padding: ip ? '3px 8px' : 0,
                borderRadius: '6px',
                border: ip ? '1px solid #bfdbfe' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                cursor: canEdit ? 'pointer' : 'default'
              }}
            >
              {ip && <Globe size={12} style={{ color: '#2563eb', flexShrink: 0 }} />}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{ip || '—'}</span>
            </span>
            {ip && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(ip);
                  setCopiedIpId(cId);
                  toast.success(`Copied IP: ${ip}`);
                  setTimeout(() => setCopiedIpId(null), 1800);
                }}
                title="Copy Dedicated IP Address"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isCopied ? '#10b981' : '#94a3b8',
                  padding: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  flexShrink: 0
                }}
              >
                <Copy size={13} />
              </button>
            )}
            {canEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartEditIp(c, c.ipAddress || c.dedicatedIp || c.wanIp || ip);
                }}
                title="Edit Dedicated IP Address"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  flexShrink: 0
                }}
              >
                <Edit3 size={13} />
              </button>
            )}
          </div>
        );
      },
      searchType: 'text'
    },
    {
      id: 'status',
      name: 'Status',
      selector: (row) => (row.confirmationStatus === 'Pending' ? 'Confirmation Pending' : normalizeContractStatus(row.status, row)),
      sortable: true,
      sortFunction: compareText((row) => (row.confirmationStatus === 'Pending' ? 'Confirmation Pending' : normalizeContractStatus(row.status, row))),
      minWidth: '170px',
      width: '185px',
      cell: (c) => {
        const isPending = c.confirmationStatus === 'Pending';
        const status = isPending ? 'Confirmation Pending' : normalizeContractStatus(c.status, c);
        const tone = isPending ? 'in-progress' : contractStatusTone(status, c);
        const cId = getContractId(c);
        const isUpdating = !!updatingStatusIds[cId];

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start' }}>
            <span
              className={`adm-status-pill ${tone}`}
              style={isPending ? { background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontWeight: 600 } : undefined}
            >
              {status || '—'}
            </span>
            {isPending && can('contract', 'edit') && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirmPayment(c);
                }}
                disabled={isUpdating}
                style={{
                  background: '#10b981',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  color: '#fff',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: isUpdating ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  marginTop: '2px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
                title="Confirm customer payment and activate services"
              >
                {isUpdating ? 'Activating...' : '✓ Set Confirmation: Yes'}
              </button>
            )}
            {!isPending && can('contract', 'edit') && (status === 'Active' || status === 'In Progress') && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickStatusChange(c, 'Inactive');
                }}
                disabled={isUpdating}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#dc2626',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: isUpdating ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  textDecoration: 'underline'
                }}
                title="Mark this contract as Inactive and update in Sangam CRM"
              >
                {isUpdating ? 'Updating...' : '+ Set Inactive'}
              </button>
            )}
            {!isPending && can('contract', 'edit') && status === 'Inactive' && !(isDemoContract(c) && customerHasPurchasedPlans(c, contracts)) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickStatusChange(c, 'Active');
                }}
                disabled={isUpdating}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#059669',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: isUpdating ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  textDecoration: 'underline'
                }}
                title="Mark this contract as Active and update in Sangam CRM"
              >
                {isUpdating ? 'Updating...' : '+ Set Active'}
              </button>
            )}
          </div>
        );
      },
      searchType: 'select'
    },
    {
      id: 'paymentStatus',
      name: 'Payment Status',
      selector: (row) => (['yes', 'true', '1', 'paid'].includes(String(row.paymentStatus || '').toLowerCase()) ? 'Yes' : 'No'),
      sortable: true,
      sortFunction: compareText((row) => (['yes', 'true', '1', 'paid'].includes(String(row.paymentStatus || '').toLowerCase()) ? 'Yes' : 'No')),
      width: '135px',
      cell: (c) => {
        const isPaid = ['yes', 'true', '1', 'paid'].includes(String(c.paymentStatus || '').toLowerCase());
        return (
          <span className={`adm-status-pill ${isPaid ? 'active' : 'inactive'}`}>
            {isPaid ? 'Yes' : 'No'}
          </span>
        );
      },
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
                label: 'Confirm Payment (Set to Yes)',
                icon: CheckCircle2,
                tone: 'green',
                hidden: !can('contract', 'edit') || c.confirmationStatus !== 'Pending',
                onClick: () => handleConfirmPayment(c)
              },
              {
                label: 'Edit',
                icon: Edit3,
                tone: 'purple',
                hidden: !can('contract', 'edit'),
                onClick: () => setEditingContract(c)
              },
              {
                label: 'Set Inactive',
                icon: Power,
                tone: 'red',
                hidden: !can('contract', 'edit') || !['Active', 'In Progress'].includes(normalizeContractStatus(c.status, c)),
                onClick: () => handleQuickStatusChange(c, 'Inactive')
              },
              {
                label: 'Set Active',
                icon: CheckCircle2,
                tone: 'green',
                hidden:
                  !can('contract', 'edit') ||
                  normalizeContractStatus(c.status, c) !== 'Inactive' ||
                  (isDemoContract(c) && customerHasPurchasedPlans(c, contracts)),
                onClick: () => handleQuickStatusChange(c, 'Active')
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
            View and manage all customer contracts and subscriptions.
          </p>
        </div>

        <div className="adm-card-header-action">
          {/* Highlighted Section: Upcoming Renewal Payment Receive Amount (only visible when date range is filtered) */}
          {upcomingRenewalMetrics.hasFilter && (
            <div
              className="adm-upcoming-renewal-card is-filtered"
              onClick={() => {
                const trigger = document.querySelector('.adm-date-range-trigger');
                if (trigger) {
                  trigger.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  trigger.click();
                }
              }}
              title={`Upcoming renewal payments: ${formatINR(upcomingRenewalMetrics.totalAmount)} (${upcomingRenewalMetrics.count} renewals). Click to adjust date range.`}
            >
              <div className="adm-renewal-icon-wrap is-filtered">
                <RotateCw size={15} />
              </div>
              <div className="adm-renewal-info">
                <span className="adm-renewal-label">
                  Upcoming Payment Receive
                </span>
                <div className="adm-renewal-value-row">
                  <span className="adm-renewal-amount">
                    {formatINR(upcomingRenewalMetrics.totalAmount)}
                  </span>
                  <span className="adm-renewal-count-badge">
                    {upcomingRenewalMetrics.count} {upcomingRenewalMetrics.count === 1 ? 'Renewal' : 'Renewals'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="adm-renewal-reset-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setDateFrom('');
                  setDateTo('');
                }}
                title="Clear date filter"
                aria-label="Clear date filter"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {awaitingConfirmationContracts.length > 0 && (
            <button
              type="button"
              onClick={() => setIsAwaitingModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#facc15',
                color: '#713f12',
                border: '1.5px solid #eab308',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(234, 179, 8, 0.3)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#eab308';
                e.currentTarget.style.color = '#451a03';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#facc15';
                e.currentTarget.style.color = '#713f12';
              }}
              title="Review and confirm customer online payments"
            >
              <Clock size={15} strokeWidth={2.5} />
              <span>Awaiting Payment Confirmation</span>
              <span
                style={{
                  background: '#713f12',
                  color: '#fef08a',
                  padding: '1px 7px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 800
                }}
              >
                {awaitingConfirmationContracts.length}
              </span>
            </button>
          )}

          <ExportDropdown
            data={filteredContracts}
            formatter={(list) => formatContractsForExport(list, customers)}
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!e.target.value) setHighlightedId(null);
            }}
          />
          {searchQuery && (
            <button
              type="button"
              className="adm-search-clear"
              aria-label="Clear search"
              onClick={() => {
                setSearchQuery('');
                setHighlightedId(null);
              }}
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
        conditionalRowStyles={conditionalRowStyles}
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

      {/* Awaiting Payment Confirmation Modal */}
      <AwaitingConfirmationModal
        isOpen={isAwaitingModalOpen}
        onClose={() => setIsAwaitingModalOpen(false)}
        contracts={awaitingConfirmationContracts}
        onContractConfirmed={(cId) => {
          setContracts((prev) =>
            prev.map((item) =>
              getContractId(item) === cId
                ? {
                    ...item,
                    status: 'Active',
                    paymentStatus: 'Yes',
                    confirmationStatus: 'Confirmed',
                    adminConfirmed: true
                  }
                : item
            )
          );
        }}
      />

      {/* Customer Profile View Modal */}
      <ViewCustomerModal
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onEdit={(cust) => {
          setSelectedCustomer(null);
          navigate(`/admin/customer?search=${encodeURIComponent(cust.customerId || cust.id)}`, {
            state: { search: cust.customerId || cust.id, highlightId: cust.customerId || cust.id }
          });
        }}
      />
    </div>
  );
}
