import { describe, test, expect, beforeEach } from '@jest/globals';
import { JSDOM } from 'jsdom';
import TwitterCardAnalyzer from '../../../src/analyzers/social-media/platforms/twitter-card-analyzer.js';

describe('TwitterCardAnalyzer - Core Functionality Tests', () => {
  let analyzer;
  let mockDOM;

  beforeEach(() => {
    analyzer = new TwitterCardAnalyzer();
    
    const html = `
      <html>
      <head>
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="Test Page">
        <meta name="twitter:description" content="A comprehensive test page for Twitter Card validation">
        <meta name="twitter:image" content="https://example.com/image.jpg">
        <meta name="twitter:site" content="@testsite">
        <meta name="twitter:creator" content="@testcreator">
      </head>
      <body><h1>Test Content</h1></body>
      </html>
    `;
    
    mockDOM = new JSDOM(html);
  });

  describe('Basic Functionality', () => {
    test('should initialize correctly', () => {
      expect(analyzer).toBeDefined();
      expect(analyzer.name).toBe('TwitterCardAnalyzer');
    });

    test('analyze should return complete results', async () => {
      const context = {
        document: mockDOM.window.document,
        url: 'https://example.com',
        pageData: {}
      };

      const result = await analyzer.analyze(context);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.score).toBeDefined();
      expect(typeof result.data.score).toBe('number');
    });

    test('should handle empty documents', async () => {
      const emptyHTML = `<html><head></head><body></body></html>`;
      const emptyDOM = new JSDOM(emptyHTML);
      
      const result = await analyzer.analyze({
        document: emptyDOM.window.document,
        url: 'https://example.com',
        pageData: {}
      });

      expect(result.success).toBe(true);
      expect(result.data.score).toBeDefined();
    });
  });

  console.log('✅ Twitter Card Analyzer tests completed');
});
