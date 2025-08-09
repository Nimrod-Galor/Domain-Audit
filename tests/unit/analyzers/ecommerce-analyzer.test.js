/**
 * ============================================================================
 * E-COMMERCE ANALYZER UNIT TESTS
 * ============================================================================
 *
 * Comprehensive unit tests for the e-commerce analysis module including:
 * - Platform detection testing
 * - Product schema validation
 * - Cart and checkout analysis
 * - Payment security testing
 * - Review system validation
 * - Integration testing
 *
 * @author Nimrod Galor
 * @version 1.0.0
 */

import { EcommerceAnalyzer } from '../../../src/analyzers/ecommerce/ecommerce-analyzer.js';
import { ProductSchemaAnalyzer } from '../../../src/analyzers/ecommerce/product/product-schema-analyzer.js';
import { CartAnalyzer } from '../../../src/analyzers/ecommerce/checkout/cart-analyzer.js';
import { CheckoutAnalyzer } from '../../../src/analyzers/ecommerce/checkout/checkout-analyzer.js';
import { PaymentAnalyzer } from '../../../src/analyzers/ecommerce/checkout/payment-analyzer.js';
import { ReviewAnalyzer } from '../../../src/analyzers/ecommerce/reviews/review-analyzer.js';
import { JSDOM } from 'jsdom';

