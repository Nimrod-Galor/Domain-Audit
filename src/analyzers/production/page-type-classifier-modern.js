/**
 * ============================================================================
 * PAGE TYPE CLASSIFIER - Combined Approach Implementation (Modern)
 * ============================================================================
 * 
 * Comprehensive page type classification with advanced pattern recognition and AI analysis.
 * Implementation #61 in the Combined Approach modernization series.
 * 
 * Features:
 * - GPT-5 Style Modular Components (Content Analyzers, Pattern Detectors, Semantic Classifiers)
 * - Claude AI Enhanced Heuristics (Content Intelligence, Context Understanding, Intent Analysis)
 * - Advanced Rules Engine (Classification Rules, Confidence Scoring, Multi-type Detection)
 * - AI Enhancement Layer (Semantic Analysis, Pattern Learning, Intelligent Recommendations)
 * - Configuration Management (Customizable Classification Parameters and Patterns)
 * 
 * @module PageTypeClassifierModern
 * @version 2.0.0
 * @author AI Assistant (Combined Approach Implementation #61)
 * @created 2025-08-13
 */

import { BaseAnalyzer } from '../core/BaseAnalyzer.js';

/**
 * ============================================================================
 * GPT-5 STYLE MODULAR COMPONENTS
 * ============================================================================
 */

/**
 * Content Structure Analyzer
 * Analyzes page structure and content organization patterns
 */
class ContentStructureAnalyzer {
  constructor(config = {}) {
    this.config = {
      semanticWeights: config.semanticWeights || {
        header: 0.2,
        nav: 0.15,
        main: 0.4,
        aside: 0.1,
        footer: 0.15
      },
      ...config
    };
  }

  /**
   * Analyze page structure for classification hints
   */
  async analyzeStructure(context) {
    const { dom } = context;
    
    const structure = {
      semanticElements: this.extractSemanticElements(dom),
      headingHierarchy: this.analyzeHeadingHierarchy(dom),
      navigationStructure: this.analyzeNavigationStructure(dom),
      contentOrganization: this.analyzeContentOrganization(dom),
      interactiveElements: this.analyzeInteractiveElements(dom)
    };
    
    return structure;
  }

  extractSemanticElements(dom) {
    const semanticTags = ['header', 'nav', 'main', 'article', 'section', 'aside', 'footer'];
    const elements = {};
    
    semanticTags.forEach(tag => {
      const els = dom.querySelectorAll(tag);
      elements[tag] = {
        count: els.length,
        present: els.length > 0,
        content: els.length > 0 ? els[0].textContent.slice(0, 200) : ''
      };
    });
    
    return elements;
  }

  analyzeHeadingHierarchy(dom) {
    const headings = dom.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const hierarchy = {};
    
    headings.forEach(heading => {
      const level = heading.tagName.toLowerCase();
      if (!hierarchy[level]) hierarchy[level] = [];
      hierarchy[level].push({
        text: heading.textContent.trim(),
        position: this.getElementPosition(heading)
      });
    });
    
    return {
      structure: hierarchy,
      isProper: this.validateHeadingHierarchy(hierarchy),
      mainHeading: hierarchy.h1 ? hierarchy.h1[0]?.text : null
    };
  }

  analyzeNavigationStructure(dom) {
    const navElements = dom.querySelectorAll('nav, .nav, .navigation, .menu');
    const links = dom.querySelectorAll('a[href]');
    
    return {
      navigationElements: navElements.length,
      totalLinks: links.length,
      internalLinks: this.countInternalLinks(links),
      navigationComplexity: this.calculateNavigationComplexity(navElements),
      breadcrumbs: this.detectBreadcrumbs(dom)
    };
  }

  analyzeContentOrganization(dom) {
    const main = dom.querySelector('main') || dom.querySelector('body');
    if (!main) return { organization: 'unknown' };
    
    const sections = main.querySelectorAll('section, .section, article, .article');
    const lists = main.querySelectorAll('ul, ol');
    const forms = main.querySelectorAll('form');
    
    return {
      sections: sections.length,
      lists: lists.length,
      forms: forms.length,
      organization: this.classifyContentOrganization(sections, lists, forms)
    };
  }

  analyzeInteractiveElements(dom) {
    const buttons = dom.querySelectorAll('button, input[type="button"], input[type="submit"]');
    const forms = dom.querySelectorAll('form');
    const ctaElements = dom.querySelectorAll('.cta, .call-to-action, .btn-primary');
    
    return {
      buttons: buttons.length,
      forms: forms.length,
      callToActions: ctaElements.length,
      interactivity: this.calculateInteractivityScore(buttons, forms, ctaElements)
    };
  }

  getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      inViewport: rect.top >= 0 && rect.left >= 0
    };
  }
}

/**
 * Pattern Recognition Engine
 * Advanced pattern detection for different page types
 */
class PatternRecognitionEngine {
  constructor(config = {}) {
    this.patterns = config.patterns || this.getDefaultPatterns();
    this.weights = config.weights || this.getDefaultWeights();
  }

  /**
   * Recognize patterns across multiple dimensions
   */
  async recognizePatterns(context) {
    const { dom, url } = context;
    
    const recognition = {
      urlPatterns: this.analyzeUrlPatterns(url),
      contentPatterns: this.analyzeContentPatterns(dom),
      metaPatterns: this.analyzeMetaPatterns(dom),
      structuralPatterns: this.analyzeStructuralPatterns(dom),
      behavioralPatterns: this.analyzeBehavioralPatterns(dom)
    };
    
    return recognition;
  }

  analyzeUrlPatterns(url) {
    const patterns = {};
    const urlPath = new URL(url).pathname.toLowerCase();
    
    Object.entries(this.patterns.URL_PATTERNS).forEach(([type, regexes]) => {
      const matches = regexes.filter(regex => regex.test(urlPath));
      patterns[type] = {
        matches: matches.length,
        confidence: matches.length > 0 ? 0.8 : 0,
        matchedPatterns: matches
      };
    });
    
    return patterns;
  }

