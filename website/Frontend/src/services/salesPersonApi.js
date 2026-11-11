const isLocalhost = Boolean(
  typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]')
);
const BACKEND_URL = isLocalhost
  ? 'http://localhost:4000'
  : import.meta.env.VITE_API_URL || 'https://website-ebxf.onrender.com';
const API_BASE_URL = `${BACKEND_URL}/api/v1/sales-persons`;

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
  } catch {
    // Ignore localStorage errors
  }
  return headers;
};

export const salesPersonApi = {
  /**
   * Fetch all sales persons (for Admin listing)
   */
  async getAll(params = {}) {
    try {
      const qs = new URLSearchParams(params).toString();
      const url = qs ? `${API_BASE_URL}?${qs}` : API_BASE_URL;
      const res = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json;
    } catch (err) {
      console.warn('[salesPersonApi.getAll] Error:', err.message);
      return { success: false, data: [], stats: { total: 0, active: 0, inactive: 0 } };
    }
  },

  /**
   * Fetch active sales persons (lightweight, accessible for customer portal)
   */
  async getActive() {
    try {
      const res = await fetch(`${API_BASE_URL}/active`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('[salesPersonApi.getActive] Fallback:', err.message);
      // Fallback defaults so the dropdown never breaks
      return [
        { id: 'SP-101', name: 'Nilmoni Ghosal', designation: 'Senior Sales Executive' },
        { id: 'SP-102', name: 'Sourav Mukherjee', designation: 'Cloud Solutions Manager' },
        { id: 'SP-103', name: 'Sales Support Direct', designation: 'Inbound Sales Desk' }
      ];
    }
  },

  /**
   * Create a new sales person
   */
  async create(data) {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to create sales person');
    }
    return json;
  },

  /**
   * Update an existing sales person
   */
  async update(id, data) {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update sales person');
    }
    return json;
  },

  /**
   * Delete a sales person
   */
  async delete(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete sales person');
    }
    return json;
  }
};

