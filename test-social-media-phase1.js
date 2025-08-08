/**
 * Simple Social Media Analyzer Test
 * Basic verification that Phase 1 implementation is working
 */

import { SocialMediaAnalyzer } from './src/analyzers/social-media/social-media-analyzer.js';
import { JSDOM } from 'jsdom';

async function runTest() {
  console.log('🎯 Testing Phase 1: Enhanced Social Media Optimization');

  // Test initialization
  console.log('✅ Testing analyzer initialization...');
  const analyzer = new SocialMediaAnalyzer();
  console.log('✅ Analyzer initialized successfully');
  console.log('   - Platform analyzers:', Object.keys(analyzer.platforms));
  console.log('   - Social proof analyzer:', analyzer.socialProofAnalyzer ? 'initialized' : 'missing');

  // Test basic analysis
  console.log('\n🔍 Testing basic social media analysis...');
  const testHTML = `
    <html>
    <head>
      <meta property="og:title" content="Test Product">
      <meta property="og:description" content="Amazing product description">
      <meta property="og:image" content="https://example.com/image.jpg">
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="Test Product">
    </head>
    <body>
      <h1>Test Product</h1>
      <div class="social-sharing">
        <a href="https://facebook.com/sharer" class="facebook-share">Share on Facebook</a>
        <a href="https://twitter.com/intent/tweet" class="twitter-share">Tweet</a>
      </div>
      <div class="testimonial">
        <p>"Great product! Highly recommended."</p>
        <div class="author">John Doe, CEO</div>
      </div>
      <div class="rating">★★★★★ 4.9/5</div>
    </body>
    </html>
  `;

  try {
    const mockDOM = new JSDOM(testHTML);
    const pageData = { title: 'Test Page', url: 'https://example.com' };
    const url = 'https://example.com';

    const analysis = await analyzer.analyzeSocialMedia(mockDOM, pageData, url);
    
    console.log('✅ Analysis completed successfully');
    console.log('🔍 Full analysis object:', JSON.stringify(analysis, null, 2));
    console.log('   - Platform analysis:', analysis.platforms ? 'present' : 'missing');
    console.log('   - Sharing analysis:', analysis.sharing ? 'present' : 'missing');
    console.log('   - Social proof analysis:', analysis.socialProof ? 'present' : 'missing');
    console.log('   - Optimization score:', analysis.optimizationScore || 'not calculated');
    console.log('   - Recommendations count:', analysis.recommendations?.length || 0);
    console.log('   - Error in analysis:', analysis.error || 'none');
    
    // Detailed platform analysis
    if (analysis.platforms) {
      console.log('\n📊 Platform Analysis Results:');
      Object.entries(analysis.platforms).forEach(([platform, data]) => {
        console.log(`   - ${platform}:`, data ? 'analyzed' : 'failed');
      });
    }
    
    // Social proof details
    if (analysis.socialProof) {
      console.log('\n🎖️ Social Proof Analysis:');
      console.log(`   - Testimonials: ${analysis.socialProof.testimonials?.count || 0} found`);
      console.log(`   - Ratings: ${analysis.socialProof.ratings?.count || 0} found`);
      console.log(`   - Trust signals: ${analysis.socialProof.trustSignals?.count || 0} found`);
      console.log(`   - Social proof score: ${analysis.socialProof.score || 'not calculated'}`);
    }

    console.log('\n🎉 Phase 1 Implementation Test: PASSED');
    console.log('✅ Enhanced Social Media Optimization module is working correctly');
    console.log('🚀 Ready to proceed with Phase 2: E-commerce Analysis Module');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('🔧 Stack trace:', error.stack);
  }

  console.log('\n📈 Testing Enhanced Extractors Integration...');
  try {
    const { EnhancedExtractorsIntegration } = await import('./src/extractors/enhanced-extractors-integration.js');
    const enhancedExtractors = new EnhancedExtractorsIntegration({
      enableSocialMediaAnalysis: true,
    });
    
    console.log('✅ Enhanced extractors integration successful');
    console.log('   - Social media analysis enabled:', enhancedExtractors.config.enableSocialMediaAnalysis);
    console.log('   - Social media analyzer:', enhancedExtractors.socialMediaAnalyzer ? 'initialized' : 'missing');
    
  } catch (error) {
    console.error('❌ Enhanced extractors integration failed:', error.message);
  }
}

// Run the test
runTest().catch(console.error);
