/**
 * =========================================================================
 * NET INFOTECH SYSTEM PVT. LTD. (NISPL) - CAREER APPLICATION APPS SCRIPT
 * Standalone Google Apps Script Alternative / Webhook Endpoint
 * =========================================================================
 * 
 * Deploy this script as a Web App:
 * - Execute as: Me (your Google account)
 * - Who has access: Anyone (to allow website submissions)
 */

// Configuration Constants
const SPREADSHEET_NAME = 'NISPL Career Applications';
const SHEET_NAME = 'Applications';
const FOLDER_NAME = 'NISPL Resumes(Website)';
const HR_EMAIL = 'netinfotechsystem@gmail.com';
const TIMEZONE = 'Asia/Kolkata';

/**
 * Handle HTTP POST requests from the website
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Anti-spam honeypot
    if (data.website) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        applicationId: 'BOT-FILTERED',
        message: 'Application received'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const name = (data.name || '').trim();
    const email = (data.email || '').trim();
    const phone = (data.phone || '').trim();
    const appliedRole = (data.appliedRole || '').trim();
    const resumeBase64 = data.resumeBase64;
    const resumeFilename = data.resumeFilename || 'resume.pdf';

    if (!name || !email || !phone || !appliedRole || !resumeBase64) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Missing required application fields or resume file.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 1. Get or Create Google Drive Folder
    const folder = getOrCreateFolder(FOLDER_NAME);

    // 2. Decode & Save Resume File
    const decodedBytes = Utilities.base64Decode(resumeBase64);
    const blob = Utilities.newBlob(decodedBytes, getMimeType(resumeFilename), sanitizeFilename(name) + '_' + resumeFilename);
    const driveFile = folder.createFile(blob);
    driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const resumeUrl = driveFile.getUrl();

    // 3. Time formatting in Asia/Kolkata
    const now = new Date();
    const year = Utilities.formatDate(now, TIMEZONE, 'yyyy');
    const month = Utilities.formatDate(now, TIMEZONE, 'MMMM'); // Full month name e.g. October
    const dateTime = Utilities.formatDate(now, TIMEZONE, 'dd MMM yyyy, hh:mm:ss a') + ' IST';

    // 4. Unique Application ID
    const randomHex = Utilities.formatDate(now, TIMEZONE, 'yyyyMMdd') + '-' + Utilities.getUuid().substring(0, 6).toUpperCase();
    const applicationId = 'APP-' + randomHex;

    // 5. Append to Google Sheet
    const sheet = getOrCreateSheet(SPREADSHEET_NAME, SHEET_NAME);
    const resumeFormula = '=HYPERLINK("' + resumeUrl + '", "View Resume")';

    // Append exactly 10 columns (A to J):
    // Year, Month, Name, Email, Phone, Applied Role, Application Date & Time, Resume, Application ID, Application Status
    sheet.appendRow([
      year,
      month,
      escapeFormula(name),
      escapeFormula(email),
      escapeFormula(phone),
      escapeFormula(appliedRole),
      dateTime,
      resumeFormula,
      applicationId,
      'New'
    ]);

    // 6. Send Email Notification
    sendHrEmail({
      name: name,
      email: email,
      phone: phone,
      appliedRole: appliedRole,
      year: year,
      month: month,
      dateTime: dateTime,
      applicationId: applicationId,
      resumeUrl: resumeUrl
    });

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      applicationId: applicationId,
      message: 'Application submitted successfully!',
      data: {
        applicationId: applicationId,
        name: name,
        appliedRole: appliedRole,
        dateTime: dateTime,
        status: 'New'
      }
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET for ping / health
 */
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    service: 'NISPL Career Portal Google Apps Script',
    status: 'online',
    timezone: TIMEZONE
  })).setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(folderName);
}

function getOrCreateSheet(spreadsheetName, sheetName) {
  const files = DriveApp.getFilesByName(spreadsheetName);
  let spreadsheet;
  if (files.hasNext()) {
    spreadsheet = SpreadsheetApp.open(files.next());
  } else {
    spreadsheet = SpreadsheetApp.create(spreadsheetName);
  }

  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  // Check headers
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Year',
      'Month',
      'Name',
      'Email',
      'Phone',
      'Applied Role',
      'Application Date & Time',
      'Resume',
      'Application ID',
      'Application Status'
    ]);
    const headerRange = sheet.getRange(1, 1, 1, 10);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#0284C7');
    headerRange.setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function escapeFormula(val) {
  if (!val) return '';
  const str = String(val).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return "'" + str;
  }
  return str;
}

function sanitizeFilename(val) {
  if (!val) return 'candidate';
  return val.replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 30);
}

function getMimeType(filename) {
  if (filename.endsWith('.pdf')) return 'application/pdf';
  if (filename.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (filename.endsWith('.doc')) return 'application/msword';
  return 'application/octet-stream';
}

function sendHrEmail(app) {
  const subject = 'New Career Application – ' + app.appliedRole + ' – ' + app.name;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0284C7; padding: 20px; color: #FFFFFF; text-align: center;">
        <h2 style="margin: 0;">Net Infotech System Pvt. Ltd.</h2>
        <p style="margin: 5px 0 0 0; font-size: 14px;">Career Portal Application Received</p>
      </div>
      <div style="padding: 24px; color: #334155;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Candidate Name:</td><td>${app.name}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Applied Role:</td><td>${app.appliedRole}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${app.email}">${app.email}</a></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td><a href="tel:${app.phone}">${app.phone}</a></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Application ID:</td><td><code>${app.applicationId}</code></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Date & Time:</td><td>${app.dateTime}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Resume Link:</td><td><a href="${app.resumeUrl}" target="_blank" style="background:#0284C7;color:#fff;padding:6px 12px;border-radius:4px;text-decoration:none;font-weight:bold;">View in Google Drive</a></td></tr>
        </table>
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: HR_EMAIL,
    subject: subject,
    htmlBody: htmlBody
  });
}
