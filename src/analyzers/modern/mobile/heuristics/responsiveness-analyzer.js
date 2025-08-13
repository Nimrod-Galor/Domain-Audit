/**
 * Responsiveness Analyzer - Claude AI Style Heuristic Analysis
 * 
 * Advanced responsive design pattern analysis with sophisticated
 * evaluation of mobile-first approaches and responsive implementation quality.
 */

export class ResponsivenessAnalyzer {
  constructor(config = {}) {
    this.config = {
      strictMode: false,
      includeAdvanced: true,
      breakpointThreshold: 4,
      fluidThreshold: 0.8,
      ...config
    };

    this.responsivePatterns = {
      mobileFirst: {
        pattern: /@media.*min-width|progressive.*enhancement/i,
        weight: 0.3,
        description: 'Mobile-first approach implementation'
      },
      fluidLayouts: {
        pattern: /width.*%|max-width.*%|flex|grid|fr\s*unit/i,
        weight: 0.25,
        description: 'Fluid and flexible layout systems'
      },
      responsiveImages: {
        pattern: /srcset|picture.*source|responsive.*image/i,
        weight: 0.2,
        description: 'Responsive image implementation'
      },
      adaptiveContent: {
        pattern: /display.*none.*mobile|hide.*mobile|show.*desktop/i,
        weight: 0.15,
        description: 'Adaptive content strategies'
      },
      touchOptimization: {
        pattern: /touch-action|user-select.*none|tap-highlight/i,
        weight: 0.1,
        description: 'Touch interaction optimization'
      }
    };

    this.breakpointStrategy = {
      mobile: { min: 0, max: 767 },
      tablet: { min: 768, max: 1023 },
      desktop: { min: 1024, max: 1439 },
      large: { min: 1440, max: 9999 }
    };
  }

  async analyze(document, context = {}) {
    try {
      const analysis = {
        patterns: await this.analyzeResponsivePatterns(document),
        breakpoints: await this.analyzeBreakpoints(document),
        layouts: await this.analyzeLayoutSystems(document),
        images: await this.analyzeResponsiveImages(document),
        typography: await this.analyzeResponsiveTypography(document),
        navigation: await this.analyzeResponsiveNavigation(document),
        performance: await this.analyzeResponsivePerformance(document),
        score: 0,
        recommendations: []
      };

      analysis.score = this.calculateResponsivenessScore(analysis);
      analysis.recommendations = this.generateResponsivenessRecommendations(analysis);

      return {
        category: 'Mobile Responsiveness Analysis',
        subcategory: 'Responsive Design Heuristics',
        ...analysis,
        metadata: {
          analyzer: 'ResponsivenessAnalyzer',
          version: '2.0.0',
          timestamp: new Date().toISOString(),
          processingTime: context.processingTime || 0
        }
      };
    } catch (error) {
      return this.handleAnalysisError(error);
    }
  }

  async analyzeResponsivePatterns(document) {
    const patterns = {};
    const styles = this.extractAllStyles(document);
    const html = document.documentElement.outerHTML;

    for (const [patternName, config] of Object.entries(this.responsivePatterns)) {
      const detected = this.detectPattern(config.pattern, styles, html);
      patterns[patternName] = {
        detected,
        confidence: detected ? this.calculatePatternConfidence(patternName, styles) : 0,
        implementation: this.analyzePatternImplementation(patternName, styles),
        weight: config.weight,
        description: config.description,
        examples: this.extractPatternExamples(patternName, styles)
      };
    }

    return patterns;
  }

  async analyzeBreakpoints(document) {
    const styles = this.extractAllStyles(document);
    const mediaQueries = this.extractMediaQueries(styles);
    
    const breakpoints = {
      queries: mediaQueries,
      strategy: this.evaluateBreakpointStrategy(mediaQueries),
      coverage: this.evaluateDeviceCoverage(mediaQueries),
      implementation: this.evaluateBreakpointImplementation(mediaQueries),
      consistency: this.evaluateBreakpointConsistency(mediaQueries)
    };

    return breakpoints;
  }

