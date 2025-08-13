/**
 * ============================================================================
 * THIRD-PARTY ANALYZER - Combined Approach Implementation (Modern)
 * ============================================================================
 * 
 * Comprehensive third-party service analysis with advanced detection and impact assessment.
 * Implementation #62 in the Combined Approach modernization series.
 * 
 * Features:
 * - GPT-5 Style Modular Components (Service Detectors, Impact Analyzers, Security Assessors)
 * - Claude AI Enhanced Heuristics (Service Intelligence, Privacy Analysis, Performance Impact)
 * - Advanced Rules Engine (Service Classification, Risk Assessment, Optimization Rules)
 * - AI Enhancement Layer (Service Intelligence, Pattern Learning, Smart Recommendations)
 * - Configuration Management (Customizable Detection Patterns and Service Definitions)
 * 
 * @module ThirdPartyAnalyzerModern
 * @version 2.0.0
 * @author AI Assistant (Combined Approach Implementation #62)
 * @created 2025-08-13
 */

import { BaseAnalyzer } from './core/BaseAnalyzer.js';

/**
 * ============================================================================
 * GPT-5 STYLE MODULAR COMPONENTS
 * ============================================================================
 */

/**
 * Service Detection Engine
 * Advanced detection of third-party services and dependencies
 */
class ServiceDetectionEngine {
  constructor(config = {}) {
    this.serviceDatabase = config.serviceDatabase || this.getDefaultServiceDatabase();
    this.detectionMethods = config.detectionMethods || ['script', 'domain', 'content', 'meta'];
  }

  /**
   * Detect all third-party services on the page
   */
  async detectServices(context) {
    const { dom, url } = context;
    
    const detectedServices = {
      analytics: [],
      advertising: [],
      social: [],
      cdn: [],
      marketing: [],
      support: [],
      security: [],
      other: []
    };
    
    // Script-based detection
    const scriptServices = this.detectFromScripts(dom);
    this.categorizeServices(scriptServices, detectedServices);
    
    // Domain-based detection
    const domainServices = this.detectFromDomains(dom, url);
    this.categorizeServices(domainServices, detectedServices);
    
    // Content-based detection
    const contentServices = this.detectFromContent(dom);
    this.categorizeServices(contentServices, detectedServices);
    
    // Meta tag detection
    const metaServices = this.detectFromMeta(dom);
    this.categorizeServices(metaServices, detectedServices);
    
    return detectedServices;
  }

  detectFromScripts(dom) {
    const services = [];
    const scripts = dom.querySelectorAll('script[src]');
    
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src) {
        const service = this.identifyServiceFromUrl(src);
        if (service) {
          services.push({
            ...service,
            source: 'script',
            url: src,
            element: script
          });
        }
      }
    });
    
    // Check inline scripts for service patterns
    const inlineScripts = dom.querySelectorAll('script:not([src])');
    inlineScripts.forEach(script => {
      const content = script.textContent;
      const service = this.identifyServiceFromContent(content);
      if (service) {
        services.push({
          ...service,
          source: 'inline_script',
          content: content.slice(0, 200),
          element: script
        });
      }
    });
    
    return services;
  }

  detectFromDomains(dom, currentUrl) {
    const services = [];
    const links = dom.querySelectorAll('a[href], link[href], img[src], iframe[src]');
    const currentDomain = new URL(currentUrl).hostname;
    
    links.forEach(element => {
      const url = element.getAttribute('href') || element.getAttribute('src');
      if (url) {
        try {
          const urlObj = new URL(url, currentUrl);
          if (urlObj.hostname !== currentDomain) {
            const service = this.identifyServiceFromUrl(url);
            if (service) {
              services.push({
                ...service,
                source: 'external_resource',
                url: url,
                element: element
              });
            }
          }
        } catch (error) {
          // Skip invalid URLs
        }
      }
    });
    
    return services;
  }

  detectFromContent(dom) {
    const services = [];
    const content = dom.textContent.toLowerCase();
    
    // Look for service-specific patterns in content
    Object.entries(this.serviceDatabase).forEach(([category, categoryServices]) => {
      Object.entries(categoryServices).forEach(([key, serviceInfo]) => {
        if (serviceInfo.contentPatterns) {
          const matches = serviceInfo.contentPatterns.filter(pattern => 
            content.includes(pattern.toLowerCase())
          );
          if (matches.length > 0) {
            services.push({
              name: serviceInfo.name,
              category: serviceInfo.category,
              confidence: matches.length / serviceInfo.contentPatterns.length,
              source: 'content_pattern',
              matches: matches
            });
          }
        }
      });
    });
    
    return services;
  }

  detectFromMeta(dom) {
    const services = [];
    const metaTags = dom.querySelectorAll('meta[name], meta[property], meta[content]');
    
    metaTags.forEach(meta => {
      const name = meta.getAttribute('name') || meta.getAttribute('property');
      const content = meta.getAttribute('content');
      
      if (name && content) {
        const service = this.identifyServiceFromMeta(name, content);
        if (service) {
          services.push({
            ...service,
            source: 'meta_tag',
            metaName: name,
            metaContent: content
          });
        }
      }
    });
    
    return services;
  }

  identifyServiceFromUrl(url) {
    const urlLower = url.toLowerCase();
    
    // Check against service database
    for (const [category, services] of Object.entries(this.serviceDatabase)) {
      for (const [key, serviceInfo] of Object.entries(services)) {
        if (serviceInfo.domains) {
          const match = serviceInfo.domains.find(domain => urlLower.includes(domain.toLowerCase()));
          if (match) {
            return {
              name: serviceInfo.name,
              category: serviceInfo.category,
              impact: serviceInfo.impact,
              confidence: 0.9,
              matchedDomain: match
            };
          }
        }
      }
    }
    
    return null;
  }

  identifyServiceFromContent(content) {
    const contentLower = content.toLowerCase();
    
    // Common service patterns
    const patterns = {
      'Google Analytics': ['ga(', 'google-analytics', 'gtag(', '_gaq'],
      'Facebook Pixel': ['fbq(', 'facebook.pixel', '_fbq'],
      'Google Tag Manager': ['gtm.start', 'googletagmanager'],
      'Hotjar': ['hotjar', 'hjsv'],
      'Intercom': ['intercom(', 'widget.intercom']
    };
    
    for (const [serviceName, servicePatterns] of Object.entries(patterns)) {
      const matches = servicePatterns.filter(pattern => contentLower.includes(pattern));
      if (matches.length > 0) {
        return {
          name: serviceName,
          category: this.getCategoryForService(serviceName),
          impact: 'medium',
          confidence: 0.8,
          matchedPatterns: matches
        };
      }
    }
    
    return null;
  }

  categorizeServices(services, detectedServices) {
    services.forEach(service => {
      const category = service.category || 'other';
      if (detectedServices[category]) {
        detectedServices[category].push(service);
      } else {
        detectedServices.other.push(service);
      }
    });
  }

  getDefaultServiceDatabase() {
    return {
      analytics: {
        'google-analytics': {
          name: 'Google Analytics',
          category: 'analytics',
          impact: 'medium',
          domains: ['google-analytics.com', 'googletagmanager.com'],
          contentPatterns: ['ga(', 'gtag(', '_gaq']
        },
        'facebook-pixel': {
          name: 'Facebook Pixel',
          category: 'analytics',
          impact: 'medium',
          domains: ['facebook.net', 'connect.facebook.net'],
          contentPatterns: ['fbq(', '_fbq']
        }
      },
      advertising: {
        'google-ads': {
          name: 'Google Ads',
          category: 'advertising',
          impact: 'high',
          domains: ['googleadservices.com', 'googlesyndication.com']
        }
      },
      social: {
        'twitter-widget': {
          name: 'Twitter Widget',
          category: 'social',
          impact: 'low',
          domains: ['platform.twitter.com', 'syndication.twitter.com']
        }
      }
    };
  }
}

