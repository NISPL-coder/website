import React from 'react';
import { ArrowRight, ArrowLeft, Cloud, Server, Sparkles, CheckCircle2 } from 'lucide-react';
import tallyLogo from '../../../assets/partners/tally.png';
import ctrlsLogo from '../../../assets/partners/ctrls.png';

// Authentic Official Amazon Web Services (AWS) SVG Icon
function AwsIcon({ size = 46, className = '' }) {
  return (
    <svg
      width={size * 1.3}
      height={size}
      viewBox="0 0 100 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Amazon Web Services"
    >
      {/* 'a' */}
      <path
        d="M26.8 31.7c-1.4 1.2-3.2 1.8-5.3 1.8-4.2 0-6.8-2.6-6.8-6.6 0-4.4 3-6.7 8.3-7l3.8-.2v-1.8c0-2.2-1.4-3.5-3.9-3.5-2 0-3.6.8-4.9 2l-2.6-3.8c2-2 4.8-3.1 8-3.1 5.3 0 8.6 2.9 8.6 8v15.2h-5.2v-1zm0-4v-4.4l-3 .2c-2.9.2-4.2 1.4-4.2 3.2 0 1.8 1.1 2.9 3.1 2.9 1.7 0 3-.6 4.1-1.9z"
        fill="#232F3E"
      />
      {/* 'w' */}
      <path
        d="M50.5 33.2h-5.4l-4.9-17h5.5l2.6 11.3 2.7-11.3h5.1l2.7 11.3 2.7-11.3h5.4l-5 17h-5.6l-2.9-10.7-2.9 10.7z"
        fill="#232F3E"
      />
      {/* 's' */}
      <path
        d="M83.4 18.2c-1.4-1-3.2-1.5-5-1.5-2.2 0-3.6.9-3.6 2.2 0 1.3 1 2 3.3 2.5l3.1.8c4.4 1.1 6.5 3.1 6.5 6.4 0 4.1-3.5 6.5-8.6 6.5-3.1 0-5.9-1-8.1-2.7l2.8-4c1.7 1.3 3.5 2 5.4 2 2.3 0 3.7-.9 3.7-2.3 0-1.3-1.1-2-3.4-2.6l-3-.8c-4.2-1.1-6.3-3-6.3-6.2 0-4 3.4-6.2 7.9-6.2 2.7 0 5.3.8 7.3 2.2l-2 4.2z"
        fill="#232F3E"
      />
      {/* AWS Smile Curve */}
      <path
        d="M20.2 40.5c16.3 10.8 37.4 11.2 54.8 1.1"
        stroke="#FF9900"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      {/* Smile Arrow Head */}
      <path
        d="M81.5 37.2l-9.8 4.2 4.2-4.8-1.2-6.2 6.8 6.8z"
        fill="#FF9900"
      />
    </svg>
  );
}

// Authentic Official Microsoft Azure SVG Icon
function AzureIcon({ size = 44, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Microsoft Azure"
    >
      <defs>
        <linearGradient id="azure_svg_g1" x1="12" y1="84" x2="68" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#114A8B" />
          <stop offset="1" stopColor="#0669BC" />
        </linearGradient>
        <linearGradient id="azure_svg_g2" x1="39" y1="48" x2="84" y2="84" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0078D4" />
          <stop offset="0.9" stopColor="#5EA0EF" />
        </linearGradient>
        <linearGradient id="azure_svg_g3" x1="38" y1="12" x2="84" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0078D4" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <path
        d="M59.4 12H38.7c-2.4 0-4.6 1.4-5.6 3.6L12.5 60.5c-1.4 3 0.8 6.5 4.1 6.5h20.7c2.4 0 4.6-1.4 5.6-3.6l12.6-26.9L73 67h18.9L59.4 12z"
        fill="url(#azure_svg_g1)"
      />
      <path
        d="M37.3 67h38.2c2.4 0 4.5-1.4 5.5-3.6l10.5-22.4c1.4-3-0.8-6.5-4.1-6.5H66.8L37.3 67z"
        fill="url(#azure_svg_g2)"
      />
      <path
        d="M59.4 12H38.7c-2.4 0-4.6 1.4-5.6 3.6L20.6 42.1 48 58.7l15-28.8L59.4 12z"
        fill="url(#azure_svg_g3)"
        opacity="0.85"
      />
    </svg>
  );
}

