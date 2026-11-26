import { withAuth } from './apiAuth';
import { BACKEND_URL } from './apiConfig';

const BASE_URL = `${BACKEND_URL}/api/security`;

export const securityApi = {
  async getSecurityEvents(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.set(k, String(v));
      }
    });
    const res = await fetch(`${BASE_URL}/events?${query.toString()}`, {
      headers: withAuth({ Accept: 'application/json' })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch security events');
    }
    return data;
  },

  async getSecurityStatus() {
    const res = await fetch(`${BASE_URL}/status`, {
      headers: withAuth({ Accept: 'application/json' })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch security status');
    }
    return data.status;
  }
};

export default securityApi;
