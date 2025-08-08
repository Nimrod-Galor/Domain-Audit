/**
 * Social Media Utility Functions
 * Helper functions for social media analysis and optimization
 */

import { SOCIAL_MEDIA_STANDARDS } from './social-constants.js';

/**
 * URL and Image Utilities
 */
export class URLUtils {
  /**
   * Validates if a URL is properly formatted
   * @param {string} url - URL to validate
   * @returns {boolean} - True if valid URL
   */
  static isValidURL(url) {
    if (!url || typeof url !== 'string') return false;
    try {
      new URL(url);
      return SOCIAL_MEDIA_STANDARDS.REGEX_PATTERNS.URL.test(url);
    } catch {
      return false;
    }
  }

  /**
   * Validates if a URL points to an image
   * @param {string} url - URL to validate
   * @returns {boolean} - True if valid image URL
   */
  static isValidImageURL(url) {
    return this.isValidURL(url) && 
           SOCIAL_MEDIA_STANDARDS.REGEX_PATTERNS.IMAGE_URL.test(url);
  }

  /**
   * Converts relative URL to absolute URL
   * @param {string} relativeUrl - Relative URL
   * @param {string} baseUrl - Base URL
   * @returns {string} - Absolute URL
   */
  static makeAbsoluteURL(relativeUrl, baseUrl) {
    if (!relativeUrl) return '';
    if (this.isValidURL(relativeUrl)) return relativeUrl;
    
    try {
      return new URL(relativeUrl, baseUrl).href;
    } catch {
      return relativeUrl;
    }
  }

  /**
   * Extracts domain from URL
   * @param {string} url - URL to extract domain from
   * @returns {string} - Domain name
   */
  static extractDomain(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return '';
    }
  }
}

/**
 * Content Analysis Utilities
 */
export class ContentUtils {
  /**
   * Validates content length against standards
   * @param {string} content - Content to validate
   * @param {Object} standards - Length standards
   * @returns {Object} - Validation result
   */
  static validateLength(content, standards) {
    const length = content ? content.length : 0;
    
    return {
      length,
      isValid: length >= (standards.MIN_LENGTH || 0) && 
               length <= (standards.MAX_LENGTH || Infinity),
      isOptimal: length >= (standards.MIN_LENGTH || 0) && 
                 length <= (standards.OPTIMAL_LENGTH || standards.MAX_LENGTH || Infinity),
      recommendation: this.getLengthRecommendation(length, standards),
    };
  }

  /**
   * Gets length recommendation message
   * @param {number} length - Current length
   * @param {Object} standards - Length standards
   * @returns {string} - Recommendation message
   */
  static getLengthRecommendation(length, standards) {
    if (length < (standards.MIN_LENGTH || 0)) {
      return `Content too short. Add ${standards.MIN_LENGTH - length} more characters.`;
    }
    if (length > (standards.MAX_LENGTH || Infinity)) {
      return `Content too long. Remove ${length - standards.MAX_LENGTH} characters.`;
    }
    if (length > (standards.OPTIMAL_LENGTH || standards.MAX_LENGTH || Infinity)) {
      return `Consider shortening for optimal engagement.`;
    }
    return 'Length is optimal.';
  }

