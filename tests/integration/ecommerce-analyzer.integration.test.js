/**
 * ============================================================================
 * E-COMMERCE INTEGRATION TESTS
 * ============================================================================
 *
 * Integration tests for the complete e-commerce analysis system including:
 * - End-to-end e-commerce analysis workflow
 * - Real-world e-commerce site testing
 * - Cross-module integration validation
 * - Performance and reliability testing
 *
 * @author Nimrod Galor
 * @version 1.0.0
 */

import { EcommerceAnalyzer } from '../../src/analyzers/ecommerce/ecommerce-analyzer.js';
import { ECOMMERCE_STANDARDS } from '../../src/analyzers/ecommerce/utils/ecommerce-constants.js';
import { JSDOM } from 'jsdom';

describe('E-commerce Integration Tests', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new EcommerceAnalyzer();
  });

  describe('End-to-End E-commerce Analysis', () => {
    test('should perform complete analysis on Shopify store', async () => {
      const shopifyHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Test Shopify Store</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Premium T-Shirt",
              "description": "High-quality cotton t-shirt",
              "brand": { "@type": "Brand", "name": "TestBrand" },
              "offers": {
                "@type": "Offer",
                "price": "29.99",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "url": "https://store.myshopify.com/products/premium-tshirt"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.7",
                "reviewCount": "89"
              }
            }
            </script>
          </head>
          <body>
            <div class="shopify-section">
              <header class="site-header">
                <div class="cart-link">Cart (0)</div>
              </header>
              
              <main class="product-page">
                <div class="product-images">
                  <img src="tshirt-front.jpg" alt="Premium T-Shirt Front View" width="800">
                  <img src="tshirt-back.jpg" alt="Premium T-Shirt Back View" width="800">
                </div>
                
                <div class="product-details">
                  <h1>Premium T-Shirt</h1>
                  <div class="price">$29.99</div>
                  <div class="product-description">
                    Made from 100% organic cotton, this premium t-shirt offers exceptional 
                    comfort and durability. Perfect for everyday wear with a modern fit 
                    that looks great on everyone. Available in multiple colors and sizes.
                  </div>
                  
                  <form class="product-form">
                    <div class="product-options">
                      <label>Size:</label>
                      <select name="size">
                        <option value="S">Small</option>
                        <option value="M">Medium</option>
                        <option value="L">Large</option>
                      </select>
                    </div>
                    
                    <div class="quantity-selector">
                      <label>Quantity:</label>
                      <input type="number" name="quantity" value="1" min="1">
                    </div>
                    
                    <button class="shopify-payment-button add-to-cart" type="submit">
                      Add to Cart
                    </button>
                    <button class="buy-now" type="button">Buy it now</button>
                  </form>
                  
                  <div class="trust-signals">
                    <div>Free shipping on orders over $50</div>
                    <div>30-day returns</div>
                    <div>Secure checkout</div>
                  </div>
                </div>
                
                <div class="reviews-section">
                  <h3>Customer Reviews</h3>
                  <div class="average-rating">4.7 out of 5 (89 reviews)</div>
                  
                  <div class="rating-breakdown">
                    <div class="rating-bar">5 stars: 67%</div>
                    <div class="rating-bar">4 stars: 25%</div>
                    <div class="rating-bar">3 stars: 6%</div>
                    <div class="rating-bar">2 stars: 1%</div>
                    <div class="rating-bar">1 star: 1%</div>
                  </div>
                  
                  <div class="review">
                    <div class="rating">★★★★★</div>
                    <p>Love this shirt! The quality is amazing and it fits perfectly.</p>
                    <span class="reviewer">Emma S. - Verified Purchase</span>
                    <span class="review-date">March 15, 2024</span>
                  </div>
                  
                  <div class="review">
                    <div class="rating">★★★★☆</div>
                    <p>Great quality shirt, very comfortable. Color is exactly as shown.</p>
                    <span class="reviewer">Mike R. - Verified Purchase</span>
                    <span class="review-date">March 12, 2024</span>
                  </div>
                </div>
                
                <div class="checkout-features">
                  <div class="payment-methods">
                    <img src="visa.png" alt="Visa">
                    <img src="mastercard.png" alt="Mastercard">
                    <img src="paypal.png" alt="PayPal">
                    <img src="apple-pay.png" alt="Apple Pay">
                  </div>
                  <div class="security-badges">
                    <img src="ssl-badge.png" alt="SSL Secure">
                    <img src="shopify-secure.png" alt="Shopify Secure">
                  </div>
                </div>
              </main>
            </div>
          </body>
        </html>
      `;

      const dom = new JSDOM(shopifyHTML);
      const pageData = { title: 'Premium T-Shirt | Test Shopify Store' };
      const url = 'https://store.myshopify.com/products/premium-tshirt';

      const context = {
        document: dom.window.document,
        url: url,
        pageData: pageData
      };
      const result = await analyzer.analyze(context);

      // Verify platform detection
      expect(result.success).toBe(true);
      expect(result.data.type).toBe('shopify');

      // Verify comprehensive analysis structure
      expect(result.data.product).toBeDefined();
      expect(result.data.checkout).toBeDefined();
      expect(result.data.reviews).toBeDefined();
      expect(result.data.security).toBeDefined();
      expect(result.data.conversion).toBeDefined();
      expect(result.data.schema).toBeDefined();
      expect(result.data.optimization).toBeDefined();
      expect(result.recommendations).toBeDefined();

      // Verify product analysis
      expect(result.data.product.schemas.length).toBeGreaterThan(0);
      expect(result.data.product.productPage.hasProductTitle).toBe(true);
      expect(result.data.product.productPage.hasProductImages).toBe(true);
      expect(result.data.product.productPage.hasPrice).toBe(true);
      expect(result.data.product.productPage.hasAddToCart).toBe(true);

      // Verify schema validation
      expect(result.data.schema.hasReviewSchema).toBe(true);
      expect(result.data.schema.schemas.length).toBeGreaterThan(0);

      // Verify review system
      expect(result.reviews.hasReviews).toBe(true);
      expect(result.reviews.features.averageRating).toBe(true);
      expect(result.reviews.features.verifiedPurchase).toBe(true);

      // Verify conversion optimization
      expect(result.conversion.callToAction.count).toBeGreaterThan(0);
      expect(result.conversion.productPhotos.count).toBeGreaterThan(0);
      expect(result.conversion.trustSignals.count).toBeGreaterThan(0);

      // Verify overall scoring
      expect(result.optimization.overall).toBeGreaterThan(70);
      expect(result.optimization.grade).toMatch(/[A-C]/);
    });

    test('should analyze WooCommerce store with payment features', async () => {
      const woocommerceHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Electronic Gadgets Store</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body class="woocommerce">
            <div class="woocommerce-page">
              <div class="product woocommerce-product">
                <h1>Wireless Bluetooth Speaker</h1>
                
                <div class="product-images">
                  <img src="speaker-main.jpg" alt="Wireless Bluetooth Speaker">
                </div>
                
                <div class="product-summary">
                  <span class="price">$79.99</span>
                  <div class="stock in-stock">In stock</div>
                  
                  <form class="cart">
                    <div class="quantity">
                      <input type="number" name="quantity" value="1" min="1">
                    </div>
                    <button type="submit" class="single_add_to_cart_button">
                      Add to cart
                    </button>
                  </form>
                </div>
                
                <div class="woocommerce-tabs">
                  <div class="description">
                    High-quality wireless speaker with premium sound. Features Bluetooth 5.0, 
                    10-hour battery life, and waterproof design.
                  </div>
                </div>
                
                <div class="woocommerce-reviews">
                  <div class="reviews">
                    <h3>Reviews (23)</h3>
                    <div class="comment">
                      <div class="star-rating">★★★★★</div>
                      <p>Excellent sound quality for the price!</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="cart-contents">
                <div class="cart-subtotal">Subtotal: $0.00</div>
                <div class="checkout-button">
                  <a href="/checkout" class="wc-proceed-to-checkout">
                    Proceed to checkout
                  </a>
                </div>
              </div>
              
              <div class="payment-methods">
                <div class="payment-method">Credit Card</div>
                <div class="payment-method">PayPal</div>
                <div class="payment-method">Stripe</div>
              </div>
              
              <div class="security-info">
                <div>SSL Encrypted Checkout</div>
                <div>PCI Compliant</div>
                <div>Money-back guarantee</div>
              </div>
            </div>
          </body>
        </html>
      `;

      const dom = new JSDOM(woocommerceHTML);
      const context = {
        document: dom.window.document,
        url: 'https://electronicstore.com/product/bluetooth-speaker',
        pageData: { title: 'Wireless Bluetooth Speaker | Electronic Gadgets Store' }
      };
      const result = await analyzer.analyze(context);

      // Verify platform detection
      expect(result.success).toBe(true);
      expect(result.data.type).toBe('woocommerce');

      // Verify cart functionality detection
      expect(result.data.checkout.cart.hasCart).toBe(true);
      expect(result.data.checkout.cart.features.addToCart).toBe(true);
      expect(result.data.checkout.cart.features.quantityControls).toBe(true);
      expect(result.data.checkout.cart.features.subtotal).toBe(true);

      // Verify payment analysis
      expect(result.data.security.paymentMethods.supportedMethods.length).toBeGreaterThan(0);
      expect(result.data.security.security.encryptionMentioned).toBe(true);

      // Verify checkout process
      expect(result.checkout.checkout.hasCheckout).toBe(true);
    });

    test('should handle custom e-commerce implementation', async () => {
      const customHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Custom Fashion Store</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Designer Dress",
              "description": "Elegant evening dress",
              "brand": "FashionHouse",
              "offers": {
                "@type": "Offer",
                "price": "299.00",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              }
            }
            </script>
          </head>
          <body>
            <div class="custom-store">
              <div class="product-container">
                <h1>Designer Evening Dress</h1>
                <div class="product-price">$299.00</div>
                <div class="product-description">
                  Elegant evening dress perfect for special occasions. 
                  Made with premium fabrics and expert craftsmanship.
                </div>
                
                <div class="product-actions">
                  <button class="add-to-cart">Add to Shopping Bag</button>
                  <button class="buy-now">Buy Now</button>
                </div>
                
                <div class="shopping-cart">
                  <span class="cart-count">0 items</span>
                </div>
                
                <div class="customer-reviews">
                  <h3>What Our Customers Say</h3>
                  <div class="testimonial">
                    <p>Beautiful dress, perfect fit!</p>
                    <span class="customer">Sarah J.</span>
                  </div>
                </div>
                
                <div class="guarantee-info">
                  <div>Free shipping worldwide</div>
                  <div>30-day return policy</div>
                  <div>Secure payment processing</div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const dom = new JSDOM(customHTML);
      const context = {
        document: dom.window.document,
        url: 'https://fashionhouse.com/dresses/evening-dress',
        pageData: { title: 'Designer Evening Dress | Custom Fashion Store' }
      };
      const result = await analyzer.analyze(context);

      // Verify platform detection
      expect(result.success).toBe(true);
      expect(result.data.type).toBe('custom');

      // Verify basic e-commerce features
      expect(result.data.product.productPage.hasProductTitle).toBe(true);
      expect(result.data.product.productPage.hasPrice).toBe(true);
      expect(result.data.product.productPage.hasAddToCart).toBe(true);

      // Verify schema detection
      expect(result.data.product.schemas.length).toBeGreaterThan(0);

      // Verify trust signals
      expect(result.conversion.trustSignals.count).toBeGreaterThan(0);
    });
  });

  describe('Cross-Module Integration', () => {
    test('should integrate product schema with review analysis', async () => {
      const integratedHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Gaming Laptop",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "156"
              },
              "review": [
                {
                  "@type": "Review",
                  "author": { "@type": "Person", "name": "John Doe" },
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5"
                  },
                  "reviewBody": "Excellent gaming laptop!"
                }
              ]
            }
            </script>
          </head>
          <body>
            <div class="product">
              <h1>Gaming Laptop</h1>
              <button class="add-to-cart">Add to Cart</button>
              
              <div class="reviews">
                <div class="average-rating">4.8 stars (156 reviews)</div>
                <div class="review">
                  <div class="rating">★★★★★</div>
                  <p>Excellent gaming laptop! Runs all games smoothly.</p>
                  <span class="reviewer">John Doe</span>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const dom = new JSDOM(integratedHTML);
      const context = {
        document: dom.window.document,
        url: 'https://store.com/gaming-laptop',
        pageData: {}
      };
      const result = await analyzer.analyze(context);

      // Verify schema and review integration
      expect(result.success).toBe(true);
      expect(result.data.product.schemas.length).toBeGreaterThan(0);
      expect(result.data.reviews.hasReviews).toBe(true);
      expect(result.data.reviews.schema.hasReviewSchema).toBe(true);
      expect(result.data.reviews.schema.aggregateRating).toBe(true);
      expect(result.data.reviews.schema.individualReviews).toBe(true);
    });

    test('should integrate cart analysis with checkout process', async () => {
      const checkoutHTML = `
        <!DOCTYPE html>
        <html>
          <body>
            <div class="shopping-cart">
              <div class="cart-item">Product 1</div>
              <div class="cart-subtotal">$50.00</div>
              <button class="update-cart">Update Cart</button>
            </div>
            
            <div class="checkout-form">
              <form class="payment-form">
                <h2>Checkout</h2>
                <input type="email" name="email" placeholder="Email" required>
                <input type="text" name="card-number" placeholder="Card Number" required>
                <button type="submit" class="complete-order">Complete Order</button>
              </form>
              
              <div class="progress-indicator">
                <div class="step active">Cart</div>
                <div class="step">Shipping</div>
                <div class="step">Payment</div>
              </div>
            </div>
            
            <div class="payment-security">
              <img src="ssl-badge.png" alt="SSL Secure">
              <div>Secure 256-bit SSL encryption</div>
            </div>
          </body>
        </html>
      `;

      const dom = new JSDOM(checkoutHTML);
      const context = {
        document: dom.window.document,
        url: 'https://store.com/checkout',
        pageData: {}
      };
      const result = await analyzer.analyze(context);

      // Verify cart and checkout integration
      expect(result.success).toBe(true);
      expect(result.data.checkout.cart.hasCart).toBe(true);
      expect(result.checkout.cart.features.subtotal).toBe(true);
      expect(result.checkout.cart.features.updateCart).toBe(true);
      
      expect(result.checkout.checkout.hasCheckout).toBe(true);
      expect(result.checkout.checkout.progressIndicators.hasProgress).toBe(true);
      expect(result.checkout.checkout.forms.hasValidation).toBe(true);
    });

    test('should integrate payment analysis with security features', async () => {
      const securityHTML = `
        <!DOCTYPE html>
        <html>
          <body>
            <div class="payment-section">
              <div class="payment-methods">
                <img src="visa.png" alt="Visa">
                <img src="mastercard.png" alt="Mastercard">
                <img src="paypal.png" alt="PayPal">
                <img src="apple-pay.png" alt="Apple Pay">
                <img src="google-pay.png" alt="Google Pay">
              </div>
              
              <div class="security-features">
                <div>PCI DSS Compliant</div>
                <div>SSL Encrypted</div>
                <div>Fraud Protection</div>
                <div>Secure Checkout</div>
              </div>
              
              <div class="trust-badges">
                <img src="norton-badge.png" alt="Norton Secured">
                <img src="mcafee-badge.png" alt="McAfee Secure">
                <img src="trustpilot-badge.png" alt="Trustpilot">
              </div>
              
              <form class="payment-form" action="https://secure.payment.com/process">
                <input type="text" name="cc-number" autocomplete="cc-number" required>
                <input type="text" name="cc-exp" autocomplete="cc-exp" required>
                <input type="text" name="cc-csc" autocomplete="cc-csc" required>
              </form>
            </div>
          </body>
        </html>
      `;

      const dom = new JSDOM(securityHTML);
      const context = {
        document: dom.window.document,
        url: 'https://store.com/payment',
        pageData: {}
      };
      const result = await analyzer.analyze(context);

      // Verify payment and security integration
      expect(result.success).toBe(true);
      expect(result.security.paymentMethods.supportedMethods.length).toBeGreaterThan(2);
      expect(result.security.paymentMethods.digitalWallets.length).toBeGreaterThan(0);
      expect(result.security.paymentMethods.creditCards.length).toBeGreaterThan(0);
      
      expect(result.security.security.encryptionMentioned).toBe(true);
      expect(result.security.security.securityBadges.length).toBeGreaterThan(0);
      expect(result.security.trustSignals.badgeCount).toBeGreaterThan(0);
      
      expect(result.security.paymentForms.hasPaymentForm).toBe(true);
      expect(result.security.paymentForms.secureSubmission).toBe(true);
      expect(result.security.paymentForms.autoComplete).toBe(true);
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle large e-commerce sites efficiently', async () => {
      const largeHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Mega E-commerce Store</title>
          </head>
          <body>
            <div class="mega-store">
              ${Array.from({ length: 50 }, (_, i) => `
                <div class="product-grid">
                  ${Array.from({ length: 20 }, (_, j) => `
                    <div class="product-item" data-product="${i}-${j}">
                      <h3>Product ${i}-${j}</h3>
                      <span class="price">$${(i + j + 1) * 5}</span>
                      <button class="add-to-cart">Add to Cart</button>
                      <div class="rating">★★★★☆</div>
                    </div>
                  `).join('')}
                </div>
              `).join('')}
              
              <div class="shopping-cart">
                <span class="cart-count">0 items</span>
                <div class="cart-total">$0.00</div>
              </div>
              
              <div class="checkout-section">
                <button class="proceed-to-checkout">Checkout</button>
              </div>
            </div>
          </body>
        </html>
      `;

      const startTime = Date.now();
      const dom = new JSDOM(largeHTML);
      const context = {
        document: dom.window.document,
        url: 'https://megastore.com',
        pageData: {}
      };
      const result = await analyzer.analyze(context);
      const endTime = Date.now();

      expect(result.success).toBe(true);

      // Verify performance
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
      expect(result.analysisTime).toBeLessThan(10000);
      expect(result.type).toBe('custom');
      expect(result.optimization).toBeDefined();
    });

    test('should handle malformed HTML gracefully', async () => {
      const malformedHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Broken Store</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Broken Product"
              // Missing closing bracket and comma
            </script>
          </head>
          <body>
            <div class="product
              <h1>Unclosed Product Title
              <span class="price">$99.99
              <button class="add-to-cart">Add to Cart</button>
            </div>
            <div class="reviews">
              <div class="review">Good product
            </div>
          </body>
        </html>
      `;

      const dom = new JSDOM(malformedHTML);
      
      // Should not throw errors
      const context = {
        document: dom.window.document,
        url: 'https://brokenstore.com',
        pageData: {}
      };
      const result = await analyzer.analyze(context);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data.type).not.toBe('none'); // Should still detect e-commerce elements
      expect(result.data.metadata.analysisTime).toBeGreaterThan(0);
    });

    test('should provide consistent results across multiple runs', async () => {
      const consistentHTML = `
        <!DOCTYPE html>
        <html>
          <body>
            <div class="product">
              <h1>Test Product</h1>
              <span class="price">$50.00</span>
              <button class="add-to-cart">Add to Cart</button>
              <div class="reviews">
                <div class="review">Great product!</div>
                <div class="rating">★★★★★</div>
              </div>
            </div>
          </body>
        </html>
      `;

      const dom = new JSDOM(consistentHTML);
      const results = [];

      // Run analysis multiple times
      for (let i = 0; i < 5; i++) {
        const context = {
          document: dom.window.document,
          url: 'https://teststore.com',
          pageData: {}
        };
        const result = await analyzer.analyze(context);
        results.push(result);
      }

      // Verify consistency
      const firstResult = results[0];
      results.forEach(result => {
        expect(result.type).toBe(firstResult.type);
        expect(result.optimization.overall).toBe(firstResult.optimization.overall);
        expect(result.conversion.callToAction.count).toBe(firstResult.conversion.callToAction.count);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle empty DOM gracefully', async () => {
      const emptyHTML = '';
      const dom = new JSDOM(emptyHTML);
      
      const context = {
        document: dom.window.document,
        url: 'https://empty.com',
        pageData: {}
      };
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.type).toBe('non-ecommerce');
      expect(result.data.message).toBe('No e-commerce indicators detected');
    });

    test('should handle missing sub-analyzer dependencies', async () => {
      // Temporarily remove a sub-analyzer
      const originalAnalyzer = analyzer.analyzers.reviews;
      delete analyzer.analyzers.reviews;
      
      const simpleHTML = '<div class="add-to-cart">Add to Cart</div>';
      const dom = new JSDOM(simpleHTML);
      
      // Should handle gracefully without throwing
      const context = {
        document: dom.window.document,
        url: 'https://store.com',
        pageData: {}
      };
      const result = await analyzer.analyze(context);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      
      // Restore the analyzer
      analyzer.analyzers.reviews = originalAnalyzer;
    });

    test('should handle network-like errors in sub-analyzers', async () => {
      // Mock an error in a sub-analyzer
      const originalMethod = analyzer.analyzers.productSchema.analyze;
      analyzer.analyzers.productSchema.analyze = jest.fn().mockImplementation(() => {
        throw new Error('Network timeout');
      });

      const testHTML = '<div class="add-to-cart">Add to Cart</div>';
      const dom = new JSDOM(testHTML);
      
      const context = {
        document: dom.window.document,
        url: 'https://store.com',
        pageData: {}
      };
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('E-commerce analysis failed');
      
      // Restore the original method
      analyzer.analyzers.productSchema.analyze = originalMethod;
    });
  });

  describe('Real-World Scenarios', () => {
    test('should analyze mobile-optimized e-commerce site', async () => {
      const mobileHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Mobile Store</title>
          </head>
          <body>
            <div class="mobile-optimized">
              <div class="product-mobile">
                <h1>Mobile Product</h1>
                <div class="price-mobile">$39.99</div>
                <button class="add-to-cart mobile-button">Add to Cart</button>
                <button class="buy-now mobile-button">Buy Now</button>
              </div>
              
              <div class="mobile-cart">
                <div class="cart-icon">🛒 2</div>
              </div>
              
              <div class="mobile-checkout">
                <div class="payment-mobile">
                  <div>Apple Pay</div>
                  <div>Google Pay</div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const dom = new JSDOM(mobileHTML);
      const context = {
        document: dom.window.document,
        url: 'https://mobilestore.com',
        pageData: {}
      };
      const result = await analyzer.analyze(context);

      expect(result.success).toBe(true);
      expect(result.data.type).toBe('custom');
      expect(result.data.checkout.checkout.userExperience.mobileOptimized).toBe(true);
      expect(result.data.security.paymentMethods.digitalWallets.length).toBeGreaterThan(0);
    });

    test('should analyze subscription-based e-commerce', async () => {
      const subscriptionHTML = `
        <!DOCTYPE html>
        <html>
          <body>
            <div class="subscription-product">
              <h1>Monthly Coffee Subscription</h1>
              <div class="pricing">
                <div class="plan">
                  <span class="price">$19.99/month</span>
                  <button class="subscribe-now">Subscribe Now</button>
                </div>
              </div>
              
              <div class="subscription-features">
                <div>Cancel anytime</div>
                <div>Free shipping included</div>
                <div>Pause subscription option</div>
              </div>
              
              <div class="reviews">
                <div class="review">Love my monthly coffee delivery!</div>
                <div class="rating">★★★★★</div>
              </div>
            </div>
          </body>
        </html>
      `;

      const dom = new JSDOM(subscriptionHTML);
      const context = {
        document: dom.window.document,
        url: 'https://coffeesubscription.com',
        pageData: {}
      };
      const result = await analyzer.analyze(context);

      expect(result.success).toBe(true);

      expect(result.type).toBe('custom');
      expect(result.conversion.callToAction.count).toBeGreaterThan(0);
      expect(result.reviews.hasReviews).toBe(true);
    });
  });
});

describe('E-commerce Constants Integration', () => {
  test('should use e-commerce standards for validation', () => {
    expect(ECOMMERCE_STANDARDS.PLATFORMS).toBeDefined();
    expect(ECOMMERCE_STANDARDS.PRODUCT_SCHEMA).toBeDefined();
    expect(ECOMMERCE_STANDARDS.PAYMENT_METHODS).toBeDefined();
    expect(ECOMMERCE_STANDARDS.SECURITY).toBeDefined();
  });

  test('should provide consistent scoring benchmarks', () => {
    expect(ECOMMERCE_STANDARDS.BENCHMARKS.excellent).toBe(90);
    expect(ECOMMERCE_STANDARDS.BENCHMARKS.good).toBe(80);
    expect(ECOMMERCE_STANDARDS.BENCHMARKS.fair).toBe(70);
    expect(ECOMMERCE_STANDARDS.BENCHMARKS.poor).toBe(60);
    expect(ECOMMERCE_STANDARDS.BENCHMARKS.critical).toBe(50);
  });
});
