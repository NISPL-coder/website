import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

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

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: email,
    subject: 'Reset your NISPL account password',
    text: `A password reset was requested for your NISPL account. Use this link within ${env.PASSWORD_RESET_EXPIRES_MINUTES} minutes: ${resetUrl}\n\nIf you did not request this, ignore this email.`,
    html: `<p>A password reset was requested for your NISPL account.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in ${env.PASSWORD_RESET_EXPIRES_MINUTES} minutes. If you did not request this, ignore this email.</p>`
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

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: email,
    subject: 'NISPL Admin Account Creation OTP',
    text: `Your verification OTP for creating the NISPL Admin account is: ${otp}\nThis code is valid for 10 minutes.\nIf you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #0f172a; margin-top: 0;">NISPL Admin Verification</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.5;">
          Use the following One-Time Password (OTP) to verify authorization and create your NISPL Administrator account:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 14px 28px; background: #f0fdf4; border: 1px dashed #22c55e; border-radius: 8px; display: inline-block; color: #15803d; font-family: monospace;">
            ${otp}
          </span>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.4;">
          This OTP is valid for 10 minutes. If you did not request this action, please secure your email and notify the security team immediately.
        </p>
      </div>
    `
  });
}
