/**
 * Enhanced Open Graph Analyzer
 * Comprehensive analysis of Open Graph meta tags with BaseAnalyzer integration
 * 
 * @extends BaseAnalyzer
 * @version 1.0.0
 * @author Nimrod Galor
 * @date 2025-08-08
 */

import { BaseAnalyzer } from '../../core/BaseAnalyzer.js';
import { AnalyzerCategories } from '../../core/AnalyzerInterface.js';

export class OpenGraphAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('OpenGraphAnalyzer', {
      enableBasicValidation: options.enableBasicValidation !== false,
      enableExtendedAnalysis: options.enableExtendedAnalysis !== false,
      enableImageValidation: options.enableImageValidation !== false,
      enableOptimizationAnalysis: options.enableOptimizationAnalysis !== false,
      strictValidation: options.strictValidation || false,
      validateImageDimensions: options.validateImageDimensions !== false,
      includeRecommendations: options.includeRecommendations !== false,
      ...options
    });

    this.version = '1.0.0';
    this.category = AnalyzerCategories.CONTENT;
    
    this.requiredTags = ['og:title', 'og:description', 'og:image', 'og:url'];
    this.recommendedTags = ['og:type', 'og:site_name', 'og:locale'];
    this.imageDimensions = {
      recommended: { width: 1200, height: 630 },
      minimum: { width: 600, height: 315 },
    };
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'OpenGraphAnalyzer',
      version: '1.0.0',
      description: 'Comprehensive Open Graph meta tag analysis for social media optimization',
      category: AnalyzerCategories.CONTENT,
      priority: 'high',
      capabilities: [
        'open_graph_validation',
        'meta_tag_analysis',
        'image_optimization_analysis',
        'social_sharing_optimization',
        'og_completeness_scoring',
        'recommendation_generation',
        'tag_validation'
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
        this.log('Open Graph analysis requires a valid DOM document', 'warn');
        return false;
      }

      return true;
    } catch (error) {
      this.handleError('Error validating Open Graph analysis context', error);
      return false;
    }
  }

  /**
   * Perform comprehensive Open Graph analysis with BaseAnalyzer integration
   * @param {Object|Document} context - Analysis context containing DOM and page data OR document for legacy support
   * @param {string} url - URL for legacy support
   * @returns {Promise<Object>} Open Graph analysis results
   */
  async analyze(context, url) {
    const startTime = Date.now();
    
    try {
      this.log('Starting Open Graph analysis', 'info');

      // Modern calling format only: analyze({document, url, pageData})
      if (!this.validate(context)) {
        return this.handleError('Invalid context for Open Graph analysis', new Error('Context validation failed'), {
          hasOpenGraph: false,
          score: 0,
          grade: 'F'
        });
      }

      // Optimized property access - avoid destructuring overhead
      const document = context.document;
      const actualUrl = context.url || '';
      const pageData = context.pageData || {};

      // Perform Open Graph analysis
      const ogData = await this._performOpenGraphAnalysis(document, actualUrl);
      
      // Always return BaseAnalyzer format
      const score = this._calculateComprehensiveScore(ogData);
      const grade = this._getGradeFromScore(score);
      
      // Generate recommendations
      const recommendations = this._generateOpenGraphRecommendations(ogData);
      
      // Generate summary
      const summary = this._generateOpenGraphSummary(ogData, score);

      const result = {
        success: true,
        data: {
          ...ogData,
          score,
          grade,
          recommendations,
          summary,
          metadata: this.getMetadata()
        },
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

      this.log(`Open Graph analysis completed in ${result.executionTime}ms with score ${score}`, 'info');
      return result;

    } catch (error) {
      return this.handleError('Open Graph analysis failed', error, {
        hasOpenGraph: false,
        score: 0,
        grade: 'F',
        summary: 'Open Graph analysis encountered an error'
      });
    }
  }



  /**
   * Internal method to perform Open Graph analysis
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Promise<Object>} Open Graph analysis results
   */
  async _performOpenGraphAnalysis(document, url) {
    try {
      this.log('Analyzing Open Graph tags', 'info');
      
      const basic = this._analyzeBasicOG(document);
      const extended = this._analyzeExtendedOG(document);
      const validation = this._validateOGTags(document);
      const optimization = this._checkOptimization(document, url);

      const score = this._calculateOGScore(basic, extended, validation);

      return {
        basic,
        extended,
        validation,
        optimization,
        score,
        recommendations: this._generateOGRecommendations(validation, optimization),
        hasOpenGraph: Object.keys(basic.tags).some(tag => basic.tags[tag] !== null),
        completeness: basic.completeness
      };
    } catch (error) {
      throw new Error(`Open Graph analysis failed: ${error.message}`);
    }
  }

  _analyzeBasicOG(document) {
    const tags = {};
    
    this.requiredTags.forEach(tag => {
      const element = document.querySelector(`meta[property="${tag}"]`);
      tags[tag] = element ? element.getAttribute('content') : null;
    });

    this.recommendedTags.forEach(tag => {
      const element = document.querySelector(`meta[property="${tag}"]`);
      tags[tag] = element ? element.getAttribute('content') : null;
    });

    // Return flat structure for test compatibility
    return {
      tags,
      completeness: this._calculateCompleteness(tags),
      // Flat properties expected by tests
      title: tags['og:title'],
      description: tags['og:description'],
      image: tags['og:image'],
      url: tags['og:url'],
      type: tags['og:type'],
      siteName: tags['og:site_name'],
      locale: tags['og:locale']
    };
  }

  _analyzeExtendedOG(document) {
    const extendedTags = [
      'og:image:width', 'og:image:height', 'og:image:alt',
      'article:author', 'article:published_time', 'article:modified_time', 'article:section', 'article:tag',
      'product:price:amount', 'product:price:currency', 'product:availability',
      'video:url', 'video:width', 'video:height', 'video:duration',
      'audio:url', 'audio:duration',
    ];

    const tags = {};
    
    extendedTags.forEach(tag => {
      const element = document.querySelector(`meta[property="${tag}"]`);
      tags[tag] = element ? element.getAttribute('content') : null;
    });

    // Handle multiple article:tag values
    const articleTagElements = document.querySelectorAll('meta[property="article:tag"]');
    const articleTags = Array.from(articleTagElements).map(el => el.getAttribute('content')).filter(Boolean);

    return {
      tags,
      hasExtended: Object.values(tags).some(value => value !== null),
      categories: this._categorizeExtendedTags(tags),
      // Structure expected by tests
      article: {
        author: tags['article:author'],
        publishedTime: tags['article:published_time'],
        modifiedTime: tags['article:modified_time'],
        section: tags['article:section'],
        tags: articleTags.length > 0 ? articleTags : (tags['article:tag'] ? [tags['article:tag']] : [])
      },
      product: {
        price: {
          amount: tags['product:price:amount'],
          currency: tags['product:price:currency']
        },
        availability: tags['product:availability']
      }
    };
  }

  _validateOGTags(document) {
    const validation = {
      errors: [],
      warnings: [],
      passed: [],
    };

    const missingRequired = [];

    // Check required tags
    this.requiredTags.forEach(tag => {
      const element = document.querySelector(`meta[property="${tag}"]`);
      if (!element) {
        validation.errors.push(`Missing required tag: ${tag}`);
        // Extract property name without 'og:' prefix for missingRequired array
        const propName = tag.replace('og:', '');
        missingRequired.push(propName);
      } else {
        const content = element.getAttribute('content');
        if (!content || content.trim() === '') {
          validation.errors.push(`Empty content for tag: ${tag}`);
          const propName = tag.replace('og:', '');
          missingRequired.push(propName);
        } else {
          validation.passed.push(`Valid ${tag}`);
          this._validateTagContent(tag, content, validation);
        }
      }
    });

    // Check recommended tags
    this.recommendedTags.forEach(tag => {
      const element = document.querySelector(`meta[property="${tag}"]`);
      if (!element) {
        validation.warnings.push(`Missing recommended tag: ${tag}`);
      } else {
        validation.passed.push(`Present ${tag}`);
      }
    });

    // Add properties expected by tests
    return {
      ...validation,
      hasRequired: missingRequired.length === 0,
      missingRequired
    };
  }

  _validateTagContent(tag, content, validation) {
    switch (tag) {
      case 'og:title':
        if (content.length < 10) {
          validation.warnings.push('og:title is too short (minimum 10 characters)');
        } else if (content.length > 60) {
          validation.warnings.push('og:title is too long (maximum 60 characters)');
        }
        break;

      case 'og:description':
        if (content.length < 20) {
          validation.warnings.push('og:description is too short (minimum 20 characters)');
        } else if (content.length > 160) {
          validation.warnings.push('og:description is too long (maximum 160 characters)');
        }
        break;

      case 'og:image':
        if (!this._isValidImageUrl(content)) {
          validation.warnings.push('og:image URL may not be valid');
        }
        break;

      case 'og:url':
        if (!this._isValidUrl(content)) {
          validation.errors.push('og:url is not a valid URL');
        }
        break;
    }
  }

  _checkOptimization(document, url) {
    const optimization = {
      imageOptimization: this._checkImageOptimization(document),
      contentOptimization: this._checkContentOptimization(document),
      structureOptimization: this._checkStructureOptimization(document),
      localeSupport: this._checkLocaleSupport(document),
    };

    return optimization;
  }

  _checkImageOptimization(document) {
    const image = document.querySelector('meta[property="og:image"]');
    const imageWidth = document.querySelector('meta[property="og:image:width"]');
    const imageHeight = document.querySelector('meta[property="og:image:height"]');
    const imageAlt = document.querySelector('meta[property="og:image:alt"]');

    const optimization = {
      hasImage: !!image,
      hasDimensions: !!(imageWidth && imageHeight),
      hasAltText: !!imageAlt,
      recommendations: [],
    };

    if (!image) {
      optimization.recommendations.push('Add og:image meta tag');
    }

    if (!optimization.hasDimensions) {
      optimization.recommendations.push('Add og:image:width and og:image:height meta tags');
    }

    if (!optimization.hasAltText) {
      optimization.recommendations.push('Add og:image:alt meta tag for accessibility');
    }

    if (imageWidth && imageHeight) {
      const width = parseInt(imageWidth.getAttribute('content'));
      const height = parseInt(imageHeight.getAttribute('content'));
      
      if (width < this.imageDimensions.minimum.width || height < this.imageDimensions.minimum.height) {
        optimization.recommendations.push('Image dimensions are below recommended minimum (600x315)');
      }
    }

    return optimization;
  }

  _checkContentOptimization(document) {
    const title = document.querySelector('meta[property="og:title"]');
    const description = document.querySelector('meta[property="og:description"]');
    const pageTitle = document.querySelector('title');

    const optimization = {
      titleOptimized: false,
      descriptionOptimized: false,
      uniqueFromPageTitle: false,
      recommendations: [],
    };

    if (title) {
      const content = title.getAttribute('content');
      optimization.titleOptimized = content.length >= 10 && content.length <= 60;
      
      if (pageTitle) {
        optimization.uniqueFromPageTitle = content !== pageTitle.textContent.trim();
      }
    }

    if (description) {
      const content = description.getAttribute('content');
      optimization.descriptionOptimized = content.length >= 20 && content.length <= 160;
    }

    if (!optimization.titleOptimized) {
      optimization.recommendations.push('Optimize og:title length (10-60 characters)');
    }

    if (!optimization.descriptionOptimized) {
      optimization.recommendations.push('Optimize og:description length (20-160 characters)');
    }

    if (!optimization.uniqueFromPageTitle) {
      optimization.recommendations.push('Make og:title unique from page title');
    }

    return optimization;
  }

  _checkStructureOptimization(document) {
    const type = document.querySelector('meta[property="og:type"]');
    const siteName = document.querySelector('meta[property="og:site_name"]');
    const locale = document.querySelector('meta[property="og:locale"]');

    return {
      hasType: !!type,
      hasSiteName: !!siteName,
      hasLocale: !!locale,
      structureScore: [type, siteName, locale].filter(Boolean).length * 33.33,
    };
  }

  _checkLocaleSupport(document) {
    const locale = document.querySelector('meta[property="og:locale"]');
    const alternateLocales = document.querySelectorAll('meta[property="og:locale:alternate"]');

    return {
      hasLocale: !!locale,
      hasAlternates: alternateLocales.length > 0,
      alternateCount: alternateLocales.length,
      locales: Array.from(alternateLocales).map(el => el.getAttribute('content')),
    };
  }

  _calculateCompleteness(tags) {
    const requiredPresent = this.requiredTags.filter(tag => tags[tag]).length;
    const recommendedPresent = this.recommendedTags.filter(tag => tags[tag]).length;
    
    const requiredScore = (requiredPresent / this.requiredTags.length) * 70;
    const recommendedScore = (recommendedPresent / this.recommendedTags.length) * 30;
    
    return Math.round(requiredScore + recommendedScore);
  }

  _calculateOGScore(basic, extended, validation) {
    let score = basic.completeness;

    // Bonus for extended tags
    if (extended.hasExtended) {
      score += 10;
    }

    // Penalty for errors
    score -= validation.errors.length * 10;

    // Minor penalty for warnings
    score -= validation.warnings.length * 2;

    return Math.max(0, Math.min(100, score));
  }

  _categorizeExtendedTags(tags) {
    const categories = {
      article: [],
      product: [],
      video: [],
      audio: [],
      image: [],
    };

    Object.entries(tags).forEach(([tag, value]) => {
      if (value) {
        if (tag.startsWith('article:')) categories.article.push(tag);
        else if (tag.startsWith('product:')) categories.product.push(tag);
        else if (tag.startsWith('video:')) categories.video.push(tag);
        else if (tag.startsWith('audio:')) categories.audio.push(tag);
        else if (tag.includes('image')) categories.image.push(tag);
      }
    });

    return categories;
  }

  _generateOGRecommendations(validation, optimization) {
    const recommendations = [];

    // High priority recommendations from errors
    validation.errors.forEach(error => {
      recommendations.push({
        type: 'error',
        priority: 'high',
        title: 'Fix Open Graph Error',
        description: error,
        impact: 'social-sharing',
      });
    });

    // Medium priority from warnings
    validation.warnings.forEach(warning => {
      recommendations.push({
        type: 'warning',
        priority: 'medium',
        title: 'Improve Open Graph',
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
            title: 'Optimize Open Graph',
            description: rec,
            impact: 'social-sharing',
          });
        });
      }
    });

    return recommendations;
  }

  _isValidImageUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  _isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // BaseAnalyzer integration helper methods

  /**
   * Calculate comprehensive Open Graph score for BaseAnalyzer integration
   */
  _calculateComprehensiveScore(ogData) {
    try {
      if (!ogData || !ogData.hasOpenGraph) {
        return 0; // No Open Graph tags = 0 score
      }

      if (ogData.score !== undefined) {
        return Math.round(ogData.score);
      }

      // Fallback calculation if score not available
      let score = ogData.completeness || 0;

      // Bonus for extended features
      if (ogData.extended && ogData.extended.hasExtended) {
        score += 10;
      }

      // Penalty for validation errors
      if (ogData.validation && ogData.validation.errors) {
        score -= ogData.validation.errors.length * 10;
      }

      // Minor penalty for warnings
      if (ogData.validation && ogData.validation.warnings) {
        score -= ogData.validation.warnings.length * 5;
      }

      return Math.max(0, Math.min(100, Math.round(score)));
    } catch (error) {
      this.handleError('Error calculating comprehensive Open Graph score', error);
      return 0;
    }
  }

  /**
   * Get grade from score
   */
  _getGradeFromScore(score) {
    try {
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
    } catch (error) {
      this.handleError('Error calculating Open Graph grade', error);
      return 'F';
    }
  }

  /**
   * Generate Open Graph recommendations
   */
  _generateOpenGraphRecommendations(ogData) {
    try {
      const recommendations = [];

      if (!ogData.hasOpenGraph) {
        recommendations.push({
          type: 'critical',
          title: 'Add Open Graph Tags',
          description: 'Implement basic Open Graph meta tags for social media sharing',
          priority: 'high',
          impact: 'High - Essential for social media optimization'
        });
        return recommendations;
      }

      // Required tag recommendations
      const missingRequired = this.requiredTags.filter(tag => 
        !ogData.basic || !ogData.basic.tags || !ogData.basic.tags[tag]
      );

      missingRequired.forEach(tag => {
        recommendations.push({
          type: 'required',
          title: `Add Required ${tag} Tag`,
          description: `Implement ${tag} meta tag for complete Open Graph support`,
          priority: 'high',
          impact: 'High - Required for proper social sharing'
        });
      });

      // Validation error recommendations
      if (ogData.validation && ogData.validation.errors && ogData.validation.errors.length > 0) {
        recommendations.push({
          type: 'validation',
          title: 'Fix Open Graph Validation Errors',
          description: `${ogData.validation.errors.length} validation error(s) detected`,
          priority: 'high',
          impact: 'High - Prevents proper social media parsing'
        });
      }

      // Optimization recommendations
      if (ogData.optimization) {
        Object.values(ogData.optimization).forEach(opt => {
          if (opt && opt.recommendations && Array.isArray(opt.recommendations)) {
            opt.recommendations.forEach(rec => {
              recommendations.push({
                type: 'optimization',
                title: 'Optimize Open Graph Content',
                description: rec,
                priority: 'medium',
                impact: 'Medium - Improves social sharing quality'
              });
            });
          }
        });
      }

      // Warning recommendations
      if (ogData.validation && ogData.validation.warnings && ogData.validation.warnings.length > 0) {
        recommendations.push({
          type: 'warning',
          title: 'Address Open Graph Warnings',
          description: `${ogData.validation.warnings.length} warning(s) detected`,
          priority: 'low',
          impact: 'Low - Minor improvements for better compliance'
        });
      }

      return recommendations.slice(0, 8); // Limit to top 8 recommendations
    } catch (error) {
      this.handleError('Error generating Open Graph recommendations', error);
      return [];
    }
  }

  /**
   * Generate Open Graph summary
   */
  _generateOpenGraphSummary(ogData, score) {
    try {
      const grade = this._getGradeFromScore(score);
      
      if (!ogData.hasOpenGraph) {
        return 'No Open Graph meta tags detected. Implementing Open Graph tags is essential for social media optimization.';
      }

      let summary = `Open Graph analysis completed with ${grade} grade (${score}/100 score). `;
      
      // Add completeness information
      if (ogData.completeness !== undefined) {
        summary += `Tag completeness: ${ogData.completeness}%. `;
      }

      // Add required tags status
      const requiredCount = this.requiredTags.filter(tag => 
        ogData.basic && ogData.basic.tags && ogData.basic.tags[tag]
      ).length;
      summary += `Required tags: ${requiredCount}/${this.requiredTags.length} implemented. `;

      // Add validation status
      let issueCount = 0;
      if (ogData.validation) {
        issueCount = (ogData.validation.errors ? ogData.validation.errors.length : 0) + 
                    (ogData.validation.warnings ? ogData.validation.warnings.length : 0);
      }

      if (issueCount === 0) {
        summary += 'No validation issues detected.';
      } else {
        summary += `${issueCount} validation issue${issueCount > 1 ? 's' : ''} requiring attention.`;
      }

      return summary;
    } catch (error) {
      this.handleError('Error generating Open Graph summary', error);
      return 'Open Graph analysis completed with errors.';
    }
  }

  /**
   * Validate Open Graph title
   * @param {string} title - Title to validate
   * @returns {Object} Validation result
   */
  _validateTitle(title) {
    const result = {
      isOptimal: true,
      issues: [],
      recommendations: []
    };

    if (!title || title.trim().length === 0) {
      result.isOptimal = false;
      result.issues.push('Title is empty');
      result.recommendations.push('Add og:title meta tag');
      return result;
    }

    const length = title.length;
    if (length < 30) {
      result.isOptimal = false;
      result.issues.push('Title too short');
      result.recommendations.push('Use a more descriptive title (30-60 characters recommended)');
    } else if (length > 60) {
      result.isOptimal = false;
      result.issues.push('Title too long');
      result.recommendations.push('Shorten title to 60 characters or less for optimal display');
    }

    return result;
  }

  /**
   * Validate Open Graph description
   * @param {string} description - Description to validate
   * @returns {Object} Validation result
   */
  _validateDescription(description) {
    const result = {
      isOptimal: true,
      issues: [],
      recommendations: []
    };

    if (!description || description.trim().length === 0) {
      result.isOptimal = false;
      result.issues.push('Description is empty');
      result.recommendations.push('Add og:description meta tag');
      return result;
    }

    const length = description.length;
    if (length < 50) {
      result.isOptimal = false;
      result.issues.push('Description too short');
      result.recommendations.push('Use a more detailed description (100-160 characters recommended)');
    } else if (length > 300) {
      result.isOptimal = false;
      result.issues.push('Description too long');
      result.recommendations.push('Shorten description to 300 characters or less');
    }

    return result;
  }

  /**
   * Validate Open Graph image
   * @param {string} image - Image URL to validate
   * @returns {Object} Validation result
   */
  _validateImage(image) {
    const result = {
      isValid: true,
      issues: [],
      recommendations: []
    };

    if (!image || image.trim().length === 0) {
      result.isValid = false;
      result.issues.push('Image URL is empty');
      result.recommendations.push('Add og:image meta tag with valid image URL');
      return result;
    }

    try {
      const url = new URL(image);
      if (url.protocol !== 'https:') {
        result.isValid = false;
        result.issues.push('Image URL is not HTTPS');
        result.recommendations.push('Use HTTPS URL for better security and compatibility');
      }
    } catch (error) {
      result.isValid = false;
      result.issues.push('Invalid image URL format');
      result.recommendations.push('Provide a valid absolute URL for the image');
    }

    return result;
  }

  /**
   * Validate Open Graph URL
   * @param {string} url - URL to validate
   * @param {string} pageUrl - Current page URL for consistency check
   * @returns {Object} Validation result
   */
  _validateUrl(url, pageUrl) {
    const result = {
      isValid: true,
      isConsistent: true,
      issues: [],
      recommendations: []
    };

    if (!url || url.trim().length === 0) {
      result.isValid = false;
      result.issues.push('URL is empty');
      result.recommendations.push('Add og:url meta tag');
      return result;
    }

    try {
      const ogUrl = new URL(url);
      if (pageUrl) {
        const currentUrl = new URL(pageUrl);
        if (ogUrl.hostname !== currentUrl.hostname) {
          result.isConsistent = false;
          result.issues.push('URL domain does not match current page');
          result.recommendations.push('Ensure og:url matches the current page domain');
        }
      }
    } catch (error) {
      result.isValid = false;
      result.issues.push('Invalid URL format');
      result.recommendations.push('Provide a valid absolute URL');
    }

    return result;
  }

  /**
   * Analyze localization metadata
   * @param {Document} document - DOM document
   * @returns {Object} Localization analysis
   */
  _analyzeLocalization(document) {
    const localeElement = document.querySelector('meta[property="og:locale"]');
    const alternateElements = document.querySelectorAll('meta[property="og:locale:alternate"]');
    
    return {
      primaryLocale: localeElement ? localeElement.getAttribute('content') : null,
      alternateLocales: Array.from(alternateElements).map(el => el.getAttribute('content')),
      hasLocale: !!localeElement,
      hasAlternates: alternateElements.length > 0,
      alternateCount: alternateElements.length
    };
  }

  /**
   * Analyze image properties
   * @param {Document} document - DOM document
   * @returns {Object} Image analysis
   */
  _analyzeImageProperties(document) {
    const images = document.querySelectorAll('meta[property^="og:image"]');
    const imageData = [];

    images.forEach(img => {
      const property = img.getAttribute('property');
      const content = img.getAttribute('content');
      
      if (property === 'og:image') {
        imageData.push({
          url: content,
          width: null,
          height: null,
          type: null,
          alt: null
        });
      }
    });

    return {
      images: imageData,
      count: imageData.length,
      hasImages: imageData.length > 0
    };
  }

  /**
   * Analyze video properties
   * @param {Document} document - DOM document
   * @returns {Object} Video analysis
   */
  _analyzeVideoProperties(document) {
    const videos = document.querySelectorAll('meta[property^="og:video"]');
    const videoData = [];

    videos.forEach(video => {
      const property = video.getAttribute('property');
      const content = video.getAttribute('content');
      
      if (property === 'og:video') {
        videoData.push({
          url: content,
          type: null,
          width: null,
          height: null
        });
      }
    });

    return {
      videos: videoData,
      count: videoData.length,
      hasVideos: videoData.length > 0
    };
  }

  /**
   * Calculate Open Graph score
   * @param {Object} analysis - Complete analysis data
   * @returns {number} Score from 0-100
   */
  _calculateScore(analysis) {
    let score = 100;

    // Required fields (40 points total)
    if (!analysis.basic?.title) score -= 15;
    if (!analysis.basic?.description) score -= 10;
    if (!analysis.basic?.image) score -= 10;
    if (!analysis.basic?.url) score -= 5;

    // Validation issues (30 points)
    if (analysis.validation?.errors?.length > 0) {
      score -= Math.min(30, analysis.validation.errors.length * 10);
    }

    // Optimization (30 points)
    if (analysis.optimization) {
      const optimizations = Object.values(analysis.optimization);
      const totalOptimizations = optimizations.length;
      const failedOptimizations = optimizations.filter(opt => 
        opt && typeof opt === 'object' && opt.recommendations && opt.recommendations.length > 0
      ).length;
      
      if (totalOptimizations > 0) {
        score -= (failedOptimizations / totalOptimizations) * 30;
      }
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * Create error result for consistency
   */
  createErrorResult(message) {
    return {
      success: false,
      error: message,
      data: {
        hasOpenGraph: false,
        score: 0,
        grade: 'F',
        summary: `Open Graph analysis failed: ${message}`,
        metadata: this.getMetadata()
      }
    };
  }
}
