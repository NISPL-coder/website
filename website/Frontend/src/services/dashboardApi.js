import { authApi } from './authApi';

const isLocalhost = Boolean(
  typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]'
  )
);

const BACKEND_URL = isLocalhost
  ? 'http://localhost:4000'
  : (import.meta.env.VITE_API_URL || 'https://website-ebxf.onrender.com');

const API_BASE_URL = `${BACKEND_URL}/api/dashboard`;

export const dashboardApi = {
  /**
   * Fetch complete Dashboard Overview section data
   * (Overview KPI cards, Sales & Revenue Progression Curve, Revenue Share by Solution)
   */
  async getOverview(params = {}) {
    const token = authApi.getAuthToken();
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/overview${query ? `?${query}` : ''}`, {
      method: 'GET',
      headers
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to fetch dashboard overview data.');
    }

    return data.data;
  },

  /**
   * Fetch the signed-in customer's own portal overview.
   * Scoped server-side, so it only ever returns this account's records.
   */
  async getMyOverview() {
    const token = authApi.getAuthToken();
    const res = await fetch(`${API_BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : null)
      }
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to fetch your account overview.');
    }

    return data.data;
  }
};

export default dashboardApi;
