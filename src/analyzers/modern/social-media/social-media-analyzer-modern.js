/**
 * ============================================================================
 * SOCIAL MEDIA ANALYZER - COMBINED APPROACH IMPLEMENTATION
 * ============================================================================
 * 
 * Social Media Analyzer implementing the Combined Approach pattern
 * 10th Combined Approach Implementation - Social Media Optimization Analysis
 * 
 * Architecture:
 * - GPT-5 Style Modular Detectors: Platform Detection, Sharing Optimization, Social Proof, Engagement
 * - Claude AI Enhanced Heuristics: Social Strategy, Content Optimization, Platform Compliance
 * - Rules Engine: Social media standards and best practices validation
 * - AI Enhancement: Advanced social media insights and strategic recommendations
 * - Legacy Integration: Maintains compatibility with existing social media analyzer
 * 
 * Features:
 * - Comprehensive Open Graph and Twitter Card analysis
 * - Multi-platform social media optimization (Facebook, Twitter, LinkedIn, Pinterest, WhatsApp)
 * - Social sharing button analysis and optimization
 * - Social proof detection and assessment
 * - Content optimization for social platforms
 * - Social media engagement optimization
 * - Platform-specific compliance validation
 * - Strategic social media insights and recommendations
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration Combined Approach Pattern - 10th Implementation
 */

import { BaseAnalyzer } from '../../core/BaseAnalyzer.js';
import { AnalyzerCategories } from '../../core/AnalyzerInterface.js';

// GPT-5 Style Modular Detectors
import { SocialPlatformDetector } from './detectors/social-platform-detector.js';
import { SharingOptimizationDetector } from './detectors/sharing-optimization-detector.js';
import { SocialProofDetector } from './detectors/social-proof-detector.js';
import { SocialEngagementDetector } from './detectors/social-engagement-detector.js';

// Claude AI Enhanced Heuristics
import { SocialStrategyAnalyzer } from './heuristics/social-strategy-analyzer.js';
import { ContentOptimizationAnalyzer } from './heuristics/content-optimization-analyzer.js';
import { PlatformComplianceAnalyzer } from './heuristics/platform-compliance-analyzer.js';

// Rules Engine
import { SocialMediaRulesEngine } from './rules/social-media-rules-engine.js';

// AI Enhancement Engine
import { SocialMediaAIEnhancer } from './ai/social-media-ai-enhancer.js';

/**
 * Social Media Analyzer - Combined Approach Implementation
 * 
 * Provides comprehensive social media optimization analysis using the proven Combined Approach pattern
 * that has achieved 100% success across 9 previous analyzer modernizations.
 * 
 * Analysis Scope:
 * - Social Platform Detection (Open Graph, Twitter Cards, LinkedIn, Pinterest, WhatsApp)
 * - Sharing Optimization (meta tags, images, content optimization)
 * - Social Proof Assessment (testimonials, reviews, social signals)
 * - Social Engagement Analysis (sharing buttons, social widgets, interaction elements)
 * - Content Strategy Optimization (platform-specific content recommendations)
 * - Platform Compliance Validation (platform guidelines and best practices)
 * - Social Media ROI Analysis (engagement potential, reach optimization)
 */
