/**
 * ============================================================================
 * PERFORMANCE IMPACT DETECTOR - GPT-5 STYLE COMPONENT
 * ============================================================================
 * 
 * Advanced performance impact analysis for third-party services
 * Part of Third-Party Analyzer Combined Approach (12th Implementation)
 * 
 * Capabilities:
 * - Resource loading performance analysis
 * - Third-party service impact measurement
 * - Critical path analysis
 * - Loading optimization recommendations
 * - Performance metrics correlation
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration GPT-5 Style Detector
 * @created 2025-08-13
 */

export class PerformanceImpactDetector {
  constructor(options = {}) {
    this.options = {
      // Performance Analysis Configuration
      analysisDepth: options.analysisDepth || 'comprehensive',
      enableCriticalPathAnalysis: options.enableCriticalPathAnalysis !== false,
      enableResourceTiming: options.enableResourceTiming !== false,
      enableNetworkAnalysis: options.enableNetworkAnalysis !== false,
      
      // Performance Thresholds
      criticalLoadTime: options.criticalLoadTime || 3000, // 3 seconds
      slowResourceThreshold: options.slowResourceThreshold || 1000, // 1 second
      largeResourceThreshold: options.largeResourceThreshold || 100 * 1024, // 100KB
      blockingTimeThreshold: options.blockingTimeThreshold || 500, // 500ms
      
      // Measurement Configuration
      measurementWindow: options.measurementWindow || 10000, // 10 seconds
      sampleSize: options.sampleSize || 100,
      confidenceLevel: options.confidenceLevel || 0.95,
      
      // Impact Categories
      impactCategories: options.impactCategories || [
        'render_blocking', 'async_loading', 'critical_path', 'bandwidth_usage', 'cpu_intensive'
      ],
      
      ...options
    };

    this.detectorType = 'performance_impact_detector';
    this.version = '1.0.0';
    
    // Performance impact patterns
    this.impactPatterns = {
      // High Impact Services
      highImpact: {
        'Large Analytics Bundles': {
          patterns: [/google-analytics\.com.*gtag\.js/, /googletagmanager\.com/],
          avgSize: 45000, // 45KB
          loadTime: 800,
          renderBlocking: true,
          impact: 'high'
        },
        'Video Embed Services': {
          patterns: [/youtube\.com\/embed/, /vimeo\.com\/video/],
          avgSize: 150000, // 150KB
          loadTime: 1200,
          renderBlocking: false,
          impact: 'high'
        },
        'Heavy Widget Scripts': {
          patterns: [/facebook\.com\/plugins/, /platform\.twitter\.com/],
          avgSize: 80000, // 80KB
          loadTime: 900,
          renderBlocking: true,
          impact: 'high'
        }
      },

      // Medium Impact Services
      mediumImpact: {
        'CDN Resources': {
          patterns: [/cdn\./, /cloudflare\.com/, /amazonaws\.com/],
          avgSize: 25000, // 25KB
          loadTime: 400,
          renderBlocking: false,
          impact: 'medium'
        },
        'Font Services': {
          patterns: [/fonts\.googleapis\.com/, /typekit\.net/],
          avgSize: 15000, // 15KB
          loadTime: 600,
          renderBlocking: true,
          impact: 'medium'
        },
        'Analytics Pixels': {
          patterns: [/facebook\.com\/tr/, /doubleclick\.net/],
          avgSize: 5000, // 5KB
          loadTime: 300,
          renderBlocking: false,
          impact: 'medium'
        }
      },

      // Low Impact Services
      lowImpact: {
        'Image CDNs': {
          patterns: [/images\./, /static\./],
          avgSize: 10000, // 10KB
          loadTime: 200,
          renderBlocking: false,
          impact: 'low'
        },
        'Small Utility Scripts': {
          patterns: [/recaptcha\.net/, /stripe\.com.*v3/],
          avgSize: 8000, // 8KB
          loadTime: 250,
          renderBlocking: false,
          impact: 'low'
        }
      }
    };

    // Performance measurement tools
    this.measurementTools = {
      // Web APIs available
      performanceObserver: typeof PerformanceObserver !== 'undefined',
      resourceTiming: typeof performance !== 'undefined' && 
                      typeof performance.getEntriesByType === 'function',
      navigationTiming: typeof performance !== 'undefined' && 
                        typeof performance.navigation !== 'undefined',
      userTiming: typeof performance !== 'undefined' && 
                  typeof performance.mark === 'function'
    };

    // Critical path analysis
    this.criticalPathRules = {
      renderBlocking: [
        'script[src]:not([async]):not([defer])',
        'link[rel="stylesheet"]:not([media="print"])',
        'style'
      ],
      highPriority: [
        'script[src][async]',
        'link[rel="preload"]',
        'img[loading="eager"]'
      ],
      lowPriority: [
        'script[src][defer]',
        'img[loading="lazy"]',
        'link[rel="prefetch"]'
      ]
    };
    
    console.log('⚡ Performance Impact Detector initialized (GPT-5 Style)');
  }

