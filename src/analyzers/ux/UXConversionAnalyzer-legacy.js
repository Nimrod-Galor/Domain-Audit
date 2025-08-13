/**
 * UX Conversion Analyzer - Combined Approach Implementation
 * 
 * This is the pilot implementation of the Project-Wide Combined Approach,
 * demonstrating the integration of:
 * - GPT-5's modular architecture (detectors, heuristics, rules)
 * - Claude's AI-powered features (patterns, predictions, recommendations)
 * - Existing project patterns (BaseAnalyzer, AnalyzerRegistry, AI infrastructure)
 * 
 * @author Nimrod Galor
 * @version 1.0.0
 * @approach Combined (GPT-5 + Claude + Existing)
 */

import { BaseAnalyzer } from '../core/BaseAnalyzer.js';
import { BaseAIEnhancer } from '../core/BaseAIEnhancer.js';
import { AnalyzerCategories } from '../core/AnalyzerInterface.js';

// GPT-5 style: Modular detectors
import { InteractionDetector } from './detectors/interaction-detector.js';
import { NavigationDetector } from './detectors/navigation-detector.js';
import { FormDetector } from './detectors/form-detector.js';
import { ContentDetector } from './detectors/content-detector.js';
import { TrustSignalDetector } from './detectors/trust-signal-detector.js';

// GPT-5 style: Reusable heuristics
import { UsabilityAnalyzer } from './heuristics/usability-analyzer.js';
import { ConversionPathAnalyzer } from './heuristics/conversion-path-analyzer.js';
import { CognitiveLoadAnalyzer } from './heuristics/cognitive-load-analyzer.js';
import { TrustAnalyzer } from './heuristics/trust-analyzer.js';

// GPT-5 style: Scoring and validation
import { UXScoringEngine } from './rules/ux-scoring-engine.js';

// Claude style: AI enhancement
import { UXAIEnhancer } from './ai-enhancement/ux-ai-enhancer.js';

// Configuration and utilities
import { UXStandards } from './config/ux-standards.js';
import { UXWeights } from './config/ux-weights.js';
import { UXFeatureFlags } from './config/ux-feature-flags.js';
import { UXValidationHelpers } from './utils/validation-helpers.js';
import { UXPerformanceMonitor } from './utils/performance-monitor.js';

/**
 * UX Conversion Analyzer
 * 
 * Comprehensive UX analysis for conversion optimization across all website types.
 * Implements the combined approach pattern with heuristics-first analysis
 * and optional AI enhancement.
 */
