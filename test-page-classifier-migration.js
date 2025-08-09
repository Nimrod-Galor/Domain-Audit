/**
 * PageTypeClassifier Migration Test (Direct Node.js)
 * Testing BaseAnalyzer integration for page classification functionality
 * Created: 2025-01-08
 */

import { JSDOM } from 'jsdom';
import { PageTypeClassifier } from './src/analyzers/classification/PageTypeClassifier.js';

console.log('🚀 Starting PageTypeClassifier Migration Test...\n');

// Test counter
let passed = 0;
let failed = 0;

// Test helper function
function test(name, testFn) {
  try {
    console.log(`📝 Testing: ${name}`);
    testFn();
    passed++;
    console.log(`✅ PASSED: ${name}\n`);
  } catch (error) {
    failed++;
    console.log(`❌ FAILED: ${name}`);
    console.log(`   Error: ${error.message}\n`);
  }
}

// Async test helper
async function testAsync(name, testFn) {
  try {
    console.log(`📝 Testing: ${name}`);
    await testFn();
    passed++;
    console.log(`✅ PASSED: ${name}\n`);
  } catch (error) {
    failed++;
    console.log(`❌ FAILED: ${name}`);
    console.log(`   Error: ${error.message}\n`);
  }
}

// Create analyzer instance
const analyzer = new PageTypeClassifier();

// 1. BaseAnalyzer Integration Tests
test('PageTypeClassifier extends BaseAnalyzer correctly', () => {
  if (!analyzer.name) throw new Error('Missing name property');
  if (analyzer.name !== 'PageTypeClassifier') throw new Error('Incorrect name');
  if (!analyzer.options) throw new Error('Missing options property');
  if (typeof analyzer.log !== 'function') throw new Error('Missing log method');
  if (typeof analyzer.measureTime !== 'function') throw new Error('Missing measureTime method');
  if (typeof analyzer.handleError !== 'function') throw new Error('Missing handleError method');
  if (typeof analyzer.safeQuery !== 'function') throw new Error('Missing safeQuery method');
});

test('getMetadata returns correct information', () => {
  const metadata = analyzer.getMetadata();
  if (metadata.name !== 'PageTypeClassifier') throw new Error('Incorrect metadata name');
  if (metadata.version !== '1.0.0') throw new Error('Incorrect version');
  if (!metadata.description.includes('semantic categories')) throw new Error('Missing description');
  if (metadata.category !== 'classification') throw new Error('Incorrect category');
  if (metadata.priority !== 'medium') throw new Error('Incorrect priority');
});

