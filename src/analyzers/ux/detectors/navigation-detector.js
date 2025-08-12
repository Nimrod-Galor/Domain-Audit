/**
 * Navigation Detector - GPT-5 Style Modular Component
 * 
 * Detects and analyzes navigation structures for UX analysis.
 * Pure detection logic without business rules.
 */
export class NavigationDetector {
  constructor(options = {}) {
    this.options = {
      detectPrimaryNav: options.detectPrimaryNav !== false,
      detectSecondaryNav: options.detectSecondaryNav !== false,
      detectBreadcrumbs: options.detectBreadcrumbs !== false,
      detectPagination: options.detectPagination !== false,
      detectFooterNav: options.detectFooterNav !== false,
      analyzeMobileNav: options.analyzeMobileNav !== false,
      ...options
    };
  }

  /**
   * Detect navigation elements in the document
   * @param {Document} document - DOM document
   * @returns {Object} Detection results
   */
  detect(document) {
    const navigation = {
      primary: this.options.detectPrimaryNav ? this._detectPrimaryNavigation(document) : null,
      secondary: this.options.detectSecondaryNav ? this._detectSecondaryNavigation(document) : null,
      breadcrumbs: this.options.detectBreadcrumbs ? this._detectBreadcrumbs(document) : null,
      pagination: this.options.detectPagination ? this._detectPagination(document) : null,
      footer: this.options.detectFooterNav ? this._detectFooterNavigation(document) : null,
      mobile: this.options.analyzeMobileNav ? this._detectMobileNavigation(document) : null
    };

    const analysis = {
      navigationDepth: this._calculateNavigationDepth(navigation),
      navigationComplexity: this._calculateNavigationComplexity(navigation),
      accessibilityFeatures: this._analyzeNavigationAccessibility(document),
      navigationPatterns: this._analyzeNavigationPatterns(navigation),
      searchFunctionality: this._detectSearchFunctionality(document)
    };

    return {
      navigation,
      analysis,
      metadata: {
        detectTime: Date.now(),
        detectorOptions: this.options
      }
    };
  }

  /**
   * Detect primary navigation
   */
  _detectPrimaryNavigation(document) {
    const primaryNav = {
      elements: [],
      structure: null,
      location: null,
      style: null
    };

    // Common primary navigation selectors
    const navSelectors = [
      'nav:first-of-type',
      '.navbar',
      '.main-nav',
      '.primary-nav',
      '.navigation',
      '.menu',
      'header nav',
      '[role="navigation"]:first-of-type'
    ];

    for (const selector of navSelectors) {
      const navElement = document.querySelector(selector);
      if (navElement) {
        primaryNav.elements = this._extractNavigationItems(navElement);
        primaryNav.structure = this._analyzeNavigationStructure(navElement);
        primaryNav.location = this._getNavigationLocation(navElement);
        primaryNav.style = this._getNavigationStyle(navElement);
        break;
      }
    }

    return primaryNav;
  }

