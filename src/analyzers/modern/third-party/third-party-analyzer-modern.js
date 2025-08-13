/**
 * ============================================================================
 * THIRD-PARTY ANALYZER - COMBINED APPROACH MAIN ORCHESTRATOR
 * ============================================================================
 * 
 * Advanced third-party services and dependencies analysis implementation
 * 12th Combined Approach Implementation - Phase 3 Analyzer Modernization
 * 
 * ARCHITECTURE OVERVIEW:
 * ├── GPT-5 Style Detectors (4x)
 * │   ├── ThirdPartyDetector - Service detection and categorization
 * │   ├── PerformanceImpactDetector - Performance impact assessment  
 * │   ├── PrivacyAnalysisDetector - Privacy and security implications
 * │   └── DependencyMappingDetector - Dependency relationships and analysis
 * │
 * ├── Claude AI Heuristics (3x)  
 * │   ├── ThirdPartyPerformanceAnalyzer - Performance optimization strategies
 * │   ├── ThirdPartySecurityAnalyzer - Security and privacy governance
 * │   └── ThirdPartyStrategyAnalyzer - Strategic dependency management
 * │
 * ├── Rules Engine
 * │   ├── Performance rules and thresholds
 * │   ├── Security compliance validation
 * │   └── Best practices enforcement
 * │
 * ├── AI Enhancement
 * │   ├── Intelligent service identification
 * │   ├── Impact prediction modeling
 * │   └── Optimization recommendations
 * │
 * └── Legacy Integration
 *     ├── BaseAnalyzer compliance
 *     ├── Backward compatibility
 *     └── Gradual migration support
 * 
 * CAPABILITIES:
 * - Comprehensive third-party service detection
 * - Performance impact assessment and optimization
 * - Privacy and security implications analysis
 * - Dependency mapping and relationship analysis
 * - Strategic third-party management recommendations
 * - Advanced tracking and analytics service analysis
 * - CDN and infrastructure service evaluation
 * 
 * @version 2.0.0
 * @author Development Team  
 * @integration Combined Approach Architecture
 * @created 2025-08-13
 * @updated 2025-08-13
 */

import { BaseAnalyzer } from '../../core/BaseAnalyzer.js';
import { AnalyzerCategories } from '../../core/AnalyzerInterface.js';

// GPT-5 Style Detectors
import { ThirdPartyDetector } from './detectors/third-party-detector.js';
import { PerformanceImpactDetector } from './detectors/performance-impact-detector.js';  
import { PrivacyAnalysisDetector } from './detectors/privacy-analysis-detector.js';
import { DependencyMappingDetector } from './detectors/dependency-mapping-detector.js';

// Claude AI Heuristics
import { ThirdPartyPerformanceAnalyzer } from './heuristics/third-party-performance-analyzer.js';
import { ThirdPartySecurityAnalyzer } from './heuristics/third-party-security-analyzer.js';
import { ThirdPartyStrategyAnalyzer } from './heuristics/third-party-strategy-analyzer.js';

