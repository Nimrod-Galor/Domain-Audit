/**
 * Keyword Analyzer - GPT-5 Style Business Logic
 * 
 * Analyzes detection results to provide keyword optimization insights
 * Implements SEO heuristics and best practices
 */

export class KeywordAnalyzer {
  constructor(options = {}) {
    this.options = {
      primaryKeywordThreshold: options.primaryKeywordThreshold || 0.5,
      secondaryKeywordThreshold: options.secondaryKeywordThreshold || 0.3,
      keywordDensityOptimal: options.keywordDensityOptimal || { min: 1, max: 3 },
      enableSemanticAnalysis: options.enableSemanticAnalysis !== false,
      enableLSIKeywords: options.enableLSIKeywords !== false,
      ...options
    };
  }

  /**
   * Analyze keyword optimization from detection results
   * @param {Object} detections - Detection results from all detectors
   * @returns {Object} Keyword analysis results
   */
  async analyze(detections) {
    try {
      const results = {
        success: true,
        primary: this._analyzePrimaryKeywords(detections),
        secondary: this._analyzeSecondaryKeywords(detections),
        density: this._analyzeKeywordDensity(detections),
        distribution: this._analyzeKeywordDistribution(detections),
        semantic: this.options.enableSemanticAnalysis ? 
          this._analyzeSemanticRelevance(detections) : null,
        lsi: this.options.enableLSIKeywords ? 
          this._analyzeLSIKeywords(detections) : null,
        opportunities: this._identifyKeywordOpportunities(detections),
        issues: this._identifyKeywordIssues(detections),
        score: 0,
        grade: 'F'
      };

      // Calculate overall keyword score
      results.score = this._calculateKeywordScore(results);
      results.grade = this._getKeywordGrade(results.score);

      return results;

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Analyze primary keyword optimization
   * @param {Object} detections - Detection results
   * @returns {Object} Primary keyword analysis
   * @private
   */
  _analyzePrimaryKeywords(detections) {
    const title = detections.metaTags?.basic?.title?.content || '';
    const description = detections.metaTags?.basic?.description || '';
    const h1 = detections.headings?.headings?.h1?.[0]?.text || '';
    const content = detections.content?.keywords?.keywords || [];

    // Extract potential primary keywords from title and H1
    const titleKeywords = this._extractKeywords(title);
    const h1Keywords = this._extractKeywords(h1);
    const contentKeywords = content.slice(0, 10); // Top 10 content keywords

    // Find intersection - likely primary keywords
    const primaryCandidates = this._findKeywordIntersection([
      titleKeywords,
      h1Keywords,
      contentKeywords
    ]);

    const analysis = {
      candidates: primaryCandidates,
      inTitle: {
        present: titleKeywords.length > 0,
        keywords: titleKeywords,
        optimization: this._assessTitleKeywordOptimization(title, titleKeywords)
      },
      inH1: {
        present: h1Keywords.length > 0,
        keywords: h1Keywords,
        optimization: this._assessH1KeywordOptimization(h1, h1Keywords)
      },
      inDescription: {
        present: description && this._hasKeywordOverlap(this._extractKeywords(description), primaryCandidates),
        keywords: description ? this._extractKeywords(description) : [],
        optimization: this._assessDescriptionKeywordOptimization(description, primaryCandidates)
      },
      consistency: this._assessKeywordConsistency(detections, primaryCandidates),
      focus: this._assessKeywordFocus(primaryCandidates, contentKeywords)
    };

    return analysis;
  }

  /**
   * Analyze secondary keyword optimization
   * @param {Object} detections - Detection results
   * @returns {Object} Secondary keyword analysis
   * @private
   */
  _analyzeSecondaryKeywords(detections) {
    const allKeywords = detections.content?.keywords?.keywords || [];
    const headings = this._extractHeadingKeywords(detections.headings);
    const primary = this._extractPrimaryKeywords(detections);

    // Secondary keywords are important keywords not in primary set
    const secondary = allKeywords
      .filter(keyword => !primary.includes(keyword))
      .slice(0, 15); // Top 15 secondary keywords

    return {
      keywords: secondary,
      count: secondary.length,
      inHeadings: this._analyzeSecondaryInHeadings(secondary, headings),
      distribution: this._analyzeSecondaryDistribution(secondary, detections),
      support: this._assessSecondarySupportingContent(secondary, detections),
      optimization: this._assessSecondaryOptimization(secondary, detections)
    };
  }

  /**
   * Analyze keyword density
   * @param {Object} detections - Detection results
   * @returns {Object} Keyword density analysis
   * @private
   */
  _analyzeKeywordDensity(detections) {
    const densities = detections.content?.keywords?.density || {};
    const totalWords = detections.content?.text?.wordCount || 1;
    const optimal = this.options.keywordDensityOptimal;

    const analysis = {
      total: Object.keys(densities).length,
      optimal: 0,
      overOptimized: 0,
      underOptimized: 0,
      keywords: {}
    };

    Object.entries(densities).forEach(([keyword, density]) => {
      const status = this._assessDensityStatus(density, optimal);
      analysis.keywords[keyword] = {
        density,
        status,
        frequency: Math.round((density / 100) * totalWords),
        recommendation: this._getDensityRecommendation(density, optimal)
      };

      if (status === 'optimal') analysis.optimal++;
      else if (status === 'over') analysis.overOptimized++;
      else if (status === 'under') analysis.underOptimized++;
    });

    analysis.overallHealth = this._assessOverallDensityHealth(analysis);

    return analysis;
  }

  /**
   * Analyze keyword distribution across page elements
   * @param {Object} detections - Detection results
   * @returns {Object} Keyword distribution analysis
   * @private
   */
  _analyzeKeywordDistribution(detections) {
    const keywords = detections.content?.keywords?.keywords || [];
    const topKeywords = keywords.slice(0, 5);

    const distribution = {
      title: this._getElementKeywordCoverage(
        detections.metaTags?.basic?.title?.content || '', 
        topKeywords
      ),
      description: this._getElementKeywordCoverage(
        detections.metaTags?.basic?.description || '', 
        topKeywords
      ),
      headings: this._getHeadingKeywordDistribution(detections.headings, topKeywords),
      content: this._getContentKeywordDistribution(detections.content, topKeywords),
      imageAlts: this._getImageAltKeywordCoverage(detections.content?.images, topKeywords),
      overall: this._calculateOverallDistribution(detections, topKeywords)
    };

    return distribution;
  }

  /**
   * Analyze semantic relevance of keywords
   * @param {Object} detections - Detection results
   * @returns {Object} Semantic analysis
   * @private
   */
  _analyzeSemanticRelevance(detections) {
    const keywords = detections.content?.keywords?.keywords || [];
    const phrases = detections.content?.keywords?.phrases || [];
    const content = detections.content?.text?.content || '';

    return {
      coherence: this._assessSemanticCoherence(keywords, content),
      topicClusters: this._identifyTopicClusters(keywords, phrases),
      contextualRelevance: this._assessContextualRelevance(keywords, content),
      entityRelationships: this._analyzeEntityRelationships(keywords, phrases),
      semanticGaps: this._identifySemanticGaps(keywords, content)
    };
  }

  /**
   * Analyze LSI (Latent Semantic Indexing) keywords
   * @param {Object} detections - Detection results
   * @returns {Object} LSI keyword analysis
   * @private
   */
  _analyzeLSIKeywords(detections) {
    const primary = this._extractPrimaryKeywords(detections);
    const allKeywords = detections.content?.keywords?.keywords || [];
    const phrases = detections.content?.keywords?.phrases || [];

    return {
      identified: this._identifyLSIKeywords(primary, allKeywords, phrases),
      coverage: this._assessLSICoverage(primary, allKeywords),
      opportunities: this._identifyLSIOpportunities(primary, allKeywords),
      recommendations: this._getLSIRecommendations(primary, allKeywords)
    };
  }

  /**
   * Identify keyword optimization opportunities
   * @param {Object} detections - Detection results
   * @returns {Array} Array of opportunities
   * @private
   */
  _identifyKeywordOpportunities(detections) {
    const opportunities = [];

    // Title optimization
    const title = detections.metaTags?.basic?.title?.content || '';
    if (!title) {
      opportunities.push({
        type: 'title_missing',
        priority: 'critical',
        message: 'Missing page title - add descriptive title with primary keywords',
        impact: 'high',
        effort: 'low'
      });
    } else if (title.length < 30) {
      opportunities.push({
        type: 'title_short',
        priority: 'high',
        message: 'Title is too short - consider expanding with relevant keywords',
        impact: 'medium',
        effort: 'low'
      });
    }

    // H1 optimization
    const h1Count = detections.headings?.statistics?.byLevel?.h1 || 0;
    if (h1Count === 0) {
      opportunities.push({
        type: 'h1_missing',
        priority: 'high',
        message: 'Missing H1 heading - add primary keyword-focused H1',
        impact: 'high',
        effort: 'low'
      });
    } else if (h1Count > 1) {
      opportunities.push({
        type: 'multiple_h1',
        priority: 'medium',
        message: 'Multiple H1 headings found - consolidate to single H1',
        impact: 'medium',
        effort: 'medium'
      });
    }

    // Content keyword opportunities
    const contentLength = detections.content?.text?.wordCount || 0;
    if (contentLength < 300) {
      opportunities.push({
        type: 'content_thin',
        priority: 'high',
        message: 'Content is too short - expand with keyword-rich content',
        impact: 'high',
        effort: 'high'
      });
    }

    // Keyword distribution opportunities
    const keywords = detections.content?.keywords?.keywords || [];
    if (keywords.length < 5) {
      opportunities.push({
        type: 'keyword_diversity',
        priority: 'medium',
        message: 'Limited keyword diversity - add semantically related terms',
        impact: 'medium',
        effort: 'medium'
      });
    }

    return opportunities;
  }

  /**
   * Identify keyword-related issues
   * @param {Object} detections - Detection results
   * @returns {Array} Array of issues
   * @private
   */
  _identifyKeywordIssues(detections) {
    const issues = [];

    // Keyword stuffing detection
    const densities = detections.content?.keywords?.density || {};
    const stuffedKeywords = Object.entries(densities)
      .filter(([keyword, density]) => density > 5)
      .map(([keyword]) => keyword);

    if (stuffedKeywords.length > 0) {
      issues.push({
        type: 'keyword_stuffing',
        severity: 'high',
        keywords: stuffedKeywords,
        message: 'Potential keyword stuffing detected - reduce keyword density',
        recommendation: 'Use keywords more naturally and add semantic variations'
      });
    }

    // Missing keywords in important elements
    const title = detections.metaTags?.basic?.title?.content || '';
    const description = detections.metaTags?.basic?.description || '';
    const h1 = detections.headings?.headings?.h1?.[0]?.text || '';

    if (title && !this._hasSignificantKeywords(title)) {
      issues.push({
        type: 'title_no_keywords',
        severity: 'high',
        message: 'Title lacks targeted keywords',
        recommendation: 'Include primary keywords in the title naturally'
      });
    }

    if (description && !this._hasSignificantKeywords(description)) {
      issues.push({
        type: 'description_no_keywords',
        severity: 'medium',
        message: 'Meta description lacks targeted keywords',
        recommendation: 'Include primary and secondary keywords in meta description'
      });
    }

    // Keyword cannibalization potential
    const keywordRepeats = this._detectKeywordRepeats(detections);
    if (keywordRepeats.length > 0) {
      issues.push({
        type: 'keyword_cannibalization',
        severity: 'medium',
        keywords: keywordRepeats,
        message: 'Potential keyword cannibalization detected',
        recommendation: 'Diversify keyword targeting across different pages'
      });
    }

    return issues;
  }

  // Helper methods

  /**
   * Extract keywords from text
   * @param {string} text - Text to analyze
   * @returns {Array} Array of keywords
   * @private
   */
  _extractKeywords(text) {
    if (!text) return [];
    
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this._isStopWord(word));
  }

  /**
   * Find intersection of keyword arrays
   * @param {Array} keywordArrays - Array of keyword arrays
   * @returns {Array} Intersection of keywords
   * @private
   */
  _findKeywordIntersection(keywordArrays) {
    if (keywordArrays.length === 0) return [];
    
    return keywordArrays.reduce((intersection, current) => 
      intersection.filter(keyword => current.includes(keyword))
    );
  }

  /**
   * Check if two keyword arrays have overlap
   * @param {Array} arr1 - First keyword array
   * @param {Array} arr2 - Second keyword array
   * @returns {boolean} True if overlap exists
   * @private
   */
  _hasKeywordOverlap(arr1, arr2) {
    return arr1.some(keyword => arr2.includes(keyword));
  }

  /**
   * Assess title keyword optimization
   * @param {string} title - Title text
   * @param {Array} keywords - Keywords to assess
   * @returns {Object} Title optimization assessment
   * @private
   */
  _assessTitleKeywordOptimization(title, keywords) {
    if (!title) return { score: 0, issues: ['Missing title'] };

    const issues = [];
    let score = 50; // Base score

    // Check length
    if (title.length < 30) {
      issues.push('Title too short');
      score -= 20;
    } else if (title.length > 60) {
      issues.push('Title too long');
      score -= 10;
    } else {
      score += 20;
    }

    // Check keyword placement
    if (keywords.length > 0) {
      const firstKeyword = keywords[0];
      const titleWords = title.toLowerCase().split(/\s+/);
      const keywordPosition = titleWords.indexOf(firstKeyword);
      
      if (keywordPosition === 0) {
        score += 30; // Keyword at beginning
      } else if (keywordPosition > 0 && keywordPosition <= 3) {
        score += 20; // Keyword near beginning
      } else if (keywordPosition > 3) {
        score += 10; // Keyword present but late
        issues.push('Primary keyword not at beginning of title');
      }
    } else {
      issues.push('No significant keywords in title');
      score -= 30;
    }

    return { score: Math.max(0, Math.min(100, score)), issues };
  }

  /**
   * Assess H1 keyword optimization
   * @param {string} h1 - H1 text
   * @param {Array} keywords - Keywords to assess
   * @returns {Object} H1 optimization assessment
   * @private
   */
  _assessH1KeywordOptimization(h1, keywords) {
    if (!h1) return { score: 0, issues: ['Missing H1'] };

    const issues = [];
    let score = 50; // Base score

    // Check length
    if (h1.length < 20) {
      issues.push('H1 too short');
      score -= 15;
    } else if (h1.length > 70) {
      issues.push('H1 too long');
      score -= 10;
    } else {
      score += 20;
    }

    // Check keyword presence
    if (keywords.length > 0) {
      score += 30;
    } else {
      issues.push('No significant keywords in H1');
      score -= 30;
    }

    return { score: Math.max(0, Math.min(100, score)), issues };
  }

  /**
   * Assess description keyword optimization
   * @param {string} description - Meta description
   * @param {Array} primaryKeywords - Primary keywords
   * @returns {Object} Description optimization assessment
   * @private
   */
  _assessDescriptionKeywordOptimization(description, primaryKeywords) {
    if (!description) return { score: 0, issues: ['Missing meta description'] };

    const issues = [];
    let score = 50; // Base score

    // Check length
    if (description.length < 120) {
      issues.push('Description too short');
      score -= 15;
    } else if (description.length > 160) {
      issues.push('Description too long');
      score -= 10;
    } else {
      score += 20;
    }

    // Check keyword presence
    const descKeywords = this._extractKeywords(description);
    const hasKeywords = this._hasKeywordOverlap(descKeywords, primaryKeywords);
    
    if (hasKeywords) {
      score += 30;
    } else {
      issues.push('Primary keywords not in meta description');
      score -= 20;
    }

    return { score: Math.max(0, Math.min(100, score)), issues };
  }

  /**
   * Assess keyword consistency across elements
   * @param {Object} detections - Detection results
   * @param {Array} primaryKeywords - Primary keywords
   * @returns {Object} Consistency assessment
   * @private
   */
  _assessKeywordConsistency(detections, primaryKeywords) {
    const elements = {
      title: detections.metaTags?.basic?.title?.content || '',
      description: detections.metaTags?.basic?.description || '',
      h1: detections.headings?.headings?.h1?.[0]?.text || '',
      h2: detections.headings?.headings?.h2?.map(h => h.text).join(' ') || ''
    };

    const consistency = {};
    let totalScore = 0;
    let elementCount = 0;

    Object.entries(elements).forEach(([element, text]) => {
      if (text) {
        const elementKeywords = this._extractKeywords(text);
        const overlap = this._hasKeywordOverlap(elementKeywords, primaryKeywords);
        consistency[element] = {
          hasKeywords: overlap,
          keywords: elementKeywords,
          score: overlap ? 100 : 0
        };
        totalScore += consistency[element].score;
        elementCount++;
      }
    });

    return {
      elements: consistency,
      overallScore: elementCount > 0 ? Math.round(totalScore / elementCount) : 0,
      consistentElements: Object.values(consistency).filter(el => el.hasKeywords).length
    };
  }

  /**
   * Assess keyword focus
   * @param {Array} primaryKeywords - Primary keywords
   * @param {Array} contentKeywords - All content keywords
   * @returns {Object} Focus assessment
   * @private
   */
  _assessKeywordFocus(primaryKeywords, contentKeywords) {
    if (primaryKeywords.length === 0) {
      return { score: 0, message: 'No clear primary keywords identified' };
    }

    const totalKeywords = contentKeywords.length;
    const primaryCount = primaryKeywords.length;
    const focusRatio = primaryCount / Math.max(1, totalKeywords);

    let score = 0;
    let message = '';

    if (focusRatio > 0.3) {
      score = 100;
      message = 'Excellent keyword focus';
    } else if (focusRatio > 0.2) {
      score = 80;
      message = 'Good keyword focus';
    } else if (focusRatio > 0.1) {
      score = 60;
      message = 'Moderate keyword focus';
    } else {
      score = 30;
      message = 'Poor keyword focus - content lacks clear targeting';
    }

    return { score, message, ratio: focusRatio, primaryCount, totalKeywords };
  }

  /**
   * Extract keywords from headings
   * @param {Object} headings - Headings detection results
   * @returns {Array} Array of heading keywords
   * @private
   */
  _extractHeadingKeywords(headings) {
    if (!headings?.headings) return [];

    const allHeadingText = [];
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(level => {
      if (headings.headings[level]) {
        headings.headings[level].forEach(heading => {
          allHeadingText.push(heading.text);
        });
      }
    });

    return this._extractKeywords(allHeadingText.join(' '));
  }

  /**
   * Extract primary keywords from detections
   * @param {Object} detections - Detection results
   * @returns {Array} Primary keywords
   * @private
   */
  _extractPrimaryKeywords(detections) {
    const title = detections.metaTags?.basic?.title?.content || '';
    const h1 = detections.headings?.headings?.h1?.[0]?.text || '';
    
    const titleKeywords = this._extractKeywords(title);
    const h1Keywords = this._extractKeywords(h1);
    
    return [...new Set([...titleKeywords, ...h1Keywords])];
  }

  /**
   * Assess density status
   * @param {number} density - Keyword density percentage
   * @param {Object} optimal - Optimal range
   * @returns {string} Status: 'under', 'optimal', 'over'
   * @private
   */
  _assessDensityStatus(density, optimal) {
    if (density < optimal.min) return 'under';
    if (density > optimal.max) return 'over';
    return 'optimal';
  }

  /**
   * Get density recommendation
   * @param {number} density - Current density
   * @param {Object} optimal - Optimal range
   * @returns {string} Recommendation
   * @private
   */
  _getDensityRecommendation(density, optimal) {
    if (density < optimal.min) {
      return `Increase usage (current: ${density}%, optimal: ${optimal.min}-${optimal.max}%)`;
    }
    if (density > optimal.max) {
      return `Reduce usage (current: ${density}%, optimal: ${optimal.min}-${optimal.max}%)`;
    }
    return `Well optimized (${density}%)`;
  }

  /**
   * Check if text has significant keywords
   * @param {string} text - Text to check
   * @returns {boolean} True if has significant keywords
   * @private
   */
  _hasSignificantKeywords(text) {
    const keywords = this._extractKeywords(text);
    return keywords.length >= 2; // At least 2 meaningful keywords
  }

  /**
   * Check if word is a stop word
   * @param {string} word - Word to check
   * @returns {boolean} True if stop word
   * @private
   */
  _isStopWord(word) {
    const stopWords = [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'around', 'is', 'are',
      'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do',
      'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
      'must', 'can', 'this', 'that', 'these', 'those', 'a', 'an'
    ];
    
    return stopWords.includes(word.toLowerCase());
  }

  /**
   * Calculate overall keyword score
   * @param {Object} results - Analysis results
   * @returns {number} Overall score 0-100
   * @private
   */
  _calculateKeywordScore(results) {
    let totalScore = 0;
    let weights = 0;

    // Primary keyword optimization (40% weight)
    if (results.primary?.consistency?.overallScore !== undefined) {
      totalScore += results.primary.consistency.overallScore * 0.4;
      weights += 0.4;
    }

    // Keyword density health (25% weight)
    if (results.density?.overallHealth !== undefined) {
      totalScore += results.density.overallHealth * 0.25;
      weights += 0.25;
    }

    // Distribution score (20% weight)
    if (results.distribution?.overall?.score !== undefined) {
      totalScore += results.distribution.overall.score * 0.2;
      weights += 0.2;
    }

    // Focus score (15% weight)
    if (results.primary?.focus?.score !== undefined) {
      totalScore += results.primary.focus.score * 0.15;
      weights += 0.15;
    }

    return weights > 0 ? Math.round(totalScore / weights) : 0;
  }

  /**
   * Get keyword grade from score
   * @param {number} score - Keyword score
   * @returns {string} Grade A-F
   * @private
   */
  _getKeywordGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  // Placeholder methods for advanced features
  // These would be implemented with more sophisticated algorithms

  _analyzeSecondaryInHeadings() { return { coverage: 0, score: 50 }; }
  _analyzeSecondaryDistribution() { return { score: 50 }; }
  _assessSecondarySupportingContent() { return { score: 50 }; }
  _assessSecondaryOptimization() { return { score: 50 }; }
  _assessOverallDensityHealth() { return 50; }
  _getElementKeywordCoverage() { return { coverage: 0, score: 50 }; }
  _getHeadingKeywordDistribution() { return { score: 50 }; }
  _getContentKeywordDistribution() { return { score: 50 }; }
  _getImageAltKeywordCoverage() { return { coverage: 0, score: 50 }; }
  _calculateOverallDistribution() { return { score: 50 }; }
  _assessSemanticCoherence() { return { score: 50 }; }
  _identifyTopicClusters() { return []; }
  _assessContextualRelevance() { return { score: 50 }; }
  _analyzeEntityRelationships() { return []; }
  _identifySemanticGaps() { return []; }
  _identifyLSIKeywords() { return []; }
  _assessLSICoverage() { return { score: 50 }; }
  _identifyLSIOpportunities() { return []; }
  _getLSIRecommendations() { return []; }
  _detectKeywordRepeats() { return []; }
}

export default KeywordAnalyzer;
