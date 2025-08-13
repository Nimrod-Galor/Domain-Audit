/**
 * ============================================================================
 * SOCIAL PLATFORM DETECTOR - GPT-5 STYLE MODULAR COMPONENT
 * ============================================================================
 * 
 * Advanced social media platform detection and optimization analysis
 * Part of the Combined Approach Social Media Analyzer (10th Implementation)
 * 
 * Features:
 * - Open Graph meta tag comprehensive analysis
 * - Twitter Card detection and optimization
 * - LinkedIn meta tag validation
 * - Pinterest Rich Pins analysis
 * - WhatsApp preview optimization
 * - Instagram meta tag support
 * - YouTube video optimization
 * - Multi-platform compliance validation
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration Combined Approach Pattern - GPT-5 Style Detector
 */

export class SocialPlatformDetector {
  constructor(config = {}) {
    this.config = {
      platforms: {
        facebook: config.platforms?.facebook !== false,
        twitter: config.platforms?.twitter !== false,
        linkedin: config.platforms?.linkedin !== false,
        pinterest: config.platforms?.pinterest !== false,
        whatsapp: config.platforms?.whatsapp !== false,
        instagram: config.platforms?.instagram !== false,
        youtube: config.platforms?.youtube !== false,
        ...config.platforms
      },
      enableAdvancedDetection: config.enableAdvancedDetection !== false,
      enableImageAnalysis: config.enableImageAnalysis !== false,
      analysisDepth: config.analysisDepth || 'comprehensive',
      validateContent: config.validateContent !== false,
      ...config
    };

    this.version = '1.0.0';
    this.detectorType = 'social_platform';
    
    // Social media platform specifications and requirements
    this.platformSpecs = {
      openGraph: {
        required: ['og:title', 'og:description', 'og:image', 'og:url'],
        recommended: ['og:type', 'og:site_name', 'og:locale'],
        optional: ['og:image:width', 'og:image:height', 'og:image:alt'],
        imageSpecs: {
          minWidth: 600,
          minHeight: 315,
          aspectRatio: 1.91,
          maxSize: 5242880 // 5MB
        }
      },
      twitter: {
        required: ['twitter:card'],
        recommended: ['twitter:title', 'twitter:description', 'twitter:image'],
        optional: ['twitter:site', 'twitter:creator', 'twitter:player'],
        cardTypes: ['summary', 'summary_large_image', 'app', 'player'],
        imageSpecs: {
          summary: { width: 400, height: 400 },
          large: { width: 1200, height: 630 }
        }
      },
      linkedin: {
        required: ['og:title', 'og:description', 'og:image'],
        recommended: ['og:type', 'article:author', 'article:published_time'],
        imageSpecs: {
          minWidth: 1200,
          minHeight: 627,
          aspectRatio: 1.91
        }
      },
      pinterest: {
        required: ['og:title', 'og:description', 'og:image'],
        recommended: ['pinterest:rich_pin', 'article:author'],
        imageSpecs: {
          minWidth: 600,
          minHeight: 900,
          aspectRatio: 0.67 // 2:3 ratio preferred
        }
      },
      whatsapp: {
        required: ['og:title', 'og:description', 'og:image'],
        imageSpecs: {
          minWidth: 300,
          minHeight: 300,
          maxSize: 5242880
        }
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
      name: 'SocialPlatformDetector',
      version: this.version,
      type: this.detectorType,
      description: 'Detects and analyzes social media platform optimization across multiple platforms',
      capabilities: [
        'open_graph_comprehensive_analysis',
        'twitter_card_detection_optimization',
        'linkedin_meta_tag_validation',
        'pinterest_rich_pins_analysis',
        'whatsapp_preview_optimization',
        'multi_platform_compliance_validation',
        'social_image_optimization_analysis'
      ],
      platforms: Object.keys(this.config.platforms).filter(p => this.config.platforms[p]),
      performance: 'High',
      accuracy: 'GPT-5 Enhanced'
    };
  }

  /**
   * Detect social media platform optimization
   * @param {Object} context - Analysis context containing document and metadata
   * @returns {Promise<Object>} Social platform detection results
   */
  async detect(context) {
    try {
      const { document, url, pageData } = context;
      
      if (!document) {
        throw new Error('Document is required for social platform analysis');
      }

      // Check cache
      const cacheKey = this._generateCacheKey(url);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const startTime = Date.now();

      // Phase 1: Open Graph analysis (foundational for most platforms)
      const openGraphAnalysis = this._analyzeOpenGraph(document, url);

      // Phase 2: Twitter Card analysis
      const twitterAnalysis = this._analyzeTwitterCard(document, url);

      // Phase 3: LinkedIn optimization analysis
      const linkedinAnalysis = this._analyzeLinkedIn(document, url);

      // Phase 4: Pinterest Rich Pins analysis
      const pinterestAnalysis = this._analyzePinterest(document, url);

      // Phase 5: WhatsApp preview analysis
      const whatsappAnalysis = this._analyzeWhatsApp(document, url);

      // Phase 6: Instagram optimization analysis
      const instagramAnalysis = this._analyzeInstagram(document, url);

      // Phase 7: YouTube optimization analysis
      const youtubeAnalysis = this._analyzeYouTube(document, url);

      // Phase 8: Cross-platform compatibility analysis
      const compatibilityAnalysis = this._analyzeCrossPlatformCompatibility({
        openGraph: openGraphAnalysis,
        twitter: twitterAnalysis,
        linkedin: linkedinAnalysis,
        pinterest: pinterestAnalysis,
        whatsapp: whatsappAnalysis,
        instagram: instagramAnalysis,
        youtube: youtubeAnalysis
      });

      // Calculate overall platform optimization score
      const overallScore = this._calculatePlatformScore({
        openGraph: openGraphAnalysis,
        twitter: twitterAnalysis,
        linkedin: linkedinAnalysis,
        pinterest: pinterestAnalysis,
        whatsapp: whatsappAnalysis,
        instagram: instagramAnalysis,
        youtube: youtubeAnalysis,
        compatibility: compatibilityAnalysis
      });

      // Compile comprehensive results
      const results = {
        success: true,
        detectorType: this.detectorType,
        
        // Core platform analysis
        openGraph: openGraphAnalysis,
        twitter: twitterAnalysis,
        linkedin: linkedinAnalysis,
        pinterest: pinterestAnalysis,
        whatsapp: whatsappAnalysis,
        instagram: instagramAnalysis,
        youtube: youtubeAnalysis,
        
        // Cross-platform analysis
        compatibility: compatibilityAnalysis,
        
        // Overall assessment
        score: overallScore.score,
        grade: overallScore.grade,
        level: overallScore.level,
        platformsOptimized: overallScore.optimizedPlatforms,
        
        // Strategic insights
        insights: this._generatePlatformInsights({
          openGraph: openGraphAnalysis,
          twitter: twitterAnalysis,
          linkedin: linkedinAnalysis,
          pinterest: pinterestAnalysis,
          whatsapp: whatsappAnalysis,
          instagram: instagramAnalysis,
          youtube: youtubeAnalysis,
          compatibility: compatibilityAnalysis
        }),
        
        recommendations: this._generatePlatformRecommendations({
          openGraph: openGraphAnalysis,
          twitter: twitterAnalysis,
          linkedin: linkedinAnalysis,
          pinterest: pinterestAnalysis,
          whatsapp: whatsappAnalysis,
          instagram: instagramAnalysis,
          youtube: youtubeAnalysis,
          compatibility: compatibilityAnalysis
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
        error: `Social platform detection failed: ${error.message}`,
        detectorType: this.detectorType
      };
    }
  }

  /**
   * Analyze Open Graph meta tags
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Object} Open Graph analysis results
   */
  _analyzeOpenGraph(document, url) {
    const analysis = {
      present: false,
      tags: {},
      required: { present: 0, missing: [] },
      recommended: { present: 0, missing: [] },
      optional: { present: 0, available: [] },
      imageAnalysis: {},
      issues: [],
      recommendations: []
    };

    try {
      // Extract Open Graph meta tags
      const ogTags = document.querySelectorAll('meta[property^="og:"]');
      
      if (ogTags.length === 0) {
        analysis.issues.push('No Open Graph meta tags found');
        analysis.recommendations.push('Implement basic Open Graph meta tags for social sharing');
        return { ...analysis, score: 0, grade: 'F' };
      }

      analysis.present = true;

      // Parse all Open Graph tags
      ogTags.forEach(tag => {
        const property = tag.getAttribute('property');
        const content = tag.getAttribute('content');
        if (property && content) {
          analysis.tags[property] = content;
        }
      });

      // Check required tags
      this.platformSpecs.openGraph.required.forEach(tag => {
        if (analysis.tags[tag]) {
          analysis.required.present++;
        } else {
          analysis.required.missing.push(tag);
        }
      });

      // Check recommended tags
      this.platformSpecs.openGraph.recommended.forEach(tag => {
        if (analysis.tags[tag]) {
          analysis.recommended.present++;
        } else {
          analysis.recommended.missing.push(tag);
        }
      });

      // Check optional tags
      this.platformSpecs.openGraph.optional.forEach(tag => {
        if (analysis.tags[tag]) {
          analysis.optional.present++;
          analysis.optional.available.push(tag);
        }
      });

      // Analyze Open Graph image
      if (analysis.tags['og:image']) {
        analysis.imageAnalysis = this._analyzeOpenGraphImage(analysis.tags, document);
      } else {
        analysis.issues.push('Missing og:image tag');
        analysis.recommendations.push('Add og:image meta tag for social sharing');
      }

      // Validate content quality
      this._validateOpenGraphContent(analysis);

      // Generate specific issues and recommendations
      if (analysis.required.missing.length > 0) {
        analysis.issues.push(`Missing required Open Graph tags: ${analysis.required.missing.join(', ')}`);
        analysis.recommendations.push('Add all required Open Graph meta tags');
      }

      if (analysis.recommended.missing.length > 0) {
        analysis.recommendations.push(`Consider adding recommended tags: ${analysis.recommended.missing.join(', ')}`);
      }

      // Calculate Open Graph score
      const score = this._calculateOpenGraphScore(analysis);
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
   * Analyze Twitter Card implementation
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Object} Twitter Card analysis results
   */
  _analyzeTwitterCard(document, url) {
    const analysis = {
      present: false,
      cardType: null,
      tags: {},
      validation: {},
      issues: [],
      recommendations: []
    };

    try {
      // Extract Twitter Card meta tags
      const twitterTags = document.querySelectorAll('meta[name^="twitter:"]');
      
      if (twitterTags.length === 0) {
        analysis.issues.push('No Twitter Card meta tags found');
        analysis.recommendations.push('Implement Twitter Card meta tags for better Twitter sharing');
        return { ...analysis, score: 0, grade: 'F' };
      }

      analysis.present = true;

      // Parse Twitter Card tags
      twitterTags.forEach(tag => {
        const name = tag.getAttribute('name');
        const content = tag.getAttribute('content');
        if (name && content) {
          analysis.tags[name] = content;
        }
      });

      // Determine card type
      analysis.cardType = analysis.tags['twitter:card'];
      
      if (!analysis.cardType) {
        analysis.issues.push('Missing twitter:card type specification');
        analysis.recommendations.push('Specify Twitter Card type (summary, summary_large_image, etc.)');
      } else if (!this.platformSpecs.twitter.cardTypes.includes(analysis.cardType)) {
        analysis.issues.push(`Invalid Twitter Card type: ${analysis.cardType}`);
        analysis.recommendations.push('Use valid Twitter Card type');
      }

      // Validate required and recommended tags
      analysis.validation = this._validateTwitterCardTags(analysis);

      // Analyze Twitter image specifications
      if (analysis.tags['twitter:image']) {
        analysis.imageAnalysis = this._analyzeTwitterImage(analysis);
      }

      // Generate Twitter-specific recommendations
      if (!analysis.tags['twitter:title'] && !document.querySelector('meta[property="og:title"]')) {
        analysis.issues.push('Missing Twitter title');
        analysis.recommendations.push('Add twitter:title or og:title meta tag');
      }

      if (!analysis.tags['twitter:description'] && !document.querySelector('meta[property="og:description"]')) {
        analysis.issues.push('Missing Twitter description');
        analysis.recommendations.push('Add twitter:description or og:description meta tag');
      }

      // Calculate Twitter Card score
      const score = this._calculateTwitterScore(analysis);
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
   * Analyze LinkedIn optimization
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Object} LinkedIn analysis results
   */
  _analyzeLinkedIn(document, url) {
    const analysis = {
      optimized: false,
      metaTags: {},
      businessOptimization: {},
      issues: [],
      recommendations: []
    };

    try {
      // LinkedIn primarily uses Open Graph, but with specific requirements
      const ogTags = {};
      document.querySelectorAll('meta[property^="og:"]').forEach(tag => {
        const property = tag.getAttribute('property');
        const content = tag.getAttribute('content');
        if (property && content) {
          ogTags[property] = content;
        }
      });

      // Check LinkedIn-specific requirements
      const linkedinRequirements = this.platformSpecs.linkedin.required;
      let requirementsMet = 0;

      linkedinRequirements.forEach(tag => {
        if (ogTags[tag]) {
          requirementsMet++;
          analysis.metaTags[tag] = ogTags[tag];
        }
      });

      analysis.optimized = requirementsMet === linkedinRequirements.length;

      // Analyze LinkedIn image requirements
      if (ogTags['og:image']) {
        analysis.imageAnalysis = this._analyzeLinkedInImage(ogTags);
      }

      // Check for business-specific optimization
      analysis.businessOptimization = this._analyzeLinkedInBusiness(document);

      // Generate LinkedIn-specific recommendations
      if (!analysis.optimized) {
        const missing = linkedinRequirements.filter(tag => !ogTags[tag]);
        analysis.issues.push(`Missing LinkedIn optimization tags: ${missing.join(', ')}`);
        analysis.recommendations.push('Add required Open Graph tags for LinkedIn optimization');
      }

      if (!analysis.businessOptimization.hasCompanyInfo) {
        analysis.recommendations.push('Add company information for better LinkedIn business presence');
      }

      // Calculate LinkedIn score
      const score = this._calculateLinkedInScore(analysis);
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
   * Analyze Pinterest Rich Pins
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Object} Pinterest analysis results
   */
  _analyzePinterest(document, url) {
    const analysis = {
      richPins: false,
      pinType: null,
      metaTags: {},
      imageOptimization: {},
      issues: [],
      recommendations: []
    };

    try {
      // Check for Pinterest Rich Pins meta tags
      const pinterestTags = document.querySelectorAll('meta[property^="pinterest:"], meta[name^="pinterest:"]');
      
      pinterestTags.forEach(tag => {
        const property = tag.getAttribute('property') || tag.getAttribute('name');
        const content = tag.getAttribute('content');
        if (property && content) {
          analysis.metaTags[property] = content;
          analysis.richPins = true;
        }
      });

      // Check Open Graph tags (Pinterest fallback)
      const ogTags = {};
      document.querySelectorAll('meta[property^="og:"]').forEach(tag => {
        const property = tag.getAttribute('property');
        const content = tag.getAttribute('content');
        if (property && content) {
          ogTags[property] = content;
        }
      });

      // Determine pin type
      if (analysis.metaTags['pinterest:rich_pin']) {
        analysis.pinType = analysis.metaTags['pinterest:rich_pin'];
      }

      // Analyze Pinterest image requirements
      if (ogTags['og:image']) {
        analysis.imageOptimization = this._analyzePinterestImage(ogTags);
      }

      // Check for Pinterest-specific structured data
      const structuredData = this._analyzePinterestStructuredData(document);
      analysis.structuredData = structuredData;

      // Generate Pinterest-specific recommendations
      if (!analysis.richPins) {
        analysis.recommendations.push('Implement Pinterest Rich Pins for enhanced pin functionality');
      }

      if (!analysis.imageOptimization.aspectRatioOptimal) {
        analysis.recommendations.push('Optimize images for Pinterest (2:3 aspect ratio preferred)');
      }

      // Calculate Pinterest score
      const score = this._calculatePinterestScore(analysis);
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
   * Analyze WhatsApp preview optimization
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Object} WhatsApp analysis results
   */
  _analyzeWhatsApp(document, url) {
    const analysis = {
      optimized: false,
      previewElements: {},
      issues: [],
      recommendations: []
    };

    try {
      // WhatsApp uses Open Graph tags for link previews
      const ogTags = {};
      document.querySelectorAll('meta[property^="og:"]').forEach(tag => {
        const property = tag.getAttribute('property');
        const content = tag.getAttribute('content');
        if (property && content) {
          ogTags[property] = content;
        }
      });

      // Check WhatsApp requirements
      const whatsappRequirements = this.platformSpecs.whatsapp.required;
      let requirementsMet = 0;

      whatsappRequirements.forEach(tag => {
        if (ogTags[tag]) {
          requirementsMet++;
          analysis.previewElements[tag] = ogTags[tag];
        }
      });

      analysis.optimized = requirementsMet === whatsappRequirements.length;

      // Analyze WhatsApp image requirements
      if (ogTags['og:image']) {
        analysis.imageAnalysis = this._analyzeWhatsAppImage(ogTags);
      }

      // Generate WhatsApp-specific recommendations
      if (!analysis.optimized) {
        const missing = whatsappRequirements.filter(tag => !ogTags[tag]);
        analysis.issues.push(`Missing WhatsApp preview elements: ${missing.join(', ')}`);
        analysis.recommendations.push('Add Open Graph tags for WhatsApp link previews');
      }

      // Calculate WhatsApp score
      const score = this._calculateWhatsAppScore(analysis);
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
   * Analyze Instagram optimization
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Object} Instagram analysis results
   */
  _analyzeInstagram(document, url) {
    const analysis = {
      optimized: false,
      metaTags: {},
      imageOptimization: {},
      recommendations: []
    };

    try {
      // Instagram uses Open Graph for link previews in bio/stories
      const ogTags = {};
      document.querySelectorAll('meta[property^="og:"]').forEach(tag => {
        const property = tag.getAttribute('property');
        const content = tag.getAttribute('content');
        if (property && content) {
          ogTags[property] = content;
        }
      });

      // Basic requirements for Instagram
      const hasTitle = ogTags['og:title'];
      const hasDescription = ogTags['og:description'];
      const hasImage = ogTags['og:image'];

      analysis.optimized = !!(hasTitle && hasDescription && hasImage);
      analysis.metaTags = { hasTitle, hasDescription, hasImage };

      // Analyze Instagram image requirements (square format preferred)
      if (hasImage) {
        analysis.imageOptimization = this._analyzeInstagramImage(ogTags);
      }

      // Generate Instagram-specific recommendations
      if (!analysis.optimized) {
        analysis.recommendations.push('Add Open Graph tags for Instagram link sharing');
      }

      if (analysis.imageOptimization && !analysis.imageOptimization.squareFormat) {
        analysis.recommendations.push('Consider square format images for optimal Instagram display');
      }

      // Calculate Instagram score
      const score = this._calculateInstagramScore(analysis);
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
   * Analyze YouTube optimization
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Object} YouTube analysis results
   */
  _analyzeYouTube(document, url) {
    const analysis = {
      hasVideo: false,
      videoElements: {},
      metaTags: {},
      recommendations: []
    };

    try {
      // Check for video elements
      const videos = document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="youtu.be"]');
      analysis.hasVideo = videos.length > 0;
      analysis.videoElements.count = videos.length;

      // Check for video-specific Open Graph tags
      const ogTags = {};
      document.querySelectorAll('meta[property^="og:"]').forEach(tag => {
        const property = tag.getAttribute('property');
        const content = tag.getAttribute('content');
        if (property && content) {
          ogTags[property] = content;
        }
      });

      // Analyze video-specific tags
      analysis.metaTags.videoType = ogTags['og:type'] === 'video' || ogTags['og:type'] === 'video.other';
      analysis.metaTags.videoUrl = ogTags['og:video:url'] || ogTags['og:video'];
      analysis.metaTags.videoWidth = ogTags['og:video:width'];
      analysis.metaTags.videoHeight = ogTags['og:video:height'];

      // Generate YouTube-specific recommendations
      if (analysis.hasVideo && !analysis.metaTags.videoType) {
        analysis.recommendations.push('Add og:type="video" for video content');
      }

      if (analysis.hasVideo && !analysis.metaTags.videoUrl) {
        analysis.recommendations.push('Add og:video:url for better video sharing');
      }

      // Calculate YouTube score
      const score = this._calculateYouTubeScore(analysis);
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
   * Analyze cross-platform compatibility
   * @param {Object} platformAnalyses - Individual platform analysis results
   * @returns {Object} Cross-platform compatibility analysis
   */
  _analyzeCrossPlatformCompatibility(platformAnalyses) {
    const compatibility = {
      overallCompatibility: 0,
      platformConflicts: [],
      sharedOptimizations: [],
      recommendations: []
    };

    try {
      // Check for shared optimizations
      const hasOpenGraph = platformAnalyses.openGraph.present;
      const hasTwitterCard = platformAnalyses.twitter.present;

      if (hasOpenGraph) {
        compatibility.sharedOptimizations.push('Open Graph benefits Facebook, LinkedIn, WhatsApp');
      }

      if (hasTwitterCard) {
        compatibility.sharedOptimizations.push('Twitter Cards optimize Twitter sharing');
      }

      // Check for platform conflicts
      if (hasOpenGraph && hasTwitterCard) {
        compatibility.sharedOptimizations.push('Twitter Cards can fallback to Open Graph');
      }

      // Calculate overall compatibility
      const platformScores = Object.values(platformAnalyses)
        .filter(p => p && typeof p.score === 'number')
        .map(p => p.score);

      if (platformScores.length > 0) {
        compatibility.overallCompatibility = Math.round(
          platformScores.reduce((sum, score) => sum + score, 0) / platformScores.length
        );
      }

      // Generate cross-platform recommendations
      if (!hasOpenGraph) {
        compatibility.recommendations.push('Implement Open Graph for multiple platform compatibility');
      }

      if (hasOpenGraph && !hasTwitterCard) {
        compatibility.recommendations.push('Add Twitter Cards for Twitter-specific optimization');
      }

    } catch (error) {
      compatibility.error = error.message;
    }

    return compatibility;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  _analyzeOpenGraphImage(ogTags, document) {
    const imageAnalysis = {
      present: !!ogTags['og:image'],
      url: ogTags['og:image'] || null,
      alt: ogTags['og:image:alt'] || null,
      width: ogTags['og:image:width'] ? parseInt(ogTags['og:image:width']) : null,
      height: ogTags['og:image:height'] ? parseInt(ogTags['og:image:height']) : null,
      meetsSpecs: false,
      issues: []
    };

    if (imageAnalysis.present) {
      const specs = this.platformSpecs.openGraph.imageSpecs;
      
      if (imageAnalysis.width && imageAnalysis.height) {
        imageAnalysis.meetsSpecs = 
          imageAnalysis.width >= specs.minWidth && 
          imageAnalysis.height >= specs.minHeight;
        
        if (!imageAnalysis.meetsSpecs) {
          imageAnalysis.issues.push('Image dimensions below recommended minimum');
        }
      } else {
        imageAnalysis.issues.push('Missing image dimensions');
      }

      if (!imageAnalysis.alt) {
        imageAnalysis.issues.push('Missing image alt text');
      }
    }

    return imageAnalysis;
  }

  _validateOpenGraphContent(analysis) {
    // Validate title length
    if (analysis.tags['og:title']) {
      const titleLength = analysis.tags['og:title'].length;
      if (titleLength > 60) {
        analysis.issues.push('Open Graph title too long (>60 characters)');
      }
    }

    // Validate description length
    if (analysis.tags['og:description']) {
      const descLength = analysis.tags['og:description'].length;
      if (descLength > 160) {
        analysis.issues.push('Open Graph description too long (>160 characters)');
      }
    }

    // Validate URL format
    if (analysis.tags['og:url']) {
      try {
        new URL(analysis.tags['og:url']);
      } catch {
        analysis.issues.push('Invalid Open Graph URL format');
      }
    }
  }

  _validateTwitterCardTags(analysis) {
    const validation = {
      hasRequiredTags: true,
      missingRequired: [],
      hasRecommendedTags: true,
      missingRecommended: []
    };

    // Check required tags based on card type
    const required = this.platformSpecs.twitter.required;
    required.forEach(tag => {
      if (!analysis.tags[tag]) {
        validation.hasRequiredTags = false;
        validation.missingRequired.push(tag);
      }
    });

    // Check recommended tags
    const recommended = this.platformSpecs.twitter.recommended;
    recommended.forEach(tag => {
      if (!analysis.tags[tag]) {
        validation.hasRecommendedTags = false;
        validation.missingRecommended.push(tag);
      }
    });

    return validation;
  }

  _analyzeTwitterImage(analysis) {
    const imageAnalysis = {
      present: !!analysis.tags['twitter:image'],
      cardTypeOptimal: false
    };

    if (imageAnalysis.present && analysis.cardType) {
      const specs = this.platformSpecs.twitter.imageSpecs[analysis.cardType];
      if (specs) {
        imageAnalysis.cardTypeOptimal = true;
        imageAnalysis.recommendedDimensions = specs;
      }
    }

    return imageAnalysis;
  }

  _analyzeLinkedInImage(ogTags) {
    const analysis = {
      present: !!ogTags['og:image'],
      meetsLinkedInSpecs: false
    };

    if (analysis.present) {
      const width = ogTags['og:image:width'] ? parseInt(ogTags['og:image:width']) : null;
      const height = ogTags['og:image:height'] ? parseInt(ogTags['og:image:height']) : null;
      const specs = this.platformSpecs.linkedin.imageSpecs;

      if (width && height) {
        analysis.meetsLinkedInSpecs = 
          width >= specs.minWidth && 
          height >= specs.minHeight;
      }
    }

    return analysis;
  }

  _analyzeLinkedInBusiness(document) {
    return {
      hasCompanyInfo: !!(
        document.querySelector('meta[property="og:site_name"]') ||
        document.querySelector('meta[name="author"]')
      )
    };
  }

  _analyzePinterestImage(ogTags) {
    const analysis = {
      present: !!ogTags['og:image'],
      aspectRatioOptimal: false
    };

    if (analysis.present) {
      const width = ogTags['og:image:width'] ? parseInt(ogTags['og:image:width']) : null;
      const height = ogTags['og:image:height'] ? parseInt(ogTags['og:image:height']) : null;

      if (width && height) {
        const aspectRatio = width / height;
        const targetRatio = this.platformSpecs.pinterest.imageSpecs.aspectRatio;
        analysis.aspectRatioOptimal = Math.abs(aspectRatio - targetRatio) < 0.1;
      }
    }

    return analysis;
  }

  _analyzePinterestStructuredData(document) {
    const structuredData = document.querySelectorAll('script[type="application/ld+json"]');
    return {
      present: structuredData.length > 0,
      count: structuredData.length
    };
  }

  _analyzeWhatsAppImage(ogTags) {
    return {
      present: !!ogTags['og:image'],
      url: ogTags['og:image']
    };
  }

  _analyzeInstagramImage(ogTags) {
    const analysis = {
      present: !!ogTags['og:image'],
      squareFormat: false
    };

    if (analysis.present) {
      const width = ogTags['og:image:width'] ? parseInt(ogTags['og:image:width']) : null;
      const height = ogTags['og:image:height'] ? parseInt(ogTags['og:image:height']) : null;

      if (width && height) {
        analysis.squareFormat = Math.abs(width - height) / Math.max(width, height) < 0.1;
      }
    }

    return analysis;
  }

  _calculatePlatformScore(analyses) {
    const weights = {
      openGraph: 0.40, // Most important as it covers multiple platforms
      twitter: 0.20,
      linkedin: 0.15,
      pinterest: 0.10,
      whatsapp: 0.10,
      instagram: 0.03,
      youtube: 0.02
    };

    let totalScore = 0;
    let totalWeight = 0;
    let optimizedPlatforms = 0;

    Object.entries(weights).forEach(([platform, weight]) => {
      if (analyses[platform] && analyses[platform].score !== undefined) {
        totalScore += analyses[platform].score * weight;
        totalWeight += weight;
        
        if (analyses[platform].score >= 70) {
          optimizedPlatforms++;
        }
      }
    });

    const score = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    const grade = this._calculateGrade(score);
    const level = this._categorizeLevel(score);

    return { score, grade, level, optimizedPlatforms };
  }

  _calculateOpenGraphScore(analysis) {
    let score = 40; // Base score

    // Required tags (40 points)
    score += (analysis.required.present / this.platformSpecs.openGraph.required.length) * 40;

    // Recommended tags (15 points)
    score += (analysis.recommended.present / this.platformSpecs.openGraph.recommended.length) * 15;

    // Image analysis (5 points)
    if (analysis.imageAnalysis.present) score += 5;

    // Deduct for issues
    score -= analysis.issues.length * 5;

    return Math.max(0, Math.min(100, score));
  }

  _calculateTwitterScore(analysis) {
    let score = 50; // Base score for presence

    if (analysis.cardType) score += 20;
    if (analysis.validation.hasRequiredTags) score += 20;
    if (analysis.validation.hasRecommendedTags) score += 10;

    score -= analysis.issues.length * 5;

    return Math.max(0, Math.min(100, score));
  }

  _calculateLinkedInScore(analysis) {
    let score = analysis.optimized ? 80 : 30;
    if (analysis.businessOptimization.hasCompanyInfo) score += 10;
    if (analysis.imageAnalysis && analysis.imageAnalysis.meetsLinkedInSpecs) score += 10;
    return Math.max(0, Math.min(100, score));
  }

  _calculatePinterestScore(analysis) {
    let score = 50;
    if (analysis.richPins) score += 30;
    if (analysis.imageOptimization.aspectRatioOptimal) score += 20;
    return Math.max(0, Math.min(100, score));
  }

  _calculateWhatsAppScore(analysis) {
    return analysis.optimized ? 85 : 25;
  }

  _calculateInstagramScore(analysis) {
    let score = analysis.optimized ? 75 : 25;
    if (analysis.imageOptimization && analysis.imageOptimization.squareFormat) score += 10;
    return Math.max(0, Math.min(100, score));
  }

  _calculateYouTubeScore(analysis) {
    let score = 50;
    if (analysis.hasVideo && analysis.metaTags.videoType) score += 30;
    if (analysis.metaTags.videoUrl) score += 20;
    return Math.max(0, Math.min(100, score));
  }

  _generatePlatformInsights(analyses) {
    const insights = [];

    // Open Graph insights
    if (analyses.openGraph.present && analyses.openGraph.score > 80) {
      insights.push({
        type: 'positive',
        category: 'openGraph',
        message: 'Strong Open Graph implementation detected',
        impact: 'high'
      });
    }

    // Twitter Card insights
    if (!analyses.twitter.present) {
      insights.push({
        type: 'opportunity',
        category: 'twitter',
        message: 'Twitter Card implementation missing',
        impact: 'medium'
      });
    }

    // Cross-platform insights
    if (analyses.compatibility.overallCompatibility > 75) {
      insights.push({
        type: 'positive',
        category: 'compatibility',
        message: 'Good cross-platform social media optimization',
        impact: 'high'
      });
    }

    return insights;
  }

  _generatePlatformRecommendations(analyses) {
    const recommendations = [];

    // Collect recommendations from all platform analyses
    Object.values(analyses).forEach(analysis => {
      if (analysis && analysis.recommendations) {
        recommendations.push(...analysis.recommendations.map(rec => ({
          text: rec,
          category: 'platform',
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

export default SocialPlatformDetector;
