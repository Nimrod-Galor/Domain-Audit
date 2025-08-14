/**
 * ============================================================================
 * TECHNICAL SEO DETECTOR - GPT-5 STYLE MODULAR COMPONENT
 * ============================================================================
 * 
 * Comprehensive technical SEO analysis detector
 * Part of the Combined Approach modernization pattern
 * 
 * Features:
 * - Site speed and performance analysis
 * - Mobile-friendliness assessment
 * - URL structure optimization
 * - Internal linking analysis
 * - Technical SEO compliance
 * 
 * @version 1.0.0
 * @author Development Team
 */

export class TechnicalSEODetector {
  constructor() {
    this.detectorName = 'TechnicalSEODetector';
    this.version = '1.0.0';
  }

  /**
   * Detect and analyze technical SEO factors
   * @param {Document} document - The HTML document
   * @param {string} url - Page URL
   * @returns {Object} Technical SEO analysis results
   */
  detectTechnicalSEO(document, url) {
    try {
      const analysis = {
        performance: this._analyzePerformance(document),
        mobile: this._analyzeMobileFriendliness(document),
        urlStructure: this._analyzeUrlStructure(url),
        internalLinks: this._analyzeInternalLinks(document, url),
        technicalCompliance: this._analyzeTechnicalCompliance(document),
        indexability: this._analyzeIndexability(document)
      };
      
      return {
        success: true,
        analysis,
        recommendations: this._generateTechnicalRecommendations(analysis),
        score: this._calculateTechnicalScore(analysis)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        analysis: {},
        recommendations: [],
        score: 0
      };
    }
  }

  /**
   * Analyze performance factors
   * @private
   */
  _analyzePerformance(document) {
    return {
      resourceOptimization: this._checkResourceOptimization(document),
      criticalResources: this._checkCriticalResources(document),
      caching: this._checkCachingHeaders(document),
      compression: this._checkCompression(document),
      score: this._calculatePerformanceScore(document)
    };
  }

  /**
   * Check resource optimization
   * @private
   */
  _checkResourceOptimization(document) {
    const images = document.querySelectorAll('img');
    const scripts = document.querySelectorAll('script[src]');
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    
    const optimizedImages = Array.from(images).filter(img => {
      const src = img.src || '';
      return src.includes('.webp') || src.includes('compress') || img.hasAttribute('loading');
    });
    
    const minifiedAssets = Array.from(scripts).filter(script => {
      const src = script.src || '';
      return src.includes('.min.') || src.includes('minified');
    });
    
    return {
      totalImages: images.length,
      optimizedImages: optimizedImages.length,
      totalScripts: scripts.length,
      minifiedScripts: minifiedAssets.length,
      totalStylesheets: stylesheets.length,
      imageOptimization: images.length > 0 ? (optimizedImages.length / images.length) * 100 : 100,
      scriptOptimization: scripts.length > 0 ? (minifiedAssets.length / scripts.length) * 100 : 100
    };
  }

  /**
   * Check critical resources
   * @private
   */
  _checkCriticalResources(document) {
    const criticalCSS = document.querySelectorAll('style');
    const inlineScripts = document.querySelectorAll('script:not([src])');
    const deferredScripts = document.querySelectorAll('script[defer]');
    const asyncScripts = document.querySelectorAll('script[async]');
    
    return {
      hasCriticalCSS: criticalCSS.length > 0,
      inlineScripts: inlineScripts.length,
      deferredScripts: deferredScripts.length,
      asyncScripts: asyncScripts.length,
      loadingOptimization: this._calculateLoadingOptimization(document)
    };
  }

  /**
   * Calculate loading optimization score
   * @private
   */
  _calculateLoadingOptimization(document) {
    let score = 0;
    
    // Critical CSS present
    if (document.querySelectorAll('style').length > 0) score += 20;
    
    // Deferred/async scripts
    const scripts = document.querySelectorAll('script[src]');
    const optimizedScripts = document.querySelectorAll('script[defer], script[async]');
    if (scripts.length > 0 && optimizedScripts.length / scripts.length >= 0.5) score += 30;
    
    // Lazy loading images
    const images = document.querySelectorAll('img');
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if (images.length > 0 && lazyImages.length / images.length >= 0.3) score += 25;
    
    // Preload critical resources
    if (document.querySelectorAll('link[rel="preload"]').length > 0) score += 25;
    
    return score;
  }

