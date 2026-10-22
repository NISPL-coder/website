import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

let transporterInstance = null;
const sentNotifications = new Set();
const pendingNotifications = new Map(); // Store applications with failed emails for admin retry

/**
 * Initialize or get Nodemailer transporter
 */
export function getEmailTransporter() {
  if (transporterInstance) {
    return transporterInstance;
  }

  const { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass } = config.email;

  if (!smtpUser || !smtpPass) {
    console.warn('[EmailService] SMTP credentials not configured. Running in simulated mode.');
    return null;
  }

  transporterInstance = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  return transporterInstance;
}

/**
 * Generate plain text email body
 */
export function generatePlainTextEmail(data) {
  return `
NEW CAREER APPLICATION RECEIVED
=====================================================

Application ID:        ${data.applicationId}
Status:                ${data.status || 'New'}
Applied Role:          ${data.appliedRole}

CANDIDATE DETAILS:
-----------------------------------------------------
Candidate Name:        ${data.name}
Email Address:         ${data.email}
Phone Number:          ${data.phone}

APPLICATION METADATA:
-----------------------------------------------------
Year:                  ${data.year}
Month:                 ${data.month}
Application Date/Time: ${data.dateTimeFormatted}

RESUME ACCESS:
-----------------------------------------------------
Google Drive Link:     ${data.resumeUrl}

(Note: The resume is securely stored in your private 'NISPL Resumes(Website)' Google Drive folder.)

=====================================================
Net Infotech System Pvt. Ltd. (NISPL) Career Portal
Kolkata, West Bengal, India
`;
}

/**
 * Generate clean, modern, professional HTML email template
 */
export function generateHtmlEmail(data) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Career Application</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background-color: #f8fafc;
      margin: 0;
      padding: 24px;
    }
    .email-container {
      max-width: 620px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
    }
    .header-banner {
      background: linear-gradient(135deg, #09132e 0%, #1e3a8a 100%);
      color: #ffffff;
      padding: 28px 32px;
    }
    .brand-kicker {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #38bdf8;
      margin-bottom: 6px;
    }
    .header-title {
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 4px 0;
      color: #ffffff;
    }
    .header-sub {
      font-size: 13px;
      color: #cbd5e1;
      margin: 0;
    }
    .content-body {
      padding: 32px;
    }
    .meta-chip-row {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }
    .meta-chip {
      display: inline-block;
      padding: 6px 12px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #0f172a;
    }
    .meta-chip.status {
      background: #ecfdf5;
      border-color: #a7f3d0;
      color: #065f46;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .details-table td {
      padding: 10px 14px;
      font-size: 14px;
      border-bottom: 1px solid #f1f5f9;
    }
    .details-table td.label-cell {
      width: 38%;
      color: #64748b;
      font-weight: 500;
    }
    .details-table td.value-cell {
      color: #0f172a;
      font-weight: 600;
    }
    .resume-cta-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin-top: 10px;
      margin-bottom: 24px;
    }
    .resume-btn {
      display: inline-block;
      padding: 12px 28px;
      background: #0284c7;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      border-radius: 6px;
    }
    .footer-bar {
      padding: 18px 32px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header-banner">
      <div class="brand-kicker">Net Infotech System Pvt. Ltd.</div>
      <h1 class="header-title">New Career Application</h1>
      <p class="header-sub">Role: ${data.appliedRole}</p>
    </div>

    <div class="content-body">
      <div class="meta-chip-row">
        <span class="meta-chip">ID: ${data.applicationId}</span>
        <span class="meta-chip status">Status: ${data.status || 'New'}</span>
      </div>

      <table class="details-table">
        <tr>
          <td class="label-cell">Candidate Name</td>
          <td class="value-cell">${data.name}</td>
        </tr>
        <tr>
          <td class="label-cell">Applied Role</td>
          <td class="value-cell">${data.appliedRole}</td>
        </tr>
        <tr>
          <td class="label-cell">Email Address</td>
          <td class="value-cell"><a href="mailto:${data.email}" style="color: #0284c7;">${data.email}</a></td>
        </tr>
        <tr>
          <td class="label-cell">Phone Number</td>
          <td class="value-cell"><a href="tel:${data.phone}" style="color: #0284c7;">${data.phone}</a></td>
        </tr>
        <tr>
          <td class="label-cell">Submission Date & Time</td>
          <td class="value-cell">${data.dateTimeFormatted}</td>
        </tr>
        <tr>
          <td class="label-cell">Calendar Period</td>
          <td class="value-cell">${data.month} ${data.year}</td>
        </tr>
      </table>

      <div class="resume-cta-box">
        <div style="font-size: 13px; color: #64748b; margin-bottom: 12px;">Candidate Resume is securely archived in Google Drive:</div>
        <a href="${data.resumeUrl}" class="resume-btn" target="_blank" rel="noopener noreferrer">
          View Resume in Google Drive &rarr;
        </a>
      </div>
    </div>

    <div class="footer-bar">
      This is an automated notification from NISPL Career Application Portal.<br />
      Net Infotech System Pvt. Ltd. • Salt Lake Sector-V, Kolkata - 700091
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Send career application notification email to HR
 * @param {Object} data - Application data
 * @returns {Promise<{ sent: boolean, messageId?: string, simulated?: boolean }>}
 */
export async function sendCareerApplicationEmail(data) {
  const { applicationId, name, appliedRole } = data;

  // Duplicate notification protection
  if (sentNotifications.has(applicationId)) {
    console.log(`[EmailService] Notification for ${applicationId} already sent. Skipping duplicate.`);
    return { sent: true, skipped: true };
  }

  const transporter = getEmailTransporter();
  const recipient = config.email.hrRecipient;
  const subject = `New Career Application – ${appliedRole} – ${name}`;

  if (!transporter) {
    console.warn(`[EmailService] Simulated email to ${recipient}: Subject="${subject}"`);
    sentNotifications.add(applicationId);
    return { sent: true, simulated: true };
  }

  const mailOptions = {
    from: config.email.fromAddress,
    to: recipient,
    subject: subject,
    text: generatePlainTextEmail(data),
    html: generateHtmlEmail(data)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Email sent successfully to ${recipient} (Message ID: ${info.messageId})`);
    sentNotifications.add(applicationId);
    pendingNotifications.delete(applicationId);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error('[EmailService] Failed to send notification email:', err.message);
    // Queue for admin retry rather than failing the candidate's application
    pendingNotifications.set(applicationId, {
      data,
      error: err.message,
      failedAt: new Date().toISOString()
    });
    return { sent: false, error: err.message };
  }
}

/**
 * Get all pending/failed notifications for admin audit
 */
export function getPendingNotifications() {
  return Array.from(pendingNotifications.entries()).map(([appId, item]) => ({
    applicationId: appId,
    ...item
  }));
}

/**
 * Retry sending a failed notification
 * @param {string} applicationId 
 */
export async function retryNotification(applicationId) {
  const pending = pendingNotifications.get(applicationId);
  if (!pending) {
    return { success: false, message: 'No pending notification found for this application ID.' };
  }
  const result = await sendCareerApplicationEmail(pending.data);
  return { success: result.sent, result };
}
