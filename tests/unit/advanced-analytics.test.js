/**
 * @jest-environment node
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
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
      expect(analyticsInstance.config.enableScoring).toBe(true);
      expect(analyticsInstance.config.enableTrendAnalysis).toBe(true);
      expect(analyticsInstance.config.enableBenchmarking).toBe(true);
      expect(analyticsInstance.config.enableRecommendations).toBe(true);
    });

    test('should initialize with custom configuration', () => {
      const customConfig = {
        enableTrendAnalysis: false,
        enableBenchmarking: false
      };
      const analyticsInstance = new AdvancedAnalytics(null, customConfig);
      expect(analyticsInstance.config.enableTrendAnalysis).toBe(false);
      expect(analyticsInstance.config.enableBenchmarking).toBe(false);
    });
  });

  describe('performComprehensiveAnalysis', () => {
    test('should perform analysis on valid page data', async () => {
      const pageData = {
        url: 'https://example.com',
        domain: 'example.com',
        seo: {
          title: 'Test Page',
          metaDescription: 'Test description',
          headings: { h1: 1, h2: 2 }
        },
        content: {
          wordCount: 500,
          readingTime: 2,
          textQuality: 0.8
        },
        technical: {
          doctype: 'html5',
          htmlLang: 'en',
          charset: 'utf-8'
        },
        performance: {
          loadTime: 1500,
          pageSize: 1024000
        }
      };

      const result = await analytics.performComprehensiveAnalysis(pageData);
      
      expect(result).toBeDefined();
      expect(result.scores).toBeDefined();
      expect(result.scores.overall).toBeDefined();
      expect(result.scores.overall.score).toBeDefined();
      expect(typeof result.scores.overall.score).toBe('number');
      expect(result.scores).toBeDefined();
      // Recommendations should be an object with a recommendations array
      if (result.recommendations !== undefined && result.recommendations !== null) {
        expect(typeof result.recommendations).toBe('object');
        expect(Array.isArray(result.recommendations.recommendations)).toBe(true);
      }
    });

    test('should handle minimal page data', async () => {
      const minimalPageData = {
        url: 'https://example.com',
        domain: 'example.com'
      };

      const result = await analytics.performComprehensiveAnalysis(minimalPageData);
      
      expect(result).toBeDefined();
      expect(result.scores).toBeDefined();
      expect(result.scores.overall).toBeDefined();
      expect(result.scores.overall.score).toBeDefined();
      expect(typeof result.scores.overall.score).toBe('number');
    });

    test('should handle empty page data gracefully', async () => {
      const result = await analytics.performComprehensiveAnalysis({ url: 'https://example.com' });
      
      expect(result).toBeDefined();
      expect(result.scores).toBeDefined();
      expect(result.scores.overall).toBeDefined();
      expect(result.scores.overall.score).toBeDefined();
    });

    test('should return different scores for different quality content', async () => {
      const highQualityData = {
        url: 'https://example.com',
        seo: {
          title: 'High Quality SEO Title That Is Optimized',
          metaDescription: 'A well crafted meta description that accurately describes the page content and includes relevant keywords.',
          headings: { h1: 1, h2: 3, h3: 5 }
        },
        content: {
          wordCount: 1500,
          readingTime: 6,
          textQuality: 0.9
        },
        technical: {
          doctype: 'html5',
          htmlLang: 'en',
          charset: 'utf-8',
          hasSSL: true
        }
      };

      const lowQualityData = {
        url: 'https://example.com',
        seo: {
          title: 'Bad',
          metaDescription: '',
          headings: { h1: 0 }
        },
        content: {
          wordCount: 50,
          readingTime: 0.2,
          textQuality: 0.3
        },
        technical: {
          doctype: '',
          htmlLang: '',
          charset: ''
        }
      };

      const highQualityResult = await analytics.performComprehensiveAnalysis(highQualityData);
      const lowQualityResult = await analytics.performComprehensiveAnalysis(lowQualityData);
      
      expect(highQualityResult.scores.overall.score).toBeGreaterThan(lowQualityResult.scores.overall.score);
    });
  });

  describe('Error Handling', () => {
    test('should handle null input gracefully', async () => {
      const result = await analytics.performComprehensiveAnalysis(null);
      expect(result).toBeDefined();
    });

    test('should handle undefined input gracefully', async () => {
      const result = await analytics.performComprehensiveAnalysis(undefined);
      expect(result).toBeDefined();
    });
  });
});
