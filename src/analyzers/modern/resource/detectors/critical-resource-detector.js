/**
 * ============================================================================
 * CRITICAL RESOURCE DETECTOR - GPT-5 STYLE MODULAR COMPONENT
 * ============================================================================
 * 
 * Advanced critical rendering path and resource priority analysis
 * Part of Resource Analyzer Combined Approach (11th Implementation)
 * 
 * Capabilities:
 * - Critical rendering path analysis
 * - Above-the-fold resource identification
 * - Render-blocking resource detection
 * - Resource priority assessment
 * - Critical path optimization recommendations
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration GPT-5 Style Detector
 * @created 2025-08-13
 */

export class CriticalResourceDetector {
  constructor(options = {}) {
    this.options = {
      // Critical Path Analysis Configuration
      enableRenderBlockingAnalysis: options.enableRenderBlockingAnalysis !== false,
      enableAboveTheFoldAnalysis: options.enableAboveTheFoldAnalysis !== false,
      enableCriticalPathAnalysis: options.enableCriticalPathAnalysis !== false,
      enableResourcePriorityAnalysis: options.enableResourcePriorityAnalysis !== false,
      
      // Critical Path Thresholds
      criticalRenderTime: options.criticalRenderTime || 1000, // 1 second
      aboveTheFoldHeight: options.aboveTheFoldHeight || 600, // 600px
      maxCriticalResources: options.maxCriticalResources || 10,
      criticalResourceSize: options.criticalResourceSize || 14000, // 14KB (TCP slow start)
      
      // Priority Thresholds
      highPriorityThreshold: options.highPriorityThreshold || 500, // 500ms
      mediumPriorityThreshold: options.mediumPriorityThreshold || 1500, // 1.5s
      
      ...options
    };

    this.detectorType = 'critical_resource';
    this.version = '1.0.0';
    
    // Critical resource patterns
    this.criticalPatterns = {
      renderBlocking: {
        css: /rel=['"]stylesheet['"](?![^>]*media=['"]print['"])/i,
        js: /<script(?![^>]*(?:async|defer))[^>]*src/i,
        font: /rel=['"]preload['"][^>]*as=['"]font['"]|@font-face/i
      },
      
      criticalHints: {
        preload: /rel=['"]preload['"][^>]*as=['"](?:style|script|font)['"]|fetchpriority=['"]high['"]|importance=['"]high['"]|loading=['"]eager['"]|rel=['"]dns-prefetch['"]|rel=['"]preconnect['"]/i,
        prefetch: /rel=['"]prefetch['"]|fetchpriority=['"]low['"]|importance=['"]low['"]|loading=['"]lazy['"]/i,
        critical: /critical|above-the-fold|atf|hero|important/i
      },
      
      nonCritical: {
        analytics: /google-analytics|gtag|facebook|twitter|linkedin|pinterest/i,
        advertising: /doubleclick|googlesyndication|amazon-adsystem|media\.net/i,
        social: /facebook\.com|twitter\.com|instagram\.com|pinterest\.com/i,
        tracking: /hotjar|mixpanel|segment|amplitude|fullstory/i
      }
    };

    // Resource priority mapping
    this.resourcePriorities = {
      critical: ['blocking-css', 'blocking-js', 'hero-images', 'critical-fonts'],
      high: ['visible-images', 'important-css', 'navigation-js'],
      medium: ['below-fold-images', 'secondary-css', 'feature-js'],
      low: ['analytics', 'advertising', 'social-widgets', 'prefetch-resources']
    };
    
    console.log('🎯 Critical Resource Detector initialized');
  }

  /**
   * Get detector metadata
   * @returns {Object} Detector metadata and capabilities
   */
  getMetadata() {
    return {
      name: 'CriticalResourceDetector',
      type: this.detectorType,
      version: this.version,
      description: 'Advanced critical rendering path and resource priority analysis',
      
      capabilities: [
        'critical_rendering_path_analysis',
        'render_blocking_detection',
        'above_the_fold_identification',
        'resource_priority_assessment',
        'critical_path_optimization',
        'hero_content_analysis',
        'viewport_resource_mapping',
        'loading_waterfall_analysis'
      ],
      
      analysisTypes: [
        'render_blocking_resources',
        'critical_css_detection',
        'critical_javascript_detection',
        'critical_font_loading',
        'hero_image_analysis',
        'above_fold_content_mapping'
      ],
      
      analysisFeatures: {
        renderBlockingAnalysis: this.options.enableRenderBlockingAnalysis,
        aboveTheFoldAnalysis: this.options.enableAboveTheFoldAnalysis,
        criticalPathAnalysis: this.options.enableCriticalPathAnalysis,
        resourcePriorityAnalysis: this.options.enableResourcePriorityAnalysis
      },
      
      thresholds: {
        criticalRenderTime: this.options.criticalRenderTime,
        aboveTheFoldHeight: this.options.aboveTheFoldHeight,
        maxCriticalResources: this.options.maxCriticalResources,
        criticalResourceSize: this.options.criticalResourceSize
      }
    };
  }

  /**
   * Main detection method - analyze critical resources and rendering path
   * @param {Object} context - Analysis context with document, performance data
   * @returns {Promise<Object>} Critical resource analysis results
   */
  async detect(context) {
    try {
      const startTime = Date.now();
      const { document, url, performanceData } = context;
      
      if (!document) {
        throw new Error('Document is required for critical resource detection');
      }

      console.log('🎯 Starting critical resource detection...');

      // Core Critical Resource Analysis
      const results = {
        success: true,
        timestamp: new Date().toISOString(),
        
        // Render-blocking Resource Analysis
        renderBlocking: this.options.enableRenderBlockingAnalysis ?
          await this._analyzeRenderBlockingResources(document, performanceData) : null,
        
        // Above-the-fold Analysis
        aboveTheFold: this.options.enableAboveTheFoldAnalysis ?
          await this._analyzeAboveTheFoldResources(document) : null,
        
        // Critical Path Analysis
        criticalPath: this.options.enableCriticalPathAnalysis ?
          await this._analyzeCriticalPath(document, performanceData) : null,
        
        // Resource Priority Analysis
        priorities: this.options.enableResourcePriorityAnalysis ?
          await this._analyzeResourcePriorities(document, performanceData) : null,
        
        // Critical Resource Optimization
        optimization: await this._analyzeCriticalOptimizations(document, performanceData),
        
        // Critical Resource Summary
        summary: {},
        
        executionTime: Date.now() - startTime
      };

      // Generate critical resource summary
      results.summary = this._generateCriticalSummary(results);
      
      console.log(`✅ Critical resource detection completed in ${results.executionTime}ms`);
      console.log(`🎯 Found ${results.summary.totalCriticalResources || 0} critical resources`);
      
      return results;

    } catch (error) {
      console.error('❌ Critical resource detection failed:', error);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        executionTime: Date.now() - (context.startTime || Date.now())
      };
    }
  }

  /**
   * Analyze render-blocking resources
   * @param {Document} document - Document to analyze
   * @param {Object} performanceData - Performance timing data
   * @returns {Promise<Object>} Render-blocking resource analysis
   */
  async _analyzeRenderBlockingResources(document, performanceData) {
    const renderBlocking = {
      css: [],
      javascript: [],
      fonts: [],
      total: 0,
      impact: {},
      recommendations: []
    };

    try {
      // Analyze render-blocking CSS
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      
      stylesheets.forEach(link => {
        const href = link.href || link.getAttribute('href');
        const media = link.media || 'all';
        
        // Check if it's render-blocking
        if (!link.disabled && 
            (media === 'all' || media === 'screen' || !media) && 
            href) {
          
          const cssResource = {
            url: href,
            element: link,
            media: media,
            critical: this._isCriticalResource(link),
            size: 0, // Will be populated from performance data
            loadTime: 0,
            renderBlocking: true,
            inlineCandidate: this._isInlineCandidate(href),
            attributes: this._getElementAttributes(link)
          };
          
          renderBlocking.css.push(cssResource);
          renderBlocking.total++;
        }
      });

      // Analyze render-blocking JavaScript
      const scripts = document.querySelectorAll('script[src]');
      
      scripts.forEach(script => {
        const src = script.src || script.getAttribute('src');
        
        // Check if it's render-blocking (no async/defer)
        if (!script.hasAttribute('async') && 
            !script.hasAttribute('defer') && 
            !script.hasAttribute('type') !== 'module' &&
            src) {
          
          const jsResource = {
            url: src,
            element: script,
            critical: this._isCriticalResource(script),
            size: 0,
            loadTime: 0,
            renderBlocking: true,
            deferCandidate: this._isDeferCandidate(script),
            asyncCandidate: this._isAsyncCandidate(script),
            attributes: this._getElementAttributes(script)
          };
          
          renderBlocking.javascript.push(jsResource);
          renderBlocking.total++;
        }
      });

      // Analyze critical fonts
      await this._analyzeCriticalFonts(document, renderBlocking);

      // Calculate render-blocking impact
      if (performanceData) {
        renderBlocking.impact = await this._calculateRenderBlockingImpact(
          renderBlocking, performanceData
        );
      }

      // Generate render-blocking recommendations
      renderBlocking.recommendations = this._generateRenderBlockingRecommendations(renderBlocking);

    } catch (error) {
      console.error('Render-blocking analysis failed:', error);
    }

    return renderBlocking;
  }

  /**
   * Analyze above-the-fold resources
   * @param {Document} document - Document to analyze
   * @returns {Promise<Object>} Above-the-fold resource analysis
   */
  async _analyzeAboveTheFoldResources(document) {
    const aboveTheFold = {
      images: [],
      css: [],
      fonts: [],
      content: {},
      viewport: {},
      recommendations: []
    };

    try {
      // Get viewport dimensions (estimate if not available)
      const viewportWidth = window?.innerWidth || 1366;
      const viewportHeight = window?.innerHeight || this.options.aboveTheFoldHeight;
      
      aboveTheFold.viewport = {
        width: viewportWidth,
        height: viewportHeight,
        estimatedFoldLine: this.options.aboveTheFoldHeight
      };

      // Analyze above-the-fold images
      const images = document.querySelectorAll('img, picture, [style*="background-image"]');
      
      images.forEach(img => {
        const isAboveFold = this._isAboveTheFold(img, viewportHeight);
        
        if (isAboveFold) {
          const imageResource = {
            element: img.tagName.toLowerCase(),
            src: img.src || img.getAttribute('src') || this._extractBackgroundImage(img),
            alt: img.alt || '',
            loading: img.getAttribute('loading') || 'eager',
            position: this._getElementPosition(img),
            critical: this._isHeroImage(img),
            lazy: img.getAttribute('loading') === 'lazy' || img.hasAttribute('data-src'),
            responsive: img.hasAttribute('srcset') || img.hasAttribute('sizes'),
            attributes: this._getElementAttributes(img)
          };
          
          aboveTheFold.images.push(imageResource);
        }
      });

      // Analyze critical CSS for above-the-fold content
      aboveTheFold.css = await this._identifyCriticalCSS(document, viewportHeight);

      // Analyze critical fonts
      aboveTheFold.fonts = await this._identifyCriticalFonts(document, viewportHeight);

      // Analyze above-the-fold content structure
      aboveTheFold.content = this._analyzeAboveTheFoldContent(document, viewportHeight);

      // Generate above-the-fold recommendations
      aboveTheFold.recommendations = this._generateAboveTheFoldRecommendations(aboveTheFold);

    } catch (error) {
      console.error('Above-the-fold analysis failed:', error);
    }

    return aboveTheFold;
  }

  /**
   * Analyze critical rendering path
   * @param {Document} document - Document to analyze
   * @param {Object} performanceData - Performance timing data
   * @returns {Promise<Object>} Critical path analysis
   */
  async _analyzeCriticalPath(document, performanceData) {
    const criticalPath = {
      resources: [],
      dependencies: [],
      timeline: [],
      bottlenecks: [],
      optimization: {},
      metrics: {}
    };

    try {
      // Identify critical path resources
      const criticalResources = await this._identifyCriticalPathResources(document);
      criticalPath.resources = criticalResources;

      // Analyze resource dependencies
      criticalPath.dependencies = await this._analyzeCriticalDependencies(
        criticalResources, document
      );

      // Create critical path timeline
      if (performanceData) {
        criticalPath.timeline = await this._createCriticalPathTimeline(
          criticalResources, performanceData
        );
        
        // Calculate critical path metrics
        criticalPath.metrics = this._calculateCriticalPathMetrics(
          criticalPath.timeline, performanceData
        );
      }

      // Identify critical path bottlenecks
      criticalPath.bottlenecks = this._identifyCriticalPathBottlenecks(
        criticalPath.timeline, criticalPath.dependencies
      );

      // Generate optimization strategy
      criticalPath.optimization = this._generateCriticalPathOptimization(criticalPath);

    } catch (error) {
      console.error('Critical path analysis failed:', error);
    }

    return criticalPath;
  }

  /**
   * Analyze resource priorities
   * @param {Document} document - Document to analyze
   * @param {Object} performanceData - Performance timing data
   * @returns {Promise<Object>} Resource priority analysis
   */
  async _analyzeResourcePriorities(document, performanceData) {
    const priorities = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      distribution: {},
      recommendations: []
    };

    try {
      // Collect all resources
      const allResources = await this._collectAllResources(document);

      // Classify resources by priority
      allResources.forEach(resource => {
        const priority = this._calculateResourcePriority(resource, document);
        
        const prioritizedResource = {
          ...resource,
          priority: priority.level,
          priorityScore: priority.score,
          reasoning: priority.reasoning
        };
        
        priorities[priority.level].push(prioritizedResource);
      });

      // Calculate priority distribution
      priorities.distribution = {
        critical: priorities.critical.length,
        high: priorities.high.length,
        medium: priorities.medium.length,
        low: priorities.low.length,
        total: allResources.length
      };

      // Enhance with performance data
      if (performanceData) {
        await this._enhancePriorityWithPerformanceData(priorities, performanceData);
      }

      // Generate priority recommendations
      priorities.recommendations = this._generatePriorityRecommendations(priorities);

    } catch (error) {
      console.error('Resource priority analysis failed:', error);
    }

    return priorities;
  }

  /**
   * Analyze critical resource optimizations
   * @param {Document} document - Document to analyze
   * @param {Object} performanceData - Performance timing data
   * @returns {Promise<Object>} Critical optimization analysis
   */
  async _analyzeCriticalOptimizations(document, performanceData) {
    const optimization = {
      opportunities: [],
      strategies: {},
      impact: {},
      implementation: {}
    };

    try {
      // Critical CSS optimization opportunities
      const cssOptimizations = await this._identifyCriticalCSSOptimizations(document);
      optimization.opportunities.push(...cssOptimizations);

      // Critical JavaScript optimization opportunities
      const jsOptimizations = await this._identifyCriticalJSOptimizations(document);
      optimization.opportunities.push(...jsOptimizations);

      // Critical font optimization opportunities
      const fontOptimizations = await this._identifyCriticalFontOptimizations(document);
      optimization.opportunities.push(...fontOptimizations);

      // Critical image optimization opportunities
      const imageOptimizations = await this._identifyCriticalImageOptimizations(document);
      optimization.opportunities.push(...imageOptimizations);

      // Generate optimization strategies
      optimization.strategies = this._generateOptimizationStrategies(optimization.opportunities);

      // Calculate optimization impact
      optimization.impact = this._calculateOptimizationImpact(
        optimization.opportunities, performanceData
      );

      // Assess implementation complexity
      optimization.implementation = this._assessImplementationComplexity(optimization.opportunities);

    } catch (error) {
      console.error('Critical optimization analysis failed:', error);
    }

    return optimization;
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

  _isCriticalResource(element) {
    const html = element.outerHTML || '';
    const url = element.src || element.href || '';
    
    // Check for critical hints
    if (this.criticalPatterns.criticalHints.critical.test(html) ||
        this.criticalPatterns.criticalHints.preload.test(html)) {
      return true;
    }
    
    // Check for non-critical patterns
    if (this.criticalPatterns.nonCritical.analytics.test(url) ||
        this.criticalPatterns.nonCritical.advertising.test(url) ||
        this.criticalPatterns.nonCritical.social.test(url) ||
        this.criticalPatterns.nonCritical.tracking.test(url)) {
      return false;
    }
    
    // Check position in document (earlier = more critical)
    const documentPosition = this._getDocumentPosition(element);
    return documentPosition < 0.3; // First 30% of document
  }

  _isInlineCandidate(href) {
    // Small CSS files are good candidates for inlining
    return href && (
      href.includes('critical') || 
      href.includes('inline') ||
      href.includes('above-fold')
    );
  }

  _isDeferCandidate(script) {
    const src = script.src || '';
    const html = script.outerHTML || '';
    
    // Non-critical scripts can be deferred
    return !this._isCriticalResource(script) &&
           !html.includes('document.write') &&
           !this.criticalPatterns.nonCritical.analytics.test(src);
  }

  _isAsyncCandidate(script) {
    const src = script.src || '';
    
    // Analytics and tracking scripts are good async candidates
    return this.criticalPatterns.nonCritical.analytics.test(src) ||
           this.criticalPatterns.nonCritical.tracking.test(src);
  }

  async _analyzeCriticalFonts(document, renderBlocking) {
    // Analyze @font-face declarations
    const styleElements = document.querySelectorAll('style');
    
    styleElements.forEach(style => {
      const content = style.textContent || '';
      const fontFaceMatches = content.match(/@font-face\s*{[^}]+}/g) || [];
      
      fontFaceMatches.forEach(fontFace => {
        const fontDisplay = fontFace.match(/font-display\s*:\s*([^;]+)/);
        const isBlocking = !fontDisplay || fontDisplay[1].trim() === 'auto' || fontDisplay[1].trim() === 'block';
        
        if (isBlocking) {
          renderBlocking.fonts.push({
            declaration: fontFace.substring(0, 100) + '...',
            fontDisplay: fontDisplay ? fontDisplay[1].trim() : 'auto',
            renderBlocking: isBlocking,
            critical: true
          });
          renderBlocking.total++;
        }
      });
    });

    // Analyze preloaded fonts
    const fontPreloads = document.querySelectorAll('link[rel="preload"][as="font"]');
    fontPreloads.forEach(link => {
      renderBlocking.fonts.push({
        url: link.href,
        preloaded: true,
        renderBlocking: false,
        critical: true,
        crossorigin: link.hasAttribute('crossorigin')
      });
    });
  }

  async _calculateRenderBlockingImpact(renderBlocking, performanceData) {
    const impact = {
      totalBlockingTime: 0,
      resourceCount: renderBlocking.total,
      estimatedDelay: 0,
      severityLevel: 'low'
    };
    
    if (performanceData && performanceData.getEntriesByType) {
      const resourceEntries = performanceData.getEntriesByType('resource') || [];
      
      [...renderBlocking.css, ...renderBlocking.javascript].forEach(resource => {
        const entry = resourceEntries.find(e => e.name.includes(resource.url));
        if (entry) {
          resource.loadTime = entry.duration;
          impact.totalBlockingTime += entry.duration;
        }
      });
      
      impact.estimatedDelay = impact.totalBlockingTime;
      impact.severityLevel = impact.totalBlockingTime > 3000 ? 'critical' :
                            impact.totalBlockingTime > 1500 ? 'high' :
                            impact.totalBlockingTime > 500 ? 'medium' : 'low';
    }
    
    return impact;
  }

  _generateRenderBlockingRecommendations(renderBlocking) {
    const recommendations = [];
    
    if (renderBlocking.css.length > 3) {
      recommendations.push({
        type: 'css_optimization',
        priority: 'high',
        title: 'Reduce render-blocking CSS files',
        description: `${renderBlocking.css.length} CSS files are blocking rendering`,
        action: 'Consider inlining critical CSS and loading non-critical CSS asynchronously'
      });
    }
    
    if (renderBlocking.javascript.length > 2) {
      recommendations.push({
        type: 'js_optimization',
        priority: 'high',
        title: 'Reduce render-blocking JavaScript',
        description: `${renderBlocking.javascript.length} JavaScript files are blocking rendering`,
        action: 'Add async or defer attributes to non-critical scripts'
      });
    }
    
    renderBlocking.css.forEach(css => {
      if (css.inlineCandidate) {
        recommendations.push({
          type: 'inline_css',
          priority: 'medium',
          title: 'Inline critical CSS',
          resource: css.url,
          action: 'Consider inlining this critical CSS file'
        });
      }
    });
    
    return recommendations;
  }

  _isAboveTheFold(element, viewportHeight) {
    try {
      if (element.getBoundingClientRect) {
        const rect = element.getBoundingClientRect();
        return rect.top < viewportHeight && rect.bottom > 0;
      }
      
      // Fallback: check if element is in first part of document
      return this._getDocumentPosition(element) < 0.4; // First 40%
    } catch (error) {
      // Fallback for elements without getBoundingClientRect
      return this._getDocumentPosition(element) < 0.3;
    }
  }

  _getDocumentPosition(element) {
    try {
      const allElements = Array.from(document.querySelectorAll('*'));
      const elementIndex = allElements.indexOf(element);
      return elementIndex / allElements.length;
    } catch (error) {
      return 0.5; // Middle position as fallback
    }
  }

  _isHeroImage(img) {
    const src = img.src || '';
    const alt = img.alt || '';
    const className = img.className || '';
    
    // Check for hero/banner indicators
    return /hero|banner|main|primary|featured|cover|header/i.test(src + alt + className);
  }

  _extractBackgroundImage(element) {
    const style = element.style.backgroundImage || '';
    const match = style.match(/url\(['"]?([^'")\s]+)['"]?\)/);
    return match ? match[1] : '';
  }

  _getElementPosition(element) {
    try {
      if (element.getBoundingClientRect) {
        const rect = element.getBoundingClientRect();
        return {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        };
      }
    } catch (error) {
      // Fallback position
    }
    
    return { top: 0, left: 0, width: 0, height: 0 };
  }

  async _identifyCriticalCSS(document, viewportHeight) {
    const criticalCSS = [];
    
    // Look for critical CSS indicators
    const styleElements = document.querySelectorAll('style');
    
    styleElements.forEach(style => {
      const content = style.textContent || '';
      
      if (content.includes('critical') || 
          content.includes('above-fold') ||
          content.includes('hero') ||
          content.length < this.options.criticalResourceSize) {
        
        criticalCSS.push({
          type: 'inline',
          content: content.substring(0, 200) + '...',
          size: content.length,
          critical: true,
          element: style
        });
      }
    });
    
    return criticalCSS;
  }

  async _identifyCriticalFonts(document, viewportHeight) {
    const criticalFonts = [];
    
    // Preloaded fonts are typically critical
    const fontPreloads = document.querySelectorAll('link[rel="preload"][as="font"]');
    
    fontPreloads.forEach(link => {
      criticalFonts.push({
        url: link.href,
        preloaded: true,
        critical: true,
        crossorigin: link.hasAttribute('crossorigin'),
        element: link
      });
    });
    
    return criticalFonts;
  }

  _analyzeAboveTheFoldContent(document, viewportHeight) {
    const content = {
      textElements: 0,
      headings: 0,
      images: 0,
      interactiveElements: 0,
      totalElements: 0
    };
    
    try {
      // Count different types of above-the-fold content
      const elements = document.querySelectorAll('h1, h2, h3, p, img, button, a, input');
      
      elements.forEach(element => {
        if (this._isAboveTheFold(element, viewportHeight)) {
          content.totalElements++;
          
          const tagName = element.tagName.toLowerCase();
          
          if (['h1', 'h2', 'h3'].includes(tagName)) {
            content.headings++;
          } else if (tagName === 'p') {
            content.textElements++;
          } else if (tagName === 'img') {
            content.images++;
          } else if (['button', 'a', 'input'].includes(tagName)) {
            content.interactiveElements++;
          }
        }
      });
    } catch (error) {
      console.error('Above-the-fold content analysis failed:', error);
    }
    
    return content;
  }

  _generateAboveTheFoldRecommendations(aboveTheFold) {
    const recommendations = [];
    
    if (aboveTheFold.images.length > 0) {
      const lazyImages = aboveTheFold.images.filter(img => img.lazy);
      
      if (lazyImages.length > 0) {
        recommendations.push({
          type: 'image_loading',
          priority: 'high',
          title: 'Remove lazy loading from above-the-fold images',
          count: lazyImages.length,
          description: 'Above-the-fold images should load eagerly for better user experience'
        });
      }
      
      const nonResponsiveImages = aboveTheFold.images.filter(img => !img.responsive);
      
      if (nonResponsiveImages.length > 0) {
        recommendations.push({
          type: 'responsive_images',
          priority: 'medium',
          title: 'Make above-the-fold images responsive',
          count: nonResponsiveImages.length,
          description: 'Use srcset and sizes attributes for better performance across devices'
        });
      }
    }
    
    return recommendations;
  }

  async _identifyCriticalPathResources(document) {
    const criticalResources = [];
    
    // HTML document itself
    criticalResources.push({
      type: 'document',
      url: document.URL || window.location?.href || '',
      critical: true,
      priority: 'critical',
      order: 0
    });
    
    // Render-blocking CSS
    const renderBlockingCSS = document.querySelectorAll('link[rel="stylesheet"]:not([media="print"])');
    renderBlockingCSS.forEach((link, index) => {
      criticalResources.push({
        type: 'css',
        url: link.href,
        critical: true,
        priority: 'critical',
        order: index + 1,
        element: link
      });
    });
    
    // Render-blocking JavaScript
    const renderBlockingJS = document.querySelectorAll('script[src]:not([async]):not([defer])');
    renderBlockingJS.forEach((script, index) => {
      criticalResources.push({
        type: 'javascript',
        url: script.src,
        critical: true,
        priority: 'critical',
        order: renderBlockingCSS.length + index + 1,
        element: script
      });
    });
    
    return criticalResources.sort((a, b) => a.order - b.order);
  }

  async _analyzeCriticalDependencies(criticalResources, document) {
    const dependencies = [];
    
    criticalResources.forEach(resource => {
      if (resource.type === 'css') {
        // CSS may import other CSS files or reference fonts
        dependencies.push({
          parent: resource.url,
          child: 'potential-css-imports',
          type: 'css-import',
          blocking: true
        });
      }
      
      if (resource.type === 'javascript') {
        // JavaScript may depend on other scripts or external resources
        dependencies.push({
          parent: resource.url,
          child: 'potential-js-dependencies',
          type: 'js-dependency',
          blocking: true
        });
      }
    });
    
    return dependencies;
  }

  async _createCriticalPathTimeline(criticalResources, performanceData) {
    const timeline = [];
    
    if (!performanceData || !performanceData.getEntriesByType) {
      return timeline;
    }
    
    const resourceEntries = performanceData.getEntriesByType('resource') || [];
    
    criticalResources.forEach(resource => {
      const entry = resourceEntries.find(e => e.name === resource.url);
      
      if (entry) {
        timeline.push({
          resource: resource.url,
          type: resource.type,
          startTime: entry.startTime,
          endTime: entry.responseEnd,
          duration: entry.duration,
          critical: resource.critical,
          priority: resource.priority
        });
      }
    });
    
    return timeline.sort((a, b) => a.startTime - b.startTime);
  }

  _calculateCriticalPathMetrics(timeline, performanceData) {
    const metrics = {
      totalCriticalTime: 0,
      longestCriticalResource: null,
      parallelization: 0,
      criticalPathLength: timeline.length
    };
    
    if (timeline.length > 0) {
      const lastResource = timeline[timeline.length - 1];
      metrics.totalCriticalTime = lastResource.endTime;
      
      metrics.longestCriticalResource = timeline.reduce((longest, current) => 
        current.duration > longest.duration ? current : longest
      );
      
      // Calculate parallelization (simplified)
      const totalDuration = timeline.reduce((sum, resource) => sum + resource.duration, 0);
      metrics.parallelization = metrics.totalCriticalTime > 0 ? 
        totalDuration / metrics.totalCriticalTime : 1;
    }
    
    return metrics;
  }

  _identifyCriticalPathBottlenecks(timeline, dependencies) {
    const bottlenecks = [];
    
    timeline.forEach(resource => {
      if (resource.duration > this.options.criticalRenderTime * 0.5) {
        bottlenecks.push({
          resource: resource.resource,
          type: 'slow_resource',
          duration: resource.duration,
          impact: 'high',
          recommendation: 'Optimize or replace this slow critical resource'
        });
      }
    });
    
    // Check for sequential loading that could be parallelized
    for (let i = 1; i < timeline.length; i++) {
      const current = timeline[i];
      const previous = timeline[i - 1];
      
      if (current.startTime > previous.endTime) {
        bottlenecks.push({
          resource: current.resource,
          type: 'sequential_loading',
          delay: current.startTime - previous.endTime,
          impact: 'medium',
          recommendation: 'Consider preloading this resource'
        });
      }
    }
    
    return bottlenecks;
  }

  _generateCriticalPathOptimization(criticalPath) {
    const optimization = {
      strategies: [],
      priorityActions: [],
      estimatedImprovement: 0
    };
    
    if (criticalPath.metrics.totalCriticalTime > this.options.criticalRenderTime) {
      optimization.strategies.push({
        strategy: 'reduce_critical_resources',
        priority: 'high',
        description: 'Reduce the number of critical resources',
        actions: ['Inline critical CSS', 'Defer non-critical JavaScript', 'Optimize critical images']
      });
    }
    
    if (criticalPath.bottlenecks.length > 0) {
      optimization.strategies.push({
        strategy: 'eliminate_bottlenecks',
        priority: 'high',
        description: 'Address critical path bottlenecks',
        bottlenecks: criticalPath.bottlenecks.length
      });
    }
    
    // Calculate estimated improvement
    const potentialSavings = criticalPath.bottlenecks.reduce((sum, bottleneck) => {
      return sum + (bottleneck.duration || bottleneck.delay || 0) * 0.5; // Assume 50% improvement
    }, 0);
    
    optimization.estimatedImprovement = potentialSavings;
    
    return optimization;
  }

  async _collectAllResources(document) {
    const resources = [];
    
    // CSS files
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      resources.push({
        type: 'css',
        url: link.href,
        element: link,
        media: link.media || 'all'
      });
    });
    
    // JavaScript files
    document.querySelectorAll('script[src]').forEach(script => {
      resources.push({
        type: 'javascript',
        url: script.src,
        element: script,
        async: script.hasAttribute('async'),
        defer: script.hasAttribute('defer')
      });
    });
    
    // Images
    document.querySelectorAll('img[src]').forEach(img => {
      resources.push({
        type: 'image',
        url: img.src,
        element: img,
        loading: img.getAttribute('loading') || 'eager'
      });
    });
    
    // Fonts
    document.querySelectorAll('link[rel="preload"][as="font"]').forEach(link => {
      resources.push({
        type: 'font',
        url: link.href,
        element: link,
        preloaded: true
      });
    });
    
    return resources;
  }

