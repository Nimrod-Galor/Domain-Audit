/**
 * ============================================================================
 * RESOURCE LOADING DETECTOR - GPT-5 STYLE MODULAR COMPONENT
 * ============================================================================
 * 
 * Advanced resource loading pattern detection and analysis
 * Part of Resource Analyzer Combined Approach (11th Implementation)
 * 
 * Capabilities:
 * - Resource loading pattern analysis
 * - Performance timing detection  
 * - Loading strategy assessment
 * - Critical resource identification
 * - Waterfall analysis
 * 
 * @version 1.0.0
 * @author Development Team  
 * @integration GPT-5 Style Detector
 * @created 2025-08-13
 */

export class ResourceLoadingDetector {
  constructor(options = {}) {
    this.options = {
      // Loading Analysis Configuration
      enableTimingAnalysis: options.enableTimingAnalysis !== false,
      enableWaterfallAnalysis: options.enableWaterfallAnalysis !== false,
      enableCriticalPathAnalysis: options.enableCriticalPathAnalysis !== false,
      enableLoadingStrategyAnalysis: options.enableLoadingStrategyAnalysis !== false,
      
      // Performance Thresholds
      slowResourceThreshold: options.slowResourceThreshold || 1000, // 1 second
      criticalResourceThreshold: options.criticalResourceThreshold || 500, // 500ms
      maxAcceptableLoadTime: options.maxAcceptableLoadTime || 3000, // 3 seconds
      
      // Resource Types to Analyze
      trackCSS: options.trackCSS !== false,
      trackJS: options.trackJS !== false,
      trackImages: options.trackImages !== false,
      trackFonts: options.trackFonts !== false,
      trackVideos: options.trackVideos !== false,
      
      ...options
    };

    this.detectorType = 'resource_loading';
    this.version = '1.0.0';
    
    // Loading pattern signatures
    this.loadingPatterns = {
      blocking: /render-blocking|parser-blocking/i,
      async: /async|defer/i,
      lazy: /lazy|loading=['"]lazy['"]|data-src/i,
      preload: /rel=['"]preload['"]|<link[^>]*preload/i,
      prefetch: /rel=['"]prefetch['"]|<link[^>]*prefetch/i,
      moduleScript: /type=['"]module['"]|import\s+.*from/i,
      inlineScript: /<script(?![^>]*src)[^>]*>/i,
      externalScript: /<script[^>]*src=['"][^'"]+['"][^>]*>/i
    };

    // Critical resource patterns
    this.criticalPatterns = {
      criticalCSS: /critical|above-the-fold|atf/i,
      criticalJS: /critical|essential|required/i,
      criticalFonts: /font-display\s*:\s*swap|font-display\s*:\s*fallback/i,
      renderBlocking: /render-blocking|blocking/i
    };
    
    console.log('🔍 Resource Loading Detector initialized');
  }

  /**
   * Get detector metadata
   * @returns {Object} Detector metadata and capabilities
   */
  getMetadata() {
    return {
      name: 'ResourceLoadingDetector',
      type: this.detectorType,
      version: this.version,
      description: 'Advanced resource loading pattern detection and analysis',
      
      capabilities: [
        'loading_pattern_analysis',
        'performance_timing_detection',
        'critical_resource_identification', 
        'waterfall_analysis',
        'loading_strategy_assessment',
        'render_blocking_detection',
        'async_defer_analysis',
        'lazy_loading_detection',
        'preload_prefetch_analysis'
      ],
      
      supportedResourceTypes: [
        'css', 'javascript', 'images', 'fonts', 'videos', 'documents'
      ],
      
      analysisFeatures: {
        timingAnalysis: this.options.enableTimingAnalysis,
        waterfallAnalysis: this.options.enableWaterfallAnalysis,
        criticalPathAnalysis: this.options.enableCriticalPathAnalysis,
        loadingStrategyAnalysis: this.options.enableLoadingStrategyAnalysis
      },
      
      thresholds: {
        slowResource: this.options.slowResourceThreshold,
        criticalResource: this.options.criticalResourceThreshold,
        maxAcceptableLoad: this.options.maxAcceptableLoadTime
      }
    };
  }

  /**
   * Main detection method - analyze resource loading patterns
   * @param {Object} context - Analysis context with document, performance data
   * @returns {Promise<Object>} Resource loading analysis results
   */
  async detect(context) {
    try {
      const startTime = Date.now();
      const { document, url, performanceData } = context;
      
      if (!document) {
        throw new Error('Document is required for resource loading detection');
      }

      console.log('🔍 Starting resource loading detection...');

      // Core Detection Steps
      const results = {
        success: true,
        timestamp: new Date().toISOString(),
        
        // Resource Discovery
        resources: await this._discoverResources(document, performanceData),
        
        // Loading Pattern Analysis
        loadingPatterns: await this._analyzeLoadingPatterns(document),
        
        // Performance Timing Analysis
        timing: this.options.enableTimingAnalysis ? 
          await this._analyzePerformanceTiming(performanceData) : null,
        
        // Waterfall Analysis
        waterfall: this.options.enableWaterfallAnalysis ?
          await this._analyzeWaterfall(performanceData) : null,
        
        // Critical Path Analysis
        criticalPath: this.options.enableCriticalPathAnalysis ?
          await this._analyzeCriticalPath(document, performanceData) : null,
        
        // Loading Strategy Assessment
        strategies: this.options.enableLoadingStrategyAnalysis ?
          await this._assessLoadingStrategies(document) : null,
        
        // Detection Summary
        summary: {},
        
        executionTime: Date.now() - startTime
      };

      // Generate comprehensive summary
      results.summary = this._generateSummary(results);
      
      console.log(`✅ Resource loading detection completed in ${results.executionTime}ms`);
      console.log(`📊 Detected ${results.resources.count} resources with ${results.loadingPatterns.totalPatterns} loading patterns`);
      
      return results;

    } catch (error) {
      console.error('❌ Resource loading detection failed:', error);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        executionTime: Date.now() - (context.startTime || Date.now())
      };
    }
  }

  /**
   * Discover all resources in the document
   * @param {Document} document - Document to analyze
   * @param {Object} performanceData - Performance timing data
   * @returns {Promise<Object>} Resource discovery results
   */
  async _discoverResources(document, performanceData) {
    const resources = {
      count: 0,
      totalSize: 0,
      types: {},
      list: [],
      performanceEntries: []
    };

    try {
      // Discover CSS resources
      if (this.options.trackCSS) {
        const cssResources = await this._discoverCSSResources(document);
        resources.types.css = cssResources;
        resources.count += cssResources.count;
        resources.totalSize += cssResources.totalSize;
        resources.list.push(...cssResources.list);
      }

      // Discover JavaScript resources  
      if (this.options.trackJS) {
        const jsResources = await this._discoverJSResources(document);
        resources.types.javascript = jsResources;
        resources.count += jsResources.count;
        resources.totalSize += jsResources.totalSize;
        resources.list.push(...jsResources.list);
      }

      // Discover Image resources
      if (this.options.trackImages) {
        const imageResources = await this._discoverImageResources(document);
        resources.types.images = imageResources;
        resources.count += imageResources.count;
        resources.totalSize += imageResources.totalSize;
        resources.list.push(...imageResources.list);
      }

      // Discover Font resources
      if (this.options.trackFonts) {
        const fontResources = await this._discoverFontResources(document);
        resources.types.fonts = fontResources;
        resources.count += fontResources.count;
        resources.totalSize += fontResources.totalSize;
        resources.list.push(...fontResources.list);
      }

      // Discover Video resources
      if (this.options.trackVideos) {
        const videoResources = await this._discoverVideoResources(document);
        resources.types.videos = videoResources;
        resources.count += videoResources.count;
        resources.totalSize += videoResources.totalSize;
        resources.list.push(...videoResources.list);
      }

      // Get performance entries
      if (performanceData && performanceData.getEntriesByType) {
        resources.performanceEntries = performanceData.getEntriesByType('resource') || [];
      }

    } catch (error) {
      console.error('Resource discovery failed:', error);
    }

    return resources;
  }

  /**
   * Discover CSS resources
   * @param {Document} document - Document to analyze
   * @returns {Promise<Object>} CSS resource data
   */
  async _discoverCSSResources(document) {
    const cssData = {
      count: 0,
      totalSize: 0,
      list: [],
      inline: 0,
      external: 0,
      critical: 0,
      renderBlocking: 0
    };

    try {
      // External CSS files
      const linkElements = document.querySelectorAll('link[rel="stylesheet"], link[type="text/css"]');
      
      linkElements.forEach(link => {
        const href = link.href || link.getAttribute('href');
        if (href) {
          const resource = {
            type: 'css',
            subtype: 'external',
            url: href,
            element: link.tagName.toLowerCase(),
            attributes: this._getElementAttributes(link),
            critical: this._isCriticalResource(link, 'css'),
            renderBlocking: !link.disabled && !link.media || link.media === 'all' || link.media === 'screen',
            size: 0 // Will be populated from performance data
          };
          
          cssData.list.push(resource);
          cssData.count++;
          cssData.external++;
          
          if (resource.critical) cssData.critical++;
          if (resource.renderBlocking) cssData.renderBlocking++;
        }
      });

      // Inline CSS
      const styleElements = document.querySelectorAll('style');
      
      styleElements.forEach(style => {
        const content = style.textContent || '';
        const resource = {
          type: 'css',
          subtype: 'inline',
          content: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
          size: content.length,
          element: 'style',
          attributes: this._getElementAttributes(style),
          critical: this._isCriticalResource(style, 'css'),
          renderBlocking: true
        };
        
        cssData.list.push(resource);
        cssData.count++;
        cssData.inline++;
        cssData.totalSize += resource.size;
        
        if (resource.critical) cssData.critical++;
        if (resource.renderBlocking) cssData.renderBlocking++;
      });

    } catch (error) {
      console.error('CSS resource discovery failed:', error);
    }

    return cssData;
  }

  /**
   * Discover JavaScript resources
   * @param {Document} document - Document to analyze
   * @returns {Promise<Object>} JavaScript resource data  
   */
  async _discoverJSResources(document) {
    const jsData = {
      count: 0,
      totalSize: 0,
      list: [],
      inline: 0,
      external: 0,
      async: 0,
      defer: 0,
      module: 0,
      renderBlocking: 0
    };

    try {
      const scriptElements = document.querySelectorAll('script');
      
      scriptElements.forEach(script => {
        const src = script.src || script.getAttribute('src');
        const content = script.textContent || '';
        
        const resource = {
          type: 'javascript',
          subtype: src ? 'external' : 'inline',
          url: src || null,
          content: src ? null : content.substring(0, 200) + (content.length > 200 ? '...' : ''),
          size: src ? 0 : content.length,
          element: 'script',
          attributes: this._getElementAttributes(script),
          async: script.hasAttribute('async'),
          defer: script.hasAttribute('defer'),
          module: script.type === 'module',
          renderBlocking: !script.hasAttribute('async') && !script.hasAttribute('defer'),
          critical: this._isCriticalResource(script, 'javascript')
        };
        
        jsData.list.push(resource);
        jsData.count++;
        
        if (resource.subtype === 'inline') {
          jsData.inline++;
          jsData.totalSize += resource.size;
        } else {
          jsData.external++;
        }
        
        if (resource.async) jsData.async++;
        if (resource.defer) jsData.defer++;
        if (resource.module) jsData.module++;
        if (resource.renderBlocking) jsData.renderBlocking++;
      });

    } catch (error) {
      console.error('JavaScript resource discovery failed:', error);
    }

    return jsData;
  }

  /**
   * Discover Image resources
   * @param {Document} document - Document to analyze
   * @returns {Promise<Object>} Image resource data
   */
  async _discoverImageResources(document) {
    const imageData = {
      count: 0,
      totalSize: 0,
      list: [],
      lazy: 0,
      eager: 0,
      responsive: 0,
      formats: {}
    };

    try {
      const imageElements = document.querySelectorAll('img, picture source, [style*="background-image"]');
      
      imageElements.forEach(img => {
        const src = img.src || img.getAttribute('src') || img.getAttribute('data-src');
        const loading = img.getAttribute('loading');
        
        if (src) {
          const resource = {
            type: 'image',
            url: src,
            element: img.tagName.toLowerCase(),
            attributes: this._getElementAttributes(img),
            loading: loading || 'eager',
            lazy: loading === 'lazy' || img.hasAttribute('data-src'),
            responsive: img.hasAttribute('srcset') || img.hasAttribute('sizes'),
            format: this._getImageFormat(src),
            size: 0 // Will be populated from performance data
          };
          
          imageData.list.push(resource);
          imageData.count++;
          
          if (resource.lazy) imageData.lazy++;
          if (resource.loading === 'eager') imageData.eager++;
          if (resource.responsive) imageData.responsive++;
          
          // Track formats
          if (resource.format) {
            imageData.formats[resource.format] = (imageData.formats[resource.format] || 0) + 1;
          }
        }
      });

    } catch (error) {
      console.error('Image resource discovery failed:', error);
    }

    return imageData;
  }

  /**
   * Discover Font resources
   * @param {Document} document - Document to analyze
   * @returns {Promise<Object>} Font resource data
   */
  async _discoverFontResources(document) {
    const fontData = {
      count: 0,
      totalSize: 0,
      list: [],
      preloaded: 0,
      webfonts: 0,
      systemFonts: 0,
      fontDisplay: {}
    };

    try {
      // Font preload links
      const fontPreloads = document.querySelectorAll('link[rel="preload"][as="font"]');
      
      fontPreloads.forEach(link => {
        const href = link.href || link.getAttribute('href');
        if (href) {
          const resource = {
            type: 'font',
            subtype: 'preload',
            url: href,
            element: 'link',
            attributes: this._getElementAttributes(link),
            preloaded: true,
            format: this._getFontFormat(href),
            size: 0
          };
          
          fontData.list.push(resource);
          fontData.count++;
          fontData.preloaded++;
        }
      });

      // Font face declarations in CSS
      const styleElements = document.querySelectorAll('style');
      
      styleElements.forEach(style => {
        const content = style.textContent || '';
        const fontFaceMatches = content.match(/@font-face\s*{[^}]+}/g) || [];
        
        fontFaceMatches.forEach(fontFace => {
          const urlMatch = fontFace.match(/url\(['"]?([^'")\s]+)['"]?\)/);
          const fontDisplayMatch = fontFace.match(/font-display\s*:\s*([^;]+)/);
          
          if (urlMatch) {
            const resource = {
              type: 'font',
              subtype: 'declaration',
              url: urlMatch[1],
              element: 'style',
              fontDisplay: fontDisplayMatch ? fontDisplayMatch[1].trim() : 'auto',
              format: this._getFontFormat(urlMatch[1]),
              size: 0
            };
            
            fontData.list.push(resource);
            fontData.count++;
            fontData.webfonts++;
            
            // Track font-display values
            const display = resource.fontDisplay;
            fontData.fontDisplay[display] = (fontData.fontDisplay[display] || 0) + 1;
          }
        });
      });

    } catch (error) {
      console.error('Font resource discovery failed:', error);
    }

    return fontData;
  }

  /**
   * Discover Video resources
   * @param {Document} document - Document to analyze
   * @returns {Promise<Object>} Video resource data
   */
  async _discoverVideoResources(document) {
    const videoData = {
      count: 0,
      totalSize: 0,
      list: [],
      autoplay: 0,
      lazy: 0,
      preload: {}
    };

    try {
      const videoElements = document.querySelectorAll('video, source');
      
      videoElements.forEach(video => {
        const src = video.src || video.getAttribute('src');
        
        if (src) {
          const resource = {
            type: 'video',
            url: src,
            element: video.tagName.toLowerCase(),
            attributes: this._getElementAttributes(video),
            autoplay: video.hasAttribute('autoplay'),
            preload: video.getAttribute('preload') || 'metadata',
            lazy: video.getAttribute('loading') === 'lazy',
            format: this._getVideoFormat(src),
            size: 0
          };
          
          videoData.list.push(resource);
          videoData.count++;
          
          if (resource.autoplay) videoData.autoplay++;
          if (resource.lazy) videoData.lazy++;
          
          // Track preload strategies
          const preload = resource.preload;
          videoData.preload[preload] = (videoData.preload[preload] || 0) + 1;
        }
      });

    } catch (error) {
      console.error('Video resource discovery failed:', error);
    }

    return videoData;
  }

  /**
   * Analyze loading patterns in the document
   * @param {Document} document - Document to analyze
   * @returns {Promise<Object>} Loading pattern analysis
   */
  async _analyzeLoadingPatterns(document) {
    const patterns = {
      totalPatterns: 0,
      detected: [],
      summary: {},
      strategies: {}
    };

    try {
      const html = document.documentElement.outerHTML;
      
      // Analyze each loading pattern
      Object.entries(this.loadingPatterns).forEach(([patternName, regex]) => {
        const matches = html.match(new RegExp(regex.source, 'gi')) || [];
        
        if (matches.length > 0) {
          patterns.detected.push({
            pattern: patternName,
            count: matches.length,
            matches: matches.slice(0, 5), // Limit to first 5 matches
            description: this._getPatternDescription(patternName)
          });
          
          patterns.totalPatterns += matches.length;
          patterns.summary[patternName] = matches.length;
        }
      });

      // Analyze loading strategies
      patterns.strategies = {
        renderBlocking: this._countRenderBlockingResources(document),
        asyncDefer: this._countAsyncDeferResources(document),
        lazyLoading: this._countLazyLoadingResources(document),
        preloading: this._countPreloadingResources(document),
        prefetching: this._countPrefetchingResources(document)
      };

    } catch (error) {
      console.error('Loading pattern analysis failed:', error);
    }

    return patterns;
  }

  /**
   * Analyze performance timing data
   * @param {Object} performanceData - Performance timing data
   * @returns {Promise<Object>} Performance timing analysis
   */
  async _analyzePerformanceTiming(performanceData) {
    const timing = {
      navigation: {},
      resources: [],
      summary: {},
      slowResources: [],
      criticalResources: []
    };

    try {
      if (!performanceData) return timing;

      // Navigation timing
      if (performanceData.timing) {
        timing.navigation = {
          domContentLoaded: performanceData.timing.domContentLoadedEventEnd - performanceData.timing.navigationStart,
          loadComplete: performanceData.timing.loadEventEnd - performanceData.timing.navigationStart,
          domInteractive: performanceData.timing.domInteractive - performanceData.timing.navigationStart,
          firstPaint: performanceData.timing.responseEnd - performanceData.timing.navigationStart
        };
      }

      // Resource timing
      if (performanceData.getEntriesByType) {
        const resourceEntries = performanceData.getEntriesByType('resource') || [];
        
        resourceEntries.forEach(entry => {
          const resourceTiming = {
            name: entry.name,
            type: this._getResourceTypeFromUrl(entry.name),
            startTime: entry.startTime,
            duration: entry.duration,
            transferSize: entry.transferSize || 0,
            encodedBodySize: entry.encodedBodySize || 0,
            decodedBodySize: entry.decodedBodySize || 0,
            responseEnd: entry.responseEnd,
            slow: entry.duration > this.options.slowResourceThreshold,
            critical: entry.duration > this.options.criticalResourceThreshold
          };
          
          timing.resources.push(resourceTiming);
          
          if (resourceTiming.slow) {
            timing.slowResources.push(resourceTiming);
          }
          
          if (resourceTiming.critical) {
            timing.criticalResources.push(resourceTiming);
          }
        });
        
        // Generate summary
        timing.summary = {
          totalResources: timing.resources.length,
          slowResources: timing.slowResources.length,
          criticalResources: timing.criticalResources.length,
          averageLoadTime: timing.resources.reduce((sum, r) => sum + r.duration, 0) / timing.resources.length,
          totalTransferSize: timing.resources.reduce((sum, r) => sum + r.transferSize, 0)
        };
      }

    } catch (error) {
      console.error('Performance timing analysis failed:', error);
    }

    return timing;
  }

  /**
   * Analyze resource waterfall
   * @param {Object} performanceData - Performance timing data
   * @returns {Promise<Object>} Waterfall analysis
   */
  async _analyzeWaterfall(performanceData) {
    const waterfall = {
      timeline: [],
      dependencies: [],
      criticalPath: [],
      parallelization: {},
      bottlenecks: []
    };

    try {
      if (!performanceData || !performanceData.getEntriesByType) return waterfall;

      const resourceEntries = performanceData.getEntriesByType('resource') || [];
      
      // Sort resources by start time
      const sortedResources = resourceEntries
        .map(entry => ({
          name: entry.name,
          type: this._getResourceTypeFromUrl(entry.name),
          startTime: entry.startTime,
          endTime: entry.responseEnd,
          duration: entry.duration,
          transferSize: entry.transferSize || 0
        }))
        .sort((a, b) => a.startTime - b.startTime);

      waterfall.timeline = sortedResources;

      // Analyze parallelization
      const timeSlices = this._analyzeParallelization(sortedResources);
      waterfall.parallelization = timeSlices;

      // Identify bottlenecks
      waterfall.bottlenecks = this._identifyBottlenecks(sortedResources);

    } catch (error) {
      console.error('Waterfall analysis failed:', error);
    }

    return waterfall;
  }

  /**
   * Analyze critical rendering path
   * @param {Document} document - Document to analyze
   * @param {Object} performanceData - Performance timing data
   * @returns {Promise<Object>} Critical path analysis
   */
  async _analyzeCriticalPath(document, performanceData) {
    const criticalPath = {
      renderBlockingResources: [],
      criticalCSS: [],
      criticalJS: [],
      aboveTheFold: [],
      optimizations: []
    };

    try {
      // Identify render-blocking CSS
      const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
      cssLinks.forEach(link => {
        if (!link.disabled && (!link.media || link.media === 'all' || link.media === 'screen')) {
          criticalPath.renderBlockingResources.push({
            type: 'css',
            url: link.href,
            element: link,
            renderBlocking: true
          });
          
          if (this._isCriticalResource(link, 'css')) {
            criticalPath.criticalCSS.push(link.href);
          }
        }
      });

      // Identify render-blocking JavaScript
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => {
        if (!script.async && !script.defer && script.src) {
          criticalPath.renderBlockingResources.push({
            type: 'javascript',
            url: script.src,
            element: script,
            renderBlocking: true
          });
          
          if (this._isCriticalResource(script, 'javascript')) {
            criticalPath.criticalJS.push(script.src);
          }
        }
      });

      // Identify above-the-fold resources
      criticalPath.aboveTheFold = this._identifyAboveTheFoldResources(document);

      // Generate optimization suggestions
      criticalPath.optimizations = this._generateCriticalPathOptimizations(criticalPath);

    } catch (error) {
      console.error('Critical path analysis failed:', error);
    }

    return criticalPath;
  }

  /**
   * Assess loading strategies
   * @param {Document} document - Document to analyze
   * @returns {Promise<Object>} Loading strategy assessment
   */
  async _assessLoadingStrategies(document) {
    const strategies = {
      current: {},
      recommended: {},
      score: 0,
      improvements: []
    };

    try {
      // Assess current strategies
      strategies.current = {
        renderBlocking: this._assessRenderBlockingStrategy(document),
        asyncDefer: this._assessAsyncDeferStrategy(document),
        lazyLoading: this._assessLazyLoadingStrategy(document),
        preloading: this._assessPreloadingStrategy(document),
        prefetching: this._assessPrefetchingStrategy(document),
        resourceHints: this._assessResourceHintsStrategy(document)
      };

      // Generate recommendations
      strategies.recommended = this._generateStrategyRecommendations(strategies.current);

      // Calculate overall score
      strategies.score = this._calculateStrategyScore(strategies.current);

      // Identify improvements
      strategies.improvements = this._identifyStrategyImprovements(strategies.current, strategies.recommended);

    } catch (error) {
      console.error('Loading strategy assessment failed:', error);
    }

    return strategies;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  _getElementAttributes(element) {
    const attrs = {};
    if (element && element.attributes) {
      Array.from(element.attributes).forEach(attr => {
        attrs[attr.name] = attr.value;
      });
    }
    return attrs;
  }

  _isCriticalResource(element, type) {
    const patterns = this.criticalPatterns;
    const html = element.outerHTML || '';
    
    switch (type) {
      case 'css':
        return patterns.criticalCSS.test(html) || patterns.renderBlocking.test(html);
      case 'javascript':
        return patterns.criticalJS.test(html) || patterns.renderBlocking.test(html);
      default:
        return false;
    }
  }

  _getImageFormat(src) {
    const ext = src.split('.').pop().toLowerCase();
    const formats = {
      'jpg': 'jpeg', 'jpeg': 'jpeg',
      'png': 'png', 'gif': 'gif',
      'webp': 'webp', 'avif': 'avif',
      'svg': 'svg'
    };
    return formats[ext] || 'unknown';
  }

  _getFontFormat(src) {
    const ext = src.split('.').pop().toLowerCase();
    const formats = {
      'woff2': 'woff2', 'woff': 'woff',
      'ttf': 'truetype', 'otf': 'opentype',
      'eot': 'embedded-opentype'
    };
    return formats[ext] || 'unknown';
  }

  _getVideoFormat(src) {
    const ext = src.split('.').pop().toLowerCase();
    return ext || 'unknown';
  }

  _getResourceTypeFromUrl(url) {
    const ext = url.split('.').pop().toLowerCase().split('?')[0];
    
    const typeMap = {
      'css': 'stylesheet',
      'js': 'script',
      'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image', 'webp': 'image', 'svg': 'image',
      'woff': 'font', 'woff2': 'font', 'ttf': 'font', 'otf': 'font',
      'mp4': 'video', 'webm': 'video', 'ogg': 'video'
    };
    
    return typeMap[ext] || 'other';
  }

  _getPatternDescription(patternName) {
    const descriptions = {
      blocking: 'Render-blocking resources that delay page rendering',
      async: 'Asynchronously loaded scripts that don\'t block parsing',
      lazy: 'Lazy-loaded resources that defer loading until needed',
      preload: 'Preloaded resources for improved performance',
      prefetch: 'Prefetched resources for future navigation',
      moduleScript: 'ES6 module scripts',
      inlineScript: 'Inline JavaScript code',
      externalScript: 'External JavaScript files'
    };
    return descriptions[patternName] || 'Unknown loading pattern';
  }

  _countRenderBlockingResources(document) {
    let count = 0;
    
    // Render-blocking CSS
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    cssLinks.forEach(link => {
      if (!link.disabled && (!link.media || link.media === 'all' || link.media === 'screen')) {
        count++;
      }
    });
    
    // Render-blocking JS
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      if (!script.async && !script.defer) {
        count++;
      }
    });
    
    return count;
  }

