/**
 * ============================================================================
 * CONTENT CONFIGURATION - Centralized Configuration Management
 * ============================================================================
 * 
 * Centralized configuration management for Combined Approach Content Analyzer.
 * This component manages settings, feature flags, thresholds, and environment-specific
 * configurations for all content analysis components.
 * 
 * Key Capabilities:
 * - Environment-specific configurations
 * - Feature flag management
 * - Content analysis thresholds
 * - Performance budgets and limits
 * - Scoring weight configurations
 * - AI enhancement settings
 * - Integration configurations
 * 
 * @module ContentConfiguration
 * @version 2.0.0
 * @author AI Assistant (Configuration Management)
 * @created 2025-08-12
 */

/**
 * Default Content Configuration
 */
export const DEFAULT_CONTENT_CONFIG = {
  // Environment Settings
  environment: {
    development: {
      debug: true,
      verbose: true,
      aiSimulation: true,
      processingDelay: 100
    },
    production: {
      debug: false,
      verbose: false,
      aiSimulation: false,
      processingDelay: 0
    },
    testing: {
      debug: true,
      verbose: false,
      aiSimulation: true,
      processingDelay: 0
    }
  },

  // Feature Flags
  features: {
    aiEnhancement: true,
    predictiveAnalysis: true,
    competitiveIntelligence: true,
    semanticAnalysis: true,
    trendForecasting: true,
    audienceOptimization: true,
    contentStrategy: true,
    advancedRecommendations: true,
    realTimeProcessing: false,
    machineLearning: false
  },

  // Content Analysis Thresholds
  thresholds: {
    quality: {
      minWordCount: 300,
      idealWordCount: 1500,
      maxWordCount: 5000,
      minReadabilityScore: 50,
      maxReadabilityGrade: 12,
      minUniqueContent: 85
    },
    seo: {
      minKeywordDensity: 1.0,
      maxKeywordDensity: 3.0,
      warningKeywordDensity: 5.0,
      minInternalLinks: 3,
      maxHeadingDepth: 6,
      minHeadingCount: 3
    },
    accessibility: {
      minContrastRatio: 4.5,
      maxReadingGrade: 12,
      minAltTextCoverage: 90,
      structuralCompliance: 80
    },
    performance: {
      maxLoadTime: 3000,
      minTextToHtmlRatio: 15,
      maxContentSize: 5000000, // 5MB
      minCompressionRatio: 70
    }
  },

  // Scoring Weights
  scoring: {
    overall: {
      seoOptimization: 0.25,
      userExperience: 0.20,
      contentQuality: 0.20,
      accessibility: 0.15,
      engagement: 0.10,
      conversion: 0.10
    },
    seo: {
      contentLength: 0.20,
      keywordOptimization: 0.25,
      headingOptimization: 0.15,
      semanticStructure: 0.15,
      internalLinking: 0.10,
      contentUniqueness: 0.15
    },
    ux: {
      readability: 0.25,
      scanability: 0.20,
      contentFlow: 0.15,
      navigation: 0.15,
      visualHierarchy: 0.15,
      mobileOptimization: 0.10
    },
    quality: {
      textMetrics: 0.20,
      readability: 0.25,
      contentStructure: 0.20,
      keywordAnalysis: 0.15,
      languageAnalysis: 0.10,
      uniquenessAnalysis: 0.10
    }
  },

  // Performance Budgets
  budgets: {
    analysis: {
      maxProcessingTime: 30000,  // 30 seconds
      maxMemoryUsage: 100000000, // 100MB
      maxConcurrentAnalyses: 5
    },
    content: {
      maxContentLength: 50000,   // 50k characters
      maxImageCount: 50,
      maxLinkCount: 100,
      maxHeadingCount: 30
    },
    ai: {
      maxAIProcessingTime: 10000, // 10 seconds
      aiConfidenceThreshold: 0.7,
      maxAIRetries: 3
    }
  },

  // Detection Settings
  detection: {
    structure: {
      maxHeadingDepth: 6,
      minContentBlocks: 1,
      semanticElementRequired: true,
      accessibilityChecks: true
    },
    quality: {
      readabilityAlgorithms: ['flesch', 'fleschKincaid', 'smog', 'ari'],
      keywordAnalysisDepth: 'comprehensive',
      languageDetection: true,
      uniquenessThreshold: 0.8
    }
  },

  // AI Enhancement Settings
  ai: {
    enhancement: {
      enabled: true,
      confidenceThreshold: 0.7,
      processingTimeout: 10000,
      fallbackMode: true
    },
    models: {
      contentAnalysis: 'advanced',
      predictiveAnalysis: 'standard',
      semanticAnalysis: 'comprehensive',
      competitiveAnalysis: 'basic'
    },
    processing: {
      batchSize: 10,
      parallelProcessing: true,
      cachingEnabled: true,
      resultPersistence: false
    }
  }
};

