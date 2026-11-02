import { BRAND, escapeHtml } from './theme.js';
import {
  codeBox,
  divider,
  expiryNote,
  fineprint,
  lead,
  paragraph,
  securityNote,
  signature
} from './components.js';
import { renderEmailLayout } from './layout.js';

/**
 * Premium administrator account verification (OTP) email.
 *
 * @param {object} options
 * @param {string} options.email          Recipient address.
 * @param {string} options.otp            Six-digit one-time password.
 * @param {number} [options.expiresInMinutes=10]
 * @returns {{ subject: string, text: string, html: string }}
 */
export function buildAdminOtpEmail({ email, otp, expiresInMinutes = 10 }) {
  const minutes = Number(expiresInMinutes) || 10;
  const code = escapeHtml(otp);
  const recipient = email ? escapeHtml(email) : '';

  const contentHtml = [
    paragraph('Hello,'),
    lead(
      `Use the one-time code below to verify your email and create the NISPL administrator account${
        recipient ? ` for <strong style="font-weight:600;color:#0D1B2F;">${recipient}</strong>` : ''
      }.`
    ),
    codeBox(otp),
    expiryNote(
      `<strong style="font-weight:700;">This code expires in ${minutes} minutes</strong> and can be used only once. Never share it with anyone.`
    ),
    divider(),
    securityNote({
      title: 'Didn&rsquo;t request this code?',
      text: `Someone may be trying to create an administrator account. Ignore this email and, if attempts continue, contact <a href="mailto:${BRAND.supportEmail}" style="color:#2C7BC4;text-decoration:underline;">${BRAND.supportEmail}</a> immediately.`
    }),
    fineprint('NISPL will never ask you for this code by phone, chat or email.'),
    signature()
  ].join('\n');

  const html = renderEmailLayout({
    preheader: `Your NISPL verification code is ${code} — it expires in ${minutes} minutes.`,
    title: 'Your verification code',
    eyebrow: 'Account verification',
    contentHtml,
    recipientEmail: email
  });

  const text = `NISPL — Your verification code

Use this one-time code to verify your email and create the NISPL administrator account${
    email ? ` (${email})` : ''
  }:

    ${otp}

This code expires in ${minutes} minutes and can be used only once. Never share it with anyone.

If you didn't request this code, someone may be trying to create an administrator account. Ignore this email and, if attempts continue, contact ${BRAND.supportEmail} immediately.

— The NISPL Security Team

${BRAND.name}
${BRAND.address}
${BRAND.supportEmail} | ${BRAND.phone}
`;

  return {
    subject: 'Your NISPL verification code',
    text,
    html
  };
}
