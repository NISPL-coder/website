import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../data/products.json');

export const getProductsFromFile = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const list = JSON.parse(data);
      if (Array.isArray(list)) return list;
    }
  } catch (err) {
    console.error('[ProductModel] Error reading products.json:', err.message);
  }
  return [];
};

export const saveProductsToFile = (products) => {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(products || [], null, 2), 'utf-8');
  } catch (err) {
    console.error('[ProductModel] Error saving products.json:', err.message);
  }
};

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    id: {
      type: String,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: 'Cloud Hosting',
      index: true
    },
    provider: {
      type: String,
      default: 'ctrls-cloud',
      index: true
    },
    ipAddress: {
      type: String,
      default: '103.115.220.44',
      trim: true
    },
    sku: {
      type: String,
      default: ''
    },
    price: {
      type: String,
      required: true
    },
    monthlyPrice: {
      type: Number,
      default: 0
    },
    frequency: {
      type: String,
      default: '/ month'
    },
    description: {
      type: String,
      default: ''
    },
    userBadge: {
      type: String,
      default: ''
    },
    serverConfiguration: {
      type: String,
      default: ''
    },
    cores: {
      type: String,
      default: ''
    },
    ram: {
      type: String,
      default: ''
    },
    storage: {
      type: String,
      default: ''
    },
    users: {
      type: Number,
      default: 1
    },
    pricePerUser: {
      type: Number,
      default: 0
    },
    serverType: {
      type: String,
      default: '',
      enum: ['', 'shared', 'dedicated']
    },
    isCustomPlan: {
      type: Boolean,
      default: false,
      index: true
    },
    isDemoPlan: {
      type: Boolean,
      default: false,
      index: true
    },
    duration: {
      type: String,
      default: '',
      trim: true
    },
    tier: {
      type: String,
      default: ''
    },
    available: {
      type: Boolean,
      default: true,
      index: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true
    },
    specs: {
      type: Array,
      default: []
    },
    features: {
      type: Array,
      default: []
    }
  },
  {
    timestamps: true
  }
);

productSchema.pre('save', function (next) {
  if (!this.id) this.id = this.productId;
  if (!this.sku) this.sku = this.productId;
  if (this.available === false) this.status = 'inactive';
  else if (this.available === true) this.status = 'active';
  next();
});

export const Product = mongoose.model('Product', productSchema);
export default Product;

