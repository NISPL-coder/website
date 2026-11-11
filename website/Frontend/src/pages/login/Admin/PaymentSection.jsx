import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Landmark, Paperclip, X, Search, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { compactSelectStyles } from './reactSelectStyles';
import ExportDropdown from './ExportDropdown';
import { formatPaymentsForExport } from './exportUtils';
import AdminDataTable from './AdminDataTable';
import DateRangeFilter from './DateRangeFilter';
import { usePermissions } from './PermissionsContext';
import { paymentApi } from '../../../services/paymentApi';
import { compareDate, compareNumber, compareText, isWithinDateRange } from './adminTableUtils';

const getName = (row) => row.name || row.customer || '—';
const getAccount = (row) => row.accountName || row.company || '—';
const getInvoiceNumber = (row) => row.invoiceNumber || row.invoiceRef || '—';
const getInvoiceDate = (row) => row.invoiceDate || row.date || '—';
const getReceivedAmount = (row) => row.receivedAmount || row.amount;
const getPending = (row) => row.pendingPayment || '₹0';
const getExpectedDate = (row) => row.expectedPaymentDate || '—';
const getReceivedDate = (row) => row.paymentReceivedDate || row.date || '—';
const getMethod = (row) => row.paymentMethod || row.method || '—';
const getReference = (row) => row.referenceNumber || '';
const getBank = (row) => row.bankName || '';
const getProof = (row) => row.proof || null;
const getFilterDate = (row) =>
  row.invoiceDate || row.date || row.paymentReceivedDate || row.expectedPaymentDate || row.createdAt;

