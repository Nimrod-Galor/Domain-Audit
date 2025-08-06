import { jest } from '@jest/globals';
import { PerformanceAnalyzer } from '../../../src/analyzers/performance-analyzer.js';
import { TestHelpers } from '../../helpers/TestHelpers.js';

describe('PerformanceAnalyzer', () => {
  let performanceAnalyzer;
  let mockDocument;

  beforeEach(() => {
    performanceAnalyzer = new PerformanceAnalyzer();
    mockDocument = TestHelpers.createMockDocument();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('analyze', () => {
    test('should analyze Core Web Vitals metrics', async () => {
      const mockData = {
        document: mockDocument,
        url: 'https://example.com',
        performance: {
          timing: {
            loadEventEnd: 2500,
            domContentLoadedEventEnd: 1800,
            responseStart: 300,
            responseEnd: 600
          },
          coreWebVitals: {
            lcp: 2100, // Largest Contentful Paint
            fid: 80,   // First Input Delay
            cls: 0.05  // Cumulative Layout Shift
          }
        }
      };

      const result = await performanceAnalyzer.analyze(mockData);

      expect(result.coreWebVitals).toHaveProperty('lcp');
      expect(result.coreWebVitals).toHaveProperty('fid');
      expect(result.coreWebVitals).toHaveProperty('cls');
      expect(result.coreWebVitals.lcp.value).toBe(2100);
      expect(result.coreWebVitals.lcp.rating).toBe('good'); // < 2500ms
      expect(result.coreWebVitals.fid.value).toBe(80);
      expect(result.coreWebVitals.fid.rating).toBe('good'); // < 100ms
      expect(result.coreWebVitals.cls.value).toBe(0.05);
      expect(result.coreWebVitals.cls.rating).toBe('good'); // < 0.1
    });

    test('should evaluate loading performance metrics', async () => {
      const mockData = {
        document: mockDocument,
        url: 'https://example.com',
        performance: {
          timing: {
            navigationStart: 0,
            fetchStart: 10,
            domainLookupStart: 15,
            domainLookupEnd: 45,
            connectStart: 50,
            connectEnd: 150,
            requestStart: 160,
            responseStart: 300,
            responseEnd: 600,
            domLoading: 610,
            domInteractive: 1200,
            domContentLoadedEventStart: 1500,
            domContentLoadedEventEnd: 1800,
            domComplete: 2200,
            loadEventStart: 2250,
            loadEventEnd: 2500
          }
        }
      };

      const result = await performanceAnalyzer.analyze(mockData);

      expect(result.loadingMetrics).toHaveProperty('ttfb'); // Time to First Byte
      expect(result.loadingMetrics).toHaveProperty('domContentLoaded');
      expect(result.loadingMetrics).toHaveProperty('loadComplete');
      expect(result.loadingMetrics.ttfb).toBe(300); // responseStart
      expect(result.loadingMetrics.domContentLoaded).toBe(1800);
      expect(result.loadingMetrics.loadComplete).toBe(2500);
    });

    test('should analyze resource loading performance', async () => {
      const mockData = {
        document: mockDocument,
        url: 'https://example.com',
        resources: [
          {
            name: 'https://example.com/styles.css',
            entryType: 'resource',
            startTime: 100,
            responseEnd: 350,
            transferSize: 25000,
            decodedBodySize: 80000
          },
          {
            name: 'https://example.com/script.js',
            entryType: 'resource',
            startTime: 200,
            responseEnd: 800,
            transferSize: 45000,
            decodedBodySize: 120000
          },
          {
            name: 'https://example.com/image.jpg',
            entryType: 'resource',
            startTime: 300,
            responseEnd: 1200,
            transferSize: 150000,
            decodedBodySize: 150000
          }
        ]
      };

      const result = await performanceAnalyzer.analyze(mockData);

      expect(result.resources).toHaveProperty('total');
      expect(result.resources).toHaveProperty('css');
      expect(result.resources).toHaveProperty('javascript');
      expect(result.resources).toHaveProperty('images');
      expect(result.resources.total.count).toBe(3);
      expect(result.resources.total.totalSize).toBe(220000);
      expect(result.resources.css.count).toBe(1);
      expect(result.resources.javascript.count).toBe(1);
      expect(result.resources.images.count).toBe(1);
    });

    test('should detect render-blocking resources', async () => {
      const mockData = {
        document: mockDocument,
        url: 'https://example.com',
        html: `
          <html>
            <head>
              <link rel="stylesheet" href="critical.css">
              <link rel="stylesheet" href="non-critical.css" media="print">
              <script src="blocking-script.js"></script>
              <script src="async-script.js" async></script>
              <script src="defer-script.js" defer></script>
            </head>
            <body></body>
          </html>
        `
      };

      const result = await performanceAnalyzer.analyze(mockData);

      expect(result.renderBlocking).toHaveProperty('css');
      expect(result.renderBlocking).toHaveProperty('javascript');
      expect(result.renderBlocking.css.blocking).toBe(1);
      expect(result.renderBlocking.css.nonBlocking).toBe(1);
      expect(result.renderBlocking.javascript.blocking).toBe(1);
      expect(result.renderBlocking.javascript.async).toBe(1);
      expect(result.renderBlocking.javascript.defer).toBe(1);
    });

    test('should evaluate image optimization', async () => {
      const mockData = {
        document: mockDocument,
        url: 'https://example.com',
        html: `
          <html>
            <body>
              <img src="large-image.jpg" width="300" height="200">
              <img src="webp-image.webp" width="300" height="200">
              <img src="unoptimized.png" width="100" height="100">
              <picture>
                <source srcset="modern.webp" type="image/webp">
                <img src="fallback.jpg" alt="Modern image">
              </picture>
            </body>
          </html>
        `,
        images: [
          {
            src: 'large-image.jpg',
            naturalWidth: 2000,
            naturalHeight: 1500,
            fileSize: 800000,
            format: 'jpeg'
          },
          {
            src: 'webp-image.webp',
            naturalWidth: 300,
            naturalHeight: 200,
            fileSize: 15000,
            format: 'webp'
          },
          {
            src: 'unoptimized.png',
            naturalWidth: 1000,
            naturalHeight: 1000,
            fileSize: 500000,
            format: 'png'
          }
        ]
      };

      const result = await performanceAnalyzer.analyze(mockData);

      expect(result.images).toHaveProperty('total');
      expect(result.images).toHaveProperty('optimized');
      expect(result.images).toHaveProperty('oversized');
      expect(result.images.total).toBe(4); // Including picture element
      expect(result.images.modernFormat).toBe(1); // WebP image
      expect(result.images.oversized).toBeGreaterThan(0);
    });

    test('should analyze caching strategies', async () => {
      const mockData = {
        document: mockDocument,
        url: 'https://example.com',
        headers: {
          'cache-control': 'public, max-age=31536000',
          'etag': '"abc123"',
          'last-modified': 'Wed, 21 Oct 2023 07:28:00 GMT'
        },
        resources: [
          {
            name: 'styles.css',
            headers: {
              'cache-control': 'public, max-age=86400'
            }
          },
          {
            name: 'script.js',
            headers: {
              'cache-control': 'no-cache'
            }
          }
        ]
      };

      const result = await performanceAnalyzer.analyze(mockData);

      expect(result.caching).toHaveProperty('mainResource');
      expect(result.caching).toHaveProperty('staticResources');
      expect(result.caching.mainResource.cacheControl).toBe('public, max-age=31536000');
      expect(result.caching.mainResource.score).toBeGreaterThan(80);
      expect(result.caching.staticResources.cached).toBe(1);
      expect(result.caching.staticResources.uncached).toBe(1);
    });

    test('should detect performance opportunities', async () => {
      const mockData = {
        document: mockDocument,
        url: 'https://example.com',
        performance: {
          timing: {
            loadEventEnd: 5000, // Slow loading
            domContentLoadedEventEnd: 3000
          },
          coreWebVitals: {
            lcp: 4000, // Poor LCP
            fid: 200,  // Poor FID
            cls: 0.25  // Poor CLS
          }
        },
        resources: [
          {
            name: 'large-script.js',
            transferSize: 500000, // Large JavaScript
            responseEnd: 2000
          }
        ]
      };

      const result = await performanceAnalyzer.analyze(mockData);

      expect(result.opportunities).toContainEqual(
        expect.objectContaining({
          type: 'improvement',
          category: 'loading',
          message: expect.stringContaining('slow page load')
        })
      );
      expect(result.opportunities).toContainEqual(
        expect.objectContaining({
          type: 'improvement',
          category: 'core-web-vitals',
          message: expect.stringContaining('Largest Contentful Paint')
        })
      );
    });

    test('should calculate performance score', async () => {
      const goodPerformanceData = {
        document: mockDocument,
        url: 'https://example.com',
        performance: {
          timing: {
            loadEventEnd: 1500,
            domContentLoadedEventEnd: 1000,
            responseStart: 200
          },
          coreWebVitals: {
            lcp: 1800,
            fid: 50,
            cls: 0.02
          }
        },
        resources: [
          {
            name: 'optimized.css',
            transferSize: 15000,
            headers: { 'cache-control': 'max-age=86400' }
          }
        ]
      };

      const result = await performanceAnalyzer.analyze(goodPerformanceData);

      expect(result.score).toBeGreaterThan(80);
      expect(result.grade).toBe('A');
    });

    test('should handle mobile performance considerations', async () => {
      const mockData = {
        document: mockDocument,
        url: 'https://example.com',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        connection: {
          effectiveType: '3g',
          downlink: 1.5,
          rtt: 200
        },
        performance: {
          timing: {
            loadEventEnd: 3000,
            responseStart: 800
          }
        }
      };

      const result = await performanceAnalyzer.analyze(mockData);

      expect(result.mobile).toHaveProperty('detected');
      expect(result.mobile).toHaveProperty('connectionType');
      expect(result.mobile.detected).toBe(true);
      expect(result.mobile.connectionType).toBe('3g');
      expect(result.mobile.recommendations).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('mobile optimization')
        })
      );
    });
  });

  describe('error handling', () => {
    test('should handle missing performance data gracefully', async () => {
      const mockData = {
        document: mockDocument,
        url: 'https://example.com'
      };

      const result = await performanceAnalyzer.analyze(mockData);

      expect(result.performance).toEqual({
        available: false,
        message: 'Performance data not available'
      });
      expect(result.score).toBeLessThan(50); // Lower score without performance data
    });

    test('should handle invalid performance entries', async () => {
      const mockData = {
        document: mockDocument,
        url: 'https://example.com',
        performance: {
          timing: {
            loadEventEnd: 'invalid', // Invalid value
            domContentLoadedEventEnd: -100 // Negative value
          }
        }
      };

      const result = await performanceAnalyzer.analyze(mockData);

      expect(result.loadingMetrics.errors).toContainEqual(
        expect.objectContaining({
          type: 'error',
          message: expect.stringContaining('Invalid performance data')
        })
      );
    });
  });

  describe('performance', () => {
    test('should complete analysis within time limit', async () => {
      const startTime = Date.now();
      
      const largeResourceList = Array(100).fill().map((_, i) => ({
        name: `resource-${i}.js`,
        entryType: 'resource',
        startTime: i * 10,
        responseEnd: i * 10 + 100,
        transferSize: 10000
      }));

      const mockData = {
        document: mockDocument,
        url: 'https://example.com',
        performance: {
          timing: {
            loadEventEnd: 2000,
            domContentLoadedEventEnd: 1500
          }
        },
        resources: largeResourceList
      };

      await performanceAnalyzer.analyze(mockData);
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });
});
