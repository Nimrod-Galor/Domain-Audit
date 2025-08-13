/**
 * ============================================================================
 * TECHNICAL PERFORMANCE DETECTOR - GPT-5 STYLE MODULAR COMPONENT
 * ============================================================================
 * 
 * Advanced technical performance analysis for website optimization
 * Part of the Combined Approach Technical Analyzer (9th Implementation)
 * 
 * Features:
 * - Resource optimization analysis
 * - Loading performance evaluation
 * - Technical optimization opportunities
 * - Performance best practices assessment
 * - Critical rendering path analysis
 * - Core Web Vitals considerations
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration Combined Approach Pattern - GPT-5 Style Detector
 */

export class TechnicalPerformanceDetector {
  constructor(config = {}) {
    this.config = {
      enableResourceAnalysis: config.enableResourceAnalysis !== false,
      enableLoadingAnalysis: config.enableLoadingAnalysis !== false,
      enableOptimizationAnalysis: config.enableOptimizationAnalysis !== false,
      enableCriticalPathAnalysis: config.enableCriticalPathAnalysis !== false,
      maxResourceSize: config.maxResourceSize || 2048, // KB
      maxResourceCount: config.maxResourceCount || 50,
      detailedAnalysis: config.detailedAnalysis !== false,
      ...config
    };

    this.version = '1.0.0';
    this.detectorType = 'technical_performance';
    
    // Performance standards and thresholds
    this.standards = {
      resources: {
        maxImageSize: 1024, // KB
        maxScriptSize: 512, // KB
        maxStylesheetSize: 256, // KB
        maxFontSize: 200, // KB
        maxTotalResources: 50,
        maxDomainConnections: 6
      },
      loading: {
        maxScripts: 10,
        maxStylesheets: 5,
        maxFonts: 4,
        maxRedirects: 2,
        enableCompression: true,
        enableCaching: true
      },
      optimization: {
        minifyResources: true,
        combineFiles: true,
        optimizeImages: true,
        lazyLoading: true,
        resourceHints: true
      },
      criticalPath: {
        maxRenderBlocking: 3,
        inlineCriticalCSS: true,
        deferNonCritical: true,
        preloadCritical: true
      },
      webVitals: {
        lcpThreshold: 2.5, // seconds
        fidThreshold: 100, // milliseconds
        clsThreshold: 0.1
      }
    };

    this.cache = new Map();
  }

  /**
   * Get detector metadata
   * @returns {Object} Detector metadata
   */
  getMetadata() {
    return {
      name: 'TechnicalPerformanceDetector',
      version: this.version,
      type: this.detectorType,
      description: 'Analyzes technical performance and optimization opportunities for websites',
      capabilities: [
        'resource_optimization_analysis',
        'loading_performance_evaluation',
        'technical_optimization_opportunities',
        'critical_rendering_path_analysis',
        'performance_best_practices',
        'core_web_vitals_assessment'
      ],
      standards: Object.keys(this.standards),
      performance: 'High',
      accuracy: 'GPT-5 Enhanced'
    };
  }

