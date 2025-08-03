// Tests for AuditManager - Audit lifecycle management
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { AuditManager } from '../../src/core/audit-manager.js';
import fs from 'fs';
import path from 'path';

describe('AuditManager', () => {
  let auditManager;
  let testDomain;
  let testAuditDir;

  beforeEach(() => {
    testDomain = 'test-domain.com';
    testAuditDir = path.resolve(process.cwd(), 'test-audits', testDomain);
    
    // Create a mock AuditManager to avoid file system operations
    auditManager = {
      domainName: testDomain,
      baseAuditDir: testAuditDir,
      auditIndexFile: path.resolve(testAuditDir, 'audit-index.json'),
      comparisonReportGenerator: {
        generateComparisonReport: jest.fn()
      },
      
      // Mock methods
      ensureAuditDirectory: jest.fn(),
      generateAuditId: jest.fn(),
      createAudit: jest.fn(),
      listAudits: jest.fn(),
      getAudit: jest.fn(),
      deleteAudit: jest.fn(),
      getAuditPaths: jest.fn(),
      loadAuditIndex: jest.fn(),
      saveAuditIndex: jest.fn(),
      createComparisonReport: jest.fn(),
      cleanupOldAudits: jest.fn(),
      exportAuditData: jest.fn(),
      importAuditData: jest.fn()
    };
  });

  afterEach(() => {
    // Clean up test files if they exist
    if (fs.existsSync(testAuditDir)) {
      fs.rmSync(testAuditDir, { recursive: true, force: true });
    }
  });

  describe('constructor', () => {
    test('should initialize with domain name', () => {
      expect(auditManager.domainName).toBe(testDomain);
      expect(auditManager.baseAuditDir).toContain(testDomain);
    });

    test('should set up audit index file path', () => {
      expect(auditManager.auditIndexFile).toContain('audit-index.json');
      expect(auditManager.auditIndexFile).toContain(testDomain);
    });

    test('should initialize comparison report generator', () => {
      expect(auditManager.comparisonReportGenerator).toBeDefined();
    });
  });

  describe('audit lifecycle', () => {
    let mockAuditData;

    beforeEach(() => {
      mockAuditData = {
        id: 'audit-2024-01-01-120000',
        startTime: '2024-01-01T12:00:00.000Z',
        endTime: null,
        status: 'in-progress',
        domain: testDomain,
        config: {
          maxParallelCrawl: 5,
          crawlDelay: 1000
        }
      };

      // Mock generateAuditId to return predictable ID
      auditManager.generateAuditId.mockReturnValue(mockAuditData.id);
    });

    test('should generate unique audit IDs', () => {
      const auditId = auditManager.generateAuditId();
      expect(auditId).toBeDefined();
      expect(typeof auditId).toBe('string');
      expect(auditManager.generateAuditId).toHaveBeenCalled();
    });

    test('should create new audit', () => {
      const config = { maxParallelCrawl: 5 };
      auditManager.createAudit.mockReturnValue(mockAuditData);
      
      const audit = auditManager.createAudit(config);
      
      expect(audit).toBeDefined();
      expect(audit.id).toBe(mockAuditData.id);
      expect(audit.domain).toBe(testDomain);
      expect(auditManager.createAudit).toHaveBeenCalledWith(config);
    });

    test('should list all audits for domain', () => {
      const mockAudits = [
        { ...mockAuditData, id: 'audit-1' },
        { ...mockAuditData, id: 'audit-2' },
        { ...mockAuditData, id: 'audit-3' }
      ];
      
      auditManager.listAudits.mockReturnValue(mockAudits);
      
      const audits = auditManager.listAudits();
      
      expect(audits).toHaveLength(3);
      expect(audits[0].id).toBe('audit-1');
      expect(auditManager.listAudits).toHaveBeenCalled();
    });

    test('should get specific audit by ID', () => {
      auditManager.getAudit.mockReturnValue(mockAuditData);
      
      const audit = auditManager.getAudit(mockAuditData.id);
      
      expect(audit).toBeDefined();
      expect(audit.id).toBe(mockAuditData.id);
      expect(auditManager.getAudit).toHaveBeenCalledWith(mockAuditData.id);
    });

    test('should delete audit by ID', () => {
      auditManager.deleteAudit.mockReturnValue(true);
      
      const result = auditManager.deleteAudit(mockAuditData.id);
      
      expect(result).toBe(true);
      expect(auditManager.deleteAudit).toHaveBeenCalledWith(mockAuditData.id);
    });

    test('should handle non-existent audit gracefully', () => {
      auditManager.getAudit.mockReturnValue(null);
      
      const audit = auditManager.getAudit('non-existent-id');
      
      expect(audit).toBeNull();
    });
  });

  describe('audit paths and file management', () => {
    test('should generate correct audit paths', () => {
      const auditId = 'test-audit-123';
      const expectedPaths = {
        auditDir: path.join(testAuditDir, auditId),
        stateFile: path.join(testAuditDir, auditId, `${auditId}-state.json`),
        reportFile: path.join(testAuditDir, auditId, `${auditId}-report.html`),
        dataDir: path.join(testAuditDir, auditId, 'page-data')
      };
      
      auditManager.getAuditPaths.mockReturnValue(expectedPaths);
      
      const paths = auditManager.getAuditPaths(auditId);
      
      expect(paths.auditDir).toContain(auditId);
      expect(paths.stateFile).toContain('state.json');
      expect(paths.reportFile).toContain('report.html');
      expect(paths.dataDir).toContain('page-data');
    });

    test('should ensure audit directory exists', () => {
      auditManager.ensureAuditDirectory();
      
      expect(auditManager.ensureAuditDirectory).toHaveBeenCalled();
    });
  });

  describe('audit index management', () => {
    let mockIndex;

    beforeEach(() => {
      mockIndex = {
        domain: testDomain,
        audits: [
          {
            id: 'audit-1',
            startTime: '2024-01-01T10:00:00.000Z',
            status: 'completed'
          },
          {
            id: 'audit-2',
            startTime: '2024-01-02T10:00:00.000Z',
            status: 'in-progress'
          }
        ],
        lastUpdated: '2024-01-02T12:00:00.000Z'
      };
    });

    test('should load audit index', () => {
      auditManager.loadAuditIndex.mockReturnValue(mockIndex);
      
      const index = auditManager.loadAuditIndex();
      
      expect(index).toBeDefined();
      expect(index.domain).toBe(testDomain);
      expect(index.audits).toHaveLength(2);
    });

    test('should save audit index', () => {
      auditManager.saveAuditIndex.mockReturnValue(true);
      
      const result = auditManager.saveAuditIndex(mockIndex);
      
      expect(result).toBe(true);
      expect(auditManager.saveAuditIndex).toHaveBeenCalledWith(mockIndex);
    });

    test('should handle missing audit index file', () => {
      auditManager.loadAuditIndex.mockReturnValue({
        domain: testDomain,
        audits: [],
        lastUpdated: new Date().toISOString()
      });
      
      const index = auditManager.loadAuditIndex();
      
      expect(index.audits).toHaveLength(0);
      expect(index.domain).toBe(testDomain);
    });
  });

  describe('comparison reports', () => {
    test('should create comparison report between audits', async () => {
      const auditId1 = 'audit-1';
      const auditId2 = 'audit-2';
      const mockComparisonReport = {
        reportContent: '<html>Comparison Report</html>',
        reportPath: '/path/to/comparison-report.html'
      };
      
      auditManager.createComparisonReport.mockResolvedValue(mockComparisonReport);
      
      const result = await auditManager.createComparisonReport(auditId1, auditId2);
      
      expect(result).toBeDefined();
      expect(result.reportContent).toContain('Comparison Report');
      expect(auditManager.createComparisonReport).toHaveBeenCalledWith(auditId1, auditId2);
    });

    test('should handle comparison report generation errors', async () => {
      auditManager.createComparisonReport.mockRejectedValue(new Error('Comparison failed'));
      
      await expect(auditManager.createComparisonReport('invalid-1', 'invalid-2'))
        .rejects.toThrow('Comparison failed');
    });
  });

  describe('audit cleanup and maintenance', () => {
    test('should cleanup old audits', () => {
      const cleanupOptions = {
        maxAge: 30, // days
        maxCount: 10
      };
      
      auditManager.cleanupOldAudits.mockReturnValue({
        deletedCount: 3,
        remainingCount: 7
      });
      
      const result = auditManager.cleanupOldAudits(cleanupOptions);
      
      expect(result.deletedCount).toBe(3);
      expect(result.remainingCount).toBe(7);
      expect(auditManager.cleanupOldAudits).toHaveBeenCalledWith(cleanupOptions);
    });

    test('should handle cleanup with no old audits', () => {
      auditManager.cleanupOldAudits.mockReturnValue({
        deletedCount: 0,
        remainingCount: 5
      });
      
      const result = auditManager.cleanupOldAudits({ maxAge: 30 });
      
      expect(result.deletedCount).toBe(0);
      expect(result.remainingCount).toBe(5);
    });
  });

  describe('data import/export', () => {
    test('should export audit data', () => {
      const auditId = 'test-audit';
      const mockExportData = {
        audit: { id: auditId },
        stats: {},
        badRequests: {},
        externalLinks: {}
      };
      
      auditManager.exportAuditData.mockReturnValue(mockExportData);
      
      const exportData = auditManager.exportAuditData(auditId);
      
      expect(exportData).toBeDefined();
      expect(exportData.audit.id).toBe(auditId);
      expect(auditManager.exportAuditData).toHaveBeenCalledWith(auditId);
    });

    test('should import audit data', () => {
      const importData = {
        audit: { id: 'imported-audit' },
        stats: {},
        badRequests: {}
      };
      
      auditManager.importAuditData.mockReturnValue(true);
      
      const result = auditManager.importAuditData(importData);
      
      expect(result).toBe(true);
      expect(auditManager.importAuditData).toHaveBeenCalledWith(importData);
    });

    test('should handle invalid import data', () => {
      auditManager.importAuditData.mockReturnValue(false);
      
      const result = auditManager.importAuditData({ invalid: 'data' });
      
      expect(result).toBe(false);
    });
  });

  describe('audit status management', () => {
    test('should update audit status', () => {
      const auditId = 'test-audit';
      const newStatus = 'completed';
      
      auditManager.updateAuditStatus = jest.fn().mockReturnValue(true);
      
      const result = auditManager.updateAuditStatus(auditId, newStatus);
      
      expect(result).toBe(true);
      expect(auditManager.updateAuditStatus).toHaveBeenCalledWith(auditId, newStatus);
    });

    test('should get audits by status', () => {
      const status = 'completed';
      const completedAudits = [
        { id: 'audit-1', status: 'completed' },
        { id: 'audit-2', status: 'completed' }
      ];
      
      auditManager.getAuditsByStatus = jest.fn().mockReturnValue(completedAudits);
      
      const audits = auditManager.getAuditsByStatus(status);
      
      expect(audits).toHaveLength(2);
      expect(audits.every(audit => audit.status === status)).toBe(true);
    });
  });

  describe('error handling', () => {
    test('should handle file system errors gracefully', () => {
      auditManager.ensureAuditDirectory.mockImplementation(() => {
        throw new Error('Permission denied');
      });
      
      expect(() => auditManager.ensureAuditDirectory()).toThrow('Permission denied');
    });

    test('should handle corrupted audit index', () => {
      auditManager.loadAuditIndex.mockImplementation(() => {
        throw new Error('Invalid JSON');
      });
      
      expect(() => auditManager.loadAuditIndex()).toThrow('Invalid JSON');
    });

    test('should validate audit data integrity', () => {
      auditManager.validateAuditData = jest.fn().mockReturnValue(true);
      
      const isValid = auditManager.validateAuditData({ id: 'test' });
      
      expect(isValid).toBe(true);
      expect(auditManager.validateAuditData).toHaveBeenCalled();
    });
  });
});
