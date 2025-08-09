/**
 * Comprehensive test for PinterestAnalyzer BaseAnalyzer migration
 * Tests all functionality including BaseAnalyzer integration
 */

import { PinterestAnalyzer } from './src/analyzers/social-media/platforms/pinterest-analyzer.js';
import { JSDOM } from 'jsdom';

async function testPinterestAnalyzerMigration() {
  console.log('📌 Testing PinterestAnalyzer BaseAnalyzer Migration...\n');

  // Create test HTML with comprehensive Pinterest optimization
  const testHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>DIY Home Decor Ideas - Pinterest Test</title>
      <meta name="description" content="Discover amazing DIY home decor ideas that will transform your space on a budget. Creative tutorials and inspiration for every room.">
      
      <!-- Open Graph tags for Pinterest Rich Pins -->
      <meta property="og:title" content="25 Budget-Friendly DIY Home Decor Ideas">
      <meta property="og:description" content="Transform your home with these creative DIY projects that cost less than $50. Step-by-step tutorials with before and after photos.">
      <meta property="og:image" content="https://example.com/diy-home-decor-pinterest.jpg">
      <meta property="og:type" content="article">
      <meta property="og:url" content="https://example.com/diy-home-decor">
      
      <!-- Article Rich Pin tags -->
      <meta property="article:author" content="Jane Smith">
      <meta property="article:published_time" content="2025-08-08T10:00:00Z">
      <meta property="article:section" content="Home & Garden">
      
      <!-- Pinterest verification -->
      <meta name="p:domain_verify" content="abc123def456">
      
      <!-- Structured data for Rich Pins -->
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "25 Budget-Friendly DIY Home Decor Ideas",
        "author": {
          "@type": "Person",
          "name": "Jane Smith"
        },
        "datePublished": "2025-08-08T10:00:00Z",
        "description": "Transform your home with these creative DIY projects that cost less than $50.",
        "image": "https://example.com/diy-home-decor-pinterest.jpg"
      }
      </script>
    </head>
    <body>
      <h1>DIY Home Decor Ideas That Won't Break the Bank</h1>
      <p>Looking for creative ways to decorate your home without spending a fortune? These DIY projects are perfect for Pinterest!</p>
      
      <img src="https://example.com/vertical-diy-image1.jpg" alt="Beautiful DIY wall art made from recycled materials" width="600" height="900">
      <img src="https://example.com/vertical-diy-image2.jpg" alt="Stunning DIY furniture makeover before and after" width="600" height="900">
      <img src="https://example.com/diy-tutorial.jpg" alt="Step-by-step DIY home decor tutorial" width="800" height="600">
      
      <p>These craft projects include handmade decorations, furniture makeovers, and creative storage solutions perfect for Pinterest boards.</p>
    </body>
    </html>
  `;

  const dom = new JSDOM(testHTML);
  const document = dom.window.document;

  // Initialize analyzer
  const analyzer = new PinterestAnalyzer({
    enableRichPinValidation: true,
    enableImageOptimization: true,
    enableContentAnalysis: true,
    enableSchemaValidation: true,
    validateImageDimensions: true,
    includeRecommendations: true
  });

  console.log('✅ Analyzer initialized successfully');
  console.log('📊 Analyzer metadata:', JSON.stringify(analyzer.getMetadata(), null, 2));

  // Test context validation
  const validContext = { document, url: 'https://example.com/diy-home-decor', pageData: {} };
  const isValidContext = analyzer.validate(validContext);
  console.log(`✅ Context validation: ${isValidContext ? 'PASSED' : 'FAILED'}`);

  // Test invalid context
  const invalidContext = { document: null };
  const isInvalidContext = analyzer.validate(invalidContext);
  console.log(`✅ Invalid context handling: ${!isInvalidContext ? 'PASSED' : 'FAILED'}`);

  // Perform comprehensive analysis
  console.log('\n🔍 Performing comprehensive Pinterest analysis...');
  const result = await analyzer.analyze(validContext);

  if (result.success) {
    console.log(`✅ Analysis completed successfully in ${result.executionTime}ms`);
    console.log(`📊 Score: ${result.data.score}/100 (Grade: ${result.data.grade})`);
    console.log(`📌 Has Pinterest Optimization: ${result.data.hasPinterestOptimization}`);
    console.log(`📈 Completeness: ${result.data.completeness.percentage}%`);
    
    // Test Rich Pins detection
    console.log('\n📋 Rich Pins Analysis:');
    console.log(`- Has Rich Pins: ${result.data.richPins.hasRichPins}`);
    console.log(`- Primary Type: ${result.data.richPins.primaryType}`);
    console.log(`- Detected Types: ${result.data.richPins.detectedTypes.join(', ')}`);
    
    // Test image optimization
    console.log('\n🖼️ Image Optimization:');
    console.log(`- Total Images: ${result.data.imageOptimization.totalImages}`);
    console.log(`- Vertical Images: ${result.data.imageOptimization.verticalImages}`);
    console.log(`- Optimization Score: ${result.data.imageOptimization.optimizationScore}`);
    
    // Test content optimization
    console.log('\n📝 Content Optimization:');
    console.log(`- Title Optimized: ${result.data.contentOptimization.title?.optimized}`);
    console.log(`- Description Optimized: ${result.data.contentOptimization.description?.optimized}`);
    console.log(`- Pinterest Friendly: ${result.data.contentOptimization.keywords?.isPinterestFriendly}`);
    
    // Test schema analysis
    console.log('\n🏗️ Schema Analysis:');
    console.log(`- Has Relevant Schema: ${result.data.schemaAnalysis.hasRelevantSchema}`);
    console.log(`- Schema Count: ${result.data.schemaAnalysis.count}`);
    
    // Test validation
    console.log('\n✔️ Validation Results:');
    console.log(`- Errors: ${result.data.validation.errors.length}`);
    console.log(`- Warnings: ${result.data.validation.warnings.length}`);
    
    // Test recommendations
    console.log('\n💡 Recommendations:');
    result.data.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. [${rec.category}] ${rec.title}: ${rec.description}`);
    });
    
    // Test summary
    console.log(`\n📝 Summary: ${result.data.summary}`);
    
    // Test legacy compatibility
    console.log('\n🔄 Testing legacy compatibility...');
    const legacyResult = await analyzer.analyzePinterest(document, 'https://example.com/diy-home-decor');
    console.log(`✅ Legacy method works: ${legacyResult.hasPinterestOptimization ? 'PASSED' : 'FAILED'}`);
    
    // Comprehensive functionality test
    const functionalityTests = [
      { name: 'Has metadata', test: () => result.data.metadata && result.data.metadata.name === 'PinterestAnalyzer' },
      { name: 'Has score', test: () => typeof result.data.score === 'number' && result.data.score >= 0 && result.data.score <= 100 },
      { name: 'Has grade', test: () => ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'].includes(result.data.grade) },
      { name: 'Detects Rich Pins', test: () => result.data.richPins.hasRichPins === true },
      { name: 'Identifies primary type', test: () => result.data.richPins.primaryType === 'article' },
      { name: 'Analyzes images', test: () => result.data.imageOptimization.totalImages > 0 },
      { name: 'Has schema analysis', test: () => result.data.schemaAnalysis.hasRelevantSchema === true },
      { name: 'Calculates completeness', test: () => result.data.completeness.percentage > 0 },
      { name: 'Generates recommendations', test: () => Array.isArray(result.data.recommendations) },
      { name: 'Has execution time', test: () => typeof result.executionTime === 'number' && result.executionTime > 0 },
      { name: 'Has timestamp', test: () => result.timestamp && new Date(result.timestamp).getTime() > 0 },
      { name: 'Legacy compatibility', test: () => legacyResult && typeof legacyResult === 'object' }
    ];
    
    console.log('\n🧪 Functionality Tests:');
    let passedTests = 0;
    functionalityTests.forEach(test => {
      const passed = test.test();
      console.log(`${passed ? '✅' : '❌'} ${test.name}: ${passed ? 'PASSED' : 'FAILED'}`);
      if (passed) passedTests++;
    });
    
    const successRate = Math.round((passedTests / functionalityTests.length) * 100);
    console.log(`\n📊 Test Results: ${passedTests}/${functionalityTests.length} tests passed (${successRate}%)`);
    
    if (successRate >= 90) {
      console.log(`🎉 PinterestAnalyzer migration SUCCESSFUL! Grade: ${result.data.grade}`);
    } else {
      console.log(`⚠️ PinterestAnalyzer migration needs attention. Success rate: ${successRate}%`);
    }
    
  } else {
    console.log('❌ Analysis failed:', result.error);
  }
}

// Run the test
testPinterestAnalyzerMigration().catch(console.error);
