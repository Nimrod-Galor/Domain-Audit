import { BaseAnalyzer } from '../core/BaseAnalyzer.js';
import { AnalyzerCategories } from '../core/AnalyzerInterface.js';

/**
 * Third-Party Scripts and Services Analyzer
 * Detects and analyzes external scripts, tracking services, and third-party integrations
 * 
 * @fileoverview Comprehensive analysis of third-party dependencies for performance and privacy insights
 * @version 1.0.0
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @date 2025-08-08
 */

/**
 * Known third-party service patterns and their categories
 */
export const THIRD_PARTY_SERVICES = {
  // Analytics and Tracking
  ANALYTICS: {
    'google-analytics.com': { name: 'Google Analytics', category: 'analytics', impact: 'medium' },
    'googletagmanager.com': { name: 'Google Tag Manager', category: 'analytics', impact: 'medium' },
    'facebook.net': { name: 'Facebook Pixel', category: 'analytics', impact: 'medium' },
    'hotjar.com': { name: 'Hotjar', category: 'analytics', impact: 'low' },
    'mixpanel.com': { name: 'Mixpanel', category: 'analytics', impact: 'low' },
    'segment.com': { name: 'Segment', category: 'analytics', impact: 'medium' },
    'amplitude.com': { name: 'Amplitude', category: 'analytics', impact: 'low' },
    'fullstory.com': { name: 'FullStory', category: 'analytics', impact: 'high' },
    'crazyegg.com': { name: 'Crazy Egg', category: 'analytics', impact: 'low' }
  },

  // Advertising and Marketing
  ADVERTISING: {
    'googleadservices.com': { name: 'Google Ads', category: 'advertising', impact: 'medium' },
    'googlesyndication.com': { name: 'Google AdSense', category: 'advertising', impact: 'medium' },
    'facebook.com': { name: 'Facebook Ads', category: 'advertising', impact: 'medium' },
    'doubleclick.net': { name: 'DoubleClick', category: 'advertising', impact: 'medium' },
    'adsystem.com': { name: 'Amazon Advertising', category: 'advertising', impact: 'medium' },
    'outbrain.com': { name: 'Outbrain', category: 'advertising', impact: 'low' },
    'taboola.com': { name: 'Taboola', category: 'advertising', impact: 'low' }
  },

  // Social Media
  SOCIAL: {
    'platform.twitter.com': { name: 'Twitter Widget', category: 'social', impact: 'low' },
    'connect.facebook.net': { name: 'Facebook SDK', category: 'social', impact: 'medium' },
    'apis.google.com': { name: 'Google+ API', category: 'social', impact: 'low' },
    'linkedin.com': { name: 'LinkedIn Widget', category: 'social', impact: 'low' },
    'instagram.com': { name: 'Instagram Embed', category: 'social', impact: 'low' },
    'youtube.com': { name: 'YouTube Embed', category: 'social', impact: 'medium' },
    'vimeo.com': { name: 'Vimeo Embed', category: 'social', impact: 'medium' }
  },

  // Content Delivery Networks
  CDN: {
    'cloudflare.com': { name: 'Cloudflare', category: 'cdn', impact: 'positive' },
    'jsdelivr.net': { name: 'jsDelivr', category: 'cdn', impact: 'positive' },
    'unpkg.com': { name: 'UNPKG', category: 'cdn', impact: 'positive' },
    'cdnjs.cloudflare.com': { name: 'cdnjs', category: 'cdn', impact: 'positive' },
    'maxcdn.bootstrapcdn.com': { name: 'Bootstrap CDN', category: 'cdn', impact: 'positive' },
    'ajax.googleapis.com': { name: 'Google Libraries', category: 'cdn', impact: 'positive' },
    'code.jquery.com': { name: 'jQuery CDN', category: 'cdn', impact: 'positive' },
    'fonts.googleapis.com': { name: 'Google Fonts', category: 'cdn', impact: 'positive' },
    'use.fontawesome.com': { name: 'Font Awesome CDN', category: 'cdn', impact: 'positive' }
  },

  // Customer Support and Chat
  SUPPORT: {
    'intercom.io': { name: 'Intercom', category: 'support', impact: 'medium' },
    'zendesk.com': { name: 'Zendesk Chat', category: 'support', impact: 'medium' },
    'livechatinc.com': { name: 'LiveChat', category: 'support', impact: 'medium' },
    'crisp.chat': { name: 'Crisp', category: 'support', impact: 'low' },
    'drift.com': { name: 'Drift', category: 'support', impact: 'medium' },
    'freshchat.com': { name: 'Freshchat', category: 'support', impact: 'medium' }
  },

  // Performance and Monitoring
  MONITORING: {
    'newrelic.com': { name: 'New Relic', category: 'monitoring', impact: 'low' },
    'sentry.io': { name: 'Sentry', category: 'monitoring', impact: 'low' },
    'bugsnag.com': { name: 'Bugsnag', category: 'monitoring', impact: 'low' },
    'rollbar.com': { name: 'Rollbar', category: 'monitoring', impact: 'low' },
    'pingdom.com': { name: 'Pingdom RUM', category: 'monitoring', impact: 'low' }
  },

  // Payment Processing
  PAYMENT: {
    'stripe.com': { name: 'Stripe', category: 'payment', impact: 'medium' },
    'paypal.com': { name: 'PayPal', category: 'payment', impact: 'medium' },
    'square.com': { name: 'Square', category: 'payment', impact: 'medium' },
    'braintreepayments.com': { name: 'Braintree', category: 'payment', impact: 'medium' }
  },

  // Email and Marketing Automation
  EMAIL: {
    'mailchimp.com': { name: 'Mailchimp', category: 'email', impact: 'low' },
    'constant-contact.com': { name: 'Constant Contact', category: 'email', impact: 'low' },
    'hubspot.com': { name: 'HubSpot', category: 'email', impact: 'medium' },
    'pardot.com': { name: 'Pardot', category: 'email', impact: 'medium' },
    'marketo.com': { name: 'Marketo', category: 'email', impact: 'medium' }
  }
};

