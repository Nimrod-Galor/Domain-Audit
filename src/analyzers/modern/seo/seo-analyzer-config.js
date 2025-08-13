/**
 * ============================================================================
 * SEO ANALYZER CONFIGURATION - COMBINED APPROACH PATTERN
 * ============================================================================
 * 
 * Comprehensive configuration for the SEO Analyzer implementation
 * Part of the Combined Approach pattern (8th Implementation)
 * 
 * Features:
 * - Centralized configuration management
 * - Performance optimization settings
 * - Analysis depth and threshold controls
 * - Integration parameters
 * - Caching and monitoring configuration
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration Combined Approach Pattern - Configuration Layer
 */

/**
 * Main SEO Analyzer Configuration
 */
export const SEO_ANALYZER_CONFIG = {
  // ============================================================================
  // CORE ANALYZER SETTINGS
  // ============================================================================
  
  analyzer: {
    name: 'SEOAnalyzer',
    version: '1.0.0',
    type: 'combined_approach_seo',
    description: 'Comprehensive SEO analysis using Combined Approach pattern',
    
    // Analysis modes
    analysisMode: 'comprehensive', // 'basic', 'standard', 'comprehensive', 'enterprise'
    enableAIEnhancement: true,
    enableRulesEngine: true,
    enableCaching: true,
    enablePerformanceMonitoring: true,
    
    // Performance settings
    maxExecutionTime: 30000, // 30 seconds
    memoryLimit: '512MB',
    concurrentOperations: 3,
    cacheSize: 1000,
    cacheTTL: 3600000 // 1 hour
  },

  // ============================================================================
  // DETECTOR CONFIGURATIONS
  // ============================================================================
  
  detectors: {
    metaTag: {
      enabled: true,
      analysisDepth: 'comprehensive',
      socialMediaAnalysis: true,
      technicalValidation: true,
      contentOptimization: true,
      accessibilityCheck: true,
      
      // Meta tag requirements
      titleLengthRange: { min: 30, max: 60 },
      descriptionLengthRange: { min: 120, max: 160 },
      keywordsCountRange: { min: 3, max: 10 },
      
      // Social media optimization
      openGraphValidation: true,
      twitterCardsValidation: true,
      socialImageRequirements: {
        minWidth: 1200,
        minHeight: 630,
        aspectRatio: 1.91
      },
      
      // Performance thresholds
      maxProcessingTime: 5000,
      cacheResults: true
    },

    headingStructure: {
      enabled: true,
      analysisDepth: 'comprehensive',
      semanticValidation: true,
      keywordOptimization: true,
      accessibilityCompliance: true,
      
      // Heading requirements
      h1Requirements: {
        required: true,
        maxCount: 1,
        minLength: 20,
        maxLength: 70
      },
      
      // Hierarchy validation
      hierarchyValidation: true,
      skipLevelPenalty: -20,
      multipleH1Penalty: -30,
      missingH1Penalty: -40,
      
      // Keyword optimization
      keywordInHeadings: true,
      keywordDensityTarget: 0.02,
      semanticKeywords: true,
      
      // Performance settings
      maxProcessingTime: 4000,
      cacheResults: true
    },

    contentElement: {
      enabled: true,
      analysisDepth: 'comprehensive',
      textAnalysis: true,
      mediaOptimization: true,
      readabilityAssessment: true,
      contentStructureAnalysis: true,
      
      // Content requirements
      minContentLength: 300,
      optimalContentLength: { min: 800, max: 2000 },
      maxContentLength: 5000,
      
      // Readability settings
      readabilityTargets: {
        fleschKincaid: { min: 60, max: 80 },
        averageSentenceLength: { min: 12, max: 20 },
        averageWordsPerParagraph: { min: 30, max: 80 }
      },
      
      // Media optimization
      imageOptimization: true,
      videoOptimization: true,
      altTextValidation: true,
      
      // Content-to-code ratio
      minContentCodeRatio: 0.15,
      optimalContentCodeRatio: 0.25,
      
      // Performance settings
      maxProcessingTime: 8000,
      cacheResults: true
    },

    linkStructure: {
      enabled: true,
      analysisDepth: 'comprehensive',
      internalLinkAnalysis: true,
      externalLinkAnalysis: true,
      anchorTextOptimization: true,
      navigationStructureAnalysis: true,
      
      // Link requirements
      minInternalLinks: 2,
      maxInternalLinks: 20,
      maxExternalLinks: 10,
      
      // Anchor text optimization
      anchorTextDiversity: true,
      keywordInAnchorText: true,
      exactMatchPenalty: -10,
      
      // Link quality assessment
      linkQualityFactors: {
        relevance: 0.3,
        authority: 0.25,
        freshness: 0.2,
        diversity: 0.15,
        placement: 0.1
      },
      
      // Navigation analysis
      breadcrumbAnalysis: true,
      navigationDepth: { max: 3, optimal: 2 },
      
      // Performance settings
      maxProcessingTime: 6000,
      cacheResults: true
    },

    structuredData: {
      enabled: true,
      analysisDepth: 'comprehensive',
      jsonLdSupport: true,
      microdataSupport: true,
      rdfaSupport: true,
      schemaValidation: true,
      
      // Schema.org requirements
      requiredSchemas: ['Organization', 'WebPage', 'BreadcrumbList'],
      optionalSchemas: ['Article', 'Product', 'LocalBusiness', 'Review'],
      
      // Rich snippets analysis
      richSnippetsOpportunities: true,
      knowledgeGraphOptimization: true,
      localSEOAnalysis: true,
      
      // Validation settings
      strictValidation: false,
      warningsAsErrors: false,
      customSchemaSupport: true,
      
      // Performance settings
      maxProcessingTime: 5000,
      cacheResults: true
    }
  },

  // ============================================================================
  // HEURISTICS CONFIGURATIONS
  // ============================================================================
  
  heuristics: {
    technical: {
      enabled: true,
      analysisScope: 'comprehensive',
      performanceAnalysis: true,
      mobileFriendliness: true,
      coreWebVitals: true,
      technicalSEOAudit: true,
      
      // Performance thresholds
      performanceTargets: {
        loadTime: 3000, // 3 seconds
        firstContentfulPaint: 1800,
        largestContentfulPaint: 2500,
        cumulativeLayoutShift: 0.1,
        firstInputDelay: 100
      },
      
      // Mobile optimization
      mobileOptimization: {
        viewportMeta: true,
        responsiveDesign: true,
        touchTargets: true,
        mobileFriendlyFonts: true
      },
      
      // Technical requirements
      httpsRequired: true,
      canonicalURLs: true,
      robotsTxtAnalysis: true,
      xmlSitemapCheck: true,
      
      // Processing settings
      maxProcessingTime: 7000,
      cacheResults: true
    },

    keyword: {
      enabled: true,
      analysisScope: 'comprehensive',
      keywordDensityAnalysis: true,
      semanticKeywordAnalysis: true,
      keywordDistributionAnalysis: true,
      competitorKeywordAnalysis: false, // Requires external API
      
      // Keyword density settings
      keywordDensity: {
        target: { min: 0.005, max: 0.03 }, // 0.5% to 3%
        primary: { min: 0.01, max: 0.025 },
        secondary: { min: 0.005, max: 0.015 },
        overOptimizationThreshold: 0.04
      },
      
      // Semantic analysis
      semanticKeywords: true,
      relatedKeywords: true,
      keywordVariations: true,
      synonymDetection: true,
      
      // Distribution analysis
      keywordPlacement: {
        title: { weight: 0.25, required: true },
        h1: { weight: 0.2, required: true },
        h2h3: { weight: 0.15, recommended: true },
        firstParagraph: { weight: 0.15, recommended: true },
        bodyContent: { weight: 0.15, required: true },
        metaDescription: { weight: 0.1, recommended: true }
      },
      
      // Processing settings
      maxProcessingTime: 6000,
      cacheResults: true
    },

    contentQuality: {
      enabled: true,
      analysisScope: 'comprehensive',
      eatAnalysis: true, // Expertise, Authoritativeness, Trustworthiness
      topicRelevanceAnalysis: true,
      freshnessAnalysis: true,
      engagementAnalysis: true,
      
      // Content quality thresholds
      qualityThresholds: {
        minWordsForAnalysis: 100,
        optimalWordCount: { min: 300, max: 2000 },
        maxWordCount: 3000,
        readabilityTarget: 70,
        topicFocusTarget: 0.15,
        freshnessPeriod: 365 // days
      },
      
      // E-A-T analysis
      eatFactors: {
        expertise: { weight: 0.35, indicators: ['author', 'expert', 'credentials'] },
        authoritativeness: { weight: 0.35, indicators: ['citations', 'references', 'data'] },
        trustworthiness: { weight: 0.3, indicators: ['contact', 'privacy', 'secure'] }
      },
      
      // Content freshness
      freshnessIndicators: [
        'updated', 'latest', 'new', 'recent', 'current', 'revised'
      ],
      
      // Processing settings
      maxProcessingTime: 8000,
      cacheResults: true
    }
  },

  // ============================================================================
  // RULES ENGINE CONFIGURATION
  // ============================================================================
  
  rulesEngine: {
    enabled: true,
    ruleProcessingMode: 'comprehensive',
    enableCustomRules: true,
    ruleConflictResolution: 'priority_based',
    
    // Rule categories
    categories: {
      critical: { weight: 0.4, threshold: 80 },
      important: { weight: 0.3, threshold: 70 },
      recommended: { weight: 0.2, threshold: 60 },
      optional: { weight: 0.1, threshold: 50 }
    },
    
    // Rule processing
    maxRuleExecutionTime: 5000,
    parallelRuleExecution: true,
    maxConcurrentRules: 5,
    
    // Custom rules support
    customRulesPath: './custom-rules/',
    enableRuleUpdates: true,
    ruleVersioning: true,
    
    // Scoring configuration
    scoringMethod: 'weighted_average',
    minimumPassingScore: 70,
    penaltyMultiplier: 1.5,
    bonusMultiplier: 1.2
  },

  // ============================================================================
  // AI ENHANCEMENT CONFIGURATION
  // ============================================================================
  
  aiEnhancement: {
    enabled: true,
    provider: 'internal', // 'openai', 'claude', 'internal'
    enhancementLevel: 'standard', // 'basic', 'standard', 'advanced'
    
    // AI processing settings
    maxTokens: 4000,
    temperature: 0.3,
    confidenceThreshold: 0.7,
    fallbackToHeuristics: true,
    
    // Enhancement areas
    enhancementAreas: {
      contentAnalysis: true,
      keywordSuggestions: true,
      technicalRecommendations: true,
      competitiveInsights: false, // Requires external data
      trendAnalysis: false // Requires historical data
    },
    
    // Processing limits
    maxProcessingTime: 10000,
    rateLimitPerHour: 100,
    cacheAIResults: true,
    aiCacheTTL: 7200000 // 2 hours
  },

  // ============================================================================
  // PERFORMANCE MONITORING
  // ============================================================================
  
  monitoring: {
    enabled: true,
    collectMetrics: true,
    performanceTracking: true,
    errorTracking: true,
    
    // Metrics collection
    metrics: {
      executionTime: true,
      memoryUsage: true,
      cacheHitRate: true,
      errorRate: true,
      throughput: true
    },
    
    // Performance thresholds
    performanceThresholds: {
      totalExecutionTime: 30000, // 30 seconds
      detectorExecutionTime: 8000, // 8 seconds per detector
      heuristicExecutionTime: 10000, // 10 seconds per heuristic
      memoryUsage: 536870912, // 512MB
      cacheHitRateTarget: 0.8 // 80%
    },
    
    // Alerting
    alerting: {
      enabled: false, // Disabled for now
      thresholdViolations: true,
      errorRateThreshold: 0.05,
      performanceDegradation: true
    }
  },

  // ============================================================================
  // INTEGRATION SETTINGS
  // ============================================================================
  
  integration: {
    // Legacy system integration
    legacyCompatibility: true,
    legacyFormatSupport: true,
    gradualMigration: true,
    
    // API integration
    externalAPIs: {
      enabled: false, // Disabled for standalone operation
      googlePageSpeed: false,
      searchConsole: false,
      semrush: false,
      ahrefs: false
    },
    
    // Data export/import
    dataExport: {
      formats: ['json', 'csv', 'pdf'],
      includeRawData: true,
      includeRecommendations: true,
      includeMetrics: true
    },
    
    // Batch processing
    batchProcessing: {
      enabled: true,
      maxBatchSize: 10,
      concurrentBatches: 2,
      batchTimeout: 300000 // 5 minutes
    }
  },

  // ============================================================================
  // OUTPUT CONFIGURATION
  // ============================================================================
  
  output: {
    format: 'comprehensive', // 'minimal', 'standard', 'comprehensive', 'detailed'
    includeMetadata: true,
    includePerformanceMetrics: true,
    includeRecommendations: true,
    includePriorities: true,
    
    // Report sections
    sections: {
      executiveSummary: true,
      detailedAnalysis: true,
      technicalFindings: true,
      contentAssessment: true,
      recommendations: true,
      actionItems: true,
      performanceMetrics: true
    },
    
    // Scoring display
    scoring: {
      overallScore: true,
      componentScores: true,
      gradeSystem: true,
      percentageScores: true,
      categoryBreakdown: true
    },
    
    // Visualization
    visualization: {
      charts: false, // Requires additional libraries
      graphs: false,
      progressBars: true,
      scoreCards: true
    }
  }
};

