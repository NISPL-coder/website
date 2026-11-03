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

const STAFF_BASE_URL = `${BACKEND_URL}/api/staff`;
const PERMISSIONS_BASE_URL = `${BACKEND_URL}/api/permissions`;

const getHeaders = () => {
  const token = authApi.getAuthToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const staffApi = {
  /**
   * Fetch all staff members (admin, manager, support)
   */
  async getStaff() {
    const res = await fetch(STAFF_BASE_URL, {
      method: 'GET',
      headers: getHeaders()
    });
    authApi._handleRefreshedToken(res);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to fetch staff accounts.');
    }
    return data.staff || [];
  },

  /**
   * Create a new staff account
   */
  async createStaff(payload) {
    const res = await fetch(STAFF_BASE_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    authApi._handleRefreshedToken(res);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to create staff member.');
    }
    return data;
  },

  /**
   * Toggle or update staff status (active / inactive)
   */
  async toggleStaffStatus(id, status) {
    const res = await fetch(`${STAFF_BASE_URL}/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    authApi._handleRefreshedToken(res);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to update staff status.');
    }
    return data;
  },

  /**
   * Column inventory per module, served by the API so the grant UI and the
   * server-side redaction can never drift apart.
   */
  async getColumnRegistry() {
    const res = await fetch(`${PERMISSIONS_BASE_URL}/columns`, { headers: getHeaders() });
    authApi._handleRefreshedToken(res);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to load the column registry.');
    }
    return data.registry;
  },

  /**
   * Grant access and update role & permissions
   */
  async updatePermissions(id, payload) {
    const res = await fetch(`${STAFF_BASE_URL}/${id}/permissions`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    authApi._handleRefreshedToken(res);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to update staff access permissions.');
    }
    return data;
  },

  /**
   * Delete a staff account
   */
  async deleteStaff(id) {
    const res = await fetch(`${STAFF_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    authApi._handleRefreshedToken(res);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to delete staff member.');
    }
    return data;
  }
};

