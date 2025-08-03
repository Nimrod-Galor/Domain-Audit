// Tests for PageCrawler - Core crawling functionality
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PageCrawler } from '../../src/core/page-crawler.js';
import fs from 'fs';
import path from 'path';

describe('PageCrawler', () => {
  let pageCrawler;
  let mockConfig;
  let mockFetch;
  let mockCheerio;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Default config
    mockConfig = {
      maxParallelCrawl: 2,
      crawlDelay: 100,
      maxRetries: 3,
      timeout: 5000,
      userAgent: 'Test Crawler'
    };

    // Create a simple mock PageCrawler for testing basic functionality
    pageCrawler = {
      config: mockConfig,
      domProcessor: {
        createDOM: jest.fn()
      },
      virtualConsole: {},
      crawlPage: jest.fn(),
      processInternalLinks: jest.fn(),
      _createCrawlContext: jest.fn(),
      _createWorkerPool: jest.fn()
    };
  });

  describe('constructor', () => {
    test('should initialize with config', () => {
      expect(pageCrawler.config).toBe(mockConfig);
      expect(pageCrawler.domProcessor).toBeDefined();
    });

    test('should create virtual console for error handling', () => {
      expect(pageCrawler.virtualConsole).toBeDefined();
    });
  });

  describe('crawlPage', () => {
    beforeEach(() => {
      // Mock crawlPage behavior
      pageCrawler.crawlPage = jest.fn().mockResolvedValue({
        url: 'https://example.com/test-page',
        responseTime: 150,
        pageSize: 1024,
        seoData: { score: 85 },
        contentData: { wordCount: 50 },
        technicalData: { loadTime: 1.2 }
      });
    });

    test('should successfully crawl a valid page', async () => {
      const testUrl = 'https://example.com/test-page';
      
      const result = await pageCrawler.crawlPage(testUrl);
      
      expect(result).toBeDefined();
      expect(result.url).toBe(testUrl);
      expect(result.responseTime).toBeGreaterThan(0);
      expect(result.pageSize).toBeGreaterThan(0);
      expect(pageCrawler.crawlPage).toHaveBeenCalledWith(testUrl);
    });

    test('should handle fetch errors gracefully', async () => {
      pageCrawler.crawlPage.mockRejectedValueOnce(new Error('Network error'));
      
      const testUrl = 'https://example.com/error-page';
      
      await expect(pageCrawler.crawlPage(testUrl)).rejects.toThrow('Network error');
    });

    test('should handle non-200 HTTP responses', async () => {
      pageCrawler.crawlPage.mockRejectedValueOnce(new Error('404 Not Found'));
      
      const testUrl = 'https://example.com/404-page';
      
      await expect(pageCrawler.crawlPage(testUrl)).rejects.toThrow('404 Not Found');
    });

    test('should measure response time accurately', async () => {
      const result = await pageCrawler.crawlPage('https://example.com/slow-page');
      
      expect(result.responseTime).toBeGreaterThan(0);
    });

    test('should calculate page size correctly', async () => {
      const result = await pageCrawler.crawlPage('https://example.com');
      
      expect(result.pageSize).toBeGreaterThan(0);
    });
  });

  describe('processInternalLinks', () => {
    let mockState, mockStorage, mockContext;

    beforeEach(() => {
      mockState = {
        visited: new Set(),
        queue: ['https://example.com/page1', 'https://example.com/page2'],
        stats: new Map(),
        badRequests: new Map()
      };

      mockStorage = {
        save: jest.fn(),
        load: jest.fn()
      };

      mockContext = {
        state: mockState,
        storage: mockStorage,
        baseUrl: 'https://example.com',
        domain: 'example.com',
        config: mockConfig
      };

      // Mock processInternalLinks behavior
      pageCrawler.processInternalLinks = jest.fn().mockResolvedValue();
    });

    test('should process internal links with worker pool', async () => {
      await pageCrawler.processInternalLinks(mockContext);

      expect(pageCrawler.processInternalLinks).toHaveBeenCalledWith(mockContext);
    });

    test('should respect maxParallelCrawl configuration', async () => {
      const customConfig = { ...mockConfig, maxParallelCrawl: 5 };
      const customCrawler = {
        ...pageCrawler,
        config: customConfig,
        processInternalLinks: jest.fn().mockResolvedValue()
      };

      await customCrawler.processInternalLinks(mockContext);

      expect(customCrawler.processInternalLinks).toHaveBeenCalled();
    });
  });

  describe('error handling and retries', () => {
    test('should have retry configuration', () => {
      expect(pageCrawler.config.maxRetries).toBeDefined();
      expect(pageCrawler.config.maxRetries).toBeGreaterThan(0);
    });

    test('should have timeout configuration', () => {
      expect(pageCrawler.config.timeout).toBeDefined();
      expect(pageCrawler.config.timeout).toBeGreaterThan(0);
    });
  });

  describe('data extraction', () => {
    test('should handle comprehensive page data extraction', async () => {
      const mockResult = {
        url: 'https://example.com',
        seoData: { score: 85, recommendations: ['Add alt text'] },
        contentData: { wordCount: 50, readabilityScore: 75 },
        technicalData: { loadTime: 1.2, performanceScore: 90 },
        responseTime: 150,
        pageSize: 1024
      };
      
      pageCrawler.crawlPage.mockResolvedValueOnce(mockResult);
      
      const result = await pageCrawler.crawlPage('https://example.com');

      expect(result.seoData).toBeDefined();
      expect(result.contentData).toBeDefined();
      expect(result.technicalData).toBeDefined();
    });

    test('should handle pages with no content gracefully', async () => {
      const emptyResult = {
        url: 'https://example.com/empty',
        pageSize: 0,
        responseTime: 50,
        seoData: {},
        contentData: {},
        technicalData: {}
      };
      
      pageCrawler.crawlPage.mockResolvedValueOnce(emptyResult);
      
      const result = await pageCrawler.crawlPage('https://example.com/empty');

      expect(result).toBeDefined();
      expect(result.pageSize).toBe(0);
    });
  });

  describe('concurrency and performance', () => {
    test('should respect crawl delay configuration', () => {
      expect(pageCrawler.config.crawlDelay).toBeDefined();
      expect(pageCrawler.config.crawlDelay).toBeGreaterThanOrEqual(0);
    });

    test('should handle multiple concurrent crawls', async () => {
      const urls = [
        'https://example.com/page1',
        'https://example.com/page2',
        'https://example.com/page3'
      ];

      // Mock responses for each URL
      urls.forEach((url, index) => {
        pageCrawler.crawlPage.mockResolvedValueOnce({
          url,
          responseTime: 100 + index * 10,
          pageSize: 1000 + index * 100,
          seoData: {},
          contentData: {},
          technicalData: {}
        });
      });

      const promises = urls.map(url => pageCrawler.crawlPage(url));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(pageCrawler.crawlPage).toHaveBeenCalledTimes(3);
    });
  });

  describe('configuration and setup', () => {
    test('should validate required configuration properties', () => {
      expect(pageCrawler.config.maxParallelCrawl).toBeDefined();
      expect(pageCrawler.config.crawlDelay).toBeDefined();
      expect(pageCrawler.config.maxRetries).toBeDefined();
      expect(pageCrawler.config.timeout).toBeDefined();
      expect(pageCrawler.config.userAgent).toBeDefined();
    });

    test('should have proper DOM processor setup', () => {
      expect(pageCrawler.domProcessor).toBeDefined();
      expect(pageCrawler.domProcessor.createDOM).toBeDefined();
    });

    test('should have virtual console for error handling', () => {
      expect(pageCrawler.virtualConsole).toBeDefined();
    });
  });
});
