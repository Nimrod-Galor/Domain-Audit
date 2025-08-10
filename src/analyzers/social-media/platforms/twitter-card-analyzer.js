/**
 * Enhanced Twitter Card Analyzer
 * Comprehensive analysis of Twitter Card meta tags with BaseAnalyzer integration
 * 
 * @extends BaseAnalyzer
 * @version 1.0.0
 * @author Nimrod Galor
 * @date 2025-08-08
 */

import { BaseAnalyzer } from '../../core/BaseAnalyzer.js';
import { AnalyzerInterface } from '../../core/AnalyzerInterface.js';

export class TwitterCardAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('TwitterCardAnalyzer', {
      enableBasicValidation: options.enableBasicValidation !== false,
      enableCardTypeAnalysis: options.enableCardTypeAnalysis !== false,
      enableImageValidation: options.enableImageValidation !== false,
      enableOptimizationAnalysis: options.enableOptimizationAnalysis !== false,
      strictValidation: options.strictValidation || false,
      validateImageDimensions: options.validateImageDimensions !== false,
      includeRecommendations: options.includeRecommendations !== false,
      ...options
    });

    this.version = '1.0.0';
    this.category = 'CONTENT';
    
    this.cardTypes = ['summary', 'summary_large_image', 'app', 'player'];
    this.requiredTags = ['twitter:card'];
    this.recommendedTags = ['twitter:site', 'twitter:creator', 'twitter:title', 'twitter:description', 'twitter:image'];
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'TwitterCardAnalyzer',
      version: '1.0.0',
      description: 'Comprehensive Twitter Card meta tag analysis for social media optimization',
      category: 'CONTENT',
      priority: 'high',
      capabilities: [
        'twitter_card_validation',
        'card_type_analysis',
        'meta_tag_validation',
        'image_optimization_analysis',
        'twitter_sharing_optimization',
        'card_completeness_scoring',
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
        this.log('Twitter Card analysis requires a valid DOM document', 'warn');
        return false;
      }

      return true;
    } catch (error) {
      this.handleError('Error validating Twitter Card analysis context', error);
      return false;
    }
  }

  /**
   * Perform comprehensive Twitter Card analysis with BaseAnalyzer integration
   * @param {Object} context - Analysis context containing DOM and page data
   * @returns {Promise<Object>} Twitter Card analysis results
   */
  async analyze(context) {
    const startTime = Date.now();
    
    try {
      this.log('Starting Twitter Card analysis', 'info');

      // Validate context
      if (!this.validate(context)) {
        return this.handleError('Invalid context for Twitter Card analysis', new Error('Context validation failed'), {
          hasTwitterCard: false,
          score: 0,
          grade: 'F'
        });
      }

      const { document, url = '', pageData = {} } = context;

      // Perform Twitter Card analysis
      const twitterData = await this._performTwitterCardAnalysis(document, url);
      
      // Calculate comprehensive score
      const score = this._calculateComprehensiveScore(twitterData);
      const grade = this._getGradeFromScore ? this._getGradeFromScore(score) : this._calculateGrade(score);
      
      // Generate recommendations
      const recommendations = this._generateTwitterCardRecommendations(twitterData);
      
      // Generate summary
      const summary = this._generateTwitterCardSummary(twitterData, score);

      const result = {
        success: true,
        data: {
          ...twitterData,
          score,
          grade,
          recommendations,
          summary,
          metadata: this.getMetadata()
        },
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

      this.log(`Twitter Card analysis completed in ${result.executionTime}ms with score ${score}`, 'info');
      return result;

    } catch (error) {
      return this.handleError('Twitter Card analysis failed', error, {
        hasTwitterCard: false,
        score: 0,
        grade: 'F',
        summary: 'Twitter Card analysis encountered an error'
      });
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use analyze() method instead
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Promise<Object>} Twitter Card analysis results
   */
  async analyzeTwitterCard(document, url) {
    console.warn('analyzeTwitterCard() is deprecated. Use analyze() method instead.');
    return this._performTwitterCardAnalysis(document, url);
  }

  /**
   * Internal method to perform Twitter Card analysis
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Promise<Object>} Twitter Card analysis results
   */
  async _performTwitterCardAnalysis(document, url) {
    try {
      this.log('Analyzing Twitter Card tags', 'info');
      
      const basic = this._analyzeBasicTwitter(document);
      const cardType = this._analyzeCardType(document);
      const validation = this._validateTwitterTags(document);
      const optimizationData = this._checkTwitterOptimization(document, url);

      // Convert optimization data to expected format
      const optimization = {
        optimizations: [],
        recommendations: [],
        score: 0
      };

      // Process optimization data
      if (optimizationData.imageOptimization) {
        optimization.optimizations.push({
          type: 'image',
          ...optimizationData.imageOptimization
        });
        if (optimizationData.imageOptimization.recommendations) {
          optimization.recommendations.push(...optimizationData.imageOptimization.recommendations);
        }
      }

      if (optimizationData.contentOptimization) {
        optimization.optimizations.push({
          type: 'content',
          ...optimizationData.contentOptimization
        });
        if (optimizationData.contentOptimization.recommendations) {
          optimization.recommendations.push(...optimizationData.contentOptimization.recommendations);
        }
      }

      if (optimizationData.accountOptimization) {
        optimization.optimizations.push({
          type: 'account',
          ...optimizationData.accountOptimization
        });
        if (optimizationData.accountOptimization.recommendations) {
          optimization.recommendations.push(...optimizationData.accountOptimization.recommendations);
        }
      }

      if (optimizationData.dimensionOptimization) {
        optimization.optimizations.push({
          type: 'dimension',
          ...optimizationData.dimensionOptimization
        });
        if (optimizationData.dimensionOptimization.recommendations) {
          optimization.recommendations.push(...optimizationData.dimensionOptimization.recommendations);
        }
      }

      optimization.score = this._calculateOptimizationScore(optimization.optimizations, optimization.recommendations);

      const score = this._calculateTwitterScore(basic, cardType, validation);

      return {
        basic,
        cardType,
        validation,
        optimization,
        score,
        recommendations: this._generateTwitterRecommendations(validation, optimization, cardType),
        hasTwitterCard: basic.hasBasicTags,
        completeness: basic.completeness
      };
    } catch (error) {
      throw new Error(`Twitter Card analysis failed: ${error.message}`);
    }
  }

  _analyzeBasicTwitter(document) {
    const tags = this._extractTwitterTags(document);
    const hasBasicTags = !!tags['twitter:card'];
    
    const completeness = this._calculateTagCompleteness(tags);
    
    return {
      hasBasicTags,
      tags,
      completeness: {
        percentage: completeness.percentage,
        found: completeness.found,
        total: completeness.total,
        missing: completeness.missing
      }
    };
  }

  _analyzeCardType(document) {
    const cardElement = document.querySelector('meta[name="twitter:card"]');
    const cardType = cardElement ? cardElement.getAttribute('content') : '';
    const isValidType = this.cardTypes.includes(cardType);
    
    const requiredForType = this._getRequiredTagsForType(cardType);
    const hasRequiredTags = this._checkRequiredTags(document, requiredForType);
    
    return {
      type: cardType,
      isValid: isValidType,
      validTypes: this.cardTypes,
      requiredTags: requiredForType,
      hasRequiredTags,
      missingRequiredTags: requiredForType.filter(tag => {
        const element = document.querySelector(`meta[name="${tag}"]`);
        return !element || !element.getAttribute('content');
      }),
      compliance: cardType ? this._checkCardCompliance(document, cardType) : null
    };
  }

  /**
   * Validate Twitter Card tags
   * @param {Document} document - DOM document
   * @returns {Object} Validation results
   */
  _validateTwitterTags(document) {
    const tags = this._extractTwitterTags(document);
    const issues = [];
    const warnings = [];
    
    // Check required tags
    this.requiredTags.forEach(tag => {
      if (!tags[tag]) {
        issues.push(`Missing required tag: ${tag}`);
      }
    });
    
    // Check tag values
    if (tags['twitter:card'] && !this.cardTypes.includes(tags['twitter:card'])) {
      issues.push(`Invalid card type: ${tags['twitter:card']}`);
    }
    
    // Check image requirements
    if (tags['twitter:card'] === 'summary_large_image' && !tags['twitter:image']) {
      issues.push('Large image card requires twitter:image');
    }
    
    // Check description length
    if (tags['twitter:description'] && tags['twitter:description'].length > 200) {
      warnings.push('Twitter description exceeds 200 characters');
    }
    
    // Check title length
    if (tags['twitter:title'] && tags['twitter:title'].length > 70) {
      warnings.push('Twitter title exceeds 70 characters');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      warnings,
      tagCount: Object.keys(tags).length
    };
  }

  _validateCardSpecificTags(document, cardType, validation) {
    switch (cardType) {
      case 'summary':
      case 'summary_large_image':
        this._validateSummaryCard(document, validation);
        break;
      case 'app':
        this._validateAppCard(document, validation);
        break;
      case 'player':
        this._validatePlayerCard(document, validation);
        break;
    }
  }

  _validateSummaryCard(document, validation) {
    const requiredForSummary = ['twitter:title', 'twitter:description'];
    
    requiredForSummary.forEach(tag => {
      const element = document.querySelector(`meta[name="${tag}"]`);
      if (!element) {
        validation.errors.push(`Missing required tag for summary card: ${tag}`);
      }
    });

    // Check for image
    const image = document.querySelector('meta[name="twitter:image"]');
    if (!image) {
      validation.warnings.push('Missing twitter:image (recommended for summary cards)');
    }
  }

  _validateAppCard(document, validation) {
    const appTags = [
      'twitter:app:name:iphone',
      'twitter:app:id:iphone',
      'twitter:app:name:ipad',
      'twitter:app:id:ipad',
      'twitter:app:name:googleplay',
      'twitter:app:id:googleplay',
    ];

    const hasAnyAppTag = appTags.some(tag => 
      document.querySelector(`meta[name="${tag}"]`)
    );

    if (!hasAnyAppTag) {
      validation.errors.push('App card requires at least one app store tag');
    }
  }

  _validatePlayerCard(document, validation) {
    const playerTags = ['twitter:player', 'twitter:player:width', 'twitter:player:height'];
    
    playerTags.forEach(tag => {
      const element = document.querySelector(`meta[name="${tag}"]`);
      if (!element) {
        validation.errors.push(`Missing required tag for player card: ${tag}`);
      }
    });
  }

  _validateTagContent(tag, content, validation) {
    switch (tag) {
      case 'twitter:title':
        if (content.length > 70) {
          validation.warnings.push('twitter:title is too long (maximum 70 characters)');
        }
        break;

      case 'twitter:description':
        if (content.length > 200) {
          validation.warnings.push('twitter:description is too long (maximum 200 characters)');
        }
        break;

      case 'twitter:image':
        if (!this._isValidImageUrl(content)) {
          validation.warnings.push('twitter:image URL may not be valid');
        }
        break;

      case 'twitter:site':
      case 'twitter:creator':
        if (!content.startsWith('@')) {
          validation.warnings.push(`${tag} should start with @`);
        }
        break;
    }
  }

  _checkTwitterOptimization(document, url) {
    return {
      imageOptimization: this._checkTwitterImageOptimization(document),
      contentOptimization: this._checkTwitterContentOptimization(document),
      accountOptimization: this._checkTwitterAccountOptimization(document),
      dimensionOptimization: this._checkTwitterDimensionOptimization(document),
    };
  }

  _checkTwitterImageOptimization(document) {
    const image = document.querySelector('meta[name="twitter:image"]');
    const imageAlt = document.querySelector('meta[name="twitter:image:alt"]');
    const cardType = document.querySelector('meta[name="twitter:card"]')?.getAttribute('content');

    const optimization = {
      hasImage: !!image,
      hasImageAlt: !!imageAlt,
      cardTypeOptimal: false,
      recommendations: [],
    };

    if (!image) {
      optimization.recommendations.push('Add twitter:image meta tag');
    }

    if (!imageAlt) {
      optimization.recommendations.push('Add twitter:image:alt for accessibility');
    }

    if (cardType === 'summary' && image) {
      optimization.recommendations.push('Consider using summary_large_image for better visual impact');
    }

    optimization.cardTypeOptimal = cardType === 'summary_large_image' && image;

    return optimization;
  }

  _checkTwitterContentOptimization(document) {
    const title = document.querySelector('meta[name="twitter:title"]');
    const description = document.querySelector('meta[name="twitter:description"]');

    const optimization = {
      titleOptimized: false,
      descriptionOptimized: false,
      recommendations: [],
    };

    if (title) {
      const content = title.getAttribute('content');
      optimization.titleOptimized = content.length <= 70;
    } else {
      optimization.recommendations.push('Add twitter:title meta tag');
    }

    if (description) {
      const content = description.getAttribute('content');
      optimization.descriptionOptimized = content.length <= 200;
    } else {
      optimization.recommendations.push('Add twitter:description meta tag');
    }

    return optimization;
  }

  _checkTwitterAccountOptimization(document) {
    const site = document.querySelector('meta[name="twitter:site"]');
    const creator = document.querySelector('meta[name="twitter:creator"]');

    const optimization = {
      hasSite: !!site,
      hasCreator: !!creator,
      recommendations: [],
    };

    if (!site) {
      optimization.recommendations.push('Add twitter:site meta tag with your Twitter handle');
    }

    if (!creator) {
      optimization.recommendations.push('Add twitter:creator meta tag for content attribution');
    }

    return optimization;
  }

  _checkTwitterDimensionOptimization(document) {
    const cardType = document.querySelector('meta[name="twitter:card"]')?.getAttribute('content');
    
    const optimization = {
      cardType,
      optimalDimensions: this._getOptimalDimensions(cardType),
      recommendations: [],
    };

    if (cardType === 'summary') {
      optimization.recommendations.push('Summary cards work best with square images (1:1 ratio)');
    } else if (cardType === 'summary_large_image') {
      optimization.recommendations.push('Large image cards work best with 2:1 ratio images (1200x600)');
    }

    return optimization;
  }

  _getCardRequirements(cardType) {
    const requirements = {
      summary: ['twitter:title', 'twitter:description'],
      summary_large_image: ['twitter:title', 'twitter:description', 'twitter:image'],
      app: ['twitter:app:name', 'twitter:app:id'],
      player: ['twitter:player', 'twitter:player:width', 'twitter:player:height'],
    };

    return requirements[cardType] || [];
  }

  _checkCardCompliance(document, cardType) {
    const requirements = this._getCardRequirements(cardType);
    const compliance = {
      required: requirements.length,
      present: 0,
      missing: [],
    };

    requirements.forEach(tag => {
      const element = document.querySelector(`meta[name="${tag}"]`);
      if (element && element.getAttribute('content')) {
        compliance.present++;
      } else {
        compliance.missing.push(tag);
      }
    });

    compliance.percentage = (compliance.present / compliance.required) * 100;

    return compliance;
  }

  _hasBasicTags(tags) {
    return this.requiredTags.every(tag => tags[tag]);
  }

  _calculateTwitterCompleteness(tags) {
    const requiredPresent = this.requiredTags.filter(tag => tags[tag]).length;
    const recommendedPresent = this.recommendedTags.filter(tag => tags[tag]).length;
    
    const requiredScore = (requiredPresent / this.requiredTags.length) * 60;
    const recommendedScore = (recommendedPresent / this.recommendedTags.length) * 40;
    
    return Math.round(requiredScore + recommendedScore);
  }

  _calculateTwitterScore(basic, cardType, validation) {
    let score = basic.completeness;

    // Bonus for valid card type
    if (cardType.isValid) {
      score += 10;
    }

    // Bonus for card compliance
    if (cardType.compliance) {
      score += (cardType.compliance.percentage / 100) * 20;
    }

    // Penalty for errors
    score -= validation.errors.length * 15;

    // Minor penalty for warnings
    score -= validation.warnings.length * 3;

    return Math.max(0, Math.min(100, score));
  }

  _generateTwitterRecommendations(validation, optimization, cardType) {
    const recommendations = [];

    // High priority from errors
    validation.errors.forEach(error => {
      recommendations.push({
        type: 'error',
        priority: 'high',
        title: 'Fix Twitter Card Error',
        description: error,
        impact: 'social-sharing',
      });
    });

    // Medium priority from warnings
    validation.warnings.forEach(warning => {
      recommendations.push({
        type: 'warning',
        priority: 'medium',
        title: 'Improve Twitter Card',
        description: warning,
        impact: 'social-sharing',
      });
    });

    // Optimization recommendations
    Object.values(optimization).forEach(opt => {
      if (opt.recommendations) {
        opt.recommendations.forEach(rec => {
          recommendations.push({
            type: 'optimization',
            priority: 'low',
            title: 'Optimize Twitter Card',
            description: rec,
            impact: 'social-sharing',
          });
        });
      }
    });

    return recommendations;
  }

  _getOptimalDimensions(cardType) {
    const dimensions = {
      summary: { width: 120, height: 120, ratio: '1:1' },
      summary_large_image: { width: 1200, height: 600, ratio: '2:1' },
      app: { width: 120, height: 120, ratio: '1:1' },
      player: { width: 435, height: 250, ratio: 'variable' },
    };

    return dimensions[cardType] || dimensions.summary;
  }

  _isValidImageUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Calculate comprehensive Twitter Card score
   * @param {Object} twitterData - Complete Twitter Card analysis data
   * @returns {number} Score (0-100)
   */
  _calculateComprehensiveScore(twitterData) {
    const weights = {
      basic: 0.25,
      cardType: 0.25,
      validation: 0.25,
      optimization: 0.25
    };
    
    const basicScore = twitterData.basic.hasBasicTags ? 
      (twitterData.basic.completeness.percentage * 0.7 + 30) : 0;
    
    const cardTypeScore = twitterData.cardType.isValid ? 
      (twitterData.cardType.hasRequiredTags ? 100 : 70) : 0;
    
    const validationScore = twitterData.validation.isValid ? 
      Math.max(0, 100 - (twitterData.validation.issues.length * 10)) : 0;
    
    const optimizationScore = twitterData.optimization.score || 0;
    
    const totalScore = Math.round(
      (basicScore * weights.basic) +
      (cardTypeScore * weights.cardType) +
      (validationScore * weights.validation) +
      (optimizationScore * weights.optimization)
    );
    
    return Math.min(100, Math.max(0, totalScore));
  }

  /**
   * Generate comprehensive Twitter Card recommendations
   * @param {Object} twitterData - Complete Twitter Card analysis data
   * @returns {Array} Array of recommendation objects
   */
  _generateTwitterCardRecommendations(twitterData) {
    const recommendations = [];
    
    // Basic recommendations
    if (!twitterData.basic.hasBasicTags) {
      recommendations.push({
        category: 'critical',
        title: 'Add Twitter Card Tags',
        description: 'Implement basic Twitter Card meta tags for social media sharing',
        impact: 'high',
        implementation: 'Add <meta name="twitter:card" content="summary"> to your page head'
      });
    }
    
    // Card type recommendations
    if (!twitterData.cardType.isValid) {
      recommendations.push({
        category: 'critical',
        title: 'Fix Twitter Card Type',
        description: `Use a valid Twitter Card type: ${this.cardTypes.join(', ')}`,
        impact: 'high',
        implementation: `Change twitter:card to one of: ${this.cardTypes.join(', ')}`
      });
    }
    
    // Validation recommendations
    twitterData.validation.issues.forEach(issue => {
      recommendations.push({
        category: 'error',
        title: 'Fix Twitter Card Issue',
        description: issue,
        impact: 'medium',
        implementation: 'Review and fix the mentioned Twitter Card tag issue'
      });
    });
    
    // Optimization recommendations
    twitterData.optimization.recommendations.forEach(rec => {
      recommendations.push({
        category: 'optimization',
        title: 'Twitter Card Optimization',
        description: rec,
        impact: 'medium',
        implementation: 'Follow the optimization recommendation'
      });
    });
    
    return recommendations;
  }

  /**
   * Generate Twitter Card analysis summary
   * @param {Object} twitterData - Complete Twitter Card analysis data
   * @param {number} score - Overall score
   * @returns {string} Analysis summary
   */
  _generateTwitterCardSummary(twitterData, score) {
    const { basic, cardType, validation } = twitterData;
    
    if (!basic.hasBasicTags) {
      return `No Twitter Card implementation found. Add basic Twitter Card meta tags to enable social media sharing optimization.`;
    }
    
    if (!cardType.isValid) {
      return `Twitter Card found but uses invalid card type "${cardType.type}". Use a valid card type: ${this.cardTypes.join(', ')}.`;
    }
    
    if (!validation.isValid) {
      return `Twitter Card implementation has ${validation.issues.length} critical issue(s) that need attention for proper functionality.`;
    }
    
    const completeness = basic.completeness.percentage;
    
    if (score >= 90) {
      return `Excellent Twitter Card implementation with ${completeness}% tag completeness and proper optimization.`;
    } else if (score >= 70) {
      return `Good Twitter Card setup with ${completeness}% completeness but could benefit from additional optimization.`;
    } else {
      return `Basic Twitter Card implementation with ${completeness}% completeness. Consider adding more tags and optimization.`;
    }
  }

  // ============================================================================
  // BaseAnalyzer Integration Helper Methods
  // ============================================================================

  /**
   * Extract all Twitter Card meta tags from document
   * @param {Document} document - DOM document
   * @returns {Object} Twitter Card tags object
   */
  _extractTwitterTags(document) {
    const tags = {};
    
    // Get all Twitter Card meta tags
    const twitterMetas = document.querySelectorAll('meta[name^="twitter:"]');
    twitterMetas.forEach(meta => {
      const name = meta.getAttribute('name');
      const content = meta.getAttribute('content');
      if (name && content) {
        tags[name] = content.trim();
      }
    });
    
    return tags;
  }

  /**
   * Calculate tag completeness percentage
   * @param {Object} tags - Twitter Card tags
   * @returns {Object} Completeness analysis
   */
  _calculateTagCompleteness(tags) {
    const allTags = [...this.requiredTags, ...this.recommendedTags];
    const foundTags = allTags.filter(tag => tags[tag] && tags[tag].trim() !== '');
    
    return {
      percentage: Math.round((foundTags.length / allTags.length) * 100),
      found: foundTags.length,
      total: allTags.length,
      missing: allTags.filter(tag => !tags[tag] || tags[tag].trim() === '')
    };
  }

  /**
   * Get required tags for specific card type
   * @param {string} cardType - Twitter Card type
   * @returns {Array} Required tags for the card type
   */
  _getRequiredTagsForType(cardType) {
    const typeRequirements = {
      'summary': ['twitter:card', 'twitter:title', 'twitter:description'],
      'summary_large_image': ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'],
      'app': ['twitter:card', 'twitter:app:name:iphone', 'twitter:app:id:iphone'],
      'player': ['twitter:card', 'twitter:player', 'twitter:player:width', 'twitter:player:height']
    };
    
    return typeRequirements[cardType] || this.requiredTags;
  }

  /**
   * Check if document has required tags for card type
   * @param {Document} document - DOM document
   * @param {Array} requiredTags - Required tags to check
   * @returns {boolean} Whether all required tags are present
   */
  _checkRequiredTags(document, requiredTags) {
    return requiredTags.every(tag => {
      const element = document.querySelector(`meta[name="${tag}"]`);
      return element && element.getAttribute('content') && element.getAttribute('content').trim() !== '';
    });
  }

  /**
   * Check image optimization for Twitter Cards
   * @param {string} imageUrl - Image URL
   * @returns {Object} Image optimization analysis
   */
  _checkImageOptimization(imageUrl) {
    const optimization = {
      hasImage: !!imageUrl,
      isSecure: false,
      hasValidFormat: false,
      recommendations: []
    };
    
    if (imageUrl) {
      optimization.isSecure = imageUrl.startsWith('https://');
      optimization.hasValidFormat = /\.(jpg|jpeg|png|gif|webp)$/i.test(imageUrl);
      
      if (!optimization.isSecure) {
        optimization.recommendations.push('Use HTTPS for Twitter Card images');
      }
      
      if (!optimization.hasValidFormat) {
        optimization.recommendations.push('Use standard image formats (JPG, PNG, GIF, WebP)');
      }
    } else {
      optimization.recommendations.push('Add twitter:image for better social sharing');
    }
    
    return optimization;
  }

  /**
   * Check content uniqueness compared to standard meta tags
   * @param {Document} document - DOM document
   * @param {Object} twitterTags - Twitter Card tags
   * @returns {Object} Content uniqueness analysis
   */
  _checkContentUniqueness(document, twitterTags) {
    const uniqueness = {
      titleUnique: false,
      descriptionUnique: false,
      recommendations: []
    };
    
    // Check title uniqueness
    const pageTitle = this.safeQuery(document, 'title', 'textContent', '');
    const ogTitle = this.safeQuery(document, 'meta[property="og:title"]', 'content', '');
    const twitterTitle = twitterTags['twitter:title'] || '';
    
    uniqueness.titleUnique = twitterTitle !== pageTitle && twitterTitle !== ogTitle;
    
    // Check description uniqueness
    const metaDescription = this.safeQuery(document, 'meta[name="description"]', 'content', '');
    const ogDescription = this.safeQuery(document, 'meta[property="og:description"]', 'content', '');
    const twitterDescription = twitterTags['twitter:description'] || '';
    
    uniqueness.descriptionUnique = twitterDescription !== metaDescription && twitterDescription !== ogDescription;
    
    if (!uniqueness.titleUnique && twitterTitle) {
      uniqueness.recommendations.push('Consider unique Twitter Card title different from page/OG title');
    }
    
    if (!uniqueness.descriptionUnique && twitterDescription) {
      uniqueness.recommendations.push('Consider unique Twitter Card description different from meta/OG description');
    }
    
    return uniqueness;
  }

  /**
   * Calculate optimization score
   * @param {Array} optimizations - Optimization results
   * @param {Array} recommendations - Recommendations array
   * @returns {number} Optimization score (0-100)
   */
  _calculateOptimizationScore(optimizations, recommendations) {
    let score = 100;
    
    // Reduce score for each recommendation
    score -= recommendations.length * 10;
    
    // Check optimization results
    optimizations.forEach(opt => {
      if (opt.type === 'image' && opt.recommendations) {
        score -= opt.recommendations.length * 5;
      }
      if (opt.type === 'content' && opt.recommendations) {
        score -= opt.recommendations.length * 3;
      }
    });
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate Twitter score using legacy method for backward compatibility
   * @param {Object} basic - Basic analysis results
   * @param {Object} cardType - Card type analysis results
   * @param {Object} validation - Validation results
   * @returns {number} Twitter Card score (0-100)
   */
  _calculateTwitterScore(basic, cardType, validation) {
    let score = (basic && basic.completeness && basic.completeness.percentage) || 0;

    // Bonus for valid card type
    if (cardType && cardType.isValid) {
      score += 10;
    }

    // Bonus for card compliance
    if (cardType && cardType.compliance && cardType.compliance.percentage) {
      score += (cardType.compliance.percentage / 100) * 20;
    }

    // Penalty for errors
    if (validation && validation.issues && Array.isArray(validation.issues)) {
      score -= validation.issues.length * 15;
    }

    // Minor penalty for warnings
    if (validation && validation.warnings && Array.isArray(validation.warnings)) {
      score -= validation.warnings.length * 3;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate Twitter recommendations using legacy method for backward compatibility
   * @param {Object} validation - Validation results
   * @param {Object} optimization - Optimization results
   * @param {Object} cardType - Card type analysis results
   * @returns {Array} Array of recommendation objects
   */
  _generateTwitterRecommendations(validation, optimization, cardType) {
    const recommendations = [];

    // High priority from errors/issues
    if (validation && validation.issues && Array.isArray(validation.issues)) {
      validation.issues.forEach(issue => {
        recommendations.push({
          type: 'error',
          priority: 'high',
          title: 'Fix Twitter Card Error',
          description: issue,
          impact: 'social-sharing',
        });
      });
    }

    // Medium priority from warnings
    if (validation && validation.warnings && Array.isArray(validation.warnings)) {
      validation.warnings.forEach(warning => {
        recommendations.push({
          type: 'warning',
          priority: 'medium',
          title: 'Improve Twitter Card',
          description: warning,
          impact: 'social-sharing',
        });
      });
    }

    // Optimization recommendations
    if (optimization && optimization.recommendations && Array.isArray(optimization.recommendations)) {
      optimization.recommendations.forEach(rec => {
        recommendations.push({
          type: 'optimization',
          priority: 'low',
          title: 'Optimize Twitter Card',
          description: rec,
          impact: 'social-sharing',
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

export default TwitterCardAnalyzer;
