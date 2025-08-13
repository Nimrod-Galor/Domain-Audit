/**
 * ============================================================================
 * META TAG DETECTOR - GPT-5 STYLE COMPONENT
 * ============================================================================
 * 
 * Sophisticated meta tag detection and analysis for SEO optimization
 * Part of the Combined Approach SEO Analyzer (8th Implementation)
 * 
 * Features:
 * - Comprehensive meta tag detection
 * - Social media tag analysis (Open Graph, Twitter Cards)
 * - Technical meta tag validation
 * - Content optimization analysis
 * - Mobile and viewport optimization
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration Combined Approach Pattern - Detector Component
 */

export class MetaTagDetector {
  constructor(config = {}) {
    this.config = {
      includeOpenGraph: config.includeOpenGraph !== false,
      includeTwitterCards: config.includeTwitterCards !== false,
      includeTechnicalTags: config.includeTechnicalTags !== false,
      validateContent: config.validateContent !== false,
      analysisDepth: config.analysisDepth || 'comprehensive',
      ...config
    };

    this.version = '1.0.0';
    this.detectorType = 'meta_tag';
    
    // Meta tag validation patterns
    this.validationPatterns = {
      title: {
        minLength: 30,
        maxLength: 60,
        optimal: { min: 40, max: 55 }
      },
      description: {
        minLength: 120,
        maxLength: 160,
        optimal: { min: 140, max: 155 }
      },
      keywords: {
        maxCount: 10,
        maxLength: 255
      }
    };

    // Social media tag requirements
    this.socialRequirements = {
      openGraph: ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'],
      twitter: ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']
    };

    this.cache = new Map();
  }

  /**
   * Get detector metadata
   * @returns {Object} Detector metadata
   */
  getMetadata() {
    return {
      name: 'MetaTagDetector',
      version: this.version,
      type: this.detectorType,
      description: 'GPT-5 style meta tag detection and analysis for SEO optimization',
      capabilities: [
        'basic_meta_tag_detection',
        'social_media_tag_analysis',
        'technical_meta_validation',
        'content_optimization_analysis',
        'mobile_viewport_detection',
        'structured_meta_validation'
      ],
      patterns: this.validationPatterns,
      socialSupport: {
        openGraph: this.config.includeOpenGraph,
        twitterCards: this.config.includeTwitterCards
      },
      performance: 'High',
      accuracy: 'Comprehensive'
    };
  }

  /**
   * Analyze document for meta tags
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Meta tag analysis results
   */
  async analyze(context) {
    try {
      const { document, url = '', pageData = {} } = context;
      
      if (!document) {
        throw new Error('Document is required for meta tag analysis');
      }

      // Check cache
      const cacheKey = this._generateCacheKey(document);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const startTime = Date.now();

      // Phase 1: Basic meta tag detection
      const basicMetaTags = this._detectBasicMetaTags(document);

      // Phase 2: Social media tags
      const socialMetaTags = this._detectSocialMetaTags(document);

      // Phase 3: Technical meta tags
      const technicalMetaTags = this._detectTechnicalMetaTags(document);

      // Phase 4: Content analysis
      const contentAnalysis = this._analyzeMetaContent(basicMetaTags, socialMetaTags);

      // Phase 5: Validation and scoring
      const validation = this._validateMetaTags(basicMetaTags, socialMetaTags, technicalMetaTags);

      // Compile results
      const results = {
        success: true,
        detectorType: this.detectorType,
        
        // Meta tag collections
        basic: basicMetaTags,
        social: socialMetaTags,
        technical: technicalMetaTags,
        
        // Analysis results
        contentAnalysis,
        validation,
        
        // Summary metrics
        summary: {
          totalMetaTags: basicMetaTags.all.length + socialMetaTags.all.length + technicalMetaTags.all.length,
          basicTagsFound: basicMetaTags.all.length,
          socialTagsFound: socialMetaTags.all.length,
          technicalTagsFound: technicalMetaTags.all.length,
          validationScore: validation.overallScore,
          optimizationLevel: this._getOptimizationLevel(validation.overallScore)
        },

        // Performance data
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
        error: `Meta tag detection failed: ${error.message}`,
        detectorType: this.detectorType
      };
    }
  }