  /**
   * Analyzes content quality and engagement potential
   * @param {string} content - Content to analyze
   * @returns {Object} - Quality analysis
   */
  static analyzeContentQuality(content) {
    if (!content) return { score: 0, factors: [] };

    const factors = [];
    let score = 0;

    // Check for professional keywords
    const professionalKeywords = this.findKeywords(
      content, 
      SOCIAL_MEDIA_STANDARDS.CONTENT_QUALITY.PROFESSIONAL_KEYWORDS
    );
    if (professionalKeywords.length > 0) {
      score += 20;
      factors.push({
        type: 'professional_keywords',
        score: 20,
        keywords: professionalKeywords,
      });
    }

    // Check for engagement keywords
    const engagementKeywords = this.findKeywords(
      content, 
      SOCIAL_MEDIA_STANDARDS.CONTENT_QUALITY.ENGAGEMENT_KEYWORDS
    );
    if (engagementKeywords.length > 0) {
      score += 15;
      factors.push({
        type: 'engagement_keywords',
        score: 15,
        keywords: engagementKeywords,
      });
    }

    // Check for trust indicators
    const trustIndicators = this.findKeywords(
      content, 
      SOCIAL_MEDIA_STANDARDS.CONTENT_QUALITY.TRUST_INDICATORS
    );
    if (trustIndicators.length > 0) {
      score += 25;
      factors.push({
        type: 'trust_indicators',
        score: 25,
        keywords: trustIndicators,
      });
    }

    // Check for emotional appeal
    const hasEmotionalWords = /\b(amazing|incredible|outstanding|excellent|fantastic|wonderful|perfect|love|excited|thrilled)\b/i.test(content);
    if (hasEmotionalWords) {
      score += 10;
      factors.push({
        type: 'emotional_appeal',
        score: 10,
      });
    }

    // Check for call-to-action
    const hasCallToAction = /\b(click|visit|learn|discover|download|subscribe|join|contact|call|get|start|try|buy|shop)\b/i.test(content);
    if (hasCallToAction) {
      score += 15;
      factors.push({
        type: 'call_to_action',
        score: 15,
      });
    }

    // Check for numbers/statistics
    const hasNumbers = /\d+%|\d+\+|\d+x|#\d+|\d+\s*(million|thousand|billion)/i.test(content);
    if (hasNumbers) {
      score += 10;
      factors.push({
        type: 'statistics',
        score: 10,
      });
    }

    // Penalize for all caps (appears spammy)
    if (content === content.toUpperCase() && content.length > 10) {
      score -= 15;
      factors.push({
        type: 'all_caps_penalty',
        score: -15,
      });
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      factors,
      grade: this.getQualityGrade(score),
    };
  }

  /**
   * Finds keywords in content
   * @param {string} content - Content to search
   * @param {Array} keywords - Keywords to find
   * @returns {Array} - Found keywords
   */
  static findKeywords(content, keywords) {
    if (!content) return [];
    const lowerContent = content.toLowerCase();
    return keywords.filter(keyword => 
      lowerContent.includes(keyword.toLowerCase())
    );
  }

  /**
   * Gets quality grade based on score
   * @param {number} score - Quality score
   * @returns {string} - Quality grade
   */
  static getQualityGrade(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 20) return 'Poor';
    return 'Very Poor';
  }

  /**
   * Extracts hashtags from content
   * @param {string} content - Content to analyze
   * @returns {Array} - Found hashtags
   */
  static extractHashtags(content) {
    if (!content) return [];
    const matches = content.match(SOCIAL_MEDIA_STANDARDS.REGEX_PATTERNS.HASHTAG);
    return matches || [];
  }

  /**
   * Counts emojis in content
   * @param {string} content - Content to analyze
   * @returns {number} - Number of emojis
   */
  static countEmojis(content) {
    if (!content) return 0;
    const matches = content.match(SOCIAL_MEDIA_STANDARDS.REGEX_PATTERNS.EMOJI);
    return matches ? matches.length : 0;
  }
}

/**
 * Image Analysis Utilities
 */
export class ImageUtils {
  /**
   * Validates image dimensions against standards
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @param {Object} standards - Dimension standards
   * @returns {Object} - Validation result
   */
  static validateDimensions(width, height, standards) {
    const aspectRatio = width / height;
    const targetRatio = this.parseAspectRatio(standards.ASPECT_RATIO);
    
    return {
      width,
      height,
      aspectRatio: Math.round(aspectRatio * 100) / 100,
      isValidSize: width >= (standards.MIN_WIDTH || 0) && 
                   height >= (standards.MIN_HEIGHT || 0),
      isRecommendedSize: width >= (standards.RECOMMENDED_WIDTH || 0) && 
                         height >= (standards.RECOMMENDED_HEIGHT || 0),
      aspectRatioMatch: targetRatio ? Math.abs(aspectRatio - targetRatio) < 0.1 : true,
      recommendations: this.getDimensionRecommendations(width, height, standards),
    };
  }

  /**
   * Parses aspect ratio string to number
   * @param {string} ratio - Aspect ratio (e.g., "16:9")
   * @returns {number} - Numeric ratio
   */
  static parseAspectRatio(ratio) {
    if (!ratio || typeof ratio !== 'string') return null;
    const parts = ratio.split(':');
    if (parts.length !== 2) return null;
    return parseFloat(parts[0]) / parseFloat(parts[1]);
  }

