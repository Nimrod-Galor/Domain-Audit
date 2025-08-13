/**
 * Touch Optimization Detector - GPT-5 Style Modular Component
 * 
 * Detects touch-friendly design patterns, touch target optimization, and gesture support
 */

export class TouchOptimizationDetector {
  constructor(config = {}) {
    this.config = {
      minTouchTargetSize: config.minTouchTargetSize || 44, // pixels
      analyzeTouchTargets: config.analyzeTouchTargets !== false,
      analyzeGestureSupport: config.analyzeGestureSupport !== false,
      analyzeScrollOptimization: config.analyzeScrollOptimization !== false,
      maxTouchTargetsToAnalyze: config.maxTouchTargetsToAnalyze || 100,
      ...config
    };
  }

  /**
   * Analyze touch optimization and mobile interaction patterns
   * @param {Object} document - DOM document or Cheerio instance
   * @param {string} url - Page URL
   * @returns {Object} Touch optimization analysis
   */
  async analyze(document, url) {
    const results = {
      touchTargets: {},
      gestureSupport: {},
      scrollOptimization: {},
      touchFriendliness: {},
      score: 0,
      recommendations: [],
      issues: []
    };

    try {
      // Analyze touch targets
      if (this.config.analyzeTouchTargets) {
        results.touchTargets = this.analyzeTouchTargets(document);
      }

      // Analyze gesture support
      if (this.config.analyzeGestureSupport) {
        results.gestureSupport = this.analyzeGestureSupport(document);
      }

      // Analyze scroll optimization
      if (this.config.analyzeScrollOptimization) {
        results.scrollOptimization = this.analyzeScrollOptimization(document);
      }

      // Analyze overall touch-friendliness
      results.touchFriendliness = this.analyzeTouchFriendliness(document);

      // Calculate overall touch optimization score
      results.score = this.calculateTouchScore(results);
      results.recommendations = this.generateRecommendations(results);
      results.issues = this.identifyTouchIssues(results);

    } catch (error) {
      results.error = error.message;
      results.score = 0;
    }

    return results;
  }

  /**
   * Analyze touch targets for size, spacing, and accessibility
   * @param {Object} document - DOM document
   * @returns {Object} Touch targets analysis
   * @private
   */
  analyzeTouchTargets(document) {
    const touchTargets = {
      total: 0,
      interactive: 0,
      adequateSize: 0,
      inadequateSize: 0,
      wellSpaced: 0,
      tooClose: 0,
      accessible: 0,
      targets: [],
      score: 0,
      averageSize: 0
    };

    try {
      // Define interactive elements
      const interactiveSelectors = [
        'button',
        'a[href]',
        'input[type="button"]',
        'input[type="submit"]',
        'input[type="reset"]',
        'input[type="checkbox"]',
        'input[type="radio"]',
        'select',
        'textarea',
        '[onclick]',
        '[role="button"]',
        '[tabindex="0"]'
      ];

      const interactiveElements = document.querySelectorAll(interactiveSelectors.join(', '));
      touchTargets.total = Math.min(interactiveElements.length, this.config.maxTouchTargetsToAnalyze);

      let totalSize = 0;
      const targetPositions = [];

      interactiveElements.forEach((element, index) => {
        if (index >= this.config.maxTouchTargetsToAnalyze) return;

        try {
          const target = this.analyzeSingleTouchTarget(element, index);
          touchTargets.targets.push(target);
          touchTargets.interactive++;

          // Size analysis
          if (target.size.adequate) {
            touchTargets.adequateSize++;
          } else {
            touchTargets.inadequateSize++;
          }

          // Accessibility check
          if (target.accessibility.accessible) {
            touchTargets.accessible++;
          }

          totalSize += target.size.estimated;
          targetPositions.push(target.position);

        } catch (e) {
          // Skip problematic elements
        }
      });

      // Analyze spacing between targets
      this.analyzeTargetSpacing(touchTargets, targetPositions);

      // Calculate averages and scores
      if (touchTargets.interactive > 0) {
        touchTargets.averageSize = Math.round(totalSize / touchTargets.interactive);
        touchTargets.score = this.calculateTouchTargetsScore(touchTargets);
      }

    } catch (error) {
      touchTargets.error = error.message;
    }

    return touchTargets;
  }