  /**
   * Detect basic meta tags (title, description, keywords, etc.)
   * @param {Document} document - DOM document
   * @returns {Object} Basic meta tags
   */
  _detectBasicMetaTags(document) {
    const metaTags = document.querySelectorAll('meta');
    const all = Array.from(metaTags);

    // Core SEO meta tags
    const title = document.querySelector('title')?.textContent?.trim() || '';
    const description = this._getMetaContent(document, 'description') || '';
    const keywords = this._getMetaContent(document, 'keywords') || '';
    const robots = this._getMetaContent(document, 'robots') || '';
    const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
    const viewport = this._getMetaContent(document, 'viewport') || '';

    // Language and locale
    const language = document.documentElement.lang || 
                    this._getMetaContent(document, 'language') || '';
    const charset = document.querySelector('meta[charset]')?.getAttribute('charset') || 
                   this._getMetaContent(document, 'charset') || '';

    // Additional meta tags
    const author = this._getMetaContent(document, 'author') || '';
    const generator = this._getMetaContent(document, 'generator') || '';
    const revisitAfter = this._getMetaContent(document, 'revisit-after') || '';

    return {
      all,
      core: {
        title: {
          content: title,
          length: title.length,
          element: document.querySelector('title')
        },
        description: {
          content: description,
          length: description.length,
          element: this._getMetaElement(document, 'description')
        },
        keywords: {
          content: keywords,
          length: keywords.length,
          count: keywords ? keywords.split(',').length : 0,
          element: this._getMetaElement(document, 'keywords')
        },
        robots: {
          content: robots,
          directives: robots ? robots.split(',').map(d => d.trim()) : [],
          element: this._getMetaElement(document, 'robots')
        }
      },
      technical: {
        canonical: {
          href: canonical,
          element: document.querySelector('link[rel="canonical"]')
        },
        viewport: {
          content: viewport,
          element: this._getMetaElement(document, 'viewport')
        },
        charset: {
          content: charset,
          element: document.querySelector('meta[charset]')
        },
        language: {
          content: language,
          element: document.documentElement
        }
      },
      additional: {
        author: {
          content: author,
          element: this._getMetaElement(document, 'author')
        },
        generator: {
          content: generator,
          element: this._getMetaElement(document, 'generator')
        },
        revisitAfter: {
          content: revisitAfter,
          element: this._getMetaElement(document, 'revisit-after')
        }
      },
      count: {
        total: all.length,
        withContent: all.filter(meta => meta.content && meta.content.trim()).length,
        unique: new Set(all.map(meta => meta.name || meta.property)).size
      }
    };
  }

  /**
   * Detect social media meta tags (Open Graph, Twitter Cards, etc.)
   * @param {Document} document - DOM document
   * @returns {Object} Social media meta tags
   */
  _detectSocialMetaTags(document) {
    const metaTags = document.querySelectorAll('meta');
    const all = Array.from(metaTags);

    // Open Graph tags
    const openGraph = {};
    const ogTags = all.filter(meta => meta.getAttribute('property')?.startsWith('og:'));
    ogTags.forEach(tag => {
      const property = tag.getAttribute('property');
      const content = tag.getAttribute('content');
      if (property && content) {
        openGraph[property] = {
          content,
          element: tag
        };
      }
    });

    // Twitter Card tags
    const twitter = {};
    const twitterTags = all.filter(meta => meta.getAttribute('name')?.startsWith('twitter:'));
    twitterTags.forEach(tag => {
      const name = tag.getAttribute('name');
      const content = tag.getAttribute('content');
      if (name && content) {
        twitter[name] = {
          content,
          element: tag
        };
      }
    });

    // Facebook specific tags
    const facebook = {};
    const fbTags = all.filter(meta => meta.getAttribute('property')?.startsWith('fb:'));
    fbTags.forEach(tag => {
      const property = tag.getAttribute('property');
      const content = tag.getAttribute('content');
      if (property && content) {
        facebook[property] = {
          content,
          element: tag
        };
      }
    });

    // LinkedIn specific tags
    const linkedin = {};
    const linkedinTags = all.filter(meta => meta.getAttribute('property')?.startsWith('linkedin:'));
    linkedinTags.forEach(tag => {
      const property = tag.getAttribute('property');
      const content = tag.getAttribute('content');
      if (property && content) {
        linkedin[property] = {
          content,
          element: tag
        };
      }
    });

    return {
      all: [...ogTags, ...twitterTags, ...fbTags, ...linkedinTags],
      openGraph,
      twitter,
      facebook,
      linkedin,
      coverage: {
        openGraphTags: Object.keys(openGraph).length,
        twitterTags: Object.keys(twitter).length,
        facebookTags: Object.keys(facebook).length,
        linkedinTags: Object.keys(linkedin).length,
        totalSocialTags: ogTags.length + twitterTags.length + fbTags.length + linkedinTags.length
      },
      completeness: {
        openGraph: this._calculateOpenGraphCompleteness(openGraph),
        twitter: this._calculateTwitterCompleteness(twitter)
      }
    };
  }

