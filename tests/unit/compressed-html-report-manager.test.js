// Tests for compressed HTML report manager
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { CompressedHtmlReportManager } from '../../src/reporting/compressed-html-report-manager.js';

describe('Compressed HTML Report Manager', () => {
  let testDir;
  let testHtmlFile;
  let testHtmlContent;

  beforeEach(() => {
    testDir = path.resolve(process.cwd(), 'test-html-compression');
    fs.mkdirSync(testDir, { recursive: true });
    
    testHtmlFile = path.join(testDir, 'test-report.html');
    
    // Create large HTML content that should be compressed
    testHtmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; }
    .header { background-color: #007cba; color: white; padding: 20px; }
    .content { padding: 20px; }
    .table { width: 100%; border-collapse: collapse; }
    .table td, .table th { border: 1px solid #ddd; padding: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Domain Link Audit Report</h1>
  </div>
  <div class="content">
    <h2>Summary</h2>
    <p>This is a test HTML report with enough content to trigger compression.</p>
    <table class="table">
      <thead>
        <tr><th>URL</th><th>Status</th><th>Response Time</th></tr>
      </thead>
      <tbody>
        ${Array.from({ length: 100 }, (_, i) => 
          `<tr><td>https://example.com/page${i}</td><td>200</td><td>${Math.random() * 1000}ms</td></tr>`
        ).join('\n')}
      </tbody>
    </table>
  </div>
</body>
</html>
    `.trim();
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('saveHtmlReport', () => {
    test('should compress large HTML files automatically', () => {
      const result = CompressedHtmlReportManager.saveHtmlReport(testHtmlFile, testHtmlContent);
      
      expect(result.compressed).toBe(true);
      expect(result.filename).toBe(testHtmlFile + '.gz');
      expect(result.compressionRatio).toBeGreaterThan(0);
      expect(result.compressedSize).toBeLessThan(result.originalSize);
      expect(fs.existsSync(testHtmlFile + '.gz')).toBe(true);
    });

    test('should not compress small HTML files', () => {
      const smallContent = '<html><body><h1>Small</h1></body></html>';
      const result = CompressedHtmlReportManager.saveHtmlReport(testHtmlFile, smallContent);
      
      expect(result.compressed).toBe(false);
      expect(result.filename).toBe(testHtmlFile);
      expect(result.compressionRatio).toBe(0);
      expect(fs.existsSync(testHtmlFile)).toBe(true);
      expect(fs.existsSync(testHtmlFile + '.gz')).toBe(false);
    });

    test('should force compression when requested', () => {
      const smallContent = '<html><body><h1>Small</h1></body></html>';
      const result = CompressedHtmlReportManager.saveHtmlReport(
        testHtmlFile, 
        smallContent, 
        { forceCompression: true }
      );
      
      expect(result.compressed).toBe(true);
      expect(result.filename).toBe(testHtmlFile + '.gz');
      expect(fs.existsSync(testHtmlFile + '.gz')).toBe(true);
    });

    test('should force uncompressed when requested', () => {
      const result = CompressedHtmlReportManager.saveHtmlReport(
        testHtmlFile, 
        testHtmlContent, 
        { forceUncompressed: true }
      );
      
      expect(result.compressed).toBe(false);
      expect(result.filename).toBe(testHtmlFile);
      expect(fs.existsSync(testHtmlFile)).toBe(true);
      expect(fs.existsSync(testHtmlFile + '.gz')).toBe(false);
    });

    test('should create directory if it does not exist', () => {
      const nestedFile = path.join(testDir, 'subdir', 'nested', 'report.html');
      const result = CompressedHtmlReportManager.saveHtmlReport(nestedFile, testHtmlContent);
      
      expect(result.compressed).toBe(true);
      expect(fs.existsSync(nestedFile + '.gz')).toBe(true);
    });
  });

  describe('loadHtmlReport', () => {
    test('should load compressed HTML files correctly', () => {
      // Save compressed file
      CompressedHtmlReportManager.saveHtmlReport(testHtmlFile, testHtmlContent);
      
      // Load by compressed filename
      const content1 = CompressedHtmlReportManager.loadHtmlReport(testHtmlFile + '.gz');
      expect(content1).toBe(testHtmlContent);
      
      // Load by base filename
      const content2 = CompressedHtmlReportManager.loadHtmlReport(testHtmlFile);
      expect(content2).toBe(testHtmlContent);
    });

    test('should load uncompressed HTML files correctly', () => {
      const smallContent = '<html><body><h1>Small</h1></body></html>';
      CompressedHtmlReportManager.saveHtmlReport(testHtmlFile, smallContent);
      
      const loadedContent = CompressedHtmlReportManager.loadHtmlReport(testHtmlFile);
      expect(loadedContent).toBe(smallContent);
    });

    test('should return null for non-existent files', () => {
      const content = CompressedHtmlReportManager.loadHtmlReport(path.join(testDir, 'nonexistent.html'));
      expect(content).toBeNull();
    });

    test('should handle corrupted compressed files gracefully', () => {
      // Create a corrupted .gz file
      fs.writeFileSync(testHtmlFile + '.gz', 'corrupted data');
      
      const content = CompressedHtmlReportManager.loadHtmlReport(testHtmlFile);
      expect(content).toBeNull();
    });
  });

  describe('getReportInfo', () => {
    test('should return info for compressed files', () => {
      CompressedHtmlReportManager.saveHtmlReport(testHtmlFile, testHtmlContent);
      
      const info = CompressedHtmlReportManager.getReportInfo(testHtmlFile);
      expect(info).toBeTruthy();
      expect(info.compressed).toBe(true);
      expect(info.filename).toBe(testHtmlFile + '.gz');
      expect(info.size).toBeGreaterThan(0);
      expect(info.lastModified).toBeDefined();
      expect(typeof info.lastModified.getTime).toBe('function');
    });

    test('should return info for uncompressed files', () => {
      const smallContent = '<html><body><h1>Small</h1></body></html>';
      CompressedHtmlReportManager.saveHtmlReport(testHtmlFile, smallContent);
      
      const info = CompressedHtmlReportManager.getReportInfo(testHtmlFile);
      expect(info).toBeTruthy();
      expect(info.compressed).toBe(false);
      expect(info.filename).toBe(testHtmlFile);
    });

    test('should return null for non-existent files', () => {
      const info = CompressedHtmlReportManager.getReportInfo(path.join(testDir, 'nonexistent.html'));
      expect(info).toBeNull();
    });
  });

  describe('migrateHtmlFiles', () => {
    test('should migrate large HTML files to compressed format', () => {
      // Create uncompressed HTML file
      fs.writeFileSync(testHtmlFile, testHtmlContent);
      
      const result = CompressedHtmlReportManager.migrateHtmlFiles(testDir);
      
      expect(result.migrated).toBe(1);
      expect(result.errors).toBe(0);
      expect(result.totalSaved).toBeGreaterThan(0);
      expect(fs.existsSync(testHtmlFile)).toBe(false);
      expect(fs.existsSync(testHtmlFile + '.gz')).toBe(true);
    });

    test('should not migrate small HTML files', () => {
      const smallContent = '<html><body><h1>Small</h1></body></html>';
      fs.writeFileSync(testHtmlFile, smallContent);
      
      const result = CompressedHtmlReportManager.migrateHtmlFiles(testDir);
      
      expect(result.migrated).toBe(0);
      expect(result.errors).toBe(0);
      expect(fs.existsSync(testHtmlFile)).toBe(true);
    });

    test('should handle nested directories', () => {
      const nestedDir = path.join(testDir, 'audit-123');
      fs.mkdirSync(nestedDir);
      const nestedFile = path.join(nestedDir, 'report.html');
      fs.writeFileSync(nestedFile, testHtmlContent);
      
      const result = CompressedHtmlReportManager.migrateHtmlFiles(testDir);
      
      expect(result.migrated).toBe(1);
      expect(fs.existsSync(nestedFile + '.gz')).toBe(true);
    });

    test('should not migrate already compressed files', () => {
      // Create compressed file
      CompressedHtmlReportManager.saveHtmlReport(testHtmlFile, testHtmlContent);
      
      const result = CompressedHtmlReportManager.migrateHtmlFiles(testDir);
      
      expect(result.migrated).toBe(0);
      expect(result.errors).toBe(0);
    });

    test('should handle non-existent directory', () => {
      const result = CompressedHtmlReportManager.migrateHtmlFiles(path.join(testDir, 'nonexistent'));
      
      expect(result.migrated).toBe(0);
      expect(result.errors).toBe(0);
      expect(result.totalSaved).toBe(0);
    });
  });

  describe('getCompressionStats', () => {
    test('should calculate statistics correctly', () => {
      // Create mix of compressed and uncompressed files
      CompressedHtmlReportManager.saveHtmlReport(testHtmlFile, testHtmlContent);
      
      const smallFile = path.join(testDir, 'small.html');
      const smallContent = '<html><body><h1>Small</h1></body></html>';
      fs.writeFileSync(smallFile, smallContent);
      
      const stats = CompressedHtmlReportManager.getCompressionStats(testDir);
      
      expect(stats).toBeTruthy();
      expect(stats.compressed.count).toBe(1);
      expect(stats.uncompressed.count).toBe(1);
      expect(stats.compressed.totalSize).toBeGreaterThan(0);
      expect(stats.uncompressed.totalSize).toBeGreaterThan(0);
      expect(stats.potentialSavings).toBe(0); // Small file won't be counted for savings
    });

    test('should return null for non-existent directory', () => {
      const stats = CompressedHtmlReportManager.getCompressionStats(path.join(testDir, 'nonexistent'));
      expect(stats).toBeNull();
    });
  });

  describe('error handling', () => {
    test('should handle file system errors gracefully', () => {
      // Mock fs.writeFileSync to throw error
      const originalWriteFileSync = fs.writeFileSync;
      jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => {
        CompressedHtmlReportManager.saveHtmlReport(testHtmlFile, testHtmlContent);
      }).toThrow();

      // Restore original function
      fs.writeFileSync = originalWriteFileSync;
    });
  });
});
