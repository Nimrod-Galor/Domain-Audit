/**
 * ============================================================================
 * E-COMMERCE ANALYZER MODULE
 * ============================================================================
 *
 * Comprehensive e-commerce optimization analysis including:
 * - Product schema markup validation
 * - Shopping cart analysis
 * - Checkout process optimization
 * - Payment security indicators
 * - Product review systems
 * - Inventory management signals
 * - Conversion optimization analysis
 *
 * @author Nimrod Galor
 * @version 1.0.0
 */

import { ProductSchemaAnalyzer } from "./product/product-schema-analyzer.js";
import { CartAnalyzer } from "./checkout/cart-analyzer.js";
import { CheckoutAnalyzer } from "./checkout/checkout-analyzer.js";
import { PaymentAnalyzer } from "./checkout/payment-analyzer.js";
import { ReviewAnalyzer } from "./reviews/review-analyzer.js";
import { PlatformDetector } from "./platform/platform-detector.js";
import { ConversionOptimizer } from "./conversion/conversion-optimizer.js";
import { ECOMMERCE_STANDARDS } from "./utils/ecommerce-constants.js";

export class EcommerceAnalyzer {
  constructor(options = {}) {
    this.options = {
      enableProductAnalysis: true,
      enableCheckoutAnalysis: true,
      enableReviewAnalysis: true,
      enableSecurityAnalysis: true,
      enableConversionAnalysis: true,
      ...options,
    };

    // Initialize sub-analyzers
    this.analyzers = {
      productSchema: new ProductSchemaAnalyzer(options),
      cart: new CartAnalyzer(options),
      checkout: new CheckoutAnalyzer(options),
      payment: new PaymentAnalyzer(options),
      reviews: new ReviewAnalyzer(options),
      platform: new PlatformDetector(options),
      conversion: new ConversionOptimizer(options),
    };
  }

