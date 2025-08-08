/**
 * WhatsApp Analyzer
 * WhatsApp preview optimization analysis
 */

export class WhatsAppAnalyzer {
  constructor(options = {}) {
    this.options = options;
    this.whatsappLimits = {
      title: 65,
      description: 160,
      imageSize: 300, // KB
    };
  }

  async analyze(document, url) {
    const preview = this._analyzeWhatsAppPreview(document);
    const optimization = this._analyzeWhatsAppOptimization(document);
    const validation = this._validateWhatsAppTags(document);
    const sharing = this._analyzeWhatsAppSharing(document);

    const score = this._calculateWhatsAppScore(preview, optimization, sharing);

    return {
      preview,
      optimization,
      validation,
      sharing,
      score,
      recommendations: this._generateWhatsAppRecommendations(preview, optimization, validation),
    };
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

  _calculateWhatsAppScore(preview, optimization, sharing) {
    let score = 0;

    // Preview completeness (50%)
    score += preview.completeness * 0.5;

    // Optimization (30%)
    let optimizationScore = 0;
    if (optimization.titleOptimization?.optimized) optimizationScore += 35;
    if (optimization.descriptionOptimization?.optimized) optimizationScore += 35;
    if (optimization.imageOptimization?.optimized) optimizationScore += 30;
    
    score += optimizationScore * 0.3;

    // Sharing features (20%)
    score += sharing.sharingScore * 0.2;

    return Math.round(score);
  }

  _generateWhatsAppRecommendations(preview, optimization, validation) {
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