  _calculateResourcePriority(resource, document) {
    let score = 50; // Base score
    let level = 'medium';
    const reasoning = [];
    
    // Critical resource indicators
    if (this._isCriticalResource(resource.element)) {
      score += 30;
      reasoning.push('marked as critical');
    }
    
    // Position in document
    const position = this._getDocumentPosition(resource.element);
    if (position < 0.2) {
      score += 20;
      reasoning.push('early in document');
    } else if (position > 0.8) {
      score -= 20;
      reasoning.push('late in document');
    }
    
    // Resource type priority
    switch (resource.type) {
      case 'css':
        score += 15;
        reasoning.push('CSS resource');
        break;
      case 'javascript':
        if (resource.async || resource.defer) {
          score -= 10;
          reasoning.push('non-blocking script');
        } else {
          score += 10;
          reasoning.push('blocking script');
        }
        break;
      case 'image':
        if (resource.loading === 'lazy') {
          score -= 15;
          reasoning.push('lazy loaded');
        } else {
          score += 5;
          reasoning.push('eager loaded');
        }
        break;
      case 'font':
        if (resource.preloaded) {
          score += 10;
          reasoning.push('preloaded font');
        }
        break;
    }
    
    // Non-critical patterns
    const url = resource.url || '';
    if (this.criticalPatterns.nonCritical.analytics.test(url)) {
      score -= 25;
      reasoning.push('analytics resource');
    }
    
    // Determine level
    if (score >= 80) level = 'critical';
    else if (score >= 65) level = 'high';
    else if (score >= 35) level = 'medium';
    else level = 'low';
    
    return {
      level,
      score,
      reasoning: reasoning.join(', ')
    };
  }