  _countAsyncDeferResources(document) {
    const scripts = document.querySelectorAll('script[src]');
    let count = 0;
    
    scripts.forEach(script => {
      if (script.async || script.defer) {
        count++;
      }
    });
    
    return count;
  }

  _countLazyLoadingResources(document) {
    const lazyElements = document.querySelectorAll('[loading="lazy"], [data-src]');
    return lazyElements.length;
  }

  _countPreloadingResources(document) {
    const preloadLinks = document.querySelectorAll('link[rel="preload"]');
    return preloadLinks.length;
  }

  _countPrefetchingResources(document) {
    const prefetchLinks = document.querySelectorAll('link[rel="prefetch"]');
    return prefetchLinks.length;
  }

  _analyzeParallelization(resources) {
    // Analyze resource loading parallelization
    const timeSlices = {};
    
    resources.forEach(resource => {
      const startSlice = Math.floor(resource.startTime / 100) * 100;
      if (!timeSlices[startSlice]) timeSlices[startSlice] = 0;
      timeSlices[startSlice]++;
    });
    
    return timeSlices;
  }

  _identifyBottlenecks(resources) {
    // Identify potential bottlenecks in resource loading
    return resources
      .filter(resource => resource.duration > this.options.slowResourceThreshold)
      .map(resource => ({
        ...resource,
        bottleneckType: resource.duration > this.options.slowResourceThreshold * 2 ? 'critical' : 'moderate'
      }));
  }

