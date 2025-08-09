/**
 * CONVERSION OPTIMIZER MODULE
 * Analyzes and optimizes e-commerce conversion factors
 */

import { BaseAnalyzer } from '../../core/BaseAnalyzer.js';
import { AnalyzerCategories } from '../../core/AnalyzerInterface.js';

/**
 * Conversion Optimizer
 * Analyzes conversion factors and provides optimization recommendations
 */
export class ConversionOptimizer extends BaseAnalyzer {
  constructor(options = {}) {
    super('ConversionOptimizer', {
      enableAdvancedAnalysis: options.enableAdvancedAnalysis !== false,
      analyzeUserExperience: options.analyzeUserExperience !== false,
      checkMobileOptimization: options.checkMobileOptimization !== false,
      analyzeTrustSignals: options.analyzeTrustSignals !== false,
      ...options
    });

    // Conversion factor weights for scoring
    this.conversionFactors = {
      trustSignals: 0.25,
      userExperience: 0.20,
      productPresentation: 0.15,
      checkoutProcess: 0.15,
      socialProof: 0.10,
      mobileOptimization: 0.10,
      loadingSpeed: 0.05
    };

    // Trust signal patterns
    this.trustSignals = {
      ssl: /https:|ssl|secure/i,
      testimonials: /testimonial|review|rating|stars/i,
      guarantees: /guarantee|warranty|return.*policy|money.*back/i,
      certifications: /certified|accredited|verified|trusted/i,
      awards: /award|recognition|featured.*in|as.*seen.*on/i,
      contactInfo: /contact.*us|phone|address|email/i,
      socialMedia: /facebook|twitter|instagram|linkedin|social/i,
      paymentSecurity: /secure.*payment|payment.*secure|pci.*compliant/i
    };

    // UX optimization patterns
    this.uxPatterns = {
      searchFunctionality: /search|find|filter/i,
      navigation: /menu|nav|breadcrumb/i,
      productFilters: /filter|sort|category/i,
      wishlist: /wishlist|favorite|save.*later/i,
      comparison: /compare|comparison/i,
      recommendations: /recommend|suggested|you.*might.*like/i,
      liveChat: /live.*chat|chat.*support|help/i,
      faq: /faq|frequently.*asked|help.*center/i
    };

    // Mobile optimization indicators
    this.mobileIndicators = {
      viewport: /viewport/i,
      responsive: /responsive|mobile.*friendly/i,
      touchOptimized: /touch|swipe|gesture/i,
      mobileApp: /mobile.*app|app.*store|download.*app/i
    };

    // Social proof patterns
    this.socialProofPatterns = {
      customerReviews: /customer.*review|user.*review/i,
      ratings: /rating|stars|score/i,
      testimonials: /testimonial|what.*customers.*say/i,
      userCount: /customers|users|members/i,
      recentActivity: /recently.*bought|others.*viewed|trending/i,
      socialSharing: /share|like|tweet|pin/i
    };
  }

  /**
   * Main analysis method for BaseAnalyzer compliance
   * @param {Object} context - Analysis context containing DOM and metadata
   * @returns {Promise<Object>} Analysis results
   */
  async analyze(context) {
    return this.measureTime(async () => {
      try {
        this.log('Starting conversion optimization analysis', 'info');
        
        const { dom, url = '', pageData = {} } = context;
        
        if (!dom) {
          throw new Error('DOM context is required for conversion analysis');
        }

        // Perform conversion analysis synchronously but wrapped in async function
        const analysis = {
          overallScore: 0,
          factors: {
            trustSignals: this._analyzeTrustSignals(dom, url),
            userExperience: this._analyzeUserExperience(dom),
            productPresentation: this._analyzeProductPresentation(dom),
            checkoutProcess: this._analyzeCheckoutProcess(dom),
            socialProof: this._analyzeSocialProof(dom),
            mobileOptimization: this._analyzeMobileOptimization(dom),
            loadingSpeed: this._analyzeLoadingSpeed(dom, pageData)
          },
          recommendations: [],
          optimizationOpportunities: [],
          competitiveAdvantages: [],
          metadata: {
            analysisMethod: 'comprehensive',
            timestamp: new Date().toISOString(),
            url: url
          }
        };

        // Calculate overall score
        analysis.overallScore = this._calculateOverallScore(analysis.factors);

        // Generate recommendations
        analysis.recommendations = this._generateRecommendations(analysis.factors);

        // Identify optimization opportunities
        analysis.optimizationOpportunities = this._identifyOptimizationOpportunities(analysis.factors);

        // Identify competitive advantages
        analysis.competitiveAdvantages = this._identifyCompetitiveAdvantages(analysis.factors);
        
        const result = {
          data: analysis,
          summary: this._generateConversionSummary(analysis),
          metrics: this._generateConversionMetrics(analysis),
          recommendations: analysis.recommendations || [],
          score: analysis.overallScore || 0,
          metadata: {
            ...analysis.metadata,
            analyzer: 'ConversionOptimizer',
            version: '1.0.0',
            category: 'ECOMMERCE'
          }
        };

        this.log(`Conversion analysis completed with score: ${result.score}/100`, 'info');
        return result;

      } catch (error) {
        return this.handleError(error, 'Conversion optimization analysis failed');
      }
    });
  }