  async _enhancePriorityWithPerformanceData(priorities, performanceData) {
    if (!performanceData.getEntriesByType) return;
    
    const resourceEntries = performanceData.getEntriesByType('resource') || [];
    
    Object.values(priorities).forEach(priorityGroup => {
      if (Array.isArray(priorityGroup)) {
        priorityGroup.forEach(resource => {
          const entry = resourceEntries.find(e => e.name === resource.url);
          if (entry) {
            resource.loadTime = entry.duration;
            resource.size = entry.transferSize || 0;
            
            // Adjust priority based on actual performance
            if (entry.duration > this.options.highPriorityThreshold && resource.priority !== 'critical') {
              resource.performanceImpact = 'high';
            }
          }
        });
      }
    });
  }

  _generatePriorityRecommendations(priorities) {
    const recommendations = [];
    
    if (priorities.critical.length > this.options.maxCriticalResources) {
      recommendations.push({
        type: 'reduce_critical_resources',
        priority: 'high',
        title: 'Too many critical resources',
        count: priorities.critical.length,
        description: `Consider reducing critical resources from ${priorities.critical.length} to ${this.options.maxCriticalResources} or fewer`
      });
    }
    
    const highPriorityWithLowPerfImpact = priorities.high.filter(r => 
      r.performanceImpact !== 'high' && r.loadTime && r.loadTime < this.options.highPriorityThreshold
    );
    
    if (highPriorityWithLowPerfImpact.length > 0) {
      recommendations.push({
        type: 'optimize_priority_order',
        priority: 'medium',
        title: 'Optimize resource priority order',
        description: 'Some high-priority resources could be deprioritized'
      });
    }
    
    return recommendations;
  }

