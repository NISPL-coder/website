import Notification from '../models/Notification.js';
import { logNotification } from '../services/notificationService.js';

/**
 * Fetch live dynamic notifications for the Admin
 */
export const getNotifications = async (req, res) => {
  const { limit = 50, type, read, entityType } = req.query;

  const filter = {};
  if (type && type !== 'all') {
    filter.type = type;
  }
  if (read !== undefined && read !== '') {
    filter.read = read === 'true';
  }
  if (entityType) {
    filter.entityType = entityType;
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || 50, 200))
    .lean();

  const unreadCount = await Notification.countDocuments({ read: false });

  res.json({
    success: true,
    count: notifications.length,
    unreadCount,
    notifications
  });
};

/**
 * Create a live dynamic notification (called when payments, customers, contracts, or orders occur)
 */
export const createNotification = async (req, res) => {
  const {
    type,
    title,
    message,
    severity = 'info',
    entityType = 'other',
    entityId = '',
    user = {},
    metadata = {}
  } = req.body;

  if (!title || !message) {
    return res.status(400).json({
      success: false,
      message: 'Title and message are required.'
    });
  }

  const notification = await logNotification({
    type: type || 'system',
    title,
    message,
    severity,
    entityType,
    entityId,
    user,
    metadata
  });

  res.status(201).json({
    success: true,
    notification
  });
};

export const markAsRead = async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findByIdAndUpdate(
    id,
    { read: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found.'
    });
  }

  const unreadCount = await Notification.countDocuments({ read: false });

  res.json({
    success: true,
    notification,
    unreadCount
  });
};

export const markAllAsRead = async (req, res) => {
  await Notification.updateMany(
    { read: false },
    { $set: { read: true, readAt: new Date() } }
  );

  res.json({
    success: true,
    message: 'All notifications marked as read.',
    unreadCount: 0
  });
};

export const deleteNotification = async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findByIdAndDelete(id);
  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found.'
    });
  }

  const unreadCount = await Notification.countDocuments({ read: false });

  res.json({
    success: true,
    message: 'Notification deleted.',
    unreadCount
  });
};

export const clearAllNotifications = async (req, res) => {
  await Notification.deleteMany({});

  res.json({
    success: true,
    message: 'All notifications cleared.',
    unreadCount: 0
  });
};
