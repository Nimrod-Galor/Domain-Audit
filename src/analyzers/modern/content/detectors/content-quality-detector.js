/**
 * ============================================================================
 * CONTENT QUALITY DETECTOR - GPT-5 STYLE MODULAR COMPONENT
 * ============================================================================
 * 
 * Advanced content quality assessment and optimization analysis
 * Part of Content Analyzer Combined Approach (21st Implementation)
 * 
 * Capabilities:
 * - Content depth and comprehensiveness analysis
 * - Writing quality and clarity assessment
 * - Information accuracy and credibility evaluation
 * - Content freshness and relevance analysis
 * - Engagement and value proposition assessment
 * - Content uniqueness and originality detection
 * 
 * @version 1.0.0
 * @author Development Team  
 * @integration GPT-5 Style Detector
 * @created 2025-08-13
 */

export class ContentQualityDetector {
  constructor(options = {}) {
    this.options = {
      // Quality Analysis Configuration
      enableDepthAnalysis: options.enableDepthAnalysis !== false,
      enableClarityAnalysis: options.enableClarityAnalysis !== false,
      enableCredibilityAnalysis: options.enableCredibilityAnalysis !== false,
      enableFreshnessAnalysis: options.enableFreshnessAnalysis !== false,
      enableEngagementAnalysis: options.enableEngagementAnalysis !== false,
      enableUniquenessAnalysis: options.enableUniquenessAnalysis !== false,
      
      // Quality Thresholds
      minWordCount: options.minWordCount || 300,
      idealWordCount: options.idealWordCount || 1000,
      maxWordCount: options.maxWordCount || 3000,
      minSentenceLength: options.minSentenceLength || 10,
      maxSentenceLength: options.maxSentenceLength || 25,
      
      // Content Requirements
      requireReferences: options.requireReferences !== false,
      requireDateStamps: options.requireDateStamps !== false,
      requireAuthorInfo: options.requireAuthorInfo !== false,
      
      ...options
    };

    this.detectorType = 'content_quality';
    this.version = '1.0.0';
    
    // Quality assessment patterns
    this.qualityPatterns = {
      credibility_indicators: /\b(study|research|data|statistics|survey|report|analysis|expert|professor|PhD|source|reference)\b/gi,
      engagement_indicators: /\b(you|your|how to|why|what|when|where|discover|learn|understand|benefit|advantage)\b/gi,
      clarity_indicators: /\b(for example|such as|in other words|specifically|namely|that is|including)\b/gi,
      authority_indicators: /\b(according to|studies show|research indicates|experts say|data suggests)\b/gi,
      freshness_indicators: /\b(recent|new|latest|current|updated|today|this year|2024|2025)\b/gi
    };
    
    // Content quality metrics
    this.qualityMetrics = {
      readability_factors: ['sentence_length', 'word_complexity', 'paragraph_structure'],
      engagement_factors: ['question_usage', 'direct_address', 'call_to_action'],
      credibility_factors: ['external_links', 'citations', 'author_credentials'],
      depth_factors: ['word_count', 'topic_coverage', 'detail_level']
    };

    console.log('🔍 Content Quality Detector initialized');
    console.log(`📊 Depth Analysis: ${this.options.enableDepthAnalysis ? 'Enabled' : 'Disabled'}`);
    console.log(`✨ Clarity Analysis: ${this.options.enableClarityAnalysis ? 'Enabled' : 'Disabled'}`);
    console.log(`🎯 Engagement Analysis: ${this.options.enableEngagementAnalysis ? 'Enabled' : 'Disabled'}`);
  }

  /**
   * Main detection method for content quality analysis
   */
  async detect(context, configuration) {
    const startTime = Date.now();
    
    try {
      console.log('🔍 Analyzing content quality...');
      
      const { document } = context;
      if (!document) {
        throw new Error('Document is required for content quality analysis');
      }

      // Phase 1: Content Depth Analysis
      const depthAnalysis = await this.analyzeContentDepth(document);
      
      // Phase 2: Writing Quality and Clarity Analysis
      const clarityAnalysis = await this.analyzeWritingClarity(document);
      
      // Phase 3: Credibility and Authority Analysis
      const credibilityAnalysis = await this.analyzeContentCredibility(document);
      
      // Phase 4: Content Freshness Analysis
      const freshnessAnalysis = await this.analyzeContentFreshness(document);
      
      // Phase 5: Engagement Analysis
      const engagementAnalysis = await this.analyzeContentEngagement(document);
      
      // Phase 6: Uniqueness and Originality Analysis
      const uniquenessAnalysis = await this.analyzeContentUniqueness(document);
      
      // Phase 7: Overall Quality Assessment
      const qualityAssessment = await this.assessOverallQuality({
        depth: depthAnalysis,
        clarity: clarityAnalysis,
        credibility: credibilityAnalysis,
        freshness: freshnessAnalysis,
        engagement: engagementAnalysis,
        uniqueness: uniquenessAnalysis
      });
      
      const endTime = Date.now();
      
      return {
        detector: this.detectorType,
        version: this.version,
        timestamp: new Date().toISOString(),
        processing_time: endTime - startTime,
        
        // Quality Analysis Results
        depth_analysis: depthAnalysis,
        clarity_analysis: clarityAnalysis,
        credibility_analysis: credibilityAnalysis,
        freshness_analysis: freshnessAnalysis,
        engagement_analysis: engagementAnalysis,
        uniqueness_analysis: uniquenessAnalysis,
        
        // Overall Quality Assessment
        quality_assessment: qualityAssessment,
        
        // Quality Score
        quality_score: qualityAssessment.overall_score,
        
        // Quality Metrics
        quality_metrics: {
          word_count: depthAnalysis.word_count,
          reading_level: clarityAnalysis.reading_level,
          credibility_score: credibilityAnalysis.credibility_score,
          freshness_score: freshnessAnalysis.freshness_score,
          engagement_score: engagementAnalysis.engagement_score,
          uniqueness_score: uniquenessAnalysis.uniqueness_score,
          comprehensiveness: depthAnalysis.comprehensiveness_score
        },
        
        // Quality Insights
        quality_insights: this.generateQualityInsights(qualityAssessment),
        
        // Improvement Recommendations
        improvement_recommendations: this.generateImprovementRecommendations(qualityAssessment),
        
        // Content Optimization Suggestions
        optimization_suggestions: this.generateOptimizationSuggestions({
          depth: depthAnalysis,
          clarity: clarityAnalysis,
          engagement: engagementAnalysis
        })
      };
      
    } catch (error) {
      console.error('❌ Content quality detection failed:', error);
      return this.handleDetectionError(error);
    }
  }

