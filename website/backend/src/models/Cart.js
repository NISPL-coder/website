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
    image: { type: String, default: '' }
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
