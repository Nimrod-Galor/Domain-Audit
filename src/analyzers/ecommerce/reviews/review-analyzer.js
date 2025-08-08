/**
 * ============================================================================
 * REVIEW ANALYZER
 * ============================================================================
 *
 * Analyzes customer review systems and user-generated content including:
 * - Review system detection and analysis
 * - Rating systems and aggregations
 * - Review schema markup validation
 * - Review quality and authenticity indicators
 * - User-generated content optimization
 *
 * @author Nimrod Galor
 * @version 1.0.0
 */

export class ReviewAnalyzer {
  constructor(options = {}) {
    this.options = options;
    this.reviewSelectors = [
      ".review",
      ".reviews",
      ".customer-review",
      ".product-review",
      ".testimonial",
      ".feedback",
      ".rating",
      ".user-review",
    ];
    
    this.ratingSelectors = [
      ".rating",
      ".stars",
      ".star-rating",
      ".score",
      ".rate",
      ".review-rating",
    ];
  }

  /**
   * Analyze review systems and customer feedback
   * @param {Document} document - DOM document
   * @returns {Object} Review analysis results
   */
  analyze(document) {
    const reviewElements = this._findReviewElements(document);
    const reviewFeatures = this._analyzeReviewFeatures(document);
    const ratingSystem = this._analyzeRatingSystem(document);
    const reviewSchema = this._analyzeReviewSchema(document);
    const reviewQuality = this._analyzeReviewQuality(document, reviewElements);
    const userGenerated = this._analyzeUserGeneratedContent(document);

    return {
      hasReviews: reviewElements.length > 0,
      reviewCount: reviewElements.length,
      reviewElements: reviewElements.map(el => ({
        tagName: el.tagName,
        className: el.className,
        textLength: el.textContent.trim().length,
      })),
      features: reviewFeatures,
      ratingSystem,
      schema: reviewSchema,
      quality: reviewQuality,
      userGenerated,
      score: this._calculateReviewScore(
        reviewFeatures,
        ratingSystem,
        reviewSchema,
        reviewQuality
      ),
    };
  }

  /**
   * Find review elements in the document
   */
  _findReviewElements(document) {
    const elements = [];

    this.reviewSelectors.forEach((selector) => {
      const found = document.querySelectorAll(selector);
      elements.push(...Array.from(found));
    });

    return [...new Set(elements)];
  }

  /**
   * Analyze review system features
   */
  _analyzeReviewFeatures(document) {
    return {
      userReviews: this._hasUserReviews(document),
      averageRating: this._hasAverageRating(document),
      ratingDistribution: this._hasRatingDistribution(document),
      reviewFiltering: this._hasReviewFiltering(document),
      reviewSorting: this._hasReviewSorting(document),
      helpfulVoting: this._hasHelpfulVoting(document),
      verifiedPurchase: this._hasVerifiedPurchaseIndicator(document),
      reviewPhotos: this._hasReviewPhotos(document),
      reviewResponses: this._hasReviewResponses(document),
      reviewDates: this._hasReviewDates(document),
      reviewerProfiles: this._hasReviewerProfiles(document),
      reviewSubmission: this._hasReviewSubmissionForm(document),
    };
  }

  /**
   * Analyze rating system
   */
  _analyzeRatingSystem(document) {
    const ratingElements = this._findRatingElements(document);
    
    return {
      hasRatings: ratingElements.length > 0,
      ratingCount: ratingElements.length,
      ratingTypes: this._identifyRatingTypes(ratingElements),
      ratingScale: this._identifyRatingScale(document),
      aggregateRating: this._findAggregateRating(document),
      ratingBreakdown: this._hasRatingBreakdown(document),
      visualRatings: this._hasVisualRatings(ratingElements),
    };
  }

