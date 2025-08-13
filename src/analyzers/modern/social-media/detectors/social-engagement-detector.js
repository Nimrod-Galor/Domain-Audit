/**
 * ============================================================================
 * SOCIAL ENGAGEMENT DETECTOR - GPT-5 STYLE MODULAR COMPONENT
 * ============================================================================
 * 
 * Advanced social engagement elements detection and interaction analysis
 * Part of the Combined Approach Social Media Analyzer (10th Implementation)
 * 
 * Features:
 * - Interactive engagement elements detection
 * - Social media widgets and embeds analysis
 * - Comment systems and discussion features
 * - Live chat and communication tools
 * - Social interaction tracking
 * - Community engagement assessment
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration Combined Approach Pattern - GPT-5 Style Detector
 */

export class SocialEngagementDetector {
  constructor(config = {}) {
    this.config = {
      enableWidgetDetection: config.enableWidgetDetection !== false,
      enableCommentAnalysis: config.enableCommentAnalysis !== false,
      enableChatDetection: config.enableChatDetection !== false,
      enableInteractionTracking: config.enableInteractionTracking !== false,
      enableCommunityFeatures: config.enableCommunityFeatures !== false,
      enableEngagementMetrics: config.enableEngagementMetrics !== false,
      platforms: {
        facebook: config.platforms?.facebook !== false,
        twitter: config.platforms?.twitter !== false,
        instagram: config.platforms?.instagram !== false,
        linkedin: config.platforms?.linkedin !== false,
        youtube: config.platforms?.youtube !== false,
        disqus: config.platforms?.disqus !== false,
        ...config.platforms
      },
      minEngagementScore: config.minEngagementScore || 70,
      enableAccessibilityCheck: config.enableAccessibilityCheck !== false,
      ...config
    };

    this.version = '1.0.0';
    this.detectorType = 'social_engagement';
    
    // Social engagement patterns and selectors
    this.engagementPatterns = {
      widgets: {
        facebook: {
          selectors: [
            '.fb-page', '.fb-like', '.fb-share-button', '.fb-comments',
            'iframe[src*="facebook.com"]', '[data-href*="facebook.com"]'
          ],
          indicators: ['facebook', 'fb-', 'meta-']
        },
        twitter: {
          selectors: [
            '.twitter-timeline', '.twitter-tweet', '.twitter-follow-button',
            'iframe[src*="twitter.com"]', 'iframe[src*="x.com"]', '[data-widget-id]'
          ],
          indicators: ['twitter', 'tweet', 'x-']
        },
        instagram: {
          selectors: [
            '.instagram-media', 'iframe[src*="instagram.com"]',
            '[data-instgrm-permalink]', '.ig-embed'
          ],
          indicators: ['instagram', 'ig-', 'instgrm']
        },
        youtube: {
          selectors: [
            'iframe[src*="youtube.com"]', 'iframe[src*="youtu.be"]',
            '.youtube-player', '[data-youtube-id]'
          ],
          indicators: ['youtube', 'youtu.be', 'yt-']
        },
        linkedin: {
          selectors: [
            '.linkedin-share', 'iframe[src*="linkedin.com"]',
            '[data-linkedin]', '.li-badge'
          ],
          indicators: ['linkedin', 'li-']
        }
      },
      comments: {
        selectors: [
          '.comments', '.comment-section', '.discussion',
          '#comments', '#disqus_thread', '.disqus-comments',
          '.comment-form', '.reply-form', '.comment-box'
        ],
        systems: {
          disqus: ['disqus', '#disqus_thread'],
          wordpress: ['wp-comment', 'comment-form'],
          facebook: ['fb-comments', 'facebook-comments'],
          custom: ['comment-section', 'comments-area']
        }
      },
      chat: {
        selectors: [
          '.chat-widget', '.live-chat', '.messenger',
          '.chat-button', '.support-chat', '.help-chat',
          '.intercom-', '.zendesk-', '.tawk-', '.crisp-'
        ],
        providers: {
          intercom: ['intercom', 'intercom-'],
          zendesk: ['zendesk', 'zd-'],
          tawk: ['tawk', 'tawk.to'],
          crisp: ['crisp', '$crisp'],
          drift: ['drift', 'drift-'],
          messenger: ['messenger', 'fb-messenger']
        }
      },
      interactions: {
        like: ['.like', '.thumbs-up', '.heart', '[data-like]'],
        share: ['.share', '.share-button', '[data-share]'],
        follow: ['.follow', '.subscribe', '[data-follow]'],
        vote: ['.vote', '.upvote', '.downvote', '[data-vote]'],
        bookmark: ['.bookmark', '.save', '[data-bookmark]']
      },
      community: {
        forums: ['.forum', '.discussion-board', '.community-forum'],
        groups: ['.group', '.community-group', '.user-group'],
        events: ['.events', '.community-events', '.meetup'],
        polls: ['.poll', '.survey', '.vote-poll']
      }
    };

    this.cache = new Map();
  }

