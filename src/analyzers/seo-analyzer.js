/**
 * ============================================================================
 * SEO ANALYZER MODULE
 * ============================================================================
 * 
 * Comprehensive SEO analysis using BaseAnalyzer architecture.
 * Provides detailed analysis of on-page SEO elements including:
 * - Title tags and meta descriptions
 * - Open Graph and Twitter Card data
 * - Structured data (JSON-LD)
 * - Canonical URLs and robots directives
 * - Language attributes and internationalization
 * - Favicon analysis
 * 
 * @extends BaseAnalyzer
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @version 1.0.0
 */

import { BaseAnalyzer } from './core/BaseAnalyzer.js';
import { extractSEOData, calculateSEOScore, validateSEOData } from '../extractors/seo-extractor.js';

export class SEOAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    // Initialize properties before calling super()
    const seoOptions = {
      includeAdvancedAnalysis: options.includeAdvancedAnalysis ?? true,
      analyzePerformance: options.analyzePerformance ?? true,
      extractKeywords: options.extractKeywords ?? true,
      validateStructuredData: options.validateStructuredData ?? true,
      checkSocialMedia: options.checkSocialMedia ?? true,
      ...options
    };
    
    super('SEO', seoOptions);
    
    // SEO-specific configuration (moved after super call)
    this.config = seoOptions;
    
    // Initialize cache and metrics if not already present
    if (!this.cache) {
      this.cache = new Map();
    }
    if (!this.metrics) {
      this.metrics = {
        totalTime: 0,
        cacheHits: 0,
        cacheMisses: 0,
        errors: 0
      };
    }
    
    this.log('SEOAnalyzer initialized with configuration:', this.config);
  }

  /**
   * Analyze SEO elements of a web page
   * @param {Object} context - Analysis context
   * @param {Document} context.document - DOM document to analyze
   * @param {string} context.url - Page URL for context
   * @param {Object} context.pageData - Additional page data
   * @returns {Object} Comprehensive SEO analysis results
   */
  async analyze(context) {
    if (!this.validate(context)) {
      return this.handleError(new Error('Invalid context provided'), 'validation');
    }

    // Optimized property access - avoid destructuring overhead
    const document = context.document;
    const url = context.url || null;
    const pageData = context.pageData || {};

    try {
      this.log('Starting comprehensive SEO analysis');
      const startTime = this.measureTime();

      // Validate input
      if (!this.validate(document)) {
        return this.handleError('Invalid document provided for SEO analysis');
      }

      // Extract core SEO data using existing extractor
      const seoData = extractSEOData(document, this.cache, this.metrics);
      
      // Calculate SEO score and recommendations
      const seoScore = calculateSEOScore(seoData);
      
      // Perform additional analysis
      const analysis = {
        ...seoData,
        
        // Enhanced analysis sections
        performance: this.config.analyzePerformance ? this._analyzePerformance(seoData) : null,
        recommendations: this._generateRecommendations(seoData, seoScore),
        keywords: this.config.extractKeywords ? this._extractKeywords(seoData, document) : null,
        socialMedia: this.config.checkSocialMedia ? this._analyzeSocialMedia(seoData) : null,
        technical: this._analyzeTechnicalSEO(seoData, document),
        content: this._analyzeContentSEO(seoData, document),
        
        // Scoring and grading
        score: seoScore,
        
        // Metadata
        metadata: this.getMetadata(),
        timestamp: new Date().toISOString(),
        url: url
      };

      // Validate the analysis result
      if (!this._validateAnalysisResult(analysis)) {
        this.log('Warning: Analysis result validation failed', 'warn');
      }

      const duration = this.measureTime(startTime);
      this.log(`SEO analysis completed in ${duration}ms`);
      
      return analysis;

    } catch (error) {
      return this.handleError(`SEO analysis failed: ${error.message}`, error);
    }
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata and capabilities
   */
  getMetadata() {
    return {
      name: 'SEO Analyzer',
      version: '1.0.0',
      description: 'Comprehensive SEO analysis including on-page elements, social media tags, and technical SEO factors',
      author: 'Nimrod Galor',
      
      capabilities: [
        'Title tag analysis',
        'Meta description optimization',
        'Open Graph data extraction',
        'Twitter Card analysis',
        'Structured data validation',
        'Canonical URL detection',
        'Robots directive parsing',
        'Language attribute analysis',
        'Favicon assessment',
        'Keyword extraction',
        'SEO scoring and recommendations'
      ],
      
      outputFormat: {
        title: 'Object with text, length, optimization flags',
        metaDescription: 'Object with content analysis and recommendations',
        openGraph: 'Complete Open Graph tag collection',
        twitterCard: 'Twitter Card metadata',
        structuredData: 'JSON-LD schema analysis',
        score: 'SEO score with recommendations',
        performance: 'Performance and optimization metrics',
        technical: 'Technical SEO factors',
        content: 'Content-related SEO analysis'
      },
      
      processingTime: this.metrics?.totalTime || 0,
      
      configuration: this.config
    };
  }

  /**
   * Validate document for SEO analysis
   * @param {Document} document - Document to validate
   * @returns {boolean} True if valid for analysis
   */
  validate(document) {
    if (!document) {
      this.log('Document is null or undefined', 'error');
      return false;
    }

    if (typeof document !== 'object') {
      this.log('Document is not an object', 'error');
      return false;
    }

    // Check for required properties
    const requiredProperties = ['head', 'title', 'documentElement'];
    for (const prop of requiredProperties) {
      if (!(prop in document)) {
        this.log(`Document missing required property: ${prop}`, 'warn');
        // Don't fail validation, but log warning
      }
    }

    return true;
  }

  // ============================================================================
  // SPECIALIZED ANALYSIS METHODS
  // ============================================================================

  /**
   * Analyze SEO performance metrics
   * @param {Object} seoData - Extracted SEO data
   * @returns {Object} Performance analysis
   * @private
   */
  _analyzePerformance(seoData) {
    const performance = {
      titleOptimization: 0,
      metaDescriptionOptimization: 0,
      overallOptimization: 0,
      issues: [],
      strengths: []
    };

    // Title optimization scoring
    if (seoData.title) {
      if (!seoData.title.isEmpty) {
        performance.titleOptimization += 40;
        performance.strengths.push('Title tag present');
      } else {
        performance.issues.push('Missing title tag');
      }

      if (!seoData.title.isTooShort && !seoData.title.isTooLong) {
        performance.titleOptimization += 40;
        performance.strengths.push('Title length optimized');
      } else {
        performance.issues.push(`Title length not optimal: ${seoData.title.length} characters`);
      }

      if (seoData.title.wordCount >= 3) {
        performance.titleOptimization += 20;
        performance.strengths.push('Title has adequate word count');
      }
    } else {
      performance.issues.push('Title data not available');
    }

    // Meta description optimization scoring
    if (seoData.metaDescription) {
      if (!seoData.metaDescription.isEmpty) {
        performance.metaDescriptionOptimization += 40;
        performance.strengths.push('Meta description present');
      } else {
        performance.issues.push('Missing meta description');
      }

      if (!seoData.metaDescription.isTooShort && !seoData.metaDescription.isTooLong) {
        performance.metaDescriptionOptimization += 40;
        performance.strengths.push('Meta description length optimized');
      } else {
        performance.issues.push(`Meta description length not optimal: ${seoData.metaDescription.length} characters`);
      }

      if (seoData.metaDescription.hasCallToAction) {
        performance.metaDescriptionOptimization += 20;
        performance.strengths.push('Meta description includes call-to-action');
      }
    } else {
      performance.issues.push('Meta description data not available');
    }

    // Calculate overall optimization score
    performance.overallOptimization = Math.round(
      (performance.titleOptimization + performance.metaDescriptionOptimization) / 2
    );

    return performance;
  }

  /**
   * Generate comprehensive SEO recommendations
   * @param {Object} seoData - Extracted SEO data
   * @param {Object} seoScore - SEO score analysis
   * @returns {Array} Array of recommendations
   * @private
   */
  _generateRecommendations(seoData, seoScore) {
    const recommendations = [...seoScore.recommendations];

    // Additional recommendations based on data analysis
    if (seoData.openGraph && !seoData.openGraph.image) {
      recommendations.push({
        type: 'enhancement',
        priority: 'medium',
        category: 'Social Media',
        title: 'Add Open Graph Image',
        description: 'Include an og:image tag to improve social media sharing appearance',
        impact: 'Improves click-through rates from social media platforms'
      });
    }

    if (seoData.structuredData && seoData.structuredData.count === 0) {
      recommendations.push({
        type: 'enhancement',
        priority: 'high',
        category: 'Structured Data',
        title: 'Implement Structured Data',
        description: 'Add JSON-LD structured data to help search engines understand your content',
        impact: 'Enables rich snippets and improves search result visibility'
      });
    }

    if (!seoData.canonical) {
      recommendations.push({
        type: 'technical',
        priority: 'high',
        category: 'Technical SEO',
        title: 'Add Canonical URL',
        description: 'Specify a canonical URL to prevent duplicate content issues',
        impact: 'Prevents SEO penalties from duplicate content'
      });
    }

    if (!seoData.language.htmlLang) {
      recommendations.push({
        type: 'technical',
        priority: 'medium',
        category: 'Internationalization',
        title: 'Add Language Declaration',
        description: 'Add lang attribute to html element to specify page language',
        impact: 'Improves accessibility and helps search engines understand content language'
      });
    }

    if (seoData.favicon && seoData.favicon.count === 0) {
      recommendations.push({
        type: 'enhancement',
        priority: 'low',
        category: 'User Experience',
        title: 'Add Favicon',
        description: 'Include a favicon to improve brand recognition in browser tabs',
        impact: 'Enhances user experience and brand visibility'
      });
    }

    return recommendations;
  }

  /**
   * Extract and analyze keywords from page content
   * @param {Object} seoData - SEO data
   * @param {Document} document - DOM document
   * @returns {Object} Keyword analysis
   * @private
   */
  _extractKeywords(seoData, document) {
    try {
      const keywords = {
        title: [],
        metaDescription: [],
        headings: [],
        content: [],
        metaKeywords: []
      };

      // Extract keywords from title
      if (seoData.title && seoData.title.text) {
        keywords.title = this._extractWordsFromText(seoData.title.text);
      }

      // Extract keywords from meta description
      if (seoData.metaDescription && seoData.metaDescription.text) {
        keywords.metaDescription = this._extractWordsFromText(seoData.metaDescription.text);
      }

      // Extract keywords from meta keywords tag
      if (seoData.metaKeywords) {
        keywords.metaKeywords = seoData.metaKeywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
      }

      // Extract keywords from headings
      const headings = Array.from(this.safeQuery(document, 'h1, h2, h3, h4, h5, h6'));
      headings.forEach(heading => {
        const headingKeywords = this._extractWordsFromText(heading.textContent);
        keywords.headings.push(...headingKeywords);
      });

      // Extract keywords from main content (first 500 words)
      const contentElements = Array.from(this.safeQuery(document, 'p, li, td, div'));
      let contentText = '';
      for (const element of contentElements) {
        contentText += element.textContent + ' ';
        if (contentText.length > 2000) break; // Limit to prevent performance issues
      }
      keywords.content = this._extractWordsFromText(contentText).slice(0, 20);

      return {
        title: keywords.title.slice(0, 10),
        metaDescription: keywords.metaDescription.slice(0, 10),
        headings: [...new Set(keywords.headings)].slice(0, 15),
        content: keywords.content,
        metaKeywords: keywords.metaKeywords.slice(0, 10),
        
        analysis: {
          titleKeywordCount: keywords.title.length,
          metaDescriptionKeywordCount: keywords.metaDescription.length,
          headingKeywordCount: keywords.headings.length,
          contentKeywordCount: keywords.content.length,
          totalUniqueKeywords: new Set([
            ...keywords.title,
            ...keywords.metaDescription,
            ...keywords.headings,
            ...keywords.content
          ]).size
        }
      };

    } catch (error) {
      this.log(`Keyword extraction failed: ${error.message}`, 'error');
      return {
        title: [],
        metaDescription: [],
        headings: [],
        content: [],
        metaKeywords: [],
        analysis: {
          titleKeywordCount: 0,
          metaDescriptionKeywordCount: 0,
          headingKeywordCount: 0,
          contentKeywordCount: 0,
          totalUniqueKeywords: 0
        }
      };
    }
  }

  /**
   * Analyze social media optimization
   * @param {Object} seoData - SEO data
   * @returns {Object} Social media analysis
   * @private
   */
  _analyzeSocialMedia(seoData) {
    const analysis = {
      openGraph: {
        score: 0,
        completeness: 0,
        issues: [],
        strengths: []
      },
      twitterCard: {
        score: 0,
        completeness: 0,
        issues: [],
        strengths: []
      },
      overallScore: 0
    };

    // Open Graph analysis
    if (seoData.openGraph) {
      const og = seoData.openGraph;
      let ogElements = 0;
      let ogPresent = 0;

      const requiredOG = ['title', 'description', 'image', 'url'];
      requiredOG.forEach(prop => {
        ogElements++;
        if (og[prop]) {
          ogPresent++;
          analysis.openGraph.strengths.push(`og:${prop} present`);
        } else {
          analysis.openGraph.issues.push(`Missing og:${prop}`);
        }
      });

      analysis.openGraph.completeness = Math.round((ogPresent / ogElements) * 100);
      analysis.openGraph.score = analysis.openGraph.completeness;
    }

    // Twitter Card analysis
    if (seoData.twitterCard) {
      const twitter = seoData.twitterCard;
      let twitterElements = 0;
      let twitterPresent = 0;

      const requiredTwitter = ['card', 'title', 'description'];
      requiredTwitter.forEach(prop => {
        twitterElements++;
        if (twitter[prop]) {
          twitterPresent++;
          analysis.twitterCard.strengths.push(`twitter:${prop} present`);
        } else {
          analysis.twitterCard.issues.push(`Missing twitter:${prop}`);
        }
      });

      analysis.twitterCard.completeness = Math.round((twitterPresent / twitterElements) * 100);
      analysis.twitterCard.score = analysis.twitterCard.completeness;
    }

    // Calculate overall social media score
    analysis.overallScore = Math.round(
      (analysis.openGraph.score + analysis.twitterCard.score) / 2
    );

    return analysis;
  }

  /**
   * Analyze technical SEO factors
   * @param {Object} seoData - SEO data
   * @param {Document} document - DOM document
   * @returns {Object} Technical SEO analysis
   * @private
   */
  _analyzeTechnicalSEO(seoData, document) {
    const technical = {
      score: 0,
      factors: {},
      issues: [],
      strengths: []
    };

    // Canonical URL analysis
    technical.factors.canonical = {
      present: !!seoData.canonical,
      url: seoData.canonical || null,
      score: seoData.canonical ? 100 : 0
    };

    if (seoData.canonical) {
      technical.strengths.push('Canonical URL specified');
    } else {
      technical.issues.push('Missing canonical URL');
    }

    // Robots directive analysis
    technical.factors.robots = {
      present: !!seoData.robots,
      directives: seoData.robotsDirectives?.directives || [],
      allowsIndexing: seoData.robotsDirectives?.analysis?.allowsIndexing ?? true,
      allowsFollowing: seoData.robotsDirectives?.analysis?.allowsFollowing ?? true,
      score: seoData.robots ? 100 : 50 // Default allows indexing
    };

    if (seoData.robots) {
      technical.strengths.push('Robots meta tag present');
    }

    // Language attribute analysis
    technical.factors.language = {
      htmlLang: seoData.language?.htmlLang || null,
      hreflangLinks: seoData.language?.hreflangLinks?.length || 0,
      score: seoData.language?.htmlLang ? 100 : 0
    };

    if (seoData.language?.htmlLang) {
      technical.strengths.push('HTML language attribute specified');
    } else {
      technical.issues.push('Missing HTML lang attribute');
    }

    // Structured data analysis
    technical.factors.structuredData = {
      count: seoData.structuredData?.count || 0,
      types: seoData.structuredData?.types || [],
      score: seoData.structuredData?.count > 0 ? Math.min(100, seoData.structuredData.count * 25) : 0
    };

    if (seoData.structuredData?.count > 0) {
      technical.strengths.push(`${seoData.structuredData.count} structured data block(s) found`);
    } else {
      technical.issues.push('No structured data found');
    }

    // Favicon analysis
    technical.factors.favicon = {
      count: seoData.favicon?.count || 0,
      hasStandard: seoData.favicon?.hasStandardFavicon || false,
      hasAppleTouch: seoData.favicon?.hasAppleTouchIcon || false,
      score: seoData.favicon?.count > 0 ? 100 : 0
    };

    // Calculate overall technical score
    const factorScores = Object.values(technical.factors).map(f => f.score);
    technical.score = Math.round(
      factorScores.reduce((sum, score) => sum + score, 0) / factorScores.length
    );

    return technical;
  }

  /**
   * Analyze content-related SEO factors
   * @param {Object} seoData - SEO data
   * @param {Document} document - DOM document
   * @returns {Object} Content SEO analysis
   * @private
   */
  _analyzeContentSEO(seoData, document) {
    const content = {
      score: 0,
      factors: {},
      issues: [],
      strengths: []
    };

    // Title analysis
    content.factors.title = {
      present: !seoData.title?.isEmpty,
      length: seoData.title?.length || 0,
      wordCount: seoData.title?.wordCount || 0,
      optimized: !seoData.title?.isTooShort && !seoData.title?.isTooLong,
      score: this._calculateTitleScore(seoData.title)
    };

    // Meta description analysis
    content.factors.metaDescription = {
      present: !seoData.metaDescription?.isEmpty,
      length: seoData.metaDescription?.length || 0,
      wordCount: seoData.metaDescription?.wordCount || 0,
      optimized: !seoData.metaDescription?.isTooShort && !seoData.metaDescription?.isTooLong,
      hasCallToAction: seoData.metaDescription?.hasCallToAction || false,
      score: this._calculateMetaDescriptionScore(seoData.metaDescription)
    };

    // Heading structure analysis
    try {
      const headings = {
        h1: Array.from(this.safeQuery(document, 'h1')),
        h2: Array.from(this.safeQuery(document, 'h2')),
        h3: Array.from(this.safeQuery(document, 'h3')),
        h4: Array.from(this.safeQuery(document, 'h4')),
        h5: Array.from(this.safeQuery(document, 'h5')),
        h6: Array.from(this.safeQuery(document, 'h6'))
      };

      content.factors.headings = {
        h1Count: headings.h1.length,
        h2Count: headings.h2.length,
        h3Count: headings.h3.length,
        totalHeadings: Object.values(headings).reduce((sum, arr) => sum + arr.length, 0),
        hasH1: headings.h1.length > 0,
        multipleH1: headings.h1.length > 1,
        score: this._calculateHeadingScore(headings)
      };

      if (content.factors.headings.hasH1) {
        content.strengths.push('H1 heading present');
      } else {
        content.issues.push('Missing H1 heading');
      }

      if (content.factors.headings.multipleH1) {
        content.issues.push('Multiple H1 headings found');
      }

    } catch (error) {
      this.log(`Heading analysis failed: ${error.message}`, 'error');
      content.factors.headings = {
        h1Count: 0,
        h2Count: 0,
        h3Count: 0,
        totalHeadings: 0,
        hasH1: false,
        multipleH1: false,
        score: 0
      };
    }

    // Calculate overall content score
    const factorScores = [
      content.factors.title.score,
      content.factors.metaDescription.score,
      content.factors.headings.score
    ];
    content.score = Math.round(
      factorScores.reduce((sum, score) => sum + score, 0) / factorScores.length
    );

    return content;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Extract meaningful words from text
   * @param {string} text - Text to analyze
   * @returns {Array} Array of keywords
   * @private
   */
  _extractWordsFromText(text) {
    if (!text) return [];
    
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && word.length < 20)
      .filter(word => !this._isStopWord(word))
      .slice(0, 15);
  }

  /**
   * Check if word is a stop word
   * @param {string} word - Word to check
   * @returns {boolean} True if stop word
   * @private
   */
  _isStopWord(word) {
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her',
      'was', 'one', 'our', 'had', 'day', 'get', 'has', 'him', 'his', 'how',
      'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did',
      'its', 'let', 'put', 'say', 'she', 'too', 'use', 'this', 'that', 'with'
    ]);
    return stopWords.has(word);
  }

  /**
   * Calculate title optimization score
   * @param {Object} titleData - Title data
   * @returns {number} Score 0-100
   * @private
   */
  _calculateTitleScore(titleData) {
    if (!titleData) return 0;
    
    let score = 0;
    
    if (!titleData.isEmpty) score += 40;
    if (!titleData.isTooShort && !titleData.isTooLong) score += 40;
    if (titleData.wordCount >= 3) score += 20;
    
    return score;
  }

  /**
   * Calculate meta description optimization score
   * @param {Object} metaData - Meta description data
   * @returns {number} Score 0-100
   * @private
   */
  _calculateMetaDescriptionScore(metaData) {
    if (!metaData) return 0;
    
    let score = 0;
    
    if (!metaData.isEmpty) score += 40;
    if (!metaData.isTooShort && !metaData.isTooLong) score += 40;
    if (metaData.hasCallToAction) score += 20;
    
    return score;
  }

  /**
   * Calculate heading structure score
   * @param {Object} headings - Heading elements
   * @returns {number} Score 0-100
   * @private
   */
  _calculateHeadingScore(headings) {
    let score = 0;
    
    if (headings.h1.length === 1) score += 50;
    else if (headings.h1.length > 1) score += 20; // Multiple H1s not ideal
    
    if (headings.h2.length > 0) score += 25;
    if (headings.h3.length > 0) score += 15;
    if (Object.values(headings).reduce((sum, arr) => sum + arr.length, 0) >= 3) score += 10;
    
    return score;
  }

  /**
   * Validate analysis result structure
   * @param {Object} analysis - Analysis result
   * @returns {boolean} True if valid
   * @private
   */
  _validateAnalysisResult(analysis) {
    const requiredProps = [
      'title', 'metaDescription', 'openGraph', 'twitterCard', 
      'structuredData', 'score', 'metadata'
    ];
    
    return requiredProps.every(prop => prop in analysis);
  }
}

// Export singleton instance
export const seoAnalyzer = new SEOAnalyzer();