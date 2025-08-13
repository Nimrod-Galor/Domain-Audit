/**
 * ============================================================================
 * MOBILE ANALYZER - COMBINED APPROACH (14TH IMPLEMENTATION) 
 * ============================================================================
 * 
 * Advanced mobile-first web analysis with comprehensive responsive design,
 * mobile optimization, and mobile UX pattern detection using:
 * 
 * 🚀 GPT-5 Style: Modular detector architecture
 * 🧠 Claude AI: Advanced heuristic analysis  
 * ⚡ Rules Engine: Intelligent scoring system
 * 🤖 AI Enhancement: Smart insights & predictions
 * ⚙️ Configuration: Flexible analysis parameters
 * 
 * @fileoverview Mobile-first analysis covering responsive design, mobile UX,
 *               performance optimization, and mobile-specific features
 * @version 1.0.0
 * @author AI Assistant
 * @date 2024-12-19
 * 
 * FEATURES COVERAGE:
 * - Responsive design analysis (viewport, breakpoints, media queries)
 * - Mobile UX patterns (touch optimization, navigation, interactions)
 * - Mobile performance analysis (Core Web Vitals, mobile-specific metrics)
 * - Mobile accessibility (touch targets, contrast, mobile screen readers)
 * - Progressive Web App features (manifest, service worker, app-like experience)
 * - Mobile SEO optimization (mobile-first indexing, AMP, structured data)
 * - Cross-device compatibility (tablet, phone, different orientations)
 * - Mobile security considerations (secure contexts, permissions)
 */

import { BaseAnalyzer } from '../../core/BaseAnalyzer.js';
import { AnalyzerCategories } from '../../core/AnalyzerInterface.js';

// GPT-5 Style: Modular Detector Components
import { ResponsiveDesignDetector } from './detectors/responsive-design-detector.js';
import { MobileFeaturesDetector } from './detectors/mobile-features-detector.js';
import { TouchOptimizationDetector } from './detectors/touch-optimization-detector.js';
import { MobileNavigationDetector } from './detectors/mobile-navigation-detector.js';
import { ViewportDetector } from './detectors/viewport-detector.js';
import { PWADetector } from './detectors/pwa-detector.js';
import { MobilePerformanceDetector } from './detectors/mobile-performance-detector.js';

// Claude AI Style: Advanced Heuristic Analysis
import { MobileUXAnalyzer } from './heuristics/mobile-ux-analyzer.js';
import { ResponsivenessAnalyzer } from './heuristics/responsiveness-analyzer.js';
import { MobileAccessibilityAnalyzer } from './heuristics/mobile-accessibility-analyzer.js';
import { MobileSEOAnalyzer } from './heuristics/mobile-seo-analyzer.js';
import { CrossDeviceAnalyzer } from './heuristics/cross-device-analyzer.js';
import { MobileSecurityAnalyzer } from './heuristics/mobile-security-analyzer.js';

// Rules Engine: Intelligent Scoring
import { MobileRulesEngine } from './rules/mobile-rules-engine.js';

// AI Enhancement: Smart Insights
import { MobileAIEnhancement } from './ai/mobile-ai-enhancement.js';

// Configuration Management
import { MobileConfiguration } from './config/mobile-configuration.js';

/**
 * Mobile Analyzer - Combined Approach Implementation
 * 
 * Provides comprehensive mobile-first web analysis with advanced pattern detection,
 * intelligent heuristics, and AI-powered insights for mobile optimization.
 * 
 * @class MobileAnalyzer
 * @extends {BaseAnalyzer}
 */
