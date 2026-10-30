import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../data/contracts.json');

const SEED_CONTRACTS = [
  {
    contractId: 'CTR-2026-0891',
    id: 'CTR-2026-0891',
    name: 'FlowMail Tally Prime Cloud SLA',
    customer: 'Debasish Chakraborty',
    company: 'FlowMail Agency Pvt Ltd',
    email: 'debasish@flowmail.agency',
    service: 'Tally Prime Cloud + VPS Dedicated SLA',
    contractType: 'Subscription',
    subscriptionPeriod: '1 Year',
    productCategory: 'Software',
    totalContractValue: '₹1,74,000',
    value: '₹1,74,000 / yr',
    startDate: '2026-01-15',
    endDate: '2027-01-14',
    expiryDate: '2027-01-14',
    status: 'active',
    slaTier: 'Tier-1 Priority NOC',
    sangamCrm: {
      status: 'synced',
      recordId: 'SGM-CTR-0891',
      lastSyncedAt: new Date('2026-01-15T10:00:00Z').toISOString(),
      syncError: null
    }
  },
  {
    contractId: 'CTR-2026-0890',
    id: 'CTR-2026-0890',
    name: 'Bengal Logistics Enterprise Node SLA',
    customer: 'Amitabh Sengupta',
    company: 'Bengal Logistics Corp',
    email: 'amitabh@bengallogistics.in',
    service: 'Enterprise Cloud VPS Dedicated 8-Core Node',
    contractType: 'Subscription',
    subscriptionPeriod: '1 Year',
    productCategory: 'Software',
    totalContractValue: '₹3,36,000',
    value: '₹3,36,000 / yr',
    startDate: '2026-03-01',
    endDate: '2027-02-28',
    expiryDate: '2027-02-28',
    status: 'active',
    slaTier: '24/7 Dedicated Support',
    sangamCrm: {
      status: 'synced',
      recordId: 'SGM-CTR-0890',
      lastSyncedAt: new Date('2026-03-01T10:00:00Z').toISOString(),
      syncError: null
    }
  },
  {
    contractId: 'CTR-2026-0889',
    id: 'CTR-2026-0889',
    name: 'SawanSukha TSS Gold Maintenance',
    customer: 'Rajesh Agrawal',
    company: 'SawanSukha Jewellers Hub',
    email: 'it@sawansukha.com',
    service: 'Tally Multi-User Gold Cloud + TSS Sync',
    contractType: 'AMC',
    subscriptionPeriod: '1 Year',
    productCategory: 'Service',
    totalContractValue: '₹2,70,000',
    value: '₹2,70,000 / yr',
    startDate: '2025-11-10',
    endDate: '2026-11-09',
    expiryDate: '2026-11-09',
    status: 'expiring',
    slaTier: 'Annual Gold Maintenance',
    sangamCrm: {
      status: 'synced',
      recordId: 'SGM-CTR-0889',
      lastSyncedAt: new Date('2025-11-10T10:00:00Z').toISOString(),
      syncError: null
    }
  },
  {
    contractId: 'CTR-2026-0888',
    id: 'CTR-2026-0888',
    name: 'KHD Silver Hosting Agreement',
    customer: 'Dr. Suniti Mukherjee',
    company: 'Kolkata Health Diagnostics',
    email: 'admin@khdlabs.org',
    service: 'Tally Prime Single User Silver',
    contractType: 'Subscription',
    subscriptionPeriod: '1 Year',
    productCategory: 'Software',
    totalContractValue: '₹78,000',
    value: '₹78,000 / yr',
    startDate: '2026-08-01',
    endDate: '2027-07-31',
    expiryDate: '2027-07-31',
    status: 'active',
    slaTier: 'Standard Cloud Hosting',
    sangamCrm: {
      status: 'synced',
      recordId: 'SGM-CTR-0888',
      lastSyncedAt: new Date('2026-08-01T10:00:00Z').toISOString(),
      syncError: null
    }
  },
  {
    contractId: 'CTR-2026-0887',
    id: 'CTR-2026-0887',
    name: 'EMR High-Mem Hypervisor SLA',
    customer: 'Vikram Burman',
    company: 'Eastern Metal Refineries',
    email: 'v.burman@emrindustries.com',
    service: 'High-Mem Cloud VPS Node Hypervisor',
    contractType: 'Subscription',
    subscriptionPeriod: '1 Year',
    productCategory: 'Software',
    totalContractValue: '₹4,08,000',
    value: '₹4,08,000 / yr',
    startDate: '2026-05-10',
    endDate: '2027-05-09',
    expiryDate: '2027-05-09',
    status: 'active',
    slaTier: 'Mission-Critical SLA 99.99%',
    sangamCrm: {
      status: 'synced',
      recordId: 'SGM-CTR-0887',
      lastSyncedAt: new Date('2026-05-10T10:00:00Z').toISOString(),
      syncError: null
    }
  }
];

export const getContractsFromFile = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[ContractModel] Error reading contracts.json fallback:', err.message);
  }
  // Initialize fallback file
  saveContractsToFile(SEED_CONTRACTS);
  return SEED_CONTRACTS;
};

export const saveContractsToFile = (contracts) => {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(contracts, null, 2), 'utf-8');
  } catch (err) {
    console.error('[ContractModel] Error saving contracts.json fallback:', err.message);
  }
};

const contractSchema = new mongoose.Schema(
  {
    contractId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      trim: true,
      default: ''
    },
    customer: {
      type: String,
      trim: true,
      default: ''
    },
    accountId: {
      type: String,
      trim: true,
      default: null
    },
    email: {
      type: String,
      trim: true,
      default: 'contracts@nispl.in'
    },
    service: {
      type: String,
      trim: true,
      default: ''
    },
    contractType: {
      type: String,
      enum: ['Subscription', 'AMC'],
      default: 'Subscription'
    },
    subscriptionPeriod: {
      type: String,
      default: '1 Year'
    },
    productCategory: {
      type: String,
      enum: ['Software', 'Service', 'Hardware'],
      default: 'Software'
    },
    totalContractValue: {
      type: String,
      required: true
    },
    value: {
      type: String,
      default: ''
    },
    startDate: {
      type: String,
      required: true
    },
    endDate: {
      type: String,
      required: true
    },
    expiryDate: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Active', 'NotStarted', 'Inactive', 'InActive', 'active', 'inactive', 'expiring', 'draft'],
      default: 'Active'
    },
    slaTier: {
      type: String,
      default: 'Tier-1 Priority NOC 99.99%'
    },
    description: {
      type: String,
      default: ''
    },
    sangamCrm: {
      status: {
        type: String,
        enum: ['synced', 'failed', 'pending'],
        default: 'pending'
      },
      recordId: {
        type: String,
        default: null
      },
      lastSyncedAt: {
        type: Date,
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

contractSchema.virtual('id').get(function () {
  return this.contractId;
});

const Contract = mongoose.models.Contract || mongoose.model('Contract', contractSchema);

export default Contract;

