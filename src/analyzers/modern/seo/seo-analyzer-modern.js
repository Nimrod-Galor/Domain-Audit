/**
 * ============================================================================
 * SEO ANALYZER MODERN - COMBINED APPROACH ORCHESTRATOR
 * ============================================================================
 * 
 * Main orchestrator for the modern SEO Analyzer using Combined Approach architecture
 * Integrates GPT-5 style detectors, Claude AI heuristics, and rules engine
 * 
 * This is the 18th Combined Approach implementation following the proven pattern:
 * - Performance Analyzer (1st) ✅
 * - Content Analyzer (2nd) ✅ 
 * - Security Analyzer (3rd) ✅
 * - Accessibility Analyzer (4th) ✅
 * - Business Intelligence Analyzer (5th) ✅
 * - E-commerce Analyzer (6th) ✅
 * - UX & Conversion Analyzer (7th) ✅
 * - SEO Analyzer (8th) ✅ [INFRASTRUCTURE COMPLETED]
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration_pattern Combined Approach (18th Implementation - Infrastructure Complete)
 */

import { BaseAnalyzer } from '../../core/BaseAnalyzer.js';
import { AnalyzerCategories } from '../../core/AnalyzerInterface.js';

// GPT-5 Style Detectors
import { MetaTagDetector } from './detectors/meta-tag-detector.js';
import { HeadingStructureDetector } from './detectors/heading-structure-detector.js';
import { ContentElementDetector } from './detectors/content-element-detector.js';
import { LinkStructureDetector } from './detectors/link-structure-detector.js';
import { StructuredDataDetector } from './detectors/structured-data-detector.js';

// Claude AI Enhanced Heuristics
import { TechnicalSEOAnalyzer } from './heuristics/technical-seo-analyzer.js';
import { KeywordOptimizationAnalyzer } from './heuristics/keyword-optimization-analyzer.js';
import { ContentQualityAnalyzer } from './heuristics/content-quality-analyzer.js';

// GPT-5 Style Rules Engine
import { SEORulesEngine } from './rules/seo-rules-engine.js';

// AI Enhancement Layer (Optional)
import { SEOAIEnhancement } from './ai/seo-ai-enhancer.js';

// Configuration Management
import { SEOConfiguration } from './config/seo-configuration.js';

