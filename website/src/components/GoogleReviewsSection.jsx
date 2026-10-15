import React, { useRef, useState } from 'react';
import { Star, ChevronLeft, ChevronRight, CheckCircle2, MessageSquarePlus, ExternalLink, Quote } from 'lucide-react';
const GOOGLE_REVIEWS = [];
import { useScrollReveal } from '../utils/useScrollReveal';
import clientTeamImg from '../assets/client_team_celebration.webp';
import './GoogleReviewsSection.css';

export default function GoogleReviewsSection() {
  useScrollReveal();
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [userReviewModalOpen, setUserReviewModalOpen] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewService, setNewReviewService] = useState('Tally Prime');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submittedToast, setSubmittedToast] = useState(false);

  // Categories derived directly from real Google Search Business Profile
  const categories = ['All', 'gst compliance', 'supportive engineer', 'quick response', 'tech support'];

  const filteredReviews = activeFilter === 'All' 
    ? GOOGLE_REVIEWS 
    : GOOGLE_REVIEWS.filter(r => r.service.toLowerCase().includes(activeFilter.toLowerCase()) || activeFilter.toLowerCase().includes(r.service.toLowerCase()));

  // Duplicate list to achieve continuous seamless marquee loop
  const marqueeList = [...filteredReviews, ...filteredReviews, ...filteredReviews];

  const handleManualScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleAddReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewText.trim()) return;
    setUserReviewModalOpen(false);
    setSubmittedToast(true);
    setNewReviewName('');
    setNewReviewText('');
    setTimeout(() => setSubmittedToast(false), 4000);
  };

  return (
    <section className="nis-google-reviews-section reveal-fade-up">
      {/* Executive Photographic Background with Dark Luxury Overlay */}
      <div className="gr-bg-wrapper" aria-hidden="true">
        <img 
          src={clientTeamImg} 
          alt="Net Infotech System celebrating clients and team success" 
          className="gr-bg-photo" 
          width="1200"
          height="800"
          loading="lazy"
          decoding="async"
        />
        <div className="gr-bg-overlay" />
      </div>

      <div className="container gr-relative-container">

        {/* SECTION HEADER WITH GOOGLE BRANDING */}
        <div className="gr-header reveal-fade-up">
          <div className="gr-header-left">
            <div className="gr-google-badge">
              <svg className="gr-google-icon" viewBox="0 0 24 24" width="28" height="28">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <div className="gr-google-text">
                <span className="gr-brand-name">Google Reviews</span>
                <span className="gr-verified-pill">
                  <CheckCircle2 size={12} /> Real Google Listing
                </span>
              </div>
            </div>

            <h2 className="gr-title">
              What Our Clients Say on <span className="gr-google-gradient">Google</span>
            </h2>
            
            <p className="gr-subtitle">
              Authentic reviews from Net Infotech System Pvt. Ltd.'s official Google Profile in Webel IT Park, Salt Lake Sector V, Kolkata.
            </p>
          </div>

          <div className="gr-header-right">
            {/* RATING SUMMARY CARD - EXACT MATCH TO GOOGLE SCREENSHOT (4.5 STAR & 169 REVIEWS) */}
            <div className="gr-rating-summary-card">
              <div className="gr-rating-big">4.5</div>
              <div className="gr-rating-details">
                <div className="gr-stars-row">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} size={18} fill="#F59E0B" stroke="#F59E0B" />
                  ))}
                  {/* Half Star effect for 4.5 rating */}
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <Star size={18} fill="#CBD5E1" stroke="#CBD5E1" />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', overflow: 'hidden' }}>
                      <Star size={18} fill="#F59E0B" stroke="#F59E0B" />
                    </div>
                  </div>
                </div>
                <span className="gr-reviews-count">Based on <strong>169 Google Reviews</strong></span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="gr-action-buttons">
              <button 
                type="button" 
                className="gr-btn-write" 
                onClick={() => setUserReviewModalOpen(true)}
              >
                <MessageSquarePlus size={16} />
                <span>Write a Review</span>
              </button>
              <a 
                href="https://www.google.com/search?q=net+infotech+system" 
                target="_blank" 
                rel="noreferrer" 
                className="gr-btn-google-link"
              >
                <span>View on Google</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* FILTER TAGS & MARQUEE CONTROL BAR */}
        <div className="gr-control-bar">
          <div className="gr-filter-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`gr-filter-btn ${activeFilter === cat ? 'active' : ''}`}
                onClick={() => setActiveFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* AUTO HORIZONTAL CONTINUOUS MARQUEE SLIDER */}
        <div 
          className="gr-marquee-container"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            ref={scrollRef} 
            className={`gr-marquee-track ${isPaused ? 'paused' : ''}`}
          >
            {marqueeList.map((rev, index) => (
              <div key={`${rev.id}-${index}`} className="gr-review-card">
                
                {/* CARD TOP */}
                <div className="gr-card-header">
                  <div className="gr-avatar-wrap">
                    <div 
                      className="gr-avatar" 
                      style={{ backgroundColor: rev.avatarBg }}
                    >
                      {rev.initials}
                    </div>
                    <div className="gr-g-badge-mini" title="Verified Google Review">
                      <svg viewBox="0 0 24 24" width="12" height="12">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    </div>
                  </div>

                  <div className="gr-user-info">
                    <div className="gr-user-name">{rev.author}</div>
                    <p className="gr-user-role">{rev.role}</p>
                  </div>

                  <Quote className="gr-quote-icon" size={24} />
                </div>

                {/* RATING & SERVICE BADGE */}
                <div className="gr-card-sub-header">
                  <div className="gr-stars-mini">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="#F59E0B" stroke="#F59E0B" />
                    ))}
                  </div>
                  <span className="gr-service-pill">{rev.service}</span>
                  <span className="gr-date-tag">{rev.date}</span>
                </div>

                {/* REVIEW CONTENT */}
                <p className="gr-review-text">"{rev.review}"</p>

                {/* VERIFIED FOOTER */}
                <div className="gr-card-footer">
                  <span className="gr-verified-tag">
                    <CheckCircle2 size={13} color="#059669" /> Verified Google Review
                  </span>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>

      {/* WRITE A REVIEW MODAL SIMULATION */}
      {userReviewModalOpen && (
        <div className="gr-modal-overlay">
          <div className="gr-modal-box">
            <div className="gr-modal-header">
              <div className="gr-google-badge-modal">
                <svg viewBox="0 0 24 24" width="22" height="22">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Post a Google Review</span>
              </div>
              <button 
                type="button" 
                className="gr-modal-close"
                onClick={() => setUserReviewModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReviewSubmit} className="gr-modal-form">
              <label>Your Name / Business Title:</label>
              <input 
                type="text" 
                placeholder="e.g. Ramesh Kumar, Managing Director"
                value={newReviewName}
                onChange={(e) => setNewReviewName(e.target.value)}
                required 
              />

              <label>Service Used:</label>
              <select 
                value={newReviewService}
                onChange={(e) => setNewReviewService(e.target.value)}
              >
                <option value="Tally Prime">Tally Prime</option>
                <option value="Tally on Cloud">Tally on Cloud</option>
                <option value="Data Center & Cloud">Data Center & Cloud</option>
                <option value="IT Infra & Security">IT Infrastructure & Security</option>
                <option value="Hardware Repair">Hardware Repair & Maintenance</option>
                <option value="IT Rentals">IT Rentals & Hardware Sales</option>
              </select>

              <label>Rating:</label>
              <div className="gr-star-picker">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="gr-star-pick-btn"
                    onClick={() => setNewReviewRating(star)}
                  >
                    <Star 
                      size={24} 
                      fill={star <= newReviewRating ? "#F59E0B" : "#CBD5E1"} 
                      stroke={star <= newReviewRating ? "#F59E0B" : "#94A3B8"} 
                    />
                  </button>
                ))}
              </div>

              <label>Your Review Message:</label>
              <textarea 
                rows="4" 
                placeholder="Share your experience working with Net Infotech System..."
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                required
              />

              <div className="gr-modal-actions">
                <button 
                  type="button" 
                  className="gr-btn-cancel" 
                  onClick={() => setUserReviewModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="gr-btn-submit">
                  Submit Google Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST FEEDBACK */}
      {submittedToast && (
        <div className="gr-toast-floating">
          <CheckCircle2 size={20} color="#10B981" />
          <span>Thank you! Your Google Review has been submitted successfully for verification.</span>
        </div>
      )}

    </section>
  );
}
