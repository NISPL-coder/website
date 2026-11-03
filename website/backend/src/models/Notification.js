import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'payment_received',
        'payment_created',
        'payment_updated',
        'payment_deleted',
        'payment_due_soon',
        'payment_due',
        'customer_created',
        'customer_updated',
        'customer_deleted',
        'customer_registered',
        'customer_query',
        'support_ticket',
        'contract_created',
        'contract_updated',
        'contract_deleted',
        'contract_renewal',
        'product_created',
        'product_updated',
        'product_deleted',
        'receipt_created',
        'admin_created',
        'staff_created',
        'system'
      ],
      default: 'system',
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info'
    },
    entityType: {
      type: String,
      enum: ['customer', 'contract', 'payment', 'product', 'receipt', 'user', 'admin', 'other'],
      default: 'other'
    },
    entityId: {
      type: String,
      default: ''
    },
    // Which user/customer was involved or received from
    user: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      role: { type: String, default: '' },
      company: { type: String, default: '' }
    },
    // Extra details (amount, payment method, invoice number, renewalDate, etc.)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
