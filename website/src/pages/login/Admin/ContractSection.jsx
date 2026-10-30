import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, X, CheckCircle2, FileText, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { useTableSort, SortableTh } from './tableSortUtils';
import { compactSelectStyles } from './reactSelectStyles';
import ExportDropdown from './ExportDropdown';
import { formatContractsForExport } from './exportUtils';

export default function ContractSection({ contracts, setContracts }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        c.id.toLowerCase().includes(q) ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.customer && c.customer.toLowerCase().includes(q)) ||
        (c.contractType && c.contractType.toLowerCase().includes(q)) ||
        (c.service && c.service.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' || (c.status && c.status.toLowerCase() === statusFilter.toLowerCase());

      return matchesSearch && matchesStatus;
    });
  }, [contracts, searchQuery, statusFilter]);

  // Multi-column Ascending/Descending Sorting Hook
  const { sortedItems: sortedContracts, sortConfig, requestSort } = useTableSort(
    filteredContracts,
    'id',
    'asc'
  );

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
          <ExportDropdown
            data={filteredContracts}
            formatter={formatContractsForExport}
            fileName="NISPL_Contracts"
            itemLabel="contracts"
          />
          <button
            type="button"
            className="adm-btn-primary"
            onClick={() => navigate('/admin/customer/contract/create')}
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

          <div style={{ minWidth: '180px' }}>
            <Select
              styles={compactSelectStyles}
              isSearchable={false}
              options={[
                { value: 'all', label: `All Statuses (${contracts.length})` },
                { value: 'active', label: 'Active Only' },
                { value: 'expiring', label: 'Expiring Soon' }
              ]}
              value={{
                value: statusFilter,
                label:
                  statusFilter === 'all'
                    ? `All Statuses (${contracts.length})`
                    : statusFilter === 'active'
                    ? 'Active Only'
                    : 'Expiring Soon'
              }}
              onChange={(opt) => setStatusFilter(opt ? opt.value : 'all')}
              classNamePrefix="react-select"
            />
          </div>
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
                  <td style={{ fontWeight: 600 }}>{c.company || c.name}</td>
                  <td>
                    <div>{c.customer || c.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.email || 'contracts@nispl.in'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{c.service || `${c.contractType || 'Subscription'} (${c.subscriptionPeriod || '1 Year'})`}</div>
                    <span style={{ fontSize: '0.7rem', color: '#6366f1' }}>{c.slaTier || c.contractType || 'Subscription SLA'}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{c.totalContractValue || c.value}</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.startDate}</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.endDate || c.expiryDate}</td>
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

    </div>
  );
}

