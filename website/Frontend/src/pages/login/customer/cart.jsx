import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ShoppingBag,
  Plus,
  Minus,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Server,
  Receipt,
  CheckCircle2,
  Lock,
  Headphones
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cartApi } from '../../../services/cartApi';
import tallyLogo from '../../../assets/partners/tally.png';
import tallyPrimeImg from '../../../assets/Industries/Tally Prime and Tally on Cloud.webp';
import cloudHostingImg from '../../../assets/Industries/Clous Server & Hosting.webp';
import itInfraImg from '../../../assets/Industries/IT infrastructure Managment.webp';
import managedImg from '../../../assets/Industries/Managed IT services.webp';

/* ── Fallback Add-ons Catalog (if offline) ────────────── */
const FALLBACK_ADDONS = [
  {
    id: 'tally-whatsapp-automation',
    name: 'WhatsApp Automation Module',
    category: 'Automation Add-on',
    badge: 'POPULAR',
    badgeColor: '#059669',
    badgeBg: '#ecfdf5',
    basePrice: 3000,
    desc: 'Instant PDF invoices & receipts dispatched directly via WhatsApp.',
    image: managedImg,
    spec: 'Meta Official API'
  },
  {
    id: 'cloud-backup-100gb',
    name: 'Encrypted Cloud Backup (100GB)',
    category: 'Security & Backup',
    badge: 'ESSENTIAL',
    badgeColor: '#2563eb',
    badgeBg: '#eff6ff',
    basePrice: 1499,
    desc: 'Automated nightly snapshot backup with 15-day recovery.',
    image: itInfraImg,
    spec: '100 GB NVMe'
  },
  {
    id: 'tally-einvoice-api',
    name: 'Direct e-Invoice & e-Way Bill API',
    category: 'Government Compliance',
    badge: 'COMPLIANCE',
    badgeColor: '#7c3aed',
    badgeBg: '#f5f3ff',
    basePrice: 3500,
    desc: 'Sub-second IRN & QR code generation directly from Tally.',
    image: managedImg,
    spec: 'Direct IRP Sync'
  },
  {
    id: 'cloud-tally-business',
    name: 'Tally on Cloud (3 Users)',
    category: 'Cloud Hosting',
    badge: 'BEST SELLER',
    badgeColor: '#d97706',
    badgeBg: '#fef3c7',
    basePrice: 2499,
    desc: 'High-speed remote cloud desktop accessible from Mac & Windows.',
    image: cloudHostingImg,
    spec: 'Tier-4 CtrlS'
  },
  {
    id: 'tally-tss-single',
    name: 'TSS 1-Year Renewal (Silver)',
    category: 'Software Maintenance',
    badge: 'TAX UPDATES',
    badgeColor: '#dc2626',
    badgeBg: '#fef2f2',
    basePrice: 4500,
    desc: 'Continuous statutory tax patches, banking API & reports.',
    image: tallyLogo,
    spec: '12-Month Support'
  },
  {
    id: 'tally-lan-booster',
    name: 'LAN Network Accelerator',
    category: 'Network Optimization',
    badge: 'UTILITY',
    badgeColor: '#0891b2',
    badgeBg: '#ecfeff',
    basePrice: 2200,
    desc: 'Zero-lag multi-workstation concurrency for retail billing.',
    image: itInfraImg,
    spec: 'Multi-LAN Routing'
  }
];