  analyzeContentPatterns(dom) {
    const patterns = {};
    const content = dom.textContent.toLowerCase();
    
    Object.entries(this.patterns.CONTENT_PATTERNS).forEach(([type, keywords]) => {
      const matches = keywords.filter(keyword => content.includes(keyword.toLowerCase()));
      patterns[type] = {
        matches: matches.length,
        confidence: Math.min(matches.length / keywords.length, 1),
        matchedKeywords: matches
      };
    });
    
    return patterns;
  }

  analyzeMetaPatterns(dom) {
    const patterns = {};
    const metaTags = dom.querySelectorAll('meta[property], meta[name]');
    const metaContent = Array.from(metaTags).map(meta => 
      (meta.getAttribute('content') || '').toLowerCase()
    ).join(' ');
    
    Object.entries(this.patterns.META_PATTERNS).forEach(([type, indicators]) => {
      const matches = indicators.filter(indicator => metaContent.includes(indicator.toLowerCase()));
      patterns[type] = {
        matches: matches.length,
        confidence: matches.length > 0 ? 0.7 : 0,
        matchedIndicators: matches
      };
    });
    
    return patterns;
  }

  analyzeStructuralPatterns(dom) {
    const patterns = {};
    
    Object.entries(this.patterns.STRUCTURAL_PATTERNS).forEach(([type, selectors]) => {
      const elements = selectors.map(selector => dom.querySelectorAll(selector).length);
      const totalElements = elements.reduce((sum, count) => sum + count, 0);
      
      patterns[type] = {
        elementCount: totalElements,
        confidence: totalElements > 0 ? Math.min(totalElements / 5, 1) : 0,
        foundSelectors: selectors.filter((selector, i) => elements[i] > 0)
      };
    });
    
    return patterns;
  }

  analyzeBehavioralPatterns(dom) {
    const patterns = {};
    
    // E-commerce patterns
    const ecommerceElements = dom.querySelectorAll('.cart, .add-to-cart, .price, .checkout, .product');
    patterns.ecommerce = {
      elementCount: ecommerceElements.length,
      confidence: Math.min(ecommerceElements.length / 3, 1)
    };
    
    // Blog patterns
    const blogElements = dom.querySelectorAll('.post, .article, .blog, .comment, .author');
    patterns.blog = {
      elementCount: blogElements.length,
      confidence: Math.min(blogElements.length / 2, 1)
    };
    
    // Form patterns
    const formElements = dom.querySelectorAll('form, input, textarea, select');
    patterns.form = {
      elementCount: formElements.length,
      confidence: Math.min(formElements.length / 3, 1)
    };
    
    return patterns;
  }

  getDefaultPatterns() {
    return {
      URL_PATTERNS: {
        homepage: [/^\/$/, /^\/home/, /^\/index/, /^\/main/],
        product: [/\/product/, /\/item/, /\/shop/, /\/p\//, /\/products\//],
        category: [/\/category/, /\/categories/, /\/shop/, /\/collection/],
        article: [/\/article/, /\/post/, /\/blog/, /\/news/, /\/\d{4}\/\d{2}/],
        contact: [/\/contact/, /\/reach/, /\/support/, /\/help/],
        about: [/\/about/, /\/company/, /\/team/, /\/story/],
        search: [/\/search/, /\/find/, /\/results/],
        login: [/\/login/, /\/signin/, /\/auth/, /\/account/]
      },
      
      CONTENT_PATTERNS: {
        homepage: ['welcome', 'home', 'featured', 'hero', 'get started'],
        product: ['price', 'buy now', 'add to cart', 'purchase', 'specifications'],
        article: ['published', 'author', 'read more', 'comments', 'share'],
        contact: ['contact us', 'email', 'phone', 'address', 'message'],
        about: ['about us', 'our story', 'mission', 'team', 'history'],
        search: ['search results', 'found', 'filter', 'sort by', 'no results']
      },
      
      META_PATTERNS: {
        homepage: ['website', 'home', 'main'],
        product: ['product', 'item', 'price', 'buy'],
        article: ['article', 'blog', 'news', 'post'],
        ecommerce: ['ecommerce', 'shop', 'store', 'cart']
      },
      
      STRUCTURAL_PATTERNS: {
        product: ['.price', '.cart', '.product-details', '.reviews', '.specifications'],
        article: ['article', '.post', '.author', '.date', '.content'],
        contact: ['form', '.contact-form', '.phone', '.email', '.address'],
        ecommerce: ['.cart', '.checkout', '.product', '.category', '.wishlist']
      }
    };
  }

  getDefaultWeights() {
    return {
      url: 0.3,
      content: 0.25,
      meta: 0.2,
      structural: 0.15,
      behavioral: 0.1
    };
  }
}

/**
 * Semantic Classification Engine
 * Advanced semantic analysis for understanding page purpose and intent
 */
class SemanticClassificationEngine {
  constructor(config = {}) {
    this.config = config;
    this.semanticPatterns = this.buildSemanticPatterns();
  }

  /**
   * Perform semantic classification analysis
   */
  async performSemanticAnalysis(context, structureData, patternData) {
    const { dom, url } = context;
    
    const semantic = {
      contentPurpose: this.analyzeContentPurpose(dom, patternData),
      userIntent: this.analyzeUserIntent(dom, url, patternData),
      businessFunction: this.analyzeBusinessFunction(dom, structureData),
      contentQuality: this.analyzeContentQuality(dom),
      semanticContext: this.analyzeSemanticContext(dom, structureData)
    };
    
    return semantic;
  }

