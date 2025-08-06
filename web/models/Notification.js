import { query } from './database.js';

/**
 * Notification Model
 * Handles all notification-related database operations
 */

export class Notification {
    /**
     * Create notifications table if it doesn't exist
     */
    static async createTable() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(20) NOT NULL CHECK (type IN ('message', 'alert', 'critical')),
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
            CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
            CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
        `;
        
        await query(createTableQuery);
    }

    /**
     * Create a new notification
     */
    static async create(userId, type, title, message) {
        const insertQuery = `
            INSERT INTO notifications (user_id, type, title, message)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        const result = await query(insertQuery, [userId, type, title, message]);
        return result.rows[0];
    }

    /**
     * Get all unread notifications for a user
     */
    static async getUnreadByUserId(userId) {
        const selectQuery = `
            SELECT * FROM notifications 
            WHERE user_id = $1 AND is_read = FALSE 
            ORDER BY created_at DESC
        `;
        
        const result = await query(selectQuery, [userId]);
        return result.rows;
    }

    /**
     * Get all notifications for a user with pagination
     */
    static async getByUserId(userId, limit = 20, offset = 0) {
        const selectQuery = `
            SELECT * FROM notifications 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2 OFFSET $3
        `;
        
        const result = await query(selectQuery, [userId, limit, offset]);
        return result.rows;
    }

    /**
     * Mark notification as read
     */
    static async markAsRead(notificationId, userId) {
        const updateQuery = `
            UPDATE notifications 
            SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $1 AND user_id = $2
            RETURNING *
        `;
        
        const result = await query(updateQuery, [notificationId, userId]);
        return result.rows[0];
    }

    /**
     * Mark all notifications as read for a user
     */
    static async markAllAsRead(userId) {
        const updateQuery = `
            UPDATE notifications 
            SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = $1 AND is_read = FALSE
        `;
        
        await query(updateQuery, [userId]);
    }

    /**
     * Delete a notification
     */
    static async delete(notificationId, userId) {
        const deleteQuery = `
            DELETE FROM notifications 
            WHERE id = $1 AND user_id = $2
        `;
        
        await query(deleteQuery, [notificationId, userId]);
    }

    /**
     * Get notification count by type for a user
     */
    static async getUnreadCountByType(userId) {
        const countQuery = `
            SELECT 
                type,
                COUNT(*) as count
            FROM notifications 
            WHERE user_id = $1 AND is_read = FALSE 
            GROUP BY type
        `;
        
        const result = await query(countQuery, [userId]);
        return result.rows.reduce((acc, row) => {
            acc[row.type] = parseInt(row.count);
            return acc;
        }, {});
    }

    /**
     * Get the most severe notification type for badge color
     */
    static async getMostSevereType(userId) {
        const severityOrder = {
            'critical': 3,
            'alert': 2,
            'message': 1
        };

        const notifications = await this.getUnreadByUserId(userId);
        
        if (notifications.length === 0) return null;
        
        return notifications.reduce((mostSevere, notification) => {
            if (!mostSevere || severityOrder[notification.type] > severityOrder[mostSevere]) {
                return notification.type;
            }
            return mostSevere;
        }, null);
    }

    /**
     * Get critical and alert notifications for banner display
     */
    static async getBannerNotifications(userId) {
        const bannerQuery = `
            SELECT id, type, title, message, created_at
            FROM notifications 
            WHERE user_id = $1 
            AND is_read = FALSE 
            AND type IN ('critical', 'alert')
            AND title NOT LIKE '%Email Verification Required%'
            ORDER BY 
                CASE type 
                    WHEN 'critical' THEN 1 
                    WHEN 'alert' THEN 2 
                END,
                created_at DESC
        `;
        
        const result = await query(bannerQuery, [userId]);
        return result.rows;
    }
}