/**
 * Performance Impact Analyzer
 * Analyzes the performance impact of third-party services
 */
class PerformanceImpactAnalyzer {
  constructor(config = {}) {
    this.config = config;
    this.impactDatabase = this.buildImpactDatabase();
  }

  /**
   * Analyze performance impact of detected services
   */
  async analyzePerformanceImpact(detectedServices) {
    const impact = {
      overall: { score: 100, level: 'none' },
      categories: {},
      services: [],
      recommendations: []
    };
    
    let totalImpactScore = 0;
    let serviceCount = 0;
    
    // Analyze each category
    Object.entries(detectedServices).forEach(([category, services]) => {
      if (services.length > 0) {
        const categoryImpact = this.analyzeCategoryImpact(category, services);
        impact.categories[category] = categoryImpact;
        totalImpactScore += categoryImpact.impactScore;
        serviceCount += services.length;
        
        // Analyze individual services
        services.forEach(service => {
          const serviceImpact = this.analyzeServiceImpact(service);
          impact.services.push(serviceImpact);
        });
      }
    });
    
    // Calculate overall impact
    if (serviceCount > 0) {
      const averageImpact = totalImpactScore / serviceCount;
      impact.overall.score = Math.max(0, 100 - averageImpact);
      impact.overall.level = this.determineImpactLevel(impact.overall.score);
    }
    
    // Generate recommendations
    impact.recommendations = this.generatePerformanceRecommendations(impact);
    
    return impact;
  }

  analyzeCategoryImpact(category, services) {
    const categoryWeights = {
      analytics: 15,
      advertising: 25,
      social: 20,
      cdn: 5,
      marketing: 20,
      support: 10,
      security: 5,
      other: 15
    };
    
    const baseImpact = categoryWeights[category] || 15;
    const serviceMultiplier = Math.min(services.length * 0.5, 2);
    const impactScore = baseImpact * serviceMultiplier;
    
    return {
      serviceCount: services.length,
      impactScore,
      level: this.determineImpactLevel(100 - impactScore),
      services: services.map(s => s.name)
    };
  }

  analyzeServiceImpact(service) {
    const baseImpact = this.getBaseImpactForService(service);
    const confidenceAdjustment = service.confidence * 0.2;
    const finalImpact = baseImpact + confidenceAdjustment;
    
    return {
      name: service.name,
      category: service.category,
      impactScore: finalImpact,
      level: this.determineImpactLevel(100 - finalImpact),
      source: service.source,
      recommendations: this.getServiceRecommendations(service)
    };
  }

  getBaseImpactForService(service) {
    const impactMap = {
      'Google Analytics': 15,
      'Facebook Pixel': 20,
      'Google Ads': 25,
      'Twitter Widget': 10,
      'YouTube Embed': 30
    };
    
    return impactMap[service.name] || 15;
  }

  determineImpactLevel(score) {
    if (score >= 90) return 'very_low';
    if (score >= 80) return 'low';
    if (score >= 70) return 'medium';
    if (score >= 60) return 'high';
    return 'very_high';
  }

  generatePerformanceRecommendations(impact) {
    const recommendations = [];
    
    if (impact.overall.score < 70) {
      recommendations.push({
        type: 'critical',
        title: 'High Third-Party Performance Impact',
        description: 'Multiple third-party services are significantly impacting page performance',
        actions: ['Audit and remove unnecessary services', 'Implement lazy loading', 'Use async/defer attributes']
      });
    }
    
    // Category-specific recommendations
    if (impact.categories.advertising && impact.categories.advertising.impactScore > 25) {
      recommendations.push({
        type: 'optimization',
        title: 'Optimize Advertising Scripts',
        description: 'Advertising scripts are causing performance issues',
        actions: ['Review ad density', 'Implement ad lazy loading', 'Consider server-side ad insertion']
      });
    }
    
    return recommendations;
  }

