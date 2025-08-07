/**
 * Critical Testing: Audit Model
 * Tests the real audit model used in the web application
 */

import { jest } from '@jest/globals';
import { mockDatabase } from '../helpers/MockDatabase.js';

// Mock the database module
jest.unstable_mockModule('../../web/models/database.js', () => ({
  query: jest.fn(),
  transaction: jest.fn(),
  getPool: jest.fn(() => ({ end: jest.fn() }))
}));

// Import after mocking
const { query, transaction } = await import('../../web/models/database.js');
const { Audit } = await import('../../web/models/Audit.js');

describe('Audit Model - Critical Production Testing', () => {
  let mockQuery;
  let mockTransaction;

  beforeEach(() => {
    mockQuery = query;
    mockTransaction = transaction;
    mockQuery.mockClear();
    mockTransaction.mockClear();
    mockDatabase.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Audit Creation', () => {
    test('should create audit with proper parameters', async () => {
      const mockAudit = {
        id: 1,
        user_id: 123,
        url: 'https://example.com',
        type: 'simple',
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockAudit] });

      const auditData = {
        userId: 123,
        url: 'https://example.com',
        type: 'simple',
        config: { maxPages: 50 }
      };

      const result = await Audit.create(auditData);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO audits'),
        [123, 'https://example.com', 'simple']
      );
      expect(result).toEqual(mockAudit);
    });

    test('should create anonymous audit with null user_id', async () => {
      const mockAudit = {
        id: 2,
        user_id: null,
        url: 'https://example.com',
        type: 'simple',
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockAudit] });

      const auditData = {
        userId: null,
        url: 'https://example.com',
        type: 'simple'
      };

      const result = await Audit.create(auditData);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO audits'),
        [null, 'https://example.com', 'simple']
      );
      expect(result.user_id).toBeNull();
    });

    test('should create full audit type correctly', async () => {
      const mockAudit = {
        id: 3,
        user_id: 456,
        url: 'https://enterprise-site.com',
        type: 'full',
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockAudit] });

      const auditData = {
        userId: 456,
        url: 'https://enterprise-site.com',
        type: 'full'
      };

      const result = await Audit.create(auditData);

      expect(result.type).toBe('full');
      expect(result.user_id).toBe(456);
    });

    test('should default to simple audit type', async () => {
      const mockAudit = {
        id: 4,
        user_id: 789,
        url: 'https://default-type.com',
        type: 'simple',
        status: 'pending',
        created_at: new Date()
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockAudit] });

      const auditData = {
        userId: 789,
        url: 'https://default-type.com'
        // No type specified - should default to 'simple'
      };

      await Audit.create(auditData);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO audits'),
        [789, 'https://default-type.com', 'simple']
      );
    });
  });

  describe('Finding Audits', () => {
    test('should find audit by ID', async () => {
      const mockAudit = {
        id: 1,
        user_id: 123,
        url: 'https://example.com',
        type: 'simple',
        status: 'completed',
        report_data: '{"score": 85}',
        created_at: new Date()
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockAudit] });

      const result = await Audit.findById(1, 123);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM audits WHERE id = $1'),
        [1, 123]
      );
      expect(result.report_data).toEqual({ score: 85 }); // Should parse JSON
    });

    test('should find audit by ID without user restriction', async () => {
      const mockAudit = {
        id: 1,
        user_id: 123,
        url: 'https://example.com',
        status: 'completed'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockAudit] });

      await Audit.findById(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM audits WHERE id = $1'),
        [1]
      );
    });

    test('should return null when audit not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await Audit.findById(999, 123);

      expect(result).toBeNull();
    });

    test('should find most recent audit by domain', async () => {
      const mockAudit = {
        id: 5,
        user_id: 123,
        url: 'https://example.com',
        status: 'completed',
        report_data: '{"cached": true, "score": 90}',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockAudit] });

      const result = await Audit.findMostRecentByDomain('https://example.com');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE url = $1 AND status = \'completed\''),
        ['https://example.com']
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC'),
        ['https://example.com']
      );
      expect(result.report_data).toEqual({ cached: true, score: 90 });
    });

    test('should find audit by domain for specific user', async () => {
      const mockAudit = {
        id: 6,
        user_id: 123,
        url: 'https://user-specific.com',
        status: 'completed',
        created_at: new Date()
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockAudit] });

      await Audit.findByDomain('https://user-specific.com', 123);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE url = $1 AND user_id = $2'),
        ['https://user-specific.com', 123]
      );
    });

    test('should find audit by domain without user restriction', async () => {
      const mockAudit = {
        id: 7,
        user_id: null,
        url: 'https://anonymous.com',
        status: 'completed'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockAudit] });

      await Audit.findByDomain('https://anonymous.com');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE url = $1'),
        ['https://anonymous.com']
      );
      expect(mockQuery).not.toHaveBeenCalledWith(
        expect.stringContaining('user_id'),
        expect.any(Array)
      );
    });
  });

  describe('Audit Status Management', () => {
    test('should update audit status', async () => {
      const updatedAudit = {
        id: 1,
        status: 'completed',
        updated_at: new Date()
      };

      mockQuery.mockResolvedValueOnce({ rows: [updatedAudit] });

      const result = await Audit.updateStatus(1, 'completed');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE audits SET status = $2'),
        [1, 'completed']
      );
      expect(result.status).toBe('completed');
    });

    test('should update audit with report data', async () => {
      const reportData = {
        score: 85,
        issues: ['Missing meta description'],
        recommendations: ['Add meta descriptions']
      };

      const updatedAudit = {
        id: 1,
        status: 'completed',
        report_data: reportData,
        score: 85,
        updated_at: new Date()
      };

      mockQuery.mockResolvedValueOnce({ rows: [updatedAudit] });

      await Audit.updateWithReport(1, reportData, 85);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SET report_data = $2'),
        [1, JSON.stringify(reportData), 85]
      );
    });

    test('should update audit progress', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await Audit.updateProgress(1, 75, { pages_scanned: 30 });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SET progress = $2'),
        [1, 75, JSON.stringify({ pages_scanned: 30 })]
      );
    });
  });

  describe('User Audit Management', () => {
    test('should get user audits with pagination', async () => {
      const mockAudits = [
        { id: 1, user_id: 123, url: 'https://site1.com', status: 'completed' },
        { id: 2, user_id: 123, url: 'https://site2.com', status: 'completed' }
      ];

      const mockCount = [{ count: '5' }];

      mockQuery
        .mockResolvedValueOnce({ rows: mockCount })   // count query FIRST
        .mockResolvedValueOnce({ rows: mockAudits }); // audits query SECOND

      const options = {
        page: 1,
        limit: 10,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      };

      const result = await Audit.getUserAudits(123, options);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1'),
        expect.arrayContaining([123])
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC'),
        expect.any(Array)
      );
      expect(result.audits).toHaveLength(2);
      expect(result.pagination.totalCount).toBe(5);
    });

    test('should filter user audits by status', async () => {
      const mockAudits = [
        { id: 1, user_id: 123, status: 'completed' }
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: mockAudits })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const options = {
        status: 'completed',
        page: 1,
        limit: 10
      };

      await Audit.getUserAudits(123, options);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1 AND status = $2'),
        expect.arrayContaining([123, 'completed'])
      );
    });

    test('should filter user audits by date range', async () => {
      const mockAudits = [
        { id: 1, user_id: 123, created_at: new Date() }
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: mockAudits })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const options = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        page: 1,
        limit: 10
      };

      await Audit.getUserAudits(123, options);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('created_at >= $2 AND created_at <= $3'),
        expect.arrayContaining([123, '2024-01-01', '2024-12-31'])
      );
    });
  });

  describe('Audit Statistics', () => {
    test('should get audit statistics for user', async () => {
      const mockStats = {
        total_audits: '15',
        completed_audits: '12',
        failed_audits: '2',
        pending_audits: '1',
        running_audits: '0',
        average_score: '78.5',
        unique_domains: '8'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockStats] });

      const result = await Audit.getStats(123, 30);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('AND user_id = $1'),
        expect.arrayContaining([123])
      );
      expect(result.total_audits).toBe(15);
      expect(result.avg_score).toBe(78.5);
    });

    test('should get global statistics when no user specified', async () => {
      const mockStats = [
        {
          total_audits: '1000',
          completed_audits: '850',
          avg_score: '75.2'
        }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockStats });

      await Audit.getStats();

      expect(mockQuery).toHaveBeenCalledWith(
        expect.not.stringContaining('WHERE user_id'),
        expect.any(Array)
      );
    });

    test('should get statistics for specific time period', async () => {
      const mockStats = [
        {
          total_audits: '50',
          completed_audits: '45',
          avg_score: '80.1'
        }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockStats });

      await Audit.getStats(123, 7); // Last 7 days

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('created_at >= CURRENT_DATE - INTERVAL'),
        expect.arrayContaining([123])
      );
    });
  });

  describe('Audit Deletion', () => {
    test('should delete audit for specific user', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      const result = await Audit.delete(1, 123);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM audits WHERE id = $1 AND user_id = $2'),
        [1, 123]
      );
      expect(result).toBe(true);
    });

    test('should not delete audit for wrong user', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });

      await expect(Audit.delete(1, 999)).rejects.toThrow('Audit not found or access denied');
    });

    test('should delete audit without user restriction when no user specified', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      await Audit.delete(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM audits WHERE id = $1'),
        [1]
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors in create', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      const auditData = {
        userId: 123,
        url: 'https://example.com',
        type: 'simple'
      };

      await expect(Audit.create(auditData)).rejects.toThrow('Database connection failed');
    });

    test('should handle database errors in findById', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Query timeout'));

      await expect(Audit.findById(1, 123)).rejects.toThrow('Query timeout');
    });

    test('should handle database errors in updateStatus', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Transaction rollback'));

      await expect(Audit.updateStatus(1, 'completed', 123)).rejects.toThrow('Transaction rollback');
    });

    test('should handle malformed JSON in report_data', async () => {
      const mockAudit = {
        id: 1,
        report_data: 'invalid json{' // Malformed JSON
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockAudit] });

      // Should not throw error, should handle gracefully
      const result = await Audit.findById(1);
      expect(result.report_data).toBe('invalid json{'); // Should remain as string
    });
  });

  describe('Data Validation and Parsing', () => {
    test('should parse JSON report data correctly', async () => {
      const reportData = {
        score: 85,
        issues: ['Missing alt tags'],
        performance: { loadTime: 2.5 }
      };

      const mockAudit = {
        id: 1,
        report_data: JSON.stringify(reportData)
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockAudit] });

      const result = await Audit.findById(1);

      expect(result.report_data).toEqual(reportData);
      expect(typeof result.report_data).toBe('object');
    });

    test('should handle null report data', async () => {
      const mockAudit = {
        id: 1,
        report_data: null
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockAudit] });

      const result = await Audit.findById(1);

      expect(result.report_data).toBeNull();
    });

    test('should handle empty results gracefully', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })  // count query returns 0
        .mockResolvedValueOnce({ rows: [] });               // empty audits

      const result = await Audit.getUserAudits(123);

      expect(result.audits).toEqual([]);
      expect(result.pagination.totalCount).toBe(0);
    });

    test('should convert string numbers to integers in statistics', async () => {
      const mockStats = {
        total_audits: '25',
        completed_audits: '20',
        failed_audits: '3',
        pending_audits: '1',
        running_audits: '1',
        average_score: '82.5',
        unique_domains: '15'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockStats] });

      const result = await Audit.getStats(123);

      expect(result.total_audits).toBe(25);
      expect(result.completed_audits).toBe(20);
      expect(result.avg_score).toBe(82.5);
    });
  });

  describe('Performance and Optimization', () => {
    test('should use proper indexes in domain lookup', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await Audit.findMostRecentByDomain('https://example.com');

      // Should use WHERE url = $1 which should have an index
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE url = $1'),
        ['https://example.com']
      );
    });

    test('should limit results efficiently', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await Audit.findMostRecentByDomain('https://example.com');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT 1'),
        ['https://example.com']
      );
    });

    test('should use pagination correctly', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })  // count query FIRST
        .mockResolvedValueOnce({ rows: [] });               // audits query SECOND

      const options = { page: 3, limit: 20 };
      await Audit.getUserAudits(123, options);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT $2 OFFSET $3'),
        expect.arrayContaining([123, 20, 40])
      );
    });
  });

  describe('Integration with Caching System', () => {
    test('should find recent audit for cache lookup', async () => {
      const recentAudit = {
        id: 10,
        url: 'https://cached-site.com',
        status: 'completed',
        report_data: '{"cached": true, "score": 95}',
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      };

      mockQuery.mockResolvedValueOnce({ rows: [recentAudit] });

      const result = await Audit.findMostRecentByDomain('https://cached-site.com');

      expect(result).not.toBeNull();
      expect(result.status).toBe('completed');
      expect(result.report_data.cached).toBe(true);
      
      // Should check that report_data is not null
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('report_data IS NOT NULL'),
        ['https://cached-site.com']
      );
    });

    test('should not return audit without report data for caching', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await Audit.findMostRecentByDomain('https://no-report.com');

      expect(result).toBeNull();
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('report_data IS NOT NULL'),
        ['https://no-report.com']
      );
    });
  });
});
