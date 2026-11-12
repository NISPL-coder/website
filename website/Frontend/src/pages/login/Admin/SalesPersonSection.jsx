import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Select from 'react-select';
import {
  UserCheck,
  Users,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Phone,
  Mail,
  Briefcase,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { salesPersonApi } from '../../../services/salesPersonApi';
import AdminDataTable from './AdminDataTable';
import DeleteConfirmModal from './DeleteConfirmModal';
import { compareText } from './adminTableUtils';
import { customSelectStyles, compactSelectStyles } from './reactSelectStyles';

const STATUS_PORTAL_OPTIONS = [
  { value: 'Active', label: 'Active (Visible in Customer Portal)' },
  { value: 'Inactive', label: 'Inactive (Hidden from Portal)' }
];

/** Modal for Adding or Editing a Sales Representative */
function SalesPersonModal({ isOpen, onClose, onSave, person = null, isSaving = false }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    status: 'Active',
    notes: ''
  });

  useEffect(() => {
    if (person) {
      setFormData({
        name: person.name || '',
        email: person.email || '',
        phone: person.phone || '',
        designation: person.designation || '',
        status: person.status || 'Active',
        notes: person.notes || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        designation: '',
        status: 'Active',
        notes: ''
      });
    }
  }, [person, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSaving) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isSaving]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Representative name is required');
      return;
    }
    onSave(formData);
  };

  const modalNode = (
    <div
      className="adm-modal-backdrop-portal"
      onClick={isSaving ? undefined : onClose}
    >
      <div
        className="adm-modal-container animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px' }}
      >
        {/* Header */}
        <div className="adm-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4f46e5'
              }}
            >
              <UserCheck size={18} />
            </div>
            <div>
              <h3 className="adm-modal-title" style={{ fontSize: '1.15rem', fontWeight: 600 }}>
                {person ? 'Edit Sales Person' : 'Add Sales Person'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', fontWeight: 400 }}>
                Configure sales representative and portal visibility
              </p>
            </div>
          </div>
          <button
            type="button"
            className="adm-modal-close-btn"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="adm-modal-body" style={{ maxHeight: 'calc(85vh - 140px)', overflowY: 'auto' }}>
            <div className="adm-form-grid" style={{ gap: '16px' }}>
              <div className="adm-form-field">
                <label className="adm-form-label" style={{ fontWeight: 500 }}>
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="adm-form-input"
                  style={{ fontWeight: 400 }}
                  autoFocus
                />
                <span style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                  This exact name appears in the Customer Portal order term dropdown.
                </span>
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label" style={{ fontWeight: 500 }}>
                  Designation / Role
                </label>
                <input
                  type="text"
                  placeholder="Enter your Designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="adm-form-input"
                  style={{ fontWeight: 400 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div className="adm-form-field">
                  <label className="adm-form-label" style={{ fontWeight: 500 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="adm-form-input"
                    style={{ fontWeight: 400 }}
                  />
                </div>
                <div className="adm-form-field">
                  <label className="adm-form-label" style={{ fontWeight: 500 }}>
                    Phone / Mobile
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="adm-form-input"
                    style={{ fontWeight: 400 }}
                  />
                </div>
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label" style={{ fontWeight: 500 }}>
                  Customer Portal Visibility
                </label>
                <Select
                  isSearchable={true}
                  placeholder="Select Status"
                  options={STATUS_PORTAL_OPTIONS}
                  value={
                    STATUS_PORTAL_OPTIONS.find((opt) => opt.value === formData.status) ||
                    STATUS_PORTAL_OPTIONS[0]
                  }
                  onChange={(opt) =>
                    setFormData({ ...formData, status: opt ? opt.value : 'Active' })
                  }
                  styles={{
                    ...customSelectStyles,
                    control: (base, state) => ({
                      ...customSelectStyles.control(base, state),
                      height: '42px',
                      minHeight: '42px',
                      borderRadius: '8px'
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999999 })
                  }}
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                  classNamePrefix="react-select"
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label" style={{ fontWeight: 500 }}>
                  Notes / Territory Allocation (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter your Notes / Territory Details"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="adm-form-input"
                  style={{ height: 'auto', padding: '10px 14px', resize: 'vertical', fontWeight: 400 }}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="adm-modal-footer">
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={onClose}
              disabled={isSaving}
              style={{ fontWeight: 500 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="adm-btn-primary"
              disabled={isSaving}
              style={{ fontWeight: 500 }}
            >
              <Check size={16} />
              <span>{isSaving ? 'Saving...' : person ? 'Update Representative' : 'Save Representative'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
}

export default function SalesPersonSection({ externalSearch = '' }) {
  const [salesPersons, setSalesPersons] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(externalSearch);
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedKey, setCopiedKey] = useState(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State for Delete
  const [deletingPerson, setDeletingPerson] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Live dynamic stats derived straight from current salesPersons array
  const liveStats = useMemo(() => {
    const total = salesPersons.length;
    const active = salesPersons.filter(
      (sp) => String(sp.status || '').toLowerCase() === 'active'
    ).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [salesPersons]);

  const fetchSalesPersons = async () => {
    setIsLoading(true);
    try {
      const res = await salesPersonApi.getAll();
      if (res && res.success !== false) {
        setSalesPersons(Array.isArray(res.data) ? res.data : []);
        if (res.stats) {
          setStats(res.stats);
        }
      } else {
        setSalesPersons([]);
        setStats({ total: 0, active: 0, inactive: 0 });
      }
    } catch (err) {
      console.warn('Failed to fetch sales persons:', err?.message);
      setSalesPersons([]);
      setStats({ total: 0, active: 0, inactive: 0 });
      toast.error('Could not load sales persons');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesPersons();
  }, []);

  useEffect(() => {
    if (externalSearch !== undefined && externalSearch !== null) {
      setSearchQuery(externalSearch);
    }
  }, [externalSearch]);

  const copyToClipboard = (text, key, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${label || 'text'}!`, { id: `copy-${key}` });
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleOpenAddModal = () => {
    setEditingPerson(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (person) => {
    setEditingPerson(person);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (person) => {
    const nextStatus = person.status === 'Active' ? 'Inactive' : 'Active';
    const id = person.id || person.salesPersonId || person._id;
    const toastId = toast.loading(`Updating status for ${person.name}...`);
    try {
      await salesPersonApi.update(id, { status: nextStatus });
      setSalesPersons((prev) =>
        prev.map((p) =>
          p.id === id || p.salesPersonId === id || p._id === id ? { ...p, status: nextStatus } : p
        )
      );
      toast.success(`${person.name} is now ${nextStatus}`, { id: toastId });
    } catch (err) {
      toast.error(err.message || 'Failed to update status', { id: toastId });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPerson) return;
    const id = deletingPerson.id || deletingPerson.salesPersonId || deletingPerson._id;
    setIsDeleting(true);
    const toastId = toast.loading(`Deleting ${deletingPerson.name}...`);
    try {
      await salesPersonApi.delete(id);
      setSalesPersons((prev) => prev.filter((p) => p.id !== id && p.salesPersonId !== id && p._id !== id));
      toast.success(`Deleted ${deletingPerson.name}`, { id: toastId });
      setDeletingPerson(null);
      await fetchSalesPersons();
    } catch (err) {
      toast.error(err.message || 'Failed to delete sales person', { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSavePerson = async (formData) => {
    setIsSubmitting(true);
    const toastId = toast.loading(
      editingPerson ? `Updating ${formData.name}...` : `Saving ${formData.name}...`
    );

    try {
      if (editingPerson) {
        const id = editingPerson.id || editingPerson.salesPersonId || editingPerson._id;
        await salesPersonApi.update(id, formData);
        toast.success(`Updated ${formData.name}`, { id: toastId });
      } else {
        await salesPersonApi.create(formData);
        toast.success(`Added ${formData.name}`, { id: toastId });
      }
      setIsModalOpen(false);
      setEditingPerson(null);
      fetchSalesPersons();
    } catch (err) {
      toast.error(err.message || 'Failed to save sales person', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPersons = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    return salesPersons.filter((sp) => {
      const matchesSearch =
        !q ||
        (sp.name || '').toLowerCase().includes(q) ||
        (sp.email || '').toLowerCase().includes(q) ||
        (sp.phone || '').toLowerCase().includes(q) ||
        (sp.designation || '').toLowerCase().includes(q) ||
        (sp.salesPersonId || '').toLowerCase().includes(q) ||
        (sp.id || '').toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' ||
        String(sp.status || '').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [salesPersons, searchQuery, statusFilter]);

  const statusOptions = useMemo(() => [
    { value: 'all', label: `All Statuses (${stats.total})` },
    { value: 'active', label: `Active Only (${stats.active})` },
    { value: 'inactive', label: `Inactive Only (${stats.inactive})` }
  ], [stats]);

  const columns = [
    {
      id: 'sno',
      name: 'S/No.',
      selector: (_row, idx) => idx + 1,
      width: '70px',
      center: true,
      cell: (_row, idx) => (
        <span style={{ color: '#94a3b8', fontSize: '0.84rem', fontWeight: 400 }}>
          {idx + 1}
        </span>
      )
    },
    {
      id: 'id',
      name: 'Code',
      selector: (row) => row.salesPersonId || row.id,
      autoSizeValue: (row) => row.salesPersonId || row.id,
      sortable: true,
      sortFunction: compareText((row) => row.salesPersonId || row.id),
      width: '105px',
      cell: (row) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 500, color: '#4f46e5', fontSize: '0.84rem' }}>
          {row.salesPersonId || row.id || 'SP-—'}
        </span>
      )
    },
    {
      id: 'name',
      name: 'Sales Person Name',
      selector: (row) => row.name,
      autoSizeValue: (row) => row.name,
      sortable: true,
      sortFunction: compareText((row) => row.name),
      minWidth: '200px',
      grow: 1.2,
      cell: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '4px 0' }}>
          <span style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.9rem' }}>
            {row.name}
          </span>
          {row.notes && (
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 400 }}>
              {row.notes}
            </span>
          )}
        </div>
      )
    },
    {
      id: 'designation',
      name: 'Designation / Role',
      selector: (row) => row.designation,
      autoSizeValue: (row) => row.designation,
      sortable: true,
      sortFunction: compareText((row) => row.designation),
      minWidth: '180px',
      cell: (row) => (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          {row.designation && <Briefcase size={13} color="#64748b" />}
          <span style={{ fontSize: '0.84rem', color: row.designation ? '#334155' : '#94a3b8', fontWeight: 400 }}>
            {row.designation || '—'}
          </span>
        </div>
      )
    },
    {
      id: 'email',
      name: 'Email Address',
      selector: (row) => row.email,
      autoSizeValue: (row) => row.email,
      sortable: true,
      sortFunction: compareText((row) => row.email),
      minWidth: '220px',
      cell: (row) => {
        const email = row.email || '—';
        const isCopied = copiedKey === `email-${row.id}`;
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={13} color="#94a3b8" />
            <span style={{ fontSize: '0.84rem', color: row.email ? '#0f172a' : '#94a3b8', fontWeight: 400 }}>
              {email}
            </span>
            {row.email && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(row.email, `email-${row.id}`, 'Email');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isCopied ? '#16a34a' : '#94a3b8',
                  padding: '2px',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
                title="Copy Email"
              >
                {isCopied ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
              </button>
            )}
          </div>
        );
      }
    },
    {
      id: 'phone',
      name: 'Mobile / Phone',
      selector: (row) => row.phone,
      autoSizeValue: (row) => row.phone,
      sortable: true,
      sortFunction: compareText((row) => row.phone),
      minWidth: '160px',
      cell: (row) => {
        const phone = row.phone || '—';
        const isCopied = copiedKey === `phone-${row.id}`;
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={13} color="#94a3b8" />
            <span
              style={{
                fontSize: '0.84rem',
                fontFamily: 'monospace',
                color: row.phone ? '#0f172a' : '#94a3b8',
                fontWeight: 400
              }}
            >
              {phone}
            </span>
            {row.phone && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(row.phone, `phone-${row.id}`, 'Phone');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isCopied ? '#16a34a' : '#94a3b8',
                  padding: '2px',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
                title="Copy Phone"
              >
                {isCopied ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
              </button>
            )}
          </div>
        );
      }
    },
    {
      id: 'status',
      name: 'Status',
      selector: (row) => row.status,
      sortable: true,
      width: '120px',
      cell: (row) => {
        const isActive = row.status === 'Active';
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(row);
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer'
            }}
            title={`Click to toggle ${isActive ? 'Inactive' : 'Active'}`}
          >
            <span className={`adm-status-pill ${isActive ? 'active' : 'inactive'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </button>
        );
      }
    },
    {
      id: 'actions',
      name: 'Actions',
      width: '100px',
      center: true,
      button: true,
      allowOverflow: true,
      ignoreRowClick: true,
      cell: (row) => (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditModal(row);
            }}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '6px 8px',
              cursor: 'pointer',
              color: '#475569',
              display: 'inline-flex',
              alignItems: 'center',
              transition: 'all 0.15s ease'
            }}
            title="Edit Sales Person"
          >
            <Edit2 size={13} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeletingPerson(row);
            }}
            style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '6px',
              padding: '6px 8px',
              cursor: 'pointer',
              color: '#e11d48',
              display: 'inline-flex',
              alignItems: 'center',
              transition: 'all 0.15s ease'
            }}
            title="Delete Sales Person"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="adm-table-card animate-fade-in">
      {/* 1. Header with Title on Left and Primary Action Button on Right */}
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <h1 className="adm-section-title">Sales Person Allocation</h1>
          <p className="adm-section-sub">
            Manage sales team representatives and dynamic customer portal allocation.
          </p>
        </div>

        <div className="adm-card-header-action">
          <button
            type="button"
            className="adm-btn-primary"
            onClick={handleOpenAddModal}
          >
            <Plus size={16} />
            <span>Add Sales Person</span>
          </button>
        </div>
      </div>

      {/* 2. Metric Quick Stat Cards */}
      <div className="adm-customer-summary-grid">
        <div
          className={`adm-cust-stat-card ${statusFilter === 'all' ? 'selected' : ''}`}
          onClick={() => setStatusFilter('all')}
          style={{ cursor: 'pointer' }}
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Total Sales Team</span>
            <Users size={18} className="adm-cust-stat-icon purple" />
          </div>
          <span className="adm-cust-stat-val">{liveStats.total}</span>
          <span className="adm-cust-stat-desc">All registered representatives</span>
        </div>

        <div
          className={`adm-cust-stat-card ${statusFilter === 'active' ? 'selected' : ''}`}
          onClick={() => setStatusFilter('active')}
          style={{ cursor: 'pointer' }}
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Active</span>
            <CheckCircle2 size={18} className="adm-cust-stat-icon emerald" />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#059669' }}>
            {liveStats.active}
          </span>
          <span className="adm-cust-stat-desc">Live in customer portal dropdown</span>
        </div>

        <div
          className={`adm-cust-stat-card ${statusFilter === 'inactive' ? 'selected' : ''}`}
          onClick={() => setStatusFilter('inactive')}
          style={{ cursor: 'pointer' }}
        >
          <div className="adm-cust-stat-top">
            <span className="adm-cust-stat-label">Inactive / Hidden</span>
            <XCircle size={18} className="adm-cust-stat-icon red" />
          </div>
          <span className="adm-cust-stat-val" style={{ color: '#dc2626' }}>
            {liveStats.inactive}
          </span>
          <span className="adm-cust-stat-desc">Hidden from portal dropdown</span>
        </div>
      </div>

      {/* 3. Controls & Search Toolbar with React Select Searchable Filter */}
      <div className="adm-table-toolbar">
        <div className="adm-search-box adm-search-box-toolbar">
          <Search className="adm-search-icon" size={16} />
          <input
            type="text"
            placeholder="Search Sales Person..."
            className="adm-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="adm-search-clear"
              aria-label="Clear search"
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="adm-table-filters">
          <div className="adm-filter-select-wrap">
            <Select
              styles={compactSelectStyles}
              isSearchable={true}
              options={statusOptions}
              value={statusOptions.find((opt) => opt.value === statusFilter) || statusOptions[0]}
              onChange={(opt) => setStatusFilter(opt ? opt.value : 'all')}
              classNamePrefix="react-select"
              placeholder="Select Status"
            />
          </div>
        </div>
      </div>

      {/* 4. Table */}
      <AdminDataTable
        columns={columns}
        data={filteredPersons}
        loading={isLoading}
        keyField="id"
        searchPlaceholder="Filter sales persons..."
      />

      {/* 5. Add / Edit Modal (Portal) */}
      <SalesPersonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePerson}
        person={editingPerson}
        isSaving={isSubmitting}
      />

      {/* 6. Delete Confirmation Modal (Portal) */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingPerson)}
        title="Delete Sales Representative"
        itemName={deletingPerson?.name}
        itemType="sales representative"
        onConfirm={handleConfirmDelete}
        onCancel={() => !isDeleting && setDeletingPerson(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