/**
 * Detector-specific configurations for easy access
 */
export const DETECTOR_CONFIGS = {
  META_TAG: SEO_ANALYZER_CONFIG.detectors.metaTag,
  HEADING_STRUCTURE: SEO_ANALYZER_CONFIG.detectors.headingStructure,
  CONTENT_ELEMENT: SEO_ANALYZER_CONFIG.detectors.contentElement,
  LINK_STRUCTURE: SEO_ANALYZER_CONFIG.detectors.linkStructure,
  STRUCTURED_DATA: SEO_ANALYZER_CONFIG.detectors.structuredData
};

/**
 * Heuristics-specific configurations for easy access
 */
export const HEURISTICS_CONFIGS = {
  TECHNICAL: SEO_ANALYZER_CONFIG.heuristics.technical,
  KEYWORD: SEO_ANALYZER_CONFIG.heuristics.keyword,
  CONTENT_QUALITY: SEO_ANALYZER_CONFIG.heuristics.contentQuality
};

/**
 * Performance monitoring configuration
 */
export const MONITORING_CONFIG = SEO_ANALYZER_CONFIG.monitoring;

/**
 * AI enhancement configuration
 */
export const AI_CONFIG = SEO_ANALYZER_CONFIG.aiEnhancement;

/**
 * Configuration validation schema
 */
