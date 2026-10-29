import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckCircle2, CreditCard, X, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTableSort, SortableTh } from './tableSortUtils';

export default function PaymentSection({ payments, setPayments, contracts, onGoToReceipt }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.company.toLowerCase().includes(q) ||
        p.customer.toLowerCase().includes(q) ||
        p.invoiceRef.toLowerCase().includes(q) ||
        p.method.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' || p.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [payments, searchQuery, statusFilter]);

  // Multi-column Ascending/Descending Sorting Hook
  const { sortedItems: sortedPayments, sortConfig, requestSort } = useTableSort(
    filteredPayments,
    'date',
    'desc'
  );

  return (
    <div className="adm-table-card">
      {/* 1. Header with Title on Left and Primary Action Button on Right */}
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <h1 className="adm-section-title">
            Customer Payment Records &amp; Transactions
          </h1>
          <p className="adm-section-sub">
            Live incoming corporate subscription payments, bank transfers, invoice references, and gateway logs.
          </p>
        </div>

        <div className="adm-card-header-action">
          <button
            type="button"
            className="adm-btn-primary"
            onClick={() => navigate('/admin/customer/payment/create')}
          >
            <Plus size={16} />
            <span>Record Payment</span>
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
              placeholder="Search by ID, company, invoice..."
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
            <option value="all">All Settlements ({payments.length})</option>
            <option value="paid">Settled / Paid</option>
            <option value="pending">Pending Bank Clearance</option>
          </select>
        </div>

        <div className="adm-table-record-count">
          Showing <strong>{filteredPayments.length}</strong> of <strong>{payments.length}</strong> transactions
        </div>
      </div>

      {/* 3. Table with Vertical & Horizontal Scrolling */}
      <div className="adm-table-responsive">
        <table className="adm-table" style={{ minWidth: '1000px' }}>
          <thead>
            <tr>
              <SortableTh
                label="Transaction ID"
                sortKey="id"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Customer & Firm"
                sortKey="company"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Amount Received"
                sortKey="amount"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Payment Channel"
                sortKey="method"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Payment Timestamp"
                sortKey="date"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Invoice Reference"
                sortKey="invoiceRef"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Settlement Status"
                sortKey="status"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedPayments.length > 0 ? (
              sortedPayments.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.company}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.customer}</div>
                  </td>
                  <td style={{ fontWeight: 700, color: '#059669', fontSize: '0.92rem' }}>
                    {p.amount}
                  </td>
                  <td>
                    <span className="adm-status-pill info">{p.method}</span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.date}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{p.invoiceRef}</td>
                  <td>
                    <span
                      className={`adm-status-pill ${
                        p.status === 'paid' ? 'active' : 'pending'
                      }`}
                    >
                      <CheckCircle2 size={12} />
                      <span style={{ textTransform: 'capitalize' }}>{p.status}</span>
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="adm-action-pill"
                      onClick={() => {
                        toast.success(`Receipt for ${p.id} opened`);
                        if (onGoToReceipt) onGoToReceipt();
                      }}
                    >
                      Receipt
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b' }}>
                  No payment transactions found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Table Footer */}
      <div className="adm-table-footer">
        <span>Instant RTGS / NEFT automatic reconciliations synced with ERP</span>
        <span style={{ fontWeight: 600, color: '#059669' }}>
          Total Settled: {payments.filter(p => p.status === 'paid').length} Transactions
        </span>
      </div>
    </div>
  );
}

