import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Tag,
  DollarSign,
  Layers,
  FileText,
  CheckCircle2,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateProductPage({ products, setProducts }) {
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    name: '',
    sku: `NIS-SKU-${Math.floor(100 + Math.random() * 900)}`,
    category: 'ERP Solutions',
    price: '₹22,000',
    frequency: '/ year',
    description: 'Enterprise license tier with automated cloud synchronization and daily backup snapshots.',
    available: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.price.trim()) {
      toast.error('Please enter product name and pricing.');
      return;
    }

    const newProduct = {
      id: `PROD-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formState.name.trim(),
      sku: formState.sku.trim() || `NIS-SKU-${Math.floor(100 + Math.random() * 900)}`,
      category: formState.category,
      price: formState.price.startsWith('₹') ? formState.price.trim() : `₹${formState.price.trim()}`,
      frequency: formState.frequency,
      description: formState.description.trim(),
      available: formState.available
    };

    setProducts([newProduct, ...products]);
    toast.success(`Product "${newProduct.name}" added to catalog!`, {
      style: {
        borderRadius: '12px',
        background: '#0f172a',
        color: '#ffffff',
        fontSize: '0.85rem'
      }
    });

    navigate('/admin/product');
  };

  return (
    <div className="adm-create-page-container animate-fade-in">
      {/* Top Navigation & Header */}
      <div className="adm-create-page-header">
        <div className="adm-create-header-left">
          <div className="adm-breadcrumb-row">
            <span className="adm-breadcrumb-mute">Admin</span>
            <span className="adm-breadcrumb-sep">/</span>
            <span
              className="adm-breadcrumb-link"
              onClick={() => navigate('/admin/product')}
            >
              Product Catalog
            </span>
            <span className="adm-breadcrumb-sep">/</span>
            <span className="adm-breadcrumb-active">Add Product</span>
          </div>

          <div className="adm-create-title-group">
            <h1 className="adm-section-title">Add New Product / License Edition</h1>
            <p className="adm-section-sub">
              Publish ERP software tiers, cloud VPS hypervisor specifications, or automated integration modules to the customer portal.
            </p>
          </div>
        </div>

        <div className="adm-create-header-action">
          <button
            type="button"
            className="adm-back-btn"
            onClick={() => navigate('/admin/product')}
          >
            <ArrowLeft size={16} />
            <span>Back to Products</span>
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="adm-table-card adm-form-card">
        <form onSubmit={handleSubmit}>
          {/* Section 1: Product Classification */}
          <div className="adm-form-section">
            <div className="adm-form-section-title">
              <Package size={18} className="adm-form-section-icon purple" />
              <span>Product Classification &amp; Identity</span>
            </div>

            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label className="adm-form-label">Product / Edition Name *</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter product name"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">SKU / License Code *</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter SKU / license code"
                  value={formState.sku}
                  onChange={(e) => setFormState({ ...formState, sku: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Solution Category</label>
                <select
                  className="adm-form-input"
                  value={formState.category}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                >
                  <option>ERP Solutions</option>
                  <option>Cloud Hosting</option>
                  <option>Infrastructure</option>
                  <option>Automation</option>
                  <option>Security &amp; Backup</option>
                </select>
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Catalog Availability</label>
                <select
                  className="adm-form-input"
                  value={formState.available ? 'active' : 'disabled'}
                  onChange={(e) => setFormState({ ...formState, available: e.target.value === 'active' })}
                >
                  <option value="active">Active &amp; Available to Order</option>
                  <option value="disabled">Disabled / Hidden</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Description */}
          <div className="adm-form-section" style={{ marginTop: '28px' }}>
            <div className="adm-form-section-title">
              <Tag size={18} className="adm-form-section-icon emerald" />
              <span>Pricing Structure &amp; Specifications</span>
            </div>

            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label className="adm-form-label">Base Price (₹) *</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter product price"
                  value={formState.price}
                  onChange={(e) => setFormState({ ...formState, price: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Billing Frequency</label>
                <select
                  className="adm-form-input"
                  value={formState.frequency}
                  onChange={(e) => setFormState({ ...formState, frequency: e.target.value })}
                >
                  <option value="/ year">Annual Billing (/ year)</option>
                  <option value="/ month">Monthly Billing (/ month)</option>
                  <option value="one-time">One-Time Perpetual License</option>
                </select>
              </div>

              <div className="adm-form-field full-width" style={{ gridColumn: '1 / -1' }}>
                <label className="adm-form-label">Edition Technical Summary / Highlights</label>
                <textarea
                  className="adm-form-input"
                  rows={3}
                  placeholder="Enter product description and specifications"
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="adm-form-footer">
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={() => navigate('/admin/product')}
            >
              Cancel
            </button>
            <button type="submit" className="adm-btn-primary">
              <Plus size={16} />
              <span>Publish to Product Catalog</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