  analyzeContentPurpose(dom, patternData) {
    const purposes = {
      informational: 0,
      transactional: 0,
      navigational: 0,
      commercial: 0
    };
    
    // Analyze content keywords for purpose indicators
    const content = dom.textContent.toLowerCase();
    
    // Informational keywords
    const infoKeywords = ['learn', 'guide', 'how to', 'tutorial', 'information', 'about'];
    purposes.informational = infoKeywords.filter(k => content.includes(k)).length / infoKeywords.length;
    
    // Transactional keywords
    const transKeywords = ['buy', 'purchase', 'order', 'cart', 'checkout', 'price'];
    purposes.transactional = transKeywords.filter(k => content.includes(k)).length / transKeywords.length;
    
    // Navigational keywords
    const navKeywords = ['home', 'menu', 'search', 'browse', 'category', 'directory'];
    purposes.navigational = navKeywords.filter(k => content.includes(k)).length / navKeywords.length;
    
    // Commercial keywords
    const commKeywords = ['product', 'service', 'company', 'business', 'solution'];
    purposes.commercial = commKeywords.filter(k => content.includes(k)).length / commKeywords.length;
    
    // Return highest scoring purpose
    const topPurpose = Object.entries(purposes).reduce((a, b) => purposes[a[0]] > purposes[b[0]] ? a : b);
    
    return {
      primary: topPurpose[0],
      confidence: topPurpose[1],
      scores: purposes
    };
  }

  analyzeUserIntent(dom, url, patternData) {
    const intents = {
      browse: 0,
      search: 0,
      purchase: 0,
      learn: 0,
      contact: 0
    };
    
    // URL-based intent analysis
    const urlPath = new URL(url).pathname;
    if (urlPath.includes('search') || urlPath.includes('find')) intents.search += 0.8;
    if (urlPath.includes('shop') || urlPath.includes('buy')) intents.purchase += 0.8;
    if (urlPath.includes('contact') || urlPath.includes('support')) intents.contact += 0.8;
    if (urlPath.includes('learn') || urlPath.includes('guide')) intents.learn += 0.8;
    
    // Content-based intent analysis
    const hasSearchForm = dom.querySelector('form input[type="search"]') !== null;
    if (hasSearchForm) intents.search += 0.6;
    
    const hasPurchaseElements = dom.querySelectorAll('.cart, .buy, .purchase').length > 0;
    if (hasPurchaseElements) intents.purchase += 0.6;
    
    const hasContactForm = dom.querySelector('form input[type="email"]') !== null;
    if (hasContactForm) intents.contact += 0.6;
    
    // Return highest scoring intent
    const topIntent = Object.entries(intents).reduce((a, b) => intents[a[0]] > intents[b[0]] ? a : b);
    
    return {
      primary: topIntent[0],
      confidence: Math.min(topIntent[1], 1),
      scores: intents
    };
  }

  analyzeBusinessFunction(dom, structureData) {
    const functions = {
      marketing: 0,
      sales: 0,
      support: 0,
      information: 0,
      community: 0
    };
    
    // Analyze based on structure and content
    if (structureData.interactiveElements.callToActions > 2) functions.marketing += 0.7;
    if (structureData.interactiveElements.forms > 0) functions.sales += 0.5;
    
    const content = dom.textContent.toLowerCase();
    if (content.includes('support') || content.includes('help')) functions.support += 0.8;
    if (content.includes('community') || content.includes('forum')) functions.community += 0.8;
    
    // Return highest scoring function
    const topFunction = Object.entries(functions).reduce((a, b) => functions[a[0]] > functions[b[0]] ? a : b);
    
    return {
      primary: topFunction[0],
      confidence: topFunction[1],
      scores: functions
    };
  }

  analyzeContentQuality(dom) {
    const textContent = dom.textContent.trim();
    const wordCount = textContent.split(/\s+/).length;
    const headings = dom.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
    const images = dom.querySelectorAll('img').length;
    const links = dom.querySelectorAll('a[href]').length;
    
    let qualityScore = 0;
    
    // Word count quality
    if (wordCount > 300) qualityScore += 0.3;
    if (wordCount > 1000) qualityScore += 0.2;
    
    // Structure quality
    if (headings > 2) qualityScore += 0.2;
    if (images > 0) qualityScore += 0.1;
    if (links > 3) qualityScore += 0.1;
    
    // Content depth
    const sentences = textContent.split(/[.!?]+/).length;
    if (sentences > 10) qualityScore += 0.1;
    
    return {
      score: Math.min(qualityScore, 1),
      metrics: {
        wordCount,
        headings,
        images,
        links,
        sentences
      }
    };
  }

  analyzeSemanticContext(dom, structureData) {
    const context = {
      domain: 'general',
      industry: 'unknown',
      contentType: 'mixed',
      targetAudience: 'general'
    };
    
    const content = dom.textContent.toLowerCase();
    
    // Industry detection
    const industries = {
      ecommerce: ['shop', 'buy', 'cart', 'product', 'price'],
      technology: ['software', 'app', 'tech', 'digital', 'code'],
      healthcare: ['health', 'medical', 'doctor', 'treatment', 'patient'],
      finance: ['money', 'bank', 'loan', 'investment', 'financial'],
      education: ['learn', 'course', 'student', 'education', 'school']
    };
    
    let topIndustry = 'unknown';
    let topScore = 0;
    
    Object.entries(industries).forEach(([industry, keywords]) => {
      const score = keywords.filter(k => content.includes(k)).length / keywords.length;
      if (score > topScore) {
        topScore = score;
        topIndustry = industry;
      }
    });
    
    if (topScore > 0.3) context.industry = topIndustry;
    
    return context;
  }

  buildSemanticPatterns() {
    return {
      intent_patterns: {
        browse: ['category', 'browse', 'explore', 'discover'],
        search: ['search', 'find', 'look for', 'query'],
        purchase: ['buy', 'purchase', 'order', 'shop'],
        learn: ['learn', 'tutorial', 'guide', 'how to'],
        contact: ['contact', 'reach', 'support', 'help']
      },
      purpose_patterns: {
        informational: ['information', 'about', 'learn', 'guide'],
        transactional: ['buy', 'purchase', 'order', 'checkout'],
        navigational: ['home', 'menu', 'sitemap', 'directory'],
        commercial: ['product', 'service', 'business', 'company']
      }
    };
  }
}

/**
 * ============================================================================
 * CLAUDE AI ENHANCED HEURISTICS
 * ============================================================================
 */

/**
 * Content Intelligence Heuristics
 * AI-enhanced analysis of content patterns and classification confidence
 */
class ContentIntelligenceHeuristics {
  constructor(config = {}) {
    this.config = config;
    this.learningData = [];
  }

