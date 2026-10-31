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
    <div className="flowmail-section-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── 1. Top Header Banner (FlowMail Style) ────────────────── */}
      <section className="flowmail-welcome-banner">
        <div className="flowmail-welcome-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="flowmail-welcome-title">{provider.name} Hosting Plans</h2>
            <span className="flowmail-trend-pill indigo" style={{ fontSize: '0.74rem' }}>
              Dedicated Compute
            </span>
          </div>
          <p className="flowmail-welcome-sub">
            {provider.shortDesc}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Annual / Monthly Toggle Switch (FlowMail Pill) */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '999px',
            padding: '3px',
            display: 'inline-flex',
            alignItems: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              style={{
                border: 'none',
                background: billingCycle === 'monthly' ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' : 'transparent',
                color: billingCycle === 'monthly' ? '#ffffff' : '#64748b',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.18s ease'
              }}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annually')}
              style={{
                border: 'none',
                background: billingCycle === 'annually' ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' : 'transparent',
                color: billingCycle === 'annually' ? '#ffffff' : '#64748b',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.18s ease'
              }}
            >
              <span>Annual</span>
              <span style={{
                background: billingCycle === 'annually' ? 'rgba(255,255,255,0.25)' : '#e6f9ed',
                color: billingCycle === 'annually' ? '#ffffff' : '#10b981',
                padding: '2px 6px',
                borderRadius: '999px',
                fontSize: '0.68rem',
                fontWeight: '700'
              }}>
                -10%
              </span>
            </button>
          </div>

          <button
            type="button"
            className="flowmail-btn-secondary"
            onClick={onBack}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={15} />
            <span>Back to Cloud Options</span>
          </button>
        </div>
      </section>

      {/* ── 2. 4 Pricing Cards Grid (FlowMail Card Theme) ─────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {plans.map((plan) => {
          const inCart = cartItemIds.includes(plan.id);
          const isAdded = justAddedId === plan.id;
          const isSilver = plan.tier.toLowerCase() === 'silver' || plan.isPopular;

          const displayPrice = billingCycle === 'annually'
            ? Math.round(plan.monthlyPrice * 0.9)
            : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className="flowmail-card"
              style={{
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '20px',
                position: 'relative',
                border: isSilver ? '2px solid #6366f1' : '1px solid rgba(226, 232, 240, 0.85)',
                boxShadow: isSilver
                  ? '0 12px 32px -4px rgba(99, 102, 241, 0.15), 0 4px 8px -2px rgba(99, 102, 241, 0.08)'
                  : undefined
              }}
            >
              {isSilver && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  padding: '3px 12px',
                  borderRadius: '999px',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  Most Popular
                </div>
              )}

              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {plan.tierName || plan.tier}
                  </span>
                  <span className="flowmail-trend-pill indigo" style={{ fontSize: '0.7rem' }}>
                    {plan.userBadge || '1-3 Users'}
                  </span>
                </div>

                {/* Price */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>₹</span>
                    <span style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>
                      {displayPrice.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '4px' }}>/mo</span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginTop: '3px' }}>
                    + 18% GST ({billingCycle === 'annually' ? 'Billed annually' : 'Monthly'})
                  </span>
                </div>

                {/* Specs List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginBottom: '14px' }}>
                  {plan.specs && plan.specs.map((spec, sIdx) => (
                    <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#475569' }}>
                      <CheckCircle2 size={14} color="#6366f1" style={{ flexShrink: 0 }} />
                      <span><strong>{spec.label}:</strong> {spec.value}</span>
                    </div>
                  ))}
                </div>

                {/* Features */}
                {plan.features && plan.features.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {plan.features.slice(0, 2).map((feat, fIdx) => (
                      <span key={fIdx} style={{ fontSize: '0.76rem', color: '#64748b' }}>
                        &bull; {feat}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button
                  type="button"
                  className={inCart ? 'flowmail-btn-secondary' : 'flowmail-btn-primary'}
                  onClick={() => !inCart && handleAddPlan(plan)}
                  disabled={inCart}
                  style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: '0.88rem' }}
                >
                  {isAdded ? (
                    <>
                      <Check size={14} />
                      <span>Added to Cart</span>
                    </>
                  ) : inCart ? (
                    <>
                      <Check size={14} />
                      <span>In Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={14} />
                      <span>{isSilver ? 'Select Plan' : 'Get A Quotation'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Bottom Consultation Footnote (FlowMail Card) ──────── */}
      <div className="flowmail-card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Server size={18} />
          </div>
          <div>
            <h4 style={{ margin: '0 0 2px 0', fontSize: '0.92rem', fontWeight: '700', color: '#0f172a' }}>
              Need a custom multi-core Xeon VPS or enterprise hybrid cluster?
            </h4>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
              We architect customized high-availability setups for multi-branch organizations with automated failovers.
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/919330113000"
          target="_blank"
          rel="noopener noreferrer"
          className="flowmail-btn-secondary"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <MessageSquare size={14} color="#10b981" />
          <span>Chat on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
