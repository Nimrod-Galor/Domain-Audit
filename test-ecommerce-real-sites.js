/**
 * COMPREHENSIVE E-COMMERCE REAL SITE TESTING
 * Tests the complete Phase 2 E-commerce Analysis Module on actual e-commerce websites
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runCrawl } from './lib/crawler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  timeout: 30000,
  maxRetries: 2,
  outputDir: path.join(__dirname, 'test-results', 'ecommerce-real-sites'),
  verbose: true
};

// Real e-commerce test sites covering different platforms
const TEST_SITES = [
  // Shopify sites
  {
    name: 'Shopify Demo Store',
    url: 'https://checkout.shopify.com/demos',
    expectedPlatform: 'shopify',
    category: 'fashion',
    expectedFeatures: ['cart', 'checkout', 'product_schema', 'payment_integration']
  },
  {
    name: 'Allbirds (Shopify)',
    url: 'https://allbirds.com',
    expectedPlatform: 'shopify',
    category: 'footwear',
    expectedFeatures: ['cart', 'product_reviews', 'wishlist', 'product_schema']
  },
  
  // WooCommerce sites
  {
    name: 'WooCommerce Demo',
    url: 'https://demo.woothemes.com/storefront',
    expectedPlatform: 'woocommerce',
    category: 'demo',
    expectedFeatures: ['cart', 'checkout', 'product_schema']
  },
  
  // BigCommerce sites
  {
    name: 'BigCommerce Demo',
    url: 'https://cornerstone-light-demo.mybigcommerce.com',
    expectedPlatform: 'bigcommerce',
    category: 'demo',
    expectedFeatures: ['cart', 'checkout', 'product_schema']
  },
  
  // Magento sites
  {
    name: 'Magento Demo',
    url: 'https://magento2-demo.nexcess.net',
    expectedPlatform: 'magento',
    category: 'demo',
    expectedFeatures: ['cart', 'checkout', 'product_schema']
  },
  
  // Custom/Modern sites
  {
    name: 'Nike (Custom)',
    url: 'https://nike.com',
    expectedPlatform: 'custom',
    category: 'sportswear',
    expectedFeatures: ['cart', 'product_schema', 'advanced_search']
  },
  {
    name: 'Amazon (Custom)',
    url: 'https://amazon.com',
    expectedPlatform: 'custom',
    category: 'marketplace',
    expectedFeatures: ['cart', 'checkout', 'product_reviews', 'recommendations']
  }
];

class EcommerceRealSitesTester {
  constructor() {
    this.results = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      sites: {},
      summary: {
        platformDetection: { correct: 0, total: 0 },
        featureDetection: { detected: 0, total: 0 },
        performanceMetrics: [],
        errors: []
      }
    };
  }

  /**
   * Run comprehensive tests on all real e-commerce sites
   */
  async runAllTests() {
    console.log('🚀 STARTING COMPREHENSIVE E-COMMERCE REAL SITE TESTING');
    console.log('='.repeat(60));
    
    // Ensure output directory exists
    await this._ensureOutputDir();
    
    // Test each site
    for (const site of TEST_SITES) {
      await this._testSite(site);
    }
    
    // Generate comprehensive report
    await this._generateReport();
    
    console.log('\n✨ COMPREHENSIVE TESTING COMPLETE!');
    this._printSummary();
  }

  /**
   * Test individual e-commerce site
   */
  async _testSite(siteConfig) {
    console.log(`\n🔍 Testing: ${siteConfig.name}`);
    console.log(`   URL: ${siteConfig.url}`);
    console.log(`   Expected Platform: ${siteConfig.expectedPlatform}`);
    
    const startTime = Date.now();
    this.results.totalTests++;
    
    try {
      // Run audit on the site
      const auditResult = await this._runAuditWithRetry(siteConfig.url);
      const testResult = await this._analyzeResults(siteConfig, auditResult);
      
      // Store results
      this.results.sites[siteConfig.name] = {
        config: siteConfig,
        result: testResult,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
      
      if (testResult.success) {
        this.results.passedTests++;
        console.log(`   ✅ PASSED - Platform: ${testResult.detectedPlatform} (${testResult.confidence}% confidence)`);
      } else {
        this.results.failedTests++;
        console.log(`   ❌ FAILED - ${testResult.error}`);
      }
      
      // Log key findings
      this._logSiteFindings(testResult);
      
    } catch (error) {
      this.results.failedTests++;
      this.results.summary.errors.push({
        site: siteConfig.name,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      console.log(`   ❌ ERROR - ${error.message}`);
    }
  }

  /**
   * Run audit with retry mechanism
   */
  async _runAuditWithRetry(url, retries = TEST_CONFIG.maxRetries) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`   🔄 Attempt ${attempt}/${retries}`);
        
        // Extract domain from URL for the crawler
        const domain = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
        
        const result = await Promise.race([
          runCrawl(domain, 1, true), // Just crawl 1 page for testing, force new audit
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), TEST_CONFIG.timeout)
          )
        ]);
        
        return result;
        
      } catch (error) {
        if (attempt === retries) {
          throw new Error(`Failed after ${retries} attempts: ${error.message}`);
        }
        console.log(`   ⚠️  Attempt ${attempt} failed: ${error.message}`);
        await this._sleep(2000 * attempt); // Exponential backoff
      }
    }
  }

  /**
   * Analyze audit results against expectations
   */
  async _analyzeResults(siteConfig, auditResult) {
    const analysis = {
      success: false,
      detectedPlatform: 'unknown',
      confidence: 0,
      featuresFound: [],
      featuresMissing: [],
      performanceMetrics: {},
      technicalDetails: {},
      error: null
    };

    try {
      // Check if e-commerce analysis exists
      if (!auditResult.ecommerce) {
        analysis.error = 'No e-commerce analysis found in audit result';
        return analysis;
      }

      const ecommerceData = auditResult.ecommerce;
      
      // Platform detection analysis
      if (ecommerceData.platform) {
        analysis.detectedPlatform = ecommerceData.platform.name || 'unknown';
        analysis.confidence = Math.round((ecommerceData.platform.confidence || 0) * 100);
        
        // Check platform detection accuracy
        const platformMatch = this._isPlatformMatch(
          siteConfig.expectedPlatform, 
          analysis.detectedPlatform
        );
        
        if (platformMatch) {
          this.results.summary.platformDetection.correct++;
        }
        this.results.summary.platformDetection.total++;
      }
      
      // Feature detection analysis
      const detectedFeatures = this._extractDetectedFeatures(ecommerceData);
      analysis.featuresFound = detectedFeatures;
      
      // Check against expected features
      for (const expectedFeature of siteConfig.expectedFeatures) {
        if (detectedFeatures.includes(expectedFeature)) {
          this.results.summary.featureDetection.detected++;
        } else {
          analysis.featuresMissing.push(expectedFeature);
        }
        this.results.summary.featureDetection.total++;
      }
      
      // Performance metrics
      analysis.performanceMetrics = {
        totalScore: ecommerceData.totalScore || 0,
        functionalityScore: ecommerceData.functionality?.score || 0,
        userExperienceScore: ecommerceData.userExperience?.score || 0,
        technicalScore: ecommerceData.technical?.score || 0
      };
      
      // Technical details
      analysis.technicalDetails = {
        paymentMethods: ecommerceData.payments?.detected || [],
        technologies: ecommerceData.platform?.technologies || {},
        seoOptimization: ecommerceData.seo?.score || 0,
        mobileOptimization: ecommerceData.mobile?.score || 0
      };
      
      // Success criteria
      analysis.success = (
        analysis.confidence > 50 && 
        analysis.featuresFound.length > 0 &&
        analysis.performanceMetrics.totalScore > 0
      );
      
      return analysis;
      
    } catch (error) {
      analysis.error = `Analysis failed: ${error.message}`;
      return analysis;
    }
  }

  /**
   * Check if detected platform matches expected platform
   */
  _isPlatformMatch(expected, detected) {
    if (expected === detected) return true;
    
    // Handle platform variations
    const platformMappings = {
      'shopify': ['shopify', 'shopify_plus'],
      'woocommerce': ['woocommerce', 'wordpress', 'wp'],
      'custom': ['custom', 'unknown', 'nextjs', 'react', 'vue']
    };
    
    for (const [key, variations] of Object.entries(platformMappings)) {
      if (key === expected && variations.includes(detected.toLowerCase())) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Extract detected features from e-commerce data
   */
  _extractDetectedFeatures(ecommerceData) {
    const features = [];
    
    if (ecommerceData.cart?.detected) features.push('cart');
    if (ecommerceData.checkout?.detected) features.push('checkout');
    if (ecommerceData.productSchema?.detected) features.push('product_schema');
    if (ecommerceData.reviews?.detected) features.push('product_reviews');
    if (ecommerceData.payments?.detected?.length > 0) features.push('payment_integration');
    if (ecommerceData.search?.detected) features.push('advanced_search');
    if (ecommerceData.recommendations?.detected) features.push('recommendations');
    if (ecommerceData.wishlist?.detected) features.push('wishlist');
    
    return features;
  }

  /**
   * Log key findings for a site
   */
  _logSiteFindings(result) {
    if (result.technicalDetails.paymentMethods.length > 0) {
      console.log(`   💳 Payment Methods: ${result.technicalDetails.paymentMethods.join(', ')}`);
    }
    
    if (result.featuresFound.length > 0) {
      console.log(`   🎯 Features Found: ${result.featuresFound.join(', ')}`);
    }
    
    if (result.featuresMissing.length > 0) {
      console.log(`   ⚠️  Missing Features: ${result.featuresMissing.join(', ')}`);
    }
    
    console.log(`   📊 Total Score: ${result.performanceMetrics.totalScore}/100`);
  }

  /**
   * Generate comprehensive test report
   */
  async _generateReport() {
    const reportData = {
      testMetadata: {
        timestamp: new Date().toISOString(),
        totalSites: TEST_SITES.length,
        testDuration: Date.now() - this.startTime,
        testVersion: '1.0.0'
      },
      results: this.results,
      detailedAnalysis: this._generateDetailedAnalysis(),
      recommendations: this._generateRecommendations()
    };
    
    // Save JSON report
    const reportPath = path.join(TEST_CONFIG.outputDir, 'comprehensive-test-report.json');
    await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
    
    // Save human-readable report
    const readableReport = this._generateReadableReport(reportData);
    const readablePath = path.join(TEST_CONFIG.outputDir, 'test-summary.md');
    await fs.writeFile(readablePath, readableReport);
    
    console.log(`\n📄 Reports saved to: ${TEST_CONFIG.outputDir}`);
  }

  /**
   * Generate detailed analysis
   */
  _generateDetailedAnalysis() {
    const analysis = {
      platformAccuracy: (this.results.summary.platformDetection.correct / this.results.summary.platformDetection.total) * 100,
      featureDetectionRate: (this.results.summary.featureDetection.detected / this.results.summary.featureDetection.total) * 100,
      averageScore: 0,
      platformBreakdown: {},
      commonIssues: []
    };
    
    // Calculate average score
    let totalScore = 0;
    let scoreCount = 0;
    
    for (const siteResult of Object.values(this.results.sites)) {
      if (siteResult.result.performanceMetrics.totalScore > 0) {
        totalScore += siteResult.result.performanceMetrics.totalScore;
        scoreCount++;
      }
      
      // Platform breakdown
      const platform = siteResult.result.detectedPlatform;
      if (!analysis.platformBreakdown[platform]) {
        analysis.platformBreakdown[platform] = 0;
      }
      analysis.platformBreakdown[platform]++;
    }
    
    analysis.averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;
    
    return analysis;
  }

  /**
   * Generate recommendations based on test results
   */
  _generateRecommendations() {
    const recommendations = [];
    
    const platformAccuracy = (this.results.summary.platformDetection.correct / this.results.summary.platformDetection.total) * 100;
    
    if (platformAccuracy < 80) {
      recommendations.push({
        category: 'Platform Detection',
        priority: 'high',
        issue: 'Platform detection accuracy below 80%',
        solution: 'Enhance platform detection patterns and add more specific indicators'
      });
    }
    
    const featureRate = (this.results.summary.featureDetection.detected / this.results.summary.featureDetection.total) * 100;
    
    if (featureRate < 70) {
      recommendations.push({
        category: 'Feature Detection',
        priority: 'medium',
        issue: 'Feature detection rate below 70%',
        solution: 'Improve feature detection algorithms and add more comprehensive selectors'
      });
    }
    
    if (this.results.summary.errors.length > 0) {
      recommendations.push({
        category: 'Error Handling',
        priority: 'high',
        issue: `${this.results.summary.errors.length} sites failed with errors`,
        solution: 'Implement better error handling and fallback mechanisms'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate human-readable report
   */
  _generateReadableReport(reportData) {
    return `# E-commerce Real Site Testing Report

## Test Summary
- **Total Sites Tested**: ${reportData.testMetadata.totalSites}
- **Tests Passed**: ${this.results.passedTests}
- **Tests Failed**: ${this.results.failedTests}
- **Success Rate**: ${Math.round((this.results.passedTests / this.results.totalTests) * 100)}%

## Platform Detection Analysis
- **Accuracy**: ${Math.round(reportData.detailedAnalysis.platformAccuracy)}%
- **Correct Detections**: ${this.results.summary.platformDetection.correct}/${this.results.summary.platformDetection.total}

## Feature Detection Analysis
- **Detection Rate**: ${Math.round(reportData.detailedAnalysis.featureDetectionRate)}%
- **Features Detected**: ${this.results.summary.featureDetection.detected}/${this.results.summary.featureDetection.total}

## Performance Metrics
- **Average Score**: ${Math.round(reportData.detailedAnalysis.averageScore)}/100

## Site Results
${Object.entries(this.results.sites).map(([name, data]) => `
### ${name}
- **URL**: ${data.config.url}
- **Expected Platform**: ${data.config.expectedPlatform}
- **Detected Platform**: ${data.result.detectedPlatform}
- **Confidence**: ${data.result.confidence}%
- **Status**: ${data.result.success ? '✅ PASSED' : '❌ FAILED'}
- **Features Found**: ${data.result.featuresFound.join(', ') || 'None'}
- **Execution Time**: ${data.executionTime}ms
`).join('')}

## Recommendations
${reportData.recommendations.map(rec => `
### ${rec.category} (${rec.priority} priority)
- **Issue**: ${rec.issue}
- **Solution**: ${rec.solution}
`).join('')}

---
*Report generated on ${reportData.testMetadata.timestamp}*
`;
  }

  /**
   * Print test summary
   */
  _printSummary() {
    console.log('\n📊 FINAL TEST SUMMARY');
    console.log('='.repeat(40));
    console.log(`✅ Tests Passed: ${this.results.passedTests}`);
    console.log(`❌ Tests Failed: ${this.results.failedTests}`);
    console.log(`📈 Success Rate: ${Math.round((this.results.passedTests / this.results.totalTests) * 100)}%`);
    console.log(`🎯 Platform Accuracy: ${Math.round((this.results.summary.platformDetection.correct / this.results.summary.platformDetection.total) * 100)}%`);
    console.log(`🔍 Feature Detection: ${Math.round((this.results.summary.featureDetection.detected / this.results.summary.featureDetection.total) * 100)}%`);
    
    if (this.results.summary.errors.length > 0) {
      console.log(`⚠️  Errors: ${this.results.summary.errors.length}`);
    }
  }

  /**
   * Utility methods
   */
  async _ensureOutputDir() {
    await fs.mkdir(TEST_CONFIG.outputDir, { recursive: true });
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the comprehensive tests
async function main() {
  const tester = new EcommerceRealSitesTester();
  tester.startTime = Date.now();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Testing failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { EcommerceRealSitesTester };