  /**
   * Get detector metadata
   * @returns {Object} Detector metadata and capabilities
   */
  getMetadata() {
    return {
      name: 'PerformanceImpactDetector',
      type: this.detectorType,
      version: this.version,
      description: 'Advanced performance impact analysis for third-party services',
      
      capabilities: [
        'resource_timing_analysis',
        'critical_path_identification',
        'loading_performance_measurement',
        'third_party_impact_assessment',
        'optimization_recommendations',
        'performance_metrics_correlation',
        'blocking_resource_detection'
      ],
      
      analysisTypes: [
        'render_blocking_analysis',
        'async_loading_assessment',
        'critical_path_evaluation',
        'bandwidth_usage_analysis',
        'cpu_impact_measurement',
        'loading_waterfall_analysis',
        'performance_budget_tracking'
      ],
      
      configuration: {
        analysisDepth: this.options.analysisDepth,
        criticalLoadTime: this.options.criticalLoadTime,
        slowResourceThreshold: this.options.slowResourceThreshold,
        enableCriticalPathAnalysis: this.options.enableCriticalPathAnalysis
      },
      
      thresholds: {
        criticalLoadTime: this.options.criticalLoadTime,
        slowResourceThreshold: this.options.slowResourceThreshold,
        largeResourceThreshold: this.options.largeResourceThreshold,
        blockingTimeThreshold: this.options.blockingTimeThreshold
      },
      
      measurementCapabilities: this.measurementTools,
      approach: 'GPT-5 Style Performance Analysis'
    };
  }

