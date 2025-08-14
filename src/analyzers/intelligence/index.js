/**
 * ============================================================================
 * INTELLIGENCE INTEGRATION INDEX
 * ============================================================================
 * 
 * Central export hub for the Cross-Analyzer Intelligence Integration system.
 * Provides easy access to all intelligence components and utilities.
 * 
 * This module serves as the main entry point for intelligence features
 * and maintains clean separation between intelligence layers.
 * 
 * @version 2.0.0
 * @author Development Team
 * @phase Next Generation Intelligence
 */

// Core Intelligence Components
export { CrossAnalyzerIntelligence } from './cross-analyzer-intelligence.js';
export { IntelligenceCoordinator } from './intelligence-coordinator.js';
export { IntelligenceAnalyticsEngine } from './intelligence-analytics.js';

// Intelligence System Factory
export class IntelligenceSystemFactory {
  /**
   * Create a complete intelligence system
   * @param {Object} options - Configuration options
   * @returns {Object} Complete intelligence system
   */
  static async createIntelligenceSystem(options = {}) {
    try {
      console.log('🏭 Creating Complete Intelligence System...');
      
      // Initialize coordinator
      const coordinator = new (await import('./intelligence-coordinator.js')).IntelligenceCoordinator();
      const coordinatorResult = await coordinator.initialize(options.coordinator);
      
      if (!coordinatorResult.success) {
        throw new Error(`Coordinator initialization failed: ${coordinatorResult.error}`);
      }
      
      // Initialize analytics engine
      const analyticsEngine = new (await import('./intelligence-analytics.js')).IntelligenceAnalyticsEngine();
      const analyticsResult = await analyticsEngine.initialize(options.analytics);
      
      if (!analyticsResult.success) {
        throw new Error(`Analytics engine initialization failed: ${analyticsResult.error}`);
      }
      
      // Create integrated system
      const intelligenceSystem = {
        coordinator,
        analyticsEngine,
        version: '2.0.0',
        phase: 'Next Generation Intelligence',
        
        // Integrated analysis method
        async performCompleteAnalysis(url, analysisOptions = {}) {
          try {
            console.log('🧠 Starting Complete Intelligence Analysis...');
            
            // Step 1: Core intelligent analysis
            const intelligentReport = await coordinator.performIntelligentAnalysis(url, analysisOptions);
            
            if (!intelligentReport.success) {
              throw new Error(`Intelligent analysis failed: ${intelligentReport.error}`);
            }
            
            // Step 2: Advanced analytics
            const analytics = await analyticsEngine.performAnalytics(
              intelligentReport.intelligence,
              intelligentReport.analysisResults,
              url
            );
            
            // Step 3: Integrate results
            const completeAnalysis = {
              // Core report
              ...intelligentReport,
              
              // Enhanced with analytics
              advancedAnalytics: analytics,
              
              // Integrated insights
              integratedInsights: this.integrateInsights(intelligentReport, analytics),
              
              // System metadata
              systemMetadata: {
                coordinatorStatus: coordinator.getCoordinatorStatus(),
                analyticsStatus: analyticsEngine.getEngineStatus(),
                integrationVersion: '2.0.0',
                completionTimestamp: new Date().toISOString()
              }
            };
            
            console.log('✅ Complete Intelligence Analysis finished');
            console.log(`🎯 Final Intelligence Score: ${completeAnalysis.analysisSummary.intelligenceScore}/100`);
            console.log(`📊 Analytics Confidence: ${analytics.analyticsConfidence?.toFixed(2) || 'N/A'}`);
            
            return completeAnalysis;
            
          } catch (error) {
            console.error('❌ Complete Intelligence Analysis failed:', error);
            return {
              success: false,
              error: error.message,
              fallback: await coordinator.generateFallbackReport(url)
            };
          }
        },
        
        // Integrate insights from both systems
        integrateInsights(intelligentReport, analytics) {
          const integrated = {
            strategicInsights: [],
            tacticalInsights: [],
            analyticsInsights: [],
            crossSystemCorrelations: []
          };
          
          // Merge strategic insights
          if (intelligentReport.intelligence?.insights?.strategicInsights) {
            integrated.strategicInsights = intelligentReport.intelligence.insights.strategicInsights;
          }
          
          // Merge tactical insights
          if (intelligentReport.intelligence?.insights?.tacticalInsights) {
            integrated.tacticalInsights = intelligentReport.intelligence.insights.tacticalInsights;
          }
          
          // Add analytics insights
          if (analytics && analytics.statisticalAnalysis?.descriptiveStats) {
            integrated.analyticsInsights.push({
              type: 'Statistical Insight',
              insight: `Performance distribution shows ${analytics.statisticalAnalysis.descriptiveStats.standardDeviation < 15 ? 'consistent' : 'variable'} results across analyzers`,
              confidence: analytics.analyticsConfidence || 0.5,
              source: 'analytics'
            });
          }
          
          // Add cross-system correlations
          if (analytics?.correlationMatrix && intelligentReport.intelligence?.correlations) {
            integrated.crossSystemCorrelations.push({
              type: 'Intelligence-Analytics Correlation',
              strength: 'moderate',
              insight: 'Intelligence patterns correlate with statistical analysis findings',
              actionable: true
            });
          }
          
          return integrated;
        },
        
        // System status
        getSystemStatus() {
          return {
            systemType: 'Complete Intelligence System',
            version: '2.0.0',
            phase: 'Next Generation Intelligence',
            coordinator: coordinator.getCoordinatorStatus(),
            analytics: analyticsEngine.getEngineStatus(),
            integrationStatus: 'operational'
          };
        }
      };
      
      console.log('✅ Complete Intelligence System created successfully');
      console.log(`🎯 Coordinator: ${coordinatorResult.analyzersRegistered} analyzers integrated`);
      console.log(`📊 Analytics: ${analyticsResult.componentsInitialized} components initialized`);
      
      return {
        success: true,
        system: intelligenceSystem,
        metadata: {
          coordinatorReady: coordinatorResult.success,
          analyticsReady: analyticsResult.success,
          systemIntegrated: true
        }
      };
      
    } catch (error) {
      console.error('❌ Intelligence System creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Intelligence Utilities
export class IntelligenceUtils {
  /**
   * Validate intelligence analysis results
   * @param {Object} analysisResult - Analysis result to validate
   * @returns {Object} Validation result
   */
  static validateAnalysisResult(analysisResult) {
    const validation = {
      isValid: false,
      score: 0,
      issues: [],
      recommendations: []
    };
    
    try {
      // Check basic structure
      if (!analysisResult || typeof analysisResult !== 'object') {
        validation.issues.push('Invalid analysis result structure');
        return validation;
      }
      
      // Check intelligence score
      if (typeof analysisResult.analysisSummary?.intelligenceScore === 'number') {
        validation.score += 25;
      } else {
        validation.issues.push('Missing or invalid intelligence score');
      }
      
      // Check analysis results
      if (analysisResult.analysisResults && typeof analysisResult.analysisResults === 'object') {
        validation.score += 25;
      } else {
        validation.issues.push('Missing analysis results');
      }
      
      // Check intelligence insights
      if (analysisResult.intelligence?.insights) {
        validation.score += 25;
      } else {
        validation.issues.push('Missing intelligence insights');
      }
      
      // Check strategic guidance
      if (analysisResult.strategicGuidance) {
        validation.score += 25;
      } else {
        validation.issues.push('Missing strategic guidance');
      }
      
      // Determine validity
      validation.isValid = validation.score >= 75;
      
      // Generate recommendations
      if (validation.score < 50) {
        validation.recommendations.push('Consider re-running analysis with updated configuration');
      }
      if (validation.issues.length > 2) {
        validation.recommendations.push('Review analyzer setup and intelligence system configuration');
      }
      
      return validation;
      
    } catch (error) {
      validation.issues.push(`Validation error: ${error.message}`);
      return validation;
    }
  }
  
  /**
   * Calculate analysis completeness
   * @param {Object} analysisResult - Analysis result
   * @returns {number} Completeness percentage
   */
  static calculateCompleteness(analysisResult) {
    let completeness = 0;
    const components = [
      'analysisSummary',
      'analysisResults', 
      'intelligence',
      'strategicGuidance',
      'advancedInsights',
      'executionMetadata'
    ];
    
    components.forEach(component => {
      if (analysisResult[component]) {
        completeness += (100 / components.length);
      }
    });
    
    return Math.round(completeness);
  }
  
  /**
   * Extract key insights from analysis
   * @param {Object} analysisResult - Analysis result
   * @returns {Array} Key insights
   */
  static extractKeyInsights(analysisResult) {
    const insights = [];
    
    try {
      // Strategic insights
      if (analysisResult.intelligence?.insights?.strategicInsights) {
        analysisResult.intelligence.insights.strategicInsights.forEach(insight => {
          if (insight.impact === 'high') {
            insights.push({
              type: 'strategic',
              priority: 'high',
              insight: insight.insight,
              source: 'intelligence'
            });
          }
        });
      }
      
      // Tactical insights
      if (analysisResult.intelligence?.insights?.tacticalInsights) {
        analysisResult.intelligence.insights.tacticalInsights.forEach(insight => {
          if (insight.actionability === 'high') {
            insights.push({
              type: 'tactical',
              priority: 'medium',
              insight: insight.insight,
              source: 'intelligence'
            });
          }
        });
      }
      
      // Analytics insights
      if (analysisResult.advancedAnalytics?.statisticalAnalysis) {
        const stats = analysisResult.advancedAnalytics.statisticalAnalysis;
        if (stats.descriptiveStats?.standardDeviation < 10) {
          insights.push({
            type: 'analytical',
            priority: 'medium',
            insight: 'Consistent performance across all analyzers indicates well-optimized site',
            source: 'analytics'
          });
        }
      }
      
      return insights;
      
    } catch (error) {
      console.error('Failed to extract insights:', error);
      return insights;
    }
  }
}

// Configuration Templates
export const IntelligenceConfig = {
  // Default configuration
  default: {
    coordinator: {
      enableIntelligentCaching: true,
      enablePredictiveAnalytics: true,
      enableCrossCorrelation: true,
      intelligenceThreshold: 60,
      maxConcurrentAnalyses: 5
    },
    analytics: {
      enableMLInsights: true,
      enableTrendAnalysis: true,
      enablePredictiveModeling: true,
      confidenceThreshold: 0.7,
      maxHistorySize: 1000
    }
  },
  
  // Performance-optimized configuration
  performance: {
    coordinator: {
      enableIntelligentCaching: true,
      enablePredictiveAnalytics: false,
      enableCrossCorrelation: true,
      intelligenceThreshold: 50,
      maxConcurrentAnalyses: 10
    },
    analytics: {
      enableMLInsights: false,
      enableTrendAnalysis: true,
      enablePredictiveModeling: false,
      confidenceThreshold: 0.6,
      maxHistorySize: 500
    }
  },
  
  // High-accuracy configuration
  accuracy: {
    coordinator: {
      enableIntelligentCaching: true,
      enablePredictiveAnalytics: true,
      enableCrossCorrelation: true,
      intelligenceThreshold: 80,
      maxConcurrentAnalyses: 3
    },
    analytics: {
      enableMLInsights: true,
      enableTrendAnalysis: true,
      enablePredictiveModeling: true,
      confidenceThreshold: 0.8,
      maxHistorySize: 2000
    }
  }
};

// System Constants
export const INTELLIGENCE_CONSTANTS = {
  VERSION: '2.0.0',
  PHASE: 'Next Generation Intelligence',
  MIN_INTELLIGENCE_SCORE: 0,
  MAX_INTELLIGENCE_SCORE: 100,
  DEFAULT_CONFIDENCE_THRESHOLD: 0.7,
  SUPPORTED_ANALYZER_CATEGORIES: [
    'core-analyzers',
    'specialized', 
    'production',
    'detectors',
    'legacy'
  ]
};

// Export default for convenience
export default {
  CrossAnalyzerIntelligence,
  IntelligenceCoordinator, 
  IntelligenceAnalyticsEngine,
  IntelligenceSystemFactory,
  IntelligenceUtils,
  IntelligenceConfig,
  INTELLIGENCE_CONSTANTS
};
