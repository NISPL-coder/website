import { BRAND, COLORS, FONT, escapeHtml } from './theme.js';

/**
 * Premium transactional email shell.
 *
 * Table-based and fully inline-styled for broad client support
 * (Gmail, Outlook, Apple Mail, Yahoo, iOS and Android).
 */
export function renderEmailLayout({
  preheader,
  title,
  eyebrow,
  contentHtml,
  recipientEmail,
  footerNote = 'This is an automated security message. Please do not reply.'
}) {
  const safeTitle = escapeHtml(title);
  const safePreheader = escapeHtml(preheader);
  const safeRecipient = recipientEmail ? escapeHtml(recipientEmail) : '';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <title>${safeTitle}</title>
  <!--[if mso]>
  <xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a { text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .email-pad { padding-left: 24px !important; padding-right: 24px !important; }
      .email-hero { padding-top: 34px !important; padding-bottom: 30px !important; }
      .email-title { font-size: 23px !important; line-height: 30px !important; }
      .email-header-badge { display: none !important; }
      .email-footer { padding-left: 24px !important; padding-right: 24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.page};">
  <!-- Preheader: shown in the inbox preview, hidden in the email body -->
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;color:${COLORS.page};">
    ${safePreheader}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLORS.page}" style="background-color:${COLORS.page};">
    <tr>
      <td align="center" style="padding:34px 12px 40px;">

        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

          <!-- Accent bar -->
          <tr>
            <td height="6" bgcolor="#3D8FD9" style="height:6px;background-color:#3D8FD9;background-image:linear-gradient(90deg,#8FCCEE 0%,#3D8FD9 55%,#0B1526 100%);border-radius:18px 18px 0 0;font-size:0;line-height:0;">
              &nbsp;
            </td>
          </tr>

          <!-- Brand header -->
          <tr>
            <td bgcolor="${COLORS.ink}" style="background-color:${COLORS.ink};padding:24px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <div style="font-family:${FONT};font-size:21px;font-weight:700;letter-spacing:0.16em;line-height:1.1;color:#ffffff;">
                      ${BRAND.shortName}
                    </div>
                    <div style="margin-top:5px;font-family:${FONT};font-size:9px;font-weight:600;letter-spacing:0.24em;text-transform:uppercase;color:#8FB6D9;">
                      Net Infotech System
                    </div>
                  </td>
                  <td class="email-header-badge" align="right" valign="middle">
                    <span style="display:inline-block;padding:7px 12px;border:1px solid rgba(143,204,238,0.35);border-radius:999px;font-family:${FONT};font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#B9DCF3;">
                      Secure Message
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body card -->
          <tr>
            <td class="email-hero email-pad" bgcolor="#FFFFFF" style="background-color:#ffffff;padding:42px 40px 34px;border-left:1px solid ${COLORS.line};border-right:1px solid ${COLORS.line};">

              <!-- Monogram badge -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;">
                <tr>
                  <td width="52" height="52" align="center" valign="middle" bgcolor="${COLORS.ink}" style="width:52px;height:52px;background-color:${COLORS.ink};border-radius:14px;font-family:${FONT};font-size:24px;font-weight:700;color:#ffffff;line-height:1;">
                    N
                  </td>
                </tr>
              </table>

              <div style="margin:0 0 10px;font-family:${FONT};font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.accent};">
                ${escapeHtml(eyebrow)}
              </div>

              <h1 class="email-title" style="margin:0 0 20px;font-family:${FONT};font-size:26px;line-height:34px;font-weight:700;letter-spacing:-0.3px;color:${COLORS.heading};">
                ${escapeHtml(title)}
              </h1>

              ${contentHtml}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="email-footer" bgcolor="#F7FAFD" style="background-color:#F7FAFD;padding:26px 40px 28px;border:1px solid ${COLORS.line};border-top:none;border-radius:0 0 18px 18px;">

              <div style="font-family:${FONT};font-size:13px;font-weight:700;letter-spacing:0.08em;color:${COLORS.heading};">
                ${BRAND.shortName} <span style="font-weight:400;color:${COLORS.muted};">·</span> ${BRAND.name}
              </div>
              <div style="margin-top:6px;font-family:${FONT};font-size:11px;line-height:1.65;color:${COLORS.muted};">
                ${escapeHtml(BRAND.address)}
              </div>
              <div style="margin-top:8px;font-family:${FONT};font-size:11px;line-height:1.65;color:${COLORS.muted};">
                <a href="mailto:${BRAND.supportEmail}" style="color:${COLORS.accent};text-decoration:none;">${BRAND.supportEmail}</a>
                <span style="color:#C3D2E2;">&nbsp;|&nbsp;</span>
                <a href="tel:${BRAND.phone.replace(/\s/g, '')}" style="color:${COLORS.accent};text-decoration:none;">${BRAND.phone}</a>
                <span style="color:#C3D2E2;">&nbsp;|&nbsp;</span>
                <a href="${BRAND.website}" target="_blank" rel="noopener" style="color:${COLORS.accent};text-decoration:none;">netinfotechsystem.com</a>
              </div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 14px;">
                <tr><td height="1" bgcolor="${COLORS.line}" style="height:1px;background-color:${COLORS.line};font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>

              <div style="font-family:${FONT};font-size:10px;line-height:1.7;color:#93A3B6;">
                ${escapeHtml(footerNote)}<br />
                ${safeRecipient ? `Sent to <span style="color:#6F8196;">${safeRecipient}</span>.<br />` : ''}
                &copy; ${BRAND.year} ${BRAND.name} All rights reserved.
              </div>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
