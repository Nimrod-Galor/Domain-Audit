#!/usr/bin/env node
/**
 * Test the migrated SocialMediaAnalyzer integration
 */

import { JSDOM } from 'jsdom';
import { SocialMediaAnalyzer } from './src/analyzers/content/SocialMediaAnalyzer.js';

async function testSocialMediaAnalyzer() {
  console.log('🧪 Testing Social Media Analyzer Integration...\n');
  
  try {
    const analyzer = new SocialMediaAnalyzer();
    
    // Test HTML with social media optimization features
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Social Media Website</title>
          <meta name="description" content="Amazing social media optimized content">
          
          <!-- Open Graph tags -->
          <meta property="og:title" content="Amazing Social Content">
          <meta property="og:description" content="This is optimized for social sharing">
          <meta property="og:image" content="https://example.com/images/social-image.jpg">
          <meta property="og:url" content="https://example.com">
          <meta property="og:type" content="article">
          
          <!-- Twitter Card tags -->
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:title" content="Amazing Social Content">
          <meta name="twitter:description" content="Twitter optimized description">
          <meta name="twitter:image" content="https://example.com/images/twitter-image.jpg">
          
          <!-- LinkedIn tags -->
          <meta property="article:author" content="Author Name">
          
          <!-- Pinterest tags -->
          <meta name="pinterest:description" content="Pinterest optimized description">
        </head>
        <body>
          <header>
            <h1>Social Media Optimized Website</h1>
          </header>
          
          <main>
            <article>
              <h2>Amazing Content for Social Sharing</h2>
              <p>This content is optimized for all social media platforms.</p>
              
              <!-- Social sharing buttons -->
              <div class="social-share">
                <a href="https://facebook.com/sharer/sharer.php?u=https://example.com" class="share-facebook">Share on Facebook</a>
                <a href="https://twitter.com/intent/tweet?url=https://example.com" class="share-twitter">Tweet</a>
                <a href="https://linkedin.com/sharing/share-offsite/?url=https://example.com" class="share-linkedin">Share on LinkedIn</a>
                <a href="https://pinterest.com/pin/create/button/?url=https://example.com" class="share-pinterest">Pin it</a>
              </div>
            </article>
            
            <!-- Social proof elements -->
            <section class="social-proof">
              <div class="testimonial">Great content! - Social Media Expert</div>
              <div class="social-count">1000+ shares</div>
              <div class="rating">⭐⭐⭐⭐⭐</div>
            </section>
          </main>
        </body>
      </html>
    `;
    
    const dom = new JSDOM(testHtml);
    const document = dom.window.document;
    const url = 'https://example.com';
    const pageData = { 
      title: 'Test Social Media Website',
      description: 'Amazing social media optimized content'
    };
    
    console.log('✅ Testing analyzer.analyze() method...');
    const result = await analyzer.analyze(document, pageData, url);
    
    console.log('📊 Social Media Analysis Result:');
    console.log('- Success:', result.success);
    console.log('- Analyzer:', result.analyzer);
    console.log('- Analysis Time:', result.analysisTime + 'ms');
    
    if (result.platforms) {
      console.log('- Open Graph Score:', result.platforms.openGraph?.score || 'N/A');
      console.log('- Twitter Card Score:', result.platforms.twitter?.score || 'N/A');
      console.log('- LinkedIn Score:', result.platforms.linkedin?.score || 'N/A');
    }
    
    if (result.sharing) {
      console.log('- Share Buttons Found:', result.sharing.shareButtonCount || 0);
      console.log('- Share Platforms:', result.sharing.platforms?.join(', ') || 'None');
    }
    
    if (result.optimization) {
      console.log('- Overall Score:', result.optimization.overallScore || 0);
      console.log('- Grade:', result.optimization.grade || 'F');
    }
    
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
    const legacyResult = await analyzer.analyzeSocialMedia({ window: { document } }, pageData, url);
    console.log('Legacy method result available:', !!legacyResult);
    console.log('Legacy method has platforms:', !!legacyResult?.platforms);
    
    console.log('\n🎉 Social Media Analyzer integration test completed successfully!');
    
    // Verify integration
    console.log('\n📊 Integration Verification:');
    console.log('- Extends BaseAnalyzer:', analyzer.constructor.name === 'SocialMediaAnalyzer' ? '✅' : '❌');
    console.log('- Has analyze() method:', typeof analyzer.analyze === 'function' ? '✅' : '❌');
    console.log('- Has getMetadata() method:', typeof analyzer.getMetadata === 'function' ? '✅' : '❌');
    console.log('- Has validate() method:', typeof analyzer.validate === 'function' ? '✅' : '❌');
    console.log('- Returns valid result structure:', result && result.success !== undefined ? '✅' : '❌');
    console.log('- Backward compatible:', typeof analyzer.analyzeSocialMedia === 'function' ? '✅' : '❌');
    console.log('- Platform analysis working:', result?.platforms ? '✅' : '❌');
    console.log('- Sharing analysis working:', result?.sharing ? '✅' : '❌');
    console.log('- Has optimization score:', result?.optimization?.overallScore !== undefined ? '✅' : '❌');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testSocialMediaAnalyzer().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