export const CONFIG_SCHEMA = {
  required: ['analyzer', 'detectors', 'heuristics', 'rulesEngine'],
  properties: {
    analyzer: {
      required: ['name', 'version', 'type'],
      properties: {
        analysisMode: { enum: ['basic', 'standard', 'comprehensive', 'enterprise'] },
        enableAIEnhancement: { type: 'boolean' },
        enableRulesEngine: { type: 'boolean' },
        enableCaching: { type: 'boolean' }
      }
    },
    detectors: {
      required: ['metaTag', 'headingStructure', 'contentElement', 'linkStructure', 'structuredData'],
      additionalProperties: false
    },
    heuristics: {
      required: ['technical', 'keyword', 'contentQuality'],
      additionalProperties: false
    }
  }
};

/**
 * Default configuration for minimal setup
 */
export const MINIMAL_CONFIG = {
  analyzer: {
    analysisMode: 'basic',
    enableAIEnhancement: false,
    enableRulesEngine: true,
    enableCaching: false
  },
  detectors: {
    metaTag: { enabled: true, analysisDepth: 'basic' },
    headingStructure: { enabled: true, analysisDepth: 'basic' },
    contentElement: { enabled: true, analysisDepth: 'basic' },
    linkStructure: { enabled: true, analysisDepth: 'basic' },
    structuredData: { enabled: false }
  },
  heuristics: {
    technical: { enabled: true, analysisScope: 'basic' },
    keyword: { enabled: true, analysisScope: 'basic' },
    contentQuality: { enabled: false }
  }
};

