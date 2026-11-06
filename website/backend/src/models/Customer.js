import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../data/customers.json');

export const getCustomersFromFile = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        return list;
      }
    }
  } catch (e) {
    console.warn('[CustomerModel] Error reading customers.json:', e.message);
  }
  return [];
};

export const saveCustomersToFile = (list) => {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(list || [], null, 2), 'utf-8');
  } catch (e) {
    console.warn('[CustomerModel] Error writing to customers.json:', e.message);
  }
};

const customerSchema = new mongoose.Schema(
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
      required: [true, 'Contact person name is required'],
      trim: true
    },
    // The form captures the person as two names plus a role; `name` above keeps
    // the joined value so every existing reader still has one string to show.
    firstName: { type: String, default: '', trim: true },
    lastName: { type: String, default: '', trim: true },
    designation: { type: String, default: '', trim: true },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: [true, 'Corporate email is required'],
      lowercase: true,
      trim: true,
      index: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true
    },
    alternatePhone: {
      type: String,
      trim: true,
      default: ''
    },
    website: {
      type: String,
      trim: true,
      default: ''
    },
    industry: {
      type: String,
      default: 'Technology'
    },
    accountRelationship: {
      type: String,
      default: 'Customer'
    },
    // Nothing on the account may be invented: `plan` and `serverNode` are only
    // ever what an admin recorded, so an untouched row stays empty.
    plan: {
      type: String,
      default: '',
      trim: true
    },
    serverNode: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['active', 'demo', 'inactive', 'suspended'],
      default: 'active',
      index: true
    },
    demoTrialUsed: {
      type: Boolean,
      default: false
    },
    demoExtensionAllowed: {
      type: Boolean,
      default: false
    },
    demoExtensionDays: {
      type: Number,
      default: 0
    },
    registered: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    mrr: {
      type: String,
      default: ''
    },
    address: {
      street: { type: String, default: '' },
      area: { type: String, default: '' },
      city: { type: String, default: 'Kolkata' },
      state: { type: String, default: 'West Bengal' },
      country: { type: String, default: 'India' },
      postalCode: { type: String, default: '' },
      addressType: { type: String, default: 'Office / Billing' }
    },
    gstNo: {
      type: String,
      trim: true,
      uppercase: true,
      default: ''
    },
    tallySerialNo: {
      type: String,
      trim: true,
      default: ''
    },
    pan: {
      type: String,
      trim: true,
      uppercase: true,
      default: ''
    },
    portalPassword: {
      type: String,
      default: ''
    },
    loginEmail: {
      type: String,
      default: ''
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    contacts: [
      {
        firstName: { type: String, default: '' },
        lastName: { type: String, default: '' },
        name: { type: String, default: '' },
        phone: { type: String, default: '' },
        email: { type: String, default: '' },
        designation: { type: String, default: '' },
        sangamRecordId: { type: String, default: null }
      }
    ],
    sangamCrm: {
      status: {
        type: String,
        enum: ['synced', 'pending', 'failed'],
        default: 'pending',
        index: true
      },
      recordId: {
        type: String,
        default: null
      },
      lastSyncedAt: {
        type: String,
        default: null
      },
      syncError: {
        type: String,
        default: null
      }
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret.customerId || ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

let CustomerModel;
try {
  CustomerModel = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
} catch (e) {
  CustomerModel = mongoose.model('Customer', customerSchema);
}

export default CustomerModel;
