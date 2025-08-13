/**
 * Mobile Navigation Detector - GPT-5 Style Modular Component
 * 
 * Detects mobile navigation patterns, hamburger menus, and mobile-specific navigation UX
 */

export class MobileNavigationDetector {
  constructor(config = {}) {
    this.config = {
      analyzeHamburgerMenu: config.analyzeHamburgerMenu !== false,
      analyzeNavigationPatterns: config.analyzeNavigationPatterns !== false,
      analyzeNavigationAccessibility: config.analyzeNavigationAccessibility !== false,
      maxNavigationElements: config.maxNavigationElements || 50,
      ...config
    };
  }

  /**
   * Analyze mobile navigation patterns and UX
   * @param {Object} document - DOM document or Cheerio instance
   * @param {string} url - Page URL
   * @returns {Object} Mobile navigation analysis
   */
  async analyze(document, url) {
    const results = {
      hamburgerMenu: {},
      navigationPatterns: {},
      navigationAccessibility: {},
      mobileNavigation: {},
      score: 0,
      patterns: [],
      recommendations: []
    };

    try {
      // Analyze hamburger menu implementation
      if (this.config.analyzeHamburgerMenu) {
        results.hamburgerMenu = this.analyzeHamburgerMenu(document);
      }

      // Analyze navigation patterns
      if (this.config.analyzeNavigationPatterns) {
        results.navigationPatterns = this.analyzeNavigationPatterns(document);
      }

      // Analyze navigation accessibility
      if (this.config.analyzeNavigationAccessibility) {
        results.navigationAccessibility = this.analyzeNavigationAccessibility(document);
      }

      // Analyze overall mobile navigation
      results.mobileNavigation = this.analyzeMobileNavigation(document);

      // Calculate scores and generate insights
      results.score = this.calculateNavigationScore(results);
      results.patterns = this.identifyNavigationPatterns(results);
      results.recommendations = this.generateNavigationRecommendations(results);

    } catch (error) {
      results.error = error.message;
      results.score = 0;
    }

    return results;
  }

  /**
   * Analyze hamburger menu implementation
   * @param {Object} document - DOM document
   * @returns {Object} Hamburger menu analysis
   * @private
   */
  analyzeHamburgerMenu(document) {
    const hamburger = {
      detected: false,
      implementation: 'none',
      triggers: [],
      menus: [],
      accessibility: {},
      animations: false,
      score: 0,
      issues: []
    };

    try {
      // Look for common hamburger menu patterns
      const hamburgerPatterns = [
        '.hamburger',
        '.menu-toggle',
        '.mobile-menu-trigger',
        '.navbar-toggle',
        '.menu-button',
        '[class*="hamburger"]',
        '[class*="menu-toggle"]',
        '[id*="hamburger"]',
        '[id*="menu-toggle"]'
      ];

      const hamburgerElements = document.querySelectorAll(hamburgerPatterns.join(', '));
      
      if (hamburgerElements.length > 0) {
        hamburger.detected = true;
        
        hamburgerElements.forEach((element, index) => {
          if (index < 5) { // Limit analysis
            const trigger = this.analyzeHamburgerTrigger(element);
            hamburger.triggers.push(trigger);
          }
        });

        // Analyze associated menus
        hamburger.menus = this.findAssociatedMenus(document, hamburgerElements);
        
        // Determine implementation type
        hamburger.implementation = this.determineHamburgerImplementation(hamburger.triggers);
        
        // Check accessibility
        hamburger.accessibility = this.analyzeHamburgerAccessibility(hamburger.triggers);
        
        // Check for animations
        hamburger.animations = this.detectHamburgerAnimations(document);
        
        // Calculate hamburger score
        hamburger.score = this.calculateHamburgerScore(hamburger);
      }

    } catch (error) {
      hamburger.error = error.message;
    }

    return hamburger;
  }

