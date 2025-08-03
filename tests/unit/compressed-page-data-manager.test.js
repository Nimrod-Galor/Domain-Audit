// Tests for compressed-page-data-manager - Enhanced page data storage with compression
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { CompressedPageDataManager } from '../../src/storage/compressed-page-data-manager.js';

describe('CompressedPageDataManager', () => {
  const testAuditDir = './test-compressed-audit-temp';
  let pageDataManager;

  beforeEach(() => {
    // Clean up any existing test directory
    if (fs.existsSync(testAuditDir)) {
      fs.rmSync(testAuditDir, { recursive: true });
    }
    
    // Create test audit directory
    fs.mkdirSync(testAuditDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testAuditDir)) {
      fs.rmSync(testAuditDir, { recursive: true });
    }
  });

  describe('constructor and initialization', () => {
    test('should initialize with domain folder and default memory limit', () => {
      pageDataManager = new CompressedPageDataManager(testAuditDir);
      
      expect(pageDataManager.domainFolder).toBe(testAuditDir);
      expect(pageDataManager.maxItemsInMemory).toBe(100);
      expect(pageDataManager.pageDataFolder).toBe(path.join(testAuditDir, 'page-data'));
    });

    test('should initialize with custom memory limit', () => {
      pageDataManager = new CompressedPageDataManager(testAuditDir, 50);
      
      expect(pageDataManager.maxItemsInMemory).toBe(50);
    });

    test('should create page-data directory on initialization', () => {
      pageDataManager = new CompressedPageDataManager(testAuditDir);
      
      expect(fs.existsSync(pageDataManager.pageDataFolder)).toBe(true);
    });
  });

  describe('compression functionality', () => {
    beforeEach(() => {
      pageDataManager = new CompressedPageDataManager(testAuditDir);
    });

    test('should compress large page data automatically', () => {
      const url = 'https://example.com/large-page';
      
      // Create large data that exceeds compression threshold
      const largeData = {
        url: url,
        title: 'Large Page',
        content: 'A'.repeat(15000), // 15KB of content
        links: Array.from({ length: 100 }, (_, i) => `https://example.com/link${i}`),
        metadata: {
          description: 'Large page with lots of content',
          keywords: Array.from({ length: 50 }, (_, i) => `keyword${i}`)
        }
      };

      pageDataManager.set(url, largeData);
      
      const { compressed, uncompressed } = pageDataManager.getFilePaths(url);
      
      // Should create compressed file
      expect(fs.existsSync(compressed)).toBe(true);
      expect(fs.existsSync(uncompressed)).toBe(false);
    });

    test('should not compress small page data', () => {
      const url = 'https://example.com/small-page';
      const smallData = {
        url: url,
        title: 'Small Page',
        content: 'Small content'
      };

      pageDataManager.set(url, smallData);
      
      const { compressed, uncompressed } = pageDataManager.getFilePaths(url);
      
      // Should create uncompressed file for small data
      expect(fs.existsSync(uncompressed)).toBe(true);
      expect(fs.existsSync(compressed)).toBe(false);
    });

    test('should retrieve compressed data correctly', () => {
      const url = 'https://example.com/test-page';
      
      // Create large data to ensure compression
      const originalData = {
        url: url,
        title: 'Test Page',
        content: 'B'.repeat(12000), // 12KB of content
        analytics: {
          score: 95,
          metrics: Array.from({ length: 100 }, (_, i) => ({ metric: `test${i}`, value: i }))
        }
      };

      pageDataManager.set(url, originalData);
      
      // Clear memory cache to force loading from disk
      pageDataManager.memoryCache.clear();
      
      const retrievedData = pageDataManager.get(url);
      
      expect(retrievedData).toEqual(originalData);
      expect(retrievedData.content.length).toBe(12000);
    });

    test('should handle both compressed and uncompressed files in iteration', () => {
      // Add large data (will be compressed)
      const largeUrl = 'https://example.com/large';
      const largeData = {
        content: 'L'.repeat(15000),
        type: 'large'
      };
      
      // Add small data (will not be compressed)
      const smallUrl = 'https://example.com/small';
      const smallData = {
        content: 'Small',
        type: 'small'
      };

      pageDataManager.set(largeUrl, largeData);
      pageDataManager.set(smallUrl, smallData);
      
      // Clear memory cache
      pageDataManager.memoryCache.clear();
      
      const allData = Array.from(pageDataManager);
      
      expect(allData.length).toBe(2);
      
      const urls = allData.map(([url, data]) => url);
      expect(urls).toContain(largeUrl);
      expect(urls).toContain(smallUrl);
      
      const dataTypes = allData.map(([url, data]) => data.type);
      expect(dataTypes).toContain('large');
      expect(dataTypes).toContain('small');
    });
  });

  describe('migration functionality', () => {
    beforeEach(() => {
      pageDataManager = new CompressedPageDataManager(testAuditDir);
    });

    test('should migrate uncompressed files to compressed format', () => {
      // Create uncompressed files manually
      const pageDataDir = path.join(testAuditDir, 'page-data');
      
      const url1 = 'https://example.com/page1';
      const url2 = 'https://example.com/page2';
      
      const largeData1 = {
        url: url1,
        content: 'X'.repeat(15000)
      };
      
      const largeData2 = {
        url: url2,
        content: 'Y'.repeat(18000)
      };
      
      // Create uncompressed files manually
      const safeName1 = Buffer.from(url1).toString('base64url');
      const safeName2 = Buffer.from(url2).toString('base64url');
      
      fs.writeFileSync(path.join(pageDataDir, `${safeName1}.json`), JSON.stringify(largeData1));
      fs.writeFileSync(path.join(pageDataDir, `${safeName2}.json`), JSON.stringify(largeData2));
      
      // Run migration
      const result = pageDataManager.migrateToCompressed();
      
      expect(result.migrated).toBe(2);
      expect(result.errors).toBe(0);
      expect(result.totalSaved).toBeGreaterThan(0);
      
      // Check that compressed files exist and originals are gone
      expect(fs.existsSync(path.join(pageDataDir, `${safeName1}.json.gz`))).toBe(true);
      expect(fs.existsSync(path.join(pageDataDir, `${safeName2}.json.gz`))).toBe(true);
      expect(fs.existsSync(path.join(pageDataDir, `${safeName1}.json`))).toBe(false);
      expect(fs.existsSync(path.join(pageDataDir, `${safeName2}.json`))).toBe(false);
    });

    test('should not migrate small files', () => {
      const pageDataDir = path.join(testAuditDir, 'page-data');
      
      const url = 'https://example.com/small';
      const smallData = {
        url: url,
        content: 'Small content'
      };
      
      const safeName = Buffer.from(url).toString('base64url');
      const filePath = path.join(pageDataDir, `${safeName}.json`);
      
      fs.writeFileSync(filePath, JSON.stringify(smallData));
      
      const result = pageDataManager.migrateToCompressed();
      
      expect(result.migrated).toBe(0);
      expect(fs.existsSync(filePath)).toBe(true); // Should remain uncompressed
    });
  });

  describe('compression statistics', () => {
    beforeEach(() => {
      pageDataManager = new CompressedPageDataManager(testAuditDir);
    });

    test('should calculate compression statistics correctly', () => {
      // Add one large file (compressed) and one small file (uncompressed)
      const largeUrl = 'https://example.com/large';
      const smallUrl = 'https://example.com/small';
      
      const largeData = {
        content: 'L'.repeat(15000),
        type: 'large'
      };
      
      const smallData = {
        content: 'Small content',
        type: 'small'
      };

      pageDataManager.set(largeUrl, largeData);
      pageDataManager.set(smallUrl, smallData);
      
      const stats = pageDataManager.getCompressionStats();
      
      expect(stats.compressed).toBe(1);
      expect(stats.uncompressed).toBe(1);
      expect(stats.compressedSize).toBeGreaterThan(0);
      expect(stats.uncompressedSize).toBeGreaterThan(0);
    });

    test('should print compression statistics', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Add some data
      pageDataManager.set('https://example.com/test', {
        content: 'T'.repeat(12000)
      });
      
      pageDataManager.printCompressionStats();
      
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('memory cache management', () => {
    beforeEach(() => {
      pageDataManager = new CompressedPageDataManager(testAuditDir, 2); // Small cache for testing
    });

    test('should evict oldest items when cache exceeds limit', () => {
      const url1 = 'https://example.com/page1';
      const url2 = 'https://example.com/page2';
      const url3 = 'https://example.com/page3';
      
      const data1 = { content: 'Content 1' };
      const data2 = { content: 'Content 2' };
      const data3 = { content: 'Content 3' };

      pageDataManager.set(url1, data1);
      pageDataManager.set(url2, data2);
      pageDataManager.set(url3, data3); // Should evict url1 from cache
      
      expect(pageDataManager.memoryCache.size).toBe(2);
      expect(pageDataManager.memoryCache.has(url1)).toBe(false);
      expect(pageDataManager.memoryCache.has(url2)).toBe(true);
      expect(pageDataManager.memoryCache.has(url3)).toBe(true);
    });

    test('should reload from disk when item not in memory cache', () => {
      const url = 'https://example.com/test';
      const data = {
        content: 'T'.repeat(12000), // Large enough to be compressed
        id: 'test-page'
      };

      pageDataManager.set(url, data);
      
      // Clear memory cache
      pageDataManager.memoryCache.clear();
      
      // Should reload from compressed disk file
      const retrievedData = pageDataManager.get(url);
      
      expect(retrievedData).toEqual(data);
      expect(retrievedData.content.length).toBe(12000);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      pageDataManager = new CompressedPageDataManager(testAuditDir);
    });

    test('should handle corrupted compressed files gracefully', () => {
      const url = 'https://example.com/corrupted';
      const { compressed } = pageDataManager.getFilePaths(url);
      
      // Create a corrupted compressed file
      fs.writeFileSync(compressed, 'corrupted data');
      
      const result = pageDataManager.get(url);
      
      expect(result).toBe(null);
    });

    test('should fallback to uncompressed when compression fails', () => {
      const originalGzipSync = zlib.gzipSync;
      zlib.gzipSync = jest.fn(() => {
        throw new Error('Compression failed');
      });

      const url = 'https://example.com/test';
      const largeData = {
        content: 'L'.repeat(15000) // Large enough to trigger compression
      };

      // Should fallback to uncompressed
      expect(() => {
        pageDataManager.set(url, largeData);
      }).not.toThrow();

      const { compressed, uncompressed } = pageDataManager.getFilePaths(url);
      expect(fs.existsSync(uncompressed)).toBe(true);
      expect(fs.existsSync(compressed)).toBe(false);
      
      zlib.gzipSync = originalGzipSync;
    });

    test('should handle deletion of non-existent files gracefully', () => {
      const url = 'https://example.com/nonexistent';
      
      expect(() => {
        pageDataManager.delete(url);
      }).not.toThrow();
    });
  });

  describe('compatibility with original interface', () => {
    beforeEach(() => {
      pageDataManager = new CompressedPageDataManager(testAuditDir);
    });

    test('should maintain the same interface as ChunkedPageDataManager', () => {
      const url = 'https://example.com/test';
      const data = { title: 'Test Page', content: 'Test content' };

      // Basic operations should work the same
      pageDataManager.set(url, data);
      expect(pageDataManager.has(url)).toBe(true);
      expect(pageDataManager.get(url)).toEqual(data);
      
      pageDataManager.delete(url);
      expect(pageDataManager.has(url)).toBe(false);
      expect(pageDataManager.get(url)).toBe(null);
    });

    test('should support iteration like original manager', () => {
      const testData = [
        ['https://example.com/page1', { title: 'Page 1' }],
        ['https://example.com/page2', { title: 'Page 2' }],
        ['https://example.com/page3', { title: 'Page 3' }]
      ];

      for (const [url, data] of testData) {
        pageDataManager.set(url, data);
      }
      
      const allData = Array.from(pageDataManager);
      
      expect(allData.length).toBe(3);
      
      const urls = allData.map(([url, data]) => url);
      expect(urls).toContain('https://example.com/page1');
      expect(urls).toContain('https://example.com/page2');
      expect(urls).toContain('https://example.com/page3');
    });

    test('should have size property that works correctly', () => {
      const url1 = 'https://example.com/page1';
      const url2 = 'https://example.com/page2';
      
      const data1 = { content: 'Content 1' };
      const data2 = { content: 'C'.repeat(15000) }; // Large content

      pageDataManager.set(url1, data1);
      pageDataManager.set(url2, data2);
      
      const size = pageDataManager.size;
      expect(size).toBeGreaterThan(0);
    });

    test('should clear all data correctly', () => {
      pageDataManager.set('https://example.com/test1', { content: 'Test 1' });
      pageDataManager.set('https://example.com/test2', { content: 'Test 2' });
      
      expect(pageDataManager.memoryCache.size).toBe(2);
      
      pageDataManager.clear();
      
      expect(pageDataManager.memoryCache.size).toBe(0);
      expect(fs.existsSync(pageDataManager.pageDataFolder)).toBe(true);
      expect(fs.readdirSync(pageDataManager.pageDataFolder).length).toBe(0);
    });
  });
});
