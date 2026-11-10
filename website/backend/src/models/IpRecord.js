import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IP_FILE_PATH = path.join(__dirname, '../data/ip_records.json');

export const getIpsFromFile = () => {
  try {
    if (!fs.existsSync(IP_FILE_PATH)) {
      fs.writeFileSync(IP_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const data = fs.readFileSync(IP_FILE_PATH, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('[getIpsFromFile] Error reading JSON file:', err);
    return [];
  }
};

export const saveIpsToFile = (ips) => {
  try {
    const dir = path.dirname(IP_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(IP_FILE_PATH, JSON.stringify(ips, null, 2), 'utf-8');
  } catch (err) {
    console.error('[saveIpsToFile] Error writing JSON file:', err);
  }
};

const ipRecordSchema = new mongoose.Schema(
  {
    wanIp: {
      type: String,
      required: [true, 'WAN IP is required'],
      trim: true
    },
    lanIp: {
      type: String,
      required: [true, 'LAN IP is required'],
      trim: true
    },
    rdpPort: {
      type: String,
      required: [true, 'RDP Port is required'],
      trim: true,
      default: '3389'
    },
    httpPort: {
      type: String,
      required: [true, 'HTTP Port is required'],
      trim: true,
      default: '80'
    },
    vmId: {
      type: String,
      required: [true, 'VM ID is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'ACTIVE', 'INACTIVE'],
      default: 'Active'
    },
    serverType: {
      type: String,
      enum: ['Shared', 'Dedicated', 'SHARED', 'DEDICATED', 'SHERE/DEDICTED'],
      default: 'Dedicated'
    },
    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const IpRecord = mongoose.models.IpRecord || mongoose.model('IpRecord', ipRecordSchema);

