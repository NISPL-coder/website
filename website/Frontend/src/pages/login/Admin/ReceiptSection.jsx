import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Check, ReceiptText, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { compactSelectStyles } from './reactSelectStyles';
import ExportDropdown from './ExportDropdown';
import { formatReceiptsForExport } from './exportUtils';
import AdminDataTable from './AdminDataTable';
import DateRangeFilter from './DateRangeFilter';
import { compareDate, compareNumber, compareText, isWithinDateRange } from './adminTableUtils';

export default function ReceiptSection({ receipts, setReceipts, payments }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q) ||
        r.mode.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' || r.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesDateRange = isWithinDateRange(
        r.date || r.issueDate || r.issuedAt || r.createdAt,
        dateFrom,
        dateTo
      );

      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [receipts, searchQuery, statusFilter, dateFrom, dateTo]);

  const columns = [
    {
      id: 'id',
      name: 'Receipt No',
      selector: (row) => row.id,
      sortable: true,
      sortFunction: compareText((row) => row.id),
      minWidth: '150px',
      cell: (r) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6366f1' }}>{r.id}</span>
      )
    },
    {
      id: 'company',
      name: 'Billed Organization',
      selector: (row) => row.company,
      sortable: true,
      sortFunction: compareText((row) => row.company),
      minWidth: '210px',
      grow: 1.2,
      cell: (r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.company}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{r.customer}</div>
        </div>
      )
    },
    {
      id: 'baseAmount',
      name: 'Taxable Base',
      selector: (row) => row.baseAmount,
      sortable: true,
      sortFunction: compareNumber((row) => row.baseAmount),
      width: '140px',
      cell: (r) => <span style={{ color: '#64748b' }}>{r.baseAmount}</span>
    },
    {
      id: 'taxAmount',
      name: '18% GST',
      selector: (row) => row.taxAmount,
      sortable: true,
      sortFunction: compareNumber((row) => row.taxAmount),
      width: '130px',
      cell: (r) => <span style={{ color: '#64748b' }}>{r.taxAmount}</span>
    },
    {
      id: 'amount',
      name: 'Total Paid',
      selector: (row) => row.amount,
      sortable: true,
      sortFunction: compareNumber((row) => row.amount),
      width: '140px',
      cell: (r) => (
        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>{r.amount}</span>
      )
    },
    {
      id: 'date',
      name: 'Issue Date',
      selector: (row) => row.date,
      sortable: true,
      sortFunction: compareDate((row) => row.date),
      width: '125px',
      cell: (r) => <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{r.date}</span>
    },
    {
      id: 'mode',
      name: 'Payment Channel',
      selector: (row) => row.mode,
      sortable: true,
      sortFunction: compareText((row) => row.mode),
      width: '165px',
      cell: (r) => <span>{r.mode}</span>
    },
    {
      id: 'status',
      name: 'Dispatch Status',
      selector: (row) => row.status,
      sortable: true,
      sortFunction: compareText((row) => row.status),
      width: '165px',
      cell: (r) => (
        <span className="adm-status-pill active">
          <Check size={12} />
          <span style={{ textTransform: 'capitalize' }}>{r.status}</span>
        </span>
      ),
      searchType: 'select',
      searchOptions: ['delivered', 'dispatched'].map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))
    },
    {
      id: 'actions',
      name: 'Actions',
      center: true,
      width: '130px',
      button: true,
      allowOverflow: true,
      searchable: false,
      ignoreRowClick: true,
      cell: (r) => (
        <button
          type="button"
          className="adm-action-pill"
          onClick={() => toast.success(`Receipt ${r.id} downloaded successfully.`)}
        >
          <Download size={13} />
          <span>PDF</span>
        </button>
      )
    }
  ];

  return (
    <div className="adm-table-card">
      {/* 1. Header with Title on Left and Export Action on Right */}
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <h1 className="adm-section-title">
            Customer Payment Receipts
          </h1>
          <p className="adm-section-sub">
            View, dispatch via WhatsApp/Email, and download certified GST payment receipts.
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
            placeholder="Search by receipt no, firm, client..."
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
                { value: 'all', label: `All Dispatches (${receipts.length})` },
                { value: 'delivered', label: 'Delivered to Client' },
                { value: 'dispatched', label: 'Dispatched (Email/WA)' }
              ]}
              value={{
                value: statusFilter,
                label:
                  statusFilter === 'all'
                    ? `All Dispatches (${receipts.length})`
                    : statusFilter === 'delivered'
                    ? 'Delivered to Client'
                    : 'Dispatched (Email/WA)'
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
        data={filteredReceipts}
        keyField="id"
        defaultSortFieldId="id"
        defaultSortAsc
        resetPageToken={`${searchQuery}|${statusFilter}|${dateFrom}|${dateTo}`}
        minWidth={1450}
        noDataMessage="No payment receipts found"
        noDataHint="Try a different search term or dispatch filter."
        ariaLabel="Customer payment receipts"
      />
    </div>
  );
}
