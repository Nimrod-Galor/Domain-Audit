/**
 * Enhanced Resource Loading Times and Performance Analyzer
 * Comprehensive analysis of resource loading patterns, critical rendering path, and performance bottlenecks with BaseAnalyzer integration
 * 
 * @fileoverview Advanced performance analysis focusing on resource loading optimization with professional scoring
 * @extends BaseAnalyzer
 * @version 1.0.0
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @date 2025-08-09
 */

import { BaseAnalyzer } from './core/BaseAnalyzer.js';
import { AnalyzerCategories } from './core/AnalyzerInterface.js';

/**
 * Resource type configurations and performance thresholds
 */
export const RESOURCE_CONFIG = {
  TYPES: {
    CSS: { 
      extensions: ['.css'], 
      mimeTypes: ['text/css'],
      critical: true,
      maxSize: 150000, // 150KB
      maxCount: 10
    },
    JS: { 
      extensions: ['.js', '.mjs'], 
      mimeTypes: ['text/javascript', 'application/javascript', 'application/x-javascript'],
      critical: true,
      maxSize: 300000, // 300KB
      maxCount: 15
    },
    IMAGES: { 
      extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'],
      mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
      critical: false,
      maxSize: 500000, // 500KB
      maxCount: 50
    },
    FONTS: { 
      extensions: ['.woff', '.woff2', '.ttf', '.otf', '.eot'],
      mimeTypes: ['font/woff', 'font/woff2', 'font/ttf', 'font/otf'],
      critical: true,
      maxSize: 100000, // 100KB
      maxCount: 6
    },
    VIDEOS: { 
      extensions: ['.mp4', '.webm', '.ogv'],
      mimeTypes: ['video/mp4', 'video/webm', 'video/ogg'],
      critical: false,
      maxSize: 10000000, // 10MB
      maxCount: 5
    }
  },

  PERFORMANCE_THRESHOLDS: {
    CRITICAL_RESOURCES: 6, // Max critical resources for good performance
    TOTAL_CSS_SIZE: 300000, // 300KB total CSS
    TOTAL_JS_SIZE: 500000, // 500KB total JS
    RENDER_BLOCKING_COUNT: 5, // Max render-blocking resources
    ABOVE_FOLD_IMAGES: 10 // Max above-fold images
  }
};

/**
 * Enhanced Resource Loading Times and Performance Analyzer Class with BaseAnalyzer Integration
 */
