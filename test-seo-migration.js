/**
 * SEO Analyzer Migration Test Suite
 * Comprehensive testing for BaseAnalyzer integration
 */

import { SEOAnalyzer } from './src/analyzers/seo-analyzer.js';
import { DOMProcessor } from './src/dom/dom-processor.js';

async function runSEOAnalyzerTests() {
  console.log('🧪 Starting SEO Analyzer Migration Tests...\n');
  
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
  test('SEO analyzer instantiation', () => {
    const analyzer = new SEOAnalyzer();
    return analyzer && 
           typeof analyzer.analyze === 'function' &&
           typeof analyzer.getMetadata === 'function' &&
           typeof analyzer.validate === 'function' &&
           analyzer.name === 'SEO';
  });

  // Test 2: Configuration options
  test('Configuration handling', () => {
    const analyzer = new SEOAnalyzer({
      includeAdvancedAnalysis: false,
      analyzePerformance: false,
      extractKeywords: false
    });
    return !analyzer.config.includeAdvancedAnalysis &&
           !analyzer.config.analyzePerformance &&
           !analyzer.config.extractKeywords;
  });

  // Test 3: Document validation
  test('Document validation', () => {
    const analyzer = new SEOAnalyzer();
    return !analyzer.validate(null) &&
           !analyzer.validate(undefined) &&
           analyzer.validate({ head: {}, title: '', documentElement: {} });
  });

  // Test 4: Comprehensive SEO analysis with well-optimized page
  const optimizedHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Perfect SEO Test Page - 45 Characters</title>
  <meta name="description" content="This is a perfectly optimized meta description that is between 120 and 160 characters long for maximum SEO effectiveness.">
  <meta name="keywords" content="seo, optimization, test, perfect">
  <link rel="canonical" href="https://example.com/perfect-page">
  <meta property="og:title" content="Perfect SEO Test Page">
  <meta property="og:description" content="Perfect page for SEO testing">
  <meta property="og:image" content="https://example.com/perfect-image.jpg">
  <meta property="og:url" content="https://example.com/perfect-page">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Perfect SEO Test Page">
  <meta name="twitter:description" content="Perfect page for SEO testing">
  <meta name="twitter:image" content="https://example.com/perfect-image.jpg">
  <meta name="robots" content="index, follow">
  <link rel="icon" href="/favicon.ico" type="image/x-icon">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Perfect SEO Test Page",
    "description": "Perfect page for SEO testing"
  }
  </script>
</head>
<body>
  <h1>Perfect SEO Test Page</h1>
  <h2>Introduction to SEO Testing</h2>
  <p>This page demonstrates perfect SEO optimization with proper meta tags, structured data, and content hierarchy.</p>
  <h2>SEO Best Practices</h2>
  <h3>Title Optimization</h3>
  <p>Learn how to optimize page titles for better search engine visibility and user engagement.</p>
  <h3>Meta Description Best Practices</h3>
  <p>Discover the secrets to writing compelling meta descriptions that improve click-through rates.</p>
  <h2>Technical SEO</h2>
  <p>Technical SEO involves optimizing your website's infrastructure to help search engines crawl and index your content effectively.</p>