  /**
   * Analyze a single touch target
   * @param {Element} element - DOM element
   * @param {number} index - Element index
   * @returns {Object} Single target analysis
   * @private
   */
  analyzeSingleTouchTarget(element, index) {
    const target = {
      index,
      tagName: element.tagName.toLowerCase(),
      type: element.type || 'unknown',
      id: element.id || null,
      className: element.className || '',
      text: this.getElementText(element),
      size: {},
      position: {},
      accessibility: {},
      issues: []
    };

    try {
      // Estimate size (approximate since we can't get computed styles reliably)
      target.size = this.estimateElementSize(element);
      
      // Get approximate position
      target.position = this.estimateElementPosition(element);
      
      // Check accessibility
      target.accessibility = this.checkTargetAccessibility(element);
      
      // Identify specific issues
      target.issues = this.identifyTargetIssues(element, target);

    } catch (error) {
      target.error = error.message;
    }

    return target;
  }

  /**
   * Estimate element size for touch target analysis
   * @param {Element} element - DOM element
   * @returns {Object} Size estimation
   * @private
   */
  estimateElementSize(element) {
    const size = {
      estimated: 0,
      adequate: false,
      width: 0,
      height: 0,
      method: 'estimated'
    };

    try {
      // Try to get inline styles
      const style = element.style || {};
      const width = style.width || '';
      const height = style.height || '';

      if (width.includes('px')) {
        size.width = parseInt(width);
      }
      if (height.includes('px')) {
        size.height = parseInt(height);
      }

      // Estimate based on element type and content
      if (!size.width || !size.height) {
        const estimation = this.estimateSizeByType(element);
        size.width = size.width || estimation.width;
        size.height = size.height || estimation.height;
        size.method = 'type-based';
      }

      // Calculate minimum dimension
      size.estimated = Math.min(size.width, size.height);
      size.adequate = size.estimated >= this.config.minTouchTargetSize;

    } catch (error) {
      size.error = error.message;
    }

    return size;
  }

  /**
   * Estimate size based on element type
   * @param {Element} element - DOM element
   * @returns {Object} Size estimation
   * @private
   */
  estimateSizeByType(element) {
    const tagName = element.tagName.toLowerCase();
    const text = this.getElementText(element);
    
    // Default sizes based on element type
    const defaultSizes = {
      button: { width: 80, height: 36 },
      a: { width: Math.max(50, text.length * 8), height: 24 },
      input: { width: 60, height: 32 },
      select: { width: 120, height: 32 },
      textarea: { width: 200, height: 80 }
    };

    const baseSize = defaultSizes[tagName] || { width: 50, height: 24 };

    // Adjust for content
    if (text.length > 10) {
      baseSize.width = Math.max(baseSize.width, text.length * 7);
    }

    // Adjust for padding/margin classes
    const className = element.className || '';
    if (className.includes('btn-lg') || className.includes('large')) {
      baseSize.width *= 1.5;
      baseSize.height *= 1.3;
    } else if (className.includes('btn-sm') || className.includes('small')) {
      baseSize.width *= 0.8;
      baseSize.height *= 0.8;
    }

    return baseSize;
  }

  /**
   * Estimate element position
   * @param {Element} element - DOM element
   * @returns {Object} Position estimation
   * @private
   */
  estimateElementPosition(element) {
    const position = {
      x: 0,
      y: 0,
      estimated: true
    };

    try {
      // Try to get position from getBoundingClientRect if available
      if (typeof element.getBoundingClientRect === 'function') {
        const rect = element.getBoundingClientRect();
        position.x = rect.left;
        position.y = rect.top;
        position.estimated = false;
      } else {
        // Estimate based on DOM position
        let x = 0, y = 0;
        let current = element;
        let index = 0;

        while (current && index < 10) {
          const siblings = Array.from(current.parentNode?.children || []);
          const siblingIndex = siblings.indexOf(current);
          
          x += siblingIndex * 100; // rough estimation
          y += siblingIndex * 30;
          
          current = current.parentNode;
          index++;
        }

        position.x = x;
        position.y = y;
      }
    } catch (error) {
      position.error = error.message;
    }

    return position;
  }

