/**
 * Enhanced Advanced Link Analysis - Anchor Text and Context Analyzer
 * Comprehensive analysis of anchor text patterns, distribution, context, and SEO implications with BaseAnalyzer integration
 * 
 * @fileoverview Advanced link analysis for SEO and content optimization with professional scoring
 * @extends BaseAnalyzer
 * @version 1.0.0
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @date 2025-08-09
 */

import { BaseAnalyzer } from './core/BaseAnalyzer.js';
import { AnalyzerCategories } from './core/AnalyzerInterface.js';

/**
 * Anchor text analysis configuration and patterns
 */
export const ANCHOR_TEXT_CONFIG = {
  // Anchor text categories for analysis
  CATEGORIES: {
    EXACT_MATCH: 'exact-match',        // Exact keyword match
    PARTIAL_MATCH: 'partial-match',    // Contains target keywords
    BRANDED: 'branded',                // Brand/company names
    GENERIC: 'generic',                // Click here, read more, etc.
    URL: 'url',                        // Raw URLs as anchor text
    IMAGE: 'image',                    // Image alt text as anchor
    EMPTY: 'empty',                    // Empty or whitespace only
    LONG_TAIL: 'long-tail',           // Long descriptive phrases
    NAVIGATIONAL: 'navigational'       // Navigation-specific terms
  },

  // Generic anchor text patterns (SEO red flags)
  GENERIC_PATTERNS: [
    /^click here$/i,
    /^read more$/i,
    /^more info$/i,
    /^learn more$/i,
    /^see more$/i,
    /^continue reading$/i,
    /^view details$/i,
    /^download$/i,
    /^here$/i,
    /^this$/i,
    /^link$/i,
    /^website$/i,
    /^page$/i,
    /^article$/i
  ],

  // URL patterns for detecting raw URLs as anchor text
  URL_PATTERNS: [
    /^https?:\/\//i,
    /^www\./i,
    /\.(com|org|net|edu|gov|co\.uk|io|ly|me)$/i
  ],

  // Navigational terms
  NAVIGATIONAL_PATTERNS: [
    /^home$/i,
    /^about$/i,
    /^contact$/i,
    /^services$/i,
    /^products$/i,
    /^blog$/i,
    /^news$/i,
    /^portfolio$/i,
    /^gallery$/i,
    /^testimonials$/i,
    /^pricing$/i,
    /^faq$/i
  ],

  // Analysis thresholds
  THRESHOLDS: {
    MAX_GENERIC_PERCENTAGE: 20,     // Max 20% generic anchor text
    MIN_BRANDED_PERCENTAGE: 10,     // At least 10% branded anchors
    MAX_EXACT_MATCH_PERCENTAGE: 15, // Max 15% exact match (over-optimization)
    MIN_ANCHOR_LENGTH: 2,           // Minimum meaningful anchor length
    MAX_ANCHOR_LENGTH: 100,         // Maximum reasonable anchor length
    KEYWORD_DENSITY_WARNING: 5      // Warn if same keyword appears >5 times
  }
};

/**
 * Enhanced Advanced Link Analyzer Class with BaseAnalyzer Integration
 */
