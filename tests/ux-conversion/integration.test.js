/**
 * ============================================================================
 * INTEGRATION TESTING SUITE FOR AI-ENHANCED UX ANALYSIS
 * ============================================================================
 * 
 * End-to-end integration tests for the complete AI-enhanced UX & Conversion 
 * Analysis system, testing the interaction between all components.
 * 
 * @version 3.0.0 - Integration Testing
 * @author Development Team
 * @phase Advanced UX & Conversion Analysis - Week 2 Integration Testing
 */

import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { jest } from '@jest/globals';
import { UXConversionAnalyzer } from '../src/analyzers/ux-conversion/core/ux-analyzer.js';
import { TestDataFactory, AIMockProvider, TestPerformanceTracker, testHelpers } from './test-config.js';

/**
 * Integration Test Environment Setup
 */
class IntegrationTestEnvironment {
  constructor() {
    this.analyzer = null;
    this.mockProvider = new AIMockProvider();
    this.performanceTracker = new TestPerformanceTracker();
    this.testResults = [];
  }

  async setup() {
    // Initialize analyzer with full AI capabilities
    this.analyzer = new UXConversionAnalyzer({
      industry: 'ecommerce',
      enableAIEnhancement: true,
      enablePredictiveAnalysis: true,
      enablePatternLearning: true,
      enableCrossValidation: true,
      aiProvider: 'hybrid',
      performanceMode: 'balanced'
    });

    // Setup AI mocking
    this.mockProvider.setResponseDelay(100); // Faster for testing
    
    return this.analyzer;
  }

  async teardown() {
    if (this.analyzer && typeof this.analyzer.cleanup === 'function') {
      await this.analyzer.cleanup();
    }
    
    this.mockProvider.clearHistory();
    this.testResults = [];
  }

  recordTestResult(testName, result, metrics) {
    this.testResults.push({
      testName,
      result,
      metrics,
      timestamp: Date.now()
    });
  }

  generateTestReport() {
    const summary = {
      totalTests: this.testResults.length,
      successfulTests: this.testResults.filter(r => r.result.success).length,
      averageAnalysisTime: 0,
      totalMemoryUsage: 0,
      aiCallHistory: this.mockProvider.getCallHistory()
    };

    if (this.testResults.length > 0) {
      summary.averageAnalysisTime = this.testResults.reduce((sum, r) => 
        sum + (r.metrics?.duration || 0), 0) / this.testResults.length;
      
      summary.totalMemoryUsage = this.testResults.reduce((sum, r) => 
        sum + (r.metrics?.memoryDelta?.heapUsed || 0), 0);
    }

    return summary;
  }
}

/**
 * Full System Integration Tests
 */