  /**
   * Core conversion analysis method (legacy method maintained for compatibility)
   * @param {Object} dom - Cheerio DOM object
   * @param {Object} pageData - Additional page data
   * @param {string} url - Page URL
   * @returns {Object} Conversion analysis results
   */
  analyzeConversion(dom, pageData = {}, url = '') {
    return this._analyzeConversionFactors(dom, pageData, url);
  }

  /**
   * Internal conversion analysis implementation
   * @param {Object} dom - Cheerio DOM object
   * @param {Object} pageData - Additional page data
   * @param {string} url - Page URL
   * @returns {Object} Conversion analysis results
   * @private
   */
  _analyzeConversionFactors(dom, pageData = {}, url = '') {
    try {
      const analysis = {
        overallScore: 0,
        factors: {
          trustSignals: this._analyzeTrustSignals(dom, url),
          userExperience: this._analyzeUserExperience(dom),
          productPresentation: this._analyzeProductPresentation(dom),
          checkoutProcess: this._analyzeCheckoutProcess(dom),
          socialProof: this._analyzeSocialProof(dom),
          mobileOptimization: this._analyzeMobileOptimization(dom),
          loadingSpeed: this._analyzeLoadingSpeed(dom, pageData)
        },
        recommendations: [],
        optimizationOpportunities: [],
        competitiveAdvantages: [],
        metadata: {
          analysisMethod: 'comprehensive',
          timestamp: new Date().toISOString(),
          url: url
        }
      };

      // Calculate overall score
      analysis.overallScore = this._calculateOverallScore(analysis.factors);

      // Generate recommendations
      analysis.recommendations = this._generateRecommendations(analysis.factors);

      // Identify optimization opportunities
      analysis.optimizationOpportunities = this._identifyOptimizationOpportunities(analysis.factors);

      // Identify competitive advantages
      analysis.competitiveAdvantages = this._identifyCompetitiveAdvantages(analysis.factors);

      return analysis;

    } catch (error) {
      return {
        overallScore: 0,
        factors: {},
        recommendations: [],
        optimizationOpportunities: [],
        competitiveAdvantages: [],
        error: `Conversion analysis failed: ${error.message}`,
        metadata: {
          analysisMethod: 'error',
          timestamp: new Date().toISOString(),
          url: url
        }
      };
    }
  }

  /**
   * Analyze trust signals
   */
  _analyzeTrustSignals(dom, url) {
    const analysis = {
      score: 0,
      signals: [],
      missing: [],
      details: {}
    };

    const content = dom.html().toLowerCase();

    // Check for SSL (from URL)
    if (url.startsWith('https://')) {
      analysis.signals.push('SSL Certificate');
      analysis.score += 15;
    } else {
      analysis.missing.push('SSL Certificate');
    }

    // Check for various trust signals
    for (const [signal, pattern] of Object.entries(this.trustSignals)) {
      if (pattern.test(content)) {
        analysis.signals.push(signal);
        analysis.score += 10;
      } else {
        analysis.missing.push(signal);
      }
    }

    // Check for specific trust elements
    const trustElements = {
      securityBadges: dom('[alt*="secure"], [src*="ssl"], [src*="security"]').length,
      contactInfo: dom('[href^="tel:"], [href^="mailto:"]').length,
      aboutPage: dom('a[href*="about"]').length,
      privacyPolicy: dom('a[href*="privacy"]').length,
      termsOfService: dom('a[href*="terms"]').length
    };

    analysis.details = trustElements;

    // Bonus points for comprehensive trust signals
    if (trustElements.securityBadges > 0) analysis.score += 5;
    if (trustElements.contactInfo > 0) analysis.score += 5;
    if (trustElements.aboutPage > 0) analysis.score += 3;
    if (trustElements.privacyPolicy > 0) analysis.score += 3;
    if (trustElements.termsOfService > 0) analysis.score += 3;

    analysis.score = Math.min(analysis.score, 100);
    return analysis;
  }