  /**
   * Perform comprehensive e-commerce analysis
   * @param {Object} dom - JSDOM document object
   * @param {Object} pageData - Existing page data
   * @param {string} url - Page URL
   * @returns {Object} E-commerce analysis results
   */
  async analyzeEcommerce(dom, pageData, url) {
    const analysisStart = Date.now();

    try {
      const document = dom.window.document;

      // Detect e-commerce type
      const siteType = this._detectEcommerceType(document, url);

      if (siteType === "none") {
        return {
          type: "non-ecommerce",
          message: "No e-commerce indicators detected",
          analysisTime: Date.now() - analysisStart,
          timestamp: new Date().toISOString(),
        };
      }

      // Comprehensive e-commerce analysis
      const analysis = {
        type: siteType,
        platform: await this._analyzePlatformDetection(dom, url),
        product: await this._analyzeProductFeatures(document, url),
        checkout: await this._analyzeCheckoutProcess(document, url),
        reviews: await this._analyzeReviewSystem(document),
        security: await this._analyzePaymentSecurity(document, url),
        conversion: await this._analyzeConversionOptimization(dom, pageData, url),
        schema: await this._analyzeEcommerceSchema(document),
      };

      // Calculate e-commerce optimization score
      analysis.optimization = this._calculateEcommerceScore(analysis);

      // Generate recommendations
      analysis.recommendations = this._generateEcommerceRecommendations(analysis);

      analysis.analysisTime = Date.now() - analysisStart;
      analysis.timestamp = new Date().toISOString();

      return analysis;
    } catch (error) {
      return {
        error: `E-commerce analysis failed: ${error.message}`,
        analysisTime: Date.now() - analysisStart,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Detect e-commerce platform and type
   */
  _detectEcommerceType(document, url) {
    const indicators = {
      shopify: [".shopify", "cdn.shopify.com", "/cart", "/checkout"],
      woocommerce: [".woocommerce", ".cart-contents", ".product"],
      magento: [".page-product", ".checkout-cart", "magento"],
      bigcommerce: [".productView", ".cart-item"],
      custom: [".add-to-cart", ".shopping-cart", ".product-price", ".checkout"],
    };

    // Platform detection logic
    for (const [platform, selectors] of Object.entries(indicators)) {
      for (const selector of selectors) {
        if (selector.startsWith('.')) {
          if (document.querySelector(selector)) {
            return platform;
          }
        } else {
          if (url.includes(selector) || document.documentElement.innerHTML.includes(selector)) {
            return platform;
          }
        }
      }
    }

    return "none";
  }

  /**
   * Analyze product features and optimization
   */
  async _analyzeProductFeatures(document, url) {
    return this.analyzers.productSchema.analyze(document, url);
  }

  /**
   * Analyze checkout process and cart functionality
   */
  async _analyzeCheckoutProcess(document, url) {
    const cartAnalysis = this.analyzers.cart.analyze(document);
    const checkoutAnalysis = this.analyzers.checkout.analyze(document);

    return {
      cart: cartAnalysis,
      checkout: checkoutAnalysis,
      overallScore: (cartAnalysis.score + checkoutAnalysis.score) / 2,
    };
  }

  /**
   * Analyze review system and customer feedback
   */
  async _analyzeReviewSystem(document) {
    return this.analyzers.reviews.analyze(document);
  }

  /**
   * Analyze payment security and trust indicators
   */
  async _analyzePaymentSecurity(document, url) {
    return this.analyzers.payment.analyze(document, url);
  }

  /**
   * Analyze e-commerce schema markup
   */
  async _analyzeEcommerceSchema(document) {
    return this.analyzers.productSchema.analyzeSchema(document);
  }

  /**
   * Analyze platform detection and technology stack
   */
  async _analyzePlatformDetection(dom, url) {
    try {
      const html = dom.html ? dom.html() : '';
      return this.analyzers.platform.detectPlatform(dom, url, html);
    } catch (error) {
      return {
        platform: 'unknown',
        confidence: 0,
        error: `Platform detection failed: ${error.message}`
      };
    }
  }

  /**
   * Enhanced conversion optimization analysis
   */
  async _analyzeConversionOptimization(dom, pageData = {}, url = '') {
    try {
      return this.analyzers.conversion.analyzeConversion(dom, pageData, url);
    } catch (error) {
      return {
        overallScore: 0,
        factors: {},
        recommendations: [],
        error: `Conversion analysis failed: ${error.message}`
      };
    }
  }

  /**
   * Calculate overall e-commerce optimization score
   */
  _calculateEcommerceScore(analysis) {
    const weights = {
      platform: 0.10,
      product: 0.25,
      checkout: 0.20,
      reviews: 0.15,
      security: 0.20,
      conversion: 0.10,
      schema: 0.05,
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([key, weight]) => {
      if (analysis[key] && analysis[key].score !== undefined) {
        totalScore += analysis[key].score * weight;
        totalWeight += weight;
      }
    });

    const score = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

    return {
      overall: score,
      breakdown: {
        product: analysis.product?.score || 0,
        checkout: analysis.checkout?.overallScore || 0,
        reviews: analysis.reviews?.score || 0,
        security: analysis.security?.score || 0,
        conversion: this._calculateConversionScore(analysis.conversion) || 0,
        schema: analysis.schema?.score || 0,
      },
      grade: this._getScoreGrade(score),
    };
  }

  /**
   * Generate e-commerce optimization recommendations
   */
  _generateEcommerceRecommendations(analysis) {
    const recommendations = [];

    // Product recommendations
    if (analysis.product && analysis.product.score < 80) {
      recommendations.push({
        category: "Product Optimization",
        priority: "high",
        issue: "Product schema markup incomplete",
        recommendation: "Add comprehensive product schema markup including price, availability, and reviews",
        impact: "Improves search engine visibility and rich snippets",
      });
    }

    // Checkout recommendations
    if (analysis.checkout && analysis.checkout.overallScore < 70) {
      recommendations.push({
        category: "Checkout Process",
        priority: "high",
        issue: "Checkout process needs optimization",
        recommendation: "Simplify checkout flow and add guest checkout option",
        impact: "Reduces cart abandonment and increases conversions",
      });
    }

    // Security recommendations
    if (analysis.security && analysis.security.score < 80) {
      recommendations.push({
        category: "Payment Security",
        priority: "critical",
        issue: "Payment security indicators missing",
        recommendation: "Add SSL certificates, security badges, and trust signals",
        impact: "Increases customer trust and reduces checkout abandonment",
      });
    }

    // Review recommendations
    if (analysis.reviews && analysis.reviews.score < 60) {
      recommendations.push({
        category: "Customer Reviews",
        priority: "medium",
        issue: "Review system not implemented",
        recommendation: "Implement customer review system with star ratings",
        impact: "Builds trust and provides social proof for products",
      });
    }

    return recommendations;
  }

  /**
   * Analyze call-to-action elements
   */
  _analyzeCTA(document) {
    const ctaSelectors = [
      '.add-to-cart',
      '.buy-now',
      '.purchase',
      '.order-now',
      '.get-started',
      '.shop-now'
    ];

    const ctas = [];
    ctaSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        ctas.push({
          text: element.textContent.trim(),
          tag: element.tagName.toLowerCase(),
          classes: element.className,
          visible: this._isElementVisible(element),
        });
      });
    });

