/**
 * ============================================================================
 * SOCIAL PROOF DETECTOR - GPT-5 STYLE MODULAR COMPONENT
 * ============================================================================
 * 
 * Advanced social proof elements detection and credibility analysis
 * Part of the Combined Approach Social Media Analyzer (10th Implementation)
 * 
 * Features:
 * - Testimonials and reviews detection
 * - Social signals and endorsements analysis
 * - Trust indicators and certifications
 * - User-generated content identification
 * - Social media mentions and feeds
 * - Community and engagement proof
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration Combined Approach Pattern - GPT-5 Style Detector
 */

export class SocialProofDetector {
  constructor(config = {}) {
    this.config = {
      enableTestimonialDetection: config.enableTestimonialDetection !== false,
      enableReviewAnalysis: config.enableReviewAnalysis !== false,
      enableSocialSignals: config.enableSocialSignals !== false,
      enableTrustIndicators: config.enableTrustIndicators !== false,
      enableUGCDetection: config.enableUGCDetection !== false,
      enableCommunityProof: config.enableCommunityProof !== false,
      reviewPlatforms: {
        google: config.reviewPlatforms?.google !== false,
        yelp: config.reviewPlatforms?.yelp !== false,
        facebook: config.reviewPlatforms?.facebook !== false,
        trustpilot: config.reviewPlatforms?.trustpilot !== false,
        ...config.reviewPlatforms
      },
      minReviewScore: config.minReviewScore || 4.0,
      minTestimonials: config.minTestimonials || 3,
      ...config
    };

    this.version = '1.0.0';
    this.detectorType = 'social_proof';
    
    // Social proof patterns and indicators
    this.socialProofPatterns = {
      testimonials: {
        selectors: [
          '.testimonial', '.review', '.customer-review',
          '.user-review', '.feedback', '.quote',
          '[class*="testimonial"]', '[class*="review"]',
          'blockquote', '.customer-story'
        ],
        indicators: [
          'testimonial', 'review', 'customer', 'client',
          'user says', 'feedback', 'experience',
          'recommendation', 'endorsement'
        ]
      },
      reviews: {
        selectors: [
          '.rating', '.stars', '.score', '.review-score',
          '[class*="rating"]', '[class*="star"]',
          '.review-count', '.review-average'
        ],
        platforms: {
          google: ['google', 'g-review', 'google-review'],
          yelp: ['yelp', 'yelp-review'],
          facebook: ['facebook', 'fb-review'],
          trustpilot: ['trustpilot', 'tp-review']
        }
      },
      socialSignals: {
        followerCounts: ['.followers', '.fans', '.subscribers', '[class*="follow"]'],
        socialFeeds: ['.social-feed', '.twitter-feed', '.instagram-feed'],
        mentions: ['.mention', '.feature', '.press', '.media-mention']
      },
      trustIndicators: {
        certifications: ['.certification', '.badge', '.award', '.seal'],
        security: ['.ssl', '.secure', '.verified', '.trusted'],
        guarantees: ['.guarantee', '.warranty', '.promise']
      },
      ugc: {
        selectors: [
          '.user-content', '.customer-photo', '.user-photo',
          '.gallery', '.customer-gallery', '.user-gallery',
          '.hashtag', '.social-wall'
        ]
      }
    };

    this.cache = new Map();
  }

  /**
   * Get detector metadata
   * @returns {Object} Detector metadata
   */
  getMetadata() {
    return {
      name: 'SocialProofDetector',
      version: this.version,
      type: this.detectorType,
      description: 'Detects and analyzes social proof elements and credibility indicators',
      capabilities: [
        'testimonial_detection',
        'review_analysis',
        'social_signals_assessment',
        'trust_indicators_identification',
        'user_generated_content_detection',
        'community_proof_analysis'
      ],
      reviewPlatforms: Object.keys(this.config.reviewPlatforms).filter(p => this.config.reviewPlatforms[p]),
      performance: 'High',
      accuracy: 'GPT-5 Enhanced'
    };
  }