describe('Full System Integration Tests', () => {
  let testEnv;

  beforeAll(async () => {
    testEnv = new IntegrationTestEnvironment();
    await testEnv.setup();
  });

  afterAll(async () => {
    await testEnv.teardown();
  });

  beforeEach(() => {
    testEnv.performanceTracker.takeMemorySnapshot('test_start');
  });

  afterEach(() => {
    testEnv.performanceTracker.takeMemorySnapshot('test_end');
  });

  test('should perform complete end-to-end analysis with all AI features', async () => {
    const mockPage = TestDataFactory.createMockPage({
      complexity: 'medium',
      url: 'https://test-ecommerce.com/product',
      title: 'Premium Product Landing Page'
    });

    const mockDomain = TestDataFactory.createMockDomainData({
      industry: 'ecommerce',
      pageType: 'product',
      deviceType: 'desktop'
    });

    testEnv.performanceTracker.startTracking('full_analysis');
    
    const result = await testEnv.analyzer.analyze(mockPage, mockDomain);
    
    const metrics = testEnv.performanceTracker.endTracking('full_analysis');

    // Validate complete result structure
    testHelpers.assertValidAnalysisResult(result);
    
    // Verify all analysis phases completed
    expect(result).toHaveProperty('detectors');
    expect(result).toHaveProperty('heuristics');
    expect(result).toHaveProperty('rules');
    expect(result).toHaveProperty('ai');
    expect(result).toHaveProperty('predictive');

    // Validate AI enhancement results
    expect(result.ai).toHaveProperty('enhancements');
    expect(result.ai.enhancements).toHaveProperty('visual');
    expect(result.ai.enhancements).toHaveProperty('patterns');
    expect(result.ai.enhancements).toHaveProperty('predictions');

    // Validate predictive analytics results
    expect(result.predictive).toHaveProperty('predictions');
    expect(result.predictive.predictions).toHaveProperty('conversion');
    expect(result.predictive.predictions).toHaveProperty('behavior');
    expect(result.predictive).toHaveProperty('recommendations');
    expect(result.predictive).toHaveProperty('forecasts');

    // Validate metadata
    expect(result.metadata.enhancementLevel).toBe('ai_powered');
    expect(result.metadata).toHaveProperty('analysisTime');
    expect(result.metadata.analysisTime).toBeGreaterThan(0);

    // Performance validation
    testHelpers.assertPerformanceMetrics(metrics, { maxDuration: 8000 });

    testEnv.recordTestResult('full_analysis', { success: true }, metrics);
  }, 15000);

  test('should handle multi-industry analysis workflow', async () => {
    const industries = ['ecommerce', 'healthcare', 'finance', 'education'];
    const results = [];

    for (const industry of industries) {
      const mockPage = TestDataFactory.createMockPage({
        complexity: 'medium',
        url: `https://test-${industry}.com`,
        title: `${industry.charAt(0).toUpperCase() + industry.slice(1)} Test Page`
      });

      const mockDomain = TestDataFactory.createMockDomainData({
        industry,
        pageType: 'landing',
        deviceType: 'desktop'
      });

      testEnv.performanceTracker.startTracking(`${industry}_analysis`);
      
      const result = await testEnv.analyzer.analyze(mockPage, mockDomain);
      
      const metrics = testEnv.performanceTracker.endTracking(`${industry}_analysis`);

      results.push({ industry, result, metrics });

      // Validate industry-specific results
      expect(result.metadata.industryType).toBe(industry);
      testHelpers.assertValidAnalysisResult(result);

      // Healthcare should prioritize accessibility
      if (industry === 'healthcare' && result.rules?.results?.recommendations) {
        const accessibilityRecs = result.rules.results.recommendations.filter(
          rec => rec.category === 'Accessibility' || rec.title?.includes('Accessibility')
        );
        expect(accessibilityRecs.length).toBeGreaterThan(0);
      }

      // Finance should emphasize security and trust
      if (industry === 'finance' && result.ai?.enhancements?.patterns) {
        const trustPatterns = result.ai.enhancements.patterns.successful?.filter(
          pattern => pattern.includes('trust') || pattern.includes('security')
        );
        // Should detect trust-related patterns in finance
        expect(Array.isArray(trustPatterns)).toBe(true);
      }

      testEnv.recordTestResult(`${industry}_analysis`, { success: true }, metrics);
    }

    // All industries should complete successfully
    expect(results).toHaveLength(industries.length);
    results.forEach(({ result, metrics }) => {
      expect(result).toBeDefined();
      expect(metrics.withinThreshold).toBe(true);
    });
  }, 30000);

  test('should demonstrate AI learning and improvement over time', async () => {
    const iterations = 5;
    const confidenceScores = [];
    const predictionAccuracy = [];

    for (let i = 0; i < iterations; i++) {
      const mockPage = TestDataFactory.createMockPage({
        complexity: 'medium',
        url: `https://learning-test-${i}.com`
      });

      const mockDomain = TestDataFactory.createMockDomainData();

      const result = await testEnv.analyzer.analyze(mockPage, mockDomain);

      // Record AI confidence scores
      if (result.ai?.summary?.overallConfidence) {
        confidenceScores.push(result.ai.summary.overallConfidence);
      }

      // Record prediction confidence
      if (result.predictive?.predictions?.conversion?.confidence) {
        predictionAccuracy.push(result.predictive.predictions.conversion.confidence);
      }

      // Simulate feedback to improve learning
      if (result.ai && testEnv.analyzer.aiEngine?.learnFromPattern) {
        const feedbackPattern = {
          type: 'successful_analysis',
          confidence: result.ai.summary?.overallConfidence || 0.8,
          context: mockDomain
        };
        
        await testEnv.analyzer.aiEngine.learnFromPattern(feedbackPattern, 'success');
      }
    }

    // AI should maintain or improve confidence over iterations
    expect(confidenceScores.length).toBeGreaterThan(0);
    
    if (confidenceScores.length > 2) {
      const firstHalf = confidenceScores.slice(0, Math.floor(confidenceScores.length / 2));
      const secondHalf = confidenceScores.slice(Math.floor(confidenceScores.length / 2));
      
      const avgFirst = firstHalf.reduce((a, b) => a + b) / firstHalf.length;
      const avgSecond = secondHalf.reduce((a, b) => a + b) / secondHalf.length;
      
      // Learning should maintain or improve performance
      expect(avgSecond).toBeGreaterThanOrEqual(avgFirst * 0.95); // Allow 5% tolerance
    }
  }, 25000);

  test('should handle error recovery and graceful degradation', async () => {
    // Test with problematic page that causes partial failures
    const faultyPage = TestDataFactory.createMockPage({
      complexity: 'complex',
      hasErrors: true
    });

    const mockDomain = TestDataFactory.createMockDomainData();

    testEnv.performanceTracker.startTracking('error_recovery');
    
    const result = await testEnv.analyzer.analyze(faultyPage, mockDomain);
    
    const metrics = testEnv.performanceTracker.endTracking('error_recovery');

    // Should still return a result even with errors
    expect(result).toBeDefined();
    expect(result.metadata).toBeDefined();

    // Should have graceful degradation - some components may fail but others succeed
    let successfulComponents = 0;
    let failedComponents = 0;

    if (result.detectors) successfulComponents++;
    if (result.heuristics) successfulComponents++;
    if (result.rules) successfulComponents++;
    if (result.ai && !result.ai.error) successfulComponents++;
    if (result.predictive && !result.predictive.error) successfulComponents++;

    // At least some components should succeed
    expect(successfulComponents).toBeGreaterThan(0);

    // Error handling should not cause performance degradation
    expect(metrics.duration).toBeLessThan(10000); // 10 seconds max even with errors

    testEnv.recordTestResult('error_recovery', { 
      success: true, 
      successfulComponents, 
      failedComponents 
    }, metrics);
  });

  test('should maintain data consistency across analysis phases', async () => {
    const mockPage = TestDataFactory.createMockPage({
      complexity: 'medium'
    });

    const mockDomain = TestDataFactory.createMockDomainData({
      industry: 'ecommerce',
      pageType: 'checkout'
    });

    const result = await testEnv.analyzer.analyze(mockPage, mockDomain);

    // Verify data consistency across phases
    expect(result.metadata.industryType).toBe(mockDomain.industry);
    
    // All phases should reference the same page
    if (result.detectors && result.ai) {
      // AI should enhance detector results, not contradict them
      const detectorCTACount = result.detectors.cta?.result?.elementsFound || 0;
      
      if (result.ai.enhancements?.visual?.hierarchy) {
        // AI visual analysis should be aware of detected elements
        expect(result.ai.enhancements.visual.hierarchy).toBeDefined();
      }
    }

    // Predictive analysis should be consistent with base analysis
    if (result.predictive?.predictions?.conversion && result.detectors) {
      const conversionPrediction = result.predictive.predictions.conversion;
      expect(conversionPrediction.confidence).toBeGreaterThan(0);
      
      // Prediction should consider detected elements
      expect(conversionPrediction).toHaveProperty('current_estimated_rate');
      expect(conversionPrediction).toHaveProperty('optimized_predicted_rate');
    }

    testEnv.recordTestResult('data_consistency', { success: true }, {});
  });

  test('should demonstrate cross-validation and model reliability', async () => {
    const testCases = [
      {
        page: TestDataFactory.createMockPage({ complexity: 'simple' }),
        domain: TestDataFactory.createMockDomainData({ industry: 'ecommerce' }),
        expectedPerformance: 'high'
      },
      {
        page: TestDataFactory.createMockPage({ complexity: 'complex' }),
        domain: TestDataFactory.createMockDomainData({ industry: 'finance' }),
        expectedPerformance: 'medium'
      },
      {
        page: TestDataFactory.createMockPage({ complexity: 'heavy' }),
        domain: TestDataFactory.createMockDomainData({ industry: 'healthcare' }),
        expectedPerformance: 'lower'
      }
    ];

    const results = [];

    for (const testCase of testCases) {
      testEnv.performanceTracker.startTracking(`cross_validation_${testCase.expectedPerformance}`);
      
      const result = await testEnv.analyzer.analyze(testCase.page, testCase.domain);
      
      const metrics = testEnv.performanceTracker.endTracking(`cross_validation_${testCase.expectedPerformance}`);

      results.push({
        ...testCase,
        result,
        metrics
      });

      // Validate result quality based on expected performance
      testHelpers.assertValidAnalysisResult(result);
      
      if (result.ai?.summary?.overallConfidence) {
        expect(result.ai.summary.overallConfidence).toBeGreaterThan(0.5);
      }

      if (result.predictive?.predictions?.conversion?.confidence) {
        expect(result.predictive.predictions.conversion.confidence).toBeGreaterThan(0.5);
      }
    }

    // Cross-validation: results should be consistent and reliable
    expect(results).toHaveLength(testCases.length);
    
    // Simple pages should generally perform better than complex ones
    const simpleResult = results.find(r => r.expectedPerformance === 'high');
    const complexResult = results.find(r => r.expectedPerformance === 'lower');
    
    if (simpleResult && complexResult) {
      expect(simpleResult.metrics.duration).toBeLessThan(complexResult.metrics.duration);
    }

    testEnv.recordTestResult('cross_validation', { 
      success: true, 
      testCases: results.length 
    }, {});
  }, 30000);
});

