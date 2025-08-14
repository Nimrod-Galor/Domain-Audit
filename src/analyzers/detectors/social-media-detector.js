/**
 * ============================================================================
 * SOCIAL MEDIA DETECTOR - CLAUDE AI ENHANCED HEURISTICS
 * ============================================================================
 * 
 * Comprehensive social media presence and optimization detector
 * Part of the Combined Approach modernization pattern
 * 
 * Features:
 * - Social media meta tags analysis
 * - Open Graph and Twitter Cards detection
 * - Social sharing optimization
 * - Social media links detection
 * - Social engagement optimization
 * 
 * @version 1.0.0
 * @author Development Team
 */

export class SocialMediaDetector {
  constructor() {
    this.detectorName = 'SocialMediaDetector';
    this.version = '1.0.0';
    
    // Social media platforms mapping
    this.socialPlatforms = {
      facebook: ['facebook.com', 'fb.com', 'fb.me'],
      twitter: ['twitter.com', 'x.com'],
      instagram: ['instagram.com', 'instagr.am'],
      linkedin: ['linkedin.com', 'lnkd.in'],
      youtube: ['youtube.com', 'youtu.be'],
      pinterest: ['pinterest.com', 'pin.it'],
      tiktok: ['tiktok.com'],
      snapchat: ['snapchat.com'],
      reddit: ['reddit.com'],
      discord: ['discord.gg', 'discord.com'],
      telegram: ['t.me', 'telegram.me'],
      whatsapp: ['wa.me', 'whatsapp.com']
    };
  }

  /**
   * Detect and analyze social media optimization
   * @param {Document} document - The HTML document
   * @param {string} url - Page URL
   * @returns {Object} Social media analysis results
   */
  detectSocialMedia(document, url) {
    try {
      const analysis = {
        openGraph: this._analyzeOpenGraph(document),
        twitterCards: this._analyzeTwitterCards(document),
        socialLinks: this._analyzeSocialLinks(document),
        socialSharing: this._analyzeSocialSharing(document),
        socialContent: this._analyzeSocialContent(document),
        platforms: this._detectPlatforms(document, url)
      };
      
      return {
        success: true,
        analysis,
        recommendations: this._generateSocialRecommendations(analysis),
        score: this._calculateSocialScore(analysis)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        analysis: {},
        recommendations: [],
        score: 0
      };
    }
  }

  /**
   * Analyze Open Graph meta tags
   * @private
   */
  _analyzeOpenGraph(document) {
    const ogTags = {};
    const ogElements = document.querySelectorAll('meta[property^="og:"]');
    
    Array.from(ogElements).forEach(tag => {
      const property = tag.getAttribute('property');
      const content = tag.getAttribute('content');
      if (property && content) {
        ogTags[property.replace('og:', '')] = content;
      }
    });
    
    // Check for essential OG tags
    const essential = ['title', 'description', 'image', 'url', 'type'];
    const present = essential.filter(tag => ogTags[tag]);
    
    return {
      tags: ogTags,
      essential: {
        total: essential.length,
        present: present.length,
        missing: essential.filter(tag => !ogTags[tag]),
        complete: present.length === essential.length
      },
      imageAnalysis: this._analyzeOgImage(ogTags),
      typeAnalysis: this._analyzeOgType(ogTags),
      score: this._calculateOgScore(ogTags, essential, present)
    };
  }

  /**
   * Analyze Open Graph image
   * @private
   */
  _analyzeOgImage(ogTags) {
    const image = ogTags.image;
    const imageWidth = ogTags.image_width;
    const imageHeight = ogTags.image_height;
    const imageAlt = ogTags.image_alt;
    
    if (!image) {
      return {
        present: false,
        valid: false,
        optimized: false,
        score: 0
      };
    }
    
    const isAbsolute = image.startsWith('http://') || image.startsWith('https://');
    const hasAlt = !!imageAlt;
    const hasDimensions = !!(imageWidth && imageHeight);
    
    // Check if dimensions are social media friendly
    let dimensionsOptimal = false;
    if (imageWidth && imageHeight) {
      const width = parseInt(imageWidth);
      const height = parseInt(imageHeight);
      const ratio = width / height;
      
      // Common social media ratios: 1.91:1 (Facebook), 2:1 (Twitter), 1:1 (Instagram)
      dimensionsOptimal = (
        (ratio >= 1.85 && ratio <= 2.0) ||  // Facebook/Twitter
        (ratio >= 0.95 && ratio <= 1.05) ||  // Square
        (ratio >= 1.5 && ratio <= 1.85)      // General rectangular
      );
    }
    
    return {
      present: true,
      url: image,
      isAbsolute,
      hasAlt,
      hasDimensions,
      dimensionsOptimal,
      valid: isAbsolute,
      optimized: isAbsolute && hasAlt && hasDimensions,
      score: this._calculateImageScore(isAbsolute, hasAlt, hasDimensions, dimensionsOptimal)
    };
  }

