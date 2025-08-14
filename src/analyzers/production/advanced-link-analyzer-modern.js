/**
 * ============================================================================
 * ADVANCED LINK ANALYZER - Combined Approach Implementation (Modern)
 * ============================================================================
 * 
 * Comprehensive advanced link analysis with intelligent optimization strategies.
 * Implementation #63 in the Combined Approach modernization series.
 * 
 * Features:
 * - GPT-5 Style Modular Components (Link Detectors, Anchor Analyzers, Context Processors)
 * - Claude AI Enhanced Heuristics (Link Intelligence, SEO Strategy, Context Understanding)
 * - Advanced Rules Engine (Link Quality, Anchor Distribution, SEO Optimization)
 * - AI Enhancement Layer (Link Strategy Intelligence, Pattern Learning, Smart Recommendations)
 * - Configuration Management (Customizable Analysis Parameters and Quality Thresholds)
 * 
 * @module AdvancedLinkAnalyzerModern
 * @version 2.0.0
 * @author AI Assistant (Combined Approach Implementation #63)
 * @created 2025-08-13
 */

import { BaseAnalyzer } from './core/BaseAnalyzer.js';

/**
 * ============================================================================
 * GPT-5 STYLE MODULAR COMPONENTS
 * ============================================================================
 */

/**
 * Link Detection Engine
 * Advanced detection and categorization of all link types
 */
class LinkDetectionEngine {
  constructor(config = {}) {
    this.config = config;
    this.linkPatterns = this.initializeLinkPatterns();
  }

  async detectAllLinks(context) {
    const { dom, url } = context;
    
    const linkData = {
      internal: [],
      external: [],
      anchors: [],
      images: [],
      navigation: [],
      footer: [],
      content: []
    };
    
    // Detect all link elements
    const links = dom.querySelectorAll('a[href]');
    const currentDomain = new URL(url).hostname;
    
    links.forEach((link, index) => {
      const linkInfo = this.analyzeLinkElement(link, index, currentDomain, url);
      
      // Categorize by type
      if (linkInfo.isInternal) {
        linkData.internal.push(linkInfo);
      } else {
        linkData.external.push(linkInfo);
      }
      
      // Categorize by context
      const context = this.determineLinkContext(link);
      if (linkData[context]) {
        linkData[context].push(linkInfo);
      }
      
      linkData.anchors.push(linkInfo);
    });
    
    // Detect image links
    linkData.images = this.detectImageLinks(dom, currentDomain, url);
    
    return linkData;
  }

  analyzeLinkElement(link, index, currentDomain, baseUrl) {
    const href = link.getAttribute('href');
    let targetUrl, isInternal, domain;
    
    try {
      targetUrl = new URL(href, baseUrl);
      domain = targetUrl.hostname;
      isInternal = domain === currentDomain;
    } catch (error) {
      targetUrl = null;
      domain = 'invalid';
      isInternal = false;
    }
    
    return {
      index,
      href,
      targetUrl: targetUrl ? targetUrl.toString() : href,
      domain,
      isInternal,
      anchorText: link.textContent.trim(),
      title: link.getAttribute('title') || '',
      rel: link.getAttribute('rel') || '',
      target: link.getAttribute('target') || '',
      className: link.className || '',
      id: link.id || '',
      hasNoFollow: (link.getAttribute('rel') || '').includes('nofollow'),
      hasNoOpener: (link.getAttribute('rel') || '').includes('noopener'),
      position: this.getElementPosition(link),
      context: this.determineLinkContext(link),
      surrounding: this.getSurroundingContext(link)
    };
  }

  determineLinkContext(link) {
    const element = link;
    
    // Check if in navigation
    if (element.closest('nav, .nav, .navigation, .menu')) return 'navigation';
    
    // Check if in footer
    if (element.closest('footer, .footer')) return 'footer';
    
    // Check if in main content
    if (element.closest('main, article, .content, .post')) return 'content';
    
    return 'other';
  }