  /**
   * Analyze individual hamburger trigger
   * @param {Element} element - Hamburger trigger element
   * @returns {Object} Trigger analysis
   * @private
   */
  analyzeHamburgerTrigger(element) {
    const trigger = {
      tagName: element.tagName.toLowerCase(),
      id: element.id || null,
      className: element.className || '',
      hasIcon: false,
      iconType: 'unknown',
      isButton: false,
      hasLabel: false,
      accessible: false
    };

    try {
      // Check if it's a proper button
      trigger.isButton = element.tagName.toLowerCase() === 'button' || 
                        element.getAttribute('role') === 'button';

      // Check for icon implementation
      const iconElements = element.querySelectorAll('span, i, svg, img');
      if (iconElements.length > 0) {
        trigger.hasIcon = true;
        trigger.iconType = this.determineIconType(iconElements);
      }

      // Check for label/text
      const text = element.textContent?.trim() || '';
      const ariaLabel = element.getAttribute('aria-label') || '';
      const title = element.getAttribute('title') || '';
      
      trigger.hasLabel = text.length > 0 || ariaLabel.length > 0 || title.length > 0;

      // Check accessibility
      trigger.accessible = trigger.isButton && 
                          (trigger.hasLabel || ariaLabel.length > 0) &&
                          element.getAttribute('tabindex') !== '-1';

    } catch (error) {
      trigger.error = error.message;
    }

    return trigger;
  }

  /**
   * Find menus associated with hamburger triggers
   * @param {Object} document - DOM document
   * @param {NodeList} triggers - Hamburger trigger elements
   * @returns {Array} Associated menus
   * @private
   */
  findAssociatedMenus(document, triggers) {
    const menus = [];

    try {
      // Look for common mobile menu patterns
      const menuSelectors = [
        '.mobile-menu',
        '.mobile-nav',
        '.off-canvas',
        '.slide-menu',
        '.drawer',
        '.sidebar',
        '[class*="mobile-menu"]',
        '[class*="mobile-nav"]',
        '[class*="nav-mobile"]'
      ];

      const menuElements = document.querySelectorAll(menuSelectors.join(', '));
      
      menuElements.forEach(menu => {
        const menuData = {
          id: menu.id || null,
          className: menu.className || '',
          tagName: menu.tagName.toLowerCase(),
          itemCount: menu.querySelectorAll('a, button').length,
          hasSubmenu: menu.querySelectorAll('ul ul, .submenu').length > 0,
          isHidden: this.isElementHidden(menu),
          position: this.detectMenuPosition(menu)
        };

        menus.push(menuData);
      });

    } catch (error) {
      // Skip menu detection on error
    }

    return menus;
  }

  /**
   * Determine hamburger implementation type
   * @param {Array} triggers - Hamburger triggers
   * @returns {string} Implementation type
   * @private
   */
  determineHamburgerImplementation(triggers) {
    if (triggers.length === 0) return 'none';

    const hasProperButton = triggers.some(t => t.isButton);
    const hasIcon = triggers.some(t => t.hasIcon);
    const hasAccessibility = triggers.some(t => t.accessible);

    if (hasProperButton && hasIcon && hasAccessibility) return 'complete';
    if (hasProperButton && hasIcon) return 'good';
    if (hasIcon) return 'basic';
    return 'minimal';
  }

