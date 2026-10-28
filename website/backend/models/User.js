import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const userSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Corporate email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    companyLogo: {
      type: String,
      default: '',
      trim: true
    },
    gstNo: {
      type: String,
      trim: true,
      uppercase: true,
      default: ''
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: ['customer', 'partner', 'admin'],
      default: 'customer',
      index: true
    },
    accountStatus: {
      type: String,
      enum: ['Active', 'Suspended', 'Pending'],
      default: 'Active'
    },
    tier: {
      type: String,
      default: 'Enterprise Cloud Customer'
    },
    createdFormattedDate: {
      type: String
    },
    cloudInstance: {
      serverName: { type: String, default: 'cloud-node-01' },
      ipAddress: { type: String, default: '103.145.42.100' },
      rdpPort: { type: Number, default: 3389 },
      webPort: { type: Number, default: 8443 },
      status: { type: String, default: 'Online' },
      ram: { type: String, default: '8 GB DDR4 Dedicated' },
      cpu: { type: String, default: '4 vCPU (Intel Xeon)' },
      storage: { type: String, default: '100 GB NVMe SSD' },
      tallyPrimeVersion: { type: String, default: 'Release 5.0 (Latest 64-Bit)' },
      tssStatus: { type: String, default: 'Active' }
    },
    stats: {
      activeLicenses: { type: Number, default: 1 },
      totalUsers: { type: Number, default: 2 },
      cloudUptime: { type: String, default: '99.98%' },
      openTickets: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret.customerId || ret._id;
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Pre-save hook: Hash password with bcryptjs before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  // If password is already a bcrypt hash (starts with $2a$ or $2b$), don't double hash
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method: compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method: sanitize (remove password)
userSchema.methods.sanitize = function () {
  return this.toJSON();
};

// Static: Find by Email (case-insensitive)
userSchema.statics.findByEmail = function (email) {
  if (!email) return null;
  return this.findOne({ email: email.trim().toLowerCase() });
};

// Static: Find by Customer ID / ID
userSchema.statics.findByCustomerId = function (customerId) {
  if (!customerId) return null;
  const cleanId = customerId.trim().toUpperCase();
  return this.findOne({ customerId: cleanId });
};

// Static: Find by ID (supports MongoDB _id or custom customerId)
userSchema.statics.findById = function (id) {
  if (!id) return null;
  const clean = String(id).trim();
  if (mongoose.Types.ObjectId.isValid(clean)) {
    return this.findOne({ $or: [{ _id: clean }, { customerId: clean.toUpperCase() }] });
  }
  return this.findOne({ customerId: clean.toUpperCase() });
};

// Static: Find by Email OR Customer ID
userSchema.statics.findByEmailOrCustomerId = function (identifier) {
  if (!identifier) return null;
  const clean = identifier.trim();
  if (clean.includes('@')) {
    return this.findByEmail(clean);
  }
  return this.findOne({
    $or: [
      { customerId: clean.toUpperCase() },
      { email: clean.toLowerCase() }
    ]
  });
};

// Static: Find by GST No
userSchema.statics.findByGstNo = function (gstNo) {
  if (!gstNo) return null;
  return this.findOne({ gstNo: gstNo.trim().toUpperCase() });
};

// Static: Create customer with generated customerId & default cloud specs
userSchema.statics.createUser = async function (userData) {
  const cleanEmail = userData.email.trim().toLowerCase();

  // Check email uniqueness
  const existing = await this.findByEmail(cleanEmail);
  if (existing) {
    const err = new Error('An account with this email address already exists.');
    err.statusCode = 409;
    throw err;
  }

  // Check GST uniqueness if provided
  if (userData.gstNo && userData.gstNo.trim()) {
    const cleanGst = userData.gstNo.trim().toUpperCase();
    const existingGst = await this.findByGstNo(cleanGst);
    if (existingGst) {
      const err = new Error('An account with this GSTIN is already registered.');
      err.statusCode = 409;
      throw err;
    }
  }

  // Generate unique Customer ID
  let customerId;
  let exists = true;
  while (exists) {
    const rand = Math.floor(100000 + Math.random() * 900000);
    customerId = `NIS-CUST-${rand}`;
    const found = await this.findOne({ customerId });
    if (!found) exists = false;
  }

  const now = new Date();
  const companyClean = (userData.companyName || 'client').trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  const user = new this({
    customerId,
    name: userData.name.trim(),
    email: cleanEmail,
    mobile: userData.mobile.trim(),
    companyName: userData.companyName ? userData.companyName.trim() : '',
    companyLogo: userData.companyLogo ? userData.companyLogo.trim() : '',
    gstNo: userData.gstNo ? userData.gstNo.trim().toUpperCase() : '',
    password: userData.password,
    role: userData.role || 'customer',
    accountStatus: 'Active',
    tier: userData.role === 'admin'
      ? 'Infrastructure & NOC Systems Administrator'
      : userData.role === 'partner'
        ? 'Authorized Solution Partner'
        : 'Enterprise Cloud Customer',
    createdFormattedDate: now.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }),
    cloudInstance: {
      serverName: `${companyClean}-cloud-node1`,
      ipAddress: `103.145.${Math.floor(10 + Math.random() * 80)}.${Math.floor(10 + Math.random() * 200)}`,
      rdpPort: 3389,
      webPort: 8443,
      status: 'Online',
      ram: '8 GB DDR4 Dedicated',
      cpu: '4 vCPU (Intel Xeon)',
      storage: '100 GB NVMe SSD',
      tallyPrimeVersion: 'Release 5.0 (Latest 64-Bit)',
      tssStatus: 'Active'
    },
    stats: {
      activeLicenses: 1,
      totalUsers: 2,
      cloudUptime: '99.98%',
      openTickets: 0
    }
  });

  await user.save();

  // Also persist to users.json so local JSON database is kept in sync
  try {
    const dataFile = path.resolve(__dirname, '../data/users.json');
    if (fs.existsSync(dataFile)) {
      const raw = fs.readFileSync(dataFile, 'utf-8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        list.push(user.toJSON());
        fs.writeFileSync(dataFile, JSON.stringify(list, null, 2), 'utf-8');
      }
    }
  } catch (fsErr) {
    console.warn('[User] Error syncing to users.json:', fsErr.message);
  }

  return user.toJSON();
};

// Static helper to sanitize any user object/doc
userSchema.statics.sanitize = function (user) {
  if (!user) return null;
  if (typeof user.toJSON === 'function') {
    return user.toJSON();
  }
  const { password, __v, ...safe } = user;
  return safe;
};

// Seed initial default users if database collection is empty
userSchema.statics.seedDefaultUsers = async function () {
  try {
    const count = await this.countDocuments();
    if (count > 0) return;

    const dataFile = path.resolve(__dirname, '../data/users.json');
    if (fs.existsSync(dataFile)) {
      const content = fs.readFileSync(dataFile, 'utf-8');
      const seedList = JSON.parse(content);
      if (Array.isArray(seedList) && seedList.length > 0) {
        console.log(`[MongoDB] Seeding ${seedList.length} initial user records into MongoDB Atlas...`);
        for (const item of seedList) {
          const { id, _id, ...userData } = item;
          const userDoc = new this(userData);
          await userDoc.save();
        }
        console.log('[MongoDB] Seed completed successfully.');
      }
    }
  } catch (error) {
    console.error('[MongoDB] Error during default users seed:', error.message);
  }
};

export const User = mongoose.model('User', userSchema);
export default User;
