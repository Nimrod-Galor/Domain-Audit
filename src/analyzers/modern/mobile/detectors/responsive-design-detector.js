/**
 * Responsive Design Detector - GPT-5 Style Modular Component
 * 
 * Detects responsive design patterns, media queries, and adaptive layout features
 */

export class ResponsiveDesignDetector {
  constructor(config = {}) {
    this.config = {
      analyzeMediaQueries: config.analyzeMediaQueries !== false,
      analyzeFlexboxGrid: config.analyzeFlexboxGrid !== false,
      analyzeBreakpoints: config.analyzeBreakpoints !== false,
      analyzeImageResponsiveness: config.analyzeImageResponsiveness !== false,
      minBreakpoints: config.minBreakpoints || 2,
      ...config
    };
  }

  /**
   * Analyze responsive design implementation
   * @param {Object} document - DOM document or Cheerio instance
   * @param {string} url - Page URL
   * @returns {Object} Responsive design analysis
   */
  async analyze(document, url) {
    const results = {
      hasResponsiveDesign: false,
      mediaQueries: {},
      flexboxGrid: {},
      breakpoints: {},
      responsiveImages: {},
      responsiveText: {},
      score: 0,
      confidence: 0,
      patterns: []
    };

    try {
      // Analyze media queries
      if (this.config.analyzeMediaQueries) {
        results.mediaQueries = this.analyzeMediaQueries(document);
      }

      // Analyze flexbox and grid layouts
      if (this.config.analyzeFlexboxGrid) {
        results.flexboxGrid = this.analyzeFlexboxGrid(document);
      }

      // Analyze responsive breakpoints
      if (this.config.analyzeBreakpoints) {
        results.breakpoints = this.analyzeBreakpoints(document);
      }

      // Analyze responsive images
      if (this.config.analyzeImageResponsiveness) {
        results.responsiveImages = this.analyzeResponsiveImages(document);
      }

      // Analyze responsive typography
      results.responsiveText = this.analyzeResponsiveText(document);

      // Calculate overall responsive design score
      results.score = this.calculateResponsiveScore(results);
      results.confidence = this.calculateConfidence(results);
      results.hasResponsiveDesign = results.score >= 60;
      results.patterns = this.identifyResponsivePatterns(results);

    } catch (error) {
      results.error = error.message;
      results.score = 0;
    }

    return results;
  }