  /**
   * Apply intelligent heuristics to improve classification accuracy
   */
  async applyContentIntelligence(structureData, patternData, semanticData) {
    const intelligence = {
      classificationConfidence: this.calculateClassificationConfidence(patternData),
      contentCoherence: this.analyzeContentCoherence(structureData, semanticData),
      patternConsistency: this.analyzePatternConsistency(patternData),
      contextualRelevance: this.analyzeContextualRelevance(semanticData),
      recommendedClassification: null
    };
    
    // Generate intelligent classification recommendation
    intelligence.recommendedClassification = this.generateIntelligentClassification(
      patternData, semanticData, intelligence
    );
    
    return intelligence;
  }

  calculateClassificationConfidence(patternData) {
    const confidences = {};
    
    // Aggregate confidence scores across all pattern types
    Object.entries(patternData).forEach(([patternType, patterns]) => {
      Object.entries(patterns).forEach(([pageType, data]) => {
        if (!confidences[pageType]) confidences[pageType] = [];
        confidences[pageType].push(data.confidence || 0);
      });
    });
    
    // Calculate weighted average confidence for each page type
    const finalConfidences = {};
    Object.entries(confidences).forEach(([pageType, scores]) => {
      const validScores = scores.filter(score => score > 0);
      finalConfidences[pageType] = validScores.length > 0 
        ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
        : 0;
    });
    
    return finalConfidences;
  }

  analyzeContentCoherence(structureData, semanticData) {
    let coherenceScore = 0;
    
    // Structure coherence
    if (structureData.headingHierarchy.isProper) coherenceScore += 0.3;
    if (structureData.semanticElements.main.present) coherenceScore += 0.2;
    if (structureData.navigationStructure.breadcrumbs) coherenceScore += 0.1;
    
    // Semantic coherence
    if (semanticData.contentPurpose.confidence > 0.7) coherenceScore += 0.2;
    if (semanticData.userIntent.confidence > 0.7) coherenceScore += 0.2;
    
    return {
      score: coherenceScore,
      factors: {
        structuralCoherence: structureData.headingHierarchy.isProper,
        semanticCoherence: semanticData.contentPurpose.confidence,
        navigationCoherence: structureData.navigationStructure.breadcrumbs
      }
    };
  }

  analyzePatternConsistency(patternData) {
    const consistency = {};
    
    // Check for conflicting patterns
    const pageTypes = new Set();
    Object.values(patternData).forEach(patterns => {
      Object.entries(patterns).forEach(([pageType, data]) => {
        if (data.confidence > 0.5) pageTypes.add(pageType);
      });
    });
    
    consistency.conflictingTypes = Array.from(pageTypes);
    consistency.hasConflicts = pageTypes.size > 2;
    consistency.dominantType = this.findDominantType(patternData);
    
    return consistency;
  }

  analyzeContextualRelevance(semanticData) {
    const relevance = {
      purposeAlignment: this.assessPurposeAlignment(semanticData),
      intentConsistency: this.assessIntentConsistency(semanticData),
      contextualFit: this.assessContextualFit(semanticData)
    };
    
    relevance.overallRelevance = (
      relevance.purposeAlignment +
      relevance.intentConsistency +
      relevance.contextualFit
    ) / 3;
    
    return relevance;
  }

  generateIntelligentClassification(patternData, semanticData, intelligence) {
    const candidates = [];
    
    // Collect classification candidates with confidence scores
    Object.values(patternData).forEach(patterns => {
      Object.entries(patterns).forEach(([pageType, data]) => {
        if (data.confidence > 0.3) {
          candidates.push({
            type: pageType,
            confidence: data.confidence,
            source: 'pattern'
          });
        }
      });
    });
    
    // Add semantic-based candidates
    if (semanticData.contentPurpose.confidence > 0.5) {
      candidates.push({
        type: this.mapPurposeToPageType(semanticData.contentPurpose.primary),
        confidence: semanticData.contentPurpose.confidence,
        source: 'semantic'
      });
    }
    
    // Select best candidate
    const bestCandidate = candidates.reduce((best, current) => 
      current.confidence > best.confidence ? current : best,
      { confidence: 0 }
    );
    
    return bestCandidate.confidence > 0.4 ? bestCandidate : null;
  }

  findDominantType(patternData) {
    const typeScores = {};
    
    Object.values(patternData).forEach(patterns => {
      Object.entries(patterns).forEach(([pageType, data]) => {
        if (!typeScores[pageType]) typeScores[pageType] = 0;
        typeScores[pageType] += data.confidence || 0;
      });
    });
    
    const dominant = Object.entries(typeScores).reduce((a, b) => 
      typeScores[a[0]] > typeScores[b[0]] ? a : b,
      ['unknown', 0]
    );
    
    return { type: dominant[0], score: dominant[1] };
  }

  mapPurposeToPageType(purpose) {
    const mapping = {
      informational: 'article',
      transactional: 'product',
      navigational: 'homepage',
      commercial: 'category'
    };
    return mapping[purpose] || 'unknown';
  }
}

/**
 * Context Understanding Heuristics
 * Advanced context analysis for better classification accuracy
 */
class ContextUnderstandingHeuristics {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Analyze context for improved understanding
   */
  async analyzeContext(context, allAnalysisData) {
    const contextAnalysis = {
      siteContext: this.analyzeSiteContext(context),
      pageContext: this.analyzePageContext(context, allAnalysisData),
      userContext: this.analyzeUserContext(context),
      businessContext: this.analyzeBusinessContext(allAnalysisData)
    };
    
    return contextAnalysis;
  }

  analyzeSiteContext(context) {
    const { url } = context;
    const domain = new URL(url).hostname;
    
    return {
      domain,
      subdomain: this.extractSubdomain(domain),
      tld: this.extractTLD(domain),
      pathDepth: new URL(url).pathname.split('/').length - 1,
      hasQuery: new URL(url).search.length > 0
    };
  }

