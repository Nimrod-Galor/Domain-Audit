/**
 * ============================================================================
 * ENHANCED EXTRACTORS INTEGRATION MODULE
 * ============================================================================
 * 
 * This module integrates medium-priority features including:
 * - Core Web Vitals analysis
 * - Advanced accessibility analysis
 * - Content quality analysis
 * - Enhanced performance metrics
 * 
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @version 1.0.0
 */

import { WebVitalsAnalyzer } from '../performance/web-vitals-analyzer.js';
import { AdvancedAccessibilityAnalyzer } from './advanced-accessibility-analyzer.js';
import { ContentQualityAnalyzer } from '../analyzers/content-quality-analyzer.js';
import { ThirdPartyAnalyzer } from '../analyzers/third-party-analyzer.js';
import { ResourceAnalyzer } from '../analyzers/performance/ResourceAnalyzer.js';
import { PageTypeClassifier } from '../analyzers/page-type-classifier.js';
import { CDNDetector } from '../analyzers/cdn-detector.js';
import { AdvancedLinkAnalyzer } from '../analyzers/advanced-link-analyzer.js';
import { LinkDepthCalculator } from '../analyzers/link-depth-calculator.js';
import { OrphanedPagesDetector } from '../analyzers/orphaned-pages-detector.js';
import { ContentIntelligenceAnalyzer } from '../analyzers/content-intelligence-analyzer.js';
import { BusinessAnalyticsAnalyzer } from '../analyzers/business-analytics-analyzer.js';
import { SSLCertificateAnalyzer } from '../analyzers/ssl-certificate-analyzer.js';
import { AIIntegrationManager } from '../ai/ai-integration-manager.js';
import { SocialMediaAnalyzer } from '../analyzers/social-media/social-media-analyzer.js';
import { EcommerceAnalyzer } from '../analyzers/ecommerce/ecommerce-analyzer.js';
import { BusinessIntelligenceAnalyzer } from '../analyzers/business-intelligence/business-analyzer-minimal.js';

/**
 * Enhanced Extractors Integration Class
 */
export class EnhancedExtractorsIntegration {
  constructor(options = {}) {
    this.config = {
      enableWebVitals: options.enableWebVitals !== false,
      enableAdvancedA11y: options.enableAdvancedA11y !== false,
      enableContentQuality: options.enableContentQuality !== false,
      enableThirdPartyAnalysis: options.enableThirdPartyAnalysis !== false,
      enableResourceAnalysis: options.enableResourceAnalysis !== false,
      enablePageClassification: options.enablePageClassification !== false,
      enableCDNDetection: options.enableCDNDetection !== false,
      enableAdvancedLinkAnalysis: options.enableAdvancedLinkAnalysis !== false,
      enableDepthAnalysis: options.enableDepthAnalysis !== false,
      enableOrphanDetection: options.enableOrphanDetection !== false,
      enableContentIntelligence: options.enableContentIntelligence !== false,
      enableBusinessAnalytics: options.enableBusinessAnalytics !== false,
      enableBusinessIntelligence: options.enableBusinessIntelligence !== false,
      enableSSLCertificateAnalysis: options.enableSSLCertificateAnalysis !== false,
      enableSocialMediaAnalysis: options.enableSocialMediaAnalysis !== false,
      enableEcommerceAnalysis: options.enableEcommerceAnalysis !== false,
      
      // 🤖 AI INTELLIGENCE FEATURES - Next-Gen AI Capabilities
      enableAIIntegration: options.enableAIIntegration !== false,
      enablePredictiveAnalytics: options.enablePredictiveAnalytics !== false,
      enableRealtimeIntelligence: options.enableRealtimeIntelligence !== false,
      enableAIOptimization: options.enableAIOptimization !== false,
      
      wcagLevel: options.wcagLevel || 'AA',
      siteData: options.siteData || {},
      ...options
    };

    // Initialize analyzers
    this.webVitalsAnalyzer = new WebVitalsAnalyzer(options);
    this.advancedA11yAnalyzer = new AdvancedAccessibilityAnalyzer(options);
    this.contentQualityAnalyzer = new ContentQualityAnalyzer(options);
    this.thirdPartyAnalyzer = new ThirdPartyAnalyzer(options);
    this.resourceAnalyzer = new ResourceAnalyzer(options);
    this.pageTypeClassifier = new PageTypeClassifier(options);
    this.cdnDetector = new CDNDetector(options);
    
    // Initialize critical missing features
    this.advancedLinkAnalyzer = new AdvancedLinkAnalyzer({
      ...options,
      siteUrl: options.siteUrl || '',
      brandTerms: options.brandTerms || [],
      targetKeywords: options.targetKeywords || []
    });
    
    // Initialize remaining coverage analyzers
    this.contentIntelligenceAnalyzer = new ContentIntelligenceAnalyzer(options);
    this.businessAnalyticsAnalyzer = new BusinessAnalyticsAnalyzer(options);
    this.businessIntelligenceAnalyzer = new BusinessIntelligenceAnalyzer(options);
    this.sslCertificateAnalyzer = new SSLCertificateAnalyzer(options);
    this.socialMediaAnalyzer = new SocialMediaAnalyzer(options);
    this.ecommerceAnalyzer = new EcommerceAnalyzer(options);
    
    // 🤖 Initialize AI Integration Manager
    this.aiIntegrationManager = this.config.enableAIIntegration 
      ? new AIIntegrationManager({
          enablePredictiveAnalytics: this.config.enablePredictiveAnalytics,
          enableRealtimeIntelligence: this.config.enableRealtimeIntelligence,
          enableAIOptimization: this.config.enableAIOptimization,
          ...options
        })
      : null;
    
    // Initialize site-wide analyzers (require siteData)
    if (options.siteData && Object.keys(options.siteData).length > 0) {
      this.linkDepthCalculator = new LinkDepthCalculator(options.siteData);
      this.orphanedPagesDetector = new OrphanedPagesDetector(options.siteData);
    } else {
      this.linkDepthCalculator = null;
      this.orphanedPagesDetector = null;
    }
  }

