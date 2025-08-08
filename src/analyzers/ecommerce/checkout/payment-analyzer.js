/**
 * ============================================================================
 * PAYMENT ANALYZER
 * ============================================================================
 *
 * Analyzes payment security and trust indicators including:
 * - Payment method detection
 * - Security features analysis
 * - Trust signals and badges
 * - SSL and encryption verification
 * - Payment processor identification
 *
 * @author Nimrod Galor
 * @version 1.0.0
 */

export class PaymentAnalyzer {
  constructor(options = {}) {
    this.options = options;
    this.securityIndicators = [
      "ssl",
      "https",
      "secure",
      "encrypted",
      "pci",
      "verified",
      "protected",
      "safe",
      "trusted",
    ];
    
    this.paymentMethods = {
      stripe: ["stripe", "js.stripe.com"],
      paypal: ["paypal", "paypalobjects.com"],
      square: ["square", "squareup.com"],
      applePay: ["apple-pay", "applepay"],
      googlePay: ["google-pay", "googlepay", "g-pay"],
      amazonPay: ["amazon-pay", "amazonpayments"],
      shopifyPayments: ["shopify-pay", "shopifypay"],
      visa: ["visa"],
      mastercard: ["mastercard", "master-card"],
      amex: ["american-express", "amex"],
      discover: ["discover"],
    };
    
    this.trustBadges = [
      "verisign",
      "mcafee",
      "norton",
      "ssl-badge",
      "pci-compliant",
      "better-business-bureau",
      "trustpilot",
      "google-trusted-store",
    ];
  }

  /**
   * Analyze payment security and options
   * @param {Document} document - DOM document
   * @param {string} url - Page URL for security analysis
   * @returns {Object} Payment analysis results
   */
  analyze(document, url = '') {
    const securityFeatures = this._analyzeSecurityFeatures(document, url);
    const paymentOptions = this._analyzePaymentOptions(document);
    const trustSignals = this._analyzeTrustSignals(document);
    const paymentForms = this._analyzePaymentForms(document);
    const processorDetection = this._detectPaymentProcessors(document);

    return {
      security: securityFeatures,
      paymentMethods: paymentOptions,
      trustSignals,
      paymentForms,
      processors: processorDetection,
      score: this._calculatePaymentScore(
        securityFeatures,
        paymentOptions,
        trustSignals,
        paymentForms
      ),
    };
  }

  /**
   * Analyze security features
   */
  _analyzeSecurityFeatures(document, url = '') {
    return {
      httpsRequired: this._isHTTPS(url),
      securityBadges: this._findSecurityBadges(document),
      sslCertificate: this._checkSSLCertificate(url),
      securityHeaders: this._checkSecurityHeaders(),
      encryptionMentioned: this._checkEncryptionMentions(document),
      pciCompliance: this._checkPCICompliance(document),
      securityPolicies: this._findSecurityPolicies(document),
    };
  }

  /**
   * Analyze payment options
   */
  _analyzePaymentOptions(document) {
    const detectedMethods = [];

    Object.entries(this.paymentMethods).forEach(([method, indicators]) => {
      if (this._detectPaymentMethod(document, indicators)) {
        detectedMethods.push(method);
      }
    });

    return {
      supportedMethods: detectedMethods,
      methodCount: detectedMethods.length,
      digitalWallets: this._detectDigitalWallets(document),
      creditCards: this._detectCreditCardSupport(document),
      alternativePayments: this._detectAlternativePayments(document),
      buyNowPayLater: this._detectBuyNowPayLater(document),
    };
  }

  /**
   * Analyze trust signals
   */
  _analyzeTrustSignals(document) {
    const foundBadges = [];
    
    this.trustBadges.forEach(badge => {
      if (this._detectTrustBadge(document, badge)) {
        foundBadges.push(badge);
      }
    });

    return {
      trustBadges: foundBadges,
      badgeCount: foundBadges.length,
      moneyBackGuarantee: this._hasMoneyBackGuarantee(document),
      refundPolicy: this._hasRefundPolicy(document),
      privacyPolicy: this._hasPrivacyPolicy(document),
      termsOfService: this._hasTermsOfService(document),
      customerTestimonials: this._hasCustomerTestimonials(document),
      securityCertifications: this._hasSecurityCertifications(document),
    };
  }

  /**
   * Analyze payment forms
   */
  _analyzePaymentForms(document) {
    const paymentForms = this._findPaymentForms(document);
    
    return {
      formCount: paymentForms.length,
      hasPaymentForm: paymentForms.length > 0,
      formsAnalysis: paymentForms.map(form => this._analyzePaymentForm(form)),
      secureSubmission: this._hasSecureFormSubmission(paymentForms),
      fieldValidation: this._hasPaymentFieldValidation(paymentForms),
      autoComplete: this._hasPaymentAutoComplete(paymentForms),
    };
  }