  /**
   * Analyze navigation patterns beyond hamburger menus
   * @param {Object} document - DOM document
   * @returns {Object} Navigation patterns analysis
   * @private
   */
  analyzeNavigationPatterns(document) {
    const patterns = {
      tabBar: false,
      bottomNavigation: false,
      sidebar: false,
      dropdown: false,
      breadcrumbs: false,
      pagination: false,
      search: false,
      backButton: false,
      patterns: [],
      score: 0
    };

    try {
      // Check for tab bar pattern
      const tabElements = document.querySelectorAll('[role="tablist"], .tab-bar, .tabs');
      if (tabElements.length > 0) {
        patterns.tabBar = true;
        patterns.patterns.push('tab-bar');
      }

      // Check for bottom navigation
      const bottomNav = document.querySelectorAll('.bottom-nav, .bottom-navigation, [class*="bottom-nav"]');
      if (bottomNav.length > 0) {
        patterns.bottomNavigation = true;
        patterns.patterns.push('bottom-navigation');
      }

      // Check for sidebar navigation
      const sidebar = document.querySelectorAll('.sidebar, .nav-sidebar, [class*="sidebar"]');
      if (sidebar.length > 0) {
        patterns.sidebar = true;
        patterns.patterns.push('sidebar');
      }

      // Check for dropdown navigation
      const dropdown = document.querySelectorAll('.dropdown, [class*="dropdown"]');
      if (dropdown.length > 0) {
        patterns.dropdown = true;
        patterns.patterns.push('dropdown');
      }

      // Check for breadcrumbs
      const breadcrumbs = document.querySelectorAll('.breadcrumb, [class*="breadcrumb"], nav[aria-label*="breadcrumb"]');
      if (breadcrumbs.length > 0) {
        patterns.breadcrumbs = true;
        patterns.patterns.push('breadcrumbs');
      }

      // Check for search functionality
      const search = document.querySelectorAll('input[type="search"], .search, [class*="search"]');
      if (search.length > 0) {
        patterns.search = true;
        patterns.patterns.push('search');
      }

      // Check for back button
      const backButton = document.querySelectorAll('.back, .back-button, [class*="back"]');
      if (backButton.length > 0) {
        patterns.backButton = true;
        patterns.patterns.push('back-button');
      }

      // Calculate patterns score
      patterns.score = Math.min(100, patterns.patterns.length * 15);

    } catch (error) {
      patterns.error = error.message;
    }

    return patterns;
  }

  /**
   * Analyze navigation accessibility
   * @param {Object} document - DOM document
   * @returns {Object} Navigation accessibility analysis
   * @private
   */
  analyzeNavigationAccessibility(document) {
    const accessibility = {
      hasNavLandmarks: false,
      hasSkipLinks: false,
      hasFocusManagement: false,
      hasAriaLabels: false,
      hasKeyboardSupport: false,
      navElements: [],
      score: 0,
      issues: []
    };

    try {
      // Check for navigation landmarks
      const navElements = document.querySelectorAll('nav, [role="navigation"]');
      accessibility.hasNavLandmarks = navElements.length > 0;
      
      navElements.forEach((nav, index) => {
        if (index < 10) { // Limit analysis
          const navData = {
            hasLabel: nav.hasAttribute('aria-label') || nav.hasAttribute('aria-labelledby'),
            hasItems: nav.querySelectorAll('a, button').length,
            isNested: nav.closest('nav') !== null
          };
          accessibility.navElements.push(navData);
        }
      });

      // Check for skip links
      const skipLinks = document.querySelectorAll('a[href^="#"], .skip-link, [class*="skip"]');
      accessibility.hasSkipLinks = skipLinks.length > 0;

      // Check for ARIA labels on navigation
      const labeledNav = document.querySelectorAll('nav[aria-label], nav[aria-labelledby]');
      accessibility.hasAriaLabels = labeledNav.length > 0;

      // Check for keyboard support indicators
      const focusableElements = document.querySelectorAll('[tabindex], [accesskey]');
      accessibility.hasKeyboardSupport = focusableElements.length > 0;

      // Identify accessibility issues
      if (!accessibility.hasNavLandmarks) {
        accessibility.issues.push('no-nav-landmarks');
      }
      if (!accessibility.hasSkipLinks) {
        accessibility.issues.push('no-skip-links');
      }
      if (!accessibility.hasAriaLabels && navElements.length > 1) {
        accessibility.issues.push('unlabeled-navigation');
      }

      // Calculate accessibility score
      let score = 0;
      if (accessibility.hasNavLandmarks) score += 30;
      if (accessibility.hasSkipLinks) score += 20;
      if (accessibility.hasAriaLabels) score += 25;
      if (accessibility.hasKeyboardSupport) score += 25;

      accessibility.score = score;

    } catch (error) {
      accessibility.error = error.message;
    }

    return accessibility;
  }

