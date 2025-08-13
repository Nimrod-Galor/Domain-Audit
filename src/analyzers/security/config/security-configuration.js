/**
 * ============================================================================
 * SECURITY CONFIGURATION - Centralized Configuration Management
 * ============================================================================
 * 
 * Centralized configuration management for the Security Analyzer implementing
 * environment-aware settings, feature flags, and performance optimization.
 * 
 * Features:
 * - Environment-specific security configuration
 * - Feature flag management for gradual rollout
 * - Performance and memory optimization settings
 * - Security threshold and scoring configuration
 * - Compliance framework selection and customization
 * - AI enhancement configuration and model selection
 * - Integration settings for external security services
 * - Audit and logging configuration
 * 
 * @module SecurityConfiguration
 * @version 1.0.0
 * @author AI Assistant (Combined Approach)
 * @created 2025-08-12
 */

/**
 * Environment Detection and Configuration
 */
const ENVIRONMENT_CONFIG = {
  development: {
    strictMode: false,
    verboseLogging: true,
    enableAllFeatures: true,
    performanceOptimization: false,
    aiConfidenceThreshold: 0.6,
    complianceLevel: 'basic'
  },
  testing: {
    strictMode: true,
    verboseLogging: true,
    enableAllFeatures: true,
    performanceOptimization: false,
    aiConfidenceThreshold: 0.7,
    complianceLevel: 'standard'
  },
  staging: {
    strictMode: true,
    verboseLogging: false,
    enableAllFeatures: true,
    performanceOptimization: true,
    aiConfidenceThreshold: 0.75,
    complianceLevel: 'standard'
  },
  production: {
    strictMode: true,
    verboseLogging: false,
    enableAllFeatures: false,
    performanceOptimization: true,
    aiConfidenceThreshold: 0.8,
    complianceLevel: 'strict'
  }
};

/**
 * Feature Flags for Security Components
 */
const FEATURE_FLAGS = {
  // Detector features
  ssl_security_detection: { enabled: true, version: '1.0.0', rollout: 100 },
  security_headers_detection: { enabled: true, version: '1.0.0', rollout: 100 },
  vulnerability_detection: { enabled: true, version: '1.0.0', rollout: 100 },
  
  // Heuristic features
  security_risk_analysis: { enabled: true, version: '1.0.0', rollout: 100 },
  threat_modeling: { enabled: true, version: '1.0.0', rollout: 90 },
  attack_vector_analysis: { enabled: true, version: '1.0.0', rollout: 85 },
  
  // Rules engine features
  compliance_assessment: { enabled: true, version: '1.0.0', rollout: 100 },
  owasp_compliance: { enabled: true, version: '1.0.0', rollout: 100 },
  nist_compliance: { enabled: true, version: '1.0.0', rollout: 95 },
  iso27001_compliance: { enabled: true, version: '1.0.0', rollout: 80 },
  pci_dss_compliance: { enabled: true, version: '1.0.0', rollout: 75 },
  gdpr_compliance: { enabled: true, version: '1.0.0', rollout: 90 },
  
  // AI enhancement features
  ai_threat_intelligence: { enabled: true, version: '1.0.0', rollout: 70 },
  ai_predictive_analytics: { enabled: true, version: '1.0.0', rollout: 60 },
  ai_behavioral_analysis: { enabled: true, version: '1.0.0', rollout: 50 },
  ai_adaptive_learning: { enabled: false, version: '1.0.0', rollout: 25 },
  
  // Advanced features
  real_time_monitoring: { enabled: false, version: '1.0.0', rollout: 20 },
  automated_remediation: { enabled: false, version: '1.0.0', rollout: 10 },
  advanced_reporting: { enabled: true, version: '1.0.0', rollout: 80 }
};

/**
 * Security Thresholds and Scoring Configuration
 */
