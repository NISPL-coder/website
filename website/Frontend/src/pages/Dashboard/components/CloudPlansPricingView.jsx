import React, { useState, useEffect, useMemo } from 'react';
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
  MessageSquare,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CLOUD_PROVIDERS } from '../data/productsData';
import { formatINR, findOwnedPlan } from '../utils/pricingUtils';
import tallyLogo from '../../../assets/partners/tally.png';
import ctrlsLogo from '../../../assets/partners/ctrls.png';
import { productApi } from '../../../services/productApi';

export default function CloudPlansPricingView({
  providerId,
  onBack,
  onAddToCart,
  cartItemIds = [],
  entitlements = []
}) {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annually'
  const [justAddedId, setJustAddedId] = useState(null);
  const [liveProducts, setLiveProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch live products from database
  useEffect(() => {
    let isMounted = true;
    async function loadLiveProducts() {
      setIsLoading(true);
      try {
        const data = await productApi.getProducts();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setLiveProducts(data);
        }
      } catch (err) {
        console.warn('[CloudPlansPricingView] Could not load live products:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadLiveProducts();
    return () => {
      isMounted = false;
    };
  }, [providerId]);

  const provider =
    CLOUD_PROVIDERS.find(
      (p) =>
        p.id === providerId ||
        (providerId === 'tally-on-cloud' && p.id === 'aws-cloud')
    ) || CLOUD_PROVIDERS[0];

  // CtrlS is sold per concurrent user, so a year is 12 months at list rate
  const isPerUser = provider.billingModel === 'per_user' || providerId === 'ctrls-cloud';
  const ratePerUser = provider.ratePerUserPerMonth || 500;

  // Active plans derived dynamically from backend, strictly filtering out inactive products
  const activePlans = useMemo(() => {
    const providerKey = providerId === 'tally-on-cloud' ? 'aws-cloud' : providerId;

    if (liveProducts.length > 0) {
      const dbMatches = liveProducts.filter((p) => {
        const matchesProv =
          p.provider === providerKey ||
          (providerKey === 'ctrls-cloud' && (p.provider === 'ctrls-cloud' || p.id?.startsWith('ctrls-')));

        // Strict Active / Inactive check
        const isLive = p.available !== false && p.status !== 'inactive';
        // Custom-priced plans are quoted by the admin team, not listed for self-serve.
        return matchesProv && isLive && p.isCustomPlan !== true;
      });

      if (dbMatches.length > 0) {
        return dbMatches
          .map((p) => {
            const mPrice =
              typeof p.monthlyPrice === 'number'
                ? p.monthlyPrice
                : typeof p.price === 'number'
                ? p.price
                : parseInt(String(p.price).replace(/[^0-9]/g, ''), 10) || 500;

            const uCount = p.users || (p.tier ? parseInt(p.tier.replace(/[^0-9]/g, ''), 10) : 1) || 1;

            const serverConfig = p.serverConfiguration || p.userBadge || `${uCount} User`;
            return {
              id: p.id || p.productId,
              name: p.name,
              tier: p.tier || `${uCount} User`,
              tierName: p.tier || `${uCount} User`,
              serverConfiguration: serverConfig,
              users: uCount,
              userBadge: serverConfig,
              ipAddress: p.ipAddress || '103.115.220.41',
              monthlyPrice: mPrice,
              originalPrice: Math.round(mPrice * 1.15),
              specs: p.specs && p.specs.length > 0
                ? p.specs
                : [
                    { label: 'Server Configuration', value: serverConfig },
                    { label: 'Datacenter', value: 'CtrlS Kolkata Tier-4' },
                    { label: 'Static IP', value: p.ipAddress || '103.115.220.41' }
                  ],
              features: p.features && p.features.length > 0
                ? p.features
                : [
                    `Server Configuration: ${serverConfig}`,
                    `CtrlS Tier-4 Datacenter hosting (Static IP: ${p.ipAddress || '103.115.220.41'})`,
                    'Windows Server licence & daily snapshot backup',
                    'N+N dual power feed redundancy'
                  ],
              isPopular: uCount === 5 || uCount === 10
            };
          })
          .sort((a, b) => a.users - b.users);
      }
    }

    // Fallback: static plans filtered by active status
    return (provider.plans || []).filter(
      (p) => p.available !== false && p.status !== 'inactive'
    );
  }, [liveProducts, providerId, provider]);

  const periodBasePrice = (plan) => {
    if (billingCycle !== 'annually') return plan.monthlyPrice;
    return isPerUser ? plan.monthlyPrice * 12 : Math.round(plan.monthlyPrice * 0.9);
  };

  const handleAddPlan = (plan) => {
    const basePrice = periodBasePrice(plan);
    const gstAmount = Math.round(basePrice * 0.18);
    const finalPrice = basePrice + gstAmount;

    onAddToCart({
      id: plan.id,
      name: `${plan.name} (${billingCycle === 'annually' ? 'Annual Plan' : 'Monthly'})`,
      basePrice,
      originalBasePrice: plan.originalPrice || basePrice,
      finalPrice,
      category: provider.name,
      billingCycle:
        billingCycle === 'annually'
          ? isPerUser
            ? 'Annual Billing (12 Months)'
            : 'Annual Billing (-10%)'
          : 'Monthly',
      quantity: 1,
      ipAddress: plan.ipAddress
    });

    setJustAddedId(plan.id);
    toast.success(`Added ${plan.name} to Cart!`, {
      id: `cart-${plan.id}`,
      icon: '🛒'
    });
    setTimeout(() => setJustAddedId(null), 1800);
  };

  return (
    <div
      className="flowmail-section-wrapper animate-fade-in"
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
    >
      {/* ── 1. Top Header Banner ────────────────── */}
      <section className="flowmail-welcome-banner">
        <div className="flowmail-welcome-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="flowmail-welcome-title">{provider.name} Hosting Plans</h2>
            <span className="flowmail-trend-pill indigo" style={{ fontSize: '0.74rem' }}>
              Dedicated Compute
            </span>
            {isPerUser && (
              <span className="flowmail-trend-pill indigo" style={{ fontSize: '0.74rem' }}>
                {formatINR(ratePerUser)} / user / month
              </span>
            )}
          </div>
          <p className="flowmail-welcome-sub">{provider.shortDesc}</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Annual / Monthly Toggle Switch */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '999px',
              padding: '3px',
              display: 'inline-flex',
              alignItems: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              style={{
                border: 'none',
                background:
                  billingCycle === 'monthly'
                    ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)'
                    : 'transparent',
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
                background:
                  billingCycle === 'annually'
                    ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)'
                    : 'transparent',
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
              <span
                style={{
                  background:
                    billingCycle === 'annually' ? 'rgba(255,255,255,0.25)' : '#e6f9ed',
                  color: billingCycle === 'annually' ? '#ffffff' : '#10b981',
                  padding: '2px 6px',
                  borderRadius: '999px',
                  fontSize: '0.68rem',
                  fontWeight: '700'
                }}
              >
                {isPerUser ? '12 mo' : '-10%'}
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

      {/* ── 2. Pricing Cards Grid (Strictly Active Plans Only) ───────────── */}
      {activePlans.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {activePlans.map((plan) => {
            const inCart = cartItemIds.includes(plan.id);
            const isAdded = justAddedId === plan.id;
            const isSilver = plan.tier?.toLowerCase() === 'silver' || plan.isPopular;
            const owned = findOwnedPlan(entitlements, { id: plan.id, names: [plan.name] });

            const displayPrice = periodBasePrice(plan);
            const priceSuffix = isPerUser && billingCycle === 'annually' ? '/yr' : '/mo';

            return (
              <div
                key={plan.id}
                className="flowmail-card cloud-plan-card"
                style={{
                  padding: '28px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '20px',
                  position: 'relative',
                  border: owned
                    ? '2px solid #10b981'
                    : isSilver
                    ? '2px solid #6366f1'
                    : '1px solid rgba(226, 232, 240, 0.85)',
                  boxShadow: owned
                    ? '0 12px 32px -4px rgba(16, 185, 129, 0.18), 0 4px 8px -2px rgba(16, 185, 129, 0.10)'
                    : isSilver
                    ? '0 12px 32px -4px rgba(99, 102, 241, 0.15), 0 4px 8px -2px rgba(99, 102, 241, 0.08)'
                    : undefined
                }}
              >
                {owned && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      right: '18px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      padding: '3px 12px',
                      borderRadius: '999px',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <CheckCircle2 size={12} />
                    <span>Current Plan</span>
                  </div>
                )}

                {isSilver && (
                  <div
                    style={{
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
                    }}
                  >
                    Most Popular
                  </div>
                )}

                <div>
                  {/* Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '10px',
                      marginBottom: '14px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        color: '#6366f1',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em'
                      }}
                    >
                      {plan.tierName || plan.tier}
                      {isPerUser && (
                        <span
                          style={{
                            display: 'block',
                            marginTop: '3px',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            color: '#94a3b8',
                            letterSpacing: '0.02em',
                            textTransform: 'none'
                          }}
                        >
                          Server Configuration
                        </span>
                      )}
                    </span>
                    <span
                      className="flowmail-trend-pill indigo"
                      style={{ fontSize: '0.7rem', textAlign: 'right' }}
                    >
                      {plan.userBadge || '1-3 Users'}
                    </span>
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                        ₹
                      </span>
                      <span
                        style={{
                          fontSize: '2rem',
                          fontWeight: '800',
                          color: '#0f172a',
                          letterSpacing: '-0.02em',
                          lineHeight: 1
                        }}
                      >
                        {displayPrice.toLocaleString('en-IN')}
                      </span>
                      <span
                        style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '4px' }}
                      >
                        {priceSuffix}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        color: '#94a3b8',
                        display: 'block',
                        marginTop: '3px'
                      }}
                    >
                      + 18% GST ({billingCycle === 'annually' ? 'Billed annually' : 'Monthly'})
                    </span>
                  </div>
                  
                  {/* Specs List */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '14px'
                    }}
                  >
                    {plan.specs &&
                      plan.specs.map((spec, sIdx) => (
                        <div
                          key={sIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.82rem',
                            color: '#475569'
                          }}
                        >
                          <CheckCircle2
                            size={14}
                            color="#6366f1"
                            style={{ flexShrink: 0 }}
                          />
                          <span>
                            <strong>{spec.label}:</strong> {spec.value}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Bottom Action */}
                <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    type="button"
                    onClick={() => handleAddPlan(plan)}
                    disabled={inCart}
                    className={
                      inCart
                        ? 'flowmail-btn-secondary'
                        : isSilver
                        ? 'flowmail-btn-primary'
                        : 'flowmail-btn-secondary'
                    }
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      padding: '10px 16px',
                      fontSize: '0.88rem'
                    }}
                  >
                    {inCart ? (
                      <>
                        <Check size={16} />
                        <span>Added to Cart</span>
                      </>
                    ) : isAdded ? (
                      <>
                        <Check size={16} />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={16} />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="flowmail-card"
          style={{
            padding: '48px 32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <Server size={42} color="#94a3b8" />
          <h3 style={{ fontSize: '1.1rem', color: '#1e293b', margin: 0 }}>
            No Active Plans Currently Published
          </h3>
          <p style={{ fontSize: '0.86rem', color: '#64748b', maxWidth: '420px', margin: 0 }}>
            All server tiers for this cloud infrastructure are currently undergoing maintenance or are disabled by administrators.
          </p>
          <button
            type="button"
            className="flowmail-btn-secondary"
            onClick={onBack}
            style={{ marginTop: '12px' }}
          >
            ← Explore Other Cloud Providers
          </button>
        </div>
      )}
    </div>
  );
}
