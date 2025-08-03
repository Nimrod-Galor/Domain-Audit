/**
 * @jest-environment node
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { AdvancedAnalytics } from '../../src/analytics/advanced-analytics.js';

describe('AdvancedAnalytics Tests', () => {
  let analytics;
  
  beforeEach(() => {
    analytics = new AdvancedAnalytics();
  });

  describe('Constructor', () => {
    test('should initialize with default configuration', () => {
      const analyticsInstance = new AdvancedAnalytics();
      expect(analyticsInstance.config).toBeDefined();
      expect(analyticsInstance.metrics).toBeDefined();
      expect(analyticsInstance.trends).toBeDefined();
    });

    test('should initialize with custom configuration', () => {
      const customConfig = {
        enableTrendAnalysis: false,
        maxDataPoints: 500,
        weightFactors: { content: 0.4, technical: 0.3, performance: 0.3 }
      };
      const analyticsInstance = new AdvancedAnalytics(customConfig);
      expect(analyticsInstance.config.enableTrendAnalysis).toBe(false);
      expect(analyticsInstance.config.maxDataPoints).toBe(500);
      expect(analyticsInstance.config.weightFactors.content).toBe(0.4);
    });
  });

  describe('calculateCompositeScore', () => {
    test('should calculate weighted composite score', () => {
      const data = {
        content: { score: 85 },
        technical: { score: 90 },
        performance: { score: 75 },
        accessibility: { score: 80 }
      };
      
      const score = analytics.calculateCompositeScore(data);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(typeof score).toBe('number');
    });

    test('should handle missing score components', () => {
      const incompleteData = {
        content: { score: 85 },
        technical: {} // Missing score
      };
      
      const score = analytics.calculateCompositeScore(incompleteData);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should return zero for empty data', () => {
      const score = analytics.calculateCompositeScore({});
      expect(score).toBe(0);
    });

    test('should handle extreme values correctly', () => {
      const extremeData = {
        content: { score: 0 },
        technical: { score: 100 },
        performance: { score: 50 }
      };
      
      const score = analytics.calculateCompositeScore(extremeData);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('analyzeContentQuality', () => {
    test('should analyze content quality metrics', () => {
      const contentData = {
        wordCount: 1500,
        readabilityScore: 75,
        headingStructure: {
          h1Count: 1,
          h2Count: 5,
          h3Count: 8,
          totalHeadings: 14
        },
        links: {
          internal: 15,
          external: 5,
          total: 20
        },
        images: {
          total: 10,
          withAlt: 9,
          optimized: 7
        }
      };
      
      const analysis = analytics.analyzeContentQuality(contentData);
      
      expect(analysis).toBeDefined();
      expect(analysis.score).toBeGreaterThan(0);
      expect(analysis.metrics).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(Array.isArray(analysis.recommendations)).toBe(true);
    });

    test('should handle minimal content data', () => {
      const minimalData = {
        wordCount: 100,
        readabilityScore: 30,
        headingStructure: { totalHeadings: 1 },
        links: { total: 2 },
        images: { total: 1 }
      };
      
      const analysis = analytics.analyzeContentQuality(minimalData);
      
      expect(analysis.score).toBeLessThan(50); // Should be low score
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    test('should handle excellent content data', () => {
      const excellentData = {
        wordCount: 2000,
        readabilityScore: 90,
        headingStructure: {
          h1Count: 1,
          h2Count: 6,
          h3Count: 12,
          totalHeadings: 19
        },
        links: {
          internal: 25,
          external: 8,
          total: 33
        },
        images: {
          total: 15,
          withAlt: 15,
          optimized: 14
        }
      };
      
      const analysis = analytics.analyzeContentQuality(excellentData);
      
      expect(analysis.score).toBeGreaterThan(80);
      expect(analysis.recommendations.length).toBeLessThan(3);
    });
  });

  describe('analyzeTechnicalQuality', () => {
    test('should analyze technical quality metrics', () => {
      const technicalData = {
        infrastructure: {
          server: 'nginx/1.18.0',
          compression: 'gzip',
          resources: { totalResources: 25 }
        },
        accessibility: {
          images: { altCoverage: 90 },
          aria: { totalAriaElements: 8 }
        },
        mobileFriendliness: {
          viewport: { hasViewport: true },
          responsive: { hasMediaQueries: true }
        },
        security: {
          headers: { hsts: true, csp: true }
        }
      };
      
      const analysis = analytics.analyzeTechnicalQuality(technicalData);
      
      expect(analysis).toBeDefined();
      expect(analysis.score).toBeGreaterThan(0);
      expect(analysis.metrics).toBeDefined();
      expect(analysis.issues).toBeDefined();
      expect(Array.isArray(analysis.issues)).toBe(true);
    });

    test('should identify technical issues', () => {
      const poorTechnicalData = {
        accessibility: {
          images: { altCoverage: 30 },
          aria: { totalAriaElements: 0 }
        },
        mobileFriendliness: {
          viewport: { hasViewport: false }
        },
        security: {
          headers: { hsts: false, csp: false }
        }
      };
      
      const analysis = analytics.analyzeTechnicalQuality(poorTechnicalData);
      
      expect(analysis.score).toBeLessThan(60);
      expect(analysis.issues.length).toBeGreaterThan(0);
    });
  });

  describe('analyzePerformanceMetrics', () => {
    test('should analyze performance metrics', () => {
      const performanceData = {
        loadTimes: {
          ttfb: 200,
          domContentLoaded: 800,
          fullyLoaded: 1500
        },
        resources: {
          totalSize: 2048000, // 2MB
          totalRequests: 35,
          compressed: 25,
          cached: 15
        },
        optimization: {
          imagesOptimized: 80,
          cssMinified: true,
          jsMinified: true
        }
      };
      
      const analysis = analytics.analyzePerformanceMetrics(performanceData);
      
      expect(analysis).toBeDefined();
      expect(analysis.score).toBeGreaterThan(0);
      expect(analysis.metrics).toBeDefined();
      expect(analysis.bottlenecks).toBeDefined();
      expect(Array.isArray(analysis.bottlenecks)).toBe(true);
    });

    test('should identify performance bottlenecks', () => {
      const slowPerformanceData = {
        loadTimes: {
          ttfb: 2000, // Very slow
          domContentLoaded: 5000,
          fullyLoaded: 10000
        },
        resources: {
          totalSize: 10485760, // 10MB - very large
          totalRequests: 150, // Too many requests
          compressed: 50,
          cached: 10
        },
        optimization: {
          imagesOptimized: 20, // Poor optimization
          cssMinified: false,
          jsMinified: false
        }
      };
      
      const analysis = analytics.analyzePerformanceMetrics(slowPerformanceData);
      
      expect(analysis.score).toBeLessThan(40);
      expect(analysis.bottlenecks.length).toBeGreaterThan(0);
    });
  });

  describe('generateInsights', () => {
    test('should generate comprehensive insights', () => {
      const analysisData = {
        content: {
          score: 85,
          metrics: { wordCount: 1500, readabilityScore: 75 }
        },
        technical: {
          score: 78,
          issues: ['Missing alt text on some images']
        },
        performance: {
          score: 82,
          bottlenecks: ['Large image sizes']
        }
      };
      
      const insights = analytics.generateInsights(analysisData);
      
      expect(insights).toBeDefined();
      expect(insights.strengths).toBeDefined();
      expect(insights.weaknesses).toBeDefined();
      expect(insights.opportunities).toBeDefined();
      expect(insights.priorities).toBeDefined();
      expect(Array.isArray(insights.strengths)).toBe(true);
      expect(Array.isArray(insights.weaknesses)).toBe(true);
    });

    test('should prioritize critical issues', () => {
      const criticalIssuesData = {
        content: { score: 30 },
        technical: { score: 25, issues: ['No accessibility features', 'Missing security headers'] },
        performance: { score: 20, bottlenecks: ['Extremely slow load times', 'Unoptimized resources'] }
      };
      
      const insights = analytics.generateInsights(criticalIssuesData);
      
      expect(insights.priorities.length).toBeGreaterThan(0);
      expect(insights.weaknesses.length).toBeGreaterThan(insights.strengths.length);
    });
  });

  describe('trackTrends', () => {
    test('should track score trends over time', () => {
      const dataPoint1 = { timestamp: Date.now() - 86400000, score: 75 }; // 1 day ago
      const dataPoint2 = { timestamp: Date.now() - 43200000, score: 78 }; // 12 hours ago
      const dataPoint3 = { timestamp: Date.now(), score: 82 }; // Now
      
      analytics.trackTrends('overall_score', dataPoint1);
      analytics.trackTrends('overall_score', dataPoint2);
      analytics.trackTrends('overall_score', dataPoint3);
      
      const trends = analytics.getTrends('overall_score');
      
      expect(trends).toBeDefined();
      expect(trends.direction).toBe('improving');
      expect(trends.changeRate).toBeGreaterThan(0);
      expect(trends.dataPoints).toHaveLength(3);
    });

    test('should detect declining trends', () => {
      const dataPoint1 = { timestamp: Date.now() - 86400000, score: 85 };
      const dataPoint2 = { timestamp: Date.now() - 43200000, score: 80 };
      const dataPoint3 = { timestamp: Date.now(), score: 75 };
      
      analytics.trackTrends('declining_metric', dataPoint1);
      analytics.trackTrends('declining_metric', dataPoint2);
      analytics.trackTrends('declining_metric', dataPoint3);
      
      const trends = analytics.getTrends('declining_metric');
      
      expect(trends.direction).toBe('declining');
      expect(trends.changeRate).toBeLessThan(0);
    });

    test('should handle stable trends', () => {
      const stableScore = 80;
      for (let i = 0; i < 5; i++) {
        analytics.trackTrends('stable_metric', {
          timestamp: Date.now() - (i * 3600000), // Each hour
          score: stableScore + (Math.random() - 0.5) * 2 // Small random variation
        });
      }
      
      const trends = analytics.getTrends('stable_metric');
      
      expect(trends.direction).toBe('stable');
      expect(Math.abs(trends.changeRate)).toBeLessThan(1);
    });
  });

  describe('compareAnalyses', () => {
    test('should compare two analysis results', () => {
      const analysis1 = {
        overall: { score: 75 },
        content: { score: 80 },
        technical: { score: 70 },
        performance: { score: 75 }
      };
      
      const analysis2 = {
        overall: { score: 82 },
        content: { score: 85 },
        technical: { score: 78 },
        performance: { score: 83 }
      };
      
      const comparison = analytics.compareAnalyses(analysis1, analysis2);
      
      expect(comparison).toBeDefined();
      expect(comparison.improvements).toBeDefined();
      expect(comparison.regressions).toBeDefined();
      expect(comparison.summary).toBeDefined();
      expect(comparison.improvements.length).toBeGreaterThan(0);
    });

    test('should identify specific improvements and regressions', () => {
      const before = {
        content: { score: 60 },
        technical: { score: 80 },
        performance: { score: 70 }
      };
      
      const after = {
        content: { score: 85 }, // Improved
        technical: { score: 75 }, // Regressed
        performance: { score: 70 } // Unchanged
      };
      
      const comparison = analytics.compareAnalyses(before, after);
      
      expect(comparison.improvements.some(imp => imp.metric === 'content')).toBe(true);
      expect(comparison.regressions.some(reg => reg.metric === 'technical')).toBe(true);
    });
  });

  describe('exportAnalytics', () => {
    test('should export analytics data in JSON format', () => {
      // Add some data
      analytics.trackTrends('test_metric', { timestamp: Date.now(), score: 80 });
      
      const exported = analytics.exportAnalytics('json');
      
      expect(exported).toBeDefined();
      expect(typeof exported).toBe('string');
      
      const parsed = JSON.parse(exported);
      expect(parsed.trends).toBeDefined();
      expect(parsed.metrics).toBeDefined();
      expect(parsed.timestamp).toBeDefined();
    });

    test('should export analytics data in CSV format', () => {
      // Add multiple data points
      for (let i = 0; i < 3; i++) {
        analytics.trackTrends('csv_test', {
          timestamp: Date.now() - (i * 3600000),
          score: 70 + i * 5
        });
      }
      
      const exported = analytics.exportAnalytics('csv');
      
      expect(exported).toBeDefined();
      expect(typeof exported).toBe('string');
      expect(exported).toContain('timestamp,metric,score');
    });
  });

  describe('Benchmarking and Scoring', () => {
    test('should calculate percentile rankings', () => {
      const sampleScores = [60, 65, 70, 75, 80, 85, 90, 95];
      const testScore = 80;
      
      const percentile = analytics.calculatePercentile(testScore, sampleScores);
      
      expect(percentile).toBeGreaterThan(0);
      expect(percentile).toBeLessThanOrEqual(100);
    });

    test('should categorize scores appropriately', () => {
      expect(analytics.categorizeScore(95)).toBe('excellent');
      expect(analytics.categorizeScore(85)).toBe('good');
      expect(analytics.categorizeScore(70)).toBe('average');
      expect(analytics.categorizeScore(55)).toBe('below_average');
      expect(analytics.categorizeScore(30)).toBe('poor');
    });

    test('should calculate improvement potential', () => {
      const currentScores = {
        content: 70,
        technical: 60,
        performance: 55
      };
      
      const potential = analytics.calculateImprovementPotential(currentScores);
      
      expect(potential).toBeDefined();
      expect(potential.total).toBeGreaterThan(0);
      expect(potential.priorities).toBeDefined();
      expect(Array.isArray(potential.priorities)).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle null/undefined data gracefully', () => {
      expect(() => analytics.calculateCompositeScore(null)).not.toThrow();
      expect(() => analytics.analyzeContentQuality(undefined)).not.toThrow();
      expect(() => analytics.generateInsights({})).not.toThrow();
    });

    test('should handle malformed data structures', () => {
      const malformedData = {
        content: 'not an object',
        technical: { score: 'not a number' },
        performance: []
      };
      
      expect(() => analytics.calculateCompositeScore(malformedData)).not.toThrow();
    });

    test('should handle extremely large datasets', () => {
      // Add many data points to test performance
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        analytics.trackTrends('large_dataset', {
          timestamp: Date.now() - (i * 1000),
          score: Math.random() * 100
        });
      }
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should complete quickly
      
      const trends = analytics.getTrends('large_dataset');
      expect(trends).toBeDefined();
    });

    test('should handle concurrent operations safely', async () => {
      const promises = [];
      
      // Simulate concurrent tracking
      for (let i = 0; i < 50; i++) {
        promises.push(
          new Promise(resolve => {
            setTimeout(() => {
              analytics.trackTrends('concurrent_test', {
                timestamp: Date.now() + i,
                score: Math.random() * 100
              });
              resolve();
            }, Math.random() * 10);
          })
        );
      }
      
      await Promise.all(promises);
      
      const trends = analytics.getTrends('concurrent_test');
      expect(trends.dataPoints.length).toBe(50);
    });
  });

  describe('Memory Management', () => {
    test('should manage memory efficiently with large datasets', () => {
      const analytics = new AdvancedAnalytics({ maxDataPoints: 100 });
      
      // Add more data points than the limit
      for (let i = 0; i < 150; i++) {
        analytics.trackTrends('memory_test', {
          timestamp: Date.now() + i,
          score: Math.random() * 100
        });
      }
      
      const trends = analytics.getTrends('memory_test');
      expect(trends.dataPoints.length).toBeLessThanOrEqual(100);
    });

    test('should clean up old trend data', () => {
      const config = { maxDataPoints: 10, dataRetentionDays: 1 };
      const analyticsInstance = new AdvancedAnalytics(config);
      
      // Add old data
      analyticsInstance.trackTrends('cleanup_test', {
        timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
        score: 50
      });
      
      // Add recent data
      analyticsInstance.trackTrends('cleanup_test', {
        timestamp: Date.now(),
        score: 80
      });
      
      analyticsInstance.cleanupOldData();
      
      const trends = analyticsInstance.getTrends('cleanup_test');
      expect(trends.dataPoints.length).toBe(1); // Should only have recent data
    });
  });
});