  /**
   * Gets dimension recommendations
   * @param {number} width - Current width
   * @param {number} height - Current height
   * @param {Object} standards - Dimension standards
   * @returns {Array} - Recommendations
   */
  static getDimensionRecommendations(width, height, standards) {
    const recommendations = [];
    
    if (width < (standards.MIN_WIDTH || 0)) {
      recommendations.push(`Increase width to at least ${standards.MIN_WIDTH}px`);
    }
    if (height < (standards.MIN_HEIGHT || 0)) {
      recommendations.push(`Increase height to at least ${standards.MIN_HEIGHT}px`);
    }
    if (standards.RECOMMENDED_WIDTH && width < standards.RECOMMENDED_WIDTH) {
      recommendations.push(`Recommended width: ${standards.RECOMMENDED_WIDTH}px for best quality`);
    }
    if (standards.RECOMMENDED_HEIGHT && height < standards.RECOMMENDED_HEIGHT) {
      recommendations.push(`Recommended height: ${standards.RECOMMENDED_HEIGHT}px for best quality`);
    }
    
    return recommendations;
  }

  /**
   * Checks if image format is supported
   * @param {string} url - Image URL
   * @returns {Object} - Format validation
   */
  static validateImageFormat(url) {
    if (!url) return { isValid: false, format: null };
    
    const extension = url.split('.').pop().toLowerCase().split('?')[0];
    const isSupported = SOCIAL_MEDIA_STANDARDS.IMAGE_FORMATS.SUPPORTED.includes(extension);
    const isPreferred = SOCIAL_MEDIA_STANDARDS.IMAGE_FORMATS.PREFERRED.includes(extension);
    
    return {
      isValid: isSupported,
      format: extension,
      isPreferred,
      recommendation: isSupported 
        ? (isPreferred ? 'Format is optimal' : 'Consider using JPG, PNG, or WebP for better compatibility')
        : 'Unsupported format. Use JPG, PNG, or WebP instead',
    };
  }
}

/**
 * Platform Detection Utilities
 */
export class PlatformUtils {
  /**
   * Detects social media platforms from content or URLs
   * @param {string} content - Content to analyze
   * @param {Array} urls - URLs to check
   * @returns {Array} - Detected platforms
   */
  static detectPlatforms(content = '', urls = []) {
    const platforms = [];
    const allContent = content + ' ' + urls.join(' ');
    
    Object.entries(SOCIAL_MEDIA_STANDARDS.PLATFORMS).forEach(([platform, config]) => {
      const detected = config.DOMAINS.some(domain => 
        allContent.toLowerCase().includes(domain)
      );
      
      if (detected) {
        platforms.push({
          name: platform.toLowerCase(),
          confidence: 'high',
          source: 'domain_detection',
        });
      }
    });
    
    return platforms;
  }

  /**
   * Detects sharing buttons on page
   * @param {Document} document - DOM document
   * @returns {Object} - Sharing button analysis
   */
  static detectSharingButtons(document) {
    const shareButtons = {
      total: 0,
      platforms: {},
      elements: [],
    };

    SOCIAL_MEDIA_STANDARDS.SHARE_SELECTORS.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          shareButtons.total++;
          shareButtons.elements.push({
            element,
            selector,
            href: element.href || '',
            text: element.textContent?.trim() || '',
          });

          // Detect platform from href or classes
          const platform = this.detectPlatformFromElement(element);
          if (platform) {
            shareButtons.platforms[platform] = (shareButtons.platforms[platform] || 0) + 1;
          }
        });
      } catch (error) {
        // Skip invalid selectors
      }
    });

    return shareButtons;
  }

  /**
   * Detects platform from element attributes
   * @param {Element} element - DOM element
   * @returns {string|null} - Platform name
   */
  static detectPlatformFromElement(element) {
    const href = element.href || '';
    const className = element.className || '';
    const dataAttrs = Array.from(element.attributes)
      .filter(attr => attr.name.startsWith('data-'))
      .map(attr => attr.value)
      .join(' ');
    
    const allText = (href + ' ' + className + ' ' + dataAttrs).toLowerCase();
    
    for (const [platform, config] of Object.entries(SOCIAL_MEDIA_STANDARDS.PLATFORMS)) {
      if (config.DOMAINS.some(domain => allText.includes(domain)) ||
          config.ICONS.some(icon => allText.includes(icon.toLowerCase()))) {
        return platform.toLowerCase();
      }
    }
    
    return null;
  }
}

/**
 * Scoring and Optimization Utilities
 */
