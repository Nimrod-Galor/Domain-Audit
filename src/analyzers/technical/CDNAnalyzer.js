/**
 * CDN and External Services Detection and Analysis
 * Identifies content delivery networks, external services, and infrastructure dependencies
 * 
 * @fileoverview Comprehensive analysis of external service dependencies and performance impact
 * @version 2.0.0
 * @author Nimrod Galor
 * @date 2025-08-08
 * 
 * MIGRATION NOTES:
 * - Migrated from standalone CDNDetector to BaseAnalyzer architecture
 * - Enhanced with standardized error handling and performance measurement
 * - Integrated EXTERNAL_SERVICES patterns and comprehensive analysis
 * - Added BaseAnalyzer compatibility while maintaining all existing functionality
 */

import { BaseAnalyzer } from '../core/BaseAnalyzer.js';
import { AnalyzerCategories } from '../core/AnalyzerInterface.js';

/**
 * CDN and external service patterns
 */
export const EXTERNAL_SERVICES = {
  // Content Delivery Networks
  CDN: {
    'Cloudflare': {
      patterns: [/cloudflare\.com/, /cf-assets/, /cfm\.cloudflare/, /cdnjs\.cloudflare\.com/],
      type: 'cdn',
      category: 'infrastructure',
      description: 'Cloudflare CDN and security services'
    },
    'Amazon CloudFront': {
      patterns: [/cloudfront\.net/, /aws\.amazon\.com/, /s3\.amazonaws\.com/],
      type: 'cdn',
      category: 'infrastructure',
      description: 'Amazon Web Services CDN'
    },
    'Google Cloud CDN': {
      patterns: [/googleapis\.com/, /gstatic\.com/, /googleusercontent\.com/],
      type: 'cdn',
      category: 'infrastructure',
      description: 'Google Cloud Platform CDN'
    },
    'jsDelivr': {
      patterns: [/jsdelivr\.net/, /cdn\.jsdelivr\.net/],
      type: 'cdn',
      category: 'libraries',
      description: 'Open source CDN for libraries'
    },
    'unpkg': {
      patterns: [/unpkg\.com/],
      type: 'cdn',
      category: 'libraries',
      description: 'NPM package CDN'
    },
    'cdnjs': {
      patterns: [/cdnjs\.com/, /cdnjs\.cloudflare\.com/],
      type: 'cdn',
      category: 'libraries',
      description: 'Community CDN for libraries'
    },
    'MaxCDN': {
      patterns: [/maxcdn\.com/, /netdna-cdn\.com/],
      type: 'cdn',
      category: 'infrastructure',
      description: 'MaxCDN content delivery network'
    },
    'KeyCDN': {
      patterns: [/keycdn\.com/],
      type: 'cdn',
      category: 'infrastructure',
      description: 'KeyCDN content delivery network'
    },
    'Fastly': {
      patterns: [/fastly\.com/, /fastlylb\.net/],
      type: 'cdn',
      category: 'infrastructure',
      description: 'Fastly edge cloud platform'
    }
  },

  // JavaScript Libraries and Frameworks
  LIBRARIES: {
    'jQuery': {
      patterns: [/jquery/, /code\.jquery\.com/],
      type: 'library',
      category: 'javascript',
      description: 'jQuery JavaScript library'
    },
    'Bootstrap': {
      patterns: [/bootstrap/, /maxcdn\.bootstrapcdn\.com/],
      type: 'library',
      category: 'css-framework',
      description: 'Bootstrap CSS/JS framework'
    },
    'React': {
      patterns: [/react/, /reactjs\.org/],
      type: 'library',
      category: 'javascript-framework',
      description: 'React JavaScript framework'
    },
    'Vue.js': {
      patterns: [/vue\.js/, /vuejs\.org/, /unpkg\.com\/vue/],
      type: 'library',
      category: 'javascript-framework',
      description: 'Vue.js JavaScript framework'
    },
    'Angular': {
      patterns: [/angular/, /angularjs\.org/],
      type: 'library',
      category: 'javascript-framework',
      description: 'Angular JavaScript framework'
    },
    'Font Awesome': {
      patterns: [/font-awesome/, /fontawesome\.com/, /fa-/],
      type: 'library',
      category: 'icons',
      description: 'Font Awesome icon library'
    },
    'Lodash': {
      patterns: [/lodash/, /cdn\.jsdelivr\.net\/npm\/lodash/],
      type: 'library',
      category: 'javascript-utility',
      description: 'Lodash utility library'
    }
  },

  // Analytics and Tracking
  ANALYTICS: {
    'Google Analytics': {
      patterns: [/google-analytics\.com/, /googletagmanager\.com/, /gtag/, /ga\(/],
      type: 'analytics',
      category: 'tracking',
      description: 'Google Analytics web analytics',
      privacy: 'collects-data'
    },
    'Google Tag Manager': {
      patterns: [/googletagmanager\.com/, /gtm\.js/],
      type: 'analytics',
      category: 'tag-management',
      description: 'Google Tag Manager',
      privacy: 'collects-data'
    },
    'Facebook Pixel': {
      patterns: [/facebook\.net/, /fbq\(/, /connect\.facebook\.net/],
      type: 'analytics',
      category: 'tracking',
      description: 'Facebook Pixel tracking',
      privacy: 'collects-data'
    },
    'Adobe Analytics': {
      patterns: [/omniture\.com/, /adobe\.com/, /adobedtm\.com/],
      type: 'analytics',
      category: 'tracking',
      description: 'Adobe Analytics platform',
      privacy: 'collects-data'
    },
    'Hotjar': {
      patterns: [/hotjar\.com/, /hj\(/],
      type: 'analytics',
      category: 'heatmap',
      description: 'Hotjar heatmap and user behavior analytics',
      privacy: 'collects-data'
    },
    'Mixpanel': {
      patterns: [/mixpanel\.com/, /mixpanel\.init/],
      type: 'analytics',
      category: 'event-tracking',
      description: 'Mixpanel event analytics',
      privacy: 'collects-data'
    }
  },

  // Advertising Networks
  ADVERTISING: {
    'Google AdSense': {
      patterns: [/googlesyndication\.com/, /googleadservices\.com/, /adsense/],
      type: 'advertising',
      category: 'display-ads',
      description: 'Google AdSense advertising',
      privacy: 'collects-data'
    },
    'Google Ads': {
      patterns: [/googleads\.g\.doubleclick\.net/, /googleadservices\.com/],
      type: 'advertising',
      category: 'search-ads',
      description: 'Google Ads platform',
      privacy: 'collects-data'
    },
    'Facebook Ads': {
      patterns: [/facebook\.com\/tr/, /connect\.facebook\.net.*ads/],
      type: 'advertising',
      category: 'social-ads',
      description: 'Facebook advertising platform',
      privacy: 'collects-data'
    },
    'Amazon Associates': {
      patterns: [/amazon-adsystem\.com/, /assoc-amazon\.com/],
      type: 'advertising',
      category: 'affiliate',
      description: 'Amazon affiliate program',
      privacy: 'collects-data'
    }
  },

  // Customer Support and Communication
  SUPPORT: {
    'Intercom': {
      patterns: [/intercom\.io/, /widget\.intercom\.io/],
      type: 'support',
      category: 'chat',
      description: 'Intercom customer messaging platform'
    },
    'Zendesk': {
      patterns: [/zendesk\.com/, /zdassets\.com/],
      type: 'support',
      category: 'helpdesk',
      description: 'Zendesk customer support platform'
    },
    'Drift': {
      patterns: [/drift\.com/, /driftt\.com/],
      type: 'support',
      category: 'chat',
      description: 'Drift conversational marketing platform'
    },
    'Crisp': {
      patterns: [/crisp\.chat/, /client\.crisp\.chat/],
      type: 'support',
      category: 'chat',
      description: 'Crisp customer messaging'
    }
  },

  // Payment Processing
  PAYMENT: {
    'Stripe': {
      patterns: [/stripe\.com/, /js\.stripe\.com/],
      type: 'payment',
      category: 'payment-processing',
      description: 'Stripe payment processing'
    },
    'PayPal': {
      patterns: [/paypal\.com/, /paypalobjects\.com/],
      type: 'payment',
      category: 'payment-processing',
      description: 'PayPal payment system'
    },
    'Square': {
      patterns: [/squareup\.com/, /square\.com/],
      type: 'payment',
      category: 'payment-processing',
      description: 'Square payment processing'
    }
  },

  // Social Media Integration
  SOCIAL: {
    'Twitter Widgets': {
      patterns: [/platform\.twitter\.com/, /twitter\.com\/widgets/],
      type: 'social',
      category: 'widgets',
      description: 'Twitter social widgets'
    },
    'Facebook SDK': {
      patterns: [/connect\.facebook\.net/, /facebook\.com\/plugins/],
      type: 'social',
      category: 'sdk',
      description: 'Facebook social integration'
    },
    'LinkedIn Widgets': {
      patterns: [/platform\.linkedin\.com/, /linkedin\.com\/widgets/],
      type: 'social',
      category: 'widgets',
      description: 'LinkedIn social widgets'
    },
    'YouTube Embed': {
      patterns: [/youtube\.com\/embed/, /youtube-nocookie\.com/],
      type: 'social',
      category: 'video',
      description: 'YouTube video embeds'
    }
  },

  // Email and Marketing
  MARKETING: {
    'Mailchimp': {
      patterns: [/mailchimp\.com/, /mc\.us\d+\.list-manage\.com/],
      type: 'marketing',
      category: 'email',
      description: 'Mailchimp email marketing'
    },
    'Constant Contact': {
      patterns: [/constantcontact\.com/, /ctctcdn\.com/],
      type: 'marketing',
      category: 'email',
      description: 'Constant Contact email marketing'
    },
    'HubSpot': {
      patterns: [/hubspot\.com/, /hs-scripts\.com/],
      type: 'marketing',
      category: 'automation',
      description: 'HubSpot marketing automation'
    }
  },

  // Performance and Monitoring
  MONITORING: {
    'New Relic': {
      patterns: [/newrelic\.com/, /nr-data\.net/],
      type: 'monitoring',
      category: 'performance',
      description: 'New Relic application monitoring'
    },
    'DataDog': {
      patterns: [/datadoghq\.com/, /datadog\.com/],
      type: 'monitoring',
      category: 'performance',
      description: 'DataDog monitoring platform'
    },
    'Pingdom': {
      patterns: [/pingdom\.net/, /pingdom\.com/],
      type: 'monitoring',
      category: 'uptime',
      description: 'Pingdom website monitoring'
    }
  }
};

/**
 * CDN and External Services Analyzer
 * 
 * Analyzes external service dependencies, performance impact, privacy implications,
 * and security considerations for third-party resources and services.
 */
export class CDNAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('CDNAnalyzer', {
      analyzePerformanceImpact: options.analyzePerformanceImpact !== false,
      analyzePrivacyImplications: options.analyzePrivacyImplications !== false,
      analyzeSecurity: options.analyzeSecurity !== false,
      includeResourceTiming: options.includeResourceTiming !== false,
      enableServiceCategorization: options.enableServiceCategorization !== false,
      enableRecommendations: options.enableRecommendations !== false,
      minServiceSize: options.minServiceSize || 1024, // 1KB minimum
      ...options,
    });

    this.name = 'CDNAnalyzer';
    this.version = '2.0.0';
  }

  /**
   * Analyze CDN usage and external services
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Analysis results
   */
  async analyze(context) {
    return this.measureTime(async () => {
      try {
        this.log('Starting CDN and external services analysis', 'info');
        
        const { dom, url, pageData = {} } = context;
        if (!dom || !dom.window || !dom.window.document) {
          throw new Error('Invalid DOM context provided');
        }
        
        const document = dom.window.document;
        const origin = this._extractOrigin(url);
        
        this.log(`Analyzing external services for ${url}`, 'info');
        
        // Perform comprehensive external services analysis
        const analysis = {
          // Service detection results
          detectedServices: this._detectServices(document, origin),
          
          // Performance analysis
          performanceImpact: this.options.analyzePerformanceImpact ? 
            this._analyzePerformanceImpact(document, origin) : null,
          
          // Privacy and security analysis
          privacyAnalysis: this.options.analyzePrivacyImplications ? 
            this._analyzePrivacyImplications(document) : null,
          
          // Security analysis
          securityAnalysis: this.options.analyzeSecurity ? 
            this._analyzeSecurityImplications(document, url) : null,
          
          // Resource timing analysis
          resourceTiming: this.options.includeResourceTiming ?
            this._analyzeResourceTiming(document) : null,

          // Service categorization
          serviceCategorization: this.options.enableServiceCategorization ?
            this._categorizeServices() : null,

          // Summary statistics
          summary: {},
          
          // Recommendations
          recommendations: [],

          // Existing data integration
          existingData: pageData.cdn || pageData.externalServices || {},
          
          // Analysis metadata
          analysisTimestamp: new Date().toISOString(),
          analyzerVersion: this.version,
          origin
        };

        // Generate summary
        analysis.summary = this._generateSummary(analysis.detectedServices);
        
        // Generate recommendations
        if (this.options.enableRecommendations) {
          analysis.recommendations = this._generateRecommendations(analysis);
        }
        
        // Calculate overall scores
        analysis.overallScore = this._calculateOverallScore(analysis);
        analysis.performanceScore = this._calculatePerformanceScore(analysis);
        analysis.privacyScore = this._calculatePrivacyScore(analysis);
        analysis.securityScore = this._calculateSecurityScore(analysis);
        
        // Performance metrics
        analysis.performanceMetrics = this._analyzeServicePerformance(analysis);
        
        this.log(`CDN analysis completed - ${analysis.detectedServices.length} services detected`, 'info');
        
        return {
          success: true,
          data: analysis,
          metadata: this.getMetadata(),
          timestamp: new Date().toISOString()
        };
        
      } catch (error) {
        return this.handleError('CDN analysis failed', error, {
          detectedServices: [],
          performanceImpact: null,
          privacyAnalysis: null,
          securityAnalysis: null,
          summary: {},
          recommendations: [],
          overallScore: 0
        });
      }
    });
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use analyze() method instead
   */
  async detectExternalServices(dom, url = '') {
    this.log('detectExternalServices is deprecated, use analyze() instead', 'warn');
    const result = await this.analyze({ dom, url });
    return result.success ? result.data : result.data;
  }

  /**
   * Detect all external services used on the page
   * @private
   */
  _detectServices(document, origin) {
    const detectedServices = [];
    const allResources = this._extractAllResources(document);
    
    this.log(`Analyzing ${allResources.length} resources for external services`, 'debug');
    
    // Check each resource against service patterns
    allResources.forEach(resource => {
      if (!this._isExternalResource(resource.url, origin)) {
        return; // Skip internal resources
      }

      // Check against all service categories
      Object.entries(EXTERNAL_SERVICES).forEach(([category, services]) => {
        Object.entries(services).forEach(([serviceName, serviceConfig]) => {
          const matches = serviceConfig.patterns.some(pattern => {
            try {
              return pattern.test(resource.url);
            } catch (e) {
              this.log(`Pattern test failed for ${serviceName}: ${e.message}`, 'warn');
              return false;
            }
          });
          
          if (matches) {
            const existingService = detectedServices.find(s => s.name === serviceName);
            
            if (existingService) {
              existingService.resources.push(resource);
              existingService.totalSize += resource.estimatedSize || 0;
            } else {
              detectedServices.push({
                name: serviceName,
                type: serviceConfig.type,
                category: serviceConfig.category,
                description: serviceConfig.description,
                privacy: serviceConfig.privacy || 'unknown',
                resources: [resource],
                totalSize: resource.estimatedSize || 0,
                domains: [this._extractDomain(resource.url)],
                config: serviceConfig,
                riskLevel: this._assessServiceRisk(serviceConfig),
                performanceImpact: this._assessServicePerformance(resource, serviceConfig)
              });
            }
          }
        });
      });
    });

    // Deduplicate domains and calculate additional metrics
    detectedServices.forEach(service => {
      service.domains = [...new Set(service.domains)];
      service.resourceCount = service.resources.length;
      service.uniqueDomains = service.domains.length;
      service.averageResourceSize = service.totalSize / service.resourceCount;
      service.isRenderBlocking = this._isRenderBlockingService(service);
      service.isPrivacyRelevant = service.privacy === 'collects-data';
    });

    return detectedServices.filter(service => 
      service.totalSize >= this.options.minServiceSize || service.isPrivacyRelevant
    );
  }

  /**
   * Extract all resources from the document
   * @private
   */
  _extractAllResources(document) {
    const resources = [];

    try {
      // Scripts
      const scripts = Array.from(this.safeQuery(document, 'script[src]'));
      scripts.forEach(script => {
        resources.push({
          type: 'script',
          url: script.src,
          element: script,
          async: script.async,
          defer: script.defer,
          estimatedSize: 50000, // 50KB default
          renderBlocking: !script.async && !script.defer
        });
      });

      // Stylesheets
      const stylesheets = Array.from(this.safeQuery(document, 'link[rel="stylesheet"]'));
      stylesheets.forEach(link => {
        resources.push({
          type: 'stylesheet',
          url: link.href,
          element: link,
          media: link.media,
          estimatedSize: 30000, // 30KB default
          renderBlocking: !link.media || link.media === 'all' || link.media === 'screen'
        });
      });

      // Images
      const images = Array.from(this.safeQuery(document, 'img[src]'));
      images.forEach(img => {
        resources.push({
          type: 'image',
          url: img.src,
          element: img,
          loading: img.loading,
          estimatedSize: this._estimateImageSize(img),
          renderBlocking: false
        });
      });

      // Fonts
      const fonts = Array.from(this.safeQuery(document, 'link[rel="preload"][as="font"], link[href*="font"]'));
      fonts.forEach(font => {
        resources.push({
          type: 'font',
          url: font.href,
          element: font,
          estimatedSize: 50000, // 50KB default
          renderBlocking: false
        });
      });

      // Videos and iframes
      const videos = Array.from(this.safeQuery(document, 'video[src], iframe[src]'));
      videos.forEach(video => {
        resources.push({
          type: video.tagName.toLowerCase(),
          url: video.src,
          element: video,
          estimatedSize: 1000000, // 1MB default
          renderBlocking: false
        });
      });

      // Background images from inline styles
      const elementsWithBgImages = Array.from(this.safeQuery(document, '*')).filter(el => {
        const style = el.style.backgroundImage;
        return style && style.includes('url(');
      });

      elementsWithBgImages.forEach(el => {
        const bgImage = el.style.backgroundImage;
        const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (urlMatch) {
          resources.push({
            type: 'background-image',
            url: urlMatch[1],
            element: el,
            estimatedSize: 150000, // 150KB default
            renderBlocking: false
          });
        }
      });

    } catch (error) {
      this.log(`Error extracting resources: ${error.message}`, 'warn');
    }

    return resources;
  }

  /**
   * Estimate image size based on attributes
   * @private
   */
  _estimateImageSize(img) {
    try {
      const width = parseInt(img.width) || 300;
      const height = parseInt(img.height) || 200;
      const area = width * height;
      
      // Rough estimation: 0.5 bytes per pixel for compressed images
      return Math.max(area * 0.5, 10000); // Minimum 10KB
    } catch (e) {
      return 100000; // 100KB default
    }
  }

  /**
   * Check if a resource is external to the current origin
   * @private
   */
  _isExternalResource(resourceUrl, origin) {
    try {
      if (!resourceUrl || !origin) return false;
      
      const url = new URL(resourceUrl, origin);
      const originHost = new URL(origin).hostname;
      return url.hostname !== originHost;
    } catch (e) {
      return false;
    }
  }

  /**
   * Extract origin from URL
   * @private
   */
  _extractOrigin(url) {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}${urlObj.port ? ':' + urlObj.port : ''}`;
    } catch (e) {
      return 'http://localhost';
    }
  }

  /**
   * Extract domain from URL
   * @private
   */
  _extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return 'unknown';
    }
  }

  /**
   * Assess service risk level
   * @private
   */
  _assessServiceRisk(serviceConfig) {
    if (serviceConfig.privacy === 'collects-data') {
      return 'high';
    }
    if (['advertising', 'tracking'].includes(serviceConfig.category)) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Assess service performance impact
   * @private
   */
  _assessServicePerformance(resource, serviceConfig) {
    let score = 100;
    
    if (resource.renderBlocking) score -= 30;
    if (resource.estimatedSize > 100000) score -= 20; // 100KB+
    if (serviceConfig.category === 'tracking') score -= 10;
    
    return Math.max(0, score);
  }

  /**
   * Check if service has render-blocking resources
   * @private
   */
  _isRenderBlockingService(service) {
    return service.resources.some(resource => resource.renderBlocking);
  }

  /**
   * Analyze performance impact of external services
   * @private
   */
  _analyzePerformanceImpact(document, origin) {
    const analysis = {
      totalExternalRequests: 0,
      totalExternalSize: 0,
      renderBlockingResources: 0,
      criticalPathImpact: 0,
      performanceScore: 100,
      bottlenecks: [],
      resourcesByType: {},
      largestResources: []
    };

    try {
      const allResources = this._extractAllResources(document);
      const externalResources = allResources.filter(resource => 
        this._isExternalResource(resource.url, origin)
      );

      analysis.totalExternalRequests = externalResources.length;
      analysis.totalExternalSize = externalResources.reduce((sum, resource) => 
        sum + (resource.estimatedSize || 0), 0
      );

      // Analyze render-blocking resources
      const renderBlockingResources = externalResources.filter(resource => resource.renderBlocking);
      analysis.renderBlockingResources = renderBlockingResources.length;
      analysis.criticalPathImpact = renderBlockingResources.length * 100; // ms estimate

      // Group by type
      externalResources.forEach(resource => {
        analysis.resourcesByType[resource.type] = 
          (analysis.resourcesByType[resource.type] || 0) + 1;
      });

      // Find largest resources
      analysis.largestResources = externalResources
        .sort((a, b) => (b.estimatedSize || 0) - (a.estimatedSize || 0))
        .slice(0, 5)
        .map(resource => ({
          url: resource.url,
          type: resource.type,
          size: resource.estimatedSize,
          renderBlocking: resource.renderBlocking
        }));

      // Performance score calculation
      if (analysis.renderBlockingResources > 5) {
        analysis.performanceScore -= 20;
        analysis.bottlenecks.push({
          type: 'render-blocking',
          severity: 'high',
          description: `${analysis.renderBlockingResources} render-blocking external resources`,
          impact: 'Delays initial page render'
        });
      }

      if (analysis.totalExternalSize > 1000000) { // 1MB
        analysis.performanceScore -= 15;
        analysis.bottlenecks.push({
          type: 'large-size',
          severity: 'medium',
          description: `Large external resources: ${Math.round(analysis.totalExternalSize / 1024)}KB`,
          impact: 'Increases page load time'
        });
      }

      if (analysis.totalExternalRequests > 20) {
        analysis.performanceScore -= 10;
        analysis.bottlenecks.push({
          type: 'many-requests',
          severity: 'medium',
          description: `${analysis.totalExternalRequests} external requests`,
          impact: 'Increases connection overhead'
        });
      }

    } catch (error) {
      this.log(`Performance analysis error: ${error.message}`, 'warn');
    }

    return analysis;
  }

  /**
   * Analyze privacy implications of external services
   * @private
   */
  _analyzePrivacyImplications(document) {
    const analysis = {
      dataCollectingServices: 0,
      trackingServices: 0,
      advertisingServices: 0,
      privacyScore: 100,
      gdprRelevant: false,
      concerns: [],
      recommendations: []
    };

    try {
      // Look for common tracking patterns in script content
      const scripts = Array.from(this.safeQuery(document, 'script'));
      const scriptContent = scripts.map(script => script.textContent || '').join(' ');
      
      const trackingPatterns = ['gtag', 'fbq', '_gaq', 'ga(', 'analytics'];
      const foundPatterns = trackingPatterns.filter(pattern => 
        scriptContent.toLowerCase().includes(pattern)
      );

      analysis.trackingServices = foundPatterns.length;
      
      if (foundPatterns.length > 0) {
        analysis.gdprRelevant = true;
        analysis.privacyScore -= foundPatterns.length * 10;
        analysis.concerns.push({
          type: 'tracking-detected',
          severity: 'medium',
          description: `${foundPatterns.length} tracking patterns detected`,
          patterns: foundPatterns
        });
      }

    } catch (error) {
      this.log(`Privacy analysis error: ${error.message}`, 'warn');
    }
    
    return analysis;
  }

  /**
   * Analyze security implications
   * @private
   */
  _analyzeSecurityImplications(document, url) {
    const analysis = {
      insecureResources: 0,
      crossOriginResources: 0,
      securityScore: 100,
      vulnerabilities: [],
      integrityChecks: 0,
      totalExternalResources: 0
    };

    try {
      // Check for mixed content (HTTP resources on HTTPS pages)
      if (url && url.startsWith('https://')) {
        const httpResources = Array.from(this.safeQuery(document, 'script[src], link[href], img[src]'))
          .filter(el => {
            const src = el.src || el.href;
            return src && src.startsWith('http://');
          });

        analysis.insecureResources = httpResources.length;
        
        if (httpResources.length > 0) {
          analysis.securityScore -= 30;
          analysis.vulnerabilities.push({
            type: 'mixed-content',
            severity: 'high',
            description: `${httpResources.length} insecure HTTP resources on HTTPS page`,
            recommendation: 'Update all resource URLs to use HTTPS',
            resources: httpResources.slice(0, 5).map(el => el.src || el.href)
          });
        }
      }

      // Check for resources with integrity attributes
      const externalResourcesWithSrc = Array.from(this.safeQuery(document, 'script[src], link[rel="stylesheet"]'));
      const externalResources = externalResourcesWithSrc.filter(el => 
        this._isExternalResource(el.src || el.href, url)
      );
      
      analysis.totalExternalResources = externalResources.length;
      
      const resourcesWithIntegrity = externalResources.filter(el => el.integrity);
      analysis.integrityChecks = resourcesWithIntegrity.length;

      if (externalResources.length > 0 && analysis.integrityChecks === 0) {
        analysis.securityScore -= 20;
        analysis.vulnerabilities.push({
          type: 'missing-integrity',
          severity: 'medium',
          description: `${externalResources.length} external resources without integrity checks`,
          recommendation: 'Add integrity attributes to external resources for security verification'
        });
      }

      // Cross-origin resource analysis
      analysis.crossOriginResources = externalResources.length;

    } catch (error) {
      this.log(`Security analysis error: ${error.message}`, 'warn');
    }

    return analysis;
  }

  /**
   * Analyze resource timing data
   * @private
   */
  _analyzeResourceTiming(document) {
    // This would analyze performance timing data if available
    return {
      available: false,
      message: 'Resource timing analysis requires performance API access'
    };
  }

  /**
   * Categorize detected services
   * @private
   */
  _categorizeServices() {
    const categories = {};
    
    Object.keys(EXTERNAL_SERVICES).forEach(categoryKey => {
      const services = EXTERNAL_SERVICES[categoryKey];
      categories[categoryKey] = {
        name: categoryKey,
        serviceCount: Object.keys(services).length,
        services: Object.keys(services)
      };
    });

    return categories;
  }

  /**
   * Generate summary statistics
   * @private
   */
  _generateSummary(detectedServices) {
    const summary = {
      totalServices: detectedServices.length,
      servicesByType: {},
      servicesByCategory: {},
      totalDomains: new Set(),
      totalSize: 0,
      totalRequests: 0,
      renderBlockingServices: 0,
      privacyRelevantServices: 0,
      highRiskServices: 0
    };

    detectedServices.forEach(service => {
      // Count by type
      summary.servicesByType[service.type] = (summary.servicesByType[service.type] || 0) + 1;
      
      // Count by category
      summary.servicesByCategory[service.category] = (summary.servicesByCategory[service.category] || 0) + 1;
      
      // Add domains
      service.domains.forEach(domain => summary.totalDomains.add(domain));
      
      // Add size and requests
      summary.totalSize += service.totalSize;
      summary.totalRequests += service.resourceCount;
      
      // Count special categories
      if (service.isRenderBlocking) summary.renderBlockingServices++;
      if (service.isPrivacyRelevant) summary.privacyRelevantServices++;
      if (service.riskLevel === 'high') summary.highRiskServices++;
    });

    summary.totalDomains = summary.totalDomains.size;

    return summary;
  }

  /**
   * Generate recommendations based on analysis
   * @private
   */
  _generateRecommendations(analysis) {
    const recommendations = [];

    try {
      // Too many external services
      if (analysis.summary.totalServices > 15) {
        recommendations.push({
          category: 'performance',
          priority: 'medium',
          title: 'Reduce External Dependencies',
          description: `${analysis.summary.totalServices} external services detected`,
          action: 'Review and consolidate external services to improve performance',
          impact: 'performance'
        });
      }

      // Too many external domains
      if (analysis.summary.totalDomains > 10) {
        recommendations.push({
          category: 'performance',
          priority: 'medium',
          title: 'Reduce DNS Lookups',
          description: `${analysis.summary.totalDomains} external domains require DNS resolution`,
          action: 'Consolidate services or use DNS prefetching',
          impact: 'performance'
        });
      }

      // Privacy concerns
      if (analysis.summary.privacyRelevantServices > 0) {
        recommendations.push({
          category: 'privacy',
          priority: 'high',
          title: 'Review Privacy Compliance',
          description: `${analysis.summary.privacyRelevantServices} services collect user data`,
          action: 'Ensure GDPR/CCPA compliance and update privacy policy',
          impact: 'legal'
        });
      }

      // Performance impact
      if (analysis.performanceImpact && analysis.performanceImpact.performanceScore < 70) {
        recommendations.push({
          category: 'performance',
          priority: 'high',
          title: 'Optimize External Resource Loading',
          description: `Performance impact score: ${analysis.performanceImpact.performanceScore}/100`,
          action: 'Use async/defer attributes, resource hints, and critical resource optimization',
          impact: 'performance'
        });
      }

      // Security issues
      if (analysis.securityAnalysis && analysis.securityAnalysis.vulnerabilities.length > 0) {
        recommendations.push({
          category: 'security',
          priority: 'high',
          title: 'Address Security Vulnerabilities',
          description: `${analysis.securityAnalysis.vulnerabilities.length} security issues found`,
          action: 'Fix mixed content and add integrity checks to external resources',
          impact: 'security'
        });
      }

      // Render-blocking resources
      if (analysis.summary.renderBlockingServices > 3) {
        recommendations.push({
          category: 'performance',
          priority: 'high',
          title: 'Optimize Render-Blocking Resources',
          description: `${analysis.summary.renderBlockingServices} services block page rendering`,
          action: 'Use async/defer loading for non-critical external resources',
          impact: 'performance'
        });
      }

    } catch (error) {
      this.log(`Recommendation generation error: ${error.message}`, 'warn');
    }

    return recommendations;
  }

  /**
   * Calculate overall score
   * @private
   */
  _calculateOverallScore(analysis) {
    let score = 100;
    
    // Deduct for too many services
    if (analysis.summary.totalServices > 20) score -= 20;
    else if (analysis.summary.totalServices > 15) score -= 10;
    else if (analysis.summary.totalServices > 10) score -= 5;
    
    // Deduct for privacy concerns
    score -= analysis.summary.privacyRelevantServices * 5;
    
    // Deduct for security issues
    score -= analysis.summary.highRiskServices * 10;
    
    // Performance impact
    if (analysis.performanceImpact) {
      score = (score + analysis.performanceImpact.performanceScore) / 2;
    }
    
    return Math.max(0, Math.round(score));
  }

  /**
   * Calculate performance score
   * @private
   */
  _calculatePerformanceScore(analysis) {
    if (analysis.performanceImpact) {
      return analysis.performanceImpact.performanceScore;
    }
    
    let score = 100;
    score -= analysis.summary.renderBlockingServices * 10;
    score -= Math.min(analysis.summary.totalServices * 2, 40);
    
    return Math.max(0, score);
  }

  /**
   * Calculate privacy score
   * @private
   */
  _calculatePrivacyScore(analysis) {
    if (analysis.privacyAnalysis) {
      return analysis.privacyAnalysis.privacyScore;
    }
    
    let score = 100;
    score -= analysis.summary.privacyRelevantServices * 15;
    
    return Math.max(0, score);
  }

  /**
   * Calculate security score
   * @private
   */
  _calculateSecurityScore(analysis) {
    if (analysis.securityAnalysis) {
      return analysis.securityAnalysis.securityScore;
    }
    
    let score = 100;
    score -= analysis.summary.highRiskServices * 20;
    
    return Math.max(0, score);
  }

  /**
   * Analyze service performance metrics
   * @private
   */
  _analyzeServicePerformance(analysis) {
    return {
      totalServicesAnalyzed: analysis.summary.totalServices,
      totalResourcesAnalyzed: analysis.summary.totalRequests,
      totalDataTransfer: analysis.summary.totalSize,
      averageServiceSize: analysis.summary.totalServices > 0 ? 
        Math.round(analysis.summary.totalSize / analysis.summary.totalServices) : 0,
      performanceClassification: this._classifyPerformance(analysis.performanceScore),
      optimizationPotential: this._assessOptimizationPotential(analysis),
      analysisDepth: 'comprehensive'
    };
  }

  /**
   * Classify performance level
   * @private
   */
  _classifyPerformance(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    if (score >= 60) return 'poor';
    return 'critical';
  }

  /**
   * Assess optimization potential
   * @private
   */
  _assessOptimizationPotential(analysis) {
    const issues = analysis.recommendations?.length || 0;
    const renderBlocking = analysis.summary.renderBlockingServices || 0;
    const privacyIssues = analysis.summary.privacyRelevantServices || 0;
    
    const totalIssues = issues + renderBlocking + privacyIssues;
    
    if (totalIssues >= 10) return 'high';
    if (totalIssues >= 5) return 'medium';
    if (totalIssues >= 2) return 'low';
    return 'minimal';
  }

  /**
   * Get service information by name
   * @param {string} serviceName - Name of the service
   * @returns {Object|null} Service configuration
   */
  getServiceInfo(serviceName) {
    for (const category of Object.values(EXTERNAL_SERVICES)) {
      if (category[serviceName]) {
        return category[serviceName];
      }
    }
    return null;
  }

  /**
   * Get all services by category
   * @param {string} categoryName - Category name (e.g., 'CDN', 'ANALYTICS')
   * @returns {Object} Services in the category
   */
  getServicesByCategory(categoryName) {
    return EXTERNAL_SERVICES[categoryName] || {};
  }

  /**
   * Check if a URL matches any known service pattern
   * @param {string} url - URL to check
   * @returns {Array} Matching services
   */
  identifyServiceFromUrl(url) {
    const matches = [];
    
    Object.entries(EXTERNAL_SERVICES).forEach(([category, services]) => {
      Object.entries(services).forEach(([serviceName, serviceConfig]) => {
        const isMatch = serviceConfig.patterns.some(pattern => pattern.test(url));
        if (isMatch) {
          matches.push({
            name: serviceName,
            category,
            ...serviceConfig
          });
        }
      });
    });

    return matches;
  }

  getMetadata() {
    return {
      name: this.name,
      version: this.version,
      description: 'Comprehensive CDN and external services analysis with performance, privacy, and security assessment',
      category: AnalyzerCategories.TECHNICAL,
      priority: 'high',
      features: [
        'External service detection',
        'CDN usage analysis',
        'Performance impact assessment',
        'Privacy compliance analysis',
        'Security vulnerability detection',
        'Resource optimization recommendations',
        'Service categorization',
        'Risk assessment'
      ],
      capabilities: {
        serviceDetection: true,
        performanceAnalysis: true,
        privacyAnalysis: true,
        securityAnalysis: true,
        recommendations: true,
        resourceTiming: false
      },
      outputFormat: {
        detectedServices: 'Array of detected external services',
        performanceImpact: 'Performance analysis data',
        privacyAnalysis: 'Privacy compliance assessment',
        securityAnalysis: 'Security vulnerability analysis',
        summary: 'Summary statistics',
        recommendations: 'Optimization recommendations'
      }
    };
  }
}

// Backward compatibility export
export class CDNDetector extends CDNAnalyzer {
  constructor(options = {}) {
    super(options);
    this.log('CDNDetector is deprecated, use CDNAnalyzer instead', 'warn');
  }
}
