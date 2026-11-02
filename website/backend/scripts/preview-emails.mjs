/**
 * Generates standalone HTML previews of the transactional emails so they can
 * be reviewed in a browser (and in tools such as Litmus or Email on Acid).
 *
 * Usage: npm run preview:emails
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPasswordResetEmail } from '../src/templates/emails/passwordResetEmail.js';
import { buildAdminOtpEmail } from '../src/templates/emails/adminOtpEmail.js';

const here = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(here, '../email-previews');

const sampleRecipient = 'client@netinfotechsystem.com';

const passwordReset = buildPasswordResetEmail({
  email: sampleRecipient,
  resetUrl: 'https://app.netinfotechsystem.com/reset-password?token=8f3c1d9a7e2b4c6d8e0f1a2b3c4d5e6f',
  expiresInMinutes: 15
});

const adminOtp = buildAdminOtpEmail({
  email: 'admin@netinfotechsystem.com',
  otp: '482913',
  expiresInMinutes: 10
});

const previews = [
  { file: 'password-reset.html', label: 'Password reset', data: passwordReset },
  { file: 'admin-otp.html', label: 'Admin verification code', data: adminOtp }
];

mkdirSync(outputDir, { recursive: true });

for (const preview of previews) {
  writeFileSync(resolve(outputDir, preview.file), preview.data.html, 'utf8');
}

const cards = previews
  .map(
    ({ file, label, data }) => `
      <a class="card" href="./${file}" target="_blank" rel="noopener">
        <span class="eyebrow">Transactional email</span>
        <h2>${label}</h2>
        <p>${data.subject}</p>
        <span class="open">Open preview &rarr;</span>
      </a>`
  )
  .join('');

writeFileSync(
  resolve(outputDir, 'index.html'),
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>NISPL email previews</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 40px 20px;
      background: linear-gradient(180deg, #8FCCEE 0%, #C6E5F8 34%, #EDF5FC 68%, #F7FAFD 100%);
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif;
      color: #0D1B2F;
    }
    .wrap { width: 100%; max-width: 760px; }
    .brand { font-size: 22px; font-weight: 700; letter-spacing: .16em; color: #0B1526; }
    .tagline { margin: 6px 0 28px; font-size: 12px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: #3C6C96; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
    .card {
      display: block;
      padding: 24px;
      border: 1px solid rgba(255,255,255,.9);
      border-radius: 18px;
      background: rgba(255,255,255,.92);
      box-shadow: 0 24px 50px -30px rgba(11,30,54,.45);
      text-decoration: none;
      color: inherit;
      transition: transform .2s ease, box-shadow .2s ease;
    }
    .card:hover { transform: translateY(-2px); box-shadow: 0 30px 60px -30px rgba(11,30,54,.55); }
    .eyebrow { font-size: 10px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: #2C7BC4; }
    .card h2 { margin: 10px 0 6px; font-size: 20px; letter-spacing: -.2px; }
    .card p { margin: 0 0 18px; font-size: 13px; line-height: 1.6; color: #5B6B80; }
    .open { font-size: 13px; font-weight: 700; color: #0B1526; }
    .foot { margin-top: 22px; font-size: 11px; color: #5B6B80; }
  </style>
</head>
<body>
  <main class="wrap">
    <div class="brand">NISPL</div>
    <div class="tagline">Net Infotech System &middot; Email previews</div>
    <section class="grid">${cards}
    </section>
    <p class="foot">Generated from <code>src/templates/emails</code>. Regenerate with <code>npm run preview:emails</code>.</p>
  </main>
</body>
</html>`,
  'utf8'
);

console.log(`Generated ${previews.length} email previews in ${outputDir}`);
for (const preview of previews) {
  console.log(`  - ${preview.file}`);
}
