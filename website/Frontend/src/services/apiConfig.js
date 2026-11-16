/**
 * Unified Backend API URL resolution.
 * Automatically handles localhost, 127.0.0.1, LAN IPs, port 5173 dev server,
 * and remote production deployments.
 */
export const isLocalOrDev = Boolean(
  typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]' ||
    window.location.port === '5173' ||
    window.location.port === '3000' ||
    /^(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|163\.128\.)/.test(window.location.hostname) ||
    window.location.hostname.endsWith('.local')
  )
);

export const BACKEND_URL = isLocalOrDev
  ? `${typeof window !== 'undefined' && window.location.protocol ? window.location.protocol : 'http:'}//${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:4000`
  : (import.meta.env.VITE_API_URL || 'https://website-ebxf.onrender.com');

export default BACKEND_URL;
