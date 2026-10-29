import React, { useState, useMemo } from 'react';
import { Plus, Package, X, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductSection({ products, setProducts }) {
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [newProductForm, setNewProductForm] = useState({
    name: '',
    sku: '',
    category: 'ERP Solutions',
    price: '₹20,000',
    frequency: '/ year',
    description: ''
  });

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      const matchesCategory =
        categoryFilter === 'all' || p.category.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

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

  // Add Product
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProductForm.name || !newProductForm.price) {
      toast.error('Please provide product name and pricing.');
      return;
    }
    const newProd = {
      id: `PROD-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newProductForm.name,
      sku: newProductForm.sku || `NIS-SKU-${Math.floor(100 + Math.random() * 900)}`,
      category: newProductForm.category,
      price: newProductForm.price,
      frequency: newProductForm.frequency,
      description: newProductForm.description || 'Enterprise ERP / Infrastructure tier.',
      available: true
    };
    setProducts([newProd, ...products]);
    setIsAddProductModalOpen(false);
    setNewProductForm({
      name: '',
      sku: '',
      category: 'ERP Solutions',
      price: '₹20,000',
      frequency: '/ year',
      description: ''
    });
    toast.success(`Product ${newProd.name} added to live catalog!`);
  };

  return (
    <div className="adm-table-card">
      {/* 1. Header with Title on Left and Primary Action Button on Right */}
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <h1 className="adm-section-title">
            Product Catalog &amp; Pricing Management
          </h1>
          <p className="adm-section-sub">
            Add, edit, and toggle real-time availability of Tally Prime editions, VPS servers, and automation add-ons.
          </p>
        </div>

        <div className="adm-card-header-action">
          <button
            type="button"
            className="adm-btn-primary"
            onClick={() => setIsAddProductModalOpen(true)}
          >
            <Plus size={16} />
            <span>Add Product</span>
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
              placeholder="Search by product name, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="adm-search-input"
              style={{ width: '100%', height: '36px' }}
            />
          </div>

          <select
            className="adm-select-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories ({products.length})</option>
            <option value="Cloud Infrastructure">Cloud Infrastructure</option>
            <option value="ERP Solutions">ERP Solutions</option>
            <option value="SaaS Addon">SaaS Addons</option>
          </select>
        </div>

        <div className="adm-table-record-count">
          Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> editions
        </div>
      </div>

      {/* 3. Scrollable Product Cards Grid */}
      <div style={{ padding: '24px 28px', maxHeight: '540px', overflowY: 'auto' }}>
        <div className="adm-products-grid" style={{ marginBottom: 0 }}>
          {filteredProducts.map((prod) => (
            <div key={prod.id} className="adm-product-card">
              <div className="adm-product-card-top">
                <span className="adm-product-badge">{prod.category}</span>
                <span className={`adm-status-pill ${prod.available ? 'active' : 'suspended'}`}>
                  {prod.available ? 'Available' : 'Disabled'}
                </span>
              </div>

              <h3 className="adm-product-name">{prod.name}</h3>
              <span className="adm-product-sku">SKU: {prod.sku}</span>

              <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 16px' }}>
                {prod.description}
              </p>

              <div className="adm-product-price">
                <span>{prod.price}</span>
                <span className="adm-product-price-freq"> {prod.frequency}</span>
              </div>

              <div className="adm-product-footer">
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                  Live Availability
                </span>
                <label className="adm-switch">
                  <input
                    type="checkbox"
                    checked={prod.available}
                    onChange={() => handleToggleProduct(prod.id)}
                  />
                  <span className="adm-slider" />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Table Footer */}
      <div className="adm-table-footer">
        <span>Instant tier provisioning configured on Eastern India Cloud Nodes</span>
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          Active Available Tiers: {products.filter(p => p.available).length}
        </span>
      </div>

      {/* ADD PRODUCT MODAL */}
      {isAddProductModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsAddProductModalOpen(false)}>
          <div className="adm-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">Add New Product to Catalog</h3>
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
                      placeholder="e.g. Tally Prime Gold 3-User Pack"
                      value={newProductForm.name}
                      onChange={(e) =>
                        setNewProductForm({ ...newProductForm, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="adm-form-field">
                    <label className="adm-form-label">Category</label>
                    <select
                      className="adm-form-input"
                      value={newProductForm.category}
                      onChange={(e) =>
                        setNewProductForm({ ...newProductForm, category: e.target.value })
                      }
                    >
                      <option>ERP Solutions</option>
                      <option>Infrastructure</option>
                      <option>Cloud Hosting</option>
                      <option>Automation</option>
                      <option>Security &amp; Backup</option>
                    </select>
                  </div>

                  <div className="adm-form-field">
                    <label className="adm-form-label">Price &amp; Billing Cycle *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                      <input
                        type="text"
                        className="adm-form-input"
                        placeholder="e.g. ₹24,000"
                        value={newProductForm.price}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, price: e.target.value })
                        }
                        required
                      />
                      <select
                        className="adm-form-input"
                        value={newProductForm.frequency}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, frequency: e.target.value })
                        }
                      >
                        <option value="/ year">/ year</option>
                        <option value="/ month">/ month</option>
                        <option value="one-time">One-time</option>
                      </select>
                    </div>
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

