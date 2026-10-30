/**
 * Customer & Sangam CRM API Service
 * Centralizes all frontend communication with the backend customer management
 * and Sangam CRM synchronization endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/customers`
  : typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ? 'https://website-homepage-bdjc.onrender.com/api/customers'
  : 'http://localhost:5000/api/customers';

const SANGAM_CRM_BASE_URL = 'https://nistally.sangamcrm.com';

export const customerApi = {
  /**
   * Fetch all customers with their live Sangam CRM sync statuses
   */
  async getCustomers() {
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      });
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      return data.customers || [];
    } catch (err) {
      console.warn('[customerApi] Could not fetch customers from backend, using local state:', err.message);
      return null;
    }
  },

  /**
   * Create a new customer locally and automatically synchronize to Sangam CRM -> Companies
   * @param {Object} customerData
   */
  async createCustomer(customerData) {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(customerData)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to create customer record.');
    }

    return data;
  },

  /**
   * Trigger or retry synchronization of an existing customer to Sangam CRM
   * @param {string} customerId - e.g. CUST-8821
   */
  async retrySangamSync(customerId) {
    const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(customerId)}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || data.message || 'Sangam CRM synchronization retry failed.');
    }

    return data;
  },

  /**
   * Helper to build deep link to the Company record inside Sangam CRM
   * @param {string} recordId
   */
  getSangamRecordUrl(recordId) {
    if (!recordId || recordId.startsWith('SGM-ACC-GEN-')) {
      return `${SANGAM_CRM_BASE_URL}/admin/companies`;
    }
    return `${SANGAM_CRM_BASE_URL}/index.php?module=Accounts&action=DetailView&record=${encodeURIComponent(
      recordId
    )}`;
  }
};

