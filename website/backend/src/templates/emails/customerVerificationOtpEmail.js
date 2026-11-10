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
 * Customer Primary Email verification (OTP) email.
 *
 * @param {object} options
 * @param {string} options.email          Recipient address.
 * @param {string} options.otp            Six-digit one-time password.
 * @param {string} [options.name]         Customer contact name.
 * @param {number} [options.expiresInMinutes=10]
 * @returns {{ subject: string, text: string, html: string }}
 */
export function buildCustomerVerificationOtpEmail({ email, otp, name = '', expiresInMinutes = 10 }) {
  const minutes = Number(expiresInMinutes) || 10;
  const code = escapeHtml(otp);
  const recipient = email ? escapeHtml(email) : '';
  const customerName = name ? escapeHtml(name) : 'Valued Customer';

  const contentHtml = [
    paragraph(`Dear ${customerName},`),
    lead(
      `To complete your customer portal sign-in and verify your primary business email${
        recipient ? ` (<strong style="font-weight:600;color:#0D1B2F;">${recipient}</strong>)` : ''
      }, please enter the one-time verification code below:`
    ),
    codeBox(otp),
    expiryNote(
      `<strong style="font-weight:700;">This verification code expires in ${minutes} minutes</strong> and can be used only once. Never share this code with anyone.`
    ),
    divider(),
    securityNote({
      title: 'Didn&rsquo;t request this verification code?',
      text: `If you did not attempt to sign in to your NISPL Customer Portal, please ignore this email or contact support immediately at <a href="mailto:${BRAND.supportEmail}" style="color:#2C7BC4;text-decoration:underline;">${BRAND.supportEmail}</a>.`
    }),
    fineprint('NISPL Cloud Systems will never request your OTP via phone, chat, or unsolicited email.'),
    signature()
  ].join('\n');

  const html = renderEmailLayout({
    preheader: `Your NISPL verification code is ${code} — valid for ${minutes} minutes.`,
    title: 'Verify your primary email',
    eyebrow: 'Customer Portal Verification',
    contentHtml,
    recipientEmail: email
  });

  const text = `NISPL — Verify Your Primary Email

Dear ${name || 'Valued Customer'},

Use this one-time code to verify your primary business email and access your NISPL Customer Portal${
    email ? ` (${email})` : ''
  }:

${otp}

This code expires in ${minutes} minutes and can be used only once. Never share this code with anyone.

If you did not request this verification, please contact ${BRAND.supportEmail} immediately.

Best regards,
The Net Infotech System (NISPL) Team
`;

  return {
    subject: `Your NISPL Customer Portal Verification Code: ${otp}`,
    text,
    html
  };
}

