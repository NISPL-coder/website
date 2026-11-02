/**
 * Shared design tokens for NISPL transactional emails.
 * All values are inlined by the templates because email clients do not
 * reliably support external stylesheets.
 */

export const BRAND = {
  shortName: 'NISPL',
  name: 'Net Infotech System Pvt. Ltd.',
  tagline: 'Cloud · Tally · IT Infrastructure',
  address: 'Webel Tower 1, IT Park, Sector V, Salt Lake City, Kolkata 700091',
  supportEmail: 'support@netinfotechsystem.com',
  phone: '+91 93301 13000',
  website: 'https://www.netinfotechsystem.com',
  year: new Date().getFullYear()
};

export const FONT =
  "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";

export const MONO_FONT = "'Courier New', Consolas, Menlo, monospace";

export const COLORS = {
  page: '#EDF4FB',
  ink: '#0B1526',
  heading: '#0D1B2F',
  body: '#47566B',
  muted: '#7A8AA0',
  line: '#E4EDF6',
  soft: '#F5F9FD',
  accent: '#2C7BC4',
  accentSoft: '#E7F3FD',
  button: '#12161F',
  amberBg: '#FFF8EC',
  amberBorder: '#F1DCB2',
  amberText: '#8A6320'
};

/** Escape user-controlled values that are interpolated into HTML text nodes. */
export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escape user-controlled values that are interpolated into HTML attributes. */
export function escapeAttr(value = '') {
  return escapeHtml(value).replace(/`/g, '&#96;');
}
