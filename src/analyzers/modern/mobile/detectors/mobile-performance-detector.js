/**
 * Mobile Performance Detector - GPT-5 Style Modular Component
 * 
 * Detects mobile-specific performance patterns, optimizations, and Core Web Vitals considerations
 */

export class MobilePerformanceDetector {
  constructor(config = {}) {
    this.config = {
      analyzeResourceOptimization: config.analyzeResourceOptimization !== false,
      analyzeMobileSpecificMetrics: config.analyzeMobileSpecificMetrics !== false,
      analyzeNetworkOptimization: config.analyzeNetworkOptimization !== false,
      analyzeBatteryOptimization: config.analyzeBatteryOptimization !== false,
      maxResourcesAnalyzed: config.maxResourcesAnalyzed || 100,
      ...config
    };
  }

  /**
   * Analyze mobile-specific performance characteristics
   * @param {Object} document - DOM document or Cheerio instance
   * @param {string} url - Page URL
   * @param {Object} pageData - Additional page performance data
   * @returns {Object} Mobile performance analysis
   */
  async analyze(document, url, pageData = {}) {
    const results = {
      resourceOptimization: {},
      mobileMetrics: {},
      networkOptimization: {},
      batteryOptimization: {},
      coreWebVitals: {},
      score: 0,
      grade: 'F',
      optimizations: [],
      issues: []
    };

    try {
      // Analyze resource optimization for mobile
      if (this.config.analyzeResourceOptimization) {
        results.resourceOptimization = this.analyzeResourceOptimization(document);
      }

      // Analyze mobile-specific performance metrics
      if (this.config.analyzeMobileSpecificMetrics) {
        results.mobileMetrics = this.analyzeMobileSpecificMetrics(document, pageData);
      }

      // Analyze network optimization
      if (this.config.analyzeNetworkOptimization) {
        results.networkOptimization = this.analyzeNetworkOptimization(document);
      }

      // Analyze battery optimization considerations
      if (this.config.analyzeBatteryOptimization) {
        results.batteryOptimization = this.analyzeBatteryOptimization(document);
      }

      // Analyze Core Web Vitals for mobile
      results.coreWebVitals = this.analyzeCoreWebVitals(pageData);

      // Calculate scores and generate insights
      results.score = this.calculateMobilePerformanceScore(results);
      results.grade = this.calculateGrade(results.score);
      results.optimizations = this.identifyOptimizations(results);
      results.issues = this.identifyPerformanceIssues(results);

    } catch (error) {
      results.error = error.message;
      results.score = 0;
    }

    return results;
  }

  /**
   * Analyze resource optimization for mobile devices
   * @param {Object} document - DOM document
   * @returns {Object} Resource optimization analysis
   * @private
   */
  analyzeResourceOptimization(document) {
    const resources = {
      images: {},
      stylesheets: {},
      scripts: {},
      fonts: {},
      preloading: {},
      lazyLoading: {},
      compression: {},
      score: 0,
      optimizations: []
    };

    try {
      // Analyze image optimization
      resources.images = this.analyzeImageOptimization(document);
      
      // Analyze CSS optimization
      resources.stylesheets = this.analyzeCSSOptimization(document);
      
      // Analyze JavaScript optimization
      resources.scripts = this.analyzeJavaScriptOptimization(document);
      
      // Analyze font optimization
      resources.fonts = this.analyzeFontOptimization(document);
      
      // Analyze preloading strategies
      resources.preloading = this.analyzePreloading(document);
      
      // Analyze lazy loading implementation
      resources.lazyLoading = this.analyzeLazyLoading(document);
      
      // Analyze compression indicators
      resources.compression = this.analyzeCompression(document);

      // Calculate resource optimization score
      resources.score = this.calculateResourceScore(resources);
      resources.optimizations = this.identifyResourceOptimizations(resources);

    } catch (error) {
      resources.error = error.message;
    }

    return resources;
  }

