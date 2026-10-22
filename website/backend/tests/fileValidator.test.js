import test from 'node:test';
import assert from 'node:assert/strict';
import { validateResumeFile } from '../utils/fileValidator.js';

test('fileValidator - accepts genuine PDF buffer with correct headers', () => {
  const pdfBuffer = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
  const file = {
    originalname: 'john_resume.pdf',
    mimetype: 'application/pdf',
    size: pdfBuffer.length,
    buffer: pdfBuffer
  };

  const result = validateResumeFile(file);
  assert.equal(result.valid, true, 'Valid PDF should pass validation');
  assert.equal(result.extension, '.pdf');
});

test('fileValidator - accepts genuine DOCX (ZIP archive) buffer', () => {
  // DOCX files begin with PK\x03\x04
  const docxBuffer = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00]);
  const file = {
    originalname: 'candidate_cv.docx',
    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: docxBuffer.length,
    buffer: docxBuffer
  };

  const result = validateResumeFile(file);
  assert.equal(result.valid, true, 'Valid DOCX should pass validation');
  assert.equal(result.extension, '.docx');
});

test('fileValidator - accepts legacy DOC buffer', () => {
  // Legacy DOC begins with D0 CF 11 E0 A1 B1 1A E1
  const docBuffer = Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1, 0x00, 0x00]);
  const file = {
    originalname: 'old_cv.doc',
    mimetype: 'application/msword',
    size: docBuffer.length,
    buffer: docBuffer
  };

  const result = validateResumeFile(file);
  assert.equal(result.valid, true, 'Valid legacy DOC should pass validation');
  assert.equal(result.extension, '.doc');
});

test('fileValidator - rejects spoofed executable renamed as .pdf', () => {
  // Windows EXE (MZ header with DOS stub, > 8 bytes)
  const fakePdfBuffer = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00]);
  const file = {
    originalname: 'malware.pdf',
    mimetype: 'application/pdf',
    size: fakePdfBuffer.length,
    buffer: fakePdfBuffer
  };

  const result = validateResumeFile(file);
  assert.equal(result.valid, false, 'Executable disguised as PDF must be rejected');
  assert.match(result.error, /do not match a valid PDF format/i);
});

test('fileValidator - rejects file exceeding 5MB limit', () => {
  const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
  largeBuffer.write('%PDF-1.4');

  const file = {
    originalname: 'huge_portfolio.pdf',
    mimetype: 'application/pdf',
    size: largeBuffer.length,
    buffer: largeBuffer
  };

  const result = validateResumeFile(file);
  assert.equal(result.valid, false, 'Files over 5MB must be rejected');
  assert.match(result.error, /exceeds maximum size limit/i);
});

test('fileValidator - rejects unauthorized extensions (.exe, .sh, .zip)', () => {
  const file = {
    originalname: 'archive.zip',
    mimetype: 'application/zip',
    size: 1024,
    buffer: Buffer.from([0x50, 0x4B, 0x03, 0x04])
  };

  const result = validateResumeFile(file);
  assert.equal(result.valid, false);
  assert.match(result.error, /invalid file extension/i);
});
