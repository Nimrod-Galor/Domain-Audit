/**
 * ============================================================================
 * E-COMMERCE ANALYZER MODERN - COMBINED APPROACH
 * ============================================================================
 * 
 * Comprehensive e-commerce optimization analysis using the Combined Approach:
 * - GPT-5 Style Detectors for comprehensive data detection
 * - Claude AI Heuristics for advanced business intelligence
 * - Rules Engine for compliance and optimization scoring
 * - AI Enhancement for predictive analysis and recommendations
 * 
 * E-commerce Analysis Domains:
 * - Platform Detection & Analysis
 * - Product Catalog Optimization
 * - Shopping Cart & Checkout Analysis
 * - Payment Security & Trust Signals
 * - Conversion Rate Optimization
 * - Customer Experience Analysis
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration Combined Approach (13th Implementation)
 * @created 2025-08-13
 */

import { BaseAnalyzer } from '../../core/BaseAnalyzer.js';

// GPT-5 Style Detectors
import EcommercePlatformDetector from './detectors/ecommerce-platform-detector.js';
import ProductCatalogDetector from './detectors/product-catalog-detector.js';
import ShoppingCartDetector from './detectors/shopping-cart-detector.js';
import CheckoutProcessDetector from './detectors/checkout-process-detector.js';
import PaymentSecurityDetector from './detectors/payment-security-detector.js';
import ConversionElementsDetector from './detectors/conversion-elements-detector.js';

// Claude AI Heuristics
import EcommercePerformanceAnalyzer from './heuristics/ecommerce-performance-analyzer.js';
import EcommerceSecurityAnalyzer from './heuristics/ecommerce-security-analyzer.js';
import EcommerceStrategyAnalyzer from './heuristics/ecommerce-strategy-analyzer.js';

// Rules Engine
import EcommerceRulesEngine from './rules/ecommerce-rules-engine.js';

// AI Enhancement
import EcommerceAIEnhancement from './ai/ecommerce-ai-enhancement.js';

// Configuration Management
import EcommerceAnalyzerConfiguration from './config/ecommerce-analyzer-configuration.js';

// Legacy Integration
import { EcommerceAnalyzer } from '../../ecommerce/EcommerceAnalyzer.js';

export class EcommerceAnalyzerModern extends BaseAnalyzer {
  constructor(options = {}) {
    super('EcommerceAnalyzerModern', options);
    
    this.analyzerType = 'ecommerce_analyzer_modern';
    this.version = '1.0.0';
    
    // Configuration Management
    this.config = new EcommerceAnalyzerConfiguration(options);
    
    // GPT-5 Style Detectors
    this.detectors = {
      platform: new EcommercePlatformDetector(this.config.getComponentConfiguration('platform-detector')),
      productCatalog: new ProductCatalogDetector(this.config.getComponentConfiguration('product-catalog-detector')),
      shoppingCart: new ShoppingCartDetector(this.config.getComponentConfiguration('platform-detector')),
      checkoutProcess: new CheckoutProcessDetector(this.config.getComponentConfiguration('platform-detector')),
      paymentSecurity: new PaymentSecurityDetector(this.config.getComponentConfiguration('platform-detector')),
      conversionElements: new ConversionElementsDetector(this.config.getComponentConfiguration('platform-detector'))
    };
    
    // Claude AI Heuristics
    this.heuristics = {
      performance: new EcommercePerformanceAnalyzer(this.config.getComponentConfiguration('performance-analyzer')),
      security: new EcommerceSecurityAnalyzer(this.config.getComponentConfiguration('security-analyzer')),
      strategy: new EcommerceStrategyAnalyzer(this.config.getComponentConfiguration('strategy-analyzer'))
    };
    
    // Rules Engine for compliance and optimization scoring
    this.rulesEngine = new EcommerceRulesEngine(this.config.getComponentConfiguration('rules-engine'));
    
    // AI Enhancement for predictive analysis
    this.aiEnhancer = new EcommerceAIEnhancement(this.config.getComponentConfiguration('ai-enhancement'));
    
    // Legacy Components for backward compatibility
    this.legacyAnalyzer = new EcommerceAnalyzer(options);
    
    // Analysis state
    this.analysisState = {
      phase: null,
      startTime: null,
      detectionResults: null,
      heuristicResults: null,
      rulesResults: null,
      aiResults: null,
      legacyResults: null
    };
    
    console.log('🛒 E-commerce Analyzer Modern initialized with Combined Approach');
  }