  /**
   * Detect secondary navigation
   */
  _detectSecondaryNavigation(document) {
    const secondaryNav = {
      elements: [],
      types: [],
      locations: []
    };

    // Detect various types of secondary navigation
    const secondarySelectors = [
      '.sub-nav',
      '.secondary-nav',
      '.sidebar-nav',
      '.category-nav',
      '.breadcrumb',
      '.tabs',
      '.tab-nav'
    ];

    secondarySelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        secondaryNav.elements.push(...this._extractNavigationItems(el));
        secondaryNav.types.push(this._identifyNavigationType(el, selector));
        secondaryNav.locations.push(this._getNavigationLocation(el));
      });
    });

    return secondaryNav;
  }

  /**
   * Detect breadcrumb navigation
   */
  _detectBreadcrumbs(document) {
    const breadcrumbs = {
      found: false,
      elements: [],
      structure: null,
      accessibility: null
    };

    const breadcrumbSelectors = [
      '.breadcrumb',
      '.breadcrumbs',
      '[aria-label*="breadcrumb"]',
      '[aria-label*="breadcrumbs"]',
      '.crumbs',
      '.path'
    ];

    for (const selector of breadcrumbSelectors) {
      const breadcrumbContainer = document.querySelector(selector);
      if (breadcrumbContainer) {
        breadcrumbs.found = true;
        breadcrumbs.elements = this._extractBreadcrumbItems(breadcrumbContainer);
        breadcrumbs.structure = this._analyzeBreadcrumbStructure(breadcrumbContainer);
        breadcrumbs.accessibility = this._analyzeBreadcrumbAccessibility(breadcrumbContainer);
        break;
      }
    }

    return breadcrumbs;
  }

  /**
   * Detect pagination navigation
   */
  _detectPagination(document) {
    const pagination = {
      found: false,
      type: null,
      elements: [],
      currentPage: null,
      totalPages: null,
      accessibility: null
    };

    const paginationSelectors = [
      '.pagination',
      '.pager',
      '.page-nav',
      '.page-numbers',
      '[role="navigation"][aria-label*="page"]'
    ];

    for (const selector of paginationSelectors) {
      const paginationContainer = document.querySelector(selector);
      if (paginationContainer) {
        pagination.found = true;
        pagination.type = this._identifyPaginationType(paginationContainer);
        pagination.elements = this._extractPaginationItems(paginationContainer);
        pagination.currentPage = this._findCurrentPage(paginationContainer);
        pagination.totalPages = this._calculateTotalPages(paginationContainer);
        pagination.accessibility = this._analyzePaginationAccessibility(paginationContainer);
        break;
      }
    }

    return pagination;
  }

  /**
   * Detect footer navigation
   */
  _detectFooterNavigation(document) {
    const footerNav = {
      found: false,
      sections: [],
      links: [],
      structure: null
    };

    const footer = document.querySelector('footer');
    if (footer) {
      const navElements = footer.querySelectorAll('nav, .footer-nav, .footer-menu, .footer-links');
      
      if (navElements.length > 0) {
        footerNav.found = true;
        
        navElements.forEach(nav => {
          footerNav.sections.push(this._analyzeFooterNavSection(nav));
          footerNav.links.push(...this._extractNavigationItems(nav));
        });
        
        footerNav.structure = this._analyzeFooterNavStructure(footer);
      }
    }

    return footerNav;
  }

  /**
   * Detect mobile navigation
   */
  _detectMobileNavigation(document) {
    const mobileNav = {
      hamburgerMenu: null,
      mobileToggle: null,
      responsiveNavigation: null,
      mobileSpecificElements: []
    };

    // Detect hamburger menu
    mobileNav.hamburgerMenu = this._detectHamburgerMenu(document);
    
    // Detect mobile toggle buttons
    mobileNav.mobileToggle = this._detectMobileToggle(document);
    
    // Analyze responsive navigation
    mobileNav.responsiveNavigation = this._analyzeResponsiveNavigation(document);
    
    // Detect mobile-specific navigation elements
    mobileNav.mobileSpecificElements = this._detectMobileSpecificElements(document);

    return mobileNav;
  }

  /**
   * Extract navigation items from a container
   */
  _extractNavigationItems(container) {
    const items = [];
    const links = container.querySelectorAll('a');
    
    links.forEach((link, index) => {
      items.push({
        id: `nav_item_${index}`,
        text: link.textContent?.trim() || '',
        href: link.getAttribute('href') || '',
        level: this._getNavigationLevel(link, container),
        isActive: this._isActiveNavItem(link),
        hasSubmenu: this._hasSubmenu(link),
        accessible: this._isNavItemAccessible(link),
        position: this._getElementPosition(link)
      });
    });

    return items;
  }

  /**
   * Analyze navigation structure
   */
  _analyzeNavigationStructure(navElement) {
    return {
      tagName: navElement.tagName.toLowerCase(),
      listBased: !!navElement.querySelector('ul, ol'),
      levels: this._calculateNavigationLevels(navElement),
      totalItems: navElement.querySelectorAll('a').length,
      hasDropdowns: !!navElement.querySelector('.dropdown, .submenu, [aria-haspopup]'),
      isMega: this._isMegaMenu(navElement)
    };
  }

  /**
   * Get navigation location
   */
  _getNavigationLocation(navElement) {
    const rect = navElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      inViewport: rect.top >= 0 && rect.top <= viewportHeight,
      inHeader: !!navElement.closest('header'),
      inFooter: !!navElement.closest('footer'),
      inSidebar: !!navElement.closest('.sidebar, .aside, aside'),
      position: this._getElementPosition(navElement)
    };
  }

  /**
   * Get navigation styling information
   */
  _getNavigationStyle(navElement) {
    const style = window.getComputedStyle ? window.getComputedStyle(navElement) : navElement.style;
    
    return {
      display: style.display || '',
      position: style.position || '',
      backgroundColor: style.backgroundColor || '',
      orientation: this._getNavigationOrientation(navElement),
      alignment: this._getNavigationAlignment(navElement),
      spacing: this._getNavigationSpacing(navElement)
    };
  }

  /**
   * Calculate navigation depth
   */
  _calculateNavigationDepth(navigation) {
    let maxDepth = 0;
    
    Object.values(navigation).forEach(nav => {
      if (nav && nav.structure && nav.structure.levels) {
        maxDepth = Math.max(maxDepth, nav.structure.levels);
      }
    });
    
    return maxDepth;
  }

  /**
   * Calculate navigation complexity
   */
  _calculateNavigationComplexity(navigation) {
    let totalItems = 0;
    let totalSections = 0;
    
    Object.values(navigation).forEach(nav => {
      if (nav && nav.elements) {
        totalItems += nav.elements.length;
        totalSections++;
      }
    });
    
    return {
      totalItems,
      totalSections,
      averageItemsPerSection: totalSections > 0 ? Math.round(totalItems / totalSections) : 0,
      complexityScore: this._calculateComplexityScore(totalItems, totalSections)
    };
  }

  /**
   * Analyze navigation accessibility
   */
  _analyzeNavigationAccessibility(document) {
    return {
      landmarks: document.querySelectorAll('nav, [role="navigation"]').length,
      skipLinks: document.querySelectorAll('a[href^="#"][class*="skip"], .skip-link').length,
      ariaLabels: document.querySelectorAll('nav[aria-label], [role="navigation"][aria-label]').length,
      keyboardNavigation: this._analyzeKeyboardNavigation(document),
      focusManagement: this._analyzeFocusManagement(document)
    };
  }

  /**
   * Detect search functionality
   */
  _detectSearchFunctionality(document) {
    const search = {
      found: false,
      type: null,
      location: null,
      features: []
    };

    const searchSelectors = [
      'input[type="search"]',
      '.search-input',
      '.search-box',
      '.search-field',
      '[placeholder*="search"]',
      '[name*="search"]'
    ];

    for (const selector of searchSelectors) {
      const searchElement = document.querySelector(selector);
      if (searchElement) {
        search.found = true;
        search.type = this._identifySearchType(searchElement);
        search.location = this._getElementPosition(searchElement);
        search.features = this._analyzeSearchFeatures(searchElement);
        break;
      }
    }

    return search;
  }

  // Helper methods (simplified for brevity)
  _getNavigationLevel(link, container) {
    let level = 1;
    let current = link.parentElement;
    
    while (current && current !== container) {
      if (current.matches('ul, ol')) {
        level++;
      }
      current = current.parentElement;
    }
    
    return level;
  }

  _isActiveNavItem(link) {
    return link.classList.contains('active') || 
           link.classList.contains('current') ||
           link.getAttribute('aria-current') === 'page';
  }

  _hasSubmenu(link) {
    const parent = link.parentElement;
    return !!(parent && parent.querySelector('ul, ol, .submenu, .dropdown'));
  }

  _isNavItemAccessible(link) {
    return !!(link.textContent?.trim() || 
              link.getAttribute('aria-label') || 
              link.getAttribute('title'));
  }

  _getElementPosition(el) {
    try {
      const rect = el.getBoundingClientRect();
      return {
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    } catch (e) {
      return { top: 0, left: 0, width: 0, height: 0 };
    }
  }

  _calculateNavigationLevels(navElement) {
    const nestedLists = navElement.querySelectorAll('ul ul, ol ol');
    return nestedLists.length + 1;
  }

  _isMegaMenu(navElement) {
    return navElement.classList.contains('mega-menu') ||
           navElement.querySelector('.mega-menu') ||
           navElement.querySelectorAll('ul ul').length > 10;
  }

  _getNavigationOrientation(navElement) {
    const style = window.getComputedStyle ? window.getComputedStyle(navElement) : navElement.style;
    const flexDirection = style.flexDirection;
    
    if (flexDirection === 'column') return 'vertical';
    if (flexDirection === 'row') return 'horizontal';
    
    // Fallback: check if items are stacked vertically
    const items = navElement.querySelectorAll('a');
    if (items.length > 1) {
      const firstRect = items[0].getBoundingClientRect();
      const secondRect = items[1].getBoundingClientRect();
      
      return Math.abs(firstRect.top - secondRect.top) > Math.abs(firstRect.left - secondRect.left) 
        ? 'vertical' : 'horizontal';
    }
    
    return 'unknown';
  }

  _getNavigationAlignment(navElement) {
    const style = window.getComputedStyle ? window.getComputedStyle(navElement) : navElement.style;
    return {
      justifyContent: style.justifyContent || '',
      alignItems: style.alignItems || '',
      textAlign: style.textAlign || ''
    };
  }

  _getNavigationSpacing(navElement) {
    const style = window.getComputedStyle ? window.getComputedStyle(navElement) : navElement.style;
    return {
      padding: style.padding || '',
      margin: style.margin || '',
      gap: style.gap || ''
    };
  }

  _calculateComplexityScore(totalItems, totalSections) {
    // Simple complexity scoring algorithm
    const itemsScore = Math.min(totalItems / 10, 10);
    const sectionsScore = Math.min(totalSections / 5, 10);
    return Math.round((itemsScore + sectionsScore) / 2);
  }

  _analyzeKeyboardNavigation(document) {
    return {
      tabindexElements: document.querySelectorAll('[tabindex]').length,
      focusableElements: document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').length,
      accessKeys: document.querySelectorAll('[accesskey]').length
    };
  }

  _analyzeFocusManagement(document) {
    return {
      focusTraps: document.querySelectorAll('[data-focus-trap], .focus-trap').length,
      focusVisible: document.querySelectorAll(':focus-visible').length,
      skipToContent: document.querySelectorAll('.skip-to-content, [href="#content"], [href="#main"]').length
    };
  }

  // Placeholder methods for complex detection logic
  _identifyNavigationType(el, selector) { return selector.replace('.', ''); }
  _extractBreadcrumbItems(container) { return []; }
  _analyzeBreadcrumbStructure(container) { return {}; }
  _analyzeBreadcrumbAccessibility(container) { return {}; }
  _identifyPaginationType(container) { return 'numbered'; }
  _extractPaginationItems(container) { return []; }
  _findCurrentPage(container) { return 1; }
  _calculateTotalPages(container) { return 1; }
  _analyzePaginationAccessibility(container) { return {}; }
  _analyzeFooterNavSection(nav) { return {}; }
  _analyzeFooterNavStructure(footer) { return {}; }
  _detectHamburgerMenu(document) { return {}; }
  _detectMobileToggle(document) { return {}; }
  _analyzeResponsiveNavigation(document) { return {}; }
  _detectMobileSpecificElements(document) { return []; }
  _identifySearchType(element) { return 'basic'; }
  _analyzeSearchFeatures(element) { return []; }
}
