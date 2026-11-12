import { useState, useEffect, useMemo } from 'react';
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
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cartApi } from '../../../services/cartApi';
import { useIsMobile, useIsPhone } from '../../../utils/useResponsive';

export default function CartSection({
  cartItems = [],
  isReadOnly = false,
  isDemoActive = false,
  demoExpiryDate = null,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToPayment,
  isCheckingOut = false,
  onBrowseProducts,
  onAddToCart
}) {
  const isLocked = Boolean(isReadOnly);
  const [justAddedAddonId, setJustAddedAddonId] = useState(null);
  const [addonsList, setAddonsList] = useState([]);
  const [showAddonsOnCheckout, setShowAddonsOnCheckout] = useState(true);
  const [activeAddonIndex, setActiveAddonIndex] = useState(0);
  const [isAddonHovered, setIsAddonHovered] = useState(false);
  const isMobile = useIsMobile();
  const isPhone = useIsPhone();

  const displayAddons = useMemo(() => addonsList, [addonsList]);

  // Auto horizontally change card every 3.5 seconds (pauses on hover)
  useEffect(() => {
    if (isAddonHovered || displayAddons.length <= 1) return;
    const timer = setInterval(() => {
      setActiveAddonIndex((prev) => (prev + 1) % displayAddons.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isAddonHovered, displayAddons.length]);

  const handlePrevAddon = () => {
    setActiveAddonIndex((prev) => (prev - 1 + displayAddons.length) % displayAddons.length);
  };

  const handleNextAddon = () => {
    setActiveAddonIndex((prev) => (prev + 1) % displayAddons.length);
  };

  // Add-ons and the checkout visibility flag come only from the live API.
  useEffect(() => {
    let isMounted = true;
    const loadDynamicAddons = async () => {
      try {
        const res = await cartApi.getAddons();
        if (!isMounted) return;

        setShowAddonsOnCheckout(res?.showAddonsOnCheckout ?? true);

        const list = Array.isArray(res?.addons) ? res.addons : (Array.isArray(res) ? res : []);
        setAddonsList(list.filter((a) => a.available !== false));
      } catch (err) {
        console.warn('Add-ons API unreachable:', err?.message);
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

  // Resolve item options & secondary line
  const getItemDetails = (item) => {
    const parts = [];
    if (item.category) parts.push(item.category);
    if (item.billingCycle) parts.push(`Cycle: ${item.billingCycle}`);
    else if (item.duration) parts.push(`Duration: ${item.duration}`);
    return parts.join(' · ');
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
        quantity: 1
      });
      setJustAddedAddonId(addon.id);
      toast.success(`Added ${addon.name} to Cart!`, {
        icon: '',
        id: `addon-${addon.id}`
      });
      setTimeout(() => setJustAddedAddonId(null), 1500);
    }
  };

  return (
    <div className="flowmail-section-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── 1. Top Header Banner ────────────────────────────────── */}
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
            Review your selected software licenses and cloud compute packs before secure checkout.
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

      {/* ── 2. Main Content: Two-Column Layout ───────────────────── */}
      {cartItems.length > 0 ? (
        <>
          <div className="cart-two-col-layout" style={{ gap: '24px' }}>
            {/* ── Left Column: Items Table ─────────────────────────── */}
            <div className="cart-col-main" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="flowmail-card" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Table Header Bar — desktop only; phone rows are self-labelled */}
                {!isPhone && (
                <div className="flowmail-cart-head" style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 2.2fr) 110px 110px 110px',
                  padding: '14px 24px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  color: '#94a3b8',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}>
                  <div>Product</div>
                  <div>Price (incl. GST)</div>
                  <div style={{ textAlign: 'center' }}>Qty</div>
                  <div style={{ textAlign: 'right' }}>Total</div>
                </div>
                )}

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {cartItems.map((item, idx) => {
                    const qty = Number(item.quantity) || 1;
                    const unitBase = Number(item.basePrice) || Number(item.price) || 0;
                    const unitWithTax = Math.round(unitBase * 1.18);
                    const lineTotal = unitWithTax * qty;
                    const details = getItemDetails(item);

                    return (
                      <div
                        key={item.id || idx}
                        style={{
                          display: isPhone ? 'flex' : 'grid',
                          flexDirection: isPhone ? 'column' : undefined,
                          gridTemplateColumns: isPhone ? undefined : 'minmax(0, 2.2fr) 110px 110px 110px',
                          padding: isPhone ? '16px' : '20px 24px',
                          borderBottom: idx === cartItems.length - 1 ? 'none' : '1px solid #f1f5f9',
                          alignItems: isPhone ? 'stretch' : 'center',
                          gap: '12px',
                          transition: 'background 0.15s ease'
                        }}
                        className="flowmail-cart-row"
                      >
                        {/* Product Info */}
                        <div style={{ minWidth: 0 }}>
                          <h4 style={{ margin: '0 0 5px 0', fontSize: '0.95rem', fontWeight: '600', color: '#0f172a', lineHeight: 1.4 }}>
                            {item.name}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {item.sku && (
                              <span className="flowmail-receipt-id-badge" style={{ fontSize: '0.72rem', padding: '2px 6px' }}>
                                {item.sku}
                              </span>
                            )}
                            {details && (
                              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                                {details}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price Column */}
                        <div>
                          <div style={{ fontSize: '0.94rem', fontWeight: '600', color: '#0f172a' }}>
                            ₹{unitWithTax.toLocaleString('en-IN')}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            incl. 18% GST
                          </span>
                        </div>

                        {/* QTY Stepper */}
                        <div style={{ display: 'flex', justifyContent: isPhone ? 'flex-start' : 'center' }}>
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
                                width: isMobile ? '40px' : '26px',
                                height: isMobile ? '40px' : '26px',
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
                            <span style={{ width: isMobile ? '34px' : '28px', textAlign: 'center', fontSize: '0.88rem', fontWeight: '600', color: '#0f172a' }}>
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, qty + 1)}
                              aria-label="Increase quantity"
                              style={{
                                width: isMobile ? '40px' : '26px',
                                height: isMobile ? '40px' : '26px',
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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isPhone ? 'space-between' : 'flex-end', gap: '14px' }}>
                          <span style={{ fontSize: '0.96rem', fontWeight: '700', color: '#0f172a' }}>
                            ₹{lineTotal.toLocaleString('en-IN')}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            title="Remove item"
                            aria-label="Remove item"
                            style={{
                              width: isMobile ? '40px' : '28px',
                              height: isMobile ? '40px' : '28px',
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
            </div>

            {/* ── Right Column: Order Summary + Add-Ons ────────────── */}
            <div className="cart-col-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* 1. Order Summary Card */}
              <div className="flowmail-card">
                <div className="flowmail-card-header-row" style={{ marginBottom: '16px' }}>
                  <h3 className="flowmail-card-title">Order Summary</h3>
                  <span className="flowmail-trend-pill indigo" style={{ fontSize: '0.74rem' }}>
                    18% GST Included
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '16px' }}>
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

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 18px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
                  border: '1px solid #e0e7ff'
                }}>
                  <div>
                    <span style={{ fontSize: '0.96rem', fontWeight: '700', color: '#0f172a' }}>Total Amount</span>
                    <span style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8' }}>All taxes inclusive</span>
                  </div>
                  <span style={{ fontSize: '1.55rem', fontWeight: '800', color: '#6366f1', letterSpacing: '-0.01em' }}>
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Primary Proceed Button */}
                <button
                  type="button"
                  className="flowmail-btn-primary"
                  onClick={onProceedToPayment}
                  disabled={isCheckingOut}
                  style={{ width: '100%', justifyContent: 'center', marginTop: '16px', padding: '13px 20px', fontSize: '0.94rem' }}
                >
                  <Lock size={15} />
                  <span>{isCheckingOut ? 'Opening Razorpay…' : 'Proceed to Payment'}</span>
                  <ArrowRight size={16} />
                </button>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '14px',
                  marginTop: '14px',
                  fontSize: '0.74rem',
                  color: '#94a3b8',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <ShieldCheck size={13} color="#10b981" />
                    Secured by Razorpay
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Lock size={12} />
                    256-bit SSL
                  </span>
                </div>
              </div>

              {/* 2. Recommended Add-Ons Card (Controlled by Admin showAddonsOnCheckout switch) */}
              {showAddonsOnCheckout && displayAddons.length > 0 && (
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
                      style={{ padding: isMobile ? '12px' : '4px' }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      className="flowmail-dots-btn"
                      onClick={handleNextAddon}
                      aria-label="Next add-on"
                      style={{ padding: isMobile ? '12px' : '4px' }}
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
                                color: addon.badgeColor || '#6366f1',
                                background: addon.badgeBg || '#ede9fe',
                                padding: '2px 8px',
                                borderRadius: '999px'
                              }}
                            >
                              {addon.badge || 'ADD-ON'}
                            </span>
                            {addon.spec && (
                              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{addon.spec}</span>
                            )}
                          </div>

                          <div style={{ marginBottom: '14px' }}>
                            <h5 style={{ margin: '0 0 3px 0', fontSize: '0.9rem', fontWeight: '600', color: '#0f172a' }}>
                              {addon.name}
                            </h5>
                            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                              {addon.desc || addon.description}
                            </p>
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
                                padding: isMobile ? '10px 16px' : '6px 14px',
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
              )}
            </div>
          </div>
        </>
      ) : (
        /* ── Empty State ────────────────────────────────────────── */
        <div
          className="flowmail-card"
          style={{
            maxWidth: '760px',
            margin: '0 auto',
            width: '100%',
            padding: isMobile ? '34px 18px 28px' : '54px 32px 40px',
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
              width: isMobile ? '100%' : 'auto',
              padding: '12px 30px',
              fontSize: '0.92rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
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