export class ThirdPartyAnalyzerModern extends BaseAnalyzer {
  constructor(options = {}) {
    super(options);
    
    this.options = {
      // Detection Configuration
      enableServiceDetection: options.enableServiceDetection !== false,
      enablePerformanceAnalysis: options.enablePerformanceAnalysis !== false,
      enablePrivacyAnalysis: options.enablePrivacyAnalysis !== false,
      enableDependencyMapping: options.enableDependencyMapping !== false,
      
      // Heuristic Configuration  
      enablePerformanceHeuristics: options.enablePerformanceHeuristics !== false,
      enableSecurityHeuristics: options.enableSecurityHeuristics !== false,
      enableStrategyHeuristics: options.enableStrategyHeuristics !== false,
      
      // Analysis Depth
      detectionDepth: options.detectionDepth || 'comprehensive',
      analysisMode: options.analysisMode || 'production',
      optimizationLevel: options.optimizationLevel || 'balanced',
      
      // Performance Thresholds
      performanceImpactThreshold: options.performanceImpactThreshold || 0.3, // 30% impact
      privacyRiskThreshold: options.privacyRiskThreshold || 0.7, // 70% risk
      dependencyComplexityThreshold: options.dependencyComplexityThreshold || 0.6, // 60% complexity
      
      // Legacy Integration
      enableLegacySupport: options.enableLegacySupport !== false,
      preserveOriginalInterface: options.preserveOriginalInterface !== false,
      gradualMigration: options.gradualMigration !== false,
      
      ...options
    };

    this.category = AnalyzerCategories.THIRD_PARTY;
    this.name = 'ThirdPartyAnalyzer';
    this.version = '2.0.0';
    
    // Initialize GPT-5 Style Detectors
    this.detectors = {
      thirdParty: new ThirdPartyDetector({
        detectionDepth: this.options.detectionDepth,
        enableAdvancedDetection: this.options.enableServiceDetection
      }),
      
      performanceImpact: new PerformanceImpactDetector({
        impactThreshold: this.options.performanceImpactThreshold,
        enablePerformanceAnalysis: this.options.enablePerformanceAnalysis
      }),
      
      privacyAnalysis: new PrivacyAnalysisDetector({
        riskThreshold: this.options.privacyRiskThreshold,
        enablePrivacyAnalysis: this.options.enablePrivacyAnalysis
      }),
      
      dependencyMapping: new DependencyMappingDetector({
        complexityThreshold: this.options.dependencyComplexityThreshold,
        enableDependencyMapping: this.options.enableDependencyMapping
      })
    };

    // Initialize Claude AI Heuristics
    this.heuristics = {
      performance: new ThirdPartyPerformanceAnalyzer({
        optimizationLevel: this.options.optimizationLevel,
        enablePerformanceHeuristics: this.options.enablePerformanceHeuristics
      }),
      
      security: new ThirdPartySecurityAnalyzer({
        riskThreshold: this.options.privacyRiskThreshold,
        enableSecurityHeuristics: this.options.enableSecurityHeuristics
      }),
      
      strategy: new ThirdPartyStrategyAnalyzer({
        analysisMode: this.options.analysisMode,
        enableStrategyHeuristics: this.options.enableStrategyHeuristics
      })
    };

    // Analysis state management
    this.analysisState = {
      detectorResults: {},
      heuristicResults: {},
      combinedResults: {},
      errors: [],
      warnings: [],
      performance: {}
    };

    // Combined Approach configuration
    this.combinedApproach = {
      enableParallelProcessing: true,
      enableResultCaching: true,
      enableIntelligentRouting: true,
      enableAdaptiveAnalysis: true
    };
    
    console.log('🚀 Third-Party Analyzer (Combined Approach) initialized');
    console.log(`📊 Detectors: ${Object.keys(this.detectors).length}`);
    console.log(`🧠 Heuristics: ${Object.keys(this.heuristics).length}`);
  }

  /**
   * Get analyzer metadata and capabilities
   * @returns {Object} Comprehensive analyzer information
   */
  getMetadata() {
    return {
      name: this.name,
      version: this.version,
      category: this.category,
      approach: 'Combined Approach (12th Implementation)',
      
      capabilities: [
        'third_party_service_detection',
        'performance_impact_assessment',
        'privacy_security_analysis',
        'dependency_relationship_mapping',
        'strategic_optimization_planning',
        'tracking_analytics_analysis',
        'cdn_infrastructure_evaluation',
        'compliance_governance_assessment'
      ],
      
      detectors: Object.fromEntries(
        Object.entries(this.detectors).map(([key, detector]) => [
          key, detector.getMetadata ? detector.getMetadata() : { name: key, status: 'active' }
        ])
      ),
      
      heuristics: Object.fromEntries(
        Object.entries(this.heuristics).map(([key, heuristic]) => [
          key, heuristic.getMetadata ? heuristic.getMetadata() : { name: key, status: 'active' }
        ])
      ),
      
      thresholds: {
        performanceImpact: this.options.performanceImpactThreshold,
        privacyRisk: this.options.privacyRiskThreshold,
        dependencyComplexity: this.options.dependencyComplexityThreshold
      },
      
      configuration: {
        detectionDepth: this.options.detectionDepth,
        analysisMode: this.options.analysisMode,
        optimizationLevel: this.options.optimizationLevel
      },
      
      integration: {
        legacySupport: this.options.enableLegacySupport,
        baseAnalyzerCompliant: true,
        backwardCompatible: this.options.preserveOriginalInterface
      }
    };
  }