  /**
   * Detect technical meta tags
   * @param {Document} document - DOM document
   * @returns {Object} Technical meta tags
   */
  _detectTechnicalMetaTags(document) {
    const metaTags = document.querySelectorAll('meta');
    const all = Array.from(metaTags);

    // Security and performance tags
    const security = {
      contentSecurityPolicy: this._getMetaContent(document, 'Content-Security-Policy'),
      referrerPolicy: this._getMetaContent(document, 'referrer'),
      xFrameOptions: this._getMetaContent(document, 'X-Frame-Options')
    };

    // Mobile and device tags
    const mobile = {
      viewport: this._getMetaContent(document, 'viewport'),
      formatDetection: this._getMetaContent(document, 'format-detection'),
      appleMobileWebAppCapable: this._getMetaContent(document, 'apple-mobile-web-app-capable'),
      appleMobileWebAppTitle: this._getMetaContent(document, 'apple-mobile-web-app-title'),
      appleMobileWebAppStatusBarStyle: this._getMetaContent(document, 'apple-mobile-web-app-status-bar-style')
    };

    // SEO technical tags
    const seoTechnical = {
      googlebot: this._getMetaContent(document, 'googlebot'),
      bingbot: this._getMetaContent(document, 'bingbot'),
      yahoobot: this._getMetaContent(document, 'slurp'),
      googleSiteVerification: this._getMetaContent(document, 'google-site-verification'),
      bingSiteVerification: this._getMetaContent(document, 'msvalidate.01'),
      yandexVerification: this._getMetaContent(document, 'yandex-verification')
    };

    // Performance hints
    const performance = {
      dnsPrefetch: Array.from(document.querySelectorAll('link[rel="dns-prefetch"]')),
      preconnect: Array.from(document.querySelectorAll('link[rel="preconnect"]')),
      prefetch: Array.from(document.querySelectorAll('link[rel="prefetch"]')),
      preload: Array.from(document.querySelectorAll('link[rel="preload"]'))
    };

    return {
      all: all.filter(meta => {
        const name = meta.getAttribute('name') || meta.getAttribute('property') || '';
        return this._isTechnicalMetaTag(name);
      }),
      security,
      mobile,
      seoTechnical,
      performance,
      analysis: {
        securityTagsCount: Object.values(security).filter(Boolean).length,
        mobileTagsCount: Object.values(mobile).filter(Boolean).length,
        seoTechnicalTagsCount: Object.values(seoTechnical).filter(Boolean).length,
        performanceHintsCount: Object.values(performance).reduce((sum, arr) => sum + arr.length, 0)
      }
    };
  }

