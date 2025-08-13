/**
 * Viewport Detector - GPT-5 Style Modular Component
 * 
 * Analyzes viewport configuration, responsive design setup, and mobile-first implementation
 */

export class ViewportDetector {
  constructor(config = {}) {
    this.config = {
      analyzeViewportMeta: config.analyzeViewportMeta !== false,
      analyzeResponsiveBreakpoints: config.analyzeResponsiveBreakpoints !== false,
      validateViewportSettings: config.validateViewportSettings !== false,
      checkMobileFirst: config.checkMobileFirst !== false,
      ...config
    };
  }

  /**
   * Analyze viewport configuration and responsive design setup
   * @param {Object} document - DOM document or Cheerio instance
   * @param {string} url - Page URL
   * @returns {Object} Viewport analysis
   */
  async analyze(document, url) {
    const results = {
      viewportMeta: {},
      responsiveBreakpoints: {},
      mobileFirst: {},
      viewportValidation: {},
      score: 0,
      grade: 'F',
      recommendations: [],
      issues: []
    };

    try {
      // Analyze viewport meta tag
      if (this.config.analyzeViewportMeta) {
        results.viewportMeta = this.analyzeViewportMeta(document);
      }

      // Analyze responsive breakpoints
      if (this.config.analyzeResponsiveBreakpoints) {
        results.responsiveBreakpoints = this.analyzeResponsiveBreakpoints(document);
      }

      // Check mobile-first implementation
      if (this.config.checkMobileFirst) {
        results.mobileFirst = this.analyzeMobileFirst(document);
      }

      // Validate viewport settings
      if (this.config.validateViewportSettings) {
        results.viewportValidation = this.validateViewportSettings(results.viewportMeta);
      }

      // Calculate overall viewport score
      results.score = this.calculateViewportScore(results);
      results.grade = this.calculateGrade(results.score);
      results.recommendations = this.generateRecommendations(results);
      results.issues = this.identifyViewportIssues(results);

    } catch (error) {
      results.error = error.message;
      results.score = 0;
    }

    return results;
  }

  /**
   * Analyze viewport meta tag configuration
   * @param {Object} document - DOM document
   * @returns {Object} Viewport meta tag analysis
   * @private
   */
  analyzeViewportMeta(document) {
    const viewport = {
      exists: false,
      content: '',
      properties: {},
      isResponsive: false,
      hasDeviceWidth: false,
      hasInitialScale: false,
      allowsZoom: true,
      score: 0,
      issues: [],
      strengths: []
    };

    try {
      // Find viewport meta tag
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      
      if (viewportMeta) {
        viewport.exists = true;
        viewport.content = viewportMeta.getAttribute('content') || '';
        viewport.strengths.push('viewport-meta-present');

        // Parse viewport properties
        viewport.properties = this.parseViewportContent(viewport.content);

        // Analyze key properties
        viewport.hasDeviceWidth = viewport.properties.width === 'device-width';
        viewport.hasInitialScale = viewport.properties['initial-scale'] === '1' || 
                                  viewport.properties['initial-scale'] === '1.0';
        
        // Check zoom settings
        viewport.allowsZoom = viewport.properties['user-scalable'] !== 'no' && 
                             viewport.properties['user-scalable'] !== '0';

        // Determine if responsive
        viewport.isResponsive = viewport.hasDeviceWidth && viewport.hasInitialScale;

        // Add strengths and issues
        if (viewport.hasDeviceWidth) {
          viewport.strengths.push('device-width-set');
        } else {
          viewport.issues.push('missing-device-width');
        }

        if (viewport.hasInitialScale) {
          viewport.strengths.push('initial-scale-set');
        } else {
          viewport.issues.push('missing-initial-scale');
        }

        if (viewport.allowsZoom) {
          viewport.strengths.push('zoom-allowed');
        } else {
          viewport.issues.push('zoom-disabled');
        }

        // Calculate viewport score
        viewport.score = this.calculateViewportMetaScore(viewport);

      } else {
        viewport.issues.push('viewport-meta-missing');
        viewport.score = 0;
      }

    } catch (error) {
      viewport.error = error.message;
    }

    return viewport;
  }

