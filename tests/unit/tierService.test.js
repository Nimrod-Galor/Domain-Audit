/**
 * TierService Tests - Critical Priority Testing
 * Tests the real tier service functionality used for user management and audit limits
 */

import { jest } from '@jest/globals';

// Mock the database module that TierService actually uses
jest.unstable_mockModule('../../web/models/database.js', () => ({
  query: jest.fn()
}));

jest.unstable_mockModule('crypto', () => ({
  randomBytes: jest.fn(() => ({ toString: jest.fn(() => 'mock-api-key-123') }))
}));

// Import the service and database query function after mocks
const { TierService } = await import('../../web/services/tierService.js');
const { query } = await import('../../web/models/database.js');

describe('TierService - Critical Functionality Tests', () => {
  let tierService;
  let mockQuery;

  beforeEach(() => {
    // Create fresh service instance
    tierService = new TierService();
    mockQuery = query;

    // Clear all mocks
    jest.clearAllMocks();

    // Setup default database responses to avoid errors
    mockQuery.mockResolvedValue({ rows: [] });
  });

  describe('Tier Configuration', () => {
    test('should get default freemium limits', () => {
      const limits = tierService.getDefaultLimits('freemium');

      expect(limits).toMatchObject({
        tier: 'freemium',
        auditsPerMonth: 1,
        maxPagesPerAudit: 25,
        maxExternalLinks: 10,
        hasAPIAccess: false,
        canAccessFullReports: false
      });
    });

    test('should get default starter limits', () => {
      const limits = tierService.getDefaultLimits('starter');

      expect(limits).toMatchObject({
        tier: 'starter',
        auditsPerMonth: 3,
        maxPagesPerAudit: 100,
        maxExternalLinks: 50,
        hasAPIAccess: false,
        canAccessFullReports: true
      });
    });

    test('should get default professional limits', () => {
      const limits = tierService.getDefaultLimits('professional');

      expect(limits).toMatchObject({
        tier: 'professional',
        auditsPerMonth: -1,
        maxPagesPerAudit: 1000,
        maxExternalLinks: 200,
        hasAPIAccess: true,
        white_label: true
      });
    });

    test('should get default enterprise limits', () => {
      const limits = tierService.getDefaultLimits('enterprise');

      expect(limits).toMatchObject({
        tier: 'enterprise',
        auditsPerMonth: -1,
        maxPagesPerAudit: -1,
        maxExternalLinks: -1,
        team_members: 10
      });
    });

    test('should fallback to freemium for unknown tier', () => {
      const limits = tierService.getDefaultLimits('unknown');
      expect(limits.tier).toBe('freemium');
    });

    test('should get user tier information with database data', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{
          tier: 'starter',
          subscription_status: 'active',
          display_name: 'Starter Plan',
          price_monthly: 999,
          audits_per_month: 25,
          max_internal_pages: 100,
          max_external_links: 100,
          max_domains: 3,
          api_access: false
        }]
      });

      const result = await tierService.getUserTier(123);

      expect(result).toMatchObject({
        tier: 'starter',
        display_name: 'Starter Plan',
        price_monthly: 999,
        limits: {
          audits_per_month: 25,
          max_internal_pages: 100,
          max_external_links: 100,
          max_domains: 3
        }
      });
    });

    test('should return freemium defaults when user not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }); // No user found

      const result = await tierService.getUserTier(999);

      expect(result.tier).toBe('freemium');
      expect(result.display_name).toBe('Freemium');
      expect(result.limits.audits_per_month).toBe(1);
    });
  });

  describe('Audit Permission Checking', () => {
    test('should allow audit within freemium limits', async () => {
      // Test anonymous user (null userId) - should use freemium defaults
      const result = await tierService.canPerformAudit(null, 20, 8);

      expect(result).toMatchObject({
        allowed: true,
        tier: 'freemium'
      });
      // Note: remaining_audits not included for anonymous users
    });

    test('should deny freemium audit exceeding page limits', async () => {
      const result = await tierService.canPerformAudit(null, 100, 5); // Exceeds 25 page limit

      expect(result).toMatchObject({
        allowed: false,
        reason: expect.stringContaining('Page limit exceeded'),
        upgradeRequired: true,
        currentTier: 'freemium'
      });
    });

    test('should deny freemium audit exceeding external link limits', async () => {
      const result = await tierService.canPerformAudit(null, 20, 15); // Exceeds 10 external link limit

      expect(result).toMatchObject({
        allowed: false,
        reason: expect.stringContaining('External link limit exceeded'),
        upgradeRequired: true
      });
    });

    test('should allow starter tier audit within limits', async () => {
      // Mock getUserTierLimits for starter user
      mockQuery.mockResolvedValueOnce({
        rows: [{
          tier: 'starter',
          subscription_status: 'active',
          display_name: 'Starter Plan',
          audits_per_month: 25,
          max_internal_pages: 100,
          max_external_links: 100,
          api_access: false
        }]
      });

      // Mock getCurrentMonthUsage
      mockQuery.mockResolvedValueOnce({
        rows: [{
          audits_used: 5,
          internal_pages_scanned: 200,
          external_links_checked: 50
        }]
      });

      const result = await tierService.canPerformAudit(123, 50, 30);

      expect(result).toMatchObject({
        allowed: true,
        tier: 'starter',
        remaining_audits: 20
      });
    });

    test('should deny audit when monthly audit limit exceeded', async () => {
      // Mock getUserTierLimits for starter user
      mockQuery.mockResolvedValueOnce({
        rows: [{
          tier: 'starter',
          audits_per_month: 25,
          max_internal_pages: 100,
          max_external_links: 100
        }]
      });

      // Mock getCurrentMonthUsage - limit reached
      mockQuery.mockResolvedValueOnce({
        rows: [{
          audits_used: 25, // Limit reached
          internal_pages_scanned: 1000,
          external_links_checked: 500
        }]
      });

      const result = await tierService.canPerformAudit(123, 50, 30);

      expect(result).toMatchObject({
        allowed: false,
        reason: expect.stringContaining('Monthly audit limit exceeded'),
        upgradeRequired: true
      });
    });

    test('should allow enterprise tier unlimited audits', async () => {
      // Mock getUserTierLimits for enterprise user
      mockQuery.mockResolvedValueOnce({
        rows: [{
          tier: 'enterprise',
          audits_per_month: -1, // Unlimited
          max_internal_pages: -1, // Unlimited
          max_external_links: -1, // Unlimited
        }]
      });

      // Mock getCurrentMonthUsage with high usage
      mockQuery.mockResolvedValueOnce({
        rows: [{
          audits_used: 1000,
          internal_pages_scanned: 50000,
          external_links_checked: 25000
        }]
      });

      const result = await tierService.canPerformAudit(789, 1000, 5000);

      expect(result).toMatchObject({
        allowed: true,
        tier: 'enterprise',
        remaining_audits: -1 // Unlimited
      });
    });

    test('should handle professional tier with API access', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{
          tier: 'professional',
          audits_per_month: 200,
          max_internal_pages: 500,
          max_external_links: -1,
          api_access: true,
          white_label: true
        }]
      });

      const result = await tierService.getUserTierLimits(456);

      expect(result).toMatchObject({
        tier: 'professional',
        auditsPerMonth: 200,
        maxExternalLinks: -1,
        hasAPIAccess: true,
        white_label: true
      });
    });
  });

  describe('Usage Recording', () => {
    test('should record audit usage for registered user', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

      const auditData = {
        pagesScanned: 15,
        externalLinksChecked: 25,
        score: 85,
        url: 'https://example.com',
        reportType: 'full',
        duration: 5000
      };

      await tierService.recordAuditUsage(123, auditData);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO usage_tracking'),
        expect.arrayContaining([123, '2025-08', 15, 25]) // Note: month_year format
      );
    });

    test('should not record usage for anonymous users', async () => {
      const auditData = {
        pagesScanned: 10,
        externalLinksChecked: 20
      };

      await tierService.recordAuditUsage(null, auditData);

      // Should not make any database calls for anonymous users
      expect(mockQuery).not.toHaveBeenCalled();
    });

    test('should handle usage recording with individual parameters', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

      await tierService.recordAuditUsage(123, 50, 25, 92);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO usage_tracking'),
        expect.arrayContaining([123, '2025-08', 50, 25]) // Note: month_year format
      );
    });

    test('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      const auditData = {
        pagesScanned: 10,
        externalLinksChecked: 5
      };

      // Should not throw, but may log error
      await tierService.recordAuditUsage(123, auditData);
      
      expect(mockQuery).toHaveBeenCalled();
    });
  });

  describe('Usage Retrieval', () => {
    test('should get current month usage for user', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{
          audits_used: 35,
          internal_pages_scanned: 2,
          external_links_checked: 70,
          api_calls_used: 15
        }]
      });

      const usage = await tierService.getCurrentMonthUsage(123);

      expect(usage).toMatchObject({
        audits_used: 35,
        internal_pages_scanned: 2,
        external_links_checked: 70,
        api_calls_used: 15
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('FROM usage_tracking'),
        expect.arrayContaining([123])
      );
    });

    test('should return zero usage for new user', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }); // No usage record

      const usage = await tierService.getCurrentMonthUsage(123);

      expect(usage).toMatchObject({
        audits_used: 0,
        internal_pages_scanned: 0,
        external_links_checked: 0,
        api_calls_used: 0
      });
    });

    test('should get current usage with tier information', async () => {
      // getCurrentUsage calls getCurrentMonthUsage first, then getUserTierLimits
      mockQuery
        .mockResolvedValueOnce({
          rows: [{
            audits_used: 1,
            internal_pages_scanned: 150,
            external_links_checked: 75,
            api_calls_used: 5
          }]
        })
        .mockResolvedValueOnce({
          rows: [{
            tier: 'starter',
            audits_per_month: 3,
            max_internal_pages: 100,
            api_access: false,
            display_name: 'Starter'
          }]
        });

      const result = await tierService.getCurrentUsage(123);

      expect(result).toMatchObject({
        audits_used: 1,
        audits_limit: 3,
        tier: 'starter',
        remaining_audits: 2
      });
    });

    test('should handle zero usage gracefully', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const usage = await tierService.getCurrentMonthUsage(null);

      expect(usage).toMatchObject({
        audits_used: 0,
        internal_pages_scanned: 0,
        external_links_checked: 0,
        api_calls_used: 0
      });
    });
  });

  describe('User Tier Management', () => {
    test('should update user limits successfully', async () => {
      // Mock tier definition lookup
      mockQuery.mockResolvedValueOnce({
        rows: [{
          tier_name: 'professional',
          audits_per_month: 200,
          max_internal_pages: 500,
          max_external_links: -1,
          api_access: true
        }]
      });

      // Mock user limits upsert
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

      const result = await tierService.updateUserLimits(123, 'professional');

      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_limits'),
        expect.arrayContaining([123, 'professional', 200, 500, -1])
      );
    });

    test('should handle unknown tier with defaults', async () => {
      // Mock tier definition lookup - not found
      mockQuery.mockResolvedValueOnce({ rows: [] });

      // Mock user limits upsert with defaults
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

      const result = await tierService.updateUserLimits(123, 'unknown-tier');

      expect(result).toBe(true);
      // Should still create user limits record even with unknown tier
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_limits'),
        expect.arrayContaining([123, 'unknown-tier'])
      );
    });

    test('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      const result = await tierService.updateUserLimits(123, 'professional');

      expect(result).toBe(false);
    });

    test('should get suggested upgrade tier', () => {
      expect(tierService.getSuggestedUpgradeTier('freemium')).toBe('starter');
      expect(tierService.getSuggestedUpgradeTier('starter')).toBe('professional');
      expect(tierService.getSuggestedUpgradeTier('professional')).toBe('enterprise');
      expect(tierService.getSuggestedUpgradeTier('enterprise')).toBe('enterprise');
      expect(tierService.getSuggestedUpgradeTier('unknown')).toBe('professional'); // Fallback
    });
  });

  describe('API Key Management', () => {
    test('should generate API key for professional tier user', async () => {
      // Mock getUserTierLimits to return professional tier with API access
      mockQuery.mockResolvedValueOnce({
        rows: [{
          tier: 'professional',
          api_access: true,
          audits_per_month: -1 // Unlimited
        }]
      });

      // Mock the API key update query
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

      const apiKey = await tierService.generateApiKey(123);

      expect(apiKey).toBe('sk_mock-api-key-123'); // Note: includes 'sk_' prefix
      
      // Check the second call (UPDATE query) since first is getUserTierLimits
      expect(mockQuery).toHaveBeenNthCalledWith(2,
        expect.stringContaining('UPDATE users SET'),
        expect.arrayContaining(['sk_mock-api-key-123', 123])
      );
    });

    test('should reject API key generation for users without API access', async () => {
      // Mock getUserTierLimits to return starter tier without API access
      mockQuery.mockResolvedValueOnce({
        rows: [{
          tier: 'starter',
          api_access: false,
          audits_per_month: 3
        }]
      });

      await expect(tierService.generateApiKey(123))
        .rejects.toThrow('User tier does not include API access');
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection errors gracefully', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      // getUserTierLimits should fall back to defaults
      const result = await tierService.getUserTierLimits(123);

      expect(result.tier).toBe('freemium'); // Fallback to freemium defaults
    });

    test('should handle usage recording errors without throwing', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Insert failed'));

      const auditData = {
        pagesScanned: 10,
        externalLinksChecked: 5
      };

      // Should complete without throwing
      await expect(tierService.recordAuditUsage(123, auditData))
        .resolves.not.toThrow();
    });

    test('should handle getCurrentUsage errors gracefully', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Query failed'));

      const result = await tierService.getCurrentUsage(123);

      expect(result).toMatchObject({
        audits_used: 0,
        tier: 'freemium',
        remaining_audits: 1
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero pages audit request', async () => {
      const result = await tierService.canPerformAudit(null, 0, 0);

      expect(result.allowed).toBe(true);
    });

    test('should handle negative values gracefully', async () => {
      // Negative values should be normalized or rejected appropriately
      const result = await tierService.canPerformAudit(123, -5, 10);
      
      expect(typeof result.allowed).toBe('boolean');
      // The service should handle this gracefully rather than throwing
    });

    test('should handle very large numbers for enterprise tier', async () => {
      // Mock enterprise tier
      mockQuery.mockResolvedValueOnce({
        rows: [{
          tier: 'enterprise',
          audits_per_month: -1,
          max_internal_pages: -1,
          max_external_links: -1
        }]
      });

      mockQuery.mockResolvedValueOnce({
        rows: [{
          audits_used: 1000,
          internal_pages_scanned: 100000
        }]
      });

      const result = await tierService.canPerformAudit(123, 1000000, 5000000);
      expect(result.allowed).toBe(true); // Enterprise has unlimited
    });

    test('should handle concurrent usage recording', async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 1 });

      const auditData1 = { pagesScanned: 10, externalLinksChecked: 15 };
      const auditData2 = { pagesScanned: 5, externalLinksChecked: 8 };

      // Simulate concurrent calls
      await Promise.all([
        tierService.recordAuditUsage(123, auditData1),
        tierService.recordAuditUsage(123, auditData2)
      ]);

      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    test('should handle missing user limits and create them', async () => {
      // First call returns user without limits
      mockQuery.mockResolvedValueOnce({
        rows: [{
          tier: 'starter',
          audits_per_month: null // Missing limits
        }]
      });

      // updateUserLimits calls
      mockQuery.mockResolvedValueOnce({ rows: [{ tier_name: 'starter' }] }); // Tier definition
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 }); // User limits insert

      // Second getUserTierLimits call after creating limits
      mockQuery.mockResolvedValueOnce({
        rows: [{
          tier: 'starter',
          audits_per_month: 3, // Actual starter default
          max_internal_pages: 100
        }]
      });

      const result = await tierService.getUserTierLimits(123);

      expect(mockQuery).toHaveBeenCalledTimes(4); // Actually makes 4 calls due to the retry logic
      expect(result.auditsPerMonth).toBe(3);
    });

    test('should handle null and undefined parameters', async () => {
      // Should not throw for null userId
      const result1 = await tierService.getUserTierLimits(null);
      expect(result1.tier).toBe('freemium');

      // Should not throw for undefined userId
      const result2 = await tierService.getUserTierLimits(undefined);
      expect(result2.tier).toBe('freemium');

      // Should handle null audit parameters
      const result3 = await tierService.canPerformAudit(null, null, null);
      expect(typeof result3.allowed).toBe('boolean');
    });
  });

  describe('Integration with Real System', () => {
    test('should provide expected data structure for controllers', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{
          tier: 'professional',
          subscription_status: 'active',
          display_name: 'Professional Plan',
          audits_per_month: 200,
          max_internal_pages: 500,
          max_external_links: -1,
          api_access: true,
          white_label: true
        }]
      });

      const result = await tierService.getUserTierLimits(123);

      // Verify it has all expected properties for controllers
      expect(result).toHaveProperty('tier');
      expect(result).toHaveProperty('tierName');
      expect(result).toHaveProperty('auditsPerMonth');
      expect(result).toHaveProperty('maxPagesPerAudit');
      expect(result).toHaveProperty('maxExternalLinks');
      expect(result).toHaveProperty('hasAPIAccess');
      expect(result).toHaveProperty('canAccessFullReports');
      expect(result).toHaveProperty('display_name');
    });

    test('should provide usage data structure expected by dashboard', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{
          audits_used: 15,
          internal_pages_scanned: 750,
          external_links_checked: 300,
          api_calls_used: 50
        }]
      });

      const result = await tierService.getCurrentMonthUsage(123);

      expect(result).toHaveProperty('audits_used');
      expect(result).toHaveProperty('internal_pages_scanned');
      expect(result).toHaveProperty('external_links_checked');
      expect(result).toHaveProperty('api_calls_used');
      expect(typeof result.audits_used).toBe('number');
    });

    test('should handle tier upgrades realistically', async () => {
      // Simulate upgrading from starter to professional
      mockQuery
        .mockResolvedValueOnce({ // Get tier definition
          rows: [{
            tier_name: 'professional',
            audits_per_month: 200,
            max_internal_pages: 500,
            max_external_links: -1,
            api_access: true,
            white_label: true
          }]
        })
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }); // Update user limits

      const result = await tierService.updateUserLimits(123, 'professional');

      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_limits'),
        expect.arrayContaining([123, 'professional', 200, 500, -1])
      );
    });
  });
});