  /**
   * Analyze user experience factors
   */
  _analyzeUserExperience(dom) {
    const analysis = {
      score: 0,
      features: [],
      missing: [],
      details: {}
    };

    const content = dom.html().toLowerCase();

    // Check for UX features
    for (const [feature, pattern] of Object.entries(this.uxPatterns)) {
      if (pattern.test(content)) {
        analysis.features.push(feature);
        analysis.score += 12;
      } else {
        analysis.missing.push(feature);
      }
    }

    // Analyze specific UX elements
    const uxElements = {
      searchBox: dom('input[type="search"], [placeholder*="search"]').length,
      navigationMenu: dom('nav, .navigation, .menu').length,
      breadcrumbs: dom('.breadcrumb, [aria-label*="breadcrumb"]').length,
      productImages: dom('img[alt*="product"], .product img').length,
      addToCartButtons: dom('[class*="cart"], [class*="add"]').length,
      helpLinks: dom('a[href*="help"], a[href*="faq"], a[href*="support"]').length
    };

    analysis.details = uxElements;

    // Bonus points for essential UX elements
    if (uxElements.searchBox > 0) analysis.score += 8;
    if (uxElements.navigationMenu > 0) analysis.score += 6;
    if (uxElements.breadcrumbs > 0) analysis.score += 4;
    if (uxElements.addToCartButtons > 0) analysis.score += 10;

    analysis.score = Math.min(analysis.score, 100);
    return analysis;
  }

  /**
   * Analyze product presentation
   */
  _analyzeProductPresentation(dom) {
    const analysis = {
      score: 0,
      strengths: [],
      weaknesses: [],
      details: {}
    };

    // Analyze product elements
    const productElements = {
      productImages: dom('img[alt*="product"], .product img, [class*="product"] img').length,
      productTitles: dom('.product h1, .product h2, .product h3, [class*="product"] h1, [class*="product"] h2, [class*="product"] h3').length,
      priceElements: dom('[class*="price"], [class*="cost"], .currency').length,
      productDescriptions: dom('.description, [class*="description"], .details, [class*="details"]').length,
      productReviews: dom('[class*="review"], [class*="rating"], [class*="star"]').length,
      productVariants: dom('select[class*="variant"], [class*="size"], [class*="color"]').length,
      stockInfo: dom('[class*="stock"], [class*="availability"]').length,
      productBadges: dom('[class*="badge"], [class*="tag"], [class*="label"]').length
    };

    analysis.details = productElements;

    // Score based on product presentation elements
    if (productElements.productImages > 0) {
      analysis.strengths.push('Product images present');
      analysis.score += 15;
    } else {
      analysis.weaknesses.push('Missing product images');
    }

    if (productElements.productTitles > 0) {
      analysis.strengths.push('Clear product titles');
      analysis.score += 10;
    } else {
      analysis.weaknesses.push('Missing clear product titles');
    }

    if (productElements.priceElements > 0) {
      analysis.strengths.push('Price information displayed');
      analysis.score += 15;
    } else {
      analysis.weaknesses.push('Missing price information');
    }

    if (productElements.productDescriptions > 0) {
      analysis.strengths.push('Product descriptions available');
      analysis.score += 10;
    } else {
      analysis.weaknesses.push('Missing product descriptions');
    }

    if (productElements.productReviews > 0) {
      analysis.strengths.push('Customer reviews/ratings');
      analysis.score += 12;
    } else {
      analysis.weaknesses.push('Missing customer reviews');
    }

    if (productElements.productVariants > 0) {
      analysis.strengths.push('Product variants/options');
      analysis.score += 8;
    }

    if (productElements.stockInfo > 0) {
      analysis.strengths.push('Stock availability info');
      analysis.score += 5;
    }

    if (productElements.productBadges > 0) {
      analysis.strengths.push('Product badges/labels');
      analysis.score += 5;
    }

    // Bonus for multiple product images
    if (productElements.productImages > 3) {
      analysis.score += 5;
    }

    analysis.score = Math.min(analysis.score, 100);
    return analysis;
  }

