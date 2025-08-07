/**
 * Critical Testing: Notification Model
 * Tests the real notification model used in the web application
 */

import { jest } from '@jest/globals';
import { mockDatabase } from '../helpers/MockDatabase.js';

// Mock the database module
jest.unstable_mockModule('../../web/models/database.js', () => ({
  query: jest.fn(),
  getPool: jest.fn(() => ({ end: jest.fn() }))
}));

// Import after mocking
const { query } = await import('../../web/models/database.js');
const { Notification } = await import('../../web/models/Notification.js');

describe('Notification Model - Critical Production Testing', () => {
  let mockQuery;

  beforeEach(() => {
    mockQuery = query;
    mockQuery.mockClear();
    mockDatabase.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Table Creation', () => {
    test('should create notifications table with proper schema', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      await Notification.createTable();

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS notifications')
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('user_id INTEGER NOT NULL REFERENCES users(id)')
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("type VARCHAR(20) NOT NULL CHECK (type IN ('message', 'alert', 'critical'))")
      );
    });

    test('should create proper indexes for performance', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      await Notification.createTable();

      const calledQuery = mockQuery.mock.calls[0][0];
      expect(calledQuery).toContain('CREATE INDEX IF NOT EXISTS idx_notifications_user_id');
      expect(calledQuery).toContain('CREATE INDEX IF NOT EXISTS idx_notifications_is_read');
      expect(calledQuery).toContain('CREATE INDEX IF NOT EXISTS idx_notifications_created_at');
    });
  });

  describe('Notification Creation', () => {
    test('should create notification with proper parameters', async () => {
      const mockNotification = {
        id: 1,
        user_id: 123,
        type: 'message',
        title: 'Test Notification',
        message: 'Test message content',
        is_read: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockNotification] });

      const result = await Notification.create(123, 'message', 'Test Notification', 'Test message content');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO notifications'),
        [123, 'message', 'Test Notification', 'Test message content']
      );
      expect(result).toEqual(mockNotification);
    });

    test('should create critical notification correctly', async () => {
      const criticalNotification = {
        id: 2,
        user_id: 456,
        type: 'critical',
        title: 'Critical Issue Found',
        message: 'Your audit found critical SEO issues requiring immediate attention',
        is_read: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockQuery.mockResolvedValueOnce({ rows: [criticalNotification] });

      const result = await Notification.create(
        456, 
        'critical', 
        'Critical Issue Found', 
        'Your audit found critical SEO issues requiring immediate attention'
      );

      expect(result.type).toBe('critical');
      expect(result.user_id).toBe(456);
    });

    test('should create alert notification correctly', async () => {
      const alertNotification = {
        id: 3,
        user_id: 789,
        type: 'alert',
        title: 'Audit Limit Warning',
        message: 'You have used 80% of your monthly audit quota',
        is_read: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockQuery.mockResolvedValueOnce({ rows: [alertNotification] });

      const result = await Notification.create(
        789, 
        'alert', 
        'Audit Limit Warning', 
        'You have used 80% of your monthly audit quota'
      );

      expect(result.type).toBe('alert');
      expect(result.title).toBe('Audit Limit Warning');
    });
  });

  describe('Retrieving Notifications', () => {
    test('should get unread notifications for user', async () => {
      const unreadNotifications = [
        { id: 1, user_id: 123, type: 'message', title: 'Test 1', is_read: false },
        { id: 2, user_id: 123, type: 'alert', title: 'Test 2', is_read: false }
      ];

      mockQuery.mockResolvedValueOnce({ rows: unreadNotifications });

      const result = await Notification.getUnreadByUserId(123);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1 AND is_read = FALSE'),
        [123]
      );
      expect(result).toEqual(unreadNotifications);
    });

    test('should get paginated notifications for user', async () => {
      const notifications = [
        { id: 1, user_id: 123, type: 'message', title: 'Test 1' },
        { id: 2, user_id: 123, type: 'alert', title: 'Test 2' }
      ];

      mockQuery.mockResolvedValueOnce({ rows: notifications });

      const result = await Notification.getByUserId(123, 10, 0);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT $2 OFFSET $3'),
        [123, 10, 0]
      );
      expect(result).toEqual(notifications);
    });

    test('should get notifications with custom pagination', async () => {
      const notifications = [
        { id: 3, user_id: 456, type: 'critical', title: 'Test 3' }
      ];

      mockQuery.mockResolvedValueOnce({ rows: notifications });

      await Notification.getByUserId(456, 5, 10);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT $2 OFFSET $3'),
        [456, 5, 10]
      );
    });
  });

  describe('Notification Management', () => {
    test('should mark notification as read', async () => {
      const updatedNotification = {
        id: 1,
        user_id: 123,
        is_read: true,
        updated_at: new Date()
      };

      mockQuery.mockResolvedValueOnce({ rows: [updatedNotification] });

      const result = await Notification.markAsRead(1, 123);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE notifications'),
        [1, 123]
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SET is_read = TRUE'),
        [1, 123]
      );
      expect(result).toEqual(updatedNotification);
    });

    test('should mark all notifications as read for user', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 3 });

      await Notification.markAllAsRead(123);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE notifications'),
        [123]
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1 AND is_read = FALSE'),
        [123]
      );
    });

    test('should delete notification for user', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

      await Notification.delete(1, 123);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM notifications'),
        [1, 123]
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = $1 AND user_id = $2'),
        [1, 123]
      );
    });
  });

  describe('Notification Analytics', () => {
    test('should get unread count by type', async () => {
      const countData = [
        { type: 'critical', count: '2' },
        { type: 'alert', count: '3' },
        { type: 'message', count: '1' }
      ];

      mockQuery.mockResolvedValueOnce({ rows: countData });

      const result = await Notification.getUnreadCountByType(123);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('GROUP BY type'),
        [123]
      );
      expect(result).toEqual({
        critical: 2,
        alert: 3,
        message: 1
      });
    });

    test('should get most severe notification type', async () => {
      const severityData = [
        { type: 'critical', created_at: new Date() }
      ];

      mockQuery.mockResolvedValueOnce({ rows: severityData });

      const result = await Notification.getMostSevereType(123);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY'),
        [123]
      );
      expect(result).toBe('critical');
    });

    test('should return null when no notifications exist', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await Notification.getMostSevereType(123);

      expect(result).toBeNull();
    });
  });

  describe('Banner Notifications', () => {
    test('should get critical and alert notifications for banner', async () => {
      const bannerNotifications = [
        { 
          id: 1, 
          type: 'critical', 
          title: 'Critical Issue', 
          message: 'Immediate attention required',
          created_at: new Date()
        },
        { 
          id: 2, 
          type: 'alert', 
          title: 'Warning', 
          message: 'Please review your settings',
          created_at: new Date()
        }
      ];

      mockQuery.mockResolvedValueOnce({ rows: bannerNotifications });

      const result = await Notification.getBannerNotifications(123);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("type IN ('critical', 'alert')"),
        [123]
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('is_read = FALSE'),
        [123]
      );
      expect(result).toEqual(bannerNotifications);
    });

    test('should exclude email verification notifications from banner', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await Notification.getBannerNotifications(123);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("title NOT LIKE '%Email Verification Required%'"),
        [123]
      );
    });

    test('should order banner notifications by severity and date', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await Notification.getBannerNotifications(123);

      const calledQuery = mockQuery.mock.calls[0][0];
      expect(calledQuery).toContain('ORDER BY');
      expect(calledQuery).toContain("CASE type");
      expect(calledQuery).toContain("WHEN 'critical' THEN 1");
      expect(calledQuery).toContain("WHEN 'alert' THEN 2");
      expect(calledQuery).toContain('created_at DESC');
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully in create', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(
        Notification.create(123, 'message', 'Test', 'Test message')
      ).rejects.toThrow('Database connection failed');
    });

    test('should handle database errors in getUnreadByUserId', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Query timeout'));

      await expect(
        Notification.getUnreadByUserId(123)
      ).rejects.toThrow('Query timeout');
    });

    test('should handle database errors in markAsRead', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Transaction failed'));

      await expect(
        Notification.markAsRead(1, 123)
      ).rejects.toThrow('Transaction failed');
    });

    test('should handle invalid notification types', async () => {
      mockQuery.mockRejectedValueOnce(new Error('CHECK constraint violation'));

      await expect(
        Notification.create(123, 'invalid', 'Test', 'Test message')
      ).rejects.toThrow('CHECK constraint violation');
    });
  });

  describe('Data Validation', () => {
    test('should handle empty results gracefully', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await Notification.getUnreadByUserId(123);

      expect(result).toEqual([]);
    });

    test('should handle null values properly', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [null] });

      const result = await Notification.markAsRead(1, 123);

      expect(result).toBeNull();
    });

    test('should handle large notification lists', async () => {
      const largeNotificationList = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        user_id: 123,
        type: 'message',
        title: `Notification ${i + 1}`,
        message: `Message content ${i + 1}`,
        is_read: false,
        created_at: new Date()
      }));

      mockQuery.mockResolvedValueOnce({ rows: largeNotificationList });

      const result = await Notification.getByUserId(123, 1000, 0);

      expect(result).toHaveLength(1000);
    });
  });

  describe('Integration with User Management', () => {
    test('should respect user isolation in queries', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await Notification.getUnreadByUserId(123);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1'),
        [123]
      );
    });

    test('should enforce user ownership in delete operations', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

      await Notification.delete(1, 123);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = $1 AND user_id = $2'),
        [1, 123]
      );
    });

    test('should enforce user ownership in mark as read operations', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{}] });

      await Notification.markAsRead(1, 123);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = $1 AND user_id = $2'),
        [1, 123]
      );
    });
  });
});
