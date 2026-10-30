import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building2,
  Mail,
  Phone,
  Server,
  X,
  Trash2,
  UserCheck,
  Shield,
  Download,
  Sparkles,
  XCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { useTableSort, SortableTh } from './tableSortUtils';
import { CountUp } from '../../Dashboard/utils/useCountUp';
import { compactSelectStyles } from './reactSelectStyles';
import ExportDropdown from './ExportDropdown';
import { formatCustomersForExport } from './exportUtils';

export default function CustomerSection({ customers, setCustomers }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'demo' | 'inactive'

  // Calculate live counts for filter buttons
  const counts = useMemo(() => {
    return {
      all: customers.length,
      active: customers.filter((c) => c.status?.toLowerCase() === 'active').length,
      demo: customers.filter((c) => c.status?.toLowerCase() === 'demo').length,
      inactive: customers.filter(
        (c) => c.status?.toLowerCase() === 'inactive' || c.status?.toLowerCase() === 'suspended'
      ).length
    };
  }, [customers]);

  // Total active MRR calculation
  const totalActiveMRR = useMemo(() => {
    return customers
      .filter((c) => c.status?.toLowerCase() === 'active')
      .reduce((acc, c) => acc + (parseInt(c.mrr?.replace(/[^0-9]/g, '')) || 0), 0)
      .toLocaleString('en-IN');
  }, [customers]);

  // Filtered customer listing
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.plan && c.plan.toLowerCase().includes(q));

      const custStatus = c.status?.toLowerCase();
      let matchesStatus = true;
      if (statusFilter === 'active') {
        matchesStatus = custStatus === 'active';
      } else if (statusFilter === 'demo') {
        matchesStatus = custStatus === 'demo';
      } else if (statusFilter === 'inactive') {
        matchesStatus = custStatus === 'inactive' || custStatus === 'suspended';
      }

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchQuery, statusFilter]);

  // Multi-column Ascending/Descending Sorting Hook
  const { sortedItems: sortedCustomers, sortConfig, requestSort } = useTableSort(
    filteredCustomers,
    'id',
    'asc'
  );

  // Delete Customer
  const handleDeleteCustomer = (customerId, companyName) => {
    if (window.confirm(`Are you sure you want to remove customer "${companyName}"?`)) {
      setCustomers((prev) => prev.filter((c) => c.id !== customerId));
      toast.success(`Customer ${companyName} removed.`);
    }
  };

  return (
    <div className="adm-table-card animate-fade-in">
      {/* 1. Card Header with Title on Left and Primary Action Button on Right */}
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <h1 className="adm-section-title">
            Customer Directory &amp; Accounts
          </h1>
          <p className="adm-section-sub">
            Filter, inspect, and manage active clients, live demo trials, and inactive accounts hosted at CtrlS Kolkata Tier-4 datacenter.
          </p>
        </div>

        <div className="adm-card-header-action">
          <ExportDropdown
            data={filteredCustomers}
            formatter={formatCustomersForExport}
            fileName="NISPL_Customers"
            itemLabel="customers"
          />
          <button
            type="button"
            className="adm-btn-primary"
            onClick={() => navigate('/admin/customer/create')}
          >
            <Plus size={16} />
            <span>Create Customer</span>
          </button>
        </div>
      </div>

      {/* 2. Customer Quick Stat Cards (Total, Active, Demo, Inactive with CountUp) */}
      <div className="adm-customer-summary-grid">
        <div
          className={`adm-cust-stat-card ${statusFilter === 'all' ? 'selected' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Total Accounts</span>
            <Users size={18} className="adm-cust-stat-icon purple" />
          </div>
          <span className="adm-cust-stat-val">
            <CountUp end={counts.all} duration={1200} />
          </span>
          <span className="adm-cust-stat-desc">All customer records</span>
        </div>

        <div
          className={`adm-cust-stat-card ${statusFilter === 'active' ? 'selected' : ''}`}
          onClick={() => setStatusFilter('active')}
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Active Clients</span>
            <CheckCircle2 size={18} className="adm-cust-stat-icon emerald" />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#059669' }}>
            <CountUp end={counts.active} duration={1200} />
          </span>
          <span className="adm-cust-stat-desc">
            Monthly MRR: ₹
            <CountUp
              end={parseInt(totalActiveMRR.replace(/[^0-9]/g, '')) || 99000}
              useIndianFormat={true}
              duration={1400}
            />
          </span>
        </div>

        <div
          className={`adm-cust-stat-card ${statusFilter === 'demo' ? 'selected' : ''}`}
          onClick={() => setStatusFilter('demo')}
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Demo / Trials</span>
            <Clock size={18} className="adm-cust-stat-icon amber" />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#d97706' }}>
            <CountUp end={counts.demo} duration={1200} />
          </span>
          <span className="adm-cust-stat-desc">14-Day sandbox trials</span>
        </div>

        <div
          className={`adm-cust-stat-card ${statusFilter === 'inactive' ? 'selected' : ''}`}
          onClick={() => setStatusFilter('inactive')}
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Inactive / Paused</span>
            <XCircle size={18} className="adm-cust-stat-icon slate" />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#64748b' }}>
            <CountUp end={counts.inactive} duration={1200} />
          </span>
          <span className="adm-cust-stat-desc">Expired / pending renewals</span>
        </div>
      </div>

      {/* 3. Filter Section of Demo, Active, and Inactive + Search */}
      <div className="adm-table-toolbar">
        <div className="adm-table-filters" style={{ flexWrap: 'wrap', gap: '12px' }}>
          {/* Search Box */}
          <div className="adm-search-box" style={{ width: '270px' }}>
            <Search size={15} className="adm-search-icon" />
            <input
              type="text"
              placeholder="Search by name, company, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="adm-search-input"
              style={{ width: '100%', height: '36px' }}
            />
          </div>

          {/* React Select Filter */}
          <div style={{ minWidth: '190px' }}>
            <Select
              styles={compactSelectStyles}
              isSearchable={false}
              options={[
                { value: 'all', label: `All Statuses (${counts.all})` },
                { value: 'active', label: `Active Only (${counts.active})` },
                { value: 'demo', label: `Demo / Trials (${counts.demo})` },
                { value: 'inactive', label: `Inactive (${counts.inactive})` }
              ]}
              value={{
                value: statusFilter,
                label:
                  statusFilter === 'all'
                    ? `All Statuses (${counts.all})`
                    : statusFilter === 'active'
                    ? `Active Only (${counts.active})`
                    : statusFilter === 'demo'
                    ? `Demo / Trials (${counts.demo})`
                    : `Inactive (${counts.inactive})`
              }}
              onChange={(opt) => setStatusFilter(opt ? opt.value : 'all')}
              classNamePrefix="react-select"
            />
          </div>
        </div>

        <div className="adm-table-record-count">
          Showing <strong>{filteredCustomers.length}</strong> of <strong>{customers.length}</strong> accounts
        </div>
      </div>

      {/* 4. Customer Listing Table with Vertical & Horizontal Scrolling */}
      <div className="adm-table-responsive">
        <table className="adm-table" style={{ minWidth: '1080px' }}>
          <thead>
            <tr>
              <SortableTh
                label="Customer ID"
                sortKey="id"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Organization & Client"
                sortKey="company"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Contact Details"
                sortKey="email"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Subscribed Plan"
                sortKey="plan"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Server Node"
                sortKey="serverNode"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Monthly (MRR)"
                sortKey="mrr"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Status"
                sortKey="status"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Registered"
                sortKey="registered"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCustomers.length > 0 ? (
              sortedCustomers.map((cust) => {
                const s = cust.status?.toLowerCase();
                return (
                  <tr key={cust.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6366f1' }}>
                      {cust.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{cust.company}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{cust.name}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: '#334155' }}>{cust.email}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{cust.phone}</div>
                    </td>
                    <td>
                      <span className="adm-status-pill info">{cust.plan}</span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      {cust.serverNode}
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{cust.mrr}</td>
                    <td>
                      {s === 'active' && (
                        <span className="adm-status-pill active">
                          <CheckCircle2 size={12} />
                          <span>Active</span>
                        </span>
                      )}
                      {s === 'demo' && (
                        <span className="adm-status-pill demo">
                          <Clock size={12} />
                          <span>Demo Trial</span>
                        </span>
                      )}
                      {(s === 'inactive' || s === 'suspended') && (
                        <span className="adm-status-pill inactive">
                          <XCircle size={12} />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{cust.registered}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          className="adm-action-pill"
                          onClick={() =>
                            toast.success(`Account details for ${cust.company} (${cust.status.toUpperCase()}) inspected.`)
                          }
                        >
                          Inspect
                        </button>
                        <button
                          type="button"
                          className="adm-action-pill"
                          style={{ color: '#dc2626', borderColor: '#fecaca' }}
                          onClick={() => handleDeleteCustomer(cust.id, cust.company)}
                          title="Delete customer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b' }}>
                  No customer records found matching "{statusFilter !== 'all' ? statusFilter : searchQuery}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Table Footer */}
      <div className="adm-table-footer">
        <span>Active enterprise cloud nodes &amp; dedicated Tally Prime deployments at CtrlS Kolkata</span>
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          Active MRR: ₹
          <CountUp
            end={parseInt(totalActiveMRR.replace(/[^0-9]/g, '')) || 99000}
            useIndianFormat={true}
            duration={1500}
          />{' '}
          • Demo Accounts: <CountUp end={counts.demo} duration={1200} />
        </span>
      </div>

    </div>
  );
}
