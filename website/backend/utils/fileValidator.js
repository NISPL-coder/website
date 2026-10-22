import path from 'path';

/**
 * Known magic numbers for allowed document formats:
 * PDF:  %PDF- (hex: 25 50 44 46)
 * DOCX: PK\x03\x04 (hex: 50 4B 03 04 - standard Zip format used by OpenXML)
 * DOC:  Compound File Binary (hex: D0 CF 11 E0 A1 B1 1A E1)
 */
const MAGIC_SIGNATURES = {
  pdf: [0x25, 0x50, 0x44, 0x46],
  docx: [0x50, 0x4B, 0x03, 0x04],
  doc: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]
};

/**
 * Validate resume file buffer against its claimed extension, mime type, and magic bytes
 * @param {Object} file - Multer file object
 * @param {number} maxSizeMb - Max allowed file size in MB
 * @returns {{ valid: boolean, error?: string, extension?: string }}
 */
export function validateResumeFile(file, maxSizeMb = 5) {
  if (!file) {
    return { valid: false, error: 'Resume file is required.' };
  }

  // 1. File size check
  const maxBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return { 
      valid: false, 
      error: `Resume file exceeds maximum size limit of ${maxSizeMb} MB.` 
    };
  }

  // 2. Extension check
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (!['.pdf', '.doc', '.docx'].includes(ext)) {
    return { 
      valid: false, 
      error: 'Invalid file extension. Only PDF, DOC, and DOCX formats are supported.' 
    };
  }

  // 3. MIME type check
  const validMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream' // sometimes sent by some OS/browsers for doc/docx
  ];
  if (file.mimetype && !validMimes.includes(file.mimetype.toLowerCase())) {
    return { 
      valid: false, 
      error: `Unsupported MIME type (${file.mimetype}). Please upload a valid PDF or Word document.` 
    };
  }

  // 4. Magic Byte content inspection
  const buffer = file.buffer;
  if (!buffer || buffer.length < 8) {
    return { 
      valid: false, 
      error: 'Corrupted or empty file uploaded.' 
    };
  }

  let matchesSignature = false;

  if (ext === '.pdf') {
    // Check %PDF
    matchesSignature = MAGIC_SIGNATURES.pdf.every((byte, idx) => buffer[idx] === byte);
  } else if (ext === '.docx') {
    // Check PK\x03\x04
    matchesSignature = MAGIC_SIGNATURES.docx.every((byte, idx) => buffer[idx] === byte);
  } else if (ext === '.doc') {
    // Check OLE compound document signature
    matchesSignature = MAGIC_SIGNATURES.doc.every((byte, idx) => buffer[idx] === byte);
  }

  if (!matchesSignature) {
    return { 
      valid: false, 
      error: `The file contents do not match a valid ${ext.toUpperCase().slice(1)} format. File may be corrupted or disguised.` 
    };
  }

  return { valid: true, extension: ext };
}
