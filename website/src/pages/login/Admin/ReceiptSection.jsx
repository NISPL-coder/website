import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Check, ReceiptText, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTableSort, SortableTh } from './tableSortUtils';

export default function ReceiptSection({ receipts, setReceipts, payments }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

      return matchesSearch && matchesStatus;
    });
  }, [receipts, searchQuery, statusFilter]);

  // Multi-column Ascending/Descending Sorting Hook
  const { sortedItems: sortedReceipts, sortConfig, requestSort } = useTableSort(
    filteredReceipts,
    'id',
    'asc'
  );

  return (
    <div className="adm-table-card">
      {/* 1. Header with Title on Left and Primary Action Button on Right */}
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <h1 className="adm-section-title">
            Customer Payment Receipts
          </h1>
          <p className="adm-section-sub">
            View, generate, dispatch via WhatsApp/Email, and download certified GST payment receipts.
          </p>
        </div>

        <div className="adm-card-header-action">
          <button
            type="button"
            className="adm-btn-primary"
            onClick={() => navigate('/admin/receipt/create')}
          >
            <Plus size={16} />
            <span>Generate Receipt</span>
          </button>
        </div>
      </div>

      {/* 2. Filter / Search Toolbar */}
      <div className="adm-table-toolbar">
        <div className="adm-table-filters">
          <div className="adm-search-box" style={{ width: '280px' }}>
            <Search size={15} className="adm-search-icon" />
            <input
              type="text"
              placeholder="Search by receipt no, firm, client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="adm-search-input"
              style={{ width: '100%', height: '36px' }}
            />
          </div>

          <select
            className="adm-select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Dispatches ({receipts.length})</option>
            <option value="delivered">Delivered to Client</option>
            <option value="dispatched">Dispatched (Email/WA)</option>
          </select>
        </div>

        <div className="adm-table-record-count">
          Showing <strong>{filteredReceipts.length}</strong> of <strong>{receipts.length}</strong> tax receipts
        </div>
      </div>

      {/* 3. Table with Vertical & Horizontal Scrolling */}
      <div className="adm-table-responsive">
        <table className="adm-table" style={{ minWidth: '1050px' }}>
          <thead>
            <tr>
              <SortableTh
                label="Receipt No"
                sortKey="id"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Billed Organization"
                sortKey="company"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Taxable Base"
                sortKey="baseAmount"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="18% GST"
                sortKey="taxAmount"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Total Paid"
                sortKey="amount"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Issue Date"
                sortKey="date"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Payment Channel"
                sortKey="mode"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Dispatch Status"
                sortKey="status"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedReceipts.length > 0 ? (
              sortedReceipts.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6366f1' }}>
                    {r.id}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    <div>{r.company}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{r.customer}</div>
                  </td>
                  <td style={{ color: '#64748b' }}>{r.baseAmount}</td>
                  <td style={{ color: '#64748b' }}>{r.taxAmount}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                    {r.amount}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{r.date}</td>
                  <td>{r.mode}</td>
                  <td>
                    <span className="adm-status-pill active">
                      <Check size={12} />
                      <span style={{ textTransform: 'capitalize' }}>{r.status}</span>
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="adm-action-pill"
                      onClick={() =>
                        toast.success(`Receipt ${r.id} downloaded successfully.`)
                      }
                    >
                      <Download size={13} />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b' }}>
                  No payment receipts match your search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Table Footer */}
      <div className="adm-table-footer">
        <span>GST Compliant Invoices &amp; Digital Invoicing E-Way integration</span>
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          Total Issued Receipts: {receipts.length}
        </span>
      </div>
    </div>
  );
}

