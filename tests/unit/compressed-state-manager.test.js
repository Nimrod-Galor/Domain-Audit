// Tests for compressed-state-manager - Enhanced state persistence with compression
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  serializeMap,
  restoreMap,
  saveState,
  loadState,
  migrateStateFiles,
  getCompressionStats
} from '../../src/core/compressed-state-manager.js';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

describe('Compressed State Manager', () => {
  let testDir;
  let testStateFile;
  let mockPageDataManager;

  beforeEach(() => {
    testDir = './test-compressed-state';
    testStateFile = path.join(testDir, 'test-state.json');
    
    // Mock page data manager
    mockPageDataManager = {
      size: 1024
    };
    
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('serializeMap and restoreMap (inherited functionality)', () => {
    test('should serialize map with Sets to plain objects', () => {
      const testMap = {
        'https://example.com': {
          count: 5,
          anchors: new Set(['Home', 'Main']),
          sources: new Set(['page1', 'page2'])
        }
      };

      const serialized = serializeMap(testMap);
      
      expect(serialized['https://example.com'].anchors).toEqual(['Home', 'Main']);
      expect(serialized['https://example.com'].sources).toEqual(['page1', 'page2']);
      expect(serialized['https://example.com'].count).toBe(5);
    });

    test('should restore arrays to Sets in target map', () => {
      const savedMap = {
        'https://example.com': {
          count: 5,
          anchors: ['Home', 'Main'],
          sources: ['page1', 'page2']
        }
      };
      
      const targetMap = {};
      restoreMap(targetMap, savedMap);
      
      expect(targetMap['https://example.com'].anchors).toBeInstanceOf(Set);
      expect(targetMap['https://example.com'].sources).toBeInstanceOf(Set);
      expect(Array.from(targetMap['https://example.com'].anchors)).toEqual(['Home', 'Main']);
    });
  });

  describe('compression functionality', () => {
    test('should save large state files as compressed (.json.gz)', () => {
      const visited = new Set(['https://example.com', 'https://example.com/page1']);
      const queue = new Set([]);
      const stats = {
        'https://example.com': {
          count: 1,
          anchors: new Set(['Home']),
          sources: new Set(['homepage'])
        }
      };
      const badRequests = {};
      const externalLinks = {};
      const mailtoLinks = {};
      const telLinks = {};
      
      // Create large data to trigger compression
      for (let i = 0; i < 1000; i++) {
        stats[`https://example.com/page${i}`] = {
          count: Math.floor(Math.random() * 10),
          anchors: new Set([`Page ${i}`, `Link ${i}`]),
          sources: new Set([`source${i}`])
        };
      }

      saveState(testDir, testStateFile, visited, queue, stats, badRequests, externalLinks, mailtoLinks, telLinks, mockPageDataManager);
      
      // Should create compressed file
      expect(fs.existsSync(testStateFile + '.gz')).toBe(true);
      expect(fs.existsSync(testStateFile)).toBe(false);
    });

    test('should save small state files as uncompressed (.json)', () => {
      const visited = new Set(['https://example.com']);
      const queue = new Set([]);
      const stats = {};
      const badRequests = {};
      const externalLinks = {};
      const mailtoLinks = {};
      const telLinks = {};

      saveState(testDir, testStateFile, visited, queue, stats, badRequests, externalLinks, mailtoLinks, telLinks, mockPageDataManager);
      
      // Should create uncompressed file for small data
      expect(fs.existsSync(testStateFile)).toBe(true);
      expect(fs.existsSync(testStateFile + '.gz')).toBe(false);
    });

    test('should load compressed state files correctly', () => {
      const originalVisited = new Set(['https://example.com', 'https://example.com/page1']);
      const originalQueue = new Set(['https://example.com/page2']);
      const originalStats = {
        'https://example.com': {
          count: 5,
          anchors: new Set(['Home', 'Main']),
          sources: new Set(['index', 'nav'])
        }
      };
      
      // Create large data to ensure compression
      for (let i = 0; i < 500; i++) {
        originalStats[`https://example.com/large${i}`] = {
          count: i,
          anchors: new Set([`Link${i}`]),
          sources: new Set([`source${i}`])
        };
      }

      const originalBadRequests = {};
      const originalExternalLinks = {};
      const originalMailtoLinks = {};
      const originalTelLinks = {};

      // Save (should be compressed)
      saveState(testDir, testStateFile, originalVisited, originalQueue, originalStats, originalBadRequests, originalExternalLinks, originalMailtoLinks, originalTelLinks, mockPageDataManager);
      
      // Verify it's compressed
      expect(fs.existsSync(testStateFile + '.gz')).toBe(true);

      // Load into new containers
      const visited = new Set();
      const queue = new Set();
      const stats = {};
      const badRequests = {};
      const externalLinks = {};
      const mailtoLinks = {};
      const telLinks = {};

      const loaded = loadState(testStateFile, visited, queue, stats, badRequests, externalLinks, mailtoLinks, telLinks, mockPageDataManager);
      
      expect(loaded).toBe(true);
      expect(visited.size).toBe(originalVisited.size);
      expect(queue.size).toBe(originalQueue.size);
      expect(Object.keys(stats).length).toBe(Object.keys(originalStats).length);
      expect(stats['https://example.com'].anchors).toBeInstanceOf(Set);
    });

    test('should handle fallback from compressed to uncompressed', () => {
      const visited = new Set(['https://example.com']);
      const queue = new Set([]);
      const stats = {};
      const badRequests = {};
      const externalLinks = {};
      const mailtoLinks = {};
      const telLinks = {};

      // Create uncompressed file manually
      const state = {
        visited: [...visited],
        queue: [...queue],
        stats: serializeMap(stats),
        badRequests: serializeMap(badRequests),
        externalLinks: serializeMap(externalLinks),
        mailtoLinks: serializeMap(mailtoLinks),
        telLinks: serializeMap(telLinks),
        pageDataSize: mockPageDataManager.size
      };
      
      fs.writeFileSync(testStateFile, JSON.stringify(state, null, 2));

      // Try to load (should fall back to uncompressed)
      const newVisited = new Set();
      const newQueue = new Set();
      const newStats = {};
      const newBadRequests = {};
      const newExternalLinks = {};
      const newMailtoLinks = {};
      const newTelLinks = {};

      const loaded = loadState(testStateFile, newVisited, newQueue, newStats, newBadRequests, newExternalLinks, newMailtoLinks, newTelLinks, mockPageDataManager);
      
      expect(loaded).toBe(true);
      expect(newVisited.has('https://example.com')).toBe(true);
    });
  });

  describe('migration functionality', () => {
    test('should migrate uncompressed state files to compressed', () => {
      // Create an uncompressed state file manually
      const largeState = {
        visited: [],
        queue: [],
        stats: {},
        badRequests: {},
        externalLinks: {},
        mailtoLinks: {},
        telLinks: {},
        pageDataSize: 1024
      };
      
      // Add large data to ensure compression
      for (let i = 0; i < 500; i++) {
        largeState.stats[`https://example.com/page${i}`] = {
          count: i,
          anchors: [`Link${i}`, `Anchor${i}`],
          sources: [`source${i}`]
        };
      }

      const uncompressedFile = path.join(testDir, 'test-crawl-state.json');
      fs.writeFileSync(uncompressedFile, JSON.stringify(largeState, null, 2));
      
      // Run migration
      const result = migrateStateFiles(testDir);
      
      expect(result.migrated).toBe(1);
      expect(result.errors).toBe(0);
      expect(result.totalSaved).toBeGreaterThan(0);
      
      // Check that compressed file exists and original is gone
      expect(fs.existsSync(uncompressedFile + '.gz')).toBe(true);
      expect(fs.existsSync(uncompressedFile)).toBe(false);
    });

    test('should not migrate small files', () => {
      const smallState = {
        visited: ['https://example.com'],
        queue: [],
        stats: {},
        badRequests: {},
        externalLinks: {},
        mailtoLinks: {},
        telLinks: {},
        pageDataSize: 512
      };

      const smallFile = path.join(testDir, 'small-crawl-state.json');
      fs.writeFileSync(smallFile, JSON.stringify(smallState, null, 2));
      
      const result = migrateStateFiles(testDir);
      
      expect(result.migrated).toBe(0);
      expect(fs.existsSync(smallFile)).toBe(true); // Should remain uncompressed
    });
  });

  describe('compression statistics', () => {
    test('should calculate compression statistics correctly', () => {
      // Create one compressed and one uncompressed file
      const compressedFile = path.join(testDir, 'compressed-crawl-state.json.gz');
      const uncompressedFile = path.join(testDir, 'uncompressed-crawl-state.json');
      
      const testData = JSON.stringify({ test: 'data' });
      const compressedData = zlib.gzipSync(Buffer.from(testData, 'utf8'));
      
      fs.writeFileSync(compressedFile, compressedData);
      fs.writeFileSync(uncompressedFile, testData);
      
      const stats = getCompressionStats(testDir);
      
      expect(stats.compressed.count).toBe(1);
      expect(stats.uncompressed.count).toBe(1);
      expect(stats.compressed.totalSize).toBe(compressedData.length);
      expect(stats.uncompressed.totalSize).toBe(Buffer.byteLength(testData, 'utf8'));
      expect(stats.potentialSavings).toBeGreaterThan(0);
    });

    test('should return null for non-existent directory', () => {
      const stats = getCompressionStats('./non-existent-dir');
      expect(stats).toBe(null);
    });
  });

  describe('error handling', () => {
    test('should handle corrupted compressed files gracefully', () => {
      // Create a corrupted compressed file
      fs.writeFileSync(testStateFile + '.gz', 'corrupted data');
      
      const visited = new Set();
      const queue = new Set();
      const stats = {};
      const badRequests = {};
      const externalLinks = {};
      const mailtoLinks = {};
      const telLinks = {};

      const loaded = loadState(testStateFile, visited, queue, stats, badRequests, externalLinks, mailtoLinks, telLinks, mockPageDataManager);
      
      expect(loaded).toBe(false);
    });

    test('should fallback when compression fails', () => {
      // Mock zlib.gzipSync to throw error
      const originalGzipSync = zlib.gzipSync;
      zlib.gzipSync = jest.fn(() => {
        throw new Error('Compression failed');
      });

      const visited = new Set(['https://example.com']);
      const queue = new Set([]);
      const stats = {};
      
      // Create large data that would normally trigger compression
      for (let i = 0; i < 1000; i++) {
        stats[`url${i}`] = { count: i, anchors: new Set([`anchor${i}`]), sources: new Set([`source${i}`]) };
      }

      const badRequests = {};
      const externalLinks = {};
      const mailtoLinks = {};
      const telLinks = {};

      // Should fallback to uncompressed
      expect(() => {
        saveState(testDir, testStateFile, visited, queue, stats, badRequests, externalLinks, mailtoLinks, telLinks, mockPageDataManager);
      }).not.toThrow();

      // Should create uncompressed file as fallback
      expect(fs.existsSync(testStateFile)).toBe(true);
      
      // Restore original function
      zlib.gzipSync = originalGzipSync;
    });
  });

  describe('integration with existing functionality', () => {
    test('should maintain compatibility with original state manager interface', () => {
      const visited = new Set(['https://example.com']);
      const queue = new Set(['https://example.com/page1']);
      const stats = {
        'https://example.com': {
          count: 5,
          anchors: new Set(['Home']),
          sources: new Set(['nav'])
        }
      };
      const badRequests = {};
      const externalLinks = {};
      const mailtoLinks = {};
      const telLinks = {};

      // Save and load should work exactly like original
      saveState(testDir, testStateFile, visited, queue, stats, badRequests, externalLinks, mailtoLinks, telLinks, mockPageDataManager);
      
      const newVisited = new Set();
      const newQueue = new Set();
      const newStats = {};
      const newBadRequests = {};
      const newExternalLinks = {};
      const newMailtoLinks = {};
      const newTelLinks = {};

      const loaded = loadState(testStateFile, newVisited, newQueue, newStats, newBadRequests, newExternalLinks, newMailtoLinks, newTelLinks, mockPageDataManager);
      
      expect(loaded).toBe(true);
      expect(newVisited.has('https://example.com')).toBe(true);
      expect(newQueue.has('https://example.com/page1')).toBe(true);
      expect(newStats['https://example.com'].count).toBe(5);
    });
  });
});
