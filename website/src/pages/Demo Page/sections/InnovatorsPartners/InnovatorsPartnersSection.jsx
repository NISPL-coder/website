import React from 'react';
import { Sparkles, Quote, Star } from 'lucide-react';
import teamHandshakeImg from '../../../../assets/corporate_team_handshake.jpg';
import engineersImg from '../../../../assets/office_engineers_collaborating.jpg';

export default function InnovatorsPartnersSection() {
  return (
    <section className="demo-partners-section" id="innovators-partners">
      <div className="demo-partners-container">
        {/* Left Column: Rich Photo Collage with Floating Testimonial Badges */}
        <div className="demo-collage-wrapper">
          <div className="demo-collage-grid">
            {/* Primary Image: Team Handshake & Partnership */}
            <div className="demo-img-frame demo-img-primary-frame">
              <img 
                src={teamHandshakeImg} 
                alt="Net Infotech System team celebrating corporate success" 
                className="demo-collage-img" 
                loading="lazy"
              />
            </div>

            {/* Secondary Image: Engineers in Tech Workspace */}
            <div className="demo-img-frame demo-img-secondary-frame">
              <img 
                src={engineersImg} 
                alt="Modern engineers collaborating on cloud solutions" 
                className="demo-collage-img" 
                loading="lazy"
              />
            </div>
          </div>

          {/* Floating Element 1: Top-Left Orange Badge */}
          <div className="demo-floating-badge demo-badge-orange">
            <span>Great place</span>
            <span>with work</span>
          </div>

          {/* Floating Element 2: Top-Right Client Quotes Card */}
          <div className="demo-floating-card demo-card-testimonials">
            <div className="demo-card-quote-item">
              <div className="demo-quote-icon-badge demo-quote-icon-teal">
                <Sparkles size={14} />
              </div>
              <p className="demo-quote-text">
                They deliver exactly what I am looking for...
              </p>
            </div>
            <div className="demo-card-quote-divider" />
            <div className="demo-card-quote-item">
              <div className="demo-quote-icon-badge demo-quote-icon-orange">
                <Quote size={13} />
              </div>
              <p className="demo-quote-text">
                Net Infotech System is able to translate complicated requirements into efficient and secure solutions...
              </p>
            </div>
          </div>

          {/* Floating Element 3: Bottom-Left Employee / Client Rating Card */}
          <div className="demo-floating-card demo-card-ratings">
            <div className="demo-rating-item">
              <div className="demo-stars-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="demo-star-icon" fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="demo-rating-review">
                Net Infotech System is an incredible place to work!
              </p>
              <span className="demo-rating-author">Kunal P (PM)</span>
            </div>

            <div className="demo-card-rating-divider" />

            <div className="demo-rating-item">
              <div className="demo-stars-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="demo-star-icon" fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="demo-rating-review">
                One of the best IT solution teams in Kolkata.
              </p>
              <span className="demo-rating-author">Avijit M (Tech Lead)</span>
            </div>
          </div>

          {/* Floating Element 4: Bottom-Right Cyan Badge */}
          <div className="demo-floating-badge demo-badge-cyan">
            <span>Great place</span>
            <span>to work</span>
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
