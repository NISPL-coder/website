import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ArrowRight,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Camera
} from 'lucide-react';
import Navbar from '../Demo Page/sections/Navbar/Navbar';
import Footer from '../../components/Footer';
import { GALLERY_CATEGORIES } from './workCultureData';
import './AboutPage.css';

export default function AboutPage({ onOpenContact, onOpenConsultation }) {
  // Category filter: 'all' or category ID
  const [activeCategory, setActiveCategory] = useState('all');

  // Track active photo index per category { [categoryId]: number }
  const [activePhotoIndices, setActivePhotoIndices] = useState(() => {
    const initial = {};
    GALLERY_CATEGORIES.forEach((cat) => {
      initial[cat.id] = 0;
    });
    return initial;
  });

  // Track which category row is hovered (to pause autoplay)
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Lightbox Modal state
  const [lightboxState, setLightboxState] = useState({
    isOpen: false,
    photos: [],
    currentIndex: 0,
    categoryTitle: ''
  });

  // Filtered categories
  const displayedCategories =
    activeCategory === 'all'
      ? GALLERY_CATEGORIES
      : GALLERY_CATEGORIES.filter((cat) => cat.id === activeCategory);

  // Navigate photos in a specific category showcase
  const handleNextPhoto = useCallback((catId, totalPhotos) => {
    setActivePhotoIndices((prev) => ({
      ...prev,
      [catId]: (prev[catId] + 1) % totalPhotos
    }));
  }, []);

  const handlePrevPhoto = useCallback((catId, totalPhotos) => {
    setActivePhotoIndices((prev) => ({
      ...prev,
      [catId]: (prev[catId] - 1 + totalPhotos) % totalPhotos
    }));
  }, []);

  const handleSelectPhoto = useCallback((catId, index) => {
    setActivePhotoIndices((prev) => ({
      ...prev,
      [catId]: index
    }));
  }, []);

  // Autoplay for category showcases (pauses when category row is hovered)
  useEffect(() => {
    const interval = setInterval(() => {
      displayedCategories.forEach((cat) => {
        if (hoveredCategory !== cat.id) {
          setActivePhotoIndices((prev) => ({
            ...prev,
            [cat.id]: (prev[cat.id] + 1) % cat.photos.length
          }));
        }
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [displayedCategories, hoveredCategory]);

  // Lightbox opening
  const openLightbox = (photos, index, categoryTitle) => {
    setLightboxState({
      isOpen: true,
      photos,
      currentIndex: index,
      categoryTitle
    });
  };

  const closeLightbox = () => {
    setLightboxState((prev) => ({ ...prev, isOpen: false }));
  };

  const nextLightboxImage = () => {
    setLightboxState((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.photos.length
    }));
  };

  const prevLightboxImage = () => {
    setLightboxState((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + prev.photos.length) % prev.photos.length
    }));
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxState.isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        nextLightboxImage();
      } else if (e.key === 'ArrowLeft') {
        prevLightboxImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxState.isOpen, lightboxState.photos.length]);


  return (
    <div className="about-page-root">
      {/* 1. Global Floating Pill Navbar */}
      <Navbar
        onOpenContact={onOpenContact}
        onOpenConsultation={onOpenConsultation}
      />

      {/* 2. Angled Hero Section with 3D Globe Mesh & Centered "WORK CULTURE" (Identical to Contact Page) */}
      <section className="iz-hero-section">
        {/* 3D Dotted Globe Mesh (SVG) */}
        <div className="iz-hero-globe-mesh" aria-hidden="true">
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="globeGradAbout" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#00d2d3" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.05" />
              </radialGradient>
            </defs>
            {/* Latitude / Longitude 3D Perspective Dots */}
            {Array.from({ length: 11 }).map((_, rIndex) => {
              const r = 25 + rIndex * 12;
              return Array.from({ length: 16 }).map((_, dIndex) => {
                const angle = (dIndex * 22.5 * Math.PI) / 180;
                const cx = 130 + r * Math.cos(angle) * 0.95;
                const cy = 130 + r * Math.sin(angle) * 0.55;
                const size = 1.2 + (rIndex / 11) * 2;
                return (
                  <circle
                    key={`${rIndex}-${dIndex}`}
                    cx={cx}
                    cy={cy}
                    r={size}
                    fill="url(#globeGradAbout)"
                    opacity={0.3 + (dIndex % 3) * 0.25}
                  />
                );
              });
            })}
          </svg>
        </div>

        <div className="iz-hero-content">
          <h1 className="iz-hero-title">WORK CULTURE</h1>
        </div>
      </section>

      {/* 3. Interactive Gallery Showcase (Alternating Layout like Cyberswift) */}
      <section className="about-showcase-section" id="work-culture">
        <div className="about-container">
          <div className="about-gallery-rows-wrapper">
            {displayedCategories.map((category, rowIndex) => {
              const currentPhotoIndex = activePhotoIndices[category.id] || 0;
              const activePhoto = category.photos[currentPhotoIndex] || category.photos[0];
              // Alternating Layout: Even index -> Main Left, Thumbs Right; Odd index -> Thumbs Left, Main Right
              const isEven = rowIndex % 2 === 0;
              const rowLayoutClass = isEven ? 'layout-main-left' : 'layout-main-right';

              return (
                <div
                  key={category.id}
                  id={category.id}
                  className={`about-gallery-category-card ${rowLayoutClass}`}
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  {category.id === 'awareness-program' && (
                    <span id="conventions-aikyam" style={{ position: 'relative', top: '-80px', display: 'block', visibility: 'hidden' }} />
                  )}
                  {/* Category Header Bar */}
                  <div className="about-cat-header-strip">
                    <div className="about-cat-header-left">
                      <h2 className="about-cat-title">{category.title}</h2>
                    </div>
                    <p className="about-cat-description">{category.description}</p>
                  </div>

                  {/* 2-Column Interactive Showcase Grid */}
                  <div className="about-cat-showcase-grid">
                    {/* COLUMN A: Main Featured Photo Showcase */}
                    <div className="about-main-showcase-col">
                      <div className="about-main-showcase-stage">
                        {/* Main Image with Zoom Lightbox click */}
                        <div
                          className="about-main-image-viewport"
                          onClick={() =>
                            openLightbox(category.photos, currentPhotoIndex, category.title)
                          }
                          title="Click to view full photo in high resolution"
                        >
                          <img
                            key={activePhoto.id}
                            src={activePhoto.image}
                            alt={activePhoto.alt}
                            className="about-main-featured-img"
                            loading="lazy"
                          />

                          {/* Gradient Vignette Overlay */}
                          <div className="about-main-image-gradient" />

                          {/* Zoom Expand Button */}
                          <button
                            type="button"
                            className="about-main-expand-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              openLightbox(category.photos, currentPhotoIndex, category.title);
                            }}
                            title="Expand Fullscreen"
                            aria-label="Expand image"
                          >
                            <Maximize2 size={16} />
                          </button>

                          {/* Bottom Caption Overlay */}
                          <div className="about-main-caption-box">
                            <h3 className="about-main-caption-title">{activePhoto.title}</h3>
                            <p className="about-main-caption-text">{activePhoto.caption}</p>
                          </div>
                        </div>

                        {/* Navigation Arrows for Main Slider */}
                        <button
                          type="button"
                          className="about-slider-nav-btn about-slider-nav-prev"
                          onClick={() => handlePrevPhoto(category.id, category.photos.length)}
                          aria-label={`Previous photo in ${category.title}`}
                          title="Previous photo"
                        >
                          <ChevronLeft size={22} />
                        </button>

                        <button
                          type="button"
                          className="about-slider-nav-btn about-slider-nav-next"
                          onClick={() => handleNextPhoto(category.id, category.photos.length)}
                          aria-label={`Next photo in ${category.title}`}
                          title="Next photo"
                        >
                          <ChevronRight size={22} />
                        </button>
                      </div>
                    </div>

                    {/* COLUMN B: Interactive Thumbnails Grid / Carousel */}
                    <div className="about-thumbs-col">


                      <div className="about-thumbs-grid">
                        {category.photos.map((photo, pIdx) => {
                          const isThumbActive = pIdx === currentPhotoIndex;
                          return (
                            <div
                              key={photo.id}
                              className={`about-thumb-card ${isThumbActive ? 'active' : ''}`}
                              onClick={() => handleSelectPhoto(category.id, pIdx)}
                              title={photo.title}
                            >
                              <div className="about-thumb-img-box">
                                <img
                                  src={photo.image}
                                  alt={photo.alt}
                                  className="about-thumb-img"
                                  loading="lazy"
                                />
                              </div>
                              <div className="about-thumb-info">
                                <span className="about-thumb-title">{photo.title}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Divider line between rows if not last */}
                  {rowIndex < displayedCategories.length - 1 && (
                    <div className="about-cat-separator" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Lightbox Modal for High-Resolution Image Preview */}
      {lightboxState.isOpen && (
        <div className="about-lightbox-backdrop" onClick={closeLightbox}>
          <div
            className="about-lightbox-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Close button */}
            <button
              type="button"
              className="about-lightbox-close-btn"
              onClick={closeLightbox}
              aria-label="Close Preview"
            >
              <X size={20} />
            </button>

            {/* Stage */}
            <div className="about-lightbox-image-stage">
              <button
                type="button"
                className="about-lightbox-nav-btn about-lightbox-prev"
                onClick={prevLightboxImage}
                aria-label="Previous Image"
              >
                <ChevronLeft size={24} />
              </button>

              <img
                src={lightboxState.photos[lightboxState.currentIndex]?.image}
                alt={lightboxState.photos[lightboxState.currentIndex]?.alt}
                className="about-lightbox-img"
              />

              <button
                type="button"
                className="about-lightbox-nav-btn about-lightbox-next"
                onClick={nextLightboxImage}
                aria-label="Next Image"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Footer with Title, Caption and Counter */}
            <div className="about-lightbox-footer">
              <div className="about-lightbox-text-col">
                <h4 className="about-lightbox-caption">
                  {lightboxState.photos[lightboxState.currentIndex]?.title}
                </h4>
                <p className="about-lightbox-sub">
                  {lightboxState.photos[lightboxState.currentIndex]?.caption}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Comprehensive Official Footer */}
      <Footer />
    </div>
  );
}
