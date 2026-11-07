import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Search,
  X,
  Trash2,
  Edit2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminDataTable from './AdminDataTable';
import AddonFormModal from './AddonFormModal';
import { compareNumber, compareText } from './adminTableUtils';
import { addonApi } from '../../../services/addonApi';

export default function AddonSection({ onBack }) {
  const navigate = useNavigate();

  const [addons, setAddons] = useState([]);
  const [showAddonsOnCheckout, setShowAddonsOnCheckout] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingMaster, setIsTogglingMaster] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState(null);

  const fetchAddonsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await addonApi.getAdminAddons();
      setAddons(data.addons || []);
      setShowAddonsOnCheckout(data.showAddonsOnCheckout ?? true);
    } catch (err) {
      console.error('Failed to load addons:', err);
      toast.error('Failed to load add-ons from server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddonsData();
  }, [fetchAddonsData]);

  // Handle Master Switch Toggle (Show/Hide Add-ons Section on Customer Checkout)
  const handleToggleMasterCheckout = async () => {
    const nextState = !showAddonsOnCheckout;
    // Optimistic UI update
    setShowAddonsOnCheckout(nextState);
    setIsTogglingMaster(true);

    try {
      const res = await addonApi.toggleCheckoutVisibility(nextState);
      toast.success(
        nextState
          ? 'Add-ons section is now VISIBLE on customer checkout page.'
          : 'Add-ons section is now HIDDEN from customer checkout page.',
        {
          id: 'checkout-visibility-toggle',
          style: {
            borderRadius: '10px',
            background: '#0f172a',
            color: '#ffffff',
            fontSize: '0.84rem'
          }
        }
      );
    } catch (err) {
      console.error('Failed to toggle checkout visibility:', err);
      toast.error('Failed to update checkout visibility.');
      // Revert on error
      setShowAddonsOnCheckout(!nextState);
    } finally {
      setIsTogglingMaster(false);
    }
  };

  // Handle Individual Add-on Availability Toggle
  const handleToggleIndividual = async (addonId) => {
    const target = addons.find((a) => a.id === addonId || a._id === addonId);
    if (!target) return;
    const nextAvailable = !target.available;

    // Optimistic UI update
    setAddons((prev) =>
      prev.map((a) => (a.id === addonId || a._id === addonId ? { ...a, available: nextAvailable } : a))
    );

    try {
      await addonApi.toggleAddon(addonId, nextAvailable);
      toast.success(
        nextAvailable
          ? `"${target.name}" is now available in customer checkout.`
          : `"${target.name}" is now disabled in customer checkout.`,
        {
          id: `toggle-addon-${addonId}`,
          style: {
            borderRadius: '10px',
            background: '#0f172a',
            color: '#ffffff',
            fontSize: '0.84rem'
          }
        }
      );
    } catch (err) {
      console.error('Failed to toggle addon:', err);
      toast.error('Failed to update add-on status.');
      // Revert on error
      setAddons((prev) =>
        prev.map((a) => (a.id === addonId || a._id === addonId ? { ...a, available: target.available } : a))
      );
    }
  };

  // Handle Delete Add-on
  const handleDeleteAddon = async (addonId, addonName) => {
    if (window.confirm(`Are you sure you want to remove add-on "${addonName}" from the catalog?`)) {
      setAddons((prev) => prev.filter((a) => a.id !== addonId && a._id !== addonId));
      try {
        await addonApi.deleteAddon(addonId);
        toast.success(`Removed "${addonName}" from catalog.`);
      } catch (err) {
        console.error('Failed to delete add-on:', err);
        toast.error('Failed to delete add-on from server.');
        fetchAddonsData();
      }
    }
  };

  // Filtered & Sorted Table Rows
  const filteredAddons = useMemo(() => {
    return addons.filter((a) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.name?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q) ||
        a.spec?.toLowerCase().includes(q) ||
        a.desc?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'available' && a.available !== false) ||
        (statusFilter === 'disabled' && a.available === false);

      return matchesSearch && matchesStatus;
    });
  }, [addons, searchQuery, statusFilter]);

  // Table Columns Definition
  const columns = [
    {
      id: 'sno',
      name: 'S/No.',
      width: '70px',
      center: true,
      cell: (_row, index) => (
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
          {index + 1}
        </span>
      )
    },
    {
      id: 'name',
      name: 'Add-On Product',
      sortable: true,
      minWidth: '240px',
      sortFunction: compareText((row) => row.name),
      cell: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>
              {row.name}
            </span>
            {row.badge && (
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: row.badgeBg || '#ecfdf5',
                  color: row.badgeColor || '#059669',
                  border: `1px solid ${row.badgeColor || '#059669'}30`
                }}
              >
                {row.badge}
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
            {row.category || 'General Add-on'}
          </span>
        </div>
      )
    },
    {
      id: 'specs',
      name: 'Specification & Description',
      minWidth: '260px',
      cell: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {row.spec && (
            <span style={{
              display: 'inline-block',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: '#475569',
              background: '#f1f5f9',
              padding: '1px 8px',
              borderRadius: '6px',
              width: 'fit-content'
            }}>
              {row.spec}
            </span>
          )}
          <span style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.35 }}>
            {row.desc || '—'}
          </span>
        </div>
      )
    },
    {
      id: 'price',
      name: 'Pricing & Billing',
      sortable: true,
      minWidth: '180px',
      sortFunction: compareNumber((row) => row.amount || row.basePrice || 0),
      cell: (row) => {
        const base = Number(row.amount || row.basePrice || 0);
        const gst = Math.round(base * 0.18);
        const total = base + gst;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
              ₹{base.toLocaleString('en-IN')}{' '}
              <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
                / {row.billingCycle || 'Annual'}
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
              ₹{total.toLocaleString('en-IN')} (incl. 18% GST)
            </span>
          </div>
        );
      }
    },
    {
      id: 'available',
      name: 'Live Availability',
      minWidth: '170px',
      sortable: true,
      sortFunction: compareNumber((row) => (row.available !== false ? 1 : 0)),
      cell: (row) => {
        const isLive = row.available !== false;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label className="adm-switch">
              <input
                type="checkbox"
                checked={isLive}
                onChange={() => handleToggleIndividual(row.id || row._id)}
              />
              <span className="adm-slider" />
            </label>
            <span
              className={`adm-status-pill ${isLive ? 'active' : 'suspended'}`}
              style={{ fontSize: '0.72rem', padding: '3px 8px', fontWeight: 600 }}
            >
              {isLive ? 'Available' : 'Disabled'}
            </span>
          </div>
        );
      }
    },
    {
      id: 'actions',
      name: 'Actions',
      width: '130px',
      center: true,
      ignoreRowClick: true,
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="adm-action-pill"
            style={{ color: '#4f46e5', borderColor: '#e0e7ff' }}
            onClick={() => {
              setEditingAddon(row);
              setIsModalOpen(true);
            }}
            title="Edit add-on details"
          >
            <Edit2 size={13} />
            <span>Edit</span>
          </button>
          <button
            type="button"
            className="adm-action-pill"
            style={{ color: '#dc2626', borderColor: '#fecaca' }}
            onClick={() => handleDeleteAddon(row.id || row._id, row.name)}
            title="Delete this add-on"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      )
    }
  ];

  const handleReturn = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/admin/product');
    }
  };

  return (
    <div className="adm-table-card animate-fade-in">
      {/* Header */}
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="adm-section-title">Checkout Add-Ons Management</h1>
          </div>
          <p className="adm-section-sub">
            Create and configure optional add-on products with amount and pricing, and toggle whether the add-ons block appears during customer checkout.
          </p>
        </div>

        <div className="adm-card-header-action">
          <button
            type="button"
            className="adm-btn-secondary"
            onClick={handleReturn}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            <ArrowLeft size={14} />
            <span>Back to Products</span>
          </button>

          <button
            type="button"
            className="adm-btn-primary"
            onClick={() => {
              setEditingAddon(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Add New Add-On</span>
          </button>
        </div>
      </div>

      {/* MASTER TOGGLE SWITCH BANNER */}
      <div style={{
        margin: '16px 24px',
        padding: '18px 22px',
        borderRadius: '14px',
        background: showAddonsOnCheckout
          ? 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)'
          : 'linear-gradient(135deg, #fffbeb 0%, #fef2f2 100%)',
        border: showAddonsOnCheckout ? '1px solid #bbf7d0' : '1px solid #fecaca',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: showAddonsOnCheckout ? '#dcfce7' : '#fee2e2',
            color: showAddonsOnCheckout ? '#15803d' : '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {showAddonsOnCheckout ? <Eye size={22} /> : <EyeOff size={22} />}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                Customer Checkout Add-Ons Display
              </h3>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 10px',
                  borderRadius: '999px',
                  background: showAddonsOnCheckout ? '#15803d' : '#991b1b',
                  color: '#ffffff'
                }}
              >
                {showAddonsOnCheckout ? 'VISIBLE AT CHECKOUT' : 'HIDDEN FROM CHECKOUT'}
              </span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
              {showAddonsOnCheckout
                ? 'Active: The Add-Ons carousel section is rendered on the Customer Checkout page (/customer/cart). Customers can browse and add these options to their cart.'
                : 'Disabled: The Add-Ons section is completely hidden from Customer Checkout (/customer/cart). Customers proceed directly to payment without seeing add-ons.'}
            </p>
          </div>
        </div>

        {/* Master Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
            Show on Checkout:
          </span>
          <label className="adm-switch" style={{ transform: 'scale(1.15)' }}>
            <input
              type="checkbox"
              checked={showAddonsOnCheckout}
              onChange={handleToggleMasterCheckout}
              disabled={isTogglingMaster}
            />
            <span className="adm-slider" />
          </label>
        </div>
      </div>

      {/* Filter / Search Toolbar */}
      <div className="adm-table-toolbar">
        <div className="adm-search-box adm-search-box-toolbar">
          <Search size={16} className="adm-search-icon" />
          <input
            type="text"
            placeholder="Search by add-on name, category, or spec..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="adm-search-input"
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

        <div className="adm-toolbar-actions">
          <select
            className="adm-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses ({addons.length})</option>
            <option value="available">
              Available ({addons.filter((a) => a.available !== false).length})
            </option>
            <option value="disabled">
              Disabled ({addons.filter((a) => a.available === false).length})
            </option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="adm-table-container">
        <AdminDataTable
          columns={columns}
          data={filteredAddons}
          progressPending={isLoading}
          noDataComponent={
            <div className="admin-datatable-empty" style={{ padding: '60px 20px' }}>
              <span className="admin-datatable-empty-icon">
                <Sparkles size={24} />
              </span>
              <div className="admin-datatable-empty-title">No Add-Ons Found</div>
              <div className="admin-datatable-empty-hint">
                {searchQuery
                  ? 'No add-on products matched your search filter.'
                  : 'Get started by creating your first optional add-on product for customer checkout.'}
              </div>
              <button
                type="button"
                className="adm-btn-primary"
                style={{ marginTop: '14px' }}
                onClick={() => {
                  setEditingAddon(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus size={15} />
                <span>Create Add-On</span>
              </button>
            </div>
          }
        />
      </div>

      {/* Add-on Creation & Edit Modal */}
      {isModalOpen && (
        <AddonFormModal
          addon={editingAddon}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAddon(null);
          }}
          onSaved={() => {
            fetchAddonsData();
          }}
        />
      )}
    </div>
  );
}

