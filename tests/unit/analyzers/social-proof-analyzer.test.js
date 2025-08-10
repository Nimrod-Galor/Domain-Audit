/**
 * ============================================================================
 * SOCIAL PROOF ANALYZER - UNIT TESTS
 * ============================================================================
 * 
 * Unit tests for Social Proof analyzer component
 * Testing real functions for testimonials, ratings, trust signals detection
 * 
 * @author Nimrod Galor
 * @version 1.0.0
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { JSDOM } from 'jsdom';
import { SocialProofAnalyzer } from '../../../src/analyzers/social-media/social-proof-analyzer.js';

describe('SocialProofAnalyzer Unit Tests', () => {
  let analyzer;
  let mockDOM;

  beforeEach(() => {
    analyzer = new SocialProofAnalyzer();
  });

  describe('Constructor and Initialization', () => {
    test('should initialize with default selectors', () => {
      expect(analyzer).toBeDefined();
      expect(analyzer.selectors).toBeDefined();
      expect(analyzer.selectors.testimonials).toBeDefined();
      expect(analyzer.selectors.ratings).toBeDefined();
      expect(analyzer.selectors.socialCounts).toBeDefined();
      expect(analyzer.selectors.customerLogos).toBeDefined();
      expect(analyzer.selectors.trustSignals).toBeDefined();
    });

    test('should have comprehensive selector patterns', () => {
      expect(analyzer.selectors.testimonials.length).toBeGreaterThan(5);
      expect(analyzer.selectors.ratings.length).toBeGreaterThan(3);
      expect(analyzer.selectors.socialCounts.length).toBeGreaterThan(3);
      expect(analyzer.selectors.trustSignals.length).toBeGreaterThan(5);
    });
  });

  describe('Main Analysis Function', () => {
    beforeEach(() => {
      const comprehensiveHTML = `
        <html>
        <head><title>Test Page</title></head>
        <body>
          <!-- Testimonials -->
          <section class="testimonials">
            <div class="testimonial">
              <p class="testimonial-content">"This product has completely transformed our business operations!"</p>
              <div class="testimonial-author">
                <img src="author1.jpg" alt="Sarah Johnson" class="author-photo">
                <h4>Sarah Johnson</h4>
                <p class="author-company">CEO, Tech Innovations Inc.</p>
              </div>
              <div class="testimonial-rating">
                <div class="stars">★★★★★</div>
              </div>
            </div>
            
            <div class="review verified-review">
              <p>"Outstanding service and professional support. Highly recommended!"</p>
              <div class="reviewer-info">
                <span class="reviewer-name">Michael Chen</span>
                <span class="reviewer-title">Director of Operations</span>
                <span class="company-name">Global Solutions Ltd.</span>
              </div>
              <div class="review-rating">5/5 stars</div>
              <div class="verified-badge">✓ Verified Purchase</div>
            </div>
          </section>

          <!-- Ratings and Reviews -->
          <section class="ratings-section">
            <div class="overall-rating">
              <span class="rating-score">4.9</span>
              <div class="rating-stars">★★★★★</div>
              <div class="rating-count">Based on 2,500+ reviews</div>
            </div>
            
            <div class="rating-breakdown">
              <div class="rating-item">
                <span class="stars">★★★★★</span>
                <span class="rating-percentage">85%</span>
                <span class="rating-count">(2,125 reviews)</span>
              </div>
              <div class="rating-item">
                <span class="stars">★★★★☆</span>
                <span class="rating-percentage">12%</span>
                <span class="rating-count">(300 reviews)</span>
              </div>
            </div>
          </section>

          <!-- Social Media Metrics -->
          <section class="social-metrics">
            <div class="social-count facebook-followers">
              <span class="count">50,000+</span>
              <span class="label">Facebook Followers</span>
            </div>
            <div class="social-count twitter-followers">
              <span class="count">25,000</span>
              <span class="label">Twitter Followers</span>
            </div>
            <div class="followers-count instagram">75K followers</div>
            <div class="subscribers youtube">100,000 subscribers</div>
          </section>

          <!-- Trust Signals -->
          <section class="trust-signals">
            <div class="trust-badge security-badge">
              <img src="ssl-secure.png" alt="SSL Secure">
              <p>SSL Secured</p>
            </div>
            <div class="certification">
              <img src="iso-certified.png" alt="ISO 9001 Certified">
              <p>ISO 9001 Certified</p>
            </div>
            <div class="award best-product">
              <img src="award-2024.png" alt="Best Product 2024">
              <p>Best Product Award 2024</p>
            </div>
            <div class="badge verified-company">
              <span>✓ Verified Company</span>
            </div>
            <div class="guarantee money-back">
              <span>30-Day Money Back Guarantee</span>
            </div>
          </section>

          <!-- Customer Logos -->
          <section class="customer-logos">
            <h2>Trusted by Industry Leaders</h2>
            <div class="logo-grid">
              <img src="customer1-logo.png" alt="TechCorp" class="customer-logo">
              <img src="customer2-logo.png" alt="InnovateCo" class="client-logo">
              <img src="customer3-logo.png" alt="GlobalTech" class="partner-logo">
              <img src="customer4-logo.png" alt="FutureSoft" class="customer-logo">
            </div>
          </section>

          <!-- Additional Trust Elements -->
          <div class="security-mentions">
            <p>Your data is encrypted and secure with our SOC 2 compliant infrastructure.</p>
            <p>We are certified partners with leading technology companies.</p>
          </div>

          <div class="social-mentions">
            <p>Featured in TechCrunch, Forbes, and Wall Street Journal.</p>
            <p>Join thousands of satisfied customers worldwide.</p>
          </div>
        </body>
        </html>
      `;
      mockDOM = new JSDOM(comprehensiveHTML);
    });

    test('analyze should return complete social proof structure', async () => {
      const document = mockDOM.window.document;
      const result = await analyzer.analyze({ document });

      expect(result).toBeDefined();
      expect(result).toHaveProperty('testimonials');
      expect(result).toHaveProperty('ratings');
      expect(result).toHaveProperty('socialMetrics');
      expect(result).toHaveProperty('trustSignals');
      expect(result).toHaveProperty('customerLogos');
      expect(result).toHaveProperty('summary');
    });
  });

  describe('Testimonials Analysis', () => {
    test('_findTestimonials should detect and analyze testimonials', () => {
      const document = mockDOM.window.document;
      const result = analyzer._findTestimonials(document);

      expect(result).toBeDefined();
      expect(result.count).toBeGreaterThan(0);
      expect(result.hasTestimonials).toBe(true);
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBeGreaterThan(0);

      const firstTestimonial = result.items[0];
      expect(firstTestimonial).toHaveProperty('content');
      expect(firstTestimonial).toHaveProperty('hasAuthor');
      expect(firstTestimonial).toHaveProperty('hasCompany');
      expect(firstTestimonial).toHaveProperty('hasPhoto');
      expect(firstTestimonial).toHaveProperty('quality');
      expect(firstTestimonial.content).toContain('transformed our business');
    });

    test('_analyzeTestimonialQuality should assess testimonial credibility', () => {
      const highQualityTestimonial = {
        content: 'This product has completely transformed our business operations with measurable results.',
        authorName: 'Sarah Johnson',
        authorTitle: 'CEO',
        company: 'Tech Innovations Inc.',
        hasPhoto: true,
        isVerified: false
      };

      const result = analyzer._analyzeTestimonialQuality(highQualityTestimonial);

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThan(70); // High quality should score well
      expect(result.credibilityFactors).toContain('hasAuthorName');
      expect(result.credibilityFactors).toContain('hasCompany');
      expect(result.credibilityFactors).toContain('hasSpecificDetails');
    });

    test('_extractTestimonialData should extract complete testimonial information', () => {
      const testimonialHTML = `
        <div class="testimonial">
          <p class="testimonial-content">"Outstanding results in just 30 days!"</p>
          <div class="testimonial-author">
            <img src="author.jpg" alt="John Smith" class="author-photo">
            <h4>John Smith</h4>
            <p class="author-company">Marketing Director, Global Corp</p>
          </div>
          <div class="testimonial-rating">★★★★★</div>
          <div class="verified-badge">Verified Customer</div>
        </div>
      `;
      const testimonialDOM = new JSDOM(testimonialHTML);
      const element = testimonialDOM.window.document.querySelector('.testimonial');

      const result = analyzer._extractTestimonialData(element);

      expect(result).toBeDefined();
      expect(result.content).toContain('Outstanding results');
      expect(result.authorName).toBe('John Smith');
      expect(result.company).toContain('Global Corp');
      expect(result.hasPhoto).toBe(true);
      expect(result.hasRating).toBe(true);
      expect(result.isVerified).toBe(true);
    });
  });

  describe('Ratings Analysis', () => {
    test('_findRatings should detect and analyze rating systems', () => {
      const document = mockDOM.window.document;
      const result = analyzer._findRatings(document);

      expect(result).toBeDefined();
      expect(result.count).toBeGreaterThan(0);
      expect(result.hasRatings).toBe(true);
      expect(result.averageRating).toBeGreaterThan(4);
      expect(result.totalReviews).toBeGreaterThan(2000);
      expect(result.hasBreakdown).toBe(true);
    });

    test('_extractRatingValue should parse different rating formats', () => {
      const testCases = [
        { text: '4.9', expected: 4.9 },
        { text: '★★★★★', expected: 5 },
        { text: '4/5 stars', expected: 4 },
        { text: '85%', expected: 4.25 }, // 85% of 5 stars
        { text: 'Rating: 4.7 out of 5', expected: 4.7 },
        { text: 'No rating found', expected: null }
      ];

      testCases.forEach(({ text, expected }) => {
        const result = analyzer._extractRatingValue(text);
        if (expected === null) {
          expect(result).toBeNull();
        } else {
          expect(result).toBeCloseTo(expected, 1);
        }
      });
    });

    test('_parseReviewCount should extract review counts from text', () => {
      const testCases = [
        { text: '2,500+ reviews', expected: 2500 },
        { text: 'Based on 1,234 reviews', expected: 1234 },
        { text: '(500 reviews)', expected: 500 },
        { text: '10K reviews', expected: 10000 },
        { text: 'No numbers here', expected: 0 }
      ];

      testCases.forEach(({ text, expected }) => {
        const result = analyzer._parseReviewCount(text);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Social Metrics Analysis', () => {
    test('_findSocialMetrics should detect follower counts and engagement', () => {
      const document = mockDOM.window.document;
      const result = analyzer._findSocialMetrics(document);

      expect(result).toBeDefined();
      expect(result.count).toBeGreaterThan(0);
      expect(result.totalFollowers).toBeGreaterThan(0);
      expect(Array.isArray(result.platforms)).toBe(true);
      expect(result.platforms.length).toBeGreaterThan(0);
    });

    test('_parseSocialCount should extract follower numbers from various formats', () => {
      const testCases = [
        { text: '50,000+ followers', expected: 50000 },
        { text: '25K followers', expected: 25000 },
        { text: '1.5M subscribers', expected: 1500000 },
        { text: '75K', expected: 75000 },
        { text: '100,000 subscribers', expected: 100000 },
        { text: 'No numbers', expected: 0 }
      ];

      testCases.forEach(({ text, expected }) => {
        const result = analyzer._parseSocialCount(text);
        expect(result).toBe(expected);
      });
    });

    test('_identifySocialPlatform should detect platform types', () => {
      const testCases = [
        { text: 'facebook followers', expected: 'facebook' },
        { text: 'twitter-followers', expected: 'twitter' },
        { text: 'instagram count', expected: 'instagram' },
        { text: 'youtube subscribers', expected: 'youtube' },
        { text: 'linkedin connections', expected: 'linkedin' },
        { text: 'tiktok fans', expected: 'tiktok' },
        { text: 'unknown platform', expected: 'unknown' }
      ];

      testCases.forEach(({ text, expected }) => {
        const result = analyzer._identifySocialPlatform(text);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Trust Signals Analysis', () => {
    test('_findTrustSignals should detect various trust indicators', () => {
      const document = mockDOM.window.document;
      const result = analyzer._findTrustSignals(document);

      expect(result).toBeDefined();
      expect(result.count).toBeGreaterThan(0);
      expect(result.hasTrustSignals).toBe(true);
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.types).toBeDefined();
      expect(result.types.security).toBeGreaterThan(0);
      expect(result.types.certifications).toBeGreaterThan(0);
      expect(result.types.awards).toBeGreaterThan(0);
    });

    test('_categorizeTrustSignal should classify trust signal types', () => {
      const testCases = [
        { text: 'SSL Secured', expected: 'security' },
        { text: 'ISO 9001 Certified', expected: 'certification' },
        { text: 'Best Product Award', expected: 'award' },
        { text: 'Money Back Guarantee', expected: 'guarantee' },
        { text: 'Verified Company', expected: 'verification' },
        { text: 'BBB Accredited', expected: 'certification' },
        { text: 'Unknown badge', expected: 'other' }
      ];

      testCases.forEach(({ text, expected }) => {
        const result = analyzer._categorizeTrustSignal(text);
        expect(result).toBe(expected);
      });
    });

    test('_assessTrustSignalCredibility should evaluate trust signal quality', () => {
      const highCredibilitySignal = {
        text: 'ISO 9001 Certified',
        hasImage: true,
        hasVerificationLink: true,
        category: 'certification'
      };

      const result = analyzer._assessTrustSignalCredibility(highCredibilitySignal);

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThan(70);
      expect(result.credibilityFactors).toContain('recognizedCertification');
      expect(result.credibilityFactors).toContain('hasVisualProof');
    });
  });

  describe('Customer Logos Analysis', () => {
    test('_findCustomerLogos should detect client/customer logos', () => {
      const document = mockDOM.window.document;
      const result = analyzer._findCustomerLogos(document);

      expect(result).toBeDefined();
      expect(result.count).toBeGreaterThan(0);
      expect(result.hasCustomerLogos).toBe(true);
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBeGreaterThan(0);
    });

    test('_analyzeLogoQuality should assess logo presentation quality', () => {
      const logoElement = {
        src: 'customer-logo.png',
        alt: 'TechCorp - Fortune 500 Company',
        hasContext: true,
        isHighRes: true
      };

      const result = analyzer._analyzeLogoQuality(logoElement);

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
      expect(result.hasAltText).toBe(true);
      expect(result.hasContext).toBe(true);
    });
  });

  describe('Social Proof Summary', () => {
    test('_calculateSocialProofSummary should generate comprehensive summary', () => {
      const mockAnalysis = {
        testimonials: { count: 5, quality: { averageScore: 85 } },
        ratings: { count: 3, averageRating: 4.8, totalReviews: 2500 },
        socialMetrics: { count: 4, totalFollowers: 250000 },
        trustSignals: { count: 8, types: { security: 2, certifications: 3, awards: 2 } },
        customerLogos: { count: 6, quality: { averageScore: 75 } }
      };

      const result = analyzer._calculateSocialProofSummary(mockAnalysis);

      expect(result).toBeDefined();
      expect(result.strength).toBeDefined();
      expect(['low', 'medium', 'high', 'excellent']).toContain(result.strength);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.totalElements).toBeGreaterThan(0);
      expect(result.recommendations).toBeDefined();
    });

    test('_assessSocialProofStrength should categorize strength levels', () => {
      const testCases = [
        { score: 90, expected: 'excellent' },
        { score: 75, expected: 'high' },
        { score: 50, expected: 'medium' },
        { score: 25, expected: 'low' }
      ];

      testCases.forEach(({ score, expected }) => {
        const result = analyzer._assessSocialProofStrength(score);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle empty document gracefully', async () => {
      const emptyDOM = new JSDOM('<html><head></head><body></body></html>');
      const document = emptyDOM.window.document;

      const result = await analyzer.analyze({ document });

      expect(result).toBeDefined();
      expect(result.testimonials.count).toBe(0);
      expect(result.ratings.count).toBe(0);
      expect(result.socialMetrics.count).toBe(0);
      expect(result.trustSignals.count).toBe(0);
      expect(result.customerLogos.count).toBe(0);
    });

    test('should handle malformed HTML gracefully', async () => {
      const malformedHTML = '<div class="testimonial"><p>Broken HTML<div></div>';
      const malformedDOM = new JSDOM(malformedHTML);
      const document = malformedDOM.window.document;

      await expect(analyzer.analyze({ document })).resolves.not.toThrow();
    });

    test('should handle null/undefined inputs gracefully', async () => {
      await expect(analyzer.analyze({ document: null })).resolves.not.toThrow();
      expect(() => analyzer.analyze(undefined)).not.toThrow();
    });
  });

  describe('Performance Tests', () => {
    test('should handle large documents efficiently', async () => {
      let largeHTML = '<html><body>';
      for (let i = 0; i < 1000; i++) {
        largeHTML += `
          <div class="testimonial">
            <p>"Testimonial content ${i}"</p>
            <span class="author">Author ${i}</span>
          </div>
        `;
      }
      largeHTML += '</body></html>';

      const largeDOM = new JSDOM(largeHTML);
      const document = largeDOM.window.document;

      const startTime = Date.now();
      const result = await analyzer.analyze({ document });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(result).toBeDefined();
      expect(result.testimonials.count).toBeGreaterThan(0);
    });
  });
});

console.log('✅ Social Proof Analyzer unit tests completed');