  analyzePageContext(context, analysisData) {
    const { dom } = context;
    
    return {
      hasNavigation: dom.querySelector('nav') !== null,
      hasSearch: dom.querySelector('input[type="search"]') !== null,
      hasForm: dom.querySelector('form') !== null,
      hasVideo: dom.querySelector('video') !== null,
      hasImages: dom.querySelector('img') !== null,
      contentLength: dom.textContent.length,
      linkDensity: this.calculateLinkDensity(dom)
    };
  }

  analyzeUserContext(context) {
    // Analyze potential user journey and behavior patterns
    const { url } = context;
    const urlParams = new URL(url).searchParams;
    
    return {
      hasReferrer: urlParams.has('ref') || urlParams.has('utm_source'),
      hasTracking: urlParams.has('utm_campaign'),
      likelyEntryPoint: this.assessEntryPoint(context),
      navigationDepth: this.assessNavigationDepth(context)
    };
  }

  analyzeBusinessContext(analysisData) {
    // Analyze business intent and commercial aspects
    return {
      commercialIntent: this.assessCommercialIntent(analysisData),
      brandingElements: this.assessBrandingElements(analysisData),
      conversionElements: this.assessConversionElements(analysisData)
    };
  }

  calculateLinkDensity(dom) {
    const textLength = dom.textContent.length;
    const linkTextLength = Array.from(dom.querySelectorAll('a')).reduce(
      (total, link) => total + link.textContent.length, 0
    );
    return textLength > 0 ? linkTextLength / textLength : 0;
  }

  extractSubdomain(domain) {
    const parts = domain.split('.');
    return parts.length > 2 ? parts[0] : null;
  }

  extractTLD(domain) {
    const parts = domain.split('.');
    return parts[parts.length - 1];
  }
}

/**
 * ============================================================================
 * ADVANCED RULES ENGINE
 * ============================================================================
 */

/**
 * Classification Rules Engine
 * Comprehensive rules for accurate page type classification
 */
class ClassificationRulesEngine {
  constructor(config = {}) {
    this.rules = this.buildClassificationRules();
    this.confidenceThresholds = config.confidenceThresholds || {
      high: 0.8,
      medium: 0.6,
      low: 0.4
    };
  }

  /**
   * Apply classification rules to determine page type
   */
  applyClassificationRules(patternData, semanticData, contextData) {
    const results = {
      classifications: [],
      confidence: 0,
      reasoning: [],
      alternatives: []
    };
    
    // Apply each rule set
    this.rules.forEach(ruleSet => {
      const ruleResult = this.evaluateRuleSet(ruleSet, {
        patterns: patternData,
        semantic: semanticData,
        context: contextData
      });
      
      if (ruleResult.triggered) {
        results.classifications.push(ruleResult);
      }
    });
    
    // Determine primary classification
    if (results.classifications.length > 0) {
      const primary = results.classifications.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
      
      results.primaryClassification = primary;
      results.confidence = primary.confidence;
      results.reasoning = primary.reasoning;
      
      // Identify alternatives
      results.alternatives = results.classifications
        .filter(c => c !== primary && c.confidence > this.confidenceThresholds.low)
        .sort((a, b) => b.confidence - a.confidence);
    }
    
    return results;
  }

  evaluateRuleSet(ruleSet, data) {
    const { conditions, classification, weight } = ruleSet;
    let score = 0;
    const reasoning = [];
    
    // Evaluate each condition
    conditions.forEach(condition => {
      const conditionResult = this.evaluateCondition(condition, data);
      if (conditionResult.satisfied) {
        score += conditionResult.weight;
        reasoning.push(conditionResult.reason);
      }
    });
    
    // Calculate confidence
    const maxScore = conditions.reduce((sum, c) => sum + c.weight, 0);
    const confidence = maxScore > 0 ? (score / maxScore) * weight : 0;
    
    return {
      triggered: confidence > this.confidenceThresholds.low,
      classification,
      confidence,
      reasoning,
      score
    };
  }

  evaluateCondition(condition, data) {
    const { type, target, operator, value, weight } = condition;
    let satisfied = false;
    let reason = '';
    
    switch (type) {
      case 'pattern':
        satisfied = this.evaluatePatternCondition(target, operator, value, data.patterns);
        reason = `Pattern ${target} ${operator} ${value}`;
        break;
        
      case 'semantic':
        satisfied = this.evaluateSemanticCondition(target, operator, value, data.semantic);
        reason = `Semantic ${target} ${operator} ${value}`;
        break;
        
      case 'context':
        satisfied = this.evaluateContextCondition(target, operator, value, data.context);
        reason = `Context ${target} ${operator} ${value}`;
        break;
    }
    
    return { satisfied, weight, reason };
  }

