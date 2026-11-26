import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { SERVICES_ACCORDION } from './servicesData';

const AUTOPLAY_MS = 6000;

export default function StrategicServicesAccordion({ onOpenConsultation }) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState('next');
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);
  const total = SERVICES_ACCORDION.length;

  const goTo = useCallback(
    (idx, dir) => {
      if (animating) return;
      setDirection(dir || (idx > active ? 'next' : 'prev'));
      setAnimating(true);
      setActive(idx);
      setTimeout(() => setAnimating(false), 520);
    },
    [active, animating],
  );

  const next = useCallback(() => goTo((active + 1) % total, 'next'), [active, total, goTo]);
  const prev = useCallback(() => goTo((active - 1 + total) % total, 'prev'), [active, total, goTo]);

  // Autoplay
  useEffect(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timerRef.current);
  }, [next]);

  // Pause on hover
  const pause = () => clearInterval(timerRef.current);
  const resume = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, AUTOPLAY_MS);
  };

  const service = SERVICES_ACCORDION[active];
  const ActiveIcon = service.icon;
  const focusItems = service.focus?.split(',').map((s) => s.trim()).filter(Boolean) || [];
  const badgeItems = service.badge?.split('•').map((s) => s.trim()).filter(Boolean) || [];

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

      {/* Cinematic Stage */}
      <div
        className="ind-stage"
        onMouseEnter={pause}
        onMouseLeave={resume}
      >
        {/* Animated Gradient Border Frame */}
        <div className="ind-stage-border" aria-hidden="true" />

        <div className="ind-stage-inner">
          {/* Hero Visual + Content */}
          <div
            key={service.id}
            className={`ind-hero ind-slide-${direction}`}
          >
            {/* Left — Full Visual with Ambient Glow */}
            <div className="ind-hero-visual">
              <div className="ind-hero-visual-glow" aria-hidden="true" />
              <div
                className="ind-hero-visual-bg"
                style={{ background: service.showcaseBg || '#050a14' }}
              >
                <img
                  src={service.image}
                  alt={service.mainHeading}
                  className="ind-hero-img"
                />
              </div>
            </div>

            {/* Right — Content Panel */}
            <div className="ind-hero-content">
              {/* Top Meta Row */}
              <div className="ind-hero-meta">
              </div>

              {/* Headings */}
              <div className="ind-hero-headings">
                <h3 className="ind-hero-title">{service.mainHeading}</h3>
                <p className="ind-hero-headline">{service.headline}</p>
              </div>

              {/* Description */}
              <p className="ind-hero-desc">{service.description}</p>

              {/* Capability Chips */}
              {focusItems.length > 0 && (
                <div className="ind-hero-caps">
                  <span className="ind-hero-caps-label">Core Capabilities</span>
                  <div className="ind-hero-caps-row">
                    {focusItems.map((item) => (
                      <span key={item} className="ind-hero-cap">{item}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                type="button"
                className="ind-hero-cta"
                onClick={() => { if (onOpenConsultation) onOpenConsultation(); }}
              >
                <span>{service.ctaText || 'Consult Solution Specialist'}</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="ind-progress-track" aria-hidden="true">
            <div
              className="ind-progress-fill"
              key={`progress-${active}`}
              style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
            />
          </div>
        </div>

        {/* Thumbnail Navigation Strip */}
        <div className="ind-thumbs" role="tablist" aria-label="Solutions">
          {SERVICES_ACCORDION.map((svc, i) => {
            const Icon = svc.icon;
            const isActive = i === active;
            return (
              <button
                key={svc.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`ind-thumb ${isActive ? 'is-active' : ''}`}
                onClick={() => goTo(i)}
              >
                <div
                  className="ind-thumb-preview"
                  style={{ background: svc.showcaseBg || '#050a14' }}
                >
                  <img src={svc.image} alt="" className="ind-thumb-img" loading="lazy" />
                  {isActive && <div className="ind-thumb-glow" aria-hidden="true" />}
                </div>
                <div className="ind-thumb-info">
                  <span className="ind-thumb-icon"><Icon size={14} /></span>
                  <span className="ind-thumb-label">{svc.tabTitle}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
