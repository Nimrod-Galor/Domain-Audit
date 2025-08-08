/**
 * ============================================================================
 * CHECKOUT ANALYZER
 * ============================================================================
 *
 * Analyzes checkout process optimization and user experience including:
 * - Checkout flow analysis
 * - Form validation and usability
 * - Payment process optimization
 * - Guest checkout options
 * - Progress indicators
 *
 * @author Nimrod Galor
 * @version 1.0.0
 */

export class CheckoutAnalyzer {
  constructor(options = {}) {
    this.options = options;
    this.checkoutSelectors = [
      ".checkout",
      ".check-out",
      "#checkout",
      ".checkout-form",
      ".payment-form",
      ".order-form",
      ".billing-form",
    ];
    
    this.checkoutButtonSelectors = [
      ".checkout-button",
      ".proceed-checkout",
      "button[value*='checkout']",
      "a[href*='checkout']",
      ".proceed-to-checkout",
      ".go-to-checkout",
    ];
  }

  /**
   * Analyze checkout process
   * @param {Document} document - DOM document
   * @returns {Object} Checkout analysis results
   */
  analyze(document) {
    const checkoutElements = this._findCheckoutElements(document);
    const checkoutButtons = this._findCheckoutButtons(document);
    const checkoutFlow = this._analyzeCheckoutFlow(document);
    const formAnalysis = this._analyzeCheckoutForms(document);
    const userExperience = this._analyzeUserExperience(document);
    const progressIndicators = this._analyzeProgressIndicators(document);

    return {
      hasCheckout: checkoutElements.length > 0 || checkoutButtons.length > 0,
      checkoutElements: {
        count: checkoutElements.length,
        elements: checkoutElements.map(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
        })),
      },
      checkoutButtons: {
        count: checkoutButtons.length,
        buttons: checkoutButtons.map(btn => ({
          text: btn.textContent.trim(),
          tagName: btn.tagName,
          href: btn.href || null,
        })),
      },
      flow: checkoutFlow,
      forms: formAnalysis,
      userExperience,
      progressIndicators,
      score: this._calculateCheckoutScore(checkoutFlow, formAnalysis, userExperience, progressIndicators),
    };
  }

  /**
   * Find checkout elements
   */
  _findCheckoutElements(document) {
    const elements = [];

    this.checkoutSelectors.forEach((selector) => {
      const found = document.querySelectorAll(selector);
      elements.push(...Array.from(found));
    });

    return [...new Set(elements)];
  }

  /**
   * Find checkout buttons
   */
  _findCheckoutButtons(document) {
    const buttons = [];

    this.checkoutButtonSelectors.forEach((selector) => {
      const found = document.querySelectorAll(selector);
      buttons.push(...Array.from(found));
    });

    return [...new Set(buttons)];
  }

  /**
   * Analyze checkout flow
   */
  _analyzeCheckoutFlow(document) {
    return {
      singlePage: this._isSinglePageCheckout(document),
      multiStep: this._isMultiStepCheckout(document),
      guestCheckout: this._hasGuestCheckout(document),
      accountRequired: this._requiresAccount(document),
      socialLogin: this._hasSocialLogin(document),
      autoFill: this._hasAutoFillSupport(document),
      addressValidation: this._hasAddressValidation(document),
      orderReview: this._hasOrderReview(document),
    };
  }

  /**
   * Analyze checkout forms
   */
  _analyzeCheckoutForms(document) {
    const forms = this._findCheckoutForms(document);
    
    return {
      formCount: forms.length,
      forms: forms.map(form => this._analyzeForm(form)),
      hasValidation: this._hasFormValidation(forms),
      hasAutoComplete: this._hasAutoComplete(forms),
      hasClearLabels: this._hasClearLabels(forms),
      hasRequiredFields: this._hasRequiredFields(forms),
    };
  }

  /**
   * Analyze user experience elements
   */
  _analyzeUserExperience(document) {
    return {
      securityBadges: this._hasSecurityBadges(document),
      trustSignals: this._hasTrustSignals(document),
      returnPolicy: this._hasReturnPolicy(document),
      shippingInfo: this._hasShippingInfo(document),
      contactInfo: this._hasContactInfo(document),
      helpSupport: this._hasHelpSupport(document),
      mobileOptimized: this._isMobileOptimized(document),
      loadingIndicators: this._hasLoadingIndicators(document),
    };
  }

  /**
   * Analyze progress indicators
   */
  _analyzeProgressIndicators(document) {
    const progressElements = this._findProgressElements(document);
    
    return {
      hasProgress: progressElements.length > 0,
      progressElements: progressElements.length,
      stepIndicators: this._hasStepIndicators(document),
      breadcrumbs: this._hasBreadcrumbs(document),
      currentStep: this._hasCurrentStepIndicator(document),
      completionStatus: this._hasCompletionStatus(document),
    };
  }

  /**
   * Calculate checkout score
   */
  _calculateCheckoutScore(flow, forms, ux, progress) {
    let score = 0;

    // Flow optimization (30%)
    const flowFeatures = Object.values(flow).filter(Boolean).length;
    const totalFlowFeatures = Object.keys(flow).length;
    score += (flowFeatures / totalFlowFeatures) * 30;

    // Form optimization (30%)
    const formFeatures = Object.values(forms).filter(val => 
      typeof val === 'boolean' ? val : val > 0
    ).length;
    const totalFormFeatures = Object.keys(forms).length - 2; // Exclude formCount and forms array
    score += (formFeatures / totalFormFeatures) * 30;

    // User experience (25%)
    const uxFeatures = Object.values(ux).filter(Boolean).length;
    const totalUxFeatures = Object.keys(ux).length;
    score += (uxFeatures / totalUxFeatures) * 25;

    // Progress indicators (15%)
    const progressFeatures = Object.values(progress).filter(val => 
      typeof val === 'boolean' ? val : val > 0
    ).length;
    const totalProgressFeatures = Object.keys(progress).length - 2; // Exclude hasProgress and progressElements count
    score += (progressFeatures / totalProgressFeatures) * 15;

    return Math.round(Math.min(score, 100));
  }

  // Flow analysis methods
  _isSinglePageCheckout(document) {
    const singlePageIndicators = [
      '.single-page-checkout',
      '.one-page-checkout',
      '.checkout-onepage',
    ];
    return singlePageIndicators.some(selector => document.querySelector(selector) !== null);
  }

  _isMultiStepCheckout(document) {
    const multiStepIndicators = [
      '.step-1, .step-2, .step-3',
      '.checkout-step',
      '.multi-step',
      '.wizard-step',
    ];
    return multiStepIndicators.some(selector => document.querySelector(selector) !== null) ||
           document.querySelectorAll('[class*="step"]').length > 1;
  }

  _hasGuestCheckout(document) {
    const text = document.body.textContent.toLowerCase();
    return /guest checkout|checkout as guest|continue without account|checkout without registration/.test(text);
  }

  _requiresAccount(document) {
    const text = document.body.textContent.toLowerCase();
    return /create account|sign up required|registration required|login to checkout/.test(text);
  }

  _hasSocialLogin(document) {
    const socialSelectors = [
      '.facebook-login',
      '.google-login',
      '.twitter-login',
      '.apple-login',
      'button[class*="facebook"]',
      'button[class*="google"]',
    ];
    return socialSelectors.some(selector => document.querySelector(selector) !== null);
  }

  _hasAutoFillSupport(document) {
    const inputs = document.querySelectorAll('input');
    return Array.from(inputs).some(input => input.getAttribute('autocomplete'));
  }

  _hasAddressValidation(document) {
    const scripts = Array.from(document.querySelectorAll('script'));
    return scripts.some(script => {
      const content = script.textContent;
      return /address.*validation|postal.*code|zip.*validation/i.test(content);
    });
  }

  _hasOrderReview(document) {
    const selectors = [
      '.order-review',
      '.order-summary',
      '.review-order',
      '.order-confirmation',
    ];
    return selectors.some(selector => document.querySelector(selector) !== null);
  }

  // Form analysis methods
  _findCheckoutForms(document) {
    const forms = Array.from(document.querySelectorAll('form'));
    return forms.filter(form => this._isCheckoutForm(form));
  }

  _isCheckoutForm(form) {
    const formText = form.textContent.toLowerCase();
    const checkoutKeywords = [
      'checkout', 'billing', 'shipping', 'payment', 'order', 'purchase'
    ];
    
    return checkoutKeywords.some(keyword => formText.includes(keyword)) ||
           form.querySelector('input[name*="billing"], input[name*="shipping"], input[name*="payment"]');
  }

  _analyzeForm(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    const requiredFields = form.querySelectorAll('[required]');
    const labels = form.querySelectorAll('label');
    
    return {
      fieldCount: inputs.length,
      requiredFields: requiredFields.length,
      hasLabels: labels.length > 0,
      hasValidation: form.getAttribute('novalidate') === null,
      hasAutoComplete: Array.from(inputs).some(input => input.getAttribute('autocomplete')),
      hasPlaceholders: Array.from(inputs).some(input => input.placeholder),
    };
  }

  _hasFormValidation(forms) {
    return forms.some(form => 
      form.querySelector('[required]') ||
      form.querySelector('input[pattern]') ||
      form.querySelector('input[type="email"]')
    );
  }

  _hasAutoComplete(forms) {
    return forms.some(form => 
      form.querySelector('input[autocomplete]')
    );
  }

  _hasClearLabels(forms) {
    return forms.some(form => {
      const inputs = form.querySelectorAll('input, select, textarea');
      const labels = form.querySelectorAll('label');
      return labels.length >= inputs.length * 0.8; // At least 80% of inputs have labels
    });
  }

  _hasRequiredFields(forms) {
    return forms.some(form => form.querySelector('[required]'));
  }

  // User experience methods
  _hasSecurityBadges(document) {
    const securitySelectors = [
      '.security-badge',
      '.ssl-badge',
      '.trust-badge',
      'img[alt*="secure"]',
      'img[alt*="ssl"]',
    ];
    return securitySelectors.some(selector => document.querySelector(selector) !== null);
  }

  _hasTrustSignals(document) {
    const text = document.body.textContent.toLowerCase();
    return /money.?back guarantee|secure checkout|encrypted|protected|verified|trusted/.test(text);
  }

  _hasReturnPolicy(document) {
    const text = document.body.textContent.toLowerCase();
    return /return policy|refund policy|satisfaction guarantee/.test(text) ||
           document.querySelector('a[href*="return"], a[href*="refund"]');
  }

  _hasShippingInfo(document) {
    const text = document.body.textContent.toLowerCase();
    return /shipping.*information|delivery.*options|shipping.*cost|free shipping/.test(text);
  }

  _hasContactInfo(document) {
    const text = document.body.textContent.toLowerCase();
    return /customer.*service|contact.*us|help.*desk|support/.test(text) ||
           document.querySelector('a[href*="contact"], a[href*="support"]');
  }

  _hasHelpSupport(document) {
    const helpSelectors = [
      '.help',
      '.support',
      '.faq',
      '.customer-service',
      'a[href*="help"]',
      'a[href*="faq"]',
    ];
    return helpSelectors.some(selector => document.querySelector(selector) !== null);
  }

  _isMobileOptimized(document) {
    const viewport = document.querySelector('meta[name="viewport"]');
    const responsiveClasses = document.querySelector('[class*="mobile"], [class*="responsive"]');
    return viewport !== null || responsiveClasses !== null;
  }

  _hasLoadingIndicators(document) {
    const loadingSelectors = [
      '.loading',
      '.spinner',
      '.progress',
      '.loader',
    ];
    return loadingSelectors.some(selector => document.querySelector(selector) !== null);
  }

  // Progress indicator methods
  _findProgressElements(document) {
    const progressSelectors = [
      '.progress',
      '.progress-bar',
      '.checkout-progress',
      '.step-indicator',
      '.breadcrumb',
    ];
    
    const elements = [];
    progressSelectors.forEach(selector => {
      const found = document.querySelectorAll(selector);
      elements.push(...Array.from(found));
    });
    
    return [...new Set(elements)];
  }

  _hasStepIndicators(document) {
    const stepSelectors = [
      '.step-indicator',
      '.step-number',
      '.checkout-step',
      '[class*="step-"]',
    ];
    return stepSelectors.some(selector => document.querySelector(selector) !== null);
  }

  _hasBreadcrumbs(document) {
    const breadcrumbSelectors = [
      '.breadcrumb',
      '.breadcrumbs',
      'nav[aria-label*="breadcrumb"]',
      '.navigation-path',
    ];
    return breadcrumbSelectors.some(selector => document.querySelector(selector) !== null);
  }

  _hasCurrentStepIndicator(document) {
    const currentStepSelectors = [
      '.current-step',
      '.active-step',
      '.step.active',
      '.step.current',
    ];
    return currentStepSelectors.some(selector => document.querySelector(selector) !== null);
  }

  _hasCompletionStatus(document) {
    const completionSelectors = [
      '.completed',
      '.step-completed',
      '.done',
      '.finished',
    ];
    return completionSelectors.some(selector => document.querySelector(selector) !== null);
  }
}