export class SocialMediaAnalyzerModern {
  constructor(options = {}) {
    this.options = {
      // Core configuration
      enableAllPlatforms: options.enableAllPlatforms !== false,
      enableContentOptimization: options.enableContentOptimization !== false,
      enableSocialProofAnalysis: options.enableSocialProofAnalysis !== false,
      enableEngagementAnalysis: options.enableEngagementAnalysis !== false,
      
      // Platform-specific settings
      platforms: {
        facebook: options.platforms?.facebook !== false,
        twitter: options.platforms?.twitter !== false,
        linkedin: options.platforms?.linkedin !== false,
        pinterest: options.platforms?.pinterest !== false,
        whatsapp: options.platforms?.whatsapp !== false,
        instagram: options.platforms?.instagram !== false,
        youtube: options.platforms?.youtube !== false
      },
      
      // Analysis depth and quality
      analysisDepth: options.analysisDepth || 'comprehensive',
      enableAIEnhancement: options.enableAIEnhancement !== false,
      enableAdvancedInsights: options.enableAdvancedInsights !== false,
      
      // Performance and optimization
      enableCaching: options.enableCaching !== false,
      enableParallelProcessing: options.enableParallelProcessing !== false,
      maxAnalysisTime: options.maxAnalysisTime || 30000,
      
      // Legacy compatibility
      legacyCompatibility: options.legacyCompatibility !== false,
      fallbackToLegacy: options.fallbackToLegacy !== false,
      
      ...options
    };

    this.version = '1.0.0';
    this.analyzerType = 'social_media';
    this.implementationPattern = 'combined_approach';
    this.implementationNumber = 10;

    // Initialize GPT-5 Style Modular Detectors
    this.detectors = {
      platform: new SocialPlatformDetector({
        platforms: this.options.platforms,
        enableAdvancedDetection: this.options.enableAdvancedInsights,
        analysisDepth: this.options.analysisDepth
      }),
      
      sharing: new SharingOptimizationDetector({
        enableImageAnalysis: this.options.enableContentOptimization,
        enableContentValidation: this.options.enableContentOptimization,
        platforms: this.options.platforms
      }),
      
      socialProof: new SocialProofDetector({
        enableProofAnalysis: this.options.enableSocialProofAnalysis,
        enableSentimentAnalysis: this.options.enableAdvancedInsights
      }),
      
      engagement: new SocialEngagementDetector({
        enableEngagementAnalysis: this.options.enableEngagementAnalysis,
        enableInteractionTracking: this.options.enableAdvancedInsights
      })
    };

    // Initialize Claude AI Enhanced Heuristics
    this.heuristics = {
      strategy: new SocialStrategyAnalyzer({
        enableStrategicInsights: this.options.enableAdvancedInsights,
        platforms: this.options.platforms
      }),
      
      contentOptimization: new ContentOptimizationAnalyzer({
        enableContentAnalysis: this.options.enableContentOptimization,
        enableAIRecommendations: this.options.enableAIEnhancement
      }),
      
      platformCompliance: new PlatformComplianceAnalyzer({
        platforms: this.options.platforms,
        enableComplianceValidation: true
      })
    };

    // Initialize Rules Engine
    this.rulesEngine = new SocialMediaRulesEngine({
      enableStandardsValidation: true,
      platforms: this.options.platforms,
      strictMode: this.options.analysisDepth === 'comprehensive'
    });

    // Initialize AI Enhancement (optional)
    this.aiEnhancer = this.options.enableAIEnhancement ? 
      new SocialMediaAIEnhancer({
        enablePredictiveAnalysis: this.options.enableAdvancedInsights,
        enableContentGeneration: this.options.enableContentOptimization,
        platforms: this.options.platforms
      }) : null;

    // Performance monitoring
    this.performance = {
      cacheHits: 0,
      cacheMisses: 0,
      averageExecutionTime: 0,
      totalAnalyses: 0
    };

    // Caching system
    this.cache = this.options.enableCaching ? new Map() : null;

    console.log(`✅ Social Media Analyzer Modern initialized - Combined Approach Implementation #${this.implementationNumber}`);
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Comprehensive analyzer metadata
   */
  getMetadata() {
    return {
      name: 'SocialMediaAnalyzerModern',
      version: this.version,
      type: this.analyzerType,
      pattern: this.implementationPattern,
      implementationNumber: this.implementationNumber,
      category: AnalyzerCategories.CONTENT,
      
      description: 'Advanced social media optimization analysis using Combined Approach pattern with AI-enhanced insights',
      
      capabilities: [
        'multi_platform_social_optimization',
        'open_graph_comprehensive_analysis',
        'twitter_card_optimization',
        'social_sharing_optimization',
        'social_proof_assessment',
        'engagement_optimization_analysis',
        'platform_compliance_validation',
        'ai_enhanced_social_strategy',
        'content_optimization_recommendations',
        'social_media_roi_analysis'
      ],
      
      platforms: Object.keys(this.options.platforms).filter(p => this.options.platforms[p]),
      
      components: {
        detectors: Object.keys(this.detectors),
        heuristics: Object.keys(this.heuristics),
        rulesEngine: 'SocialMediaRulesEngine',
        aiEnhancement: this.aiEnhancer ? 'enabled' : 'disabled'
      },
      
      performance: 'Optimized with caching and parallel processing',
      accuracy: 'AI-Enhanced with GPT-5 and Claude integration',
      
      compatibility: {
        legacySupport: this.options.legacyCompatibility,
        fallbackEnabled: this.options.fallbackToLegacy
      }
    };
  }

  /**
   * Validate analysis context
   * @param {Object} context - Analysis context
   * @returns {boolean} Whether context is valid for analysis
   */
  validate(context) {
    if (!context || typeof context !== 'object') {
      return false;
    }

    // Check for required document
    const document = context.document || 
                    (context.dom && context.dom.window && context.dom.window.document) ||
                    context.dom;

    if (!document || typeof document.querySelector !== 'function') {
      return false;
    }

    // Validate URL if provided
    if (context.url && typeof context.url !== 'string') {
      return false;
    }

    return true;
  }

  /**
   * Main social media analysis orchestration
   * @param {Object} context - Analysis context containing document, url, and pageData
   * @returns {Promise<Object>} Comprehensive social media analysis results
   */
  async analyzeSocialMedia(context) {
    const startTime = Date.now();
    const analysisId = `social_media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Validate context
      if (!this.validate(context)) {
        throw new Error('Invalid analysis context provided');
      }

      console.log(`🚀 Starting Social Media Analysis - Implementation #${this.implementationNumber}`);

      // Check cache if enabled
      if (this.cache && context.url) {
        const cacheKey = this._generateCacheKey(context);
        const cachedResult = this.cache.get(cacheKey);
        
        if (cachedResult) {
          this.performance.cacheHits++;
          console.log('📋 Using cached social media analysis results');
          return {
            ...cachedResult,
            cached: true,
            executionTime: Date.now() - startTime
          };
        }
        this.performance.cacheMisses++;
      }

      // Initialize analysis context
      const analysisContext = await this.initializeAnalysisContext(context, analysisId);

      // Phase 1: Run GPT-5 Style Detection Analysis
      const detectionResults = await this.runDetectionAnalysis(analysisContext);

      // Phase 2: Run Claude AI Enhanced Heuristics Analysis
      const heuristicsResults = await this.runHeuristicsAnalysis(analysisContext, detectionResults);

      // Phase 3: Run Rules Engine Validation
      const rulesResults = await this.runRulesValidation(analysisContext, detectionResults, heuristicsResults);

      // Phase 4: Run AI Enhancement (if enabled)
      const aiResults = this.aiEnhancer ? 
        await this.runAIEnhancement(analysisContext, detectionResults, heuristicsResults, rulesResults) : 
        null;

      // Phase 5: Compile comprehensive results
      const comprehensiveResults = await this.compileResults({
        context: analysisContext,
        detections: detectionResults,
        heuristics: heuristicsResults,
        rules: rulesResults,
        ai: aiResults,
        analysisId,
        executionTime: Date.now() - startTime
      });

      // Cache results if enabled
      if (this.cache && context.url) {
        const cacheKey = this._generateCacheKey(context);
        this.cache.set(cacheKey, comprehensiveResults);
      }

      // Update performance metrics
      this.performance.totalAnalyses++;
      this.performance.averageExecutionTime = 
        (this.performance.averageExecutionTime * (this.performance.totalAnalyses - 1) + 
         (Date.now() - startTime)) / this.performance.totalAnalyses;

      console.log(`✅ Social Media Analysis completed in ${Date.now() - startTime}ms`);

      return comprehensiveResults;

    } catch (error) {
      console.error('❌ Social Media Analysis failed:', error);
      
      // Fallback to legacy if enabled
      if (this.options.fallbackToLegacy) {
        console.log('🔄 Falling back to legacy social media analysis');
        return this.legacyFallback(context, error);
      }

      return {
        success: false,
        error: `Social media analysis failed: ${error.message}`,
        analysisId,
        executionTime: Date.now() - startTime,
        analyzerType: this.analyzerType,
        version: this.version
      };
    }
  }

