/**
 * ============================================================================
 * PRIVACY ANALYSIS DETECTOR - GPT-5 STYLE COMPONENT
 * ============================================================================
 * 
 * Advanced privacy and data collection analysis for third-party services
 * Part of Third-Party Analyzer Combined Approach (12th Implementation)
 * 
 * Capabilities:
 * - Data collection detection and analysis
 * - Privacy policy compliance assessment
 * - Cookie and tracking analysis
 * - GDPR/CCPA compliance evaluation
 * - User consent mechanism analysis
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration GPT-5 Style Detector
 * @created 2025-08-13
 */

export class PrivacyAnalysisDetector {
  constructor(options = {}) {
    this.options = {
      // Privacy Analysis Configuration
      analysisDepth: options.analysisDepth || 'comprehensive',
      enableDataFlowAnalysis: options.enableDataFlowAnalysis !== false,
      enableCookieAnalysis: options.enableCookieAnalysis !== false,
      enableConsentAnalysis: options.enableConsentAnalysis !== false,
      enableComplianceCheck: options.enableComplianceCheck !== false,
      
      // Privacy Thresholds
      highRiskThreshold: options.highRiskThreshold || 0.8,
      mediumRiskThreshold: options.mediumRiskThreshold || 0.5,
      acceptableDataTypes: options.acceptableDataTypes || ['performance', 'functional'],
      
      // Regulatory Frameworks
      regulatoryFrameworks: options.regulatoryFrameworks || ['GDPR', 'CCPA', 'PIPEDA'],
      
      // Cookie Configuration
      cookieCategories: options.cookieCategories || [
        'essential', 'performance', 'functional', 'targeting', 'social'
      ],
      
      ...options
    };

    this.detectorType = 'privacy_analysis_detector';
    this.version = '1.0.0';
    
    // Privacy risk patterns for different services
    this.privacyPatterns = {
      // High Privacy Risk Services
      highRisk: {
        'Facebook Pixel': {
          patterns: [/facebook\.com\/tr/, /connect\.facebook\.net.*fbevents/],
          dataTypes: ['behavioral', 'demographic', 'cross_site'],
          riskScore: 0.9,
          concerns: ['cross_site_tracking', 'behavioral_profiling', 'data_sharing'],
          compliance: {
            GDPR: 'requires_consent',
            CCPA: 'requires_opt_out',
            PIPEDA: 'requires_consent'
          }
        },
        'Google Analytics': {
          patterns: [/google-analytics\.com/, /googletagmanager\.com/],
          dataTypes: ['behavioral', 'demographic', 'location'],
          riskScore: 0.8,
          concerns: ['user_profiling', 'cross_domain_tracking', 'data_retention'],
          compliance: {
            GDPR: 'requires_consent',
            CCPA: 'requires_notice',
            PIPEDA: 'requires_consent'
          }
        },
        'FullStory': {
          patterns: [/fullstory\.com/],
          dataTypes: ['behavioral', 'session_replay', 'form_data'],
          riskScore: 0.95,
          concerns: ['session_recording', 'keystroke_capture', 'sensitive_data'],
          compliance: {
            GDPR: 'requires_explicit_consent',
            CCPA: 'requires_opt_out',
            PIPEDA: 'requires_explicit_consent'
          }
        },
        'Hotjar': {
          patterns: [/hotjar\.com/],
          dataTypes: ['behavioral', 'session_replay', 'form_interactions'],
          riskScore: 0.85,
          concerns: ['session_recording', 'heatmap_tracking', 'form_analysis'],
          compliance: {
            GDPR: 'requires_consent',
            CCPA: 'requires_notice',
            PIPEDA: 'requires_consent'
          }
        }
      },

      // Medium Privacy Risk Services
      mediumRisk: {
        'Google Fonts': {
          patterns: [/fonts\.googleapis\.com/, /fonts\.gstatic\.com/],
          dataTypes: ['performance', 'functional'],
          riskScore: 0.4,
          concerns: ['ip_logging', 'font_fingerprinting'],
          compliance: {
            GDPR: 'legitimate_interest',
            CCPA: 'functional_exemption',
            PIPEDA: 'implied_consent'
          }
        },
        'YouTube Embed': {
          patterns: [/youtube\.com\/embed/, /youtube-nocookie\.com/],
          dataTypes: ['behavioral', 'viewing_preferences'],
          riskScore: 0.6,
          concerns: ['video_tracking', 'cross_platform_profiling'],
          compliance: {
            GDPR: 'requires_consent',
            CCPA: 'requires_notice',
            PIPEDA: 'requires_consent'
          }
        },
        'Twitter Widget': {
          patterns: [/platform\.twitter\.com/, /syndication\.twitter\.com/],
          dataTypes: ['behavioral', 'social_interactions'],
          riskScore: 0.6,
          concerns: ['social_tracking', 'cross_site_profiling'],
          compliance: {
            GDPR: 'requires_consent',
            CCPA: 'requires_notice',
            PIPEDA: 'requires_consent'
          }
        }
      },

      // Low Privacy Risk Services
      lowRisk: {
        'Cloudflare': {
          patterns: [/cloudflare\.com/, /cdnjs\.cloudflare\.com/],
          dataTypes: ['performance', 'security'],
          riskScore: 0.2,
          concerns: ['cdn_logging'],
          compliance: {
            GDPR: 'legitimate_interest',
            CCPA: 'service_provider',
            PIPEDA: 'legitimate_purpose'
          }
        },
        'jsDelivr': {
          patterns: [/jsdelivr\.net/],
          dataTypes: ['performance'],
          riskScore: 0.1,
          concerns: ['minimal_logging'],
          compliance: {
            GDPR: 'legitimate_interest',
            CCPA: 'service_provider',
            PIPEDA: 'legitimate_purpose'
          }
        }
      }
    };

    // Cookie analysis patterns
    this.cookiePatterns = {
      tracking: {
        patterns: [/_ga/, /_gid/, /_fbp/, /_fbc/, /utm_/, /tracking/, /analytics/],
        category: 'targeting',
        riskLevel: 'high'
      },
      functional: {
        patterns: [/session/, /auth/, /login/, /csrf/, /preference/],
        category: 'functional',
        riskLevel: 'low'
      },
      performance: {
        patterns: [/performance/, /speed/, /cache/, /cdn/],
        category: 'performance',
        riskLevel: 'low'
      },
      social: {
        patterns: [/facebook/, /twitter/, /linkedin/, /social/],
        category: 'social',
        riskLevel: 'medium'
      }
    };

    // Data collection indicators
    this.dataCollectionIndicators = {
      forms: {
        personal: [/name/, /email/, /phone/, /address/, /ssn/, /passport/],
        financial: [/credit/, /card/, /payment/, /billing/, /account/],
        behavioral: [/preference/, /interest/, /behavior/, /activity/],
        demographic: [/age/, /gender/, /income/, /education/, /occupation/]
      },
      tracking: {
        pixels: [/pixel/, /beacon/, /track/, /analytics/],
        fingerprinting: [/canvas/, /webgl/, /audio/, /font/, /screen/],
        storage: [/localStorage/, /sessionStorage/, /indexedDB/, /cookie/]
      }
    };

    // Consent mechanism patterns
    this.consentPatterns = {
      banners: [
        /cookie.*banner/i,
        /privacy.*notice/i,
        /consent.*manager/i,
        /gdpr.*compliance/i
      ],
      frameworks: [
        /cookiebot/i,
        /onetrust/i,
        /cookielawinfo/i,
        /quantcast/i,
        /trustarc/i
      ]
    };
    
    console.log('🔒 Privacy Analysis Detector initialized (GPT-5 Style)');
  }

