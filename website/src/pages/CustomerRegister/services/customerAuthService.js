import { authApi } from '../../../services/authApi';

const SESSION_KEY = 'nispl_customer_session';

export const customerAuthService = {
  /**
   * Register a new customer via real backend API
   * @param {Object} details - { name, email, mobile, companyName, gstNo, password }
   * @returns {Promise<Object>} created customer
   */
  async createCustomer(details) {
    const response = await authApi.register({
      name: details.name.trim(),
      email: details.email.trim().toLowerCase(),
      mobile: details.mobile.trim(),
      companyName: details.companyName.trim(),
      gstNo: details.gstNo.trim().toUpperCase(),
      password: details.password
    });

    return response.user;
  },

  /**
   * Get current authenticated customer session
   */
  getCurrentCustomer() {
    try {
      const sessionStr = localStorage.getItem(SESSION_KEY);
      if (sessionStr) {
        return JSON.parse(sessionStr);
      }
    } catch (e) {
      console.error('Error reading customer session:', e);
    }
    return null;
  },

  /**
   * Clear session on Sign Out
   */
  logout() {
    authApi.clearAuthSession();
  }
};

export default customerAuthService;