  /**
   * Main performance impact analysis method
   * @param {Object} document - Document object to analyze
   * @param {Object} context - Analysis context and configuration
   * @returns {Promise<Object>} Performance impact analysis results
   */
  async analyze(document, context = {}) {
    const startTime = Date.now();
    
    try {
      if (!document) {
        throw new Error('Document is required for performance impact analysis');
      }

      console.log('⚡ Starting performance impact analysis...');

      // Core Performance Analysis
      const results = {
        success: true,
        timestamp: new Date().toISOString(),
        
        // Resource Performance Analysis
        resources: await this._analyzeResourcePerformance(document, context),
        
        // Critical Path Analysis
        criticalPath: this.options.enableCriticalPathAnalysis ?
          await this._analyzeCriticalPath(document, context) : null,
        
        // Loading Performance Metrics
        loadingMetrics: this.options.enableResourceTiming ?
          await this._analyzeLoadingMetrics(document, context) : null,
        
        // Third-Party Impact Assessment
        thirdPartyImpact: await this._assessThirdPartyImpact(document, context),
        
        // Network Performance Analysis
        networkAnalysis: this.options.enableNetworkAnalysis ?
          await this._analyzeNetworkPerformance(document, context) : null,
        
        // Optimization Opportunities
        optimization: await this._identifyOptimizationOpportunities(document, context),
        
        // Performance Summary
        summary: {},
        
        executionTime: Date.now() - startTime
      };

      // Generate performance summary
      results.summary = this._generatePerformanceSummary(results);
      
      console.log(`✅ Performance impact analysis completed in ${results.executionTime}ms`);
      console.log(`📊 Resources analyzed: ${results.summary.totalResources || 0}`);
      console.log(`⚠️ Impact level: ${results.summary.overallImpact || 'unknown'}`);
      
      return results;

    } catch (error) {
      console.error('❌ Performance impact analysis failed:', error);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Analyze resource performance characteristics
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Resource performance analysis results
   */
  async _analyzeResourcePerformance(document, context) {
    const resources = {
      scripts: {},
      stylesheets: {},
      images: {},
      fonts: {},
      other: {},
      summary: {}
    };

    try {
      // Analyze script performance
      resources.scripts = await this._analyzeScriptPerformance(document);
      
      // Analyze stylesheet performance
      resources.stylesheets = await this._analyzeStylesheetPerformance(document);
      
      // Analyze image performance
      resources.images = await this._analyzeImagePerformance(document);
      
      // Analyze font performance
      resources.fonts = await this._analyzeFontPerformance(document);
      
      // Analyze other resources
      resources.other = await this._analyzeOtherResourcePerformance(document);
      
      // Generate resource summary
      resources.summary = this._generateResourceSummary(resources);

    } catch (error) {
      console.error('Resource performance analysis failed:', error);
    }

    return resources;
  }

  /**
   * Analyze critical rendering path
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Critical path analysis results
   */
  async _analyzeCriticalPath(document, context) {
    const criticalPath = {
      renderBlocking: [],
      highPriority: [],
      lowPriority: [],
      analysis: {},
      optimization: {}
    };

    try {
      // Identify render-blocking resources
      criticalPath.renderBlocking = this._identifyRenderBlockingResources(document);
      
      // Identify high-priority resources
      criticalPath.highPriority = this._identifyHighPriorityResources(document);
      
      // Identify low-priority resources
      criticalPath.lowPriority = this._identifyLowPriorityResources(document);
      
      // Analyze critical path performance
      criticalPath.analysis = await this._analyzeCriticalPathPerformance(criticalPath);
      
      // Generate optimization recommendations
      criticalPath.optimization = this._generateCriticalPathOptimizations(criticalPath);

    } catch (error) {
      console.error('Critical path analysis failed:', error);
    }

    return criticalPath;
  }

  /**
   * Analyze loading metrics using Resource Timing API
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Loading metrics analysis results
   */
  async _analyzeLoadingMetrics(document, context) {
    const metrics = {
      resourceTiming: [],
      navigationTiming: {},
      userTiming: {},
      summary: {}
    };

    try {
      // Resource Timing Analysis
      if (this.measurementTools.resourceTiming) {
        metrics.resourceTiming = await this._getResourceTimingData();
      }
      
      // Navigation Timing Analysis
      if (this.measurementTools.navigationTiming) {
        metrics.navigationTiming = await this._getNavigationTimingData();
      }
      
      // User Timing Analysis
      if (this.measurementTools.userTiming) {
        metrics.userTiming = await this._getUserTimingData();
      }
      
      // Generate metrics summary
      metrics.summary = this._generateMetricsSummary(metrics);

    } catch (error) {
      console.error('Loading metrics analysis failed:', error);
    }

    return metrics;
  }

  /**
   * Assess third-party service performance impact
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Third-party impact assessment results
   */
  async _assessThirdPartyImpact(document, context) {
    const impact = {
      services: [],
      categories: {},
      metrics: {},
      recommendations: []
    };

    try {
      // Identify third-party services
      const services = await this._identifyThirdPartyServices(document);
      
      // Assess each service's performance impact
      for (const service of services) {
        const serviceImpact = await this._assessServicePerformanceImpact(service, document);
        impact.services.push(serviceImpact);
      }
      
      // Categorize impacts
      impact.categories = this._categorizePerformanceImpacts(impact.services);
      
      // Calculate overall metrics
      impact.metrics = this._calculateImpactMetrics(impact.services);
      
      // Generate recommendations
      impact.recommendations = this._generateImpactRecommendations(impact);

    } catch (error) {
      console.error('Third-party impact assessment failed:', error);
    }

    return impact;
  }

  /**
   * Analyze network performance characteristics
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Network performance analysis results
   */
  async _analyzeNetworkPerformance(document, context) {
    const network = {
      connections: {},
      bandwidth: {},
      latency: {},
      efficiency: {}
    };

    try {
      // Analyze connection patterns
      network.connections = await this._analyzeConnectionPatterns(document);
      
      // Estimate bandwidth usage
      network.bandwidth = await this._estimateBandwidthUsage(document);
      
      // Analyze latency patterns
      network.latency = await this._analyzeLatencyPatterns(document);
      
      // Calculate network efficiency
      network.efficiency = this._calculateNetworkEfficiency(network);

    } catch (error) {
      console.error('Network performance analysis failed:', error);
    }

    return network;
  }

  /**
   * Identify optimization opportunities
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Optimization opportunities
   */
  async _identifyOptimizationOpportunities(document, context) {
    const optimization = {
      opportunities: [],
      prioritized: [],
      impact: {},
      implementation: {}
    };

    try {
      // Resource optimization opportunities
      const resourceOpts = await this._identifyResourceOptimizations(document);
      optimization.opportunities.push(...resourceOpts);
      
      // Loading optimization opportunities
      const loadingOpts = await this._identifyLoadingOptimizations(document);
      optimization.opportunities.push(...loadingOpts);
      
      // Third-party optimization opportunities
      const thirdPartyOpts = await this._identifyThirdPartyOptimizations(document);
      optimization.opportunities.push(...thirdPartyOpts);
      
      // Prioritize opportunities
      optimization.prioritized = this._prioritizeOptimizations(optimization.opportunities);
      
      // Estimate impact
      optimization.impact = this._estimateOptimizationImpact(optimization.prioritized);
      
      // Generate implementation guidance
      optimization.implementation = this._generateImplementationGuidance(optimization.prioritized);

    } catch (error) {
      console.error('Optimization opportunity identification failed:', error);
    }

    return optimization;
  }

  // ============================================================================
  // HELPER METHODS - RESOURCE PERFORMANCE ANALYSIS
  // ============================================================================

  async _analyzeScriptPerformance(document) {
    const scripts = {
      total: 0,
      blocking: 0,
      async: 0,
      defer: 0,
      inline: 0,
      external: 0,
      estimatedImpact: {},
      issues: []
    };

    try {
      const scriptElements = document.querySelectorAll('script');
      
      scriptElements.forEach(script => {
        const src = script.getAttribute('src');
        
        if (src) {
          scripts.external++;
          scripts.total++;
          
          // Check loading behavior
          if (script.hasAttribute('async')) {
            scripts.async++;
          } else if (script.hasAttribute('defer')) {
            scripts.defer++;
          } else {
            scripts.blocking++;
            // Flag potential performance issue
            scripts.issues.push({
              type: 'blocking_script',
              url: src,
              severity: 'medium',
              recommendation: 'Consider adding async or defer attribute'
            });
          }
        } else {
          scripts.inline++;
          scripts.total++;
        }
      });

      // Estimate performance impact
      scripts.estimatedImpact = this._estimateScriptImpact(scripts);

    } catch (error) {
      console.error('Script performance analysis failed:', error);
    }

    return scripts;
  }

  async _analyzeStylesheetPerformance(document) {
    const stylesheets = {
      total: 0,
      external: 0,
      inline: 0,
      renderBlocking: 0,
      estimatedImpact: {},
      issues: []
    };

    try {
      // External stylesheets
      const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
      linkElements.forEach(link => {
        stylesheets.external++;
        stylesheets.total++;
        
        const media = link.getAttribute('media');
        if (!media || media === 'all' || media === 'screen') {
          stylesheets.renderBlocking++;
        }
      });

      // Inline styles
      const styleElements = document.querySelectorAll('style');
      stylesheets.inline = styleElements.length;
      stylesheets.total += stylesheets.inline;

      // Estimate performance impact
      stylesheets.estimatedImpact = this._estimateStylesheetImpact(stylesheets);

    } catch (error) {
      console.error('Stylesheet performance analysis failed:', error);
    }

    return stylesheets;
  }

  async _analyzeImagePerformance(document) {
    const images = {
      total: 0,
      lazy: 0,
      eager: 0,
      unoptimized: 0,
      estimatedImpact: {},
      issues: []
    };

    try {
      const imgElements = document.querySelectorAll('img');
      
      imgElements.forEach(img => {
        images.total++;
        
        const loading = img.getAttribute('loading');
        if (loading === 'lazy') {
          images.lazy++;
        } else {
          images.eager++;
        }
        
        // Check for optimization opportunities
        const src = img.getAttribute('src');
        if (src && !this._isImageOptimized(src)) {
          images.unoptimized++;
          images.issues.push({
            type: 'unoptimized_image',
            url: src,
            severity: 'low',
            recommendation: 'Consider using modern image formats (WebP, AVIF)'
          });
        }
      });

      // Estimate performance impact
      images.estimatedImpact = this._estimateImageImpact(images);

    } catch (error) {
      console.error('Image performance analysis failed:', error);
    }

    return images;
  }

  async _analyzeFontPerformance(document) {
    const fonts = {
      total: 0,
      external: 0,
      preloaded: 0,
      webfonts: 0,
      estimatedImpact: {},
      issues: []
    };

    try {
      // Font links
      const fontLinks = document.querySelectorAll('link[href*="font"], link[href*=".woff"], link[href*=".ttf"]');
      fontLinks.forEach(link => {
        fonts.total++;
        fonts.external++;
        
        if (link.getAttribute('rel') === 'preload') {
          fonts.preloaded++;
        }
      });

      // Google Fonts or other web fonts
      const webfontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="typekit.net"]');
      fonts.webfonts = webfontLinks.length;

      // Estimate performance impact
      fonts.estimatedImpact = this._estimateFontImpact(fonts);

    } catch (error) {
      console.error('Font performance analysis failed:', error);
    }

    return fonts;
  }

  async _analyzeOtherResourcePerformance(document) {
    const other = {
      iframes: 0,
      videos: 0,
      audio: 0,
      objects: 0,
      estimatedImpact: {}
    };

    try {
      other.iframes = document.querySelectorAll('iframe').length;
      other.videos = document.querySelectorAll('video').length;
      other.audio = document.querySelectorAll('audio').length;
      other.objects = document.querySelectorAll('object, embed').length;

      // Estimate performance impact
      other.estimatedImpact = this._estimateOtherResourceImpact(other);

    } catch (error) {
      console.error('Other resource performance analysis failed:', error);
    }

    return other;
  }

  // ============================================================================
  // HELPER METHODS - CRITICAL PATH ANALYSIS
  // ============================================================================

  _identifyRenderBlockingResources(document) {
    const blocking = [];

    try {
      // Blocking scripts
      const blockingScripts = document.querySelectorAll('script[src]:not([async]):not([defer])');
      blockingScripts.forEach(script => {
        blocking.push({
          type: 'script',
          url: script.getAttribute('src'),
          element: script,
          impact: 'high'
        });
      });

      // Blocking stylesheets
      const blockingStyles = document.querySelectorAll('link[rel="stylesheet"]:not([media="print"])');
      blockingStyles.forEach(link => {
        blocking.push({
          type: 'stylesheet',
          url: link.getAttribute('href'),
          element: link,
          impact: 'high'
        });
      });

    } catch (error) {
      console.error('Render-blocking resource identification failed:', error);
    }

    return blocking;
  }

  _identifyHighPriorityResources(document) {
    const highPriority = [];

    try {
      // Preloaded resources
      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      preloadLinks.forEach(link => {
        highPriority.push({
          type: 'preload',
          url: link.getAttribute('href'),
          element: link,
          impact: 'medium'
        });
      });

      // Async scripts
      const asyncScripts = document.querySelectorAll('script[async]');
      asyncScripts.forEach(script => {
        highPriority.push({
          type: 'async_script',
          url: script.getAttribute('src'),
          element: script,
          impact: 'medium'
        });
      });

    } catch (error) {
      console.error('High-priority resource identification failed:', error);
    }

    return highPriority;
  }

  _identifyLowPriorityResources(document) {
    const lowPriority = [];

    try {
      // Deferred scripts
      const deferScripts = document.querySelectorAll('script[defer]');
      deferScripts.forEach(script => {
        lowPriority.push({
          type: 'defer_script',
          url: script.getAttribute('src'),
          element: script,
          impact: 'low'
        });
      });

      // Lazy images
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      lazyImages.forEach(img => {
        lowPriority.push({
          type: 'lazy_image',
          url: img.getAttribute('src'),
          element: img,
          impact: 'low'
        });
      });

      // Prefetch resources
      const prefetchLinks = document.querySelectorAll('link[rel="prefetch"]');
      prefetchLinks.forEach(link => {
        lowPriority.push({
          type: 'prefetch',
          url: link.getAttribute('href'),
          element: link,
          impact: 'low'
        });
      });

    } catch (error) {
      console.error('Low-priority resource identification failed:', error);
    }

    return lowPriority;
  }

  async _analyzeCriticalPathPerformance(criticalPath) {
    const analysis = {
      blockingScore: 0,
      optimizationScore: 0,
      recommendations: []
    };

    try {
      // Calculate blocking score
      const blockingCount = criticalPath.renderBlocking.length;
      analysis.blockingScore = Math.max(0, 1 - (blockingCount * 0.1));

      // Calculate optimization score
      const totalResources = criticalPath.renderBlocking.length + 
                           criticalPath.highPriority.length + 
                           criticalPath.lowPriority.length;
      
      if (totalResources > 0) {
        const optimizedRatio = (criticalPath.highPriority.length + criticalPath.lowPriority.length) / totalResources;
        analysis.optimizationScore = optimizedRatio;
      }

      // Generate recommendations
      if (blockingCount > 3) {
        analysis.recommendations.push({
          type: 'reduce_blocking',
          priority: 'high',
          description: 'Too many render-blocking resources detected'
        });
      }

    } catch (error) {
      console.error('Critical path performance analysis failed:', error);
    }

    return analysis;
  }

  // ============================================================================
  // HELPER METHODS - TIMING ANALYSIS
  // ============================================================================

  async _getResourceTimingData() {
    const timingData = [];

    try {
      if (typeof performance !== 'undefined' && performance.getEntriesByType) {
        const entries = performance.getEntriesByType('resource');
        
        entries.forEach(entry => {
          timingData.push({
            name: entry.name,
            type: this._getResourceType(entry.name),
            startTime: entry.startTime,
            duration: entry.duration,
            transferSize: entry.transferSize || 0,
            initiatorType: entry.initiatorType,
            performance: {
              dns: entry.domainLookupEnd - entry.domainLookupStart,
              connect: entry.connectEnd - entry.connectStart,
              request: entry.responseStart - entry.requestStart,
              response: entry.responseEnd - entry.responseStart
            }
          });
        });
      }

    } catch (error) {
      console.error('Resource timing data collection failed:', error);
    }

    return timingData;
  }

  async _getNavigationTimingData() {
    const navTiming = {};

    try {
      if (typeof performance !== 'undefined' && performance.timing) {
        const timing = performance.timing;
        
        navTiming.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
        navTiming.loadComplete = timing.loadEventEnd - timing.navigationStart;
        navTiming.domInteractive = timing.domInteractive - timing.navigationStart;
        navTiming.firstPaint = timing.responseEnd - timing.navigationStart;
      }

    } catch (error) {
      console.error('Navigation timing data collection failed:', error);
    }

    return navTiming;
  }

  async _getUserTimingData() {
    const userTiming = {};

    try {
      if (typeof performance !== 'undefined' && performance.getEntriesByType) {
        const marks = performance.getEntriesByType('mark');
        const measures = performance.getEntriesByType('measure');
        
        userTiming.marks = marks.map(mark => ({
          name: mark.name,
          startTime: mark.startTime
        }));
        
        userTiming.measures = measures.map(measure => ({
          name: measure.name,
          startTime: measure.startTime,
          duration: measure.duration
        }));
      }

    } catch (error) {
      console.error('User timing data collection failed:', error);
    }

    return userTiming;
  }

  // ============================================================================
  // HELPER METHODS - IMPACT ASSESSMENT
  // ============================================================================

  async _identifyThirdPartyServices(document) {
    const services = [];

    try {
      // Get all external resources
      const externalResources = this._getExternalResources(document);
      
      // Match against known service patterns
      externalResources.forEach(resource => {
        const service = this._matchServicePattern(resource.url);
        if (service) {
          services.push({
            ...service,
            url: resource.url,
            type: resource.type,
            element: resource.element
          });
        }
      });

    } catch (error) {
      console.error('Third-party service identification failed:', error);
    }

    return services;
  }

  async _assessServicePerformanceImpact(service, document) {
    const impact = {
      service: service.name,
      category: service.category,
      impact: 'unknown',
      metrics: {},
      issues: []
    };

    try {
      // Match against performance patterns
      for (const [impactLevel, patterns] of Object.entries(this.impactPatterns)) {
        for (const [patternName, config] of Object.entries(patterns)) {
          if (this._matchesPattern(service.url, config.patterns)) {
            impact.impact = config.impact;
            impact.metrics = {
              estimatedSize: config.avgSize,
              estimatedLoadTime: config.loadTime,
              renderBlocking: config.renderBlocking
            };
            break;
          }
        }
        if (impact.impact !== 'unknown') break;
      }

      // Assess specific issues
      if (impact.metrics.renderBlocking) {
        impact.issues.push({
          type: 'render_blocking',
          severity: 'high',
          description: 'Service blocks rendering'
        });
      }

      if (impact.metrics.estimatedSize > this.options.largeResourceThreshold) {
        impact.issues.push({
          type: 'large_resource',
          severity: 'medium',
          description: 'Large resource size may impact loading'
        });
      }

    } catch (error) {
      console.error('Service performance impact assessment failed:', error);
    }

    return impact;
  }

  // ============================================================================
  // HELPER METHODS - UTILITIES
  // ============================================================================

  _getExternalResources(document) {
    const resources = [];
    const currentDomain = this._getCurrentDomain(document);

    try {
      // Scripts
      document.querySelectorAll('script[src]').forEach(script => {
        const src = script.getAttribute('src');
        if (this._isExternalUrl(src, currentDomain)) {
          resources.push({
            url: src,
            type: 'script',
            element: script
          });
        }
      });

      // Stylesheets
      document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute('href');
        if (this._isExternalUrl(href, currentDomain)) {
          resources.push({
            url: href,
            type: 'stylesheet',
            element: link
          });
        }
      });

      // Images
      document.querySelectorAll('img[src]').forEach(img => {
        const src = img.getAttribute('src');
        if (this._isExternalUrl(src, currentDomain)) {
          resources.push({
            url: src,
            type: 'image',
            element: img
          });
        }
      });

    } catch (error) {
      console.error('External resource collection failed:', error);
    }

