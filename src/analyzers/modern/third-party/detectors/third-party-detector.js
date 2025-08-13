/**
 * ============================================================================
 * THIRD-PARTY DETECTOR - GPT-5 STYLE COMPONENT
 * ============================================================================
 * 
 * Advanced third-party service detection and categorization
 * Part of Third-Party Analyzer Combined Approach (12th Implementation)
 * 
 * Capabilities:
 * - Comprehensive third-party service detection
 * - Service categorization and classification
 * - Resource type analysis (scripts, stylesheets, images, etc.)
 * - Service provider identification
 * - External dependency mapping
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration GPT-5 Style Detector
 * @created 2025-08-13
 */

export class ThirdPartyDetector {
  constructor(options = {}) {
    this.options = {
      // Detection Configuration
      detectionDepth: options.detectionDepth || 'comprehensive',
      enableAdvancedDetection: options.enableAdvancedDetection !== false,
      enableDomainAnalysis: options.enableDomainAnalysis !== false,
      enableResourceTracking: options.enableResourceTracking !== false,
      
      // Detection Thresholds
      minResourceSize: options.minResourceSize || 1024, // 1KB minimum
      maxAnalysisTime: options.maxAnalysisTime || 30000, // 30 seconds
      confidenceThreshold: options.confidenceThreshold || 0.7, // 70% confidence
      
      // Service Categories
      enabledCategories: options.enabledCategories || [
        'analytics', 'advertising', 'social', 'cdn', 'utilities', 'tracking', 'marketing'
      ],
      
      ...options
    };

    this.detectorType = 'third_party_detector';
    this.version = '1.0.0';
    
    // Third-party service definitions
    this.servicePatterns = {
      // Analytics Services
      analytics: {
        'Google Analytics': {
          patterns: [/google-analytics\.com/, /googletagmanager\.com/, /gtag/, /ga\(/],
          confidence: 0.95,
          category: 'analytics',
          impact: 'medium',
          privacy: 'medium'
        },
        'Adobe Analytics': {
          patterns: [/omniture\.com/, /2o7\.net/, /adobe\.com\/.*analytics/],
          confidence: 0.9,
          category: 'analytics',
          impact: 'medium',
          privacy: 'medium'
        },
        'Hotjar': {
          patterns: [/hotjar\.com/, /hj\(/],
          confidence: 0.9,
          category: 'analytics',
          impact: 'low',
          privacy: 'high'
        },
        'Mixpanel': {
          patterns: [/mixpanel\.com/, /api\.mixpanel\.com/],
          confidence: 0.9,
          category: 'analytics',
          impact: 'low',
          privacy: 'medium'
        },
        'Segment': {
          patterns: [/segment\.(io|com)/, /analytics\.js/],
          confidence: 0.85,
          category: 'analytics',
          impact: 'medium',
          privacy: 'medium'
        }
      },

      // Advertising Services
      advertising: {
        'Google Ads': {
          patterns: [/googleadservices\.com/, /googlesyndication\.com/, /doubleclick\.net/],
          confidence: 0.95,
          category: 'advertising',
          impact: 'medium',
          privacy: 'low'
        },
        'Facebook Ads': {
          patterns: [/facebook\.com\/tr/, /connect\.facebook\.net.*fbevents/],
          confidence: 0.9,
          category: 'advertising',
          impact: 'medium',
          privacy: 'low'
        },
        'Amazon Advertising': {
          patterns: [/amazon-adsystem\.com/, /amazonaws\.com.*ads/],
          confidence: 0.85,
          category: 'advertising',
          impact: 'medium',
          privacy: 'medium'
        },
        'Twitter Ads': {
          patterns: [/ads-twitter\.com/, /analytics\.twitter\.com/],
          confidence: 0.85,
          category: 'advertising',
          impact: 'low',
          privacy: 'medium'
        }
      },

      // Social Media Services
      social: {
        'Facebook SDK': {
          patterns: [/connect\.facebook\.net/, /graph\.facebook\.com/],
          confidence: 0.9,
          category: 'social',
          impact: 'medium',
          privacy: 'low'
        },
        'Twitter Widget': {
          patterns: [/platform\.twitter\.com/, /syndication\.twitter\.com/],
          confidence: 0.85,
          category: 'social',
          impact: 'low',
          privacy: 'medium'
        },
        'YouTube Embed': {
          patterns: [/youtube\.com\/embed/, /ytimg\.com/],
          confidence: 0.9,
          category: 'social',
          impact: 'medium',
          privacy: 'medium'
        },
        'LinkedIn Widget': {
          patterns: [/platform\.linkedin\.com/, /ads\.linkedin\.com/],
          confidence: 0.85,
          category: 'social',
          impact: 'low',
          privacy: 'medium'
        }
      },

      // CDN Services
      cdn: {
        'Cloudflare': {
          patterns: [/cloudflare\.com/, /cdnjs\.cloudflare\.com/],
          confidence: 0.95,
          category: 'cdn',
          impact: 'positive',
          privacy: 'high'
        },
        'Amazon CloudFront': {
          patterns: [/cloudfront\.net/, /amazonaws\.com/],
          confidence: 0.9,
          category: 'cdn',
          impact: 'positive',
          privacy: 'high'
        },
        'Google CDN': {
          patterns: [/googleapis\.com/, /gstatic\.com/],
          confidence: 0.9,
          category: 'cdn',
          impact: 'positive',
          privacy: 'medium'
        },
        'jsDelivr': {
          patterns: [/jsdelivr\.net/],
          confidence: 0.95,
          category: 'cdn',
          impact: 'positive',
          privacy: 'high'
        }
      },

      // Utility Services
      utilities: {
        'reCAPTCHA': {
          patterns: [/recaptcha\.net/, /gstatic\.com.*recaptcha/],
          confidence: 0.95,
          category: 'utilities',
          impact: 'low',
          privacy: 'medium'
        },
        'Stripe': {
          patterns: [/js\.stripe\.com/, /api\.stripe\.com/],
          confidence: 0.95,
          category: 'utilities',
          impact: 'low',
          privacy: 'high'
        },
        'PayPal': {
          patterns: [/paypal\.com.*js/, /paypalobjects\.com/],
          confidence: 0.9,
          category: 'utilities',
          impact: 'low',
          privacy: 'medium'
        }
      },

      // Tracking Services
      tracking: {
        'Crazy Egg': {
          patterns: [/crazyegg\.com/],
          confidence: 0.9,
          category: 'tracking',
          impact: 'low',
          privacy: 'medium'
        },
        'FullStory': {
          patterns: [/fullstory\.com/],
          confidence: 0.9,
          category: 'tracking',
          impact: 'high',
          privacy: 'low'
        },
        'LogRocket': {
          patterns: [/logrocket\.com/],
          confidence: 0.85,
          category: 'tracking',
          impact: 'medium',
          privacy: 'low'
        }
      }
    };

    // Resource type patterns
    this.resourcePatterns = {
      scripts: /\.(js|jsx|ts|tsx)(\?.*)?$/i,
      stylesheets: /\.(css|scss|sass|less)(\?.*)?$/i,
      images: /\.(jpg|jpeg|png|gif|svg|webp|ico)(\?.*)?$/i,
      fonts: /\.(woff|woff2|ttf|eot|otf)(\?.*)?$/i,
      videos: /\.(mp4|webm|ogg|avi|mov)(\?.*)?$/i,
      documents: /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)(\?.*)?$/i
    };

    // Domain classification patterns
    this.domainPatterns = {
      development: /localhost|127\.0\.0\.1|dev\.|staging\.|test\./i,
      cdn: /cdn\.|static\.|assets\./i,
      api: /api\.|service\.|gateway\./i,
      analytics: /analytics\.|tracking\.|stats\./i,
      advertising: /ads\.|ad\.|marketing\./i
    };
    
    console.log('🔍 Third-Party Detector initialized (GPT-5 Style)');
  }

  /**
   * Get detector metadata
   * @returns {Object} Detector metadata and capabilities
   */
  getMetadata() {
    return {
      name: 'ThirdPartyDetector',
      type: this.detectorType,
      version: this.version,
      description: 'Advanced third-party service detection and categorization',
      
      capabilities: [
        'service_detection',
        'service_categorization',
        'resource_type_analysis',
        'domain_classification',
        'dependency_mapping',
        'performance_impact_assessment',
        'privacy_risk_evaluation'
      ],
      
      detectionTypes: [
        'analytics_services',
        'advertising_platforms',
        'social_media_widgets',
        'cdn_services',
        'utility_services',
        'tracking_services',
        'marketing_tools'
      ],
      
      configuration: {
        detectionDepth: this.options.detectionDepth,
        enabledCategories: this.options.enabledCategories,
        confidenceThreshold: this.options.confidenceThreshold
      },
      
      thresholds: {
        minResourceSize: this.options.minResourceSize,
        maxAnalysisTime: this.options.maxAnalysisTime,
        confidenceThreshold: this.options.confidenceThreshold
      },
      
      servicePatterns: Object.keys(this.servicePatterns).length,
      approach: 'GPT-5 Style Detection'
    };
  }

  /**
   * Main detection method - comprehensive third-party analysis
   * @param {Object} document - Document object to analyze
   * @param {Object} context - Analysis context and configuration
   * @returns {Promise<Object>} Third-party detection results
   */
  async analyze(document, context = {}) {
    try {
      const startTime = Date.now();
      
      if (!document) {
        throw new Error('Document is required for third-party detection');
      }

      console.log('🔍 Starting third-party service detection...');

      // Core Detection Analysis
      const results = {
        success: true,
        timestamp: new Date().toISOString(),
        
        // Service Detection
        services: await this._detectServices(document, context),
        
        // Resource Analysis
        resources: this.options.enableResourceTracking ?
          await this._analyzeResources(document, context) : null,
        
        // Domain Analysis
        domains: this.options.enableDomainAnalysis ?
          await this._analyzeDomains(document, context) : null,
        
        // Categorization
        categories: await this._categorizeServices(document, context),
        
        // Impact Assessment
        impact: await this._assessImpact(document, context),
        
        // Detection Summary
        summary: {},
        
        executionTime: Date.now() - startTime
      };

      // Generate detection summary
      results.summary = this._generateDetectionSummary(results);
      
      console.log(`✅ Third-party detection completed in ${results.executionTime}ms`);
      console.log(`📊 Services detected: ${results.summary.totalServices || 0}`);
      console.log(`📂 Categories found: ${results.summary.totalCategories || 0}`);
      
      return results;

    } catch (error) {
      console.error('❌ Third-party detection failed:', error);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        executionTime: Date.now() - (startTime || Date.now())
      };
    }
  }

