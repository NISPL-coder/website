/**
 * Customer Authentication & Persistence Service
 * Manages customer account creation, session state in localStorage, and customer profile retrieval.
 */

const SESSION_KEY = 'nispl_customer_session';
const CUSTOMERS_KEY = 'nispl_registered_customers';

export const customerAuthService = {
  /**
   * Register a new customer and establish active session
   * @param {Object} details - { name, email, mobile, companyName, gstNo, password }
   * @returns {Object} createdCustomer
   */
  createCustomer: (details) => {
    const randomIdNum = Math.floor(100000 + Math.random() * 900000);
    const customerId = `NIS-CUST-${randomIdNum}`;
    const now = new Date();
    
    const newCustomer = {
      id: customerId,
      customerId: customerId,
      name: details.name.trim(),
      email: details.email.trim().toLowerCase(),
      mobile: details.mobile.trim(),
      companyName: details.companyName.trim(),
      gstNo: details.gstNo.trim().toUpperCase(),
      createdAt: now.toISOString(),
      createdFormattedDate: now.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      accountStatus: 'Active',
      tier: 'Enterprise Cloud Customer',
      cloudInstance: {
        serverName: `${details.companyName.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}-cloud-node1`,
        ipAddress: `103.145.${Math.floor(10 + Math.random() * 80)}.${Math.floor(10 + Math.random() * 200)}`,
        rdpPort: 3389,
        webPort: 8443,
        status: 'Online',
        ram: '8 GB DDR4 Dedicated',
        cpu: '4 vCPU (Intel Xeon)',
        storage: '100 GB NVMe SSD',
        tallyPrimeVersion: 'Release 5.0 (Latest 64-Bit)',
        tssStatus: 'Active'
      },
      stats: {
        activeLicenses: 1,
        totalUsers: 2,
        cloudUptime: '99.98%',
        openTickets: 0
      }
    };

    try {
      // 1. Save to active session
      localStorage.setItem(SESSION_KEY, JSON.stringify(newCustomer));

      // 2. Append to all registered customers list
      const existingListStr = localStorage.getItem(CUSTOMERS_KEY);
      const existingList = existingListStr ? JSON.parse(existingListStr) : [];
      existingList.unshift(newCustomer);
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(existingList));
    } catch (e) {
      console.warn('Failed to persist customer in localStorage:', e);
    }

    return newCustomer;
  },

  /**
   * Get current active customer session or fallback demo data
   */
  getCurrentCustomer: () => {
    try {
      const sessionStr = localStorage.getItem(SESSION_KEY);
      if (sessionStr) {
        return JSON.parse(sessionStr);
      }
    } catch (e) {
      console.error('Error reading customer session:', e);
    }

    // Default fallback so dashboard is always populated and interactive
    return {
      id: 'NIS-CUST-849201',
      customerId: 'NIS-CUST-849201',
      name: 'Debasish Chakraborty',
      email: 'debasish@acme-cloud.in',
      mobile: '+91 98301 23456',
      companyName: 'Acme InfoTech Solutions Pvt Ltd',
      gstNo: '19AAACA1234A1Z5',
      createdAt: new Date().toISOString(),
      createdFormattedDate: 'Today',
      accountStatus: 'Active',
      tier: 'Enterprise Cloud Customer',
      cloudInstance: {
        serverName: 'acme-cloud-node1',
        ipAddress: '103.145.42.118',
        rdpPort: 3389,
        webPort: 8443,
        status: 'Online',
        ram: '8 GB DDR4 Dedicated',
        cpu: '4 vCPU (Intel Xeon)',
        storage: '100 GB NVMe SSD',
        tallyPrimeVersion: 'Release 5.0 (Latest 64-Bit)',
        tssStatus: 'Active'
      },
      stats: {
        activeLicenses: 1,
        totalUsers: 2,
        cloudUptime: '99.98%',
        openTickets: 0
      }
    };
  },

  /**
   * Clear session on Sign Out
   */
  logout: () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error('Error clearing customer session:', e);
    }
  }
};
