/**
 * Performance Configuration System - Combined Approach Settings
 * 
 * Centralized configuration management for performance analysis components
 * Supports environment-specific settings and feature flags
 * 
 * @version 1.0.0
 * @author Performance Team
 */

export class PerformanceConfiguration {
  constructor(environment = 'development') {
    this.environment = environment;
    this.config = this.initializeConfiguration();
  }

  /**
   * Initialize performance configuration based on environment
   */
  initializeConfiguration() {
    const baseConfig = {
      // Detection Configuration
      detection: {
        enableResourceDetection: true,
        enableMetricsDetection: true,
        includeInlineResources: true,
        trackThirdPartyResources: true,
        enableRealUserMetrics: true,
        trackNavigationTiming: true,
        measureResourceTiming: true,
        resourceTimeoutMs: 5000,
        metricsTimeoutMs: 10000
      },

      // Analysis Configuration
      analysis: {
        enableAdvancedAnalysis: true,
        includeExperimentalMetrics: false,
        trackUserExperience: true,
        enableMobileAnalysis: true,
        enableCompetitiveAnalysis: false,
        performanceThresholds: this.getPerformanceThresholds(),
        weightings: this.getAnalysisWeightings()
      },

      // Scoring Configuration
      scoring: {
        enableGrading: true,
        weightCoreWebVitals: 0.6,
        weightResourceOptimization: 0.2,
        weightLoadingStrategy: 0.1,
        weightThirdParty: 0.1,
        gradeThresholds: {
          A: 90,
          B: 80,
          C: 70,
          D: 60,
          F: 0
        }
      },

      // AI Enhancement Configuration
      ai: {
        enabled: true,
        enablePredictiveAnalysis: true,
        enableCompetitiveAnalysis: false,
        enablePersonalization: false,
        confidenceThreshold: 0.7,
        processingTimeoutMs: 5000,
        fallbackToHeuristics: true
      },

      // Feature Flags
      features: {
        coreWebVitalsV2: false,
        experimentalMetrics: false,
        advancedImageAnalysis: true,
        httpArchiveIntegration: false,
        realUserMonitoring: false,
        performanceBudgets: true,
        automaticOptimization: false
      },

      // Performance Budgets
      budgets: {
        overall: {
          totalSize: 3000000,      // 3MB
          totalRequests: 100,
          loadTime: 3000           // 3 seconds
        },
        scripts: {
          maxSize: 1000000,        // 1MB
          maxCount: 15,
          maxBlockingCount: 3
        },
        stylesheets: {
          maxSize: 300000,         // 300KB
          maxCount: 10,
          maxBlockingCount: 5
        },
        images: {
          maxSize: 2000000,        // 2MB
          maxCount: 50,
          compressionThreshold: 0.8
        },
        fonts: {
          maxSize: 200000,         // 200KB
          maxCount: 6,
          preloadCount: 2
        },
        thirdParty: {
          maxDomains: 10,
          maxSize: 500000,         // 500KB
          maxCriticalCount: 2
        }
      },

      // Monitoring Configuration
      monitoring: {
        enableContinuousMonitoring: false,
        monitoringInterval: 300000,  // 5 minutes
        alertThresholds: {
          coreWebVitalsDecline: 0.2,
          performanceScoreDecline: 10,
          errorRateIncrease: 0.1
        },
        retentionPeriod: 2592000000  // 30 days
      },

      // Output Configuration
      output: {
        enableDetailedReports: true,
        includeRecommendations: true,
        includeMetadata: true,
        formatResults: true,
        compressionEnabled: false,
        exportFormats: ['json', 'html']
      }
    };

    return this.applyEnvironmentOverrides(baseConfig);
  }

