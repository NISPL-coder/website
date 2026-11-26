import mongoose from 'mongoose';

const securityEventSchema = new mongoose.Schema(
  {
    ipAddress: { type: String, required: true, index: true, default: 'unknown' },
    country: { type: String, default: 'Unknown', index: true },
    requestUrl: { type: String, required: true },
    userAgent: { type: String, default: '' },
    method: { type: String, default: 'GET' },
    eventType: {
      type: String,
      required: true,
      index: true,
      enum: [
        'admin_login_failure',
        'customer_login_brute_force',
        'automated_bot',
        'api_scanning',
        'suspicious_admin_access',
        'auth_endpoint_probe',
        'sqli_attempt',
        'xss_attempt',
        'rate_limit_exceeded',
        'cloudflare_bypass',
        'turnstile_failed',
        'otp_failure',
        'password_reset_abuse'
      ]
    },
    cloudflareAction: {
      type: String,
      enum: ['allow', 'challenge', 'block', 'log'],
      default: 'log',
      index: true
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
      index: true
    },
    identifier: { type: String, default: '' },
    details: { type: String, default: '' },
    cfRay: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  {
    timestamps: true,
    collection: 'security_events'
  }
);

securityEventSchema.index({ timestamp: -1, riskLevel: 1 });

const SecurityEvent =
  mongoose.models.SecurityEvent || mongoose.model('SecurityEvent', securityEventSchema);

export default SecurityEvent;
