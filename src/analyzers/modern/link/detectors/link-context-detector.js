/**
 * Link Context Detector - GPT-5 Style Modular Detection
 * 
 * Advanced contextual link analysis with semantic understanding,
 * relevance assessment, and contextual relationship mapping.
 */

export class LinkContextDetector {
  constructor(config = {}) {
    this.config = {
      enableSemanticAnalysis: config.enableSemanticAnalysis !== false,
      enableRelevanceAnalysis: config.enableRelevanceAnalysis !== false,
      enableContentAnalysis: config.enableContentAnalysis !== false,
      enableProximityAnalysis: config.enableProximityAnalysis !== false,
      contextWindow: config.contextWindow || 100,
      semanticThreshold: config.semanticThreshold || 0.7,
      proximityRadius: config.proximityRadius || 200,
      ...config
    };

    this.contextTypes = {
      semantic: ['topical', 'thematic', 'categorical'],
      structural: ['hierarchical', 'navigational', 'functional'],
      temporal: ['chronological', 'sequential', 'progressive'],
      spatial: ['proximity', 'layout', 'visual']
    };

    this.semanticPatterns = {
      related: /\b(related|similar|also|see also|more about|further reading)\b/i,
      continuation: /\b(continue|next|more|read more|learn more)\b/i,
      reference: /\b(reference|source|citation|link|see)\b/i,
      navigation: /\b(home|back|previous|next|menu|navigation)\b/i,
      action: /\b(buy|download|subscribe|contact|register|sign up)\b/i
    };

    this.relevanceFactors = {
      textual: ['keyword_overlap', 'semantic_similarity', 'topic_alignment'],
      structural: ['heading_proximity', 'section_relevance', 'list_context'],
      behavioral: ['user_flow', 'navigation_pattern', 'interaction_context']
    };
  }

  async detect(document, context = {}) {
    try {
      const analysis = {
        links: await this.analyzeAllLinkContexts(document, context),
        semantic: await this.analyzeSemanticContext(document, context),
        relevance: await this.analyzeRelevance(document, context),
        content: await this.analyzeContentContext(document, context),
        proximity: await this.analyzeProximity(document, context),
        relationships: await this.analyzeRelationships(document, context),
        patterns: await this.analyzeContextPatterns(document, context),
        count: 0,
        score: 0,
        recommendations: []
      };

      analysis.count = analysis.links.length;
      analysis.score = this.calculateContextScore(analysis);
      analysis.recommendations = this.generateRecommendations(analysis);

      return {
        category: 'Link Context Detection',
        subcategory: 'Contextual Analysis',
        ...analysis,
        metadata: {
          detector: 'LinkContextDetector',
          version: '2.0.0',
          timestamp: new Date().toISOString(),
          processingTime: context.processingTime || 0
        }
      };
    } catch (error) {
      return this.handleDetectionError(error);
    }
  }

  async analyzeAllLinkContexts(document, context) {
    const links = [];
    const linkElements = document.querySelectorAll('a[href]');
    const baseUrl = context.url ? new URL(context.url) : null;

    for (let i = 0; i < linkElements.length; i++) {
      const linkElement = linkElements[i];
      const href = linkElement.getAttribute('href');
      
      if (!href) continue;

      const linkContext = await this.analyzeLinkContext(linkElement, href, baseUrl, i, document);
      links.push(linkContext);
    }

    return links;
  }

  async analyzeLinkContext(linkElement, href, baseUrl, index, document) {
    const linkInfo = {
      href,
      text: linkElement.textContent?.trim() || '',
      title: linkElement.getAttribute('title') || '',
      position: index,
      element: linkElement,
      isInternal: this.isInternalLink(href, baseUrl),
      isExternal: this.isExternalLink(href, baseUrl),
      context: {}
    };

    // Comprehensive context analysis
    linkInfo.context = {
      textual: this.analyzeTextualContext(linkElement, document),
      structural: this.analyzeStructuralContext(linkElement, document),
      semantic: this.analyzeSemanticContextForLink(linkElement, document),
      visual: this.analyzeVisualContext(linkElement, document),
      behavioral: this.analyzeBehavioralContext(linkElement, document),
      proximity: this.analyzeProximityContext(linkElement, document),
      relevance: this.analyzeRelevanceContext(linkElement, document, linkInfo),
      quality: this.assessContextQuality(linkElement, document)
    };

    return linkInfo;
  }

