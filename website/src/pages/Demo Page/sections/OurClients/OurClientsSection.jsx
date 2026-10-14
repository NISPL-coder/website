import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CLIENT_SHOWCASE_LOGOS } from './clientsData';

export default function OurClientsSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Divide the 16 clients into 2 balanced slides of 8 clients each
  const slide1 = CLIENT_SHOWCASE_LOGOS.slice(0, 8);
  const slide2 = CLIENT_SHOWCASE_LOGOS.slice(8, 16);
  const slides = [slide1, slide2];

  // Auto sliding every 4 seconds (pauses when hovering so user can click links)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
  };

  return (
    <section className="demo-our-clients-section" id="our-clients">
      <div className="demo-partners-box-wrapper">
        <div className="demo-section-unified-header">
          <h2 className="demo-unified-title">Our Clients, Your Trust</h2>
          <p className="demo-unified-subtitle">
            Trusted by Government Departments, Universities & Leading Enterprises Across India
          </p>
        </div>

        {/* Big Logos Enclosed Container with 2-Slide Auto Slider */}
        <div 
          className="demo-logo-showcase-box demo-clients-slider-box"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Slider Viewport */}
          <div className="demo-clients-slider-viewport">
            <div 
              className="demo-clients-slider-track"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
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

          {/* Slider Pagination Controls: Nav Buttons + Dots */}
          <div className="demo-clients-slider-controls">
            <button 
              type="button" 
              className="demo-clients-nav-arrow prev" 
              onClick={handlePrev}
              aria-label="Previous client slide"
            >
              <ChevronLeft size={18} />
            </button>

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
