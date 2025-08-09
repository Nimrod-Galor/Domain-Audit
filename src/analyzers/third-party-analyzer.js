/**
 * Third-Party Scripts and Services Analyzer
 * Detects and analyzes external scripts, tracking services, and third-party integrations
 * 
 * @fileoverview Comprehensive analysis of third-party dependencies for performance and privacy insights
 * @version 1.0.0
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @date 2025-08-02
 * @extends BaseAnalyzer
 */

import { BaseAnalyzer } from '../core/base-analyzer.js';
import { AnalyzerCategories } from '../utils/analyzer-categories.js';

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
 * @extends BaseAnalyzer
 */
export class ThirdPartyAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('ThirdPartyAnalyzer');
    
    this.category = AnalyzerCategories.SECURITY;
    this.config = {
      includeInlineScripts: options.includeInlineScripts !== false,
      analyzeDataUrls: options.analyzeDataUrls !== false,
      trackingDetection: options.trackingDetection !== false,
      performanceImpact: options.performanceImpact !== false,
      ...options
    };
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'ThirdPartyAnalyzer',
      version: '1.0.0',
      category: AnalyzerCategories.SECURITY,
      description: 'Analyzes third-party scripts, tracking services, and external dependencies',
      author: 'Nimrod Galor',
      capabilities: [
        'Third-party script detection',
        'Tracking service identification',
        'Privacy impact assessment',
        'Performance impact analysis',
        'Security risk evaluation'
      ]
    };
  }

  /**
   * Validate the context before analysis
   * @param {Object} context - Analysis context
   * @returns {boolean} Whether the context is valid
   */
  validate(context) {
    return context && 
           context.dom && 
           context.dom.window && 
           context.dom.window.document;
  }

  /**
   * Analyze third-party scripts and services on a page
   * @param {Object} context - Analysis context containing dom, pageData, etc.
   * @returns {Object} Third-party analysis results
   */
  async analyze(context) {
    try {
      this.log('Starting third-party services analysis');
      
      // Validate context
      if (!this.validate(context)) {
        throw new Error('Invalid context provided for third-party analysis');
      }

      const { dom, pageData = {} } = context;
      const document = dom.window.document;
      
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

      // Generate summary and BaseAnalyzer integration
      analysis.summary = this._generateSummary(analysis);
      
      // BaseAnalyzer integration: comprehensive scoring and summary
      const comprehensiveScore = this._calculateComprehensiveScore(analysis);
      const recommendations = this._generateThirdPartyRecommendations(analysis);
      const summary = this._generateThirdPartySummary(analysis);
      
      this.log('Third-party services analysis completed successfully');
      
      return {
        ...analysis,
        score: comprehensiveScore,
        recommendations: [...(analysis.recommendations || []), ...recommendations],
        enhancedSummary: summary,
        metadata: this.getMetadata()
      };
    } catch (error) {
      return this.handleError('Third-party analysis failed', error, {
        scripts: null,
        resources: null,
        summary: null,
        score: 0,
        recommendations: []
      });
    }
  }

  /**
   * Analyze all script elements on the page
   * @private
   */
  _analyzeScripts(document) {
    const scripts = Array.from(document.querySelectorAll('script'));
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
        const isThirdParty = this._isThirdPartyURL(src, document.location.hostname);
        
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
        if (this.config.includeInlineScripts && script.innerHTML) {
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
    const allResources = [
      ...Array.from(document.querySelectorAll('script[src]')).map(el => ({ type: 'script', url: el.src })),
      ...Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(el => ({ type: 'style', url: el.href })),
      ...Array.from(document.querySelectorAll('img')).map(el => ({ type: 'image', url: el.src }))
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
      script: document.querySelectorAll('script[src]').length,
      style: document.querySelectorAll('link[rel="stylesheet"]').length,
      image: document.querySelectorAll('img').length
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
    const scripts = Array.from(document.querySelectorAll('script'));
    
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

    const scripts = Array.from(document.querySelectorAll('script'));
    
    scripts.forEach(script => {
      if (script.src && this._isThirdPartyURL(script.src, document.location.hostname)) {
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
    const scripts = Array.from(document.querySelectorAll('script'));
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
      return urlObj.hostname !== hostname && !urlObj.hostname.endsWith(`.${hostname}`);
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
    const elements = Array.from(document.querySelectorAll(selector));
    return {
      total: elements.length,
      external: elements.filter(el => 
        el[attribute] && this._isThirdPartyURL(el[attribute], document.location.hostname)
      ).length,
      thirdParty: elements
        .filter(el => el[attribute] && this._isThirdPartyURL(el[attribute], document.location.hostname))
        .map(el => ({
          url: el[attribute],
          service: this._identifyService(el[attribute])
        }))
    };
  }

  _analyzeFonts(document) {
    const fontLinks = Array.from(document.querySelectorAll('link[rel="preconnect"], link[href*="fonts"]'));
    const fontFaces = Array.from(document.querySelectorAll('style')).filter(style => 
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
    
    return consentSelectors.some(selector => document.querySelector(selector));
  }

  _detectPrivacyPolicy(document) {
    const privacyLinks = Array.from(document.querySelectorAll('a'));
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

  /**
   * Calculate comprehensive third-party score for BaseAnalyzer integration
   * @param {Object} analysis - Third-party analysis results
   * @returns {number} Comprehensive score (0-100)
   */
  _calculateComprehensiveScore(analysis) {
    try {
      const weights = {
        security: 0.30,         // 30% - Security and privacy risks
        performance: 0.25,      // 25% - Performance impact
        tracking: 0.20,         // 20% - Tracking and privacy
        resources: 0.15,        // 15% - Resource optimization
        compliance: 0.10        // 10% - Regulatory compliance
      };

      let totalScore = 0;
      let totalWeight = 0;

      // Security score (inverse of risk level)
      if (analysis.scripts) {
        const externalScripts = analysis.scripts.external?.length || 0;
        const unsafeScripts = analysis.scripts.external?.filter(s => 
          !s.async && !s.defer && !s.integrity
        ).length || 0;
        
        const securityScore = Math.max(0, 100 - (unsafeScripts * 10) - (externalScripts * 2));
        totalScore += securityScore * weights.security;
        totalWeight += weights.security;
      }

      // Performance score
      if (analysis.performanceImpact) {
        const blockingScripts = analysis.performanceImpact.blockingScripts || 0;
        const performanceScore = Math.max(0, 100 - (blockingScripts * 15));
        totalScore += performanceScore * weights.performance;
        totalWeight += weights.performance;
      }

      // Tracking score (privacy-focused)
      if (analysis.tracking) {
        const trackingServices = analysis.tracking.services?.length || 0;
        const trackingScore = Math.max(0, 100 - (trackingServices * 12));
        totalScore += trackingScore * weights.tracking;
        totalWeight += weights.tracking;
      }

      // Resource optimization score
      if (analysis.resources) {
        const externalResources = analysis.resources.external?.length || 0;
        const resourceScore = Math.max(0, 100 - (externalResources * 3));
        totalScore += resourceScore * weights.resources;
        totalWeight += weights.resources;
      }

      // Compliance score
      if (analysis.privacyImplications) {
        let complianceScore = 60; // Base score
        
        if (analysis.privacyImplications.compliance?.cookieConsent) complianceScore += 20;
        if (analysis.privacyImplications.compliance?.privacyPolicy) complianceScore += 10;
        if (analysis.privacyImplications.compliance?.dataProcessing) complianceScore += 10;
        
        totalScore += complianceScore * weights.compliance;
        totalWeight += weights.compliance;
      }

      return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    } catch (error) {
      this.log('Error calculating comprehensive score:', error.message);
      return 0;
    }
  }

  /**
   * Generate comprehensive third-party recommendations
   * @param {Object} analysis - Third-party analysis results
   * @returns {Array} Enhanced recommendations
   */
  _generateThirdPartyRecommendations(analysis) {
    const recommendations = [];

    try {
      // Security and integrity recommendations
      if (analysis.scripts?.external) {
        const scriptsWithoutIntegrity = analysis.scripts.external.filter(s => !s.integrity);
        if (scriptsWithoutIntegrity.length > 0) {
          recommendations.push({
            category: 'security',
            priority: 'high',
            title: 'Add Subresource Integrity (SRI)',
            description: `${scriptsWithoutIntegrity.length} external scripts lack integrity checks`,
            impact: 'Security vulnerability to script tampering',
            actionItems: [
              'Add integrity attributes to external scripts',
              'Use SRI hash generators for verification',
              'Implement fallback mechanisms for failed loads',
              'Monitor third-party script changes'
            ]
          });
        }
      }

      // Performance optimization recommendations
      if (analysis.performanceImpact?.blockingScripts > 0) {
        recommendations.push({
          category: 'performance',
          priority: 'high',
          title: 'Optimize Script Loading Strategy',
          description: `${analysis.performanceImpact.blockingScripts} render-blocking scripts detected`,
          impact: 'Page load performance and user experience',
          actionItems: [
            'Add async attribute to non-critical scripts',
            'Use defer for scripts that need DOM',
            'Implement critical CSS inlining',
            'Consider script bundling and minification',
            'Use resource hints (preload, prefetch, dns-prefetch)'
          ]
        });
      }

      // Privacy and compliance recommendations
      if (analysis.tracking?.services?.length > 0) {
        const trackingCount = analysis.tracking.services.length;
        recommendations.push({
          category: 'privacy',
          priority: 'high',
          title: 'Implement Privacy Controls',
          description: `${trackingCount} tracking services require privacy consideration`,
          impact: 'Legal compliance and user trust',
          actionItems: [
            'Implement cookie consent management',
            'Add privacy policy and data processing notices',
            'Consider GDPR/CCPA compliance requirements',
            'Implement opt-out mechanisms for tracking',
            'Regular audit of third-party data collection'
          ]
        });
      }

      // CDN and resource optimization
      if (analysis.cdnUsage?.cdnDetected === false) {
        recommendations.push({
          category: 'performance',
          priority: 'medium',
          title: 'Implement CDN Strategy',
          description: 'No CDN usage detected for static assets',
          impact: 'Global performance and reliability',
          actionItems: [
            'Evaluate CDN providers for static assets',
            'Implement geographic distribution strategy',
            'Configure proper cache headers',
            'Monitor CDN performance and availability'
          ]
        });
      }

      // Resource consolidation recommendations
      if (analysis.resources?.external?.length > 10) {
        recommendations.push({
          category: 'optimization',
          priority: 'medium',
          title: 'Consolidate External Resources',
          description: `${analysis.resources.external.length} external resources may impact performance`,
          impact: 'Network requests and loading efficiency',
          actionItems: [
            'Audit necessity of all external resources',
            'Bundle and minimize HTTP requests',
            'Implement resource prioritization',
            'Consider self-hosting critical resources'
          ]
        });
      }

      return recommendations;
    } catch (error) {
      this.log('Error generating third-party recommendations:', error.message);
      return [];
    }
  }

  /**
   * Generate comprehensive third-party summary
   * @param {Object} analysis - Third-party analysis results
   * @returns {Object} Third-party summary
   */
  _generateThirdPartySummary(analysis) {
    try {
      const summary = {
        totalExternalScripts: 0,
        totalTrackingServices: 0,
        securityRisk: 'Low',
        privacyRisk: 'Low',
        performanceImpact: 'Low',
        keyFindings: []
      };

      // Count external scripts
      if (analysis.scripts?.external) {
        summary.totalExternalScripts = analysis.scripts.external.length;
      }

      // Count tracking services
      if (analysis.tracking?.services) {
        summary.totalTrackingServices = analysis.tracking.services.length;
      }

      // Assess security risk
      const scriptsWithoutIntegrity = analysis.scripts?.external?.filter(s => !s.integrity).length || 0;
      if (scriptsWithoutIntegrity > 3) summary.securityRisk = 'High';
      else if (scriptsWithoutIntegrity > 1) summary.securityRisk = 'Medium';

      // Assess privacy risk
      if (summary.totalTrackingServices > 5) summary.privacyRisk = 'High';
      else if (summary.totalTrackingServices > 2) summary.privacyRisk = 'Medium';

      // Assess performance impact
      const blockingScripts = analysis.performanceImpact?.blockingScripts || 0;
      if (blockingScripts > 3) summary.performanceImpact = 'High';
      else if (blockingScripts > 1) summary.performanceImpact = 'Medium';

      // Generate key findings
      if (summary.totalExternalScripts > 0) {
        summary.keyFindings.push(`${summary.totalExternalScripts} external scripts detected`);
      }
      
      if (summary.totalTrackingServices > 0) {
        summary.keyFindings.push(`${summary.totalTrackingServices} tracking services identified`);
      }
      
      if (scriptsWithoutIntegrity > 0) {
        summary.keyFindings.push(`${scriptsWithoutIntegrity} scripts lack integrity protection`);
      }
      
      if (blockingScripts > 0) {
        summary.keyFindings.push(`${blockingScripts} render-blocking scripts found`);
      }

      return summary;
    } catch (error) {
      this.log('Error generating third-party summary:', error.message);
      return {
        totalExternalScripts: 0,
        totalTrackingServices: 0,
        securityRisk: 'Unknown',
        privacyRisk: 'Unknown',
        performanceImpact: 'Unknown',
        keyFindings: ['Analysis error occurred']
      };
    }
  }

  // ============================================================================
  // LEGACY COMPATIBILITY METHODS
  // ============================================================================

  /**
   * @deprecated Use analyze() method instead
   * Legacy method for backward compatibility
   */
  analyzeThirdPartyServices(dom, pageData = {}) {
    console.warn('ThirdPartyAnalyzer.analyzeThirdPartyServices() is deprecated. Use analyze() method instead.');
    return this.analyze({ dom, pageData });
  }
}
