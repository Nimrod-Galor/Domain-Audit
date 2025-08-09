import { BaseAnalyzer } from '../core/BaseAnalyzer.js';
import { AnalyzerCategories } from '../core/AnalyzerInterface.js';
import { OpenGraphAnalyzer } from "../social-media/platforms/open-graph-analyzer.js";
import { TwitterCardAnalyzer } from "../social-media/platforms/twitter-card-analyzer.js";
import { LinkedInAnalyzer } from "../social-media/platforms/linkedin-analyzer.js";
import { PinterestAnalyzer } from "../social-media/platforms/pinterest-analyzer.js";
import { WhatsAppAnalyzer } from "../social-media/platforms/whatsapp-analyzer.js";
import { SocialProofAnalyzer } from "../social-media/social-proof-analyzer.js";
import { SOCIAL_MEDIA_STANDARDS } from "../social-media/utils/social-constants.js";

/**
 * Social Media Analyzer
 * Analyzes social media optimization including Open Graph, Twitter Cards, and social sharing
 * 
 * @fileoverview Comprehensive social media optimization analysis
 * @version 1.0.0
 * @author Nimrod Galor
 * @date 2025-08-08
 */

export class SocialMediaAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('SocialMediaAnalyzer', {
      enableImageAnalysis: options.enableImageAnalysis !== false,
      enableContentValidation: options.enableContentValidation !== false,
      checkSocialButtons: options.checkSocialButtons !== false,
      analyzeSocialProof: options.analyzeSocialProof !== false,
      ...options,
    });

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

  getMetadata() {
    return {
      name: 'SocialMediaAnalyzer',
      version: '1.0.0',
      description: 'Analyzes social media optimization including Open Graph, Twitter Cards, and social sharing',
      category: AnalyzerCategories.CONTENT,
      priority: 'high'
    };
  }

  /**
   * Perform comprehensive social media analysis
   * @param {Document} document - DOM document
   * @param {Object|string} pageDataOrUrl - Page data object or URL string
   * @param {string} url - Page URL
   * @returns {Promise<Object>} Analysis results
   */
  async analyze(document, pageDataOrUrl, url) {
    return this.measureTime(async () => {
      try {
        this.log('info', 'Starting social media analysis...');
        
        let actualUrl, pageData;
        if (typeof pageDataOrUrl === 'string') {
          actualUrl = pageDataOrUrl;
          pageData = {};
        } else {
          pageData = pageDataOrUrl || {};
          actualUrl = url;
        }

        // Platform-specific analysis
        const platformAnalysis = await this._analyzePlatforms(document, actualUrl);

        // Social sharing analysis
        const sharingAnalysis = this._analyzeSocialSharing(document);

        // Social proof analysis
        const socialProofAnalysis = this._analyzeSocialProof(document);

        // Image optimization analysis
        const imageAnalysis = await this._analyzeSocialImages(document, actualUrl);

        // Overall optimization score
        const optimizationScore = this._calculateOptimizationScore({
          platforms: platformAnalysis,
          sharing: sharingAnalysis,
          socialProof: socialProofAnalysis,
          images: imageAnalysis,
        });

        const analysisData = {
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
          })
        };

        this.log('info', `Social media analysis completed with optimization score: ${optimizationScore.overallScore}`);
        return analysisData;

      } catch (error) {
        return this.handleError(error, 'social media analysis');
      }
    }).then(({ result, time }) => {
      if (result.error) {
        return {
          ...result,
          platforms: null,
          sharing: null,
          socialProof: null,
          images: null,
          optimization: { overallScore: 0 }
        };
      }
      
      return this.createSuccessResponse(result, time);
    });
  }

  /**
   * Analyze all platforms
   */
  async _analyzePlatforms(document, url) {
    const results = {};
    
    for (const [platform, analyzer] of Object.entries(this.platforms)) {
      try {
        if (platform === 'openGraph') {
          results[platform] = await analyzer.analyzeOpenGraph(document, url);
        } else if (platform === 'twitter') {
          results[platform] = await analyzer.analyzeTwitterCard(document, url);
        } else if (platform === 'linkedin') {
          results[platform] = await analyzer.analyzeLinkedIn(document, url);
        } else if (platform === 'pinterest') {
          results[platform] = await analyzer.analyzePinterest(document, url);
        } else if (platform === 'whatsapp') {
          results[platform] = await analyzer.analyzeWhatsApp(document, url);
        }
      } catch (error) {
        this.log('warn', `Platform analysis failed for ${platform}: ${error.message}`);
        results[platform] = { error: error.message, score: 0 };
      }
    }
    
    return results;
  }

  /**
   * Analyze social sharing elements
   */
  _analyzeSocialSharing(document) {
    try {
      const shareButtons = this._findSocialShareButtons(document);
      const shareCount = shareButtons.length;
      
      return {
        shareButtons: shareButtons,
        shareButtonCount: shareCount,
        hasSharing: shareCount > 0,
        shareScore: Math.min(shareCount * 20, 100),
        platforms: this._identifySharePlatforms(shareButtons)
      };
    } catch (error) {
      return { error: error.message, shareButtonCount: 0, hasSharing: false, shareScore: 0 };
    }
  }

  /**
   * Analyze social proof elements
   */
  _analyzeSocialProof(document) {
    try {
      if (!this.options.analyzeSocialProof) {
        return { enabled: false };
      }
      
      return this.socialProofAnalyzer.analyzeSocialProof(document);
    } catch (error) {
      return { error: error.message, score: 0 };
    }
  }

  /**
   * Analyze social media images
   */
  async _analyzeSocialImages(document, url) {
    try {
      if (!this.options.enableImageAnalysis) {
        return { enabled: false };
      }

      const ogImage = document.querySelector('meta[property="og:image"]')?.content;
      const twitterImage = document.querySelector('meta[name="twitter:image"]')?.content;
      
      return {
        ogImage: {
          present: !!ogImage,
          url: ogImage,
          valid: ogImage && this._isValidImageUrl(ogImage)
        },
        twitterImage: {
          present: !!twitterImage,
          url: twitterImage,
          valid: twitterImage && this._isValidImageUrl(twitterImage)
        },
        score: this._calculateImageScore(ogImage, twitterImage)
      };
    } catch (error) {
      return { error: error.message, score: 0 };
    }
  }

  /**
   * Find social sharing buttons
   */
  _findSocialShareButtons(document) {
    const shareSelectors = [
      '[class*="share"]',
      '[class*="social"]',
      '[href*="facebook.com/sharer"]',
      '[href*="twitter.com/intent"]',
      '[href*="linkedin.com/sharing"]',
      '[href*="pinterest.com/pin"]'
    ];
    
    const buttons = [];
    shareSelectors.forEach(selector => {
      const elements = this.safeQuery(document, selector);
      elements.forEach(el => {
        if (!buttons.find(btn => btn.element === el)) {
          buttons.push({
            element: el,
            platform: this._identifyPlatform(el),
            text: el.textContent?.trim() || '',
            href: el.href || ''
          });
        }
      });
    });
    
    return buttons;
  }

  /**
   * Identify share platforms from buttons
   */
  _identifySharePlatforms(shareButtons) {
    const platforms = new Set();
    shareButtons.forEach(button => {
      if (button.platform) {
        platforms.add(button.platform);
      }
    });
    return Array.from(platforms);
  }

  /**
   * Identify platform from share button
   */
  _identifyPlatform(element) {
    const href = element.href?.toLowerCase() || '';
    const className = element.className?.toLowerCase() || '';
    const text = element.textContent?.toLowerCase() || '';
    
    if (href.includes('facebook') || className.includes('facebook') || text.includes('facebook')) {
      return 'facebook';
    }
    if (href.includes('twitter') || className.includes('twitter') || text.includes('twitter')) {
      return 'twitter';
    }
    if (href.includes('linkedin') || className.includes('linkedin') || text.includes('linkedin')) {
      return 'linkedin';
    }
    if (href.includes('pinterest') || className.includes('pinterest') || text.includes('pinterest')) {
      return 'pinterest';
    }
    
    return 'unknown';
  }

  /**
   * Check if image URL is valid
   */
  _isValidImageUrl(url) {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Calculate image optimization score
   */
  _calculateImageScore(ogImage, twitterImage) {
    let score = 0;
    if (ogImage) score += 50;
    if (twitterImage) score += 50;
    return score;
  }

  /**
   * Calculate overall optimization score
   */
  _calculateOptimizationScore(analysis) {
    const scores = [];
    
    // Platform scores
    Object.values(analysis.platforms).forEach(platform => {
      if (platform.score !== undefined) {
        scores.push(platform.score);
      }
    });
    
    // Other component scores
    if (analysis.sharing.shareScore !== undefined) {
      scores.push(analysis.sharing.shareScore);
    }
    if (analysis.socialProof.score !== undefined) {
      scores.push(analysis.socialProof.score);
    }
    if (analysis.images.score !== undefined) {
      scores.push(analysis.images.score);
    }
    
    const overallScore = scores.length > 0 ? 
      Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
    
    return {
      overallScore,
      componentScores: {
        platforms: this._calculatePlatformAverageScore(analysis.platforms),
        sharing: analysis.sharing.shareScore || 0,
        socialProof: analysis.socialProof.score || 0,
        images: analysis.images.score || 0
      },
      grade: this._getGrade(overallScore)
    };
  }

  /**
   * Calculate average platform score
   */
  _calculatePlatformAverageScore(platforms) {
    const scores = Object.values(platforms)
      .map(p => p.score)
      .filter(score => score !== undefined);
    
    return scores.length > 0 ? 
      Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  }

  /**
   * Generate recommendations
   */
  _generateRecommendations(analysis) {
    const recommendations = [];
    
    // Platform recommendations
    Object.entries(analysis.platforms).forEach(([platform, data]) => {
      if (data.score < 80) {
        recommendations.push({
          category: 'platform',
          platform,
          priority: 'high',
          title: `Improve ${platform} optimization`,
          description: `${platform} score is ${data.score}/100`,
          action: `Review ${platform} meta tags and content`
        });
      }
    });
    
    // Sharing recommendations
    if (analysis.sharing.shareButtonCount === 0) {
      recommendations.push({
        category: 'sharing',
        priority: 'medium',
        title: 'Add social sharing buttons',
        description: 'No social sharing buttons found',
        action: 'Add social media sharing buttons to increase content reach'
      });
    }
    
    // Image recommendations
    if (!analysis.images.ogImage?.present) {
      recommendations.push({
        category: 'images',
        priority: 'high',
        title: 'Add Open Graph image',
        description: 'Missing og:image meta tag',
        action: 'Add an og:image meta tag with a high-quality image'
      });
    }
    
    return recommendations;
  }

  /**
   * Get letter grade for score
   */
  _getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
}
