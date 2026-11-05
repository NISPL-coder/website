import React, { useState, useEffect } from 'react';
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
  Plus,
  Server,
  Globe,
  Users,
  Cpu,
  HardDrive,
  Sliders,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationApi } from '../../../services/notificationApi';
import { productApi } from '../../../services/productApi';
import { customSelectStyles } from './reactSelectStyles';
import { useIsMobile, useIsPhone } from '../../../utils/useResponsive';

// Official CtrlS Cloud Server Configuration Reference Matrix
export const CTRLS_STANDARD_MATRIX = [
  { user: 1, userLabel: '1 User', config: '2 core/3 GB/50 GB', cores: '2 core', ram: '3 GB', storage: '50 GB', price: 500, ip: '103.115.220.41' },
  { user: 2, userLabel: '2 User', config: '3 core/3 GB/50 GB', cores: '3 core', ram: '3 GB', storage: '50 GB', price: 1000, ip: '103.115.220.42' },
  { user: 3, userLabel: '3 User', config: '4core/4GB/100GB', cores: '4core', ram: '4GB', storage: '100GB', price: 1500, ip: '103.115.220.43' },
  { user: 4, userLabel: '4 User', config: '4core/6GB/100GB', cores: '4core', ram: '6GB', storage: '100GB', price: 2000, ip: '103.115.220.44' },
  { user: 5, userLabel: '5 User', config: '4core/8GB/100GB', cores: '4core', ram: '8GB', storage: '100GB', price: 2500, ip: '103.115.220.45' },
  { user: 6, userLabel: '6 User', config: '4core/9GB/100GB', cores: '4core', ram: '9GB', storage: '100GB', price: 3000, ip: '103.115.220.46' },
  { user: 7, userLabel: '7 User', config: '4core/10GB/100GB', cores: '4core', ram: '10GB', storage: '100GB', price: 3500, ip: '103.115.220.47' },
  { user: 8, userLabel: '8 User', config: '4core/12GB/100GB', cores: '4core', ram: '12GB', storage: '100GB', price: 4000, ip: '103.115.220.48' },
  { user: 9, userLabel: '9 User', config: '4core/13GB/100GB', cores: '4core', ram: '13GB', storage: '100GB', price: 4500, ip: '103.115.220.49' },
  { user: 10, userLabel: '10 User', config: '6 core/12 GB/100GB', cores: '6 core', ram: '12 GB', storage: '100GB', price: 5000, ip: '103.115.220.50' },
  { user: 12, userLabel: '12 User', config: '8 core/16 GB/150GB', cores: '8 core', ram: '16 GB', storage: '150GB', price: 6000, ip: '103.115.220.52' },
  { user: 15, userLabel: '15 User', config: '8core/20GB/150GB', cores: '8core', ram: '20GB', storage: '150GB', price: 7500, ip: '103.115.220.55' },
  { user: 20, userLabel: '20 User', config: '8core/24GB/200GB', cores: '8core', ram: '24GB', storage: '200GB', price: 10000, ip: '103.115.220.60' },
  { user: 30, userLabel: '30 User', config: '8core/32GB/300GB', cores: '8core', ram: '32GB', storage: '300GB', price: 15000, ip: '103.115.220.70' }
];

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
    returnPath: '/admin/product/tally'
  },
  cloud: {
    label: 'Cloud Infrastructure',
    pageTitle: 'Create CtrlS Cloud Server Product',
    pageSubtitle:
      'Publish CtrlS Kolkata Tier-4 datacenter VPS nodes based on verified User & Server Configuration specifications.',
    categories: [
      { value: 'Infrastructure', label: 'Infrastructure (CtrlS VPS)' },
      { value: 'Cloud Hosting', label: 'Cloud Hosting' },
      { value: 'Automation', label: 'Automation & Add-ons' },
      { value: 'Security & Backup', label: 'Security & Backup' }
    ],
    defaultCategory: 'Infrastructure',
    defaultPrice: '₹4,500',
    defaultFrequency: '/ month',
    defaultDescription:
      'Tier-4 CtrlS Kolkata Datacenter VPS hosting node with dedicated IP address, N+N redundancy, and 24/7 SLA.',
    returnPath: '/admin/product/cloud'
  }
};

const CLOUD_PROVIDER_OPTIONS = [
  { value: 'ctrls-cloud', label: 'CtrlS Cloud Server (Tier-4 Datacenter)' }
];

const AVAILABILITY_OPTIONS = [
  { value: 'active', label: 'Active & Available to Order (Live in Store)' },
  { value: 'disabled', label: 'Disabled / Hidden from Customers' }
];

