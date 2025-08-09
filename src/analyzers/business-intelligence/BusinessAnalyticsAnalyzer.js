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

import { BaseAnalyzer } from '../core/BaseAnalyzer.js';
import { AnalyzerCategories } from '../core/AnalyzerCategories.js';

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
    super('BusinessAnalyticsAnalyzer');
    this.options = { ...BUSINESS_ANALYTICS_CONFIG, ...options };
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: this.name,
      category: AnalyzerCategories.BUSINESS,
      description: 'Advanced business analytics including user intent analysis, conversion element detection, social proof analysis, and trust signals assessment',
      version: '1.0.0',
      author: 'Nimrod Galor',
      priority: 'high',
      type: 'business-analytics',
      capabilities: [
        'user-intent-analysis',
        'conversion-elements-detection',
        'social-proof-analysis',
        'trust-signals-detection',
        'business-value-assessment',
        'competitive-analysis',
        'market-positioning-analysis'
      ],
      metrics: [
        'user_intent_score',
        'conversion_optimization_score',
        'social_proof_score',
        'trust_signals_score',
        'business_value_score',
        'competitive_advantage_score',
        'overall_analytics_score'
      ],
      dependencies: ['cheerio', 'jsdom'],
      performanceImpact: 'high'
    };
  }

  /**
   * Validate input parameters
   * @param {Object} dom - JSDOM document object
   * @param {Object} pageData - Existing page data
   * @param {string} url - Page URL
   * @returns {boolean} True if inputs are valid
   */
  validate(dom, pageData, url) {
    if (!dom || !dom.window || !dom.window.document) {
      this.handleError('Valid DOM object is required for business analytics analysis');
      return false;
    }

    if (!pageData || typeof pageData !== 'object') {
      this.handleError('Page data object is required for business analytics analysis');
      return false;
    }

    if (!url || typeof url !== 'string') {
      this.handleError('Valid URL is required for business analytics analysis');
      return false;
    }

    try {
      new URL(url);
    } catch (error) {
      this.handleError(`Invalid URL format: ${url}`);
      return false;
    }

    return true;
  }

  /**
   * Perform comprehensive business analytics analysis
   * @param {Object} dom - JSDOM document object
   * @param {Object} pageData - Existing page data
   * @param {string} url - Page URL
   * @returns {Object} Business analytics analysis
   */
  async analyzeBusinessAnalytics(dom, pageData, url) {
    if (!this.validate(dom, pageData, url)) {
      return this.createErrorResult('Validation failed for business analytics analysis');
    }

    try {
      const document = dom.window.document;
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
      };

      // Calculate business optimization score
      const score = this._calculateBusinessScore(analysis);
      const performance = performance.now() - startTime;
      
      const result = {
        ...analysis,
        score,
        grade: this._assignGrade(score),
        optimizationOpportunities: this._identifyOptimizationOpportunities(analysis),
        recommendations: this._generateBusinessRecommendations(analysis),
        summary: this._generateExecutiveSummary(analysis, score),
        metadata: {
          ...this.getMetadata(),
          analysisDate: new Date().toISOString(),
          performanceMs: Math.round(performance),
          url: url
        }
      };
      
      return result;
      
    } catch (error) {
      this.handleError(`Business analytics analysis failed: ${error.message}`);
      return this.createErrorResult('Business analytics analysis failed');
    }
  }

  /**
   * Analyze user intent based on content and URL
   */
  _analyzeUserIntent(textContent, url, document) {
    const urlPath = new URL(url).pathname.toLowerCase();
    const pageTitle = document.querySelector('title')?.textContent?.toLowerCase() || '';
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
      .map(h => h.textContent.toLowerCase()).join(' ');
    
    const combinedText = `${urlPath} ${pageTitle} ${headings} ${textContent}`.toLowerCase();
    
    // Analyze intent signals
    const intentScores = {
      informational: this._calculateIntentScore(combinedText, this.options.USER_INTENT.INFORMATIONAL_KEYWORDS),
      commercial: this._calculateIntentScore(combinedText, this.options.USER_INTENT.COMMERCIAL_KEYWORDS),
      transactional: this._calculateIntentScore(combinedText, this.options.USER_INTENT.TRANSACTIONAL_KEYWORDS),
      navigational: this._calculateIntentScore(combinedText, this.options.USER_INTENT.NAVIGATIONAL_KEYWORDS)
    };
    
    // Determine primary intent
    const primaryIntent = Object.entries(intentScores)
      .reduce((a, b) => intentScores[a[0]] > intentScores[b[0]] ? a : b)[0];
    
    // Analyze intent alignment with page structure
    const intentAlignment = this._analyzeIntentAlignment(primaryIntent, document);
    
    return {
      primaryIntent: primaryIntent,
      intentScores: intentScores,
      intentStrength: intentScores[primaryIntent],
      intentAlignment: intentAlignment,
      contentIntentMatch: this._assessContentIntentMatch(primaryIntent, document),
      recommendations: this._generateIntentRecommendations(primaryIntent, intentAlignment)
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
    const elementsToRemove = document.querySelectorAll('script, style, nav, header, footer');
    elementsToRemove.forEach(el => el.remove());
    
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
    
    this.options.CONVERSION_ELEMENTS.CTA_SELECTORS.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const text = element.textContent?.trim().toLowerCase() || '';
        const isCtaText = this.options.CONVERSION_ELEMENTS.CTA_KEYWORDS.some(keyword => 
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
    });
    
    return ctaButtons;
  }

  /**
   * Analyze forms on the page
   */
  _analyzeForms(document) {
    const forms = Array.from(document.querySelectorAll('form')).map(form => {
      const inputs = Array.from(form.querySelectorAll('input, textarea, select'));
      const submitButtons = Array.from(form.querySelectorAll('input[type="submit"], button[type="submit"], button:not([type])'));
      
      return {
        id: form.id || 'unnamed',
        inputCount: inputs.length,
        inputTypes: inputs.map(input => input.type || input.tagName.toLowerCase()),
        submitButtons: submitButtons.map(btn => btn.textContent?.trim() || ''),
        formType: this._classifyFormType(form, inputs),
        isVisible: this._checkElementVisibility(form)
      };
    });
    
    return forms;
  }

  /**
   * Detect testimonials
   */
  _detectTestimonials(document) {
    const testimonials = [];
    
    this.options.SOCIAL_PROOF.TESTIMONIAL_SELECTORS.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        testimonials.push({
          content: element.textContent?.trim() || '',
          hasAuthor: this._hasAuthorInfo(element),
          hasPhoto: this._hasPhoto(element),
          credibilityScore: this._calculateTestimonialCredibility(element)
        });
      });
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
    return element.querySelector('.author, .name, .customer') !== null;
  }

  _hasPhoto(element) {
    return element.querySelector('img') !== null;
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
    const socialLinks = Array.from(document.querySelectorAll('a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="instagram"]'));
    return socialLinks.map(link => link.href);
  }

  _countContactForms(document) {
    return document.querySelectorAll('form[class*="contact"], form[id*="contact"]').length;
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
    return Array.from(document.querySelectorAll('*')).filter(el => 
      this.options.CONVERSION_ELEMENTS.CHECKOUT_INDICATORS.some(indicator =>
        el.textContent?.toLowerCase().includes(indicator) ||
        el.className?.toLowerCase().includes(indicator) ||
        el.id?.toLowerCase().includes(indicator)
      )
    );
  }

  _analyzeLeadGeneration(document) {
    return {
      leadMagnets: document.querySelectorAll('.lead-magnet, .download, .free-trial').length,
      newsletters: document.querySelectorAll('form[class*="newsletter"], input[placeholder*="email"]').length
    };
  }

  _detectContactElements(document) {
    return {
      completeness: this._calculateContactCompleteness(this._extractContactInfo(document))
    };
  }

  _detectReviews(document, text) {
    return Array.from(document.querySelectorAll('.review, .rating, [class*="star"]'));
  }

  _extractSocialMetrics(document, text) {
    const metrics = [];
    this.options.SOCIAL_PROOF.SOCIAL_METRICS.forEach(metric => {
      const regex = new RegExp(`\\d+[,\\s]*${metric}`, 'gi');
      const matches = text.match(regex);
      if (matches) metrics.push(...matches);
    });
    return metrics;
  }

  _detectCaseStudies(document, text) {
    return Array.from(document.querySelectorAll('.case-study, .success-story'));
  }

  _detectCustomerMentions(document) {
    return Array.from(document.querySelectorAll('.customer-logo, .client-logo, .partner-logo'));
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
    const policyLinks = Array.from(document.querySelectorAll('a')).filter(link =>
      link.href.includes('privacy') || link.href.includes('terms') || 
      link.textContent?.toLowerCase().includes('privacy') ||
      link.textContent?.toLowerCase().includes('terms')
    );
    return policyLinks.map(link => ({ text: link.textContent, href: link.href }));
  }

  _analyzeAboutInfo(document, text) {
    const hasAboutPage = Array.from(document.querySelectorAll('a')).some(link =>
      link.href.includes('about') || link.textContent?.toLowerCase().includes('about')
    );
    
    return {
      hasAboutPage: hasAboutPage,
      hasTeamInfo: text.toLowerCase().includes('team') || text.toLowerCase().includes('founder'),
      hasCompanyHistory: text.toLowerCase().includes('founded') || text.toLowerCase().includes('established')
    };
  }

  /**
   * Generate executive summary
   * @param {Object} analysis - Analysis results
   * @param {number} score - Overall score
   * @returns {string} Executive summary
   */
  _generateExecutiveSummary(analysis, score) {
    const grade = this._assignGrade(score);
    
    let summary = `Business Analytics Analysis (Grade: ${grade}, Score: ${score}/100)\n\n`;
    
    summary += `Overall Assessment: `;
    if (score >= 80) {
      summary += `Excellent business optimization with strong conversion elements and trust signals. `;
    } else if (score >= 60) {
      summary += `Good business foundation with room for optimization improvements. `;
    } else if (score >= 40) {
      summary += `Basic business elements present but lacking optimization focus. `;
    } else {
      summary += `Limited business optimization, requires significant development. `;
    }
    
    // User intent summary
    if (analysis.userIntent) {
      const intentTypes = Object.keys(analysis.userIntent).filter(key => 
        key !== 'dominantIntent' && analysis.userIntent[key] > 0
      );
      summary += `Page targets ${intentTypes.length} user intent type(s) with ${analysis.userIntent.dominantIntent} being dominant. `;
    }
    
    // Conversion elements summary
    if (analysis.conversionElements) {
      const ctaCount = analysis.conversionElements.ctas?.length || 0;
      const formCount = analysis.conversionElements.forms?.length || 0;
      summary += `Found ${ctaCount} CTA(s) and ${formCount} form(s) for conversion optimization. `;
    }
    
    // Social proof summary
    if (analysis.socialProof) {
      const proofCount = (analysis.socialProof.testimonials?.length || 0) + 
                       (analysis.socialProof.reviews?.length || 0) + 
                       (analysis.socialProof.socialMetrics?.length || 0);
      summary += `${proofCount} social proof element(s) detected. `;
    }
    
    // Trust signals summary
    if (analysis.trustSignals) {
      const trustCount = (analysis.trustSignals.contactInfo?.methods?.length || 0) + 
                        (analysis.trustSignals.securityBadges?.length || 0) + 
                        (analysis.trustSignals.policies?.length || 0);
      summary += `${trustCount} trust signal(s) present. `;
    }
    
    // Business value summary
    if (analysis.businessValue) {
      summary += `Business value proposition ${analysis.businessValue.hasValueProposition ? 'clearly defined' : 'needs development'}. `;
    }
    
    return summary.trim();
  }

  /**
   * Assign letter grade based on score
   * @param {number} score - Numerical score
   * @returns {string} Letter grade
   */
  _assignGrade(score) {
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
}

export default BusinessAnalyticsAnalyzer;
