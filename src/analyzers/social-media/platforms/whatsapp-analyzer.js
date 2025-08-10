/**
 * Enhanced WhatsApp Analyzer
 * Comprehensive analysis of WhatsApp link preview optimization with BaseAnalyzer integration
 * 
 * @extends BaseAnalyzer
 * @version 1.0.0
 * @author Nimrod Galor
 * @date 2025-08-08
 */

import { BaseAnalyzer } from '../../core/BaseAnalyzer.js';
import { AnalyzerCategories } from '../../core/AnalyzerInterface.js';

export class WhatsAppAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('WhatsAppAnalyzer', {
      enablePreviewOptimization: options.enablePreviewOptimization !== false,
      enableImageAnalysis: options.enableImageAnalysis !== false,
      enableContentValidation: options.enableContentValidation !== false,
      enableSharingAnalysis: options.enableSharingAnalysis !== false,
      strictValidation: options.strictValidation || false,
      validateImageDimensions: options.validateImageDimensions !== false,
      includeRecommendations: options.includeRecommendations !== false,
      ...options
    });

    this.version = '1.0.0';
    this.category = AnalyzerCategories.CONTENT;
    
    this.whatsappLimits = {
      title: 65,
      description: 160,
      imageSize: 300, // KB
      imageWidth: 400,
      imageHeight: 400
    };
    
    this.requiredMetaTags = ['og:title', 'og:description', 'og:image'];
    this.recommendedMetaTags = ['og:url', 'og:type', 'og:site_name'];
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'WhatsAppAnalyzer',
      version: '1.0.0',
      description: 'Comprehensive WhatsApp link preview optimization and sharing analysis',
      category: AnalyzerCategories.CONTENT,
      priority: 'high',
      capabilities: [
        'whatsapp_preview_optimization',
        'link_sharing_analysis',
        'image_preview_validation',
        'content_length_optimization',
        'social_sharing_enhancement',
        'preview_quality_assessment',
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
        this.log('WhatsApp analysis requires a valid DOM document', 'warn');
        return false;
      }

      return true;
    } catch (error) {
      this.handleError('Error validating WhatsApp analysis context', error);
      return false;
    }
  }

  /**
   * Perform comprehensive WhatsApp analysis with BaseAnalyzer integration
   * @param {Object} context - Analysis context containing DOM and page data
   * @returns {Promise<Object>} WhatsApp analysis results
   */
  async analyze(context) {
    const startTime = Date.now();
    
    try {
      this.log('Starting WhatsApp analysis', 'info');

      // Validate context
      if (!this.validate(context)) {
        return this.handleError('Invalid context for WhatsApp analysis', new Error('Context validation failed'), {
          hasWhatsAppOptimization: false,
          score: 0,
          grade: 'F'
        });
      }

      const { document, url = '', pageData = {} } = context;

      // Perform WhatsApp analysis
      const whatsappData = await this._performWhatsAppAnalysis(document, url);
      
      // Calculate comprehensive score
      const score = this._calculateComprehensiveScore(whatsappData);
      const grade = this._getGradeFromScore ? this._getGradeFromScore(score) : this._calculateGrade(score);
      
      // Generate recommendations
      const recommendations = this._generateWhatsAppRecommendations(whatsappData);
      
      // Generate summary
      const summary = this._generateWhatsAppSummary(whatsappData, score);

      const result = {
        success: true,
        data: {
          ...whatsappData,
          score,
          grade,
          recommendations,
          summary,
          metadata: this.getMetadata()
        },
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

      this.log(`WhatsApp analysis completed in ${result.executionTime}ms with score ${score}`, 'info');
      return result;

    } catch (error) {
      return this.handleError('WhatsApp analysis failed', error, {
        hasWhatsAppOptimization: false,
        score: 0,
        grade: 'F',
        summary: 'WhatsApp analysis encountered an error'
      });
    }
  }



  /**
   * Internal method to perform WhatsApp analysis
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Promise<Object>} WhatsApp analysis results
   */
  async _performWhatsAppAnalysis(document, url) {
    try {
      this.log('Analyzing WhatsApp preview optimization', 'info');
      
      const preview = this._analyzeWhatsAppPreview(document);
      const optimization = this._analyzeWhatsAppOptimization(document);
      const validation = this._validateWhatsAppTags(document);
      const sharing = this._analyzeWhatsAppSharing(document);
      const imageAnalysis = this._analyzeWhatsAppImages(document);

      const score = this._calculateWhatsAppScore(preview, optimization, sharing, validation);

      return {
        preview,
        optimization,
        validation,
        sharing,
        imageAnalysis,
        score,
        recommendations: this._generateWhatsAppRecommendationsLegacy(preview, optimization, validation),
        hasWhatsAppOptimization: preview.isOptimized || optimization.contentOptimized,
        completeness: this._calculateWhatsAppCompleteness(preview, optimization, validation)
      };
    } catch (error) {
      throw new Error(`WhatsApp analysis failed: ${error.message}`);
    }
  }

  _analyzeWhatsAppPreview(document) {
    // WhatsApp uses Open Graph tags for previews
    const title = document.querySelector('meta[property="og:title"]');
    const description = document.querySelector('meta[property="og:description"]');
    const image = document.querySelector('meta[property="og:image"]');
    const url = document.querySelector('meta[property="og:url"]');

    const preview = {
      title: title ? title.getAttribute('content') : null,
      description: description ? description.getAttribute('content') : null,
      image: image ? image.getAttribute('content') : null,
      url: url ? url.getAttribute('content') : null,
    };

    return {
      ...preview,
      hasPreview: !!(preview.title && preview.description),
      completeness: this._calculatePreviewCompleteness(preview),
      whatsappOptimized: this._isWhatsAppOptimized(preview),
    };
  }

  _analyzeWhatsAppOptimization(document) {
    const title = document.querySelector('meta[property="og:title"]');
    const description = document.querySelector('meta[property="og:description"]');
    const image = document.querySelector('meta[property="og:image"]');

    return {
      titleOptimization: this._optimizeForWhatsAppTitle(title),
      descriptionOptimization: this._optimizeForWhatsAppDescription(description),
      imageOptimization: this._optimizeForWhatsAppImage(image),
      characterLimits: this._checkCharacterLimits(title, description),
    };
  }

  _validateWhatsAppTags(document) {
    const validation = {
      errors: [],
      warnings: [],
      passed: [],
    };

    // Essential tags for WhatsApp preview
    const essentialTags = ['og:title', 'og:description', 'og:image'];
    
    essentialTags.forEach(tag => {
      const element = document.querySelector(`meta[property="${tag}"]`);
      if (!element) {
        validation.errors.push(`Missing ${tag} (required for WhatsApp preview)`);
      } else {
        const content = element.getAttribute('content');
        if (!content || content.trim() === '') {
          validation.errors.push(`Empty content for ${tag}`);
        } else {
          validation.passed.push(`Valid ${tag}`);
          this._validateWhatsAppTagContent(tag, content, validation);
        }
      }
    });

    // Check for WhatsApp-specific optimizations
    this._checkWhatsAppSpecificOptimizations(document, validation);

    return validation;
  }

  _analyzeWhatsAppSharing(document) {
    const whatsappLinks = this._findWhatsAppLinks(document);
    const shareButtons = this._findWhatsAppShareButtons(document);
    const clickToChat = this._findClickToChat(document);

    return {
      hasWhatsAppLinks: whatsappLinks.length > 0,
      whatsappLinks,
      hasShareButtons: shareButtons.length > 0,
      shareButtons,
      hasClickToChat: clickToChat.length > 0,
      clickToChat,
      sharingScore: this._calculateSharingScore(whatsappLinks, shareButtons, clickToChat),
    };
  }

  _optimizeForWhatsAppTitle(titleElement) {
    if (!titleElement) {
      return {
        present: false,
        optimized: false,
        issues: ['Missing og:title'],
      };
    }

    const title = titleElement.getAttribute('content');
    if (!title) {
      return {
        present: false,
        optimized: false,
        issues: ['Empty og:title'],
      };
    }

    const issues = [];
    let optimized = true;

    if (title.length > this.whatsappLimits.title) {
      issues.push(`Title too long (${title.length}/${this.whatsappLimits.title} characters)`);
      optimized = false;
    }

    if (title.length < 10) {
      issues.push('Title too short (minimum 10 characters recommended)');
      optimized = false;
    }

    // Check for mobile-friendly language
    if (!this._isMobileFriendlyText(title)) {
      issues.push('Title may not be mobile-friendly');
      optimized = false;
    }

    return {
      present: true,
      optimized,
      length: title.length,
      issues,
      mobileFriendly: this._isMobileFriendlyText(title),
    };
  }

  _optimizeForWhatsAppDescription(descElement) {
    if (!descElement) {
      return {
        present: false,
        optimized: false,
        issues: ['Missing og:description'],
      };
    }

    const description = descElement.getAttribute('content');
    if (!description) {
      return {
        present: false,
        optimized: false,
        issues: ['Empty og:description'],
      };
    }

    const issues = [];
    let optimized = true;

    if (description.length > this.whatsappLimits.description) {
      issues.push(`Description too long (${description.length}/${this.whatsappLimits.description} characters)`);
      optimized = false;
    }

    if (description.length < 20) {
      issues.push('Description too short (minimum 20 characters recommended)');
      optimized = false;
    }

    // Check for mobile-friendly language
    if (!this._isMobileFriendlyText(description)) {
      issues.push('Description may not be mobile-friendly');
      optimized = false;
    }

    // Check for call-to-action
    if (!this._hasCallToAction(description)) {
      issues.push('Consider adding a call-to-action for better engagement');
    }

    return {
      present: true,
      optimized,
      length: description.length,
      issues,
      mobileFriendly: this._isMobileFriendlyText(description),
      hasCallToAction: this._hasCallToAction(description),
    };
  }

  _optimizeForWhatsAppImage(imageElement) {
    if (!imageElement) {
      return {
        present: false,
        optimized: false,
        issues: ['Missing og:image'],
      };
    }

    const imageUrl = imageElement.getAttribute('content');
    if (!imageUrl) {
      return {
        present: false,
        optimized: false,
        issues: ['Empty og:image'],
      };
    }

    const issues = [];
    let optimized = true;

    // Check if image URL is valid
    if (!this._isValidImageUrl(imageUrl)) {
      issues.push('Invalid image URL');
      optimized = false;
    }

    // Check for HTTPS (WhatsApp prefers HTTPS)
    if (!imageUrl.startsWith('https://')) {
      issues.push('Image should use HTTPS for better security');
      optimized = false;
    }

    // Check for mobile-optimized dimensions
    if (!this._isMobileOptimizedImage(imageUrl)) {
      issues.push('Image may not be optimized for mobile viewing');
    }

    return {
      present: true,
      optimized,
      url: imageUrl,
      isHttps: imageUrl.startsWith('https://'),
      issues,
      mobileOptimized: this._isMobileOptimizedImage(imageUrl),
    };
  }

  _checkCharacterLimits(titleElement, descElement) {
    const limits = {
      title: {
        current: 0,
        limit: this.whatsappLimits.title,
        withinLimit: true,
      },
      description: {
        current: 0,
        limit: this.whatsappLimits.description,
        withinLimit: true,
      },
    };

    if (titleElement) {
      const title = titleElement.getAttribute('content');
      if (title) {
        limits.title.current = title.length;
        limits.title.withinLimit = title.length <= this.whatsappLimits.title;
      }
    }

    if (descElement) {
      const description = descElement.getAttribute('content');
      if (description) {
        limits.description.current = description.length;
        limits.description.withinLimit = description.length <= this.whatsappLimits.description;
      }
    }

    return limits;
  }

  _validateWhatsAppTagContent(tag, content, validation) {
    switch (tag) {
      case 'og:title':
        if (content.length > this.whatsappLimits.title) {
          validation.warnings.push(`Title exceeds WhatsApp limit (${content.length}/${this.whatsappLimits.title} characters)`);
        }
        break;

      case 'og:description':
        if (content.length > this.whatsappLimits.description) {
          validation.warnings.push(`Description exceeds WhatsApp limit (${content.length}/${this.whatsappLimits.description} characters)`);
        }
        break;

      case 'og:image':
        if (!content.startsWith('https://')) {
          validation.warnings.push('WhatsApp prefers HTTPS images for better preview quality');
        }
        break;
    }
  }

  _checkWhatsAppSpecificOptimizations(document, validation) {
    // Check for mobile viewport
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      validation.warnings.push('Missing viewport meta tag (important for mobile sharing)');
    }

    // Check for favicon (shows in some WhatsApp previews)
    const favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    if (!favicon) {
      validation.warnings.push('Missing favicon (may appear in WhatsApp previews)');
    }

    // Check for canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      validation.warnings.push('Missing canonical URL');
    }
  }

  _findWhatsAppLinks(document) {
    const links = [];
    const allLinks = document.querySelectorAll('a[href]');

    allLinks.forEach(link => {
      const href = link.href;
      if (href.includes('whatsapp.com') || href.includes('wa.me')) {
        links.push({
          url: href,
          text: link.textContent.trim(),
          type: this._identifyWhatsAppLinkType(href),
        });
      }
    });

    return links;
  }

  _findWhatsAppShareButtons(document) {
    const shareButtons = [];
    const shareSelectors = [
      '[href*="whatsapp.com/send"]',
      '[href*="wa.me"]',
      '.whatsapp-share',
      '[data-share="whatsapp"]',
      '.share-whatsapp',
    ];

    shareSelectors.forEach(selector => {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(button => {
        shareButtons.push({
          element: button.outerHTML,
          text: button.textContent.trim(),
          href: button.href,
          type: 'share-button',
        });
      });
    });

    return shareButtons;
  }

  _findClickToChat(document) {
    const chatLinks = [];
    const allLinks = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]');

    allLinks.forEach(link => {
      const href = link.href;
      if (href.includes('wa.me') || href.includes('whatsapp.com')) {
        const hasPhoneNumber = /\d{10,}/.test(href);
        if (hasPhoneNumber) {
          chatLinks.push({
            url: href,
            text: link.textContent.trim(),
            phoneNumber: this._extractPhoneNumber(href),
            type: 'click-to-chat',
          });
        }
      }
    });

    return chatLinks;
  }

  _calculatePreviewCompleteness(preview) {
    const requiredFields = ['title', 'description', 'image'];
    const presentFields = requiredFields.filter(field => preview[field]).length;
    return Math.round((presentFields / requiredFields.length) * 100);
  }

  _isWhatsAppOptimized(preview) {
    if (!preview.title || !preview.description) return false;
    
    const titleOptimized = preview.title.length <= this.whatsappLimits.title;
    const descOptimized = preview.description.length <= this.whatsappLimits.description;
    const hasImage = !!preview.image;

    return titleOptimized && descOptimized && hasImage;
  }

  _isMobileFriendlyText(text) {
    // Check for mobile-friendly characteristics
    const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(text);
    const isShort = text.length <= 100;
    const hasSimpleWords = !/[a-z]{15,}/i.test(text); // No very long words

    return isShort || hasSimpleWords || hasEmojis;
  }

  _hasCallToAction(text) {
    const ctaWords = [
      'click', 'tap', 'visit', 'check', 'see', 'read', 'learn',
      'discover', 'explore', 'find', 'get', 'download', 'share'
    ];

    return ctaWords.some(word => 
      text.toLowerCase().includes(word)
    );
  }

  _isMobileOptimizedImage(imageUrl) {
    // Basic heuristics for mobile-optimized images
    const mobileIndicators = [
      'mobile', 'responsive', 'thumb', 'small', 'preview'
    ];

    return mobileIndicators.some(indicator => 
      imageUrl.toLowerCase().includes(indicator)
    );
  }

  _identifyWhatsAppLinkType(href) {
    if (href.includes('wa.me')) return 'wa.me';
    if (href.includes('whatsapp.com/send')) return 'web-whatsapp';
    if (href.includes('whatsapp://')) return 'app-whatsapp';
    return 'unknown';
  }

  _extractPhoneNumber(url) {
    const match = url.match(/\d{10,}/);
    return match ? match[0] : null;
  }

  _calculateSharingScore(whatsappLinks, shareButtons, clickToChat) {
    let score = 0;

    if (whatsappLinks.length > 0) score += 30;
    if (shareButtons.length > 0) score += 40;
    if (clickToChat.length > 0) score += 30;

    return Math.min(100, score);
  }

  _calculateWhatsAppScore(preview, optimization, sharing, validation) {
    let score = 0;

    // Preview completeness (50%)
    score += preview.completeness * 0.5;

    // Optimization (30%)
    let optimizationScore = 0;
    if (optimization.titleOptimization?.optimized) optimizationScore += 35;
    if (optimization.descriptionOptimization?.optimized) optimizationScore += 35;
    if (optimization.imageOptimization?.optimized) optimizationScore += 30;
    
    score += optimizationScore * 0.3;

    // Sharing features (15%)
    score += sharing.sharingScore * 0.15;

    // Validation (5%)
    if (validation && validation.errors.length === 0) {
      score += 5;
    }

    return Math.round(score);
  }

  // ============================================================================
  // BaseAnalyzer Integration Helper Methods
  // ============================================================================

  /**
   * Calculate comprehensive WhatsApp score
   * @param {Object} whatsappData - Complete WhatsApp analysis data
   * @returns {number} Score (0-100)
   */
  _calculateComprehensiveScore(whatsappData) {
    const weights = {
      preview: 0.4,
      optimization: 0.3,
      validation: 0.2,
      sharing: 0.1
    };
    
    // Preview score
    const previewScore = whatsappData.preview.completeness || 0;
    
    // Optimization score
    let optimizationScore = 0;
    if (whatsappData.optimization.titleOptimization?.optimized) optimizationScore += 35;
    if (whatsappData.optimization.descriptionOptimization?.optimized) optimizationScore += 35;
    if (whatsappData.optimization.imageOptimization?.optimized) optimizationScore += 30;
    
    // Validation score
    const validationScore = whatsappData.validation.errors.length === 0 ? 100 : 
      Math.max(0, 100 - (whatsappData.validation.errors.length * 25));
    
    // Sharing score
    const sharingScore = whatsappData.sharing.sharingScore || 0;
    
    const totalScore = Math.round(
      (previewScore * weights.preview) +
      (optimizationScore * weights.optimization) +
      (validationScore * weights.validation) +
      (sharingScore * weights.sharing)
    );
    
    return Math.min(100, Math.max(0, totalScore));
  }

  /**
   * Generate comprehensive WhatsApp recommendations
   * @param {Object} whatsappData - Complete WhatsApp analysis data
   * @returns {Array} Array of recommendation objects
   */
  _generateWhatsAppRecommendations(whatsappData) {
    const recommendations = [];
    
    // Preview optimization recommendations
    if (!whatsappData.preview.isOptimized) {
      recommendations.push({
        category: 'critical',
        title: 'Optimize WhatsApp Preview',
        description: 'Implement proper Open Graph tags for optimal WhatsApp link previews',
        impact: 'high',
        implementation: 'Add og:title, og:description, and og:image meta tags'
      });
    }
    
    // Title optimization
    if (!whatsappData.optimization.titleOptimization?.optimized) {
      recommendations.push({
        category: 'optimization',
        title: 'Optimize Title Length',
        description: `Keep title under ${this.whatsappLimits.title} characters for optimal WhatsApp preview`,
        impact: 'medium',
        implementation: 'Shorten og:title to 65 characters or less'
      });
    }
    
    // Description optimization
    if (!whatsappData.optimization.descriptionOptimization?.optimized) {
      recommendations.push({
        category: 'optimization',
        title: 'Optimize Description Length',
        description: `Keep description under ${this.whatsappLimits.description} characters for optimal WhatsApp preview`,
        impact: 'medium',
        implementation: 'Optimize og:description to 160 characters or less'
      });
    }
    
    // Image optimization
    if (!whatsappData.optimization.imageOptimization?.optimized) {
      recommendations.push({
        category: 'optimization',
        title: 'Optimize Image for WhatsApp',
        description: 'Use HTTPS images with mobile-friendly dimensions (400x400px recommended)',
        impact: 'medium',
        implementation: 'Use square images with HTTPS URLs for og:image'
      });
    }
    
    // Validation error recommendations
    whatsappData.validation.errors.forEach(error => {
      recommendations.push({
        category: 'error',
        title: 'Fix WhatsApp Issue',
        description: error,
        impact: 'high',
        implementation: 'Review and fix the mentioned WhatsApp optimization issue'
      });
    });
    
    // Sharing feature recommendations
    if (whatsappData.sharing.sharingScore < 50) {
      recommendations.push({
        category: 'enhancement',
        title: 'Add WhatsApp Sharing Features',
        description: 'Implement WhatsApp share buttons or click-to-chat functionality',
        impact: 'medium',
        implementation: 'Add WhatsApp sharing buttons or click-to-chat links'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate WhatsApp analysis summary
   * @param {Object} whatsappData - Complete WhatsApp analysis data
   * @param {number} score - Overall score
   * @returns {string} Analysis summary
   */
  _generateWhatsAppSummary(whatsappData, score) {
    const { preview, optimization, validation, sharing } = whatsappData;
    
    if (validation.errors.length > 0) {
      return `WhatsApp optimization has ${validation.errors.length} critical issue(s) that affect link preview functionality.`;
    }
    
    if (!preview.isOptimized) {
      return `WhatsApp link previews not optimized. Add Open Graph meta tags to enable proper previews when shared.`;
    }
    
    const completeness = whatsappData.completeness.percentage;
    
    if (score >= 90) {
      return `Excellent WhatsApp optimization with ${completeness}% completeness and optimal link preview functionality.`;
    } else if (score >= 70) {
      return `Good WhatsApp setup with ${completeness}% completeness but could benefit from content length optimization.`;
    } else if (score >= 50) {
      return `Basic WhatsApp optimization detected. Focus on preview optimization and content length limits.`;
    } else {
      return `Limited WhatsApp optimization. Implement Open Graph tags and optimize content for mobile sharing.`;
    }
  }

  /**
   * Analyze WhatsApp image optimization
   * @param {Document} document - DOM document
   * @returns {Object} Image analysis results
   */
  _analyzeWhatsAppImages(document) {
    const ogImage = document.querySelector('meta[property="og:image"]');
    const analysis = {
      hasImage: !!ogImage,
      imageUrl: ogImage ? ogImage.getAttribute('content') : null,
      isSecure: false,
      isOptimalSize: false,
      isMobileFriendly: false,
      recommendations: []
    };
    
    if (ogImage) {
      const imageUrl = ogImage.getAttribute('content');
      analysis.isSecure = imageUrl && imageUrl.startsWith('https://');
      analysis.isMobileFriendly = this._isMobileOptimizedImage(imageUrl);
      
      if (!analysis.isSecure) {
        analysis.recommendations.push('Use HTTPS for WhatsApp image URLs');
      }
      
      if (!analysis.isMobileFriendly) {
        analysis.recommendations.push('Use square images (400x400px) for better WhatsApp previews');
      }
    } else {
      analysis.recommendations.push('Add og:image for WhatsApp link previews');
    }
    
    return analysis;
  }

  /**
   * Calculate WhatsApp completeness percentage
   * @param {Object} preview - Preview analysis
   * @param {Object} optimization - Optimization analysis
   * @param {Object} validation - Validation results
   * @returns {Object} Completeness analysis
   */
  _calculateWhatsAppCompleteness(preview, optimization, validation) {
    const factors = [
      { name: 'Open Graph Title', weight: 25, present: !!preview.title },
      { name: 'Open Graph Description', weight: 25, present: !!preview.description },
      { name: 'Open Graph Image', weight: 20, present: !!preview.image },
      { name: 'Title Optimization', weight: 15, present: optimization.titleOptimization?.optimized },
      { name: 'Description Optimization', weight: 10, present: optimization.descriptionOptimization?.optimized },
      { name: 'No Validation Errors', weight: 5, present: validation.errors.length === 0 }
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
   * Legacy WhatsApp recommendations method for backward compatibility
   * @param {Object} preview - Preview analysis
   * @param {Object} optimization - Optimization analysis
   * @param {Object} validation - Validation results
   * @returns {Array} Array of recommendation objects
   */
  _generateWhatsAppRecommendationsLegacy(preview, optimization, validation) {
    const recommendations = [];

    // Error-based recommendations
    validation.errors.forEach(error => {
      recommendations.push({
        type: 'error',
        priority: 'high',
        title: 'Fix WhatsApp Preview Issue',
        description: error,
        impact: 'whatsapp-sharing',
      });
    });

    // Optimization recommendations
    if (!optimization.titleOptimization?.optimized) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        title: 'Optimize Title for WhatsApp',
        description: `Keep title under ${this.whatsappLimits.title} characters for optimal WhatsApp preview`,
        impact: 'whatsapp-sharing',
      });
    }

    if (!optimization.descriptionOptimization?.optimized) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        title: 'Optimize Description for WhatsApp',
        description: `Keep description under ${this.whatsappLimits.description} characters for optimal WhatsApp preview`,
        impact: 'whatsapp-sharing',
      });
    }

    if (!optimization.imageOptimization?.optimized) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        title: 'Optimize Image for WhatsApp',
        description: 'Use HTTPS images and ensure mobile-friendly dimensions',
        impact: 'whatsapp-sharing',
      });
    }

    // Mobile optimization recommendations
    if (!optimization.titleOptimization?.mobileFriendly) {
      recommendations.push({
        type: 'enhancement',
        priority: 'low',
        title: 'Make Title More Mobile-Friendly',
        description: 'Use shorter, simpler words or add emojis for better mobile engagement',
        impact: 'mobile-engagement',
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
