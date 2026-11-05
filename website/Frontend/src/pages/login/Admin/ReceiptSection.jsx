import React, { useState, useMemo } from 'react';
import { Check, Search, X } from 'lucide-react';
import Select from 'react-select';
import { compactSelectStyles } from './reactSelectStyles';
import ExportDropdown from './ExportDropdown';
import { formatReceiptsForExport } from './exportUtils';
import AdminDataTable from './AdminDataTable';
import DateRangeFilter from './DateRangeFilter';
import RowActionMenu from './RowActionMenu';
import ViewReceiptModal from './ViewReceiptModal';
import { usePermissions } from './PermissionsContext';
import { generateReceiptPdf } from '../../Dashboard/utils/generateReceiptPdf';
import { compareDate, compareNumber, compareText, isWithinDateRange, toReceiptPdfRow } from './adminTableUtils';

const inr = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const prettyDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// A row is a payment on the ledger with its account, subscription and product
// joined server-side, so the table only formats what the API already resolved.
const searchBlob = (row) =>
  [
    row.id,
    row.invoiceNumber,
    row.paymentId,
    row.customer?.company,
    row.customer?.name,
    row.customer?.email,
    row.productName,
    row.product?.sku,
    row.contract?.id,
    row.contract?.name,
    row.term?.period,
    row.salesPerson,
    row.paymentMode,
    row.status
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const STATUS_TONES = {
  received: '#059669',
  cleared: '#059669',
  pending: '#d97706',
  overdue: '#dc2626'
};

export default function ReceiptSection({ receipts }) {
  const { visibleColumns } = usePermissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewing, setViewing] = useState(null);

  const statusOptions = useMemo(() => {
    const counts = new Map();
    receipts.forEach((r) => {
      const key = String(r.status || '').trim() || 'Unknown';
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return [
      { value: 'all', label: `All statuses (${receipts.length})` },
      ...[...counts.entries()].map(([value, count]) => ({
        value,
        label: `${value} (${count})`
      }))
    ];
  }, [receipts]);

  const filteredReceipts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return receipts
      .filter((r) => {
        const matchesSearch = !q || searchBlob(r).includes(q);
        const matchesStatus =
          statusFilter === 'all' || String(r.status || '').toLowerCase() === statusFilter.toLowerCase();
        const matchesDateRange = isWithinDateRange(r.date, dateFrom, dateTo);
        return matchesSearch && matchesStatus && matchesDateRange;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        if (dateB !== dateA) return dateB - dateA;
        return String(b.id || '').localeCompare(String(a.id || ''));
      });
  }, [receipts, searchQuery, statusFilter, dateFrom, dateTo]);

  const columns = [
    {
      id: 'id',
      name: 'Receipt / Invoice',
      selector: (row) => row.id,
      sortable: true,
      sortFunction: compareText((row) => row.invoiceNumber || row.id),
      minWidth: '150px',
      cell: (r) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6366f1' }}>
          {r.invoiceNumber || r.id}
        </span>
      )
    },
    {
      id: 'customer',
      name: 'Customer',
      selector: (row) => row.customer?.company,
      sortable: true,
      sortFunction: compareText((row) => row.customer?.company || row.customer?.name),
      minWidth: '200px',
      grow: 1.2,
      cell: (r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.customer?.company || r.customer?.name || '—'}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
            {r.customer?.name || r.customer?.email || 'Not on record'}
          </div>
        </div>
      )
    },
    {
      id: 'product',
      name: 'Product / Plan',
      selector: (row) => row.productName,
      sortable: true,
      sortFunction: compareText((row) => row.productName),
      minWidth: '190px',
      grow: 1,
      cell: (r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.productName || '—'}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
            {[r.product?.sku, r.product?.provider, r.product?.category].filter(Boolean).join(' • ') ||
              'No catalogue match'}
          </div>
        </div>
      )
    },
    {
      id: 'salesPerson',
      name: 'Sales Person',
      selector: (row) => row.salesPerson,
      sortable: true,
      sortFunction: compareText((row) => row.salesPerson),
      minWidth: '150px',
      cell: (r) => (
        <span style={{ fontSize: '0.82rem', color: r.salesPerson ? '#0f172a' : '#94a3b8' }}>
          {r.salesPerson || 'Not recorded'}
        </span>
      )
    },
    {
      id: 'contract',
      name: 'Subscription',
      selector: (row) => row.contract?.id || row.term?.period || '',
      sortable: true,
      sortFunction: compareText((row) => row.contract?.id || row.term?.period || ''),
      minWidth: '150px',
      cell: (r) =>
        r.contract ? (
          <div title={r.contractLink || undefined}>
            <div style={{ fontFamily: 'monospace', fontSize: '0.76rem', fontWeight: 700, color: '#6366f1' }}>
              {r.contract.id}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {[r.contract.type, r.contract.subscriptionPeriod].filter(Boolean).join(' • ')}
            </div>
          </div>
        ) : r.term ? (
          // A portal purchase settles without a Contract row, but the payment
          // itself says what term was bought — that is what the admin needs.
          <div
            title={
              r.term.derived
                ? `Validity measured from the ${r.term.period} billing cycle; no term was recorded on this payment`
                : 'No contract record for this payment'
            }
          >
            <div style={{ fontWeight: 600, fontSize: '0.78rem' }}>
              {r.term.period ||
                (r.term.months
                  ? `${r.term.months} month${r.term.months === 1 ? '' : 's'}`
                  : 'Term recorded')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {[r.term.startDate, r.term.endDate].filter(Boolean).join(' → ') || 'No contract on record'}
            </div>
          </div>
        ) : (
          <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Unlinked</span>
        )
    },
    {
      id: 'baseAmount',
      name: 'Taxable Value',
      selector: (row) => row.baseAmount,
      sortable: true,
      sortFunction: compareNumber((row) => row.baseAmount),
      width: '140px',
      right: true,
      cell: (r) => <span style={{ color: '#64748b' }}>{inr(r.baseAmount)}</span>
    },
    {
      id: 'taxAmount',
      name: '18% GST',
      selector: (row) => row.taxAmount,
      sortable: true,
      sortFunction: compareNumber((row) => row.taxAmount),
      width: '130px',
      right: true,
      cell: (r) => <span style={{ color: '#64748b' }}>{inr(r.taxAmount)}</span>
    },
    {
      id: 'amount',
      name: 'Total Paid',
      selector: (row) => row.amount,
      sortable: true,
      sortFunction: compareNumber((row) => row.amount),
      width: '140px',
      right: true,
      cell: (r) => (
        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>{inr(r.amount)}</span>
      )
    },
    {
      id: 'date',
      name: 'Paid On',
      selector: (row) => row.date,
      sortable: true,
      sortFunction: compareDate((row) => row.date),
      width: '125px',
      cell: (r) => <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{prettyDate(r.date)}</span>
    },
    {
      id: 'mode',
      name: 'Payment Channel',
      selector: (row) => row.paymentMode,
      sortable: true,
      sortFunction: compareText((row) => row.paymentMode),
      width: '165px',
      cell: (r) => (
        <div>
          <div style={{ fontSize: '0.82rem' }}>{r.paymentMode || '—'}</div>
          {r.source ? (
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              {r.source === 'gateway' ? 'Razorpay gateway' : r.source}
            </div>
          ) : null}
        </div>
      )
    },
    {
      id: 'status',
      name: 'Status',
      selector: (row) => row.status,
      sortable: true,
      sortFunction: compareText((row) => row.status),
      width: '150px',
      cell: (r) => (
        <span
          className="adm-status-pill"
          style={{
            color: STATUS_TONES[String(r.status || '').toLowerCase()] || '#64748b',
            background: '#f1f5f9'
          }}
        >
          <Check size={12} />
          <span style={{ textTransform: 'capitalize' }}>{r.status || 'Unknown'}</span>
        </span>
      )
    },
    {
      id: 'actions',
      name: 'Actions',
      center: true,
      width: '110px',
      button: true,
      allowOverflow: true,
      searchable: false,
      ignoreRowClick: true,
      cell: (r) => (
        <RowActionMenu
          onView={() => setViewing(r)}
          onPrint={() => generateReceiptPdf(toReceiptPdfRow(r), r.customer || {})}
        />
      )
    }
  ];

  const activeOption =
    statusOptions.find((o) => o.value.toLowerCase() === statusFilter.toLowerCase()) || statusOptions[0];

  return (
    <div className="adm-table-card">
      {/* 1. Header with Title on Left and Export Action on Right */}
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <h1 className="adm-section-title">Customer Payment Receipts</h1>
          <p className="adm-section-sub">
            Every payment on the ledger with its customer, subscription, product and GST split.
          </p>
        </div>

        <div className="adm-card-header-action">
          <ExportDropdown
            data={filteredReceipts}
            formatter={formatReceiptsForExport}
            fileName="NISPL_Receipts"
            itemLabel="receipts"
          />
        </div>
      </div>

      {/* 2. Filter / Search Toolbar */}
      <div className="adm-table-toolbar">
        <div className="adm-search-box adm-search-box-toolbar">
          <Search size={16} className="adm-search-icon" />
          <input
            type="text"
            placeholder="Search by receipt no, firm, client, product..."
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
              options={statusOptions}
              value={activeOption}
              onChange={(opt) => setStatusFilter(opt ? opt.value : 'all')}
              classNamePrefix="react-select"
            />
          </div>
        </div>
      </div>

      {/* 3. React DataTable */}
      <AdminDataTable
        columns={visibleColumns('receipt', columns)}
        data={filteredReceipts}
        keyField="id"
        defaultSortFieldId="date"
        defaultSortAsc={false}
        resetPageToken={`${searchQuery}|${statusFilter}|${dateFrom}|${dateTo}`}
        minWidth={1600}
        noDataMessage="No payment receipts found"
        noDataHint="Payments appear here as soon as they are recorded on the ledger."
        ariaLabel="Customer payment receipts"
        scrollHeight="600px"
      />

      <ViewReceiptModal receipt={viewing} isOpen={Boolean(viewing)} onClose={() => setViewing(null)} />
    </div>
  );
}
