import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
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
import { customSelectStyles } from './reactSelectStyles';

const PRODUCT_TYPE_CONFIG = {
  tally: {
    label: 'Tally Prime',
    pageTitle: 'Add Tally Prime Product / License Edition',
    pageSubtitle:
      'Publish official Tally Prime software editions, multi-user licenses, and customization modules to the customer portal.',
    categories: [{ value: 'ERP Solutions', label: 'ERP Solutions' }],
    defaultCategory: 'ERP Solutions',
    defaultPrice: '₹22,000',
    defaultFrequency: '/ year',
    defaultDescription:
      'Official Tally Prime license edition with GST compliance, e-invoicing, and automated data synchronization.',
    returnPath: '/admin/product?category=tally'
  },
  cloud: {
    label: 'Cloud',
    pageTitle: 'Add Cloud Product / Server Tier',
    pageSubtitle:
      'Publish CtrlS Kolkata datacenter VPS nodes, cloud hosting tiers, and managed infrastructure products to the customer portal.',
    categories: [
      { value: 'Cloud Hosting', label: 'Cloud Hosting' },
      { value: 'Infrastructure', label: 'Infrastructure' },
      { value: 'Automation', label: 'Automation' },
      { value: 'Security & Backup', label: 'Security & Backup' }
    ],
    defaultCategory: 'Cloud Hosting',
    defaultPrice: '₹16,500',
    defaultFrequency: '/ month',
    defaultDescription:
      'Managed cloud server tier with dedicated resources, daily snapshots, and 24/7 monitoring support.',
    returnPath: '/admin/product?category=cloud'
  }
};

const AVAILABILITY_OPTIONS = [
  { value: 'active', label: 'Active & Available to Order' },
  { value: 'disabled', label: 'Disabled / Hidden' }
];

const FREQUENCY_OPTIONS = [
  { value: '/ year', label: 'Annual Billing (/ year)' },
  { value: '/ month', label: 'Monthly Billing (/ month)' },
  { value: 'one-time', label: 'One-Time Perpetual License' }
];

export default function CreateProductPage({ products, setProducts, productType = 'tally' }) {
  const navigate = useNavigate();
  const config = PRODUCT_TYPE_CONFIG[productType] || PRODUCT_TYPE_CONFIG.tally;

  const [formState, setFormState] = useState({
    name: '',
    sku: `NIS-SKU-${Math.floor(100 + Math.random() * 900)}`,
    category: config.defaultCategory,
    price: config.defaultPrice,
    frequency: config.defaultFrequency,
    description: config.defaultDescription,
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

    navigate(config.returnPath);
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
              onClick={() => navigate(config.returnPath)}
            >
              {config.label}
            </span>
            <span className="adm-breadcrumb-sep">/</span>
            <span className="adm-breadcrumb-active">Add Product</span>
          </div>

          <div className="adm-create-title-group">
            <h1 className="adm-section-title">{config.pageTitle}</h1>
            <p className="adm-section-sub">
              {config.pageSubtitle}
            </p>
          </div>
        </div>

        <div className="adm-create-header-action">
          <button
            type="button"
            className="adm-back-btn"
            onClick={() => navigate(config.returnPath)}
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
                <label className="adm-form-label">
                  Product / Edition Name <span className="adm-required-star">*</span>
                </label>
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
                <label className="adm-form-label">
                  SKU / License Code <span className="adm-required-star">*</span>
                </label>
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
                <Select
                  styles={customSelectStyles}
                  isSearchable={false}
                  options={config.categories}
                  value={
                    config.categories.find((c) => c.value === formState.category) ||
                    config.categories[0]
                  }
                  onChange={(opt) =>
                    setFormState({ ...formState, category: opt?.value || config.defaultCategory })
                  }
                  classNamePrefix="react-select"
                  isDisabled={config.categories.length === 1}
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Catalog Availability</label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={false}
                  options={AVAILABILITY_OPTIONS}
                  value={AVAILABILITY_OPTIONS.find((a) => a.value === (formState.available ? 'active' : 'disabled')) || AVAILABILITY_OPTIONS[0]}
                  onChange={(opt) => setFormState({ ...formState, available: opt?.value === 'active' })}
                  classNamePrefix="react-select"
                />
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
                <label className="adm-form-label">
                  Base Price (₹) <span className="adm-required-star">*</span>
                </label>
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
                <Select
                  styles={customSelectStyles}
                  isSearchable={false}
                  options={FREQUENCY_OPTIONS}
                  value={FREQUENCY_OPTIONS.find((f) => f.value === formState.frequency) || FREQUENCY_OPTIONS[0]}
                  onChange={(opt) => setFormState({ ...formState, frequency: opt?.value || '/ year' })}
                  classNamePrefix="react-select"
                />
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
              onClick={() => navigate(config.returnPath)}
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
