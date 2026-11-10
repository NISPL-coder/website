import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  ArrowRight,
  ArrowLeft,
  Cloud,
  Trash2,
  X,
  Copy,
  CheckCircle2,
  Server,
  ShieldCheck,
  Zap,
  Globe,
  Percent,
  Clock,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import tallyLogo from '../../../assets/partners/tally.png';
import ctrlsLogo from '../../../assets/partners/ctrls.png';
import { compactSelectStyles } from './reactSelectStyles';
import AdminDataTable from './AdminDataTable';
import CustomPricingPage from './CustomPricingPage';
import AddonSection from './AddonSection';
import { compareNumber, compareText } from './adminTableUtils';
import { usePermissions } from './PermissionsContext';
import { productApi } from '../../../services/productApi';

export default function ProductSection({ products, setProducts, externalSearch }) {
  const { can, visibleColumns } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // /admin/product · /admin/product/{tally|cloud|addons} · /admin/product/cloud/custom-pricing · /admin/product/cloud/addons
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isAddonsRoute = pathParts.includes('addons');
  const selectedCategory = isAddonsRoute
    ? 'addons'
    : pathParts.includes('tally')
    ? 'tally'
    : pathParts.includes('cloud')
    ? 'cloud'
    : null;
  const selectedView = pathParts.includes('custom-pricing') ? 'custom-pricing' : null;
  const selectedCloudProvider = selectedCategory === 'cloud' ? 'ctrls-cloud' : null;

  const [searchQuery, setSearchQuery] = useState(externalSearch || '');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  useEffect(() => {
    if (externalSearch !== undefined && externalSearch !== null) {
      setSearchQuery(externalSearch);
    }
  }, [externalSearch]);

  // Older ?category=… links keep working by moving the query into the path
  useEffect(() => {
    const legacyCategory = searchParams.get('category');
    if (!legacyCategory) return;
    const legacyAction = searchParams.get('view') === 'custom-pricing' ? '/custom-pricing' : '';
    navigate(`/admin/product/${legacyCategory}${legacyAction}`, { replace: true });
  }, [searchParams, navigate]);

  const productPath = (category = null, action = null) => {
    if (!category) return '/admin/product';
    return action ? `/admin/product/${category}/${action}` : `/admin/product/${category}`;
  };

  const updateRoute = (category, action = null) => navigate(productPath(category, action));

  // Provider configuration matching the customer portal
  const CLOUD_PROVIDERS_CONFIG = [
    {
      id: 'ctrls-cloud',
      name: 'Enterprise Cloud Server',
      oneLiner: 'High-Speed Enterprise Cloud Infrastructure & Compute',
      badge: 'Enterprise Cloud',
      badgeClass: 'positive',
      exploreText: 'Manage Cloud Servers',
      highlights: ['High-Performance Cloud Facility', 'Ultra-Low Latency Bengal Routing', 'Zero-Lag Multi-User Tally Remote'],
      filter: (p) =>
        p.provider === 'ctrls-cloud' ||
        p.id?.startsWith('ctrls-') ||
        p.isDemoPlan === true ||
        p.provider === 'demo' ||
        p.category === 'Trial' ||
        p.isCustomPlan === true
    }
  ];

  // Calculate live counts
  const cloudCount = useMemo(() => {
    return products.filter((p) =>
      p.category?.toLowerCase().includes('cloud') ||
      p.category?.toLowerCase().includes('infra') ||
      p.category?.toLowerCase().includes('security') ||
      p.category?.toLowerCase().includes('automation') ||
      p.name?.toLowerCase().includes('vps') ||
      p.name?.toLowerCase().includes('cloud') ||
      p.provider?.includes('cloud')
    ).length;
  }, [products]);

  const providerCounts = useMemo(() => {
    const counts = {};
    CLOUD_PROVIDERS_CONFIG.forEach((prov) => {
      counts[prov.id] = products.filter(prov.filter).length;
    });
    return counts;
  }, [products]);

  // Filter products for the active table view
  const currentCategoryProducts = useMemo(() => {
    let list = products;
    if (selectedCategory === 'tally') {
      list = products.filter((p) =>
        p.category?.toLowerCase().includes('erp') ||
        p.name?.toLowerCase().includes('tally') ||
        p.provider === 'tally'
      );
    } else if (selectedCategory === 'cloud') {
      if (selectedCloudProvider) {
        const provConfig = CLOUD_PROVIDERS_CONFIG.find((p) => p.id === selectedCloudProvider);
        list = provConfig ? products.filter(provConfig.filter) : products;
      } else {
        list = products.filter((p) =>
          p.category?.toLowerCase().includes('cloud') ||
          p.category?.toLowerCase().includes('infra') ||
          p.category?.toLowerCase().includes('security') ||
          p.category?.toLowerCase().includes('automation') ||
          p.name?.toLowerCase().includes('vps') ||
          p.name?.toLowerCase().includes('cloud') ||
          p.provider?.includes('cloud')
        );
      }
    }

    return list.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const ip = (p.ipAddress || '').toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        ip.includes(q) ||
        (p.tier && p.tier.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q);

      const matchesAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && p.available !== false && p.status !== 'inactive') ||
        (availabilityFilter === 'disabled' && (p.available === false || p.status === 'inactive'));

      return matchesSearch && matchesAvailability;
    }).sort((a, b) => {
      // Demo plans prioritized at top of admin listing
      if (a.isDemoPlan && !b.isDemoPlan) return -1;
      if (!a.isDemoPlan && b.isDemoPlan) return 1;
      // Numerical sort on users/tier if available, else date/id
      if (typeof a.users === 'number' && typeof b.users === 'number') {
        return a.users - b.users;
      }
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return String(a.id || '').localeCompare(String(b.id || ''));
    });
  }, [products, selectedCategory, selectedCloudProvider, searchQuery, availabilityFilter]);

  // Toggle live availability (Active vs Inactive) with full API sync & DB persistence
  const handleToggleProduct = async (productId) => {
    const target = products.find((p) => p.id === productId || p._id === productId);
    if (!target) return;
    const nextAvailable = target.available === false || target.status === 'inactive';

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId || p._id === productId) {
          return {
            ...p,
            available: nextAvailable,
            status: nextAvailable ? 'active' : 'inactive'
          };
        }
        return p;
      })
    );

    try {
      await productApi.toggleAvailability(productId, nextAvailable);
      toast.success(
        nextAvailable
          ? `${target.name} is now Active & Live in Customer Portal.`
          : `${target.name} is now Inactive (Hidden from Customer Portal).`,
        {
          id: `toggle-${productId}`,
          style: {
            borderRadius: '10px',
            background: '#0f172a',
            color: '#ffffff',
            fontSize: '0.84rem'
          }
        }
      );
    } catch (err) {
      console.error('Failed to toggle product availability:', err);
      toast.error('Failed to update status on server.');
      // Revert state on error
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId || p._id === productId) {
            return {
              ...p,
              available: target.available,
              status: target.status
            };
          }
          return p;
        })
      );
    }
  };

  // Delete product with API sync
  const handleDeleteProduct = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to remove "${productName}" from the catalog?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== productId && p._id !== productId));
      try {
        await productApi.deleteProduct(productId);
        toast.success(`Removed "${productName}" from catalog.`);
      } catch (err) {
        console.error('Failed to delete product:', err);
        toast.error('Failed to remove product from server.');
      }
    }
  };

  // Copy IP address to clipboard
  const handleCopyIp = (ip) => {
    if (!ip) return;
    navigator.clipboard.writeText(ip).then(
      () => toast.success(`Copied IP ${ip} to clipboard!`, { id: `copy-${ip}` }),
      () => toast.error('Could not copy to clipboard.')
    );
  };

  // DataTable columns for CtrlS Cloud Server (Matches User & Server Configuration format)
  const ctrlsColumns = [
    {
      id: 'sno',
      name: 'S/No.',
      selector: (row, idx) => idx + 1,
      sortable: false,
      width: '70px',
      cell: (row, idx) => (
        <span style={{ fontWeight: 600, color: '#64748b', fontSize: '0.85rem' }}>
          {idx + 1}
        </span>
      )
    },
    {
      id: 'user',
      name: 'User',
      selector: (row) => (row.isDemoPlan ? 0 : row.users || 1),
      sortable: true,
      sortFunction: compareNumber((row) => (row.isDemoPlan ? 0 : row.users || 1)),
      minWidth: '160px',
      cell: (prod) => (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.94rem',
              color: '#0f172a'
            }}
          >
            {prod.isDemoPlan ? prod.name : (prod.tier || `${prod.users || 1} User`)}
          </span>
          {prod.isCustomPlan && (
            <span
              className="adm-status-pill info"
              style={{ fontSize: '0.66rem', padding: '2px 8px', fontWeight: 700 }}
              title="Created with custom pricing"
            >
              Custom
            </span>
          )}
          {prod.isDemoPlan && (
            <span
              className="adm-status-pill warning"
              style={{
                background: '#fef3c7',
                color: '#b45309',
                border: '1px solid #fde68a',
                fontSize: '0.66rem',
                padding: '2px 8px',
                fontWeight: 700
              }}
              title="Demo Trial Plan"
            >
              Demo ({prod.duration || 'Trial'})
            </span>
          )}
        </div>
      )
    },
    {
      id: 'serverConfiguration',
      name: 'Server Configuration',
      selector: (row) => row.serverConfiguration || row.userBadge || '',
      sortable: true,
      sortFunction: compareText((row) => row.serverConfiguration || row.userBadge || ''),
      minWidth: '260px',
      grow: 1.4,
      cell: (prod) => {
        const configStr =
          prod.serverConfiguration ||
          prod.userBadge ||
          (prod.isDemoPlan ? `Demo Trial · ${prod.duration || '7 Days'}` : '2 core/3 GB/50 GB');
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
            <span
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontWeight: 600,
                fontSize: '0.85rem',
                color: prod.isDemoPlan ? '#059669' : '#4338ca',
                background: prod.isDemoPlan ? '#ecfdf5' : '#ede9fe',
                border: prod.isDemoPlan ? '1px solid #a7f3d0' : '1px solid #c7d2fe',
                padding: '4px 10px',
                borderRadius: '6px',
                letterSpacing: '0.2px'
              }}
            >
              {configStr}
            </span>
          </div>
        );
      }
    },
    {
      id: 'ipAddress',
      name: 'IP Address',
      selector: (row) => row.ipAddress || '',
      sortable: true,
      sortFunction: compareText((row) => row.ipAddress || ''),
      minWidth: '185px',
      cell: (prod) => {
        const ip = prod.ipAddress || (prod.specs?.find((s) => s.label?.toLowerCase().includes('ip'))?.value) || '';
        if (!ip) {
          return (
            <span style={{ fontSize: '0.78rem', color: prod.isDemoPlan ? '#059669' : '#94a3b8', fontStyle: 'italic' }}>
              {prod.isDemoPlan ? 'Dynamic Trial IP' : 'Unassigned'}
            </span>
          );
        }
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontWeight: 600,
                fontSize: '0.82rem',
                color: '#1e293b',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '3px 8px',
                borderRadius: '6px',
                letterSpacing: '0.4px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}
            >
              {ip}
            </span>
            <button
              type="button"
              onClick={() => handleCopyIp(ip)}
              title="Copy IP Address"
              style={{
                border: 'none',
                background: 'transparent',
                color: '#6366f1',
                cursor: 'pointer',
                padding: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '4px',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#eef2ff')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Copy size={13} />
            </button>
          </div>
        );
      }
    },
    {
      id: 'price',
      name: 'Pricing & Billing',
      selector: (row) => (typeof row.price === 'number' ? row.price : parseInt(String(row.price).replace(/[^0-9]/g, ''), 10) || 0),
      sortable: true,
      sortFunction: compareNumber((row) => (typeof row.price === 'number' ? row.price : parseInt(String(row.price).replace(/[^0-9]/g, ''), 10) || 0)),
      minWidth: '160px',
      cell: (prod) => (
        <div style={{ fontWeight: 700, color: prod.isDemoPlan ? '#059669' : '#0f172a', fontSize: '0.94rem' }}>
          {prod.isDemoPlan && (prod.monthlyPrice === 0 || prod.price === 'FREE' || !prod.price)
            ? 'FREE'
            : prod.price}
          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
            {' '}{prod.isDemoPlan ? `(${prod.duration || 'Trial'})` : (prod.frequency || '/ month')}
          </span>
        </div>
      )
    },
    {
      id: 'available',
      name: 'Live Availability',
      selector: (row) => (row.available !== false && row.status !== 'inactive' ? 1 : 0),
      sortable: true,
      sortFunction: compareNumber((row) => (row.available !== false && row.status !== 'inactive' ? 1 : 0)),
      minWidth: '180px',
      cell: (prod) => {
        const isLive = prod.available !== false && prod.status !== 'inactive';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label className="adm-switch">
              <input
                type="checkbox"
                checked={isLive}
                onChange={() => handleToggleProduct(prod.id || prod._id)}
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
      center: true,
      width: '110px',
      ignoreRowClick: true,
      cell: (prod) => (
        <button
          type="button"
          className="adm-action-pill"
          style={{ color: '#dc2626', borderColor: '#fecaca' }}
          onClick={() => handleDeleteProduct(prod.id || prod._id, prod.name)}
          title="Remove product from catalog"
        >
          <Trash2 size={13} />
          <span>Delete</span>
        </button>
      )
    }
  ];

  // DataTable columns for standard products (Tally / AWS / Azure)
  const columns = [
    {
      id: 'sno',
      name: 'S/No.',
      selector: (row, idx) => idx + 1,
      sortable: false,
      width: '75px',
      cell: (row, idx) => (
        <span style={{ fontWeight: 600, color: '#64748b', fontSize: '0.85rem' }}>
          {idx + 1}
        </span>
      )
    },
    {
      id: 'name',
      name: 'Product Name & Overview',
      selector: (row) => row.name,
      sortable: true,
      sortFunction: compareText((row) => row.name),
      minWidth: '320px',
      grow: 1.5,
      wrap: true,
      cell: (prod) => (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.92rem' }}>
            {prod.name}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: '#64748b',
              maxWidth: '380px',
              whiteSpace: 'normal',
              lineHeight: 1.45,
              marginTop: '3px'
            }}
          >
            {prod.userBadge
              ? `${prod.userBadge} • ${prod.description || 'Dedicated Cloud Server'}`
              : prod.description}
          </div>
        </div>
      )
    },
    {
      id: 'ipAddress',
      name: 'IP Address',
      selector: (row) => row.ipAddress || '',
      sortable: true,
      sortFunction: compareText((row) => row.ipAddress || ''),
      minWidth: '185px',
      cell: (prod) => {
        const ip = prod.ipAddress || (prod.specs?.find((s) => s.label?.toLowerCase().includes('ip'))?.value) || '';
        if (!ip) {
          return (
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
              Unassigned
            </span>
          );
        }
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontWeight: 600,
                fontSize: '0.82rem',
                color: '#1e293b',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '3px 8px',
                borderRadius: '6px',
                letterSpacing: '0.4px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}
            >
              {ip}
            </span>
            <button
              type="button"
              onClick={() => handleCopyIp(ip)}
              title="Copy IP Address"
              style={{
                border: 'none',
                background: 'transparent',
                color: '#6366f1',
                cursor: 'pointer',
                padding: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '4px',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#eef2ff')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Copy size={13} />
            </button>
          </div>
        );
      }
    },
    {
      id: 'category',
      name: 'Category / Tier',
      selector: (row) => row.tier || row.category,
      sortable: true,
      sortFunction: compareText((row) => row.tier || row.category),
      minWidth: '150px',
      cell: (prod) => (
        <span
          className="adm-product-badge"
          style={{
            background: '#eff6ff',
            color: '#1d4ed8',
            borderColor: '#bfdbfe',
            fontWeight: 600,
            fontSize: '0.75rem'
          }}
        >
          {prod.tier || prod.category}
        </span>
      )
    },
    {
      id: 'price',
      name: 'Pricing & Billing',
      selector: (row) => (typeof row.price === 'number' ? row.price : parseInt(String(row.price).replace(/[^0-9]/g, ''), 10) || 0),
      sortable: true,
      sortFunction: compareNumber((row) => (typeof row.price === 'number' ? row.price : parseInt(String(row.price).replace(/[^0-9]/g, ''), 10) || 0)),
      minWidth: '160px',
      cell: (prod) => (
        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.94rem' }}>
          {prod.price}
          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
            {' '}{prod.frequency || '/ month'}
          </span>
        </div>
      )
    },
    {
      id: 'available',
      name: 'Live Availability',
      selector: (row) => (row.available !== false && row.status !== 'inactive' ? 1 : 0),
      sortable: true,
      sortFunction: compareNumber((row) => (row.available !== false && row.status !== 'inactive' ? 1 : 0)),
      minWidth: '190px',
      cell: (prod) => {
        const isLive = prod.available !== false && prod.status !== 'inactive';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label className="adm-switch">
              <input
                type="checkbox"
                checked={isLive}
                onChange={() => handleToggleProduct(prod.id || prod._id)}
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
      center: true,
      width: '120px',
      ignoreRowClick: true,
      cell: (prod) => (
        <button
          type="button"
          className="adm-action-pill"
          style={{ color: '#dc2626', borderColor: '#fecaca' }}
          onClick={() => handleDeleteProduct(prod.id || prod._id, prod.name)}
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
         VIEW 0: CUSTOM PRICING MANAGER (STANDARD TIERS + CUSTOM PER-USER PLANS)
         ========================================================================= */}
      {selectedView === 'custom-pricing' && (
        <CustomPricingPage products={products} setProducts={setProducts} />
      )}

      {/* =========================================================================
         VIEW 0.5: CHECKOUT ADD-ONS MANAGEMENT
         ========================================================================= */}
      {selectedCategory === 'addons' && (
        <AddonSection onBack={() => updateRoute('cloud')} externalSearch={externalSearch} />
      )}

      {/* =========================================================================
         VIEW 1: INITIAL 2-CARD SOLUTION CATEGORY SELECTION (TALLY VS CLOUD)
         ========================================================================= */}
      {selectedCategory === null && selectedView !== 'custom-pricing' && (
        <div className="adm-table-card animate-fade-in">
          {/* Header */}
          <div className="adm-card-header">
            <div className="adm-card-header-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 className="adm-section-title">Product List</h1>
              </div>
              <p className="adm-section-sub">
                Browse and manage products by category.
              </p>
            </div>

            <div className="adm-card-header-action">
              <button
                type="button"
                className="adm-btn-secondary"
                onClick={() => updateRoute('addons')}
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                title="Manage checkout add-ons and customer visibility"
              >
                <Sparkles size={14} />
                <span>Checkout Add-Ons</span>
              </button>
            </div>
          </div>

          {/* 2 Big Hero Cards */}
          <div style={{ padding: '36px 32px 42px' }}>
            <div className="solutions-cards-grid">
              {/* CARD 1: TALLY PRIME & CUSTOMIZATION (COMING SOON) */}
              <div className="solution-hero-card tally-theme" style={{ cursor: 'default' }} aria-disabled="true">
                <div className="solution-center-logo-box tally-logo-center" style={{ opacity: 0.55, filter: 'grayscale(0.4)' }}>
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
                      color: '#92400e',
                      background: '#fef3c7',
                      padding: '3px 10px',
                      borderRadius: '999px'
                    }}
                  >
                    Coming Soon
                  </span>
                </div>

                <div className="solution-explore-row">
                  <span
                    className="solution-explore-btn"
                    style={{ background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed', boxShadow: 'none' }}
                  >
                    <Clock size={15} />
                    <span>Coming Soon</span>
                  </span>
                </div>
              </div>

              {/* CARD 2: CLOUD */}
              <div
                role="button"
                tabIndex={0}
                className="solution-hero-card cloud-theme"
                onClick={() => updateRoute('cloud')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    updateRoute('cloud');
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
      )}

      {/* =========================================================================
         VIEW 3: DATA TABLE VIEW (CTRLS CLOUD SERVER OR SELECTED PROVIDER / TALLY)
         Replaces SKU with IP Address, Active/Inactive live toggle, dynamic API sync
         ========================================================================= */}
      {(selectedCategory === 'tally' || selectedCategory === 'cloud') && selectedView !== 'custom-pricing' && (
        <div className="adm-table-card animate-fade-in">
          {/* Header */}
          <div className="adm-card-header">
            <div className="adm-card-header-info">
              <h1 className="adm-section-title">
                {selectedCategory === 'tally' ? 'Tally Product List' : 'Cloud Product List'}
              </h1>

              <p className="adm-section-sub">
                {selectedCategory === 'tally'
                  ? 'View and manage Tally Prime licenses and editions.'
                  : 'View and manage cloud server plans and pricing.'}
              </p>
            </div>

            <div className="adm-card-header-action">
              <button
                type="button"
                className="adm-btn-secondary"
                onClick={() => updateRoute(null)}
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                title="Return to Solution Category Selection"
              >
                <ArrowLeft size={14} />
                <span>Back to Solutions</span>
              </button>

              {selectedCategory === 'cloud' &&
                (can('product', 'create') || can('product', 'edit')) && (
                  <button
                    type="button"
                    className="adm-btn-secondary"
                    onClick={() => updateRoute('cloud', 'custom-pricing')}
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                    title="Open the custom and demo pricing manager"
                  >
                    <Percent size={14} />
                    <span>Custom &amp; Demo Pricing</span>
                  </button>
                )}

              {can('product', 'create') && (
                <button
                  type="button"
                  className="adm-btn-primary"
                  onClick={() => navigate(productPath(selectedCategory, 'create'))}
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
                placeholder="Search by product name, IP address, tier..."
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
            columns={selectedCloudProvider === 'ctrls-cloud' ? ctrlsColumns : visibleColumns('product', columns)}
            data={currentCategoryProducts}
            keyField="id"
            defaultSortFieldId="sno"
            defaultSortAsc={true}
            resetPageToken={`${searchQuery}|${availabilityFilter}|${selectedCategory}|${selectedCloudProvider}`}
            minWidth={1200}
            noDataMessage="No cloud products found"
            noDataHint="Try adjusting your search criteria or add a new cloud VPS tier."
            ariaLabel="Product catalog"
            scrollHeight="600px"
          />
        </div>
      )}
    </>
  );
}
