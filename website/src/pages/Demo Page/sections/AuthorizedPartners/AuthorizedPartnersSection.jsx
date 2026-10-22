import React from 'react';
import { DIRECT_PARTNERS, AUTHORIZED_PARTNERS } from './partnersData';

export default function AuthorizedPartnersSection() {
  return (
    <section className="demo-trusted-partners-section" id="authorized-partners">
      <div className="demo-partners-box-wrapper">
        {/* Unified Section Header */}
        <div className="demo-section-unified-header">
          <h2 className="demo-unified-title">Partners & Strategic Alliances</h2>
          <p className="demo-unified-subtitle">
            Direct Technology Partnerships & Certified Enterprise Hardware Ecosystem
          </p>
        </div>

        {/* 1. Direct Partners Sub-Section */}
        <div className="demo-partner-category-group">
          <div className="demo-partner-category-header">
            <div className="demo-partner-category-pill demo-pill-direct">
              {/* <span className="demo-pill-dot demo-dot-direct"></span> */}
              Direct Partners
            </div>
            {/* <p className="demo-partner-category-desc">
              Direct Tier-1 enterprise collaboration for cloud datacenter infrastructure & business ERP systems
            </p> */}
          </div>

          <div className="demo-logo-showcase-box demo-direct-partners-box">
            <div className="demo-logos-row-grid demo-direct-partners-grid">
              {DIRECT_PARTNERS.map((partner) => (
                <div key={partner.id} className="demo-logo-outer-cell">
                  {partner.render()}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Authorized Partners Sub-Section */}
        <div className="demo-partner-category-group">
          <div className="demo-partner-category-header">
            <div className="demo-partner-category-pill demo-pill-authorized">
              {/* <span className="demo-pill-dot demo-dot-authorized"></span> */}
              Authorized Partners
            </div>
            {/* <p className="demo-partner-category-desc">
              Authorized enterprise computing, networking, and imaging technology solutions
            </p> */}
          </div>

          <div className="demo-logo-showcase-box demo-authorized-partners-box">
            <div className="demo-logos-row-grid demo-authorized-partners-grid">
              {AUTHORIZED_PARTNERS.map((partner) => (
                <div key={partner.id} className="demo-logo-outer-cell">
                  {partner.render()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
