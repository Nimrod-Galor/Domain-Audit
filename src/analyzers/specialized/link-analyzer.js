/**
 * ============================================================================
 * LINK ANALYZER - COMBINED APPROACH IMPLEMENTATION (15th)
 * ============================================================================
 * 
 * Main Link Analyzer implementing the Combined Approach pattern.
 * Comprehensive link analysis system with advanced link intelligence,
 * SEO optimization, and link relationship mapping.
 * 
 * Combined Approach Architecture:
 * - GPT-5 Style Modular Detectors (link detection, analysis, validation)
 * - Claude AI Heuristic Analysis (link patterns, SEO optimization, quality assessment)
 * - Rules Engine (intelligent scoring, link health assessment)
 * - AI Enhancement (predictive link analysis, strategic insights)
 * - Configuration Management (adaptive settings, analysis profiles)
 * 
 * This is the 15th Combined Approach implementation following the proven pattern:
 * 1. ✅ Performance Analyzer (1st)
 * 2. ✅ Content Analyzer (2nd) 
 * 3. ✅ Security Analyzer (3rd)
 * 4. ✅ Accessibility Analyzer (4th)
 * 5. ✅ Business Intelligence Analyzer (5th)
 * 6. ✅ E-commerce Analyzer (6th)
 * 7. ✅ UX & Conversion Analyzer (7th)
 * 8. ✅ SEO Analyzer (8th)
 * 9. ✅ Technical Analyzer (9th)
 * 10. ✅ Social Media Analyzer (10th)
 * 11. ✅ Third Party Analyzer (11th)
 * 12. ✅ Resource Analyzer (12th)
 * 13. ✅ E-commerce Analyzer Combined Approach (13th)
 * 14. ✅ Mobile Analyzer Combined Approach (14th)
 * 15. 🔄 Link Analyzer Combined Approach (15th) [Current Implementation]
 * 
 * Features:
 * - Comprehensive internal/external link analysis
 * - Advanced anchor text optimization and analysis
 * - Link authority and quality assessment
 * - Broken link detection and validation
 * - Link relationship mapping and topology analysis
 * - SEO link optimization recommendations
 * - Link distribution and pattern analysis
 * - Contextual relevance evaluation
 * - Link velocity and growth tracking
 * - Competitive link analysis
 * 
 * @module LinkAnalyzer
 * @version 2.0.0
 * @author Development Team
 * @integration_pattern Combined Approach (15th Implementation)
 * @created 2025-08-13
 */

import { BaseAnalyzer } from './core/BaseAnalyzer.js';
import { AnalyzerCategories } from './core/AnalyzerInterface.js';

// GPT-5 Style Modular Detectors
import { InternalLinkDetector } from './modern/link/detectors/internal-link-detector.js';
import { ExternalLinkDetector } from './modern/link/detectors/external-link-detector.js';
import { AnchorTextDetector } from './modern/link/detectors/anchor-text-detector.js';
import { LinkQualityDetector } from './modern/link/detectors/link-quality-detector.js';
import { BrokenLinkDetector } from './modern/link/detectors/broken-link-detector.js';
import { LinkStructureDetector } from './modern/link/detectors/link-structure-detector.js';
import { LinkContextDetector } from './modern/link/detectors/link-context-detector.js';

// Claude AI Style Heuristic Analyzers
import { LinkSEOAnalyzer } from './modern/link/heuristics/link-seo-analyzer.js';
import { LinkDistributionAnalyzer } from './modern/link/heuristics/link-distribution-analyzer.js';
import { LinkAuthorityAnalyzer } from './modern/link/heuristics/link-authority-analyzer.js';
import { LinkRelevanceAnalyzer } from './modern/link/heuristics/link-relevance-analyzer.js';
import { LinkPatternAnalyzer } from './modern/link/heuristics/link-pattern-analyzer.js';
import { LinkCompetitiveAnalyzer } from './modern/link/heuristics/link-competitive-analyzer.js';

// Rules Engine and AI Enhancement
import { LinkRulesEngine } from './modern/link/rules/index.js';
import { LinkAIEnhancement } from './modern/link/ai/index.js';
import { LinkAnalyzerConfig } from './modern/link/config/index.js';

/**
 * Link Analyzer - Combined Approach Implementation
 * 
 * Provides comprehensive link analysis with advanced intelligence,
 * SEO optimization insights, and link strategy recommendations.
 */
