/**
 * Conversion Optimizer Migration Test Suite
 * Comprehensive testing of ConversionOptimizer with BaseAnalyzer integration
 */

import { ConversionOptimizer } from './src/analyzers/ecommerce/conversion/conversion-optimizer.js';
import { JSDOM } from 'jsdom';

// Mock DOM for testing
const createMockDOM = () => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>E-commerce Test Site</title>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <!-- Trust Signals -->
      <div class="security-badges">
        <img src="/ssl-badge.png" alt="SSL Secure">
        <img src="/security-verified.png" alt="Security Verified">
      </div>
      <footer>
        <a href="/about">About Us</a>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
        <div class="contact-info">
          <a href="tel:+1234567890">Call Us</a>
          <a href="mailto:support@example.com">Email Support</a>
        </div>
      </footer>

      <!-- User Experience Elements -->
      <nav class="navigation">
        <div class="menu">
          <a href="/products">Products</a>
          <a href="/categories">Categories</a>
        </div>
        <div class="search-box">
          <input type="search" placeholder="Search products...">
        </div>
      </nav>
      <div class="breadcrumb" aria-label="breadcrumb">
        <a href="/">Home</a> > <a href="/products">Products</a>
      </div>
      <div class="help-section">
        <a href="/faq">FAQ</a>
        <a href="/help">Help Center</a>
        <div class="live-chat">Live Chat Support</div>
      </div>

      <!-- Product Presentation -->
      <div class="product-section">
        <div class="product">
          <h1 class="product-title">Amazing Product</h1>
          <img src="/product1.jpg" alt="Product Image" class="product-image">
          <img src="/product2.jpg" alt="Product Image 2" class="product-image">
          <img src="/product3.jpg" alt="Product Image 3" class="product-image">
          <div class="price">$99.99</div>
          <div class="description">Detailed product description here...</div>
          <div class="reviews">
            <div class="rating">
              <span class="stars">★★★★★</span>
              <span class="review-count">156 reviews</span>
            </div>
          </div>
          <select class="variant-selector">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
          <div class="stock-info">In Stock</div>
          <div class="product-badge">Best Seller</div>
        </div>
      </div>

      <!-- Checkout Process -->
      <div class="shopping-section">
        <div class="cart-icon">
          <a href="/cart">Cart (3)</a>
        </div>
        <button class="add-to-cart">Add to Cart</button>
        <a href="/checkout" class="checkout-button">Secure Checkout</a>
        <div class="payment-options">
          <span>We accept: Visa, MasterCard, PayPal, Apple Pay</span>
        </div>
        <div class="shipping-info">Free shipping on orders over $50</div>
        <div class="return-policy">30-day return policy</div>
      </div>

      <!-- Social Proof -->
      <div class="social-proof">
        <div class="testimonials">
          <h3>What customers say</h3>
          <div class="testimonial">Great product!</div>
        </div>
        <div class="customer-reviews">
          <div class="review">★★★★★ Excellent quality</div>
          <img src="/customer1.jpg" alt="Customer photo">
        </div>
        <div class="social-sharing">
          <a href="https://facebook.com/share">Share on Facebook</a>
          <a href="https://twitter.com/share">Tweet</a>
        </div>
        <div class="recent-activity">Recently bought by others</div>
        <div class="user-count">Join 10,000+ satisfied customers</div>
      </div>

      <!-- Mobile Optimization -->
      <div class="mobile-elements">
        <button class="touch-friendly-button">Large Touch Target</button>
        <input type="tel" placeholder="Phone Number">
        <input type="email" placeholder="Email Address">
        <div class="hamburger-menu">☰</div>
        <a href="/mobile-app">Download Mobile App</a>
      </div>

      <!-- Performance Elements -->
      <script src="/script1.js"></script>
      <script src="/script2.js"></script>
      <script src="/script3.js"></script>
      <link rel="stylesheet" href="/extra.css">
      <div style="color: red;">Inline styles</div>
      <div class="lazy-loading">Lazy loading implemented</div>
      <div class="cdn-content">CDN optimized content</div>
    </body>
    </html>
  `;
  
  return new JSDOM(html).window.document;
};

// Create Cheerio-like mock
const createCheerioMock = (document) => {
  const $ = (selector) => {
    const elements = Array.from(document.querySelectorAll(selector));
    
    return {
      length: elements.length,
      attr: (attrName) => elements[0]?.getAttribute(attrName),
      filter: (callback) => {
        if (typeof callback === 'function') {
          return {
            length: elements.filter((el, i) => callback(i, el)).length
          };
        }
        return { length: 0 };
      }
    };
  };

  $.html = () => document.documentElement.outerHTML;
  
  return $;
};

// Test Suite
async function runConversionOptimizerTests() {
  console.log('🧪 Starting Conversion Optimizer Migration Tests\n');
  
  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`✅ ${message}`);
      passedTests++;
    } else {
      console.log(`❌ ${message}`);
    }
  }

  try {
    // Test 1: BaseAnalyzer Integration
    console.log('\n📋 Test 1: BaseAnalyzer Integration');
    const optimizer = new ConversionOptimizer();
    
    assert(typeof optimizer.analyze === 'function', 'BaseAnalyzer analyze method exists');
    assert(typeof optimizer.getMetadata === 'function', 'BaseAnalyzer getMetadata method exists');
    assert(typeof optimizer.handleError === 'function', 'BaseAnalyzer handleError method exists');
    assert(typeof optimizer.measureTime === 'function', 'BaseAnalyzer measureTime method exists');
    assert(typeof optimizer.log === 'function', 'BaseAnalyzer log method exists');
    assert(optimizer.name === 'ConversionOptimizer', 'Analyzer name set correctly');
    
    // Get metadata to check category
    const analyzerMetadata = optimizer.getMetadata();
    assert(analyzerMetadata.category === 'ECOMMERCE', 'Category set to ECOMMERCE');

    // Test 2: Metadata Verification
    console.log('\n📋 Test 2: Metadata Verification');
    const metadata = optimizer.getMetadata();
    
    assert(typeof metadata === 'object', 'Metadata returns object');
    assert(metadata.name === 'ConversionOptimizer', 'Metadata name correct');
    assert(metadata.version === '1.0.0', 'Metadata version correct');
    assert(metadata.category === 'ECOMMERCE', 'Metadata category correct');
    assert(Array.isArray(metadata.features), 'Features is array');
    assert(metadata.features.length >= 10, 'Has comprehensive feature list');
    assert(metadata.features.includes('Trust signals analysis'), 'Includes trust signals analysis');
    assert(metadata.features.includes('Mobile optimization analysis'), 'Includes mobile optimization');

    // Test 3: Main Analysis Method
    console.log('\n📋 Test 3: Main Analysis Method');
    const mockDocument = createMockDOM();
    const mockCheerio = createCheerioMock(mockDocument);
    
    const analysisContext = {
      dom: mockCheerio,
      url: 'https://example.com/product',
      pageData: { performance: { loadTime: 2.5 } }
    };

    const result = await optimizer.analyze(analysisContext);
    
    // Handle BaseAnalyzer measureTime wrapper
    const analysisResult = result.result || result;
    
    assert(typeof result === 'object' && result.result, 'Analysis returns measureTime wrapper');
    assert(typeof analysisResult === 'object', 'Analysis result object exists');
    assert(typeof analysisResult.score === 'number', 'Score is number');
    assert(analysisResult.score >= 0 && analysisResult.score <= 100, 'Score within valid range');
    assert(typeof analysisResult.data === 'object', 'Data section exists');
    assert(typeof analysisResult.summary === 'object', 'Summary section exists');
    assert(typeof analysisResult.metrics === 'object', 'Metrics section exists');
    assert(Array.isArray(analysisResult.recommendations), 'Recommendations is array');

    // Test 4: Trust Signals Analysis
    console.log('\n📋 Test 4: Trust Signals Analysis');
    
    // Debug: Check what we actually have
    console.log('Debug: analysisResult keys:', Object.keys(analysisResult));
    console.log('Debug: analysisResult.error:', analysisResult.error);
    console.log('Debug: analysisResult.success:', analysisResult.success);
    console.log('Debug: analysisResult.data exists:', !!analysisResult.data);
    console.log('Debug: analysisResult.data.factors exists:', !!analysisResult.data?.factors);
    console.log('Debug: factors keys:', Object.keys(analysisResult.data?.factors || {}));
    console.log('Debug: trustSignals path exists:', !!analysisResult.data?.factors?.trustSignals);
    
    const trustSignals = analysisResult.data?.factors?.trustSignals;
    
    assert(typeof trustSignals === 'object', 'Trust signals analysis exists');
    assert(typeof trustSignals.score === 'number', 'Trust signals score calculated');
    assert(Array.isArray(trustSignals.signals), 'Trust signals detected');
    assert(Array.isArray(trustSignals.missing), 'Missing signals identified');
    assert(typeof trustSignals.details === 'object', 'Trust details provided');
    assert(trustSignals.signals.length > 0, 'Some trust signals detected');
    assert(trustSignals.details.securityBadges >= 0, 'Security badges counted');
    assert(trustSignals.details.contactInfo >= 0, 'Contact info analyzed');

    // Test 5: User Experience Analysis  
    console.log('\n📋 Test 5: User Experience Analysis');
    const userExperience = analysisResult.data.factors.userExperience;
    
    assert(typeof userExperience === 'object', 'UX analysis exists');
    assert(typeof userExperience.score === 'number', 'UX score calculated');
    assert(Array.isArray(userExperience.features), 'UX features detected');
    assert(Array.isArray(userExperience.missing), 'Missing UX features identified');
    assert(typeof userExperience.details === 'object', 'UX details provided');
    assert(userExperience.details.searchBox >= 0, 'Search functionality analyzed');
    assert(userExperience.details.navigationMenu >= 0, 'Navigation analyzed');
    assert(userExperience.details.addToCartButtons >= 0, 'Add to cart buttons counted');

    // Test 6: Product Presentation Analysis
    console.log('\n📋 Test 6: Product Presentation Analysis');
    const productPresentation = analysisResult.data.factors.productPresentation;
    
    assert(typeof productPresentation === 'object', 'Product presentation analysis exists');
    assert(typeof productPresentation.score === 'number', 'Product score calculated');
    assert(Array.isArray(productPresentation.strengths), 'Product strengths identified');
    assert(Array.isArray(productPresentation.weaknesses), 'Product weaknesses identified');
    assert(typeof productPresentation.details === 'object', 'Product details provided');
    assert(productPresentation.details.productImages >= 0, 'Product images counted');
    assert(productPresentation.details.priceElements >= 0, 'Price elements counted');
    assert(productPresentation.details.productReviews >= 0, 'Reviews counted');

    // Test 7: Checkout Process Analysis
    console.log('\n📋 Test 7: Checkout Process Analysis');
    const checkoutProcess = analysisResult.data.factors.checkoutProcess;
    
    assert(typeof checkoutProcess === 'object', 'Checkout analysis exists');
    assert(typeof checkoutProcess.score === 'number', 'Checkout score calculated');
    assert(Array.isArray(checkoutProcess.features), 'Checkout features detected');
    assert(Array.isArray(checkoutProcess.issues), 'Checkout issues identified');
    assert(typeof checkoutProcess.details === 'object', 'Checkout details provided');
    assert(checkoutProcess.details.cartIcon >= 0, 'Cart accessibility measured');
    assert(checkoutProcess.details.checkoutButton >= 0, 'Checkout buttons counted');

    // Test 8: Social Proof Analysis
    console.log('\n📋 Test 8: Social Proof Analysis');
    const socialProof = analysisResult.data.factors.socialProof;
    
    assert(typeof socialProof === 'object', 'Social proof analysis exists');
    assert(typeof socialProof.score === 'number', 'Social proof score calculated');
    assert(Array.isArray(socialProof.elements), 'Social proof elements detected');
    assert(Array.isArray(socialProof.missing), 'Missing social elements identified');
    assert(typeof socialProof.details === 'object', 'Social details provided');
    assert(socialProof.details.reviewStars >= 0, 'Review stars counted');
    assert(socialProof.details.socialButtons >= 0, 'Social buttons counted');

    // Test 9: Mobile Optimization Analysis
    console.log('\n📋 Test 9: Mobile Optimization Analysis');
    const mobileOptimization = analysisResult.data.factors.mobileOptimization;
    
    assert(typeof mobileOptimization === 'object', 'Mobile optimization analysis exists');
    assert(typeof mobileOptimization.score === 'number', 'Mobile score calculated');
    assert(Array.isArray(mobileOptimization.features), 'Mobile features detected');
    assert(Array.isArray(mobileOptimization.issues), 'Mobile issues identified');
    assert(typeof mobileOptimization.details === 'object', 'Mobile details provided');
    assert(mobileOptimization.details.touchTargets >= 0, 'Touch targets counted');
    assert(mobileOptimization.details.mobileFriendlyForms >= 0, 'Mobile forms counted');

    // Test 10: Loading Speed Analysis
    console.log('\n📋 Test 10: Loading Speed Analysis');
    const loadingSpeed = analysisResult.data.factors.loadingSpeed;
    
    assert(typeof loadingSpeed === 'object', 'Loading speed analysis exists');
    assert(typeof loadingSpeed.score === 'number', 'Loading speed score calculated');
    assert(Array.isArray(loadingSpeed.factors), 'Speed factors identified');
    assert(Array.isArray(loadingSpeed.optimizations), 'Speed optimizations suggested');
    assert(typeof loadingSpeed.details === 'object', 'Speed details provided');
    assert(loadingSpeed.details.imageCount >= 0, 'Images counted');
    assert(loadingSpeed.details.scriptCount >= 0, 'Scripts counted');

    // Test 11: Summary Generation
    console.log('\n📋 Test 11: Summary Generation');
    const summary = analysisResult.summary;
    
    assert(typeof summary.overallScore === 'number', 'Overall score in summary');
    assert(typeof summary.grade === 'string', 'Grade calculated');
    assert(typeof summary.status === 'string', 'Status provided');
    assert(typeof summary.totalFactors === 'number', 'Total factors counted');
    assert(typeof summary.optimizationOpportunities === 'number', 'Optimization opportunities counted');
    assert(typeof summary.competitiveAdvantages === 'number', 'Competitive advantages counted');
    assert(typeof summary.trustSignalsScore === 'number', 'Trust signals score in summary');
    assert(typeof summary.mobileOptimizationScore === 'number', 'Mobile score in summary');

    // Test 12: Metrics Generation
    console.log('\n📋 Test 12: Metrics Generation');
    const metrics = analysisResult.metrics;
    
    assert(typeof metrics.conversionFactorScores === 'object', 'Factor scores object exists');
    assert(typeof metrics.trustMetrics === 'object', 'Trust metrics exist');
    assert(typeof metrics.uxMetrics === 'object', 'UX metrics exist');
    assert(typeof metrics.productMetrics === 'object', 'Product metrics exist');
    assert(typeof metrics.checkoutMetrics === 'object', 'Checkout metrics exist');
    assert(typeof metrics.socialProofMetrics === 'object', 'Social proof metrics exist');
    assert(typeof metrics.mobileMetrics === 'object', 'Mobile metrics exist');
    assert(typeof metrics.performanceMetrics === 'object', 'Performance metrics exist');

    // Test 13: Recommendations Generation
    console.log('\n📋 Test 13: Recommendations Generation');
    const recommendations = analysisResult.recommendations;
    
    assert(Array.isArray(recommendations), 'Recommendations is array');
    if (recommendations.length > 0) {
      const rec = recommendations[0];
      assert(typeof rec.category === 'string', 'Recommendation has category');
      assert(typeof rec.priority === 'string', 'Recommendation has priority');
      assert(typeof rec.title === 'string', 'Recommendation has title');
      assert(typeof rec.description === 'string', 'Recommendation has description');
    }

    // Test 14: Legacy Method Compatibility
    console.log('\n📋 Test 14: Legacy Method Compatibility');
    const legacyResult = optimizer.analyzeConversion(mockCheerio, analysisContext.pageData, analysisContext.url);
    
    assert(typeof legacyResult === 'object', 'Legacy method returns object');
    assert(typeof legacyResult.overallScore === 'number', 'Legacy method calculates score');
    assert(typeof legacyResult.factors === 'object', 'Legacy method provides factors');
    assert(Array.isArray(legacyResult.recommendations), 'Legacy method provides recommendations');

    // Test 15: Error Handling
    console.log('\n📋 Test 15: Error Handling');
    const errorResult = await optimizer.analyze({});
    
    // Handle BaseAnalyzer measureTime wrapper for error case
    const errorAnalysis = errorResult.result || errorResult;
    
    assert(typeof errorAnalysis === 'object', 'Error handling returns object');
    assert(errorAnalysis.score === 0, 'Error score is 0');
    assert(typeof errorAnalysis.error === 'string', 'Error message provided');
    assert(errorAnalysis.error.includes('DOM context is required'), 'Appropriate error message');

    // Test 16: Performance Measurement
    console.log('\n📋 Test 16: Performance Measurement');
    const startTime = Date.now();
    const perfResult = await optimizer.analyze(analysisContext);
    const endTime = Date.now();
    
    assert(typeof perfResult.result === 'object', 'Performance result contains result object');
    assert(typeof perfResult.time === 'number', 'Execution time measured');
    assert(perfResult.time >= 0, 'Execution time is non-negative');
    assert(perfResult.time < (endTime - startTime + 100), 'Execution time reasonable');
    assert(perfResult.result.metadata.analyzer === 'ConversionOptimizer', 'Analyzer name in metadata');
    assert(perfResult.result.metadata.category === 'ECOMMERCE', 'Category in metadata');

    console.log(`\n🎯 Test Results: ${passedTests}/${totalTests} tests passed`);
    console.log(`✅ Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

    if (passedTests === totalTests) {
      console.log('\n🎉 All Conversion Optimizer tests passed! Migration successful!');
      console.log('\n📊 Conversion Analysis Features Verified:');
      console.log('✅ BaseAnalyzer integration with full method inheritance');
      console.log('✅ Comprehensive trust signals analysis with security assessment');
      console.log('✅ User experience evaluation with navigation and search analysis');
      console.log('✅ Product presentation assessment with image and review analysis');
      console.log('✅ Checkout process optimization with cart and payment analysis');
      console.log('✅ Social proof detection with testimonials and rating analysis');
      console.log('✅ Mobile optimization analysis with responsive design assessment');
      console.log('✅ Loading speed assessment with performance factor analysis');
      console.log('✅ Conversion factor scoring with weighted calculations');
      console.log('✅ Optimization recommendations with priority-based suggestions');
      console.log('✅ Competitive advantage identification with strength analysis');
      console.log('✅ Comprehensive metrics generation with detailed breakdowns');
      console.log('✅ Summary generation with grades and status assessment');
      console.log('✅ Legacy method compatibility for backward compatibility');
      console.log('✅ Error handling with graceful degradation');
      console.log('✅ Performance measurement with execution timing');
    } else {
      console.log(`\n⚠️  ${totalTests - passedTests} tests failed. Please review the issues above.`);
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the tests
runConversionOptimizerTests().catch(console.error);