  _identifyAboveTheFoldResources(document) {
    // Identify resources needed for above-the-fold content
    const aboveTheFold = [];
    
    // This is a simplified implementation
    // In practice, you'd need viewport analysis
    const criticalElements = document.querySelectorAll('img[src], link[rel="stylesheet"]');
    
    criticalElements.forEach(element => {
      if (element.getBoundingClientRect && element.getBoundingClientRect().top < 600) {
        aboveTheFold.push({
          element: element.tagName.toLowerCase(),
          url: element.src || element.href,
          type: element.tagName === 'IMG' ? 'image' : 'stylesheet'
        });
      }
    });
    
    return aboveTheFold;
  }

  _generateCriticalPathOptimizations(criticalPath) {
    const optimizations = [];
    
    if (criticalPath.renderBlockingResources.length > 3) {
      optimizations.push({
        type: 'reduce_render_blocking',
        priority: 'high',
        description: 'Consider reducing render-blocking resources',
        count: criticalPath.renderBlockingResources.length
      });
    }
    
    if (criticalPath.criticalCSS.length === 0) {
      optimizations.push({
        type: 'inline_critical_css',
        priority: 'medium',
        description: 'Consider inlining critical CSS'
      });
    }
    
    return optimizations;
  }

  _assessRenderBlockingStrategy(document) {
    const renderBlocking = this._countRenderBlockingResources(document);
    return {
      count: renderBlocking,
      score: renderBlocking < 3 ? 100 : Math.max(0, 100 - (renderBlocking - 3) * 20),
      status: renderBlocking < 3 ? 'good' : renderBlocking < 6 ? 'moderate' : 'poor'
    };
  }