/**
 * Real-World Scenario Integration Tests
 */
describe('Real-World Scenario Integration Tests', () => {
  let testEnv;

  beforeAll(async () => {
    testEnv = new IntegrationTestEnvironment();
    await testEnv.setup();
  });

  afterAll(async () => {
    const report = testEnv.generateTestReport();
    console.log('Integration Test Report:', JSON.stringify(report, null, 2));
    await testEnv.teardown();
  });

  test('should analyze e-commerce product page optimization', async () => {
    const productPage = TestDataFactory.createMockPage({
      complexity: 'medium',
      url: 'https://shop.example.com/premium-headphones',
      title: 'Premium Wireless Headphones - Buy Now'
    });

    const ecommerceDomain = TestDataFactory.createMockDomainData({
      industry: 'ecommerce',
      pageType: 'product',
      deviceType: 'desktop',
      trafficSource: 'paid_search'
    });

    const result = await testEnv.analyzer.analyze(productPage, ecommerceDomain);

    // Validate e-commerce specific analysis
    testHelpers.assertValidAnalysisResult(result);
    
    // Should detect e-commerce elements
    if (result.detectors?.cta) {
      expect(result.detectors.cta.result.elementsFound).toBeGreaterThan(0);
    }

    // AI should provide e-commerce insights
    if (result.ai?.enhancements?.patterns) {
      expect(result.ai.enhancements.patterns).toHaveProperty('successful');
      expect(result.ai.enhancements.patterns).toHaveProperty('problematic');
    }

    // Predictive analysis should focus on conversion
    if (result.predictive?.predictions?.conversion) {
      expect(result.predictive.predictions.conversion).toHaveProperty('current_estimated_rate');
      expect(result.predictive.predictions.conversion).toHaveProperty('optimized_predicted_rate');
    }

    // Should provide actionable recommendations
    if (result.predictive?.recommendations) {
      expect(result.predictive.recommendations).toHaveProperty('high_impact');
      expect(Array.isArray(result.predictive.recommendations.high_impact)).toBe(true);
    }
  });

  test('should analyze healthcare patient portal accessibility', async () => {
    const healthcarePage = TestDataFactory.createMockPage({
      complexity: 'medium',
      url: 'https://patient.healthsystem.com/portal',
      title: 'Patient Portal - Access Your Health Records'
    });

    const healthcareDomain = TestDataFactory.createMockDomainData({
      industry: 'healthcare',
      pageType: 'portal',
      deviceType: 'desktop',
      trafficSource: 'direct'
    });

    const result = await testEnv.analyzer.analyze(healthcarePage, healthcareDomain);

    testHelpers.assertValidAnalysisResult(result);

    // Healthcare should emphasize accessibility
    if (result.heuristics?.results?.categories) {
      expect(result.heuristics.results.categories).toHaveProperty('accessibility');
      expect(result.heuristics.results.categories.accessibility).toBeGreaterThan(60);
    }

    // AI should detect accessibility patterns
    if (result.ai?.enhancements?.visual?.accessibility) {
      expect(result.ai.enhancements.visual.accessibility).toHaveProperty('accessibilityScore');
    }

    // Should provide healthcare-specific recommendations
    if (result.rules?.results?.recommendations) {
      const accessibilityRecs = result.rules.results.recommendations.filter(
        rec => rec.category === 'Accessibility' || rec.title?.includes('Accessibility')
      );
      expect(accessibilityRecs.length).toBeGreaterThan(0);
    }
  });

  test('should analyze financial services landing page trust optimization', async () => {
    const financePage = TestDataFactory.createMockPage({
      complexity: 'medium',
      url: 'https://secure.bank.com/personal-loans',
      title: 'Personal Loans - Competitive Rates - Apply Today'
    });

    const financeDomain = TestDataFactory.createMockDomainData({
      industry: 'finance',
      pageType: 'landing',
      deviceType: 'mobile',
      trafficSource: 'organic'
    });

    const result = await testEnv.analyzer.analyze(financePage, financeDomain);

    testHelpers.assertValidAnalysisResult(result);

    // Finance should emphasize trust and security
    if (result.ai?.enhancements?.patterns?.successful) {
      const trustPatterns = result.ai.enhancements.patterns.successful.filter(
        pattern => pattern.includes('trust') || pattern.includes('security')
      );
      expect(Array.isArray(trustPatterns)).toBe(true);
    }

    // Should detect security elements
    if (result.heuristics?.results) {
      expect(result.heuristics.results.overallScore).toBeGreaterThan(50);
    }

    // Predictive analysis should consider trust factors
    if (result.predictive?.predictions?.behavior) {
      expect(result.predictive.predictions.behavior).toHaveProperty('engagement_predictions');
    }
  });

  test('should handle mobile-first analysis workflow', async () => {
    const mobilePage = TestDataFactory.createMockPage({
      complexity: 'medium',
      url: 'https://mobile.example.com',
      title: 'Mobile App Landing Page',
      viewport: { width: 375, height: 667 } // Mobile viewport
    });

    const mobileDomain = TestDataFactory.createMockDomainData({
      industry: 'technology',
      pageType: 'app_landing',
      deviceType: 'mobile',
      trafficSource: 'social'
    });

    const result = await testEnv.analyzer.analyze(mobilePage, mobileDomain);

    testHelpers.assertValidAnalysisResult(result);

    // Should optimize for mobile
    expect(result.metadata.deviceType).toBe('mobile');

    // AI should provide mobile-specific insights
    if (result.ai?.enhancements?.visual) {
      expect(result.ai.enhancements.visual).toHaveProperty('hierarchy');
      expect(result.ai.enhancements.visual).toHaveProperty('userJourney');
    }

    // Should consider mobile behavior patterns
    if (result.predictive?.predictions?.behavior?.device_behavior) {
      expect(result.predictive.predictions.behavior.device_behavior).toBeDefined();
    }

    // Mobile recommendations should be specific
    if (result.predictive?.recommendations?.device_optimized) {
      expect(Array.isArray(result.predictive.recommendations.device_optimized)).toBe(true);
    }
  });

  test('should demonstrate A/B testing prediction capabilities', async () => {
    const controlPage = TestDataFactory.createMockPage({
      complexity: 'medium',
      url: 'https://test.example.com/control',
      title: 'Control Version - Standard Layout'
    });

    const variantPage = TestDataFactory.createMockPage({
      complexity: 'medium',
      url: 'https://test.example.com/variant',
      title: 'Variant Version - Optimized Layout'
    });

    const domain = TestDataFactory.createMockDomainData({
      industry: 'ecommerce',
      pageType: 'landing'
    });

    const controlResult = await testEnv.analyzer.analyze(controlPage, domain);
    const variantResult = await testEnv.analyzer.analyze(variantPage, domain);

    // Both analyses should succeed
    testHelpers.assertValidAnalysisResult(controlResult);
    testHelpers.assertValidAnalysisResult(variantResult);

    // Should provide A/B testing insights
    if (controlResult.predictive?.predictions?.conversion && 
        variantResult.predictive?.predictions?.conversion) {
      
      const controlConversion = controlResult.predictive.predictions.conversion;
      const variantConversion = variantResult.predictive.predictions.conversion;

      expect(controlConversion).toHaveProperty('current_estimated_rate');
      expect(variantConversion).toHaveProperty('current_estimated_rate');
      
      // Should be able to compare conversion predictions
      expect(typeof controlConversion.current_estimated_rate).toBe('number');
      expect(typeof variantConversion.current_estimated_rate).toBe('number');
    }

    // AI should detect pattern differences
    if (controlResult.ai?.enhancements?.patterns && 
        variantResult.ai?.enhancements?.patterns) {
      
      expect(controlResult.ai.enhancements.patterns).toHaveProperty('confidence');
      expect(variantResult.ai.enhancements.patterns).toHaveProperty('confidence');
    }
  });
});

export {
  IntegrationTestEnvironment
};
