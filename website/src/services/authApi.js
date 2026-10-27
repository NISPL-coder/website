/**
 * Authentication API Service
 * Centralizes all HTTP communication with the NISPL backend authentication endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/auth`
  : 'http://localhost:5000/api/auth';

const TOKEN_KEY = 'nispl_auth_token';
const SESSION_KEY = 'nispl_customer_session';

export const authApi = {
  /**
   * Register a new customer
   * @param {Object} userData - { name, email, mobile, companyName, gstNo, password }
   */
  async register(userData) {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Registration failed. Please verify your details.');
    }

    if (data.token && data.user) {
      this.setAuthSession(data.token, data.user);
    }

    return data;
  },

  /**
   * Log into account (Customer, Partner, Admin)
   * @param {Object} credentials - { email, password, portal }
   */
  async login(credentials) {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Authentication failed. Please verify your credentials.');
    }

    if (data.token && data.user) {
      this.setAuthSession(data.token, data.user);
    }

    return data;
  },

  /**
   * Fetch current authenticated user profile
   */
  async getMe() {
    const token = this.getAuthToken();
    if (!token) return null;

    const res = await fetch(`${API_BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      this.clearAuthSession();
      return null;
    }

    return data.user;
  },

  /**
   * Request password reset instructions
   * @param {string} email 
   */
  async forgotPassword(email) {
    const res = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to dispatch password reset instructions.');
    }

    return data;
  },

  /**
   * Persist token and user in localStorage
   */
  setAuthSession(token, user) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to store auth session:', e);
    }
  },

  getAuthToken() {
    try {
      return localStorage.getItem(TOKEN_KEY) || null;
    } catch {
      return null;
    }
  },

  getCurrentUser() {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  },

  clearAuthSession() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }
};

export default authApi;