/**
 * Content Configuration Manager Class
 * 
 * Manages configuration settings for the Content Analyzer system.
 * Provides validation, environment handling, and dynamic updates.
 */
export class ContentConfiguration {
  constructor(options = {}) {
    this.config = this.mergeConfigurations(DEFAULT_CONTENT_CONFIG, options);
    this.environment = this.detectEnvironment();
    this.validationResults = null;
    this.lastUpdated = Date.now();
    
    // Apply environment-specific settings
    this.applyEnvironmentSettings();
    
    // Validate configuration
    this.validateConfiguration();
  }

  /**
   * Get current configuration
   * 
   * @returns {Object} Current configuration object
   */
  getConfiguration() {
    return {
      config: this.config,
      environment: this.environment,
      validation: this.validationResults,
      lastUpdated: this.lastUpdated
    };
  }

  /**
   * Update configuration with new settings
   * 
   * @param {Object} updates - Configuration updates
   * @returns {boolean} Success status
   */
  updateConfiguration(updates) {
    try {
      this.config = this.mergeConfigurations(this.config, updates);
      this.lastUpdated = Date.now();
      this.validateConfiguration();
      return true;
    } catch (error) {
      console.warn('Configuration update failed:', error.message);
      return false;
    }
  }

  /**
   * Check if a feature is enabled
   * 
   * @param {string} featureName - Name of the feature
   * @returns {boolean} Feature enabled status
   */
  isFeatureEnabled(featureName) {
    return this.config.features[featureName] === true;
  }

  /**
   * Get threshold value
   * 
   * @param {string} category - Threshold category
   * @param {string} metric - Specific metric
   * @returns {number|null} Threshold value
   */
  getThreshold(category, metric) {
    return this.config.thresholds[category]?.[metric] || null;
  }

  /**
   * Get scoring weight
   * 
   * @param {string} category - Scoring category
   * @param {string} factor - Specific factor
   * @returns {number|null} Weight value
   */
  getScoringWeight(category, factor) {
    return this.config.scoring[category]?.[factor] || null;
  }

  /**
   * Get performance budget
   * 
   * @param {string} category - Budget category
   * @param {string} metric - Specific metric
   * @returns {number|null} Budget value
   */
  getPerformanceBudget(category, metric) {
    return this.config.budgets[category]?.[metric] || null;
  }

  /**
   * Get AI settings
   * 
   * @param {string} category - AI settings category
   * @returns {Object|null} AI settings
   */
  getAISettings(category = null) {
    if (category) {
      return this.config.ai[category] || null;
    }
    return this.config.ai;
  }

  /**
   * Get detection settings
   * 
   * @param {string} detector - Detector type
   * @returns {Object|null} Detection settings
   */
  getDetectionSettings(detector = null) {
    if (detector) {
      return this.config.detection[detector] || null;
    }
    return this.config.detection;
  }

  /**
   * Validate current configuration
   * 
   * @returns {Object} Validation results
   */
  validateConfiguration() {
    const validation = {
      valid: true,
      errors: [],
      warnings: [],
      timestamp: Date.now()
    };

    // Validate thresholds
    this.validateThresholds(validation);
    
    // Validate scoring weights
    this.validateScoringWeights(validation);
    
    // Validate budgets
    this.validateBudgets(validation);
    
    // Validate feature flags
    this.validateFeatures(validation);

    this.validationResults = validation;
    return validation;
  }

  /**
   * Reset configuration to defaults
   * 
   * @returns {boolean} Success status
   */
  resetToDefaults() {
    try {
      this.config = JSON.parse(JSON.stringify(DEFAULT_CONTENT_CONFIG));
      this.applyEnvironmentSettings();
      this.lastUpdated = Date.now();
      this.validateConfiguration();
      return true;
    } catch (error) {
      console.warn('Configuration reset failed:', error.message);
      return false;
    }
  }

