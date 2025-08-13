/**
 * Mobile Analyzer Configuration - Advanced Configuration Management
 * 
 * Comprehensive configuration system for mobile analysis with
 * adaptive settings, performance tuning, and customizable thresholds.
 */

export class MobileAnalyzerConfig {
  constructor(userConfig = {}) {
    this.defaultConfig = this.getDefaultConfiguration();
    this.userConfig = userConfig;
    this.config = this.mergeConfigurations(this.defaultConfig, userConfig);
    this.profileConfigs = this.initializeProfiles();
  }

  getDefaultConfiguration() {
    return {
      // Analysis Settings
      analysis: {
        enableAllDetectors: true,
        enableHeuristics: true,
        enableRulesEngine: true,
        enableAIEnhancement: true,
        parallelProcessing: true,
        timeoutMs: 30000,
        retryAttempts: 3
      },

      // Detector Configuration
      detectors: {
        responsive: {
          enabled: true,
          strictMode: false,
          checkFluidLayouts: true,
          checkMobileFirst: true,
          checkBreakpoints: true,
          breakpointThresholds: [480, 768, 1024, 1200],
          minimumBreakpoints: 3
        },

        mobileFeatures: {
          enabled: true,
          checkViewport: true,
          checkAppIcons: true,
          checkTouchIcons: true,
          checkMobileAPIs: true,
          requiredMetaTags: ['viewport', 'theme-color']
        },

        touchOptimization: {
          enabled: true,
          minimumTouchTargetSize: 44,
          recommendedTouchTargetSize: 48,
          minimumSpacing: 8,
          checkTouchFeedback: true,
          checkGestureSupport: true
        },

        mobileNavigation: {
          enabled: true,
          checkHamburgerMenu: true,
          checkBottomNavigation: true,
          checkCollapsibleMenu: true,
          checkThumbZoneOptimization: true,
          maxNavigationItems: 7
        },

        viewport: {
          enabled: true,
          checkViewportMeta: true,
          checkResponsiveBreakpoints: true,
          checkMobileFirstApproach: true,
          strictViewportValidation: false
        },

        pwa: {
          enabled: true,
          checkManifest: true,
          checkServiceWorker: true,
          checkInstallability: true,
          checkOfflineSupport: true,
          manifestRequiredFields: ['name', 'short_name', 'start_url', 'display', 'icons']
        },

        mobilePerformance: {
          enabled: true,
          checkCoreWebVitals: true,
          checkResourceOptimization: true,
          checkNetworkEfficiency: true,
          checkBatteryOptimization: true,
          performanceThresholds: {
            lcp: 2.5,
            fid: 100,
            cls: 0.1,
            fcp: 1.8
          }
        }
      },

      // Heuristics Configuration
      heuristics: {
        ux: {
          enabled: true,
          strictMode: false,
          includeAdvanced: true,
          scoreThreshold: 0.7,
          checkThumbZone: true,
          checkTouchFeedback: true,
          checkSwipeGestures: true,
          checkLoadingStates: true
        },

        responsiveness: {
          enabled: true,
          strictMode: false,
          includeAdvanced: true,
          breakpointThreshold: 4,
          fluidThreshold: 0.8,
          checkMobileFirst: true,
          checkFluidLayouts: true
        },

        accessibility: {
          enabled: true,
          strictMode: false,
          wcagLevel: 'AA',
          includeAAA: false,
          touchTargetMinSize: 44,
          contrastRatio: 4.5,
          checkKeyboardAccess: true,
          checkScreenReader: true
        }
      },

      // Rules Engine Configuration
      rules: {
        enabled: true,
        strictMode: false,
        enableAdaptiveScoring: true,
        weightAdjustment: true,
        contextAwareness: true,
        performanceThreshold: 0.7,
        accessibilityThreshold: 0.8,
        uxThreshold: 0.75,
        scoringAlgorithm: 'adaptive', // 'weighted', 'exponential', 'logarithmic', 'adaptive', 'contextual'
        categoryWeights: {
          RESPONSIVE_DESIGN: 0.25,
          MOBILE_UX: 0.25,
          PERFORMANCE: 0.2,
          ACCESSIBILITY: 0.2,
          PWA_FEATURES: 0.1
        }
      },

      // AI Enhancement Configuration
      ai: {
        enabled: true,
        enablePredictions: true,
        enableSmartInsights: true,
        enableTrendAnalysis: true,
        enableContextualRecommendations: true,
        confidenceThreshold: 0.7,
        learningEnabled: false,
        modelVersions: {
          performance: '1.0.0',
          ux: '1.0.0',
          accessibility: '1.0.0',
          trends: '1.0.0'
        }
      },

      // Scoring Configuration
      scoring: {
        enableWeightedScoring: true,
        enableCategoryScoring: true,
        enableProgressiveScoring: false,
        scoreScale: 100, // 1-100 or 0-1
        roundingPrecision: 2,
        minimumScore: 0,
        maximumScore: 100
      },

      // Recommendation Configuration
      recommendations: {
        enablePrioritization: true,
        maxRecommendations: 20,
        priorityLevels: ['critical', 'high', 'medium', 'low'],
        includeImplementationGuides: true,
        includeCodeExamples: false,
        includeEstimatedEffort: true,
        includeImpactAnalysis: true
      },

      // Performance Configuration
      performance: {
        enableCaching: true,
        cacheTimeout: 300000, // 5 minutes
        enableParallelAnalysis: true,
        maxConcurrentDetectors: 5,
        enableProgressReporting: true,
        enableDetailedTiming: false
      },

      // Output Configuration
      output: {
        format: 'detailed', // 'summary', 'detailed', 'comprehensive'
        includeRawData: false,
        includeDebugInfo: false,
        includeTimestamps: true,
        includeMetadata: true,
        enableJSONOutput: true,
        enableHTMLReport: false
      },

      // Device Simulation Configuration
      deviceSimulation: {
        enabled: false,
        devices: [
          { name: 'iPhone 12', width: 390, height: 844, userAgent: 'iPhone' },
          { name: 'Samsung Galaxy S21', width: 384, height: 854, userAgent: 'Samsung' },
          { name: 'iPad', width: 768, height: 1024, userAgent: 'iPad' }
        ],
        defaultDevice: 'iPhone 12'
      },

      // Debug Configuration
      debug: {
        enableLogging: false,
        logLevel: 'error', // 'debug', 'info', 'warn', 'error'
        enableVerboseOutput: false,
        saveIntermediateResults: false,
        enablePerformanceMetrics: false
      }
    };
  }