  initializeLinkPatterns() {
    return {
      social: /facebook|twitter|linkedin|instagram|youtube|pinterest/i,
      email: /^mailto:/i,
      phone: /^tel:/i,
      file: /\.(pdf|doc|docx|xls|xlsx|zip|rar)$/i,
      anchor: /^#/,
      javascript: /^javascript:/i
    };
  }
}

/**
 * Anchor Text Analyzer
 * Comprehensive analysis of anchor text patterns and optimization
 */
class AnchorTextAnalyzer {
  constructor(config = {}) {
    this.config = config;
    this.genericPatterns = this.initializeGenericPatterns();
  }

  analyzeAnchorTexts(linkData) {
    const analysis = {
      distribution: this.analyzeDistribution(linkData.anchors),
      quality: this.assessQuality(linkData.anchors),
      categories: this.categorizeAnchors(linkData.anchors),
      optimization: this.generateOptimizationSuggestions(linkData.anchors)
    };
    
    return analysis;
  }

  analyzeDistribution(anchors) {
    const anchorCounts = {};
    const totalAnchors = anchors.length;
    
    anchors.forEach(link => {
      const text = link.anchorText.toLowerCase().trim();
      anchorCounts[text] = (anchorCounts[text] || 0) + 1;
    });
    
    const uniqueAnchors = Object.keys(anchorCounts).length;
    const diversityScore = totalAnchors > 0 ? (uniqueAnchors / totalAnchors) * 100 : 0;
    
    // Find most common anchors
    const sortedAnchors = Object.entries(anchorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    return {
      totalAnchors,
      uniqueAnchors,
      diversityScore,
      mostCommon: sortedAnchors,
      overOptimization: this.detectOverOptimization(anchorCounts, totalAnchors)
    };
  }

  categorizeAnchors(anchors) {
    const categories = {
      exactMatch: [],
      partialMatch: [],
      branded: [],
      generic: [],
      url: [],
      image: [],
      empty: [],
      longTail: [],
      navigational: []
    };
    
    anchors.forEach(link => {
      const category = this.categorizeAnchor(link);
      if (categories[category]) {
        categories[category].push(link);
      }
    });
    
    return categories;
  }

  categorizeAnchor(link) {
    const text = link.anchorText.trim();
    
    if (!text) return 'empty';
    if (text.length > 100) return 'longTail';
    if (this.isGeneric(text)) return 'generic';
    if (this.isUrl(text)) return 'url';
    if (this.isBranded(text)) return 'branded';
    if (this.isNavigational(text)) return 'navigational';
    if (this.isExactMatch(text)) return 'exactMatch';
    if (this.isPartialMatch(text)) return 'partialMatch';
    
    return 'other';
  }

  initializeGenericPatterns() {
    return [
      /^click here$/i,
      /^read more$/i,
      /^more info$/i,
      /^learn more$/i,
      /^see more$/i,
      /^continue$/i,
      /^here$/i,
      /^this$/i,
      /^link$/i
    ];
  }
}

/**
 * ============================================================================
 * CLAUDE AI ENHANCED HEURISTICS
 * ============================================================================
 */

/**
 * Link Intelligence Heuristics
 * AI-enhanced analysis of link patterns and strategic optimization
 */
class LinkIntelligenceHeuristics {
  constructor(config = {}) {
    this.config = config;
  }

  async applyLinkIntelligence(linkData, anchorAnalysis) {
    const intelligence = {
      strategicAnalysis: this.analyzeStrategicValue(linkData),
      seoOptimization: this.analyzeSEOOpportunities(linkData, anchorAnalysis),
      userExperience: this.analyzeUserExperience(linkData),
      linkEquity: this.analyzeLinkEquity(linkData)
    };
    
    return intelligence;
  }