  /**
   * Detect third-party services in the document
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Service detection results
   */
  async _detectServices(document, context) {
    const services = {
      detected: [],
      external: [],
      internal: [],
      total: 0,
      byCategory: {}
    };

    try {
      // Get current domain for internal/external classification
      const currentDomain = this._getCurrentDomain(document, context);

      // Detect services in scripts
      const scriptServices = await this._detectScriptServices(document, currentDomain);
      services.detected.push(...scriptServices);

      // Detect services in links and stylesheets
      const linkServices = await this._detectLinkServices(document, currentDomain);
      services.detected.push(...linkServices);

      // Detect services in images and media
      const mediaServices = await this._detectMediaServices(document, currentDomain);
      services.detected.push(...mediaServices);

      // Detect services in inline content
      if (this.options.enableAdvancedDetection) {
        const inlineServices = await this._detectInlineServices(document, currentDomain);
        services.detected.push(...inlineServices);
      }

      // Classify services as internal/external
      services.detected.forEach(service => {
        if (service.isExternal) {
          services.external.push(service);
        } else {
          services.internal.push(service);
        }
      });

      // Group by category
      services.byCategory = this._groupServicesByCategory(services.detected);
      services.total = services.detected.length;

    } catch (error) {
      console.error('Service detection failed:', error);
    }

    return services;
  }

