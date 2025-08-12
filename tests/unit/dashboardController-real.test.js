/**
 * Dashboard Controller Tests - Real Function Validation
 * Testing all 8 critical production functions in DashboardController
 */

import { jest } from '@jest/globals';

// Mock all dependencies before importing
jest.unstable_mockModule('../../web/services/tierService.js', () => ({
  default: {
    getUserTier: jest.fn(),
    getUserTierLimits: jest.fn(),
    getUserUsageStats: jest.fn(),
    getCurrentMonthUsage: jest.fn(),
    generateApiKey: jest.fn(),
    revokeApiKey: jest.fn()
  }
}));

jest.unstable_mockModule('../../web/models/index.js', () => ({
  Audit: {
    getUserAudits: jest.fn()
  }
}));

jest.unstable_mockModule('../../web/models/database.js', () => ({
  query: jest.fn()
}));

let getUpgradeRequired,
  getDashboard,
  getDashboardData,
  getSettings,
  getApiPage,
  generateApiKey,
  regenerateApiKey,
  revokeApiKey,
  tierService,
  Audit,
  query;

beforeAll(async () => {
  const controller = await import('../../web/controllers/dashboardController.js');
  ({
    getUpgradeRequired,
    getDashboard,
    getDashboardData,
    getSettings,
    getApiPage,
    generateApiKey,
    regenerateApiKey,
    revokeApiKey
  } = controller);
  tierService = (await import('../../web/services/tierService.js')).default;
  ({ Audit } = await import('../../web/models/index.js'));
  ({ query } = await import('../../web/models/database.js'));
});

