/**
 * Contract & Sangam CRM API Service
 * Centralizes all frontend communication with the backend contract management
 * and Sangam CRM Contracts synchronization endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/contracts`
  : typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ? 'https://website-ebxf.onrender.com/api/contracts'
  : 'http://localhost:4000/api/contracts';

const SANGAM_CRM_BASE_URL = 'https://nistally.sangamcrm.com';

export const contractApi = {
  /**
   * Fetch all contracts with their live Sangam CRM sync statuses
   */
  async getContracts() {
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
      return data.contracts || [];
    } catch (err) {
      console.warn('[contractApi] Could not fetch contracts from backend, using local state:', err.message);
      return null;
    }
  },

  /**
   * Create a new contract locally and automatically synchronize to Sangam CRM -> Contracts
   * @param {Object} contractData
   */
  async createContract(contractData) {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(contractData)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to create contract record.');
    }

    return data;
  },

  /**
   * Trigger or retry synchronization of an existing contract to Sangam CRM
   * @param {string} contractId - e.g. CTR-2026-0891
   */
  /**
   * Update an existing contract record and sync to Sangam CRM
   * @param {string} contractId
   * @param {Object} contractData
   */
  async updateContract(contractId, contractData) {
    const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(contractId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(contractData)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update contract record.');
    }

    return data;
  },

  /**
   * Delete an existing contract record
   * @param {string} contractId
   */
  async deleteContract(contractId) {
    const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(contractId)}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json'
      }
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete contract record.');
    }

    return data;
  },

  async retrySangamSync(contractId) {
    const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(contractId)}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || data.message || 'Sangam CRM contract synchronization retry failed.');
    }

    return data;
  },

  /**
   * Helper to build deep link to the Contract record inside Sangam CRM
   * @param {string} recordId
   */
  getSangamContractUrl(recordId) {
    if (!recordId || recordId.startsWith('SGM-CTR-')) {
      return `${SANGAM_CRM_BASE_URL}/contracts`;
    }
    return `${SANGAM_CRM_BASE_URL}/contracts`;
  }
};

export default contractApi;

