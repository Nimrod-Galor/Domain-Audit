/**
 * Anchor Text Detector - GPT-5 Style Modular Detection
 * 
 * Advanced anchor text analysis with SEO optimization insights,
 * keyword distribution analysis, and anchor text quality assessment.
 */

export class AnchorTextDetector {
  constructor(config = {}) {
    this.config = {
      enableKeywordAnalysis: config.enableKeywordAnalysis !== false,
      enableDistributionAnalysis: config.enableDistributionAnalysis !== false,
      enableQualityAnalysis: config.enableQualityAnalysis !== false,
      includeInternalLinks: config.includeInternalLinks !== false,
      includeExternalLinks: config.includeExternalLinks !== false,
      minAnchorLength: config.minAnchorLength || 1,
      maxAnchorLength: config.maxAnchorLength || 200,
      ...config
    };

    this.anchorPatterns = {
      generic: /^(click here|read more|more|learn more|see more|continue|next|previous|here|this|that|link|website|page|download|view|show|details|info)$/i,
      branded: /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*(\s+(Inc|LLC|Corp|Ltd|Company))?$/,
      exact: /^[a-z0-9\s]{2,50}$/i,
      partial: /\b(buy|purchase|shop|order|download|learn|discover|explore)\b/i,
      commercial: /\b(buy|shop|purchase|order|sale|discount|deal|offer|price|cheap|free)\b/i,
      navigational: /\b(home|about|contact|services|products|blog|news|help|support)\b/i
    };

    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
    ]);
  }

  async detect(document, context = {}) {
    try {
      const analysis = {
        anchors: await this.extractAnchorTexts(document, context),
        distribution: await this.analyzeDistribution(document, context),
        keywords: await this.analyzeKeywords(document, context),
        quality: await this.analyzeQuality(document, context),
        optimization: await this.analyzeOptimization(document, context),
        patterns: await this.analyzePatterns(document, context),
        count: 0,
        score: 0,
        recommendations: []
      };

      analysis.count = analysis.anchors.length;
      analysis.score = this.calculateAnchorScore(analysis);
      analysis.recommendations = this.generateRecommendations(analysis);

      return {
        category: 'Anchor Text Detection',
        subcategory: 'Anchor Text Analysis',
        ...analysis,
        metadata: {
          detector: 'AnchorTextDetector',
          version: '2.0.0',
          timestamp: new Date().toISOString(),
          processingTime: context.processingTime || 0
        }
      };
    } catch (error) {
      return this.handleDetectionError(error);
    }
  }

  async extractAnchorTexts(document, context) {
    const anchors = [];
    const anchorElements = document.querySelectorAll('a[href]');
    const domain = context.url ? new URL(context.url).hostname : null;

    anchorElements.forEach((anchor, index) => {
      const href = anchor.getAttribute('href');
      if (!href) return;

      const anchorInfo = this.analyzeAnchorElement(anchor, href, domain, index);
      
      // Filter based on configuration
      if (!this.shouldIncludeAnchor(anchorInfo)) return;

      anchors.push(anchorInfo);
    });

    return anchors;
  }

  analyzeAnchorElement(anchor, href, domain, index) {
    const text = anchor.textContent?.trim() || '';
    const title = anchor.getAttribute('title') || '';
    const rel = anchor.getAttribute('rel') || '';
    
    const anchorInfo = {
      text,
      href,
      title,
      rel,
      length: text.length,
      wordCount: this.countWords(text),
      position: index,
      isInternal: this.isInternalLink(href, domain),
      isExternal: this.isExternalLink(href, domain),
      isEmpty: text.length === 0,
      context: this.getAnchorContext(anchor),
      classification: this.classifyAnchorText(text),
      keywords: this.extractKeywords(text),
      quality: this.assessAnchorQuality(text, title, rel),
      density: this.calculateKeywordDensity(text)
    };

    return anchorInfo;
  }

  async analyzeDistribution(document, context) {
    if (!this.config.enableDistributionAnalysis) {
      return { enabled: false };
    }

    const distribution = {
      byType: {},
      byLength: {},
      byWordCount: {},
      byPosition: {},
      bySection: {},
      internal: { total: 0, types: {} },
      external: { total: 0, types: {} }
    };

    const anchors = await this.extractAnchorTexts(document, context);

    anchors.forEach(anchor => {
      // Type distribution
      const type = anchor.classification.primary;
      distribution.byType[type] = (distribution.byType[type] || 0) + 1;

      // Length distribution
      const lengthRange = this.getLengthRange(anchor.length);
      distribution.byLength[lengthRange] = (distribution.byLength[lengthRange] || 0) + 1;

      // Word count distribution
      const wordRange = this.getWordCountRange(anchor.wordCount);
      distribution.byWordCount[wordRange] = (distribution.byWordCount[wordRange] || 0) + 1;

      // Position distribution
      const positionRange = this.getPositionRange(anchor.position, anchors.length);
      distribution.byPosition[positionRange] = (distribution.byPosition[positionRange] || 0) + 1;

      // Section distribution
      const section = anchor.context.section;
      distribution.bySection[section] = (distribution.bySection[section] || 0) + 1;

      // Internal/External distribution
      if (anchor.isInternal) {
        distribution.internal.total++;
        distribution.internal.types[type] = (distribution.internal.types[type] || 0) + 1;
      } else if (anchor.isExternal) {
        distribution.external.total++;
        distribution.external.types[type] = (distribution.external.types[type] || 0) + 1;
      }
    });

    // Calculate percentages
    const total = anchors.length;
    this.addPercentages(distribution.byType, total);
    this.addPercentages(distribution.byLength, total);
    this.addPercentages(distribution.byWordCount, total);
    this.addPercentages(distribution.byPosition, total);
    this.addPercentages(distribution.bySection, total);

    return distribution;
  }

  async analyzeKeywords(document, context) {
    if (!this.config.enableKeywordAnalysis) {
      return { enabled: false };
    }

    const keywords = {
      frequency: {},
      density: {},
      phrases: {},
      unique: 0,
      total: 0,
      topKeywords: [],
      topPhrases: []
    };

    const anchors = await this.extractAnchorTexts(document, context);

    anchors.forEach(anchor => {
      // Single keywords
      anchor.keywords.forEach(keyword => {
        keywords.frequency[keyword] = (keywords.frequency[keyword] || 0) + 1;
        keywords.total++;
      });

      // Keyword phrases (2-3 words)
      const phrases = this.extractPhrases(anchor.text);
      phrases.forEach(phrase => {
        keywords.phrases[phrase] = (keywords.phrases[phrase] || 0) + 1;
      });
    });

    keywords.unique = Object.keys(keywords.frequency).length;

    // Calculate density
    Object.keys(keywords.frequency).forEach(keyword => {
      keywords.density[keyword] = (keywords.frequency[keyword] / keywords.total) * 100;
    });

    // Top keywords and phrases
    keywords.topKeywords = this.getTopItems(keywords.frequency, 10);
    keywords.topPhrases = this.getTopItems(keywords.phrases, 10);

    return keywords;
  }

  async analyzeQuality(document, context) {
    if (!this.config.enableQualityAnalysis) {
      return { enabled: false };
    }

    const quality = {
      overall: 0,
      metrics: {
        specificity: 0,
        relevance: 0,
        readability: 0,
        uniqueness: 0,
        optimization: 0
      },
      issues: [],
      strengths: []
    };

    const anchors = await this.extractAnchorTexts(document, context);

    if (anchors.length === 0) {
      return { ...quality, overall: 0 };
    }

    // Calculate individual metrics
    quality.metrics.specificity = this.calculateSpecificity(anchors);
    quality.metrics.relevance = this.calculateRelevance(anchors, context);
    quality.metrics.readability = this.calculateReadability(anchors);
    quality.metrics.uniqueness = this.calculateUniqueness(anchors);
    quality.metrics.optimization = this.calculateOptimization(anchors);

    // Overall quality score
    quality.overall = Object.values(quality.metrics).reduce((sum, score) => sum + score, 0) / 5;

    // Identify issues and strengths
    quality.issues = this.identifyQualityIssues(quality.metrics, anchors);
    quality.strengths = this.identifyQualityStrengths(quality.metrics, anchors);

    return quality;
  }

  async analyzeOptimization(document, context) {
    const optimization = {
      seo: this.analyzeSEOOptimization(document, context),
      accessibility: this.analyzeAccessibilityOptimization(document, context),
      usability: this.analyzeUsabilityOptimization(document, context),
      performance: this.analyzePerformanceOptimization(document, context)
    };

    return optimization;
  }

  async analyzePatterns(document, context) {
    const patterns = {
      overOptimization: this.detectOverOptimization(document, context),
      brandMentions: this.detectBrandMentions(document, context),
      callToAction: this.detectCallToAction(document, context),
      navigation: this.detectNavigationPatterns(document, context),
      commercial: this.detectCommercialPatterns(document, context)
    };

    return patterns;
  }

  // Classification methods
  classifyAnchorText(text) {
    if (!text || text.trim().length === 0) {
      return { primary: 'empty', secondary: [], confidence: 100 };
    }

    const classifications = [];
    const normalizedText = text.toLowerCase().trim();

    // Check each pattern
    if (this.anchorPatterns.generic.test(normalizedText)) {
      classifications.push({ type: 'generic', confidence: 90 });
    }
    if (this.anchorPatterns.branded.test(text)) {
      classifications.push({ type: 'branded', confidence: 80 });
    }
    if (this.anchorPatterns.commercial.test(normalizedText)) {
      classifications.push({ type: 'commercial', confidence: 75 });
    }
    if (this.anchorPatterns.navigational.test(normalizedText)) {
      classifications.push({ type: 'navigational', confidence: 70 });
    }
    if (this.anchorPatterns.exact.test(normalizedText)) {
      classifications.push({ type: 'exact', confidence: 60 });
    }

    // Additional classifications
    if (this.isUrlAnchor(text)) {
      classifications.push({ type: 'url', confidence: 95 });
    }
    if (this.isImageAlt(text)) {
      classifications.push({ type: 'image', confidence: 85 });
    }
    if (this.isLongTail(text)) {
      classifications.push({ type: 'long-tail', confidence: 65 });
    }

    // Default to descriptive if no specific pattern matched
    if (classifications.length === 0) {
      classifications.push({ type: 'descriptive', confidence: 50 });
    }

    // Sort by confidence and return primary with secondaries
    classifications.sort((a, b) => b.confidence - a.confidence);
    
    return {
      primary: classifications[0].type,
      secondary: classifications.slice(1).map(c => c.type),
      confidence: classifications[0].confidence
    };
  }

  extractKeywords(text) {
    if (!text) return [];

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => 
        word.length > 2 && 
        !this.stopWords.has(word) &&
        !/^\d+$/.test(word)
      );

    return [...new Set(words)];
  }

  extractPhrases(text) {
    if (!text) return [];

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);

    const phrases = [];

    // Extract 2-word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = words.slice(i, i + 2).join(' ');
      if (!this.isStopWordPhrase(phrase)) {
        phrases.push(phrase);
      }
    }

    // Extract 3-word phrases
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = words.slice(i, i + 3).join(' ');
      if (!this.isStopWordPhrase(phrase)) {
        phrases.push(phrase);
      }
    }

    return [...new Set(phrases)];
  }

  assessAnchorQuality(text, title, rel) {
    const quality = {
      score: 50,
      factors: [],
      issues: []
    };

    // Text quality factors
    if (!text || text.trim().length === 0) {
      quality.score -= 30;
      quality.issues.push('Empty anchor text');
    } else {
      // Length factors
      if (text.length < 3) {
        quality.score -= 20;
        quality.issues.push('Very short anchor text');
      } else if (text.length > 100) {
        quality.score -= 15;
        quality.issues.push('Very long anchor text');
      } else if (text.length >= 10 && text.length <= 60) {
        quality.score += 15;
        quality.factors.push('Optimal anchor text length');
      }

      // Generic text penalty
      if (this.anchorPatterns.generic.test(text.toLowerCase())) {
        quality.score -= 25;
        quality.issues.push('Generic anchor text');
      } else {
        quality.score += 10;
        quality.factors.push('Specific anchor text');
      }

      // Keyword richness
      const keywords = this.extractKeywords(text);
      if (keywords.length > 0) {
        quality.score += keywords.length * 5;
        quality.factors.push(`Contains ${keywords.length} keywords`);
      }

      // Readability
      if (this.isReadable(text)) {
        quality.score += 10;
        quality.factors.push('Readable anchor text');
      }
    }

    // Title attribute
    if (title && title.trim().length > 0) {
      quality.score += 5;
      quality.factors.push('Has title attribute');
    }

    // Rel attribute analysis
    if (rel.includes('nofollow')) {
      quality.factors.push('Has nofollow attribute');
    }

    return {
      score: Math.max(0, Math.min(100, quality.score)),
      factors: quality.factors,
      issues: quality.issues
    };
  }

  calculateKeywordDensity(text) {
    if (!text) return 0;

    const words = text.toLowerCase().split(/\s+/);
    const totalWords = words.length;
    const keywordCount = words.filter(word => 
      !this.stopWords.has(word) && word.length > 2
    ).length;

    return totalWords > 0 ? (keywordCount / totalWords) * 100 : 0;
  }

  // Quality analysis methods
  calculateSpecificity(anchors) {
    if (anchors.length === 0) return 0;

    const genericCount = anchors.filter(anchor => 
      anchor.classification.primary === 'generic'
    ).length;

    return ((anchors.length - genericCount) / anchors.length) * 100;
  }

  calculateRelevance(anchors, context) {
    if (anchors.length === 0) return 0;

    // Simplified relevance calculation
    const relevantCount = anchors.filter(anchor => 
      anchor.classification.primary !== 'generic' &&
      anchor.classification.primary !== 'empty' &&
      anchor.wordCount >= 2
    ).length;

    return (relevantCount / anchors.length) * 100;
  }

  calculateReadability(anchors) {
    if (anchors.length === 0) return 0;

    const readableCount = anchors.filter(anchor => 
      this.isReadable(anchor.text)
    ).length;

    return (readableCount / anchors.length) * 100;
  }

  calculateUniqueness(anchors) {
    if (anchors.length === 0) return 0;

    const uniqueTexts = new Set(anchors.map(anchor => anchor.text.toLowerCase()));
    return (uniqueTexts.size / anchors.length) * 100;
  }

  calculateOptimization(anchors) {
    if (anchors.length === 0) return 0;

    let optimizationScore = 0;
    let totalScore = 0;

    anchors.forEach(anchor => {
      totalScore += 100;
      optimizationScore += anchor.quality.score;
    });

    return totalScore > 0 ? (optimizationScore / totalScore) * 100 : 0;
  }

  // SEO Optimization analysis
  analyzeSEOOptimization(document, context) {
    const anchors = document.querySelectorAll('a[href]');
    const analysis = {
      keywordRich: 0,
      branded: 0,
      generic: 0,
      overOptimized: 0,
      diversified: true
    };

    const anchorTexts = Array.from(anchors).map(a => a.textContent?.trim().toLowerCase());
    const textFrequency = {};

    anchorTexts.forEach(text => {
      if (text) {
        textFrequency[text] = (textFrequency[text] || 0) + 1;
        
        if (this.anchorPatterns.generic.test(text)) {
          analysis.generic++;
        } else if (this.anchorPatterns.branded.test(text)) {
          analysis.branded++;
        } else {
          analysis.keywordRich++;
        }
      }
    });

    // Check for over-optimization
    Object.values(textFrequency).forEach(frequency => {
      if (frequency > 5) {
        analysis.overOptimized++;
      }
    });

    analysis.diversified = Object.keys(textFrequency).length > anchors.length * 0.7;

    return analysis;
  }

  analyzeAccessibilityOptimization(document, context) {
    const links = document.querySelectorAll('a[href]');
    const analysis = {
      withTitle: 0,
      withAltText: 0,
      descriptive: 0,
      accessible: 0
    };

    links.forEach(link => {
      if (link.getAttribute('title')) analysis.withTitle++;
      
      const img = link.querySelector('img');
      if (img && img.getAttribute('alt')) analysis.withAltText++;
      
      const text = link.textContent?.trim();
      if (text && text.length > 0 && !this.anchorPatterns.generic.test(text)) {
        analysis.descriptive++;
      }

      if (this.isAccessibleAnchor(link)) {
        analysis.accessible++;
      }
    });

    return analysis;
  }

  analyzeUsabilityOptimization(document, context) {
    const links = document.querySelectorAll('a[href]');
    const analysis = {
      clearIntent: 0,
      actionOriented: 0,
      contextual: 0,
      scannable: 0
    };

    links.forEach(link => {
      const text = link.textContent?.trim().toLowerCase();
      if (!text) return;

      if (this.hasClearIntent(text)) analysis.clearIntent++;
      if (this.isActionOriented(text)) analysis.actionOriented++;
      if (this.isContextual(link)) analysis.contextual++;
      if (this.isScannable(text)) analysis.scannable++;
    });

    return analysis;
  }

  analyzePerformanceOptimization(document, context) {
    const links = document.querySelectorAll('a[href]');
    const analysis = {
      optimizedLength: 0,
      efficientStructure: 0,
      loadImpact: 'low'
    };

    links.forEach(link => {
      const text = link.textContent?.trim();
      if (text && text.length >= 10 && text.length <= 60) {
        analysis.optimizedLength++;
      }

      if (this.hasEfficientStructure(link)) {
        analysis.efficientStructure++;
      }
    });

    // Simple load impact assessment
    if (links.length > 200) {
      analysis.loadImpact = 'high';
    } else if (links.length > 100) {
      analysis.loadImpact = 'medium';
    }

    return analysis;
  }

  // Pattern detection methods
  detectOverOptimization(document, context) {
    const anchors = document.querySelectorAll('a[href]');
    const textFrequency = {};
    let overOptimized = 0;

    anchors.forEach(anchor => {
      const text = anchor.textContent?.trim().toLowerCase();
      if (text) {
        textFrequency[text] = (textFrequency[text] || 0) + 1;
      }
    });

    Object.entries(textFrequency).forEach(([text, frequency]) => {
      if (frequency > 3 && !this.anchorPatterns.navigational.test(text)) {
        overOptimized += frequency - 3;
      }
    });

    return {
      detected: overOptimized > 0,
      count: overOptimized,
      patterns: Object.entries(textFrequency)
        .filter(([text, freq]) => freq > 3)
        .map(([text, freq]) => ({ text, frequency: freq }))
    };
  }

  detectBrandMentions(document, context) {
    const anchors = document.querySelectorAll('a[href]');
    const brandMentions = [];

    anchors.forEach(anchor => {
      const text = anchor.textContent?.trim();
      if (text && this.anchorPatterns.branded.test(text)) {
        brandMentions.push({
          text,
          href: anchor.getAttribute('href'),
          context: this.getAnchorContext(anchor)
        });
      }
    });

    return {
      detected: brandMentions.length > 0,
      count: brandMentions.length,
      mentions: brandMentions
    };
  }

  detectCallToAction(document, context) {
    const ctaPatterns = /\b(buy|shop|download|subscribe|register|sign up|get|start|try|learn|discover|explore|contact|call|email)\b/i;
    const anchors = document.querySelectorAll('a[href]');
    const ctaLinks = [];

    anchors.forEach(anchor => {
      const text = anchor.textContent?.trim();
      if (text && ctaPatterns.test(text)) {
        ctaLinks.push({
          text,
          href: anchor.getAttribute('href'),
          type: this.categorizeCTA(text)
        });
      }
    });

    return {
      detected: ctaLinks.length > 0,
      count: ctaLinks.length,
      links: ctaLinks
    };
  }

  detectNavigationPatterns(document, context) {
    const navAnchors = document.querySelectorAll('nav a, .navigation a, .nav a');
    const patterns = {
      primary: [],
      secondary: [],
      breadcrumb: [],
      pagination: []
    };

    navAnchors.forEach(anchor => {
      const text = anchor.textContent?.trim();
      const context = this.getAnchorContext(anchor);
      
      if (this.isPrimaryNavigation(anchor)) {
        patterns.primary.push(text);
      } else if (this.isSecondaryNavigation(anchor)) {
        patterns.secondary.push(text);
      } else if (this.isBreadcrumb(anchor)) {
        patterns.breadcrumb.push(text);
      } else if (this.isPagination(anchor)) {
        patterns.pagination.push(text);
      }
    });

    return patterns;
  }

  detectCommercialPatterns(document, context) {
    const anchors = document.querySelectorAll('a[href]');
    const commercial = [];

    anchors.forEach(anchor => {
      const text = anchor.textContent?.trim().toLowerCase();
      if (text && this.anchorPatterns.commercial.test(text)) {
        commercial.push({
          text: anchor.textContent?.trim(),
          href: anchor.getAttribute('href'),
          intent: this.categorizeCommercialIntent(text)
        });
      }
    });

    return {
      detected: commercial.length > 0,
      count: commercial.length,
      links: commercial
    };
  }

  // Utility methods
  shouldIncludeAnchor(anchorInfo) {
    if (anchorInfo.length < this.config.minAnchorLength) return false;
    if (anchorInfo.length > this.config.maxAnchorLength) return false;
    
    if (!this.config.includeInternalLinks && anchorInfo.isInternal) return false;
    if (!this.config.includeExternalLinks && anchorInfo.isExternal) return false;

    return true;
  }

  isInternalLink(href, domain) {
    if (!href || !domain) return false;
    
    if (href.startsWith('/') || href.startsWith('#')) return true;
    
    try {
      const url = new URL(href);
      return url.hostname === domain || url.hostname.endsWith('.' + domain);
    } catch (e) {
      return false;
    }
  }

  isExternalLink(href, domain) {
    if (!href || !domain) return false;
    
    if (!href.startsWith('http')) return false;
    
    try {
      const url = new URL(href);
      return url.hostname !== domain && !url.hostname.endsWith('.' + domain);
    } catch (e) {
      return false;
    }
  }

  getAnchorContext(anchor) {
    return {
      element: anchor,
      parent: anchor.parentElement?.tagName.toLowerCase(),
      section: this.identifySection(anchor),
      nearbyText: this.getNearbyText(anchor),
      isInNavigation: this.isInNavigation(anchor),
      isInContent: this.isInContent(anchor),
      isInFooter: this.isInFooter(anchor)
    };
  }

  countWords(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  getLengthRange(length) {
    if (length === 0) return 'empty';
    if (length <= 10) return 'short';
    if (length <= 30) return 'medium';
    if (length <= 60) return 'long';
    return 'very-long';
  }

  getWordCountRange(wordCount) {
    if (wordCount === 0) return 'empty';
    if (wordCount === 1) return 'single';
    if (wordCount <= 3) return 'short';
    if (wordCount <= 6) return 'medium';
    return 'long';
  }

  getPositionRange(position, total) {
    const percentage = (position / total) * 100;
    if (percentage <= 25) return 'early';
    if (percentage <= 50) return 'middle-early';
    if (percentage <= 75) return 'middle-late';
    return 'late';
  }

  addPercentages(distribution, total) {
    Object.keys(distribution).forEach(key => {
      const count = distribution[key];
      distribution[key] = {
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      };
    });
  }

  getTopItems(frequency, limit) {
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([item, count]) => ({ item, count }));
  }

  isUrlAnchor(text) {
    return /^https?:\/\//.test(text) || /^www\./.test(text);
  }

  isImageAlt(text) {
    return /\.(jpg|jpeg|png|gif|svg|webp|bmp)$/i.test(text);
  }

  isLongTail(text) {
    return text && text.split(/\s+/).length >= 4;
  }

  isStopWordPhrase(phrase) {
    const words = phrase.split(/\s+/);
    return words.every(word => this.stopWords.has(word));
  }

  isReadable(text) {
    if (!text) return false;
    
    // Check for reasonable length
    if (text.length < 3 || text.length > 100) return false;
    
    // Check for meaningful content
    if (/^[A-Z\s]+$/.test(text) && text.length > 20) return false; // All caps
    if (/^[0-9\s]+$/.test(text)) return false; // Only numbers
    
    return true;
  }

  identifyQualityIssues(metrics, anchors) {
    const issues = [];
    
    if (metrics.specificity < 60) {
      issues.push('High percentage of generic anchor text');
    }
    if (metrics.uniqueness < 70) {
      issues.push('Many duplicate anchor texts');
    }
    if (metrics.readability < 80) {
      issues.push('Some anchor texts have readability issues');
    }
    
    return issues;
  }

  identifyQualityStrengths(metrics, anchors) {
    const strengths = [];
    
    if (metrics.specificity > 80) {
      strengths.push('Good use of specific anchor text');
    }
    if (metrics.uniqueness > 85) {
      strengths.push('High anchor text diversity');
    }
    if (metrics.optimization > 75) {
      strengths.push('Well-optimized anchor texts');
    }
    
    return strengths;
  }

  calculateAnchorScore(analysis) {
    let score = 50; // Base score

    // Quality factor
    if (analysis.quality.enabled !== false) {
      score += (analysis.quality.overall - 50) * 0.4;
    }

    // Distribution factor
    if (analysis.distribution.enabled !== false) {
      const genericPercentage = analysis.distribution.byType?.generic?.percentage || 0;
      if (genericPercentage < 20) score += 20;
      else if (genericPercentage > 50) score -= 25;
    }

    // Keyword factor
    if (analysis.keywords.enabled !== false && analysis.keywords.unique > 0) {
      score += Math.min(15, analysis.keywords.unique);
    }

    return Math.max(0, Math.min(100, score));
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    // Generic anchor text
    if (analysis.distribution.enabled !== false) {
      const genericPercentage = analysis.distribution.byType?.generic?.percentage || 0;
      if (genericPercentage > 30) {
        recommendations.push({
          type: 'generic-anchor',
          priority: 'high',
          category: 'Anchor Text Quality',
          issue: 'High percentage of generic anchor text',
          recommendation: 'Replace generic anchor text with descriptive, keyword-rich alternatives',
          impact: 'high'
        });
      }
    }

    // Quality issues
    if (analysis.quality.enabled !== false && analysis.quality.overall < 60) {
      recommendations.push({
        type: 'anchor-quality',
        priority: 'medium',
        category: 'Content Quality',
        issue: 'Overall anchor text quality is below optimal',
        recommendation: 'Improve anchor text specificity and readability',
        impact: 'medium'
      });
    }

    // Uniqueness issues
    if (analysis.quality.enabled !== false && analysis.quality.metrics.uniqueness < 70) {
      recommendations.push({
        type: 'anchor-diversity',
        priority: 'medium',
        category: 'Content Diversity',
        issue: 'Low anchor text diversity detected',
        recommendation: 'Increase variety in anchor text to avoid over-optimization',
        impact: 'medium'
      });
    }

    return recommendations;
  }

  // Helper methods for pattern detection
  isAccessibleAnchor(link) {
    const text = link.textContent?.trim();
    const title = link.getAttribute('title');
    const ariaLabel = link.getAttribute('aria-label');
    
    return (text && text.length > 0) || title || ariaLabel;
  }

  hasClearIntent(text) {
    return /\b(learn|discover|explore|find|get|download|buy|contact|read|view|see)\b/i.test(text);
  }

  isActionOriented(text) {
    return /\b(click|download|buy|subscribe|register|contact|call|email|start|try)\b/i.test(text);
  }

  isContextual(link) {
    const nearbyText = this.getNearbyText(link);
    return nearbyText && nearbyText.length > 20;
  }

  isScannable(text) {
    return text.length >= 10 && text.length <= 60 && /^[A-Za-z\s\-]+$/.test(text);
  }

  hasEfficientStructure(link) {
    const text = link.textContent?.trim();
    return text && text.length <= 100 && !link.querySelector('*');
  }

  categorizeCTA(text) {
    text = text.toLowerCase();
    if (/\b(buy|shop|purchase|order)\b/.test(text)) return 'purchase';
    if (/\b(download|get)\b/.test(text)) return 'download';
    if (/\b(subscribe|register|sign up)\b/.test(text)) return 'signup';
    if (/\b(contact|call|email)\b/.test(text)) return 'contact';
    if (/\b(learn|discover|explore)\b/.test(text)) return 'informational';
    return 'other';
  }

  categorizeCommercialIntent(text) {
    if (/\b(buy|purchase|order)\b/.test(text)) return 'transactional';
    if (/\b(price|cost|cheap|deal|discount)\b/.test(text)) return 'commercial';
    if (/\b(review|compare|best)\b/.test(text)) return 'investigational';
    return 'other';
  }

  isPrimaryNavigation(anchor) {
    let current = anchor.parentElement;
    while (current) {
      const className = current.className?.toLowerCase() || '';
      if (className.includes('primary') || className.includes('main-nav')) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  isSecondaryNavigation(anchor) {
    let current = anchor.parentElement;
    while (current) {
      const className = current.className?.toLowerCase() || '';
      if (className.includes('secondary') || className.includes('sub-nav')) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  isBreadcrumb(anchor) {
    let current = anchor.parentElement;
    while (current) {
      const className = current.className?.toLowerCase() || '';
      if (className.includes('breadcrumb') || className.includes('crumb')) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  isPagination(anchor) {
    let current = anchor.parentElement;
    while (current) {
      const className = current.className?.toLowerCase() || '';
      if (className.includes('pagination') || className.includes('pager')) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  identifySection(element) {
    const sections = ['header', 'nav', 'main', 'article', 'aside', 'footer'];
    
    let current = element;
    while (current && current.tagName) {
      const tag = current.tagName.toLowerCase();
      if (sections.includes(tag)) {
        return tag;
      }
      current = current.parentElement;
    }
    
    return 'unknown';
  }

  getNearbyText(element) {
    const parent = element.parentElement;
    if (!parent) return '';
    
    const text = parent.textContent || '';
    const linkText = element.textContent || '';
    const beforeText = text.substring(0, text.indexOf(linkText));
    const afterText = text.substring(text.indexOf(linkText) + linkText.length);
    
    return (beforeText.substring(-30) + ' ' + afterText.substring(0, 30)).trim();
  }

  isInNavigation(element) {
    let current = element;
    while (current && current.tagName) {
      if (current.tagName.toLowerCase() === 'nav' || 
          current.className?.toLowerCase().includes('nav')) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  isInContent(element) {
    let current = element;
    while (current && current.tagName) {
      const tag = current.tagName.toLowerCase();
      if (['main', 'article', 'section'].includes(tag)) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  isInFooter(element) {
    let current = element;
    while (current && current.tagName) {
      if (current.tagName.toLowerCase() === 'footer') {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  handleDetectionError(error) {
    return {
      category: 'Anchor Text Detection',
      subcategory: 'Detection Error',
      error: error.message,
      anchors: [],
      count: 0,
      score: 0,
      recommendations: [{
        type: 'error',
        priority: 'high',
        issue: 'Anchor text detection failed',
        recommendation: 'Review anchor text structure and try again'
      }]
    };
  }
}
