import mongoose from 'mongoose';

const emailVerificationOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    otpHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // Document auto-expires when expiresAt <= current date
    }
  },
  { timestamps: true }
);

export default mongoose.model('EmailVerificationOtp', emailVerificationOtpSchema);

