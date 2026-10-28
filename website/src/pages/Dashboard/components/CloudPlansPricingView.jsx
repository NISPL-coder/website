import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Check,
  ShoppingCart,
  Sparkles,
  Server,
  ShieldCheck,
  Zap,
  Info,
  PhoneCall,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CLOUD_PROVIDERS } from '../data/productsData';
import { formatINR } from '../utils/pricingUtils';
import tallyLogo from '../../../assets/partners/tally.png';
import ctrlsLogo from '../../../assets/partners/ctrls.png';

export default function CloudPlansPricingView({
  providerId,
  onBack,
  onAddToCart,
  cartItemIds = []
}) {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annually'
  const [justAddedId, setJustAddedId] = useState(null);

  const provider = CLOUD_PROVIDERS.find((p) => p.id === providerId || (providerId === 'tally-on-cloud' && p.id === 'aws-cloud')) || CLOUD_PROVIDERS[0];
  const plans = provider.plans || [];

  const handleAddPlan = (plan) => {
    // 18% GST calculation
    const basePrice = billingCycle === 'annually'
      ? Math.round(plan.monthlyPrice * 0.9)
      : plan.monthlyPrice;

    const gstAmount = Math.round(basePrice * 0.18);
    const finalPrice = basePrice + gstAmount;

    onAddToCart({
      id: plan.id,
      name: `${plan.name} (${billingCycle === 'annually' ? 'Annual Plan' : 'Monthly'})`,
      basePrice,
      originalBasePrice: plan.originalPrice || basePrice,
      finalPrice,
      category: provider.name,
      billingCycle: billingCycle === 'annually' ? 'Annual Billing (-10%)' : 'Monthly',
      quantity: 1
    });

    setJustAddedId(plan.id);
    toast.success(`Added ${plan.name} to Cart!`, {
      id: `cart-${plan.id}`,
      icon: '🛒'
    });
    setTimeout(() => setJustAddedId(null), 1800);
  };

  return (
    <div className="cloud-pricing-view-container animate-fade-in">
      {/* ── Top Right Corner Navigation Section ──────────── */}
      <div className="showcase-top-right-nav">

        <button
          type="button"
          className="showcase-corner-back-btn"
          onClick={onBack}
          title="Back to Cloud Providers"
          aria-label="Back to Cloud Providers"
        >
          <ArrowLeft size={16} className="back-arrow-icon" />
          <span>Back to Cloud Options</span>
        </button>
      </div>

      {/* ── Header ────────────────────────────────────────── */}
      <div className="pricing-view-header">
        <h2 className="pricing-view-title">{provider.name} Hosting Plans</h2>
        <p className="pricing-view-subtitle">
          {provider.shortDesc}
        </p>

        {/* Annual / Monthly Billing Switch */}
        <div className="pricing-billing-toggle-wrapper">
          <button
            type="button"
            className={`billing-toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            className={`billing-toggle-btn ${billingCycle === 'annually' ? 'active' : ''}`}
            onClick={() => setBillingCycle('annually')}
          >
            Annual Billing
            <span className="billing-save-pill">Save 10%</span>
          </button>
        </div>
      </div>

      {/* ── 4 Tiered Pricing Cards Grid (Starter, Silver, Gold, Premium) ── */}
      <div className="pricing-cards-4grid" role="region" aria-label="Hosting Plans">
        {plans.map((plan) => {
          const inCart = cartItemIds.includes(plan.id);
          const isAdded = justAddedId === plan.id;
          const isSilver = plan.tier.toLowerCase() === 'silver' || plan.isPopular;
          const isPremium = plan.tier.toLowerCase() === 'premium';

          // Price calculation based on toggle
          const displayPrice = billingCycle === 'annually'
            ? Math.round(plan.monthlyPrice * 0.9)
            : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className={`cloud-pricing-card ${isSilver ? 'is-popular-card' : ''} ${isPremium ? 'is-premium-card' : ''} ${inCart ? 'is-in-cart' : ''}`}
            >
              {/* Most Popular Ribbon on Silver Plan */}
              {isSilver && (
                <div className="popular-badge-ribbon">
                  <span>Most Popular</span>
                </div>
              )}

              {/* Card Header: User Badge / Tier Name */}
              <div className="pricing-card-header">
                <span className="pricing-user-badge">
                  {plan.userBadge || plan.tierName.toUpperCase()}
                </span>
                <span className="pricing-tier-label">{plan.tier}</span>
              </div>

              {/* Price Area */}
              <div className="pricing-card-price-area">
                <div className="pricing-amt-row">
                  <span className="pricing-currency-symbol">₹</span>
                  <span className="pricing-amount-number">
                    {displayPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="pricing-cycle-text">
                  per month + GST
                </span>

                {/* Save 10% Annually Tag */}
                <div className="pricing-discount-tag-row">
                  <span className="pricing-save-tag">
                    Save 10% annually
                  </span>
                  {plan.originalPrice && billingCycle === 'monthly' && (
                    <span className="pricing-strikethrough">
                      ₹{plan.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              {/* Specification Checklist */}
              <div className="pricing-specs-checklist">
                {plan.specs && plan.specs.map((spec, sIdx) => (
                  <div key={sIdx} className="pricing-spec-row">
                    <CheckCircle2 size={16} className="spec-check-icon" />
                    <span className="spec-label">{spec.label}:</span>
                    <span className="spec-value">{spec.value}</span>
                  </div>
                ))}
              </div>

              {/* Additional Highlights */}
              {plan.features && plan.features.length > 0 && (
                <div className="pricing-features-mini-list">
                  {plan.features.slice(0, 2).map((feat, fIdx) => (
                    <div key={fIdx} className="pricing-feature-item">
                      <span className="feat-bullet">&bull;</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Button: Get A Quotation / Add to Cart */}
              <div className="pricing-card-action">
                <button
                  type="button"
                  className={`pricing-action-btn ${isSilver ? 'primary-silver' : isPremium ? 'primary-premium' : 'outline-btn'} ${inCart ? 'in-cart' : ''} ${isAdded ? 'added' : ''}`}
                  onClick={() => !inCart && handleAddPlan(plan)}
                  title={inCart ? 'Already in cart' : 'Add to cart'}
                >
                  {isAdded ? (
                    <>
                      <Check size={16} />
                      <span>Added to Cart</span>
                    </>
                  ) : inCart ? (
                    <>
                      <Check size={16} />
                      <span>In Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      <span>{isSilver ? 'Select Plan' : 'Get A Quotation'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bottom Footnote / Consultation Banner ──────────── */}
      <div className="pricing-bottom-footnote">
        <p>
          Save 10% on all plans with annual billing. Need a larger or custom configuration?{' '}
          <a
            href="https://wa.me/919330113000"
            target="_blank"
            rel="noopener noreferrer"
            className="footnote-link"
          >
            Contact us &mdash; we build plans for enterprises and multi-branch businesses. WhatsApp us &rarr;
          </a>
        </p>
      </div>
    </div>
  );
}