const SECURITY_THRESHOLDS = {
  // SSL/TLS Security
  ssl: {
    minimumScore: 70,
    warningThreshold: 80,
    excellentThreshold: 95,
    weights: {
      protocol: 0.25,
      certificate: 0.25,
      hsts: 0.20,
      mixedContent: 0.15,
      vulnerabilities: 0.15
    }
  },
  
  // Security Headers
  headers: {
    minimumScore: 75,
    warningThreshold: 85,
    excellentThreshold: 95,
    requiredHeaders: 4,
    recommendedHeaders: 6,
    weights: {
      required: 0.6,
      recommended: 0.3,
      validation: 0.1
    }
  },
  
  // Vulnerability Assessment
  vulnerabilities: {
    criticalThreshold: 0,
    highThreshold: 2,
    mediumThreshold: 5,
    lowThreshold: 10,
    riskMultipliers: {
      critical: 10.0,
      high: 5.0,
      medium: 2.0,
      low: 1.0
    }
  },
  
  // Compliance Scoring
  compliance: {
    minimumPassingScore: 70,
    goodScore: 80,
    excellentScore: 90,
    frameworkWeights: {
      OWASP_TOP_10: 0.30,
      NIST_CSF: 0.25,
      ISO_27001: 0.20,
      PCI_DSS: 0.15,
      GDPR: 0.10
    }
  },
  
  // AI Enhancement
  ai: {
    minimumConfidence: 0.7,
    highConfidence: 0.85,
    predictionThreshold: 0.8,
    anomalyThreshold: 0.75,
    learningRate: 0.01
  }
};

/**
 * Performance and Resource Configuration
 */
const PERFORMANCE_CONFIG = {
  // Memory Management
  memory: {
    maxAnalysisSize: 50 * 1024 * 1024, // 50MB
    cacheSize: 100,
    garbageCollectionThreshold: 1000
  },
  
  // Timeout Configuration
  timeouts: {
    sslAnalysis: 30000,      // 30 seconds
    headerAnalysis: 10000,   // 10 seconds
    vulnerabilityScan: 60000, // 60 seconds
    complianceAssessment: 45000, // 45 seconds
    aiEnhancement: 120000    // 2 minutes
  },
  
  // Concurrency Limits
  concurrency: {
    maxConcurrentAnalyses: 5,
    maxDetectorParallelism: 3,
    maxAIRequests: 2
  },
  
  // Rate Limiting
  rateLimits: {
    analysisPerMinute: 60,
    aiRequestsPerMinute: 30,
    complianceChecksPerMinute: 100
  }
};

/**
 * Integration Configuration
 */
const INTEGRATION_CONFIG = {
  // External Security Services
  externalServices: {
    threatIntelligence: {
      enabled: false,
      apiKey: process.env.THREAT_INTEL_API_KEY,
      baseUrl: 'https://api.threatintel.example.com',
      timeout: 30000
    },
    vulnerabilityDatabase: {
      enabled: false,
      apiKey: process.env.VULN_DB_API_KEY,
      baseUrl: 'https://api.vulndb.example.com',
      timeout: 20000
    },
    complianceApi: {
      enabled: false,
      apiKey: process.env.COMPLIANCE_API_KEY,
      baseUrl: 'https://api.compliance.example.com',
      timeout: 25000
    }
  },
  
  // Reporting and Notification
  reporting: {
    enableDetailedReports: true,
    enableSummaryReports: true,
    reportFormats: ['json', 'html'],
    notificationWebhooks: [],
    emailNotifications: false
  },
  
  // Data Storage and Export
  storage: {
    enableResultStorage: false,
    storageProvider: 'local', // local, s3, azure, gcp
    retentionDays: 30,
    encryptResults: true
  }
};

/**
 * Security Configuration Class
 * 
 * Provides centralized configuration management for all security components
 * with environment detection and feature flag support.
 */
export class SecurityConfiguration {
  constructor(options = {}) {
    this.environment = this._detectEnvironment(options.environment);
    this.customConfig = options.config || {};
    this.featureOverrides = options.features || {};
    
    // Merge configurations
    this.config = this._mergeConfigurations();
    
    // Validate configuration
    this._validateConfiguration();
    
    console.log(`🔧 Security Configuration initialized for ${this.environment} environment`);
  }

