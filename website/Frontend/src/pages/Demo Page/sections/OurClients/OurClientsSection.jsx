import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CLIENT_SHOWCASE_LOGOS } from './clientsData';

export default function OurClientsSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const currentDragX = useRef(0);
  const isHorizontalSwipe = useRef(null);
  const didSwipeRef = useRef(false);

  // Divide the 16 clients into 2 balanced slides of 8 clients each
  const slide1 = CLIENT_SHOWCASE_LOGOS.slice(0, 8);
  const slide2 = CLIENT_SHOWCASE_LOGOS.slice(8, 16);
  const slides = [slide1, slide2];

  // Auto sliding every 4.5 seconds (pauses when touching or hovering)
  useEffect(() => {
    if (isPaused || isDragging) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, isDragging]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  /* ─────────────────────────────────────────────────────────────
     Touch Gestures (Finger sliding for mobile and tablets)
     ───────────────────────────────────────────────────────────── */
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    currentDragX.current = 0;
    isHorizontalSwipe.current = null;
    didSwipeRef.current = false;
    setIsPaused(true);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    // Detect initial gesture direction
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    // Only drag horizontally if user is swiping sideways
    if (isHorizontalSwipe.current) {
      didSwipeRef.current = Math.abs(deltaX) > 8;
      currentDragX.current = deltaX;
      setIsDragging(true);
      setDragOffset(deltaX);
    }
  };

  const handleTouchEnd = () => {
    if (isHorizontalSwipe.current && didSwipeRef.current) {
      const deltaX = currentDragX.current;
      const threshold = 35; // 35px threshold for intuitive finger swipe

      if (deltaX < -threshold) {
        handleNext();
      } else if (deltaX > threshold) {
        handlePrev();
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    currentDragX.current = 0;
    isHorizontalSwipe.current = null;

    // Maintain didSwipeRef briefly to prevent click handler on client links
    setTimeout(() => {
      didSwipeRef.current = false;
      setIsPaused(false);
    }, 120);
  };

  /* ─────────────────────────────────────────────────────────────
     Mouse Drag Gestures (For browser emulator & desktop swipe)
     ───────────────────────────────────────────────────────────── */
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only primary button
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
    currentDragX.current = 0;
    isHorizontalSwipe.current = true;
    didSwipeRef.current = false;
    setIsDragging(true);
    setIsPaused(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - touchStartX.current;
    if (Math.abs(deltaX) > 6) {
      didSwipeRef.current = true;
    }
    currentDragX.current = deltaX;
    setDragOffset(deltaX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    const deltaX = currentDragX.current;
    const threshold = 35;

    if (deltaX < -threshold) {
      handleNext();
    } else if (deltaX > threshold) {
      handlePrev();
    }

    setIsDragging(false);
    setDragOffset(0);
    currentDragX.current = 0;

    setTimeout(() => {
      didSwipeRef.current = false;
      setIsPaused(false);
    }, 120);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
    setIsPaused(false);
  };

  // Prevent link navigation if the user was swiping with their finger
  const handleClickCapture = (e) => {
    if (didSwipeRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section className="demo-our-clients-section" id="our-clients">
      <div className="demo-partners-box-wrapper">
        <div className="demo-section-unified-header">
          <h2 className="demo-unified-title">Our Clients, Your Trust</h2>
          <p className="demo-unified-subtitle">
            Trusted by Government Departments, Universities &amp; Leading Enterprises Across India
          </p>
        </div>

        {/* Big Logos Enclosed Container with Finger Touch & Auto Slider */}
        <div 
          className="demo-logo-showcase-box demo-clients-slider-box"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={handleMouseLeave}
        >
          {/* Slider Viewport with Touch/Pointer Listeners */}
          <div 
            className={`demo-clients-slider-viewport ${isDragging ? 'is-dragging' : ''}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClickCapture={handleClickCapture}
          >
            <div 
              className="demo-clients-slider-track"
              style={{ 
                transform: isDragging 
                  ? `translateX(calc(-${currentSlide * 100}% + ${dragOffset}px))`
                  : `translateX(-${currentSlide * 100}%)`,
                transition: isDragging ? 'none' : 'transform 0.55s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
            >
              {slides.map((slideClients, sIdx) => (
                <div key={sIdx} className="demo-clients-slide">
                  <div className="demo-clients-grid-4x2">
                    {slideClients.map((client) => (
                      <div key={client.id} className="demo-logo-outer-cell">
                        {client.render()}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slider Pagination Controls: Nav Buttons + Interactive Dots */}
          <div className="demo-clients-slider-controls">
            <button 
              type="button" 
              className="demo-clients-nav-arrow prev" 
              onClick={handlePrev}
              aria-label="Previous client slide"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Pagination Dots for Mobile/Desktop Touch */}
            <div className="demo-clients-dots">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`demo-clients-dot ${currentSlide === idx ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button 
              type="button" 
              className="demo-clients-nav-arrow next" 
              onClick={handleNext}
              aria-label="Next client slide"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
