/**
 * @jest-environment node
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import * as cheerio from 'cheerio';
import { TechnicalExtractor } from '../../src/extractors/technical-extractor.js';

describe('TechnicalExtractor Tests', () => {
  let technicalExtractor;
  let $;
  
  beforeEach(() => {
    technicalExtractor = new TechnicalExtractor();
    
    // Create mock HTML content with technical elements using Cheerio
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="robots" content="index,follow">
          <meta name="description" content="Test page description">
          <title>Test Technical Page</title>
          <link rel="stylesheet" href="styles.css">
          <script src="script.js"></script>
        </head>
        <body>
          <nav aria-label="Main navigation">
            <ul>
              <li><a href="/home">Home</a></li>
              <li><a href="/about">About</a></li>
            </ul>
          </nav>
          <main>
            <h1>Main Content</h1>
            <p>This is test content with proper semantic structure.</p>
            <img src="test.jpg" alt="Test image" />
            <button type="button" aria-label="Click me">Button</button>
          </main>
          <footer>
            <p>&copy; 2024 Test Site</p>
          </footer>
        </body>
      </html>
    `;
    
    $ = cheerio.load(htmlContent);
  });

  describe('Constructor', () => {
    test('should initialize with default configuration', () => {
      const extractor = new TechnicalExtractor();
      expect(extractor.config).toBeDefined();
      expect(extractor.cache).toBeDefined();
    });

    test('should initialize with custom configuration', () => {
      const customConfig = {
        enableCaching: false,
        maxResourcesAnalysis: 50
      };
      const extractor = new TechnicalExtractor(customConfig);
      expect(extractor.config.enableCaching).toBe(false);
      expect(extractor.config.maxResourcesAnalysis).toBe(50);
    });
  });

  describe('extractTechnicalData', () => {
    test('should extract comprehensive technical data', () => {
      const mockHeaders = {
        'content-type': 'text/html; charset=UTF-8',
        'server': 'nginx/1.18.0',
        'content-encoding': 'gzip'
      };
      
      const result = technicalExtractor.extractTechnicalData(mockDocument, mockHeaders);
      
      expect(result).toBeDefined();
      expect(result.infrastructure).toBeDefined();
      expect(result.architecture).toBeDefined();
      expect(result.accessibility).toBeDefined();
      expect(result.mobileFriendliness).toBeDefined();
      expect(result.security).toBeDefined();
    });

    test('should handle missing headers gracefully', () => {
      const result = technicalExtractor.extractTechnicalData(mockDocument, {});
      
      expect(result).toBeDefined();
      expect(result.infrastructure).toBeDefined();
      expect(result.architecture).toBeDefined();
    });

    test('should handle null document gracefully', () => {
      expect(() => {
        technicalExtractor.extractTechnicalData(null, {});
      }).not.toThrow();
    });
  });

  describe('extractInfrastructure', () => {
    test('should extract server information from headers', () => {
      const headers = {
        'server': 'nginx/1.18.0',
        'x-powered-by': 'Express',
        'content-encoding': 'gzip'
      };
      
      const result = technicalExtractor.extractInfrastructure(mockDocument, headers);
      
      expect(result.server).toBe('nginx/1.18.0');
      expect(result.poweredBy).toBe('Express');
      expect(result.compression).toBe('gzip');
    });

    test('should detect DOCTYPE and HTML version', () => {
      const result = technicalExtractor.extractInfrastructure(mockDocument, {});
      
      expect(result.doctype).toBeDefined();
      expect(result.htmlVersion).toBeDefined();
    });

    test('should analyze resource loading', () => {
      const result = technicalExtractor.extractInfrastructure(mockDocument, {});
      
      expect(result.resources).toBeDefined();
      expect(result.resources.externalCSS).toBeGreaterThanOrEqual(0);
      expect(result.resources.externalJS).toBeGreaterThanOrEqual(0);
      expect(result.resources.totalResources).toBeGreaterThanOrEqual(0);
    });
  });

  describe('extractArchitecture', () => {
    test('should analyze semantic HTML structure', () => {
      const result = technicalExtractor.extractArchitecture(mockDocument);
      
      expect(result.semanticElements).toBeDefined();
      expect(result.semanticElements.hasMain).toBe(true);
      expect(result.semanticElements.hasNav).toBe(true);
      expect(result.semanticElements.hasFooter).toBe(true);
    });

    test('should analyze heading hierarchy', () => {
      const result = technicalExtractor.extractArchitecture(mockDocument);
      
      expect(result.headingHierarchy).toBeDefined();
      expect(result.headingHierarchy.hasH1).toBe(true);
      expect(result.headingHierarchy.totalHeadings).toBeGreaterThan(0);
    });

    test('should detect navigation patterns', () => {
      const result = technicalExtractor.extractArchitecture(mockDocument);
      
      expect(result.navigation).toBeDefined();
      expect(result.navigation.hasNav).toBe(true);
      expect(result.navigation.hasBreadcrumbs).toBe(false);
    });
  });

  describe('extractAccessibility', () => {
    test('should analyze accessibility features', () => {
      const result = technicalExtractor.extractAccessibility(mockDocument);
      
      expect(result).toBeDefined();
      expect(result.images).toBeDefined();
      expect(result.forms).toBeDefined();
      expect(result.navigation).toBeDefined();
      expect(result.semantics).toBeDefined();
    });

    test('should check image alt text coverage', () => {
      const result = technicalExtractor.extractAccessibility(mockDocument);
      
      expect(result.images.total).toBeGreaterThan(0);
      expect(result.images.withAlt).toBeGreaterThan(0);
      expect(result.images.altCoverage).toBeGreaterThan(0);
    });

    test('should analyze ARIA usage', () => {
      const result = technicalExtractor.extractAccessibility(mockDocument);
      
      expect(result.aria).toBeDefined();
      expect(result.aria.ariaLabels).toBeGreaterThan(0);
      expect(result.aria.totalAriaElements).toBeGreaterThan(0);
    });

    test('should handle document with no accessibility features', () => {
      const minimalDom = new JSDOM('<html><body><p>No accessibility features</p></body></html>');
      const result = technicalExtractor.extractAccessibility(minimalDom.window.document);
      
      expect(result.images.total).toBe(0);
      expect(result.forms.total).toBe(0);
      expect(result.aria.totalAriaElements).toBe(0);
      minimalDom.window.close();
    });
  });

  describe('extractMobileFriendliness', () => {
    test('should analyze viewport configuration', () => {
      const result = technicalExtractor.extractMobileFriendliness(mockDocument);
      
      expect(result.viewport).toBeDefined();
      expect(result.viewport.hasViewport).toBe(true);
      expect(result.viewport.content).toContain('width=device-width');
    });

    test('should detect responsive design indicators', () => {
      const result = technicalExtractor.extractMobileFriendliness(mockDocument);
      
      expect(result.responsive).toBeDefined();
      expect(result.responsive.hasMediaQueries).toBeDefined();
      expect(result.responsive.hasFlexibleImages).toBeDefined();
    });

    test('should handle missing viewport meta tag', () => {
      const noViewportDom = new JSDOM(`
        <html><head><title>No Viewport</title></head>
        <body><p>Content without viewport</p></body></html>
      `);
      
      const result = technicalExtractor.extractMobileFriendliness(noViewportDom.window.document);
      expect(result.viewport.hasViewport).toBe(false);
      noViewportDom.window.close();
    });
  });

  describe('extractSecurity', () => {
    test('should analyze security headers and features', () => {
      const securityHeaders = {
        'strict-transport-security': 'max-age=31536000',
        'content-security-policy': "default-src 'self'",
        'x-frame-options': 'DENY'
      };
      
      const result = technicalExtractor.extractSecurity(mockDocument, securityHeaders);
      
      expect(result.headers).toBeDefined();
      expect(result.headers.hsts).toBe(true);
      expect(result.headers.csp).toBe(true);
      expect(result.headers.xFrameOptions).toBe(true);
    });

    test('should detect forms and their security', () => {
      const formDom = new JSDOM(`
        <html><body>
          <form method="post" action="/submit">
            <input type="password" name="password">
            <input type="submit" value="Submit">
          </form>
        </body></html>
      `);
      
      const result = technicalExtractor.extractSecurity(formDom.window.document, {});
      
      expect(result.forms).toBeDefined();
      expect(result.forms.total).toBe(1);
      expect(result.forms.hasPasswordFields).toBe(true);
      formDom.window.close();
    });

    test('should handle missing security headers', () => {
      const result = technicalExtractor.extractSecurity(mockDocument, {});
      
      expect(result.headers.hsts).toBe(false);
      expect(result.headers.csp).toBe(false);
      expect(result.headers.xFrameOptions).toBe(false);
    });
  });

  describe('calculateTechnicalScore', () => {
    test('should calculate comprehensive technical score', () => {
      const technicalData = {
        infrastructure: { score: 85 },
        architecture: { score: 90 },
        accessibility: { score: 75 },
        mobileFriendliness: { score: 88 },
        security: { score: 70 }
      };
      
      const score = technicalExtractor.calculateTechnicalScore(technicalData);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should handle missing score data', () => {
      const incompleteData = {
        infrastructure: { score: 85 },
        architecture: {} // Missing score
      };
      
      const score = technicalExtractor.calculateTechnicalScore(incompleteData);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    test('should return zero for empty data', () => {
      const score = technicalExtractor.calculateTechnicalScore({});
      expect(score).toBe(0);
    });
  });

  describe('generateRecommendations', () => {
    test('should generate relevant recommendations', () => {
      const technicalData = {
        accessibility: {
          images: { altCoverage: 50 },
          aria: { totalAriaElements: 0 }
        },
        security: {
          headers: { hsts: false, csp: false }
        },
        mobileFriendliness: {
          viewport: { hasViewport: false }
        }
      };
      
      const recommendations = technicalExtractor.generateRecommendations(technicalData);
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Should contain accessibility recommendations
      const accessibilityRecs = recommendations.filter(r => r.category === 'accessibility');
      expect(accessibilityRecs.length).toBeGreaterThan(0);
      
      // Should contain security recommendations
      const securityRecs = recommendations.filter(r => r.category === 'security');
      expect(securityRecs.length).toBeGreaterThan(0);
    });

    test('should return empty array for perfect technical data', () => {
      const perfectData = {
        accessibility: {
          images: { altCoverage: 100 },
          aria: { totalAriaElements: 10 }
        },
        security: {
          headers: { hsts: true, csp: true, xFrameOptions: true }
        },
        mobileFriendliness: {
          viewport: { hasViewport: true, content: 'width=device-width, initial-scale=1.0' }
        }
      };
      
      const recommendations = technicalExtractor.generateRecommendations(perfectData);
      expect(recommendations.length).toBe(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle malformed HTML gracefully', () => {
      const malformedDom = new JSDOM('<html><body><div>Unclosed div<p>Malformed</body></html>');
      
      expect(() => {
        technicalExtractor.extractTechnicalData(malformedDom.window.document, {});
      }).not.toThrow();
      
      malformedDom.window.close();
    });

    test('should handle very large documents efficiently', () => {
      const largeContent = '<div>' + 'Content '.repeat(10000) + '</div>';
      const largeDom = new JSDOM(`<html><body>${largeContent}</body></html>`);
      
      const startTime = Date.now();
      const result = technicalExtractor.extractTechnicalData(largeDom.window.document, {});
      const duration = Date.now() - startTime;
      
      expect(result).toBeDefined();
      expect(duration).toBeLessThan(5000); // Should complete within reasonable time
      largeDom.window.close();
    });

    test('should handle documents with many resources', () => {
      const manyResourcesHtml = `
        <html><head>
          ${Array.from({length: 100}, (_, i) => `<link rel="stylesheet" href="style${i}.css">`).join('')}
          ${Array.from({length: 50}, (_, i) => `<script src="script${i}.js"></script>`).join('')}
        </head><body><p>Many resources</p></body></html>
      `;
      const manyResourcesDom = new JSDOM(manyResourcesHtml);
      
      const result = technicalExtractor.extractInfrastructure(manyResourcesDom.window.document, {});
      
      expect(result.resources.externalCSS).toBeGreaterThan(0);
      expect(result.resources.externalJS).toBeGreaterThan(0);
      expect(result.resources.totalResources).toBeGreaterThan(0);
      manyResourcesDom.window.close();
    });

    test('should handle empty document', () => {
      const emptyDom = new JSDOM('');
      
      expect(() => {
        technicalExtractor.extractTechnicalData(emptyDom.window.document, {});
      }).not.toThrow();
      
      emptyDom.window.close();
    });
  });

  describe('Caching and Performance', () => {
    test('should cache analysis results when enabled', () => {
      const extractor = new TechnicalExtractor({ enableCaching: true });
      
      // First analysis
      const result1 = extractor.extractTechnicalData(mockDocument, {});
      
      // Second analysis should use cache
      const result2 = extractor.extractTechnicalData(mockDocument, {});
      
      expect(result1).toEqual(result2);
      expect(extractor.cache.size).toBeGreaterThan(0);
    });

    test('should not cache when caching is disabled', () => {
      const extractor = new TechnicalExtractor({ enableCaching: false });
      
      extractor.extractTechnicalData(mockDocument, {});
      expect(extractor.cache.size).toBe(0);
    });
  });
});
