import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import tallyLogo from '../../../assets/partners/tally.png';
import ctrlsLogo from '../../../assets/partners/ctrls.png';
import { compactSelectStyles } from './reactSelectStyles';
import { READ_ONLY_CLOUD_PROVIDERS } from '../../Dashboard/components/CloudProviderSelection';
import AdminDataTable from './AdminDataTable';
import { compareNumber, compareText } from './adminTableUtils';
import { usePermissions } from './PermissionsContext';
import { productApi } from '../../../services/productApi';

// Authentic Official Amazon Web Services (AWS) SVG Icon
function AwsIcon({ size = 46, className = '' }) {
  return (
    <svg
      width={size * 1.3}
      height={size}
      viewBox="0 0 100 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Amazon Web Services"
    >
      <path
        d="M26.8 31.7c-1.4 1.2-3.2 1.8-5.3 1.8-4.2 0-6.8-2.6-6.8-6.6 0-4.4 3-6.7 8.3-7l3.8-.2v-1.8c0-2.2-1.4-3.5-3.9-3.5-2 0-3.6.8-4.9 2l-2.6-3.8c2-2 4.8-3.1 8-3.1 5.3 0 8.6 2.9 8.6 8v15.2h-5.2v-1zm0-4v-4.4l-3 .2c-2.9.2-4.2 1.4-4.2 3.2 0 1.8 1.1 2.9 3.1 2.9 1.7 0 3-.6 4.1-1.9z"
        fill="#232F3E"
      />
      <path
        d="M50.5 33.2h-5.4l-4.9-17h5.5l2.6 11.3 2.7-11.3h5.1l2.7 11.3 2.7-11.3h5.4l-5 17h-5.6l-2.9-10.7-2.9 10.7z"
        fill="#232F3E"
      />
      <path
        d="M83.4 18.2c-1.4-1-3.2-1.5-5-1.5-2.2 0-3.6.9-3.6 2.2 0 1.3 1 2 3.3 2.5l3.1.8c4.4 1.1 6.5 3.1 6.5 6.4 0 4.1-3.5 6.5-8.6 6.5-3.1 0-5.9-1-8.1-2.7l2.8-4c1.7 1.3 3.5 2 5.4 2 2.3 0 3.7-.9 3.7-2.3 0-1.3-1.1-2-3.4-2.6l-3-.8c-4.2-1.1-6.3-3-6.3-6.2 0-4 3.4-6.2 7.9-6.2 2.7 0 5.3.8 7.3 2.2l-2 4.2z"
        fill="#232F3E"
      />
      <path
        d="M20.2 40.5c16.3 10.8 37.4 11.2 54.8 1.1"
        stroke="#FF9900"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M81.5 37.2l-9.8 4.2 4.2-4.8-1.2-6.2 6.8 6.8z"
        fill="#FF9900"
      />
    </svg>
  );
}

// Authentic Official Microsoft Azure SVG Icon
function AzureIcon({ size = 44, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Microsoft Azure"
    >
      <defs>
        <linearGradient id="azure_svg_adm_g1" x1="12" y1="84" x2="68" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#114A8B" />
          <stop offset="1" stopColor="#0669BC" />
        </linearGradient>
        <linearGradient id="azure_svg_adm_g2" x1="39" y1="48" x2="84" y2="84" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0078D4" />
          <stop offset="0.9" stopColor="#5EA0EF" />
        </linearGradient>
        <linearGradient id="azure_svg_adm_g3" x1="38" y1="12" x2="84" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0078D4" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <path
        d="M59.4 12H38.7c-2.4 0-4.6 1.4-5.6 3.6L12.5 60.5c-1.4 3 0.8 6.5 4.1 6.5h20.7c2.4 0 4.6-1.4 5.6-3.6l12.6-26.9L73 67h18.9L59.4 12z"
        fill="url(#azure_svg_adm_g1)"
      />
      <path
        d="M37.3 67h38.2c2.4 0 4.5-1.4 5.5-3.6l10.5-22.4c1.4-3-0.8-6.5-4.1-6.5H66.8L37.3 67z"
        fill="url(#azure_svg_adm_g2)"
      />
      <path
        d="M59.4 12H38.7c-2.4 0-4.6 1.4-5.6 3.6L20.6 42.1 48 58.7l15-28.8L59.4 12z"
        fill="url(#azure_svg_adm_g3)"
        opacity="0.85"
      />
    </svg>
  );
}