  /**
   * Parse viewport content string into properties object
   * @param {string} content - Viewport content attribute value
   * @returns {Object} Parsed viewport properties
   * @private
   */
  parseViewportContent(content) {
    const properties = {};
    
    if (!content) return properties;

    // Split by comma and parse each property
    const parts = content.split(',').map(part => part.trim());
    
    parts.forEach(part => {
      const [key, value] = part.split('=').map(s => s.trim());
      if (key && value !== undefined) {
        properties[key] = value;
      }
    });

    return properties;
  }

  /**
   * Analyze responsive breakpoints implementation
   * @param {Object} document - DOM document
   * @returns {Object} Responsive breakpoints analysis
   * @private
   */
  analyzeResponsiveBreakpoints(document) {
    const breakpoints = {
      detected: [],
      mediaQueries: {},
      standardBreakpoints: {
        mobile: { range: '0-767px', detected: false },
        tablet: { range: '768-1023px', detected: false },
        desktop: { range: '1024px+', detected: false }
      },
      customBreakpoints: [],
      mobileFirstQueries: 0,
      desktopFirstQueries: 0,
      score: 0,
      coverage: 'none'
    };

    try {
      // Analyze CSS for media queries
      const mediaQueryData = this.extractMediaQueries(document);
      breakpoints.mediaQueries = mediaQueryData;

      // Process detected breakpoints
      mediaQueryData.breakpoints.forEach(bp => {
        breakpoints.detected.push(bp);

        // Categorize breakpoints
        if (bp.value <= 767) {
          breakpoints.standardBreakpoints.mobile.detected = true;
        } else if (bp.value >= 768 && bp.value <= 1023) {
          breakpoints.standardBreakpoints.tablet.detected = true;
        } else if (bp.value >= 1024) {
          breakpoints.standardBreakpoints.desktop.detected = true;
        }

        // Check if custom breakpoint
        if (![320, 480, 768, 1024, 1200, 1440].includes(bp.value)) {
          breakpoints.customBreakpoints.push(bp);
        }

        // Count mobile-first vs desktop-first
        if (bp.type === 'min-width') {
          breakpoints.mobileFirstQueries++;
        } else if (bp.type === 'max-width') {
          breakpoints.desktopFirstQueries++;
        }
      });

      // Determine coverage
      const standardCount = Object.values(breakpoints.standardBreakpoints)
        .filter(bp => bp.detected).length;
      
      if (standardCount === 0) breakpoints.coverage = 'none';
      else if (standardCount === 1) breakpoints.coverage = 'minimal';
      else if (standardCount === 2) breakpoints.coverage = 'partial';
      else breakpoints.coverage = 'complete';

      // Calculate breakpoints score
      breakpoints.score = this.calculateBreakpointsScore(breakpoints);

    } catch (error) {
      breakpoints.error = error.message;
    }

    return breakpoints;
  }

  /**
   * Extract media queries from CSS
   * @param {Object} document - DOM document
   * @returns {Object} Media query data
   * @private
   */
  extractMediaQueries(document) {
    const mediaData = {
      count: 0,
      breakpoints: [],
      features: [],
      types: []
    };

    try {
      // Analyze style elements
      const styleElements = document.querySelectorAll('style');
      styleElements.forEach(style => {
        const css = style.textContent || style.innerHTML || '';
        this.parseMediaQueriesFromCSS(css, mediaData);
      });

      // Analyze link elements with media attributes
      const linkElements = document.querySelectorAll('link[rel="stylesheet"][media]');
      linkElements.forEach(link => {
        const media = link.getAttribute('media');
        if (media && media !== 'all' && media !== 'screen') {
          this.parseMediaQuery(media, mediaData);
        }
      });

    } catch (error) {
      mediaData.error = error.message;
    }

    return mediaData;
  }

