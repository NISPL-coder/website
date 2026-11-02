import { BRAND } from './theme.js';
import { escapeHtml } from './theme.js';
import {
  actionButton,
  divider,
  expiryNote,
  fallbackLink,
  fineprint,
  lead,
  paragraph,
  securityNote,
  signature
} from './components.js';
import { renderEmailLayout } from './layout.js';

/**
 * Premium password reset email.
 *
 * @param {object} options
 * @param {string} options.email          Recipient address.
 * @param {string} options.resetUrl       One-time password reset URL.
 * @param {number} [options.expiresInMinutes=15]
 * @returns {{ subject: string, text: string, html: string }}
 */
export function buildPasswordResetEmail({ email, resetUrl, expiresInMinutes = 15 }) {
  const minutes = Number(expiresInMinutes) || 15;
  const recipient = email ? escapeHtml(email) : '';

  const contentHtml = [
    paragraph('Hello,'),
    lead(
      `We received a request to reset the password for the NISPL account associated with${
        recipient ? ` <strong style="font-weight:600;color:#0D1B2F;">${recipient}</strong>` : ' your email address'
      }.`
    ),
    paragraph(
      'Click the button below to choose a new password. For your security, this link can be used only once.'
    ),
    actionButton({ href: resetUrl, label: 'Reset password' }),
    fallbackLink(resetUrl),
    expiryNote(
      `<strong style="font-weight:700;">This link expires in ${minutes} minutes.</strong> After that, you will need to request a new reset link.`
    ),
    divider(),
    securityNote({
      title: 'Didn&rsquo;t request this change?',
      text: `No action is needed — your current password will stay the same. If you keep receiving these emails, contact <a href="mailto:${BRAND.supportEmail}" style="color:#2C7BC4;text-decoration:underline;">${BRAND.supportEmail}</a>.`
    }),
    fineprint('Need help? Our support team is available Monday&ndash;Saturday, 10:00&ndash;19:00 IST.'),
    signature()
  ].join('\n');

  const html = renderEmailLayout({
    preheader: `Reset your NISPL password — this secure link expires in ${minutes} minutes.`,
    title: 'Reset your password',
    eyebrow: 'Account security',
    contentHtml,
    recipientEmail: email
  });

  const text = `NISPL — Reset your password

We received a request to reset the password for your NISPL account${
    email ? ` (${email})` : ''
  }.

Reset your password:
${resetUrl}

This link expires in ${minutes} minutes and can be used only once.

If you didn't request this, no action is needed — your password will stay the same. If you keep receiving these emails, contact ${BRAND.supportEmail}.

— The NISPL Security Team

${BRAND.name}
${BRAND.address}
${BRAND.supportEmail} | ${BRAND.phone}
`;

  return {
    subject: 'Reset your NISPL account password',
    text,
    html
  };
}
