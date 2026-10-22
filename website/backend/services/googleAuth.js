import { google } from 'googleapis';
import fs from 'fs';
import { config } from '../config/index.js';

let authClientInstance = null;

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive'
];

/**
 * Check if Google service account credentials are provided
 * @returns {boolean}
 */
export function isGoogleConfigured() {
  const g = config.google;
  if (g.keyFilePath && fs.existsSync(g.keyFilePath)) {
    return true;
  }
  if (g.clientEmail && g.privateKey) {
    return true;
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    return true;
  }
  return false;
}

/**
 * Get or create Google Auth Client (JWT Service Account)
 * @returns {Promise<google.auth.JWT | null>}
 */
export async function getGoogleAuthClient() {
  if (authClientInstance) {
    return authClientInstance;
  }

  const g = config.google;

  try {
    // 1. Check direct key file path
    if (g.keyFilePath && fs.existsSync(g.keyFilePath)) {
      authClientInstance = new google.auth.GoogleAuth({
        keyFile: g.keyFilePath,
        scopes: SCOPES
      });
      return authClientInstance;
    }

    // 2. Check inline environment variables (standard for cloud hostings like Render/Heroku)
    if (g.clientEmail && g.privateKey) {
      authClientInstance = new google.auth.JWT({
        email: g.clientEmail,
        key: g.privateKey,
        scopes: SCOPES
      });
      await authClientInstance.authorize();
      return authClientInstance;
    }

    // 3. Fallback to GOOGLE_APPLICATION_CREDENTIALS
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      authClientInstance = new google.auth.GoogleAuth({
        scopes: SCOPES
      });
      return authClientInstance;
    }

    return null;
  } catch (err) {
    console.error('[GoogleAuth] Failed to initialize Google Auth client:', err.message);
    throw new Error(`Google Authentication failed: ${err.message}`);
  }
}