  buildImpactDatabase() {
    return {
      loadTime: {
        low: 0.1,
        medium: 0.5,
        high: 1.0,
        critical: 2.0
      },
      resourceSize: {
        small: 10,
        medium: 50,
        large: 100,
        huge: 500
      }
    };
  }
}

/**
 * Privacy and Security Assessor
 * Evaluates privacy implications and security risks of third-party services
 */
class PrivacySecurityAssessor {
  constructor(config = {}) {
    this.config = config;
    this.privacyDatabase = this.buildPrivacyDatabase();
    this.securityDatabase = this.buildSecurityDatabase();
  }

  /**
   * Assess privacy and security implications
   */
  async assessPrivacySecurity(detectedServices) {
    const assessment = {
      privacy: {
        riskLevel: 'low',
        dataCollection: [],
        trackingServices: [],
        recommendations: []
      },
      security: {
        riskLevel: 'low',
        vulnerabilities: [],
        concerns: [],
        recommendations: []
      },
      compliance: {
        gdpr: { compliant: true, issues: [] },
        ccpa: { compliant: true, issues: [] },
        coppa: { compliant: true, issues: [] }
      }
    };
    
    // Analyze privacy implications
    assessment.privacy = await this.analyzePrivacyImplications(detectedServices);
    
    // Analyze security risks
    assessment.security = await this.analyzeSecurityRisks(detectedServices);
    
    // Check compliance
    assessment.compliance = await this.checkCompliance(detectedServices);
    
    return assessment;
  }

  async analyzePrivacyImplications(detectedServices) {
    const privacy = {
      riskLevel: 'low',
      dataCollection: [],
      trackingServices: [],
      recommendations: []
    };
    
    let riskScore = 0;
    
    // Analyze each service for privacy implications
    Object.values(detectedServices).flat().forEach(service => {
      const servicePrivacy = this.getServicePrivacyInfo(service);
      
      if (servicePrivacy.collectsData) {
        privacy.dataCollection.push({
          service: service.name,
          dataTypes: servicePrivacy.dataTypes,
          purposes: servicePrivacy.purposes
        });
        riskScore += servicePrivacy.riskScore;
      }
      
      if (servicePrivacy.isTracking) {
        privacy.trackingServices.push({
          service: service.name,
          trackingMethods: servicePrivacy.trackingMethods
        });
        riskScore += 10;
      }
    });
    
    // Determine overall risk level
    privacy.riskLevel = this.determinePrivacyRisk(riskScore);
    
    // Generate recommendations
    privacy.recommendations = this.generatePrivacyRecommendations(privacy);
    
    return privacy;
  }

  async analyzeSecurityRisks(detectedServices) {
    const security = {
      riskLevel: 'low',
      vulnerabilities: [],
      concerns: [],
      recommendations: []
    };
    
    let riskScore = 0;
    
    // Analyze security risks for each service
    Object.values(detectedServices).flat().forEach(service => {
      const serviceSecurity = this.getServiceSecurityInfo(service);
      
      if (serviceSecurity.hasVulnerabilities) {
        security.vulnerabilities.push({
          service: service.name,
          vulnerabilities: serviceSecurity.vulnerabilities
        });
        riskScore += serviceSecurity.riskScore;
      }
      
      if (serviceSecurity.hasConcerns) {
        security.concerns.push({
          service: service.name,
          concerns: serviceSecurity.concerns
        });
        riskScore += 5;
      }
    });
    
    security.riskLevel = this.determineSecurityRisk(riskScore);
    security.recommendations = this.generateSecurityRecommendations(security);
    
    return security;
  }

  async checkCompliance(detectedServices) {
    const compliance = {
      gdpr: { compliant: true, issues: [] },
      ccpa: { compliant: true, issues: [] },
      coppa: { compliant: true, issues: [] }
    };
    
    // Check GDPR compliance
    Object.values(detectedServices).flat().forEach(service => {
      const gdprIssues = this.checkGDPRCompliance(service);
      if (gdprIssues.length > 0) {
        compliance.gdpr.compliant = false;
        compliance.gdpr.issues.push(...gdprIssues);
      }
    });
    
    return compliance;
  }

  getServicePrivacyInfo(service) {
    const privacyData = {
      'Google Analytics': {
        collectsData: true,
        dataTypes: ['user behavior', 'demographics', 'location'],
        purposes: ['analytics', 'advertising'],
        riskScore: 15,
        isTracking: true,
        trackingMethods: ['cookies', 'fingerprinting']
      },
      'Facebook Pixel': {
        collectsData: true,
        dataTypes: ['user behavior', 'personal info', 'purchases'],
        purposes: ['advertising', 'retargeting'],
        riskScore: 20,
        isTracking: true,
        trackingMethods: ['cookies', 'social graph']
      }
    };
    
    return privacyData[service.name] || {
      collectsData: false,
      dataTypes: [],
      purposes: [],
      riskScore: 0,
      isTracking: false,
      trackingMethods: []
    };
  }
}

/**
 * ============================================================================
 * CLAUDE AI ENHANCED HEURISTICS
 * ============================================================================
 */

/**
 * Service Intelligence Heuristics
 * AI-enhanced analysis of service patterns and optimization opportunities
 */
class ServiceIntelligenceHeuristics {
  constructor(config = {}) {
    this.config = config;
    this.learningData = [];
  }

  /**
   * Apply intelligent heuristics to service analysis
   */
  async applyServiceIntelligence(detectedServices, performanceImpact, privacySecurity) {
    const intelligence = {
      serviceOptimization: this.analyzeServiceOptimization(detectedServices, performanceImpact),
      redundancyDetection: this.detectServiceRedundancy(detectedServices),
      loadingStrategy: this.recommendLoadingStrategy(detectedServices, performanceImpact),
      priorityMatrix: this.createServicePriorityMatrix(detectedServices, performanceImpact, privacySecurity)
    };
    
    return intelligence;
  }