  async analyzeLayoutSystems(document) {
    const styles = this.extractAllStyles(document);
    
    const layouts = {
      flexbox: this.analyzeFlexboxUsage(styles),
      grid: this.analyzeGridUsage(styles),
      float: this.analyzeFloatUsage(styles),
      positioning: this.analyzePositioningUsage(styles),
      modern: this.evaluateModernLayoutAdoption(styles)
    };

    return layouts;
  }

  async analyzeResponsiveImages(document) {
    const images = document.querySelectorAll('img');
    const pictures = document.querySelectorAll('picture');
    
    const analysis = {
      total: images.length,
      responsive: 0,
      srcsetUsage: 0,
      pictureUsage: pictures.length,
      lazyLoading: 0,
      optimization: this.analyzeImageOptimization(images),
      recommendations: []
    };

    images.forEach(img => {
      if (img.hasAttribute('srcset')) {
        analysis.responsive++;
        analysis.srcsetUsage++;
      }
      if (img.hasAttribute('loading') && img.getAttribute('loading') === 'lazy') {
        analysis.lazyLoading++;
      }
    });

    analysis.responsivePercentage = analysis.total > 0 ? analysis.responsive / analysis.total : 1;
    analysis.lazyPercentage = analysis.total > 0 ? analysis.lazyLoading / analysis.total : 0;

    return analysis;
  }

  async analyzeResponsiveTypography(document) {
    const styles = this.extractAllStyles(document);
    
    const typography = {
      fluidTypography: this.detectFluidTypography(styles),
      scaleFactors: this.analyzeTypographicScale(styles),
      readability: this.analyzeTypographicReadability(styles),
      hierarchy: this.analyzeTypographicHierarchy(document)
    };

    return typography;
  }

  async analyzeResponsiveNavigation(document) {
    const navElements = document.querySelectorAll('nav, [role="navigation"]');
    
    const navigation = {
      patterns: this.identifyNavigationPatterns(navElements),
      hamburger: this.detectHamburgerMenu(document),
      collapsible: this.detectCollapsibleNavigation(document),
      touch: this.evaluateNavigationTouchOptimization(navElements),
      accessibility: this.evaluateNavigationAccessibility(navElements)
    };

    return navigation;
  }

  async analyzeResponsivePerformance(document) {
    const styles = this.extractAllStyles(document);
    
    const performance = {
      cssSize: this.calculateCSSSize(styles),
      mediaQueryComplexity: this.evaluateMediaQueryComplexity(styles),
      layoutShifts: this.predictLayoutShifts(document),
      optimization: this.evaluatePerformanceOptimization(styles)
    };

    return performance;
  }

  extractAllStyles(document) {
    const styleElements = document.querySelectorAll('style');
    const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
    
    let styles = Array.from(styleElements).map(style => style.textContent).join('\n');
    
    // Note: External stylesheets would need to be fetched separately
    // This is a simplified version for inline styles
    
    return styles;
  }

