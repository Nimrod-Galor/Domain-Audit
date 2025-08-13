/**
 * ============================================================================
 * CONTENT ANALYZER MODERN - Combined Approach Implementation
 * ============================================================================
 * 
 * Modern Content Analyzer implementing the Combined Approach pattern:
 * GPT-5 Style Modular Components + Claude AI Enhancement + Existing Patterns
 * 
 * This analyzer orchestrates all content analysis components to provide
 * comprehensive content optimization insights and recommendations.
 * 
 * Architecture:
 * - Detectors (GPT-5 Style): ContentStructureDetector, ContentQualityDetector
 * - Heuristics (GPT-5 Style): ContentOptimizationAnalyzer
 * - Rules (GPT-5 Style): ContentScoringEngine
 * - AI Enhancement (Claude Style): ContentAIEnhancer
 * - Configuration: ContentConfiguration
 * - Integration: Existing ContentQualityAnalyzer, ContentIntelligenceAnalyzer
 * 
 * @module ContentAnalyzerModern
 * @version 2.0.0
 * @author AI Assistant (Combined Approach Implementation)
 * @created 2025-08-12
 */

import { BaseAnalyzer } from '../core/BaseAnalyzer.js';

// GPT-5 Style Modular Components
import ContentStructureDetector from './detectors/content-structure-detector.js';
import ContentQualityDetector from './detectors/content-quality-detector.js';
import ContentOptimizationAnalyzer from './heuristics/content-optimization-analyzer.js';
import ContentScoringEngine from './rules/content-scoring-engine.js';

// Claude Style AI Enhancement
import ContentAIEnhancer from './ai/content-ai-enhancer.js';

// Configuration Management
import ContentConfiguration from './config/content-configuration.js';

// Existing Project Components (Legacy Integration)
import { ContentQualityAnalyzer } from './ContentQualityAnalyzer.js';
import { ContentIntelligenceAnalyzer } from './ContentIntelligenceAnalyzer.js';

/**
 * Content Analyzer Modern Class
 * 
 * Implements the Combined Approach for content analysis, orchestrating
 * all detection, analysis, scoring, and AI enhancement components.
 */
export class ContentAnalyzerModern extends BaseAnalyzer {
  constructor(options = {}) {
    super(options);
    
    // Set analyzer metadata
    this.name = 'ContentAnalyzer';
    this.version = '2.0.0';
    this.approach = 'Combined (GPT-5 + Claude + Existing)';
    
    // Initialize configuration
    this.config = new ContentConfiguration(options.config || {});
    
    // Initialize GPT-5 style detectors
    this.detectors = {
      structure: new ContentStructureDetector(this.config.getDetectionSettings('structure')),
      quality: new ContentQualityDetector(this.config.getDetectionSettings('quality'))
    };
    
    // Initialize GPT-5 style heuristics
    this.heuristics = {
      optimization: new ContentOptimizationAnalyzer(options.optimization || {})
    };
    
    // Initialize GPT-5 style rules (scoring)
    this.scoringEngine = new ContentScoringEngine(this.config.getConfiguration().config.scoring || {});
    
    // Initialize Claude style AI enhancement
    this.aiEnhancer = this.config.isFeatureEnabled('aiEnhancement') 
      ? new ContentAIEnhancer(this.config.getAISettings() || {})
      : null;
    
    // Initialize existing components for integration
    this.legacyComponents = {
      qualityAnalyzer: new ContentQualityAnalyzer(options.legacy?.quality || {}),
      intelligenceAnalyzer: new ContentIntelligenceAnalyzer(options.legacy?.intelligence || {})
    };
    
    // Analysis state
    this.analysisResults = null;
    this.lastAnalysisTime = null;
  }