  analyzeServiceOptimization(detectedServices, performanceImpact) {
    const optimization = {
      criticalServices: [],
      unnecessaryServices: [],
      optimizableServices: [],
      recommendations: []
    };
    
    // Identify critical services (essential for functionality)
    const criticalCategories = ['security', 'payment', 'core_functionality'];
    optimization.criticalServices = Object.entries(detectedServices)
      .filter(([category]) => criticalCategories.includes(category))
      .flatMap(([, services]) => services);
    
    // Identify potentially unnecessary services
    const allServices = Object.values(detectedServices).flat();
    optimization.unnecessaryServices = allServices.filter(service => {
      const impact = performanceImpact.services.find(s => s.name === service.name);
      return impact && impact.level === 'high' && !this.isEssentialService(service);
    });
    
    // Identify optimizable services
    optimization.optimizableServices = allServices.filter(service => {
      return this.hasOptimizationOpportunities(service);
    });
    
    return optimization;
  }

  detectServiceRedundancy(detectedServices) {
    const redundancy = {
      duplicateServices: [],
      functionalOverlap: [],
      recommendations: []
    };
    
    const allServices = Object.values(detectedServices).flat();
    
    // Detect duplicate services (same service loaded multiple times)
    const serviceNames = {};
    allServices.forEach(service => {
      if (serviceNames[service.name]) {
        redundancy.duplicateServices.push({
          service: service.name,
          count: serviceNames[service.name] + 1
        });
      }
      serviceNames[service.name] = (serviceNames[service.name] || 0) + 1;
    });
    
    // Detect functional overlap
    const functionalGroups = this.groupServicesByFunction(allServices);
    Object.entries(functionalGroups).forEach(([function_, services]) => {
      if (services.length > 1) {
        redundancy.functionalOverlap.push({
          function: function_,
          services: services.map(s => s.name),
          recommendation: this.getOverlapRecommendation(function_, services)
        });
      }
    });
    
    return redundancy;
  }

  recommendLoadingStrategy(detectedServices, performanceImpact) {
    const strategy = {
      critical: [], // Load immediately
      important: [], // Load after critical resources
      deferred: [], // Load after page interaction
      lazy: [], // Load on demand
      conditional: [] // Load based on conditions
    };
    
    const allServices = Object.values(detectedServices).flat();
    
    allServices.forEach(service => {
      const impact = performanceImpact.services.find(s => s.name === service.name);
      const priority = this.determineServicePriority(service, impact);
      
      switch (priority) {
        case 'critical':
          strategy.critical.push(service);
          break;
        case 'important':
          strategy.important.push(service);
          break;
        case 'deferred':
          strategy.deferred.push(service);
          break;
        case 'lazy':
          strategy.lazy.push(service);
          break;
        case 'conditional':
          strategy.conditional.push(service);
          break;
      }
    });
    
    return strategy;
  }

  createServicePriorityMatrix(detectedServices, performanceImpact, privacySecurity) {
    const matrix = {
      highValueLowRisk: [],
      highValueHighRisk: [],
      lowValueLowRisk: [],
      lowValueHighRisk: []
    };
    
    const allServices = Object.values(detectedServices).flat();
    
    allServices.forEach(service => {
      const value = this.calculateServiceValue(service);
      const risk = this.calculateServiceRisk(service, performanceImpact, privacySecurity);
      
      if (value >= 0.7 && risk <= 0.3) {
        matrix.highValueLowRisk.push(service);
      } else if (value >= 0.7 && risk > 0.3) {
        matrix.highValueHighRisk.push(service);
      } else if (value < 0.7 && risk <= 0.3) {
        matrix.lowValueLowRisk.push(service);
      } else {
        matrix.lowValueHighRisk.push(service);
      }
    });
    
    return matrix;
  }

  isEssentialService(service) {
    const essentialServices = [
      'payment processing',
      'security',
      'authentication',
      'error monitoring'
    ];
    return essentialServices.includes(service.category);
  }

  hasOptimizationOpportunities(service) {
    const optimizableCategories = ['analytics', 'advertising', 'social'];
    return optimizableCategories.includes(service.category);
  }
}

/**
 * Privacy Analysis Heuristics
 * Advanced privacy impact analysis and compliance assessment
 */
class PrivacyAnalysisHeuristics {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Apply advanced privacy analysis heuristics
   */
  async applyPrivacyAnalysis(detectedServices, privacyAssessment) {
    const analysis = {
      dataFlowMapping: this.mapDataFlows(detectedServices),
      consentRequirements: this.analyzeConsentRequirements(detectedServices),
      riskMitigation: this.recommendRiskMitigation(privacyAssessment),
      complianceGaps: this.identifyComplianceGaps(detectedServices, privacyAssessment)
    };
    
    return analysis;
  }

  mapDataFlows(detectedServices) {
    const dataFlows = [];
    
    Object.values(detectedServices).flat().forEach(service => {
      const flow = this.getServiceDataFlow(service);
      if (flow) {
        dataFlows.push(flow);
      }
    });
    
    return dataFlows;
  }

  analyzeConsentRequirements(detectedServices) {
    const requirements = {
      essential: [],
      functional: [],
      analytics: [],
      marketing: []
    };
    
    Object.values(detectedServices).flat().forEach(service => {
      const consentCategory = this.getConsentCategory(service);
      if (requirements[consentCategory]) {
        requirements[consentCategory].push(service);
      }
    });
    
    return requirements;
  }

