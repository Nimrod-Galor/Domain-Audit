/**
 * ============================================================================
 * BUSINESS ANALYTICS ANALYZER MODULE
 * ============================================================================
 * 
 * Advanced business analytics for websites including:
 * - User intent analysis
 * - Conversion element detection (CTAs, forms, checkout)
 * - Social proof elements (testimonials, reviews)
 * - Trust signals detection (contact info, certifications)
 * - Business value assessment
 * 
 * This module addresses the remaining 0.5% coverage gap in Business Analytics
 * 
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @version 1.0.0
 */

import { BaseAnalyzer } from './core/BaseAnalyzer.js';
import { AnalyzerCategories } from './core/AnalyzerInterface.js';

/**
 * Business Analytics Configuration
 */
export const BUSINESS_ANALYTICS_CONFIG = {
  USER_INTENT: {
    INFORMATIONAL_KEYWORDS: [
      'how to', 'what is', 'why', 'guide', 'tutorial', 'learn',
      'definition', 'meaning', 'explanation', 'overview', 'introduction'
    ],
    COMMERCIAL_KEYWORDS: [
      'best', 'top', 'review', 'comparison', 'vs', 'alternative',
      'price', 'cost', 'cheap', 'affordable', 'premium'
    ],
    TRANSACTIONAL_KEYWORDS: [
      'buy', 'purchase', 'order', 'checkout', 'cart', 'shop',
      'discount', 'sale', 'deal', 'coupon', 'free trial'
    ],
    NAVIGATIONAL_KEYWORDS: [
      'login', 'sign in', 'account', 'dashboard', 'profile',
      'contact', 'about', 'support', 'help'
    ]
  },
  CONVERSION_ELEMENTS: {
    CTA_SELECTORS: [
      'button', '[role="button"]', '.btn', '.button', '.cta',
      'input[type="submit"]', 'input[type="button"]', '.call-to-action'
    ],
    CTA_KEYWORDS: [
      'buy now', 'get started', 'sign up', 'download', 'subscribe',
      'contact us', 'learn more', 'try free', 'book now', 'order now'
    ],
    FORM_SELECTORS: [
      'form', '.contact-form', '.signup-form', '.newsletter',
      '.lead-form', '.quote-form', '.booking-form'
    ],
    CHECKOUT_INDICATORS: [
      'checkout', 'cart', 'basket', 'order', 'payment',
      'billing', 'shipping', 'total', 'subtotal'
    ]
  },
  SOCIAL_PROOF: {
    TESTIMONIAL_SELECTORS: [
      '.testimonial', '.review', '.feedback', '.customer-story',
      '.case-study', '.success-story', '.quote'
    ],
    TESTIMONIAL_KEYWORDS: [
      'testimonial', 'review', 'feedback', 'customer says',
      'client testimonial', 'success story', 'case study'
    ],
    REVIEW_INDICATORS: [
      'stars', 'rating', 'score', 'out of 5', 'reviews',
      'rated', 'customer rating', 'user rating'
    ],
    SOCIAL_METRICS: [
      'customers', 'users', 'downloads', 'subscribers',
      'members', 'companies', 'satisfied customers'
    ]
  },
  TRUST_SIGNALS: {
    CONTACT_SELECTORS: [
      '.contact', '.contact-info', '.address', '.phone',
      '.email', '.location', '.office'
    ],
    CERTIFICATION_KEYWORDS: [
      'certified', 'accredited', 'verified', 'trusted',
      'ssl', 'secure', 'guarantee', 'warranty', 'license'
    ],
    AUTHORITY_INDICATORS: [
      'founded', 'established', 'since', 'years of experience',
      'award', 'featured in', 'as seen on', 'partner'
    ],
    SECURITY_INDICATORS: [
      'ssl certificate', 'secure checkout', 'encrypted',
      'privacy policy', 'terms of service', 'money back'
    ]
  }
};

/**
 * Business Analytics Analyzer Class
 */