  /**
   * Calculate Open Graph image score
   * @private
   */
  _calculateImageScore(isAbsolute, hasAlt, hasDimensions, dimensionsOptimal) {
    let score = 0;
    
    if (isAbsolute) score += 40;  // Valid URL
    if (hasAlt) score += 20;      // Accessibility
    if (hasDimensions) score += 20; // Explicit dimensions
    if (dimensionsOptimal) score += 20; // Optimal dimensions
    
    return score;
  }

  /**
   * Analyze Open Graph type
   * @private
   */
  _analyzeOgType(ogTags) {
    const type = ogTags.type;
    const validTypes = [
      'website', 'article', 'blog', 'profile', 'book', 'music.song', 
      'music.album', 'music.playlist', 'music.radio_station', 'video.movie',
      'video.episode', 'video.tv_show', 'video.other'
    ];
    
    return {
      present: !!type,
      value: type,
      valid: validTypes.includes(type),
      appropriate: this._isAppropriateType(type)
    };
  }

  /**
   * Check if OG type is appropriate
   * @private
   */
  _isAppropriateType(type) {
    // Most common appropriate types
    const commonTypes = ['website', 'article', 'blog'];
    return commonTypes.includes(type);
  }

  /**
   * Calculate Open Graph score
   * @private
   */
  _calculateOgScore(ogTags, essential, present) {
    let score = 0;
    
    // Essential tags completeness (60%)
    score += (present.length / essential.length) * 60;
    
    // Image optimization (25%)
    const imageAnalysis = this._analyzeOgImage(ogTags);
    score += imageAnalysis.score * 0.25;
    
    // Type validity (15%)
    const typeAnalysis = this._analyzeOgType(ogTags);
    if (typeAnalysis.valid) score += 15;
    else if (typeAnalysis.present) score += 7;
    
    return Math.round(score);
  }

  /**
   * Analyze Twitter Cards
   * @private
   */
  _analyzeTwitterCards(document) {
    const twitterTags = {};
    const twitterElements = document.querySelectorAll('meta[name^="twitter:"]');
    
    Array.from(twitterElements).forEach(tag => {
      const name = tag.getAttribute('name');
      const content = tag.getAttribute('content');
      if (name && content) {
        twitterTags[name.replace('twitter:', '')] = content;
      }
    });
    
    const cardType = twitterTags.card;
    const essential = this._getTwitterEssentialTags(cardType);
    const present = essential.filter(tag => twitterTags[tag]);
    
    return {
      tags: twitterTags,
      cardType,
      essential: {
        total: essential.length,
        present: present.length,
        missing: essential.filter(tag => !twitterTags[tag]),
        complete: present.length === essential.length
      },
      cardAnalysis: this._analyzeTwitterCard(cardType),
      score: this._calculateTwitterScore(twitterTags, cardType, essential, present)
    };
  }

  /**
   * Get essential Twitter tags based on card type
   * @private
   */
  _getTwitterEssentialTags(cardType) {
    const base = ['card'];
    
    switch (cardType) {
      case 'summary':
        return [...base, 'title', 'description'];
      case 'summary_large_image':
        return [...base, 'title', 'description', 'image'];
      case 'app':
        return [...base, 'description', 'app:name:iphone', 'app:id:iphone'];
      case 'player':
        return [...base, 'title', 'description', 'player'];
      default:
        return [...base, 'title', 'description'];
    }
  }

  /**
   * Analyze Twitter card type
   * @private
   */
  _analyzeTwitterCard(cardType) {
    const validTypes = ['summary', 'summary_large_image', 'app', 'player'];
    const isValid = validTypes.includes(cardType);
    
    return {
      present: !!cardType,
      value: cardType,
      valid: isValid,
      recommended: cardType === 'summary_large_image',
      description: this._getCardTypeDescription(cardType)
    };
  }

