import { authApi } from './authApi';

/**
 * Shared request helpers for the admin-only API services. Every endpoint these
 * talk to is permission-gated server-side, so the bearer token must always ride
 * along and a 401/403 has to reach the UI as readable text.
 */
export const withAuth = (headers = {}) => {
  const token = authApi.getAuthToken();
  return {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export async function readApiError(res, fallback) {
  let payload = null;
  try {
    payload = await res.json();
  } catch {
    /* error body was not JSON */
  }
  const message = payload?.message || payload?.error;
  if (res.status === 403) return new Error(message || 'You do not have permission to perform this action.');
  if (res.status === 401) return new Error('Your session has expired. Please sign in again.');
  return new Error(message || fallback);
}