  /**
   * Analyze resource types and characteristics
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Resource analysis results
   */
  async _analyzeResources(document, context) {
    const resources = {
      byType: {},
      sizes: {},
      loading: {},
      total: 0
    };

    try {
      // Analyze scripts
      resources.byType.scripts = await this._analyzeScriptResources(document);
      
      // Analyze stylesheets
      resources.byType.stylesheets = await this._analyzeStylesheetResources(document);
      
      // Analyze images
      resources.byType.images = await this._analyzeImageResources(document);
      
      // Analyze fonts
      resources.byType.fonts = await this._analyzeFontResources(document);
      
      // Calculate totals
      resources.total = Object.values(resources.byType)
        .reduce((sum, typeData) => sum + (typeData.count || 0), 0);

      // Analyze resource sizes
      resources.sizes = this._analyzeResourceSizes(resources.byType);
      
      // Analyze loading characteristics
      resources.loading = this._analyzeLoadingCharacteristics(resources.byType);

    } catch (error) {
      console.error('Resource analysis failed:', error);
    }

    return resources;
  }

  /**
   * Analyze domains and their characteristics
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Domain analysis results
   */
  async _analyzeDomains(document, context) {
    const domains = {
      external: new Set(),
      internal: new Set(),
      classification: {},
      geographic: {},
      trustLevel: {}
    };

    try {
      // Extract all domains from resources
      const allUrls = this._extractAllUrls(document);
      const currentDomain = this._getCurrentDomain(document, context);

      allUrls.forEach(url => {
        try {
          const urlObj = new URL(url);
          const domain = urlObj.hostname;

          // Classify as internal/external
          if (this._isDomainExternal(domain, currentDomain)) {
            domains.external.add(domain);
          } else {
            domains.internal.add(domain);
          }

          // Classify domain type
          domains.classification[domain] = this._classifyDomain(domain);
          
          // Assess trust level
          domains.trustLevel[domain] = this._assessDomainTrust(domain);

        } catch (error) {
          console.warn(`Invalid URL: ${url}`);
        }
      });

      // Convert sets to arrays for serialization
      domains.external = Array.from(domains.external);
      domains.internal = Array.from(domains.internal);

    } catch (error) {
      console.error('Domain analysis failed:', error);
    }

    return domains;
  }