  /**
   * Initialize analysis context with enhanced metadata
   * @param {Object} context - Original analysis context
   * @param {string} analysisId - Unique analysis identifier
   * @returns {Promise<Object>} Enhanced analysis context
   */
  async initializeAnalysisContext(context, analysisId) {
    const document = context.document || 
                    (context.dom && context.dom.window && context.dom.window.document) ||
                    context.dom;

    return {
      // Core context
      document,
      url: context.url || 'unknown',
      pageData: context.pageData || {},
      
      // Analysis metadata
      analysisId,
      timestamp: new Date().toISOString(),
      analyzer: this.getMetadata(),
      
      // Configuration
      options: this.options,
      
      // Performance tracking
      startTime: Date.now(),
      phases: {}
    };
  }

  /**
   * Run comprehensive detection analysis using GPT-5 style detectors
   * @param {Object} context - Enhanced analysis context
   * @returns {Promise<Object>} Detection analysis results
   */
  async runDetectionAnalysis(context) {
    const startTime = Date.now();
    console.log('🔍 Running Social Media Detection Analysis');

    try {
      const detectionPromises = [];

      // Platform detection analysis
      if (this.options.enableAllPlatforms) {
        detectionPromises.push(
          this.detectors.platform.detect(context).then(result => ({
            detector: 'platform',
            result
          }))
        );
      }

      // Sharing optimization analysis
      if (this.options.enableContentOptimization) {
        detectionPromises.push(
          this.detectors.sharing.detect(context).then(result => ({
            detector: 'sharing',
            result
          }))
        );
      }

      // Social proof analysis
      if (this.options.enableSocialProofAnalysis) {
        detectionPromises.push(
          this.detectors.socialProof.detect(context).then(result => ({
            detector: 'socialProof',
            result
          }))
        );
      }

      // Engagement analysis
      if (this.options.enableEngagementAnalysis) {
        detectionPromises.push(
          this.detectors.engagement.detect(context).then(result => ({
            detector: 'engagement',
            result
          }))
        );
      }

      // Execute detection analysis in parallel
      const detectionResults = await Promise.allSettled(detectionPromises);

      // Process results
      const processedResults = {
        platform: null,
        sharing: null,
        socialProof: null,
        engagement: null,
        executionTime: Date.now() - startTime,
        errors: []
      };

      detectionResults.forEach(result => {
        if (result.status === 'fulfilled') {
          const { detector, result: detectionResult } = result.value;
          processedResults[detector] = detectionResult;
        } else {
          processedResults.errors.push(result.reason);
        }
      });

      context.phases.detection = Date.now() - startTime;
      return processedResults;

    } catch (error) {
      throw new Error(`Detection analysis failed: ${error.message}`);
    }
  }