  /**
   * Get Complete Configuration
   * 
   * @returns {Object} Complete security configuration
   */
  getConfig() {
    return {
      environment: this.environment,
      ...this.config,
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        configSource: 'SecurityConfiguration'
      }
    };
  }

  /**
   * Get Detector Configuration
   * 
   * @param {string} detectorName - Name of the detector
   * @returns {Object} Detector-specific configuration
   */
  getDetectorConfig(detectorName) {
    const baseConfig = {
      enabled: this.isFeatureEnabled(`${detectorName}_detection`),
      environment: this.environment,
      performanceOptimization: this.config.performanceOptimization,
      timeout: this.config.timeouts[`${detectorName}Analysis`] || 30000
    };

    switch (detectorName) {
      case 'ssl':
        return {
          ...baseConfig,
          strictMode: this.config.strictMode,
          checkMixedContent: this.isFeatureEnabled('mixed_content_detection'),
          analyzeCertificateChain: this.isFeatureEnabled('certificate_chain_analysis'),
          thresholds: this.config.thresholds.ssl
        };
      
      case 'headers':
        return {
          ...baseConfig,
          complianceLevel: this.config.complianceLevel,
          analyzeCSP: this.isFeatureEnabled('csp_analysis'),
          validateHeaderValues: this.config.strictMode,
          thresholds: this.config.thresholds.headers
        };
      
      case 'vulnerabilities':
        return {
          ...baseConfig,
          enableXSSDetection: this.isFeatureEnabled('xss_detection'),
          enableSQLInjectionDetection: this.isFeatureEnabled('sql_injection_detection'),
          enableCSRFDetection: this.isFeatureEnabled('csrf_detection'),
          deepScan: this.config.strictMode,
          thresholds: this.config.thresholds.vulnerabilities
        };
      
      default:
        return baseConfig;
    }
  }

  /**
   * Get Heuristic Configuration
   * 
   * @param {string} heuristicName - Name of the heuristic component
   * @returns {Object} Heuristic-specific configuration
   */
  getHeuristicConfig(heuristicName) {
    const baseConfig = {
      enabled: this.isFeatureEnabled(`${heuristicName}_analysis`),
      environment: this.environment,
      strictMode: this.config.strictMode
    };

    switch (heuristicName) {
      case 'risk':
        return {
          ...baseConfig,
          riskModel: this.config.complianceLevel,
          includeBusinessImpact: this.isFeatureEnabled('business_impact_analysis'),
          enableThreatModeling: this.isFeatureEnabled('threat_modeling'),
          industryContext: this.config.industryContext || 'general'
        };
      
      default:
        return baseConfig;
    }
  }

  /**
   * Get Rules Engine Configuration
   * 
   * @returns {Object} Rules engine configuration
   */
  getRulesConfig() {
    return {
      enabled: this.isFeatureEnabled('compliance_assessment'),
      environment: this.environment,
      frameworks: this._getEnabledComplianceFrameworks(),
      complianceLevel: this.config.complianceLevel,
      industryContext: this.config.industryContext || 'general',
      thresholds: this.config.thresholds.compliance,
      includeAuditTrail: this.config.strictMode,
      generateEvidence: this.config.strictMode
    };
  }

  /**
   * Get AI Enhancement Configuration
   * 
   * @returns {Object} AI enhancement configuration
   */
  getAIConfig() {
    return {
      enabled: this.isFeatureEnabled('ai_enhancement'),
      environment: this.environment,
      enableThreatIntelligence: this.isFeatureEnabled('ai_threat_intelligence'),
      enablePredictiveAnalytics: this.isFeatureEnabled('ai_predictive_analytics'),
      enableBehavioralAnalysis: this.isFeatureEnabled('ai_behavioral_analysis'),
      enableAdaptiveLearning: this.isFeatureEnabled('ai_adaptive_learning'),
      aiConfidenceThreshold: this.config.aiConfidenceThreshold,
      thresholds: this.config.thresholds.ai,
      externalServices: this.config.externalServices
    };
  }

  /**
   * Check if Feature is Enabled
   * 
   * @param {string} featureName - Name of the feature
   * @returns {boolean} Whether the feature is enabled
   */
  isFeatureEnabled(featureName) {
    // Check for override
    if (this.featureOverrides.hasOwnProperty(featureName)) {
      return this.featureOverrides[featureName];
    }
    
    // Check feature flag
    const flag = FEATURE_FLAGS[featureName];
    if (!flag) return false;
    
    // Check rollout percentage
    const rolloutCheck = Math.random() * 100 <= flag.rollout;
    
    return flag.enabled && rolloutCheck;
  }

  /**
   * Get Performance Budgets
   * 
   * @returns {Object} Performance budget configuration
   */
  getPerformanceBudgets() {
    return {
      maxAnalysisTime: this.config.timeouts.complianceAssessment,
      maxMemoryUsage: this.config.memory.maxAnalysisSize,
      maxConcurrentOperations: this.config.concurrency.maxConcurrentAnalyses,
      enableOptimizations: this.config.performanceOptimization
    };
  }

  /**
   * Detect Environment
   * 
   * @param {string} envOverride - Environment override
   * @returns {string} Detected environment
   * @private
   */
  _detectEnvironment(envOverride) {
    if (envOverride) return envOverride;
    
    // Check various environment indicators
    const nodeEnv = process.env.NODE_ENV?.toLowerCase();
    if (nodeEnv) {
      if (['development', 'dev'].includes(nodeEnv)) return 'development';
      if (['test', 'testing'].includes(nodeEnv)) return 'testing';
      if (['staging', 'stage'].includes(nodeEnv)) return 'staging';
      if (['production', 'prod'].includes(nodeEnv)) return 'production';
    }
    
    // Default to development
    return 'development';
  }

  /**
   * Merge All Configurations
   * 
   * @returns {Object} Merged configuration
   * @private
   */
  _mergeConfigurations() {
    const envConfig = ENVIRONMENT_CONFIG[this.environment] || ENVIRONMENT_CONFIG.development;
    
    return {
      // Base environment config
      ...envConfig,
      
      // Security thresholds
      thresholds: SECURITY_THRESHOLDS,
      
      // Performance config
      ...PERFORMANCE_CONFIG,
      
      // Integration config
      ...INTEGRATION_CONFIG,
      
      // Custom overrides
      ...this.customConfig
    };
  }

  /**
   * Get Enabled Compliance Frameworks
   * 
   * @returns {Array} List of enabled compliance frameworks
   * @private
   */
  _getEnabledComplianceFrameworks() {
    const frameworks = [];
    
    if (this.isFeatureEnabled('owasp_compliance')) frameworks.push('OWASP_TOP_10');
    if (this.isFeatureEnabled('nist_compliance')) frameworks.push('NIST_CSF');
    if (this.isFeatureEnabled('iso27001_compliance')) frameworks.push('ISO_27001');
    if (this.isFeatureEnabled('pci_dss_compliance')) frameworks.push('PCI_DSS');
    if (this.isFeatureEnabled('gdpr_compliance')) frameworks.push('GDPR');
    
    return frameworks.length > 0 ? frameworks : ['OWASP_TOP_10', 'NIST_CSF'];
  }

  /**
   * Validate Configuration
   * 
   * @private
   */
  _validateConfiguration() {
    const errors = [];
    
    // Validate thresholds
    if (this.config.thresholds.ssl.minimumScore < 0 || this.config.thresholds.ssl.minimumScore > 100) {
      errors.push('SSL minimum score must be between 0 and 100');
    }
    
    // Validate timeouts
    if (this.config.timeouts.sslAnalysis < 1000) {
      errors.push('SSL analysis timeout must be at least 1000ms');
    }
    
    // Validate AI configuration
    if (this.config.aiConfidenceThreshold < 0 || this.config.aiConfidenceThreshold > 1) {
      errors.push('AI confidence threshold must be between 0 and 1');
    }
    
    if (errors.length > 0) {
      console.warn('⚠️ Security Configuration validation warnings:', errors);
    }
  }

  /**
   * Update Feature Flag
   * 
   * @param {string} featureName - Feature name
   * @param {boolean} enabled - Whether to enable the feature
   */
  updateFeatureFlag(featureName, enabled) {
    this.featureOverrides[featureName] = enabled;
    console.log(`🔧 Feature flag updated: ${featureName} = ${enabled}`);
  }

  /**
   * Get Configuration Summary
   * 
   * @returns {Object} Configuration summary for logging/debugging
   */
  getConfigSummary() {
    return {
      environment: this.environment,
      featuresEnabled: Object.keys(FEATURE_FLAGS).filter(flag => this.isFeatureEnabled(flag)),
      complianceFrameworks: this._getEnabledComplianceFrameworks(),
      performanceOptimization: this.config.performanceOptimization,
      strictMode: this.config.strictMode,
      aiEnabled: this.isFeatureEnabled('ai_enhancement')
    };
  }
}

export default SecurityConfiguration;