  /**
   * Main analysis orchestration method
   * @param {Object} document - Document object to analyze
   * @param {Object} context - Analysis context and configuration
   * @returns {Promise<Object>} Comprehensive third-party analysis results
   */
  async analyze(document, context = {}) {
    const startTime = Date.now();
    
    try {
      console.log('🔍 Starting Third-Party Analysis (Combined Approach)...');
      
      // Reset analysis state
      this._resetAnalysisState();
      
      // Phase 1: GPT-5 Style Detection
      const detectorResults = await this._executeDetectorPhase(document, context);
      this.analysisState.detectorResults = detectorResults;
      
      // Phase 2: Claude AI Heuristic Analysis
      const heuristicResults = await this._executeHeuristicPhase(detectorResults, context);
      this.analysisState.heuristicResults = heuristicResults;
      
      // Phase 3: Combined Results Integration
      const combinedResults = await this._executeCombinationPhase(detectorResults, heuristicResults, context);
      this.analysisState.combinedResults = combinedResults;
      
      // Phase 4: Legacy Interface Compliance
      const legacyResults = this.options.enableLegacySupport ? 
        await this._generateLegacyInterface(combinedResults, context) : null;
      
      const executionTime = Date.now() - startTime;
      this.analysisState.performance.executionTime = executionTime;
      
      console.log(`✅ Third-Party Analysis completed in ${executionTime}ms`);
      console.log(`📊 Services detected: ${combinedResults.summary?.totalServices || 0}`);
      console.log(`🎯 Performance score: ${combinedResults.scores?.performance || 'N/A'}`);
      
      return {
        // Modern Combined Approach Results
        success: true,
        timestamp: new Date().toISOString(),
        version: this.version,
        approach: 'combined',
        
        // Core Analysis Results
        detectors: detectorResults,
        heuristics: heuristicResults,
        combined: combinedResults,
        
        // Legacy Compatibility
        ...(legacyResults || {}),
        
        // Analysis Metadata
        metadata: this.getMetadata(),
        performance: this.analysisState.performance,
        state: {
          errors: this.analysisState.errors,
          warnings: this.analysisState.warnings
        },
        
        executionTime
      };
      
    } catch (error) {
      console.error('❌ Third-Party Analysis failed:', error);
      
      return this._createErrorResult(error, startTime);
    }
  }

  /**
   * Execute GPT-5 style detector phase
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Detector results
   */
  async _executeDetectorPhase(document, context) {
    console.log('🔍 Executing GPT-5 Style Detector Phase...');
    
    const results = {};
    const detectorPromises = [];
    
    // Execute detectors based on configuration
    if (this.options.enableServiceDetection) {
      detectorPromises.push(
        this._executeDetector('thirdParty', document, context)
          .then(result => ({ key: 'thirdParty', result }))
      );
    }
    
    if (this.options.enablePerformanceAnalysis) {
      detectorPromises.push(
        this._executeDetector('performanceImpact', document, context)
          .then(result => ({ key: 'performanceImpact', result }))
      );
    }
    
    if (this.options.enablePrivacyAnalysis) {
      detectorPromises.push(
        this._executeDetector('privacyAnalysis', document, context)
          .then(result => ({ key: 'privacyAnalysis', result }))
      );
    }
    
    if (this.options.enableDependencyMapping) {
      detectorPromises.push(
        this._executeDetector('dependencyMapping', document, context)
          .then(result => ({ key: 'dependencyMapping', result }))
      );
    }
    
    // Execute detectors in parallel for optimal performance
    const detectorResults = await Promise.allSettled(detectorPromises);
    
    // Process detector results
    detectorResults.forEach(promiseResult => {
      if (promiseResult.status === 'fulfilled') {
        const { key, result } = promiseResult.value;
        results[key] = result;
      } else {
        console.error(`Detector failed:`, promiseResult.reason);
        this.analysisState.errors.push({
          phase: 'detector',
          error: promiseResult.reason?.message || 'Unknown detector error'
        });
      }
    });
    
    console.log(`📊 Detector phase completed - ${Object.keys(results).length} detectors executed`);
    return results;
  }

