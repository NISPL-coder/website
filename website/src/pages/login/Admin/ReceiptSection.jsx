import React, { useState, useMemo } from 'react';
import { Plus, Download, Check, ReceiptText, X, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReceiptSection({ receipts, setReceipts, payments }) {
  const [isGenerateReceiptModalOpen, setIsGenerateReceiptModalOpen] = useState(false);
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
            onClick={() => setIsGenerateReceiptModalOpen(true)}
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
              <th>Receipt No</th>
              <th>Billed Organization</th>
              <th>Taxable Base</th>
              <th>18% GST</th>
              <th>Total Paid</th>
              <th>Issue Date</th>
              <th>Payment Channel</th>
              <th>Dispatch Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReceipts.length > 0 ? (
              filteredReceipts.map((r) => (
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

      {/* GENERATE RECEIPT MODAL */}
      {isGenerateReceiptModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsGenerateReceiptModalOpen(false)}>
          <div className="adm-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">Generate Customer Payment Receipt</h3>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setIsGenerateReceiptModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="adm-modal-body">
              <div className="adm-form-grid">
                <div className="adm-form-field">
                  <label className="adm-form-label">Select Paid Transaction</label>
                  <select className="adm-form-input">
                    {payments && payments.length > 0 ? (
                      payments.map((p) => (
                        <option key={p.id}>
                          {p.id} - {p.company} ({p.amount})
                        </option>
                      ))
                    ) : (
                      <option>TXN-994101 - FlowMail Agency Pvt Ltd (₹14,500)</option>
                    )}
                  </select>
                </div>

                <div className="adm-form-field">
                  <label className="adm-form-label">Tax Deduction / GST Rule</label>
                  <input
                    type="text"
                    className="adm-form-input"
                    defaultValue="Standard 18% Integrated GST (IGST/CGST)"
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn-secondary"
                onClick={() => setIsGenerateReceiptModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="adm-btn-primary"
                onClick={() => {
                  toast.success('Certified payment receipt generated & dispatched!');
                  setIsGenerateReceiptModalOpen(false);
                }}
              >
                Dispatch Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