export class MobileAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('MobileAnalyzer', {
      category: AnalyzerCategories.MOBILE,
      version: '1.0.0',
      description: 'Advanced mobile-first web analysis with responsive design and mobile UX optimization',
      author: 'AI Assistant',
      ...options
    });

    // Configuration Management
    this.config = new MobileConfiguration(options);
    
    // GPT-5 Style: Modular Detector Architecture
    this.detectors = {
      responsive: new ResponsiveDesignDetector(this.config.getDetectorConfig('responsive')),
      features: new MobileFeaturesDetector(this.config.getDetectorConfig('features')),
      touch: new TouchOptimizationDetector(this.config.getDetectorConfig('touch')),
      navigation: new MobileNavigationDetector(this.config.getDetectorConfig('navigation')),
      viewport: new ViewportDetector(this.config.getDetectorConfig('viewport')),
      pwa: new PWADetector(this.config.getDetectorConfig('pwa')),
      performance: new MobilePerformanceDetector(this.config.getDetectorConfig('performance'))
    };

    // Claude AI Style: Advanced Heuristic Analysis
    this.heuristics = {
      ux: new MobileUXAnalyzer(this.config.getHeuristicConfig('ux')),
      responsiveness: new ResponsivenessAnalyzer(this.config.getHeuristicConfig('responsiveness')),
      accessibility: new MobileAccessibilityAnalyzer(this.config.getHeuristicConfig('accessibility')),
      seo: new MobileSEOAnalyzer(this.config.getHeuristicConfig('seo')),
      crossDevice: new CrossDeviceAnalyzer(this.config.getHeuristicConfig('crossDevice')),
      security: new MobileSecurityAnalyzer(this.config.getHeuristicConfig('security'))
    };

    // Rules Engine: Intelligent Mobile Scoring
    this.rulesEngine = new MobileRulesEngine(this.config.getRulesConfig());

    // AI Enhancement: Smart Mobile Insights
    this.aiEnhancement = new MobileAIEnhancement(this.config.getAIConfig());

    // Analysis state management
    this.analysisState = {
      detectorResults: {},
      heuristicResults: {},
      rulesResults: {},
      aiInsights: {},
      timestamp: null,
      analysisId: null
    };

    this.log('Mobile Analyzer initialized with Combined Approach architecture', 'info');
  }

  /**
   * Get analyzer metadata for BaseAnalyzer integration
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'MobileAnalyzer',
      version: '1.0.0',
      description: 'Advanced mobile-first web analysis with responsive design optimization',
      category: AnalyzerCategories.MOBILE,
      capabilities: [
        'responsive_design_analysis',
        'mobile_ux_evaluation',
        'touch_optimization_assessment',
        'pwa_feature_detection',
        'mobile_performance_analysis',
        'cross_device_compatibility',
        'mobile_accessibility_audit',
        'mobile_seo_optimization'
      ],
      supportedDomTypes: ['jsdom', 'cheerio', 'puppeteer'],
      configurable: true,
      aiEnhanced: true
    };
  }

  /**
   * Validate input for mobile analysis
   * @param {Object} context - Analysis context
   * @returns {boolean} Whether input is valid
   */
  validate(context) {
    if (!context) {
      this.log('No analysis context provided', 'error');
      return false;
    }

    // Check for required DOM/document
    if (!context.dom && !context.document && !context.cheerio) {
      this.log('No DOM, document, or Cheerio instance provided in context', 'error');
      return false;
    }

    // Validate URL if provided
    if (context.url && typeof context.url !== 'string') {
      this.log('URL must be a string', 'error');
      return false;
    }

    return true;
  }

  /**
   * Enhanced analyze method with BaseAnalyzer integration
   * @param {Object} context - Analysis context containing document/dom/cheerio, url, pageData
   * @returns {Object} Enhanced analysis results with BaseAnalyzer structure
   */
  async analyze(context) {
    // Validate input
    if (!this.validate(context)) {
      return this.createErrorResult('Invalid analysis context provided');
    }

    const analysisId = `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.analysisState.analysisId = analysisId;
    this.analysisState.timestamp = new Date().toISOString();

    try {
      this.log(`Starting Mobile Analysis with ID: ${analysisId}`, 'info');

      // Extract document from context
      const document = context.document || context.dom || context.cheerio;
      const url = context.url || '';
      const pageData = context.pageData || {};

      // Phase 1: GPT-5 Style Detector Analysis
      this.log('Phase 1: Running modular detector analysis', 'info');
      const detectorResults = await this.runDetectorAnalysis(document, url, pageData);
      this.analysisState.detectorResults = detectorResults;

      // Phase 2: Claude AI Style Heuristic Analysis
      this.log('Phase 2: Running advanced heuristic analysis', 'info');
      const heuristicResults = await this.runHeuristicAnalysis(detectorResults, document, url);
      this.analysisState.heuristicResults = heuristicResults;

      // Phase 3: Rules Engine Analysis
      this.log('Phase 3: Running intelligent scoring analysis', 'info');
      const rulesResults = await this.runRulesAnalysis(detectorResults, heuristicResults);
      this.analysisState.rulesResults = rulesResults;

      // Phase 4: AI Enhancement (if enabled)
      let aiInsights = {};
      if (this.config.isAIEnabled()) {
        this.log('Phase 4: Running AI-powered enhancement analysis', 'info');
        aiInsights = await this.runAIAnalysis(detectorResults, heuristicResults, rulesResults);
        this.analysisState.aiInsights = aiInsights;
      }

      // Compile comprehensive results
      const analysisResults = this.compileResults({
        detectorResults,
        heuristicResults,
        rulesResults,
        aiInsights,
        analysisId,
        timestamp: this.analysisState.timestamp
      });

      this.log(`Mobile Analysis completed successfully - ID: ${analysisId}`, 'info');
      
      return this.createSuccessResult(analysisResults);

    } catch (error) {
      this.log(`Mobile Analysis failed: ${error.message}`, 'error');
      return this.createErrorResult(`Mobile analysis failed: ${error.message}`, error);
    }
  }

  /**
   * Run GPT-5 style modular detector analysis
   * @param {Object} document - DOM document/Cheerio instance
   * @param {string} url - Page URL
   * @param {Object} pageData - Additional page data
   * @returns {Object} Detector analysis results
   * @private
   */
  async runDetectorAnalysis(document, url, pageData) {
    const results = {};

    try {
      // Parallel detector execution for performance
      const detectorPromises = [
        this.detectors.responsive.analyze(document, url).catch(e => ({ error: e.message })),
        this.detectors.features.analyze(document, url).catch(e => ({ error: e.message })),
        this.detectors.touch.analyze(document, url).catch(e => ({ error: e.message })),
        this.detectors.navigation.analyze(document, url).catch(e => ({ error: e.message })),
        this.detectors.viewport.analyze(document, url).catch(e => ({ error: e.message })),
        this.detectors.pwa.analyze(document, url).catch(e => ({ error: e.message })),
        this.detectors.performance.analyze(document, url, pageData).catch(e => ({ error: e.message }))
      ];

      const [
        responsiveResults,
        featuresResults,
        touchResults,
        navigationResults,
        viewportResults,
        pwaResults,
        performanceResults
      ] = await Promise.all(detectorPromises);

      results.responsive = responsiveResults;
      results.features = featuresResults;
      results.touch = touchResults;
      results.navigation = navigationResults;
      results.viewport = viewportResults;
      results.pwa = pwaResults;
      results.performance = performanceResults;

      this.log(`Detector analysis completed - ${Object.keys(results).length} detectors executed`, 'info');
      
    } catch (error) {
      this.log(`Detector analysis error: ${error.message}`, 'error');
      results.error = error.message;
    }

    return results;
  }

  /**
   * Run Claude AI style advanced heuristic analysis
   * @param {Object} detectorResults - Results from detector phase
   * @param {Object} document - DOM document/Cheerio instance
   * @param {string} url - Page URL
   * @returns {Object} Heuristic analysis results
   * @private
   */
  async runHeuristicAnalysis(detectorResults, document, url) {
    const results = {};

    try {
      // Sequential heuristic analysis for dependency management
      results.ux = await this.heuristics.ux.analyze(detectorResults, document, url)
        .catch(e => ({ error: e.message }));
      
      results.responsiveness = await this.heuristics.responsiveness.analyze(detectorResults, document, url)
        .catch(e => ({ error: e.message }));
      
      results.accessibility = await this.heuristics.accessibility.analyze(detectorResults, document, url)
        .catch(e => ({ error: e.message }));
      
      results.seo = await this.heuristics.seo.analyze(detectorResults, document, url)
        .catch(e => ({ error: e.message }));
      
      results.crossDevice = await this.heuristics.crossDevice.analyze(detectorResults, document, url)
        .catch(e => ({ error: e.message }));
      
      results.security = await this.heuristics.security.analyze(detectorResults, document, url)
        .catch(e => ({ error: e.message }));

      this.log(`Heuristic analysis completed - ${Object.keys(results).length} analyzers executed`, 'info');
      
    } catch (error) {
      this.log(`Heuristic analysis error: ${error.message}`, 'error');
      results.error = error.message;
    }

    return results;
  }

  /**
   * Run intelligent rules engine analysis
   * @param {Object} detectorResults - Results from detector phase
   * @param {Object} heuristicResults - Results from heuristic phase
   * @returns {Object} Rules analysis results
   * @private
   */
  async runRulesAnalysis(detectorResults, heuristicResults) {
    try {
      const results = await this.rulesEngine.analyze({
        detectors: detectorResults,
        heuristics: heuristicResults,
        timestamp: this.analysisState.timestamp
      });

      this.log(`Rules engine analysis completed - Score: ${results.overallScore}/100`, 'info');
      return results;
      
    } catch (error) {
      this.log(`Rules analysis error: ${error.message}`, 'error');
      return { error: error.message, overallScore: 0 };
    }
  }

  /**
   * Run AI-powered enhancement analysis
   * @param {Object} detectorResults - Results from detector phase
   * @param {Object} heuristicResults - Results from heuristic phase
   * @param {Object} rulesResults - Results from rules phase
   * @returns {Object} AI analysis results
   * @private
   */
  async runAIAnalysis(detectorResults, heuristicResults, rulesResults) {
    try {
      const results = await this.aiEnhancement.analyze({
        detectors: detectorResults,
        heuristics: heuristicResults,
        rules: rulesResults,
        analysisId: this.analysisState.analysisId,
        timestamp: this.analysisState.timestamp
      });

      this.log(`AI enhancement analysis completed - ${results.insights.length} insights generated`, 'info');
      return results;
      
    } catch (error) {
      this.log(`AI analysis error: ${error.message}`, 'error');
      return { error: error.message, insights: [] };
    }
  }

  /**
   * Compile comprehensive analysis results
   * @param {Object} phases - Results from all analysis phases
   * @returns {Object} Compiled analysis results
   * @private
   */
  compileResults(phases) {
    const {
      detectorResults,
      heuristicResults,
      rulesResults,
      aiInsights,
      analysisId,
      timestamp
    } = phases;

    return {
      // Analysis metadata
      metadata: {
        analyzer: 'MobileAnalyzer',
        version: '1.0.0',
        analysisId,
        timestamp,
        processingTime: Date.now() - new Date(timestamp).getTime(),
        approach: 'Combined (GPT-5 + Claude AI + Rules + AI Enhancement)'
      },

      // Core mobile analysis data
      mobile: {
        score: rulesResults.overallScore || 0,
        grade: this.calculateGrade(rulesResults.overallScore || 0),
        
        // Responsive design analysis
        responsive: {
          ...detectorResults.responsive,
          analysis: heuristicResults.responsiveness,
          score: rulesResults.scores?.responsive || 0
        },

        // Mobile features and capabilities
        features: {
          ...detectorResults.features,
          analysis: heuristicResults.ux,
          score: rulesResults.scores?.features || 0
        },

        // Touch optimization
        touch: {
          ...detectorResults.touch,
          analysis: heuristicResults.accessibility,
          score: rulesResults.scores?.touch || 0
        },

        // Mobile navigation
        navigation: {
          ...detectorResults.navigation,
          analysis: heuristicResults.ux,
          score: rulesResults.scores?.navigation || 0
        },

        // Viewport configuration
        viewport: {
          ...detectorResults.viewport,
          analysis: heuristicResults.responsiveness,
          score: rulesResults.scores?.viewport || 0
        },

        // Progressive Web App features
        pwa: {
          ...detectorResults.pwa,
          analysis: heuristicResults.ux,
          score: rulesResults.scores?.pwa || 0
        },

        // Mobile performance
        performance: {
          ...detectorResults.performance,
          analysis: heuristicResults.crossDevice,
          score: rulesResults.scores?.performance || 0
        }
      },

      // Cross-device compatibility
      crossDevice: {
        compatibility: heuristicResults.crossDevice,
        score: rulesResults.scores?.crossDevice || 0
      },

      // Mobile SEO optimization
      mobileSEO: {
        optimization: heuristicResults.seo,
        score: rulesResults.scores?.seo || 0
      },

      // Mobile security considerations
      mobileSecurity: {
        security: heuristicResults.security,
        score: rulesResults.scores?.security || 0
      },

      // Intelligent recommendations
      recommendations: rulesResults.recommendations || [],

      // Performance insights
      insights: rulesResults.insights || [],

      // AI-powered enhancements (if available)
      ...(this.config.isAIEnabled() && aiInsights && !aiInsights.error ? {
        aiInsights: aiInsights.insights || [],
        aiPredictions: aiInsights.predictions || [],
        aiRecommendations: aiInsights.recommendations || []
      } : {}),

      // Technical details for debugging/advanced use
      technicalDetails: {
        detectorResults: this.config.includeDebugData() ? detectorResults : undefined,
        heuristicResults: this.config.includeDebugData() ? heuristicResults : undefined,
        rulesResults: this.config.includeDebugData() ? rulesResults : undefined,
        configUsed: this.config.includeDebugData() ? this.config.getActiveConfig() : undefined
      }
    };
  }

  /**
   * Calculate letter grade from numeric score
   * @param {number} score - Numeric score (0-100)
   * @returns {string} Letter grade
   * @private
   */
  calculateGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Create standardized success result
   * @param {Object} analysisResults - Analysis results
   * @returns {Object} Standardized success result
   * @private
   */
  createSuccessResult(analysisResults) {
    return {
      success: true,
      data: analysisResults,
      error: null,
      timestamp: new Date().toISOString(),
      analyzer: 'MobileAnalyzer',
      version: '1.0.0'
    };
  }

  /**
   * Create standardized error result
   * @param {string} message - Error message
   * @param {Error} error - Original error object
   * @returns {Object} Standardized error result
   * @private
   */
  createErrorResult(message, error = null) {
    return {
      success: false,
      data: null,
      error: {
        message,
        details: error?.stack || 'No additional details available',
        timestamp: new Date().toISOString(),
        analyzer: 'MobileAnalyzer'
      },
      timestamp: new Date().toISOString(),
      analyzer: 'MobileAnalyzer',
      version: '1.0.0'
    };
  }

  /**
   * Get current analysis state (for debugging)
   * @returns {Object} Current analysis state
   */
  getAnalysisState() {
    return { ...this.analysisState };
  }

  /**
   * Reset analysis state
   */
  resetAnalysisState() {
    this.analysisState = {
      detectorResults: {},
      heuristicResults: {},
      rulesResults: {},
      aiInsights: {},
      timestamp: null,
      analysisId: null
    };
  }
}

export default MobileAnalyzer;
