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
 * @extends BaseAnalyzer
 */

import { BaseAnalyzer } from '../core/base-analyzer.js';
import { AnalyzerCategories } from '../utils/analyzer-categories.js';
import { OpenGraphAnalyzer } from "./platforms/open-graph-analyzer.js";
import { TwitterCardAnalyzer } from "./platforms/twitter-card-analyzer.js";
import { LinkedInAnalyzer } from "./platforms/linkedin-analyzer.js";
import { PinterestAnalyzer } from "./platforms/pinterest-analyzer.js";
import { WhatsAppAnalyzer } from "./platforms/whatsapp-analyzer.js";
import { SocialProofAnalyzer } from "./social-proof-analyzer.js";
import { SOCIAL_MEDIA_STANDARDS } from "./utils/social-constants.js";

export class SocialMediaAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('SocialMediaAnalyzer');
    
    this.category = AnalyzerCategories.CONTENT;
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
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'SocialMediaAnalyzer',
      version: '1.0.0',
      category: AnalyzerCategories.CONTENT,
      description: 'Comprehensive social media optimization analysis including Open Graph, Twitter Cards, and social sharing',
      author: 'Nimrod Galor',
      capabilities: [
        'Open Graph meta tag validation',
        'Twitter Card optimization',
        'LinkedIn meta tag analysis',
        'Pinterest Rich Pins validation',
        'WhatsApp preview optimization',
        'Social sharing button analysis',
        'Social proof element detection'
      ]
    };
  }

  /**
   * Validate the context before analysis
   * @param {Object} context - Analysis context
   * @returns {boolean} Whether the context is valid
   */
  validate(context) {
    return context && 
           context.dom && 
           context.dom.window && 
           context.dom.window.document;
  }

  /**
   * Perform comprehensive social media analysis
   * @param {Object} context - Analysis context containing dom, pageData, etc.
   * @returns {Object} Social media analysis results
   */
  async analyze(context) {
    try {
      this.log('Starting social media analysis');
      
      // Validate context
      if (!this.validate(context)) {
        throw new Error('Invalid context provided for social media analysis');
      }

      const { dom, pageData = {}, url = '' } = context;
      const document = dom.window.document;
      const analysisStart = Date.now();

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

      // BaseAnalyzer integration: comprehensive scoring and summary
      const comprehensiveScore = this._calculateComprehensiveScore(result);
      const recommendations = this._generateSocialMediaRecommendations(result);
      const summary = this._generateSocialMediaSummary(result);
      
      this.log('Social media analysis completed successfully');
      
      return {
        ...result,
        score: comprehensiveScore,
        recommendations: [...result.recommendations, ...recommendations],
        summary,
        metadata: this.getMetadata()
      };
    } catch (error) {
      return this.handleError('Social media analysis failed', error, {
        platforms: null,
        sharing: null,
        socialProof: null,
        images: null,
        optimization: 0,
        recommendations: []
      });
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

  /**
   * Calculate comprehensive social media score for BaseAnalyzer integration
   * @param {Object} analysis - Social media analysis results
   * @returns {number} Comprehensive score (0-100)
   */
  _calculateComprehensiveScore(analysis) {
    try {
      const weights = {
        platforms: 0.40,        // 40% - Platform optimization (OG, Twitter, etc.)
        sharing: 0.20,          // 20% - Social sharing functionality
        socialProof: 0.15,      // 15% - Social proof elements
        images: 0.15,           // 15% - Social image optimization
        optimization: 0.10      // 10% - Overall optimization score
      };

      let totalScore = 0;
      let totalWeight = 0;

      // Platform scores
      if (analysis.platforms) {
        let platformScore = 0;
        let platformCount = 0;

        if (analysis.platforms.openGraph?.score !== undefined) {
          platformScore += analysis.platforms.openGraph.score;
          platformCount++;
        }
        if (analysis.platforms.twitter?.score !== undefined) {
          platformScore += analysis.platforms.twitter.score;
          platformCount++;
        }
        if (analysis.platforms.linkedin?.score !== undefined) {
          platformScore += analysis.platforms.linkedin.score;
          platformCount++;
        }
        if (analysis.platforms.pinterest?.score !== undefined) {
          platformScore += analysis.platforms.pinterest.score;
          platformCount++;
        }
        if (analysis.platforms.whatsapp?.score !== undefined) {
          platformScore += analysis.platforms.whatsapp.score;
          platformCount++;
        }

        if (platformCount > 0) {
          const avgPlatformScore = platformScore / platformCount;
          totalScore += avgPlatformScore * weights.platforms;
          totalWeight += weights.platforms;
        }
      }

      // Sharing score
      if (analysis.sharing?.score !== undefined) {
        totalScore += analysis.sharing.score * weights.sharing;
        totalWeight += weights.sharing;
      }

      // Social proof score
      if (analysis.socialProof?.score !== undefined) {
        totalScore += analysis.socialProof.score * weights.socialProof;
        totalWeight += weights.socialProof;
      }

      // Images score
      if (analysis.images?.score !== undefined) {
        totalScore += analysis.images.score * weights.images;
        totalWeight += weights.images;
      }

      // Optimization score
      if (analysis.optimization !== undefined) {
        totalScore += analysis.optimization * weights.optimization;
        totalWeight += weights.optimization;
      }

      return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    } catch (error) {
      this.log('Error calculating comprehensive score:', error.message);
      return 0;
    }
  }

  /**
   * Generate comprehensive social media recommendations
   * @param {Object} analysis - Social media analysis results
   * @returns {Array} Enhanced recommendations
   */
  _generateSocialMediaRecommendations(analysis) {
    const recommendations = [];

    try {
      // Open Graph optimization
      if (analysis.platforms?.openGraph) {
        const og = analysis.platforms.openGraph;
        if (og.score < 80) {
          recommendations.push({
            category: 'open-graph',
            priority: 'high',
            title: 'Optimize Open Graph Meta Tags',
            description: `Open Graph score: ${og.score}/100`,
            impact: 'Social media preview quality and engagement',
            actionItems: [
              'Add og:title with compelling page title',
              'Include og:description with engaging summary',
              'Set og:image with high-quality social image (1200x630px)',
              'Specify og:url with canonical page URL',
              'Add og:type for content categorization'
            ]
          });
        }
      }

      // Twitter Card optimization
      if (analysis.platforms?.twitter) {
        const twitter = analysis.platforms.twitter;
        if (twitter.score < 80) {
          recommendations.push({
            category: 'twitter-cards',
            priority: 'high',
            title: 'Enhance Twitter Card Implementation',
            description: `Twitter Card score: ${twitter.score}/100`,
            impact: 'Twitter sharing engagement and click-through rates',
            actionItems: [
              'Add twitter:card meta tag (summary_large_image recommended)',
              'Include twitter:title and twitter:description',
              'Set twitter:image with optimized social image',
              'Add twitter:site with brand Twitter handle',
              'Consider twitter:creator for content attribution'
            ]
          });
        }
      }

      // Social sharing functionality
      if (analysis.sharing) {
        const sharing = analysis.sharing;
        if (sharing.buttons.length === 0) {
          recommendations.push({
            category: 'social-sharing',
            priority: 'medium',
            title: 'Add Social Sharing Buttons',
            description: 'No social sharing buttons detected',
            impact: 'Content virality and social engagement',
            actionItems: [
              'Install social sharing widget or plugin',
              'Include major platforms: Facebook, Twitter, LinkedIn',
              'Position buttons prominently (top/bottom of content)',
              'Ensure mobile-friendly button design',
              'Track sharing analytics for optimization'
            ]
          });
        } else if (sharing.score < 70) {
          recommendations.push({
            category: 'social-sharing',
            priority: 'medium',
            title: 'Improve Social Sharing Implementation',
            description: `Sharing functionality score: ${sharing.score}/100`,
            impact: 'Social sharing effectiveness',
            actionItems: [
              'Add more platform options for broader reach',
              'Optimize button placement and visibility',
              'Test sharing functionality across devices',
              'Consider native sharing buttons for better performance'
            ]
          });
        }
      }

      // Social images optimization
      if (analysis.images) {
        const images = analysis.images;
        if (images.score < 70) {
          recommendations.push({
            category: 'social-images',
            priority: 'medium',
            title: 'Optimize Social Media Images',
            description: `Social image optimization score: ${images.score}/100`,
            impact: 'Visual appeal and engagement in social feeds',
            actionItems: [
              'Create dedicated social media images (1200x630px for Facebook/LinkedIn)',
              'Ensure images include readable text and branding',
              'Optimize file sizes for fast loading',
              'Test image previews across different platforms',
              'Add descriptive alt text for accessibility'
            ]
          });
        }
      }

      // Social proof enhancement
      if (analysis.socialProof) {
        const proof = analysis.socialProof;
        if (proof.score < 60) {
          recommendations.push({
            category: 'social-proof',
            priority: 'low',
            title: 'Add Social Proof Elements',
            description: `Social proof score: ${proof.score}/100`,
            impact: 'Credibility and trust building',
            actionItems: [
              'Display social media follower counts',
              'Show recent social media posts or reviews',
              'Add customer testimonials with social links',
              'Include social media feed widgets',
              'Display share counts for popular content'
            ]
          });
        }
      }

      return recommendations;
    } catch (error) {
      this.log('Error generating social media recommendations:', error.message);
      return [];
    }
  }

  /**
   * Generate comprehensive social media summary
   * @param {Object} analysis - Social media analysis results
   * @returns {Object} Social media summary
   */
  _generateSocialMediaSummary(analysis) {
    try {
      const summary = {
        optimizationLevel: 'Poor',
        platformsOptimized: 0,
        hasSharing: false,
        hasSocialProof: false,
        imageOptimization: 'Poor',
        keyFindings: []
      };

      // Determine optimization level
      const score = this._calculateComprehensiveScore(analysis);
      if (score >= 90) summary.optimizationLevel = 'Excellent';
      else if (score >= 80) summary.optimizationLevel = 'Good';
      else if (score >= 70) summary.optimizationLevel = 'Fair';
      else if (score >= 60) summary.optimizationLevel = 'Poor';
      else summary.optimizationLevel = 'Very Poor';

      // Count optimized platforms
      if (analysis.platforms) {
        const platforms = ['openGraph', 'twitter', 'linkedin', 'pinterest', 'whatsapp'];
        platforms.forEach(platform => {
          if (analysis.platforms[platform]?.score >= 80) {
            summary.platformsOptimized++;
          }
        });
      }

      // Check sharing functionality
      if (analysis.sharing?.buttons?.length > 0) {
        summary.hasSharing = true;
        summary.keyFindings.push(`${analysis.sharing.buttons.length} social sharing buttons found`);
      }

      // Check social proof
      if (analysis.socialProof?.elements?.length > 0) {
        summary.hasSocialProof = true;
        summary.keyFindings.push(`${analysis.socialProof.elements.length} social proof elements detected`);
      }

      // Image optimization assessment
      if (analysis.images) {
        const imgScore = analysis.images.score;
        if (imgScore >= 80) summary.imageOptimization = 'Good';
        else if (imgScore >= 60) summary.imageOptimization = 'Fair';
        else summary.imageOptimization = 'Poor';
      }

      // Generate key findings
      if (analysis.platforms?.openGraph?.tags?.['og:title']) {
        summary.keyFindings.push('Open Graph title configured');
      }
      
      if (analysis.platforms?.twitter?.tags?.['twitter:card']) {
        summary.keyFindings.push('Twitter Card implemented');
      }
      
      if (summary.platformsOptimized === 0) {
        summary.keyFindings.push('No platforms fully optimized');
      }

      return summary;
    } catch (error) {
      this.log('Error generating social media summary:', error.message);
      return {
        optimizationLevel: 'Unknown',
        platformsOptimized: 0,
        hasSharing: false,
        hasSocialProof: false,
        imageOptimization: 'Unknown',
        keyFindings: ['Analysis error occurred']
      };
    }
  }

  // ============================================================================
  // LEGACY COMPATIBILITY METHODS
  // ============================================================================

  /**
   * @deprecated Use analyze() method instead
   * Legacy method for backward compatibility
   */
  analyzeSocialMedia(dom, pageData, url) {
    console.warn('SocialMediaAnalyzer.analyzeSocialMedia() is deprecated. Use analyze() method instead.');
    return this.analyze({ dom, pageData, url });
  }
}
