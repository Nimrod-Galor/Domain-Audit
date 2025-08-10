/**
 * ============================================================================
 * OPEN GRAPH ANALYZER - UNIT TESTS
 * ============================================================================
 * 
 * Unit tests for Open Graph platform analyzer
 * Testing all real functions and implementation details
 * 
 * @author Nimrod Galor
 * @version 1.0.0
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { JSDOM } from 'jsdom';
import { OpenGraphAnalyzer } from '../../../src/analyzers/social-media/platforms/open-graph-analyzer.js';

describe('OpenGraphAnalyzer Unit Tests', () => {
  let analyzer;
  let mockDOM;

  beforeEach(() => {
    analyzer = new OpenGraphAnalyzer();
  });

  describe('Constructor and Initialization', () => {
    test('should initialize with default options', () => {
      expect(analyzer).toBeDefined();
      expect(analyzer.options).toBeDefined();
    });

    test('should initialize with custom options', () => {
      const customAnalyzer = new OpenGraphAnalyzer({ strict: true });
      expect(customAnalyzer.options.strict).toBe(true);
    });
  });

  describe('Basic Open Graph Analysis', () => {
    beforeEach(() => {
      const basicHTML = `
        <html>
        <head>
          <meta property="og:title" content="Amazing Product Title">
          <meta property="og:description" content="This is an amazing product that will transform your business.">
          <meta property="og:image" content="https://example.com/image.jpg">
          <meta property="og:url" content="https://example.com/product">
          <meta property="og:type" content="product">
          <meta property="og:site_name" content="Amazing Company">
          <meta property="og:locale" content="en_US">
        </head>
        <body></body>
        </html>
      `;
      mockDOM = new JSDOM(basicHTML);
    });

    test('analyze should return complete analysis structure', () => {
      const document = mockDOM.window.document;
      const url = 'https://example.com';

      const result = analyzer.analyze(document, url);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('basic');
      expect(result).toHaveProperty('extended');
      expect(result).toHaveProperty('validation');
      expect(result).toHaveProperty('optimization');
      expect(result).toHaveProperty('score');
    });

    test('_analyzeBasicOG should extract basic Open Graph properties', () => {
      const document = mockDOM.window.document;

      const result = analyzer._analyzeBasicOG(document);

      expect(result).toBeDefined();
      expect(result.title).toBe('Amazing Product Title');
      expect(result.description).toBe('This is an amazing product that will transform your business.');
      expect(result.image).toBe('https://example.com/image.jpg');
      expect(result.url).toBe('https://example.com/product');
      expect(result.type).toBe('product');
      expect(result.siteName).toBe('Amazing Company');
      expect(result.locale).toBe('en_US');
    });

    test('_analyzeExtendedOG should extract extended properties', () => {
      const extendedHTML = `
        <html>
        <head>
          <meta property="og:title" content="Article Title">
          <meta property="og:type" content="article">
          <meta property="article:author" content="John Doe">
          <meta property="article:published_time" content="2024-01-15T10:00:00Z">
          <meta property="article:section" content="Technology">
          <meta property="article:tag" content="AI">
          <meta property="article:tag" content="Technology">
          <meta property="product:price:amount" content="99.99">
          <meta property="product:price:currency" content="USD">
        </head>
        <body></body>
        </html>
      `;
      const extendedDOM = new JSDOM(extendedHTML);
      const document = extendedDOM.window.document;

      const result = analyzer._analyzeExtendedOG(document);

      expect(result).toBeDefined();
      expect(result.article).toBeDefined();
      expect(result.article.author).toBe('John Doe');
      expect(result.article.publishedTime).toBe('2024-01-15T10:00:00Z');
      expect(result.article.section).toBe('Technology');
      expect(result.article.tags).toContain('AI');
      expect(result.article.tags).toContain('Technology');

      expect(result.product).toBeDefined();
      expect(result.product.price.amount).toBe('99.99');
      expect(result.product.price.currency).toBe('USD');
    });

    test('_validateOGTags should validate required properties', () => {
      const document = mockDOM.window.document;

      const result = analyzer._validateOGTags(document);

      expect(result).toBeDefined();
      expect(result.hasRequired).toBe(true);
      expect(result.missingRequired).toEqual([]);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toBeDefined();
    });

    test('_validateOGTags should detect missing required properties', () => {
      const incompleteHTML = `
        <html>
        <head>
          <meta property="og:title" content="Test Title">
          <!-- Missing description, image, url -->
        </head>
        <body></body>
        </html>
      `;
      const incompleteDOM = new JSDOM(incompleteHTML);
      const document = incompleteDOM.window.document;

      const result = analyzer._validateOGTags(document);

      expect(result.hasRequired).toBe(false);
      expect(result.missingRequired).toContain('description');
      expect(result.missingRequired).toContain('image');
      expect(result.missingRequired).toContain('url');
    });

    test('_checkOptimization should analyze optimization opportunities', () => {
      const document = mockDOM.window.document;
      const url = 'https://example.com';

      const result = analyzer._checkOptimization(document, url);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('titleOptimization');
      expect(result).toHaveProperty('descriptionOptimization');
      expect(result).toHaveProperty('imageOptimization');
      expect(result).toHaveProperty('urlOptimization');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('score');
    });
  });

  describe('Content Validation Tests', () => {
    test('_validateTitle should check title length and quality', () => {
      const testCases = [
        { title: 'Perfect Title Length', expected: { isOptimal: true } },
        { title: 'Too Short', expected: { isOptimal: false, issue: 'length' } },
        { title: 'This is an extremely long title that exceeds the recommended character limits for Open Graph titles and should be flagged as too long', expected: { isOptimal: false, issue: 'length' } },
        { title: '', expected: { isOptimal: false, issue: 'missing' } }
      ];

      testCases.forEach(({ title, expected }) => {
        const result = analyzer._validateTitle(title);
        expect(result).toBeDefined();
        expect(result.isOptimal).toBe(expected.isOptimal);
        if (!expected.isOptimal && expected.issue) {
          expect(result.issues).toContain(expected.issue);
        }
      });
    });

    test('_validateDescription should check description quality', () => {
      const testCases = [
        { 
          description: 'This is a perfect description with good length and engaging content that describes the product effectively.', 
          expected: { isOptimal: true } 
        },
        { 
          description: 'Too short', 
          expected: { isOptimal: false, issue: 'length' } 
        },
        { 
          description: 'This is an extremely long description that goes way beyond the recommended character limits for Open Graph descriptions and should be flagged as too verbose and potentially truncated by social media platforms when shared which could impact user engagement and click-through rates significantly.', 
          expected: { isOptimal: false, issue: 'length' } 
        },
        { 
          description: '', 
          expected: { isOptimal: false, issue: 'missing' } 
        }
      ];

      testCases.forEach(({ description, expected }) => {
        const result = analyzer._validateDescription(description);
        expect(result).toBeDefined();
        expect(result.isOptimal).toBe(expected.isOptimal);
        if (!expected.isOptimal && expected.issue) {
          expect(result.issues).toContain(expected.issue);
        }
      });
    });

    test('_validateImage should check image URL and properties', () => {
      const testCases = [
        { 
          image: 'https://example.com/image.jpg', 
          expected: { isValid: true } 
        },
        { 
          image: 'http://example.com/insecure.jpg', 
          expected: { isValid: false, issue: 'protocol' } 
        },
        { 
          image: 'invalid-url', 
          expected: { isValid: false, issue: 'format' } 
        },
        { 
          image: '', 
          expected: { isValid: false, issue: 'missing' } 
        }
      ];

      testCases.forEach(({ image, expected }) => {
        const result = analyzer._validateImage(image);
        expect(result).toBeDefined();
        expect(result.isValid).toBe(expected.isValid);
        if (!expected.isValid && expected.issue) {
          expect(result.issues).toContain(expected.issue);
        }
      });
    });

    test('_validateUrl should check URL format and consistency', () => {
      const testCases = [
        { 
          url: 'https://example.com/page',
          pageUrl: 'https://example.com/page',
          expected: { isValid: true, isConsistent: true } 
        },
        { 
          url: 'https://example.com/different',
          pageUrl: 'https://example.com/page',
          expected: { isValid: true, isConsistent: false } 
        },
        { 
          url: 'invalid-url',
          pageUrl: 'https://example.com/page',
          expected: { isValid: false } 
        }
      ];

      testCases.forEach(({ url, pageUrl, expected }) => {
        const result = analyzer._validateUrl(url, pageUrl);
        expect(result).toBeDefined();
        expect(result.isValid).toBe(expected.isValid);
        if (expected.isConsistent !== undefined) {
          expect(result.isConsistent).toBe(expected.isConsistent);
        }
      });
    });
  });

  describe('Advanced Features Tests', () => {
    test('_analyzeLocalization should detect locale and alternate languages', () => {
      const localizationHTML = `
        <html>
        <head>
          <meta property="og:locale" content="en_US">
          <meta property="og:locale:alternate" content="es_ES">
          <meta property="og:locale:alternate" content="fr_FR">
        </head>
        <body></body>
        </html>
      `;
      const localizationDOM = new JSDOM(localizationHTML);
      const document = localizationDOM.window.document;

      const result = analyzer._analyzeLocalization(document);

      expect(result).toBeDefined();
      expect(result.primaryLocale).toBe('en_US');
      expect(result.alternateLocales).toContain('es_ES');
      expect(result.alternateLocales).toContain('fr_FR');
      expect(result.isInternational).toBe(true);
    });

    test('_analyzeImageProperties should extract image dimensions and format', () => {
      const imageHTML = `
        <html>
        <head>
          <meta property="og:image" content="https://example.com/image.jpg">
          <meta property="og:image:width" content="1200">
          <meta property="og:image:height" content="630">
          <meta property="og:image:alt" content="Product Image">
          <meta property="og:image:type" content="image/jpeg">
        </head>
        <body></body>
        </html>
      `;
      const imageDOM = new JSDOM(imageHTML);
      const document = imageDOM.window.document;

      const result = analyzer._analyzeImageProperties(document);

      expect(result).toBeDefined();
      expect(result.images).toBeDefined();
      expect(result.images.length).toBeGreaterThan(0);
      
      const firstImage = result.images[0];
      expect(firstImage.url).toBe('https://example.com/image.jpg');
      expect(firstImage.width).toBe('1200');
      expect(firstImage.height).toBe('630');
      expect(firstImage.alt).toBe('Product Image');
      expect(firstImage.type).toBe('image/jpeg');
    });

    test('_analyzeVideoProperties should extract video metadata', () => {
      const videoHTML = `
        <html>
        <head>
          <meta property="og:video" content="https://example.com/video.mp4">
          <meta property="og:video:width" content="1920">
          <meta property="og:video:height" content="1080">
          <meta property="og:video:type" content="video/mp4">
          <meta property="og:video:duration" content="120">
        </head>
        <body></body>
        </html>
      `;
      const videoDOM = new JSDOM(videoHTML);
      const document = videoDOM.window.document;

      const result = analyzer._analyzeVideoProperties(document);

      expect(result).toBeDefined();
      expect(result.videos).toBeDefined();
      expect(result.videos.length).toBeGreaterThan(0);
      
      const firstVideo = result.videos[0];
      expect(firstVideo.url).toBe('https://example.com/video.mp4');
      expect(firstVideo.width).toBe('1920');
      expect(firstVideo.height).toBe('1080');
      expect(firstVideo.type).toBe('video/mp4');
      expect(firstVideo.duration).toBe('120');
    });
  });

  describe('Scoring System Tests', () => {
    test('_calculateScore should return valid score', () => {
      const mockAnalysis = {
        basic: { title: 'Test', description: 'Test desc', image: 'https://test.com/img.jpg', url: 'https://test.com' },
        validation: { hasRequired: true, missingRequired: [], errors: [] },
        optimization: { score: 85 }
      };

      const score = analyzer._calculateScore(mockAnalysis);

      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('_calculateScore should penalize missing required fields', () => {
      const incompleteAnalysis = {
        basic: { title: 'Test', description: '', image: '', url: '' },
        validation: { hasRequired: false, missingRequired: ['description', 'image', 'url'], errors: [] },
        optimization: { score: 50 }
      };

      const score = analyzer._calculateScore(incompleteAnalysis);

      expect(score).toBeLessThan(50); // Should be penalized for missing fields
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle empty document gracefully', () => {
      const emptyDOM = new JSDOM('<html><head></head><body></body></html>');
      const document = emptyDOM.window.document;

      const result = analyzer.analyze(document, 'https://example.com');

      expect(result).toBeDefined();
      expect(result.basic).toBeDefined();
      expect(result.validation).toBeDefined();
      expect(result.score).toBeDefined();
    });

    test('should handle malformed meta tags gracefully', () => {
      const malformedHTML = `
        <html>
        <head>
          <meta property="og:title">
          <meta property="og:description" content="">
          <meta property="og:image" content="invalid-url">
        </head>
        <body></body>
        </html>
      `;
      const malformedDOM = new JSDOM(malformedHTML);
      const document = malformedDOM.window.document;

      const result = analyzer.analyze(document, 'https://example.com');

      expect(result).toBeDefined();
      expect(result.validation.errors.length).toBeGreaterThan(0);
    });

    test('should handle null/undefined inputs gracefully', () => {
      expect(() => analyzer.analyze(null, 'https://example.com')).not.toThrow();
      expect(() => analyzer.analyze(undefined, 'https://example.com')).not.toThrow();
    });
  });

  describe('Performance Tests', () => {
    test('should analyze large number of meta tags efficiently', () => {
      let largeHTML = '<html><head>';
      for (let i = 0; i < 500; i++) {
        largeHTML += `<meta property="og:extra${i}" content="Content ${i}">`;
      }
      largeHTML += '</head><body></body></html>';

      const largeDOM = new JSDOM(largeHTML);
      const document = largeDOM.window.document;

      const startTime = Date.now();
      const result = analyzer.analyze(document, 'https://example.com');
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result).toBeDefined();
    });
  });
});

console.log('✅ Open Graph Analyzer unit tests completed');
