import { Notification } from '../models/Notification.js';

/**
 * Get unread notification count and badge data for user
 */
export const getNotificationBadge = async (req, res) => {
    try {
        // Set req.user from session if not already set
        if (!req.user && req.session && req.session.user) {
            req.user = req.session.user;
        }
        
        if (!req.user) {
            return res.json({ count: 0, mostSevereType: null, success: true });
        }

        const unreadNotifications = await Notification.getUnreadByUserId(req.user.id);
        const count = unreadNotifications.length;
        const mostSevereType = await Notification.getMostSevereType(req.user.id);

        res.json({
            count,
            mostSevereType,
            success: true
        });
    } catch (error) {
        console.error('Error getting notification badge:', error);
        res.status(500).json({ 
            error: 'Failed to get notification badge',
            success: false 
        });
    }
};

/**
 * Get all notifications for user
 */
export const getNotifications = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const notifications = await Notification.getByUserId(req.user.id, limit, offset);
        const unreadCount = await Notification.getUnreadByUserId(req.user.id);

        res.json({
            notifications,
            unreadCount: unreadCount.length,
            page,
            limit,
            success: true
        });
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({ 
            error: 'Failed to get notifications',
            success: false 
        });
    }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;
        const notification = await Notification.markAsRead(id, req.user.id);

        if (!notification) {
            return res.status(404).json({ 
                error: 'Notification not found',
                success: false 
            });
        }

        res.json({
            notification,
            success: true
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ 
            error: 'Failed to mark notification as read',
            success: false 
        });
    }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await Notification.markAllAsRead(req.user.id);

        res.json({
            message: 'All notifications marked as read',
            success: true
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ 
            error: 'Failed to mark all notifications as read',
            success: false 
        });
    }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;
        await Notification.delete(id, req.user.id);

        res.json({
            message: 'Notification deleted',
            success: true
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ 
            error: 'Failed to delete notification',
            success: false 
        });
    }
};

/**
 * Get banner notifications (critical and alert only)
 */
export const getBannerNotifications = async (req, res) => {
    try {
        // Set req.user from session if not already set
        if (!req.user && req.session && req.session.user) {
            req.user = req.session.user;
        }
        
        if (!req.user) {
            return res.json({ notifications: [], success: true });
        }

        const bannerNotifications = await Notification.getBannerNotifications(req.user.id);

        res.json({
            notifications: bannerNotifications,
            success: true
        });
    } catch (error) {
        console.error('Error getting banner notifications:', error);
        res.status(500).json({ 
            error: 'Failed to get banner notifications',
            success: false 
        });
    }
};

/**
 * Create a new notification (typically called from other controllers)
 */
export const createNotification = async (userId, type, title, message) => {
    try {
        const notification = await Notification.create(userId, type, title, message);
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};