  /**
   * Categorize detected services
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Service categorization results
   */
  async _categorizeServices(document, context) {
    const categories = {
      analytics: [],
      advertising: [],
      social: [],
      cdn: [],
      utilities: [],
      tracking: [],
      marketing: [],
      unknown: []
    };

    try {
      // Get detected services
      const services = await this._detectServices(document, context);
      
      // Categorize each service
      services.detected.forEach(service => {
        const category = service.category || 'unknown';
        if (categories[category]) {
          categories[category].push(service);
        } else {
          categories.unknown.push(service);
        }
      });

      // Add category statistics
      Object.keys(categories).forEach(category => {
        categories[`${category}Count`] = categories[category].length;
      });

    } catch (error) {
      console.error('Service categorization failed:', error);
    }

    return categories;
  }

  /**
   * Assess impact of detected third-party services
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Impact assessment results
   */
  async _assessImpact(document, context) {
    const impact = {
      performance: {},
      privacy: {},
      security: {},
      maintenance: {},
      overall: {}
    };

    try {
      // Performance impact assessment
      impact.performance = await this._assessPerformanceImpact(document, context);
      
      // Privacy impact assessment
      impact.privacy = await this._assessPrivacyImpact(document, context);
      
      // Security impact assessment
      impact.security = await this._assessSecurityImpact(document, context);
      
      // Maintenance impact assessment
      impact.maintenance = await this._assessMaintenanceImpact(document, context);
      
      // Overall impact calculation
      impact.overall = this._calculateOverallImpact(impact);

    } catch (error) {
      console.error('Impact assessment failed:', error);
    }

    return impact;
  }

