import React, { useState, useMemo, useEffect } from 'react';
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
  PackageOpen,
  CreditCard,
  Building2,
  Activity,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { CountUp } from '../../Dashboard/utils/useCountUp';
import { generateReceiptPdf } from '../../Dashboard/utils/generateReceiptPdf';
import { isSettledStatus, receiptTotals } from '../../Dashboard/utils/portalReceiptRows';
import { useIsMobile, useIsPhone } from '../../../utils/useResponsive';

export default function ReceiptSection({ receipts = [], customer, account, externalSearch = '' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState(null);
  const isMobile = useIsMobile();
  const isPhone = useIsPhone();
  const rowsPerPage = 5;

  // The account record is the billing identity on the invoice, so the PDF uses
  // whatever the portal has on file and leaves the rest blank.
  const billing = useMemo(
    () => ({
      ...customer,
      companyName: account?.company || customer?.companyName || customer?.company || account?.name,
      name: account?.name || customer?.name,
      email: account?.email || customer?.email,
      gstNo: account?.gstNo || customer?.gstNo || '',
      customerId: account?.customerId || customer?.customerId || ''
    }),
    [customer, account]
  );

  // The console header search hands over the term a result was opened with.
  useEffect(() => {
    setSearchQuery(externalSearch);
    setCurrentPage(1);
  }, [externalSearch]);

  // Aggregate Metrics for FlowMail KPI Cards
  const totals = useMemo(() => receiptTotals(receipts), [receipts]);

  // Handle Sort Toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter & Sort Logic
  const filteredReceipts = useMemo(() => {
    let result = receipts.filter((rec) => {
      const q = searchQuery.toLowerCase();
      // A cheque or UTR reference is how the customer finds an offline payment,
      // so the instrument number searches the same way the invoice number does.
      return (
        rec.id.toLowerCase().includes(q) ||
        rec.service.toLowerCase().includes(q) ||
        rec.paymentMode.toLowerCase().includes(q) ||
        String(rec.referenceNumber || '').toLowerCase().includes(q) ||
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
      generateReceiptPdf(rec, billing);
    } catch (err) {
      console.error('PDF Generation failed:', err);
    } finally {
      setTimeout(() => setDownloadingId(null), 800);
    }
  };

  // An invoice whose money has not reached the bank account must not read on
  // screen like a settled one, so the pill follows the ledger status.
  const statusPill = (status) => {
    if (isSettledStatus(status)) return 'positive';
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'overdue' || normalized === 'unpaid') return 'negative';
    return 'amber';
  };

  return (
    <div
      className="flowmail-section-wrapper animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box'
      }}
    >
      {/* ── 1. Top Greeting Header (FlowMail Theme) ─────────────── */}
      <section className="flowmail-welcome-banner">
        <div className="flowmail-welcome-text">
          <h2 className="flowmail-welcome-title">Payment Receipts &amp; Invoices</h2>
          <p className="flowmail-welcome-sub">
            Download certified GST tax invoices, review transaction history, and verify software license renewals.
          </p>
        </div>
       
      </section>

      {/* ── 2. Top 4 Metric KPI Cards (Guaranteed within Page Boundary) ── */}
      <section
        className="flowmail-receipt-kpi-grid"
        aria-label="Receipts Key Metrics"
      >
        {/* Card 1: Total Invoices */}
        <div className="flowmail-kpi-card" style={{ padding: '18px 20px', minWidth: 0, overflow: 'hidden' }}>
          <div className="flowmail-kpi-top" style={{ marginBottom: '10px' }}>
            <div className="flowmail-kpi-label-group" style={{ minWidth: 0 }}>
              <Receipt size={16} className="flowmail-kpi-icon" />
              <span className="flowmail-kpi-label" style={{ fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Total Invoices
              </span>
            </div>
            <button type="button" className="flowmail-dots-btn" aria-label="More options">
              <MoreVertical size={14} />
            </button>
          </div>
          <div className="flowmail-kpi-middle" style={{ gap: '8px', minWidth: 0 }}>
            <div className="flowmail-kpi-number" style={{ fontSize: '1.65rem' }}>
              <CountUp end={receipts.length} duration={1200} />
            </div>
            <div className="flowmail-trend-pill positive" style={{ fontSize: '0.74rem', padding: '3px 8px', whiteSpace: 'nowrap' }}>
              <CheckCircle2 size={12} />
              <span>{totals.settled} of {receipts.length} settled</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Paid Amount */}
        <div className="flowmail-kpi-card" style={{ padding: '18px 20px', minWidth: 0, overflow: 'hidden' }}>
          <div className="flowmail-kpi-top" style={{ marginBottom: '10px' }}>
            <div className="flowmail-kpi-label-group" style={{ minWidth: 0 }}>
              <CreditCard size={16} className="flowmail-kpi-icon" />
              <span className="flowmail-kpi-label" style={{ fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Total Paid Amount
              </span>
            </div>
            <button type="button" className="flowmail-dots-btn" aria-label="More options">
              <MoreVertical size={14} />
            </button>
          </div>
          <div className="flowmail-kpi-middle" style={{ gap: '8px', minWidth: 0 }}>
            <div className="flowmail-kpi-number" style={{ fontSize: '1.65rem' }}>
              ₹<CountUp end={Math.round(totals.paid)} separator="," duration={1500} />
            </div>
            <div className="flowmail-trend-pill positive" style={{ fontSize: '0.74rem', padding: '3px 8px', whiteSpace: 'nowrap' }}>
              <span>Realised</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total GST Paid */}
        <div className="flowmail-kpi-card" style={{ padding: '18px 20px', minWidth: 0, overflow: 'hidden' }}>
          <div className="flowmail-kpi-top" style={{ marginBottom: '10px' }}>
            <div className="flowmail-kpi-label-group" style={{ minWidth: 0 }}>
              <FileText size={16} className="flowmail-kpi-icon" />
              <span className="flowmail-kpi-label" style={{ fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Total GST Tax
              </span>
            </div>
            <button type="button" className="flowmail-dots-btn" aria-label="More options">
              <MoreVertical size={14} />
            </button>
          </div>
          <div className="flowmail-kpi-middle" style={{ gap: '8px', minWidth: 0 }}>
            <div className="flowmail-kpi-number" style={{ fontSize: '1.65rem' }}>
              ₹<CountUp end={Math.round(totals.gst)} separator="," duration={1400} />
            </div>
            <div className="flowmail-trend-pill indigo" style={{ fontSize: '0.74rem', padding: '3px 8px', whiteSpace: 'nowrap' }}>
              <span>18% Credit</span>
            </div>
          </div>
        </div>

        {/* Card 4: Balance still with the bank */}
        <div className="flowmail-kpi-card" style={{ padding: '18px 20px', minWidth: 0, overflow: 'hidden' }}>
          <div className="flowmail-kpi-top" style={{ marginBottom: '10px' }}>
            <div className="flowmail-kpi-label-group" style={{ minWidth: 0 }}>
              <Clock size={16} className="flowmail-kpi-icon" />
              <span className="flowmail-kpi-label" style={{ fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Outstanding Balance
              </span>
            </div>
            <button type="button" className="flowmail-dots-btn" aria-label="More options">
              <MoreVertical size={14} />
            </button>
          </div>
          <div className="flowmail-kpi-middle" style={{ gap: '8px', minWidth: 0 }}>
            <div className="flowmail-kpi-number" style={{ fontSize: '1.65rem' }}>
              ₹<CountUp end={Math.round(totals.pending)} separator="," duration={1400} />
            </div>
            <div
              className={`flowmail-trend-pill ${totals.pending > 0 ? 'amber' : 'positive'}`}
              style={{ fontSize: '0.74rem', padding: '3px 8px', whiteSpace: 'nowrap' }}
            >
              <span>
                {totals.pending > 0
                  ? `${receipts.length - totals.settled} invoice${receipts.length - totals.settled === 1 ? '' : 's'} not cleared`
                  : 'All invoices cleared'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Table Card with Horizontal & Vertical Scroll (Does Not Exceed Page) ── */}
      <div
        className="flowmail-card"
        style={{
          padding: '0',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          boxSizing: 'border-box'
        }}
      >
        {/* Table Header Bar with FlowMail Search */}
        <div
          className="flowmail-card-header-row"
          style={{
            padding: isMobile ? '14px 16px' : '18px 24px',
            borderBottom: '1px solid #f1f5f9',
            margin: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div>
            <h3 className="flowmail-card-title">Tax Invoice Registry</h3>
            <p className="flowmail-card-subtitle">Official verified invoices for {billing.companyName || 'this account'}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: isMobile ? '100%' : undefined }}>
            {/* FlowMail Pill Search Input */}
            <div className="cliento-search-bar" style={{ width: isMobile ? '100%' : '280px' }}>
              <Search size={15} className="cliento-search-icon" />
              <input
                type="text"
                className="cliento-search-input"
                placeholder="Search invoice, service, date..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Empty State ─────────────────────────────────────────── */}
        {!filteredReceipts.length ? (
          <div style={{ padding: isMobile ? '36px 16px' : '64px 20px', textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <PackageOpen size={30} color="#94a3b8" />
            </div>
            <h4 style={{ fontSize: '1.08rem', color: '#0f172a', fontWeight: '700', marginBottom: 6 }}>
              No Invoices Found
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '420px', margin: '0 auto' }}>
              {searchQuery
                ? `No invoices matching "${searchQuery}". Try searching with a different term.`
                : 'Completed subscription purchases and license renewals will automatically generate invoices here.'}
            </p>
          </div>
        ) : (
          <>
            {/* Phone: stacked invoice cards instead of a sideways-scrolling table */}
            {isPhone && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '440px', overflowY: 'auto', width: '100%' }}>
                {paginatedReceipts.map((rec) => (
                  <div key={rec.id} style={{ border: '1px solid #eef2f7', borderRadius: '14px', padding: '14px 16px', background: '#ffffff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                      <span className="flowmail-receipt-id-badge" style={{ fontSize: '0.72rem' }}>{rec.id}</span>
                      <span className={`flowmail-trend-pill ${statusPill(rec.status)}`} style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
                        {isSettledStatus(rec.status) ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        <span>{rec.status || 'Paid'}</span>
                      </span>
                    </div>

                    <div style={{ color: '#0f172a', fontWeight: '600', fontSize: '0.9rem' }}>{rec.service}</div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '10px' }}>
                      {rec.sacCode ? `SAC: ${rec.sacCode}  •  ` : ''}GST: {rec.taxAmount}
                    </span>

                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 14px', fontSize: '0.8rem', color: '#475569', marginBottom: '12px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <Calendar size={12} color="#94a3b8" />
                        <span>{rec.date}</span>
                      </span>
                      <span className="flowmail-trend-pill positive" style={{ fontSize: '0.7rem', padding: '2px 7px' }}>
                        <Clock size={10} />
                        <span>{rec.expiryDate || 'Active'}</span>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: '#475569', fontWeight: 600, fontSize: '0.82rem' }}>{rec.paymentMode}</div>
                        {rec.referenceNumber ? (
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>
                            Ref {rec.referenceNumber}{rec.bankName ? ` · ${rec.bankName}` : ''}
                          </span>
                        ) : (
                          rec.bookedOffline && (
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>
                              Booked by {rec.recordedBy || 'NISPL finance desk'}
                            </span>
                          )
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <span style={{ color: '#0f172a', fontWeight: '700', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>{rec.totalAmount}</span>
                        <button
                          type="button"
                          className="flowmail-btn-secondary"
                          style={{ padding: '10px 16px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '10px' }}
                          onClick={() => handleDownloadPdf(rec)}
                          disabled={downloadingId === rec.id}
                          title={`Download official GST Tax Invoice PDF for ${rec.id}`}
                        >
                          <Download size={13} />
                          <span>{downloadingId === rec.id ? 'Generating...' : 'PDF'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Desktop: the full sortable table */}
            {!isPhone && (
            <div
              className="cliento-table-responsive flowmail-table-scroll"
              style={{
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                overflowX: 'auto',
                overflowY: 'auto',
                maxHeight: '440px',
                position: 'relative',
                boxSizing: 'border-box'
              }}
            >
              <table
                className="cliento-data-table flowmail-table"
                style={{
                  width: '100%',
                  minWidth: '960px',
                  borderCollapse: 'collapse',
                  boxSizing: 'border-box'
                }}
              >
                <thead
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    background: '#f8fafc'
                  }}
                >
                  <tr style={{ background: '#f8fafc' }}>
                    <th onClick={() => handleSort('id')} style={{ cursor: 'pointer', padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>RECEIPT ID</span>
                        <ArrowUpDown size={12} color="#94a3b8" />
                      </div>
                    </th>
                    <th style={{ padding: '14px 20px', minWidth: '240px' }}>SERVICE DESCRIPTION</th>
                    <th onClick={() => handleSort('date')} style={{ cursor: 'pointer', padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>ISSUE DATE</span>
                        <ArrowUpDown size={12} color="#94a3b8" />
                      </div>
                    </th>
                    <th onClick={() => handleSort('expiryDate')} style={{ cursor: 'pointer', padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>VALIDITY</span>
                        <ArrowUpDown size={12} color="#94a3b8" />
                      </div>
                    </th>
                    <th style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>PAYMENT METHOD</th>
                    <th onClick={() => handleSort('totalAmount')} style={{ textAlign: 'right', cursor: 'pointer', padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        <span>TOTAL PAID</span>
                        <ArrowUpDown size={12} color="#94a3b8" />
                      </div>
                    </th>
                    <th style={{ textAlign: 'center', padding: '14px 20px', whiteSpace: 'nowrap' }}>STATUS</th>
                    <th style={{ textAlign: 'right', padding: '14px 20px', whiteSpace: 'nowrap' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReceipts.map((rec) => (
                    <tr key={rec.id} className="flowmail-table-row">
                      <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                        <span className="flowmail-receipt-id-badge">
                          {rec.id}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', minWidth: '240px' }}>
                        <div style={{ color: '#0f172a', fontWeight: '600', fontSize: '0.9rem', marginBottom: 2 }}>
                          {rec.service}
                        </div>
                        <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>
                          {rec.sacCode ? `SAC: ${rec.sacCode}  •  ` : ''}GST: {rec.taxAmount}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontSize: '0.86rem' }}>
                          <Calendar size={13} color="#94a3b8" />
                          <span>{rec.date}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                        <div className="flowmail-trend-pill positive" style={{ fontSize: '0.74rem', padding: '3px 8px' }}>
                          <Clock size={11} />
                          <span>{rec.expiryDate || 'Active'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        <div style={{ color: '#475569', fontWeight: 600 }}>{rec.paymentMode}</div>
                        {/* Money that arrived on a bank instrument carries the same
                            number the customer's own passbook shows, and says which
                            desk booked it in, so the entry is recognisable. */}
                        {rec.referenceNumber ? (
                          <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>
                            Ref {rec.referenceNumber}
                            {rec.bankName ? ` · ${rec.bankName}` : ''}
                          </span>
                        ) : (
                          rec.bookedOffline && (
                            <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>
                              Booked by {rec.recordedBy || 'NISPL finance desk'}
                            </span>
                          )
                        )}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right', color: '#0f172a', fontWeight: '700', fontSize: '0.92rem', whiteSpace: 'nowrap' }}>
                        {rec.totalAmount}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span className={`flowmail-trend-pill ${statusPill(rec.status)}`}>
                          {isSettledStatus(rec.status) ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          <span>{rec.status || 'Paid'}</span>
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          className="flowmail-btn-secondary"
                          style={{
                            padding: isMobile ? '10px 16px' : '6px 14px',
                            fontSize: '0.82rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            borderRadius: '10px'
                          }}
                          onClick={() => handleDownloadPdf(rec)}
                          disabled={downloadingId === rec.id}
                          title={`Download official GST Tax Invoice PDF for ${rec.id}`}
                        >
                          <Download size={13} />
                          <span>{downloadingId === rec.id ? 'Generating...' : 'PDF'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}

            {/* ── FlowMail Table Footer: Pagination & Information ─────── */}
            <div
              className="cliento-table-footer-row"
              style={{
                padding: isMobile ? '14px 14px' : '16px 24px',
                background: '#ffffff',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap'
              }}
            >
              <span className="cliento-table-page-info" style={{ color: '#64748b', fontSize: '0.84rem' }}>
                Showing <strong>{Math.min(filteredReceipts.length, (currentPage - 1) * rowsPerPage + 1)}</strong> to{' '}
                <strong>{Math.min(filteredReceipts.length, currentPage * rowsPerPage)}</strong> of{' '}
                <strong>{filteredReceipts.length}</strong> invoices
              </span>

              <div className="cliento-pagination-controls">
                <button
                  type="button"
                  className="cliento-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  aria-label="Previous page"
                  style={{ borderRadius: '10px' }}
                >
                  <ChevronLeft size={15} />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    type="button"
                    className={`cliento-page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                    style={{
                      borderRadius: '10px',
                      ...(currentPage === i + 1
                        ? { background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', color: '#ffffff', border: 'none' }
                        : {})
                    }}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  type="button"
                  className="cliento-page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  aria-label="Next page"
                  style={{ borderRadius: '10px' }}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export { ReceiptSection as Receipt, ReceiptSection as receipt };