const FREQUENCY_OPTIONS = [
  { value: '/ month', label: 'Monthly Billing (/ month)' },
  { value: '/ year', label: 'Annual Billing (/ year)' },
  { value: 'one-time', label: 'One-Time Perpetual License' }
];

export default function CreateProductPage({ products, setProducts, productType = 'tally' }) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isPhone = useIsPhone();

  const config = PRODUCT_TYPE_CONFIG[productType] || PRODUCT_TYPE_CONFIG.tally;
  const isCloud = productType === 'cloud';
  const isCtrlS = isCloud;

  // Default selection for CtrlS: 9 User
  const defaultTemplate = CTRLS_STANDARD_MATRIX.find((m) => m.user === 9) || CTRLS_STANDARD_MATRIX[0];

  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(8); // 9 User
  const [customUser, setCustomUser] = useState(defaultTemplate.user);
  const [customCores, setCustomCores] = useState(defaultTemplate.cores);
  const [customRam, setCustomRam] = useState(defaultTemplate.ram);
  const [customStorage, setCustomStorage] = useState(defaultTemplate.storage);

  const [formState, setFormState] = useState({
    name: isCtrlS ? `CtrlS Cloud Server — ${defaultTemplate.userLabel}` : (isCloud ? 'Cloud Server Tier' : ''),
    provider: isCloud ? 'ctrls-cloud' : 'tally',
    ipAddress: isCtrlS ? defaultTemplate.ip : (isCloud ? `103.115.220.${Math.floor(71 + Math.random() * 20)}` : ''),
    sku: `NIS-${isCloud ? 'CTRLS' : 'SKU'}-${Math.floor(100 + Math.random() * 900)}`,
    users: defaultTemplate.user,
    tier: defaultTemplate.userLabel,
    cores: defaultTemplate.cores,
    ram: defaultTemplate.ram,
    storage: defaultTemplate.storage,
    serverConfiguration: defaultTemplate.config,
    category: config.defaultCategory,
    price: `₹${defaultTemplate.price.toLocaleString('en-IN')}`,
    frequency: config.defaultFrequency,
    description: config.defaultDescription,
    available: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // When a template from the CtrlS Standard Matrix is chosen
  const handleSelectTemplate = (template, idx) => {
    setSelectedTemplateIndex(idx);
    setCustomUser(template.user);
    setCustomCores(template.cores);
    setCustomRam(template.ram);
    setCustomStorage(template.storage);

    setFormState((prev) => ({
      ...prev,
      name: `CtrlS Cloud Server — ${template.userLabel}`,
      tier: template.userLabel,
      users: template.user,
      cores: template.cores,
      ram: template.ram,
      storage: template.storage,
      serverConfiguration: template.config,
      ipAddress: template.ip,
      sku: `NIS-CTRLS-${template.user}U`,
      price: `₹${template.price.toLocaleString('en-IN')}`,
      description: `CtrlS Kolkata Tier-4 Datacenter Cloud Server (${template.config}) with N+N dual power feed redundancy.`
    }));
  };

  // Recompute Server Configuration string when manual parts change
  const handleConfigPartsChange = (newCores, newRam, newStorage, newUser) => {
    setCustomCores(newCores);
    setCustomRam(newRam);
    setCustomStorage(newStorage);
    setCustomUser(newUser);

    const formattedConfig = `${newCores}/${newRam}/${newStorage}`;
    const calculatedPrice = newUser * 500;

    setFormState((prev) => ({
      ...prev,
      name: `CtrlS Cloud Server — ${newUser} User`,
      tier: `${newUser} User`,
      users: newUser,
      cores: newCores,
      ram: newRam,
      storage: newStorage,
      serverConfiguration: formattedConfig,
      price: `₹${calculatedPrice.toLocaleString('en-IN')}`,
      description: `CtrlS Kolkata Tier-4 Datacenter Cloud Server (${formattedConfig}) with N+N dual power feed redundancy.`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.price.trim()) {
      toast.error('Please enter product name and pricing.');
      return;
    }

    setIsSubmitting(true);

    const priceClean = formState.price.startsWith('₹') ? formState.price.trim() : `₹${formState.price.trim()}`;
    const monthlyNum = Number(String(formState.price).replace(/[^0-9]/g, '')) || 0;
    const ipClean = isCloud
      ? (formState.ipAddress.trim() || `103.115.220.${Math.floor(71 + Math.random() * 20)}`)
      : (formState.ipAddress.trim() || '103.115.220.12');

    const finalServerConfig = isCtrlS
      ? (formState.serverConfiguration || `${customCores}/${customRam}/${customStorage}`)
      : formState.serverConfiguration;

    const payload = {
      name: formState.name.trim(),
      provider: isCloud ? formState.provider : 'tally',
      ipAddress: ipClean,
      sku: formState.sku.trim() || `NIS-CTRLS-${formState.users || 1}U`,
      category: formState.category,
      price: priceClean,
      monthlyPrice: monthlyNum,
      frequency: formState.frequency,
      tier: formState.tier.trim() || `${formState.users || 1} User`,
      users: Number(formState.users) || 1,
      serverConfiguration: finalServerConfig,
      userBadge: finalServerConfig,
      cores: formState.cores || customCores,
      ram: formState.ram || customRam,
      storage: formState.storage || customStorage,
      description: formState.description.trim() || `CtrlS Kolkata Tier-4 Cloud Server (${finalServerConfig})`,
      available: formState.available,
      status: formState.available ? 'active' : 'inactive',
      specs: isCloud
        ? [
            { label: 'Server Configuration', value: finalServerConfig },
            { label: 'CPU', value: formState.cores || customCores },
            { label: 'RAM', value: formState.ram || customRam },
            { label: 'Storage', value: formState.storage || customStorage },
            { label: 'Static IP', value: ipClean },
            { label: 'Datacenter', value: 'CtrlS Kolkata Tier-4' }
          ]
        : [],
      features: isCloud
        ? [
            `Tier-4 CtrlS Kolkata Datacenter Hosting (Dedicated Static IP: ${ipClean})`,
            `Server Configuration: ${finalServerConfig}`,
            'Windows Server licence, enterprise SSD array & daily snapshot image',
            'N+N dual power feed redundancy with 99.995% uptime guarantee'
          ]
        : []
    };

    try {
      const created = await productApi.createProduct(payload);
      const finalProduct = created || { id: `PROD-${Date.now()}`, ...payload };

      setProducts([finalProduct, ...products]);

      // Dispatch real-time product notification to admin
      notificationApi.createNotification({
        type: 'product_created',
        title: isCtrlS ? 'CtrlS Cloud Node Provisioned' : 'Product Added to Catalog',
        message: `Product "${finalProduct.name}" (${finalProduct.price} ${finalProduct.frequency}, Config: ${finalServerConfig}, IP: ${ipClean}) was added to catalog.`,
        severity: 'info',
        entityType: 'product',
        entityId: finalProduct.id || String(Date.now()),
        metadata: { ipAddress: ipClean, price: finalProduct.price, provider: payload.provider, config: finalServerConfig }
      });

      toast.success(`CtrlS Product "${finalProduct.name}" published to database!`, {
        style: {
          borderRadius: '12px',
          background: '#0f172a',
          color: '#ffffff',
          fontSize: '0.85rem'
        }
      });

      navigate(config.returnPath);
    } catch (err) {
      console.error('Failed to create product:', err);
      toast.error(err.message || 'Failed to create product.');
    } finally {
      setIsSubmitting(false);
    }
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
              onClick={() =>
                navigate(config.returnPath)
              }
            >
              {isCtrlS ? 'CtrlS Cloud Server' : config.label}
            </span>
            <span className="adm-breadcrumb-sep">/</span>
            <span className="adm-breadcrumb-active">Add Product</span>
          </div>

          <div className="adm-create-title-group">
            <h1 className="adm-section-title">
              {isCtrlS ? 'Add CtrlS Cloud Server Product' : config.pageTitle}
            </h1>
            <p className="adm-section-sub">
              {isCtrlS
                ? 'Create CtrlS Tier-4 Cloud Server tiers based on verified User & Server Configuration specifications.'
                : config.pageSubtitle}
            </p>
          </div>
        </div>

        <div className="adm-create-header-action">
          <button
            type="button"
            className="adm-back-btn"
            onClick={() =>
              navigate(config.returnPath)
            }
          >
            <ArrowLeft size={16} />
            <span>Back to Products</span>
          </button>
        </div>
      </div>

      {/* CtrlS Standard Matrix Reference & Quick Template Selector */}
      {isCtrlS && (
        <div
          className="adm-table-card"
          style={{
            marginBottom: '24px',
            padding: '24px 26px',
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
            border: '1.5px solid #e2e8f0'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={18} color="#4f46e5" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                CtrlS Cloud Server Configuration Matrix (Verified Specs)
              </h3>
            </div>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                color: '#4338ca',
                background: '#ede9fe',
                padding: '3px 10px',
                borderRadius: '999px'
              }}
            >
              Click any tier below to auto-populate form
            </span>
          </div>

          {/* Quick-select chips grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(3, minmax(0, 1fr))' : 'repeat(7, minmax(0, 1fr))',
              gap: '10px'
            }}
          >
            {CTRLS_STANDARD_MATRIX.map((m, idx) => {
              const isSelected = selectedTemplateIndex === idx;
              return (
                <button
                  key={m.user}
                  type="button"
                  onClick={() => handleSelectTemplate(m, idx)}
                  style={{
                    border: isSelected ? '2px solid #6366f1' : '1px solid #cbd5e1',
                    background: isSelected ? '#eef2ff' : '#ffffff',
                    borderRadius: '10px',
                    padding: '10px 8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(99, 102, 241, 0.15)' : 'none'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: isSelected ? '#4338ca' : '#0f172a' }}>
                    {m.userLabel}
                  </div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.68rem',
                      color: isSelected ? '#4f46e5' : '#64748b',
                      marginTop: '3px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={m.config}
                  >
                    {m.config}
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#10b981', marginTop: '2px' }}>
                    ₹{m.price.toLocaleString('en-IN')}/mo
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Form Container */}
      <div className="adm-table-card adm-form-card">
        <form onSubmit={handleSubmit}>
          {/* Section 1: User & Server Configuration (The Required Format) */}
          <div className="adm-form-section">
            <div className="adm-form-section-title">
              <Server size={18} className="adm-form-section-icon purple" />
              <span>
                {isCtrlS
                  ? 'User & Server Configuration (CtrlS Standard Format)'
                  : 'Product Classification & Identity'}
              </span>
            </div>

            <div className="adm-form-grid">
              {/* Field 1: User */}
              <div className="adm-form-field">
                <label className="adm-form-label">
                  User Capacity (Tier) <span className="adm-required-star">*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    className="adm-form-input"
                    placeholder="e.g. 9"
                    value={customUser}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 1;
                      // Check if matching template exists
                      const match = CTRLS_STANDARD_MATRIX.find((m) => m.user === val);
                      if (match) {
                        handleSelectTemplate(match, CTRLS_STANDARD_MATRIX.indexOf(match));
                      } else {
                        setSelectedTemplateIndex(null);
                        handleConfigPartsChange(customCores, customRam, customStorage, val);
                      }
                    }}
                    required
                    style={{ maxWidth: '120px' }}
                  />
                  <input
                    type="text"
                    className="adm-form-input"
                    value={formState.tier}
                    onChange={(e) => setFormState({ ...formState, tier: e.target.value })}
                    placeholder="e.g. 9 User"
                    style={{ flex: 1 }}
                    required
                  />
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                  Standard formats: 1 User, 2 User, 3 User, 4 User, 5 User, 6 User, 7 User, 8 User, 9 User, 10 User, 12 User, 15 User, 20 User, 30 User
                </span>
              </div>

              {/* Field 2: Product Name */}
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Product / Edition Name <span className="adm-required-star">*</span>
                </label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="e.g. CtrlS Cloud Server — 9 User"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  required
                />
              </div>

              {/* Dedicated Static IP Address */}
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Dedicated Static IP Address <span className="adm-required-star">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="adm-form-input"
                    placeholder="e.g. 103.115.220.49"
                    value={formState.ipAddress}
                    onChange={(e) => setFormState({ ...formState, ipAddress: e.target.value })}
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: '#1e293b',
                      paddingRight: '75px'
                    }}
                    required
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '0.68rem',
                      color: '#6366f1',
                      background: '#eef2ff',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 600
                    }}
                  >
                    Tier-4 Pool
                  </span>
                </div>
              </div>

              {/* Cloud Provider Select */}
              <div className="adm-form-field">
                <label className="adm-form-label">Cloud Infrastructure Provider</label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={false}
                  options={CLOUD_PROVIDER_OPTIONS}
                  value={
                    CLOUD_PROVIDER_OPTIONS.find((c) => c.value === formState.provider) ||
                    CLOUD_PROVIDER_OPTIONS[0]
                  }
                  onChange={(opt) =>
                    setFormState({ ...formState, provider: opt?.value || 'ctrls-cloud' })
                  }
                  classNamePrefix="react-select"
                />
              </div>
            </div>

            {/* Server Configuration Breakdown (Cores / RAM / Storage) */}
            <div
              style={{
                marginTop: '20px',
                padding: '20px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
                  Server Configuration Specification (Required Format: <span style={{ fontFamily: 'monospace', color: '#4f46e5' }}>core/RAM/Storage</span>)
                </span>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    color: '#4338ca',
                    background: '#ede9fe',
                    padding: '3px 12px',
                    borderRadius: '6px'
                  }}
                >
                  {formState.serverConfiguration || `${customCores}/${customRam}/${customStorage}`}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isPhone ? 'minmax(0, 1fr)' : 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>
                {/* Part 1: Cores */}
                <div>
                  <label className="adm-form-label" style={{ fontSize: '0.8rem' }}>
                    CPU Cores
                  </label>
                  <input
                    type="text"
                    className="adm-form-input"
                    placeholder="e.g. 4core or 4 core"
                    value={customCores}
                    onChange={(e) =>
                      handleConfigPartsChange(e.target.value, customRam, customStorage, customUser)
                    }
                    style={{ fontFamily: 'monospace', fontWeight: 600 }}
                    required
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '3px' }}>
                    Examples: 2 core, 3 core, 4core, 6 core, 8core
                  </span>
                </div>

                {/* Part 2: RAM */}
                <div>
                  <label className="adm-form-label" style={{ fontSize: '0.8rem' }}>
                    RAM Allocation
                  </label>
                  <input
                    type="text"
                    className="adm-form-input"
                    placeholder="e.g. 13GB or 12 GB"
                    value={customRam}
                    onChange={(e) =>
                      handleConfigPartsChange(customCores, e.target.value, customStorage, customUser)
                    }
                    style={{ fontFamily: 'monospace', fontWeight: 600 }}
                    required
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '3px' }}>
                    Examples: 3 GB, 4GB, 6GB, 8GB, 9GB, 10GB, 12 GB, 13GB, 16 GB, 20GB, 24GB, 32GB
                  </span>
                </div>

                {/* Part 3: Storage */}
                <div>
                  <label className="adm-form-label" style={{ fontSize: '0.8rem' }}>
                    SSD Storage
                  </label>
                  <input
                    type="text"
                    className="adm-form-input"
                    placeholder="e.g. 100GB or 50 GB"
                    value={customStorage}
                    onChange={(e) =>
                      handleConfigPartsChange(customCores, customRam, e.target.value, customUser)
                    }
                    style={{ fontFamily: 'monospace', fontWeight: 600 }}
                    required
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '3px' }}>
                    Examples: 50 GB, 100GB, 150GB, 200GB, 300GB
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Availability */}
          <div className="adm-form-section" style={{ marginTop: '28px' }}>
            <div className="adm-form-section-title">
              <Tag size={18} className="adm-form-section-icon emerald" />
              <span>Pricing Structure &amp; Availability</span>
            </div>

            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Base Price (₹) <span className="adm-required-star">*</span>
                </label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="e.g. 4500"
                  value={formState.price}
                  onChange={(e) => setFormState({ ...formState, price: e.target.value })}
                  required
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                  Standard rate: ₹500 × {customUser} User = ₹{(customUser * 500).toLocaleString('en-IN')} / month
                </span>
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Billing Frequency</label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={false}
                  options={FREQUENCY_OPTIONS}
                  value={
                    FREQUENCY_OPTIONS.find((f) => f.value === formState.frequency) ||
                    FREQUENCY_OPTIONS[0]
                  }
                  onChange={(opt) =>
                    setFormState({ ...formState, frequency: opt?.value || '/ month' })
                  }
                  classNamePrefix="react-select"
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Catalog Availability</label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={false}
                  options={AVAILABILITY_OPTIONS}
                  value={
                    AVAILABILITY_OPTIONS.find(
                      (a) => a.value === (formState.available ? 'active' : 'disabled')
                    ) || AVAILABILITY_OPTIONS[0]
                  }
                  onChange={(opt) =>
                    setFormState({ ...formState, available: opt?.value === 'active' })
                  }
                  classNamePrefix="react-select"
                />
              </div>

              <div className="adm-form-field full-width" style={{ gridColumn: '1 / -1' }}>
                <label className="adm-form-label">Technical Summary &amp; SLA Details</label>
                <textarea
                  className="adm-form-input"
                  rows={2}
                  placeholder="Enter datacenter tier, power redundancy, and specifications"
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
              onClick={() =>
                navigate(config.returnPath)
              }
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="adm-btn-primary" disabled={isSubmitting}>
              <Plus size={16} />
              <span>{isSubmitting ? 'Provisioning...' : 'Provision CtrlS Server Node'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