  _assessAsyncDeferStrategy(document) {
    const asyncDefer = this._countAsyncDeferResources(document);
    const total = document.querySelectorAll('script[src]').length;
    const percentage = total > 0 ? (asyncDefer / total) * 100 : 100;
    
    return {
      count: asyncDefer,
      total: total,
      percentage: percentage,
      score: percentage,
      status: percentage > 80 ? 'excellent' : percentage > 60 ? 'good' : percentage > 40 ? 'moderate' : 'poor'
    };
  }

  _assessLazyLoadingStrategy(document) {
    const lazy = this._countLazyLoadingResources(document);
    const images = document.querySelectorAll('img').length;
    const percentage = images > 0 ? (lazy / images) * 100 : 0;
    
    return {
      count: lazy,
      total: images,
      percentage: percentage,
      score: percentage,
      status: percentage > 60 ? 'excellent' : percentage > 30 ? 'good' : percentage > 10 ? 'moderate' : 'poor'
    };
  }

  _assessPreloadingStrategy(document) {
    const preload = this._countPreloadingResources(document);
    
    return {
      count: preload,
      score: preload > 0 ? Math.min(100, preload * 25) : 0,
      status: preload > 3 ? 'excellent' : preload > 1 ? 'good' : preload > 0 ? 'moderate' : 'none'
    };
  }