  /**
   * Detect social proof elements
   * @param {Object} context - Analysis context containing document and metadata
   * @returns {Promise<Object>} Social proof detection results
   */
  async detect(context) {
    try {
      const { document, url, pageData } = context;
      
      if (!document) {
        throw new Error('Document is required for social proof analysis');
      }

      // Check cache
      const cacheKey = this._generateCacheKey(url);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const startTime = Date.now();

      // Phase 1: Testimonials detection and analysis
      const testimonialsAnalysis = this._analyzeTestimonials(document);

      // Phase 2: Reviews and ratings analysis
      const reviewsAnalysis = this._analyzeReviews(document);

      // Phase 3: Social signals analysis
      const socialSignalsAnalysis = this._analyzeSocialSignals(document);

      // Phase 4: Trust indicators analysis
      const trustIndicatorsAnalysis = this._analyzeTrustIndicators(document);

      // Phase 5: User-generated content analysis
      const ugcAnalysis = this._analyzeUserGeneratedContent(document);

      // Phase 6: Community proof analysis
      const communityAnalysis = this._analyzeCommunityProof(document);

      // Calculate overall social proof score
      const overallScore = this._calculateSocialProofScore({
        testimonials: testimonialsAnalysis,
        reviews: reviewsAnalysis,
        socialSignals: socialSignalsAnalysis,
        trustIndicators: trustIndicatorsAnalysis,
        ugc: ugcAnalysis,
        community: communityAnalysis
      });

      // Compile comprehensive results
      const results = {
        success: true,
        detectorType: this.detectorType,
        
        // Core analysis results
        testimonials: testimonialsAnalysis,
        reviews: reviewsAnalysis,
        socialSignals: socialSignalsAnalysis,
        trustIndicators: trustIndicatorsAnalysis,
        ugc: ugcAnalysis,
        community: communityAnalysis,
        
        // Overall assessment
        score: overallScore.score,
        grade: overallScore.grade,
        level: overallScore.level,
        credibilityLevel: this._assessCredibilityLevel(overallScore.score),
        socialProofStrength: overallScore.score >= 75 ? 'strong' : overallScore.score >= 50 ? 'moderate' : 'weak',
        
        // Strategic insights
        insights: this._generateSocialProofInsights({
          testimonials: testimonialsAnalysis,
          reviews: reviewsAnalysis,
          socialSignals: socialSignalsAnalysis,
          trustIndicators: trustIndicatorsAnalysis,
          ugc: ugcAnalysis,
          community: communityAnalysis
        }),
        
        recommendations: this._generateSocialProofRecommendations({
          testimonials: testimonialsAnalysis,
          reviews: reviewsAnalysis,
          socialSignals: socialSignalsAnalysis,
          trustIndicators: trustIndicatorsAnalysis,
          ugc: ugcAnalysis,
          community: communityAnalysis
        }),
        
        // Performance metrics
        performance: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          cacheUsed: false
        }
      };

      // Cache results
      this.cache.set(cacheKey, results);

      return results;

    } catch (error) {
      return {
        success: false,
        error: `Social proof detection failed: ${error.message}`,
        detectorType: this.detectorType
      };
    }
  }

  /**
   * Analyze testimonials and customer feedback
   * @param {Document} document - DOM document
   * @returns {Object} Testimonials analysis results
   */
  _analyzeTestimonials(document) {
    const analysis = {
      present: false,
      count: 0,
      testimonials: [],
      quality: {},
      diversity: {},
      authenticity: {},
      placement: {},
      issues: [],
      recommendations: []
    };

    try {
      // Find testimonial elements
      const testimonialSelectors = this.socialProofPatterns.testimonials.selectors.join(', ');
      const testimonialElements = document.querySelectorAll(testimonialSelectors);
      
      analysis.count = testimonialElements.length;
      analysis.present = analysis.count > 0;

      if (!analysis.present) {
        analysis.issues.push('No testimonials found on the page');
        analysis.recommendations.push('Add customer testimonials to build trust and credibility');
        return { ...analysis, score: 0, grade: 'F' };
      }

      // Analyze individual testimonials
      testimonialElements.forEach((element, index) => {
        const testimonial = this._analyzeTestimonial(element, index);
        analysis.testimonials.push(testimonial);
      });

      // Analyze testimonial quality
      analysis.quality = this._analyzeTestimonialQuality(analysis.testimonials);

      // Analyze testimonial diversity
      analysis.diversity = this._analyzeTestimonialDiversity(analysis.testimonials);

      // Analyze testimonial authenticity
      analysis.authenticity = this._analyzeTestimonialAuthenticity(analysis.testimonials);

      // Analyze testimonial placement
      analysis.placement = this._analyzeTestimonialPlacement(testimonialElements, document);

      // Generate recommendations based on analysis
      if (analysis.count < this.config.minTestimonials) {
        analysis.issues.push(`Only ${analysis.count} testimonials found (recommended: ${this.config.minTestimonials}+)`);
        analysis.recommendations.push('Add more customer testimonials for stronger social proof');
      }

      if (analysis.quality.averageLength < 50) {
        analysis.issues.push('Testimonials are too short to be impactful');
        analysis.recommendations.push('Include longer, more detailed testimonials');
      }

      if (!analysis.authenticity.hasPhotos) {
        analysis.recommendations.push('Add customer photos to testimonials for authenticity');
      }

      if (!analysis.authenticity.hasNames) {
        analysis.issues.push('Anonymous testimonials reduce credibility');
        analysis.recommendations.push('Include customer names with testimonials');
      }

      // Calculate testimonials score
      const score = this._calculateTestimonialsScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze reviews and ratings
   * @param {Document} document - DOM document
   * @returns {Object} Reviews analysis results
   */
  _analyzeReviews(document) {
    const analysis = {
      present: false,
      ratings: {},
      platforms: {},
      aggregateScore: null,
      reviewCount: 0,
      distribution: {},
      issues: [],
      recommendations: []
    };

    try {
      // Find rating elements
      const ratingSelectors = this.socialProofPatterns.reviews.selectors.join(', ');
      const ratingElements = document.querySelectorAll(ratingSelectors);
      
      analysis.present = ratingElements.length > 0;

      if (!analysis.present) {
        analysis.issues.push('No review ratings found on the page');
        analysis.recommendations.push('Display customer review ratings and scores');
        return { ...analysis, score: 0, grade: 'F' };
      }

      // Analyze rating elements
      ratingElements.forEach(element => {
        const rating = this._extractRating(element);
        if (rating) {
          if (!analysis.ratings[rating.platform]) {
            analysis.ratings[rating.platform] = [];
          }
          analysis.ratings[rating.platform].push(rating);
        }
      });

      // Analyze platform-specific reviews
      Object.entries(this.socialProofPatterns.reviews.platforms).forEach(([platform, indicators]) => {
        const platformElements = this._findPlatformReviews(document, indicators);
        if (platformElements.length > 0) {
          analysis.platforms[platform] = {
            present: true,
            elements: platformElements.length,
            data: this._extractPlatformData(platformElements, platform)
          };
        }
      });

      // Calculate aggregate metrics
      const allRatings = Object.values(analysis.ratings).flat();
      if (allRatings.length > 0) {
        analysis.aggregateScore = this._calculateAggregateScore(allRatings);
        analysis.reviewCount = allRatings.reduce((sum, rating) => sum + (rating.count || 1), 0);
      }

      // Analyze review distribution
      analysis.distribution = this._analyzeReviewDistribution(allRatings);

      // Generate recommendations
      if (analysis.aggregateScore && analysis.aggregateScore < this.config.minReviewScore) {
        analysis.issues.push(`Low review score: ${analysis.aggregateScore.toFixed(1)}`);
        analysis.recommendations.push('Focus on improving customer satisfaction and reviews');
      }

      if (analysis.reviewCount < 10) {
        analysis.recommendations.push('Encourage more customers to leave reviews');
      }

      const platformCount = Object.keys(analysis.platforms).length;
      if (platformCount < 2) {
        analysis.recommendations.push('Display reviews from multiple platforms for credibility');
      }

      // Calculate reviews score
      const score = this._calculateReviewsScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze social signals and engagement indicators
   * @param {Document} document - DOM document
   * @returns {Object} Social signals analysis results
   */
  _analyzeSocialSignals(document) {
    const analysis = {
      present: false,
      followerCounts: {},
      socialFeeds: {},
      mentions: {},
      engagement: {},
      recommendations: []
    };

    try {
      // Analyze follower counts
      analysis.followerCounts = this._analyzeFollowerCounts(document);

      // Analyze social feeds
      analysis.socialFeeds = this._analyzeSocialFeeds(document);

      // Analyze media mentions
      analysis.mentions = this._analyzeMediaMentions(document);

      // Analyze engagement indicators
      analysis.engagement = this._analyzeEngagementIndicators(document);

      analysis.present = analysis.followerCounts.present || 
                        analysis.socialFeeds.present || 
                        analysis.mentions.present ||
                        analysis.engagement.present;

      // Generate recommendations
      if (!analysis.followerCounts.present) {
        analysis.recommendations.push('Display social media follower counts as social proof');
      }

      if (!analysis.socialFeeds.present) {
        analysis.recommendations.push('Embed social media feeds to show active engagement');
      }

      if (!analysis.mentions.present) {
        analysis.recommendations.push('Showcase media mentions and press coverage');
      }

      // Calculate social signals score
      const score = this._calculateSocialSignalsScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze trust indicators and certifications
   * @param {Document} document - DOM document
   * @returns {Object} Trust indicators analysis results
   */
  _analyzeTrustIndicators(document) {
    const analysis = {
      present: false,
      certifications: {},
      security: {},
      guarantees: {},
      badges: {},
      recommendations: []
    };

    try {
      // Analyze certifications and awards
      analysis.certifications = this._analyzeCertifications(document);

      // Analyze security indicators
      analysis.security = this._analyzeSecurityIndicators(document);

      // Analyze guarantees and warranties
      analysis.guarantees = this._analyzeGuarantees(document);

      // Analyze trust badges
      analysis.badges = this._analyzeTrustBadges(document);

      analysis.present = analysis.certifications.present || 
                        analysis.security.present || 
                        analysis.guarantees.present ||
                        analysis.badges.present;

      // Generate recommendations
      if (!analysis.security.present) {
        analysis.recommendations.push('Display security certificates and SSL indicators');
      }

      if (!analysis.guarantees.present) {
        analysis.recommendations.push('Add money-back guarantees or warranties');
      }

      if (!analysis.badges.present) {
        analysis.recommendations.push('Display relevant trust badges and certifications');
      }

      // Calculate trust indicators score
      const score = this._calculateTrustIndicatorsScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze user-generated content
   * @param {Document} document - DOM document
   * @returns {Object} UGC analysis results
   */
  _analyzeUserGeneratedContent(document) {
    const analysis = {
      present: false,
      photos: {},
      galleries: {},
      hashtags: {},
      socialWalls: {},
      recommendations: []
    };

    try {
      // Analyze user photos and galleries
      analysis.photos = this._analyzeUserPhotos(document);

      // Analyze photo galleries
      analysis.galleries = this._analyzePhotoGalleries(document);

      // Analyze hashtag usage
      analysis.hashtags = this._analyzeHashtags(document);

      // Analyze social walls
      analysis.socialWalls = this._analyzeSocialWalls(document);

      analysis.present = analysis.photos.present || 
                        analysis.galleries.present || 
                        analysis.hashtags.present ||
                        analysis.socialWalls.present;

      // Generate recommendations
      if (!analysis.photos.present) {
        analysis.recommendations.push('Encourage customers to share photos of your products');
      }

      if (!analysis.hashtags.present) {
        analysis.recommendations.push('Create branded hashtags to collect user content');
      }

      if (!analysis.socialWalls.present) {
        analysis.recommendations.push('Display a social media wall with customer posts');
      }

      // Calculate UGC score
      const score = this._calculateUGCScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze community proof and engagement
   * @param {Document} document - DOM document
   * @returns {Object} Community analysis results
   */
  _analyzeCommunityProof(document) {
    const analysis = {
      present: false,
      memberCount: {},
      activity: {},
      forums: {},
      groups: {},
      recommendations: []
    };

    try {
      // Analyze member counts
      analysis.memberCount = this._analyzeMemberCounts(document);

      // Analyze community activity
      analysis.activity = this._analyzeCommunityActivity(document);

      // Analyze forums and discussions
      analysis.forums = this._analyzeForums(document);

      // Analyze community groups
      analysis.groups = this._analyzeCommunityGroups(document);

      analysis.present = analysis.memberCount.present || 
                        analysis.activity.present || 
                        analysis.forums.present ||
                        analysis.groups.present;

      // Generate recommendations
      if (!analysis.memberCount.present) {
        analysis.recommendations.push('Display community member counts');
      }

      if (!analysis.activity.present) {
        analysis.recommendations.push('Show recent community activity and engagement');
      }

      // Calculate community proof score
      const score = this._calculateCommunityScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  _analyzeTestimonial(element, index) {
    const testimonial = {
      id: `testimonial_${index}`,
      text: this._extractText(element),
      author: this._extractAuthor(element),
      hasPhoto: this._hasAuthorPhoto(element),
      hasTitle: this._hasAuthorTitle(element),
      hasCompany: this._hasAuthorCompany(element),
      placement: this._getElementPlacement(element),
      length: 0,
      authenticity: 0
    };

    testimonial.length = testimonial.text ? testimonial.text.length : 0;
    testimonial.authenticity = this._calculateTestimonialAuthenticity(testimonial);

    return testimonial;
  }

  _extractText(element) {
    // Remove author information and extract main testimonial text
    const clone = element.cloneNode(true);
    const authorElements = clone.querySelectorAll('.author, .name, .title, .company');
    authorElements.forEach(el => el.remove());
    
    return clone.textContent?.trim() || '';
  }

  _extractAuthor(element) {
    const authorSelectors = [
      '.author', '.name', '.customer-name',
      '.testimonial-author', '.review-author'
    ];
    
    for (const selector of authorSelectors) {
      const authorElement = element.querySelector(selector);
      if (authorElement) {
        return authorElement.textContent?.trim() || '';
      }
    }
    
    return '';
  }

  _hasAuthorPhoto(element) {
    return !!(element.querySelector('img, .photo, .avatar, .picture'));
  }

  _hasAuthorTitle(element) {
    const titleSelectors = ['.title', '.position', '.job-title'];
    return titleSelectors.some(selector => element.querySelector(selector));
  }

  _hasAuthorCompany(element) {
    const companySelectors = ['.company', '.organization', '.business'];
    return companySelectors.some(selector => element.querySelector(selector));
  }

  _getElementPlacement(element) {
    // Simplified placement detection
    const rect = element.getBoundingClientRect ? element.getBoundingClientRect() : {};
    if (rect.top < window.innerHeight) return 'above-fold';
    return 'below-fold';
  }

  _calculateTestimonialAuthenticity(testimonial) {
    let score = 50; // Base score

    if (testimonial.author) score += 20;
    if (testimonial.hasPhoto) score += 15;
    if (testimonial.hasTitle) score += 10;
    if (testimonial.hasCompany) score += 5;

    return Math.min(100, score);
  }

  _analyzeTestimonialQuality(testimonials) {
    const lengths = testimonials.map(t => t.length).filter(l => l > 0);
    const authenticity = testimonials.map(t => t.authenticity);

    return {
      averageLength: lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0,
      averageAuthenticity: authenticity.length > 0 ? authenticity.reduce((a, b) => a + b, 0) / authenticity.length : 0,
      hasDetailedTestimonials: lengths.some(l => l > 100)
    };
  }

  _analyzeTestimonialDiversity(testimonials) {
    const authors = testimonials.map(t => t.author).filter(Boolean);
    const uniqueAuthors = [...new Set(authors)];
    
    return {
      uniqueAuthors: uniqueAuthors.length,
      diversityRatio: authors.length > 0 ? uniqueAuthors.length / authors.length : 0,
      hasDiverseTestimonials: uniqueAuthors.length >= 3
    };
  }

  _analyzeTestimonialAuthenticity(testimonials) {
    const withNames = testimonials.filter(t => t.author).length;
    const withPhotos = testimonials.filter(t => t.hasPhoto).length;
    const total = testimonials.length;

    return {
      hasNames: withNames > 0,
      hasPhotos: withPhotos > 0,
      nameRatio: total > 0 ? withNames / total : 0,
      photoRatio: total > 0 ? withPhotos / total : 0
    };
  }

  _analyzeTestimonialPlacement(elements, document) {
    const placements = {
      header: 0,
      content: 0,
      sidebar: 0,
      footer: 0
    };

    elements.forEach(element => {
      // Simplified placement analysis
      const parent = element.closest('header, main, aside, footer');
      if (parent) {
        const tagName = parent.tagName.toLowerCase();
        if (tagName === 'header') placements.header++;
        else if (tagName === 'main') placements.content++;
        else if (tagName === 'aside') placements.sidebar++;
        else if (tagName === 'footer') placements.footer++;
      }
    });

    return placements;
  }

  _extractRating(element) {
    const text = element.textContent || '';
    const classNames = element.className || '';
    
    // Try to extract numeric rating
    const ratingMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:\/\s*(\d+)|stars?|out\s+of|rating)/i);
    if (ratingMatch) {
      const value = parseFloat(ratingMatch[1]);
      const max = ratingMatch[2] ? parseFloat(ratingMatch[2]) : 5;
      
      return {
        value,
        max,
        normalized: (value / max) * 5, // Normalize to 5-star scale
        platform: this._identifyReviewPlatform(element),
        count: this._extractReviewCount(element)
      };
    }

    return null;
  }

  _identifyReviewPlatform(element) {
    const content = (element.textContent + element.className).toLowerCase();
    
    if (content.includes('google')) return 'google';
    if (content.includes('yelp')) return 'yelp';
    if (content.includes('facebook')) return 'facebook';
    if (content.includes('trustpilot')) return 'trustpilot';
    
    return 'unknown';
  }

  _extractReviewCount(element) {
    const text = element.textContent || '';
    const countMatch = text.match(/(\d+)\s*(?:reviews?|ratings?)/i);
    return countMatch ? parseInt(countMatch[1]) : 1;
  }

  _findPlatformReviews(document, indicators) {
    const elements = [];
    
    indicators.forEach(indicator => {
      const found = document.querySelectorAll(`[class*="${indicator}"], [id*="${indicator}"]`);
      elements.push(...Array.from(found));
    });

    return elements;
  }

  _extractPlatformData(elements, platform) {
    // Extract platform-specific data
    const data = {
      count: elements.length,
      hasWidget: elements.some(el => el.querySelector('iframe, script')),
      hasRating: elements.some(el => /\d+(\.\d+)?/.test(el.textContent))
    };

    return data;
  }

  _calculateAggregateScore(ratings) {
    if (ratings.length === 0) return 0;
    
    const totalWeighted = ratings.reduce((sum, rating) => {
      return sum + (rating.normalized * (rating.count || 1));
    }, 0);
    
    const totalCount = ratings.reduce((sum, rating) => sum + (rating.count || 1), 0);
    
    return totalWeighted / totalCount;
  }

  _analyzeReviewDistribution(ratings) {
    // Simplified distribution analysis
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    ratings.forEach(rating => {
      const rounded = Math.round(rating.normalized);
      if (distribution[rounded] !== undefined) {
        distribution[rounded] += rating.count || 1;
      }
    });

    return distribution;
  }

  _analyzeFollowerCounts(document) {
    const selectors = this.socialProofPatterns.socialSignals.followerCounts;
    const elements = document.querySelectorAll(selectors.join(', '));
    
    return {
      present: elements.length > 0,
      count: elements.length,
      platforms: this._extractPlatformCounts(elements)
    };
  }

  _extractPlatformCounts(elements) {
    const platforms = {};
    
    elements.forEach(element => {
      const text = element.textContent || '';
      const platform = this._identifyPlatformFromElement(element);
      const count = this._extractNumberFromText(text);
      
      if (platform && count) {
        platforms[platform] = count;
      }
    });

    return platforms;
  }

  _identifyPlatformFromElement(element) {
    const content = (element.textContent + element.className + element.id).toLowerCase();
    
    if (content.includes('twitter') || content.includes('x.com')) return 'twitter';
    if (content.includes('facebook')) return 'facebook';
    if (content.includes('instagram')) return 'instagram';
    if (content.includes('linkedin')) return 'linkedin';
    if (content.includes('youtube')) return 'youtube';
    
    return 'unknown';
  }

  _extractNumberFromText(text) {
    const match = text.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*[kmb]?/i);
    if (match) {
      let number = parseFloat(match[1].replace(/,/g, ''));
      const suffix = text.toLowerCase();
      
      if (suffix.includes('k')) number *= 1000;
      else if (suffix.includes('m')) number *= 1000000;
      else if (suffix.includes('b')) number *= 1000000000;
      
      return number;
    }
    
    return null;
  }

  _analyzeSocialFeeds(document) {
    const selectors = this.socialProofPatterns.socialSignals.socialFeeds;
    const elements = document.querySelectorAll(selectors.join(', '));
    
    return {
      present: elements.length > 0,
      count: elements.length,
      types: this._identifyFeedTypes(elements)
    };
  }

  _identifyFeedTypes(elements) {
    const types = [];
    
    elements.forEach(element => {
      const content = (element.className + element.id).toLowerCase();
      
      if (content.includes('twitter')) types.push('twitter');
      if (content.includes('instagram')) types.push('instagram');
      if (content.includes('facebook')) types.push('facebook');
    });

    return [...new Set(types)];
  }

  _analyzeMediaMentions(document) {
    const selectors = this.socialProofPatterns.socialSignals.mentions;
    const elements = document.querySelectorAll(selectors.join(', '));
    
    return {
      present: elements.length > 0,
      count: elements.length,
      outlets: this._extractMediaOutlets(elements)
    };
  }

  _extractMediaOutlets(elements) {
    const outlets = [];
    
    elements.forEach(element => {
      const text = element.textContent || '';
      const images = element.querySelectorAll('img');
      
      // Extract outlet names from text or image alt attributes
      if (text.trim()) outlets.push(text.trim());
      images.forEach(img => {
        if (img.alt) outlets.push(img.alt);
      });
    });

    return outlets.slice(0, 10); // Limit to top 10
  }

  _analyzeEngagementIndicators(document) {
    // Look for social engagement indicators
    const engagementSelectors = [
      '.likes', '.shares', '.comments', '.engagement',
      '[class*="like"]', '[class*="share"]', '[class*="comment"]'
    ];
    
    const elements = document.querySelectorAll(engagementSelectors.join(', '));
    
    return {
      present: elements.length > 0,
      indicators: elements.length,
      hasLikes: document.querySelector('.likes, [class*="like"]') !== null,
      hasShares: document.querySelector('.shares, [class*="share"]') !== null,
      hasComments: document.querySelector('.comments, [class*="comment"]') !== null
    };
  }

  _analyzeCertifications(document) {
    const selectors = this.socialProofPatterns.trustIndicators.certifications;
    const elements = document.querySelectorAll(selectors.join(', '));
    
    return {
      present: elements.length > 0,
      count: elements.length,
      types: this._extractCertificationTypes(elements)
    };
  }

  _extractCertificationTypes(elements) {
    const types = [];
    
    elements.forEach(element => {
      const text = (element.textContent || '').toLowerCase();
      const alt = element.querySelector('img')?.alt?.toLowerCase() || '';
      const combined = text + ' ' + alt;
      
      if (combined.includes('iso')) types.push('ISO');
      if (combined.includes('ssl') || combined.includes('secure')) types.push('SSL');
      if (combined.includes('verified')) types.push('Verified');
      if (combined.includes('certified')) types.push('Certified');
    });

    return [...new Set(types)];
  }

  _analyzeSecurityIndicators(document) {
    const selectors = this.socialProofPatterns.trustIndicators.security;
    const elements = document.querySelectorAll(selectors.join(', '));
    
    return {
      present: elements.length > 0,
      count: elements.length,
      hasSSL: elements.length > 0 && Array.from(elements).some(el => 
        el.textContent.toLowerCase().includes('ssl') || 
        el.textContent.toLowerCase().includes('secure')
      )
    };
  }

  _analyzeGuarantees(document) {
    const selectors = this.socialProofPatterns.trustIndicators.guarantees;
    const elements = document.querySelectorAll(selectors.join(', '));
    
    return {
      present: elements.length > 0,
      count: elements.length,
      types: this._extractGuaranteeTypes(elements)
    };
  }

  _extractGuaranteeTypes(elements) {
    const types = [];
    
    elements.forEach(element => {
      const text = (element.textContent || '').toLowerCase();
      
      if (text.includes('money back')) types.push('Money Back');
      if (text.includes('satisfaction')) types.push('Satisfaction');
      if (text.includes('warranty')) types.push('Warranty');
      if (text.includes('guarantee')) types.push('General Guarantee');
    });

    return [...new Set(types)];
  }

  _analyzeTrustBadges(document) {
    // Look for trust badges in images and elements
    const badges = document.querySelectorAll('img[alt*="trust"], img[alt*="secure"], img[alt*="verified"]');
    const badgeElements = document.querySelectorAll('.trust-badge, .security-badge, .verified-badge');
    
    return {
      present: badges.length > 0 || badgeElements.length > 0,
      count: badges.length + badgeElements.length,
      imageCount: badges.length,
      elementCount: badgeElements.length
    };
  }

  _analyzeUserPhotos(document) {
    const selectors = ['.user-photo', '.customer-photo', '.user-image'];
    const elements = document.querySelectorAll(selectors.join(', '));
    
    return {
      present: elements.length > 0,
      count: elements.length
    };
  }

  _analyzePhotoGalleries(document) {
    const selectors = ['.gallery', '.customer-gallery', '.user-gallery'];
    const elements = document.querySelectorAll(selectors.join(', '));
    
    return {
      present: elements.length > 0,
      count: elements.length,
      hasUserContent: elements.length > 0 && Array.from(elements).some(el =>
        el.className.toLowerCase().includes('user') ||
        el.className.toLowerCase().includes('customer')
      )
    };
  }

  _analyzeHashtags(document) {
    const hashtags = document.querySelectorAll('.hashtag, [class*="hashtag"]');
    const hashtagText = document.body.textContent.match(/#\w+/g) || [];
    
    return {
      present: hashtags.length > 0 || hashtagText.length > 0,
      elements: hashtags.length,
      textCount: hashtagText.length,
      hashtags: [...new Set(hashtagText)].slice(0, 10)
    };
  }

  _analyzeSocialWalls(document) {
    const selectors = ['.social-wall', '.social-feed', '.user-feed'];
    const elements = document.querySelectorAll(selectors.join(', '));
    
    return {
      present: elements.length > 0,
      count: elements.length
    };
  }

  _analyzeMemberCounts(document) {
    const selectors = ['.members', '.member-count', '.community-size'];
    const elements = document.querySelectorAll(selectors.join(', '));
    
    return {
      present: elements.length > 0,
      count: elements.length,
      memberCount: this._extractTotalMembers(elements)
    };
  }

  _extractTotalMembers(elements) {
    let total = 0;
    
    elements.forEach(element => {
      const count = this._extractNumberFromText(element.textContent || '');
      if (count) total += count;
    });

    return total;
  }

  _analyzeCommunityActivity(document) {
    const activitySelectors = ['.recent-activity', '.community-activity', '.active-members'];
    const elements = document.querySelectorAll(activitySelectors.join(', '));
    
    return {
      present: elements.length > 0,
      count: elements.length
    };
  }

  _analyzeForums(document) {
    const forumSelectors = ['.forum', '.discussion', '.community-forum'];
    const elements = document.querySelectorAll(forumSelectors.join(', '));
    
    return {
      present: elements.length > 0,
      count: elements.length
    };
  }

  _analyzeCommunityGroups(document) {
    const groupSelectors = ['.group', '.community-group', '.user-group'];
    const elements = document.querySelectorAll(groupSelectors.join(', '));
    
    return {
      present: elements.length > 0,
      count: elements.length
    };
  }

  _calculateSocialProofScore(components) {
    const weights = {
      testimonials: 0.25,
      reviews: 0.25,
      socialSignals: 0.20,
      trustIndicators: 0.15,
      ugc: 0.10,
      community: 0.05
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([component, weight]) => {
      if (components[component] && components[component].score !== undefined) {
        totalScore += components[component].score * weight;
        totalWeight += weight;
      }
    });

    const score = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    const grade = this._calculateGrade(score);
    const level = this._categorizeLevel(score);

    return { score, grade, level };
  }

  _calculateTestimonialsScore(analysis) {
    let score = 40; // Base score for presence

    // Quantity (20 points)
    score += Math.min(analysis.count / this.config.minTestimonials, 1) * 20;

    // Quality (20 points)
    if (analysis.quality.averageLength > 50) score += 10;
    if (analysis.quality.hasDetailedTestimonials) score += 10;

    // Authenticity (20 points)
    score += analysis.authenticity.nameRatio * 10;
    score += analysis.authenticity.photoRatio * 10;

    // Deduct for issues
    score -= analysis.issues.length * 5;

    return Math.max(0, Math.min(100, score));
  }

  _calculateReviewsScore(analysis) {
    let score = 40; // Base score for presence

    // Review score quality (30 points)
    if (analysis.aggregateScore) {
      score += (analysis.aggregateScore / 5) * 30;
    }

    // Review count (20 points)
    if (analysis.reviewCount > 0) {
      score += Math.min(analysis.reviewCount / 50, 1) * 20;
    }

    // Platform diversity (10 points)
    const platformCount = Object.keys(analysis.platforms).length;
    score += Math.min(platformCount / 3, 1) * 10;

    return Math.max(0, Math.min(100, score));
  }

  _calculateSocialSignalsScore(analysis) {
    let score = 0;

    if (analysis.followerCounts.present) score += 25;
    if (analysis.socialFeeds.present) score += 25;
    if (analysis.mentions.present) score += 25;
    if (analysis.engagement.present) score += 25;

    return Math.max(0, Math.min(100, score));
  }

  _calculateTrustIndicatorsScore(analysis) {
    let score = 0;

    if (analysis.certifications.present) score += 25;
    if (analysis.security.present) score += 25;
    if (analysis.guarantees.present) score += 25;
    if (analysis.badges.present) score += 25;

    return Math.max(0, Math.min(100, score));
  }

  _calculateUGCScore(analysis) {
    let score = 0;

    if (analysis.photos.present) score += 25;
    if (analysis.galleries.present) score += 25;
    if (analysis.hashtags.present) score += 25;
    if (analysis.socialWalls.present) score += 25;

    return Math.max(0, Math.min(100, score));
  }

  _calculateCommunityScore(analysis) {
    let score = 0;

    if (analysis.memberCount.present) score += 25;
    if (analysis.activity.present) score += 25;
    if (analysis.forums.present) score += 25;
    if (analysis.groups.present) score += 25;

    return Math.max(0, Math.min(100, score));
  }

  _assessCredibilityLevel(score) {
    if (score >= 90) return 'very_high';
    if (score >= 80) return 'high';
    if (score >= 70) return 'moderate';
    if (score >= 60) return 'low';
    return 'very_low';
  }

  _generateSocialProofInsights(components) {
    const insights = [];

    // High-impact insights
    if (components.reviews.present && components.reviews.aggregateScore > 4.5) {
      insights.push({
        type: 'positive',
        category: 'reviews',
        message: 'Excellent review ratings detected - strong credibility indicator',
        impact: 'high'
      });
    }

    if (components.testimonials.present && components.testimonials.count >= this.config.minTestimonials) {
      insights.push({
        type: 'positive',
        category: 'testimonials',
        message: 'Sufficient testimonials for effective social proof',
        impact: 'medium'
      });
    }

    if (!components.trustIndicators.present) {
      insights.push({
        type: 'opportunity',
        category: 'trust',
        message: 'Missing trust indicators - opportunity to enhance credibility',
        impact: 'medium'
      });
    }

    return insights;
  }

  _generateSocialProofRecommendations(components) {
    const recommendations = [];

    // Collect recommendations from all components
    Object.values(components).forEach(component => {
      if (component.recommendations) {
        recommendations.push(...component.recommendations.map(rec => ({
          text: rec,
          category: 'social_proof',
          priority: 'medium',
          complexity: 'low'
        })));
      }
    });

    return recommendations.slice(0, 8); // Limit recommendations
  }

  _calculateGrade(score) {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 67) return 'D+';
    if (score >= 65) return 'D';
    return 'F';
  }

  _categorizeLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'satisfactory';
    if (score >= 60) return 'needs_improvement';
    return 'poor';
  }

  _generateCacheKey(url) {
    return btoa(url || 'unknown').slice(0, 20);
  }
}

export default SocialProofDetector;