  /**
   * Get detector metadata
   * @returns {Object} Detector metadata and capabilities
   */
  getMetadata() {
    return {
      name: 'PrivacyAnalysisDetector',
      type: this.detectorType,
      version: this.version,
      description: 'Advanced privacy and data collection analysis for third-party services',
      
      capabilities: [
        'data_collection_detection',
        'privacy_risk_assessment',
        'cookie_analysis',
        'tracking_mechanism_identification',
        'consent_framework_analysis',
        'regulatory_compliance_check',
        'data_flow_mapping'
      ],
      
      analysisTypes: [
        'behavioral_tracking',
        'cross_site_tracking',
        'session_recording',
        'form_data_collection',
        'device_fingerprinting',
        'location_tracking',
        'consent_management'
      ],
      
      configuration: {
        analysisDepth: this.options.analysisDepth,
        regulatoryFrameworks: this.options.regulatoryFrameworks,
        highRiskThreshold: this.options.highRiskThreshold,
        enableComplianceCheck: this.options.enableComplianceCheck
      },
      
      frameworks: {
        supported: ['GDPR', 'CCPA', 'PIPEDA', 'LGPD', 'PDPA'],
        active: this.options.regulatoryFrameworks
      },
      
      riskCategories: Object.keys(this.privacyPatterns),
      approach: 'GPT-5 Style Privacy Analysis'
    };
  }