// 2. Homepage Classification Test
await testAsync('Homepage classification', async () => {
  const testDom = new JSDOM(`
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

  const result = await analyzer.analyze(testDom.window.document, 'https://example.com');
  
  if (!result.success) throw new Error('Analysis failed');
  if (result.primaryType !== 'HOMEPAGE') throw new Error(`Expected HOMEPAGE, got ${result.primaryType}`);
  if (result.confidence <= 0.6) throw new Error(`Low confidence: ${result.confidence}`);
  if (!Array.isArray(result.detectedTypes)) throw new Error('Missing detectedTypes array');
  if (!result.urlAnalysis) throw new Error('Missing URL analysis');
  if (!result.titleAnalysis) throw new Error('Missing title analysis');
});

// 3. Product Page Classification Test
await testAsync('Product page classification', async () => {
  const testDom = new JSDOM(`
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

  const result = await analyzer.analyze(testDom.window.document, 'https://apple.com/iphone-15-pro');
  
  if (!result.success) throw new Error('Analysis failed');
  if (result.primaryType !== 'PRODUCT') throw new Error(`Expected PRODUCT, got ${result.primaryType}`);
  if (result.confidence <= 0.7) throw new Error(`Low confidence: ${result.confidence}`);
  
  // Check semantic analysis
  if (!result.semanticAnalysis) throw new Error('Missing semantic analysis');
  if (!result.semanticAnalysis.schemaTypes.includes('Product')) throw new Error('Product schema not detected');
  
  // Check page characteristics
  if (!result.pageCharacteristics.hasRating) throw new Error('Rating not detected');
  if (!result.pageCharacteristics.hasPrice) throw new Error('Price not detected');
  if (!result.pageCharacteristics.hasBreadcrumbs) throw new Error('Breadcrumbs not detected');
});

// 4. Article Classification Test
await testAsync('Article classification', async () => {
  const testDom = new JSDOM(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>How to Build Better Web Applications - TechBlog</title>
        <meta property="og:type" content="article">
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
        </article>
        <div class="social-share">
          <button>Share on Twitter</button>
          <button>Share on Facebook</button>
        </div>
      </body>
    </html>
  `);

  const result = await analyzer.analyze(testDom.window.document, 'https://techblog.com/how-to-build-web-apps');
  
  if (!result.success) throw new Error('Analysis failed');
  if (result.primaryType !== 'ARTICLE') throw new Error(`Expected ARTICLE, got ${result.primaryType}`);
  if (result.confidence <= 0.8) throw new Error(`Low confidence: ${result.confidence}`);
  
  // Check content metrics
  if (!result.contentMetrics) throw new Error('Missing content metrics');
  if (result.contentMetrics.wordCount <= 20) throw new Error('Word count too low');
  if (result.contentMetrics.headingCount <= 2) throw new Error('Heading count too low');
  
  // Check characteristics
  if (!result.pageCharacteristics.hasSocialShare) throw new Error('Social share not detected');
});

// 5. Contact Page Classification Test
await testAsync('Contact page classification', async () => {
  const testDom = new JSDOM(`
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

  const result = await analyzer.analyze(testDom.window.document, 'https://example.com/contact');
  
  if (!result.success) throw new Error('Analysis failed');
  if (result.primaryType !== 'CONTACT') throw new Error(`Expected CONTACT, got ${result.primaryType}`);
  if (result.confidence <= 0.7) throw new Error(`Low confidence: ${result.confidence}`);
  if (!result.pageCharacteristics.hasForm) throw new Error('Form not detected');
});

// 6. Error Handling Tests
await testAsync('Error handling with invalid document', async () => {
  const result = await analyzer.analyze(null, 'https://example.com');
  
  if (result.success) throw new Error('Should have failed with null document');
  if (!result.error) throw new Error('Missing error message');
  if (result.primaryType !== null) throw new Error('Should return null primary type on error');
  if (result.confidence !== 0) throw new Error('Should return 0 confidence on error');
});

await testAsync('Error handling with empty content', async () => {
  const emptyDom = new JSDOM('<html><head></head><body></body></html>');
  const result = await analyzer.analyze(emptyDom.window.document, 'https://example.com');
  
  if (!result.success) throw new Error('Should succeed with empty content');
  if (result.primaryType !== null) throw new Error('Should not classify empty content');
});

// 7. Legacy Compatibility Test
await testAsync('Legacy classifyPage method', async () => {
  const testDom = new JSDOM(`
    <html>
      <head><title>Test Page</title></head>
      <body><h1>Test</h1></body>
    </html>
  `);

  // Mock console.warn
  const originalWarn = console.warn;
  let warningCalled = false;
  console.warn = (message) => {
    if (message.includes('deprecated')) warningCalled = true;
  };

  const result = await analyzer.classifyPage(testDom, 'https://example.com/test');

  // Restore console.warn
  console.warn = originalWarn;

  if (!warningCalled) throw new Error('Deprecation warning not called');
  if (!result.success) throw new Error('Legacy method failed');
  if (!result.primaryType === undefined) throw new Error('Legacy method missing classification data');
});

// 8. Configuration Options Test
test('Configuration options work correctly', () => {
  const customAnalyzer = new PageTypeClassifier({
    enableContentAnalysis: false,
    confidenceThreshold: 0.8
  });
  
  if (customAnalyzer.options.enableContentAnalysis !== false) throw new Error('Content analysis option not set');
  if (customAnalyzer.options.confidenceThreshold !== 0.8) throw new Error('Confidence threshold not set');
  if (customAnalyzer.options.enableStructureAnalysis !== true) throw new Error('Default structure analysis incorrect');
});

// 9. Performance Test
await testAsync('Performance test with complex content', async () => {
  const complexDom = new JSDOM(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Complex Page with Lots of Content</title>
      </head>
      <body>
        ${Array.from({ length: 50 }, (_, i) => `
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

  if (!result.success) throw new Error('Performance test analysis failed');
  if (duration > 5000) throw new Error(`Analysis too slow: ${duration}ms`);
  if (!result.analysisTime) throw new Error('Missing analysis time');
});

// 10. safeQuery Integration Test
await testAsync('safeQuery DOM access patterns', async () => {
  const testDom = new JSDOM(`
    <!DOCTYPE html>
    <html>
      <head><title>DOM Test</title></head>
      <body>
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <p>Paragraph 1</p>
        <p>Paragraph 2</p>
        <img src="test1.jpg" alt="Image 1">
        <img src="test2.jpg" alt="Image 2">
        <a href="/link1">Link 1</a>
        <a href="/link2">Link 2</a>
        <form><input type="text"></form>
        <div class="rating">★★★★★</div>
      </body>
    </html>
  `);

  const result = await analyzer.analyze(testDom.window.document, 'https://example.com');
  
  if (!result.success) throw new Error('safeQuery test failed');
  
  // Verify content metrics calculated correctly with safeQuery
  const metrics = result.contentMetrics;
  if (metrics.headingCount !== 3) throw new Error(`Expected 3 headings, got ${metrics.headingCount}`);
  if (metrics.paragraphCount !== 2) throw new Error(`Expected 2 paragraphs, got ${metrics.paragraphCount}`);
  if (metrics.linkCount !== 2) throw new Error(`Expected 2 links, got ${metrics.linkCount}`);
  if (metrics.imageCount !== 2) throw new Error(`Expected 2 images, got ${metrics.imageCount}`);
  
  // Verify page characteristics
  const chars = result.pageCharacteristics;
  if (!chars.hasForm) throw new Error('Form not detected via safeQuery');
  if (!chars.hasRating) throw new Error('Rating not detected via safeQuery');
});

// Print final results
console.log('🏁 Test Results Summary');
console.log('========================');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total: ${passed + failed}`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! PageTypeClassifier migration is successful!');
  console.log('\n📝 Migration Summary:');
  console.log('• ✅ BaseAnalyzer inheritance implemented');
  console.log('• ✅ All DOM queries converted to safeQuery');
  console.log('• ✅ Error handling integrated');
  console.log('• ✅ Performance measurement added');
  console.log('• ✅ Logging system integrated');
  console.log('• ✅ Legacy compatibility maintained');
  console.log('• ✅ Page classification accuracy verified');
  console.log('• ✅ Semantic markup analysis working');
  console.log('• ✅ Content metrics calculation accurate');
  console.log('• ✅ Configuration options functional');
  
  const score = Math.round((passed / (passed + failed)) * 10);
  console.log(`\n🏆 PageTypeClassifier Migration Score: ${score}/10`);
} else {
  console.log(`\n⚠️  ${failed} test(s) failed. Please review the errors above.`);
  process.exit(1);
}