  /**
   * Apply environment-specific configuration overrides
   */
  applyEnvironmentOverrides(baseConfig) {
    const environmentConfigs = {
      development: {
        analysis: {
          includeExperimentalMetrics: true,
          enableCompetitiveAnalysis: false
        },
        ai: {
          enabled: true,
          processingTimeoutMs: 2000
        },
        features: {
          experimentalMetrics: true,
          httpArchiveIntegration: false
        },
        output: {
          enableDetailedReports: true,
          includeMetadata: true
        }
      },

      testing: {
        detection: {
          resourceTimeoutMs: 2000,
          metricsTimeoutMs: 3000
        },
        ai: {
          enabled: false,
          fallbackToHeuristics: true
        },
        features: {
          realUserMonitoring: false,
          automaticOptimization: false
        },
        output: {
          compressionEnabled: false,
          exportFormats: ['json']
        }
      },

      production: {
        analysis: {
          includeExperimentalMetrics: false,
          enableCompetitiveAnalysis: true
        },
        ai: {
          enabled: true,
          processingTimeoutMs: 3000,
          confidenceThreshold: 0.8
        },
        features: {
          realUserMonitoring: true,
          performanceBudgets: true
        },
        monitoring: {
          enableContinuousMonitoring: true,
          monitoringInterval: 600000  // 10 minutes
        },
        output: {
          compressionEnabled: true,
          exportFormats: ['json', 'html', 'pdf']
        }
      }
    };

    const environmentConfig = environmentConfigs[this.environment] || {};
    return this.deepMerge(baseConfig, environmentConfig);
  }

  /**
   * Get performance thresholds configuration
   */
  getPerformanceThresholds() {
    return {
      coreWebVitals: {
        lcp: { good: 2500, needsImprovement: 4000 },
        fid: { good: 100, needsImprovement: 300 },
        cls: { good: 0.1, needsImprovement: 0.25 },
        fcp: { good: 1800, needsImprovement: 3000 },
        ttfb: { good: 800, needsImprovement: 1800 },
        inp: { good: 200, needsImprovement: 500 }
      },
      resources: {
        totalSize: { good: 1000000, warning: 3000000 },
        totalCount: { good: 50, warning: 100 },
        scriptSize: { good: 300000, warning: 1000000 },
        imageSize: { good: 500000, warning: 2000000 },
        cssSize: { good: 150000, warning: 500000 }
      },
      loading: {
        domContentLoaded: { good: 1500, warning: 3000 },
        windowLoad: { good: 2500, warning: 5000 },
        firstByte: { good: 500, warning: 1500 }
      }
    };
  }

  /**
   * Get analysis weightings configuration
   */
  getAnalysisWeightings() {
    return {
      coreWebVitals: {
        lcp: 0.35,
        fid: 0.25,
        cls: 0.25,
        fcp: 0.1,
        ttfb: 0.05
      },
      resourceTypes: {
        critical: 0.4,
        images: 0.25,
        scripts: 0.2,
        stylesheets: 0.1,
        fonts: 0.05
      },
      deviceTypes: {
        mobile: 0.6,
        desktop: 0.3,
        tablet: 0.1
      },
      userExperience: {
        interactivity: 0.4,
        visualStability: 0.3,
        loadingPerformance: 0.3
      }
    };
  }

  /**
   * Get configuration value by path
   */
  get(path, defaultValue = null) {
    return this.getNestedValue(this.config, path, defaultValue);
  }

  /**
   * Set configuration value by path
   */
  set(path, value) {
    this.setNestedValue(this.config, path, value);
  }

  /**
   * Update configuration with partial updates
   */
  update(updates) {
    this.config = this.deepMerge(this.config, updates);
  }

