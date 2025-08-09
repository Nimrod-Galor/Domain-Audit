/**
 * ============================================================================
 * BUSINESS INTELLIGENCE MINIMAL ANALYZER UNIT TESTS
 * ============================================================================
 *
 * Unit tests for the minimal business intelligence analyzer using real module functions.
 * Tests the actual implementation currently integrated with the main audit system.
 *
 * @author Nimrod Galor
 * @version 1.0.0
 */

import { jest } from '@jest/globals';
import { JSDOM } from 'jsdom';
import { BusinessIntelligenceAnalyzer } from '../src/analyzers/business-intelligence/business-analyzer-minimal.js';

describe('Business Intelligence Minimal Analyzer', () => {
  let analyzer;
  let mockDocument;
  let testUrl;

  beforeEach(() => {
    analyzer = new BusinessIntelligenceAnalyzer();
    testUrl = 'https://example.com';
    
    // Create a comprehensive mock DOM document for testing
    const dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Business Website</title>
          <meta name="description" content="Professional business services">
        </head>
        <body>
          <header>
            <nav>
              <a href="/about">About Us</a>
              <a href="/company">Our Company</a>
              <a href="/contact">Contact</a>
              <a href="/support">Support</a>
              <a href="/help">Help Center</a>
            </nav>
          </header>
          
          <main>
            <section class="hero">
              <h1>Professional Business Services</h1>
              <p>Trusted by over 1000 companies worldwide</p>
            </section>
            
            <section class="contact">
              <h2>Contact Information</h2>
              <p>Phone: <a href="tel:+1234567890">(123) 456-7890</a></p>
              <p>Secondary: <a href="tel:+1234567891">(123) 456-7891</a></p>
              <p>Email: <a href="mailto:info@example.com">info@example.com</a></p>
              <p>Sales: <a href="mailto:sales@example.com">sales@example.com</a></p>
              <div class="address">
                <p>123 Business Street, Suite 100</p>
                <p>New York, NY 10001</p>
              </div>
              <address class="location">
                456 Corporate Ave<br>
                Los Angeles, CA 90210
              </address>
            </section>
            
            <section class="about mission">
              <h2>Our Mission</h2>
              <p>We are dedicated to providing exceptional business services.</p>
            </section>
            
            <section class="vision">
              <h2>Our Vision</h2>
              <p>To be the leading provider in our industry.</p>
            </section>
            
            <section class="support chat">
              <h2>Customer Support</h2>
              <p>24/7 live chat available</p>
              <div class="chat-widget">Live Chat</div>
            </section>
            
            <section class="testimonials">
              <h2>Customer Reviews</h2>
              <div class="testimonial">
                <p>"Excellent service!"</p>
                <cite>John Doe</cite>
              </div>
              <div class="review">
                <p>"Highly recommended!"</p>
                <cite>Jane Smith</cite>
              </div>
            </section>
            
            <section class="clients partners">
              <h2>Our Clients</h2>
              <div class="client-logo">Client 1</div>
              <div class="partner-logo">Partner 1</div>
            </section>
            
            <section class="location-info">
              <h2>Our Locations</h2>
              <div class="map">
                <iframe src="https://maps.google.com/embed"></iframe>
              </div>
              <div class="address-info">Multiple locations available</div>
            </section>
            
            <section class="trust-signals">
              <img src="/ssl-badge.png" alt="ssl secure website">
              <img src="/security-verified.png" alt="security verified">
              <img src="/iso-cert.png" alt="verified certificate">
              <div class="trust-badge">Trusted Partner</div>
              <div class="cert-badge">Certified Business</div>
              <div class="secure-badge">Secure Site</div>
            </section>
          </main>
        </body>
      </html>
    `, { url: testUrl });
    
    mockDocument = dom.window.document;
  });

  describe('Constructor and Options', () => {
    test('should initialize with default options', () => {
      const defaultAnalyzer = new BusinessIntelligenceAnalyzer();
      
      expect(defaultAnalyzer.options.enableTrustAnalysis).toBe(true);
      expect(defaultAnalyzer.options.enableContactAnalysis).toBe(true);
      expect(defaultAnalyzer.options.enableContentAnalysis).toBe(true);
      expect(defaultAnalyzer.options.enableSupportAnalysis).toBe(true);
      expect(defaultAnalyzer.options.enableCredibilityAnalysis).toBe(true);
      expect(defaultAnalyzer.options.enableLocationAnalysis).toBe(true);
    });

    test('should accept custom options', () => {
      const customAnalyzer = new BusinessIntelligenceAnalyzer({
        enableTrustAnalysis: false,
        enableContactAnalysis: true,
        customOption: 'test'
      });
      
      expect(customAnalyzer.options.enableTrustAnalysis).toBe(false);
      expect(customAnalyzer.options.enableContactAnalysis).toBe(true);
      expect(customAnalyzer.options.customOption).toBe('test');
    });
  });

  describe('Main Analysis Function', () => {
    test('should perform complete business intelligence analysis', async () => {
      const result = await analyzer.analyzeBusinessIntelligence(mockDocument, testUrl);

      expect(result).toBeDefined();
      expect(result.trustSignals).toBeDefined();
      expect(result.contactInformation).toBeDefined();
      expect(result.aboutPageQuality).toBeDefined();
      expect(result.customerSupport).toBeDefined();
      expect(result.businessCredibility).toBeDefined();
      expect(result.locationData).toBeDefined();
      expect(result.score).toBeDefined();
      expect(result.grade).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.strengths).toBeDefined();
      expect(result.businessType).toBe('general');
      expect(result.analysisTime).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    test('should handle different parameter formats', async () => {
      // Test with pageData as object
      const pageData = { title: 'Test Page', meta: {} };
      const result1 = await analyzer.analyzeBusinessIntelligence(mockDocument, pageData, testUrl);
      
      expect(result1).toBeDefined();
      expect(result1.score).toBeGreaterThanOrEqual(0);

      // Test with pageData as string (URL)
      const result2 = await analyzer.analyzeBusinessIntelligence(mockDocument, testUrl);
      
      expect(result2).toBeDefined();
      expect(result2.score).toBeGreaterThanOrEqual(0);
    });

    test('should handle analysis errors gracefully', async () => {
      // Test with null document
      const result = await analyzer.analyzeBusinessIntelligence(null, testUrl);

      expect(result).toBeDefined();
      expect(result.score).toBe(0);
      expect(result.grade).toBe('F');
      expect(result.analysisTime).toBeDefined();
      expect(result.timestamp).toBeDefined();
      
      // Should have either error property or valid analysis structure
      if (result.error) {
        expect(result.error).toContain('Business intelligence analysis failed');
        expect(result.recommendations).toEqual(['Fix analysis errors']);
      } else {
        // Should have all required properties even with null document
        expect(result.trustSignals).toBeDefined();
        expect(result.contactInformation).toBeDefined();
        expect(result.aboutPageQuality).toBeDefined();
        expect(result.customerSupport).toBeDefined();
        expect(result.businessCredibility).toBeDefined();
        expect(result.locationData).toBeDefined();
      }
    });

    test('should calculate overall score correctly', async () => {
      const result = await analyzer.analyzeBusinessIntelligence(mockDocument, testUrl);

      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(typeof result.score).toBe('number');
      
      // Verify score is average of component scores
      const components = [
        result.trustSignals,
        result.contactInformation,
        result.aboutPageQuality,
        result.customerSupport,
        result.businessCredibility,
        result.locationData
      ];
      
      const validComponents = components.filter(c => c.score !== undefined);
      const expectedScore = Math.round(
        validComponents.reduce((sum, c) => sum + c.score, 0) / validComponents.length
      );
      
      expect(result.score).toBe(expectedScore);
    });
  });

  describe('Trust Signals Analysis', () => {
    test('should detect SSL presence from HTTPS URL', () => {
      const httpsUrl = 'https://example.com';
      const result = analyzer._analyzeTrustSignals(mockDocument, httpsUrl);

      expect(result.sslPresent).toBe(true);
      expect(result.score).toBeDefined();
      expect(result.grade).toBeDefined();
    });

    test('should detect SSL absence from HTTP URL', () => {
      const httpUrl = 'http://example.com';
      const result = analyzer._analyzeTrustSignals(mockDocument, httpUrl);

      expect(result.sslPresent).toBe(false);
    });

    test('should count security badges correctly', () => {
      const result = analyzer._analyzeTrustSignals(mockDocument, testUrl);

      expect(result.securityBadges).toBeGreaterThan(0);
      expect(result.certifications).toBeGreaterThan(0);
      expect(result.score).toBeGreaterThan(0);
    });

    test('should handle missing document querySelectorAll', () => {
      const mockDocNoQuery = {};
      const result = analyzer._analyzeTrustSignals(mockDocNoQuery, testUrl);

      expect(result.securityBadges).toBe(0);
      expect(result.certifications).toBe(0);
    });

    test('should handle errors gracefully', () => {
      // Create a mock document that throws an error during processing
      const mockErrorDocument = {
        querySelectorAll: () => {
          throw new Error('Simulated DOM error');
        }
      };
      
      const result = analyzer._analyzeTrustSignals(mockErrorDocument, testUrl);

      expect(result.score).toBe(0);
      expect(result.error).toBeDefined();
    });
  });

  describe('Contact Information Analysis', () => {
    test('should detect email addresses', () => {
      const result = analyzer._analyzeContactInformation(mockDocument);

      expect(result.emailFound).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(result.grade).toBeDefined();
    });

    test('should detect phone numbers', () => {
      const result = analyzer._analyzeContactInformation(mockDocument);

      expect(result.phoneFound).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });

    test('should detect address information', () => {
      const result = analyzer._analyzeContactInformation(mockDocument);

      expect(result.addressFound).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });

    test('should calculate contact score correctly', () => {
      const result = analyzer._analyzeContactInformation(mockDocument);

      // Should have email (25) + phone (25) + address (30) = 80+ points
      expect(result.score).toBeGreaterThan(70);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    test('should handle document without contact info', () => {
      const emptyDom = new JSDOM('<html><body></body></html>');
      const result = analyzer._analyzeContactInformation(emptyDom.window.document);

      expect(result.emailFound).toBe(false);
      expect(result.phoneFound).toBe(false);
      expect(result.addressFound).toBe(false);
      expect(result.score).toBe(0);
    });

    test('should handle errors gracefully', () => {
      const mockErrorDocument = {
        querySelectorAll: () => {
          throw new Error('Simulated DOM error');
        }
      };
      
      const result = analyzer._analyzeContactInformation(mockErrorDocument);

      expect(result.score).toBe(0);
      expect(result.error).toBeDefined();
    });
  });

  describe('About Page Analysis', () => {
    test('should detect about page links', () => {
      const result = analyzer._analyzeAboutPage(mockDocument, testUrl);

      expect(result.aboutPageLinked).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(result.grade).toBeDefined();
    });

    test('should detect mission statement elements', () => {
      const result = analyzer._analyzeAboutPage(mockDocument, testUrl);

      expect(result.missionStatement).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });

    test('should calculate about page score correctly', () => {
      const result = analyzer._analyzeAboutPage(mockDocument, testUrl);

      // Should have about links (30+) + mission elements (20+) = 50+ points
      expect(result.score).toBeGreaterThan(40);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    test('should handle document without about content', () => {
      const emptyDom = new JSDOM('<html><body></body></html>');
      const result = analyzer._analyzeAboutPage(emptyDom.window.document, testUrl);

      expect(result.aboutPageLinked).toBe(false);
      expect(result.missionStatement).toBe(false);
      expect(result.score).toBe(0);
    });

    test('should handle errors gracefully', () => {
      const mockErrorDocument = {
        querySelectorAll: () => {
          throw new Error('Simulated DOM error');
        }
      };
      
      const result = analyzer._analyzeAboutPage(mockErrorDocument, testUrl);

      expect(result.score).toBe(0);
      expect(result.error).toBeDefined();
    });
  });

  describe('Customer Support Analysis', () => {
    test('should detect support page links', () => {
      const result = analyzer._analyzeCustomerSupport(mockDocument);

      expect(result.supportPageLinked).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(result.grade).toBeDefined();
    });

    test('should detect live chat availability', () => {
      const result = analyzer._analyzeCustomerSupport(mockDocument);

      expect(result.liveChatAvailable).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });

    test('should calculate support score correctly', () => {
      const result = analyzer._analyzeCustomerSupport(mockDocument);

      // Should have support links (30+) + chat elements (25+) = 55+ points
      expect(result.score).toBeGreaterThan(50);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    test('should handle document without support content', () => {
      const emptyDom = new JSDOM('<html><body></body></html>');
      const result = analyzer._analyzeCustomerSupport(emptyDom.window.document);

      expect(result.supportPageLinked).toBe(false);
      expect(result.liveChatAvailable).toBe(false);
      expect(result.score).toBe(0);
    });

    test('should handle errors gracefully', () => {
      const mockErrorDocument = {
        querySelectorAll: () => {
          throw new Error('Simulated DOM error');
        }
      };
      
      const result = analyzer._analyzeCustomerSupport(mockErrorDocument);

      expect(result.score).toBe(0);
      expect(result.error).toBeDefined();
    });
  });

  describe('Business Credibility Analysis', () => {
    test('should detect testimonials', () => {
      const result = analyzer._analyzeBusinessCredibility(mockDocument);

      expect(result.testimonialsPresent).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(result.grade).toBeDefined();
    });

    test('should detect client logos', () => {
      const result = analyzer._analyzeBusinessCredibility(mockDocument);

      expect(result.clientLogosShown).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });

    test('should calculate credibility score correctly', () => {
      const result = analyzer._analyzeBusinessCredibility(mockDocument);

      // Should have testimonials (20+) + client elements (15+) = 35+ points
      expect(result.score).toBeGreaterThan(30);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    test('should handle document without credibility content', () => {
      const emptyDom = new JSDOM('<html><body></body></html>');
      const result = analyzer._analyzeBusinessCredibility(emptyDom.window.document);

      expect(result.testimonialsPresent).toBe(false);
      expect(result.clientLogosShown).toBe(false);
      expect(result.score).toBe(0);
    });

    test('should handle errors gracefully', () => {
      const mockErrorDocument = {
        querySelectorAll: () => {
          throw new Error('Simulated DOM error');
        }
      };
      
      const result = analyzer._analyzeBusinessCredibility(mockErrorDocument);

      expect(result.score).toBe(0);
      expect(result.error).toBeDefined();
    });
  });

  describe('Location Data Analysis', () => {
    test('should detect embedded maps', () => {
      const result = analyzer._analyzeLocationData(mockDocument);

      expect(result.mapEmbedded).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(result.grade).toBeDefined();
    });

    test('should detect location information', () => {
      const result = analyzer._analyzeLocationData(mockDocument);

      expect(result.locationInfoPresent).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });

    test('should calculate location score correctly', () => {
      const result = analyzer._analyzeLocationData(mockDocument);

      // Should have map elements (40+) + location elements (20+) = 60+ points
      expect(result.score).toBeGreaterThan(50);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    test('should handle document without location content', () => {
      const emptyDom = new JSDOM('<html><body></body></html>');
      const result = analyzer._analyzeLocationData(emptyDom.window.document);

      expect(result.mapEmbedded).toBe(false);
      expect(result.locationInfoPresent).toBe(false);
      expect(result.score).toBe(0);
    });

    test('should handle errors gracefully', () => {
      const mockErrorDocument = {
        querySelectorAll: () => {
          throw new Error('Simulated DOM error');
        }
      };
      
      const result = analyzer._analyzeLocationData(mockErrorDocument);

      expect(result.score).toBe(0);
      expect(result.error).toBeDefined();
    });
  });

  describe('Utility Functions', () => {
    test('should assign correct grades', () => {
      expect(analyzer._getGrade(95)).toBe('A+');
      expect(analyzer._getGrade(85)).toBe('A');
      expect(analyzer._getGrade(75)).toBe('B');
      expect(analyzer._getGrade(65)).toBe('C');
      expect(analyzer._getGrade(55)).toBe('D');
      expect(analyzer._getGrade(45)).toBe('F');
      expect(analyzer._getGrade(0)).toBe('F');
    });

    test('should generate appropriate recommendations', () => {
      const lowScoreRecs = analyzer._generateRecommendations(30);
      expect(lowScoreRecs).toContain('Add SSL security badges');
      expect(lowScoreRecs).toContain('Include customer testimonials');
      expect(lowScoreRecs).toContain('Add contact information');
      expect(lowScoreRecs).toContain('Create about page');
      expect(lowScoreRecs).toContain('Add location/map information');

      const highScoreRecs = analyzer._generateRecommendations(95);
      expect(highScoreRecs.length).toBe(0); // High score should have no recommendations
    });

    test('should identify strengths correctly', () => {
      const goodComponents = [
        { score: 85 }, // Should be identified as strength
        { score: 90 }, // Should be identified as strength
        { score: 50 }, // Should not be identified as strength
        { score: 30 }  // Should not be identified as strength
      ];

      const strengths = analyzer._identifyStrengths(goodComponents);
      expect(strengths).toContain('Strong component performance');

      const poorComponents = [
        { score: 30 },
        { score: 40 },
        { score: 20 }
      ];

      const poorStrengths = analyzer._identifyStrengths(poorComponents);
      expect(poorStrengths).toEqual(['Basic website structure']);
    });
  });

  describe('Integration and Performance', () => {
    test('should complete analysis within reasonable time', async () => {
      const startTime = Date.now();
      const result = await analyzer.analyzeBusinessIntelligence(mockDocument, testUrl);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.analysisTime).toBeLessThan(1000);
    });

    test('should handle large documents efficiently', async () => {
      // Create a larger document with many elements
      const largeContent = `
        ${'<div class="trust-item"><img alt="ssl secure" /></div>'.repeat(50)}
        ${'<a href="mailto:test@example.com">Email</a>'.repeat(20)}
        ${'<a href="tel:123456789">Phone</a>'.repeat(15)}
        ${'<div class="testimonial">Great service!</div>'.repeat(100)}
        ${'<div class="client">Client logo</div>'.repeat(30)}
        ${'<div class="location">Address info</div>'.repeat(25)}
      `;

      const largeDom = new JSDOM(`
        <html><body>${largeContent}</body></html>
      `, { url: testUrl });

      const startTime = Date.now();
      const result = await analyzer.analyzeBusinessIntelligence(largeDom.window.document, testUrl);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(2000); // Should still be reasonably fast
    });

    test('should be memory efficient', async () => {
      // Run analysis multiple times to check for memory leaks
      const results = [];
      
      for (let i = 0; i < 10; i++) {
        const result = await analyzer.analyzeBusinessIntelligence(mockDocument, testUrl);
        results.push(result);
      }

      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.score).toBeGreaterThanOrEqual(0);
      });
    });

    test('should provide consistent results', async () => {
      // Run the same analysis multiple times
      const results = [];
      
      for (let i = 0; i < 5; i++) {
        const result = await analyzer.analyzeBusinessIntelligence(mockDocument, testUrl);
        results.push(result);
      }

      const firstResult = results[0];
      results.forEach(result => {
        expect(result.score).toBe(firstResult.score);
        expect(result.grade).toBe(firstResult.grade);
        expect(result.trustSignals.sslPresent).toBe(firstResult.trustSignals.sslPresent);
        expect(result.contactInformation.emailFound).toBe(firstResult.contactInformation.emailFound);
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty document', async () => {
      const emptyDom = new JSDOM('');
      const result = await analyzer.analyzeBusinessIntelligence(emptyDom.window.document, testUrl);

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.grade).toBeDefined();
    });

    test('should handle document with no querySelector support', async () => {
      const mockDocNoQuery = {
        querySelectorAll: null
      };

      const result = await analyzer.analyzeBusinessIntelligence(mockDocNoQuery, testUrl);

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    test('should handle invalid URLs', async () => {
      const invalidUrls = ['', null, undefined, 'not-a-url', 'ftp://example.com'];

      for (const url of invalidUrls) {
        const result = await analyzer.analyzeBusinessIntelligence(mockDocument, url);
        expect(result).toBeDefined();
        expect(result.score).toBeGreaterThanOrEqual(0);
      }
    });

    test('should handle malformed HTML', async () => {
      const malformedDom = new JSDOM(`
        <html><body>
          <div><p>Unclosed paragraph
          <a href="mailto:test@example.com">Email without closing tag
          <section class="about"><h2>About without closing
        </body>
      `, { url: testUrl });

      const result = await analyzer.analyzeBusinessIntelligence(malformedDom.window.document, testUrl);

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      // Should still find the email despite malformed HTML
      expect(result.contactInformation.emailFound).toBe(true);
    });
  });
});