  /**
   * Get analyzer metadata
   * 
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: this.name,
      version: this.version,
      approach: this.approach,
      capabilities: [
        'Content Structure Analysis',
        'Content Quality Assessment',
        'SEO Optimization Analysis',
        'User Experience Evaluation',
        'Accessibility Assessment',
        'Engagement Analysis',
        'Conversion Optimization',
        'AI-Powered Insights',
        'Predictive Analysis',
        'Competitive Intelligence',
        'Content Strategy Recommendations'
      ],
      components: {
        detectors: Object.keys(this.detectors),
        heuristics: Object.keys(this.heuristics),
        scoringEngine: 'ContentScoringEngine',
        aiEnhancer: this.aiEnhancer ? 'ContentAIEnhancer' : null,
        legacyIntegration: Object.keys(this.legacyComponents)
      },
      features: {
        aiEnhancement: this.config.isFeatureEnabled('aiEnhancement'),
        predictiveAnalysis: this.config.isFeatureEnabled('predictiveAnalysis'),
        competitiveIntelligence: this.config.isFeatureEnabled('competitiveIntelligence'),
        semanticAnalysis: this.config.isFeatureEnabled('semanticAnalysis')
      },
      priority: 'high',
      tags: ['content', 'seo', 'ux', 'accessibility', 'ai-enhanced', 'combined-approach']
    };
  }

  /**
   * Validate analysis context
   * 
   * @param {Object} context - Analysis context
   * @returns {boolean} Validation result
   */
  validate(context) {
    if (!context) {
      console.warn('Content analysis context is required');
      return false;
    }
    
    if (!context.document && !context.dom?.document) {
      console.warn('Document is required for content analysis');
      return false;
    }
    
    if (!context.url) {
      console.warn('URL is recommended for comprehensive content analysis');
      // Don't fail validation, just warn
    }
    
    return true;
  }

  /**
   * Perform heuristic analysis (Combined Approach Phase 1)
   * 
   * @param {Object} context - Analysis context
   * @returns {Object} Heuristic analysis results
   */
  async performHeuristicAnalysis(context) {
    try {
      console.log('🔍 Starting Content Analyzer heuristic analysis...');
      
      // Phase 1: Detection (GPT-5 Style Modular Components)
      const detectionResults = await this.runDetectionPhase(context);
      
      // Phase 2: Analysis (GPT-5 Style Heuristics)
      const analysisResults = await this.runAnalysisPhase(detectionResults, context);
      
      // Phase 3: Scoring (GPT-5 Style Rules)
      const scoringResults = await this.runScoringPhase(analysisResults, context);
      
      // Phase 4: Legacy Integration
      const legacyResults = await this.runLegacyIntegration(context);
      
      // Combine all results
      const heuristicResults = {
        detection: detectionResults,
        analysis: analysisResults,
        scoring: scoringResults,
        legacy: legacyResults,
        score: scoringResults.overall?.score || 0,
        grade: scoringResults.grade || 'F',
        metadata: {
          analyzer: this.name,
          version: this.version,
          approach: 'heuristics',
          timestamp: Date.now(),
          processingTime: Date.now() - context.startTime || 0
        }
      };
      
      this.analysisResults = heuristicResults;
      this.lastAnalysisTime = Date.now();
      
      console.log('✅ Content heuristic analysis completed');
      return heuristicResults;
      
    } catch (error) {
      console.error('❌ Content heuristic analysis failed:', error.message);
      throw new Error(`Content heuristic analysis failed: ${error.message}`);
    }
  }

  /**
   * Perform AI enhancement (Combined Approach Phase 2)
   * 
   * @param {Object} heuristicResults - Results from heuristic analysis
   * @param {Object} context - Analysis context
   * @returns {Object} AI-enhanced results
   */
  async performAIEnhancement(heuristicResults, context) {
    try {
      // Check if AI enhancement is enabled and available
      if (!this.aiEnhancer || !this.config.isFeatureEnabled('aiEnhancement')) {
        console.log('ℹ️ AI enhancement disabled, using heuristic results');
        return {
          ...heuristicResults,
          metadata: {
            ...heuristicResults.metadata,
            aiEnhanced: false,
            aiReason: 'AI enhancement disabled or not available'
          }
        };
      }
      
      console.log('🤖 Starting Content AI enhancement...');
      
      const startTime = Date.now();
      
      // Perform AI enhancement
      const enhancedResults = await this.aiEnhancer.enhance(heuristicResults, context);
      
      console.log(`✅ Content AI enhancement completed in ${Date.now() - startTime}ms`);
      return enhancedResults;
      
    } catch (error) {
      console.warn('⚠️ AI enhancement failed, falling back to heuristic results:', error.message);
      
      // Graceful fallback to heuristic results
      return {
        ...heuristicResults,
        metadata: {
          ...heuristicResults.metadata,
          aiEnhanced: false,
          aiError: error.message,
          fallbackMode: true
        }
      };
    }
  }

