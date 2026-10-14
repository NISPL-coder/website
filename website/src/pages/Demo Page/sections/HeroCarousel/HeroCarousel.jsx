import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroVideo from '../../../../assets/gemini_generated_video_08caffc0.webm';
import { SLIDES } from './carouselData';

export default function HeroCarousel({ onOpenContact, onOpenConsultation }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // Auto-slide effect (cycles every 6.5s unless hovered)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6500);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Ensure background video plays automatically
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn('Autoplay prevented on video:', err);
      });
    }
  }, []);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleCtaClick = () => {
    navigate('/contact');
  };

  const slide = SLIDES[currentSlide];

  return (
    <section 
      className="demo-hero-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Video (gemini_generated_video_61d17737.mp4) */}
      <div className="demo-video-container">
        <video
          ref={videoRef}
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="demo-bg-video"
          aria-label="Net Infotech System Background Showcase"
        >
          <track kind="captions" srcLang="en" label="English captions" default />
        </video>
        {/* Meticulous gradient contrast overlays matching reference image */}
        <div className="demo-video-overlay-gradient" />
        <div className="demo-video-grid-pattern" />
      </div>

      {/* Hero Content Area */}
      <div className="demo-hero-inner">
        <div className="demo-hero-content-box" key={slide.id}>
          {/* Orange Tagline Eyebrow */}
          <span className="demo-hero-eyebrow">
            {slide.eyebrow}
          </span>

          {/* Bold White Headline */}
          <h1 className="demo-hero-headline">
            <span className="headline-line">{slide.line1}</span>
            <span className="headline-line">{slide.line2}</span>
          </h1>

          {/* Subtitle Description */}
          <p className="demo-hero-subtitle">
            {slide.subtitle}
          </p>

          {/* Outline Consultation CTA Button with Circle Arrow */}
          <button 
            type="button"
            className="demo-hero-cta-btn"
            onClick={handleCtaClick}
          >
            <span>{slide.ctaText}</span>
            <div className="demo-cta-arrow-circle" aria-hidden="true">
              <ArrowUpRight size={15} />
            </div>
          </button>
        </div>
      </div>

      {/* Carousel Indicators & Controls */}
      <div className="demo-carousel-controls">
        {/* Indicator Bars */}
        <div className="demo-carousel-indicators" role="tablist" aria-label="Slide Selection">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              className={`demo-indicator-bar ${currentSlide === idx ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              aria-selected={currentSlide === idx}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="demo-carousel-arrows">
          <button 
            type="button" 
            className="demo-arrow-btn" 
            onClick={handlePrevSlide}
            aria-label="Previous Slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            type="button" 
            className="demo-arrow-btn" 
            onClick={handleNextSlide}
            aria-label="Next Slide"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
