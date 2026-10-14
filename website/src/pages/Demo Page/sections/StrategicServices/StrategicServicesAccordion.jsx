import React, { useState } from 'react';
import { Plus, X, ArrowUpRight } from 'lucide-react';
import { SERVICES_ACCORDION } from './servicesData';

export default function StrategicServicesAccordion({ onOpenConsultation }) {
  const [activeServiceIndex, setActiveServiceIndex] = useState(null); // All sections closed by default

  return (
    <section className="demo-services-section" id="strategic-services">
      <div className="demo-section-unified-header demo-services-header">
        <h2 className="demo-unified-title demo-services-title">
          Industries we serve
        </h2>
        <p className="demo-unified-subtitle demo-services-subtitle">
          Explore the wide range of industries that rely on our cutting-edge solutions.
        </p>
      </div>

      {/* Horizontal Slit / Accordion Card Slider */}
      <div className="demo-accordion-wrapper">
        <div className="demo-accordion-container">
          {SERVICES_ACCORDION.map((service, index) => {
            const isActive = activeServiceIndex === index;
            const hasActiveCard = activeServiceIndex !== null;
            const cardClass = isActive 
              ? 'active' 
              : hasActiveCard 
                ? 'collapsed' 
                : 'default-closed';

            return (
              <div 
                key={service.id}
                className={`demo-accordion-card ${cardClass}`}
                onClick={() => setActiveServiceIndex(isActive ? null : index)}
                role="button"
                tabIndex={0}
                aria-expanded={isActive}
              >
                {/* Service Digital Information Background Image */}
                <div className="demo-card-bg-wrap">
                  <img 
                    src={service.bgImage || service.image} 
                    alt={service.mainHeading} 
                    className="demo-card-bg-img" 
                    loading="lazy"
                  />
                  <div className="demo-card-bg-overlay" />
                </div>

                {/* Vertical Spine: Visible when collapsed or all closed */}
                <div className="demo-card-vertical-spine">
                  <span className="demo-card-vertical-title">{service.tabTitle}</span>
                  <div className="demo-spine-bottom-indicator">
                    <Plus size={16} />
                  </div>
                </div>

                {/* Expanded View: Two-Column Split (Left: Content Panel, Right: Dedicated Service Image Showcase) */}
                <div className="demo-card-expanded-content">
                  {/* Left Column: Concise, Clean, Professional Content Panel */}
                  <div 
                    className="demo-card-content-panel"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Top Meta Bar with Category Tag & Close Button */}
                    <div className="demo-card-top-meta">
                      <button 
                        type="button" 
                        className="demo-card-close-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveServiceIndex(null);
                        }}
                        aria-label="Close section"
                        title="Close section"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    {/* Clean Professional Editorial Headings */}
                    <div className="demo-card-heading-group">
                      <h3 className="demo-card-main-heading">{service.mainHeading}</h3>
                      <h4 className="demo-card-headline">{service.headline}</h4>
                    </div>

                    {/* Professional Description */}
                    <div className="demo-card-brief-overview">
                      <p className="demo-card-overview-text">
                        {service.description}
                      </p>
                    </div>

                    {/* Action Consultation Button */}
                    <div className="demo-card-panel-footer">
                      <button 
                        type="button" 
                        className="demo-card-cta-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenConsultation) onOpenConsultation();
                        }}
                      >
                        <span>{service.ctaText || 'Consult Solution Specialist'}</span>
                        <ArrowUpRight size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Dedicated Service Image Showcase */}
                  <div 
                    className="demo-card-image-showcase"
                    style={{ background: service.showcaseBg || '#050a14' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div 
                      className="demo-showcase-frame"
                      style={{ background: service.showcaseBg || '#050a14' }}
                    >
                      <img 
                        src={service.image} 
                        alt={service.mainHeading} 
                        className={`demo-showcase-img ${service.imgFit === 'contain' ? 'fit-contain' : 'fit-cover'}`}
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
