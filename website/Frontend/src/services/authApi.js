/**
 * Authentication API Service
 * Centralizes all HTTP communication with the NISPL backend authentication endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/auth`
  : (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
    ? 'https://website-ebxf.onrender.com/api/auth'
    : 'http://localhost:4000/api/auth';

const TOKEN_KEY = 'nispl_auth_token';
const SESSION_KEY = 'nispl_customer_session';

export const authApi = {
  /**
   * Fetch configured admin email from backend
   */
  async getAdminConfig() {
    const res = await fetch(`${API_BASE_URL}/admin-config`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to fetch admin configuration.');
    }
    return data;
  },

  /**
   * Request OTP to be sent to the configured admin email
   */
  async sendAdminOtp() {
    const res = await fetch(`${API_BASE_URL}/admin/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to dispatch OTP to admin email.');
    }
    return data;
  },

  /**
   * Verify OTP and create/update admin account
   * @param {Object} adminData - { name, designation, password, otp }
   */
  async verifyAndCreateAdmin(adminData) {
    const res = await fetch(`${API_BASE_URL}/admin/verify-and-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adminData)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Admin verification failed. Please check your OTP.');
    }
    return data;
  },

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
