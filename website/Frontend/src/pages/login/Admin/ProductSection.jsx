import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  ArrowRight,
  ArrowLeft,
  Cloud,
  Trash2,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import tallyLogo from '../../../assets/partners/tally.png';
import { compactSelectStyles } from './reactSelectStyles';
import AdminDataTable from './AdminDataTable';
import { compareNumber, compareText } from './adminTableUtils';
import { usePermissions } from './PermissionsContext';

export default function ProductSection({ products, setProducts }) {
  const { can } = usePermissions();
  const navigate = useNavigate();
  // Navigation State: null = 2-card Solution selection view; 'tally' | 'cloud' = category catalog
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const category = new URLSearchParams(window.location.search).get('category');
    return category === 'tally' || category === 'cloud' ? category : null;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

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
    }).sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });
  }, [products, selectedCategory, searchQuery, availabilityFilter]);

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

  const columns = [
    {
      id: 'name',
      name: 'Product Name & Overview',
      selector: (row) => row.name,
      sortable: true,
      sortFunction: compareText((row) => row.name),
      minWidth: '340px',
      grow: 1.6,
      wrap: true,
      cell: (prod) => (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{prod.name}</div>
          <div
            style={{
              fontSize: '0.74rem',
              color: '#64748b',
              maxWidth: '380px',
              whiteSpace: 'normal',
              lineHeight: 1.45
            }}
          >
            {prod.description}
          </div>
        </div>
      )
    },
    {
      id: 'sku',
      name: 'SKU Code',
      selector: (row) => row.sku,
      sortable: true,
      sortFunction: compareText((row) => row.sku),
      minWidth: '175px',
      cell: (prod) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#6366f1' }}>
          {prod.sku}
        </span>
      )
    },
    {
      id: 'category',
      name: 'Category / Tier',
      selector: (row) => row.category,
      sortable: true,
      sortFunction: compareText((row) => row.category),
      minWidth: '175px',
      cell: (prod) => <span className="adm-product-badge">{prod.category}</span>
    },
    {
      id: 'price',
      name: 'Pricing & Billing',
      selector: (row) => row.price,
      sortable: true,
      sortFunction: compareNumber((row) => row.price),
      minWidth: '175px',
      cell: (prod) => (
        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.94rem' }}>
          {prod.price}
          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
            {' '}{prod.frequency}
          </span>
        </div>
      )
    },
    {
      id: 'available',
      name: 'Live Availability',
      selector: (row) => (row.available ? 1 : 0),
      sortable: true,
      sortFunction: compareNumber((row) => (row.available ? 1 : 0)),
      minWidth: '210px',
      cell: (prod) => (
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
      )
    },
    {
      id: 'actions',
      name: 'Actions',
      center: true,
      width: '135px',
      ignoreRowClick: true,
      cell: (prod) => (
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
      )
    }
  ];

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
              </div>
              <p className="adm-section-sub">
                Select a solution category below to browse verified software licenses and cloud infrastructure.
              </p>
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
              <h1 className="adm-section-title">
                {selectedCategory === 'tally'
                  ? 'Tally Prime & Customization Editions'
                  : 'Cloud Hosting & Server Infrastructure'}
              </h1>

              <p className="adm-section-sub">
                {selectedCategory === 'tally'
                  ? 'Manage official Tally Prime software licenses, multi-user editions, and TSS renewals.'
                  : 'Manage CtrlS Kolkata datacenter VPS nodes, cloud server tiers, and backup vaults.'}
              </p>
            </div>

            <div className="adm-card-header-action">
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

              {can('product', 'create') && (
                <button
                  type="button"
                  className="adm-btn-primary"
                  onClick={() =>
                    navigate(
                      selectedCategory === 'tally'
                        ? '/admin/product/tally/create'
                        : '/admin/product/cloud/create'
                    )
                  }
                >
                  <Plus size={16} />
                  <span>
                    {selectedCategory === 'tally' ? 'Add Tally Product' : 'Add Cloud Product'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Filter / Search Toolbar */}
          <div className="adm-table-toolbar">
            <div className="adm-search-box adm-search-box-toolbar">
              <Search size={16} className="adm-search-icon" />
              <input
                type="text"
                placeholder="Search by product name, SKU..."
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

            <div className="adm-table-filters">
              <div className="adm-filter-select-wrap">
                <Select
                  styles={compactSelectStyles}
                  isSearchable={false}
                  options={[
                    { value: 'all', label: `All Statuses (${currentCategoryProducts.length})` },
                    { value: 'available', label: 'Active & Available Only' },
                    { value: 'disabled', label: 'Disabled Only' }
                  ]}
                  value={{
                    value: availabilityFilter,
                    label:
                      availabilityFilter === 'all'
                        ? `All Statuses (${currentCategoryProducts.length})`
                        : availabilityFilter === 'available'
                        ? 'Active & Available Only'
                        : 'Disabled Only'
                  }}
                  onChange={(opt) => setAvailabilityFilter(opt ? opt.value : 'all')}
                  classNamePrefix="react-select"
                />
              </div>
            </div>
          </div>

          {/* Product Catalog DataTable */}
          <AdminDataTable
            columns={columns}
            data={currentCategoryProducts}
            keyField="id"
            defaultSortFieldId="sku"
            defaultSortAsc={false}
            resetPageToken={`${searchQuery}|${availabilityFilter}|${selectedCategory}`}
            minWidth={1250}
            noDataMessage="No products found"
            noDataHint="Try a different search term or availability filter."
            ariaLabel="Product catalog"
            scrollHeight="600px"
          />

          {/* Table Footer */}
          <div className="adm-table-footer">
            <span>Enterprise cloud node provisioning and Tally licenses synced with ERP</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>
              Active Available Products: {currentCategoryProducts.filter((p) => p.available).length}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