  /**
   * Check target accessibility
   * @param {Element} element - DOM element
   * @returns {Object} Accessibility analysis
   * @private
   */
  checkTargetAccessibility(element) {
    const accessibility = {
      accessible: false,
      hasLabel: false,
      hasAltText: false,
      hasAriaLabel: false,
      hasTitle: false,
      hasFocus: false,
      issues: []
    };

    try {
      // Check for various accessibility attributes
      if (element.hasAttribute('aria-label')) {
        accessibility.hasAriaLabel = true;
      }

      if (element.hasAttribute('title')) {
        accessibility.hasTitle = true;
      }

      if (element.hasAttribute('alt')) {
        accessibility.hasAltText = true;
      }

      // Check for associated labels
      if (element.tagName.toLowerCase() === 'input') {
        const labels = document.querySelectorAll(`label[for="${element.id}"]`);
        if (labels.length > 0 || element.closest('label')) {
          accessibility.hasLabel = true;
        }
      }

      // Check for focus capability
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex !== '-1' && (element.tagName.match(/^(a|button|input|select|textarea)$/i) || tabIndex === '0')) {
        accessibility.hasFocus = true;
      }

      // Check for text content
      const text = this.getElementText(element);
      const hasText = text.length > 0;

      // Determine overall accessibility
      accessibility.accessible = (
        hasText || 
        accessibility.hasAriaLabel || 
        accessibility.hasAltText || 
        accessibility.hasTitle || 
        accessibility.hasLabel
      ) && accessibility.hasFocus;

      // Identify specific issues
      if (!hasText && !accessibility.hasAriaLabel && !accessibility.hasAltText) {
        accessibility.issues.push('no-accessible-text');
      }
      if (!accessibility.hasFocus) {
        accessibility.issues.push('not-focusable');
      }

    } catch (error) {
      accessibility.error = error.message;
    }

