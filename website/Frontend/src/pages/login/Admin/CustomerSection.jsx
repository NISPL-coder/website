import { notificationApi } from '../../../services/notificationApi';
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  X,
  RotateCw,
  XCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit3,
  Trash2,
  Printer,
  Activity
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
import { compareDate, compareNumber, compareText, formatStamp, isWithinDateRange } from './adminTableUtils';
import { usePermissions } from './PermissionsContext';
import {
  normalizeCustomerLifecycle,
  customerLifecycleLabel,
  customerLifecycleTone
} from '../../../utils/customerLifecycle';

// Rows saved before the address became structured hold one joined string, so
// the city and state may only exist on the top level or not at all.
function addressPart(cust, key) {
  const fromAddress = cust.address && typeof cust.address === 'object' ? cust.address[key] : '';
  return String(fromAddress || cust[key] || '').trim();
}

export default function CustomerSection({
  customers,
  setCustomers,
  customerStats,
  setCustomerStats,
  receipts = [],
  externalSearch = ''
}) {
  const navigate = useNavigate();
  const { can, visibleColumns } = usePermissions();
  const [searchQuery, setSearchQuery] = useState(externalSearch || '');

  useEffect(() => {
    if (externalSearch !== undefined && externalSearch !== null) {
      setSearchQuery(externalSearch);
    }
  }, [externalSearch]);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'inactive' | 'demo' | 'inprogress' | 'active'
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [syncingIds, setSyncingIds] = useState({});
  const [showPasswords, setShowPasswords] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key, label = 'Text') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

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

    const toastId = toast.loading(`Authorizing ${days} extra trial days for ${cust.email}...`);
    try {
      const res = await customerApi.allowDemoExtension(cust.id || cust.customerId || cust.email, days);
      toast.success(res.message || `Authorized ${days} additional days for ${cust.name || cust.company}!`, { id: toastId });
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === cust.id || c.customerId === cust.customerId
            ? { ...c, demoExtensionAllowed: true, demoExtensionDays: days }
            : c
        )
      );
    } catch (err) {
      console.error('Failed to authorize demo extension:', err);
      toast.error(err.message || 'Failed to authorize demo extension.', { id: toastId });
    }
  };

  // Dynamic card stats and status counts computed directly from live customer records
  const dynamicCards = useMemo(() => {
    const list = Array.isArray(customers) ? customers : [];
    const counts = { total: list.length, active: 0, demo: 0, inprogress: 0, inactive: 0 };
    let mrrNum = 0;
    for (const c of list) {
      const stage = normalizeCustomerLifecycle(c.status);
      if (stage === 'Active') {
        counts.active += 1;
        mrrNum += parseInt(String(c.mrr || '').replace(/[^0-9]/g, ''), 10) || 0;
      } else if (stage === 'Demo') {
        counts.demo += 1;
      } else if (stage === 'InProgress') {
        counts.inprogress += 1;
      } else {
        counts.inactive += 1;
      }
    }

    const formattedMrr = `₹${mrrNum.toLocaleString('en-IN')}`;

    return {
      ...counts,
      mrr: mrrNum,
      formattedMrr,
      totalDesc: 'All customer records',
      activeDesc: `Monthly MRR: ${formattedMrr}`,
      inprogressDesc: 'Demo ended or purchase unpaid',
      demoDesc: 'Trials running, nothing purchased yet',
      inactiveDesc: 'Registered without demo or purchase'
    };
  }, [customers]);

  // Backward-compatible counts object for filters
  const counts = useMemo(() => ({
    all: dynamicCards.total,
    active: dynamicCards.active,
    demo: dynamicCards.demo,
    inprogress: dynamicCards.inprogress,
    inactive: dynamicCards.inactive
  }), [dynamicCards]);

  const statusOptions = useMemo(() => [
    { value: 'all', label: `All Statuses (${counts.all})` },
    { value: 'inactive', label: `Inactive (${counts.inactive})` },
    { value: 'demo', label: `Demo / Trials (${counts.demo})` },
    { value: 'inprogress', label: `In Progress (${counts.inprogress})` },
    { value: 'active', label: `Active Only (${counts.active})` }
  ], [counts]);

  // Filtered customer listing
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase();

      const searchable = [
        c.id,
        c.name,
        c.designation,
        c.company,
        c.email,
        c.loginEmail,
        c.phone,
        addressPart(c, 'city'),
        addressPart(c, 'state'),
        c.status
      ].map((value) => String(value || '').toLowerCase());

      const matchesSearch = !q || searchable.some((value) => value.includes(q));

      const stage = normalizeCustomerLifecycle(c.status);
      let matchesStatus = true;
      if (statusFilter === 'active') {
        matchesStatus = stage === 'Active';
      } else if (statusFilter === 'demo') {
        matchesStatus = stage === 'Demo';
      } else if (statusFilter === 'inprogress') {
        matchesStatus = stage === 'InProgress';
      } else if (statusFilter === 'inactive') {
        matchesStatus = stage === 'Inactive' || stage === 'DemoInactive';
      }

      const matchesDateRange = isWithinDateRange(c.createdAt || c.registered, dateFrom, dateTo);

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
      width: '135px',
      cell: (cust) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6366f1' }}>{cust.id}</span>
      )
    },
    {
      id: 'name',
      name: 'Customer Name',
      selector: (row) => row.name,
      sortable: true,
      sortFunction: compareText((row) => row.name),
      minWidth: '170px',
      grow: 1,
      cell: (cust) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>{cust.name || '—'}</span>
      )
    },
    {
      id: 'designation',
      name: 'Designation',
      selector: (row) => row.designation,
      sortable: true,
      sortFunction: compareText((row) => row.designation),
      minWidth: '130px',
      cell: (cust) => (
        <span style={{ fontSize: '0.78rem', color: '#475569' }}>{cust.designation || '—'}</span>
      )
    },
    {
      id: 'company',
      name: 'Company Name',
      selector: (row) => row.company,
      sortable: true,
      sortFunction: compareText((row) => row.company),
      minWidth: '190px',
      grow: 1.1,
      cell: (cust) => <span style={{ color: '#1e293b' }}>{cust.company || '—'}</span>
    },
    {
      id: 'email',
      name: 'Email(s)',
      selector: (row) => row.email || row.loginEmail,
      sortable: true,
      sortFunction: compareText((row) => row.email || row.loginEmail),
      minWidth: '220px',
      cell: (cust) => {
        const email = cust.email || cust.loginEmail || '—';
        const additional = Array.isArray(cust.additionalEmails) ? cust.additionalEmails.filter(Boolean) : [];
        const isCopied = copiedKey === `email-${cust.id}`;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '4px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 600 }}>{email}</span>
              {additional.length > 0 && (
                <span
                  style={{
                    fontSize: '0.64rem',
                    background: '#ede9fe',
                    color: '#6d28d9',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}
                  title="Primary Login Email"
                >
                  Primary
                </span>
              )}
              {email !== '—' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(email, `email-${cust.id}`, 'Primary Email');
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
                  title={isCopied ? 'Copied' : 'Copy Primary Email'}
                >
                  {isCopied ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                </button>
              )}
            </div>
            {additional.map((extraEm, idx) => {
              const isExtraCopied = copiedKey === `email-${cust.id}-extra-${idx}`;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.74rem',
                    color: '#64748b'
                  }}
                >
                  <span style={{ color: '#a5b4fc', fontSize: '0.8rem' }}>↳</span>
                  <span>{extraEm}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(extraEm, `email-${cust.id}-extra-${idx}`, 'Secondary Email');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: isExtraCopied ? '#16a34a' : '#94a3b8',
                      padding: '1px 2px',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                    title={isExtraCopied ? 'Copied' : 'Copy Secondary Email'}
                  >
                    {isExtraCopied ? <Check size={10} color="#16a34a" /> : <Copy size={10} />}
                  </button>
                </div>
              );
            })}
          </div>
        );
      }
    },
    {
      id: 'password',
      name: 'Password',
      selector: (row) => row.password || row.portalPassword || '',
      sortable: false,
      minWidth: '175px',
      cell: (cust) => {
        const pw = cust.password || cust.portalPassword || '••••••••';
        const isVisible = showPasswords[cust.id];
        const isCopied = copiedKey === `pw-${cust.id}`;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontWeight: 600,
                fontSize: '0.78rem',
                background: '#fef3c7',
                color: '#92400e',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid #fde68a',
                letterSpacing: isVisible ? '0.02em' : '0.12em'
              }}
            >
              {isVisible ? pw : '••••••••'}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPasswords((prev) => ({ ...prev, [cust.id]: !prev[cust.id] }));
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                padding: '2px',
                display: 'inline-flex',
                alignItems: 'center'
              }}
              title={isVisible ? 'Hide Password' : 'Show Password'}
            >
              {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(pw, `pw-${cust.id}`, 'Password');
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
              title={isCopied ? 'Copied' : 'Copy Password'}
            >
              {isCopied ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
            </button>
          </div>
        );
      }
    },
    {
      id: 'phone',
      name: 'Phone No.(s)',
      selector: (row) => row.phone,
      sortable: true,
      sortFunction: compareText((row) => row.phone),
      minWidth: '160px',
      cell: (cust) => {
        const primaryPhone = cust.phone || '—';
        const additionalPhones = [
          ...(Array.isArray(cust.additionalPhones) ? cust.additionalPhones : []),
          ...(cust.alternatePhone && !cust.additionalPhones?.includes(cust.alternatePhone) ? [cust.alternatePhone] : [])
        ].filter(Boolean);
        const isCopied = copiedKey === `phone-${cust.id}`;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '4px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#1e293b', fontWeight: 600 }}>
                {primaryPhone}
              </span>
              {additionalPhones.length > 0 && (
                <span
                  style={{
                    fontSize: '0.64rem',
                    background: '#f1f5f9',
                    color: '#475569',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}
                  title="Primary Phone"
                >
                  Primary
                </span>
              )}
              {primaryPhone !== '—' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(primaryPhone, `phone-${cust.id}`, 'Primary Phone');
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
                  title={isCopied ? 'Copied' : 'Copy Primary Phone'}
                >
                  {isCopied ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                </button>
              )}
            </div>
            {additionalPhones.map((extraPh, idx) => {
              const isExtraCopied = copiedKey === `phone-${cust.id}-extra-${idx}`;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.74rem',
                    color: '#64748b',
                    fontFamily: 'monospace'
                  }}
                >
                  <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>↳</span>
                  <span>{extraPh}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(extraPh, `phone-${cust.id}-extra-${idx}`, 'Secondary Phone');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: isExtraCopied ? '#16a34a' : '#94a3b8',
                      padding: '1px 2px',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                    title={isExtraCopied ? 'Copied' : 'Copy Secondary Phone'}
                  >
                    {isExtraCopied ? <Check size={10} color="#16a34a" /> : <Copy size={10} />}
                  </button>
                </div>
              );
            })}
          </div>
        );
      }
    },
    {
      id: 'orders',
      name: 'Orders',
      selector: (row) => row.orderCount || 0,
      sortable: true,
      sortFunction: compareNumber((row) => row.orderCount || 0),
      width: '90px',
      center: true,
      cell: (cust) => (
        <span style={{ fontWeight: 700, color: cust.orderCount ? '#0f172a' : '#94a3b8' }}>
          {cust.orderCount || 0}
        </span>
      )
    },
    {
      id: 'city',
      name: 'City',
      selector: (row) => addressPart(row, 'city'),
      sortable: true,
      sortFunction: compareText((row) => addressPart(row, 'city')),
      minWidth: '120px',
      cell: (cust) => <span style={{ fontSize: '0.78rem', color: '#475569' }}>{addressPart(cust, 'city') || '—'}</span>
    },
    {
      id: 'state',
      name: 'State',
      selector: (row) => addressPart(row, 'state'),
      sortable: true,
      sortFunction: compareText((row) => addressPart(row, 'state')),
      minWidth: '130px',
      cell: (cust) => <span style={{ fontSize: '0.78rem', color: '#475569' }}>{addressPart(cust, 'state') || '—'}</span>
    },
    {
      id: 'status',
      name: 'Status',
      selector: (row) => row.status,
      sortable: true,
      sortFunction: compareText((row) => row.status),
      minWidth: '190px',
      cell: (cust) => {
        const stage = normalizeCustomerLifecycle(cust.status);
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span className={`adm-status-pill ${customerLifecycleTone(cust.status)}`}>
              {stage === 'Active' && <CheckCircle2 size={12} />}
              {stage === 'Demo' && <Clock size={12} />}
              {stage === 'DemoInactive' && <XCircle size={12} />}
              {stage === 'InProgress' && <Activity size={12} />}
              {stage === 'Inactive' && <XCircle size={12} />}
              <span>{customerLifecycleLabel(cust.status)}</span>
            </span>
          </div>
        );
      },
      searchType: 'select',
      searchOptions: [
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Demo', label: 'Demo Trial' },
        { value: 'InProgress', label: 'In Progress' },
        { value: 'Active', label: 'Active' }
      ]
    },
    {
      id: 'createdAt',
      name: 'Created At',
      selector: (row) => row.createdAt || row.registered,
      sortable: true,
      sortFunction: compareDate((row) => row.createdAt || row.registered),
      width: '165px',
      cell: (cust) => (
        <span style={{ fontSize: '0.78rem', color: '#475569' }}>
          {formatStamp(cust.createdAt || cust.registered)}
        </span>
      )
    },
    {
      id: 'updatedAt',
      name: 'Updated At',
      selector: (row) => row.updatedAt || '',
      sortable: true,
      sortFunction: compareDate((row) => row.updatedAt || ''),
      width: '165px',
      cell: (cust) => (
        <span style={{ fontSize: '0.78rem', color: '#475569' }}>{formatStamp(cust.updatedAt)}</span>
      )
    },
    {
      id: 'actions',
      name: 'Actions',
      center: true,
      width: '120px',
      button: true,
      allowOverflow: true,
      ignoreRowClick: true,
      cell: (cust) => {
        const crmStatus = String(cust.sangamCrm?.status || '').toLowerCase();
        const isSyncing = syncingIds[cust.id || cust.customerId];
        return (
          <RowActionMenu
            module="customer"
            items={[
              { label: 'View Profile', icon: Eye, tone: 'blue', onClick: () => setSelectedCustomer(cust) },
              can('customer', 'edit') && { label: 'Edit Customer', icon: Edit3, tone: 'purple', onClick: () => setEditingCustomer(cust) },
              can('customer', 'edit') && {
                label: cust.demoExtensionAllowed ? `Extend (+${cust.demoExtensionDays || 7}d approved)` : 'Allow Demo Extension',
                icon: Clock,
                tone: 'amber',
                onClick: () => handleAuthorizeDemoExtension(cust)
              },
              {
                label: 'Print (PDF)',
                icon: Printer,
                tone: 'green',
                onClick: () => {
                  generateCustomerPdf(cust);
                  toast.success(`PDF generated for ${cust.company || cust.name}`);
                }
              },
              // A row that Sangam never accepted, or never heard of, is the only
              // one worth pushing again; the retry would be a no-op otherwise.
              can('customer', 'edit') && crmStatus !== 'synced' && {
                label: isSyncing ? 'Syncing...' : 'Retry Sangam Sync',
                icon: RotateCw,
                tone: 'orange',
                onClick: () => handleRetrySync(null, cust)
              },
              can('customer', 'delete') && { label: 'Delete', icon: Trash2, tone: 'red', danger: true, divider: true, onClick: () => setDeletingCustomer(cust) }
            ].filter(Boolean)}
          />
        );
      }
    }
  ];

  return (
    <div className="adm-table-card animate-fade-in">
      {/* 1. Card Header with Title on Left and Primary Action Button on Right */}
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <h1 className="adm-section-title">Customer List</h1>
          <p className="adm-section-sub">
            View and manage all registered customer accounts.
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

      {/* 2. Customer Quick Stat Cards (Total, Active, In Progress, Demo, Inactive) */}
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
          className={`adm-cust-stat-card ${statusFilter === 'inprogress' ? 'selected' : ''}`}
          onClick={() => setStatusFilter('inprogress')}
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">In Progress</span>
            <Activity size={18} className="adm-cust-stat-icon purple" />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#6366f1' }}>
            <CountUp end={dynamicCards.inprogress} duration={1200} />
          </span>
          <span className="adm-cust-stat-desc">{dynamicCards.inprogressDesc}</span>
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
            placeholder="Search by ID, name, company, email, city..."
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
              options={statusOptions}
              value={
                statusOptions.find((option) => option.value === statusFilter) || statusOptions[0]
              }
              onChange={(opt) => setStatusFilter(opt ? opt.value : 'all')}
              classNamePrefix="react-select"
            />
          </div>
        </div>
      </div>

      {/* 4. React DataTable */}
      <AdminDataTable
        columns={visibleColumns('customer', columns)}
        data={filteredCustomers}
        keyField="id"
        defaultSortFieldId="createdAt"
        defaultSortAsc={false}
        resetPageToken={`${searchQuery}|${statusFilter}|${dateFrom}|${dateTo}`}
        minWidth={2100}
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
        receipts={receipts}
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