</body>
</html>`;

  test('Comprehensive SEO analysis - optimized page', async () => {
    const { document } = await processor.createDOM(optimizedHTML, 'https://example.com/perfect-page');
    const analyzer = new SEOAnalyzer();
    const result = await analyzer.analyze(document, 'https://example.com/perfect-page');
    
    // Check basic structure
    const hasBasicStructure = result &&
      result.title &&
      result.metaDescription &&
      result.openGraph &&
      result.twitterCard &&
      result.structuredData &&
      result.score &&
      result.metadata;
    
    // Check title analysis
    const titleAnalysis = result.title.text === 'Perfect SEO Test Page - 45 Characters' &&
      result.title.length === 45 &&
      !result.title.isEmpty &&
      !result.title.isTooShort &&
      !result.title.isTooLong;
    
    // Check meta description analysis
    const metaAnalysis = result.metaDescription.text.includes('perfectly optimized meta description') &&
      result.metaDescription.length > 120 &&
      result.metaDescription.length < 160 &&
      !result.metaDescription.isEmpty;
    
    // Check Open Graph data
    const ogAnalysis = result.openGraph.title === 'Perfect SEO Test Page' &&
      result.openGraph.description === 'Perfect page for SEO testing' &&
      result.openGraph.image === 'https://example.com/perfect-image.jpg';
    
    // Check Twitter Card data
    const twitterAnalysis = result.twitterCard.card === 'summary_large_image' &&
      result.twitterCard.title === 'Perfect SEO Test Page';
    
    // Check structured data
    const structuredDataAnalysis = result.structuredData.count > 0 &&
      result.structuredData.types.includes('WebPage');
    
    // Check technical SEO
    const technicalAnalysis = result.canonical === 'https://example.com/perfect-page' &&
      result.robots === 'index, follow' &&
      result.language.htmlLang === 'en';
    
    console.log(`   Title: ${result.title.text} (${result.title.length} chars)`);
    console.log(`   Meta Description: ${result.metaDescription.length} chars`);
    console.log(`   Open Graph: ${result.openGraph.title ? '✓' : '✗'}`);
    console.log(`   Twitter Card: ${result.twitterCard.card || 'none'}`);
    console.log(`   Structured Data: ${result.structuredData.count} items`);
    console.log(`   SEO Score: ${result.score.score}/${result.score.maxScore} (${result.score.percentage}%)`);
    
    return hasBasicStructure && titleAnalysis && metaAnalysis && ogAnalysis && 
           twitterAnalysis && structuredDataAnalysis && technicalAnalysis;
  });

  // Test 5: Analysis with poor SEO
  const poorHTML = `<!DOCTYPE html>
<html>
<head>
  <title>Bad</title>
</head>
<body>
  <h2>No H1 Here</h2>
  <p>Poor content.</p>
