// Comprehensive Tests for Storage Management
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { ChunkedPageDataManager } from '../../src/storage/page-data-manager.js';

describe('Storage Manager - ChunkedPageDataManager', () => {
  const testDomainDir = './test-storage-domain';
  const testPageDataDir = path.join(testDomainDir, 'page-data');
  let manager;

  beforeEach(() => {
    // Clean up any existing test directory
    if (fs.existsSync(testDomainDir)) {
      fs.rmSync(testDomainDir, { recursive: true, force: true });
    }
    
    // Create fresh test directory
    fs.mkdirSync(testDomainDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDomainDir)) {
      fs.rmSync(testDomainDir, { recursive: true, force: true });
    }
  });

  describe('constructor and initialization', () => {
    test('should initialize with domain folder and default memory limit', () => {
      manager = new ChunkedPageDataManager(testDomainDir);
      
      expect(manager.domainFolder).toBe(testDomainDir);
      expect(manager.maxItemsInMemory).toBe(100);
      expect(manager.pageDataFolder).toBe(testPageDataDir);
      expect(manager.memoryCache).toBeInstanceOf(Map);
      expect(manager.memoryCache.size).toBe(0);
    });

    test('should initialize with custom memory limit', () => {
      manager = new ChunkedPageDataManager(testDomainDir, 50);
      
      expect(manager.maxItemsInMemory).toBe(50);
    });

    test('should create page-data directory on initialization', () => {
      manager = new ChunkedPageDataManager(testDomainDir);
      
      expect(fs.existsSync(testPageDataDir)).toBe(true);
      expect(fs.statSync(testPageDataDir).isDirectory()).toBe(true);
    });

    test('should handle existing page-data directory gracefully', () => {
      // Pre-create the directory
      fs.mkdirSync(testPageDataDir, { recursive: true });
      
      expect(() => {
        manager = new ChunkedPageDataManager(testDomainDir);
      }).not.toThrow();
      
      expect(fs.existsSync(testPageDataDir)).toBe(true);
    });
  });

  describe('file path generation', () => {
    beforeEach(() => {
      manager = new ChunkedPageDataManager(testDomainDir);
    });

    test('should generate safe file paths from URLs', () => {
      const testCases = [
        'https://example.com/',
        'https://example.com/page?param=value',
        'https://example.com/path/with/special/chars',
        'https://example.com:8080/port-path',
        'https://example.com/path#fragment'
      ];

      testCases.forEach(url => {
        const filePath = manager.getFilePath(url);
        
        expect(filePath).toMatch(/\.json$/);
        expect(filePath).toContain(testPageDataDir);
        expect(path.basename(filePath)).not.toContain('/');
        expect(path.basename(filePath)).not.toContain('\\');
        expect(path.basename(filePath)).not.toContain(':');
        expect(path.basename(filePath)).not.toContain('?');
        expect(path.basename(filePath)).not.toContain('#');
      });
    });

    test('should generate unique file paths for different URLs', () => {
      const urls = [
        'https://example.com/page1',
        'https://example.com/page2',
        'https://example.com/page1?param=1',
        'https://example.com/page1#section'
      ];

      const filePaths = urls.map(url => manager.getFilePath(url));
      const uniquePaths = new Set(filePaths);
      
      expect(uniquePaths.size).toBe(urls.length);
    });
  });

  describe('data storage and retrieval', () => {
    beforeEach(() => {
      manager = new ChunkedPageDataManager(testDomainDir, 3); // Small cache for testing
    });

    test('should store and retrieve basic data', () => {
      const url = 'https://example.com/test';
      const data = {
        title: 'Test Page',
        content: 'Test content',
        links: ['link1', 'link2']
      };

      manager.set(url, data);
      const retrieved = manager.get(url);

      expect(retrieved).toEqual(data);
    });

    test('should store data to both memory and disk', () => {
      const url = 'https://example.com/test';
      const data = { title: 'Test Page' };

      manager.set(url, data);

      // Check memory cache
      expect(manager.memoryCache.has(url)).toBe(true);
      expect(manager.memoryCache.get(url)).toEqual(data);

      // Check disk storage
      const filePath = manager.getFilePath(url);
      expect(fs.existsSync(filePath)).toBe(true);
      
      const diskData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      expect(diskData).toEqual(data);
    });

    test('should handle complex nested data structures', () => {
      const url = 'https://example.com/complex';
      const complexData = {
        seo: {
          title: { text: 'Page Title', length: 10 },
          meta: { description: 'Meta description' }
        },
        performance: {
          metrics: { loadTime: 1500, size: 2048 },
          scores: [85, 90, 78]
        },
        links: {
          internal: ['url1', 'url2'], // Use arrays instead of Sets for JSON compatibility
          external: ['ext1', 'ext2']
        }
      };

      manager.set(url, complexData);
      const retrieved = manager.get(url);

      expect(retrieved.seo).toEqual(complexData.seo);
      expect(retrieved.performance).toEqual(complexData.performance);
      expect(retrieved.links.internal).toEqual(['url1', 'url2']);
      expect(retrieved.links.external).toEqual(['ext1', 'ext2']);
    });

    test('should return null for non-existent URLs', () => {
      const result = manager.get('https://nonexistent.com/page');
      expect(result).toBeNull();
    });

    test('should prioritize memory cache over disk', () => {
      const url = 'https://example.com/priority-test';
      const originalData = { version: 'original' };
      const updatedData = { version: 'updated' };

      // Store original data
      manager.set(url, originalData);

      // Manually modify disk file to simulate different data
      const filePath = manager.getFilePath(url);
      fs.writeFileSync(filePath, JSON.stringify(updatedData));

      // Should still return memory cached version
      const result = manager.get(url);
      expect(result).toEqual(originalData);
    });
  });

  describe('memory cache management', () => {
    beforeEach(() => {
      manager = new ChunkedPageDataManager(testDomainDir, 3); // Small cache for testing
    });

    test('should evict oldest items when cache exceeds limit', () => {
      const urls = [
        'https://example.com/page1',
        'https://example.com/page2',
        'https://example.com/page3',
        'https://example.com/page4' // This should evict page1
      ];

      urls.forEach((url, index) => {
        manager.set(url, { page: index + 1 });
      });

      // Cache should only have 3 items
      expect(manager.memoryCache.size).toBe(3);
      
      // First item should be evicted
      expect(manager.memoryCache.has('https://example.com/page1')).toBe(false);
      
      // Last 3 items should be in cache
      expect(manager.memoryCache.has('https://example.com/page2')).toBe(true);
      expect(manager.memoryCache.has('https://example.com/page3')).toBe(true);
      expect(manager.memoryCache.has('https://example.com/page4')).toBe(true);
    });

    test('should reload from disk when item not in memory cache', () => {
      const url = 'https://example.com/reload-test';
      const data = { content: 'test data' };

      // Store data
      manager.set(url, data);

      // Manually clear memory cache
      manager.memoryCache.clear();

      // Should reload from disk
      const retrieved = manager.get(url);
      expect(retrieved).toEqual(data);

      // Should now be back in memory cache
      expect(manager.memoryCache.has(url)).toBe(true);
    });

    test('should manage cache when reading from disk', () => {
      manager = new ChunkedPageDataManager(testDomainDir, 2); // Very small cache
      
      const urls = ['url1', 'url2', 'url3'];
      const data = { content: 'test' };

      // Fill beyond cache capacity
      urls.forEach(url => manager.set(url, data));

      // Clear memory to force disk reads
      manager.memoryCache.clear();

      // Read first item (should cache it)
      manager.get(urls[0]);
      expect(manager.memoryCache.size).toBe(1);

      // Read second item (should cache it)
      manager.get(urls[1]);
      expect(manager.memoryCache.size).toBe(2);

      // Read third item (should evict first item)
      manager.get(urls[2]);
      expect(manager.memoryCache.size).toBe(2);
      expect(manager.memoryCache.has(urls[0])).toBe(false);
    });
  });

  describe('data existence and deletion', () => {
    beforeEach(() => {
      manager = new ChunkedPageDataManager(testDomainDir);
    });

    test('should correctly identify existing data', () => {
      const url = 'https://example.com/exists';
      const data = { content: 'test' };

      expect(manager.has(url)).toBe(false);

      manager.set(url, data);
      expect(manager.has(url)).toBe(true);
    });

    test('should detect data existence when only on disk', () => {
      const url = 'https://example.com/disk-only';
      const data = { content: 'test' };

      manager.set(url, data);
      manager.memoryCache.clear(); // Remove from memory

      expect(manager.has(url)).toBe(true);
    });

    test('should delete data from both memory and disk', () => {
      const url = 'https://example.com/to-delete';
      const data = { content: 'test' };

      manager.set(url, data);
      
      // Verify data exists
      expect(manager.has(url)).toBe(true);
      expect(manager.memoryCache.has(url)).toBe(true);
      expect(fs.existsSync(manager.getFilePath(url))).toBe(true);

      // Delete data
      manager.delete(url);

      // Verify data is gone
      expect(manager.has(url)).toBe(false);
      expect(manager.memoryCache.has(url)).toBe(false);
      expect(fs.existsSync(manager.getFilePath(url))).toBe(false);
    });

    test('should handle deletion of non-existent data gracefully', () => {
      const url = 'https://example.com/non-existent';

      expect(() => {
        manager.delete(url);
      }).not.toThrow();

      expect(manager.has(url)).toBe(false);
    });
  });

  describe('iteration and enumeration', () => {
    beforeEach(() => {
      manager = new ChunkedPageDataManager(testDomainDir, 2); // Small cache
    });

    test('should iterate over memory cache entries', () => {
      const testData = [
        ['https://example.com/page1', { id: 1 }],
        ['https://example.com/page2', { id: 2 }]
      ];

      testData.forEach(([url, data]) => manager.set(url, data));

      const memoryEntries = [];
      for (const [url, data] of manager) {
        memoryEntries.push([url, data]);
      }

      expect(memoryEntries.length).toBeGreaterThanOrEqual(2);
      
      // Should include our test data
      const urls = memoryEntries.map(([url]) => url);
      expect(urls).toContain('https://example.com/page1');
      expect(urls).toContain('https://example.com/page2');
    });

    test('should iterate over disk files not in memory', () => {
      const testData = [
        ['https://example.com/page1', { id: 1 }],
        ['https://example.com/page2', { id: 2 }],
        ['https://example.com/page3', { id: 3 }] // This will force eviction
      ];

      testData.forEach(([url, data]) => manager.set(url, data));
      
      const allEntries = [];
      for (const [url, data] of manager) {
        allEntries.push([url, data]);
      }

      // Should get all 3 entries even though cache only holds 2
      expect(allEntries.length).toBe(3);
      
      const urls = allEntries.map(([url]) => url);
      testData.forEach(([url]) => {
        expect(urls).toContain(url);
      });
    });

    test('should handle corrupted disk files during iteration', () => {
      // Create a valid entry
      manager.set('https://example.com/valid', { valid: true });

      // Create an invalid JSON file manually
      const invalidPath = path.join(testPageDataDir, 'invalid.json');
      fs.writeFileSync(invalidPath, 'invalid json content');

      const entries = [];
      expect(() => {
        for (const [url, data] of manager) {
          entries.push([url, data]);
        }
      }).not.toThrow();

      // Should still get the valid entry
      expect(entries.length).toBeGreaterThanOrEqual(1);
      expect(entries.some(([url]) => url === 'https://example.com/valid')).toBe(true);
    });

    test('should skip non-JSON files during iteration', () => {
      // Create valid entry
      manager.set('https://example.com/valid', { valid: true });

      // Create non-JSON files
      fs.writeFileSync(path.join(testPageDataDir, 'readme.txt'), 'text file');
      fs.writeFileSync(path.join(testPageDataDir, 'config.xml'), '<xml>content</xml>');

      const entries = [];
      for (const [url, data] of manager) {
        entries.push([url, data]);
      }

      // Should only include JSON entries
      expect(entries.length).toBe(1);
      expect(entries[0][0]).toBe('https://example.com/valid');
    });
  });

  describe('clear and cleanup operations', () => {
    beforeEach(() => {
      manager = new ChunkedPageDataManager(testDomainDir);
    });

    test('should clear all data from memory and disk', () => {
      const testData = [
        ['https://example.com/page1', { id: 1 }],
        ['https://example.com/page2', { id: 2 }],
        ['https://example.com/page3', { id: 3 }]
      ];

      testData.forEach(([url, data]) => manager.set(url, data));

      // Verify data exists
      expect(manager.memoryCache.size).toBeGreaterThan(0);
      expect(fs.readdirSync(testPageDataDir).length).toBeGreaterThan(0);

      // Clear all data
      manager.clear();

      // Verify everything is cleared
      expect(manager.memoryCache.size).toBe(0);
      expect(fs.readdirSync(testPageDataDir).length).toBe(0);
      expect(fs.existsSync(testPageDataDir)).toBe(true); // Directory should still exist
    });

    test('should reinitialize storage after clear', () => {
      // Add some data
      manager.set('https://example.com/test', { test: true });

      // Clear everything
      manager.clear();

      // Should be able to add new data
      manager.set('https://example.com/new', { new: true });
      
      expect(manager.get('https://example.com/new')).toEqual({ new: true });
      expect(manager.get('https://example.com/test')).toBeNull();
    });

    test('should handle clear when page-data directory does not exist', () => {
      // Remove the directory
      fs.rmSync(testPageDataDir, { recursive: true, force: true });

      expect(() => {
        manager.clear();
      }).not.toThrow();

      // Directory should be recreated
      expect(fs.existsSync(testPageDataDir)).toBe(true);
    });
  });

  describe('error handling and edge cases', () => {
    beforeEach(() => {
      manager = new ChunkedPageDataManager(testDomainDir);
    });

    test('should handle read permission errors gracefully', () => {
      const url = 'https://example.com/test';
      const data = { test: true };

      manager.set(url, data);
      
      // Clear from memory cache to force disk read
      manager.memoryCache.clear();
      
      // Simulate read error by corrupting the file
      const filePath = manager.getFilePath(url);
      fs.writeFileSync(filePath, 'corrupted json data');

      // Should throw a JSON parse error - this is expected behavior
      expect(() => {
        manager.get(url);
      }).toThrow();
    });

    test('should handle moderately long URLs', () => {
      // Use a reasonable URL length that works on Windows
      const longUrl = 'https://example.com/' + 'long-path-segment-'.repeat(5) + 'page';
      const data = { content: 'moderately long url test' };

      expect(() => {
        manager.set(longUrl, data);
        const retrieved = manager.get(longUrl);
        expect(retrieved).toEqual(data);
      }).not.toThrow();
    });

    test('should handle special characters in URLs', () => {
      const specialUrls = [
        'https://example.com/пåge',
        'https://example.com/页面',
        'https://example.com/صفحة',
        'https://example.com/página'
      ];

      specialUrls.forEach((url, index) => {
        const data = { index, url };
        
        expect(() => {
          manager.set(url, data);
          const retrieved = manager.get(url);
          expect(retrieved).toEqual(data);
        }).not.toThrow();
      });
    });

    test('should handle extremely large data objects', () => {
      const url = 'https://example.com/large-data';
      const largeData = {
        content: 'x'.repeat(100000), // 100KB string
        array: new Array(10000).fill(0).map((_, i) => ({ id: i, value: Math.random() })),
        nested: {
          level1: { level2: { level3: { data: 'deep nested data' } } }
        }
      };

      expect(() => {
        manager.set(url, largeData);
        const retrieved = manager.get(url);
        expect(retrieved.content.length).toBe(100000);
        expect(retrieved.array.length).toBe(10000);
        expect(retrieved.nested.level1.level2.level3.data).toBe('deep nested data');
      }).not.toThrow();
    });
  });

  describe('performance and memory management', () => {
    test('should maintain performance with many entries', () => {
      manager = new ChunkedPageDataManager(testDomainDir, 10); // Small cache

      const startTime = Date.now();
      
      // Add 100 entries
      for (let i = 0; i < 100; i++) {
        const url = `https://example.com/page-${i}`;
        const data = { 
          id: i, 
          content: `Content for page ${i}`,
          metadata: { created: Date.now(), size: Math.random() * 1000 }
        };
        manager.set(url, data);
      }

      const insertTime = Date.now() - startTime;
      expect(insertTime).toBeLessThan(5000); // Should complete within 5 seconds

      // Memory cache should be limited
      expect(manager.memoryCache.size).toBeLessThanOrEqual(10);

      // All data should still be accessible
      const readStartTime = Date.now();
      for (let i = 0; i < 100; i++) {
        const url = `https://example.com/page-${i}`;
        const data = manager.get(url);
        expect(data.id).toBe(i);
      }

      const readTime = Date.now() - readStartTime;
      expect(readTime).toBeLessThan(3000); // Reads should be fast
    });

    test('should handle concurrent-like operations', () => {
      manager = new ChunkedPageDataManager(testDomainDir, 5);

      const operations = [];
      
      // Simulate concurrent operations
      for (let i = 0; i < 50; i++) {
        const url = `https://example.com/concurrent-${i}`;
        const data = { operation: i };
        
        operations.push(() => manager.set(url, data));
        operations.push(() => manager.get(url));
        operations.push(() => manager.has(url));
        if (i % 10 === 0) {
          operations.push(() => manager.delete(url));
        }
      }

      // Execute all operations
      expect(() => {
        operations.forEach(op => op());
      }).not.toThrow();
    });
  });
});
