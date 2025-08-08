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

export class TrustSignalAnalyzer {
  constructor(options = {}) {
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
   * Analyze trust signals on the page
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Object} Trust signal analysis results
   */
  analyze(document, url) {
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
}