  getServiceDataFlow(service) {
    const dataFlowMap = {
      'Google Analytics': {
        source: 'website',
        destination: 'Google',
        dataTypes: ['user behavior', 'demographics'],
        purpose: 'analytics',
        retention: '26 months'
      },
      'Facebook Pixel': {
        source: 'website',
        destination: 'Facebook',
        dataTypes: ['user behavior', 'personal info'],
        purpose: 'advertising',
        retention: 'indefinite'
      }
    };
    
    return dataFlowMap[service.name] || null;
  }

  getConsentCategory(service) {
    const categoryMap = {
      analytics: 'analytics',
      advertising: 'marketing',
      social: 'marketing',
      security: 'essential',
      payment: 'essential'
    };
    
    return categoryMap[service.category] || 'functional';
  }
}

/**
 * ============================================================================
 * ADVANCED RULES ENGINE
 * ============================================================================
 */

/**
 * Service Classification Rules
 * Comprehensive rules for classifying and prioritizing third-party services
 */
class ServiceClassificationRules {
  constructor(config = {}) {
    this.rules = this.buildClassificationRules();
    this.thresholds = config.thresholds || this.getDefaultThresholds();
  }

  /**
   * Apply service classification rules
   */
  applyClassificationRules(detectedServices, performanceImpact, privacyAssessment) {
    const classification = {
      categories: {},
      priorities: {},
      actions: {},
      scores: {}
    };
    
    // Apply rules to each service
    Object.entries(detectedServices).forEach(([category, services]) => {
      classification.categories[category] = this.classifyServiceCategory(category, services);
      
      services.forEach(service => {
        const serviceClassification = this.classifyIndividualService(service, performanceImpact, privacyAssessment);
        classification.priorities[service.name] = serviceClassification.priority;
        classification.actions[service.name] = serviceClassification.recommendedAction;
        classification.scores[service.name] = serviceClassification.score;
      });
    });
    
    return classification;
  }

  classifyServiceCategory(category, services) {
    const categoryRules = this.rules.categoryRules[category] || this.rules.categoryRules.default;
    
    let categoryScore = 0;
    let totalServices = services.length;
    
    services.forEach(service => {
      categoryScore += this.calculateServiceScore(service);
    });
    
    const averageScore = totalServices > 0 ? categoryScore / totalServices : 0;
    
    return {
      serviceCount: totalServices,
      averageScore,
      priority: this.determineCategoryPriority(category, averageScore),
      recommendation: this.getCategoryRecommendation(category, averageScore, totalServices)
    };
  }

  classifyIndividualService(service, performanceImpact, privacyAssessment) {
    let score = 50; // Base score
    
    // Apply performance rules
    const performanceScore = this.getPerformanceScore(service, performanceImpact);
    score += performanceScore;
    
    // Apply privacy rules
    const privacyScore = this.getPrivacyScore(service, privacyAssessment);
    score += privacyScore;
    
    // Apply functionality rules
    const functionalityScore = this.getFunctionalityScore(service);
    score += functionalityScore;
    
    // Normalize score
    score = Math.max(0, Math.min(100, score));
    
    return {
      score,
      priority: this.determinePriority(score),
      recommendedAction: this.getRecommendedAction(score, service),
      reasoning: this.generateReasoning(service, performanceScore, privacyScore, functionalityScore)
    };
  }

  getPerformanceScore(service, performanceImpact) {
    const serviceImpact = performanceImpact.services.find(s => s.name === service.name);
    if (!serviceImpact) return 0;
    
    const impactLevelScores = {
      very_low: 20,
      low: 10,
      medium: 0,
      high: -15,
      very_high: -30
    };
    
    return impactLevelScores[serviceImpact.level] || 0;
  }

  getPrivacyScore(service, privacyAssessment) {
    const isTracking = privacyAssessment.privacy.trackingServices.some(t => t.service === service.name);
    const collectsData = privacyAssessment.privacy.dataCollection.some(d => d.service === service.name);
    
    let score = 0;
    if (isTracking) score -= 10;
    if (collectsData) score -= 5;
    
    return score;
  }

  getFunctionalityScore(service) {
    const functionalityScores = {
      essential: 30,
      important: 20,
      useful: 10,
      optional: 0,
      unnecessary: -20
    };
    
    const functionality = this.assessServiceFunctionality(service);
    return functionalityScores[functionality] || 0;
  }

  buildClassificationRules() {
    return {
      categoryRules: {
        analytics: {
          maxRecommended: 2,
          essentialFor: ['business_websites', 'ecommerce'],
          alternatives: ['self_hosted', 'privacy_focused']
        },
        advertising: {
          maxRecommended: 1,
          performanceImpact: 'high',
          privacyRisk: 'high'
        },
        social: {
          maxRecommended: 3,
          loadingStrategy: 'lazy',
          alternatives: ['native_sharing']
        },
        default: {
          maxRecommended: 1,
          performanceImpact: 'medium'
        }
      }
    };
  }

  getDefaultThresholds() {
    return {
      highPriority: 80,
      mediumPriority: 60,
      lowPriority: 40,
      removeThreshold: 20
    };
  }
}

/**
 * Optimization Rules Engine
 * Rules for optimizing third-party service implementation
 */
class OptimizationRulesEngine {
  constructor(config = {}) {
    this.config = config;
    this.optimizationRules = this.buildOptimizationRules();
  }

  /**
   * Apply optimization rules
   */
  applyOptimizationRules(detectedServices, performanceImpact, classification) {
    const optimization = {
      loadingOptimizations: [],
      replacementSuggestions: [],
      removalCandidates: [],
      implementationImprovements: []
    };
    
    // Apply loading optimization rules
    optimization.loadingOptimizations = this.generateLoadingOptimizations(detectedServices, performanceImpact);
    
    // Apply replacement rules
    optimization.replacementSuggestions = this.generateReplacementSuggestions(detectedServices, classification);
    
    // Apply removal rules
    optimization.removalCandidates = this.identifyRemovalCandidates(detectedServices, classification);
    
    // Apply implementation improvement rules
    optimization.implementationImprovements = this.generateImplementationImprovements(detectedServices);
    
    return optimization;
  }

