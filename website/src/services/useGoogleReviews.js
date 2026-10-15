import { useState, useEffect } from 'react';
import { GOOGLE_REVIEWS_CONFIG } from './googleReviewsConfig';
import { REAL_POSITIVE_REVIEWS } from './realGoogleReviews';

export function useGoogleReviews() {
  const [reviews, setReviews] = useState(REAL_POSITIVE_REVIEWS);
  const [rating, setRating] = useState(GOOGLE_REVIEWS_CONFIG.defaultRating);
  const [totalReviews, setTotalReviews] = useState(GOOGLE_REVIEWS_CONFIG.defaultReviewCount);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [writeReviewUrl, setWriteReviewUrl] = useState(GOOGLE_REVIEWS_CONFIG.writeReviewUrl);
  const [googleMapsLinks, setGoogleMapsLinks] = useState(null);

  const { apiKey, placeId } = GOOGLE_REVIEWS_CONFIG;

  useEffect(() => {
    if (!apiKey || !placeId) {
      setIsLive(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const fetchPlacesNewApi = async () => {
      try {
        const response = await fetch(
          `https://places.googleapis.com/v1/places/${placeId}?languageCode=en`,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': 'id,displayName,rating,userRatingCount,reviews,googleMapsLinks'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Places API response error: ${response.status}`);
        }

        const data = await response.json();

        if (!isMounted) return;

        // Update live rating and user count directly from Google
        if (data.rating) {
          setRating(data.rating);
        }
        if (data.userRatingCount) {
          setTotalReviews(data.userRatingCount);
        }
        if (data.googleMapsLinks) {
          setGoogleMapsLinks(data.googleMapsLinks);
          if (data.googleMapsLinks.writeAReviewUri) {
            setWriteReviewUrl(data.googleMapsLinks.writeAReviewUri);
          }
        }

        // If Google Places API returned reviews, map only positive reviews (>= 4 stars)
        if (data.reviews && data.reviews.length > 0) {
          const liveList = data.reviews
            .filter((rev) => (rev.rating || 5) >= 4)
            .map((rev, idx) => ({
              id: `google-live-${idx}`,
              author: rev.authorAttribution?.displayName || 'Google Reviewer',
              role: 'Verified Google Reviewer',
              rating: rev.rating || 5,
              date: rev.relativePublishTimeDescription || 'Recent review',
              avatar: rev.authorAttribution?.photoUri || null,
              avatarBg: '#4285F4',
              initials: rev.authorAttribution?.displayName
                ? rev.authorAttribution.displayName.charAt(0).toUpperCase()
                : 'G',
              review: rev.text?.text || rev.originalText?.text || '',
              service: 'Google Review',
              verified: true,
              authorUrl: rev.authorAttribution?.uri
            }));

          if (liveList.length > 0) {
            setReviews([...liveList, ...REAL_POSITIVE_REVIEWS]);
          }
        }

        setIsLive(true);
        setLoading(false);
      } catch (err) {
        console.warn('Places API (New) fetch attempt:', err.message);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchPlacesNewApi();

    return () => {
      isMounted = false;
    };
  }, [apiKey, placeId]);

  return {
    reviews,
    rating,
    totalReviews,
    isLive,
    loading,
    error,
    businessName: GOOGLE_REVIEWS_CONFIG.businessName,
    googleSearchUrl: GOOGLE_REVIEWS_CONFIG.googleSearchUrl,
    writeReviewUrl,
    googleMapsLinks,
    reviewsUri: googleMapsLinks?.reviewsUri || null,
    placeUri: googleMapsLinks?.placeUri || null
  };
}
