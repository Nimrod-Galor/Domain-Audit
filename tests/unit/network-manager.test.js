// Unit tests for Network Manager
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { 
  NetworkManager,
  ConnectionPool,
  RequestQueue,
  RateLimiter,
  NetworkMetrics
} from '../../src/network/network-manager.js';

// Mock fetch for testing
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Network Manager', () => {
  let networkManager;

  beforeEach(() => {
    networkManager = new NetworkManager({
      maxConcurrent: 5,
      requestDelay: 100,
      retryAttempts: 3,
      timeout: 5000
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    networkManager.destroy();
  });

  describe('basic request handling', () => {
    test('should make successful HTTP requests', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'text/html']]),
        text: () => Promise.resolve('<html><head><title>Test</title></head></html>'),
        blob: () => Promise.resolve(new Blob()),
        json: () => Promise.resolve({})
      };
      
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await networkManager.fetch('https://example.com');
      
      expect(result.status).toBe(200);
      expect(result.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('https://example.com', expect.any(Object));
    });

    test('should handle request with custom options', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map(),
        text: () => Promise.resolve(''),
        blob: () => Promise.resolve(new Blob()),
        json: () => Promise.resolve({})
      };
      
      mockFetch.mockResolvedValueOnce(mockResponse);

      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' })
      };

      await networkManager.fetch('https://example.com/api', options);
      
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/api', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({ test: 'data' })
      }));
    });

    test('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(networkManager.fetch('https://invalid-url.com'))
        .rejects.toThrow('Network error');
    });

    test('should handle HTTP error status codes', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Map(),
        text: () => Promise.resolve('Not Found'),
        blob: () => Promise.resolve(new Blob()),
        json: () => Promise.resolve({})
      };
      
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await networkManager.fetch('https://example.com/notfound');
      
      expect(result.status).toBe(404);
      expect(result.ok).toBe(false);
    });
  });

  describe('retry mechanism', () => {
    test('should retry failed requests', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Map(),
          text: () => Promise.resolve('success'),
          blob: () => Promise.resolve(new Blob()),
          json: () => Promise.resolve({})
        });

      const result = await networkManager.fetch('https://example.com');
      
      expect(result.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledTimes(3); // 2 failures + 1 success
    });

    test('should fail after max retry attempts', async () => {
      mockFetch.mockRejectedValue(new Error('Persistent network error'));

      await expect(networkManager.fetch('https://example.com'))
        .rejects.toThrow('Persistent network error');
      
      expect(mockFetch).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    test('should use exponential backoff for retries', async () => {
      const startTime = Date.now();
      
      mockFetch.mockRejectedValue(new Error('Network error'));

      try {
        await networkManager.fetch('https://example.com');
      } catch (error) {
        // Should have taken some time due to backoff delays
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeGreaterThan(100); // At least some delay
      }
    });
  });

  describe('rate limiting', () => {
    test('should respect rate limits', async () => {
      const rateLimiter = new RateLimiter({ requestsPerSecond: 2 });
      
      const startTime = Date.now();
      
      // Make 3 requests quickly
      const promises = [
        rateLimiter.acquire(),
        rateLimiter.acquire(),
        rateLimiter.acquire()
      ];
      
      await Promise.all(promises);
      
      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeGreaterThan(500); // Should take at least 500ms for 3 requests at 2/sec
    });

    test('should handle burst requests within limits', async () => {
      const rateLimiter = new RateLimiter({ 
        requestsPerSecond: 10,
        burstLimit: 5 
      });
      
      const startTime = Date.now();
      
      // Make 5 burst requests
      const promises = Array(5).fill().map(() => rateLimiter.acquire());
      await Promise.all(promises);
      
      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeLessThan(100); // Burst should be immediate
    });
  });

  describe('connection pooling', () => {
    test('should reuse connections for same domain', async () => {
      const pool = new ConnectionPool({ maxConnectionsPerHost: 3 });
      
      const conn1 = await pool.getConnection('https://example.com');
      const conn2 = await pool.getConnection('https://example.com');
      
      expect(conn1).toBe(conn2); // Should reuse same connection
    });

    test('should limit connections per host', async () => {
      const pool = new ConnectionPool({ maxConnectionsPerHost: 2 });
      
      const promises = Array(5).fill().map(() => 
        pool.getConnection('https://example.com')
      );
      
      const connections = await Promise.all(promises);
      const uniqueConnections = new Set(connections);
      
      expect(uniqueConnections.size).toBeLessThanOrEqual(2);
    });

    test('should create separate pools for different domains', async () => {
      const pool = new ConnectionPool({ maxConnectionsPerHost: 1 });
      
      const conn1 = await pool.getConnection('https://example.com');
      const conn2 = await pool.getConnection('https://other.com');
      
      expect(conn1).not.toBe(conn2); // Different domains should have different connections
    });
  });

  describe('request queue', () => {
    test('should queue requests when at concurrency limit', async () => {
      const queue = new RequestQueue({ maxConcurrent: 2 });
      
      let resolveCount = 0;
      const slowRequest = () => new Promise(resolve => {
        setTimeout(() => {
          resolveCount++;
          resolve(`result-${resolveCount}`);
        }, 100);
      });
      
      // Start 4 requests
      const promises = Array(4).fill().map(() => queue.add(slowRequest));
      
      // Wait a bit and check that only 2 are running
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(resolveCount).toBe(0); // None should be completed yet
      
      // Wait for all to complete
      const results = await Promise.all(promises);
      expect(results).toHaveLength(4);
      expect(resolveCount).toBe(4);
    });

    test('should prioritize requests correctly', async () => {
      const queue = new RequestQueue({ maxConcurrent: 1 });
      
      const results = [];
      const requests = [
        { fn: () => Promise.resolve('low'), priority: 1 },
        { fn: () => Promise.resolve('high'), priority: 10 },
        { fn: () => Promise.resolve('medium'), priority: 5 }
      ];
      
      const promises = requests.map(req => 
        queue.add(req.fn, { priority: req.priority })
          .then(result => results.push(result))
      );
      
      await Promise.all(promises);
      
      // High priority should execute first (after any currently running)
      expect(results[0]).toBe('high');
    });
  });

  describe('network metrics', () => {
    test('should track request metrics', async () => {
      const metrics = new NetworkMetrics();
      
      metrics.recordRequest('https://example.com', {
        startTime: 1000,
        endTime: 1200,
        size: 1024,
        status: 200
      });
      
      const stats = metrics.getStats();
      
      expect(stats.totalRequests).toBe(1);
      expect(stats.averageResponseTime).toBe(200);
      expect(stats.totalBytes).toBe(1024);
      expect(stats.successRate).toBe(1);
    });

    test('should calculate performance statistics', async () => {
      const metrics = new NetworkMetrics();
      
      // Record multiple requests
      metrics.recordRequest('https://example.com', {
        startTime: 1000, endTime: 1100, size: 500, status: 200
      });
      metrics.recordRequest('https://example.com', {
        startTime: 2000, endTime: 2300, size: 800, status: 200
      });
      metrics.recordRequest('https://example.com', {
        startTime: 3000, endTime: 3050, size: 200, status: 404
      });
      
      const stats = metrics.getStats();
      
      expect(stats.totalRequests).toBe(3);
      expect(stats.averageResponseTime).toBe((100 + 300 + 50) / 3);
      expect(stats.totalBytes).toBe(1500);
      expect(stats.successRate).toBe(2/3);
    });

    test('should track domain-specific metrics', async () => {
      const metrics = new NetworkMetrics();
      
      metrics.recordRequest('https://example.com', {
        startTime: 1000, endTime: 1100, size: 500, status: 200
      });
      metrics.recordRequest('https://other.com', {
        startTime: 2000, endTime: 2200, size: 300, status: 200
      });
      
      const domainStats = metrics.getDomainStats('example.com');
      
      expect(domainStats.totalRequests).toBe(1);
      expect(domainStats.averageResponseTime).toBe(100);
      expect(domainStats.totalBytes).toBe(500);
    });
  });

  describe('timeout handling', () => {
    test('should timeout long requests', async () => {
      const shortTimeoutManager = new NetworkManager({ timeout: 100 });
      
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 200))
      );
      
      await expect(shortTimeoutManager.fetch('https://example.com'))
        .rejects.toThrow(/timeout/i);
    });

    test('should not timeout fast requests', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map(),
        text: () => Promise.resolve('success'),
        blob: () => Promise.resolve(new Blob()),
        json: () => Promise.resolve({})
      };
      
      mockFetch.mockResolvedValueOnce(mockResponse);
      
      const result = await networkManager.fetch('https://example.com');
      expect(result.status).toBe(200);
    });
  });

  describe('error handling and edge cases', () => {
    test('should handle malformed URLs', async () => {
      await expect(networkManager.fetch('not-a-url'))
        .rejects.toThrow();
    });

    test('should handle empty responses', async () => {
      const mockResponse = {
        ok: true,
        status: 204, // No Content
        headers: new Map(),
        text: () => Promise.resolve(''),
        blob: () => Promise.resolve(new Blob()),
        json: () => Promise.resolve(null)
      };
      
      mockFetch.mockResolvedValueOnce(mockResponse);
      
      const result = await networkManager.fetch('https://example.com/empty');
      expect(result.status).toBe(204);
    });

    test('should handle connection cleanup on destroy', async () => {
      const manager = new NetworkManager();
      
      // Make some requests
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map(),
        text: () => Promise.resolve(''),
        blob: () => Promise.resolve(new Blob()),
        json: () => Promise.resolve({})
      });
      
      await manager.fetch('https://example.com');
      
      // Destroy should clean up resources
      expect(() => manager.destroy()).not.toThrow();
    });

    test('should handle concurrent request limits', async () => {
      const limitedManager = new NetworkManager({ maxConcurrent: 1 });
      
      let activeRequests = 0;
      let maxConcurrent = 0;
      
      mockFetch.mockImplementation(() => {
        activeRequests++;
        maxConcurrent = Math.max(maxConcurrent, activeRequests);
        
        return new Promise(resolve => {
          setTimeout(() => {
            activeRequests--;
            resolve({
              ok: true,
              status: 200,
              headers: new Map(),
              text: () => Promise.resolve(''),
              blob: () => Promise.resolve(new Blob()),
              json: () => Promise.resolve({})
            });
          }, 50);
        });
      });
      
      // Start multiple requests
      const promises = Array(5).fill().map(() => 
        limitedManager.fetch('https://example.com')
      );
      
      await Promise.all(promises);
      
      expect(maxConcurrent).toBe(1); // Should never exceed limit
    });
  });
});
