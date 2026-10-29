import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CreditCard,
  Package,
  ReceiptText,
  Plus,
  CheckCircle2,
  ChevronRight,
  Server,
  ArrowUpRight,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTableSort, SortableTh } from './tableSortUtils';

export default function OverviewSection({
  adminName,
  contracts,
  payments,
  products,
  receipts,
  setIsAddContractModalOpen
}) {
  const navigate = useNavigate();

  // Multi-column sorting for recent commitments
  const { sortedItems: sortedRecentContracts, sortConfig, requestSort } = useTableSort(
    contracts,
    'expiryDate',
    'asc'
  );

  return (
    <>
      {/* Hero Banner */}
      <section className="adm-hero-banner">
        <div>
          <h1 className="adm-hero-title">Admin Management Overview</h1>
          <p className="adm-hero-sub">
            Welcome back, <strong style={{ color: '#0f172a' }}>{adminName}</strong>. All customer contract pipelines, payment settlement gateways, and cloud servers are running at 99.99% SLA.
          </p>
        </div>

        <div className="adm-hero-actions">
          <button
            type="button"
            className="adm-btn-secondary"
            onClick={() => navigate('/admin/customer')}
          >
            <Users size={16} />
            <span>Manage Customers</span>
          </button>

          <button
            type="button"
            className="adm-btn-primary"
            onClick={() => {
              if (setIsAddContractModalOpen) {
                setIsAddContractModalOpen(true);
              } else {
                navigate('/admin/customer/contract');
              }
            }}
          >
            <Plus size={16} />
            <span>Create Contract</span>
          </button>
        </div>
      </section>

      {/* 4 High-Impact Summary KPI Cards */}
      <div className="adm-kpi-grid">
        <div
          className="adm-kpi-card"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/admin/customer/contract')}
          title="Go to Contracts"
        >
          <div className="adm-kpi-top">
            <div className="adm-kpi-icon-wrap purple">
              <FileText size={22} />
            </div>
            <span className="adm-kpi-trend up">+14% YoY</span>
          </div>
          <span className="adm-kpi-label">Active Customer Contracts</span>
          <span className="adm-kpi-value">{contracts.length} Enterprise</span>
          <span className="adm-kpi-caption">Total ARR Value: ₹1.84 Crore</span>
        </div>

        <div
          className="adm-kpi-card"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/admin/customer/payment')}
          title="Go to Payments"
        >
          <div className="adm-kpi-top">
            <div className="adm-kpi-icon-wrap emerald">
              <CreditCard size={22} />
            </div>
            <span className="adm-kpi-trend up">99.8% Settled</span>
          </div>
          <span className="adm-kpi-label">Monthly Collections</span>
          <span className="adm-kpi-value">₹18,45,000</span>
          <span className="adm-kpi-caption">Active subscription billings</span>
        </div>

        <div
          className="adm-kpi-card"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/admin/product')}
          title="Go to Products"
        >
          <div className="adm-kpi-top">
            <div className="adm-kpi-icon-wrap blue">
              <Package size={22} />
            </div>
            <span className="adm-kpi-trend up">6 Active</span>
          </div>
          <span className="adm-kpi-label">Managed Products</span>
          <span className="adm-kpi-value">{products.length} Editions</span>
          <span className="adm-kpi-caption">Tally Prime, Cloud VPS &amp; Add-ons</span>
        </div>

        <div
          className="adm-kpi-card"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/admin/receipt')}
          title="Go to Receipts"
        >
          <div className="adm-kpi-top">
            <div className="adm-kpi-icon-wrap amber">
              <ReceiptText size={22} />
            </div>
            <span className="adm-kpi-trend neutral">100% GST</span>
          </div>
          <span className="adm-kpi-label">Receipts Generated</span>
          <span className="adm-kpi-value">{receipts.length} Issued</span>
          <span className="adm-kpi-caption">Automated WhatsApp &amp; Email dispatches</span>
        </div>
      </div>

      {/* Recent Commitments Table */}
      <div className="adm-table-card">
        <div className="adm-card-header">
          <div className="adm-card-header-info">
            <h2 className="adm-section-title">Recent Contract Commitments</h2>
            <p className="adm-section-sub">
              Latest client SLAs signed across Eastern India.
            </p>
          </div>
          <div className="adm-card-header-action">
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={() => navigate('/admin/customer/contract')}
            >
              <span>View All Contracts</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        <div className="adm-table-responsive">
          <table className="adm-table" style={{ minWidth: '950px' }}>
            <thead>
              <tr>
                <SortableTh
                  label="Contract No"
                  sortKey="id"
                  currentSort={sortConfig}
                  onSort={requestSort}
                />
                <SortableTh
                  label="Customer / Company"
                  sortKey="company"
                  currentSort={sortConfig}
                  onSort={requestSort}
                />
                <SortableTh
                  label="Service SLA"
                  sortKey="service"
                  currentSort={sortConfig}
                  onSort={requestSort}
                />
                <SortableTh
                  label="Annual Value"
                  sortKey="value"
                  currentSort={sortConfig}
                  onSort={requestSort}
                />
                <SortableTh
                  label="Expiry Date"
                  sortKey="expiryDate"
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
              {sortedRecentContracts.slice(0, 5).map((c) => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.company}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.customer}</div>
                  </td>
                  <td style={{ color: '#334155' }}>{c.service}</td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{c.value}</td>
                  <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{c.expiryDate}</td>
                  <td>
                    <span
                      className={`adm-status-pill ${
                        c.status === 'active' ? 'active' : 'expiring'
                      }`}
                    >
                      <CheckCircle2 size={12} />
                      <span style={{ textTransform: 'capitalize' }}>{c.status}</span>
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="adm-action-pill"
                      onClick={() => {
                        toast.success(`Viewing ${c.company} contract details`);
                        navigate('/admin/customer/contract');
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

