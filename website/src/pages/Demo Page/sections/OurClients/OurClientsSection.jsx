import React from 'react';
import { CLIENT_SHOWCASE_LOGOS } from './clientsData';

export default function OurClientsSection() {
  return (
    <section className="demo-our-clients-section" id="our-clients">
      <div className="demo-partners-box-wrapper">
        <div className="demo-section-unified-header">
          <h2 className="demo-unified-title">Our Clients, Your Trust</h2>
          <p className="demo-unified-subtitle">
            Trusted by Government Departments, Universities & Leading Enterprises Across India
          </p>
        </div>

        {/* Big Logos Enclosed Container matching reference image */}
        <div className="demo-logo-showcase-box">
          <div className="demo-clients-row-grid">
            {CLIENT_SHOWCASE_LOGOS.map((client) => (
              <div key={client.id} className="demo-logo-outer-cell">
                {client.render()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
