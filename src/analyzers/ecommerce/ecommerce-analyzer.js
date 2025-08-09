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
 * @extends BaseAnalyzer
 */

import { BaseAnalyzer } from '../core/base-analyzer.js';
import { AnalyzerCategories } from '../utils/analyzer-categories.js';
import { ProductSchemaAnalyzer } from "./product/product-schema-analyzer.js";
import { CartAnalyzer } from "./checkout/cart-analyzer.js";
import { CheckoutAnalyzer } from "./checkout/checkout-analyzer.js";
import { PaymentAnalyzer } from "./checkout/payment-analyzer.js";
import { ReviewAnalyzer } from "./reviews/review-analyzer.js";
import { PlatformDetector } from "./platform/platform-detector.js";
import { ConversionOptimizer } from "./conversion/conversion-optimizer.js";
import { ECOMMERCE_STANDARDS } from "./utils/ecommerce-constants.js";

export class EcommerceAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('EcommerceAnalyzer');
    
    this.category = AnalyzerCategories.ECOMMERCE;
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
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'EcommerceAnalyzer',
      version: '1.0.0',
      category: AnalyzerCategories.ECOMMERCE,
      description: 'Comprehensive e-commerce optimization analysis',
      author: 'Nimrod Galor',
      capabilities: [
        'Product schema markup validation',
        'Shopping cart analysis',
        'Checkout process optimization',
        'Payment security analysis',
        'Review system evaluation',
        'Conversion optimization',
        'E-commerce platform detection'
      ]
    };
  }

  /**
   * Validate the context before analysis
   * @param {Object} context - Analysis context
   * @returns {boolean} Whether the context is valid
   */
  validate(context) {
    return context && 
           context.dom && 
           context.dom.window && 
           context.dom.window.document;
  }

  /**
   * Perform comprehensive e-commerce analysis
   * @param {Object} context - Analysis context containing dom, pageData, etc.
   * @returns {Object} E-commerce analysis results
   */
  async analyze(context) {
    try {
      this.log('Starting e-commerce analysis');
      
      // Validate context
      if (!this.validate(context)) {
        throw new Error('Invalid context provided for e-commerce analysis');
      }

      const { dom, pageData = {}, url = '' } = context;
      const document = dom.window.document;
      const analysisStart = Date.now();

      // Detect e-commerce type
      const siteType = this._detectEcommerceType(document, url);

      if (siteType === "none") {
        this.log('No e-commerce indicators detected');
        return {
          type: "non-ecommerce",
          message: "No e-commerce indicators detected",
          score: 0,
          recommendations: [],
          summary: { ecommerceType: 'None', optimizationLevel: 'N/A' },
          metadata: this.getMetadata(),
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

      // BaseAnalyzer integration: comprehensive scoring and summary
      const comprehensiveScore = this._calculateComprehensiveScore(analysis);
      const recommendations = this._generateEcommerceOptimizationRecommendations(analysis);
      const summary = this._generateEcommerceSummary(analysis);
      
      this.log('E-commerce analysis completed successfully');
      
      return {
        ...analysis,
        score: comprehensiveScore,
        recommendations: [...analysis.recommendations, ...recommendations],
        summary,
        metadata: this.getMetadata()
      };
    } catch (error) {
      return this.handleError('E-commerce analysis failed', error, {
        type: 'unknown',
        platform: null,
        product: null,
        checkout: null,
        reviews: null,
        security: null,
        conversion: null,
        schema: null,
        optimization: 0,
        recommendations: []
      });
    }
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

  /**
   * Calculate comprehensive e-commerce score for BaseAnalyzer integration
   * @param {Object} analysis - E-commerce analysis results
   * @returns {number} Comprehensive score (0-100)
   */
  _calculateComprehensiveScore(analysis) {
    try {
      const weights = {
        product: 0.25,        // 25% - Product features and schema
        checkout: 0.20,       // 20% - Checkout process
        security: 0.20,       // 20% - Payment security
        reviews: 0.15,        // 15% - Review system
        conversion: 0.20      // 20% - Conversion optimization
      };

      let totalScore = 0;
      let totalWeight = 0;

      // Product score (including schema)
      if (analysis.product || analysis.schema) {
        let productScore = 0;
        if (analysis.product?.score) productScore += analysis.product.score * 0.6;
        if (analysis.schema?.score) productScore += analysis.schema.score * 0.4;
        
        totalScore += productScore * weights.product;
        totalWeight += weights.product;
      }

      // Checkout score
      if (analysis.checkout?.score !== undefined) {
        totalScore += analysis.checkout.score * weights.checkout;
        totalWeight += weights.checkout;
      }

      // Security score
      if (analysis.security?.score !== undefined) {
        totalScore += analysis.security.score * weights.security;
        totalWeight += weights.security;
      }

      // Reviews score
      if (analysis.reviews?.score !== undefined) {
        totalScore += analysis.reviews.score * weights.reviews;
        totalWeight += weights.reviews;
      }

      // Conversion score
      if (analysis.conversion?.score !== undefined) {
        totalScore += analysis.conversion.score * weights.conversion;
        totalWeight += weights.conversion;
      }

      return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    } catch (error) {
      this.log('Error calculating comprehensive score:', error.message);
      return 0;
    }
  }

  /**
   * Generate comprehensive e-commerce optimization recommendations
   * @param {Object} analysis - E-commerce analysis results
   * @returns {Array} Enhanced recommendations
   */
  _generateEcommerceOptimizationRecommendations(analysis) {
    const recommendations = [];

    try {
      // Product optimization recommendations
      if (analysis.product && analysis.product.score < 80) {
        recommendations.push({
          category: 'product-optimization',
          priority: 'high',
          title: 'Enhance Product Pages',
          description: `Product optimization score: ${analysis.product.score}/100`,
          impact: 'Product visibility and conversion rates',
          actionItems: [
            'Add comprehensive product descriptions',
            'Include high-quality product images',
            'Implement product schema markup',
            'Add product reviews and ratings',
            'Include product specifications and features',
            'Optimize product URLs for SEO'
          ]
        });
      }

      // Checkout optimization
      if (analysis.checkout && analysis.checkout.score < 70) {
        recommendations.push({
          category: 'checkout-optimization',
          priority: 'high',
          title: 'Streamline Checkout Process',
          description: `Checkout optimization score: ${analysis.checkout.score}/100`,
          impact: 'Cart abandonment reduction and conversion improvement',
          actionItems: [
            'Reduce checkout steps to minimum',
            'Implement guest checkout option',
            'Add progress indicators',
            'Optimize forms for mobile devices',
            'Display shipping costs upfront',
            'Add trust badges and security indicators'
          ]
        });
      }

      // Payment security enhancements
      if (analysis.security && analysis.security.score < 80) {
        recommendations.push({
          category: 'payment-security',
          priority: 'high',
          title: 'Strengthen Payment Security',
          description: `Payment security score: ${analysis.security.score}/100`,
          impact: 'Customer trust and payment completion rates',
          actionItems: [
            'Implement SSL/TLS encryption',
            'Add security badges and certificates',
            'Use PCI DSS compliant payment processors',
            'Display privacy policy and terms clearly',
            'Add secure payment method logos',
            'Implement fraud detection measures'
          ]
        });
      }

      // Review system implementation
      if (analysis.reviews && analysis.reviews.score < 60) {
        recommendations.push({
          category: 'review-system',
          priority: 'medium',
          title: 'Implement Robust Review System',
          description: `Review system score: ${analysis.reviews.score}/100`,
          impact: 'Social proof and customer confidence',
          actionItems: [
            'Add customer review functionality',
            'Implement star rating system',
            'Display review summaries prominently',
            'Send automated review request emails',
            'Add photo/video review capabilities',
            'Implement review moderation system'
          ]
        });
      }

      // Conversion optimization
      if (analysis.conversion && analysis.conversion.score < 70) {
        recommendations.push({
          category: 'conversion-optimization',
          priority: 'medium',
          title: 'Optimize for Conversions',
          description: `Conversion optimization score: ${analysis.conversion.score}/100`,
          impact: 'Sales performance and revenue growth',
          actionItems: [
            'Enhance call-to-action buttons',
            'Add urgency and scarcity indicators',
            'Implement live chat support',
            'Optimize product recommendation engine',
            'Add abandoned cart recovery emails',
            'Use A/B testing for key elements'
          ]
        });
      }

      // Platform-specific optimizations
      if (analysis.platform) {
        const platform = analysis.platform.detected;
        if (platform && platform !== 'unknown') {
          recommendations.push({
            category: 'platform-optimization',
            priority: 'low',
            title: `Optimize ${platform} Configuration`,
            description: `Platform-specific optimization opportunities for ${platform}`,
            impact: 'Platform performance and feature utilization',
            actionItems: [
              `Review ${platform} best practices`,
              'Optimize platform-specific settings',
              'Use platform analytics and reporting',
              'Implement platform-recommended plugins',
              'Keep platform and extensions updated'
            ]
          });
        }
      }

      return recommendations;
    } catch (error) {
      this.log('Error generating e-commerce optimization recommendations:', error.message);
      return [];
    }
  }

  /**
   * Generate comprehensive e-commerce summary
   * @param {Object} analysis - E-commerce analysis results
   * @returns {Object} E-commerce summary
   */
  _generateEcommerceSummary(analysis) {
    try {
      const summary = {
        ecommerceType: analysis.type || 'Unknown',
        platform: 'Unknown',
        optimizationLevel: 'Poor',
        hasReviews: false,
        hasSecureCheckout: false,
        hasProductSchema: false,
        keyFindings: []
      };

      // Platform detection
      if (analysis.platform?.detected) {
        summary.platform = analysis.platform.detected;
        summary.keyFindings.push(`Platform: ${analysis.platform.detected}`);
      }

      // Optimization level
      const score = this._calculateComprehensiveScore(analysis);
      if (score >= 90) summary.optimizationLevel = 'Excellent';
      else if (score >= 80) summary.optimizationLevel = 'Good';
      else if (score >= 70) summary.optimizationLevel = 'Fair';
      else if (score >= 60) summary.optimizationLevel = 'Poor';
      else summary.optimizationLevel = 'Very Poor';

      // Review system
      if (analysis.reviews?.score > 60) {
        summary.hasReviews = true;
        summary.keyFindings.push('Review system implemented');
      }

      // Secure checkout
      if (analysis.security?.score > 70) {
        summary.hasSecureCheckout = true;
        summary.keyFindings.push('Secure payment processing detected');
      }

      // Product schema
      if (analysis.schema?.score > 60) {
        summary.hasProductSchema = true;
        summary.keyFindings.push('Product schema markup found');
      }

      // Additional findings
      if (analysis.checkout?.guestCheckout) {
        summary.keyFindings.push('Guest checkout available');
      }
      
      if (analysis.conversion?.trustSignals?.score > 70) {
        summary.keyFindings.push('Trust signals present');
      }

      if (summary.keyFindings.length === 0) {
        summary.keyFindings.push('Basic e-commerce setup detected');
      }

      return summary;
    } catch (error) {
      this.log('Error generating e-commerce summary:', error.message);
      return {
        ecommerceType: 'Unknown',
        platform: 'Unknown',
        optimizationLevel: 'Unknown',
        hasReviews: false,
        hasSecureCheckout: false,
        hasProductSchema: false,
        keyFindings: ['Analysis error occurred']
      };
    }
  }

  // ============================================================================
  // LEGACY COMPATIBILITY METHODS
  // ============================================================================

  /**
   * @deprecated Use analyze() method instead
   * Legacy method for backward compatibility
   */
  analyzeEcommerce(dom, pageData, url) {
    console.warn('EcommerceAnalyzer.analyzeEcommerce() is deprecated. Use analyze() method instead.');
    return this.analyze({ dom, pageData, url });
  }
}