  /**
   * Detect payment processors
   */
  _detectPaymentProcessors(document) {
    const processors = [];
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const text = document.documentElement.innerHTML.toLowerCase();

    // Check for common payment processor scripts and references
    const processorPatterns = {
      stripe: /stripe\.js|js\.stripe\.com/,
      paypal: /paypal|paypalobjects\.com/,
      square: /square|squareup\.com/,
      authorize: /authorize\.net/,
      braintree: /braintree/,
      worldpay: /worldpay/,
      cybersource: /cybersource/,
      adyen: /adyen/,
    };

    Object.entries(processorPatterns).forEach(([processor, pattern]) => {
      if (pattern.test(text) || scripts.some(script => pattern.test(script.src))) {
        processors.push(processor);
      }
    });

    return {
      detected: processors,
      count: processors.length,
      hasThirdPartyProcessor: processors.length > 0,
    };
  }

  /**
   * Calculate payment security score
   */
  _calculatePaymentScore(security, payments, trust, forms) {
    let score = 0;

    // Security features (40%)
    const securityFeatures = Object.values(security).filter(val => 
      typeof val === 'boolean' ? val : (Array.isArray(val) ? val.length > 0 : val > 0)
    ).length;
    const totalSecurityFeatures = Object.keys(security).length;
    score += (securityFeatures / totalSecurityFeatures) * 40;

    // Payment methods (25%)
    const paymentScore = Math.min(payments.methodCount * 10, 50) / 2; // Max 25 points
    score += paymentScore;

    // Trust signals (20%)
    const trustFeatures = Object.values(trust).filter(val => 
      typeof val === 'boolean' ? val : (Array.isArray(val) ? val.length > 0 : val > 0)
    ).length;
    const totalTrustFeatures = Object.keys(trust).length;
    score += (trustFeatures / totalTrustFeatures) * 20;

    // Payment forms (15%)
    const formFeatures = Object.values(forms).filter(val => 
      typeof val === 'boolean' ? val : (Array.isArray(val) ? val.length > 0 : val > 0)
    ).length;
    const totalFormFeatures = Object.keys(forms).length - 2; // Exclude formCount and formsAnalysis
    score += (formFeatures / totalFormFeatures) * 15;

    return Math.round(Math.min(score, 100));
  }

  // Security analysis methods
  _isHTTPS(url) {
    // Check URL protocol or assume HTTPS in testing environment
    if (url && typeof url === 'string') {
      return url.startsWith('https:');
    }
    return true; // Assume HTTPS in testing
  }

