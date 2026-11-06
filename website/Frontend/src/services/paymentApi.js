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

const BASE_URL = `${BACKEND_URL}/api/payments`;

function getHeaders() {
  const token = authApi.getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export const paymentApi = {
  async getPayments() {
    try {
      const res = await fetch(BASE_URL, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          return data.data;
        }
      }
    } catch (err) {
      console.warn('[paymentApi] Error fetching payments:', err);
    }
    return [];
  },

  async getReceipts() {
    try {
      const res = await fetch(`${BASE_URL}/receipts`, { headers: getHeaders() });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && Array.isArray(data.data)) {
        return data.data;
      }
      // A 404 here means the backend is an older build than this page.
      console.warn(`[paymentApi] Receipts unavailable (HTTP ${res.status}).`, data.error || '');
    } catch (err) {
      console.warn('[paymentApi] Error fetching receipts:', err);
    }
    return [];
  },

  async createPayment(payload) {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to record payment');
    }
    return data.data;
  },

  async recordManualPayment(payload) {
    const res = await fetch(`${BASE_URL}/manual`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      const fieldNote = data.field ? ` (${data.field})` : '';
      throw new Error(`${data.error || 'Failed to record the offline payment'}${fieldNote}`);
    }
    return data.data;
  },

  // Proof bytes are deliberately left out of the payment lists, so a document
  // is fetched one at a time when the admin opens it.
  async getPaymentProof(paymentId) {
    const res = await fetch(`${BASE_URL}/${encodeURIComponent(paymentId)}/proof`, {
      headers: getHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'No proof document available.');
    }
    return data.data;
  },

  // A proof is stored as a data URL so it needs no file service, but a browser
  // will only open a document of this size from a blob URL.
  async openProofDocument(paymentId) {
    const doc = await this.getPaymentProof(paymentId);
    const blob = await (await fetch(doc.data)).blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return doc;
  },

  async updatePayment(id, updates) {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update payment');
    }
    return data.data;
  },

  async deletePayment(id) {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete payment');
    }
    return true;
  }
};

export default paymentApi;