  /**
   * Phase 1: Analyze content depth and comprehensiveness
   */
  async analyzeContentDepth(document) {
    const analysis = {
      category: 'Content Depth',
      depth_metrics: {},
      coverage_analysis: {},
      detail_assessment: {}
    };
    
    try {
      const textContent = this.extractTextContent(document);
      
      // Basic metrics
      analysis.word_count = this.countWords(textContent);
      analysis.sentence_count = this.countSentences(textContent);
      analysis.paragraph_count = document.querySelectorAll('p').length;
      
      // Depth metrics
      analysis.depth_metrics = this.calculateDepthMetrics(textContent, document);
      
      // Topic coverage analysis
      analysis.coverage_analysis = this.analyzeCoverageDepth(textContent, document);
      
      // Detail level assessment
      analysis.detail_assessment = this.assessDetailLevel(textContent, document);
      
      // Comprehensiveness score
      analysis.comprehensiveness_score = this.calculateComprehensivenessScore(
        analysis.depth_metrics,
        analysis.coverage_analysis,
        analysis.detail_assessment
      );
      
    } catch (error) {
      console.error('Content depth analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 2: Analyze writing quality and clarity
   */
  async analyzeWritingClarity(document) {
    const analysis = {
      category: 'Writing Clarity',
      readability_metrics: {},
      clarity_indicators: {},
      writing_quality: {}
    };
    
    try {
      const textContent = this.extractTextContent(document);
      
      // Readability metrics
      analysis.readability_metrics = this.calculateReadabilityMetrics(textContent);
      
      // Clarity indicators
      analysis.clarity_indicators = this.detectClarityIndicators(textContent);
      
      // Writing quality assessment
      analysis.writing_quality = this.assessWritingQuality(textContent, document);
      
      // Reading level
      analysis.reading_level = this.calculateReadingLevel(textContent);
      
      // Clarity score
      analysis.clarity_score = this.calculateClarityScore(
        analysis.readability_metrics,
        analysis.clarity_indicators,
        analysis.writing_quality
      );
      
    } catch (error) {
      console.error('Writing clarity analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 3: Analyze content credibility and authority
   */
  async analyzeContentCredibility(document) {
    const analysis = {
      category: 'Content Credibility',
      authority_signals: {},
      reference_analysis: {},
      credibility_factors: {}
    };
    
    try {
      const textContent = this.extractTextContent(document);
      
      // Authority signals
      analysis.authority_signals = this.detectAuthoritySignals(textContent, document);
      
      // Reference and citation analysis
      analysis.reference_analysis = this.analyzeReferences(document);
      
      // Credibility factors
      analysis.credibility_factors = this.assessCredibilityFactors(textContent, document);
      
      // Author information
      analysis.author_analysis = this.analyzeAuthorInformation(document);
      
      // Credibility score
      analysis.credibility_score = this.calculateCredibilityScore(
        analysis.authority_signals,
        analysis.reference_analysis,
        analysis.credibility_factors,
        analysis.author_analysis
      );
      
    } catch (error) {
      console.error('Content credibility analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 4: Analyze content freshness and timeliness
   */
  async analyzeContentFreshness(document) {
    const analysis = {
      category: 'Content Freshness',
      date_analysis: {},
      freshness_indicators: {},
      temporal_relevance: {}
    };
    
    try {
      const textContent = this.extractTextContent(document);
      
      // Date analysis
      analysis.date_analysis = this.analyzeDates(document, textContent);
      
      // Freshness indicators
      analysis.freshness_indicators = this.detectFreshnessIndicators(textContent);
      
      // Temporal relevance
      analysis.temporal_relevance = this.assessTemporalRelevance(textContent, document);
      
      // Update frequency assessment
      analysis.update_assessment = this.assessUpdateFrequency(document);
      
      // Freshness score
      analysis.freshness_score = this.calculateFreshnessScore(
        analysis.date_analysis,
        analysis.freshness_indicators,
        analysis.temporal_relevance
      );
      
    } catch (error) {
      console.error('Content freshness analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 5: Analyze content engagement potential
   */
  async analyzeContentEngagement(document) {
    const analysis = {
      category: 'Content Engagement',
      engagement_elements: {},
      interaction_opportunities: {},
      emotional_appeal: {}
    };
    
    try {
      const textContent = this.extractTextContent(document);
      
      // Engagement elements
      analysis.engagement_elements = this.detectEngagementElements(textContent, document);
      
      // Interaction opportunities
      analysis.interaction_opportunities = this.analyzeInteractionOpportunities(document);
      
      // Emotional appeal assessment
      analysis.emotional_appeal = this.assessEmotionalAppeal(textContent);
      
      // User-focused content analysis
      analysis.user_focus = this.analyzeUserFocus(textContent);
      
      // Engagement score
      analysis.engagement_score = this.calculateEngagementScore(
        analysis.engagement_elements,
        analysis.interaction_opportunities,
        analysis.emotional_appeal,
        analysis.user_focus
      );
      
    } catch (error) {
      console.error('Content engagement analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 6: Analyze content uniqueness and originality
   */
  async analyzeContentUniqueness(document) {
    const analysis = {
      category: 'Content Uniqueness',
      originality_indicators: {},
      content_patterns: {},
      uniqueness_factors: {}
    };
    
    try {
      const textContent = this.extractTextContent(document);
      
      // Originality indicators
      analysis.originality_indicators = this.detectOriginalityIndicators(textContent, document);
      
      // Content pattern analysis
      analysis.content_patterns = this.analyzeContentPatterns(textContent);
      
      // Uniqueness factors
      analysis.uniqueness_factors = this.assessUniquenessFactors(textContent, document);
      
      // Personal voice and perspective
      analysis.voice_analysis = this.analyzeVoiceAndPerspective(textContent);
      
      // Uniqueness score
      analysis.uniqueness_score = this.calculateUniquenessScore(
        analysis.originality_indicators,
        analysis.content_patterns,
        analysis.uniqueness_factors,
        analysis.voice_analysis
      );
      
    } catch (error) {
      console.error('Content uniqueness analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 7: Assess overall content quality
   */
  async assessOverallQuality(analyses) {
    const assessment = {
      category: 'Overall Quality Assessment',
      component_scores: {},
      quality_dimensions: {},
      overall_metrics: {}
    };
    
    try {
      // Component scores
      assessment.component_scores = {
        depth: analyses.depth?.comprehensiveness_score || 0,
        clarity: analyses.clarity?.clarity_score || 0,
        credibility: analyses.credibility?.credibility_score || 0,
        freshness: analyses.freshness?.freshness_score || 0,
        engagement: analyses.engagement?.engagement_score || 0,
        uniqueness: analyses.uniqueness?.uniqueness_score || 0
      };
      
      // Calculate overall score
      const validScores = Object.values(assessment.component_scores).filter(score => score > 0);
      assessment.overall_score = validScores.length > 0 
        ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
        : 0;
      
      // Quality dimensions
      assessment.quality_dimensions = this.assessQualityDimensions(assessment.component_scores);
      
      // Overall metrics
      assessment.overall_metrics = this.calculateOverallMetrics(analyses);
      
      // Quality classification
      assessment.quality_classification = this.classifyContentQuality(assessment.overall_score);
      
      // Improvement priorities
      assessment.improvement_priorities = this.identifyImprovementPriorities(assessment.component_scores);
      
    } catch (error) {
      console.error('Overall quality assessment failed:', error);
      assessment.error = error.message;
    }
    
    return assessment;
  }

  /**
   * Extract clean text content from document
   */
  extractTextContent(document) {
    // Remove script and style elements
    const scripts = document.querySelectorAll('script, style, noscript');
    scripts.forEach(element => element.remove());
    
    // Get main content areas
    const contentSelectors = [
      'main', 'article', '[role="main"]', '.content', '.post-content', 
      '.entry-content', '.article-content', '.page-content'
    ];
    
    let textContent = '';
    
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        textContent = element.textContent || '';
        break;
      }
    }
    
    // Fallback to body content
    if (!textContent) {
      textContent = document.body ? document.body.textContent || '' : '';
    }
    
    return textContent.trim();
  }

  /**
   * Count words in text
   */
  countWords(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Count sentences in text
   */
  countSentences(text) {
    return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
  }

  /**
   * Calculate depth metrics
   */
  calculateDepthMetrics(text, document) {
    const metrics = {
      average_sentence_length: 0,
      vocabulary_richness: 0,
      information_density: 0,
      topic_breadth: 0
    };
    
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    
    if (sentences.length > 0) {
      metrics.average_sentence_length = Math.round(words.length / sentences.length);
    }
    
    // Vocabulary richness (unique words / total words)
    const uniqueWords = new Set(words.map(word => word.toLowerCase().replace(/[^\w]/g, '')));
    if (words.length > 0) {
      metrics.vocabulary_richness = Math.round((uniqueWords.size / words.length) * 100);
    }
    
    // Information density (based on content structure)
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
    const lists = document.querySelectorAll('ul, ol').length;
    const links = document.querySelectorAll('a').length;
    
    metrics.information_density = Math.min(100, (headings * 5) + (lists * 3) + (links * 1));
    
    // Topic breadth (estimated based on heading diversity)
    metrics.topic_breadth = Math.min(100, headings * 10);
    
    return metrics;
  }

  /**
   * Analyze coverage depth
   */
  analyzeCoverageDepth(text, document) {
    const analysis = {
      topic_coverage: 0,
      detail_level: 0,
      comprehensive_treatment: false
    };
    
    const wordCount = this.countWords(text);
    const headingCount = document.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
    const sectionCount = document.querySelectorAll('section, article, div').length;
    
    // Topic coverage based on word count and structure
    if (wordCount >= this.options.idealWordCount) {
      analysis.topic_coverage = 90;
    } else if (wordCount >= this.options.minWordCount) {
      analysis.topic_coverage = Math.round((wordCount / this.options.idealWordCount) * 70);
    } else {
      analysis.topic_coverage = Math.round((wordCount / this.options.minWordCount) * 50);
    }
    
    // Detail level based on structure
    analysis.detail_level = Math.min(100, (headingCount * 8) + (sectionCount * 3));
    
    // Comprehensive treatment
    analysis.comprehensive_treatment = wordCount >= this.options.idealWordCount && 
                                      headingCount >= 3 && 
                                      sectionCount >= 2;
    
    return analysis;
  }

  /**
   * Assess detail level
   */
  assessDetailLevel(text, document) {
    const assessment = {
      examples_count: 0,
      explanations_count: 0,
      supporting_evidence: 0,
      depth_indicators: 0
    };
    
    // Count examples and explanations
    const examplePatterns = /\b(for example|for instance|such as|like|including)\b/gi;
    const explanationPatterns = /\b(because|therefore|thus|hence|as a result|consequently)\b/gi;
    
    assessment.examples_count = (text.match(examplePatterns) || []).length;
    assessment.explanations_count = (text.match(explanationPatterns) || []).length;
    
    // Supporting evidence
    const evidenceElements = document.querySelectorAll('blockquote, cite, q, .quote').length;
    const dataElements = document.querySelectorAll('table, chart, .data, .statistics').length;
    
    assessment.supporting_evidence = evidenceElements + dataElements;
    
    // Depth indicators
    assessment.depth_indicators = assessment.examples_count + 
                                 assessment.explanations_count + 
                                 assessment.supporting_evidence;
    
    return assessment;
  }

  /**
   * Calculate comprehensiveness score
   */
  calculateComprehensivenessScore(depthMetrics, coverage, detail) {
    let score = 60; // Base score
    
    // Word count factor
    const wordCountScore = Math.min(25, coverage.topic_coverage * 0.25);
    score += wordCountScore;
    
    // Structure factor
    score += Math.min(10, detail.depth_indicators * 2);
    
    // Vocabulary richness
    if (depthMetrics.vocabulary_richness > 50) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate readability metrics
   */
  calculateReadabilityMetrics(text) {
    const metrics = {
      average_sentence_length: 0,
      average_word_length: 0,
      complex_word_ratio: 0,
      passive_voice_ratio: 0
    };
    
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    
    if (sentences.length > 0) {
      metrics.average_sentence_length = Math.round(words.length / sentences.length);
    }
    
    if (words.length > 0) {
      const totalCharacters = words.reduce((sum, word) => sum + word.length, 0);
      metrics.average_word_length = Math.round(totalCharacters / words.length);
      
      // Complex words (3+ syllables, simplified approximation)
      const complexWords = words.filter(word => word.length > 6);
      metrics.complex_word_ratio = Math.round((complexWords.length / words.length) * 100);
    }
    
    // Passive voice detection (simplified)
    const passivePatterns = /\b(is|are|was|were|been|being)\s+\w+ed\b/gi;
    const passiveMatches = (text.match(passivePatterns) || []).length;
    if (sentences.length > 0) {
      metrics.passive_voice_ratio = Math.round((passiveMatches / sentences.length) * 100);
    }
    
    return metrics;
  }

  /**
   * Detect clarity indicators
   */
  detectClarityIndicators(text) {
    const indicators = {};
    
    Object.entries(this.qualityPatterns).forEach(([type, pattern]) => {
      if (type.includes('clarity') || type.includes('engagement')) {
        const matches = text.match(pattern) || [];
        indicators[type] = {
          count: matches.length,
          examples: matches.slice(0, 3)
        };
      }
    });
    
    return indicators;
  }

  /**
   * Assess writing quality
   */
  assessWritingQuality(text, document) {
    const quality = {
      grammar_indicators: 0,
      style_consistency: 0,
      tone_appropriateness: 0,
      flow_quality: 0
    };
    
    // Grammar indicators (basic checks)
    const grammarIssues = (text.match(/\b(there|their|they're)\b/gi) || []).length +
                         (text.match(/\b(its|it's)\b/gi) || []).length +
                         (text.match(/\b(your|you're)\b/gi) || []).length;
    
    quality.grammar_indicators = Math.max(0, 100 - (grammarIssues * 5));
    
    // Style consistency (paragraph length variation)
    const paragraphs = document.querySelectorAll('p');
    if (paragraphs.length > 1) {
      const lengths = Array.from(paragraphs).map(p => p.textContent.length);
      const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
      const coefficient = Math.sqrt(variance) / avgLength;
      
      quality.style_consistency = Math.max(0, 100 - (coefficient * 50));
    }
    
    // Flow quality (transition words)
    const transitions = (text.match(/\b(however|therefore|furthermore|moreover|meanwhile|consequently)\b/gi) || []).length;
    quality.flow_quality = Math.min(100, transitions * 10);
    
    return quality;
  }

  /**
   * Calculate reading level
   */
  calculateReadingLevel(text) {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    
    if (sentences.length === 0 || words.length === 0) {
      return 'unknown';
    }
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = words.reduce((sum, word) => {
      // Simplified syllable count
      const syllables = word.toLowerCase().replace(/[^aeiou]/g, '').length || 1;
      return sum + syllables;
    }, 0) / words.length;
    
    // Simplified Flesch-Kincaid Grade Level
    const gradeLevel = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
    
    if (gradeLevel <= 6) return 'elementary';
    if (gradeLevel <= 9) return 'middle_school';
    if (gradeLevel <= 12) return 'high_school';
    if (gradeLevel <= 16) return 'college';
    return 'graduate';
  }

  /**
   * Calculate clarity score
   */
  calculateClarityScore(readability, indicators, quality) {
    let score = 70; // Base score
    
    // Readability factors
    if (readability.average_sentence_length >= 15 && readability.average_sentence_length <= 20) {
      score += 10;
    }
    
    if (readability.complex_word_ratio < 20) {
      score += 10;
    }
    
    if (readability.passive_voice_ratio < 30) {
      score += 5;
    }
    
    // Quality factors
    score += Math.min(10, quality.flow_quality * 0.1);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Detect authority signals
   */
  detectAuthoritySignals(text, document) {
    const signals = {
      expert_citations: 0,
      research_references: 0,
      data_mentions: 0,
      authority_language: 0
    };
    
    // Authority patterns
    const expertPattern = /\b(expert|professor|PhD|Dr\.|researcher|specialist|authority)\b/gi;
    const researchPattern = /\b(study|research|survey|analysis|report|findings)\b/gi;
    const dataPattern = /\b(data|statistics|numbers|percentage|percent|%)\b/gi;
    const authorityPattern = /\b(according to|studies show|research indicates|data suggests)\b/gi;
    
    signals.expert_citations = (text.match(expertPattern) || []).length;
    signals.research_references = (text.match(researchPattern) || []).length;
    signals.data_mentions = (text.match(dataPattern) || []).length;
    signals.authority_language = (text.match(authorityPattern) || []).length;
    
    return signals;
  }

  /**
   * Analyze references and citations
   */
  analyzeReferences(document) {
    const analysis = {
      external_links: 0,
      internal_links: 0,
      citation_elements: 0,
      source_quality: 0
    };
    
    const links = document.querySelectorAll('a[href]');
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        if (href.startsWith('http') && !href.includes(window.location.hostname)) {
          analysis.external_links++;
        } else if (!href.startsWith('http') && !href.startsWith('mailto:')) {
          analysis.internal_links++;
        }
      }
    });
    
    // Citation elements
    analysis.citation_elements = document.querySelectorAll('cite, blockquote, q, .citation, .reference').length;
    
    // Source quality assessment (based on external links to reputable domains)
    const reputableDomains = ['edu', 'gov', 'org'];
    analysis.source_quality = Array.from(links).filter(link => {
      const href = link.getAttribute('href') || '';
      return reputableDomains.some(domain => href.includes(`.${domain}`));
    }).length;
    
    return analysis;
  }

  /**
   * Assess credibility factors
   */
  assessCredibilityFactors(text, document) {
    const factors = {
      factual_language: 0,
      balanced_perspective: 0,
      transparency: 0,
      expertise_indicators: 0
    };
    
    // Factual language
    const factualPattern = /\b(fact|evidence|proof|confirmed|verified|established|documented)\b/gi;
    factors.factual_language = (text.match(factualPattern) || []).length;
    
    // Balanced perspective
    const balancePattern = /\b(however|although|despite|nevertheless|on the other hand|alternatively)\b/gi;
    factors.balanced_perspective = (text.match(balancePattern) || []).length;
    
    // Transparency indicators
    const transparencyPattern = /\b(disclosure|disclaimer|affiliate|sponsored|opinion|personal experience)\b/gi;
    factors.transparency = (text.match(transparencyPattern) || []).length;
    
    // Expertise indicators
    const expertisePattern = /\b(experience|background|qualification|certification|years of|decade)\b/gi;
    factors.expertise_indicators = (text.match(expertisePattern) || []).length;
    
    return factors;
  }

  /**
   * Analyze author information
   */
  analyzeAuthorInformation(document) {
    const analysis = {
      has_author_info: false,
      author_credibility: 0,
      contact_information: false,
      bio_present: false
    };
    
    // Author information selectors
    const authorSelectors = [
      '.author', '.byline', '[rel="author"]', '.post-author', 
      '.article-author', '.writer', '.contributor'
    ];
    
    for (const selector of authorSelectors) {
      if (document.querySelector(selector)) {
        analysis.has_author_info = true;
        break;
      }
    }
    
    // Bio presence
    const bioSelectors = ['.bio', '.author-bio', '.about-author', '.author-description'];
    analysis.bio_present = bioSelectors.some(selector => document.querySelector(selector));
    
    // Contact information
    const contactElements = document.querySelectorAll('[href^="mailto:"], .contact, .email');
    analysis.contact_information = contactElements.length > 0;
    
    // Author credibility score
    if (analysis.has_author_info) analysis.author_credibility += 40;
    if (analysis.bio_present) analysis.author_credibility += 30;
    if (analysis.contact_information) analysis.author_credibility += 30;
    
    return analysis;
  }

  /**
   * Calculate credibility score
   */
  calculateCredibilityScore(authority, references, factors, author) {
    let score = 50; // Base score
    
    // Authority signals
    score += Math.min(20, (authority.expert_citations + authority.research_references) * 2);
    
    // References
    score += Math.min(15, references.external_links * 2);
    score += Math.min(10, references.source_quality * 5);
    
    // Author credibility
    score += Math.min(15, author.author_credibility * 0.15);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze dates in content
   */
  analyzeDates(document, text) {
    const analysis = {
      publication_date: null,
      update_date: null,
      date_indicators: 0,
      temporal_context: 0
    };
    
    // Look for date elements
    const dateSelectors = [
      'time', '.date', '.published', '.updated', '.modified',
      '[datetime]', '.post-date', '.article-date'
    ];
    
    for (const selector of dateSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const dateText = element.textContent || element.getAttribute('datetime') || '';
        if (dateText.match(/\d{4}/)) {
          if (!analysis.publication_date) {
            analysis.publication_date = dateText;
          }
        }
      }
    }
    
    // Date patterns in text
    const datePattern = /\b(20\d{2}|january|february|march|april|may|june|july|august|september|october|november|december)\b/gi;
    analysis.date_indicators = (text.match(datePattern) || []).length;
    
    return analysis;
  }

  /**
   * Detect freshness indicators
   */
  detectFreshnessIndicators(text) {
    const indicators = {};
    
    const freshnessPattern = this.qualityPatterns.freshness_indicators;
    const matches = text.match(freshnessPattern) || [];
    
    indicators.freshness_terms = {
      count: matches.length,
      examples: matches.slice(0, 5)
    };
    
    return indicators;
  }

  /**
   * Assess temporal relevance
   */
  assessTemporalRelevance(text, document) {
    const assessment = {
      current_references: 0,
      timeless_content: false,
      time_sensitive: false
    };
    
    // Current year references
    const currentYear = new Date().getFullYear();
    const currentYearPattern = new RegExp(`\\b${currentYear}\\b`, 'g');
    assessment.current_references = (text.match(currentYearPattern) || []).length;
    
    // Time-sensitive indicators
    const timeSensitivePattern = /\b(breaking|urgent|today|this week|this month|immediate|now|current|latest)\b/gi;
    assessment.time_sensitive = (text.match(timeSensitivePattern) || []).length > 0;
    
    // Timeless content indicators
    const timelessPattern = /\b(always|never|fundamental|basic|principle|concept|theory|guide|tutorial)\b/gi;
    assessment.timeless_content = (text.match(timelessPattern) || []).length > 3;
    
    return assessment;
  }

  /**
   * Assess update frequency
   */
  assessUpdateFrequency(document) {
    const assessment = {
      has_update_info: false,
      recent_updates: false,
      maintenance_indicators: false
    };
    
    // Update information
    const updateSelectors = ['.updated', '.modified', '.last-updated', '[datetime]'];
    assessment.has_update_info = updateSelectors.some(selector => document.querySelector(selector));
    
    // Maintenance indicators
    const maintenanceSelectors = ['.version', '.changelog', '.updates', '.revision'];
    assessment.maintenance_indicators = maintenanceSelectors.some(selector => document.querySelector(selector));
    
    return assessment;
  }

  /**
   * Calculate freshness score
   */
  calculateFreshnessScore(dateAnalysis, indicators, relevance) {
    let score = 60; // Base score
    
    // Date presence
    if (dateAnalysis.publication_date) score += 15;
    if (dateAnalysis.update_date) score += 10;
    
    // Freshness indicators
    score += Math.min(15, indicators.freshness_terms?.count * 3);
    
    // Current references
    score += Math.min(10, relevance.current_references * 5);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Detect engagement elements
   */
  detectEngagementElements(text, document) {
    const elements = {
      questions: 0,
      calls_to_action: 0,
      interactive_elements: 0,
      personal_pronouns: 0
    };
    
    // Questions
    elements.questions = (text.match(/\?/g) || []).length;
    
    // Calls to action
    const ctaPattern = /\b(click|download|subscribe|sign up|learn more|get started|try now|contact us)\b/gi;
    elements.calls_to_action = (text.match(ctaPattern) || []).length;
    
    // Interactive elements
    elements.interactive_elements = document.querySelectorAll('button, input, form, .cta, .call-to-action').length;
    
    // Personal pronouns
    const pronounPattern = /\b(you|your|we|our|us|my|I)\b/gi;
    elements.personal_pronouns = (text.match(pronounPattern) || []).length;
    
    return elements;
  }

  /**
   * Analyze interaction opportunities
   */
  analyzeInteractionOpportunities(document) {
    const opportunities = {
      forms: 0,
      comments: 0,
      social_sharing: 0,
      multimedia: 0
    };
    
    opportunities.forms = document.querySelectorAll('form').length;
    opportunities.comments = document.querySelectorAll('.comment, .comments, #comments').length;
    opportunities.social_sharing = document.querySelectorAll('.share, .social, [href*="twitter"], [href*="facebook"]').length;
    opportunities.multimedia = document.querySelectorAll('video, audio, iframe, img').length;
    
    return opportunities;
  }

  /**
   * Assess emotional appeal
   */
  assessEmotionalAppeal(text) {
    const appeal = {
      emotion_words: 0,
      power_words: 0,
      sensory_language: 0
    };
    
    // Emotion words
    const emotionPattern = /\b(amazing|incredible|fantastic|awesome|terrible|horrible|wonderful|excellent|outstanding)\b/gi;
    appeal.emotion_words = (text.match(emotionPattern) || []).length;
    
    // Power words
    const powerPattern = /\b(discover|secret|proven|guaranteed|exclusive|ultimate|essential|powerful|transform)\b/gi;
    appeal.power_words = (text.match(powerPattern) || []).length;
    
    // Sensory language
    const sensoryPattern = /\b(see|hear|feel|touch|taste|imagine|visualize|picture|experience)\b/gi;
    appeal.sensory_language = (text.match(sensoryPattern) || []).length;
    
    return appeal;
  }

  /**
   * Analyze user focus
   */
  analyzeUserFocus(text) {
    const focus = {
      user_benefits: 0,
      problem_solving: 0,
      actionable_advice: 0
    };
    
    // User benefits
    const benefitPattern = /\b(benefit|advantage|help|improve|increase|reduce|save|gain|achieve)\b/gi;
    focus.user_benefits = (text.match(benefitPattern) || []).length;
    
    // Problem solving
    const problemPattern = /\b(problem|issue|challenge|solution|solve|fix|resolve|address)\b/gi;
    focus.problem_solving = (text.match(problemPattern) || []).length;
    
    // Actionable advice
    const actionPattern = /\b(how to|step|method|way|approach|strategy|technique|tip|guide)\b/gi;
    focus.actionable_advice = (text.match(actionPattern) || []).length;
    
    return focus;
  }

  /**
   * Calculate engagement score
   */
  calculateEngagementScore(elements, opportunities, appeal, focus) {
    let score = 50; // Base score
    
    // Engagement elements
    score += Math.min(20, elements.questions * 3);
    score += Math.min(15, elements.calls_to_action * 5);
    score += Math.min(10, elements.personal_pronouns * 0.1);
    
    // Interaction opportunities
    score += Math.min(15, opportunities.multimedia * 2);
    score += Math.min(10, opportunities.social_sharing * 3);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Detect originality indicators
   */
  detectOriginalityIndicators(text, document) {
    const indicators = {
      unique_insights: 0,
      personal_experience: 0,
      original_research: 0,
      creative_elements: 0
    };
    
    // Personal experience
    const experiencePattern = /\b(my experience|I found|I discovered|I learned|in my opinion|I believe)\b/gi;
    indicators.personal_experience = (text.match(experiencePattern) || []).length;
    
    // Original research
    const researchPattern = /\b(our study|our research|we found|we discovered|our analysis)\b/gi;
    indicators.original_research = (text.match(researchPattern) || []).length;
    
    // Creative elements
    indicators.creative_elements = document.querySelectorAll('img, video, infographic, chart, .creative').length;
    
    return indicators;
  }

  /**
   * Analyze content patterns
   */
  analyzeContentPatterns(text) {
    const patterns = {
      repetitive_phrases: 0,
      template_indicators: 0,
      boilerplate_content: 0
    };
    
    // Simple repetition detection
    const words = text.toLowerCase().split(/\s+/);
    const wordCounts = {};
    
    words.forEach(word => {
      if (word.length > 4) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
    
    patterns.repetitive_phrases = Object.values(wordCounts).filter(count => count > 5).length;
    
    // Template indicators
    const templatePattern = /\b(lorem ipsum|placeholder|sample text|template|boilerplate)\b/gi;
    patterns.template_indicators = (text.match(templatePattern) || []).length;
    
    return patterns;
  }

  /**
   * Assess uniqueness factors
   */
  assessUniquenessFactors(text, document) {
    const factors = {
      distinctive_voice: 0,
      novel_perspective: 0,
      specialized_knowledge: 0
    };
    
    // Distinctive voice (personal pronouns and opinions)
    const voicePattern = /\b(I think|I believe|in my view|my approach|my method)\b/gi;
    factors.distinctive_voice = (text.match(voicePattern) || []).length;
    
    // Specialized knowledge
    const specializedPattern = /\b(technical|advanced|professional|expert|specialized|industry)\b/gi;
    factors.specialized_knowledge = (text.match(specializedPattern) || []).length;
    
    return factors;
  }

  /**
   * Analyze voice and perspective
   */
  analyzeVoiceAndPerspective(text) {
    const analysis = {
      tone: 'neutral',
      perspective: 'third_person',
      consistency: 0
    };
    
    // Tone analysis (simplified)
    const formalPattern = /\b(furthermore|however|therefore|consequently|nonetheless)\b/gi;
    const informalPattern = /\b(yeah|okay|awesome|cool|stuff|things)\b/gi;
    
    const formalCount = (text.match(formalPattern) || []).length;
    const informalCount = (text.match(informalPattern) || []).length;
    
    if (formalCount > informalCount) {
      analysis.tone = 'formal';
    } else if (informalCount > formalCount) {
      analysis.tone = 'informal';
    }
    
    // Perspective analysis
    const firstPersonPattern = /\b(I|my|me|mine)\b/gi;
    const secondPersonPattern = /\b(you|your|yours)\b/gi;
    
    const firstPersonCount = (text.match(firstPersonPattern) || []).length;
    const secondPersonCount = (text.match(secondPersonPattern) || []).length;
    
    if (firstPersonCount > 10) {
      analysis.perspective = 'first_person';
    } else if (secondPersonCount > 10) {
      analysis.perspective = 'second_person';
    }
    
    return analysis;
  }

  /**
   * Calculate uniqueness score
   */
  calculateUniquenessScore(indicators, patterns, factors, voice) {
    let score = 70; // Base score
    
    // Originality indicators
    score += Math.min(15, indicators.personal_experience * 3);
    score += Math.min(10, indicators.original_research * 5);
    
    // Penalty for patterns
    score -= Math.min(20, patterns.repetitive_phrases * 5);
    score -= Math.min(15, patterns.template_indicators * 10);
    
    // Voice factors
    score += Math.min(10, factors.distinctive_voice * 2);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Assess quality dimensions
   */
  assessQualityDimensions(scores) {
    const dimensions = {
      information_quality: (scores.depth + scores.credibility) / 2,
      presentation_quality: (scores.clarity + scores.engagement) / 2,
      content_maintenance: (scores.freshness + scores.uniqueness) / 2
    };
    
    return dimensions;
  }

  /**
   * Calculate overall metrics
   */
  calculateOverallMetrics(analyses) {
    const metrics = {
      total_word_count: analyses.depth?.word_count || 0,
      readability_level: analyses.clarity?.reading_level || 'unknown',
      engagement_potential: analyses.engagement?.engagement_score || 0,
      authority_level: analyses.credibility?.credibility_score || 0
    };
    
    return metrics;
  }

  /**
   * Classify content quality
   */
  classifyContentQuality(score) {
    if (score >= 90) return 'exceptional';
    if (score >= 80) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 50) return 'poor';
    return 'very_poor';
  }

  /**
   * Identify improvement priorities
   */
  identifyImprovementPriorities(scores) {
    const priorities = [];
    
    Object.entries(scores).forEach(([dimension, score]) => {
      if (score < 60) {
        priorities.push({
          dimension,
          score,
          priority: score < 40 ? 'high' : 'medium',
          impact: 'significant'
        });
      }
    });
    
    return priorities.sort((a, b) => a.score - b.score);
  }

  /**
   * Generate quality insights
   */
  generateQualityInsights(assessment) {
    const insights = [];
    
    if (assessment.overall_score >= 85) {
      insights.push({
        type: 'positive',
        message: 'Content demonstrates high quality across multiple dimensions',
        impact: 'high'
      });
    }
    
    if (assessment.component_scores.credibility < 60) {
      insights.push({
        type: 'improvement',
        message: 'Content credibility could be enhanced with more authoritative sources',
        impact: 'medium'
      });
    }
    
    if (assessment.component_scores.engagement < 50) {
      insights.push({
        type: 'critical',
        message: 'Content lacks engagement elements and user focus',
        impact: 'high'
      });
    }
    
    return insights;
  }

  /**
   * Generate improvement recommendations
   */
  generateImprovementRecommendations(assessment) {
    const recommendations = [];
    
    assessment.improvement_priorities.forEach(priority => {
      recommendations.push({
        category: priority.dimension,
        priority: priority.priority,
        current_score: priority.score,
        target_score: Math.min(100, priority.score + 20),
        actions: this.getImprovementActions(priority.dimension)
      });
    });
    
    return recommendations;
  }

  /**
   * Get improvement actions for dimension
   */
  getImprovementActions(dimension) {
    const actions = {
      depth: [
        'Expand content with more detailed explanations',
        'Add examples and case studies',
        'Include supporting data and statistics'
      ],
      clarity: [
        'Simplify complex sentences',
        'Use more transition words',
        'Improve paragraph structure'
      ],
      credibility: [
        'Add citations and references',
        'Include author credentials',
        'Link to authoritative sources'
      ],
      freshness: [
        'Update content with recent information',
        'Add current examples and data',
        'Include publication and update dates'
      ],
      engagement: [
        'Add questions and calls-to-action',
        'Use second-person language',
        'Include interactive elements'
      ],
      uniqueness: [
        'Add personal insights and experiences',
        'Develop original perspective',
        'Create unique supporting content'
      ]
    };
    
    return actions[dimension] || ['Review and improve content quality'];
  }

  /**
   * Generate optimization suggestions
   */
  generateOptimizationSuggestions({ depth, clarity, engagement }) {
    const suggestions = [];
    
    if (depth?.word_count < this.options.minWordCount) {
      suggestions.push({
        type: 'content_expansion',
        message: `Expand content to at least ${this.options.minWordCount} words`,
        priority: 'high'
      });
    }
    
    if (clarity?.reading_level === 'graduate') {
      suggestions.push({
        type: 'readability',
        message: 'Simplify language for broader audience accessibility',
        priority: 'medium'
      });
    }
    
    if (engagement?.engagement_score < 60) {
      suggestions.push({
        type: 'engagement',
        message: 'Add more interactive elements and user-focused content',
        priority: 'medium'
      });
    }
    
    return suggestions;
  }

  /**
   * Handle detection errors
   */
  handleDetectionError(error) {
    return {
      success: false,
      error: error.message,
      detector: this.detectorType,
      version: this.version,
      timestamp: new Date().toISOString(),
      fallback_data: {
        quality_score: 0,
        quality_metrics: {
          word_count: 0,
          reading_level: 'unknown',
          credibility_score: 0,
          freshness_score: 0,
          engagement_score: 0,
          uniqueness_score: 0,
          comprehensiveness: 0
        }
      }
    };
  }
}

export default ContentQualityDetector;
