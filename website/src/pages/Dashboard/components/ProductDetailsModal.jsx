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
  const themeAccent = isTally ? '#dc2626' : '#6366f1';
  const themeBg = isTally ? '#fef2f2' : '#ede9fe';

  const pricing = calculatePricing({
    basePrice: product.basePrice,
    discountPercent: product.discountPercent || 0,
    gstRate: 0.18
  });

  const modalContent = (
    <div className="flowmail-ai-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="flowmail-ai-modal animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px' }}
      >
        {/* Modal Header */}
        <div className="flowmail-ai-modal-header">
          <div className="flowmail-ai-modal-title-group">
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: themeBg,
              color: themeAccent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {isTally ? (
                <img src={tallyLogo} alt="Tally" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
              ) : (
                <Server size={22} />
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
                <span className="flowmail-trend-pill indigo" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                  {product.categoryLabel || (isTally ? 'Tally Solution' : 'Cloud Infrastructure')}
                </span>
                <span className="flowmail-trend-pill positive" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                  <CheckCircle2 size={11} /> Certified
                </span>
              </div>
              <h3 className="flowmail-ai-modal-title" style={{ fontSize: '1.12rem' }}>
                {product.fullName || product.name}
              </h3>
            </div>
          </div>

          <button
            type="button"
            className="flowmail-modal-close-btn"
            onClick={onClose}
            aria-label="Close product specifications"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flowmail-ai-modal-body" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
          {/* Hero Short Description */}
          <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '14px', padding: '14px 16px' }}>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
              {product.shortDesc || product.desc}
            </p>
          </div>

          {/* Key Specifications Grid */}
          <h5 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a', margin: '8px 0 0 0' }}>
            Plan Specifications &amp; Parameters
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {product.licenseType && (
              <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '10px 14px' }}>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>License Model</span>
                <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#0f172a' }}>{product.licenseType}</span>
              </div>
            )}
            {product.userType && (
              <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '10px 14px' }}>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>User Capacity</span>
                <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#0f172a' }}>{product.userType}</span>
              </div>
            )}
            {product.cpu && (
              <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '10px 14px' }}>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Processor / Compute</span>
                <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#0f172a' }}>{product.cpu}</span>
              </div>
            )}
            {product.ram && (
              <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '10px 14px' }}>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Dedicated RAM</span>
                <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#0f172a' }}>{product.ram}</span>
              </div>
            )}
            {product.storage && (
              <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '10px 14px' }}>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Storage / NVMe</span>
                <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#0f172a' }}>{product.storage}</span>
              </div>
            )}
            {product.sla && (
              <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '10px 14px' }}>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>High Availability SLA</span>
                <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#0f172a' }}>{product.sla}</span>
              </div>
            )}
          </div>

          {/* Features Checklist */}
          {product.features && product.features.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <h5 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a', margin: '0 0 10px 0' }}>
                Included Modules &amp; Capabilities
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {product.features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.84rem', color: '#475569' }}>
                    <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ lineHeight: 1.4 }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Breakdown Card */}
          <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '16px 18px', marginTop: '10px' }}>
            <h5 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a', margin: '0 0 12px 0' }}>
              Statutory GST Breakdown
            </h5>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#64748b', marginBottom: '8px' }}>
              <span>Base License Fee</span>
              <span style={{ color: '#0f172a', fontWeight: '600' }}>{pricing.formattedDiscountedPrice}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#64748b', marginBottom: '12px' }}>
              <span>GST (18% Input Credit Eligible)</span>
              <span style={{ color: '#0f172a', fontWeight: '600' }}>{pricing.formattedGstAmount}</span>
            </div>

            <div style={{ borderTop: '1px solid #eef2f6', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <span style={{ fontSize: '0.94rem', fontWeight: '700', color: '#0f172a' }}>Total Final Amount</span>
                <span style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8' }}>100% Tax Deductible</span>
              </div>
              <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#6366f1' }}>
                {pricing.formattedFinalPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer CTAs */}
        <div className="flowmail-ai-modal-footer">
          <button
            type="button"
            className="flowmail-btn-secondary"
            onClick={onClose}
          >
            <span>Close</span>
          </button>

          {isInCart ? (
            <button
              type="button"
              className="flowmail-btn-primary"
              onClick={() => {
                onClose();
                onGoToCart && onGoToCart();
              }}
            >
              <ShoppingCart size={15} />
              <span>Already in Cart &bull; View Cart</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              className="flowmail-btn-primary"
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
            >
              <ShoppingCart size={15} />
              <span>Add to Cart</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
