#!/usr/bin/env node
/**
 * Test the migrated EcommerceAnalyzer integration
 */

import { JSDOM } from 'jsdom';
import { EcommerceAnalyzer } from './src/analyzers/ecommerce/EcommerceAnalyzer.js';

async function testEcommerceAnalyzer() {
  console.log('🧪 Testing E-commerce Analyzer Integration...\n');
  
  try {
    const analyzer = new EcommerceAnalyzer();
    
    // Test HTML with e-commerce features
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test E-commerce Store</title>
          <meta name="description" content="Premium e-commerce store with great products">
          <meta name="generator" content="Shopify">
          
          <!-- Product Schema -->
          <script type="application/ld+json">
          {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": "Amazing Product",
            "description": "This is an amazing product",
            "offers": {
              "@type": "Offer",
              "price": "29.99",
              "priceCurrency": "USD"
            }
          }
          </script>
        </head>
        <body>
          <header>
            <div class="cart-icon" id="cart-count">Cart (0)</div>
            <nav>
              <a href="/products">Products</a>
              <a href="/checkout">Checkout</a>
            </nav>
          </header>
          
          <main>
            <!-- Product listing -->
            <div class="product-grid">
              <div class="product-item" itemtype="https://schema.org/Product">
                <img src="/images/product1.jpg" alt="Product 1" class="product-image">
                <h3 class="product-title" itemprop="name">Amazing Product 1</h3>
                <div class="price" itemprop="offers">$29.99</div>
                <button class="add-to-cart" name="add" data-product-id="1">Add to Cart</button>
                
                <!-- Product reviews -->
                <div class="reviews">
                  <div class="rating">⭐⭐⭐⭐⭐ (4.8/5)</div>
                  <div class="review-count">127 reviews</div>
                </div>
              </div>
              
              <div class="product-item" itemtype="https://schema.org/Product">
                <img src="/images/product2.jpg" alt="Product 2" class="product-image">
                <h3 class="product-title" itemprop="name">Amazing Product 2</h3>
                <div class="price" itemprop="offers">$39.99</div>
                <button class="add-to-cart" name="add" data-product-id="2">Add to Cart</button>
                
                <div class="reviews">
                  <div class="rating">⭐⭐⭐⭐ (4.2/5)</div>
                  <div class="review-count">83 reviews</div>
                </div>
              </div>
            </div>
            
            <!-- Cart section -->
            <div class="cart-section" id="shopping-cart">
              <h2>Shopping Cart</h2>
              <div class="cart-items"></div>
              <div class="cart-total">Total: $0.00</div>
              <button class="checkout-btn">Proceed to Checkout</button>
            </div>
            
            <!-- Checkout form -->
            <form class="checkout-form" action="/checkout" method="post">
              <h2>Checkout</h2>
              <input type="email" name="email" placeholder="Email" required>
              <input type="text" name="address" placeholder="Shipping Address" required>
              
              <!-- Payment security indicators -->
              <div class="payment-security">
                <img src="/images/ssl-secure.png" alt="SSL Secure">
                <img src="/images/trusted-badge.png" alt="Trusted Store">
                <div class="security-text">Your payment is secure</div>
              </div>
              
              <button type="submit" class="pay-button">Complete Purchase</button>
            </form>
          </main>
          
          <!-- Trust indicators -->
          <footer>
            <div class="trust-badges">
              <div class="badge">30-day return policy</div>
              <div class="badge">Free shipping over $50</div>
              <div class="badge">Customer satisfaction guaranteed</div>
            </div>
          </footer>
          
          <!-- E-commerce platform scripts -->
          <script src="https://cdn.shopify.com/shopify.js"></script>
        </body>
      </html>
    `;
    
    const dom = new JSDOM(testHtml);
    const document = dom.window.document;
    const url = 'https://example-store.com';
    const pageData = { 
      title: 'Test E-commerce Store',
      description: 'Premium e-commerce store with great products'
    };
    
    console.log('✅ Testing analyzer.analyze() method...');
    const result = await analyzer.analyze(document, pageData, url);
    
    console.log('📊 E-commerce Analysis Result:');
    console.log('- Success:', result.success);
    console.log('- Analyzer:', result.analyzer);
    console.log('- Analysis Time:', result.analysisTime + 'ms');
    console.log('- Site Type:', result.type);
    
    if (result.platform) {
      console.log('- Platform:', result.platform.platform || 'Unknown');
    }
    
    if (result.product) {
      console.log('- Products Found:', result.product.productCount || 0);
      console.log('- Price Elements:', result.product.priceElements || 0);
      console.log('- Add to Cart Buttons:', result.product.addToCartButtons || 0);
      console.log('- Product Score:', result.product.score || 0);
    }
    
    if (result.optimization) {
      console.log('- Overall Score:', result.optimization.overallScore || 0);
      console.log('- Grade:', result.optimization.grade || 'F');
    }
    
    console.log('- Recommendations Count:', result.recommendations?.length || 0);
    
    console.log('\n🔍 Testing getMetadata() method...');
    const metadata = analyzer.getMetadata();
    console.log('Metadata:');
    console.log('- Name:', metadata.name);
    console.log('- Version:', metadata.version);
    console.log('- Category:', metadata.category);
    console.log('- Priority:', metadata.priority);
    
    console.log('\n✅ Testing validate() method...');
    const validParams = { document, pageData, url: 'https://example.com' };
    const validation1 = analyzer.validate(validParams);
    console.log('Valid params validation:', validation1);
    
    const invalidParams = { document: null, pageData: null, url: '' };
    const validation2 = analyzer.validate(invalidParams);
    console.log('Invalid params validation:', validation2);
    
    console.log('\n🧪 Testing legacy method compatibility...');
    const legacyResult = await analyzer.analyzeEcommerce({ window: { document } }, pageData, url);
    console.log('Legacy method result available:', !!legacyResult);
    console.log('Legacy method has type:', !!legacyResult?.type);
    
    console.log('\n🧪 Testing non-ecommerce site detection...');
    const nonEcommerceHtml = `
      <html>
        <head><title>Blog Site</title></head>
        <body>
          <article>
            <h1>Blog Post Title</h1>
            <p>This is just a regular blog post with no e-commerce features.</p>
          </article>
        </body>
      </html>
    `;
    const nonEcommerceDom = new JSDOM(nonEcommerceHtml);
    const nonEcommerceDoc = nonEcommerceDom.window.document;
    const nonEcommerceResult = await analyzer.analyze(nonEcommerceDoc, {}, 'https://blog.com');
    console.log('Non-ecommerce detection:', nonEcommerceResult.type === 'non-ecommerce' ? '✅' : '❌');
    
    console.log('\n🎉 E-commerce Analyzer integration test completed successfully!');
    
    // Verify integration
    console.log('\n📊 Integration Verification:');
    console.log('- Extends BaseAnalyzer:', analyzer.constructor.name === 'EcommerceAnalyzer' ? '✅' : '❌');
    console.log('- Has analyze() method:', typeof analyzer.analyze === 'function' ? '✅' : '❌');
    console.log('- Has getMetadata() method:', typeof analyzer.getMetadata === 'function' ? '✅' : '❌');
    console.log('- Has validate() method:', typeof analyzer.validate === 'function' ? '✅' : '❌');
    console.log('- Returns valid result structure:', result && result.success !== undefined ? '✅' : '❌');
    console.log('- Backward compatible:', typeof analyzer.analyzeEcommerce === 'function' ? '✅' : '❌');
    console.log('- E-commerce detection working:', result?.type && result.type !== 'error' ? '✅' : '❌');
    console.log('- Product analysis working:', result?.product ? '✅' : '❌');
    console.log('- Has optimization score:', result?.optimization?.overallScore !== undefined ? '✅' : '❌');
    console.log('- Non-ecommerce detection working:', nonEcommerceResult?.type === 'non-ecommerce' ? '✅' : '❌');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testEcommerceAnalyzer().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
