import { Router } from 'express';
import {
  getNotifications,
  getNotificationStats,
  getNotificationById,
  createNotification,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} from '../controllers/notificationController.js';

const router = Router();

router.get('/', getNotifications);
router.get('/stats', getNotificationStats);
router.post('/', createNotification);
router.patch('/read-all', markAllAsRead);
router.get('/:id', getNotificationById);
router.patch('/:id/read', markAsRead);
router.patch('/:id/unread', markAsUnread);
router.delete('/:id', deleteNotification);
router.delete('/', clearAllNotifications);

export default router;

