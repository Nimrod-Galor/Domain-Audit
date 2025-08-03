/**
 * Resource Loading Times and Performance Analyzer
 * Analyzes resource loading patterns, critical rendering path, and performance bottlenecks
 * 
 * @fileoverview Advanced performance analysis focusing on resource loading optimization
 * @version 1.0.0
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @date 2025-08-02
 */

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
 * Resource Loading Times and Performance Analyzer Class
 */
export class ResourceAnalyzer {
  constructor(options = {}) {
    this.config = {
      analyzeInlineResources: options.analyzeInlineResources !== false,
      estimateLoadTimes: options.estimateLoadTimes !== false,
      criticalPathAnalysis: options.criticalPathAnalysis !== false,
      optimizationSuggestions: options.optimizationSuggestions !== false,
      ...options
    };
  }

  /**
   * Analyze resource loading patterns and performance impact
   * @param {Object} dom - JSDOM document object
   * @param {Object} pageData - Existing page data including response time and size
   * @returns {Object} Resource loading analysis
   */
  analyzeResourceLoading(dom, pageData = {}) {
    try {
      const document = dom.window.document;
      
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
}
