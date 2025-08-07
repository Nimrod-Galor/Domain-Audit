/**
 * DashboardController Tests - Real Production Functions
 * Testing actual functions used in the SaaS platform dashboard
 */

import { jest } from '@jest/globals';

// Mock dependencies before importing
const mockTierService = {
  getUserTier: jest.fn(),
  getUserTierLimits: jest.fn(),
  getCurrentMonthUsage: jest.fn(),
  generateApiKey: jest.fn(),
  revokeApiKey: jest.fn()
};

const mockAudit = {
  getUserAudits: jest.fn()
};

const mockQuery = jest.fn();

jest.unstable_mockModule('../../web/services/tierService.js', () => ({
  default: mockTierService
}));

jest.unstable_mockModule('../../web/models/index.js', () => ({
  Audit: mockAudit
}));

jest.unstable_mockModule('../../web/models/database.js', () => ({
  query: mockQuery
}));

// Import after mocking
const {
  getUpgradeRequired,
  getDashboard,
  getDashboardData,
  getSettings,
  getApiPage,
  generateApiKey,
  regenerateApiKey,
  revokeApiKey
} = await import('../../web/controllers/dashboardController.js');

describe('DashboardController - Real Production Functions', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      body: {},
      params: {},
      query: {},
      session: {
        user: { id: 1, email: 'test@example.com', plan: 'starter' }
      },
      user: { id: 1, email: 'test@example.com', plan: 'starter' }
    };

    mockRes = {
      render: jest.fn(),
      redirect: jest.fn(),
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('getUpgradeRequired()', () => {
    test('should display upgrade required page with feature', async () => {
      mockReq.query.feature = 'advanced-reports';
      mockTierService.getUserTier.mockResolvedValue('freemium');

      await getUpgradeRequired(mockReq, mockRes);

      expect(mockTierService.getUserTier).toHaveBeenCalledWith(1);
      expect(mockRes.render).toHaveBeenCalledWith('upgrade-required', {
        title: 'Upgrade Required',
        user: mockReq.session.user,
        feature: 'advanced-reports',
        userTier: 'freemium'
      });
    });

    test('should handle default feature when not specified', async () => {
      mockTierService.getUserTier.mockResolvedValue('starter');

      await getUpgradeRequired(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('upgrade-required', {
        title: 'Upgrade Required',
        user: mockReq.session.user,
        feature: 'full-reports',
        userTier: 'starter'
      });
    });

    test('should handle unauthenticated users', async () => {
      mockReq.session = {};

      await getUpgradeRequired(mockReq, mockRes);

      expect(mockTierService.getUserTier).not.toHaveBeenCalled();
      expect(mockRes.render).toHaveBeenCalledWith('upgrade-required', {
        title: 'Upgrade Required',
        user: null,
        feature: 'full-reports',
        userTier: 'freemium'
      });
    });

    test('should handle database errors gracefully', async () => {
      mockTierService.getUserTier.mockRejectedValue(new Error('Database error'));

      await getUpgradeRequired(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('upgrade-required', {
        title: 'Upgrade Required',
        user: mockReq.session.user,
        feature: 'full-reports',
        userTier: 'freemium'
      });
    });
  });

  describe('getDashboard()', () => {
    test('should render dashboard with user data', async () => {
      const mockUserLimits = {
        plan: 'starter',
        auditsPerMonth: 25,
        pagesPerAudit: 10
      };

      const mockAuditsResult = {
        audits: [
          { id: 1, domain: 'example.com', created_at: '2024-01-15T10:30:00Z', status: 'completed', pages_scanned: 5, score: 85 },
          { id: 2, domain: 'test.com', created_at: '2024-01-14T09:15:00Z', status: 'completed', pages_scanned: 8, score: 92 }
        ]
      };

      mockTierService.getUserTierLimits.mockResolvedValue(mockUserLimits);
      mockAudit.getUserAudits.mockResolvedValue(mockAuditsResult);

      await getDashboard(mockReq, mockRes);

      expect(mockTierService.getUserTierLimits).toHaveBeenCalledWith(1);
      expect(mockRes.render).toHaveBeenCalledWith('dashboard/index', {
        title: 'Dashboard',
        user: mockReq.session.user,
        userLimits: mockUserLimits,
        usageStats: expect.any(Object),
        recentAudits: mockAuditsResult.audits
      });
    });

    test('should handle usage stats errors gracefully', async () => {
      mockTierService.getUserTierLimits.mockResolvedValue({ plan: 'starter' });
      mockAudit.getUserAudits.mockRejectedValue(new Error('Database error'));

      await getDashboard(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('dashboard/index', {
        title: 'Dashboard',
        user: mockReq.session.user,
        userLimits: { plan: 'starter' },
        usageStats: expect.objectContaining({
          auditsThisMonth: 0,
          totalPagesScanned: 0
        }),
        recentAudits: []
      });
    });

    test('should handle database connection failures', async () => {
      mockTierService.getUserTierLimits.mockRejectedValue(new Error('Database connection failed'));

      await getDashboard(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('error', {
        title: 'Dashboard Error',
        user: mockReq.session.user,
        error: 'Unable to load dashboard. Please try again.'
      });
    });
  });

  describe('getDashboardData()', () => {
    test('should return dashboard data as JSON', async () => {
      const mockUserLimits = {
        plan: 'professional',
        auditsPerMonth: 100
      };

      const mockAuditsResult = {
        audits: [
          { id: 1, domain: 'example.com', status: 'completed' }
        ]
      };

      mockTierService.getUserTierLimits.mockResolvedValue(mockUserLimits);
      mockAudit.getUserAudits.mockResolvedValue(mockAuditsResult);

      await getDashboardData(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        userLimits: mockUserLimits,
        usageStats: expect.any(Object),
        recentAudits: expect.any(Array)
      });
    });

    test('should handle API errors', async () => {
      mockTierService.getUserTierLimits.mockRejectedValue(new Error('API error'));

      await getDashboardData(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unable to fetch dashboard data'
      });
    });
  });

  describe('getSettings()', () => {
    test('should render user settings page', async () => {
      const mockUserLimits = {
        plan: 'professional',
        auditsPerMonth: 100
      };

      mockTierService.getUserTierLimits.mockResolvedValue(mockUserLimits);

      await getSettings(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('dashboard/settings', {
        title: 'Settings',
        user: mockReq.session.user,
        userLimits: mockUserLimits
      });
    });

    test('should handle tier service errors', async () => {
      mockTierService.getUserTierLimits.mockRejectedValue(new Error('Tier error'));

      await getSettings(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('error', {
        title: 'Settings Error',
        user: mockReq.session.user,
        error: 'Unable to load settings. Please try again.'
      });
    });
  });

  describe('getApiPage()', () => {
    test('should render API page for users with API access', async () => {
      const mockLimits = {
        plan: 'professional',
        hasApiAccess: true
      };

      const mockUsage = {
        auditsThisMonth: 10,
        limitReached: false
      };

      mockTierService.getUserTierLimits.mockResolvedValue(mockLimits);
      mockTierService.getCurrentMonthUsage.mockResolvedValue(mockUsage);
      mockQuery.mockResolvedValue({
        rows: [{ api_key: 'test-api-key-123' }]
      });

      await getApiPage(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('dashboard/api', {
        title: 'API Access - Dashboard',
        user: expect.objectContaining({
          email: 'test@example.com',
          api_key: 'test-api-key-123'
        }),
        limits: mockLimits,
        usage: mockUsage,
        request: mockReq
      });
    });

    test('should handle database errors gracefully', async () => {
      mockTierService.getUserTierLimits.mockRejectedValue(new Error('Database error'));

      await getApiPage(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('error', {
        title: 'API Access Error',
        user: mockReq.session.user,
        error: 'Unable to load API page. Please try again.'
      });
    });
  });

  describe('generateApiKey()', () => {
    test('should generate new API key for eligible users', async () => {
      const mockApiKey = 'new-api-key-456';
      mockTierService.generateApiKey.mockResolvedValue(mockApiKey);

      await generateApiKey(mockReq, mockRes);

      expect(mockTierService.generateApiKey).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'API key generated successfully',
        key: mockApiKey
      });
    });

    test('should handle generation errors', async () => {
      mockTierService.generateApiKey.mockRejectedValue(new Error('Generation failed'));

      await generateApiKey(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Generation failed'
      });
    });

    test('should handle insufficient tier access', async () => {
      mockTierService.generateApiKey.mockRejectedValue(new Error('User tier does not include API access'));

      await generateApiKey(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'User tier does not include API access'
      });
    });
  });

  describe('regenerateApiKey()', () => {
    test('should regenerate existing API key', async () => {
      const mockNewApiKey = 'regenerated-api-key-789';
      mockTierService.generateApiKey.mockResolvedValue(mockNewApiKey);

      await regenerateApiKey(mockReq, mockRes);

      expect(mockTierService.generateApiKey).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'API key regenerated successfully',
        key: mockNewApiKey
      });
    });

    test('should handle regeneration errors', async () => {
      mockTierService.generateApiKey.mockRejectedValue(new Error('Regeneration failed'));

      await regenerateApiKey(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Regeneration failed'
      });
    });
  });

  describe('revokeApiKey()', () => {
    test('should revoke API key successfully', async () => {
      mockTierService.revokeApiKey.mockResolvedValue(true);

      await revokeApiKey(mockReq, mockRes);

      expect(mockTierService.revokeApiKey).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'API key revoked successfully'
      });
    });

    test('should handle revocation errors', async () => {
      mockTierService.revokeApiKey.mockRejectedValue(new Error('Revocation failed'));

      await revokeApiKey(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Revocation failed'
      });
    });
  });

  describe('Integration with Real System', () => {
    test('should handle complete dashboard workflow', async () => {
      const mockUserLimits = {
        plan: 'professional',
        auditsPerMonth: 100
      };

      const mockAuditsResult = {
        audits: [
          { id: 1, domain: 'site1.com', status: 'completed', created_at: '2024-01-15T10:30:00Z' },
          { id: 2, domain: 'site2.com', status: 'processing', created_at: '2024-01-14T09:15:00Z' }
        ]
      };

      mockTierService.getUserTierLimits.mockResolvedValue(mockUserLimits);
      mockAudit.getUserAudits.mockResolvedValue(mockAuditsResult);

      await getDashboard(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('dashboard/index', {
        title: 'Dashboard',
        user: mockReq.session.user,
        userLimits: mockUserLimits,
        usageStats: expect.any(Object),
        recentAudits: mockAuditsResult.audits
      });
    });

    test('should integrate properly with tier service', async () => {
      mockReq.query.feature = 'api-access';
      mockTierService.getUserTier.mockResolvedValue('professional');

      await getUpgradeRequired(mockReq, mockRes);

      expect(mockTierService.getUserTier).toHaveBeenCalledWith(1);
      expect(mockRes.render).toHaveBeenCalledWith('upgrade-required', {
        title: 'Upgrade Required',
        user: mockReq.session.user,
        feature: 'api-access',
        userTier: 'professional'
      });
    });

    test('should handle API key lifecycle correctly', async () => {
      const mockApiKey = 'lifecycle-test-key';
      
      // Generate
      mockTierService.generateApiKey.mockResolvedValue(mockApiKey);
      await generateApiKey(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'API key generated successfully',
        key: mockApiKey
      });

      // Regenerate (uses the same generateApiKey function)
      jest.clearAllMocks();
      const newApiKey = 'new-lifecycle-key';
      mockTierService.generateApiKey.mockResolvedValue(newApiKey);
      await regenerateApiKey(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'API key regenerated successfully',
        key: newApiKey
      });

      // Revoke
      jest.clearAllMocks();
      mockTierService.revokeApiKey.mockResolvedValue(true);
      await revokeApiKey(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'API key revoked successfully'
      });
    });
  });

  describe('Error Handling & Edge Cases', () => {
    test('should handle missing user session gracefully', async () => {
      mockReq.session = {};
      mockReq.user = undefined;

      await getUpgradeRequired(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('upgrade-required', {
        title: 'Upgrade Required',
        user: null,
        feature: 'full-reports',
        userTier: 'freemium'
      });
    });

    test('should handle malformed user data', async () => {
      mockReq.session.user = { email: 'test@example.com' }; // Missing ID
      mockReq.user = { email: 'test@example.com' };

      mockTierService.getUserTierLimits.mockRejectedValue(new Error('Invalid user ID'));

      await getSettings(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('error', {
        title: 'Settings Error',
        user: mockReq.session.user,
        error: 'Unable to load settings. Please try again.'
      });
    });

    test('should handle concurrent API operations', async () => {
      const promises = [
        generateApiKey(mockReq, mockRes),
        regenerateApiKey(mockReq, mockRes),
        revokeApiKey(mockReq, mockRes)
      ];

      mockTierService.generateApiKey.mockResolvedValue('key1');
      mockTierService.revokeApiKey.mockResolvedValue(true);

      await Promise.all(promises);

      expect(mockTierService.generateApiKey).toHaveBeenCalledWith(1);
      expect(mockTierService.revokeApiKey).toHaveBeenCalledWith(1);
    });
  });
});