  /**
   * Execute individual detector with error handling
   * @param {string} detectorKey - Detector key
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Detector result
   */
  async _executeDetector(detectorKey, document, context) {
    const detector = this.detectors[detectorKey];
    
    if (!detector) {
      throw new Error(`Detector '${detectorKey}' not found`);
    }
    
    const startTime = Date.now();
    
    try {
      const result = await detector.analyze(document, context);
      const executionTime = Date.now() - startTime;
      
      return {
        success: true,
        data: result,
        executionTime,
        detector: detectorKey
      };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      console.error(`❌ Detector '${detectorKey}' failed:`, error);
      
      return {
        success: false,
        error: error.message,
        executionTime,
        detector: detectorKey
      };
    }
  }

  /**
   * Execute Claude AI heuristic analysis phase
   * @param {Object} detectorResults - Results from detector phase
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Heuristic analysis results
   */
  async _executeHeuristicPhase(detectorResults, context) {
    console.log('🧠 Executing Claude AI Heuristic Phase...');
    
    const results = {};
    const heuristicPromises = [];
    
    // Prepare input for heuristics
    const heuristicInput = {
      detectorResults,
      context,
      metadata: this.getMetadata()
    };
    
    // Execute heuristics based on configuration
    if (this.options.enablePerformanceHeuristics) {
      heuristicPromises.push(
        this._executeHeuristic('performance', heuristicInput)
          .then(result => ({ key: 'performance', result }))
      );
    }
    
    if (this.options.enableSecurityHeuristics) {
      heuristicPromises.push(
        this._executeHeuristic('security', heuristicInput)
          .then(result => ({ key: 'security', result }))
      );
    }
    
    if (this.options.enableStrategyHeuristics) {
      heuristicPromises.push(
        this._executeHeuristic('strategy', heuristicInput)
          .then(result => ({ key: 'strategy', result }))
      );
    }
    
    // Execute heuristics in parallel
    const heuristicResults = await Promise.allSettled(heuristicPromises);
    
    // Process heuristic results
    heuristicResults.forEach(promiseResult => {
      if (promiseResult.status === 'fulfilled') {
        const { key, result } = promiseResult.value;
        results[key] = result;
      } else {
        console.error(`Heuristic failed:`, promiseResult.reason);
        this.analysisState.errors.push({
          phase: 'heuristic',
          error: promiseResult.reason?.message || 'Unknown heuristic error'
        });
      }
    });
    
    console.log(`🧠 Heuristic phase completed - ${Object.keys(results).length} heuristics executed`);
    return results;
  }

  /**
   * Execute individual heuristic with error handling
   * @param {string} heuristicKey - Heuristic key
   * @param {Object} input - Heuristic input data
   * @returns {Promise<Object>} Heuristic result
   */
  async _executeHeuristic(heuristicKey, input) {
    const heuristic = this.heuristics[heuristicKey];
    
    if (!heuristic) {
      throw new Error(`Heuristic '${heuristicKey}' not found`);
    }
    
    const startTime = Date.now();
    
    try {
      const result = await heuristic.analyze(input);
      const executionTime = Date.now() - startTime;
      
      return {
        success: true,
        data: result,
        executionTime,
        heuristic: heuristicKey
      };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      console.error(`❌ Heuristic '${heuristicKey}' failed:`, error);
      
      return {
        success: false,
        error: error.message,
        executionTime,
        heuristic: heuristicKey
      };
    }
  }

