/**
 * ============================================================================
 * TWITTER CARD ANALYZER - UNIT TESTS
 * ============================================================================
 * 
 * Unit tests for Twitter Card platform analyzer
 * Testing all real functions for Twitter Cards optimization
 * 
 * @author Nimrod Galor
 * @version 1.0.0
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { JSDOM } from 'jsdom';
import { TwitterCardAnalyzer } from '../../../../src/analyzers/social-media/platforms/twitter-card-analyzer.js';

describe('TwitterCardAnalyzer Unit Tests', () => {
  let analyzer;
  let mockDOM;

  beforeEach(() => {
    analyzer = new TwitterCardAnalyzer();
  });

  describe('Constructor and Initialization', () => {
    test('should initialize with default options', () => {
      expect(analyzer).toBeDefined();
      expect(analyzer.options).toBeDefined();
      expect(analyzer.requiredFields).toBeDefined();
      expect(analyzer.cardTypes).toBeDefined();
    });

    test('should have comprehensive card type support', () => {
      expect(analyzer.cardTypes).toContain('summary');
      expect(analyzer.cardTypes).toContain('summary_large_image');
      expect(analyzer.cardTypes).toContain('app');
      expect(analyzer.cardTypes).toContain('player');
    });

    test('should define required fields correctly', () => {
      expect(analyzer.requiredFields.summary).toContain('card');
      expect(analyzer.requiredFields.summary).toContain('title');
      expect(analyzer.requiredFields.summary).toContain('description');
    });
  });

  describe('Basic Twitter Card Analysis', () => {
    beforeEach(() => {
      const twitterHTML = `
        <html>
        <head>
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:site" content="@amazingcompany">
          <meta name="twitter:creator" content="@johndoe">
          <meta name="twitter:title" content="Amazing Product - Transform Your Business">
          <meta name="twitter:description" content="Discover our incredible solution that has helped 10,000+ businesses achieve outstanding results.">
          <meta name="twitter:image" content="https://example.com/twitter-image.jpg">
          <meta name="twitter:image:alt" content="Product showcase image">
        </head>
        <body></body>
        </html>
      `;
      mockDOM = new JSDOM(twitterHTML);
    });

    test('analyze should return complete Twitter Card analysis', () => {
      const document = mockDOM.window.document;
      const url = 'https://example.com';

      const result = analyzer.analyze(document, url);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('cardType');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('image');
      expect(result).toHaveProperty('site');
      expect(result).toHaveProperty('creator');
      expect(result).toHaveProperty('validation');
      expect(result).toHaveProperty('optimization');
      expect(result).toHaveProperty('score');
    });

    test('_extractBasicTwitterData should extract core Twitter Card properties', () => {
      const document = mockDOM.window.document;

      const result = analyzer._extractBasicTwitterData(document);

      expect(result).toBeDefined();
      expect(result.cardType).toBe('summary_large_image');
      expect(result.site).toBe('@amazingcompany');
      expect(result.creator).toBe('@johndoe');
      expect(result.title).toBe('Amazing Product - Transform Your Business');
      expect(result.description).toContain('Discover our incredible solution');
      expect(result.image).toBe('https://example.com/twitter-image.jpg');
      expect(result.imageAlt).toBe('Product showcase image');
    });

    test('_validateTwitterCard should validate card structure', () => {
      const document = mockDOM.window.document;

      const result = analyzer._validateTwitterCard(document);

      expect(result).toBeDefined();
      expect(result.isValid).toBe(true);
      expect(result.cardType).toBe('summary_large_image');
      expect(result.hasRequiredFields).toBe(true);
      expect(result.missingFields).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    test('_optimizeTwitterCard should provide optimization recommendations', () => {
      const document = mockDOM.window.document;
      const url = 'https://example.com';

      const result = analyzer._optimizeTwitterCard(document, url);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('titleOptimization');
      expect(result).toHaveProperty('descriptionOptimization');
      expect(result).toHaveProperty('imageOptimization');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('score');
    });
  });

  describe('Card Type Analysis', () => {
    test('should detect summary card correctly', () => {
      const summaryHTML = `
        <html>
        <head>
          <meta name="twitter:card" content="summary">
          <meta name="twitter:title" content="Article Title">
          <meta name="twitter:description" content="Article description">
          <meta name="twitter:image" content="https://example.com/image.jpg">
        </head>
        <body></body>
        </html>
      `;
      const summaryDOM = new JSDOM(summaryHTML);
      const document = summaryDOM.window.document;

      const result = analyzer._extractBasicTwitterData(document);

      expect(result.cardType).toBe('summary');
    });

    test('should detect summary_large_image card correctly', () => {
      const largeImageHTML = `
        <html>
        <head>
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:title" content="Product Title">
          <meta name="twitter:description" content="Product description">
          <meta name="twitter:image" content="https://example.com/large-image.jpg">
        </head>
        <body></body>
        </html>
      `;
      const largeImageDOM = new JSDOM(largeImageHTML);
      const document = largeImageDOM.window.document;

      const result = analyzer._extractBasicTwitterData(document);

      expect(result.cardType).toBe('summary_large_image');
    });

    test('should detect app card correctly', () => {
      const appHTML = `
        <html>
        <head>
          <meta name="twitter:card" content="app">
          <meta name="twitter:title" content="Amazing App">
          <meta name="twitter:description" content="Download our amazing app">
          <meta name="twitter:app:name:iphone" content="Amazing App">
          <meta name="twitter:app:id:iphone" content="123456789">
          <meta name="twitter:app:url:iphone" content="amazingapp://open">
        </head>
        <body></body>
        </html>
      `;
      const appDOM = new JSDOM(appHTML);
      const document = appDOM.window.document;

      const result = analyzer._extractBasicTwitterData(document);

      expect(result.cardType).toBe('app');
    });

    test('should detect player card correctly', () => {
      const playerHTML = `
        <html>
        <head>
          <meta name="twitter:card" content="player">
          <meta name="twitter:title" content="Video Title">
          <meta name="twitter:description" content="Watch this amazing video">
          <meta name="twitter:player" content="https://example.com/player.html">
          <meta name="twitter:player:width" content="1280">
          <meta name="twitter:player:height" content="720">
        </head>
        <body></body>
        </html>
      `;
      const playerDOM = new JSDOM(playerHTML);
      const document = playerDOM.window.document;

      const result = analyzer._extractBasicTwitterData(document);

      expect(result.cardType).toBe('player');
    });
  });

  describe('Advanced Features Analysis', () => {
    test('_analyzeAppCard should extract app-specific metadata', () => {
      const appHTML = `
        <html>
        <head>
          <meta name="twitter:card" content="app">
          <meta name="twitter:app:name:iphone" content="Amazing App">
          <meta name="twitter:app:id:iphone" content="123456789">
          <meta name="twitter:app:url:iphone" content="amazingapp://open">
          <meta name="twitter:app:name:ipad" content="Amazing App HD">
          <meta name="twitter:app:id:ipad" content="987654321">
          <meta name="twitter:app:name:googleplay" content="Amazing App Android">
          <meta name="twitter:app:id:googleplay" content="com.amazing.app">
        </head>
        <body></body>
        </html>
      `;
      const appDOM = new JSDOM(appHTML);
      const document = appDOM.window.document;

      const result = analyzer._analyzeAppCard(document);

      expect(result).toBeDefined();
      expect(result.iphone).toBeDefined();
      expect(result.iphone.name).toBe('Amazing App');
      expect(result.iphone.id).toBe('123456789');
      expect(result.iphone.url).toBe('amazingapp://open');

      expect(result.ipad).toBeDefined();
      expect(result.ipad.name).toBe('Amazing App HD');
      expect(result.ipad.id).toBe('987654321');

      expect(result.googleplay).toBeDefined();
      expect(result.googleplay.name).toBe('Amazing App Android');
      expect(result.googleplay.id).toBe('com.amazing.app');
    });

    test('_analyzePlayerCard should extract video player metadata', () => {
      const playerHTML = `
        <html>
        <head>
          <meta name="twitter:card" content="player">
          <meta name="twitter:player" content="https://example.com/player.html">
          <meta name="twitter:player:width" content="1280">
          <meta name="twitter:player:height" content="720">
          <meta name="twitter:player:stream" content="https://example.com/video.mp4">
          <meta name="twitter:player:stream:content_type" content="video/mp4">
        </head>
        <body></body>
        </html>
      `;
      const playerDOM = new JSDOM(playerHTML);
      const document = playerDOM.window.document;

      const result = analyzer._analyzePlayerCard(document);

      expect(result).toBeDefined();
      expect(result.player).toBe('https://example.com/player.html');
      expect(result.width).toBe('1280');
      expect(result.height).toBe('720');
      expect(result.stream).toBe('https://example.com/video.mp4');
      expect(result.streamContentType).toBe('video/mp4');
    });

    test('_analyzeImageProperties should validate image dimensions and format', () => {
      const imageHTML = `
        <html>
        <head>
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:image" content="https://example.com/image.jpg">
          <meta name="twitter:image:alt" content="Product image showcasing features">
        </head>
        <body></body>
        </html>
      `;
      const imageDOM = new JSDOM(imageHTML);
      const document = imageDOM.window.document;

      const result = analyzer._analyzeImageProperties(document);

      expect(result).toBeDefined();
      expect(result.image).toBe('https://example.com/image.jpg');
      expect(result.alt).toBe('Product image showcasing features');
      expect(result.hasAlt).toBe(true);
      expect(result.isSecure).toBe(true); // HTTPS URL
    });
  });

  describe('Validation Tests', () => {
    test('_validateRequiredFields should check for missing required fields', () => {
      const incompleteHTML = `
        <html>
        <head>
          <meta name="twitter:card" content="summary">
          <meta name="twitter:title" content="Title Only">
          <!-- Missing description and image -->
        </head>
        <body></body>
        </html>
      `;
      const incompleteDOM = new JSDOM(incompleteHTML);
      const document = incompleteDOM.window.document;

      const result = analyzer._validateRequiredFields(document, 'summary');

      expect(result).toBeDefined();
      expect(result.hasAllRequired).toBe(false);
      expect(result.missingFields).toContain('description');
      expect(result.missingFields.length).toBeGreaterThan(0);
    });

    test('_validateSiteAndCreator should validate Twitter handles', () => {
      const testCases = [
        { site: '@validhandle', creator: '@validcreator', expected: { siteValid: true, creatorValid: true } },
        { site: 'invalidhandle', creator: '@validcreator', expected: { siteValid: false, creatorValid: true } },
        { site: '@valid', creator: 'invalid', expected: { siteValid: true, creatorValid: false } },
        { site: '', creator: '', expected: { siteValid: false, creatorValid: false } }
      ];

      testCases.forEach(({ site, creator, expected }) => {
        const result = analyzer._validateSiteAndCreator(site, creator);
        expect(result.siteValid).toBe(expected.siteValid);
        expect(result.creatorValid).toBe(expected.creatorValid);
      });
    });

    test('_validateImageUrl should check image URL validity', () => {
      const testCases = [
        { url: 'https://example.com/image.jpg', expected: { isValid: true, isSecure: true } },
        { url: 'http://example.com/image.jpg', expected: { isValid: true, isSecure: false } },
        { url: 'invalid-url', expected: { isValid: false } },
        { url: '', expected: { isValid: false } }
      ];

      testCases.forEach(({ url, expected }) => {
        const result = analyzer._validateImageUrl(url);
        expect(result.isValid).toBe(expected.isValid);
        if (expected.isSecure !== undefined) {
          expect(result.isSecure).toBe(expected.isSecure);
        }
      });
    });
  });

  describe('Content Optimization Tests', () => {
    test('_optimizeTitle should check title length and quality', () => {
      const testCases = [
        { title: 'Perfect Length Title for Twitter', expected: { isOptimal: true } },
        { title: 'Short', expected: { isOptimal: false, issue: 'tooShort' } },
        { title: 'This is an extremely long title that exceeds the recommended character limit for Twitter Cards and will likely be truncated when displayed on the platform', expected: { isOptimal: false, issue: 'tooLong' } },
        { title: '', expected: { isOptimal: false, issue: 'missing' } }
      ];

      testCases.forEach(({ title, expected }) => {
        const result = analyzer._optimizeTitle(title);
        expect(result).toBeDefined();
        expect(result.isOptimal).toBe(expected.isOptimal);
        if (!expected.isOptimal) {
          expect(result.issues).toContain(expected.issue);
        }
      });
    });

    test('_optimizeDescription should check description quality', () => {
      const testCases = [
        { 
          description: 'This is a perfect description with good length and engaging content for Twitter.', 
          expected: { isOptimal: true } 
        },
        { 
          description: 'Too short', 
          expected: { isOptimal: false, issue: 'tooShort' } 
        },
        { 
          description: 'This is an extremely long description that exceeds the recommended character limits for Twitter Cards and will be truncated when displayed on the Twitter platform, potentially reducing user engagement and click-through rates significantly.', 
          expected: { isOptimal: false, issue: 'tooLong' } 
        },
        { 
          description: '', 
          expected: { isOptimal: false, issue: 'missing' } 
        }
      ];

      testCases.forEach(({ description, expected }) => {
        const result = analyzer._optimizeDescription(description);
        expect(result).toBeDefined();
        expect(result.isOptimal).toBe(expected.isOptimal);
        if (!expected.isOptimal) {
          expect(result.issues).toContain(expected.issue);
        }
      });
    });

    test('_checkImageOptimization should validate image for Twitter', () => {
      const testCases = [
        { 
          cardType: 'summary_large_image',
          image: 'https://example.com/image.jpg',
          alt: 'Great alt text',
          expected: { score: '>70' }
        },
        { 
          cardType: 'summary',
          image: 'http://example.com/image.jpg',
          alt: '',
          expected: { score: '<50' } // Insecure and no alt text
        }
      ];

      testCases.forEach(({ cardType, image, alt, expected }) => {
        const result = analyzer._checkImageOptimization(cardType, image, alt);
        expect(result).toBeDefined();
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
        
        if (expected.score.startsWith('>')) {
          const threshold = parseInt(expected.score.substring(1));
          expect(result.score).toBeGreaterThan(threshold);
        } else if (expected.score.startsWith('<')) {
          const threshold = parseInt(expected.score.substring(1));
          expect(result.score).toBeLessThan(threshold);
        }
      });
    });
  });

  describe('Scoring System Tests', () => {
    test('_calculateScore should return valid score', () => {
      const mockAnalysis = {
        cardType: 'summary_large_image',
        validation: { isValid: true, hasRequiredFields: true, errors: [] },
        optimization: { score: 85 }
      };

      const score = analyzer._calculateScore(mockAnalysis);

      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(score).toBeGreaterThan(70); // Should be high for valid analysis
    });

    test('_calculateScore should penalize missing required fields', () => {
      const incompleteAnalysis = {
        cardType: 'summary',
        validation: { isValid: false, hasRequiredFields: false, errors: ['Missing description'] },
        optimization: { score: 50 }
      };

      const score = analyzer._calculateScore(incompleteAnalysis);

      expect(score).toBeLessThan(50); // Should be penalized
    });

    test('_calculateScore should reward complete implementations', () => {
      const completeAnalysis = {
        cardType: 'summary_large_image',
        site: '@company',
        creator: '@author',
        validation: { isValid: true, hasRequiredFields: true, errors: [] },
        optimization: { score: 90 }
      };

      const score = analyzer._calculateScore(completeAnalysis);

      expect(score).toBeGreaterThan(80); // Should be rewarded for completeness
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle empty document gracefully', () => {
      const emptyDOM = new JSDOM('<html><head></head><body></body></html>');
      const document = emptyDOM.window.document;

      const result = analyzer.analyze(document, 'https://example.com');

      expect(result).toBeDefined();
      expect(result.cardType).toBeNull();
      expect(result.validation.isValid).toBe(false);
      expect(result.score).toBeDefined();
    });

    test('should handle malformed Twitter meta tags gracefully', () => {
      const malformedHTML = `
        <html>
        <head>
          <meta name="twitter:card">
          <meta name="twitter:title" content="">
          <meta name="twitter:image" content="invalid-url">
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
    test('should analyze large documents efficiently', () => {
      let largeHTML = '<html><head>';
      for (let i = 0; i < 200; i++) {
        largeHTML += `<meta name="twitter:extra${i}" content="Extra content ${i}">`;
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

  describe('Integration with Twitter Platform Tests', () => {
    test('should generate platform-specific recommendations', () => {
      const document = mockDOM.window.document;
      const result = analyzer.analyze(document, 'https://example.com');

      expect(result.optimization.recommendations).toBeDefined();
      expect(Array.isArray(result.optimization.recommendations)).toBe(true);
      
      if (result.optimization.recommendations.length > 0) {
        const rec = result.optimization.recommendations[0];
        expect(rec).toHaveProperty('type');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('description');
      }
    });

    test('should validate card type compatibility', () => {
      const validCardTypes = ['summary', 'summary_large_image', 'app', 'player'];
      
      validCardTypes.forEach(cardType => {
        const html = `
          <html>
          <head>
            <meta name="twitter:card" content="${cardType}">
            <meta name="twitter:title" content="Test Title">
            <meta name="twitter:description" content="Test Description">
          </head>
          <body></body>
          </html>
        `;
        const dom = new JSDOM(html);
        const result = analyzer.analyze(dom.window.document, 'https://example.com');
        
        expect(result.cardType).toBe(cardType);
        expect(analyzer.cardTypes).toContain(cardType);
      });
    });
  });
});

console.log('✅ Twitter Card Analyzer unit tests completed');
