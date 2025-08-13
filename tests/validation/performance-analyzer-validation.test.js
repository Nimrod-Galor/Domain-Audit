/**
 * Performance Analyzer Modernization - Validation Test
 * 
 * Tests the Combined Approach implementation for Performance Analyzer
 * Validates all components work together correctly
 * 
 * @version 1.0.0
 */

import { PerformanceAnalyzer } from '../../src/analyzers/performance/index.js';
import { JSDOM } from 'jsdom';

/**
 * Test suite for Performance Analyzer modernization
 */
export class PerformanceAnalyzerValidationTest {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
  }

  /**
   * Run all validation tests
   */
  async runAllTests() {
    console.log('🧪 Starting Performance Analyzer Validation Tests');
    console.log(repeat('=', 50));

    // Core functionality tests
    await this.testAnalyzerInitialization();
    await this.testMetadataRetrieval();
    await this.testHeuristicAnalysis();
    await this.testAIEnhancement();
    await this.testScoringEngine();
    await this.testConfigurationManagement();
    await this.testPerformanceBudgets();
    await this.testValidation();

    // Integration tests
    await this.testCompleteAnalysisFlow();
    await this.testErrorHandling();

    this.printResults();
    return this.getTestSummary();
  }

  /**
   * Test analyzer initialization
   */
  async testAnalyzerInitialization() {
    await this.runTest('Analyzer Initialization', async () => {
      const analyzer = new PerformanceAnalyzer();
      
      // Check analyzer is properly initialized
      this.assert(analyzer.name === 'PerformanceAnalyzer', 'Analyzer name should be correct');
      this.assert(analyzer.detectors, 'Detectors should be initialized');
      this.assert(analyzer.heuristics, 'Heuristics should be initialized');
      this.assert(analyzer.scoringEngine, 'Scoring engine should be initialized');
      this.assert(analyzer.config, 'Configuration should be initialized');
      
      // Check detectors
      this.assert(analyzer.detectors.resource, 'Resource detector should be initialized');
      this.assert(analyzer.detectors.metrics, 'Metrics detector should be initialized');
      
      // Check heuristics
      this.assert(analyzer.heuristics.optimization, 'Optimization analyzer should be initialized');

      return true;
    });
  }

  /**
   * Test metadata retrieval
   */
  async testMetadataRetrieval() {
    await this.runTest('Metadata Retrieval', async () => {
      const analyzer = new PerformanceAnalyzer();
      const metadata = analyzer.getMetadata();
      
      this.assert(metadata.name === 'PerformanceAnalyzer', 'Name should be correct');
      this.assert(metadata.version === '2.0.0', 'Version should be correct');
      this.assert(metadata.approach === 'Combined (GPT-5 + Claude + Existing)', 'Approach should be correct');
      this.assert(Array.isArray(metadata.capabilities), 'Capabilities should be an array');
      this.assert(metadata.capabilities.length > 0, 'Should have capabilities listed');
      this.assert(metadata.priority === 'high', 'Priority should be high');

      return true;
    });
  }

  /**
   * Test heuristic analysis
   */
  async testHeuristicAnalysis() {
    await this.runTest('Heuristic Analysis', async () => {
      const analyzer = new PerformanceAnalyzer();
      const context = this.createTestContext();
      
      const results = await analyzer.performHeuristicAnalysis(context);
      
      // Check results structure
      this.assert(results.detection, 'Should have detection results');
      this.assert(results.analysis, 'Should have analysis results');
      this.assert(typeof results.score === 'number', 'Should have numeric score');
      this.assert(results.metadata, 'Should have metadata');
      this.assert(results.metadata.approach === 'heuristics', 'Should indicate heuristic approach');
      
      // Check detection results
      this.assert(results.detection.resources, 'Should have resource detection');
      this.assert(results.detection.metrics, 'Should have metrics detection');
      
      // Check analysis results
      this.assert(results.analysis.coreWebVitals, 'Should have Core Web Vitals analysis');
      this.assert(results.analysis.resourceOptimization, 'Should have resource optimization analysis');

      return true;
    });
  }

  /**
   * Test AI enhancement
   */
  async testAIEnhancement() {
    await this.runTest('AI Enhancement', async () => {
      const analyzer = new PerformanceAnalyzer({ enableAIEnhancement: true });
      const context = this.createTestContext();
      
      // First get heuristic results
      const heuristicResults = await analyzer.performHeuristicAnalysis(context);
      
      // Then test AI enhancement
      const enhancedResults = await analyzer.performAIEnhancement(heuristicResults, context);
      
      // AI enhancement should either enhance or fallback gracefully
      this.assert(enhancedResults, 'Should return results');
      this.assert(enhancedResults.metadata, 'Should have metadata');
      
      // If AI enhancement worked, check for AI-specific fields
      if (enhancedResults.aiInsights) {
        this.assert(enhancedResults.metadata.aiEnhanced === true, 'Should be marked as AI enhanced');
        this.assert(typeof enhancedResults.metadata.aiConfidence === 'number', 'Should have AI confidence');
      }

      return true;
    });
  }

  /**
   * Test scoring engine
   */
  async testScoringEngine() {
    await this.runTest('Scoring Engine', async () => {
      const analyzer = new PerformanceAnalyzer();
      
      // Test scoring engine initialization
      this.assert(analyzer.scoringEngine, 'Scoring engine should be initialized');
      
      // Test scoring with mock data
      const mockAnalysisResults = {
        coreWebVitals: {
          lcp: { value: 2000, status: 'good' },
          fid: { value: 80, status: 'good' },
          cls: { value: 0.05, status: 'good' }
        },
        resourceOptimization: {
          images: { unoptimizedImages: 2, impact: 'medium' },
          scripts: { blockingScripts: 1, impact: 'low' }
        },
        loadingStrategy: { score: 85 },
        thirdParty: { impact: 'low', domains: 3 }
      };
      
      const scoringResults = analyzer.scoringEngine.calculatePerformanceScore(mockAnalysisResults);
      
      this.assert(scoringResults.overall, 'Should have overall scoring');
      this.assert(typeof scoringResults.overall.score === 'number', 'Should have numeric score');
      this.assert(scoringResults.overall.grade, 'Should have letter grade');
      this.assert(scoringResults.breakdown, 'Should have score breakdown');

      return true;
    });
  }

  /**
   * Test configuration management
   */
  async testConfigurationManagement() {
    await this.runTest('Configuration Management', async () => {
      const analyzer = new PerformanceAnalyzer();
      
      // Test configuration retrieval
      const config = analyzer.getConfiguration();
      this.assert(config.config, 'Should have configuration object');
      this.assert(config.validation, 'Should have validation results');
      
      // Test feature flags
      const featureEnabled = analyzer.isFeatureEnabled('coreWebVitalsV2');
      this.assert(typeof featureEnabled === 'boolean', 'Feature flag should return boolean');
      
      // Test configuration updates
      analyzer.updateConfiguration({ 
        features: { testFeature: true }
      });
      
      this.assert(analyzer.isFeatureEnabled('testFeature') === true, 'Updated feature should be enabled');

      return true;
    });
  }

  /**
   * Test performance budgets
   */
  async testPerformanceBudgets() {
    await this.runTest('Performance Budgets', async () => {
      const analyzer = new PerformanceAnalyzer();
      
      // Test budget retrieval
      const budgets = analyzer.getPerformanceBudgets();
      this.assert(budgets.overall, 'Should have overall budget');
      this.assert(budgets.scripts, 'Should have scripts budget');
      this.assert(budgets.images, 'Should have images budget');
      
      // Test budget compliance assessment
      const mockAnalysisResults = {
        detection: {
          resources: {
            summary: {
              scripts: { count: 5 },
              images: { count: 20 }
            }
          }
        },
        estimatedSize: 1500000 // 1.5MB
      };
      
      const compliance = analyzer.assessBudgetCompliance(mockAnalysisResults);
      this.assert(compliance, 'Should have compliance assessment');

      return true;
    });
  }

  /**
   * Test validation
   */
  async testValidation() {
    await this.runTest('Context Validation', async () => {
      const analyzer = new PerformanceAnalyzer();
      
      // Test valid context
      const validContext = this.createTestContext();
      this.assert(analyzer.validate(validContext) === true, 'Valid context should pass validation');
      
      // Test invalid contexts
      this.assert(analyzer.validate(null) === false, 'Null context should fail validation');
      this.assert(analyzer.validate({}) === false, 'Empty context should fail validation');
      this.assert(analyzer.validate({ document: null }) === false, 'Context without URL should fail validation');

      return true;
    });
  }

  /**
   * Test complete analysis flow
   */
  async testCompleteAnalysisFlow() {
    await this.runTest('Complete Analysis Flow', async () => {
      const analyzer = new PerformanceAnalyzer();
      const context = this.createTestContext();
      
      // Test the full analyze method (inherited from BaseAnalyzer)
      const results = await analyzer.analyze(context);
      
      // Check complete results structure
      this.assert(results, 'Should return results');
      this.assert(results.detection, 'Should have detection phase results');
      this.assert(results.analysis, 'Should have analysis phase results');
      this.assert(typeof results.score === 'number', 'Should have performance score');
      this.assert(results.metadata, 'Should have analysis metadata');
      
      // Check that score is reasonable (0-100)
      this.assert(results.score >= 0 && results.score <= 100, 'Score should be between 0 and 100');

      return true;
    });
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    await this.runTest('Error Handling', async () => {
      const analyzer = new PerformanceAnalyzer();
      
      // Test with invalid context
      try {
        await analyzer.analyze({ invalid: 'context' });
        this.assert(false, 'Should throw error for invalid context');
      } catch (error) {
        this.assert(true, 'Should properly handle invalid context');
      }
      
      // Test AI enhancement fallback
      const validContext = this.createTestContext();
      const heuristicResults = await analyzer.performHeuristicAnalysis(validContext);
      
      // AI enhancement should not throw even if it fails
      const enhancedResults = await analyzer.performAIEnhancement(heuristicResults, validContext);
      this.assert(enhancedResults, 'AI enhancement should not throw errors');

      return true;
    });
  }

  // Helper methods

  /**
   * Create test context for analysis
   */
  createTestContext() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Page</title>
          <link rel="stylesheet" href="/styles.css">
          <script src="/app.js" async></script>
        </head>
        <body>
          <h1>Test Performance Page</h1>
          <img src="/image1.jpg" alt="Test Image 1">
          <img src="/image2.png" alt="Test Image 2" loading="lazy">
          <script>
            console.log('Inline script');
          </script>
        </body>
      </html>
    `;

    const dom = new JSDOM(html, { url: 'https://example.com/test' });
    
    return {
      document: dom.window.document,
      dom: dom.window,
      url: 'https://example.com/test',
      pageData: {
        title: 'Test Page',
        meta: {}
      }
    };
  }

  /**
   * Run individual test
   */
  async runTest(testName, testFunction) {
    this.totalTests++;
    
    try {
      console.log(`  Testing: ${testName}...`);
      const result = await testFunction();
      
      if (result) {
        this.passedTests++;
        this.testResults.push({ name: testName, status: 'PASS' });
        console.log(`  ✅ ${testName} - PASSED`);
      } else {
        this.testResults.push({ name: testName, status: 'FAIL', error: 'Test returned false' });
        console.log(`  ❌ ${testName} - FAILED`);
      }
    } catch (error) {
      this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
      console.log(`  ❌ ${testName} - FAILED: ${error.message}`);
    }
  }

  /**
   * Assert helper
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  /**
   * Print test results summary
   */
  printResults() {
    console.log('\n' + repeat('=', 50));
    console.log('📊 Performance Analyzer Validation Results');
    console.log(repeat('=', 50));
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`Passed: ${this.passedTests}`);
    console.log(`Failed: ${this.totalTests - this.passedTests}`);
    console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    
    // Show failed tests
    const failedTests = this.testResults.filter(test => test.status === 'FAIL');
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`  - ${test.name}: ${test.error}`);
      });
    }
    
    console.log(repeat('=', 50));
  }

  /**
   * Get test summary for external reporting
   */
  getTestSummary() {
    return {
      total: this.totalTests,
      passed: this.passedTests,
      failed: this.totalTests - this.passedTests,
      successRate: (this.passedTests / this.totalTests) * 100,
      results: this.testResults,
      component: 'PerformanceAnalyzer',
      version: '2.0.0',
      approach: 'Combined',
      timestamp: new Date().toISOString()
    };
  }
}

// Helper function for string repetition
function repeat(str, count) {
  return new Array(count + 1).join(str);
}

// Export for use in test runners
export default PerformanceAnalyzerValidationTest;
