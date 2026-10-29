import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../data/users.json');

// File-backed persistence helpers for offline resilience
export const getUsersFromFile = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[User] Error reading users.json:', e.message);
  }
  return [];
};

export const saveUsersToFile = (list) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[User] Error writing to users.json:', e.message);
  }
};

const wrapUserObj = (user) => {
  if (!user) return null;
  return {
    ...user,
    id: user.customerId || user._id,
    comparePassword: async function (candidate) {
      if (!candidate || !this.password) return false;
      return bcrypt.compare(candidate, this.password);
    },
    sanitize: function () {
      const { password, __v, ...safe } = this;
      return safe;
    },
    toJSON: function () {
      const { password, __v, ...safe } = this;
      return safe;
    }
  };
};

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

// Static: Find by Email (case-insensitive with offline fallback)
userSchema.statics.findByEmail = async function (email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();

  if (mongoose.connection.readyState === 1) {
    try {
      const doc = await this.findOne({ email: cleanEmail });
      if (doc) return doc;
    } catch (e) {
      console.warn('[User.findByEmail] MongoDB read failed, checking local storage:', e.message);
    }
  }

  const list = getUsersFromFile();
  const found = list.find((u) => u.email && u.email.toLowerCase() === cleanEmail);
  return wrapUserObj(found);
};

// Static: Find by Customer ID / ID with offline fallback
userSchema.statics.findByCustomerId = async function (customerId) {
  if (!customerId) return null;
  const cleanId = customerId.trim().toUpperCase();

  if (mongoose.connection.readyState === 1) {
    try {
      const doc = await this.findOne({ customerId: cleanId });
      if (doc) return doc;
    } catch (e) {
      console.warn('[User.findByCustomerId] MongoDB read failed, checking local storage:', e.message);
    }
  }

  const list = getUsersFromFile();
  const found = list.find((u) => u.customerId && u.customerId.toUpperCase() === cleanId);
  return wrapUserObj(found);
};

// Static: Find by ID (supports MongoDB _id or custom customerId)
userSchema.statics.findById = async function (id) {
  if (!id) return null;
  const clean = String(id).trim();

  if (mongoose.connection.readyState === 1) {
    try {
      if (mongoose.Types.ObjectId.isValid(clean)) {
        const doc = await this.findOne({ $or: [{ _id: clean }, { customerId: clean.toUpperCase() }] });
        if (doc) return doc;
      } else {
        const doc = await this.findOne({ customerId: clean.toUpperCase() });
        if (doc) return doc;
      }
    } catch (e) {
      console.warn('[User.findById] MongoDB read failed, checking local storage:', e.message);
    }
  }

  const list = getUsersFromFile();
  const found = list.find(
    (u) => (u.customerId && u.customerId.toUpperCase() === clean.toUpperCase()) || u.id === clean || u._id === clean
  );
  return wrapUserObj(found);
};

// Static: Find by Email OR Customer ID
userSchema.statics.findByEmailOrCustomerId = async function (identifier) {
  if (!identifier) return null;
  const clean = identifier.trim();
  if (clean.includes('@')) {
    return this.findByEmail(clean);
  }
  return this.findByCustomerId(clean);
};

// Static: Find by GST No with offline fallback
userSchema.statics.findByGstNo = async function (gstNo) {
  if (!gstNo) return null;
  const cleanGst = gstNo.trim().toUpperCase();

  if (mongoose.connection.readyState === 1) {
    try {
      const doc = await this.findOne({ gstNo: cleanGst });
      if (doc) return doc;
    } catch (e) {
      console.warn('[User.findByGstNo] MongoDB read failed, checking local storage:', e.message);
    }
  }

  const list = getUsersFromFile();
  const found = list.find((u) => u.gstNo && u.gstNo.toUpperCase() === cleanGst);
  return wrapUserObj(found);
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
  const fileUsers = getUsersFromFile();
  while (exists) {
    const rand = Math.floor(100000 + Math.random() * 900000);
    customerId = `NIS-CUST-${rand}`;
    if (mongoose.connection.readyState === 1) {
      try {
        const found = await this.findOne({ customerId });
        if (!found) exists = false;
      } catch {
        exists = fileUsers.some((u) => u.customerId === customerId);
      }
    } else {
      exists = fileUsers.some((u) => u.customerId === customerId);
    }
  }

  const now = new Date();
  const companyClean = (userData.companyName || 'client').trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  // Hash password with bcryptjs
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  const newUserData = {
    customerId,
    name: userData.name.trim(),
    email: cleanEmail,
    mobile: userData.mobile.trim(),
    companyName: userData.companyName ? userData.companyName.trim() : '',
    companyLogo: userData.companyLogo ? userData.companyLogo.trim() : '',
    gstNo: userData.gstNo ? userData.gstNo.trim().toUpperCase() : '',
    password: hashedPassword,
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
  };

  // If MongoDB Atlas is connected, save directly to Atlas
  if (mongoose.connection.readyState === 1) {
    try {
      const userDoc = new this(newUserData);
      await userDoc.save();
    } catch (saveErr) {
      console.warn('[User.createUser] MongoDB save failed, persisting locally:', saveErr.message);
    }
  }

  // Always mirror to users.json for instant offline backup & resilience
  const updatedList = getUsersFromFile();
  const safeJsonUser = { ...newUserData, id: customerId };
  updatedList.push(safeJsonUser);
  saveUsersToFile(updatedList);

  const { password, ...safeResponse } = safeJsonUser;
  return safeResponse;
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
    if (mongoose.connection.readyState !== 1) return;

    const count = await this.countDocuments();
    if (count > 0) return;

    const seedList = getUsersFromFile();
    if (Array.isArray(seedList) && seedList.length > 0) {
      console.log(`[MongoDB] Seeding ${seedList.length} initial user records into MongoDB Atlas...`);
      for (const item of seedList) {
        const { id, _id, ...userData } = item;
        const userDoc = new this(userData);
        await userDoc.save();
      }
      console.log('[MongoDB] Seed completed successfully.');
    }
  } catch (error) {
    console.error('[MongoDB] Error during default users seed:', error.message);
  }
};

export const User = mongoose.model('User', userSchema);
export default User;