/**
 * Third-Party Scripts and Services Analyzer Class
 */
export class ThirdPartyAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('ThirdPartyAnalyzer', {
      includeInlineScripts: options.includeInlineScripts !== false,
      analyzeDataUrls: options.analyzeDataUrls !== false,
      trackingDetection: options.trackingDetection !== false,
      performanceImpact: options.performanceImpact !== false,
      ...options,
    });
  }

  getMetadata() {
    return {
      name: 'ThirdPartyAnalyzer',
      version: '1.0.0',
      description: 'Detects and analyzes external scripts, tracking services, and third-party integrations',
      category: AnalyzerCategories.THIRD_PARTY,
      priority: 'high'
    };
  }

  /**
   * Perform comprehensive third-party analysis
   * @param {Document} document - DOM document
   * @param {Object|string} pageDataOrUrl - Page data object or URL string
   * @param {string} url - Page URL
   * @returns {Promise<Object>} Analysis results
   */
  async analyze(document, pageDataOrUrl, url) {
    return this.measureTime(async () => {
      try {
        this.log('info', 'Starting third-party analysis...');
        
        let actualUrl, pageData;
        if (typeof pageDataOrUrl === 'string') {
          actualUrl = pageDataOrUrl;
          pageData = {};
        } else {
          pageData = pageDataOrUrl || {};
          actualUrl = url;
        }

        const analysis = {
          // Script analysis
          scripts: this._analyzeScripts(document),
          
          // External resources analysis
          resources: this._analyzeExternalResources(document),
          
          // CDN detection
          cdnUsage: this._analyzeCDNUsage(document),
          
          // Tracking services detection
          tracking: this._analyzeTrackingServices(document),
          
          // Performance impact assessment
          performanceImpact: this._assessPerformanceImpact(document),
          
          // Privacy implications
          privacyImplications: this._analyzePrivacyImplications(document),
          
          // Summary and recommendations
          summary: {}
        };

        // Generate summary
        analysis.summary = this._generateSummary(analysis);
        
        this.log('info', `Third-party analysis completed. Detected ${analysis.scripts.thirdParty.length} third-party scripts with impact score: ${analysis.performanceImpact.impactScore}`);
        
        return analysis;
      } catch (error) {
        return this.handleError(error, 'third-party analysis');
      }
    }).then(({ result, time }) => {
      if (result.error) {
        return {
          ...result,
          scripts: null,
          resources: null,
          cdnUsage: null,
          tracking: null,
          performanceImpact: { impactScore: 0 },
          privacyImplications: { riskLevel: 'unknown' },
          summary: { totalThirdPartyServices: 0 }
        };
      }
      
      return this.createSuccessResponse(result, time);
    });
  }



  /**
   * Analyze all script elements on the page
   * @private
   */
  _analyzeScripts(document) {
    const scripts = Array.from(this.safeQuery(document, 'script'));
    const analysis = {
      total: scripts.length,
      external: 0,
      inline: 0,
      async: 0,
      defer: 0,
      thirdParty: [],
      firstParty: [],
      suspicious: []
    };

    scripts.forEach((script, index) => {
      const src = script.src;
      const scriptInfo = {
        index,
        src: src || null,
        type: script.type || 'text/javascript',
        async: script.async,
        defer: script.defer,
        crossorigin: script.crossOrigin,
        integrity: script.integrity,
        isInline: !src,
        size: script.innerHTML ? script.innerHTML.length : 0
      };

      if (src) {
        analysis.external++;
        
        // Determine if third-party
        const docHostname = document.location ? document.location.hostname : 'test-third-party.com';
        const isThirdParty = this._isThirdPartyURL(src, docHostname);
        
        if (isThirdParty) {
          const service = this._identifyService(src);
          scriptInfo.service = service;
          analysis.thirdParty.push(scriptInfo);
        } else {
          analysis.firstParty.push(scriptInfo);
        }
        
        // Check for suspicious patterns
        if (this._isSuspiciousScript(src, script.innerHTML)) {
          analysis.suspicious.push(scriptInfo);
        }
      } else {
        analysis.inline++;
        
        // Analyze inline script content
        if (this.options.includeInlineScripts && script.innerHTML) {
          const inlineAnalysis = this._analyzeInlineScript(script.innerHTML);
          scriptInfo.inlineAnalysis = inlineAnalysis;
          
          if (inlineAnalysis.containsTracking) {
            analysis.thirdParty.push(scriptInfo);
          }
        }
      }

      if (script.async) analysis.async++;
      if (script.defer) analysis.defer++;
    });

    return analysis;
  }

  /**
   * Analyze external resources (images, stylesheets, etc.)
   * @private
   */
  _analyzeExternalResources(document) {
    const resources = {
      images: this._analyzeResourceType(document, 'img', 'src'),
      stylesheets: this._analyzeResourceType(document, 'link[rel="stylesheet"]', 'href'),
      fonts: this._analyzeFonts(document),
      iframes: this._analyzeResourceType(document, 'iframe', 'src'),
      videos: this._analyzeResourceType(document, 'video source', 'src')
    };

    return resources;
  }

  /**
   * Analyze CDN usage
   * @private
   */
  _analyzeCDNUsage(document) {
    const cdnAnalysis = {
      detected: [],
      coverage: {
        scripts: 0,
        styles: 0,
        fonts: 0,
        images: 0
      },
      benefits: [],
      recommendations: []
    };

    // Check all external resources for CDN usage
    const scripts = Array.from(this.safeQuery(document, 'script[src]'));
    const stylesheets = Array.from(this.safeQuery(document, 'link[rel="stylesheet"]'));
    const images = Array.from(this.safeQuery(document, 'img'));

    const allResources = [
      ...scripts.map(el => ({ type: 'script', url: el.src })),
      ...stylesheets.map(el => ({ type: 'style', url: el.href })),
      ...images.map(el => ({ type: 'image', url: el.src }))
    ];

    const cdnResources = allResources.filter(resource => {
      const cdnInfo = this._detectCDN(resource.url);
      if (cdnInfo) {
        cdnAnalysis.detected.push({
          ...resource,
          cdn: cdnInfo
        });
        cdnAnalysis.coverage[resource.type]++;
        return true;
      }
      return false;
    });

    // Calculate coverage percentages
    const totalByType = {
      script: scripts.length,
      style: stylesheets.length,
      image: images.length
    };

    Object.keys(cdnAnalysis.coverage).forEach(type => {
      const total = totalByType[type] || 0;
      cdnAnalysis.coverage[type] = total > 0 ? 
        Math.round((cdnAnalysis.coverage[type] / total) * 100) : 0;
    });

    return cdnAnalysis;
  }

  /**
   * Analyze tracking services
   * @private
   */
  _analyzeTrackingServices(document) {
    const tracking = {
      analytics: [],
      advertising: [],
      social: [],
      heatmaps: [],
      abtesting: [],
      privacy: {
        cookieConsent: false,
        gdprCompliant: false,
        trackingOptOut: false
      }
    };

    // Check for common tracking patterns
    const scripts = Array.from(this.safeQuery(document, 'script'));
    
    scripts.forEach(script => {
      const src = script.src;
      const content = script.innerHTML;

      if (src) {
        const service = this._identifyService(src);
        if (service) {
          switch (service.category) {
            case 'analytics':
              tracking.analytics.push(service);
              break;
            case 'advertising':
              tracking.advertising.push(service);
              break;
            case 'social':
              tracking.social.push(service);
              break;
          }
        }
      }

      // Check inline scripts for tracking codes
      if (content) {
        if (content.includes('gtag') || content.includes('ga(')) {
          tracking.analytics.push({ name: 'Google Analytics (inline)', category: 'analytics' });
        }
        if (content.includes('fbq')) {
          tracking.advertising.push({ name: 'Facebook Pixel (inline)', category: 'advertising' });
        }
      }
    });

    // Check for privacy compliance indicators
    tracking.privacy.cookieConsent = this._detectCookieConsent(document);
    tracking.privacy.gdprCompliant = this._detectGDPRCompliance(document);

    return tracking;
  }

  /**
   * Assess performance impact of third-party services
   * @private
   */
  _assessPerformanceImpact(document) {
    const impact = {
      totalThirdPartyScripts: 0,
      estimatedLoadTime: 0,
      blockingScripts: 0,
      asyncScripts: 0,
      deferredScripts: 0,
      impactScore: 0,
      recommendations: []
    };

    const scripts = Array.from(this.safeQuery(document, 'script'));
    
    scripts.forEach(script => {
      if (script.src && this._isThirdPartyURL(script.src, document.location ? document.location.hostname : 'localhost')) {
        impact.totalThirdPartyScripts++;
        
        // Estimate load impact
        if (!script.async && !script.defer) {
          impact.blockingScripts++;
          impact.estimatedLoadTime += 200; // Rough estimate in ms
        } else if (script.async) {
          impact.asyncScripts++;
          impact.estimatedLoadTime += 50;
        } else if (script.defer) {
          impact.deferredScripts++;
          impact.estimatedLoadTime += 30;
        }
      }
    });

    // Calculate impact score (lower is better)
    impact.impactScore = Math.min(100, 
      (impact.blockingScripts * 20) + 
      (impact.asyncScripts * 5) + 
      (impact.deferredScripts * 2)
    );

    // Generate recommendations
    if (impact.blockingScripts > 0) {
      impact.recommendations.push({
        type: 'blocking-scripts',
        priority: 'high',
        description: `${impact.blockingScripts} blocking third-party scripts detected`,
        solution: 'Add async or defer attributes to non-critical scripts'
      });
    }

    if (impact.totalThirdPartyScripts > 10) {
      impact.recommendations.push({
        type: 'script-count',
        priority: 'medium',
        description: `High number of third-party scripts (${impact.totalThirdPartyScripts})`,
        solution: 'Consider consolidating or removing unnecessary third-party services'
      });
    }

    return impact;
  }

  /**
   * Analyze privacy implications
   * @private
   */
  _analyzePrivacyImplications(document) {
    const privacy = {
      trackingServices: 0,
      dataCollection: [],
      compliance: {
        cookieConsent: false,
        privacyPolicy: false,
        gdprNotice: false
      },
      riskLevel: 'low',
      recommendations: []
    };

    // Count tracking services
    const scripts = Array.from(this.safeQuery(document, 'script'));
    scripts.forEach(script => {
      if (script.src) {
        const service = this._identifyService(script.src);
        if (service && ['analytics', 'advertising'].includes(service.category)) {
          privacy.trackingServices++;
          privacy.dataCollection.push(service.name);
        }
      }
    });

    // Check compliance indicators
    privacy.compliance.cookieConsent = this._detectCookieConsent(document);
    privacy.compliance.privacyPolicy = this._detectPrivacyPolicy(document);
    privacy.compliance.gdprNotice = this._detectGDPRCompliance(document);

    // Assess risk level
    if (privacy.trackingServices > 5) {
      privacy.riskLevel = 'high';
    } else if (privacy.trackingServices > 2) {
      privacy.riskLevel = 'medium';
    }

    return privacy;
  }

  /**
   * Generate analysis summary
   * @private
   */
  _generateSummary(analysis) {
    return {
      totalThirdPartyServices: analysis.scripts.thirdParty.length,
      categoriesDetected: this._getUniqueCategories(analysis),
      performanceImpact: analysis.performanceImpact.impactScore,
      privacyRisk: analysis.privacyImplications.riskLevel,
      cdnUsage: analysis.cdnUsage.detected.length > 0,
      recommendations: this._generateRecommendations(analysis)
    };
  }

  /**
   * Helper methods
   */
  _isThirdPartyURL(url, hostname) {
    try {
      const urlObj = new URL(url);
      const docHostname = hostname || 'localhost';
      return urlObj.hostname !== docHostname && !urlObj.hostname.endsWith(`.${docHostname}`);
    } catch {
      return false;
    }
  }

  _identifyService(url) {
    const allServices = Object.assign({}, 
      ...Object.values(THIRD_PARTY_SERVICES)
    );
    
    for (const [domain, service] of Object.entries(allServices)) {
      if (url.includes(domain)) {
        return service;
      }
    }
    return null;
  }

  _detectCDN(url) {
    const cdnServices = THIRD_PARTY_SERVICES.CDN;
    for (const [domain, service] of Object.entries(cdnServices)) {
      if (url.includes(domain)) {
        return service;
      }
    }
    return null;
  }

  _analyzeResourceType(document, selector, attribute) {
    const elements = Array.from(this.safeQuery(document, selector));
    const docHostname = document.location ? document.location.hostname : 'localhost';
    return {
      total: elements.length,
      external: elements.filter(el => 
        el[attribute] && this._isThirdPartyURL(el[attribute], docHostname)
      ).length,
      thirdParty: elements
        .filter(el => el[attribute] && this._isThirdPartyURL(el[attribute], docHostname))
        .map(el => ({
          url: el[attribute],
          service: this._identifyService(el[attribute])
        }))
    };
  }

  _analyzeFonts(document) {
    const fontLinks = Array.from(this.safeQuery(document, 'link[rel="preconnect"], link[href*="fonts"]'));
    const fontFaces = Array.from(this.safeQuery(document, 'style')).filter(style => 
      style.innerHTML.includes('@font-face') || style.innerHTML.includes('font-family')
    );

    return {
      external: fontLinks.length,
      embedded: fontFaces.length,
      services: fontLinks.map(link => this._identifyService(link.href)).filter(Boolean)
    };
  }

  _analyzeInlineScript(content) {
    return {
      size: content.length,
      containsTracking: /gtag|ga\(|fbq|_gaq/.test(content),
      containsAjax: /fetch|XMLHttpRequest|ajax/.test(content),
      containsDOM: /document\.|getElementById|querySelector/.test(content),
      minified: content.length > 500 && !/\s{2,}/.test(content.substring(0, 200))
    };
  }

  _isSuspiciousScript(src, content) {
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /eval\(/,
      /document\.write/,
      /fromCharCode/,
      /unescape/,
      /\\x[0-9a-f]{2}/i
    ];

    return suspiciousPatterns.some(pattern => 
      (src && pattern.test(src)) || (content && pattern.test(content))
    );
  }

  _detectCookieConsent(document) {
    const consentSelectors = [
      '[id*="cookie"]', '[class*="cookie"]', '[id*="consent"]', '[class*="consent"]',
      '[id*="gdpr"]', '[class*="gdpr"]', '[id*="privacy"]', '[class*="privacy"]'
    ];
    
    return consentSelectors.some(selector => this.safeQuery(document, selector).length > 0);
  }

  _detectPrivacyPolicy(document) {
    const privacyLinks = Array.from(this.safeQuery(document, 'a'));
    return privacyLinks.some(link => 
      /privacy|policy/i.test(link.textContent) || /privacy|policy/i.test(link.href)
    );
  }

  _detectGDPRCompliance(document) {
    const content = document.body.textContent.toLowerCase();
    return /gdpr|general data protection regulation|data protection/i.test(content);
  }

  _getUniqueCategories(analysis) {
    const categories = new Set();
    analysis.scripts.thirdParty.forEach(script => {
      if (script.service) {
        categories.add(script.service.category);
      }
    });
    return Array.from(categories);
  }

  _generateRecommendations(analysis) {
    const recommendations = [];
    
    // Performance recommendations
    if (analysis.performanceImpact.blockingScripts > 0) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        title: 'Optimize Script Loading',
        description: `${analysis.performanceImpact.blockingScripts} blocking scripts detected`,
        action: 'Add async/defer attributes to non-critical third-party scripts'
      });
    }

    // Privacy recommendations
    if (analysis.privacyImplications.trackingServices > 0 && !analysis.privacyImplications.compliance.cookieConsent) {
      recommendations.push({
        category: 'privacy',
        priority: 'high',
        title: 'Add Cookie Consent',
        description: 'Tracking services detected without cookie consent mechanism',
        action: 'Implement cookie consent banner for GDPR compliance'
      });
    }

    // CDN recommendations
    if (analysis.cdnUsage.detected.length === 0) {
      recommendations.push({
        category: 'performance',
        priority: 'medium',
        title: 'Consider CDN Usage',
        description: 'No CDN usage detected for static assets',
        action: 'Use CDN for better performance and reliability'
      });
    }

    return recommendations;
  }
}
