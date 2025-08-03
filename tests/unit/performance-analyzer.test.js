// Unit tests for Performance Analyzer
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { 
  PerformanceAnalyzer,
  CoreWebVitals,
  LoadTimeAnalyzer,
  ResourceAnalyzer,
  RenderingAnalyzer
} from '../../src/performance/performance-analyzer.js';

describe('Performance Analyzer', () => {
  let performanceAnalyzer;
  let mockPerformance;

  beforeEach(() => {
    // Mock performance API
    mockPerformance = {
      timing: {
        navigationStart: 1000,
        domainLookupStart: 1010,
        domainLookupEnd: 1050,
        connectStart: 1060,
        connectEnd: 1100,
        requestStart: 1110,
        responseStart: 1200,
        responseEnd: 1300,
        domLoading: 1310,
        domInteractive: 1500,
        domContentLoadedEventStart: 1600,
        domContentLoadedEventEnd: 1650,
        domComplete: 2000,
        loadEventStart: 2010,
        loadEventEnd: 2050
      },
      getEntriesByType: jest.fn(),
      getEntriesByName: jest.fn(),
      mark: jest.fn(),
      measure: jest.fn(),
      now: jest.fn(() => Date.now())
    };

    global.performance = mockPerformance;
    
    performanceAnalyzer = new PerformanceAnalyzer({
      enableCoreWebVitals: true,
      enableResourceTiming: true,
      enableUserTiming: true
    });
  });

  describe('Core Web Vitals', () => {
    test('should measure Largest Contentful Paint (LCP)', async () => {
      const mockLCPEntries = [{
        name: '',
        entryType: 'largest-contentful-paint',
        startTime: 1200,
        renderTime: 1200,
        loadTime: 1250,
        size: 50000,
        element: { tagName: 'IMG', src: 'image.jpg' }
      }];

      mockPerformance.getEntriesByType.mockReturnValue(mockLCPEntries);

      const coreWebVitals = new CoreWebVitals();
      const lcp = await coreWebVitals.measureLCP();

      expect(lcp.value).toBe(1200);
      expect(lcp.rating).toBe('good'); // LCP < 2.5s
      expect(lcp.element.tagName).toBe('IMG');
    });

    test('should measure First Input Delay (FID)', async () => {
      const mockFIDEntries = [{
        name: 'click',
        entryType: 'first-input',
        startTime: 1500,
        processingStart: 1510,
        processingEnd: 1520,
        duration: 20,
        target: { tagName: 'BUTTON' }
      }];

      mockPerformance.getEntriesByType.mockReturnValue(mockFIDEntries);

      const coreWebVitals = new CoreWebVitals();
      const fid = await coreWebVitals.measureFID();

      expect(fid.value).toBe(10); // processingStart - startTime
      expect(fid.rating).toBe('good'); // FID < 100ms
      expect(fid.eventType).toBe('click');
    });

    test('should measure Cumulative Layout Shift (CLS)', async () => {
      const mockCLSEntries = [
        {
          entryType: 'layout-shift',
          value: 0.1,
          hadRecentInput: false,
          startTime: 1000,
          sources: [{ node: { tagName: 'DIV' } }]
        },
        {
          entryType: 'layout-shift',
          value: 0.05,
          hadRecentInput: false,
          startTime: 1500,
          sources: [{ node: { tagName: 'IMG' } }]
        },
        {
          entryType: 'layout-shift',
          value: 0.2,
          hadRecentInput: true, // Should be ignored
          startTime: 2000,
          sources: []
        }
      ];

      mockPerformance.getEntriesByType.mockReturnValue(mockCLSEntries);

      const coreWebVitals = new CoreWebVitals();
      const cls = await coreWebVitals.measureCLS();

      expect(cls.value).toBe(0.15); // 0.1 + 0.05 (ignoring user input)
      expect(cls.rating).toBe('good'); // CLS < 0.25
      expect(cls.sources).toHaveLength(2);
    });

    test('should calculate comprehensive Core Web Vitals score', async () => {
      // Mock all CWV measurements
      const mockEntries = {
        'largest-contentful-paint': [{ startTime: 1800, renderTime: 1800 }],
        'first-input': [{ startTime: 1500, processingStart: 1580 }],
        'layout-shift': [{ value: 0.05, hadRecentInput: false }]
      };

      mockPerformance.getEntriesByType.mockImplementation(type => mockEntries[type] || []);

      const result = await performanceAnalyzer.analyzeCoreWebVitals();

      expect(result.lcp.rating).toBe('needs-improvement'); // 1.8s
      expect(result.fid.rating).toBe('good'); // 80ms
      expect(result.cls.rating).toBe('good'); // 0.05
      expect(result.overallScore).toBeGreaterThan(70);
    });
  });

  describe('Load Time Analysis', () => {
    test('should analyze navigation timing', async () => {
      const loadTimeAnalyzer = new LoadTimeAnalyzer();
      const timing = await loadTimeAnalyzer.analyzeNavigationTiming();

      expect(timing.dns).toBe(40); // domainLookupEnd - domainLookupStart
      expect(timing.tcp).toBe(40); // connectEnd - connectStart
      expect(timing.request).toBe(90); // responseStart - requestStart
      expect(timing.response).toBe(100); // responseEnd - responseStart
      expect(timing.dom).toBe(200); // domInteractive - domLoading
      expect(timing.load).toBe(40); // loadEventEnd - loadEventStart
      expect(timing.total).toBe(1050); // loadEventEnd - navigationStart
    });

    test('should identify performance bottlenecks', async () => {
      const loadTimeAnalyzer = new LoadTimeAnalyzer();
      const bottlenecks = await loadTimeAnalyzer.identifyBottlenecks();

      expect(bottlenecks).toContain('slow-response'); // 100ms response time
      expect(bottlenecks).toContain('slow-dom-processing'); // 200ms DOM processing
      expect(bottlenecks.length).toBeGreaterThan(0);
    });

    test('should calculate performance budget compliance', async () => {
      const budget = {
        totalLoadTime: 3000,
        firstContentfulPaint: 1500,
        timeToInteractive: 2000,
        totalSize: 2000000 // 2MB
      };

      const loadTimeAnalyzer = new LoadTimeAnalyzer();
      const compliance = await loadTimeAnalyzer.checkPerformanceBudget(budget);

      expect(compliance.totalLoadTime.passed).toBe(true); // 2050ms < 3000ms
      expect(compliance.overallCompliance).toBeGreaterThan(0.5);
    });
  });

  describe('Resource Analysis', () => {
    test('should analyze resource loading performance', async () => {
      const mockResourceEntries = [
        {
          name: 'https://example.com/style.css',
          entryType: 'resource',
          initiatorType: 'link',
          startTime: 100,
          responseEnd: 300,
          transferSize: 50000,
          encodedBodySize: 45000,
          decodedBodySize: 120000
        },
        {
          name: 'https://example.com/script.js',
          entryType: 'resource',
          initiatorType: 'script',
          startTime: 200,
          responseEnd: 500,
          transferSize: 80000,
          encodedBodySize: 75000,
          decodedBodySize: 200000
        },
        {
          name: 'https://example.com/image.jpg',
          entryType: 'resource',
          initiatorType: 'img',
          startTime: 300,
          responseEnd: 800,
          transferSize: 150000,
          encodedBodySize: 150000,
          decodedBodySize: 150000
        }
      ];

      mockPerformance.getEntriesByType.mockReturnValue(mockResourceEntries);

      const resourceAnalyzer = new ResourceAnalyzer();
      const analysis = await resourceAnalyzer.analyzeResources();

      expect(analysis.totalSize).toBe(280000); // Sum of transferSize
      expect(analysis.resourceCount).toBe(3);
      expect(analysis.byType.css.count).toBe(1);
      expect(analysis.byType.javascript.count).toBe(1);
      expect(analysis.byType.images.count).toBe(1);
      expect(analysis.compressionRatio).toBeCloseTo(0.78); // encoded/decoded ratio
    });

    test('should identify render-blocking resources', async () => {
      const mockResourceEntries = [
        {
          name: 'https://example.com/critical.css',
          entryType: 'resource',
          initiatorType: 'link',
          renderBlockingStatus: 'blocking',
          startTime: 100,
          responseEnd: 400
        },
        {
          name: 'https://example.com/async.js',
          entryType: 'resource',
          initiatorType: 'script',
          renderBlockingStatus: 'non-blocking',
          startTime: 200,
          responseEnd: 300
        }
      ];

      mockPerformance.getEntriesByType.mockReturnValue(mockResourceEntries);

      const resourceAnalyzer = new ResourceAnalyzer();
      const blocking = await resourceAnalyzer.identifyRenderBlockingResources();

      expect(blocking.length).toBe(1);
      expect(blocking[0].name).toContain('critical.css');
      expect(blocking[0].blockingTime).toBe(300);
    });

    test('should suggest resource optimizations', async () => {
      const mockResourceEntries = [
        {
          name: 'https://example.com/large-image.jpg',
          entryType: 'resource',
          initiatorType: 'img',
          transferSize: 2000000, // 2MB image
          startTime: 100,
          responseEnd: 5000 // Very slow
        },
        {
          name: 'https://example.com/uncompressed.js',
          entryType: 'resource',
          initiatorType: 'script',
          transferSize: 500000,
          encodedBodySize: 500000,
          decodedBodySize: 500000 // No compression
        }
      ];

      mockPerformance.getEntriesByType.mockReturnValue(mockResourceEntries);

      const resourceAnalyzer = new ResourceAnalyzer();
      const suggestions = await resourceAnalyzer.getOptimizationSuggestions();

      expect(suggestions).toContain('compress-images');
      expect(suggestions).toContain('enable-compression');
      expect(suggestions).toContain('optimize-images');
    });
  });

  describe('Rendering Analysis', () => {
    test('should measure paint timings', async () => {
      const mockPaintEntries = [
        {
          name: 'first-paint',
          entryType: 'paint',
          startTime: 800
        },
        {
          name: 'first-contentful-paint',
          entryType: 'paint',
          startTime: 1200
        }
      ];

      mockPerformance.getEntriesByType.mockReturnValue(mockPaintEntries);

      const renderingAnalyzer = new RenderingAnalyzer();
      const paintTimings = await renderingAnalyzer.analyzePaintTimings();

      expect(paintTimings.firstPaint).toBe(800);
      expect(paintTimings.firstContentfulPaint).toBe(1200);
      expect(paintTimings.rating.firstPaint).toBe('good'); // < 1s
      expect(paintTimings.rating.firstContentfulPaint).toBe('good'); // < 1.8s
    });

    test('should analyze frame rate and jank', async () => {
      const mockFrameEntries = Array(60).fill().map((_, i) => ({
        name: 'frame',
        entryType: 'measure',
        startTime: i * 16.67, // 60 FPS
        duration: i % 10 === 0 ? 50 : 16 // Some long frames
      }));

      mockPerformance.getEntriesByType.mockReturnValue(mockFrameEntries);

      const renderingAnalyzer = new RenderingAnalyzer();
      const frameAnalysis = await renderingAnalyzer.analyzeFrameRate();

      expect(frameAnalysis.averageFps).toBeLessThan(60); // Due to long frames
      expect(frameAnalysis.jankCount).toBeGreaterThan(0);
      expect(frameAnalysis.smoothness).toBeLessThan(1);
    });

    test('should identify layout thrashing', async () => {
      const mockLayoutEntries = [
        {
          entryType: 'layout-shift',
          value: 0.1,
          hadRecentInput: false,
          startTime: 1000,
          sources: [{ node: { tagName: 'DIV', className: 'dynamic-content' } }]
        },
        {
          entryType: 'layout-shift',
          value: 0.08,
          hadRecentInput: false,
          startTime: 1100,
          sources: [{ node: { tagName: 'DIV', className: 'dynamic-content' } }]
        }
      ];

      mockPerformance.getEntriesByType.mockReturnValue(mockLayoutEntries);

      const renderingAnalyzer = new RenderingAnalyzer();
      const thrashing = await renderingAnalyzer.detectLayoutThrashing();

      expect(thrashing.detected).toBe(true);
      expect(thrashing.problematicElements.length).toBeGreaterThan(0);
      expect(thrashing.suggestions).toContain('stabilize-dynamic-content');
    });
  });

  describe('Performance scoring', () => {
    test('should calculate overall performance score', async () => {
      // Mock comprehensive performance data
      mockPerformance.getEntriesByType.mockImplementation(type => {
        switch (type) {
          case 'largest-contentful-paint':
            return [{ startTime: 1500, renderTime: 1500 }];
          case 'first-input':
            return [{ startTime: 1000, processingStart: 1050 }];
          case 'layout-shift':
            return [{ value: 0.1, hadRecentInput: false }];
          case 'paint':
            return [
              { name: 'first-paint', startTime: 800 },
              { name: 'first-contentful-paint', startTime: 1200 }
            ];
          case 'resource':
            return [
              { transferSize: 100000, responseEnd: 500, startTime: 100 }
            ];
          default:
            return [];
        }
      });

      const score = await performanceAnalyzer.calculateOverallScore();

      expect(score.value).toBeGreaterThan(0);
      expect(score.value).toBeLessThanOrEqual(100);
      expect(score.breakdown).toHaveProperty('coreWebVitals');
      expect(score.breakdown).toHaveProperty('loadTime');
      expect(score.breakdown).toHaveProperty('resources');
      expect(score.breakdown).toHaveProperty('rendering');
    });

    test('should provide actionable recommendations', async () => {
      const recommendations = await performanceAnalyzer.getRecommendations();

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toHaveProperty('category');
      expect(recommendations[0]).toHaveProperty('severity');
      expect(recommendations[0]).toHaveProperty('description');
      expect(recommendations[0]).toHaveProperty('impact');
    });
  });

  describe('error handling and edge cases', () => {
    test('should handle missing performance API gracefully', async () => {
      global.performance = undefined;

      const analyzer = new PerformanceAnalyzer();
      const result = await analyzer.analyzeCoreWebVitals();

      expect(result.lcp.value).toBe(null);
      expect(result.fid.value).toBe(null);
      expect(result.cls.value).toBe(null);
      expect(result.overallScore).toBe(0);
    });

    test('should handle empty performance entries', async () => {
      mockPerformance.getEntriesByType.mockReturnValue([]);

      const coreWebVitals = new CoreWebVitals();
      const lcp = await coreWebVitals.measureLCP();

      expect(lcp.value).toBe(null);
      expect(lcp.rating).toBe('unknown');
    });

    test('should handle invalid timing data', async () => {
      mockPerformance.timing = {
        navigationStart: 1000,
        loadEventEnd: 999 // Invalid: earlier than navigationStart
      };

      const loadTimeAnalyzer = new LoadTimeAnalyzer();
      const timing = await loadTimeAnalyzer.analyzeNavigationTiming();

      expect(timing.total).toBe(0); // Should handle gracefully
    });

    test('should validate performance metrics', async () => {
      const result = await performanceAnalyzer.validateMetrics({
        lcp: -100, // Invalid negative value
        fid: 'invalid', // Invalid type
        cls: Infinity // Invalid infinite value
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