  /**
   * Extract enhanced performance data including Core Web Vitals
   * @param {Object} dom - JSDOM document object
   * @param {Object} pageData - Existing page data
   * @param {number} responseTime - Response time in milliseconds
   * @param {number} pageSize - Page size in bytes
   * @param {string} rawHTML - Raw HTML content
   * @returns {Object} Enhanced performance analysis
   */
  extractEnhancedPerformance(dom, pageData, responseTime, pageSize, rawHTML = '') {
    const analysis = {
      coreWebVitals: null,
      enhancedMetrics: null,
      performanceInsights: null,
      timestamp: new Date().toISOString()
    };

    try {
      if (this.config.enableWebVitals) {
        analysis.coreWebVitals = this.webVitalsAnalyzer.analyzeWebVitals(
          pageData, 
          responseTime, 
          pageSize
        );
      }

      // Enhanced performance metrics
      analysis.enhancedMetrics = this._calculateEnhancedMetrics(
        pageData, 
        responseTime, 
        pageSize, 
        rawHTML
      );

      // Performance insights and recommendations
      analysis.performanceInsights = this._generatePerformanceInsights(
        analysis.coreWebVitals,
        analysis.enhancedMetrics,
        pageData
      );

    } catch (error) {
      analysis.error = `Enhanced performance analysis failed: ${error.message}`;
    }

    return analysis;
  }

  /**
   * Extract advanced accessibility data
   * @param {Object} dom - JSDOM document object
   * @param {Object} existingA11yData - Basic accessibility data
   * @returns {Object} Advanced accessibility analysis
   */
  extractAdvancedAccessibility(dom, existingA11yData = {}) {
    if (!this.config.enableAdvancedA11y) {
      return { disabled: true, message: 'Advanced accessibility analysis disabled' };
    }

    try {
      const advancedA11y = this.advancedA11yAnalyzer.analyzeAdvancedAccessibility(
        dom, 
        existingA11yData
      );

      // Combine with existing accessibility data
      return {
        ...existingA11yData,
        advanced: advancedA11y,
        combinedScore: this._combineAccessibilityScores(existingA11yData, advancedA11y),
        comprehensiveRecommendations: this._combineAccessibilityRecommendations(
          existingA11yData, 
          advancedA11y
        )
      };

    } catch (error) {
      return {
        error: `Advanced accessibility analysis failed: ${error.message}`,
        basic: existingA11yData
      };
    }
  }

  /**
   * Extract content quality data
   * @param {Object} dom - JSDOM document object
   * @param {Object} pageData - Existing page data
   * @param {string} rawHTML - Raw HTML content
   * @returns {Object} Content quality analysis
   */
  extractContentQuality(dom, pageData, rawHTML = '') {
    if (!this.config.enableContentQuality) {
      return { disabled: true, message: 'Content quality analysis disabled' };
    }

    try {
      return this.contentQualityAnalyzer.analyzeContentQuality(dom, pageData, rawHTML);
    } catch (error) {
      return {
        error: `Content quality analysis failed: ${error.message}`
      };
    }
  }

  /**
   * Extract third-party services analysis
   * @param {Object} dom - JSDOM document object
   * @param {string} url - Page URL
   * @returns {Object} Third-party services analysis
   */
  extractThirdPartyAnalysis(dom, url = '') {
    if (!this.config.enableThirdPartyAnalysis) {
      return { disabled: true, message: 'Third-party analysis disabled' };
    }

    try {
      return this.thirdPartyAnalyzer.analyzeThirdPartyServices(dom, url);
    } catch (error) {
      return {
        error: `Third-party analysis failed: ${error.message}`
      };
    }
  }

  /**
   * Extract resource loading analysis
   * @param {Object} dom - JSDOM document object
   * @param {Object} pageData - Existing page data
   * @returns {Object} Resource loading analysis
   */
  extractResourceAnalysis(dom, pageData = {}) {
    if (!this.config.enableResourceAnalysis) {
      return { disabled: true, message: 'Resource analysis disabled' };
    }

    try {
      return this.resourceAnalyzer.analyzeResourceLoading(dom, pageData);
    } catch (error) {
      return {
        error: `Resource analysis failed: ${error.message}`
      };
    }
  }

  /**
   * Extract page type classification
   * @param {Object} dom - JSDOM document object
   * @param {string} url - Page URL
   * @returns {Object} Page classification results
   */
  extractPageClassification(dom, url = '') {
    if (!this.config.enablePageClassification) {
      return { disabled: true, message: 'Page classification disabled' };
    }

    try {
      return this.pageTypeClassifier.classifyPage(dom, url);
    } catch (error) {
      return {
        error: `Page classification failed: ${error.message}`
      };
    }
  }

