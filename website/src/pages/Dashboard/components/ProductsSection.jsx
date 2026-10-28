import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  Check,
  Server,
  Smartphone,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Search,
  ShieldCheck,
  Zap,
  Headphones,
  Cpu,
  Layers,
  Sparkles,
  RotateCw,
  HardDrive,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Info,
  Clock,
  Filter,
  Heart,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import tallyLogo from '../../../assets/partners/tally.png';
import SolutionCategorySelection from './SolutionCategorySelection';
import CloudProviderSelection from './CloudProviderSelection';
import CloudPlansPricingView from './CloudPlansPricingView';
import TallyPrimePlansView from './TallyPrimePlansView';
import ProductDetailsModal from './ProductDetailsModal';
import {
  TALLY_CATEGORIES,
  TALLY_PRODUCTS,
  CLOUD_CATEGORIES,
  CLOUD_PRODUCTS,
  hydrateCatalogWithPricing
} from '../data/productsData';
import { formatINR } from '../utils/pricingUtils';

export default function ProductsSection({
  onAddToCart,
  onGoToCart,
  cartItemIds = []
}) {
  // Navigation State: null = initial 2-card screen; 'tally' = Tally catalog; 'cloud' = Cloud flow
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCloudProvider, setSelectedCloudProvider] = useState(null); // 'tally-on-cloud' | 'ctrls-cloud' | 'azure-cloud' | null

  // Filter & Search State
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recommended');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Showcase Slider & Wishlist State (Matching User's Collection Design)
  const [activeCardIndex, setActiveCardIndex] = useState(1);
  const [wishlist, setWishlist] = useState({});
  const cardsTrackRef = useRef(null);

  // Modal State
  const [detailProduct, setDetailProduct] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Success Feedback
  const [justAddedId, setJustAddedId] = useState(null);

  // Active dataset with hydrated pricing
  const currentCatalog = useMemo(() => {
    if (selectedCategory === 'tally') {
      return hydrateCatalogWithPricing(TALLY_PRODUCTS);
    }
    if (selectedCategory === 'cloud') {
      return hydrateCatalogWithPricing(CLOUD_PRODUCTS);
    }
    return [];
  }, [selectedCategory]);

  const currentCategories = useMemo(() => {
    if (selectedCategory === 'tally') return TALLY_CATEGORIES;
    if (selectedCategory === 'cloud') return CLOUD_CATEGORIES;
    return [];
  }, [selectedCategory]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    if (!currentCatalog.length) return [];

    let list = currentCatalog.filter((item) => {
      // 1. Subcategory filter
      const matchesSubCat = activeSubCategory === 'all' || item.category === activeSubCategory;

      // 2. Duration / Billing filter
      let matchesDuration = true;
      if (selectedDuration !== 'all') {
        const d = (item.duration || item.billingCycle || '').toLowerCase();
        if (selectedDuration === 'monthly') matchesDuration = d.includes('month');
        else if (selectedDuration === 'annual') matchesDuration = d.includes('year') || d.includes('annual');
        else if (selectedDuration === 'perpetual') matchesDuration = d.includes('perpetual') || d.includes('lifetime');
      }

      // 3. Search query filter
      const q = searchQuery.toLowerCase().trim();
      let matchesSearch = true;
      if (q) {
        matchesSearch =
          (item.fullName && item.fullName.toLowerCase().includes(q)) ||
          (item.shortDesc && item.shortDesc.toLowerCase().includes(q)) ||
          (item.categoryLabel && item.categoryLabel.toLowerCase().includes(q)) ||
          (item.planName && item.planName.toLowerCase().includes(q)) ||
          (item.features && item.features.some((f) => f.toLowerCase().includes(q))) ||
          (item.specs && item.specs.some((s) => (s.value || s).toLowerCase().includes(q)));
      }

      return matchesSubCat && matchesDuration && matchesSearch;
    });

    // Sorting
    if (selectedSort === 'price-low') {
      list.sort((a, b) => a.pricing.finalPrice - b.pricing.finalPrice);
    } else if (selectedSort === 'price-high') {
      list.sort((a, b) => b.pricing.finalPrice - a.pricing.finalPrice);
    }

    return list;
  }, [currentCatalog, activeSubCategory, selectedDuration, searchQuery, selectedSort]);

  // Reset category filters when switching between Tally and Cloud
  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    setSelectedCloudProvider(null);
    setActiveSubCategory('all');
    setSelectedDuration('all');
    setSearchQuery('');
    setSelectedSort('recommended');
  };

  const handleResetFilters = () => {
    setActiveSubCategory('all');
    setSelectedDuration('all');
    setSearchQuery('');
    setSelectedSort('recommended');
  };

  const handleAdd = (product) => {
    onAddToCart({
      id: product.id,
      name: product.fullName || product.name,
      basePrice: product.pricing.discountedPrice || product.basePrice,
      originalBasePrice: product.basePrice,
      finalPrice: product.pricing.finalPrice,
      category: product.categoryLabel,
      billingCycle: product.billingCycle || product.duration,
      quantity: 1
    });

    setJustAddedId(product.id);
    toast.success(`Added ${product.name} to Cart!`, {
      id: `cart-${product.id}`,
      icon: '🛒'
    });
    setTimeout(() => setJustAddedId(null), 1800);
  };

  const toggleWishlist = (id) => {
    setWishlist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToCard = (idx) => {
    if (!cardsTrackRef.current) return;
    const container = cardsTrackRef.current;
    const card = container.querySelector(`[data-index="${idx}"]`);
    if (card) {
      const containerWidth = container.offsetWidth;
      const cardLeft = card.offsetLeft;
      const cardWidth = card.offsetWidth;
      const targetScroll = cardLeft - (containerWidth / 2) + (cardWidth / 2);
      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth'
      });
    }
  };

  const handlePrevCard = () => {
    const nextIdx = activeCardIndex > 0 ? activeCardIndex - 1 : Math.max(0, filteredProducts.length - 1);
    setActiveCardIndex(nextIdx);
    scrollToCard(nextIdx);
  };

  const handleNextCard = () => {
    const nextIdx = activeCardIndex < filteredProducts.length - 1 ? activeCardIndex + 1 : 0;
    setActiveCardIndex(nextIdx);
    scrollToCard(nextIdx);
  };

  const handleCardClick = (idx) => {
    setActiveCardIndex(idx);
    scrollToCard(idx);
  };

  // Scroll listener to update active index when user swipes or drags
  const scrollTimeoutRef = useRef(null);
  const handleTrackScroll = () => {
    if (!cardsTrackRef.current) return;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    scrollTimeoutRef.current = setTimeout(() => {
      const container = cardsTrackRef.current;
      if (!container) return;
      const containerCenter = container.scrollLeft + container.offsetWidth / 2;
      const cards = container.querySelectorAll('.showcase-product-card');
      let closestIdx = 0;
      let minDistance = Infinity;

      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(containerCenter - cardCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIdx = index;
        }
      });

      if (closestIdx !== activeCardIndex && closestIdx < filteredProducts.length) {
        setActiveCardIndex(closestIdx);
      }
    }, 50);
  };

  // Mouse drag-to-scroll for desktop
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const hasDragged = useRef(false);

  const handleMouseDown = (e) => {
    if (e.button !== 0 || e.target.closest('button')) return;
    isMouseDown.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - cardsTrackRef.current.offsetLeft;
    startScrollLeft.current = cardsTrackRef.current.scrollLeft;
    cardsTrackRef.current.classList.add('is-dragging');
  };

  const handleMouseLeaveOrUp = () => {
    if (isMouseDown.current) {
      isMouseDown.current = false;
      if (cardsTrackRef.current) {
        cardsTrackRef.current.classList.remove('is-dragging');
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown.current || !cardsTrackRef.current) return;
    e.preventDefault();
    const x = e.pageX - cardsTrackRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.3;
    if (Math.abs(walk) > 6) {
      hasDragged.current = true;
    }
    cardsTrackRef.current.scrollLeft = startScrollLeft.current - walk;
  };

  // Adjust activeCardIndex if list length changes
  useEffect(() => {
    if (filteredProducts.length > 0 && activeCardIndex >= filteredProducts.length) {
      setActiveCardIndex(0);
    }
  }, [filteredProducts.length, activeCardIndex]);

  // Center active card when category/subcategory changes
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToCard(activeCardIndex);
    }, 180);
    return () => clearTimeout(timer);
  }, [selectedCategory, activeSubCategory]);

  const handleOpenDetails = (product) => {
    setDetailProduct(product);
    setIsDetailModalOpen(true);
  };

  // Helper for Product Card Icons
  const renderProductIcon = (iconName, fallbackTheme) => {
    switch (iconName) {
      case 'Layers':
        return <Layers size={20} />;
      case 'RotateCw':
        return <RotateCw size={20} />;
      case 'ShieldCheck':
        return <ShieldCheck size={20} />;
      case 'Server':
        return <Server size={20} />;
      case 'Cpu':
        return <Cpu size={20} />;
      case 'HardDrive':
        return <HardDrive size={20} />;
      case 'MessageSquare':
        return <MessageSquare size={20} />;
      case 'Zap':
        return <Zap size={20} />;
      case 'Smartphone':
        return <Smartphone size={20} />;
      default:
        return <Package size={20} />;
    }
  };

  /* ─────────────────────────────────────────────────────────────────────────
     VIEW 1: INITIAL TWO LARGE HORIZONTAL CARDS SCREEN
  ───────────────────────────────────────────────────────────────────────── */
  if (!selectedCategory) {
    return (
      <SolutionCategorySelection
        onSelectCategory={handleSelectCategory}
      />
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────
     VIEW 2: CLOUD SOLUTIONS FLOW (3 PROVIDER BOXES -> 4 PACK TIERS)
  ───────────────────────────────────────────────────────────────────────── */
  if (selectedCategory === 'cloud') {
    if (!selectedCloudProvider) {
      return (
        <CloudProviderSelection
          onSelectProvider={(provId) => setSelectedCloudProvider(provId)}
          onBack={() => {
            setSelectedCategory(null);
            setSelectedCloudProvider(null);
          }}
        />
      );
    }

    return (
      <CloudPlansPricingView
        providerId={selectedCloudProvider}
        onBack={() => setSelectedCloudProvider(null)}
        onAddToCart={handleAdd}
        cartItemIds={cartItemIds}
      />
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────
     VIEW 3: TALLY PRIME & CUSTOMIZATION PLANS (SILVER, GOLD, CUSTOMIZATION)
  ───────────────────────────────────────────────────────────────────────── */
  if (selectedCategory === 'tally') {
    return (
      <TallyPrimePlansView
        onBack={() => {
          setSelectedCategory(null);
          setSelectedCloudProvider(null);
        }}
        onAddToCart={handleAdd}
        cartItemIds={cartItemIds}
      />
    );
  }

  const isTally = false;
  const themeClass = 'tally-theme-listing';

  return (
    <div className={`cliento-products-container animate-fade-in ${themeClass}`}>

      {/* ── Products Display (Grid View or Comparison Table) ────── */}
      {filteredProducts.length > 0 ? (
        viewMode === 'grid' ? (
          /* 1. FEATURED PRODUCTS SHOWCASE (MATCHING USER COLLECTION DESIGN) */
          <div className="featured-collection-section">
            {/* ── Top Right Corner Back Section ────────────────── */}
            <div className="showcase-top-right-nav">
             
              <button
                type="button"
                className="showcase-corner-back-btn"
                onClick={() => setSelectedCategory(null)}
                title="Back to Solutions"
                aria-label="Back to Solutions"
              >
                <ArrowLeft size={16} className="back-arrow-icon" />
                <span>Back to Solutions</span>
              </button>
            </div>

            <div className="featured-collection-header">
              <span className="featured-collection-overline">
                OUR COLLECTION
              </span>
              <h2 className="featured-collection-title">Featured Products</h2>
              <p className="featured-collection-subtitle">
                Explore our most popular items loved by customers
              </p>
            </div>

            <div className="showcase-slider-wrapper">
              {/* Left Navigation Arrow */}
              {filteredProducts.length > 1 && (
                <button
                  type="button"
                  className="showcase-nav-arrow prev"
                  onClick={handlePrevCard}
                  aria-label="Previous product"
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              {/* Cards Horizontal Showcase Row with Touch & Drag Rolling */}
              <div
                className="showcase-cards-row"
                ref={cardsTrackRef}
                onScroll={handleTrackScroll}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeaveOrUp}
                onMouseUp={handleMouseLeaveOrUp}
                onMouseMove={handleMouseMove}
              >
                {filteredProducts.map((product, idx) => {
                  const isActive = idx === activeCardIndex;
                  const inCart = cartItemIds.includes(product.id);
                  const isAdded = justAddedId === product.id;
                  const isWishlisted = !!wishlist[product.id];
                  const pricing = product.pricing;

                  return (
                    <div
                      key={product.id}
                      data-index={idx}
                      className={`showcase-product-card ${isActive ? 'is-active-center' : ''} ${inCart ? 'is-in-cart' : ''}`}
                      onClick={() => {
                        if (!hasDragged.current) {
                          handleCardClick(idx);
                        }
                      }}
                    >
                      {/* Top Bar: Pill Badge + Wishlist Heart */}
                      <div className="showcase-card-topbar">
                        <span className="showcase-badge-pill">
                          {product.badge || 'POPULAR'}
                        </span>
                        <button
                          type="button"
                          className={`showcase-wishlist-btn ${isWishlisted ? 'is-active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          aria-label="Toggle wishlist"
                          title="Save to wishlist"
                        >
                          <Heart
                            size={16}
                            fill={isWishlisted ? '#e11d48' : 'none'}
                            color={isWishlisted ? '#e11d48' : '#a8988b'}
                          />
                        </button>
                      </div>

                      {/* Product Visual Area */}
                      <div
                        className="showcase-image-box"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetails(product);
                        }}
                        title="Click to view details"
                      >
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="showcase-img"
                          />
                        ) : (
                          <div className="showcase-fallback-icon">
                            {renderProductIcon(product.iconName, isTally)}
                          </div>
                        )}
                      </div>

                      {/* 3 mini dots below image */}
                      <div className="showcase-img-dots" aria-hidden="true">
                        <span className={`showcase-img-dot ${isActive ? 'active' : ''}`} />
                        <span className="showcase-img-dot" />
                        <span className="showcase-img-dot" />
                      </div>

                      {/* Card Content: Concise Title, 1-Line Description & Rating */}
                      <div className="showcase-card-body">
                        <h4
                          className="showcase-card-title"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetails(product);
                          }}
                          title="Click to view details"
                        >
                          {product.name}
                        </h4>

                        <p className="showcase-card-desc" title={product.shortDesc}>
                          {product.conciseDesc || product.shortDesc}
                        </p>

                        {/* Star Rating Line */}
                        <div className="showcase-rating-row">
                          <Star size={13} fill="#d97706" color="#d97706" className="showcase-star-icon" />
                          <span>{product.rating || 4.8}</span>
                          <span className="showcase-review-count">
                            ({product.reviewsCount || 89})
                          </span>
                        </div>

                        {/* Bottom Bar: Price & Action Button */}
                        <div className="showcase-card-footer">
                          <span className="showcase-price-val">
                            {pricing.formattedFinalPrice}
                          </span>

                          {isActive ? (
                            /* Expanded Pill Button on Active Center Card */
                            <button
                              type="button"
                              className={`showcase-pill-cart-btn ${isAdded ? 'added' : inCart ? 'in-cart' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!inCart) handleAdd(product);
                              }}
                              title={inCart ? 'Already in Cart' : 'Add to Cart'}
                            >
                              {isAdded ? (
                                <>
                                  <Check size={14} />
                                  <span>Added</span>
                                </>
                              ) : inCart ? (
                                <>
                                  <Check size={14} />
                                  <span>In Cart</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingCart size={14} />
                                  <span>Add to Cart</span>
                                </>
                              )}
                            </button>
                          ) : (
                            /* Circular Cart Button on Non-Active Cards */
                            <button
                              type="button"
                              className={`showcase-circle-cart-btn ${inCart ? 'in-cart' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!inCart) handleAdd(product);
                              }}
                              title={inCart ? 'Already in cart' : 'Add to cart'}
                            >
                              {inCart || isAdded ? (
                                <Check size={14} color="#059669" />
                              ) : (
                                <ShoppingCart size={14} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Navigation Arrow */}
              {filteredProducts.length > 1 && (
                <button
                  type="button"
                  className="showcase-nav-arrow next"
                  onClick={handleNextCard}
                  aria-label="Next product"
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </div>

            {/* Bottom Pagination Indicator Dots */}
            {filteredProducts.length > 1 && (
              <div className="showcase-pagination-dots" role="tablist">
                {filteredProducts.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    className={`showcase-page-dot ${dotIdx === activeCardIndex ? 'active' : ''}`}
                    onClick={() => handleCardClick(dotIdx)}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* 2. COMPARISON TABLE VIEW (DESKTOP READABILITY) */
          <div className="cliento-card product-comparison-table-wrap">
            <table className="product-comparison-table">
              <thead>
                <tr>
                  <th style={{ width: '32%' }}>Solution & Plan Details</th>
                  <th style={{ width: '22%' }}>Specifications & Capacity</th>
                  <th style={{ width: '18%' }}>Base & Discount</th>
                  <th style={{ width: '16%' }}>Final Price (18% GST)</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const inCart = cartItemIds.includes(product.id);
                  const pricing = product.pricing;

                  return (
                    <tr key={product.id} className={inCart ? 'row-in-cart' : ''}>
                      <td>
                        <div className="table-plan-cell">
                          <div
                            className="table-cell-icon"
                            style={{ background: isTally ? '#fef2f2' : '#eff6ff', color: isTally ? '#dc2626' : '#2563eb' }}
                          >
                            {renderProductIcon(product.iconName, isTally)}
                          </div>
                          <div>
                            <span className="table-plan-name">{product.fullName || product.name}</span>
                            <span className="table-plan-desc">{product.shortDesc}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="table-specs-cell">
                          {product.licenseType && (
                            <span className="table-spec-tag">{product.licenseType}</span>
                          )}
                          {product.userType && (
                            <span className="table-spec-tag">{product.userType}</span>
                          )}
                          {product.cpu && (
                            <span className="table-spec-tag">{product.cpu} &middot; {product.ram}</span>
                          )}
                          {product.storage && (
                            <span className="table-spec-tag">{product.storage}</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="table-price-breakdown">
                          <span className="table-base-val font-mono">{pricing.formattedBasePrice}</span>
                          {pricing.discountAmount > 0 && (
                            <span className="table-discount-pill text-emerald">
                              Save {pricing.discountPercent}%
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="table-final-price-box">
                          <span className="table-final-amt font-outfit" style={{ color: isTally ? '#dc2626' : '#2563eb' }}>
                            {pricing.formattedFinalPrice}
                          </span>
                          <span className="table-tax-included-note">
                            {product.billingCycle === 'Monthly' ? 'Monthly (incl. GST)' : 'Annual (incl. GST)'}
                          </span>
                        </div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions-cell">
                          <button
                            type="button"
                            className="table-view-btn"
                            onClick={() => handleOpenDetails(product)}
                            title="View Full Specifications"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            className={`table-add-btn ${inCart ? 'in-cart' : ''} ${isTally ? 'tally-btn' : 'cloud-btn'}`}
                            onClick={() => !inCart && handleAdd(product)}
                            title={inCart ? 'In Cart' : 'Select Plan'}
                          >
                            {inCart ? 'In Cart' : 'Select'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="cliento-card product-empty-state-box">
          <div className="empty-icon-circle">
            <Package size={28} color="#94a3b8" />
          </div>
          <h4>No matching solutions found</h4>
          <p>We couldn't find any plans matching your current filter selection or search query.</p>
          <button
            type="button"
            className="empty-reset-action-btn"
            onClick={handleResetFilters}
          >
            Clear Filters & View All
          </button>
        </div>
      )}

      {/* ── Product Specifications Modal ───────────────────────── */}
      <ProductDetailsModal
        product={detailProduct}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onAddToCart={handleAdd}
        onGoToCart={onGoToCart}
        isInCart={detailProduct ? cartItemIds.includes(detailProduct.id) : false}
      />
    </div>
  );
}
