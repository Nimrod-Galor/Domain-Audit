/**
 * PageTypeClassifier Migration Test
 * Testing BaseAnalyzer integration for page classification functionality
 * Created: 2025-01-08
 */

import { JSDOM } from 'jsdom';
import { PageTypeClassifier } from '../src/analyzers/classification/PageTypeClassifier.js';
import { AnalyzerCategories } from '../src/analyzers/base/BaseAnalyzer.js';

describe('PageTypeClassifier Migration Tests', () => {
  let analyzer;
  let testDom;
  let testUrl;

  beforeEach(() => {
    analyzer = new PageTypeClassifier();
    testUrl = 'https://example.com/test-page';
  });

  describe('BaseAnalyzer Integration', () => {
    test('should extend BaseAnalyzer correctly', () => {
      expect(analyzer).toBeInstanceOf(PageTypeClassifier);
      expect(analyzer.name).toBe('PageTypeClassifier');
      expect(analyzer.options).toBeDefined();
      expect(typeof analyzer.log).toBe('function');
      expect(typeof analyzer.measureTime).toBe('function');
      expect(typeof analyzer.handleError).toBe('function');
      expect(typeof analyzer.safeQuery).toBe('function');
    });

    test('should have correct metadata', () => {
      const metadata = analyzer.getMetadata();
      expect(metadata.name).toBe('PageTypeClassifier');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.description).toContain('page classification');
      expect(metadata.category).toBe(AnalyzerCategories.CLASSIFICATION);
      expect(metadata.priority).toBe('medium');
    });

    test('should handle options correctly', () => {
      const customAnalyzer = new PageTypeClassifier({
        enableContentAnalysis: false,
        confidenceThreshold: 0.8
      });
      
      expect(customAnalyzer.options.enableContentAnalysis).toBe(false);
      expect(customAnalyzer.options.confidenceThreshold).toBe(0.8);
      expect(customAnalyzer.options.enableStructureAnalysis).toBe(true); // default
    });
  });

  describe('Homepage Classification', () => {
    beforeEach(() => {
      testDom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Welcome to ExampleSite - Your Gateway to Innovation</title>
            <meta property="og:type" content="website">
          </head>
          <body>
            <nav role="navigation">
              <a href="/about">About</a>
              <a href="/products">Products</a>
              <a href="/contact">Contact</a>
            </nav>
            <div class="hero-banner">
              <h1>Welcome to Our Company</h1>
              <p>We provide innovative solutions for your business needs.</p>
            </div>
            <section class="features">
              <h2>Our Services</h2>
              <div class="service-grid">
                <div>Service 1</div>
                <div>Service 2</div>
                <div>Service 3</div>
              </div>
            </section>
            <footer>
              <p>&copy; 2025 ExampleSite</p>
            </footer>
          </body>
        </html>
      `);
    });

    test('should classify homepage correctly', async () => {
      const result = await analyzer.analyze(testDom.window.document, 'https://example.com');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.primaryType).toBe('HOMEPAGE');
      expect(result.data.confidence).toBeGreaterThan(0.6);
      expect(result.data.detectedTypes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'HOMEPAGE',
            confidence: expect.any(Number)
          })
        ])
      );
    });

    test('should analyze URL patterns', async () => {
      const result = await analyzer.analyze(testDom.window.document, 'https://example.com');
      
      expect(result.data.urlAnalysis).toBeDefined();
      expect(result.data.urlAnalysis.matches).toBeDefined();
      expect(result.data.urlAnalysis.indicators).toBeInstanceOf(Array);
    });

    test('should analyze title patterns', async () => {
      const result = await analyzer.analyze(testDom.window.document, 'https://example.com');
      
      expect(result.data.titleAnalysis).toBeDefined();
      expect(result.data.titleAnalysis.title).toContain('Welcome');
      expect(result.data.titleAnalysis.matches).toBeDefined();
    });
  });

  describe('Product Page Classification', () => {
    beforeEach(() => {
      testDom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>iPhone 15 Pro - Apple Store</title>
            <meta property="og:type" content="product">
          </head>
          <body>
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": "iPhone 15 Pro",
                "price": "$999"
              }
            </script>
            <nav class="breadcrumb">
              <a href="/">Home</a> > <a href="/phones">Phones</a> > iPhone 15 Pro
            </nav>
            <div class="product-details">
              <h1>iPhone 15 Pro</h1>
              <div class="price">$999.00</div>
              <div class="rating">
                <span class="stars">★★★★★</span>
                <span>4.8/5 (1,234 reviews)</span>
              </div>
              <button class="add-to-cart">Add to Cart</button>
            </div>
            <div class="product-description">
              <p>The most advanced iPhone yet with titanium design.</p>
            </div>
            <div class="reviews">
              <h3>Customer Reviews</h3>
              <div class="comment">Great phone!</div>
            </div>
          </body>
        </html>
      `);
    });

    test('should classify product page correctly', async () => {
      const result = await analyzer.analyze(testDom.window.document, 'https://apple.com/iphone-15-pro');
      
      expect(result.success).toBe(true);
      expect(result.data.primaryType).toBe('PRODUCT');
      expect(result.data.confidence).toBeGreaterThan(0.7);
    });

    test('should detect semantic markup', async () => {
      const result = await analyzer.analyze(testDom.window.document, 'https://apple.com/iphone-15-pro');
      
      expect(result.data.semanticAnalysis).toBeDefined();
      expect(result.data.semanticAnalysis.schemaTypes).toContain('Product');
      expect(result.data.semanticAnalysis.jsonLd).toHaveLength(1);
    });

    test('should detect page characteristics', async () => {
      const result = await analyzer.analyze(testDom.window.document, 'https://apple.com/iphone-15-pro');
      
      expect(result.data.pageCharacteristics.hasRating).toBe(true);
      expect(result.data.pageCharacteristics.hasPrice).toBe(true);
      expect(result.data.pageCharacteristics.hasBreadcrumbs).toBe(true);
      expect(result.data.pageCharacteristics.hasComments).toBe(true);
    });
  });

  describe('Article Classification', () => {
    beforeEach(() => {
      testDom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>How to Build Better Web Applications - TechBlog</title>
            <meta property="og:type" content="article">
            <meta property="og:article:published_time" content="2025-01-08">
          </head>
          <body>
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "How to Build Better Web Applications",
                "author": "John Doe"
              }
            </script>
            <article>
              <header>
                <h1>How to Build Better Web Applications</h1>
                <p class="meta">Published on January 8, 2025 by John Doe</p>
              </header>
              <div class="content">
                <p>Building modern web applications requires careful consideration of many factors including performance, accessibility, and user experience.</p>
                <h2>Key Principles</h2>
                <p>Here are the most important principles to follow when developing web applications.</p>
                <h2>Best Practices</h2>
                <p>These best practices will help you create maintainable and scalable applications.</p>
              </div>
              <div class="social-share">
                <button>Share on Twitter</button>
                <button>Share on Facebook</button>
              </div>
            </article>
            <div class="comments">
              <h3>Comments</h3>
              <div class="comment">Great article!</div>
              <div class="comment">Very helpful, thanks!</div>
            </div>
          </body>
        </html>
      `);
    });

    test('should classify article correctly', async () => {
      const result = await analyzer.analyze(testDom.window.document, 'https://techblog.com/how-to-build-web-apps');
      
      expect(result.success).toBe(true);
      expect(result.data.primaryType).toBe('ARTICLE');
      expect(result.data.confidence).toBeGreaterThan(0.8);
    });

    test('should analyze content metrics', async () => {
      const result = await analyzer.analyze(testDom.window.document, 'https://techblog.com/how-to-build-web-apps');
      
      expect(result.data.contentMetrics).toBeDefined();
      expect(result.data.contentMetrics.wordCount).toBeGreaterThan(20);
      expect(result.data.contentMetrics.headingCount).toBeGreaterThan(2);
      expect(result.data.contentMetrics.readingTime).toBeGreaterThan(0);
    });

    test('should detect article characteristics', async () => {
      const result = await analyzer.analyze(testDom.window.document, 'https://techblog.com/how-to-build-web-apps');
      
      expect(result.data.pageCharacteristics.hasSocialShare).toBe(true);
      expect(result.data.pageCharacteristics.hasComments).toBe(true);
    });
  });

  describe('Contact Page Classification', () => {
    beforeEach(() => {
      testDom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Contact Us - Get in Touch</title>
          </head>
          <body>
            <h1>Contact Us</h1>
            <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
            <form id="contact-form">
              <label for="name">Name:</label>
              <input type="text" id="name" name="name" required>
              
              <label for="email">Email:</label>
              <input type="email" id="email" name="email" required>
              
              <label for="message">Message:</label>
              <textarea id="message" name="message" required></textarea>
              
              <button type="submit">Send Message</button>
            </form>
            <div class="contact-info">
              <h2>Other Ways to Reach Us</h2>
              <p>Phone: (555) 123-4567</p>
              <p>Email: contact@example.com</p>
            </div>
          </body>
        </html>
      `);
    });

    test('should classify contact page correctly', async () => {
      const result = await analyzer.analyze(testDom.window.document, 'https://example.com/contact');
      
      expect(result.success).toBe(true);
      expect(result.data.primaryType).toBe('CONTACT');
      expect(result.data.confidence).toBeGreaterThan(0.7);
    });

    test('should detect form presence', async () => {
      const result = await analyzer.analyze(testDom.window.document, 'https://example.com/contact');
      
      expect(result.data.pageCharacteristics.hasForm).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid document gracefully', async () => {
      const result = await analyzer.analyze(null, 'https://example.com');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.data.primaryType).toBeNull();
      expect(result.data.confidence).toBe(0);
    });

    test('should handle malformed HTML', async () => {
      const malformedDom = new JSDOM('<html><head><title>Test</title></head><body><h1>Incomplete');
      const result = await analyzer.analyze(malformedDom.window.document, 'https://example.com');
      
      expect(result.success).toBe(true); // Should still work with malformed HTML
      expect(result.data).toBeDefined();
    });

    test('should handle empty content', async () => {
      const emptyDom = new JSDOM('<html><head></head><body></body></html>');
      const result = await analyzer.analyze(emptyDom.window.document, 'https://example.com');
      
      expect(result.success).toBe(true);
      expect(result.data.primaryType).toBeNull();
      expect(result.data.confidence).toBe(0);
    });
  });

  describe('Legacy Compatibility', () => {
    test('should support deprecated classifyPage method', async () => {
      const testDom = new JSDOM(`
        <html>
          <head><title>Test Page</title></head>
          <body><h1>Test</h1></body>
        </html>
      `);

      // Mock console.warn to verify deprecation warning
      const originalWarn = console.warn;
      const mockWarn = jest.fn();
      console.warn = mockWarn;

      const result = await analyzer.classifyPage(testDom, 'https://example.com/test');

      expect(mockWarn).toHaveBeenCalledWith('classifyPage() is deprecated. Use analyze() method instead.');
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // Restore console.warn
      console.warn = originalWarn;
    });
  });

  describe('Performance', () => {
    test('should complete analysis within reasonable time', async () => {
      const complexDom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Complex Page with Lots of Content</title>
          </head>
          <body>
            ${Array.from({ length: 100 }, (_, i) => `
              <div class="section-${i}">
                <h2>Section ${i}</h2>
                <p>This is content for section ${i} with various elements.</p>
                <img src="image-${i}.jpg" alt="Image ${i}">
                <a href="/link-${i}">Link ${i}</a>
              </div>
            `).join('')}
          </body>
        </html>
      `);

      const startTime = Date.now();
      const result = await analyzer.analyze(complexDom.window.document, 'https://example.com/complex');
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.analysisTime).toBeDefined();
    });
  });

  describe('Configuration Options', () => {
    test('should respect enableContentAnalysis option', async () => {
      const noContentAnalyzer = new PageTypeClassifier({ enableContentAnalysis: false });
      const testDom = new JSDOM('<html><head><title>Test</title></head><body><h1>Test</h1></body></html>');
      
      const result = await noContentAnalyzer.analyze(testDom.window.document, 'https://example.com');
      
      expect(result.success).toBe(true);
      expect(result.data.contentAnalysis).toBeNull();
    });

    test('should respect enableStructureAnalysis option', async () => {
      const noStructureAnalyzer = new PageTypeClassifier({ enableStructureAnalysis: false });
      const testDom = new JSDOM('<html><head><title>Test</title></head><body><nav>Test</nav></body></html>');
      
      const result = await noStructureAnalyzer.analyze(testDom.window.document, 'https://example.com');
      
      expect(result.success).toBe(true);
      expect(result.data.structureAnalysis).toBeNull();
    });

    test('should respect confidenceThreshold option', async () => {
      const strictAnalyzer = new PageTypeClassifier({ confidenceThreshold: 0.9 });
      const testDom = new JSDOM('<html><head><title>Test</title></head><body><h1>Test</h1></body></html>');
      
      const result = await strictAnalyzer.analyze(testDom.window.document, 'https://example.com');
      
      expect(result.success).toBe(true);
      // With high threshold, weak signals might not classify
      if (result.data.primaryType) {
        expect(result.data.confidence).toBeGreaterThanOrEqual(0.9);
      }
    });
  });
});

console.log('PageTypeClassifier Migration Test Suite loaded successfully');