  initializeProfiles() {
    return {
      // Quick analysis for fast feedback
      quick: {
        analysis: { enableAllDetectors: true, enableHeuristics: false, enableAIEnhancement: false },
        detectors: { responsive: { enabled: true }, touchOptimization: { enabled: true } },
        output: { format: 'summary' },
        performance: { maxConcurrentDetectors: 3 }
      },

      // Comprehensive analysis for detailed insights
      comprehensive: {
        analysis: { enableAllDetectors: true, enableHeuristics: true, enableAIEnhancement: true },
        output: { format: 'comprehensive', includeRawData: true },
        ai: { enablePredictions: true, enableTrendAnalysis: true }
      },

      // Accessibility-focused analysis
      accessibility: {
        rules: { 
          accessibilityThreshold: 0.9,
          categoryWeights: { ACCESSIBILITY: 0.4, MOBILE_UX: 0.3, RESPONSIVE_DESIGN: 0.2, PERFORMANCE: 0.1 }
        },
        heuristics: { accessibility: { wcagLevel: 'AAA', includeAAA: true, strictMode: true } },
        recommendations: { priorityLevels: ['critical', 'high'] }
      },

      // Performance-focused analysis
      performance: {
        rules: {
          performanceThreshold: 0.8,
          categoryWeights: { PERFORMANCE: 0.4, RESPONSIVE_DESIGN: 0.3, MOBILE_UX: 0.2, ACCESSIBILITY: 0.1 }
        },
        detectors: { 
          mobilePerformance: { 
            performanceThresholds: { lcp: 2.0, fid: 75, cls: 0.05, fcp: 1.5 }
          }
        },
        ai: { enablePredictions: true }
      },

      // PWA-focused analysis
      pwa: {
        rules: {
          categoryWeights: { PWA_FEATURES: 0.3, MOBILE_UX: 0.25, PERFORMANCE: 0.25, RESPONSIVE_DESIGN: 0.2 }
        },
        detectors: { pwa: { checkManifest: true, checkServiceWorker: true, checkInstallability: true } },
        recommendations: { includeImplementationGuides: true }
      },

      // Enterprise analysis with strict requirements
      enterprise: {
        analysis: { strictMode: true },
        detectors: {
          responsive: { strictMode: true },
          touchOptimization: { minimumTouchTargetSize: 48 },
          mobilePerformance: { performanceThresholds: { lcp: 2.0, fid: 75, cls: 0.05 } }
        },
        heuristics: { accessibility: { wcagLevel: 'AAA', strictMode: true } },
        rules: { strictMode: true, accessibilityThreshold: 0.9, performanceThreshold: 0.8 },
        output: { format: 'comprehensive', includeRawData: true, includeDebugInfo: true }
      }
    };
  }

  mergeConfigurations(defaultConfig, userConfig) {
    return this.deepMerge(defaultConfig, userConfig);
  }

  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  applyProfile(profileName) {
    if (!this.profileConfigs[profileName]) {
      throw new Error(`Unknown profile: ${profileName}`);
    }
    
    this.config = this.deepMerge(this.config, this.profileConfigs[profileName]);
    return this;
  }

  updateConfig(updates) {
    this.config = this.deepMerge(this.config, updates);
    return this;
  }