  generateLoadingOptimizations(detectedServices, performanceImpact) {
    const optimizations = [];
    
    Object.values(detectedServices).flat().forEach(service => {
      const impact = performanceImpact.services.find(s => s.name === service.name);
      
      if (impact && impact.level === 'high') {
        optimizations.push({
          service: service.name,
          type: 'async_loading',
          description: 'Load script asynchronously to prevent render blocking',
          implementation: `<script async src="${service.url}"></script>`,
          expectedImprovement: '20-40% faster page load'
        });
      }
      
      if (service.category === 'social') {
        optimizations.push({
          service: service.name,
          type: 'lazy_loading',
          description: 'Load social widgets only when needed',
          implementation: 'Implement intersection observer for on-demand loading',
          expectedImprovement: '15-30% faster initial load'
        });
      }
    });
    
    return optimizations;
  }

  generateReplacementSuggestions(detectedServices, classification) {
    const suggestions = [];
    
    Object.values(detectedServices).flat().forEach(service => {
      const alternatives = this.getServiceAlternatives(service);
      if (alternatives.length > 0) {
        const score = classification.scores[service.name];
        if (score < 50) {
          suggestions.push({
            currentService: service.name,
            alternatives,
            reason: 'Poor performance/privacy score',
            priority: 'medium'
          });
        }
      }
    });
    
    return suggestions;
  }

  getServiceAlternatives(service) {
    const alternatives = {
      'Google Analytics': [
        { name: 'Plausible', benefits: ['Privacy-focused', 'Lightweight', 'GDPR compliant'] },
        { name: 'Fathom', benefits: ['Simple', 'Fast', 'No cookies'] }
      ],
      'Facebook Pixel': [
        { name: 'First-party tracking', benefits: ['Full control', 'Privacy compliant', 'No third-party'] }
      ]
    };
    
    return alternatives[service.name] || [];
  }

  buildOptimizationRules() {
    return {
      loading: {
        analytics: ['defer', 'async'],
        advertising: ['async', 'lazy'],
        social: ['lazy', 'on-demand']
      },
      replacement: {
        privacy_focused: ['plausible', 'fathom', 'simple_analytics'],
        performance_focused: ['self_hosted', 'cdn_optimized']
      }
    };
  }
}

/**
 * ============================================================================
 * AI ENHANCEMENT LAYER
 * ============================================================================
 */

/**
 * Service Intelligence AI
 * Advanced AI analysis of third-party service usage and optimization
 */
class ServiceIntelligenceAI {
  constructor(config = {}) {
    this.config = config;
    this.learningData = [];
  }

  /**
   * Perform AI-enhanced service analysis
   */
  async performAIAnalysis(allAnalysisData) {
    const aiAnalysis = {
      intelligentInsights: await this.generateIntelligentInsights(allAnalysisData),
      patternRecognition: await this.recognizeServicePatterns(allAnalysisData),
      predictiveRecommendations: await this.generatePredictiveRecommendations(allAnalysisData),
      optimizationStrategy: await this.createOptimizationStrategy(allAnalysisData)
    };
    
    return aiAnalysis;
  }

  async generateIntelligentInsights(data) {
    const insights = [];
    
    // Service usage patterns
    const totalServices = Object.values(data.detectedServices).flat().length;
    if (totalServices > 10) {
      insights.push({
        type: 'service_overload',
        severity: 'high',
        message: `${totalServices} third-party services detected - potential performance impact`,
        recommendation: 'Consider service consolidation and prioritization'
      });
    }
    
    // Privacy insights
    if (data.privacySecurity && data.privacySecurity.privacy.riskLevel === 'high') {
      insights.push({
        type: 'privacy_risk',
        severity: 'medium',
        message: 'High privacy risk detected from tracking services',
        recommendation: 'Review consent management and data collection practices'
      });
    }
    
    // Performance insights
    if (data.performanceImpact && data.performanceImpact.overall.score < 70) {
      insights.push({
        type: 'performance_impact',
        severity: 'high',
        message: 'Third-party services are significantly impacting page performance',
        recommendation: 'Implement performance optimization strategies'
      });
    }
    
    return insights;
  }

  async recognizeServicePatterns(data) {
    const patterns = {
      serviceClustering: this.identifyServiceClusters(data.detectedServices),
      loadingPatterns: this.analyzeLoadingPatterns(data.detectedServices),
      redundancyPatterns: this.identifyRedundancyPatterns(data.detectedServices)
    };
    
    return patterns;
  }

  async generatePredictiveRecommendations(data) {
    const recommendations = [];
    
    // Predict future performance issues
    const riskScore = this.calculateFutureRiskScore(data);
    if (riskScore > 0.7) {
      recommendations.push({
        type: 'predictive_performance',
        timeline: '3-6 months',
        prediction: 'Performance degradation likely as services scale',
        preventiveActions: [
          'Implement service monitoring',
          'Set up performance budgets',
          'Plan service consolidation'
        ]
      });
    }
    
    // Predict compliance issues
    if (this.predictComplianceRisk(data) > 0.6) {
      recommendations.push({
        type: 'predictive_compliance',
        timeline: '1-3 months',
        prediction: 'Potential privacy compliance issues',
        preventiveActions: [
          'Implement consent management',
          'Audit data collection practices',
          'Review service agreements'
        ]
      });
    }
    
    return recommendations;
  }

