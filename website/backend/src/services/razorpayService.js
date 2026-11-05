import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../config/env.js';

// Razorpay caps a single online transaction; anything larger goes by bank
// transfer. Exported so the checkout page can hide the gateway itself instead
// of letting the customer hit this error mid-payment.
export const MAX_GATEWAY_RUPEES = 2000000;
const MIN_RUPEES = 1;

let client = null;

export const isRazorpayConfigured = () => env.RAZORPAY_ENABLED;

const gatewayError = (statusCode, message) => Object.assign(new Error(message), { statusCode });

const getClient = () => {
  if (!isRazorpayConfigured()) {
    throw gatewayError(
      503,
      'Card, UPI and net banking payments are not configured on this server yet.'
    );
  }

  if (!client) {
    client = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET
    });
  }

  return client;
};

/**
 * Creates the gateway order for an amount the server already priced. The
 * gateway only ever sees rupees x 100, never a number the browser supplied.
 */
export const createGatewayOrder = async ({ amount, receipt, notes = {} }) => {
  const rupees = Math.round(Number(amount) || 0);

  if (rupees < MIN_RUPEES) {
    throw gatewayError(400, 'The amount to pay is below the ₹1 gateway minimum.');
  }
  if (rupees > MAX_GATEWAY_RUPEES) {
    throw gatewayError(
      400,
      `This payment is above the ₹${MAX_GATEWAY_RUPEES.toLocaleString('en-IN')} online limit. Please pay by bank transfer or contact support.`
    );
  }

  return getClient().orders.create({
    amount: rupees * 100,
    currency: env.RAZORPAY_CURRENCY,
    receipt: String(receipt).slice(0, 40),
    notes,
    payment_capture: 1
  });
};

export const fetchGatewayPayment = (paymentId) => getClient().payments.fetch(paymentId);

const hmacMatches = (secret, payload, signature) => {
  if (!secret || !payload || !signature) return false;

  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const received = Buffer.from(String(signature));
  const computed = Buffer.from(expected);

  // Same length first: timingSafeEqual throws otherwise, and the length itself
  // is not a secret worth protecting for a 64-character hex digest.
  return received.length === computed.length && crypto.timingSafeEqual(computed, received);
};

/** Proves the checkout handler came from Razorpay and was not edited in the browser. */
export const verifyOrderSignature = ({ orderId, paymentId, signature }) =>
  hmacMatches(env.RAZORPAY_KEY_SECRET, `${orderId}|${paymentId}`, signature);

/** Proves a webhook body is Razorpay's own, over the exact bytes it signed. */
export const verifyWebhookSignature = (rawBody, signature) =>
  hmacMatches(env.RAZORPAY_WEBHOOK_SECRET, rawBody, signature);
