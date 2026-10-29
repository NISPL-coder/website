import React, { useState, useMemo } from 'react';
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
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTableSort, SortableTh } from './tableSortUtils';

export default function CustomerSection({ customers, setCustomers }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State for creating a new customer
  const [formState, setFormState] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    city: 'Kolkata, WB',
    plan: 'Tally Prime Cloud + VPS Gold',
    serverNode: 'CtrlS-KOL-NODE-01',
    status: 'active',
    mrr: '₹15,000'
  });

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
        (c.phone && c.phone.includes(q));

      const matchesStatus =
        statusFilter === 'all' || c.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchQuery, statusFilter]);

  // Multi-column Ascending/Descending Sorting Hook
  const { sortedItems: sortedCustomers, sortConfig, requestSort } = useTableSort(
    filteredCustomers,
    'id',
    'asc'
  );

  // Handle Create Customer Submit
  const handleCreateCustomerSubmit = (e) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.company.trim() || !formState.email.trim()) {
      toast.error('Please enter all required fields.');
      return;
    }

    const newCustomer = {
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formState.name.trim(),
      company: formState.company.trim(),
      email: formState.email.trim(),
      phone: formState.phone.trim() || '+91 98300 00000',
      city: formState.city.trim() || 'Eastern India',
      plan: formState.plan,
      serverNode: formState.serverNode,
      status: formState.status,
      registered: new Date().toISOString().split('T')[0],
      mrr: formState.mrr || '₹15,000'
    };

    setCustomers([newCustomer, ...customers]);
    setIsCreateModalOpen(false);
    setFormState({
      name: '',
      company: '',
      email: '',
      phone: '',
      city: 'Kolkata, WB',
      plan: 'Tally Prime Cloud + VPS Gold',
      serverNode: 'CtrlS-KOL-NODE-01',
      status: 'active',
      mrr: '₹15,000'
    });

    toast.success(`Customer ${newCustomer.company} created successfully!`, {
      style: {
        borderRadius: '12px',
        background: '#0f172a',
        color: '#ffffff',
        fontSize: '0.85rem'
      }
    });
  };

  // Delete Customer
  const handleDeleteCustomer = (customerId, companyName) => {
    if (window.confirm(`Are you sure you want to remove customer "${companyName}"?`)) {
      setCustomers((prev) => prev.filter((c) => c.id !== customerId));
      toast.success(`Customer ${companyName} removed.`);
    }
  };

  return (
    <div className="adm-table-card">
      {/* 1. Card Header with Title on Left and Primary Action Button on Right */}
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <h1 className="adm-section-title">
            Customer Directory &amp; Accounts
          </h1>
          <p className="adm-section-sub">
            Browse active customers, provisioned cloud VPS nodes, ERP license editions, and create new client profiles.
          </p>
        </div>

        <div className="adm-card-header-action">
          <button
            type="button"
            className="adm-btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={16} />
            <span>Create Customer</span>
          </button>
        </div>
      </div>

      {/* 2. Filter / Search Toolbar */}
      <div className="adm-table-toolbar">
        <div className="adm-table-filters">
          {/* Search Box */}
          <div className="adm-search-box" style={{ width: '280px' }}>
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

          {/* Status Filter */}
          <select
            className="adm-select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses ({customers.length})</option>
            <option value="active">Active Only</option>
            <option value="pending">Pending Setup</option>
          </select>
        </div>

        <div className="adm-table-record-count">
          Showing <strong>{filteredCustomers.length}</strong> of <strong>{customers.length}</strong> accounts
        </div>
      </div>

      {/* 3. Customer Listing Table with Vertical & Horizontal Scrolling */}
      <div className="adm-table-responsive">
        <table className="adm-table" style={{ minWidth: '1050px' }}>
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
              sortedCustomers.map((cust) => (
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
                    <span
                      className={`adm-status-pill ${
                        cust.status === 'active' ? 'active' : 'pending'
                      }`}
                    >
                      <CheckCircle2 size={12} />
                      <span style={{ textTransform: 'capitalize' }}>{cust.status}</span>
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{cust.registered}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        className="adm-action-pill"
                        onClick={() =>
                          toast.success(`Account details for ${cust.company} opened.`)
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
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b' }}>
                  No customer records found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Table Footer */}
      <div className="adm-table-footer">
        <span>Active enterprise cloud nodes &amp; dedicated Tally Prime deployments</span>
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          Total Active MRR: ₹{customers.filter(c => c.status === 'active').reduce((acc, c) => acc + (parseInt(c.mrr?.replace(/[^0-9]/g, '')) || 0), 0).toLocaleString('en-IN')}
        </span>
      </div>

      {/* =========================================================================
         CREATE NEW CUSTOMER MODAL
         ========================================================================= */}
      {isCreateModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div className="adm-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">Create New Customer Account</h3>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setIsCreateModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit}>
              <div className="adm-modal-body">
                <div className="adm-form-grid">
                  <div className="adm-form-field">
                    <label className="adm-form-label">Customer Contact Representative *</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      placeholder="e.g. Subhankar Ghosh"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="adm-form-field">
                    <label className="adm-form-label">Company / Firm Organization *</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      placeholder="e.g. Ghosh Textile Mills Pvt Ltd"
                      value={formState.company}
                      onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                      required
                    />
                  </div>

                  <div className="adm-form-field">
                    <label className="adm-form-label">Corporate Email Address *</label>
                    <input
                      type="email"
                      className="adm-form-input"
                      placeholder="e.g. subhankar@ghoshtextile.in"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="adm-form-field">
                    <label className="adm-form-label">Mobile / WhatsApp Number *</label>
                    <input
                      type="tel"
                      className="adm-form-input"
                      placeholder="e.g. +91 98300 12345"
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    />
                  </div>

                  <div className="adm-form-field">
                    <label className="adm-form-label">City / Region</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      placeholder="e.g. Kolkata, Salt Lake Sec V"
                      value={formState.city}
                      onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                    />
                  </div>

                  <div className="adm-form-field">
                    <label className="adm-form-label">Cloud ERP Subscription Tier</label>
                    <select
                      className="adm-form-input"
                      value={formState.plan}
                      onChange={(e) => setFormState({ ...formState, plan: e.target.value })}
                    >
                      <option>Tally Prime Cloud + VPS Gold</option>
                      <option>Enterprise VPS Dedicated Node</option>
                      <option>Tally Multi-User Cloud + TSS</option>
                      <option>Tally Prime Single User Silver</option>
                      <option>High-Mem Cloud VPS Node</option>
                    </select>
                  </div>

                  <div className="adm-form-field">
                    <label className="adm-form-label">Target CtrlS Host Node</label>
                    <select
                      className="adm-form-input"
                      value={formState.serverNode}
                      onChange={(e) => setFormState({ ...formState, serverNode: e.target.value })}
                    >
                      <option>CtrlS-KOL-NODE-01 (Primary Cluster)</option>
                      <option>CtrlS-KOL-NODE-02 (Enterprise Hypervisor)</option>
                      <option>CtrlS-KOL-NODE-03 (Backup Vault)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="adm-btn-primary">
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

