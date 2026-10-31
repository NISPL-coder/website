import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Printer, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Plus
} from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import './TransactionsTable.css';

export default function TransactionsTable({ 
  transactions, 
  onViewInvoice, 
  onToggleStatus, 
  onCreateInvoice 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('date'); // 'date', 'amount', 'party', 'invoiceNo'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter & Search logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = 
        t.party.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.gstin && t.gstin.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = typeFilter === 'All' || t.type.toLowerCase() === typeFilter.toLowerCase();
      const matchesStatus = statusFilter === 'All' || t.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [transactions, searchQuery, typeFilter, statusFilter]);

  // Sort logic
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      if (typeof valA === 'string') {
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return 0;
    });
  }, [filteredTransactions, sortField, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedTransactions.slice(start, start + itemsPerPage);
  }, [sortedTransactions, currentPage, itemsPerPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="nis-transactions-card">
      
      {/* Top Header & Search / Filter Controls */}
      <div className="table-header-block">
        <div>
          <div className="table-title-row">
            <h3 className="table-main-title">Recent Transactions & Vouchers</h3>
            <span className="badge badge-primary">{sortedTransactions.length} Total</span>
          </div>
          <p className="table-sub-text">Day book entries, GST sales invoices, vendor purchases & bank vouchers</p>
        </div>

        {/* Action Button: Create New Invoice */}
        <button 
          type="button" 
          className="btn-create-invoice"
          onClick={onCreateInvoice}
        >
          <Plus size={16} />
          <span>+ Create Invoice</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="table-controls-bar">
        {/* Search Input */}
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by invoice no, party name, or GSTIN..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="search-input"
          />
        </div>

        {/* Filters */}
        <div className="filters-group">
          {/* Type Filter */}
          <div className="filter-select-wrapper">
            <label className="filter-label">Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="filter-select"
            >
              <option value="All">All Types</option>
              <option value="Sales">Sales</option>
              <option value="Purchase">Purchase</option>
              <option value="Receipt">Receipt</option>
              <option value="Payment">Payment</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-select-wrapper">
            <label className="filter-label">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="filter-select"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container (Horizontally Scrollable on Mobile) */}
      <div className="table-responsive-container">
        <table className="nis-data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('date')} className="sortable-th">
                <div className="th-content">
                  <span>Date</span>
                  <ArrowUpDown size={13} />
                </div>
              </th>
              <th onClick={() => handleSort('invoiceNo')} className="sortable-th">
                <div className="th-content">
                  <span>Invoice No.</span>
                  <ArrowUpDown size={13} />
                </div>
              </th>
              <th onClick={() => handleSort('party')} className="sortable-th">
                <div className="th-content">
                  <span>Party / Business</span>
                  <ArrowUpDown size={13} />
                </div>
              </th>
              <th>Type</th>
              <th onClick={() => handleSort('amount')} className="sortable-th text-right">
                <div className="th-content justify-end">
                  <span>Amount</span>
                  <ArrowUpDown size={13} />
                </div>
              </th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-table-cell">
                  <div className="empty-state">
                    <FileText size={36} className="empty-icon" />
                    <p className="empty-title">No transactions match your search or filter</p>
                    <p className="empty-desc">Try clearing filters or search query</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedItems.map((tx) => {
                const isPaid = tx.status === 'Paid';
                const isPending = tx.status === 'Pending';
                const isOverdue = tx.status === 'Overdue';

                return (
                  <tr key={tx.id} className="nis-table-row">
                    <td className="font-medium text-secondary">{tx.date}</td>
                    <td>
                      <span className="invoice-code-tag">{tx.invoiceNo}</span>
                    </td>
                    <td>
                      <div className="party-cell">
                        <span className="party-name">{tx.party}</span>
                        {tx.gstin && <span className="party-gstin">{tx.gstin}</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`type-badge type-${tx.type.toLowerCase()}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="text-right font-bold text-main">
                      {formatINR(tx.amount)}
                    </td>
                    <td>
                      <button 
                        type="button"
                        className={`status-pill status-${tx.status.toLowerCase()}`}
                        onClick={() => onToggleStatus && onToggleStatus(tx.id)}
                        title="Click to toggle status"
                      >
                        {isPaid && <CheckCircle size={12} />}
                        {isPending && <Clock size={12} />}
                        {isOverdue && <AlertCircle size={12} />}
                        <span>{tx.status}</span>
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <button
                          type="button"
                          className="action-icon-btn"
                          title="View Invoice Details"
                          onClick={() => onViewInvoice && onViewInvoice(tx)}
                        >
                          <FileText size={15} />
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn"
                          title="Print Voucher / e-Way Bill"
                          onClick={() => window.print()}
                        >
                          <Printer size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="table-pagination-footer">
        <div className="pagination-info">
          Showing <b>{paginatedItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</b> to{' '}
          <b>{Math.min(currentPage * itemsPerPage, sortedTransactions.length)}</b> of{' '}
          <b>{sortedTransactions.length}</b> transactions
        </div>

        <div className="pagination-controls">
          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>

          <span className="pagination-page-indicator">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            aria-label="Next page"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

    </div>
  );
}
