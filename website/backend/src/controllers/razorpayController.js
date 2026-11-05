import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import RazorpayOrder from '../models/RazorpayOrder.js';
import { env } from '../config/env.js';
import {
  buildAccountScope,
  mapPayment,
  quotePortalCharge,
  settlePortalCharge
} from './portalController.js';
import {
  createGatewayOrder,
  fetchGatewayPayment,
  isRazorpayConfigured,
  MAX_GATEWAY_RUPEES,
  verifyOrderSignature,
  verifyWebhookSignature
} from '../services/razorpayService.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

const withStatus = (statusCode, message) => Object.assign(new Error(message), { statusCode });

const sendError = (res, status, error) => res.status(status).json({ success: false, error });

const MERCHANT_NAME = 'Net Infotech System Pvt. Ltd.';

// The browser only ever sends a hint about which button the customer came in
// through; Razorpay itself decides the final instrument inside its own window.
const METHOD_HINTS = {
  upi: 'Razorpay — UPI',
  card: 'Razorpay — Card',
  netbanking: 'Razorpay — Net Banking',
  wallet: 'Razorpay — Wallet',
  emi: 'Razorpay — EMI'
};

const gatewayMethodLabel = (hint) =>
  METHOD_HINTS[String(hint || '').toLowerCase()] || 'Razorpay';