describe('DashboardController - Critical Production Functions', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Request
    mockReq = {
      session: {
        user: {
          id: 123,
          email: 'test@example.com',
          plan: 'professional'
        }
      },
      query: {},
      params: {},
      body: {}
    };

    // Mock Response with all methods
    mockRes = {
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('1. getUpgradeRequired - SaaS Upgrade Page Function', () => {
    it('should display upgrade page with tier information', async () => {
  tierService.getUserTier.mockResolvedValue('starter');
      mockReq.query.feature = 'api-access';

      await getUpgradeRequired(mockReq, mockRes);

  expect(tierService.getUserTier).toHaveBeenCalledWith(123);
      expect(mockRes.render).toHaveBeenCalledWith('upgrade-required', {
        title: 'Upgrade Required',
        user: mockReq.session.user,
        feature: 'api-access',
        userTier: 'starter'
      });
    });

    it('should handle unauthenticated users', async () => {
      mockReq.session.user = null;

      await getUpgradeRequired(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('upgrade-required', {
        title: 'Upgrade Required',
        user: null,
        feature: 'full-reports',
        userTier: 'freemium'
      });
    });

    it('should handle tier service errors gracefully', async () => {
  tierService.getUserTier.mockRejectedValue(new Error('Service error'));

      await getUpgradeRequired(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('upgrade-required', {
        title: 'Upgrade Required',
        user: mockReq.session.user,
        feature: 'full-reports',
        userTier: 'freemium'
      });
    });
  });

  describe('2. getDashboard - Main Dashboard Function', () => {
    it('should redirect unauthenticated users', async () => {
      mockReq.session.user = null;

      await getDashboard(mockReq, mockRes);

      expect(mockRes.redirect).toHaveBeenCalledWith('/auth/login');
    });

    it('should display dashboard with complete user data', async () => {
      const mockLimits = { maxAudits: 10, plan: 'professional' };
      const mockAudits = { audits: [{ id: 1, domain: 'test.com' }] };

  tierService.getUserTierLimits.mockResolvedValue(mockLimits);
  Audit.getUserAudits.mockResolvedValue(mockAudits);

      await getDashboard(mockReq, mockRes);

  expect(tierService.getUserTierLimits).toHaveBeenCalledWith(123);
      expect(mockRes.render).toHaveBeenCalledWith('dashboard/index', expect.objectContaining({
        title: 'Dashboard',
        user: mockReq.session.user,
        userLimits: mockLimits
      }));
    });

    it('should handle dashboard errors gracefully', async () => {
  tierService.getUserTierLimits.mockRejectedValue(new Error('Database error'));

      await getDashboard(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('error', {
        title: 'Dashboard Error',
        user: mockReq.session.user,
        error: 'Unable to load dashboard. Please try again.'
      });
    });
  });

  describe('3. getDashboardData - API Dashboard Data Function', () => {
    it('should return dashboard data as JSON', async () => {
      const mockLimits = { maxAudits: 50, plan: 'professional' };
      const mockStats = { auditsThisMonth: 5, averageScore: 85 };
      const mockAudits = { audits: [{ id: 1, domain: 'api.test.com' }] };

  tierService.getUserTierLimits.mockResolvedValue(mockLimits);
  tierService.getUserUsageStats.mockResolvedValue(mockStats);
      Audit.getUserAudits.mockResolvedValue(mockAudits);

      await getDashboardData(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        userLimits: mockLimits,
        usageStats: expect.any(Object),
        recentAudits: expect.any(Array)
      }));
    });

    it('should handle unauthorized access', async () => {
      mockReq.session.user = null;

      await getDashboardData(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should handle API errors', async () => {
  tierService.getUserTierLimits.mockRejectedValue(new Error('API error'));

      await getDashboardData(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unable to fetch dashboard data' });
    });
  });

  describe('4. getSettings - User Settings Function', () => {
    it('should display settings page with user limits', async () => {
      const mockLimits = { plan: 'professional', maxTeamMembers: 10 };
  tierService.getUserTierLimits.mockResolvedValue(mockLimits);

      await getSettings(mockReq, mockRes);

  expect(tierService.getUserTierLimits).toHaveBeenCalledWith(123);
      expect(mockRes.render).toHaveBeenCalledWith('dashboard/settings', {
        title: 'Settings',
        user: mockReq.session.user,
        userLimits: mockLimits
      });
    });

    it('should redirect unauthenticated users', async () => {
      mockReq.session.user = null;

      await getSettings(mockReq, mockRes);

      expect(mockRes.redirect).toHaveBeenCalledWith('/auth/login');
    });

    it('should handle settings errors', async () => {
  tierService.getUserTierLimits.mockRejectedValue(new Error('Settings error'));

      await getSettings(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('error', {
        title: 'Settings Error',
        user: mockReq.session.user,
        error: 'Unable to load settings. Please try again.'
      });
    });
  });

  describe('5. getApiPage - API Management Function', () => {
    it('should display API page with user data and limits', async () => {
      const mockLimits = { hasAPIAccess: true, maxApiCalls: 1000 };
      const mockUsage = { apiCallsThisMonth: 150 };
      const mockUserData = { rows: [{ api_key: 'test-api-key-123' }] };

  tierService.getUserTierLimits.mockResolvedValue(mockLimits);
  tierService.getCurrentMonthUsage.mockResolvedValue(mockUsage);
      query.mockResolvedValue(mockUserData);

      await getApiPage(mockReq, mockRes);

  expect(tierService.getUserTierLimits).toHaveBeenCalledWith(123);
  expect(tierService.getCurrentMonthUsage).toHaveBeenCalledWith(123);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT api_key FROM users'),
        [123]
      );
      expect(mockRes.render).toHaveBeenCalledWith('dashboard/api', expect.objectContaining({
        title: 'API Access - Dashboard',
        limits: mockLimits,
        usage: mockUsage
      }));
    });

    it('should handle API page errors', async () => {
  tierService.getUserTierLimits.mockRejectedValue(new Error('API error'));

      await getApiPage(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('error', {
        title: 'API Access Error',
        user: mockReq.session.user,
        error: 'Unable to load API page. Please try again.'
      });
    });
  });

  describe('6. generateApiKey - API Key Generation Function', () => {
    it('should generate new API key successfully', async () => {
      const mockApiKey = 'new-api-key-xyz789';
  tierService.generateApiKey.mockResolvedValue(mockApiKey);

      await generateApiKey(mockReq, mockRes);

  expect(tierService.generateApiKey).toHaveBeenCalledWith(123);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'API key generated successfully',
        key: mockApiKey
      });
    });

    it('should handle API key generation errors', async () => {
  tierService.generateApiKey.mockRejectedValue(new Error('Generation limit exceeded'));

      await generateApiKey(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Generation limit exceeded'
      });
    });
  });

  describe('7. regenerateApiKey - API Key Regeneration Function', () => {
    it('should regenerate existing API key', async () => {
      const mockNewKey = 'regenerated-api-key-abc123';
  tierService.generateApiKey.mockResolvedValue(mockNewKey);

      await regenerateApiKey(mockReq, mockRes);

  expect(tierService.generateApiKey).toHaveBeenCalledWith(123);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'API key regenerated successfully',
        key: mockNewKey
      });
    });

    it('should handle regeneration errors', async () => {
  tierService.generateApiKey.mockRejectedValue(new Error('Regeneration failed'));

      await regenerateApiKey(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Regeneration failed'
      });
    });
  });

  describe('8. revokeApiKey - API Key Revocation Function', () => {
    it('should revoke API key successfully', async () => {
  tierService.revokeApiKey.mockResolvedValue();

      await revokeApiKey(mockReq, mockRes);

  expect(tierService.revokeApiKey).toHaveBeenCalledWith(123);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'API key revoked successfully'
      });
    });

    it('should handle revocation errors', async () => {
  tierService.revokeApiKey.mockRejectedValue(new Error('Revocation failed'));

      await revokeApiKey(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Revocation failed'
      });
    });
  });

  describe('Integration Tests - Real SaaS Dashboard Scenarios', () => {
    it('should handle complete dashboard workflow for professional user', async () => {
      const mockLimits = {
        plan: 'professional',
        maxAudits: 100,
        hasAdvancedReports: true,
        hasAPIAccess: true
      };
      const mockAudits = { audits: [{ id: 1, domain: 'client.com', score: 95 }] };

  tierService.getUserTierLimits.mockResolvedValue(mockLimits);
  Audit.getUserAudits.mockResolvedValue(mockAudits);

      await getDashboard(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('dashboard/index', expect.objectContaining({
        user: expect.objectContaining({ plan: 'professional' }),
        userLimits: expect.objectContaining({ hasAPIAccess: true })
      }));
    });

    it('should handle API workflow from page to key generation', async () => {
      // Step 1: Load API page
      const mockLimits = { hasAPIAccess: true };
      const mockUsage = { apiCallsThisMonth: 50 };
  tierService.getUserTierLimits.mockResolvedValue(mockLimits);
  tierService.getCurrentMonthUsage.mockResolvedValue(mockUsage);
      query.mockResolvedValue({ rows: [{ api_key: null }] });

      await getApiPage(mockReq, mockRes);
      expect(mockRes.render).toHaveBeenCalledWith('dashboard/api', expect.any(Object));

      // Step 2: Generate API key
      const mockApiKey = 'generated-key-123';
  tierService.generateApiKey.mockResolvedValue(mockApiKey);

      await generateApiKey(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'API key generated successfully',
        key: mockApiKey
      });
    });

    it('should handle tier-based restrictions', async () => {
      // Test freemium user trying to access API features
      mockReq.session.user.plan = 'freemium';
      mockReq.query.feature = 'api-access';
    // Ensure tier service returns a value to avoid error path
    tierService.getUserTier.mockResolvedValue('freemium');

      await getUpgradeRequired(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('upgrade-required', expect.objectContaining({
        feature: 'api-access',
        user: expect.objectContaining({ plan: 'freemium' })
      }));
    });

    it('should handle concurrent dashboard operations', async () => {
      const mockLimits = { plan: 'enterprise' };
      const mockAudits = { audits: [] };

  tierService.getUserTierLimits.mockResolvedValue(mockLimits);
  Audit.getUserAudits.mockResolvedValue(mockAudits);

      // Simulate concurrent requests
      const promises = [
        getDashboard(mockReq, mockRes),
        getDashboardData(mockReq, mockRes),
        getSettings(mockReq, mockRes)
      ];

      await Promise.all(promises);

  expect(tierService.getUserTierLimits).toHaveBeenCalledTimes(3);
    });
  });
});