  /**
   * Analyze checkout process
   */
  _analyzeCheckoutProcess(dom) {
    const analysis = {
      score: 0,
      features: [],
      issues: [],
      details: {}
    };

    const content = dom.html().toLowerCase();

    // Check for checkout-related elements
    const checkoutElements = {
      cartIcon: dom('[class*="cart"], [href*="cart"]').length,
      checkoutButton: dom('[href*="checkout"], [class*="checkout"], button[class*="checkout"]').length,
      guestCheckout: /guest.*checkout|checkout.*as.*guest/i.test(content),
      multiplePayments: /visa|mastercard|paypal|apple.*pay|google.*pay/i.test(content),
      secureCheckout: /secure.*checkout|ssl.*checkout/i.test(content),
      shippingInfo: /shipping|delivery|free.*shipping/i.test(content),
      returnPolicy: /return.*policy|refund|exchange/i.test(content)
    };

    analysis.details = checkoutElements;

    // Score checkout features
    if (checkoutElements.cartIcon > 0) {
      analysis.features.push('Shopping cart accessible');
      analysis.score += 15;
    } else {
      analysis.issues.push('Shopping cart not easily accessible');
    }

    if (checkoutElements.checkoutButton > 0) {
      analysis.features.push('Clear checkout process');
      analysis.score += 15;
    } else {
      analysis.issues.push('Unclear checkout process');
    }

    if (checkoutElements.guestCheckout) {
      analysis.features.push('Guest checkout available');
      analysis.score += 12;
    } else {
      analysis.issues.push('Guest checkout not apparent');
    }

    if (checkoutElements.multiplePayments) {
      analysis.features.push('Multiple payment options');
      analysis.score += 15;
    } else {
      analysis.issues.push('Limited payment options visible');
    }

    if (checkoutElements.secureCheckout) {
      analysis.features.push('Secure checkout messaging');
      analysis.score += 10;
    }

    if (checkoutElements.shippingInfo) {
      analysis.features.push('Shipping information provided');
      analysis.score += 8;
    }

    if (checkoutElements.returnPolicy) {
      analysis.features.push('Return policy mentioned');
      analysis.score += 5;
    }

    analysis.score = Math.min(analysis.score, 100);
    return analysis;
  }

  /**
   * Analyze social proof elements
   */
  _analyzeSocialProof(dom) {
    const analysis = {
      score: 0,
      elements: [],
      missing: [],
      details: {}
    };

    const content = dom.html().toLowerCase();

    // Check for social proof patterns
    for (const [element, pattern] of Object.entries(this.socialProofPatterns)) {
      if (pattern.test(content)) {
        analysis.elements.push(element);
        analysis.score += 15;
      } else {
        analysis.missing.push(element);
      }
    }

    // Analyze specific social proof elements
    const socialElements = {
      reviewStars: dom('[class*="star"], [class*="rating"]').length,
      reviewCount: /[0-9]+.*review|review.*[0-9]+/i.test(content),
      customerPhotos: dom('img[alt*="customer"], img[alt*="review"]').length,
      socialButtons: dom('[class*="share"], [href*="facebook"], [href*="twitter"]').length,
      testimonialSection: dom('[class*="testimonial"], [class*="review"]').length
    };

    analysis.details = socialElements;

    // Bonus points for strong social proof
    if (socialElements.reviewStars > 0) analysis.score += 10;
    if (socialElements.reviewCount) analysis.score += 8;
    if (socialElements.customerPhotos > 0) analysis.score += 6;
    if (socialElements.socialButtons > 0) analysis.score += 4;
    if (socialElements.testimonialSection > 0) analysis.score += 8;

    analysis.score = Math.min(analysis.score, 100);
    return analysis;
  }