export default function ProductSection({ products, setProducts }) {
  const { can, visibleColumns } = usePermissions();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Navigation State derived from URL query parameters
  const selectedCategory = searchParams.get('category'); // null | 'tally' | 'cloud'
  const requestedCloudProvider = searchParams.get('provider'); // null | 'ctrls-cloud' | 'aws-cloud' | 'azure-cloud'
  // AWS & Azure are reference-only cards, so a stale or hand-typed link to them
  // lands back on the picker instead of an editable table.
  const selectedCloudProvider = READ_ONLY_CLOUD_PROVIDERS.includes(requestedCloudProvider)
    ? null
    : requestedCloudProvider;

  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  const updateRoute = (cat, prov = null) => {
    const params = new URLSearchParams();
    if (cat) params.set('category', cat);
    if (prov) params.set('provider', prov);
    const queryString = params.toString();
    navigate(queryString ? `/admin/product?${queryString}` : '/admin/product');
  };

  // Provider configuration matching the customer portal
  const CLOUD_PROVIDERS_CONFIG = [
    {
      id: 'aws-cloud',
      name: 'Amazon Web Services (AWS)',
      oneLiner: 'Scalable Enterprise Hyperscale Cloud Compute & EC2',
      badge: 'Hyperscale Cloud',
      badgeClass: 'amber',
      highlights: ['Dedicated vCPU Xeon Compute', 'Auto-Scaling EC2 Instances', '99.99% Global High Availability'],
      filter: (p) => p.provider === 'aws-cloud' || p.id?.includes('aws')
    },
    {
      id: 'ctrls-cloud',
      name: 'CtrlS Cloud Server',
      oneLiner: 'Tier-4 Datacenter High-Speed Enterprise Compute',
      badge: 'Tier-4 Kolkata',
      badgeClass: 'positive',
      exploreText: 'Manage CtrlS Cloud',
      highlights: ['CtrlS Rated-4 Kolkata Facility', 'Ultra-Low Latency Bengal Routing', 'Zero-Lag Multi-User Tally Remote'],
      filter: (p) => p.provider === 'ctrls-cloud' || p.id?.startsWith('ctrls-')
    },
    {
      id: 'azure-cloud',
      name: 'Microsoft Azure',
      oneLiner: 'Scalable Enterprise Hyperscale Cloud Instances',
      badge: 'Hyperscale Cloud',
      badgeClass: 'indigo',
      highlights: ['Azure Virtual Windows Desktops', 'Microsoft Enterprise Security SLA', 'Instant Automated Backup Sync'],
      filter: (p) => p.provider === 'azure-cloud' || p.id?.includes('azure')
    }
  ];

  // Calculate live counts
  const tallyCount = useMemo(() => {
    return products.filter((p) =>
      p.category?.toLowerCase().includes('erp') ||
      p.name?.toLowerCase().includes('tally') ||
      p.provider === 'tally'
    ).length;
  }, [products]);

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
          icon: nextAvailable ? '✅' : '⏸️',
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
      selector: (row) => row.users || 1,
      sortable: true,
      sortFunction: compareNumber((row) => row.users || 1),
      minWidth: '130px',
      cell: (prod) => (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.94rem',
              color: '#0f172a'
            }}
          >
            {prod.tier || `${prod.users || 1} User`}
          </span>
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
        const configStr = prod.serverConfiguration || prod.userBadge || '2 core/3 GB/50 GB';
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
            <span
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontWeight: 600,
                fontSize: '0.85rem',
                color: '#4338ca',
                background: '#ede9fe',
                border: '1px solid #c7d2fe',
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
        const ip = prod.ipAddress || (prod.specs?.find((s) => s.label?.toLowerCase().includes('ip'))?.value) || '103.115.220.41';
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
        const ip = prod.ipAddress || (prod.specs?.find((s) => s.label?.toLowerCase().includes('ip'))?.value) || '103.115.220.41';
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
         VIEW 1: INITIAL 2-CARD SOLUTION CATEGORY SELECTION (TALLY VS CLOUD)
         ========================================================================= */}
      {selectedCategory === null && (
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

          {/* 2 Big Hero Cards */}
          <div style={{ padding: '36px 32px 42px' }}>
            <div className="solutions-cards-grid">
              {/* CARD 1: TALLY PRIME & CUSTOMIZATION */}
              <div
                role="button"
                tabIndex={0}
                className="solution-hero-card tally-theme"
                onClick={() => updateRoute('tally')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    updateRoute('tally');
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
         VIEW 2: CLOUD PROVIDER SELECTION (AWS, CTRLS CLOUD SERVER, AZURE)
         Matches user screenshot & customer's CloudProviderSelection component
         ========================================================================= */}
      {selectedCategory === 'cloud' && !selectedCloudProvider && (
        <div className="adm-table-card animate-fade-in">
          {/* Header */}
          <div className="adm-card-header">
            <div className="adm-card-header-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 className="adm-section-title">Select Cloud Platform</h1>
              </div>
              <p className="adm-section-sub">
                Choose a cloud infrastructure provider below to view and manage cloud server tiers, IP allocations, and live availability.
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
            </div>
          </div>

          {/* 3 Cloud Provider Cards Grid */}
          <div style={{ padding: '32px 28px 40px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '24px',
                width: '100%'
              }}
            >
              {CLOUD_PROVIDERS_CONFIG.map((p) => {
                const count = providerCounts[p.id] || 0;
                const isReadOnly = READ_ONLY_CLOUD_PROVIDERS.includes(p.id);
                return (
                  <div
                    key={p.id}
                    role={isReadOnly ? 'group' : 'button'}
                    tabIndex={isReadOnly ? -1 : 0}
                    className={`solution-hero-card cloud-theme ${isReadOnly ? 'is-read-only' : ''}`}
                    onClick={isReadOnly ? undefined : () => updateRoute('cloud', p.id)}
                    onKeyDown={(e) => {
                      if (isReadOnly) return;
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        updateRoute('cloud', p.id);
                      }
                    }}
                    style={{
                      padding: '32px 26px 28px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'stretch',
                      textAlign: 'left',
                      minHeight: '380px'
                    }}
                  >
                    <div>
                      {/* Top Row: Provider Logo & Status Badge */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '20px'
                        }}
                      >
                        <div style={{ height: '52px', display: 'flex', alignItems: 'center' }}>
                          {p.id === 'aws-cloud' && <AwsIcon size={46} />}
                          {p.id === 'ctrls-cloud' && (
                            <img
                              src={ctrlsLogo}
                              alt="CtrlS Cloud Server"
                              style={{ height: '42px', maxWidth: '140px', objectFit: 'contain' }}
                              loading="lazy"
                            />
                          )}
                          {p.id === 'azure-cloud' && <AzureIcon size={44} />}
                        </div>

                        <span
                          className={`adm-status-pill ${p.badgeClass === 'positive' ? 'active' : 'indigo'}`}
                          style={{
                            fontSize: '0.72rem',
                            padding: '3px 9px',
                            fontWeight: 600,
                            borderRadius: '999px',
                            background: p.badgeClass === 'positive' ? '#dcfce7' : '#ede9fe',
                            color: p.badgeClass === 'positive' ? '#15803d' : '#4338ca'
                          }}
                        >
                          {p.badge}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: '700',
                          color: '#0f172a',
                          margin: '0 0 6px 0'
                        }}
                      >
                        {p.name}
                      </h3>
                      <p
                        style={{
                          fontSize: '0.84rem',
                          color: '#64748b',
                          margin: '0 0 16px 0',
                          lineHeight: 1.45
                        }}
                      >
                        {p.oneLiner}
                      </p>

                      {/* Feature Highlights */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          borderTop: '1px solid #f1f5f9',
                          paddingTop: '16px',
                          marginBottom: '20px'
                        }}
                      >
                        {p.highlights.map((h, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '0.8rem',
                              color: '#475569'
                            }}
                          >
                            <CheckCircle2 size={14} color="#6366f1" style={{ flexShrink: 0 }} />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Row: Node Count & Action Button */}
                    <div
                      style={{
                        paddingTop: '16px',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                          Catalog Provisioned
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#4f46e5',
                            background: '#eef2ff',
                            padding: '2px 8px',
                            borderRadius: '999px'
                          }}
                        >
                          {count} Node{count !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <button
                        type="button"
                        className={isReadOnly ? 'adm-btn-secondary' : 'adm-btn-primary'}
                        disabled={isReadOnly}
                        title={isReadOnly ? 'Catalog not open for management yet' : undefined}
                        style={{
                          width: '100%',
                          justifyContent: 'center',
                          padding: '10px 16px',
                          fontSize: '0.86rem',
                          ...(isReadOnly ? { opacity: 0.6, cursor: 'not-allowed' } : null)
                        }}
                      >
                        <span>{isReadOnly ? 'Coming soon' : p.exploreText}</span>
                        {!isReadOnly && <ArrowRight size={15} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         VIEW 3: DATA TABLE VIEW (CTRLS CLOUD SERVER OR SELECTED PROVIDER / TALLY)
         Replaces SKU with IP Address, Active/Inactive live toggle, dynamic API sync
         ========================================================================= */}
      {(selectedCategory === 'tally' || (selectedCategory === 'cloud' && selectedCloudProvider)) && (
        <div className="adm-table-card animate-fade-in">
          {/* Header */}
          <div className="adm-card-header">
            <div className="adm-card-header-info">
              <h1 className="adm-section-title">
                {selectedCategory === 'tally'
                  ? 'Tally Prime & Customization Editions'
                  : 'CtrlS Cloud Server Infrastructure (Tier-4 Datacenter)'}
              </h1>

              <p className="adm-section-sub">
                {selectedCategory === 'tally'
                  ? 'Manage official Tally Prime software licenses, multi-user editions, and TSS renewals.'
                  : 'Manage CtrlS Kolkata Tier-4 datacenter VPS nodes, static IP allocations, pricing, and live customer portal availability.'}
              </p>
            </div>

            <div className="adm-card-header-action">
              <button
                type="button"
                className="adm-btn-secondary"
                onClick={() => {
                  if (selectedCategory === 'cloud') {
                    updateRoute('cloud', null); // Back to 3 cloud providers
                  } else {
                    updateRoute(null); // Back to solutions
                  }
                }}
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                title={
                  selectedCategory === 'cloud'
                    ? 'Return to Cloud Provider Selection'
                    : 'Return to Solution Category Selection'
                }
              >
                <ArrowLeft size={14} />
                <span>
                  {selectedCategory === 'cloud' ? 'Back to Cloud Platforms' : 'Back to Solutions'}
                </span>
              </button>

              {can('product', 'create') && (
                <button
                  type="button"
                  className="adm-btn-primary"
                  onClick={() =>
                    navigate(
                      selectedCategory === 'tally'
                        ? '/admin/product/tally/create'
                        : `/admin/product/cloud/create?provider=${selectedCloudProvider || 'ctrls-cloud'}`
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