export class ResourceAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('ResourceAnalyzer', {
      analyzeInlineResources: options.analyzeInlineResources !== false,
      estimateLoadTimes: options.estimateLoadTimes !== false,
      criticalPathAnalysis: options.criticalPathAnalysis !== false,
      optimizationSuggestions: options.optimizationSuggestions !== false,
      enableCacheAnalysis: options.enableCacheAnalysis !== false,
      enableCompressionAnalysis: options.enableCompressionAnalysis !== false,
      strictValidation: options.strictValidation || false,
      includeRecommendations: options.includeRecommendations !== false,
      ...options
    });

    this.version = '1.0.0';
    this.category = AnalyzerCategories.PERFORMANCE;
    
    this.config = {
      analyzeInlineResources: this.options.analyzeInlineResources,
      estimateLoadTimes: this.options.estimateLoadTimes,
      criticalPathAnalysis: this.options.criticalPathAnalysis,
      optimizationSuggestions: this.options.optimizationSuggestions,
      enableCacheAnalysis: this.options.enableCacheAnalysis,
      enableCompressionAnalysis: this.options.enableCompressionAnalysis
    };
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'ResourceAnalyzer',
      version: '1.0.0',
      description: 'Comprehensive resource loading analysis, performance bottleneck detection, and optimization recommendations',
      category: AnalyzerCategories.PERFORMANCE,
      priority: 'high',
      capabilities: [
        'resource_inventory_analysis',
        'critical_path_optimization',
        'loading_performance_assessment',
        'cache_strategy_analysis',
        'compression_optimization',
        'render_blocking_detection',
        'performance_bottleneck_identification',
        'recommendation_generation'
      ]
    };
  }

  /**
   * Validate analysis context
   * @param {Object} context - Analysis context
   * @returns {boolean} Whether context is valid
   */
  validate(context) {
    try {
      if (!context || typeof context !== 'object') {
        return false;
      }

      const { dom, document } = context;
      if ((!dom || !dom.window?.document) && (!document || !document.querySelector)) {
        this.log('Resource analysis requires a valid DOM document', 'warn');
        return false;
      }

      return true;
    } catch (error) {
      this.handleError('Error validating resource analysis context', error);
      return false;
    }
  }

  /**
   * Perform comprehensive resource analysis with BaseAnalyzer integration
   * @param {Object} context - Analysis context containing DOM and page data
   * @returns {Promise<Object>} Resource analysis results
   */
  async analyze(context) {
    const startTime = Date.now();
    
    try {
      this.log('Starting resource loading analysis', 'info');

      // Validate context
      if (!this.validate(context)) {
        return this.handleError('Invalid context for resource analysis', new Error('Context validation failed'), {
          hasResourceOptimization: false,
          score: 0,
          grade: 'F'
        });
      }

      const { dom, document, pageData = {} } = context;
      const analysisDocument = document || dom.window.document;

      // Perform resource analysis
      const resourceData = await this._performResourceAnalysis(analysisDocument, pageData);
      
      // Calculate comprehensive score
      const score = this._calculateComprehensiveScore(resourceData);
      const grade = this._getGradeFromScore ? this._getGradeFromScore(score) : this._calculateGrade(score);
      
      // Generate recommendations
      const recommendations = this._generateResourceRecommendations(resourceData);
      
      // Generate summary
      const summary = this._generateResourceSummary(resourceData, score);

      const result = {
        success: true,
        data: {
          ...resourceData,
          score,
          grade,
          recommendations,
          summary,
          metadata: this.getMetadata()
        },
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

      this.log(`Resource analysis completed in ${result.executionTime}ms with score ${score}`, 'info');
      return result;

    } catch (error) {
      return this.handleError('Resource analysis failed', error, {
        hasResourceOptimization: false,
        score: 0,
        grade: 'F',
        summary: 'Resource analysis encountered an error'
      });
    }
  }



  /**
   * Internal method to perform resource analysis
   * @param {Document} document - DOM document
   * @param {Object} pageData - Page data
   * @returns {Promise<Object>} Resource analysis results
   */
  async _performResourceAnalysis(document, pageData = {}) {
    try {
      this.log('Analyzing resource loading patterns and performance', 'info');
      
      const analysis = {
        // Resource inventory and classification
        resources: this._inventoryResources(document),
        
        // Critical rendering path analysis
        criticalPath: this._analyzeCriticalRenderingPath(document),
        
        // Loading performance estimation
        loadingPerformance: this._estimateLoadingPerformance(document, pageData),
        
        // Resource optimization opportunities
        optimization: this._analyzeOptimizationOpportunities(document),
        
        // Above-the-fold analysis
        aboveFold: this._analyzeAboveFoldResources(document),
        
        // Resource bundling analysis
        bundling: this._analyzeBundlingOpportunities(document),
        
        // Performance score and recommendations
        score: 0,
        recommendations: []
      };

      // Calculate performance score
      analysis.score = this._calculateResourcePerformanceScore(analysis);
      
      // Generate comprehensive recommendations
      analysis.recommendations = this._generateResourceRecommendations(analysis);
      
      return analysis;
    } catch (error) {
      return {
        error: `Resource loading analysis failed: ${error.message}`,
        resources: null,
        criticalPath: null,
        score: 0
      };
    }
  }

  /**
   * Inventory all resources on the page
   * @private
   */
  _inventoryResources(document) {
    const inventory = {
      css: this._analyzeCSS(document),
      javascript: this._analyzeJavaScript(document),
      images: this._analyzeImages(document),
      fonts: this._analyzeFonts(document),
      videos: this._analyzeVideos(document),
      other: this._analyzeOtherResources(document),
      summary: {}
    };

    // Generate summary statistics
    inventory.summary = this._generateResourceSummary(inventory);
    
    return inventory;
  }

  /**
   * Analyze CSS resources
   * @private
   */
  _analyzeCSS(document) {
    const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    const inlineStyles = Array.from(document.querySelectorAll('style'));
    
    const analysis = {
      external: cssLinks.map(link => this._analyzeResource(link, 'href', 'css')),
      inline: inlineStyles.map(style => ({
        size: style.innerHTML.length,
        content: style.innerHTML.substring(0, 200),
        critical: this._isCriticalCSS(style.innerHTML),
        hasMediaQueries: /@media/.test(style.innerHTML),
        hasAnimations: /@keyframes|animation:|transition:/.test(style.innerHTML)
      })),
      totalExternal: cssLinks.length,
      totalInline: inlineStyles.length,
      totalSize: 0,
      renderBlocking: 0,
      critical: 0
    };

    // Calculate sizes and flags
    analysis.external.forEach(css => {
      if (css.renderBlocking) analysis.renderBlocking++;
      if (css.critical) analysis.critical++;
      analysis.totalSize += css.estimatedSize;
    });

    analysis.inline.forEach(css => {
      analysis.totalSize += css.size;
    });

    return analysis;
  }

  /**
   * Analyze JavaScript resources
   * @private
   */
  _analyzeJavaScript(document) {
    const scripts = Array.from(document.querySelectorAll('script'));
    
    const analysis = {
      external: [],
      inline: [],
      totalExternal: 0,
      totalInline: 0,
      totalSize: 0,
      renderBlocking: 0,
      async: 0,
      defer: 0,
      modules: 0
    };

    scripts.forEach(script => {
      if (script.src) {
        const scriptAnalysis = this._analyzeResource(script, 'src', 'javascript');
        scriptAnalysis.async = script.async;
        scriptAnalysis.defer = script.defer;
        scriptAnalysis.type = script.type;
        scriptAnalysis.module = script.type === 'module';
        
        analysis.external.push(scriptAnalysis);
        analysis.totalExternal++;
        analysis.totalSize += scriptAnalysis.estimatedSize;
        
        if (!script.async && !script.defer) analysis.renderBlocking++;
        if (script.async) analysis.async++;
        if (script.defer) analysis.defer++;
        if (script.type === 'module') analysis.modules++;
      } else if (script.innerHTML.trim()) {
        const inlineScript = {
          size: script.innerHTML.length,
          content: script.innerHTML.substring(0, 200),
          hasJQuery: /\$\(|\$\.|\jQuery/.test(script.innerHTML),
          hasAjax: /fetch|XMLHttpRequest|ajax/.test(script.innerHTML),
          hasAnalytics: /gtag|ga\(|fbq/.test(script.innerHTML),
          minified: this._isMinified(script.innerHTML)
        };
        
        analysis.inline.push(inlineScript);
        analysis.totalInline++;
        analysis.totalSize += inlineScript.size;
      }
    });

    return analysis;
  }

  /**
   * Analyze image resources
   * @private
   */
  _analyzeImages(document) {
    const images = Array.from(document.querySelectorAll('img'));
    const bgImages = this._extractBackgroundImages(document);
    
    const analysis = {
      total: images.length + bgImages.length,
      explicit: images.map(img => this._analyzeImage(img)),
      background: bgImages,
      formats: {},
      lazy: 0,
      responsive: 0,
      withAlt: 0,
      totalEstimatedSize: 0,
      aboveFold: 0
    };

    // Analyze explicit images
    analysis.explicit.forEach(img => {
      if (img.format) {
        analysis.formats[img.format] = (analysis.formats[img.format] || 0) + 1;
      }
      if (img.lazy) analysis.lazy++;
      if (img.responsive) analysis.responsive++;
      if (img.hasAlt) analysis.withAlt++;
      if (img.aboveFold) analysis.aboveFold++;
      analysis.totalEstimatedSize += img.estimatedSize;
    });

    return analysis;
  }

  /**
   * Analyze font resources
   * @private
   */
  _analyzeFonts(document) {
    const fontLinks = Array.from(document.querySelectorAll('link[rel="preload"][as="font"], link[href*="fonts"]'));
    const fontFaces = this._extractFontFaces(document);
    
    return {
      external: fontLinks.map(link => this._analyzeResource(link, 'href', 'font')),
      embedded: fontFaces,
      totalExternal: fontLinks.length,
      totalEmbedded: fontFaces.length,
      preloaded: document.querySelectorAll('link[rel="preload"][as="font"]').length,
      googleFonts: fontLinks.filter(link => link.href && link.href.includes('fonts.googleapis.com')).length
    };
  }

  /**
   * Analyze video resources
   * @private
   */
  _analyzeVideos(document) {
    const videos = Array.from(document.querySelectorAll('video'));
    const videoSources = Array.from(document.querySelectorAll('video source'));
    
    return {
      total: videos.length,
      withControls: videos.filter(v => v.controls).length,
      autoplay: videos.filter(v => v.autoplay).length,
      muted: videos.filter(v => v.muted).length,
      sources: videoSources.map(source => this._analyzeResource(source, 'src', 'video')),
      embeds: this._analyzeVideoEmbeds(document)
    };
  }

  /**
   * Analyze critical rendering path
   * @private
   */
  _analyzeCriticalRenderingPath(document) {
    const critical = {
      renderBlockingCSS: 0,
      renderBlockingJS: 0,
      criticalResources: [],
      estimatedCRP: 0, // Critical Resource Path length
      recommendations: []
    };

    // Analyze CSS blocking
    const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    cssLinks.forEach(link => {
      if (!link.media || link.media === 'all' || link.media === 'screen') {
        critical.renderBlockingCSS++;
        critical.criticalResources.push({
          type: 'css',
          url: link.href,
          blocking: true
        });
      }
    });

    // Analyze JS blocking
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    scripts.forEach(script => {
      if (!script.async && !script.defer) {
        critical.renderBlockingJS++;
        critical.criticalResources.push({
          type: 'javascript',
          url: script.src,
          blocking: true
        });
      }
    });

    // Estimate CRP depth
    critical.estimatedCRP = Math.max(critical.renderBlockingCSS, critical.renderBlockingJS, 1);

    // Generate recommendations
    if (critical.renderBlockingCSS > RESOURCE_CONFIG.PERFORMANCE_THRESHOLDS.RENDER_BLOCKING_COUNT) {
      critical.recommendations.push({
        type: 'css-blocking',
        priority: 'high',
        description: `${critical.renderBlockingCSS} render-blocking CSS files`,
        solution: 'Inline critical CSS and defer non-critical stylesheets'
      });
    }

    if (critical.renderBlockingJS > 0) {
      critical.recommendations.push({
        type: 'js-blocking',
        priority: 'high',
        description: `${critical.renderBlockingJS} render-blocking JavaScript files`,
        solution: 'Add async or defer attributes to non-critical scripts'
      });
    }

    return critical;
  }

  /**
   * Estimate loading performance
   * @private
   */
  _estimateLoadingPerformance(document, pageData) {
    const performance = {
      estimatedLoadTime: 0,
      bottlenecks: [],
      parallelLoading: true,
      resourceOrder: 'optimized',
      networkUtilization: 0
    };

    // Calculate estimated load time based on resource types and sizes
    const resources = this._inventoryResources(document);
    
    // Critical path resources (blocking)
    const criticalResources = resources.css.renderBlocking + resources.javascript.renderBlocking;
    performance.estimatedLoadTime += criticalResources * 150; // 150ms per critical resource

    // Parallel resources (non-blocking)
    const parallelResources = Math.max(
      resources.images.total - resources.images.aboveFold,
      resources.css.totalExternal - resources.css.renderBlocking,
      resources.javascript.async + resources.javascript.defer
    );
    performance.estimatedLoadTime += parallelResources * 50; // 50ms for parallel resources

    // Identify bottlenecks
    if (resources.css.totalSize > RESOURCE_CONFIG.PERFORMANCE_THRESHOLDS.TOTAL_CSS_SIZE) {
      performance.bottlenecks.push({
        type: 'css-size',
        severity: 'medium',
        description: `Large CSS size: ${Math.round(resources.css.totalSize / 1024)}KB`
      });
    }

    if (resources.javascript.totalSize > RESOURCE_CONFIG.PERFORMANCE_THRESHOLDS.TOTAL_JS_SIZE) {
      performance.bottlenecks.push({
        type: 'js-size',
        severity: 'high',
        description: `Large JavaScript size: ${Math.round(resources.javascript.totalSize / 1024)}KB`
      });
    }

    return performance;
  }

  /**
   * Analyze optimization opportunities
   * @private
   */
  _analyzeOptimizationOpportunities(document) {
    const opportunities = {
      compression: this._analyzeCompressionOpportunities(document),
      caching: this._analyzeCachingOpportunities(document),
      minification: this._analyzeMinificationOpportunities(document),
      bundling: this._analyzeBundlingOpportunities(document),
      lazyLoading: this._analyzeLazyLoadingOpportunities(document),
      modernFormats: this._analyzeModernFormatOpportunities(document)
    };

    return opportunities;
  }

  /**
   * Helper methods for resource analysis
   */
  _analyzeResource(element, attribute, type) {
    const url = element[attribute];
    if (!url) return null;

    return {
      url,
      type,
      size: this._estimateResourceSize(url, type),
      estimatedSize: this._estimateResourceSize(url, type),
      format: this._getResourceFormat(url),
      critical: this._isResourceCritical(element, type),
      renderBlocking: this._isRenderBlocking(element, type),
      crossOrigin: element.crossOrigin,
      integrity: element.integrity,
      loading: element.loading,
      async: element.async,
      defer: element.defer
    };
  }

  _analyzeImage(img) {
    return {
      src: img.src,
      alt: img.alt,
      hasAlt: !!img.alt,
      width: img.width,
      height: img.height,
      format: this._getImageFormat(img.src),
      lazy: img.loading === 'lazy',
      responsive: img.sizes || img.srcset,
      estimatedSize: this._estimateImageSize(img),
      aboveFold: this._isAboveFold(img)
    };
  }

  _estimateResourceSize(url, type) {
    // Rough size estimation based on resource type and URL patterns
    const sizeEstimates = {
      css: 50000,      // 50KB
      javascript: 100000, // 100KB
      image: 200000,   // 200KB
      font: 80000,     // 80KB
      video: 5000000   // 5MB
    };

    return sizeEstimates[type] || 10000;
  }

  _getResourceFormat(url) {
    const extension = url.split('.').pop().split('?')[0].toLowerCase();
    return extension;
  }

  _getImageFormat(src) {
    if (!src) return 'unknown';
    const format = src.split('.').pop().split('?')[0].toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(format) ? format : 'unknown';
  }

  _isResourceCritical(element, type) {
    if (type === 'css') {
      return !element.media || element.media === 'all' || element.media === 'screen';
    }
    if (type === 'javascript') {
      return !element.async && !element.defer;
    }
    return false;
  }

  _isRenderBlocking(element, type) {
    return this._isResourceCritical(element, type);
  }

  _isCriticalCSS(cssContent) {
    // Simple heuristic: check for common critical CSS patterns
    const criticalPatterns = [
      /body\s*{/, /html\s*{/, /\*\s*{/, // Global styles
      /\.container/, /\.wrapper/, /\.header/, /\.nav/, // Layout
      /font-family/, /font-size/, /color:/, /background/ // Typography and basic styling
    ];
    
    return criticalPatterns.some(pattern => pattern.test(cssContent));
  }

  _isMinified(content) {
    // Check if content appears to be minified
    const lines = content.split('\n');
    const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
    return avgLineLength > 80 && !/\s{2,}/.test(content.substring(0, 200));
  }

  _isAboveFold(element) {
    // Simple heuristic based on document position
    // In a real browser, we'd use getBoundingClientRect()
    const parent = element.parentElement;
    if (!parent) return false;
    
    // Check if element is in the first few hundred pixels
    let currentElement = element;
    let offsetTop = 0;
    
    while (currentElement && offsetTop < 600) { // Rough above-fold estimate
      currentElement = currentElement.previousElementSibling;
      if (currentElement) offsetTop += 100; // Rough estimate
    }
    
    return offsetTop < 600;
  }

  _extractBackgroundImages(document) {
    const elements = Array.from(document.querySelectorAll('*'));
    const bgImages = [];
    
    elements.forEach(el => {
      const style = el.style.backgroundImage || '';
      const matches = style.match(/url\(['"]?([^'"]+)['"]?\)/g);
      if (matches) {
        matches.forEach(match => {
          const url = match.replace(/url\(['"]?/, '').replace(/['"]?\)$/, '');
          bgImages.push({
            url,
            element: el.tagName,
            estimatedSize: this._estimateResourceSize(url, 'image')
          });
        });
      }
    });
    
    return bgImages;
  }

  _extractFontFaces(document) {
    const styles = Array.from(document.querySelectorAll('style'));
    const fontFaces = [];
    
    styles.forEach(style => {
      const fontFaceRegex = /@font-face\s*{[^}]+}/g;
      const matches = style.innerHTML.match(fontFaceRegex);
      if (matches) {
        matches.forEach(match => {
          const urlMatch = match.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (urlMatch) {
            fontFaces.push({
              url: urlMatch[1],
              family: this._extractFontFamily(match),
              weight: this._extractFontWeight(match),
              style: this._extractFontStyle(match)
            });
          }
        });
      }
    });
    
    return fontFaces;
  }

  _analyzeVideoEmbeds(document) {
    const iframes = Array.from(document.querySelectorAll('iframe'));
    const videoEmbeds = iframes.filter(iframe => {
      const src = iframe.src.toLowerCase();
      return src.includes('youtube') || src.includes('vimeo') || src.includes('dailymotion');
    });
    
    return videoEmbeds.map(iframe => ({
      platform: this._getVideoPlatform(iframe.src),
      src: iframe.src,
      width: iframe.width,
      height: iframe.height,
      loading: iframe.loading
    }));
  }

  _getVideoPlatform(src) {
    if (src.includes('youtube')) return 'YouTube';
    if (src.includes('vimeo')) return 'Vimeo';
    if (src.includes('dailymotion')) return 'Dailymotion';
    return 'Other';
  }

  _analyzeOtherResources(document) {
    const preloads = Array.from(document.querySelectorAll('link[rel="preload"]'));
    const prefetches = Array.from(document.querySelectorAll('link[rel="prefetch"]'));
    const preconnects = Array.from(document.querySelectorAll('link[rel="preconnect"]'));
    
    return {
      preloads: preloads.length,
      prefetches: prefetches.length,
      preconnects: preconnects.length,
      resourceHints: preloads.length + prefetches.length + preconnects.length
    };
  }

  _generateResourceSummary(inventory) {
    return {
      totalResources: 
        inventory.css.totalExternal + inventory.css.totalInline +
        inventory.javascript.totalExternal + inventory.javascript.totalInline +
        inventory.images.total + inventory.fonts.totalExternal + inventory.videos.total,
      totalEstimatedSize: 
        inventory.css.totalSize + inventory.javascript.totalSize + 
        inventory.images.totalEstimatedSize,
      criticalResources: inventory.css.critical + inventory.css.renderBlocking,
      optimizationPotential: this._calculateOptimizationPotential(inventory)
    };
  }

  _calculateOptimizationPotential(inventory) {
    let potential = 0;
    
    // Large resource files
    if (inventory.css.totalSize > RESOURCE_CONFIG.PERFORMANCE_THRESHOLDS.TOTAL_CSS_SIZE) potential += 20;
    if (inventory.javascript.totalSize > RESOURCE_CONFIG.PERFORMANCE_THRESHOLDS.TOTAL_JS_SIZE) potential += 30;
    
    // Too many render-blocking resources
    if (inventory.css.renderBlocking > RESOURCE_CONFIG.PERFORMANCE_THRESHOLDS.RENDER_BLOCKING_COUNT) potential += 25;
    
    // Images without optimization
    const unoptimizedImages = inventory.images.total - inventory.images.lazy;
    if (unoptimizedImages > 10) potential += 15;
    
    // No modern image formats
    const modernFormats = (inventory.images.formats.webp || 0) + (inventory.images.formats.avif || 0);
    if (modernFormats === 0 && inventory.images.total > 5) potential += 10;
    
    return Math.min(100, potential);
  }

  _calculateResourcePerformanceScore(analysis) {
    let score = 100;
    
    // Deduct for render-blocking resources
    score -= analysis.criticalPath.renderBlockingCSS * 5;
    score -= analysis.criticalPath.renderBlockingJS * 10;
    
    // Deduct for large resource sizes
    if (analysis.resources.css.totalSize > RESOURCE_CONFIG.PERFORMANCE_THRESHOLDS.TOTAL_CSS_SIZE) {
      score -= 15;
    }
    if (analysis.resources.javascript.totalSize > RESOURCE_CONFIG.PERFORMANCE_THRESHOLDS.TOTAL_JS_SIZE) {
      score -= 20;
    }
    
    // Deduct for too many resources
    if (analysis.resources.summary.totalResources > 100) {
      score -= 10;
    }
    
    // Deduct for unoptimized images
    const imageOptimization = (analysis.resources.images.lazy / Math.max(analysis.resources.images.total, 1)) * 100;
    if (imageOptimization < 50) {
      score -= 15;
    }
    
    return Math.max(0, Math.round(score));
  }

  _generateResourceRecommendations(analysis) {
    const recommendations = [];
    
    // Critical rendering path
    if (analysis.criticalPath.renderBlockingCSS > 3) {
      recommendations.push({
        category: 'critical-path',
        priority: 'high',
        title: 'Reduce Render-Blocking CSS',
        description: `${analysis.criticalPath.renderBlockingCSS} render-blocking CSS files detected`,
        action: 'Inline critical CSS and defer non-critical stylesheets with media queries'
      });
    }
    
    if (analysis.criticalPath.renderBlockingJS > 0) {
      recommendations.push({
        category: 'critical-path',
        priority: 'high',
        title: 'Eliminate Render-Blocking JavaScript',
        description: `${analysis.criticalPath.renderBlockingJS} render-blocking scripts found`,
        action: 'Add async or defer attributes to non-critical JavaScript'
      });
    }
    
    // Resource sizes
    if (analysis.resources.css.totalSize > RESOURCE_CONFIG.PERFORMANCE_THRESHOLDS.TOTAL_CSS_SIZE) {
      recommendations.push({
        category: 'optimization',
        priority: 'medium',
        title: 'Optimize CSS Size',
        description: `CSS size is ${Math.round(analysis.resources.css.totalSize / 1024)}KB (target: <300KB)`,
        action: 'Minify CSS, remove unused styles, and consider code splitting'
      });
    }
    
    // Image optimization
    if (analysis.resources.images.lazy / Math.max(analysis.resources.images.total, 1) < 0.5) {
      recommendations.push({
        category: 'optimization',
        priority: 'medium',
        title: 'Implement Lazy Loading',
        description: `Only ${analysis.resources.images.lazy} of ${analysis.resources.images.total} images use lazy loading`,
        action: 'Add loading="lazy" to below-fold images'
      });
    }
    
    // Modern formats
    const hasModernFormats = (analysis.resources.images.formats.webp || 0) + 
                           (analysis.resources.images.formats.avif || 0) > 0;
    if (!hasModernFormats && analysis.resources.images.total > 5) {
      recommendations.push({
        category: 'optimization',
        priority: 'medium',
        title: 'Use Modern Image Formats',
        description: 'No WebP or AVIF images detected',
        action: 'Convert images to WebP or AVIF for better compression'
      });
    }
    
    return recommendations;
  }

  // Helper methods for font analysis
  _extractFontFamily(fontFaceRule) {
    const match = fontFaceRule.match(/font-family:\s*['"]?([^'";]+)['"]?/);
    return match ? match[1] : 'Unknown';
  }

  _extractFontWeight(fontFaceRule) {
    const match = fontFaceRule.match(/font-weight:\s*([^;]+)/);
    return match ? match[1].trim() : 'normal';
  }

  _extractFontStyle(fontFaceRule) {
    const match = fontFaceRule.match(/font-style:\s*([^;]+)/);
    return match ? match[1].trim() : 'normal';
  }

  // Optimization analysis methods
  _analyzeCompressionOpportunities(document) {
    // Analyze if resources could benefit from compression
    return {
      textResources: 0, // CSS, JS, HTML that could be compressed
      compressionSavings: 0 // Estimated size reduction
    };
  }

  _analyzeCachingOpportunities(document) {
    // Analyze caching headers and opportunities
    return {
      cacheableResources: 0,
      longTermCacheable: 0
    };
  }

  _analyzeMinificationOpportunities(document) {
    const opportunities = {
      css: 0,
      javascript: 0,
      estimatedSavings: 0
    };
    
    // Check inline styles for minification opportunities
    const styles = Array.from(document.querySelectorAll('style'));
    styles.forEach(style => {
      if (!this._isMinified(style.innerHTML)) {
        opportunities.css++;
        opportunities.estimatedSavings += style.innerHTML.length * 0.3; // Rough 30% savings
      }
    });
    
    // Check inline scripts
    const scripts = Array.from(document.querySelectorAll('script'));
    scripts.forEach(script => {
      if (script.innerHTML && !this._isMinified(script.innerHTML)) {
        opportunities.javascript++;
        opportunities.estimatedSavings += script.innerHTML.length * 0.4; // Rough 40% savings
      }
    });
    
    return opportunities;
  }

  _analyzeLazyLoadingOpportunities(document) {
    const images = Array.from(document.querySelectorAll('img'));
    const belowFoldImages = images.filter(img => !this._isAboveFold(img));
    
    return {
      totalImages: images.length,
      belowFoldImages: belowFoldImages.length,
      alreadyLazy: images.filter(img => img.loading === 'lazy').length,
      opportunities: belowFoldImages.filter(img => img.loading !== 'lazy').length
    };
  }

  _analyzeModernFormatOpportunities(document) {
    const images = Array.from(document.querySelectorAll('img'));
    const formats = {};
    
    images.forEach(img => {
      const format = this._getImageFormat(img.src);
      formats[format] = (formats[format] || 0) + 1;
    });
    
    const legacyFormats = (formats.jpg || 0) + (formats.jpeg || 0) + (formats.png || 0);
    const modernFormats = (formats.webp || 0) + (formats.avif || 0);
    
    return {
      legacyFormats,
      modernFormats,
      conversionOpportunity: legacyFormats > 0 && modernFormats === 0,
      estimatedSavings: legacyFormats * 0.3 // Rough 30% size reduction
    };
  }

  _analyzeBundlingOpportunities(document) {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    return {
      scriptBundles: {
        total: scripts.length,
        opportunities: Math.max(0, scripts.length - 3), // Ideal: max 3 script files
        estimatedSavings: Math.max(0, scripts.length - 3) * 50 // 50ms per additional request
      },
      styleBundles: {
        total: stylesheets.length,
        opportunities: Math.max(0, stylesheets.length - 2), // Ideal: max 2 CSS files
        estimatedSavings: Math.max(0, stylesheets.length - 2) * 30 // 30ms per additional request
      },
      totalOpportunities: Math.max(0, scripts.length - 3) + Math.max(0, stylesheets.length - 2)
    };
  }

  _analyzeAboveFoldResources(document) {
    const images = Array.from(document.querySelectorAll('img'));
    const aboveFoldImages = images.filter(img => this._isAboveFold(img));
    
    return {
      totalAboveFold: aboveFoldImages.length,
      optimized: aboveFoldImages.filter(img => 
        img.loading !== 'lazy' && (img.srcset || img.sizes)
      ).length,
      needsOptimization: aboveFoldImages.filter(img => 
        img.loading === 'lazy' || (!img.srcset && !img.sizes)
      ).length
    };
  }

  // ============================================================================
  // BaseAnalyzer Integration Helper Methods
  // ============================================================================

  /**
   * Calculate comprehensive resource performance score
   * @param {Object} resourceData - Complete resource analysis data
   * @returns {number} Score (0-100)
   */
  _calculateComprehensiveScore(resourceData) {
    const weights = {
      resources: 0.3,
      loadingTimes: 0.25,
      criticalPath: 0.2,
      optimization: 0.15,
      caching: 0.1
    };
    
    // Resource efficiency score
    let resourceScore = 100;
    if (resourceData.resources) {
      const totalResources = resourceData.resources.summary?.total || 0;
      const totalSize = resourceData.resources.summary?.totalSize || 0;
      
      // Penalize excessive resources
      if (totalResources > 50) resourceScore -= Math.min(30, (totalResources - 50) * 2);
      
      // Penalize large total size (>2MB)
      if (totalSize > 2000000) resourceScore -= Math.min(25, (totalSize - 2000000) / 100000);
    }
    resourceScore = Math.max(0, resourceScore);
    
    // Loading performance score
    let loadingScore = 100;
    if (resourceData.loadingTimes?.estimatedPageLoad) {
      const pageLoadTime = resourceData.loadingTimes.estimatedPageLoad;
      if (pageLoadTime > 3000) loadingScore -= Math.min(40, (pageLoadTime - 3000) / 100);
    }
    loadingScore = Math.max(0, loadingScore);
    
    // Critical path score
    let criticalScore = 100;
    if (resourceData.criticalPath) {
      const renderBlocking = (resourceData.criticalPath.renderBlockingCSS || 0) + 
                            (resourceData.criticalPath.renderBlockingJS || 0);
      if (renderBlocking > 3) criticalScore -= renderBlocking * 10;
    }
    criticalScore = Math.max(0, criticalScore);
    
    // Optimization score
    let optimizationScore = 100;
    if (resourceData.optimization?.opportunities) {
      const opportunities = resourceData.optimization.opportunities.length || 0;
      optimizationScore = Math.max(0, 100 - (opportunities * 8));
    }
    
    // Caching score
    let cachingScore = 100;
    if (resourceData.caching) {
      const cacheable = resourceData.caching.cacheable || 0;
      const total = resourceData.caching.total || 1;
      cachingScore = Math.round((cacheable / total) * 100);
    }
    
    const totalScore = Math.round(
      (resourceScore * weights.resources) +
      (loadingScore * weights.loadingTimes) +
      (criticalScore * weights.criticalPath) +
      (optimizationScore * weights.optimization) +
      (cachingScore * weights.caching)
    );
    
    return Math.min(100, Math.max(0, totalScore));
  }

  /**
   * Generate comprehensive resource recommendations
   * @param {Object} resourceData - Complete resource analysis data
   * @returns {Array} Array of recommendation objects
   */
  _generateResourceRecommendations(resourceData) {
    const recommendations = [];
    
    // Critical path optimization
    if (resourceData.criticalPath?.renderBlockingCSS > 2) {
      recommendations.push({
        category: 'critical',
        title: 'Eliminate Render-Blocking CSS',
        description: `${resourceData.criticalPath.renderBlockingCSS} render-blocking stylesheets detected`,
        impact: 'high',
        implementation: 'Inline critical CSS and load non-critical CSS asynchronously'
      });
    }
    
    if (resourceData.criticalPath?.renderBlockingJS > 1) {
      recommendations.push({
        category: 'critical',
        title: 'Eliminate Render-Blocking JavaScript',
        description: `${resourceData.criticalPath.renderBlockingJS} render-blocking scripts detected`,
        impact: 'high',
        implementation: 'Add async or defer attributes to non-critical JavaScript'
      });
    }
    
    // Resource size optimization
    const totalSize = resourceData.resources?.summary?.totalSize || 0;
    if (totalSize > 2000000) { // >2MB
      recommendations.push({
        category: 'optimization',
        title: 'Reduce Total Resource Size',
        description: `Total resource size is ${Math.round(totalSize / 1024 / 1024)}MB`,
        impact: 'medium',
        implementation: 'Optimize images, minify CSS/JS, and implement code splitting'
      });
    }
    
    // Image optimization
    if (resourceData.resources?.images) {
      const { total, optimized } = resourceData.resources.images;
      const optimizationRate = total > 0 ? optimized / total : 1;
      
      if (optimizationRate < 0.7) {
        recommendations.push({
          category: 'optimization',
          title: 'Optimize Images',
          description: `${total - optimized} images need optimization`,
          impact: 'medium',
          implementation: 'Use modern formats (WebP, AVIF), lazy loading, and responsive images'
        });
      }
    }
    
    // Bundling opportunities
    if (resourceData.bundling?.totalOpportunities > 3) {
      recommendations.push({
        category: 'optimization',
        title: 'Bundle Resources',
        description: `${resourceData.bundling.totalOpportunities} bundling opportunities detected`,
        impact: 'medium',
        implementation: 'Combine CSS and JavaScript files to reduce HTTP requests'
      });
    }
    
    // Caching optimization
    if (resourceData.caching) {
      const cacheRate = resourceData.caching.total > 0 ? 
        resourceData.caching.cacheable / resourceData.caching.total : 0;
      
      if (cacheRate < 0.8) {
        recommendations.push({
          category: 'enhancement',
          title: 'Improve Caching Strategy',
          description: `${Math.round((1 - cacheRate) * 100)}% of resources lack proper caching`,
          impact: 'medium',
          implementation: 'Add cache headers and implement browser caching for static resources'
        });
      }
    }
    
    // Performance opportunities
    if (resourceData.optimization?.opportunities?.length > 0) {
      resourceData.optimization.opportunities.forEach(opportunity => {
        recommendations.push({
          category: 'enhancement',
          title: opportunity.type,
          description: opportunity.description,
          impact: opportunity.impact || 'low',
          implementation: opportunity.suggestion
        });
      });
    }
    
    return recommendations;
  }

  /**
   * Generate resource analysis summary
   * @param {Object} resourceData - Complete resource analysis data
   * @param {number} score - Overall score
   * @returns {string} Analysis summary
   */
  _generateResourceSummary(resourceData, score) {
    const totalResources = resourceData.resources?.summary?.total || 0;
    const totalSize = resourceData.resources?.summary?.totalSize || 0;
    const renderBlocking = (resourceData.criticalPath?.renderBlockingCSS || 0) + 
                          (resourceData.criticalPath?.renderBlockingJS || 0);
    
    if (renderBlocking > 3) {
      return `Resource loading has ${renderBlocking} render-blocking resources that significantly impact page performance.`;
    }
    
    if (totalSize > 3000000) { // >3MB
      return `Page resources are ${Math.round(totalSize / 1024 / 1024)}MB, exceeding recommended limits and affecting load times.`;
    }
    
    if (score >= 90) {
      return `Excellent resource optimization with ${totalResources} resources (${Math.round(totalSize / 1024)}KB) and minimal render-blocking issues.`;
    } else if (score >= 70) {
      return `Good resource setup with ${totalResources} resources but ${renderBlocking} optimization opportunities for better performance.`;
    } else if (score >= 50) {
      return `Basic resource loading with ${totalResources} resources. Focus on reducing render-blocking and optimizing file sizes.`;
    } else {
      return `Poor resource optimization with ${totalResources} resources requiring comprehensive performance improvements.`;
    }
  }

  /**
   * Calculate resource completeness percentage
   * @param {Object} resourceData - Resource analysis data
   * @returns {Object} Completeness analysis
   */
  _calculateResourceCompleteness(resourceData) {
    const factors = [
      { name: 'Resource Optimization', weight: 25, present: (resourceData.resources?.summary?.totalSize || 0) < 2000000 },
      { name: 'No Render Blocking CSS', weight: 20, present: (resourceData.criticalPath?.renderBlockingCSS || 0) <= 2 },
      { name: 'No Render Blocking JS', weight: 20, present: (resourceData.criticalPath?.renderBlockingJS || 0) <= 1 },
      { name: 'Image Optimization', weight: 15, present: resourceData.resources?.images ? (resourceData.resources.images.optimized / Math.max(resourceData.resources.images.total, 1)) > 0.7 : true },
      { name: 'Caching Strategy', weight: 10, present: resourceData.caching ? (resourceData.caching.cacheable / Math.max(resourceData.caching.total, 1)) > 0.8 : false },
      { name: 'Bundle Optimization', weight: 10, present: (resourceData.bundling?.totalOpportunities || 0) <= 3 }
    ];
    
    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
    const achievedWeight = factors.reduce((sum, factor) => sum + (factor.present ? factor.weight : 0), 0);
    
    return {
      percentage: Math.round((achievedWeight / totalWeight) * 100),
      factors: factors,
      achieved: achievedWeight,
      total: totalWeight
    };
  }

  /**
   * Legacy resource recommendations method for backward compatibility
   * @param {Object} analysis - Resource analysis data
   * @returns {Array} Array of recommendation objects
   */
  _generateResourceRecommendationsLegacy(analysis) {
    const recommendations = [];

    // Convert new format to legacy format
    if (analysis.criticalPath?.renderBlockingCSS > 2) {
      recommendations.push({
        type: 'critical-path',
        priority: 'high',
        title: 'Eliminate Render-Blocking CSS',
        description: `${analysis.criticalPath.renderBlockingCSS} render-blocking stylesheets found`,
        impact: 'page-speed',
      });
    }

    if (analysis.criticalPath?.renderBlockingJS > 1) {
      recommendations.push({
        type: 'critical-path',
        priority: 'high',
        title: 'Eliminate Render-Blocking JavaScript',
        description: `${analysis.criticalPath.renderBlockingJS} render-blocking scripts found`,
        impact: 'page-speed',
      });
    }

    if ((analysis.resources?.summary?.totalSize || 0) > 2000000) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        title: 'Optimize Resource Size',
        description: 'Total resource size exceeds recommended limits',
        impact: 'load-time',
      });
    }

    return recommendations;
  }

  /**
   * Calculate grade from score (fallback method)
   * @param {number} score - Score (0-100)
   * @returns {string} Grade letter
   */
  _calculateGrade(score) {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 67) return 'D+';
    if (score >= 60) return 'D';
    return 'F';
  }
}
