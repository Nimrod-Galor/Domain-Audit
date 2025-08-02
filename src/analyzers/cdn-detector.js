/**
 * CDN and External Services Detection and Analysis
 * Identifies content delivery networks, external services, and infrastructure dependencies
 * 
 * @fileoverview Comprehensive analysis of external service dependencies and performance impact
 * @version 1.0.0
 * @author AI Assistant
 * @date 2025-08-02
 */

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
 * CDN and External Services Detector Class
 */
export class CDNDetector {
  constructor(options = {}) {
    this.config = {
      analyzePerformanceImpact: options.analyzePerformanceImpact !== false,
      analyzePrivacyImplications: options.analyzePrivacyImplications !== false,
      analyzeSecurity: options.analyzeSecurity !== false,
      includeResourceTiming: options.includeResourceTiming !== false,
      ...options
    };
  }

  /**
   * Detect and analyze CDN usage and external services
   * @param {Object} dom - JSDOM document object
   * @param {string} url - Page URL for origin detection
   * @returns {Object} CDN and external services analysis
   */
  detectExternalServices(dom, url = '') {
    try {
      const document = dom.window.document;
      const origin = this._extractOrigin(url);
      
      const analysis = {
        // Service detection results
        detectedServices: this._detectServices(document, origin),
        
        // Performance analysis
        performanceImpact: this.config.analyzePerformanceImpact ? 
          this._analyzePerformanceImpact(document) : null,
        
        // Privacy and security analysis
        privacyAnalysis: this.config.analyzePrivacyImplications ? 
          this._analyzePrivacyImplications(document) : null,
        
        // Security analysis
        securityAnalysis: this.config.analyzeSecurity ? 
          this._analyzeSecurityImplications(document) : null,
        
        // Summary statistics
        summary: {},
        
        // Recommendations
        recommendations: []
      };

      // Generate summary
      analysis.summary = this._generateSummary(analysis.detectedServices);
      
      // Generate recommendations
      analysis.recommendations = this._generateRecommendations(analysis);
      
      return analysis;
    } catch (error) {
      return {
        error: `CDN detection failed: ${error.message}`,
        detectedServices: [],
        summary: {}
      };
    }
  }

  /**
   * Detect all external services used on the page
   * @private
   */
  _detectServices(document, origin) {
    const detectedServices = [];
    const allResources = this._extractAllResources(document);
    
    // Check each resource against service patterns
    allResources.forEach(resource => {
      if (!this._isExternalResource(resource.url, origin)) {
        return; // Skip internal resources
      }

      // Check against all service categories
      Object.entries(EXTERNAL_SERVICES).forEach(([category, services]) => {
        Object.entries(services).forEach(([serviceName, serviceConfig]) => {
          const matches = serviceConfig.patterns.some(pattern => pattern.test(resource.url));
          
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
                config: serviceConfig
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
    });

    return detectedServices;
  }

  /**
   * Extract all resources from the document
   * @private
   */
  _extractAllResources(document) {
    const resources = [];

    // Scripts
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    scripts.forEach(script => {
      resources.push({
        type: 'script',
        url: script.src,
        element: script,
        async: script.async,
        defer: script.defer,
        estimatedSize: 50000 // 50KB default
      });
    });

    // Stylesheets
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    stylesheets.forEach(link => {
      resources.push({
        type: 'stylesheet',
        url: link.href,
        element: link,
        media: link.media,
        estimatedSize: 30000 // 30KB default
      });
    });

    // Images
    const images = Array.from(document.querySelectorAll('img[src]'));
    images.forEach(img => {
      resources.push({
        type: 'image',
        url: img.src,
        element: img,
        loading: img.loading,
        estimatedSize: 100000 // 100KB default
      });
    });

    // Fonts
    const fonts = Array.from(document.querySelectorAll('link[rel="preload"][as="font"], link[href*="font"]'));
    fonts.forEach(font => {
      resources.push({
        type: 'font',
        url: font.href,
        element: font,
        estimatedSize: 50000 // 50KB default
      });
    });

    // Videos and iframes
    const videos = Array.from(document.querySelectorAll('video[src], iframe[src]'));
    videos.forEach(video => {
      resources.push({
        type: video.tagName.toLowerCase(),
        url: video.src,
        element: video,
        estimatedSize: 1000000 // 1MB default
      });
    });

    // Background images from inline styles
    const elementsWithBgImages = Array.from(document.querySelectorAll('*')).filter(el => {
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
          estimatedSize: 150000 // 150KB default
        });
      }
    });

    return resources;
  }

  /**
   * Check if a resource is external to the current origin
   * @private
   */
  _isExternalResource(resourceUrl, origin) {
    try {
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
   * Analyze performance impact of external services
   * @private
   */
  _analyzePerformanceImpact(document) {
    const analysis = {
      totalExternalRequests: 0,
      totalExternalSize: 0,
      renderBlockingResources: 0,
      criticalPathImpact: 0,
      performanceScore: 100,
      bottlenecks: []
    };

    // Analyze render-blocking resources
    const renderBlockingCSS = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .filter(link => this._isExternalResource(link.href, document.URL));
    
    const renderBlockingJS = Array.from(document.querySelectorAll('script[src]'))
      .filter(script => !script.async && !script.defer && this._isExternalResource(script.src, document.URL));

    analysis.renderBlockingResources = renderBlockingCSS.length + renderBlockingJS.length;
    analysis.criticalPathImpact = analysis.renderBlockingResources * 100; // ms estimate

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
      concerns: []
    };

    // This would be populated by the main detection function
    // For now, return basic structure
    
    return analysis;
  }

  /**
   * Analyze security implications
   * @private
   */
  _analyzeSecurityImplications(document) {
    const analysis = {
      insecureResources: 0,
      crossOriginResources: 0,
      securityScore: 100,
      vulnerabilities: []
    };

    // Check for mixed content (HTTP resources on HTTPS pages)
    if (document.URL.startsWith('https://')) {
      const httpResources = Array.from(document.querySelectorAll('script[src], link[href], img[src]'))
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
          recommendation: 'Update all resource URLs to use HTTPS'
        });
      }
    }

