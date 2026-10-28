/**
 * Cart Controller for NISPL Software & Cloud Marketplace
 * Provides RESTful cart manipulation with 18% GST calculation (9% CGST + 9% SGST),
 * fulfillment selection, dynamic add-ons, and multi-session persistence.
 */

import Cart from '../models/Cart.js';

// Fallback in-memory store for high-speed retrieval & offline resilience
const memoryCartStore = new Map();

// Standard recommended enterprise add-ons catalog
export const SYSTEM_ADDONS = [
  {
    id: 'tally-whatsapp-automation',
    name: 'WhatsApp Automation Module',
    category: 'Automation Add-on',
    badge: 'POPULAR',
    badgeColor: '#059669',
    badgeBg: '#ecfdf5',
    basePrice: 3000,
    taxPercent: 18,
    finalPrice: 3540,
    desc: 'Instant PDF invoices & receipts dispatched directly via WhatsApp.',
    spec: 'Meta Official API',
    inStock: true
  },
  {
    id: 'cloud-backup-100gb',
    name: 'Encrypted Cloud Backup (100GB)',
    category: 'Security & Backup',
    badge: 'ESSENTIAL',
    badgeColor: '#2563eb',
    badgeBg: '#eff6ff',
    basePrice: 1499,
    taxPercent: 18,
    finalPrice: 1769,
    desc: 'Automated nightly snapshot backup with 15-day recovery retention.',
    spec: '100 GB NVMe Storage',
    inStock: true
  },
  {
    id: 'tally-einvoice-api',
    name: 'Direct e-Invoice & e-Way Bill API',
    category: 'Government Compliance',
    badge: 'COMPLIANCE',
    badgeColor: '#7c3aed',
    badgeBg: '#f5f3ff',
    basePrice: 3500,
    taxPercent: 18,
    finalPrice: 4130,
    desc: 'Sub-second IRN & QR code generation directly from Tally billing.',
    spec: 'Direct IRP Sync',
    inStock: true
  },
  {
    id: 'cloud-tally-business',
    name: 'Tally on Cloud (3 Users)',
    category: 'Cloud Hosting',
    badge: 'BEST SELLER',
    badgeColor: '#d97706',
    badgeBg: '#fef3c7',
    basePrice: 2499,
    taxPercent: 18,
    finalPrice: 2949,
    desc: 'High-speed remote cloud desktop accessible from Mac & Windows.',
    spec: 'Tier-4 Datacenter',
    inStock: true
  },
  {
    id: 'tally-tss-single',
    name: 'TSS 1-Year Renewal (Silver)',
    category: 'Software Maintenance',
    badge: 'TAX UPDATES',
    badgeColor: '#dc2626',
    badgeBg: '#fef2f2',
    basePrice: 4500,
    taxPercent: 18,
    finalPrice: 5310,
    desc: 'Continuous statutory tax patches, banking API & reports.',
    spec: '12 Months Free Updates',
    inStock: true
  },
  {
    id: 'tally-lan-booster',
    name: 'LAN Network Accelerator',
    category: 'Network Optimization',
    badge: 'UTILITY',
    badgeColor: '#0891b2',
    badgeBg: '#ecfeff',
    basePrice: 2200,
    taxPercent: 18,
    finalPrice: 2596,
    desc: 'Zero-lag multi-workstation concurrency for high-volume retail billing.',
    spec: 'Multi-LAN Routing',
    inStock: true
  }
];

// Helper: Calculate full cart financials
export const calculateCartTotals = (items = [], fulfillmentMode = 'digital') => {
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.basePrice) || 0) * (Number(item.quantity) || 1),
    0
  );

  const cgst = Math.round(subtotal * 0.09);
  const sgst = Math.round(subtotal * 0.09);
  const taxTotal = cgst + sgst;
  const grandTotal = subtotal + taxTotal;
  const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  return {
    subtotal,
    cgst,
    sgst,
    taxTotal,
    grandTotal,
    itemCount: items.length,
    totalQuantity,
    fulfillmentMode,
    currency: 'INR',
    formattedSubtotal: `₹${subtotal.toLocaleString('en-IN')}`,
    formattedTaxTotal: `₹${taxTotal.toLocaleString('en-IN')}`,
    formattedGrandTotal: `₹${grandTotal.toLocaleString('en-IN')}`
  };
};

// Helper: Extract unique cart session key
const getSessionKey = (req) => {
  return (
    req.user?._id?.toString() ||
    req.headers['x-session-id'] ||
    req.query.sessionId ||
    'nispl_default_guest'
  );
};

