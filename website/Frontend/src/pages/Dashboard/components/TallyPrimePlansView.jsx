import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Check,
  ShoppingCart,
  Sparkles,
  Layers,
  PhoneCall,
  MessageSquare,
  FileText,
  X,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import tallyLogo from '../../../assets/partners/tally.png';

export default function TallyPrimePlansView({
  onBack,
  onAddToCart,
  cartItemIds = [],
  onBrowseAllTally
}) {
  const [justAddedId, setJustAddedId] = useState(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    phone: '',
    email: '',
    requirement: 'Custom invoice formats, TDL extensions & module integration'
  });

  const plans = [
    {
      id: 'tally-prime-silver',
      overline: 'TALLY PRIME',
      title: 'Silver Edition',
      subtitle: 'Single-user edition for standalone desktop PCs & branch workstations',
      price: 22500,
      formattedPrice: '₹22,500',
      gstNote: '+ 18% GST (₹4,050) = ₹26,550 total',
      features: [
        'Single user, standalone PC',
        'All accounting, statutory & GST modules',
        'Inventory management & payroll',
        '1-Year Free TSS renewal included'
      ],
      isPopular: false,
      btnType: 'outline',
      btnText: 'Add Silver to Cart'
    },
    {
      id: 'tally-prime-gold',
      overline: 'TALLY PRIME',
      title: 'Gold Edition',
      subtitle: 'Unlimited multi-user edition for high-speed corporate LAN networks',
      price: 67500,
      formattedPrice: '₹67,500',
      gstNote: '+ 18% GST (₹12,150) = ₹79,650 total',
      features: [
        'Unlimited concurrent users on LAN',
        'All Silver features & statutory reports',
        'Multi-company & multi-branch consolidation',
        '1-Year Free TSS renewal included'
      ],
      isPopular: true,
      popularBadge: 'Most Popular',
      btnType: 'primary-blue',
      btnText: 'Add Gold to Cart'
    },
    {
      id: 'tally-prime-customization',
      overline: 'TALLY PRIME',
      title: 'Custom Modules',
      subtitle: 'Tailor Tally Prime to your exact invoicing & enterprise data workflow',
      isCustom: true,
      customPriceText: 'Custom Quotation',
      gstNote: 'Based on your specific technical requirements',
      features: [
        'Customized GST invoice & e-Way bill formats',
        'Industry-specific workflow modules',
        'TDL-based extension programming',
        'Automated Excel data importer & API sync'
      ],
      isPopular: false,
      btnType: 'primary-amber',
      btnText: 'Request a Quote'
    }
  ];

  const handleSelectPlan = (plan) => {
    if (plan.isCustom) {
      setIsQuoteModalOpen(true);
      return;
    }

    const basePrice = plan.price;
    const gstAmount = Math.round(basePrice * 0.18);
    const finalPrice = basePrice + gstAmount;

    onAddToCart({
      id: plan.id,
      name: `TallyPrime ${plan.title} (Perpetual License)`,
      basePrice,
      originalBasePrice: basePrice,
      finalPrice,
      category: 'Tally Solutions',
      billingCycle: 'One-Time Purchase',
      quantity: 1
    });

    setJustAddedId(plan.id);
    toast.success(`Added TallyPrime ${plan.title} to Cart!`, {
      id: `cart-${plan.id}`,
      icon: '🛒'
    });
    setTimeout(() => setJustAddedId(null), 1800);
  };

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    toast.success('Quotation request submitted! Our Tally engineer will contact you shortly.', {
      icon: '📋',
      duration: 4000
    });
    setIsQuoteModalOpen(false);
  };

  return (
    <div className="flowmail-section-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── 1. Top Header Banner (FlowMail Style) ────────────────── */}
      <section className="flowmail-welcome-banner">
        <div className="flowmail-welcome-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="flowmail-welcome-title">TallyPrime &amp; Customization Plans</h2>
            <span className="flowmail-trend-pill positive" style={{ fontSize: '0.74rem' }}>
              3-Star Certified
            </span>
          </div>
          <p className="flowmail-welcome-sub">
            Verified perpetual software licenses and bespoke business workflow customizations tailored for your enterprise.
          </p>
        </div>

        <button
          type="button"
          className="flowmail-btn-secondary"
          onClick={onBack}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowLeft size={15} />
          <span>Back to Solutions</span>
        </button>
      </section>

      {/* ── 2. 3 Plan Cards (FlowMail Card Theme) ────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {plans.map((plan) => {
          const inCart = !plan.isCustom && cartItemIds.includes(plan.id);
          const isAdded = justAddedId === plan.id;
          const isGold = plan.isPopular;
          const isCustom = plan.isCustom;

          return (
            <div
              key={plan.id}
              className="flowmail-card"
              style={{
                padding: '32px 26px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '20px',
                position: 'relative',
                border: isGold ? '2px solid #6366f1' : '1px solid rgba(226, 232, 240, 0.85)',
                boxShadow: isGold
                  ? '0 14px 34px -4px rgba(99, 102, 241, 0.16), 0 4px 10px -2px rgba(99, 102, 241, 0.08)'
                  : undefined
              }}
            >
              {isGold && (
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
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: '700', color: isGold ? '#6366f1' : '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {plan.overline}
                  </span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0f172a', margin: '4px 0 6px 0' }}>
                    {plan.title}
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                    {plan.subtitle}
                  </p>
                </div>

                {/* Price */}
                <div style={{ padding: '14px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: '18px' }}>
                  {isCustom ? (
                    <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
                      {plan.customPriceText}
                    </div>
                  ) : (
                    <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>
                      {plan.formattedPrice}
                    </div>
                  )}
                  <span style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                    {plan.gstNote}
                  </span>
                </div>

                {/* Features List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.84rem', color: '#475569' }}>
                      <CheckCircle2 size={16} color={isGold ? '#6366f1' : '#10b981'} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ lineHeight: 1.4 }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '18px' }}>
                <button
                  type="button"
                  className={inCart ? 'flowmail-btn-secondary' : 'flowmail-btn-primary'}
                  onClick={() => handleSelectPlan(plan)}
                  disabled={inCart}
                  style={{ width: '100%', justifyContent: 'center', padding: '11px 18px', fontSize: '0.9rem' }}
                >
                  {isAdded ? (
                    <>
                      <Check size={15} />
                      <span>Added to Cart</span>
                    </>
                  ) : inCart ? (
                    <>
                      <Check size={15} />
                      <span>In Cart</span>
                    </>
                  ) : isCustom ? (
                    <>
                      <FileText size={15} />
                      <span>{plan.btnText}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={15} />
                      <span>{plan.btnText}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Bottom Footnote (FlowMail Card) ────────────────────── */}
      <div className="flowmail-card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: '#fff1f2',
            color: '#e11d48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <h4 style={{ margin: '0 0 2px 0', fontSize: '0.92rem', fontWeight: '700', color: '#0f172a' }}>
              Need specialized TSS renewals, multi-company consolidation, or custom TDL?
            </h4>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
              Our certified 5-star Tally experts can consult on customized statutory formats, e-Invoice APIs and accounting.
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/919330113000?text=Hi%20NISPL,%20I%20need%20assistance%20with%20TallyPrime"
          target="_blank"
          rel="noopener noreferrer"
          className="flowmail-btn-secondary"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <MessageSquare size={14} color="#10b981" />
          <span>Chat on WhatsApp</span>
        </a>
      </div>

      {/* ── 4. Customization Quotation Request Modal (FlowMail Modal Style) ── */}
      {isQuoteModalOpen && (
        <div className="flowmail-ai-backdrop" onClick={() => setIsQuoteModalOpen(false)}>
          <div className="flowmail-ai-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="flowmail-ai-modal-header">
              <div className="flowmail-ai-modal-title-group">
                <div className="flowmail-ai-badge-icon">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="flowmail-ai-modal-title">Request Customization Quote</h4>
                  <p className="flowmail-ai-modal-subtitle">Tell us your workflow requirements for a tailored quote</p>
                </div>
              </div>
              <button
                type="button"
                className="flowmail-modal-close-btn"
                onClick={() => setIsQuoteModalOpen(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleQuoteSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#0f172a', marginBottom: '6px' }}>
                  Company / Contact Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FlowMail Systems / Debasish Chakraborty"
                  value={quoteForm.name}
                  onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#0f172a', marginBottom: '6px' }}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98300 12345"
                    value={quoteForm.phone}
                    onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#0f172a', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={quoteForm.email}
                    onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#0f172a', marginBottom: '6px' }}>
                  Customization Details / Required Modules
                </label>
                <textarea
                  rows={3}
                  value={quoteForm.requirement}
                  onChange={(e) => setQuoteForm({ ...quoteForm, requirement: e.target.value })}
                  placeholder="Describe your customized reports, invoice formats, or ERP sync requirements..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <a
                  href={`https://wa.me/919330113000?text=Hi%20NISPL,%20I%20need%20Tally%20Customization:%20${encodeURIComponent(quoteForm.requirement)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flowmail-btn-secondary"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <MessageSquare size={14} color="#10b981" />
                  <span>WhatsApp</span>
                </a>
                <button type="submit" className="flowmail-btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