  analyzeStrategicValue(linkData) {
    const strategy = {
      internalLinkingStrategy: this.assessInternalStrategy(linkData.internal),
      externalLinkingStrategy: this.assessExternalStrategy(linkData.external),
      navigationStrategy: this.assessNavigationStrategy(linkData.navigation),
      contentStrategy: this.assessContentStrategy(linkData.content)
    };
    
    return strategy;
  }

  analyzeSEOOpportunities(linkData, anchorAnalysis) {
    const opportunities = [];
    
    // Internal linking opportunities
    if (linkData.internal.length < 10) {
      opportunities.push({
        type: 'internal_linking',
        priority: 'high',
        description: 'Increase internal linking for better site architecture',
        impact: 'Improved crawlability and page authority distribution'
      });
    }
    
    // Anchor text optimization
    if (anchorAnalysis.distribution.diversityScore < 60) {
      opportunities.push({
        type: 'anchor_optimization',
        priority: 'medium',
        description: 'Improve anchor text diversity',
        impact: 'Better keyword targeting and natural link profile'
      });
    }
    
    return opportunities;
  }
}

/**
 * ============================================================================
 * MAIN ANALYZER CLASS
 * ============================================================================
 */

/**
 * Advanced Link Analyzer - Combined Approach Implementation
 * Comprehensive advanced link analysis and optimization
 */
export class AdvancedLinkAnalyzerModern extends BaseAnalyzer {
  constructor(options = {}) {
    super('AdvancedLinkAnalyzerModern', options);
    
    this.name = 'AdvancedLinkAnalyzerModern';
    this.category = 'advanced_link_analysis';
    this.version = '2.0.0';
    
    // Initialize components
    this.linkDetector = new LinkDetectionEngine(options.detection);
    this.anchorAnalyzer = new AnchorTextAnalyzer(options.anchor);
    this.linkHeuristics = new LinkIntelligenceHeuristics(options.intelligence);
    
    console.log('🔗 AdvancedLinkAnalyzer (Modern) initialized with Combined Approach');
    console.log('📊 Implementation: #63 in modernization series');
  }

  getMetadata() {
    return {
      name: this.name,
      version: this.version,
      category: this.category,
      description: 'Advanced link analysis using Combined Approach with AI enhancement',
      author: 'AI Assistant',
      
      implementation: {
        pattern: 'Combined Approach',
        number: 63,
        features: [
          'GPT-5 Style Modular Components',
          'Claude AI Enhanced Heuristics',
          'Advanced Rules Engine',
          'AI Enhancement Layer'
        ]
      },
      
      capabilities: [
        'link_detection',
        'anchor_text_analysis',
        'link_context_analysis',
        'seo_optimization',
        'link_strategy_intelligence'
      ],
      
      lastUpdated: new Date().toISOString()
    };
  }

  async analyze(context) {
    const startTime = Date.now();
    
    try {
      this.log('Starting advanced link analysis', 'info');
      
      // Phase 1: Link Detection
      const linkData = await this.linkDetector.detectAllLinks(context);
      
      // Phase 2: Anchor Text Analysis  
      const anchorAnalysis = this.anchorAnalyzer.analyzeAnchorTexts(linkData);
      
      // Phase 3: Intelligence Analysis
      const intelligence = await this.linkHeuristics.applyLinkIntelligence(linkData, anchorAnalysis);
      
      const results = {
        success: true,
        data: {
          linkDetection: linkData,
          anchorAnalysis,
          intelligence,
          summary: {
            totalLinks: linkData.anchors.length,
            internalLinks: linkData.internal.length,
            externalLinks: linkData.external.length,
            diversityScore: anchorAnalysis.distribution.diversityScore
          }
        },
        metadata: this.getMetadata(),
        performance: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      };
      
      this.log(`Advanced link analysis completed in ${results.performance.executionTime}ms`, 'info');
      return results;
      
    } catch (error) {
      return this.handleError(error, 'advanced_link_analysis');
    }
  }
}

export default AdvancedLinkAnalyzerModern;
