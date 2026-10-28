import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Check,
  Package,
  Layers,
  RotateCw,
  ShieldCheck,
  Server,
  Cpu,
  HardDrive,
  MessageSquare,
  Zap,
  Smartphone,
  ShoppingCart,
  ArrowRight,
  Clock,
  CheckCircle2,
  Lock,
  Building2
} from 'lucide-react';
import { calculatePricing } from '../utils/pricingUtils';
import tallyLogo from '../../../assets/partners/tally.png';

export default function ProductDetailsModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onGoToCart,
  isInCart
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const isTally = product.category === 'software' || product.category === 'tss' || product.category === 'addons' || (product.fullName && product.fullName.includes('Tally'));
  const themeAccent = isTally ? '#dc2626' : '#2563eb';
  const themeBg = isTally ? '#fef2f2' : '#eff6ff';

  const pricing = calculatePricing({
    basePrice: product.basePrice,
    discountPercent: product.discountPercent || 0,
    gstRate: 0.18
  });

  const modalContent = (
    <div className="product-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="product-modal-box animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="product-modal-header" style={{ borderBottomColor: isTally ? '#fee2e2' : '#e0e7ff' }}>
          <div className="product-modal-title-group">
            <div className="product-modal-icon-badge" style={{ background: themeBg, color: themeAccent }}>
              {isTally ? (
                <img src={tallyLogo} alt="Tally" className="modal-tally-logo" />
              ) : (
                <Server size={22} />
              )}
            </div>
            <div>
              <div className="product-modal-tag-row">
                <span className="product-modal-category-tag" style={{ color: themeAccent, background: themeBg }}>
                  {product.categoryLabel || (isTally ? 'Tally Solution' : 'Cloud Infrastructure')}
                </span>
                {product.badge && (
                  <span className={`product-modal-pill ${product.badgeVariant || 'badge-blue'}`}>
                    {product.badge}
                  </span>
                )}
                <span className="product-modal-status">
                  <CheckCircle2 size={12} color="#059669" /> Certified & Verified
                </span>
              </div>
              <h3 className="product-modal-title">{product.fullName || product.name}</h3>
            </div>
          </div>

          <button
            type="button"
            className="product-modal-close"
            onClick={onClose}
            aria-label="Close product specifications"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="product-modal-body">
          {/* Hero Short Description */}
          <div className="product-modal-desc-box">
            <p>{product.shortDesc || product.desc}</p>
          </div>

          {/* Key Specifications Grid */}
          <h5 className="modal-section-heading">Plan Specifications & Parameters</h5>
          <div className="modal-specs-grid">
            {product.licenseType && (
              <div className="modal-spec-card">
                <span className="modal-spec-lbl">License Model</span>
                <span className="modal-spec-val">{product.licenseType}</span>
              </div>
            )}
            {product.userType && (
              <div className="modal-spec-card">
                <span className="modal-spec-lbl">User Capacity</span>
                <span className="modal-spec-val">{product.userType}</span>
              </div>
            )}
            {product.cpu && (
              <div className="modal-spec-card">
                <span className="modal-spec-lbl">Processor / Compute</span>
                <span className="modal-spec-val">{product.cpu}</span>
              </div>
            )}
            {product.ram && (
              <div className="modal-spec-card">
                <span className="modal-spec-lbl">Dedicated RAM</span>
                <span className="modal-spec-val">{product.ram}</span>
              </div>
            )}
            {product.storage && (
              <div className="modal-spec-card">
                <span className="modal-spec-lbl">Storage Drive</span>
                <span className="modal-spec-val">{product.storage}</span>
              </div>
            )}
            {product.os && (
              <div className="modal-spec-card">
                <span className="modal-spec-lbl">Operating System</span>
                <span className="modal-spec-val">{product.os}</span>
              </div>
            )}
            {product.duration && (
              <div className="modal-spec-card">
                <span className="modal-spec-lbl">Duration</span>
                <span className="modal-spec-val">{product.duration}</span>
              </div>
            )}
            {product.billingCycle && (
              <div className="modal-spec-card">
                <span className="modal-spec-lbl">Billing Cycle</span>
                <span className="modal-spec-val">{product.billingCycle}</span>
              </div>
            )}
          </div>

          {/* Included Features Checklist */}
          {product.features && product.features.length > 0 && (
            <>
              <h5 className="modal-section-heading" style={{ marginTop: 22 }}>
                What's Included in this Plan
              </h5>
              <div className="modal-features-list">
                {product.features.map((feat, i) => (
                  <div key={i} className="modal-feature-item">
                    <div className="modal-feature-check" style={{ color: themeAccent, background: themeBg }}>
                      <Check size={13} strokeWidth={2.5} />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Transparent GST & Pricing Breakdown Box */}
          <h5 className="modal-section-heading" style={{ marginTop: 22 }}>
            Transparent Pricing & Tax Breakdown
          </h5>
          <div className="modal-pricing-box">
            <div className="modal-price-row">
              <span className="modal-price-lbl">Base Price</span>
              <span className="modal-price-val font-mono">{pricing.formattedBasePrice}</span>
            </div>

            {pricing.discountAmount > 0 && (
              <div className="modal-price-row discount-row">
                <span className="modal-price-lbl">
                  Promotional Discount ({pricing.discountPercent}%)
                </span>
                <span className="modal-price-val text-emerald font-mono">
                  - {pricing.formattedDiscountAmount}
                </span>
              </div>
            )}

            <div className="modal-price-row subtotal-row">
              <span className="modal-price-lbl">Net Taxable Amount</span>
              <span className="modal-price-val font-mono">{pricing.formattedDiscountedPrice}</span>
            </div>

            <div className="modal-price-row">
              <span className="modal-price-lbl">Goods & Services Tax (18% GST)</span>
              <span className="modal-price-val font-mono">{pricing.formattedGstAmount}</span>
            </div>

            <div className="modal-price-divider" />

            <div className="modal-price-row final-row">
              <div>
                <span className="modal-final-title">Total Payable Amount</span>
                <span className="modal-final-sub">Includes 18% Input Tax Credit (ITC) Eligible GST</span>
              </div>
              <div className="modal-final-right">
                <span className="modal-final-amount" style={{ color: themeAccent }}>
                  {pricing.formattedFinalPrice}
                </span>
                <span className="modal-final-cycle">{product.billingCycle === 'Monthly' ? '/ month' : '/ year'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer CTAs */}
        <div className="product-modal-footer">
          <button
            type="button"
            className="modal-secondary-btn"
            onClick={onClose}
          >
            <span>Close</span>
          </button>

          {isInCart ? (
            <button
              type="button"
              className="modal-primary-btn in-cart-btn"
              onClick={() => {
                onClose();
                onGoToCart && onGoToCart();
              }}
            >
              <ShoppingCart size={15} />
              <span>Already in Cart &middot; View Cart</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              className="modal-primary-btn"
              style={{ background: '#0284c7', borderColor: '#0284c7' }}
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
            >
              <ShoppingCart size={15} />
              <span>Select Plan & Add to Cart</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