const proofSize = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(Math.round(bytes / 1024), 1)} KB`;

export default function PaymentSection({ payments, setPayments, contracts, onGoToReceipt, externalSearch = '' }) {
  const navigate = useNavigate();
  const { visibleColumns, can } = usePermissions();
  const [searchQuery, setSearchQuery] = useState(externalSearch || '');

  useEffect(() => {
    if (externalSearch !== undefined && externalSearch !== null) {
      setSearchQuery(externalSearch);
    }
  }, [externalSearch]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // The bytes of a proof are not carried by the ledger list, so the document is
  // fetched and opened one payment at a time.
  const openProof = async (row) => {
    try {
      await paymentApi.openProofDocument(row.paymentId || row.id || row.invoiceNumber);
    } catch (err) {
      toast.error(err.message || 'Could not open the proof document.');
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = searchQuery.toLowerCase();
      const nameStr = (p.name || p.customer || '').toLowerCase();
      const accountStr = (p.accountName || p.company || '').toLowerCase();
      const invNumStr = (p.invoiceNumber || p.invoiceRef || '').toLowerCase();
      const methodStr = (p.paymentMethod || p.method || '').toLowerCase();
      const statusStr = (p.status || '').toLowerCase();
      const referenceStr = String(p.referenceNumber || '').toLowerCase();

      const matchesSearch =
        !q ||
        nameStr.includes(q) ||
        accountStr.includes(q) ||
        invNumStr.includes(q) ||
        methodStr.includes(q) ||
        referenceStr.includes(q) ||
        p.id.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' || statusStr === statusFilter.toLowerCase();

      const matchesDateRange = isWithinDateRange(
        getFilterDate(p),
        dateFrom,
        dateTo
      );

      return matchesSearch && matchesStatus && matchesDateRange;
    }).sort((a, b) => {
      const dateA = new Date(a.invoiceDate || a.date || a.createdAt || 0).getTime();
      const dateB = new Date(b.invoiceDate || b.date || b.createdAt || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });
  }, [payments, searchQuery, statusFilter, dateFrom, dateTo]);

  const columns = [
    {
      id: 'name',
      name: 'Name',
      selector: (row) => getName(row),
      sortable: true,
      sortFunction: compareText(getName),
      minWidth: '190px',
      grow: 1.1,
      cell: (p) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{getName(p)}</div>
          <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#6366f1' }}>
            {p.id}
          </div>
        </div>
      )
    },
    {
      id: 'accountName',
      name: 'Account Name',
      selector: (row) => getAccount(row),
      sortable: true,
      sortFunction: compareText(getAccount),
      minWidth: '170px',
      grow: 1,
      cell: (p) => <span style={{ fontWeight: 600, color: '#1e293b' }}>{getAccount(p)}</span>
    },
    {
      id: 'invoiceNumber',
      name: 'Invoice Number',
      selector: (row) => getInvoiceNumber(row),
      sortable: true,
      sortFunction: compareText(getInvoiceNumber),
      minWidth: '150px',
      cell: (p) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.84rem', color: '#334155' }}>
          {getInvoiceNumber(p)}
        </span>
      )
    },
    {
      id: 'invoiceDate',
      name: 'Invoice Date',
      selector: (row) => getInvoiceDate(row),
      sortable: true,
      sortFunction: compareDate(getInvoiceDate),
      width: '130px',
      cell: (p) => (
        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{getInvoiceDate(p)}</span>
      )
    },
    {
      id: 'receivedAmount',
      name: 'Received Amount',
      selector: (row) => getReceivedAmount(row),
      sortable: true,
      sortFunction: compareNumber(getReceivedAmount),
      width: '150px',
      cell: (p) => (
        <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.92rem' }}>
          {getReceivedAmount(p)}
        </span>
      )
    },
    {
      id: 'pendingPayment',
      name: 'Pending Payment',
      selector: (row) => getPending(row),
      sortable: true,
      sortFunction: compareNumber(getPending),
      width: '150px',
      cell: (p) => (
        <span
          style={{
            fontWeight: 600,
            color: getPending(p) === '₹0' ? '#94a3b8' : '#d97706',
            fontSize: '0.88rem'
          }}
        >
          {getPending(p)}
        </span>
      )
    },
    {
      id: 'expectedPaymentDate',
      name: 'Expected Payment Date',
      selector: (row) => getExpectedDate(row),
      sortable: true,
      sortFunction: compareDate(getExpectedDate),
      width: '150px',
      cell: (p) => (
        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{getExpectedDate(p)}</span>
      )
    },
    {
      id: 'paymentReceivedDate',
      name: 'Payment Received Date',
      selector: (row) => getReceivedDate(row),
      sortable: true,
      sortFunction: compareDate(getReceivedDate),
      width: '155px',
      cell: (p) => (
        <span style={{ fontSize: '0.82rem', color: '#334155' }}>{getReceivedDate(p)}</span>
      )
    },
    {
      id: 'paymentMethod',
      name: 'Payment Method',
      selector: (row) => getMethod(row),
      sortable: true,
      sortFunction: compareText(getMethod),
      width: '150px',
      cell: (p) => <span className="adm-status-pill info">{getMethod(p)}</span>
    },
    {
      id: 'reference',
      name: 'Bank Reference',
      selector: (row) => getReference(row),
      sortable: true,
      sortFunction: compareText(getReference),
      width: '190px',
      cell: (p) =>
        getReference(p) || getBank(p) ? (
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#334155' }}>
              {getReference(p) || '—'}
            </div>
            {getBank(p) && (
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{getBank(p)}</div>
            )}
          </div>
        ) : (
          <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Online payment</span>
        )
    },
    {
      id: 'proof',
      name: 'Proof',
      selector: () => '',
      sortable: false,
      width: '120px',
      center: true,
      ignoreRowClick: true,
      searchable: false,
      cell: (p) =>
        getProof(p) ? (
          <button
            type="button"
            className="adm-action-pill"
            title={`${getProof(p).fileName} (${proofSize(getProof(p).sizeBytes)})`}
            onClick={() => openProof(p)}
          >
            <Paperclip size={12} />
            <span>Open</span>
          </button>
        ) : (
          <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>—</span>
        )
    },
    {
      id: 'status',
      name: 'Status',
      selector: (row) => row.status,
      sortable: true,
      sortFunction: compareText((row) => row.status),
      width: '135px',
      cell: (p) => {
        const isSettled = p.status === 'Received' || p.status === 'Cleared';
        const isPartial = p.status === 'Partially Paid' || p.status === 'Partial';
        return (
          <span
            className={`adm-status-pill ${isSettled ? 'active' : p.status === 'Overdue' ? 'demo' : 'pending'}`}
            style={isPartial ? { background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' } : undefined}
          >
            {isSettled && <CheckCircle2 size={12} />}
            {!isSettled && <Clock size={12} />}
            <span style={{ textTransform: 'capitalize' }}>{p.status}</span>
          </span>
        );
      },
      searchType: 'select',
      searchOptions: [
        { value: 'Received', label: 'Received' },
        { value: 'Cleared', label: 'Cleared' },
        { value: 'Partially Paid', label: 'Partially Paid' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Overdue', label: 'Overdue' },
      ]
    },
    {
      id: 'actions',
      name: 'Action',
      center: true,
      width: '130px',
      button: true,
      allowOverflow: true,
      searchable: false,
      ignoreRowClick: true,
      cell: (p) => (
        <button
          type="button"
          className="adm-action-pill"
          onClick={() => {
            toast.success(`Opening receipt for ${getInvoiceNumber(p)}`);
            if (onGoToReceipt) onGoToReceipt();
          }}
        >
          Receipt
        </button>
      )
    }
  ];

  return (
    <div className="adm-table-card">
      {/* 1. Header with Title on Left and Export Action on Right */}
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <h1 className="adm-section-title">Payment List</h1>
          <p className="adm-section-sub">
            View and track all customer payments and transactions.
          </p>
        </div>

        <div className="adm-card-header-action">
          {can('manual_payment') && (
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={() => navigate('/admin/manual-payment')}
            >
              <Landmark size={15} />
              <span>Manual Payment</span>
            </button>
          )}
          <ExportDropdown
            data={filteredPayments}
            formatter={formatPaymentsForExport}
            fileName="NISPL_Payments"
            itemLabel="payments"
          />
        </div>
      </div>

      {/* 2. Filter / Search Toolbar */}
      <div className="adm-table-toolbar">
        <div className="adm-search-box adm-search-box-toolbar">
          <Search size={16} className="adm-search-icon" />
          <input
            type="text"
            placeholder="Search by name, account, invoice, method..."
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
              options={[
                { value: 'all', label: `All Settlements (${payments.length})` },
                { value: 'paid', label: 'Settled / Paid' },
                { value: 'partial', label: 'Partially Settled' },
                { value: 'pending', label: 'Pending Bank Clearance' }
              ]}
              value={{
                value: statusFilter,
                label:
                  statusFilter === 'all'
                    ? `All Settlements (${payments.length})`
                    : statusFilter === 'paid'
                    ? 'Settled / Paid'
                    : statusFilter === 'partial'
                    ? 'Partially Settled'
                    : 'Pending Bank Clearance'
              }}
              onChange={(opt) => setStatusFilter(opt ? opt.value : 'all')}
              classNamePrefix="react-select"
            />
          </div>
        </div>
      </div>

      {/* 3. React DataTable */}
      <AdminDataTable
        columns={visibleColumns('payment', columns)}
        data={filteredPayments}
        keyField="id"
        defaultSortFieldId="invoiceDate"
        defaultSortAsc={false}
        resetPageToken={`${searchQuery}|${statusFilter}|${dateFrom}|${dateTo}`}
        minWidth={2060}
        noDataMessage="No payment records found"
        noDataHint="Try a different search term or settlement filter."
        ariaLabel="Customer payments"
        scrollHeight="600px"
      />
    </div>
  );
}