  /**
   * Parse media queries from CSS content
   * @param {string} css - CSS content
   * @param {Object} mediaData - Media data object to update
   * @private
   */
  parseMediaQueriesFromCSS(css, mediaData) {
    // Match @media rules
    const mediaRegex = /@media\s+([^{]+)/g;
    let match;

    while ((match = mediaRegex.exec(css)) !== null) {
      const mediaQuery = match[1].trim();
      this.parseMediaQuery(mediaQuery, mediaData);
    }
  }

  /**
   * Parse individual media query
   * @param {string} query - Media query string
   * @param {Object} mediaData - Media data object to update
   * @private
   */
  parseMediaQuery(query, mediaData) {
    mediaData.count++;

    // Extract width-based breakpoints
    const widthRegex = /(min-width|max-width):\s*(\d+(?:\.\d+)?)(px|em|rem)/g;
    let match;

    while ((match = widthRegex.exec(query)) !== null) {
      const [, type, value, unit] = match;
      let pixelValue = parseFloat(value);

      // Convert to pixels (approximate)
      if (unit === 'em' || unit === 'rem') {
        pixelValue *= 16; // Assume 16px base font size
      }

      mediaData.breakpoints.push({
        type,
        value: Math.round(pixelValue),
        unit,
        query: query.trim()
      });
    }

    // Extract media types
    if (query.includes('screen')) mediaData.types.push('screen');
    if (query.includes('print')) mediaData.types.push('print');
    if (query.includes('handheld')) mediaData.types.push('handheld');

    // Extract features
    if (query.includes('orientation')) mediaData.features.push('orientation');
    if (query.includes('resolution')) mediaData.features.push('resolution');
    if (query.includes('device-pixel-ratio')) mediaData.features.push('device-pixel-ratio');
  }

  /**
   * Analyze mobile-first implementation
   * @param {Object} document - DOM document
   * @returns {Object} Mobile-first analysis
   * @private
   */
  analyzeMobileFirst(document) {
    const mobileFirst = {
      implemented: false,
      evidence: [],
      minWidthQueries: 0,
      maxWidthQueries: 0,
      progressiveEnhancement: false,
      baseStyles: 'unknown',
      score: 0,
      confidence: 0
    };

    try {
      // Analyze CSS structure
      const cssAnalysis = this.analyzeCSSStructure(document);
      
      mobileFirst.minWidthQueries = cssAnalysis.minWidthQueries;
      mobileFirst.maxWidthQueries = cssAnalysis.maxWidthQueries;

      // Determine if mobile-first based on query types
      if (mobileFirst.minWidthQueries > mobileFirst.maxWidthQueries) {
        mobileFirst.implemented = true;
        mobileFirst.evidence.push('more-min-width-queries');
      }

      // Check for progressive enhancement patterns
      if (cssAnalysis.hasBaseStyles && mobileFirst.minWidthQueries > 0) {
        mobileFirst.progressiveEnhancement = true;
        mobileFirst.evidence.push('progressive-enhancement');
      }

      // Determine base styles approach
      if (cssAnalysis.hasBaseStyles) {
        mobileFirst.baseStyles = 'mobile-optimized';
        mobileFirst.evidence.push('mobile-base-styles');
      } else {
        mobileFirst.baseStyles = 'unknown';
      }

      // Calculate mobile-first score
      mobileFirst.score = this.calculateMobileFirstScore(mobileFirst);
      mobileFirst.confidence = this.calculateMobileFirstConfidence(mobileFirst, cssAnalysis);

    } catch (error) {
      mobileFirst.error = error.message;
    }

    return mobileFirst;
  }

  /**
   * Analyze CSS structure for mobile-first patterns
   * @param {Object} document - DOM document
   * @returns {Object} CSS structure analysis
   * @private
   */
  analyzeCSSStructure(document) {
    const analysis = {
      minWidthQueries: 0,
      maxWidthQueries: 0,
      hasBaseStyles: false,
      totalRules: 0,
      mediaQueryRules: 0
    };

    try {
      const styleElements = document.querySelectorAll('style');
      
      styleElements.forEach(style => {
        const css = style.textContent || style.innerHTML || '';
        
        // Count media query types
        const minWidthMatches = css.match(/@media[^{]*min-width/g) || [];
        const maxWidthMatches = css.match(/@media[^{]*max-width/g) || [];
        
        analysis.minWidthQueries += minWidthMatches.length;
        analysis.maxWidthQueries += maxWidthMatches.length;

        // Count total CSS rules (approximate)
        const ruleMatches = css.match(/[^{}]+\{[^{}]*\}/g) || [];
        analysis.totalRules += ruleMatches.length;

        // Count media query rules
        const mediaMatches = css.match(/@media[^{]+\{[^{}]*\}/g) || [];
        analysis.mediaQueryRules += mediaMatches.length;

        // Check for base styles (rules outside media queries)
        const baseStylesRatio = (analysis.totalRules - analysis.mediaQueryRules) / analysis.totalRules;
        analysis.hasBaseStyles = baseStylesRatio > 0.3; // At least 30% base styles
      });

    } catch (error) {
      analysis.error = error.message;
    }

    return analysis;
  }

  /**
   * Validate viewport settings against best practices
   * @param {Object} viewportMeta - Viewport meta tag data
   * @returns {Object} Validation results
   * @private
   */
  validateViewportSettings(viewportMeta) {
    const validation = {
      isValid: false,
      bestPractices: {
        hasDeviceWidth: false,
        hasInitialScale: false,
        allowsZoom: false,
        noMaximumScale: false,
        noUserScalableNo: false
      },
      violations: [],
      recommendations: [],
      score: 0
    };

    try {
      if (!viewportMeta.exists) {
        validation.violations.push('viewport-meta-missing');
        validation.recommendations.push('Add viewport meta tag');
        return validation;
      }

      // Check best practices
      validation.bestPractices.hasDeviceWidth = viewportMeta.hasDeviceWidth;
      validation.bestPractices.hasInitialScale = viewportMeta.hasInitialScale;
      validation.bestPractices.allowsZoom = viewportMeta.allowsZoom;
      validation.bestPractices.noMaximumScale = !viewportMeta.properties['maximum-scale'];
      validation.bestPractices.noUserScalableNo = viewportMeta.properties['user-scalable'] !== 'no';

      // Identify violations
      if (!validation.bestPractices.hasDeviceWidth) {
        validation.violations.push('missing-device-width');
        validation.recommendations.push('Set width=device-width');
      }

      if (!validation.bestPractices.hasInitialScale) {
        validation.violations.push('missing-initial-scale');
        validation.recommendations.push('Set initial-scale=1');
      }

      if (!validation.bestPractices.allowsZoom) {
        validation.violations.push('zoom-disabled');
        validation.recommendations.push('Allow user zoom for accessibility');
      }

      if (viewportMeta.properties['maximum-scale']) {
        validation.violations.push('maximum-scale-set');
        validation.recommendations.push('Remove maximum-scale restriction');
      }

      // Calculate validation score
      const practicesCount = Object.values(validation.bestPractices).filter(Boolean).length;
      validation.score = (practicesCount / Object.keys(validation.bestPractices).length) * 100;
      validation.isValid = validation.score >= 80;

    } catch (error) {
      validation.error = error.message;
    }

    return validation;
  }

  /**
   * Calculate viewport meta tag score
   * @param {Object} viewport - Viewport data
   * @returns {number} Score (0-100)
   * @private
   */
  calculateViewportMetaScore(viewport) {
    let score = 0;

    if (viewport.exists) score += 40;
    if (viewport.hasDeviceWidth) score += 25;
    if (viewport.hasInitialScale) score += 25;
    if (viewport.allowsZoom) score += 10;

    return Math.min(100, score);
  }

  /**
   * Calculate breakpoints score
   * @param {Object} breakpoints - Breakpoints data
   * @returns {number} Score (0-100)
   * @private
   */
  calculateBreakpointsScore(breakpoints) {
    let score = 0;

    // Coverage score (60%)
    const coverageScores = {
      'none': 0,
      'minimal': 25,
      'partial': 50,
      'complete': 100
    };
    score += (coverageScores[breakpoints.coverage] || 0) * 0.6;

    // Mobile-first implementation (40%)
    if (breakpoints.mobileFirstQueries > 0) {
      const mobileFirstRatio = breakpoints.mobileFirstQueries / 
        (breakpoints.mobileFirstQueries + breakpoints.desktopFirstQueries);
      score += mobileFirstRatio * 40;
    }

    return Math.round(score);
  }

  /**
   * Calculate mobile-first score
   * @param {Object} mobileFirst - Mobile-first data
   * @returns {number} Score (0-100)
   * @private
   */
  calculateMobileFirstScore(mobileFirst) {
    let score = 0;

    if (mobileFirst.implemented) score += 50;
    if (mobileFirst.progressiveEnhancement) score += 30;
    if (mobileFirst.minWidthQueries > 2) score += 20;

    return Math.min(100, score);
  }

  /**
   * Calculate mobile-first confidence
   * @param {Object} mobileFirst - Mobile-first data
   * @param {Object} cssAnalysis - CSS analysis data
   * @returns {number} Confidence level (0-100)
   * @private
   */
  calculateMobileFirstConfidence(mobileFirst, cssAnalysis) {
    let confidence = 50; // Base confidence

    if (cssAnalysis.minWidthQueries > cssAnalysis.maxWidthQueries) confidence += 30;
    if (cssAnalysis.hasBaseStyles) confidence += 20;
    if (mobileFirst.evidence.length > 1) confidence += 20;
    if (cssAnalysis.totalRules > 10) confidence += 10;

    return Math.min(100, confidence);
  }

  /**
   * Calculate overall viewport score
   * @param {Object} results - All analysis results
   * @returns {number} Overall score (0-100)
   * @private
   */
  calculateViewportScore(results) {
    let score = 0;
    let weights = 0;

    // Viewport meta (40%)
    if (results.viewportMeta && !results.viewportMeta.error) {
      score += (results.viewportMeta.score || 0) * 0.4;
      weights += 0.4;
    }

    // Responsive breakpoints (35%)
    if (results.responsiveBreakpoints && !results.responsiveBreakpoints.error) {
      score += (results.responsiveBreakpoints.score || 0) * 0.35;
      weights += 0.35;
    }

    // Mobile-first (25%)
    if (results.mobileFirst && !results.mobileFirst.error) {
      score += (results.mobileFirst.score || 0) * 0.25;
      weights += 0.25;
    }

    return weights > 0 ? Math.round(score / weights) : 0;
  }

  /**
   * Calculate letter grade from score
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
   * Generate viewport recommendations
   * @param {Object} results - Analysis results
   * @returns {Array} List of recommendations
   * @private
   */
  generateRecommendations(results) {
    const recommendations = [];

    if (!results.viewportMeta?.exists) {
      recommendations.push({
        type: 'viewport-meta',
        priority: 'critical',
        message: 'Add viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1">',
        impact: 'mobile-usability'
      });
    }

    if (results.viewportMeta?.exists && !results.viewportMeta.isResponsive) {
      recommendations.push({
        type: 'viewport-configuration',
        priority: 'high',
        message: 'Configure viewport for responsive design with width=device-width and initial-scale=1',
        impact: 'responsive-design'
      });
    }

    if (results.responsiveBreakpoints?.coverage === 'none') {
      recommendations.push({
        type: 'responsive-breakpoints',
        priority: 'high',
        message: 'Implement responsive breakpoints using media queries for mobile, tablet, and desktop',
        impact: 'cross-device-compatibility'
      });
    }

    if (!results.mobileFirst?.implemented) {
      recommendations.push({
        type: 'mobile-first',
        priority: 'medium',
        message: 'Consider implementing mobile-first design approach using min-width media queries',
        impact: 'performance-accessibility'
      });
    }

    return recommendations;
  }

  /**
   * Identify viewport-related issues
   * @param {Object} results - Analysis results
   * @returns {Array} List of issues
   * @private
   */
  identifyViewportIssues(results) {
    const issues = [];

    if (!results.viewportMeta?.exists) {
      issues.push({
        type: 'missing-viewport',
        severity: 'critical',
        message: 'No viewport meta tag found - page will not display correctly on mobile devices'
      });
    }

    if (results.viewportMeta?.exists && !results.viewportMeta.allowsZoom) {
      issues.push({
        type: 'zoom-disabled',
        severity: 'high',
        message: 'Viewport disables zoom - accessibility issue for users who need magnification'
      });
    }

    if (results.responsiveBreakpoints?.desktopFirstQueries > results.responsiveBreakpoints?.mobileFirstQueries) {
      issues.push({
        type: 'desktop-first-approach',
        severity: 'medium',
        message: 'Desktop-first approach detected - may impact mobile performance'
      });
    }

    return issues;
  }
}

export default ViewportDetector;