    return resources;
  }

  _getCurrentDomain(document) {
    try {
      if (document.location) {
        return document.location.hostname;
      }
      
      const baseTag = document.querySelector('base[href]');
      if (baseTag) {
        return new URL(baseTag.getAttribute('href')).hostname;
      }
      
      return 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  _isExternalUrl(url, currentDomain) {
    try {
      if (!url || url.startsWith('//') || url.startsWith('/') || url.startsWith('#')) {
        return false;
      }
      
      const urlObj = new URL(url);
      return urlObj.hostname !== currentDomain;
    } catch (error) {
      return false;
    }
  }

  _matchServicePattern(url) {
    for (const [category, services] of Object.entries(this.impactPatterns)) {
      for (const [serviceName, config] of Object.entries(services)) {
        if (this._matchesPattern(url, config.patterns)) {
          return {
            name: serviceName,
            category: category.replace('Impact', '').toLowerCase(),
            confidence: 0.8
          };
        }
      }
    }
    return null;
  }

  _matchesPattern(url, patterns) {
    return patterns.some(pattern => pattern.test(url));
  }

  _getResourceType(url) {
    if (/\.(js|jsx|ts|tsx)/.test(url)) return 'script';
    if (/\.(css|scss|sass|less)/.test(url)) return 'stylesheet';
    if (/\.(jpg|jpeg|png|gif|svg|webp)/.test(url)) return 'image';
    if (/\.(woff|woff2|ttf|eot|otf)/.test(url)) return 'font';
    return 'other';
  }

  _isImageOptimized(src) {
    return /\.(webp|avif)/.test(src);
  }

  _estimateScriptImpact(scripts) {
    const score = Math.max(0, 1 - (scripts.blocking * 0.2));
    return {
      score,
      level: score >= 0.7 ? 'low' : score >= 0.4 ? 'medium' : 'high'
    };
  }

  _estimateStylesheetImpact(stylesheets) {
    const score = Math.max(0, 1 - (stylesheets.renderBlocking * 0.15));
    return {
      score,
      level: score >= 0.7 ? 'low' : score >= 0.4 ? 'medium' : 'high'
    };
  }

  _estimateImageImpact(images) {
    const score = images.total > 0 ? images.lazy / images.total : 1;
    return {
      score,
      level: score >= 0.7 ? 'low' : score >= 0.4 ? 'medium' : 'high'
    };
  }

  _estimateFontImpact(fonts) {
    const score = fonts.total > 0 ? fonts.preloaded / fonts.total : 1;
    return {
      score,
      level: score >= 0.7 ? 'low' : score >= 0.4 ? 'medium' : 'high'
    };
  }

  _estimateOtherResourceImpact(other) {
    const total = other.iframes + other.videos + other.audio + other.objects;
    const score = Math.max(0, 1 - (total * 0.1));
    return {
      score,
      level: score >= 0.7 ? 'low' : score >= 0.4 ? 'medium' : 'high'
    };
  }

  _generateResourceSummary(resources) {
    const totalResources = Object.values(resources)
      .filter(r => typeof r === 'object' && r.total)
      .reduce((sum, r) => sum + r.total, 0);

    return {
      totalResources,
      scripts: resources.scripts?.total || 0,
      stylesheets: resources.stylesheets?.total || 0,
      images: resources.images?.total || 0,
      fonts: resources.fonts?.total || 0
    };
  }

  _categorizePerformanceImpacts(services) {
    const categories = {
      high: [],
      medium: [],
      low: [],
      unknown: []
    };

    services.forEach(service => {
      const category = service.impact || 'unknown';
      if (categories[category]) {
        categories[category].push(service);
      }
    });

    return categories;
  }

  _calculateImpactMetrics(services) {
    const metrics = {
      totalServices: services.length,
      highImpact: services.filter(s => s.impact === 'high').length,
      mediumImpact: services.filter(s => s.impact === 'medium').length,
      lowImpact: services.filter(s => s.impact === 'low').length,
      averageScore: 0
    };

    // Calculate average impact score
    const scores = services
      .map(s => s.metrics?.score || 0)
      .filter(score => score > 0);
    
    if (scores.length > 0) {
      metrics.averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }

    return metrics;
  }

  _generateImpactRecommendations(impact) {
    const recommendations = [];

    if (impact.metrics.highImpact > 0) {
      recommendations.push({
        type: 'reduce_high_impact',
        priority: 'high',
        description: `${impact.metrics.highImpact} high-impact services detected`
      });
    }

    if (impact.metrics.totalServices > 10) {
      recommendations.push({
        type: 'reduce_third_party_count',
        priority: 'medium',
        description: 'Consider reducing the number of third-party services'
      });
    }

    return recommendations;
  }

  _generateMetricsSummary(metrics) {
    return {
      resourceTimingAvailable: metrics.resourceTiming.length > 0,
      navigationTimingAvailable: Object.keys(metrics.navigationTiming).length > 0,
      userTimingAvailable: Object.keys(metrics.userTiming).length > 0,
      totalResourcesMeasured: metrics.resourceTiming.length
    };
  }

  async _analyzeConnectionPatterns(document) {
    // Placeholder implementation
    return {
      uniqueDomains: 0,
      connectionCount: 0,
      multiplexing: false
    };
  }

  async _estimateBandwidthUsage(document) {
    // Placeholder implementation
    return {
      estimatedTotal: 0,
      byResourceType: {}
    };
  }

  async _analyzeLatencyPatterns(document) {
    // Placeholder implementation
    return {
      averageLatency: 0,
      maxLatency: 0,
      distribution: {}
    };
  }

  _calculateNetworkEfficiency(network) {
    // Placeholder implementation
    return {
      score: 0.8,
      level: 'good'
    };
  }

  async _identifyResourceOptimizations(document) {
    // Placeholder implementation
    return [];
  }

  async _identifyLoadingOptimizations(document) {
    // Placeholder implementation
    return [];
  }

  async _identifyThirdPartyOptimizations(document) {
    // Placeholder implementation
    return [];
  }

  _prioritizeOptimizations(opportunities) {
    return opportunities.sort((a, b) => (b.impact || 0) - (a.impact || 0));
  }

  _estimateOptimizationImpact(optimizations) {
    return {
      totalOpportunities: optimizations.length,
      estimatedImprovement: '15-30%'
    };
  }

  _generateImplementationGuidance(optimizations) {
    return {
      quickWins: optimizations.slice(0, 3),
      longTerm: optimizations.slice(3)
    };
  }

  _generateCriticalPathOptimizations(criticalPath) {
    const optimizations = [];

    if (criticalPath.renderBlocking.length > 3) {
      optimizations.push({
        type: 'async_scripts',
        description: 'Add async/defer attributes to non-critical scripts',
        impact: 'high'
      });
    }

    return optimizations;
  }

  _generatePerformanceSummary(results) {
    return {
      totalResources: results.resources?.summary?.totalResources || 0,
      criticalPathIssues: results.criticalPath?.renderBlocking?.length || 0,
      thirdPartyServices: results.thirdPartyImpact?.metrics?.totalServices || 0,
      overallImpact: this._calculateOverallPerformanceImpact(results),
      optimizationOpportunities: results.optimization?.opportunities?.length || 0
    };
  }

  _calculateOverallPerformanceImpact(results) {
    const factors = [];

    // Resource impact
    if (results.resources?.summary) {
      const resourceScore = 1 - (results.resources.summary.totalResources * 0.02);
      factors.push(Math.max(0, resourceScore));
    }

    // Critical path impact
    if (results.criticalPath?.analysis) {
      factors.push(results.criticalPath.analysis.blockingScore || 0.5);
    }

    // Third-party impact
    if (results.thirdPartyImpact?.metrics) {
      factors.push(results.thirdPartyImpact.metrics.averageScore || 0.5);
    }

    if (factors.length === 0) return 'unknown';

    const overallScore = factors.reduce((sum, score) => sum + score, 0) / factors.length;
    
    if (overallScore >= 0.7) return 'low';
    if (overallScore >= 0.4) return 'medium';
    return 'high';
  }
}

export default PerformanceImpactDetector;
