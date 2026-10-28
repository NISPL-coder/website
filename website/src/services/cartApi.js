/**
 * Cart API Service
 * Centralizes all HTTP communication with NISPL backend cart & add-ons endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/cart`
  : 'http://localhost:5000/api/cart';

const TOKEN_KEY = 'nispl_auth_token';
const SESSION_ID_KEY = 'nispl_cart_session_id';

// Generate or retrieve persistent guest/customer session ID
const getSessionId = () => {
  try {
    let sid = localStorage.getItem(SESSION_ID_KEY);
    if (!sid) {
      sid = 'sid_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem(SESSION_ID_KEY, sid);
    }
    return sid;
  } catch (e) {
    return 'default_cart_session';
  }
};

// Common request headers builder
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    'x-session-id': getSessionId()
  };

  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    // Ignore storage error
  }

  return headers;
};

export const cartApi = {
  /**
   * Fetch current cart items, fulfillment mode, and calculations
   */
  async getCart() {
    try {
      const res = await fetch(`${API_BASE_URL}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!res.ok) {
        throw new Error(`Failed to load cart (Status ${res.status})`);
      }

      const data = await res.json();
      return data.data;
    } catch (err) {
      console.warn('[cartApi.getCart] Offline or fallback:', err.message);
      return null;
    }
  },

  /**
   * Add a product or add-on to the cart
   */
  async addToCart(item) {
    try {
      const res = await fetch(`${API_BASE_URL}/add`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          id: item.id,
          name: item.name,
          basePrice: item.basePrice || item.price,
          quantity: item.quantity || 1,
          sku: item.sku,
          category: item.category,
          billingCycle: item.billingCycle,
          image: item.image
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to add item (${res.status})`);
      }

      const data = await res.json();
      return data.data;
    } catch (err) {
      console.warn('[cartApi.addToCart] Error:', err.message);
      throw err;
    }
  },

  /**
   * Update item quantity
   */
  async updateQuantity(itemId, quantity) {
    try {
      const res = await fetch(`${API_BASE_URL}/update-qty`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          id: itemId,
          quantity: quantity
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to update quantity (${res.status})`);
      }

      const data = await res.json();
      return data.data;
    } catch (err) {
      console.warn('[cartApi.updateQuantity] Error:', err.message);
      throw err;
    }
  },

  /**
   * Remove item from cart
   */
  async removeItem(itemId) {
    try {
      const res = await fetch(`${API_BASE_URL}/remove`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          id: itemId
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to remove item (${res.status})`);
      }

      const data = await res.json();
      return data.data;
    } catch (err) {
      console.warn('[cartApi.removeItem] Error:', err.message);
      throw err;
    }
  },

  /**
   * Empty entire cart
   */
  async clearCart() {
    try {
      const res = await fetch(`${API_BASE_URL}/clear`, {
        method: 'POST',
        headers: getHeaders()
      });

      if (!res.ok) {
        throw new Error(`Failed to clear cart (${res.status})`);
      }

      const data = await res.json();
      return data.data;
    } catch (err) {
      console.warn('[cartApi.clearCart] Error:', err.message);
      throw err;
    }
  },

  /**
   * Update shipping / fulfillment mode
   */
  async updateFulfillmentMode(mode) {
    try {
      const res = await fetch(`${API_BASE_URL}/fulfillment`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          fulfillmentMode: mode
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to update fulfillment (${res.status})`);
      }

      const data = await res.json();
      return data.data;
    } catch (err) {
      console.warn('[cartApi.updateFulfillmentMode] Error:', err.message);
      throw err;
    }
  },

  /**
   * Fetch dynamic add-ons catalog
   */
  async getAddons() {
    try {
      const res = await fetch(`${API_BASE_URL}/addons`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!res.ok) {
        throw new Error(`Failed to load add-ons (${res.status})`);
      }

      const data = await res.json();
      return data.data?.addons || [];
    } catch (err) {
      console.warn('[cartApi.getAddons] Offline or fallback:', err.message);
      return [];
    }
  }
};

export default cartApi;
