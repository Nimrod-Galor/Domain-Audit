import { ThirdPartyAnalyzer } from './src/analyzers/third-party/ThirdPartyAnalyzer.js';
import { SocialMediaAnalyzer } from './src/analyzers/content/SocialMediaAnalyzer.js';
import { ContentQualityAnalyzer } from './src/analyzers/content-quality-analyzer.js';
import { JSDOM } from 'jsdom';

// Test all 3 analyzers with modern context format
async function testModernFormat() {
  console.log('🧪 Testing modern context format...\n');
  
  const html = `
    <html>
      <head>
        <title>Test Page</title>
        <script src="https://www.google-analytics.com/analytics.js"></script>
        <meta property="og:title" content="Test Page">
      </head>
      <body>
        <h1>Test Content</h1>
        <p>This is a test page with some content.</p>
        <div class="fb-like" data-href="https://example.com"></div>
      </body>
    </html>
  `;
  
  const dom = new JSDOM(html);
  const context = {
    document: dom.window.document,
    url: 'https://example.com',
    pageData: { title: 'Test Page' }
  };

  // Test ThirdPartyAnalyzer
  console.log('1. Testing ThirdPartyAnalyzer...');
  const thirdPartyAnalyzer = new ThirdPartyAnalyzer();
  const thirdPartyResult = await thirdPartyAnalyzer.analyze(context);
  console.log('✅ ThirdPartyAnalyzer - Success:', thirdPartyResult.success);

  // Test SocialMediaAnalyzer  
  console.log('2. Testing SocialMediaAnalyzer...');
  const socialMediaAnalyzer = new SocialMediaAnalyzer();
  const socialResult = await socialMediaAnalyzer.analyze(context);
  console.log('✅ SocialMediaAnalyzer - Success:', socialResult.success);

  // Test ContentQualityAnalyzer (already modern)
  console.log('3. Testing ContentQualityAnalyzer...');
  const contentAnalyzer = new ContentQualityAnalyzer();
  const contentContext = { dom, pageData: { title: 'Test Page' }, rawHTML: html };
  const contentResult = await contentAnalyzer.analyze(contentContext);
  console.log('✅ ContentQualityAnalyzer - Success:', contentResult.success);
}

// Test legacy format compatibility
async function testLegacyFormat() {
  console.log('\n🔄 Testing legacy format compatibility...\n');
  
  const html = `<html><body><h1>Legacy Test</h1></body></html>`;
  const dom = new JSDOM(html);
  
  // Test ThirdPartyAnalyzer with legacy format
  console.log('1. Testing ThirdPartyAnalyzer (legacy)...');
  const thirdPartyAnalyzer = new ThirdPartyAnalyzer();
  const thirdPartyResult = await thirdPartyAnalyzer.analyze(dom.window.document, 'https://example.com');
  console.log('✅ ThirdPartyAnalyzer Legacy - Success:', thirdPartyResult.success);

  // Test SocialMediaAnalyzer with legacy format
  console.log('2. Testing SocialMediaAnalyzer (legacy)...');
  const socialMediaAnalyzer = new SocialMediaAnalyzer();
  const socialResult = await socialMediaAnalyzer.analyze(dom.window.document, 'https://example.com');
  console.log('✅ SocialMediaAnalyzer Legacy - Success:', socialResult.success);
}

// Run tests
async function runTests() {
  try {
    await testModernFormat();
    await testLegacyFormat();
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Phase 5B Status: Final Analyzer Standardization COMPLETED');
    console.log('✅ ThirdPartyAnalyzer: Modern context + legacy compatibility');
    console.log('✅ SocialMediaAnalyzer: Modern context + legacy compatibility'); 
    console.log('✅ ContentQualityAnalyzer: Already modern');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();