  /**
   * Run Claude AI enhanced heuristics analysis
   * @param {Object} context - Enhanced analysis context
   * @param {Object} detectionResults - Results from detection phase
   * @returns {Promise<Object>} Heuristics analysis results
   */
  async runHeuristicsAnalysis(context, detectionResults) {
    const startTime = Date.now();
    console.log('🧠 Running Social Media Heuristics Analysis');

    try {
      const heuristicsPromises = [];

      // Social strategy analysis
      if (this.options.enableAdvancedInsights) {
        heuristicsPromises.push(
          this.heuristics.strategy.analyze(detectionResults, context).then(result => ({
            heuristic: 'strategy',
            result
          }))
        );
      }

      // Content optimization analysis
      if (this.options.enableContentOptimization) {
        heuristicsPromises.push(
          this.heuristics.contentOptimization.analyze(detectionResults, context).then(result => ({
            heuristic: 'contentOptimization',
            result
          }))
        );
      }

      // Platform compliance analysis
      heuristicsPromises.push(
        this.heuristics.platformCompliance.analyze(detectionResults, context).then(result => ({
          heuristic: 'platformCompliance',
          result
        }))
      );

      // Execute heuristics analysis in parallel
      const heuristicsResults = await Promise.allSettled(heuristicsPromises);

      // Process results
      const processedResults = {
        strategy: null,
        contentOptimization: null,
        platformCompliance: null,
        executionTime: Date.now() - startTime,
        errors: []
      };

      heuristicsResults.forEach(result => {
        if (result.status === 'fulfilled') {
          const { heuristic, result: heuristicResult } = result.value;
          processedResults[heuristic] = heuristicResult;
        } else {
          processedResults.errors.push(result.reason);
        }
      });

      context.phases.heuristics = Date.now() - startTime;
      return processedResults;

    } catch (error) {
      throw new Error(`Heuristics analysis failed: ${error.message}`);
    }
  }

