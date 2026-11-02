import Notification from '../models/Notification.js';

/**
 * Dynamically logs real administrative notifications triggered by live events
 * (Customer create/update/delete, Contract create/update/delete, Payment received from user, etc.)
 */
export async function logNotification({
  type,
  title,
  message,
  severity = 'info',
  entityType = 'other',
  entityId = '',
  user = {},
  metadata = {}
}) {
  try {
    const notification = await Notification.create({
      type,
      title,
      message,
      severity,
      entityType,
      entityId,
      user: {
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        company: user.company || ''
      },
      metadata,
      read: false
    });
    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
}

export default { logNotification };