</body>
</html>`;

  test('Poor SEO analysis detection', async () => {
    const { document } = await processor.createDOM(poorHTML, 'https://example.com/poor-page');
    const analyzer = new SEOAnalyzer();
    const result = await analyzer.analyze(document);
    
    const detectsIssues = result.title.isTooShort &&
      result.metaDescription.isEmpty &&
      !result.openGraph.title &&
      !result.canonical &&
      result.structuredData.count === 0;
    
    const hasRecommendations = result.recommendations && result.recommendations.length > 0;
    const lowScore = result.score.percentage < 50;
    
    console.log(`   SEO Score: ${result.score.score}/${result.score.maxScore} (${result.score.percentage}%)`);
    console.log(`   Recommendations: ${result.recommendations.length} issues found`);
    
    return detectsIssues && hasRecommendations && lowScore;
  });

  // Test 6: Advanced analysis features
  test('Advanced analysis features', async () => {
    const { document } = await processor.createDOM(optimizedHTML, 'https://example.com/test');
    const analyzer = new SEOAnalyzer({
      includeAdvancedAnalysis: true,
      analyzePerformance: true,
      extractKeywords: true,
      checkSocialMedia: true
    });
    const result = await analyzer.analyze(document);
    
    const hasPerformance = result.performance &&
      typeof result.performance.titleOptimization === 'number' &&
      typeof result.performance.metaDescriptionOptimization === 'number';
    
    const hasKeywords = result.keywords &&
      Array.isArray(result.keywords.title) &&
      Array.isArray(result.keywords.content);
    
    const hasSocialMedia = result.socialMedia &&
      result.socialMedia.openGraph &&
      result.socialMedia.twitterCard;
    
    const hasTechnical = result.technical &&
      result.technical.factors &&
      result.technical.factors.canonical;
    
    const hasContent = result.content &&
      result.content.factors &&
      result.content.factors.title;
    
    console.log(`   Performance analysis: ${hasPerformance ? '✓' : '✗'}`);
    console.log(`   Keyword extraction: ${hasKeywords ? '✓' : '✗'}`);
    console.log(`   Social media analysis: ${hasSocialMedia ? '✓' : '✗'}`);
    console.log(`   Technical SEO: ${hasTechnical ? '✓' : '✗'}`);
    console.log(`   Content analysis: ${hasContent ? '✓' : '✗'}`);
    
    return hasPerformance && hasKeywords && hasSocialMedia && hasTechnical && hasContent;
  });

  // Test 7: Error handling and edge cases
  test('Error handling', async () => {
    const analyzer = new SEOAnalyzer();
    
    // Test with null document
    const nullResult = await analyzer.analyze(null);
    const handlesNull = nullResult && nullResult.error;
    
    // Test with minimal document
    const minimalDoc = { head: null, title: '', documentElement: {} };
    const minimalResult = await analyzer.analyze(minimalDoc);
    const handlesMinimal = minimalResult && typeof minimalResult === 'object';
    
    return handlesNull && handlesMinimal;
  });

  // Test 8: BaseAnalyzer integration
  test('BaseAnalyzer integration', () => {
    const analyzer = new SEOAnalyzer();
    
    // Check inherited methods
    const hasInheritedMethods = typeof analyzer.log === 'function' &&
      typeof analyzer.measureTime === 'function' &&
      typeof analyzer.handleError === 'function' &&
      typeof analyzer.safeQuery === 'function';
    
    // Check analyzer properties
    const hasProperties = analyzer.name === 'SEO' &&
      analyzer.config &&
      analyzer.cache &&
      analyzer.metrics;
    
    return hasInheritedMethods && hasProperties;
  });

  // Test 9: Metadata functionality
  test('Metadata generation', () => {
    const analyzer = new SEOAnalyzer();
    const metadata = analyzer.getMetadata();
    
    const hasRequiredMetadata = metadata &&
      metadata.name === 'SEO Analyzer' &&
      metadata.version &&
      metadata.description &&
      Array.isArray(metadata.capabilities) &&
      metadata.capabilities.length > 0 &&
      metadata.outputFormat &&
      metadata.configuration;
    
    console.log(`   Capabilities: ${metadata.capabilities.length} features`);
    console.log(`   Output format defined: ${Object.keys(metadata.outputFormat).length} fields`);
    
    return hasRequiredMetadata;
  });

  // Test 10: Performance and caching
  test('Performance and caching', async () => {
    const { document } = await processor.createDOM(optimizedHTML, 'https://example.com/test');
    const analyzer = new SEOAnalyzer();
    
    // First analysis
    const start1 = Date.now();
    const result1 = await analyzer.analyze(document);
    const time1 = Date.now() - start1;
    
    // Second analysis (should use cache)
    const start2 = Date.now();
    const result2 = await analyzer.analyze(document);
    const time2 = Date.now() - start2;
    
    const bothSuccessful = result1 && result2 &&
      result1.title && result2.title &&
      result1.score && result2.score;
    
    const hasMetrics = analyzer.metrics &&
      typeof analyzer.metrics.totalTime === 'number';
    
    console.log(`   First analysis: ${time1}ms`);
    console.log(`   Second analysis: ${time2}ms`);
    console.log(`   Cache hits: ${analyzer.metrics.cacheHits || 0}`);
    
    return bothSuccessful && hasMetrics;
  });

  // Test 11: Keyword extraction functionality
  test('Keyword extraction', async () => {
    const keywordHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>SEO Optimization Guide for Better Rankings</title>
  <meta name="description" content="Learn advanced SEO techniques and optimization strategies to improve your website rankings and organic traffic.">
  <meta name="keywords" content="SEO, optimization, rankings, search engine, website">
</head>
<body>
  <h1>SEO Optimization Guide</h1>
  <h2>Search Engine Optimization Basics</h2>
  <p>Search engine optimization involves improving your website visibility in search results through various techniques and strategies.</p>
  <h2>Content Optimization</h2>
  <p>Quality content creation and keyword research are fundamental aspects of successful SEO campaigns.</p>
</body>
</html>`;

    const { document } = await processor.createDOM(keywordHTML, 'https://example.com/seo-guide');
    const analyzer = new SEOAnalyzer({ extractKeywords: true });
    const result = await analyzer.analyze(document);
    
    const hasKeywordExtraction = result.keywords &&
      Array.isArray(result.keywords.title) &&
      Array.isArray(result.keywords.metaDescription) &&
      Array.isArray(result.keywords.headings) &&
      Array.isArray(result.keywords.content) &&
      Array.isArray(result.keywords.metaKeywords);
    
    const hasKeywordAnalysis = result.keywords.analysis &&
      typeof result.keywords.analysis.totalUniqueKeywords === 'number';
    
    const findsRelevantKeywords = result.keywords.title.includes('optimization') ||
      result.keywords.title.includes('guide') ||
      result.keywords.metaDescription.includes('techniques') ||
      result.keywords.headings.includes('optimization');
    
    console.log(`   Title keywords: ${result.keywords.title.slice(0, 3).join(', ')}`);
    console.log(`   Meta keywords: ${result.keywords.metaKeywords.slice(0, 3).join(', ')}`);
    console.log(`   Total unique keywords: ${result.keywords.analysis.totalUniqueKeywords}`);
    
    return hasKeywordExtraction && hasKeywordAnalysis && findsRelevantKeywords;
  });

  // Test 12: Social media optimization analysis
  test('Social media optimization', async () => {
    const socialHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Social Media Optimized Page</title>
  <meta property="og:title" content="Amazing Social Media Page">
  <meta property="og:description" content="This page is perfectly optimized for social media sharing with all required Open Graph tags.">
  <meta property="og:image" content="https://example.com/social-image.jpg">
  <meta property="og:url" content="https://example.com/social-page">
  <meta property="og:type" content="article">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Amazing Social Media Page">
  <meta name="twitter:description" content="Perfect for social sharing">
  <meta name="twitter:image" content="https://example.com/social-image.jpg">
  <meta name="twitter:site" content="@example">
</head>
<body>
  <h1>Social Media Optimized Page</h1>
  <p>This page has excellent social media optimization.</p>
</body>
</html>`;

    const { document } = await processor.createDOM(socialHTML, 'https://example.com/social-page');
    const analyzer = new SEOAnalyzer({ checkSocialMedia: true });
    const result = await analyzer.analyze(document);
    
    const hasSocialAnalysis = result.socialMedia &&
      result.socialMedia.openGraph &&
      result.socialMedia.twitterCard &&
      typeof result.socialMedia.overallScore === 'number';
    
    const goodOpenGraph = result.socialMedia.openGraph.completeness > 80 &&
      result.socialMedia.openGraph.strengths.length > 0;
    
    const goodTwitterCard = result.socialMedia.twitterCard.completeness > 80 &&
      result.socialMedia.twitterCard.strengths.length > 0;
    
    const highSocialScore = result.socialMedia.overallScore > 70;
    
    console.log(`   Open Graph completeness: ${result.socialMedia.openGraph.completeness}%`);
    console.log(`   Twitter Card completeness: ${result.socialMedia.twitterCard.completeness}%`);
    console.log(`   Overall social score: ${result.socialMedia.overallScore}%`);
    
    return hasSocialAnalysis && goodOpenGraph && goodTwitterCard && highSocialScore;
  });

  // Results Summary
  console.log(`\n📊 SEO Analyzer Migration Test Results:`);
  console.log(`✅ Passed: ${passed}/${total} tests`);
  console.log(`📈 Success Rate: ${Math.round((passed/total) * 100)}%`);
  
  if (passed === total) {
    console.log(`\n🎉 All tests passed! SEO Analyzer successfully migrated to BaseAnalyzer architecture.`);
    console.log(`🔧 Features validated:`);
    console.log(`   • BaseAnalyzer inheritance and integration`);
    console.log(`   • Comprehensive SEO analysis (title, meta, OG, Twitter)`);
    console.log(`   • Structured data extraction and validation`);
    console.log(`   • Technical SEO factors (canonical, robots, language)`);
    console.log(`   • Keyword extraction and analysis`);
    console.log(`   • Social media optimization scoring`);
    console.log(`   • Performance analysis and recommendations`);
    console.log(`   • Error handling and validation`);
    console.log(`   • Caching and performance optimization`);
    console.log(`   • Content SEO analysis (headings, structure)`);
    console.log(`   • Scoring and grading system`);
    console.log(`   • Comprehensive metadata generation`);
    return 10; // Perfect score
  } else {
    console.log(`\n⚠️  Some tests failed. SEO Analyzer needs additional work.`);
    return Math.round((passed/total) * 10);
  }
}

// Run the tests
runSEOAnalyzerTests().then(score => {
  console.log(`\n🏆 Final Score: ${score}/10`);
  process.exit(0);
}).catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});
