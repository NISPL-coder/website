import Cart from '../models/Cart.js';
import User from '../models/User.js';
import { verifyAccessToken } from '../utils/tokens.js';
import { HttpError } from '../utils/httpError.js';

const GST_RATE = 0.18;
const GUEST_SESSION_ID = 'default_cart_session';
const MAX_LINE_QUANTITY = 99;

/**
 * The browser keeps one cart per session id; anything unusable falls back to the
 * shared guest bucket rather than throwing, so checkout never dead-ends.
 */
function resolveSessionId(req) {
  const raw = String(req.headers['x-session-id'] || req.query.sessionId || '').trim();
  if (!raw || raw.length > 64 || !/^[A-Za-z0-9_-]+$/.test(raw)) return GUEST_SESSION_ID;
  return raw;
}

/**
 * Attach the signed-in account to the cart when a valid token is presented.
 * A guest cart must still work, so verification failures are not fatal here.
 */
async function resolveAccount(req) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token || token === 'null' || token === 'undefined') return null;

    const decoded = verifyAccessToken(token);
    if (!decoded?.sub) return null;

    const user = await User.findById(decoded.sub).select('email company').lean();
    if (!user) return null;

    return {
      userId: user._id,
      email: String(user.email || '').toLowerCase(),
      company: user.company || ''
    };
  } catch {
    return null;
  }
}

const round = (value) => Math.round(Number(value) || 0);

const text = (value, max = 200) => String(value ?? '').trim().slice(0, max);

// Only a real ISO day is stored; anything else is dropped rather than guessed,
// so a receipt can never show a date the ledger cannot parse.
const isoDay = (value) => {
  const raw = text(value, 20);
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : '';
};

/**
 * What the New Subscription form actually collected. These travel with the
 * cart line so the payment written at settlement describes the purchase as it
 * was made, not as the catalogue reads on the day the receipt is opened.
 */
function subscriptionDetails(body = {}) {
  return {
    planId: text(body.planId),
    planName: text(body.planName),
    product: text(body.product),
    unitPrice: Math.max(round(body.unitPrice), 0),
    planQuantity: Math.min(Math.max(round(body.planQuantity) || 1, 1), MAX_LINE_QUANTITY),
    duration: text(body.duration, 60),
    durationMonths: Math.max(round(body.durationMonths), 0),
    startDate: isoDay(body.startDate),
    endDate: isoDay(body.endDate),
    description: text(body.description, 500),
    salesPerson: text(body.salesPerson, 120),
    users: Math.max(round(body.users), 0),
    serverConfiguration: text(body.serverConfiguration, 120)
  };
}

function withTotals(cart) {
  const items = (cart?.items || []).map((item) => ({
    id: item.productId,
    productId: item.productId,
    name: item.name,
    basePrice: item.basePrice,
    finalPrice: item.finalPrice,
    quantity: item.quantity,
    sku: item.sku,
    category: item.category,
    billingCycle: item.billingCycle,
    image: item.image,
    planId: item.planId,
    planName: item.planName,
    product: item.product,
    unitPrice: item.unitPrice,
    planQuantity: item.planQuantity,
    duration: item.duration,
    durationMonths: item.durationMonths,
    startDate: item.startDate,
    endDate: item.endDate,
    description: item.description,
    salesPerson: item.salesPerson,
    users: item.users,
    serverConfiguration: item.serverConfiguration
  }));

  const subtotal = round(items.reduce((sum, item) => sum + item.basePrice * item.quantity, 0));
  const gstAmount = round(subtotal * GST_RATE);

  return {
    items,
    fulfillmentMode: cart?.fulfillmentMode || 'digital',
    summary: {
      distinctItems: items.length,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      gstRate: GST_RATE,
      gstAmount,
      grandTotal: subtotal + gstAmount
    },
    updatedAt: cart?.updatedAt || null
  };
}

async function loadCart(sessionId) {
  return Cart.findOne({ sessionId });
}

/**
 * Current cart for this session. An unseen session reports an empty cart without
 * writing a document, so browsing alone never fills the collection.
 */
export async function getCart(req, res) {
  const cart = await loadCart(resolveSessionId(req));
  res.json({ success: true, data: withTotals(cart) });
}