  // ============================================================================
  // HELPER METHODS - SERVICE DETECTION
  // ============================================================================

  async _detectScriptServices(document, currentDomain) {
    const services = [];

    try {
      const scripts = document.querySelectorAll('script[src]');
      
      scripts.forEach(script => {
        const src = script.getAttribute('src');
        if (src) {
          const service = this._identifyServiceFromUrl(src, 'script');
          if (service) {
            service.element = 'script';
            service.isExternal = this._isUrlExternal(src, currentDomain);
            service.async = script.hasAttribute('async');
            service.defer = script.hasAttribute('defer');
            services.push(service);
          }
        }
      });

      // Check inline scripts for service patterns
      const inlineScripts = document.querySelectorAll('script:not([src])');
      inlineScripts.forEach(script => {
        const content = script.textContent || script.innerHTML;
        const inlineServices = this._detectInlineScriptServices(content);
        services.push(...inlineServices);
      });

    } catch (error) {
      console.error('Script service detection failed:', error);
    }

    return services;
  }

  async _detectLinkServices(document, currentDomain) {
    const services = [];

    try {
      const links = document.querySelectorAll('link[href]');
      
      links.forEach(link => {
        const href = link.getAttribute('href');
        const rel = link.getAttribute('rel');
        
        if (href) {
          const service = this._identifyServiceFromUrl(href, 'link');
          if (service) {
            service.element = 'link';
            service.rel = rel;
            service.isExternal = this._isUrlExternal(href, currentDomain);
            services.push(service);
          }
        }
      });

    } catch (error) {
      console.error('Link service detection failed:', error);
    }

    return services;
  }

  async _detectMediaServices(document, currentDomain) {
    const services = [];

    try {
      // Images
      const images = document.querySelectorAll('img[src]');
      images.forEach(img => {
        const src = img.getAttribute('src');
        if (src) {
          const service = this._identifyServiceFromUrl(src, 'image');
          if (service) {
            service.element = 'img';
            service.isExternal = this._isUrlExternal(src, currentDomain);
            services.push(service);
          }
        }
      });

      // Iframes
      const iframes = document.querySelectorAll('iframe[src]');
      iframes.forEach(iframe => {
        const src = iframe.getAttribute('src');
        if (src) {
          const service = this._identifyServiceFromUrl(src, 'iframe');
          if (service) {
            service.element = 'iframe';
            service.isExternal = this._isUrlExternal(src, currentDomain);
            services.push(service);
          }
        }
      });

    } catch (error) {
      console.error('Media service detection failed:', error);
    }

    return services;
  }

