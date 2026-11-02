const BACKEND_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000'
    : (import.meta.env.VITE_API_URL || 'https://website-ebxf.onrender.com');

const BASE_URL = `${BACKEND_URL}/api/notifications`;
const LOCAL_STORAGE_KEY = 'nispl_admin_notifications_store';

function getLocalNotifications() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalNotifications(list) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list.slice(0, 100)));
  } catch (e) {
    console.warn('Failed to save notifications locally:', e);
  }
}

export const notificationApi = {
  /**
   * Fetch all notifications with optional filters (type, read, limit)
   */
  async getNotifications(params = {}) {
    const localList = getLocalNotifications();

    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}${query ? `?${query}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          // Merge local and remote without duplicates (keyed by ID or entityId+type)
          const remoteMap = new Map();
          data.notifications.forEach((n) => remoteMap.set(n._id || n.id, n));

          // Also include any freshly created local notifications not yet synced
          localList.forEach((n) => {
            const key = n._id || n.id;
            if (!remoteMap.has(key)) {
              remoteMap.set(key, n);
            }
          });

          const merged = Array.from(remoteMap.values()).sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          );

          saveLocalNotifications(merged);
          const unreadCount = merged.filter((n) => !n.read).length;

          return {
            success: true,
            count: merged.length,
            unreadCount,
            notifications: merged
          };
        }
      }
    } catch (err) {
      console.warn('[NotificationApi] backend unavailable, using local store:', err.message);
    }

    // Fallback to local store
    const unreadCount = localList.filter((n) => !n.read).length;
    return {
      success: true,
      count: localList.length,
      unreadCount,
      notifications: localList
    };
  },

  /**
   * Create a new dynamic notification
   */
  async createNotification(payload) {
    const newNotif = {
      _id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
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

    // Save locally first for instant, guaranteed UI presentation
    const current = getLocalNotifications();
    const updated = [newNotif, ...current.filter((n) => n.id !== newNotif.id && n._id !== newNotif._id)];
    saveLocalNotifications(updated);

    // Also attempt remote dispatch to MongoDB
    try {
      fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch {}

    // Dispatch custom window event so any listening component (like AdminDashboard) updates immediately!
    window.dispatchEvent(new CustomEvent('nispl_new_notification', { detail: newNotif }));

    return {
      success: true,
      notification: newNotif
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
      fetch(`${BASE_URL}/${id}/read`, { method: 'PATCH' }).catch(() => {});
    } catch {}

    return { success: true };
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    const current = getLocalNotifications();
    const updated = current.map((n) => ({ ...n, read: true }));
    saveLocalNotifications(updated);

    try {
      fetch(`${BASE_URL}/read-all`, { method: 'PATCH' }).catch(() => {});
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
      fetch(`${BASE_URL}/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch {}

    return { success: true };
  },

  /**
   * Clear all notifications
   */
  async clearAll() {
    saveLocalNotifications([]);
    try {
      fetch(BASE_URL, { method: 'DELETE' }).catch(() => {});
    } catch {}

    return { success: true, unreadCount: 0 };
  }
};

export default notificationApi;
