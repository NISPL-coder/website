import React, { useState } from 'react';
import { 
  Users, 
  Building2, 
  Phone, 
  MapPin, 
  IndianRupee, 
  Search, 
  Plus, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownLeft 
} from 'lucide-react';
import { formatINR } from '../../utils/formatters';

export default function PartiesTab({ customers, suppliers, onAddParty }) {
  const [activeSubTab, setActiveSubTab] = useState('customers'); // 'customers' or 'suppliers'
  const [searchQuery, setSearchQuery] = useState('');

  const currentList = activeSubTab === 'customers' ? customers : suppliers;
  const filteredList = currentList.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.gstin && p.gstin.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.city && p.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalOutstanding = currentList.reduce((acc, curr) => acc + (curr.balance || 0), 0);

  return (
    <div className="nis-inventory-card">
      <div className="inv-header-block">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="inv-title">Party Ledger & Contact Directory</h3>
            <span className="badge badge-primary">{currentList.length} Active Records</span>
          </div>
          <p className="inv-sub">Manage Customer credit limits, Vendor payment terms, and GSTIN verification</p>
        </div>

        {/* Sub-tab toggle: Customers vs Suppliers */}
        <div className="time-filter-pills">
          <button
            type="button"
            className={`time-pill ${activeSubTab === 'customers' ? 'active' : ''}`}
            onClick={() => { setActiveSubTab('customers'); setSearchQuery(''); }}
          >
            <Users size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Customers (Debtors)
          </button>
          <button
            type="button"
            className={`time-pill ${activeSubTab === 'suppliers' ? 'active' : ''}`}
            onClick={() => { setActiveSubTab('suppliers'); setSearchQuery(''); }}
          >
            <Building2 size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Suppliers (Creditors)
          </button>
        </div>
      </div>

      {/* Control bar */}
      <div className="inv-controls-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder={`Search ${activeSubTab} by name, GSTIN, city...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Total {activeSubTab === 'customers' ? 'Receivable' : 'Payable'}:
            </span>
            <span style={{ display: 'block', fontWeight: 800, fontFamily: 'var(--font-heading)', color: activeSubTab === 'customers' ? '#047857' : '#B45309' }}>
              {formatINR(totalOutstanding)}
            </span>
          </div>

          <button 
            type="button" 
            className="btn-create-invoice"
            onClick={() => onAddParty && onAddParty(activeSubTab)}
          >
            <Plus size={16} />
            <span>+ Add {activeSubTab === 'customers' ? 'Customer' : 'Supplier'}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive-container">
        <table className="nis-data-table">
          <thead>
            <tr>
              <th>Party ID</th>
              <th>Business / Legal Name</th>
              <th>GSTIN</th>
              <th>Contact Phone</th>
              <th>Location</th>
              <th className="text-right">Outstanding Balance (₹)</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((party) => (
              <tr key={party.id} className="nis-table-row">
                <td>
                  <span className="sku-code">{party.id}</span>
                </td>
                <td>
                  <div className="party-cell">
                    <span className="party-name">{party.name}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Verified GST Taxpayer</span>
                  </div>
                </td>
                <td>
                  <span className="hsn-tag">{party.gstin}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}>
                    <Phone size={13} color="var(--primary-light)" />
                    <span>{party.phone}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}>
                    <MapPin size={13} color="var(--text-muted)" />
                    <span>{party.city}, {party.state}</span>
                  </div>
                </td>
                <td className="text-right font-bold">
                  <span style={{ color: party.balance > 0 ? (activeSubTab === 'customers' ? '#059669' : '#D97706') : '#64748B' }}>
                    {formatINR(party.balance)}
                  </span>
                </td>
                <td className="text-center">
                  <button 
                    type="button" 
                    className="action-icon-btn" 
                    style={{ margin: '0 auto' }}
                    title="View Party Ledger Statement"
                    onClick={() => alert(`Ledger statement for ${party.name} opened.`)}
                  >
                    {activeSubTab === 'customers' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