  /**
   * Analyze overall mobile navigation implementation
   * @param {Object} document - DOM document
   * @returns {Object} Mobile navigation analysis
   * @private
   */
  analyzeMobileNavigation(document) {
    const mobileNav = {
      hasMobileSpecificNav: false,
      responsive: false,
      touchOptimized: false,
      performance: 'unknown',
      userExperience: 'unknown',
      score: 0
    };

    try {
      // Check for mobile-specific navigation elements
      const mobileNavElements = document.querySelectorAll(
        '.mobile-nav, .mobile-menu, [class*="mobile-nav"], [class*="mobile-menu"]'
      );
      mobileNav.hasMobileSpecificNav = mobileNavElements.length > 0;

      // Check for responsive navigation indicators
      const responsiveNav = document.querySelectorAll(
        '[class*="responsive"], [class*="collapse"], .navbar-collapse'
      );
      mobileNav.responsive = responsiveNav.length > 0;

      // Check for touch optimization
      const touchOptimizedElements = document.querySelectorAll(
        '[ontouchstart], [ontouchend], [class*="touch"]'
      );
      mobileNav.touchOptimized = touchOptimizedElements.length > 0;

      // Estimate user experience
      if (mobileNav.hasMobileSpecificNav && mobileNav.responsive) {
        mobileNav.userExperience = 'good';
      } else if (mobileNav.hasMobileSpecificNav || mobileNav.responsive) {
        mobileNav.userExperience = 'fair';
      } else {
        mobileNav.userExperience = 'poor';
      }

      // Calculate mobile navigation score
      let score = 0;
      if (mobileNav.hasMobileSpecificNav) score += 40;
      if (mobileNav.responsive) score += 30;
      if (mobileNav.touchOptimized) score += 30;

      mobileNav.score = score;

    } catch (error) {
      mobileNav.error = error.message;
    }

    return mobileNav;
  }

  /**
   * Helper method to determine icon type
   * @param {NodeList} iconElements - Icon elements
   * @returns {string} Icon type
   * @private
   */
  determineIconType(iconElements) {
    const firstIcon = iconElements[0];
    
    if (firstIcon.tagName.toLowerCase() === 'svg') return 'svg';
    if (firstIcon.tagName.toLowerCase() === 'img') return 'image';
    if (firstIcon.className.includes('fa-') || firstIcon.className.includes('icon-')) return 'icon-font';
    return 'css-lines';
  }

  /**
   * Check if element is hidden
   * @param {Element} element - DOM element
   * @returns {boolean} Whether element is hidden
   * @private
   */
  isElementHidden(element) {
    const style = element.style || {};
    const className = element.className || '';
    
    return style.display === 'none' || 
           style.visibility === 'hidden' ||
           className.includes('hidden') ||
           className.includes('hide');
  }

  /**
   * Detect menu position
   * @param {Element} menu - Menu element
   * @returns {string} Menu position
   * @private
   */
  detectMenuPosition(menu) {
    const className = menu.className || '';
    
    if (className.includes('top')) return 'top';
    if (className.includes('bottom')) return 'bottom';
    if (className.includes('left')) return 'left';
    if (className.includes('right')) return 'right';
    if (className.includes('overlay')) return 'overlay';
    
    return 'unknown';
  }

  /**
   * Analyze hamburger accessibility
   * @param {Array} triggers - Hamburger triggers
   * @returns {Object} Accessibility analysis
   * @private
   */
  analyzeHamburgerAccessibility(triggers) {
    const accessibility = {
      accessible: false,
      hasProperRole: false,
      hasAriaLabel: false,
      hasAriaExpanded: false,
      hasKeyboardSupport: false,
      score: 0
    };

    triggers.forEach(trigger => {
      if (trigger.isButton) accessibility.hasProperRole = true;
      if (trigger.hasLabel) accessibility.hasAriaLabel = true;
      // Note: aria-expanded would need DOM element access to check properly
    });

    // Calculate accessibility score
    let score = 0;
    if (accessibility.hasProperRole) score += 40;
    if (accessibility.hasAriaLabel) score += 30;
    if (accessibility.hasAriaExpanded) score += 30;

    accessibility.score = score;
    accessibility.accessible = score >= 70;

    return accessibility;
  }

