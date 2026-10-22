import { google } from 'googleapis';
import stream from 'stream';
import { config } from '../config/index.js';
import { getGoogleAuthClient, isGoogleConfigured } from './googleAuth.js';
import { sanitizeFilename } from '../utils/helpers.js';

let cachedFolderId = null;

/**
 * Get or find/create the 'NISPL Resumes(Website)' folder in Google Drive
 * @param {google.drive_v3.Drive} drive 
 * @returns {Promise<string>}
 */
export async function getOrCreateResumeFolder(drive) {
  // If explicitly configured in .env, use it
  if (config.google.driveFolderId) {
    return config.google.driveFolderId;
  }

  if (cachedFolderId) {
    return cachedFolderId;
  }

  const folderName = config.google.driveFolderName || 'NISPL Resumes(Website)';

  try {
    // Search for existing non-trashed folder with this name
    const res = await drive.files.list({
      q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    if (res.data.files && res.data.files.length > 0) {
      cachedFolderId = res.data.files[0].id;
      return cachedFolderId;
    }

    // Create private folder
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Private archive for candidate resumes submitted to Net Infotech System Pvt. Ltd.'
    };

    const folder = await drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    });

    cachedFolderId = folder.data.id;
    console.log(`[GoogleDrive] Created new folder '${folderName}' with ID: ${cachedFolderId}`);
    return cachedFolderId;
  } catch (err) {
    console.error('[GoogleDrive] Error resolving resume folder:', err.message);
    throw new Error(`Google Drive folder error: ${err.message}`);
  }
}

/**
 * Upload resume buffer to Google Drive
 * @param {Object} params
 * @param {Buffer} params.buffer - File buffer
 * @param {string} params.originalName - Original filename
 * @param {string} params.mimeType - MIME type
 * @param {string} params.candidateName - Candidate full name
 * @param {string} params.applicationId - Unique application ID
 * @param {string} params.extension - e.g. .pdf
 * @returns {Promise<{ fileId: string, webViewLink: string, fileName: string }>}
 */
export async function uploadResumeToDrive({ buffer, originalName, mimeType, candidateName, applicationId, extension }) {
  if (!isGoogleConfigured()) {
    console.warn('[GoogleDrive] Google credentials not configured. Running in simulated mode.');
    return {
      fileId: `mock-drive-file-${applicationId}`,
      webViewLink: `https://drive.google.com/file/d/mock-file-${applicationId}/view?usp=sharing`,
      fileName: `${applicationId}_${sanitizeFilename(candidateName)}${extension}`
    };
  }

  const auth = await getGoogleAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  const folderId = await getOrCreateResumeFolder(drive);

  const cleanName = sanitizeFilename(candidateName);
  const targetFileName = `${applicationId}_${cleanName}${extension}`;

  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  try {
    const fileMetadata = {
      name: targetFileName,
      parents: [folderId],
      description: `Resume for ${candidateName} (Application ID: ${applicationId}). Original file: ${originalName}`
    };

    const media = {
      mimeType: mimeType,
      body: bufferStream
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink'
    });

    const fileId = response.data.id;
    // Standard direct link to view file in Google Drive
    const webViewLink = response.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;

    console.log(`[GoogleDrive] Uploaded resume: ${targetFileName} (ID: ${fileId})`);

    return {
      fileId,
      webViewLink,
      fileName: targetFileName
    };
  } catch (err) {
    console.error('[GoogleDrive] Upload failed:', err.message);
    throw new Error(`Google Drive upload failed: ${err.message}`);
  }
}

/**
 * Cleanup / delete an uploaded resume from Google Drive if downstream Sheet write fails
 * @param {string} fileId 
 */
export async function deleteResumeFromDrive(fileId) {
  if (!fileId || fileId.startsWith('mock-')) return;
  if (!isGoogleConfigured()) return;

  try {
    const auth = await getGoogleAuthClient();
    const drive = google.drive({ version: 'v3', auth });
    await drive.files.delete({ fileId });
    console.log(`[GoogleDrive] Successfully cleaned up file ${fileId} after failure.`);
  } catch (err) {
    console.error(`[GoogleDrive] Failed to delete file ${fileId}:`, err.message);
  }
}
