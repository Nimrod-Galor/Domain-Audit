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

import { BaseAnalyzer } from '../../core/BaseAnalyzer.js';
import { AnalyzerCategories } from '../../core/AnalyzerInterface.js';

export class CheckoutAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('CheckoutAnalyzer', {
      enableFlowAnalysis: options.enableFlowAnalysis !== false,
      enableFormAnalysis: options.enableFormAnalysis !== false,
      enableUXAnalysis: options.enableUXAnalysis !== false,
      enableProgressAnalysis: options.enableProgressAnalysis !== false,
      maxFormAnalysis: options.maxFormAnalysis || 20,
      includeDetailedAnalysis: options.includeDetailedAnalysis !== false,
      ...options
    });

    this.version = '1.0.0';
    this.category = AnalyzerCategories.ECOMMERCE;

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
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'CheckoutAnalyzer',
      version: this.version,
      description: 'Comprehensive checkout process optimization and user experience analysis',
      category: this.category,
      priority: 'high',
      capabilities: [
        'checkout_flow_analysis',
        'form_validation_analysis',
        'user_experience_optimization',
        'progress_indicator_analysis',
        'guest_checkout_detection',
        'payment_optimization',
        'checkout_scoring'
      ]
    };
  }

  /**
   * Validate analysis context
   * @param {Object} context - Analysis context
   * @returns {boolean} Whether context is valid
   */
  validate(context) {
    if (!context) {
      this.handleError('Analysis context is required');
      return false;
    }

    if (!context.document && !context.dom) {
      this.handleError('DOM document is required for checkout analysis');
      return false;
    }

    return true;
  }

  /**
   * Perform comprehensive checkout analysis
   * @param {Object} context - Analysis context containing DOM and page data
   * @returns {Promise<Object>} Checkout analysis results
   */
  async analyze(context) {
    const startTime = Date.now();

    try {
      if (!this.validate(context)) {
        return this.createErrorResult('Invalid analysis context');
      }

      this.log('info', 'Starting checkout process analysis');

      const document = context.document || context.dom;
      
      const checkoutElements = this._findCheckoutElements(document);
      const checkoutButtons = this._findCheckoutButtons(document);
      const checkoutFlow = this._analyzeCheckoutFlow(document);
      const formAnalysis = this._analyzeCheckoutForms(document);
      const userExperience = this._analyzeUserExperience(document);
      const progressIndicators = this._analyzeProgressIndicators(document);

      // Calculate comprehensive score
      const score = this._calculateCheckoutScore(checkoutFlow, formAnalysis, userExperience, progressIndicators);
      const grade = this._getGradeFromScore(score);

      // Generate recommendations
      const recommendations = this._generateRecommendations(checkoutFlow, formAnalysis, userExperience, progressIndicators);

      // Create summary
      const summary = this._generateSummary(score, checkoutElements, checkoutButtons);

      const data = {
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
        score,
        grade,
        recommendations,
        summary,
        metadata: this.getMetadata()
      };

      const endTime = Date.now();

      this.log('info', `Checkout analysis completed. Score: ${score}%, Grade: ${grade}`);
      
      return {
        success: true,
        data,
        performance: {
          analysisTime: endTime - startTime,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      return this.handleError('Checkout analysis failed', error);
    }
  }

  /**
   * Analyze checkout process (legacy method for backward compatibility)
   * @deprecated Use analyze() method instead
   * @param {Document} document - DOM document
   * @returns {Object} Checkout analysis results
   */
  analyzeCheckout(document) {
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
      const found = this.safeQuery(document, selector);
      if (found && found.length > 0) {
        elements.push(...Array.from(found));
      }
    });

    return [...new Set(elements)];
  }

  /**
   * Find checkout buttons
   */
  _findCheckoutButtons(document) {
    const buttons = [];

    this.checkoutButtonSelectors.forEach((selector) => {
      const found = this.safeQuery(document, selector);
      if (found && found.length > 0) {
        buttons.push(...Array.from(found));
      }
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
    return singlePageIndicators.some(selector => this.safeQueryOne(document, selector) !== null);
  }

  _isMultiStepCheckout(document) {
    const multiStepIndicators = [
      '.step-1, .step-2, .step-3',
      '.checkout-step',
      '.multi-step',
      '.wizard-step',
    ];
    const hasMultiStepElements = multiStepIndicators.some(selector => this.safeQueryOne(document, selector) !== null);
    const stepElements = this.safeQuery(document, '[class*="step"]');
    const hasMultipleSteps = stepElements && stepElements.length > 1;
    
    return hasMultiStepElements || hasMultipleSteps;
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
    return socialSelectors.some(selector => this.safeQueryOne(document, selector) !== null);
  }

  _hasAutoFillSupport(document) {
    const inputs = this.safeQuery(document, 'input');
    if (!inputs || inputs.length === 0) return false;
    return Array.from(inputs).some(input => input.getAttribute('autocomplete'));
  }

  _hasAddressValidation(document) {
    const scripts = this.safeQuery(document, 'script');
    if (!scripts || scripts.length === 0) return false;
    return Array.from(scripts).some(script => {
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
    return selectors.some(selector => this.safeQueryOne(document, selector) !== null);
  }

  // Form analysis methods
  _findCheckoutForms(document) {
    const forms = this.safeQuery(document, 'form');
    if (!forms || forms.length === 0) return [];
    return Array.from(forms).filter(form => this._isCheckoutForm(form));
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
    const inputs = this.safeQuery(form, 'input, select, textarea');
    const requiredFields = this.safeQuery(form, '[required]');
    const labels = this.safeQuery(form, 'label');
    
    const inputsArray = inputs ? Array.from(inputs) : [];
    const requiredArray = requiredFields ? Array.from(requiredFields) : [];
    const labelsArray = labels ? Array.from(labels) : [];
    
    return {
      fieldCount: inputsArray.length,
      requiredFields: requiredArray.length,
      hasLabels: labelsArray.length > 0,
      hasValidation: form.getAttribute('novalidate') === null,
      hasAutoComplete: inputsArray.some(input => input.getAttribute('autocomplete')),
      hasPlaceholders: inputsArray.some(input => input.placeholder),
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
      const inputs = this.safeQuery(form, 'input, select, textarea');
      const labels = this.safeQuery(form, 'label');
      const inputsArray = inputs ? Array.from(inputs) : [];
      const labelsArray = labels ? Array.from(labels) : [];
      return labelsArray.length >= inputsArray.length * 0.8; // At least 80% of inputs have labels
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
    return securitySelectors.some(selector => this.safeQueryOne(document, selector) !== null);
  }

  _hasTrustSignals(document) {
    const text = document.body.textContent.toLowerCase();
    return /money.?back guarantee|secure checkout|encrypted|protected|verified|trusted/.test(text);
  }

  _hasReturnPolicy(document) {
    const text = document.body.textContent.toLowerCase();
    return /return policy|refund policy|satisfaction guarantee/.test(text) ||
           this.safeQueryOne(document, 'a[href*="return"], a[href*="refund"]');
  }

  _hasShippingInfo(document) {
    const text = document.body.textContent.toLowerCase();
    return /shipping.*information|delivery.*options|shipping.*cost|free shipping/.test(text);
  }

  _hasContactInfo(document) {
    const text = document.body.textContent.toLowerCase();
    return /customer.*service|contact.*us|help.*desk|support/.test(text) ||
           this.safeQueryOne(document, 'a[href*="contact"], a[href*="support"]');
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
    return helpSelectors.some(selector => this.safeQueryOne(document, selector) !== null);
  }

  _isMobileOptimized(document) {
    const viewport = this.safeQueryOne(document, 'meta[name="viewport"]');
    const responsiveClasses = this.safeQueryOne(document, '[class*="mobile"], [class*="responsive"]');
    return viewport !== null || responsiveClasses !== null;
  }

  _hasLoadingIndicators(document) {
    const loadingSelectors = [
      '.loading',
      '.spinner',
      '.progress',
      '.loader',
    ];
    return loadingSelectors.some(selector => this.safeQueryOne(document, selector) !== null);
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
      const found = this.safeQuery(document, selector);
      if (found && found.length > 0) {
        elements.push(...Array.from(found));
      }
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
    return stepSelectors.some(selector => this.safeQueryOne(document, selector) !== null);
  }

  _hasBreadcrumbs(document) {
    const breadcrumbSelectors = [
      '.breadcrumb',
      '.breadcrumbs',
      'nav[aria-label*="breadcrumb"]',
      '.navigation-path',
    ];
    return breadcrumbSelectors.some(selector => this.safeQueryOne(document, selector) !== null);
  }

  _hasCurrentStepIndicator(document) {
    const currentStepSelectors = [
      '.current-step',
      '.active-step',
      '.step.active',
      '.step.current',
    ];
    return currentStepSelectors.some(selector => this.safeQueryOne(document, selector) !== null);
  }

  _hasCompletionStatus(document) {
    const completionSelectors = [
      '.completed',
      '.step-completed',
      '.done',
      '.finished',
    ];
    return completionSelectors.some(selector => this.safeQueryOne(document, selector) !== null);
  }

  /**
   * Generate checkout optimization recommendations
   */
  _generateRecommendations(flow, forms, ux, progress) {
    const recommendations = [];

    // Flow recommendations
    if (!flow.guestCheckout) {
      recommendations.push({
        type: 'flow',
        priority: 'high',
        title: 'Enable Guest Checkout',
        description: 'Allow customers to checkout without creating an account to reduce friction',
        impact: 'High - Can significantly reduce cart abandonment'
      });
    }

    if (!flow.multiStep && forms.formCount > 1) {
      recommendations.push({
        type: 'flow',
        priority: 'medium',
        title: 'Implement Multi-Step Checkout',
        description: 'Break complex forms into logical steps to improve user experience',
        impact: 'Medium - Improves completion rates for complex checkouts'
      });
    }

    if (!flow.autoFill) {
      recommendations.push({
        type: 'flow',
        priority: 'medium',
        title: 'Add AutoFill Support',
        description: 'Implement autocomplete attributes to enable browser autofill',
        impact: 'Medium - Speeds up form completion'
      });
    }

    // Form recommendations
    if (!forms.hasValidation) {
      recommendations.push({
        type: 'forms',
        priority: 'high',
        title: 'Add Form Validation',
        description: 'Implement client-side validation to provide immediate feedback',
        impact: 'High - Prevents submission errors and improves UX'
      });
    }

    if (!forms.hasClearLabels) {
      recommendations.push({
        type: 'forms',
        priority: 'high',
        title: 'Improve Form Labels',
        description: 'Ensure all form fields have clear, descriptive labels',
        impact: 'High - Improves accessibility and usability'
      });
    }

    // UX recommendations
    if (!ux.securityBadges) {
      recommendations.push({
        type: 'trust',
        priority: 'high',
        title: 'Add Security Badges',
        description: 'Display SSL certificates and security badges to build trust',
        impact: 'High - Increases customer confidence and conversions'
      });
    }

    if (!ux.returnPolicy) {
      recommendations.push({
        type: 'trust',
        priority: 'medium',
        title: 'Display Return Policy',
        description: 'Make return and refund policies easily accessible',
        impact: 'Medium - Reduces purchase hesitation'
      });
    }

    if (!ux.mobileOptimized) {
      recommendations.push({
        type: 'mobile',
        priority: 'high',
        title: 'Optimize for Mobile',
        description: 'Ensure checkout process works well on mobile devices',
        impact: 'High - Critical for mobile conversions'
      });
    }

    // Progress recommendations
    if (!progress.hasProgress && flow.multiStep) {
      recommendations.push({
        type: 'progress',
        priority: 'medium',
        title: 'Add Progress Indicators',
        description: 'Show customers their progress through the checkout process',
        impact: 'Medium - Reduces abandonment in multi-step checkouts'
      });
    }

    return recommendations.slice(0, 8); // Limit to top 8 recommendations
  }

  /**
   * Generate checkout analysis summary
   */
  _generateSummary(score, checkoutElements, checkoutButtons) {
    const hasCheckout = checkoutElements.length > 0 || checkoutButtons.length > 0;
    
    let summary = `Checkout analysis completed with a score of ${score}%.`;
    
    if (!hasCheckout) {
      summary += ' No checkout functionality detected on this page.';
    } else {
      summary += ` Found ${checkoutElements.length} checkout elements and ${checkoutButtons.length} checkout buttons.`;
      
      if (score >= 80) {
        summary += ' Checkout process is well-optimized with excellent user experience.';
      } else if (score >= 60) {
        summary += ' Checkout process has good functionality but could benefit from optimization.';
      } else if (score >= 40) {
        summary += ' Checkout process needs significant improvements for better conversion rates.';
      } else {
        summary += ' Checkout process requires major optimization to reduce abandonment.';
      }
    }
    
    return summary;
  }

  /**
   * Get grade from score
   */
  _getGradeFromScore(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
}
