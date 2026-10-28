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
  X
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
      title: 'Silver',
      subtitle: 'Single-user edition for standalone PCs',
      price: 22500,
      formattedPrice: '₹22,500',
      gstNote: '+ 18% GST (₹4,050) = ₹26,550 total',
      features: [
        'Single user, one PC',
        'All accounting & GST features',
        'Inventory & payroll included',
        '1 year TSS included'
      ],
      isPopular: false,
      btnType: 'outline',
      btnText: 'Get A Quotation'
    },
    {
      id: 'tally-prime-gold',
      overline: 'TALLY PRIME',
      title: 'Gold',
      subtitle: 'Unlimited multi-user edition for LAN networks',
      price: 67500,
      formattedPrice: '₹67,500',
      gstNote: '+ 18% GST (₹12,150) = ₹79,650 total',
      features: [
        'Unlimited users on LAN',
        'All Silver features included',
        'Multi-branch & multi-company',
        '1 year TSS included'
      ],
      isPopular: true,
      popularBadge: 'Most Popular',
      btnType: 'primary-blue',
      btnText: 'Get A Quotation'
    },
    {
      id: 'tally-prime-customization',
      overline: 'TALLY PRIME',
      title: 'Customization',
      subtitle: 'Tailor Tally Prime to your exact workflow',
      isCustom: true,
      customPriceText: 'Custom Pricing',
      gstNote: 'Based on your requirements',
      features: [
        'Custom invoice formats',
        'Industry-specific modules',
        'TDL-based extensions',
        'Excel data import tools'
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
    <div className="tally-prime-plans-container animate-fade-in">
      {/* ── Top Right Corner Navigation Section ──────────── */}
      <div className="showcase-top-right-nav">
        <button
          type="button"
          className="showcase-corner-back-btn"
          onClick={onBack}
          title="Back to Solutions"
          aria-label="Back to Solutions"
        >
          <ArrowLeft size={16} className="back-arrow-icon" />
          <span>Back to Solutions</span>
        </button>
      </div>

      {/* ── Header ────────────────────────────────────────── */}
      <div className="pricing-view-header">
        <h2 className="pricing-view-title">TallyPrime & Customization Plans</h2>
        <p className="pricing-view-subtitle">
          Verified perpetual software licenses and bespoke business workflow customizations tailored for your enterprise.
        </p>
      </div>

      {/* ── 3 Plan Cards Grid (Silver, Gold, Customization) ── */}
      <div className="tally-plans-3grid" role="region" aria-label="TallyPrime Plans">
        {plans.map((plan) => {
          const inCart = !plan.isCustom && cartItemIds.includes(plan.id);
          const isAdded = justAddedId === plan.id;
          const isGold = plan.isPopular;
          const isCustom = plan.isCustom;

          return (
            <div
              key={plan.id}
              className={`tally-plan-card ${isGold ? 'is-popular-gold-card' : ''} ${isCustom ? 'is-custom-card' : ''} ${inCart ? 'is-in-cart' : ''}`}
            >
              {/* Most Popular Ribbon on Gold Plan */}
              {isGold && (
                <div className="popular-badge-ribbon">
                  <span>Most Popular</span>
                </div>
              )}

              {/* Card Header: Tally Prime Overline, Title & Subtitle */}
              <div className="tally-card-head">
                <span className="tally-card-overline">{plan.overline}</span>
                <h3 className="tally-card-title">{plan.title}</h3>
                <p className="tally-card-tagline">{plan.subtitle}</p>
              </div>

              {/* Price Area */}
              <div className="tally-card-price-block">
                {isCustom ? (
                  <div className="tally-custom-price-val font-outfit">
                    {plan.customPriceText}
                  </div>
                ) : (
                  <div className="tally-price-amt-row">
                    <span className="tally-amount-number font-outfit">
                      {plan.formattedPrice}
                    </span>
                  </div>
                )}
                <span className="tally-gst-subtext">
                  {plan.gstNote}
                </span>
              </div>

              {/* Features List with Green Checkmarks */}
              <div className="tally-features-checklist">
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="tally-feature-row">
                    <CheckCircle2 size={18} className="tally-green-check" />
                    <span className="tally-feature-text">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Button: Get A Quotation / Add to Cart / Request a Quote */}
              <div className="tally-card-action">
                <button
                  type="button"
                  className={`tally-plan-btn ${plan.btnType} ${inCart ? 'in-cart' : ''} ${isAdded ? 'added' : ''}`}
                  onClick={() => handleSelectPlan(plan)}
                  title={inCart ? 'Already in cart' : plan.btnText}
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
                  ) : isCustom ? (
                    <>
                      <FileText size={16} />
                      <span>{plan.btnText}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      <span>{plan.btnText}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bottom Footnote / Custom Tally TDL Modules ──────────── */}
      <div className="pricing-bottom-footnote">
        <p>
          Need specialized TSS renewals, multi-company accounting, or barcode & WhatsApp integrations?{' '}
          <a
            href="https://wa.me/919330113000?text=Hi%20NISPL,%20I%20need%20assistance%20with%20TallyPrime"
            target="_blank"
            rel="noopener noreferrer"
            className="footnote-link"
          >
            Chat with our Certified Tally Experts on WhatsApp &rarr;
          </a>
        </p>
      </div>

      {/* ── Customization Quotation Request Modal ──────────── */}
      {isQuoteModalOpen && (
        <div className="quote-modal-overlay" onClick={() => setIsQuoteModalOpen(false)}>
          <div className="quote-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="quote-modal-header">
              <div>
                <h4 className="quote-modal-title">Request Tally Customization Quote</h4>
                <p className="quote-modal-sub">Tell us your workflow requirements for a tailored quote.</p>
              </div>
              <button
                type="button"
                className="quote-modal-close"
                onClick={() => setIsQuoteModalOpen(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleQuoteSubmit} className="quote-modal-form">
              <div className="form-group">
                <label>Company / Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Enterprises / Rahul Sharma"
                  value={quoteForm.name}
                  onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={quoteForm.phone}
                    onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={quoteForm.email}
                    onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Customization Details / Required Modules</label>
                <textarea
                  rows={3}
                  value={quoteForm.requirement}
                  onChange={(e) => setQuoteForm({ ...quoteForm, requirement: e.target.value })}
                  placeholder="Describe your customized reports, invoice formats, or ERP sync requirements..."
                />
              </div>

              <div className="quote-modal-actions">
                <a
                  href={`https://wa.me/919330113000?text=Hi%20NISPL,%20I%20need%20Tally%20Customization:%20${encodeURIComponent(quoteForm.requirement)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-quick-quote-btn"
                >
                  <MessageSquare size={16} />
                  <span>Quote via WhatsApp</span>
                </a>
                <button type="submit" className="quote-submit-btn">
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