export class SEOAnalyzerModern extends BaseAnalyzer {
  constructor(options = {}) {
    super('SEOAnalyzerModern');
    
    this.category = AnalyzerCategories.SEO;
    this.version = '1.0.0';
    
    this.options = {
      enableAIEnhancement: options.enableAIEnhancement !== false,
      enablePerformanceMonitoring: options.enablePerformanceMonitoring !== false,
      enableAdvancedAnalysis: options.enableAdvancedAnalysis !== false,
      enableCaching: options.enableCaching !== false,
      analysisDepth: options.analysisDepth || 'comprehensive',
      aiConfidenceThreshold: options.aiConfidenceThreshold || 0.7,
      ...options
    };

    // Initialize configuration management
    this.configuration = new SEOConfiguration({
      analysisDepth: this.options.analysisDepth,
      enableAI: this.options.enableAIEnhancement,
      ...options.configuration
    });

    // GPT-5 Style: Initialize detection components
    this.detectors = {
      metaTag: new MetaTagDetector(this.configuration.getDetectorConfig('metaTag')),
      headingStructure: new HeadingStructureDetector(this.configuration.getDetectorConfig('headingStructure')),
      contentElement: new ContentElementDetector(this.configuration.getDetectorConfig('contentElement')),
      linkStructure: new LinkStructureDetector(this.configuration.getDetectorConfig('linkStructure')),
      structuredData: new StructuredDataDetector(this.configuration.getDetectorConfig('structuredData'))
    };

    // Claude AI Enhanced: Initialize heuristic analyzers
    this.heuristics = {
      technical: new TechnicalSEOAnalyzer(this.configuration.getHeuristicConfig('technical')),
      keyword: new KeywordOptimizationAnalyzer(this.configuration.getHeuristicConfig('keyword')),
      contentQuality: new ContentQualityAnalyzer(this.configuration.getHeuristicConfig('contentQuality'))
    };

    // GPT-5 Style: Initialize rules engine
    this.rulesEngine = new SEORulesEngine(this.configuration.getRulesConfig());

    // Claude AI: Optional AI enhancement layer
    this.aiEnhancer = this.options.enableAIEnhancement ? 
      new SEOAIEnhancement(this.configuration.getAIConfig()) : null;

    // Performance monitoring
    this.performanceMetrics = {
      totalAnalyses: 0,
      averageExecutionTime: 0,
      successRate: 0,
      cacheHitRate: 0,
      errors: 0
    };

    // Caching system
    this.cache = this.options.enableCaching ? new Map() : null;

    this.log('info', 'SEO Analyzer Modern initialized with Combined Approach architecture');
    this.log('info', `Features: Detectors(${Object.keys(this.detectors).length}), Heuristics(${Object.keys(this.heuristics).length}), Rules Engine(1), AI Enhancement(${!!this.aiEnhancer})`);
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'SEOAnalyzerModern',
      version: this.version,
      category: this.category,
      description: 'Modern SEO analyzer using Combined Approach architecture with AI enhancement',
      author: 'Development Team',
      
      // Architecture information
      architecture: {
        pattern: 'Combined Approach',
        implementation: '18th Implementation - Infrastructure Complete',
        components: {
          detectors: this.detectors ? Object.keys(this.detectors).length : 0,
          heuristics: this.heuristics ? Object.keys(this.heuristics).length : 0,
          rulesEngine: 1,
          aiEnhancement: !!this.aiEnhancer,
          configuration: 1
        }
      },

      // Capabilities
      capabilities: [
        'comprehensive_seo_analysis',
        'meta_tag_optimization',
        'heading_structure_analysis',
        'content_quality_assessment',
        'keyword_optimization',
        'technical_seo_evaluation',
        'structured_data_validation',
        'link_analysis',
        'performance_monitoring',
        'ai_enhanced_insights',
        'best_practices_validation',
        'scoring_and_grading'
      ],

      // Component details
      components: {
        detectors: this.detectors ? {
          metaTag: this.detectors.metaTag?.getMetadata ? this.detectors.metaTag.getMetadata() : { name: 'MetaTagDetector', enabled: true },
          headingStructure: this.detectors.headingStructure?.getMetadata ? this.detectors.headingStructure.getMetadata() : { name: 'HeadingStructureDetector', enabled: true },
          contentElement: this.detectors.contentElement?.getMetadata ? this.detectors.contentElement.getMetadata() : { name: 'ContentElementDetector', enabled: true },
          linkStructure: this.detectors.linkStructure?.getMetadata ? this.detectors.linkStructure.getMetadata() : { name: 'LinkStructureDetector', enabled: true },
          structuredData: this.detectors.structuredData?.getMetadata ? this.detectors.structuredData.getMetadata() : { name: 'StructuredDataDetector', enabled: true }
        } : {},
        heuristics: this.heuristics ? {
          technical: this.heuristics.technical?.getMetadata ? this.heuristics.technical.getMetadata() : { name: 'TechnicalSEOAnalyzer', enabled: true },
          keyword: this.heuristics.keyword?.getMetadata ? this.heuristics.keyword.getMetadata() : { name: 'KeywordOptimizationAnalyzer', enabled: true },
          contentQuality: this.heuristics.contentQuality?.getMetadata ? this.heuristics.contentQuality.getMetadata() : { name: 'ContentQualityAnalyzer', enabled: true }
        } : {},
        rulesEngine: this.rulesEngine?.getMetadata ? this.rulesEngine.getMetadata() : null,
        aiEnhancer: this.aiEnhancer?.getMetadata ? this.aiEnhancer.getMetadata() : (this.aiEnhancer ? { name: 'SEOAIEnhancement', enabled: true } : null)
      },

      // Performance information
      performance: {
        averageExecutionTime: `${this.performanceMetrics?.averageExecutionTime || 0}ms`,
        successRate: `${this.performanceMetrics?.successRate || 0}%`,
        totalAnalyses: this.performanceMetrics?.totalAnalyses || 0,
        memoryUsage: 'Medium',
        accuracy: 'High'
      },

      // Standards and frameworks
      standards: ['Google SEO Guidelines', 'Schema.org', 'W3C Standards', 'Core Web Vitals'],
      frameworks: ['Combined Approach Pattern', 'GPT-5 Modular Architecture', 'Claude AI Enhancement'],
      
      integration: 'Combined Approach Pattern (18th Implementation - Infrastructure Complete)',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Validate analysis context
   * @param {Object} context - Analysis context
   * @returns {boolean} Whether context is valid
   */
  validate(context) {
    if (!context) {
      this.handleError('Analysis context is required', 'CONTEXT_MISSING');
      return false;
    }

    const document = context.document || (context.dom && context.dom.window && context.dom.window.document);
    if (!document) {
      this.handleError('Document object is required for SEO analysis', 'DOCUMENT_MISSING');
      return false;
    }

    return true;
  }

  /**
   * Perform comprehensive SEO analysis using Combined Approach
   * @param {Object} context - Analysis context containing DOM and page data
   * @returns {Promise<Object>} SEO analysis results
   */
  async analyze(context) {
    const startTime = Date.now();

    try {
      // Increment analysis counter
      this.performanceMetrics.totalAnalyses++;

      if (!this.validate(context)) {
        this.performanceMetrics.errors++;
        return this.createErrorResult('Invalid analysis context');
      }

      this.log('info', 'Starting Combined Approach SEO analysis');

      const { document, dom, url = '', pageData = {} } = context;
      const doc = document || (dom && dom.window && dom.window.document);

      // Check cache first
      const cacheKey = this._generateCacheKey(url, doc);
      if (this.cache && this.cache.has(cacheKey)) {
        this.log('info', 'Returning cached SEO analysis results');
        return this._updateCacheHitMetrics(this.cache.get(cacheKey));
      }

      // Phase 1: GPT-5 Style Detection
      this.log('info', 'Phase 1: Running GPT-5 style detectors');
      const detectionResults = await this._runDetectionPhase(doc, url, pageData);

      // Phase 2: Claude AI Enhanced Heuristic Analysis
      this.log('info', 'Phase 2: Running Claude AI enhanced heuristics');
      const heuristicResults = await this._runHeuristicPhase(detectionResults);

      // Phase 3: GPT-5 Style Rules Engine
      this.log('info', 'Phase 3: Running GPT-5 style rules engine');
      const rulesResults = await this._runRulesPhase(heuristicResults);

      // Phase 4: Claude AI Enhancement (Optional)
      this.log('info', 'Phase 4: Running Claude AI enhancement');
      const aiResults = await this._runAIEnhancementPhase(heuristicResults, rulesResults, context);

      // Compile final results
      const finalResults = await this._compileResults({
        detections: detectionResults,
        heuristics: heuristicResults,
        rules: rulesResults,
        ai: aiResults,
        context: { url, startTime }
      });

      // Update performance metrics
      this._updatePerformanceMetrics(startTime, true);

      // Cache results if enabled
      if (this.cache) {
        this.cache.set(cacheKey, finalResults);
      }

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.log('info', `SEO analysis completed successfully in ${executionTime}ms`);
      this.log('info', `Overall Score: ${finalResults.data.score}% (${finalResults.data.grade})`);

      return finalResults;

    } catch (error) {
      this.performanceMetrics.errors++;
      this._updatePerformanceMetrics(startTime, false);
      
      return this.handleError('SEO analysis failed', error, {
        seoOptimization: 'critical',
        searchReadiness: 'poor',
        score: 0,
        grade: 'F'
      });
    }
  }

  /**
   * Run GPT-5 style detection phase
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @param {Object} pageData - Additional page data
   * @returns {Promise<Object>} Detection results
   */
  async _runDetectionPhase(document, url, pageData) {
    try {
      const detectionPromises = [
        this.detectors.metaTag.analyze({ document, url, pageData }),
        this.detectors.headingStructure.analyze({ document, url, pageData }),
        this.detectors.contentElement.analyze({ document, url, pageData }),
        this.detectors.linkStructure.analyze({ document, url, pageData }),
        this.detectors.structuredData.analyze({ document, url, pageData })
      ];

      const [metaTagResults, headingResults, contentResults, linkResults, structuredDataResults] = 
        await Promise.all(detectionPromises);

      return {
        success: true,
        metaTags: metaTagResults.data || metaTagResults,
        headings: headingResults.data || headingResults,
        content: contentResults.data || contentResults,
        links: linkResults.data || linkResults,
        structuredData: structuredDataResults.data || structuredDataResults,
        detectionTime: Date.now(),
        detectorsRun: Object.keys(this.detectors).length
      };

    } catch (error) {
      this.log('error', `Detection phase failed: ${error.message}`);
      throw new Error(`Detection phase failed: ${error.message}`);
    }
  }

  /**
   * Run Claude AI enhanced heuristic analysis phase
   * @param {Object} detectionResults - Detection results
   * @returns {Promise<Object>} Heuristic analysis results
   */
  async _runHeuristicPhase(detectionResults) {
    try {
      const heuristicPromises = [
        this.heuristics.technical.analyze({ detections: detectionResults }),
        this.heuristics.keyword.analyze({ detections: detectionResults }),
        this.heuristics.contentQuality.analyze({ detections: detectionResults })
      ];

      const [technicalResults, keywordResults, contentQualityResults] = 
        await Promise.all(heuristicPromises);

      return {
        success: true,
        technical: technicalResults.data || technicalResults,
        keyword: keywordResults.data || keywordResults,
        contentQuality: contentQualityResults.data || contentQualityResults,
        heuristicTime: Date.now(),
        heuristicsRun: Object.keys(this.heuristics).length
      };

    } catch (error) {
      this.log('error', `Heuristic phase failed: ${error.message}`);
      throw new Error(`Heuristic phase failed: ${error.message}`);
    }
  }

  /**
   * Run GPT-5 style rules engine phase
   * @param {Object} heuristicResults - Heuristic analysis results
   * @returns {Promise<Object>} Rules engine results
   */
  async _runRulesPhase(heuristicResults) {
    try {
      const rulesResults = await this.rulesEngine.calculateScore(heuristicResults);

      return {
        success: true,
        ...rulesResults,
        rulesTime: Date.now()
      };

    } catch (error) {
      this.log('error', `Rules phase failed: ${error.message}`);
      throw new Error(`Rules phase failed: ${error.message}`);
    }
  }

  /**
   * Run Claude AI enhancement phase (optional)
   * @param {Object} heuristicResults - Heuristic results
   * @param {Object} rulesResults - Rules results
   * @param {Object} context - Original context
   * @returns {Promise<Object|null>} AI enhancement results or null
   */
  async _runAIEnhancementPhase(heuristicResults, rulesResults, context) {
    if (!this.aiEnhancer) {
      this.log('info', 'AI enhancement disabled, skipping phase');
      return null;
    }

    try {
      const seoResults = {
        heuristics: heuristicResults,
        rules: rulesResults,
        score: rulesResults.overallScore || 0
      };

      const aiResults = await this.aiEnhancer.enhanceSEOAnalysis(seoResults, context);

      // Validate AI confidence threshold
      if (aiResults && aiResults.confidence_level >= this.options.aiConfidenceThreshold) {
        this.log('info', `SEO AI enhancement successful with confidence: ${aiResults.confidence_level}`);
        return {
          success: true,
          ...aiResults,
          aiTime: Date.now()
        };
      } else {
        this.log('warn', `SEO AI enhancement confidence too low: ${aiResults?.confidence_level || 0}`);
        return null;
      }

    } catch (error) {
      this.log('warn', `SEO AI enhancement failed: ${error.message}`);
      return null; // Graceful degradation
    }
  }

  /**
   * Compile final analysis results
   * @param {Object} results - All phase results
   * @returns {Object} Final compiled results
   */
  async _compileResults({ detections, heuristics, rules, ai, context }) {
    const { url, startTime } = context;
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    // Calculate overall scores and metrics
    const overallScore = rules.overallScore || 0;
    const grade = rules.grade || 'F';
    const recommendations = [
      ...(rules.recommendations || []),
      ...(ai?.recommendations || [])
    ];

    // Determine optimization levels
    const seoOptimization = this._getSEOOptimizationLevel(overallScore);
    const searchReadiness = this._getSearchReadinessLevel(overallScore);

    return {
      success: true,
      data: {
        // Summary metrics
        seoOptimization,
        searchReadiness,
        score: overallScore,
        grade,
        
        // Detailed results
        detections,
        analysis: heuristics,
        scoring: rules,
        aiInsights: ai,
        
        // Strategic information
        recommendations,
        insights: this._generateInsights(heuristics, rules, ai),
        opportunities: this._identifyOpportunities(heuristics, rules),
        
        // Technical metadata
        metadata: this.getMetadata(),
        performance: {
          executionTime,
          phaseBreakdown: {
            detection: detections.detectionTime - startTime,
            heuristics: heuristics.heuristicTime - detections.detectionTime,
            rules: rules.rulesTime - heuristics.heuristicTime,
            ai: ai ? ai.aiTime - rules.rulesTime : 0
          }
        }
      },
      performance: {
        executionTime,
        timestamp: new Date().toISOString(),
        memoryUsage: process.memoryUsage ? process.memoryUsage().heapUsed : 'N/A',
        cacheUsed: !!this.cache
      }
    };
  }

  /**
   * Get SEO optimization level
   * @param {number} score - Overall SEO score
   * @returns {string} SEO optimization level
   */
  _getSEOOptimizationLevel(score) {
    if (score >= 90) return 'exceptional';
    if (score >= 80) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 60) return 'adequate';
    if (score >= 40) return 'poor';
    return 'critical';
  }

