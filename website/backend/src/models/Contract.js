import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONTRACT_STATUSES, CONTRACT_TYPES, LEGACY_CONTRACT_TYPES } from '../utils/contractVocabulary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../data/contracts.json');

export const getContractsFromFile = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const list = JSON.parse(data);
      if (Array.isArray(list)) {
        return list;
      }
    }
  } catch (err) {
    console.error('[ContractModel] Error reading contracts.json fallback:', err.message);
  }
  return [];
};

export const saveContractsToFile = (contracts) => {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(contracts || [], null, 2), 'utf-8');
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
      enum: [...CONTRACT_TYPES, ...LEGACY_CONTRACT_TYPES],
      default: 'Comprehensive'
    },
    subscriptionPeriod: {
      type: String,
      default: '1 Year'
    },
    productCategory: {
      type: String,
      enum: ['Software', 'Service', 'Hardware', 'Trial'],
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
    // When the deal was ordered, which is not the day the term starts running.
    orderDate: {
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
      enum: [
        ...CONTRACT_STATUSES,
        'Active',
        'NotStarted',
        'Inactive',
        'InActive',
        'active',
        'inactive',
        'expiring',
        'draft'
      ],
      default: 'In Progress'
    },
    slaTier: {
      type: String,
      default: 'Tier-1 Priority NOC 99.99%'
    },
    description: {
      type: String,
      default: ''
    },
    // The catalogue entry this subscription was sold from. A receipt needs the
    // product's own specifications, and free-text names drift over time.
    productId: {
      type: String,
      default: '',
      index: true
    },
    // Who booked the deal. A payment taken against this subscription inherits
    // it, so the receipt names the same person the contract was raised with.
    salesPerson: {
      type: String,
      default: ''
    },
    // The settled invoice a portal purchase was raised from. It is what makes
    // provisioning idempotent when a gateway retry lands on the same payment.
    paymentInvoiceNumber: {
      type: String,
      default: '',
      index: true
    },
    createdBy: {
      name: {
        type: String,
        default: ''
      },
      email: {
        type: String,
        default: ''
      },
      role: {
        type: String,
        default: ''
      }
    },
    // Set only by an actual edit, so a row that nobody has touched can print
    // "never updated" instead of claiming the creator revised it.
    updatedBy: {
      name: {
        type: String,
        default: ''
      },
      email: {
        type: String,
        default: ''
      },
      role: {
        type: String,
        default: ''
      }
    },
    isDemoTrial: {
      type: Boolean,
      default: false
    },
    extensionAllowed: {
      type: Boolean,
      default: false
    },
    extensionDays: {
      type: Number,
      default: 0
    },
    trialUsed: {
      type: Boolean,
      default: false
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

let ContractModel;
try {
  ContractModel = mongoose.models.Contract || mongoose.model('Contract', contractSchema);
} catch (e) {
  ContractModel = mongoose.model('Contract', contractSchema);
}

export default ContractModel;
