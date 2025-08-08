/**
 * ============================================================================
 * SOCIAL MEDIA ANALYZER MODULE
 * ============================================================================
 *
 * Comprehensive social media optimization analysis including:
 * - Enhanced Open Graph validation
 * - Twitter Card optimization
 * - LinkedIn meta tag analysis
 * - Pinterest Rich Pins validation
 * - WhatsApp preview optimization
 * - Social sharing button analysis
 * - Social proof element detection
 *
 * @author Nimrod Galor
 * @version 1.0.0
 */

import { OpenGraphAnalyzer } from "./platforms/open-graph-analyzer.js";
import { TwitterCardAnalyzer } from "./platforms/twitter-card-analyzer.js";
import { LinkedInAnalyzer } from "./platforms/linkedin-analyzer.js";
import { PinterestAnalyzer } from "./platforms/pinterest-analyzer.js";
import { WhatsAppAnalyzer } from "./platforms/whatsapp-analyzer.js";
import { SocialProofAnalyzer } from "./social-proof-analyzer.js";
import { SOCIAL_MEDIA_STANDARDS } from "./utils/social-constants.js";

export class SocialMediaAnalyzer {
  constructor(options = {}) {
    this.options = {
      enableImageAnalysis: true,
      enableContentValidation: true,
      checkSocialButtons: true,
      analyzeSocialProof: true,
      ...options,
    };

    // Initialize platform analyzers
    this.platforms = {
      openGraph: new OpenGraphAnalyzer(options),
      twitter: new TwitterCardAnalyzer(options),
      linkedin: new LinkedInAnalyzer(options),
      pinterest: new PinterestAnalyzer(options),
      whatsapp: new WhatsAppAnalyzer(options),
    };

    this.socialProofAnalyzer = new SocialProofAnalyzer(options);
  }

  /**
   * Perform comprehensive social media analysis
   * @param {Object} dom - JSDOM document object
   * @param {Object} pageData - Existing page data
   * @param {string} url - Page URL
   * @returns {Object} Social media analysis results
   */
  async analyzeSocialMedia(dom, pageData, url) {
    const analysisStart = Date.now();

    try {
      const document = dom.window.document;

      // Platform-specific analysis
      const platformAnalysis = await this._analyzePlatforms(document, url);

      // Social sharing analysis
      const sharingAnalysis = this._analyzeSocialSharing(document);

      // Social proof analysis
      const socialProofAnalysis = this._analyzeSocialProof(document);

      // Image optimization analysis
      const imageAnalysis = await this._analyzeSocialImages(document, url);

      // Overall optimization score
      const optimizationScore = this._calculateOptimizationScore({
        platforms: platformAnalysis,
        sharing: sharingAnalysis,
        socialProof: socialProofAnalysis,
        images: imageAnalysis,
      });

      return {
        platforms: platformAnalysis,
        sharing: sharingAnalysis,
        socialProof: socialProofAnalysis,
        images: imageAnalysis,
        optimization: optimizationScore,
        recommendations: this._generateRecommendations({
          platforms: platformAnalysis,
          sharing: sharingAnalysis,
          socialProof: socialProofAnalysis,
          images: imageAnalysis,
        }),
        analysisTime: Date.now() - analysisStart,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: `Social media analysis failed: ${error.message}`,
        analysisTime: Date.now() - analysisStart,
      };
    }
  }

  /**
   * Analyze all platforms
   */
  async _analyzePlatforms(document, url) {
    const analysis = {};

    try {
      analysis.openGraph = await this.platforms.openGraph.analyze(document, url);
      analysis.twitter = await this.platforms.twitter.analyze(document, url);
      analysis.linkedin = await this.platforms.linkedin.analyze(document, url);
      analysis.pinterest = await this.platforms.pinterest.analyze(document, url);
      analysis.whatsapp = await this.platforms.whatsapp.analyze(document, url);
    } catch (error) {
      analysis.error = `Platform analysis failed: ${error.message}`;
    }

    return analysis;
  }