    return accessibility;
  }

  /**
   * Analyze spacing between touch targets
   * @param {Object} touchTargets - Touch targets data
   * @param {Array} positions - Array of target positions
   * @private
   */
  analyzeTargetSpacing(touchTargets, positions) {
    const minSpacing = 8; // minimum recommended spacing in pixels
    let closeTargets = 0;

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const distance = this.calculateDistance(positions[i], positions[j]);
        if (distance < minSpacing) {
          closeTargets++;
        }
      }
    }

    touchTargets.tooClose = closeTargets;
    touchTargets.wellSpaced = Math.max(0, touchTargets.interactive - closeTargets);
  }

  /**
   * Calculate distance between two points
   * @param {Object} pos1 - First position
   * @param {Object} pos2 - Second position
   * @returns {number} Distance in pixels
   * @private
   */
  calculateDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Analyze gesture support patterns
   * @param {Object} document - DOM document
   * @returns {Object} Gesture support analysis
   * @private
   */
  analyzeGestureSupport(document) {
    const gestures = {
      touchEvents: false,
      pointerEvents: false,
      gestureEvents: false,
      swipeSupport: false,
      pinchZoom: false,
      longPress: false,
      detected: [],
      score: 0
    };

    try {
      // Check for touch event handlers in attributes
      const touchElements = document.querySelectorAll(
        '[ontouchstart], [ontouchend], [ontouchmove], [ontouchcancel]'
      );
      if (touchElements.length > 0) {
        gestures.touchEvents = true;
        gestures.detected.push('touch-events');
      }

      // Check for pointer events
      const pointerElements = document.querySelectorAll(
        '[onpointerdown], [onpointerup], [onpointermove], [onpointercancel]'
      );
      if (pointerElements.length > 0) {
        gestures.pointerEvents = true;
        gestures.detected.push('pointer-events');
      }

      // Analyze script content for gesture patterns
      const scripts = document.querySelectorAll('script');
      const scriptContent = Array.from(scripts)
        .map(script => script.textContent || script.innerHTML || '')
        .join(' ');

      // Check for various gesture patterns
      if (/gesturestart|gesturechange|gestureend/i.test(scriptContent)) {
        gestures.gestureEvents = true;
        gestures.detected.push('gesture-events');
      }

      if (/swipe|swipeLeft|swipeRight|swipeUp|swipeDown/i.test(scriptContent)) {
        gestures.swipeSupport = true;
        gestures.detected.push('swipe-gestures');
      }

      if (/pinch|zoom|scale|transform/i.test(scriptContent)) {
        gestures.pinchZoom = true;
        gestures.detected.push('pinch-zoom');
      }

      if (/long.?press|contextmenu|hold/i.test(scriptContent)) {
        gestures.longPress = true;
        gestures.detected.push('long-press');
      }

      // Calculate gesture support score
      gestures.score = Math.min(100, gestures.detected.length * 20);

    } catch (error) {
      gestures.error = error.message;
    }

    return gestures;
  }

  /**
   * Analyze scroll optimization
   * @param {Object} document - DOM document
   * @returns {Object} Scroll optimization analysis
   * @private
   */
  analyzeScrollOptimization(document) {
    const scroll = {
      smoothScrolling: false,
      momentum: false,
      overflowHandling: false,
      scrollSnap: false,
      infiniteScroll: false,
      customScrollbars: false,
      optimizations: [],
      score: 0
    };

    try {
      // Check for CSS scroll properties
      const styleElements = document.querySelectorAll('style');
      const cssContent = Array.from(styleElements)
        .map(style => style.textContent || '')
        .join(' ');

      // Check for smooth scrolling
      if (/scroll-behavior:\s*smooth/i.test(cssContent)) {
        scroll.smoothScrolling = true;
        scroll.optimizations.push('smooth-scrolling');
      }

      // Check for momentum scrolling (iOS)
      if (/-webkit-overflow-scrolling:\s*touch/i.test(cssContent)) {
        scroll.momentum = true;
        scroll.optimizations.push('momentum-scrolling');
      }

      // Check for scroll snap
      if (/scroll-snap|snap-type/i.test(cssContent)) {
        scroll.scrollSnap = true;
        scroll.optimizations.push('scroll-snap');
      }

      // Check for overflow handling
      if (/overflow:\s*(auto|scroll|hidden)/i.test(cssContent)) {
        scroll.overflowHandling = true;
        scroll.optimizations.push('overflow-handling');
      }

      // Check for custom scrollbars
      if (/::-webkit-scrollbar/i.test(cssContent)) {
        scroll.customScrollbars = true;
        scroll.optimizations.push('custom-scrollbars');
      }

      // Check JavaScript for infinite scroll
      const scripts = document.querySelectorAll('script');
      const scriptContent = Array.from(scripts)
        .map(script => script.textContent || '')
        .join(' ');

      if (/infinite.?scroll|load.?more|pagination/i.test(scriptContent)) {
        scroll.infiniteScroll = true;
        scroll.optimizations.push('infinite-scroll');
      }

      // Calculate scroll optimization score
      scroll.score = Math.min(100, scroll.optimizations.length * 17);

    } catch (error) {
      scroll.error = error.message;
    }

    return scroll;
  }

  /**
   * Analyze overall touch-friendliness
   * @param {Object} document - DOM document
   * @returns {Object} Touch-friendliness analysis
   * @private
   */
  analyzeTouchFriendliness(document) {
    const friendliness = {
      overallRating: 'unknown',
      hasLargeTargets: false,
      hasSpacedTargets: false,
      hasHoverAlternatives: false,
      hasAccessibleTargets: false,
      noTinyText: false,
      score: 0,
      factors: []
    };

    try {
      // This would be filled based on other analysis results
      // For now, provide basic analysis
      
      const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
      const links = document.querySelectorAll('a[href]');
      
      if (buttons.length > 0 || links.length > 0) {
        friendliness.hasLargeTargets = true;
        friendliness.factors.push('interactive-elements-present');
      }

      // Check for hover-dependent features
      const hoverElements = document.querySelectorAll('[onmouseover], [onmouseout], [title]');
      if (hoverElements.length === 0) {
        friendliness.hasHoverAlternatives = true;
        friendliness.factors.push('no-hover-dependence');
      }

      // Basic scoring
      let score = 0;
      if (friendliness.hasLargeTargets) score += 30;
      if (friendliness.hasHoverAlternatives) score += 25;
      if (buttons.length > 3) score += 25;
      if (links.length > 0 && links.length < 20) score += 20;

      friendliness.score = score;
      
      if (score >= 80) friendliness.overallRating = 'excellent';
      else if (score >= 60) friendliness.overallRating = 'good';
      else if (score >= 40) friendliness.overallRating = 'fair';
      else friendliness.overallRating = 'poor';

    } catch (error) {
      friendliness.error = error.message;
    }

    return friendliness;
  }

  /**
   * Get clean text content from element
   * @param {Element} element - DOM element
   * @returns {string} Clean text content
   * @private
   */
  getElementText(element) {
    try {
      const text = element.textContent || element.innerText || element.value || '';
      return text.trim().substring(0, 50); // Limit length
    } catch (error) {
      return '';
    }
  }

  /**
   * Calculate touch targets score
   * @param {Object} touchTargets - Touch targets data
   * @returns {number} Score (0-100)
   * @private
   */
  calculateTouchTargetsScore(touchTargets) {
    if (touchTargets.interactive === 0) return 0;

    let score = 0;
    
    // Size adequacy (40%)
    const sizeScore = (touchTargets.adequateSize / touchTargets.interactive) * 100;
    score += sizeScore * 0.4;

    // Spacing adequacy (30%)
    const spacingScore = (touchTargets.wellSpaced / touchTargets.interactive) * 100;
    score += spacingScore * 0.3;

    // Accessibility (30%)
    const accessibilityScore = (touchTargets.accessible / touchTargets.interactive) * 100;
    score += accessibilityScore * 0.3;

    return Math.round(score);
  }

  /**
   * Calculate overall touch optimization score
   * @param {Object} results - Analysis results
   * @returns {number} Overall score (0-100)
   * @private
   */
  calculateTouchScore(results) {
    let score = 0;
    let weights = 0;

    // Touch targets (40%)
    if (results.touchTargets && !results.touchTargets.error) {
      score += (results.touchTargets.score || 0) * 0.4;
      weights += 0.4;
    }

    // Gesture support (25%)
    if (results.gestureSupport && !results.gestureSupport.error) {
      score += (results.gestureSupport.score || 0) * 0.25;
      weights += 0.25;
    }

    // Scroll optimization (20%)
    if (results.scrollOptimization && !results.scrollOptimization.error) {
      score += (results.scrollOptimization.score || 0) * 0.2;
      weights += 0.2;
    }

    // Touch-friendliness (15%)
    if (results.touchFriendliness && !results.touchFriendliness.error) {
      score += (results.touchFriendliness.score || 0) * 0.15;
      weights += 0.15;
    }

    return weights > 0 ? Math.round(score / weights) : 0;
  }

  /**
   * Generate touch optimization recommendations
   * @param {Object} results - Analysis results
   * @returns {Array} List of recommendations
   * @private
   */
  generateRecommendations(results) {
    const recommendations = [];

    if (results.touchTargets?.inadequateSize > 0) {
      recommendations.push({
        type: 'touch-target-size',
        priority: 'high',
        message: `Increase size of ${results.touchTargets.inadequateSize} touch targets to at least ${this.config.minTouchTargetSize}px`,
        impact: 'usability'
      });
    }

    if (results.touchTargets?.tooClose > 0) {
      recommendations.push({
        type: 'touch-target-spacing',
        priority: 'medium',
        message: 'Increase spacing between touch targets to prevent accidental taps',
        impact: 'usability'
      });
    }

    if (!results.gestureSupport?.touchEvents) {
      recommendations.push({
        type: 'touch-events',
        priority: 'medium',
        message: 'Implement touch event handlers for better mobile interaction',
        impact: 'user-experience'
      });
    }

    if (!results.scrollOptimization?.smoothScrolling) {
      recommendations.push({
        type: 'smooth-scrolling',
        priority: 'low',
        message: 'Add smooth scrolling for better user experience',
        impact: 'polish'
      });
    }

    return recommendations;
  }

  /**
   * Identify touch-related issues
   * @param {Object} results - Analysis results
   * @returns {Array} List of issues
   * @private
   */
  identifyTouchIssues(results) {
    const issues = [];

    if (results.touchTargets?.interactive === 0) {
      issues.push({
        type: 'no-interactive-elements',
        severity: 'high',
        message: 'No interactive elements detected for touch interaction'
      });
    }

    if (results.touchTargets && results.touchTargets.adequateSize / results.touchTargets.interactive < 0.5) {
      issues.push({
        type: 'small-touch-targets',
        severity: 'high',
        message: 'More than 50% of touch targets are too small for comfortable interaction'
      });
    }

    if (results.touchTargets && results.touchTargets.accessible / results.touchTargets.interactive < 0.7) {
      issues.push({
        type: 'inaccessible-targets',
        severity: 'medium',
        message: 'Many touch targets lack proper accessibility attributes'
      });
    }

    return issues;
  }

  /**
   * Identify issues with a specific target
   * @param {Element} element - DOM element
   * @param {Object} target - Target analysis data
   * @returns {Array} List of issues
   * @private
   */
  identifyTargetIssues(element, target) {
    const issues = [];

    if (!target.size.adequate) {
      issues.push('size-too-small');
    }

    if (!target.accessibility.accessible) {
      issues.push('not-accessible');
    }

    if (target.text.length === 0 && !target.accessibility.hasAriaLabel) {
      issues.push('no-label');
    }

    return issues;
  }
}

export default TouchOptimizationDetector;