  /**
   * Analyze mobile optimization
   */
  _analyzeMobileOptimization(dom) {
    const analysis = {
      score: 0,
      features: [],
      issues: [],
      details: {}
    };

    const content = dom.html().toLowerCase();

    // Check viewport meta tag
    const viewportMeta = dom('meta[name="viewport"]').attr('content') || '';
    if (viewportMeta.includes('width=device-width')) {
      analysis.features.push('Responsive viewport');
      analysis.score += 25;
    } else {
      analysis.issues.push('Missing responsive viewport');
    }

    // Check for mobile indicators
    for (const [feature, pattern] of Object.entries(this.mobileIndicators)) {
      if (pattern.test(content)) {
        analysis.features.push(feature);
        analysis.score += 15;
      }
    }

    // Check for mobile-specific elements
    const mobileElements = {
      touchTargets: dom('button, a, input[type="submit"]').length,
      mobileFriendlyForms: dom('input[type="tel"], input[type="email"]').length,
      mobileNavigation: dom('[class*="mobile"], [class*="hamburger"]').length
    };

    analysis.details = mobileElements;

    if (mobileElements.touchTargets > 0) analysis.score += 10;
    if (mobileElements.mobileFriendlyForms > 0) analysis.score += 5;
    if (mobileElements.mobileNavigation > 0) analysis.score += 10;

    analysis.score = Math.min(analysis.score, 100);
    return analysis;
  }

  /**
   * Analyze loading speed factors
   */
  _analyzeLoadingSpeed(dom, pageData) {
    const analysis = {
      score: 80, // Default good score, would be overridden by actual performance data
      factors: [],
      optimizations: [],
      details: {}
    };

    // Check for performance-affecting elements
    const performanceElements = {
      imageCount: dom('img').length,
      scriptCount: dom('script').length,
      cssCount: dom('link[rel="stylesheet"]').length,
      inlineStyles: dom('[style]').length,
      largeImages: dom('img').filter((i, el) => {
        const src = dom(el).attr('src') || '';
        return src.includes('original') || src.includes('full') || src.includes('large');
      }).length
    };

    analysis.details = performanceElements;

    // Analyze performance factors
    if (performanceElements.imageCount > 20) {
      analysis.optimizations.push('Optimize image loading (lazy loading)');
      analysis.score -= 10;
    }

    if (performanceElements.scriptCount > 10) {
      analysis.optimizations.push('Minimize JavaScript files');
      analysis.score -= 5;
    }

    if (performanceElements.largeImages > 0) {
      analysis.optimizations.push('Compress and optimize images');
      analysis.score -= 15;
    }

    // Check for performance optimizations
    const content = dom.html().toLowerCase();
    if (/lazy.*load|loading.*lazy/i.test(content)) {
      analysis.factors.push('Lazy loading implemented');
      analysis.score += 5;
    }

    if (/cdn|cloudflare|amazonaws/i.test(content)) {
      analysis.factors.push('CDN usage detected');
      analysis.score += 5;
    }

    analysis.score = Math.max(0, Math.min(analysis.score, 100));
    return analysis;
  }

  /**
   * Calculate overall conversion score
   */
  _calculateOverallScore(factors) {
    let totalScore = 0;

    for (const [factor, weight] of Object.entries(this.conversionFactors)) {
      if (factors[factor] && factors[factor].score !== undefined) {
        totalScore += factors[factor].score * weight;
      }
    }

    return Math.round(totalScore);
  }

