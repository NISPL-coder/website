import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    // Catalogue identifier, e.g. ctrls-5-user
    productId: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    // Price for one unit of the chosen billing cycle, before GST
    basePrice: {
      type: Number,
      default: 0,
      min: 0
    },
    // basePrice + 18% GST, quoted by the API so the UI never re-invents pricing
    finalPrice: {
      type: Number,
      default: 0,
      min: 0
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
      max: 99
    },
    sku: { type: String, default: '' },
    category: { type: String, default: '' },
    billingCycle: { type: String, default: '' },
    image: { type: String, default: '' },

    // ── Create Order form, carried verbatim to the ledger ──────────────────
    // The form quotes one purchase whose line total already includes the units
    // bought and the months of the term, so `quantity` above stays the number
    // of such purchases in the cart and the ordered units are kept separately.
    // A distinct catalogue id would merge two terms of the same plan into one
    // line, so the line keeps its own id and the real plan is named here.
    planId: { type: String, default: '' },
    planName: { type: String, default: '' },
    product: { type: String, default: '' },
    unitPrice: { type: Number, default: 0, min: 0 },
    planQuantity: { type: Number, default: 1, min: 1, max: 99 },
    duration: { type: String, default: '' },
    durationMonths: { type: Number, default: 0, min: 0 },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    description: { type: String, default: '' },
    salesPerson: { type: String, default: '' },
    users: { type: Number, default: 0 },
    serverConfiguration: { type: String, default: '' }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    // Populated when the browser presents a valid access token; guest carts stay anonymous
    account: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      email: { type: String, default: '' },
      company: { type: String, default: '' }
    },
    items: {
      type: [cartItemSchema],
      default: []
    },
    fulfillmentMode: {
      type: String,
      enum: ['digital', 'assisted'],
      default: 'digital'
    }
  },
  {
    timestamps: true
  }
);

export const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
