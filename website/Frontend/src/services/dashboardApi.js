/**
 * Dashboard API Service
 * Handles fetching dashboard overview metrics from backend.
 */

const isLocalhost = Boolean(
  typeof window !== "undefined" && (
    window.location.hostname === "localhost" || 
    window.location.hostname === "127.0.0.1" || 
    window.location.hostname === "[::1]"
  )
);
const BACKEND_URL = isLocalhost ? "http://localhost:4000" : (import.meta.env.VITE_API_URL || "https://website-ebxf.onrender.com");
const API_BASE_URL = `${BACKEND_URL}/api/dashboard`;

const TOKEN_KEY = 'nispl_auth_token';

export const dashboardApi = {
  /**
   * Fetch complete Dashboard Overview section data
   * (Overview KPI cards, Renewal Reminders, Services & Infrastructure, Current Plan, Account Details)
   */
  async getOverview() {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/overview`, {
      method: 'GET',
      headers
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to fetch dashboard overview data.');
    }

    return data.data;
  }
};

export default dashboardApi;

