/**
 * Critical Testing: Notification Controller
 * Tests the real notification controller used in the web application
 */

import { jest } from '@jest/globals';
import { mockDatabase } from '../helpers/MockDatabase.js';

// Mock the notification model
jest.unstable_mockModule('../../web/models/Notification.js', () => ({
  Notification: {
    getUnreadByUserId: jest.fn(),
    getMostSevereType: jest.fn(),
    getByUserId: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    delete: jest.fn(),
    getBannerNotifications: jest.fn(),
    create: jest.fn()
  }
}));

// Import after mocking
const { Notification } = await import('../../web/models/Notification.js');
const notificationController = await import('../../web/controllers/notificationController.js');

describe('Notification Controller - Critical Production Testing', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    // Mock Express request and response objects
    mockReq = {
      user: { id: 123 },
      session: { user: { id: 123, email: 'test@example.com' } },
      params: {},
      query: {},
      body: {}
    };

    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      render: jest.fn()
    };

    // Clear all mocks
    jest.clearAllMocks();
    mockDatabase.clear();
  });

  describe('getNotificationBadge', () => {
    test('should return badge data for authenticated user', async () => {
      const unreadNotifications = [
        { id: 1, type: 'critical', title: 'Critical Issue' },
        { id: 2, type: 'alert', title: 'Warning' }
      ];

      Notification.getUnreadByUserId.mockResolvedValue(unreadNotifications);
      Notification.getMostSevereType.mockResolvedValue('critical');

      await notificationController.getNotificationBadge(mockReq, mockRes);

      expect(Notification.getUnreadByUserId).toHaveBeenCalledWith(123);
      expect(Notification.getMostSevereType).toHaveBeenCalledWith(123);
      expect(mockRes.json).toHaveBeenCalledWith({
        count: 2,
        mostSevereType: 'critical',
        success: true
      });
    });

    test('should handle user from session when req.user not set', async () => {
      mockReq.user = null;
      Notification.getUnreadByUserId.mockResolvedValue([]);
      Notification.getMostSevereType.mockResolvedValue(null);

      await notificationController.getNotificationBadge(mockReq, mockRes);

      expect(Notification.getUnreadByUserId).toHaveBeenCalledWith(123);
    });

    test('should return zero count for unauthenticated user', async () => {
      mockReq.user = null;
      mockReq.session = null;

      await notificationController.getNotificationBadge(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        count: 0,
        mostSevereType: null,
        success: true
      });
      expect(Notification.getUnreadByUserId).not.toHaveBeenCalled();
    });

    test('should handle database errors gracefully', async () => {
      Notification.getUnreadByUserId.mockRejectedValue(new Error('Database connection failed'));

      await notificationController.getNotificationBadge(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to get notification badge',
        success: false
      });
    });
  });

  describe('getNotifications', () => {
    test('should get paginated notifications for user', async () => {
      const notifications = [
        { id: 1, type: 'message', title: 'Test 1' },
        { id: 2, type: 'alert', title: 'Test 2' }
      ];
      const unreadNotifications = [
        { id: 1, type: 'message', title: 'Test 1' }
      ];

      Notification.getByUserId.mockResolvedValue(notifications);
      Notification.getUnreadByUserId.mockResolvedValue(unreadNotifications);

      mockReq.query = { page: '2', limit: '5' };

      await notificationController.getNotifications(mockReq, mockRes);

      expect(Notification.getByUserId).toHaveBeenCalledWith(123, 5, 5); // page 2, limit 5, offset 5
      expect(Notification.getUnreadByUserId).toHaveBeenCalledWith(123);
      expect(mockRes.json).toHaveBeenCalledWith({
        notifications,
        unreadCount: 1,
        page: 2,
        limit: 5,
        success: true
      });
    });

    test('should use default pagination values', async () => {
      Notification.getByUserId.mockResolvedValue([]);
      Notification.getUnreadByUserId.mockResolvedValue([]);

      await notificationController.getNotifications(mockReq, mockRes);

      expect(Notification.getByUserId).toHaveBeenCalledWith(123, 20, 0); // default limit 20, offset 0
    });

    test('should return 401 for unauthenticated user', async () => {
      mockReq.user = null;

      await notificationController.getNotifications(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized'
      });
    });

    test('should handle invalid pagination parameters', async () => {
      mockReq.query = { page: 'invalid', limit: 'invalid' };
      Notification.getByUserId.mockResolvedValue([]);
      Notification.getUnreadByUserId.mockResolvedValue([]);

      await notificationController.getNotifications(mockReq, mockRes);

      expect(Notification.getByUserId).toHaveBeenCalledWith(123, 20, 0); // defaults used
    });
  });

  describe('markAsRead', () => {
    test('should mark notification as read', async () => {
      const updatedNotification = {
        id: 1,
        user_id: 123,
        is_read: true
      };

      mockReq.params = { id: '1' };
      Notification.markAsRead.mockResolvedValue(updatedNotification);

      await notificationController.markAsRead(mockReq, mockRes);

      expect(Notification.markAsRead).toHaveBeenCalledWith('1', 123);
      expect(mockRes.json).toHaveBeenCalledWith({
        notification: updatedNotification,
        success: true
      });
    });

    test('should return 401 for unauthenticated user', async () => {
      mockReq.user = null;
      mockReq.params = { id: '1' };

      await notificationController.markAsRead(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized'
      });
      expect(Notification.markAsRead).not.toHaveBeenCalled();
    });

    test('should handle invalid notification ID', async () => {
      mockReq.params = { id: 'invalid' };
      Notification.markAsRead.mockRejectedValue(new Error('Invalid notification ID'));

      await notificationController.markAsRead(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to mark notification as read',
        success: false
      });
    });
  });

  describe('markAllAsRead', () => {
    test('should mark all notifications as read for user', async () => {
      Notification.markAllAsRead.mockResolvedValue();

      await notificationController.markAllAsRead(mockReq, mockRes);

      expect(Notification.markAllAsRead).toHaveBeenCalledWith(123);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'All notifications marked as read',
        success: true
      });
    });

    test('should return 401 for unauthenticated user', async () => {
      mockReq.user = null;

      await notificationController.markAllAsRead(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized'
      });
    });

    test('should handle database errors', async () => {
      Notification.markAllAsRead.mockRejectedValue(new Error('Database error'));

      await notificationController.markAllAsRead(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to mark all notifications as read',
        success: false
      });
    });
  });

  describe('deleteNotification', () => {
    test('should delete notification for user', async () => {
      mockReq.params = { id: '1' };
      Notification.delete.mockResolvedValue();

      await notificationController.deleteNotification(mockReq, mockRes);

      expect(Notification.delete).toHaveBeenCalledWith('1', 123);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Notification deleted',
        success: true
      });
    });

    test('should return 401 for unauthenticated user', async () => {
      mockReq.user = null;
      mockReq.params = { id: '1' };

      await notificationController.deleteNotification(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized'
      });
    });

    test('should handle non-existent notification', async () => {
      mockReq.params = { id: '999' };
      Notification.delete.mockRejectedValue(new Error('Notification not found'));

      await notificationController.deleteNotification(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to delete notification',
        success: false
      });
    });
  });

  describe('getBannerNotifications', () => {
    test('should get banner notifications for authenticated user', async () => {
      const bannerNotifications = [
        { id: 1, type: 'critical', title: 'Critical Issue' },
        { id: 2, type: 'alert', title: 'Important Alert' }
      ];

      Notification.getBannerNotifications.mockResolvedValue(bannerNotifications);

      await notificationController.getBannerNotifications(mockReq, mockRes);

      expect(Notification.getBannerNotifications).toHaveBeenCalledWith(123);
      expect(mockRes.json).toHaveBeenCalledWith({
        notifications: bannerNotifications,
        success: true
      });
    });

    test('should handle user from session when req.user not set', async () => {
      mockReq.user = null;
      Notification.getBannerNotifications.mockResolvedValue([]);

      await notificationController.getBannerNotifications(mockReq, mockRes);

      expect(Notification.getBannerNotifications).toHaveBeenCalledWith(123);
    });

    test('should return empty array for unauthenticated user', async () => {
      mockReq.user = null;
      mockReq.session = null;

      await notificationController.getBannerNotifications(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        notifications: [],
        success: true
      });
    });

    test('should handle database errors', async () => {
      Notification.getBannerNotifications.mockRejectedValue(new Error('Database error'));

      await notificationController.getBannerNotifications(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to get banner notifications',
        success: false
      });
    });
  });

  describe('createNotification', () => {
    test('should create notification for user', async () => {
      const newNotification = {
        id: 1,
        user_id: 123,
        type: 'message',
        title: 'Test Notification',
        message: 'Test message content'
      };

      Notification.create.mockResolvedValue(newNotification);

      const result = await notificationController.createNotification(
        123, 
        'message', 
        'Test Notification', 
        'Test message content'
      );

      expect(Notification.create).toHaveBeenCalledWith(
        123, 
        'message', 
        'Test Notification', 
        'Test message content'
      );
      expect(result).toEqual(newNotification);
    });

    test('should handle creation errors', async () => {
      Notification.create.mockRejectedValue(new Error('Validation failed'));

      await expect(
        notificationController.createNotification(123, 'invalid', 'Test', 'Test')
      ).rejects.toThrow('Validation failed');
    });

    test('should create different notification types', async () => {
      const criticalNotification = {
        id: 1,
        type: 'critical',
        title: 'Critical Issue Found'
      };

      Notification.create.mockResolvedValue(criticalNotification);

      await notificationController.createNotification(
        123, 
        'critical', 
        'Critical Issue Found', 
        'Your audit found critical issues'
      );

      expect(Notification.create).toHaveBeenCalledWith(
        123, 
        'critical', 
        'Critical Issue Found', 
        'Your audit found critical issues'
      );
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete notification workflow', async () => {
      // Create notification
      const newNotification = { id: 1, user_id: 123, type: 'message', is_read: false };
      Notification.create.mockResolvedValue(newNotification);

      const notification = await notificationController.createNotification(
        123, 'message', 'Test', 'Test message'
      );
      expect(notification.id).toBe(1);

      // Get badge should show count
      Notification.getUnreadByUserId.mockResolvedValue([newNotification]);
      Notification.getMostSevereType.mockResolvedValue('message');

      await notificationController.getNotificationBadge(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({
        count: 1,
        mostSevereType: 'message',
        success: true
      });

      // Mark as read
      const readNotification = { ...newNotification, is_read: true };
      Notification.markAsRead.mockResolvedValue(readNotification);
      mockReq.params = { id: '1' };

      await notificationController.markAsRead(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({
        notification: readNotification,
        success: true
      });
    });

    test('should handle concurrent user requests correctly', async () => {
      // User 1 notifications
      mockReq.user = { id: 123 };
      Notification.getUnreadByUserId.mockResolvedValue([
        { id: 1, user_id: 123, type: 'message' }
      ]);

      await notificationController.getNotifications(mockReq, mockRes);
      expect(Notification.getByUserId).toHaveBeenCalledWith(123, 20, 0);

      // User 2 notifications
      mockReq.user = { id: 456 };
      Notification.getUnreadByUserId.mockResolvedValue([
        { id: 2, user_id: 456, type: 'alert' }
      ]);

      await notificationController.getNotifications(mockReq, mockRes);
      expect(Notification.getByUserId).toHaveBeenCalledWith(456, 20, 0);
    });

    test('should properly isolate user data', async () => {
      mockReq.params = { id: '1' };

      // User 123 tries to access notification
      await notificationController.markAsRead(mockReq, mockRes);
      expect(Notification.markAsRead).toHaveBeenCalledWith('1', 123);

      // Different user tries to access same notification
      mockReq.user = { id: 456 };
      await notificationController.markAsRead(mockReq, mockRes);
      expect(Notification.markAsRead).toHaveBeenCalledWith('1', 456);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle malformed request parameters', async () => {
      mockReq.params = { id: 'not-a-number' };

      // The parseInt should handle this gracefully
      await notificationController.markAsRead(mockReq, mockRes);
      expect(Notification.markAsRead).toHaveBeenCalledWith('not-a-number', 123);
    });

    test('should handle missing required parameters', async () => {
      mockReq.params = {}; // No ID provided

      await notificationController.markAsRead(mockReq, mockRes);
      expect(Notification.markAsRead).toHaveBeenCalledWith(undefined, 123);
    });

    test('should handle session edge cases', async () => {
      // Session exists but user property is undefined
      mockReq.user = null;
      mockReq.session = { someOtherProperty: 'value' };

      await notificationController.getNotificationBadge(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        count: 0,
        mostSevereType: null,
        success: true
      });
    });

    test('should handle database timeout gracefully', async () => {
      Notification.getUnreadByUserId.mockRejectedValue(new Error('Connection timeout'));

      await notificationController.getNotificationBadge(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to get notification badge',
        success: false
      });
    });
  });
});
