import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import {
  buildAdminOtpEmail,
  buildPasswordResetEmail,
  buildCustomerVerificationOtpEmail
} from '../templates/emails/index.js';

let cachedTransporter = null;

/**
 * Send email over HTTPS (Port 443) via Brevo or Resend REST APIs.
 * This completely bypasses Render/cloud host firewall blocks on SMTP ports (25, 465, 587).
 */
async function sendViaHttpApi(mailOptions) {
  const brevoKey = process.env.BREVO_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const gmailWebhook = process.env.GMAIL_WEBHOOK_URL;

  // 1. Google Apps Script Webhook (Native Gmail via HTTPS Port 443)
  if (gmailWebhook) {
    const res = await fetch(gmailWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
        text: mailOptions.text
      }),
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) {
      throw new Error(`Gmail Webhook returned HTTP ${res.status}`);
    }
    return await res.json().catch(() => ({ success: true }));
  }

  // 2. Brevo REST API (HTTPS Port 443)
  if (brevoKey) {
    const senderEmail = env.SMTP_USER && env.SMTP_USER.includes('@')
      ? env.SMTP_USER
      : (env.ADMIN_EMAIL || 'nispldeveloper@gmail.com');

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'NISPL Security', email: senderEmail },
        to: [{ email: mailOptions.to }],
        subject: mailOptions.subject,
        htmlContent: mailOptions.html,
        textContent: mailOptions.text
      }),
      signal: AbortSignal.timeout(5000)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(`Brevo HTTP API error (${res.status}): ${errData.message || res.statusText}`);
    }
    return await res.json();
  }

  // 3. Resend REST API (HTTPS Port 443)
  if (resendKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.MAIL_FROM || 'NISPL <onboarding@resend.dev>',
        to: [mailOptions.to],
        subject: mailOptions.subject,
        html: mailOptions.html,
        text: mailOptions.text
      }),
      signal: AbortSignal.timeout(5000)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(`Resend HTTP API error (${res.status}): ${errData.message || res.statusText}`);
    }
    return await res.json();
  }

  return null;
}

/**
 * Build an optimized, pooled Nodemailer transporter with strict timeouts
 * and IPv4 enforcement to prevent IPv6 DNS hangs on cloud hosting (Render/Docker).
 */
function createTransporter(port = null, secure = null) {
  const isGmail = env.SMTP_HOST && env.SMTP_HOST.toLowerCase().includes('gmail');
  const user = (env.SMTP_USER && env.SMTP_USER.includes('@')) 
    ? env.SMTP_USER 
    : (env.ADMIN_EMAIL || 'nispldeveloper@gmail.com');

  const resolvedPort = port ?? Number(env.SMTP_PORT || (isGmail ? 465 : 587));
  const resolvedSecure = secure ?? (resolvedPort === 465 || env.SMTP_SECURE === true);

  const baseConfig = {
    auth: { user, pass: env.SMTP_PASS },
    family: 4, // Force IPv4 (vital for Render/cloud containers that lack IPv6 routes)
    connectionTimeout: 4500, // 4.5s max to establish TCP connection (default was 120s!)
    greetingTimeout: 3500,   // 3.5s max for SMTP greeting
    socketTimeout: 5500,     // 5.5s socket inactivity timeout
    pool: true,              // Reuse TCP connections
    maxConnections: 3,
    maxMessages: 50
  };

  if (isGmail && resolvedPort === 465) {
    return nodemailer.createTransport({
      service: 'gmail',
      ...baseConfig
    });
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST || 'smtp.gmail.com',
    port: resolvedPort,
    secure: resolvedSecure,
    ...baseConfig
  });
}

function getTransporter() {
  if (!cachedTransporter) {
    cachedTransporter = createTransporter();
  }
  return cachedTransporter;
}

/**
 * Send email with priority HTTPS API, strict timeout race, and SMTP port fallback.
 * Ensures the HTTP request is NEVER held open for more than 5.5 seconds.
 */
async function sendMailWithResilience(mailOptions) {
  // 1. Try HTTPS API first if configured (Port 443 is never blocked by Render)
  if (process.env.BREVO_API_KEY || process.env.RESEND_API_KEY) {
    try {
      const httpResult = await sendViaHttpApi(mailOptions);
      if (httpResult) return httpResult;
    } catch (httpErr) {
      console.warn(`[NISPL Mailer] HTTPS email API failed: ${httpErr.message}. Falling back to SMTP...`);
    }
  }

  // 2. SMTP dispatch with strict timeout
  const primaryTransporter = getTransporter();

  const sendWithTimeout = (transporter, timeoutMs = 5000) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`SMTP Connection timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      transporter.sendMail(mailOptions)
        .then((res) => {
          clearTimeout(timer);
          resolve(res);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  };

  try {
    return await sendWithTimeout(primaryTransporter, 5000);
  } catch (primaryErr) {
    console.warn(`[NISPL Mailer] Primary SMTP dispatch failed (${primaryErr.message}). Attempting fallback port 587...`);
    cachedTransporter = null;
    
    try {
      const fallbackTransporter = createTransporter(587, false);
      const res = await sendWithTimeout(fallbackTransporter, 4500);
      cachedTransporter = fallbackTransporter;
      return res;
    } catch (fallbackErr) {
      console.error(`[NISPL Mailer] Fallback SMTP dispatch also failed: ${fallbackErr.message}`);
      throw fallbackErr;
    }
  }
}

export async function sendPasswordResetEmail(email, resetUrl) {
  if (!env.SMTP_HOST || !env.SMTP_PASS) {
    console.warn(`[NISPL Mailer] SMTP not configured. Reset URL for ${email}: ${resetUrl}`);
    return;
  }

  const { subject, text, html } = buildPasswordResetEmail({
    email,
    resetUrl,
    expiresInMinutes: env.PASSWORD_RESET_EXPIRES_MINUTES
  });

  await sendMailWithResilience({
    from: env.MAIL_FROM,
    to: email,
    subject,
    text,
    html
  });
}

export async function sendAdminOtpEmail(email, otp) {
  console.log(`\n===============================================================`);
  console.log(`[NISPL ADMIN OTP] Verification Code for ${email}: ${otp}`);
  console.log(`===============================================================\n`);

  if (!process.env.BREVO_API_KEY && !process.env.RESEND_API_KEY && (!env.SMTP_HOST || !env.SMTP_PASS)) {
    return;
  }

  const { subject, text, html } = buildAdminOtpEmail({
    email,
    otp,
    expiresInMinutes: 10
  });

  await sendMailWithResilience({
    from: env.MAIL_FROM,
    to: email,
    subject,
    text,
    html
  });
}

export async function sendCustomerVerificationOtpEmail(email, otp, name = '') {
  console.log(`\n===============================================================`);
  console.log(`[NISPL CUSTOMER OTP] Verification Code for ${email}: ${otp}`);
  console.log(`===============================================================\n`);

  if (!process.env.BREVO_API_KEY && !process.env.RESEND_API_KEY && (!env.SMTP_HOST || !env.SMTP_PASS)) {
    return;
  }

  const { subject, text, html } = buildCustomerVerificationOtpEmail({
    email,
    otp,
    name,
    expiresInMinutes: 10
  });

  await sendMailWithResilience({
    from: env.MAIL_FROM,
    to: email,
    subject,
    text,
    html
  });
}
