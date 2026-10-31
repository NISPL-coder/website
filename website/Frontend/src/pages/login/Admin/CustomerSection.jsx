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
  AlertCircle,
  ExternalLink,
  RotateCw,
  Eye,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { useTableSort, SortableTh } from './tableSortUtils';
import { CountUp } from '../../Dashboard/utils/useCountUp';
import { compactSelectStyles } from './reactSelectStyles';
import ExportDropdown from './ExportDropdown';
import { formatCustomersForExport } from './exportUtils';
import { customerApi } from '../../../services/customerApi';
import RowActionMenu from './RowActionMenu';
import ViewCustomerModal from './ViewCustomerModal';
import EditCustomerModal from './EditCustomerModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { generateCustomerPdf } from './utils/generateCustomerPdf';
import { Printer } from 'lucide-react';

export default function CustomerSection({ customers, setCustomers }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'demo' | 'inactive'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [syncingIds, setSyncingIds] = useState({});

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
      const sangamId = (c.sangamCrm?.recordId || '').toLowerCase();
      const sangamStatus = (c.sangamCrm?.status || '').toLowerCase();

      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        sangamId.includes(q) ||
        sangamStatus.includes(q) ||
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

  
  const handleCustomerUpdated = (updated) => {
    const cId = updated.id || updated.customerId;
    setCustomers((prev) =>
      prev.map((c) => ((c.id === cId || c.customerId === cId) ? updated : c))
    );
    if (selectedCustomer && (selectedCustomer.id === cId || selectedCustomer.customerId === cId)) {
      setSelectedCustomer(updated);
    }
  };

  const handleConfirmDeleteCustomer = async () => {
    if (!deletingCustomer) return;
    setIsDeleting(true);
    const cId = deletingCustomer.id || deletingCustomer.customerId;
    try {
      await customerApi.deleteCustomer(cId);
      setCustomers((prev) => prev.filter((c) => c.id !== cId && c.customerId !== cId));
      toast.success(`Customer "${deletingCustomer.company || deletingCustomer.name}" deleted successfully.`);
      setDeletingCustomer(null);
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Multi-column Ascending/Descending Sorting Hook
  const { sortedItems: sortedCustomers, sortConfig, requestSort } = useTableSort(
    filteredCustomers,
    'id',
    'asc'
  );

  // Retry Sangam CRM Synchronization
  const handleRetrySync = async (e, customer) => {
    if (e) e.stopPropagation();
    const custId = customer.id || customer.customerId;
    setSyncingIds((prev) => ({ ...prev, [custId]: true }));
    const toastId = toast.loading(`Retrying Sangam CRM sync for ${customer.company}...`);

    try {
      const res = await customerApi.retrySangamSync(custId);
      if (res.success) {
        setCustomers((prev) =>
          prev.map((c) =>
            (c.id === custId || c.customerId === custId)
              ? { ...c, sangamCrm: res.sangamCrm }
              : c
          )
        );
        if (selectedCustomer && (selectedCustomer.id === custId || selectedCustomer.customerId === custId)) {
          setSelectedCustomer((prev) => ({ ...prev, sangamCrm: res.sangamCrm }));
        }
        toast.success(
          `Synchronized to Sangam CRM Companies! (Record ID: ${res.sangamCrm.recordId})`,
          { id: toastId, duration: 4000 }
        );
      } else {
        toast.error(`Sync failed: ${res.sangamCrm?.syncError || 'Unknown error'}`, { id: toastId });
      }
    } catch (err) {
      toast.error(`Sync failed: ${err.message}`, { id: toastId });
    } finally {
      setSyncingIds((prev) => ({ ...prev, [custId]: false }));
    }
  };

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
        <table className="adm-table" style={{ minWidth: '1320px' }}>
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
              <SortableTh
                label="Sangam CRM Status"
                sortKey="sangamCrm.status"
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
                const crm = cust.sangamCrm || { status: 'synced', recordId: `SGM-ACC-${cust.id.replace('CUST-', '')}`, lastSyncedAt: cust.registered };
                const crmStatus = crm.status?.toLowerCase() || 'synced';
                const crmId = crm.recordId;
                const isSyncing = syncingIds[cust.id || cust.customerId];

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

                    {/* Sangam CRM Status Column */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '135px' }}>
                        <div>
                          {crmStatus === 'synced' && (
                            <span
                              className="adm-status-pill active"
                              style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}
                              title={`Synced with Sangam CRM (Record ID: ${crmId})`}
                            >
                              <CheckCircle2 size={11} />
                              <span>Synced</span>
                            </span>
                          )}
                          {crmStatus === 'pending' && (
                            <span
                              className="adm-status-pill demo"
                              style={{ background: '#fffbeb', color: '#d97706', borderColor: '#fde68a' }}
                              title="Waiting for Sangam CRM synchronization"
                            >
                              <Clock size={11} />
                              <span>Pending</span>
                            </span>
                          )}
                          {crmStatus === 'failed' && (
                            <span
                              className="adm-status-pill inactive"
                              style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}
                              title={`Sync error: ${crm.syncError || 'API Failed'}`}
                            >
                              <AlertCircle size={11} />
                              <span>Failed</span>
                            </span>
                          )}
                        </div>

                        {/* Sangam Record ID & Quick CRM link */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ fontSize: '0.70rem', fontFamily: 'monospace', color: '#475569', fontWeight: 600 }}>
                            {crmId || 'No Record ID'}
                          </span>
                          {crmId && (
                            <a
                              href={customerApi.getSangamRecordUrl(crmId)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#6366f1', display: 'inline-flex', alignItems: 'center' }}
                              title="View Company in Sangam CRM"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>

                        {/* Last Sync Timestamp */}
                        {crm.lastSyncedAt && (
                          <span style={{ fontSize: '0.67rem', color: '#94a3b8' }}>
                            {new Date(crm.lastSyncedAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}

                        {/* Retry Sync Button if Failed or Pending */}
                        {(crmStatus === 'failed' || crmStatus === 'pending') && (
                          <button
                            type="button"
                            className="adm-action-pill"
                            onClick={(e) => handleRetrySync(e, cust)}
                            disabled={isSyncing}
                            style={{
                              marginTop: '2px',
                              padding: '2px 8px',
                              fontSize: '0.68rem',
                              color: '#6366f1',
                              borderColor: '#c7d2fe',
                              background: '#f5f3ff',
                              alignSelf: 'flex-start'
                            }}
                          >
                            <RotateCw size={10} className={isSyncing ? 'animate-spin' : ''} />
                            <span>{isSyncing ? 'Syncing...' : 'Retry Sync'}</span>
                          </button>
                        )}
                      </div>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <RowActionMenu
                        onView={() => setSelectedCustomer(cust)}
                        onEdit={() => setEditingCustomer(cust)}
                        onPrint={() => {
                          generateCustomerPdf(cust);
                          toast.success(`PDF generated for ${cust.company || cust.name}`);
                        }}
                        onDelete={() => setDeletingCustomer(cust)}
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b' }}>
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

      {/* View Customer Modal (React Portal) */}
      <ViewCustomerModal
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onEdit={(cust) => {
          setSelectedCustomer(null);
          setEditingCustomer(cust);
        }}
        onRetrySync={handleRetrySync}
        isSyncing={selectedCustomer ? !!syncingIds[selectedCustomer.id || selectedCustomer.customerId] : false}
      />

      {/* Edit Customer Modal */}
      <EditCustomerModal
        customer={editingCustomer}
        isOpen={!!editingCustomer}
        onClose={() => setEditingCustomer(null)}
        onUpdated={handleCustomerUpdated}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingCustomer}
        title="Delete Customer"
        itemName={deletingCustomer?.company || deletingCustomer?.name || 'this customer'}
        itemType="customer"
        onConfirm={handleConfirmDeleteCustomer}
        onCancel={() => setDeletingCustomer(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