  async analyzeSemanticContext(document, context) {
    if (!this.config.enableSemanticAnalysis) {
      return { enabled: false };
    }

    const semantic = {
      topics: this.extractTopics(document),
      themes: this.identifyThemes(document),
      categories: this.categorizeContent(document),
      relationships: this.mapSemanticRelationships(document),
      coherence: this.assessSemanticCoherence(document),
      alignment: this.assessLinkAlignment(document)
    };

    return semantic;
  }

  async analyzeRelevance(document, context) {
    if (!this.config.enableRelevanceAnalysis) {
      return { enabled: false };
    }

    const relevance = {
      overall: this.calculateOverallRelevance(document),
      byLink: this.calculateLinkRelevance(document),
      factors: this.analyzeRelevanceFactors(document),
      distribution: this.analyzeRelevanceDistribution(document),
      optimization: this.assessRelevanceOptimization(document)
    };

    return relevance;
  }

  async analyzeContentContext(document, context) {
    if (!this.config.enableContentAnalysis) {
      return { enabled: false };
    }

    const content = {
      headings: this.analyzeHeadingContext(document),
      paragraphs: this.analyzeParagraphContext(document),
      lists: this.analyzeListContext(document),
      sections: this.analyzeSectionContext(document),
      multimedia: this.analyzeMultimediaContext(document),
      metadata: this.analyzeMetadataContext(document)
    };

    return content;
  }

  async analyzeProximity(document, context) {
    if (!this.config.enableProximityAnalysis) {
      return { enabled: false };
    }

    const proximity = {
      spatial: this.analyzeSpatialProximity(document),
      textual: this.analyzeTextualProximity(document),
      structural: this.analyzeStructuralProximity(document),
      visual: this.analyzeVisualProximity(document),
      clustering: this.analyzeLinkClustering(document)
    };

    return proximity;
  }

  async analyzeRelationships(document, context) {
    const relationships = {
      semantic: this.identifySemanticRelationships(document),
      hierarchical: this.identifyHierarchicalRelationships(document),
      associative: this.identifyAssociativeRelationships(document),
      temporal: this.identifyTemporalRelationships(document),
      causal: this.identifyCausalRelationships(document)
    };

    return relationships;
  }

  async analyzeContextPatterns(document, context) {
    const patterns = {
      linguistic: this.detectLinguisticPatterns(document),
      structural: this.detectStructuralPatterns(document),
      behavioral: this.detectBehavioralPatterns(document),
      visual: this.detectVisualPatterns(document),
      semantic: this.detectSemanticPatterns(document)
    };

    return patterns;
  }

  // Context analysis methods
  analyzeTextualContext(linkElement, document) {
    const context = {
      surrounding: this.getSurroundingText(linkElement),
      sentence: this.getContainingSentence(linkElement),
      paragraph: this.getContainingParagraph(linkElement),
      keywords: this.extractContextKeywords(linkElement),
      sentiment: this.analyzeSentiment(linkElement),
      tone: this.analyzeTone(linkElement)
    };

    return context;
  }

  analyzeStructuralContext(linkElement, document) {
    const context = {
      parent: linkElement.parentElement?.tagName.toLowerCase(),
      ancestors: this.getAncestorElements(linkElement),
      siblings: this.getSiblingLinks(linkElement),
      depth: this.calculateElementDepth(linkElement),
      section: this.identifyContainingSection(linkElement),
      hierarchy: this.analyzeHierarchicalPosition(linkElement)
    };

    return context;
  }

