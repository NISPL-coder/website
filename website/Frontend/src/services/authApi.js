/**
 * Authentication API Service
 * Centralizes all HTTP communication with the NISPL backend authentication endpoints.
 */

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

const API_BASE_URL = `${BACKEND_URL}/api/auth`;

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

    if (data.accessToken && data.user) {
      this.setAuthSession(data.accessToken, data.user);
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

    if (data.accessToken && data.user) {
      this.setAuthSession(data.accessToken, data.user);
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
      throw new Error(data.message || data.error || 'Failed to dispatch password reset instructions.');
    }

    return data;
  },

  /**
   * Reset account password using verification token
   * @param {string} token
   * @param {string} password
   */
  async resetPassword(token, password) {
    const res = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, password })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to reset password. Link may have expired.');
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
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('nispl_auth_change'));
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

  /**
   * Validate token presence and check if it is expired (JWT check)
   * @param {string} token 
   * @returns {boolean}
   */
  isTokenValid(token) {
    if (!token || typeof token !== 'string') return false;
    const trimmed = token.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return false;

    const parts = trimmed.split('.');
    if (parts.length === 3) {
      try {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        if (payload && payload.exp && typeof payload.exp === 'number') {
          if (payload.exp * 1000 < Date.now()) {
            return false;
          }
        }
      } catch {
        return false;
      }
    }
    return true;
  },

  /**
   * Check whether a user is logged in with a valid token and optional role requirement
   * @param {string[]|string|null} allowedRoles 
   * @returns {boolean}
   */
  isAuthenticated(allowedRoles = null) {
    const token = this.getAuthToken();
    if (!this.isTokenValid(token)) {
      if (token) this.clearAuthSession();
      return false;
    }

    const user = this.getCurrentUser();
    if (!user) {
      this.clearAuthSession();
      return false;
    }

    if (allowedRoles) {
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      const userRole = user.role;
      if (!roles.includes(userRole)) {
        return false;
      }
    }

    return true;
  },

  _handleRefreshedToken(res) {
    try {
      const refreshed = res?.headers?.get('x-refreshed-token');
      if (refreshed) {
        localStorage.setItem(TOKEN_KEY, refreshed);
      }
    } catch {}
  },

  /**
   * Fetch the current user's profile from the backend and refresh the stored session.
   * Returns the safe user object (no password material).
   */
  async getProfile() {
    const token = this.getAuthToken();
    if (token) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this._handleRefreshedToken(res);
        const data = await res.json();
        if (res.ok && data.success && data.user) {
          const freshToken = res.headers.get('x-refreshed-token') || token;
          this.setAuthSession(freshToken, data.user);
          return data.user;
        }
      } catch (e) {
        console.warn('[authApi] /api/v1/users/me call failed, trying fallback:', e.message);
      }

      // Fallback 1: /api/auth/me
      try {
        const resAuth = await fetch(`${API_BASE_URL}/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this._handleRefreshedToken(resAuth);
        const dataAuth = await resAuth.json();
        if (resAuth.ok && dataAuth.success && dataAuth.user) {
          const freshToken = resAuth.headers.get('x-refreshed-token') || token;
          this.setAuthSession(freshToken, dataAuth.user);
          return dataAuth.user;
        }
      } catch (e) {
        console.warn('[authApi] /api/auth/me fallback failed:', e.message);
      }
    }

    // Fallback 2: Active cached session from login
    const cached = this.getCurrentUser();
    if (cached) {
      return cached;
    }

    throw new Error('Authentication required. Please sign in again.');
  },

  /**
   * Change the current user's password.
   * Revokes all active sessions server-side, so the caller must sign the user out afterwards.
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  async changePassword(currentPassword, newPassword) {
    const token = this.getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/users/me/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    this._handleRefreshedToken(res);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to change password.');
    }
    return data;
  },

  /**
   * Update a user profile (admin only endpoint, but admins can update themselves)
   * @param {string} userId
   * @param {Object} updates
   */
  async updateUser(userId, updates) {
    const token = this.getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/users/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    this._handleRefreshedToken(res);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to update profile.');
    }
    // Refresh stored session user if it's the current user
    const current = this.getCurrentUser();
    if (current && (current.id === userId || current._id === userId)) {
      const freshToken = res.headers.get('x-refreshed-token') || token;
      this.setAuthSession(freshToken, data.user);
    }
    return data.user;
  },

  clearAuthSession() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('nispl_auth_change'));
      window.dispatchEvent(new Event('nispl_session_expired'));
    }
  }
};

export default authApi;