  /**
   * Analyze media queries in stylesheets and inline styles
   * @param {Object} document - DOM document
   * @returns {Object} Media query analysis
   * @private
   */
  analyzeMediaQueries(document) {
    const mediaQueries = {
      count: 0,
      breakpoints: [],
      types: [],
      features: [],
      hasMinWidth: false,
      hasMaxWidth: false,
      hasOrientation: false,
      coverage: 0
    };

    try {
      // Analyze external stylesheets
      const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
      linkElements.forEach(link => {
        const media = link.getAttribute('media');
        if (media && media !== 'all' && media !== 'screen') {
          mediaQueries.count++;
          this.parseMediaQuery(media, mediaQueries);
        }
      });

      // Analyze inline styles and style elements
      const styleElements = document.querySelectorAll('style');
      styleElements.forEach(style => {
        const content = style.textContent || style.innerHTML || '';
        const mediaMatches = content.match(/@media[^{]+/g) || [];
        
        mediaMatches.forEach(match => {
          mediaQueries.count++;
          this.parseMediaQuery(match, mediaQueries);
        });
      });

      // Calculate coverage score
      mediaQueries.coverage = this.calculateMediaQueryCoverage(mediaQueries);

    } catch (error) {
      mediaQueries.error = error.message;
    }

    return mediaQueries;
  }

  /**
   * Parse individual media query and extract features
   * @param {string} mediaQuery - Media query string
   * @param {Object} results - Results object to update
   * @private
   */
  parseMediaQuery(mediaQuery, results) {
    const query = mediaQuery.toLowerCase();

    // Extract breakpoints
    const widthMatches = query.match(/(?:min-width|max-width):\s*(\d+(?:\.\d+)?)(px|em|rem|%)/g) || [];
    widthMatches.forEach(match => {
      const [, value, unit] = match.match(/(\d+(?:\.\d+)?)(px|em|rem|%)/) || [];
      if (value) {
        results.breakpoints.push({
          value: parseFloat(value),
          unit,
          type: match.includes('min-width') ? 'min' : 'max'
        });
        
        if (match.includes('min-width')) results.hasMinWidth = true;
        if (match.includes('max-width')) results.hasMaxWidth = true;
      }
    });

    // Extract media types
    if (query.includes('screen')) results.types.push('screen');
    if (query.includes('print')) results.types.push('print');
    if (query.includes('handheld')) results.types.push('handheld');

    // Extract features
    if (query.includes('orientation')) {
      results.hasOrientation = true;
      results.features.push('orientation');
    }
    if (query.includes('device-width')) results.features.push('device-width');
    if (query.includes('device-height')) results.features.push('device-height');
    if (query.includes('resolution')) results.features.push('resolution');
    if (query.includes('aspect-ratio')) results.features.push('aspect-ratio');
  }

  /**
   * Analyze flexbox and CSS grid usage
   * @param {Object} document - DOM document
   * @returns {Object} Flexbox and grid analysis
   * @private
   */
  analyzeFlexboxGrid(document) {
    const layout = {
      flexbox: {
        elements: 0,
        containers: [],
        properties: [],
        score: 0
      },
      grid: {
        elements: 0,
        containers: [],
        properties: [],
        score: 0
      },
      float: {
        elements: 0,
        deprecated: false
      }
    };

    try {
      // Analyze computed styles (if available)
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach((element, index) => {
        // Limit analysis to prevent performance issues
        if (index > 1000) return;

        try {
          const styles = element.style || {};
          const className = element.className || '';
          
          // Check for flexbox
          if (styles.display === 'flex' || styles.display === 'inline-flex' ||
              className.includes('flex') || className.includes('d-flex')) {
            layout.flexbox.elements++;
            layout.flexbox.containers.push(element.tagName.toLowerCase());
          }

          // Check for CSS Grid
          if (styles.display === 'grid' || styles.display === 'inline-grid' ||
              className.includes('grid') || className.includes('d-grid')) {
            layout.grid.elements++;
            layout.grid.containers.push(element.tagName.toLowerCase());
          }

          // Check for deprecated float layouts
          if (styles.float && styles.float !== 'none') {
            layout.float.elements++;
            if (layout.float.elements > 5) {
              layout.float.deprecated = true;
            }
          }
        } catch (e) {
          // Skip elements that can't be analyzed
        }
      });

      // Calculate layout scores
      layout.flexbox.score = Math.min(100, layout.flexbox.elements * 10);
      layout.grid.score = Math.min(100, layout.grid.elements * 15);

    } catch (error) {
      layout.error = error.message;
    }

    return layout;
  }

  /**
   * Analyze responsive breakpoints and device targeting
   * @param {Object} document - DOM document
   * @returns {Object} Breakpoint analysis
   * @private
   */
  analyzeBreakpoints(document) {
    const breakpoints = {
      detected: [],
      standard: {
        mobile: false,    // < 768px
        tablet: false,    // 768px - 1024px
        desktop: false,   // > 1024px
        largeDesktop: false // > 1200px
      },
      custom: [],
      coverage: 0,
      score: 0
    };

    try {
      // Collect all breakpoints from media queries
      const allBreakpoints = new Set();
      
      // Parse CSS for media queries
      const styleElements = document.querySelectorAll('style, link[rel="stylesheet"]');
      styleElements.forEach(element => {
        let content = '';
        if (element.tagName === 'STYLE') {
          content = element.textContent || '';
        } else if (element.getAttribute('media')) {
          content = element.getAttribute('media');
        }

        const mediaMatches = content.match(/@media[^{]+|media="[^"]+"/g) || [];
        mediaMatches.forEach(match => {
          const widthValues = match.match(/(\d+)px/g) || [];
          widthValues.forEach(value => {
            const px = parseInt(value);
            if (px > 0 && px < 2000) {
              allBreakpoints.add(px);
            }
          });
        });
      });

      breakpoints.detected = Array.from(allBreakpoints).sort((a, b) => a - b);

      // Check for standard breakpoints
      breakpoints.detected.forEach(bp => {
        if (bp < 768) breakpoints.standard.mobile = true;
        else if (bp >= 768 && bp < 1024) breakpoints.standard.tablet = true;
        else if (bp >= 1024 && bp < 1200) breakpoints.standard.desktop = true;
        else if (bp >= 1200) breakpoints.standard.largeDesktop = true;
        else breakpoints.custom.push(bp);
      });

      // Calculate coverage
      const standardCount = Object.values(breakpoints.standard).filter(Boolean).length;
      breakpoints.coverage = (standardCount / 4) * 100;
      breakpoints.score = Math.min(100, breakpoints.detected.length * 25);

    } catch (error) {
      breakpoints.error = error.message;
    }

    return breakpoints;
  }

  /**
   * Analyze responsive image implementation
   * @param {Object} document - DOM document
   * @returns {Object} Responsive image analysis
   * @private
   */
  analyzeResponsiveImages(document) {
    const images = {
      total: 0,
      responsive: 0,
      srcset: 0,
      picture: 0,
      maxWidth: 0,
      lazyLoading: 0,
      score: 0,
      techniques: []
    };

    try {
      // Analyze img elements
      const imgElements = document.querySelectorAll('img');
      images.total = imgElements.length;

      imgElements.forEach(img => {
        // Check for srcset attribute
        if (img.hasAttribute('srcset')) {
          images.srcset++;
          images.responsive++;
          images.techniques.push('srcset');
        }

        // Check for sizes attribute
        if (img.hasAttribute('sizes')) {
          images.techniques.push('sizes');
        }

        // Check for lazy loading
        if (img.hasAttribute('loading') && img.getAttribute('loading') === 'lazy') {
          images.lazyLoading++;
          images.techniques.push('lazy-loading');
        }

        // Check for responsive CSS classes
        const className = img.className || '';
        if (className.includes('responsive') || className.includes('img-fluid')) {
          images.responsive++;
          images.techniques.push('css-responsive');
        }

        // Check for max-width CSS
        const style = img.style || {};
        if (style.maxWidth === '100%' || style.width === '100%') {
          images.maxWidth++;
          images.responsive++;
          images.techniques.push('max-width');
        }
      });

      // Analyze picture elements
      const pictureElements = document.querySelectorAll('picture');
      images.picture = pictureElements.length;
      if (images.picture > 0) {
        images.responsive += images.picture;
        images.techniques.push('picture-element');
      }

      // Calculate responsive image score
      if (images.total > 0) {
        images.score = Math.round((images.responsive / images.total) * 100);
      }

    } catch (error) {
      images.error = error.message;
    }

    return images;
  }

  /**
   * Analyze responsive typography implementation
   * @param {Object} document - DOM document
   * @returns {Object} Responsive text analysis
   * @private
   */
  analyzeResponsiveText(document) {
    const text = {
      hasFluidTypography: false,
      viewportUnits: 0,
      relativeUnits: 0,
      remUsage: 0,
      emUsage: 0,
      percentageUsage: 0,
      score: 0,
      techniques: []
    };

    try {
      // Check for CSS custom properties and fluid typography
      const styleElements = document.querySelectorAll('style');
      styleElements.forEach(style => {
        const content = style.textContent || '';
        
        // Check for viewport units
        if (content.match(/font-size:\s*\d+(\.\d+)?vw|vh|vmin|vmax/)) {
          text.viewportUnits++;
          text.hasFluidTypography = true;
          text.techniques.push('viewport-units');
        }

        // Check for clamp() function
        if (content.includes('clamp(')) {
          text.hasFluidTypography = true;
          text.techniques.push('clamp');
        }

        // Count relative units
        const remMatches = content.match(/\d+(\.\d+)?rem/g) || [];
        text.remUsage += remMatches.length;

        const emMatches = content.match(/\d+(\.\d+)?em/g) || [];
        text.emUsage += emMatches.length;

        const percentMatches = content.match(/font-size:\s*\d+(\.\d+)?%/g) || [];
        text.percentageUsage += percentMatches.length;
      });

      // Calculate relative units score
      text.relativeUnits = text.remUsage + text.emUsage + text.percentageUsage;
      
      if (text.relativeUnits > 0) {
        text.techniques.push('relative-units');
      }

      // Calculate overall typography score
      text.score = 0;
      if (text.hasFluidTypography) text.score += 40;
      if (text.relativeUnits > 5) text.score += 30;
      if (text.remUsage > 0) text.score += 20;
      if (text.emUsage > 0) text.score += 10;

      text.score = Math.min(100, text.score);

    } catch (error) {
      text.error = error.message;
    }

    return text;
  }

  /**
   * Calculate overall responsive design score
   * @param {Object} results - Analysis results
   * @returns {number} Overall score (0-100)
   * @private
   */
  calculateResponsiveScore(results) {
    let score = 0;
    let weights = 0;

    // Media queries (30%)
    if (results.mediaQueries && !results.mediaQueries.error) {
      score += (results.mediaQueries.coverage || 0) * 0.3;
      weights += 0.3;
    }

    // Layout techniques (25%)
    if (results.flexboxGrid && !results.flexboxGrid.error) {
      const layoutScore = Math.max(results.flexboxGrid.flexbox.score, results.flexboxGrid.grid.score);
      score += layoutScore * 0.25;
      weights += 0.25;
    }

    // Breakpoints (20%)
    if (results.breakpoints && !results.breakpoints.error) {
      score += (results.breakpoints.coverage || 0) * 0.2;
      weights += 0.2;
    }

    // Responsive images (15%)
    if (results.responsiveImages && !results.responsiveImages.error) {
      score += (results.responsiveImages.score || 0) * 0.15;
      weights += 0.15;
    }

    // Responsive typography (10%)
    if (results.responsiveText && !results.responsiveText.error) {
      score += (results.responsiveText.score || 0) * 0.1;
      weights += 0.1;
    }

    return weights > 0 ? Math.round(score / weights) : 0;
  }

  /**
   * Calculate confidence level in analysis
   * @param {Object} results - Analysis results
   * @returns {number} Confidence level (0-100)
   * @private
   */
  calculateConfidence(results) {
    let confidence = 100;
    
    // Reduce confidence based on errors
    if (results.mediaQueries?.error) confidence -= 20;
    if (results.flexboxGrid?.error) confidence -= 15;
    if (results.breakpoints?.error) confidence -= 15;
    if (results.responsiveImages?.error) confidence -= 10;
    if (results.responsiveText?.error) confidence -= 10;

    // Reduce confidence if no clear responsive patterns found
    if (results.score === 0) confidence = 20;
    else if (results.score < 30) confidence -= 30;

    return Math.max(0, confidence);
  }

  /**
   * Calculate media query coverage score
   * @param {Object} mediaQueries - Media query data
   * @returns {number} Coverage score (0-100)
   * @private
   */
  calculateMediaQueryCoverage(mediaQueries) {
    let coverage = 0;

    if (mediaQueries.count > 0) coverage += 30;
    if (mediaQueries.hasMinWidth) coverage += 20;
    if (mediaQueries.hasMaxWidth) coverage += 20;
    if (mediaQueries.hasOrientation) coverage += 15;
    if (mediaQueries.breakpoints.length >= this.config.minBreakpoints) coverage += 15;

    return Math.min(100, coverage);
  }

  /**
   * Identify responsive design patterns
   * @param {Object} results - Analysis results
   * @returns {Array} List of identified patterns
   * @private
   */
  identifyResponsivePatterns(results) {
    const patterns = [];

    if (results.mediaQueries?.count > 0) {
      patterns.push('media-queries');
    }

    if (results.flexboxGrid?.flexbox.elements > 0) {
      patterns.push('flexbox-layout');
    }

    if (results.flexboxGrid?.grid.elements > 0) {
      patterns.push('css-grid-layout');
    }

    if (results.responsiveImages?.responsive > 0) {
      patterns.push('responsive-images');
    }

    if (results.responsiveText?.hasFluidTypography) {
      patterns.push('fluid-typography');
    }

    if (results.breakpoints?.standard.mobile && results.breakpoints?.standard.desktop) {
      patterns.push('mobile-first');
    }

    return patterns;
  }
}

export default ResponsiveDesignDetector;
