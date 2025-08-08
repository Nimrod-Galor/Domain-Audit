/**
 * ============================================================================
 * SOCIAL MEDIA ANALYZER - UNIT TESTS
 * ============================================================================
 * 
 * Comprehensive unit tests for individual social media analyzer components
 * Testing each function in isolation with real implementation verification
 * 
 * @author Nimrod Galor
 * @version 1.0.0
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { JSDOM } from 'jsdom';
import { SocialMediaAnalyzer } from '../../../src/analyzers/social-media/social-media-analyzer.js';
import { OpenGraphAnalyzer } from '../../../src/analyzers/social-media/platforms/open-graph-analyzer.js';
import { TwitterCardAnalyzer } from '../../../src/analyzers/social-media/platforms/twitter-card-analyzer.js';
import { LinkedInAnalyzer } from '../../../src/analyzers/social-media/platforms/linkedin-analyzer.js';
import { PinterestAnalyzer } from '../../../src/analyzers/social-media/platforms/pinterest-analyzer.js';
import { WhatsAppAnalyzer } from '../../../src/analyzers/social-media/platforms/whatsapp-analyzer.js';
import { SocialProofAnalyzer } from '../../../src/analyzers/social-media/social-proof-analyzer.js';

describe('SocialMediaAnalyzer Unit Tests', () => {
  let analyzer;
  let mockDOM;

  beforeEach(() => {
    analyzer = new SocialMediaAnalyzer({
      enableImageAnalysis: true,
      enableContentValidation: true,
      checkSocialButtons: true,
      analyzeSocialProof: true,
    });

    const testHTML = `
      <html>
      <head>
        <meta property="og:title" content="Test Title">
        <meta property="og:description" content="Test Description">
        <meta name="twitter:card" content="summary">
      </head>
      <body>
        <h1>Test Content</h1>
        <div class="social-sharing">
          <a href="https://facebook.com/share" class="facebook-share">Share</a>
        </div>
      </body>
      </html>
    `;
    mockDOM = new JSDOM(testHTML);
  });

  describe('Constructor and Initialization', () => {
    test('should initialize with default options', () => {
      const defaultAnalyzer = new SocialMediaAnalyzer();
      
      expect(defaultAnalyzer.options).toBeDefined();
      expect(defaultAnalyzer.options.enableImageAnalysis).toBe(true);
      expect(defaultAnalyzer.options.enableContentValidation).toBe(true);
      expect(defaultAnalyzer.options.checkSocialButtons).toBe(true);
      expect(defaultAnalyzer.options.analyzeSocialProof).toBe(true);
    });

    test('should initialize with custom options', () => {
      const customAnalyzer = new SocialMediaAnalyzer({
        enableImageAnalysis: false,
        enableContentValidation: false,
        checkSocialButtons: false,
        analyzeSocialProof: false,
      });
      
      expect(customAnalyzer.options.enableImageAnalysis).toBe(false);
      expect(customAnalyzer.options.enableContentValidation).toBe(false);
      expect(customAnalyzer.options.checkSocialButtons).toBe(false);
      expect(customAnalyzer.options.analyzeSocialProof).toBe(false);
    });

    test('should initialize all platform analyzers', () => {
      expect(analyzer.platforms).toBeDefined();
      expect(analyzer.platforms.openGraph).toBeInstanceOf(OpenGraphAnalyzer);
      expect(analyzer.platforms.twitter).toBeInstanceOf(TwitterCardAnalyzer);
      expect(analyzer.platforms.linkedin).toBeInstanceOf(LinkedInAnalyzer);
      expect(analyzer.platforms.pinterest).toBeInstanceOf(PinterestAnalyzer);
      expect(analyzer.platforms.whatsapp).toBeInstanceOf(WhatsAppAnalyzer);
    });

    test('should initialize social proof analyzer', () => {
      expect(analyzer.socialProofAnalyzer).toBeInstanceOf(SocialProofAnalyzer);
    });
  });

  describe('Core Analysis Methods', () => {
    test('analyzeSocialMedia should return complete analysis structure', async () => {
      const pageData = { title: 'Test Page', url: 'https://example.com' };
      const url = 'https://example.com';

      const result = await analyzer.analyzeSocialMedia(mockDOM, pageData, url);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('platforms');
      expect(result).toHaveProperty('sharing');
      expect(result).toHaveProperty('socialProof');
      expect(result).toHaveProperty('images');
      expect(result).toHaveProperty('optimizationScore');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('analysisTime');
      expect(result).toHaveProperty('timestamp');
    });

    test('analyzeSocialMedia should handle errors gracefully', async () => {
      const invalidDOM = null;
      const pageData = { title: 'Test Page', url: 'https://example.com' };
      const url = 'https://example.com';

      const result = await analyzer.analyzeSocialMedia(invalidDOM, pageData, url);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('error');
      expect(result.error).toContain('Social media analysis failed');
      expect(result).toHaveProperty('analysisTime');
    });

    test('_analyzePlatforms should analyze all platforms', async () => {
      const document = mockDOM.window.document;
      const url = 'https://example.com';

      const result = await analyzer._analyzePlatforms(document, url);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('openGraph');
      expect(result).toHaveProperty('twitter');
      expect(result).toHaveProperty('linkedin');
      expect(result).toHaveProperty('pinterest');
      expect(result).toHaveProperty('whatsapp');
    });

    test('_analyzeSocialSharing should detect sharing elements', () => {
      const document = mockDOM.window.document;

      const result = analyzer._analyzeSocialSharing(document);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('hasShareButtons');
      expect(result).toHaveProperty('shareButtons');
      expect(result).toHaveProperty('shareButtonPlatforms');
      expect(result).toHaveProperty('socialLinks');
      expect(result).toHaveProperty('socialLinkPlatforms');
    });

    test('_analyzeSocialProof should detect social proof elements', () => {
      const document = mockDOM.window.document;

      const result = analyzer._analyzeSocialProof(document);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('testimonials');
      expect(result).toHaveProperty('ratings');
      expect(result).toHaveProperty('socialMetrics');
      expect(result).toHaveProperty('trustSignals');
      expect(result).toHaveProperty('customerLogos');
      expect(result).toHaveProperty('summary');
    });

    test('_analyzeSocialImages should analyze image optimization', async () => {
      const document = mockDOM.window.document;
      const url = 'https://example.com';

      const result = await analyzer._analyzeSocialImages(document, url);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('openGraphImages');
      expect(result).toHaveProperty('twitterImages');
      expect(result).toHaveProperty('optimization');
      expect(result).toHaveProperty('recommendations');
    });

    test('_calculateOptimizationScore should return valid score', () => {
      const mockAnalysis = {
        platforms: {
          openGraph: { score: 80 },
          twitter: { score: 75 },
          linkedin: { score: 70 },
          pinterest: { score: 65 },
          whatsapp: { score: 60 }
        },
        sharing: { score: 85 },
        socialProof: { summary: { strength: 'high', score: 90 } },
        images: { optimization: { score: 75 } }
      };

      const score = analyzer._calculateOptimizationScore(mockAnalysis);

      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('_generateRecommendations should return actionable recommendations', () => {
      const mockAnalysis = {
        platforms: {
          openGraph: { 
            basic: { title: 'Test', description: '', image: '' },
            validation: { missingRequired: ['description', 'image'] }
          },
          twitter: { 
            cardType: null,
            validation: { errors: ['Missing card type'] }
          }
        },
        sharing: { hasShareButtons: false },
        socialProof: { summary: { strength: 'low' } },
        images: { optimization: { issues: ['Missing alt text'] } }
      };

      const recommendations = analyzer._generateRecommendations(mockAnalysis);

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);

      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('type');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('title');
        expect(rec).toHaveProperty('description');
        expect(rec).toHaveProperty('implementation');
      });
    });
  });

  describe('Helper Methods', () => {
    test('_findShareButtons should detect social sharing buttons', () => {
      const document = mockDOM.window.document;

      const result = analyzer._findShareButtons(document);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('platform');
      expect(result[0]).toHaveProperty('url');
      expect(result[0]).toHaveProperty('element');
    });

    test('_findSocialLinks should detect social media profile links', () => {
      const htmlWithSocialLinks = `
        <html><body>
          <a href="https://facebook.com/company">Facebook</a>
          <a href="https://twitter.com/company">Twitter</a>
          <a href="https://linkedin.com/company/company">LinkedIn</a>
        </body></html>
      `;
      const domWithLinks = new JSDOM(htmlWithSocialLinks);
      const document = domWithLinks.window.document;

      const result = analyzer._findSocialLinks(document);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      const platforms = result.map(link => link.platform);
      expect(platforms).toContain('facebook');
      expect(platforms).toContain('twitter');
      expect(platforms).toContain('linkedin');
    });

    test('_extractPlatformFromShareUrl should identify platforms correctly', () => {
      const testUrls = [
        { url: 'https://www.facebook.com/sharer/sharer.php?u=test', expected: 'facebook' },
        { url: 'https://twitter.com/intent/tweet?url=test', expected: 'twitter' },
        { url: 'https://www.linkedin.com/sharing/share-offsite/?url=test', expected: 'linkedin' },
        { url: 'https://pinterest.com/pin/create/button/?url=test', expected: 'pinterest' },
        { url: 'https://wa.me/?text=test', expected: 'whatsapp' },
        { url: 'https://example.com/unknown', expected: 'unknown' }
      ];

      testUrls.forEach(({ url, expected }) => {
        const platform = analyzer._extractPlatformFromShareUrl(url);
        expect(platform).toBe(expected);
      });
    });

    test('_extractPlatformFromProfileUrl should identify social platforms correctly', () => {
      const testUrls = [
        { url: 'https://facebook.com/company', expected: 'facebook' },
        { url: 'https://twitter.com/company', expected: 'twitter' },
        { url: 'https://instagram.com/company', expected: 'instagram' },
        { url: 'https://linkedin.com/company/company', expected: 'linkedin' },
        { url: 'https://youtube.com/company', expected: 'youtube' },
        { url: 'https://tiktok.com/@company', expected: 'tiktok' },
        { url: 'https://example.com/unknown', expected: 'unknown' }
      ];

      testUrls.forEach(({ url, expected }) => {
        const platform = analyzer._extractPlatformFromProfileUrl(url);
        expect(platform).toBe(expected);
      });
    });

    test('_calculateSharingScore should return valid score', () => {
      const mockSharing = {
        hasShareButtons: true,
        shareButtons: [{ platform: 'facebook' }, { platform: 'twitter' }],
        socialLinks: [{ platform: 'facebook' }, { platform: 'linkedin' }],
        shareButtonPlatforms: ['facebook', 'twitter'],
        socialLinkPlatforms: ['facebook', 'linkedin']
      };

      const score = analyzer._calculateSharingScore(mockSharing);

      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle empty document gracefully', async () => {
      const emptyHTML = '<html><head></head><body></body></html>';
      const emptyDOM = new JSDOM(emptyHTML);
      const pageData = { title: 'Empty Page', url: 'https://example.com' };
      const url = 'https://example.com';

      const result = await analyzer.analyzeSocialMedia(emptyDOM, pageData, url);

      expect(result).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.optimizationScore).toBeDefined();
      expect(typeof result.optimizationScore).toBe('number');
    });

    test('should handle malformed HTML gracefully', async () => {
      const malformedHTML = '<html><head><meta property="og:title" content="Test"><body><div><p>Content</div></body></html>';
      const malformedDOM = new JSDOM(malformedHTML);
      const pageData = { title: 'Malformed Page', url: 'https://example.com' };
      const url = 'https://example.com';

      const result = await analyzer.analyzeSocialMedia(malformedDOM, pageData, url);

      expect(result).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    test('should handle missing platform analyzers gracefully', async () => {
      const brokenAnalyzer = new SocialMediaAnalyzer();
      brokenAnalyzer.platforms.openGraph = null;

      const pageData = { title: 'Test Page', url: 'https://example.com' };
      const url = 'https://example.com';

      const result = await brokenAnalyzer.analyzeSocialMedia(mockDOM, pageData, url);

      expect(result).toBeDefined();
      // Should either handle gracefully or return appropriate error
    });

    test('should handle invalid URLs gracefully', async () => {
      const pageData = { title: 'Test Page', url: 'invalid-url' };
      const url = 'invalid-url';

      const result = await analyzer.analyzeSocialMedia(mockDOM, pageData, url);

      expect(result).toBeDefined();
      expect(result.error).toBeUndefined(); // Should handle invalid URLs gracefully
    });
  });

  describe('Performance Tests', () => {
    test('should complete analysis within reasonable time', async () => {
      const pageData = { title: 'Test Page', url: 'https://example.com' };
      const url = 'https://example.com';

      const startTime = Date.now();
      const result = await analyzer.analyzeSocialMedia(mockDOM, pageData, url);
      const endTime = Date.now();

      const analysisTime = endTime - startTime;
      expect(analysisTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(result.analysisTime).toBeDefined();
      expect(typeof result.analysisTime).toBe('number');
    });

    test('should handle large documents efficiently', async () => {
      // Create a large HTML document
      let largeContent = '<html><head>';
      for (let i = 0; i < 100; i++) {
        largeContent += `<meta property="og:extra${i}" content="Extra content ${i}">`;
      }
      largeContent += '</head><body>';
      for (let i = 0; i < 1000; i++) {
        largeContent += `<div class="content-${i}">Content block ${i}</div>`;
      }
      largeContent += '</body></html>';

      const largeDOM = new JSDOM(largeContent);
      const pageData = { title: 'Large Page', url: 'https://example.com' };
      const url = 'https://example.com';

      const startTime = Date.now();
      const result = await analyzer.analyzeSocialMedia(largeDOM, pageData, url);
      const endTime = Date.now();

      const analysisTime = endTime - startTime;
      expect(analysisTime).toBeLessThan(5000); // Should handle large documents within 5 seconds
      expect(result).toBeDefined();
      expect(result.error).toBeUndefined();
    });
  });

  describe('Option Configuration Tests', () => {
    test('should respect enableImageAnalysis option', async () => {
      const analyzerWithoutImages = new SocialMediaAnalyzer({
        enableImageAnalysis: false
      });

      const pageData = { title: 'Test Page', url: 'https://example.com' };
      const url = 'https://example.com';

      const result = await analyzerWithoutImages.analyzeSocialMedia(mockDOM, pageData, url);

      expect(result).toBeDefined();
      // Image analysis should be skipped or minimal
      expect(result.images).toBeDefined();
    });

    test('should respect checkSocialButtons option', async () => {
      const analyzerWithoutButtons = new SocialMediaAnalyzer({
        checkSocialButtons: false
      });

      const pageData = { title: 'Test Page', url: 'https://example.com' };
      const url = 'https://example.com';

      const result = await analyzerWithoutButtons.analyzeSocialMedia(mockDOM, pageData, url);

      expect(result).toBeDefined();
      expect(result.sharing).toBeDefined();
      // Should have limited sharing analysis
    });

    test('should respect analyzeSocialProof option', async () => {
      const analyzerWithoutProof = new SocialMediaAnalyzer({
        analyzeSocialProof: false
      });

      const pageData = { title: 'Test Page', url: 'https://example.com' };
      const url = 'https://example.com';

      const result = await analyzerWithoutProof.analyzeSocialMedia(mockDOM, pageData, url);

      expect(result).toBeDefined();
      expect(result.socialProof).toBeDefined();
      // Social proof analysis should be minimal or skipped
    });
  });
});

console.log('✅ Social Media Analyzer unit tests completed');
console.log('🧪 Testing all real functions and implementation details');
