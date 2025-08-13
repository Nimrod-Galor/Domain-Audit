/**
 * ============================================================================
 * SHARING OPTIMIZATION DETECTOR - GPT-5 STYLE MODULAR COMPONENT
 * ============================================================================
 * 
 * Advanced social sharing optimization detection and analysis
 * Part of the Combined Approach Social Media Analyzer (10th Implementation)
 * 
 * Features:
 * - Social sharing button analysis and optimization
 * - Share count and engagement tracking
 * - Sharing placement and accessibility
 * - Mobile sharing optimization
 * - Content sharing optimization
 * - Social widget performance analysis
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration Combined Approach Pattern - GPT-5 Style Detector
 */

export class SharingOptimizationDetector {
  constructor(config = {}) {
    this.config = {
      enableImageAnalysis: config.enableImageAnalysis !== false,
      enableContentValidation: config.enableContentValidation !== false,
      platforms: {
        facebook: config.platforms?.facebook !== false,
        twitter: config.platforms?.twitter !== false,
        linkedin: config.platforms?.linkedin !== false,
        pinterest: config.platforms?.pinterest !== false,
        whatsapp: config.platforms?.whatsapp !== false,
        email: config.platforms?.email !== false,
        ...config.platforms
      },
      enableAccessibilityCheck: config.enableAccessibilityCheck !== false,
      enablePerformanceAnalysis: config.enablePerformanceAnalysis !== false,
      ...config
    };

    this.version = '1.0.0';
    this.detectorType = 'sharing_optimization';
    
    // Sharing optimization standards and best practices
    this.sharingStandards = {
      buttons: {
        minPlatforms: 3,
        maxPlatforms: 6,
        placement: ['header', 'content', 'footer'],
        accessibility: ['aria-label', 'role', 'keyboard-accessible'],
        design: ['consistent-styling', 'clear-icons', 'appropriate-size']
      },
      content: {
        title: { minLength: 10, maxLength: 60 },
        description: { minLength: 50, maxLength: 160 },
        images: {
          minWidth: 600,
          minHeight: 315,
          aspectRatio: 1.91,
          formats: ['jpg', 'png', 'webp']
        }
      },
      performance: {
        maxLoadTime: 3000, // milliseconds
        maxExternalRequests: 5,
        enableLazyLoading: true
      },
      engagement: {
        trackShares: true,
        enableCounts: true,
        enableRecommendations: true
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
      name: 'SharingOptimizationDetector',
      version: this.version,
      type: this.detectorType,
      description: 'Detects and analyzes social sharing optimization opportunities',
      capabilities: [
        'social_sharing_button_analysis',
        'share_count_engagement_tracking',
        'sharing_placement_optimization',
        'mobile_sharing_optimization',
        'content_sharing_analysis',
        'social_widget_performance_analysis'
      ],
      platforms: Object.keys(this.config.platforms).filter(p => this.config.platforms[p]),
      performance: 'High',
      accuracy: 'GPT-5 Enhanced'
    };
  }

  /**
   * Detect sharing optimization components
   * @param {Object} context - Analysis context containing document and metadata
   * @returns {Promise<Object>} Sharing optimization detection results
   */
  async detect(context) {
    try {
      const { document, url, pageData } = context;
      
      if (!document) {
        throw new Error('Document is required for sharing optimization analysis');
      }

      // Check cache
      const cacheKey = this._generateCacheKey(url);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const startTime = Date.now();

      // Phase 1: Social sharing button analysis
      const buttonAnalysis = this._analyzeSharingButtons(document);

      // Phase 2: Content sharing optimization analysis
      const contentAnalysis = this._analyzeContentSharing(document, url);

      // Phase 3: Sharing placement and accessibility analysis
      const placementAnalysis = this._analyzeSharingPlacement(document);

      // Phase 4: Mobile sharing optimization analysis
      const mobileAnalysis = this._analyzeMobileSharing(document);

      // Phase 5: Social widget performance analysis
      const performanceAnalysis = this._analyzeSharingPerformance(document);

      // Phase 6: Engagement tracking analysis
      const engagementAnalysis = this._analyzeEngagementTracking(document);

      // Calculate overall sharing optimization score
      const overallScore = this._calculateSharingScore({
        buttons: buttonAnalysis,
        content: contentAnalysis,
        placement: placementAnalysis,
        mobile: mobileAnalysis,
        performance: performanceAnalysis,
        engagement: engagementAnalysis
      });

      // Compile comprehensive results
      const results = {
        success: true,
        detectorType: this.detectorType,
        
        // Core analysis results
        buttons: buttonAnalysis,
        content: contentAnalysis,
        placement: placementAnalysis,
        mobile: mobileAnalysis,
        performance: performanceAnalysis,
        engagement: engagementAnalysis,
        
        // Overall assessment
        score: overallScore.score,
        grade: overallScore.grade,
        level: overallScore.level,
        sharingOptimized: overallScore.score >= 75,
        
        // Strategic insights
        insights: this._generateSharingInsights({
          buttons: buttonAnalysis,
          content: contentAnalysis,
          placement: placementAnalysis,
          mobile: mobileAnalysis,
          performance: performanceAnalysis,
          engagement: engagementAnalysis
        }),
        
        recommendations: this._generateSharingRecommendations({
          buttons: buttonAnalysis,
          content: contentAnalysis,
          placement: placementAnalysis,
          mobile: mobileAnalysis,
          performance: performanceAnalysis,
          engagement: engagementAnalysis
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
        error: `Sharing optimization detection failed: ${error.message}`,
        detectorType: this.detectorType
      };
    }
  }

  /**
   * Analyze social sharing buttons
   * @param {Document} document - DOM document
   * @returns {Object} Sharing button analysis results
   */
  _analyzeSharingButtons(document) {
    const analysis = {
      present: false,
      platforms: {},
      count: 0,
      placement: [],
      design: {},
      accessibility: {},
      issues: [],
      recommendations: []
    };

    try {
      // Common sharing button selectors
      const sharingSelectors = [
        '.share-button', '.social-share', '.share-link',
        '[class*="share"]', '[class*="social"]',
        'a[href*="facebook.com/share"]', 'a[href*="twitter.com/share"]',
        'a[href*="linkedin.com/share"]', 'a[href*="pinterest.com/pin"]',
        'a[href*="whatsapp.com/send"]', 'a[href*="mailto:"]'
      ];

      const sharingElements = document.querySelectorAll(sharingSelectors.join(', '));
      analysis.count = sharingElements.length;
      analysis.present = analysis.count > 0;

      if (!analysis.present) {
        analysis.issues.push('No social sharing buttons detected');
        analysis.recommendations.push('Add social sharing buttons to increase content reach');
        return { ...analysis, score: 0, grade: 'F' };
      }

      // Analyze individual sharing buttons
      sharingElements.forEach(element => {
        const platform = this._identifyPlatform(element);
        if (platform) {
          if (!analysis.platforms[platform]) {
            analysis.platforms[platform] = { count: 0, elements: [] };
          }
          analysis.platforms[platform].count++;
          analysis.platforms[platform].elements.push({
            href: element.href,
            text: element.textContent?.trim(),
            hasIcon: this._hasIcon(element),
            placement: this._getElementPlacement(element, document)
          });
        }
      });

      // Analyze button placement
      analysis.placement = this._analyzePlacement(sharingElements, document);

      // Analyze design consistency
      analysis.design = this._analyzeDesign(sharingElements);

      // Analyze accessibility
      analysis.accessibility = this._analyzeAccessibility(sharingElements);

      // Generate platform-specific recommendations
      const platformCount = Object.keys(analysis.platforms).length;
      if (platformCount < this.sharingStandards.buttons.minPlatforms) {
        analysis.issues.push(`Too few sharing platforms (${platformCount})`);
        analysis.recommendations.push('Add more social sharing platforms for better reach');
      }

      if (platformCount > this.sharingStandards.buttons.maxPlatforms) {
        analysis.recommendations.push('Consider limiting sharing platforms to avoid clutter');
      }

      // Check for popular platforms
      const popularPlatforms = ['facebook', 'twitter', 'linkedin'];
      const missingPopular = popularPlatforms.filter(p => !analysis.platforms[p]);
      if (missingPopular.length > 0) {
        analysis.recommendations.push(`Consider adding: ${missingPopular.join(', ')}`);
      }

      // Accessibility issues
      if (!analysis.accessibility.hasAriaLabels) {
        analysis.issues.push('Sharing buttons lack accessibility labels');
        analysis.recommendations.push('Add aria-label attributes to sharing buttons');
      }

      if (!analysis.accessibility.keyboardAccessible) {
        analysis.issues.push('Sharing buttons not keyboard accessible');
        analysis.recommendations.push('Ensure sharing buttons are keyboard accessible');
      }

      // Calculate sharing buttons score
      const score = this._calculateButtonScore(analysis);
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
   * Analyze content sharing optimization
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Object} Content sharing analysis results
   */
  _analyzeContentSharing(document, url) {
    const analysis = {
      title: {},
      description: {},
      images: {},
      url: {},
      shareableContent: {},
      issues: [],
      recommendations: []
    };

    try {
      // Analyze title optimization
      const title = document.querySelector('title')?.textContent?.trim() ||
                   document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                   document.querySelector('h1')?.textContent?.trim();

      analysis.title = {
        present: !!title,
        content: title,
        length: title ? title.length : 0,
        optimal: title && title.length >= this.sharingStandards.content.title.minLength &&
                title.length <= this.sharingStandards.content.title.maxLength
      };

      // Analyze description optimization
      const description = document.querySelector('meta[name="description"]')?.getAttribute('content') ||
                         document.querySelector('meta[property="og:description"]')?.getAttribute('content');

      analysis.description = {
        present: !!description,
        content: description,
        length: description ? description.length : 0,
        optimal: description && description.length >= this.sharingStandards.content.description.minLength &&
                description.length <= this.sharingStandards.content.description.maxLength
      };

      // Analyze image optimization
      analysis.images = this._analyzeContentImages(document);

      // Analyze URL optimization
      analysis.url = {
        present: !!url,
        canonical: !!document.querySelector('link[rel="canonical"]'),
        clean: url ? this._isCleanUrl(url) : false
      };

      // Analyze shareable content elements
      analysis.shareableContent = this._analyzeShareableContent(document);

      // Generate content optimization recommendations
      if (!analysis.title.optimal) {
        if (!analysis.title.present) {
          analysis.issues.push('Missing title for social sharing');
          analysis.recommendations.push('Add compelling title for social media sharing');
        } else if (analysis.title.length < this.sharingStandards.content.title.minLength) {
          analysis.issues.push('Title too short for optimal sharing');
          analysis.recommendations.push('Expand title to at least 10 characters');
        } else if (analysis.title.length > this.sharingStandards.content.title.maxLength) {
          analysis.issues.push('Title too long for optimal sharing');
          analysis.recommendations.push('Shorten title to 60 characters or less');
        }
      }

      if (!analysis.description.optimal) {
        if (!analysis.description.present) {
          analysis.issues.push('Missing description for social sharing');
          analysis.recommendations.push('Add meta description for better social previews');
        } else if (analysis.description.length < this.sharingStandards.content.description.minLength) {
          analysis.recommendations.push('Expand description for better social engagement');
        } else if (analysis.description.length > this.sharingStandards.content.description.maxLength) {
          analysis.recommendations.push('Shorten description for optimal social display');
        }
      }

      if (!analysis.images.hasOptimizedImage) {
        analysis.issues.push('No optimized images for social sharing');
        analysis.recommendations.push('Add optimized images for social media sharing');
      }

      if (!analysis.url.canonical) {
        analysis.recommendations.push('Add canonical URL for consistent sharing');
      }

      // Calculate content sharing score
      const score = this._calculateContentScore(analysis);
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
   * Analyze sharing placement and positioning
   * @param {Document} document - DOM document
   * @returns {Object} Placement analysis results
   */
  _analyzeSharingPlacement(document) {
    const analysis = {
      locations: {},
      sticky: false,
      floating: false,
      inline: false,
      visibility: {},
      positioning: {},
      recommendations: []
    };

    try {
      const sharingElements = document.querySelectorAll('[class*="share"], [class*="social"]');
      
      if (sharingElements.length === 0) {
        return { ...analysis, score: 0, grade: 'F' };
      }

      // Analyze placement locations
      sharingElements.forEach(element => {
        const placement = this._getElementPlacement(element, document);
        if (!analysis.locations[placement]) {
          analysis.locations[placement] = 0;
        }
        analysis.locations[placement]++;

        // Check for sticky/floating elements
        const style = window.getComputedStyle ? window.getComputedStyle(element) : {};
        if (style.position === 'fixed' || style.position === 'sticky') {
          analysis.sticky = true;
        }

        // Check for floating elements
        if (element.classList.contains('floating') || element.classList.contains('fixed')) {
          analysis.floating = true;
        }
      });

      // Check for inline sharing
      const contentArea = document.querySelector('article, .content, main, .post');
      if (contentArea) {
        const inlineSharing = contentArea.querySelectorAll('[class*="share"]');
        analysis.inline = inlineSharing.length > 0;
      }

      // Analyze visibility and positioning
      analysis.visibility = {
        aboveFold: this._hasAboveFoldSharing(document),
        belowContent: this._hasBelowContentSharing(document),
        multiple: Object.keys(analysis.locations).length > 1
      };

      // Generate placement recommendations
      if (!analysis.visibility.aboveFold) {
        analysis.recommendations.push('Add sharing buttons above the fold for better visibility');
      }

      if (!analysis.inline && contentArea) {
        analysis.recommendations.push('Consider inline sharing within content for better engagement');
      }

      if (!analysis.visibility.multiple) {
        analysis.recommendations.push('Add sharing buttons in multiple locations for better accessibility');
      }

      // Calculate placement score
      const score = this._calculatePlacementScore(analysis);
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
   * Analyze mobile sharing optimization
   * @param {Document} document - DOM document
   * @returns {Object} Mobile sharing analysis results
   */
  _analyzeMobileSharing(document) {
    const analysis = {
      mobileOptimized: false,
      touchFriendly: false,
      responsiveDesign: false,
      nativeSharing: false,
      issues: [],
      recommendations: []
    };

    try {
      const sharingElements = document.querySelectorAll('[class*="share"], [class*="social"]');
      
      if (sharingElements.length === 0) {
        return { ...analysis, score: 0, grade: 'F' };
      }

      // Check for mobile-specific sharing features
      const webShareAPI = document.documentElement.innerHTML.includes('navigator.share');
      analysis.nativeSharing = webShareAPI;

      // Check for touch-friendly design
      analysis.touchFriendly = this._analyzeTouchFriendliness(sharingElements);

      // Check for responsive design
      analysis.responsiveDesign = this._analyzeResponsiveSharing(document);

      // Overall mobile optimization
      analysis.mobileOptimized = analysis.touchFriendly && analysis.responsiveDesign;

      // Generate mobile-specific recommendations
      if (!analysis.nativeSharing) {
        analysis.recommendations.push('Consider implementing Web Share API for native mobile sharing');
      }

      if (!analysis.touchFriendly) {
        analysis.issues.push('Sharing buttons not optimized for touch interaction');
        analysis.recommendations.push('Increase button size and spacing for better touch interaction');
      }

      if (!analysis.responsiveDesign) {
        analysis.issues.push('Sharing buttons not responsive on mobile devices');
        analysis.recommendations.push('Implement responsive design for sharing buttons');
      }

      // Calculate mobile sharing score
      const score = this._calculateMobileScore(analysis);
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
   * Analyze sharing performance
   * @param {Document} document - DOM document
   * @returns {Object} Performance analysis results
   */
  _analyzeSharingPerformance(document) {
    const analysis = {
      loadTime: {},
      externalRequests: {},
      lazyLoading: false,
      caching: false,
      optimization: {},
      recommendations: []
    };

    try {
      // Analyze external sharing scripts
      const externalScripts = document.querySelectorAll('script[src*="facebook"], script[src*="twitter"], script[src*="linkedin"]');
      analysis.externalRequests = {
        count: externalScripts.length,
        scripts: Array.from(externalScripts).map(script => script.src)
      };

      // Check for lazy loading
      const lazyElements = document.querySelectorAll('[loading="lazy"], [data-src]');
      analysis.lazyLoading = lazyElements.length > 0;

      // Check for performance optimization
      const asyncScripts = document.querySelectorAll('script[async], script[defer]');
      analysis.optimization.asyncLoading = asyncScripts.length > 0;

      // Generate performance recommendations
      if (analysis.externalRequests.count > this.sharingStandards.performance.maxExternalRequests) {
        analysis.recommendations.push('Reduce number of external sharing scripts for better performance');
      }

      if (!analysis.lazyLoading && analysis.externalRequests.count > 0) {
        analysis.recommendations.push('Implement lazy loading for sharing widgets');
      }

      if (!analysis.optimization.asyncLoading) {
        analysis.recommendations.push('Load sharing scripts asynchronously to improve page performance');
      }

      // Calculate performance score
      const score = this._calculatePerformanceScore(analysis);
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
   * Analyze engagement tracking
   * @param {Document} document - DOM document
   * @returns {Object} Engagement analysis results
   */
  _analyzeEngagementTracking(document) {
    const analysis = {
      trackingImplemented: false,
      shareCountsVisible: false,
      analytics: {},
      recommendations: []
    };

    try {
      // Check for sharing analytics
      const analyticsScripts = document.querySelectorAll('script');
      let hasAnalytics = false;
      
      analyticsScripts.forEach(script => {
        const content = script.textContent || '';
        if (content.includes('gtag') || content.includes('analytics') || content.includes('track')) {
          hasAnalytics = true;
        }
      });

      analysis.analytics.present = hasAnalytics;

      // Check for share counts
      const shareCounts = document.querySelectorAll('.share-count, [class*="count"]');
      analysis.shareCountsVisible = shareCounts.length > 0;

      // Check for tracking events
      const trackingEvents = document.querySelectorAll('[onclick*="track"], [data-track]');
      analysis.trackingImplemented = trackingEvents.length > 0 || hasAnalytics;

      // Generate engagement recommendations
      if (!analysis.trackingImplemented) {
        analysis.recommendations.push('Implement sharing analytics to track engagement');
      }

      if (!analysis.shareCountsVisible) {
        analysis.recommendations.push('Consider showing share counts to encourage more sharing');
      }

      // Calculate engagement score
      const score = this._calculateEngagementScore(analysis);
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

  _identifyPlatform(element) {
    const href = element.href || '';
    const className = element.className || '';
    const text = element.textContent?.toLowerCase() || '';

    if (href.includes('facebook.com') || className.includes('facebook') || text.includes('facebook')) return 'facebook';
    if (href.includes('twitter.com') || className.includes('twitter') || text.includes('twitter')) return 'twitter';
    if (href.includes('linkedin.com') || className.includes('linkedin') || text.includes('linkedin')) return 'linkedin';
    if (href.includes('pinterest.com') || className.includes('pinterest') || text.includes('pinterest')) return 'pinterest';
    if (href.includes('whatsapp.com') || className.includes('whatsapp') || text.includes('whatsapp')) return 'whatsapp';
    if (href.includes('mailto:') || className.includes('email') || text.includes('email')) return 'email';

    return 'unknown';
  }

  _hasIcon(element) {
    return !!(
      element.querySelector('i, svg, img') ||
      element.innerHTML.includes('icon') ||
      element.innerHTML.includes('fa-')
    );
  }

  _getElementPlacement(element, document) {
    const header = document.querySelector('header, .header');
    const main = document.querySelector('main, .main, .content');
    const footer = document.querySelector('footer, .footer');

    if (header && header.contains(element)) return 'header';
    if (footer && footer.contains(element)) return 'footer';
    if (main && main.contains(element)) return 'content';
    
    return 'other';
  }

  _analyzePlacement(elements, document) {
    const placements = {};
    
    elements.forEach(element => {
      const placement = this._getElementPlacement(element, document);
      placements[placement] = (placements[placement] || 0) + 1;
    });

    return placements;
  }

  _analyzeDesign(elements) {
    const design = {
      consistent: true,
      hasIcons: 0,
      hasText: 0,
      styling: 'unknown'
    };

    elements.forEach(element => {
      if (this._hasIcon(element)) design.hasIcons++;
      if (element.textContent?.trim()) design.hasText++;
    });

    return design;
  }

  _analyzeAccessibility(elements) {
    const accessibility = {
      hasAriaLabels: false,
      keyboardAccessible: false,
      hasAltText: false
    };

    elements.forEach(element => {
      if (element.hasAttribute('aria-label') || element.hasAttribute('aria-describedby')) {
        accessibility.hasAriaLabels = true;
      }
      
      if (element.tabIndex >= 0 || element.tagName === 'A' || element.tagName === 'BUTTON') {
        accessibility.keyboardAccessible = true;
      }

      const img = element.querySelector('img');
      if (img && img.hasAttribute('alt')) {
        accessibility.hasAltText = true;
      }
    });

    return accessibility;
  }

  _analyzeContentImages(document) {
    const images = {
      hasOptimizedImage: false,
      totalImages: 0,
      socialImages: 0,
      specifications: {}
    };

    // Check for social media optimized images
    const ogImage = document.querySelector('meta[property="og:image"]');
    const twitterImage = document.querySelector('meta[name="twitter:image"]');

    images.hasOptimizedImage = !!(ogImage || twitterImage);
    
    if (ogImage) {
      images.specifications.openGraph = {
        url: ogImage.getAttribute('content'),
        width: document.querySelector('meta[property="og:image:width"]')?.getAttribute('content'),
        height: document.querySelector('meta[property="og:image:height"]')?.getAttribute('content')
      };
    }

    // Count content images
    const contentImages = document.querySelectorAll('img');
    images.totalImages = contentImages.length;

    return images;
  }

  _isCleanUrl(url) {
    try {
      const urlObj = new URL(url);
      const hasParameters = urlObj.search.length > 0;
      const hasFragment = urlObj.hash.length > 0;
      return !hasParameters && !hasFragment;
    } catch {
      return false;
    }
  }

  _analyzeShareableContent(document) {
    return {
      hasArticle: !!document.querySelector('article'),
      hasHeadings: document.querySelectorAll('h1, h2, h3').length > 0,
      hasStructuredData: document.querySelectorAll('script[type="application/ld+json"]').length > 0,
      wordCount: this._estimateWordCount(document)
    };
  }

  _estimateWordCount(document) {
    const content = document.querySelector('article, .content, main')?.textContent || document.body.textContent || '';
    return content.trim().split(/\s+/).length;
  }

  _hasAboveFoldSharing(document) {
    const header = document.querySelector('header, .header');
    return !!(header && header.querySelector('[class*="share"], [class*="social"]'));
  }

  _hasBelowContentSharing(document) {
    const footer = document.querySelector('footer, .footer');
    return !!(footer && footer.querySelector('[class*="share"], [class*="social"]'));
  }

  _analyzeTouchFriendliness(elements) {
    // Simplified touch-friendliness check
    let touchFriendly = true;
    
    elements.forEach(element => {
      const rect = element.getBoundingClientRect ? element.getBoundingClientRect() : { width: 20, height: 20 };
      if (rect.width < 44 || rect.height < 44) {
        touchFriendly = false;
      }
    });

    return touchFriendly;
  }

  _analyzeResponsiveSharing(document) {
    // Check for responsive design indicators
    const viewport = document.querySelector('meta[name="viewport"]');
    const responsiveCSS = document.querySelector('style, link[rel="stylesheet"]');
    
    return !!(viewport && responsiveCSS);
  }

  _calculateSharingScore(components) {
    const weights = {
      buttons: 0.30,
      content: 0.25,
      placement: 0.20,
      mobile: 0.15,
      performance: 0.05,
      engagement: 0.05
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

  _calculateButtonScore(analysis) {
    let score = 40; // Base score for presence

    // Platform coverage (30 points)
    const platformCount = Object.keys(analysis.platforms).length;
    score += Math.min(platformCount / this.sharingStandards.buttons.maxPlatforms, 1) * 30;

    // Accessibility (20 points)
    if (analysis.accessibility.hasAriaLabels) score += 10;
    if (analysis.accessibility.keyboardAccessible) score += 10;

    // Design (10 points)
    if (analysis.design.hasIcons > 0) score += 5;
    if (analysis.design.consistent) score += 5;

    // Deduct for issues
    score -= analysis.issues.length * 5;

    return Math.max(0, Math.min(100, score));
  }

  _calculateContentScore(analysis) {
    let score = 0;

    if (analysis.title.optimal) score += 25;
    if (analysis.description.optimal) score += 25;
    if (analysis.images.hasOptimizedImage) score += 25;
    if (analysis.url.canonical) score += 10;
    if (analysis.shareableContent.hasStructuredData) score += 15;

    return Math.max(0, Math.min(100, score));
  }

  _calculatePlacementScore(analysis) {
    let score = 50; // Base score

    if (analysis.visibility.aboveFold) score += 20;
    if (analysis.visibility.multiple) score += 15;
    if (analysis.inline) score += 10;
    if (analysis.sticky || analysis.floating) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  _calculateMobileScore(analysis) {
    let score = 50; // Base score

    if (analysis.touchFriendly) score += 25;
    if (analysis.responsiveDesign) score += 20;
    if (analysis.nativeSharing) score += 5;

    score -= analysis.issues.length * 10;

    return Math.max(0, Math.min(100, score));
  }

  _calculatePerformanceScore(analysis) {
    let score = 70; // Base score

    if (analysis.externalRequests.count <= this.sharingStandards.performance.maxExternalRequests) {
      score += 15;
    } else {
      score -= (analysis.externalRequests.count - this.sharingStandards.performance.maxExternalRequests) * 5;
    }

    if (analysis.lazyLoading) score += 10;
    if (analysis.optimization.asyncLoading) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  _calculateEngagementScore(analysis) {
    let score = 50; // Base score

    if (analysis.trackingImplemented) score += 25;
    if (analysis.shareCountsVisible) score += 15;
    if (analysis.analytics.present) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  _generateSharingInsights(components) {
    const insights = [];

    // Button insights
    if (components.buttons.present && components.buttons.score > 75) {
      insights.push({
        type: 'positive',
        category: 'buttons',
        message: 'Well-implemented social sharing buttons detected',
        impact: 'high'
      });
    }

    // Content insights
    if (components.content.images.hasOptimizedImage) {
      insights.push({
        type: 'positive',
        category: 'content',
        message: 'Social media optimized images found',
        impact: 'medium'
      });
    }

    // Mobile insights
    if (!components.mobile.mobileOptimized) {
      insights.push({
        type: 'opportunity',
        category: 'mobile',
        message: 'Mobile sharing optimization needed',
        impact: 'high'
      });
    }

    return insights;
  }

  _generateSharingRecommendations(components) {
    const recommendations = [];

    // Collect recommendations from all components
    Object.values(components).forEach(component => {
      if (component.recommendations) {
        recommendations.push(...component.recommendations.map(rec => ({
          text: rec,
          category: 'sharing',
          priority: 'medium',
          complexity: 'low'
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

export default SharingOptimizationDetector;
