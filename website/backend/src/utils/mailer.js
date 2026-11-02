import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { buildAdminOtpEmail, buildPasswordResetEmail } from '../templates/emails/index.js';

function getTransporter() {
  const isGmail = env.SMTP_HOST && env.SMTP_HOST.toLowerCase().includes('gmail');
  const user = (env.SMTP_USER && env.SMTP_USER.includes('@')) 
    ? env.SMTP_USER 
    : (env.ADMIN_EMAIL || 'nispldeveloper@gmail.com');

  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass: env.SMTP_PASS }
    });
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: { user, pass: env.SMTP_PASS }
  });
}

export async function sendPasswordResetEmail(email, resetUrl) {
  if (!env.SMTP_HOST || !env.SMTP_PASS) {
    if (env.NODE_ENV !== 'production') {
      console.warn(`SMTP not configured. Development reset URL for ${email}: ${resetUrl}`);
      return;
    }
    throw new Error('Email service is not configured.');
  }

  const transporter = getTransporter();
  const { subject, text, html } = buildPasswordResetEmail({
    email,
    resetUrl,
    expiresInMinutes: env.PASSWORD_RESET_EXPIRES_MINUTES
  });

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: email,
    subject,
    text,
    html
  });
}

export async function sendAdminOtpEmail(email, otp) {
  if (!env.SMTP_HOST || !env.SMTP_PASS) {
    console.log(`\n==============================================`);
    console.log(`[NISPL DEV MAIL] Admin Creation OTP for ${email}: ${otp}`);
    console.log(`==============================================\n`);
    return;
  }

  const transporter = getTransporter();
  const { subject, text, html } = buildAdminOtpEmail({
    email,
    otp,
    expiresInMinutes: 10
  });

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: email,
    subject,
    text,
    html
  });
}
