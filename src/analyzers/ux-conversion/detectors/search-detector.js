/**
 * ============================================================================
 * SITE SEARCH DETECTOR - UX CONVERSION ANALYSIS
 * ============================================================================
 * 
 * Detects and analyzes site search functionality including placement,
 * usability, and effectiveness. Critical for content discovery and
 * user experience optimization.
 * 
 * @version 2.0.0
 * @author Development Team
 * @phase Advanced UX & Conversion Analysis
 */

import { SEARCH_SELECTORS, UX_STANDARDS } from '../config/ux-standards.js';
import { UXAnalysisValidator } from '../core/contracts.js';
import { OptimizedBaseDetector } from '../core/detector-factory.js';

/**
 * Site Search Detection and Analysis - Optimized Version
 */
export class SearchDetector extends OptimizedBaseDetector {
  constructor(config = {}) {
    super();
    this.name = 'Search Detector';
    this.version = '2.0.0';
    
    this.config = {
      timeout: config.timeout || 5000,
      includeHidden: config.includeHidden || false,
      analyzeAutocomplete: config.analyzeAutocomplete !== false,
      testFunctionality: config.testFunctionality !== false,
      ...config
    };
    
    this.searchStandards = UX_STANDARDS.siteSearch;
    this.results = this._initializeResults();
  }

  /**
   * Get selectors for search element detection
   * @returns {Array} CSS selectors
   */
  getSelectors() {
    return [
      // Search forms
      'form[role="search"]',
      'form[class*="search"]',
      'form[id*="search"]',
      
      // Search inputs
      'input[type="search"]',
      'input[name*="search"]',
      'input[placeholder*="search"]',
      'input[id*="search"]',
      'input[class*="search"]',
      
      // Search buttons
      'button[type="submit"][form*="search"]',
      'button[class*="search"]',
      'button[aria-label*="search"]',
      'input[type="submit"][form*="search"]',
      
      // Search containers
      '.search-container',
      '#search-container',
      '.site-search',
      '#site-search'
    ];
  }

  /**
   * Validate search element for analysis
   * @param {Object} element - Element to validate
   * @returns {boolean} Whether element is valid
   */
  validateElement(element) {
    return this.utils.errors.isValidElement(element) && 
           (element.tagName === 'form' || 
            element.tagName === 'input' || 
            element.tagName === 'button');
  }

  /**
   * Analyze individual search element - optimized version
   * @param {Object} page - Playwright page object
   * @param {Object} element - Element to analyze
   * @returns {Promise<Object>} Element analysis
   */
  async analyzeElement(page, element) {
    const analysis = {
      type: this._detectSearchElementType(element),
      placement: this._analyzePlacementOptimized(element),
      functionality: await this._analyzeFunctionalityOptimized(page, element),
      accessibility: this._analyzeAccessibilityOptimized(element),
      design: this._analyzeDesignOptimized(element),
      confidence: 0
    };

    // Calculate confidence score
    analysis.confidence = this._calculateConfidenceOptimized(analysis);
    
    return analysis;
  }

  /**
   * Main detection and analysis method
   * @param {Object} page - Playwright page object
   * @returns {Promise<Object>} Search analysis results
   */
  async analyze(page) {
    try {
      // Detect search elements
      await this._detectSearchElements(page);
      
      // Analyze placement and visibility
      await this._analyzePlacement(page);
      
      // Test functionality if elements found
      if (this.results.elements.length > 0) {
        await this._analyzeFunctionality(page);
        await this._analyzeUsability(page);
        
        if (this.config.testFunctionality) {
          await this._testSearchFunctionality(page);
        }
      }
      
      // Calculate scores and generate recommendations
      this._calculateScores();
      this._generateRecommendations();
      
      return this.results;
      
    } catch (error) {
      this.results.errors.push({
        message: error.message,
        stack: error.stack,
        timestamp: Date.now()
      });
      
      return this.results;
    }
  }