  /**
   * Analyze image optimization for mobile
   * @param {Object} document - DOM document
   * @returns {Object} Image optimization analysis
   * @private
   */
  analyzeImageOptimization(document) {
    const images = {
      total: 0,
      responsive: 0,
      lazyLoaded: 0,
      modernFormats: 0,
      optimized: 0,
      techniques: [],
      score: 0
    };

    try {
      const imageElements = document.querySelectorAll('img');
      images.total = Math.min(imageElements.length, this.config.maxResourcesAnalyzed);

      imageElements.forEach((img, index) => {
        if (index >= this.config.maxResourcesAnalyzed) return;

        // Check responsive images
        if (img.hasAttribute('srcset') || img.hasAttribute('sizes')) {
          images.responsive++;
          if (!images.techniques.includes('responsive-images')) {
            images.techniques.push('responsive-images');
          }
        }

        // Check lazy loading
        if (img.hasAttribute('loading') && img.getAttribute('loading') === 'lazy') {
          images.lazyLoaded++;
          if (!images.techniques.includes('lazy-loading')) {
            images.techniques.push('lazy-loading');
          }
        }

        // Check for modern image formats
        const src = img.getAttribute('src') || '';
        const srcset = img.getAttribute('srcset') || '';
        const allSources = src + ' ' + srcset;
        
        if (/\.(webp|avif|heic)/i.test(allSources)) {
          images.modernFormats++;
          if (!images.techniques.includes('modern-formats')) {
            images.techniques.push('modern-formats');
          }
        }
      });

      // Check for picture elements (additional responsive image technique)
      const pictureElements = document.querySelectorAll('picture');
      if (pictureElements.length > 0) {
        images.responsive += pictureElements.length;
        if (!images.techniques.includes('picture-element')) {
          images.techniques.push('picture-element');
        }
      }

      // Calculate optimization ratio
      if (images.total > 0) {
        images.optimized = images.responsive + images.lazyLoaded + images.modernFormats;
        images.score = Math.min(100, (images.optimized / images.total) * 100);
      }

    } catch (error) {
      images.error = error.message;
    }

    return images;
  }

