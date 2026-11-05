import mongoose from 'mongoose';

/*
 * One row per gateway order. The quote is stored with it so the money can be
 * taken first and written to the ledger afterwards — and so a retry, a webhook
 * or a customer who closes the tab cannot create, price or lose a payment.
 */
const razorpayOrderSchema = new mongoose.Schema(
  {
    intentId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    email: {
      type: String,
      default: ''
    },
    mode: {
      type: String,
      enum: ['invoice', 'dues', 'renewal', 'cart'],
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    // Rupees, not paise — every other amount in this app is rupees.
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    quote: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    status: {
      type: String,
      enum: ['created', 'processing', 'paid', 'failed'],
      default: 'created',
      index: true
    },
    paymentId: {
      type: String,
      default: ''
    },
    method: {
      type: String,
      default: ''
    },
    invoiceNumbers: {
      type: [String],
      default: []
    },
    failureReason: {
      type: String,
      default: ''
    },
    paidAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const RazorpayOrder = mongoose.model('RazorpayOrder', razorpayOrderSchema);
export default RazorpayOrder;