  /**
   * Main privacy analysis method
   * @param {Object} document - Document object to analyze
   * @param {Object} context - Analysis context and configuration
   * @returns {Promise<Object>} Privacy analysis results
   */
  async analyze(document, context = {}) {
    const startTime = Date.now();
    
    try {
      if (!document) {
        throw new Error('Document is required for privacy analysis');
      }

      console.log('🔒 Starting privacy analysis...');

      // Core Privacy Analysis
      const results = {
        success: true,
        timestamp: new Date().toISOString(),
        
        // Data Collection Analysis
        dataCollection: await this._analyzeDataCollection(document, context),
        
        // Privacy Risk Assessment
        privacyRisks: await this._assessPrivacyRisks(document, context),
        
        // Cookie Analysis
        cookies: this.options.enableCookieAnalysis ?
          await this._analyzeCookies(document, context) : null,
        
        // Tracking Mechanisms
        tracking: await this._analyzeTrackingMechanisms(document, context),
        
        // Consent Analysis
        consent: this.options.enableConsentAnalysis ?
          await this._analyzeConsent(document, context) : null,
        
        // Compliance Assessment
        compliance: this.options.enableComplianceCheck ?
          await this._assessCompliance(document, context) : null,
        
        // Data Flow Analysis
        dataFlow: this.options.enableDataFlowAnalysis ?
          await this._analyzeDataFlow(document, context) : null,
        
        // Privacy Summary
        summary: {},
        
        executionTime: Date.now() - startTime
      };

      // Generate privacy summary
      results.summary = this._generatePrivacySummary(results);
      
      console.log(`✅ Privacy analysis completed in ${results.executionTime}ms`);
      console.log(`🔍 Risk level: ${results.summary.overallRiskLevel || 'unknown'}`);
      console.log(`📊 Data collectors: ${results.summary.dataCollectors || 0}`);
      
      return results;

    } catch (error) {
      console.error('❌ Privacy analysis failed:', error);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Analyze data collection practices
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Data collection analysis results
   */
  async _analyzeDataCollection(document, context) {
    const dataCollection = {
      collectors: [],
      types: {},
      mechanisms: {},
      riskAssessment: {}
    };

    try {
      // Identify data collection services
      dataCollection.collectors = await this._identifyDataCollectors(document);
      
      // Analyze data types being collected
      dataCollection.types = await this._analyzeDataTypes(document, context);
      
      // Identify collection mechanisms
      dataCollection.mechanisms = await this._identifyCollectionMechanisms(document);
      
      // Assess overall data collection risk
      dataCollection.riskAssessment = this._assessDataCollectionRisk(dataCollection);

    } catch (error) {
      console.error('Data collection analysis failed:', error);
    }

    return dataCollection;
  }

  /**
   * Assess privacy risks from third-party services
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Privacy risk assessment results
   */
  async _assessPrivacyRisks(document, context) {
    const risks = {
      services: [],
      categories: {},
      overall: {},
      recommendations: []
    };

    try {
      // Analyze each detected service for privacy risks
      const services = await this._getThirdPartyServices(document);
      
      for (const service of services) {
        const serviceRisk = await this._assessServicePrivacyRisk(service);
        risks.services.push(serviceRisk);
      }
      
      // Categorize risks by level
      risks.categories = this._categorizePrivacyRisks(risks.services);
      
      // Calculate overall risk assessment
      risks.overall = this._calculateOverallPrivacyRisk(risks.services);
      
      // Generate risk mitigation recommendations
      risks.recommendations = this._generatePrivacyRecommendations(risks);

    } catch (error) {
      console.error('Privacy risk assessment failed:', error);
    }

    return risks;
  }

  /**
   * Analyze cookies and local storage
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Cookie analysis results
   */
  async _analyzeCookies(document, context) {
    const cookies = {
      detected: [],
      categories: {},
      thirdParty: [],
      localStorage: [],
      sessionStorage: []
    };

    try {
      // Analyze cookies from scripts
      cookies.detected = await this._detectCookieUsage(document);
      
      // Categorize cookies by purpose
      cookies.categories = this._categorizeCookies(cookies.detected);
      
      // Identify third-party cookies
      cookies.thirdParty = this._identifyThirdPartyCookies(cookies.detected);
      
      // Analyze local storage usage
      if (this.options.analysisDepth === 'comprehensive') {
        cookies.localStorage = await this._analyzeLocalStorageUsage(document);
        cookies.sessionStorage = await this._analyzeSessionStorageUsage(document);
      }

    } catch (error) {
      console.error('Cookie analysis failed:', error);
    }

    return cookies;
  }

  /**
   * Analyze tracking mechanisms
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Tracking analysis results
   */
  async _analyzeTrackingMechanisms(document, context) {
    const tracking = {
      pixels: [],
      fingerprinting: {},
      crossSite: [],
      behavioral: []
    };

    try {
      // Detect tracking pixels
      tracking.pixels = await this._detectTrackingPixels(document);
      
      // Detect fingerprinting techniques
      tracking.fingerprinting = await this._detectFingerprinting(document);
      
      // Detect cross-site tracking
      tracking.crossSite = await this._detectCrossSiteTracking(document);
      
      // Detect behavioral tracking
      tracking.behavioral = await this._detectBehavioralTracking(document);

    } catch (error) {
      console.error('Tracking mechanism analysis failed:', error);
    }

    return tracking;
  }

  /**
   * Analyze consent mechanisms
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Consent analysis results
   */
  async _analyzeConsent(document, context) {
    const consent = {
      detected: false,
      mechanisms: [],
      frameworks: [],
      compliance: {},
      effectiveness: {}
    };

    try {
      // Detect consent banners and notices
      consent.mechanisms = await this._detectConsentMechanisms(document);
      consent.detected = consent.mechanisms.length > 0;
      
      // Identify consent management frameworks
      consent.frameworks = await this._identifyConsentFrameworks(document);
      
      // Assess compliance with regulations
      consent.compliance = this._assessConsentCompliance(consent, context);
      
      // Evaluate consent mechanism effectiveness
      consent.effectiveness = this._evaluateConsentEffectiveness(consent);

    } catch (error) {
      console.error('Consent analysis failed:', error);
    }

    return consent;
  }

  /**
   * Assess regulatory compliance
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Compliance assessment results
   */
  async _assessCompliance(document, context) {
    const compliance = {};

    try {
      // Assess compliance for each enabled framework
      for (const framework of this.options.regulatoryFrameworks) {
        compliance[framework] = await this._assessFrameworkCompliance(framework, document, context);
      }

    } catch (error) {
      console.error('Compliance assessment failed:', error);
    }

    return compliance;
  }

  /**
   * Analyze data flow patterns
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Data flow analysis results
   */
  async _analyzeDataFlow(document, context) {
    const dataFlow = {
      destinations: [],
      crossBorder: [],
      retention: {},
      sharing: []
    };

    try {
      // Identify data destinations
      dataFlow.destinations = await this._identifyDataDestinations(document);
      
      // Detect cross-border data transfers
      dataFlow.crossBorder = this._detectCrossBorderTransfers(dataFlow.destinations);
      
      // Analyze data retention policies
      dataFlow.retention = await this._analyzeDataRetention(document, context);
      
      // Detect data sharing practices
      dataFlow.sharing = await this._detectDataSharing(document, context);

    } catch (error) {
      console.error('Data flow analysis failed:', error);
    }

    return dataFlow;
  }

  // ============================================================================
  // HELPER METHODS - DATA COLLECTION ANALYSIS
  // ============================================================================

  async _identifyDataCollectors(document) {
    const collectors = [];

    try {
      // Check scripts for known data collectors
      const scripts = document.querySelectorAll('script[src]');
      
      scripts.forEach(script => {
        const src = script.getAttribute('src');
        const collector = this._identifyCollectorFromUrl(src);
        if (collector) {
          collectors.push({
            ...collector,
            url: src,
            element: 'script'
          });
        }
      });

      // Check for inline tracking code
      const inlineScripts = document.querySelectorAll('script:not([src])');
      inlineScripts.forEach(script => {
        const content = script.textContent || script.innerHTML;
        const inlineCollectors = this._identifyInlineCollectors(content);
        collectors.push(...inlineCollectors);
      });

    } catch (error) {
      console.error('Data collector identification failed:', error);
    }

    return collectors;
  }

  async _analyzeDataTypes(document, context) {
    const dataTypes = {
      personal: [],
      behavioral: [],
      technical: [],
      sensitive: []
    };

    try {
      // Analyze forms for personal data collection
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
          const type = this._classifyInputDataType(input);
          if (type && !dataTypes[type.category].includes(type.type)) {
            dataTypes[type.category].push(type.type);
          }
        });
      });

