/**
 * SEO Configuration System - Combined Approach Settings
 * 
 * Centralized configuration management for all SEO analyzer components
 * Supports environment-specific settings and feature toggles
 */

export class SEOConfiguration {
  constructor(customConfig = {}) {
    this.config = this._mergeConfigurations(this._getDefaultConfig(), customConfig);
    this.environmentConfig = this._getEnvironmentConfig();
    this.userPreferences = this._getUserPreferences();
  }

  /**
   * Get complete configuration for SEO analyzer
   * @returns {Object} Complete configuration
   */
  getConfig() {
    return {
      ...this.config,
      environment: this.environmentConfig,
      userPreferences: this.userPreferences,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get configuration for specific component
   * @param {string} component - Component name
   * @returns {Object} Component configuration
   */
  getComponentConfig(component) {
    return this.config.components?.[component] || {};
  }

  /**
   * Update configuration
   * @param {Object} updates - Configuration updates
   * @returns {Object} Updated configuration
   */
  updateConfig(updates) {
    this.config = this._mergeConfigurations(this.config, updates);
    return this.config;
  }

  /**
   * Get default configuration
   * @returns {Object} Default configuration
   * @private
   */
  _getDefaultConfig() {
    return {
      // Global settings
      global: {
        enableLogging: true,
        enableCaching: true,
        enableErrorRecovery: true,
        enablePerformanceMonitoring: true,
        timeout: 30000, // 30 seconds
        retryAttempts: 3,
        cacheTimeout: 300000, // 5 minutes
        debugMode: false
      },

      // Analysis pipeline configuration
      pipeline: {
        enableParallelProcessing: true,
        enableProgressTracking: true,
        enableValidation: true,
        maxConcurrentTasks: 5,
        processingOrder: [
          'detectors',
          'heuristics',
          'rules',
          'ai'
        ]
      },

      // Component configurations
      components: {
        // Detector configurations
        detectors: {
          metaTag: {
            enabled: true,
            extractAll: true,
            validateFormat: true,
            checkDuplicates: true
          },
          heading: {
            enabled: true,
            analyzeHierarchy: true,
            checkAccessibility: true,
            extractText: true
          },
          content: {
            enabled: true,
            analyzeReadability: true,
            extractStatistics: true,
            analyzeSentiment: false // Optional feature
          },
          link: {
            enabled: true,
            analyzeInternal: true,
            analyzeExternal: true,
            checkAccessibility: true,
            followRedirects: false // For security
          },
          structuredData: {
            enabled: true,
            validateSchema: true,
            extractAllTypes: true,
            checkCompliance: true
          }
        },

        // Heuristic analyzer configurations
        heuristics: {
          keywords: {
            enabled: true,
            analyzeDistribution: true,
            checkDensity: true,
            identifyLSI: true,
            minimumWordCount: 300,
            targetDensity: {
              min: 0.5,  // 0.5%
              max: 3.0   // 3.0%
            }
          },
          contentQuality: {
            enabled: true,
            analyzeReadability: true,
            checkGrammar: false, // Requires external service
            analyzeStructure: true,
            minimumReadabilityScore: 60
          },
          technicalSEO: {
            enabled: true,
            enableURLAnalysis: true,
            enableRobotsAnalysis: true,
            enableSchemaValidation: true,
            enableMobileAnalysis: true,
            enableSecurityAnalysis: true,
            urlMaxLength: 100,
            titleMaxLength: 60,
            descriptionMaxLength: 160
          },
          performance: {
            enabled: true,
            enableCoreWebVitals: true,
            enableResourceAnalysis: true,
            enableCachingAnalysis: true,
            enableCompressionAnalysis: true,
            enableRenderingAnalysis: true,
            lcpThreshold: 2.5,      // seconds
            fidThreshold: 100,      // milliseconds
            clsThreshold: 0.1,      // cumulative layout shift
            ttfbThreshold: 600,     // milliseconds
            maxResourceSize: 1048576 // 1MB
          }
        },

        // Rules engine configuration
        rules: {
          scoring: {
            enabled: true,
            enableWeightedScoring: true,
            enableGradeCalculation: true,
            enableRecommendationPrioritization: true,
            enableCompetitiveAnalysis: true,
            weights: {
              technical: 0.25,
              content: 0.30,
              keywords: 0.20,
              performance: 0.15,
              structure: 0.10
            },
            gradeThresholds: {
              A: 90,
              B: 80,
              C: 70,
              D: 60
            }
          }
        },

        // AI enhancement configuration
        ai: {
          enabled: true,
          enableAIAnalysis: true,
          enableContentAnalysis: true,
          enableCompetitiveInsights: true,
          enablePredictiveAnalytics: true,
          enableSemanticAnalysis: true,
          aiProvider: 'claude',
          analysisDepth: 'comprehensive',
          confidenceThreshold: 0.8,
          features: {
            contentOptimization: true,
            keywordSuggestions: true,
            competitorAnalysis: true,
            trendPrediction: true,
            semanticRelevance: true
          }
        }
      },

      // Output configuration
      output: {
        format: 'comprehensive', // basic, standard, comprehensive
        includeRawData: false,
        includeDebugInfo: false,
        includeRecommendations: true,
        includeScoring: true,
        includeAIInsights: true,
        compression: false,
        prettify: true
      },

      // Error handling configuration
      errorHandling: {
        enableGracefulDegradation: true,
        enableFallbackModes: true,
        enableDetailedErrorReporting: true,
        continueOnNonCriticalErrors: true,
        logErrors: true,
        reportErrors: false // External error reporting
      },

      // Performance optimization
      performance: {
        enableMemoryOptimization: true,
        enableResultCaching: true,
        enableLazyLoading: true,
        maxMemoryUsage: 512, // MB
        cacheStrategy: 'lru', // lru, fifo, none
        batchSize: 10
      },

      // Security settings
      security: {
        enableInputValidation: true,
        enableOutputSanitization: true,
        enableRateLimiting: false,
        allowExternalRequests: false,
        maxInputSize: 10485760, // 10MB
        trustedDomains: []
      }
    };
  }

  /**
   * Get environment-specific configuration
   * @returns {Object} Environment configuration
   * @private
   */
  _getEnvironmentConfig() {
    const env = process.env.NODE_ENV || 'development';
    
    const envConfigs = {
      development: {
        debugMode: true,
        enableDetailedLogging: true,
        enablePerformanceProfiles: true,
        strictValidation: false
      },
      testing: {
        debugMode: true,
        enableMocking: true,
        disableExternalCalls: true,
        fastMode: true
      },
      production: {
        debugMode: false,
        enableOptimizations: true,
        enableMonitoring: true,
        strictValidation: true
      }
    };

    return {
      current: env,
      settings: envConfigs[env] || envConfigs.development
    };
  }

  /**
   * Get user preferences (placeholder for future implementation)
   * @returns {Object} User preferences
   * @private
   */
  _getUserPreferences() {
    return {
      analysisDepth: 'comprehensive',
      includeAI: true,
      reportFormat: 'detailed',
      language: 'en',
      timezone: 'UTC'
    };
  }

  /**
   * Merge configuration objects
   * @param {Object} base - Base configuration
   * @param {Object} override - Override configuration
   * @returns {Object} Merged configuration
   * @private
   */
  _mergeConfigurations(base, override) {
    const result = { ...base };
    
    for (const key in override) {
      if (override[key] && typeof override[key] === 'object' && !Array.isArray(override[key])) {
        result[key] = this._mergeConfigurations(base[key] || {}, override[key]);
      } else {
        result[key] = override[key];
      }
    }
    
    return result;
  }

  /**
   * Validate configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result
   */
  validateConfig(config = this.config) {
    const errors = [];
    const warnings = [];

    // Validate required settings
    if (!config.global) {
      errors.push('Missing global configuration');
    }

    if (!config.components) {
      errors.push('Missing components configuration');
    }

    // Validate weights sum to 1.0
    const weights = config.components?.rules?.scoring?.weights;
    if (weights) {
      const weightSum = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
      if (Math.abs(weightSum - 1.0) > 0.01) {
        warnings.push(`Scoring weights sum to ${weightSum}, should be 1.0`);
      }
    }

    // Validate thresholds
    const thresholds = config.components?.heuristics?.performance;
    if (thresholds) {
      if (thresholds.lcpThreshold > 4.0) {
        warnings.push('LCP threshold is very high, consider lowering for better UX');
      }
      if (thresholds.fidThreshold > 300) {
        warnings.push('FID threshold is very high, consider lowering for better UX');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get preset configurations
   * @param {string} preset - Preset name
   * @returns {Object} Preset configuration
   */
  getPreset(preset) {
    const presets = {
      // Fast analysis with basic features
      fast: {
        components: {
          detectors: {
            content: { analyzeSentiment: false },
            structuredData: { validateSchema: false }
          },
          heuristics: {
            contentQuality: { checkGrammar: false },
            performance: { enableCoreWebVitals: false }
          },
          ai: { enabled: false }
        },
        pipeline: { enableParallelProcessing: true }
      },

      // Comprehensive analysis with all features
      comprehensive: {
        components: {
          detectors: {
            content: { analyzeSentiment: true },
            structuredData: { validateSchema: true }
          },
          heuristics: {
            contentQuality: { checkGrammar: true },
            performance: { enableCoreWebVitals: true }
          },
          ai: { 
            enabled: true,
            analysisDepth: 'comprehensive'
          }
        }
      },

      // SEO audit focused configuration
      audit: {
        components: {
          heuristics: {
            technicalSEO: { enabled: true },
            performance: { enabled: true }
          },
          rules: {
            scoring: { enableWeightedScoring: true }
          }
        },
        output: {
          includeRecommendations: true,
          includeScoring: true
        }
      },

      // Content optimization focused
      content: {
        components: {
          detectors: {
            content: { 
              analyzeReadability: true,
              analyzeSentiment: true
            }
          },
          heuristics: {
            keywords: { enabled: true },
            contentQuality: { enabled: true }
          },
          ai: {
            enableContentAnalysis: true,
            enableSemanticAnalysis: true
          }
        }
      }
    };

    return presets[preset] || null;
  }

  /**
   * Apply preset configuration
   * @param {string} preset - Preset name
   * @returns {boolean} Success status
   */
  applyPreset(preset) {
    const presetConfig = this.getPreset(preset);
    if (presetConfig) {
      this.config = this._mergeConfigurations(this.config, presetConfig);
      return true;
    }
    return false;
  }

  /**
   * Export configuration to JSON
   * @returns {string} JSON configuration
   */
  exportConfig() {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Import configuration from JSON
   * @param {string} jsonConfig - JSON configuration string
   * @returns {boolean} Success status
   */
  importConfig(jsonConfig) {
    try {
      const importedConfig = JSON.parse(jsonConfig);
      const validation = this.validateConfig(importedConfig);
      
      if (validation.valid) {
        this.config = importedConfig;
        return true;
      } else {
        console.warn('Configuration validation failed:', validation.errors);
        return false;
      }
    } catch (error) {
      console.error('Failed to import configuration:', error.message);
      return false;
    }
  }

  /**
   * Reset to default configuration
   */
  resetToDefaults() {
    this.config = this._getDefaultConfig();
  }

  /**
   * Get configuration schema (for documentation/validation)
   * @returns {Object} Configuration schema
   */
  getSchema() {
    return {
      type: 'object',
      properties: {
        global: {
          type: 'object',
          description: 'Global settings for the SEO analyzer'
        },
        pipeline: {
          type: 'object',
          description: 'Analysis pipeline configuration'
        },
        components: {
          type: 'object',
          description: 'Component-specific configurations',
          properties: {
            detectors: { type: 'object' },
            heuristics: { type: 'object' },
            rules: { type: 'object' },
            ai: { type: 'object' }
          }
        },
        output: {
          type: 'object',
          description: 'Output formatting configuration'
        },
        errorHandling: {
          type: 'object',
          description: 'Error handling and recovery settings'
        },
        performance: {
          type: 'object',
          description: 'Performance optimization settings'
        },
        security: {
          type: 'object',
          description: 'Security and validation settings'
        }
      }
    };
  }
}

export default SEOConfiguration;