  /**
   * Check caching headers (meta simulation)
   * @private
   */
  _checkCachingHeaders(document) {
    // Check for cache-related meta tags or indicators
    const cacheControl = document.querySelector('meta[http-equiv="Cache-Control"]');
    const expires = document.querySelector('meta[http-equiv="Expires"]');
    const etag = document.querySelector('meta[http-equiv="ETag"]');
    
    return {
      hasCacheControl: !!cacheControl,
      hasExpires: !!expires,
      hasETag: !!etag,
      cachingScore: (!!cacheControl + !!expires + !!etag) * 33.33
    };
  }

  /**
   * Check compression indicators
   * @private
   */
  _checkCompression(document) {
    // Check for compression-related meta tags or content encoding
    const contentEncoding = document.querySelector('meta[http-equiv="Content-Encoding"]');
    const hasMinified = document.querySelectorAll('script[src*=".min."], link[href*=".min."]').length > 0;
    
    return {
      hasContentEncoding: !!contentEncoding,
      hasMinifiedAssets: hasMinified,
      compressionScore: (!!contentEncoding + hasMinified) * 50
    };
  }

  /**
   * Calculate performance score
   * @private
   */
  _calculatePerformanceScore(document) {
    const resourceOpt = this._checkResourceOptimization(document);
    const criticalRes = this._checkCriticalResources(document);
    const caching = this._checkCachingHeaders(document);
    const compression = this._checkCompression(document);
    
    return Math.round(
      (resourceOpt.imageOptimization * 0.3 +
       resourceOpt.scriptOptimization * 0.2 +
       criticalRes.loadingOptimization * 0.3 +
       caching.cachingScore * 0.1 +
       compression.compressionScore * 0.1)
    );
  }

  /**
   * Analyze mobile friendliness
   * @private
   */
  _analyzeMobileFriendliness(document) {
    const viewport = this._checkViewport(document);
    const responsive = this._checkResponsiveDesign(document);
    const mobileOptimization = this._checkMobileOptimization(document);
    
    return {
      viewport,
      responsive,
      mobileOptimization,
      score: this._calculateMobileScore(viewport, responsive, mobileOptimization)
    };
  }

  /**
   * Check viewport configuration
   * @private
   */
  _checkViewport(document) {
    const viewport = document.querySelector('meta[name="viewport"]');
    const content = viewport ? viewport.getAttribute('content') : '';
    
    return {
      present: !!viewport,
      content,
      hasDeviceWidth: content.includes('width=device-width'),
      hasInitialScale: content.includes('initial-scale=1'),
      hasUserScalable: content.includes('user-scalable'),
      optimal: content.includes('width=device-width') && content.includes('initial-scale=1')
    };
  }

  /**
   * Check responsive design indicators
   * @private
   */
  _checkResponsiveDesign(document) {
    const mediaQueries = this._checkMediaQueries(document);
    const flexibleImages = this._checkFlexibleImages(document);
    const responsiveElements = this._checkResponsiveElements(document);
    
    return {
      mediaQueries,
      flexibleImages,
      responsiveElements,
      score: (mediaQueries + flexibleImages + responsiveElements) / 3
    };
  }

  /**
   * Check for media queries in stylesheets
   * @private
   */
  _checkMediaQueries(document) {
    const stylesheets = document.querySelectorAll('style, link[rel="stylesheet"]');
    let hasMediaQueries = false;
    
    Array.from(stylesheets).forEach(sheet => {
      if (sheet.textContent && sheet.textContent.includes('@media')) {
        hasMediaQueries = true;
      }
      if (sheet.href && sheet.media && sheet.media !== 'all') {
        hasMediaQueries = true;
      }
    });
    
    return hasMediaQueries ? 100 : 0;
  }

  /**
   * Check flexible images
   * @private
   */
  _checkFlexibleImages(document) {
    const images = document.querySelectorAll('img');
    let flexibleImages = 0;
    
    Array.from(images).forEach(img => {
      const style = img.style.cssText || '';
      const className = img.className || '';
      
      if (style.includes('max-width') || 
          style.includes('width: 100%') || 
          className.includes('responsive') ||
          className.includes('img-fluid')) {
        flexibleImages++;
      }
    });
    
    return images.length > 0 ? (flexibleImages / images.length) * 100 : 100;
  }