  _findSecurityBadges(document) {
    const badges = [];
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      const alt = (img.alt || '').toLowerCase();
      const src = (img.src || '').toLowerCase();
      
      this.securityIndicators.forEach(indicator => {
        if (alt.includes(indicator) || src.includes(indicator)) {
          badges.push({
            indicator,
            alt: img.alt,
            src: img.src,
          });
        }
      });
    });

    return badges;
  }

  _checkSSLCertificate(url = '') {
    // In a real browser environment, this would check the certificate
    return this._isHTTPS(url);
  }

  _checkSecurityHeaders() {
    // This would need to be implemented server-side or through additional tools
    // For now, we'll check for common security-related meta tags
    const securityMetas = document.querySelectorAll(
      'meta[http-equiv*="Security"], meta[name*="security"]'
    );
    return securityMetas.length > 0;
  }

  _checkEncryptionMentions(document) {
    const text = document.body.textContent.toLowerCase();
    const encryptionTerms = ['encryption', 'encrypted', 'ssl', 'tls', 'secure'];
    return encryptionTerms.some(term => text.includes(term));
  }

  _checkPCICompliance(document) {
    const text = document.body.textContent.toLowerCase();
    return /pci.?compliant|pci.?dss|payment.?card.?industry/.test(text);
  }

  _findSecurityPolicies(document) {
    const policies = [];
    const links = document.querySelectorAll('a[href]');
    
    const policyPatterns = {
      privacy: /privacy/i,
      security: /security/i,
      terms: /terms/i,
      cookie: /cookie/i,
    };

    Object.entries(policyPatterns).forEach(([policy, pattern]) => {
      const found = Array.from(links).find(link => 
        pattern.test(link.textContent) || pattern.test(link.href)
      );
      if (found) {
        policies.push(policy);
      }
    });

    return policies;
  }

  // Payment method detection
  _detectPaymentMethod(document, indicators) {
    const text = document.documentElement.innerHTML.toLowerCase();
    const images = document.querySelectorAll('img');
    
    return indicators.some(indicator => {
      // Check in text content
      if (text.includes(indicator.toLowerCase())) return true;
      
      // Check in image alt text and src
      return Array.from(images).some(img => {
        const alt = (img.alt || '').toLowerCase();
        const src = (img.src || '').toLowerCase();
        return alt.includes(indicator.toLowerCase()) || src.includes(indicator.toLowerCase());
      });
    });
  }

  _detectDigitalWallets(document) {
    const wallets = [];
    const walletMethods = ['apple-pay', 'google-pay', 'samsung-pay', 'paypal'];
    
    walletMethods.forEach(wallet => {
      if (this._detectPaymentMethod(document, [wallet])) {
        wallets.push(wallet);
      }
    });

    return wallets;
  }

  _detectCreditCardSupport(document) {
    const cards = [];
    const cardTypes = ['visa', 'mastercard', 'amex', 'discover'];
    
    cardTypes.forEach(card => {
      if (this._detectPaymentMethod(document, [card])) {
        cards.push(card);
      }
    });

    return cards;
  }

  _detectAlternativePayments(document) {
    const alternative = [];
    const altMethods = ['klarna', 'afterpay', 'sezzle', 'affirm', 'zip'];
    
    altMethods.forEach(method => {
      if (this._detectPaymentMethod(document, [method])) {
        alternative.push(method);
      }
    });

    return alternative;
  }

  _detectBuyNowPayLater(document) {
    const bnpl = [];
    const bnplMethods = ['klarna', 'afterpay', 'sezzle', 'affirm', 'zip', 'quadpay'];
    
    bnplMethods.forEach(method => {
      if (this._detectPaymentMethod(document, [method])) {
        bnpl.push(method);
      }
    });

    const text = document.body.textContent.toLowerCase();
    if (/buy now.?pay later|pay in.?\d+|split payment/.test(text)) {
      bnpl.push('generic-bnpl');
    }

    return bnpl;
  }

  // Trust signal detection
  _detectTrustBadge(document, badge) {
    const text = document.documentElement.innerHTML.toLowerCase();
    const images = document.querySelectorAll('img');
    
    // Check in text content
    if (text.includes(badge.toLowerCase())) return true;
    
    // Check in image alt text and src
    return Array.from(images).some(img => {
      const alt = (img.alt || '').toLowerCase();
      const src = (img.src || '').toLowerCase();
      return alt.includes(badge.toLowerCase()) || src.includes(badge.toLowerCase());
    });
  }

  _hasMoneyBackGuarantee(document) {
    const text = document.body.textContent.toLowerCase();
    return /money.?back.?guarantee|satisfaction.?guaranteed|100%.?guarantee/.test(text);
  }

  _hasRefundPolicy(document) {
    return document.querySelector('a[href*="refund"], a[href*="return"]') !== null ||
           /refund.?policy|return.?policy/.test(document.body.textContent.toLowerCase());
  }

  _hasPrivacyPolicy(document) {
    return document.querySelector('a[href*="privacy"]') !== null ||
           /privacy.?policy/.test(document.body.textContent.toLowerCase());
  }

  _hasTermsOfService(document) {
    return document.querySelector('a[href*="terms"]') !== null ||
           /terms.?of.?service|terms.?and.?conditions/.test(document.body.textContent.toLowerCase());
  }

  _hasCustomerTestimonials(document) {
    const testimonialSelectors = [
      '.testimonial', '.review', '.customer-review', '.feedback'
    ];
    return testimonialSelectors.some(selector => document.querySelector(selector) !== null);
  }

  _hasSecurityCertifications(document) {
    const text = document.body.textContent.toLowerCase();
    return /iso.?27001|soc.?2|pci.?dss|gdpr.?compliant/.test(text);
  }

  // Payment form analysis
  _findPaymentForms(document) {
    const forms = Array.from(document.querySelectorAll('form'));
    return forms.filter(form => this._isPaymentForm(form));
  }

  _isPaymentForm(form) {
    const formText = form.textContent.toLowerCase();
    const paymentKeywords = [
      'payment', 'credit card', 'billing', 'checkout', 'card number', 'expiry', 'cvv'
    ];
    
    return paymentKeywords.some(keyword => formText.includes(keyword)) ||
           form.querySelector('input[name*="card"], input[name*="payment"], input[name*="billing"]');
  }

  _analyzePaymentForm(form) {
    const cardInputs = form.querySelectorAll(
      'input[name*="card"], input[type="tel"][placeholder*="card"]'
    );
    const expiryInputs = form.querySelectorAll(
      'input[name*="expiry"], input[name*="exp"], input[placeholder*="expiry"]'
    );
    const cvvInputs = form.querySelectorAll(
      'input[name*="cvv"], input[name*="cvc"], input[name*="security"]'
    );
    
    return {
      hasCardField: cardInputs.length > 0,
      hasExpiryField: expiryInputs.length > 0,
      hasCvvField: cvvInputs.length > 0,
      isSecure: form.action.startsWith('https://') || !form.action,
      hasValidation: form.querySelector('[required]') !== null,
    };
  }

  _hasSecureFormSubmission(forms) {
    return forms.every(form => 
      form.action.startsWith('https://') || !form.action
    );
  }

  _hasPaymentFieldValidation(forms) {
    return forms.some(form => 
      form.querySelector('input[pattern], input[required], input[type="email"]')
    );
  }

  _hasPaymentAutoComplete(forms) {
    return forms.some(form => 
      form.querySelector('input[autocomplete*="cc-"], input[autocomplete*="card"]')
    );
  }
}
