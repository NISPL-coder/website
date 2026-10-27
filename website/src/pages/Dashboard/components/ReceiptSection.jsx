import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Download,
  CheckCircle2,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  FileText,
  ShieldCheck,
  PackageOpen
} from 'lucide-react';
import { generateReceiptPdf } from '../utils/generateReceiptPdf';

export default function ReceiptSection({ receipts = [], customer }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState(null);
  const rowsPerPage = 5;

  // Handle Sort Toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter & Sort Logic
  const filteredReceipts = useMemo(() => {
    let result = receipts.filter((rec) => {
      const q = searchQuery.toLowerCase();
      return (
        rec.id.toLowerCase().includes(q) ||
        rec.service.toLowerCase().includes(q) ||
        rec.paymentMode.toLowerCase().includes(q) ||
        (rec.expiryDate && rec.expiryDate.toLowerCase().includes(q)) ||
        rec.date.toLowerCase().includes(q) ||
        rec.totalAmount.toLowerCase().includes(q)
      );
    });

    result.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';

      if (sortField === 'totalAmount') {
        const numA = parseFloat(valA.replace(/[^\d.]/g, '') || 0);
        const numB = parseFloat(valB.replace(/[^\d.]/g, '') || 0);
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }

      const cmp = String(valA).localeCompare(String(valB));
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [receipts, searchQuery, sortField, sortDirection]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredReceipts.length / rowsPerPage) || 1;
  const paginatedReceipts = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredReceipts.slice(start, start + rowsPerPage);
  }, [filteredReceipts, currentPage, rowsPerPage]);

  // Handle PDF Generation
  const handleDownloadPdf = (rec) => {
    setDownloadingId(rec.id);
    try {
      generateReceiptPdf(rec, customer);
    } catch (err) {
      console.error('PDF Generation failed:', err);
    } finally {
      setTimeout(() => setDownloadingId(null), 800);
    }
  };

  return (
    <div className="cliento-card cliento-table-card animate-fade-in">
      {/* ── Table Header Bar with Search & Quick Tools ────────────── */}
      <div className="cliento-table-head-row">
        <div className="cliento-card-title-group">
          <Receipt size={18} className="cliento-card-icon" />
          <div>
            <h3 className="cliento-card-title">Payment Receipts & Invoices</h3>
          </div>
        </div>

        <div className="cliento-table-actions">
          {/* Search Input */}
          <div className="cliento-table-search">
            <Search size={14} className="cliento-search-icon" />
            <input
              type="text"
              placeholder="Search receipts..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <span className="cliento-secure-badge">
            <ShieldCheck size={13} color="#059669" />
            <span>GST Tax Invoices</span>
          </span>
        </div>
      </div>

      {/* ── Empty State ───────────────────────────────────────────── */}
      {!filteredReceipts.length ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <PackageOpen size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: 6 }}>
            No Receipts Found
          </h4>
          <p style={{ fontSize: '0.86rem', color: '#64748b' }}>
            {searchQuery
              ? `No receipts matching "${searchQuery}"`
              : 'Completed subscription and license renewals will appear here.'}
          </p>
        </div>
      ) : (
        <>
          {/* ── React DataTable ──────────────────────────────────────── */}
          <div className="cliento-table-responsive">
            <table className="cliento-data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>Receipt ID</span>
                      <ArrowUpDown size={12} color="#94a3b8" />
                    </div>
                  </th>
                  <th>Service Description</th>
                  <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>Issue Date</span>
                      <ArrowUpDown size={12} color="#94a3b8" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('expiryDate')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>Expiry Date</span>
                      <ArrowUpDown size={12} color="#94a3b8" />
                    </div>
                  </th>
                  <th>Payment Mode</th>
                  <th onClick={() => handleSort('totalAmount')} style={{ textAlign: 'right', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                      <span>Total Paid</span>
                      <ArrowUpDown size={12} color="#94a3b8" />
                    </div>
                  </th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Download PDF</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReceipts.map((rec) => (
                  <tr key={rec.id}>
                    <td className="cliento-td-id font-mono">
                      <span>{rec.id}</span>
                    </td>
                    <td>
                      <div className="cliento-user-name-text">{rec.service}</div>
                      <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                        SAC: {rec.sacCode || '998313'} &nbsp;•&nbsp; GST: {rec.gstRate || '18%'} (₹{rec.taxAmount})
                      </span>
                    </td>
                    <td className="cliento-td-date">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={13} color="#94a3b8" />
                        <span>{rec.date}</span>
                      </div>
                    </td>
                    <td>
                      <div className="cliento-expiry-pill">
                        <Clock size={12} color="#059669" />
                        <span>{rec.expiryDate || 'Active'}</span>
                      </div>
                    </td>
                    <td style={{ color: '#475569', fontSize: '0.86rem' }}>
                      {rec.paymentMode}
                    </td>
                    <td style={{ textAlign: 'right', color: '#0f172a', fontWeight: 500 }}>
                      {rec.totalAmount}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="cliento-status-pill status-qualified">
                        <CheckCircle2 size={11} />
                        {rec.status || 'Paid'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="cliento-pdf-btn"
                        onClick={() => handleDownloadPdf(rec)}
                        disabled={downloadingId === rec.id}
                        title={`Download official GST Tax Invoice PDF for ${rec.id}`}
                      >
                        <Download size={13} />
                        <span>{downloadingId === rec.id ? 'Generating...' : 'PDF Invoice'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Table Footer: Pagination & Count ─────────────────────── */}
          <div className="cliento-table-footer-row">
            <span className="cliento-table-page-info">
              Showing <strong>{Math.min(filteredReceipts.length, (currentPage - 1) * rowsPerPage + 1)}</strong> to{' '}
              <strong>{Math.min(filteredReceipts.length, currentPage * rowsPerPage)}</strong> of{' '}
              <strong>{filteredReceipts.length}</strong> invoices
            </span>

            <div className="cliento-pagination-controls">
              <button
                type="button"
                className="cliento-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                aria-label="Previous page"
              >
                <ChevronLeft size={15} />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  type="button"
                  className={`cliento-page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                type="button"
                className="cliento-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                aria-label="Next page"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