export class UXConversionAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('UXConversionAnalyzer', {
      enableAI: options.enableAI !== false,
      timeout: options.timeout || 30000,
      enableLogging: options.enableLogging || false,
      ...options
    });

    // GPT-5 style: Modular components initialization
    this.detectors = this._initializeDetectors(options);
    this.heuristics = this._initializeHeuristics(options);
    this.rules = this._initializeRules(options);

    // Claude style: AI enhancement (optional)
    this.aiEnhancer = options.enableAI 
      ? new UXAIEnhancer(options.aiManager, options.aiOptions)
      : null;

    // Configuration management
    this.config = {
      standards: new UXStandards(options.standards),
      weights: new UXWeights(options.weights),
      featureFlags: new UXFeatureFlags(options.features)
    };

    // Utilities
    this.validator = new UXValidationHelpers();
    this.uxPerformanceMonitor = new UXPerformanceMonitor(this.name);
  }

  /**
   * Combined approach analysis method
   * Phase 1: Heuristics-based analysis (always works)
   * Phase 2: AI enhancement (optional)
   */
  async performHeuristicAnalysis(context) {
    const analysisStart = Date.now();
    
    try {
      // Validate context
      if (!this.validator.validateContext(context)) {
        throw new Error('Invalid analysis context provided');
      }

      this.log('info', 'Starting UX conversion heuristic analysis');
      this.uxPerformanceMonitor.startPhase('heuristic_analysis');

      // Phase 1: Parallel detection (GPT-5 style)
      const detectionResults = await this._performParallelDetection(context);

      // Phase 2: Heuristic analysis
      const heuristicResults = await this._performHeuristicAnalysis(detectionResults, context);

      // Phase 3: Scoring and validation
      const scoringResults = await this._performScoring(heuristicResults);

      // Compile results
      const results = {
        success: true,
        timestamp: new Date().toISOString(),
        analysisTime: Date.now() - analysisStart,
        
        // Detection results
        detections: detectionResults,
        
        // Heuristic analysis
        usability: heuristicResults.usability,
        conversionPath: heuristicResults.conversionPath,
        cognitiveLoad: heuristicResults.cognitiveLoad,
        trust: heuristicResults.trust,
        
        // Overall scoring
        overallScore: scoringResults.overallScore,
        categoryScores: scoringResults.categoryScores,
        findings: scoringResults.findings,
        recommendations: scoringResults.recommendations,
        
        // Performance metrics
        performanceMetrics: this.uxPerformanceMonitor.getPhaseMetrics('heuristic_analysis')
      };

      this.uxPerformanceMonitor.endPhase('heuristic_analysis');
      this.log('info', `Heuristic analysis completed with score: ${results.overallScore}/100`);

      return results;

    } catch (error) {
      this.uxPerformanceMonitor.endPhase('heuristic_analysis', error);
      this.log('error', 'Heuristic analysis failed', error);
      throw error;
    }
  }

  /**
   * AI enhancement method - enhances heuristic results with AI insights
   */
  async _performAIEnhancement(heuristicResults, aiManager) {
    if (!this.aiEnhancer) {
      return null;
    }

    this.log('info', 'Starting UX AI enhancement');
    this.uxPerformanceMonitor.startPhase('ai_enhancement');

    try {
      const aiResults = await this.aiEnhancer.enhance(heuristicResults);
      
      this.uxPerformanceMonitor.endPhase('ai_enhancement');
      this.log('info', `AI enhancement completed with confidence: ${aiResults.confidence}`);
      
      return aiResults;

    } catch (error) {
      this.uxPerformanceMonitor.endPhase('ai_enhancement', error);
      this.log('warn', 'AI enhancement failed, continuing with heuristics only', error);
      return null; // Graceful degradation
    }
  }

  /**
   * Initialize detector modules (GPT-5 style)
   */
  _initializeDetectors(options) {
    const detectorOptions = options.detectors || {};
    
    return {
      interaction: new InteractionDetector(detectorOptions.interaction),
      navigation: new NavigationDetector(detectorOptions.navigation),
      form: new FormDetector(detectorOptions.form),
      content: new ContentDetector(detectorOptions.content),
      trustSignal: new TrustSignalDetector(detectorOptions.trustSignal)
    };
  }

  /**
   * Initialize heuristic analyzers (GPT-5 style)
   */
  _initializeHeuristics(options) {
    const heuristicOptions = options.heuristics || {};
    
    return {
      usability: new UsabilityAnalyzer(heuristicOptions.usability),
      conversionPath: new ConversionPathAnalyzer(heuristicOptions.conversionPath),
      cognitiveLoad: new CognitiveLoadAnalyzer(heuristicOptions.cognitiveLoad),
      trust: new TrustAnalyzer(heuristicOptions.trust)
    };
  }

  /**
   * Initialize scoring rules (GPT-5 style)
   */
  _initializeRules(options) {
    return new UXScoringEngine(options.scoring);
  }

  /**
   * Perform parallel detection across all modules
   */
  async _performParallelDetection(context) {
    const detectionPromises = [
      this.detectors.interaction.detect(context.document),
      this.detectors.navigation.detect(context.document),
      this.detectors.form.detect(context.document),
      this.detectors.content.detect(context.document),
      this.detectors.trustSignal.detect(context.document, context.url)
    ];

    const [interaction, navigation, form, content, trustSignal] = await Promise.all(detectionPromises);

    return {
      interaction,
      navigation,
      form,
      content,
      trustSignal,
      metadata: {
        detectionTime: Date.now(),
        detectorsUsed: Object.keys(this.detectors).length
      }
    };
  }

  /**
   * Perform heuristic analysis on detection results
   */
  async _performHeuristicAnalysis(detectionResults, context) {
    const analysisPromises = [
      this.heuristics.usability.analyze(detectionResults, context),
      this.heuristics.conversionPath.analyze(detectionResults, context),
      this.heuristics.cognitiveLoad.analyze(detectionResults, context),
      this.heuristics.trust.analyze(detectionResults, context)
    ];

    const [usability, conversionPath, cognitiveLoad, trust] = await Promise.all(analysisPromises);

    return {
      usability,
      conversionPath,
      cognitiveLoad,
      trust,
      metadata: {
        analysisTime: Date.now(),
        heuristicsUsed: Object.keys(this.heuristics).length
      }
    };
  }

  /**
   * Perform scoring and generate findings
   */
  async _performScoring(heuristicResults) {
    return this.rules.calculateUXScore(heuristicResults, this.config.weights);
  }

  /**
   * Extract features for AI analysis
   */
  _extractAIFeatures(heuristicResults) {
    return {
      analyzerName: this.name,
      category: 'ux_conversion',
      
      // Overall metrics
      overallScore: heuristicResults.overallScore || 0,
      
      // Category scores
      usabilityScore: heuristicResults.usability?.score || 0,
      conversionPathScore: heuristicResults.conversionPath?.score || 0,
      cognitiveLoadScore: heuristicResults.cognitiveLoad?.score || 0,
      trustScore: heuristicResults.trust?.score || 0,
      
      // Detection counts
      interactionElements: heuristicResults.detections?.interaction?.elements?.length || 0,
      navigationElements: heuristicResults.detections?.navigation?.elements?.length || 0,
      formElements: heuristicResults.detections?.form?.elements?.length || 0,
      trustSignals: heuristicResults.detections?.trustSignal?.signals?.length || 0,
      
      // Key findings
      findings: heuristicResults.findings || [],
      recommendations: heuristicResults.recommendations || [],
      
      // Performance data
      performanceMetrics: heuristicResults.performanceMetrics || {}
    };
  }

  /**
   * Get enhanced analyzer metadata
   */
  getMetadata() {
    return {
      name: 'UXConversionAnalyzer',
      version: '1.0.0',
      category: AnalyzerCategories.UX,
      description: 'Comprehensive UX conversion analysis with AI enhancement',
      
      // Combined approach metadata
      supportsCombinedApproach: true,
      heuristicsCapable: true,
      aiEnhanceable: this.enableAI,
      performanceTracked: true,
      
      // Architecture information
      architecture: {
        pattern: 'combined_approach',
        style: 'gpt5_modular_claude_ai',
        detectors: Object.keys(this.detectors),
        heuristics: Object.keys(this.heuristics),
        aiEnhancement: !!this.aiEnhancer
      },
      
      // Capabilities
      capabilities: [
        'Interaction element detection',
        'Navigation analysis',
        'Form usability assessment',
        'Content optimization analysis',
        'Trust signal evaluation',
        'Conversion path optimization',
        'Cognitive load assessment',
        'AI-powered insights',
        'Predictive recommendations',
        'Performance monitoring'
      ],
      
      // Analysis areas
      analysisAreas: {
        usability: 'User interface and interaction design',
        conversionPath: 'User journey and conversion funnel',
        cognitiveLoad: 'Mental effort and complexity',
        trust: 'Credibility and security signals'
      },
      
      // Feature flags
      features: this.config.featureFlags.getEnabledFlags(),
      
      // Configuration
      configuration: {
        standards: this.config.standards.getVersion(),
        weights: this.config.weights.getWeights(),
        timeout: this.options.timeout,
        enableAI: this.enableAI
      }
    };
  }

  /**
   * Get analysis status and health
   */
  getAnalysisStatus() {
    return {
      timestamp: new Date().toISOString(),
      
      // Component health
      components: {
        detectors: this._getComponentHealth(this.detectors),
        heuristics: this._getComponentHealth(this.heuristics),
        rules: this.rules ? 'healthy' : 'unavailable',
        aiEnhancer: this.aiEnhancer ? 'healthy' : 'disabled'
      },
      
      // Performance metrics
      performance: this.uxPerformanceMonitor.getOverallMetrics(),
      
      // Configuration status
      configuration: {
        standardsLoaded: this.config.standards.isLoaded(),
        weightsConfigured: this.config.weights.isConfigured(),
        featuresEnabled: this.config.featureFlags.getEnabledCount()
      },
      
      // Ready status
      ready: this._isAnalyzerReady()
    };
  }

  /**
   * Check if analyzer is ready for analysis
   */
  _isAnalyzerReady() {
    const detectorsReady = Object.values(this.detectors).every(detector => detector);
    const heuristicsReady = Object.values(this.heuristics).every(heuristic => heuristic);
    const rulesReady = !!this.rules;
    const configReady = this.config.standards.isLoaded() && this.config.weights.isConfigured();
    
    return detectorsReady && heuristicsReady && rulesReady && configReady;
  }

  /**
   * Get component health status
   */
  _getComponentHealth(components) {
    const healthStatus = {};
    
    for (const [name, component] of Object.entries(components)) {
      healthStatus[name] = component ? 'healthy' : 'unavailable';
    }
    
    return healthStatus;
  }
}

export default UXConversionAnalyzer;
