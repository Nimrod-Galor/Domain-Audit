/**
 * Performance Resource Detector - Combined Approach Component
 * 
 * GPT-5 Style: Focused detection component for performance resource analysis
 * Detects and catalogs all page resources for performance analysis
 * 
 * @version 1.0.0
 * @author Performance Team
 */

export class ResourceDetector {
  constructor(options = {}) {
    this.options = {
      enableDetailedAnalysis: options.enableDetailedAnalysis !== false,
      includeInlineResources: options.includeInlineResources !== false,
      trackThirdParty: options.trackThirdParty !== false,
      ...options
    };
  }

  /**
   * Detect all page resources with detailed metadata
   * @param {Object} context - Analysis context
   * @returns {Object} Detected resources organized by type
   */
  async detectResources(context) {
    const { document, url } = context;
    
    const resources = {
      scripts: this.detectScripts(document, url),
      stylesheets: this.detectStylesheets(document, url),
      images: this.detectImages(document, url),
      fonts: this.detectFonts(document, url),
      videos: this.detectVideos(document, url),
      audios: this.detectAudios(document, url),
      iframes: this.detectIframes(document, url),
      prefetch: this.detectPrefetchResources(document, url),
      inline: this.options.includeInlineResources ? 
        this.detectInlineResources(document) : null
    };

    return {
      resources,
      summary: this.summarizeResources(resources),
      performance: this.analyzeResourcePerformance(resources),
      thirdParty: this.options.trackThirdParty ? 
        this.identifyThirdPartyResources(resources, url) : null
    };
  }

  /**
   * Detect JavaScript resources
   */
  detectScripts(document, baseUrl) {
    const scripts = Array.from(document.querySelectorAll('script')).map(script => ({
      type: 'script',
      src: script.src || null,
      inline: !script.src,
      size: script.innerHTML ? script.innerHTML.length : null,
      async: script.hasAttribute('async'),
      defer: script.hasAttribute('defer'),
      module: script.type === 'module',
      position: this.getElementPosition(script),
      crossorigin: script.crossOrigin || null,
      integrity: script.integrity || null,
      isThirdParty: script.src ? this.isThirdPartyResource(script.src, baseUrl) : false
    }));

    return scripts;
  }

  /**
   * Detect CSS stylesheets
   */
  detectStylesheets(document, baseUrl) {
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map(element => ({
      type: 'stylesheet',
      href: element.href || null,
      inline: element.tagName === 'STYLE',
      size: element.innerHTML ? element.innerHTML.length : null,
      media: element.media || 'all',
      position: this.getElementPosition(element),
      crossorigin: element.crossOrigin || null,
      integrity: element.integrity || null,
      isThirdParty: element.href ? this.isThirdPartyResource(element.href, baseUrl) : false,
      critical: this.isCriticalCSS(element)
    }));

    return stylesheets;
  }

  /**
   * Detect image resources
   */
  detectImages(document, baseUrl) {
    const images = Array.from(document.querySelectorAll('img, picture source, [style*="background-image"]')).map(element => {
      const src = element.src || element.srcset || this.extractBackgroundImage(element);
      
      return {
        type: 'image',
        src: src,
        alt: element.alt || null,
        loading: element.loading || null,
        lazy: element.loading === 'lazy' || element.hasAttribute('data-src'),
        responsive: this.isResponsiveImage(element),
        format: this.getImageFormat(src),
        position: this.getElementPosition(element),
        isThirdParty: src ? this.isThirdPartyResource(src, baseUrl) : false,
        hasWebpFallback: this.hasWebpFallback(element)
      };
    });

    return images.filter(img => img.src);
  }

  /**
   * Detect font resources
   */
  detectFonts(document, baseUrl) {
    const fonts = [];
    
    // Link preloads
    document.querySelectorAll('link[rel="preload"][as="font"]').forEach(link => {
      fonts.push({
        type: 'font',
        href: link.href,
        preload: true,
        crossorigin: link.crossOrigin || null,
        format: this.getFontFormat(link.href),
        isThirdParty: this.isThirdPartyResource(link.href, baseUrl)
      });
    });

    // CSS @font-face declarations (would need CSS parsing in real implementation)
    const stylesheets = document.querySelectorAll('style, link[rel="stylesheet"]');
    stylesheets.forEach(stylesheet => {
      if (stylesheet.innerHTML && stylesheet.innerHTML.includes('@font-face')) {
        // Simplified font detection - in real implementation would parse CSS
        const fontUrls = this.extractFontUrlsFromCSS(stylesheet.innerHTML);
        fontUrls.forEach(url => {
          fonts.push({
            type: 'font',
            href: url,
            preload: false,
            format: this.getFontFormat(url),
            isThirdParty: this.isThirdPartyResource(url, baseUrl)
          });
        });
      }
    });

    return fonts;
  }