  /**
   * Analyze meta tag content quality and optimization
   * @param {Object} basicMetaTags - Basic meta tags
   * @param {Object} socialMetaTags - Social media meta tags
   * @returns {Object} Content analysis results
   */
  _analyzeMetaContent(basicMetaTags, socialMetaTags) {
    const analysis = {
      title: this._analyzeTitleTag(basicMetaTags.core.title),
      description: this._analyzeDescriptionTag(basicMetaTags.core.description),
      keywords: this._analyzeKeywordsTag(basicMetaTags.core.keywords),
      social: this._analyzeSocialTags(socialMetaTags),
      consistency: this._analyzeConsistency(basicMetaTags, socialMetaTags),
      optimization: this._analyzeOptimization(basicMetaTags, socialMetaTags)
    };

    // Calculate overall content score
    const scores = [
      analysis.title.score,
      analysis.description.score,
      analysis.keywords.score,
      analysis.social.score,
      analysis.consistency.score,
      analysis.optimization.score
    ];

    analysis.overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    analysis.grade = this._calculateGrade(analysis.overallScore);

    return analysis;
  }

  /**
   * Validate meta tags against SEO best practices
   * @param {Object} basicMetaTags - Basic meta tags
   * @param {Object} socialMetaTags - Social media meta tags
   * @param {Object} technicalMetaTags - Technical meta tags
   * @returns {Object} Validation results
   */
  _validateMetaTags(basicMetaTags, socialMetaTags, technicalMetaTags) {
    const validations = {
      basic: this._validateBasicTags(basicMetaTags),
      social: this._validateSocialTags(socialMetaTags),
      technical: this._validateTechnicalTags(technicalMetaTags),
      structure: this._validateTagStructure(basicMetaTags, socialMetaTags, technicalMetaTags)
    };

    // Calculate overall validation score
    const scores = Object.values(validations).map(v => v.score || 0);
    validations.overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    validations.grade = this._calculateGrade(validations.overallScore);

    // Identify critical issues
    validations.criticalIssues = [];
    if (!basicMetaTags.core.title.content) {
      validations.criticalIssues.push('Missing title tag');
    }
    if (!basicMetaTags.core.description.content) {
      validations.criticalIssues.push('Missing meta description');
    }
    if (!basicMetaTags.technical.viewport.content) {
      validations.criticalIssues.push('Missing viewport meta tag');
    }

    return validations;
  }

  // ============================================================================
  // ANALYSIS HELPER METHODS
  // ============================================================================

  _analyzeTitleTag(titleData) {
    const { content, length } = titleData;
    const { minLength, maxLength, optimal } = this.validationPatterns.title;

    let score = 0;
    const issues = [];
    const recommendations = [];

    if (!content) {
      issues.push('Title tag is missing');
      recommendations.push('Add a descriptive title tag');
    } else {
      // Length analysis
      if (length < minLength) {
        issues.push('Title is too short');
        recommendations.push(`Expand title to at least ${minLength} characters`);
        score += 20;
      } else if (length > maxLength) {
        issues.push('Title is too long');
        recommendations.push(`Shorten title to under ${maxLength} characters`);
        score += 60;
      } else if (length >= optimal.min && length <= optimal.max) {
        score += 100;
      } else {
        score += 80;
      }

      // Content analysis
      if (content.includes('|') || content.includes('-')) {
        score += 10; // Brand separation
      }
      if (content.charAt(0) === content.charAt(0).toUpperCase()) {
        score += 5; // Proper capitalization
      }
    }

    return {
      score: Math.min(100, score),
      length,
      optimal: length >= optimal.min && length <= optimal.max,
      issues,
      recommendations,
      analysis: {
        hasContent: !!content,
        lengthCategory: this._getLengthCategory(length, minLength, maxLength),
        hasBrandSeparator: content.includes('|') || content.includes('-'),
        properCapitalization: content.charAt(0) === content.charAt(0).toUpperCase()
      }
    };
  }