  /**
   * Check responsive elements
   * @private
   */
  _checkResponsiveElements(document) {
    const responsiveClasses = document.querySelectorAll('[class*="col-"], [class*="grid"], [class*="flex"], [class*="responsive"]');
    const containers = document.querySelectorAll('.container, .wrapper, .content');
    
    return responsiveClasses.length > 0 || containers.length > 0 ? 80 : 20;
  }

  /**
   * Check mobile optimization
   * @private
   */
  _checkMobileOptimization(document) {
    const touchFriendly = this._checkTouchFriendly(document);
    const fastLoading = this._checkFastLoading(document);
    const mobileUX = this._checkMobileUX(document);
    
    return {
      touchFriendly,
      fastLoading,
      mobileUX,
      score: (touchFriendly + fastLoading + mobileUX) / 3
    };
  }

  /**
   * Check touch-friendly elements
   * @private
   */
  _checkTouchFriendly(document) {
    const buttons = document.querySelectorAll('button, [role="button"]');
    const links = document.querySelectorAll('a');
    const totalInteractive = buttons.length + links.length;
    
    // Assume touch-friendly if reasonable number of interactive elements
    return totalInteractive > 0 ? 75 : 50;
  }

  /**
   * Check fast loading indicators
   * @private
   */
  _checkFastLoading(document) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const optimizedImages = document.querySelectorAll('img[src*=".webp"]');
    const minifiedAssets = document.querySelectorAll('script[src*=".min."], link[href*=".min."]');
    
    let score = 0;
    if (lazyImages.length > 0) score += 30;
    if (optimizedImages.length > 0) score += 30;
    if (minifiedAssets.length > 0) score += 40;
    