  buildClassificationRules() {
    return [
      {
        classification: 'homepage',
        weight: 1.0,
        conditions: [
          { type: 'pattern', target: 'urlPatterns.homepage', operator: 'confidence_gt', value: 0.8, weight: 0.4 },
          { type: 'semantic', target: 'contentPurpose.primary', operator: 'equals', value: 'navigational', weight: 0.3 },
          { type: 'context', target: 'siteContext.pathDepth', operator: 'equals', value: 0, weight: 0.3 }
        ]
      },
      {
        classification: 'product',
        weight: 1.0,
        conditions: [
          { type: 'pattern', target: 'urlPatterns.product', operator: 'confidence_gt', value: 0.7, weight: 0.4 },
          { type: 'pattern', target: 'contentPatterns.product', operator: 'confidence_gt', value: 0.6, weight: 0.3 },
          { type: 'semantic', target: 'contentPurpose.primary', operator: 'equals', value: 'transactional', weight: 0.3 }
        ]
      },
      {
        classification: 'article',
        weight: 1.0,
        conditions: [
          { type: 'pattern', target: 'urlPatterns.article', operator: 'confidence_gt', value: 0.7, weight: 0.4 },
          { type: 'pattern', target: 'contentPatterns.article', operator: 'confidence_gt', value: 0.5, weight: 0.3 },
          { type: 'semantic', target: 'contentPurpose.primary', operator: 'equals', value: 'informational', weight: 0.3 }
        ]
      },
      {
        classification: 'category',
        weight: 1.0,
        conditions: [
          { type: 'pattern', target: 'urlPatterns.category', operator: 'confidence_gt', value: 0.6, weight: 0.4 },
          { type: 'semantic', target: 'userIntent.primary', operator: 'equals', value: 'browse', weight: 0.3 },
          { type: 'context', target: 'pageContext.linkDensity', operator: 'gt', value: 0.3, weight: 0.3 }
        ]
      },
      {
        classification: 'contact',
        weight: 1.0,
        conditions: [
          { type: 'pattern', target: 'urlPatterns.contact', operator: 'confidence_gt', value: 0.8, weight: 0.4 },
          { type: 'pattern', target: 'contentPatterns.contact', operator: 'confidence_gt', value: 0.6, weight: 0.3 },
          { type: 'context', target: 'pageContext.hasForm', operator: 'equals', value: true, weight: 0.3 }
        ]
      }
    ];
  }
}

/**
 * Confidence Scoring Engine
 * Advanced confidence calculation for classification results
 */
class ConfidenceScoringEngine {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Calculate comprehensive confidence scores
   */
  calculateConfidenceScores(classificationResults, heuristicData) {
    const confidence = {
      overall: 0,
      factors: {},
      reliability: 'unknown',
      recommendations: []
    };
    
    // Factor-based confidence calculation
    confidence.factors.patternConsistency = this.calculatePatternConsistency(classificationResults);
    confidence.factors.semanticAlignment = this.calculateSemanticAlignment(classificationResults, heuristicData);
    confidence.factors.contextualSupport = this.calculateContextualSupport(classificationResults);
    confidence.factors.dataQuality = this.calculateDataQuality(classificationResults);
    
    // Calculate overall confidence
    const factorWeights = { patternConsistency: 0.3, semanticAlignment: 0.3, contextualSupport: 0.2, dataQuality: 0.2 };
    confidence.overall = Object.entries(confidence.factors).reduce((total, [factor, score]) => {
      return total + (score * factorWeights[factor]);
    }, 0);
    
    // Determine reliability level
    confidence.reliability = this.determineReliability(confidence.overall);
    
    // Generate recommendations
    confidence.recommendations = this.generateConfidenceRecommendations(confidence);
    
    return confidence;
  }

  calculatePatternConsistency(results) {
    if (!results.alternatives || results.alternatives.length === 0) {
      return results.confidence || 0;
    }
    
    const primaryConfidence = results.confidence || 0;
    const alternativeConfidences = results.alternatives.map(alt => alt.confidence);
    const maxAlternative = Math.max(...alternativeConfidences, 0);
    
    // Higher consistency when primary is much stronger than alternatives
    return primaryConfidence > 0 ? Math.max(0, (primaryConfidence - maxAlternative) / primaryConfidence) : 0;
  }

  calculateSemanticAlignment(results, heuristicData) {
    if (!heuristicData.contentCoherence) return 0.5;
    
    return heuristicData.contentCoherence.score || 0.5;
  }

  calculateContextualSupport(results) {
    if (!results.reasoning || results.reasoning.length === 0) return 0.3;
    
    // More reasoning factors = higher confidence
    return Math.min(results.reasoning.length / 5, 1);
  }

  calculateDataQuality(results) {
    // Assess the quality of input data used for classification
    let qualityScore = 0.5; // Base score
    
    if (results.primaryClassification) qualityScore += 0.2;
    if (results.reasoning && results.reasoning.length > 2) qualityScore += 0.2;
    if (results.confidence > 0.7) qualityScore += 0.1;
    
    return Math.min(qualityScore, 1);
  }

  determineReliability(overallConfidence) {
    if (overallConfidence >= 0.8) return 'high';
    if (overallConfidence >= 0.6) return 'medium';
    if (overallConfidence >= 0.4) return 'low';
    return 'very_low';
  }

  generateConfidenceRecommendations(confidence) {
    const recommendations = [];
    
    if (confidence.overall < 0.6) {
      recommendations.push('Consider collecting more data for better classification accuracy');
    }
    
    if (confidence.factors.patternConsistency < 0.5) {
      recommendations.push('Pattern analysis shows conflicting signals - review page content');
    }
    
    if (confidence.factors.semanticAlignment < 0.5) {
      recommendations.push('Semantic analysis suggests unclear page purpose');
    }
    
    return recommendations;
  }
}

/**
 * ============================================================================
 * AI ENHANCEMENT LAYER
 * ============================================================================
 */

/**
 * Semantic Analysis AI
 * Advanced AI-powered semantic understanding and classification
 */
class SemanticAnalysisAI {
  constructor(config = {}) {
    this.config = config;
    this.learningData = [];
  }

  /**
   * Perform AI-enhanced semantic analysis
   */
  async performAIAnalysis(allData) {
    const aiAnalysis = {
      semanticInsights: await this.generateSemanticInsights(allData),
      patternPredictions: await this.generatePatternPredictions(allData),
      intelligentRecommendations: await this.generateIntelligentRecommendations(allData),
      confidenceOptimization: await this.optimizeConfidence(allData)
    };
    
    return aiAnalysis;
  }

  async generateSemanticInsights(data) {
    const insights = [];
    
    // Analyze content depth and quality
    if (data.semantic && data.semantic.contentQuality) {
      const quality = data.semantic.contentQuality;
      if (quality.score > 0.8) {
        insights.push({
          type: 'quality',
          message: 'High-quality content detected with comprehensive information',
          confidence: 0.9
        });
      }
    }
    
    // Analyze user intent clarity
    if (data.semantic && data.semantic.userIntent) {
      const intent = data.semantic.userIntent;
      if (intent.confidence > 0.8) {
        insights.push({
          type: 'intent',
          message: `Clear user intent detected: ${intent.primary}`,
          confidence: intent.confidence
        });
      }
    }
    
    return insights;
  }