  analyzeSemanticContextForLink(linkElement, document) {
    const context = {
      topic: this.identifyLinkTopic(linkElement, document),
      category: this.categorizeLinkSemantically(linkElement),
      intent: this.inferUserIntent(linkElement),
      purpose: this.determineLinkPurpose(linkElement),
      relationship: this.determineSementicRelationship(linkElement, document),
      coherence: this.assessSemanticCoherence(linkElement, document)
    };

    return context;
  }

  analyzeVisualContext(linkElement, document) {
    const context = {
      position: this.getVisualPosition(linkElement),
      styling: this.analyzeLinkStyling(linkElement),
      prominence: this.assessVisualProminence(linkElement),
      grouping: this.identifyVisualGrouping(linkElement),
      contrast: this.assessVisualContrast(linkElement),
      accessibility: this.assessVisualAccessibility(linkElement)
    };

    return context;
  }

  analyzeBehavioralContext(linkElement, document) {
    const context = {
      interaction: this.analyzeInteractionContext(linkElement),
      navigation: this.analyzeNavigationContext(linkElement),
      flow: this.analyzeUserFlowContext(linkElement),
      expectation: this.analyzeUserExpectation(linkElement),
      pattern: this.identifyBehavioralPattern(linkElement),
      usability: this.assessUsabilityContext(linkElement)
    };

    return context;
  }

  analyzeProximityContext(linkElement, document) {
    const context = {
      nearbyLinks: this.findNearbyLinks(linkElement),
      relatedContent: this.findRelatedContent(linkElement),
      contextualElements: this.findContextualElements(linkElement),
      spatialRelationships: this.analyzeSpatialRelationships(linkElement),
      clustering: this.analyzeLocalClustering(linkElement)
    };

    return context;
  }

  analyzeRelevanceContext(linkElement, document, linkInfo) {
    const context = {
      contentRelevance: this.assessContentRelevance(linkElement, document),
      topicRelevance: this.assessTopicRelevance(linkElement, document),
      contextualRelevance: this.assessContextualRelevance(linkElement),
      userRelevance: this.assessUserRelevance(linkElement, linkInfo),
      temporalRelevance: this.assessTemporalRelevance(linkElement),
      spatialRelevance: this.assessSpatialRelevance(linkElement)
    };

    return context;
  }

  assessContextQuality(linkElement, document) {
    const quality = {
      clarity: this.assessContextClarity(linkElement),
      completeness: this.assessContextCompleteness(linkElement),
      accuracy: this.assessContextAccuracy(linkElement),
      usefulness: this.assessContextUsefulness(linkElement),
      coherence: this.assessContextCoherence(linkElement),
      overall: 0
    };

    // Calculate overall quality score
    quality.overall = Object.values(quality)
      .filter(value => typeof value === 'number')
      .reduce((sum, score) => sum + score, 0) / 5;

    return quality;
  }

  // Semantic analysis methods
  extractTopics(document) {
    const topics = new Set();
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    headings.forEach(heading => {
      const text = heading.textContent?.toLowerCase() || '';
      const words = text.split(/\s+/).filter(word => word.length > 3);
      words.forEach(word => topics.add(word));
    });

    return Array.from(topics);
  }

