/**
 * Enhanced Pinterest Analyzer
 * Comprehensive analysis of Pinterest Rich Pins and optimization with BaseAnalyzer integration
 * 
 * @extends BaseAnalyzer
 * @version 1.0.0
 * @author Nimrod Galor
 * @date 2025-08-08
 */

import { BaseAnalyzer } from '../../core/BaseAnalyzer.js';
import { AnalyzerCategories } from '../../core/AnalyzerInterface.js';

export class PinterestAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('PinterestAnalyzer', {
      enableRichPinValidation: options.enableRichPinValidation !== false,
      enableImageOptimization: options.enableImageOptimization !== false,
      enableContentAnalysis: options.enableContentAnalysis !== false,
      enableSchemaValidation: options.enableSchemaValidation !== false,
      strictValidation: options.strictValidation || false,
      validateImageDimensions: options.validateImageDimensions !== false,
      includeRecommendations: options.includeRecommendations !== false,
      ...options
    });

    this.version = '1.0.0';
    this.category = AnalyzerCategories.CONTENT;
    
    this.richPinTypes = ['article', 'product', 'recipe', 'app'];
    this.requiredSchemaTypes = ['Article', 'Product', 'Recipe', 'SoftwareApplication'];
    this.recommendedMetaTags = ['og:title', 'og:description', 'og:image', 'og:type', 'og:url'];
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'PinterestAnalyzer',
      version: '1.0.0',
      description: 'Comprehensive Pinterest Rich Pins analysis and social media optimization',
      category: AnalyzerCategories.CONTENT,
      priority: 'high',
      capabilities: [
        'rich_pins_validation',
        'pinterest_image_optimization',
        'schema_markup_analysis',
        'content_optimization',
        'pin_quality_assessment',
        'social_sharing_optimization',
        'recommendation_generation'
      ]
    };
  }

  /**
   * Validate analysis context
   * @param {Object} context - Analysis context
   * @returns {boolean} Whether context is valid
   */
  validate(context) {
    try {
      if (!context || typeof context !== 'object') {
        return false;
      }

      const { document } = context;
      if (!document || !document.querySelector) {
        this.log('Pinterest analysis requires a valid DOM document', 'warn');
        return false;
      }

      return true;
    } catch (error) {
      this.handleError('Error validating Pinterest analysis context', error);
      return false;
    }
  }

  /**
   * Perform comprehensive Pinterest analysis with BaseAnalyzer integration
   * @param {Object} context - Analysis context containing DOM and page data
   * @returns {Promise<Object>} Pinterest analysis results
   */
  async analyze(context) {
    const startTime = Date.now();
    
    try {
      this.log('Starting Pinterest analysis', 'info');

      // Validate context
      if (!this.validate(context)) {
        return this.handleError('Invalid context for Pinterest analysis', new Error('Context validation failed'), {
          hasPinterestOptimization: false,
          score: 0,
          grade: 'F'
        });
      }

      const { document, url = '', pageData = {} } = context;

      // Perform Pinterest analysis
      const pinterestData = await this._performPinterestAnalysis(document, url);
      
      // Calculate comprehensive score
      const score = this._calculateComprehensiveScore(pinterestData);
      const grade = this._getGradeFromScore ? this._getGradeFromScore(score) : this._calculateGrade(score);
      
      // Generate recommendations
      const recommendations = this._generatePinterestRecommendations(pinterestData);
      
      // Generate summary
      const summary = this._generatePinterestSummary(pinterestData, score);

      const result = {
        success: true,
        data: {
          ...pinterestData,
          score,
          grade,
          recommendations,
          summary,
          metadata: this.getMetadata()
        },
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

      this.log(`Pinterest analysis completed in ${result.executionTime}ms with score ${score}`, 'info');
      return result;

    } catch (error) {
      return this.handleError('Pinterest analysis failed', error, {
        hasPinterestOptimization: false,
        score: 0,
        grade: 'F',
        summary: 'Pinterest analysis encountered an error'
      });
    }
  }



  /**
   * Internal method to perform Pinterest analysis
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Promise<Object>} Pinterest analysis results
   */
  async _performPinterestAnalysis(document, url) {
    try {
      this.log('Analyzing Pinterest Rich Pins and optimization', 'info');
      
      const richPins = this._analyzeRichPins(document);
      const imageOptimization = this._analyzePinterestImages(document);
      const contentOptimization = this._analyzePinterestContent(document);
      const validation = this._validatePinterestTags(document);
      const schemaAnalysis = this._analyzeSchemaMarkup(document);

      const score = this._calculatePinterestScore(richPins, imageOptimization, contentOptimization, validation);

      return {
        richPins,
        imageOptimization,
        contentOptimization,
        validation,
        schemaAnalysis,
        score,
        recommendations: this._generatePinterestRecommendationsLegacy(richPins, imageOptimization, validation),
        hasPinterestOptimization: richPins.hasRichPins || imageOptimization.isOptimized,
        completeness: this._calculatePinterestCompleteness(richPins, validation, schemaAnalysis)
      };
    } catch (error) {
      throw new Error(`Pinterest analysis failed: ${error.message}`);
    }
  }

  _analyzeRichPins(document) {
    const richPinData = {
      article: this._analyzeArticlePin(document),
      product: this._analyzeProductPin(document),
      recipe: this._analyzeRecipePin(document),
      app: this._analyzeAppPin(document),
    };

    const detectedTypes = Object.entries(richPinData)
      .filter(([type, data]) => data.detected)
      .map(([type]) => type);

    return {
      types: richPinData,
      detectedTypes,
      hasRichPins: detectedTypes.length > 0,
      primaryType: detectedTypes[0] || null,
    };
  }

  _analyzeArticlePin(document) {
    const articleTags = {
      'og:title': document.querySelector('meta[property="og:title"]'),
      'og:description': document.querySelector('meta[property="og:description"]'),
      'og:image': document.querySelector('meta[property="og:image"]'),
      'article:author': document.querySelector('meta[property="article:author"]'),
      'article:published_time': document.querySelector('meta[property="article:published_time"]'),
    };

    const presentTags = Object.entries(articleTags)
      .filter(([tag, element]) => element && element.getAttribute('content'))
      .map(([tag]) => tag);

    return {
      detected: presentTags.length >= 3,
      tags: articleTags,
      presentTags,
      completeness: (presentTags.length / Object.keys(articleTags).length) * 100,
    };
  }

  _analyzeProductPin(document) {
    const productTags = {
      'og:title': document.querySelector('meta[property="og:title"]'),
      'og:description': document.querySelector('meta[property="og:description"]'),
      'og:image': document.querySelector('meta[property="og:image"]'),
      'product:price:amount': document.querySelector('meta[property="product:price:amount"]'),
      'product:price:currency': document.querySelector('meta[property="product:price:currency"]'),
      'product:availability': document.querySelector('meta[property="product:availability"]'),
    };

    const presentTags = Object.entries(productTags)
      .filter(([tag, element]) => element && element.getAttribute('content'))
      .map(([tag]) => tag);

    // Also check for structured data
    const productSchema = this._hasProductSchema(document);

    return {
      detected: presentTags.length >= 3 || productSchema,
      tags: productTags,
      presentTags,
      hasSchema: productSchema,
      completeness: (presentTags.length / Object.keys(productTags).length) * 100,
    };
  }

  _analyzeRecipePin(document) {
    const recipeTags = {
      'og:title': document.querySelector('meta[property="og:title"]'),
      'og:description': document.querySelector('meta[property="og:description"]'),
      'og:image': document.querySelector('meta[property="og:image"]'),
    };

    // Check for recipe-specific structured data
    const recipeSchema = this._hasRecipeSchema(document);
    const recipeKeywords = this._hasRecipeKeywords(document);

    const presentTags = Object.entries(recipeTags)
      .filter(([tag, element]) => element && element.getAttribute('content'))
      .map(([tag]) => tag);

    return {
      detected: recipeSchema || (presentTags.length >= 2 && recipeKeywords),
      tags: recipeTags,
      presentTags,
      hasSchema: recipeSchema,
      hasKeywords: recipeKeywords,
      completeness: (presentTags.length / Object.keys(recipeTags).length) * 100,
    };
  }

  _analyzeAppPin(document) {
    const appTags = {
      'og:title': document.querySelector('meta[property="og:title"]'),
      'og:description': document.querySelector('meta[property="og:description"]'),
      'og:image': document.querySelector('meta[property="og:image"]'),
      'al:ios:app_store_id': document.querySelector('meta[property="al:ios:app_store_id"]'),
      'al:android:package': document.querySelector('meta[property="al:android:package"]'),
    };

    const presentTags = Object.entries(appTags)
      .filter(([tag, element]) => element && element.getAttribute('content'))
      .map(([tag]) => tag);

    const hasAppLinks = presentTags.some(tag => tag.startsWith('al:'));

    return {
      detected: hasAppLinks,
      tags: appTags,
      presentTags,
      hasAppLinks,
      completeness: (presentTags.length / Object.keys(appTags).length) * 100,
    };
  }

  _analyzePinterestImages(document) {
    const images = document.querySelectorAll('img');
    const ogImage = document.querySelector('meta[property="og:image"]');
    
    const imageAnalysis = {
      totalImages: images.length,
      ogImage: ogImage ? ogImage.getAttribute('content') : null,
      pinterestOptimized: 0,
      verticalImages: 0,
      largeImages: 0,
      altTextPresent: 0,
    };

    images.forEach(img => {
      // Check for alt text
      if (img.alt && img.alt.trim()) {
        imageAnalysis.altTextPresent++;
      }

      // Check dimensions (if available)
      if (img.naturalWidth && img.naturalHeight) {
        const aspectRatio = img.naturalHeight / img.naturalWidth;
        
        // Pinterest prefers vertical images (2:3 or 1:2.1 ratio)
        if (aspectRatio >= 1.5) {
          imageAnalysis.verticalImages++;
        }

        // Large images (minimum 600px wide)
        if (img.naturalWidth >= 600) {
          imageAnalysis.largeImages++;
        }

        // Pinterest optimized (vertical + large)
        if (aspectRatio >= 1.5 && img.naturalWidth >= 600) {
          imageAnalysis.pinterestOptimized++;
        }
      }
    });

    return {
      ...imageAnalysis,
      optimizationScore: this._calculateImageOptimizationScore(imageAnalysis),
      recommendations: this._generateImageRecommendations(imageAnalysis),
    };
  }

  _analyzePinterestContent(document) {
    const title = document.querySelector('meta[property="og:title"]');
    const description = document.querySelector('meta[property="og:description"]');
    
    const analysis = {
      title: this._analyzePinterestTitle(title),
      description: this._analyzePinterestDescription(description),
      keywords: this._analyzePinterestKeywords(document),
      boardFriendly: this._analyzeBoardFriendliness(document),
    };

    return analysis;
  }

  _validatePinterestTags(document) {
    const validation = {
      errors: [],
      warnings: [],
      passed: [],
    };

    // Essential tags for Pinterest
    const essentialTags = ['og:title', 'og:description', 'og:image'];
    
    essentialTags.forEach(tag => {
      const element = document.querySelector(`meta[property="${tag}"]`);
      if (!element) {
        validation.errors.push(`Missing ${tag} (required for Pinterest sharing)`);
      } else {
        const content = element.getAttribute('content');
        if (!content || content.trim() === '') {
          validation.errors.push(`Empty content for ${tag}`);
        } else {
          validation.passed.push(`Valid ${tag}`);
          this._validatePinterestTagContent(tag, content, validation);
        }
      }
    });

    // Check for Pinterest-specific optimizations
    if (!this._hasPinterestVerification(document)) {
      validation.warnings.push('Missing Pinterest site verification');
    }

    return validation;
  }

  _validatePinterestTagContent(tag, content, validation) {
    switch (tag) {
      case 'og:title':
        if (content.length > 100) {
          validation.warnings.push('Title may be too long for Pinterest (recommended: under 100 characters)');
        }
        break;

      case 'og:description':
        if (content.length > 500) {
          validation.warnings.push('Description may be too long for Pinterest (recommended: under 500 characters)');
        }
        if (content.length < 50) {
          validation.warnings.push('Description may be too short for Pinterest (recommended: 50+ characters)');
        }
        break;

      case 'og:image':
        if (!this._isValidImageUrl(content)) {
          validation.errors.push('Invalid image URL for Pinterest sharing');
        }
        break;
    }
  }

  _hasProductSchema(document) {
    const productSchemas = document.querySelectorAll('script[type="application/ld+json"]');
    
    for (let script of productSchemas) {
      try {
        const data = JSON.parse(script.textContent);
        if (data['@type'] === 'Product' || 
            (Array.isArray(data) && data.some(item => item['@type'] === 'Product'))) {
          return true;
        }
      } catch (e) {
        // Invalid JSON, continue
      }
    }
    
    return false;
  }

  _hasRecipeSchema(document) {
    const recipeSchemas = document.querySelectorAll('script[type="application/ld+json"]');
    
    for (let script of recipeSchemas) {
      try {
        const data = JSON.parse(script.textContent);
        if (data['@type'] === 'Recipe' || 
            (Array.isArray(data) && data.some(item => item['@type'] === 'Recipe'))) {
          return true;
        }
      } catch (e) {
        // Invalid JSON, continue
      }
    }
    
    return false;
  }

  _hasRecipeKeywords(document) {
    const textContent = document.body.textContent.toLowerCase();
    const recipeKeywords = [
      'recipe', 'ingredients', 'instructions', 'cooking',
      'baking', 'preparation', 'servings', 'cook time'
    ];

    return recipeKeywords.some(keyword => textContent.includes(keyword));
  }

  _analyzePinterestTitle(titleElement) {
    if (!titleElement) return { present: false };

    const title = titleElement.getAttribute('content');
    if (!title) return { present: false };

    return {
      present: true,
      length: title.length,
      optimized: title.length >= 20 && title.length <= 100,
      descriptive: this._isDescriptiveTitle(title),
      keywordRich: this._hasRelevantKeywords(title),
    };
  }

  _analyzePinterestDescription(descElement) {
    if (!descElement) return { present: false };

    const description = descElement.getAttribute('content');
    if (!description) return { present: false };

    return {
      present: true,
      length: description.length,
      optimized: description.length >= 50 && description.length <= 500,
      descriptive: this._isDescriptiveDescription(description),
      hashtagFriendly: this._isHashtagFriendly(description),
    };
  }

  _analyzePinterestKeywords(document) {
    const textContent = document.body.textContent.toLowerCase();
    
    const pinterestFriendlyCategories = {
      diy: ['diy', 'craft', 'handmade', 'tutorial', 'how to'],
      food: ['recipe', 'cooking', 'food', 'baking', 'kitchen'],
      fashion: ['fashion', 'style', 'outfit', 'clothing', 'accessories'],
      home: ['home', 'decor', 'interior', 'design', 'furniture'],
      beauty: ['beauty', 'makeup', 'skincare', 'hair', 'cosmetics'],
      travel: ['travel', 'destination', 'vacation', 'trip', 'tourism'],
      wedding: ['wedding', 'bride', 'marriage', 'ceremony', 'reception'],
      health: ['health', 'fitness', 'wellness', 'exercise', 'nutrition'],
    };

    const detectedCategories = [];

    Object.entries(pinterestFriendlyCategories).forEach(([category, keywords]) => {
      const matches = keywords.filter(keyword => textContent.includes(keyword));
      if (matches.length > 0) {
        detectedCategories.push({
          category,
          matches,
          relevance: matches.length,
        });
      }
    });

    return {
      categories: detectedCategories,
      isPinterestFriendly: detectedCategories.length > 0,
      primaryCategory: detectedCategories[0]?.category || null,
    };
  }

  _analyzeBoardFriendliness(document) {
    const title = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const description = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    const content = title + ' ' + description;

    const boardFriendlyIndicators = [
      'ideas', 'inspiration', 'tips', 'guide', 'tutorial',
      'collection', 'examples', 'styles', 'designs', 'trends'
    ];

    const matches = boardFriendlyIndicators.filter(indicator => 
      content.toLowerCase().includes(indicator)
    );

    return {
      indicators: matches,
      score: Math.min(100, matches.length * 20),
      isBoardFriendly: matches.length >= 2,
    };
  }

  _calculateImageOptimizationScore(imageAnalysis) {
    if (imageAnalysis.totalImages === 0) return 0;

    let score = 0;
    
    // Score for alt text
    const altTextRatio = imageAnalysis.altTextPresent / imageAnalysis.totalImages;
    score += altTextRatio * 30;

    // Score for vertical images
    const verticalRatio = imageAnalysis.verticalImages / imageAnalysis.totalImages;
    score += verticalRatio * 40;

    // Score for large images
    const largeRatio = imageAnalysis.largeImages / imageAnalysis.totalImages;
    score += largeRatio * 30;

    return Math.round(score);
  }

  _generateImageRecommendations(imageAnalysis) {
    const recommendations = [];

    if (imageAnalysis.altTextPresent < imageAnalysis.totalImages) {
      recommendations.push('Add descriptive alt text to all images');
    }

    if (imageAnalysis.verticalImages === 0) {
      recommendations.push('Use vertical images (2:3 aspect ratio) for better Pinterest performance');
    }

    if (imageAnalysis.largeImages < imageAnalysis.totalImages / 2) {
      recommendations.push('Use high-quality images (minimum 600px wide)');
    }

    return recommendations;
  }

  _calculatePinterestScore(richPins, imageOptimization, contentOptimization) {
    let score = 0;

    // Rich Pins scoring (40%)
    if (richPins.hasRichPins) {
      const primaryType = richPins.types[richPins.primaryType];
      score += (primaryType.completeness * 0.4);
    }

    // Image optimization (35%)
    score += (imageOptimization.optimizationScore * 0.35);

    // Content optimization (25%)
    let contentScore = 0;
    if (contentOptimization.title?.optimized) contentScore += 40;
    if (contentOptimization.description?.optimized) contentScore += 40;
    if (contentOptimization.keywords?.isPinterestFriendly) contentScore += 20;
    
    score += (contentScore * 0.25);

    return Math.round(score);
  }

  _generatePinterestRecommendations(richPins, imageOptimization, validation) {
    const recommendations = [];

    // Error-based recommendations
    validation.errors.forEach(error => {
      recommendations.push({
        type: 'error',
        priority: 'high',
        title: 'Fix Pinterest Sharing Issue',
        description: error,
        impact: 'pinterest-sharing',
      });
    });

    // Rich Pins recommendations
    if (!richPins.hasRichPins) {
      recommendations.push({
        type: 'enhancement',
        priority: 'medium',
        title: 'Implement Rich Pins',
        description: 'Add structured data or Open Graph tags to enable Pinterest Rich Pins',
        impact: 'pinterest-engagement',
      });
    }

    // Image optimization recommendations
    imageOptimization.recommendations.forEach(rec => {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        title: 'Optimize Images for Pinterest',
        description: rec,
        impact: 'pinterest-engagement',
      });
    });

    return recommendations;
  }

  _isDescriptiveTitle(title) {
    return title.length >= 20 && /[a-zA-Z]/.test(title);
  }

  _hasRelevantKeywords(title) {
    const actionWords = ['how', 'best', 'top', 'diy', 'easy', 'quick', 'simple'];
    return actionWords.some(word => title.toLowerCase().includes(word));
  }

  _isDescriptiveDescription(description) {
    return description.length >= 50 && description.split(' ').length >= 8;
  }

  _isHashtagFriendly(description) {
    // Check if description would work well with hashtags
    const words = description.split(' ');
    return words.length >= 10 && words.length <= 50;
  }

  _hasPinterestVerification(document) {
    const verification = document.querySelector('meta[name="p:domain_verify"]');
    return !!verification;
  }

  _isValidImageUrl(url) {
    try {
      const urlObj = new URL(url);
      return (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') &&
             /\.(jpg|jpeg|png|gif|webp)$/i.test(urlObj.pathname);
    } catch {
      return false;
    }
  }

  // ============================================================================
  // BaseAnalyzer Integration Helper Methods
  // ============================================================================

  /**
   * Calculate comprehensive Pinterest score
   * @param {Object} pinterestData - Complete Pinterest analysis data
   * @returns {number} Score (0-100)
   */
  _calculateComprehensiveScore(pinterestData) {
    const weights = {
      richPins: 0.3,
      imageOptimization: 0.25,
      contentOptimization: 0.25,
      validation: 0.2
    };
    
    // Rich Pins score
    const richPinsScore = pinterestData.richPins.hasRichPins ? 
      (pinterestData.richPins.types[pinterestData.richPins.primaryType]?.completeness || 0) : 0;
    
    // Image optimization score
    const imageScore = pinterestData.imageOptimization.optimizationScore || 0;
    
    // Content optimization score
    let contentScore = 0;
    if (pinterestData.contentOptimization.title?.optimized) contentScore += 40;
    if (pinterestData.contentOptimization.description?.optimized) contentScore += 40;
    if (pinterestData.contentOptimization.keywords?.isPinterestFriendly) contentScore += 20;
    
    // Validation score
    const validationScore = pinterestData.validation.errors.length === 0 ? 100 : 
      Math.max(0, 100 - (pinterestData.validation.errors.length * 20));
    
    const totalScore = Math.round(
      (richPinsScore * weights.richPins) +
      (imageScore * weights.imageOptimization) +
      (contentScore * weights.contentOptimization) +
      (validationScore * weights.validation)
    );
    
    return Math.min(100, Math.max(0, totalScore));
  }

  /**
   * Generate comprehensive Pinterest recommendations
   * @param {Object} pinterestData - Complete Pinterest analysis data
   * @returns {Array} Array of recommendation objects
   */
  _generatePinterestRecommendations(pinterestData) {
    const recommendations = [];
    
    // Rich Pins recommendations
    if (!pinterestData.richPins.hasRichPins) {
      recommendations.push({
        category: 'critical',
        title: 'Implement Pinterest Rich Pins',
        description: 'Add structured data or Open Graph tags to enable Pinterest Rich Pins for better engagement',
        impact: 'high',
        implementation: 'Add structured data (JSON-LD) or Open Graph meta tags for your content type'
      });
    }
    
    // Image optimization recommendations
    if (pinterestData.imageOptimization.verticalImages === 0) {
      recommendations.push({
        category: 'optimization',
        title: 'Use Vertical Images',
        description: 'Pinterest favors vertical images with 2:3 aspect ratio for better visibility',
        impact: 'high',
        implementation: 'Use images that are 600x900 pixels or similar vertical ratios'
      });
    }
    
    // Content optimization recommendations
    if (!pinterestData.contentOptimization.title?.optimized) {
      recommendations.push({
        category: 'content',
        title: 'Optimize Pinterest Title',
        description: 'Create compelling titles (20-100 characters) that work well for Pinterest sharing',
        impact: 'medium',
        implementation: 'Include action words like "How to", "Best", "DIY" in your og:title'
      });
    }
    
    if (!pinterestData.contentOptimization.description?.optimized) {
      recommendations.push({
        category: 'content',
        title: 'Optimize Pinterest Description',
        description: 'Write engaging descriptions (50-500 characters) that encourage pinning',
        impact: 'medium',
        implementation: 'Create detailed og:description that tells a story and includes relevant keywords'
      });
    }
    
    // Validation error recommendations
    pinterestData.validation.errors.forEach(error => {
      recommendations.push({
        category: 'error',
        title: 'Fix Pinterest Issue',
        description: error,
        impact: 'high',
        implementation: 'Review and fix the mentioned Pinterest optimization issue'
      });
    });
    
    // Schema markup recommendations
    if (!pinterestData.schemaAnalysis.hasRelevantSchema) {
      recommendations.push({
        category: 'enhancement',
        title: 'Add Structured Data',
        description: 'Implement structured data markup for better Pinterest Rich Pin support',
        impact: 'medium',
        implementation: 'Add JSON-LD structured data matching your content type (Article, Product, Recipe, etc.)'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate Pinterest analysis summary
   * @param {Object} pinterestData - Complete Pinterest analysis data
   * @param {number} score - Overall score
   * @returns {string} Analysis summary
   */
  _generatePinterestSummary(pinterestData, score) {
    const { richPins, imageOptimization, contentOptimization, validation } = pinterestData;
    
    if (validation.errors.length > 0) {
      return `Pinterest optimization has ${validation.errors.length} critical issue(s) that need attention for proper sharing functionality.`;
    }
    
    if (!richPins.hasRichPins) {
      return `No Pinterest Rich Pins detected. Implement structured data or Open Graph tags to enable Rich Pins for better engagement.`;
    }
    
    const completeness = pinterestData.completeness.percentage;
    
    if (score >= 90) {
      return `Excellent Pinterest optimization with Rich Pins (${richPins.primaryType}) and ${completeness}% implementation completeness.`;
    } else if (score >= 70) {
      return `Good Pinterest setup with ${richPins.primaryType} Rich Pins but could benefit from image and content optimization.`;
    } else if (score >= 50) {
      return `Basic Pinterest optimization detected. Focus on image optimization and Rich Pin implementation for better performance.`;
    } else {
      return `Limited Pinterest optimization. Implement Rich Pins, vertical images, and optimize content for Pinterest sharing.`;
    }
  }

  /**
   * Analyze schema markup for Pinterest Rich Pins
   * @param {Document} document - DOM document
   * @returns {Object} Schema analysis results
   */
  _analyzeSchemaMarkup(document) {
    const schemas = document.querySelectorAll('script[type="application/ld+json"]');
    const detectedSchemas = [];
    let hasRelevantSchema = false;
    
    schemas.forEach(script => {
      try {
        const data = JSON.parse(script.textContent);
        const schemaType = Array.isArray(data) ? data[0]?.['@type'] : data['@type'];
        
        if (schemaType && this.requiredSchemaTypes.includes(schemaType)) {
          hasRelevantSchema = true;
          detectedSchemas.push({
            type: schemaType,
            valid: true,
            data: data
          });
        }
      } catch (e) {
        // Invalid JSON
      }
    });
    
    return {
      hasRelevantSchema,
      detectedSchemas,
      supportedTypes: this.requiredSchemaTypes,
      count: detectedSchemas.length
    };
  }

  /**
   * Calculate Pinterest completeness percentage
   * @param {Object} richPins - Rich Pins analysis
   * @param {Object} validation - Validation results
   * @param {Object} schemaAnalysis - Schema analysis
   * @returns {Object} Completeness analysis
   */
  _calculatePinterestCompleteness(richPins, validation, schemaAnalysis) {
    const factors = [
      { name: 'Rich Pins', weight: 30, present: richPins.hasRichPins },
      { name: 'Open Graph Tags', weight: 25, present: this._hasOpenGraphTags(validation) },
      { name: 'Structured Data', weight: 20, present: schemaAnalysis.hasRelevantSchema },
      { name: 'Optimized Images', weight: 15, present: validation.errors.length === 0 },
      { name: 'Pinterest Verification', weight: 10, present: this._hasPinterestVerificationTag(validation) }
    ];
    
    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
    const achievedWeight = factors.reduce((sum, factor) => sum + (factor.present ? factor.weight : 0), 0);
    
    return {
      percentage: Math.round((achievedWeight / totalWeight) * 100),
      factors: factors,
      achieved: achievedWeight,
      total: totalWeight
    };
  }

  /**
   * Check if Open Graph tags are present
   * @param {Object} validation - Validation results
   * @returns {boolean} Whether Open Graph tags are present
   */
  _hasOpenGraphTags(validation) {
    return validation.warnings.some(warning => 
      !warning.includes('Missing recommended Open Graph tag')
    );
  }

  /**
   * Check if Pinterest verification tag is present
   * @param {Object} validation - Validation results
   * @returns {boolean} Whether Pinterest verification is present
   */
  _hasPinterestVerificationTag(validation) {
    return !validation.warnings.some(warning => 
      warning.includes('Pinterest domain verification')
    );
  }

  /**
   * Legacy Pinterest recommendations method for backward compatibility
   * @param {Object} richPins - Rich Pins analysis
   * @param {Object} imageOptimization - Image optimization analysis
   * @param {Object} validation - Validation results
   * @returns {Array} Array of recommendation objects
   */
  _generatePinterestRecommendationsLegacy(richPins, imageOptimization, validation) {
    const recommendations = [];

    // Error-based recommendations
    validation.errors.forEach(error => {
      recommendations.push({
        type: 'error',
        priority: 'high',
        title: 'Fix Pinterest Sharing Issue',
        description: error,
        impact: 'pinterest-sharing',
      });
    });

    // Rich Pins recommendations
    if (!richPins.hasRichPins) {
      recommendations.push({
        type: 'enhancement',
        priority: 'medium',
        title: 'Implement Rich Pins',
        description: 'Add structured data or Open Graph tags to enable Pinterest Rich Pins',
        impact: 'pinterest-engagement',
      });
    }

    // Image optimization recommendations
    if (imageOptimization.recommendations) {
      imageOptimization.recommendations.forEach(rec => {
        recommendations.push({
          type: 'optimization',
          priority: 'medium',
          title: 'Optimize Images for Pinterest',
          description: rec,
          impact: 'pinterest-engagement',
        });
      });
    }

    return recommendations;
  }

  /**
   * Calculate grade from score (fallback method)
   * @param {number} score - Score (0-100)
   * @returns {string} Grade letter
   */
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
    if (score >= 60) return 'D';
    return 'F';
  }
}