  /**
   * Detect hamburger animations
   * @param {Object} document - DOM document
   * @returns {boolean} Whether animations are detected
   * @private
   */
  detectHamburgerAnimations(document) {
    try {
      const styleElements = document.querySelectorAll('style');
      const cssContent = Array.from(styleElements)
        .map(style => style.textContent || '')
        .join(' ');

      return /transition|animation|@keyframes/i.test(cssContent);
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate hamburger menu score
   * @param {Object} hamburger - Hamburger data
   * @returns {number} Score (0-100)
   * @private
   */
  calculateHamburgerScore(hamburger) {
    if (!hamburger.detected) return 0;

    let score = 30; // Base score for having a hamburger menu

    // Implementation quality
    const implScores = {
      'complete': 40,
      'good': 30,
      'basic': 20,
      'minimal': 10
    };
    score += implScores[hamburger.implementation] || 0;

    // Accessibility
    score += (hamburger.accessibility.score || 0) * 0.3;

    return Math.min(100, Math.round(score));
  }

  /**
   * Calculate overall navigation score
   * @param {Object} results - Analysis results
   * @returns {number} Overall score (0-100)
   * @private
   */
  calculateNavigationScore(results) {
    let score = 0;
    let weights = 0;

    // Hamburger menu (40%)
    if (results.hamburgerMenu && !results.hamburgerMenu.error) {
      score += (results.hamburgerMenu.score || 0) * 0.4;
      weights += 0.4;
    }

    // Navigation patterns (30%)
    if (results.navigationPatterns && !results.navigationPatterns.error) {
      score += (results.navigationPatterns.score || 0) * 0.3;
      weights += 0.3;
    }

    // Navigation accessibility (30%)
    if (results.navigationAccessibility && !results.navigationAccessibility.error) {
      score += (results.navigationAccessibility.score || 0) * 0.3;
      weights += 0.3;
    }

    return weights > 0 ? Math.round(score / weights) : 0;
  }

  /**
   * Identify navigation patterns
   * @param {Object} results - Analysis results
   * @returns {Array} List of patterns
   * @private
   */
  identifyNavigationPatterns(results) {
    const patterns = [];

    if (results.hamburgerMenu?.detected) {
      patterns.push('hamburger-menu');
    }

    if (results.navigationPatterns?.patterns) {
      patterns.push(...results.navigationPatterns.patterns);
    }

    if (results.mobileNavigation?.responsive) {
      patterns.push('responsive-navigation');
    }

    return patterns;
  }

  /**
   * Generate navigation recommendations
   * @param {Object} results - Analysis results
   * @returns {Array} List of recommendations
   * @private
   */
  generateNavigationRecommendations(results) {
    const recommendations = [];

    if (!results.hamburgerMenu?.detected) {
      recommendations.push({
        type: 'hamburger-menu',
        priority: 'medium',
        message: 'Consider implementing a hamburger menu for mobile navigation',
        impact: 'mobile-usability'
      });
    }

    if (results.hamburgerMenu?.detected && results.hamburgerMenu.accessibility?.score < 70) {
      recommendations.push({
        type: 'navigation-accessibility',
        priority: 'high',
        message: 'Improve hamburger menu accessibility with proper ARIA labels and keyboard support',
        impact: 'accessibility'
      });
    }

    if (!results.navigationAccessibility?.hasSkipLinks) {
      recommendations.push({
        type: 'skip-links',
        priority: 'medium',
        message: 'Add skip links for better keyboard navigation',
        impact: 'accessibility'
      });
    }

    return recommendations;
  }
}

export default MobileNavigationDetector;