  /**
   * Extract CDN and external services detection
   * @param {Object} dom - JSDOM document object
   * @param {string} url - Page URL
   * @returns {Object} CDN and external services analysis
   */
  extractCDNAnalysis(dom, url = '') {
    if (!this.config.enableCDNDetection) {
      return { disabled: true, message: 'CDN detection disabled' };
    }

    try {
      return this.cdnDetector.detectExternalServices(dom, url);
    } catch (error) {
      return {
        error: `CDN detection failed: ${error.message}`
      };
    }
  }

  /**
   * Extract all enhanced data in one call
   * @param {Object} dom - JSDOM document object
   * @param {Object} pageData - Existing page data
   * @param {number} responseTime - Response time in milliseconds
   * @param {number} pageSize - Page size in bytes
   * @param {string} rawHTML - Raw HTML content
   * @param {string} url - Page URL
   * @returns {Object} Complete enhanced analysis
   */
  async extractAllEnhancedData(dom, pageData, responseTime, pageSize, rawHTML = '', url = '') {
    const analysis = {
      enhancedPerformance: null,
      advancedAccessibility: null,
      contentQuality: null,
      thirdPartyAnalysis: null,
      resourceAnalysis: null,
      pageClassification: null,
      cdnAnalysis: null,
      
      // Critical Missing Features - Advanced Link Analysis
      advancedLinkAnalysis: null,
      linkDepthAnalysis: null,
      orphanAnalysis: null,
      
      // Final Coverage Features - Remaining 2%
      contentIntelligence: null,
      businessAnalytics: null,
      
      // � PHASE 3: Business Intelligence Module  
      businessIntelligence: null,
      
      // �🎯 PHASE 1: Enhanced Social Media Optimization
      socialMediaAnalysis: null,
      
      // 🛒 PHASE 2: E-commerce Analysis Module
      ecommerceAnalysis: null,
      
      // 🤖 AI Intelligence Features - Next-Gen AI Capabilities
      aiIntelligence: null,
      
      overallEnhancedScore: 0,
      analysisMetadata: {
        timestamp: new Date().toISOString(),
        enabledFeatures: {
          webVitals: this.config.enableWebVitals,
          advancedA11y: this.config.enableAdvancedA11y,
          contentQuality: this.config.enableContentQuality,
          thirdPartyAnalysis: this.config.enableThirdPartyAnalysis,
          resourceAnalysis: this.config.enableResourceAnalysis,
          pageClassification: this.config.enablePageClassification,
          cdnDetection: this.config.enableCDNDetection,
          
          // Critical features (previous implementation)
          advancedLinkAnalysis: this.config.enableAdvancedLinkAnalysis,
          depthAnalysis: this.config.enableDepthAnalysis,
          orphanDetection: this.config.enableOrphanDetection,
          
          // Final coverage features
          contentIntelligence: this.config.enableContentIntelligence,
          businessAnalytics: this.config.enableBusinessAnalytics,
          
          // Phase 3: Business Intelligence Module
          businessIntelligence: this.config.enableBusinessIntelligence,
          
          // Phase 1: Enhanced Social Media Optimization
          socialMediaAnalysis: this.config.enableSocialMediaAnalysis,
          
          // Phase 2: E-commerce Analysis Module
          ecommerceAnalysis: this.config.enableEcommerceAnalysis
        },
        version: '1.0.0'
      }
    };

    // Extract enhanced performance data
    if (this.config.enableWebVitals) {
      analysis.enhancedPerformance = this.extractEnhancedPerformance(
        dom, pageData, responseTime, pageSize, rawHTML
      );
    }

    // Extract advanced accessibility data
    if (this.config.enableAdvancedA11y) {
      analysis.advancedAccessibility = this.extractAdvancedAccessibility(
        dom, pageData.accessibility || {}
      );
    }

    // Extract content quality data
    if (this.config.enableContentQuality) {
      analysis.contentQuality = this.extractContentQuality(dom, pageData, rawHTML);
    }

    // Extract third-party services analysis
    if (this.config.enableThirdPartyAnalysis) {
      analysis.thirdPartyAnalysis = this.extractThirdPartyAnalysis(dom, url);
    }

    // Extract resource loading analysis
    if (this.config.enableResourceAnalysis) {
      analysis.resourceAnalysis = this.extractResourceAnalysis(dom, pageData);
    }

    // Extract page classification
    if (this.config.enablePageClassification) {
      analysis.pageClassification = this.extractPageClassification(dom, url);
    }

    // Extract CDN and external services analysis
    if (this.config.enableCDNDetection) {
      analysis.cdnAnalysis = this.extractCDNAnalysis(dom, url);
    }

    // 🎯 CRITICAL MISSING FEATURES - Advanced Link Analysis
    if (this.config.enableAdvancedLinkAnalysis) {
      analysis.advancedLinkAnalysis = this.extractAdvancedLinkAnalysis(dom, url);
    }

    // Extract link depth analysis (requires site-wide data)
    if (this.config.enableDepthAnalysis && this.linkDepthCalculator) {
      analysis.linkDepthAnalysis = this.extractLinkDepthAnalysis(url);
    }

    // Extract orphan page analysis (requires site-wide data)
    if (this.config.enableOrphanDetection && this.orphanedPagesDetector) {
      analysis.orphanAnalysis = this.extractOrphanAnalysis(url);
    }

    // 🎯 FINAL COVERAGE FEATURES - Remaining 2%
    
    // Extract content intelligence analysis (addresses 1.5% gap)
    if (this.config.enableContentIntelligence) {
      analysis.contentIntelligence = this.extractContentIntelligence(dom, pageData, url);
    }

    // Extract business analytics (addresses 0.5% gap)
    if (this.config.enableBusinessAnalytics) {
      analysis.businessAnalytics = this.extractBusinessAnalytics(dom, pageData, url);
    }

    // � PHASE 3: Business Intelligence Module
    if (this.config.enableBusinessIntelligence) {
      analysis.businessIntelligence = await this.extractBusinessIntelligence(dom, pageData, url);
    }

    // �🎯 PHASE 1: Enhanced Social Media Optimization
    if (this.config.enableSocialMediaAnalysis) {
      analysis.socialMediaAnalysis = this.extractSocialMediaAnalysis(dom, pageData, url);
    }

    // 🛒 PHASE 2: E-commerce Analysis Module
    if (this.config.enableEcommerceAnalysis) {
      analysis.ecommerceAnalysis = this.extractEcommerceAnalysis(dom, pageData, url);
    }

    // Extract SSL certificate analysis (addresses remaining security gap)
    if (this.config.enableSSLCertificateAnalysis) {
      // Note: SSL analysis is async and handled separately to avoid blocking the main extraction
      analysis.sslCertificate = {
        enabled: true,
        status: 'available',
        note: 'SSL Certificate analysis available via extractSSLCertificateAnalysis() async method'
      };
    }

    // 🤖 Extract AI-powered insights (Next-Gen AI Intelligence)
    if (this.config.enableAIIntegration && this.aiIntegrationManager) {
      // For now, we'll add a placeholder - full AI integration will be available via separate async method
      analysis.aiIntelligence = {
        enabled: true,
        status: 'available',
        note: 'AI Intelligence available via extractAIIntelligence() async method',
        capabilities: this.aiIntegrationManager.getAIStatus()?.capabilities || {}
      };
    }

    // Calculate overall enhanced score
    analysis.overallEnhancedScore = this._calculateOverallEnhancedScore(analysis);

    return analysis;
  }