// Helper: Get cart document with fallback
const getOrCreateCart = async (req) => {
  const sessionKey = getSessionKey(req);
  const userId = req.user?._id || null;

  // 1. Check in-memory store
  let cartData = memoryCartStore.get(sessionKey);

  // 2. Check Database if available
  try {
    const dbCart = await Cart.findOne({ sessionId: sessionKey }).lean();
    if (dbCart) {
      cartData = dbCart;
      memoryCartStore.set(sessionKey, dbCart);
    }
  } catch (err) {
    // Database query failed (e.g. offline/mock mode), continue with in-memory
  }

  // 3. Initialize default cart if not present
  if (!cartData) {
    cartData = {
      sessionId: sessionKey,
      userId,
      items: [
        {
          id: 'prod-tss-single',
          name: 'TSS Renewal (Single User)',
          basePrice: 4500,
          originalBasePrice: 4500,
          finalPrice: 5310,
          quantity: 1,
          sku: '#2143TSS001',
          category: 'TSS Renewals',
          billingCycle: 'Annual'
        }
      ],
      fulfillmentMode: 'digital',
      currency: 'INR'
    };
    memoryCartStore.set(sessionKey, cartData);

    try {
      await Cart.create(cartData);
    } catch (e) {
      // Ignore DB creation error in mock mode
    }
  }

  return cartData;
};

// Helper: Save updated cart document
const saveCart = async (sessionKey, cartData) => {
  memoryCartStore.set(sessionKey, cartData);
  try {
    await Cart.findOneAndUpdate(
      { sessionId: sessionKey },
      {
        $set: {
          items: cartData.items,
          fulfillmentMode: cartData.fulfillmentMode,
          currency: cartData.currency,
          userId: cartData.userId || null
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
  } catch (e) {
    // In-memory fallback is active
  }
};

/**
 * @route   GET /api/cart
 * @desc    Get the current cart, items, fulfillment mode, and financial totals
 */
export const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req);
    const totals = calculateCartTotals(cart.items, cart.fulfillmentMode);

    return res.status(200).json({
      success: true,
      data: {
        sessionId: cart.sessionId,
        items: cart.items,
        fulfillmentMode: cart.fulfillmentMode || 'digital',
        pricing: totals,
        itemCount: totals.itemCount,
        totalQuantity: totals.totalQuantity
      }
    });
  } catch (error) {
    console.error('[getCart] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve cart details.'
    });
  }
};

/**
 * @route   POST /api/cart/add
 * @desc    Add an item to the cart or increment quantity if already present
 */
export const addToCart = async (req, res) => {
  try {
    const { id, name, basePrice, quantity = 1, sku, category, billingCycle, image } = req.body;

    if (!id || !name || basePrice === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required item properties: id, name, and basePrice are mandatory.'
      });
    }

    const sessionKey = getSessionKey(req);
    const cart = await getOrCreateCart(req);
    const numericBase = Number(basePrice) || 0;
    const addQty = Math.max(1, parseInt(quantity, 10) || 1);

    const existingIdx = cart.items.findIndex((item) => item.id === id);

    if (existingIdx > -1) {
      cart.items[existingIdx].quantity = (cart.items[existingIdx].quantity || 1) + addQty;
      cart.items[existingIdx].basePrice = numericBase;
      cart.items[existingIdx].finalPrice = Math.round(numericBase * 1.18);
    } else {
      cart.items.push({
        id,
        name,
        basePrice: numericBase,
        originalBasePrice: numericBase,
        finalPrice: Math.round(numericBase * 1.18),
        quantity: addQty,
        sku: sku || `#2143${id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-6)}`,
        category: category || 'Product',
        billingCycle: billingCycle || 'Annual',
        image: image || ''
      });
    }

    await saveCart(sessionKey, cart);
    const totals = calculateCartTotals(cart.items, cart.fulfillmentMode);

    return res.status(200).json({
      success: true,
      message: `Successfully added ${name} to cart.`,
      data: {
        sessionId: cart.sessionId,
        items: cart.items,
        fulfillmentMode: cart.fulfillmentMode,
        pricing: totals,
        itemCount: totals.itemCount,
        totalQuantity: totals.totalQuantity
      }
    });
  } catch (error) {
    console.error('[addToCart] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to add item to cart.'
    });
  }
};

/**
 * @route   POST /api/cart/update-qty
 * @desc    Update quantity of a specific item (or removes it if qty <= 0)
 */
