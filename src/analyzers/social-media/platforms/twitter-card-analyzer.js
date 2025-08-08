/**
 * Enhanced Twitter Card Analyzer
 * Comprehensive analysis of Twitter Card meta tags
 */

export class TwitterCardAnalyzer {
  constructor(options = {}) {
    this.options = options;
    this.cardTypes = ['summary', 'summary_large_image', 'app', 'player'];
    this.requiredTags = ['twitter:card'];
    this.recommendedTags = ['twitter:site', 'twitter:creator', 'twitter:title', 'twitter:description', 'twitter:image'];
  }

  async analyze(document, url) {
    const basic = this._analyzeBasicTwitter(document);
    const cardType = this._analyzeCardType(document);
    const validation = this._validateTwitterTags(document);
    const optimization = this._checkTwitterOptimization(document, url);

    const score = this._calculateTwitterScore(basic, cardType, validation);

    return {
      basic,
      cardType,
      validation,
      optimization,
      score,
      recommendations: this._generateTwitterRecommendations(validation, optimization, cardType),
    };
  }

  _analyzeBasicTwitter(document) {
    const tags = {};
    
    // Required tags
    this.requiredTags.forEach(tag => {
      const element = document.querySelector(`meta[name="${tag}"]`);
      tags[tag] = element ? element.getAttribute('content') : null;
    });

    // Recommended tags
    this.recommendedTags.forEach(tag => {
      const element = document.querySelector(`meta[name="${tag}"]`);
      tags[tag] = element ? element.getAttribute('content') : null;
    });

    return {
      tags,
      hasBasicTags: this._hasBasicTags(tags),
      completeness: this._calculateTwitterCompleteness(tags),
    };
  }

  _analyzeCardType(document) {
    const cardElement = document.querySelector('meta[name="twitter:card"]');
    const cardType = cardElement ? cardElement.getAttribute('content') : null;

    const analysis = {
      type: cardType,
      isValid: this.cardTypes.includes(cardType),
      requirements: this._getCardRequirements(cardType),
      compliance: null,
    };

    if (cardType) {
      analysis.compliance = this._checkCardCompliance(document, cardType);
    }

    return analysis;
  }

  _validateTwitterTags(document) {
    const validation = {
      errors: [],
      warnings: [],
      passed: [],
    };

    // Check for twitter:card
    const cardElement = document.querySelector('meta[name="twitter:card"]');
    if (!cardElement) {
      validation.errors.push('Missing required twitter:card meta tag');
    } else {
      const cardType = cardElement.getAttribute('content');
      if (!this.cardTypes.includes(cardType)) {
        validation.errors.push(`Invalid twitter:card type: ${cardType}`);
      } else {
        validation.passed.push(`Valid twitter:card type: ${cardType}`);
        this._validateCardSpecificTags(document, cardType, validation);
      }
    }

    // Check recommended tags
    this.recommendedTags.slice(1).forEach(tag => {
      const element = document.querySelector(`meta[name="${tag}"]`);
      if (!element) {
        validation.warnings.push(`Missing recommended tag: ${tag}`);
      } else {
        const content = element.getAttribute('content');
        if (!content || content.trim() === '') {
          validation.warnings.push(`Empty content for tag: ${tag}`);
        } else {
          validation.passed.push(`Valid ${tag}`);
          this._validateTagContent(tag, content, validation);
        }
      }
    });

    return validation;
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
}
