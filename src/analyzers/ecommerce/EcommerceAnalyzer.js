import { BaseAnalyzer } from '../core/BaseAnalyzer.js';
import { AnalyzerCategories } from '../core/AnalyzerInterface.js';
import { ProductSchemaAnalyzer } from "./product/product-schema-analyzer.js";
import { CartAnalyzer } from "./checkout/cart-analyzer.js";
import { CheckoutAnalyzer } from "./checkout/checkout-analyzer.js";
import { PaymentAnalyzer } from "./checkout/payment-analyzer.js";
import { ReviewAnalyzer } from "./reviews/review-analyzer.js";
import { PlatformDetector } from "./platform/platform-detector.js";
import { ConversionOptimizer } from "./conversion/conversion-optimizer.js";
import { ECOMMERCE_STANDARDS } from "./utils/ecommerce-constants.js";

/**
 * E-commerce Analyzer
 * Comprehensive e-commerce optimization analysis including product schema, checkout, and conversion analysis
 * 
 * @fileoverview Advanced e-commerce analysis for online stores and shopping platforms
 * @version 1.0.0
 * @author Nimrod Galor
 * @date 2025-08-08
 */

export class EcommerceAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('EcommerceAnalyzer', {
      enableProductAnalysis: options.enableProductAnalysis !== false,
      enableCheckoutAnalysis: options.enableCheckoutAnalysis !== false,
      enableReviewAnalysis: options.enableReviewAnalysis !== false,
      enableSecurityAnalysis: options.enableSecurityAnalysis !== false,
      enableConversionAnalysis: options.enableConversionAnalysis !== false,
      ...options,
    });

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

  getMetadata() {
    return {
      name: 'EcommerceAnalyzer',
      version: '1.0.0',
      description: 'Comprehensive e-commerce optimization analysis including product schema, checkout, and conversion analysis',
      category: AnalyzerCategories.ECOMMERCE,
      priority: 'high'
    };
  }

  /**
   * Perform comprehensive e-commerce analysis
   * @param {Document} document - DOM document
   * @param {Object|string} pageDataOrUrl - Page data object or URL string
   * @param {string} url - Page URL
   * @returns {Promise<Object>} Analysis results
   */
  async analyze(context) {
    const {result, time} = await this.measureTime(async () => {
      try {
        this.log('info', 'Starting e-commerce analysis...');
        
        // Validate context
        if (!this.validate(context)) {
          return this.handleError(new Error('Invalid context provided'), 'validation');
        }

        const { document, url = '', pageData = {} } = context;

        // Detect e-commerce type
        const siteType = this._detectEcommerceType(document, url);

        if (siteType === "none") {
          this.log('info', 'No e-commerce indicators detected');
          return this.createSuccessResponse({
            data: {
              type: "non-ecommerce",
              message: "No e-commerce indicators detected",
              score: 0,
              platform: null,
              product: null,
              checkout: null,
              reviews: null,
              security: null,
              conversion: null,
              schema: null,
              optimization: { overallScore: 0, grade: 'N/A' },
              recommendations: []
            }
          });
        }

        // Comprehensive e-commerce analysis
        const analysis = {
          type: siteType,
          platform: await this._analyzePlatformDetection(document, url),
          product: await this._analyzeProductFeatures(document, url),
          checkout: await this._analyzeCheckoutProcess(document, url),
          reviews: await this._analyzeReviewSystem(document),
          security: await this._analyzePaymentSecurity(document, url),
          conversion: await this._analyzeConversionOptimization(document, pageData, url),
          schema: await this._analyzeEcommerceSchema(document),
        };

        // Calculate e-commerce optimization score
        analysis.optimization = this._calculateEcommerceScore(analysis);

        // Generate recommendations
        analysis.recommendations = this._generateEcommerceRecommendations(analysis);

        this.log('info', `E-commerce analysis completed for ${siteType} site with score: ${analysis.optimization.overallScore}`);
        
        return this.createSuccessResponse({
          data: analysis
        });

      } catch (error) {
        return this.handleError(error, 'e-commerce analysis');
      }
    });

    if (result.success) {
      result.analysisTime = time;
      return result;
    } else {
      // Return error response with fallback data
      return {
        success: false,
        error: result.error,
        data: {
          type: "error",
          platform: null,
          product: null,
          checkout: null,
          reviews: null,
          security: null,
          conversion: null,
          schema: null,
          optimization: { overallScore: 0, grade: 'F' },
          recommendations: ['Fix analysis errors to proceed with e-commerce optimization']
        },
        analysisTime: time,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Detect e-commerce platform and type
   */
  _detectEcommerceType(document, url) {
    try {
      // Check for e-commerce indicators
      const ecommerceIndicators = [
        // Cart indicators
        document.querySelector('[class*="cart"], [id*="cart"], [data-cart]'),
        document.querySelector('input[name*="add"], button[name*="add"]'),
        
        // Product indicators  
        document.querySelector('[class*="product"], [id*="product"]'),
        document.querySelector('[class*="price"], [id*="price"]'),
        document.querySelector('[itemtype*="Product"]'),
        
        // Checkout indicators
        document.querySelector('[class*="checkout"], [id*="checkout"]'),
        document.querySelector('form[action*="checkout"]'),
        
        // Platform-specific indicators
        document.querySelector('meta[name="generator"][content*="Shopify"]'),
        document.querySelector('script[src*="shopify"]'),
        document.querySelector('script[src*="woocommerce"]'),
        document.querySelector('[class*="woocommerce"]')
      ];

      const indicatorCount = ecommerceIndicators.filter(Boolean).length;
      
      if (indicatorCount >= 3) {
        return this._identifyPlatform(document, url);
      }

      return "none";
    } catch (error) {
      this.log('warn', `E-commerce type detection failed: ${error.message}`);
      return "unknown";
    }
  }

  /**
   * Identify specific e-commerce platform
   */
  _identifyPlatform(document, url) {
    const platformIndicators = [
      { name: 'shopify', selectors: ['meta[name="generator"][content*="Shopify"]', 'script[src*="shopify"]'] },
      { name: 'woocommerce', selectors: ['script[src*="woocommerce"]', '[class*="woocommerce"]'] },
      { name: 'magento', selectors: ['script[src*="magento"]', '[class*="magento"]'] },
      { name: 'bigcommerce', selectors: ['script[src*="bigcommerce"]', 'meta[name="generator"][content*="BigCommerce"]'] },
      { name: 'prestashop', selectors: ['script[src*="prestashop"]', 'meta[name="generator"][content*="PrestaShop"]'] }
    ];

    for (const platform of platformIndicators) {
      for (const selector of platform.selectors) {
        if (this.safeQuery(document, selector).length > 0) {
          return platform.name;
        }
      }
    }

    return "generic";
  }

  /**
   * Analyze platform detection
   */
  async _analyzePlatformDetection(document, url) {
    try {
      return this.analyzers.platform.detectPlatform(document, url);
    } catch (error) {
      this.log('warn', `Platform detection failed: ${error.message}`);
      return { platform: 'unknown', confidence: 0, features: [] };
    }
  }

  /**
   * Analyze product features and optimization
   */
  async _analyzeProductFeatures(document, url) {
    try {
      if (!this.options.enableProductAnalysis) {
        return { enabled: false };
      }

      const productElements = this.safeQuery(document, '[class*="product"], [id*="product"], [itemtype*="Product"]');
      const priceElements = this.safeQuery(document, '[class*="price"], [id*="price"], .price');
      const addToCartButtons = this.safeQuery(document, 'button[name*="add"], input[name*="add"], [class*="add-to-cart"]');

      return {
        productCount: productElements.length,
        priceElements: priceElements.length,
        addToCartButtons: addToCartButtons.length,
        hasProductSchema: this.safeQuery(document, '[itemtype*="Product"]').length > 0,
        hasProductImages: this.safeQuery(document, 'img[class*="product"], img[id*="product"]').length > 0,
        score: this._calculateProductScore(productElements.length, priceElements.length, addToCartButtons.length)
      };
    } catch (error) {
      return { error: error.message, score: 0 };
    }
  }

  /**
   * Analyze checkout process and cart functionality
   */
  async _analyzeCheckoutProcess(document, url) {
    try {
      if (!this.options.enableCheckoutAnalysis) {
        return { enabled: false };
      }

      return this.analyzers.checkout.analyzeCheckout(document, url);
    } catch (error) {
      this.log('warn', `Checkout analysis failed: ${error.message}`);
      return { error: error.message, score: 0 };
    }
  }

  /**
   * Analyze review system and customer feedback
   */
  async _analyzeReviewSystem(document) {
    try {
      if (!this.options.enableReviewAnalysis) {
        return { enabled: false };
      }

      return this.analyzers.reviews.analyzeReviews(document);
    } catch (error) {
      this.log('warn', `Review system analysis failed: ${error.message}`);
      return { error: error.message, score: 0 };
    }
  }

  /**
   * Analyze payment security and trust indicators
   */
  async _analyzePaymentSecurity(document, url) {
    try {
      if (!this.options.enableSecurityAnalysis) {
        return { enabled: false };
      }

      return this.analyzers.payment.analyzePaymentSecurity(document, url);
    } catch (error) {
      this.log('warn', `Payment security analysis failed: ${error.message}`);
      return { error: error.message, score: 0 };
    }
  }

  /**
   * Analyze conversion optimization features
   */
  async _analyzeConversionOptimization(document, pageData, url) {
    try {
      if (!this.options.enableConversionAnalysis) {
        return { enabled: false };
      }

      return this.analyzers.conversion.analyzeConversion(document, pageData, url);
    } catch (error) {
      this.log('warn', `Conversion optimization analysis failed: ${error.message}`);
      return { error: error.message, score: 0 };
    }
  }

  /**
   * Analyze e-commerce schema markup
   */
  async _analyzeEcommerceSchema(document) {
    try {
      return this.analyzers.productSchema.analyzeProductSchema(document);
    } catch (error) {
      this.log('warn', `Schema analysis failed: ${error.message}`);
      return { error: error.message, score: 0 };
    }
  }

  /**
   * Calculate product feature score
   */
  _calculateProductScore(productCount, priceCount, cartButtons) {
    let score = 0;
    if (productCount > 0) score += 30;
    if (priceCount > 0) score += 25;
    if (cartButtons > 0) score += 25;
    if (productCount === priceCount && productCount > 0) score += 20; // Good price/product ratio
    
    return Math.min(score, 100);
  }

  /**
   * Calculate overall e-commerce optimization score
   */
  _calculateEcommerceScore(analysis) {
    const scores = [];
    const weights = {};

    // Collect component scores with weights
    if (analysis.product && analysis.product.score !== undefined) {
      scores.push(analysis.product.score);
      weights.product = 0.2;
    }
    if (analysis.checkout && analysis.checkout.score !== undefined) {
      scores.push(analysis.checkout.score);
      weights.checkout = 0.25;
    }
    if (analysis.reviews && analysis.reviews.score !== undefined) {
      scores.push(analysis.reviews.score);
      weights.reviews = 0.15;
    }
    if (analysis.security && analysis.security.score !== undefined) {
      scores.push(analysis.security.score);
      weights.security = 0.25;
    }
    if (analysis.conversion && analysis.conversion.score !== undefined) {
      scores.push(analysis.conversion.score);
      weights.conversion = 0.1;
    }
    if (analysis.schema && analysis.schema.score !== undefined) {
      scores.push(analysis.schema.score);
      weights.schema = 0.05;
    }

    const overallScore = scores.length > 0 ? 
      Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;

    return {
      overallScore,
      componentScores: {
        product: analysis.product?.score || 0,
        checkout: analysis.checkout?.score || 0,
        reviews: analysis.reviews?.score || 0,
        security: analysis.security?.score || 0,
        conversion: analysis.conversion?.score || 0,
        schema: analysis.schema?.score || 0
      },
      grade: this._getGrade(overallScore),
      weights
    };
  }

  /**
   * Generate e-commerce optimization recommendations
   */
  _generateEcommerceRecommendations(analysis) {
    const recommendations = [];

    // Product recommendations
    if (analysis.product && analysis.product.score < 70) {
      recommendations.push({
        category: 'product',
        priority: 'high',
        title: 'Improve product presentation',
        description: `Product features score is ${analysis.product.score}/100`,
        action: 'Add clear product information, pricing, and purchase options'
      });
    }

    // Checkout recommendations
    if (analysis.checkout && analysis.checkout.score < 80) {
      recommendations.push({
        category: 'checkout',
        priority: 'high',
        title: 'Optimize checkout process',
        description: `Checkout optimization score is ${analysis.checkout.score}/100`,
        action: 'Simplify checkout flow and reduce friction points'
      });
    }

    // Security recommendations
    if (analysis.security && analysis.security.score < 85) {
      recommendations.push({
        category: 'security',
        priority: 'critical',
        title: 'Enhance payment security',
        description: `Security score is ${analysis.security.score}/100`,
        action: 'Add security badges, SSL certificates, and trust indicators'
      });
    }

    // Schema recommendations
    if (analysis.schema && analysis.schema.score < 60) {
      recommendations.push({
        category: 'schema',
        priority: 'medium',
        title: 'Add structured data markup',
        description: `Schema markup score is ${analysis.schema.score}/100`,
        action: 'Implement Product schema markup for better search visibility'
      });
    }

    return recommendations;
  }

  /**
   * Get letter grade for score
   */
  _getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
}