  // Optimization opportunity identification methods
  async _identifyCriticalCSSOptimizations(document) {
    const optimizations = [];
    
    const renderBlockingCSS = document.querySelectorAll('link[rel="stylesheet"]:not([media="print"])');
    
    if (renderBlockingCSS.length > 2) {
      optimizations.push({
        type: 'critical_css_inline',
        priority: 'high',
        title: 'Inline critical CSS',
        impact: 'high',
        complexity: 'medium',
        description: 'Inline above-the-fold CSS to eliminate render-blocking requests'
      });
    }
    
    return optimizations;
  }

  async _identifyCriticalJSOptimizations(document) {
    const optimizations = [];
    
    const renderBlockingJS = document.querySelectorAll('script[src]:not([async]):not([defer])');
    
    renderBlockingJS.forEach(script => {
      if (!this._isCriticalResource(script)) {
        optimizations.push({
          type: 'defer_non_critical_js',
          priority: 'medium',
          title: 'Defer non-critical JavaScript',
          resource: script.src,
          impact: 'medium',
          complexity: 'low',
          description: 'Add defer attribute to non-critical scripts'
        });
      }
    });
    
    return optimizations;
  }

  async _identifyCriticalFontOptimizations(document) {
    const optimizations = [];
    
    const fontPreloads = document.querySelectorAll('link[rel="preload"][as="font"]');
    
    if (fontPreloads.length === 0) {
      const styleElements = document.querySelectorAll('style');
      let hasFontFace = false;
      
      styleElements.forEach(style => {
        if ((style.textContent || '').includes('@font-face')) {
          hasFontFace = true;
        }
      });
      
      if (hasFontFace) {
        optimizations.push({
          type: 'preload_critical_fonts',
          priority: 'medium',
          title: 'Preload critical fonts',
          impact: 'medium',
          complexity: 'low',
          description: 'Add preload links for critical web fonts'
        });
      }
    }
    
    return optimizations;
  }

