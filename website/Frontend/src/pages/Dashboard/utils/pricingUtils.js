/**
 * Pricing and Tax Utility Functions
 * Implements standard Indian GST calculations and currency formatting.
 */

export const GST_RATE_DEFAULT = 0.18; // 18% standard GST for software/cloud services

/**
 * Format a number into Indian Rupee format (e.g. ₹22,500 or ₹22,500.50)
 * @param {number} amount
 * @param {boolean} includeDecimals
 * @returns {string}
 */
export function formatINR(amount, includeDecimals = false) {
  if (amount == null || isNaN(amount)) return '₹0';
  const num = Number(amount);
  return '₹' + num.toLocaleString('en-IN', {
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0
  });
}

/**
 * Calculate pricing breakdowns with discount and 18% GST
 * Formula:
 * - Discount Amount = Base Price * Discount Percentage
 * - Discounted Price = Base Price - Discount Amount
 * - GST Amount = Discounted Price * GST Rate
 * - Final Price = Discounted Price + GST Amount
 *
 * @param {Object} params
 * @param {number} params.basePrice - Original list price
 * @param {number} [params.discountPercent=0] - Percentage discount (0-100)
 * @param {number} [params.gstRate=0.18] - Applicable GST rate (0.18 for 18%)
 * @returns {Object} Complete pricing calculation breakdown
 */
export function calculatePricing({ basePrice, discountPercent = 0, gstRate = GST_RATE_DEFAULT }) {
  const base = Math.max(0, Number(basePrice) || 0);
  const discountPct = Math.max(0, Math.min(100, Number(discountPercent) || 0));

  const discountAmount = Math.round(base * (discountPct / 100));
  const discountedPrice = base - discountAmount;
  const gstAmount = Math.round(discountedPrice * gstRate);
  const finalPrice = discountedPrice + gstAmount;

  return {
    basePrice: base,
    discountPercent: discountPct,
    discountAmount,
    discountedPrice,
    gstRate,
    gstAmount,
    finalPrice,
    formattedBasePrice: formatINR(base),
    formattedDiscountAmount: formatINR(discountAmount),
    formattedDiscountedPrice: formatINR(discountedPrice),
    formattedGstAmount: formatINR(gstAmount),
    formattedFinalPrice: formatINR(finalPrice)
  };
}

export default {
  calculatePricing,
  formatINR,
  GST_RATE_DEFAULT
};