export class AdvancedLinkAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('AdvancedLinkAnalyzer', {
      enableAnchorTextAnalysis: options.enableAnchorTextAnalysis !== false,
      enableLinkContext: options.enableLinkContext !== false,
      enableDepthAnalysis: options.enableDepthAnalysis !== false,
      enableOrphanDetection: options.enableOrphanDetection !== false,
      enableInternalLinkAnalysis: options.enableInternalLinkAnalysis !== false,
      enableExternalLinkAnalysis: options.enableExternalLinkAnalysis !== false,
      strictValidation: options.strictValidation || false,
      includeRecommendations: options.includeRecommendations !== false,
      ...options
    });

    this.version = '1.0.0';
    this.category = AnalyzerCategories.LINKS;
    
    this.config = {
      enableAnchorTextAnalysis: this.options.enableAnchorTextAnalysis,
      enableLinkContext: this.options.enableLinkContext,
      enableDepthAnalysis: this.options.enableDepthAnalysis,
      enableOrphanDetection: this.options.enableOrphanDetection,
      enableInternalLinkAnalysis: this.options.enableInternalLinkAnalysis,
      enableExternalLinkAnalysis: this.options.enableExternalLinkAnalysis,
      siteUrl: this.options.siteUrl || '',
      brandTerms: this.options.brandTerms || [],
      targetKeywords: this.options.targetKeywords || []
    };
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'AdvancedLinkAnalyzer',
      version: '1.0.0',
      description: 'Comprehensive anchor text analysis, link context evaluation, and SEO optimization',
      category: AnalyzerCategories.LINKS,
      priority: 'high',
      capabilities: [
        'anchor_text_analysis',
        'link_context_evaluation',
        'internal_link_optimization',
        'external_link_validation',
        'link_depth_analysis',
        'orphan_page_detection',
        'seo_link_quality_assessment',
        'recommendation_generation'
      ]
    };
  }

  /**
   * Validate analysis context
   * @param {Object} context - Analysis context
   * @returns {boolean} Whether context is valid
   */
  validate(context) {
    try {
      if (!context || typeof context !== 'object') {
        return false;
      }

      const { dom, document } = context;
      if ((!dom || !dom.window?.document) && (!document || !document.querySelector)) {
        this.log('Advanced link analysis requires a valid DOM document', 'warn');
        return false;
      }

      return true;
    } catch (error) {
      this.handleError('Error validating advanced link analysis context', error);
      return false;
    }
  }

  /**
   * Perform comprehensive advanced link analysis with BaseAnalyzer integration
   * @param {Object} context - Analysis context containing DOM and page data
   * @returns {Promise<Object>} Advanced link analysis results
   */
  async analyze(context) {
    const startTime = Date.now();
    
    try {
      this.log('Starting advanced link analysis', 'info');

      // Validate context
      if (!this.validate(context)) {
        return this.handleError('Invalid context for advanced link analysis', new Error('Context validation failed'), {
          hasAdvancedLinks: false,
          score: 0,
          grade: 'F'
        });
      }

      const { dom, document, pageUrl = '', siteData = {} } = context;
      const analysisDocument = document || dom.window.document;

      // Perform advanced link analysis
      const linkData = await this._performAdvancedLinkAnalysis(analysisDocument, pageUrl, siteData);
      
      // Calculate comprehensive score
      const score = this._calculateComprehensiveScore(linkData);
      const grade = this._getGradeFromScore ? this._getGradeFromScore(score) : this._calculateGrade(score);
      
      // Generate recommendations
      const recommendations = this._generateAdvancedLinkRecommendations(linkData);
      
      // Generate summary
      const summary = this._generateAdvancedLinkSummary(linkData, score);

      const result = {
        success: true,
        data: {
          ...linkData,
          score,
          grade,
          recommendations,
          summary,
          metadata: this.getMetadata()
        },
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

      this.log(`Advanced link analysis completed in ${result.executionTime}ms with score ${score}`, 'info');
      return result;

    } catch (error) {
      return this.handleError('Advanced link analysis failed', error, {
        hasAdvancedLinks: false,
        score: 0,
        grade: 'F',
        summary: 'Advanced link analysis encountered an error'
      });
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use analyze() method instead
   * @param {Object} dom - JSDOM document object
   * @param {string} pageUrl - Current page URL
   * @param {Object} siteData - Site-wide crawl data
   * @returns {Promise<Object>} Advanced link analysis results
   */
  async analyzeAdvancedLinks(dom, pageUrl = '', siteData = {}) {
    console.warn('analyzeAdvancedLinks() is deprecated. Use analyze() method instead.');
    const document = dom.window.document;
    return this._performAdvancedLinkAnalysis(document, pageUrl, siteData);
  }

  /**
   * Internal method to perform advanced link analysis
   * @param {Document} document - DOM document
   * @param {string} pageUrl - Current page URL
   * @param {Object} siteData - Site-wide crawl data
   * @returns {Promise<Object>} Advanced link analysis results
   */
  async _performAdvancedLinkAnalysis(document, pageUrl = '', siteData = {}) {
    try {
      this.log('Analyzing advanced link patterns and anchor text', 'info');
      
      const analysis = {
        // Anchor text analysis
        anchorTextAnalysis: this.config.enableAnchorTextAnalysis ? 
          this._analyzeAnchorText(document, pageUrl) : null,
        
        // Link context analysis
        linkContextAnalysis: this.config.enableLinkContext ? 
          this._analyzeLinkContext(document) : null,
        
        // Link depth analysis
        depthAnalysis: this.config.enableDepthAnalysis ? 
          this._analyzePageDepth(pageUrl, siteData) : null,
        
        // Orphaned pages detection
        orphanAnalysis: this.config.enableOrphanDetection ? 
          this._analyzeOrphanStatus(pageUrl, siteData) : null,
        
        // Overall link health score
        linkHealthScore: 0,
        
        // SEO recommendations
        recommendations: []
      };

      // Calculate overall link health score
      analysis.linkHealthScore = this._calculateLinkHealthScore(analysis);
      
      // Generate comprehensive recommendations
      analysis.recommendations = this._generateLinkRecommendations(analysis);
      
      return analysis;
    } catch (error) {
      return {
        error: `Advanced link analysis failed: ${error.message}`,
        anchorTextAnalysis: null,
        linkContextAnalysis: null,
        linkHealthScore: 0
      };
    }
  }

  /**
   * Analyze anchor text patterns and distribution
   * @private
   */
  _analyzeAnchorText(document, pageUrl) {
    const links = Array.from(document.querySelectorAll('a[href]'));
    
    const analysis = {
      totalLinks: links.length,
      internalLinks: 0,
      externalLinks: 0,
      anchors: [],
      distribution: {},
      categories: {},
      keywords: {},
      patterns: {
        generic: 0,
        branded: 0,
        exactMatch: 0,
        partialMatch: 0,
        urls: 0,
        empty: 0,
        images: 0
      },
      issues: [],
      recommendations: []
    };

    // Initialize category counters
    Object.values(ANCHOR_TEXT_CONFIG.CATEGORIES).forEach(category => {
      analysis.categories[category] = 0;
    });

    // Analyze each link
    links.forEach((link, index) => {
      const anchorData = this._analyzeIndividualAnchor(link, pageUrl, index);
      analysis.anchors.push(anchorData);

      // Update counters
      if (anchorData.isInternal) {
        analysis.internalLinks++;
      } else {
        analysis.externalLinks++;
      }

      // Update category counts
      analysis.categories[anchorData.category]++;
      
      // Update pattern counts
      if (anchorData.isGeneric) analysis.patterns.generic++;
      if (anchorData.isBranded) analysis.patterns.branded++;
      if (anchorData.isExactMatch) analysis.patterns.exactMatch++;
      if (anchorData.isPartialMatch) analysis.patterns.partialMatch++;
      if (anchorData.isUrl) analysis.patterns.urls++;
      if (anchorData.isEmpty) analysis.patterns.empty++;
      if (anchorData.isImage) analysis.patterns.images++;

      // Track keyword usage
      if (anchorData.keywords.length > 0) {
        anchorData.keywords.forEach(keyword => {
          analysis.keywords[keyword] = (analysis.keywords[keyword] || 0) + 1;
        });
      }
    });

    // Calculate distribution percentages
    if (analysis.totalLinks > 0) {
      Object.keys(analysis.categories).forEach(category => {
        analysis.distribution[category] = Math.round(
          (analysis.categories[category] / analysis.totalLinks) * 100
        );
      });
    }

    // Identify issues
    analysis.issues = this._identifyAnchorTextIssues(analysis);
    
    return analysis;
  }

  /**
   * Analyze individual anchor element
   * @private
   */
  _analyzeIndividualAnchor(link, pageUrl, index) {
    const href = link.href;
    const anchorText = this._extractAnchorText(link);
    const isInternal = this._isInternalLink(href, pageUrl);
    
    const anchorData = {
      index,
      href,
      anchorText,
      length: anchorText.length,
      isInternal,
      isExternal: !isInternal,
      category: '',
      
      // Pattern flags
      isGeneric: false,
      isBranded: false,
      isExactMatch: false,
      isPartialMatch: false,
      isUrl: false,
      isEmpty: false,
      isImage: false,
      isNavigational: false,
      
      // Additional data
      keywords: [],
      context: this._getLinkContext(link),
      position: this._getLinkPosition(link),
      
      // SEO attributes
      rel: link.rel || '',
      title: link.title || '',
      target: link.target || '',
      
      // Analysis
      seoValue: 0,
      issues: []
    };

    // Categorize anchor text
    anchorData.category = this._categorizeAnchorText(anchorText, anchorData);
    
    // Calculate SEO value
    anchorData.seoValue = this._calculateAnchorSEOValue(anchorData);
    
    // Identify issues
    anchorData.issues = this._identifyAnchorIssues(anchorData);
    
    return anchorData;
  }

  /**
   * Extract anchor text including image alt text
   * @private
   */
  _extractAnchorText(link) {
    // Check for text content first
    let anchorText = link.textContent.trim();
    
    // If no text, check for image alt text
    if (!anchorText) {
      const img = link.querySelector('img');
      if (img) {
        anchorText = img.alt || img.title || '[Image]';
      }
    }
    
    // If still no text, it's empty
    return anchorText || '';
  }

  /**
   * Categorize anchor text type
   * @private
   */
  _categorizeAnchorText(anchorText, anchorData) {
    const text = anchorText.toLowerCase().trim();
    
    // Empty anchor
    if (!text || text.length < ANCHOR_TEXT_CONFIG.THRESHOLDS.MIN_ANCHOR_LENGTH) {
      anchorData.isEmpty = true;
      return ANCHOR_TEXT_CONFIG.CATEGORIES.EMPTY;
    }
    
    // Image anchor
    if (text === '[image]' || anchorData.context.hasImage) {
      anchorData.isImage = true;
      return ANCHOR_TEXT_CONFIG.CATEGORIES.IMAGE;
    }
    
    // URL anchor
    if (ANCHOR_TEXT_CONFIG.URL_PATTERNS.some(pattern => pattern.test(text))) {
      anchorData.isUrl = true;
      return ANCHOR_TEXT_CONFIG.CATEGORIES.URL;
    }
    
    // Generic anchor
    if (ANCHOR_TEXT_CONFIG.GENERIC_PATTERNS.some(pattern => pattern.test(text))) {
      anchorData.isGeneric = true;
      return ANCHOR_TEXT_CONFIG.CATEGORIES.GENERIC;
    }
    
    // Navigational anchor
    if (ANCHOR_TEXT_CONFIG.NAVIGATIONAL_PATTERNS.some(pattern => pattern.test(text))) {
      anchorData.isNavigational = true;
      return ANCHOR_TEXT_CONFIG.CATEGORIES.NAVIGATIONAL;
    }
    
    // Branded anchor
    if (this.config.brandTerms.some(brand => text.includes(brand.toLowerCase()))) {
      anchorData.isBranded = true;
      return ANCHOR_TEXT_CONFIG.CATEGORIES.BRANDED;
    }
    
    // Keyword-based categorization
    const keywords = this._extractKeywords(text);
    anchorData.keywords = keywords;
    
    if (keywords.length > 0) {
      // Check for exact match
      if (this.config.targetKeywords.some(keyword => 
        text.toLowerCase() === keyword.toLowerCase())) {
        anchorData.isExactMatch = true;
        return ANCHOR_TEXT_CONFIG.CATEGORIES.EXACT_MATCH;
      }
      
      // Check for partial match
      if (this.config.targetKeywords.some(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase()))) {
        anchorData.isPartialMatch = true;
        return ANCHOR_TEXT_CONFIG.CATEGORIES.PARTIAL_MATCH;
      }
    }
    
    // Long descriptive text
    if (text.length > 50) {
      return ANCHOR_TEXT_CONFIG.CATEGORIES.LONG_TAIL;
    }
    
    // Default to partial match if it contains meaningful keywords
    return keywords.length > 0 ? 
      ANCHOR_TEXT_CONFIG.CATEGORIES.PARTIAL_MATCH : 
      ANCHOR_TEXT_CONFIG.CATEGORIES.GENERIC;
  }

  /**
   * Get link context information
   * @private
   */
  _getLinkContext(link) {
    const context = {
      parentTag: link.parentElement ? link.parentElement.tagName.toLowerCase() : '',
      hasImage: link.querySelector('img') !== null,
      surroundingText: this._getSurroundingText(link),
      section: this._getLinkSection(link),
      position: this._getLinkPosition(link)
    };
    
    return context;
  }

  /**
   * Get surrounding text context
   * @private
   */
  _getSurroundingText(link, radius = 50) {
    const parent = link.parentElement;
    if (!parent) return '';
    
    const fullText = parent.textContent || '';
    const linkText = link.textContent || '';
    const linkIndex = fullText.indexOf(linkText);
    
    if (linkIndex === -1) return '';
    
    const start = Math.max(0, linkIndex - radius);
    const end = Math.min(fullText.length, linkIndex + linkText.length + radius);
    
    return fullText.substring(start, end).trim();
  }

  /**
   * Determine link section (header, nav, main, footer, etc.)
   * @private
   */
  _getLinkSection(link) {
    let element = link;
    
    while (element && element !== document.body) {
      const tagName = element.tagName.toLowerCase();
      const className = element.className || '';
      const id = element.id || '';
      
      // Check for semantic sections
      if (['header', 'nav', 'main', 'article', 'aside', 'footer'].includes(tagName)) {
        return tagName;
      }
      
      // Check for common class/id patterns
      if (className.includes('header') || id.includes('header')) return 'header';
      if (className.includes('nav') || id.includes('nav')) return 'navigation';
      if (className.includes('main') || id.includes('main')) return 'main';
      if (className.includes('content') || id.includes('content')) return 'content';
      if (className.includes('sidebar') || id.includes('sidebar')) return 'sidebar';
      if (className.includes('footer') || id.includes('footer')) return 'footer';
      
      element = element.parentElement;
    }
    
    return 'content'; // Default
  }

  /**
   * Get link position information
   * @private
   */
  _getLinkPosition(link) {
    const rect = link.getBoundingClientRect ? link.getBoundingClientRect() : { top: 0 };
    
    return {
      isAboveFold: rect.top < 600, // Rough above-fold estimate
      section: this._getLinkSection(link),
      isFirstLink: link === link.ownerDocument.querySelector('a[href]')
    };
  }

  /**
   * Extract meaningful keywords from anchor text
   * @private
   */
  _extractKeywords(text) {
    // Simple keyword extraction - split by spaces and filter
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !this._isStopWord(word));
    
    return [...new Set(words)]; // Remove duplicates
  }

  /**
   * Check if word is a stop word
   * @private
   */
  _isStopWord(word) {
    const stopWords = [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'around', 'this', 'that',
      'these', 'those', 'they', 'them', 'their', 'what', 'which', 'who',
      'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few',
      'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'so',
      'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now'
    ];
    
    return stopWords.includes(word.toLowerCase());
  }

  /**
   * Calculate SEO value of anchor text
   * @private
   */
  _calculateAnchorSEOValue(anchorData) {
    let score = 50; // Base score
    
    // Positive factors
    if (anchorData.isPartialMatch) score += 20;
    if (anchorData.isBranded) score += 15;
    if (anchorData.keywords.length > 0) score += 10;
    if (anchorData.length >= 3 && anchorData.length <= 60) score += 10;
    if (anchorData.context.section === 'main') score += 5;
    
    // Negative factors
    if (anchorData.isGeneric) score -= 30;
    if (anchorData.isEmpty) score -= 40;
    if (anchorData.isUrl) score -= 20;
    if (anchorData.isExactMatch) score -= 10; // Slight penalty for over-optimization
    if (anchorData.length > 100) score -= 15;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Identify anchor-specific issues
   * @private
   */
  _identifyAnchorIssues(anchorData) {
    const issues = [];
    
    if (anchorData.isEmpty) {
      issues.push({
        type: 'empty-anchor',
        severity: 'high',
        message: 'Empty anchor text provides no SEO value'
      });
    }
    
    if (anchorData.isGeneric) {
      issues.push({
        type: 'generic-anchor',
        severity: 'medium',
        message: `Generic anchor text: "${anchorData.anchorText}"`
      });
    }
    
    if (anchorData.isUrl) {
      issues.push({
        type: 'url-anchor',
        severity: 'medium',
        message: 'Raw URL used as anchor text'
      });
    }
    
    if (anchorData.length > 100) {
      issues.push({
        type: 'long-anchor',
        severity: 'low',
        message: `Anchor text too long (${anchorData.length} characters)`
      });
    }
    
    if (anchorData.isExternal && !anchorData.rel.includes('nofollow')) {
      issues.push({
        type: 'external-follow',
        severity: 'low',
        message: 'External link without nofollow'
      });
    }
    
    return issues;
  }

  /**
   * Identify overall anchor text issues
   * @private
   */
  _identifyAnchorTextIssues(analysis) {
    const issues = [];
    const { THRESHOLDS } = ANCHOR_TEXT_CONFIG;
    
    // Too many generic anchors
    if (analysis.distribution.generic > THRESHOLDS.MAX_GENERIC_PERCENTAGE) {
      issues.push({
        type: 'high-generic-percentage',
        severity: 'high',
        message: `${analysis.distribution.generic}% generic anchor text (max recommended: ${THRESHOLDS.MAX_GENERIC_PERCENTAGE}%)`,
        count: analysis.categories.generic
      });
    }
    
    // Too few branded anchors
    if (analysis.distribution.branded < THRESHOLDS.MIN_BRANDED_PERCENTAGE) {
      issues.push({
        type: 'low-branded-percentage',
        severity: 'medium',
        message: `Only ${analysis.distribution.branded}% branded anchor text (min recommended: ${THRESHOLDS.MIN_BRANDED_PERCENTAGE}%)`,
        count: analysis.categories.branded
      });
    }
    
    // Over-optimization warning
    if (analysis.distribution['exact-match'] > THRESHOLDS.MAX_EXACT_MATCH_PERCENTAGE) {
      issues.push({
        type: 'over-optimization',
        severity: 'high',
        message: `${analysis.distribution['exact-match']}% exact match anchors may indicate over-optimization`,
        count: analysis.categories['exact-match']
      });
    }
    
    // Keyword density issues
    Object.entries(analysis.keywords).forEach(([keyword, count]) => {
      if (count > THRESHOLDS.KEYWORD_DENSITY_WARNING) {
        issues.push({
          type: 'keyword-overuse',
          severity: 'medium',
          message: `Keyword "${keyword}" used ${count} times in anchor text`,
          keyword,
          count
        });
      }
    });
    
    // Too many empty anchors
    if (analysis.distribution.empty > 10) {
      issues.push({
        type: 'high-empty-anchors',
        severity: 'high',
        message: `${analysis.distribution.empty}% empty anchor text`,
        count: analysis.categories.empty
      });
    }
    
    return issues;
  }

  /**
   * Analyze link context and surrounding content
   * @private
   */
  _analyzeLinkContext(document) {
    const links = Array.from(document.querySelectorAll('a[href]'));
    
    const contextAnalysis = {
      totalAnalyzed: links.length,
      contexts: [],
      patterns: {
        inNavigation: 0,
        inContent: 0,
        inFooter: 0,
        inSidebar: 0,
        withRelevantContext: 0,
        withIrrelevantContext: 0
      },
      recommendations: []
    };

    links.forEach((link, index) => {
      const context = {
        index,
        href: link.href,
        anchorText: this._extractAnchorText(link),
        section: this._getLinkSection(link),
        surroundingText: this._getSurroundingText(link, 100),
        relevanceScore: 0,
        isContextual: false
      };

      // Calculate context relevance
      context.relevanceScore = this._calculateContextRelevance(link, context);
      context.isContextual = context.relevanceScore > 60;

      // Update pattern counts
      if (context.section === 'navigation') contextAnalysis.patterns.inNavigation++;
      if (context.section === 'main' || context.section === 'content') contextAnalysis.patterns.inContent++;
      if (context.section === 'footer') contextAnalysis.patterns.inFooter++;
      if (context.section === 'sidebar') contextAnalysis.patterns.inSidebar++;
      if (context.isContextual) contextAnalysis.patterns.withRelevantContext++;
      else contextAnalysis.patterns.withIrrelevantContext++;

      contextAnalysis.contexts.push(context);
    });

    return contextAnalysis;
  }

  /**
   * Calculate context relevance score
   * @private
   */
  _calculateContextRelevance(link, context) {
    let score = 50;
    
    const anchorWords = this._extractKeywords(context.anchorText);
    const contextWords = this._extractKeywords(context.surroundingText);
    
    // Check for keyword overlap
    const overlap = anchorWords.filter(word => contextWords.includes(word));
    score += overlap.length * 10;
    
    // Context length bonus
    if (context.surroundingText.length > 50) score += 10;
    
    // Section relevance
    if (context.section === 'main' || context.section === 'content') score += 15;
    if (context.section === 'navigation') score += 5;
    
    // Penalty for generic context
    if (context.surroundingText.length < 20) score -= 20;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze page depth in site hierarchy
   * @private
   */
  _analyzePageDepth(pageUrl, siteData) {
    if (!siteData.pages || !pageUrl) {
      return {
        error: 'Insufficient site data for depth analysis',
        depth: null
      };
    }

    // Calculate depth based on URL structure and internal links
    const urlDepth = this._calculateUrlDepth(pageUrl);
    const linkDepth = this._calculateLinkDepth(pageUrl, siteData);
    
    return {
      urlDepth,
      linkDepth,
      estimatedDepth: Math.min(urlDepth, linkDepth),
      isDeepPage: Math.min(urlDepth, linkDepth) > 3,
      recommendations: this._generateDepthRecommendations(urlDepth, linkDepth)
    };
  }

  /**
   * Calculate URL-based depth
   * @private
   */
  _calculateUrlDepth(url) {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);
      return pathSegments.length;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Calculate link-based depth (BFS from homepage)
   * @private
   */
  _calculateLinkDepth(targetUrl, siteData) {
    // This would require site-wide crawl data to implement properly
    // For now, return URL depth as fallback
    return this._calculateUrlDepth(targetUrl);
  }

  /**
   * Analyze orphan page status
   * @private
   */
  _analyzeOrphanStatus(pageUrl, siteData) {
    if (!siteData.linkGraph) {
      return {
        error: 'No link graph data available',
        isOrphan: null
      };
    }

    // Check if page has incoming internal links
    const incomingLinks = this._findIncomingLinks(pageUrl, siteData);
    
    return {
      isOrphan: incomingLinks.length === 0,
      incomingLinksCount: incomingLinks.length,
      incomingLinks: incomingLinks.slice(0, 10), // First 10 for brevity
      recommendations: incomingLinks.length === 0 ? [
        {
          type: 'orphan-page',
          priority: 'high',
          message: 'Page has no incoming internal links',
          suggestion: 'Add internal links from relevant pages to improve discoverability'
        }
      ] : []
    };
  }

  /**
   * Find incoming links to a page
   * @private
   */
  _findIncomingLinks(targetUrl, siteData) {
    const incomingLinks = [];
    
    // This would scan through site data to find pages linking to targetUrl
    // Implementation depends on siteData structure
    
    return incomingLinks;
  }

  /**
   * Check if link is internal
   * @private
   */
  _isInternalLink(href, pageUrl) {
    try {
      const linkUrl = new URL(href, pageUrl);
      const pageUrlObj = new URL(pageUrl);
      return linkUrl.hostname === pageUrlObj.hostname;
    } catch (e) {
      return false;
    }
  }

  /**
   * Calculate overall link health score
   * @private
   */
  _calculateLinkHealthScore(analysis) {
    let score = 100;
    
    // Anchor text analysis impact
    if (analysis.anchorTextAnalysis) {
      const anchorIssues = analysis.anchorTextAnalysis.issues;
      anchorIssues.forEach(issue => {
        if (issue.severity === 'high') score -= 15;
        if (issue.severity === 'medium') score -= 8;
        if (issue.severity === 'low') score -= 3;
      });
    }
    
    // Context analysis impact
    if (analysis.linkContextAnalysis) {
      const relevantPercentage = (analysis.linkContextAnalysis.patterns.withRelevantContext / 
        analysis.linkContextAnalysis.totalAnalyzed) * 100;
      
      if (relevantPercentage < 50) score -= 20;
      else if (relevantPercentage < 70) score -= 10;
    }
    
    // Depth analysis impact
    if (analysis.depthAnalysis && analysis.depthAnalysis.isDeepPage) {
      score -= 10;
    }
    
    // Orphan status impact
    if (analysis.orphanAnalysis && analysis.orphanAnalysis.isOrphan) {
      score -= 25;
    }
    
    return Math.max(0, Math.round(score));
  }

  /**
   * Generate comprehensive link recommendations
   * @private
   */
  _generateLinkRecommendations(analysis) {
    const recommendations = [];
    
    // Anchor text recommendations
    if (analysis.anchorTextAnalysis) {
      analysis.anchorTextAnalysis.issues.forEach(issue => {
        recommendations.push({
          category: 'anchor-text',
          priority: issue.severity,
          title: this._getIssueTitle(issue.type),
          description: issue.message,
          action: this._getIssueAction(issue.type)
        });
      });
    }
    
    // Context recommendations
    if (analysis.linkContextAnalysis) {
      const irrelevantPercentage = (analysis.linkContextAnalysis.patterns.withIrrelevantContext / 
        analysis.linkContextAnalysis.totalAnalyzed) * 100;
      
      if (irrelevantPercentage > 50) {
        recommendations.push({
          category: 'link-context',
          priority: 'medium',
          title: 'Improve Link Context Relevance',
          description: `${Math.round(irrelevantPercentage)}% of links lack relevant context`,
          action: 'Ensure links are surrounded by relevant, descriptive text'
        });
      }
    }
    
    // Depth recommendations
    if (analysis.depthAnalysis && analysis.depthAnalysis.recommendations) {
      recommendations.push(...analysis.depthAnalysis.recommendations);
    }
    
    // Orphan recommendations
    if (analysis.orphanAnalysis && analysis.orphanAnalysis.recommendations) {
      recommendations.push(...analysis.orphanAnalysis.recommendations);
    }
    
    return recommendations;
  }

  /**
   * Get user-friendly issue titles
   * @private
   */
  _getIssueTitle(issueType) {
    const titles = {
      'high-generic-percentage': 'Reduce Generic Anchor Text',
      'low-branded-percentage': 'Increase Branded Anchor Text',
      'over-optimization': 'Reduce Exact Match Anchors',
      'keyword-overuse': 'Diversify Keyword Usage',
      'high-empty-anchors': 'Fix Empty Anchor Text',
      'empty-anchor': 'Add Anchor Text',
      'generic-anchor': 'Use Descriptive Anchor Text',
      'url-anchor': 'Replace URL with Descriptive Text',
      'long-anchor': 'Shorten Anchor Text',
      'external-follow': 'Consider Adding Nofollow'
    };
    
    return titles[issueType] || 'Fix Link Issue';
  }

  /**
   * Get recommended actions for issues
   * @private
   */
  _getIssueAction(issueType) {
    const actions = {
      'high-generic-percentage': 'Replace generic phrases with descriptive, keyword-rich anchor text',
      'low-branded-percentage': 'Include more branded anchor text to establish brand authority',
      'over-optimization': 'Use varied, natural anchor text to avoid over-optimization penalties',
      'keyword-overuse': 'Use synonyms and related terms instead of repeating the same keyword',
      'high-empty-anchors': 'Add descriptive anchor text to all links for better accessibility and SEO',
      'empty-anchor': 'Add descriptive text that explains where the link leads',
      'generic-anchor': 'Use specific, descriptive text instead of generic phrases',
      'url-anchor': 'Replace raw URLs with meaningful, descriptive anchor text',
      'long-anchor': 'Keep anchor text concise while maintaining descriptiveness',
      'external-follow': 'Add rel="nofollow" to external links to prevent link equity loss'
    };
    
    return actions[issueType] || 'Review and optimize this link';
  }

  /**
   * Generate depth-specific recommendations
   * @private
   */
  _generateDepthRecommendations(urlDepth, linkDepth) {
    const recommendations = [];
    
    if (Math.min(urlDepth, linkDepth) > 3) {
      recommendations.push({
        category: 'site-architecture',
        priority: 'medium',
        title: 'Improve Page Accessibility',
        description: `Page is ${Math.min(urlDepth, linkDepth)} levels deep`,
        action: 'Add internal links from higher-level pages or simplify URL structure'
      });
    }
    
    if (urlDepth !== linkDepth && Math.abs(urlDepth - linkDepth) > 2) {
      recommendations.push({
        category: 'site-architecture',
        priority: 'low',
        title: 'Align URL Structure with Link Structure',
        description: 'URL depth and link depth differ significantly',
        action: 'Consider restructuring URLs to match the logical site hierarchy'
      });
    }
    
    return recommendations;
  }

  // ============================================================================
  // BaseAnalyzer Integration Helper Methods
  // ============================================================================

  /**
   * Calculate comprehensive advanced link score
   * @param {Object} linkData - Complete advanced link analysis data
   * @returns {number} Score (0-100)
   */
  _calculateComprehensiveScore(linkData) {
    const weights = {
      anchorText: 0.3,
      linkContext: 0.25,
      internalLinks: 0.2,
      externalLinks: 0.15,
      siteArchitecture: 0.1
    };
    
    // Anchor text score
    let anchorScore = 100;
    if (linkData.anchorTextAnalysis?.issues) {
      linkData.anchorTextAnalysis.issues.forEach(issue => {
        if (issue.severity === 'high') anchorScore -= 15;
        else if (issue.severity === 'medium') anchorScore -= 8;
        else if (issue.severity === 'low') anchorScore -= 3;
      });
    }
    anchorScore = Math.max(0, anchorScore);
    
    // Link context score
    let contextScore = 100;
    if (linkData.linkContext?.contextIssues) {
      contextScore = Math.max(0, 100 - (linkData.linkContext.contextIssues.length * 10));
    }
    
    // Internal links score
    let internalScore = 100;
    if (linkData.internalLinks) {
      const internalIssues = linkData.internalLinks.issues || [];
      internalScore = Math.max(0, 100 - (internalIssues.length * 12));
    }
    
    // External links score
    let externalScore = 100;
    if (linkData.externalLinks) {
      const externalIssues = linkData.externalLinks.issues || [];
      externalScore = Math.max(0, 100 - (externalIssues.length * 10));
    }
    
    // Site architecture score
    let architectureScore = 100;
    if (linkData.depthAnalysis?.depth > 3) {
      architectureScore -= (linkData.depthAnalysis.depth - 3) * 15;
    }
    architectureScore = Math.max(0, architectureScore);
    
    const totalScore = Math.round(
      (anchorScore * weights.anchorText) +
      (contextScore * weights.linkContext) +
      (internalScore * weights.internalLinks) +
      (externalScore * weights.externalLinks) +
      (architectureScore * weights.siteArchitecture)
    );
    
    return Math.min(100, Math.max(0, totalScore));
  }

  /**
   * Generate comprehensive advanced link recommendations
   * @param {Object} linkData - Complete advanced link analysis data
   * @returns {Array} Array of recommendation objects
   */
  _generateAdvancedLinkRecommendations(linkData) {
    const recommendations = [];
    
    // Anchor text recommendations
    if (linkData.anchorTextAnalysis?.issues) {
      linkData.anchorTextAnalysis.issues.forEach(issue => {
        let category = 'optimization';
        let impact = 'medium';
        
        if (issue.severity === 'high') {
          category = 'critical';
          impact = 'high';
        } else if (issue.severity === 'low') {
          impact = 'low';
        }
        
        recommendations.push({
          category,
          title: `Fix Anchor Text Issue: ${issue.type}`,
          description: issue.description || 'Optimize anchor text for better SEO performance',
          impact,
          implementation: 'Review and improve anchor text patterns for natural link distribution'
        });
      });
    }
    
    // Link context recommendations
    if (linkData.linkContext?.contextIssues?.length > 0) {
      recommendations.push({
        category: 'optimization',
        title: 'Improve Link Context',
        description: `Found ${linkData.linkContext.contextIssues.length} context issues affecting link quality`,
        impact: 'medium',
        implementation: 'Add descriptive context around links to improve user experience and SEO'
      });
    }
    
    // Internal linking recommendations
    if (linkData.internalLinks?.issues?.length > 0) {
      recommendations.push({
        category: 'optimization',
        title: 'Optimize Internal Linking',
        description: `Found ${linkData.internalLinks.issues.length} internal linking issues`,
        impact: 'high',
        implementation: 'Improve internal link structure and distribution for better site navigation'
      });
    }
    
    // External link recommendations
    if (linkData.externalLinks?.issues?.length > 0) {
      recommendations.push({
        category: 'optimization',
        title: 'Review External Links',
        description: `Found ${linkData.externalLinks.issues.length} external link issues`,
        impact: 'medium',
        implementation: 'Review external links for quality, relevance, and proper attributes'
      });
    }
    
    // Site architecture recommendations
    if (linkData.depthAnalysis?.depth > 3) {
      recommendations.push({
        category: 'enhancement',
        title: 'Improve Site Architecture',
        description: `Page is ${linkData.depthAnalysis.depth} levels deep, affecting accessibility`,
        impact: 'medium',
        implementation: 'Add internal links from higher-level pages or simplify URL structure'
      });
    }
    
    // Orphan page recommendations
    if (linkData.orphanDetection?.isOrphan) {
      recommendations.push({
        category: 'critical',
        title: 'Fix Orphan Page',
        description: 'Page has no incoming internal links, making it hard to discover',
        impact: 'high',
        implementation: 'Add internal links pointing to this page from relevant content'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate advanced link analysis summary
   * @param {Object} linkData - Complete advanced link analysis data
   * @param {number} score - Overall score
   * @returns {string} Analysis summary
   */
  _generateAdvancedLinkSummary(linkData, score) {
    const totalLinks = (linkData.internalLinks?.links?.length || 0) + (linkData.externalLinks?.links?.length || 0);
    const totalIssues = (linkData.anchorTextAnalysis?.issues?.length || 0) + 
                       (linkData.linkContext?.contextIssues?.length || 0) +
                       (linkData.internalLinks?.issues?.length || 0) +
                       (linkData.externalLinks?.issues?.length || 0);
    
    if (totalIssues > 5) {
      return `Advanced link analysis found ${totalIssues} issues across ${totalLinks} links that need immediate attention.`;
    }
    
    if (linkData.orphanDetection?.isOrphan) {
      return `Page is an orphan with no incoming internal links, significantly affecting discoverability and SEO.`;
    }
    
    if (score >= 90) {
      return `Excellent link optimization with ${totalLinks} links and minimal issues. Strong internal linking structure.`;
    } else if (score >= 70) {
      return `Good link structure with ${totalLinks} links but ${totalIssues} areas for improvement in anchor text and context.`;
    } else if (score >= 50) {
      return `Basic link setup with ${totalLinks} links. Focus on anchor text optimization and internal linking improvements.`;
    } else {
      return `Poor link optimization with ${totalIssues} critical issues. Comprehensive link strategy overhaul needed.`;
    }
  }

  /**
   * Calculate advanced link completeness percentage
   * @param {Object} linkData - Advanced link analysis data
   * @returns {Object} Completeness analysis
   */
  _calculateAdvancedLinkCompleteness(linkData) {
    const factors = [
      { name: 'Anchor Text Quality', weight: 25, present: linkData.anchorTextAnalysis?.issues?.length === 0 },
      { name: 'Link Context', weight: 20, present: linkData.linkContext?.contextIssues?.length === 0 },
      { name: 'Internal Links', weight: 20, present: (linkData.internalLinks?.links?.length || 0) > 0 },
      { name: 'External Links', weight: 15, present: (linkData.externalLinks?.links?.length || 0) > 0 },
      { name: 'Site Architecture', weight: 10, present: (linkData.depthAnalysis?.depth || 4) <= 3 },
      { name: 'No Orphan Status', weight: 10, present: !linkData.orphanDetection?.isOrphan }
    ];
    
    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
    const achievedWeight = factors.reduce((sum, factor) => sum + (factor.present ? factor.weight : 0), 0);
    
    return {
      percentage: Math.round((achievedWeight / totalWeight) * 100),
      factors: factors,
      achieved: achievedWeight,
      total: totalWeight
    };
  }

  /**
   * Legacy advanced link recommendations method for backward compatibility
   * @param {Object} analysis - Link analysis data
   * @returns {Array} Array of recommendation objects
   */
  _generateAdvancedLinkRecommendationsLegacy(analysis) {
    const recommendations = [];

    // Convert new format to legacy format
    if (analysis.anchorTextAnalysis?.issues) {
      analysis.anchorTextAnalysis.issues.forEach(issue => {
        recommendations.push({
          type: 'anchor-text',
          priority: issue.severity || 'medium',
          title: `Anchor Text Issue: ${issue.type}`,
          description: issue.description,
          impact: 'seo-performance',
        });
      });
    }

    if (analysis.linkContext?.contextIssues?.length > 0) {
      recommendations.push({
        type: 'context',
        priority: 'medium',
        title: 'Improve Link Context',
        description: 'Add descriptive context around links',
        impact: 'user-experience',
      });
    }

    if (analysis.internalLinks?.issues?.length > 0) {
      recommendations.push({
        type: 'internal-links',
        priority: 'high',
        title: 'Optimize Internal Linking',
        description: 'Improve internal link structure and distribution',
        impact: 'site-architecture',
      });
    }

    return recommendations;
  }

  /**
   * Calculate grade from score (fallback method)
   * @param {number} score - Score (0-100)
   * @returns {string} Grade letter
   */
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
    if (score >= 60) return 'D';
    return 'F';
  }
}