  _assessPrefetchingStrategy(document) {
    const prefetch = this._countPrefetchingResources(document);
    
    return {
      count: prefetch,
      score: prefetch > 0 ? Math.min(100, prefetch * 30) : 0,
      status: prefetch > 2 ? 'excellent' : prefetch > 0 ? 'good' : 'none'
    };
  }

  _assessResourceHintsStrategy(document) {
    const dns = document.querySelectorAll('link[rel="dns-prefetch"]').length;
    const preconnect = document.querySelectorAll('link[rel="preconnect"]').length;
    
    return {
      dnsPrefetch: dns,
      preconnect: preconnect,
      total: dns + preconnect,
      score: Math.min(100, (dns + preconnect) * 20),
      status: (dns + preconnect) > 3 ? 'good' : (dns + preconnect) > 0 ? 'moderate' : 'none'
    };
  }

  _generateStrategyRecommendations(current) {
    const recommendations = {};
    
    if (current.renderBlocking.score < 70) {
      recommendations.renderBlocking = 'Reduce render-blocking resources by using async/defer attributes';
    }
    
    if (current.asyncDefer.percentage < 60) {
      recommendations.asyncDefer = 'Use async or defer attributes for non-critical JavaScript';
    }
    
    if (current.lazyLoading.percentage < 30) {
      recommendations.lazyLoading = 'Implement lazy loading for below-the-fold images';
    }
    
    if (current.preloading.count === 0) {
      recommendations.preloading = 'Consider preloading critical resources';
    }
    
    return recommendations;
  }

