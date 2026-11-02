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

const ACTIVITY_BASE_URL = `${BACKEND_URL}/api/activity-logs`;

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

export const activityLogApi = {
  /**
   * Fetch activity logs with filters & pagination
   */
  async getActivityLogs(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.search) query.set('search', params.search);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.action && params.action !== 'all') query.set('action', params.action);
    if (params.adminEmail) query.set('adminEmail', params.adminEmail);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);

    const queryString = query.toString();
    const url = queryString ? `${ACTIVITY_BASE_URL}?${queryString}` : ACTIVITY_BASE_URL;

    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    authApi._handleRefreshedToken(res);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to fetch activity logs.');
    }
    return data;
  },

  /**
   * Fetch single activity log detail by ID
   */
  async getActivityLogById(id) {
    const res = await fetch(`${ACTIVITY_BASE_URL}/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    authApi._handleRefreshedToken(res);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to fetch activity log details.');
    }
    return data.log;
  }
};

