/**
 * Performance Analyzer - Combined Approach Implementation
 * 
 * Phase 3: Additional Analyzer Modernization
 * Implements GPT-5 modular architecture + Claude AI enhancement + existing patterns
 * 
 * @version 2.0.0
 * @author Performance Team
 * @approach Combined (GPT-5 + Claude + Existing)
 */

import { BaseAnalyzer } from '../core/BaseAnalyzer.js';

// GPT-5 style: Modular detectors
import ResourceDetector from './detectors/resource-detector.js';
import MetricsDetector from './detectors/metrics-detector.js';

// GPT-5 style: Reusable heuristics
import PerformanceOptimizationAnalyzer from './heuristics/performance-optimization-analyzer.js';

// GPT-5 style: Scoring and validation
import PerformanceScoringEngine from './rules/performance-scoring-engine.js';

// Claude style: AI enhancement
import PerformanceAIEnhancer from './ai/performance-ai-enhancer.js';

// Configuration
import PerformanceConfiguration from './config/performance-configuration.js';

/**
 * Performance Analyzer - Modernized with Combined Approach
 * 
 * Implements the combined approach pattern with heuristics-first analysis
 * and optional AI enhancement for comprehensive performance insights.
 */
export class PerformanceAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('PerformanceAnalyzer', {
      enableAdvancedAnalysis: options.enableAdvancedAnalysis !== false,
      enableAIEnhancement: options.enableAIEnhancement !== false,
      includeExperimentalMetrics: options.includeExperimentalMetrics !== false,
      trackUserExperience: options.trackUserExperience !== false,
      ...options
    });

    // Configuration management
    this.config = options.config || PerformanceConfiguration;

    // GPT-5 style: Modular components initialization
    this.detectors = this.initializeDetectors(options);
    this.heuristics = this.initializeHeuristics(options);
    this.scoringEngine = new PerformanceScoringEngine(options.scoring);

    // Claude style: AI enhancement (optional)
    this.aiEnhancer = options.enableAIEnhancement !== false ? 
      new PerformanceAIEnhancer(options.ai) : null;

    this.log('PerformanceAnalyzer initialized with combined approach architecture');
  }

  /**
   * Get analyzer metadata
   */
  getMetadata() {
    return {
      name: 'PerformanceAnalyzer',
      version: '2.0.0',
      description: 'Comprehensive performance analysis with Core Web Vitals, resource optimization, and AI insights',
      category: 'Performance',
      approach: 'Combined (GPT-5 + Claude + Existing)',
      capabilities: [
        'Core Web Vitals measurement',
        'Resource optimization analysis',
        'Loading strategy assessment',
        'Third-party performance impact',
        'Mobile performance analysis',
        'AI-powered optimization recommendations'
      ],
      priority: 'high'
    };
  }

  /**
   * Combined approach analysis method
   * Phase 1: Heuristics-first analysis (always runs)
   * Phase 2: AI enhancement (optional)
   */
  async performHeuristicAnalysis(context) {
    try {
      this.log('info', 'Starting performance heuristic analysis');

      // Phase 1: Parallel detection (GPT-5 style)
      const [resourceResults, metricsResults] = await Promise.all([
        this.detectors.resource.detectResources(context),
        this.detectors.metrics.detectMetrics(context)
      ]);

      // Phase 2: Heuristic analysis (GPT-5 style)
      const optimizationResults = await this.heuristics.optimization.analyzePerformance({
        metrics: metricsResults,
        resources: resourceResults,
        context
      });

      // Phase 3: Scoring and validation (GPT-5 style)
      const scoringResults = this.scoringEngine.calculatePerformanceScore({
        ...optimizationResults,
        coreWebVitals: optimizationResults.analysis?.coreWebVitals,
        resourceOptimization: optimizationResults.analysis?.resourceOptimization,
        loadingStrategy: optimizationResults.analysis?.loadingStrategy,
        thirdParty: optimizationResults.analysis?.thirdParty,
        mobilePerformance: optimizationResults.analysis?.mobilePerformance
      });

      const heuristicResults = {
        detection: {
          resources: resourceResults,
          metrics: metricsResults
        },
        analysis: optimizationResults.analysis,
        score: scoringResults.overall.score,
        grade: scoringResults.overall.grade,
        breakdown: scoringResults.breakdown,
        recommendations: optimizationResults.recommendations,
        prioritizedActions: optimizationResults.prioritizedActions,
        estimatedImpact: optimizationResults.estimatedImpact,
        metadata: {
          analysisTime: Date.now(),
          approach: 'heuristics',
          confidence: 0.9
        }
      };

      this.log('info', `Performance heuristic analysis completed with score: ${heuristicResults.score}`);
      return heuristicResults;

    } catch (error) {
      this.log('error', 'Performance heuristic analysis failed', error);
      throw error;
    }
  }

  /**
   * AI enhancement method - enhances heuristic results with AI insights
   */
  async performAIEnhancement(heuristicResults, context) {
    if (!this.aiEnhancer) {
      this.log('info', 'AI enhancement disabled, skipping');
      return heuristicResults;
    }

    try {
      this.log('info', 'Starting performance AI enhancement');

      const aiResults = await this.aiEnhancer.enhancePerformanceAnalysis(heuristicResults, {
        url: context.url,
        industry: context.industry,
        deviceType: context.deviceType
      });

      if (aiResults.enhanced && aiResults.confidence >= this.config.get('ai.confidenceThreshold', 0.7)) {
        this.log('info', `AI enhancement completed with confidence: ${aiResults.confidence}`);
        
        return {
          ...heuristicResults,
          aiInsights: aiResults.insights,
          enhancedRecommendations: this.mergeRecommendations(
            heuristicResults.recommendations, 
            aiResults.insights
          ),
          metadata: {
            ...heuristicResults.metadata,
            aiEnhanced: true,
            aiConfidence: aiResults.confidence,
            aiVersion: aiResults.aiMetadata?.version
          }
        };
      } else {
        this.log('warn', 'AI enhancement failed or low confidence, using heuristics only');
        return heuristicResults;
      }

    } catch (error) {
      this.log('warn', 'AI enhancement failed, continuing with heuristics only', error);
      return heuristicResults;
    }
  }

  /**
   * Initialize detector modules (GPT-5 style)
   */
  initializeDetectors(options) {
    const detectionConfig = this.config.getDetectionConfig();
    
    return {
      resource: new ResourceDetector({
        ...detectionConfig,
        ...options.resource
      }),
      metrics: new MetricsDetector({
        ...detectionConfig,
        ...options.metrics
      })
    };
  }

  /**
   * Initialize heuristic analyzers (GPT-5 style)
   */
  initializeHeuristics(options) {
    const analysisConfig = this.config.getAnalysisConfig();
    
    return {
      optimization: new PerformanceOptimizationAnalyzer({
        ...analysisConfig,
        ...options.optimization
      })
    };
  }

  /**
   * Merge heuristic and AI recommendations
   */
  mergeRecommendations(heuristicRecommendations, aiInsights) {
    const merged = [...heuristicRecommendations];

    // Add AI-specific recommendations
    if (aiInsights.optimizationPriorities?.prioritizedOptimizations) {
      aiInsights.optimizationPriorities.prioritizedOptimizations.forEach(opt => {
        if (opt.aiPriority > 80) {
          merged.push({
            type: 'ai-optimization',
            action: opt.action,
            priority: 'high',
            source: 'ai',
            confidence: opt.confidence,
            expectedImpact: opt.expectedImpact
          });
        }
      });
    }

    // Add predictive recommendations
    if (aiInsights.predictiveAnalysis?.futureOptimizations) {
      aiInsights.predictiveAnalysis.futureOptimizations.forEach(opt => {
        merged.push({
          type: 'predictive',
          action: opt,
          priority: 'medium',
          source: 'ai-prediction',
          timeHorizon: aiInsights.predictiveAnalysis.timeHorizon
        });
      });
    }

    return merged;
  }

  /**
   * Validate performance analysis context
   */
  validate(context) {
    if (!context || typeof context !== 'object') {
      return false;
    }

    // Check for required properties
    if (!context.document && !context.dom) {
      this.log('warn', 'No document or DOM provided for performance analysis');
      return false;
    }

    if (!context.url) {
      this.log('warn', 'No URL provided for performance analysis');
      return false;
    }

    return true;
  }

  /**
   * Get performance configuration
   */
  getConfiguration() {
    return this.config.export();
  }

  /**
   * Update performance configuration
   */
  updateConfiguration(updates) {
    this.config.update(updates);
    this.log('info', 'Performance configuration updated');
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(featureName) {
    return this.config.isFeatureEnabled(featureName);
  }

  /**
   * Get performance budgets
   */
  getPerformanceBudgets() {
    return {
      overall: this.config.getBudget('overall'),
      scripts: this.config.getBudget('scripts'),
      stylesheets: this.config.getBudget('stylesheets'),
      images: this.config.getBudget('images'),
      fonts: this.config.getBudget('fonts'),
      thirdParty: this.config.getBudget('thirdParty')
    };
  }

  /**
   * Assess performance against budgets
   */
  assessBudgetCompliance(analysisResults) {
    const budgets = this.getPerformanceBudgets();
    const compliance = {};

    // Check overall budget compliance
    const overallBudget = budgets.overall;
    if (overallBudget && analysisResults.detection?.resources?.summary) {
      const summary = analysisResults.detection.resources.summary;
      compliance.overall = {
        size: this.checkBudgetCompliance(
          analysisResults.estimatedSize || 0,
          overallBudget.totalSize
        ),
        requests: this.checkBudgetCompliance(
          Object.values(summary).reduce((total, type) => total + (type.count || 0), 0),
          overallBudget.totalRequests
        )
      };
    }

    // Check resource-specific compliance
    Object.keys(budgets).forEach(resourceType => {
      if (resourceType !== 'overall' && analysisResults.detection?.resources?.summary?.[resourceType]) {
        compliance[resourceType] = this.checkResourceBudgetCompliance(
          analysisResults.detection.resources.summary[resourceType],
          budgets[resourceType]
        );
      }
    });

    return compliance;
  }

  /**
   * Check budget compliance for a specific metric
   */
  checkBudgetCompliance(actual, budget) {
    if (!budget || !actual) return { status: 'unknown' };

    const ratio = actual / budget;
    return {
      actual,
      budget,
      ratio,
      status: ratio <= 1 ? 'compliant' : ratio <= 1.2 ? 'warning' : 'exceeded',
      difference: actual - budget
    };
  }

  /**
   * Check resource-specific budget compliance
   */
  checkResourceBudgetCompliance(resourceData, budget) {
    const compliance = {};

    if (budget.maxCount && resourceData.count) {
      compliance.count = this.checkBudgetCompliance(resourceData.count, budget.maxCount);
    }

    // Additional resource-specific checks would be implemented here
    
    return compliance;
  }
}

// Export the modernized performance analyzer
export default PerformanceAnalyzer;