/**
 * Validate configuration object
 * @param {Object} config - Configuration to validate
 * @returns {Object} Validation result
 */
export function validateConfig(config) {
  const errors = [];
  const warnings = [];
  
  // Check required sections
  if (!config.analyzer) errors.push('Missing analyzer configuration');
  if (!config.detectors) errors.push('Missing detectors configuration');
  if (!config.heuristics) errors.push('Missing heuristics configuration');
  
  // Check detector enablement
  const enabledDetectors = Object.values(config.detectors || {})
    .filter(detector => detector.enabled).length;
  
  if (enabledDetectors === 0) {
    errors.push('At least one detector must be enabled');
  }
  
  // Check performance settings
  if (config.analyzer?.maxExecutionTime && config.analyzer.maxExecutionTime < 5000) {
    warnings.push('Very low max execution time may cause incomplete analysis');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    enabledDetectors,
    enabledHeuristics: Object.values(config.heuristics || {})
      .filter(heuristic => heuristic.enabled).length
  };
}

/**
 * Get configuration for specific analysis mode
 * @param {string} mode - Analysis mode ('basic', 'standard', 'comprehensive', 'enterprise')
 * @returns {Object} Mode-specific configuration
 */
export function getConfigForMode(mode = 'comprehensive') {
  const config = JSON.parse(JSON.stringify(SEO_ANALYZER_CONFIG)); // Deep clone
  
  switch (mode) {
    case 'basic':
      // Disable advanced features
      config.analyzer.enableAIEnhancement = false;
      config.analyzer.enableCaching = false;
      Object.values(config.detectors).forEach(detector => {
        detector.analysisDepth = 'basic';
      });
      break;
      
    case 'standard':
      // Moderate feature set
      config.analyzer.enableAIEnhancement = false;
      Object.values(config.detectors).forEach(detector => {
        detector.analysisDepth = 'standard';
      });
      break;
      
    case 'enterprise':
      // Enable all features with extended timeouts
      config.analyzer.maxExecutionTime = 60000; // 1 minute
      config.analyzer.concurrentOperations = 5;
      Object.values(config.detectors).forEach(detector => {
        detector.maxProcessingTime *= 2;
      });
      break;
      
    default: // comprehensive
      // Use default comprehensive configuration
      break;
  }
  
  return config;
}

export default SEO_ANALYZER_CONFIG;