  /**
   * Detect video resources
   */
  detectVideos(document, baseUrl) {
    const videos = Array.from(document.querySelectorAll('video, source[type^="video"]')).map(element => ({
      type: 'video',
      src: element.src || element.querySelector('source')?.src,
      autoplay: element.hasAttribute('autoplay'),
      preload: element.preload || 'metadata',
      controls: element.hasAttribute('controls'),
      loop: element.hasAttribute('loop'),
      muted: element.hasAttribute('muted'),
      poster: element.poster || null,
      isThirdParty: element.src ? this.isThirdPartyResource(element.src, baseUrl) : false
    }));

    return videos.filter(video => video.src);
  }

  /**
   * Detect audio resources
   */
  detectAudios(document, baseUrl) {
    const audios = Array.from(document.querySelectorAll('audio, source[type^="audio"]')).map(element => ({
      type: 'audio',
      src: element.src || element.querySelector('source')?.src,
      autoplay: element.hasAttribute('autoplay'),
      preload: element.preload || 'metadata',
      controls: element.hasAttribute('controls'),
      loop: element.hasAttribute('loop'),
      isThirdParty: element.src ? this.isThirdPartyResource(element.src, baseUrl) : false
    }));

    return audios.filter(audio => audio.src);
  }

  /**
   * Detect iframe resources
   */
  detectIframes(document, baseUrl) {
    const iframes = Array.from(document.querySelectorAll('iframe')).map(iframe => ({
      type: 'iframe',
      src: iframe.src,
      loading: iframe.loading || null,
      sandbox: iframe.sandbox?.toString() || null,
      isThirdParty: iframe.src ? this.isThirdPartyResource(iframe.src, baseUrl) : false,
      purpose: this.identifyIframePurpose(iframe)
    }));

    return iframes.filter(iframe => iframe.src);
  }

  /**
   * Detect prefetch/preload resources
   */
  detectPrefetchResources(document, baseUrl) {
    const prefetchResources = Array.from(document.querySelectorAll('link[rel^="pre"]')).map(link => ({
      type: 'prefetch',
      href: link.href,
      rel: link.rel,
      as: link.as || null,
      crossorigin: link.crossOrigin || null,
      isThirdParty: this.isThirdPartyResource(link.href, baseUrl)
    }));

    return prefetchResources;
  }

  /**
   * Detect inline resources
   */
  detectInlineResources(document) {
    return {
      scripts: Array.from(document.querySelectorAll('script:not([src])')).length,
      styles: Array.from(document.querySelectorAll('style')).length,
      scriptSize: this.calculateInlineScriptSize(document),
      styleSize: this.calculateInlineStyleSize(document)
    };
  }

  // Helper methods

  getElementPosition(element) {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || !element.getBoundingClientRect) {
      return 'unknown';
    }