  _calculateStrategyScore(current) {
    const weights = {
      renderBlocking: 0.3,
      asyncDefer: 0.25,
      lazyLoading: 0.2,
      preloading: 0.15,
      prefetching: 0.1
    };
    
    let totalScore = 0;
    totalScore += current.renderBlocking.score * weights.renderBlocking;
    totalScore += current.asyncDefer.score * weights.asyncDefer;
    totalScore += current.lazyLoading.score * weights.lazyLoading;
    totalScore += current.preloading.score * weights.preloading;
    totalScore += current.prefetching.score * weights.prefetching;
    
    return Math.round(totalScore);
  }

  _identifyStrategyImprovements(current, recommended) {
    const improvements = [];
    
    Object.entries(recommended).forEach(([strategy, recommendation]) => {
      improvements.push({
        strategy,
        recommendation,
        priority: this._getImprovementPriority(strategy, current[strategy]),
        impact: this._getImprovementImpact(strategy, current[strategy])
      });
    });
    
    return improvements.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  _getImprovementPriority(strategy, currentData) {
    if (strategy === 'renderBlocking' && currentData.score < 50) return 'high';
    if (strategy === 'asyncDefer' && currentData.percentage < 40) return 'high';
    if (strategy === 'lazyLoading' && currentData.percentage < 20) return 'medium';
    return 'low';
  }

  _getImprovementImpact(strategy, currentData) {
    if (strategy === 'renderBlocking') return currentData.score < 50 ? 'high' : 'medium';
    if (strategy === 'asyncDefer') return currentData.percentage < 40 ? 'high' : 'medium';
    return 'medium';
  }

  _generateSummary(results) {
    return {
      resourcesDetected: results.resources.count,
      loadingPatternsFound: results.loadingPatterns.totalPatterns,
      performanceIssues: results.timing?.slowResources?.length || 0,
      criticalResources: results.timing?.criticalResources?.length || 0,
      optimizationOpportunities: results.strategies?.improvements?.length || 0,
      overallScore: results.strategies?.score || 0,
      status: this._getOverallStatus(results.strategies?.score || 0)
    };
  }

  _getOverallStatus(score) {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'moderate';
    if (score >= 40) return 'poor';
    return 'critical';
  }
}

export default ResourceLoadingDetector;
