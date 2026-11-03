import { authApi } from './authApi';

const BACKEND_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000'
    : (import.meta.env.VITE_API_URL || 'https://website-ebxf.onrender.com');

const BASE_URL = `${BACKEND_URL}/api/notifications`;

export const MANAGER_ALLOWED_TYPES = [
  'customer_created',
  'customer_updated',
  'customer_registered',
  'customer_query',
  'support_ticket',
  'payment_received',
  'payment_created',
  'payment_due_soon',
  'payment_due',
  'contract_renewal'
];

export const MANAGER_FORBIDDEN_ENTITIES = ['user', 'admin'];

const SUPPORT_ALLOWED_TYPES = [
  'customer_query',
  'support_ticket',
  'customer_created',
  'customer_updated',
  'payment_due_soon'
];

function currentEmail() {
  try {
    return String(authApi.getCurrentUser()?.email || '').trim().toLowerCase();
  } catch {
    return '';
  }
}

export function isNotificationAllowedForRole(item, role) {
  if (!role || role === 'admin') return true;
  if (role === 'manager') {
    if (MANAGER_FORBIDDEN_ENTITIES.includes(item?.entityType)) return false;
    return MANAGER_ALLOWED_TYPES.includes(item?.type);
  }
  if (role === 'support') {
    if (MANAGER_FORBIDDEN_ENTITIES.includes(item?.entityType)) return false;
    return SUPPORT_ALLOWED_TYPES.includes(item?.type);
  }
  // Customers and partners only see notices addressed to their own account.
  const email = currentEmail();
  if (!email) return false;
  return String(item?.user?.email || '').trim().toLowerCase() === email;
}

function getStorageKey() {
  try {
    const user = authApi.getCurrentUser();
    const role = user?.role || 'admin';
    const account = role === 'admin' || role === 'manager' || role === 'support'
      ? ''
      : `_${String(user?.email || 'anonymous').trim().toLowerCase()}`;
    return `nispl_notifications_${role}${account}`;
  } catch {
    return 'nispl_notifications_admin';
  }
}

function getLocalNotifications() {
  try {
    const key = getStorageKey();
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalNotifications(list) {
  try {
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(list.slice(0, 100)));
  } catch (e) {
    console.warn('Failed to save notifications locally:', e);
  }
}

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const token = authApi.getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const user = authApi.getCurrentUser();
    if (user?.role) headers['x-user-role'] = user.role;
  } catch {}
  return headers;
}

export const notificationApi = {
  /**
   * Server-paged stream used by the Notifications page. No local merge, because
   * the page shows totals and pagination straight from the database.
   */
  async getPage(params = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null)
    ).toString();

    const res = await fetch(`${BASE_URL}${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders()
    });

    if (!res.ok) throw new Error(`Failed to load notifications (Status ${res.status})`);

    const data = await res.json();
    return {
      notifications: Array.isArray(data.notifications) ? data.notifications : [],
      total: Number(data.total) || 0,
      page: Number(data.page) || 1,
      pages: Number(data.pages) || 1,
      limit: Number(data.limit) || (Array.isArray(data.notifications) ? data.notifications.length : 0),
      unreadCount: Number(data.unreadCount) || 0
    };
  },

  /** Live counts for the stat cards and filter tabs. */
  async getStats() {
    const res = await fetch(`${BASE_URL}/stats`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(`Failed to load notification stats (Status ${res.status})`);
    const data = await res.json();
    return data.stats || { total: 0, unread: 0, byCategory: {} };
  },

  /** Full record for one notification, addressed to this account only. */
  async getById(id) {
    const res = await fetch(`${BASE_URL}/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(`Notification unavailable (Status ${res.status})`);
    const data = await res.json();
    return data.notification || null;
  },

  /**
   * The bell's stream. The database is the source of truth and the local copy is
   * only replayed when the API is unreachable, because locally-created ids never
   * match their stored twins and merging both lists shows duplicates.
   */
  async getNotifications(params = {}) {
    const user = authApi.getCurrentUser();
    const role = user?.role || 'admin';

    try {
      const page = await this.getPage({ ...params, limit: params.limit || 50, role });
      saveLocalNotifications(page.notifications);
      return {
        success: true,
        count: page.notifications.length,
        unreadCount: page.unreadCount,
        notifications: page.notifications
      };
    } catch (err) {
      console.warn('[NotificationApi] backend unavailable, replaying local cache:', err.message);
    }

    const localList = getLocalNotifications().filter((n) => isNotificationAllowedForRole(n, role));
    return {
      success: true,
      count: localList.length,
      unreadCount: localList.filter((n) => !n.read).length,
      notifications: localList
    };
  },

  /**
   * Create a new dynamic notification
   */
  async createNotification(payload) {
    const fallbackId = `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    let record = {
      _id: fallbackId,
      id: fallbackId,
      type: payload.type || 'system',
      title: payload.title,
      message: payload.message,
      severity: payload.severity || 'info',
      entityType: payload.entityType || 'other',
      entityId: payload.entityId || '',
      user: payload.user || {},
      metadata: payload.metadata || {},
      read: false,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.notification) record = data.notification;
      }
    } catch {}

    const user = authApi.getCurrentUser();
    const role = user?.role || 'admin';
    const key = record._id || record.id;

    // Only a cache copy, so the next successful read replaces it.
    if (isNotificationAllowedForRole(record, role)) {
      const current = getLocalNotifications();
      saveLocalNotifications([record, ...current.filter((n) => (n._id || n.id) !== key)]);
    }

    window.dispatchEvent(new CustomEvent('nispl_new_notification', { detail: record }));

    return {
      success: true,
      notification: record
    };
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id) {
    const current = getLocalNotifications();
    const updated = current.map((n) => (n._id === id || n.id === id ? { ...n, read: true } : n));
    saveLocalNotifications(updated);

    try {
      fetch(`${BASE_URL}/${id}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      }).catch(() => {});
    } catch {}

    return { success: true };
  },

  /**
   * Send a notification back to unread
   */
  async markAsUnread(id) {
    const current = getLocalNotifications();
    const updated = current.map((n) => (n._id === id || n.id === id ? { ...n, read: false } : n));
    saveLocalNotifications(updated);

    const res = await fetch(`${BASE_URL}/${id}/unread`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });

    if (!res.ok) throw new Error(`Failed to update notification (Status ${res.status})`);
    return res.json();
  },

  /**
   * Mark all notifications as read
   */  async markAllAsRead() {
    const current = getLocalNotifications();
    const updated = current.map((n) => ({ ...n, read: true }));
    saveLocalNotifications(updated);

    try {
      fetch(`${BASE_URL}/read-all`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      }).catch(() => {});
    } catch {}

    return { success: true, unreadCount: 0 };
  },

  /**
   * Delete a notification by ID
   */
  async deleteNotification(id) {
    const current = getLocalNotifications();
    const updated = current.filter((n) => n._id !== id && n.id !== id);
    saveLocalNotifications(updated);

    try {
      fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      }).catch(() => {});
    } catch {}

    return { success: true };
  },

  /**
   * Clear all notifications
   */
  async clearAll() {
    saveLocalNotifications([]);
    try {
      fetch(BASE_URL, {
        method: 'DELETE',
        headers: getAuthHeaders()
      }).catch(() => {});
    } catch {}

    return { success: true, unreadCount: 0 };
  }
};

export default notificationApi;