  /**
   * Extract advanced link analysis
   * @param {Object} dom - JSDOM document object
   * @param {string} url - Page URL
   * @returns {Object} Advanced link analysis results
   */
  extractAdvancedLinkAnalysis(dom, url = '') {
    try {
      return this.advancedLinkAnalyzer.analyzeAdvancedLinks(
        dom, 
        url, 
        this.config.siteData
      );
    } catch (error) {
      return {
        error: `Advanced link analysis failed: ${error.message}`,
        anchorTextAnalysis: null,
        linkContextAnalysis: null,
        linkHealthScore: 0
      };
    }
  }

  /**
   * Extract link depth analysis
   * @param {string} url - Page URL
   * @returns {Object} Link depth analysis results
   */
  extractLinkDepthAnalysis(url = '') {
    try {
      if (!this.linkDepthCalculator) {
        return {
          error: 'Link depth calculator not initialized - requires site data',
          disabled: true
        };
      }

      return this.linkDepthCalculator.analyzePageDepth(url);
    } catch (error) {
      return {
        error: `Link depth analysis failed: ${error.message}`,
        linkDepth: null,
        urlDepth: null
      };
    }
  }

  /**
   * Extract orphan page analysis
   * @param {string} url - Page URL
   * @returns {Object} Orphan analysis results
   */
  extractOrphanAnalysis(url = '') {
    try {
      if (!this.orphanedPagesDetector) {
        return {
          error: 'Orphaned pages detector not initialized - requires site data',
          disabled: true
        };
      }

      return this.orphanedPagesDetector.analyzePageConnectivity(url);
    } catch (error) {
      return {
        error: `Orphan analysis failed: ${error.message}`,
        isOrphaned: null,
        incomingLinks: 0
      };
    }
  }

  /**
   * Extract content intelligence analysis
   * @param {Object} dom - JSDOM document object
   * @param {Object} pageData - Existing page data
   * @param {string} url - Page URL
   * @returns {Object} Content intelligence analysis results
   */
  extractContentIntelligence(dom, pageData, url = '') {
    try {
      return this.contentIntelligenceAnalyzer.analyzeContentIntelligence(
        dom, 
        pageData, 
        url, 
        this.config.siteData
      );
    } catch (error) {
      return {
        error: `Content intelligence analysis failed: ${error.message}`,
        uniquenessAnalysis: null,
        duplicateDetection: null,
        originalityScore: 0,
        recommendations: []
      };
    }
  }

