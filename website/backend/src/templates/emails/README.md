# NISPL transactional email templates

Premium, branded email templates used by the authentication backend.

## Files

| File | Purpose |
| --- | --- |
| `layout.js` | Shared 600px shell: preheader, dark brand header, white card, footer. |
| `components.js` | Reusable blocks: CTA button, fallback link, expiry notice, security note, OTP code box, signature. |
| `passwordResetEmail.js` | Builds the password reset email. |
| `adminOtpEmail.js` | Builds the administrator verification (OTP) email. |
| `theme.js` | Brand tokens (name, address, support email, colours, fonts) and escaping helpers. |
| `index.js` | Public exports. |

Every builder returns `{ subject, text, html }`, so `mailer.js` only needs to pass
the result to Nodemailer.

## Usage

```js
import { buildPasswordResetEmail } from '../templates/emails/index.js';

const { subject, text, html } = buildPasswordResetEmail({
  email: 'client@example.com',
  resetUrl: 'https://app.example.com/reset-password?token=...',
  expiresInMinutes: 15
});
```

## Preview

Generate standalone HTML files in `website/Backend/email-previews`:

```bash
cd website/Backend
npm run preview:emails
```

Open `email-previews/index.html` in a browser, or open
`email-previews/password-reset.html` / `email-previews/admin-otp.html` directly.

## Design notes

- Table-based layout with fully inline CSS for Gmail, Outlook, Apple Mail and mobile clients.
- Outlook-specific VML fallback for the primary CTA button.
- Hidden preheader text for a clean inbox preview.
- `color-scheme` locked to light so dark-mode clients do not invert the brand colours.
- Mobile breakpoint at 620px: full-width container, reduced padding, smaller title.
- All dynamic values are HTML-escaped before interpolation.
