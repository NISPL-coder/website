import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../data/addons.json');
const SETTINGS_FILE = path.resolve(__dirname, '../data/addon_settings.json');

export const INITIAL_ADDONS = [
  {
    id: 'addon-whatsapp-automation',
    name: 'WhatsApp Automation Module',
    category: 'Automation Add-on',
    badge: 'POPULAR',
    badgeColor: '#059669',
    badgeBg: '#ecfdf5',
    amount: 3000,
    billingCycle: 'Annual',
    desc: 'Instant PDF invoices & receipts dispatched directly via WhatsApp.',
    spec: 'Meta Official API',
    available: true,
    order: 1
  },
  {
    id: 'addon-cloud-backup-100gb',
    name: 'Encrypted Cloud Backup (100GB)',
    category: 'Security & Backup',
    badge: 'ESSENTIAL',
    badgeColor: '#2563eb',
    badgeBg: '#eff6ff',
    amount: 1499,
    billingCycle: 'Annual',
    desc: 'Automated nightly snapshot backup with 15-day recovery.',
    spec: '100 GB NVMe Storage',
    available: true,
    order: 2
  },
  {
    id: 'addon-tally-einvoice-api',
    name: 'Direct e-Invoice & e-Way Bill API',
    category: 'Government Compliance',
    badge: 'COMPLIANCE',
    badgeColor: '#7c3aed',
    badgeBg: '#f5f3ff',
    amount: 3500,
    billingCycle: 'Annual',
    desc: 'Sub-second IRN & QR code generation directly from Tally.',
    spec: 'Direct IRP Sync',
    available: true,
    order: 3
  },
  {
    id: 'addon-cloud-tally-business',
    name: 'Tally on Cloud (3 Users)',
    category: 'Cloud Hosting',
    badge: 'BEST SELLER',
    badgeColor: '#d97706',
    badgeBg: '#fef3c7',
    amount: 2499,
    billingCycle: 'Annual',
    desc: 'High-speed remote cloud desktop accessible from Mac & Windows.',
    spec: 'Tier-4 Enterprise Cloud',
    available: true,
    order: 4
  },
  {
    id: 'addon-tally-tss-single',
    name: 'TSS 1-Year Renewal (Silver)',
    category: 'Software Maintenance',
    badge: 'TAX UPDATES',
    badgeColor: '#dc2626',
    badgeBg: '#fef2f2',
    amount: 4500,
    billingCycle: 'Annual',
    desc: 'Continuous statutory tax patches, banking API & reports.',
    spec: '12-Month Support',
    available: true,
    order: 5
  },
  {
    id: 'addon-tally-lan-booster',
    name: 'LAN Network Accelerator',
    category: 'Network Optimization',
    badge: 'UTILITY',
    badgeColor: '#0891b2',
    badgeBg: '#ecfeff',
    amount: 2200,
    billingCycle: 'Annual',
    desc: 'Zero-lag multi-workstation concurrency for retail billing.',
    spec: 'Multi-LAN Routing',
    available: true,
    order: 6
  }
];

export const getAddonsFromFile = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const list = JSON.parse(data);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch (err) {
    console.error('[AddonModel] Error reading addons.json:', err.message);
  }
  return INITIAL_ADDONS;
};

export const saveAddonsToFile = (addons) => {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(addons || [], null, 2), 'utf-8');
  } catch (err) {
    console.error('[AddonModel] Error saving addons.json:', err.message);
  }
};

export const getAddonSettingsFromFile = () => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (typeof parsed?.showAddonsOnCheckout === 'boolean') return parsed;
    }
  } catch (err) {
    console.error('[AddonModel] Error reading addon_settings.json:', err.message);
  }
  return { showAddonsOnCheckout: true };
};

export const saveAddonSettingsToFile = (settings) => {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings || { showAddonsOnCheckout: true }, null, 2), 'utf-8');
  } catch (err) {
    console.error('[AddonModel] Error saving addon_settings.json:', err.message);
  }
};

const addonSchema = new mongoose.Schema(
  {
    id: {
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
    category: {
      type: String,
      default: 'General Add-on',
      trim: true
    },
    badge: {
      type: String,
      default: 'ADD-ON'
    },
    badgeColor: {
      type: String,
      default: '#059669'
    },
    badgeBg: {
      type: String,
      default: '#ecfdf5'
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    billingCycle: {
      type: String,
      default: 'Annual'
    },
    desc: {
      type: String,
      default: ''
    },
    spec: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    available: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const addonSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'checkout_config',
      unique: true
    },
    showAddonsOnCheckout: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const Addon = mongoose.model('Addon', addonSchema);
export const AddonSetting = mongoose.model('AddonSetting', addonSettingSchema);

export default Addon;