  extractMediaQueries(styles) {
    const mediaQueryRegex = /@media[^{]+\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
    const queries = styles.match(mediaQueryRegex) || [];
    
    return queries.map(query => {
      const conditionMatch = query.match(/@media\s+([^{]+)/);
      const condition = conditionMatch ? conditionMatch[1].trim() : '';
      
      return {
        condition,
        rules: this.extractRulesFromMediaQuery(query),
        complexity: this.calculateQueryComplexity(condition)
      };
    });
  }

  evaluateBreakpointStrategy(mediaQueries) {
    const breakpoints = new Set();
    const approach = { mobileFirst: 0, desktopFirst: 0 };
    
    mediaQueries.forEach(query => {
      const condition = query.condition.toLowerCase();
      
      if (condition.includes('min-width')) {
        approach.mobileFirst++;
        const widthMatch = condition.match(/min-width:\s*(\d+)/);
        if (widthMatch) breakpoints.add(parseInt(widthMatch[1]));
      }
      
      if (condition.includes('max-width')) {
        approach.desktopFirst++;
        const widthMatch = condition.match(/max-width:\s*(\d+)/);
        if (widthMatch) breakpoints.add(parseInt(widthMatch[1]));
      }
    });

    return {
      breakpointCount: breakpoints.size,
      uniqueBreakpoints: Array.from(breakpoints).sort((a, b) => a - b),
      approach: approach.mobileFirst > approach.desktopFirst ? 'mobile-first' : 'desktop-first',
      consistency: this.evaluateBreakpointConsistency(Array.from(breakpoints))
    };
  }

  evaluateDeviceCoverage(mediaQueries) {
    const coverage = {
      mobile: false,
      tablet: false,
      desktop: false,
      large: false
    };

    mediaQueries.forEach(query => {
      const condition = query.condition.toLowerCase();
      const widthMatch = condition.match(/(?:min-width|max-width):\s*(\d+)/);
      
      if (widthMatch) {
        const width = parseInt(widthMatch[1]);
        
        if (width <= 767) coverage.mobile = true;
        if (width >= 768 && width <= 1023) coverage.tablet = true;
        if (width >= 1024 && width <= 1439) coverage.desktop = true;
        if (width >= 1440) coverage.large = true;
      }
    });

    const coverageScore = Object.values(coverage).filter(Boolean).length / Object.keys(coverage).length;
    
    return { ...coverage, score: coverageScore };
  }

  analyzeFlexboxUsage(styles) {
    const flexPatterns = [
      /display:\s*flex/g,
      /flex-direction/g,
      /justify-content/g,
      /align-items/g,
      /flex-wrap/g,
      /flex-grow|flex-shrink|flex-basis/g
    ];

    const usage = flexPatterns.map(pattern => {
      const matches = styles.match(pattern) || [];
      return matches.length;
    });

    const totalUsage = usage.reduce((sum, count) => sum + count, 0);
    
    return {
      usage,
      totalUsage,
      sophistication: this.calculateFlexboxSophistication(usage),
      recommendation: totalUsage > 0 ? 'Good flexbox usage detected' : 'Consider using flexbox for flexible layouts'
    };
  }

  analyzeGridUsage(styles) {
    const gridPatterns = [
      /display:\s*grid/g,
      /grid-template-columns/g,
      /grid-template-rows/g,
      /grid-gap|gap/g,
      /grid-area/g
    ];

    const usage = gridPatterns.map(pattern => {
      const matches = styles.match(pattern) || [];
      return matches.length;
    });

    const totalUsage = usage.reduce((sum, count) => sum + count, 0);
    
    return {
      usage,
      totalUsage,
      sophistication: this.calculateGridSophistication(usage),
      recommendation: totalUsage > 0 ? 'Modern CSS Grid usage detected' : 'Consider CSS Grid for complex layouts'
    };
  }

  detectFluidTypography(styles) {
    const fluidPatterns = [
      /font-size:\s*calc\(/g,
      /font-size:\s*clamp\(/g,
      /font-size:\s*\d+vw/g,
      /font-size:\s*\d+vh/g
    ];

    const detected = fluidPatterns.some(pattern => pattern.test(styles));
    const complexity = fluidPatterns.reduce((count, pattern) => {
      const matches = styles.match(pattern) || [];
      return count + matches.length;
    }, 0);

    return {
      detected,
      complexity,
      recommendation: detected ? 'Fluid typography implementation found' : 'Consider implementing fluid typography'
    };
  }

  identifyNavigationPatterns(navElements) {
    const patterns = [];
    
    navElements.forEach(nav => {
      const classList = Array.from(nav.classList);
      const hasHamburger = nav.querySelector('.hamburger, .menu-toggle, [data-toggle="menu"]');
      const hasDropdown = nav.querySelector('.dropdown, .submenu');
      const hasCollapse = nav.querySelector('.collapse, .collapsible');
      
      if (hasHamburger) patterns.push('hamburger');
      if (hasDropdown) patterns.push('dropdown');
      if (hasCollapse) patterns.push('collapsible');
      if (classList.some(cls => cls.includes('responsive'))) patterns.push('responsive');
    });

    return [...new Set(patterns)];
  }

  calculateResponsivenessScore(analysis) {
    const patternScore = this.calculatePatternScore(analysis.patterns);
    const breakpointScore = analysis.breakpoints.coverage.score;
    const layoutScore = this.calculateLayoutScore(analysis.layouts);
    const imageScore = analysis.images.responsivePercentage;
    
    const weights = { patterns: 0.3, breakpoints: 0.25, layouts: 0.25, images: 0.2 };
    
    return (
      patternScore * weights.patterns +
      breakpointScore * weights.breakpoints +
      layoutScore * weights.layouts +
      imageScore * weights.images
    );
  }

  calculatePatternScore(patterns) {
    let totalWeight = 0;
    let weightedScore = 0;

    for (const pattern of Object.values(patterns)) {
      totalWeight += pattern.weight;
      weightedScore += pattern.detected ? pattern.confidence * pattern.weight : 0;
    }

    return totalWeight > 0 ? weightedScore / totalWeight : 0;
  }

  calculateLayoutScore(layouts) {
    const modernUsage = layouts.flexbox.totalUsage + layouts.grid.totalUsage;
    const legacyUsage = layouts.float.totalUsage;
    
    if (modernUsage === 0 && legacyUsage === 0) return 0.5;
    
    const modernRatio = modernUsage / (modernUsage + legacyUsage);
    return Math.min(1, modernRatio * 1.2); // Bonus for modern layout usage
  }

  generateResponsivenessRecommendations(analysis) {
    const recommendations = [];

    // Pattern recommendations
    for (const [patternName, pattern] of Object.entries(analysis.patterns)) {
      if (!pattern.detected) {
        recommendations.push({
          type: 'pattern',
          priority: this.getPatternPriority(patternName),
          category: 'Responsive Pattern',
          issue: `Missing ${pattern.description}`,
          recommendation: this.getPatternRecommendation(patternName),
          impact: 'medium'
        });
      }
    }

    // Breakpoint recommendations
    if (analysis.breakpoints.coverage.score < 0.75) {
      recommendations.push({
        type: 'breakpoint',
        priority: 'high',
        category: 'Device Coverage',
        issue: 'Incomplete device coverage',
        recommendation: 'Add breakpoints for missing device categories',
        impact: 'high'
      });
    }

    // Image recommendations
    if (analysis.images.responsivePercentage < 0.8) {
      recommendations.push({
        type: 'image',
        priority: 'medium',
        category: 'Responsive Images',
        issue: 'Non-responsive images detected',
        recommendation: 'Implement srcset and responsive image techniques',
        impact: 'medium'
      });
    }

    // Layout recommendations
    const modernLayoutUsage = analysis.layouts.flexbox.totalUsage + analysis.layouts.grid.totalUsage;
    if (modernLayoutUsage === 0) {
      recommendations.push({
        type: 'layout',
        priority: 'medium',
        category: 'Modern Layouts',
        issue: 'No modern layout techniques detected',
        recommendation: 'Implement CSS Flexbox and Grid for better responsive layouts',
        impact: 'medium'
      });
    }

    return recommendations;
  }

  // Utility methods
  detectPattern(pattern, styles, html) {
    return pattern.test(styles) || pattern.test(html);
  }

  calculatePatternConfidence(patternName, styles) {
    // Simplified confidence calculation
    return 0.8;
  }

  analyzePatternImplementation(patternName, styles) {
    return 'partial'; // Simplified
  }

  extractPatternExamples(patternName, styles) {
    return []; // Simplified
  }

  extractRulesFromMediaQuery(query) {
    return []; // Simplified
  }

  calculateQueryComplexity(condition) {
    const operators = (condition.match(/and|or|not/g) || []).length;
    const conditions = (condition.match(/\w+:/g) || []).length;
    return operators + conditions;
  }

  evaluateBreakpointImplementation(mediaQueries) {
    return 'good'; // Simplified
  }

  evaluateBreakpointConsistency(breakpoints) {
    if (breakpoints.length <= 1) return 1;
    
    const gaps = [];
    for (let i = 1; i < breakpoints.length; i++) {
      gaps.push(breakpoints[i] - breakpoints[i-1]);
    }
    
    const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length;
    
    return Math.max(0, 1 - (variance / (avgGap * avgGap)));
  }

  calculateFlexboxSophistication(usage) {
    const [display, direction, justify, align, wrap, properties] = usage;
    const sophisticationScore = (direction + justify + align + wrap + properties) / (display || 1);
    return Math.min(1, sophisticationScore / 3);
  }

  calculateGridSophistication(usage) {
    const [display, columns, rows, gap, area] = usage;
    const sophisticationScore = (columns + rows + gap + area) / (display || 1);
    return Math.min(1, sophisticationScore / 2);
  }

  analyzeFloatUsage(styles) {
    const floatMatches = styles.match(/float:\s*(?:left|right)/g) || [];
    return {
      totalUsage: floatMatches.length,
      recommendation: floatMatches.length > 0 ? 'Consider replacing floats with modern layout methods' : 'No float-based layouts detected'
    };
  }

  analyzePositioningUsage(styles) {
    const positionMatches = styles.match(/position:\s*(?:absolute|fixed|relative)/g) || [];
    return {
      totalUsage: positionMatches.length,
      sophistication: 0.5 // Simplified
    };
  }

  evaluateModernLayoutAdoption(styles) {
    const flexUsage = (styles.match(/display:\s*flex/g) || []).length;
    const gridUsage = (styles.match(/display:\s*grid/g) || []).length;
    const floatUsage = (styles.match(/float:/g) || []).length;
    
    const modernUsage = flexUsage + gridUsage;
    const totalUsage = modernUsage + floatUsage;
    
    return totalUsage > 0 ? modernUsage / totalUsage : 0.5;
  }

  analyzeImageOptimization(images) {
    let optimized = 0;
    const total = images.length;
    
    images.forEach(img => {
      if (img.hasAttribute('srcset') || img.hasAttribute('sizes') || img.loading === 'lazy') {
        optimized++;
      }
    });
    
    return {
      total,
      optimized,
      percentage: total > 0 ? optimized / total : 1
    };
  }

  analyzeTypographicScale(styles) {
    const fontSizes = styles.match(/font-size:\s*[\d.]+(?:px|em|rem|%)/g) || [];
    const uniqueSizes = [...new Set(fontSizes)];
    
    return {
      totalSizes: fontSizes.length,
      uniqueSizes: uniqueSizes.length,
      consistency: uniqueSizes.length <= 8 ? 'good' : 'too-many-sizes'
    };
  }

  analyzeTypographicReadability(styles) {
    const lineHeights = styles.match(/line-height:\s*[\d.]+/g) || [];
    const hasReadableLineHeight = lineHeights.some(lh => {
      const value = parseFloat(lh.match(/[\d.]+/)[0]);
      return value >= 1.4 && value <= 1.6;
    });
    
    return {
      hasOptimalLineHeight: hasReadableLineHeight,
      recommendation: hasReadableLineHeight ? 'Good line height detected' : 'Consider optimal line-height values (1.4-1.6)'
    };
  }

  analyzeTypographicHierarchy(document) {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const hierarchy = {};
    
    headings.forEach(heading => {
      const tag = heading.tagName.toLowerCase();
      hierarchy[tag] = (hierarchy[tag] || 0) + 1;
    });
    
    return {
      structure: hierarchy,
      hasH1: !!hierarchy.h1,
      logicalOrder: this.validateHeadingOrder(headings),
      recommendation: this.getHierarchyRecommendation(hierarchy)
    };
  }

  detectHamburgerMenu(document) {
    const selectors = [
      '.hamburger',
      '.menu-toggle',
      '.nav-toggle',
      '[data-toggle="menu"]',
      '.mobile-menu-trigger'
    ];
    
    return selectors.some(selector => document.querySelector(selector) !== null);
  }

  detectCollapsibleNavigation(document) {
    const selectors = [
      '.collapse',
      '.collapsible',
      '[data-collapse]',
      '.accordion'
    ];
    
    return selectors.some(selector => document.querySelector(selector) !== null);
  }

  evaluateNavigationTouchOptimization(navElements) {
    let optimizedCount = 0;
    
    navElements.forEach(nav => {
      const links = nav.querySelectorAll('a, button');
      const hasGoodSpacing = this.checkTouchTargetSpacing(links);
      if (hasGoodSpacing) optimizedCount++;
    });
    
    return {
      total: navElements.length,
      optimized: optimizedCount,
      percentage: navElements.length > 0 ? optimizedCount / navElements.length : 1
    };
  }

  evaluateNavigationAccessibility(navElements) {
    let accessibleCount = 0;
    
    navElements.forEach(nav => {
      const hasAriaLabels = nav.hasAttribute('aria-label') || nav.hasAttribute('aria-labelledby');
      const hasSkipLink = document.querySelector('a[href="#main"], .skip-link');
      const hasFocusManagement = nav.querySelector('[tabindex]');
      
      if (hasAriaLabels || hasSkipLink || hasFocusManagement) {
        accessibleCount++;
      }
    });
    
    return {
      total: navElements.length,
      accessible: accessibleCount,
      percentage: navElements.length > 0 ? accessibleCount / navElements.length : 1
    };
  }

  calculateCSSSize(styles) {
    return {
      characters: styles.length,
      estimatedKB: Math.round(styles.length / 1024 * 100) / 100,
      recommendation: styles.length > 100000 ? 'Consider CSS optimization' : 'CSS size is reasonable'
    };
  }

  evaluateMediaQueryComplexity(styles) {
    const mediaQueries = this.extractMediaQueries(styles);
    const avgComplexity = mediaQueries.reduce((sum, query) => sum + query.complexity, 0) / mediaQueries.length;
    
    return {
      totalQueries: mediaQueries.length,
      averageComplexity: avgComplexity || 0,
      recommendation: avgComplexity > 3 ? 'Simplify media query conditions' : 'Media query complexity is reasonable'
    };
  }

  predictLayoutShifts(document) {
    const images = document.querySelectorAll('img:not([width]):not([height])');
    const iframes = document.querySelectorAll('iframe:not([width]):not([height])');
    
    return {
      potentialShifts: images.length + iframes.length,
      recommendation: images.length + iframes.length > 0 ? 'Add dimensions to prevent layout shifts' : 'Good layout shift prevention'
    };
  }

  evaluatePerformanceOptimization(styles) {
    const criticalPatterns = [
      /will-change/g,
      /contain:/g,
      /transform3d/g,
      /translateZ/g
    ];
    
    const optimizations = criticalPatterns.map(pattern => (styles.match(pattern) || []).length);
    const totalOptimizations = optimizations.reduce((sum, count) => sum + count, 0);
    
    return {
      optimizations,
      total: totalOptimizations,
      recommendation: totalOptimizations > 0 ? 'Performance optimizations detected' : 'Consider adding performance optimizations'
    };
  }

  checkTouchTargetSpacing(links) {
    // Simplified check - in real implementation would measure actual spacing
    return links.length <= 7; // Assume good spacing if not too many links
  }

  validateHeadingOrder(headings) {
    let currentLevel = 0;
    let isValid = true;
    
    Array.from(headings).forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > currentLevel + 1) {
        isValid = false;
      }
      currentLevel = level;
    });
    
    return isValid;
  }

  getHierarchyRecommendation(hierarchy) {
    if (!hierarchy.h1) return 'Add an H1 heading for proper document structure';
    if (Object.keys(hierarchy).length > 4) return 'Consider simplifying heading structure';
    return 'Good heading hierarchy detected';
  }

  getPatternPriority(patternName) {
    const priorities = {
      mobileFirst: 'high',
      fluidLayouts: 'high',
      responsiveImages: 'medium',
      adaptiveContent: 'low',
      touchOptimization: 'medium'
    };
    return priorities[patternName] || 'medium';
  }

  getPatternRecommendation(patternName) {
    const recommendations = {
      mobileFirst: 'Implement mobile-first responsive design approach',
      fluidLayouts: 'Use flexible units and modern layout systems (Flexbox, Grid)',
      responsiveImages: 'Implement responsive images with srcset and picture elements',
      adaptiveContent: 'Consider adaptive content strategies for different screen sizes',
      touchOptimization: 'Optimize touch interactions and eliminate hover-dependent features'
    };
    return recommendations[patternName] || 'Implement this responsive pattern';
  }

  handleAnalysisError(error) {
    return {
      category: 'Mobile Responsiveness Analysis',
      subcategory: 'Analysis Error',
      error: error.message,
      score: 0,
      recommendations: [{
        type: 'error',
        priority: 'high',
        issue: 'Analysis failed',
        recommendation: 'Review responsive design implementation'
      }]
    };
  }
}
