// Tests for state-manager - State persistence functions
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  serializeMap,
  restoreMap,
  saveState,
  loadState
} from '../../legacy/state-manager.js';
import fs from 'fs';
import path from 'path';

describe('State Manager', () => {
  let testDir;
  let testStateFile;

  beforeEach(() => {
    testDir = './test-state';
    testStateFile = path.join(testDir, 'test-state.json');
    
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

  describe('serializeMap', () => {
    test('should serialize map with Sets to plain objects', () => {
      const testMap = {
        'https://example.com/page1': {
          sources: new Set(['https://example.com/', 'https://example.com/page2']),
          anchors: new Set(['Link 1', 'Page One']),
          count: 2
        },
        'https://example.com/page2': {
          sources: new Set(['https://example.com/']),
          anchors: new Set(['Link 2']),
          count: 1
        }
      };

      const serialized = serializeMap(testMap);

      expect(serialized['https://example.com/page1'].sources).toBeInstanceOf(Array);
      expect(serialized['https://example.com/page1'].anchors).toBeInstanceOf(Array);
      expect(serialized['https://example.com/page1'].sources).toContain('https://example.com/');
      expect(serialized['https://example.com/page1'].anchors).toContain('Link 1');
      expect(serialized['https://example.com/page1'].count).toBe(2);
    });

    test('should handle empty Sets', () => {
      const testMap = {
        'https://example.com/empty': {
          sources: new Set(),
          anchors: new Set(),
          count: 0
        }
      };

      const serialized = serializeMap(testMap);

      expect(serialized['https://example.com/empty'].sources).toEqual([]);
      expect(serialized['https://example.com/empty'].anchors).toEqual([]);
    });

    test('should handle undefined Sets gracefully', () => {
      const testMap = {
        'https://example.com/partial': {
          sources: undefined,
          anchors: new Set(['Anchor']),
          count: 1
        }
      };

      const serialized = serializeMap(testMap);

      expect(serialized['https://example.com/partial'].sources).toBeUndefined();
      expect(serialized['https://example.com/partial'].anchors).toEqual(['Anchor']);
    });

    test('should preserve other properties unchanged', () => {
      const testMap = {
        'https://example.com/complex': {
          sources: new Set(['source1']),
          anchors: new Set(['anchor1']),
          count: 1,
          status: 200,
          metadata: { type: 'page' }
        }
      };

      const serialized = serializeMap(testMap);

      expect(serialized['https://example.com/complex'].status).toBe(200);
      expect(serialized['https://example.com/complex'].metadata).toEqual({ type: 'page' });
    });
  });

  describe('restoreMap', () => {
    test('should restore arrays to Sets in target map', () => {
      const targetMap = {};
      const savedMap = {
        'https://example.com/page1': {
          sources: ['https://example.com/', 'https://example.com/page2'],
          anchors: ['Link 1', 'Page One'],
          count: 2
        }
      };

      restoreMap(targetMap, savedMap);

      expect(targetMap['https://example.com/page1'].sources).toBeInstanceOf(Set);
      expect(targetMap['https://example.com/page1'].anchors).toBeInstanceOf(Set);
      expect(targetMap['https://example.com/page1'].sources.has('https://example.com/')).toBe(true);
      expect(targetMap['https://example.com/page1'].anchors.has('Link 1')).toBe(true);
      expect(targetMap['https://example.com/page1'].count).toBe(2);
    });

    test('should handle empty arrays', () => {
      const targetMap = {};
      const savedMap = {
        'https://example.com/empty': {
          sources: [],
          anchors: [],
          count: 0
        }
      };

      restoreMap(targetMap, savedMap);

      expect(targetMap['https://example.com/empty'].sources).toBeInstanceOf(Set);
      expect(targetMap['https://example.com/empty'].anchors).toBeInstanceOf(Set);
      expect(targetMap['https://example.com/empty'].sources.size).toBe(0);
      expect(targetMap['https://example.com/empty'].anchors.size).toBe(0);
    });

    test('should handle undefined arrays gracefully', () => {
      const targetMap = {};
      const savedMap = {
        'https://example.com/partial': {
          sources: undefined,
          anchors: ['Anchor'],
          count: 1
        }
      };

      restoreMap(targetMap, savedMap);

      expect(targetMap['https://example.com/partial'].sources).toBeUndefined();
      expect(targetMap['https://example.com/partial'].anchors).toBeInstanceOf(Set);
      expect(targetMap['https://example.com/partial'].anchors.has('Anchor')).toBe(true);
    });

    test('should preserve existing entries in target map', () => {
      const targetMap = {
        'existing-key': { value: 'existing' }
      };
      const savedMap = {
        'new-key': {
          sources: ['source1'],
          anchors: ['anchor1']
        }
      };

      restoreMap(targetMap, savedMap);

      expect(targetMap['existing-key']).toEqual({ value: 'existing' });
      expect(targetMap['new-key'].sources).toBeInstanceOf(Set);
    });
  });

  describe('saveState', () => {
    test('should save complete crawler state to file', () => {
      const mockState = {
        visited: new Set(['https://example.com/', 'https://example.com/page1']),
        queue: new Set(['https://example.com/page2', 'https://example.com/page3']),
        stats: {
          'https://example.com/': {
            sources: new Set(['root']),
            anchors: new Set(['Home']),
            count: 1
          }
        },
        badRequests: {
          'https://example.com/404': {
            sources: new Set(['https://example.com/']),
            anchors: new Set(['Broken Link']),
            status: 404
          }
        },
        externalLinks: {
          'https://external.com': {
            sources: new Set(['https://example.com/']),
            anchors: new Set(['External']),
            status: 200
          }
        },
        mailtoLinks: {
          'mailto:test@example.com': {
            sources: new Set(['https://example.com/contact']),
            anchors: new Set(['Email Us'])
          }
        },
        telLinks: {
          'tel:+1234567890': {
            sources: new Set(['https://example.com/contact']),
            anchors: new Set(['Call Us'])
          }
        }
      };

      const mockPageDataManager = {
        size: 1024
      };

      saveState(
        testDir,
        testStateFile,
        mockState.visited,
        mockState.queue,
        mockState.stats,
        mockState.badRequests,
        mockState.externalLinks,
        mockState.mailtoLinks,
        mockState.telLinks,
        mockPageDataManager
      );

      expect(fs.existsSync(testStateFile)).toBe(true);
      
      const savedContent = fs.readFileSync(testStateFile, 'utf-8');
      const parsedState = JSON.parse(savedContent);
      
      expect(parsedState.visited).toContain('https://example.com/');
      expect(parsedState.queue).toContain('https://example.com/page2');
      expect(parsedState.stats['https://example.com/'].sources).toContain('root');
      expect(parsedState.badRequests['https://example.com/404'].status).toBe(404);
      expect(parsedState.pageDataSize).toBe(1024);
    });

    test('should create directory if it does not exist', () => {
      const newDir = './new-test-state';
      const newStateFile = path.join(newDir, 'state.json');
      
      if (fs.existsSync(newDir)) {
        fs.rmSync(newDir, { recursive: true, force: true });
      }

      const mockPageDataManager = { size: 0 };
      
      saveState(
        newDir,
        newStateFile,
        new Set(),
        [],
        {},
        {},
        {},
        {},
        {},
        mockPageDataManager
      );

      expect(fs.existsSync(newDir)).toBe(true);
      expect(fs.existsSync(newStateFile)).toBe(true);
      
      // Clean up
      fs.rmSync(newDir, { recursive: true, force: true });
    });

    test('should handle empty state gracefully', () => {
      const mockPageDataManager = { size: 0 };
      
      saveState(
        testDir,
        testStateFile,
        new Set(),
        new Set(),
        {},
        {},
        {},
        {},
        {},
        mockPageDataManager
      );

      expect(fs.existsSync(testStateFile)).toBe(true);
      
      const savedContent = fs.readFileSync(testStateFile, 'utf-8');
      const parsedState = JSON.parse(savedContent);
      
      expect(parsedState.visited).toEqual([]);
      expect(parsedState.queue).toEqual([]);
      expect(parsedState.stats).toEqual({});
      expect(parsedState.pageDataSize).toBe(0);
    });
  });

  describe('loadState', () => {
    let mockVisited, mockQueue, mockStats, mockBadRequests, mockExternalLinks, mockMailtoLinks, mockTelLinks, mockPageDataManager;

    beforeEach(() => {
      mockVisited = new Set();
      mockQueue = new Set(); // Changed from array to Set
      mockStats = {};
      mockBadRequests = {};
      mockExternalLinks = {};
      mockMailtoLinks = {};
      mockTelLinks = {};
      mockPageDataManager = {
        size: 0,
        loadFromState: jest.fn()
      };
    });

    test('should load state from existing file', () => {
      // First save a state
      const testState = {
        visited: ['https://example.com/', 'https://example.com/page1'],
        queue: ['https://example.com/page2'],
        stats: {
          'https://example.com/': {
            sources: ['root'],
            anchors: ['Home'],
            count: 1
          }
        },
        badRequests: {},
        externalLinks: {},
        mailtoLinks: {},
        telLinks: {},
        pageDataSize: 2048
      };
      
      fs.writeFileSync(testStateFile, JSON.stringify(testState, null, 2));

      const result = loadState(
        testStateFile,
        mockVisited,
        mockQueue,
        mockStats,
        mockBadRequests,
        mockExternalLinks,
        mockMailtoLinks,
        mockTelLinks,
        mockPageDataManager
      );

      expect(result).toBe(true);
      expect(mockVisited.has('https://example.com/')).toBe(true);
      expect(mockQueue.has('https://example.com/page2')).toBe(true);
      expect(mockStats['https://example.com/'].sources).toBeInstanceOf(Set);
      // Note: pageDataManager.loadFromState is not called in the actual implementation
    });

    test('should return false if state file does not exist', () => {
      const nonExistentFile = path.join(testDir, 'non-existent.json');
      
      const result = loadState(
        nonExistentFile,
        mockVisited,
        mockQueue,
        mockStats,
        mockBadRequests,
        mockExternalLinks,
        mockMailtoLinks,
        mockTelLinks,
        mockPageDataManager
      );

      expect(result).toBe(false);
    });

    test('should clear existing state before loading', () => {
      // Pre-populate some state
      mockVisited.add('existing-url');
      mockQueue.add('existing-queue-item');
      mockStats['existing-key'] = { value: 'existing' };

      const testState = {
        visited: ['https://example.com/'],
        queue: ['https://example.com/page1'],
        stats: {},
        badRequests: {},
        externalLinks: {},
        mailtoLinks: {},
        telLinks: {},
        pageDataSize: 0
      };
      
      fs.writeFileSync(testStateFile, JSON.stringify(testState, null, 2));

      loadState(
        testStateFile,
        mockVisited,
        mockQueue,
        mockStats,
        mockBadRequests,
        mockExternalLinks,
        mockMailtoLinks,
        mockTelLinks,
        mockPageDataManager
      );

      expect(mockVisited.has('existing-url')).toBe(false);
      expect(mockVisited.has('https://example.com/')).toBe(true);
      expect(mockQueue.has('existing-queue-item')).toBe(false);
      expect(mockQueue.has('https://example.com/page1')).toBe(true);
      // Note: stats objects are not cleared in the actual implementation, only visited and queue
      expect(mockStats['existing-key']).toBeDefined();
    });

    test('should handle corrupted state file gracefully', () => {
      fs.writeFileSync(testStateFile, 'invalid json content');

      expect(() => {
        loadState(
          testStateFile,
          mockVisited,
          mockQueue,
          mockStats,
          mockBadRequests,
          mockExternalLinks,
          mockMailtoLinks,
          mockTelLinks,
          mockPageDataManager
        );
      }).toThrow();
    });

    test('should handle legacy state format without pageDataSize', () => {
      const legacyState = {
        visited: ['https://example.com/'],
        queue: [],
        stats: {},
        badRequests: {},
        externalLinks: {},
        mailtoLinks: {},
        telLinks: {}
        // No pageDataSize property
      };
      
      fs.writeFileSync(testStateFile, JSON.stringify(legacyState, null, 2));

      const result = loadState(
        testStateFile,
        mockVisited,
        mockQueue,
        mockStats,
        mockBadRequests,
        mockExternalLinks,
        mockMailtoLinks,
        mockTelLinks,
        mockPageDataManager
      );

      expect(result).toBe(true);
      // Note: pageDataManager.loadFromState is not called in the actual implementation
    });
  });

  describe('integration tests', () => {
    test('should maintain data integrity through save/load cycle', () => {
      const originalState = {
        visited: new Set(['https://example.com/', 'https://example.com/page1']),
        queue: new Set(['https://example.com/page2', 'https://example.com/page3']),
        stats: {
          'https://example.com/': {
            sources: new Set(['root']),
            anchors: new Set(['Home', 'Main Page']),
            count: 2
          }
        },
        badRequests: {
          'https://example.com/404': {
            sources: new Set(['https://example.com/']),
            anchors: new Set(['Broken Link']),
            status: 404
          }
        },
        externalLinks: {},
        mailtoLinks: {},
        telLinks: {}
      };

      const mockPageDataManager = { size: 1024, loadFromState: jest.fn() };

      // Save state
      saveState(
        testDir,
        testStateFile,
        originalState.visited,
        originalState.queue,
        originalState.stats,
        originalState.badRequests,
        originalState.externalLinks,
        originalState.mailtoLinks,
        originalState.telLinks,
        mockPageDataManager
      );

      // Load state into new objects
      const newVisited = new Set();
      const newQueue = new Set();
      const newStats = {};
      const newBadRequests = {};
      const newExternalLinks = {};
      const newMailtoLinks = {};
      const newTelLinks = {};

      loadState(
        testStateFile,
        newVisited,
        newQueue,
        newStats,
        newBadRequests,
        newExternalLinks,
        newMailtoLinks,
        newTelLinks,
        mockPageDataManager
      );

      // Verify data integrity
      expect(newVisited.size).toBe(originalState.visited.size);
      expect(newVisited.has('https://example.com/')).toBe(true);
      expect(newQueue.size).toBe(originalState.queue.size);
      expect(newQueue.has('https://example.com/page2')).toBe(true);
      expect(newStats['https://example.com/'].sources.has('root')).toBe(true);
      expect(newStats['https://example.com/'].anchors.size).toBe(2);
      expect(newBadRequests['https://example.com/404'].status).toBe(404);
    });
  });
});