  /**
   * Execute combined results integration phase
   * @param {Object} detectorResults - Detector results
   * @param {Object} heuristicResults - Heuristic results
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Combined and integrated results
   */
  async _executeCombinationPhase(detectorResults, heuristicResults, context) {
    console.log('🔄 Executing Combined Results Integration...');
    
    const combined = {
      // Summary Statistics
      summary: this._generateSummary(detectorResults, heuristicResults),
      
      // Unified Scores
      scores: this._calculateUnifiedScores(detectorResults, heuristicResults),
      
      // Service Analysis
      services: this._combineServiceAnalysis(detectorResults, heuristicResults),
      
      // Performance Analysis
      performance: this._combinePerformanceAnalysis(detectorResults, heuristicResults),
      
      // Security & Privacy Analysis
      security: this._combineSecurityAnalysis(detectorResults, heuristicResults),
      
      // Dependency Analysis
      dependencies: this._combineDependencyAnalysis(detectorResults, heuristicResults),
      
      // Strategic Recommendations
      recommendations: this._combineRecommendations(detectorResults, heuristicResults),
      
      // Intelligence Insights
      intelligence: this._generateIntelligenceInsights(detectorResults, heuristicResults),
      
      // Optimization Opportunities
      optimization: this._identifyOptimizationOpportunities(detectorResults, heuristicResults)
    };
    
    console.log('✅ Combined results integration completed');
    return combined;
  }

  /**
   * Generate legacy-compatible interface results
   * @param {Object} combinedResults - Combined analysis results
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Legacy-compatible results
   */
  async _generateLegacyInterface(combinedResults, context) {
    if (!this.options.enableLegacySupport) {
      return null;
    }
    
    console.log('🔄 Generating legacy interface compatibility...');
    
    const legacyResults = {
      // Original interface fields
      scripts: {
        thirdParty: combinedResults.services?.external || [],
        internal: combinedResults.services?.internal || [],
        total: combinedResults.summary?.totalServices || 0
      },
      
      tracking: {
        analytics: combinedResults.services?.analytics || [],
        advertising: combinedResults.services?.advertising || [],
        social: combinedResults.services?.social || []
      },
      
      performanceImpact: {
        impactScore: combinedResults.scores?.performance || 0,
        totalThirdPartyScripts: combinedResults.summary?.totalServices || 0,
        estimatedLoadTime: combinedResults.performance?.estimatedLoadTime || 0,
        blockingScripts: combinedResults.performance?.blockingScripts || 0
      },
      
      privacyImplications: {
        riskLevel: this._mapPrivacyRiskLevel(combinedResults.security?.privacyRisk || 0),
        trackingServices: combinedResults.services?.tracking || [],
        dataSharingConcerns: combinedResults.security?.dataSharingConcerns || []
      },
      
      cdnUsage: {
        detected: combinedResults.services?.cdn || [],
        recommendations: combinedResults.recommendations?.cdn || []
      },
      
      // Enhanced fields for backward compatibility
      summary: combinedResults.summary,
      recommendations: combinedResults.recommendations?.immediate || []
    };
    
    // Calculate legacy score for BaseAnalyzer compatibility
    legacyResults.thirdPartyScore = this._calculateLegacyScore(combinedResults);
    
    return legacyResults;
  }

  // ============================================================================
  // HELPER METHODS - RESULT COMBINATION
  // ============================================================================

  _generateSummary(detectorResults, heuristicResults) {
    const summary = {
      totalServices: 0,
      serviceCategories: 0,
      performanceImpact: 0,
      privacyRisk: 0,
      dependencyComplexity: 0,
      optimizationOpportunities: 0
    };

    // Extract from detector results
    if (detectorResults.thirdParty?.success) {
      const data = detectorResults.thirdParty.data;
      summary.totalServices = data?.services?.total || 0;
      summary.serviceCategories = data?.categories?.length || 0;
    }

    if (detectorResults.performanceImpact?.success) {
      const data = detectorResults.performanceImpact.data;
      summary.performanceImpact = data?.overallImpact?.score || 0;
    }

    if (detectorResults.privacyAnalysis?.success) {
      const data = detectorResults.privacyAnalysis.data;
      summary.privacyRisk = data?.overallRisk?.score || 0;
    }

    if (detectorResults.dependencyMapping?.success) {
      const data = detectorResults.dependencyMapping.data;
      summary.dependencyComplexity = data?.complexity?.score || 0;
    }

    // Enhance with heuristic insights
    if (heuristicResults.performance?.success) {
      summary.optimizationOpportunities = heuristicResults.performance.data?.opportunities?.length || 0;
    }

    return summary;
  }

