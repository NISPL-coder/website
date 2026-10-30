import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, CreditCard, X, Search, Filter, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { useTableSort, SortableTh } from './tableSortUtils';
import { compactSelectStyles } from './reactSelectStyles';
import ExportDropdown from './ExportDropdown';
import { formatPaymentsForExport } from './exportUtils';

export default function PaymentSection({ payments, setPayments, contracts, onGoToReceipt }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = searchQuery.toLowerCase();
      const nameStr = (p.name || p.customer || '').toLowerCase();
      const accountStr = (p.accountName || p.company || '').toLowerCase();
      const invNumStr = (p.invoiceNumber || p.invoiceRef || '').toLowerCase();
      const methodStr = (p.paymentMethod || p.method || '').toLowerCase();
      const statusStr = (p.status || '').toLowerCase();

      const matchesSearch =
        !q ||
        nameStr.includes(q) ||
        accountStr.includes(q) ||
        invNumStr.includes(q) ||
        methodStr.includes(q) ||
        p.id.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' || statusStr === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [payments, searchQuery, statusFilter]);

  // Multi-column Ascending/Descending Sorting Hook
  const { sortedItems: sortedPayments, sortConfig, requestSort } = useTableSort(
    filteredPayments,
    'invoiceDate',
    'desc'
  );

  return (
    <div className="adm-table-card">
      {/* 1. Header with Title on Left and Export Action on Right */}
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <h1 className="adm-section-title">
            Customer Payment Records &amp; Transactions
          </h1>
          <p className="adm-section-sub">
            Real-time accounts receivable ledger showing settlement dates, received collections, and pending balances.
          </p>
        </div>

        <div className="adm-card-header-action">
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
        <div className="adm-table-filters">
          <div className="adm-search-box" style={{ width: '300px' }}>
            <Search size={15} className="adm-search-icon" />
            <input
              type="text"
              placeholder="Search by name, account, invoice, method..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="adm-search-input"
              style={{ width: '100%', height: '36px' }}
            />
          </div>

          <div style={{ minWidth: '190px' }}>
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

        <div className="adm-table-record-count">
          Showing <strong>{filteredPayments.length}</strong> of <strong>{payments.length}</strong> payment records
        </div>
      </div>

      {/* 3. Table with Exact Fields from Payment Details */}
      <div className="adm-table-responsive">
        <table className="adm-table" style={{ minWidth: '1380px' }}>
          <thead>
            <tr>
              <SortableTh
                label="Name"
                sortKey="name"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Account Name"
                sortKey="accountName"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Invoice Number"
                sortKey="invoiceNumber"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Invoice Date"
                sortKey="invoiceDate"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Received Amount"
                sortKey="receivedAmount"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Pending Payment"
                sortKey="pendingPayment"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Expected Payment Date"
                sortKey="expectedPaymentDate"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Payment Received Date"
                sortKey="paymentReceivedDate"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Payment Method"
                sortKey="paymentMethod"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Status"
                sortKey="status"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedPayments.length > 0 ? (
              sortedPayments.map((p) => {
                const nameDisplay = p.name || p.customer;
                const accountDisplay = p.accountName || p.company;
                const invNumber = p.invoiceNumber || p.invoiceRef;
                const invDate = p.invoiceDate || '2026-10-15';
                const rcvAmount = p.receivedAmount || p.amount;
                const pndPayment = p.pendingPayment || '₹0';
                const expDate = p.expectedPaymentDate || '—';
                const rcvDate = p.paymentReceivedDate || p.date || '—';
                const pMethod = p.paymentMethod || p.method || 'NEFT Wire';
                const isPaid = p.status === 'paid';
                const isPartial = p.status === 'partial';

                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{nameDisplay}</div>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#6366f1' }}>{p.id}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{accountDisplay}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.84rem', color: '#334155' }}>
                      {invNumber}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      {invDate}
                    </td>
                    <td style={{ fontWeight: 700, color: '#059669', fontSize: '0.92rem' }}>
                      {rcvAmount}
                    </td>
                    <td
                      style={{
                        fontWeight: 600,
                        color: pndPayment === '₹0' ? '#94a3b8' : '#d97706',
                        fontSize: '0.88rem'
                      }}
                    >
                      {pndPayment}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      {expDate}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#334155' }}>
                      {rcvDate}
                    </td>
                    <td>
                      <span className="adm-status-pill info">{pMethod}</span>
                    </td>
                    <td>
                      <span
                        className={`adm-status-pill ${
                          isPaid ? 'active' : isPartial ? 'demo' : 'pending'
                        }`}
                      >
                        {isPaid && <CheckCircle2 size={12} />}
                        {!isPaid && <Clock size={12} />}
                        <span style={{ textTransform: 'capitalize' }}>{p.status}</span>
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="adm-action-pill"
                        onClick={() => {
                          toast.success(`Opening receipt for ${invNumber}`);
                          if (onGoToReceipt) onGoToReceipt();
                        }}
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b' }}>
                  No payment records found matching your filter criteria.
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
