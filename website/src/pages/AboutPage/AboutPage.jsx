import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Users,
  Award,
  Heart,
  ArrowRight,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  Briefcase
} from 'lucide-react';
import Navbar from '../Demo Page/sections/Navbar/Navbar';
import Footer from '../../components/Footer';
import { WORK_CULTURE_STORIES, CULTURE_PILLARS } from './workCultureData';
import './AboutPage.css';

const ICON_MAP = {
  Sparkles: Sparkles,
  Users: Users,
  Award: Award,
  Heart: Heart
};

export default function AboutPage({ onOpenContact, onOpenConsultation }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Filtered stories based on tab
  const displayedStories =
    activeCategory === 'all'
      ? WORK_CULTURE_STORIES
      : WORK_CULTURE_STORIES.filter((item) => item.category === activeCategory);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev + 1) % displayedStories.length);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev - 1 + displayedStories.length) % displayedStories.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, displayedStories.length]);

  const activeLightboxItem =
    lightboxIndex !== null ? displayedStories[lightboxIndex] : null;

  return (
    <div className="about-page-root">
      {/* 1. Global Floating Pill Navbar */}
      <Navbar
        onOpenContact={onOpenContact}
        onOpenConsultation={onOpenConsultation}
      />

 

      {/* 4. WORK CULTURE SECTION (Alternating Zig-Zag Layout) */}
      <section id="work-culture" className="about-culture-section">
        <div className="about-container">
          {/* Section Header */}
          <div className="about-culture-header">
           
            <h2 className="about-section-heading">
              Inside Net Infotech System: Where Culture Fuels Innovation
            </h2>
            <p className="about-section-desc">
              Experience the genuine heartbeat of our organization — from daily collaborative
              problem-solving to leadership keynotes, industry awards, and cherished festive traditions.
            </p>
          </div>

         

          {/* Alternating Zig-Zag List */}
          <div className="about-culture-list">
            {displayedStories.map((story, index) => {
              // Alternating Layout:
              // Even index (0, 2, 4, 6, 8) -> Image on the LEFT, Text on the RIGHT
              // Odd index (1, 3, 5, 7, 9)  -> Image on the RIGHT, Text on the LEFT
              const isImageLeft = index % 2 === 0;
              const layoutClass = isImageLeft ? 'layout-image-left' : 'layout-image-right';

              return (
                <div
                  key={story.id}
                  className={`about-culture-item ${layoutClass}`}
                >
                  {/* Media Column (Image) */}
                  <div className="about-culture-media-col">
                    <div
                      className="about-culture-image-wrapper"
                      onClick={() => setLightboxIndex(index)}
                      title="Click to view full photo"
                    >
                      <img
                        src={story.image}
                        alt={story.imageAlt}
                        className="about-culture-img"
                        loading="lazy"
                      />
                      <div className="about-culture-overlay">
                        <span className="about-culture-caption-pill">
                          <Maximize2 size={13} />
                          <span>{story.caption}</span>
                        </span>
                      </div>
                      <div className="about-culture-zoom-indicator">
                        <Maximize2 size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Text Content Column */}
                  <div className="about-culture-text-col">
                    <h3 className="about-item-heading">{story.heading}</h3>

                    {story.quote && (
                      <div className="about-item-quote-box">
                        <p className="about-item-quote-text">"{story.quote}"</p>
                      </div>
                    )}

                    <p className="about-item-desc">{story.description}</p>

                    {/* Skill/Culture Pills */}
                    <div className="about-item-pills">
                      {story.pills.map((pill, pIdx) => (
                        <span key={pIdx} className="about-pill-chip">
                          <span className="dot" />
                          {pill}
                        </span>
                      ))}
                    </div>

                    {/* Mini Stats row */}
                    {story.stats && (
                      <div className="about-item-stats-row">
                        {story.stats.map((st, sIdx) => (
                          <div key={sIdx} className="about-item-mini-stat">
                            <span className="about-mini-stat-val">{st.value}</span>
                            <span className="about-mini-stat-label">{st.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. CTA Section: Join Our Team / Life at NISPL */}
      <section className="about-cta-section">
        <div className="about-container">
          <div className="about-cta-card">
            <div className="about-cta-badge">
              <Users size={14} />
              <span>Grow With Us</span>
            </div>

            <h2 className="about-cta-title">
              Ready to Shape the Future of Technology With Us?
            </h2>

            <p className="about-cta-desc">
              Whether you are an ambitious cloud engineer, software developer, enterprise consultant,
              or business leader — NISPL offers an empowering workspace where your craft is celebrated.
            </p>

            <div className="about-cta-actions">
              <Link to="/career" className="about-btn-primary">
                <span>Explore Open Careers</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="about-btn-secondary">
                <span>Connect With Our Team</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Lightbox Modal for High-Resolution Image Preview */}
      {activeLightboxItem && (
        <div
          className="about-lightbox-backdrop"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="about-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="about-lightbox-close-btn"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close Preview"
            >
              <X size={20} />
            </button>

            <div className="about-lightbox-image-stage">
              <button
                type="button"
                className="about-lightbox-nav-btn about-lightbox-prev"
                onClick={() =>
                  setLightboxIndex(
                    (prev) => (prev - 1 + displayedStories.length) % displayedStories.length
                  )
                }
                aria-label="Previous Image"
              >
                <ChevronLeft size={24} />
              </button>

              <img
                src={activeLightboxItem.image}
                alt={activeLightboxItem.imageAlt}
                className="about-lightbox-img"
              />

              <button
                type="button"
                className="about-lightbox-nav-btn about-lightbox-next"
                onClick={() =>
                  setLightboxIndex((prev) => (prev + 1) % displayedStories.length)
                }
                aria-label="Next Image"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <div className="about-lightbox-footer">
              <div>
                <h4 className="about-lightbox-caption">
                  {activeLightboxItem.heading}
                </h4>
                <p className="about-lightbox-sub">{activeLightboxItem.caption}</p>
              </div>
              <div className="about-lightbox-counter">
                {lightboxIndex + 1} / {displayedStories.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Comprehensive Official Footer */}
      <Footer />
    </div>
  );
}
