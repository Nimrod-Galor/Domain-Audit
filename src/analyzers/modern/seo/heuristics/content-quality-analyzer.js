/**
 * ============================================================================
 * CONTENT QUALITY ANALYZER - CLAUDE AI ENHANCED HEURISTICS
 * ============================================================================
 * 
 * Advanced content quality analysis for SEO optimization
 * Part of the Combined Approach SEO Analyzer (8th Implementation)
 * 
 * Features:
 * - Content depth and expertise analysis
 * - E-A-T (Expertise, Authoritativeness, Trustworthiness) assessment
 * - Topic relevance and semantic analysis
 * - Content freshness and maintenance
 * - User engagement optimization
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration Combined Approach Pattern - Claude AI Enhanced Heuristics
 */

export class ContentQualityAnalyzer {
  constructor(config = {}) {
    this.config = {
      enableEATAnalysis: config.enableEATAnalysis !== false,
      enableTopicAnalysis: config.enableTopicAnalysis !== false,
      enableFreshnessAnalysis: config.enableFreshnessAnalysis !== false,
      enableEngagementAnalysis: config.enableEngagementAnalysis !== false,
      analysisDepth: config.analysisDepth || 'comprehensive',
      minContentLength: config.minContentLength || 300,
      optimalContentLength: config.optimalContentLength || 1500,
      ...config
    };

    this.version = '1.0.0';
    this.analyzerType = 'content_quality_heuristics';
    
    // Content quality thresholds
    this.qualityThresholds = {
      minWordsForAnalysis: 100,
      optimalWordCount: { min: 300, max: 2000 },
      maxWordCount: 3000,
      readabilityTarget: 70,
      topicFocusTarget: 0.15,
      keywordDensityRange: { min: 0.005, max: 0.03 },
      freshnessPeriod: 365 // days
    };

    // E-A-T indicators
    this.eatIndicators = {
      expertise: [
        'author', 'expert', 'specialist', 'professional', 'certified',
        'qualified', 'experienced', 'authority', 'credentials', 'degree'
      ],
      authoritativeness: [
        'published', 'cited', 'research', 'study', 'data', 'statistics',
        'source', 'reference', 'evidence', 'peer-reviewed'
      ],
      trustworthiness: [
        'contact', 'about', 'privacy', 'terms', 'secure', 'verified',
        'testimonial', 'review', 'guarantee', 'certified'
      ]
    };

    this.cache = new Map();
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'ContentQualityAnalyzer',
      version: this.version,
      type: this.analyzerType,
      description: 'Claude AI enhanced content quality analysis for SEO optimization',
      capabilities: [
        'content_depth_analysis',
        'eat_assessment',
        'topic_relevance_analysis',
        'semantic_content_analysis',
        'freshness_evaluation',
        'engagement_optimization',
        'content_expertise_scoring'
      ],
      thresholds: this.qualityThresholds,
      eatSupport: this.config.enableEATAnalysis,
      topicAnalysis: this.config.enableTopicAnalysis,
      performance: 'High',
      accuracy: 'Claude AI Enhanced'
    };
  }

  /**
   * Analyze content quality using Claude AI enhanced heuristics
   * @param {Object} context - Analysis context containing detections
   * @returns {Promise<Object>} Content quality analysis results
   */
  async analyze(context) {
    try {
      const { detections } = context;
      
      if (!detections || !detections.content) {
        throw new Error('Content detections are required for quality analysis');
      }

      // Check cache
      const cacheKey = this._generateCacheKey(detections);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const startTime = Date.now();

      // Phase 1: Content depth and comprehensiveness analysis
      const depthAnalysis = this._analyzeContentDepth(detections.content);

      // Phase 2: E-A-T (Expertise, Authoritativeness, Trustworthiness) assessment
      const eatAnalysis = this._analyzeEAT(detections);

      // Phase 3: Topic relevance and semantic analysis
      const topicAnalysis = this._analyzeTopicRelevance(detections.content);

      // Phase 4: Content freshness and maintenance
      const freshnessAnalysis = this._analyzeFreshness(detections);

      // Phase 5: User engagement optimization
      const engagementAnalysis = this._analyzeEngagement(detections);

      // Phase 6: Content structure and organization
      const structureAnalysis = this._analyzeContentStructure(detections);

      // Phase 7: Overall quality scoring
      const qualityScore = this._calculateOverallQuality({
        depth: depthAnalysis,
        eat: eatAnalysis,
        topic: topicAnalysis,
        freshness: freshnessAnalysis,
        engagement: engagementAnalysis,
        structure: structureAnalysis
      });

      // Compile results
      const results = {
        success: true,
        analyzerType: this.analyzerType,
        
        // Core analysis results
        depth: depthAnalysis,
        eat: eatAnalysis,
        topic: topicAnalysis,
        freshness: freshnessAnalysis,
        engagement: engagementAnalysis,
        structure: structureAnalysis,
        
        // Overall quality assessment
        overallScore: qualityScore.score,
        grade: qualityScore.grade,
        qualityLevel: qualityScore.level,
        
        // Strategic insights
        strengths: qualityScore.strengths,
        weaknesses: qualityScore.weaknesses,
        recommendations: qualityScore.recommendations,
        optimizationPriorities: qualityScore.priorities,
        
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
        error: `Content quality analysis failed: ${error.message}`,
        analyzerType: this.analyzerType
      };
    }
  }

  /**
   * Analyze content depth and comprehensiveness
   * @param {Object} contentData - Content detection data
   * @returns {Object} Content depth analysis
   */
  _analyzeContentDepth(contentData) {
    const { text, structure } = contentData;
    
    if (!text || !text.mainContent) {
      return {
        score: 0,
        grade: 'F',
        issues: ['No main content found'],
        recommendations: ['Add substantial content to the page']
      };
    }

    const { totalWords, totalLength, sentences, paragraphs } = text;
    
    let score = 100;
    const issues = [];
    const recommendations = [];
    const strengths = [];

    // Word count analysis
    if (totalWords < this.qualityThresholds.minWordsForAnalysis) {
      score -= 40;
      issues.push('Content too short for meaningful analysis');
      recommendations.push('Expand content to at least 300 words');
    } else if (totalWords < this.qualityThresholds.optimalWordCount.min) {
      score -= 20;
      issues.push('Content below optimal length');
      recommendations.push('Expand content for better depth');
    } else if (totalWords >= this.qualityThresholds.optimalWordCount.min && 
               totalWords <= this.qualityThresholds.optimalWordCount.max) {
      strengths.push('Optimal content length for depth');
    } else if (totalWords > this.qualityThresholds.maxWordCount) {
      score -= 10;
      issues.push('Content very long');
      recommendations.push('Consider breaking into sections or multiple pages');
    }

    // Content structure depth
    const hasSubsections = structure?.sections?.length > 3;
    const hasLists = structure?.lists?.total > 2;
    const hasTables = structure?.tables?.count > 0;
    
    if (hasSubsections) {
      score += 10;
      strengths.push('Well-organized content structure');
    } else if (totalWords > 500) {
      score -= 15;
      issues.push('Long content lacks clear subsections');
      recommendations.push('Add headings to structure content');
    }

    if (hasLists) {
      score += 5;
      strengths.push('Good use of lists for readability');
    }

    if (hasTables && structure.tables.count <= 3) {
      score += 5;
      strengths.push('Appropriate use of tables for data');
    }

    // Paragraph analysis
    const avgParagraphLength = paragraphs.length > 0 ? totalWords / paragraphs.length : 0;
    if (avgParagraphLength > 100) {
      score -= 10;
      issues.push('Paragraphs too long on average');
      recommendations.push('Break up long paragraphs for readability');
    } else if (avgParagraphLength >= 30 && avgParagraphLength <= 80) {
      strengths.push('Well-sized paragraphs for readability');
    }

    // Sentence variety analysis
    const avgSentenceLength = sentences.length > 0 ? totalWords / sentences.length : 0;
    if (avgSentenceLength > 25) {
      score -= 10;
      issues.push('Sentences too long on average');
      recommendations.push('Use shorter, clearer sentences');
    } else if (avgSentenceLength >= 12 && avgSentenceLength <= 20) {
      strengths.push('Good sentence length for clarity');
    }

    return {
      score: Math.max(0, score),
      grade: this._calculateGrade(score),
      issues,
      recommendations,
      strengths,
      
      metrics: {
        wordCount: totalWords,
        paragraphCount: paragraphs.length,
        sentenceCount: sentences.length,
        avgParagraphLength,
        avgSentenceLength,
        hasStructure: hasSubsections,
        depthScore: this._calculateDepthScore(totalWords, hasSubsections, hasLists)
      },
      
      analysis: {
        lengthCategory: this._categorizeContentLength(totalWords),
        structuralComplexity: this._assessStructuralComplexity(structure),
        comprehensiveness: this._assessComprehensiveness(totalWords, structure)
      }
    };
  }

  /**
   * Analyze E-A-T (Expertise, Authoritativeness, Trustworthiness)
   * @param {Object} detections - All detection results
   * @returns {Object} E-A-T analysis
   */
  _analyzeEAT(detections) {
    const { content, metaTags, links } = detections;
    
    let expertiseScore = 50;
    let authoritativenessScore = 50;
    let trustworthinessScore = 50;
    
    const expertiseIndicators = [];
    const authorityIndicators = [];
    const trustIndicators = [];
    
    // Analyze content for E-A-T indicators
    if (content && content.text && content.text.mainContent) {
      const contentText = content.text.mainContent.text.toLowerCase();
      
      // Expertise indicators
      this.eatIndicators.expertise.forEach(indicator => {
        if (contentText.includes(indicator)) {
          expertiseScore += 5;
          expertiseIndicators.push(indicator);
        }
      });
      
      // Authoritativeness indicators
      this.eatIndicators.authoritativeness.forEach(indicator => {
        if (contentText.includes(indicator)) {
          authoritativenessScore += 5;
          authorityIndicators.push(indicator);
        }
      });
      
      // Trustworthiness indicators
      this.eatIndicators.trustworthiness.forEach(indicator => {
        if (contentText.includes(indicator)) {
          trustworthinessScore += 5;
          trustIndicators.push(indicator);
        }
      });
    }

    // Check meta tags for author information
    if (metaTags && metaTags.basic && metaTags.basic.additional) {
      const hasAuthor = metaTags.basic.additional.author.content;
      if (hasAuthor) {
        expertiseScore += 15;
        trustworthinessScore += 10;
        expertiseIndicators.push('author_meta_tag');
      }
    }

    // Check for external authoritative links
    if (links && links.classification && links.classification.external.length > 0) {
      const authoritativeDomains = ['wikipedia.org', 'gov', 'edu', 'pubmed', 'scholar.google'];
      const hasAuthoritativeLinks = links.classification.external.some(link =>
        authoritativeDomains.some(domain => link.absoluteUrl.includes(domain))
      );
      
      if (hasAuthoritativeLinks) {
        authoritativenessScore += 20;
        authorityIndicators.push('authoritative_external_links');
      }
    }

    // Cap scores at 100
    expertiseScore = Math.min(100, expertiseScore);
    authoritativenessScore = Math.min(100, authoritativenessScore);
    trustworthinessScore = Math.min(100, trustworthinessScore);

    const overallEATScore = (expertiseScore + authoritativenessScore + trustworthinessScore) / 3;

    return {
      score: overallEATScore,
      grade: this._calculateGrade(overallEATScore),
      
      expertise: {
        score: expertiseScore,
        indicators: expertiseIndicators,
        grade: this._calculateGrade(expertiseScore)
      },
      
      authoritativeness: {
        score: authoritativenessScore,
        indicators: authorityIndicators,
        grade: this._calculateGrade(authoritativenessScore)
      },
      
      trustworthiness: {
        score: trustworthinessScore,
        indicators: trustIndicators,
        grade: this._calculateGrade(trustworthinessScore)
      },
      
      recommendations: this._generateEATRecommendations(
        expertiseScore, authoritativenessScore, trustworthinessScore
      ),
      
      analysis: {
        hasExpertiseSignals: expertiseIndicators.length > 0,
        hasAuthoritySignals: authorityIndicators.length > 0,
        hasTrustSignals: trustIndicators.length > 0,
        eatReadiness: overallEATScore >= 70,
        strengthArea: this._identifyEATStrength(expertiseScore, authoritativenessScore, trustworthinessScore),
        improvementArea: this._identifyEATWeakness(expertiseScore, authoritativenessScore, trustworthinessScore)
      }
    };
  }

  /**
   * Analyze topic relevance and semantic coherence
   * @param {Object} contentData - Content detection data
   * @returns {Object} Topic analysis
   */
  _analyzeTopicRelevance(contentData) {
    const { text } = contentData;
    
    if (!text || !text.words || text.words.length === 0) {
      return {
        score: 0,
        grade: 'F',
        issues: ['No content available for topic analysis'],
        recommendations: ['Add substantive content']
      };
    }

    const { words, density } = text;
    
    // Calculate topic focus
    const topicFocus = this._calculateTopicFocus(words, density);
    
    // Analyze semantic relationships
    const semanticAnalysis = this._analyzeSemanticRelationships(words);
    
    // Check for topic drift
    const topicCoherence = this._analyzeTopicCoherence(words);
    
    let score = 70; // Base score
    const issues = [];
    const recommendations = [];
    const strengths = [];

    // Topic focus scoring
    if (topicFocus.score >= 80) {
      score += 20;
      strengths.push('Strong topic focus');
    } else if (topicFocus.score >= 60) {
      score += 10;
      strengths.push('Good topic focus');
    } else {
      score -= 15;
      issues.push('Weak topic focus');
      recommendations.push('Strengthen focus on main topic');
    }

    // Semantic coherence scoring
    if (semanticAnalysis.coherenceScore >= 75) {
      score += 15;
      strengths.push('Good semantic coherence');
    } else if (semanticAnalysis.coherenceScore < 50) {
      score -= 20;
      issues.push('Poor semantic coherence');
      recommendations.push('Improve content flow and topic connections');
    }

    // Topic distribution analysis
    if (topicCoherence.isBalanced) {
      score += 10;
      strengths.push('Balanced topic distribution');
    } else {
      score -= 10;
      issues.push('Unbalanced topic distribution');
      recommendations.push('Better distribute topic coverage');
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      grade: this._calculateGrade(score),
      issues,
      recommendations,
      strengths,
      
      topicFocus,
      semantic: semanticAnalysis,
      coherence: topicCoherence,
      
      analysis: {
        primaryTopics: topicFocus.primaryTopics,
        semanticDensity: semanticAnalysis.density,
        topicBalance: topicCoherence.balance,
        relevanceScore: topicFocus.relevance
      }
    };
  }

  /**
   * Analyze content freshness and maintenance
   * @param {Object} detections - All detection results
   * @returns {Object} Freshness analysis
   */
  _analyzeFreshness(detections) {
    const { content, metaTags } = detections;
    
    let score = 70; // Neutral base score
    const issues = [];
    const recommendations = [];
    const indicators = [];

    // Check for date information
    const hasDateMeta = metaTags && metaTags.basic && 
                       (metaTags.basic.core.title.content.match(/\d{4}/) ||
                        metaTags.basic.core.description.content.match(/\d{4}/));
    
    if (hasDateMeta) {
      score += 10;
      indicators.push('date_in_meta');
    }

    // Check for freshness indicators in content
    if (content && content.text && content.text.mainContent) {
      const contentText = content.text.mainContent.text.toLowerCase();
      
      const freshnessIndicators = [
        'updated', 'latest', 'new', 'recent', 'current', '2024', '2023',
        'revised', 'modified', 'refreshed', 'today', 'now'
      ];
      
      const foundIndicators = freshnessIndicators.filter(indicator =>
        contentText.includes(indicator)
      );
      
      if (foundIndicators.length > 0) {
        score += foundIndicators.length * 3;
        indicators.push(...foundIndicators);
      } else {
        score -= 10;
        issues.push('No freshness indicators found');
        recommendations.push('Add date references or update indicators');
      }
      
      // Check for outdated references
      const outdatedIndicators = ['2019', '2020', '2021', 'last year', 'previous'];
      const hasOutdated = outdatedIndicators.some(indicator =>
        contentText.includes(indicator)
      );
      
      if (hasOutdated) {
        score -= 15;
        issues.push('Contains potentially outdated references');
        recommendations.push('Update temporal references');
      }
    }

    // Check for maintenance indicators
    const maintenanceScore = this._assessContentMaintenance(content);
    score = (score + maintenanceScore) / 2;

    return {
      score: Math.max(0, Math.min(100, score)),
      grade: this._calculateGrade(score),
      issues,
      recommendations,
      
      indicators,
      hasDateInfo: hasDateMeta,
      maintenanceScore,
      
      analysis: {
        freshnessLevel: this._categorizeFreshness(score),
        needsUpdate: score < 60,
        wellMaintained: maintenanceScore >= 75
      }
    };
  }

  /**
   * Analyze user engagement optimization
   * @param {Object} detections - All detection results
   * @returns {Object} Engagement analysis
   */
  _analyzeEngagement(detections) {
    const { content, structure } = detections;
    
    let score = 60; // Base score
    const engagementFactors = [];
    const issues = [];
    const recommendations = [];

    // Visual engagement elements
    if (content && content.media) {
      const { images, videos } = content.media;
      
      if (images.length > 0) {
        score += Math.min(images.length * 2, 15);
        engagementFactors.push(`${images.length} images for visual appeal`);
      } else {
        score -= 10;
        issues.push('No images for visual engagement');
        recommendations.push('Add relevant images to break up text');
      }
      
      if (videos.length > 0) {
        score += Math.min(videos.length * 5, 20);
        engagementFactors.push(`${videos.length} videos for rich media`);
      }
    }

    // Interactive elements
    if (structure && structure.lists) {
      const { total: listCount } = structure.lists;
      
      if (listCount > 0) {
        score += Math.min(listCount * 3, 12);
        engagementFactors.push('Lists for easy scanning');
      }
    }

    // Content structure for engagement
    if (content && content.text) {
      const { paragraphCount, totalWords } = content.text;
      const avgParagraphLength = paragraphCount > 0 ? totalWords / paragraphCount : 0;
      
      if (avgParagraphLength <= 50) {
        score += 10;
        engagementFactors.push('Short paragraphs for readability');
      } else if (avgParagraphLength > 100) {
        score -= 15;
        issues.push('Paragraphs too long for easy reading');
        recommendations.push('Break up long paragraphs');
      }
    }

    // Call-to-action analysis
    const ctaAnalysis = this._analyzeCTAPresence(content);
    score += ctaAnalysis.score;
    if (ctaAnalysis.hasCTA) {
      engagementFactors.push('Call-to-action elements present');
    } else {
      issues.push('No clear call-to-action');
      recommendations.push('Add clear call-to-action elements');
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      grade: this._calculateGrade(score),
      issues,
      recommendations,
      
      engagementFactors,
      cta: ctaAnalysis,
      
      analysis: {
        visualEngagement: (content?.media?.images?.length || 0) > 0,
        interactiveElements: (structure?.lists?.total || 0) > 2,
        readabilityOptimized: score >= 75,
        engagementLevel: this._categorizeEngagement(score)
      }
    };
  }

  /**
   * Analyze content structure and organization
   * @param {Object} detections - All detection results
   * @returns {Object} Structure analysis
   */
  _analyzeContentStructure(detections) {
    const { headings, content } = detections;
    
    let score = 70; // Base score
    const issues = [];
    const recommendations = [];
    const strengths = [];

    // Heading structure analysis
    if (headings && headings.hierarchy) {
      const { score: headingScore, isValid } = headings.hierarchy;
      
      score = (score + headingScore) / 2;
      
      if (isValid) {
        strengths.push('Logical heading hierarchy');
      } else {
        issues.push('Poor heading structure');
        recommendations.push('Fix heading hierarchy');
      }
    }

    // Content organization
    if (content && content.structure) {
      const { semantic, lists, tables } = content.structure;
      
      if (semantic.hasMain) {
        score += 10;
        strengths.push('Semantic HTML structure');
      } else {
        score -= 15;
        issues.push('Missing semantic structure');
        recommendations.push('Use semantic HTML elements');
      }
      
      if (lists.total > 0) {
        score += 5;
        strengths.push('Good use of lists');
      }
      
      if (tables.count > 0 && tables.count <= 3) {
        score += 5;
        strengths.push('Appropriate table usage');
      }
    }

    return {
      score: Math.max(0, score),
      grade: this._calculateGrade(score),
      issues,
      recommendations,
      strengths,
      
      analysis: {
        hasLogicalStructure: (headings?.hierarchy?.isValid || false),
        usesSemanticHTML: (content?.structure?.semantic?.hasMain || false),
        structureQuality: this._categorizeStructureQuality(score)
      }
    };
  }

  /**
   * Calculate overall content quality score
   * @param {Object} analyses - All analysis results
   * @returns {Object} Overall quality assessment
   */
  _calculateOverallQuality(analyses) {
    const { depth, eat, topic, freshness, engagement, structure } = analyses;
    
    // Weighted scoring
    const weights = {
      depth: 0.25,      // 25% - Content depth is crucial
      eat: 0.20,        // 20% - E-A-T is important for authority
      topic: 0.20,      // 20% - Topic relevance for SEO
      freshness: 0.15,  // 15% - Freshness for currency
      engagement: 0.10, // 10% - Engagement for user experience
      structure: 0.10   // 10% - Structure for readability
    };
    
    const weightedScore = 
      (depth.score * weights.depth) +
      (eat.score * weights.eat) +
      (topic.score * weights.topic) +
      (freshness.score * weights.freshness) +
      (engagement.score * weights.engagement) +
      (structure.score * weights.structure);

    const grade = this._calculateGrade(weightedScore);
    const level = this._categorizeQualityLevel(weightedScore);

    // Compile strengths and weaknesses
    const allStrengths = [
      ...(depth.strengths || []),
      ...(eat.expertise?.indicators || []).map(i => `Expertise: ${i}`),
      ...(topic.strengths || []),
      ...(engagement.engagementFactors || []),
      ...(structure.strengths || [])
    ];

    const allWeaknesses = [
      ...(depth.issues || []),
      ...(eat.recommendations || []),
      ...(topic.issues || []),
      ...(freshness.issues || []),
      ...(engagement.issues || []),
      ...(structure.issues || [])
    ];

    const recommendations = [
      ...(depth.recommendations || []),
      ...(eat.recommendations || []),
      ...(topic.recommendations || []),
      ...(freshness.recommendations || []),
      ...(engagement.recommendations || []),
      ...(structure.recommendations || [])
    ];

    // Identify optimization priorities
    const priorities = this._identifyOptimizationPriorities(analyses);

    return {
      score: weightedScore,
      grade,
      level,
      strengths: allStrengths.slice(0, 10), // Top 10
      weaknesses: allWeaknesses.slice(0, 8), // Top 8
      recommendations: recommendations.slice(0, 12), // Top 12
      priorities,
      
      breakdown: {
        depth: { score: depth.score, weight: weights.depth },
        eat: { score: eat.score, weight: weights.eat },
        topic: { score: topic.score, weight: weights.topic },
        freshness: { score: freshness.score, weight: weights.freshness },
        engagement: { score: engagement.score, weight: weights.engagement },
        structure: { score: structure.score, weight: weights.structure }
      }
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  _calculateDepthScore(wordCount, hasStructure, hasLists) {
    let score = Math.min(wordCount / 10, 100); // Base on word count
    if (hasStructure) score += 15;
    if (hasLists) score += 10;
    return Math.min(100, score);
  }

  _categorizeContentLength(wordCount) {
    if (wordCount < 100) return 'very_short';
    if (wordCount < 300) return 'short';
    if (wordCount < 800) return 'medium';
    if (wordCount < 1500) return 'long';
    return 'very_long';
  }

  _assessStructuralComplexity(structure) {
    if (!structure) return 'simple';
    
    const complexity = 
      (structure.sections?.length || 0) +
      (structure.lists?.total || 0) +
      (structure.tables?.count || 0);
    
    if (complexity >= 10) return 'complex';
    if (complexity >= 5) return 'moderate';
    return 'simple';
  }

  _assessComprehensiveness(wordCount, structure) {
    let score = 0;
    
    // Word count contribution
    if (wordCount >= 1000) score += 40;
    else if (wordCount >= 500) score += 25;
    else if (wordCount >= 300) score += 15;
    
    // Structure contribution
    if (structure?.sections?.length >= 5) score += 30;
    else if (structure?.sections?.length >= 3) score += 20;
    
    if (structure?.lists?.total >= 3) score += 15;
    if (structure?.tables?.count > 0) score += 15;
    
    return Math.min(100, score);
  }

  _generateEATRecommendations(expertiseScore, authorityScore, trustScore) {
    const recommendations = [];
    
    if (expertiseScore < 70) {
      recommendations.push('Add author credentials and expertise indicators');
      recommendations.push('Include professional qualifications or certifications');
    }
    
    if (authorityScore < 70) {
      recommendations.push('Cite authoritative sources and research');
      recommendations.push('Link to reputable external sources');
    }
    
    if (trustScore < 70) {
      recommendations.push('Add contact information and about page');
      recommendations.push('Include testimonials or reviews if applicable');
    }
    
    return recommendations;
  }

  _identifyEATStrength(expertise, authority, trust) {
    const scores = { expertise, authority, trust };
    const highest = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    return highest;
  }

  _identifyEATWeakness(expertise, authority, trust) {
    const scores = { expertise, authority, trust };
    const lowest = Object.keys(scores).reduce((a, b) => scores[a] < scores[b] ? a : b);
    return lowest;
  }

  _calculateTopicFocus(words, density) {
    // Simplified topic focus calculation
    const topWords = Object.entries(density)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    const primaryTopics = topWords.slice(0, 3).map(([word]) => word);
    const topicConcentration = topWords.slice(0, 5).reduce((sum, [, freq]) => sum + freq, 0);
    
    return {
      score: Math.min(topicConcentration * 1000, 100), // Scale to 0-100
      primaryTopics,
      concentration: topicConcentration,
      relevance: topicConcentration > 0.1 ? 85 : 60
    };
  }

  _analyzeSemanticRelationships(words) {
    // Simplified semantic analysis
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const vocabularyDiversity = uniqueWords.size / words.length;
    
    return {
      coherenceScore: Math.min(vocabularyDiversity * 150, 100),
      density: vocabularyDiversity,
      relationshipStrength: vocabularyDiversity > 0.4 ? 'strong' : 'weak'
    };
  }

  _analyzeTopicCoherence(words) {
    // Simplified coherence analysis
    const wordGroups = this._groupWordsByTopic(words);
    const isBalanced = wordGroups.length <= 5 && wordGroups.length >= 2;
    
    return {
      isBalanced,
      balance: isBalanced ? 85 : 60,
      topicGroups: wordGroups.length
    };
  }

  _groupWordsByTopic(words) {
    // Simplified topic grouping - count unique meaningful words
    const meaningfulWords = words.filter(word => 
      word.length > 4 && !['this', 'that', 'with', 'from', 'they', 'were', 'been'].includes(word.toLowerCase())
    );
    
    const uniqueMeaningful = new Set(meaningfulWords.map(w => w.toLowerCase()));
    
    // Group into approximate topic clusters (simplified)
    const groupSize = Math.max(Math.floor(uniqueMeaningful.size / 5), 1);
    const groups = [];
    
    let current = [];
    Array.from(uniqueMeaningful).forEach((word, index) => {
      current.push(word);
      if (current.length >= groupSize || index === uniqueMeaningful.size - 1) {
        groups.push(current);
        current = [];
      }
    });
    
    return groups;
  }

  _assessContentMaintenance(content) {
    // Simplified maintenance assessment
    if (!content || !content.text) return 50;
    
    const { totalWords, sentences } = content.text;
    const avgSentenceLength = sentences.length > 0 ? totalWords / sentences.length : 0;
    
    let score = 70; // Base maintenance score
    
    // Well-structured content suggests maintenance
    if (avgSentenceLength >= 10 && avgSentenceLength <= 20) score += 15;
    if (totalWords >= 300) score += 10;
    
    return Math.min(100, score);
  }

  _categorizeFreshness(score) {
    if (score >= 85) return 'very_fresh';
    if (score >= 70) return 'fresh';
    if (score >= 55) return 'moderate';
    if (score >= 40) return 'stale';
    return 'outdated';
  }

  _analyzeCTAPresence(content) {
    if (!content || !content.text || !content.text.mainContent) {
      return { score: 0, hasCTA: false };
    }
    
    const text = content.text.mainContent.text.toLowerCase();
    const ctaWords = ['contact', 'buy', 'purchase', 'subscribe', 'download', 'learn more', 'get started', 'sign up'];
    
    const foundCTAs = ctaWords.filter(cta => text.includes(cta));
    
    return {
      score: Math.min(foundCTAs.length * 15, 30),
      hasCTA: foundCTAs.length > 0,
      ctaTypes: foundCTAs
    };
  }

  _categorizeEngagement(score) {
    if (score >= 85) return 'highly_engaging';
    if (score >= 70) return 'engaging';
    if (score >= 55) return 'moderately_engaging';
    if (score >= 40) return 'poorly_engaging';
    return 'not_engaging';
  }

  _categorizeStructureQuality(score) {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 55) return 'fair';
    if (score >= 40) return 'poor';
    return 'very_poor';
  }

  _categorizeQualityLevel(score) {
    if (score >= 90) return 'exceptional';
    if (score >= 80) return 'high';
    if (score >= 70) return 'good';
    if (score >= 60) return 'adequate';
    if (score >= 50) return 'below_average';
    return 'poor';
  }

  _identifyOptimizationPriorities(analyses) {
    const priorities = [];
    
    // Priority based on lowest scores and impact
    if (analyses.depth.score < 70) {
      priorities.push({ area: 'content_depth', priority: 'high', impact: 'significant' });
    }
    
    if (analyses.eat.score < 60) {
      priorities.push({ area: 'expertise_authority_trust', priority: 'high', impact: 'significant' });
    }
    
    if (analyses.topic.score < 65) {
      priorities.push({ area: 'topic_focus', priority: 'medium', impact: 'moderate' });
    }
    
    if (analyses.freshness.score < 60) {
      priorities.push({ area: 'content_freshness', priority: 'medium', impact: 'moderate' });
    }
    
    if (analyses.engagement.score < 65) {
      priorities.push({ area: 'user_engagement', priority: 'medium', impact: 'moderate' });
    }
    
    return priorities.slice(0, 5); // Top 5 priorities
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

  _generateCacheKey(detections) {
    const contentLength = detections?.content?.text?.totalLength || 0;
    const metaTitle = detections?.metaTags?.basic?.core?.title?.content || '';
    return btoa(`${contentLength}_${metaTitle.substring(0, 20)}`).slice(0, 20);
  }
}

export default ContentQualityAnalyzer;
