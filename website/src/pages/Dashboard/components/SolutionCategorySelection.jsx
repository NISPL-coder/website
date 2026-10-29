import React from 'react';
import { ArrowRight, Cloud, ShieldCheck } from 'lucide-react';
import tallyLogo from '../../../assets/partners/tally.png';

export default function SolutionCategorySelection({ onSelectCategory }) {
  return (
    <div className="flowmail-section-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* ── Top Header Banner (FlowMail Style) ────────────────── */}
      <section className="flowmail-welcome-banner">
        <div className="flowmail-welcome-text">
          <h2 className="flowmail-welcome-title">Explore Our Solutions</h2>
          <p className="flowmail-welcome-sub">
            Select a solution category below to browse verified software licenses and cloud infrastructure.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="flowmail-trend-pill positive" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
            <ShieldCheck size={14} />
            <span>Certified Solutions &amp; Cloud</span>
          </span>
        </div>
      </section>

      {/* ── Two Large Selection Boxes (50% each on Desktop) ────── */}
      <div className="solutions-cards-grid" role="region" aria-label="Solution Selection">
        {/* CARD 1: TALLY */}
        <div
          role="button"
          tabIndex={0}
          className="solution-hero-card tally-theme"
          onClick={() => onSelectCategory('tally')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectCategory('tally');
            }
          }}
          aria-label="Explore Tally Accounting & Business Management Solutions"
        >
          {/* Decorative ambient background glow */}
          <div className="card-ambient-glow tally-glow" />

          {/* Centered Logo in the Middle */}
          <div className="solution-center-logo-box tally-logo-center">
            <img
              src={tallyLogo}
              alt="Tally"
              className="solution-center-logo-img"
              loading="lazy"
            />
          </div>

          {/* Heading & One Line Text */}
          <div className="solution-center-info">
            <h3 className="solution-title tally-title">Tally Prime &amp; Customization</h3>
            <p className="solution-one-line-desc">
              Accounting &amp; Business Management Solutions
            </p>
          </div>

          {/* Action Link */}
          <div className="solution-explore-row">
            <span className="solution-explore-btn tally-btn">
              <span>Explore Tally Prime</span>
              <ArrowRight size={16} className="btn-arrow-icon" />
            </span>
          </div>
        </div>

        {/* CARD 2: CLOUD */}
        <div
          role="button"
          tabIndex={0}
          className="solution-hero-card cloud-theme"
          onClick={() => onSelectCategory('cloud')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectCategory('cloud');
            }
          }}
          aria-label="Explore Cloud Hosting & Remote Business Solutions"
        >
          {/* Decorative ambient background glow */}
          <div className="card-ambient-glow cloud-glow" />

          {/* Centered Logo in the Middle */}
          <div className="solution-center-logo-box cloud-logo-center">
            <div className="cloud-center-icon-badge">
              <Cloud size={46} strokeWidth={1.8} className="cloud-center-icon" />
            </div>
          </div>

          {/* Heading & One Line Text */}
          <div className="solution-center-info">
            <h3 className="solution-title cloud-title">Cloud</h3>
            <p className="solution-one-line-desc">
              Cloud Hosting &amp; Remote Business Solutions
            </p>
          </div>

          {/* Action Link */}
          <div className="solution-explore-row">
            <span className="solution-explore-btn cloud-btn">
              <span>Explore Cloud</span>
              <ArrowRight size={16} className="btn-arrow-icon" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