  /**
   * Analyze review schema markup
   */
  _analyzeReviewSchema(document) {
    const schemas = this._extractReviewSchemas(document);

    return {
      hasReviewSchema: schemas.length > 0,
      schemaCount: schemas.length,
      schemas: schemas,
      aggregateRating: this._hasAggregateRatingSchema(schemas),
      individualReviews: this._hasIndividualReviewSchemas(schemas),
      validationErrors: this._validateReviewSchemas(schemas),
      schemaCompleteness: this._calculateSchemaCompleteness(schemas),
    };
  }

  /**
   * Analyze review quality indicators
   */
  _analyzeReviewQuality(document, reviewElements) {
    return {
      averageReviewLength: this._calculateAverageReviewLength(reviewElements),
      detailedReviews: this._countDetailedReviews(reviewElements),
      recentReviews: this._hasRecentReviews(document),
      authenticityIndicators: this._findAuthenticityIndicators(document),
      moderationIndicators: this._findModerationIndicators(document),
      diverseReviewers: this._hasDiverseReviewers(document),
      balancedRatings: this._hasBalancedRatings(document),
    };
  }

  /**
   * Analyze user-generated content
   */
  _analyzeUserGeneratedContent(document) {
    return {
      customerPhotos: this._hasCustomerPhotos(document),
      videoReviews: this._hasVideoReviews(document),
      qAndA: this._hasQuestionAndAnswer(document),
      userSubmissions: this._hasUserSubmissions(document),
      socialProof: this._hasSocialProof(document),
      ugcModeration: this._hasUGCModeration(document),
    };
  }

  /**
   * Calculate review system score
   */
  _calculateReviewScore(features, rating, schema, quality) {
    let score = 0;

    // Review features (35%)
    const featureCount = Object.values(features).filter(Boolean).length;
    const totalFeatures = Object.keys(features).length;
    score += (featureCount / totalFeatures) * 35;

    // Rating system (25%)
    const ratingFeatures = Object.values(rating).filter(val => 
      typeof val === 'boolean' ? val : (Array.isArray(val) ? val.length > 0 : val > 0)
    ).length;
    const totalRatingFeatures = Object.keys(rating).length;
    score += (ratingFeatures / totalRatingFeatures) * 25;

    // Schema markup (20%)
    const schemaScore = schema.hasReviewSchema ? 
      (schema.schemaCompleteness / 100) * 20 : 0;
    score += schemaScore;

    // Review quality (20%)
    const qualityFeatures = Object.values(quality).filter(val => 
      typeof val === 'boolean' ? val : val > 0
    ).length;
    const totalQualityFeatures = Object.keys(quality).length;
    score += (qualityFeatures / totalQualityFeatures) * 20;

    return Math.round(Math.min(score, 100));
  }

  // Review feature detection methods
  _hasUserReviews(document) {
    return this._findReviewElements(document).length > 0;
  }

  _hasAverageRating(document) {
    const text = document.body.textContent.toLowerCase();
    return /average.*rating|overall.*rating|\d+\.\d+.*out.*of|\d+\.\d+.*stars/.test(text) ||
           document.querySelector('.average-rating, .overall-rating') !== null;
  }

  _hasRatingDistribution(document) {
    const selectors = [
      '.rating-distribution',
      '.star-breakdown',
      '.rating-breakdown',
      '.histogram'
    ];
    return selectors.some(selector => document.querySelector(selector) !== null) ||
           document.querySelectorAll('[class*="star-"], [class*="rating-"]').length > 5;
  }

  _hasReviewFiltering(document) {
    const selectors = [
      '.review-filter',
      '.filter-reviews',
      'select[name*="filter"]',
      'button[data-filter]'
    ];
    const text = document.body.textContent.toLowerCase();
    return selectors.some(selector => document.querySelector(selector) !== null) ||
           /filter.*review|filter.*rating|show.*rating/.test(text);
  }

  _hasReviewSorting(document) {
    const selectors = [
      '.review-sort',
      '.sort-reviews',
      'select[name*="sort"]',
      'button[data-sort]'
    ];
    const text = document.body.textContent.toLowerCase();
    return selectors.some(selector => document.querySelector(selector) !== null) ||
           /sort.*review|most.*helpful|most.*recent|highest.*rated/.test(text);
  }

