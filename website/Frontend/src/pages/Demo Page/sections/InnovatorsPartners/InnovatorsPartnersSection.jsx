import React from 'react';
import cultureCollageImg from '../../../../assets/homepage-culture-collage.webp';

export default function InnovatorsPartnersSection() {
  return (
    <section className="demo-partners-section" id="innovators-partners">
      <div className="demo-partners-container">
        {/* Left Column: Rich Photo Collage Graphic */}
        <div className="demo-collage-wrapper">
          <div className="demo-single-collage-frame">
            <img 
              src={cultureCollageImg} 
              alt="Net Infotech System team culture, employee reviews, and workplace excellence" 
              className="demo-single-collage-img" 
              width="1395"
              height="1127"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        {/* Right Column: Editorial & Narrative Typography */}
        <div className="demo-partners-content">
          <h2 className="demo-partners-title">
            Technology That Moves Business Forward.
          </h2>

          <div className="demo-partners-accent-line" aria-hidden="true" />

          <h3 className="demo-partners-subtitle">
            Your Partner in Digital Growth & IT Excellence
          </h3>

          <div className="demo-partners-body">
            <p>
              At Net Infotech System Pvt. Ltd., we connect technology with business
              needs to build smarter, more secure, and future-ready organizations.
              From business automation and enterprise software to IT infrastructure,
              cloud solutions, and cybersecurity, we deliver technology that creates
              measurable value.
            </p>

            <p>
              More than a technology provider, we are your long-term business partner.
              We understand your goals and challenges to deliver tailored solutions
              that streamline operations, strengthen security, improve productivity,
              and support sustainable business growth.
            </p>

            <p>
              We turn technological possibilities into practical business outcomes.
              Through intelligent automation, reliable IT infrastructure, and digital
              innovation, we help businesses simplify complexity, make smarter
              decisions, and confidently embrace the future.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
