/**
 * Advanced Link Analysis - Modern BaseAnalyzer Implementation
 * Comprehensive link analysis including anchor text patterns, context, depth, and orphan detection
 * 
 * @fileoverview Modern implementation of advanced link analysis extending BaseAnalyzer
 * @version 2.0.0
 * @author Nimrod Galor
 * @since 2025-01-18
 */

import { BaseAnalyzer } from '../core/BaseAnalyzer.js';
import { AnalyzerInterface } from '../core/AnalyzerInterface.js';
import { LinkDepthCalculator } from './LinkDepthAnalyzer.js';
import { OrphanedPagesDetector } from './OrphanedPagesAnalyzer.js';

/**
 * Anchor text analysis configuration and patterns
 */
export const ADVANCED_LINK_CONFIG = {
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
 * Advanced Link Analyzer - Modern BaseAnalyzer Implementation
 * 
 * Provides comprehensive link analysis including:
 * - Anchor text patterns and distribution
 * - Link context analysis
 * - Page depth analysis
 * - Orphaned pages detection
 * - SEO optimization recommendations
 */
export class ModernAdvancedLinkAnalyzer extends BaseAnalyzer {
  /**
   * Initialize the Advanced Link Analyzer
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    super('ModernAdvancedLinkAnalyzer', {
      version: '2.0.0',
      category: 'links',
      description: 'Comprehensive advanced link analysis including anchor text, context, depth, and orphan detection'
    });

    // Set these directly for easier access
    this.version = '2.0.0';
    this.category = 'links';

    this.linkConfig = {
      enableAnchorTextAnalysis: options.enableAnchorTextAnalysis !== false,
      enableLinkContext: options.enableLinkContext !== false,
      enableDepthAnalysis: options.enableDepthAnalysis !== false,
      enableOrphanDetection: options.enableOrphanDetection !== false,
      siteUrl: options.siteUrl || '',
      brandTerms: options.brandTerms || [],
      targetKeywords: options.targetKeywords || [],
      ...options
    };

    // Initialize sub-analyzers
    this.depthCalculator = null;
    this.orphanDetector = null;
  }

  /**
   * Comprehensive advanced link analysis
   * @param {Object} dom - JSDOM document object
   * @param {Object} context - Analysis context including URL and siteData
   * @returns {Object} Complete advanced link analysis results
   */
  async analyze(dom, context = {}) {
    try {
      const { url: pageUrl = '', siteData = {} } = context;
      const document = dom.window?.document || dom;

      this.log('info', 'Starting advanced link analysis', { url: pageUrl });

      const startTime = Date.now();

      // Initialize sub-analyzers if needed
      if (this.linkConfig.enableDepthAnalysis && siteData.pages) {
        this.depthCalculator = new LinkDepthCalculator(siteData);
      }
      if (this.linkConfig.enableOrphanDetection && siteData.pages) {
        this.orphanDetector = new OrphanedPagesDetector(siteData);
      }

      const analysis = {
        // Core analysis components
        anchorTextAnalysis: this.linkConfig.enableAnchorTextAnalysis ? 
          this._analyzeAnchorText(document, pageUrl) : null,
        
        linkContextAnalysis: this.linkConfig.enableLinkContext ? 
          this._analyzeLinkContext(document) : null,
        
        depthAnalysis: this.linkConfig.enableDepthAnalysis && this.depthCalculator ? 
          this._analyzePageDepth(pageUrl) : null,
        
        orphanAnalysis: this.linkConfig.enableOrphanDetection && this.orphanDetector ? 
          this._analyzeOrphanStatus(pageUrl) : null,
        
        // Overall metrics
        linkHealthScore: 0,
        optimizationScore: 0,
        
        // Issues and recommendations
        issues: [],
        recommendations: [],
        
        // Performance metrics
        analysisTime: 0
      };

      // Calculate scores
      analysis.linkHealthScore = this._calculateLinkHealthScore(analysis);
      analysis.optimizationScore = this._calculateOptimizationScore(analysis);

      // Consolidate issues and recommendations
      analysis.issues = this._consolidateIssues(analysis);
      analysis.recommendations = this._generateLinkRecommendations(analysis);

      analysis.analysisTime = Date.now() - startTime;

      this.log('info', 'Advanced link analysis completed', {
        url: pageUrl,
        linkHealthScore: analysis.linkHealthScore,
        optimizationScore: analysis.optimizationScore,
        analysisTime: analysis.analysisTime
      });

      return analysis;

    } catch (error) {
      this.log('error', 'Advanced link analysis failed', error);
      return this.handleError(error, 'Advanced link analysis failed');
    }
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata and capabilities
   */
  getMetadata() {
    return {
      name: this.name,
      version: '2.0.0',
      category: 'links',
      description: 'Comprehensive advanced link analysis including anchor text, context, depth, and orphan detection',
      capabilities: [
        'anchor-text-analysis',
        'link-context-analysis', 
        'depth-analysis',
        'orphan-detection',
        'seo-optimization',
        'link-health-scoring'
      ],
      requiredData: [
        'dom',
        'pageUrl'
      ],
      optionalData: [
        'siteData',
        'brandTerms',
        'targetKeywords'
      ],
      outputFields: [
        'anchorTextAnalysis',
        'linkContextAnalysis',
        'depthAnalysis',
        'orphanAnalysis',
        'linkHealthScore',
        'optimizationScore',
        'issues',
        'recommendations'
      ],
      configurable: [
        'enableAnchorTextAnalysis',
        'enableLinkContext',
        'enableDepthAnalysis',
        'enableOrphanDetection',
        'brandTerms',
        'targetKeywords'
      ]
    };
  }

  /**
   * Validate input data for analysis
   * @param {Object} dom - JSDOM document object
   * @param {Object} context - Analysis context
   * @returns {Object} Validation result
   */
  validate(dom, context = {}) {
    // First validate the base analyzer
    try {
      super.validate();
    } catch (error) {
      return {
        isValid: false,
        errors: [error.message],
        warnings: []
      };
    }

    // Advanced link analyzer specific validation
    const document = dom.window?.document || dom;
    
    if (!document || typeof document.querySelectorAll !== 'function') {
      return {
        isValid: false,
        errors: ['Invalid DOM object - missing querySelectorAll method'],
        warnings: []
      };
    }

    const warnings = [];
    
    // Check for context data availability
    if (this.linkConfig.enableDepthAnalysis && !context.siteData?.pages) {
      warnings.push('Depth analysis enabled but no site data provided - depth analysis will be skipped');
    }
    
    if (this.linkConfig.enableOrphanDetection && !context.siteData?.pages) {
      warnings.push('Orphan detection enabled but no site data provided - orphan detection will be skipped');
    }

    if (!context.url) {
      warnings.push('No page URL provided - some link analysis features may be limited');
    }

    return {
      isValid: true,
      errors: [],
      warnings
    };
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
    Object.values(ADVANCED_LINK_CONFIG.CATEGORIES).forEach(category => {
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
      if (anchorData.patterns.includes('generic')) analysis.patterns.generic++;
      if (anchorData.patterns.includes('branded')) analysis.patterns.branded++;
      if (anchorData.patterns.includes('exact-match')) analysis.patterns.exactMatch++;
      if (anchorData.patterns.includes('partial-match')) analysis.patterns.partialMatch++;
      if (anchorData.patterns.includes('url')) analysis.patterns.urls++;
      if (anchorData.patterns.includes('empty')) analysis.patterns.empty++;
      if (anchorData.patterns.includes('image')) analysis.patterns.images++;

      // Track keyword usage
      anchorData.keywords.forEach(keyword => {
        analysis.keywords[keyword] = (analysis.keywords[keyword] || 0) + 1;
      });
    });

    // Calculate distributions
    this._calculateAnchorDistributions(analysis);

    // Identify anchor text issues
    this._identifyAnchorTextIssues(analysis);

    return analysis;
  }

  /**
   * Analyze individual anchor element
   * @private
   */
  _analyzeIndividualAnchor(link, pageUrl, index) {
    const href = link.getAttribute('href') || '';
    const anchorText = this._extractAnchorText(link);
    
    const anchorData = {
      index,
      href,
      anchorText,
      length: anchorText.length,
      isInternal: this._isInternalLink(href, pageUrl),
      category: this._categorizeAnchorText(anchorText),
      patterns: this._identifyAnchorPatterns(anchorText),
      keywords: this._extractKeywords(anchorText),
      context: this._getLinkContext(link),
      position: this._getLinkPosition(link),
      attributes: this._getLinkAttributes(link)
    };

    return anchorData;
  }

  /**
   * Extract anchor text including image alt text
   * @private
   */
  _extractAnchorText(link) {
    // Get direct text content
    let text = link.textContent?.trim() || '';
    
    // If no text, check for image alt text
    if (!text) {
      const img = link.querySelector('img');
      if (img) {
        text = img.getAttribute('alt') || img.getAttribute('title') || '';
      }
    }
    
    // If still no text, check aria-label
    if (!text) {
      text = link.getAttribute('aria-label') || link.getAttribute('title') || '';
    }
    
    return text.trim();
  }

  /**
   * Categorize anchor text type
   * @private
   */
  _categorizeAnchorText(anchorText) {
    if (!anchorText || anchorText.length === 0) {
      return ADVANCED_LINK_CONFIG.CATEGORIES.EMPTY;
    }

    // Check for generic patterns
    if (ADVANCED_LINK_CONFIG.GENERIC_PATTERNS.some(pattern => pattern.test(anchorText))) {
      return ADVANCED_LINK_CONFIG.CATEGORIES.GENERIC;
    }

    // Check for URL patterns
    if (ADVANCED_LINK_CONFIG.URL_PATTERNS.some(pattern => pattern.test(anchorText))) {
      return ADVANCED_LINK_CONFIG.CATEGORIES.URL;
    }

    // Check for navigational patterns
    if (ADVANCED_LINK_CONFIG.NAVIGATIONAL_PATTERNS.some(pattern => pattern.test(anchorText))) {
      return ADVANCED_LINK_CONFIG.CATEGORIES.NAVIGATIONAL;
    }

    // Check for branded terms
    if (this.linkConfig.brandTerms.some(brand => 
      anchorText.toLowerCase().includes(brand.toLowerCase()))) {
      return ADVANCED_LINK_CONFIG.CATEGORIES.BRANDED;
    }

    // Check for exact keyword match
    if (this.linkConfig.targetKeywords.some(keyword => 
      anchorText.toLowerCase() === keyword.toLowerCase())) {
      return ADVANCED_LINK_CONFIG.CATEGORIES.EXACT_MATCH;
    }

    // Check for partial keyword match
    if (this.linkConfig.targetKeywords.some(keyword => 
      anchorText.toLowerCase().includes(keyword.toLowerCase()))) {
      return ADVANCED_LINK_CONFIG.CATEGORIES.PARTIAL_MATCH;
    }

    // Long descriptive text
    if (anchorText.length > 50) {
      return ADVANCED_LINK_CONFIG.CATEGORIES.LONG_TAIL;
    }

    // Default to partial match for meaningful text
    return ADVANCED_LINK_CONFIG.CATEGORIES.PARTIAL_MATCH;
  }

  /**
   * Identify anchor text patterns
   * @private
   */
  _identifyAnchorPatterns(anchorText) {
    const patterns = [];

    if (!anchorText || anchorText.length === 0) {
      patterns.push('empty');
      return patterns;
    }

    // Generic patterns
    if (ADVANCED_LINK_CONFIG.GENERIC_PATTERNS.some(pattern => pattern.test(anchorText))) {
      patterns.push('generic');
    }

    // URL patterns
    if (ADVANCED_LINK_CONFIG.URL_PATTERNS.some(pattern => pattern.test(anchorText))) {
      patterns.push('url');
    }

    // Brand patterns
    if (this.linkConfig.brandTerms.some(brand => 
      anchorText.toLowerCase().includes(brand.toLowerCase()))) {
      patterns.push('branded');
    }

    // Keyword patterns
    if (this.linkConfig.targetKeywords.some(keyword => 
      anchorText.toLowerCase() === keyword.toLowerCase())) {
      patterns.push('exact-match');
    } else if (this.linkConfig.targetKeywords.some(keyword => 
      anchorText.toLowerCase().includes(keyword.toLowerCase()))) {
      patterns.push('partial-match');
    }

    // Length patterns
    if (anchorText.length < ADVANCED_LINK_CONFIG.THRESHOLDS.MIN_ANCHOR_LENGTH) {
      patterns.push('too-short');
    } else if (anchorText.length > ADVANCED_LINK_CONFIG.THRESHOLDS.MAX_ANCHOR_LENGTH) {
      patterns.push('too-long');
    }

    return patterns;
  }

  /**
   * Extract keywords from anchor text
   * @private
   */
  _extractKeywords(anchorText) {
    if (!anchorText) return [];

    // Basic keyword extraction - split by common separators
    const words = anchorText.toLowerCase()
      .split(/[\s\-_|,.;:!?()]+/)
      .filter(word => word.length > 2)
      .filter(word => !this._isStopWord(word));

    return [...new Set(words)]; // Remove duplicates
  }

  /**
   * Check if word is a stop word
   * @private
   */
  _isStopWord(word) {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'];
    return stopWords.includes(word.toLowerCase());
  }

  /**
   * Get link context (surrounding text)
   * @private
   */
  _getLinkContext(link) {
    const parent = link.parentElement;
    if (!parent) return '';

    const parentText = parent.textContent || '';
    const linkText = link.textContent || '';
    
    // Extract context around the link
    const linkIndex = parentText.indexOf(linkText);
    if (linkIndex === -1) return parentText.slice(0, 100);

    const beforeContext = parentText.slice(Math.max(0, linkIndex - 50), linkIndex);
    const afterContext = parentText.slice(linkIndex + linkText.length, linkIndex + linkText.length + 50);

    return (beforeContext + ' ' + afterContext).trim();
  }

  /**
   * Get link position information
   * @private
   */
  _getLinkPosition(link) {
    const rect = link.getBoundingClientRect?.() || {};
    return {
      inNavigation: this._isInNavigation(link),
      inContent: this._isInContent(link),
      inFooter: this._isInFooter(link),
      inSidebar: this._isInSidebar(link),
      coordinates: {
        top: rect.top || 0,
        left: rect.left || 0,
        width: rect.width || 0,
        height: rect.height || 0
      }
    };
  }

  /**
   * Get link attributes
   * @private
   */
  _getLinkAttributes(link) {
    return {
      target: link.getAttribute('target'),
      rel: link.getAttribute('rel'),
      title: link.getAttribute('title'),
      'aria-label': link.getAttribute('aria-label'),
      class: link.getAttribute('class'),
      id: link.getAttribute('id')
    };
  }

  /**
   * Check if link is in navigation
   * @private
   */
  _isInNavigation(link) {
    const navSelectors = ['nav', '[role="navigation"]', '.navigation', '.nav', '.menu', '.navbar'];
    return navSelectors.some(selector => link.closest(selector));
  }

  /**
   * Check if link is in content area
   * @private
   */
  _isInContent(link) {
    const contentSelectors = ['main', '[role="main"]', '.content', '.post', '.article', 'article'];
    return contentSelectors.some(selector => link.closest(selector));
  }

  /**
   * Check if link is in footer
   * @private
   */
  _isInFooter(link) {
    const footerSelectors = ['footer', '[role="contentinfo"]', '.footer'];
    return footerSelectors.some(selector => link.closest(selector));
  }

  /**
   * Check if link is in sidebar
   * @private
   */
  _isInSidebar(link) {
    const sidebarSelectors = ['.sidebar', '.aside', 'aside', '[role="complementary"]'];
    return sidebarSelectors.some(selector => link.closest(selector));
  }

  /**
   * Calculate anchor text distributions
   * @private
   */
  _calculateAnchorDistributions(analysis) {
    const total = analysis.totalLinks;
    
    if (total === 0) {
      analysis.distribution = {};
      return;
    }

    // Calculate category percentages
    Object.keys(analysis.categories).forEach(category => {
      analysis.distribution[category] = {
        count: analysis.categories[category],
        percentage: Math.round((analysis.categories[category] / total) * 100)
      };
    });

    // Calculate pattern percentages
    analysis.distribution.patterns = {};
    Object.keys(analysis.patterns).forEach(pattern => {
      analysis.distribution.patterns[pattern] = {
        count: analysis.patterns[pattern],
        percentage: Math.round((analysis.patterns[pattern] / total) * 100)
      };
    });
  }

  /**
   * Identify anchor text issues
   * @private
   */
  _identifyAnchorTextIssues(analysis) {
    const issues = [];

    // Too many generic anchors
    const genericPercentage = analysis.distribution.patterns?.generic?.percentage || 0;
    if (genericPercentage > ADVANCED_LINK_CONFIG.THRESHOLDS.MAX_GENERIC_PERCENTAGE) {
      issues.push({
        type: 'excessive-generic-anchors',
        severity: 'medium',
        message: `${genericPercentage}% of anchors use generic text (max recommended: ${ADVANCED_LINK_CONFIG.THRESHOLDS.MAX_GENERIC_PERCENTAGE}%)`,
        impact: 'Reduces SEO value and user experience'
      });
    }

    // Too few branded anchors
    const brandedPercentage = analysis.distribution.patterns?.branded?.percentage || 0;
    if (brandedPercentage < ADVANCED_LINK_CONFIG.THRESHOLDS.MIN_BRANDED_PERCENTAGE) {
      issues.push({
        type: 'insufficient-branded-anchors',
        severity: 'low',
        message: `Only ${brandedPercentage}% of anchors include brand terms (min recommended: ${ADVANCED_LINK_CONFIG.THRESHOLDS.MIN_BRANDED_PERCENTAGE}%)`,
        impact: 'Missing brand reinforcement opportunities'
      });
    }

    // Over-optimization (too many exact matches)
    const exactMatchPercentage = analysis.distribution.patterns?.exactMatch?.percentage || 0;
    if (exactMatchPercentage > ADVANCED_LINK_CONFIG.THRESHOLDS.MAX_EXACT_MATCH_PERCENTAGE) {
      issues.push({
        type: 'anchor-over-optimization',
        severity: 'high',
        message: `${exactMatchPercentage}% of anchors are exact keyword matches (max recommended: ${ADVANCED_LINK_CONFIG.THRESHOLDS.MAX_EXACT_MATCH_PERCENTAGE}%)`,
        impact: 'Risk of search engine penalties for over-optimization'
      });
    }

    // Empty or very short anchors
    const emptyPercentage = analysis.distribution[ADVANCED_LINK_CONFIG.CATEGORIES.EMPTY]?.percentage || 0;
    if (emptyPercentage > 5) {
      issues.push({
        type: 'empty-anchor-text',
        severity: 'medium',
        message: `${emptyPercentage}% of links have no anchor text`,
        impact: 'Poor accessibility and reduced SEO value'
      });
    }

    // Keyword density warnings
    Object.entries(analysis.keywords).forEach(([keyword, count]) => {
      if (count > ADVANCED_LINK_CONFIG.THRESHOLDS.KEYWORD_DENSITY_WARNING) {
        issues.push({
          type: 'keyword-density-warning',
          severity: 'low',
          message: `Keyword "${keyword}" appears ${count} times in anchor text`,
          impact: 'Potential over-optimization signal'
        });
      }
    });

    analysis.issues = issues;
  }

  /**
   * Analyze link context and surrounding content
   * @private
   */
  _analyzeLinkContext(document) {
    const links = Array.from(document.querySelectorAll('a[href]'));
    
    const analysis = {
      totalLinks: links.length,
      contextAnalysis: [],
      averageContextRelevance: 0,
      contextsWithLowRelevance: 0,
      issues: [],
      recommendations: []
    };

    let totalRelevance = 0;

    links.forEach((link, index) => {
      const context = this._getLinkContext(link);
      const anchorText = this._extractAnchorText(link);
      const relevance = this._calculateContextRelevance(link, context);

      const linkContextData = {
        index,
        anchorText,
        context,
        relevance,
        position: this._getLinkPosition(link),
        isRelevant: relevance > 0.6
      };

      analysis.contextAnalysis.push(linkContextData);
      totalRelevance += relevance;

      if (!linkContextData.isRelevant) {
        analysis.contextsWithLowRelevance++;
      }
    });

    // Calculate averages
    if (links.length > 0) {
      analysis.averageContextRelevance = totalRelevance / links.length;
    }

    // Identify context issues
    this._identifyContextIssues(analysis);

    return analysis;
  }

  /**
   * Calculate context relevance score
   * @private
   */
  _calculateContextRelevance(link, context) {
    const anchorText = this._extractAnchorText(link);
    
    if (!context || !anchorText) return 0;

    // Simple relevance calculation based on word overlap
    const anchorWords = new Set(anchorText.toLowerCase().split(/\s+/));
    const contextWords = new Set(context.toLowerCase().split(/\s+/));
    
    const overlap = [...anchorWords].filter(word => contextWords.has(word)).length;
    const maxWords = Math.max(anchorWords.size, contextWords.size);
    
    return maxWords > 0 ? overlap / maxWords : 0;
  }

  /**
   * Identify context-related issues
   * @private
   */
  _identifyContextIssues(analysis) {
    const issues = [];

    // Low average context relevance
    if (analysis.averageContextRelevance < 0.4) {
      issues.push({
        type: 'low-context-relevance',
        severity: 'medium',
        message: `Average context relevance is ${(analysis.averageContextRelevance * 100).toFixed(1)}%`,
        impact: 'Links may not provide clear context to users and search engines'
      });
    }

    // Many links with poor context
    const lowRelevancePercentage = Math.round((analysis.contextsWithLowRelevance / analysis.totalLinks) * 100);
    if (lowRelevancePercentage > 30) {
      issues.push({
        type: 'many-poor-contexts',
        severity: 'medium',
        message: `${lowRelevancePercentage}% of links have poor context relevance`,
        impact: 'Reduced user experience and SEO value'
      });
    }

    analysis.issues = issues;
  }

  /**
   * Analyze page depth in site hierarchy
   * @private
   */
  _analyzePageDepth(pageUrl) {
    if (!this.depthCalculator || !pageUrl) {
      return {
        error: 'Depth analysis not available - missing calculator or URL',
        depth: null
      };
    }

    try {
      return this.depthCalculator.analyzePageDepth(pageUrl);
    } catch (error) {
      this.log('error', 'Depth analysis failed', error);
      return {
        error: `Depth analysis failed: ${error.message}`,
        depth: null
      };
    }
  }

  /**
   * Analyze orphan page status
   * @private
   */
  _analyzeOrphanStatus(pageUrl) {
    if (!this.orphanDetector || !pageUrl) {
      return {
        error: 'Orphan analysis not available - missing detector or URL',
        isOrphan: null
      };
    }

    try {
      return this.orphanDetector.analyzePageConnectivity(pageUrl);
    } catch (error) {
      this.log('error', 'Orphan analysis failed', error);
      return {
        error: `Orphan analysis failed: ${error.message}`,
        isOrphan: null
      };
    }
  }

  /**
   * Check if link is internal
   * @private
   */
  _isInternalLink(href, pageUrl) {
    if (!href || !pageUrl) return false;

    try {
      // Handle relative URLs
      if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
        return true;
      }

      // Handle hash/fragment links
      if (href.startsWith('#')) {
        return true;
      }

      // Handle absolute URLs
      const linkUrl = new URL(href, pageUrl);
      const pageUrlObj = new URL(pageUrl);
      
      return linkUrl.hostname === pageUrlObj.hostname;
    } catch (error) {
      // If URL parsing fails, assume external
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
      const genericPercentage = analysis.anchorTextAnalysis.distribution.patterns?.generic?.percentage || 0;
      const emptyPercentage = analysis.anchorTextAnalysis.distribution[ADVANCED_LINK_CONFIG.CATEGORIES.EMPTY]?.percentage || 0;
      const exactMatchPercentage = analysis.anchorTextAnalysis.distribution.patterns?.exactMatch?.percentage || 0;

      if (genericPercentage > 30) score -= 20;
      else if (genericPercentage > 20) score -= 10;

      if (emptyPercentage > 10) score -= 15;
      else if (emptyPercentage > 5) score -= 8;

      if (exactMatchPercentage > 20) score -= 25;
      else if (exactMatchPercentage > 15) score -= 15;
    }

    // Context analysis impact
    if (analysis.linkContextAnalysis) {
      const relevance = analysis.linkContextAnalysis.averageContextRelevance;
      if (relevance < 0.3) score -= 15;
      else if (relevance < 0.5) score -= 10;

      const irrelevantPercentage = Math.round((analysis.linkContextAnalysis.contextsWithLowRelevance / analysis.linkContextAnalysis.totalLinks) * 100);
      if (irrelevantPercentage > 50) score -= 15;
      else if (irrelevantPercentage > 30) score -= 10;
    }

    // Depth analysis impact
    if (analysis.depthAnalysis && analysis.depthAnalysis.estimatedDepth > 3) {
      score -= 10;
    }

    // Orphan status impact
    if (analysis.orphanAnalysis && analysis.orphanAnalysis.isOrphan) {
      score -= 25;
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * Calculate optimization score
   * @private
   */
  _calculateOptimizationScore(analysis) {
    let score = 0;

    // Anchor text optimization
    if (analysis.anchorTextAnalysis) {
      const branded = analysis.anchorTextAnalysis.distribution.patterns?.branded?.percentage || 0;
      const partial = analysis.anchorTextAnalysis.distribution.patterns?.partialMatch?.percentage || 0;
      const generic = analysis.anchorTextAnalysis.distribution.patterns?.generic?.percentage || 0;

      score += Math.min(branded * 2, 20); // Max 20 points for branding
      score += Math.min(partial * 1.5, 30); // Max 30 points for partial matches
      score -= Math.max(0, (generic - 10) * 2); // Penalty for excessive generic
    }

    // Context optimization
    if (analysis.linkContextAnalysis) {
      const relevance = analysis.linkContextAnalysis.averageContextRelevance;
      score += relevance * 30; // Max 30 points for context relevance
    }

    // Depth optimization
    if (analysis.depthAnalysis) {
      const depth = analysis.depthAnalysis.estimatedDepth || 0;
      if (depth <= 2) score += 10;
      else if (depth <= 3) score += 5;
    }

    // Internal linking bonus
    if (analysis.anchorTextAnalysis) {
      const internalRatio = analysis.anchorTextAnalysis.internalLinks / analysis.anchorTextAnalysis.totalLinks;
      if (internalRatio > 0.7) score += 10;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Consolidate issues from all analysis components
   * @private
   */
  _consolidateIssues(analysis) {
    const issues = [];

    // Collect anchor text issues
    if (analysis.anchorTextAnalysis?.issues) {
      issues.push(...analysis.anchorTextAnalysis.issues);
    }

    // Collect context issues
    if (analysis.linkContextAnalysis?.issues) {
      issues.push(...analysis.linkContextAnalysis.issues);
    }

    // Collect depth issues
    if (analysis.depthAnalysis?.issues) {
      issues.push(...analysis.depthAnalysis.issues);
    }

    // Collect orphan issues
    if (analysis.orphanAnalysis?.issues) {
      issues.push(...analysis.orphanAnalysis.issues);
    }

    return issues;
  }

  /**
   * Generate comprehensive link recommendations
   * @private
   */
  _generateLinkRecommendations(analysis) {
    const recommendations = [];

    // Anchor text recommendations
    if (analysis.anchorTextAnalysis) {
      const genericPercentage = analysis.anchorTextAnalysis.distribution.patterns?.generic?.percentage || 0;
      const brandedPercentage = analysis.anchorTextAnalysis.distribution.patterns?.branded?.percentage || 0;
      const emptyPercentage = analysis.anchorTextAnalysis.distribution[ADVANCED_LINK_CONFIG.CATEGORIES.EMPTY]?.percentage || 0;

      if (genericPercentage > 20) {
        recommendations.push({
          category: 'anchor-text',
          priority: 'high',
          title: 'Reduce Generic Anchor Text',
          description: `${genericPercentage}% of links use generic anchor text`,
          action: 'Replace "click here" and similar generic text with descriptive, keyword-relevant phrases'
        });
      }

      if (brandedPercentage < 10) {
        recommendations.push({
          category: 'anchor-text',
          priority: 'medium',
          title: 'Increase Brand Anchors',
          description: 'Low usage of branded anchor text',
          action: 'Include brand terms in anchor text for brand recognition and trust'
        });
      }

      if (emptyPercentage > 5) {
        recommendations.push({
          category: 'accessibility',
          priority: 'high',
          title: 'Fix Empty Anchor Text',
          description: `${emptyPercentage}% of links have no anchor text`,
          action: 'Add descriptive anchor text or alt text for images within links'
        });
      }
    }

    // Context recommendations
    if (analysis.linkContextAnalysis) {
      const irrelevantPercentage = Math.round((analysis.linkContextAnalysis.contextsWithLowRelevance / analysis.linkContextAnalysis.totalLinks) * 100);
      
      if (irrelevantPercentage > 30) {
        recommendations.push({
          category: 'content',
          priority: 'medium',
          title: 'Improve Link Context Relevance',
          description: `${irrelevantPercentage}% of links lack relevant context`,
          action: 'Ensure links are surrounded by relevant, descriptive text'
        });
      }
    }

    // Depth recommendations
    if (analysis.depthAnalysis?.recommendations) {
      recommendations.push(...analysis.depthAnalysis.recommendations);
    }

    // Orphan recommendations
    if (analysis.orphanAnalysis?.recommendations) {
      recommendations.push(...analysis.orphanAnalysis.recommendations);
    }

    return recommendations;
  }

  // Legacy compatibility method
  analyzeAdvancedLinks(dom, pageUrl = '', siteData = {}) {
    console.warn('analyzeAdvancedLinks is deprecated. Use analyze() method instead.');
    return this.analyze(dom, { url: pageUrl, siteData });
  }
}

export default ModernAdvancedLinkAnalyzer;
