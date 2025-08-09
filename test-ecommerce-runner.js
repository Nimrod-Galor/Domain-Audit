/**
 * ============================================================================
 * E-COMMERCE ANALYZER TEST RUNNER
 * ============================================================================
 *
 * Comprehensive test runner for validating E-commerce Analysis Module
 * Tests real-world e-commerce scenarios and validates implementation
 *
 * @author Nimrod Galor
 * @version 1.0.0
 */

import { EcommerceAnalyzer } from './src/analyzers/ecommerce/ecommerce-analyzer.js';
import { ECOMMERCE_STANDARDS } from './src/analyzers/ecommerce/utils/ecommerce-constants.js';
import { DOMProcessor } from './src/dom/dom-processor.js';

console.log('🛒 E-COMMERCE ANALYZER TEST RUNNER');
console.log('=====================================\n');

/**
 * Test real e-commerce HTML scenarios
 */
async function runEcommerceTests() {
  const analyzer = new EcommerceAnalyzer();
  const domProcessor = new DOMProcessor();
  
  console.log('🔄 Initializing E-commerce Analyzer...');
  console.log(`✅ Analyzer initialized with all sub-modules:`);
  console.log(`   • Product Schema Analyzer: ${analyzer.analyzers.productSchema ? '✅' : '❌'}`);
  console.log(`   • Cart Analyzer: ${analyzer.analyzers.cart ? '✅' : '❌'}`);
  console.log(`   • Checkout Analyzer: ${analyzer.analyzers.checkout ? '✅' : '❌'}`);
  console.log(`   • Payment Analyzer: ${analyzer.analyzers.payment ? '✅' : '❌'}`);
  console.log(`   • Review Analyzer: ${analyzer.analyzers.reviews ? '✅' : '❌'}\n`);

  // Test 1: Shopify Store Analysis
  console.log('📋 TEST 1: Shopify Store Analysis');
  console.log('─'.repeat(40));
  
  const shopifyHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Premium Headphones | AudioTech Store</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Premium Wireless Headphones",
          "description": "High-quality wireless headphones with active noise cancellation",
          "brand": { "@type": "Brand", "name": "AudioTech" },
          "offers": {
            "@type": "Offer",
            "price": "199.99",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "seller": { "@type": "Organization", "name": "AudioTech Store" }
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.6",
            "reviewCount": "247"
          },
          "review": [
            {
              "@type": "Review",
              "author": { "@type": "Person", "name": "John Smith" },
              "reviewRating": { "@type": "Rating", "ratingValue": "5" },
              "reviewBody": "Excellent sound quality and comfort!"
            }
          ]
        }
        </script>
      </head>
      <body>
        <div class="shopify-section product-section">
          <div class="container">
            <div class="product-images">
              <img src="headphones-main.jpg" alt="Premium Wireless Headphones" width="600">
              <img src="headphones-side.jpg" alt="Headphones Side View" width="600">
              <img src="headphones-case.jpg" alt="Headphones with Case" width="600">
            </div>
            
            <div class="product-details">
              <h1>Premium Wireless Headphones</h1>
              <div class="price">$199.99</div>
              <div class="stock-status">✅ In Stock - Ships within 24 hours</div>
              
              <div class="product-description">
                Experience premium sound quality with our latest wireless headphones. 
                Features include 30-hour battery life, active noise cancellation, 
                premium comfort padding, and crystal-clear microphone. Perfect for 
                music lovers, gamers, and professionals who demand the best audio experience.
              </div>
              
              <form class="product-form" action="/cart/add" method="post">
                <div class="product-options">
                  <label for="color">Color:</label>
                  <select name="color" id="color">
                    <option value="black">Matte Black</option>
                    <option value="white">Pearl White</option>
                    <option value="blue">Ocean Blue</option>
                  </select>
                </div>
                
                <div class="quantity-selector">
                  <label for="quantity">Quantity:</label>
                  <input type="number" name="quantity" id="quantity" value="1" min="1" max="10">
                  <button type="button" class="qty-minus">-</button>
                  <button type="button" class="qty-plus">+</button>
                </div>
                
                <div class="product-actions">
                  <button type="submit" class="shopify-payment-button add-to-cart">
                    🛒 Add to Cart
                  </button>
                  <button type="button" class="buy-now">⚡ Buy it now</button>
                  <button type="button" class="wishlist">💖 Add to Wishlist</button>
                </div>
              </form>
              
              <div class="trust-signals">
                <div class="trust-item">🚚 Free shipping on orders over $150</div>
                <div class="trust-item">↩️ 30-day hassle-free returns</div>
                <div class="trust-item">🔒 Secure checkout with SSL encryption</div>
                <div class="trust-item">🛡️ 2-year manufacturer warranty</div>
                <div class="trust-item">📞 24/7 customer support</div>
              </div>
            </div>
          </div>
          
          <div class="reviews-section">
            <h2>Customer Reviews</h2>
            <div class="rating-summary">
              <div class="average-rating">
                <span class="rating-value">4.6</span>
                <div class="stars">★★★★★</div>
                <span class="review-count">247 reviews</span>
              </div>
              
              <div class="rating-breakdown">
                <div class="rating-bar">
                  <span>5 stars</span>
                  <div class="bar"><div class="fill" style="width: 68%"></div></div>
                  <span>168</span>
                </div>
                <div class="rating-bar">
                  <span>4 stars</span>
                  <div class="bar"><div class="fill" style="width: 22%"></div></div>
                  <span>54</span>
                </div>
                <div class="rating-bar">
                  <span>3 stars</span>
                  <div class="bar"><div class="fill" style="width: 7%"></div></div>
                  <span>17</span>
                </div>
                <div class="rating-bar">
                  <span>2 stars</span>
                  <div class="bar"><div class="fill" style="width: 2%"></div></div>
                  <span>5</span>
                </div>
                <div class="rating-bar">
                  <span>1 star</span>
                  <div class="bar"><div class="fill" style="width: 1%"></div></div>
                  <span>3</span>
                </div>
              </div>
            </div>
            
            <div class="reviews-list">
              <div class="review">
                <div class="review-header">
                  <div class="rating">★★★★★</div>
                  <span class="reviewer">John Smith</span>
                  <span class="verified">✓ Verified Purchase</span>
                  <span class="review-date">March 15, 2024</span>
                </div>
                <p class="review-text">
                  Excellent sound quality and comfort! I use these for 8+ hours daily 
                  for work and music. The noise cancellation is incredible and battery 
                  life exceeds expectations. Highly recommended!
                </p>
                <div class="review-actions">
                  <button class="helpful">👍 Helpful (23)</button>
                  <button class="report">Report</button>
                </div>
              </div>
              
              <div class="review">
                <div class="review-header">
                  <div class="rating">★★★★☆</div>
                  <span class="reviewer">Sarah Johnson</span>
                  <span class="verified">✓ Verified Purchase</span>
                  <span class="review-date">March 10, 2024</span>
                </div>
                <p class="review-text">
                  Great headphones overall. Sound quality is fantastic and they're 
                  very comfortable. Only minor complaint is the touch controls can 
                  be a bit sensitive sometimes.
                </p>
                <div class="review-actions">
                  <button class="helpful">👍 Helpful (15)</button>
                  <button class="report">Report</button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="shopping-cart mini-cart">
            <div class="cart-header">
              <span class="cart-icon">🛒</span>
              <span class="cart-count">0 items</span>
            </div>
            <div class="cart-contents">
              <div class="empty-cart">Your cart is empty</div>
            </div>
            <div class="cart-actions">
              <div class="cart-subtotal">Subtotal: $0.00</div>
              <button class="checkout-btn" disabled>🔒 Secure Checkout</button>
            </div>
          </div>
          
          <div class="checkout-security">
            <h3>Secure Checkout</h3>
            <div class="payment-methods">
              <img src="visa.png" alt="Visa" class="payment-logo">
              <img src="mastercard.png" alt="Mastercard" class="payment-logo">
              <img src="amex.png" alt="American Express" class="payment-logo">
              <img src="paypal.png" alt="PayPal" class="payment-logo">
              <img src="apple-pay.png" alt="Apple Pay" class="payment-logo">
              <img src="google-pay.png" alt="Google Pay" class="payment-logo">
              <img src="klarna.png" alt="Klarna" class="payment-logo">
            </div>
            
            <div class="security-badges">
              <img src="ssl-badge.png" alt="SSL Secured" class="security-badge">
              <img src="norton-badge.png" alt="Norton Secured" class="security-badge">
              <img src="mcafee-badge.png" alt="McAfee Secure" class="security-badge">
              <img src="trustpilot-badge.png" alt="Trustpilot" class="security-badge">
            </div>
            
            <div class="security-text">
              <p>🔒 Your payment information is processed securely with 256-bit SSL encryption</p>
              <p>💳 We accept all major credit cards and digital wallets</p>
              <p>🛡️ Your data is protected by industry-leading security measures</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const shopifyDom = await domProcessor.createDOM(shopifyHTML, 'https://audiotech.myshopify.com/products/premium-headphones');
  const shopifyResult = await analyzer.analyze({ document: shopifyDom.window.document, url: 'https://audiotech.myshopify.com/products/premium-headphones'
  , pageData: { title: 'Premium Headphones | AudioTech Store' } });

  console.log(`✅ Platform detected: ${shopifyResult.type}`);
  console.log(`📊 Overall Score: ${shopifyResult.optimization?.overall || 0}/100 (${shopifyResult.optimization?.grade || 'N/A'})`);
  console.log(`⏱️  Analysis time: ${shopifyResult.analysisTime}ms`);
  
  if (shopifyResult.product) {
    console.log(`🏷️  Product Schema: ${shopifyResult.product.schemas?.length || 0} schemas found`);
    console.log(`📝 Product Page: ${Object.values(shopifyResult.product.productPage || {}).filter(Boolean).length}/9 features`);
  }
  
  if (shopifyResult.reviews) {
    console.log(`⭐ Reviews: ${shopifyResult.reviews.hasReviews ? '✅' : '❌'} (${shopifyResult.reviews.reviewCount || 0} elements)`);
    console.log(`📈 Review Score: ${shopifyResult.reviews.score || 0}/100`);
  }
  
  if (shopifyResult.security) {
    console.log(`🔒 Security Score: ${shopifyResult.security.score || 0}/100`);
    console.log(`💳 Payment Methods: ${shopifyResult.security.paymentMethods?.supportedMethods?.length || 0} detected`);
  }
  
  if (shopifyResult.conversion) {
    console.log(`🎯 CTA Elements: ${shopifyResult.conversion.callToAction?.count || 0} found`);
    console.log(`🖼️  Product Images: ${shopifyResult.conversion.productPhotos?.count || 0} found`);
    console.log(`🤝 Trust Signals: ${shopifyResult.conversion.trustSignals?.count || 0} found`);
  }
  
  console.log(`💡 Recommendations: ${shopifyResult.recommendations?.length || 0} suggestions\n`);

  // Test 2: WooCommerce Store Analysis
  console.log('📋 TEST 2: WooCommerce Store Analysis');
  console.log('─'.repeat(40));
  
  const woocommerceHTML = `
    <!DOCTYPE html>
    <html class="woocommerce-page">
      <head>
        <title>Gaming Laptop | TechZone Store</title>
      </head>
      <body class="woocommerce single-product">
        <div class="woocommerce-wrapper">
          <div class="product woocommerce-product">
            <h1 class="product-title">High-Performance Gaming Laptop</h1>
            
            <div class="product-gallery">
              <img src="laptop-main.jpg" alt="Gaming Laptop Main View">
              <img src="laptop-keyboard.jpg" alt="Gaming Laptop Keyboard">
            </div>
            
            <div class="product-summary">
              <p class="price">
                <del class="original-price">$1,499.99</del>
                <ins class="sale-price">$1,299.99</ins>
              </p>
              
              <div class="stock-info in-stock">
                <span class="availability">In stock</span>
                <span class="stock-quantity">23 available</span>
              </div>
              
              <div class="product-description">
                Ultimate gaming performance with Intel i7 processor, RTX 4060 graphics, 
                16GB RAM, and 1TB SSD. Perfect for gaming, streaming, and content creation.
              </div>
              
              <form class="cart woocommerce-cart-form">
                <div class="quantity-input">
                  <label for="quantity">Quantity</label>
                  <input type="number" id="quantity" name="quantity" value="1" min="1">
                </div>
                
                <button type="submit" class="single_add_to_cart_button button">
                  Add to cart
                </button>
              </form>
              
              <div class="product-meta">
                <span class="sku">SKU: GL-2024-001</span>
                <span class="categories">Categories: Laptops, Gaming</span>
                <span class="tags">Tags: gaming, laptop, intel, nvidia</span>
              </div>
            </div>
            
            <div class="woocommerce-tabs">
              <div class="tab-content description">
                <h2>Description</h2>
                <p>Detailed product description with specifications and features...</p>
              </div>
              
              <div class="tab-content reviews">
                <div class="woocommerce-reviews">
                  <h2>Reviews (45)</h2>
                  <div class="average-rating">4.8 stars</div>
                  
                  <div class="comment">
                    <div class="star-rating">★★★★★</div>
                    <p>Amazing gaming laptop! Runs everything smoothly.</p>
                    <footer>Review by Mike Johnson</footer>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="cart-contents">
            <h2>Shopping Cart</h2>
            <div class="cart-empty">Your cart is currently empty.</div>
            <div class="cart-totals">
              <div class="cart-subtotal">Subtotal: $0.00</div>
              <div class="shipping">Shipping: Free</div>
              <div class="order-total">Total: $0.00</div>
            </div>
            
            <div class="checkout-actions">
              <a href="/checkout" class="checkout-button wc-proceed-to-checkout">
                Proceed to checkout
              </a>
            </div>
          </div>
          
          <div class="payment-security">
            <div class="accepted-payments">
              <h3>We Accept</h3>
              <div class="payment-icons">
                <span class="payment-method">Visa</span>
                <span class="payment-method">Mastercard</span>
                <span class="payment-method">PayPal</span>
                <span class="payment-method">Stripe</span>
              </div>
            </div>
            
            <div class="security-info">
              <p>🔒 SSL Encrypted Checkout</p>
              <p>✅ PCI DSS Compliant</p>
              <p>💰 Money-back guarantee</p>
              <p>🚚 Free shipping on orders over $100</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const woocommerceDom = await domProcessor.createDOM(woocommerceHTML, 'https://techzone.com/product/gaming-laptop');
  const woocommerceResult = await analyzer.analyze({ document: woocommerceDom.window.document, url: 'https://techzone.com/product/gaming-laptop'
  , pageData: { title: 'Gaming Laptop | TechZone Store' } });

  console.log(`✅ Platform detected: ${woocommerceResult.type}`);
  console.log(`📊 Overall Score: ${woocommerceResult.optimization?.overall || 0}/100 (${woocommerceResult.optimization?.grade || 'N/A'})`);
  console.log(`⏱️  Analysis time: ${woocommerceResult.analysisTime}ms`);
  console.log(`🛒 Cart Analysis: ${woocommerceResult.checkout?.cart?.hasCart ? '✅' : '❌'}`);
  console.log(`🔄 Checkout Process: ${woocommerceResult.checkout?.checkout?.hasCheckout ? '✅' : '❌'}`);
  console.log(`💳 Payment Methods: ${woocommerceResult.security?.paymentMethods?.supportedMethods?.length || 0} detected\n`);

  // Test 3: Non-E-commerce Site Analysis
  console.log('📋 TEST 3: Non-E-commerce Site Analysis');
  console.log('─'.repeat(40));
  
  const blogHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>My Tech Blog | Latest Technology News</title>
      </head>
      <body>
        <div class="blog-site">
          <header>
            <h1>Tech Blog</h1>
            <nav>
              <a href="/">Home</a>
              <a href="/articles">Articles</a>
              <a href="/about">About</a>
              <a href="/contact">Contact</a>
            </nav>
          </header>
          
          <main>
            <article class="blog-post">
              <h2>The Future of AI Technology</h2>
              <p>This is a blog post about artificial intelligence...</p>
              <div class="author">By John Doe</div>
              <div class="date">March 20, 2024</div>
            </article>
            
            <aside class="sidebar">
              <div class="newsletter-signup">
                <h3>Subscribe to Newsletter</h3>
                <form>
                  <input type="email" placeholder="Your email">
                  <button type="submit">Subscribe</button>
                </form>
              </div>
            </aside>
          </main>
        </div>
      </body>
    </html>
  `;

  const blogDom = await domProcessor.createDOM(blogHTML, 'https://techblog.com/ai-future');
  const blogResult = await analyzer.analyze({ document: blogDom.window.document, url: 'https://techblog.com/ai-future'
  , pageData: { title: 'My Tech Blog | Latest Technology News' } });

  console.log(`✅ Platform detected: ${blogResult.type}`);
  console.log(`📝 Message: ${blogResult.message}`);
  console.log(`⏱️  Analysis time: ${blogResult.analysisTime}ms\n`);

  // Test 4: Performance Test with Complex E-commerce Site
  console.log('📋 TEST 4: Performance Test - Complex E-commerce Site');
  console.log('─'.repeat(40));
  
  const complexHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Mega Electronics Store</title>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "4K Smart TV",
          "brand": "TechBrand",
          "offers": { "@type": "Offer", "price": "899.99", "priceCurrency": "USD" }
        }
        </script>
      </head>
      <body>
        <div class="mega-store">
          ${Array.from({ length: 20 }, (_, i) => `
            <div class="product-section">
              <h2>Product Category ${i + 1}</h2>
              ${Array.from({ length: 10 }, (_, j) => `
                <div class="product-item">
                  <h3>Product ${i}-${j}</h3>
                  <span class="price">$${(i + j + 1) * 25}</span>
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
          
          <div class="payment-options">
            <div>Visa</div>
            <div>Mastercard</div>
            <div>PayPal</div>
            <div>Apple Pay</div>
            <div>Google Pay</div>
          </div>
        </div>
      </body>
    </html>
  `;

  const startTime = Date.now();
  const complexDom = await domProcessor.createDOM(complexHTML, 'https://megaelectronics.com');
  const complexResult = await analyzer.analyze({ document: complexDom.window.document, url: 'https://megaelectronics.com'
  , pageData: { title: 'Mega Electronics Store' } });
  const endTime = Date.now();

  console.log(`✅ Platform detected: ${complexResult.type}`);
  console.log(`📊 Overall Score: ${complexResult.optimization?.overall || 0}/100`);
  console.log(`⏱️  Analysis time: ${complexResult.analysisTime}ms`);
  console.log(`🔄 Total execution time: ${endTime - startTime}ms`);
  console.log(`🎯 CTA Elements: ${complexResult.conversion?.callToAction?.count || 0} found`);
  console.log(`💳 Payment Methods: ${complexResult.security?.paymentMethods?.supportedMethods?.length || 0} detected\n`);

  // Test 5: Constants and Standards Validation
  console.log('📋 TEST 5: Constants and Standards Validation');
  console.log('─'.repeat(40));
  
  console.log(`✅ E-commerce Standards loaded: ${Object.keys(ECOMMERCE_STANDARDS).length} categories`);
  console.log(`📝 Platform patterns: ${Object.keys(ECOMMERCE_STANDARDS.PLATFORMS).length} platforms`);
  console.log(`🏷️  Product schema fields: ${ECOMMERCE_STANDARDS.PRODUCT_SCHEMA.required.length} required, ${ECOMMERCE_STANDARDS.PRODUCT_SCHEMA.recommended.length} recommended`);
  console.log(`💳 Payment methods: ${Object.keys(ECOMMERCE_STANDARDS.PAYMENT_METHODS).length} categories`);
  console.log(`🔒 Security standards: ${ECOMMERCE_STANDARDS.SECURITY.required.length} required, ${ECOMMERCE_STANDARDS.SECURITY.recommended.length} recommended`);
  console.log(`📊 Scoring benchmarks: Excellent (${ECOMMERCE_STANDARDS.BENCHMARKS.excellent}), Good (${ECOMMERCE_STANDARDS.BENCHMARKS.good}), Fair (${ECOMMERCE_STANDARDS.BENCHMARKS.fair})\n`);

  return {
    shopify: shopifyResult,
    woocommerce: woocommerceResult,
    nonEcommerce: blogResult,
    performance: complexResult,
    executionTime: endTime - startTime
  };
}

/**
 * Generate test summary
 */
function generateTestSummary(results) {
  console.log('📋 TEST SUMMARY');
  console.log('═'.repeat(40));
  
  const tests = [
    { name: 'Shopify Store', result: results.shopify, expectedType: 'shopify' },
    { name: 'WooCommerce Store', result: results.woocommerce, expectedType: 'woocommerce' },
    { name: 'Non-E-commerce Site', result: results.nonEcommerce, expectedType: 'non-ecommerce' },
    { name: 'Performance Test', result: results.performance, expectedType: 'custom' }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  tests.forEach(test => {
    const passed = test.result.data.type === test.expectedType;
    const score = test.result.data.optimization?.overall || 0;
    const analysisTime = test.result.data.metadata.analysisTime || 0;
    
    console.log(`${passed ? '✅' : '❌'} ${test.name}:`);
    console.log(`   Expected: ${test.expectedType}, Got: ${test.result.data.type}`);
    console.log(`   Score: ${score}/100, Time: ${analysisTime}ms`);
    
    if (passed) passedTests++;
  });
  
  console.log(`\n📊 Results: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log(`⏱️  Total execution time: ${results.executionTime}ms`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! E-commerce Analysis Module is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please review the implementation.');
  }
  
  return {
    passed: passedTests,
    total: totalTests,
    success: passedTests === totalTests,
    executionTime: results.executionTime
  };
}

/**
 * Main execution
 */
async function main() {
  try {
    const startTime = Date.now();
    
    const results = await runEcommerceTests();
    const summary = generateTestSummary(results);
    
    const totalTime = Date.now() - startTime;
    
    console.log(`\n🏁 E-commerce Analysis Module Test Complete`);
    console.log(`   Success Rate: ${Math.round((summary.passed/summary.total)*100)}%`);
    console.log(`   Total Time: ${totalTime}ms`);
    console.log(`   Status: ${summary.success ? '🟢 READY FOR PRODUCTION' : '🔴 NEEDS REVIEW'}`);
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Execute tests
main();
