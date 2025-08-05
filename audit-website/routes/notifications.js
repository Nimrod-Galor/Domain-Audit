import express from 'express';
import { 
    getNotificationBadge,
    getBannerNotifications,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification 
} from '../controllers/notificationController.js';
import { requireAuth, requireAuthAPI } from '../controllers/authController.js';

const router = express.Router();

// Get notification badge data
router.get('/badge', getNotificationBadge);

// Get banner notifications (critical and alert)
router.get('/banner', getBannerNotifications);

// Get all notifications
router.get('/', requireAuthAPI, getNotifications);

// Mark specific notification as read
router.patch('/:id/read', requireAuthAPI, markAsRead);

// Mark all notifications as read
router.patch('/read-all', requireAuthAPI, markAllAsRead);

// Delete specific notification
router.delete('/:id', requireAuthAPI, deleteNotification);

export default router;