  async _identifyCriticalImageOptimizations(document) {
    const optimizations = [];
    
    const aboveFoldImages = Array.from(document.querySelectorAll('img')).filter(img => 
      this._isAboveTheFold(img, this.options.aboveTheFoldHeight)
    );
    
    const lazyAboveFoldImages = aboveFoldImages.filter(img => 
      img.getAttribute('loading') === 'lazy'
    );
    
    if (lazyAboveFoldImages.length > 0) {
      optimizations.push({
        type: 'eager_load_critical_images',
        priority: 'high',
        title: 'Remove lazy loading from critical images',
        count: lazyAboveFoldImages.length,
        impact: 'high',
        complexity: 'low',
        description: 'Set loading="eager" for above-the-fold images'
      });
    }
    
    return optimizations;
  }

  _generateOptimizationStrategies(opportunities) {
    const strategies = {
      immediate: [],
      shortTerm: [],
      longTerm: []
    };
    
    opportunities.forEach(opp => {
      if (opp.complexity === 'low' && opp.impact === 'high') {
        strategies.immediate.push(opp);
      } else if (opp.complexity === 'medium') {
        strategies.shortTerm.push(opp);
      } else {
        strategies.longTerm.push(opp);
      }
    });
    
    return strategies;
  }

  _calculateOptimizationImpact(opportunities, performanceData) {
    const impact = {
      renderTimeReduction: 0,
      requestReduction: 0,
      bandwidthSavings: 0
    };
    
    opportunities.forEach(opp => {
      switch (opp.type) {
        case 'critical_css_inline':
          impact.requestReduction += 1;
          impact.renderTimeReduction += 200; // Estimated 200ms improvement
          break;
        case 'defer_non_critical_js':
          impact.renderTimeReduction += 100; // Estimated 100ms improvement
          break;
        case 'eager_load_critical_images':
          impact.renderTimeReduction += 150; // Estimated 150ms improvement
          break;
      }
    });
    
    return impact;
  }