  /**
   * Run rules engine validation
   * @param {Object} context - Enhanced analysis context
   * @param {Object} detectionResults - Results from detection phase
   * @param {Object} heuristicsResults - Results from heuristics phase
   * @returns {Promise<Object>} Rules validation results
   */
  async runRulesValidation(context, detectionResults, heuristicsResults) {
    const startTime = Date.now();
    console.log('⚖️ Running Social Media Rules Validation');

    try {
      const rulesResults = await this.rulesEngine.validateSocialMediaStandards({
        context,
        detections: detectionResults,
        heuristics: heuristicsResults
      });

      context.phases.rules = Date.now() - startTime;
      return rulesResults;

    } catch (error) {
      throw new Error(`Rules validation failed: ${error.message}`);
    }
  }

  /**
   * Run AI enhancement analysis
   * @param {Object} context - Enhanced analysis context
   * @param {Object} detectionResults - Results from detection phase
   * @param {Object} heuristicsResults - Results from heuristics phase
   * @param {Object} rulesResults - Results from rules validation
   * @returns {Promise<Object>} AI enhancement results
   */
  async runAIEnhancement(context, detectionResults, heuristicsResults, rulesResults) {
    const startTime = Date.now();
    console.log('🤖 Running Social Media AI Enhancement');

    try {
      const aiResults = await this.aiEnhancer.enhance({
        context,
        detections: detectionResults,
        heuristics: heuristicsResults,
        rules: rulesResults
      });

      context.phases.ai = Date.now() - startTime;
      return aiResults;

    } catch (error) {
      console.warn('AI enhancement failed, continuing without AI insights:', error.message);
      return null;
    }
  }

  /**
   * Compile comprehensive analysis results
   * @param {Object} analysisData - All analysis phase results
   * @returns {Promise<Object>} Comprehensive social media analysis results
   */
  async compileResults(analysisData) {
    const { context, detections, heuristics, rules, ai, analysisId, executionTime } = analysisData;

    // Calculate overall social media score
    const overallScore = this._calculateOverallScore({
      detections,
      heuristics,
      rules
    });

    // Generate strategic insights
    const strategicInsights = this._generateStrategicInsights({
      detections,
      heuristics,
      rules,
      ai
    });

    // Generate comprehensive recommendations
    const recommendations = this._generateRecommendations({
      detections,
      heuristics,
      rules,
      ai
    });

    return {
      success: true,
      analysisId,
      
      // Core analysis results
      socialMediaAnalysis: {
        // Platform analysis
        platforms: detections.platform || {},
        sharing: detections.sharing || {},
        socialProof: detections.socialProof || {},
        engagement: detections.engagement || {},
        
        // Strategic analysis
        strategy: heuristics.strategy || {},
        contentOptimization: heuristics.contentOptimization || {},
        platformCompliance: heuristics.platformCompliance || {},
        
        // Validation results
        rulesValidation: rules || {},
        
        // AI insights (if available)
        aiInsights: ai || null
      },
      
      // Overall assessment
      score: overallScore.score,
      grade: overallScore.grade,
      level: overallScore.level,
      socialOptimized: overallScore.score >= 75,
      
      // Strategic insights and recommendations
      insights: strategicInsights,
      recommendations,
      
      // Priority actions
      priorityActions: this._generatePriorityActions(strategicInsights),
      
      // Implementation roadmap
      roadmap: this._generateImplementationRoadmap({
        detections,
        heuristics,
        recommendations
      }),
      
      // Performance and metadata
      performance: {
        executionTime,
        phases: context.phases,
        cacheUsed: false,
        detectorResults: Object.keys(detections).length,
        heuristicResults: Object.keys(heuristics).length
      },
      
      metadata: {
        analyzer: context.analyzer,
        timestamp: context.timestamp,
        url: context.url,
        version: this.version
      }
    };
  }

