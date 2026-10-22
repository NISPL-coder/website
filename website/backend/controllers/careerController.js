import { getKolkataTimeInfo, generateApplicationId } from '../utils/helpers.js';
import { validateResumeFile } from '../utils/fileValidator.js';
import { uploadResumeToDrive, deleteResumeFromDrive } from '../services/googleDrive.js';
import { appendApplicationRow } from '../services/googleSheets.js';
import { sendCareerApplicationEmail, getPendingNotifications, retryNotification } from '../services/emailService.js';
import { config } from '../config/index.js';

// In-memory sliding window for duplicate application prevention (email + role within 60s)
const recentSubmissions = new Map();

/**
 * Handle candidate career application submission
 * POST /api/career/apply
 */
export async function submitApplication(req, res) {
  try {
    const { name, email, phone, appliedRole, website } = req.body;
    const file = req.file;

    // 1. Anti-spam honeypot check (hidden field 'website' should be empty)
    if (website) {
      console.warn('[CareerController] Honeypot field filled. Rejecting suspected bot submission.');
      // Return 200 to trick spam bots into thinking it succeeded without saving junk
      return res.status(200).json({
        success: true,
        applicationId: 'BOT-FILTERED',
        message: 'Your application has been received.'
      });
    }

    // 2. Validate required text fields
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid candidate full name (minimum 2 characters).'
      });
    }

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Email address is required.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address (e.g. name@domain.com).'
      });
    }

    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required.'
      });
    }

    // Validate phone number (accepts 10-digit Indian mobile or with country code)
    const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^(\+?\d{1,4})?[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanedPhone) && cleanedPhone.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 10-digit mobile number.'
      });
    }

    if (!appliedRole || typeof appliedRole !== 'string' || appliedRole.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please specify the position / role you are applying for.'
      });
    }

    // 3. Validate resume file (size, extension, MIME type, and magic bytes)
    const fileValidation = validateResumeFile(file, config.maxResumeSizeMb);
    if (!fileValidation.valid) {
      return res.status(400).json({
        success: false,
        error: fileValidation.error
      });
    }

    // 4. Duplicate submission check (same email + appliedRole within 60 seconds)
    const duplicateKey = `${email.toLowerCase().trim()}_${appliedRole.toLowerCase().trim()}`;
    const lastSubmitted = recentSubmissions.get(duplicateKey);
    const nowMs = Date.now();
    if (lastSubmitted && nowMs - lastSubmitted < 60000) {
      return res.status(409).json({
        success: false,
        error: 'A duplicate application for this position was recently submitted from this email. Please wait a moment before trying again.'
      });
    }
    recentSubmissions.set(duplicateKey, nowMs);

    // Clean up older records from duplicate cache
    for (const [key, timestamp] of recentSubmissions.entries()) {
      if (nowMs - timestamp > 300000) {
        recentSubmissions.delete(key);
      }
    }

    // 5. Generate localized Date/Time and Application ID
    const kolkataTime = getKolkataTimeInfo(config.timezone);
    const applicationId = generateApplicationId(config.timezone);

    console.log(`[CareerController] Processing new application: ${applicationId} for ${name.trim()} (${appliedRole.trim()})`);

    // 6. Step 1: Upload resume to Google Drive
    let driveUploadResult;
    try {
      driveUploadResult = await uploadResumeToDrive({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        candidateName: name.trim(),
        applicationId,
        extension: fileValidation.extension
      });
    } catch (driveErr) {
      console.error('[CareerController] Step 1 (Drive Upload) failed:', driveErr.message);
      return res.status(502).json({
        success: false,
        error: 'Unable to securely upload your resume to cloud storage. Please try again or contact support.'
      });
    }

    // 7. Step 2: Append application details to Google Sheets
    const applicationRecord = {
      year: kolkataTime.year,
      month: kolkataTime.month,
      name: name.trim(),
      email: email.trim(),
      phone: cleanedPhone,
      appliedRole: appliedRole.trim(),
      dateTimeFormatted: kolkataTime.dateTimeFormatted,
      resumeUrl: driveUploadResult.webViewLink,
      applicationId,
      status: 'New'
    };

    try {
      await appendApplicationRow(applicationRecord);
    } catch (sheetErr) {
      console.error('[CareerController] Step 2 (Google Sheets) failed. Initiating rollback for file:', driveUploadResult.fileId);
      // Rollback: Clean up uploaded resume so orphaned files don't accumulate
      await deleteResumeFromDrive(driveUploadResult.fileId);

      return res.status(502).json({
        success: false,
        error: 'Failed to record application in central registry. Please try submitting again.'
      });
    }

    // 8. Step 3: Send HR email notification (non-blocking for candidate success)
    let emailStatus = 'sent';
    try {
      const emailResult = await sendCareerApplicationEmail(applicationRecord);
      if (!emailResult.sent) {
        emailStatus = 'pending';
        console.warn(`[CareerController] Email notification queued for retry for ${applicationId}`);
      }
    } catch (emailErr) {
      emailStatus = 'failed';
      console.error('[CareerController] Email notification error:', emailErr.message);
    }

    // 9. Respond with confirmed success
    return res.status(201).json({
      success: true,
      applicationId,
      message: 'Application submitted successfully! Our talent acquisition team will review your profile.',
      data: {
        applicationId,
        name: applicationRecord.name,
        appliedRole: applicationRecord.appliedRole,
        submissionDate: kolkataTime.dateTimeFormatted,
        status: applicationRecord.status,
        emailNotification: emailStatus
      }
    });

  } catch (err) {
    console.error('[CareerController] Unexpected server error:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while processing your application. Please try again later.'
    });
  }
}

/**
 * Health check & readiness verification
 * GET /api/career/health
 */
export function getHealth(req, res) {
  res.json({
    status: 'ok',
    service: 'NISPL Career Application API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
}

/**
 * Admin endpoint to list and retry pending email notifications
 * GET /api/career/pending-notifications
 */
export function listPendingNotifications(req, res) {
  const pending = getPendingNotifications();
  res.json({
    success: true,
    count: pending.length,
    notifications: pending
  });
}

/**
 * Admin endpoint to retry a specific notification
 * POST /api/career/retry-notification/:applicationId
 */
export async function retryNotificationHandler(req, res) {
  const { applicationId } = req.params;
  const result = await retryNotification(applicationId);
  res.json(result);
}