export class ScoreUtils {
  /**
   * Calculates weighted score
   * @param {Object} scores - Individual scores
   * @param {Object} weights - Score weights
   * @returns {number} - Weighted total score
   */
  static calculateWeightedScore(scores, weights) {
    let totalScore = 0;
    let totalWeight = 0;
    
    Object.entries(weights).forEach(([key, weight]) => {
      if (scores[key] !== undefined) {
        totalScore += scores[key] * weight;
        totalWeight += weight;
      }
    });
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  /**
   * Gets score grade and color
   * @param {number} score - Numeric score (0-100)
   * @returns {Object} - Grade information
   */
  static getScoreGrade(score) {
    if (score >= 90) return { grade: 'A+', color: '#4CAF50', level: 'excellent' };
    if (score >= 80) return { grade: 'A', color: '#8BC34A', level: 'very_good' };
    if (score >= 70) return { grade: 'B', color: '#CDDC39', level: 'good' };
    if (score >= 60) return { grade: 'C', color: '#FFC107', level: 'fair' };
    if (score >= 50) return { grade: 'D', color: '#FF9800', level: 'poor' };
    return { grade: 'F', color: '#F44336', level: 'very_poor' };
  }

  /**
   * Prioritizes optimization recommendations
   * @param {Array} recommendations - List of recommendations
   * @returns {Array} - Prioritized recommendations
   */
  static prioritizeRecommendations(recommendations) {
    const priorityOrder = ['critical', 'high', 'medium', 'low'];
    
    return recommendations.sort((a, b) => {
      const aPriority = priorityOrder.indexOf(a.priority || 'low');
      const bPriority = priorityOrder.indexOf(b.priority || 'low');
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Secondary sort by impact score
      return (b.impact || 0) - (a.impact || 0);
    });
  }
}

/**
 * Performance Utilities
 */
export class PerformanceUtils {
  /**
   * Creates a timeout wrapper for analysis functions
   * @param {Function} fn - Function to wrap
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Function} - Wrapped function
   */
  static withTimeout(fn, timeout = SOCIAL_MEDIA_STANDARDS.PERFORMANCE.ANALYSIS_TIME_LIMIT) {
    return async (...args) => {
      return Promise.race([
        fn(...args),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Analysis timeout')), timeout)
        ),
      ]);
    };
  }

  /**
   * Limits the number of elements processed
   * @param {Array|NodeList} elements - Elements to process
   * @param {number} maxElements - Maximum elements to process
   * @returns {Array} - Limited elements array
   */
  static limitElements(elements, maxElements = SOCIAL_MEDIA_STANDARDS.PERFORMANCE.MAX_ELEMENTS_TO_ANALYZE) {
    return Array.from(elements).slice(0, maxElements);
  }

  /**
   * Truncates text for analysis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} - Truncated text
   */
  static limitText(text, maxLength = SOCIAL_MEDIA_STANDARDS.PERFORMANCE.MAX_TEXT_LENGTH_TO_ANALYZE) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}

/**
 * Accessibility Utilities
 */
export class AccessibilityUtils {
  /**
   * Checks if element meets accessibility standards
   * @param {Element} element - DOM element
   * @returns {Object} - Accessibility analysis
   */
  static analyzeAccessibility(element) {
    const issues = [];
    const suggestions = [];
    
    // Check for alt text on images
    if (element.tagName === 'IMG' && !element.alt) {
      issues.push({
        type: 'missing_alt_text',
        severity: 'high',
        message: 'Image missing alt text',
      });
    }
    
    // Check for proper heading structure
    if (/^H[1-6]$/.test(element.tagName)) {
      const level = parseInt(element.tagName[1]);
      // Check if heading content is descriptive
      if (element.textContent.length < 3) {
        issues.push({
          type: 'poor_heading_content',
          severity: 'medium',
          message: 'Heading content too brief',
        });
      }
    }
    
    // Check for keyboard accessibility
    if (element.tagName === 'A' || element.tagName === 'BUTTON') {
      if (!element.textContent.trim() && !element.getAttribute('aria-label')) {
        issues.push({
          type: 'missing_accessible_name',
          severity: 'high',
          message: 'Interactive element missing accessible name',
        });
      }
    }
    
    return {
      isAccessible: issues.length === 0,
      issues,
      suggestions,
      score: Math.max(0, 100 - (issues.length * 20)),
    };
  }
}

// Export all utilities as default object
export default {
  URLUtils,
  ContentUtils,
  ImageUtils,
  PlatformUtils,
  ScoreUtils,
  PerformanceUtils,
  AccessibilityUtils,
};
