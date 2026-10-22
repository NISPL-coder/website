import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../server.js';

let server;
let baseUrl;

test.before(() => {
  process.env.NODE_ENV = 'test';
  return new Promise((resolve) => {
    // Listen on dynamic ephemeral port (0) for isolated testing
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(() => {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
});

test('API GET /api/career/health - returns 200 OK and health status', async () => {
  const res = await fetch(`${baseUrl}/api/career/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
  assert.equal(data.service, 'NISPL Career Application API');
});

test('API POST /api/career/apply - rejects submission with missing fields (400)', async () => {
  const formData = new FormData();
  formData.append('name', 'Only Name');
  // missing email, phone, appliedRole, resume

  const res = await fetch(`${baseUrl}/api/career/apply`, {
    method: 'POST',
    body: formData
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.ok(data.error, 'Should contain error description');
});

test('API POST /api/career/apply - silently captures honeypot bots without recording', async () => {
  const formData = new FormData();
  formData.append('name', 'Spam Bot');
  formData.append('email', 'bot@spammer.com');
  formData.append('phone', '+1234567890');
  formData.append('appliedRole', 'IT Sales Manager');
  formData.append('website', 'http://malicious-link.com'); // honeypot filled

  const res = await fetch(`${baseUrl}/api/career/apply`, {
    method: 'POST',
    body: formData
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.applicationId, 'BOT-FILTERED');
  assert.equal(data.message, 'Your application has been received.');
});

test('API POST /api/career/apply - successfully accepts valid application (mock/simulation mode)', async () => {
  const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
  const blob = new Blob([pdfBuffer], { type: 'application/pdf' });

  const formData = new FormData();
  formData.append('name', 'Debasish Ray');
  formData.append('email', 'debasish.ray@example.com');
  formData.append('phone', '+91 98765 43210');
  formData.append('appliedRole', 'Cloud & Infrastructure Architect');
  formData.append('resume', blob, 'Debasish_Ray_Resume.pdf');

  const res = await fetch(`${baseUrl}/api/career/apply`, {
    method: 'POST',
    body: formData
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.data.applicationId.startsWith('APP-'));
  assert.equal(data.data.name, 'Debasish Ray');
  assert.equal(data.data.appliedRole, 'Cloud & Infrastructure Architect');
  assert.equal(data.data.status, 'New');
});

test('API POST /api/career/apply - prevents immediate duplicate submission within 60s window', async () => {
  const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
  const blob = new Blob([pdfBuffer], { type: 'application/pdf' });

  const makePayload = () => {
    const formData = new FormData();
    formData.append('name', 'Debasish Ray');
    formData.append('email', 'debasish.ray@example.com');
    formData.append('phone', '+91 98765 43210');
    formData.append('appliedRole', 'Cloud & Infrastructure Architect');
    formData.append('resume', blob, 'Debasish_Ray_Resume.pdf');
    return formData;
  };

  // Immediate retry should be caught as duplicate
  const res = await fetch(`${baseUrl}/api/career/apply`, {
    method: 'POST',
    body: makePayload()
  });

  assert.equal(res.status, 409);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.match(data.error, /duplicate application/i);
});