export const updateCartItemQuantity = async (req, res) => {
  try {
    const { id, quantity } = req.body;
    const targetId = id || req.params.id;

    if (!targetId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required to update quantity.'
      });
    }

    const newQty = parseInt(quantity, 10);
    const sessionKey = getSessionKey(req);
    const cart = await getOrCreateCart(req);

    if (isNaN(newQty) || newQty <= 0) {
      // Remove item
      cart.items = cart.items.filter((item) => item.id !== targetId);
    } else {
      // Update quantity
      const existing = cart.items.find((item) => item.id === targetId);
      if (existing) {
        existing.quantity = newQty;
      } else {
        return res.status(404).json({
          success: false,
          error: `Item with id ${targetId} not found in cart.`
        });
      }
    }

    await saveCart(sessionKey, cart);
    const totals = calculateCartTotals(cart.items, cart.fulfillmentMode);

    return res.status(200).json({
      success: true,
      message: 'Cart item quantity updated successfully.',
      data: {
        sessionId: cart.sessionId,
        items: cart.items,
        fulfillmentMode: cart.fulfillmentMode,
        pricing: totals,
        itemCount: totals.itemCount,
        totalQuantity: totals.totalQuantity
      }
    });
  } catch (error) {
    console.error('[updateCartItemQuantity] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to update item quantity.'
    });
  }
};

/**
 * @route   POST /api/cart/remove
 * @desc    Remove an item from the cart
 */
export const removeCartItem = async (req, res) => {
  try {
    const targetId = req.body.id || req.params.id;

    if (!targetId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required to remove item from cart.'
      });
    }

    const sessionKey = getSessionKey(req);
    const cart = await getOrCreateCart(req);

    cart.items = cart.items.filter((item) => item.id !== targetId);

    await saveCart(sessionKey, cart);
    const totals = calculateCartTotals(cart.items, cart.fulfillmentMode);

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
      data: {
        sessionId: cart.sessionId,
        items: cart.items,
        fulfillmentMode: cart.fulfillmentMode,
        pricing: totals,
        itemCount: totals.itemCount,
        totalQuantity: totals.totalQuantity
      }
    });
  } catch (error) {
    console.error('[removeCartItem] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to remove item from cart.'
    });
  }
};

/**
 * @route   POST /api/cart/clear
 * @desc    Clear all items in the cart
 */
export const clearCart = async (req, res) => {
  try {
    const sessionKey = getSessionKey(req);
    const cart = await getOrCreateCart(req);

    cart.items = [];

    await saveCart(sessionKey, cart);
    const totals = calculateCartTotals(cart.items, cart.fulfillmentMode);

    return res.status(200).json({
      success: true,
      message: 'Cart has been cleared.',
      data: {
        sessionId: cart.sessionId,
        items: [],
        fulfillmentMode: cart.fulfillmentMode,
        pricing: totals,
        itemCount: 0,
        totalQuantity: 0
      }
    });
  } catch (error) {
    console.error('[clearCart] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to clear cart.'
    });
  }
};

/**
 * @route   POST /api/cart/fulfillment
 * @desc    Update shipping & fulfillment mode
 */
export const updateFulfillmentMode = async (req, res) => {
  try {
    const { fulfillmentMode } = req.body;

    if (!fulfillmentMode || !['digital', 'assisted'].includes(fulfillmentMode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid fulfillment mode. Allowed options: "digital" or "assisted".'
      });
    }

    const sessionKey = getSessionKey(req);
    const cart = await getOrCreateCart(req);

    cart.fulfillmentMode = fulfillmentMode;

    await saveCart(sessionKey, cart);
    const totals = calculateCartTotals(cart.items, cart.fulfillmentMode);

    return res.status(200).json({
      success: true,
      message: `Fulfillment mode updated to ${fulfillmentMode}.`,
      data: {
        sessionId: cart.sessionId,
        items: cart.items,
        fulfillmentMode: cart.fulfillmentMode,
        pricing: totals,
        itemCount: totals.itemCount,
        totalQuantity: totals.totalQuantity
      }
    });
  } catch (error) {
    console.error('[updateFulfillmentMode] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to update fulfillment mode.'
    });
  }
};

/**
 * @route   GET /api/cart/addons
 * @desc    Get recommended enterprise add-ons catalog
 */
export const getCartAddons = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        addons: SYSTEM_ADDONS,
        total: SYSTEM_ADDONS.length
      }
    });
  } catch (error) {
    console.error('[getCartAddons] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve add-ons.'
    });
  }
};