  /**
   * Detect technical performance components
   * @param {Object} context - Analysis context containing document and metadata
   * @returns {Promise<Object>} Technical performance detection results
   */
  async detect(context) {
    try {
      const { document, url, pageData } = context;
      
      if (!document) {
        throw new Error('Document is required for technical performance analysis');
      }

      // Check cache
      const cacheKey = this._generateCacheKey(url);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const startTime = Date.now();

      // Phase 1: Resource analysis
      const resourceAnalysis = this._analyzeResources(document);

      // Phase 2: Loading performance analysis
      const loadingAnalysis = this._analyzeLoading(document);

      // Phase 3: Optimization opportunities analysis
      const optimizationAnalysis = this._analyzeOptimization(document);

      // Phase 4: Critical rendering path analysis
      const criticalPathAnalysis = this._analyzeCriticalPath(document);

      // Phase 5: Performance best practices analysis
      const bestPracticesAnalysis = this._analyzeBestPractices(document);

      // Phase 6: Core Web Vitals considerations
      const webVitalsAnalysis = this._analyzeWebVitals(document);

      // Calculate overall technical performance score
      const overallScore = this._calculatePerformanceScore({
        resources: resourceAnalysis,
        loading: loadingAnalysis,
        optimization: optimizationAnalysis,
        criticalPath: criticalPathAnalysis,
        bestPractices: bestPracticesAnalysis,
        webVitals: webVitalsAnalysis
      });

      // Compile comprehensive results
      const results = {
        success: true,
        detectorType: this.detectorType,
        
        // Core analysis results
        resources: resourceAnalysis,
        loading: loadingAnalysis,
        optimization: optimizationAnalysis,
        criticalPath: criticalPathAnalysis,
        bestPractices: bestPracticesAnalysis,
        webVitals: webVitalsAnalysis,
        
        // Overall assessment
        score: overallScore.score,
        grade: overallScore.grade,
        level: overallScore.level,
        performanceOptimized: overallScore.score >= 75,
        
        // Strategic insights
        insights: this._generatePerformanceInsights({
          resources: resourceAnalysis,
          loading: loadingAnalysis,
          optimization: optimizationAnalysis,
          criticalPath: criticalPathAnalysis,
          bestPractices: bestPracticesAnalysis,
          webVitals: webVitalsAnalysis
        }),
        
        recommendations: this._generatePerformanceRecommendations({
          resources: resourceAnalysis,
          loading: loadingAnalysis,
          optimization: optimizationAnalysis,
          criticalPath: criticalPathAnalysis,
          bestPractices: bestPracticesAnalysis,
          webVitals: webVitalsAnalysis
        }),
        
        // Performance metrics
        performance: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          cacheUsed: false
        }
      };

      // Cache results
      this.cache.set(cacheKey, results);

      return results;

    } catch (error) {
      return {
        success: false,
        error: `Technical performance detection failed: ${error.message}`,
        detectorType: this.detectorType
      };
    }
  }

  /**
   * Analyze resources
   * @param {Document} document - DOM document
   * @returns {Object} Resource analysis results
   */
  _analyzeResources(document) {
    const analysis = {
      scripts: { count: 0, external: 0, inline: 0, size: 0 },
      stylesheets: { count: 0, external: 0, inline: 0, size: 0 },
      images: { count: 0, optimized: 0, unoptimized: 0, size: 0 },
      fonts: { count: 0, webfonts: 0, size: 0 },
      other: { count: 0, size: 0 },
      domains: new Set(),
      total: { resources: 0, size: 0 },
      issues: [],
      recommendations: []
    };

    try {
      // Analyze scripts
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => {
        analysis.scripts.count++;
        analysis.total.resources++;
        
        if (script.src) {
          analysis.scripts.external++;
          const domain = this._extractDomain(script.src);
          if (domain) analysis.domains.add(domain);
        } else {
          analysis.scripts.inline++;
          // Estimate inline script size
          const inlineSize = (script.textContent || '').length / 1024;
          analysis.scripts.size += inlineSize;
          analysis.total.size += inlineSize;
        }
      });

      // Analyze stylesheets
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"], style');
      stylesheets.forEach(stylesheet => {
        analysis.stylesheets.count++;
        analysis.total.resources++;
        
        if (stylesheet.tagName === 'LINK' && stylesheet.href) {
          analysis.stylesheets.external++;
          const domain = this._extractDomain(stylesheet.href);
          if (domain) analysis.domains.add(domain);
        } else if (stylesheet.tagName === 'STYLE') {
          analysis.stylesheets.inline++;
          // Estimate inline style size
          const inlineSize = (stylesheet.textContent || '').length / 1024;
          analysis.stylesheets.size += inlineSize;
          analysis.total.size += inlineSize;
        }
      });

      // Analyze images
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        analysis.images.count++;
        analysis.total.resources++;
        
        if (img.src) {
          const domain = this._extractDomain(img.src);
          if (domain) analysis.domains.add(domain);
        }
        
        // Check for optimization
        if (img.hasAttribute('srcset') || img.hasAttribute('sizes') || 
            img.getAttribute('loading') === 'lazy') {
          analysis.images.optimized++;
        } else {
          analysis.images.unoptimized++;
        }
      });

      // Analyze fonts
      const fontLinks = document.querySelectorAll('link[href*="font"], link[href*=".woff"], link[href*=".ttf"]');
      fontLinks.forEach(font => {
        analysis.fonts.count++;
        analysis.fonts.webfonts++;
        analysis.total.resources++;
        
        if (font.href) {
          const domain = this._extractDomain(font.href);
          if (domain) analysis.domains.add(domain);
        }
      });

      // Analyze other resources
      const otherResources = document.querySelectorAll('link[rel="preload"], link[rel="prefetch"], object, embed');
      analysis.other.count = otherResources.length;
      analysis.total.resources += otherResources.length;

      // Generate resource-specific issues and recommendations
      if (analysis.scripts.count > this.standards.loading.maxScripts) {
        analysis.issues.push(`Too many script files (${analysis.scripts.count})`);
        analysis.recommendations.push('Combine and minify JavaScript files');
      }

      if (analysis.stylesheets.count > this.standards.loading.maxStylesheets) {
        analysis.issues.push(`Too many stylesheet files (${analysis.stylesheets.count})`);
        analysis.recommendations.push('Combine CSS files to reduce HTTP requests');
      }

      if (analysis.fonts.count > this.standards.loading.maxFonts) {
        analysis.issues.push(`Too many font files (${analysis.fonts.count})`);
        analysis.recommendations.push('Reduce number of font files and use font-display: swap');
      }

      if (analysis.domains.size > this.standards.resources.maxDomainConnections) {
        analysis.issues.push(`Too many external domains (${analysis.domains.size})`);
        analysis.recommendations.push('Minimize external domain connections');
      }

      if (analysis.images.unoptimized > analysis.images.optimized) {
        analysis.issues.push('Most images are not optimized for performance');
        analysis.recommendations.push('Implement responsive images and lazy loading');
      }

      // Calculate resource score
      const score = this._calculateResourceScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze loading performance
   * @param {Document} document - DOM document
   * @returns {Object} Loading performance analysis results
   */
  _analyzeLoading(document) {
    const analysis = {
      renderBlocking: { scripts: 0, stylesheets: 0 },
      async: { scripts: 0, defer: 0 },
      preloading: { critical: 0, prefetch: 0, dns: 0 },
      compression: { enabled: false, gzip: false, brotli: false },
      caching: { enabled: false, headers: false },
      issues: [],
      recommendations: []
    };

    try {
      // Analyze render-blocking resources
      const renderBlockingScripts = document.querySelectorAll('script[src]:not([async]):not([defer])');
      const renderBlockingStyles = document.querySelectorAll('link[rel="stylesheet"]:not([media*="print"])');
      
      analysis.renderBlocking.scripts = renderBlockingScripts.length;
      analysis.renderBlocking.stylesheets = renderBlockingStyles.length;

      // Analyze async loading
      const asyncScripts = document.querySelectorAll('script[async]');
      const deferScripts = document.querySelectorAll('script[defer]');
      
      analysis.async.scripts = asyncScripts.length;
      analysis.async.defer = deferScripts.length;

      // Analyze preloading and resource hints
      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      const prefetchLinks = document.querySelectorAll('link[rel="prefetch"]');
      const dnsLinks = document.querySelectorAll('link[rel="dns-prefetch"], link[rel="preconnect"]');
      
      analysis.preloading.critical = preloadLinks.length;
      analysis.preloading.prefetch = prefetchLinks.length;
      analysis.preloading.dns = dnsLinks.length;

      // Check for compression indicators (limited in client-side analysis)
      const metaCompression = document.querySelector('meta[name*="compression"]');
      analysis.compression.enabled = !!metaCompression;

      // Check for caching indicators
      const metaCaching = document.querySelector('meta[name*="cache"]');
      analysis.caching.enabled = !!metaCaching;

      // Generate loading-specific issues and recommendations
      if (analysis.renderBlocking.scripts > this.standards.criticalPath.maxRenderBlocking) {
        analysis.issues.push('Too many render-blocking JavaScript files');
        analysis.recommendations.push('Use async or defer attributes for non-critical scripts');
      }

      if (analysis.renderBlocking.stylesheets > 2) {
        analysis.issues.push('Multiple render-blocking stylesheets detected');
        analysis.recommendations.push('Inline critical CSS and defer non-critical styles');
      }

      if (analysis.async.scripts === 0 && analysis.renderBlocking.scripts > 0) {
        analysis.recommendations.push('Implement async loading for JavaScript files');
      }

      if (analysis.preloading.critical === 0) {
        analysis.recommendations.push('Use resource preloading for critical assets');
      }

      if (analysis.preloading.dns === 0 && document.querySelectorAll('script[src*="//"], link[href*="//"]').length > 0) {
        analysis.recommendations.push('Add DNS prefetch for external domains');
      }

      // Calculate loading score
      const score = this._calculateLoadingScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze optimization opportunities
   * @param {Document} document - DOM document
   * @returns {Object} Optimization analysis results
   */
  _analyzeOptimization(document) {
    const analysis = {
      minification: { scripts: false, styles: false, html: false },
      compression: { images: false, text: false },
      bundling: { scripts: false, styles: false },
      lazyLoading: { images: 0, iframes: 0 },
      caching: { headers: false, serviceWorker: false },
      cdn: { detected: false, domains: [] },
      issues: [],
      recommendations: []
    };

    try {
      // Check for minification indicators
      const scripts = document.querySelectorAll('script[src]');
      scripts.forEach(script => {
        if (script.src && (script.src.includes('.min.') || script.src.includes('minified'))) {
          analysis.minification.scripts = true;
        }
      });

      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      stylesheets.forEach(style => {
        if (style.href && (style.href.includes('.min.') || style.href.includes('minified'))) {
          analysis.minification.styles = true;
        }
      });

      // Check HTML minification (basic indicator)
      const htmlSource = document.documentElement.outerHTML;
      const hasExcessiveWhitespace = /\n\s{4,}/.test(htmlSource);
      analysis.minification.html = !hasExcessiveWhitespace;

      // Check for lazy loading
      const lazyImages = document.querySelectorAll('img[loading="lazy"], img[data-src]');
      const lazyIframes = document.querySelectorAll('iframe[loading="lazy"], iframe[data-src]');
      
      analysis.lazyLoading.images = lazyImages.length;
      analysis.lazyLoading.iframes = lazyIframes.length;

      // Check for service worker
      const serviceWorkerScript = document.querySelector('script:contains("serviceWorker")') ||
                                  Array.from(document.querySelectorAll('script')).find(s => 
                                    s.textContent && s.textContent.includes('serviceWorker'));
      analysis.caching.serviceWorker = !!serviceWorkerScript;

      // Check for CDN usage
      const externalResources = document.querySelectorAll('[src*="//"], [href*="//"]');
      const cdnDomains = [];
      const cdnPatterns = ['cdn', 'cloudfront', 'cloudflare', 'maxcdn', 'jsdelivr', 'unpkg'];
      
      externalResources.forEach(resource => {
        const url = resource.src || resource.href;
        if (url) {
          const domain = this._extractDomain(url);
          if (domain && cdnPatterns.some(pattern => domain.includes(pattern))) {
            cdnDomains.push(domain);
            analysis.cdn.detected = true;
          }
        }
      });
      
      analysis.cdn.domains = [...new Set(cdnDomains)];

      // Generate optimization recommendations
      if (!analysis.minification.scripts && scripts.length > 0) {
        analysis.issues.push('JavaScript files not minified');
        analysis.recommendations.push('Minify JavaScript files to reduce file sizes');
      }

      if (!analysis.minification.styles && stylesheets.length > 0) {
        analysis.issues.push('CSS files not minified');
        analysis.recommendations.push('Minify CSS files to improve loading speed');
      }

      if (!analysis.minification.html) {
        analysis.recommendations.push('Minify HTML to reduce document size');
      }

      const totalImages = document.querySelectorAll('img').length;
      if (totalImages > 5 && analysis.lazyLoading.images === 0) {
        analysis.issues.push('Images not lazy loaded');
        analysis.recommendations.push('Implement lazy loading for images below the fold');
      }

      if (!analysis.caching.serviceWorker && scripts.length > 3) {
        analysis.recommendations.push('Consider implementing service worker for caching');
      }

      if (!analysis.cdn.detected && externalResources.length > 5) {
        analysis.recommendations.push('Consider using CDN for static assets');
      }

      // Calculate optimization score
      const score = this._calculateOptimizationScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze critical rendering path
   * @param {Document} document - DOM document
   * @returns {Object} Critical path analysis results
   */
  _analyzeCriticalPath(document) {
    const analysis = {
      critical: { css: false, js: false, fonts: false },
      blocking: { css: 0, js: 0 },
      inlined: { css: 0, js: 0 },
      deferred: { css: 0, js: 0 },
      preloaded: { css: 0, js: 0, fonts: 0 },
      issues: [],
      recommendations: []
    };

    try {
      // Analyze CSS in critical path
      const inlineStyles = document.querySelectorAll('style');
      const externalStyles = document.querySelectorAll('link[rel="stylesheet"]');
      const preloadedStyles = document.querySelectorAll('link[rel="preload"][as="style"]');
      
      analysis.inlined.css = inlineStyles.length;
      analysis.blocking.css = externalStyles.length;
      analysis.preloaded.css = preloadedStyles.length;

      // Check for critical CSS patterns
      inlineStyles.forEach(style => {
        const content = style.textContent || '';
        if (content.includes('above-the-fold') || content.includes('critical') || content.length > 1000) {
          analysis.critical.css = true;
        }
      });

      // Analyze JavaScript in critical path
      const inlineScripts = document.querySelectorAll('script:not([src])');
      const blockingScripts = document.querySelectorAll('script[src]:not([async]):not([defer])');
      const deferredScripts = document.querySelectorAll('script[defer]');
      const preloadedScripts = document.querySelectorAll('link[rel="preload"][as="script"]');
      
      analysis.inlined.js = inlineScripts.length;
      analysis.blocking.js = blockingScripts.length;
      analysis.deferred.js = deferredScripts.length;
      analysis.preloaded.js = preloadedScripts.length;

      // Check for critical JavaScript patterns
      inlineScripts.forEach(script => {
        const content = script.textContent || '';
        if (content.includes('critical') || content.includes('init') || content.length > 500) {
          analysis.critical.js = true;
        }
      });

      // Analyze font loading
      const fontLinks = document.querySelectorAll('link[rel="preload"][as="font"]');
      const fontFaces = document.querySelectorAll('style:contains("@font-face")') ||
                       Array.from(document.querySelectorAll('style')).filter(s => 
                         s.textContent && s.textContent.includes('@font-face'));
      
      analysis.preloaded.fonts = fontLinks.length;
      analysis.critical.fonts = fontFaces.length > 0;

      // Generate critical path recommendations
      if (analysis.blocking.css > 2) {
        analysis.issues.push('Multiple render-blocking CSS files');
        analysis.recommendations.push('Inline critical CSS and defer non-critical styles');
      }

      if (analysis.blocking.js > 1) {
        analysis.issues.push('Multiple render-blocking JavaScript files');
        analysis.recommendations.push('Defer non-critical JavaScript execution');
      }

      if (!analysis.critical.css && analysis.inlined.css === 0) {
        analysis.recommendations.push('Consider inlining critical CSS for faster rendering');
      }

      if (analysis.preloaded.css === 0 && analysis.blocking.css > 0) {
        analysis.recommendations.push('Preload critical CSS files');
      }

      if (analysis.preloaded.fonts === 0 && fontFaces.length > 0) {
        analysis.recommendations.push('Preload critical web fonts');
      }

      // Calculate critical path score
      const score = this._calculateCriticalPathScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze performance best practices
   * @param {Document} document - DOM document
   * @returns {Object} Best practices analysis results
   */
  _analyzeBestPractices(document) {
    const analysis = {
      httpRequests: { total: 0, optimized: false },
      resourceHints: { dns: 0, preconnect: 0, preload: 0, prefetch: 0 },
      modernFormats: { webp: false, avif: false, woff2: false },
      performance: { budget: false, monitoring: false },
      accessibility: { alt: 0, aria: 0 },
      issues: [],
      recommendations: []
    };

    try {
      // Count total HTTP requests
      const allResources = document.querySelectorAll('[src], [href]');
      analysis.httpRequests.total = allResources.length;
      analysis.httpRequests.optimized = analysis.httpRequests.total <= this.standards.resources.maxTotalResources;

      // Analyze resource hints
      analysis.resourceHints.dns = document.querySelectorAll('link[rel="dns-prefetch"]').length;
      analysis.resourceHints.preconnect = document.querySelectorAll('link[rel="preconnect"]').length;
      analysis.resourceHints.preload = document.querySelectorAll('link[rel="preload"]').length;
      analysis.resourceHints.prefetch = document.querySelectorAll('link[rel="prefetch"]').length;

      // Check for modern formats
      const images = document.querySelectorAll('img, picture source');
      images.forEach(img => {
        const src = img.src || img.srcset || '';
        if (src.includes('.webp')) analysis.modernFormats.webp = true;
        if (src.includes('.avif')) analysis.modernFormats.avif = true;
      });

      const fonts = document.querySelectorAll('link[href*=".woff2"]');
      analysis.modernFormats.woff2 = fonts.length > 0;

      // Check for performance monitoring
      const performanceScripts = Array.from(document.querySelectorAll('script')).find(s => 
        s.textContent && (
          s.textContent.includes('performance.') ||
          s.textContent.includes('PerformanceObserver') ||
          s.textContent.includes('navigation.timing')
        )
      );
      analysis.performance.monitoring = !!performanceScripts;

      // Basic accessibility checks
      const imagesWithAlt = document.querySelectorAll('img[alt]');
      const elementsWithAria = document.querySelectorAll('[aria-label], [aria-describedby], [role]');
      
      analysis.accessibility.alt = imagesWithAlt.length;
      analysis.accessibility.aria = elementsWithAria.length;

      // Generate best practices recommendations
      if (!analysis.httpRequests.optimized) {
        analysis.issues.push(`Too many HTTP requests (${analysis.httpRequests.total})`);
        analysis.recommendations.push('Reduce number of HTTP requests through bundling and optimization');
      }

      if (analysis.resourceHints.dns === 0 && allResources.length > 10) {
        analysis.recommendations.push('Use DNS prefetch for external domains');
      }

      if (analysis.resourceHints.preload === 0) {
        analysis.recommendations.push('Preload critical resources for faster loading');
      }

      if (!analysis.modernFormats.webp && images.length > 5) {
        analysis.recommendations.push('Use modern image formats like WebP for better compression');
      }

      if (!analysis.modernFormats.woff2 && fonts.length > 0) {
        analysis.recommendations.push('Use WOFF2 font format for better compression');
      }

      if (!analysis.performance.monitoring) {
        analysis.recommendations.push('Implement performance monitoring and measurement');
      }

      // Calculate best practices score
      const score = this._calculateBestPracticesScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze Core Web Vitals considerations
   * @param {Document} document - DOM document
   * @returns {Object} Web Vitals analysis results
   */
  _analyzeWebVitals(document) {
    const analysis = {
      lcp: { candidates: [], optimized: false },
      fid: { interactivity: false, optimized: false },
      cls: { layoutShift: false, optimized: false },
      implementations: { measurement: false, optimization: false },
      issues: [],
      recommendations: []
    };

    try {
      // Analyze LCP (Largest Contentful Paint) candidates
      const lcpCandidates = document.querySelectorAll('img, video, h1, h2, p');
      analysis.lcp.candidates = Array.from(lcpCandidates).slice(0, 5).map(el => ({
        tagName: el.tagName,
        hasOptimization: el.hasAttribute('loading') || el.hasAttribute('srcset'),
        isAboveFold: this._isAboveFold(el)
      }));

      // Check for LCP optimization
      const optimizedLcpElements = analysis.lcp.candidates.filter(el => el.hasOptimization);
      analysis.lcp.optimized = optimizedLcpElements.length > 0;

      // Analyze FID (First Input Delay) factors
      const interactiveElements = document.querySelectorAll('button, a[href], input, select, textarea');
      const hasEventListeners = Array.from(document.querySelectorAll('script')).some(s => 
        s.textContent && (
          s.textContent.includes('addEventListener') ||
          s.textContent.includes('onclick') ||
          s.textContent.includes('onload')
        )
      );
      
      analysis.fid.interactivity = interactiveElements.length > 0;
      analysis.fid.optimized = hasEventListeners; // Simplified check

      // Analyze CLS (Cumulative Layout Shift) factors
      const elementsWithoutDimensions = document.querySelectorAll('img:not([width]):not([height])');
      const hasReservedSpace = elementsWithoutDimensions.length === 0;
      
      analysis.cls.layoutShift = elementsWithoutDimensions.length > 0;
      analysis.cls.optimized = hasReservedSpace;

      // Check for Web Vitals implementation
      const webVitalsScript = Array.from(document.querySelectorAll('script')).find(s => 
        s.textContent && (
          s.textContent.includes('web-vitals') ||
          s.textContent.includes('CLS') ||
          s.textContent.includes('FID') ||
          s.textContent.includes('LCP')
        )
      );
      analysis.implementations.measurement = !!webVitalsScript;

      // Generate Web Vitals recommendations
      if (!analysis.lcp.optimized) {
        analysis.issues.push('LCP elements not optimized');
        analysis.recommendations.push('Optimize largest contentful paint elements with preloading and compression');
      }

      if (analysis.cls.layoutShift) {
        analysis.issues.push('Images without dimensions may cause layout shift');
        analysis.recommendations.push('Set explicit width and height for images to prevent CLS');
      }

      if (!analysis.fid.optimized && analysis.fid.interactivity) {
        analysis.recommendations.push('Optimize JavaScript execution to improve First Input Delay');
      }

      if (!analysis.implementations.measurement) {
        analysis.recommendations.push('Implement Core Web Vitals measurement for performance monitoring');
      }

      // Calculate Web Vitals score
      const score = this._calculateWebVitalsScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  _extractDomain(url) {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.hostname;
    } catch {
      return null;
    }
  }

  _isAboveFold(element) {
    // Simplified above-the-fold detection
    try {
      const rect = element.getBoundingClientRect();
      return rect.top < window.innerHeight;
    } catch {
      return false;
    }
  }

  _calculatePerformanceScore(components) {
    const weights = {
      resources: 0.20,
      loading: 0.20,
      optimization: 0.20,
      criticalPath: 0.15,
      bestPractices: 0.15,
      webVitals: 0.10
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([component, weight]) => {
      if (components[component] && components[component].score !== undefined) {
        totalScore += components[component].score * weight;
        totalWeight += weight;
      }
    });

    const score = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    const grade = this._calculateGrade(score);
    const level = this._categorizeLevel(score);

    return { score, grade, level };
  }

  _calculateResourceScore(analysis) {
    let score = 80; // Base score
    
    if (analysis.scripts.count <= this.standards.loading.maxScripts) score += 5;
    if (analysis.stylesheets.count <= this.standards.loading.maxStylesheets) score += 5;
    if (analysis.fonts.count <= this.standards.loading.maxFonts) score += 5;
    if (analysis.domains.size <= this.standards.resources.maxDomainConnections) score += 5;
    
    if (analysis.images.optimized > analysis.images.unoptimized) score += 10;
    
    score -= analysis.issues.length * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  _calculateLoadingScore(analysis) {
    let score = 70; // Base score
    
    if (analysis.renderBlocking.scripts <= 2) score += 10;
    if (analysis.renderBlocking.stylesheets <= 2) score += 10;
    if (analysis.async.scripts > 0) score += 10;
    if (analysis.preloading.critical > 0) score += 5;
    if (analysis.preloading.dns > 0) score += 5;
    
    score -= analysis.issues.length * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  _calculateOptimizationScore(analysis) {
    let score = 60; // Base score
    
    if (analysis.minification.scripts) score += 10;
    if (analysis.minification.styles) score += 10;
    if (analysis.minification.html) score += 5;
    if (analysis.lazyLoading.images > 0) score += 10;
    if (analysis.caching.serviceWorker) score += 10;
    if (analysis.cdn.detected) score += 5;
    
    score -= analysis.issues.length * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  _calculateCriticalPathScore(analysis) {
    let score = 70; // Base score
    
    if (analysis.critical.css) score += 10;
    if (analysis.blocking.css <= 2) score += 10;
    if (analysis.blocking.js <= 1) score += 10;
    if (analysis.preloaded.css > 0) score += 5;
    if (analysis.preloaded.fonts > 0) score += 5;
    
    score -= analysis.issues.length * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  _calculateBestPracticesScore(analysis) {
    let score = 65; // Base score
    
    if (analysis.httpRequests.optimized) score += 10;
    if (analysis.resourceHints.preload > 0) score += 5;
    if (analysis.resourceHints.dns > 0) score += 5;
    if (analysis.modernFormats.webp) score += 5;
    if (analysis.modernFormats.woff2) score += 5;
    if (analysis.performance.monitoring) score += 5;
    
    score -= analysis.issues.length * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  _calculateWebVitalsScore(analysis) {
    let score = 70; // Base score
    
    if (analysis.lcp.optimized) score += 10;
    if (analysis.cls.optimized) score += 10;
    if (analysis.fid.optimized) score += 5;
    if (analysis.implementations.measurement) score += 5;
    
    score -= analysis.issues.length * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  _generatePerformanceInsights(components) {
    const insights = [];
    
    // Resource insights
    if (components.resources.images.optimized > 0) {
      insights.push({
        type: 'positive',
        category: 'resources',
        message: 'Optimized images detected for better performance',
        impact: 'high'
      });
    }
    
    // Loading insights
    if (components.loading.async.scripts > 0) {
      insights.push({
        type: 'positive',
        category: 'loading',
        message: 'Async script loading implemented',
        impact: 'medium'
      });
    }
    
    // Optimization insights
    if (components.optimization.cdn.detected) {
      insights.push({
        type: 'positive',
        category: 'optimization',
        message: 'CDN usage detected for faster content delivery',
        impact: 'high'
      });
    }
    
    return insights;
  }

  _generatePerformanceRecommendations(components) {
    const recommendations = [];
    
    // Collect all component recommendations
    Object.values(components).forEach(component => {
      if (component.recommendations) {
        recommendations.push(...component.recommendations.map(rec => ({
          text: rec,
          category: 'performance',
          priority: 'high',
          complexity: 'medium'
        })));
      }
    });
    
    return recommendations.slice(0, 15); // Limit recommendations
  }

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
    if (score >= 65) return 'D';
    return 'F';
  }

  _categorizeLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'satisfactory';
    if (score >= 60) return 'needs_improvement';
    return 'poor';
  }

  _generateCacheKey(url) {
    return btoa(url || 'unknown').slice(0, 20);
  }
}

export default TechnicalPerformanceDetector;
