import { jest } from '@jest/globals';
import { TierService } from '../../../audit-website/services/tierService.js';
import { UserFactory } from '../../factories/UserFactory.js';
import { AuditFactory } from '../../factories/AuditFactory.js';

describe('TierService', () => {
  let tierService;
  let mockDatabase;

  beforeEach(() => {
    mockDatabase = {
      query: jest.fn(),
      transaction: jest.fn()
    };
    tierService = new TierService(mockDatabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserTier', () => {
    test('should return correct tier for user', async () => {
      const user = UserFactory.create({ tier_id: 2 });
      mockDatabase.query.mockResolvedValue({
        rows: [{
          id: 2,
          name: 'Pro',
          audit_limit: 50,
          max_pages_per_audit: 100,
          features: ['advanced_seo', 'performance_monitoring']
        }]
      });

      const result = await tierService.getUserTier(user.id);

      expect(result).toHaveProperty('id', 2);
      expect(result).toHaveProperty('name', 'Pro');
      expect(result).toHaveProperty('audit_limit', 50);
      expect(result).toHaveProperty('max_pages_per_audit', 100);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [user.id]
      );
    });

    test('should throw error for non-existent user', async () => {
      mockDatabase.query.mockResolvedValue({ rows: [] });

      await expect(tierService.getUserTier(999)).rejects.toThrow('User tier not found');
    });

    test('should handle database errors gracefully', async () => {
      mockDatabase.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(tierService.getUserTier(1)).rejects.toThrow('Database connection failed');
    });
  });

  describe('checkAuditLimit', () => {
    test('should return true when user is within audit limit', async () => {
      const user = UserFactory.create({ tier_id: 1 });
      
      // Mock tier lookup
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [{ audit_limit: 10 }]
        })
        // Mock current usage count
        .mockResolvedValueOnce({
          rows: [{ count: '5' }]
        });

      const result = await tierService.checkAuditLimit(user.id);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5);
      expect(result.limit).toBe(10);
    });

    test('should return false when user has exceeded audit limit', async () => {
      const user = UserFactory.create({ tier_id: 1 });
      
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [{ audit_limit: 10 }]
        })
        .mockResolvedValueOnce({
          rows: [{ count: '12' }]
        });

      const result = await tierService.checkAuditLimit(user.id);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.limit).toBe(10);
    });

    test('should handle unlimited tier correctly', async () => {
      const user = UserFactory.create({ tier_id: 3 });
      
      mockDatabase.query.mockResolvedValueOnce({
        rows: [{ audit_limit: -1 }] // -1 indicates unlimited
      });

      const result = await tierService.checkAuditLimit(user.id);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(-1);
      expect(result.limit).toBe(-1);
    });
  });

  describe('canAccessFeature', () => {
    test('should return true for features available in user tier', async () => {
      const user = UserFactory.create({ tier_id: 2 });
      
      mockDatabase.query.mockResolvedValue({
        rows: [{
          features: ['advanced_seo', 'performance_monitoring', 'api_access']
        }]
      });

      const result = await tierService.canAccessFeature(user.id, 'advanced_seo');

      expect(result).toBe(true);
    });

    test('should return false for features not available in user tier', async () => {
      const user = UserFactory.create({ tier_id: 1 });
      
      mockDatabase.query.mockResolvedValue({
        rows: [{
          features: ['basic_seo']
        }]
      });

      const result = await tierService.canAccessFeature(user.id, 'advanced_seo');

      expect(result).toBe(false);
    });

    test('should handle empty features array', async () => {
      const user = UserFactory.create({ tier_id: 1 });
      
      mockDatabase.query.mockResolvedValue({
        rows: [{
          features: []
        }]
      });

      const result = await tierService.canAccessFeature(user.id, 'any_feature');

      expect(result).toBe(false);
    });
  });

  describe('upgradeTier', () => {
    test('should successfully upgrade user tier', async () => {
      const user = UserFactory.create({ tier_id: 1 });
      const newTierDetails = {
        id: 2,
        name: 'Pro',
        price: 29.99
      };

      mockDatabase.transaction.mockImplementation(async (callback) => {
        const mockClient = {
          query: jest.fn().mockResolvedValue({ rowCount: 1 })
        };
        return callback(mockClient);
      });

      const result = await tierService.upgradeTier(user.id, 2);

      expect(result.success).toBe(true);
      expect(result.newTier).toBe(2);
      expect(mockDatabase.transaction).toHaveBeenCalled();
    });

    test('should prevent downgrading to lower tier', async () => {
      const user = UserFactory.create({ tier_id: 2 });

      mockDatabase.query.mockResolvedValue({
        rows: [{ tier_id: 2 }]
      });

      await expect(tierService.upgradeTier(user.id, 1)).rejects.toThrow('Cannot downgrade tier');
    });

    test('should handle payment processing failure', async () => {
      const user = UserFactory.create({ tier_id: 1 });

      mockDatabase.transaction.mockImplementation(async (callback) => {
        throw new Error('Payment processing failed');
      });

      await expect(tierService.upgradeTier(user.id, 2)).rejects.toThrow('Payment processing failed');
    });
  });

  describe('getUsageStatistics', () => {
    test('should return comprehensive usage statistics', async () => {
      const user = UserFactory.create({ tier_id: 2 });
      
      mockDatabase.query
        // Current period audits
        .mockResolvedValueOnce({
          rows: [{ count: '15' }]
        })
        // Pages crawled this month
        .mockResolvedValueOnce({
          rows: [{ total_pages: '450' }]
        })
        // Storage used
        .mockResolvedValueOnce({
          rows: [{ storage_mb: '125.5' }]
        })
        // API calls this month
        .mockResolvedValueOnce({
          rows: [{ api_calls: '890' }]
        });

      const result = await tierService.getUsageStatistics(user.id);

      expect(result).toHaveProperty('audits', 15);
      expect(result).toHaveProperty('pagesCrawled', 450);
      expect(result).toHaveProperty('storageUsed', 125.5);
      expect(result).toHaveProperty('apiCalls', 890);
      expect(result).toHaveProperty('period');
    });

    test('should handle zero usage correctly', async () => {
      const user = UserFactory.create({ tier_id: 1 });
      
      mockDatabase.query
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [{ total_pages: '0' }] })
        .mockResolvedValueOnce({ rows: [{ storage_mb: '0' }] })
        .mockResolvedValueOnce({ rows: [{ api_calls: '0' }] });

      const result = await tierService.getUsageStatistics(user.id);

      expect(result.audits).toBe(0);
      expect(result.pagesCrawled).toBe(0);
      expect(result.storageUsed).toBe(0);
      expect(result.apiCalls).toBe(0);
    });
  });

  describe('enforcePageLimit', () => {
    test('should allow audit within page limit', async () => {
      const user = UserFactory.create({ tier_id: 2 });
      
      mockDatabase.query.mockResolvedValue({
        rows: [{ max_pages_per_audit: 100 }]
      });

      const result = await tierService.enforcePageLimit(user.id, 50);

      expect(result.allowed).toBe(true);
      expect(result.maxPages).toBe(100);
      expect(result.requestedPages).toBe(50);
    });

    test('should restrict audit exceeding page limit', async () => {
      const user = UserFactory.create({ tier_id: 1 });
      
      mockDatabase.query.mockResolvedValue({
        rows: [{ max_pages_per_audit: 25 }]
      });

      const result = await tierService.enforcePageLimit(user.id, 50);

      expect(result.allowed).toBe(false);
      expect(result.maxPages).toBe(25);
      expect(result.requestedPages).toBe(50);
      expect(result.suggestedLimit).toBe(25);
    });

    test('should handle unlimited page tier', async () => {
      const user = UserFactory.create({ tier_id: 3 });
      
      mockDatabase.query.mockResolvedValue({
        rows: [{ max_pages_per_audit: -1 }]
      });

      const result = await tierService.enforcePageLimit(user.id, 1000);

      expect(result.allowed).toBe(true);
      expect(result.maxPages).toBe(-1);
    });
  });

  describe('getTierComparison', () => {
    test('should return comparison between all available tiers', async () => {
      mockDatabase.query.mockResolvedValue({
        rows: [
          {
            id: 1,
            name: 'Basic',
            price: 0,
            audit_limit: 5,
            max_pages_per_audit: 25,
            features: ['basic_seo']
          },
          {
            id: 2,
            name: 'Pro',
            price: 29.99,
            audit_limit: 50,
            max_pages_per_audit: 100,
            features: ['basic_seo', 'advanced_seo', 'performance_monitoring']
          },
          {
            id: 3,
            name: 'Enterprise',
            price: 99.99,
            audit_limit: -1,
            max_pages_per_audit: -1,
            features: ['basic_seo', 'advanced_seo', 'performance_monitoring', 'api_access', 'white_label']
          }
        ]
      });

      const result = await tierService.getTierComparison();

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('name', 'Basic');
      expect(result[1]).toHaveProperty('name', 'Pro');
      expect(result[2]).toHaveProperty('name', 'Enterprise');
      expect(result[2].features).toContain('white_label');
    });
  });

  describe('performance and edge cases', () => {
    test('should handle concurrent tier checks efficiently', async () => {
      const user = UserFactory.create({ tier_id: 2 });
      
      mockDatabase.query
        .mockResolvedValue({
          rows: [{ audit_limit: 50 }]
        })
        .mockResolvedValue({
          rows: [{ count: '10' }]
        });

      const promises = Array(10).fill().map(() => 
        tierService.checkAuditLimit(user.id)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      expect(results.every(r => r.allowed)).toBe(true);
    });

    test('should cache tier information to reduce database calls', async () => {
      const user = UserFactory.create({ tier_id: 2 });
      
      mockDatabase.query.mockResolvedValue({
        rows: [{
          id: 2,
          name: 'Pro',
          audit_limit: 50,
          features: ['advanced_seo']
        }]
      });

      // Make multiple calls
      await tierService.getUserTier(user.id);
      await tierService.getUserTier(user.id);
      await tierService.getUserTier(user.id);

      // Should only make one database call due to caching
      expect(mockDatabase.query).toHaveBeenCalledTimes(1);
    });

    test('should handle invalid tier IDs gracefully', async () => {
      await expect(tierService.getUserTier(null)).rejects.toThrow('Invalid user ID');
      await expect(tierService.getUserTier(undefined)).rejects.toThrow('Invalid user ID');
      await expect(tierService.getUserTier('')).rejects.toThrow('Invalid user ID');
    });
  });
});
