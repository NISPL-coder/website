import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory, fallback to root
dotenv.config({ path: path.resolve(__dirname, '../.env') });
if (!process.env.PORT) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  timezone: process.env.TIMEZONE || 'Asia/Kolkata',
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],

  // Resume limits
  maxResumeSizeMb: parseInt(process.env.MAX_RESUME_SIZE_MB || '5', 10),
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  allowedExtensions: ['.pdf', '.doc', '.docx'],

  // Google Sheets configuration
  google: {
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || '',
    spreadsheetName: process.env.GOOGLE_SPREADSHEET_NAME || 'NISPL Career Applications',
    worksheetName: process.env.GOOGLE_WORKSHEET_NAME || 'Applications',
    driveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || '',
    driveFolderName: process.env.GOOGLE_DRIVE_FOLDER_NAME || 'NISPL Resumes(Website)',
    keyFilePath: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH
      ? path.resolve(__dirname, '..', process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH)
      : '',
    clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    privateKey: process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : '',
    projectId: process.env.GOOGLE_PROJECT_ID || ''
  },

  // Email notification configuration
  email: {
    hrRecipient: process.env.HR_NOTIFICATION_EMAIL || 'netinfotechsystem@gmail.com',
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
    smtpSecure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    fromAddress: process.env.EMAIL_FROM || '"NISPL Career Portal" <no-reply@netinfotechsystem.in>',
    attachResumeInEmail: process.env.ATTACH_RESUME_IN_EMAIL === 'true'
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '10', 10), // max 10 submissions per 15 min per IP
    message: {
      success: false,
      message: 'Too many application attempts from this network. Please try again after 15 minutes.'
    }
  }
};
