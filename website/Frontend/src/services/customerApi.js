/**
 * Customer & Sangam CRM API Service
 * Centralizes all frontend communication with the backend customer management
 * and Sangam CRM synchronization endpoints.
 */

import { withAuth, readApiError } from './apiAuth';
import { notifyDataChanged } from '../utils/dataBus';

const isLocalhost = Boolean(
  typeof window !== "undefined" && (
    window.location.hostname === "localhost" || 
    window.location.hostname === "127.0.0.1" || 
    window.location.hostname === "[::1]"
  )
);
const BACKEND_URL = isLocalhost ? "http://localhost:4000" : (import.meta.env.VITE_API_URL || "https://website-ebxf.onrender.com");
const API_BASE_URL = `${BACKEND_URL}/api/customers`;

const SANGAM_CRM_BASE_URL = 'https://nistally.sangamcrm.com';

export const customerApi = {
  /**
   * Fetch all customers with their live Sangam CRM sync statuses and dynamic summary stats
   */
  async getCustomers() {
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: withAuth({ Accept: 'application/json' })
      });
      if (!res.ok) {
        throw await readApiError(res, `Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      const list = data.customers || [];
      if (data.stats || data.summary) {
        list.stats = data.stats || data.summary;
      }
      return list;
    } catch (err) {
      console.warn('[customerApi] Could not fetch customers from backend, using local state:', err.message);
      return null;
    }
  },

  /**
   * Fetch full customer directory payload including dynamic card stats
   */
  async getCustomerListing() {
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: withAuth({ Accept: 'application/json' })
      });
      if (!res.ok) {
        throw await readApiError(res, `Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      return {
        customers: data.customers || [],
        stats: data.stats || data.summary || null,
        count: data.count || (data.customers ? data.customers.length : 0)
      };
    } catch (err) {
      console.warn('[customerApi] Could not fetch customer listing:', err.message);
      return { customers: [], stats: null, count: 0, error: err.message };
    }
  },

  /**
   * Create a new customer locally and automatically synchronize to Sangam CRM -> Companies
   * @param {Object} customerData
   */
  async createCustomer(customerData) {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: withAuth({
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }),
      body: JSON.stringify(customerData)
    });

    if (!res.ok) {
      throw await readApiError(res, 'Failed to create customer record.');
    }
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to create customer record.');
    }
    notifyDataChanged('customers');

    return data;
  },

  /**
   * Bulk import master CSV (Customer + Contract + Payment + Receipt)
   * @param {Array<Object>} records
   */
  async importMaster(records) {
    const res = await fetch(`${API_BASE_URL}/import-master`, {
      method: 'POST',
      headers: withAuth({
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }),
      body: JSON.stringify({ records })
    });

    if (!res.ok) {
      throw await readApiError(res, 'Unified master CSV import failed.');
    }
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Unified master CSV import failed.');
    }
    notifyDataChanged('customers');
    notifyDataChanged('contracts');
    notifyDataChanged('payments');
    notifyDataChanged('receipts');
    return data;
  },

  /**
   * Bulk import master CSV (Customer + Contract + Payment + Receipt)
   * Streams live progress events from the server so the UI can render a
   * real progress bar, elapsed time and ETA while rows are provisioned.
   *
   * @param {Array<Object>} records
   * @param {{ onProgress?: (snapshot: Object) => void }} options
   */
  async importMasterStream(records, { onProgress } = {}) {
    const startedAt = Date.now();
    const res = await fetch(`${API_BASE_URL}/import-master-stream`, {
      method: 'POST',
      headers: withAuth({
        'Content-Type': 'application/json',
        Accept: 'application/x-ndjson'
      }),
      body: JSON.stringify({ records })
    });

    // Older backend builds do not expose the streaming endpoint yet.
    if (res.status === 404 || res.status === 405) {
      if (typeof onProgress === 'function') {
        onProgress({ phase: 'fallback', processed: 0, total: records.length, percent: 8, elapsedMs: Date.now() - startedAt });
      }
      const data = await this.importMaster(records);
      if (typeof onProgress === 'function') {
        onProgress({
          phase: 'done',
          processed: records.length,
          total: records.length,
          percent: 100,
          elapsedMs: Date.now() - startedAt
        });
      }
      return { ...data, elapsedMs: Date.now() - startedAt, durationMs: Date.now() - startedAt, streamed: false };
    }

    if (!res.ok) {
      throw await readApiError(res, 'Unified master CSV import failed.');
    }
    if (!res.body || typeof res.body.getReader !== 'function') {
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Unified master CSV import failed.');
      }
      return data;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let summary = null;
    let streamError = null;

    const handleLine = (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      let event;
      try {
        event = JSON.parse(trimmed);
      } catch {
        return;
      }
      if (event.type === 'progress' || event.type === 'start') {
        if (typeof onProgress === 'function') onProgress(event);
      } else if (event.type === 'complete') {
        summary = event;
      } else if (event.type === 'error') {
        streamError = event;
      }
    };

    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newlineIdx = buffer.indexOf('\n');
        while (newlineIdx !== -1) {
          handleLine(buffer.slice(0, newlineIdx));
          buffer = buffer.slice(newlineIdx + 1);
          newlineIdx = buffer.indexOf('\n');
        }
      }
      buffer += decoder.decode();
      handleLine(buffer);
    } finally {
      try {
        reader.releaseLock();
      } catch {
        /* stream already closed */
      }
    }

    if (streamError) {
      throw new Error(streamError.error || 'Unified master CSV import failed.');
    }
    if (!summary) {
      throw new Error('Import stream ended before the server confirmed completion. Please check the Customer list before retrying.');
    }

    notifyDataChanged('customers');
    notifyDataChanged('contracts');
    notifyDataChanged('payments');
    notifyDataChanged('receipts');

    const elapsedMs = Number(summary.elapsedMs) || Date.now() - startedAt;
    return { ...summary, elapsedMs, durationMs: elapsedMs, streamed: true };
  },

  /**
   * Bulk import companies from CSV, sync to Sangam CRM Account, and generate dashboard credentials
   * @param {Array<Object>} companies
   */
  async importCompanies(companies) {
    const res = await fetch(`${API_BASE_URL}/import-companies`, {
      method: 'POST',
      headers: withAuth({
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }),
      body: JSON.stringify({ companies })
    });

    if (!res.ok) {
      throw await readApiError(res, 'Bulk companies import failed.');
    }
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Bulk companies import failed.');
    }
    notifyDataChanged('customers');
    return data;
  },

  /**
   * Bulk import contacts from CSV, link to accounts, sync to Sangam CRM Contact, and generate credentials
   * @param {Array<Object>} contacts
   */
  async importContacts(contacts) {
    const res = await fetch(`${API_BASE_URL}/import-contacts`, {
      method: 'POST',
      headers: withAuth({
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }),
      body: JSON.stringify({ contacts })
    });

    if (!res.ok) {
      throw await readApiError(res, 'Bulk contacts import failed.');
    }
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Bulk contacts import failed.');
    }
    notifyDataChanged('customers');
    return data;
  },

  /**
   * Update an existing customer record and sync to Sangam CRM
   * @param {string} customerId
   * @param {Object} customerData
   */
  async updateCustomer(customerId, customerData) {
    const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(customerId)}`, {
      method: 'PUT',
      headers: withAuth({
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }),
      body: JSON.stringify(customerData)
    });

    if (!res.ok) {
      throw await readApiError(res, 'Failed to update customer record.');
    }
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to update customer record.');
    }
    notifyDataChanged('customers');

    return data;
  },

  /**
   * Delete an existing customer record
   * @param {string} customerId
   */
  async deleteCustomer(customerId) {
    const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(customerId)}`, {
      method: 'DELETE',
      headers: withAuth({ Accept: 'application/json' })
    });

    if (!res.ok) {
      throw await readApiError(res, 'Failed to delete customer record.');
    }
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete customer record.');
    }
    notifyDataChanged('customers');

    return data;
  },

  async retrySangamSync(customerId) {
    const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(customerId)}/sync`, {
      method: 'POST',
      headers: withAuth({
        'Content-Type': 'application/json',
        Accept: 'application/json'
      })
    });

    if (!res.ok) {
      throw await readApiError(res, 'Sangam CRM synchronization retry failed.');
    }
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || data.message || 'Sangam CRM synchronization retry failed.');
    }
    notifyDataChanged('customers');

    return data;
  },

  /**
   * Authorize demo trial extension for a specific customer
   * @param {string} customerId
   * @param {number} additionalDays
   */
  async allowDemoExtension(customerId, additionalDays = 7) {
    const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(customerId)}/allow-demo-extension`, {
      method: 'POST',
      headers: withAuth({
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }),
      body: JSON.stringify({ additionalDays })
    });

    if (!res.ok) {
      throw await readApiError(res, 'Failed to authorize demo extension.');
    }
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || data.message || 'Failed to authorize demo extension.');
    }
    notifyDataChanged('customers');

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