  getConfig(path = null) {
    if (!path) return this.config;
    
    return path.split('.').reduce((obj, key) => obj && obj[key], this.config);
  }

  validateConfig() {
    const errors = [];
    const warnings = [];

    // Validate required settings
    if (!this.config.analysis) {
      errors.push('Analysis configuration is required');
    }

    // Validate thresholds
    const performanceThresholds = this.config.detectors?.mobilePerformance?.performanceThresholds;
    if (performanceThresholds) {
      if (performanceThresholds.lcp > 4.0) {
        warnings.push('LCP threshold is very high (>4.0s)');
      }
      if (performanceThresholds.cls > 0.25) {
        warnings.push('CLS threshold is very high (>0.25)');
      }
    }

    // Validate touch target sizes
    const touchTargetSize = this.config.detectors?.touchOptimization?.minimumTouchTargetSize;
    if (touchTargetSize && touchTargetSize < 44) {
      warnings.push('Touch target size below WCAG recommendations (<44px)');
    }

    // Validate category weights
    const categoryWeights = this.config.rules?.categoryWeights;
    if (categoryWeights) {
      const totalWeight = Object.values(categoryWeights).reduce((sum, weight) => sum + weight, 0);
      if (Math.abs(totalWeight - 1.0) > 0.01) {
        errors.push(`Category weights do not sum to 1.0 (current: ${totalWeight})`);
      }
    }

    return { errors, warnings, isValid: errors.length === 0 };
  }

  getDetectorConfig(detectorName) {
    return this.config.detectors?.[detectorName] || {};
  }

  getHeuristicConfig(heuristicName) {
    return this.config.heuristics?.[heuristicName] || {};
  }

  getRulesConfig() {
    return this.config.rules || {};
  }

  getAIConfig() {
    return this.config.ai || {};
  }

  getScoringConfig() {
    return this.config.scoring || {};
  }

  getPerformanceConfig() {
    return this.config.performance || {};
  }

  isDetectorEnabled(detectorName) {
    const detectorConfig = this.getDetectorConfig(detectorName);
    return detectorConfig.enabled !== false;
  }

  isHeuristicEnabled(heuristicName) {
    const heuristicConfig = this.getHeuristicConfig(heuristicName);
    return heuristicConfig.enabled !== false;
  }

  isFeatureEnabled(featurePath) {
    const value = this.getConfig(featurePath);
    return value !== false;
  }

  exportConfig() {
    return JSON.stringify(this.config, null, 2);
  }

  importConfig(configJson) {
    try {
      const importedConfig = JSON.parse(configJson);
      this.config = this.deepMerge(this.defaultConfig, importedConfig);
      return true;
    } catch (error) {
      throw new Error(`Invalid configuration JSON: ${error.message}`);
    }
  }

  resetToDefaults() {
    this.config = this.deepMerge({}, this.defaultConfig);
    return this;
  }

  createCustomProfile(profileName, profileConfig) {
    this.profileConfigs[profileName] = profileConfig;
    return this;
  }

  getAvailableProfiles() {
    return Object.keys(this.profileConfigs);
  }

  getCurrentProfile() {
    // Try to determine which profile best matches current config
    for (const [profileName, profileConfig] of Object.entries(this.profileConfigs)) {
      if (this.configMatchesProfile(profileConfig)) {
        return profileName;
      }
    }
    return 'custom';
  }

  configMatchesProfile(profileConfig) {
    // Simplified profile matching logic
    const keyPaths = this.flattenConfig(profileConfig);
    
    for (const [path, value] of keyPaths) {
      const currentValue = this.getConfig(path);
      if (currentValue !== value) {
        return false;
      }
    }
    
    return true;
  }

  flattenConfig(config, prefix = '') {
    const flattened = [];
    
    for (const [key, value] of Object.entries(config)) {
      const path = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        flattened.push(...this.flattenConfig(value, path));
      } else {
        flattened.push([path, value]);
      }
    }
    
    return flattened;
  }

  getConfigSummary() {
    const validation = this.validateConfig();
    
    return {
      profile: this.getCurrentProfile(),
      enabledDetectors: this.getEnabledDetectors(),
      enabledHeuristics: this.getEnabledHeuristics(),
      aiEnabled: this.config.ai?.enabled || false,
      rulesEnabled: this.config.rules?.enabled || false,
      scoringAlgorithm: this.config.rules?.scoringAlgorithm || 'weighted',
      outputFormat: this.config.output?.format || 'detailed',
      validation
    };
  }

  getEnabledDetectors() {
    const detectors = [];
    for (const [name, config] of Object.entries(this.config.detectors || {})) {
      if (config.enabled !== false) {
        detectors.push(name);
      }
    }
    return detectors;
  }

  getEnabledHeuristics() {
    const heuristics = [];
    for (const [name, config] of Object.entries(this.config.heuristics || {})) {
      if (config.enabled !== false) {
        heuristics.push(name);
      }
    }
    return heuristics;
  }
}
