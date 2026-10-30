import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../data/customers.json');

// Initial seed data preserving existing admin dashboard customers
const SEED_CUSTOMERS = [
  {
    customerId: 'CUST-8821',
    id: 'CUST-8821',
    name: 'Debasish Chakraborty',
    company: 'FlowMail Agency Pvt Ltd',
    email: 'debasish@flowmail.agency',
    phone: '+91 98301 22419',
    city: 'Kolkata, Salt Lake Sec V',
    plan: 'Tally Prime Cloud + VPS Gold',
    serverNode: 'CtrlS-KOL-NODE-01',
    status: 'active',
    registered: '2026-10-24',
    mrr: '₹14,500',
    address: {
      street: 'Sector V, GP Block',
      city: 'Kolkata',
      state: 'West Bengal',
      country: 'India',
      postalCode: '700091'
    },
    sangamCrm: {
      status: 'synced',
      recordId: 'SGM-ACC-8821',
      lastSyncedAt: new Date('2026-10-24T10:30:00Z').toISOString(),
      syncError: null
    }
  },
  {
    customerId: 'CUST-8822',
    id: 'CUST-8822',
    name: 'Amitabh Sengupta',
    company: 'Bengal Logistics Corp',
    email: 'amitabh@bengallogistics.in',
    phone: '+91 98310 99401',
    city: 'Kolkata, Dalhousie',
    plan: 'Enterprise VPS Dedicated Node',
    serverNode: 'CtrlS-KOL-NODE-02',
    status: 'active',
    registered: '2026-10-20',
    mrr: '₹28,000',
    address: {
      street: '4 Fairlie Place',
      city: 'Kolkata',
      state: 'West Bengal',
      country: 'India',
      postalCode: '700001'
    },
    sangamCrm: {
      status: 'synced',
      recordId: 'SGM-ACC-8822',
      lastSyncedAt: new Date('2026-10-20T14:15:00Z').toISOString(),
      syncError: null
    }
  },
  {
    customerId: 'CUST-8823',
    id: 'CUST-8823',
    name: 'Rajesh Agrawal',
    company: 'SawanSukha Jewellers Hub',
    email: 'it@sawansukha.com',
    phone: '+91 98300 44102',
    city: 'Kolkata, Burrabazar',
    plan: 'Tally Multi-User Cloud + TSS',
    serverNode: 'CtrlS-KOL-NODE-01',
    status: 'active',
    registered: '2026-10-18',
    mrr: '₹22,500',
    address: {
      street: 'Camac Street',
      city: 'Kolkata',
      state: 'West Bengal',
      country: 'India',
      postalCode: '700016'
    },
    sangamCrm: {
      status: 'synced',
      recordId: 'SGM-ACC-8823',
      lastSyncedAt: new Date('2026-10-18T11:45:00Z').toISOString(),
      syncError: null
    }
  },
  {
    customerId: 'CUST-8825',
    id: 'CUST-8825',
    name: 'Vikram Burman',
    company: 'Eastern Metal Refineries',
    email: 'v.burman@emrindustries.com',
    phone: '+91 98302 55910',
    city: 'Durgapur Industrial Belt',
    plan: 'High-Mem Cloud VPS Node',
    serverNode: 'CtrlS-KOL-NODE-02',
    status: 'active',
    registered: '2026-10-12',
    mrr: '₹34,000',
    address: {
      street: 'GT Road Phase 2',
      city: 'Durgapur',
      state: 'West Bengal',
      country: 'India',
      postalCode: '713203'
    },
    sangamCrm: {
      status: 'synced',
      recordId: 'SGM-ACC-8825',
      lastSyncedAt: new Date('2026-10-12T09:20:00Z').toISOString(),
      syncError: null
    }
  },
  {
    customerId: 'CUST-8826',
    id: 'CUST-8826',
    name: 'Rohan Roy',
    company: 'NexGen AI Solutions',
    email: 'rohan.roy@nexgenai.tech',
    phone: '+91 98305 11840',
    city: 'Kolkata, Sector V',
    plan: '14-Day Cloud VPS Sandbox Trial',
    serverNode: 'CtrlS-KOL-NODE-03',
    status: 'demo',
    registered: '2026-10-27',
    mrr: '₹0 (Trial)',
    address: {
      street: 'Godrej Genesis, EP Block',
      city: 'Kolkata',
      state: 'West Bengal',
      country: 'India',
      postalCode: '700091'
    },
    sangamCrm: {
      status: 'synced',
      recordId: 'SGM-ACC-8826',
      lastSyncedAt: new Date('2026-10-27T16:00:00Z').toISOString(),
      syncError: null
    }
  },
  {
    customerId: 'CUST-8827',
    id: 'CUST-8827',
    name: 'Moumita Das',
    company: 'Horizon BioPharma Labs',
    email: 'moumita@horizonbio.in',
    phone: '+91 98314 22930',
    city: 'Kolkata, New Town Action Area II',
    plan: 'Tally Prime Cloud Trial Demo',
    serverNode: 'CtrlS-KOL-NODE-01',
    status: 'demo',
    registered: '2026-10-28',
    mrr: '₹0 (Trial)',
    address: {
      street: 'Action Area IIB',
      city: 'Kolkata',
      state: 'West Bengal',
      country: 'India',
      postalCode: '700156'
    },
    sangamCrm: {
      status: 'synced',
      recordId: 'SGM-ACC-8827',
      lastSyncedAt: new Date('2026-10-28T10:10:00Z').toISOString(),
      syncError: null
    }
  },
  {
    customerId: 'CUST-8828',
    id: 'CUST-8828',
    name: 'Anirban Ghosh',
    company: 'Pinnacle Retail Ventures',
    email: 'anirban@pinnacleretail.co',
    phone: '+91 98322 77410',
    city: 'Howrah Commercial Zone',
    plan: 'Multi-User ERP Sandbox Node',
    serverNode: 'CtrlS-KOL-NODE-02',
    status: 'demo',
    registered: '2026-10-29',
    mrr: '₹0 (Trial)',
    address: {
      street: 'Kona Expressway',
      city: 'Howrah',
      state: 'West Bengal',
      country: 'India',
      postalCode: '711101'
    },
    sangamCrm: {
      status: 'synced',
      recordId: 'SGM-ACC-8828',
      lastSyncedAt: new Date('2026-10-29T15:30:00Z').toISOString(),
      syncError: null
    }
  },
  {
    customerId: 'CUST-8829',
    id: 'CUST-8829',
    name: 'Subrata Mukherjee',
    company: 'Heritage Tea & Spice Exporters',
    email: 'subrata@heritagetea.com',
    phone: '+91 98311 66320',
    city: 'Siliguri Commercial Hub',
    plan: 'Tally Single User Silver (Paused)',
    serverNode: 'CtrlS-KOL-NODE-02',
    status: 'inactive',
    registered: '2026-08-10',
    mrr: '₹6,500',
    address: {
      street: 'Hill Cart Road',
      city: 'Siliguri',
      state: 'West Bengal',
      country: 'India',
      postalCode: '734001'
    },
    sangamCrm: {
      status: 'synced',
      recordId: 'SGM-ACC-8829',
      lastSyncedAt: new Date('2026-08-10T11:00:00Z').toISOString(),
      syncError: null
    }
  },
  {
    customerId: 'CUST-8830',
    id: 'CUST-8830',
    name: 'Pradip Sen',
    company: 'Eastern Freight Movers',
    email: 'pradip@easternfreight.in',
    phone: '+91 98309 88470',
    city: 'Kolkata, Port Area',
    plan: 'Cloud VPS Standard Node (Expired)',
    serverNode: 'CtrlS-KOL-NODE-03',
    status: 'inactive',
    registered: '2026-07-15',
    mrr: '₹14,000',
    address: {
      street: 'Circular Garden Reach Road',
      city: 'Kolkata',
      state: 'West Bengal',
      country: 'India',
      postalCode: '700043'
    },
    sangamCrm: {
      status: 'synced',
      recordId: 'SGM-ACC-8830',
      lastSyncedAt: new Date('2026-07-15T12:00:00Z').toISOString(),
      syncError: null
    }
  }
];

// Offline & resilient file persistence helpers
export const getCustomersFromFile = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch (e) {
    console.warn('[CustomerModel] Error reading customers.json:', e.message);
  }
  // If file doesn't exist yet, initialize it with seed customers
  saveCustomersToFile(SEED_CUSTOMERS);
  return SEED_CUSTOMERS;
};

export const saveCustomersToFile = (list) => {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
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
      default: 'Technology & Cloud Solutions'
    },
    accountRelationship: {
      type: String,
      default: 'Customer'
    },
    plan: {
      type: String,
      default: 'Tally Prime Cloud + VPS Gold'
    },
    serverNode: {
      type: String,
      default: 'CtrlS-KOL-NODE-01'
    },
    status: {
      type: String,
      enum: ['active', 'demo', 'inactive', 'suspended'],
      default: 'active',
      index: true
    },
    registered: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    mrr: {
      type: String,
      default: '₹15,000'
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

