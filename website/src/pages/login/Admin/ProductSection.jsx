import React, { useState, useMemo } from 'react';
import {
  Plus,
  Package,
  X,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  Cloud,
  ShieldCheck,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import tallyLogo from '../../../assets/partners/tally.png';
import { useTableSort, SortableTh } from './tableSortUtils';

export default function ProductSection({ products, setProducts }) {
  // Navigation State: null = 2-card Solution selection view; 'tally' | 'cloud' = category catalog
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  const [newProductForm, setNewProductForm] = useState({
    name: '',
    sku: '',
    category: 'ERP Solutions',
    price: '₹20,000',
    frequency: '/ year',
    description: ''
  });

  // Calculate counts for categories
  const tallyCount = useMemo(() => {
    return products.filter((p) =>
      p.category?.toLowerCase().includes('erp') ||
      p.name?.toLowerCase().includes('tally')
    ).length;
  }, [products]);

  const cloudCount = useMemo(() => {
    return products.filter((p) =>
      p.category?.toLowerCase().includes('cloud') ||
      p.category?.toLowerCase().includes('infra') ||
      p.category?.toLowerCase().includes('security') ||
      p.category?.toLowerCase().includes('automation') ||
      p.name?.toLowerCase().includes('vps') ||
      p.name?.toLowerCase().includes('cloud')
    ).length;
  }, [products]);

  // Filter products by selected category, search, and availability
  const currentCategoryProducts = useMemo(() => {
    let list = products;
    if (selectedCategory === 'tally') {
      list = products.filter((p) =>
        p.category?.toLowerCase().includes('erp') ||
        p.name?.toLowerCase().includes('tally')
      );
    } else if (selectedCategory === 'cloud') {
      list = products.filter((p) =>
        p.category?.toLowerCase().includes('cloud') ||
        p.category?.toLowerCase().includes('infra') ||
        p.category?.toLowerCase().includes('security') ||
        p.category?.toLowerCase().includes('automation') ||
        p.name?.toLowerCase().includes('vps') ||
        p.name?.toLowerCase().includes('cloud')
      );
    }

    return list.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q);

      const matchesAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && p.available) ||
        (availabilityFilter === 'disabled' && !p.available);

      return matchesSearch && matchesAvailability;
    });
  }, [products, selectedCategory, searchQuery, availabilityFilter]);

  // Multi-column sorting for product table
  const { sortedItems: sortedProducts, sortConfig, requestSort } = useTableSort(
    currentCategoryProducts,
    'name',
    'asc'
  );

  // Toggle availability
  const handleToggleProduct = (productId) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updated = !p.available;
          toast.success(`${p.name} is now ${updated ? 'Active & Available' : 'Disabled'}.`);
          return { ...p, available: updated };
        }
        return p;
      })
    );
  };

  // Delete product
  const handleDeleteProduct = (productId, productName) => {
    if (window.confirm(`Are you sure you want to remove "${productName}" from the catalog?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success(`${productName} removed.`);
    }
  };

  // Add Product Submit
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProductForm.name || !newProductForm.price) {
      toast.error('Please provide product name and pricing.');
      return;
    }
    const newProd = {
      id: `PROD-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newProductForm.name.trim(),
      sku: newProductForm.sku.trim() || `NIS-SKU-${Math.floor(100 + Math.random() * 900)}`,
      category: newProductForm.category,
      price: newProductForm.price.trim(),
      frequency: newProductForm.frequency,
      description: newProductForm.description.trim() || 'Enterprise software license / infrastructure tier.',
      available: true
    };
    setProducts([newProd, ...products]);
    setIsAddProductModalOpen(false);
    setNewProductForm({
      name: '',
      sku: '',
      category: selectedCategory === 'cloud' ? 'Cloud Infrastructure' : 'ERP Solutions',
      price: '₹20,000',
      frequency: '/ year',
      description: ''
    });
    toast.success(`Product "${newProd.name}" added to live catalog!`);
  };

  return (
    <>
      {/* =========================================================================
         VIEW 1: INITIAL 2-CARD SOLUTION CATEGORY SELECTION (MATCHES USER SCREENSHOT)
         ========================================================================= */}
      {selectedCategory === null ? (
        <div className="adm-table-card animate-fade-in">
          {/* Header */}
          <div className="adm-card-header">
            <div className="adm-card-header-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 className="adm-section-title">Explore Our Solutions</h1>
                <span className="adm-status-pill active" style={{ fontSize: '0.74rem' }}>
                  <ShieldCheck size={13} />
                  <span>Certified Solutions &amp; Cloud</span>
                </span>
              </div>
              <p className="adm-section-sub">
                Select a solution category below to browse verified software licenses and cloud infrastructure.
              </p>
            </div>

            <div className="adm-card-header-action">
              <button
                type="button"
                className="adm-btn-primary"
                onClick={() => {
                  setNewProductForm((prev) => ({ ...prev, category: 'ERP Solutions' }));
                  setIsAddProductModalOpen(true);
                }}
              >
                <Plus size={16} />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* 2 Big Hero Cards Matching Screenshot */}
          <div style={{ padding: '36px 32px 42px' }}>
            <div className="solutions-cards-grid">
              {/* CARD 1: TALLY PRIME & CUSTOMIZATION */}
              <div
                role="button"
                tabIndex={0}
                className="solution-hero-card tally-theme"
                onClick={() => setSelectedCategory('tally')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedCategory('tally');
                  }
                }}
              >
                <div className="solution-center-logo-box tally-logo-center">
                  <img
                    src={tallyLogo}
                    alt="Tally Prime"
                    className="solution-center-logo-img"
                    loading="lazy"
                  />
                </div>

                <div className="solution-center-info">
                  <h3 className="solution-title tally-title">Tally Prime &amp; Customization</h3>
                  <p className="solution-one-line-desc">
                    Accounting &amp; Business Management Solutions
                  </p>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#b91c1c',
                      background: '#fee2e2',
                      padding: '3px 10px',
                      borderRadius: '999px'
                    }}
                  >
                    {tallyCount} Catalog Editions
                  </span>
                </div>

                <div className="solution-explore-row">
                  <span className="solution-explore-btn tally-btn">
                    <span>Explore Tally Prime</span>
                    <ArrowRight size={16} />
                  </span>
                </div>
              </div>

              {/* CARD 2: CLOUD */}
              <div
                role="button"
                tabIndex={0}
                className="solution-hero-card cloud-theme"
                onClick={() => setSelectedCategory('cloud')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedCategory('cloud');
                  }
                }}
              >
                <div className="solution-center-logo-box cloud-logo-center">
                  <Cloud size={46} strokeWidth={1.8} />
                </div>

                <div className="solution-center-info">
                  <h3 className="solution-title cloud-title">Cloud</h3>
                  <p className="solution-one-line-desc">
                    Cloud Hosting &amp; Remote Business Solutions
                  </p>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#4338ca',
                      background: '#ede9fe',
                      padding: '3px 10px',
                      borderRadius: '999px'
                    }}
                  >
                    {cloudCount} Cloud Server Tiers
                  </span>
                </div>

                <div className="solution-explore-row">
                  <span className="solution-explore-btn cloud-btn">
                    <span>Explore Cloud</span>
                    <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
           VIEW 2: CATEGORY SPECIFIC PRODUCT MANAGEMENT (WITH SORTABLE TABLE)
           ========================================================================= */
        <div className="adm-table-card animate-fade-in">
          {/* Header */}
          <div className="adm-card-header">
            <div className="adm-card-header-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setSelectedCategory(null)}
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                  title="Return to Solution Category Selection"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Solutions</span>
                </button>

                <h1 className="adm-section-title">
                  {selectedCategory === 'tally'
                    ? 'Tally Prime & Customization Editions'
                    : 'Cloud Hosting & Server Infrastructure'}
                </h1>
              </div>

              <p className="adm-section-sub">
                {selectedCategory === 'tally'
                  ? 'Manage official Tally Prime software licenses, multi-user editions, and TSS renewals.'
                  : 'Manage CtrlS Kolkata datacenter VPS nodes, cloud server tiers, and backup vaults.'}
              </p>
            </div>

            <div className="adm-card-header-action">
              <button
                type="button"
                className="adm-btn-primary"
                onClick={() => {
                  setNewProductForm((prev) => ({
                    ...prev,
                    category: selectedCategory === 'tally' ? 'ERP Solutions' : 'Cloud Infrastructure'
                  }));
                  setIsAddProductModalOpen(true);
                }}
              >
                <Plus size={16} />
                <span>
                  {selectedCategory === 'tally' ? 'Add Tally Product' : 'Add Cloud Product'}
                </span>
              </button>
            </div>
          </div>

          {/* Filter / Search Toolbar */}
          <div className="adm-table-toolbar">
            <div className="adm-table-filters">
              <div className="adm-search-box" style={{ width: '280px' }}>
                <Search size={15} className="adm-search-icon" />
                <input
                  type="text"
                  placeholder="Search by product name, SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="adm-search-input"
                  style={{ width: '100%', height: '36px' }}
                />
              </div>

              <select
                className="adm-select-filter"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
              >
                <option value="all">All Statuses ({currentCategoryProducts.length})</option>
                <option value="available">Active &amp; Available Only</option>
                <option value="disabled">Disabled Only</option>
              </select>
            </div>

            <div className="adm-table-record-count">
              Showing <strong>{sortedProducts.length}</strong> of <strong>{currentCategoryProducts.length}</strong> products
            </div>
          </div>

          {/* Table with Vertical & Horizontal Scrolling and Multi-Column Sorting */}
          <div className="adm-table-responsive">
            <table className="adm-table" style={{ minWidth: '1000px' }}>
              <thead>
                <tr>
                  <SortableTh
                    label="Product Name & Overview"
                    sortKey="name"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                  <SortableTh
                    label="SKU Code"
                    sortKey="sku"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                  <SortableTh
                    label="Category / Tier"
                    sortKey="category"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                  <SortableTh
                    label="Pricing & Billing"
                    sortKey="price"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                  <SortableTh
                    label="Live Availability"
                    sortKey="available"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.length > 0 ? (
                  sortedProducts.map((prod) => (
                    <tr key={prod.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{prod.name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', maxWidth: '380px', whiteSpace: 'normal' }}>
                          {prod.description}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#6366f1' }}>
                        {prod.sku}
                      </td>
                      <td>
                        <span className="adm-product-badge">{prod.category}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.94rem' }}>
                          {prod.price}
                          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
                            {' '}{prod.frequency}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label className="adm-switch">
                            <input
                              type="checkbox"
                              checked={prod.available}
                              onChange={() => handleToggleProduct(prod.id)}
                            />
                            <span className="adm-slider" />
                          </label>
                          <span
                            className={`adm-status-pill ${prod.available ? 'active' : 'suspended'}`}
                            style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                          >
                            {prod.available ? 'Available' : 'Disabled'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="adm-action-pill"
                          style={{ color: '#dc2626', borderColor: '#fecaca' }}
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          title="Remove product from catalog"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b' }}>
                      No products found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="adm-table-footer">
            <span>Enterprise cloud node provisioning and Tally licenses synced with ERP</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>
              Active Available Products: {currentCategoryProducts.filter((p) => p.available).length}
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
         ADD PRODUCT MODAL
         ========================================================================= */}
      {isAddProductModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsAddProductModalOpen(false)}>
          <div className="adm-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">
                {selectedCategory === 'tally'
                  ? 'Add New Tally Prime Edition'
                  : selectedCategory === 'cloud'
                  ? 'Add New Cloud Server / Infrastructure Tier'
                  : 'Add New Product to Catalog'}
              </h3>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setIsAddProductModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddProduct}>
              <div className="adm-modal-body">
                <div className="adm-form-grid">
                  <div className="adm-form-field">
                    <label className="adm-form-label">Product Name *</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      placeholder="e.g. Tally Prime Server Edition or Dedicated 16-Core VPS"
                      value={newProductForm.name}
                      onChange={(e) =>
                        setNewProductForm({ ...newProductForm, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="adm-form-field">
                    <label className="adm-form-label">SKU Identifier</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      placeholder="e.g. NIS-TP-SERVER-2026"
                      value={newProductForm.sku}
                      onChange={(e) =>
                        setNewProductForm({ ...newProductForm, sku: e.target.value })
                      }
                    />
                  </div>

                  <div className="adm-form-field">
                    <label className="adm-form-label">Solution Category</label>
                    <select
                      className="adm-form-input"
                      value={newProductForm.category}
                      onChange={(e) =>
                        setNewProductForm({ ...newProductForm, category: e.target.value })
                      }
                    >
                      <option value="ERP Solutions">Tally Prime &amp; Customization (ERP)</option>
                      <option value="Cloud Infrastructure">Cloud Dedicated VPS Server</option>
                      <option value="Cloud Hosting">Tally on Cloud Hosting</option>
                      <option value="Security & Backup">Encrypted Backup &amp; Storage</option>
                      <option value="Automation">WhatsApp / Meta Automation Add-on</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="adm-form-field">
                      <label className="adm-form-label">Price (INR) *</label>
                      <input
                        type="text"
                        className="adm-form-input"
                        placeholder="e.g. ₹25,000"
                        value={newProductForm.price}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, price: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="adm-form-field">
                      <label className="adm-form-label">Billing Frequency</label>
                      <select
                        className="adm-form-input"
                        value={newProductForm.frequency}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, frequency: e.target.value })
                        }
                      >
                        <option value="/ year">/ year (Annual)</option>
                        <option value="/ month">/ month (Monthly)</option>
                        <option value="one-time">One-time / Lifetime</option>
                      </select>
                    </div>
                  </div>

                  <div className="adm-form-field">
                    <label className="adm-form-label">Description / Feature Scope</label>
                    <textarea
                      className="adm-form-input"
                      rows="3"
                      style={{ height: 'auto', padding: '10px' }}
                      placeholder="Brief specifications, CPU cores, RAM, concurrent user access..."
                      value={newProductForm.description}
                      onChange={(e) =>
                        setNewProductForm({ ...newProductForm, description: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setIsAddProductModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="adm-btn-primary">
                  Save Product to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