  _assessImplementationComplexity(opportunities) {
    const complexity = {
      low: opportunities.filter(opp => opp.complexity === 'low').length,
      medium: opportunities.filter(opp => opp.complexity === 'medium').length,
      high: opportunities.filter(opp => opp.complexity === 'high').length,
      totalEffort: 0
    };
    
    complexity.totalEffort = complexity.low * 1 + complexity.medium * 3 + complexity.high * 8;
    
    return complexity;
  }

  _generateCriticalSummary(results) {
    let totalCriticalResources = 0;
    
    if (results.renderBlocking) {
      totalCriticalResources += results.renderBlocking.total;
    }
    
    if (results.aboveTheFold) {
      totalCriticalResources += results.aboveTheFold.images.length;
    }
    
    return {
      totalCriticalResources,
      renderBlockingResources: results.renderBlocking?.total || 0,
      aboveTheFoldImages: results.aboveTheFold?.images.length || 0,
      criticalPathLength: results.criticalPath?.metrics.criticalPathLength || 0,
      optimizationOpportunities: results.optimization?.opportunities.length || 0,
      overallCriticality: totalCriticalResources > 15 ? 'high' : 
                         totalCriticalResources > 8 ? 'medium' : 'low'
    };
  }
}

export default CriticalResourceDetector;
