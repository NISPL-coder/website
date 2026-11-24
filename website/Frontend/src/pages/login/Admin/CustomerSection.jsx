import { notificationApi } from '../../../services/notificationApi';
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Activity,
  Server,
  ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { CountUp, formatAutoCompactNumber } from '../../Dashboard/utils/useCountUp';
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
import { getCustomerUserCount, getCustomerOrderBreakdown } from '../../../utils/customerUsers';

// Rows saved before the address became structured hold one joined string, so
// the city and state may only exist on the top level or not at all.
function addressPart(cust, key) {
  if (!cust) return '';
  const addr = Array.isArray(cust.address) && cust.address.length > 0 ? cust.address[0] : cust.address;
  const fromAddress = addr && typeof addr === 'object' ? addr[key] : '';
  const capitalizedKey = key ? key.charAt(0).toUpperCase() + key.slice(1) : '';
  return String(fromAddress || cust[key] || cust[`address${capitalizedKey}`] || '').trim();
}

export default function CustomerSection({
  customers,
  setCustomers,
  customerStats,
  setCustomerStats,
  receipts = [],
  externalSearch = '',
  contracts = [],
  products = []
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { can, visibleColumns } = usePermissions();

  const [highlightedId, setHighlightedId] = useState(
    () => location.state?.highlightId || location.state?.search || externalSearch || null
  );
  const [searchQuery, setSearchQuery] = useState(
    () => location.state?.search || externalSearch || ''
  );
  const [onlyWithUsers, setOnlyWithUsers] = useState(() => {
    const urlParams = new URLSearchParams(location.search);
    return (
      location.state?.onlyWithUsers === true ||
      urlParams.get('hasUsers') === 'true' ||
      urlParams.get('filter') === 'hasUsers'
    );
  });

  useEffect(() => {
    const stateSearch = location.state?.search;
    const stateHighlight = location.state?.highlightId || stateSearch;
    const urlParams = new URLSearchParams(location.search);
    const querySearch = urlParams.get('search') || urlParams.get('id') || urlParams.get('customerId');
    const target = stateSearch || querySearch;

    const hasUsersParam =
      location.state?.onlyWithUsers === true ||
      urlParams.get('hasUsers') === 'true' ||
      urlParams.get('filter') === 'hasUsers';

    setOnlyWithUsers(Boolean(hasUsersParam));

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
    const counts = { total: list.length, active: 0, demo: 0, inactive: 0 };
    let mrrNum = 0;
    for (const c of list) {
      const stage = normalizeCustomerLifecycle(c.status);
      if (stage === 'Active') {
        counts.active += 1;
        mrrNum += parseInt(String(c.mrr || '').replace(/[^0-9]/g, ''), 10) || 0;
      } else if (stage === 'Demo') {
        counts.demo += 1;
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
      demoDesc: 'Trials running, nothing purchased yet',
      inactiveDesc: 'Registered without demo or purchase'
    };
  }, [customers]);

  const totalUsersAllocated = useMemo(() => {
    return customers.reduce((sum, c) => sum + getCustomerUserCount(c, contracts, products), 0);
  }, [customers, contracts, products]);

  const customersWithUsersCount = useMemo(() => {
    return customers.filter((c) => getCustomerUserCount(c, contracts, products) > 0).length;
  }, [customers, contracts, products]);

  // Backward-compatible counts object for filters
  const counts = useMemo(() => ({
    all: dynamicCards.total,
    active: dynamicCards.active,
    demo: dynamicCards.demo,
    inactive: dynamicCards.inactive,
    users: customersWithUsersCount
  }), [dynamicCards, customersWithUsersCount]);

  const statusOptions = useMemo(() => [
    { value: 'all', label: `All Statuses (${formatAutoCompactNumber(counts.all)})` },
    { value: 'active', label: `Active Only (${formatAutoCompactNumber(counts.active)})` },
    { value: 'demo', label: `Demo / Trials (${formatAutoCompactNumber(counts.demo)})` },
    { value: 'inactive', label: `Inactive (${formatAutoCompactNumber(counts.inactive)})` },
    { value: 'users', label: `With Cloud Users (${formatAutoCompactNumber(counts.users)})` }
  ], [counts]);

  // Filtered customer listing
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const userCount = getCustomerUserCount(c, contracts, products);

      // If statusFilter is 'users' OR onlyWithUsers filter is active, only include customers who have users (> 0)
      if ((statusFilter === 'users' || onlyWithUsers) && userCount <= 0) {
        return false;
      }

      const q = searchQuery.toLowerCase();
      const orderInfo = getCustomerOrderBreakdown(c, contracts);

      const searchable = [
        c.id,
        c.name,
        c.designation,
        c.company,
        c.email,
        c.loginEmail,
        c.phone,
        c.plan,
        userCount ? `${userCount} user` : '',
        userCount ? `${userCount} users` : '',
        orderInfo.text,
        orderInfo.total ? `${orderInfo.total} orders` : '',
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
      } else if (statusFilter === 'inactive') {
        matchesStatus = stage === 'Inactive';
      } else if (statusFilter === 'users') {
        // Handled above via userCount > 0
        matchesStatus = true;
      }

      const matchesDateRange = isWithinDateRange(c.createdAt || c.registered, dateFrom, dateTo);

      return matchesSearch && matchesStatus && matchesDateRange;
    }).sort((a, b) => {
      const dateA = new Date(a.createdAt || a.registered || 0).getTime();
      const dateB = new Date(b.createdAt || b.registered || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });
  }, [customers, searchQuery, statusFilter, dateFrom, dateTo, contracts, products, onlyWithUsers]);

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

  const conditionalRowStyles = useMemo(() => {
    if (!highlightedId) return [];
    const target = String(highlightedId).trim().toLowerCase();
    return [
      {
        when: (row) => {
          const rowId = String(row.id || row.customerId || '').trim().toLowerCase();
          return rowId === target;
        },
        style: {
          backgroundColor: '#eff6ff',
          boxShadow: 'inset 4px 0 0 #2563eb'
        },
        classNames: ['adm-row-target-highlight']
      }
    ];
  }, [highlightedId]);

  const columns = [
    {
      id: 'id',
      name: 'Customer ID',
      selector: (row) => row.id,
      sortable: true,
      sortFunction: compareText((row) => row.id),
      width: '150px',
      cell: (cust) => {
        const isTarget = highlightedId && (
          String(cust.id || '').trim().toLowerCase() === String(highlightedId).trim().toLowerCase() ||
          String(cust.customerId || '').trim().toLowerCase() === String(highlightedId).trim().toLowerCase()
        );
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setSelectedCustomer(cust)}
              className="adm-clickable-id-btn"
              title={`View details for customer ${cust.id}`}
            >
              <span>{cust.id}</span>
              <ArrowUpRight size={13} className="adm-clickable-id-icon" />
            </button>
          </div>
        );
      }
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
        <button
          type="button"
          onClick={() => setSelectedCustomer(cust)}
          className="adm-clickable-name-btn"
          title={`View details for ${cust.name || 'Customer'}`}
        >
          <span>{cust.name || '—'}</span>
        </button>
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
      id: 'users',
      name: 'Users',
      selector: (row) => getCustomerUserCount(row, contracts, products),
      sortable: true,
      sortFunction: compareNumber((row) => getCustomerUserCount(row, contracts, products)),
      minWidth: '135px',
      cell: (cust) => {
        const count = getCustomerUserCount(cust, contracts, products);
        if (!count) {
          return <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>—</span>;
        }
        return (
          <span
            className="adm-status-pill purple"
            style={{
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 9px',
              borderRadius: '20px'
            }}
            title={cust.plan ? `Plan: ${cust.plan} (${count} ${count === 1 ? 'User' : 'Users'})` : `${count} ${count === 1 ? 'User' : 'Users'} Allocated`}
          >
            <Users size={12} />
            <span>{count} {count === 1 ? 'User' : 'Users'}</span>
          </span>
        );
      }
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
                    background: '#dbeafe',
                    color: '#1d4ed8',
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
      selector: (row) => getCustomerOrderBreakdown(row, contracts).total,
      sortable: true,
      sortFunction: compareNumber((row) => getCustomerOrderBreakdown(row, contracts).total),
      minWidth: '150px',
      width: '160px',
      center: true,
      cell: (cust) => {
        const { total, text } = getCustomerOrderBreakdown(cust, contracts);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1.25, padding: '3px 0' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: total ? '#0f172a' : '#94a3b8' }}>
              {total}
            </span>
            {total > 0 && text ? (
              <span style={{ fontSize: '0.67rem', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap', marginTop: '2px' }}>
                ({text})
              </span>
            ) : null}
          </div>
        );
      }
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
              {stage === 'Inactive' && <XCircle size={12} />}
              <span>{customerLifecycleLabel(cust.status)}</span>
            </span>
          </div>
        );
      },
      searchType: 'select',
      searchOptions: [
        { value: 'Active', label: 'Active' },
        { value: 'Demo', label: 'Demo Trial' },
        { value: 'Inactive', label: 'Inactive' }
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
        const orderInfo = getCustomerOrderBreakdown(cust, contracts);
        const hasPurchasedActive = orderInfo.active > 0 || normalizeCustomerLifecycle(cust.status) === 'Active';
        return (
          <RowActionMenu
            module="customer"
            items={[
              { label: 'View Profile', icon: Eye, tone: 'blue', onClick: () => setSelectedCustomer(cust) },
              can('customer', 'edit') && { label: 'Edit Customer', icon: Edit3, tone: 'purple', onClick: () => setEditingCustomer(cust) },
              can('customer', 'edit') && !hasPurchasedActive && {
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
            {statusFilter === 'users' || onlyWithUsers
              ? `Showing ${formatAutoCompactNumber(filteredCustomers.length)} customer accounts with allocated cloud users.`
              : 'View and manage all registered customer accounts.'}
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

      {/* 2. Customer Quick Stat Cards (Total, Active, In Progress, Demo, Inactive, Cloud Users) */}
      <div className="adm-customer-summary-grid">
        <div
          className={`adm-cust-stat-card ${statusFilter === 'all' && !onlyWithUsers ? 'selected' : ''}`}
          onClick={() => {
            setStatusFilter('all');
            setOnlyWithUsers(false);
          }}
          role="button"
          tabIndex={0}
          title="Click to show all customer records"
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Total Accounts</span>
            <Users size={18} className="adm-cust-stat-icon purple" />
          </div>
          <span className="adm-cust-stat-val">
            <CountUp end={dynamicCards.total} duration={1200} useCompact={true} />
          </span>
          <span className="adm-cust-stat-desc">{dynamicCards.totalDesc}</span>
        </div>

        <div
          className={`adm-cust-stat-card ${statusFilter === 'active' ? 'selected' : ''}`}
          onClick={() => {
            setStatusFilter((prev) => (prev === 'active' ? 'all' : 'active'));
            setOnlyWithUsers(false);
          }}
          role="button"
          tabIndex={0}
          title="Click to filter Active clients only"
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Active Clients</span>
            <CheckCircle2 size={18} className="adm-cust-stat-icon emerald" />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#059669' }}>
            <CountUp end={dynamicCards.active} duration={1200} useCompact={true} />
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
          onClick={() => {
            setStatusFilter((prev) => (prev === 'demo' ? 'all' : 'demo'));
            setOnlyWithUsers(false);
          }}
          role="button"
          tabIndex={0}
          title="Click to filter Demo trials only"
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Demo / Trials</span>
            <Clock size={18} className="adm-cust-stat-icon amber" />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#d97706' }}>
            <CountUp end={dynamicCards.demo} duration={1200} useCompact={true} />
          </span>
          <span className="adm-cust-stat-desc">{dynamicCards.demoDesc}</span>
        </div>

        <div
          className={`adm-cust-stat-card ${statusFilter === 'inactive' ? 'selected' : ''}`}
          onClick={() => {
            setStatusFilter((prev) => (prev === 'inactive' ? 'all' : 'inactive'));
            setOnlyWithUsers(false);
          }}
          role="button"
          tabIndex={0}
          title="Click to filter Inactive clients only"
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Inactive / Paused</span>
            <XCircle size={18} className="adm-cust-stat-icon slate" />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#64748b' }}>
            <CountUp end={dynamicCards.inactive} duration={1200} useCompact={true} />
          </span>
          <span className="adm-cust-stat-desc">{dynamicCards.inactiveDesc}</span>
        </div>

        <div
          className={`adm-cust-stat-card ${statusFilter === 'users' || onlyWithUsers ? 'selected' : ''}`}
          style={{
            cursor: 'pointer'
          }}
          onClick={() => {
            const next = (statusFilter === 'users' || onlyWithUsers) ? 'all' : 'users';
            setStatusFilter(next);
            setOnlyWithUsers(next === 'users');
          }}
          role="button"
          tabIndex={0}
          title={statusFilter === 'users' || onlyWithUsers ? 'Click to show all customers' : 'Click to filter customers who have cloud users'}
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label" style={{ color: '#2563eb' }}>Cloud Users</span>
            <Server size={18} className="adm-cust-stat-icon purple" style={{ color: '#2563eb' }} />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#2563eb' }}>
            <CountUp end={totalUsersAllocated} duration={1200} useCompact={true} /> {totalUsersAllocated === 1 ? 'User' : 'Users'}
          </span>
          <span className="adm-cust-stat-desc">
            {statusFilter === 'users' || onlyWithUsers
              ? `Filtered: ${formatAutoCompactNumber(counts.users)} customers with users`
              : `${formatAutoCompactNumber(counts.users)} customers with allocated plans`}
          </span>
        </div>
      </div>

      {/* 3. Filter Section of Demo, Active, Inactive, Users + Search */}
      <div className="adm-table-toolbar">
        {/* Search Box */}
        <div className="adm-search-box adm-search-box-toolbar">
          <Search size={16} className="adm-search-icon" />
          <input
            type="text"
            placeholder="Search by ID, name, company, email, city..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!e.target.value) setHighlightedId(null);
            }}
            className="adm-search-input"
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
          {(statusFilter === 'users' || onlyWithUsers) && (
            <button
              type="button"
              className="adm-status-pill purple"
              onClick={() => {
                setOnlyWithUsers(false);
                if (statusFilter === 'users') setStatusFilter('all');
              }}
              style={{
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: '1px solid #c4b5fd',
                background: '#dbeafe',
                color: '#1e40af',
                borderRadius: '8px',
                transition: 'all 0.15s ease'
              }}
              title="Click to remove Cloud Users filter and show all customers"
            >
              <Server size={13} />
              <span>With Users Only ({formatAutoCompactNumber(filteredCustomers.length)})</span>
              <X size={13} style={{ marginLeft: '2px' }} />
            </button>
          )}

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
              onChange={(opt) => {
                const val = opt ? opt.value : 'all';
                setStatusFilter(val);
                setOnlyWithUsers(val === 'users');
              }}
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
        resetPageToken={`${searchQuery}|${statusFilter}|${dateFrom}|${dateTo}|${onlyWithUsers}`}
        minWidth={2100}
        noDataMessage={statusFilter === 'users' || onlyWithUsers ? "No customer records have cloud users allocated" : "No customer records found"}
        noDataHint={statusFilter === 'users' || onlyWithUsers ? "Try clearing the 'With Users Only' filter or assigning cloud plans." : "Try a different search term or account status."}
        ariaLabel="Customer accounts"
        scrollHeight="600px"
        conditionalRowStyles={conditionalRowStyles}
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
        contracts={contracts}
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