  /**
   * Initialize results structure
   * @private
   */
  _initializeResults() {
    return {
      detected: false,
      elements: [],
      placement: {
        locations: [],
        visibility: {},
        accessibility: {}
      },
      functionality: {
        hasAutocomplete: false,
        hasFilters: false,
        hasAdvancedSearch: false,
        resultsPage: false,
        searchSuggestions: false
      },
      usability: {
        inputWidth: 0,
        placeholder: false,
        clearButton: false,
        keyboardNavigation: false,
        mobileOptimized: false
      },
      performance: {
        responseTime: 0,
        resultsQuality: 0,
        errorHandling: false
      },
      scores: {
        placement: 0,
        functionality: 0,
        usability: 0,
        overall: 0
      },
      recommendations: [],
      errors: [],
      warnings: []
    };
  }

  /**
   * Detect all search-related elements
   * @private
   */
  async _detectSearchElements(page) {
    const searchElements = [];
    
    // Try each selector pattern
    for (const selector of SEARCH_SELECTORS) {
      try {
        const elements = await page.$$(selector);
        
        for (const element of elements) {
          const elementInfo = await this._analyzeSearchElement(page, element);
          if (elementInfo && this._isValidSearchElement(elementInfo)) {
            searchElements.push(elementInfo);
          }
        }
      } catch (error) {
        // Continue with other selectors
        this.results.warnings.push(`Selector ${selector} failed: ${error.message}`);
      }
    }

    // Additional detection methods
    await this._detectSearchByText(page, searchElements);
    await this._detectSearchByForms(page, searchElements);
    
    this.results.elements = this._deduplicateElements(searchElements);
    this.results.detected = this.results.elements.length > 0;
  }

  /**
   * Analyze individual search element
   * @private
   */
  async _analyzeSearchElement(page, element) {
    try {
      const boundingBox = await element.boundingBox();
      const isVisible = await element.isVisible();
      const isEnabled = await element.isEnabled();
      
      // Get element attributes
      const attributes = await page.evaluate(el => {
        return {
          tagName: el.tagName.toLowerCase(),
          type: el.type || el.getAttribute('type'),
          name: el.name || el.getAttribute('name'),
          id: el.id,
          className: el.className,
          placeholder: el.placeholder || el.getAttribute('placeholder'),
          'aria-label': el.getAttribute('aria-label'),
          role: el.getAttribute('role'),
          autocomplete: el.getAttribute('autocomplete'),
          value: el.value,
          required: el.required
        };
      }, element);

      // Get parent form information
      const formInfo = await page.evaluate(el => {
        const form = el.closest('form');
        if (form) {
          return {
            action: form.action,
            method: form.method,
            id: form.id,
            className: form.className
          };
        }
        return null;
      }, element);

      return {
        element,
        boundingBox,
        isVisible,
        isEnabled,
        attributes,
        formInfo,
        confidence: this._calculateElementConfidence(attributes, formInfo)
      };

    } catch (error) {
      this.results.warnings.push(`Failed to analyze element: ${error.message}`);
      return null;
    }
  }

  /**
   * Calculate confidence that element is a search input
   * @private
   */
  _calculateElementConfidence(attributes, formInfo) {
    let confidence = 0;

    // Type-based scoring
    if (attributes.type === 'search') confidence += 40;
    if (attributes.role === 'search') confidence += 30;

    // Name/ID-based scoring
    const nameId = (attributes.name + ' ' + attributes.id).toLowerCase();
    if (nameId.includes('search')) confidence += 25;
    if (nameId.includes('query')) confidence += 20;
    if (nameId.includes('find')) confidence += 15;

    // Placeholder-based scoring
    if (attributes.placeholder) {
      const placeholder = attributes.placeholder.toLowerCase();
      if (placeholder.includes('search')) confidence += 20;
      if (placeholder.includes('find')) confidence += 15;
      if (placeholder.includes('look')) confidence += 10;
    }

    // aria-label scoring
    if (attributes['aria-label']) {
      const ariaLabel = attributes['aria-label'].toLowerCase();
      if (ariaLabel.includes('search')) confidence += 20;
    }

    // Form context scoring
    if (formInfo) {
      const formClass = (formInfo.className || '').toLowerCase();
      const formId = (formInfo.id || '').toLowerCase();
      if (formClass.includes('search') || formId.includes('search')) {
        confidence += 15;
      }
    }

    // Class name scoring
    if (attributes.className) {
      const className = attributes.className.toLowerCase();
      if (className.includes('search')) confidence += 15;
      if (className.includes('query')) confidence += 10;
    }

    return Math.min(confidence, 100);
  }