      // Check for behavioral tracking indicators
      const htmlContent = document.documentElement.outerHTML;
      
      Object.entries(this.dataCollectionIndicators.tracking).forEach(([category, patterns]) => {
        patterns.forEach(pattern => {
          if (pattern.test(htmlContent)) {
            if (!dataTypes.behavioral.includes(category)) {
              dataTypes.behavioral.push(category);
            }
          }
        });
      });

    } catch (error) {
      console.error('Data type analysis failed:', error);
    }

    return dataTypes;
  }

  async _identifyCollectionMechanisms(document) {
    const mechanisms = {
      forms: 0,
      cookies: 0,
      localStorage: 0,
      tracking: 0,
      fingerprinting: 0
    };

    try {
      // Count forms
      mechanisms.forms = document.querySelectorAll('form').length;
      
      // Detect cookie usage
      const cookieScripts = document.querySelectorAll('script');
      cookieScripts.forEach(script => {
        const content = script.textContent || script.innerHTML || '';
        if (/document\.cookie|setCookie|getCookie/.test(content)) {
          mechanisms.cookies++;
        }
        if (/localStorage|sessionStorage/.test(content)) {
          mechanisms.localStorage++;
        }
      });

      // Detect tracking mechanisms
      const trackingPatterns = [/gtag|ga\(|analytics|track|pixel/];
      const htmlContent = document.documentElement.outerHTML;
      
      trackingPatterns.forEach(pattern => {
        if (pattern.test(htmlContent)) {
          mechanisms.tracking++;
        }
      });

    } catch (error) {
      console.error('Collection mechanism identification failed:', error);
    }

    return mechanisms;
  }

  // ============================================================================
  // HELPER METHODS - PRIVACY RISK ASSESSMENT
  // ============================================================================

  async _getThirdPartyServices(document) {
    const services = [];
    const currentDomain = this._getCurrentDomain(document);

    try {
      // Get external scripts
      const scripts = document.querySelectorAll('script[src]');
      scripts.forEach(script => {
        const src = script.getAttribute('src');
        if (this._isExternalUrl(src, currentDomain)) {
          services.push({
            url: src,
            type: 'script',
            domain: this._extractDomain(src)
          });
        }
      });

      // Get external resources
      const links = document.querySelectorAll('link[href]');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (this._isExternalUrl(href, currentDomain)) {
          services.push({
            url: href,
            type: 'resource',
            domain: this._extractDomain(href)
          });
        }
      });

    } catch (error) {
      console.error('Third-party service identification failed:', error);
    }

    return services;
  }

  async _assessServicePrivacyRisk(service) {
    const riskAssessment = {
      service: service.domain,
      url: service.url,
      riskLevel: 'unknown',
      riskScore: 0.5,
      concerns: [],
      dataTypes: [],
      compliance: {}
    };

    try {
      // Check against known privacy patterns
      for (const [riskLevel, services] of Object.entries(this.privacyPatterns)) {
        for (const [serviceName, config] of Object.entries(services)) {
          if (this._matchesServicePattern(service.url, config.patterns)) {
            riskAssessment.service = serviceName;
            riskAssessment.riskLevel = riskLevel.replace('Risk', '').toLowerCase();
            riskAssessment.riskScore = config.riskScore;
            riskAssessment.concerns = [...config.concerns];
            riskAssessment.dataTypes = [...config.dataTypes];
            riskAssessment.compliance = { ...config.compliance };
            return riskAssessment;
          }
        }
      }

      // Default assessment for unknown services
      riskAssessment.riskLevel = 'medium';
      riskAssessment.concerns = ['unknown_data_practices'];

    } catch (error) {
      console.error('Service privacy risk assessment failed:', error);
    }

    return riskAssessment;
  }

  // ============================================================================
  // HELPER METHODS - COOKIE ANALYSIS
  // ============================================================================

  async _detectCookieUsage(document) {
    const cookies = [];

    try {
      // Analyze scripts for cookie patterns
      const scripts = document.querySelectorAll('script');
      
      scripts.forEach(script => {
        const content = script.textContent || script.innerHTML || '';
        
        // Look for cookie setting patterns
        const cookieMatches = content.match(/document\.cookie\s*=\s*["']([^"']+)["']/g) || [];
        
        cookieMatches.forEach(match => {
          const cookieName = this._extractCookieName(match);
          if (cookieName) {
            cookies.push({
              name: cookieName,
              source: 'script',
              category: this._categorizeCookie(cookieName),
              riskLevel: this._assessCookieRisk(cookieName)
            });
          }
        });
      });

      // Check for common tracking cookies
      const commonCookies = ['_ga', '_gid', '_fbp', '_fbc', '__utma', '__utmb', '__utmc', '__utmz'];
      const htmlContent = document.documentElement.outerHTML;
      
      commonCookies.forEach(cookieName => {
        if (htmlContent.includes(cookieName)) {
          cookies.push({
            name: cookieName,
            source: 'detected',
            category: this._categorizeCookie(cookieName),
            riskLevel: this._assessCookieRisk(cookieName)
          });
        }
      });

    } catch (error) {
      console.error('Cookie detection failed:', error);
    }

    return cookies;
  }

  async _analyzeLocalStorageUsage(document) {
    const usage = [];

    try {
      const scripts = document.querySelectorAll('script');
      
      scripts.forEach(script => {
        const content = script.textContent || script.innerHTML || '';
        
        if (/localStorage\.setItem|localStorage\[/.test(content)) {
          usage.push({
            type: 'localStorage',
            purpose: 'data_storage',
            riskLevel: 'medium'
          });
        }
      });

    } catch (error) {
      console.error('Local storage analysis failed:', error);
    }

    return usage;
  }

  async _analyzeSessionStorageUsage(document) {
    const usage = [];

    try {
      const scripts = document.querySelectorAll('script');
      
      scripts.forEach(script => {
        const content = script.textContent || script.innerHTML || '';
        
        if (/sessionStorage\.setItem|sessionStorage\[/.test(content)) {
          usage.push({
            type: 'sessionStorage',
            purpose: 'session_data',
            riskLevel: 'low'
          });
        }
      });

    } catch (error) {
      console.error('Session storage analysis failed:', error);
    }

    return usage;
  }

  // ============================================================================
  // HELPER METHODS - TRACKING ANALYSIS
  // ============================================================================

  async _detectTrackingPixels(document) {
    const pixels = [];

    try {
      // Look for 1x1 images (common for tracking pixels)
      const images = document.querySelectorAll('img[width="1"][height="1"], img[style*="width:1px"], img[style*="height:1px"]');
      
      images.forEach(img => {
        const src = img.getAttribute('src');
        if (src) {
          pixels.push({
            type: 'tracking_pixel',
            url: src,
            domain: this._extractDomain(src),
            riskLevel: 'high'
          });
        }
      });

      // Look for noscript tracking images
      const noscriptTags = document.querySelectorAll('noscript');
      noscriptTags.forEach(noscript => {
        const content = noscript.innerHTML;
        const imgMatches = content.match(/<img[^>]+>/g) || [];
        
        imgMatches.forEach(imgTag => {
          const srcMatch = imgTag.match(/src=["']([^"']+)["']/);
          if (srcMatch) {
            pixels.push({
              type: 'noscript_pixel',
              url: srcMatch[1],
              domain: this._extractDomain(srcMatch[1]),
              riskLevel: 'high'
            });
          }
        });
      });

    } catch (error) {
      console.error('Tracking pixel detection failed:', error);
    }

    return pixels;
  }

  async _detectFingerprinting(document) {
    const fingerprinting = {
      canvas: false,
      webgl: false,
      audio: false,
      font: false,
      screen: false
    };

    try {
      const scripts = document.querySelectorAll('script');
      const htmlContent = document.documentElement.outerHTML;
      
      // Canvas fingerprinting
      if (/getContext\s*\(\s*["']2d["']\s*\)|toDataURL|getImageData/.test(htmlContent)) {
        fingerprinting.canvas = true;
      }

      // WebGL fingerprinting
      if (/getContext\s*\(\s*["']webgl["']\s*\)|getParameter/.test(htmlContent)) {
        fingerprinting.webgl = true;
      }

      // Audio fingerprinting
      if (/AudioContext|webkitAudioContext|createAnalyser/.test(htmlContent)) {
        fingerprinting.audio = true;
      }

      // Font fingerprinting
      if (/measureText|fontFamily|getComputedStyle/.test(htmlContent)) {
        fingerprinting.font = true;
      }

      // Screen fingerprinting
      if (/screen\.width|screen\.height|screen\.colorDepth/.test(htmlContent)) {
        fingerprinting.screen = true;
      }

    } catch (error) {
      console.error('Fingerprinting detection failed:', error);
    }

    return fingerprinting;
  }

  async _detectCrossSiteTracking(document) {
    const crossSite = [];

    try {
      // Look for third-party domains with tracking capabilities
      const thirdPartyDomains = this._getThirdPartyDomains(document);
      
      thirdPartyDomains.forEach(domain => {
        if (this._isKnownTracker(domain)) {
          crossSite.push({
            domain,
            type: 'cross_site_tracker',
            riskLevel: 'high'
          });
        }
      });

    } catch (error) {
      console.error('Cross-site tracking detection failed:', error);
    }

    return crossSite;
  }

  async _detectBehavioralTracking(document) {
    const behavioral = [];

    try {
      const htmlContent = document.documentElement.outerHTML;
      
      // Look for behavioral tracking patterns
      const behavioralPatterns = [
        { pattern: /scroll.*track|track.*scroll/i, type: 'scroll_tracking' },
        { pattern: /click.*track|track.*click/i, type: 'click_tracking' },
        { pattern: /mouse.*track|track.*mouse/i, type: 'mouse_tracking' },
        { pattern: /time.*track|track.*time/i, type: 'time_tracking' }
      ];

      behavioralPatterns.forEach(({ pattern, type }) => {
        if (pattern.test(htmlContent)) {
          behavioral.push({
            type,
            riskLevel: 'medium'
          });
        }
      });

    } catch (error) {
      console.error('Behavioral tracking detection failed:', error);
    }

    return behavioral;
  }

  // ============================================================================
  // HELPER METHODS - CONSENT ANALYSIS
  // ============================================================================

  async _detectConsentMechanisms(document) {
    const mechanisms = [];

    try {
      // Look for consent banners
      const bannerSelectors = [
        '[class*="cookie"]',
        '[class*="consent"]',
        '[class*="privacy"]',
        '[id*="cookie"]',
        '[id*="consent"]',
        '[id*="privacy"]'
      ];

      bannerSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (this._isConsentElement(element)) {
            mechanisms.push({
              type: 'banner',
              element: element.tagName.toLowerCase(),
              selector,
              visible: this._isElementVisible(element)
            });
          }
        });
      });

      // Check for consent in scripts
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => {
        const content = script.textContent || script.innerHTML || '';
        
        this.consentPatterns.banners.forEach(pattern => {
          if (pattern.test(content)) {
            mechanisms.push({
              type: 'script_based',
              pattern: pattern.toString(),
              element: 'script'
            });
          }
        });
      });

    } catch (error) {
      console.error('Consent mechanism detection failed:', error);
    }

    return mechanisms;
  }

  async _identifyConsentFrameworks(document) {
    const frameworks = [];

    try {
      const htmlContent = document.documentElement.outerHTML;
      
      this.consentPatterns.frameworks.forEach(framework => {
        if (framework.test(htmlContent)) {
          frameworks.push({
            name: framework.toString().replace(/[\/ig]/g, ''),
            type: 'consent_management_platform',
            detected: true
          });
        }
      });

    } catch (error) {
      console.error('Consent framework identification failed:', error);
    }

    return frameworks;
  }

  // ============================================================================
  // HELPER METHODS - UTILITIES
  // ============================================================================

  _identifyCollectorFromUrl(url) {
    if (!url) return null;

    // Check against known data collectors
    const collectors = {
      'google-analytics.com': { name: 'Google Analytics', type: 'analytics', risk: 'medium' },
      'facebook.com': { name: 'Facebook', type: 'social', risk: 'high' },
      'doubleclick.net': { name: 'Google DoubleClick', type: 'advertising', risk: 'high' },
      'hotjar.com': { name: 'Hotjar', type: 'analytics', risk: 'high' },
      'fullstory.com': { name: 'FullStory', type: 'analytics', risk: 'high' }
    };

    for (const [domain, config] of Object.entries(collectors)) {
      if (url.includes(domain)) {
        return config;
      }
    }

    return null;
  }

  _identifyInlineCollectors(content) {
    const collectors = [];

    // Google Analytics
    if (/gtag\(|ga\(/i.test(content)) {
      collectors.push({
        name: 'Google Analytics',
        type: 'analytics',
        risk: 'medium',
        source: 'inline'
      });
    }

    // Facebook Pixel
    if (/fbq\(/i.test(content)) {
      collectors.push({
        name: 'Facebook Pixel',
        type: 'advertising',
        risk: 'high',
        source: 'inline'
      });
    }

    return collectors;
  }

  _classifyInputDataType(input) {
    const name = (input.getAttribute('name') || '').toLowerCase();
    const type = (input.getAttribute('type') || '').toLowerCase();
    const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
    
    const text = `${name} ${type} ${placeholder}`;

    // Personal data patterns
    for (const [category, patterns] of Object.entries(this.dataCollectionIndicators.forms)) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          return {
            category,
            type: pattern.toString().replace(/[\/]/g, '')
          };
        }
      }
    }

    return null;
  }

  _matchesServicePattern(url, patterns) {
    return patterns.some(pattern => pattern.test(url));
  }

  _getCurrentDomain(document) {
    try {
      if (document.location) {
        return document.location.hostname;
      }
      return 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  _isExternalUrl(url, currentDomain) {
    try {
      if (!url || url.startsWith('/') || url.startsWith('#')) {
        return false;
      }
      
      const urlObj = new URL(url);
      return urlObj.hostname !== currentDomain;
    } catch (error) {
      return false;
    }
  }

  _extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch (error) {
      return 'unknown';
    }
  }

  _categorizeCookie(cookieName) {
    for (const [category, config] of Object.entries(this.cookiePatterns)) {
      if (config.patterns.some(pattern => pattern.test(cookieName))) {
        return config.category;
      }
    }
    return 'unknown';
  }

  _assessCookieRisk(cookieName) {
    for (const config of Object.values(this.cookiePatterns)) {
      if (config.patterns.some(pattern => pattern.test(cookieName))) {
        return config.riskLevel;
      }
    }
    return 'medium';
  }

  _extractCookieName(cookieString) {
    const match = cookieString.match(/["']([^=]+)=/);
    return match ? match[1] : null;
  }

  _getThirdPartyDomains(document) {
    const domains = new Set();
    const currentDomain = this._getCurrentDomain(document);

    // Get all external URLs
    const allUrls = this._getAllUrls(document);
    
    allUrls.forEach(url => {
      try {
        const domain = new URL(url).hostname;
        if (domain !== currentDomain) {
          domains.add(domain);
        }
      } catch (error) {
        // Invalid URL, skip
      }
    });

    return Array.from(domains);
  }

  _getAllUrls(document) {
    const urls = [];
    
    // Scripts
    document.querySelectorAll('script[src]').forEach(script => {
      urls.push(script.getAttribute('src'));
    });
    
    // Links
    document.querySelectorAll('link[href]').forEach(link => {
      urls.push(link.getAttribute('href'));
    });
    
    // Images
    document.querySelectorAll('img[src]').forEach(img => {
      urls.push(img.getAttribute('src'));
    });
    
    return urls.filter(url => url && url.startsWith('http'));
  }

  _isKnownTracker(domain) {
    const knownTrackers = [
      'google-analytics.com',
      'googletagmanager.com',
      'facebook.com',
      'doubleclick.net',
      'googlesyndication.com'
    ];
    
    return knownTrackers.some(tracker => domain.includes(tracker));
  }

  _isConsentElement(element) {
    const text = element.textContent || '';
    const consentKeywords = ['cookie', 'consent', 'privacy', 'accept', 'decline', 'gdpr'];
    
    return consentKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
  }

  _isElementVisible(element) {
    try {
      const style = element.style;
      return style.display !== 'none' && style.visibility !== 'hidden';
    } catch (error) {
      return true; // Assume visible if can't determine
    }
  }

  _assessDataCollectionRisk(dataCollection) {
    const totalCollectors = dataCollection.collectors.length;
    const riskScore = Math.min(1, totalCollectors * 0.1);
    
    return {
      score: riskScore,
      level: riskScore >= 0.7 ? 'high' : riskScore >= 0.4 ? 'medium' : 'low',
      factors: {
        collectorCount: totalCollectors,
        dataTypes: Object.keys(dataCollection.types).length,
        mechanisms: Object.keys(dataCollection.mechanisms).length
      }
    };
  }

  _categorizePrivacyRisks(services) {
    const categories = {
      high: [],
      medium: [],
      low: [],
      unknown: []
    };

    services.forEach(service => {
      const category = service.riskLevel || 'unknown';
      if (categories[category]) {
        categories[category].push(service);
      }
    });

    return categories;
  }

  _calculateOverallPrivacyRisk(services) {
    if (services.length === 0) {
      return { score: 0, level: 'low' };
    }

    const scores = services.map(s => s.riskScore || 0.5);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return {
      score: averageScore,
      level: averageScore >= 0.7 ? 'high' : averageScore >= 0.4 ? 'medium' : 'low',
      serviceCount: services.length,
      highRiskServices: services.filter(s => s.riskScore >= 0.7).length
    };
  }

  _generatePrivacyRecommendations(risks) {
    const recommendations = [];

    if (risks.categories.high.length > 0) {
      recommendations.push({
        type: 'reduce_high_risk_services',
        priority: 'high',
        description: `${risks.categories.high.length} high-risk services detected`,
        action: 'Review and remove unnecessary high-risk third-party services'
      });
    }

    if (risks.overall.score > 0.6) {
      recommendations.push({
        type: 'implement_consent_management',
        priority: 'high',
        description: 'High overall privacy risk detected',
        action: 'Implement comprehensive consent management system'
      });
    }

    return recommendations;
  }

  _categorizeCookies(cookies) {
    const categories = {
      essential: [],
      performance: [],
      functional: [],
      targeting: [],
      social: []
    };

    cookies.forEach(cookie => {
      const category = cookie.category || 'unknown';
      if (categories[category]) {
        categories[category].push(cookie);
      }
    });

    return categories;
  }

  _identifyThirdPartyCookies(cookies) {
    return cookies.filter(cookie => 
      ['tracking', 'targeting', 'social'].includes(cookie.category)
    );
  }

  _assessConsentCompliance(consent, context) {
    const compliance = {};

    this.options.regulatoryFrameworks.forEach(framework => {
      compliance[framework] = {
        consentDetected: consent.detected,
        frameworkDetected: consent.frameworks.length > 0,
        compliant: consent.detected && consent.frameworks.length > 0,
        issues: []
      };

      if (!consent.detected) {
        compliance[framework].issues.push('No consent mechanism detected');
      }
    });

    return compliance;
  }

  _evaluateConsentEffectiveness(consent) {
    return {
      score: consent.detected ? 0.8 : 0.2,
      factors: {
        mechanismDetected: consent.detected,
        frameworkUsed: consent.frameworks.length > 0,
        visibleToUser: consent.mechanisms.some(m => m.visible)
      }
    };
  }

  async _assessFrameworkCompliance(framework, document, context) {
    const compliance = {
      framework,
      compliant: false,
      issues: [],
      recommendations: []
    };

    // Basic compliance checks based on framework
    switch (framework) {
      case 'GDPR':
        compliance = await this._assessGDPRCompliance(document, context);
        break;
      case 'CCPA':
        compliance = await this._assessCCPACompliance(document, context);
        break;
      case 'PIPEDA':
        compliance = await this._assessPIPEDACompliance(document, context);
        break;
    }

    return compliance;
  }

  async _assessGDPRCompliance(document, context) {
    return {
      framework: 'GDPR',
      compliant: false,
      issues: ['Automated GDPR compliance assessment not implemented'],
      recommendations: ['Conduct manual GDPR compliance review']
    };
  }

  async _assessCCPACompliance(document, context) {
    return {
      framework: 'CCPA',
      compliant: false,
      issues: ['Automated CCPA compliance assessment not implemented'],
      recommendations: ['Conduct manual CCPA compliance review']
    };
  }

  async _assessPIPEDACompliance(document, context) {
    return {
      framework: 'PIPEDA',
      compliant: false,
      issues: ['Automated PIPEDA compliance assessment not implemented'],
      recommendations: ['Conduct manual PIPEDA compliance review']
    };
  }

  async _identifyDataDestinations(document) {
    // Placeholder implementation
    return [];
  }

  _detectCrossBorderTransfers(destinations) {
    // Placeholder implementation
    return [];
  }

  async _analyzeDataRetention(document, context) {
    // Placeholder implementation
    return {};
  }

  async _detectDataSharing(document, context) {
    // Placeholder implementation
    return [];
  }

  _generatePrivacySummary(results) {
    return {
      overallRiskLevel: results.privacyRisks?.overall?.level || 'unknown',
      dataCollectors: results.dataCollection?.collectors?.length || 0,
      trackingMechanisms: Object.keys(results.tracking || {}).length,
      consentMechanisms: results.consent?.mechanisms?.length || 0,
      complianceIssues: this._countComplianceIssues(results.compliance),
      recommendations: results.privacyRisks?.recommendations?.length || 0
    };
  }

  _countComplianceIssues(compliance) {
    if (!compliance) return 0;
    
    return Object.values(compliance).reduce((total, framework) => {
      return total + (framework.issues?.length || 0);
    }, 0);
  }
}

export default PrivacyAnalysisDetector;
