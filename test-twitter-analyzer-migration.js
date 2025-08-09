/**
 * Comprehensive test for TwitterCardAnalyzer BaseAnalyzer migration
 * Tests all functionality including BaseAnalyzer integration
 */

import { TwitterCardAnalyzer } from './src/analyzers/social-media/platforms/twitter-card-analyzer.js';
import { JSDOM } from 'jsdom';

async function testTwitterAnalyzerMigration() {
  console.log('🐦 Testing TwitterCardAnalyzer BaseAnalyzer Migration...\n');

  // Create test HTML with comprehensive Twitter Card tags
  const testHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Page - Twitter Card Testing</title>
      <meta name="description" content="This is a test page for Twitter Card functionality validation">
      
      <!-- Twitter Card tags -->
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:site" content="@testsite">
      <meta name="twitter:creator" content="@testcreator">
      <meta name="twitter:title" content="Comprehensive Twitter Card Test">
      <meta name="twitter:description" content="Testing Twitter Card implementation with BaseAnalyzer integration and comprehensive social media optimization features.">
      <meta name="twitter:image" content="https://example.com/twitter-image.jpg">
      
      <!-- Open Graph for comparison -->
      <meta property="og:title" content="Different OG Title">
      <meta property="og:description" content="Different OG description for uniqueness testing">
      <meta property="og:image" content="https://example.com/og-image.jpg">
    </head>
    <body>
      <h1>Twitter Card Test Page</h1>
      <p>This page tests Twitter Card analysis functionality.</p>
    </body>
    </html>
  `;

  const dom = new JSDOM(testHTML);
  const document = dom.window.document;

  // Initialize analyzer
  const analyzer = new TwitterCardAnalyzer({
    enableBasicValidation: true,
    enableCardTypeAnalysis: true,
    enableImageValidation: true,
    enableOptimizationAnalysis: true,
    validateImageDimensions: true,
    includeRecommendations: true
  });

  console.log('✅ Analyzer initialized successfully');
  console.log('📊 Analyzer metadata:', JSON.stringify(analyzer.getMetadata(), null, 2));

  // Test context validation
  const validContext = { document, url: 'https://example.com', pageData: {} };
  const isValidContext = analyzer.validate(validContext);
  console.log(`✅ Context validation: ${isValidContext ? 'PASSED' : 'FAILED'}`);

  // Test invalid context
  const invalidContext = { document: null };
  const isInvalidContext = analyzer.validate(invalidContext);
  console.log(`✅ Invalid context handling: ${!isInvalidContext ? 'PASSED' : 'FAILED'}`);

  // Perform comprehensive analysis
  console.log('\n🔍 Performing comprehensive Twitter Card analysis...');
  const result = await analyzer.analyze(validContext);

  if (result.success) {
    console.log(`✅ Analysis completed successfully in ${result.executionTime}ms`);
    console.log(`📊 Score: ${result.data.score}/100 (Grade: ${result.data.grade})`);
    console.log(`🐦 Has Twitter Card: ${result.data.hasTwitterCard}`);
    console.log(`📈 Completeness: ${result.data.completeness.percentage}%`);
    
    // Test Twitter Card detection
    console.log('\n📋 Twitter Card Detection:');
    console.log(`- Card Type: ${result.data.cardType.type}`);
    console.log(`- Valid Type: ${result.data.cardType.isValid}`);
    console.log(`- Has Required Tags: ${result.data.cardType.hasRequiredTags}`);
    
    // Test validation
    console.log('\n✔️ Validation Results:');
    console.log(`- Valid: ${result.data.validation.isValid}`);
    console.log(`- Issues: ${result.data.validation.issues.length}`);
    console.log(`- Warnings: ${result.data.validation.warnings.length}`);
    
    // Test optimization
    console.log('\n🚀 Optimization Analysis:');
    console.log(`- Optimization Score: ${result.data.optimization.score}`);
    console.log(`- Recommendations: ${result.data.optimization.recommendations.length}`);
    
    // Test recommendations
    console.log('\n💡 Recommendations:');
    result.data.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. [${rec.category}] ${rec.title}: ${rec.description}`);
    });
    
    // Test summary
    console.log(`\n📝 Summary: ${result.data.summary}`);
    
    // Test legacy compatibility
    console.log('\n🔄 Testing legacy compatibility...');
    const legacyResult = await analyzer.analyzeTwitterCard(document, 'https://example.com');
    console.log(`✅ Legacy method works: ${legacyResult.hasTwitterCard ? 'PASSED' : 'FAILED'}`);
    
    // Comprehensive functionality test
    const functionalityTests = [
      { name: 'Has metadata', test: () => result.data.metadata && result.data.metadata.name === 'TwitterCardAnalyzer' },
      { name: 'Has score', test: () => typeof result.data.score === 'number' && result.data.score >= 0 && result.data.score <= 100 },
      { name: 'Has grade', test: () => ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'].includes(result.data.grade) },
      { name: 'Detects Twitter Card', test: () => result.data.hasTwitterCard === true },
      { name: 'Validates card type', test: () => result.data.cardType.type === 'summary_large_image' },
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
      console.log(`🎉 TwitterCardAnalyzer migration SUCCESSFUL! Grade: ${result.data.grade}`);
    } else {
      console.log(`⚠️ TwitterCardAnalyzer migration needs attention. Success rate: ${successRate}%`);
    }
    
  } else {
    console.log('❌ Analysis failed:', result.error);
  }
}

// Run the test
testTwitterAnalyzerMigration().catch(console.error);