  /**
   * Analyze CSS optimization for mobile
   * @param {Object} document - DOM document
   * @returns {Object} CSS optimization analysis
   * @private
   */
  analyzeCSSOptimization(document) {
    const css = {
      total: 0,
      inline: 0,
      external: 0,
      critical: 0,
      minified: 0,
      techniques: [],
      score: 0
    };

    try {
      // Count CSS resources
      const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
      const styleElements = document.querySelectorAll('style');
      
      css.external = linkElements.length;
      css.inline = styleElements.length;
      css.total = css.external + css.inline;

      // Check for critical CSS (inline styles in head)
      const headStyles = document.querySelectorAll('head style');
      if (headStyles.length > 0) {
        css.critical = headStyles.length;
        css.techniques.push('critical-css');
      }

      // Check for minification indicators (basic heuristic)
      let minifiedCount = 0;
      linkElements.forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href.includes('.min.') || href.includes('-min.')) {
          minifiedCount++;
        }
      });
      css.minified = minifiedCount;

      if (css.minified > 0) {
        css.techniques.push('minification');
      }

      // Check for media queries (mobile optimization)
      linkElements.forEach(link => {
        const media = link.getAttribute('media');
        if (media && media !== 'all' && media !== 'screen') {
          css.techniques.push('media-queries');
        }
      });

      // Check for preload hints
      const preloadCSS = document.querySelectorAll('link[rel="preload"][as="style"]');
      if (preloadCSS.length > 0) {
        css.techniques.push('css-preload');
      }

      // Calculate CSS optimization score
      let score = 0;
      if (css.critical > 0) score += 30;
      if (css.minified / css.external > 0.5) score += 25;
      if (css.techniques.includes('media-queries')) score += 25;
      if (css.techniques.includes('css-preload')) score += 20;

      css.score = Math.min(100, score);

    } catch (error) {
      css.error = error.message;
    }

    return css;
  }

  /**
   * Analyze JavaScript optimization for mobile
   * @param {Object} document - DOM document
   * @returns {Object} JavaScript optimization analysis
   * @private
   */
  analyzeJavaScriptOptimization(document) {
    const js = {
      total: 0,
      inline: 0,
      external: 0,
      async: 0,
      defer: 0,
      minified: 0,
      bundled: 0,
      techniques: [],
      score: 0
    };

    try {
      const scriptElements = document.querySelectorAll('script');
      
      scriptElements.forEach(script => {
        const src = script.getAttribute('src');
        
        if (src) {
          js.external++;
          
          // Check for async/defer
          if (script.hasAttribute('async')) {
            js.async++;
            if (!js.techniques.includes('async-loading')) {
              js.techniques.push('async-loading');
            }
          }
          
          if (script.hasAttribute('defer')) {
            js.defer++;
            if (!js.techniques.includes('defer-loading')) {
              js.techniques.push('defer-loading');
            }
          }

          // Check for minification
          if (src.includes('.min.') || src.includes('-min.')) {
            js.minified++;
            if (!js.techniques.includes('minification')) {
              js.techniques.push('minification');
            }
          }

          // Check for bundling (basic heuristic)
          if (src.includes('bundle') || src.includes('chunk')) {
            js.bundled++;
            if (!js.techniques.includes('bundling')) {
              js.techniques.push('bundling');
            }
          }
        } else {
          js.inline++;
        }
      });

      js.total = js.external + js.inline;

      // Check for module loading
      const moduleScripts = document.querySelectorAll('script[type="module"]');
      if (moduleScripts.length > 0) {
        js.techniques.push('es-modules');
      }

      // Check for preload hints
      const preloadJS = document.querySelectorAll('link[rel="preload"][as="script"]');
      if (preloadJS.length > 0) {
        js.techniques.push('script-preload');
      }

      // Calculate JavaScript optimization score
      let score = 0;
      if (js.external > 0) {
        const asyncDefer = (js.async + js.defer) / js.external;
        score += asyncDefer * 30;
        
        const minificationRatio = js.minified / js.external;
        score += minificationRatio * 30;
      }
      
      if (js.techniques.includes('bundling')) score += 20;
      if (js.techniques.includes('script-preload')) score += 20;

      js.score = Math.min(100, score);

    } catch (error) {
      js.error = error.message;
    }

    return js;
  }

  /**
   * Analyze font optimization for mobile
   * @param {Object} document - DOM document
   * @returns {Object} Font optimization analysis
   * @private
   */
  analyzeFontOptimization(document) {
    const fonts = {
      total: 0,
      webFonts: 0,
      preloaded: 0,
      displaySwap: 0,
      systemFonts: false,
      techniques: [],
      score: 0
    };

    try {
      // Check for font preloading
      const preloadFonts = document.querySelectorAll('link[rel="preload"][as="font"]');
      fonts.preloaded = preloadFonts.length;
      
      if (fonts.preloaded > 0) {
        fonts.techniques.push('font-preload');
      }

      // Check for Google Fonts or other web fonts
      const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="fonts.google.com"], link[href*="typekit"]');
      fonts.webFonts = fontLinks.length;

      // Check for font-display: swap in CSS
      const styleElements = document.querySelectorAll('style');
      const cssContent = Array.from(styleElements)
        .map(style => style.textContent || '')
        .join(' ');

      if (/font-display:\s*swap/i.test(cssContent)) {
        fonts.displaySwap++;
        fonts.techniques.push('font-display-swap');
      }

      // Check for system font usage (basic heuristic)
      if (/system-ui|segoe ui|roboto|helvetica|arial/i.test(cssContent)) {
        fonts.systemFonts = true;
        fonts.techniques.push('system-fonts');
      }

      fonts.total = fonts.webFonts;

      // Calculate font optimization score
      let score = 0;
      if (fonts.systemFonts) score += 40;
      if (fonts.preloaded > 0 && fonts.webFonts > 0) score += 30;
      if (fonts.displaySwap > 0) score += 30;

      fonts.score = Math.min(100, score);

    } catch (error) {
      fonts.error = error.message;
    }

    return fonts;
  }

  /**
   * Analyze preloading strategies
   * @param {Object} document - DOM document
   * @returns {Object} Preloading analysis
   * @private
   */
  analyzePreloading(document) {
    const preloading = {
      resources: 0,
      types: [],
      dnsPrefetch: 0,
      preconnect: 0,
      techniques: [],
      score: 0
    };

    try {
      // Check for resource preloading
      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      preloading.resources = preloadLinks.length;

      preloadLinks.forEach(link => {
        const as = link.getAttribute('as');
        if (as && !preloading.types.includes(as)) {
          preloading.types.push(as);
        }
      });

      // Check for DNS prefetch
      const dnsPrefetch = document.querySelectorAll('link[rel="dns-prefetch"]');
      preloading.dnsPrefetch = dnsPrefetch.length;

      // Check for preconnect
      const preconnect = document.querySelectorAll('link[rel="preconnect"]');
      preloading.preconnect = preconnect.length;

      // Identify techniques
      if (preloading.resources > 0) preloading.techniques.push('resource-preload');
      if (preloading.dnsPrefetch > 0) preloading.techniques.push('dns-prefetch');
      if (preloading.preconnect > 0) preloading.techniques.push('preconnect');

      // Calculate preloading score
      preloading.score = Math.min(100, preloading.techniques.length * 33);

    } catch (error) {
      preloading.error = error.message;
    }

    return preloading;
  }

  /**
   * Analyze lazy loading implementation
   * @param {Object} document - DOM document
   * @returns {Object} Lazy loading analysis
   * @private
   */
  analyzeLazyLoading(document) {
    const lazyLoading = {
      images: 0,
      iframes: 0,
      scripts: 0,
      total: 0,
      techniques: [],
      score: 0
    };

    try {
      // Check for native lazy loading
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      lazyLoading.images = lazyImages.length;

      const lazyIframes = document.querySelectorAll('iframe[loading="lazy"]');
      lazyLoading.iframes = lazyIframes.length;

      // Check for JavaScript-based lazy loading
      const lazyClasses = document.querySelectorAll('[class*="lazy"], [data-src], [data-lazy]');
      if (lazyClasses.length > 0) {
        lazyLoading.scripts = lazyClasses.length;
        lazyLoading.techniques.push('js-lazy-loading');
      }

      lazyLoading.total = lazyLoading.images + lazyLoading.iframes + lazyLoading.scripts;

      if (lazyLoading.images > 0) lazyLoading.techniques.push('native-img-lazy');
      if (lazyLoading.iframes > 0) lazyLoading.techniques.push('native-iframe-lazy');

      // Calculate lazy loading score
      const totalImages = document.querySelectorAll('img').length;
      const totalIframes = document.querySelectorAll('iframe').length;
      const totalLazyable = totalImages + totalIframes;

      if (totalLazyable > 0) {
        lazyLoading.score = Math.min(100, (lazyLoading.total / totalLazyable) * 100);
      }

    } catch (error) {
      lazyLoading.error = error.message;
    }

    return lazyLoading;
  }

  /**
   * Analyze compression indicators
   * @param {Object} document - DOM document
   * @returns {Object} Compression analysis
   * @private
   */
  analyzeCompression(document) {
    const compression = {
      gzip: false,
      brotli: false,
      minified: 0,
      total: 0,
      techniques: [],
      score: 0
    };

    try {
      // Note: Actual compression detection would require server headers
      // Here we can only infer from file patterns and meta information

      // Check for minified files
      const allResources = document.querySelectorAll('script[src], link[href]');
      let minifiedCount = 0;

      allResources.forEach(resource => {
        const url = resource.getAttribute('src') || resource.getAttribute('href') || '';
        if (url.includes('.min.') || url.includes('-min.')) {
          minifiedCount++;
        }
      });

      compression.minified = minifiedCount;
      compression.total = allResources.length;

      if (compression.minified > 0) {
        compression.techniques.push('minification');
      }

      // Basic score based on minification ratio
      if (compression.total > 0) {
        compression.score = (compression.minified / compression.total) * 100;
      }

    } catch (error) {
      compression.error = error.message;
    }

    return compression;
  }

  /**
   * Analyze mobile-specific performance metrics
   * @param {Object} document - DOM document
   * @param {Object} pageData - Page performance data
   * @returns {Object} Mobile metrics analysis
   * @private
   */
  analyzeMobileSpecificMetrics(document, pageData) {
    const metrics = {
      firstContentfulPaint: null,
      largestContentfulPaint: null,
      cumulativeLayoutShift: null,
      firstInputDelay: null,
      timeToInteractive: null,
      speedIndex: null,
      mobileScore: 0,
      performance: 'unknown'
    };

    try {
      // Extract performance metrics from pageData if available
      if (pageData.performance) {
        const perf = pageData.performance;
        
        metrics.firstContentfulPaint = perf.firstContentfulPaint || null;
        metrics.largestContentfulPaint = perf.largestContentfulPaint || null;
        metrics.cumulativeLayoutShift = perf.cumulativeLayoutShift || null;
        metrics.firstInputDelay = perf.firstInputDelay || null;
        metrics.timeToInteractive = perf.timeToInteractive || null;
        metrics.speedIndex = perf.speedIndex || null;
      }

      // Calculate mobile performance score based on available metrics
      metrics.mobileScore = this.calculateMobileMetricsScore(metrics);
      metrics.performance = this.classifyMobilePerformance(metrics.mobileScore);

    } catch (error) {
      metrics.error = error.message;
    }

    return metrics;
  }

  /**
   * Analyze network optimization techniques
   * @param {Object} document - DOM document
   * @returns {Object} Network optimization analysis
   * @private
   */
  analyzeNetworkOptimization(document) {
    const network = {
      http2: false,
      cdn: false,
      caching: false,
      compression: false,
      connectionOptimization: 0,
      techniques: [],
      score: 0
    };

    try {
      // Check for CDN usage (basic heuristic)
      const externalResources = document.querySelectorAll('script[src], link[href], img[src]');
      let cdnCount = 0;

      externalResources.forEach(resource => {
        const url = resource.getAttribute('src') || resource.getAttribute('href') || '';
        if (/cdn|cloudfront|cloudflare|fastly|jsdelivr|unpkg/i.test(url)) {
          cdnCount++;
        }
      });

      if (cdnCount > 0) {
        network.cdn = true;
        network.techniques.push('cdn-usage');
      }

      // Check for connection optimization hints
      const connectionHints = document.querySelectorAll('link[rel="preconnect"], link[rel="dns-prefetch"]');
      network.connectionOptimization = connectionHints.length;

      if (network.connectionOptimization > 0) {
        network.techniques.push('connection-hints');
      }

      // Check for caching hints in meta tags
      const cacheControl = document.querySelector('meta[http-equiv="Cache-Control"]');
      if (cacheControl) {
        network.caching = true;
        network.techniques.push('cache-control');
      }

      // Calculate network optimization score
      let score = 0;
      if (network.cdn) score += 40;
      if (network.connectionOptimization > 0) score += 30;
      if (network.caching) score += 30;

      network.score = Math.min(100, score);

    } catch (error) {
      network.error = error.message;
    }

    return network;
  }

  /**
   * Analyze battery optimization considerations
   * @param {Object} document - DOM document
   * @returns {Object} Battery optimization analysis
   * @private
   */
  analyzeBatteryOptimization(document) {
    const battery = {
      animationsOptimized: false,
      backgroundProcesses: 0,
      autoplay: 0,
      inefficientOperations: 0,
      optimizations: [],
      score: 0
    };

    try {
      // Check for CSS animations (potential battery drain)
      const styleElements = document.querySelectorAll('style');
      const cssContent = Array.from(styleElements)
        .map(style => style.textContent || '')
        .join(' ');

      // Check for will-change property (animation optimization)
      if (/will-change/i.test(cssContent)) {
        battery.animationsOptimized = true;
        battery.optimizations.push('will-change-optimization');
      }

      // Check for autoplay media (battery drain)
      const autoplayMedia = document.querySelectorAll('video[autoplay], audio[autoplay]');
      battery.autoplay = autoplayMedia.length;

      // Check for background processes indicators
      const scripts = document.querySelectorAll('script');
      const scriptContent = Array.from(scripts)
        .map(script => script.textContent || '')
        .join(' ');

      if (/setInterval|setTimeout.*\d{3,}/i.test(scriptContent)) {
        battery.backgroundProcesses++;
      }

      if (/requestAnimationFrame/i.test(scriptContent)) {
        battery.optimizations.push('raf-optimization');
      }

      // Calculate battery optimization score
      let score = 100; // Start with perfect score
      
      if (battery.autoplay > 0) score -= 30;
      if (battery.backgroundProcesses > 2) score -= 20;
      if (!battery.animationsOptimized && /animation|transform/i.test(cssContent)) score -= 20;
      
      if (battery.optimizations.length > 0) score += 10;

      battery.score = Math.max(0, Math.min(100, score));

    } catch (error) {
      battery.error = error.message;
    }

    return battery;
  }

  /**
   * Analyze Core Web Vitals for mobile
   * @param {Object} pageData - Page performance data
   * @returns {Object} Core Web Vitals analysis
   * @private
   */
  analyzeCoreWebVitals(pageData) {
    const vitals = {
      lcp: { value: null, rating: 'unknown' },
      fid: { value: null, rating: 'unknown' },
      cls: { value: null, rating: 'unknown' },
      fcp: { value: null, rating: 'unknown' },
      overallRating: 'unknown',
      score: 0
    };

    try {
      if (pageData.performance) {
        const perf = pageData.performance;

        // Largest Contentful Paint
        if (perf.largestContentfulPaint) {
          vitals.lcp.value = perf.largestContentfulPaint;
          vitals.lcp.rating = this.rateLCP(perf.largestContentfulPaint);
        }

        // First Input Delay
        if (perf.firstInputDelay) {
          vitals.fid.value = perf.firstInputDelay;
          vitals.fid.rating = this.rateFID(perf.firstInputDelay);
        }

        // Cumulative Layout Shift
        if (perf.cumulativeLayoutShift) {
          vitals.cls.value = perf.cumulativeLayoutShift;
          vitals.cls.rating = this.rateCLS(perf.cumulativeLayoutShift);
        }

        // First Contentful Paint
        if (perf.firstContentfulPaint) {
          vitals.fcp.value = perf.firstContentfulPaint;
          vitals.fcp.rating = this.rateFCP(perf.firstContentfulPaint);
        }

        // Calculate overall rating and score
        vitals.overallRating = this.calculateOverallVitalsRating(vitals);
        vitals.score = this.calculateVitalsScore(vitals);
      }

    } catch (error) {
      vitals.error = error.message;
    }

    return vitals;
  }

  /**
   * Rate Largest Contentful Paint
   * @param {number} lcp - LCP value in milliseconds
   * @returns {string} Rating
   * @private
   */
  rateLCP(lcp) {
    if (lcp <= 2500) return 'good';
    if (lcp <= 4000) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Rate First Input Delay
   * @param {number} fid - FID value in milliseconds
   * @returns {string} Rating
   * @private
   */
  rateFID(fid) {
    if (fid <= 100) return 'good';
    if (fid <= 300) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Rate Cumulative Layout Shift
   * @param {number} cls - CLS value
   * @returns {string} Rating
   * @private
   */
  rateCLS(cls) {
    if (cls <= 0.1) return 'good';
    if (cls <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Rate First Contentful Paint
   * @param {number} fcp - FCP value in milliseconds
   * @returns {string} Rating
   * @private
   */
  rateFCP(fcp) {
    if (fcp <= 1800) return 'good';
    if (fcp <= 3000) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Calculate mobile metrics score
   * @param {Object} metrics - Mobile metrics data
   * @returns {number} Score (0-100)
   * @private
   */
  calculateMobileMetricsScore(metrics) {
    // This would be based on actual metric values
    // For now, return a default score
    return 50;
  }

  /**
   * Classify mobile performance
   * @param {number} score - Performance score
   * @returns {string} Performance classification
   * @private
   */
  classifyMobilePerformance(score) {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  }

  /**
   * Calculate overall Core Web Vitals rating
   * @param {Object} vitals - Core Web Vitals data
   * @returns {string} Overall rating
   * @private
   */
  calculateOverallVitalsRating(vitals) {
    const ratings = [vitals.lcp.rating, vitals.fid.rating, vitals.cls.rating]
      .filter(rating => rating !== 'unknown');

    if (ratings.length === 0) return 'unknown';

    const goodCount = ratings.filter(r => r === 'good').length;
    const poorCount = ratings.filter(r => r === 'poor').length;

    if (goodCount === ratings.length) return 'good';
    if (poorCount > 0) return 'poor';
    return 'needs-improvement';
  }

  /**
   * Calculate Core Web Vitals score
   * @param {Object} vitals - Core Web Vitals data
   * @returns {number} Score (0-100)
   * @private
   */
  calculateVitalsScore(vitals) {
    const ratingScores = { good: 100, 'needs-improvement': 60, poor: 30, unknown: 0 };
    
    const scores = [
      ratingScores[vitals.lcp.rating] || 0,
      ratingScores[vitals.fid.rating] || 0,
      ratingScores[vitals.cls.rating] || 0
    ];

    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;
  }

  /**
   * Calculate resource optimization score
   * @param {Object} resources - Resource data
   * @returns {number} Score (0-100)
   * @private
   */
  calculateResourceScore(resources) {
    let score = 0;
    let weights = 0;

    // Images (30%)
    if (resources.images && !resources.images.error) {
      score += (resources.images.score || 0) * 0.3;
      weights += 0.3;
    }

    // CSS (25%)
    if (resources.stylesheets && !resources.stylesheets.error) {
      score += (resources.stylesheets.score || 0) * 0.25;
      weights += 0.25;
    }

    // JavaScript (25%)
    if (resources.scripts && !resources.scripts.error) {
      score += (resources.scripts.score || 0) * 0.25;
      weights += 0.25;
    }

    // Fonts (20%)
    if (resources.fonts && !resources.fonts.error) {
      score += (resources.fonts.score || 0) * 0.2;
      weights += 0.2;
    }

    return weights > 0 ? Math.round(score / weights) : 0;
  }

  /**
   * Calculate overall mobile performance score
   * @param {Object} results - Analysis results
   * @returns {number} Overall score (0-100)
   * @private
   */
  calculateMobilePerformanceScore(results) {
    let score = 0;
    let weights = 0;

    // Resource optimization (35%)
    if (results.resourceOptimization && !results.resourceOptimization.error) {
      score += (results.resourceOptimization.score || 0) * 0.35;
      weights += 0.35;
    }

    // Core Web Vitals (25%)
    if (results.coreWebVitals && !results.coreWebVitals.error) {
      score += (results.coreWebVitals.score || 0) * 0.25;
      weights += 0.25;
    }

    // Network optimization (20%)
    if (results.networkOptimization && !results.networkOptimization.error) {
      score += (results.networkOptimization.score || 0) * 0.2;
      weights += 0.2;
    }

    // Battery optimization (20%)
    if (results.batteryOptimization && !results.batteryOptimization.error) {
      score += (results.batteryOptimization.score || 0) * 0.2;
      weights += 0.2;
    }

    return weights > 0 ? Math.round(score / weights) : 0;
  }

  /**
   * Calculate grade from score
   * @param {number} score - Numeric score (0-100)
   * @returns {string} Letter grade
   * @private
   */
  calculateGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Identify resource optimizations
   * @param {Object} resources - Resource data
   * @returns {Array} List of optimizations
   * @private
   */
  identifyResourceOptimizations(resources) {
    const optimizations = [];

    if (resources.images?.techniques) {
      optimizations.push(...resources.images.techniques);
    }
    if (resources.stylesheets?.techniques) {
      optimizations.push(...resources.stylesheets.techniques);
    }
    if (resources.scripts?.techniques) {
      optimizations.push(...resources.scripts.techniques);
    }
    if (resources.fonts?.techniques) {
      optimizations.push(...resources.fonts.techniques);
    }

    return [...new Set(optimizations)]; // Remove duplicates
  }

  /**
   * Identify mobile performance optimizations
   * @param {Object} results - Analysis results
   * @returns {Array} List of optimizations
   * @private
   */
  identifyOptimizations(results) {
    const optimizations = [];

    if (results.resourceOptimization?.optimizations) {
      optimizations.push(...results.resourceOptimization.optimizations);
    }

    if (results.networkOptimization?.techniques) {
      optimizations.push(...results.networkOptimization.techniques);
    }

    if (results.batteryOptimization?.optimizations) {
      optimizations.push(...results.batteryOptimization.optimizations);
    }

    return [...new Set(optimizations)]; // Remove duplicates
  }

  /**
   * Identify mobile performance issues
   * @param {Object} results - Analysis results
   * @returns {Array} List of issues
   * @private
   */
  identifyPerformanceIssues(results) {
    const issues = [];

    if (results.resourceOptimization?.score < 60) {
      issues.push({
        type: 'resource-optimization',
        severity: 'medium',
        message: 'Resources could be better optimized for mobile performance'
      });
    }

    if (results.coreWebVitals?.overallRating === 'poor') {
      issues.push({
        type: 'core-web-vitals',
        severity: 'high',
        message: 'Core Web Vitals need improvement for better mobile user experience'
      });
    }

    if (results.batteryOptimization?.autoplay > 0) {
      issues.push({
        type: 'autoplay-media',
        severity: 'medium',
        message: 'Autoplay media can drain mobile device battery'
      });
    }

    return issues;
  }
}

export default MobilePerformanceDetector;