  /**
   * Get search readiness level
   * @param {number} score - Overall SEO score
   * @returns {string} Search readiness level
   */
  _getSearchReadinessLevel(score) {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 55) return 'fair';
    if (score >= 40) return 'poor';
    return 'very_poor';
  }

  // ============================================================================
  // UTILITY AND HELPER METHODS
  // ============================================================================

  _generateCacheKey(url, document) {
    const title = document.title || '';
    const timestamp = Math.floor(Date.now() / (1000 * 60 * 5)); // 5-minute buckets
    return `seo_${btoa(url + title).slice(0, 20)}_${timestamp}`;
  }

  _updateCacheHitMetrics(cachedResult) {
    this.performanceMetrics.cacheHitRate = 
      (this.performanceMetrics.cacheHitRate * this.performanceMetrics.totalAnalyses + 1) / 
      (this.performanceMetrics.totalAnalyses + 1);
    return cachedResult;
  }

  _updatePerformanceMetrics(startTime, success) {
    const executionTime = Date.now() - startTime;
    const totalAnalyses = this.performanceMetrics.totalAnalyses;
    
    this.performanceMetrics.averageExecutionTime = 
      (this.performanceMetrics.averageExecutionTime * (totalAnalyses - 1) + executionTime) / totalAnalyses;
    
    if (success) {
      this.performanceMetrics.successRate = 
        (this.performanceMetrics.successRate * (totalAnalyses - 1) + 100) / totalAnalyses;
    } else {
      this.performanceMetrics.successRate = 
        (this.performanceMetrics.successRate * (totalAnalyses - 1)) / totalAnalyses;
    }
  }

  _generateInsights(heuristics, rules, ai) {
    const insights = [];
    
    // Add rule-based insights
    if (rules.findings) {
      insights.push(...rules.findings.strengths.map(s => ({ type: 'strength', source: 'rules', content: s })));
      insights.push(...rules.findings.opportunities.map(o => ({ type: 'opportunity', source: 'rules', content: o })));
    }
    
    // Add AI insights if available
    if (ai && ai.insights) {
      insights.push(...ai.insights.map(i => ({ type: 'ai_insight', source: 'ai', content: i })));
    }
    
    return insights;
  }

  _identifyOpportunities(heuristics, rules) {
    const opportunities = [];
    
    // Identify opportunities based on scores
    if (heuristics.keyword?.score < 70) {
      opportunities.push({
        area: 'keyword_optimization',
        potential: 'medium',
        description: 'Keyword optimization improvements could boost search visibility'
      });
    }
    
    if (heuristics.technical?.score < 80) {
      opportunities.push({
        area: 'technical_seo',
        potential: 'high',
        description: 'Technical SEO improvements could significantly improve search performance'
      });
    }
    
    return opportunities;
  }
}

// Export as default for Combined Approach pattern consistency
export default SEOAnalyzerModern;