const newIntentId = () =>
  `NIS-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

const invoiceNumbersOf = (data) => {
  const rows = Array.isArray(data?.payments) ? data.payments : [data?.payment].filter(Boolean);
  return rows.map((row) => row.invoiceNumber).filter(Boolean);
};

const stampGatewayRefs = async (invoiceNumbers, { orderId, paymentId }) => {
  if (!invoiceNumbers.length) return;
  await Payment.updateMany(
    { invoiceNumber: { $in: invoiceNumbers } },
    { $set: { razorpayOrderId: orderId, razorpayPaymentId: paymentId } }
  );
};

/** The receipt the checkout page shows, rebuilt from an intent already settled. */
const receiptOfIntent = async (intent) => {
  const rows = await Payment.find({ invoiceNumber: { $in: intent.invoiceNumbers || [] } });
  const payments = await Promise.all(rows.map((row) => mapPayment(row.toObject())));

  return {
    alreadySettled: true,
    payment: payments[0] || null,
    payments,
    totals: { total: intent.amount },
    gateway: { orderId: intent.orderId, paymentId: intent.paymentId }
  };
};

/**
 * Claims an intent so exactly one of {browser verify, webhook} writes the
 * ledger. Returns null when another path already owns or finished it.
 */
const claimIntent = async (intent) =>
  RazorpayOrder.findOneAndUpdate(
    { _id: intent._id, status: 'created' },
    { $set: { status: 'processing' } },
    { new: true }
  );

const releaseIntent = (intent, reason) =>
  RazorpayOrder.updateOne(
    { _id: intent._id, status: 'processing' },
    { $set: { status: 'created', failureReason: reason } }
  );

/**
 * Settles a claimed intent onto the ledger with the quote it was priced from,
 * then records the gateway references on both the intent and the payment rows.
 */
const settleIntent = async ({ intent, user, customer, scope, paymentId, method }) => {
  const finalMethod = method || intent.method || 'Razorpay';

  try {
    const { data } = await settlePortalCharge({ user, customer, scope, quote: intent.quote, method: finalMethod });
    const invoiceNumbers = invoiceNumbersOf(data);

    await stampGatewayRefs(invoiceNumbers, { orderId: intent.orderId, paymentId });

    await RazorpayOrder.updateOne(
      { _id: intent._id },
      {
        $set: {
          status: 'paid',
          paymentId,
          method: finalMethod,
          invoiceNumbers,
          paidAt: new Date(),
          failureReason: ''
        }
      }
    );

    return { ...data, gateway: { orderId: intent.orderId, paymentId } };
  } catch (err) {
    // The money is already with the merchant, so the intent goes back to the
    // queue instead of being marked failed — the next retry must still write it.
    await releaseIntent(intent, `settle_failed: ${err.message}`);
    throw err;
  }
};

/**
 * Asks Razorpay for the payment so the ledger records the instrument the
 * customer actually used. A gateway call that fails only loses the label
 * detail — the signature check above is what authorises the settlement.
 */
const inspectGatewayPayment = async (paymentId) => {
  try {
    const payment = await fetchGatewayPayment(paymentId);
    return {
      isCaptured: ['captured', 'succeeded'].includes(String(payment?.status || '').toLowerCase()),
      method: payment?.method ? gatewayMethodLabel(payment.method) : ''
    };
  } catch {
    return null;
  }
};

const waitForIntentToFinish = async (intent, timeoutMs = 5000) => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const current = await RazorpayOrder.findById(intent._id).lean();
    if (current?.status === 'paid') return current;
    if (current?.status === 'created') return null;
  }

  return null;
};

/* ── GET /config ──────────────────────────────────────────────────────────
   The publishable id only. The key secret never leaves this server.
───────────────────────────────────────────────────────────────────────── */
export const getRazorpayConfig = (req, res) => {
  const enabled = isRazorpayConfigured();

  res.json({
    success: true,
    data: {
      enabled,
      keyId: enabled ? env.RAZORPAY_KEY_ID : null,
      currency: env.RAZORPAY_CURRENCY,
      maxAmount: MAX_GATEWAY_RUPEES,
      name: MERCHANT_NAME
    }
  });
};

/* ── POST /order ──────────────────────────────────────────────────────────
   Prices what the account owes and opens a gateway order for exactly that.
───────────────────────────────────────────────────────────────────────── */
export const createRazorpayOrder = async (req, res) => {
  try {
    if (!isRazorpayConfigured()) {
      return sendError(res, 503, 'Online card, UPI and net banking payments are not enabled yet.');
    }
    if (!isMongoConnected()) {
      return sendError(res, 503, 'Payments need the ledger database, which is offline right now.');
    }

    const user = req.user;
    const { scope } = await buildAccountScope(user);
    const quote = await quotePortalCharge({ user, req, body: req.body, scope });

    if (quote.alreadySettled || quote.amount <= 0) {
      return sendError(res, 409, 'That invoice is already settled — there is nothing left to pay.');
    }

    const intentId = newIntentId();
    const gatewayOrder = await createGatewayOrder({
      amount: quote.amount,
      receipt: intentId,
      notes: { intent: intentId, mode: quote.mode }
    });

    await RazorpayOrder.create({
      intentId,
      orderId: gatewayOrder.id,
      user: user._id,
      email: user.email || '',
      mode: quote.mode,
      label: quote.label,
      amount: quote.amount,
      currency: gatewayOrder.currency || env.RAZORPAY_CURRENCY,
      quote: { mode: quote.mode, amount: quote.amount, label: quote.label, snapshot: quote.snapshot },
      method: gatewayMethodLabel(req.body?.method)
    });

    res.status(201).json({
      success: true,
      data: {
        intentId,
        orderId: gatewayOrder.id,
        amount: quote.amount,
        amountInPaise: gatewayOrder.amount,
        currency: gatewayOrder.currency || env.RAZORPAY_CURRENCY,
        label: quote.label,
        keyId: env.RAZORPAY_KEY_ID,
        name: MERCHANT_NAME,
        prefill: {
          name: user.name || user.company || user.email || '',
          email: user.email || '',
          contact: String(user.phone || user.mobile || '').replace(/\D/g, '').slice(-10)
        }
      }
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    sendError(res, err.statusCode || 500, err.message || 'Could not start the payment.');
  }
};

/* ── POST /verify ─────────────────────────────────────────────────────────
   The browser hands over what Razorpay signed. Nothing is written unless the
   HMAC matches this server's own copy of the secret.
───────────────────────────────────────────────────────────────────────── */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const orderId = String(req.body?.razorpay_order_id || '').trim();
    const paymentId = String(req.body?.razorpay_payment_id || '').trim();
    const signature = String(req.body?.razorpay_signature || '').trim();

    if (!orderId || !paymentId || !signature) {
      return sendError(res, 400, 'The payment response is incomplete.');
    }

    const intent = await RazorpayOrder.findOne({ orderId, user: req.user._id });
    if (!intent) return sendError(res, 404, 'That payment order is not on your account.');

    if (intent.status === 'paid') {
      return res.json({ success: true, data: await receiptOfIntent(intent) });
    }

    if (!verifyOrderSignature({ orderId, paymentId, signature })) {
      intent.status = 'failed';
      intent.paymentId = paymentId;
      intent.failureReason = 'signature_mismatch';
      await intent.save();

      return sendError(
        res,
        400,
        `Razorpay could not verify this transaction, so it has not been recorded${
          paymentId ? ` (payment reference ${paymentId})` : ''
        }. Please try again or contact support.`
      );
    }

    const gatewayPayment = await inspectGatewayPayment(paymentId);

    if (gatewayPayment && !gatewayPayment.isCaptured) {
      // Authorized but not yet captured — the ledger must not say "Paid".
      // Leaving the intent open lets the capture webhook settle it later.
      return res.status(202).json({
        success: false,
        error:
          'Razorpay has accepted your payment and is completing the transfer. It will appear on your account ledger in a moment.'
      });
    }

    const claimed = await claimIntent(intent);

    if (!claimed) {
      // The webhook usually lands within a second of capture. Wait briefly for
      // it so the customer still sees the receipt instead of a queue message.
      const finished = await waitForIntentToFinish(intent);
      if (!finished) {
        return res.status(202).json({
          success: false,
          error:
            'Your payment is confirmed with Razorpay and is being written to your account ledger. Please refresh in a moment.'
        });
      }
      return res.json({ success: true, data: await receiptOfIntent(finished) });
    }

    const { customer, scope } = await buildAccountScope(req.user);
    const data = await settleIntent({
      intent: claimed,
      user: req.user,
      customer,
      scope,
      paymentId,
      method: gatewayPayment?.method
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error verifying Razorpay payment:', err);
    sendError(res, err.statusCode || 500, err.message || 'Could not confirm your payment.');
  }
};

/* ── POST /webhook ────────────────────────────────────────────────────────
   Razorpay's own copy of the truth. It covers the tab-closed-mid-payment case
   the browser callback can never see, so it must run on the raw request bytes.
───────────────────────────────────────────────────────────────────────── */
export const razorpayWebhookHandler = async (req, res) => {
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    return sendError(res, 503, 'The Razorpay webhook secret is not configured on this server.');
  }

  const signature = req.headers['x-razorpay-signature'];
  if (!verifyWebhookSignature(req.body, signature)) {
    return sendError(res, 400, 'Invalid webhook signature.');
  }

  let event;
  try {
    event = JSON.parse(Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body));
  } catch {
    return sendError(res, 400, 'Webhook payload is not valid JSON.');
  }

  // Answer the retry queue first: everything below is idempotent by intent.
  res.status(200).json({ success: true });

  try {
    const payment = event?.payload?.payment?.entity || {};
    const orderId = payment.order_id || event?.payload?.order?.entity?.id || '';
    if (!orderId) return;

    const intent = await RazorpayOrder.findOne({ orderId });
    if (!intent || intent.status === 'paid') return;

    if (['payment.failed', 'payment.bounced'].includes(event.event)) {
      await RazorpayOrder.updateOne(
        { _id: intent._id, status: { $ne: 'paid' } },
        { $set: { status: 'failed', paymentId: payment.id || '', failureReason: payment.error_description || event.event } }
      );
      return;
    }

    // Anything short of capture (payment.created/processing/authorized) must
    // not mark an invoice paid; the capture event or the browser verify does.
    if (!['payment.captured', 'order.paid'].includes(event.event)) return;
    if (payment.status && payment.status !== 'captured') return;

    const claimed = await claimIntent(intent);
    if (!claimed) return;

    const user = await User.findById(intent.user);
    if (!user) {
      await releaseIntent(intent, 'user_not_found');
      console.error('[Razorpay webhook] intent', intent.intentId, 'has no user behind it');
      return;
    }

    const { customer, scope } = await buildAccountScope(user);
    await settleIntent({
      intent: claimed,
      user,
      customer,
      scope,
      paymentId: payment.id || '',
      method: payment.method ? gatewayMethodLabel(payment.method) : ''
    });
  } catch (err) {
    console.error('[Razorpay webhook] could not settle the event:', err);
  }
};