  _hasHelpfulVoting(document) {
    const selectors = [
      '.helpful',
      '.thumbs-up',
      '.vote',
      '.like',
      'button[data-action*="helpful"]'
    ];
    const text = document.body.textContent.toLowerCase();
    return selectors.some(selector => document.querySelector(selector) !== null) ||
           /helpful|was.*this.*review|thumbs.*up|vote/.test(text);
  }

  _hasVerifiedPurchaseIndicator(document) {
    const text = document.body.textContent.toLowerCase();
    return /verified.*purchase|verified.*buyer|confirmed.*purchase/.test(text);
  }

  _hasReviewPhotos(document) {
    const photoSelectors = [
      '.review-photo',
      '.customer-photo',
      '.review img',
      '.user-image'
    ];
    return photoSelectors.some(selector => document.querySelector(selector) !== null);
  }

  _hasReviewResponses(document) {
    const responseSelectors = [
      '.review-response',
      '.seller-response',
      '.company-response',
      '.reply'
    ];
    const text = document.body.textContent.toLowerCase();
    return responseSelectors.some(selector => document.querySelector(selector) !== null) ||
           /response.*from|reply.*from|seller.*says/.test(text);
  }

  _hasReviewDates(document) {
    const dateSelectors = [
      '.review-date',
      '.date',
      '.posted-on',
      'time[datetime]'
    ];
    return dateSelectors.some(selector => document.querySelector(selector) !== null);
  }

  _hasReviewerProfiles(document) {
    const profileSelectors = [
      '.reviewer-profile',
      '.customer-profile',
      '.user-profile',
      '.reviewer-name'
    ];
    return profileSelectors.some(selector => document.querySelector(selector) !== null);
  }

  _hasReviewSubmissionForm(document) {
    const formSelectors = [
      '.review-form',
      '.submit-review',
      '.write-review',
      'form[action*="review"]'
    ];
    const text = document.body.textContent.toLowerCase();
    return formSelectors.some(selector => document.querySelector(selector) !== null) ||
           /write.*review|submit.*review|add.*review/.test(text);
  }

  // Rating system methods
  _findRatingElements(document) {
    const elements = [];

    this.ratingSelectors.forEach((selector) => {
      const found = document.querySelectorAll(selector);
      elements.push(...Array.from(found));
    });

    return [...new Set(elements)];
  }

  _identifyRatingTypes(ratingElements) {
    const types = [];
    
    ratingElements.forEach(element => {
      const classes = element.className.toLowerCase();
      const content = element.textContent.toLowerCase();
      
      if (/star/i.test(classes) || /★|☆/.test(element.innerHTML)) {
        types.push('stars');
      }
      if (/\d+\/\d+/.test(content)) {
        types.push('numeric');
      }
      if (/thumb|like/i.test(classes)) {
        types.push('thumbs');
      }
      if (/\d+%/.test(content)) {
        types.push('percentage');
      }
    });

    return [...new Set(types)];
  }

  _identifyRatingScale(document) {
    const text = document.body.textContent;
    
    if (/out.*of.*5|5.*star/i.test(text)) return 5;
    if (/out.*of.*10|10.*point/i.test(text)) return 10;
    if (/out.*of.*100|100.*point/i.test(text)) return 100;
    
    // Look for numeric patterns
    const matches = text.match(/(\d+).*out.*of.*(\d+)/i);
    if (matches) return parseInt(matches[2]);
    
    return null;
  }

  _findAggregateRating(document) {
    const aggregateSelectors = [
      '.aggregate-rating',
      '.overall-rating',
      '.average-rating',
      '.total-rating'
    ];
    
    const element = aggregateSelectors.find(selector => 
      document.querySelector(selector)
    );
    
    if (element) {
      const text = document.querySelector(element).textContent;
      const rating = text.match(/(\d+\.?\d*)/);
      return rating ? parseFloat(rating[1]) : null;
    }
    
    return null;
  }