  /**
   * Validate if element is likely a search input
   * @private
   */
  _isValidSearchElement(elementInfo) {
    return elementInfo.confidence >= 50 && 
           elementInfo.attributes.tagName === 'input' &&
           elementInfo.isVisible;
  }

  /**
   * Detect search by text patterns
   * @private
   */
  async _detectSearchByText(page, existingElements) {
    try {
      const textBasedElements = await page.$$eval('input[type="text"]', inputs => {
        return inputs
          .map((input, index) => {
            const labels = [];
            
            // Find associated labels
            if (input.id) {
              const label = document.querySelector(`label[for="${input.id}"]`);
              if (label) labels.push(label.textContent.trim());
            }
            
            // Find nearby text
            const parent = input.parentElement;
            if (parent) {
              const siblingText = Array.from(parent.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent.trim())
                .join(' ');
              if (siblingText) labels.push(siblingText);
            }

            return {
              index,
              labels: labels.join(' ').toLowerCase(),
              placeholder: (input.placeholder || '').toLowerCase(),
              name: (input.name || '').toLowerCase(),
              id: (input.id || '').toLowerCase()
            };
          })
          .filter(info => {
            const allText = info.labels + ' ' + info.placeholder + ' ' + info.name + ' ' + info.id;
            return allText.includes('search') || 
                   allText.includes('find') || 
                   allText.includes('query') ||
                   allText.includes('buscar') || // Spanish
                   allText.includes('chercher') || // French
                   allText.includes('suchen'); // German
          });
      });

      // Add qualified text-based elements
      for (const textInfo of textBasedElements) {
        const elements = await page.$$('input[type="text"]');
        if (elements[textInfo.index]) {
          const elementInfo = await this._analyzeSearchElement(page, elements[textInfo.index]);
          if (elementInfo && !this._isDuplicate(elementInfo, existingElements)) {
            elementInfo.confidence = Math.max(elementInfo.confidence, 60);
            existingElements.push(elementInfo);
          }
        }
      }
    } catch (error) {
      this.results.warnings.push(`Text-based detection failed: ${error.message}`);
    }
  }

  /**
   * Detect search by form analysis
   * @private
   */
  async _detectSearchByForms(page, existingElements) {
    try {
      const searchForms = await page.$$eval('form', forms => {
        return forms
          .map((form, index) => {
            const formData = {
              index,
              action: form.action || '',
              className: form.className || '',
              id: form.id || '',
              inputs: Array.from(form.querySelectorAll('input')).length
            };
            
            const searchTerms = (formData.action + ' ' + formData.className + ' ' + formData.id).toLowerCase();
            const isSearchForm = searchTerms.includes('search') || 
                               searchTerms.includes('query') ||
                               searchTerms.includes('find');
            
            return isSearchForm ? formData : null;
          })
          .filter(Boolean);
      });

      // Analyze inputs in search forms
      for (const formInfo of searchForms) {
        const forms = await page.$$('form');
        if (forms[formInfo.index]) {
          const inputs = await forms[formInfo.index].$$('input[type="text"], input[type="search"], input:not([type])');
          
          for (const input of inputs) {
            const elementInfo = await this._analyzeSearchElement(page, input);
            if (elementInfo && !this._isDuplicate(elementInfo, existingElements)) {
              elementInfo.confidence = Math.max(elementInfo.confidence, 70);
              existingElements.push(elementInfo);
            }
          }
        }
      }
    } catch (error) {
      this.results.warnings.push(`Form-based detection failed: ${error.message}`);
    }
  }

  /**
   * Check if element is duplicate
   * @private
   */
  _isDuplicate(elementInfo, existingElements) {
    return existingElements.some(existing => {
      const box1 = elementInfo.boundingBox;
      const box2 = existing.boundingBox;
      
      if (!box1 || !box2) return false;
      
      // Check if same position (within 5px tolerance)
      return Math.abs(box1.x - box2.x) < 5 && 
             Math.abs(box1.y - box2.y) < 5 &&
             Math.abs(box1.width - box2.width) < 10;
    });
  }

