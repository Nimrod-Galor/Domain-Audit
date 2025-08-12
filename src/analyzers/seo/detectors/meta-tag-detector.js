/**
 * Meta Tag Detector - GPT-5 Style Pure Detection
 * 
 * Detects and extracts all meta-related elements from the DOM
 * No business logic - pure detection and extraction
 */

export class MetaTagDetector {
  constructor(options = {}) {
    this.options = {
      includeNonStandard: options.includeNonStandard !== false,
      extractFullAttributes: options.extractFullAttributes !== false,
      enableSocialMediaDetection: options.enableSocialMediaDetection !== false,
      ...options
    };
  }

  /**
   * Detect all meta tags and related elements
   * @param {Document} document - DOM document
   * @param {string} url - Page URL for context
   * @returns {Object} Meta tag detection results
   */
  async detect(document, url) {
    try {
      const results = {
        success: true,
        url,
        basic: this._detectBasicMetaTags(document),
        openGraph: this._detectOpenGraphTags(document),
        twitterCard: this._detectTwitterCardTags(document),
        dublinCore: this._detectDublinCoreTags(document),
        viewport: this._detectViewportTag(document),
        robots: this._detectRobotsTags(document),
        canonical: this._detectCanonicalLinks(document),
        alternates: this._detectAlternateLinks(document),
        amphtml: this._detectAMPHTML(document),
        socialMedia: this.options.enableSocialMediaDetection ? 
          this._detectSocialMediaTags(document) : null,
        nonStandard: this.options.includeNonStandard ? 
          this._detectNonStandardTags(document) : null,
        statistics: {}
      };

      // Calculate statistics
      results.statistics = this._calculateStatistics(results);

      return results;

    } catch (error) {
      return {
        success: false,
        error: error.message,
        url,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Detect basic meta tags (title, description, keywords, etc.)
   * @param {Document} document - DOM document
   * @returns {Object} Basic meta tag data
   * @private
   */
  _detectBasicMetaTags(document) {
    const basic = {
      title: this._extractTitle(document),
      description: this._extractMetaContent(document, 'description'),
      keywords: this._extractMetaContent(document, 'keywords'),
      author: this._extractMetaContent(document, 'author'),
      generator: this._extractMetaContent(document, 'generator'),
      language: this._extractLanguage(document),
      charset: this._extractCharset(document),
      contentType: this._extractMetaContent(document, 'content-type')
    };

    // Add full element data if requested
    if (this.options.extractFullAttributes) {
      basic._elements = {
        title: document.querySelector('title'),
        metaTags: Array.from(document.querySelectorAll('meta[name]'))
          .filter(meta => ['description', 'keywords', 'author', 'generator'].includes(
            meta.getAttribute('name')?.toLowerCase()
          ))
      };
    }

    return basic;
  }

  /**
   * Detect Open Graph tags
   * @param {Document} document - DOM document
   * @returns {Object} Open Graph data
   * @private
   */
  _detectOpenGraphTags(document) {
    const ogTags = Array.from(document.querySelectorAll('meta[property^="og:"]'));
    const openGraph = {};

    // Standard OG properties
    const standardProperties = [
      'og:title', 'og:type', 'og:image', 'og:url', 'og:description',
      'og:site_name', 'og:locale', 'og:video', 'og:audio'
    ];

    standardProperties.forEach(property => {
      const element = document.querySelector(`meta[property="${property}"]`);
      if (element) {
        const key = property.replace('og:', '');
        openGraph[key] = element.getAttribute('content');
        
        if (this.options.extractFullAttributes) {
          openGraph[`_${key}_element`] = element;
        }
      }
    });

    // Handle multiple images
    const imageElements = document.querySelectorAll('meta[property="og:image"]');
    if (imageElements.length > 1) {
      openGraph.images = Array.from(imageElements).map(img => img.getAttribute('content'));
    }

    // Extended OG properties
    const extendedTags = ogTags.filter(tag => 
      !standardProperties.includes(tag.getAttribute('property'))
    );

    if (extendedTags.length > 0) {
      openGraph.extended = {};
      extendedTags.forEach(tag => {
        const property = tag.getAttribute('property');
        const content = tag.getAttribute('content');
        const key = property.replace('og:', '').replace(':', '_');
        openGraph.extended[key] = content;
      });
    }

    return openGraph;
  }

  /**
   * Detect Twitter Card tags
   * @param {Document} document - DOM document
   * @returns {Object} Twitter Card data
   * @private
   */
  _detectTwitterCardTags(document) {
    const twitterTags = Array.from(document.querySelectorAll('meta[name^="twitter:"]'));
    const twitterCard = {};

    // Standard Twitter properties
    const standardProperties = [
      'twitter:card', 'twitter:site', 'twitter:creator', 'twitter:title',
      'twitter:description', 'twitter:image', 'twitter:image:alt',
      'twitter:player', 'twitter:player:width', 'twitter:player:height'
    ];

    standardProperties.forEach(property => {
      const element = document.querySelector(`meta[name="${property}"]`);
      if (element) {
        const key = property.replace('twitter:', '');
        twitterCard[key] = element.getAttribute('content');
        
        if (this.options.extractFullAttributes) {
          twitterCard[`_${key}_element`] = element;
        }
      }
    });

    // Extended Twitter properties
    const extendedTags = twitterTags.filter(tag => 
      !standardProperties.includes(tag.getAttribute('name'))
    );

    if (extendedTags.length > 0) {
      twitterCard.extended = {};
      extendedTags.forEach(tag => {
        const name = tag.getAttribute('name');
        const content = tag.getAttribute('content');
        const key = name.replace('twitter:', '').replace(':', '_');
        twitterCard.extended[key] = content;
      });
    }

    return twitterCard;
  }

  /**
   * Detect Dublin Core metadata tags
   * @param {Document} document - DOM document
   * @returns {Object} Dublin Core data
   * @private
   */
  _detectDublinCoreTags(document) {
    const dcTags = Array.from(document.querySelectorAll('meta[name^="DC."], meta[name^="dc."]'));
    const dublinCore = {};

    dcTags.forEach(tag => {
      const name = tag.getAttribute('name');
      const content = tag.getAttribute('content');
      const key = name.replace(/^DC\./i, '').replace(/^dc\./i, '').toLowerCase();
      dublinCore[key] = content;
    });

    return dublinCore;
  }

  /**
   * Detect viewport meta tag
   * @param {Document} document - DOM document
   * @returns {Object} Viewport data
   * @private
   */
  _detectViewportTag(document) {
    const viewportElement = document.querySelector('meta[name="viewport"]');
    if (!viewportElement) {
      return { present: false };
    }

    const content = viewportElement.getAttribute('content');
    const viewport = {
      present: true,
      content,
      parsed: this._parseViewportContent(content)
    };

    if (this.options.extractFullAttributes) {
      viewport._element = viewportElement;
    }

    return viewport;
  }

  /**
   * Detect robots meta tags and directives
   * @param {Document} document - DOM document
   * @returns {Object} Robots data
   * @private
   */
  _detectRobotsTags(document) {
    const robotsElement = document.querySelector('meta[name="robots"]');
    const robots = {
      meta: robotsElement ? {
        present: true,
        content: robotsElement.getAttribute('content'),
        directives: this._parseRobotsDirectives(robotsElement.getAttribute('content'))
      } : { present: false },
      
      // Check for specific bot directives
      googlebot: this._extractMetaContent(document, 'googlebot'),
      bingbot: this._extractMetaContent(document, 'bingbot'),
      
      // X-Robots-Tag headers (if available in head)
      xRobotsTag: this._detectXRobotsTag(document)
    };

    return robots;
  }

  /**
   * Detect canonical links
   * @param {Document} document - DOM document
   * @returns {Object} Canonical link data
   * @private
   */
  _detectCanonicalLinks(document) {
    const canonicalElements = document.querySelectorAll('link[rel="canonical"]');
    
    if (canonicalElements.length === 0) {
      return { present: false };
    }

    const canonical = {
      present: true,
      count: canonicalElements.length,
      href: canonicalElements[0].getAttribute('href')
    };

    // Multiple canonical tags (issue)
    if (canonicalElements.length > 1) {
      canonical.multiple = true;
      canonical.allHrefs = Array.from(canonicalElements).map(el => el.getAttribute('href'));
    }

    if (this.options.extractFullAttributes) {
      canonical._elements = Array.from(canonicalElements);
    }

    return canonical;
  }

  /**
   * Detect alternate links (hreflang, media, etc.)
   * @param {Document} document - DOM document
   * @returns {Object} Alternate links data
   * @private
   */
  _detectAlternateLinks(document) {
    const alternateElements = document.querySelectorAll('link[rel="alternate"]');
    
    const alternates = {
      count: alternateElements.length,
      hreflang: [],
      media: [],
      type: [],
      other: []
    };

    alternateElements.forEach(element => {
      const href = element.getAttribute('href');
      const hreflang = element.getAttribute('hreflang');
      const media = element.getAttribute('media');
      const type = element.getAttribute('type');

      if (hreflang) {
        alternates.hreflang.push({ href, hreflang });
      } else if (media) {
        alternates.media.push({ href, media });
      } else if (type) {
        alternates.type.push({ href, type });
      } else {
        alternates.other.push({ href });
      }
    });

    if (this.options.extractFullAttributes) {
      alternates._elements = Array.from(alternateElements);
    }

    return alternates;
  }

  /**
   * Detect AMP HTML link
   * @param {Document} document - DOM document
   * @returns {Object} AMP HTML data
   * @private
   */
  _detectAMPHTML(document) {
    const ampElement = document.querySelector('link[rel="amphtml"]');
    
    if (!ampElement) {
      return { present: false };
    }

    const amphtml = {
      present: true,
      href: ampElement.getAttribute('href')
    };

    if (this.options.extractFullAttributes) {
      amphtml._element = ampElement;
    }

    return amphtml;
  }

  /**
   * Detect social media specific tags
   * @param {Document} document - DOM document
   * @returns {Object} Social media tags
   * @private
   */
  _detectSocialMediaTags(document) {
    return {
      facebook: {
        appId: this._extractMetaContent(document, 'fb:app_id'),
        pageId: this._extractMetaContent(document, 'fb:page_id'),
        admins: this._extractMetaContent(document, 'fb:admins')
      },
      pinterest: {
        rich: this._extractMetaContent(document, 'p:domain_verify')
      },
      linkedin: {
        partner: this._extractMetaContent(document, 'linkedin:owner')
      },
      instagram: {
        instagramId: this._extractMetaContent(document, 'instagram:id')
      }
    };
  }

  /**
   * Detect non-standard meta tags
   * @param {Document} document - DOM document
   * @returns {Object} Non-standard tags
   * @private
   */
  _detectNonStandardTags(document) {
    const standardNames = [
      'description', 'keywords', 'author', 'generator', 'viewport', 'robots',
      'googlebot', 'bingbot', 'fb:app_id', 'fb:page_id', 'fb:admins'
    ];

    const standardProperties = [
      'og:', 'twitter:', 'fb:', 'article:', 'profile:'
    ];

    const allMetaTags = Array.from(document.querySelectorAll('meta[name], meta[property]'));
    const nonStandardTags = allMetaTags.filter(tag => {
      const name = tag.getAttribute('name') || tag.getAttribute('property');
      if (!name) return false;

      const isStandardName = standardNames.includes(name.toLowerCase());
      const isStandardProperty = standardProperties.some(prefix => 
        name.toLowerCase().startsWith(prefix)
      );

      return !isStandardName && !isStandardProperty;
    });

    return nonStandardTags.map(tag => ({
      name: tag.getAttribute('name') || tag.getAttribute('property'),
      content: tag.getAttribute('content'),
      type: tag.getAttribute('name') ? 'name' : 'property'
    }));
  }

  // Helper methods

  /**
   * Extract title element content
   * @param {Document} document - DOM document
   * @returns {Object} Title data
   * @private
   */
  _extractTitle(document) {
    const titleElement = document.querySelector('title');
    
    if (!titleElement) {
      return { present: false };
    }

    return {
      present: true,
      content: titleElement.textContent.trim(),
      length: titleElement.textContent.trim().length
    };
  }

  /**
   * Extract meta tag content by name
   * @param {Document} document - DOM document
   * @param {string} name - Meta tag name
   * @returns {string|null} Meta content
   * @private
   */
  _extractMetaContent(document, name) {
    const metaElement = document.querySelector(`meta[name="${name}"]`);
    return metaElement ? metaElement.getAttribute('content') : null;
  }

  /**
   * Extract language information
   * @param {Document} document - DOM document
   * @returns {Object} Language data
   * @private
   */
  _extractLanguage(document) {
    const htmlLang = document.documentElement.getAttribute('lang');
    const metaLang = this._extractMetaContent(document, 'language');
    
    return {
      html: htmlLang,
      meta: metaLang,
      effective: htmlLang || metaLang
    };
  }

  /**
   * Extract charset information
   * @param {Document} document - DOM document
   * @returns {string|null} Charset
   * @private
   */
  _extractCharset(document) {
    const charsetMeta = document.querySelector('meta[charset]');
    if (charsetMeta) {
      return charsetMeta.getAttribute('charset');
    }

    const httpEquivMeta = document.querySelector('meta[http-equiv="content-type"]');
    if (httpEquivMeta) {
      const content = httpEquivMeta.getAttribute('content');
      const charsetMatch = content.match(/charset=([^;]+)/i);
      return charsetMatch ? charsetMatch[1] : null;
    }

    return null;
  }

  /**
   * Parse viewport content string
   * @param {string} content - Viewport content
   * @returns {Object} Parsed viewport directives
   * @private
   */
  _parseViewportContent(content) {
    const directives = {};
    const parts = content.split(',');
    
    parts.forEach(part => {
      const [key, value] = part.trim().split('=');
      if (key && value) {
        directives[key.trim()] = value.trim();
      }
    });

    return directives;
  }

  /**
   * Parse robots directives
   * @param {string} content - Robots content
   * @returns {Array} Parsed directives
   * @private
   */
  _parseRobotsDirectives(content) {
    if (!content) return [];
    
    return content.split(',').map(directive => directive.trim().toLowerCase());
  }

  /**
   * Detect X-Robots-Tag headers (limited detection from DOM)
   * @param {Document} document - DOM document
   * @returns {Object} X-Robots-Tag data
   * @private
   */
  _detectXRobotsTag(document) {
    // This is limited since we can't access HTTP headers from DOM
    // But we can check for any meta tags that might contain this info
    const httpEquivRobots = document.querySelector('meta[http-equiv="X-Robots-Tag"]');
    
    if (httpEquivRobots) {
      return {
        present: true,
        content: httpEquivRobots.getAttribute('content')
      };
    }

    return { present: false };
  }

  /**
   * Calculate detection statistics
   * @param {Object} results - Detection results
   * @returns {Object} Statistics
   * @private
   */
  _calculateStatistics(results) {
    const stats = {
      totalMetaTags: 0,
      categories: {
        basic: 0,
        openGraph: 0,
        twitterCard: 0,
        dublinCore: 0,
        social: 0,
        technical: 0
      }
    };

    // Count basic tags
    Object.keys(results.basic).forEach(key => {
      if (results.basic[key] && !key.startsWith('_')) {
        stats.categories.basic++;
        stats.totalMetaTags++;
      }
    });

    // Count Open Graph tags
    Object.keys(results.openGraph).forEach(key => {
      if (results.openGraph[key] && !key.startsWith('_')) {
        stats.categories.openGraph++;
        stats.totalMetaTags++;
      }
    });

    // Count Twitter Card tags
    Object.keys(results.twitterCard).forEach(key => {
      if (results.twitterCard[key] && !key.startsWith('_')) {
        stats.categories.twitterCard++;
        stats.totalMetaTags++;
      }
    });

    // Count Dublin Core tags
    stats.categories.dublinCore = Object.keys(results.dublinCore).length;
    stats.totalMetaTags += stats.categories.dublinCore;

    // Count technical tags
    if (results.viewport.present) stats.categories.technical++;
    if (results.robots.meta.present) stats.categories.technical++;
    if (results.canonical.present) stats.categories.technical++;
    
    stats.totalMetaTags += stats.categories.technical;

    return stats;
  }
}

export default MetaTagDetector;