  /**
   * Get card type description
   * @private
   */
  _getCardTypeDescription(cardType) {
    const descriptions = {
      'summary': 'Basic card with title, description, and thumbnail',
      'summary_large_image': 'Large image card - recommended for most content',
      'app': 'Card for mobile app promotion',
      'player': 'Card for media content with player'
    };
    
    return descriptions[cardType] || 'Unknown card type';
  }

  /**
   * Calculate Twitter Cards score
   * @private
   */
  _calculateTwitterScore(twitterTags, cardType, essential, present) {
    let score = 0;
    
    // Essential tags completeness (70%)
    if (essential.length > 0) {
      score += (present.length / essential.length) * 70;
    }
    
    // Card type validity (20%)
    const cardAnalysis = this._analyzeTwitterCard(cardType);
    if (cardAnalysis.valid) score += 20;
    else if (cardAnalysis.present) score += 10;
    
    // Recommended features (10%)
    if (cardType === 'summary_large_image') score += 10;
    else if (twitterTags.image) score += 5;
    
    return Math.round(score);
  }

  /**
   * Analyze social media links
   * @private
   */
  _analyzeSocialLinks(document) {
    const links = document.querySelectorAll('a[href]');
    const socialLinks = {};
    let totalSocialLinks = 0;
    
    // Initialize platform counters
    Object.keys(this.socialPlatforms).forEach(platform => {
      socialLinks[platform] = {
        count: 0,
        links: [],
        hasIcon: false,
        inFooter: false,
        inHeader: false
      };
    });
    
    Array.from(links).forEach(link => {
      const href = link.getAttribute('href') || '';
      const platform = this._identifyPlatform(href);
      
      if (platform) {
        totalSocialLinks++;
        socialLinks[platform].count++;
        socialLinks[platform].links.push({
          url: href,
          text: link.textContent?.trim(),
          hasIcon: this._hasIcon(link),
          location: this._getLinkLocation(link)
        });
        
        // Update location flags
        const location = this._getLinkLocation(link);
        if (location === 'header') socialLinks[platform].inHeader = true;
        if (location === 'footer') socialLinks[platform].inFooter = true;
        if (this._hasIcon(link)) socialLinks[platform].hasIcon = true;
      }
    });
    
    const activePlatforms = Object.keys(socialLinks).filter(
      platform => socialLinks[platform].count > 0
    );
    
    return {
      totalLinks: totalSocialLinks,
      platforms: socialLinks,
      activePlatforms,
      platformCount: activePlatforms.length,
      hasIcons: activePlatforms.some(platform => socialLinks[platform].hasIcon),
      score: this._calculateSocialLinksScore(socialLinks, activePlatforms, totalSocialLinks)
    };
  }

  /**
   * Identify social media platform from URL
   * @private
   */
  _identifyPlatform(url) {
    for (const [platform, domains] of Object.entries(this.socialPlatforms)) {
      if (domains.some(domain => url.includes(domain))) {
        return platform;
      }
    }
    return null;
  }

  /**
   * Check if link has an icon
   * @private
   */
  _hasIcon(link) {
    // Check for icon classes, images, or SVGs
    const hasIconClass = link.className.includes('icon') || 
                        link.className.includes('fa-') ||
                        link.className.includes('social');
    
    const hasImage = link.querySelector('img, svg, i[class*="fa"], i[class*="icon"]');
    
    return hasIconClass || !!hasImage;
  }

  /**
   * Get link location in page
   * @private
   */
  _getLinkLocation(link) {
    const header = document.querySelector('header, .header, nav, .nav');
    const footer = document.querySelector('footer, .footer');
    
    if (header && header.contains(link)) return 'header';
    if (footer && footer.contains(link)) return 'footer';
    
    return 'content';
  }

  /**
   * Calculate social links score
   * @private
   */
  _calculateSocialLinksScore(socialLinks, activePlatforms, totalLinks) {
    let score = 0;
    
    // Has social links (30%)
    if (totalLinks > 0) score += 30;
    
    // Multiple platforms (25%)
    if (activePlatforms.length >= 3) score += 25;
    else if (activePlatforms.length >= 2) score += 15;
    else if (activePlatforms.length >= 1) score += 10;
    
    // Has icons (20%)
    const hasIcons = activePlatforms.some(platform => socialLinks[platform].hasIcon);
    if (hasIcons) score += 20;
    
    // Good placement (15%)
    const inFooter = activePlatforms.some(platform => socialLinks[platform].inFooter);
    const inHeader = activePlatforms.some(platform => socialLinks[platform].inHeader);
    if (inFooter || inHeader) score += 15;
    
    // Popular platforms present (10%)
    const popularPlatforms = ['facebook', 'twitter', 'instagram', 'linkedin'];
    const hasPopular = popularPlatforms.some(platform => activePlatforms.includes(platform));
    if (hasPopular) score += 10;
    
    return score;
  }

