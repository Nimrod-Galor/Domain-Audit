/**
 * @jest-environment node
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NetworkManager } from '../../src/network/network-manager.js';

// Mock fetch globally
global.fetch = jest.fn();

describe('NetworkManager Tests', () => {
  let networkManager;
  
  beforeEach(() => {
    networkManager = new NetworkManager();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Constructor', () => {
    test('should initialize with default configuration', () => {
      const manager = new NetworkManager();
      expect(manager.config).toBeDefined();
      expect(manager.retryAttempts).toBeDefined();
      expect(manager.timeout).toBeDefined();
    });

    test('should initialize with custom configuration', () => {
      const customConfig = {
        timeout: 10000,
        retryAttempts: 5,
        userAgent: 'Custom Bot/1.0',
        enableCompression: false
      };
      const manager = new NetworkManager(customConfig);
      expect(manager.timeout).toBe(10000);
      expect(manager.retryAttempts).toBe(5);
      expect(manager.config.userAgent).toBe('Custom Bot/1.0');
      expect(manager.config.enableCompression).toBe(false);
    });
  });

  describe('makeRequest', () => {
    test('should make successful HTTP request', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map([
          ['content-type', 'text/html'],
          ['content-length', '1024']
        ]),
        text: jest.fn().resolve('<html><body>Test</body></html>')
      };
      
      global.fetch.mockResolvedValue(mockResponse);
      
      const result = await networkManager.makeRequest('https://example.com');
      
      expect(result).toBeDefined();
      expect(result.status).toBe(200);
      expect(result.headers).toBeDefined();
      expect(result.body).toBe('<html><body>Test</body></html>');
    });

    test('should handle HTTP errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Map()
      };
      
      global.fetch.mockResolvedValue(mockResponse);
      
      const result = await networkManager.makeRequest('https://example.com/notfound');
      
      expect(result.status).toBe(404);
      expect(result.error).toBeDefined();
    });

    test('should retry failed requests', async () => {
      const manager = new NetworkManager({ retryAttempts: 3 });
      
      // Mock first two calls to fail, third to succeed
      global.fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Map(),
          text: jest.fn().resolve('Success')
        });
      
      const result = await manager.makeRequest('https://example.com');
      
      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(result.status).toBe(200);
    });

    test('should respect timeout configuration', async () => {
      const manager = new NetworkManager({ timeout: 100 });
      
      // Mock a request that takes longer than timeout
      global.fetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 200))
      );
      
      const result = await manager.makeRequest('https://slow-site.com');
      
      expect(result.error).toBeDefined();
      expect(result.error.includes('timeout')).toBe(true);
    });

    test('should include proper headers in request', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map(),
        text: jest.fn().resolve('OK')
      };
      
      global.fetch.mockResolvedValue(mockResponse);
      
      await networkManager.makeRequest('https://example.com');
      
      const [url, options] = global.fetch.mock.calls[0];
      expect(options.headers['User-Agent']).toBeDefined();
      expect(options.headers['Accept']).toBeDefined();
    });
  });

  describe('analyzeNetworkPerformance', () => {
    test('should analyze request timing and performance', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map([
          ['content-type', 'text/html'],
          ['content-encoding', 'gzip'],
          ['cache-control', 'max-age=3600']
        ]),
        text: jest.fn().resolve('<html>Content</html>')
      };
      
      global.fetch.mockResolvedValue(mockResponse);
      
      const analysis = await networkManager.analyzeNetworkPerformance('https://example.com');
      
      expect(analysis).toBeDefined();
      expect(analysis.responseTime).toBeGreaterThan(0);
      expect(analysis.contentSize).toBeGreaterThan(0);
      expect(analysis.compression).toBeDefined();
      expect(analysis.caching).toBeDefined();
    });

    test('should detect compression usage', async () => {
      const compressedResponse = {
        ok: true,
        status: 200,
        headers: new Map([
          ['content-encoding', 'gzip'],
          ['content-type', 'text/html']
        ]),
        text: jest.fn().resolve('<html>Compressed content</html>')
      };
      
      global.fetch.mockResolvedValue(compressedResponse);
      
      const analysis = await networkManager.analyzeNetworkPerformance('https://example.com');
      
      expect(analysis.compression.enabled).toBe(true);
      expect(analysis.compression.type).toBe('gzip');
    });

    test('should analyze caching headers', async () => {
      const cachedResponse = {
        ok: true,
        status: 200,
        headers: new Map([
          ['cache-control', 'public, max-age=86400'],
          ['etag', '"abc123"'],
          ['last-modified', 'Wed, 01 Jan 2024 00:00:00 GMT']
        ]),
        text: jest.fn().resolve('<html>Cached content</html>')
      };
      
      global.fetch.mockResolvedValue(cachedResponse);
      
      const analysis = await networkManager.analyzeNetworkPerformance('https://example.com');
      
      expect(analysis.caching.enabled).toBe(true);
      expect(analysis.caching.maxAge).toBe(86400);
      expect(analysis.caching.hasETag).toBe(true);
      expect(analysis.caching.hasLastModified).toBe(true);
    });
  });

  describe('checkRedirects', () => {
    test('should follow and analyze redirect chains', async () => {
      // Mock redirect chain: example.com -> www.example.com -> https://www.example.com
      global.fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 301,
          headers: new Map([['location', 'https://www.example.com']]),
          url: 'https://example.com'
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Map(),
          text: jest.fn().resolve('<html>Final content</html>'),
          url: 'https://www.example.com'
        });
      
      const redirectAnalysis = await networkManager.checkRedirects('https://example.com');
      
      expect(redirectAnalysis.redirectCount).toBeGreaterThan(0);
      expect(redirectAnalysis.finalUrl).toBe('https://www.example.com');
      expect(redirectAnalysis.redirectChain).toBeDefined();
      expect(Array.isArray(redirectAnalysis.redirectChain)).toBe(true);
    });

    test('should detect redirect loops', async () => {
      const manager = new NetworkManager({ maxRedirects: 5 });
      
      // Mock a redirect loop
      global.fetch.mockResolvedValue({
        ok: false,
        status: 302,
        headers: new Map([['location', 'https://example.com/loop']]),
        url: 'https://example.com/loop'
      });
      
      const redirectAnalysis = await manager.checkRedirects('https://example.com/loop');
      
      expect(redirectAnalysis.hasLoop).toBe(true);
      expect(redirectAnalysis.error).toBeDefined();
    });

    test('should handle missing location headers', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 301,
        headers: new Map(), // Missing location header
        url: 'https://example.com'
      });
      
      const redirectAnalysis = await networkManager.checkRedirects('https://example.com');
      
      expect(redirectAnalysis.error).toBeDefined();
      expect(redirectAnalysis.redirectCount).toBe(0);
    });
  });

  describe('analyzeSecurityHeaders', () => {
    test('should analyze security-related headers', async () => {
      const secureResponse = {
        ok: true,
        status: 200,
        headers: new Map([
          ['strict-transport-security', 'max-age=31536000; includeSubDomains'],
          ['content-security-policy', "default-src 'self'; script-src 'self' 'unsafe-inline'"],
          ['x-frame-options', 'DENY'],
          ['x-content-type-options', 'nosniff'],
          ['referrer-policy', 'strict-origin-when-cross-origin']
        ]),
        text: jest.fn().resolve('<html>Secure content</html>')
      };
      
      global.fetch.mockResolvedValue(secureResponse);
      
      const securityAnalysis = await networkManager.analyzeSecurityHeaders('https://secure-site.com');
      
      expect(securityAnalysis.hsts.present).toBe(true);
      expect(securityAnalysis.hsts.maxAge).toBe(31536000);
      expect(securityAnalysis.csp.present).toBe(true);
      expect(securityAnalysis.frameOptions.present).toBe(true);
      expect(securityAnalysis.contentTypeOptions.present).toBe(true);
      expect(securityAnalysis.referrerPolicy.present).toBe(true);
    });

    test('should identify missing security headers', async () => {
      const insecureResponse = {
        ok: true,
        status: 200,
        headers: new Map([
          ['content-type', 'text/html']
        ]),
        text: jest.fn().resolve('<html>Insecure content</html>')
      };
      
      global.fetch.mockResolvedValue(insecureResponse);
      
      const securityAnalysis = await networkManager.analyzeSecurityHeaders('https://example.com');
      
      expect(securityAnalysis.hsts.present).toBe(false);
      expect(securityAnalysis.csp.present).toBe(false);
      expect(securityAnalysis.frameOptions.present).toBe(false);
      expect(securityAnalysis.score).toBeLessThan(50);
    });

    test('should calculate security score based on headers', async () => {
      const partialSecurityResponse = {
        ok: true,
        status: 200,
        headers: new Map([
          ['strict-transport-security', 'max-age=31536000'],
          ['x-frame-options', 'SAMEORIGIN']
        ]),
        text: jest.fn().resolve('<html>Partial security</html>')
      };
      
      global.fetch.mockResolvedValue(partialSecurityResponse);
      
      const securityAnalysis = await networkManager.analyzeSecurityHeaders('https://example.com');
      
      expect(securityAnalysis.score).toBeGreaterThan(0);
      expect(securityAnalysis.score).toBeLessThan(100);
      expect(securityAnalysis.recommendations).toBeDefined();
      expect(Array.isArray(securityAnalysis.recommendations)).toBe(true);
    });
  });

  describe('detectTechnologies', () => {
    test('should detect web technologies from headers', async () => {
      const techResponse = {
        ok: true,
        status: 200,
        headers: new Map([
          ['server', 'nginx/1.18.0'],
          ['x-powered-by', 'Express'],
          ['x-generator', 'WordPress 6.1'],
          ['set-cookie', 'PHPSESSID=abc123; path=/']
        ]),
        text: jest.fn().resolve(`
          <html>
            <head>
              <meta name="generator" content="Drupal 9">
              <script src="jquery-3.6.0.min.js"></script>
              <link rel="stylesheet" href="bootstrap.min.css">
            </head>
            <body>Content</body>
          </html>
        `)
      };
      
      global.fetch.mockResolvedValue(techResponse);
      
      const techAnalysis = await networkManager.detectTechnologies('https://example.com');
      
      expect(techAnalysis.server).toContain('nginx');
      expect(techAnalysis.frameworks).toBeDefined();
      expect(techAnalysis.cms).toBeDefined();
      expect(techAnalysis.libraries).toBeDefined();
    });

    test('should detect technologies from HTML content', async () => {
      const htmlWithTech = {
        ok: true,
        status: 200,
        headers: new Map(),
        text: jest.fn().resolve(`
          <html>
            <head>
              <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
              </script>
              <script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            </head>
            <body>
              <div id="root"></div>
              <script>
                // jQuery usage detected
                $(document).ready(function() {});
              </script>
            </body>
          </html>
        `)
      };
      
      global.fetch.mockResolvedValue(htmlWithTech);
      
      const techAnalysis = await networkManager.detectTechnologies('https://example.com');
      
      expect(techAnalysis.analytics).toContain('Google Analytics');
      expect(techAnalysis.libraries).toContain('React');
      expect(techAnalysis.cssFrameworks).toContain('Tailwind CSS');
    });
  });

  describe('measureLatency', () => {
    test('should measure network latency accurately', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map(),
        text: jest.fn().resolve('OK')
      };
      
      global.fetch.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve(mockResponse), 100)
        )
      );
      
      const latency = await networkManager.measureLatency('https://example.com');
      
      expect(latency).toBeGreaterThan(90); // Allow some tolerance
      expect(latency).toBeLessThan(200);
    });

    test('should handle latency measurement errors', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      
      const latency = await networkManager.measureLatency('https://invalid-url.com');
      
      expect(latency).toBe(-1); // Error indicator
    });
  });

  describe('analyzeDownloadSpeed', () => {
    test('should calculate download speed', async () => {
      const largeContent = 'x'.repeat(100000); // 100KB
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map([['content-length', '100000']]),
        text: jest.fn().resolve(largeContent)
      };
      
      global.fetch.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve(mockResponse), 500) // 500ms download
        )
      );
      
      const speedAnalysis = await networkManager.analyzeDownloadSpeed('https://example.com/largefile');
      
      expect(speedAnalysis.bytesDownloaded).toBe(100000);
      expect(speedAnalysis.downloadTime).toBeGreaterThan(400);
      expect(speedAnalysis.speedKbps).toBeGreaterThan(0);
    });

    test('should handle speed calculation for small files', async () => {
      const smallContent = 'small';
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map([['content-length', '5']]),
        text: jest.fn().resolve(smallContent)
      };
      
      global.fetch.mockResolvedValue(mockResponse);
      
      const speedAnalysis = await networkManager.analyzeDownloadSpeed('https://example.com/small');
      
      expect(speedAnalysis.bytesDownloaded).toBe(5);
      expect(speedAnalysis.speedKbps).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle network timeouts gracefully', async () => {
      const manager = new NetworkManager({ timeout: 100 });
      
      global.fetch.mockImplementation(() => 
        new Promise(() => {}) // Never resolves (timeout scenario)
      );
      
      const result = await manager.makeRequest('https://timeout-site.com');
      
      expect(result.error).toBeDefined();
      expect(result.status).toBe(0);
    });

    test('should handle malformed URLs', async () => {
      const result = await networkManager.makeRequest('not-a-valid-url');
      
      expect(result.error).toBeDefined();
      expect(result.status).toBe(0);
    });

    test('should handle empty responses', async () => {
      const emptyResponse = {
        ok: true,
        status: 204, // No content
        headers: new Map(),
        text: jest.fn().resolve('')
      };
      
      global.fetch.mockResolvedValue(emptyResponse);
      
      const result = await networkManager.makeRequest('https://example.com/empty');
      
      expect(result.status).toBe(204);
      expect(result.body).toBe('');
    });

    test('should handle concurrent requests efficiently', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map(),
        text: jest.fn().resolve('Concurrent response')
      };
      
      global.fetch.mockResolvedValue(mockResponse);
      
      const urls = [
        'https://example.com/1',
        'https://example.com/2',
        'https://example.com/3',
        'https://example.com/4',
        'https://example.com/5'
      ];
      
      const promises = urls.map(url => networkManager.makeRequest(url));
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      expect(results.every(r => r.status === 200)).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(5);
    });

    test('should respect rate limiting', async () => {
      const manager = new NetworkManager({ requestDelay: 100 });
      
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map(),
        text: jest.fn().resolve('Rate limited response')
      };
      
      global.fetch.mockResolvedValue(mockResponse);
      
      const startTime = Date.now();
      
      await manager.makeRequest('https://example.com/1');
      await manager.makeRequest('https://example.com/2');
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeGreaterThan(100); // Should have delay
    });

    test('should handle very large responses', async () => {
      const largeContent = 'x'.repeat(10000000); // 10MB
      const largeResponse = {
        ok: true,
        status: 200,
        headers: new Map([['content-length', '10000000']]),
        text: jest.fn().resolve(largeContent)
      };
      
      global.fetch.mockResolvedValue(largeResponse);
      
      const result = await networkManager.makeRequest('https://example.com/large');
      
      expect(result.status).toBe(200);
      expect(result.body.length).toBe(10000000);
    });
  });

  describe('DNS and Connection Analysis', () => {
    test('should analyze DNS resolution time', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map(),
        text: jest.fn().resolve('DNS test')
      };
      
      global.fetch.mockResolvedValue(mockResponse);
      
      const dnsAnalysis = await networkManager.analyzeDNS('https://example.com');
      
      expect(dnsAnalysis).toBeDefined();
      expect(dnsAnalysis.resolutionTime).toBeGreaterThanOrEqual(0);
    });

    test('should detect connection types and protocols', async () => {
      const http2Response = {
        ok: true,
        status: 200,
        headers: new Map([
          ['content-type', 'text/html'],
          ['server', 'nginx/1.18.0']
        ]),
        text: jest.fn().resolve('<html>HTTP/2 content</html>')
      };
      
      global.fetch.mockResolvedValue(http2Response);
      
      const connectionAnalysis = await networkManager.analyzeConnection('https://example.com');
      
      expect(connectionAnalysis.protocol).toBeDefined();
      expect(connectionAnalysis.connectionType).toBeDefined();
    });
  });
});
