/**
 * Social Proof Analyzer
 * Analyzes social proof elements like testimonials, reviews, and trust signals
 * 
 * @extends BaseAnalyzer
 */

import { BaseAnalyzer } from '../core/BaseAnalyzer.js';
import { AnalyzerCategories } from '../core/AnalyzerInterface.js';

export class SocialProofAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('SocialProofAnalyzer');
    
    this.category = AnalyzerCategories.CONTENT;
    this.options = options;
    this.selectors = {
      testimonials: [".testimonial", ".review", ".feedback", ".quote", ".recommendation"],
      ratings: [".rating", ".stars", ".score", ".rating-stars", "[data-rating]"],
      socialCounts: [".social-count", ".followers", ".likes", ".shares", ".subscriber-count"],
      customerLogos: [".customer-logo", ".client-logo", ".partner-logo", ".brand-logo"],
      trustBadges: [".trust-badge", ".security-badge", ".certification", ".award"],
      socialMedia: [".social-links", ".social-icons", ".social-media", "[href*='facebook']", "[href*='twitter']"],
    };
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'SocialProofAnalyzer',
      version: '1.0.0',
      category: AnalyzerCategories.CONTENT,
      description: 'Analyzes social proof elements like testimonials, reviews, and trust signals',
      author: 'Nimrod Galor',
      capabilities: [
        'Testimonial detection and analysis',
        'Rating and review system analysis',
        'Social media metrics evaluation',
        'Trust signal identification',
        'Customer logo and brand analysis',
        'Social proof optimization recommendations'
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
           ((context.dom && context.dom.window && context.dom.window.document) ||
            (context.document));
  }

  /**
   * Analyze social proof elements on a page
   * @param {Object} context - Analysis context containing document, etc.
   * @returns {Object} Social proof analysis results
   */
  async analyze(context) {
    try {
      this.log('Starting social proof analysis');
      
      // Validate context
      if (!this.validate(context)) {
        throw new Error('Invalid context provided for social proof analysis');
      }

      const document = context.document || context.dom?.window?.document;

      const testimonials = this._findTestimonials(document);
      const ratings = this._findRatings(document);
      const socialMetrics = this._findSocialMetrics(document);
      const trustSignals = this._findTrustSignals(document);
      const customerLogos = this._findCustomerLogos(document);
      const socialMedia = this._findSocialMediaPresence(document);

      const score = this._calculateSocialProofScore({
        testimonials,
        ratings,
        socialMetrics,
        trustSignals,
        customerLogos,
        socialMedia,
      });

      const result = {
        testimonials,
        ratings,
        socialMetrics,
        trustSignals,
        customerLogos,
        socialMedia,
        score,
        summary: this._generateSocialProofSummary({
          testimonials,
          ratings,
          socialMetrics,
          trustSignals,
          customerLogos,
          socialMedia,
        }),
        recommendations: this._generateSocialProofRecommendations({
          testimonials,
          ratings,
          socialMetrics,
          trustSignals,
          customerLogos,
          socialMedia,
          score,
          summary: this._calculateSocialProofSummary({
            testimonials,
            ratings,
            socialMetrics,
            trustSignals,
            customerLogos,
            socialMedia,
            score,
          }),
        }),
      };

      // BaseAnalyzer integration: comprehensive scoring and summary
      const comprehensiveScore = this._calculateComprehensiveScore(result);
      const recommendations = this._generateSocialProofOptimizationRecommendations(result);
      const summary = this._generateSocialProofAnalysisSummary(result);
      
      this.log('Social proof analysis completed successfully');
      
      return {
        ...result,
        score: comprehensiveScore,
        recommendations: [...result.recommendations, ...recommendations],
        enhancedSummary: summary,
        metadata: this.getMetadata()
      };
    } catch (error) {
      return this.handleError('Social proof analysis failed', error, {
        testimonials: [],
        ratings: [],
        socialMetrics: [],
        trustSignals: [],
        customerLogos: [],
        socialMedia: [],
        score: 0,
        recommendations: []
      });
    }
  }

  _findTestimonials(document) {
    const testimonials = [];
    
    this.selectors.testimonials.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const testimonial = this._analyzeTestimonial(element);
        if (testimonial.isValid) {
          testimonials.push(testimonial);
        }
      });
    });

    // Also look for structured data testimonials
    const structuredTestimonials = this._findStructuredTestimonials(document);
    testimonials.push(...structuredTestimonials);

    return {
      count: testimonials.length,
      items: testimonials,
      hasTestimonials: testimonials.length > 0,
      quality: this._assessTestimonialQuality(testimonials),
    };
  }

  _analyzeTestimonial(element) {
    const text = element.textContent.trim();
    const hasAuthor = this._hasAuthorInfo(element);
    const hasPhoto = this._hasAuthorPhoto(element);
    const hasCompany = this._hasCompanyInfo(element);
    const hasRating = this._hasTestimonialRating(element);

    return {
      text: text.substring(0, 200), // Truncate for analysis
      fullLength: text.length,
      hasAuthor,
      hasPhoto,
      hasCompany,
      hasRating,
      isValid: text.length >= 20, // Minimum length for valid testimonial
      quality: this._calculateTestimonialQuality({
        text,
        hasAuthor,
        hasPhoto,
        hasCompany,
        hasRating,
      }),
      element: element.outerHTML.substring(0, 300), // Truncated element HTML
    };
  }

  _findStructuredTestimonials(document) {
    const testimonials = [];
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');

    scripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent);
        const reviews = this._extractReviewsFromStructuredData(data);
        testimonials.push(...reviews);
      } catch (e) {
        // Invalid JSON, skip
      }
    });

    return testimonials;
  }

  _findRatings(document) {
    const ratings = [];
    
    this.selectors.ratings.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const rating = this._analyzeRating(element);
        if (rating.isValid) {
          ratings.push(rating);
        }
      });
    });

    // Look for structured data ratings
    const structuredRatings = this._findStructuredRatings(document);
    ratings.push(...structuredRatings);

    return {
      count: ratings.length,
      items: ratings,
      hasRatings: ratings.length > 0,
      averageRating: this._calculateAverageRating(ratings),
      distribution: this._calculateRatingDistribution(ratings),
    };
  }

  _analyzeRating(element) {
    const text = element.textContent.trim();
    const ratingValue = this._extractRatingValue(text, element);
    const maxRating = this._extractMaxRating(text, element);
    const reviewCount = this._extractReviewCount(element);

    return {
      value: ratingValue,
      maxValue: maxRating,
      reviewCount,
      displayText: text,
      isValid: ratingValue !== null,
      percentage: maxRating ? (ratingValue / maxRating) * 100 : null,
      element: element.outerHTML.substring(0, 200),
    };
  }

  _findSocialMetrics(document) {
    const metrics = [];
    
    this.selectors.socialCounts.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const metric = this._analyzeSocialMetric(element);
        if (metric.isValid) {
          metrics.push(metric);
        }
      });
    });

    return {
      count: metrics.length,
      items: metrics,
      hasSocialMetrics: metrics.length > 0,
      totalFollowers: this._calculateTotalFollowers(metrics),
      platforms: this._identifyPlatforms(metrics),
    };
  }

  _findTrustSignals(document) {
    const trustSignals = [];
    
    // Look for trust badges and certifications
    this.selectors.trustBadges.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const signal = this._analyzeTrustSignal(element);
        if (signal.isValid) {
          trustSignals.push(signal);
        }
      });
    });

    // Look for common trust indicators in text
    const textTrustSignals = this._findTextTrustSignals(document);
    trustSignals.push(...textTrustSignals);

    return {
      count: trustSignals.length,
      items: trustSignals,
      hasTrustSignals: trustSignals.length > 0,
      categories: this._categorizeTrustSignals(trustSignals),
    };
  }

  _findCustomerLogos(document) {
    const logos = [];
    
    this.selectors.customerLogos.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const logo = this._analyzeCustomerLogo(element);
        if (logo.isValid) {
          logos.push(logo);
        }
      });
    });

    return {
      count: logos.length,
      items: logos,
      hasCustomerLogos: logos.length > 0,
      quality: this._assessLogoQuality(logos),
    };
  }

  _findSocialMediaPresence(document) {
    const socialLinks = [];
    const platforms = new Set();
    
    // Find social media links
    const allLinks = document.querySelectorAll('a[href]');
    allLinks.forEach(link => {
      const platform = this._identifySocialPlatform(link.href);
      if (platform) {
        platforms.add(platform);
        socialLinks.push({
          platform,
          url: link.href,
          text: link.textContent.trim(),
          element: link.outerHTML.substring(0, 200),
        });
      }
    });

    return {
      count: socialLinks.length,
      items: socialLinks,
      platforms: Array.from(platforms),
      hasSocialPresence: socialLinks.length > 0,
      platformDiversity: platforms.size,
    };
  }

  _hasAuthorInfo(element) {
    const authorSelectors = ['.author', '.name', '.customer-name', '[data-author]'];
    return authorSelectors.some(selector => element.querySelector(selector)) ||
           /[-—]\s*[A-Z][a-z]+\s+[A-Z][a-z]+/.test(element.textContent);
  }

  _hasAuthorPhoto(element) {
    const photos = element.querySelectorAll('img');
    return photos.length > 0 && Array.from(photos).some(img => 
      img.alt && (
        img.alt.toLowerCase().includes('photo') ||
        img.alt.toLowerCase().includes('avatar') ||
        img.alt.toLowerCase().includes('profile')
      )
    );
  }

  _hasCompanyInfo(element) {
    const companySelectors = ['.company', '.organization', '[data-company]'];
    return companySelectors.some(selector => element.querySelector(selector)) ||
           /at\s+[A-Z][a-zA-Z\s&]+(?:Inc|LLC|Corp|Ltd)/.test(element.textContent);
  }

  _hasTestimonialRating(element) {
    return this.selectors.ratings.some(selector => element.querySelector(selector));
  }

  _calculateTestimonialQuality(testimonial) {
    let quality = 0;
    
    if (testimonial.text.length >= 50) quality += 25;
    if (testimonial.hasAuthor) quality += 25;
    if (testimonial.hasPhoto) quality += 20;
    if (testimonial.hasCompany) quality += 20;
    if (testimonial.hasRating) quality += 10;

    return quality;
  }

  _extractRatingValue(text, element) {
    // Try to extract rating from various formats
    const patterns = [
      /(\d+(?:\.\d+)?)\s*(?:\/|\sout\sof|\sof)\s*(\d+)/,
      /(\d+(?:\.\d+)?)\s*stars?/,
      /(\d+(?:\.\d+)?)\s*★/,
      /★{1,5}/,
    ];

    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const match = text.match(pattern);
      if (match) {
        if (i === 3) { // Star pattern index
          return match[0].length; // Count stars
        }
        return parseFloat(match[1]);
      }
    }

    // Try data attributes
    const dataRating = element.getAttribute('data-rating') || 
                      element.getAttribute('data-score');
    if (dataRating) {
      return parseFloat(dataRating);
    }

    return null;
  }

  _extractMaxRating(text, element) {
    const match = text.match(/(\d+(?:\.\d+)?)\s*(?:\/|\sout\sof|\sof)\s*(\d+)/);
    if (match) {
      return parseFloat(match[2]);
    }

    // Default to 5 for star ratings
    if (/stars?|★/.test(text)) {
      return 5;
    }

    return null;
  }

  _extractReviewCount(element) {
    const text = element.textContent;
    const patterns = [
      /(\d+(?:,\d{3})*)\s*reviews?/i,
      /based\s+on\s+(\d+(?:,\d{3})*)/i,
      /\((\d+(?:,\d{3})*)\)/,
    ];

    for (let pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseInt(match[1].replace(/,/g, ''));
      }
    }

    return null;
  }

  _analyzeSocialMetric(element) {
    const text = element.textContent.trim();
    const count = this._extractNumber(text);
    const platform = this._identifyMetricPlatform(element, text);

    return {
      count,
      platform,
      displayText: text,
      isValid: count !== null,
      element: element.outerHTML.substring(0, 200),
    };
  }

  _analyzeTrustSignal(element) {
    const text = element.textContent.trim();
    const type = this._identifyTrustSignalType(element, text);
    const hasImage = element.querySelector('img') !== null;

    return {
      type,
      text,
      hasImage,
      isValid: text.length > 0 || hasImage,
      element: element.outerHTML.substring(0, 200),
    };
  }

  _analyzeCustomerLogo(element) {
    const img = element.querySelector('img');
    const alt = img ? img.alt : '';
    const src = img ? img.src : '';

    return {
      alt,
      src,
      isValid: !!(img && (alt || src)),
      element: element.outerHTML.substring(0, 200),
    };
  }

  _identifySocialPlatform(url) {
    const platforms = {
      'facebook.com': 'facebook',
      'twitter.com': 'twitter',
      'instagram.com': 'instagram',
      'linkedin.com': 'linkedin',
      'youtube.com': 'youtube',
      'pinterest.com': 'pinterest',
      'tiktok.com': 'tiktok',
      'snapchat.com': 'snapchat',
    };

    for (let [domain, platform] of Object.entries(platforms)) {
      if (url.includes(domain)) {
        return platform;
      }
    }

    return null;
  }

  _extractNumber(text) {
    const patterns = [
      /(\d+(?:,\d{3})*(?:\.\d+)?)[KMB]?/i,
      /(\d+(?:\.\d+)?)[KMB]/i,
    ];

    for (let pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let num = parseFloat(match[1].replace(/,/g, ''));
        const suffix = match[0].slice(-1).toLowerCase();
        
        if (suffix === 'k') num *= 1000;
        else if (suffix === 'm') num *= 1000000;
        else if (suffix === 'b') num *= 1000000000;
        
        return num;
      }
    }

    return null;
  }

  _calculateSocialProofScore(data) {
    let score = 0;

    // Testimonials (30%)
    if (data.testimonials.hasTestimonials) {
      score += Math.min(30, data.testimonials.count * 5);
    }

    // Ratings (25%)
    if (data.ratings.hasRatings) {
      score += Math.min(25, data.ratings.count * 8);
    }

    // Social metrics (20%)
    if (data.socialMetrics.hasSocialMetrics) {
      score += Math.min(20, data.socialMetrics.count * 7);
    }

    // Trust signals (15%)
    if (data.trustSignals.hasTrustSignals) {
      score += Math.min(15, data.trustSignals.count * 5);
    }

    // Customer logos (10%)
    if (data.customerLogos.hasCustomerLogos) {
      score += Math.min(10, data.customerLogos.count * 3);
    }

    return Math.min(100, score);
  }

  _generateSocialProofSummary(data) {
    const elements = [];
    
    if (data.testimonials.hasTestimonials) {
      elements.push(`${data.testimonials.count} testimonials`);
    }
    
    if (data.ratings.hasRatings) {
      elements.push(`${data.ratings.count} ratings`);
    }
    
    if (data.socialMetrics.hasSocialMetrics) {
      elements.push(`${data.socialMetrics.count} social metrics`);
    }
    
    if (data.trustSignals.hasTrustSignals) {
      elements.push(`${data.trustSignals.count} trust signals`);
    }

    return {
      totalElements: elements.length,
      summary: elements.join(', '),
      strength: this._assessSocialProofStrength(data),
    };
  }

  _assessSocialProofStrength(data) {
    const totalElements = 
      data.testimonials.count +
      data.ratings.count +
      data.socialMetrics.count +
      data.trustSignals.count +
      data.customerLogos.count;

    if (totalElements >= 10) return 'strong';
    if (totalElements >= 5) return 'moderate';
    if (totalElements >= 2) return 'weak';
    return 'minimal';
  }

  /**
   * Calculate social proof summary including strength assessment
   * @private
   */
  _calculateSocialProofSummary(data) {
    const totalElements = data.testimonials.count + data.ratings.count + 
                         data.socialMetrics.count + data.trustSignals.count + 
                         data.customerLogos.count;
    
    let strength;
    if (totalElements === 0) {
      strength = 'none';
    } else if (totalElements < 3) {
      strength = 'minimal';
    } else if (totalElements < 6) {
      strength = 'moderate';
    } else {
      strength = 'strong';
    }

    return {
      totalElements,
      strength,
      hasTestimonials: data.testimonials.hasTestimonials,
      hasRatings: data.ratings.hasRatings,
      hasSocialMetrics: data.socialMetrics.hasSocialMetrics,
      hasTrustSignals: data.trustSignals.hasTrustSignals,
      hasCustomerLogos: data.customerLogos.hasCustomerLogos,
      overallScore: data.score,
    };
  }

  _generateSocialProofRecommendations(data) {
    const recommendations = [];

    if (!data.testimonials.hasTestimonials) {
      recommendations.push({
        type: 'testimonials',
        priority: 'high',
        title: 'Add Customer Testimonials',
        description: 'Include customer testimonials with photos and company information for better credibility',
        impact: 'trust-building',
      });
    }

    if (!data.ratings.hasRatings) {
      recommendations.push({
        type: 'ratings',
        priority: 'medium',
        title: 'Display Customer Ratings',
        description: 'Show star ratings or review scores to build trust',
        impact: 'credibility',
      });
    }

    if (!data.socialMetrics.hasSocialMetrics) {
      recommendations.push({
        type: 'social-metrics',
        priority: 'medium',
        title: 'Show Social Media Metrics',
        description: 'Display follower counts or social media engagement metrics',
        impact: 'social-proof',
      });
    }

    if (data.summary.strength === 'minimal') {
      recommendations.push({
        type: 'overall',
        priority: 'high',
        title: 'Strengthen Social Proof',
        description: 'Add multiple types of social proof elements to build stronger credibility',
        impact: 'conversion-rate',
      });
    }

    return recommendations;
  }

  // Helper methods for additional functionality
  _extractReviewsFromStructuredData(data) {
    // Implementation for extracting reviews from structured data
    return [];
  }

  _findStructuredRatings(document) {
    // Implementation for finding structured ratings
    return [];
  }

  _calculateAverageRating(ratings) {
    if (ratings.length === 0) return null;
    const sum = ratings.reduce((acc, rating) => acc + (rating.value || 0), 0);
    return sum / ratings.length;
  }

  _calculateRatingDistribution(ratings) {
    // Implementation for rating distribution
    return {};
  }

  _calculateTotalFollowers(metrics) {
    return metrics.reduce((total, metric) => total + (metric.count || 0), 0);
  }

  _identifyPlatforms(metrics) {
    return [...new Set(metrics.map(m => m.platform).filter(Boolean))];
  }

  _findTextTrustSignals(document) {
    // Implementation for finding trust signals in text
    return [];
  }

  _categorizeTrustSignals(signals) {
    // Implementation for categorizing trust signals
    return {};
  }

  _assessTestimonialQuality(testimonials) {
    if (testimonials.length === 0) return 0;
    const avgQuality = testimonials.reduce((sum, t) => sum + t.quality, 0) / testimonials.length;
    return Math.round(avgQuality);
  }

  _assessLogoQuality(logos) {
    // Implementation for assessing logo quality
    return logos.length > 0 ? 75 : 0;
  }

  _identifyMetricPlatform(element, text) {
    // Implementation for identifying social platform from metric
    return 'unknown';
  }

  _identifyTrustSignalType(element, text) {
    // Implementation for identifying trust signal type
    return 'generic';
  }

  /**
   * Calculate comprehensive social proof score for BaseAnalyzer integration
   * @param {Object} analysis - Social proof analysis results
   * @returns {number} Comprehensive score (0-100)
   */
  _calculateComprehensiveScore(analysis) {
    try {
      const weights = {
        testimonials: 0.25,     // 25% - Customer testimonials
        ratings: 0.20,          // 20% - Rating systems
        socialMetrics: 0.20,    // 20% - Social media metrics
        trustSignals: 0.15,     // 15% - Trust badges and signals
        customerLogos: 0.10,    // 10% - Customer/partner logos
        socialMedia: 0.10       // 10% - Social media presence
      };

      let totalScore = 0;
      let totalWeight = 0;

      // Testimonials score
      if (analysis.testimonials) {
        const testimonialCount = analysis.testimonials.length;
        let testimonialScore = Math.min(testimonialCount * 20, 80); // Up to 80 points for testimonials
        
        // Quality bonus
        const highQualityTestimonials = analysis.testimonials.filter(t => t.quality > 70);
        if (highQualityTestimonials.length > 0) {
          testimonialScore += Math.min(highQualityTestimonials.length * 5, 20);
        }
        
        totalScore += Math.min(testimonialScore, 100) * weights.testimonials;
        totalWeight += weights.testimonials;
      }

      // Ratings score
      if (analysis.ratings) {
        const ratingsCount = analysis.ratings.length;
        let ratingsScore = Math.min(ratingsCount * 25, 75);
        
        // Average rating bonus
        const avgRating = this._calculateAverageRating(analysis.ratings);
        if (avgRating && avgRating >= 4.0) ratingsScore += 25;
        else if (avgRating && avgRating >= 3.5) ratingsScore += 15;
        
        totalScore += Math.min(ratingsScore, 100) * weights.ratings;
        totalWeight += weights.ratings;
      }

      // Social metrics score
      if (analysis.socialMetrics) {
        const metricsCount = analysis.socialMetrics.length;
        const socialScore = Math.min(metricsCount * 30, 100);
        totalScore += socialScore * weights.socialMetrics;
        totalWeight += weights.socialMetrics;
      }

      // Trust signals score
      if (analysis.trustSignals) {
        const trustCount = analysis.trustSignals.length;
        const trustScore = Math.min(trustCount * 25, 100);
        totalScore += trustScore * weights.trustSignals;
        totalWeight += weights.trustSignals;
      }

      // Customer logos score
      if (analysis.customerLogos) {
        const logoCount = analysis.customerLogos.length;
        const logoScore = Math.min(logoCount * 20, 100);
        totalScore += logoScore * weights.customerLogos;
        totalWeight += weights.customerLogos;
      }

      // Social media presence score
      if (analysis.socialMedia) {
        const socialCount = analysis.socialMedia.length;
        const socialScore = Math.min(socialCount * 20, 100);
        totalScore += socialScore * weights.socialMedia;
        totalWeight += weights.socialMedia;
      }

      return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    } catch (error) {
      this.log('Error calculating comprehensive score:', error.message);
      return 0;
    }
  }

  /**
   * Generate comprehensive social proof optimization recommendations
   * @param {Object} analysis - Social proof analysis results
   * @returns {Array} Enhanced recommendations
   */
  _generateSocialProofOptimizationRecommendations(analysis) {
    const recommendations = [];

    try {
      // Testimonial recommendations
      if (!analysis.testimonials || analysis.testimonials.length < 3) {
        recommendations.push({
          category: 'testimonials',
          priority: 'high',
          title: 'Add Customer Testimonials',
          description: `Only ${analysis.testimonials?.length || 0} testimonials found`,
          impact: 'Customer trust and conversion rates',
          actionItems: [
            'Collect testimonials from satisfied customers',
            'Include author photos and company information',
            'Display testimonials prominently on key pages',
            'Use video testimonials for higher impact',
            'Add specific details and measurable results',
            'Rotate testimonials to show variety'
          ]
        });
      } else {
        const lowQualityTestimonials = analysis.testimonials.filter(t => t.quality < 60);
        if (lowQualityTestimonials.length > 0) {
          recommendations.push({
            category: 'testimonials',
            priority: 'medium',
            title: 'Improve Testimonial Quality',
            description: `${lowQualityTestimonials.length} low-quality testimonials detected`,
            impact: 'Testimonial credibility and effectiveness',
            actionItems: [
              'Add author photos to testimonials',
              'Include company/position information',
              'Request more specific and detailed testimonials',
              'Add verifiable contact information',
              'Include measurable results and outcomes'
            ]
          });
        }
      }

      // Rating system recommendations
      if (!analysis.ratings || analysis.ratings.length === 0) {
        recommendations.push({
          category: 'ratings',
          priority: 'medium',
          title: 'Implement Rating System',
          description: 'No rating system detected',
          impact: 'Social proof and purchase decisions',
          actionItems: [
            'Add star rating system to products/services',
            'Display average ratings prominently',
            'Show total number of reviews',
            'Implement structured data for ratings',
            'Encourage customers to leave ratings',
            'Respond to ratings and reviews professionally'
          ]
        });
      } else {
        const avgRating = this._calculateAverageRating(analysis.ratings);
        if (avgRating && avgRating < 4.0) {
          recommendations.push({
            category: 'ratings',
            priority: 'high',
            title: 'Improve Average Rating',
            description: `Average rating is ${avgRating.toFixed(1)}/5`,
            impact: 'Customer perception and conversion rates',
            actionItems: [
              'Address customer concerns from negative reviews',
              'Improve product/service quality',
              'Follow up with customers for feedback',
              'Implement quality improvement processes',
              'Train staff on customer service excellence'
            ]
          });
        }
      }

      // Social media metrics recommendations
      if (!analysis.socialMetrics || analysis.socialMetrics.length < 2) {
        recommendations.push({
          category: 'social-metrics',
          priority: 'medium',
          title: 'Display Social Media Metrics',
          description: 'Limited social media metrics shown',
          impact: 'Social validation and brand credibility',
          actionItems: [
            'Display follower counts from major platforms',
            'Show social media engagement metrics',
            'Add real-time social feeds',
            'Include social sharing buttons with counts',
            'Highlight social media achievements',
            'Update metrics regularly for accuracy'
          ]
        });
      }

      // Trust signals recommendations
      if (!analysis.trustSignals || analysis.trustSignals.length < 2) {
        recommendations.push({
          category: 'trust-signals',
          priority: 'medium',
          title: 'Add Trust Signals',
          description: `Only ${analysis.trustSignals?.length || 0} trust signals found`,
          impact: 'Customer confidence and security perception',
          actionItems: [
            'Add security badges and certifications',
            'Display industry awards and recognitions',
            'Include professional association memberships',
            'Show guarantees and warranty information',
            'Add customer support contact information',
            'Display business credentials and licenses'
          ]
        });
      }

      // Customer logos recommendations
      if (!analysis.customerLogos || analysis.customerLogos.length === 0) {
        recommendations.push({
          category: 'customer-logos',
          priority: 'low',
          title: 'Add Customer/Partner Logos',
          description: 'No customer or partner logos displayed',
          impact: 'Brand association and credibility',
          actionItems: [
            'Create a client/partner logo section',
            'Obtain permission to display customer logos',
            'Organize logos in attractive grid layout',
            'Include brief case studies or success stories',
            'Update logo section regularly',
            'Link logos to detailed case studies where appropriate'
          ]
        });
      }

      return recommendations;
    } catch (error) {
      this.log('Error generating social proof optimization recommendations:', error.message);
      return [];
    }
  }

  /**
   * Generate comprehensive social proof analysis summary
   * @param {Object} analysis - Social proof analysis results
   * @returns {Object} Social proof summary
   */
  _generateSocialProofAnalysisSummary(analysis) {
    try {
      const summary = {
        overallStrength: 'Weak',
        testimonialCount: 0,
        averageRating: null,
        socialProofTypes: [],
        trustLevel: 'Low',
        keyFindings: []
      };

      // Count testimonials
      if (analysis.testimonials) {
        summary.testimonialCount = analysis.testimonials.length;
        if (summary.testimonialCount > 0) {
          summary.socialProofTypes.push('testimonials');
          summary.keyFindings.push(`${summary.testimonialCount} customer testimonials found`);
        }
      }

      // Calculate average rating
      if (analysis.ratings && analysis.ratings.length > 0) {
        summary.averageRating = this._calculateAverageRating(analysis.ratings);
        summary.socialProofTypes.push('ratings');
        summary.keyFindings.push(`Average rating: ${summary.averageRating?.toFixed(1) || 'N/A'}/5`);
      }

      // Check other social proof types
      if (analysis.socialMetrics && analysis.socialMetrics.length > 0) {
        summary.socialProofTypes.push('social-metrics');
        summary.keyFindings.push(`${analysis.socialMetrics.length} social media metrics displayed`);
      }

      if (analysis.trustSignals && analysis.trustSignals.length > 0) {
        summary.socialProofTypes.push('trust-signals');
        summary.keyFindings.push(`${analysis.trustSignals.length} trust signals present`);
      }

      if (analysis.customerLogos && analysis.customerLogos.length > 0) {
        summary.socialProofTypes.push('customer-logos');
        summary.keyFindings.push(`${analysis.customerLogos.length} customer/partner logos shown`);
      }

      // Determine overall strength
      const score = this._calculateComprehensiveScore(analysis);
      if (score >= 80) summary.overallStrength = 'Strong';
      else if (score >= 60) summary.overallStrength = 'Moderate';
      else if (score >= 40) summary.overallStrength = 'Weak';
      else summary.overallStrength = 'Very Weak';

      // Determine trust level
      if (summary.socialProofTypes.length >= 4) summary.trustLevel = 'High';
      else if (summary.socialProofTypes.length >= 2) summary.trustLevel = 'Medium';
      else summary.trustLevel = 'Low';

      // Additional findings
      if (summary.socialProofTypes.length === 0) {
        summary.keyFindings.push('No social proof elements detected');
      }

      return summary;
    } catch (error) {
      this.log('Error generating social proof analysis summary:', error.message);
      return {
        overallStrength: 'Unknown',
        testimonialCount: 0,
        averageRating: null,
        socialProofTypes: [],
        trustLevel: 'Unknown',
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
  analyze(document) {
    console.warn('SocialProofAnalyzer.analyze(document) is deprecated. Use analyze(context) method instead.');
    return this.analyze({ document });
  }
}
