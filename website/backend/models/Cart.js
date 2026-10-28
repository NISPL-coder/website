import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    originalBasePrice: {
      type: Number,
      default: 0
    },
    finalPrice: {
      type: Number,
      default: 0
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1
    },
    sku: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      default: 'General'
    },
    billingCycle: {
      type: String,
      default: 'Annual'
    },
    duration: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    }
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    items: [cartItemSchema],
    fulfillmentMode: {
      type: String,
      enum: ['digital', 'assisted'],
      default: 'digital'
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  {
    timestamps: true
  }
);

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
export default Cart;
