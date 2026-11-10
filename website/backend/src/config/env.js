import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const required = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}
if (process.env.JWT_ACCESS_SECRET.length < 32 || process.env.JWT_REFRESH_SECRET.length < 32) {
  throw new Error('JWT secrets must each be at least 32 characters long.');
}

const cleanEnv = (val) => {
  if (!val) return '';
  return String(val).trim().replace(/^["']|["']$/g, '');
};

// Verified default NISPL test credentials
const DEFAULT_TEST_KEY_ID = 'rzp_test_TwQCgfXiLnDMSa';
const DEFAULT_TEST_KEY_SECRET = 'ivedlw4TxbIjZJEPGFqOWJ2x';

// Verified NISPL live credentials
const DEFAULT_LIVE_KEY_ID = 'rzp_live_TwpNQJ91W9n8I5';
const DEFAULT_LIVE_KEY_SECRET = 'wVHavVJ294b6ms6u70SCLuMY';

const rawTestMode = process.env.RAZORPAY_TEST_MODE;
const rawKeyId = cleanEnv(
  process.env.RAZORPAY_KEY_ID ||
  process.env.RAZORPAY_ID ||
  process.env.RAZORPAY_KEY ||
  process.env.RZP_KEY_ID ||
  process.env.VITE_RAZORPAY_KEY_ID
);
const rawKeySecret = cleanEnv(
  process.env.RAZORPAY_KEY_SECRET ||
  process.env.RAZORPAY_SECRET ||
  process.env.RZP_KEY_SECRET ||
  process.env.VITE_RAZORPAY_KEY_SECRET
);

const testKeyId = cleanEnv(process.env.RAZORPAY_TEST_KEY_ID) || (rawKeyId.startsWith('rzp_test_') ? rawKeyId : DEFAULT_TEST_KEY_ID);
const testKeySecret = cleanEnv(process.env.RAZORPAY_TEST_KEY_SECRET) || (rawKeyId.startsWith('rzp_test_') ? rawKeySecret : DEFAULT_TEST_KEY_SECRET);

const liveKeyId = cleanEnv(process.env.RAZORPAY_LIVE_KEY_ID) || (rawKeyId.startsWith('rzp_live_') ? rawKeyId : DEFAULT_LIVE_KEY_ID);
const liveKeySecret = cleanEnv(process.env.RAZORPAY_LIVE_KEY_SECRET) || (rawKeyId.startsWith('rzp_live_') ? rawKeySecret : DEFAULT_LIVE_KEY_SECRET);

let isTestMode = true;
if (rawTestMode !== undefined) {
  const norm = String(rawTestMode).trim().toLowerCase();
  isTestMode = norm === 'true' || norm === '1' || norm === 'test' || norm === 'yes';
} else if (rawKeyId.startsWith('rzp_live_')) {
  isTestMode = false;
} else {
  isTestMode = true;
}

const razorpayKeyId = isTestMode ? testKeyId : liveKeyId;
const razorpayKeySecret = isTestMode ? testKeySecret : liveKeySecret;

const rawSangamSync = process.env.SANGAM_CRM_SYNC_ENABLED ?? process.env.SANGAM_CRM_SYNC;
let isSangamSyncEnabled = true;
if (rawSangamSync !== undefined) {
  const norm = String(rawSangamSync).trim().toLowerCase();
  isSangamSyncEnabled = norm === 'true' || norm === '1' || norm === 'yes';
}

// A login may never outlive one day, whatever the deployment config says.
const MAX_SESSION_SECONDS = 24 * 60 * 60;
const durationSeconds = (value, fallback) => {
  const match = /^(\d+)\s*([smhd])?$/.exec(String(value || '').trim());
  if (!match) return fallback;
  return Number(match[1]) * ({ s: 1, m: 60, h: 3600, d: 86400 }[match[2] || 's']);
};
const cappedSeconds = (value) => Math.min(durationSeconds(value, MAX_SESSION_SECONDS), MAX_SESSION_SECONDS);

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 4000),
  MONGODB_URI: process.env.MONGODB_URI,
  CLIENT_ORIGINS: (process.env.CLIENT_ORIGINS || 'http://localhost:5173,https://nispldemo.vercel.app').split(',').map(v => v.trim()),
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: cappedSeconds(process.env.JWT_ACCESS_EXPIRES_IN),
  JWT_REFRESH_EXPIRES_IN: cappedSeconds(process.env.JWT_REFRESH_EXPIRES_IN),
  SESSION_MAX_SECONDS: MAX_SESSION_SECONDS,
  SESSION_IDLE_MINUTES: Math.max(1, Number(process.env.SESSION_IDLE_MINUTES || 30)),
  REFRESH_COOKIE_NAME: process.env.REFRESH_COOKIE_NAME || 'nispl_refresh',
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true',
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || 'lax',
  BCRYPT_ROUNDS: Number(process.env.BCRYPT_ROUNDS || 12),
  PASSWORD_RESET_EXPIRES_MINUTES: Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES || 15),
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: Number(process.env.SMTP_PORT || 587),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  MAIL_FROM: process.env.MAIL_FROM || 'NISPL Security <no-reply@example.com>',
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || 'nispldeveloper@gmail.com').trim().toLowerCase(),
  APP_BASE_URL: process.env.APP_BASE_URL || 'http://localhost:5173',
  SANGAM_CRM_SYNC_ENABLED: isSangamSyncEnabled,
  SANGAM_CRM_URL: process.env.SANGAM_CRM_URL || 'https://nistally.sangamcrm.com/',
  SANGAM_CRM_API_BASE: process.env.SANGAM_CRM_API_BASE || 'https://nistally.sangamcrm.com/api/v1/',
  SANGAM_CRM_TOKEN: process.env.SANGAM_CRM_TOKEN || 'A8GquckzjoSIUfwGAtXcjxOBlWo2i0t6',
  RAZORPAY_TEST_MODE: isTestMode,
  RAZORPAY_KEY_ID: razorpayKeyId,
  RAZORPAY_KEY_SECRET: razorpayKeySecret,
  RAZORPAY_CURRENCY: (process.env.RAZORPAY_CURRENCY || 'INR').trim().toUpperCase(),
  RAZORPAY_WEBHOOK_SECRET: (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim(),
  RAZORPAY_ENABLED: Boolean(razorpayKeyId && razorpayKeySecret)
};