  _calculateUnifiedScores(detectorResults, heuristicResults) {
    const scores = {
      overall: 0,
      performance: 0,
      security: 0,
      privacy: 0,
      governance: 0
    };

    // Performance score
    if (detectorResults.performanceImpact?.success) {
      scores.performance = detectorResults.performanceImpact.data?.overallImpact?.score || 0;
    }

    // Security score  
    if (detectorResults.privacyAnalysis?.success) {
      scores.security = detectorResults.privacyAnalysis.data?.securityScore || 0;
      scores.privacy = detectorResults.privacyAnalysis.data?.privacyScore || 0;
    }

    // Governance score from strategy heuristic
    if (heuristicResults.strategy?.success) {
      scores.governance = heuristicResults.strategy.data?.governance?.score || 0;
    }

    // Calculate overall score
    const validScores = Object.values(scores).filter(score => score > 0);
    scores.overall = validScores.length > 0 ? 
      validScores.reduce((sum, score) => sum + score, 0) / validScores.length : 0;

    return scores;
  }

  _combineServiceAnalysis(detectorResults, heuristicResults) {
    const services = {
      detected: [],
      external: [],
      internal: [],
      analytics: [],
      advertising: [],
      social: [],
      cdn: [],
      tracking: [],
      categories: {}
    };

    // Extract from third-party detector
    if (detectorResults.thirdParty?.success) {
      const data = detectorResults.thirdParty.data;
      services.detected = data?.services?.detected || [];
      services.external = data?.services?.external || [];
      services.internal = data?.services?.internal || [];
      services.categories = data?.categories || {};
    }

    // Enhance with performance insights
    if (heuristicResults.performance?.success) {
      const performanceData = heuristicResults.performance.data;
      // Add performance annotations to services
      services.detected = services.detected.map(service => ({
        ...service,
        performanceImpact: this._getServicePerformanceImpact(service, performanceData)
      }));
    }

    return services;
  }

  _combinePerformanceAnalysis(detectorResults, heuristicResults) {
    const performance = {
      overallImpact: 0,
      estimatedLoadTime: 0,
      blockingScripts: 0,
      optimization: {},
      recommendations: []
    };

    // Extract from performance impact detector
    if (detectorResults.performanceImpact?.success) {
      const data = detectorResults.performanceImpact.data;
      performance.overallImpact = data?.overallImpact?.score || 0;
      performance.estimatedLoadTime = data?.timing?.estimatedLoadTime || 0;
      performance.blockingScripts = data?.blocking?.count || 0;
    }

    // Enhance with performance heuristics
    if (heuristicResults.performance?.success) {
      const heuristicData = heuristicResults.performance.data;
      performance.optimization = heuristicData?.optimization || {};
      performance.recommendations = heuristicData?.recommendations || [];
    }

    return performance;
  }

  _combineSecurityAnalysis(detectorResults, heuristicResults) {
    const security = {
      privacyRisk: 0,
      securityScore: 0,
      trackingServices: [],
      dataSharingConcerns: [],
      compliance: {},
      governance: {}
    };

    // Extract from privacy analysis detector
    if (detectorResults.privacyAnalysis?.success) {
      const data = detectorResults.privacyAnalysis.data;
      security.privacyRisk = data?.overallRisk?.score || 0;
      security.securityScore = data?.securityScore || 0;
      security.trackingServices = data?.tracking?.services || [];
      security.dataSharingConcerns = data?.privacy?.concerns || [];
    }

    // Enhance with security heuristics
    if (heuristicResults.security?.success) {
      const heuristicData = heuristicResults.security.data;
      security.compliance = heuristicData?.compliance || {};
      security.governance = heuristicData?.governance || {};
    }

    return security;
  }

  _combineDependencyAnalysis(detectorResults, heuristicResults) {
    const dependencies = {
      complexity: 0,
      relationships: [],
      criticalPath: [],
      optimization: {}
    };

    // Extract from dependency mapping detector
    if (detectorResults.dependencyMapping?.success) {
      const data = detectorResults.dependencyMapping.data;
      dependencies.complexity = data?.complexity?.score || 0;
      dependencies.relationships = data?.relationships || [];
      dependencies.criticalPath = data?.criticalPath || [];
    }

    // Enhance with strategy heuristics
    if (heuristicResults.strategy?.success) {
      const heuristicData = heuristicResults.strategy.data;
      dependencies.optimization = heuristicData?.dependencyOptimization || {};
    }

    return dependencies;
  }