  /**
   * Extract AI-powered intelligence and insights
   * @param {Object} pageData - Page data for AI analysis
   * @param {string} url - Page URL
   * @param {Object} options - AI analysis options
   * @returns {Promise<Object>} AI intelligence results
   */
  async extractAIIntelligence(pageData, url = '', options = {}) {
    if (!this.aiIntegrationManager) {
      return {
        error: 'AI Integration Manager not initialized',
        disabled: true
      };
    }

    try {
      // Initialize AI if needed
      const aiStatus = this.aiIntegrationManager.getAIStatus();
      if (!aiStatus.initialization.isInitialized) {
        await this.aiIntegrationManager.initialize();
      }

      // Perform comprehensive AI analysis
      const aiResults = await this.aiIntegrationManager.performComprehensiveAIAnalysis(
        pageData,
        options.historicalData || [],
        {
          monitoringUrl: options.enableRealtimeMonitoring ? url : null,
          includePredictive: this.config.enablePredictiveAnalytics,
          includeRealtime: this.config.enableRealtimeIntelligence && options.enableRealtimeMonitoring,
          includeOptimization: this.config.enableAIOptimization,
          objectives: options.objectives || {
            performance: true,
            seo: true,
            conversion: true,
            userExperience: true
          },
          ...options
        }
      );

      return {
        success: true,
        timestamp: new Date().toISOString(),
        
        aiAnalysis: aiResults,
        
        capabilities: {
          predictiveAnalytics: aiResults.capabilities?.predictiveAnalytics || false,
          realtimeIntelligence: aiResults.capabilities?.realtimeIntelligence || false,
          aiOptimization: aiResults.capabilities?.aiOptimization || false,
          autonomousDecisions: aiResults.capabilities?.autonomousDecisions || false
        },
        
        quickInsights: this._extractQuickAIInsights(aiResults),
        
        recommendations: aiResults.unifiedRecommendations?.priorityRecommendations || [],
        
        confidence: aiResults.synthesizedIntelligence?.confidence || 0,
        
        metadata: {
          operationId: aiResults.operationId,
          analysisTime: aiResults.analysisTime,
          modulesUsed: aiResults.metadata?.modulesUsed || 0,
          aiVersion: aiResults.metadata?.aiVersion || '1.0.0'
        }
      };

    } catch (error) {
      console.error('AI Intelligence extraction error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Extract quick AI insights for immediate use
   * @param {Object} aiResults - Full AI analysis results
   * @returns {Object} Quick AI insights
   * @private
   */
  _extractQuickAIInsights(aiResults) {
    const insights = {
      predictions: {},
      optimizations: {},
      alerts: [],
      summary: {}
    };

    // Extract predictive insights
    if (aiResults.aiResults?.predictive?.success) {
      const predictiveData = aiResults.aiResults.predictive.data;
      insights.predictions = {
        performance: predictiveData.predictions?.performance?.loadTime?.predicted30days || null,
        seo: predictiveData.predictions?.seo?.rankingPotential?.predictedImprovement || null,
        traffic: predictiveData.predictions?.traffic?.organicTraffic?.predicted30days || null
      };
    }

    // Extract optimization insights
    if (aiResults.aiResults?.optimization?.success) {
      const optimizationData = aiResults.aiResults.optimization.data;
      insights.optimizations = {
        autonomousRecommendations: optimizationData.autonomousRecommendations?.slice(0, 3) || [],
        predictedImpact: optimizationData.predictedImpact || {},
        confidence: optimizationData.confidenceScores?.overall || 0
      };
    }

    // Extract real-time alerts
    if (aiResults.aiResults?.realtime?.success) {
      const realtimeData = aiResults.aiResults.realtime.data;
      insights.alerts = realtimeData.snapshot?.alerts || [];
    }

    // Generate summary
    insights.summary = {
      aiModulesActive: Object.keys(aiResults.aiResults || {}).filter(
        key => aiResults.aiResults[key]?.success
      ).length,
      overallConfidence: aiResults.synthesizedIntelligence?.confidence || 0,
      recommendationsCount: (aiResults.unifiedRecommendations?.priorityRecommendations || []).length,
      hasAutonomousActions: !!(aiResults.autonomousDecisions?.autoExecutable > 0)
    };

    return insights;
  }

  /**
   * Extract business analytics
   * @param {Object} dom - JSDOM document object
   * @param {Object} pageData - Existing page data
   * @param {string} url - Page URL
   * @returns {Object} Business analytics results
   */
  extractBusinessAnalytics(dom, pageData, url = '') {
    try {
      return this.businessAnalyticsAnalyzer.analyzeBusinessAnalytics(
        dom, 
        pageData, 
        url
      );
    } catch (error) {
      return {
        error: `Business analytics analysis failed: ${error.message}`,
        userIntent: null,
        conversionElements: null,
        socialProof: null,
        trustSignals: null,
        businessOptimizationScore: 0,
        recommendations: []
      };
    }
  }

  /**
   * Extract business intelligence analysis
   * @param {Object} dom - JSDOM document object
   * @param {Object} pageData - Existing page data
   * @param {string} url - Page URL
   * @returns {Object} Business intelligence analysis results
   */
  async extractBusinessIntelligence(dom, pageData, url = '') {
    try {
      console.log('🏢 DEBUG: Starting Business Intelligence analysis for:', url);
      console.log('🔍 DEBUG: Business Intelligence analyzer available:', !!this.businessIntelligenceAnalyzer);
      console.log('🏗️ DEBUG: DOM object type:', typeof dom);
      console.log('🏗️ DEBUG: DOM has window:', !!dom.window);
      console.log('🏗️ DEBUG: DOM window has document:', !!(dom.window && dom.window.document));
      console.log('🏗️ DEBUG: DOM window document type:', typeof (dom.window && dom.window.document));
      console.log('🏗️ DEBUG: DOM constructor name:', dom.constructor.name);
      console.log('🏗️ DEBUG: DOM toString:', dom.toString().substring(0, 100));
      
      if (!this.businessIntelligenceAnalyzer) {
        console.log('❌ DEBUG: Business Intelligence analyzer not initialized');
        return {
          error: 'Business Intelligence analyzer not initialized',
          debug: 'Analyzer instance missing'
        };
      }
      
      // Create a comprehensive document-like adapter for Cheerio
      let documentAdapter;
      if (typeof dom === 'function') {
        // Server-side: dom is Cheerio $ function
        console.log('🔧 DEBUG: Creating Cheerio adapter for Business Intelligence analyzer');
        documentAdapter = {
          querySelectorAll: (selector) => {
            try {
              const elements = dom(selector);
              // Convert Cheerio elements to document-like elements
              return elements.toArray().map(el => ({
                textContent: dom(el).text(),
                getAttribute: (attr) => dom(el).attr(attr),
                innerHTML: dom(el).html(),
                tagName: el.tagName,
                classList: {
                  contains: (className) => dom(el).hasClass(className)
                }
              }));
            } catch (error) {
              console.log('⚠️ DEBUG: Cheerio querySelectorAll error:', error.message);
              return [];
            }
          },
          querySelector: (selector) => {
            try {
              const element = dom(selector).first();
              if (element.length === 0) return null;
              const el = element[0];
              return {
                textContent: element.text(),
                getAttribute: (attr) => element.attr(attr),
                innerHTML: element.html(),
                tagName: el.tagName,
                classList: {
                  contains: (className) => element.hasClass(className)
                }
              };
            } catch (error) {
              console.log('⚠️ DEBUG: Cheerio querySelector error:', error.message);
              return null;
            }
          }
        };
      } else {
        // Already a document object
        documentAdapter = dom.window ? dom.window.document : dom;
      }
      
      const result = await this.businessIntelligenceAnalyzer.analyzeBusinessIntelligence(
        documentAdapter, 
        pageData, 
        url
      );
      
      console.log('✅ DEBUG: Business Intelligence analysis completed');
      console.log('📊 DEBUG: Result keys:', Object.keys(result || {}));
      
      return result;
    } catch (error) {
      console.log('❌ DEBUG: Business Intelligence analysis error:', error.message);
      return {
        error: `Business intelligence analysis failed: ${error.message}`,
        trustSignals: null,
        contactInformation: null,
        aboutPageQuality: null,
        customerSupport: null,
        businessCredibility: null,
        locationData: null,
        score: 0,
        grade: 'F',
        recommendations: [],
        analysisTime: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Extract social media analysis
   * @param {Object} dom - JSDOM document object
   * @param {Object} pageData - Existing page data
   * @param {string} url - Page URL
   * @returns {Object} Social media analysis results
   */
  extractSocialMediaAnalysis(dom, pageData, url = '') {
    try {
      return this.socialMediaAnalyzer.analyzeSocialMedia(dom, pageData, url);
    } catch (error) {
      return {
        error: `Social media analysis failed: ${error.message}`,
        platforms: null,
        sharing: null,
        socialProof: null,
        images: null,
        optimizationScore: 0,
        recommendations: []
      };
    }
  }

  /**
   * Extract e-commerce analysis
   * @param {Object} dom - JSDOM document object
   * @param {Object} pageData - Existing page data
   * @param {string} url - Page URL
   * @returns {Object} E-commerce analysis results
   */
  extractEcommerceAnalysis(dom, pageData, url = '') {
    try {
      return this.ecommerceAnalyzer.analyzeEcommerce(dom, pageData, url);
    } catch (error) {
      return {
        error: `E-commerce analysis failed: ${error.message}`,
        type: 'analysis-error',
        product: null,
        checkout: null,
        reviews: null,
        security: null,
        conversion: null,
        schema: null,
        optimization: { overall: 0, grade: 'F' },
        recommendations: []
      };
    }
  }

  /**
   * Extract SSL certificate analysis data
   * @param {string} url - Page URL
   * @param {Object} pageData - Existing page data for mixed content analysis
   * @returns {Promise<Object>} SSL certificate analysis results
   */
  async extractSSLCertificateAnalysis(url, pageData = {}) {
    if (!this.config.enableSSLCertificateAnalysis) {
      return { disabled: true, message: 'SSL certificate analysis disabled' };
    }

    try {
      const analysis = await this.sslCertificateAnalyzer.analyzeCertificate(url, pageData);
      const report = this.sslCertificateAnalyzer.generateReport(analysis);
      
      return {
        enabled: true,
        analysis: report,
        details: {
          certificateChain: analysis.chain || null,
          expirationInfo: analysis.expiration || null,
          securityStrength: analysis.security || null,
          mixedContentIssues: analysis.mixedContent || null,
          overallScore: analysis.overall || null
        },
        recommendations: report.recommendations || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        error: `SSL certificate analysis failed: ${error.message}`,
        isHTTPS: url.startsWith('https://'),
        basicSSLStatus: url.startsWith('https://') ? 'HTTPS detected' : 'Not HTTPS',
        recommendations: ['Consider implementing HTTPS for better security']
      };
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Calculate enhanced performance metrics
   * @private
   */
  _calculateEnhancedMetrics(pageData, responseTime, pageSize, rawHTML) {
    const metrics = {
      // Server timing metrics
      serverMetrics: {
        ttfb: Math.round(responseTime * 0.25), // Estimated TTFB
        serverProcessingTime: Math.round(responseTime * 0.15),
        networkLatency: Math.round(responseTime * 0.1)
      },

      // Resource metrics
      resourceMetrics: {
        totalResources: pageData?.technical?.resources?.totalResources || 0,
        externalResources: (pageData?.technical?.resources?.externalCSS || 0) + 
                          (pageData?.technical?.resources?.externalJS || 0),
        inlineResources: (pageData?.technical?.resources?.inlineCSS || 0) + 
                        (pageData?.technical?.resources?.inlineJS || 0),
        resourceEfficiency: this._calculateResourceEfficiency(pageData)
      },

      // Content metrics
      contentMetrics: {
        htmlSize: rawHTML ? new Blob([rawHTML]).size : pageSize,
        contentToCodeRatio: this._calculateContentToCodeRatio(pageData, rawHTML),
        compressionRatio: this._calculateCompressionRatio(pageData, pageSize),
        textDensity: this._calculateTextDensity(pageData)
      },

      // Performance indicators
      performanceIndicators: {
        hasCompression: pageData?.performance?.compression && 
                       pageData.performance.compression !== 'none',
        usesHTTP2: pageData?.technical?.serverInfo?.httpVersion === '2.0',
        hasCDN: this._detectCDNUsage(pageData),
        optimizedImages: this._checkImageOptimization(pageData)
      }
    };

    return metrics;
  }

  /**
   * Generate performance insights
   * @private
   */
  _generatePerformanceInsights(coreWebVitals, enhancedMetrics, pageData) {
    const insights = {
      criticalIssues: [],
      optimizationOpportunities: [],
      performanceScore: 0,
      summary: {}
    };

    // Analyze Core Web Vitals for insights
    if (coreWebVitals) {
      if (coreWebVitals.lcp?.rating === 'poor') {
        insights.criticalIssues.push({
          type: 'lcp',
          severity: 'high',
          title: 'Poor Largest Contentful Paint',
          description: `LCP is ${coreWebVitals.lcp.value}ms (should be < 2500ms)`,
          impact: 'User experience and SEO rankings'
        });
      }

      if (coreWebVitals.cls?.rating === 'poor') {
        insights.criticalIssues.push({
          type: 'cls',
          severity: 'high',
          title: 'High Cumulative Layout Shift',
          description: `CLS is ${coreWebVitals.cls.value} (should be < 0.1)`,
          impact: 'User experience and interaction stability'
        });
      }

      insights.performanceScore = coreWebVitals.performanceScore || 0;
    }

    // Analyze enhanced metrics for opportunities
    if (enhancedMetrics) {
      if (!enhancedMetrics.performanceIndicators.hasCompression) {
        insights.optimizationOpportunities.push({
          type: 'compression',
          priority: 'high',
          title: 'Enable Compression',
          description: 'Enable gzip or brotli compression',
          estimatedImprovement: '20-30% size reduction'
        });
      }

      if (enhancedMetrics.resourceMetrics.externalResources > 10) {
        insights.optimizationOpportunities.push({
          type: 'resources',
          priority: 'medium',
          title: 'Reduce External Resources',
          description: `${enhancedMetrics.resourceMetrics.externalResources} external resources found`,
          estimatedImprovement: 'Faster loading times'
        });
      }

      if (enhancedMetrics.contentMetrics.contentToCodeRatio < 15) {
        insights.optimizationOpportunities.push({
          type: 'content-ratio',
          priority: 'medium',
          title: 'Improve Content-to-Code Ratio',
          description: `Ratio is ${enhancedMetrics.contentMetrics.contentToCodeRatio}% (target: 25%+)`,
          estimatedImprovement: 'Better SEO and faster parsing'
        });
      }
    }

    // Generate summary
    insights.summary = {
      totalIssues: insights.criticalIssues.length,
      totalOpportunities: insights.optimizationOpportunities.length,
      overallHealth: this._assessPerformanceHealth(insights.performanceScore),
      priorityFocus: this._determinePriorityFocus(insights)
    };

    return insights;
  }

  /**
   * Combine accessibility scores
   * @private
   */
  _combineAccessibilityScores(basicA11y, advancedA11y) {
    const basicScore = basicA11y.accessibilityScore || 0;
    const advancedScore = advancedA11y.accessibilityScore || 0;
    
    // Weighted combination: 60% advanced, 40% basic
    return Math.round((advancedScore * 0.6) + (basicScore * 0.4));
  }

  /**
   * Combine accessibility recommendations
   * @private
   */
  _combineAccessibilityRecommendations(basicA11y, advancedA11y) {
    const basicRecs = basicA11y.recommendations || [];
    const advancedRecs = advancedA11y.recommendations || [];
    
    // Merge and deduplicate recommendations
    const allRecs = [...basicRecs, ...advancedRecs];
    const uniqueRecs = allRecs.filter((rec, index, arr) => 
      arr.findIndex(r => r.type === rec.type) === index
    );
    
    // Sort by priority
    return uniqueRecs.sort((a, b) => {
      const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Calculate overall enhanced score
   * @private
   */
  _calculateOverallEnhancedScore(analysis) {
    const scores = [];
    
    if (analysis.enhancedPerformance?.coreWebVitals?.performanceScore) {
      scores.push(analysis.enhancedPerformance.coreWebVitals.performanceScore);
    }
    
    if (analysis.advancedAccessibility?.combinedScore) {
      scores.push(analysis.advancedAccessibility.combinedScore);
    }
    
    if (analysis.contentQuality?.qualityScore) {
      scores.push(analysis.contentQuality.qualityScore);
    }

    if (analysis.thirdPartyAnalysis?.performanceScore) {
      scores.push(analysis.thirdPartyAnalysis.performanceScore);
    }

    if (analysis.resourceAnalysis?.score) {
      scores.push(analysis.resourceAnalysis.score);
    }

    if (analysis.pageClassification?.confidence) {
      // Convert confidence (0-1) to score (0-100)
      scores.push(analysis.pageClassification.confidence * 100);
    }

    if (analysis.cdnAnalysis?.performanceImpact?.performanceScore) {
      scores.push(analysis.cdnAnalysis.performanceImpact.performanceScore);
    }

    // 🎯 CRITICAL MISSING FEATURES - Include Link Analysis Scores
    if (analysis.advancedLinkAnalysis?.linkHealthScore) {
      scores.push(analysis.advancedLinkAnalysis.linkHealthScore);
    }

    if (analysis.linkDepthAnalysis?.estimatedDepth !== undefined) {
      // Convert depth to score (lower depth = higher score)
      const depthScore = Math.max(0, 100 - (analysis.linkDepthAnalysis.estimatedDepth * 15));
      scores.push(depthScore);
    }

    if (analysis.orphanAnalysis?.isOrphaned !== undefined) {
      // Orphaned pages get very low score, connected pages get full score
      const orphanScore = analysis.orphanAnalysis.isOrphaned ? 20 : 100;
      scores.push(orphanScore);
    }

    // 🎯 FINAL COVERAGE FEATURES - Include Intelligence & Business Scores
    if (analysis.contentIntelligence?.originalityScore) {
      scores.push(analysis.contentIntelligence.originalityScore);
    }

    if (analysis.businessAnalytics?.businessOptimizationScore) {
      scores.push(analysis.businessAnalytics.businessOptimizationScore);
    }

    // 🎯 PHASE 1: Enhanced Social Media Optimization Score
    if (analysis.socialMediaAnalysis?.optimization?.overall) {
      scores.push(analysis.socialMediaAnalysis.optimization.overall);
    }

    // 🛒 PHASE 2: E-commerce Analysis Score
    if (analysis.ecommerceAnalysis?.optimization?.overall) {
      scores.push(analysis.ecommerceAnalysis.optimization.overall);
    }
    
    return scores.length > 0 ? 
      Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  }

  /**
   * Calculate resource efficiency
   * @private
   */
  _calculateResourceEfficiency(pageData) {
    const resources = pageData?.technical?.resources;
    if (!resources) return 0;
    
    const total = resources.totalResources || 1;
    const external = (resources.externalCSS || 0) + (resources.externalJS || 0);
    
    // Prefer fewer external resources
    return Math.max(0, 100 - (external * 5));
  }

  /**
   * Calculate content-to-code ratio
   * @private
   */
  _calculateContentToCodeRatio(pageData, rawHTML) {
    if (!rawHTML || !pageData?.content?.textLength) return 0;
    
    const textLength = pageData.content.textLength;
    const htmlLength = rawHTML.length;
    
    return htmlLength > 0 ? Math.round((textLength / htmlLength) * 100) : 0;
  }

  /**
   * Calculate compression ratio
   * @private
   */
  _calculateCompressionRatio(pageData, pageSize) {
    const compression = pageData?.performance?.compression;
    
    if (!compression || compression === 'none') return 0;
    
    // Estimate compression ratio based on compression type
    switch (compression) {
      case 'gzip': return 70; // ~70% compression typical
      case 'brotli': return 80; // ~80% compression typical
      case 'deflate': return 65; // ~65% compression typical
      default: return 0;
    }
  }

  /**
   * Calculate text density
   * @private
   */
  _calculateTextDensity(pageData) {
    const textLength = pageData?.content?.textLength || 0;
    const totalElements = pageData?.content?.headings?.total || 0;
    
    return totalElements > 0 ? Math.round(textLength / totalElements) : 0;
  }

  /**
   * Detect CDN usage
   * @private
   */
  _detectCDNUsage(pageData) {
    const server = pageData?.technical?.serverInfo?.server || '';
    const headers = pageData?.headers || {};
    
    const cdnIndicators = [
      'cloudflare', 'cloudfront', 'fastly', 'keycdn', 'maxcdn',
      'stackpath', 'bunnycdn', 'jsdelivr', 'unpkg'
    ];
    
    return cdnIndicators.some(cdn => 
      server.toLowerCase().includes(cdn) ||
      Object.values(headers).some(header => 
        typeof header === 'string' && header.toLowerCase().includes(cdn)
      )
    );
  }

  /**
   * Check image optimization
   * @private
   */
  _checkImageOptimization(pageData) {
    const images = pageData?.content?.images;
    if (!images || !images.total) return true; // No images = optimized
    
    // Check for modern image formats, lazy loading, etc.
    // This is a basic check - in practice would analyze actual image elements
    const hasAltText = images.withAlt / images.total > 0.8;
    const reasonableImageCount = images.total < 50;
    
    return hasAltText && reasonableImageCount;
  }

  /**
   * Assess performance health
   * @private
   */
  _assessPerformanceHealth(score) {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Determine priority focus area
   * @private
   */
  _determinePriorityFocus(insights) {
    if (insights.criticalIssues.length > 0) {
      return insights.criticalIssues[0].type; // Focus on first critical issue
    }
    
    if (insights.optimizationOpportunities.length > 0) {
      const highPriority = insights.optimizationOpportunities.find(op => op.priority === 'high');
      return highPriority ? highPriority.type : insights.optimizationOpportunities[0].type;
    }
    
    return 'maintenance'; // No critical issues found
  }
}

/**
 * Factory function to create enhanced extractors with default config
 */
export function createEnhancedExtractors(options = {}) {
  return new EnhancedExtractorsIntegration(options);
}

export default EnhancedExtractorsIntegration;
