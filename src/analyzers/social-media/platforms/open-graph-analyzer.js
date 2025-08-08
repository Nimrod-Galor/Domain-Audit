/**
 * Enhanced Open Graph Analyzer
 * Comprehensive analysis of Open Graph meta tags
 */

export class OpenGraphAnalyzer {
  constructor(options = {}) {
    this.options = options;
    this.requiredTags = ['og:title', 'og:description', 'og:image', 'og:url'];
    this.recommendedTags = ['og:type', 'og:site_name', 'og:locale'];
    this.imageDimensions = {
      recommended: { width: 1200, height: 630 },
      minimum: { width: 600, height: 315 },
    };
  }

  async analyze(document, url) {
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
    };
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
}