    try {
      const rect = element.getBoundingClientRect();
      return rect.top < window.innerHeight ? 'above-fold' : 'below-fold';
    } catch (error) {
      return 'unknown';
    }
  }

  isThirdPartyResource(url, baseUrl) {
    try {
      const resourceDomain = new URL(url, baseUrl).hostname;
      const baseDomain = new URL(baseUrl).hostname;
      return resourceDomain !== baseDomain;
    } catch {
      return false;
    }
  }

  isCriticalCSS(element) {
    return element.media === 'all' || element.media === 'screen' || !element.media;
  }

  extractBackgroundImage(element) {
    const style = element.style.backgroundImage || '';
    const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
    return match ? match[1] : null;
  }

  isResponsiveImage(element) {
    return !!(element.srcset || element.sizes || 
             element.closest('picture') || 
             element.querySelector('source'));
  }

  getImageFormat(src) {
    if (!src) return null;
    const extension = src.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'].includes(extension) ? 
           extension : 'unknown';
  }

  hasWebpFallback(element) {
    const picture = element.closest('picture');
    if (picture) {
      return Array.from(picture.querySelectorAll('source')).some(source => 
        source.type === 'image/webp'
      );
    }
    return false;
  }

  getFontFormat(url) {
    const extension = url.split('.').pop()?.toLowerCase();
    return ['woff2', 'woff', 'ttf', 'otf', 'eot'].includes(extension) ? 
           extension : 'unknown';
  }

  extractFontUrlsFromCSS(css) {
    const urls = [];
    const matches = css.match(/url\(['"]?([^'"]+\.(woff2?|ttf|otf|eot))['"]?\)/gi);
    if (matches) {
      matches.forEach(match => {
        const url = match.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1];
        if (url) urls.push(url);
      });
    }
    return urls;
  }

  identifyIframePurpose(iframe) {
    const src = iframe.src.toLowerCase();
    if (src.includes('youtube.com') || src.includes('vimeo.com')) return 'video';
    if (src.includes('maps.google.com') || src.includes('openstreetmap.org')) return 'map';
    if (src.includes('twitter.com') || src.includes('facebook.com')) return 'social';
    if (src.includes('ads') || src.includes('doubleclick')) return 'advertising';
    return 'unknown';
  }

  calculateInlineScriptSize(document) {
    return Array.from(document.querySelectorAll('script:not([src])'))
      .reduce((total, script) => total + (script.innerHTML?.length || 0), 0);
  }

  calculateInlineStyleSize(document) {
    return Array.from(document.querySelectorAll('style'))
      .reduce((total, style) => total + (style.innerHTML?.length || 0), 0);
  }

  summarizeResources(resources) {
    const summary = {};
    
    Object.keys(resources).forEach(type => {
      if (Array.isArray(resources[type])) {
        summary[type] = {
          count: resources[type].length,
          thirdParty: resources[type].filter(r => r.isThirdParty).length,
          inline: resources[type].filter(r => r.inline).length
        };
      }
    });

    return summary;
  }

  analyzeResourcePerformance(resources) {
    return {
      criticalResources: this.identifyCriticalResources(resources),
      blockingResources: this.identifyBlockingResources(resources),
      optimizationOpportunities: this.identifyOptimizationOpportunities(resources)
    };
  }

  identifyCriticalResources(resources) {
    const critical = [];
    
    // CSS in head
    if (resources.stylesheets) {
      critical.push(...resources.stylesheets.filter(css => css.critical));
    }
    
    // Scripts without async/defer in head
    if (resources.scripts) {
      critical.push(...resources.scripts.filter(script => 
        !script.async && !script.defer && script.position === 'above-fold'
      ));
    }

    return critical;
  }

  identifyBlockingResources(resources) {
    const blocking = [];
    
    if (resources.scripts) {
      blocking.push(...resources.scripts.filter(script => 
        !script.async && !script.defer && !script.module
      ));
    }

    if (resources.stylesheets) {
      blocking.push(...resources.stylesheets.filter(css => css.critical));
    }

    return blocking;
  }

  identifyOptimizationOpportunities(resources) {
    const opportunities = [];

    // Images without lazy loading
    if (resources.images) {
      const unoptimizedImages = resources.images.filter(img => 
        !img.lazy && img.position === 'below-fold'
      );
      if (unoptimizedImages.length > 0) {
        opportunities.push({
          type: 'lazy-loading',
          impact: 'medium',
          resources: unoptimizedImages.length,
          description: 'Images below the fold should use lazy loading'
        });
      }
    }

    // Scripts without async/defer
    if (resources.scripts) {
      const blockingScripts = resources.scripts.filter(script => 
        !script.async && !script.defer && script.src
      );
      if (blockingScripts.length > 0) {
        opportunities.push({
          type: 'script-async',
          impact: 'high',
          resources: blockingScripts.length,
          description: 'External scripts should use async or defer attributes'
        });
      }
    }

    return opportunities;
  }

  identifyThirdPartyResources(resources, baseUrl) {
    const thirdParty = {};
    
    Object.keys(resources).forEach(type => {
      if (Array.isArray(resources[type])) {
        thirdParty[type] = resources[type].filter(resource => resource.isThirdParty);
      }
    });

    return {
      resources: thirdParty,
      domains: this.extractThirdPartyDomains(thirdParty),
      summary: this.summarizeThirdPartyImpact(thirdParty)
    };
  }

  extractThirdPartyDomains(thirdPartyResources) {
    const domains = new Set();
    
    Object.values(thirdPartyResources).forEach(resourceArray => {
      resourceArray.forEach(resource => {
        try {
          const url = resource.src || resource.href;
          if (url) {
            domains.add(new URL(url).hostname);
          }
        } catch (e) {
          // Invalid URL, skip
        }
      });
    });

    return Array.from(domains);
  }

  summarizeThirdPartyImpact(thirdPartyResources) {
    let totalResources = 0;
    let criticalResources = 0;

    Object.values(thirdPartyResources).forEach(resourceArray => {
      totalResources += resourceArray.length;
      criticalResources += resourceArray.filter(r => 
        r.type === 'script' && !r.async && !r.defer
      ).length;
    });

    return {
      totalResources,
      criticalResources,
      impact: criticalResources > 0 ? 'high' : 
              totalResources > 5 ? 'medium' : 'low'
    };
  }
}

export default ResourceDetector;
