/**
 * ============================================================================
 * TRUST SIGNAL ANALYZER MODULE
 * ============================================================================
 *
 * Analyzes trust signals and credibility indicators including:
 * - Security certificates and badges
 * - Professional certifications
 * - Industry awards and recognition
 * - Customer testimonials
 * - Third-party validations
 * - Privacy policy and legal compliance
 *
 * @author Nimrod Galor
 * @version 1.0.0
 */

import { BaseAnalyzer } from '../../core/BaseAnalyzer.js';
import { AnalyzerInterface } from '../../core/AnalyzerInterface.js';

export class TrustSignalAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('TrustSignalAnalyzer');
    
    this.options = {
      enableBadgeDetection: options.enableBadgeDetection !== false,
      enableTestimonialAnalysis: options.enableTestimonialAnalysis !== false,
      enableSecurityAnalysis: options.enableSecurityAnalysis !== false,
      enableCertificationAnalysis: options.enableCertificationAnalysis !== false,
      ...options,
    };

    this.trustIndicators = {
      certifications: [
        'ssl', 'pci', 'iso', 'certified', 'accredited', 'verified',
        'google-certified', 'facebook-certified', 'better-business-bureau',
        'bbb', 'mcafee', 'norton', 'verisign', 'thawte', 'comodo',
        'gdpr', 'hipaa', 'soc', 'cisa', 'cissp'
      ],
      awards: [
        'award', 'winner', 'recognition', 'featured', 'top-rated',
        'best-of', 'excellence', 'achievement', 'industry-leader',
        'entrepreneur', 'inc-5000', 'forbes', 'google-premier',
        'microsoft-partner', 'salesforce-partner'
      ],
      memberships: [
        'member', 'association', 'chamber', 'guild', 'professional',
        'certified-partner', 'authorized-dealer', 'licensed',
        'registered', 'accredited-business', 'trade-association'
      ],
      security: [
        'secure', 'encrypted', 'privacy', 'guarantee', 'warranty',
        'money-back', 'satisfaction-guaranteed', 'secure-checkout',
        'data-protection', 'privacy-policy', 'terms-of-service'
      ],
    };

    this.trustBadgeSelectors = [
      'img[alt*="ssl" i]', 'img[alt*="secure" i]', 'img[alt*="certified" i]',
      'img[alt*="verified" i]', 'img[alt*="badge" i]', 'img[alt*="trust" i]',
      'img[src*="ssl"]', 'img[src*="secure"]', 'img[src*="badge"]',
      '.trust-badge', '.security-badge', '.certification-badge',
      '.ssl-badge', '.verified-badge', '.award-badge'
    ];
  }

  /**
   * Get analyzer metadata for BaseAnalyzer integration
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'Trust Signal Analyzer',
      category: AnalyzerCategories.BUSINESS,
      description: 'Analyzes trust signals and credibility indicators including security badges, certifications, awards, testimonials, and compliance indicators',
      version: '1.0.0',
      author: 'Nimrod Galor',
      tags: ['trust', 'credibility', 'security', 'badges', 'certifications', 'testimonials', 'compliance'],
      capabilities: [
        'trust-badge-detection',
        'security-indicator-analysis',
        'certification-validation',
        'testimonial-analysis',
        'compliance-assessment',
        'third-party-validation'
      ]
    };
  }

  /**
   * Validate input for trust signal analysis
   * @param {Object} context - Analysis context
   * @returns {boolean} Whether input is valid
   */
  validate(context) {
    if (!context || typeof context !== 'object') {
      return this.handleError('Invalid context provided');
    }

    if (!context.document && !context.dom) {
      return this.handleError('No document or DOM provided for trust signal analysis');
    }

    return true;
  }

  /**
   * Enhanced analyze method with BaseAnalyzer integration
   * @param {Object} context - Analysis context containing document, url, etc.
   * @returns {Object} Enhanced analysis results with BaseAnalyzer structure
   */
  async analyze(context) {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!this.validate(context)) {
        return this.createErrorResult('Validation failed');
      }

      // Extract document and URL from context
      const document = context.document || context.dom?.window?.document;
      const url = context.url || '';

      // Perform comprehensive trust signal analysis
      const analysisResult = await this.performTrustSignalAnalysis(document, url);

      // Calculate comprehensive score using BaseAnalyzer integration
      const score = this._calculateComprehensiveScore(analysisResult);

      // Generate optimization recommendations
      const recommendations = this._generateTrustSignalRecommendations(analysisResult);

      // Generate analysis summary
      const summary = this._generateTrustSignalSummary(analysisResult);

      // Return enhanced BaseAnalyzer-compatible result
      return {
        success: true,
        analyzer: 'TrustSignalAnalyzer',
        category: AnalyzerCategories.BUSINESS,
        score: score,
        data: {
          ...analysisResult,
          metadata: {
            analysisTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            version: this.getMetadata().version
          }
        },
        recommendations: recommendations,
        summary: summary,
        errors: [],
        warnings: analysisResult.warnings || []
      };

    } catch (error) {
      return this.handleError(`Trust signal analysis failed: ${error.message}`, {
        analyzer: 'TrustSignalAnalyzer',
        duration: Date.now() - startTime
      });
    }
  }

  /**
   * Perform comprehensive trust signal analysis
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Object} Trust signal analysis results
   */
  async performTrustSignalAnalysis(document, url) {
    const trustSignals = this._findTrustSignals(document);
    const securityIndicators = this._findSecurityIndicators(document, url);
    const professionalCredentials = this._findProfessionalCredentials(document);
    const customerTestimonials = this._findCustomerTestimonials(document);
    const legalCompliance = this._analyzeLegalCompliance(document);
    const thirdPartyValidations = this._findThirdPartyValidations(document);

    const score = this._calculateTrustScore({
      trustSignals,
      securityIndicators,
      professionalCredentials,
      customerTestimonials,
      legalCompliance,
      thirdPartyValidations,
    });

    return {
      trustSignals,
      securityIndicators,
      professionalCredentials,
      customerTestimonials,
      legalCompliance,
      thirdPartyValidations,
      score,
      grade: this._assignGrade(score),
      strengths: this._identifyTrustStrengths({
        trustSignals,
        securityIndicators,
        professionalCredentials,
        customerTestimonials,
        legalCompliance,
        thirdPartyValidations,
      }),
      recommendations: this._generateTrustRecommendations({
        trustSignals,
        securityIndicators,
        professionalCredentials,
        customerTestimonials,
        legalCompliance,
        thirdPartyValidations,
      }),
    };
  }

  /**
   * Find trust signals and badges
   */
  _findTrustSignals(document) {
    const found = {
      certifications: [],
      awards: [],
      memberships: [],
      badges: [],
      totalCount: 0,
    };

    // Search for certification badges and text
    this.trustIndicators.certifications.forEach((cert) => {
      const badgeElements = document.querySelectorAll(
        `img[alt*="${cert}" i], img[title*="${cert}" i], img[src*="${cert}" i]`
      );
      const textMatches = this._findTextMatches(document, cert);

      if (badgeElements.length > 0 || textMatches.length > 0) {
        found.certifications.push({
          type: cert,
          badgeElements: badgeElements.length,
          textMentions: textMatches.length,
          confidence: this._calculateConfidence(badgeElements.length, textMatches.length),
        });
        found.totalCount += badgeElements.length + textMatches.length;
      }
    });

    // Search for awards and recognition
    this.trustIndicators.awards.forEach((award) => {
      const badgeElements = document.querySelectorAll(
        `img[alt*="${award}" i], img[title*="${award}" i], img[src*="${award}" i]`
      );
      const textMatches = this._findTextMatches(document, award);

      if (badgeElements.length > 0 || textMatches.length > 0) {
        found.awards.push({
          type: award,
          badgeElements: badgeElements.length,
          textMentions: textMatches.length,
          confidence: this._calculateConfidence(badgeElements.length, textMatches.length),
        });
        found.totalCount += badgeElements.length + textMatches.length;
      }
    });

    // Search for professional memberships
    this.trustIndicators.memberships.forEach((membership) => {
      const badgeElements = document.querySelectorAll(
        `img[alt*="${membership}" i], img[title*="${membership}" i], img[src*="${membership}" i]`
      );
      const textMatches = this._findTextMatches(document, membership);

      if (badgeElements.length > 0 || textMatches.length > 0) {
        found.memberships.push({
          type: membership,
          badgeElements: badgeElements.length,
          textMentions: textMatches.length,
          confidence: this._calculateConfidence(badgeElements.length, textMatches.length),
        });
        found.totalCount += badgeElements.length + textMatches.length;
      }
    });

    // Find trust badges using selectors
    this.trustBadgeSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        found.badges.push({
          selector,
          alt: element.alt || '',
          src: element.src || '',
          title: element.title || '',
          className: element.className || '',
        });
      });
    });

    return found;
  }

  /**
   * Find security indicators
   */
  _findSecurityIndicators(document, url) {
    const indicators = {
      httpsEnabled: url.startsWith('https://'),
      securityBadges: this._findSecurityBadges(document),
      privacyPolicy: this._hasPrivacyPolicy(document),
      termsOfService: this._hasTermsOfService(document),
      gdprCompliance: this._hasGDPRIndicators(document),
      securityMentions: this._findSecurityMentions(document),
      sslCertificate: this._checkSSLIndicators(document),
      dataProtection: this._checkDataProtectionIndicators(document),
    };

    return {
      ...indicators,
      score: this._calculateSecurityScore(indicators),
    };
  }

  /**
   * Find professional credentials
   */
  _findProfessionalCredentials(document) {
    const credentials = [];
    const textContent = document.body.textContent;

    // Look for professional licenses and certifications
    const credentialPatterns = [
      /licensed?\s+professional/gi,
      /certified\s+\w+/gi,
      /accredited\s+by\s+[\w\s]+/gi,
      /member\s+of\s+[\w\s]+/gi,
      /registered\s+\w+/gi,
      /authorized\s+by\s+[\w\s]+/gi,
      /approved\s+by\s+[\w\s]+/gi,
      /verified\s+by\s+[\w\s]+/gi,
    ];

    credentialPatterns.forEach((pattern) => {
      const matches = textContent.match(pattern);
      if (matches) {
        credentials.push(...matches.map(match => ({
          text: match.trim(),
          type: 'credential',
          confidence: 0.8,
        })));
      }
    });

    // Look for specific professional designations
    const designations = [
      'CPA', 'MD', 'JD', 'PhD', 'MBA', 'PE', 'RN', 'DDS', 'DVM',
      'CISSP', 'PMP', 'CFA', 'FRM', 'CMA', 'CIA', 'CISA', 'CISM'
    ];

    designations.forEach(designation => {
      const regex = new RegExp(`\\b${designation}\\b`, 'gi');
      const matches = textContent.match(regex);
      if (matches) {
        credentials.push(...matches.map(match => ({
          text: match,
          type: 'professional_designation',
          designation,
          confidence: 0.9,
        })));
      }
    });

    return {
      credentials,
      count: credentials.length,
      score: Math.min(credentials.length * 15, 100),
    };
  }

  /**
   * Find customer testimonials
   */
  _findCustomerTestimonials(document) {
    const testimonialSelectors = [
      '.testimonial', '.review', '.customer-review', '.feedback',
      '.quote', '.recommendation', '.client-testimonial',
      '[class*="testimonial"]', '[class*="review"]', '[class*="feedback"]'
    ];

    const testimonials = [];

    testimonialSelectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        const testimonial = {
          text: element.textContent.trim().substring(0, 200),
          hasAuthor: this._hasAuthorInfo(element),
          hasPhoto: this._hasAuthorPhoto(element),
          hasCompany: this._hasCompanyInfo(element),
          hasRating: this._hasRating(element),
          wordCount: element.textContent.trim().split(/\s+/).length,
        };

        testimonial.quality = this._assessTestimonialQuality(testimonial);
        testimonials.push(testimonial);
      });
    });

    return {
      testimonials,
      count: testimonials.length,
      averageQuality: testimonials.length > 0 
        ? testimonials.reduce((sum, t) => sum + t.quality, 0) / testimonials.length 
        : 0,
      score: this._calculateTestimonialScore(testimonials),
    };
  }

  /**
   * Analyze legal compliance indicators
   */
  _analyzeLegalCompliance(document) {
    const compliance = {
      privacyPolicy: this._hasPrivacyPolicy(document),
      termsOfService: this._hasTermsOfService(document),
      cookiePolicy: this._hasCookiePolicy(document),
      gdprCompliance: this._hasGDPRIndicators(document),
      ccpaCompliance: this._hasCCPAIndicators(document),
      copyrightNotice: this._hasCopyrightNotice(document),
      businessRegistration: this._hasBusinessRegistration(document),
      disclaimers: this._hasDisclaimers(document),
    };

    return {
      ...compliance,
      score: this._calculateComplianceScore(compliance),
      complianceCount: Object.values(compliance).filter(Boolean).length,
    };
  }

  /**
   * Find third-party validations
   */
  _findThirdPartyValidations(document) {
    const validations = {
      googleVerified: this._hasGoogleVerification(document),
      facebookVerified: this._hasFacebookVerification(document),
      bbbAccredited: this._hasBBBAccreditation(document),
      trustpilotReviews: this._hasTrustpilotReviews(document),
      yelpReviews: this._hasYelpReviews(document),
      googleReviews: this._hasGoogleReviews(document),
      industryAssociations: this._hasIndustryAssociations(document),
      partnerBadges: this._hasPartnerBadges(document),
    };

    return {
      ...validations,
      score: this._calculateValidationScore(validations),
      validationCount: Object.values(validations).filter(Boolean).length,
    };
  }

  /**
   * Calculate overall trust score
   */
  _calculateTrustScore(analysis) {
    const weights = {
      trustSignals: 0.25,
      securityIndicators: 0.25,
      professionalCredentials: 0.15,
      customerTestimonials: 0.15,
      legalCompliance: 0.15,
      thirdPartyValidations: 0.05,
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([category, weight]) => {
      if (analysis[category] && analysis[category].score !== undefined) {
        totalScore += analysis[category].score * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  // Helper methods
  _findTextMatches(document, searchTerm) {
    const textContent = document.body.textContent.toLowerCase();
    const regex = new RegExp(searchTerm.toLowerCase(), 'gi');
    return textContent.match(regex) || [];
  }

  _calculateConfidence(badgeCount, textCount) {
    const total = badgeCount + textCount;
    if (total === 0) return 0;
    
    // Badge elements are more reliable than text mentions
    const weightedScore = (badgeCount * 0.8) + (textCount * 0.2);
    return Math.min(weightedScore / total, 1.0);
  }

  _findSecurityBadges(document) {
    const securitySelectors = [
      'img[alt*="ssl" i]', 'img[alt*="secure" i]', 'img[alt*="encrypted" i]',
      'img[src*="ssl"]', 'img[src*="secure"]', 'img[src*="mcafee"]',
      'img[src*="norton"]', 'img[src*="verisign"]', 'img[src*="comodo"]'
    ];

    const badges = [];
    securitySelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      badges.push(...Array.from(elements).map(el => ({
        alt: el.alt,
        src: el.src,
        type: 'security_badge'
      })));
    });

    return badges;
  }

  _hasPrivacyPolicy(document) {
    const privacyLinks = document.querySelectorAll('a[href*="privacy" i]');
    const privacyText = /privacy\s+policy/gi.test(document.body.textContent);
    return privacyLinks.length > 0 || privacyText;
  }

  _hasTermsOfService(document) {
    const termsLinks = document.querySelectorAll('a[href*="terms" i]');
    const termsText = /terms\s+(of\s+)?(service|use)/gi.test(document.body.textContent);
    return termsLinks.length > 0 || termsText;
  }

  _hasGDPRIndicators(document) {
    const gdprText = /gdpr|general\s+data\s+protection/gi.test(document.body.textContent);
    const cookieBanner = document.querySelector('.cookie-banner, .gdpr-banner, [class*="cookie"], [class*="gdpr"]');
    return gdprText || !!cookieBanner;
  }

  _findSecurityMentions(document) {
    const securityKeywords = [
      'secure', 'encrypted', 'ssl', 'https', 'data protection',
      'privacy protected', 'secure checkout', 'encrypted transmission'
    ];

    const mentions = [];
    const textContent = document.body.textContent.toLowerCase();

    securityKeywords.forEach(keyword => {
      if (textContent.includes(keyword)) {
        mentions.push(keyword);
      }
    });

    return mentions;
  }

  _checkSSLIndicators(document) {
    const sslMentions = /ssl|secure\s+socket|encrypted\s+connection/gi.test(document.body.textContent);
    const sslBadges = document.querySelectorAll('img[alt*="ssl" i], img[src*="ssl"]');
    
    return {
      mentioned: sslMentions,
      badges: sslBadges.length,
      score: (sslMentions ? 50 : 0) + (sslBadges.length * 25),
    };
  }

  _checkDataProtectionIndicators(document) {
    const dataProtectionKeywords = [
      'data protection', 'privacy policy', 'secure data', 'encrypted data',
      'data security', 'information security', 'personal data protection'
    ];

    const mentions = dataProtectionKeywords.filter(keyword =>
      new RegExp(keyword, 'gi').test(document.body.textContent)
    );

    return {
      mentions,
      count: mentions.length,
      score: Math.min(mentions.length * 20, 100),
    };
  }

  _calculateSecurityScore(indicators) {
    let score = 0;
    
    if (indicators.httpsEnabled) score += 30;
    if (indicators.securityBadges.length > 0) score += 20;
    if (indicators.privacyPolicy) score += 15;
    if (indicators.termsOfService) score += 10;
    if (indicators.gdprCompliance) score += 10;
    if (indicators.securityMentions.length > 0) score += 10;
    if (indicators.sslCertificate.score > 0) score += 5;
    
    return Math.min(score, 100);
  }

  _hasAuthorInfo(element) {
    const authorSelectors = ['.author', '.name', '.customer-name', '[class*="author"]'];
    return authorSelectors.some(selector => element.querySelector(selector));
  }

  _hasAuthorPhoto(element) {
    const photos = element.querySelectorAll('img');
    return photos.length > 0;
  }

  _hasCompanyInfo(element) {
    const companySelectors = ['.company', '.organization', '[class*="company"]'];
    return companySelectors.some(selector => element.querySelector(selector));
  }

  _hasRating(element) {
    const ratingSelectors = ['.rating', '.stars', '.score', '[class*="rating"]', '[class*="star"]'];
    return ratingSelectors.some(selector => element.querySelector(selector));
  }

  _assessTestimonialQuality(testimonial) {
    let quality = 0;
    
    if (testimonial.hasAuthor) quality += 25;
    if (testimonial.hasPhoto) quality += 20;
    if (testimonial.hasCompany) quality += 20;
    if (testimonial.hasRating) quality += 15;
    if (testimonial.wordCount > 20) quality += 10;
    if (testimonial.wordCount > 50) quality += 10;
    
    return quality;
  }

  _calculateTestimonialScore(testimonials) {
    if (testimonials.length === 0) return 0;
    
    const qualityScore = testimonials.reduce((sum, t) => sum + t.quality, 0) / testimonials.length;
    const quantityScore = Math.min(testimonials.length * 10, 50);
    
    return Math.min(qualityScore + quantityScore, 100);
  }

  _hasCookiePolicy(document) {
    const cookieLinks = document.querySelectorAll('a[href*="cookie" i]');
    const cookieText = /cookie\s+policy/gi.test(document.body.textContent);
    return cookieLinks.length > 0 || cookieText;
  }

  _hasCCPAIndicators(document) {
    return /ccpa|california\s+consumer\s+privacy/gi.test(document.body.textContent);
  }

  _hasCopyrightNotice(document) {
    return /copyright|©|\(c\)/gi.test(document.body.textContent);
  }

  _hasBusinessRegistration(document) {
    const registrationKeywords = [
      'registered business', 'business license', 'license number',
      'registration number', 'ein', 'tax id'
    ];
    
    return registrationKeywords.some(keyword =>
      new RegExp(keyword, 'gi').test(document.body.textContent)
    );
  }

  _hasDisclaimers(document) {
    const disclaimerLinks = document.querySelectorAll('a[href*="disclaimer" i]');
    const disclaimerText = /disclaimer/gi.test(document.body.textContent);
    return disclaimerLinks.length > 0 || disclaimerText;
  }

  _calculateComplianceScore(compliance) {
    const weights = {
      privacyPolicy: 20,
      termsOfService: 15,
      cookiePolicy: 10,
      gdprCompliance: 15,
      ccpaCompliance: 10,
      copyrightNotice: 10,
      businessRegistration: 15,
      disclaimers: 5,
    };

    let score = 0;
    Object.entries(weights).forEach(([key, weight]) => {
      if (compliance[key]) score += weight;
    });

    return score;
  }

  _hasGoogleVerification(document) {
    return document.querySelector('meta[name="google-site-verification"]') !== null;
  }

  _hasFacebookVerification(document) {
    return document.querySelector('meta[property="fb:app_id"]') !== null;
  }

  _hasBBBAccreditation(document) {
    const bbbText = /better\s+business\s+bureau|bbb\s+accredited/gi.test(document.body.textContent);
    const bbbBadges = document.querySelectorAll('img[alt*="bbb" i], img[src*="bbb"]');
    return bbbText || bbbBadges.length > 0;
  }

  _hasTrustpilotReviews(document) {
    return document.querySelector('[src*="trustpilot"], [href*="trustpilot"]') !== null;
  }

  _hasYelpReviews(document) {
    return document.querySelector('[src*="yelp"], [href*="yelp"]') !== null;
  }

  _hasGoogleReviews(document) {
    const googleReviewText = /google\s+reviews?/gi.test(document.body.textContent);
    const googleBadges = document.querySelectorAll('img[alt*="google" i][alt*="review" i]');
    return googleReviewText || googleBadges.length > 0;
  }

  _hasIndustryAssociations(document) {
    const associationKeywords = [
      'association', 'member of', 'certified by', 'accredited by',
      'professional organization', 'trade association'
    ];
    
    return associationKeywords.some(keyword =>
      new RegExp(keyword, 'gi').test(document.body.textContent)
    );
  }

  _hasPartnerBadges(document) {
    const partnerKeywords = ['partner', 'authorized', 'certified partner', 'official partner'];
    const partnerBadges = document.querySelectorAll('img[alt*="partner" i], img[src*="partner"]');
    const partnerText = partnerKeywords.some(keyword =>
      new RegExp(keyword, 'gi').test(document.body.textContent)
    );
    
    return partnerBadges.length > 0 || partnerText;
  }

  _calculateValidationScore(validations) {
    const weights = {
      googleVerified: 15,
      facebookVerified: 10,
      bbbAccredited: 20,
      trustpilotReviews: 15,
      yelpReviews: 10,
      googleReviews: 15,
      industryAssociations: 10,
      partnerBadges: 5,
    };

    let score = 0;
    Object.entries(weights).forEach(([key, weight]) => {
      if (validations[key]) score += weight;
    });

    return score;
  }

  _assignGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  _identifyTrustStrengths(analysis) {
    const strengths = [];
    
    if (analysis.trustSignals.totalCount > 5) strengths.push('Multiple trust signals displayed');
    if (analysis.securityIndicators.score > 80) strengths.push('Strong security indicators');
    if (analysis.professionalCredentials.count > 3) strengths.push('Professional credentials clearly stated');
    if (analysis.customerTestimonials.count > 5) strengths.push('Multiple customer testimonials');
    if (analysis.legalCompliance.complianceCount > 5) strengths.push('Good legal compliance');
    if (analysis.thirdPartyValidations.validationCount > 3) strengths.push('Third-party validations present');
    
    return strengths;
  }

  _generateTrustRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.trustSignals.totalCount < 3) {
      recommendations.push({
        category: 'Trust Signals',
        priority: 'high',
        title: 'Add Security and Trust Badges',
        description: 'Display SSL certificates, security badges, and professional certifications prominently.',
        impact: 'high',
      });
    }
    
    if (!analysis.securityIndicators.privacyPolicy) {
      recommendations.push({
        category: 'Legal Compliance',
        priority: 'high',
        title: 'Add Privacy Policy',
        description: 'Create and link to a comprehensive privacy policy page.',
        impact: 'high',
      });
    }
    
    if (analysis.customerTestimonials.count < 3) {
      recommendations.push({
        category: 'Social Proof',
        priority: 'medium',
        title: 'Add Customer Testimonials',
        description: 'Include customer testimonials with photos and company information.',
        impact: 'medium',
      });
    }
    
    if (analysis.professionalCredentials.count === 0) {
      recommendations.push({
        category: 'Credentials',
        priority: 'medium',
        title: 'Display Professional Credentials',
        description: 'Highlight relevant certifications, licenses, and professional memberships.',
        impact: 'medium',
      });
    }
    
    return recommendations;
  }

  // ============================================================================
  // BASEANALYZER INTEGRATION HELPER METHODS
  // ============================================================================

  /**
   * Calculate comprehensive trust signal score for BaseAnalyzer integration
   * @param {Object} analysis - Trust signal analysis results
   * @returns {number} Comprehensive score (0-100)
   */
  _calculateComprehensiveScore(analysis) {
    try {
      const weights = {
        trustBadges: 0.25,        // 25% - Trust badges and security indicators
        credentials: 0.20,        // 20% - Professional credentials and certifications
        testimonials: 0.20,       // 20% - Customer testimonials and social proof
        compliance: 0.15,         // 15% - Legal compliance and privacy
        validation: 0.15,         // 15% - Third-party validations
        security: 0.05           // 5% - Security indicators
      };

      let totalScore = 0;
      let totalWeight = 0;

      // Trust badges score
      if (analysis.trustSignals) {
        const badgeCount = analysis.trustSignals.totalCount || 0;
        let badgeScore = Math.min(badgeCount * 20, 80); // Up to 80 points for badges
        
        // Quality bonus for recognized badges
        const recognizedBadges = analysis.trustSignals.recognized || [];
        if (recognizedBadges.length > 0) {
          badgeScore += Math.min(recognizedBadges.length * 10, 20);
        }
        
        totalScore += Math.min(badgeScore, 100) * weights.trustBadges;
        totalWeight += weights.trustBadges;
      }

      // Professional credentials score
      if (analysis.professionalCredentials) {
        const credentialCount = analysis.professionalCredentials.count || 0;
        const credentialScore = Math.min(credentialCount * 25, 100);
        
        totalScore += credentialScore * weights.credentials;
        totalWeight += weights.credentials;
      }

      // Customer testimonials score
      if (analysis.customerTestimonials) {
        const testimonialCount = analysis.customerTestimonials.count || 0;
        let testimonialScore = Math.min(testimonialCount * 20, 80);
        
        // Quality bonus for testimonials with photos
        const withPhotos = analysis.customerTestimonials.withPhotos || 0;
        if (withPhotos > 0) {
          testimonialScore += Math.min(withPhotos * 10, 20);
        }
        
        totalScore += Math.min(testimonialScore, 100) * weights.testimonials;
        totalWeight += weights.testimonials;
      }

      // Legal compliance score
      if (analysis.legalCompliance) {
        let complianceScore = 0;
        
        if (analysis.legalCompliance.privacyPolicy) complianceScore += 40;
        if (analysis.legalCompliance.termsOfService) complianceScore += 30;
        if (analysis.legalCompliance.cookiePolicy) complianceScore += 20;
        if (analysis.legalCompliance.gdprCompliant) complianceScore += 10;
        
        totalScore += Math.min(complianceScore, 100) * weights.compliance;
        totalWeight += weights.compliance;
      }

      // Third-party validation score
      if (analysis.thirdPartyValidations) {
        const validationCount = analysis.thirdPartyValidations.count || 0;
        const validationScore = Math.min(validationCount * 30, 100);
        
        totalScore += validationScore * weights.validation;
        totalWeight += weights.validation;
      }

      // Security indicators score
      if (analysis.securityIndicators) {
        let securityScore = 0;
        
        if (analysis.securityIndicators.httpsEnabled) securityScore += 50;
        if (analysis.securityIndicators.sslCertificate) securityScore += 30;
        if (analysis.securityIndicators.securePayment) securityScore += 20;
        
        totalScore += Math.min(securityScore, 100) * weights.security;
        totalWeight += weights.security;
      }

      return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    } catch (error) {
      this.log('Error calculating comprehensive score:', error.message);
      return 0;
    }
  }

  /**
   * Generate comprehensive trust signal optimization recommendations
   * @param {Object} analysis - Trust signal analysis results
   * @returns {Array} Enhanced recommendations
   */
  _generateTrustSignalRecommendations(analysis) {
    const recommendations = [];

    try {
      // Trust badges and security indicators
      if (!analysis.trustSignals || analysis.trustSignals.totalCount < 3) {
        recommendations.push({
          category: 'trust-badges',
          priority: 'high',
          title: 'Add Security and Trust Badges',
          description: `Only ${analysis.trustSignals?.totalCount || 0} trust badges detected`,
          impact: 'Customer confidence and conversion rates',
          actionItems: [
            'Display SSL certificate badge prominently',
            'Add recognized security badges (Norton, McAfee, etc.)',
            'Include payment security badges (PCI DSS)',
            'Show industry certifications and accreditations',
            'Add money-back guarantee badges',
            'Display customer satisfaction ratings'
          ]
        });
      }

      // Professional credentials
      if (!analysis.professionalCredentials || analysis.professionalCredentials.count === 0) {
        recommendations.push({
          category: 'credentials',
          priority: 'medium',
          title: 'Display Professional Credentials',
          description: 'No professional credentials or certifications detected',
          impact: 'Professional credibility and authority',
          actionItems: [
            'Highlight relevant industry certifications',
            'Display professional licenses and accreditations',
            'Show membership in professional associations',
            'Include educational credentials of key staff',
            'Add partner certifications (Google, Microsoft, etc.)',
            'Display years of experience and expertise'
          ]
        });
      }

      // Customer testimonials and social proof
      if (!analysis.customerTestimonials || analysis.customerTestimonials.count < 3) {
        recommendations.push({
          category: 'testimonials',
          priority: 'medium',
          title: 'Add Customer Testimonials',
          description: `Only ${analysis.customerTestimonials?.count || 0} customer testimonials found`,
          impact: 'Social proof and purchase confidence',
          actionItems: [
            'Collect testimonials from satisfied customers',
            'Include customer photos and company information',
            'Add specific results and measurable outcomes',
            'Include video testimonials for higher impact',
            'Display customer logos and case studies',
            'Add star ratings and review counts'
          ]
        });
      } else {
        const withPhotos = analysis.customerTestimonials.withPhotos || 0;
        if (withPhotos < analysis.customerTestimonials.count / 2) {
          recommendations.push({
            category: 'testimonials',
            priority: 'low',
            title: 'Enhance Testimonial Credibility',
            description: `${withPhotos} of ${analysis.customerTestimonials.count} testimonials include photos`,
            impact: 'Testimonial authenticity and trust',
            actionItems: [
              'Request customer photos for testimonials',
              'Add company information and titles',
              'Include contact information when possible',
              'Add LinkedIn profiles or verification',
              'Use real names instead of initials'
            ]
          });
        }
      }

      // Legal compliance
      if (!analysis.legalCompliance || !analysis.legalCompliance.privacyPolicy) {
        recommendations.push({
          category: 'legal-compliance',
          priority: 'high',
          title: 'Add Privacy Policy',
          description: 'No privacy policy detected - required for GDPR and legal compliance',
          impact: 'Legal compliance and customer trust',
          actionItems: [
            'Create comprehensive privacy policy',
            'Link privacy policy in footer and forms',
            'Include GDPR compliance statements',
            'Add cookie usage policies',
            'Include data protection information',
            'Ensure legal review and regular updates'
          ]
        });
      }

      if (!analysis.legalCompliance || !analysis.legalCompliance.termsOfService) {
        recommendations.push({
          category: 'legal-compliance',
          priority: 'medium',
          title: 'Add Terms of Service',
          description: 'No terms of service page detected',
          impact: 'Legal protection and business credibility',
          actionItems: [
            'Create detailed terms of service',
            'Include service limitations and warranties',
            'Add dispute resolution procedures',
            'Include intellectual property terms',
            'Link terms from all relevant pages',
            'Ensure legal compliance for your jurisdiction'
          ]
        });
      }

      // Third-party validations
      if (!analysis.thirdPartyValidations || analysis.thirdPartyValidations.count === 0) {
        recommendations.push({
          category: 'third-party-validation',
          priority: 'low',
          title: 'Add Third-Party Validations',
          description: 'No third-party validations or endorsements detected',
          impact: 'External credibility and authority',
          actionItems: [
            'Display industry awards and recognitions',
            'Include press mentions and media coverage',
            'Add customer review platform ratings',
            'Show Better Business Bureau rating',
            'Include Trustpilot or similar ratings',
            'Display partner endorsements'
          ]
        });
      }

      // Security recommendations
      if (analysis.securityIndicators) {
        if (!analysis.securityIndicators.httpsEnabled) {
          recommendations.push({
            category: 'security',
            priority: 'critical',
            title: 'Enable HTTPS',
            description: 'Website is not using HTTPS encryption',
            impact: 'Security, SEO rankings, and browser warnings',
            actionItems: [
              'Install SSL certificate',
              'Redirect all HTTP traffic to HTTPS',
              'Update internal links to use HTTPS',
              'Test all functionality over HTTPS',
              'Update external service configurations'
            ]
          });
        }

        if (!analysis.securityIndicators.sslCertificate) {
          recommendations.push({
            category: 'security',
            priority: 'high',
            title: 'Display SSL Certificate Information',
            description: 'SSL certificate not prominently displayed',
            impact: 'Visible security assurance for customers',
            actionItems: [
              'Add SSL certificate badge to footer',
              'Include certificate details on checkout pages',
              'Display certificate authority information',
              'Show certificate validity dates',
              'Add security seal from certificate provider'
            ]
          });
        }
      }

      return recommendations;
    } catch (error) {
      this.log('Error generating trust signal recommendations:', error.message);
      return [];
    }
  }

  /**
   * Generate comprehensive trust signal analysis summary
   * @param {Object} analysis - Trust signal analysis results
   * @returns {Object} Trust signal summary
   */
  _generateTrustSignalSummary(analysis) {
    try {
      const summary = {
        overallTrustLevel: 'Low',
        trustBadgeCount: 0,
        credentialCount: 0,
        testimonialCount: 0,
        complianceLevel: 'Poor',
        keyStrengths: [],
        keyWeaknesses: []
      };

      // Trust badge assessment
      if (analysis.trustSignals) {
        summary.trustBadgeCount = analysis.trustSignals.totalCount || 0;
        if (summary.trustBadgeCount > 0) {
          summary.keyStrengths.push(`${summary.trustBadgeCount} trust badges displayed`);
        }
      }

      // Credential assessment
      if (analysis.professionalCredentials) {
        summary.credentialCount = analysis.professionalCredentials.count || 0;
        if (summary.credentialCount > 0) {
          summary.keyStrengths.push(`${summary.credentialCount} professional credentials`);
        }
      }

      // Testimonial assessment
      if (analysis.customerTestimonials) {
        summary.testimonialCount = analysis.customerTestimonials.count || 0;
        if (summary.testimonialCount > 0) {
          summary.keyStrengths.push(`${summary.testimonialCount} customer testimonials`);
        }
      }

      // Compliance assessment
      if (analysis.legalCompliance) {
        let complianceItems = 0;
        if (analysis.legalCompliance.privacyPolicy) complianceItems++;
        if (analysis.legalCompliance.termsOfService) complianceItems++;
        if (analysis.legalCompliance.cookiePolicy) complianceItems++;
        if (analysis.legalCompliance.gdprCompliant) complianceItems++;
        
        if (complianceItems >= 3) summary.complianceLevel = 'Excellent';
        else if (complianceItems >= 2) summary.complianceLevel = 'Good';
        else if (complianceItems >= 1) summary.complianceLevel = 'Fair';
        else summary.complianceLevel = 'Poor';
        
        if (complianceItems > 0) {
          summary.keyStrengths.push(`${complianceItems} compliance policies present`);
        }
      }

      // Security assessment
      if (analysis.securityIndicators) {
        if (analysis.securityIndicators.httpsEnabled) {
          summary.keyStrengths.push('HTTPS encryption enabled');
        } else {
          summary.keyWeaknesses.push('No HTTPS encryption');
        }
        
        if (analysis.securityIndicators.sslCertificate) {
          summary.keyStrengths.push('SSL certificate displayed');
        }
      }

      // Overall trust level assessment
      const score = this._calculateComprehensiveScore(analysis);
      if (score >= 80) summary.overallTrustLevel = 'High';
      else if (score >= 60) summary.overallTrustLevel = 'Medium';
      else if (score >= 40) summary.overallTrustLevel = 'Low';
      else summary.overallTrustLevel = 'Very Low';

      // Identify key weaknesses
      if (summary.trustBadgeCount === 0) {
        summary.keyWeaknesses.push('No trust badges detected');
      }
      
      if (summary.credentialCount === 0) {
        summary.keyWeaknesses.push('No professional credentials displayed');
      }
      
      if (summary.testimonialCount === 0) {
        summary.keyWeaknesses.push('No customer testimonials found');
      }
      
      if (summary.complianceLevel === 'Poor') {
        summary.keyWeaknesses.push('Missing legal compliance policies');
      }

      return summary;
    } catch (error) {
      this.log('Error generating trust signal summary:', error.message);
      return {
        overallTrustLevel: 'Unknown',
        trustBadgeCount: 0,
        credentialCount: 0,
        testimonialCount: 0,
        complianceLevel: 'Unknown',
        keyStrengths: [],
        keyWeaknesses: ['Analysis error occurred']
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
  analyzeTrustSignals(document, url) {
    console.warn('TrustSignalAnalyzer.analyzeTrustSignals(document, url) is deprecated. Use analyze(context) method instead.');
    return this.performTrustSignalAnalysis(document, url);
  }
}