  /**
   * Get detector metadata
   * @returns {Object} Detector metadata
   */
  getMetadata() {
    return {
      name: 'SocialEngagementDetector',
      version: this.version,
      type: this.detectorType,
      description: 'Detects and analyzes social engagement elements and interaction opportunities',
      capabilities: [
        'social_widget_detection',
        'comment_system_analysis',
        'chat_integration_assessment',
        'interaction_element_detection',
        'community_feature_analysis',
        'engagement_metrics_evaluation'
      ],
      platforms: Object.keys(this.config.platforms).filter(p => this.config.platforms[p]),
      performance: 'High',
      accuracy: 'GPT-5 Enhanced'
    };
  }

  /**
   * Detect social engagement elements
   * @param {Object} context - Analysis context containing document and metadata
   * @returns {Promise<Object>} Social engagement detection results
   */
  async detect(context) {
    try {
      const { document, url, pageData } = context;
      
      if (!document) {
        throw new Error('Document is required for social engagement analysis');
      }

      // Check cache
      const cacheKey = this._generateCacheKey(url);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const startTime = Date.now();

      // Phase 1: Social media widgets analysis
      const widgetsAnalysis = this._analyzeSocialWidgets(document);

      // Phase 2: Comment systems analysis
      const commentsAnalysis = this._analyzeCommentSystems(document);

      // Phase 3: Live chat and communication analysis
      const chatAnalysis = this._analyzeChatSystems(document);

      // Phase 4: Interactive elements analysis
      const interactionsAnalysis = this._analyzeInteractiveElements(document);

      // Phase 5: Community features analysis
      const communityAnalysis = this._analyzeCommunityFeatures(document);

      // Phase 6: Engagement metrics analysis
      const metricsAnalysis = this._analyzeEngagementMetrics(document);

      // Calculate overall engagement score
      const overallScore = this._calculateEngagementScore({
        widgets: widgetsAnalysis,
        comments: commentsAnalysis,
        chat: chatAnalysis,
        interactions: interactionsAnalysis,
        community: communityAnalysis,
        metrics: metricsAnalysis
      });

      // Compile comprehensive results
      const results = {
        success: true,
        detectorType: this.detectorType,
        
        // Core analysis results
        widgets: widgetsAnalysis,
        comments: commentsAnalysis,
        chat: chatAnalysis,
        interactions: interactionsAnalysis,
        community: communityAnalysis,
        metrics: metricsAnalysis,
        
        // Overall assessment
        score: overallScore.score,
        grade: overallScore.grade,
        level: overallScore.level,
        engagementOptimized: overallScore.score >= this.config.minEngagementScore,
        engagementLevel: this._categorizeEngagementLevel(overallScore.score),
        
        // Strategic insights
        insights: this._generateEngagementInsights({
          widgets: widgetsAnalysis,
          comments: commentsAnalysis,
          chat: chatAnalysis,
          interactions: interactionsAnalysis,
          community: communityAnalysis,
          metrics: metricsAnalysis
        }),
        
        recommendations: this._generateEngagementRecommendations({
          widgets: widgetsAnalysis,
          comments: commentsAnalysis,
          chat: chatAnalysis,
          interactions: interactionsAnalysis,
          community: communityAnalysis,
          metrics: metricsAnalysis
        }),
        
        // Performance metrics
        performance: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          cacheUsed: false
        }
      };

      // Cache results
      this.cache.set(cacheKey, results);

      return results;

    } catch (error) {
      return {
        success: false,
        error: `Social engagement detection failed: ${error.message}`,
        detectorType: this.detectorType
      };
    }
  }

  /**
   * Analyze social media widgets and embeds
   * @param {Document} document - DOM document
   * @returns {Object} Social widgets analysis results
   */
  _analyzeSocialWidgets(document) {
    const analysis = {
      present: false,
      totalWidgets: 0,
      platforms: {},
      embeds: {},
      performance: {},
      accessibility: {},
      issues: [],
      recommendations: []
    };

    try {
      // Analyze each platform's widgets
      Object.entries(this.engagementPatterns.widgets).forEach(([platform, config]) => {
        if (this.config.platforms[platform]) {
          const platformAnalysis = this._analyzePlatformWidgets(document, platform, config);
          if (platformAnalysis.present) {
            analysis.platforms[platform] = platformAnalysis;
            analysis.totalWidgets += platformAnalysis.count;
          }
        }
      });

      analysis.present = analysis.totalWidgets > 0;

      if (!analysis.present) {
        analysis.issues.push('No social media widgets detected');
        analysis.recommendations.push('Add social media widgets to increase engagement');
        return { ...analysis, score: 0, grade: 'F' };
      }

      // Analyze widget embeds
      analysis.embeds = this._analyzeWidgetEmbeds(document);

      // Analyze widget performance impact
      analysis.performance = this._analyzeWidgetPerformance(document);

      // Analyze widget accessibility
      analysis.accessibility = this._analyzeWidgetAccessibility(document);

      // Generate widget-specific recommendations
      const platformCount = Object.keys(analysis.platforms).length;
      if (platformCount < 2) {
        analysis.recommendations.push('Consider adding widgets from multiple social platforms');
      }

      if (analysis.performance.hasPerformanceIssues) {
        analysis.issues.push('Social widgets may impact page performance');
        analysis.recommendations.push('Optimize social widget loading for better performance');
      }

      if (!analysis.accessibility.accessible) {
        analysis.issues.push('Social widgets lack accessibility features');
        analysis.recommendations.push('Improve social widget accessibility');
      }

      // Calculate widgets score
      const score = this._calculateWidgetsScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze comment systems and discussion features
   * @param {Document} document - DOM document
   * @returns {Object} Comment systems analysis results
   */
  _analyzeCommentSystems(document) {
    const analysis = {
      present: false,
      systems: {},
      features: {},
      moderation: {},
      engagement: {},
      issues: [],
      recommendations: []
    };

    try {
      // Detect comment systems
      const commentElements = document.querySelectorAll(
        this.engagementPatterns.comments.selectors.join(', ')
      );

      analysis.present = commentElements.length > 0;

      if (!analysis.present) {
        analysis.issues.push('No comment system detected');
        analysis.recommendations.push('Add a comment system to enable user discussions');
        return { ...analysis, score: 0, grade: 'F' };
      }

      // Analyze comment system types
      Object.entries(this.engagementPatterns.comments.systems).forEach(([system, indicators]) => {
        const systemPresent = indicators.some(indicator => 
          document.querySelector(indicator) || 
          document.documentElement.innerHTML.includes(indicator)
        );
        
        if (systemPresent) {
          analysis.systems[system] = {
            present: true,
            elements: this._findSystemElements(document, indicators)
          };
        }
      });

      // Analyze comment features
      analysis.features = this._analyzeCommentFeatures(document);

      // Analyze moderation features
      analysis.moderation = this._analyzeModerationFeatures(document);

      // Analyze comment engagement
      analysis.engagement = this._analyzeCommentEngagement(document);

      // Generate comment system recommendations
      if (Object.keys(analysis.systems).length === 0) {
        analysis.recommendations.push('Implement a recognized comment system (Disqus, Facebook Comments, etc.)');
      }

      if (!analysis.features.hasReplyFunction) {
        analysis.recommendations.push('Enable reply functionality for better discussion threads');
      }

      if (!analysis.moderation.hasModeration) {
        analysis.recommendations.push('Implement comment moderation to maintain quality');
      }

      // Calculate comments score
      const score = this._calculateCommentsScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze live chat and communication systems
   * @param {Document} document - DOM document
   * @returns {Object} Chat systems analysis results
   */
  _analyzeChatSystems(document) {
    const analysis = {
      present: false,
      providers: {},
      features: {},
      availability: {},
      integration: {},
      recommendations: []
    };

    try {
      // Detect chat widgets
      const chatElements = document.querySelectorAll(
        this.engagementPatterns.chat.selectors.join(', ')
      );

      analysis.present = chatElements.length > 0;

      // Check for chat providers
      Object.entries(this.engagementPatterns.chat.providers).forEach(([provider, indicators]) => {
        const providerPresent = indicators.some(indicator => 
          document.documentElement.innerHTML.includes(indicator) ||
          document.querySelector(`[class*="${indicator}"], [id*="${indicator}"]`)
        );
        
        if (providerPresent) {
          analysis.providers[provider] = {
            present: true,
            integration: this._analyzeChatIntegration(document, provider, indicators)
          };
        }
      });

      if (!analysis.present && Object.keys(analysis.providers).length === 0) {
        analysis.recommendations.push('Consider adding live chat for immediate customer support');
        return { ...analysis, score: 0, grade: 'F' };
      }

      // Analyze chat features
      analysis.features = this._analyzeChatFeatures(document);

      // Analyze chat availability
      analysis.availability = this._analyzeChatAvailability(document);

      // Analyze chat integration quality
      analysis.integration = this._analyzeChatIntegrationQuality(document);

      // Generate chat recommendations
      if (!analysis.features.hasProactiveChat) {
        analysis.recommendations.push('Enable proactive chat to improve user engagement');
      }

      if (!analysis.availability.showsAvailability) {
        analysis.recommendations.push('Display chat availability status to users');
      }

      // Calculate chat score
      const score = this._calculateChatScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze interactive engagement elements
   * @param {Document} document - DOM document
   * @returns {Object} Interactive elements analysis results
   */
  _analyzeInteractiveElements(document) {
    const analysis = {
      present: false,
      interactions: {},
      totalElements: 0,
      accessibility: {},
      tracking: {},
      recommendations: []
    };

    try {
      // Analyze each interaction type
      Object.entries(this.engagementPatterns.interactions).forEach(([type, selectors]) => {
        const elements = document.querySelectorAll(selectors.join(', '));
        if (elements.length > 0) {
          analysis.interactions[type] = {
            present: true,
            count: elements.length,
            elements: Array.from(elements).slice(0, 5).map(el => ({
              tagName: el.tagName,
              className: el.className,
              text: el.textContent?.trim().substring(0, 50)
            }))
          };
          analysis.totalElements += elements.length;
        }
      });

      analysis.present = analysis.totalElements > 0;

      if (!analysis.present) {
        analysis.recommendations.push('Add interactive elements (like, share, follow buttons) to increase engagement');
        return { ...analysis, score: 0, grade: 'F' };
      }

      // Analyze interaction accessibility
      analysis.accessibility = this._analyzeInteractionAccessibility(document);

      // Analyze interaction tracking
      analysis.tracking = this._analyzeInteractionTracking(document);

      // Generate interaction recommendations
      const interactionTypes = Object.keys(analysis.interactions);
      if (!interactionTypes.includes('like')) {
        analysis.recommendations.push('Add like/reaction buttons for user feedback');
      }

      if (!interactionTypes.includes('share')) {
        analysis.recommendations.push('Include share buttons for content distribution');
      }

      if (!analysis.tracking.hasTracking) {
        analysis.recommendations.push('Implement interaction tracking for analytics');
      }

      // Calculate interactions score
      const score = this._calculateInteractionsScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze community features and social elements
   * @param {Document} document - DOM document
   * @returns {Object} Community features analysis results
   */
  _analyzeCommunityFeatures(document) {
    const analysis = {
      present: false,
      features: {},
      engagement: {},
      participation: {},
      recommendations: []
    };

    try {
      // Analyze community feature types
      Object.entries(this.engagementPatterns.community).forEach(([type, selectors]) => {
        const elements = document.querySelectorAll(selectors.join(', '));
        if (elements.length > 0) {
          analysis.features[type] = {
            present: true,
            count: elements.length,
            active: this._assessFeatureActivity(elements, type)
          };
        }
      });

      analysis.present = Object.keys(analysis.features).length > 0;

      if (!analysis.present) {
        analysis.recommendations.push('Consider adding community features to build user engagement');
        return { ...analysis, score: 50, grade: 'C' }; // Not essential, so moderate score
      }

      // Analyze community engagement
      analysis.engagement = this._analyzeCommunityEngagement(document);

      // Analyze participation opportunities
      analysis.participation = this._analyzeParticipationOpportunities(document);

      // Generate community recommendations
      if (!analysis.features.forums && !analysis.features.groups) {
        analysis.recommendations.push('Create community spaces for user interaction');
      }

      if (!analysis.features.events) {
        analysis.recommendations.push('Add events section to foster community participation');
      }

      // Calculate community score
      const score = this._calculateCommunityScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze engagement metrics and tracking
   * @param {Document} document - DOM document
   * @returns {Object} Engagement metrics analysis results
   */
  _analyzeEngagementMetrics(document) {
    const analysis = {
      present: false,
      analytics: {},
      metrics: {},
      tracking: {},
      reporting: {},
      recommendations: []
    };

    try {
      // Analyze analytics integration
      analysis.analytics = this._analyzeAnalyticsIntegration(document);

      // Analyze visible metrics
      analysis.metrics = this._analyzeVisibleMetrics(document);

      // Analyze engagement tracking
      analysis.tracking = this._analyzeEngagementTracking(document);

      // Analyze reporting capabilities
      analysis.reporting = this._analyzeReportingCapabilities(document);

      analysis.present = analysis.analytics.present || 
                        analysis.metrics.present || 
                        analysis.tracking.present;

      // Generate metrics recommendations
      if (!analysis.analytics.present) {
        analysis.recommendations.push('Implement analytics tracking for engagement measurement');
      }

      if (!analysis.metrics.showsEngagement) {
        analysis.recommendations.push('Display engagement metrics to encourage participation');
      }

      if (!analysis.tracking.tracksInteractions) {
        analysis.recommendations.push('Set up event tracking for user interactions');
      }

      // Calculate metrics score
      const score = this._calculateMetricsScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  _analyzePlatformWidgets(document, platform, config) {
    const elements = document.querySelectorAll(config.selectors.join(', '));
    const scriptContent = document.documentElement.innerHTML;
    
    const hasScriptIntegration = config.indicators.some(indicator => 
      scriptContent.includes(indicator)
    );

    return {
      present: elements.length > 0 || hasScriptIntegration,
      count: elements.length,
      hasScript: hasScriptIntegration,
      types: this._identifyWidgetTypes(elements, platform),
      placement: this._analyzeWidgetPlacement(elements)
    };
  }

  _identifyWidgetTypes(elements, platform) {
    const types = [];
    
    elements.forEach(element => {
      const className = element.className || '';
      const id = element.id || '';
      const combined = className + id;

      if (combined.includes('like')) types.push('like');
      if (combined.includes('share')) types.push('share');
      if (combined.includes('follow')) types.push('follow');
      if (combined.includes('embed')) types.push('embed');
      if (combined.includes('timeline')) types.push('timeline');
      if (combined.includes('comments')) types.push('comments');
    });

    return [...new Set(types)];
  }

  _analyzeWidgetPlacement(elements) {
    const placements = {
      header: 0,
      content: 0,
      sidebar: 0,
      footer: 0
    };

    elements.forEach(element => {
      const parent = element.closest('header, main, aside, footer');
      if (parent) {
        const tagName = parent.tagName.toLowerCase();
        if (placements[tagName] !== undefined) {
          placements[tagName]++;
        }
      }
    });

    return placements;
  }

  _analyzeWidgetEmbeds(document) {
    const iframes = document.querySelectorAll('iframe');
    const embeds = {
      total: iframes.length,
      social: 0,
      responsive: 0,
      lazyLoaded: 0
    };

    iframes.forEach(iframe => {
      const src = iframe.src || '';
      
      if (src.includes('facebook.com') || src.includes('twitter.com') || 
          src.includes('instagram.com') || src.includes('youtube.com')) {
        embeds.social++;
      }

      if (iframe.hasAttribute('loading') && iframe.getAttribute('loading') === 'lazy') {
        embeds.lazyLoaded++;
      }

      if (iframe.style.width === '100%' || iframe.hasAttribute('data-responsive')) {
        embeds.responsive++;
      }
    });

    return embeds;
  }

  _analyzeWidgetPerformance(document) {
    const scripts = document.querySelectorAll('script[src]');
    let externalSocialScripts = 0;
    let hasAsyncLoading = false;

    scripts.forEach(script => {
      const src = script.src || '';
      
      if (src.includes('facebook.com') || src.includes('twitter.com') || 
          src.includes('instagram.com') || src.includes('linkedin.com')) {
        externalSocialScripts++;
        
        if (script.hasAttribute('async') || script.hasAttribute('defer')) {
          hasAsyncLoading = true;
        }
      }
    });

    return {
      externalScripts: externalSocialScripts,
      hasAsyncLoading,
      hasPerformanceIssues: externalSocialScripts > 3 && !hasAsyncLoading
    };
  }

  _analyzeWidgetAccessibility(document) {
    const socialElements = document.querySelectorAll(
      '.fb-like, .twitter-share-button, .linkedin-share, [class*="social"]'
    );

    let accessibleElements = 0;
    
    socialElements.forEach(element => {
      if (element.hasAttribute('aria-label') || element.hasAttribute('title') ||
          element.querySelector('[aria-label], [alt]')) {
        accessibleElements++;
      }
    });

    return {
      total: socialElements.length,
      accessible: accessibleElements,
      accessibilityRatio: socialElements.length > 0 ? accessibleElements / socialElements.length : 0,
      accessible: accessibleElements > 0
    };
  }

  _findSystemElements(document, indicators) {
    const elements = [];
    
    indicators.forEach(indicator => {
      if (indicator.startsWith('#')) {
        const element = document.querySelector(indicator);
        if (element) elements.push(element);
      } else {
        const found = document.querySelectorAll(`[class*="${indicator}"], [id*="${indicator}"]`);
        elements.push(...Array.from(found));
      }
    });

    return elements;
  }

  _analyzeCommentFeatures(document) {
    return {
      hasCommentForm: !!document.querySelector('.comment-form, form[action*="comment"]'),
      hasReplyFunction: !!document.querySelector('.reply, .comment-reply'),
      hasRating: !!document.querySelector('.rating, .stars, [data-rating]'),
      hasThreading: !!document.querySelector('.comment-thread, .nested-comments'),
      hasSorting: !!document.querySelector('.sort-comments, [data-sort]')
    };
  }

  _analyzeModerationFeatures(document) {
    return {
      hasModeration: document.documentElement.innerHTML.includes('moderat') ||
                    document.documentElement.innerHTML.includes('admin') ||
                    !!document.querySelector('.moderator, .admin'),
      hasReporting: !!document.querySelector('.report, .flag'),
      hasSpamProtection: document.documentElement.innerHTML.includes('captcha') ||
                        document.documentElement.innerHTML.includes('recaptcha')
    };
  }

  _analyzeCommentEngagement(document) {
    const commentElements = document.querySelectorAll('.comment, .review, [class*="comment"]');
    
    return {
      commentCount: commentElements.length,
      hasRecentComments: this._hasRecentContent(commentElements),
      hasActiveDiscussion: commentElements.length > 5,
      engagementLevel: commentElements.length > 10 ? 'high' : 
                      commentElements.length > 3 ? 'medium' : 'low'
    };
  }

  _hasRecentContent(elements) {
    // Simplified check for recent content
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    
    return Array.from(elements).some(element => {
      const timeElement = element.querySelector('time, .date, .timestamp');
      if (timeElement) {
        const dateStr = timeElement.textContent || timeElement.getAttribute('datetime');
        const date = new Date(dateStr);
        return date > weekAgo;
      }
      return false;
    });
  }

  _analyzeChatIntegration(document, provider, indicators) {
    const hasWidget = indicators.some(indicator => 
      document.querySelector(`[class*="${indicator}"], [id*="${indicator}"]`)
    );
    
    const hasScript = indicators.some(indicator => 
      document.documentElement.innerHTML.includes(indicator)
    );

    return {
      hasWidget,
      hasScript,
      integration: hasWidget && hasScript ? 'full' : hasWidget ? 'partial' : 'script-only'
    };
  }

  _analyzeChatFeatures(document) {
    return {
      hasProactiveChat: document.documentElement.innerHTML.includes('proactive') ||
                       document.documentElement.innerHTML.includes('auto-open'),
      hasOfflineMessage: !!document.querySelector('.offline-message, .leave-message'),
      hasFileUpload: !!document.querySelector('[type="file"]', '[data-upload]'),
      hasTypingIndicator: document.documentElement.innerHTML.includes('typing'),
      hasEmoji: document.documentElement.innerHTML.includes('emoji') ||
               document.documentElement.innerHTML.includes('emoticon')
    };
  }

  _analyzeChatAvailability(document) {
    return {
      showsAvailability: !!document.querySelector('.online, .offline, .available, .status'),
      hasSchedule: document.documentElement.innerHTML.includes('hours') ||
                  document.documentElement.innerHTML.includes('schedule'),
      hasMultipleAgents: document.documentElement.innerHTML.includes('agent') ||
                        document.documentElement.innerHTML.includes('support team')
    };
  }

  _analyzeChatIntegrationQuality(document) {
    const chatWidgets = document.querySelectorAll(
      this.engagementPatterns.chat.selectors.join(', ')
    );

    return {
      responsive: chatWidgets.length > 0 && 
                 Array.from(chatWidgets).some(widget => 
                   widget.style.position === 'fixed' || 
                   widget.className.includes('responsive')
                 ),
      accessible: Array.from(chatWidgets).some(widget => 
                    widget.hasAttribute('aria-label') || 
                    widget.hasAttribute('role')
                  ),
      performance: !document.documentElement.innerHTML.includes('sync') // Prefer async loading
    };
  }

  _analyzeInteractionAccessibility(document) {
    const interactionElements = document.querySelectorAll(
      Object.values(this.engagementPatterns.interactions).flat().join(', ')
    );

    let accessibleCount = 0;
    
    interactionElements.forEach(element => {
      if (element.hasAttribute('aria-label') || 
          element.hasAttribute('title') ||
          element.textContent?.trim() ||
          element.hasAttribute('role')) {
        accessibleCount++;
      }
    });

    return {
      total: interactionElements.length,
      accessible: accessibleCount,
      accessibilityRatio: interactionElements.length > 0 ? accessibleCount / interactionElements.length : 0,
      keyboardAccessible: Array.from(interactionElements).some(el => 
        el.tagName === 'BUTTON' || el.tagName === 'A' || el.hasAttribute('tabindex')
      )
    };
  }

  _analyzeInteractionTracking(document) {
    const hasGoogleAnalytics = document.documentElement.innerHTML.includes('gtag') ||
                              document.documentElement.innerHTML.includes('ga(');
    
    const hasEventTracking = document.documentElement.innerHTML.includes('track') ||
                            document.documentElement.innerHTML.includes('event');

    const hasDataAttributes = !!document.querySelector('[data-track], [data-event], [data-analytics]');

    return {
      hasTracking: hasGoogleAnalytics || hasEventTracking || hasDataAttributes,
      hasGoogleAnalytics,
      hasEventTracking,
      hasDataAttributes
    };
  }

  _assessFeatureActivity(elements, type) {
    // Simplified activity assessment
    const hasContent = Array.from(elements).some(element => 
      element.textContent?.trim().length > 50
    );
    
    const hasRecentActivity = this._hasRecentContent(elements);
    
    return {
      hasContent,
      hasRecentActivity,
      activityLevel: hasContent && hasRecentActivity ? 'high' : 
                    hasContent ? 'medium' : 'low'
    };
  }

  _analyzeCommunityEngagement(document) {
    const memberCountElements = document.querySelectorAll('.members, .users, .community-size');
    const activityElements = document.querySelectorAll('.activity, .recent, .latest');
    
    return {
      showsMemberCount: memberCountElements.length > 0,
      showsActivity: activityElements.length > 0,
      hasUserProfiles: !!document.querySelector('.profile, .user-profile'),
      hasLeaderboard: !!document.querySelector('.leaderboard, .top-users'),
      engagementVisible: memberCountElements.length > 0 || activityElements.length > 0
    };
  }

  _analyzeParticipationOpportunities(document) {
    return {
      canJoinGroups: !!document.querySelector('.join, .join-group'),
      canCreateContent: !!document.querySelector('.create, .new-post, .submit'),
      canVote: !!document.querySelector('.vote, .upvote, .poll'),
      canComment: !!document.querySelector('.comment, .reply'),
      hasGamification: !!document.querySelector('.points, .badges, .achievements')
    };
  }

  _analyzeAnalyticsIntegration(document) {
    const scripts = document.querySelectorAll('script');
    let hasGoogleAnalytics = false;
    let hasFacebookPixel = false;
    let hasCustomAnalytics = false;

    scripts.forEach(script => {
      const content = script.textContent || script.src || '';
      
      if (content.includes('gtag') || content.includes('analytics.js')) {
        hasGoogleAnalytics = true;
      }
      
      if (content.includes('fbevents.js') || content.includes('facebook.com/tr')) {
        hasFacebookPixel = true;
      }
      
      if (content.includes('analytics') || content.includes('tracking')) {
        hasCustomAnalytics = true;
      }
    });

    return {
      present: hasGoogleAnalytics || hasFacebookPixel || hasCustomAnalytics,
      hasGoogleAnalytics,
      hasFacebookPixel,
      hasCustomAnalytics
    };
  }

  _analyzeVisibleMetrics(document) {
    const metricElements = document.querySelectorAll(
      '.views, .likes, .shares, .comments-count, .engagement, .metrics'
    );

    return {
      present: metricElements.length > 0,
      showsViews: !!document.querySelector('.views, .view-count'),
      showsLikes: !!document.querySelector('.likes, .like-count'),
      showsShares: !!document.querySelector('.shares, .share-count'),
      showsComments: !!document.querySelector('.comments-count, .comment-count'),
      showsEngagement: metricElements.length > 0
    };
  }

  _analyzeEngagementTracking(document) {
    return {
      tracksClicks: document.documentElement.innerHTML.includes('click') &&
                   document.documentElement.innerHTML.includes('track'),
      tracksViews: document.documentElement.innerHTML.includes('view') &&
                  document.documentElement.innerHTML.includes('track'),
      tracksInteractions: !!document.querySelector('[data-track], [onclick*="track"]'),
      tracksScrolling: document.documentElement.innerHTML.includes('scroll') &&
                      document.documentElement.innerHTML.includes('track')
    };
  }

  _analyzeReportingCapabilities(document) {
    return {
      hasReports: !!document.querySelector('.reports, .analytics-dashboard'),
      hasExport: !!document.querySelector('.export, .download'),
      hasFilters: !!document.querySelector('.filter, .date-range'),
      hasRealTime: document.documentElement.innerHTML.includes('real-time') ||
                  document.documentElement.innerHTML.includes('live')
    };
  }

  _calculateEngagementScore(components) {
    const weights = {
      widgets: 0.25,
      comments: 0.20,
      chat: 0.15,
      interactions: 0.20,
      community: 0.10,
      metrics: 0.10
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([component, weight]) => {
      if (components[component] && components[component].score !== undefined) {
        totalScore += components[component].score * weight;
        totalWeight += weight;
      }
    });

    const score = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    const grade = this._calculateGrade(score);
    const level = this._categorizeLevel(score);

    return { score, grade, level };
  }

  _calculateWidgetsScore(analysis) {
    let score = 40; // Base score for presence

    // Platform diversity (30 points)
    const platformCount = Object.keys(analysis.platforms).length;
    score += Math.min(platformCount / 3, 1) * 30;

    // Widget variety (20 points)
    const totalTypes = new Set();
    Object.values(analysis.platforms).forEach(platform => {
      platform.types?.forEach(type => totalTypes.add(type));
    });
    score += Math.min(totalTypes.size / 4, 1) * 20;

    // Performance (10 points)
    if (!analysis.performance.hasPerformanceIssues) score += 10;

    // Deduct for issues
    score -= analysis.issues.length * 5;

    return Math.max(0, Math.min(100, score));
  }

  _calculateCommentsScore(analysis) {
    let score = 50; // Base score for presence

    // System quality (25 points)
    const systemCount = Object.keys(analysis.systems).length;
    if (systemCount > 0) score += 25;

    // Features (25 points)
    const featureKeys = Object.keys(analysis.features);
    const activeFeatures = featureKeys.filter(key => analysis.features[key]).length;
    score += (activeFeatures / featureKeys.length) * 25;

    return Math.max(0, Math.min(100, score));
  }

  _calculateChatScore(analysis) {
    if (!analysis.present && Object.keys(analysis.providers).length === 0) {
      return 0;
    }

    let score = 60; // Base score for presence

    // Provider quality (20 points)
    const providerCount = Object.keys(analysis.providers).length;
    if (providerCount > 0) score += 20;

    // Features (20 points)
    const featureKeys = Object.keys(analysis.features);
    const activeFeatures = featureKeys.filter(key => analysis.features[key]).length;
    score += (activeFeatures / featureKeys.length) * 20;

    return Math.max(0, Math.min(100, score));
  }

  _calculateInteractionsScore(analysis) {
    let score = 40; // Base score for presence

    // Interaction variety (30 points)
    const interactionCount = Object.keys(analysis.interactions).length;
    score += Math.min(interactionCount / 4, 1) * 30;

    // Accessibility (20 points)
    if (analysis.accessibility.accessibilityRatio > 0.8) score += 20;
    else if (analysis.accessibility.accessibilityRatio > 0.5) score += 10;

    // Tracking (10 points)
    if (analysis.tracking.hasTracking) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  _calculateCommunityScore(analysis) {
    if (!analysis.present) return 50; // Not essential, so moderate baseline

    let score = 60; // Base score for presence

    // Feature variety (25 points)
    const featureCount = Object.keys(analysis.features).length;
    score += Math.min(featureCount / 4, 1) * 25;

    // Engagement (15 points)
    if (analysis.engagement.engagementVisible) score += 15;

    return Math.max(0, Math.min(100, score));
  }

  _calculateMetricsScore(analysis) {
    let score = 50; // Base score

    // Analytics (30 points)
    if (analysis.analytics.present) score += 30;

    // Visible metrics (20 points)
    if (analysis.metrics.showsEngagement) score += 20;

    return Math.max(0, Math.min(100, score));
  }

  _categorizeEngagementLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'very_good';
    if (score >= 70) return 'good';
    if (score >= 60) return 'moderate';
    if (score >= 50) return 'basic';
    return 'minimal';
  }

  _generateEngagementInsights(components) {
    const insights = [];

    // Widget insights
    if (components.widgets.present && components.widgets.score > 80) {
      insights.push({
        type: 'positive',
        category: 'widgets',
        message: 'Strong social media widget integration detected',
        impact: 'high'
      });
    }

    // Chat insights
    if (Object.keys(components.chat.providers).length > 0) {
      insights.push({
        type: 'positive',
        category: 'chat',
        message: 'Live chat system available for immediate engagement',
        impact: 'high'
      });
    }

    // Comment insights
    if (!components.comments.present) {
      insights.push({
        type: 'opportunity',
        category: 'comments',
        message: 'Missing comment system - opportunity for user discussions',
        impact: 'medium'
      });
    }

    return insights;
  }

  _generateEngagementRecommendations(components) {
    const recommendations = [];

    // Collect recommendations from all components
    Object.values(components).forEach(component => {
      if (component.recommendations) {
        recommendations.push(...component.recommendations.map(rec => ({
          text: rec,
          category: 'engagement',
          priority: 'medium',
          complexity: 'medium'
        })));
      }
    });

    return recommendations.slice(0, 10); // Limit recommendations
  }

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
    if (score >= 65) return 'D';
    return 'F';
  }

  _categorizeLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'satisfactory';
    if (score >= 60) return 'needs_improvement';
    return 'poor';
  }

  _generateCacheKey(url) {
    return btoa(url || 'unknown').slice(0, 20);
  }
}

export default SocialEngagementDetector;
