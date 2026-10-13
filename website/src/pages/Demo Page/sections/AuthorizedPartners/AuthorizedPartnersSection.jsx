import React from 'react';
import { AUTHORIZED_PARTNERS } from './partnersData';

export default function AuthorizedPartnersSection() {
  return (
    <section className="demo-trusted-partners-section" id="authorized-partners">
      <div className="demo-partners-box-wrapper">
        <div className="demo-section-unified-header">
          <h2 className="demo-unified-title">Authorized Partners</h2>
          <p className="demo-unified-subtitle">
            Certified Enterprise Technology Alliances & Global Cloud Ecosystem Partners
          </p>
        </div>

        {/* Big Logos Enclosed Container matching reference image */}
        <div className="demo-logo-showcase-box">
          <div className="demo-logos-row-grid demo-partners-row-grid">
            {AUTHORIZED_PARTNERS.map((partner) => (
              <div key={partner.id} className="demo-logo-outer-cell">
                {partner.render()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
