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

export class CartAnalyzer {
  constructor(options = {}) {
    this.options = options;
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
   * Analyze shopping cart functionality
   * @param {Document} document - DOM document
   * @returns {Object} Cart analysis results
   */
  analyze(document) {
    const cartElements = this._findCartElements(document);
    const addToCartButtons = this._findAddToCartButtons(document);
    const cartFeatures = this._analyzeCartFeatures(document);
    const cartUsability = this._analyzeCartUsability(cartElements);
    const cartAccessibility = this._analyzeCartAccessibility(cartElements);

    return {
      hasCart: cartElements.length > 0,
      cartCount: cartElements.length,
      cartElements: cartElements.map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        visible: this._isElementVisible(el),
      })),
      addToCartButtons: {
        count: addToCartButtons.length,
        buttons: addToCartButtons.map(btn => ({
          text: btn.textContent.trim(),
          tagName: btn.tagName,
          className: btn.className,
          visible: this._isElementVisible(btn),
        })),
      },
      features: cartFeatures,
      usability: cartUsability,
      accessibility: cartAccessibility,
      score: this._calculateCartScore(cartFeatures, cartUsability, cartAccessibility, addToCartButtons.length),
    };
  }

  /**
   * Find cart elements in the document
   */
  _findCartElements(document) {
    const elements = [];

    this.cartSelectors.forEach((selector) => {
      const found = document.querySelectorAll(selector);
      elements.push(...Array.from(found));
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
      const found = document.querySelectorAll(selector);
      buttons.push(...Array.from(found));
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
  _analyzeCartUsability(cartElements) {
    return {
      cartVisibility: this._checkCartVisibility(cartElements),
      cartAccessibility: this._checkCartAccessibility(cartElements),
      mobileOptimization: this._checkMobileOptimization(cartElements),
      loadingStates: this._checkLoadingStates(cartElements),
      errorHandling: this._checkErrorHandling(cartElements),
      cartPersistence: this._checkCartPersistence(cartElements),
      quickView: this._hasQuickView(cartElements),
    };
  }

  /**
   * Analyze cart accessibility
   */
  _analyzeCartAccessibility(cartElements) {
    return {
      keyboardAccessible: this._isKeyboardAccessible(cartElements),
      ariaLabels: this._hasAriaLabels(cartElements),
      screenReaderFriendly: this._isScreenReaderFriendly(cartElements),
      focusManagement: this._hasFocusManagement(cartElements),
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
    return selectors.some(selector => document.querySelector(selector) !== null);
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
    return selectors.some(selector => document.querySelector(selector) !== null);
  }

  _hasUpdateCartControls(document) {
    const selectors = [
      '.update-cart',
      'button[value="update"]',
      'input[value*="update"]',
      '.refresh-cart',
      'button[name*="update"]',
    ];
    return selectors.some(selector => document.querySelector(selector) !== null);
  }

  _hasSubtotalDisplay(document) {
    const selectors = [
      '.subtotal',
      '.cart-subtotal',
      '.sub-total',
      '.order-subtotal',
      '.cart-total',
    ];
    const text = document.body.textContent.toLowerCase();
    return selectors.some(selector => document.querySelector(selector) !== null) ||
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
    const text = document.body.textContent.toLowerCase();
    return selectors.some(selector => document.querySelector(selector) !== null) ||
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
    return selectors.some(selector => document.querySelector(selector) !== null);
  }

  _hasGuestCheckoutOption(document) {
    const text = document.body.textContent.toLowerCase();
    return /guest checkout|checkout as guest|continue without account/.test(text);
  }

  _hasSavedCartFeature(document) {
    const selectors = [
      '.save-cart',
      '.wishlist',
      '.save-for-later',
      'button[data-action*="save"]',
    ];
    const text = document.body.textContent.toLowerCase();
    return selectors.some(selector => document.querySelector(selector) !== null) ||
           /save cart|save for later|add to wishlist/.test(text);
  }

  _hasCartSummary(document) {
    const selectors = [
      '.cart-summary',
      '.order-summary',
      '.cart-totals',
      '.checkout-summary',
    ];
    return selectors.some(selector => document.querySelector(selector) !== null);
  }

  _hasContinueShoppingLink(document) {
    const selectors = [
      '.continue-shopping',
      'a[href*="shop"]',
      'a[href*="products"]',
      'a[href*="catalog"]',
    ];
    const text = document.body.textContent.toLowerCase();
    return selectors.some(selector => document.querySelector(selector) !== null) ||
           /continue shopping|back to shop|keep shopping/.test(text);
  }

  _hasEmptyCartOption(document) {
    const selectors = [
      '.empty-cart',
      '.clear-cart',
      'button[data-action*="clear"]',
    ];
    const text = document.body.textContent.toLowerCase();
    return selectors.some(selector => document.querySelector(selector) !== null) ||
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

  _checkCartPersistence(cartElements) {
    // Check for localStorage, sessionStorage, or cookie usage indicators
    const scripts = Array.from(document.querySelectorAll('script'));
    return scripts.some(script => {
      const content = script.textContent;
      return /localStorage|sessionStorage|cookie.*cart/i.test(content);
    });
  }

  _hasQuickView(cartElements) {
    const selectors = [
      '.quick-view',
      '.mini-cart',
      '.cart-preview',
      '.cart-dropdown',
    ];
    return selectors.some(selector => document.querySelector(selector) !== null);
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

  _hasFocusManagement(cartElements) {
    const scripts = Array.from(document.querySelectorAll('script'));
    return scripts.some(script => {
      const content = script.textContent;
      return /focus\(\)|\.focus|tabindex/i.test(content);
    });
  }

  _hasGoodColorContrast(cartElements) {
    // Basic check for contrast-related CSS classes
    return cartElements.some(element => {
      const classes = element.className.toLowerCase();
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
}
