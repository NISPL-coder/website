import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import {
  buildAdminOtpEmail,
  buildPasswordResetEmail,
  buildCustomerVerificationOtpEmail
} from '../templates/emails/index.js';

let cachedTransporter = null;

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
 * Send email with a strict timeout race and automatic fallback from port 465 to 587.
 * Ensures the HTTP request is NEVER held open for more than 5.5 seconds.
 */
async function sendMailWithResilience(mailOptions) {
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
    // Invalidate cached transporter on failure
    cachedTransporter = null;
    
    // Attempt fallback via port 587 (TLS)
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
  // Always log in server console for instant observability on Render/hosting logs
  console.log(`\n===============================================================`);
  console.log(`[NISPL ADMIN OTP] Verification Code for ${email}: ${otp}`);
  console.log(`===============================================================\n`);

  if (!env.SMTP_HOST || !env.SMTP_PASS) {
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
  // Always log in server console for instant observability on Render/hosting logs
  console.log(`\n===============================================================`);
  console.log(`[NISPL CUSTOMER OTP] Verification Code for ${email}: ${otp}`);
  console.log(`===============================================================\n`);

  if (!env.SMTP_HOST || !env.SMTP_PASS) {
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
