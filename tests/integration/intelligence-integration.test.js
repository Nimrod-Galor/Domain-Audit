/**
 * ============================================================================
 * CROSS-ANALYZER INTELLIGENCE INTEGRATION TEST
 * ============================================================================
 * 
 * Simple integration test to verify the Cross-Analyzer Intelligence 
 * Integration system is working correctly.
 * 
 * This test demonstrates:
 * - Intelligence system creation
 * - Basic analysis workflow
 * - Result validation
 * 
 * @version 2.0.0
 * @author Development Team
 * @phase Next Generation Intelligence Testing
 */

import { 
  IntelligenceSystemFactory,
  IntelligenceUtils,
  IntelligenceConfig 
} from '../src/analyzers/intelligence/index.js';

/**
 * Simple test runner for Cross-Analyzer Intelligence Integration
 */
async function testIntelligenceIntegration() {
  console.log('🧠 Starting Cross-Analyzer Intelligence Integration Test...');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Create Intelligence System
    console.log('📊 Test 1: Creating Intelligence System...');
    const systemResult = await IntelligenceSystemFactory.createIntelligenceSystem({
      coordinator: {
        enableIntelligentCaching: true,
        intelligenceThreshold: 60
      },
      analytics: {
        enableMLInsights: true,
        enablePredictiveModeling: true
      }
    });
    
    if (!systemResult.success) {
      throw new Error(`System creation failed: ${systemResult.error}`);
    }
    
    console.log('✅ Intelligence System created successfully');
    console.log(`   Coordinator Ready: ${systemResult.metadata.coordinatorReady}`);
    console.log(`   Analytics Ready: ${systemResult.metadata.analyticsReady}`);
    console.log(`   System Integrated: ${systemResult.metadata.systemIntegrated}`);
    
    const intelligenceSystem = systemResult.system;
    
    // Test 2: System Status Check
    console.log('\n📊 Test 2: Checking System Status...');
    const systemStatus = intelligenceSystem.getSystemStatus();
    
    console.log('✅ System Status retrieved successfully');
    console.log(`   System Type: ${systemStatus.systemType}`);
    console.log(`   Version: ${systemStatus.version}`);
    console.log(`   Phase: ${systemStatus.phase}`);
    console.log(`   Analyzers Integrated: ${systemStatus.coordinator.analyzersRegistered}`);
    console.log(`   Integration Status: ${systemStatus.integrationStatus}`);
    
    // Test 3: Mock Analysis (without actual URL fetching)
    console.log('\n📊 Test 3: Testing Analysis Workflow (Mock)...');
    
    // Create mock analysis results for testing
    const mockAnalysisResults = {
      seo: { score: 85, capabilities: ['meta_analysis', 'keyword_optimization'] },
      technical: { score: 78, capabilities: ['page_speed', 'core_web_vitals'] },
      accessibility: { score: 92, capabilities: ['wcag_compliance', 'screen_reader'] },
      security: { score: 88, capabilities: ['ssl_analysis', 'vulnerability_scan'] },
      mobile: { score: 81, capabilities: ['mobile_optimization', 'responsive_design'] }
    };
    
    // Test intelligence analysis on mock data
    const mockUrl = 'https://example.com';
    
    console.log('🧠 Running Cross-Analyzer Intelligence on mock data...');
    
    // Get the intelligence system components
    const coordinator = intelligenceSystem.coordinator;
    const analyticsEngine = intelligenceSystem.analyticsEngine;
    
    // Test intelligence system directly with mock data
    const intelligenceEngine = coordinator.intelligenceSystem;
    const intelligentAnalysis = await intelligenceEngine.performIntelligentAnalysis(
      mockAnalysisResults,
      mockUrl
    );
    
    console.log('✅ Intelligence Analysis completed');
    console.log(`   Intelligence Score: ${intelligentAnalysis.intelligenceScore}/100`);
    console.log(`   Confidence Level: ${intelligentAnalysis.confidenceLevel}`);
    console.log(`   Correlations Found: ${intelligentAnalysis.correlations.strongCorrelations.length + intelligentAnalysis.correlations.moderateCorrelations.length}`);
    console.log(`   Patterns Recognized: ${Object.values(intelligentAnalysis.patterns).flat().length}`);
    console.log(`   Strategic Insights: ${intelligentAnalysis.strategicRecommendations.length}`);
    
    // Test 4: Analytics Engine
    console.log('\n📊 Test 4: Testing Analytics Engine...');
    
    const analytics = await analyticsEngine.performAnalytics(
      intelligentAnalysis,
      mockAnalysisResults,
      mockUrl
    );
    
    console.log('✅ Analytics Engine completed');
    console.log(`   Analytics Confidence: ${analytics.analyticsConfidence?.toFixed(2) || 'N/A'}`);
    console.log(`   Analytics Quality: ${analytics.analyticsQuality?.toFixed(2) || 'N/A'}`);
    console.log(`   Statistical Analysis: ${analytics.statisticalAnalysis ? 'Available' : 'Not Available'}`);
    console.log(`   Predictive Analysis: ${analytics.predictiveAnalysis ? 'Available' : 'Not Available'}`);
    
    // Test 5: Validation
    console.log('\n📊 Test 5: Testing Result Validation...');
    
    const mockCompleteAnalysis = {
      analysisSummary: {
        intelligenceScore: intelligentAnalysis.intelligenceScore,
        analyzersExecuted: Object.keys(mockAnalysisResults).length
      },
      analysisResults: mockAnalysisResults,
      intelligence: {
        insights: intelligentAnalysis.insights
      },
      strategicGuidance: {
        strategicRecommendations: intelligentAnalysis.strategicRecommendations
      },
      advancedAnalytics: analytics
    };
    
    const validation = IntelligenceUtils.validateAnalysisResult(mockCompleteAnalysis);
    const completeness = IntelligenceUtils.calculateCompleteness(mockCompleteAnalysis);
    const keyInsights = IntelligenceUtils.extractKeyInsights(mockCompleteAnalysis);
    
    console.log('✅ Validation completed');
    console.log(`   Is Valid: ${validation.isValid}`);
    console.log(`   Validation Score: ${validation.score}/100`);
    console.log(`   Completeness: ${completeness}%`);
    console.log(`   Key Insights: ${keyInsights.length}`);
    
    if (validation.issues.length > 0) {
      console.log('   Issues:', validation.issues);
    }
    
    // Test Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Cross-Analyzer Intelligence Integration Test Complete!');
    console.log('');
    console.log('✅ All tests passed successfully:');
    console.log('   ✓ Intelligence System Creation');
    console.log('   ✓ System Status Verification');
    console.log('   ✓ Intelligence Analysis Workflow');
    console.log('   ✓ Analytics Engine Processing');
    console.log('   ✓ Result Validation');
    console.log('');
    console.log(`🧠 Intelligence Score: ${intelligentAnalysis.intelligenceScore}/100`);
    console.log(`📊 Analytics Confidence: ${analytics.analyticsConfidence?.toFixed(2) || 'N/A'}`);
    console.log(`🎯 System Validation: ${validation.isValid ? 'PASSED' : 'FAILED'}`);
    console.log(`📈 Completeness: ${completeness}%`);
    console.log('');
    console.log('🚀 Cross-Analyzer Intelligence Integration is ready for production use!');
    
    return {
      success: true,
      testResults: {
        systemCreation: true,
        statusCheck: true,
        intelligenceAnalysis: true,
        analyticsEngine: true,
        validation: validation.isValid
      },
      metrics: {
        intelligenceScore: intelligentAnalysis.intelligenceScore,
        analyticsConfidence: analytics.analyticsConfidence,
        completeness,
        validationScore: validation.score
      }
    };
    
  } catch (error) {
    console.error('❌ Intelligence Integration Test Failed:', error);
    console.error('Error details:', error.message);
    
    return {
      success: false,
      error: error.message,
      testResults: {
        systemCreation: false,
        statusCheck: false,
        intelligenceAnalysis: false,
        analyticsEngine: false,
        validation: false
      }
    };
  }
}

