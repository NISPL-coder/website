import React from 'react';
import { ArrowRight, Cloud, ShieldCheck, Zap, Headphones } from 'lucide-react';
import tallyLogo from '../../../assets/partners/tally.png';

export default function SolutionCategorySelection({ onSelectCategory }) {
  return (
    <div className="solutions-selection-container animate-fade-in">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="solutions-header-wrap">
        <h2 className="solutions-main-heading">Explore Our Solutions</h2>
        <p className="solutions-sub-heading">
          Select a solution category below to browse verified software licenses and cloud infrastructure.
        </p>
      </div>

      {/* ── Two Large Horizontal Selection Cards ──────────────── */}
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
            <h3 className="solution-title tally-title">Tally Prime & Customization</h3>
            <p className="solution-one-line-desc">
              Accounting & Business Management Solutions
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
              Cloud Hosting & Remote Business Solutions
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