  _combineRecommendations(detectorResults, heuristicResults) {
    const recommendations = {
      immediate: [],
      shortTerm: [],
      longTerm: [],
      strategic: []
    };

    // Collect recommendations from all sources
    Object.values(detectorResults).forEach(result => {
      if (result.success && result.data?.recommendations) {
        recommendations.immediate.push(...(result.data.recommendations.immediate || []));
      }
    });

    Object.values(heuristicResults).forEach(result => {
      if (result.success && result.data?.recommendations) {
        const heuristicRecs = result.data.recommendations;
        recommendations.shortTerm.push(...(heuristicRecs.shortTerm || []));
        recommendations.longTerm.push(...(heuristicRecs.longTerm || []));
        recommendations.strategic.push(...(heuristicRecs.strategic || []));
      }
    });

    return recommendations;
  }

  _generateIntelligenceInsights(detectorResults, heuristicResults) {
    const insights = {
      keyFindings: [],
      strategicInsights: [],
      riskAssessment: {},
      opportunityAnalysis: {}
    };

    // Extract intelligence from heuristics
    Object.values(heuristicResults).forEach(result => {
      if (result.success && result.data?.intelligence) {
        const intelligence = result.data.intelligence;
        insights.keyFindings.push(...(intelligence.keyFindings || []));
        insights.strategicInsights.push(...(intelligence.strategicInsights || []));
      }
    });

    return insights;
  }

  _identifyOptimizationOpportunities(detectorResults, heuristicResults) {
    const opportunities = {
      performance: [],
      security: [],
      governance: [],
      strategic: []
    };

    // Extract opportunities from heuristics
    if (heuristicResults.performance?.success) {
      opportunities.performance = heuristicResults.performance.data?.opportunities || [];
    }

    if (heuristicResults.security?.success) {
      opportunities.security = heuristicResults.security.data?.opportunities || [];
    }

    if (heuristicResults.strategy?.success) {
      opportunities.governance = heuristicResults.strategy.data?.opportunities?.governance || [];
      opportunities.strategic = heuristicResults.strategy.data?.opportunities?.strategic || [];
    }

    return opportunities;
  }

  // ============================================================================
  // HELPER METHODS - UTILITIES
  // ============================================================================

  _resetAnalysisState() {
    this.analysisState = {
      detectorResults: {},
      heuristicResults: {},
      combinedResults: {},
      errors: [],
      warnings: [],
      performance: {}
    };
  }

  _createErrorResult(error, startTime) {
    const executionTime = Date.now() - startTime;
    
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      version: this.version,
      approach: 'combined',
      executionTime,
      state: {
        errors: this.analysisState.errors,
        warnings: this.analysisState.warnings
      }
    };
  }

  _mapPrivacyRiskLevel(score) {
    if (score >= 0.8) return 'high';
    if (score >= 0.5) return 'medium';
    return 'low';
  }

  _calculateLegacyScore(combinedResults) {
    // Calculate score compatible with BaseAnalyzer expectations
    const scores = combinedResults.scores || {};
    return Math.round((scores.overall || 0) * 100);
  }

  _getServicePerformanceImpact(service, performanceData) {
    // Extract performance impact for specific service
    return performanceData?.serviceImpacts?.[service.name] || 'unknown';
  }

  // ============================================================================
  // BASEANALYZER INTERFACE METHODS
  // ============================================================================

  /**
   * BaseAnalyzer compatibility method
   * @param {Object} document - Document to analyze
   * @returns {Promise<number>} Compatibility score
   */
  async calculateScore(document) {
    try {
      const result = await this.analyze(document);
      return result.thirdPartyScore || result.combined?.scores?.overall || 0;
    } catch (error) {
      console.error('Score calculation failed:', error);
      return 0;
    }
  }

  /**
   * BaseAnalyzer compatibility method
   * @returns {string} Analyzer category
   */
  getCategory() {
    return this.category;
  }

  /**
   * BaseAnalyzer compatibility method
   * @returns {string} Analyzer name
   */
  getName() {
    return this.name;
  }
}

export default ThirdPartyAnalyzerModern;