export default function CartSection({
  cartItems = [],
  fulfillmentMode = 'digital',
  onUpdateFulfillmentMode,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToPayment,
  onBrowseProducts,
  onAddToCart
}) {
  const [justAddedAddonId, setJustAddedAddonId] = useState(null);
  const [addonsList, setAddonsList] = useState(FALLBACK_ADDONS);
  const [activeAddonIndex, setActiveAddonIndex] = useState(0);
  const [isAddonHovered, setIsAddonHovered] = useState(false);

  // Exactly 2 cards shown one after the other (WhatsApp Automation & Cloud Backup)
  const displayAddons = useMemo(() => {
    return addonsList && addonsList.length >= 2 ? addonsList.slice(0, 2) : FALLBACK_ADDONS.slice(0, 2);
  }, [addonsList]);

  // Auto horizontally change card every 3 seconds (pauses on hover)
  useEffect(() => {
    if (isAddonHovered || displayAddons.length <= 1) return;
    const timer = setInterval(() => {
      setActiveAddonIndex((prev) => (prev + 1) % displayAddons.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isAddonHovered, displayAddons.length]);

  const handlePrevAddon = () => {
    setActiveAddonIndex((prev) => (prev - 1 + displayAddons.length) % displayAddons.length);
  };

  const handleNextAddon = () => {
    setActiveAddonIndex((prev) => (prev + 1) % displayAddons.length);
  };

  // Dynamic image resolver for products & add-ons
  const getItemImage = (item) => {
    if (item.image) return item.image;
    const name = (item.name || '').toLowerCase();
    if (name.includes('cloud') || name.includes('vps') || name.includes('server')) return cloudHostingImg;
    if (name.includes('whatsapp') || name.includes('automation') || name.includes('api') || name.includes('backup')) return managedImg;
    if (name.includes('silver') || name.includes('gold') || name.includes('prime')) return tallyPrimeImg;
    return tallyLogo;
  };

  // Fetch dynamic add-ons from live backend API
  useEffect(() => {
    let isMounted = true;
    const loadDynamicAddons = async () => {
      try {
        const dynamicAddons = await cartApi.getAddons();
        if (isMounted && Array.isArray(dynamicAddons) && dynamicAddons.length > 0) {
          const enriched = dynamicAddons.map((addon) => ({
            ...addon,
            image: getItemImage(addon)
          }));
          setAddonsList(enriched);
        }
      } catch (err) {
        console.warn('Dynamic addons fallback to local catalog:', err);
      }
    };

    loadDynamicAddons();
    return () => {
      isMounted = false;
    };
  }, []);

  // Financial calculations with 18% GST standard (9% CGST + 9% SGST)
  const subtotal = cartItems.reduce(
    (s, i) => s + (Number(i.basePrice) || Number(i.price) || 0) * (Number(i.quantity) || 1),
    0
  );
  const cgst = Math.round(subtotal * 0.09);
  const sgst = Math.round(subtotal * 0.09);
  const taxTotal = cgst + sgst;
  const grandTotal = subtotal + taxTotal;

  // Resolve item code / SKU
  const getItemSku = (item, idx) => {
    if (item.sku) return item.sku;
    const code = (item.id || `PROD${idx}`).toUpperCase().replace(/[^A-Z0-9]/g, '');
    return `#2143${code.slice(-6).padStart(6, '0')}`;
  };

  // Resolve item options & secondary line
  const getItemDetails = (item) => {
    const parts = [];
    if (item.category) parts.push(`Type: ${item.category}`);
    if (item.billingCycle) parts.push(`Cycle: ${item.billingCycle}`);
    else if (item.duration) parts.push(`Duration: ${item.duration}`);
    else parts.push('License: Genuine NISPL Key');
    return parts.join(' // ');
  };

  // Add-on click handler (triggers dynamic addition & API sync)
  const handleAddAddon = (addon) => {
    if (onAddToCart) {
      onAddToCart({
        id: addon.id,
        name: addon.name,
        basePrice: addon.basePrice,
        originalBasePrice: addon.basePrice,
        finalPrice: Math.round(addon.basePrice * 1.18),
        category: addon.category,
        billingCycle: 'Annual',
        quantity: 1,
        image: addon.image
      });
      setJustAddedAddonId(addon.id);
      toast.success(`Added ${addon.name} to Cart!`, {
        icon: '🛒',
        id: `addon-${addon.id}`
      });
      setTimeout(() => setJustAddedAddonId(null), 1500);
    }
  };

  const handleSelectFulfillment = (mode) => {
    if (onUpdateFulfillmentMode) {
      onUpdateFulfillmentMode(mode);
    }
  };

  return (
    <div className="flowmail-section-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── 1. Top Header Banner (FlowMail Style) ────────────────── */}
      <section className="flowmail-welcome-banner">
        <div className="flowmail-welcome-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 className="flowmail-welcome-title">My Cart</h2>
            <span
              className="flowmail-trend-pill"
              style={{
                background: '#ede9fe',
                color: '#6366f1',
                padding: '4px 10px',
                fontSize: '0.78rem',
                fontWeight: '600'
              }}
            >
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="flowmail-welcome-sub">
            Review your selected software licenses, cloud compute packs, and configure fulfillment mode.
          </p>
        </div>
        <button
          type="button"
          className="flowmail-btn-secondary"
          onClick={onBrowseProducts}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowLeft size={15} />
          <span>{cartItems.length > 0 ? 'Continue Shopping' : 'Explore Solutions'}</span>
        </button>
      </section>



      {/* ── 3. Main Content: Two-Column Layout ───────────────────── */}
      {cartItems.length > 0 ? (
        <>
          <div className="cart-two-col-layout" style={{ gap: '24px' }}>
            {/* ── Left Column: Items Table & Fulfillment Mode ──────── */}
            <div className="cart-col-main" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Cart Items Card */}
              <div className="flowmail-card" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Table Header Bar */}
                <div className="flowmail-cart-head" style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 2.2fr) 110px 110px 110px',
                  padding: '14px 24px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: '0.76rem',
                  fontWeight: '600',
                  color: '#64748b',
                  letterSpacing: '0.04em'
                }}>
                  <div>PRODUCT</div>
                  <div>PRICE (INCL. GST)</div>
                  <div style={{ textAlign: 'center' }}>QTY</div>
                  <div style={{ textAlign: 'right' }}>TOTAL</div>
                </div>

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {cartItems.map((item, idx) => {
                    const qty = Number(item.quantity) || 1;
                    const unitBase = Number(item.basePrice) || Number(item.price) || 0;
                    const unitWithTax = Math.round(unitBase * 1.18);
                    const lineTotal = unitWithTax * qty;
                    const imageSrc = getItemImage(item);
                    const sku = getItemSku(item, idx);
                    const details = getItemDetails(item);

                    return (
                      <div
                        key={item.id || idx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(0, 2.2fr) 110px 110px 110px',
                          padding: '20px 24px',
                          borderBottom: idx === cartItems.length - 1 ? 'none' : '1px solid #f1f5f9',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'background 0.15s ease'
                        }}
                        className="flowmail-cart-row"
                      >
                        {/* Product Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '12px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            padding: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <img src={imageSrc} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </div>
                          <div>
                            <h4 style={{ margin: '0 0 3px 0', fontSize: '0.94rem', fontWeight: '600', color: '#0f172a' }}>
                              {item.name}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span className="flowmail-receipt-id-badge" style={{ fontSize: '0.72rem', padding: '2px 6px' }}>
                                {sku}
                              </span>
                              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                                {details}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price Column */}
                        <div>
                          <div style={{ fontSize: '0.94rem', fontWeight: '600', color: '#0f172a' }}>
                            ₹{unitWithTax.toLocaleString('en-IN')}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            + 18% GST incl.
                          </span>
                        </div>

                        {/* QTY Stepper */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '2px',
                            background: '#f8fafc'
                          }}>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, qty - 1)}
                              aria-label="Decrease quantity"
                              style={{
                                width: '26px',
                                height: '26px',
                                border: 'none',
                                background: 'transparent',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#64748b'
                              }}
                            >
                              <Minus size={12} />
                            </button>
                            <span style={{ width: '28px', textAlign: 'center', fontSize: '0.88rem', fontWeight: '600', color: '#0f172a' }}>
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, qty + 1)}
                              aria-label="Increase quantity"
                              style={{
                                width: '26px',
                                height: '26px',
                                border: 'none',
                                background: 'transparent',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#64748b'
                              }}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Total Column & Remove */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '14px' }}>
                          <span style={{ fontSize: '0.96rem', fontWeight: '700', color: '#0f172a' }}>
                            ₹{lineTotal.toLocaleString('en-IN')}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            title="Remove item"
                            aria-label="Remove item"
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              border: 'none',
                              background: '#f1f5f9',
                              color: '#94a3b8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            className="flowmail-modal-close-btn"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fulfillment Mode Card (FlowMail Theme) */}
              <div className="flowmail-card">
                <div className="flowmail-card-header-row" style={{ marginBottom: '16px' }}>
                  <div>
                    <h3 className="flowmail-card-title">Choose Fulfillment &amp; Setup Mode</h3>
                    <p className="flowmail-card-subtitle">Select how you would like your licenses and cloud instances configured</p>
                  </div>
                </div>

                <div className="flowmail-fulfill-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {/* Digital Mode */}
                  <div
                    onClick={() => handleSelectFulfillment('digital')}
                    style={{
                      border: fulfillmentMode === 'digital' ? '2px solid #6366f1' : '1px solid #e2e8f0',
                      background: fulfillmentMode === 'digital' ? '#f5f3ff' : '#ffffff',
                      borderRadius: '16px',
                      padding: '16px 18px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: fulfillmentMode === 'digital' ? '6px solid #6366f1' : '2px solid #cbd5e1',
                      background: '#ffffff',
                      marginTop: '2px',
                      flexShrink: 0
                    }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a' }}>
                          Instant Digital Activation
                        </span>
                        <span className="flowmail-trend-pill positive" style={{ fontSize: '0.72rem', padding: '2px 6px' }}>
                          FREE
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                        Official serial license keys and cloud credentials dispatched to registered email in 15 minutes.
                      </p>
                    </div>
                  </div>

                  {/* Assisted Remote Setup */}
                  <div
                    onClick={() => handleSelectFulfillment('assisted')}
                    style={{
                      border: fulfillmentMode === 'assisted' ? '2px solid #6366f1' : '1px solid #e2e8f0',
                      background: fulfillmentMode === 'assisted' ? '#f5f3ff' : '#ffffff',
                      borderRadius: '16px',
                      padding: '16px 18px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: fulfillmentMode === 'assisted' ? '6px solid #6366f1' : '2px solid #cbd5e1',
                      background: '#ffffff',
                      marginTop: '2px',
                      flexShrink: 0
                    }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a' }}>
                          Assisted Remote Setup
                        </span>
                        <span className="flowmail-trend-pill positive" style={{ fontSize: '0.72rem', padding: '2px 6px' }}>
                          FREE
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                        Priority remote configuration via AnyDesk / TeamViewer by certified senior NISPL engineers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Column: Order Summary + Add-Ons Below Checkout ── */}
            <div className="cart-col-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* 1. Order Summary Card */}
              <div className="flowmail-card">
                <div className="flowmail-card-header-row" style={{ marginBottom: '16px' }}>
                  <h3 className="flowmail-card-title">Order Summary</h3>
                  <span className="flowmail-trend-pill indigo" style={{ fontSize: '0.74rem' }}>
                    18% GST Included
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span style={{ color: '#64748b' }}>Items Base Fare</span>
                    <span style={{ color: '#0f172a', fontWeight: '600' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span style={{ color: '#64748b' }}>Taxes &amp; GST (18%)</span>
                    <span style={{ color: '#0f172a', fontWeight: '600' }}>₹{taxTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span style={{ color: '#64748b' }}>Activation &amp; Delivery</span>
                    <span style={{ color: '#10b981', fontWeight: '700' }}>FREE</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '16px' }}>
                  <div>
                    <span style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Total Amount</span>
                    <span style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8' }}>All taxes inclusive</span>
                  </div>
                  <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#6366f1' }}>
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Primary Proceed Button */}
                <button
                  type="button"
                  className="flowmail-btn-primary"
                  onClick={onProceedToPayment}
                  style={{ width: '100%', justifyContent: 'center', marginTop: '20px', padding: '12px 20px', fontSize: '0.94rem' }}
                >
                  <Lock size={15} />
                  <span>Proceed to Payment</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* 2. Recommended Add-Ons Card */}
              <div
                className="flowmail-card"
                onMouseEnter={() => setIsAddonHovered(true)}
                onMouseLeave={() => setIsAddonHovered(false)}
              >
                <div className="flowmail-card-header-row" style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: '#ede9fe',
                      color: '#6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Sparkles size={15} />
                    </div>
                    <div>
                      <h4 className="flowmail-card-title" style={{ fontSize: '0.96rem' }}>Add-Ons</h4>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Dots indicator */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {displayAddons.map((_, i) => (
                        <span
                          key={i}
                          onClick={() => setActiveAddonIndex(i)}
                          style={{
                            width: activeAddonIndex === i ? '16px' : '6px',
                            height: '6px',
                            borderRadius: '999px',
                            background: activeAddonIndex === i ? '#6366f1' : '#e2e8f0',
                            transition: 'all 0.25s ease',
                            cursor: 'pointer'
                          }}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      className="flowmail-dots-btn"
                      onClick={handlePrevAddon}
                      aria-label="Previous add-on"
                      style={{ padding: '4px' }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      className="flowmail-dots-btn"
                      onClick={handleNextAddon}
                      aria-label="Next add-on"
                      style={{ padding: '4px' }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Add-on Active Item Card */}
                <div style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      display: 'flex',
                      transform: `translateX(-${activeAddonIndex * 100}%)`,
                      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    {displayAddons.map((addon) => {
                      const inCart = cartItems.some((c) => c.id === addon.id);
                      const isJustAdded = justAddedAddonId === addon.id;
                      const priceWithGst = Math.round(addon.basePrice * 1.18);

                      return (
                        <div
                          key={addon.id}
                          style={{
                            minWidth: '100%',
                            background: '#f8fafc',
                            border: '1px solid #f1f5f9',
                            borderRadius: '16px',
                            padding: '16px',
                            boxSizing: 'border-box'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                color: addon.badgeColor,
                                background: addon.badgeBg,
                                padding: '2px 8px',
                                borderRadius: '999px'
                              }}
                            >
                              {addon.badge}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{addon.spec}</span>
                          </div>

                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
                            <div style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '10px',
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <img src={addon.image} alt={addon.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <div>
                              <h5 style={{ margin: '0 0 2px 0', fontSize: '0.88rem', fontWeight: '600', color: '#0f172a' }}>
                                {addon.name}
                              </h5>
                              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.35 }}>
                                {addon.desc}
                              </p>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #eef2f6' }}>
                            <div>
                              <span style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                                ₹{priceWithGst.toLocaleString('en-IN')}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '4px' }}>incl. GST</span>
                            </div>

                            <button
                              type="button"
                              className={inCart ? 'flowmail-btn-secondary' : 'flowmail-btn-primary'}
                              onClick={() => !inCart && handleAddAddon(addon)}
                              disabled={inCart}
                              style={{
                                padding: '6px 14px',
                                fontSize: '0.82rem',
                                borderRadius: '10px',
                                gap: '4px'
                              }}
                            >
                              {isJustAdded ? (
                                <>
                                  <Check size={13} />
                                  <span>Added</span>
                                </>
                              ) : inCart ? (
                                <>
                                  <Check size={13} />
                                  <span>In Cart</span>
                                </>
                              ) : (
                                <>
                                  <Plus size={13} />
                                  <span>Add</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 4. Sticky Bottom Checkout Bar (FlowMail Frosted Glass) ── */}
          <div
            className="cart-sticky-checkout-bar"
            style={{
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(12px)',
              borderTop: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 -8px 25px rgba(15, 23, 42, 0.06)'
            }}
          >
            <div className="sticky-checkout-left">
              <div className="sticky-checkout-pricing">
                <span className="sticky-checkout-total-label" style={{ color: '#64748b' }}>Grand Total:</span>
                <span className="sticky-checkout-total-amt" style={{ color: '#0f172a', fontWeight: '800' }}>
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
                <span className="flowmail-trend-pill positive" style={{ fontSize: '0.74rem' }}>
                  Incl. all taxes &amp; GST
                </span>
              </div>
            </div>

            <div className="sticky-checkout-right">
              <button
                type="button"
                className="flowmail-btn-primary"
                onClick={onProceedToPayment}
                style={{ padding: '12px 28px', fontSize: '0.94rem' }}
              >
                <span>Proceed to Checkout</span>
                <span style={{ opacity: 0.85, fontWeight: '400' }}>| ₹{grandTotal.toLocaleString('en-IN')}</span>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </>
      ) : (
        /* ── Empty State (FlowMail Card) ─────────────────────────── */
        <div
          className="flowmail-card"
          style={{
            maxWidth: '760px',
            margin: '0 auto',
            width: '100%',
            padding: '54px 32px 40px',
            textAlign: 'center',
            alignItems: 'center',
            boxSizing: 'border-box'
          }}
        >
          <div style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)',
            border: '1px solid #ddd6fe',
            color: '#6366f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
            boxShadow: '0 8px 24px -4px rgba(99, 102, 241, 0.2)'
          }}>
            <ShoppingBag size={36} />
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>
            Your Cart is Empty
          </h3>
          <p style={{ fontSize: '0.92rem', color: '#64748b', maxWidth: '480px', margin: '0 auto 26px', lineHeight: 1.55 }}>
            You haven't added any software licenses or cloud packages yet. Explore verified Tally Prime software licenses, enterprise cloud hosting, and automation add-on modules.
          </p>

          <button
            type="button"
            className="flowmail-btn-primary"
            onClick={onBrowseProducts}
            style={{
              alignSelf: 'center',
              width: 'auto',
              padding: '12px 30px',
              fontSize: '0.92rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '32px'
            }}
          >
            <ArrowLeft size={16} />
            <span>Explore Products &amp; Solutions</span>
          </button>
        </div>
      )}
    </div>
  );
}

export { CartSection as Cart, CartSection as cart };
