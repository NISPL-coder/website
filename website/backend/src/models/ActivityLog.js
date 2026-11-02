import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  adminName: { type: String, required: true, trim: true },
  adminEmail: { type: String, required: true, lowercase: true, trim: true },
  adminRole: { type: String, default: 'admin', index: true },
  action: { type: String, required: true, index: true },
  category: {
    type: String,
    enum: ['staff', 'customer', 'contract', 'payment', 'product', 'auth', 'system', 'general'],
    default: 'general',
    index: true
  },
  resource: { type: String, default: '' },
  resourceId: { type: String, default: '' },
  details: { type: String, required: true },
  ipAddress: { type: String, default: '127.0.0.1' },
  userAgent: { type: String, default: '' },
  status: { type: String, enum: ['success', 'failed', 'warning'], default: 'success' },
  changes: { type: mongoose.Schema.Types.Mixed, default: {} }
}, {
  timestamps: true
});

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ adminEmail: 1, createdAt: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);

