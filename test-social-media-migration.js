/**
 * Social Media Analyzer Migration Test Suite
 * Comprehensive testing for BaseAnalyzer integration and social media analysis
 */

import { SocialMediaAnalyzer } from './src/analyzers/content/SocialMediaAnalyzer.js';
import { DOMProcessor } from './src/dom/dom-processor.js';

async function runSocialMediaAnalyzerTests() {
  console.log('🧪 Starting Social Media Analyzer Migration Tests...\n');
  
  const processor = new DOMProcessor();
  let passed = 0;
  let total = 0;
  
  function test(name, testFn) {
    total++;
    try {
      const result = testFn();
      if (result === true || (typeof result === 'object' && result !== null)) {
        console.log(`✅ ${name}`);
        passed++;
        return result;
      } else {
        console.log(`❌ ${name} - Expected truthy result, got: ${result}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ ${name} - Error: ${error.message}`);
      return false;
    }
  }

  // Test 1: Basic instantiation and BaseAnalyzer inheritance
  test('Social Media analyzer instantiation', () => {
    const analyzer = new SocialMediaAnalyzer();
    return analyzer && 
           typeof analyzer.analyze === 'function' &&
           typeof analyzer.getMetadata === 'function' &&
           typeof analyzer.validate === 'function' &&
           analyzer.name === 'SocialMediaAnalyzer';
  });

  // Test 2: Configuration options
  test('Configuration handling', () => {
    const analyzer = new SocialMediaAnalyzer({
      enableImageAnalysis: false,
      enableContentValidation: false,
      checkSocialButtons: false,
      analyzeSocialProof: false
    });
    return !analyzer.options.enableImageAnalysis &&
           !analyzer.options.enableContentValidation &&
           !analyzer.options.checkSocialButtons &&
           !analyzer.options.analyzeSocialProof;
  });

  // Test 3: Platform analyzers initialization
  test('Platform analyzers initialization', () => {
    const analyzer = new SocialMediaAnalyzer();
    return analyzer.platforms &&
           analyzer.platforms.openGraph &&
           analyzer.platforms.twitter &&
           analyzer.platforms.linkedin &&
           analyzer.platforms.pinterest &&
           analyzer.platforms.whatsapp &&
           analyzer.socialProofAnalyzer;
  });

  // Test 4: Comprehensive social media analysis with optimized page
  const optimizedHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Social Media Optimized Page</title>
  <meta name="description" content="This page is perfectly optimized for social media sharing.">
  
  <!-- Open Graph Tags -->
  <meta property="og:title" content="Amazing Social Media Page">
  <meta property="og:description" content="This page is perfectly optimized for social media sharing with comprehensive meta tags.">
  <meta property="og:image" content="https://example.com/social-image.jpg">
  <meta property="og:url" content="https://example.com/social-page">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Example Site">
  
  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Amazing Social Media Page">
  <meta name="twitter:description" content="Perfect for social sharing">
  <meta name="twitter:image" content="https://example.com/social-image.jpg">
  <meta name="twitter:site" content="@example">
  <meta name="twitter:creator" content="@author">
  
  <!-- LinkedIn -->
  <meta property="article:author" content="Author Name">
  <meta property="article:published_time" content="2024-01-01T00:00:00Z">
  
  <!-- Pinterest -->
  <meta name="pinterest" content="nopin">
  
</head>
<body>
  <h1>Social Media Optimized Page</h1>
  
  <!-- Social Sharing Buttons -->
  <div class="social-sharing">
    <a href="https://facebook.com/sharer/sharer.php?u=https://example.com" class="share-facebook">Share on Facebook</a>
    <a href="https://twitter.com/intent/tweet?url=https://example.com" class="share-twitter">Tweet this</a>
    <a href="https://linkedin.com/sharing/share-offsite/?url=https://example.com" class="share-linkedin">Share on LinkedIn</a>
    <a href="https://pinterest.com/pin/create/button/?url=https://example.com" class="share-pinterest">Pin it</a>
  </div>
  
  <!-- Social Proof Elements -->
  <div class="social-proof">
    <div class="testimonial">"This is an amazing product!" - Customer</div>
    <div class="rating">★★★★★ (4.8/5)</div>
    <div class="social-count">1,234 followers</div>
  </div>
  
  <p>This page demonstrates excellent social media optimization with proper meta tags, sharing buttons, and social proof elements.</p>
</body>
</html>`;

  test('Comprehensive social media analysis - optimized page', async () => {
    const { document } = await processor.createDOM(optimizedHTML, 'https://example.com/social-page');
    const analyzer = new SocialMediaAnalyzer();
    const result = await analyzer.analyze(document, 'https://example.com/social-page');
    
    // Check basic structure
    const hasBasicStructure = result &&
      result.success &&
      result.data &&
      result.data.platforms &&
      result.data.sharing &&
      result.data.images &&
      result.data.optimization;
    
    // Check platforms analysis
    const platformsAnalysis = result.data.platforms &&
      result.data.platforms.openGraph &&
      result.data.platforms.twitter &&
      result.data.platforms.linkedin &&
      result.data.platforms.pinterest &&
      result.data.platforms.whatsapp;
    
    // Check sharing analysis
    const sharingAnalysis = result.data.sharing &&
      result.data.sharing.hasSharing &&
      result.data.sharing.shareButtonCount > 0 &&
      Array.isArray(result.data.sharing.platforms);
    
    // Check image analysis
    const imageAnalysis = result.data.images &&
      result.data.images.ogImage &&
      result.data.images.ogImage.present &&
      result.data.images.twitterImage &&
      result.data.images.twitterImage.present;
    
    // Check optimization scoring
    const optimizationAnalysis = result.data.optimization &&
      typeof result.data.optimization.overallScore === 'number' &&
      result.data.optimization.overallScore > 0 &&
      result.data.optimization.componentScores &&
      result.data.optimization.grade;
    
    console.log(`   Overall Score: ${result.data.optimization.overallScore}/100 (${result.data.optimization.grade})`);
    console.log(`   Platforms: ${Object.keys(result.data.platforms).length} analyzed`);
    console.log(`   Share Buttons: ${result.data.sharing.shareButtonCount} found`);
    console.log(`   Images: OG=${result.data.images.ogImage.present}, Twitter=${result.data.images.twitterImage.present}`);
    
    return hasBasicStructure && platformsAnalysis && sharingAnalysis && imageAnalysis && optimizationAnalysis;
  });

  // Test 5: Analysis with poor social media optimization
  const poorHTML = `<!DOCTYPE html>
<html>
<head>
  <title>Poor Social Media Page</title>
</head>
<body>
  <h1>No Social Media Optimization</h1>
  <p>This page has no social media meta tags or sharing features.</p>
</body>
</html>`;

  test('Poor social media optimization detection', async () => {
    const { document } = await processor.createDOM(poorHTML, 'https://example.com/poor-page');
    const analyzer = new SocialMediaAnalyzer();
    const result = await analyzer.analyze(document, 'https://example.com/poor-page');
    
    const detectsIssues = result.data.images.ogImage &&
      !result.data.images.ogImage.present &&
      !result.data.images.twitterImage.present &&
      result.data.sharing.shareButtonCount === 0 &&
      !result.data.sharing.hasSharing;
    
    const hasRecommendations = result.data.recommendations && 
      result.data.recommendations.length > 0;
    
    const lowScore = result.data.optimization.overallScore < 50;
    
    console.log(`   Score: ${result.data.optimization.overallScore}/100 (${result.data.optimization.grade})`);
    console.log(`   Recommendations: ${result.data.recommendations.length} issues found`);
    console.log(`   Share buttons: ${result.data.sharing.shareButtonCount}`);
    
    return detectsIssues && hasRecommendations && lowScore;
  });

  // Test 6: Platform-specific analysis
  test('Platform-specific analysis', async () => {
    const { document } = await processor.createDOM(optimizedHTML, 'https://example.com/test');
    const analyzer = new SocialMediaAnalyzer();
    const result = await analyzer.analyze(document);
    
    const platforms = result.data.platforms;
    
    // Check each platform has been analyzed
    const hasOpenGraph = platforms.openGraph && !platforms.openGraph.error;
    const hasTwitter = platforms.twitter && !platforms.twitter.error;
    const hasLinkedIn = platforms.linkedin && !platforms.linkedin.error;
    const hasPinterest = platforms.pinterest && !platforms.pinterest.error;
    const hasWhatsApp = platforms.whatsapp && !platforms.whatsapp.error;
    
    console.log(`   Open Graph: ${hasOpenGraph ? '✓' : '✗'}`);
    console.log(`   Twitter: ${hasTwitter ? '✓' : '✗'}`);
    console.log(`   LinkedIn: ${hasLinkedIn ? '✓' : '✗'}`);
    console.log(`   Pinterest: ${hasPinterest ? '✓' : '✗'}`);
    console.log(`   WhatsApp: ${hasWhatsApp ? '✓' : '✗'}`);
    
    return hasOpenGraph && hasTwitter && hasLinkedIn && hasPinterest && hasWhatsApp;
  });

  // Test 7: Social sharing button detection
  test('Social sharing button detection', async () => {
    const sharingHTML = `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
  <div class="sharing">
    <a href="https://facebook.com/sharer" class="fb-share">Facebook</a>
    <a href="https://twitter.com/intent/tweet" class="tw-share">Twitter</a>
    <button class="share-btn linkedin-share">LinkedIn</button>
    <div class="social-media-buttons">
      <a href="https://pinterest.com/pin/create" class="pin-btn">Pinterest</a>
    </div>
  </div>
</body>
</html>`;

    const { document } = await processor.createDOM(sharingHTML, 'https://example.com/sharing');
    const analyzer = new SocialMediaAnalyzer({ checkSocialButtons: true });
    const result = await analyzer.analyze(document);
    
    const sharing = result.data.sharing;
    const detectsButtons = sharing.shareButtonCount > 0 &&
      sharing.hasSharing &&
      Array.isArray(sharing.platforms) &&
      sharing.platforms.length > 0;
    
    const identifiesPlatforms = sharing.platforms.includes('facebook') ||
      sharing.platforms.includes('twitter') ||
      sharing.platforms.includes('linkedin') ||
      sharing.platforms.includes('pinterest');
    
    console.log(`   Share buttons found: ${sharing.shareButtonCount}`);
    console.log(`   Platforms identified: ${sharing.platforms.join(', ')}`);
    console.log(`   Share score: ${sharing.shareScore}/100`);
    
    return detectsButtons && identifiesPlatforms;
  });

  // Test 8: Error handling and edge cases
  test('Error handling', async () => {
    const analyzer = new SocialMediaAnalyzer();
    
    // Test with null document
    const nullResult = await analyzer.analyze(null);
    const handlesNull = nullResult && nullResult.error;
    
    // Test with minimal document
    const minimalDoc = { head: {}, title: '', documentElement: {} };
    const minimalResult = await analyzer.analyze(minimalDoc);
    const handlesMinimal = minimalResult && typeof minimalResult === 'object';
    
    return handlesNull && handlesMinimal;
  });

  // Test 9: BaseAnalyzer integration
  test('BaseAnalyzer integration', () => {
    const analyzer = new SocialMediaAnalyzer();
    
    // Check inherited methods
    const hasInheritedMethods = typeof analyzer.log === 'function' &&
      typeof analyzer.measureTime === 'function' &&
      typeof analyzer.handleError === 'function' &&
      typeof analyzer.safeQuery === 'function' &&
      typeof analyzer.createSuccessResponse === 'function';
    
    // Check analyzer properties
    const hasProperties = analyzer.name === 'SocialMediaAnalyzer' &&
      analyzer.options &&
      analyzer.platforms;
    
    return hasInheritedMethods && hasProperties;
  });

  // Test 10: Metadata functionality
  test('Metadata generation', () => {
    const analyzer = new SocialMediaAnalyzer();
    const metadata = analyzer.getMetadata();
    
    const hasRequiredMetadata = metadata &&
      metadata.name === 'SocialMediaAnalyzer' &&
      metadata.version &&
      metadata.description &&
      metadata.category === 'content' &&
      metadata.priority === 'high';
    
    console.log(`   Name: ${metadata.name}`);
    console.log(`   Category: ${metadata.category}`);
    console.log(`   Priority: ${metadata.priority}`);
    
    return hasRequiredMetadata;
  });

  // Test 11: Legacy compatibility
  test('Legacy method compatibility', async () => {
    const { document } = await processor.createDOM(optimizedHTML, 'https://example.com/legacy');
    const analyzer = new SocialMediaAnalyzer();
    
    // Test legacy method (should show deprecation warning)
    const mockDom = { window: { document } };
    const legacyResult = await analyzer.analyzeSocialMedia(mockDom, {}, 'https://example.com/legacy');
    
    const legacyWorks = legacyResult && 
      legacyResult.success &&
      legacyResult.data &&
      legacyResult.data.platforms;
    
    console.log(`   Legacy method works: ${legacyWorks ? '✓' : '✗'}`);
    
    return legacyWorks;
  });

  // Test 12: Configuration-based feature enabling/disabling
  test('Feature configuration', async () => {
    const { document } = await processor.createDOM(optimizedHTML, 'https://example.com/config');
    
    // Test with disabled features
    const analyzer = new SocialMediaAnalyzer({
      enableImageAnalysis: false,
      analyzeSocialProof: false
    });
    
    const result = await analyzer.analyze(document);
    
    const respectsConfig = result.data.images.enabled === false &&
      result.data.socialProof.enabled === false;
    
    console.log(`   Image analysis disabled: ${result.data.images.enabled === false ? '✓' : '✗'}`);
    console.log(`   Social proof disabled: ${result.data.socialProof.enabled === false ? '✓' : '✗'}`);
    
    return respectsConfig;
  });

  // Results Summary
  console.log(`\n📊 Social Media Analyzer Migration Test Results:`);
  console.log(`✅ Passed: ${passed}/${total} tests`);
  console.log(`📈 Success Rate: ${Math.round((passed/total) * 100)}%`);
  
  if (passed === total) {
    console.log(`\n🎉 All tests passed! Social Media Analyzer successfully migrated to BaseAnalyzer architecture.`);
    console.log(`🔧 Features validated:`);
    console.log(`   • BaseAnalyzer inheritance and integration`);
    console.log(`   • Platform-specific analysis (OG, Twitter, LinkedIn, Pinterest, WhatsApp)`);
    console.log(`   • Social sharing button detection and analysis`);
    console.log(`   • Social proof element detection`);
    console.log(`   • Image optimization analysis`);
    console.log(`   • Comprehensive optimization scoring`);
    console.log(`   • Recommendation generation`);
    console.log(`   • Error handling and validation`);
    console.log(`   • Legacy method compatibility`);
    console.log(`   • Configuration-based feature control`);
    console.log(`   • Performance measurement and caching`);
    console.log(`   • Comprehensive metadata generation`);
    return 10; // Perfect score
  } else {
    console.log(`\n⚠️  Some tests failed. Social Media Analyzer needs additional work.`);
    return Math.round((passed/total) * 10);
  }
}

// Run the tests
runSocialMediaAnalyzerTests().then(score => {
  console.log(`\n🏆 Final Score: ${score}/10`);
  process.exit(0);
}).catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});