    return {
      count: ctas.length,
      elements: ctas,
      hasProminent: ctas.some(cta => cta.visible),
      score: Math.min(ctas.length * 20, 100),
    };
  }

  /**
   * Analyze product photos and images
   */
  _analyzeProductPhotos(document) {
    const productImages = document.querySelectorAll('.product-image, .product-photo, [alt*="product"]');
    
    return {
      count: productImages.length,
      hasMultipleViews: productImages.length > 1,
      hasAltText: Array.from(productImages).every(img => img.alt),
      hasHighRes: Array.from(productImages).some(img => 
        img.naturalWidth > 800 || img.src.includes('large') || img.src.includes('high')
      ),
      score: productImages.length > 0 ? Math.min(productImages.length * 25, 100) : 0,
    };
  }

  /**
   * Analyze product descriptions
   */
  _analyzeProductDescriptions(document) {
    const descriptionSelectors = [
      '.product-description',
      '.product-details',
      '.description',
      '.product-info'
    ];

    let descriptions = [];
    descriptionSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      descriptions.push(...Array.from(elements));
    });

    const totalWords = descriptions.reduce((sum, desc) => {
      return sum + desc.textContent.trim().split(/\s+/).length;
    }, 0);

    return {
      count: descriptions.length,
      totalWords,
      averageWords: descriptions.length > 0 ? Math.round(totalWords / descriptions.length) : 0,
      hasDetailedDescription: totalWords > 50,
      score: totalWords > 100 ? 100 : Math.min(totalWords * 2, 100),
    };
  }

  /**
   * Analyze trust signals
   */
  _analyzeTrustSignals(document) {
    const trustIndicators = [
      'money-back guarantee',
      'free shipping',
      'secure checkout',
      'ssl',
      'trusted',
      'verified',
      'secure payment'
    ];

    const foundSignals = [];
    const text = document.body.textContent.toLowerCase();

    trustIndicators.forEach(indicator => {
      if (text.includes(indicator)) {
        foundSignals.push(indicator);
      }
    });

    return {
      signals: foundSignals,
      count: foundSignals.length,
      score: Math.min(foundSignals.length * 15, 100),
    };
  }

  /**
   * Analyze urgency indicators
   */
  _analyzeUrgencyIndicators(document) {
    const urgencyKeywords = [
      'limited time',
      'only.*left',
      'hurry',
      'sale ends',
      'while supplies last',
      'limited stock',
      'act now'
    ];

    const foundIndicators = [];
    const text = document.body.textContent.toLowerCase();

    urgencyKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'i');
      if (regex.test(text)) {
        foundIndicators.push(keyword);
      }
    });

    return {
      indicators: foundIndicators,
      count: foundIndicators.length,
      score: Math.min(foundIndicators.length * 20, 100),
    };
  }

  /**
   * Analyze social proof elements
   */
  _analyzeSocialProof(document) {
    const socialProofSelectors = [
      '.testimonial',
      '.review-count',
      '.customer-count',
      '.sales-count',
      '.rating'
    ];

    const socialProofElements = [];
    socialProofSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      socialProofElements.push(...Array.from(elements));
    });

    return {
      elements: socialProofElements.length,
      hasTestimonials: document.querySelector('.testimonial') !== null,
      hasReviewCount: document.querySelector('.review-count') !== null,
      hasRatings: document.querySelector('.rating') !== null,
      score: Math.min(socialProofElements.length * 25, 100),
    };
  }

  /**
   * Calculate conversion optimization score
   */
  _calculateConversionScore(conversionData) {
    if (!conversionData) return 0;

    const scores = [
      conversionData.callToAction?.score || 0,
      conversionData.productPhotos?.score || 0,
      conversionData.productDescriptions?.score || 0,
      conversionData.trustSignals?.score || 0,
      conversionData.urgencyIndicators?.score || 0,
      conversionData.socialProof?.score || 0,
    ];

    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  /**
   * Get score grade
   */
  _getScoreGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Check if element is visible
   */
  _isElementVisible(element) {
    const style = element.style;
    return !(
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.opacity === '0'
    );
  }
}