  /**
   * Analyze social sharing elements
   */
  _analyzeSocialSharing(document) {
    const sharingButtons = this._findSocialSharingButtons(document);
    const socialLinks = this._findSocialMediaLinks(document);
    
    return {
      hasShareButtons: sharingButtons.length > 0,
      shareButtons: sharingButtons,
      socialLinks: socialLinks,
      shareButtonPlatforms: this._identifySharePlatforms(sharingButtons),
      placement: this._analyzeSharingPlacement(sharingButtons),
      score: this._calculateSharingScore(sharingButtons, socialLinks),
    };
  }

  /**
   * Analyze social proof elements
   */
  _analyzeSocialProof(document) {
    return this.socialProofAnalyzer.analyze(document);
  }

  /**
   * Analyze social media images
   */
  async _analyzeSocialImages(document, url) {
    const images = {
      ogImage: this._findOGImage(document),
      twitterImage: this._findTwitterImage(document),
      favicon: this._findFavicon(document),
    };

    const analysis = {
      images,
      validation: await this._validateSocialImages(images),
      optimization: this._analyzeSocialImageOptimization(images),
    };

    return analysis;
  }

  /**
   * Find social sharing buttons
   */
  _findSocialSharingButtons(document) {
    const selectors = [
      '.social-share', '.share-button', '.social-sharing',
      '[class*="share"]', '[data-share]', '.addthis',
      '.shareaholic', '.share-this'
    ];

    const buttons = [];
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const platform = this._identifyPlatform(element);
        if (platform) {
          buttons.push({
            platform,
            element: element.outerHTML,
            text: element.textContent.trim(),
            href: element.href || element.getAttribute('data-url'),
          });
        }
      });
    });

    return buttons;
  }

  /**
   * Find social media links
   */
  _findSocialMediaLinks(document) {
    const socialPlatforms = [
      'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com',
      'youtube.com', 'pinterest.com', 'tiktok.com', 'snapchat.com'
    ];

    const links = [];
    const allLinks = document.querySelectorAll('a[href]');

    allLinks.forEach(link => {
      const href = link.href;
      const platform = socialPlatforms.find(p => href.includes(p));
      
      if (platform) {
        links.push({
          platform: platform.replace('.com', ''),
          url: href,
          text: link.textContent.trim(),
          element: link.outerHTML,
        });
      }
    });

    return links;
  }

  /**
   * Identify sharing platform from element
   */
  _identifyPlatform(element) {
    const text = element.textContent.toLowerCase();
    const classes = element.className.toLowerCase();
    const href = element.href || '';

    const platforms = {
      facebook: ['facebook', 'fb'],
      twitter: ['twitter', 'tweet'],
      linkedin: ['linkedin'],
      pinterest: ['pinterest'],
      whatsapp: ['whatsapp'],
      email: ['email', 'mailto'],
    };

    for (const [platform, keywords] of Object.entries(platforms)) {
      if (keywords.some(keyword => 
        text.includes(keyword) || 
        classes.includes(keyword) || 
        href.includes(keyword)
      )) {
        return platform;
      }
    }

    return null;
  }

  /**
   * Calculate optimization score
   */
  _calculateOptimizationScore(analysis) {
    let score = 0;
    let maxScore = 0;

    // Platform scores (40% weight)
    const platformWeight = 0.4;
    const platformScores = Object.values(analysis.platforms).map(p => p.score || 0);
    const avgPlatformScore = platformScores.reduce((a, b) => a + b, 0) / platformScores.length;
    score += avgPlatformScore * platformWeight;
    maxScore += 100 * platformWeight;

    // Sharing analysis (30% weight)
    const sharingWeight = 0.3;
    score += (analysis.sharing.score || 0) * sharingWeight;
    maxScore += 100 * sharingWeight;

    // Social proof (20% weight)
    const proofWeight = 0.2;
    score += (analysis.socialProof.score || 0) * proofWeight;
    maxScore += 100 * proofWeight;

    // Image optimization (10% weight)
    const imageWeight = 0.1;
    score += (analysis.images.optimization?.score || 0) * imageWeight;
    maxScore += 100 * imageWeight;

    return {
      overall: Math.round((score / maxScore) * 100),
      breakdown: {
        platforms: Math.round(avgPlatformScore),
        sharing: analysis.sharing.score || 0,
        socialProof: analysis.socialProof.score || 0,
        images: analysis.images.optimization?.score || 0,
      },
    };
  }

  /**
   * Generate recommendations
   */
  _generateRecommendations(analysis) {
    const recommendations = [];

    // Platform recommendations
    Object.entries(analysis.platforms).forEach(([platform, data]) => {
      if (data.recommendations) {
        recommendations.push(...data.recommendations.map(rec => ({
          ...rec,
          category: 'platform',
          platform,
        })));
      }
    });

    // Sharing recommendations
    if (analysis.sharing.score < 70) {
      recommendations.push({
        type: 'social-sharing',
        priority: 'medium',
        title: 'Improve Social Sharing',
        description: 'Add or optimize social sharing buttons',
        impact: 'engagement',
      });
    }

    // Social proof recommendations
    if (analysis.socialProof.score < 50) {
      recommendations.push({
        type: 'social-proof',
        priority: 'high',
        title: 'Add Social Proof Elements',
        description: 'Include testimonials, reviews, or social metrics',
        impact: 'trust',
      });
    }

    return recommendations;
  }

  /**
   * Find OG image
   */
  _findOGImage(document) {
    const ogImage = document.querySelector('meta[property="og:image"]');
    return ogImage ? ogImage.getAttribute('content') : null;
  }

  /**
   * Find Twitter image
   */
  _findTwitterImage(document) {
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    return twitterImage ? twitterImage.getAttribute('content') : null;
  }

  /**
   * Find favicon
   */
  _findFavicon(document) {
    const favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    return favicon ? favicon.getAttribute('href') : null;
  }

  /**
   * Validate social images
   */
  async _validateSocialImages(images) {
    const validation = {
      hasOGImage: !!images.ogImage,
      hasTwitterImage: !!images.twitterImage,
      hasFavicon: !!images.favicon,
      errors: [],
      warnings: [],
    };

    if (!images.ogImage) {
      validation.errors.push('Missing Open Graph image');
    }

    if (!images.twitterImage) {
      validation.warnings.push('Missing Twitter Card image');
    }

    if (!images.favicon) {
      validation.warnings.push('Missing favicon');
    }

    return validation;
  }

  /**
   * Analyze social image optimization
   */
  _analyzeSocialImageOptimization(images) {
    let score = 0;
    const checks = [];

    if (images.ogImage) {
      score += 40;
      checks.push({ type: 'og-image', status: 'present' });
    }

    if (images.twitterImage) {
      score += 30;
      checks.push({ type: 'twitter-image', status: 'present' });
    }

    if (images.favicon) {
      score += 30;
      checks.push({ type: 'favicon', status: 'present' });
    }

    return { score, checks };
  }

  /**
   * Calculate sharing score
   */
  _calculateSharingScore(buttons, links) {
    let score = 0;

    // Base score for having sharing buttons
    if (buttons.length > 0) score += 40;

    // Score for number of platforms
    const platforms = new Set(buttons.map(b => b.platform));
    score += Math.min(platforms.size * 10, 40);

    // Score for social media presence
    if (links.length > 0) score += 20;

    return Math.min(score, 100);
  }

  /**
   * Identify share platforms
   */
  _identifySharePlatforms(buttons) {
    return [...new Set(buttons.map(b => b.platform))];
  }

  /**
   * Analyze sharing placement
   */
  _analyzeSharingPlacement(buttons) {
    const placement = {
      top: false,
      bottom: false,
      sidebar: false,
      floating: false,
    };

    // This would need more sophisticated position analysis
    // For now, return basic analysis
    if (buttons.length > 0) {
      placement.present = true;
    }

    return placement;
  }
}