  async generatePatternPredictions(data) {
    const predictions = [];
    
    // Predict page type based on multiple signals
    if (data.patterns && data.heuristics) {
      const strongPatterns = this.identifyStrongPatterns(data.patterns);
      const heuristicSupport = data.heuristics.classificationConfidence;
      
      strongPatterns.forEach(pattern => {
        if (heuristicSupport[pattern.type] && heuristicSupport[pattern.type] > 0.7) {
          predictions.push({
            type: pattern.type,
            confidence: (pattern.confidence + heuristicSupport[pattern.type]) / 2,
            reasoning: ['Strong pattern match', 'Heuristic support', 'AI correlation']
          });
        }
      });
    }
    
    return predictions;
  }

  async generateIntelligentRecommendations(data) {
    const recommendations = [];
    
    // Content optimization recommendations
    if (data.semantic && data.semantic.contentQuality && data.semantic.contentQuality.score < 0.6) {
      recommendations.push({
        type: 'content_optimization',
        priority: 'high',
        title: 'Improve Content Quality',
        description: 'Content analysis suggests opportunities for improvement',
        suggestions: [
          'Add more descriptive headings',
          'Increase content depth and detail',
          'Include relevant images and media',
          'Improve internal linking structure'
        ]
      });
    }
    
    // Classification accuracy recommendations
    if (data.confidence && data.confidence.overall < 0.7) {
      recommendations.push({
        type: 'classification_accuracy',
        priority: 'medium',
        title: 'Enhance Page Classification Signals',
        description: 'Classification confidence could be improved',
        suggestions: [
          'Add more specific page type indicators',
          'Improve URL structure and naming',
          'Enhance meta tags and structured data',
          'Clarify page purpose and content focus'
        ]
      });
    }
    
    return recommendations;
  }

  async optimizeConfidence(data) {
    const optimization = {
      originalConfidence: data.confidence ? data.confidence.overall : 0,
      optimizedConfidence: 0,
      optimizations: []
    };
    
    let optimizedConfidence = optimization.originalConfidence;
    
    // Apply AI-based confidence optimizations
    if (data.heuristics && data.heuristics.patternConsistency && !data.heuristics.patternConsistency.hasConflicts) {
      optimizedConfidence += 0.1;
      optimization.optimizations.push('No conflicting patterns detected');
    }
    
    if (data.semantic && data.semantic.contentPurpose && data.semantic.contentPurpose.confidence > 0.8) {
      optimizedConfidence += 0.05;
      optimization.optimizations.push('High semantic coherence');
    }
    
    optimization.optimizedConfidence = Math.min(optimizedConfidence, 1);
    
    return optimization;
  }

  identifyStrongPatterns(patterns) {
    const strongPatterns = [];
    
    Object.entries(patterns).forEach(([category, typePatterns]) => {
      Object.entries(typePatterns).forEach(([type, data]) => {
        if (data.confidence > 0.7) {
          strongPatterns.push({ type, confidence: data.confidence, category });
        }
      });
    });
    
    return strongPatterns.sort((a, b) => b.confidence - a.confidence);
  }
}

/**
 * ============================================================================
 * MAIN ANALYZER CLASS
 * ============================================================================
 */

/**
 * Page Type Classifier - Combined Approach Implementation
 * Comprehensive page type classification with advanced AI analysis
 */
export class PageTypeClassifierModern extends BaseAnalyzer {
  constructor(options = {}) {
    super('PageTypeClassifierModern', options);
    
    this.name = 'PageTypeClassifierModern';
    this.category = 'page_type_classification';
    this.version = '2.0.0';
    
    // Initialize components
    this.structureAnalyzer = new ContentStructureAnalyzer(options.structure);
    this.patternEngine = new PatternRecognitionEngine(options.patterns);
    this.semanticEngine = new SemanticClassificationEngine(options.semantic);
    
    // Initialize heuristics
    this.contentHeuristics = new ContentIntelligenceHeuristics(options.contentIntelligence);
    this.contextHeuristics = new ContextUnderstandingHeuristics(options.contextUnderstanding);
    
    // Initialize rules
    this.classificationRules = new ClassificationRulesEngine(options.classificationRules);
    this.confidenceEngine = new ConfidenceScoringEngine(options.confidence);
    
    // Initialize AI enhancement
    this.semanticAI = new SemanticAnalysisAI(options.ai);
    
    console.log('🏷️ PageTypeClassifier (Modern) initialized with Combined Approach');
    console.log('📊 Implementation: #61 in modernization series');
  }