export class LinkAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('LinkAnalyzer', {
      enableAllDetectors: options.enableAllDetectors !== false,
      enableHeuristics: options.enableHeuristics !== false,
      enableRulesEngine: options.enableRulesEngine !== false,
      enableAIEnhancement: options.enableAIEnhancement !== false,
      enableBrokenLinkCheck: options.enableBrokenLinkCheck !== false,
      enableAuthorityAnalysis: options.enableAuthorityAnalysis !== false,
      strictAnalysis: options.strictAnalysis || false,
      analysisDepth: options.analysisDepth || 'comprehensive',
      ...options
    });

    // Initialize configuration system
    this.config = new LinkAnalyzerConfig(options.config || {});
    
    // Initialize detector modules (GPT-5 style)
    this.detectors = this.initializeDetectors();
    
    // Initialize heuristic analyzers (Claude AI style)
    this.heuristics = this.initializeHeuristics();
    
    // Initialize rules engine
    this.rulesEngine = this.config.isFeatureEnabled('rules.enabled') ? 
      new LinkRulesEngine(this.config.getRulesConfig()) : null;
    
    // Initialize AI enhancement (optional)
    this.aiEnhancement = this.config.isFeatureEnabled('ai.enabled') ? 
      new LinkAIEnhancement(this.config.getAIConfig()) : null;

    console.log(`🔗 Link Analyzer (Combined Approach 15th) initialized`);
    console.log(`📊 Features: ${this.getEnabledFeatures().join(', ')}`);
  }

  /**
   * Get analyzer metadata
   */
  getMetadata() {
    return {
      name: 'LinkAnalyzer',
      version: '2.0.0',
      category: AnalyzerCategories.TECHNICAL,
      approach: 'Combined Approach',
      implementation: '15th',
      features: {
        linkDetection: this.config.isDetectorEnabled('internal') || this.config.isDetectorEnabled('external'),
        anchorAnalysis: this.config.isDetectorEnabled('anchorText'),
        qualityAssessment: this.config.isDetectorEnabled('linkQuality'),
        brokenLinkCheck: this.config.isDetectorEnabled('brokenLink'),
        structureAnalysis: this.config.isDetectorEnabled('linkStructure'),
        contextAnalysis: this.config.isDetectorEnabled('linkContext'),
        seoOptimization: this.config.isHeuristicEnabled('seo'),
        authorityAnalysis: this.config.isHeuristicEnabled('authority'),
        patternAnalysis: this.config.isHeuristicEnabled('patterns'),
        competitiveAnalysis: this.config.isHeuristicEnabled('competitive'),
        aiEnhancement: this.config.isFeatureEnabled('ai.enabled'),
        rulesEngine: this.config.isFeatureEnabled('rules.enabled')
      },
      detectors: Object.keys(this.detectors).filter(key => this.detectors[key] !== null),
      heuristics: Object.keys(this.heuristics).filter(key => this.heuristics[key] !== null),
      configProfile: this.config.getCurrentProfile()
    };
  }

  /**
   * Main analysis method implementing Combined Approach
   */
  async analyze(context) {
    try {
      const startTime = Date.now();
      
      // Validate context
      const validationResult = this.validate(context);
      if (!validationResult.isValid) {
        return this.handleError(new Error(`Validation failed: ${validationResult.errors.join(', ')}`));
      }

      console.log('🔗 Link Analyzer: Starting Combined Approach analysis...');

      // Phase 1: Detection - GPT-5 style modular detection
      console.log('🔍 Phase 1: Running link detection...');
      const detectionResults = await this.runDetectionPhase(context);

      // Phase 2: Heuristic Analysis - Claude AI style intelligent analysis
      console.log('🧠 Phase 2: Running heuristic analysis...');
      const heuristicResults = await this.runHeuristicPhase(detectionResults, context);

      // Phase 3: Rules Engine - Intelligent scoring and validation
      console.log('⚖️ Phase 3: Running rules engine...');
      const rulesResults = this.rulesEngine ? 
        await this.rulesEngine.analyzeWithRules(detectionResults, heuristicResults, context) : null;

      // Phase 4: AI Enhancement - Advanced insights and predictions (optional)
      let aiResults = null;
      if (this.aiEnhancement && this.config.isFeatureEnabled('ai.enabled')) {
        console.log('🤖 Phase 4: Running AI enhancement...');
        aiResults = await this.aiEnhancement.enhance({
          detectors: detectionResults,
          heuristics: heuristicResults,
          rules: rulesResults
        }, context);
      }

      // Phase 5: Results Integration and Orchestration
      console.log('🔄 Phase 5: Integrating results...');
      const integratedResults = this.integrateResults({
        detectors: detectionResults,
        heuristics: heuristicResults,
        rules: rulesResults,
        ai: aiResults
      }, context);

      // Calculate execution time
      const executionTime = Date.now() - startTime;

      const finalResults = {
        success: true,
        data: {
          ...integratedResults,
          metadata: {
            ...this.getMetadata(),
            executionTime,
            timestamp: new Date().toISOString(),
            context: {
              url: context.url,
              domain: context.domain || 'unknown',
              analysisDepth: this.config.getConfig('analysis.analysisDepth'),
              enabledFeatures: this.getEnabledFeatures()
            }
          }
        },
        executionTime,
        category: AnalyzerCategories.TECHNICAL,
        approach: 'Combined Approach (15th Implementation)'
      };

      console.log(`✅ Link Analyzer completed: ${integratedResults.overallScore}/100 (${executionTime}ms)`);
      return finalResults;

    } catch (error) {
      console.error('❌ Link Analyzer error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Validation method for input context
   */
  validate(context) {
    const errors = [];

    if (!context) {
      errors.push('Context is required');
    } else {
      if (!context.document && !context.html) {
        errors.push('Document or HTML content is required');
      }
      if (!context.url) {
        errors.push('URL is required for link analysis');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Phase 1: Detection Phase - GPT-5 style modular detection
   */
  async runDetectionPhase(context) {
    const results = {};

    try {
      // Run all enabled detectors in parallel for performance
      const detectorPromises = [];

      if (this.detectors.internal) {
        detectorPromises.push(
          this.detectors.internal.detect(context.document, context)
            .then(result => ({ internal: result }))
        );
      }

      if (this.detectors.external) {
        detectorPromises.push(
          this.detectors.external.detect(context.document, context)
            .then(result => ({ external: result }))
        );
      }

      if (this.detectors.anchorText) {
        detectorPromises.push(
          this.detectors.anchorText.detect(context.document, context)
            .then(result => ({ anchorText: result }))
        );
      }

      if (this.detectors.linkQuality) {
        detectorPromises.push(
          this.detectors.linkQuality.detect(context.document, context)
            .then(result => ({ linkQuality: result }))
        );
      }

      if (this.detectors.brokenLink) {
        detectorPromises.push(
          this.detectors.brokenLink.detect(context.document, context)
            .then(result => ({ brokenLink: result }))
        );
      }

      if (this.detectors.linkStructure) {
        detectorPromises.push(
          this.detectors.linkStructure.detect(context.document, context)
            .then(result => ({ linkStructure: result }))
        );
      }

      if (this.detectors.linkContext) {
        detectorPromises.push(
          this.detectors.linkContext.detect(context.document, context)
            .then(result => ({ linkContext: result }))
        );
      }

      // Execute all detectors and merge results
      const detectorResults = await Promise.all(detectorPromises);
      detectorResults.forEach(result => {
        Object.assign(results, result);
      });

      return results;

    } catch (error) {
      console.error('Detection phase error:', error);
      return { error: error.message };
    }
  }

  /**
   * Phase 2: Heuristic Analysis Phase - Claude AI style intelligent analysis
   */
  async runHeuristicPhase(detectionResults, context) {
    const results = {};

    try {
      // Run heuristic analyzers based on detection results
      const heuristicPromises = [];

      if (this.heuristics.seo) {
        heuristicPromises.push(
          this.heuristics.seo.analyze(context.document, { ...context, detectionResults })
            .then(result => ({ seo: result }))
        );
      }

      if (this.heuristics.distribution) {
        heuristicPromises.push(
          this.heuristics.distribution.analyze(context.document, { ...context, detectionResults })
            .then(result => ({ distribution: result }))
        );
      }

      if (this.heuristics.authority) {
        heuristicPromises.push(
          this.heuristics.authority.analyze(context.document, { ...context, detectionResults })
            .then(result => ({ authority: result }))
        );
      }

      if (this.heuristics.relevance) {
        heuristicPromises.push(
          this.heuristics.relevance.analyze(context.document, { ...context, detectionResults })
            .then(result => ({ relevance: result }))
        );
      }

      if (this.heuristics.patterns) {
        heuristicPromises.push(
          this.heuristics.patterns.analyze(context.document, { ...context, detectionResults })
            .then(result => ({ patterns: result }))
        );
      }

      if (this.heuristics.competitive) {
        heuristicPromises.push(
          this.heuristics.competitive.analyze(context.document, { ...context, detectionResults })
            .then(result => ({ competitive: result }))
        );
      }

      // Execute all heuristics and merge results
      const heuristicResults = await Promise.all(heuristicPromises);
      heuristicResults.forEach(result => {
        Object.assign(results, result);
      });

      return results;

    } catch (error) {
      console.error('Heuristic analysis phase error:', error);
      return { error: error.message };
    }
  }

  /**
   * Phase 5: Results Integration
   */
  integrateResults(allResults, context) {
    const { detectors, heuristics, rules, ai } = allResults;

    // Calculate overall scores
    const detectorScore = this.calculateDetectorScore(detectors);
    const heuristicScore = this.calculateHeuristicScore(heuristics);
    const rulesScore = rules ? rules.overallScore : null;
    const aiScore = ai ? ai.score : null;

    // Weighted overall score calculation
    let overallScore = 0;
    let weightSum = 0;

    if (detectorScore !== null) {
      overallScore += detectorScore * 0.3;
      weightSum += 0.3;
    }
    if (heuristicScore !== null) {
      overallScore += heuristicScore * 0.4;
      weightSum += 0.4;
    }
    if (rulesScore !== null) {
      overallScore += rulesScore * 0.2;
      weightSum += 0.2;
    }
    if (aiScore !== null) {
      overallScore += aiScore * 0.1;
      weightSum += 0.1;
    }

    overallScore = weightSum > 0 ? overallScore / weightSum : 0;

    // Integrate recommendations
    const recommendations = this.integrateRecommendations(allResults);

    // Generate summary
    const summary = this.generateSummary(allResults, overallScore);

    return {
      overallScore: Math.round(overallScore * 100) / 100,
      breakdown: {
        detectors: detectorScore,
        heuristics: heuristicScore,
        rules: rulesScore,
        ai: aiScore
      },
      detectionResults: detectors,
      heuristicResults: heuristics,
      rulesResults: rules,
      aiResults: ai,
      recommendations,
      summary,
      insights: this.generateInsights(allResults),
      statistics: this.generateStatistics(allResults)
    };
  }

  /**
   * Initialize detector modules
   */
  initializeDetectors() {
    const detectors = {};

    try {
      if (this.config.isDetectorEnabled('internal')) {
        detectors.internal = new InternalLinkDetector(this.config.getDetectorConfig('internal'));
      }
      if (this.config.isDetectorEnabled('external')) {
        detectors.external = new ExternalLinkDetector(this.config.getDetectorConfig('external'));
      }
      if (this.config.isDetectorEnabled('anchorText')) {
        detectors.anchorText = new AnchorTextDetector(this.config.getDetectorConfig('anchorText'));
      }
      if (this.config.isDetectorEnabled('linkQuality')) {
        detectors.linkQuality = new LinkQualityDetector(this.config.getDetectorConfig('linkQuality'));
      }
      if (this.config.isDetectorEnabled('brokenLink')) {
        detectors.brokenLink = new BrokenLinkDetector(this.config.getDetectorConfig('brokenLink'));
      }
      if (this.config.isDetectorEnabled('linkStructure')) {
        detectors.linkStructure = new LinkStructureDetector(this.config.getDetectorConfig('linkStructure'));
      }
      if (this.config.isDetectorEnabled('linkContext')) {
        detectors.linkContext = new LinkContextDetector(this.config.getDetectorConfig('linkContext'));
      }
    } catch (error) {
      console.warn('Warning: Some detectors failed to initialize:', error.message);
    }

    return detectors;
  }

  /**
   * Initialize heuristic analyzers
   */
  initializeHeuristics() {
    const heuristics = {};

    try {
      if (this.config.isHeuristicEnabled('seo')) {
        heuristics.seo = new LinkSEOAnalyzer(this.config.getHeuristicConfig('seo'));
      }
      if (this.config.isHeuristicEnabled('distribution')) {
        heuristics.distribution = new LinkDistributionAnalyzer(this.config.getHeuristicConfig('distribution'));
      }
      if (this.config.isHeuristicEnabled('authority')) {
        heuristics.authority = new LinkAuthorityAnalyzer(this.config.getHeuristicConfig('authority'));
      }
      if (this.config.isHeuristicEnabled('relevance')) {
        heuristics.relevance = new LinkRelevanceAnalyzer(this.config.getHeuristicConfig('relevance'));
      }
      if (this.config.isHeuristicEnabled('patterns')) {
        heuristics.patterns = new LinkPatternAnalyzer(this.config.getHeuristicConfig('patterns'));
      }
      if (this.config.isHeuristicEnabled('competitive')) {
        heuristics.competitive = new LinkCompetitiveAnalyzer(this.config.getHeuristicConfig('competitive'));
      }
    } catch (error) {
      console.warn('Warning: Some heuristics failed to initialize:', error.message);
    }

    return heuristics;
  }

  /**
   * Calculate detector score
   */
  calculateDetectorScore(detectors) {
    if (!detectors || Object.keys(detectors).length === 0) return null;

    const scores = [];
    
    Object.values(detectors).forEach(result => {
      if (result && result.score !== undefined) {
        scores.push(result.score);
      }
    });

    return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : null;
  }

  /**
   * Calculate heuristic score
   */
  calculateHeuristicScore(heuristics) {
    if (!heuristics || Object.keys(heuristics).length === 0) return null;

    const scores = [];
    
    Object.values(heuristics).forEach(result => {
      if (result && result.score !== undefined) {
        scores.push(result.score);
      }
    });

    return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : null;
  }

  /**
   * Integrate recommendations from all phases
   */
  integrateRecommendations(allResults) {
    const recommendations = [];

    // Collect from detectors
    Object.values(allResults.detectors || {}).forEach(result => {
      if (result && result.recommendations) {
        recommendations.push(...result.recommendations);
      }
    });

    // Collect from heuristics
    Object.values(allResults.heuristics || {}).forEach(result => {
      if (result && result.recommendations) {
        recommendations.push(...result.recommendations);
      }
    });

    // Collect from rules
    if (allResults.rules && allResults.rules.recommendations) {
      recommendations.push(...allResults.rules.recommendations);
    }

    // Collect from AI
    if (allResults.ai && allResults.ai.recommendations) {
      recommendations.push(...allResults.ai.recommendations);
    }

    // Deduplicate and prioritize
    return this.prioritizeRecommendations(recommendations);
  }

  /**
   * Generate analysis summary
   */
  generateSummary(allResults, overallScore) {
    const { detectors, heuristics } = allResults;
    
    let totalLinks = 0;
    let internalLinks = 0;
    let externalLinks = 0;
    let brokenLinks = 0;

    if (detectors.internal) {
      internalLinks = detectors.internal.count || 0;
      totalLinks += internalLinks;
    }
    if (detectors.external) {
      externalLinks = detectors.external.count || 0;
      totalLinks += externalLinks;
    }
    if (detectors.brokenLink) {
      brokenLinks = detectors.brokenLink.brokenCount || 0;
    }

    return {
      totalLinks,
      internalLinks,
      externalLinks,
      brokenLinks,
      overallScore,
      qualityGrade: this.getQualityGrade(overallScore),
      primaryIssues: this.identifyPrimaryIssues(allResults),
      strengths: this.identifyStrengths(allResults)
    };
  }

  /**
   * Generate insights from analysis
   */
  generateInsights(allResults) {
    const insights = [];

    // Add detection insights
    if (allResults.detectors) {
      insights.push(...this.generateDetectionInsights(allResults.detectors));
    }

    // Add heuristic insights
    if (allResults.heuristics) {
      insights.push(...this.generateHeuristicInsights(allResults.heuristics));
    }

    // Add AI insights
    if (allResults.ai && allResults.ai.smartInsights) {
      insights.push(...Object.values(allResults.ai.smartInsights).flat());
    }

    return insights;
  }

  /**
   * Generate analysis statistics
   */
  generateStatistics(allResults) {
    const stats = {
      processing: {
        detectorsRun: Object.keys(allResults.detectors || {}).length,
        heuristicsRun: Object.keys(allResults.heuristics || {}).length,
        rulesApplied: allResults.rules ? Object.keys(allResults.rules.ruleResults || {}).length : 0,
        aiEnhanced: !!allResults.ai
      },
      quality: {
        overallScore: 0,
        categoryBreakdown: {},
        topIssues: [],
        improvements: []
      }
    };

    return stats;
  }

  /**
   * Utility methods
   */
  getEnabledFeatures() {
    const features = [];
    const metadata = this.getMetadata();
    
    Object.entries(metadata.features).forEach(([key, enabled]) => {
      if (enabled) {
        features.push(key);
      }
    });

    return features;
  }

  getQualityGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  identifyPrimaryIssues(allResults) {
    // Simplified implementation
    return ['Analyze results to identify main issues'];
  }

  identifyStrengths(allResults) {
    // Simplified implementation
    return ['Analyze results to identify strengths'];
  }

  generateDetectionInsights(detectors) {
    // Simplified implementation
    return [];
  }

  generateHeuristicInsights(heuristics) {
    // Simplified implementation
    return [];
  }

  prioritizeRecommendations(recommendations) {
    // Sort by priority and remove duplicates
    return recommendations
      .filter((rec, index, self) => 
        index === self.findIndex(r => r.recommendation === rec.recommendation)
      )
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }
}

// Export as default
export default LinkAnalyzer;