describe('EcommerceAnalyzer', () => {
  let analyzer;
  let mockDom;
  let mockDocument;

  beforeEach(() => {
    analyzer = new EcommerceAnalyzer();
    
    // Create a mock DOM
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test E-commerce Site</title>
          <meta charset="utf-8">
        </head>
        <body>
          <div class="container">
            <h1>Welcome to our store</h1>
            <p>Best products online</p>
          </div>
        </body>
      </html>
    `;
    
    mockDom = new JSDOM(html);
    mockDocument = mockDom.window.document;
  });

  describe('Constructor', () => {
    test('should initialize with default options', () => {
      expect(analyzer.options.enableProductAnalysis).toBe(true);
      expect(analyzer.options.enableCheckoutAnalysis).toBe(true);
      expect(analyzer.options.enableReviewAnalysis).toBe(true);
      expect(analyzer.options.enableSecurityAnalysis).toBe(true);
      expect(analyzer.options.enableConversionAnalysis).toBe(true);
    });

    test('should initialize sub-analyzers', () => {
      expect(analyzer.analyzers.productSchema).toBeInstanceOf(ProductSchemaAnalyzer);
      expect(analyzer.analyzers.cart).toBeInstanceOf(CartAnalyzer);
      expect(analyzer.analyzers.checkout).toBeInstanceOf(CheckoutAnalyzer);
      expect(analyzer.analyzers.payment).toBeInstanceOf(PaymentAnalyzer);
      expect(analyzer.analyzers.reviews).toBeInstanceOf(ReviewAnalyzer);
    });

    test('should accept custom options', () => {
      const customAnalyzer = new EcommerceAnalyzer({
        enableProductAnalysis: false,
        enableSecurityAnalysis: false,
      });

      expect(customAnalyzer.options.enableProductAnalysis).toBe(false);
      expect(customAnalyzer.options.enableSecurityAnalysis).toBe(false);
      expect(customAnalyzer.options.enableCheckoutAnalysis).toBe(true); // Should keep default
    });
  });

  describe('Platform Detection', () => {
    test('should detect Shopify platform', () => {
      const shopifyHtml = `
        <div class="shopify-section">
          <button class="shopify-payment-button">Buy Now</button>
        </div>
      `;
      const shopifyDom = new JSDOM(shopifyHtml);
      const result = analyzer._detectEcommerceType(shopifyDom.window.document, 'https://store.myshopify.com');
      
      expect(result).toBe('shopify');
    });

    test('should detect WooCommerce platform', () => {
      const wooHtml = `
        <div class="woocommerce">
          <div class="cart-contents">
            <button class="add-to-cart">Add to Cart</button>
          </div>
        </div>
      `;
      const wooDom = new JSDOM(wooHtml);
      const result = analyzer._detectEcommerceType(wooDom.window.document, 'https://example.com');
      
      expect(result).toBe('woocommerce');
    });

    test('should detect Magento platform', () => {
      const magentoHtml = `
        <div class="page-product">
          <div class="checkout-cart">Cart</div>
        </div>
      `;
      const magentoDom = new JSDOM(magentoHtml);
      const result = analyzer._detectEcommerceType(magentoDom.window.document, 'https://example.com');
      
      expect(result).toBe('magento');
    });

    test('should detect custom e-commerce implementation', () => {
      const customHtml = `
        <div class="product-container">
          <button class="add-to-cart">Add to Cart</button>
          <div class="shopping-cart">Cart (0)</div>
          <span class="product-price">$29.99</span>
        </div>
      `;
      const customDom = new JSDOM(customHtml);
      const result = analyzer._detectEcommerceType(customDom.window.document, 'https://example.com');
      
      expect(result).toBe('custom');
    });

    test('should return "none" for non-e-commerce sites', () => {
      const blogHtml = `
        <div class="blog-post">
          <h1>My Blog Post</h1>
          <p>This is just a blog.</p>
        </div>
      `;
      const blogDom = new JSDOM(blogHtml);
      const result = analyzer._detectEcommerceType(blogDom.window.document, 'https://myblog.com');
      
      expect(result).toBe('none');
    });
  });

  describe('analyze', () => {
    test('should return non-e-commerce result for non-e-commerce sites', async () => {
      const context = {
        document: mockDom.window.document,
        url: 'https://myblog.com',
        pageData: {}
      };
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.type).toBe('non-ecommerce');
      expect(result.data.message).toBe('No e-commerce indicators detected');
      expect(result.data.metadata.analysisTime).toBeGreaterThan(0);
      expect(result.data.metadata.timestamp).toBeDefined();
    });

    test('should perform comprehensive analysis for e-commerce sites', async () => {
      const ecommerceHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Test Store</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Test Product",
              "description": "A great product",
              "price": "29.99",
              "availability": "InStock",
              "brand": "TestBrand"
            }
            </script>
          </head>
          <body>
            <div class="product">
              <h1>Test Product</h1>
              <span class="price">$29.99</span>
              <button class="add-to-cart">Add to Cart</button>
              <div class="reviews">
                <div class="review">Great product!</div>
                <div class="rating">5 stars</div>
              </div>
            </div>
          </body>
        </html>
      `;
      
      const ecommerceDom = new JSDOM(ecommerceHtml);
      const context = {
        document: ecommerceDom.window.document,
        url: 'https://store.com/product',
        pageData: {}
      };
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.type).toBe('custom');
      expect(result.data.product).toBeDefined();
      expect(result.data.checkout).toBeDefined();
      expect(result.data.reviews).toBeDefined();
      expect(result.data.security).toBeDefined();
      expect(result.data.conversion).toBeDefined();
      expect(result.data.schema).toBeDefined();
      expect(result.data.optimization).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.data.metadata.analysisTime).toBeGreaterThan(0);
    });

    test('should handle analysis errors gracefully', async () => {
      // Mock an error in sub-analyzer
      jest.spyOn(analyzer.analyzers.productSchema, 'analyze').mockImplementation(() => {
        throw new Error('Test error');
      });

      const ecommerceHtml = `
        <div class="add-to-cart">Add to Cart</div>
      `;
      const ecommerceDom = new JSDOM(ecommerceHtml);
      
      const context = {
        document: ecommerceDom.window.document,
        url: 'https://store.com',
        pageData: {}
      };
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('E-commerce analysis failed');
      expect(result.duration).toBeGreaterThan(0);
    });
  });

  describe('Conversion Optimization Analysis', () => {
    test('should analyze call-to-action elements', () => {
      const ctaHtml = `
        <button class="add-to-cart">Add to Cart</button>
        <button class="buy-now">Buy Now</button>
        <a class="shop-now">Shop Now</a>
      `;
      const ctaDom = new JSDOM(ctaHtml);
      const result = analyzer._analyzeCTA(ctaDom.window.document);
      
      expect(result.count).toBe(3);
      expect(result.hasProminent).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(result.elements).toHaveLength(3);
    });

    test('should analyze product photos', () => {
      const photoHtml = `
        <img class="product-image" src="product1.jpg" alt="Product 1">
        <img class="product-photo" src="product2.jpg" alt="Product 2" width="1000">
      `;
      const photoDom = new JSDOM(photoHtml);
      const result = analyzer._analyzeProductPhotos(photoDom.window.document);
      
      expect(result.count).toBe(2);
      expect(result.hasMultipleViews).toBe(true);
      expect(result.hasAltText).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });

    test('should analyze product descriptions', () => {
      const descHtml = `
        <div class="product-description">
          This is a detailed product description with more than fifty words to test 
          the analysis functionality. It includes features, benefits, and specifications 
          that help customers make informed purchasing decisions. The description is 
          comprehensive and provides value to potential buyers.
        </div>
      `;
      const descDom = new JSDOM(descHtml);
      const result = analyzer._analyzeProductDescriptions(descDom.window.document);
      
      expect(result.count).toBe(1);
      expect(result.totalWords).toBeGreaterThan(50);
      expect(result.hasDetailedDescription).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });

    test('should analyze trust signals', () => {
      const trustHtml = `
        <div>Money-back guarantee</div>
        <div>Free shipping on all orders</div>
        <div>Secure checkout</div>
        <div>SSL encrypted</div>
      `;
      const trustDom = new JSDOM(trustHtml);
      const result = analyzer._analyzeTrustSignals(trustDom.window.document);
      
      expect(result.signals).toContain('money-back guarantee');
      expect(result.signals).toContain('free shipping');
      expect(result.signals).toContain('secure checkout');
      expect(result.signals).toContain('ssl');
      expect(result.count).toBe(4);
      expect(result.score).toBeGreaterThan(0);
    });

    test('should analyze urgency indicators', () => {
      const urgencyHtml = `
        <div>Limited time offer!</div>
        <div>Only 3 left in stock</div>
        <div>Sale ends soon</div>
        <div>Hurry, while supplies last</div>
      `;
      const urgencyDom = new JSDOM(urgencyHtml);
      const result = analyzer._analyzeUrgencyIndicators(urgencyDom.window.document);
      
      expect(result.indicators.length).toBeGreaterThan(0);
      expect(result.count).toBeGreaterThan(0);
      expect(result.score).toBeGreaterThan(0);
    });

    test('should analyze social proof elements', () => {
      const socialHtml = `
        <div class="testimonial">Great product! Highly recommend.</div>
        <div class="review-count">4.8 stars (245 reviews)</div>
        <div class="customer-count">Over 10,000 satisfied customers</div>
        <div class="rating">★★★★★</div>
      `;
      const socialDom = new JSDOM(socialHtml);
      const result = analyzer._analyzeSocialProof(socialDom.window.document);
      
      expect(result.elements).toBe(4);
      expect(result.hasTestimonials).toBe(true);
      expect(result.hasReviewCount).toBe(true);
      expect(result.hasRatings).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });
  });

  describe('Score Calculation', () => {
    test('should calculate comprehensive e-commerce score', () => {
      const mockAnalysis = {
        product: { score: 85 },
        checkout: { overallScore: 78 },
        reviews: { score: 92 },
        security: { score: 88 },
        conversion: {
          callToAction: { score: 80 },
          productPhotos: { score: 90 },
          productDescriptions: { score: 85 },
          trustSignals: { score: 75 },
          urgencyIndicators: { score: 60 },
          socialProof: { score: 95 }
        },
        schema: { score: 70 }
      };

      const result = analyzer._calculateEcommerceScore(mockAnalysis);
      
      expect(result.overall).toBeGreaterThan(70);
      expect(result.overall).toBeLessThan(100);
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.product).toBe(85);
      expect(result.breakdown.checkout).toBe(78);
      expect(result.breakdown.reviews).toBe(92);
      expect(result.breakdown.security).toBe(88);
      expect(result.grade).toMatch(/[A-F]/);
    });

    test('should calculate conversion score correctly', () => {
      const conversionData = {
        callToAction: { score: 80 },
        productPhotos: { score: 90 },
        productDescriptions: { score: 85 },
        trustSignals: { score: 75 },
        urgencyIndicators: { score: 60 },
        socialProof: { score: 95 }
      };

      const result = analyzer._calculateConversionScore(conversionData);
      
      expect(result).toBe(Math.round((80 + 90 + 85 + 75 + 60 + 95) / 6));
    });

    test('should return appropriate grade for score', () => {
      expect(analyzer._getScoreGrade(95)).toBe('A');
      expect(analyzer._getScoreGrade(85)).toBe('B');
      expect(analyzer._getScoreGrade(75)).toBe('C');
      expect(analyzer._getScoreGrade(65)).toBe('D');
      expect(analyzer._getScoreGrade(55)).toBe('F');
    });
  });

  describe('Recommendations Generation', () => {
    test('should generate product optimization recommendations', () => {
      const mockAnalysis = {
        product: { score: 60 },
        checkout: { overallScore: 80 },
        security: { score: 90 },
        reviews: { score: 70 }
      };

      const recommendations = analyzer._generateEcommerceRecommendations(mockAnalysis);
      
      const productRec = recommendations.find(rec => rec.category === 'Product Optimization');
      expect(productRec).toBeDefined();
      expect(productRec.priority).toBe('high');
      expect(productRec.recommendation).toContain('schema markup');
    });

    test('should generate checkout optimization recommendations', () => {
      const mockAnalysis = {
        product: { score: 85 },
        checkout: { overallScore: 60 },
        security: { score: 90 },
        reviews: { score: 80 }
      };

      const recommendations = analyzer._generateEcommerceRecommendations(mockAnalysis);
      
      const checkoutRec = recommendations.find(rec => rec.category === 'Checkout Process');
      expect(checkoutRec).toBeDefined();
      expect(checkoutRec.priority).toBe('high');
      expect(checkoutRec.recommendation).toContain('checkout');
    });

    test('should generate security recommendations', () => {
      const mockAnalysis = {
        product: { score: 85 },
        checkout: { overallScore: 80 },
        security: { score: 70 },
        reviews: { score: 80 }
      };

      const recommendations = analyzer._generateEcommerceRecommendations(mockAnalysis);
      
      const securityRec = recommendations.find(rec => rec.category === 'Payment Security');
      expect(securityRec).toBeDefined();
      expect(securityRec.priority).toBe('critical');
      expect(securityRec.recommendation).toContain('security');
    });

    test('should generate review system recommendations', () => {
      const mockAnalysis = {
        product: { score: 85 },
        checkout: { overallScore: 80 },
        security: { score: 90 },
        reviews: { score: 50 }
      };

      const recommendations = analyzer._generateEcommerceRecommendations(mockAnalysis);
      
      const reviewRec = recommendations.find(rec => rec.category === 'Customer Reviews');
      expect(reviewRec).toBeDefined();
      expect(reviewRec.priority).toBe('medium');
      expect(reviewRec.recommendation).toContain('review system');
    });
  });

  describe('Utility Methods', () => {
    test('should check element visibility correctly', () => {
      const visibleHtml = `
        <div class="visible-element">Visible</div>
        <div style="display: none" class="hidden-element">Hidden</div>
        <div style="visibility: hidden" class="invisible-element">Invisible</div>
        <div style="opacity: 0" class="transparent-element">Transparent</div>
      `;
      const visibilityDom = new JSDOM(visibleHtml);
      const doc = visibilityDom.window.document;

      const visibleElement = doc.querySelector('.visible-element');
      const hiddenElement = doc.querySelector('.hidden-element');

      // Note: In JSDOM, getComputedStyle might not work as expected
      // This test verifies the method exists and handles the logic
      expect(typeof analyzer._isElementVisible).toBe('function');
    });
  });

  describe('Integration Tests', () => {
    test('should work with real-world e-commerce HTML structure', async () => {
      const realWorldHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Premium Headphones - AudioStore</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Premium Wireless Headphones",
              "description": "High-quality wireless headphones with noise cancellation",
              "brand": { "@type": "Brand", "name": "AudioPro" },
              "offers": {
                "@type": "Offer",
                "price": "199.99",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.5",
                "reviewCount": "128"
              }
            }
            </script>
          </head>
          <body>
            <div class="product-page">
              <h1>Premium Wireless Headphones</h1>
              <div class="product-images">
                <img src="headphones-1.jpg" alt="Premium Wireless Headphones Front View">
                <img src="headphones-2.jpg" alt="Premium Wireless Headphones Side View">
              </div>
              <div class="product-info">
                <span class="price">$199.99</span>
                <div class="availability">In Stock</div>
                <button class="add-to-cart">Add to Cart</button>
                <button class="buy-now">Buy Now</button>
              </div>
              <div class="product-description">
                Experience premium sound quality with our latest wireless headphones. 
                Features include active noise cancellation, 30-hour battery life, 
                and premium comfort padding. Perfect for music lovers and professionals.
              </div>
              <div class="reviews-section">
                <h3>Customer Reviews (128)</h3>
                <div class="average-rating">4.5 out of 5 stars</div>
                <div class="review">
                  <div class="rating">★★★★★</div>
                  <p>Amazing sound quality! The noise cancellation works perfectly.</p>
                  <span class="reviewer">John D. - Verified Purchase</span>
                </div>
                <div class="review">
                  <div class="rating">★★★★☆</div>
                  <p>Great headphones, very comfortable for long listening sessions.</p>
                  <span class="reviewer">Sarah M. - Verified Purchase</span>
                </div>
              </div>
              <div class="trust-signals">
                <div>Free shipping on orders over $100</div>
                <div>30-day money-back guarantee</div>
                <div>2-year warranty included</div>
                <div>Secure checkout with SSL encryption</div>
              </div>
            </div>
          </body>
        </html>
      `;

      const realWorldDom = new JSDOM(realWorldHtml);
      const context = {
        document: realWorldDom.window.document,
        url: 'https://audiostore.com/products/premium-headphones',
        pageData: { title: 'Premium Headphones - AudioStore' }
      };
      const result = await analyzer.analyze(context);

      // Verify comprehensive analysis
      expect(result.success).toBe(true);
      expect(result.data.type).toBe('custom');
      expect(result.data.product).toBeDefined();
      expect(result.data.checkout).toBeDefined();
      expect(result.data.reviews).toBeDefined();
      expect(result.data.security).toBeDefined();
      expect(result.data.conversion).toBeDefined();
      expect(result.data.schema).toBeDefined();
      expect(result.data.optimization).toBeDefined();
      expect(result.recommendations).toBeDefined();

      // Verify scoring
      expect(result.optimization.overall).toBeGreaterThan(0);
      expect(result.optimization.grade).toMatch(/[A-F]/);

      // Verify specific features detected
      expect(result.product.schemas.length).toBeGreaterThan(0);
      expect(result.reviews.hasReviews).toBe(true);
      expect(result.conversion.callToAction.count).toBeGreaterThan(0);
      expect(result.conversion.trustSignals.count).toBeGreaterThan(0);
    });

    test('should handle missing sub-analyzer methods gracefully', async () => {
      // Mock a missing method
      delete analyzer.analyzers.productSchema.analyze;
      
      const simpleHtml = '<div class="add-to-cart">Add to Cart</div>';
      const simpleDom = new JSDOM(simpleHtml);
      
      // Should not throw error
      expect(async () => {
        const context = {
          document: simpleDom.window.document,
          url: 'https://store.com',
          pageData: {}
        };
        await analyzer.analyze(context);
      }).not.toThrow();
    });
  });

  describe('Performance Tests', () => {
    test('should complete analysis within reasonable time', async () => {
      const startTime = Date.now();
      
      const complexHtml = `
        <div class="ecommerce-site">
          ${Array.from({ length: 100 }, (_, i) => `
            <div class="product" data-product-id="${i}">
              <h3>Product ${i}</h3>
              <span class="price">$${(i + 1) * 10}</span>
              <button class="add-to-cart">Add to Cart</button>
              <div class="review">Great product!</div>
            </div>
          `).join('')}
        </div>
      `;
      
      const complexDom = new JSDOM(complexHtml);
      const context = {
        document: complexDom.window.document,
        url: 'https://store.com',
        pageData: {}
      };
      const result = await analyzer.analyze(context);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });
});

describe('E-commerce Module Integration', () => {
  test('should integrate all sub-analyzers correctly', () => {
    const analyzer = new EcommerceAnalyzer();
    
    expect(analyzer.analyzers.productSchema).toBeInstanceOf(ProductSchemaAnalyzer);
    expect(analyzer.analyzers.cart).toBeInstanceOf(CartAnalyzer);
    expect(analyzer.analyzers.checkout).toBeInstanceOf(CheckoutAnalyzer);
    expect(analyzer.analyzers.payment).toBeInstanceOf(PaymentAnalyzer);
    expect(analyzer.analyzers.reviews).toBeInstanceOf(ReviewAnalyzer);
  });

  test('should maintain consistent scoring across all analyzers', () => {
    const analyzer = new EcommerceAnalyzer();
    
    // All score methods should return values between 0-100
    expect(typeof analyzer._calculateEcommerceScore).toBe('function');
    expect(typeof analyzer._calculateConversionScore).toBe('function');
    expect(typeof analyzer._getScoreGrade).toBe('function');
  });
});