export class BusinessAnalyticsAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('BusinessAnalyticsAnalyzer', {
      enableUserIntentAnalysis: options.enableUserIntentAnalysis !== false,
      enableConversionAnalysis: options.enableConversionAnalysis !== false,
      enableSocialProofAnalysis: options.enableSocialProofAnalysis !== false,
      enableTrustSignalAnalysis: options.enableTrustSignalAnalysis !== false,
      enableBusinessValueAnalysis: options.enableBusinessValueAnalysis !== false,
      enableFunnelAnalysis: options.enableFunnelAnalysis !== false,
      maxCTAAnalysis: options.maxCTAAnalysis || 50,
      maxFormAnalysis: options.maxFormAnalysis || 20,
      includeDetailedAnalysis: options.includeDetailedAnalysis !== false,
      ...options
    });

    this.version = '1.0.0';
    this.category = AnalyzerCategories.BUSINESS;
    this.config = { ...BUSINESS_ANALYTICS_CONFIG, ...options };
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'BusinessAnalyticsAnalyzer',
      version: this.version,
      description: 'Comprehensive business analytics including user intent, conversion elements, social proof, and trust signals',
      category: this.category,
      priority: 'high',
      capabilities: [
        'user_intent_analysis',
        'conversion_element_detection',
        'social_proof_analysis',
        'trust_signal_detection',
        'business_value_assessment',
        'funnel_position_analysis',
        'optimization_recommendations',
        'business_scoring'
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
      this.handleError('DOM document is required for business analytics analysis');
      return false;
    }

    if (!context.url) {
      this.handleError('URL is required for business analytics analysis');
      return false;
    }

    return true;
  }

  /**
   * Perform comprehensive business analytics analysis
   * @param {Object} context - Analysis context containing DOM, URL, and page data
   * @returns {Promise<Object>} Business analytics analysis results
   */
  async analyze(context) {
    const startTime = Date.now();

    try {
      if (!this.validate(context)) {
        return this.createErrorResult('Invalid analysis context');
      }

      this.log('info', 'Starting business analytics analysis');

      const document = context.document || context.dom?.window?.document;
      const url = context.url;
      const pageData = context.pageData || {};
      
      const textContent = this._extractPageText(document);
      
      const analysis = {
        // User intent analysis
        userIntent: this._analyzeUserIntent(textContent, url, document),
        
        // Conversion elements detection
        conversionElements: this._detectConversionElements(document),
        
        // Social proof analysis
        socialProof: this._analyzeSocialProof(document, textContent),
        
        // Trust signals detection
        trustSignals: this._detectTrustSignals(document, textContent),
        
        // Business value assessment
        businessValue: this._assessBusinessValue(document, textContent),
        
        // Page funnel position
        funnelPosition: this._analyzeFunnelPosition(url, textContent, document),
        
        // Analysis metadata
        analysisTimestamp: new Date().toISOString(),
        url: url
      };

      // Calculate business optimization score
      analysis.businessOptimizationScore = this._calculateBusinessScore(analysis);
      analysis.grade = this._getGradeFromScore(analysis.businessOptimizationScore);
      
      // Generate optimization opportunities
      analysis.optimizationOpportunities = this._identifyOptimizationOpportunities(analysis);
      
      // Generate business recommendations
      analysis.recommendations = this._generateBusinessRecommendations(analysis);

      // Create summary
      analysis.summary = this._generateSummary(analysis);
      analysis.metadata = this.getMetadata();

      const endTime = Date.now();

      this.log('info', `Business analytics analysis completed. Score: ${analysis.businessOptimizationScore}%, Grade: ${analysis.grade}`);
      
      return {
        success: true,
        data: analysis,
        performance: {
          analysisTime: endTime - startTime,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      return this.handleError('Business analytics analysis failed', error);
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use analyze() method instead
   * @param {Object} dom - JSDOM document object
   * @param {Object} pageData - Existing page data
   * @param {string} url - Page URL
   * @returns {Object} Business analytics analysis
   */
  analyzeBusinessAnalytics(dom, pageData, url) {
    try {
      // Convert legacy parameters to new context format
      const document = dom.window?.document || dom;
      const context = {
        document: document,
        url: url || 'https://example.com',
        pageData: pageData || {}
      };
      
      // Use the new analyze method
      return this.analyze(context);
      
    } catch (error) {
      return Promise.resolve({
        success: false,
        error: `Business analytics analysis failed: ${error.message}`,
        data: null
      });
    }
  }

  /**
   * Analyze user intent based on content and URL
   */
  _analyzeUserIntent(textContent, url, document) {
    let urlPath = '';
    try {
      urlPath = new URL(url).pathname.toLowerCase();
    } catch (error) {
      urlPath = url ? url.toLowerCase() : '';
    }
    
    const pageTitle = this.safeQueryOne(document, 'title')?.textContent?.toLowerCase() || '';
    const headings = this.safeQuery(document, 'h1, h2, h3');
    const headingText = headings ? Array.from(headings).map(h => h.textContent.toLowerCase()).join(' ') : '';
    
    const combinedText = `${urlPath} ${pageTitle} ${headingText} ${textContent}`.toLowerCase();
    
    // Analyze intent signals
    const intentScores = {
      informational: this._calculateIntentScore(combinedText, this.config.USER_INTENT.INFORMATIONAL_KEYWORDS),
      commercial: this._calculateIntentScore(combinedText, this.config.USER_INTENT.COMMERCIAL_KEYWORDS),
      transactional: this._calculateIntentScore(combinedText, this.config.USER_INTENT.TRANSACTIONAL_KEYWORDS),
      navigational: this._calculateIntentScore(combinedText, this.config.USER_INTENT.NAVIGATIONAL_KEYWORDS)
    };
    
    // Determine primary intent
    const primaryIntent = Object.entries(intentScores)
      .reduce((a, b) => intentScores[a[0]] > intentScores[b[0]] ? a : b)[0];
    
    // Calculate overall intent score
    const intentScore = Math.max(...Object.values(intentScores));
    
    return {
      primaryIntent: primaryIntent,
      intentScores: intentScores,
      intentScore: intentScore,
      commercialKeywords: this._extractKeywords(combinedText, this.config.USER_INTENT.COMMERCIAL_KEYWORDS),
      informationalKeywords: this._extractKeywords(combinedText, this.config.USER_INTENT.INFORMATIONAL_KEYWORDS),
      transactionalKeywords: this._extractKeywords(combinedText, this.config.USER_INTENT.TRANSACTIONAL_KEYWORDS),
      navigationKeywords: this._extractKeywords(combinedText, this.config.USER_INTENT.NAVIGATIONAL_KEYWORDS)
    };
  }

  /**
   * Detect conversion elements on the page
   */
  _detectConversionElements(document) {
    const conversionElements = {
      // Call-to-action buttons
      ctaButtons: this._detectCTAButtons(document),
      
      // Forms analysis
      forms: this._analyzeForms(document),
      
      // Checkout elements
      checkoutElements: this._detectCheckoutElements(document),
      
      // Lead generation elements
      leadGeneration: this._analyzeLeadGeneration(document),
      
      // Contact elements
      contactElements: this._detectContactElements(document)
    };
    
    // Calculate conversion readiness score
    const conversionScore = this._calculateConversionScore(conversionElements);
    
    return {
      ...conversionElements,
      conversionScore: conversionScore,
      conversionReadiness: this._categorizeConversionReadiness(conversionScore),
      optimizationOpportunities: this._identifyConversionOpportunities(conversionElements)
    };
  }

  /**
   * Analyze social proof elements
   */
  _analyzeSocialProof(document, textContent) {
    const socialProof = {
      // Testimonials
      testimonials: this._detectTestimonials(document),
      
      // Reviews and ratings
      reviews: this._detectReviews(document, textContent),
      
      // Social metrics
      socialMetrics: this._extractSocialMetrics(document, textContent),
      
      // Case studies
      caseStudies: this._detectCaseStudies(document, textContent),
      
      // Customer logos/mentions
      customerMentions: this._detectCustomerMentions(document)
    };
    
    // Calculate social proof strength
    const socialProofScore = this._calculateSocialProofScore(socialProof);
    
    return {
      ...socialProof,
      socialProofScore: socialProofScore,
      socialProofStrength: this._categorizeSocialProofStrength(socialProofScore),
      credibilityIndicators: this._analyzeCredibilityIndicators(socialProof)
    };
  }

  /**
   * Detect trust signals
   */
  _detectTrustSignals(document, textContent) {
    const trustSignals = {
      // Contact information
      contactInfo: this._extractContactInfo(document),
      
      // Certifications and badges
      certifications: this._detectCertifications(document, textContent),
      
      // Authority indicators
      authoritySignals: this._detectAuthoritySignals(document, textContent),
      
      // Security indicators
      securitySignals: this._detectSecuritySignals(document, textContent),
      
      // Policy pages
      policyPages: this._detectPolicyPages(document),
      
      // About/team information
      aboutInfo: this._analyzeAboutInfo(document, textContent)
    };
    
    // Calculate trust score
    const trustScore = this._calculateTrustScore(trustSignals);
    
    return {
      ...trustSignals,
      trustScore: trustScore,
      trustLevel: this._categorizeTrustLevel(trustScore),
      trustDeficits: this._identifyTrustDeficits(trustSignals)
    };
  }

  /**
   * Assess overall business value of the page
   */
  _assessBusinessValue(document, textContent) {
    const businessIndicators = {
      // Value proposition clarity
      valueProposition: this._analyzeValueProposition(document, textContent),
      
      // Business model indicators
      businessModel: this._identifyBusinessModel(document, textContent),
      
      // Revenue potential indicators
      revenueIndicators: this._analyzeRevenueIndicators(document, textContent),
      
      // Target audience clarity
      targetAudience: this._analyzeTargetAudience(textContent),
      
      // Competitive positioning
      positioning: this._analyzePositioning(textContent)
    };
    
    return {
      ...businessIndicators,
      businessValueScore: this._calculateBusinessValueScore(businessIndicators),
      strategicRecommendations: this._generateStrategicRecommendations(businessIndicators)
    };
  }

  /**
   * Analyze funnel position and user journey
   */
  _analyzeFunnelPosition(url, textContent, document) {
    const urlPath = new URL(url).pathname.toLowerCase();
    
    // Determine funnel stage based on URL and content
    const funnelStage = this._determineFunnelStage(urlPath, textContent, document);
    
    // Analyze funnel optimization
    const funnelOptimization = this._analyzeFunnelOptimization(funnelStage, document, textContent);
    
    return {
      funnelStage: funnelStage,
      stageOptimization: funnelOptimization,
      nextStepClarification: this._analyzeNextStepClarity(document),
      userJourneyAlignment: this._assessUserJourneyAlignment(funnelStage, document)
    };
  }

  // Helper Methods

  /**
   * Extract page text content
   */
  _extractPageText(document) {
    // Remove scripts, styles, and navigation
    const elementsToRemove = this.safeQuery(document, 'script, style, nav, header, footer');
    if (elementsToRemove && elementsToRemove.length > 0) {
      Array.from(elementsToRemove).forEach(el => el.remove());
    }
    
    return document.body?.textContent || document.textContent || '';
  }

  /**
   * Calculate intent score for keywords
   */
  _calculateIntentScore(text, keywords) {
    let score = 0;
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = text.match(regex);
      if (matches) {
        score += matches.length;
      }
    });
    return score;
  }

  /**
   * Detect CTA buttons
   */
  _detectCTAButtons(document) {
    const ctaButtons = [];
    
    this.config.CONVERSION_ELEMENTS.CTA_SELECTORS.forEach(selector => {
      const elements = this.safeQuery(document, selector);
      if (elements && elements.length > 0) {
        Array.from(elements).forEach(element => {
          const text = element.textContent?.trim().toLowerCase() || '';
          const isCtaText = this.config.CONVERSION_ELEMENTS.CTA_KEYWORDS.some(keyword => 
            text.includes(keyword)
          );
          
          if (isCtaText || element.classList.contains('cta') || element.classList.contains('btn-primary')) {
            ctaButtons.push({
              text: element.textContent?.trim() || '',
              selector: selector,
              position: this._getElementPosition(element),
              visibility: this._checkElementVisibility(element),
              type: this._classifyCTAType(text)
            });
          }
        });
      }
    });
    
    return ctaButtons;
  }

  /**
   * Analyze forms on the page
   */
  _analyzeForms(document) {
    const forms = this.safeQuery(document, 'form');
    if (!forms || forms.length === 0) return [];
    
    return Array.from(forms).map(form => {
      const inputs = this.safeQuery(form, 'input, textarea, select');
      const submitButtons = this.safeQuery(form, 'input[type="submit"], button[type="submit"], button:not([type])');
      
      const inputsArray = inputs ? Array.from(inputs) : [];
      const buttonsArray = submitButtons ? Array.from(submitButtons) : [];
      
      return {
        id: form.id || 'unnamed',
        inputCount: inputsArray.length,
        inputTypes: inputsArray.map(input => input.type || input.tagName.toLowerCase()),
        submitButtons: buttonsArray.map(btn => btn.textContent?.trim() || ''),
        formType: this._classifyFormType(form, inputsArray),
        isVisible: this._checkElementVisibility(form)
      };
    });
  }

  /**
   * Detect testimonials
   */
  _detectTestimonials(document) {
    const testimonials = [];
    
    this.config.SOCIAL_PROOF.TESTIMONIAL_SELECTORS.forEach(selector => {
      const elements = this.safeQuery(document, selector);
      if (elements && elements.length > 0) {
        Array.from(elements).forEach(element => {
          testimonials.push({
            content: element.textContent?.trim() || '',
            hasAuthor: this._hasAuthorInfo(element),
            hasPhoto: this._hasPhoto(element),
            credibilityScore: this._calculateTestimonialCredibility(element)
          });
        });
      }
    });
    
    return testimonials;
  }

  /**
   * Extract contact information
   */
  _extractContactInfo(document) {
    const contactInfo = {
      email: this._extractEmails(document),
      phone: this._extractPhoneNumbers(document),
      address: this._extractAddresses(document),
      socialMedia: this._extractSocialMedia(document),
      contactForms: this._countContactForms(document)
    };
    
    return {
      ...contactInfo,
      contactCompleteness: this._calculateContactCompleteness(contactInfo)
    };
  }

  /**
   * Calculate business optimization score
   */
  _calculateBusinessScore(analysis) {
    const weights = {
      userIntent: 0.25,
      conversionElements: 0.30,
      socialProof: 0.20,
      trustSignals: 0.25
    };
    
    let score = 0;
    score += (analysis.userIntent?.intentAlignment?.score || 0) * weights.userIntent;
    score += (analysis.conversionElements?.conversionScore || 0) * weights.conversionElements;
    score += (analysis.socialProof?.socialProofScore || 0) * weights.socialProof;
    score += (analysis.trustSignals?.trustScore || 0) * weights.trustSignals;
    
    return Math.round(score);
  }

  /**
   * Generate business recommendations
   */
  _generateBusinessRecommendations(analysis) {
    const recommendations = [];
    
    // Intent optimization recommendations
    if (analysis.userIntent?.intentAlignment?.score < 70) {
      recommendations.push({
        type: 'user-intent',
        priority: 'high',
        title: 'Improve User Intent Alignment',
        description: `Page intent alignment score: ${analysis.userIntent.intentAlignment.score}/100`,
        suggestions: [
          'Align content with primary user intent',
          'Optimize headlines for intent clarity',
          'Improve content structure for intent fulfillment',
          'Add relevant CTAs for intent completion',
          'Review and optimize page flow'
        ],
        impact: 'user-experience'
      });
    }
    
    // Conversion optimization recommendations
    if (analysis.conversionElements?.conversionScore < 60) {
      recommendations.push({
        type: 'conversion-optimization',
        priority: 'high',
        title: 'Enhance Conversion Elements',
        description: `Conversion readiness score: ${analysis.conversionElements.conversionScore}/100`,
        suggestions: [
          'Add clear call-to-action buttons',
          'Optimize form designs and reduce friction',
          'Improve CTA button placement and visibility',
          'Add urgency and scarcity elements',
          'Implement A/B testing for conversion elements'
        ],
        impact: 'conversion-rate'
      });
    }
    
    // Social proof recommendations
    if (analysis.socialProof?.socialProofScore < 50) {
      recommendations.push({
        type: 'social-proof',
        priority: 'medium',
        title: 'Add Social Proof Elements',
        description: `Social proof strength: ${analysis.socialProof.socialProofStrength}`,
        suggestions: [
          'Add customer testimonials and reviews',
          'Display social metrics and user counts',
          'Include case studies and success stories',
          'Add customer logos and mentions',
          'Implement review and rating systems'
        ],
        impact: 'trust-credibility'
      });
    }
    
    // Trust signals recommendations
    if (analysis.trustSignals?.trustScore < 60) {
      recommendations.push({
        type: 'trust-signals',
        priority: 'high',
        title: 'Strengthen Trust Signals',
        description: `Trust level: ${analysis.trustSignals.trustLevel}`,
        suggestions: [
          'Add complete contact information',
          'Display security badges and certifications',
          'Include privacy policy and terms of service',
          'Add about page with team information',
          'Display authority indicators and awards'
        ],
        impact: 'trustworthiness'
      });
    }
    
    return recommendations;
  }

  // Additional helper methods (simplified for brevity)
  
  _analyzeIntentAlignment(intent, document) {
    // Simplified intent alignment scoring
    return { score: 75, alignment: 'good' };
  }

  _assessContentIntentMatch(intent, document) {
    return { match: 'good', score: 78 };
  }

  _generateIntentRecommendations(intent, alignment) {
    return [`Optimize content for ${intent} intent`];
  }

  _calculateConversionScore(elements) {
    let score = 0;
    score += elements.ctaButtons.length * 10; // 10 points per CTA
    score += elements.forms.length * 15; // 15 points per form
    score += elements.contactElements.completeness || 0;
    return Math.min(100, score);
  }

  _categorizeConversionReadiness(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  _identifyConversionOpportunities(elements) {
    return ['Add more prominent CTAs', 'Optimize form placement'];
  }

  _calculateSocialProofScore(proof) {
    let score = 0;
    score += proof.testimonials.length * 15;
    score += proof.reviews.length * 10;
    score += proof.caseStudies.length * 20;
    return Math.min(100, score);
  }

  _categorizeSocialProofStrength(score) {
    if (score >= 70) return 'strong';
    if (score >= 40) return 'moderate';
    return 'weak';
  }

  _analyzeCredibilityIndicators(proof) {
    return { indicators: proof.testimonials.length + proof.reviews.length };
  }

  _calculateTrustScore(signals) {
    let score = 0;
    score += signals.contactInfo.contactCompleteness || 0;
    score += signals.certifications.length * 10;
    score += signals.securitySignals.length * 15;
    return Math.min(100, score);
  }

  _categorizeTrustLevel(score) {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  _identifyTrustDeficits(signals) {
    const deficits = [];
    if (!signals.contactInfo.email.length) deficits.push('Missing email contact');
    if (!signals.contactInfo.phone.length) deficits.push('Missing phone contact');
    return deficits;
  }

  _analyzeValueProposition(document, text) {
    return { clarity: 'moderate', strength: 65 };
  }

  _identifyBusinessModel(document, text) {
    return { type: 'service', confidence: 0.7 };
  }

  _analyzeRevenueIndicators(document, text) {
    return { indicators: [] };
  }

  _analyzeTargetAudience(text) {
    return { clarity: 'good' };
  }

  _analyzePositioning(text) {
    return { positioning: 'unclear' };
  }

  _calculateBusinessValueScore(indicators) {
    return 65; // Placeholder scoring
  }

  _generateStrategicRecommendations(indicators) {
    return ['Clarify value proposition', 'Define target audience'];
  }

  _determineFunnelStage(urlPath, text, document) {
    if (urlPath.includes('checkout') || urlPath.includes('cart')) return 'conversion';
    if (urlPath.includes('product') || urlPath.includes('service')) return 'consideration';
    if (urlPath.includes('blog') || urlPath.includes('guide')) return 'awareness';
    return 'unknown';
  }

  _analyzeFunnelOptimization(stage, document, text) {
    return { optimization: 'good', score: 70 };
  }

  _analyzeNextStepClarity(document) {
    return { clarity: 'moderate' };
  }

  _assessUserJourneyAlignment(stage, document) {
    return { alignment: 'good' };
  }

  _getElementPosition(element) {
    return 'unknown'; // Simplified
  }

  _checkElementVisibility(element) {
    return true; // Simplified
  }

  _classifyCTAType(text) {
    if (text.includes('buy') || text.includes('purchase')) return 'purchase';
    if (text.includes('sign up') || text.includes('subscribe')) return 'signup';
    if (text.includes('contact') || text.includes('call')) return 'contact';
    return 'general';
  }

  _classifyFormType(form, inputs) {
    const hasEmail = inputs.some(input => input.type === 'email');
    const hasPassword = inputs.some(input => input.type === 'password');
    
    if (hasEmail && hasPassword) return 'login';
    if (hasEmail) return 'newsletter';
    return 'contact';
  }

  _hasAuthorInfo(element) {
    return this.safeQueryOne(element, '.author, .name, .customer') !== null;
  }

  _hasPhoto(element) {
    return this.safeQueryOne(element, 'img') !== null;
  }

  _calculateTestimonialCredibility(element) {
    let score = 50;
    if (this._hasAuthorInfo(element)) score += 25;
    if (this._hasPhoto(element)) score += 25;
    return score;
  }

  _extractEmails(document) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const text = document.textContent || '';
    return text.match(emailRegex) || [];
  }

  _extractPhoneNumbers(document) {
    const phoneRegex = /(\+?\d{1,3}[\s-]?)?\(?[\d\s-]{10,}\)?/g;
    const text = document.textContent || '';
    return text.match(phoneRegex) || [];
  }

  _extractAddresses(document) {
    // Simplified address extraction
    return [];
  }

  _extractSocialMedia(document) {
    const socialLinks = this.safeQuery(document, 'a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="instagram"]');
    return socialLinks ? Array.from(socialLinks).map(link => link.href) : [];
  }

  _countContactForms(document) {
    const forms = this.safeQuery(document, 'form[class*="contact"], form[id*="contact"]');
    return forms ? forms.length : 0;
  }

  _calculateContactCompleteness(contactInfo) {
    let score = 0;
    if (contactInfo.email.length > 0) score += 25;
    if (contactInfo.phone.length > 0) score += 25;
    if (contactInfo.address.length > 0) score += 25;
    if (contactInfo.contactForms > 0) score += 25;
    return score;
  }

  _detectCheckoutElements(document) {
    const allElements = this.safeQuery(document, '*');
    if (!allElements) return [];
    
    return Array.from(allElements).filter(el => 
      this.config.CONVERSION_ELEMENTS.CHECKOUT_INDICATORS.some(indicator =>
        el.textContent?.toLowerCase().includes(indicator) ||
        el.className?.toLowerCase().includes(indicator) ||
        el.id?.toLowerCase().includes(indicator)
      )
    );
  }

  _analyzeLeadGeneration(document) {
    const leadMagnets = this.safeQuery(document, '.lead-magnet, .download, .free-trial');
    const newsletters = this.safeQuery(document, 'form[class*="newsletter"], input[placeholder*="email"]');
    
    return {
      leadMagnets: leadMagnets ? leadMagnets.length : 0,
      newsletters: newsletters ? newsletters.length : 0
    };
  }

  _detectContactElements(document) {
    return {
      completeness: this._calculateContactCompleteness(this._extractContactInfo(document))
    };
  }

  _detectReviews(document, text) {
    const reviews = this.safeQuery(document, '.review, .rating, [class*="star"]');
    return reviews ? Array.from(reviews) : [];
  }

  _extractSocialMetrics(document, text) {
    const metrics = [];
    this.config.SOCIAL_PROOF.SOCIAL_METRICS.forEach(metric => {
      const regex = new RegExp(`\\d+[,\\s]*${metric}`, 'gi');
      const matches = text.match(regex);
      if (matches) metrics.push(...matches);
    });
    return metrics;
  }

  _detectCaseStudies(document, text) {
    const caseStudies = this.safeQuery(document, '.case-study, .success-story');
    return caseStudies ? Array.from(caseStudies) : [];
  }

  _detectCustomerMentions(document) {
    const customerLogos = this.safeQuery(document, '.customer-logo, .client-logo, .partner-logo');
    return customerLogos ? Array.from(customerLogos) : [];
  }

  _detectCertifications(document, text) {
    const certs = [];
    this.options.TRUST_SIGNALS.CERTIFICATION_KEYWORDS.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        certs.push(keyword);
      }
    });
    return certs;
  }

  _detectAuthoritySignals(document, text) {
    return this.options.TRUST_SIGNALS.AUTHORITY_INDICATORS.filter(indicator =>
      text.toLowerCase().includes(indicator)
    );
  }

  _detectSecuritySignals(document, text) {
    return this.options.TRUST_SIGNALS.SECURITY_INDICATORS.filter(indicator =>
      text.toLowerCase().includes(indicator)
    );
  }

  _detectPolicyPages(document) {
    const allLinks = this.safeQuery(document, 'a');
    if (!allLinks) return [];
    
    const policyLinks = Array.from(allLinks).filter(link =>
      link.href.includes('privacy') || link.href.includes('terms') || 
      link.textContent?.toLowerCase().includes('privacy') ||
      link.textContent?.toLowerCase().includes('terms')
    );
    return policyLinks.map(link => ({ text: link.textContent, href: link.href }));
  }

  _analyzeAboutInfo(document, text) {
    const allLinks = this.safeQuery(document, 'a');
    const hasAboutPage = allLinks ? Array.from(allLinks).some(link =>
      link.href.includes('about') || link.textContent?.toLowerCase().includes('about')
    ) : false;
    
    return {
      hasAboutPage: hasAboutPage,
      hasTeamInfo: text.toLowerCase().includes('team') || text.toLowerCase().includes('founder'),
      hasCompanyHistory: text.toLowerCase().includes('founded') || text.toLowerCase().includes('established')
    };
  }

  /**
   * Calculate overall business optimization score
   */
  _calculateBusinessScore(analysis) {
    const weights = {
      userIntent: 0.25,
      conversionElements: 0.30,
      socialProof: 0.20,
      trustSignals: 0.25
    };

    let totalScore = 0;
    
    // User intent scoring
    const userIntentScore = Math.min(100, (analysis.userIntent.intentScore / 10) * 100);
    totalScore += userIntentScore * weights.userIntent;

    // Conversion elements scoring
    const conversionScore = this._scoreConversionElements(analysis.conversionElements);
    totalScore += conversionScore * weights.conversionElements;

    // Social proof scoring
    totalScore += (analysis.socialProof.socialProofScore || 0) * weights.socialProof;

    // Trust signals scoring
    totalScore += (analysis.trustSignals.trustScore || 0) * weights.trustSignals;

    return Math.round(totalScore);
  }

  /**
   * Score conversion elements
   */
  _scoreConversionElements(conversionElements) {
    let score = 0;
    const maxPoints = 100;
    
    // CTAs (30 points max)
    if (conversionElements.ctaButtons && conversionElements.ctaButtons.length > 0) {
      score += Math.min(30, conversionElements.ctaButtons.length * 10);
    }
    
    // Forms (25 points max)
    if (conversionElements.forms && conversionElements.forms.length > 0) {
      score += Math.min(25, conversionElements.forms.length * 12);
    }
    
    // Checkout elements (25 points max)
    if (conversionElements.checkout && conversionElements.checkout.length > 0) {
      score += 25;
    }
    
    // Lead generation (20 points max)
    if (conversionElements.leadGeneration) {
      const leadScore = (conversionElements.leadGeneration.leadMagnets * 10) + 
                       (conversionElements.leadGeneration.newsletters * 10);
      score += Math.min(20, leadScore);
    }
    
    return Math.min(maxPoints, score);
  }

  /**
   * Get grade from score
   */
  _getGradeFromScore(score) {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D+';
    if (score >= 40) return 'D';
    return 'F';
  }

  /**
   * Generate summary
   */
  _generateSummary(analysis) {
    const score = analysis.businessOptimizationScore;
    const grade = analysis.grade;
    
    let summary = `Business Analytics Summary:\n`;
    summary += `Overall Score: ${score}% (Grade: ${grade})\n\n`;
    
    // User Intent Summary
    summary += `User Intent Analysis:\n`;
    summary += `- Primary Intent: ${analysis.userIntent.primaryIntent}\n`;
    summary += `- Intent Score: ${analysis.userIntent.intentScore}/10\n`;
    summary += `- Commercial Keywords: ${analysis.userIntent.commercialKeywords.length}\n\n`;
    
    // Conversion Elements Summary
    summary += `Conversion Elements:\n`;
    summary += `- CTA Buttons: ${analysis.conversionElements.ctaButtons?.length || 0}\n`;
    summary += `- Forms: ${analysis.conversionElements.forms?.length || 0}\n`;
    summary += `- Checkout Elements: ${analysis.conversionElements.checkout?.length || 0}\n\n`;
    
    // Social Proof Summary
    summary += `Social Proof Strength: ${analysis.socialProof.socialProofStrength || 'Unknown'}\n`;
    summary += `Trust Level: ${analysis.trustSignals.trustLevel || 'Unknown'}\n\n`;
    
    // Key Recommendations
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      summary += `Top Recommendations:\n`;
      analysis.recommendations.slice(0, 3).forEach((rec, index) => {
        summary += `${index + 1}. ${rec.title}\n`;
      });
    }
    
    return summary;
  }

  /**
   * Generate business recommendations
   */
  _generateBusinessRecommendations(analysis) {
    const recommendations = [];
    
    // User Intent Recommendations
    if (analysis.userIntent.intentScore < 7) {
      recommendations.push({
        category: 'User Intent',
        title: 'Improve User Intent Clarity',
        description: 'Add more specific keywords that clearly indicate what users can accomplish on this page.',
        priority: 'high',
        impact: 'high'
      });
    }
    
    // CTA Recommendations
    if (!analysis.conversionElements.ctaButtons || analysis.conversionElements.ctaButtons.length < 2) {
      recommendations.push({
        category: 'Conversion',
        title: 'Add More Call-to-Action Buttons',
        description: 'Increase the number of clear, visible CTAs to improve conversion opportunities.',
        priority: 'high',
        impact: 'high'
      });
    }
    
    // Social Proof Recommendations
    if (analysis.socialProof.socialProofScore < 50) {
      recommendations.push({
        category: 'Social Proof',
        title: 'Strengthen Social Proof',
        description: 'Add testimonials, reviews, or customer logos to build credibility.',
        priority: 'medium',
        impact: 'medium'
      });
    }
    
    // Trust Signal Recommendations
    if (analysis.trustSignals.trustScore < 60) {
      recommendations.push({
        category: 'Trust Signals',
        title: 'Improve Trust Indicators',
        description: 'Add contact information, security badges, or policy pages to increase trustworthiness.',
        priority: 'medium',
        impact: 'medium'
      });
    }
    
    return recommendations;
  }

  /**
   * Identify optimization opportunities
   */
  _identifyOptimizationOpportunities(analysis) {
    const opportunities = [];
    
    // Check for missing business elements
    if (!analysis.conversionElements.forms || analysis.conversionElements.forms.length === 0) {
      opportunities.push({
        type: 'Lead Generation',
        description: 'Consider adding lead capture forms to collect user information',
        potential: 'High conversion impact'
      });
    }
    
    if (analysis.userIntent.commercialKeywords.length < 5) {
      opportunities.push({
        type: 'Commercial Intent',
        description: 'Add more commercial keywords to attract ready-to-buy customers',
        potential: 'Improved user targeting'
      });
    }
    
    if (!analysis.socialProof.testimonials || analysis.socialProof.testimonials.length === 0) {
      opportunities.push({
        type: 'Social Proof',
        description: 'Add customer testimonials to build trust and credibility',
        potential: 'Increased conversion rates'
      });
    }
    
    return opportunities;
  }

  // Additional helper methods for comprehensive business analytics

  /**
   * Extract keywords that appear in text
   */
  _extractKeywords(text, keywords) {
    const foundKeywords = [];
    keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
      }
    });
    return foundKeywords;
  }

  /**
   * Get element position on page
   */
  _getElementPosition(element) {
    try {
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top,
        left: rect.left,
        visible: rect.top >= 0 && rect.left >= 0
      };
    } catch (error) {
      return { top: 0, left: 0, visible: true };
    }
  }

  /**
   * Check if element is visible
   */
  _checkElementVisibility(element) {
    try {
      const style = window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle;
      return style && style.display !== 'none' && style.visibility !== 'hidden';
    } catch (error) {
      return true; // Assume visible if we can't determine
    }
  }

  /**
   * Classify CTA type
   */
  _classifyCTAType(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('buy') || lowerText.includes('purchase')) return 'purchase';
    if (lowerText.includes('signup') || lowerText.includes('register')) return 'signup';
    if (lowerText.includes('download')) return 'download';
    if (lowerText.includes('contact') || lowerText.includes('call')) return 'contact';
    if (lowerText.includes('learn') || lowerText.includes('more')) return 'informational';
    return 'generic';
  }

  /**
   * Classify form type
   */
  _classifyFormType(form, inputs) {
    const hasEmail = inputs.some(input => 
      input.type === 'email' || input.name?.includes('email') || input.placeholder?.includes('email')
    );
    const hasPassword = inputs.some(input => input.type === 'password');
    const hasName = inputs.some(input => 
      input.name?.includes('name') || input.placeholder?.includes('name')
    );
    const hasPhone = inputs.some(input => 
      input.type === 'tel' || input.name?.includes('phone') || input.placeholder?.includes('phone')
    );
    
    if (hasEmail && hasPassword) return 'login';
    if (hasEmail && hasName) return 'contact';
    if (hasEmail && !hasName && !hasPhone) return 'newsletter';
    if (hasPhone) return 'contact';
    return 'generic';
  }

  /**
   * Extract testimonial author
   */
  _extractTestimonialAuthor(element) {
    const authorElement = this.safeQueryOne(element, '.author, .name, .customer');
    return authorElement ? authorElement.textContent?.trim() : '';
  }

  /**
   * Extract emails from text
   */
  _extractEmails(document) {
    const text = document.textContent || '';
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    return text.match(emailRegex) || [];
  }

  /**
   * Extract phone numbers from text
   */
  _extractPhoneNumbers(document) {
    const text = document.textContent || '';
    const phoneRegex = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/g;
    return text.match(phoneRegex) || [];
  }

  /**
   * Extract addresses from document
   */
  _extractAddresses(document) {
    // Simplified address extraction - in real implementation would be more sophisticated
    return [];
  }

  /**
   * Analyze value proposition
   */
  _analyzeValueProposition(document, textContent) {
    const valueWords = ['save', 'best', 'quality', 'premium', 'unique', 'exclusive', 'guaranteed'];
    const foundValues = valueWords.filter(word => textContent.toLowerCase().includes(word));
    
    return {
      clarity: foundValues.length > 2 ? 'high' : foundValues.length > 0 ? 'medium' : 'low',
      valueWords: foundValues
    };
  }

  /**
   * Identify business model
   */
  _identifyBusinessModel(document, textContent) {
    const indicators = {
      ecommerce: ['shop', 'cart', 'buy', 'product', 'price'],
      saas: ['subscription', 'plan', 'trial', 'software', 'app'],
      service: ['service', 'consulting', 'help', 'support'],
      content: ['blog', 'article', 'news', 'read', 'content'],
      marketplace: ['sellers', 'buyers', 'marketplace', 'platform']
    };
    
    const scores = {};
    Object.keys(indicators).forEach(model => {
      scores[model] = indicators[model].filter(word => 
        textContent.toLowerCase().includes(word)
      ).length;
    });
    
    const primaryModel = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    return {
      primaryModel: primaryModel,
      confidence: scores[primaryModel] > 0 ? 'medium' : 'low',
      indicators: scores
    };
  }

  /**
   * Analyze revenue indicators
   */
  _analyzeRevenueIndicators(document, textContent) {
    const revenueWords = ['price', 'cost', 'fee', 'payment', 'billing', 'subscription', 'plan'];
    const foundIndicators = revenueWords.filter(word => textContent.toLowerCase().includes(word));
    
    return {
      hasRevenueIndicators: foundIndicators.length > 0,
      revenueSignals: foundIndicators,
      monetizationClarity: foundIndicators.length > 2 ? 'high' : foundIndicators.length > 0 ? 'medium' : 'low'
    };
  }

  /**
   * Analyze target audience
   */
  _analyzeTargetAudience(textContent) {
    const audienceWords = ['business', 'enterprise', 'small business', 'consumers', 'professionals', 'teams'];
    const foundAudience = audienceWords.filter(word => textContent.toLowerCase().includes(word));
    
    return {
      audienceClarity: foundAudience.length > 0 ? 'medium' : 'low',
      targetSegments: foundAudience
    };
  }

  /**
   * Analyze positioning
   */
  _analyzePositioning(textContent) {
    const positioningWords = ['leader', 'first', 'best', 'fastest', 'most', 'only', 'unique'];
    const foundPositioning = positioningWords.filter(word => textContent.toLowerCase().includes(word));
    
    return {
      positioningStrength: foundPositioning.length > 2 ? 'strong' : foundPositioning.length > 0 ? 'moderate' : 'weak',
      positioningClaims: foundPositioning
    };
  }

  /**
   * Detect certifications
   */
  _detectCertifications(document, textContent) {
    const certWords = ['certified', 'iso', 'ssl', 'secure', 'verified', 'badge', 'certification'];
    const foundCerts = certWords.filter(word => textContent.toLowerCase().includes(word));
    
    return foundCerts.map(cert => ({ type: cert, verified: false }));
  }

  /**
   * Detect authority signals
   */
  _detectAuthoritySignals(document, textContent) {
    const authorityWords = ['expert', 'professional', 'award', 'featured', 'trusted', 'recommended'];
    const foundAuthority = authorityWords.filter(word => textContent.toLowerCase().includes(word));
    
    return {
      authorityIndicators: foundAuthority,
      authorityScore: foundAuthority.length * 10
    };
  }

  /**
   * Detect security signals
   */
  _detectSecuritySignals(document, textContent) {
    const securityWords = ['secure', 'ssl', 'encrypted', 'protected', 'privacy', 'safe'];
    const foundSecurity = securityWords.filter(word => textContent.toLowerCase().includes(word));
    
    return {
      securityIndicators: foundSecurity,
      securityScore: foundSecurity.length * 15
    };
  }

  /**
   * Analyze credibility indicators
   */
  _analyzeCredibilityIndicators(socialProof) {
    const indicators = [];
    
    if (socialProof.testimonials && socialProof.testimonials.length > 0) {
      indicators.push('testimonials');
    }
    if (socialProof.reviews && socialProof.reviews.length > 0) {
      indicators.push('reviews');
    }
    if (socialProof.customerMentions && socialProof.customerMentions.length > 0) {
      indicators.push('customer_logos');
    }
    
    return indicators;
  }

  /**
   * Identify trust deficits
   */
  _identifyTrustDeficits(trustSignals) {
    const deficits = [];
    
    if (!trustSignals.contactInfo || trustSignals.contactInfo.contactCompleteness < 50) {
      deficits.push('missing_contact_info');
    }
    if (!trustSignals.policyPages || trustSignals.policyPages.length === 0) {
      deficits.push('missing_policy_pages');
    }
    if (!trustSignals.aboutInfo || !trustSignals.aboutInfo.hasAboutPage) {
      deficits.push('missing_about_page');
    }
    
    return deficits;
  }

  /**
   * Calculate business value score
   */
  _calculateBusinessValueScore(businessIndicators) {
    let score = 0;
    
    if (businessIndicators.valueProposition.clarity === 'high') score += 30;
    else if (businessIndicators.valueProposition.clarity === 'medium') score += 20;
    
    if (businessIndicators.businessModel.confidence === 'medium') score += 25;
    
    if (businessIndicators.revenueIndicators.hasRevenueIndicators) score += 25;
    
    if (businessIndicators.targetAudience.audienceClarity === 'medium') score += 20;
    
    return Math.min(100, score);
  }

  /**
   * Generate strategic recommendations
   */
  _generateStrategicRecommendations(businessIndicators) {
    const recommendations = [];
    
    if (businessIndicators.valueProposition.clarity === 'low') {
      recommendations.push('Clarify your value proposition with specific benefits');
    }
    
    if (!businessIndicators.revenueIndicators.hasRevenueIndicators) {
      recommendations.push('Add clear pricing or monetization information');
    }
    
    if (businessIndicators.targetAudience.audienceClarity === 'low') {
      recommendations.push('Define and communicate your target audience more clearly');
    }
    
    return recommendations;
  }

  /**
   * Calculate social proof score
   */
  _calculateSocialProofScore(socialProof) {
    let score = 0;
    
    if (socialProof.testimonials && socialProof.testimonials.length > 0) {
      score += Math.min(30, socialProof.testimonials.length * 10);
    }
    
    if (socialProof.reviews && socialProof.reviews.length > 0) {
      score += Math.min(25, socialProof.reviews.length * 8);
    }
    
    if (socialProof.socialMetrics && socialProof.socialMetrics.length > 0) {
      score += Math.min(20, socialProof.socialMetrics.length * 5);
    }
    
    if (socialProof.caseStudies && socialProof.caseStudies.length > 0) {
      score += Math.min(15, socialProof.caseStudies.length * 7);
    }
    
    if (socialProof.customerMentions && socialProof.customerMentions.length > 0) {
      score += Math.min(10, socialProof.customerMentions.length * 3);
    }
    
    return Math.min(100, score);
  }

  /**
   * Categorize social proof strength
   */
  _categorizeSocialProofStrength(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 20) return 'Weak';
    return 'Very Weak';
  }

  /**
   * Calculate trust score
   */
  _calculateTrustScore(trustSignals) {
    let score = 0;
    
    if (trustSignals.contactInfo && trustSignals.contactInfo.contactCompleteness > 0) {
      score += trustSignals.contactInfo.contactCompleteness * 0.3;
    }
    
    if (trustSignals.certifications && trustSignals.certifications.length > 0) {
      score += Math.min(25, trustSignals.certifications.length * 8);
    }
    
    if (trustSignals.policyPages && trustSignals.policyPages.length > 0) {
      score += Math.min(20, trustSignals.policyPages.length * 10);
    }
    
    if (trustSignals.aboutInfo && trustSignals.aboutInfo.hasAboutPage) {
      score += 15;
    }
    
    return Math.min(100, score);
  }

  /**
   * Categorize trust level
   */
  _categorizeTrustLevel(score) {
    if (score >= 80) return 'High Trust';
    if (score >= 60) return 'Moderate Trust';
    if (score >= 40) return 'Low Trust';
    return 'Very Low Trust';
  }
}

export default BusinessAnalyticsAnalyzer;