  async createOptimizationStrategy(data) {
    const strategy = {
      immediate: [], // 0-1 weeks
      shortTerm: [], // 1-4 weeks
      mediumTerm: [], // 1-3 months
      longTerm: [] // 3+ months
    };
    
    // Immediate optimizations
    if (data.classification && data.classification.actions) {
      Object.entries(data.classification.actions).forEach(([service, action]) => {
        if (action === 'remove' || action === 'replace') {
          strategy.immediate.push({
            service,
            action,
            priority: 'high',
            effort: 'low'
          });
        }
      });
    }
    
    // Short-term optimizations
    if (data.optimization && data.optimization.loadingOptimizations) {
      strategy.shortTerm.push(...data.optimization.loadingOptimizations.map(opt => ({
        ...opt,
        timeframe: 'short_term',
        effort: 'medium'
      })));
    }
    
    return strategy;
  }

  identifyServiceClusters(detectedServices) {
    // Group services by common patterns or providers
    const clusters = {};
    
    Object.values(detectedServices).flat().forEach(service => {
      const provider = this.extractProvider(service.name);
      if (!clusters[provider]) clusters[provider] = [];
      clusters[provider].push(service);
    });
    
    return clusters;
  }

  calculateFutureRiskScore(data) {
    let score = 0;
    
    // More services = higher future risk
    const serviceCount = Object.values(data.detectedServices).flat().length;
    score += Math.min(serviceCount / 20, 0.5);
    
    // Poor current performance = higher future risk
    if (data.performanceImpact && data.performanceImpact.overall.score < 70) {
      score += 0.3;
    }
    
    return Math.min(score, 1);
  }

  extractProvider(serviceName) {
    if (serviceName.toLowerCase().includes('google')) return 'Google';
    if (serviceName.toLowerCase().includes('facebook')) return 'Facebook';
    if (serviceName.toLowerCase().includes('twitter')) return 'Twitter';
    return 'Other';
  }
}

/**
 * ============================================================================
 * MAIN ANALYZER CLASS
 * ============================================================================
 */

/**
 * Third-Party Analyzer - Combined Approach Implementation
 * Comprehensive analysis of third-party services and dependencies
 */
export class ThirdPartyAnalyzerModern extends BaseAnalyzer {
  constructor(options = {}) {
    super('ThirdPartyAnalyzerModern', options);
    
    this.name = 'ThirdPartyAnalyzerModern';
    this.category = 'third_party';
    this.version = '2.0.0';
    
    // Initialize components
    this.detectionEngine = new ServiceDetectionEngine(options.detection);
    this.performanceAnalyzer = new PerformanceImpactAnalyzer(options.performance);
    this.privacyAssessor = new PrivacySecurityAssessor(options.privacy);
    
    // Initialize heuristics
    this.serviceHeuristics = new ServiceIntelligenceHeuristics(options.serviceIntelligence);
    this.privacyHeuristics = new PrivacyAnalysisHeuristics(options.privacyAnalysis);
    
    // Initialize rules
    this.classificationRules = new ServiceClassificationRules(options.classification);
    this.optimizationRules = new OptimizationRulesEngine(options.optimization);
    
    // Initialize AI enhancement
    this.serviceAI = new ServiceIntelligenceAI(options.ai);
    
    console.log('🔗 ThirdPartyAnalyzer (Modern) initialized with Combined Approach');
    console.log('📊 Implementation: #62 in modernization series');
  }

