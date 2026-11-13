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
const getProductName = (row) => row.items?.[0]?.name || row.solutionCategory || row.productName || '—';
const getInvoiceNumber = (row) => row.invoiceNumber || row.invoiceRef || '—';
const getInvoiceDate = (row) => row.invoiceDate || row.date || '—';
const getReceivedAmount = (row) => row.receivedAmount || row.amount || '—';
const getPending = (row) => row.pendingPayment || '₹0';
const getTaxableAmount = (row) => row.taxableAmount || '—';
const getGstAmount = (row) => row.gstAmount || '—';
const getExpectedDate = (row) => row.expectedPaymentDate || '—';
const getReceivedDate = (row) => row.paymentReceivedDate || row.date || '—';
const getMethod = (row) => row.paymentMethod || row.method || '—';
const getReference = (row) => row.referenceNumber || row.chequeNumber || row.utrNumber || '';
const getBank = (row) => row.bankName || row.bank || '';
const getDepositDate = (row) => row.depositDate || row.realisationDate || '';
const getSalesPerson = (row) => row.salesPerson || row.staff || '';
const getNotes = (row) => row.notes || '';
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
      const referenceStr = String(p.referenceNumber || p.chequeNumber || p.utrNumber || '').toLowerCase();
      const bankStr = String(p.bankName || p.bank || '').toLowerCase();
      const salesPersonStr = String(p.salesPerson || p.staff || '').toLowerCase();
      const productStr = String(p.items?.[0]?.name || p.solutionCategory || p.productName || '').toLowerCase();
      const notesStr = String(p.notes || '').toLowerCase();

      const matchesSearch =
        !q ||
        nameStr.includes(q) ||
        accountStr.includes(q) ||
        invNumStr.includes(q) ||
        methodStr.includes(q) ||
        statusStr.includes(q) ||
        referenceStr.includes(q) ||
        bankStr.includes(q) ||
        salesPersonStr.includes(q) ||
        productStr.includes(q) ||
        notesStr.includes(q) ||
        String(p.id || '').toLowerCase().includes(q);

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
      minWidth: '180px',
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
      minWidth: '160px',
      grow: 1,
      cell: (p) => <span style={{ fontWeight: 600, color: '#1e293b' }}>{getAccount(p)}</span>
    },
    {
      id: 'productName',
      name: 'Product / Plan',
      selector: (row) => getProductName(row),
      sortable: true,
      sortFunction: compareText(getProductName),
      minWidth: '160px',
      cell: (p) => (
        <span style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 500 }}>
          {getProductName(p)}
        </span>
      )
    },
    {
      id: 'invoiceNumber',
      name: 'Invoice Number',
      selector: (row) => getInvoiceNumber(row),
      sortable: true,
      sortFunction: compareText(getInvoiceNumber),
      minWidth: '140px',
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
      width: '120px',
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
      minWidth: '150px',
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
      minWidth: '150px',
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
      id: 'taxableAmount',
      name: 'Taxable Amount',
      selector: (row) => getTaxableAmount(row),
      sortable: true,
      sortFunction: compareNumber(getTaxableAmount),
      minWidth: '140px',
      cell: (p) => (
        <span style={{ fontSize: '0.84rem', color: '#475569' }}>
          {getTaxableAmount(p)}
        </span>
      )
    },
    {
      id: 'gstAmount',
      name: 'GST Amount',
      selector: (row) => getGstAmount(row),
      sortable: true,
      sortFunction: compareNumber(getGstAmount),
      minWidth: '130px',
      cell: (p) => (
        <span style={{ fontSize: '0.84rem', color: '#475569' }}>
          {getGstAmount(p)}
        </span>
      )
    },
    {
      id: 'expectedPaymentDate',
      name: 'Expected Payment Date',
      selector: (row) => getExpectedDate(row),
      sortable: true,
      sortFunction: compareDate(getExpectedDate),
      minWidth: '160px',
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
      minWidth: '165px',
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
      minWidth: '200px',
      cell: (p) => {
        const method = getMethod(p);
        if (!method || method === '—') {
          return <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>—</span>;
        }
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#4338ca',
              background: '#eef2ff',
              border: '1px solid #c7d2fe',
              whiteSpace: 'nowrap',
              width: 'fit-content',
              maxWidth: 'none'
            }}
          >
            {method}
          </span>
        );
      }
    },
    {
      id: 'referenceNumber',
      name: 'Cheque / Ref No.',
      selector: (row) => getReference(row),
      sortable: true,
      sortFunction: compareText(getReference),
      minWidth: '180px',
      cell: (p) => {
        const ref = getReference(p);
        if (!ref) {
          return <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>—</span>;
        }
        return (
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#334155',
              background: '#f1f5f9',
              padding: '2px 7px',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            {ref}
          </span>
        );
      }
    },
    {
      id: 'bankName',
      name: 'Bank / Branch',
      selector: (row) => getBank(row),
      sortable: true,
      sortFunction: compareText(getBank),
      minWidth: '180px',
      cell: (p) => {
        const bank = getBank(p);
        return bank ? (
          <span style={{ fontSize: '0.84rem', color: '#1e293b', fontWeight: 500 }}>{bank}</span>
        ) : (
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>—</span>
        );
      }
    },
    {
      id: 'depositDate',
      name: 'Realisation Date',
      selector: (row) => getDepositDate(row),
      sortable: true,
      sortFunction: compareDate(getDepositDate),
      minWidth: '150px',
      cell: (p) => (
        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
          {getDepositDate(p) || '—'}
        </span>
      )
    },
    {
      id: 'salesPerson',
      name: 'Sales Person',
      selector: (row) => getSalesPerson(row),
      sortable: true,
      sortFunction: compareText(getSalesPerson),
      minWidth: '190px',
      cell: (p) => (
        <span style={{ fontSize: '0.82rem', color: getSalesPerson(p) ? '#0f172a' : '#94a3b8', fontWeight: getSalesPerson(p) ? 500 : 400 }}>
          {getSalesPerson(p) || '—'}
        </span>
      )
    },
    {
      id: 'notes',
      name: 'Remarks / Notes',
      selector: (row) => getNotes(row),
      sortable: true,
      sortFunction: compareText(getNotes),
      minWidth: '180px',
      cell: (p) => (
        <span
          style={{
            fontSize: '0.8rem',
            color: '#64748b',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
          title={getNotes(p)}
        >
          {getNotes(p) || '—'}
        </span>
      )
    },
    {
      id: 'proof',
      name: 'Proof',
      selector: () => '',
      sortable: false,
      width: '110px',
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
        return (
          <span className={`adm-status-pill ${isSettled ? 'active' : p.status === 'Overdue' ? 'demo' : 'pending'}`}>
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
        { value: 'Pending', label: 'Pending' },
        { value: 'Overdue', label: 'Overdue' },
      ]
    },
    {
      id: 'actions',
      name: 'Action',
      center: true,
      width: '110px',
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
        minWidth={3000}
        noDataMessage="No payment records found"
        noDataHint="Try a different search term or settlement filter."
        ariaLabel="Customer payments"
        scrollHeight="600px"
      />
    </div>
  );
}
