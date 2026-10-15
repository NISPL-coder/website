import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { REAL_POSITIVE_REVIEWS } from '../services/realGoogleReviews';
import './TestimonialsSection.css';

export default function TestimonialsSection() {
  const [isPaused, setIsPaused] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  const displayList = REAL_POSITIVE_REVIEWS;
  const listLen = displayList.length;

  // Initial index set to listLen so there are cards to the left and right in the extended list
  const [currentIndex, setCurrentIndex] = useState(listLen > 0 ? listLen : 0);

  // Sync index to middle segment whenever dynamic reviews are loaded
  useEffect(() => {
    if (listLen > 0) {
      setCurrentIndex(listLen);
    }
  }, [listLen]);

  // Triple the list for seamless infinite circular sliding
  const extendedList = listLen > 0 ? [...displayList, ...displayList, ...displayList] : [];

  // Active original item index for pagination dashes
  const activeOriginalIndex = listLen > 0 ? (currentIndex % listLen) : 0;

  // Auto-scroll horizontally every 7.5 seconds when not hovered (gives ample time to read)
  useEffect(() => {
    if (isPaused || listLen <= 1) return;

    const interval = setInterval(() => {
      setTransitionEnabled(true);
      setCurrentIndex((prev) => prev + 1);
    }, 7500);

    return () => clearInterval(interval);
  }, [isPaused, listLen, currentIndex]);

  // Handle seamless infinite wrap without visual jump
  useEffect(() => {
    if (listLen <= 0) return;

    if (currentIndex >= listLen * 2) {
      const timer = setTimeout(() => {
        setTransitionEnabled(false);
        setCurrentIndex((prev) => prev - listLen);
      }, 750);

      return () => clearTimeout(timer);
    }

    if (currentIndex < listLen) {
      const timer = setTimeout(() => {
        setTransitionEnabled(false);
        setCurrentIndex((prev) => prev + listLen);
      }, 750);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, listLen]);

  // Re-enable CSS transition after instantaneous position reset
  useEffect(() => {
    if (!transitionEnabled) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitionEnabled(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [transitionEnabled]);

  const handlePrev = () => {
    setTransitionEnabled(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    setTransitionEnabled(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleDotClick = (targetOriginalIndex) => {
    setTransitionEnabled(true);
    const currentBase = Math.floor(currentIndex / listLen) * listLen;
    setCurrentIndex(currentBase + targetOriginalIndex);
  };

  return (
    <section className="cyber-testimonials-section" id="testimonials">
      <div className="cyber-testimonials-container">

        {/* Unified Section Header (Matching Authorized Partners) */}
        <div className="demo-section-unified-header">
          <h2 className="demo-unified-title">Testimonials</h2>
          <p className="demo-unified-subtitle">
            Client Feedbacks &amp; Google Reviews
          </p>
        </div>

        {displayList.length > 0 ? (
          <>
            {/* Horizontal Auto-Moving Carousel Box (pauses on hover) */}
            <div
              className="cyber-testimonials-carousel-box"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Previous Arrow Button */}
              <button
                type="button"
                className="cyber-slider-arrow-btn cyber-arrow-prev"
                onClick={handlePrev}
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={22} />
              </button>

              {/* Viewport Window */}
              <div className="cyber-testimonials-viewport">
                <div
                  className={`cyber-testimonials-track ${transitionEnabled ? 'with-transition' : ''}`}
                  style={{
                    '--current-idx': currentIndex
                  }}
                >
                  {extendedList.map((item, index) => {
                    const isCenter = index === currentIndex;

                    return (
                      <div
                        key={`${item.id}-${index}`}
                        className={`cyber-testimonial-slide ${isCenter ? 'is-active' : ''}`}
                        onClick={() => {
                          setTransitionEnabled(true);
                          setCurrentIndex(index);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setTransitionEnabled(true);
                            setCurrentIndex(index);
                          }
                        }}
                      >
                        {/* Quote Bubble */}
                        <div className={`cyber-testimonial-bubble ${isCenter ? 'bubble-active' : ''}`}>
                          {/* Rating Stars Inside Card */}
                          <div className="cyber-card-stars">
                            {[...Array(item.rating || 5)].map((_, i) => (
                              <Star key={i} size={14} fill="#F59E0B" stroke="#F59E0B" />
                            ))}
                            {item.date && (
                              <span className={`cyber-card-date ${isCenter ? 'date-white' : ''}`}>
                                • {item.date}
                              </span>
                            )}
                          </div>

                          {/* Service Tag */}
                          {item.service && (
                            <span className={`cyber-card-service-pill ${isCenter ? 'service-pill-active' : ''}`}>
                              {item.service}
                            </span>
                          )}

                          <p className="cyber-testimonial-quote">"{item.review}"</p>
                        </div>

                        {/* Circular Avatar overlapping bottom edge of bubble */}
                        <div className="cyber-testimonial-avatar-wrapper">
                          {item.avatar ? (
                            <img
                              src={item.avatar}
                              alt={item.author}
                              className="cyber-testimonial-avatar"
                              width="76"
                              height="76"
                              loading="lazy"
                            />
                          ) : (
                            <div
                              className="cyber-testimonial-avatar cyber-letter-avatar"
                              style={{ backgroundColor: item.avatarBg || '#E65100' }}
                            >
                              {item.initials || (item.author ? item.author.charAt(0).toUpperCase() : 'G')}
                            </div>
                          )}

                          {/* Mini Google Verified Icon Badge on Avatar */}
                          <div className="cyber-avatar-google-badge" title="Verified Google Review">
                            <svg viewBox="0 0 24 24" width="11" height="11">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                          </div>
                        </div>

                        {/* Author Information */}
                        <div className="cyber-testimonial-info">
                          <h3 className="cyber-testimonial-name">{item.author}</h3>
                          <p className="cyber-testimonial-role">{item.role || 'Google Verified Reviewer'}</p>
                          <p className="cyber-testimonial-company">
                            <CheckCircle2 size={12} color="#059669" /> Google Review
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next Arrow Button */}
              <button
                type="button"
                className="cyber-slider-arrow-btn cyber-arrow-next"
                onClick={handleNext}
                aria-label="Next testimonial"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Pagination Dashes */}
            <div className="cyber-testimonials-pagination" role="tablist" aria-label="Review pagination">
              {displayList.map((item, dotIndex) => (
                <button
                  key={`dot-${item.id}-${dotIndex}`}
                  type="button"
                  className={`cyber-pagination-dash ${dotIndex === activeOriginalIndex ? 'active' : ''}`}
                  onClick={() => handleDotClick(dotIndex)}
                  aria-label={`Go to review ${dotIndex + 1}`}
                  aria-selected={dotIndex === activeOriginalIndex}
                  role="tab"
                />
              ))}
            </div>
          </>
        ) : null}

      </div>
    </section>
  );
}
