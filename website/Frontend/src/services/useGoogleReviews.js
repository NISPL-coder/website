// ==========================================================================
// GOOGLE REVIEWS DATA PROVIDER (NO EXTERNAL API / BACKEND CALLS)
// Pure client-side data provider utilizing verified service reviews.
// ==========================================================================

import { REAL_POSITIVE_REVIEWS } from './realGoogleReviews';

export function useGoogleReviews() {
  return {
    reviews: REAL_POSITIVE_REVIEWS,
    rating: 4.5,
    totalReviews: 168,
    isLive: false,
    loading: false,
    error: null,
    businessName: 'Net Infotech System Pvt. Ltd.',
    googleSearchUrl: 'https://www.google.com/search?q=net+infotech+system+salt+lake+kolkata+reviews',
    writeReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJw20xKtt4AjoROk03n_2k4Ew',
    reviewsUri: 'https://maps.google.com/?cid=5514215475510779098',
    placeUri: 'https://maps.google.com/?cid=5514215475510779098'
  };
}