/**
 * Add a catalogue item, or raise the quantity when it is already in the cart
 */
export async function addItem(req, res) {
  const sessionId = resolveSessionId(req);
  const body = req.body || {};
  const {
    id,
    name,
    basePrice,
    quantity,
    sku = '',
    category = '',
    billingCycle = '',
    image = ''
  } = body;

  if (!id || !name) throw new HttpError(400, 'Product id and name are required.');

  const unitPrice = round(basePrice);
  if (unitPrice < 0) throw new HttpError(400, 'Product price is invalid.');

  const requestedQty = Math.min(Math.max(round(quantity) || 1, 1), MAX_LINE_QUANTITY);
  const details = subscriptionDetails({ ...body, planId: body.planId || body.productId });

  const cart = (await loadCart(sessionId)) || new Cart({ sessionId });
  const account = await resolveAccount(req);
  if (account) cart.account = account;

  const existing = cart.items.find((item) => item.productId === String(id));
  if (existing) {
    existing.quantity = Math.min(existing.quantity + requestedQty, MAX_LINE_QUANTITY);
    // A re-priced plan (different billing cycle) replaces the stored quote
    existing.basePrice = unitPrice;
    existing.finalPrice = round(unitPrice * (1 + GST_RATE));
    if (billingCycle) existing.billingCycle = String(billingCycle);
    if (category) existing.category = String(category);
    Object.assign(existing, details);
  } else {
    cart.items.push({
      productId: String(id),
      name: String(name),
      basePrice: unitPrice,
      finalPrice: round(unitPrice * (1 + GST_RATE)),
      quantity: requestedQty,
      sku: String(sku),
      category: String(category),
      billingCycle: String(billingCycle),
      image: String(image),
      ...details
    });
  }

  await cart.save();
  res.status(201).json({ success: true, data: withTotals(cart) });
}

/**
 * Mongoose's array pull() does not accept a predicate, so lines are dropped by
 * reassigning the filtered array.
 */
function dropLine(cart, productId) {
  cart.items = cart.items.filter((item) => item.productId !== productId);
  cart.markModified('items');
}

/**
 * Set the quantity of one line; zero removes it
 */
export async function updateQuantity(req, res) {
  const sessionId = resolveSessionId(req);
  const { id, quantity } = req.body || {};
  if (!id) throw new HttpError(400, 'Product id is required.');

  const cart = await loadCart(sessionId);
  if (!cart) throw new HttpError(404, 'Cart not found.');

  const productId = String(id);
  const nextQuantity = round(quantity);

  if (nextQuantity <= 0) {
    dropLine(cart, productId);
  } else {
    const line = cart.items.find((item) => item.productId === productId);
    if (!line) throw new HttpError(404, 'Item is not in the cart.');
    line.quantity = Math.min(nextQuantity, MAX_LINE_QUANTITY);
  }

  await cart.save();
  res.json({ success: true, data: withTotals(cart) });
}

export async function removeItem(req, res) {
  const sessionId = resolveSessionId(req);
  const { id } = req.body || {};
  if (!id) throw new HttpError(400, 'Product id is required.');

  const cart = await loadCart(sessionId);
  if (!cart) throw new HttpError(404, 'Cart not found.');

  dropLine(cart, String(id));
  await cart.save();

  res.json({ success: true, data: withTotals(cart) });
}

export async function clearCart(req, res) {
  const sessionId = resolveSessionId(req);
  const cart = await loadCart(sessionId);

  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.json({ success: true, data: withTotals(cart) });
}

export async function updateFulfillment(req, res) {
  const sessionId = resolveSessionId(req);
  const { fulfillmentMode } = req.body || {};

  if (!['digital', 'assisted'].includes(fulfillmentMode)) {
    throw new HttpError(400, 'Fulfillment mode must be digital or assisted.');
  }

  const cart = (await loadCart(sessionId)) || new Cart({ sessionId });
  cart.fulfillmentMode = fulfillmentMode;
  await cart.save();

  res.json({ success: true, data: withTotals(cart) });
}

/**
 * Add-ons are sold from the product catalogue, which is not in the database yet,
 * so the API reports none rather than inventing prices the business has not set.
 */
export async function getAddons(req, res) {
  res.json({ success: true, data: { addons: [] } });
}
