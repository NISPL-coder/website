const isLocalhost = Boolean(
  typeof window !== "undefined" && (
    window.location.hostname === "localhost" || 
    window.location.hostname === "127.0.0.1" || 
    window.location.hostname === "[::1]"
  )
);
const BACKEND_URL = isLocalhost ? "http://localhost:4000" : (import.meta.env.VITE_API_URL || "https://website-ebxf.onrender.com");
const API_BASE_URL = `${BACKEND_URL}/api/v1/addons`;

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

export const addonApi = {
  /**
   * Public & Customer fetch (returns { showAddonsOnCheckout, addons })
   */
  async getAddons() {
    try {
      const res = await fetch(`${API_BASE_URL}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data || { showAddonsOnCheckout: true, addons: [] };
    } catch (err) {
      console.warn('[addonApi.getAddons] Fallback:', err.message);
      return { showAddonsOnCheckout: true, addons: [] };
    }
  },

  /**
   * Admin fetch all add-ons with settings
   */
  async getAdminAddons() {
    const res = await fetch(`${API_BASE_URL}/admin/all`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch add-ons (${res.status})`);
    }
    const json = await res.json();
    return json.data || { showAddonsOnCheckout: true, addons: [] };
  },

  /**
   * Admin master toggle: Show or hide Add-ons on customer checkout page
   */
  async toggleCheckoutVisibility(showAddonsOnCheckout) {
    const res = await fetch(`${API_BASE_URL}/toggle-checkout`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ showAddonsOnCheckout })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to toggle checkout visibility (${res.status})`);
    }
    return res.json();
  },

  /**
   * Admin create a new Add-on product
   */
  async createAddon(data) {
    const res = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to create add-on (${res.status})`);
    }
    return res.json();
  },

  /**
   * Admin update an existing Add-on product
   */
  async updateAddon(id, data) {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to update add-on (${res.status})`);
    }
    return res.json();
  },

  /**
   * Admin toggle single add-on active/disabled
   */
  async toggleAddon(id, available) {
    const res = await fetch(`${API_BASE_URL}/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ available })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to toggle add-on status (${res.status})`);
    }
    return res.json();
  },

  /**
   * Admin delete an Add-on product
   */
  async deleteAddon(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to delete add-on (${res.status})`);
    }
    return res.json();
  }
};

export default addonApi;