  /**
   * Export configuration as JSON
   * 
   * @returns {string} JSON configuration
   */
  exportConfiguration() {
    return JSON.stringify({
      config: this.config,
      environment: this.environment,
      exported: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Import configuration from JSON
   * 
   * @param {string} jsonConfig - JSON configuration string
   * @returns {boolean} Success status
   */
  importConfiguration(jsonConfig) {
    try {
      const imported = JSON.parse(jsonConfig);
      if (imported.config) {
        this.updateConfiguration(imported.config);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Configuration import failed:', error.message);
      return false;
    }
  }

  // Private methods

  /**
   * Detect current environment
   * 
   * @returns {string} Environment name
   */
  detectEnvironment() {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NODE_ENV || 'development';
    }
    
    if (typeof window !== 'undefined') {
      return window.location.hostname === 'localhost' ? 'development' : 'production';
    }
    
    return 'development';
  }

  /**
   * Apply environment-specific settings
   */
  applyEnvironmentSettings() {
    const envSettings = this.config.environment[this.environment];
    if (envSettings) {
      // Apply debug settings
      if (envSettings.debug !== undefined) {
        this.config.debug = envSettings.debug;
      }
      
      // Apply AI simulation settings
      if (envSettings.aiSimulation !== undefined) {
        this.config.ai.simulation = envSettings.aiSimulation;
      }
      
      // Apply processing delay settings
      if (envSettings.processingDelay !== undefined) {
        this.config.ai.processingDelay = envSettings.processingDelay;
      }
    }
  }

  /**
   * Merge configuration objects
   * 
   * @param {Object} base - Base configuration
   * @param {Object} updates - Configuration updates
   * @returns {Object} Merged configuration
   */
  mergeConfigurations(base, updates) {
    const merged = JSON.parse(JSON.stringify(base));
    return this.deepMerge(merged, updates);
  }

  /**
   * Deep merge two objects
   * 
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   * @returns {Object} Merged object
   */
  deepMerge(target, source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        this.deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  /**
   * Validate threshold configurations
   * 
   * @param {Object} validation - Validation results object
   */
  validateThresholds(validation) {
    const thresholds = this.config.thresholds;
    
    // Validate quality thresholds
    if (thresholds.quality.minWordCount >= thresholds.quality.idealWordCount) {
      validation.errors.push('Quality: minWordCount must be less than idealWordCount');
      validation.valid = false;
    }
    
    // Validate SEO thresholds
    if (thresholds.seo.minKeywordDensity >= thresholds.seo.maxKeywordDensity) {
      validation.errors.push('SEO: minKeywordDensity must be less than maxKeywordDensity');
      validation.valid = false;
    }
  }

  /**
   * Validate scoring weight configurations
   * 
   * @param {Object} validation - Validation results object
   */
  validateScoringWeights(validation) {
    const scoring = this.config.scoring;
    
    // Validate overall weights sum to 1.0
    const overallSum = Object.values(scoring.overall).reduce((sum, weight) => sum + weight, 0);
    if (Math.abs(overallSum - 1.0) > 0.01) {
      validation.warnings.push(`Overall scoring weights sum to ${overallSum.toFixed(2)}, should be 1.0`);
    }
    
    // Validate category weights
    Object.entries(scoring).forEach(([category, weights]) => {
      if (category !== 'overall' && typeof weights === 'object') {
        const categorySum = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        if (Math.abs(categorySum - 1.0) > 0.01) {
          validation.warnings.push(`${category} scoring weights sum to ${categorySum.toFixed(2)}, should be 1.0`);
        }
      }
    });
  }

  /**
   * Validate budget configurations
   * 
   * @param {Object} validation - Validation results object
   */
  validateBudgets(validation) {
    const budgets = this.config.budgets;
    
    // Validate analysis budgets
    if (budgets.analysis.maxProcessingTime <= 0) {
      validation.errors.push('Analysis: maxProcessingTime must be positive');
      validation.valid = false;
    }
    
    // Validate AI budgets
    if (budgets.ai.aiConfidenceThreshold < 0 || budgets.ai.aiConfidenceThreshold > 1) {
      validation.errors.push('AI: aiConfidenceThreshold must be between 0 and 1');
      validation.valid = false;
    }
  }

  /**
   * Validate feature flag configurations
   * 
   * @param {Object} validation - Validation results object
   */
  validateFeatures(validation) {
    const features = this.config.features;
    
    // Check for invalid feature types
    Object.entries(features).forEach(([feature, enabled]) => {
      if (typeof enabled !== 'boolean') {
        validation.errors.push(`Feature ${feature}: value must be boolean`);
        validation.valid = false;
      }
    });
  }
}

export default ContentConfiguration;