  /**
   * Generate conversion optimization recommendations
   */
  _generateRecommendations(factors) {
    const recommendations = [];

    // Trust signals recommendations
    if (factors.trustSignals && factors.trustSignals.score < 70) {
      recommendations.push({
        category: 'Trust Signals',
        priority: 'high',
        title: 'Improve trust signals',
        description: 'Add security badges, customer testimonials, and clear contact information',
        impact: 'Can increase conversion rates by 15-25%'
      });
    }

    // UX recommendations
    if (factors.userExperience && factors.userExperience.score < 70) {
      recommendations.push({
        category: 'User Experience',
        priority: 'high',
        title: 'Enhance user experience',
        description: 'Improve site navigation, add search functionality, and streamline user flows',
        impact: 'Can improve user engagement by 20-30%'
      });
    }

    // Product presentation recommendations
    if (factors.productPresentation && factors.productPresentation.score < 80) {
      recommendations.push({
        category: 'Product Presentation',
        priority: 'medium',
        title: 'Optimize product presentation',
        description: 'Add high-quality product images, detailed descriptions, and customer reviews',
        impact: 'Can increase product page conversions by 10-20%'
      });
    }

    // Checkout recommendations
    if (factors.checkoutProcess && factors.checkoutProcess.score < 75) {
      recommendations.push({
        category: 'Checkout Process',
        priority: 'high',
        title: 'Streamline checkout process',
        description: 'Simplify checkout steps, offer guest checkout, and display security messaging',
        impact: 'Can reduce cart abandonment by 10-15%'
      });
    }

    // Social proof recommendations
    if (factors.socialProof && factors.socialProof.score < 60) {
      recommendations.push({
        category: 'Social Proof',
        priority: 'medium',
        title: 'Add social proof elements',
        description: 'Display customer reviews, ratings, testimonials, and social media integration',
        impact: 'Can increase trust and conversions by 8-15%'
      });
    }

    // Mobile recommendations
    if (factors.mobileOptimization && factors.mobileOptimization.score < 80) {
      recommendations.push({
        category: 'Mobile Optimization',
        priority: 'high',
        title: 'Improve mobile experience',
        description: 'Optimize for mobile devices with responsive design and touch-friendly interface',
        impact: 'Can increase mobile conversions by 25-40%'
      });
    }

    return recommendations;
  }

  /**
   * Identify optimization opportunities
   */
  _identifyOptimizationOpportunities(factors) {
    const opportunities = [];

    // Quick wins
    if (factors.loadingSpeed && factors.loadingSpeed.score < 80) {
      opportunities.push({
        type: 'quick-win',
        title: 'Optimize page loading speed',
        effort: 'medium',
        impact: 'high',
        description: 'Compress images and minimize scripts for faster loading'
      });
    }

    // High-impact changes
    if (factors.trustSignals && factors.trustSignals.missing.length > 3) {
      opportunities.push({
        type: 'high-impact',
        title: 'Implement comprehensive trust signals',
        effort: 'high',
        impact: 'very-high',
        description: 'Add security badges, testimonials, and guarantees'
      });
    }

    return opportunities;
  }

  /**
   * Identify competitive advantages
   */
  _identifyCompetitiveAdvantages(factors) {
    const advantages = [];

    // Strong trust signals
    if (factors.trustSignals && factors.trustSignals.score >= 85) {
      advantages.push({
        area: 'Trust & Security',
        strength: 'Excellent trust signal implementation',
        description: 'Strong security messaging and credibility indicators'
      });
    }

    // Excellent UX
    if (factors.userExperience && factors.userExperience.score >= 85) {
      advantages.push({
        area: 'User Experience',
        strength: 'Superior user experience design',
        description: 'Intuitive navigation and user-friendly interface'
      });
    }

    return advantages;
  }

  /**
   * Generate conversion summary
   * @param {Object} analysis - Conversion analysis results
   * @returns {Object} Conversion summary
   * @private
   */
  _generateConversionSummary(analysis) {
    const score = analysis.overallScore || 0;
    const grade = this._getConversionGrade(score);
    const status = this._getConversionStatus(score);
    
    return {
      overallScore: score,
      grade,
      status,
      totalFactors: Object.keys(analysis.factors || {}).length,
      optimizationOpportunities: analysis.optimizationOpportunities?.length || 0,
      competitiveAdvantages: analysis.competitiveAdvantages?.length || 0,
      trustSignalsScore: analysis.factors?.trustSignals?.score || 0,
      userExperienceScore: analysis.factors?.userExperience?.score || 0,
      mobileOptimizationScore: analysis.factors?.mobileOptimization?.score || 0,
      checkoutProcessScore: analysis.factors?.checkoutProcess?.score || 0,
      socialProofScore: analysis.factors?.socialProof?.score || 0,
      productPresentationScore: analysis.factors?.productPresentation?.score || 0,
      loadingSpeedScore: analysis.factors?.loadingSpeed?.score || 0
    };
  }