    return score;
  }

  /**
   * Check mobile UX indicators
   * @private
   */
  _checkMobileUX(document) {
    const navigation = document.querySelector('nav, [role="navigation"]');
    const search = document.querySelector('input[type="search"], [role="searchbox"]');
    const breadcrumbs = document.querySelector('.breadcrumb, nav[aria-label*="breadcrumb"]');
    
    let score = 0;
    if (navigation) score += 40;
    if (search) score += 30;
    if (breadcrumbs) score += 30;
    
    return score;
  }

  /**
   * Calculate mobile score
   * @private
   */
  _calculateMobileScore(viewport, responsive, mobileOptimization) {
    let score = 0;
    
    // Viewport (30%)
    if (viewport.optimal) score += 30;
    else if (viewport.present) score += 15;
    
    // Responsive design (40%)
    score += responsive.score * 0.4;
    
    // Mobile optimization (30%)
    score += mobileOptimization.score * 0.3;
    
    return Math.round(score);
  }

  /**
   * Analyze URL structure
   * @private
   */
  _analyzeUrlStructure(url) {
    try {
      const urlObj = new URL(url);
      
      return {
        protocol: urlObj.protocol,
        isHttps: urlObj.protocol === 'https:',
        length: url.length,
        pathDepth: this._calculatePathDepth(urlObj.pathname),
        hasParameters: urlObj.search.length > 0,
        hasFragment: urlObj.hash.length > 0,
        isClean: this._isCleanUrl(urlObj),
        isSeoFriendly: this._isSeoFriendlyUrl(urlObj),
        score: this._calculateUrlScore(urlObj, url)
      };
    } catch (error) {
      return {
        protocol: 'unknown',
        isHttps: false,
        length: url.length,
        pathDepth: 0,
        hasParameters: false,
        hasFragment: false,
        isClean: false,
        isSeoFriendly: false,
        score: 0
      };
    }
  }

  /**
   * Calculate path depth
   * @private
   */
  _calculatePathDepth(pathname) {
    return pathname.split('/').filter(segment => segment.length > 0).length;
  }

  /**
   * Check if URL is clean
   * @private
   */
  _isCleanUrl(urlObj) {
    const pathname = urlObj.pathname;
    
    // Check for common non-clean patterns
    const hasFileExtension = /\.(php|asp|jsp|html|htm)$/i.test(pathname);
    const hasSessionId = urlObj.search.includes('sessionid') || urlObj.search.includes('PHPSESSID');
    const hasUglyParams = urlObj.search.includes('id=') || urlObj.search.includes('page=');
    
    return !hasFileExtension && !hasSessionId && !hasUglyParams;
  }

  /**
   * Check if URL is SEO friendly
   * @private
   */
  _isSeoFriendlyUrl(urlObj) {
    const pathname = urlObj.pathname;
    
    // Check for SEO-friendly patterns
    const hasDescriptiveWords = /[a-zA-Z]/.test(pathname);
    const hasHyphens = pathname.includes('-');
    const noNumbers = !/^\d+$/.test(pathname.replace(/[\/\-]/g, ''));
    const reasonableLength = pathname.length <= 100;
    
    return hasDescriptiveWords && reasonableLength && !pathname.includes('_');
  }

  /**
   * Calculate URL score
   * @private
   */
  _calculateUrlScore(urlObj, url) {
    let score = 0;
    
    // HTTPS (25 points)
    if (urlObj.protocol === 'https:') score += 25;
    
    // Clean URL (20 points)
    if (this._isCleanUrl(urlObj)) score += 20;
    
    // SEO friendly (20 points)
    if (this._isSeoFriendlyUrl(urlObj)) score += 20;
    
    // Reasonable length (15 points)
    if (url.length <= 100) score += 15;
    else if (url.length <= 150) score += 10;
    
    // Reasonable depth (10 points)
    const depth = this._calculatePathDepth(urlObj.pathname);
    if (depth <= 3) score += 10;
    else if (depth <= 5) score += 5;
    
    // No unnecessary parameters (10 points)
    if (!urlObj.search || urlObj.search.length <= 50) score += 10;
    
    return score;
  }

  /**
   * Analyze internal links
   * @private
   */
  _analyzeInternalLinks(document, url) {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      
      const allLinks = document.querySelectorAll('a[href]');
      const internalLinks = [];
      const externalLinks = [];
      
      Array.from(allLinks).forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          try {
            if (href.startsWith('/') || href.startsWith('#') || href.includes(domain)) {
              internalLinks.push(link);
            } else if (href.startsWith('http')) {
              externalLinks.push(link);
            }
          } catch (e) {
            // Invalid URL, treat as internal
            internalLinks.push(link);
          }
        }
      });
      
      return {
        total: allLinks.length,
        internal: internalLinks.length,
        external: externalLinks.length,
        internalRatio: allLinks.length > 0 ? (internalLinks.length / allLinks.length) * 100 : 0,
        linkDensity: this._calculateLinkDensity(document, allLinks),
        anchorTextAnalysis: this._analyzeAnchorText(internalLinks),
        score: this._calculateInternalLinksScore(internalLinks, allLinks, document)
      };
    } catch (error) {
      return {
        total: 0,
        internal: 0,
        external: 0,
        internalRatio: 0,
        linkDensity: 0,
        anchorTextAnalysis: {},
        score: 0
      };
    }
  }

  /**
   * Calculate link density
   * @private
   */
  _calculateLinkDensity(document, links) {
    const textContent = document.body.textContent || '';
    const linkText = Array.from(links).map(link => link.textContent || '').join(' ');
    
    return textContent.length > 0 ? (linkText.length / textContent.length) * 100 : 0;
  }

  /**
   * Analyze anchor text
   * @private
   */
  _analyzeAnchorText(links) {
    const anchorTexts = Array.from(links).map(link => link.textContent?.trim() || '');
    const uniqueAnchors = [...new Set(anchorTexts)].filter(text => text.length > 0);
    
    const descriptiveAnchors = anchorTexts.filter(text => 
      text.length > 5 && 
      !['click here', 'read more', 'here', 'more'].includes(text.toLowerCase())
    );
    
    return {
      total: anchorTexts.length,
      unique: uniqueAnchors.length,
      descriptive: descriptiveAnchors.length,
      descriptiveRatio: anchorTexts.length > 0 ? (descriptiveAnchors.length / anchorTexts.length) * 100 : 0
    };
  }

  /**
   * Calculate internal links score
   * @private
   */
  _calculateInternalLinksScore(internalLinks, allLinks, document) {
    let score = 0;
    
    // Has internal links (20 points)
    if (internalLinks.length > 0) score += 20;
    
    // Good internal link ratio (20 points)
    const internalRatio = allLinks.length > 0 ? (internalLinks.length / allLinks.length) * 100 : 0;
    if (internalRatio >= 60) score += 20;
    else if (internalRatio >= 40) score += 15;
    else if (internalRatio >= 20) score += 10;
    
    // Reasonable link density (20 points)
    const linkDensity = this._calculateLinkDensity(document, allLinks);
    if (linkDensity >= 1 && linkDensity <= 5) score += 20;
    else if (linkDensity <= 10) score += 10;
    
    // Descriptive anchor text (25 points)
    const anchorAnalysis = this._analyzeAnchorText(internalLinks);
    if (anchorAnalysis.descriptiveRatio >= 80) score += 25;
    else if (anchorAnalysis.descriptiveRatio >= 60) score += 20;
    else if (anchorAnalysis.descriptiveRatio >= 40) score += 15;
    else if (anchorAnalysis.descriptiveRatio >= 20) score += 10;
    
    // Variety in anchor text (15 points)
    if (anchorAnalysis.total > 0) {
      const uniqueRatio = (anchorAnalysis.unique / anchorAnalysis.total) * 100;
      if (uniqueRatio >= 80) score += 15;
      else if (uniqueRatio >= 60) score += 10;
      else if (uniqueRatio >= 40) score += 5;
    }
    
    return score;
  }

  /**
   * Analyze technical compliance
   * @private
   */
  _analyzeTechnicalCompliance(document) {
    return {
      htmlValidation: this._checkHtmlValidation(document),
      accessibility: this._checkBasicAccessibility(document),
      seo: this._checkSeoCompliance(document),
      performance: this._checkPerformanceCompliance(document),
      score: this._calculateComplianceScore(document)
    };
  }

  /**
   * Check HTML validation basics
   * @private
   */
  _checkHtmlValidation(document) {
    const issues = [];
    
    // Check DOCTYPE
    if (!document.doctype) issues.push('Missing DOCTYPE');
    
    // Check lang attribute
    const html = document.documentElement;
    if (!html.getAttribute('lang')) issues.push('Missing lang attribute');
    
    // Check title
    if (!document.title || document.title.trim().length === 0) issues.push('Missing or empty title');
    
    // Check meta charset
    const charset = document.querySelector('meta[charset], meta[http-equiv="Content-Type"]');
    if (!charset) issues.push('Missing charset declaration');
    
    return {
      issues,
      valid: issues.length === 0,
      score: Math.max(0, 100 - (issues.length * 25))
    };
  }

  /**
   * Check basic accessibility
   * @private
   */
  _checkBasicAccessibility(document) {
    const issues = [];
    
    // Check alt attributes
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    if (imagesWithoutAlt.length > 0) issues.push(`${imagesWithoutAlt.length} images missing alt attributes`);
    
    // Check heading structure
    const h1s = document.querySelectorAll('h1');
    if (h1s.length === 0) issues.push('Missing H1 heading');
    if (h1s.length > 1) issues.push('Multiple H1 headings');
    
    return {
      issues,
      accessible: issues.length === 0,
      score: Math.max(0, 100 - (issues.length * 30))
    };
  }

  /**
   * Check SEO compliance
   * @private
   */
  _checkSeoCompliance(document) {
    const issues = [];
    
    // Check meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc || !metaDesc.getAttribute('content')) issues.push('Missing meta description');
    
    // Check canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) issues.push('Missing canonical URL');
    
    // Check robots meta
    const robots = document.querySelector('meta[name="robots"]');
    if (robots && robots.getAttribute('content')?.includes('noindex')) {
      issues.push('Page set to noindex');
    }
    
    return {
      issues,
      compliant: issues.length === 0,
      score: Math.max(0, 100 - (issues.length * 33))
    };
  }

  /**
   * Check performance compliance
   * @private
   */
  _checkPerformanceCompliance(document) {
    const issues = [];
    
    // Check viewport
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) issues.push('Missing viewport meta tag');
    
    // Check for render-blocking resources
    const blockingCSS = document.querySelectorAll('link[rel="stylesheet"]:not([media]):not([disabled])');
    if (blockingCSS.length > 3) issues.push('Too many render-blocking CSS files');
    
    // Check for unoptimized images
    const largeImages = document.querySelectorAll('img:not([loading]):not([src*=".webp"])');
    if (largeImages.length > 5) issues.push('Many unoptimized images');
    
    return {
      issues,
      optimized: issues.length === 0,
      score: Math.max(0, 100 - (issues.length * 33))
    };
  }

  /**
   * Calculate compliance score
   * @private
   */
  _calculateComplianceScore(document) {
    const html = this._checkHtmlValidation(document);
    const accessibility = this._checkBasicAccessibility(document);
    const seo = this._checkSeoCompliance(document);
    const performance = this._checkPerformanceCompliance(document);
    
    return Math.round((html.score + accessibility.score + seo.score + performance.score) / 4);
  }

  /**
   * Analyze indexability
   * @private
   */
  _analyzeIndexability(document) {
    const robots = document.querySelector('meta[name="robots"]');
    const robotsContent = robots?.getAttribute('content')?.toLowerCase() || '';
    
    const canonical = document.querySelector('link[rel="canonical"]');
    const noIndex = robotsContent.includes('noindex');
    const noFollow = robotsContent.includes('nofollow');
    
    return {
      indexable: !noIndex,
      followable: !noFollow,
      hasCanonical: !!canonical,
      robotsDirectives: robotsContent ? robotsContent.split(',').map(d => d.trim()) : [],
      score: this._calculateIndexabilityScore(noIndex, noFollow, !!canonical)
    };
  }

  /**
   * Calculate indexability score
   * @private
   */
  _calculateIndexabilityScore(noIndex, noFollow, hasCanonical) {
    let score = 100;
    
    if (noIndex) score -= 50;  // Major penalty for noindex
    if (noFollow) score -= 20;  // Penalty for nofollow
    if (!hasCanonical) score -= 15;  // Penalty for missing canonical
    
    return Math.max(0, score);
  }

  /**
   * Generate technical SEO recommendations
   * @private
   */
  _generateTechnicalRecommendations(analysis) {
    const recommendations = [];
    
    // Performance recommendations
    if (analysis.performance.score < 70) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Optimize page performance - minimize resources and enable caching'
      });
    }
    
    // Mobile recommendations
    if (analysis.mobile.score < 80) {
      recommendations.push({
        type: 'mobile',
        priority: 'high',
        message: 'Improve mobile friendliness - add responsive design and viewport meta tag'
      });
    }
    
    // URL structure recommendations
    if (analysis.urlStructure.score < 70) {
      recommendations.push({
        type: 'url',
        priority: 'medium',
        message: 'Optimize URL structure - use HTTPS and SEO-friendly URLs'
      });
    }
    
    // Internal linking recommendations
    if (analysis.internalLinks.score < 60) {
      recommendations.push({
        type: 'internal-links',
        priority: 'medium',
        message: 'Improve internal linking structure and anchor text quality'
      });
    }
    
    // Technical compliance recommendations
    if (analysis.technicalCompliance.score < 80) {
      recommendations.push({
        type: 'compliance',
        priority: 'high',
        message: 'Fix technical compliance issues - HTML validation and accessibility'
      });
    }
    
    // Indexability recommendations
    if (analysis.indexability.score < 90) {
      recommendations.push({
        type: 'indexability',
        priority: 'critical',
        message: 'Review indexability settings - ensure content is discoverable'
      });
    }
    
    return recommendations;
  }

  /**
   * Calculate overall technical SEO score
   * @private
   */
  _calculateTechnicalScore(analysis) {
    const weights = {
      performance: 0.25,
      mobile: 0.2,
      urlStructure: 0.15,
      internalLinks: 0.15,
      technicalCompliance: 0.15,
      indexability: 0.1
    };
    
    const score = (
      analysis.performance.score * weights.performance +
      analysis.mobile.score * weights.mobile +
      analysis.urlStructure.score * weights.urlStructure +
      analysis.internalLinks.score * weights.internalLinks +
      analysis.technicalCompliance.score * weights.technicalCompliance +
      analysis.indexability.score * weights.indexability
    );
    
    return Math.round(Math.max(0, Math.min(100, score)));
  }
}