    // Check for resources without integrity attributes
    const integrityMissing = Array.from(document.querySelectorAll('script[src], link[rel="stylesheet"]'))
      .filter(el => this._isExternalResource(el.src || el.href, document.URL) && !el.integrity);

    if (integrityMissing.length > 3) {
      analysis.vulnerabilities.push({
        type: 'missing-integrity',
        severity: 'medium',
        description: `${integrityMissing.length} external resources without integrity checks`,
        recommendation: 'Add integrity attributes to external resources'
      });
    }

    return analysis;
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
      totalRequests: 0
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

    // Too many external services
    if (analysis.summary.totalServices > 15) {
      recommendations.push({
        category: 'performance',
        priority: 'medium',
        title: 'Reduce External Dependencies',
        description: `${analysis.summary.totalServices} external services detected`,
        action: 'Review and consolidate external services to improve performance'
      });
    }

    // Too many external domains
    if (analysis.summary.totalDomains > 10) {
      recommendations.push({
        category: 'performance',
        priority: 'medium',
        title: 'Reduce DNS Lookups',
        description: `${analysis.summary.totalDomains} external domains require DNS resolution`,
        action: 'Consolidate services or use DNS prefetching'
      });
    }

    // Privacy concerns
    const privacyConcerns = analysis.detectedServices.filter(service => 
      service.privacy === 'collects-data'
    ).length;

    if (privacyConcerns > 0) {
      recommendations.push({
        category: 'privacy',
        priority: 'high',
        title: 'Review Privacy Compliance',
        description: `${privacyConcerns} services collect user data`,
        action: 'Ensure GDPR/CCPA compliance and update privacy policy'
      });
    }

    // Performance impact
    if (analysis.performanceImpact && analysis.performanceImpact.performanceScore < 70) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        title: 'Optimize External Resource Loading',
        description: `Performance impact score: ${analysis.performanceImpact.performanceScore}/100`,
        action: 'Use async/defer attributes, resource hints, and critical resource optimization'
      });
    }

    // Security issues
    if (analysis.securityAnalysis && analysis.securityAnalysis.vulnerabilities.length > 0) {
      recommendations.push({
        category: 'security',
        priority: 'high',
        title: 'Address Security Vulnerabilities',
        description: `${analysis.securityAnalysis.vulnerabilities.length} security issues found`,
        action: 'Fix mixed content and add integrity checks to external resources'
      });
    }

    return recommendations;
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
}