  /**
   * Generate conversion metrics
   * @param {Object} analysis - Conversion analysis results
   * @returns {Object} Conversion metrics
   * @private
   */
  _generateConversionMetrics(analysis) {
    const factors = analysis.factors || {};
    
    const metrics = {
      conversionFactorScores: {},
      trustMetrics: {
        signalsDetected: factors.trustSignals?.signals?.length || 0,
        signalsMissing: factors.trustSignals?.missing?.length || 0,
        securityBadges: factors.trustSignals?.details?.securityBadges || 0,
        contactInfo: factors.trustSignals?.details?.contactInfo || 0
      },
      uxMetrics: {
        featuresDetected: factors.userExperience?.features?.length || 0,
        featuresMissing: factors.userExperience?.missing?.length || 0,
        searchBoxes: factors.userExperience?.details?.searchBox || 0,
        navigationMenus: factors.userExperience?.details?.navigationMenu || 0,
        addToCartButtons: factors.userExperience?.details?.addToCartButtons || 0
      },
      productMetrics: {
        strengthsCount: factors.productPresentation?.strengths?.length || 0,
        weaknessesCount: factors.productPresentation?.weaknesses?.length || 0,
        productImages: factors.productPresentation?.details?.productImages || 0,
        priceElements: factors.productPresentation?.details?.priceElements || 0,
        reviewElements: factors.productPresentation?.details?.productReviews || 0
      },
      checkoutMetrics: {
        featuresDetected: factors.checkoutProcess?.features?.length || 0,
        issuesFound: factors.checkoutProcess?.issues?.length || 0,
        cartAccessibility: factors.checkoutProcess?.details?.cartIcon || 0,
        checkoutButtons: factors.checkoutProcess?.details?.checkoutButton || 0
      },
      socialProofMetrics: {
        elementsDetected: factors.socialProof?.elements?.length || 0,
        elementsMissing: factors.socialProof?.missing?.length || 0,
        reviewStars: factors.socialProof?.details?.reviewStars || 0,
        socialButtons: factors.socialProof?.details?.socialButtons || 0
      },
      mobileMetrics: {
        featuresDetected: factors.mobileOptimization?.features?.length || 0,
        issuesFound: factors.mobileOptimization?.issues?.length || 0,
        touchTargets: factors.mobileOptimization?.details?.touchTargets || 0,
        mobileFriendlyForms: factors.mobileOptimization?.details?.mobileFriendlyForms || 0
      },
      performanceMetrics: {
        loadingSpeedFactors: factors.loadingSpeed?.factors?.length || 0,
        optimizationNeeded: factors.loadingSpeed?.optimizations?.length || 0,
        imageCount: factors.loadingSpeed?.details?.imageCount || 0,
        scriptCount: factors.loadingSpeed?.details?.scriptCount || 0
      }
    };

    // Calculate factor scores
    Object.keys(factors).forEach(factorName => {
      if (factors[factorName] && typeof factors[factorName].score === 'number') {
        metrics.conversionFactorScores[factorName] = factors[factorName].score;
      }
    });

    return metrics;
  }

  /**
   * Get conversion grade from score
   * @param {number} score - Conversion score
   * @returns {string} Grade letter
   * @private
   */
  _getConversionGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 40) return 'D';
    return 'F';
  }

  /**
   * Get conversion status from score
   * @param {number} score - Conversion score
   * @returns {string} Status description
   * @private
   */
  _getConversionStatus(score) {
    if (score >= 85) return 'Excellent conversion optimization';
    if (score >= 75) return 'Good conversion potential';
    if (score >= 65) return 'Moderate conversion optimization';
    if (score >= 50) return 'Needs conversion improvements';
    return 'Critical conversion issues';
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'ConversionOptimizer',
      version: '1.0.0',
      category: 'ECOMMERCE',
      description: 'Comprehensive e-commerce conversion factor analysis with optimization recommendations',
      features: [
        'Trust signals analysis',
        'User experience evaluation',
        'Product presentation assessment',
        'Checkout process optimization',
        'Social proof detection',
        'Mobile optimization analysis',
        'Loading speed assessment',
        'Conversion factor scoring',
        'Optimization recommendations',
        'Competitive advantage identification'
      ],
      supportedContexts: ['dom', 'url', 'pageData'],
      outputFormat: {
        score: 'number',
        data: 'object',
        summary: 'object',
        metrics: 'object',
        recommendations: 'array'
      }
    };
  }
}