  /**
   * Analyze social sharing features
   * @private
   */
  _analyzeSocialSharing(document) {
    const shareButtons = this._findShareButtons(document);
    const shareScripts = this._findShareScripts(document);
    const shareWidgets = this._findShareWidgets(document);
    
    return {
      shareButtons: shareButtons,
      shareScripts: shareScripts,
      shareWidgets: shareWidgets,
      hasSharing: shareButtons.total > 0 || shareScripts.length > 0 || shareWidgets.length > 0,
      score: this._calculateSharingScore(shareButtons, shareScripts, shareWidgets)
    };
  }

  /**
   * Find social share buttons
   * @private
   */
  _findShareButtons(document) {
    const shareSelectors = [
      '[class*="share"]',
      '[class*="social-share"]',
      '[data-share]',
      'a[href*="facebook.com/sharer"]',
      'a[href*="twitter.com/intent"]',
      'a[href*="linkedin.com/sharing"]',
      'a[href*="pinterest.com/pin"]'
    ];
    
    let total = 0;
    const platforms = {};
    
    shareSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      Array.from(elements).forEach(element => {
        const href = element.getAttribute('href') || '';
        const platform = this._identifySharePlatform(href, element);
        
        if (platform) {
          total++;
          platforms[platform] = (platforms[platform] || 0) + 1;
        }
      });
    });
    
    return {
      total,
      platforms,
      platformCount: Object.keys(platforms).length
    };
  }

  /**
   * Identify sharing platform
   * @private
   */
  _identifySharePlatform(href, element) {
    if (href.includes('facebook.com/sharer') || href.includes('fb.com')) return 'facebook';
    if (href.includes('twitter.com/intent') || href.includes('x.com')) return 'twitter';
    if (href.includes('linkedin.com/sharing')) return 'linkedin';
    if (href.includes('pinterest.com/pin')) return 'pinterest';
    if (href.includes('wa.me') || href.includes('whatsapp.com')) return 'whatsapp';
    
    // Check class names and text content
    const className = element.className.toLowerCase();
    const textContent = element.textContent?.toLowerCase() || '';
    
    if (className.includes('facebook') || textContent.includes('facebook')) return 'facebook';
    if (className.includes('twitter') || textContent.includes('twitter')) return 'twitter';
    if (className.includes('linkedin') || textContent.includes('linkedin')) return 'linkedin';
    if (className.includes('pinterest') || textContent.includes('pinterest')) return 'pinterest';
    
    return null;
  }

  /**
   * Find social sharing scripts
   * @private
   */
  _findShareScripts(document) {
    const scripts = document.querySelectorAll('script[src]');
    const shareScripts = [];
    
    Array.from(scripts).forEach(script => {
      const src = script.getAttribute('src') || '';
      
      if (src.includes('addthis.com')) shareScripts.push('AddThis');
      if (src.includes('sharethis.com')) shareScripts.push('ShareThis');
      if (src.includes('addtoany.com')) shareScripts.push('AddToAny');
      if (src.includes('connect.facebook.net')) shareScripts.push('Facebook SDK');
      if (src.includes('platform.twitter.com')) shareScripts.push('Twitter Widgets');
    });
    
    return [...new Set(shareScripts)];
  }

  /**
   * Find social sharing widgets
   * @private
   */
  _findShareWidgets(document) {
    const widgetSelectors = [
      '.addthis_toolbox',
      '.sharethis-inline-share-buttons',
      '.a2a_kit',
      '.fb-share-button',
      '.twitter-share-button'
    ];
    
    const widgets = [];
    
    widgetSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        widgets.push(selector.replace(/[\.\#]/, ''));
      }
    });
    
    return widgets;
  }

  /**
   * Calculate sharing score
   * @private
   */
  _calculateSharingScore(shareButtons, shareScripts, shareWidgets) {
    let score = 0;
    
    // Has share buttons (40%)
    if (shareButtons.total > 0) {
      score += 40;
      
      // Multiple platforms (bonus)
      if (shareButtons.platformCount >= 3) score += 10;
      else if (shareButtons.platformCount >= 2) score += 5;
    }
    
    // Has sharing scripts/widgets (30%)
    if (shareScripts.length > 0 || shareWidgets.length > 0) score += 30;
    
    // Professional sharing solutions (20%)
    const professionalSolutions = ['AddThis', 'ShareThis', 'AddToAny'];
    const hasProfessional = shareScripts.some(script => 
      professionalSolutions.some(solution => script.includes(solution))
    );
    if (hasProfessional) score += 20;
    
    // Native platform integration (10%)
    const hasNative = shareScripts.includes('Facebook SDK') || 
                      shareScripts.includes('Twitter Widgets');
    if (hasNative) score += 10;
    
    return Math.min(100, score);
  }

  /**
   * Analyze social content optimization
   * @private
   */
  _analyzeSocialContent(document) {
    return {
      hashtags: this._analyzeHashtags(document),
      mentions: this._analyzeMentions(document),
      socialProof: this._analyzeSocialProof(document),
      engagement: this._analyzeEngagementElements(document),
      score: this._calculateContentScore(document)
    };
  }

  /**
   * Analyze hashtags in content
   * @private
   */
  _analyzeHashtags(document) {
    const textContent = document.body.textContent || '';
    const hashtagRegex = /#[\w]+/g;
    const hashtags = textContent.match(hashtagRegex) || [];
    
    return {
      count: hashtags.length,
      hashtags: [...new Set(hashtags)],
      density: textContent.length > 0 ? (hashtags.length / textContent.split(' ').length) * 100 : 0
    };
  }

  /**
   * Analyze social mentions
   * @private
   */
  _analyzeMentions(document) {
    const textContent = document.body.textContent || '';
    const mentionRegex = /@[\w]+/g;
    const mentions = textContent.match(mentionRegex) || [];
    
    return {
      count: mentions.length,
      mentions: [...new Set(mentions)]
    };
  }

  /**
   * Analyze social proof elements
   * @private
   */
  _analyzeSocialProof(document) {
    const socialProofSelectors = [
      '.testimonial',
      '.review',
      '.rating',
      '.social-proof',
      '[class*="follow"]',
      '[class*="like"]',
      '[class*="subscriber"]'
    ];
    
    let elements = 0;
    socialProofSelectors.forEach(selector => {
      elements += document.querySelectorAll(selector).length;
    });
    
    return {
      elements,
      hasTestimonials: document.querySelectorAll('.testimonial, .review').length > 0,
      hasRatings: document.querySelectorAll('.rating, [class*="star"]').length > 0,
      hasSocialCounts: document.querySelectorAll('[class*="follow"], [class*="like"]').length > 0
    };
  }

  /**
   * Analyze engagement elements
   * @private
   */
  _analyzeEngagementElements(document) {
    const engagementElements = {
      comments: document.querySelectorAll('.comment, .comments, #comments').length,
      forms: document.querySelectorAll('form').length,
      ctaButtons: document.querySelectorAll('[class*="cta"], [class*="button"]').length,
      newsletter: document.querySelectorAll('input[type="email"], [class*="newsletter"]').length
    };
    
    return engagementElements;
  }

  /**
   * Calculate social content score
   * @private
   */
  _calculateContentScore(document) {
    const hashtags = this._analyzeHashtags(document);
    const socialProof = this._analyzeSocialProof(document);
    const engagement = this._analyzeEngagementElements(document);
    
    let score = 0;
    
    // Social proof elements (40%)
    if (socialProof.elements > 0) score += 40;
    
    // Engagement elements (35%)
    const engagementScore = Math.min(35, 
      (engagement.comments > 0 ? 10 : 0) +
      (engagement.forms > 0 ? 10 : 0) +
      (engagement.ctaButtons > 0 ? 10 : 0) +
      (engagement.newsletter > 0 ? 5 : 0)
    );
    score += engagementScore;
    
    // Hashtags presence (15%)
    if (hashtags.count > 0 && hashtags.density < 5) score += 15;
    else if (hashtags.count > 0) score += 7;
    
    // Overall content optimization (10%)
    if (socialProof.hasTestimonials && engagement.ctaButtons > 0) score += 10;
    
    return score;
  }

  /**
   * Detect platform-specific presence
   * @private
   */
  _detectPlatforms(document, url) {
    const platforms = {};
    
    // Facebook presence
    platforms.facebook = this._detectFacebookPresence(document);
    
    // Twitter presence
    platforms.twitter = this._detectTwitterPresence(document);
    
    // Instagram presence
    platforms.instagram = this._detectInstagramPresence(document);
    
    // LinkedIn presence
    platforms.linkedin = this._detectLinkedInPresence(document);
    
    // YouTube presence
    platforms.youtube = this._detectYouTubePresence(document);
    
    return platforms;
  }

  /**
   * Detect Facebook presence
   * @private
   */
  _detectFacebookPresence(document) {
    return {
      sdk: !!document.querySelector('script[src*="connect.facebook.net"]'),
      widgets: document.querySelectorAll('.fb-like, .fb-share-button, .fb-comments').length,
      pixels: !!document.querySelector('script[src*="facebook.net"], script:contains("fbq")'),
      links: document.querySelectorAll('a[href*="facebook.com"]').length
    };
  }

  /**
   * Detect Twitter presence
   * @private
   */
  _detectTwitterPresence(document) {
    return {
      widgets: !!document.querySelector('script[src*="platform.twitter.com"]'),
      cards: document.querySelectorAll('meta[name^="twitter:"]').length,
      embeds: document.querySelectorAll('.twitter-tweet').length,
      links: document.querySelectorAll('a[href*="twitter.com"], a[href*="x.com"]').length
    };
  }

  /**
   * Detect Instagram presence
   * @private
   */
  _detectInstagramPresence(document) {
    return {
      embeds: document.querySelectorAll('[class*="instagram"], script[src*="instagram.com"]').length,
      links: document.querySelectorAll('a[href*="instagram.com"]').length
    };
  }

  /**
   * Detect LinkedIn presence
   * @private
   */
  _detectLinkedInPresence(document) {
    return {
      widgets: !!document.querySelector('script[src*="platform.linkedin.com"]'),
      links: document.querySelectorAll('a[href*="linkedin.com"]').length
    };
  }

  /**
   * Detect YouTube presence
   * @private
   */
  _detectYouTubePresence(document) {
    return {
      embeds: document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="youtu.be"]').length,
      links: document.querySelectorAll('a[href*="youtube.com"], a[href*="youtu.be"]').length
    };
  }

  /**
   * Generate social media recommendations
   * @private
   */
  _generateSocialRecommendations(analysis) {
    const recommendations = [];
    
    // Open Graph recommendations
    if (analysis.openGraph.score < 80) {
      recommendations.push({
        type: 'open-graph',
        priority: 'high',
        message: 'Optimize Open Graph tags for better social media sharing'
      });
    }
    
    // Twitter Cards recommendations
    if (analysis.twitterCards.score < 70) {
      recommendations.push({
        type: 'twitter-cards',
        priority: 'medium',
        message: 'Add Twitter Card meta tags to improve Twitter sharing'
      });
    }
    
    // Social links recommendations
    if (analysis.socialLinks.score < 60) {
      recommendations.push({
        type: 'social-links',
        priority: 'medium',
        message: 'Add social media links and improve their presentation'
      });
    }
    
    // Social sharing recommendations
    if (analysis.socialSharing.score < 50) {
      recommendations.push({
        type: 'social-sharing',
        priority: 'medium',
        message: 'Implement social sharing buttons for better content distribution'
      });
    }
    
    // Social content recommendations
    if (analysis.socialContent.score < 60) {
      recommendations.push({
        type: 'social-content',
        priority: 'low',
        message: 'Optimize content for social engagement with testimonials and CTAs'
      });
    }
    
    return recommendations;
  }

  /**
   * Calculate overall social media score
   * @private
   */
  _calculateSocialScore(analysis) {
    const weights = {
      openGraph: 0.3,
      twitterCards: 0.2,
      socialLinks: 0.2,
      socialSharing: 0.15,
      socialContent: 0.15
    };
    
    const score = (
      analysis.openGraph.score * weights.openGraph +
      analysis.twitterCards.score * weights.twitterCards +
      analysis.socialLinks.score * weights.socialLinks +
      analysis.socialSharing.score * weights.socialSharing +
      analysis.socialContent.score * weights.socialContent
    );
    
    return Math.round(Math.max(0, Math.min(100, score)));
  }
}
