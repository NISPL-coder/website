import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import { app } from '../server.js';
import User from '../models/User.js';

import { connectDB, disconnectDB } from '../config/db.js';

describe('NISPL Auth API & MVC Integration Tests', () => {
  let server;
  let port;
  let baseUrl;

  const rand = Math.floor(1000 + Math.random() * 9000);
  const testEmail = `test.user.${Date.now()}.${rand}@example.com`;
  const testGst = `19AAAAB${rand}A1Z${rand % 9}`;
  const testPassword = 'Password#2026';
  let authToken = '';
  let customerId = '';

  before(async () => {
    await connectDB();
    return new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, () => {
        port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    // Cleanup test users from MongoDB
    try {
      await User.deleteMany({ email: /test\.user\./i });
    } catch (e) {
      // ignore
    }

    await new Promise((resolve) => {
      if (server) {
        server.close(resolve);
      } else {
        resolve();
      }
    });

    await disconnectDB();
  });

  it('1. POST /api/auth/register - Successfully register new customer', async () => {
    const payload = {
      name: 'Rohan Banerjee',
      email: testEmail,
      mobile: '9830112233',
      companyName: 'Banerjee Infotech LLP',
      gstNo: testGst,
      password: testPassword
    };

    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token, 'Token must be returned');
    assert.ok(data.user, 'User object must be returned');
    assert.equal(data.user.email, testEmail);
    assert.equal(data.user.role, 'customer');
    assert.equal(data.user.name, 'Rohan Banerjee');
    assert.equal(data.user.companyName, 'Banerjee Infotech LLP');
    assert.ok(data.user.customerId.startsWith('NIS-CUST-'));
    assert.equal(data.user.password, undefined, 'Password must not be returned');

    authToken = data.token;
    customerId = data.user.customerId;
  });

  it('2. POST /api/auth/register - Reject duplicate email (409 Conflict)', async () => {
    const payload = {
      name: 'Rohan Duplicate',
      email: testEmail,
      mobile: '9830112244',
      companyName: 'Duplicate Tech',
      gstNo: `19AAACC${rand}C1Z${(rand + 1) % 9}`,
      password: testPassword
    };

    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.equal(res.status, 409);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.error, /already exists/i);
  });

  it('3. POST /api/auth/register - Reject invalid data (400 Bad Request)', async () => {
    const payload = {
      name: 'R',
      email: 'not-an-email',
      mobile: '123',
      companyName: '',
      gstNo: 'invalid-gst',
      password: '123'
    };

    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.error);
  });

  it('4. POST /api/auth/login - Successfully login with email & password', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token);
    assert.equal(data.user.email, testEmail);
    assert.equal(data.user.password, undefined);
  });

  it('5. POST /api/auth/login - Successfully login with customerId & password', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerId,
        password: testPassword
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.customerId, customerId);
  });

  it('6. POST /api/auth/login - Reject wrong password (401 Unauthorized)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword123'
      })
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.error, /invalid email/i);
  });

  it('7. GET /api/auth/me - Access protected profile with Bearer token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.email, testEmail);
    assert.equal(data.user.role, 'customer');
  });

  it('8. GET /api/auth/me - Reject missing or invalid token (401)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        'Authorization': 'Bearer invalid.jwt.token'
      }
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  it('9. POST /api/auth/forgot-password - Send reset request', async () => {
    const res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.match(data.message, /dispatched|sent/i);
  });
});
