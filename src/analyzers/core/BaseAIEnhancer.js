/**
 * Base AI Enhancer
 * 
 * Abstract base class for AI enhancement modules in the combined approach.
 * Provides common functionality for AI-powered analysis enhancement.
 */
export class BaseAIEnhancer {
  constructor(aiManager, category, options = {}) {
    if (this.constructor === BaseAIEnhancer) {
      throw new Error('BaseAIEnhancer is abstract and cannot be instantiated directly');
    }

    this.aiManager = aiManager;
    this.category = category;
    this.options = {
      confidenceThreshold: 0.7,
      enablePatternAnalysis: true,
      enablePredictions: true,
      enableRecommendations: true,
      enableCaching: true,
      cacheTimeout: 300000, // 5 minutes
      ...options
    };

    this.cache = new Map();
    this.metrics = {
      totalEnhancements: 0,
      successfulEnhancements: 0,
      averageConfidence: 0,
      averageExecutionTime: 0
    };
  }

  /**
   * Main enhancement method - enhances heuristic results with AI insights
   * @param {Object} heuristicResults - Results from heuristic analysis
   * @returns {Promise<Object>} AI enhancement results
   */
  async enhance(heuristicResults) {
    const startTime = Date.now();
    
    try {
      // Check cache first
      if (this.options.enableCaching) {
        const cached = this._getCachedResult(heuristicResults);
        if (cached) {
          return cached;
        }
      }

      // Perform AI enhancement
      const enhancement = {
        enabled: true,
        timestamp: new Date().toISOString(),
        category: this.category,
        patterns: null,
        predictions: null,
        recommendations: null,
        confidence: 0
      };

      // Pattern analysis
      if (this.options.enablePatternAnalysis) {
        enhancement.patterns = await this._analyzePatterns(heuristicResults);
      }

      // Predictions
      if (this.options.enablePredictions) {
        enhancement.predictions = await this._generatePredictions(heuristicResults);
      }

      // AI-powered recommendations
      if (this.options.enableRecommendations) {
        enhancement.recommendations = await this._generateAIRecommendations(heuristicResults);
      }

      // Calculate overall confidence
      enhancement.confidence = this._calculateConfidence(
        enhancement.patterns,
        enhancement.predictions,
        enhancement.recommendations
      );

      // Cache result
      if (this.options.enableCaching && enhancement.confidence >= this.options.confidenceThreshold) {
        this._cacheResult(heuristicResults, enhancement);
      }

      // Update metrics
      this._updateMetrics(Date.now() - startTime, enhancement.confidence, true);

      return enhancement;

    } catch (error) {
      console.warn(`AI enhancement failed for ${this.category}:`, error.message);
      
      this._updateMetrics(Date.now() - startTime, 0, false);
      
      return {
        enabled: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        category: this.category
      };
    }
  }

  /**
   * Analyze patterns in heuristic results - override in subclasses
   * @param {Object} heuristicResults - Heuristic analysis results
   * @returns {Promise<Object>} Pattern analysis results
   * @protected
   */
  async _analyzePatterns(heuristicResults) {
    if (!this.aiManager) {
      throw new Error('AI Manager not available for pattern analysis');
    }

    return await this.aiManager.performComprehensiveAIAnalysis(
      this._extractPatternFeatures(heuristicResults),
      [],
      { analysisType: `${this.category}_pattern_analysis` }
    );
  }

  /**
   * Generate predictions based on heuristic results - override in subclasses
   * @param {Object} heuristicResults - Heuristic analysis results
   * @returns {Promise<Object>} Prediction results
   * @protected
   */
  async _generatePredictions(heuristicResults) {
    if (!this.aiManager || !this.aiManager.predictiveEngine) {
      throw new Error('Predictive engine not available');
    }

    return await this.aiManager.predictiveEngine.performPredictiveAnalysis(
      this._extractPredictionFeatures(heuristicResults),
      []
    );
  }

  /**
   * Generate AI-powered recommendations - override in subclasses
   * @param {Object} heuristicResults - Heuristic analysis results
   * @returns {Promise<Object>} AI recommendations
   * @protected
   */
  async _generateAIRecommendations(heuristicResults) {
    if (!this.aiManager || !this.aiManager.optimizationEngine) {
      throw new Error('Optimization engine not available');
    }

    return await this.aiManager.optimizationEngine.performAIOptimization(
      this._extractRecommendationFeatures(heuristicResults),
      [],
      { category: this.category }
    );
  }

