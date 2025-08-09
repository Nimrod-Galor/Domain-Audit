/**
 * ============================================================================
 * CART ANALYZER
 * ============================================================================
 *
 * Analyzes shopping cart functionality and usability including:
 * - Cart detection and accessibility
 * - Cart features and functionality
 * - Cart usability and user experience
 * - Add to cart buttons and controls
 *
 * @author Nimrod Galor
 * @version 1.0.0
 */

import { BaseAnalyzer } from '../../core/BaseAnalyzer.js';
import { AnalyzerCategories } from '../../core/AnalyzerInterface.js';

export class CartAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('CartAnalyzer', {
      enableCartDetection: options.enableCartDetection !== false,
      enableFeatureAnalysis: options.enableFeatureAnalysis !== false,
      enableUsabilityAnalysis: options.enableUsabilityAnalysis !== false,
      enableAccessibilityAnalysis: options.enableAccessibilityAnalysis !== false,
      maxCartElements: options.maxCartElements || 50,
      includeDetailedAnalysis: options.includeDetailedAnalysis !== false,
      ...options
    });

    this.version = '1.0.0';
    this.category = AnalyzerCategories.ECOMMERCE;

    this.cartSelectors = [
      ".cart",
      ".shopping-cart",
      ".basket",
      ".bag",
      "#cart",
      "#shopping-cart",
      "[data-cart]",
      ".minicart",
      ".cart-drawer",
    ];
    
    this.addToCartSelectors = [
      ".add-to-cart",
      ".add-cart",
      ".buy-now",
      "button[data-action*='cart']",
      "button[onclick*='cart']",
      ".purchase-button",
      ".order-button",
    ];
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: this.name,
      version: this.version,
      category: this.category,
      description: 'Comprehensive e-commerce cart functionality and usability analysis',
      features: [
        'Shopping cart detection',
        'Add to cart button analysis',
        'Cart feature assessment',
        'Usability evaluation',
        'Accessibility analysis',
        'Mobile optimization check',
        'Cart scoring system'
      ],
      config: this.options
    };
  }

  /**
   * Validate analysis context
   * @param {Object} context - Analysis context
   * @returns {boolean} Whether context is valid
   */
  validate(context) {
    if (!context?.document) {
      this.log('warn', 'No document provided for cart analysis');
      return false;
    }
    return true;
  }

  /**
   * Perform comprehensive cart analysis
   * @param {Object} context - Analysis context containing DOM and page data
   * @returns {Promise<Object>} Cart analysis results
   */
  async analyze(context) {
    const { document, url = '', pageData = {} } = context;

    this.log('info', 'Starting cart analysis');

    try {
      // Core cart analysis
      const cartElements = this._findCartElements(document);
      const addToCartButtons = this._findAddToCartButtons(document);
      const cartFeatures = this._analyzeCartFeatures(document);
      const cartUsability = this._analyzeCartUsability(cartElements, document);
      const cartAccessibility = this._analyzeCartAccessibility(cartElements, document);

      // Calculate scoring
      const score = this._calculateCartScore(cartFeatures, cartUsability, cartAccessibility, addToCartButtons.length);

      // Generate recommendations
      const recommendations = this._generateRecommendations(cartFeatures, cartUsability, cartAccessibility, addToCartButtons.length);

      // Create summary
      const summary = this._generateSummary(cartElements.length, addToCartButtons.length, score, cartFeatures);

      const result = {
        hasCart: cartElements.length > 0,
        cartCount: cartElements.length,
        cartElements: cartElements.slice(0, this.options.maxCartElements).map(el => ({
          tagName: el.tagName,
          className: el.className || '',
          id: el.id || '',
          visible: this._isElementVisible(el),
        })),
        addToCartButtons: {
          count: addToCartButtons.length,
          buttons: addToCartButtons.slice(0, this.options.maxCartElements).map(btn => ({
            text: btn.textContent?.trim() || '',
            tagName: btn.tagName,
            className: btn.className || '',
            visible: this._isElementVisible(btn),
          })),
        },
        features: cartFeatures,
        usability: cartUsability,
        accessibility: cartAccessibility,
        score,
        grade: this._getGradeFromScore(score),
        recommendations,
        summary,
        metadata: this.getMetadata()
      };

      this.log('info', `Cart analysis completed. Score: ${score}%, Grade: ${result.grade}`);
      return result;

    } catch (error) {
      return this.handleError(error, 'Cart analysis failed');
    }
  }

  /**
   * Find cart elements in the document
   */
  _findCartElements(document) {
    const elements = [];

    this.cartSelectors.forEach((selector) => {
      try {
        const found = this.safeQuery(document, selector);
        elements.push(...Array.from(found));
      } catch (error) {
        this.log('warn', `Failed to query cart selector ${selector}: ${error.message}`);
      }
    });

    // Remove duplicates
    return [...new Set(elements)];
  }

  /**
   * Find add to cart buttons
   */
  _findAddToCartButtons(document) {
    const buttons = [];

    this.addToCartSelectors.forEach((selector) => {
      try {
        const found = this.safeQuery(document, selector);
        buttons.push(...Array.from(found));
      } catch (error) {
        this.log('warn', `Failed to query add-to-cart selector ${selector}: ${error.message}`);
      }
    });

    return [...new Set(buttons)];
  }

  /**
   * Analyze cart features
   */
  _analyzeCartFeatures(document) {
    return {
      addToCart: this._hasAddToCartButtons(document),
      quantityControls: this._hasQuantityControls(document),
      removeItems: this._hasRemoveItemControls(document),
      updateCart: this._hasUpdateCartControls(document),
      subtotal: this._hasSubtotalDisplay(document),
      shipping: this._hasShippingCalculator(document),
      couponCode: this._hasCouponCodeField(document),
      guestCheckout: this._hasGuestCheckoutOption(document),
      savedCart: this._hasSavedCartFeature(document),
      cartSummary: this._hasCartSummary(document),
      continueShoppingLink: this._hasContinueShoppingLink(document),
      emptyCartOption: this._hasEmptyCartOption(document),
    };
  }

  /**
   * Analyze cart usability
   */
  _analyzeCartUsability(cartElements, document) {
    return {
      cartVisibility: this._checkCartVisibility(cartElements),
      cartAccessibility: this._checkCartAccessibility(cartElements),
      mobileOptimization: this._checkMobileOptimization(cartElements),
      loadingStates: this._checkLoadingStates(cartElements),
      errorHandling: this._checkErrorHandling(cartElements),
      cartPersistence: this._checkCartPersistence(cartElements, document),
      quickView: this._hasQuickView(cartElements, document),
    };
  }

  /**
   * Analyze cart accessibility
   */
  _analyzeCartAccessibility(cartElements, document) {
    return {
      keyboardAccessible: this._isKeyboardAccessible(cartElements),
      ariaLabels: this._hasAriaLabels(cartElements),
      screenReaderFriendly: this._isScreenReaderFriendly(cartElements),
      focusManagement: this._hasFocusManagement(cartElements, document),
      colorContrast: this._hasGoodColorContrast(cartElements),
    };
  }

  /**
   * Calculate cart score
   */
  _calculateCartScore(features, usability, accessibility, addToCartCount) {
    let score = 0;

    // Base score for having add to cart functionality
    if (addToCartCount > 0) {
      score += 20;
    }

    // Features score (40% of total)
    const featureCount = Object.values(features).filter(Boolean).length;
    const totalFeatures = Object.keys(features).length;
    const featureScore = (featureCount / totalFeatures) * 40;
    score += featureScore;

    // Usability score (25% of total)
    const usabilityCount = Object.values(usability).filter(Boolean).length;
    const totalUsability = Object.keys(usability).length;
    const usabilityScore = (usabilityCount / totalUsability) * 25;
    score += usabilityScore;

    // Accessibility score (15% of total)
    const accessibilityCount = Object.values(accessibility).filter(Boolean).length;
    const totalAccessibility = Object.keys(accessibility).length;
    const accessibilityScore = (accessibilityCount / totalAccessibility) * 15;
    score += accessibilityScore;

    return Math.round(Math.min(score, 100));
  }

  // Feature detection methods
  _hasAddToCartButtons(document) {
    return this._findAddToCartButtons(document).length > 0;
  }

  _hasQuantityControls(document) {
    const selectors = [
      'input[type="number"][name*="quantity"]',
      '.quantity-selector',
      '.qty-selector',
      '.quantity-input',
      'input[name="qty"]',
      '.quantity-controls',
    ];
    return selectors.some(selector => this.safeQuery(document, selector).length > 0);
  }

  _hasRemoveItemControls(document) {
    const selectors = [
      '.remove-item',
      '.delete-item',
      '.cart-remove',
      'button[data-action="remove"]',
      '.remove-from-cart',
      'a[href*="remove"]',
    ];
    return selectors.some(selector => this.safeQuery(document, selector).length > 0);
  }

  _hasUpdateCartControls(document) {
    const selectors = [
      '.update-cart',
      'button[value="update"]',
      'input[value*="update"]',
      '.refresh-cart',
      'button[name*="update"]',
    ];
    return selectors.some(selector => this.safeQuery(document, selector).length > 0);
  }

  _hasSubtotalDisplay(document) {
    const selectors = [
      '.subtotal',
      '.cart-subtotal',
      '.sub-total',
      '.order-subtotal',
      '.cart-total',
    ];
    const text = document.body?.textContent?.toLowerCase() || '';
    return selectors.some(selector => this.safeQuery(document, selector).length > 0) ||
           /subtotal|sub.?total/.test(text);
  }

  _hasShippingCalculator(document) {
    const selectors = [
      '.shipping-calculator',
      '.shipping-estimate',
      '.calculate-shipping',
      'input[name*="shipping"]',
      '.delivery-options',
    ];
    const text = document.body?.textContent?.toLowerCase() || '';
    return selectors.some(selector => this.safeQuery(document, selector).length > 0) ||
           /calculate shipping|shipping estimate|delivery options/.test(text);
  }

  _hasCouponCodeField(document) {
    const selectors = [
      'input[name*="coupon"]',
      'input[name*="promo"]',
      'input[name*="discount"]',
      '.coupon-code',
      '.promo-code',
      '.discount-code',
    ];
    return selectors.some(selector => this.safeQuery(document, selector).length > 0);
  }

  _hasGuestCheckoutOption(document) {
    const text = document.body?.textContent?.toLowerCase() || '';
    return /guest checkout|checkout as guest|continue without account/.test(text);
  }

  _hasSavedCartFeature(document) {
    const selectors = [
      '.save-cart',
      '.wishlist',
      '.save-for-later',
      'button[data-action*="save"]',
    ];
    const text = document.body?.textContent?.toLowerCase() || '';
    return selectors.some(selector => this.safeQuery(document, selector).length > 0) ||
           /save cart|save for later|add to wishlist/.test(text);
  }

  _hasCartSummary(document) {
    const selectors = [
      '.cart-summary',
      '.order-summary',
      '.cart-totals',
      '.checkout-summary',
    ];
    return selectors.some(selector => this.safeQuery(document, selector).length > 0);
  }

  _hasContinueShoppingLink(document) {
    const selectors = [
      '.continue-shopping',
      'a[href*="shop"]',
      'a[href*="products"]',
      'a[href*="catalog"]',
    ];
    const text = document.body?.textContent?.toLowerCase() || '';
    return selectors.some(selector => this.safeQuery(document, selector).length > 0) ||
           /continue shopping|back to shop|keep shopping/.test(text);
  }

  _hasEmptyCartOption(document) {
    const selectors = [
      '.empty-cart',
      '.clear-cart',
      'button[data-action*="clear"]',
    ];
    const text = document.body?.textContent?.toLowerCase() || '';
    return selectors.some(selector => this.safeQuery(document, selector).length > 0) ||
           /empty cart|clear cart|remove all/.test(text);
  }

  // Usability checking methods
  _checkCartVisibility(cartElements) {
    return cartElements.some(element => this._isElementVisible(element));
  }

  _checkCartAccessibility(cartElements) {
    return cartElements.some(element => {
      return element.getAttribute('role') || 
             element.getAttribute('aria-label') ||
             element.querySelector('[aria-label]');
    });
  }

  _checkMobileOptimization(cartElements) {
    return cartElements.some(element => {
      const classes = element.className.toLowerCase();
      return /mobile|responsive|adaptive/.test(classes) ||
             element.getAttribute('data-mobile') !== null;
    });
  }

  _checkLoadingStates(cartElements) {
    return cartElements.some(element => {
      const classes = element.className.toLowerCase();
      return /loading|spinner|progress/.test(classes) ||
             element.querySelector('.loading, .spinner, .progress');
    });
  }

  _checkErrorHandling(cartElements) {
    return cartElements.some(element => {
      return element.querySelector('.error, .alert, .warning, .message') ||
             element.getAttribute('data-error');
    });
  }

  _checkCartPersistence(cartElements, document) {
    // Check for localStorage, sessionStorage, or cookie usage indicators
    const scripts = Array.from(this.safeQuery(document, 'script'));
    return scripts.some(script => {
      const content = script.textContent || '';
      return /localStorage|sessionStorage|cookie.*cart/i.test(content);
    });
  }

  _hasQuickView(cartElements, document) {
    const selectors = [
      '.quick-view',
      '.mini-cart',
      '.cart-preview',
      '.cart-dropdown',
    ];
    return selectors.some(selector => this.safeQuery(document, selector).length > 0);
  }

  // Accessibility checking methods
  _isKeyboardAccessible(cartElements) {
    return cartElements.some(element => {
      const focusableElements = element.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      return focusableElements.length > 0;
    });
  }

  _hasAriaLabels(cartElements) {
    return cartElements.some(element => {
      return element.getAttribute('aria-label') ||
             element.getAttribute('aria-labelledby') ||
             element.querySelector('[aria-label], [aria-labelledby]');
    });
  }

  _isScreenReaderFriendly(cartElements) {
    return cartElements.some(element => {
      return element.getAttribute('role') ||
             element.querySelector('[role]') ||
             element.querySelector('.sr-only, .screen-reader-text');
    });
  }

  _hasFocusManagement(cartElements, document) {
    const scripts = Array.from(this.safeQuery(document, 'script'));
    return scripts.some(script => {
      const content = script.textContent || '';
      return /focus\(\)|\.focus|tabindex/i.test(content);
    });
  }

  _hasGoodColorContrast(cartElements) {
    // Basic check for contrast-related CSS classes
    return cartElements.some(element => {
      const classes = (element.className || '').toLowerCase();
      return /high-contrast|accessible|a11y/.test(classes);
    });
  }

  /**
   * Check if element is visible
   */
  _isElementVisible(element) {
    if (!element) return false;
    
    // Basic visibility checks without relying on window.getComputedStyle
    if (element.style) {
      if (element.style.display === 'none' ||
          element.style.visibility === 'hidden' ||
          element.style.opacity === '0') {
        return false;
      }
    }
    
    return !element.hidden;
  }

  /**
   * Generate recommendations based on analysis
   * @private
   */
  _generateRecommendations(features, usability, accessibility, addToCartCount) {
    const recommendations = [];

    if (addToCartCount === 0) {
      recommendations.push({
        priority: 'critical',
        category: 'functionality',
        issue: 'No add to cart buttons found',
        recommendation: 'Add clear and prominent "Add to Cart" buttons for products',
        impact: 'High - Essential for e-commerce functionality'
      });
    }

    if (!features.quantityControls) {
      recommendations.push({
        priority: 'high',
        category: 'functionality',
        issue: 'No quantity controls detected',
        recommendation: 'Add quantity selectors for cart items',
        impact: 'Medium - Improves user experience'
      });
    }

    if (!features.subtotal) {
      recommendations.push({
        priority: 'high',
        category: 'functionality',
        issue: 'No subtotal display found',
        recommendation: 'Display cart subtotal and total calculations',
        impact: 'High - Essential for transparency'
      });
    }

    if (!usability.cartVisibility) {
      recommendations.push({
        priority: 'high',
        category: 'usability',
        issue: 'Cart visibility issues detected',
        recommendation: 'Ensure cart is clearly visible and accessible',
        impact: 'High - Critical for user experience'
      });
    }

    if (!accessibility.keyboardAccessible) {
      recommendations.push({
        priority: 'high',
        category: 'accessibility',
        issue: 'Cart not keyboard accessible',
        recommendation: 'Implement keyboard navigation for cart functionality',
        impact: 'High - Required for accessibility compliance'
      });
    }

    if (!accessibility.ariaLabels) {
      recommendations.push({
        priority: 'medium',
        category: 'accessibility',
        issue: 'Missing ARIA labels',
        recommendation: 'Add proper ARIA labels for screen readers',
        impact: 'Medium - Improves accessibility'
      });
    }

    return recommendations;
  }

  /**
   * Generate summary of cart analysis
   * @private
   */
  _generateSummary(cartCount, buttonCount, score, features) {
    const featureCount = Object.values(features).filter(Boolean).length;
    const totalFeatures = Object.keys(features).length;

    return {
      overallScore: score,
      grade: this._getGradeFromScore(score),
      cartCount,
      buttonCount,
      featuresImplemented: featureCount,
      totalFeatures,
      completionRate: Math.round((featureCount / totalFeatures) * 100),
      status: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor',
      keyInsights: [
        `Found ${cartCount} cart element(s) and ${buttonCount} add-to-cart button(s)`,
        `${featureCount}/${totalFeatures} cart features implemented (${Math.round((featureCount / totalFeatures) * 100)}%)`,
        score >= 80 ? 'Excellent cart implementation' : score >= 60 ? 'Good cart functionality with room for improvement' : 'Cart implementation needs significant enhancement'
      ]
    };
  }

  /**
   * Get grade from numeric score
   * @private
   */
  _getGradeFromScore(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }
}