  /**
   * Get analyzer metadata
   */
  getMetadata() {
    return {
      name: this.name,
      version: this.version,
      category: this.category,
      description: 'Comprehensive page type classification using Combined Approach with AI enhancement',
      author: 'AI Assistant',
      
      // Implementation details
      implementation: {
        pattern: 'Combined Approach',
        number: 61,
        features: [
          'GPT-5 Style Modular Components',
          'Claude AI Enhanced Heuristics',
          'Advanced Rules Engine',
          'AI Enhancement Layer',
          'Configuration Management'
        ]
      },
      
      // Analysis capabilities
      capabilities: [
        'page_type_classification',
        'content_pattern_recognition',
        'semantic_analysis',
        'structure_analysis',
        'context_understanding',
        'confidence_scoring',
        'ai_enhanced_insights',
        'intelligent_recommendations'
      ],
      
      // Component information
      components: {
        analyzers: ['ContentStructureAnalyzer', 'PatternRecognitionEngine', 'SemanticClassificationEngine'],
        heuristics: ['ContentIntelligenceHeuristics', 'ContextUnderstandingHeuristics'],
        rules: ['ClassificationRulesEngine', 'ConfidenceScoringEngine'],
        ai: ['SemanticAnalysisAI']
      },
      
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Perform comprehensive page type classification
   */
  async analyze(context) {
    const startTime = Date.now();
    
    try {
      this.log('Starting comprehensive page type classification analysis', 'info');
      
      // Phase 1: Structure Analysis
      this.log('Phase 1: Analyzing content structure and organization', 'info');
      const structureData = await this.structureAnalyzer.analyzeStructure(context);
      
      // Phase 2: Pattern Recognition
      this.log('Phase 2: Recognizing content and URL patterns', 'info');
      const patternData = await this.patternEngine.recognizePatterns(context);
      
      // Phase 3: Semantic Classification
      this.log('Phase 3: Performing semantic content analysis', 'info');
      const semanticData = await this.semanticEngine.performSemanticAnalysis(
        context, structureData, patternData
      );
      
      // Phase 4: Heuristic Analysis
      this.log('Phase 4: Applying AI-enhanced heuristics', 'info');
      const contentIntelligence = await this.contentHeuristics.applyContentIntelligence(
        structureData, patternData, semanticData
      );
      const contextAnalysis = await this.contextHeuristics.analyzeContext(
        context, { structure: structureData, patterns: patternData, semantic: semanticData }
      );
      
      // Phase 5: Rules Application
      this.log('Phase 5: Applying classification rules', 'info');
      const classificationResults = this.classificationRules.applyClassificationRules(
        patternData, semanticData, contextAnalysis
      );
      const confidenceScores = this.confidenceEngine.calculateConfidenceScores(
        classificationResults, contentIntelligence
      );
      
      // Phase 6: AI Enhancement
      this.log('Phase 6: Generating AI-enhanced insights', 'info');
      const aiAnalysis = await this.semanticAI.performAIAnalysis({
        structure: structureData,
        patterns: patternData,
        semantic: semanticData,
        heuristics: contentIntelligence,
        context: contextAnalysis,
        classification: classificationResults,
        confidence: confidenceScores
      });
      
      // Calculate overall classification
      const finalClassification = this.determineFinalClassification(
        classificationResults, aiAnalysis, confidenceScores
      );
      
      const results = {
        success: true,
        data: {
          // Primary classification result
          classification: {
            primary: finalClassification.primary,
            confidence: finalClassification.confidence,
            alternatives: finalClassification.alternatives,
            reasoning: finalClassification.reasoning
          },
          
          // Detailed analysis results
          structureAnalysis: structureData,
          patternRecognition: patternData,
          semanticAnalysis: semanticData,
          
          // Heuristic analysis
          contentIntelligence,
          contextAnalysis,
          
          // Rules and confidence
          classificationRules: classificationResults,
          confidenceAssessment: confidenceScores,
          
          // AI insights
          aiInsights: aiAnalysis,
          
          // Overall assessment
          overallAssessment: {
            classificationScore: finalClassification.confidence * 100,
            reliability: confidenceScores.reliability,
            strengths: this.identifyStrengths(finalClassification, confidenceScores),
            improvements: this.identifyImprovements(finalClassification, confidenceScores),
            recommendations: aiAnalysis.intelligentRecommendations
          },
          
          // Implementation metadata
          implementation: {
            pattern: 'Combined Approach',
            number: 61,
            modernization: 'complete',
            analysisType: 'comprehensive',
            componentsCovered: [
              'structure_analysis', 'pattern_recognition', 'semantic_classification',
              'content_intelligence', 'context_understanding', 'ai_enhancement'
            ]
          }
        },
        
        metadata: this.getMetadata(),
        performance: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          memoryUsage: process.memoryUsage?.() || 'unavailable'
        }
      };
      
      this.log(`Page type classification completed in ${results.performance.executionTime}ms`, 'info');
      this.log(`Classified as: ${finalClassification.primary} (${Math.round(finalClassification.confidence * 100)}% confidence)`, 'info');
      
      return results;
      
    } catch (error) {
      return this.handleError(error, 'page_type_classification_analysis');
    }
  }

  /**
   * Determine final classification from all analysis results
   */
  determineFinalClassification(rulesResults, aiAnalysis, confidenceScores) {
    let primary = 'unknown';
    let confidence = 0;
    let reasoning = [];
    let alternatives = [];
    
    // Start with rules engine results
    if (rulesResults.primaryClassification) {
      primary = rulesResults.primaryClassification.classification;
      confidence = rulesResults.primaryClassification.confidence;
      reasoning = rulesResults.primaryClassification.reasoning;
      alternatives = rulesResults.alternatives.map(alt => ({
        type: alt.classification,
        confidence: alt.confidence,
        source: 'rules'
      }));
    }
    
    // Enhance with AI predictions
    if (aiAnalysis.patternPredictions && aiAnalysis.patternPredictions.length > 0) {
      const topAIPrediction = aiAnalysis.patternPredictions[0];
      
      // If AI prediction has higher confidence, use it
      if (topAIPrediction.confidence > confidence) {
        alternatives.unshift({ type: primary, confidence, source: 'rules' });
        primary = topAIPrediction.type;
        confidence = topAIPrediction.confidence;
        reasoning = [...reasoning, ...topAIPrediction.reasoning];
      }
    }
    
    // Apply confidence optimization
    if (aiAnalysis.confidenceOptimization) {
      confidence = Math.max(confidence, aiAnalysis.confidenceOptimization.optimizedConfidence);
    }
    
    return {
      primary,
      confidence: Math.min(confidence, 1),
      reasoning,
      alternatives: alternatives.slice(0, 3) // Limit to top 3 alternatives
    };
  }

  /**
   * Identify classification strengths
   */
  identifyStrengths(classification, confidence) {
    const strengths = [];
    
    if (classification.confidence >= 0.8) {
      strengths.push('High classification confidence');
    }
    
    if (confidence.factors.patternConsistency >= 0.7) {
      strengths.push('Consistent pattern signals');
    }
    
    if (confidence.factors.semanticAlignment >= 0.7) {
      strengths.push('Clear semantic indicators');
    }
    
    if (confidence.reliability === 'high') {
      strengths.push('Reliable classification data');
    }
    
    return strengths;
  }

  /**
   * Identify areas for improvement
   */
  identifyImprovements(classification, confidence) {
    const improvements = [];
    
    if (classification.confidence < 0.6) {
      improvements.push('Low classification confidence - consider page content review');
    }
    
    if (confidence.factors.patternConsistency < 0.5) {
      improvements.push('Conflicting pattern signals detected');
    }
    
    if (confidence.factors.contextualSupport < 0.5) {
      improvements.push('Limited contextual support for classification');
    }
    
    if (confidence.reliability === 'low' || confidence.reliability === 'very_low') {
      improvements.push('Classification reliability could be improved');
    }
    
    return improvements;
  }
}

export default PageTypeClassifierModern;