export default function CloudProviderSelection({ onSelectProvider, onBack }) {
  const providers = [
    {
      id: 'aws-cloud',
      name: 'Amazon Web Services (AWS)',
      oneLiner: 'Scalable Enterprise Hyperscale Cloud Compute & EC2',
      logoType: 'aws',
      themeClass: 'aws-theme',
      badge: 'Hyperscale Cloud',
      exploreText: 'Explore AWS Plans'
    },
    {
      id: 'ctrls-cloud',
      name: 'CtrlS Cloud server',
      oneLiner: 'Tier-4 Datacenter High-Speed Enterprise Compute',
      logoType: 'ctrls',
      themeClass: 'ctrls-theme',
      badge: 'Tier-4 Kolkata',
      exploreText: 'Explore CtrlS Cloud'
    },
    {
      id: 'azure-cloud',
      name: 'Microsoft azure',
      oneLiner: 'Scalable Enterprise Hyperscale Cloud Instances',
      logoType: 'azure',
      themeClass: 'azure-theme',
      badge: 'Hyperscale Cloud',
      exploreText: 'Explore Azure Plans'
    }
  ];

  return (
    <div className="cloud-provider-selection-wrapper animate-fade-in">
      {/* ── Top Right Corner Back Section ────────────────── */}
      <div className="showcase-top-right-nav provider-top-nav">
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
      <div className="solutions-header-wrap">
        <h2 className="solutions-main-heading">Select Cloud Platform</h2>
        <p className="solutions-sub-heading">
          Choose a cloud infrastructure provider below to view tailored compute packs and enterprise pricing.
        </p>
      </div>

      {/* ── 3 Horizontal Selection Boxes ──────────────────── */}
      <div className="cloud-providers-3grid" role="region" aria-label="Cloud Provider Selection">
        {providers.map((p) => {
          return (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              className={`cloud-provider-box ${p.themeClass}`}
              onClick={() => onSelectProvider(p.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectProvider(p.id);
                }
              }}
              aria-label={`Select ${p.name}`}
            >
              {/* Decorative ambient background glow */}
              <div className={`card-ambient-glow ${p.id}-glow`} />

              {/* Centered Logo in the Middle */}
              <div className="solution-center-logo-box provider-logo-center">
                {p.logoType === 'aws' && (
                  <AwsIcon size={46} />
                )}
                {p.logoType === 'tally' && (
                  <img
                    src={tallyLogo}
                    alt="Tally on Cloud"
                    className="solution-center-logo-img"
                    loading="lazy"
                  />
                )}
                {p.logoType === 'ctrls' && (
                  <img
                    src={ctrlsLogo}
                    alt="CtrlS Cloud Server"
                    className="solution-center-logo-img ctrls-logo-contain"
                    loading="lazy"
                  />
                )}
                {p.logoType === 'azure' && (
                  <AzureIcon size={46} />
                )}
              </div>

              {/* Heading & One Line Text */}
              <div className="solution-center-info">
                <span className="provider-badge-pill">{p.badge}</span>
                <h3 className="solution-title provider-title">{p.name}</h3>
                <p className="solution-one-line-desc">
                  {p.oneLiner}
                </p>
              </div>

              {/* Action Link */}
              <div className="solution-explore-row">
                <span className="solution-explore-btn provider-explore-btn">
                  <span>{p.exploreText}</span>
                  <ArrowRight size={16} className="btn-arrow-icon" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