  async _detectInlineServices(document, currentDomain) {
    const services = [];

    try {
      // Check for service-specific inline code patterns
      const htmlContent = document.documentElement.outerHTML;
      
      // Google Analytics patterns
      if (/gtag\(|ga\(|GoogleAnalyticsObject/.test(htmlContent)) {
        services.push({
          name: 'Google Analytics',
          category: 'analytics',
          type: 'inline',
          confidence: 0.9,
          isExternal: true
        });
      }

      // Facebook Pixel patterns
      if (/fbevents\.js|fbq\(/.test(htmlContent)) {
        services.push({
          name: 'Facebook Pixel',
          category: 'advertising',
          type: 'inline',
          confidence: 0.9,
          isExternal: true
        });
      }

      // More pattern detection can be added here

    } catch (error) {
      console.error('Inline service detection failed:', error);
    }

    return services;
  }

  _identifyServiceFromUrl(url, resourceType) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const pathname = urlObj.pathname;
      const fullUrl = url.toLowerCase();

      // Check against service patterns
      for (const [category, services] of Object.entries(this.servicePatterns)) {
        for (const [serviceName, serviceConfig] of Object.entries(services)) {
          for (const pattern of serviceConfig.patterns) {
            if (pattern.test(fullUrl) || pattern.test(hostname) || pattern.test(pathname)) {
              return {
                name: serviceName,
                category: serviceConfig.category,
                url,
                hostname,
                confidence: serviceConfig.confidence,
                impact: serviceConfig.impact,
                privacy: serviceConfig.privacy,
                type: resourceType
              };
            }
          }
        }
      }

      // If no specific service identified, classify as generic external service
      return {
        name: hostname,
        category: 'unknown',
        url,
        hostname,
        confidence: 0.5,
        impact: 'unknown',
        privacy: 'unknown',
        type: resourceType
      };

    } catch (error) {
      console.warn(`Failed to parse URL: ${url}`);
      return null;
    }
  }

  _detectInlineScriptServices(content) {
    const services = [];

    // Google Analytics detection
    if (/gtag\(|ga\(|GoogleAnalyticsObject/.test(content)) {
      services.push({
        name: 'Google Analytics',
        category: 'analytics',
        type: 'inline',
        confidence: 0.85,
        isExternal: true
      });
    }

    // Facebook Pixel detection
    if (/fbq\(|facebook.*pixel/i.test(content)) {
      services.push({
        name: 'Facebook Pixel',
        category: 'advertising',
        type: 'inline',
        confidence: 0.85,
        isExternal: true
      });
    }

    return services;
  }

  // ============================================================================
  // HELPER METHODS - RESOURCE ANALYSIS
  // ============================================================================

  async _analyzeScriptResources(document) {
    const scripts = {
      total: 0,
      external: 0,
      internal: 0,
      async: 0,
      defer: 0,
      inline: 0,
      resources: []
    };

    const scriptElements = document.querySelectorAll('script');
    
    scriptElements.forEach(script => {
      const src = script.getAttribute('src');
      
      if (src) {
        scripts.total++;
        scripts.resources.push({
          url: src,
          async: script.hasAttribute('async'),
          defer: script.hasAttribute('defer'),
          type: script.getAttribute('type') || 'text/javascript'
        });
        
        if (script.hasAttribute('async')) scripts.async++;
        if (script.hasAttribute('defer')) scripts.defer++;
      } else {
        scripts.inline++;
      }
    });

    return scripts;
  }

  async _analyzeStylesheetResources(document) {
    const stylesheets = {
      total: 0,
      external: 0,
      internal: 0,
      inline: 0,
      resources: []
    };

    // External stylesheets
    const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
    linkElements.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        stylesheets.total++;
        stylesheets.external++;
        stylesheets.resources.push({
          url: href,
          media: link.getAttribute('media') || 'all'
        });
      }
    });

    // Inline styles
    const styleElements = document.querySelectorAll('style');
    stylesheets.inline = styleElements.length;
    stylesheets.total += stylesheets.inline;

    return stylesheets;
  }

  async _analyzeImageResources(document) {
    const images = {
      total: 0,
      external: 0,
      internal: 0,
      formats: {},
      resources: []
    };

    const imgElements = document.querySelectorAll('img[src]');
    
    imgElements.forEach(img => {
      const src = img.getAttribute('src');
      if (src) {
        images.total++;
        
        // Detect format
        const format = this._detectImageFormat(src);
        images.formats[format] = (images.formats[format] || 0) + 1;
        
        images.resources.push({
          url: src,
          alt: img.getAttribute('alt') || '',
          format,
          loading: img.getAttribute('loading') || 'eager'
        });
      }
    });

    return images;
  }

  async _analyzeFontResources(document) {
    const fonts = {
      total: 0,
      external: 0,
      preloaded: 0,
      resources: []
    };

    // Font links
    const fontLinks = document.querySelectorAll('link[href*="font"], link[href*=".woff"], link[href*=".ttf"]');
    fontLinks.forEach(link => {
      fonts.total++;
      if (link.getAttribute('rel') === 'preload') fonts.preloaded++;
      
      fonts.resources.push({
        url: link.getAttribute('href'),
        rel: link.getAttribute('rel'),
        type: link.getAttribute('type') || 'font'
      });
    });

    return fonts;
  }

  // ============================================================================
  // HELPER METHODS - IMPACT ASSESSMENT
  // ============================================================================

  async _assessPerformanceImpact(document, context) {
    const performance = {
      score: 0,
      blocking: 0,
      nonBlocking: 0,
      estimatedImpact: 'low',
      details: {}
    };

    try {
      // Count blocking scripts
      const scripts = document.querySelectorAll('script[src]:not([async]):not([defer])');
      performance.blocking = scripts.length;

      // Count non-blocking scripts
      const asyncScripts = document.querySelectorAll('script[async], script[defer]');
      performance.nonBlocking = asyncScripts.length;

      // Calculate performance impact score
      performance.score = this._calculatePerformanceScore(performance.blocking, performance.nonBlocking);
      performance.estimatedImpact = this._getPerformanceImpactLevel(performance.score);

    } catch (error) {
      console.error('Performance impact assessment failed:', error);
    }

    return performance;
  }

  async _assessPrivacyImpact(document, context) {
    const privacy = {
      score: 0,
      trackingServices: 0,
      dataCollectors: 0,
      riskLevel: 'low',
      concerns: []
    };

    try {
      // Detect tracking services
      const trackingPatterns = [
        /google-analytics/i,
        /facebook.*pixel/i,
        /hotjar/i,
        /fullstory/i,
        /crazyegg/i
      ];

      const htmlContent = document.documentElement.outerHTML;
      
      trackingPatterns.forEach(pattern => {
        if (pattern.test(htmlContent)) {
          privacy.trackingServices++;
        }
      });

      // Calculate privacy risk score
      privacy.score = Math.min(1, privacy.trackingServices * 0.2);
      privacy.riskLevel = this._getPrivacyRiskLevel(privacy.score);

    } catch (error) {
      console.error('Privacy impact assessment failed:', error);
    }

    return privacy;
  }

  async _assessSecurityImpact(document, context) {
    const security = {
      score: 1.0,
      insecureConnections: 0,
      unknownServices: 0,
      riskLevel: 'low',
      vulnerabilities: []
    };

    try {
      // Check for insecure connections
      const httpResources = document.querySelectorAll('[src^="http:"], [href^="http:"]');
      security.insecureConnections = httpResources.length;

      // Adjust security score based on findings
      if (security.insecureConnections > 0) {
        security.score -= security.insecureConnections * 0.1;
      }

      security.score = Math.max(0, security.score);
      security.riskLevel = this._getSecurityRiskLevel(security.score);

    } catch (error) {
      console.error('Security impact assessment failed:', error);
    }

    return security;
  }

  async _assessMaintenanceImpact(document, context) {
    const maintenance = {
      score: 0.8,
      externalDependencies: 0,
      complexityLevel: 'medium',
      updateRisk: 'medium'
    };

    try {
      // Count external dependencies
      const services = await this._detectServices(document, context);
      maintenance.externalDependencies = services.external.length;

      // Assess complexity based on service count
      maintenance.complexityLevel = this._getComplexityLevel(maintenance.externalDependencies);

    } catch (error) {
      console.error('Maintenance impact assessment failed:', error);
    }

    return maintenance;
  }

  // ============================================================================
  // HELPER METHODS - UTILITIES
  // ============================================================================

  _getCurrentDomain(document, context) {
    try {
      // Try to get domain from context or document
      if (context.url) {
        return new URL(context.url).hostname;
      }
      
      if (document.location) {
        return document.location.hostname;
      }
      
      // Fallback: extract from base tag or canonical link
      const baseTag = document.querySelector('base[href]');
      if (baseTag) {
        return new URL(baseTag.getAttribute('href')).hostname;
      }
      
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        return new URL(canonical.getAttribute('href')).hostname;
      }
      
      return 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  _isUrlExternal(url, currentDomain) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname !== currentDomain && 
             !urlObj.hostname.endsWith(`.${currentDomain}`);
    } catch (error) {
      return false;
    }
  }