  /**
   * Extract features for pattern analysis - override in subclasses
   * @param {Object} heuristicResults - Heuristic analysis results
   * @returns {Object} Features for pattern analysis
   * @protected
   */
  _extractPatternFeatures(heuristicResults) {
    return {
      category: this.category,
      overallScore: heuristicResults.overallScore || 0,
      findings: heuristicResults.findings || [],
      categories: heuristicResults.categories || {}
    };
  }

  /**
   * Extract features for prediction analysis - override in subclasses
   * @param {Object} heuristicResults - Heuristic analysis results
   * @returns {Object} Features for prediction analysis
   * @protected
   */
  _extractPredictionFeatures(heuristicResults) {
    return this._extractPatternFeatures(heuristicResults);
  }

  /**
   * Extract features for recommendation generation - override in subclasses
   * @param {Object} heuristicResults - Heuristic analysis results
   * @returns {Object} Features for recommendation generation
   * @protected
   */
  _extractRecommendationFeatures(heuristicResults) {
    return this._extractPatternFeatures(heuristicResults);
  }

  /**
   * Calculate overall confidence score
   * @param {Object} patterns - Pattern analysis results
   * @param {Object} predictions - Prediction results
   * @param {Object} recommendations - Recommendation results
   * @returns {number} Confidence score (0-1)
   * @protected
   */
  _calculateConfidence(patterns, predictions, recommendations) {
    const scores = [];
    
    if (patterns && patterns.confidence) {
      scores.push(patterns.confidence);
    }
    
    if (predictions && predictions.confidence) {
      scores.push(predictions.confidence);
    }
    
    if (recommendations && recommendations.confidence) {
      scores.push(recommendations.confidence);
    }
    
    if (scores.length === 0) {
      return 0.5; // Default confidence
    }
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * Generate cache key for results
   * @param {Object} heuristicResults - Heuristic analysis results
   * @returns {string} Cache key
   * @private
   */
  _generateCacheKey(heuristicResults) {
    const features = this._extractPatternFeatures(heuristicResults);
    return `${this.category}_${JSON.stringify(features)}`;
  }

  /**
   * Get cached result if available and not expired
   * @param {Object} heuristicResults - Heuristic analysis results
   * @returns {Object|null} Cached result or null
   * @private
   */
  _getCachedResult(heuristicResults) {
    const key = this._generateCacheKey(heuristicResults);
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.options.cacheTimeout) {
      return cached.result;
    }
    
    if (cached) {
      this.cache.delete(key); // Remove expired cache
    }
    
    return null;
  }

  /**
   * Cache enhancement result
   * @param {Object} heuristicResults - Heuristic analysis results
   * @param {Object} enhancement - Enhancement result
   * @private
   */
  _cacheResult(heuristicResults, enhancement) {
    const key = this._generateCacheKey(heuristicResults);
    this.cache.set(key, {
      result: enhancement,
      timestamp: Date.now()
    });
  }

  /**
   * Update performance metrics
   * @param {number} executionTime - Execution time in milliseconds
   * @param {number} confidence - Confidence score
   * @param {boolean} success - Whether enhancement was successful
   * @private
   */
  _updateMetrics(executionTime, confidence, success) {
    this.metrics.totalEnhancements++;
    
    if (success) {
      this.metrics.successfulEnhancements++;
    }
    
    // Update average confidence
    const totalConfidence = this.metrics.averageConfidence * (this.metrics.totalEnhancements - 1) + confidence;
    this.metrics.averageConfidence = totalConfidence / this.metrics.totalEnhancements;
    
    // Update average execution time
    const totalTime = this.metrics.averageExecutionTime * (this.metrics.totalEnhancements - 1) + executionTime;
    this.metrics.averageExecutionTime = totalTime / this.metrics.totalEnhancements;
  }

  /**
   * Get enhancement metrics
   * @returns {Object} Enhancement metrics
   */
  getMetrics() {
    return {
      category: this.category,
      ...this.metrics,
      successRate: this.metrics.totalEnhancements > 0 
        ? (this.metrics.successfulEnhancements / this.metrics.totalEnhancements) * 100 
        : 0,
      cacheSize: this.cache.size,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      totalEnhancements: 0,
      successfulEnhancements: 0,
      averageConfidence: 0,
      averageExecutionTime: 0
    };
  }
}
