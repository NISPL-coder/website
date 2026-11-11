import { authApi } from './authApi';
import { notifyDataChanged } from '../utils/dataBus';

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

const BASE_URL = `${BACKEND_URL}/api/products`;

function getHeaders() {
  const token = authApi.getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export const productApi = {
  /**
   * Fetch catalog products with optional filtering (category, provider, available, status)
   */
  async getProducts(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}${query ? `?${query}` : ''}`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          return data.data;
        }
      }
    } catch (err) {
      console.warn('[productApi] Error fetching products:', err);
    }
    return [];
  },

  /**
   * Create new product / cloud node
   */
  async createProduct(payload) {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || data.message || 'Failed to create product.');
    }
    notifyDataChanged('products');
    return data.data;
  },

  /**
   * Update product details or toggle availability
   */
  async updateProduct(id, updates) {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || data.message || 'Failed to update product.');
    }
    notifyDataChanged('products');
    return data.data;
  },

  /**
   * Toggle product live availability (Active vs Inactive)
   */
  async toggleAvailability(id, available) {
    return this.updateProduct(id, { available, status: available ? 'active' : 'inactive' });
  },

  /**
   * Delete product
   */
  async deleteProduct(id) {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || data.message || 'Failed to delete product.');
    }
    notifyDataChanged('products');
    return true;
  }
};

export default productApi;

