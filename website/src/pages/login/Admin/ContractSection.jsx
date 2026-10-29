import React, { useState, useMemo } from 'react';
import { Plus, Download, X, CheckCircle2, FileText, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTableSort, SortableTh } from './tableSortUtils';

export default function ContractSection({ contracts, setContracts }) {
  const [isAddContractModalOpen, setIsAddContractModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [newContractForm, setNewContractForm] = useState({
    customer: '',
    company: '',
    service: 'Tally Prime Cloud + VPS Dedicated SLA',
    value: '₹1,50,000 / yr',
    startDate: '2026-11-01',
    expiryDate: '2027-10-31',
    slaTier: 'Tier-1 Priority NOC'
  });

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.customer.toLowerCase().includes(q) ||
        c.service.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' || c.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [contracts, searchQuery, statusFilter]);

  // Multi-column Ascending/Descending Sorting Hook
  const { sortedItems: sortedContracts, sortConfig, requestSort } = useTableSort(
    filteredContracts,
    'id',
    'asc'
  );

  const handleAddContract = (e) => {
    e.preventDefault();
    if (!newContractForm.customer || !newContractForm.company) {
      toast.error('Please enter customer and company name.');
      return;
    }
    const newEntry = {
      id: `CTR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: newContractForm.customer,
      company: newContractForm.company,
      email: `${newContractForm.customer.toLowerCase().replace(/\s+/g, '')}@example.com`,
      service: newContractForm.service,
      value: newContractForm.value,
      startDate: newContractForm.startDate,
      expiryDate: newContractForm.expiryDate,
      status: 'active',
      slaTier: newContractForm.slaTier
    };
    setContracts([newEntry, ...contracts]);
    setIsAddContractModalOpen(false);
    toast.success(`Contract ${newEntry.id} generated for ${newEntry.company}!`);
  };

  return (
    <div className="adm-table-card">
      {/* 1. Header with Title on Left and Primary Action Button on Right */}
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <h1 className="adm-section-title">
            Customer Contract Management
          </h1>
          <p className="adm-section-sub">
            Monitor customer master service agreements (MSA), SLA performance tiers, contract terms, and renewal cycles.
          </p>
        </div>

        <div className="adm-card-header-action">
          <button
            type="button"
            className="adm-btn-primary"
            onClick={() => setIsAddContractModalOpen(true)}
          >
            <Plus size={16} />
            <span>Create Contract</span>
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
              placeholder="Search by code, company, client..."
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
            <option value="all">All Statuses ({contracts.length})</option>
            <option value="active">Active Only</option>
            <option value="expiring">Expiring Soon</option>
          </select>
        </div>

        <div className="adm-table-record-count">
          Showing <strong>{filteredContracts.length}</strong> of <strong>{contracts.length}</strong> contracts
        </div>
      </div>

      {/* 3. Table with Vertical & Horizontal Scrolling */}
      <div className="adm-table-responsive">
        <table className="adm-table" style={{ minWidth: '1100px' }}>
          <thead>
            <tr>
              <SortableTh
                label="Contract Code"
                sortKey="id"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Client Organization"
                sortKey="company"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Authorized Representative"
                sortKey="customer"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Service Scope & Tier"
                sortKey="service"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Contract Value"
                sortKey="value"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTh
                label="Start Date"
                sortKey="startDate"
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedContracts.length > 0 ? (
              sortedContracts.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6366f1' }}>
                    {c.id}
                  </td>
                  <td style={{ fontWeight: 600 }}>{c.company}</td>
                  <td>
                    <div>{c.customer}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.email}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{c.service}</div>
                    <span style={{ fontSize: '0.7rem', color: '#6366f1' }}>{c.slaTier}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{c.value}</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.startDate}</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.expiryDate}</td>
                  <td>
                    <span
                      className={`adm-status-pill ${
                        c.status === 'active' ? 'active' : 'expiring'
                      }`}
                    >
                      <span style={{ textTransform: 'capitalize' }}>{c.status}</span>
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="adm-action-pill"
                      onClick={() =>
                        toast.success(`Contract ${c.id} document dispatched to ${c.email}`)
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
                  No contract agreements match your search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Table Footer */}
      <div className="adm-table-footer">
        <span>Corporate MSAs backed by 99.99% Cloud Node Uptime Guarantee</span>
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          Active SLA Commitments: {contracts.filter(c => c.status === 'active').length}
        </span>
      </div>

      {/* CREATE CONTRACT MODAL */}
      {isAddContractModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsAddContractModalOpen(false)}>
          <div className="adm-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">Create New Customer Contract</h3>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setIsAddContractModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddContract}>
              <div className="adm-modal-body">
                <div className="adm-form-grid">
                  <div className="adm-form-field">
                    <label className="adm-form-label">Customer Name *</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      placeholder="e.g. Subhankar Ghosh"
                      value={newContractForm.customer}
                      onChange={(e) =>
                        setNewContractForm({ ...newContractForm, customer: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="adm-form-field">
                    <label className="adm-form-label">Company / Firm Name *</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      placeholder="e.g. Ghosh Textile Mills Ltd."
                      value={newContractForm.company}
                      onChange={(e) =>
                        setNewContractForm({ ...newContractForm, company: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="adm-form-field">
                    <label className="adm-form-label">Service SLA Tier</label>
                    <select
                      className="adm-form-input"
                      value={newContractForm.service}
                      onChange={(e) =>
                        setNewContractForm({ ...newContractForm, service: e.target.value })
                      }
                    >
                      <option>Tally Prime Cloud + VPS Dedicated SLA</option>
                      <option>Enterprise Cloud VPS Dedicated 8-Core Node</option>
                      <option>Tally Multi-User Gold Cloud + TSS Sync</option>
                      <option>Tally Prime Single User Silver</option>
                    </select>
                  </div>

                  <div className="adm-form-field">
                    <label className="adm-form-label">Annual Contract Value</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      placeholder="e.g. ₹1,80,000 / yr"
                      value={newContractForm.value}
                      onChange={(e) =>
                        setNewContractForm({ ...newContractForm, value: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setIsAddContractModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="adm-btn-primary">
                  Generate Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

