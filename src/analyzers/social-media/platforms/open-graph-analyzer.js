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
   * @param {Object} context - Analysis context containing DOM and page data
   * @returns {Promise<Object>} Open Graph analysis results
   */
  async analyze(context) {
    const startTime = Date.now();
    
    try {
      this.log('Starting Open Graph analysis', 'info');

      // Validate context
      if (!this.validate(context)) {
        return this.handleError('Invalid context for Open Graph analysis', new Error('Context validation failed'), {
          hasOpenGraph: false,
          score: 0,
          grade: 'F'
        });
      }

      const { document, url = '', pageData = {} } = context;

      // Perform Open Graph analysis
      const ogData = await this._performOpenGraphAnalysis(document, url);
      
      // Calculate comprehensive score
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
   * Legacy method for backward compatibility
   * @deprecated Use analyze() method instead
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Promise<Object>} Open Graph analysis results
   */
  async analyzeOpenGraph(document, url) {
    console.warn('analyzeOpenGraph() is deprecated. Use analyze() method instead.');
    return this._performOpenGraphAnalysis(document, url);
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

    return {
      tags,
      completeness: this._calculateCompleteness(tags),
    };
  }

  _analyzeExtendedOG(document) {
    const extendedTags = [
      'og:image:width', 'og:image:height', 'og:image:alt',
      'article:author', 'article:published_time', 'article:modified_time',
      'product:price:amount', 'product:price:currency', 'product:availability',
      'video:url', 'video:width', 'video:height', 'video:duration',
      'audio:url', 'audio:duration',
    ];

    const tags = {};
    
    extendedTags.forEach(tag => {
      const element = document.querySelector(`meta[property="${tag}"]`);
      tags[tag] = element ? element.getAttribute('content') : null;
    });

    return {
      tags,
      hasExtended: Object.values(tags).some(value => value !== null),
      categories: this._categorizeExtendedTags(tags),
    };
  }

  _validateOGTags(document) {
    const validation = {
      errors: [],
      warnings: [],
      passed: [],
    };

    // Check required tags
    this.requiredTags.forEach(tag => {
      const element = document.querySelector(`meta[property="${tag}"]`);
      if (!element) {
        validation.errors.push(`Missing required tag: ${tag}`);
      } else {
        const content = element.getAttribute('content');
        if (!content || content.trim() === '') {
          validation.errors.push(`Empty content for tag: ${tag}`);
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

    return validation;
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
