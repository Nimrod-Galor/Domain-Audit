/**
 * ============================================================================
 * MOBILE FRIENDLINESS DETECTOR - GPT-5 STYLE MODULAR COMPONENT
 * ============================================================================
 * 
 * Advanced mobile-friendly website analysis for technical optimization
 * Part of the Combined Approach Technical Analyzer (9th Implementation)
 * 
 * Features:
 * - Responsive design assessment
 * - Touch-friendly interface analysis
 * - Mobile viewport optimization
 * - Mobile UX best practices validation
 * - Performance considerations for mobile
 * - Mobile accessibility evaluation
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration Combined Approach Pattern - GPT-5 Style Detector
 */

export class MobileFriendlinessDetector {
  constructor(config = {}) {
    this.config = {
      enableResponsiveAnalysis: config.enableResponsiveAnalysis !== false,
      enableTouchAnalysis: config.enableTouchAnalysis !== false,
      enablePerformanceAnalysis: config.enablePerformanceAnalysis !== false,
      enableAccessibilityAnalysis: config.enableAccessibilityAnalysis !== false,
      touchTargetMinSize: config.touchTargetMinSize || 44,
      viewportBreakpoints: config.viewportBreakpoints || [320, 768, 1024, 1200],
      detailedAnalysis: config.detailedAnalysis !== false,
      ...config
    };

    this.version = '1.0.0';
    this.detectorType = 'mobile_friendliness';
    
    // Mobile standards and best practices
    this.standards = {
      viewport: {
        required: ['width=device-width', 'initial-scale=1'],
        recommended: ['user-scalable=yes', 'viewport-fit=cover'],
        deprecated: ['target-densitydpi', 'user-scalable=no']
      },
      touchTargets: {
        minSize: 44, // pixels
        recommendedSize: 48,
        minSpacing: 8,
        clickableElements: ['button', 'a', 'input', 'select', 'textarea']
      },
      responsive: {
        breakpoints: [320, 768, 1024, 1200],
        fluidImages: true,
        flexibleLayouts: true,
        mediaQueries: true
      },
      performance: {
        maxImageSize: 1024, // KB
        maxFontFiles: 4,
        criticalResources: 3,
        lazyLoading: true
      },
      content: {
        maxLineLength: 70, // characters
        minFontSize: 16, // pixels
        maxPopups: 1,
        horizontalScrolling: false
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
      name: 'MobileFriendlinessDetector',
      version: this.version,
      type: this.detectorType,
      description: 'Analyzes mobile-friendliness and responsive design for optimal mobile experience',
      capabilities: [
        'responsive_design_assessment',
        'touch_interface_analysis',
        'mobile_viewport_optimization',
        'mobile_ux_validation',
        'mobile_performance_analysis',
        'mobile_accessibility_evaluation'
      ],
      standards: Object.keys(this.standards),
      performance: 'High',
      accuracy: 'GPT-5 Enhanced'
    };
  }

  /**
   * Detect mobile friendliness components
   * @param {Object} context - Analysis context containing document and metadata
   * @returns {Promise<Object>} Mobile friendliness detection results
   */
  async detect(context) {
    try {
      const { document, url, pageData } = context;
      
      if (!document) {
        throw new Error('Document is required for mobile friendliness analysis');
      }

      // Check cache
      const cacheKey = this._generateCacheKey(url);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const startTime = Date.now();

      // Phase 1: Viewport configuration analysis
      const viewportAnalysis = this._analyzeViewport(document);

      // Phase 2: Responsive design analysis
      const responsiveAnalysis = this._analyzeResponsiveDesign(document);

      // Phase 3: Touch interface analysis
      const touchAnalysis = this._analyzeTouchInterface(document);

      // Phase 4: Mobile UX analysis
      const uxAnalysis = this._analyzeMobileUX(document);

      // Phase 5: Mobile performance analysis
      const performanceAnalysis = this._analyzeMobilePerformance(document);

      // Phase 6: Mobile accessibility analysis
      const accessibilityAnalysis = this._analyzeMobileAccessibility(document);

      // Calculate overall mobile friendliness score
      const overallScore = this._calculateMobileScore({
        viewport: viewportAnalysis,
        responsive: responsiveAnalysis,
        touch: touchAnalysis,
        ux: uxAnalysis,
        performance: performanceAnalysis,
        accessibility: accessibilityAnalysis
      });

      // Compile comprehensive results
      const results = {
        success: true,
        detectorType: this.detectorType,
        
        // Core analysis results
        viewport: viewportAnalysis,
        responsive: responsiveAnalysis,
        touch: touchAnalysis,
        ux: uxAnalysis,
        performance: performanceAnalysis,
        accessibility: accessibilityAnalysis,
        
        // Overall assessment
        score: overallScore.score,
        grade: overallScore.grade,
        level: overallScore.level,
        mobileFriendly: overallScore.score >= 70,
        
        // Strategic insights
        insights: this._generateMobileInsights({
          viewport: viewportAnalysis,
          responsive: responsiveAnalysis,
          touch: touchAnalysis,
          ux: uxAnalysis,
          performance: performanceAnalysis,
          accessibility: accessibilityAnalysis
        }),
        
        recommendations: this._generateMobileRecommendations({
          viewport: viewportAnalysis,
          responsive: responsiveAnalysis,
          touch: touchAnalysis,
          ux: uxAnalysis,
          performance: performanceAnalysis,
          accessibility: accessibilityAnalysis
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
        error: `Mobile friendliness detection failed: ${error.message}`,
        detectorType: this.detectorType
      };
    }
  }

  /**
   * Analyze viewport configuration
   * @param {Document} document - DOM document
   * @returns {Object} Viewport analysis results
   */
  _analyzeViewport(document) {
    const analysis = {
      hasViewport: false,
      isResponsive: false,
      configuration: {},
      compliance: {},
      issues: [],
      recommendations: []
    };

    try {
      // Find viewport meta tag
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      
      if (!viewportMeta) {
        analysis.issues.push('Missing viewport meta tag');
        analysis.recommendations.push('Add responsive viewport meta tag');
        return { ...analysis, score: 0, grade: 'F' };
      }

      analysis.hasViewport = true;
      const content = viewportMeta.getAttribute('content') || '';
      analysis.configuration = this._parseViewportContent(content);

      // Check responsiveness
      analysis.isResponsive = this._checkResponsiveViewport(analysis.configuration);

      // Check compliance with mobile standards
      analysis.compliance = {
        hasDeviceWidth: analysis.configuration.width === 'device-width',
        hasInitialScale: analysis.configuration['initial-scale'] === '1',
        allowsZoom: analysis.configuration['user-scalable'] !== 'no',
        noDeprecated: !analysis.configuration['target-densitydpi']
      };

      // Generate specific issues and recommendations
      if (!analysis.compliance.hasDeviceWidth) {
        analysis.issues.push('Viewport width not set to device-width');
        analysis.recommendations.push('Set viewport width to device-width for responsive design');
      }

      if (!analysis.compliance.hasInitialScale) {
        analysis.issues.push('Initial scale not properly configured');
        analysis.recommendations.push('Set initial-scale to 1 for proper mobile rendering');
      }

      if (!analysis.compliance.allowsZoom) {
        analysis.issues.push('User scaling disabled (accessibility issue)');
        analysis.recommendations.push('Allow user scaling for accessibility compliance');
      }

      if (!analysis.compliance.noDeprecated) {
        analysis.issues.push('Deprecated viewport attributes detected');
        analysis.recommendations.push('Remove deprecated target-densitydpi attribute');
      }

      // Calculate viewport score
      const score = this._calculateViewportScore(analysis);
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
   * Analyze responsive design
   * @param {Document} document - DOM document
   * @returns {Object} Responsive design analysis results
   */
  _analyzeResponsiveDesign(document) {
    const analysis = {
      hasMediaQueries: false,
      hasFlexbox: false,
      hasGrid: false,
      hasResponsiveImages: false,
      hasFluidLayouts: false,
      cssFeatures: {},
      issues: [],
      recommendations: []
    };

    try {
      // Analyze CSS for responsive features
      const stylesheets = document.querySelectorAll('style, link[rel="stylesheet"]');
      let cssContent = '';

      // Extract inline CSS
      const styleElements = document.querySelectorAll('style');
      styleElements.forEach(style => {
        cssContent += style.textContent || '';
      });

      // Check for responsive CSS features
      analysis.hasMediaQueries = /@media/.test(cssContent);
      analysis.hasFlexbox = /display:\s*flex|display:\s*inline-flex/.test(cssContent);
      analysis.hasGrid = /display:\s*grid|display:\s*inline-grid/.test(cssContent);
      
      // Check for responsive images
      const images = document.querySelectorAll('img');
      const responsiveImages = document.querySelectorAll('img[srcset], picture, img[sizes]');
      analysis.hasResponsiveImages = responsiveImages.length > 0;

      // Check for fluid layouts
      analysis.hasFluidLayouts = /width:\s*100%|max-width:\s*100%/.test(cssContent) ||
                                /width:\s*\d+vw|width:\s*\d+%/.test(cssContent);

      // Analyze CSS features in detail
      analysis.cssFeatures = {
        mediaQueries: (cssContent.match(/@media/g) || []).length,
        flexboxUsage: (cssContent.match(/display:\s*flex/g) || []).length,
        gridUsage: (cssContent.match(/display:\s*grid/g) || []).length,
        viewportUnits: (cssContent.match(/\d+v[wh]/g) || []).length,
        percentageWidths: (cssContent.match(/width:\s*\d+%/g) || []).length
      };

      // Check for responsive breakpoints
      const breakpointMatches = cssContent.match(/@media[^{]*\(.*?width[^)]*\)/g) || [];
      const detectedBreakpoints = breakpointMatches.map(match => {
        const widthMatch = match.match(/(\d+)px/);
        return widthMatch ? parseInt(widthMatch[1]) : null;
      }).filter(Boolean);

      analysis.breakpoints = [...new Set(detectedBreakpoints)].sort((a, b) => a - b);

      // Generate recommendations
      if (!analysis.hasMediaQueries) {
        analysis.issues.push('No responsive media queries detected');
        analysis.recommendations.push('Implement CSS media queries for responsive design');
      }

      if (!analysis.hasResponsiveImages && images.length > 0) {
        analysis.issues.push('Images not optimized for responsive design');
        analysis.recommendations.push('Use srcset and sizes attributes for responsive images');
      }

      if (!analysis.hasFlexbox && !analysis.hasGrid) {
        analysis.recommendations.push('Consider using modern CSS layout methods (Flexbox or Grid)');
      }

      if (analysis.breakpoints.length < 2) {
        analysis.recommendations.push('Add more responsive breakpoints for better device coverage');
      }

      // Check for mobile-first approach
      const mobileFirstPattern = /@media[^{]*min-width/;
      const desktopFirstPattern = /@media[^{]*max-width/;
      
      if (desktopFirstPattern.test(cssContent) && !mobileFirstPattern.test(cssContent)) {
        analysis.recommendations.push('Consider adopting mobile-first responsive design approach');
      }

      // Calculate responsive score
      const score = this._calculateResponsiveScore(analysis);
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
   * Analyze touch interface
   * @param {Document} document - DOM document
   * @returns {Object} Touch interface analysis results
   */
  _analyzeTouchInterface(document) {
    const analysis = {
      touchTargets: { total: 0, appropriate: 0, small: 0 },
      spacing: { adequate: 0, insufficient: 0 },
      interactiveElements: [],
      issues: [],
      recommendations: []
    };

    try {
      // Find all interactive elements
      const interactiveSelectors = [
        'a[href]', 'button', 'input[type="button"]', 'input[type="submit"]',
        'input[type="checkbox"]', 'input[type="radio"]', 'select',
        '[onclick]', '[role="button"]', '.btn', '.button'
      ];

      const interactiveElements = document.querySelectorAll(interactiveSelectors.join(', '));
      analysis.touchTargets.total = interactiveElements.length;

      interactiveElements.forEach((element, index) => {
        const elementData = this._analyzeInteractiveElement(element, document);
        analysis.interactiveElements.push(elementData);

        // Categorize touch target size
        if (elementData.size >= this.standards.touchTargets.recommendedSize) {
          analysis.touchTargets.appropriate++;
        } else if (elementData.size < this.standards.touchTargets.minSize) {
          analysis.touchTargets.small++;
        }

        // Check spacing
        if (elementData.spacing >= this.standards.touchTargets.minSpacing) {
          analysis.spacing.adequate++;
        } else {
          analysis.spacing.insufficient++;
        }
      });

      // Generate issues and recommendations
      const smallTargetPercentage = analysis.touchTargets.total > 0 ? 
        (analysis.touchTargets.small / analysis.touchTargets.total) * 100 : 0;

      if (smallTargetPercentage > 30) {
        analysis.issues.push(`${smallTargetPercentage.toFixed(1)}% of touch targets are too small`);
        analysis.recommendations.push('Increase size of touch targets to at least 44px');
      }

      const insufficientSpacingPercentage = analysis.touchTargets.total > 0 ?
        (analysis.spacing.insufficient / analysis.touchTargets.total) * 100 : 0;

      if (insufficientSpacingPercentage > 25) {
        analysis.issues.push('Insufficient spacing between touch targets');
        analysis.recommendations.push('Add adequate spacing between interactive elements');
      }

      // Check for touch-specific features
      const hasTouchEvents = document.documentElement.innerHTML.includes('touch');
      if (!hasTouchEvents && interactiveElements.length > 5) {
        analysis.recommendations.push('Consider implementing touch-specific event handlers');
      }

      // Check for hover effects without touch alternatives
      const cssContent = Array.from(document.querySelectorAll('style')).map(s => s.textContent).join('');
      const hasHoverEffects = /:hover/.test(cssContent);
      const hasTouchEffects = /:active|:focus/.test(cssContent);

      if (hasHoverEffects && !hasTouchEffects) {
        analysis.recommendations.push('Provide touch alternatives for hover effects');
      }

      // Calculate touch score
      const score = this._calculateTouchScore(analysis);
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
   * Analyze mobile UX
   * @param {Document} document - DOM document
   * @returns {Object} Mobile UX analysis results
   */
  _analyzeMobileUX(document) {
    const analysis = {
      textReadability: {},
      navigation: {},
      content: {},
      forms: {},
      issues: [],
      recommendations: []
    };

    try {
      // Analyze text readability
      analysis.textReadability = this._analyzeTextReadability(document);

      // Analyze navigation for mobile
      analysis.navigation = this._analyzeMobileNavigation(document);

      // Analyze content layout
      analysis.content = this._analyzeContentLayout(document);

      // Analyze form usability
      analysis.forms = this._analyzeFormUsability(document);

      // Generate recommendations based on analysis
      if (analysis.textReadability.smallTextPercentage > 30) {
        analysis.issues.push('Text too small for mobile reading');
        analysis.recommendations.push('Increase font sizes for better mobile readability');
      }

      if (!analysis.navigation.hasMobileMenu && analysis.navigation.desktopItems > 5) {
        analysis.issues.push('No mobile-optimized navigation detected');
        analysis.recommendations.push('Implement collapsible mobile navigation');
      }

      if (analysis.content.horizontalScrolling) {
        analysis.issues.push('Horizontal scrolling detected');
        analysis.recommendations.push('Ensure content fits within viewport width');
      }

      if (analysis.forms.hasUnoptimizedInputs) {
        analysis.issues.push('Form inputs not optimized for mobile');
        analysis.recommendations.push('Use appropriate input types and larger form controls');
      }

      // Check for mobile-unfriendly features
      const flashContent = document.querySelectorAll('object[type*="flash"], embed[type*="flash"]');
      if (flashContent.length > 0) {
        analysis.issues.push('Flash content detected (not supported on mobile)');
        analysis.recommendations.push('Replace Flash content with HTML5 alternatives');
      }

      // Check for pop-ups and interstitials
      const popups = document.querySelectorAll('.popup, .modal, .overlay, [role="dialog"]');
      if (popups.length > 1) {
        analysis.issues.push('Multiple pop-ups detected');
        analysis.recommendations.push('Minimize use of pop-ups on mobile devices');
      }

      // Calculate mobile UX score
      const score = this._calculateMobileUXScore(analysis);
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
   * Analyze mobile performance considerations
   * @param {Document} document - DOM document
   * @returns {Object} Mobile performance analysis results
   */
  _analyzeMobilePerformance(document) {
    const analysis = {
      images: { total: 0, optimized: 0, lazy: 0 },
      resources: { scripts: 0, styles: 0, fonts: 0 },
      compression: {},
      issues: [],
      recommendations: []
    };

    try {
      // Analyze images
      const images = document.querySelectorAll('img');
      analysis.images.total = images.length;

      images.forEach(img => {
        // Check for responsive images
        if (img.hasAttribute('srcset') || img.hasAttribute('sizes')) {
          analysis.images.optimized++;
        }
        
        // Check for lazy loading
        if (img.hasAttribute('loading') && img.getAttribute('loading') === 'lazy') {
          analysis.images.lazy++;
        }
      });

      // Analyze resource loading
      analysis.resources.scripts = document.querySelectorAll('script[src]').length;
      analysis.resources.styles = document.querySelectorAll('link[rel="stylesheet"]').length;
      
      // Estimate font files (common font formats)
      const fontLinks = document.querySelectorAll('link[href*=".woff"], link[href*=".ttf"], link[href*="font"]');
      analysis.resources.fonts = fontLinks.length;

      // Check for critical resource optimization
      const criticalResources = document.querySelectorAll('link[rel="preload"], link[rel="prefetch"]');
      analysis.hasCriticalResourceOptimization = criticalResources.length > 0;

      // Generate performance recommendations
      if (analysis.images.total > 0 && analysis.images.optimized === 0) {
        analysis.issues.push('Images not optimized for responsive delivery');
        analysis.recommendations.push('Implement responsive images with srcset');
      }

      if (analysis.images.total > 5 && analysis.images.lazy === 0) {
        analysis.recommendations.push('Implement lazy loading for images');
      }

      if (analysis.resources.scripts > 5) {
        analysis.issues.push('High number of JavaScript files');
        analysis.recommendations.push('Consider bundling and minifying JavaScript files');
      }

      if (analysis.resources.fonts > this.standards.performance.maxFontFiles) {
        analysis.issues.push('Too many font files loading');
        analysis.recommendations.push('Reduce number of font files and use font-display: swap');
      }

      if (!analysis.hasCriticalResourceOptimization) {
        analysis.recommendations.push('Use resource hints (preload, prefetch) for critical resources');
      }

      // Calculate mobile performance score
      const score = this._calculateMobilePerformanceScore(analysis);
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
   * Analyze mobile accessibility
   * @param {Document} document - DOM document
   * @returns {Object} Mobile accessibility analysis results
   */
  _analyzeMobileAccessibility(document) {
    const analysis = {
      touchTargets: {},
      keyboard: {},
      screenReader: {},
      contrast: {},
      issues: [],
      recommendations: []
    };

    try {
      // Analyze touch target accessibility
      analysis.touchTargets = this._analyzeTouchTargetAccessibility(document);

      // Analyze keyboard navigation
      analysis.keyboard = this._analyzeKeyboardNavigation(document);

      // Analyze screen reader compatibility
      analysis.screenReader = this._analyzeScreenReaderCompatibility(document);

      // Basic contrast analysis (simplified)
      analysis.contrast = this._analyzeBasicContrast(document);

      // Generate accessibility recommendations
      if (analysis.touchTargets.inadequateSize > 0) {
        analysis.issues.push('Touch targets too small for accessibility guidelines');
        analysis.recommendations.push('Ensure touch targets are at least 44x44px');
      }

      if (!analysis.keyboard.hasSkipLinks) {
        analysis.recommendations.push('Add skip navigation links for keyboard users');
      }

      if (analysis.screenReader.missingAltText > 0) {
        analysis.issues.push('Images missing alt text');
        analysis.recommendations.push('Add descriptive alt text to all images');
      }

      if (!analysis.screenReader.hasLandmarks) {
        analysis.recommendations.push('Use ARIA landmarks for better screen reader navigation');
      }

      // Calculate mobile accessibility score
      const score = this._calculateMobileAccessibilityScore(analysis);
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

  _parseViewportContent(content) {
    const attributes = {};
    const parts = content.split(',').map(part => part.trim());
    
    parts.forEach(part => {
      const [key, value] = part.split('=').map(s => s.trim());
      if (key && value) {
        attributes[key] = value;
      }
    });
    
    return attributes;
  }

  _checkResponsiveViewport(config) {
    return config.width === 'device-width' || 
           config.width === '100vw' ||
           (config['initial-scale'] === '1' && !config.width);
  }

  _analyzeInteractiveElement(element, document) {
    // Get computed style would require browser environment
    // For now, use simplified size calculation
    const rect = element.getBoundingClientRect ? element.getBoundingClientRect() : { width: 20, height: 20 };
    const size = Math.min(rect.width, rect.height);
    
    // Simplified spacing calculation
    const spacing = 8; // Default assumption
    
    return {
      tagName: element.tagName,
      size: size,
      spacing: spacing,
      hasAriaLabel: element.hasAttribute('aria-label'),
      isKeyboardAccessible: element.hasAttribute('tabindex') || ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)
    };
  }

  _analyzeTextReadability(document) {
    const textElements = document.querySelectorAll('p, span, div, li, td, th');
    let smallTextCount = 0;
    
    // Simplified analysis - in real implementation would check computed styles
    textElements.forEach(element => {
      const style = element.style;
      const fontSize = style.fontSize;
      
      if (fontSize && parseInt(fontSize) < this.standards.content.minFontSize) {
        smallTextCount++;
      }
    });
    
    return {
      totalElements: textElements.length,
      smallTextCount: smallTextCount,
      smallTextPercentage: textElements.length > 0 ? (smallTextCount / textElements.length) * 100 : 0
    };
  }

  _analyzeMobileNavigation(document) {
    const nav = document.querySelector('nav');
    const mobileMenu = document.querySelector('.mobile-menu, .nav-toggle, [aria-label*="menu"]');
    const navItems = document.querySelectorAll('nav a, .nav a');
    
    return {
      hasMobileMenu: !!mobileMenu,
      desktopItems: navItems.length,
      hasHamburgerMenu: !!document.querySelector('.hamburger, .menu-icon'),
      hasCollapsibleNav: !!document.querySelector('.navbar-collapse, .nav-collapse')
    };
  }

  _analyzeContentLayout(document) {
    // Simplified content analysis
    const body = document.body;
    const hasFixedWidth = body && body.style.width && !body.style.width.includes('%');
    
    return {
      horizontalScrolling: hasFixedWidth,
      hasFluidLayout: !hasFixedWidth,
      hasResponsiveContainer: !!document.querySelector('.container-fluid, .responsive')
    };
  }

  _analyzeFormUsability(document) {
    const inputs = document.querySelectorAll('input, select, textarea');
    let unoptimizedInputs = 0;
    
    inputs.forEach(input => {
      const type = input.getAttribute('type');
      
      // Check for mobile-optimized input types
      if (type === 'text' && input.name && (input.name.includes('email') || input.name.includes('phone'))) {
        unoptimizedInputs++;
      }
    });
    
    return {
      totalInputs: inputs.length,
      unoptimizedInputs: unoptimizedInputs,
      hasUnoptimizedInputs: unoptimizedInputs > 0,
      hasLabels: document.querySelectorAll('label').length >= inputs.length * 0.8
    };
  }

  _analyzeTouchTargetAccessibility(document) {
    const interactiveElements = document.querySelectorAll('button, a[href], input, select, textarea');
    let inadequateSize = 0;
    
    // Simplified analysis
    interactiveElements.forEach(element => {
      // In real implementation, would check computed styles
      const hasSmallSize = element.classList.contains('small') || element.classList.contains('xs');
      if (hasSmallSize) {
        inadequateSize++;
      }
    });
    
    return {
      total: interactiveElements.length,
      inadequateSize: inadequateSize
    };
  }

  _analyzeKeyboardNavigation(document) {
    const skipLinks = document.querySelectorAll('a[href="#main"], .skip-link');
    const focusableElements = document.querySelectorAll('[tabindex], button, a[href], input, select, textarea');
    
    return {
      hasSkipLinks: skipLinks.length > 0,
      focusableElements: focusableElements.length,
      hasTabOrder: Array.from(focusableElements).some(el => el.hasAttribute('tabindex'))
    };
  }

  _analyzeScreenReaderCompatibility(document) {
    const images = document.querySelectorAll('img');
    const imagesWithAlt = document.querySelectorAll('img[alt]');
    const landmarks = document.querySelectorAll('[role], main, nav, header, footer, section, article');
    
    return {
      totalImages: images.length,
      imagesWithAltText: imagesWithAlt.length,
      missingAltText: images.length - imagesWithAlt.length,
      hasLandmarks: landmarks.length > 0,
      landmarkCount: landmarks.length
    };
  }

  _analyzeBasicContrast(document) {
    // Simplified contrast analysis
    const hasLightBackground = document.body && document.body.style.backgroundColor && 
                              document.body.style.backgroundColor.includes('white');
    
    return {
      analyzed: false, // Would require color analysis in full implementation
      hasLightBackground: hasLightBackground,
      recommendation: 'Use tools like WAVE or axe for detailed contrast analysis'
    };
  }

  _calculateMobileScore(components) {
    const weights = {
      viewport: 0.25,
      responsive: 0.20,
      touch: 0.20,
      ux: 0.15,
      performance: 0.10,
      accessibility: 0.10
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

  _calculateViewportScore(analysis) {
    let score = 100;
    
    if (!analysis.hasViewport) return 0;
    
    if (!analysis.compliance.hasDeviceWidth) score -= 30;
    if (!analysis.compliance.hasInitialScale) score -= 20;
    if (!analysis.compliance.allowsZoom) score -= 15;
    if (!analysis.compliance.noDeprecated) score -= 15;
    
    score -= analysis.issues.length * 5;
    
    return Math.max(0, score);
  }

  _calculateResponsiveScore(analysis) {
    let score = 60; // Base score
    
    if (analysis.hasMediaQueries) score += 25;
    if (analysis.hasResponsiveImages) score += 15;
    if (analysis.hasFlexbox || analysis.hasGrid) score += 10;
    if (analysis.breakpoints.length >= 2) score += 10;
    
    score -= analysis.issues.length * 10;
    
    return Math.max(0, Math.min(100, score));
  }

  _calculateTouchScore(analysis) {
    let score = 70; // Base score
    
    if (analysis.touchTargets.total > 0) {
      const appropriatePercentage = (analysis.touchTargets.appropriate / analysis.touchTargets.total) * 100;
      score += (appropriatePercentage / 100) * 20;
      
      const smallPercentage = (analysis.touchTargets.small / analysis.touchTargets.total) * 100;
      score -= (smallPercentage / 100) * 30;
    }
    
    score -= analysis.issues.length * 10;
    
    return Math.max(0, Math.min(100, score));
  }

  _calculateMobileUXScore(analysis) {
    let score = 70; // Base score
    
    if (analysis.textReadability.smallTextPercentage < 20) score += 15;
    if (analysis.navigation.hasMobileMenu) score += 10;
    if (!analysis.content.horizontalScrolling) score += 10;
    if (!analysis.forms.hasUnoptimizedInputs) score += 5;
    
    score -= analysis.issues.length * 10;
    
    return Math.max(0, Math.min(100, score));
  }

  _calculateMobilePerformanceScore(analysis) {
    let score = 70; // Base score
    
    if (analysis.images.total > 0) {
      const optimizedPercentage = (analysis.images.optimized / analysis.images.total) * 100;
      score += (optimizedPercentage / 100) * 15;
      
      const lazyPercentage = (analysis.images.lazy / analysis.images.total) * 100;
      score += (lazyPercentage / 100) * 10;
    }
    
    if (analysis.resources.scripts <= 5) score += 5;
    if (analysis.hasCriticalResourceOptimization) score += 5;
    
    score -= analysis.issues.length * 10;
    
    return Math.max(0, Math.min(100, score));
  }

  _calculateMobileAccessibilityScore(analysis) {
    let score = 70; // Base score
    
    if (analysis.touchTargets.inadequateSize === 0) score += 15;
    if (analysis.keyboard.hasSkipLinks) score += 10;
    if (analysis.screenReader.missingAltText === 0) score += 10;
    if (analysis.screenReader.hasLandmarks) score += 5;
    
    score -= analysis.issues.length * 10;
    
    return Math.max(0, Math.min(100, score));
  }

  _generateMobileInsights(components) {
    const insights = [];
    
    // Viewport insights
    if (components.viewport.isResponsive) {
      insights.push({
        type: 'positive',
        category: 'viewport',
        message: 'Responsive viewport configuration detected',
        impact: 'high'
      });
    }
    
    // Touch insights
    if (components.touch.touchTargets.appropriate > components.touch.touchTargets.small) {
      insights.push({
        type: 'positive',
        category: 'touch',
        message: 'Most touch targets are appropriately sized',
        impact: 'high'
      });
    }
    
    // Performance insights
    if (components.performance.images.lazy > 0) {
      insights.push({
        type: 'positive',
        category: 'performance',
        message: 'Lazy loading implemented for images',
        impact: 'medium'
      });
    }
    
    return insights;
  }

  _generateMobileRecommendations(components) {
    const recommendations = [];
    
    // Collect all component recommendations
    Object.values(components).forEach(component => {
      if (component.recommendations) {
        recommendations.push(...component.recommendations.map(rec => ({
          text: rec,
          category: 'mobile',
          priority: 'high',
          complexity: 'medium'
        })));
      }
    });
    
    return recommendations.slice(0, 12); // Limit recommendations
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

export default MobileFriendlinessDetector;