  /**
   * Remove duplicate elements
   * @private
   */
  _deduplicateElements(elements) {
    const unique = [];
    
    for (const element of elements) {
      if (!this._isDuplicate(element, unique)) {
        unique.push(element);
      }
    }
    
    return unique.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Analyze search placement and visibility
   * @private
   */
  async _analyzePlacement(page) {
    if (this.results.elements.length === 0) {
      this.results.placement.visibility.score = 0;
      return;
    }

    for (const elementInfo of this.results.elements) {
      const placement = await this._getElementPlacement(page, elementInfo);
      this.results.placement.locations.push(placement);
    }

    // Analyze overall placement quality
    this._analyzePlacementQuality();
  }

  /**
   * Get element placement information
   * @private
   */
  async _getElementPlacement(page, elementInfo) {
    const box = elementInfo.boundingBox;
    const viewport = await page.viewportSize();
    
    return {
      element: elementInfo,
      position: {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height
      },
      viewport: {
        width: viewport.width,
        height: viewport.height
      },
      placement: {
        isAboveFold: box.y < viewport.height,
        isInHeader: box.y < viewport.height * 0.2,
        isInNav: await this._isInNavigation(page, elementInfo.element),
        isCentered: Math.abs((box.x + box.width/2) - viewport.width/2) < viewport.width * 0.1,
        rightAligned: box.x > viewport.width * 0.7
      },
      visibility: {
        visible: elementInfo.isVisible,
        enabled: elementInfo.isEnabled,
        opacity: await this._getElementOpacity(page, elementInfo.element),
        zIndex: await this._getElementZIndex(page, elementInfo.element)
      }
    };
  }

  /**
   * Check if element is in navigation area
   * @private
   */
  async _isInNavigation(page, element) {
    try {
      return await page.evaluate(el => {
        const nav = el.closest('nav, header, .nav, .navigation, .header, .menu');
        return nav !== null;
      }, element);
    } catch {
      return false;
    }
  }

  /**
   * Get element opacity
   * @private
   */
  async _getElementOpacity(page, element) {
    try {
      return await page.evaluate(el => {
        return window.getComputedStyle(el).opacity;
      }, element);
    } catch {
      return '1';
    }
  }

  /**
   * Get element z-index
   * @private
   */
  async _getElementZIndex(page, element) {
    try {
      return await page.evaluate(el => {
        return window.getComputedStyle(el).zIndex;
      }, element);
    } catch {
      return 'auto';
    }
  }

  /**
   * Analyze placement quality
   * @private
   */
  _analyzePlacementQuality() {
    let placementScore = 0;
    const locations = this.results.placement.locations;
    
    if (locations.length === 0) {
      this.results.placement.visibility.score = 0;
      return;
    }

    // Score based on best placement
    const bestPlacement = locations[0]; // Highest confidence element
    
    // Above fold scoring
    if (bestPlacement.placement.isAboveFold) placementScore += 30;
    
    // Header/navigation placement
    if (bestPlacement.placement.isInHeader || bestPlacement.placement.isInNav) {
      placementScore += 25;
    }
    
    // Visibility scoring
    if (bestPlacement.visibility.visible) placementScore += 20;
    if (bestPlacement.visibility.enabled) placementScore += 10;
    
    // Size scoring
    if (bestPlacement.position.width >= this.standards.minimumInputWidth) {
      placementScore += 15;
    }

    this.results.placement.visibility.score = Math.min(placementScore, 100);
  }

  /**
   * Analyze search functionality
   * @private
   */
  async _analyzeFunctionality(page) {
    const primaryElement = this.results.elements[0];
    
    if (!primaryElement) return;

    // Check for autocomplete
    this.results.functionality.hasAutocomplete = await this._checkAutocomplete(page, primaryElement);
    
    // Check for search suggestions
    this.results.functionality.searchSuggestions = await this._checkSearchSuggestions(page, primaryElement);
    
    // Check for advanced search
    this.results.functionality.hasAdvancedSearch = await this._checkAdvancedSearch(page);
    
    // Check for filters
    this.results.functionality.hasFilters = await this._checkFilters(page);
    
    // Check for results page
    this.results.functionality.resultsPage = await this._checkResultsPage(page, primaryElement);
  }

  /**
   * Check for autocomplete functionality
   * @private
   */
  async _checkAutocomplete(page, elementInfo) {
    try {
      const hasAutocomplete = await page.evaluate(el => {
        return el.getAttribute('autocomplete') !== 'off' &&
               el.getAttribute('autocomplete') !== 'false';
      }, elementInfo.element);

      return hasAutocomplete;
    } catch {
      return false;
    }
  }

  /**
   * Check for search suggestions
   * @private
   */
  async _checkSearchSuggestions(page, elementInfo) {
    try {
      // Look for datalist
      const hasDatalist = await page.evaluate(el => {
        const list = el.getAttribute('list');
        return list && document.getElementById(list);
      }, elementInfo.element);

      if (hasDatalist) return true;

      // Look for suggestion containers
      const suggestionSelectors = [
        '.search-suggestions',
        '.search-autocomplete',
        '.search-dropdown',
        '[data-suggestions]',
        '.autocomplete-suggestions'
      ];

      for (const selector of suggestionSelectors) {
        const suggestions = await page.$(selector);
        if (suggestions) return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Check for advanced search
   * @private
   */
  async _checkAdvancedSearch(page) {
    try {
      const advancedSearchSelectors = [
        '[href*="advanced"]',
        '[href*="search"]',
        '.advanced-search',
        '.search-advanced',
        'a[text*="Advanced"]'
      ];

      for (const selector of advancedSearchSelectors) {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.toLowerCase().includes('advanced')) {
            return true;
          }
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Check for filters
   * @private
   */
  async _checkFilters(page) {
    try {
      const filterSelectors = [
        '.filter',
        '.filters',
        '.search-filters',
        '[data-filter]',
        '.facet',
        '.facets'
      ];

      for (const selector of filterSelectors) {
        const filters = await page.$(selector);
        if (filters) return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Check for dedicated results page
   * @private
   */
  async _checkResultsPage(page, elementInfo) {
    try {
      const form = await page.evaluate(el => {
        return el.closest('form');
      }, elementInfo.element);

      if (!form) return false;

      const hasAction = await page.evaluate(f => {
        return f.action && f.action.length > 0;
      }, form);

      return hasAction;
    } catch {
      return false;
    }
  }

  /**
   * Analyze usability factors
   * @private
   */
  async _analyzeUsability(page) {
    const primaryElement = this.results.elements[0];
    
    if (!primaryElement) return;

    // Input width
    this.results.usability.inputWidth = primaryElement.boundingBox?.width || 0;
    
    // Placeholder text
    this.results.usability.placeholder = Boolean(primaryElement.attributes.placeholder);
    
    // Clear button
    this.results.usability.clearButton = await this._checkClearButton(page, primaryElement);
    
    // Keyboard navigation
    this.results.usability.keyboardNavigation = await this._checkKeyboardNavigation(page, primaryElement);
    
    // Mobile optimization
    this.results.usability.mobileOptimized = await this._checkMobileOptimization(page, primaryElement);
  }

  /**
   * Check for clear button
   * @private
   */
  async _checkClearButton(page, elementInfo) {
    try {
      // Check for clear button in same container
      const hasClearButton = await page.evaluate(el => {
        const container = el.parentElement;
        const clearSelectors = [
          '.clear', '.clear-search', '[data-clear]',
          'button[type="reset"]', '.search-clear'
        ];
        
        for (const selector of clearSelectors) {
          if (container.querySelector(selector)) return true;
        }
        
        return false;
      }, elementInfo.element);

      return hasClearButton;
    } catch {
      return false;
    }
  }

  /**
   * Check keyboard navigation support
   * @private
   */
  async _checkKeyboardNavigation(page, elementInfo) {
    try {
      const isKeyboardAccessible = await page.evaluate(el => {
        return el.tabIndex >= 0 || el.tagName.toLowerCase() === 'input';
      }, elementInfo.element);

      return isKeyboardAccessible;
    } catch {
      return false;
    }
  }

  /**
   * Check mobile optimization
   * @private
   */
  async _checkMobileOptimization(page, elementInfo) {
    const box = elementInfo.boundingBox;
    if (!box) return false;

    // Check minimum touch target size
    const isTouchFriendly = box.height >= 44 && box.width >= 150;
    
    // Check viewport meta tag
    const hasViewportMeta = await page.$('meta[name="viewport"]') !== null;
    
    return isTouchFriendly && hasViewportMeta;
  }

  /**
   * Test search functionality
   * @private
   */
  async _testSearchFunctionality(page) {
    const primaryElement = this.results.elements[0];
    
    if (!primaryElement) return;

    try {
      const startTime = Date.now();
      
      // Test basic search
      await primaryElement.element.fill('test search query');
      await primaryElement.element.press('Enter');
      
      // Wait for response
      await page.waitForTimeout(1000);
      
      const endTime = Date.now();
      this.results.performance.responseTime = endTime - startTime;
      
      // Check for results or redirect
      const currentUrl = page.url();
      const hasResults = await page.$('.search-results, .results, [data-results]') !== null;
      
      this.results.performance.resultsQuality = hasResults ? 80 : 
        (currentUrl.includes('search') || currentUrl.includes('query')) ? 60 : 20;
      
    } catch (error) {
      this.results.performance.responseTime = 0;
      this.results.performance.resultsQuality = 0;
      this.results.warnings.push(`Functionality test failed: ${error.message}`);
    }
  }

  /**
   * Calculate scores for all aspects
   * @private
   */
  _calculateScores() {
    this._calculatePlacementScore();
    this._calculateFunctionalityScore();
    this._calculateUsabilityScore();
    this._calculateOverallScore();
  }

  /**
   * Calculate placement score
   * @private
   */
  _calculatePlacementScore() {
    if (!this.results.detected) {
      this.results.scores.placement = 0;
      return;
    }

    // Use existing placement visibility score as base
    this.results.scores.placement = this.results.placement.visibility.score;
  }

  /**
   * Calculate functionality score
   * @private
   */
  _calculateFunctionalityScore() {
    if (!this.results.detected) {
      this.results.scores.functionality = 0;
      return;
    }

    let functionalityScore = 40; // Base score for having search

    if (this.results.functionality.hasAutocomplete) functionalityScore += 15;
    if (this.results.functionality.searchSuggestions) functionalityScore += 15;
    if (this.results.functionality.hasAdvancedSearch) functionalityScore += 10;
    if (this.results.functionality.hasFilters) functionalityScore += 10;
    if (this.results.functionality.resultsPage) functionalityScore += 10;

    this.results.scores.functionality = Math.min(functionalityScore, 100);
  }

  /**
   * Calculate usability score
   * @private
   */
  _calculateUsabilityScore() {
    if (!this.results.detected) {
      this.results.scores.usability = 0;
      return;
    }

    let usabilityScore = 20; // Base score

    // Input width scoring
    if (this.results.usability.inputWidth >= this.standards.recommendedInputWidth) {
      usabilityScore += 20;
    } else if (this.results.usability.inputWidth >= this.standards.minimumInputWidth) {
      usabilityScore += 15;
    }

    if (this.results.usability.placeholder) usabilityScore += 15;
    if (this.results.usability.clearButton) usabilityScore += 10;
    if (this.results.usability.keyboardNavigation) usabilityScore += 15;
    if (this.results.usability.mobileOptimized) usabilityScore += 20;

    this.results.scores.usability = Math.min(usabilityScore, 100);
  }

  /**
   * Calculate overall score
   * @private
   */
  _calculateOverallScore() {
    if (!this.results.detected) {
      this.results.scores.overall = 0;
      return;
    }

    // Weighted scoring
    const weights = {
      placement: 0.3,
      functionality: 0.4,
      usability: 0.3
    };

    this.results.scores.overall = Math.round(
      this.results.scores.placement * weights.placement +
      this.results.scores.functionality * weights.functionality +
      this.results.scores.usability * weights.usability
    );
  }

  /**
   * Generate recommendations
   * @private
   */
  _generateRecommendations() {
    if (!this.results.detected) {
      this.results.recommendations.push({
        priority: 'high',
        impact: 'high',
        category: 'Missing Functionality',
        title: 'Add Site Search',
        description: 'Implement site search functionality to help users find content',
        details: 'Site search is crucial for user experience and content discovery. Consider adding a prominent search input in the header or navigation area.',
        effort: 'medium'
      });
      return;
    }

    // Placement recommendations
    if (this.results.scores.placement < 75) {
      this._addPlacementRecommendations();
    }

    // Functionality recommendations
    if (this.results.scores.functionality < 75) {
      this._addFunctionalityRecommendations();
    }

    // Usability recommendations
    if (this.results.scores.usability < 75) {
      this._addUsabilityRecommendations();
    }
  }

  /**
   * Add placement recommendations
   * @private
   */
  _addPlacementRecommendations() {
    const primaryPlacement = this.results.placement.locations[0];
    
    if (!primaryPlacement?.placement.isAboveFold) {
      this.results.recommendations.push({
        priority: 'medium',
        impact: 'high',
        category: 'Search Placement',
        title: 'Move Search Above the Fold',
        description: 'Search input should be visible without scrolling',
        details: 'Position the search functionality in a prominent location that users can see immediately upon page load.',
        effort: 'low'
      });
    }

    if (!primaryPlacement?.placement.isInHeader && !primaryPlacement?.placement.isInNav) {
      this.results.recommendations.push({
        priority: 'medium',
        impact: 'medium',
        category: 'Search Placement',
        title: 'Move Search to Header/Navigation',
        description: 'Place search in the header or main navigation area',
        details: 'Users expect to find search functionality in the header or main navigation. This follows established design patterns.',
        effort: 'medium'
      });
    }
  }

  /**
   * Add functionality recommendations
   * @private
   */
  _addFunctionalityRecommendations() {
    if (!this.results.functionality.searchSuggestions) {
      this.results.recommendations.push({
        priority: 'medium',
        impact: 'medium',
        category: 'Search Functionality',
        title: 'Add Search Suggestions',
        description: 'Implement autocomplete or search suggestions',
        details: 'Search suggestions help users find content faster and reduce typing errors. Consider implementing live search suggestions or autocomplete functionality.',
        effort: 'medium'
      });
    }

    if (!this.results.functionality.resultsPage) {
      this.results.recommendations.push({
        priority: 'high',
        impact: 'high',
        category: 'Search Functionality',
        title: 'Create Dedicated Search Results Page',
        description: 'Implement a proper search results page',
        details: 'Users need a dedicated page to view and refine their search results. This should include result listings, pagination, and filtering options.',
        effort: 'high'
      });
    }
  }

  /**
   * Add usability recommendations
   * @private
   */
  _addUsabilityRecommendations() {
    if (this.results.usability.inputWidth < this.standards.minimumInputWidth) {
      this.results.recommendations.push({
        priority: 'low',
        impact: 'medium',
        category: 'Search Usability',
        title: 'Increase Search Input Width',
        description: `Search input should be at least ${this.standards.minimumInputWidth}px wide`,
        details: 'Wider search inputs allow users to see more of their query and appear more prominent on the page.',
        effort: 'low'
      });
    }

    if (!this.results.usability.placeholder) {
      this.results.recommendations.push({
        priority: 'low',
        impact: 'low',
        category: 'Search Usability',
        title: 'Add Placeholder Text',
        description: 'Include helpful placeholder text in the search input',
        details: 'Placeholder text like "Search products..." or "What are you looking for?" helps users understand what they can search for.',
        effort: 'low'
      });
    }

    if (!this.results.usability.mobileOptimized) {
      this.results.recommendations.push({
        priority: 'high',
        impact: 'high',
        category: 'Search Usability',
        title: 'Optimize Search for Mobile',
        description: 'Ensure search is touch-friendly and mobile-optimized',
        details: 'Mobile users need larger touch targets and easy access to search. Ensure the search input is at least 44px in height and easily accessible.',
        effort: 'medium'
      });
    }
  }
}

export default SearchDetector;
