import dotenv from 'dotenv';
dotenv.config();

const required = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}
if (process.env.JWT_ACCESS_SECRET.length < 32 || process.env.JWT_REFRESH_SECRET.length < 32) {
  throw new Error('JWT secrets must each be at least 32 characters long.');
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 4000),
  MONGODB_URI: process.env.MONGODB_URI,
  CLIENT_ORIGINS: (process.env.CLIENT_ORIGINS || 'http://localhost:5173').split(',').map(v => v.trim()),
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
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
  SANGAM_CRM_URL: process.env.SANGAM_CRM_URL || 'https://nistally.sangamcrm.com/',
  SANGAM_CRM_API_BASE: process.env.SANGAM_CRM_API_BASE || 'https://nistally.sangamcrm.com/api/v1/',
  SANGAM_CRM_TOKEN: process.env.SANGAM_CRM_TOKEN || 'A8GquckzjoSIUfwGAtXcjxOBlWo2i0t6'
};
