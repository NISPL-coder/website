/**
 * Admin & Customer console colour theme.
 *
 * The console ships a curated dark surface layer (AdminThemeDark.css & CustomerThemeDark.css).
 * The resolved theme is written to <html data-adm-theme="light|dark"> so that
 * dialogs rendered through React portals (document.body) are themed too.
 */

const STORAGE_KEY = 'nispl_admin_theme';
const ATTR = 'data-adm-theme';

export const ADMIN_THEMES = { LIGHT: 'light', DARK: 'dark' };

/** Saved preference, or light for a first visit. */
export function readAdminTheme() {
  if (typeof window === 'undefined') return ADMIN_THEMES.LIGHT;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === ADMIN_THEMES.DARK || stored === ADMIN_THEMES.LIGHT) return stored;
  } catch {
    /* storage can be blocked — fall back to light */
  }
  return ADMIN_THEMES.LIGHT;
}

/** Persist the operator's explicit choice. */
export function persistAdminTheme(theme) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* non-fatal: the theme still applies for this session */
  }
}

/** Enable theme tokens for the console subtree. */
export function applyAdminTheme(theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute(ATTR, theme);
}

/** Leave the document on the light portal theme. */
export function clearAdminTheme() {
  if (typeof document === 'undefined') return;
  document.documentElement.removeAttribute(ATTR);
}