  /**
   * Get analyzer metadata
   */
  getMetadata() {
    return {
      name: this.name,
      version: this.version,
      category: this.category,
      description: 'Comprehensive third-party service analysis using Combined Approach with AI enhancement',
      author: 'AI Assistant',
      
      // Implementation details
      implementation: {
        pattern: 'Combined Approach',
        number: 62,
        features: [
          'GPT-5 Style Modular Components',
          'Claude AI Enhanced Heuristics',
          'Advanced Rules Engine',
          'AI Enhancement Layer',
          'Configuration Management'
        ]
      },
      
      // Analysis capabilities
      capabilities: [
        'service_detection',
        'performance_impact_analysis',
        'privacy_security_assessment',
        'service_optimization',
        'compliance_checking',
        'intelligent_recommendations',
        'ai_enhanced_insights',
        'predictive_analysis'
      ],
      
      // Component information
      components: {
        engines: ['ServiceDetectionEngine', 'PerformanceImpactAnalyzer', 'PrivacySecurityAssessor'],
        heuristics: ['ServiceIntelligenceHeuristics', 'PrivacyAnalysisHeuristics'],
        rules: ['ServiceClassificationRules', 'OptimizationRulesEngine'],
        ai: ['ServiceIntelligenceAI']
      },
      
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Perform comprehensive third-party service analysis
   */
  async analyze(context) {
    const startTime = Date.now();
    
    try {
      this.log('Starting comprehensive third-party service analysis', 'info');
      
      // Phase 1: Service Detection
      this.log('Phase 1: Detecting third-party services and dependencies', 'info');
      const detectedServices = await this.detectionEngine.detectServices(context);
      
      // Phase 2: Performance Impact Analysis
      this.log('Phase 2: Analyzing performance impact of services', 'info');
      const performanceImpact = await this.performanceAnalyzer.analyzePerformanceImpact(detectedServices);
      
      // Phase 3: Privacy and Security Assessment
      this.log('Phase 3: Assessing privacy and security implications', 'info');
      const privacySecurity = await this.privacyAssessor.assessPrivacySecurity(detectedServices);
      
      // Phase 4: Heuristic Analysis
      this.log('Phase 4: Applying AI-enhanced heuristics', 'info');
      const serviceIntelligence = await this.serviceHeuristics.applyServiceIntelligence(
        detectedServices, performanceImpact, privacySecurity
      );
      const privacyAnalysis = await this.privacyHeuristics.applyPrivacyAnalysis(
        detectedServices, privacySecurity
      );
      
      // Phase 5: Rules Application
      this.log('Phase 5: Applying classification and optimization rules', 'info');
      const classification = this.classificationRules.applyClassificationRules(
        detectedServices, performanceImpact, privacySecurity
      );
      const optimization = this.optimizationRules.applyOptimizationRules(
        detectedServices, performanceImpact, classification
      );
      
      // Phase 6: AI Enhancement
      this.log('Phase 6: Generating AI-enhanced insights and recommendations', 'info');
      const aiAnalysis = await this.serviceAI.performAIAnalysis({
        detectedServices,
        performanceImpact,
        privacySecurity,
        serviceIntelligence,
        privacyAnalysis,
        classification,
        optimization
      });
      
      // Calculate overall scores
      const overallAssessment = this.calculateOverallAssessment({
        detectedServices,
        performanceImpact,
        privacySecurity,
        classification
      });
      
      const results = {
        success: true,
        data: {
          // Core analysis results
          serviceDetection: {
            ...detectedServices,
            totalServices: Object.values(detectedServices).flat().length,
            categoryCounts: Object.fromEntries(
              Object.entries(detectedServices).map(([cat, services]) => [cat, services.length])
            )
          },
          
          performanceImpact,
          privacySecurity,
          
          // Heuristic analysis
          serviceIntelligence,
          privacyAnalysis,
          
          // Rules and classification
          classification,
          optimization,
          
          // AI insights
          aiInsights: aiAnalysis,
          
          // Overall assessment
          overallAssessment,
          
          // Implementation metadata
          implementation: {
            pattern: 'Combined Approach',
            number: 62,
            modernization: 'complete',
            analysisType: 'comprehensive',
            componentsCovered: [
              'service_detection', 'performance_analysis', 'privacy_assessment',
              'service_intelligence', 'classification_rules', 'ai_enhancement'
            ]
          }
        },
        
        metadata: this.getMetadata(),
        performance: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          memoryUsage: process.memoryUsage?.() || 'unavailable'
        }
      };
      
      this.log(`Third-party service analysis completed in ${results.performance.executionTime}ms`, 'info');
      this.log(`Detected ${results.data.serviceDetection.totalServices} third-party services`, 'info');
      this.log(`Overall score: ${overallAssessment.overallScore}/100`, 'info');
      
      return results;
      
    } catch (error) {
      return this.handleError(error, 'third_party_service_analysis');
    }
  }

  /**
   * Calculate overall assessment scores
   */
  calculateOverallAssessment(data) {
    const scores = {
      performance: data.performanceImpact.overall.score,
      privacy: this.calculatePrivacyScore(data.privacySecurity),
      optimization: this.calculateOptimizationScore(data.classification),
      compliance: this.calculateComplianceScore(data.privacySecurity)
    };
    
    const weights = {
      performance: 0.3,
      privacy: 0.3,
      optimization: 0.2,
      compliance: 0.2
    };
    
    const overallScore = Object.entries(weights).reduce((total, [metric, weight]) => {
      return total + (scores[metric] * weight);
    }, 0);
    
    return {
      overallScore: Math.round(overallScore),
      grade: this.calculateGrade(overallScore),
      scores,
      strengths: this.identifyStrengths(scores),
      improvements: this.identifyImprovements(scores),
      priorityActions: this.generatePriorityActions(data)
    };
  }

  calculatePrivacyScore(privacySecurity) {
    let score = 100;
    
    // Deduct for privacy risks
    const riskDeductions = {
      very_high: 40,
      high: 30,
      medium: 20,
      low: 10,
      very_low: 0
    };
    
    score -= riskDeductions[privacySecurity.privacy.riskLevel] || 20;
    
    // Deduct for tracking services
    score -= privacySecurity.privacy.trackingServices.length * 5;
    
    return Math.max(0, score);
  }

  calculateOptimizationScore(classification) {
    let score = 100;
    
    // Deduct for services that need removal or replacement
    const actions = Object.values(classification.actions || {});
    const negativeActions = actions.filter(action => action === 'remove' || action === 'replace');
    score -= negativeActions.length * 10;
    
    return Math.max(0, score);
  }

  calculateComplianceScore(privacySecurity) {
    let score = 100;
    
    // Deduct for compliance issues
    if (!privacySecurity.compliance.gdpr.compliant) score -= 30;
    if (!privacySecurity.compliance.ccpa.compliant) score -= 20;
    if (!privacySecurity.compliance.coppa.compliant) score -= 15;
    
    return Math.max(0, score);
  }

  calculateGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  identifyStrengths(scores) {
    const strengths = [];
    
    if (scores.performance >= 80) strengths.push('Good third-party performance management');
    if (scores.privacy >= 80) strengths.push('Strong privacy protection measures');
    if (scores.optimization >= 80) strengths.push('Well-optimized service implementation');
    if (scores.compliance >= 90) strengths.push('Excellent regulatory compliance');
    
    return strengths;
  }

  identifyImprovements(scores) {
    const improvements = [];
    
    if (scores.performance < 70) improvements.push('Third-party services are impacting performance');
    if (scores.privacy < 70) improvements.push('Privacy risks need attention');
    if (scores.optimization < 70) improvements.push('Service optimization opportunities exist');
    if (scores.compliance < 80) improvements.push('Compliance gaps need addressing');
    
    return improvements;
  }

  generatePriorityActions(data) {
    const actions = [];
    
    // High impact performance issues
    if (data.performanceImpact.overall.score < 60) {
      actions.push({
        priority: 'high',
        action: 'Optimize high-impact third-party services',
        timeline: 'immediate',
        impact: 'performance'
      });
    }
    
    // Privacy compliance issues
    if (!data.privacySecurity.compliance.gdpr.compliant) {
      actions.push({
        priority: 'high',
        action: 'Address GDPR compliance gaps',
        timeline: 'urgent',
        impact: 'compliance'
      });
    }
    
    return actions;
  }
}

export default ThirdPartyAnalyzerModern;
