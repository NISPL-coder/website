import { BRAND, COLORS, FONT, MONO_FONT, escapeAttr, escapeHtml } from './theme.js';

/**
 * Reusable, table-based building blocks for transactional emails.
 * Everything uses inline styles so it renders consistently in Gmail,
 * Outlook, Apple Mail and mobile clients.
 */

export function paragraph(html, { margin = '0 0 18px', size = '15px', color = COLORS.body } = {}) {
  return `<p style="margin:${margin};font-family:${FONT};font-size:${size};line-height:1.7;color:${color};">${html}</p>`;
}

export function lead(html) {
  return paragraph(html, { size: '16px', color: COLORS.body, margin: '0 0 20px' });
}

export function fineprint(html) {
  return `<p style="margin:22px 0 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${COLORS.muted};">${html}</p>`;
}

export function divider() {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 22px;">
      <tr><td style="height:1px;background-color:${COLORS.line};font-size:0;line-height:0;">&nbsp;</td></tr>
    </table>`;
}

/**
 * Primary call-to-action. Includes an Outlook VML fallback so the button
 * keeps its rounded shape and padding in desktop Outlook.
 */
export function actionButton({ href, label }) {
  const url = escapeAttr(href);
  const text = escapeHtml(label);

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:2px 0 0;">
      <tr>
        <td align="center" bgcolor="${COLORS.button}" style="border-radius:10px;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
            href="${url}" style="height:50px;v-text-anchor:middle;width:250px;" arcsize="20%" strokecolor="${COLORS.button}" fillcolor="${COLORS.button}">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:${FONT};font-size:15px;font-weight:700;">${text}</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${url}" target="_blank" rel="noopener"
            style="display:inline-block;padding:16px 34px;font-family:${FONT};font-size:15px;font-weight:700;line-height:1;color:#ffffff;background-color:${COLORS.button};border-radius:10px;text-decoration:none;">
            ${text} &nbsp;&rarr;
          </a>
          <!--<![endif]-->
        </td>
      </tr>
    </table>`;
}

/** Copy-and-paste fallback for clients that block the button. */
export function fallbackLink(url) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 0;">
      <tr>
        <td style="padding:12px 16px;background-color:${COLORS.soft};border:1px solid ${COLORS.line};border-radius:10px;">
          <div style="font-family:${FONT};font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${COLORS.muted};margin-bottom:6px;">
            Or copy this secure link
          </div>
          <div style="font-family:${MONO_FONT};font-size:12px;line-height:1.55;color:${COLORS.accent};word-break:break-all;">
            ${escapeHtml(url)}
          </div>
        </td>
      </tr>
    </table>`;
}

/** Amber, time-sensitive notice used for expiring links and codes. */
export function expiryNote(html) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 0;">
      <tr>
        <td style="padding:12px 16px;background-color:${COLORS.amberBg};border:1px solid ${COLORS.amberBorder};border-left:3px solid #E0A63C;border-radius:8px;font-family:${FONT};font-size:13px;line-height:1.55;color:${COLORS.amberText};">
          ${html}
        </td>
      </tr>
    </table>`;
}

/** Soft blue panel used for "didn't request this?" guidance. */
export function securityNote({ title, text }) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding:16px 18px;background-color:${COLORS.soft};border:1px solid ${COLORS.line};border-left:3px solid ${COLORS.accent};border-radius:8px;">
          <div style="font-family:${FONT};font-size:13px;font-weight:700;color:${COLORS.heading};margin-bottom:4px;">
            ${title}
          </div>
          <div style="font-family:${FONT};font-size:13px;line-height:1.6;color:#5B6B80;">
            ${text}
          </div>
        </td>
      </tr>
    </table>`;
}

/** Large, spaced one-time-code panel for OTP emails. */
export function codeBox(code) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 0;">
      <tr>
        <td align="center" style="padding:24px 16px 22px;background-color:${COLORS.soft};border:1px solid #DCE9F5;border-radius:14px;">
          <div style="font-family:${MONO_FONT};font-size:34px;font-weight:700;letter-spacing:11px;line-height:1;color:#0B3B66;padding-left:11px;">
            ${escapeHtml(code)}
          </div>
          <div style="margin-top:12px;font-family:${FONT};font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${COLORS.muted};">
            One-time verification code
          </div>
        </td>
      </tr>
    </table>`;
}

/** Small brand signature used at the end of the body copy. */
export function signature() {
  return `
    <p style="margin:24px 0 0;font-family:${FONT};font-size:14px;line-height:1.6;color:${COLORS.body};">
      — The ${BRAND.shortName} Security Team
    </p>`;
}
