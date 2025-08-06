/**
 * Basic Integration Test
 * Tests that validate the integration between components
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import TestHelpers from '../helpers/TestHelpers.js';

describe('Integration Test Infrastructure', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Cleanup after each test
    await TestHelpers.cleanupTempFiles();
  });

  describe('File System Integration', () => {
    test('can create and read temporary files', async () => {
      const content = 'Test file content';
      const filePath = await TestHelpers.createTempFile(content, 'test.txt');
      
      expect(filePath).toContain('test.txt');
      
      // Verify file was created
      const fs = await import('fs/promises');
      const readContent = await fs.readFile(filePath, 'utf-8');
      expect(readContent).toBe(content);
    });

    test('cleanup removes temporary files', async () => {
      const filePath = await TestHelpers.createTempFile('test', 'cleanup-test.txt');
      
      // Verify file exists
      const fs = await import('fs/promises');
      await expect(fs.access(filePath)).resolves.toBeUndefined();
      
      // Cleanup and verify file is removed
      await TestHelpers.cleanupTempFiles();
      await expect(fs.access(filePath)).rejects.toThrow();
    });
  });

  describe('Async Operations', () => {
    test('wait helper works correctly', async () => {
      const startTime = Date.now();
      await TestHelpers.sleep(100);
      const duration = Date.now() - startTime;
      
      expect(duration).toBeGreaterThanOrEqual(90);
      expect(duration).toBeLessThan(150);
    });

    test('waitForCondition resolves when condition is met', async () => {
      let counter = 0;
      const condition = () => {
        counter++;
        return counter >= 3;
      };
      
      const startTime = Date.now();
      await TestHelpers.waitForCondition(condition, 1000, 50);
      const duration = Date.now() - startTime;
      
      expect(counter).toBe(3);
      expect(duration).toBeLessThan(500);
    });

    test('waitForCondition times out when condition is not met', async () => {
      const condition = () => false;
      
      await expect(
        TestHelpers.waitForCondition(condition, 200, 50)
      ).rejects.toThrow('Condition not met within 200ms');
    });
  });

  describe('Mock Integration', () => {
    test('fetch mocking works with URL mapping', () => {
      const mockResponses = {
        'https://example.com': {
          data: { title: 'Example' },
          status: 200
        },
        'https://error.com': {
          data: 'Not Found',
          status: 404
        }
      };
      
      const mockFetch = TestHelpers.mockFetch(mockResponses);
      
      expect(global.fetch).toBe(mockFetch);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    test('mocked fetch returns correct responses', async () => {
      TestHelpers.mockFetch({
        'https://test.com': {
          data: { success: true },
          status: 200
        }
      });
      
      const response = await fetch('https://test.com');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
    });
  });

  describe('Error Handling', () => {
    test('handles invalid data type in generateRandomData', () => {
      expect(() => {
        TestHelpers.generateRandomData('invalid-type');
      }).toThrow('Unknown data type: invalid-type');
    });

    test('handles file operation errors gracefully', async () => {
      // Try to create file in non-existent directory
      await expect(
        TestHelpers.createTempFile('test', '/non/existent/path/file.txt')
      ).rejects.toThrow();
    });
  });

  describe('Performance Validation', () => {
    test('performance validation catches slow operations', () => {
      const slowStartTime = Date.now() - 1500;
      
      // This should log a warning but not throw
      expect(() => {
        TestHelpers.validatePerformance(slowStartTime, 1000, 'slow-test');
      }).not.toThrow();
    });

    test('performance validation passes for fast operations', () => {
      const fastStartTime = Date.now() - 100;
      
      const duration = TestHelpers.validatePerformance(fastStartTime, 1000, 'fast-test');
      expect(duration).toBeLessThan(200);
    });
  });
});