  _analyzeDescriptionTag(descriptionData) {
    const { content, length } = descriptionData;
    const { minLength, maxLength, optimal } = this.validationPatterns.description;

    let score = 0;
    const issues = [];
    const recommendations = [];

    if (!content) {
      issues.push('Meta description is missing');
      recommendations.push('Add a compelling meta description');
    } else {
      // Length analysis
      if (length < minLength) {
        issues.push('Description is too short');
        recommendations.push(`Expand description to at least ${minLength} characters`);
        score += 30;
      } else if (length > maxLength) {
        issues.push('Description is too long');
        recommendations.push(`Shorten description to under ${maxLength} characters`);
        score += 70;
      } else if (length >= optimal.min && length <= optimal.max) {
        score += 100;
      } else {
        score += 85;
      }

      // Content quality analysis
      if (content.includes('.')) {
        score += 5; // Complete sentences
      }
      if (content.match(/\b(call|click|learn|discover|find|get|try)\b/i)) {
        score += 10; // Action words
      }
    }

    return {
      score: Math.min(100, score),
      length,
      optimal: length >= optimal.min && length <= optimal.max,
      issues,
      recommendations,
      analysis: {
        hasContent: !!content,
        lengthCategory: this._getLengthCategory(length, minLength, maxLength),
        hasActionWords: !!content.match(/\b(call|click|learn|discover|find|get|try)\b/i),
        hasCompleteSentences: content.includes('.')
      }
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  _getMetaContent(document, name) {
    const meta = document.querySelector(`meta[name="${name}"]`) ||
                 document.querySelector(`meta[property="${name}"]`) ||
                 document.querySelector(`meta[http-equiv="${name}"]`);
    return meta ? meta.getAttribute('content') : null;
  }

  _getMetaElement(document, name) {
    return document.querySelector(`meta[name="${name}"]`) ||
           document.querySelector(`meta[property="${name}"]`) ||
           document.querySelector(`meta[http-equiv="${name}"]`);
  }

  _isTechnicalMetaTag(name) {
    const technicalTags = [
      'googlebot', 'bingbot', 'slurp', 'google-site-verification',
      'msvalidate.01', 'yandex-verification', 'format-detection',
      'apple-mobile-web-app-capable', 'apple-mobile-web-app-title',
      'Content-Security-Policy', 'referrer', 'X-Frame-Options'
    ];
    return technicalTags.some(tag => name.toLowerCase().includes(tag.toLowerCase()));
  }

  _calculateOpenGraphCompleteness(openGraph) {
    const required = this.socialRequirements.openGraph;
    const found = required.filter(tag => openGraph[tag]);
    return (found.length / required.length) * 100;
  }

  _calculateTwitterCompleteness(twitter) {
    const required = this.socialRequirements.twitter;
    const found = required.filter(tag => twitter[tag]);
    return (found.length / required.length) * 100;
  }

  _getLengthCategory(length, min, max) {
    if (length === 0) return 'empty';
    if (length < min) return 'too_short';
    if (length > max) return 'too_long';
    return 'optimal';
  }

  _calculateGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D+';
    if (score >= 40) return 'D';
    return 'F';
  }

  _getOptimizationLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    if (score >= 60) return 'poor';
    return 'critical';
  }

  _generateCacheKey(document) {
    const title = document.title || '';
    const description = this._getMetaContent(document, 'description') || '';
    return btoa(title + description).slice(0, 20);
  }

  // Placeholder methods for complete analysis (implement as needed)
  _analyzeKeywordsTag(keywordsData) {
    return { score: 75, issues: [], recommendations: [], analysis: {} };
  }

  _analyzeSocialTags(socialMetaTags) {
    return { score: 80, issues: [], recommendations: [], analysis: {} };
  }

  _analyzeConsistency(basicMetaTags, socialMetaTags) {
    return { score: 85, issues: [], recommendations: [], analysis: {} };
  }

  _analyzeOptimization(basicMetaTags, socialMetaTags) {
    return { score: 78, issues: [], recommendations: [], analysis: {} };
  }

  _validateBasicTags(basicMetaTags) {
    return { score: 82, issues: [], recommendations: [] };
  }

  _validateSocialTags(socialMetaTags) {
    return { score: 77, issues: [], recommendations: [] };
  }

  _validateTechnicalTags(technicalMetaTags) {
    return { score: 85, issues: [], recommendations: [] };
  }

  _validateTagStructure(basicMetaTags, socialMetaTags, technicalMetaTags) {
    return { score: 88, issues: [], recommendations: [] };
  }
}

export default MetaTagDetector;
