/**
 * @jest-environment node
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { PerformanceAnalyzer } from '../../src/performance/performance-analyzer.js';

describe('PerformanceAnalyzer Tests', () => {
  let performanceAnalyzer;
  
  beforeEach(() => {
    performanceAnalyzer = new PerformanceAnalyzer();
  });

  describe('Constructor', () => {
    test('should initialize with default configuration', () => {
      const analyzer = new PerformanceAnalyzer();
      expect(analyzer.config).toBeDefined();
      expect(analyzer.metrics).toBeDefined();
      expect(analyzer.thresholds).toBeDefined();
    });

    test('should initialize with custom configuration', () => {
      const customConfig = {
        enableResourceAnalysis: false,
        maxAnalysisTime: 30000,
        thresholds: {
          ttfb: 500,
          lcp: 2500,
          fid: 100
        }
      };
      const analyzer = new PerformanceAnalyzer(customConfig);
      expect(analyzer.config.enableResourceAnalysis).toBe(false);
      expect(analyzer.config.maxAnalysisTime).toBe(30000);
      expect(analyzer.thresholds.ttfb).toBe(500);
    });
  });

  describe('analyzePagePerformance', () => {
    test('should analyze complete page performance metrics', () => {
      const performanceData = {
        timing: {
          navigationStart: 1000,
          domainLookupStart: 1005,
          domainLookupEnd: 1025,
          connectStart: 1025,
          connectEnd: 1080,
          requestStart: 1080,
          responseStart: 1200,
          responseEnd: 1800,
          domContentLoadedEventStart: 2200,
          domContentLoadedEventEnd: 2250,
          loadEventStart: 3000,
          loadEventEnd: 3100
        },
        resources: [
          {
            name: 'https://example.com/style.css',
            initiatorType: 'link',
            responseStart: 1100,
            responseEnd: 1300,
            transferSize: 15000,
            encodedBodySize: 12000,
            decodedBodySize: 45000
          },
          {
            name: 'https://example.com/script.js',
            initiatorType: 'script',
            responseStart: 1200,
            responseEnd: 1500,
            transferSize: 25000,
            encodedBodySize: 20000,
            decodedBodySize: 80000
          }
        ],
        paintTiming: {
          'first-paint': 1800,
          'first-contentful-paint': 1900
        }
      };
      
      const analysis = performanceAnalyzer.analyzePagePerformance(performanceData);
      
      expect(analysis).toBeDefined();
      expect(analysis.loadTimes).toBeDefined();
      expect(analysis.resourceAnalysis).toBeDefined();
      expect(analysis.coreWebVitals).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(analysis.score).toBeGreaterThan(0);
    });

    test('should handle missing performance data gracefully', () => {
      const incompleteData = {
        timing: {
          navigationStart: 1000,
          loadEventEnd: 3000
        }
      };
      
      const analysis = performanceAnalyzer.analyzePagePerformance(incompleteData);
      
      expect(analysis).toBeDefined();
      expect(analysis.score).toBeGreaterThanOrEqual(0);
    });

    test('should calculate load time metrics correctly', () => {
      const timingData = {
        timing: {
          navigationStart: 0,
          domainLookupStart: 5,
          domainLookupEnd: 25,
          connectStart: 25,
          connectEnd: 80,
          requestStart: 80,
          responseStart: 200,
          responseEnd: 800,
          domContentLoadedEventEnd: 1200,
          loadEventEnd: 2000
        }
      };
      
      const analysis = performanceAnalyzer.analyzePagePerformance(timingData);
      
      expect(analysis.loadTimes.ttfb).toBe(200); // Time to first byte
      expect(analysis.loadTimes.domContentLoaded).toBe(1200);
      expect(analysis.loadTimes.fullyLoaded).toBe(2000);
      expect(analysis.loadTimes.dnsLookup).toBe(20);
      expect(analysis.loadTimes.tcpConnect).toBe(55);
    });
  });

  describe('analyzeResources', () => {
    test('should analyze resource loading performance', () => {
      const resources = [
        {
          name: 'https://example.com/large-image.jpg',
          initiatorType: 'img',
          responseStart: 1000,
          responseEnd: 2000,
          transferSize: 500000,
          encodedBodySize: 480000,
          decodedBodySize: 500000
        },
        {
          name: 'https://example.com/app.js',
          initiatorType: 'script',
          responseStart: 800,
          responseEnd: 1200,
          transferSize: 100000,
          encodedBodySize: 80000,
          decodedBodySize: 250000
        },
        {
          name: 'https://cdn.example.com/font.woff2',
          initiatorType: 'css',
          responseStart: 900,
          responseEnd: 1100,
          transferSize: 25000,
          encodedBodySize: 24000,
          decodedBodySize: 25000
        }
      ];
      
      const analysis = performanceAnalyzer.analyzeResources(resources);
      
      expect(analysis.totalResources).toBe(3);
      expect(analysis.totalSize).toBe(625000);
      expect(analysis.compressionRatio).toBeGreaterThan(0);
      expect(analysis.slowestResources).toBeDefined();
      expect(analysis.largestResources).toBeDefined();
      expect(analysis.resourcesByType).toBeDefined();
    });

    test('should identify performance bottlenecks in resources', () => {
      const slowResources = [
        {
          name: 'https://slow-cdn.com/heavy-script.js',
          initiatorType: 'script',
          responseStart: 1000,
          responseEnd: 5000, // Very slow
          transferSize: 2000000 // Very large
        },
        {
          name: 'https://example.com/optimized.css',
          initiatorType: 'link',
          responseStart: 800,
          responseEnd: 900,
          transferSize: 5000
        }
      ];
      
      const analysis = performanceAnalyzer.analyzeResources(slowResources);
      
      expect(analysis.bottlenecks).toBeDefined();
      expect(analysis.bottlenecks.length).toBeGreaterThan(0);
      expect(analysis.bottlenecks.some(b => b.includes('slow'))).toBe(true);
    });

    test('should categorize resources by type', () => {
      const mixedResources = [
        { name: 'style.css', initiatorType: 'link', transferSize: 10000 },
        { name: 'script.js', initiatorType: 'script', transferSize: 15000 },
        { name: 'image.jpg', initiatorType: 'img', transferSize: 50000 },
        { name: 'font.woff2', initiatorType: 'css', transferSize: 8000 }
      ];
      
      const analysis = performanceAnalyzer.analyzeResources(mixedResources);
      
      expect(analysis.resourcesByType.css).toBeDefined();
      expect(analysis.resourcesByType.javascript).toBeDefined();
      expect(analysis.resourcesByType.images).toBeDefined();
      expect(analysis.resourcesByType.fonts).toBeDefined();
    });
  });

  describe('calculateCoreWebVitals', () => {
    test('should calculate Core Web Vitals metrics', () => {
      const performanceData = {
        paintTiming: {
          'first-contentful-paint': 1200
        },
        largestContentfulPaint: 2400,
        firstInputDelay: 50,
        cumulativeLayoutShift: 0.05
      };
      
      const vitals = performanceAnalyzer.calculateCoreWebVitals(performanceData);
      
      expect(vitals.fcp).toBe(1200);
      expect(vitals.lcp).toBe(2400);
      expect(vitals.fid).toBe(50);
      expect(vitals.cls).toBe(0.05);
      expect(vitals.scores).toBeDefined();
      expect(vitals.overall).toBeDefined();
    });

    test('should rate Core Web Vitals performance correctly', () => {
      const goodMetrics = {
        largestContentfulPaint: 1800, // Good
        firstInputDelay: 80, // Good
        cumulativeLayoutShift: 0.08 // Good
      };
      
      const vitals = performanceAnalyzer.calculateCoreWebVitals(goodMetrics);
      
      expect(vitals.scores.lcp).toBe('good');
      expect(vitals.scores.fid).toBe('good');
      expect(vitals.scores.cls).toBe('good');
    });

    test('should handle poor Core Web Vitals', () => {
      const poorMetrics = {
        largestContentfulPaint: 5000, // Poor
        firstInputDelay: 400, // Poor
        cumulativeLayoutShift: 0.3 // Poor
      };
      
      const vitals = performanceAnalyzer.calculateCoreWebVitals(poorMetrics);
      
      expect(vitals.scores.lcp).toBe('poor');
      expect(vitals.scores.fid).toBe('poor');
      expect(vitals.scores.cls).toBe('poor');
      expect(vitals.overall).toBe('poor');
    });
  });

  describe('generatePerformanceScore', () => {
    test('should generate overall performance score', () => {
      const metrics = {
        loadTimes: {
          ttfb: 200,
          domContentLoaded: 1500,
          fullyLoaded: 3000
        },
        coreWebVitals: {
          scores: { lcp: 'good', fid: 'good', cls: 'needs-improvement' }
        },
        resourceAnalysis: {
          totalSize: 1500000,
          totalResources: 25,
          compressionRatio: 0.7
        }
      };
      
      const score = performanceAnalyzer.generatePerformanceScore(metrics);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should penalize poor performance metrics', () => {
      const poorMetrics = {
        loadTimes: {
          ttfb: 2000, // Very slow
          domContentLoaded: 8000,
          fullyLoaded: 15000
        },
        coreWebVitals: {
          scores: { lcp: 'poor', fid: 'poor', cls: 'poor' }
        },
        resourceAnalysis: {
          totalSize: 10000000, // Very large
          totalResources: 200, // Too many
          compressionRatio: 0.1 // Poor compression
        }
      };
      
      const score = performanceAnalyzer.generatePerformanceScore(poorMetrics);
      
      expect(score).toBeLessThan(40);
    });
  });

  describe('generateRecommendations', () => {
    test('should generate relevant performance recommendations', () => {
      const analysisData = {
        loadTimes: { ttfb: 1500 }, // Slow TTFB
        resourceAnalysis: {
          totalSize: 5000000, // Large total size
          largestResources: [
            { name: 'huge-image.jpg', transferSize: 2000000 }
          ],
          resourcesByType: {
            images: { totalSize: 3000000 }
          }
        },
        coreWebVitals: {
          scores: { lcp: 'poor', cls: 'needs-improvement' }
        }
      };
      
      const recommendations = performanceAnalyzer.generateRecommendations(analysisData);
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Should include specific recommendations
      const hasImageOptimization = recommendations.some(r => 
        r.type === 'image_optimization' || r.description.includes('image')
      );
      expect(hasImageOptimization).toBe(true);
    });

    test('should prioritize critical performance issues', () => {
      const criticalIssues = {
        loadTimes: { fullyLoaded: 20000 }, // Extremely slow
        coreWebVitals: {
          scores: { lcp: 'poor', fid: 'poor', cls: 'poor' }
        }
      };
      
      const recommendations = performanceAnalyzer.generateRecommendations(criticalIssues);
      
      const criticalRecs = recommendations.filter(r => r.priority === 'critical');
      expect(criticalRecs.length).toBeGreaterThan(0);
    });

    test('should return minimal recommendations for good performance', () => {
      const goodPerformance = {
        loadTimes: {
          ttfb: 150,
          domContentLoaded: 800,
          fullyLoaded: 1500
        },
        coreWebVitals: {
          scores: { lcp: 'good', fid: 'good', cls: 'good' }
        },
        resourceAnalysis: {
          totalSize: 800000,
          compressionRatio: 0.8
        }
      };
      
      const recommendations = performanceAnalyzer.generateRecommendations(goodPerformance);
      
      expect(recommendations.length).toBeLessThan(3);
    });
  });

  describe('analyzeNetworkLatency', () => {
    test('should analyze network latency patterns', () => {
      const networkData = {
        requests: [
          { url: 'https://api.example.com/data', responseTime: 200 },
          { url: 'https://cdn.example.com/asset1', responseTime: 150 },
          { url: 'https://cdn.example.com/asset2', responseTime: 180 },
          { url: 'https://slow-server.com/data', responseTime: 2000 }
        ]
      };
      
      const analysis = performanceAnalyzer.analyzeNetworkLatency(networkData);
      
      expect(analysis.averageLatency).toBeDefined();
      expect(analysis.medianLatency).toBeDefined();
      expect(analysis.slowestRequests).toBeDefined();
      expect(analysis.domainPerformance).toBeDefined();
    });

    test('should identify slow domains', () => {
      const networkData = {
        requests: [
          { url: 'https://fast-cdn.com/asset', responseTime: 100 },
          { url: 'https://slow-api.com/data', responseTime: 3000 },
          { url: 'https://slow-api.com/more-data', responseTime: 2800 }
        ]
      };
      
      const analysis = performanceAnalyzer.analyzeNetworkLatency(networkData);
      
      expect(analysis.domainPerformance['slow-api.com']).toBeGreaterThan(2000);
      expect(analysis.domainPerformance['fast-cdn.com']).toBeLessThan(200);
    });
  });

  describe('benchmarkPerformance', () => {
    test('should benchmark against performance standards', () => {
      const metrics = {
        loadTimes: {
          ttfb: 180,
          domContentLoaded: 1200,
          fullyLoaded: 2500
        },
        coreWebVitals: {
          lcp: 2000,
          fid: 80,
          cls: 0.08
        }
      };
      
      const benchmark = performanceAnalyzer.benchmarkPerformance(metrics);
      
      expect(benchmark.category).toBeDefined();
      expect(benchmark.percentile).toBeDefined();
      expect(benchmark.comparison).toBeDefined();
      expect(['excellent', 'good', 'average', 'poor'].includes(benchmark.category)).toBe(true);
    });

    test('should categorize excellent performance correctly', () => {
      const excellentMetrics = {
        loadTimes: { fullyLoaded: 1000 },
        coreWebVitals: { lcp: 1500, fid: 50, cls: 0.05 }
      };
      
      const benchmark = performanceAnalyzer.benchmarkPerformance(excellentMetrics);
      
      expect(['excellent', 'good'].includes(benchmark.category)).toBe(true);
      expect(benchmark.percentile).toBeGreaterThan(70);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle missing timing data', () => {
      expect(() => {
        performanceAnalyzer.analyzePagePerformance({});
      }).not.toThrow();
    });

    test('should handle empty resource arrays', () => {
      const result = performanceAnalyzer.analyzeResources([]);
      
      expect(result.totalResources).toBe(0);
      expect(result.totalSize).toBe(0);
      expect(result.slowestResources).toEqual([]);
    });

    test('should handle malformed performance data', () => {
      const malformedData = {
        timing: 'not an object',
        resources: 'not an array',
        paintTiming: null
      };
      
      expect(() => {
        performanceAnalyzer.analyzePagePerformance(malformedData);
      }).not.toThrow();
    });

    test('should handle extremely large datasets efficiently', () => {
      const largeResourceSet = Array.from({ length: 1000 }, (_, i) => ({
        name: `https://example.com/resource${i}.js`,
        initiatorType: 'script',
        responseStart: 1000 + i,
        responseEnd: 1100 + i,
        transferSize: 10000 + Math.random() * 50000
      }));
      
      const startTime = Date.now();
      const analysis = performanceAnalyzer.analyzeResources(largeResourceSet);
      const duration = Date.now() - startTime;
      
      expect(analysis).toBeDefined();
      expect(duration).toBeLessThan(1000); // Should complete quickly
      expect(analysis.totalResources).toBe(1000);
    });

    test('should handle negative timing values', () => {
      const negativeTimingData = {
        timing: {
          navigationStart: -1000,
          responseStart: -500,
          loadEventEnd: 2000
        }
      };
      
      const analysis = performanceAnalyzer.analyzePagePerformance(negativeTimingData);
      
      expect(analysis).toBeDefined();
      expect(analysis.score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Memory and Performance Optimization', () => {
    test('should efficiently process large performance datasets', () => {
      const largeTimingData = {
        timing: {
          navigationStart: 0,
          responseStart: 200,
          loadEventEnd: 3000
        },
        resources: Array.from({ length: 500 }, (_, i) => ({
          name: `resource${i}`,
          transferSize: Math.random() * 100000,
          responseStart: 1000 + i * 10,
          responseEnd: 1000 + i * 10 + Math.random() * 500
        }))
      };
      
      const startTime = performance.now();
      const analysis = performanceAnalyzer.analyzePagePerformance(largeTimingData);
      const endTime = performance.now();
      
      expect(analysis).toBeDefined();
      expect(endTime - startTime).toBeLessThan(500); // Should be fast
    });

    test('should manage memory usage with concurrent analyses', async () => {
      const analyses = [];
      
      for (let i = 0; i < 10; i++) {
        const data = {
          timing: { navigationStart: 0, loadEventEnd: 2000 + i * 100 },
          resources: Array.from({ length: 50 }, (_, j) => ({
            name: `resource${j}`,
            transferSize: Math.random() * 50000
          }))
        };
        
        analyses.push(
          new Promise(resolve => {
            const result = performanceAnalyzer.analyzePagePerformance(data);
            resolve(result);
          })
        );
      }
      
      const results = await Promise.all(analyses);
      
      expect(results).toHaveLength(10);
      expect(results.every(r => r && typeof r.score === 'number')).toBe(true);
    });
  });

  describe('Progressive Enhancement Detection', () => {
    test('should detect progressive loading strategies', () => {
      const progressiveData = {
        resources: [
          { name: 'critical.css', initiatorType: 'link', priority: 'high' },
          { name: 'lazy-image.jpg', initiatorType: 'img', loading: 'lazy' },
          { name: 'deferred.js', initiatorType: 'script', async: true }
        ]
      };
      
      const analysis = performanceAnalyzer.analyzeProgressiveLoading(progressiveData);
      
      expect(analysis.hasLazyLoading).toBe(true);
      expect(analysis.hasAsyncScripts).toBe(true);
      expect(analysis.hasCriticalResourcePrioritization).toBe(true);
    });
  });
});
