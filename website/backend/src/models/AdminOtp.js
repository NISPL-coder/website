import mongoose from 'mongoose';

const adminOtpSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true,
    index: true 
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
}, { timestamps: true });

export default mongoose.model('AdminOtp', adminOtpSchema);

