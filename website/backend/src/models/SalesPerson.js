import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SALES_FILE_PATH = path.join(__dirname, '../data/sales_persons.json');

const INITIAL_SALES_PERSONS = [
  {
    id: 'SP-101',
    name: 'Nilmoni Ghosal',
    email: 'nilmoni@netinfotechsystem.com',
    phone: '9830012341',
    designation: 'Senior Sales Executive',
    status: 'Active',
    assignedCustomers: [],
    notes: 'Handles East Region & Enterprise accounts'
  },
  {
    id: 'SP-102',
    name: 'Sourav Mukherjee',
    email: 'sourav@netinfotechsystem.com',
    phone: '9830012342',
    designation: 'Cloud Solutions Manager',
    status: 'Active',
    assignedCustomers: [],
    notes: 'Handles Cloud Hosting & Corporate accounts'
  },
  {
    id: 'SP-103',
    name: 'Sales Support Direct',
    email: 'sales@netinfotechsystem.com',
    phone: '9830012340',
    designation: 'Inbound Sales Desk',
    status: 'Active',
    assignedCustomers: [],
    notes: 'Default inbound portal desk'
  }
];

export const getSalesPersonsFromFile = () => {
  try {
    if (!fs.existsSync(SALES_FILE_PATH)) {
      saveSalesPersonsToFile(INITIAL_SALES_PERSONS);
      return INITIAL_SALES_PERSONS;
    }
    const data = fs.readFileSync(SALES_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data || '[]');
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveSalesPersonsToFile(INITIAL_SALES_PERSONS);
      return INITIAL_SALES_PERSONS;
    }
    return parsed;
  } catch (err) {
    console.error('[getSalesPersonsFromFile] Error reading JSON file:', err);
    return INITIAL_SALES_PERSONS;
  }
};

export const saveSalesPersonsToFile = (list) => {
  try {
    const dir = path.dirname(SALES_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SALES_FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('[saveSalesPersonsToFile] Error writing JSON file:', err);
  }
};

const salesPersonSchema = new mongoose.Schema(
  {
    salesPersonId: {
      type: String,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Sales Person name is required'],
      trim: true,
      index: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    designation: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
      index: true
    },
    assignedCustomers: {
      type: [String],
      default: []
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret.salesPersonId || ret._id;
        return ret;
      }
    }
  }
);

salesPersonSchema.pre('save', function (next) {
  if (!this.salesPersonId) {
    this.salesPersonId = `SP-${Math.floor(100 + Math.random() * 900)}`;
  }
  next();
});

const SalesPerson = mongoose.models.SalesPerson || mongoose.model('SalesPerson', salesPersonSchema);

export default SalesPerson;