  /**
   * Get analyzer metadata and capabilities
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'EcommerceAnalyzerModern',
      type: this.analyzerType,
      version: this.version,
      description: 'Modern e-commerce optimization analysis using Combined Approach methodology',
      
      capabilities: [
        'platform_detection_analysis',
        'product_catalog_optimization',
        'shopping_cart_analysis',
        'checkout_process_optimization',
        'payment_security_assessment',
        'conversion_rate_optimization',
        'customer_experience_analysis',
        'business_intelligence_insights'
      ],
      
      analysisPhases: [
        'detection_phase_gpt5_detectors',
        'heuristic_analysis_claude_ai',
        'rules_engine_compliance_scoring',
        'ai_enhancement_predictive_analysis',
        'legacy_integration_compatibility',
        'orchestration_combined_results'
      ],
      
      detectors: {
        platform: this.detectors.platform.getMetadata(),
        productCatalog: this.detectors.productCatalog.getMetadata(),
        shoppingCart: this.detectors.shoppingCart.getMetadata(),
        checkoutProcess: this.detectors.checkoutProcess.getMetadata(),
        paymentSecurity: this.detectors.paymentSecurity.getMetadata(),
        conversionElements: this.detectors.conversionElements.getMetadata()
      },
      
      heuristics: {
        performance: this.heuristics.performance.getMetadata(),
        security: this.heuristics.security.getMetadata(),
        strategy: this.heuristics.strategy.getMetadata()
      },
      
      configuration: this.config.getConfiguration(),
      
      approach: 'Combined Approach (GPT-5 Detectors + Claude AI Heuristics + Rules Engine + AI Enhancement)'
    };
  }

  /**
   * Main analysis method implementing the Combined Approach
   * @param {Object} context - Analysis context containing DOM, URL, and page data
   * @returns {Promise<Object>} Comprehensive e-commerce analysis results
   */
  async analyze(context) {
    const startTime = Date.now();
    this.analysisState.startTime = startTime;
    this.analysisState.phase = 'initialization';

    try {
      this.logInfo('🛒 Starting E-commerce Combined Approach analysis...');
      
      // Validate analysis context
      if (!this.validate(context)) {
        throw new Error('Invalid context provided for e-commerce analysis');
      }

      // Phase 1: Run GPT-5 Style Detection Phase
      this.analysisState.phase = 'detection';
      const detectionResults = await this._runDetectionPhase(context);
      this.analysisState.detectionResults = detectionResults;

      // Phase 2: Run Claude AI Heuristic Analysis Phase
      this.analysisState.phase = 'heuristic_analysis';
      const heuristicResults = await this._runHeuristicAnalysisPhase(detectionResults, context);
      this.analysisState.heuristicResults = heuristicResults;

      // Phase 3: Run Rules Engine Compliance and Scoring Phase
      this.analysisState.phase = 'rules_engine';
      const rulesResults = await this._runRulesEnginePhase(heuristicResults, context);
      this.analysisState.rulesResults = rulesResults;

      // Phase 4: Run AI Enhancement Phase
      this.analysisState.phase = 'ai_enhancement';
      const aiResults = await this._runAIEnhancementPhase(rulesResults, context);
      this.analysisState.aiResults = aiResults;

      // Phase 5: Run Legacy Integration Phase
      this.analysisState.phase = 'legacy_integration';
      const legacyResults = await this._runLegacyIntegrationPhase(context);
      this.analysisState.legacyResults = legacyResults;

      // Phase 6: Orchestrate Combined Results
      this.analysisState.phase = 'orchestration';
      const combinedResults = await this._orchestrateCombinedResults({
        detection: detectionResults,
        heuristics: heuristicResults,
        rules: rulesResults,
        ai: aiResults,
        legacy: legacyResults
      });

      const executionTime = Date.now() - startTime;
      this.analysisState.phase = 'completed';

      this.logInfo(`✅ E-commerce Combined Approach analysis completed in ${executionTime}ms`);
      this.logInfo(`🛒 Platform detected: ${combinedResults.summary?.platformDetected || 'Unknown'}`);
      this.logInfo(`📊 E-commerce score: ${combinedResults.summary?.overallScore || 0}/100`);
      
      return {
        success: true,
        analyzer: this.analyzerType,
        version: this.version,
        ...combinedResults,
        executionTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logError('E-commerce Combined Approach analysis failed', error);
      
      return {
        success: false,
        error: error.message,
        analyzer: this.analyzerType,
        version: this.version,
        phase: this.analysisState.phase,
        executionTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Phase 1: Run GPT-5 Style Detection Phase
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Detection results from all detectors
   */
  async _runDetectionPhase(context) {
    const startTime = Date.now();
    
    this.logInfo('  🔍 Phase 1: Running GPT-5 Style Detectors...');
    
    const detectionResults = {
      success: true,
      phase: 'detection',
      results: {},
      summary: {}
    };

    try {
      // Run all detectors in parallel for optimal performance
      const detectorPromises = {
        platform: this.detectors.platform.detect(context),
        productCatalog: this.detectors.productCatalog.detect(context),
        shoppingCart: this.detectors.shoppingCart.detect(context),
        checkoutProcess: this.detectors.checkoutProcess.detect(context),
        paymentSecurity: this.detectors.paymentSecurity.detect(context),
        conversionElements: this.detectors.conversionElements.detect(context)
      };

      const detectorResults = await Promise.allSettled(Object.entries(detectorPromises).map(
        async ([name, promise]) => {
          try {
            const result = await promise;
            return { name, result, success: true };
          } catch (error) {
            this.logError(`Detector ${name} failed`, error);
            return { name, result: null, success: false, error: error.message };
          }
        }
      ));

      // Process detector results
      detectorResults.forEach(({ name, result, success, error }) => {
        if (success && result) {
          detectionResults.results[name] = result;
        } else {
          detectionResults.results[name] = { error: error || 'Detection failed' };
        }
      });

      // Generate detection summary
      detectionResults.summary = this._generateDetectionSummary(detectionResults.results);
      
      const executionTime = Date.now() - startTime;
      detectionResults.executionTime = executionTime;
      
      this.logInfo(`  ✅ Detection phase completed in ${executionTime}ms`);
      this.logInfo(`  🛒 Platform: ${detectionResults.summary.platformDetected || 'Unknown'}`);
      this.logInfo(`  📦 Products: ${detectionResults.summary.productCount || 0} detected`);
      
      return detectionResults;

    } catch (error) {
      detectionResults.success = false;
      detectionResults.error = error.message;
      detectionResults.executionTime = Date.now() - startTime;
      
      this.logError('Detection phase failed', error);
      return detectionResults;
    }
  }

  /**
   * Phase 2: Run Claude AI Heuristic Analysis Phase
   * @param {Object} detectionResults - Results from detection phase
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Heuristic analysis results
   */
  async _runHeuristicAnalysisPhase(detectionResults, context) {
    const startTime = Date.now();
    
    this.logInfo('  🧠 Phase 2: Running Claude AI Heuristic Analysis...');
    
    const heuristicResults = {
      success: true,
      phase: 'heuristic_analysis',
      results: {},
      insights: {}
    };

    try {
      // Run heuristic analyzers in parallel
      const heuristicPromises = {
        performance: this.heuristics.performance.analyze(detectionResults, context),
        security: this.heuristics.security.analyze(detectionResults, context),
        strategy: this.heuristics.strategy.analyze(detectionResults, context)
      };

      const heuristicAnalysisResults = await Promise.allSettled(Object.entries(heuristicPromises).map(
        async ([name, promise]) => {
          try {
            const result = await promise;
            return { name, result, success: true };
          } catch (error) {
            this.logError(`Heuristic analyzer ${name} failed`, error);
            return { name, result: null, success: false, error: error.message };
          }
        }
      ));

      // Process heuristic results
      heuristicAnalysisResults.forEach(({ name, result, success, error }) => {
        if (success && result) {
          heuristicResults.results[name] = result;
        } else {
          heuristicResults.results[name] = { error: error || 'Heuristic analysis failed' };
        }
      });

      // Generate heuristic insights
      heuristicResults.insights = this._generateHeuristicInsights(heuristicResults.results);
      
      const executionTime = Date.now() - startTime;
      heuristicResults.executionTime = executionTime;
      
      this.logInfo(`  ✅ Heuristic analysis completed in ${executionTime}ms`);
      this.logInfo(`  📈 Performance insights: ${heuristicResults.insights.performanceScore || 0}/100`);
      this.logInfo(`  🔒 Security insights: ${heuristicResults.insights.securityScore || 0}/100`);
      
      return heuristicResults;

    } catch (error) {
      heuristicResults.success = false;
      heuristicResults.error = error.message;
      heuristicResults.executionTime = Date.now() - startTime;
      
      this.logError('Heuristic analysis phase failed', error);
      return heuristicResults;
    }
  }

  /**
   * Phase 3: Run Rules Engine Compliance and Scoring Phase
   * @param {Object} heuristicResults - Results from heuristic analysis
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Rules engine results
   */
  async _runRulesEnginePhase(heuristicResults, context) {
    const startTime = Date.now();
    
    this.logInfo('  📊 Phase 3: Running Rules Engine Compliance Scoring...');
    
    try {
      const rulesResults = await this.rulesEngine.evaluate(
        this.analysisState.detectionResults,
        heuristicResults, 
        context
      );
      
      const executionTime = Date.now() - startTime;
      rulesResults.executionTime = executionTime;
      
      this.logInfo(`  ✅ Rules engine completed in ${executionTime}ms`);
      this.logInfo(`  📋 Compliance score: ${rulesResults.summary?.complianceScore || 0}/100`);
      
      return rulesResults;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logError('Rules engine phase failed', error);
      
      return {
        success: false,
        error: error.message,
        phase: 'rules_engine',
        executionTime
      };
    }
  }

  /**
   * Phase 4: Run AI Enhancement Phase
   * @param {Object} rulesResults - Results from rules engine
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} AI enhancement results
   */
  async _runAIEnhancementPhase(rulesResults, context) {
    const startTime = Date.now();
    
    this.logInfo('  🤖 Phase 4: Running AI Enhancement Analysis...');
    
    try {
      const aiResults = await this.aiEnhancer.enhance(
        this.analysisState.detectionResults,
        this.analysisState.heuristicResults, 
        rulesResults, 
        context
      );
      
      const executionTime = Date.now() - startTime;
      aiResults.executionTime = executionTime;
      
      this.logInfo(`  ✅ AI enhancement completed in ${executionTime}ms`);
      this.logInfo(`  🎯 AI recommendations: ${aiResults.recommendations?.length || 0} generated`);
      
      return aiResults;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logError('AI enhancement phase failed', error);
      
      return {
        success: false,
        error: error.message,
        phase: 'ai_enhancement',
        executionTime
      };
    }
  }

  /**
   * Phase 5: Run Legacy Integration Phase
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Legacy integration results
   */
  async _runLegacyIntegrationPhase(context) {
    const startTime = Date.now();
    
    this.logInfo('  🔗 Phase 5: Running Legacy Integration...');
    
    try {
      const legacyResults = await this.legacyAnalyzer.analyze(context);
      
      const executionTime = Date.now() - startTime;
      
      this.logInfo(`  ✅ Legacy integration completed in ${executionTime}ms`);
      
      return {
        success: true,
        results: legacyResults,
        executionTime,
        compatibility: 'full'
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logError('Legacy integration failed', error);
      
      return {
        success: false,
        error: error.message,
        executionTime,
        compatibility: 'limited'
      };
    }
  }

  /**
   * Phase 6: Orchestrate Combined Results
   * @param {Object} allResults - Results from all analysis phases
   * @returns {Promise<Object>} Orchestrated combined results
   */
  async _orchestrateCombinedResults(allResults) {
    const startTime = Date.now();
    
    this.logInfo('  🎼 Phase 6: Orchestrating Combined Results...');
    
    try {
      // Aggregate e-commerce data from all phases
      const aggregatedData = this._aggregateEcommerceData(allResults);
      
      // Calculate comprehensive scoring
      const comprehensiveScoring = this._calculateComprehensiveScoring(allResults);
      
      // Generate unified recommendations
      const unifiedRecommendations = this._generateUnifiedRecommendations(allResults);
      
      // Compile strategic insights
      const strategicInsights = this._compileStrategicInsights(allResults);
      
      // Generate executive summary
      const executiveSummary = this._generateExecutiveSummary({
        aggregatedData,
        comprehensiveScoring,
        unifiedRecommendations,
        strategicInsights
      });

      const orchestrationTime = Date.now() - startTime;
      
      this.logInfo(`  ✅ Results orchestration completed in ${orchestrationTime}ms`);
      
      return {
        // Core Analysis Results
        data: aggregatedData,
        scoring: comprehensiveScoring,
        recommendations: unifiedRecommendations,
        insights: strategicInsights,
        summary: executiveSummary,
        
        // Phase Results (for detailed analysis)
        phases: {
          detection: allResults.detection,
          heuristics: allResults.heuristics,
          rules: allResults.rules,
          ai: allResults.ai,
          legacy: allResults.legacy
        },
        
        // Metadata
        metadata: this.getMetadata(),
        orchestrationTime
      };

    } catch (error) {
      this.logError('Results orchestration failed', error);
      
      return {
        success: false,
        error: error.message,
        orchestrationTime: Date.now() - startTime
      };
    }
  }

  // ============================================================================
  // HELPER METHODS - RESULT PROCESSING
  // ============================================================================

  _generateDetectionSummary(detectionResults) {
    const summary = {
      detectionSuccess: true,
      platformDetected: 'Unknown',
      ecommerceType: 'Unknown',
      productCount: 0,
      hasCart: false,
      hasCheckout: false,
      hasSecurePayment: false,
      conversionElementsFound: 0
    };

    try {
      // Platform detection summary
      if (detectionResults.platform?.success) {
        summary.platformDetected = detectionResults.platform.data?.platform || 'Custom';
        summary.ecommerceType = detectionResults.platform.data?.type || 'Generic';
      }

      // Product catalog summary
      if (detectionResults.productCatalog?.success) {
        summary.productCount = detectionResults.productCatalog.data?.productCount || 0;
      }

      // Shopping cart summary
      if (detectionResults.shoppingCart?.success) {
        summary.hasCart = detectionResults.shoppingCart.data?.cartDetected || false;
      }

      // Checkout process summary
      if (detectionResults.checkoutProcess?.success) {
        summary.hasCheckout = detectionResults.checkoutProcess.data?.checkoutFound || false;
      }

      // Payment security summary
      if (detectionResults.paymentSecurity?.success) {
        summary.hasSecurePayment = detectionResults.paymentSecurity.data?.securityLevel === 'high';
      }

      // Conversion elements summary
      if (detectionResults.conversionElements?.success) {
        summary.conversionElementsFound = detectionResults.conversionElements.data?.elementsCount || 0;
      }

    } catch (error) {
      console.error('Error generating detection summary:', error);
      summary.detectionSuccess = false;
    }

    return summary;
  }

  _generateHeuristicInsights(heuristicResults) {
    const insights = {
      performanceScore: 0,
      securityScore: 0,
      strategyScore: 0,
      keyInsights: [],
      optimizationOpportunities: []
    };

    try {
      // Performance insights
      if (heuristicResults.performance?.success) {
        insights.performanceScore = heuristicResults.performance.summary?.overallScore || 0;
        if (heuristicResults.performance.insights) {
          insights.keyInsights.push(...(heuristicResults.performance.insights.keyFindings || []));
        }
      }

      // Security insights
      if (heuristicResults.security?.success) {
        insights.securityScore = heuristicResults.security.summary?.overallScore || 0;
        if (heuristicResults.security.riskAssessment) {
          insights.keyInsights.push(...(heuristicResults.security.riskAssessment.findings || []));
        }
      }

      // Strategy insights
      if (heuristicResults.strategy?.success) {
        insights.strategyScore = heuristicResults.strategy.summary?.overallStrategicScore || 0;
        if (heuristicResults.strategy.businessValue) {
          insights.optimizationOpportunities.push(...(heuristicResults.strategy.businessValue.opportunities || []));
        }
      }

    } catch (error) {
      console.error('Error generating heuristic insights:', error);
    }

    return insights;
  }

  _aggregateEcommerceData(allResults) {
    return {
      platform: {
        detected: allResults.detection?.summary?.platformDetected || 'Unknown',
        type: allResults.detection?.summary?.ecommerceType || 'Unknown',
        confidence: allResults.detection?.results?.platform?.data?.confidence || 0
      },
      
      products: {
        count: allResults.detection?.summary?.productCount || 0,
        catalog: allResults.detection?.results?.productCatalog?.data || {},
        optimization: allResults.heuristics?.results?.performance?.productOptimization || {}
      },
      
      checkout: {
        hasProcess: allResults.detection?.summary?.hasCheckout || false,
        hasCart: allResults.detection?.summary?.hasCart || false,
        optimization: allResults.heuristics?.results?.performance?.checkoutOptimization || {},
        security: allResults.heuristics?.results?.security?.checkoutSecurity || {}
      },
      
      payments: {
        securityLevel: allResults.detection?.results?.paymentSecurity?.data?.securityLevel || 'low',
        trustSignals: allResults.detection?.results?.paymentSecurity?.data?.trustSignals || [],
        compliance: allResults.rules?.compliance?.paymentCompliance || {}
      },
      
      conversion: {
        elements: allResults.detection?.results?.conversionElements?.data || {},
        optimization: allResults.heuristics?.results?.strategy?.conversionOptimization || {},
        recommendations: allResults.ai?.conversionRecommendations || []
      }
    };
  }

  _calculateComprehensiveScoring(allResults) {
    const scoring = {
      overall: 0,
      breakdown: {
        platform: 0,
        products: 0,
        checkout: 0,
        security: 0,
        conversion: 0
      },
      grade: 'F',
      confidence: 0
    };

    try {
      const scores = [];
      
      // Platform score
      if (allResults.detection?.results?.platform?.data?.confidence) {
        scoring.breakdown.platform = allResults.detection.results.platform.data.confidence * 100;
        scores.push(scoring.breakdown.platform);
      }
      
      // Products score
      if (allResults.heuristics?.results?.performance?.productOptimization?.score) {
        scoring.breakdown.products = allResults.heuristics.results.performance.productOptimization.score;
        scores.push(scoring.breakdown.products);
      }
      
      // Checkout score
      if (allResults.heuristics?.results?.performance?.checkoutOptimization?.score) {
        scoring.breakdown.checkout = allResults.heuristics.results.performance.checkoutOptimization.score;
        scores.push(scoring.breakdown.checkout);
      }
      
      // Security score
      if (allResults.heuristics?.results?.security?.summary?.overallScore) {
        scoring.breakdown.security = allResults.heuristics.results.security.summary.overallScore;
        scores.push(scoring.breakdown.security);
      }
      
      // Conversion score
      if (allResults.heuristics?.results?.strategy?.conversionOptimization?.score) {
        scoring.breakdown.conversion = allResults.heuristics.results.strategy.conversionOptimization.score;
        scores.push(scoring.breakdown.conversion);
      }
      
      // Calculate overall score
      if (scores.length > 0) {
        scoring.overall = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
        scoring.confidence = scores.length / 5; // Based on 5 possible components
      }
      
      // Assign grade
      if (scoring.overall >= 90) scoring.grade = 'A';
      else if (scoring.overall >= 80) scoring.grade = 'B';
      else if (scoring.overall >= 70) scoring.grade = 'C';
      else if (scoring.overall >= 60) scoring.grade = 'D';
      else scoring.grade = 'F';

    } catch (error) {
      console.error('Error calculating comprehensive scoring:', error);
    }

    return scoring;
  }

  _generateUnifiedRecommendations(allResults) {
    const recommendations = [];

    try {
      // Collect recommendations from all phases
      const sources = [
        allResults.heuristics?.results?.performance?.recommendations || [],
        allResults.heuristics?.results?.security?.recommendations || [],
        allResults.heuristics?.results?.strategy?.recommendations || [],
        allResults.rules?.recommendations || [],
        allResults.ai?.recommendations || []
      ];

      sources.forEach(sourceRecommendations => {
        if (Array.isArray(sourceRecommendations)) {
          recommendations.push(...sourceRecommendations);
        }
      });

      // Deduplicate and prioritize recommendations
      return this._prioritizeRecommendations(recommendations);

    } catch (error) {
      console.error('Error generating unified recommendations:', error);
      return [];
    }
  }

  _prioritizeRecommendations(recommendations) {
    // Remove duplicates based on title or description
    const unique = recommendations.filter((rec, index, self) => 
      index === self.findIndex(r => r.title === rec.title || r.description === rec.description)
    );

    // Sort by priority (critical > high > medium > low)
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    
    return unique.sort((a, b) => {
      const aPriority = priorityOrder[a.priority] || 0;
      const bPriority = priorityOrder[b.priority] || 0;
      return bPriority - aPriority;
    }).slice(0, 15); // Limit to top 15 recommendations
  }

  _compileStrategicInsights(allResults) {
    return {
      businessValue: allResults.heuristics?.results?.strategy?.businessValue || {},
      competitivePosition: allResults.heuristics?.results?.strategy?.competitiveAnalysis || {},
      growthOpportunities: allResults.ai?.growthOpportunities || [],
      riskFactors: allResults.heuristics?.results?.security?.riskAssessment?.risks || [],
      technologyRecommendations: allResults.ai?.technologyRecommendations || []
    };
  }

  _generateExecutiveSummary(combinedResults) {
    return {
      overallScore: combinedResults.comprehensiveScoring?.overall || 0,
      grade: combinedResults.comprehensiveScoring?.grade || 'F',
      platformDetected: combinedResults.aggregatedData?.platform?.detected || 'Unknown',
      ecommerceMaturity: this._assessEcommerceMaturity(combinedResults),
      keyStrengths: this._identifyKeyStrengths(combinedResults),
      primaryConcerns: this._identifyPrimaryConcerns(combinedResults),
      nextSteps: this._generateNextSteps(combinedResults.unifiedRecommendations),
      businessImpact: this._assessBusinessImpact(combinedResults)
    };
  }

  _assessEcommerceMaturity(results) {
    const score = results.comprehensiveScoring?.overall || 0;
    
    if (score >= 90) return 'Advanced';
    if (score >= 75) return 'Mature';
    if (score >= 60) return 'Developing';
    if (score >= 40) return 'Basic';
    return 'Emerging';
  }

  _identifyKeyStrengths(results) {
    const strengths = [];
    const breakdown = results.comprehensiveScoring?.breakdown || {};
    
    Object.entries(breakdown).forEach(([area, score]) => {
      if (score >= 80) {
        strengths.push(`Strong ${area} optimization (${score}/100)`);
      }
    });
    
    return strengths.length > 0 ? strengths : ['Basic e-commerce functionality present'];
  }

  _identifyPrimaryConcerns(results) {
    const concerns = [];
    const breakdown = results.comprehensiveScoring?.breakdown || {};
    
    Object.entries(breakdown).forEach(([area, score]) => {
      if (score < 60) {
        concerns.push(`${area} needs improvement (${score}/100)`);
      }
    });
    
    return concerns.length > 0 ? concerns : ['Overall optimization could be enhanced'];
  }

  _generateNextSteps(recommendations) {
    return recommendations
      .filter(rec => rec.priority === 'critical' || rec.priority === 'high')
      .slice(0, 5)
      .map(rec => rec.title || rec.description)
      .filter(Boolean);
  }

  _assessBusinessImpact(results) {
    const score = results.comprehensiveScoring?.overall || 0;
    
    if (score >= 80) return 'High positive impact on revenue and customer experience';
    if (score >= 60) return 'Moderate impact with room for improvement';
    if (score >= 40) return 'Basic functionality with significant optimization potential';
    return 'Limited e-commerce effectiveness, requires comprehensive improvements';
  }

  // ============================================================================
  // CONFIGURATION AND UTILITY METHODS
  // ============================================================================

  /**
   * Update analyzer configuration
   * @param {Object} updates - Configuration updates
   * @returns {boolean} Success status
   */
  updateConfiguration(updates) {
    return this.config.updateConfiguration(updates);
  }

  /**
   * Get current configuration
   * @returns {Object} Current configuration
   */
  getConfiguration() {
    return this.config.getConfiguration();
  }

  /**
   * Check if feature is enabled
   * @param {string} featureName - Feature name to check
   * @returns {boolean} Feature enabled status
   */
  isFeatureEnabled(featureName) {
    return this.config.isFeatureEnabled(featureName);
  }

  /**
   * Validate analysis context
   * @param {Object} context - Analysis context to validate
   * @returns {boolean} Validation result
   */
  validate(context) {
    try {
      if (!context) return false;
      
      // Check for required context properties
      const hasDocument = context.document || (context.dom && context.dom.window && context.dom.window.document);
      const hasUrl = context.url || typeof context.url === 'string';
      
      return hasDocument && hasUrl;
    } catch (error) {
      this.logError('Context validation failed', error);
      return false;
    }
  }
}

export default EcommerceAnalyzerModern;