  _isDomainExternal(domain, currentDomain) {
    return domain !== currentDomain && !domain.endsWith(`.${currentDomain}`);
  }

  _extractAllUrls(document) {
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
    
    // Iframes
    document.querySelectorAll('iframe[src]').forEach(iframe => {
      urls.push(iframe.getAttribute('src'));
    });
    
    return urls.filter(url => url && url.startsWith('http'));
  }

  _classifyDomain(domain) {
    for (const [type, pattern] of Object.entries(this.domainPatterns)) {
      if (pattern.test(domain)) {
        return type;
      }
    }
    return 'general';
  }

  _assessDomainTrust(domain) {
    // Simplified trust assessment
    const trustedDomains = [
      'googleapis.com', 'gstatic.com', 'cloudflare.com', 
      'jsdelivr.net', 'unpkg.com', 'cdnjs.cloudflare.com'
    ];
    
    if (trustedDomains.some(trusted => domain.includes(trusted))) {
      return 'high';
    }
    
    return 'medium';
  }

  _groupServicesByCategory(services) {
    const grouped = {};
    
    services.forEach(service => {
      const category = service.category || 'unknown';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(service);
    });
    
    return grouped;
  }

  _analyzeResourceSizes(resourcesByType) {
    // Placeholder for size analysis
    return {
      estimated: true,
      total: 'unknown',
      byType: {}
    };
  }

