/**
 * WebVitalsAnalyzer Migration Test Suite
 * Comprehensive testing of BaseAnalyzer integration and Core Web Vitals functionality
 */

import { JSDOM } from 'jsdom';
import { WebVitalsAnalyzer, WEB_VITALS_THRESHOLDS } from './src/performance/web-vitals-analyzer.js';

// Test counter
let testsPassed = 0;
let testsTotal = 0;

function test(name, fn) {
  testsTotal++;
  try {
    fn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
  }
}

function createMockDocument() {
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Test Page</title>
      <link rel="stylesheet" href="styles.css">
      <link rel="stylesheet" href="external.css">
    </head>
    <body>
      <h1>Test Page</h1>
      <img src="image1.jpg" alt="Test image">
      <img src="image2.jpg">
      <form>
        <label for="name">Name</label>
        <input type="text" id="name">
        <input type="submit" value="Submit">
      </form>
      <script src="script.js"></script>
      <script>console.log('inline');</script>
    </body>
    </html>
  `);
  return dom.window.document;
}

function createMockPageData() {
  return {
    content: {
      images: {
        total: 10,
        withoutAlt: 3
      },
      forms: {
        total: 2
      }
    },
    technical: {
      resources: {
        externalCSS: 5,
        externalJS: 8,
        inlineJS: 2,
        totalResources: 25
      }
    },
    accessibility: {
      forms: {
        total: 2,
        missingLabels: 1
      },
      focus: {
        focusableElements: 15
      }
    },
    mobileFriendliness: {
      viewport: {
        isResponsive: true
      }
    },
    performance: {
      compression: 'gzip'
    },
    responseTime: 1200,
    contentLength: 250000
  };
}

console.log('🧪 Starting WebVitalsAnalyzer Migration Tests...\n');

// 1. BaseAnalyzer Integration Tests
console.log('📋 1. BaseAnalyzer Integration Tests');

test('Should extend BaseAnalyzer', () => {
  const analyzer = new WebVitalsAnalyzer();
  if (!analyzer.measureTime || !analyzer.handleError || !analyzer.log) {
    throw new Error('Missing BaseAnalyzer methods');
  }
});

test('Should have proper metadata', () => {
  const analyzer = new WebVitalsAnalyzer();
  const metadata = analyzer.getMetadata();
  if (!metadata.name || !metadata.version || !metadata.description || !metadata.category) {
    throw new Error('Invalid metadata structure');
  }
  if (metadata.name !== 'WebVitalsAnalyzer') {
    throw new Error('Incorrect analyzer name');
  }
});

test('Should have analyze method', () => {
  const analyzer = new WebVitalsAnalyzer();
  if (typeof analyzer.analyze !== 'function') {
    throw new Error('Missing analyze method');
  }
});

// 2. Core Web Vitals Analysis Tests
console.log('\n📋 2. Core Web Vitals Analysis Tests');

test('Should calculate LCP correctly', () => {
  const analyzer = new WebVitalsAnalyzer();
  const pageData = createMockPageData();
  const lcp = analyzer._estimateLCP(pageData, 1000, 100000);
  
  if (!lcp.value || !lcp.rating || !lcp.unit) {
    throw new Error('Invalid LCP structure');
  }
  if (lcp.unit !== 'ms') {
    throw new Error('Incorrect LCP unit');
  }
  if (!lcp.factors || !lcp.threshold) {
    throw new Error('Missing LCP analysis details');
  }
});

test('Should calculate FID correctly', () => {
  const analyzer = new WebVitalsAnalyzer();
  const pageData = createMockPageData();
  const fid = analyzer._estimateFID(pageData);
  
  if (!fid.value || !fid.rating || !fid.unit) {
    throw new Error('Invalid FID structure');
  }
  if (fid.unit !== 'ms') {
    throw new Error('Incorrect FID unit');
  }
  if (!fid.factors || !fid.threshold) {
    throw new Error('Missing FID analysis details');
  }
});

test('Should calculate CLS correctly', () => {
  const analyzer = new WebVitalsAnalyzer();
  const pageData = createMockPageData();
  const cls = analyzer._estimateCLS(pageData);
  
  if (cls.value === undefined || !cls.rating || !cls.unit) {
    throw new Error('Invalid CLS structure');
  }
  if (cls.unit !== 'score') {
    throw new Error('Incorrect CLS unit');
  }
  if (!cls.factors || !cls.threshold) {
    throw new Error('Missing CLS analysis details');
  }
});

test('Should calculate FCP correctly', () => {
  const analyzer = new WebVitalsAnalyzer();
  const fcp = analyzer._estimateFCP(1000, 100000);
  
  if (!fcp.value || !fcp.rating || !fcp.unit) {
    throw new Error('Invalid FCP structure');
  }
  if (fcp.unit !== 'ms') {
    throw new Error('Incorrect FCP unit');
  }
});

test('Should calculate TTFB correctly', () => {
  const analyzer = new WebVitalsAnalyzer();
  const ttfb = analyzer._estimateTTFB(1000);
  
  if (!ttfb.value || !ttfb.rating || !ttfb.unit) {
    throw new Error('Invalid TTFB structure');
  }
  if (ttfb.unit !== 'ms') {
    throw new Error('Incorrect TTFB unit');
  }
});

test('Should calculate Speed Index correctly', () => {
  const analyzer = new WebVitalsAnalyzer();
  const pageData = createMockPageData();
  const si = analyzer._estimateSpeedIndex(pageData, 1000, 100000);
  
  if (!si.value || !si.rating || !si.unit) {
    throw new Error('Invalid Speed Index structure');
  }
  if (si.unit !== 'ms') {
    throw new Error('Incorrect Speed Index unit');
  }
});

test('Should calculate TBT correctly', () => {
  const analyzer = new WebVitalsAnalyzer();
  const pageData = createMockPageData();
  const tbt = analyzer._estimateTotalBlockingTime(pageData);
  
  if (!tbt.value || !tbt.rating || !tbt.unit) {
    throw new Error('Invalid TBT structure');
  }
  if (tbt.unit !== 'ms') {
    throw new Error('Incorrect TBT unit');
  }
});

// 3. Performance Scoring Tests
console.log('\n📋 3. Performance Scoring Tests');

test('Should calculate performance metrics correctly', () => {
  const analyzer = new WebVitalsAnalyzer();
  const pageData = createMockPageData();
  
  const analysis = {
    coreWebVitals: {
      lcp: analyzer._estimateLCP(pageData, 1000, 100000),
      fid: analyzer._estimateFID(pageData),
      cls: analyzer._estimateCLS(pageData)
    },
    additionalMetrics: {
      fcp: analyzer._estimateFCP(1000, 100000),
      ttfb: analyzer._estimateTTFB(1000),
      speedIndex: analyzer._estimateSpeedIndex(pageData, 1000, 100000),
      tbt: analyzer._estimateTotalBlockingTime(pageData)
    },
    performance: {}
  };
  
  analyzer._calculatePerformanceMetrics(analysis);
  
  if (!analysis.performance.score || !analysis.performance.overall) {
    throw new Error('Missing performance calculations');
  }
  if (analysis.performance.score < 0 || analysis.performance.score > 100) {
    throw new Error('Invalid performance score range');
  }
});

test('Should generate recommendations', () => {
  const analyzer = new WebVitalsAnalyzer();
  const pageData = createMockPageData();
  
  // Create poor metrics to trigger recommendations
  const analysis = {
    coreWebVitals: {
      lcp: { value: 5000, rating: 'poor', unit: 'ms' },
      fid: { value: 500, rating: 'poor', unit: 'ms' },
      cls: { value: 0.5, rating: 'poor', unit: 'score' }
    },
    additionalMetrics: {
      fcp: { value: 4000, rating: 'poor', unit: 'ms' },
      ttfb: { value: 2000, rating: 'poor', unit: 'ms' }
    }
  };
  
  const recommendations = analyzer._generateRecommendations(analysis, pageData);
  
  if (!Array.isArray(recommendations) || recommendations.length === 0) {
    throw new Error('Should generate recommendations for poor metrics');
  }
  
  const lcpRec = recommendations.find(r => r.type === 'lcp');
  if (!lcpRec || !lcpRec.suggestions || lcpRec.suggestions.length === 0) {
    throw new Error('Missing LCP recommendations');
  }
});

test('Should generate analysis summary', () => {
  const analyzer = new WebVitalsAnalyzer();
  const pageData = createMockPageData();
  
  const analysis = {
    coreWebVitals: {
      lcp: { value: 2000, rating: 'good', unit: 'ms' },
      fid: { value: 80, rating: 'good', unit: 'ms' },
      cls: { value: 0.05, rating: 'good', unit: 'score' }
    },
    additionalMetrics: {
      fcp: { value: 1500, rating: 'good', unit: 'ms' },
      ttfb: { value: 600, rating: 'good', unit: 'ms' },
      speedIndex: { value: 3000, rating: 'good' },
      tbt: { value: 150, rating: 'good' }
    },
    performance: {
      score: 90,
      passedVitals: 3
    },
    summary: {}
  };
  
  analyzer._generateAnalysisSummary(analysis);
  
  if (!analysis.summary.issues || !analysis.summary.strengths || !analysis.summary.optimizationOpportunities) {
    throw new Error('Missing summary components');
  }
});

// 4. Data Extraction Tests
console.log('\n📋 4. Data Extraction Tests');

test('Should extract image count', () => {
  const analyzer = new WebVitalsAnalyzer();
  const pageData = createMockPageData();
  const count = analyzer._extractImageCount(pageData);
  
  if (count !== 10) {
    throw new Error('Incorrect image count extraction');
  }
});

test('Should extract JavaScript metrics', () => {
  const analyzer = new WebVitalsAnalyzer();
  const pageData = createMockPageData();
  const metrics = analyzer._extractJavaScriptMetrics(pageData);
  
  if (!metrics.external || !metrics.inline) {
    throw new Error('Missing JavaScript metrics');
  }
  if (metrics.external !== 8 || metrics.inline !== 2) {
    throw new Error('Incorrect JavaScript metrics');
  }
});

test('Should extract CSS metrics', () => {
  const analyzer = new WebVitalsAnalyzer();
  const pageData = createMockPageData();
  const metrics = analyzer._extractCSSMetrics(pageData);
  
  if (metrics.external !== 5) {
    throw new Error('Incorrect CSS metrics extraction');
  }
});

test('Should check compression', () => {
  const analyzer = new WebVitalsAnalyzer();
  const pageData = createMockPageData();
  const hasCompression = analyzer._hasCompression(pageData);
  
  if (!hasCompression) {
    throw new Error('Should detect gzip compression');
  }
});

// 5. Rating System Tests
console.log('\n📋 5. Rating System Tests');

test('Should rate metrics correctly', () => {
  const analyzer = new WebVitalsAnalyzer();
  
  // Test LCP ratings
  const goodLCP = analyzer._getRating(2000, WEB_VITALS_THRESHOLDS.LCP);
  const needsImprovementLCP = analyzer._getRating(3000, WEB_VITALS_THRESHOLDS.LCP);
  const poorLCP = analyzer._getRating(5000, WEB_VITALS_THRESHOLDS.LCP);
  
  if (goodLCP !== 'good' || needsImprovementLCP !== 'needs-improvement' || poorLCP !== 'poor') {
    throw new Error('Incorrect LCP rating system');
  }
  
  // Test FID ratings
  const goodFID = analyzer._getRating(80, WEB_VITALS_THRESHOLDS.FID);
  const poorFID = analyzer._getRating(400, WEB_VITALS_THRESHOLDS.FID);
  
  if (goodFID !== 'good' || poorFID !== 'poor') {
    throw new Error('Incorrect FID rating system');
  }
});

// 6. Full Integration Tests
console.log('\n📋 6. Full Integration Tests');

test('Should perform complete analysis via analyzeWebVitals', () => {
  const analyzer = new WebVitalsAnalyzer();
  const pageData = createMockPageData();
  const analysis = analyzer.analyzeWebVitals(pageData, 1000, 100000);
  
  if (!analysis.coreWebVitals || !analysis.additionalMetrics || !analysis.performance) {
    throw new Error('Missing analysis components');
  }
  
  if (!analysis.recommendations || !analysis.summary || !analysis.metadata) {
    throw new Error('Missing analysis details');
  }
  
  if (!analysis.coreWebVitals.lcp || !analysis.coreWebVitals.fid || !analysis.coreWebVitals.cls) {
    throw new Error('Missing Core Web Vitals');
  }
});

test('Should perform complete analysis via analyze method', async () => {
  const analyzer = new WebVitalsAnalyzer();
  const document = createMockDocument();
  const pageData = createMockPageData();
  
  const result = await analyzer.analyze(document, pageData, 'https://example.com');
  
  if (!result.success) {
    throw new Error('Analysis should succeed');
  }
  
  // The result IS the data for WebVitalsAnalyzer (different from other analyzers)
  if (!result.coreWebVitals) {
    throw new Error('Missing Core Web Vitals in result');
  }
  
  if (!result.analysisTime || result.analysisTime <= 0) {
    throw new Error('Missing analysis time');
  }
});

test('Should handle errors gracefully', async () => {
  const analyzer = new WebVitalsAnalyzer();
  const document = createMockDocument();
  
  // Test with invalid data
  const result = await analyzer.analyze(document, null, 'https://example.com');
  
  if (!result) {
    throw new Error('Should return result object even on error');
  }
});

// 7. Threshold Compliance Tests
console.log('\n📋 7. Threshold Compliance Tests');

test('Should use correct Google thresholds', () => {
  if (WEB_VITALS_THRESHOLDS.LCP.GOOD !== 2500) {
    throw new Error('Incorrect LCP good threshold');
  }
  if (WEB_VITALS_THRESHOLDS.FID.GOOD !== 100) {
    throw new Error('Incorrect FID good threshold');
  }
  if (WEB_VITALS_THRESHOLDS.CLS.GOOD !== 0.1) {
    throw new Error('Incorrect CLS good threshold');
  }
  if (WEB_VITALS_THRESHOLDS.FCP.GOOD !== 1800) {
    throw new Error('Incorrect FCP good threshold');
  }
  if (WEB_VITALS_THRESHOLDS.TTFB.GOOD !== 800) {
    throw new Error('Incorrect TTFB good threshold');
  }
});

test('Should pass core vitals correctly', () => {
  const analyzer = new WebVitalsAnalyzer();
  
  // Test passing metrics with very optimized conditions
  const goodPageData = {
    ...createMockPageData(),
    content: { images: { total: 5, withoutAlt: 0 } },
    technical: { resources: { externalCSS: 2, externalJS: 1, inlineJS: 0, totalResources: 10 } }, // Reduced JS
    mobileFriendliness: { viewport: { isResponsive: true } },
    accessibility: { forms: { missingLabels: 0, total: 1 }, focus: { focusableElements: 20 } }, // Reduced elements
    performance: { compression: 'gzip' }
  };
  
  const lcp = analyzer._estimateLCP(goodPageData, 600, 30000); // Faster response, smaller size
  const fid = analyzer._estimateFID(goodPageData);
  const cls = analyzer._estimateCLS(goodPageData);
  
  if (!lcp.passed || !fid.passed || !cls.passed) {
    console.log('LCP:', lcp.value, 'ms, passed:', lcp.passed);
    console.log('FID:', fid.value, 'ms, passed:', fid.passed);
    console.log('CLS:', cls.value, ', passed:', cls.passed);
    throw new Error('Optimized metrics should pass Core Web Vitals');
  }
});

// 8. Edge Cases Tests
console.log('\n📋 8. Edge Cases Tests');

test('Should handle empty page data', () => {
  const analyzer = new WebVitalsAnalyzer();
  const emptyData = {};
  
  const lcp = analyzer._estimateLCP(emptyData, 1000, 100000);
  const fid = analyzer._estimateFID(emptyData);
  const cls = analyzer._estimateCLS(emptyData);
  
  if (!lcp.value || !fid.value || cls.value === undefined) {
    throw new Error('Should handle empty data gracefully');
  }
});

test('Should handle missing nested properties', () => {
  const analyzer = new WebVitalsAnalyzer();
  const partialData = { content: {} };
  
  const imageCount = analyzer._extractImageCount(partialData);
  const jsMetrics = analyzer._extractJavaScriptMetrics(partialData);
  
  if (imageCount !== 0 || jsMetrics.external !== 0) {
    throw new Error('Should default to 0 for missing properties');
  }
});

test('Should handle extreme values', () => {
  const analyzer = new WebVitalsAnalyzer();
  
  // Test very large values
  const extremeData = {
    content: { images: { total: 1000, withoutAlt: 500 } },
    technical: { resources: { externalCSS: 100, externalJS: 200 } }
  };
  
  const lcp = analyzer._estimateLCP(extremeData, 10000, 10000000);
  
  if (!lcp.value || lcp.value < 0) {
    throw new Error('Should handle extreme values properly');
  }
});

console.log('\n🏁 Test Summary');
console.log(`✅ Passed: ${testsPassed}/${testsTotal}`);
console.log(`❌ Failed: ${testsTotal - testsPassed}/${testsTotal}`);

if (testsPassed === testsTotal) {
  console.log('\n🎉 All WebVitalsAnalyzer migration tests passed! BaseAnalyzer integration successful.');
} else {
  console.log('\n⚠️ Some tests failed. Please review the WebVitalsAnalyzer implementation.');
  process.exit(1);
}
