// ==========================================================================
// GOOGLE PLACES API CONFIGURATION FOR NET INFOTECH SYSTEM PVT. LTD.
// ==========================================================================

export const GOOGLE_REVIEWS_CONFIG = {
  // Read from Vite environment variable (.env) with user's provided credentials as default
  apiKey: import.meta.env.VITE_GOOGLE_PLACES_API_KEY || 'AIzaSyCXhCPj252sWFGDn87-6mjKHa529wzqMNA',
  placeId: import.meta.env.VITE_GOOGLE_PLACE_ID || 'ChIJq6qqOvB1AjoR2hzIaMJthkw',

  // Official direct Google profile links
  businessName: 'Net Infotech System Pvt. Ltd.',
  address: 'Webel Tower 1, IT Park, BN Block, Sector V, Bidhannagar, Kolkata, West Bengal 700091, India',
  googleSearchUrl: 'https://www.google.com/search?q=net+infotech+system',
  writeReviewUrl: 'https://www.google.com/maps/place//data=!4m3!3m2!1s0x3a0275f03aaaaaab:0x4c866dc268c81cda!12e1?g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA',
  googleMapsPlaceUrl: 'https://maps.google.com/?cid=5514215475510779098',

  // Official verified rating statistics from Google Business profile
  defaultRating: 4.5,
  defaultReviewCount: 168
};
