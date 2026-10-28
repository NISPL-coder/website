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
  Zap
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
    <div className="cart-page-canvas animate-fade-in">
      {/* ── 1. Top Header (My Cart & Continue Shopping) ──────────── */}
      <div className="cart-page-header">
        <div className="cart-header-title-wrap">
          <h1 className="cart-main-heading">My Cart</h1>
          {cartItems.length > 0 && (
            <span className="cart-header-count-badge">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        <button
          type="button"
          className="cart-continue-btn"
          onClick={onBrowseProducts}
        >
          <ArrowLeft size={15} />
          <span>Continue shopping</span>
        </button>
      </div>

      {/* ── 2. Two-Column Layout (Items Left, Summary + Add-Ons Right) ── */}
      {cartItems.length > 0 ? (
        <>
          <div className="cart-two-col-layout">
          {/* ── Left Column: Items Table & Fulfillment Mode ──────── */}
          <div className="cart-col-main">
            {/* Column Headers */}
            <div className="cart-grid-header">
              <div className="cart-th th-product">PRODUCT</div>
              <div className="cart-th th-price">PRICE</div>
              <div className="cart-th th-qty">QTY</div>
              <div className="cart-th th-total">TOTAL</div>
            </div>

            {/* Cart Items List */}
            <div className="cart-items-list">
              {cartItems.map((item, idx) => {
                const qty = Number(item.quantity) || 1;
                const unitBase = Number(item.basePrice) || Number(item.price) || 0;
                const unitWithTax = Math.round(unitBase * 1.18);
                const lineTotal = unitWithTax * qty;
                const imageSrc = getItemImage(item);
                const sku = getItemSku(item, idx);
                const details = getItemDetails(item);

                return (
                  <div key={item.id || idx} className="cart-item-row">
                    {/* Product Info */}
                    <div className="cart-cell cell-product">
                      <div className="cart-item-thumb">
                        <img src={imageSrc} alt={item.name} className="cart-thumb-img" />
                      </div>
                      <div className="cart-item-info">
                        <h3 className="cart-item-name">{item.name}</h3>
                        <div className="cart-item-sku">{sku}</div>
                        <div className="cart-item-options">{details}</div>
                      </div>
                    </div>

                    {/* Price Column */}
                    <div className="cart-cell cell-price">
                      <span className="cart-price-tax-note">+ 18% GST Applicable</span>
                      <span className="cart-price-val">₹{unitWithTax.toLocaleString('en-IN')}</span>
                    </div>

                    {/* QTY Column (Stepper) */}
                    <div className="cart-cell cell-qty">
                      <div className="cart-stepper-control">
                        <button
                          type="button"
                          className="cart-step-btn"
                          onClick={() => onUpdateQuantity(item.id, qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="cart-step-num">{qty}</span>
                        <button
                          type="button"
                          className="cart-step-btn"
                          onClick={() => onUpdateQuantity(item.id, qty + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Total Column + Remove Cross */}
                    <div className="cart-cell cell-total">
                      <span className="cart-line-total">₹{lineTotal.toLocaleString('en-IN')}</span>
                      <button
                        type="button"
                        className="cart-remove-btn"
                        onClick={() => onRemoveItem(item.id)}
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Choose Fulfillment Mode */}
            <div className="cart-fulfillment-box">
              <h4 className="cart-shipping-title">Choose fulfillment & setup mode:</h4>

              <div className="cart-fulfillment-options-grid">
                <label
                  className={`cart-shipping-option ${fulfillmentMode === 'digital' ? 'is-selected' : ''}`}
                  onClick={() => handleSelectFulfillment('digital')}
                >
                  <span className={`cart-radio-circle ${fulfillmentMode === 'digital' ? 'checked' : ''}`}>
                    {fulfillmentMode === 'digital' && <span className="cart-radio-inner" />}
                  </span>
                  <div className="cart-shipping-text">
                    <span className="cart-shipping-mode-name">
                      Instant digital activation ( In 15 min ) &bull; <strong>FREE</strong>
                    </span>
                    <span className="cart-shipping-sub">
                      Official license keys & cloud access dispatched to registered email
                    </span>
                  </div>
                </label>

                <label
                  className={`cart-shipping-option ${fulfillmentMode === 'assisted' ? 'is-selected' : ''}`}
                  onClick={() => handleSelectFulfillment('assisted')}
                >
                  <span className={`cart-radio-circle ${fulfillmentMode === 'assisted' ? 'checked' : ''}`}>
                    {fulfillmentMode === 'assisted' && <span className="cart-radio-inner" />}
                  </span>
                  <div className="cart-shipping-text">
                    <span className="cart-shipping-mode-name">
                      Assisted remote setup ( AnyDesk / Remote ) &bull; <strong>FREE</strong>
                    </span>
                    <span className="cart-shipping-sub">
                      Priority configuration by certified NISPL engineers
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ── Right Column: Order Summary + Add-Ons Below Checkout ── */}
          <div className="cart-col-sidebar">
            {/* 1. Top Card: Order Summary & Checkout Button */}
            <div className="cart-sidebar-summary-card">
              <div className="cart-summary-head">
                <h3 className="cart-summary-title">Order Summary</h3>
                <span className="cart-summary-badge">18% GST</span>
              </div>

              <div className="cart-totals-table">
                <div className="cart-total-line">
                  <span className="totals-label">Items Base Fare</span>
                  <span className="totals-val">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="cart-total-line">
                  <span className="totals-label">Taxes & GST (18%)</span>
                  <span className="totals-val">₹{taxTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="cart-total-line">
                  <span className="totals-label">Activation & Delivery</span>
                  <span className="totals-val text-emerald">FREE</span>
                </div>
                <div className="cart-total-line grand">
                  <span className="totals-label">Total Amount</span>
                  <span className="totals-val total-highlight">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* 2. DIRECTLY BELOW CHECKOUT AMOUNT: Add-on Section (Highlighted Section) */}
            <div
              className="cart-sidebar-addons-card"
              onMouseEnter={() => setIsAddonHovered(true)}
              onMouseLeave={() => setIsAddonHovered(false)}
            >
              <div className="sidebar-addons-head">
                <div className="sidebar-addons-title-group">
                  <Sparkles size={16} className="sidebar-addons-icon" />
                  <h4 className="sidebar-addons-title">Add-Ons</h4>
                  {/* Visual 2-card pagination indicator */}
                  <div className="sidebar-addons-dots">
                    {displayAddons.map((_, i) => (
                      <span
                        key={i}
                        className={`addon-dot ${activeAddonIndex === i ? 'active' : ''}`}
                        onClick={() => setActiveAddonIndex(i)}
                        title={`View Card ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="sidebar-addons-nav">
                  <button
                    type="button"
                    className="sidebar-arrow-btn"
                    onClick={handlePrevAddon}
                    aria-label="Previous add-on"
                    title="Previous add-on"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    type="button"
                    className="sidebar-arrow-btn"
                    onClick={handleNextAddon}
                    aria-label="Next add-on"
                    title="Next add-on"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>

              {/* Horizontal Slider Viewport with smooth transform translateX */}
              <div className="sidebar-addons-viewport">
                <div
                  className="sidebar-addons-track"
                  style={{
                    transform: `translateX(-${activeAddonIndex * 100}%)`,
                    transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
                  }}
                >
                  {displayAddons.map((addon) => {
                    const inCart = cartItems.some((c) => c.id === addon.id);
                    const isJustAdded = justAddedAddonId === addon.id;
                    const priceWithGst = Math.round(addon.basePrice * 1.18);

                    return (
                      <div key={addon.id} className="sidebar-addon-item-card">
                        <div className="sidebar-addon-top">
                          <span
                            className="sidebar-addon-badge"
                            style={{ color: addon.badgeColor, background: addon.badgeBg }}
                          >
                            {addon.badge}
                          </span>
                          <span className="sidebar-addon-spec">{addon.spec}</span>
                        </div>

                        <div className="sidebar-addon-body">
                          <div className="sidebar-addon-img-wrap">
                            <img src={addon.image} alt={addon.name} className="sidebar-addon-img" />
                          </div>
                          <div className="sidebar-addon-details">
                            <h5 className="sidebar-addon-name">{addon.name}</h5>
                            <p className="sidebar-addon-desc">{addon.desc}</p>
                          </div>
                        </div>

                        <div className="sidebar-addon-bottom">
                          <div className="sidebar-addon-price-col">
                            <span className="sidebar-addon-price">₹{priceWithGst.toLocaleString('en-IN')}</span>
                            <span className="sidebar-addon-gst">incl. GST</span>
                          </div>

                          <button
                            type="button"
                            className={`sidebar-addon-add-btn ${inCart ? 'in-cart' : ''}`}
                            onClick={() => !inCart && handleAddAddon(addon)}
                            disabled={inCart}
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

        {/* ── 3. Fixed / Sticky Bottom Checkout Bar (Across Highlighted Section) ── */}
        <div className="cart-sticky-checkout-bar" id="cart-sticky-checkout-bar">
          <div className="sticky-checkout-left">
            <div className="sticky-checkout-pricing">
              <span className="sticky-checkout-total-label">Grand Total:</span>
              <span className="sticky-checkout-total-amt">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
              <span className="sticky-checkout-tax-badge">Incl. all taxes &amp; GST</span>
            </div>
          </div>

          <div className="sticky-checkout-right">
            <button
              type="button"
              id="sticky-checkout-btn"
              className="cart-sticky-checkout-btn"
              onClick={onProceedToPayment}
            >
              <span className="sticky-btn-text">Proceed to Checkout</span>
              <span className="sticky-btn-price">₹{grandTotal.toLocaleString('en-IN')}</span>
              <ArrowRight size={17} className="sticky-btn-icon" />
            </button>
          </div>
        </div>
        </>
      ) : (
        /* Empty State */
        <div className="cart-empty-view">
          <div className="cart-empty-icon-wrap">
            <ShoppingBag size={38} color="#94a3b8" />
          </div>
          <h3>Your cart is empty</h3>
          <p>Explore our genuine Tally licenses, dedicated cloud hosting, and automation add-ons.</p>
          <button
            type="button"
            className="cart-browse-btn"
            onClick={onBrowseProducts}
          >
            <ArrowLeft size={16} />
            <span>Explore Solutions</span>
          </button>
        </div>
      )}
    </div>
  );
}
