/**
 * Pinterest Analyzer
 * Rich Pins validation and Pinterest optimization
 */

export class PinterestAnalyzer {
  constructor(options = {}) {
    this.options = options;
    this.richPinTypes = ['article', 'product', 'recipe', 'app'];
  }

  async analyze(document, url) {
    const richPins = this._analyzeRichPins(document);
    const imageOptimization = this._analyzePinterestImages(document);
    const contentOptimization = this._analyzePinterestContent(document);
    const validation = this._validatePinterestTags(document);

    const score = this._calculatePinterestScore(richPins, imageOptimization, contentOptimization);

    return {
      richPins,
      imageOptimization,
      contentOptimization,
      validation,
      score,
      recommendations: this._generatePinterestRecommendations(richPins, imageOptimization, validation),
    };
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
}