  /**
   * Run detection phase (GPT-5 Style Detectors)
   * 
   * @param {Object} context - Analysis context
   * @returns {Object} Detection results
   */
  async runDetectionPhase(context) {
    const detectionResults = {};
    
    // Run structure detection
    if (this.detectors.structure) {
      try {
        detectionResults.structure = await this.detectors.structure.detect(context);
      } catch (error) {
        console.warn('Structure detection failed:', error.message);
        detectionResults.structure = null;
      }
    }
    
    // Run quality detection
    if (this.detectors.quality) {
      try {
        detectionResults.quality = await this.detectors.quality.detect(context);
      } catch (error) {
        console.warn('Quality detection failed:', error.message);
        detectionResults.quality = null;
      }
    }
    
    return detectionResults;
  }

  /**
   * Run analysis phase (GPT-5 Style Heuristics)
   * 
   * @param {Object} detectionResults - Detection results
   * @param {Object} context - Analysis context
   * @returns {Object} Analysis results
   */
  async runAnalysisPhase(detectionResults, context) {
    if (!this.heuristics.optimization) {
      console.warn('Content optimization analyzer not available');
      return {};
    }
    
    try {
      return await this.heuristics.optimization.analyze(detectionResults, context);
    } catch (error) {
      console.warn('Content optimization analysis failed:', error.message);
      return {};
    }
  }

  /**
   * Run scoring phase (GPT-5 Style Rules)
   * 
   * @param {Object} analysisResults - Analysis results
   * @param {Object} context - Analysis context
   * @returns {Object} Scoring results
   */
  async runScoringPhase(analysisResults, context) {
    if (!this.scoringEngine) {
      console.warn('Content scoring engine not available');
      return { overall: { score: 0 }, grade: 'F' };
    }
    
    try {
      return await this.scoringEngine.calculateContentScore(analysisResults, context);
    } catch (error) {
      console.warn('Content scoring failed:', error.message);
      return { overall: { score: 0 }, grade: 'F' };
    }
  }

  /**
   * Run legacy component integration
   * 
   * @param {Object} context - Analysis context
   * @returns {Object} Legacy analysis results
   */
  async runLegacyIntegration(context) {
    const legacyResults = {};
    
    // Integrate ContentQualityAnalyzer
    if (this.legacyComponents.qualityAnalyzer) {
      try {
        legacyResults.qualityAnalysis = await this.legacyComponents.qualityAnalyzer.analyze(context);
      } catch (error) {
        console.warn('Legacy quality analysis failed:', error.message);
        legacyResults.qualityAnalysis = null;
      }
    }
    
    // Integrate ContentIntelligenceAnalyzer
    if (this.legacyComponents.intelligenceAnalyzer) {
      try {
        legacyResults.intelligenceAnalysis = await this.legacyComponents.intelligenceAnalyzer.analyze(context);
      } catch (error) {
        console.warn('Legacy intelligence analysis failed:', error.message);
        legacyResults.intelligenceAnalysis = null;
      }
    }
    
    return legacyResults;
  }

  /**
   * Get configuration information
   * 
   * @returns {Object} Configuration information
   */
  getConfiguration() {
    return this.config.getConfiguration();
  }

  /**
   * Update configuration
   * 
   * @param {Object} updates - Configuration updates
   * @returns {boolean} Success status
   */
  updateConfiguration(updates) {
    return this.config.updateConfiguration(updates);
  }

  /**
   * Check if feature is enabled
   * 
   * @param {string} featureName - Feature name
   * @returns {boolean} Feature enabled status
   */
  isFeatureEnabled(featureName) {
    return this.config.isFeatureEnabled(featureName);
  }