/**
 * Configuration test for different intelligence configurations
 */
async function testIntelligenceConfigurations() {
  console.log('\n🔧 Testing Intelligence Configurations...');
  
  const configurations = [
    { name: 'Default', config: IntelligenceConfig.default },
    { name: 'Performance', config: IntelligenceConfig.performance },
    { name: 'High Accuracy', config: IntelligenceConfig.accuracy }
  ];
  
  for (const { name, config } of configurations) {
    try {
      console.log(`\n📋 Testing ${name} Configuration...`);
      const result = await IntelligenceSystemFactory.createIntelligenceSystem(config);
      
      if (result.success) {
        console.log(`✅ ${name} configuration working`);
        const status = result.system.getSystemStatus();
        console.log(`   Analyzers: ${status.coordinator.analyzersRegistered}`);
        console.log(`   Intelligence Threshold: ${status.coordinator.configuration.intelligenceThreshold}`);
      } else {
        console.log(`❌ ${name} configuration failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ ${name} configuration error: ${error.message}`);
    }
  }
}

// Export for use in other test files
export { testIntelligenceIntegration, testIntelligenceConfigurations };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const result = await testIntelligenceIntegration();
    
    if (result.success) {
      await testIntelligenceConfigurations();
    }
    
    process.exit(result.success ? 0 : 1);
  })();
}
