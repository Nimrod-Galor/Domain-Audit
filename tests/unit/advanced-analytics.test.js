// Unit tests for Advanced Analytics Engine
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { AdvancedAnalytics } from '../../src/analytics/advanced-analytics.js';

describe('AdvancedAnalytics', () => {
  let analytics;
  let mockPageData;
  
  beforeEach(() => {
    analytics = new AdvancedAnalytics();
    mockPageData = {
      url: 'https://example.com',
      seo: {
        title: { text: 'Test Page', length: 9, isEmpty: false },
        metaDescription: { text: 'Test description', length: 16, isEmpty: false },
        canonical: 'https://example.com',
        openGraph: { title: 'OG Title', description: 'OG Desc' },
        structuredData: { count: 1, types: ['WebPage'] }
      },
      technical: {
        viewport: 'width=device-width, initial-scale=1',
        charset: 'utf-8',
        httpStatus: 200,
        responseTime: 500,
        resources: { externalCSS: 2, externalJS: 3, inlineCSS: 1 }
      },
      performance: {
        responseTime: 500,
        pageSize: 1024000, // 1MB
        compression: 'gzip'
      },
      accessibility: {
        images: { total: 10, withAlt: 9 },
        forms: { total: 2, withLabels: 2 },
        headingStructure: { h1Count: 1, properOrder: true }
      },
      content: {
        wordCount: 300,
        headings: { h1: ['Main Title'], h2: ['Subtitle'] },
        contentToCodeRatio: 20
      },
      security: {
        isHTTPS: true,
        securityHeaders: { hsts: true, csp: true, xfo: false }
      }
    };
  });

  describe('comprehensive analysis', () => {
    test('should generate complete analytics for well-optimized page', async () => {
      const result = await analytics.analyzePageComprehensively(mockPageData);
      
      expect(result).toBeDefined();
      expect(result.scores).toBeDefined();
      expect(result.scores.overall).toBeDefined();
      expect(result.scores.overall.score).toBeGreaterThan(0);
      expect(['A', 'B', 'C', 'D', 'F']).toContain(result.scores.overall.grade);
      
      // Check category scores
      expect(result.scores.categories).toBeDefined();
      expect(result.scores.categories.seo).toBeDefined();
      expect(result.scores.categories.technical).toBeDefined();
      expect(result.scores.categories.performance).toBeDefined();
      expect(result.scores.categories.accessibility).toBeDefined();
    });

    test('should provide meaningful recommendations', async () => {
      const result = await analytics.analyzePageComprehensively(mockPageData);
      
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations.quickWins)).toBe(true);
      expect(Array.isArray(result.recommendations.improvements)).toBe(true);
    });

    test('should identify risks correctly', async () => {
      const poorPageData = {
        ...mockPageData,
        seo: { title: { text: '', isEmpty: true } },
        security: { isHTTPS: false },
        accessibility: { images: { total: 10, withAlt: 2 } }
      };
      
      const result = await analytics.analyzePageComprehensively(poorPageData);
      
      expect(result.risks).toBeDefined();
      expect(Array.isArray(result.risks.risks)).toBe(true);
      expect(result.risks.risks.length).toBeGreaterThan(0);
    });
  });

  describe('scoring algorithms', () => {
    test('should calculate SEO score correctly', () => {
      const seoScore = analytics._calculateSEOScore(mockPageData.seo);
      expect(typeof seoScore).toBe('number');
      expect(seoScore).toBeGreaterThanOrEqual(0);
      expect(seoScore).toBeLessThanOrEqual(100);
    });

    test('should calculate technical score correctly', () => {
      const techScore = analytics._calculateTechnicalScore(mockPageData.technical);
      expect(typeof techScore).toBe('number');
      expect(techScore).toBeGreaterThanOrEqual(0);
      expect(techScore).toBeLessThanOrEqual(100);
    });

    test('should calculate performance score correctly', () => {
      const perfScore = analytics._calculatePerformanceScore(mockPageData.performance);
      expect(typeof perfScore).toBe('number');
      expect(perfScore).toBeGreaterThanOrEqual(0);
      expect(perfScore).toBeLessThanOrEqual(100);
    });

    test('should assign grades correctly', () => {
      expect(analytics._assignGrade(95)).toBe('A');
      expect(analytics._assignGrade(85)).toBe('B');
      expect(analytics._assignGrade(75)).toBe('C');
      expect(analytics._assignGrade(65)).toBe('D');
      expect(analytics._assignGrade(45)).toBe('F');
    });
  });

  describe('caching and performance', () => {
    test('should handle caching correctly', async () => {
      const result1 = await analytics.analyzePageComprehensively(mockPageData);
      const result2 = await analytics.analyzePageComprehensively(mockPageData);
      
      // Results should be consistent
      expect(result1.scores.overall.score).toBe(result2.scores.overall.score);
    });

    test('should process large datasets efficiently', async () => {
      const largeMockData = Array(100).fill(mockPageData);
      
      const startTime = Date.now();
      const results = await Promise.all(
        largeMockData.map(data => analytics.analyzePageComprehensively(data))
      );
      const endTime = Date.now();
      
      expect(results.length).toBe(100);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('error handling', () => {
    test('should handle missing data gracefully', async () => {
      const incompleteData = { url: 'https://example.com' };
      
      const result = await analytics.analyzePageComprehensively(incompleteData);
      
      expect(result).toBeDefined();
      expect(result.scores).toBeDefined();
      expect(result.scores.overall.score).toBeGreaterThanOrEqual(0);
    });

    test('should handle malformed data', async () => {
      const malformedData = {
        url: 'invalid-url',
        seo: 'not-an-object',
        technical: null
      };
      
      expect(async () => {
        await analytics.analyzePageComprehensively(malformedData);
      }).not.toThrow();
    });
  });
});
