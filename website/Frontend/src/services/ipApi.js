const isLocalhost = Boolean(
  typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]')
);
const BACKEND_URL = isLocalhost
  ? 'http://localhost:4000'
  : import.meta.env.VITE_API_URL || 'https://website-ebxf.onrender.com';
const API_BASE_URL = `${BACKEND_URL}/api/v1/ip-monitor`;

const TOKEN_KEY = 'nispl_auth_token';

const getAuthHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    // Ignore
  }
  return headers;
};

export const ipApi = {
  /**
   * Fetch all IP records
   */
  async getIps() {
    try {
      const res = await fetch(`${API_BASE_URL}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('[ipApi.getIps] Fallback / error:', err.message);
      return [];
    }
  },

  /**
   * Create a new IP record
   */
  async createIp(data) {
    const res = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.message || `Failed to create IP record (${res.status})`);
    }
    return json.data;
  },

  /**
   * Update an existing IP record
   */
  async updateIp(id, data) {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.message || `Failed to update IP record (${res.status})`);
    }
    return json.data;
  },

  /**
   * Delete an IP record
   */
  async deleteIp(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.message || `Failed to delete IP record (${res.status})`);
    }
    return json;
  }
};

