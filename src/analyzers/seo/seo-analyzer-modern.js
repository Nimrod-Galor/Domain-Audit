/**
 * 🚀 PHASE 2: CORE ANALYZER MODERNIZATION
 * 
 * Starting with Priority 1: SEO Analyzer Modernization
 * Implementing Combined Approach patterns for comprehensive SEO analysis
 */

/**
 * SEO Analyzer - Modernized with Combined Approach
 * 
 * Implements GPT-5 modular architecture + Claude AI enhancement + existing patterns
 * Provides comprehensive SEO analysis with optional AI insights and predictions
 */

import { BaseAnalyzer } from '../core/BaseAnalyzer.js';

// GPT-5 Style: Modular Components
import MetaTagDetector from './detectors/meta-tag-detector.js';
import HeadingDetector from './detectors/heading-detector.js';
import ContentDetector from './detectors/content-detector.js';
import LinkDetector from './detectors/link-detector.js';
import StructuredDataDetector from './detectors/structured-data-detector.js';

import KeywordAnalyzer from './heuristics/keyword-analyzer.js';
import ContentQualityAnalyzer from './heuristics/content-quality-analyzer.js';
import TechnicalSEOAnalyzer from './heuristics/technical-seo-analyzer.js';
import PerformanceAnalyzer from './heuristics/performance-analyzer.js';

import SEOScoringEngine from './rules/seo-scoring-engine.js';

// Claude Style: AI Enhancement
import SEOAIEnhancer from './ai/seo-ai-enhancer.js';

// Configuration
import SEOConfiguration from './config/seo-configuration.js';