  identifyThemes(document) {
    const themes = [];
    const content = document.body?.textContent || '';
    
    // Simplified theme identification
    const thematicWords = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const wordFreq = {};
    
    thematicWords.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Get top themes
    themes.push(...Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, freq]) => ({ theme: word, frequency: freq })));

    return themes;
  }

  categorizeContent(document) {
    const categories = {
      informational: 0,
      navigational: 0,
      transactional: 0,
      commercial: 0
    };

    const links = document.querySelectorAll('a[href]');
    
    links.forEach(link => {
      const text = link.textContent?.toLowerCase() || '';
      const href = link.getAttribute('href') || '';
      
      if (this.semanticPatterns.action.test(text) || this.semanticPatterns.action.test(href)) {
        categories.transactional++;
      } else if (this.semanticPatterns.navigation.test(text)) {
        categories.navigational++;
      } else if (this.semanticPatterns.reference.test(text)) {
        categories.informational++;
      } else {
        categories.commercial++;
      }
    });

    return categories;
  }

  mapSemanticRelationships(document) {
    const relationships = [];
    const links = document.querySelectorAll('a[href]');
    
    links.forEach(link => {
      const context = this.getSurroundingText(link);
      
      Object.entries(this.semanticPatterns).forEach(([type, pattern]) => {
        if (pattern.test(context)) {
          relationships.push({
            link: link.getAttribute('href'),
            type,
            confidence: 0.8,
            context: context.substring(0, 50)
          });
        }
      });
    });

    return relationships;
  }

  assessSemanticCoherence(document) {
    // Simplified coherence assessment
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const links = document.querySelectorAll('a[href]');
    
    if (headings.length === 0 || links.length === 0) return 50;
    
    // Check if link text relates to headings
    let coherentLinks = 0;
    
    links.forEach(link => {
      const linkText = link.textContent?.toLowerCase() || '';
      
      for (const heading of headings) {
        const headingText = heading.textContent?.toLowerCase() || '';
        if (this.calculateTextSimilarity(linkText, headingText) > this.config.semanticThreshold) {
          coherentLinks++;
          break;
        }
      }
    });

    return (coherentLinks / links.length) * 100;
  }

  assessLinkAlignment(document) {
    // Assess how well links align with page content
    const pageTitle = document.title?.toLowerCase() || '';
    const links = document.querySelectorAll('a[href]');
    let alignedLinks = 0;

    links.forEach(link => {
      const linkText = link.textContent?.toLowerCase() || '';
      if (this.calculateTextSimilarity(linkText, pageTitle) > 0.3) {
        alignedLinks++;
      }
    });

    return links.length > 0 ? (alignedLinks / links.length) * 100 : 0;
  }

  // Utility methods
  getSurroundingText(element) {
    const parent = element.parentElement;
    if (!parent) return '';
    
    const text = parent.textContent || '';
    const linkText = element.textContent || '';
    const linkIndex = text.indexOf(linkText);
    
    if (linkIndex === -1) return text.substring(0, this.config.contextWindow);
    
    const start = Math.max(0, linkIndex - this.config.contextWindow / 2);
    const end = Math.min(text.length, linkIndex + linkText.length + this.config.contextWindow / 2);
    
    return text.substring(start, end);
  }

  getContainingSentence(element) {
    const surrounding = this.getSurroundingText(element);
    const sentences = surrounding.split(/[.!?]+/);
    
    const linkText = element.textContent || '';
    for (const sentence of sentences) {
      if (sentence.includes(linkText)) {
        return sentence.trim();
      }
    }
    
    return sentences[0] || '';
  }

  getContainingParagraph(element) {
    let current = element;
    while (current && current.tagName) {
      if (current.tagName.toLowerCase() === 'p') {
        return current.textContent || '';
      }
      current = current.parentElement;
    }
    return '';
  }

  extractContextKeywords(element) {
    const text = this.getSurroundingText(element);
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Return unique words
    return [...new Set(words)];
  }

  analyzeSentiment(element) {
    const text = this.getSurroundingText(element);
    
    // Simplified sentiment analysis
    const positiveWords = /\b(good|great|excellent|amazing|wonderful|best|love|like|enjoy)\b/gi;
    const negativeWords = /\b(bad|terrible|awful|worst|hate|dislike|horrible|poor)\b/gi;
    
    const positive = (text.match(positiveWords) || []).length;
    const negative = (text.match(negativeWords) || []).length;
    
    if (positive > negative) return 'positive';
    if (negative > positive) return 'negative';
    return 'neutral';
  }

  analyzeTone(element) {
    const text = this.getSurroundingText(element);
    
    // Simplified tone analysis
    if (/\b(learn|discover|explore|understand)\b/i.test(text)) return 'educational';
    if (/\b(buy|purchase|order|sale|discount)\b/i.test(text)) return 'commercial';
    if (/\b(home|about|contact|help)\b/i.test(text)) return 'informational';
    if (/\b(urgent|important|critical|warning)\b/i.test(text)) return 'urgent';
    
    return 'neutral';
  }

  getAncestorElements(element) {
    const ancestors = [];
    let current = element.parentElement;
    
    while (current && current.tagName) {
      ancestors.push(current.tagName.toLowerCase());
      current = current.parentElement;
    }
    
    return ancestors;
  }

  getSiblingLinks(element) {
    const parent = element.parentElement;
    if (!parent) return [];
    
    return Array.from(parent.querySelectorAll('a[href]'))
      .filter(link => link !== element);
  }

  calculateElementDepth(element) {
    let depth = 0;
    let current = element.parentElement;
    
    while (current && current.tagName) {
      depth++;
      current = current.parentElement;
    }
    
    return depth;
  }

  identifyContainingSection(element) {
    const sections = ['header', 'nav', 'main', 'article', 'section', 'aside', 'footer'];
    
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

  calculateTextSimilarity(text1, text2) {
    // Simplified text similarity calculation
    if (!text1 || !text2) return 0;
    
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  isInternalLink(href, baseUrl) {
    if (!href || !baseUrl) return false;
    
    if (href.startsWith('/') || href.startsWith('#')) return true;
    
    try {
      const url = new URL(href);
      return url.hostname === baseUrl.hostname;
    } catch (e) {
      return false;
    }
  }

  isExternalLink(href, baseUrl) {
    if (!href || !baseUrl) return false;
    
    if (!href.startsWith('http')) return false;
    
    try {
      const url = new URL(href);
      return url.hostname !== baseUrl.hostname;
    } catch (e) {
      return false;
    }
  }

  calculateContextScore(analysis) {
    let score = 50;

    // Semantic coherence factor
    if (analysis.semantic.enabled !== false) {
      score += (analysis.semantic.coherence - 50) * 0.3;
    }

    // Relevance factor
    if (analysis.relevance.enabled !== false) {
      score += (analysis.relevance.overall - 50) * 0.3;
    }

    // Content context factor
    if (analysis.content.enabled !== false) {
      const contextQuality = analysis.links
        .map(link => link.context.quality.overall)
        .reduce((sum, quality) => sum + quality, 0) / Math.max(1, analysis.links.length);
      
      score += (contextQuality - 50) * 0.2;
    }

    // Proximity factor
    if (analysis.proximity.enabled !== false) {
      score += 10; // Bonus for having proximity analysis
    }

    return Math.max(0, Math.min(100, score));
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    // Semantic coherence recommendations
    if (analysis.semantic.enabled !== false && analysis.semantic.coherence < 60) {
      recommendations.push({
        type: 'semantic-coherence',
        priority: 'medium',
        category: 'Content Coherence',
        issue: 'Low semantic coherence between links and content',
        recommendation: 'Improve alignment between link text and surrounding content',
        impact: 'medium'
      });
    }

    // Relevance recommendations
    if (analysis.relevance.enabled !== false && analysis.relevance.overall < 50) {
      recommendations.push({
        type: 'link-relevance',
        priority: 'medium',
        category: 'Content Relevance',
        issue: 'Low relevance between links and page content',
        recommendation: 'Ensure links are contextually relevant to their surrounding content',
        impact: 'medium'
      });
    }

    // Context quality recommendations
    if (analysis.content.enabled !== false) {
      const avgQuality = analysis.links
        .map(link => link.context.quality.overall)
        .reduce((sum, quality) => sum + quality, 0) / Math.max(1, analysis.links.length);
      
      if (avgQuality < 60) {
        recommendations.push({
          type: 'context-quality',
          priority: 'medium',
          category: 'Link Context',
          issue: 'Poor link context quality detected',
          recommendation: 'Improve contextual information around links for better user understanding',
          impact: 'medium'
        });
      }
    }

    return recommendations;
  }

  // Placeholder implementations for complex methods
  analyzeHierarchicalPosition(element) { return 1; }
  identifyLinkTopic(element, document) { return 'general'; }
  categorizeLinkSemantically(element) { return 'informational'; }
  inferUserIntent(element) { return 'navigate'; }
  determineLinkPurpose(element) { return 'reference'; }
  determineSementicRelationship(element, document) { return 'related'; }
  assessSemanticCoherence(element, document) { return 75; }
  getVisualPosition(element) { return { x: 0, y: 0 }; }
  analyzeLinkStyling(element) { return { hasUnderline: true, hasColor: true }; }
  assessVisualProminence(element) { return 50; }
  identifyVisualGrouping(element) { return 'isolated'; }
  assessVisualContrast(element) { return 75; }
  assessVisualAccessibility(element) { return 80; }
  analyzeInteractionContext(element) { return { clickable: true }; }
  analyzeNavigationContext(element) { return { type: 'standard' }; }
  analyzeUserFlowContext(element) { return { position: 'middle' }; }
  analyzeUserExpectation(element) { return { met: true }; }
  identifyBehavioralPattern(element) { return 'standard'; }
  assessUsabilityContext(element) { return 75; }
  findNearbyLinks(element) { return []; }
  findRelatedContent(element) { return []; }
  findContextualElements(element) { return []; }
  analyzeSpatialRelationships(element) { return []; }
  analyzeLocalClustering(element) { return { cluster: 'none' }; }
  assessContentRelevance(element, document) { return 75; }
  assessTopicRelevance(element, document) { return 70; }
  assessContextualRelevance(element) { return 80; }
  assessUserRelevance(element, linkInfo) { return 75; }
  assessTemporalRelevance(element) { return 50; }
  assessSpatialRelevance(element) { return 60; }
  assessContextClarity(element) { return 75; }
  assessContextCompleteness(element) { return 70; }
  assessContextAccuracy(element) { return 85; }
  assessContextUsefulness(element) { return 80; }
  assessContextCoherence(element) { return 75; }
  calculateOverallRelevance(document) { return 75; }
  calculateLinkRelevance(document) { return {}; }
  analyzeRelevanceFactors(document) { return {}; }
  analyzeRelevanceDistribution(document) { return {}; }
  assessRelevanceOptimization(document) { return 70; }
  analyzeHeadingContext(document) { return {}; }
  analyzeParagraphContext(document) { return {}; }
  analyzeListContext(document) { return {}; }
  analyzeSectionContext(document) { return {}; }
  analyzeMultimediaContext(document) { return {}; }
  analyzeMetadataContext(document) { return {}; }
  analyzeSpatialProximity(document) { return {}; }
  analyzeTextualProximity(document) { return {}; }
  analyzeStructuralProximity(document) { return {}; }
  analyzeVisualProximity(document) { return {}; }
  analyzeLinkClustering(document) { return {}; }
  identifySemanticRelationships(document) { return []; }
  identifyHierarchicalRelationships(document) { return []; }
  identifyAssociativeRelationships(document) { return []; }
  identifyTemporalRelationships(document) { return []; }
  identifyCausalRelationships(document) { return []; }
  detectLinguisticPatterns(document) { return {}; }
  detectStructuralPatterns(document) { return {}; }
  detectBehavioralPatterns(document) { return {}; }
  detectVisualPatterns(document) { return {}; }
  detectSemanticPatterns(document) { return {}; }

  handleDetectionError(error) {
    return {
      category: 'Link Context Detection',
      subcategory: 'Detection Error',
      error: error.message,
      links: [],
      count: 0,
      score: 0,
      recommendations: [{
        type: 'error',
        priority: 'high',
        issue: 'Link context detection failed',
        recommendation: 'Review context analysis configuration and try again'
      }]
    };
  }
}