  _analyzeLoadingCharacteristics(resourcesByType) {
    const loading = {
      blocking: 0,
      async: 0,
      defer: 0,
      lazy: 0
    };
    
    if (resourcesByType.scripts) {
      loading.async = resourcesByType.scripts.async || 0;
      loading.defer = resourcesByType.scripts.defer || 0;
    }
    
    return loading;
  }

  _detectImageFormat(src) {
    if (/\.webp/i.test(src)) return 'webp';
    if (/\.svg/i.test(src)) return 'svg';
    if (/\.png/i.test(src)) return 'png';
    if (/\.jpe?g/i.test(src)) return 'jpeg';
    if (/\.gif/i.test(src)) return 'gif';
    return 'unknown';
  }

  _calculatePerformanceScore(blocking, nonBlocking) {
    const total = blocking + nonBlocking;
    if (total === 0) return 1.0;
    
    const blockingPenalty = blocking * 0.2;
    const score = Math.max(0, 1.0 - (blockingPenalty / total));
    
    return score;
  }

  _getPerformanceImpactLevel(score) {
    if (score >= 0.8) return 'low';
    if (score >= 0.6) return 'medium';
    return 'high';
  }

  _getPrivacyRiskLevel(score) {
    if (score <= 0.3) return 'low';
    if (score <= 0.6) return 'medium';
    return 'high';
  }

  _getSecurityRiskLevel(score) {
    if (score >= 0.8) return 'low';
    if (score >= 0.6) return 'medium';
    return 'high';
  }

  _getComplexityLevel(serviceCount) {
    if (serviceCount <= 5) return 'low';
    if (serviceCount <= 15) return 'medium';
    return 'high';
  }

  _calculateOverallImpact(impact) {
    const scores = [
      impact.performance?.score || 0,
      1 - (impact.privacy?.score || 0), // Invert privacy risk
      impact.security?.score || 0,
      impact.maintenance?.score || 0
    ];
    
    const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return {
      score: overallScore,
      level: overallScore >= 0.7 ? 'low' : overallScore >= 0.4 ? 'medium' : 'high',
      breakdown: {
        performance: impact.performance?.score || 0,
        privacy: impact.privacy?.score || 0,
        security: impact.security?.score || 0,
        maintenance: impact.maintenance?.score || 0
      }
    };
  }

  _generateDetectionSummary(results) {
    return {
      totalServices: results.services?.total || 0,
      externalServices: results.services?.external?.length || 0,
      internalServices: results.services?.internal?.length || 0,
      totalCategories: Object.keys(results.categories || {}).length,
      totalDomains: (results.domains?.external?.length || 0) + (results.domains?.internal?.length || 0),
      overallImpact: results.impact?.overall?.level || 'unknown',
      detectionConfidence: 'high'
    };
  }
}

export default ThirdPartyDetector;