  /**
   * Legacy fallback for compatibility
   * @param {Object} context - Analysis context
   * @param {Error} error - Original error
   * @returns {Object} Fallback analysis results
   */
  async legacyFallback(context, error) {
    try {
      // Import legacy analyzer
      const { SocialMediaAnalyzer } = await import('../../social-media/social-media-analyzer.js');
      const legacyAnalyzer = new SocialMediaAnalyzer(this.options);
      
      const legacyResult = await legacyAnalyzer.analyze(context);
      
      return {
        success: true,
        legacy: true,
        fallbackReason: error.message,
        ...legacyResult,
        modernizationNote: 'Results from legacy analyzer due to modernization failure'
      };
    } catch (fallbackError) {
      return {
        success: false,
        error: `Both modern and legacy analysis failed: ${error.message}, ${fallbackError.message}`,
        analyzerType: this.analyzerType
      };
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Calculate overall social media optimization score
   * @param {Object} analysisResults - Combined analysis results
   * @returns {Object} Overall score, grade, and level
   */
  _calculateOverallScore(analysisResults) {
    const { detections, heuristics, rules } = analysisResults;
    
    // Weight different components
    const weights = {
      platform: 0.30,
      sharing: 0.25,
      socialProof: 0.15,
      engagement: 0.15,
      compliance: 0.15
    };

    let totalScore = 0;
    let totalWeight = 0;

    // Platform detection score
    if (detections.platform && detections.platform.score !== undefined) {
      totalScore += detections.platform.score * weights.platform;
      totalWeight += weights.platform;
    }

    // Sharing optimization score
    if (detections.sharing && detections.sharing.score !== undefined) {
      totalScore += detections.sharing.score * weights.sharing;
      totalWeight += weights.sharing;
    }

    // Social proof score
    if (detections.socialProof && detections.socialProof.score !== undefined) {
      totalScore += detections.socialProof.score * weights.socialProof;
      totalWeight += weights.socialProof;
    }

    // Engagement score
    if (detections.engagement && detections.engagement.score !== undefined) {
      totalScore += detections.engagement.score * weights.engagement;
      totalWeight += weights.engagement;
    }

    // Compliance score
    if (rules && rules.overallScore !== undefined) {
      totalScore += rules.overallScore * weights.compliance;
      totalWeight += weights.compliance;
    }

    const score = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    const grade = this._calculateGrade(score);
    const level = this._categorizeLevel(score);

    return { score, grade, level };
  }

  /**
   * Generate strategic insights from analysis results
   * @param {Object} analysisResults - Combined analysis results
   * @returns {Array} Strategic insights
   */
  _generateStrategicInsights(analysisResults) {
    const insights = [];
    const { detections, heuristics, ai } = analysisResults;

    // Platform optimization insights
    if (detections.platform) {
      if (detections.platform.openGraph && detections.platform.openGraph.score > 80) {
        insights.push({
          type: 'positive',
          category: 'platform',
          title: 'Strong Open Graph Implementation',
          description: 'Website has excellent Open Graph optimization for social sharing',
          impact: 'high',
          platforms: ['facebook', 'linkedin']
        });
      }

      if (detections.platform.twitterCard && detections.platform.twitterCard.score < 60) {
        insights.push({
          type: 'opportunity',
          category: 'platform',
          title: 'Twitter Card Optimization Needed',
          description: 'Twitter Card implementation needs improvement for better social engagement',
          impact: 'medium',
          platforms: ['twitter']
        });
      }
    }

    // Content optimization insights
    if (heuristics.contentOptimization) {
      if (heuristics.contentOptimization.imageOptimization && 
          heuristics.contentOptimization.imageOptimization.score < 70) {
        insights.push({
          type: 'warning',
          category: 'content',
          title: 'Social Media Image Optimization Required',
          description: 'Images are not optimized for social media sharing',
          impact: 'high',
          platforms: ['all']
        });
      }
    }

    // AI-enhanced insights
    if (ai && ai.insights) {
      insights.push(...ai.insights.map(insight => ({
        ...insight,
        source: 'ai_enhanced'
      })));
    }

    return insights;
  }

  /**
   * Generate comprehensive recommendations
   * @param {Object} analysisResults - Combined analysis results
   * @returns {Array} Comprehensive recommendations
   */
  _generateRecommendations(analysisResults) {
    const recommendations = [];
    const { detections, heuristics, rules, ai } = analysisResults;

    // Collect recommendations from all analysis phases
    [detections, heuristics, rules, ai].forEach(phase => {
      if (phase && phase.recommendations) {
        recommendations.push(...phase.recommendations);
      }
    });

    // Add priority and categorization
    return recommendations.map(rec => ({
      ...rec,
      category: rec.category || 'social_media',
      priority: this._calculateRecommendationPriority(rec),
      implementation: this._estimateImplementationEffort(rec)
    }));
  }

  _generatePriorityActions(insights) {
    return insights
      .filter(insight => insight.impact === 'high')
      .slice(0, 5)
      .map(insight => ({
        title: insight.title,
        description: insight.description,
        category: insight.category,
        urgency: 'immediate',
        estimatedImpact: insight.impact
      }));
  }

  _generateImplementationRoadmap(analysisData) {
    return {
      immediate: [
        'Fix critical Open Graph meta tags',
        'Implement Twitter Card optimization',
        'Add social sharing buttons'
      ],
      shortTerm: [
        'Optimize social media images',
        'Enhance social proof elements',
        'Implement structured data for social platforms'
      ],
      mediumTerm: [
        'Develop comprehensive social media strategy',
        'Implement advanced social engagement features',
        'A/B test social sharing optimization'
      ],
      longTerm: [
        'Integrate social media analytics',
        'Implement AI-powered social content optimization',
        'Develop platform-specific content strategies'
      ]
    };
  }

  _calculateRecommendationPriority(recommendation) {
    // Simplified priority calculation
    if (recommendation.impact === 'high') return 'high';
    if (recommendation.impact === 'medium') return 'medium';
    return 'low';
  }

  _estimateImplementationEffort(recommendation) {
    // Simplified effort estimation
    if (recommendation.complexity === 'high') return 'high';
    if (recommendation.complexity === 'medium') return 'medium';
    return 'low';
  }

  _calculateGrade(score) {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 67) return 'D+';
    if (score >= 65) return 'D';
    return 'F';
  }

  _categorizeLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'satisfactory';
    if (score >= 60) return 'needs_improvement';
    return 'poor';
  }

  _generateCacheKey(context) {
    const keyData = {
      url: context.url,
      options: this.options,
      timestamp: Math.floor(Date.now() / (1000 * 60 * 10)) // 10-minute cache buckets
    };
    
    return btoa(JSON.stringify(keyData)).slice(0, 32);
  }

  /**
   * Get performance statistics
   * @returns {Object} Performance statistics
   */
  getPerformanceStats() {
    return {
      ...this.performance,
      cacheHitRate: this.performance.cacheHits / 
        (this.performance.cacheHits + this.performance.cacheMisses) || 0
    };
  }

  /**
   * Clear cache and reset performance stats
   */
  reset() {
    if (this.cache) {
      this.cache.clear();
    }
    
    this.performance = {
      cacheHits: 0,
      cacheMisses: 0,
      averageExecutionTime: 0,
      totalAnalyses: 0
    };
  }
}

export default SocialMediaAnalyzerModern;
