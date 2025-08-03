// Tests for Audit Comparison Report Generator
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { AuditComparisonReportGenerator } from '../../src/reporting/audit-comparison-report-generator.js';

describe('Audit Comparison Report Generator', () => {
  const testOutputDir = './test-comparison-reports';
  let mockAuditManager, generator;
  let mockAudit1Data, mockAudit2Data, mockAudit1, mockAudit2;

  beforeEach(() => {
    // Create test output directory
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }

    // Mock audit data
    mockAudit1 = {
      id: 'audit-2024-01-01',
      startTime: '2024-01-01T10:00:00.000Z',
      endTime: '2024-01-01T10:05:00.000Z',
      status: 'completed',
      domain: 'example.com'
    };

    mockAudit2 = {
      id: 'audit-2024-02-01',
      startTime: '2024-02-01T10:00:00.000Z',
      endTime: '2024-02-01T10:07:00.000Z',
      status: 'completed',
      domain: 'example.com'
    };

    mockAudit1Data = {
      stats: {
        'https://example.com/': { title: 'Home', statusCode: 200, linksCount: 5 },
        'https://example.com/about': { title: 'About', statusCode: 200, linksCount: 3 },
        'https://example.com/old-page': { title: 'Old Page', statusCode: 200, linksCount: 2 }
      },
      externalLinks: {
        'https://external1.com': { status: 200 },
        'https://external2.com': { status: 404 }
      },
      badRequests: {
        'https://example.com/broken1': { status: 404 }
      },
      mailtoLinks: {
        'mailto:old@example.com': { referrers: ['https://example.com/'] }
      },
      telLinks: {
        'tel:+1111111111': { referrers: ['https://example.com/'] }
      }
    };

    mockAudit2Data = {
      stats: {
        'https://example.com/': { title: 'Home Updated', statusCode: 200, linksCount: 7 },
        'https://example.com/about': { title: 'About Us', statusCode: 200, linksCount: 4 },
        'https://example.com/new-page': { title: 'New Page', statusCode: 200, linksCount: 3 }
      },
      externalLinks: {
        'https://external1.com': { status: 200 },
        'https://external2.com': { status: 200 }, // Fixed
        'https://external3.com': { status: 404 }   // New broken
      },
      badRequests: {
        'https://example.com/broken2': { status: 500 } // Different broken link
      },
      mailtoLinks: {
        'mailto:new@example.com': { referrers: ['https://example.com/'] }
      },
      telLinks: {
        'tel:+1111111111': { referrers: ['https://example.com/'] },
        'tel:+2222222222': { referrers: ['https://example.com/about'] }
      }
    };

    // Mock audit manager
    mockAuditManager = {
      baseAuditDir: testOutputDir,
      listAudits: () => [mockAudit1, mockAudit2],
      getAuditPaths: (auditId) => ({
        auditDir: testOutputDir,
        stateFile: path.join(testOutputDir, `${auditId}-state.json`),
        reportFile: path.join(testOutputDir, `${auditId}-report.html`)
      })
    };

    generator = new AuditComparisonReportGenerator(mockAuditManager);

    // Mock the loadAuditData method
    generator.loadAuditData = async (auditId) => {
      if (auditId === 'audit-2024-01-01') return mockAudit1Data;
      if (auditId === 'audit-2024-02-01') return mockAudit2Data;
      throw new Error(`Unknown audit ID: ${auditId}`);
    };
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
  });

  describe('constructor', () => {
    test('should initialize with audit manager', () => {
      expect(generator.auditManager).toBe(mockAuditManager);
    });
  });

  describe('generateComparisonReport', () => {
    test('should generate HTML comparison report successfully', async () => {
      const result = await generator.generateComparisonReport(
        'audit-2024-01-01', 
        'audit-2024-02-01',
        { format: 'html', save: false }
      );

      expect(result).toBeDefined();
      expect(result.reportContent).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(typeof result.reportContent).toBe('string');
      expect(result.reportContent).toContain('Audit Comparison Report');
    });

    test('should throw error for invalid audit IDs', async () => {
      await expect(
        generator.generateComparisonReport('invalid-id', 'audit-2024-02-01')
      ).rejects.toThrow('One or both audit IDs not found');
    });

    test('should save report to file when save option is true', async () => {
      const result = await generator.generateComparisonReport(
        'audit-2024-01-01', 
        'audit-2024-02-01',
        { format: 'html', save: true, outputDir: testOutputDir }
      );

      expect(result.reportPath).toBeDefined();
      expect(fs.existsSync(result.reportPath)).toBe(true);

      const content = fs.readFileSync(result.reportPath, 'utf8');
      expect(content).toContain('Audit Comparison Report');
      expect(content).toContain('audit-2024-01-01');
      expect(content).toContain('audit-2024-02-01');
    });
  });

  describe('loadAuditData', () => {
    test('should load audit data correctly', async () => {
      const data = await generator.loadAuditData('audit-2024-01-01');

      expect(data).toBeDefined();
      expect(data.stats).toBeDefined();
      expect(data.externalLinks).toBeDefined();
      expect(data.badRequests).toBeDefined();
      expect(Object.keys(data.stats)).toContain('https://example.com/');
    });

    test('should throw error for non-existent audit', async () => {
      await expect(
        generator.loadAuditData('non-existent-audit')
      ).rejects.toThrow('Unknown audit ID');
    });
  });

  describe('performComparisonAnalysis', () => {
    test('should analyze differences between audits correctly', async () => {
      const data1 = await generator.loadAuditData('audit-2024-01-01');
      const data2 = await generator.loadAuditData('audit-2024-02-01');

      const comparison = generator.performComparisonAnalysis(data1, data2, mockAudit1, mockAudit2);

      expect(comparison).toBeDefined();
      expect(comparison.metadata.audit1).toBe(mockAudit1);
      expect(comparison.metadata.audit2).toBe(mockAudit2);
      expect(comparison.summary).toBeDefined();
      expect(comparison.pages).toBeDefined();
    });

    test('should identify added and removed pages', async () => {
      const data1 = await generator.loadAuditData('audit-2024-01-01');
      const data2 = await generator.loadAuditData('audit-2024-02-01');

      const comparison = generator.performComparisonAnalysis(data1, data2, mockAudit1, mockAudit2);

      expect(comparison.pages.added).toContain('https://example.com/new-page');
      expect(comparison.pages.removed).toContain('https://example.com/old-page');
      expect(comparison.pages.common).toContain('https://example.com/');
      expect(comparison.pages.common).toContain('https://example.com/about');
    });

    test('should track external link changes', async () => {
      const data1 = await generator.loadAuditData('audit-2024-01-01');
      const data2 = await generator.loadAuditData('audit-2024-02-01');

      const comparison = generator.performComparisonAnalysis(data1, data2, mockAudit1, mockAudit2);

      expect(comparison.links.fixed).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ url: 'https://external2.com' })
        ])
      );
      expect(comparison.links.new).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ url: 'https://external3.com' })
        ])
      );
    });

    test('should calculate summary statistics correctly', async () => {
      const data1 = await generator.loadAuditData('audit-2024-01-01');
      const data2 = await generator.loadAuditData('audit-2024-02-01');

      const comparison = generator.performComparisonAnalysis(data1, data2, mockAudit1, mockAudit2);

      expect(comparison.metrics.totalPages.before).toBe(3);
      expect(comparison.metrics.totalPages.after).toBe(3);
      expect(comparison.pages.added.length).toBe(1);
      expect(comparison.pages.removed.length).toBe(1);
    });
  });

  describe('generateHTMLComparisonReport', () => {
    test('should generate valid HTML report', async () => {
      const data1 = await generator.loadAuditData('audit-2024-01-01');
      const data2 = await generator.loadAuditData('audit-2024-02-01');
      const comparison = generator.performComparisonAnalysis(data1, data2, mockAudit1, mockAudit2);

      const htmlReport = generator.generateHTMLComparisonReport(comparison);

      expect(htmlReport).toContain('<!DOCTYPE html>');
      expect(htmlReport).toContain('<html');
      expect(htmlReport).toContain('<head>');
      expect(htmlReport).toContain('<body>');
      expect(htmlReport).toContain('Audit Comparison Report');
      expect(htmlReport).toContain('audit-2024-01-01');
      expect(htmlReport).toContain('audit-2024-02-01');
    });

    test('should include all comparison sections', async () => {
      const data1 = await generator.loadAuditData('audit-2024-01-01');
      const data2 = await generator.loadAuditData('audit-2024-02-01');
      const comparison = generator.performComparisonAnalysis(data1, data2, mockAudit1, mockAudit2);

      const htmlReport = generator.generateHTMLComparisonReport(comparison);

      expect(htmlReport).toContain('Summary');
      expect(htmlReport).toContain('Page Changes');
      expect(htmlReport).toContain('Link Changes');
      expect(htmlReport).toContain('Added Pages');
      expect(htmlReport).toContain('Removed Pages');
      expect(htmlReport).toContain('Page Changes');
      expect(htmlReport).toContain('Link Changes');
    });

    test('should highlight improvements and regressions', async () => {
      const data1 = await generator.loadAuditData('audit-2024-01-01');
      const data2 = await generator.loadAuditData('audit-2024-02-01');
      const comparison = generator.performComparisonAnalysis(data1, data2, mockAudit1, mockAudit2);

      const htmlReport = generator.generateHTMLComparisonReport(comparison);

      expect(htmlReport).toContain('Fixed 1 broken links'); // CSS class or text for improvements
      expect(htmlReport).toContain('trend-down');  // CSS class for regressions
      expect(htmlReport).toContain('https://external2.com'); // Fixed link
    });
  });

  describe('saveComparisonReport', () => {
    test('should save HTML report to file', async () => {
      const reportContent = '<html><body>Test Report</body></html>';
      const filename = 'test-comparison-report.html';

      const savedPath = await generator.saveComparisonReport(
        reportContent, 
        filename, 
        'html', 
        'audit1', 
        'audit2',
        testOutputDir
      );

      expect(fs.existsSync(savedPath)).toBe(true);
      
      const content = fs.readFileSync(savedPath, 'utf8');
      expect(content).toBe(reportContent);
    });

    test('should create output directory if it does not exist', async () => {
      const expectedDir = path.join(testOutputDir, 'comparisons');
      const reportContent = '<html><body>Test Report</body></html>';
      const filename = 'test-report';

      const savedPath = await generator.saveComparisonReport(
        reportContent, 
        filename, 
        'html', 
        'audit1', 
        'audit2'
      );

      expect(fs.existsSync(expectedDir)).toBe(true);
      expect(fs.existsSync(savedPath)).toBe(true);
    });
  });

  describe('end-to-end comparison workflow', () => {
    test('should perform complete comparison workflow', async () => {
      const result = await generator.generateComparisonReport(
        'audit-2024-01-01', 
        'audit-2024-02-01',
        { 
          format: 'html', 
          save: true, 
          outputDir: testOutputDir,
          filename: 'complete-comparison-test.html'
        }
      );

      // Verify result structure
      expect(result.reportContent).toBeDefined();
      expect(result.reportPath).toBeDefined();
      expect(result.metadata).toBeDefined();

      // Verify file was saved
      expect(fs.existsSync(result.reportPath)).toBe(true);

      // Verify content quality
      const content = fs.readFileSync(result.reportPath, 'utf8');
      expect(content).toContain('Audit Comparison Report');
      expect(content).toContain('audit-2024-01-01');
      expect(content).toContain('Added Pages');
      expect(content).toContain('Removed Pages');
      expect(content).toContain('External Links');

      // Verify comparison analysis
      expect(result.pages.added.length).toBe(1);
      expect(result.pages.removed.length).toBe(1);
      expect(result.links.fixed.length).toBe(1);
    });

    test('should handle audits with no changes', async () => {
      // Mock identical audit data
      generator.loadAuditData = async (auditId) => {
        return mockAudit1Data; // Same data for both audits
      };

      const result = await generator.generateComparisonReport(
        'audit-2024-01-01', 
        'audit-2024-02-01',
        { format: 'html', save: false }
      );

      expect(result.pages.added.length).toBe(0);
      expect(result.pages.removed.length).toBe(0);
      expect(result.pages.common.length).toBe(3);
      expect(result.reportContent).toContain('NEUTRAL'); // Overall trend when no changes
    });
  });
});