  /**
   * Get performance budgets for content analysis
   * 
   * @returns {Object} Performance budgets
   */
  getPerformanceBudgets() {
    const budgets = this.config.getConfiguration().config.budgets;
    return {
      analysis: budgets.analysis,
      content: budgets.content,
      ai: budgets.ai,
      overall: {
        maxProcessingTime: budgets.analysis.maxProcessingTime,
        maxContentSize: budgets.content.maxContentLength,
        aiConfidenceThreshold: budgets.ai.aiConfidenceThreshold
      }
    };
  }

  /**
   * Assess budget compliance for analysis results
   * 
   * @param {Object} analysisResults - Analysis results to assess
   * @returns {Object} Budget compliance assessment
   */
  assessBudgetCompliance(analysisResults) {
    const budgets = this.getPerformanceBudgets();
    const compliance = {
      overall: true,
      violations: [],
      warnings: []
    };
    
    // Check processing time compliance
    const processingTime = analysisResults.metadata?.processingTime || 0;
    if (processingTime > budgets.analysis.maxProcessingTime) {
      compliance.overall = false;
      compliance.violations.push({
        type: 'processing-time',
        actual: processingTime,
        limit: budgets.analysis.maxProcessingTime,
        severity: 'high'
      });
    }
    
    // Check content size compliance
    const contentLength = analysisResults.detection?.quality?.metadata?.contentLength || 0;
    if (contentLength > budgets.content.maxContentLength) {
      compliance.warnings.push({
        type: 'content-size',
        actual: contentLength,
        limit: budgets.content.maxContentLength,
        severity: 'medium'
      });
    }
    
    // Check AI confidence compliance
    const aiConfidence = analysisResults.metadata?.aiConfidence || 1;
    if (aiConfidence < budgets.ai.aiConfidenceThreshold) {
      compliance.warnings.push({
        type: 'ai-confidence',
        actual: aiConfidence,
        limit: budgets.ai.aiConfidenceThreshold,
        severity: 'low'
      });
    }
    
    return compliance;
  }

  /**
   * Get analysis summary for reporting
   * 
   * @returns {Object} Analysis summary
   */
  getAnalysisSummary() {
    if (!this.analysisResults) {
      return {
        status: 'not-analyzed',
        message: 'No analysis results available'
      };
    }
    
    const results = this.analysisResults;
    
    return {
      status: 'analyzed',
      timestamp: this.lastAnalysisTime,
      score: results.score,
      grade: results.grade,
      approach: results.metadata.approach,
      aiEnhanced: results.metadata.aiEnhanced || false,
      componentsAnalyzed: {
        structure: !!results.detection?.structure,
        quality: !!results.detection?.quality,
        optimization: !!results.analysis,
        scoring: !!results.scoring,
        legacy: !!results.legacy
      },
      keyInsights: this.extractKeyInsights(results),
      recommendations: this.extractTopRecommendations(results),
      performance: {
        processingTime: results.metadata.processingTime,
        budgetCompliance: this.assessBudgetCompliance(results)
      }
    };
  }

  /**
   * Extract key insights from analysis results
   * 
   * @param {Object} results - Analysis results
   * @returns {Array} Key insights
   */
  extractKeyInsights(results) {
    const insights = [];
    
    // Extract score insight
    if (results.score >= 90) {
      insights.push('Excellent content performance');
    } else if (results.score >= 75) {
      insights.push('Good content performance with optimization opportunities');
    } else if (results.score >= 60) {
      insights.push('Average content performance, requires improvement');
    } else {
      insights.push('Poor content performance, immediate attention needed');
    }
    
    // Extract AI insights if available
    if (results.aiInsights?.keyFindings) {
      insights.push(...results.aiInsights.keyFindings.slice(0, 3));
    }
    
    return insights;
  }

  /**
   * Extract top recommendations from analysis results
   * 
   * @param {Object} results - Analysis results
   * @returns {Array} Top recommendations
   */
  extractTopRecommendations(results) {
    const recommendations = [];
    
    // Extract high-priority recommendations
    if (results.analysis?.recommendations?.priority?.high) {
      recommendations.push(...results.analysis.recommendations.priority.high.slice(0, 3));
    }
    
    // Extract AI recommendations if available
    if (results.advancedRecommendations?.prioritizedActions) {
      recommendations.push(...results.advancedRecommendations.prioritizedActions.slice(0, 2));
    }
    
    return recommendations;
  }
}

export default ContentAnalyzerModern;