  _hasRatingBreakdown(document) {
    return document.querySelector('.rating-breakdown, .star-breakdown') !== null ||
           document.querySelectorAll('[class*="star-"]').length > 3;
  }

  _hasVisualRatings(ratingElements) {
    return ratingElements.some(element => {
      return /★|☆|⭐/.test(element.innerHTML) ||
             element.querySelector('.star, .rating-star') !== null;
    });
  }

  // Schema analysis methods
  _extractReviewSchemas(document) {
    const jsonLdScripts = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]')
    );

    const reviewSchemas = [];

    jsonLdScripts.forEach((script, index) => {
      try {
        const data = JSON.parse(script.textContent);
        const reviews = this._findReviewsInSchema(data);
        
        reviews.forEach(review => {
          reviewSchemas.push({
            type: 'JSON-LD',
            index: index,
            data: review,
          });
        });
      } catch (error) {
        // Invalid JSON-LD, skip
      }
    });

    return reviewSchemas;
  }

  _findReviewsInSchema(data) {
    const reviews = [];

    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item['@type'] === 'Review' || item['@type'] === 'AggregateRating') {
          reviews.push(item);
        }
        if (item.review) {
          reviews.push(...(Array.isArray(item.review) ? item.review : [item.review]));
        }
        if (item.aggregateRating) {
          reviews.push(item.aggregateRating);
        }
      });
    } else {
      if (data['@type'] === 'Review' || data['@type'] === 'AggregateRating') {
        reviews.push(data);
      }
      if (data.review) {
        reviews.push(...(Array.isArray(data.review) ? data.review : [data.review]));
      }
      if (data.aggregateRating) {
        reviews.push(data.aggregateRating);
      }
    }

    return reviews;
  }

  _hasAggregateRatingSchema(schemas) {
    return schemas.some(schema => 
      schema.data['@type'] === 'AggregateRating' || schema.data.aggregateRating
    );
  }

  _hasIndividualReviewSchemas(schemas) {
    return schemas.some(schema => schema.data['@type'] === 'Review');
  }

  _validateReviewSchemas(schemas) {
    const errors = [];
    
    schemas.forEach((schema, index) => {
      const review = schema.data;
      
      if (review['@type'] === 'Review') {
        if (!review.author) {
          errors.push(`Review schema ${index + 1}: Missing author`);
        }
        if (!review.reviewRating && !review.ratingValue) {
          errors.push(`Review schema ${index + 1}: Missing rating`);
        }
        if (!review.reviewBody && !review.description) {
          errors.push(`Review schema ${index + 1}: Missing review content`);
        }
      }
      
      if (review['@type'] === 'AggregateRating') {
        if (!review.ratingValue) {
          errors.push(`AggregateRating schema ${index + 1}: Missing ratingValue`);
        }
        if (!review.reviewCount && !review.ratingCount) {
          errors.push(`AggregateRating schema ${index + 1}: Missing review/rating count`);
        }
      }
    });
    
    return errors;
  }

  _calculateSchemaCompleteness(schemas) {
    if (schemas.length === 0) return 0;
    
    let totalScore = 0;
    let schemaCount = 0;
    
    schemas.forEach(schema => {
      const review = schema.data;
      let score = 0;
      let maxScore = 0;
      
      if (review['@type'] === 'Review') {
        maxScore = 6;
        if (review.author) score++;
        if (review.reviewRating || review.ratingValue) score++;
        if (review.reviewBody || review.description) score++;
        if (review.datePublished) score++;
        if (review.headline || review.name) score++;
        if (review.itemReviewed) score++;
      } else if (review['@type'] === 'AggregateRating') {
        maxScore = 4;
        if (review.ratingValue) score++;
        if (review.bestRating) score++;
        if (review.worstRating) score++;
        if (review.reviewCount || review.ratingCount) score++;
      }
      
      if (maxScore > 0) {
        totalScore += (score / maxScore) * 100;
        schemaCount++;
      }
    });
    
    return schemaCount > 0 ? Math.round(totalScore / schemaCount) : 0;
  }

  // Quality analysis methods
  _calculateAverageReviewLength(reviewElements) {
    if (reviewElements.length === 0) return 0;
    
    const totalLength = reviewElements.reduce((sum, element) => {
      return sum + element.textContent.trim().length;
    }, 0);
    
    return Math.round(totalLength / reviewElements.length);
  }

  _countDetailedReviews(reviewElements) {
    return reviewElements.filter(element => 
      element.textContent.trim().length > 100
    ).length;
  }

  _hasRecentReviews(document) {
    const currentYear = new Date().getFullYear();
    const text = document.body.textContent;
    
    return new RegExp(`${currentYear}|${currentYear - 1}`).test(text);
  }

  _findAuthenticityIndicators(document) {
    const indicators = [];
    const text = document.body.textContent.toLowerCase();
    
    if (/verified.*purchase|verified.*buyer/.test(text)) {
      indicators.push('verified-purchase');
    }
    if (/real.*customer|genuine.*review/.test(text)) {
      indicators.push('genuine-review');
    }
    if (/moderated|reviewed.*before.*posting/.test(text)) {
      indicators.push('moderated');
    }
    
    return indicators;
  }

  _findModerationIndicators(document) {
    const text = document.body.textContent.toLowerCase();
    return /moderated|reviewed.*before.*posting|content.*policy/.test(text);
  }

  _hasDiverseReviewers(document) {
    const reviewerElements = document.querySelectorAll('.reviewer-name, .customer-name');
    const uniqueNames = new Set();
    
    reviewerElements.forEach(element => {
      uniqueNames.add(element.textContent.trim());
    });
    
    return uniqueNames.size > 1 && uniqueNames.size >= reviewerElements.length * 0.8;
  }

  _hasBalancedRatings(document) {
    const ratingElements = document.querySelectorAll('[class*="star"], [class*="rating"]');
    const ratings = [];
    
    ratingElements.forEach(element => {
      const text = element.textContent;
      const rating = text.match(/(\d+)/);
      if (rating) {
        ratings.push(parseInt(rating[1]));
      }
    });
    
    if (ratings.length < 3) return false;
    
    const uniqueRatings = new Set(ratings);
    return uniqueRatings.size > 1; // Has variety in ratings
  }

  // User-generated content methods
  _hasCustomerPhotos(document) {
    const photoSelectors = [
      '.customer-photo',
      '.review-photo',
      '.user-image',
      'img[alt*="customer"]'
    ];
    return photoSelectors.some(selector => document.querySelector(selector) !== null);
  }

  _hasVideoReviews(document) {
    const videoSelectors = [
      '.review-video',
      '.customer-video',
      'video',
      'iframe[src*="youtube"]',
      'iframe[src*="vimeo"]'
    ];
    return videoSelectors.some(selector => document.querySelector(selector) !== null);
  }

  _hasQuestionAndAnswer(document) {
    const qaSelectors = [
      '.qa-section',
      '.questions',
      '.q-and-a',
      '.faq'
    ];
    const text = document.body.textContent.toLowerCase();
    return qaSelectors.some(selector => document.querySelector(selector) !== null) ||
           /questions.*answers|q.*a|ask.*question/.test(text);
  }

  _hasUserSubmissions(document) {
    const submissionForms = document.querySelectorAll('form');
    return Array.from(submissionForms).some(form => {
      const formText = form.textContent.toLowerCase();
      return /submit.*review|write.*review|add.*photo|share.*experience/.test(formText);
    });
  }

  _hasSocialProof(document) {
    const socialSelectors = [
      '.social-proof',
      '.customer-count',
      '.review-count',
      '.testimonial-count'
    ];
    const text = document.body.textContent.toLowerCase();
    return socialSelectors.some(selector => document.querySelector(selector) !== null) ||
           /\d+.*customers|\d+.*reviews|\d+.*satisfied/.test(text);
  }

  _hasUGCModeration(document) {
    const text = document.body.textContent.toLowerCase();
    return /content.*moderated|reviews.*moderated|community.*guidelines/.test(text);
  }
}