  /**
   * Validate configuration completeness and correctness
   */
  validate() {
    const issues = [];

    // Validate required sections
    const requiredSections = ['detection', 'analysis', 'scoring', 'ai', 'budgets'];
    requiredSections.forEach(section => {
      if (!this.config[section]) {
        issues.push(`Missing required section: ${section}`);
      }
    });

    // Validate thresholds
    const thresholds = this.config.analysis?.performanceThresholds?.coreWebVitals;
    if (thresholds) {
      Object.entries(thresholds).forEach(([metric, values]) => {
        if (values.good >= values.needsImprovement) {
          issues.push(`Invalid threshold for ${metric}: good must be less than needsImprovement`);
        }
      });
    }

    // Validate weights sum to 1
    const scoringWeights = [
      this.config.scoring?.weightCoreWebVitals,
      this.config.scoring?.weightResourceOptimization,
      this.config.scoring?.weightLoadingStrategy,
      this.config.scoring?.weightThirdParty
    ].filter(w => typeof w === 'number');

    const weightSum = scoringWeights.reduce((sum, weight) => sum + weight, 0);
    if (Math.abs(weightSum - 1.0) > 0.01) {
      issues.push(`Scoring weights sum to ${weightSum}, should sum to 1.0`);
    }

    // Validate AI configuration
    if (this.config.ai?.enabled && !this.config.ai?.fallbackToHeuristics) {
      issues.push('AI enabled without fallback to heuristics may cause failures');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Get performance budgets for specific resource type
   */
  getBudget(resourceType) {
    return this.config.budgets?.[resourceType] || this.config.budgets?.overall;
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(featureName) {
    return this.config.features?.[featureName] === true;
  }

  /**
   * Get monitoring configuration
   */
  getMonitoringConfig() {
    return this.config.monitoring || {};
  }

  /**
   * Get AI configuration
   */
  getAIConfig() {
    return this.config.ai || { enabled: false };
  }

  /**
   * Get detection configuration
   */
  getDetectionConfig() {
    return this.config.detection || {};
  }

  /**
   * Get analysis configuration
   */
  getAnalysisConfig() {
    return this.config.analysis || {};
  }

  /**
   * Get scoring configuration
   */
  getScoringConfig() {
    return this.config.scoring || {};
  }

  /**
   * Export configuration for debugging
   */
  export() {
    return {
      environment: this.environment,
      config: this.config,
      validation: this.validate()
    };
  }

  /**
   * Create configuration preset for specific use cases
   */
  static createPreset(presetName, customizations = {}) {
    const presets = {
      minimal: {
        detection: { enableRealUserMetrics: false, trackThirdPartyResources: false },
        analysis: { enableAdvancedAnalysis: false, includeExperimentalMetrics: false },
        ai: { enabled: false },
        features: { experimentalMetrics: false, realUserMonitoring: false }
      },

      comprehensive: {
        detection: { enableRealUserMetrics: true, trackThirdPartyResources: true },
        analysis: { enableAdvancedAnalysis: true, includeExperimentalMetrics: true },
        ai: { enabled: true, enablePredictiveAnalysis: true },
        features: { experimentalMetrics: true, advancedImageAnalysis: true }
      },

      mobile: {
        analysis: { weightings: { deviceTypes: { mobile: 0.8, desktop: 0.15, tablet: 0.05 } } },
        budgets: { 
          overall: { totalSize: 1500000, loadTime: 2000 },
          images: { maxSize: 1000000 }
        }
      },

      ecommerce: {
        analysis: { enableCompetitiveAnalysis: true },
        budgets: {
          overall: { totalSize: 2000000, loadTime: 2500 },
          thirdParty: { maxDomains: 15, maxSize: 800000 }
        },
        features: { performanceBudgets: true, realUserMonitoring: true }
      }
    };

    const baseConfig = new PerformanceConfiguration();
    const presetConfig = presets[presetName] || {};
    baseConfig.update(presetConfig);
    baseConfig.update(customizations);
    
    return baseConfig;
  }

  // Utility methods

  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  getNestedValue(obj, path, defaultValue) {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }
    
    return current;
  }

  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  }
}

// Export default configuration instance
export default new PerformanceConfiguration();

// Export configuration class for custom instances
export { PerformanceConfiguration as PerformanceConfigurationClass };