export class SEOAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('SEOAnalyzer', {
      enableAI: options.enableAI !== false,
      enablePerformanceMonitoring: options.enablePerformanceMonitoring !== false,
      ...options
    });

    // Initialize configuration system
    this.configuration = new SEOConfiguration(options.configuration);
    const config = this.configuration.getConfig();

    // GPT-5 Style: Initialize modular components
    this.detectors = {
      metaTag: new MetaTagDetector(config.components.detectors.metaTag),
      heading: new HeadingDetector(config.components.detectors.heading),
      content: new ContentDetector(config.components.detectors.content),
      link: new LinkDetector(config.components.detectors.link),
      structuredData: new StructuredDataDetector(config.components.detectors.structuredData)
    };

    this.heuristics = {
      keyword: new KeywordAnalyzer(config.components.heuristics.keywords),
      contentQuality: new ContentQualityAnalyzer(config.components.heuristics.contentQuality),
      technical: new TechnicalSEOAnalyzer(config.components.heuristics.technicalSEO),
      performance: new PerformanceAnalyzer(config.components.heuristics.performance)
    };

    this.scoringEngine = new SEOScoringEngine(config.components.rules.scoring);

    // Claude Style: AI enhancement (optional)
    this.aiEnhancer = config.components.ai.enabled ? 
      new SEOAIEnhancer(config.components.ai) : null;

    this.log('SEOAnalyzer initialized with combined approach architecture');
  }

  /**
   * Main analysis method - implements heuristics-first approach
   * @param {Object} context - Analysis context
   * @param {Document} context.document - DOM document to analyze
   * @param {string} context.url - Page URL for context
   * @param {Object} context.options - Additional analysis options
   * @returns {Promise<Object>} Comprehensive SEO analysis results
   */
  async analyze(context) {
    // Validate input
    if (!context?.document) {
      return this.handleError('Invalid analysis context: missing document');
    }

    try {
      // Phase 1: Heuristics-first analysis (always works)
      const heuristicResults = await this.performHeuristicAnalysis(context);

      // Phase 2: AI enhancement (optional)
      const aiInsights = await this.enhanceWithAI(heuristicResults, context);

      // Combine results
      const finalResults = {
        ...heuristicResults,
        aiInsights,
        metadata: this._generateMetadata(heuristicResults, aiInsights),
        timestamp: new Date().toISOString()
      };

      return finalResults;

    } catch (error) {
      return this.handleError(`SEO analysis failed: ${error.message}`, error);
    }
  }

  /**
   * Heuristics-first analysis (core functionality that always works)
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Heuristic analysis results
   */
  async performHeuristicAnalysis(context) {
    const { document, url } = context;

    // Phase 1: Detection (GPT-5 style modular detection)
    const detections = await this._runDetections(document, url);

    // Phase 2: Heuristic Analysis (GPT-5 style business logic)
    const heuristicResults = await this._runHeuristicAnalysis(detections);

    // Phase 3: Scoring (Rules engine)
    const scoringResults = await this._runScoring(heuristicResults);

    return {
      success: true,
      url,
      detections,
      analysis: heuristicResults,
      scores: scoringResults,
      overallScore: scoringResults.overallScore,
      grade: scoringResults.grade,
      findings: scoringResults.findings,
      recommendations: scoringResults.recommendations,
      performance: scoringResults.performance
    };
  }

  /**
   * Run all detection modules (GPT-5 style pure detection)
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Promise<Object>} Detection results
   * @private
   */
  async _runDetections(document, url) {
    try {
      // Run detections in parallel for performance
      const detectionPromises = [
        this.detectors.metaTag.detect(document, url),
        this.detectors.heading.detect(document),
        this.detectors.content.detect(document),
        this.detectors.link.detect(document, url),
        this.detectors.structuredData.detect(document)
      ];

      const [metaTags, headings, content, links, structuredData] = await Promise.all(detectionPromises);

      return {
        metaTags,
        headings,
        content,
        links,
        structuredData,
        url // Include URL for context
      };

    } catch (error) {
      throw new Error(`Detection phase failed: ${error.message}`);
    }
  }

  /**
   * Run heuristic analysis (GPT-5 style business logic)
   * @param {Object} detections - Detection results
   * @returns {Promise<Object>} Heuristic analysis results
   * @private
   */
  async _runHeuristicAnalysis(detections) {
    try {
      // Run heuristic analyzers in parallel
      const heuristicPromises = [
        this.heuristics.keyword.analyze(detections),
        this.heuristics.contentQuality.analyze(detections),
        this.heuristics.technical.analyze(detections),
        this.heuristics.performance.analyze(detections)
      ];

      const [keyword, contentQuality, technical, performance] = await Promise.all(heuristicPromises);

      return {
        keyword,
        contentQuality,
        technical,
        performance
      };

    } catch (error) {
      throw new Error(`Heuristic analysis phase failed: ${error.message}`);
    }
  }

  /**
   * Run scoring engine (Rules phase)
   * @param {Object} heuristicResults - Heuristic analysis results
   * @returns {Promise<Object>} Scoring results
   * @private
   */
  async _runScoring(heuristicResults) {
    try {
      const scoringResults = await this.scoringEngine.calculateScore(heuristicResults);
      return scoringResults;

    } catch (error) {
      throw new Error(`Scoring phase failed: ${error.message}`);
    }
  }

  /**
   * AI enhancement (Claude style optional enhancement)
   * @param {Object} heuristicResults - Heuristic analysis results
   * @param {Object} context - Original analysis context
   * @returns {Promise<Object|null>} AI insights or null if disabled/failed
   */
  async enhanceWithAI(heuristicResults, context) {
    if (!this.aiEnhancer) {
      return null;
    }

    try {
      const aiInsights = await this.aiEnhancer.enhance(heuristicResults, context.detections);
      return aiInsights;

    } catch (error) {
      this.log(`AI enhancement failed: ${error.message}`, 'warn');
      return null; // Graceful degradation
    }
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata and capabilities
   */
  getMetadata() {
    return {
      name: 'SEO Analyzer',
      version: '2.0.0',
      description: 'Comprehensive SEO analysis with AI enhancement capabilities',
      category: 'SEO',
      
      architecture: {
        type: 'combined_approach',
        patterns: ['gpt5_modular', 'claude_ai', 'existing_project'],
        heuristicsFirst: true,
        aiEnhanced: !!this.aiEnhancer
      },

      capabilities: [
        'Meta tag analysis',
        'Heading structure optimization',
        'Content quality assessment',
        'Technical SEO evaluation',
        'Keyword optimization analysis',
        'Structured data validation',
        'Performance impact analysis',
        'AI-powered SEO insights',
        'Predictive SEO analytics',
        'Competitive analysis'
      ],

      components: {
        detectors: Object.keys(this.detectors),
        heuristics: Object.keys(this.heuristics),
        aiEnhancer: !!this.aiEnhancer,
        scoringEngine: true,
        configuration: true
      },

      configuration: this.configuration.getConfig(),

      author: 'Domain Audit Team',
      implementationDate: '2025-01-09',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generate comprehensive metadata for analysis results
   * @param {Object} heuristicResults - Heuristic analysis results
   * @param {Object} aiInsights - AI insights (optional)
   * @returns {Object} Analysis metadata
   * @private
   */
  _generateMetadata(heuristicResults, aiInsights) {
    return {
      analyzer: this.getMetadata(),
      analysis: {
        type: 'comprehensive_seo_analysis',
        approach: 'heuristics_first_ai_enhanced',
        completedPhases: {
          detection: true,
          heuristics: true,
          scoring: true,
          aiEnhancement: !!aiInsights
        },
        confidence: this._calculateAnalysisConfidence(heuristicResults, aiInsights)
      },
      quality: {
        dataIntegrity: this._validateResultIntegrity(heuristicResults),
        completeness: this._calculateCompleteness(heuristicResults),
        reliability: this._assessReliability(heuristicResults)
      },
      recommendations: {
        total: heuristicResults.scores?.recommendations?.length || 0,
        priority: this._categorizeRecommendationsByPriority(heuristicResults.scores?.recommendations || []),
        aiEnhanced: aiInsights ? aiInsights.recommendations?.length || 0 : 0
      }
    };
  }

  /**
   * Calculate overall analysis confidence
   * @param {Object} heuristicResults - Heuristic results
   * @param {Object} aiInsights - AI insights
   * @returns {number} Confidence score 0-1
   * @private
   */
  _calculateAnalysisConfidence(heuristicResults, aiInsights) {
    let confidence = 0.8; // Base confidence for heuristic analysis

    // Adjust based on data completeness
    const completeness = this._calculateCompleteness(heuristicResults);
    confidence *= completeness;

    // Boost confidence if AI enhancement is available and confident
    if (aiInsights && aiInsights.confidence > 0.8) {
      confidence = Math.min(1.0, confidence * 1.1);
    }

    return Math.round(confidence * 1000) / 1000;
  }

  /**
   * Calculate analysis completeness
   * @param {Object} heuristicResults - Heuristic results
   * @returns {number} Completeness score 0-1
   * @private
   */
  _calculateCompleteness(heuristicResults) {
    const expectedComponents = ['keyword', 'contentQuality', 'technical', 'performance'];
    const completedComponents = expectedComponents.filter(comp => 
      heuristicResults.analysis?.[comp]?.success !== false
    );
    
    return completedComponents.length / expectedComponents.length;
  }

  /**
   * Assess analysis reliability
   * @param {Object} heuristicResults - Heuristic results
   * @returns {string} Reliability assessment
   * @private
   */
  _assessReliability(heuristicResults) {
    const overallScore = heuristicResults.overallScore || 0;
    const confidence = this._calculateAnalysisConfidence(heuristicResults, null);

    if (confidence > 0.9 && overallScore > 0) return 'high';
    if (confidence > 0.7 && overallScore > 0) return 'medium';
    return 'low';
  }

  /**
   * Validate result integrity
   * @param {Object} heuristicResults - Heuristic results
   * @returns {boolean} True if results pass integrity checks
   * @private
   */
  _validateResultIntegrity(heuristicResults) {
    try {
      // Basic validation - check if results have expected structure
      const required = ['analysis', 'scores'];
      return required.every(prop => heuristicResults[prop] !== undefined);
    } catch (error) {
      this.log(`Result validation failed: ${error.message}`, 'warn');
      return false;
    }
  }

  /**
   * Categorize recommendations by priority
   * @param {Array} recommendations - Array of recommendations
   * @returns {Object} Categorized recommendations
   * @private
   */
  _categorizeRecommendationsByPriority(recommendations) {
    const categories = { critical: 0, high: 0, medium: 0, low: 0 };
    
    recommendations.forEach(rec => {
      const priority = rec.priority || 'medium';
      if (categories[priority] !== undefined) {
        categories[priority]++;
      }
    });

    return categories;
  }
}

// Export the modernized SEO analyzer
export default SEOAnalyzer;
