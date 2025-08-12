/**
 * Content Quality Analyzer - GPT-5 Style Business Logic
 * 
 * Analyzes content quality and SEO value from detection results
 * Implements content optimization heuristics and best practices
 */

export class ContentQualityAnalyzer {
  constructor(options = {}) {
    this.options = {
      minimumWordCount: options.minimumWordCount || 300,
      optimalWordCount: options.optimalWordCount || { min: 600, max: 2000 },
      readabilityThreshold: options.readabilityThreshold || 60,
      duplicateContentThreshold: options.duplicateContentThreshold || 0.8,
      enableReadabilityAnalysis: options.enableReadabilityAnalysis !== false,
      enableStructureAnalysis: options.enableStructureAnalysis !== false,
      ...options
    };
  }

  /**
   * Analyze content quality from detection results
   * @param {Object} detections - Detection results from all detectors
   * @returns {Object} Content quality analysis results
   */
  async analyze(detections) {
    try {
      const results = {
        success: true,
        length: this._analyzeContentLength(detections),
        readability: this.options.enableReadabilityAnalysis ? 
          this._analyzeReadability(detections) : null,
        structure: this.options.enableStructureAnalysis ? 
          this._analyzeContentStructure(detections) : null,
        uniqueness: this._analyzeContentUniqueness(detections),
        multimedia: this._analyzeMultimediaContent(detections),
        engagement: this._analyzeEngagementFactors(detections),
        accessibility: this._analyzeContentAccessibility(detections),
        freshness: this._analyzeContentFreshness(detections),
        expertise: this._analyzeExpertiseSignals(detections),
        issues: this._identifyContentIssues(detections),
        opportunities: this._identifyContentOpportunities(detections),
        score: 0,
        grade: 'F'
      };

      // Calculate overall content quality score
      results.score = this._calculateContentQualityScore(results);
      results.grade = this._getContentGrade(results.score);

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
   * Analyze content length and word count optimization
   * @param {Object} detections - Detection results
   * @returns {Object} Content length analysis
   * @private
   */
  _analyzeContentLength(detections) {
    const wordCount = detections.content?.text?.wordCount || 0;
    const characterCount = detections.content?.text?.characterCount || 0;
    const sentenceCount = detections.content?.text?.sentenceCount || 0;
    const paragraphCount = detections.content?.text?.paragraphCount || 0;

    const analysis = {
      wordCount,
      characterCount,
      sentenceCount,
      paragraphCount,
      status: this._assessContentLengthStatus(wordCount),
      metrics: {
        avgWordsPerSentence: sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0,
        avgWordsPerParagraph: paragraphCount > 0 ? Math.round(wordCount / paragraphCount) : 0,
        avgSentencesPerParagraph: paragraphCount > 0 ? Math.round(sentenceCount / paragraphCount) : 0
      },
      recommendations: this._getContentLengthRecommendations(wordCount),
      score: this._calculateLengthScore(wordCount)
    };

    return analysis;
  }

  /**
   * Analyze content readability
   * @param {Object} detections - Detection results
   * @returns {Object} Readability analysis
   * @private
   */
  _analyzeReadability(detections) {
    const readability = detections.content?.text?.readability;
    
    if (!readability) {
      return {
        score: 0,
        grade: 'Unknown',
        issues: ['Readability data not available'],
        recommendations: ['Ensure content has sufficient text for analysis']
      };
    }

    const fleschScore = readability.fleschScore || 0;
    const grade = readability.grade || 'Unknown';
    const avgSentenceLength = readability.avgSentenceLength || 0;
    const avgSyllablesPerWord = readability.avgSyllablesPerWord || 0;

    const analysis = {
      fleschScore,
      grade,
      avgSentenceLength,
      avgSyllablesPerWord,
      status: this._assessReadabilityStatus(fleschScore),
      issues: this._identifyReadabilityIssues(readability),
      recommendations: this._getReadabilityRecommendations(readability),
      score: this._calculateReadabilityScore(fleschScore)
    };

    return analysis;
  }

  /**
   * Analyze content structure and organization
   * @param {Object} detections - Detection results
   * @returns {Object} Content structure analysis
   * @private
   */
  _analyzeContentStructure(detections) {
    const headings = detections.headings;
    const structure = detections.content?.structure;
    
    const analysis = {
      headings: this._analyzeHeadingStructure(headings),
      organization: this._analyzeContentOrganization(structure),
      flow: this._analyzeContentFlow(detections),
      hierarchy: this._analyzeContentHierarchy(headings),
      navigation: this._analyzeContentNavigation(structure),
      score: 0
    };

    analysis.score = this._calculateStructureScore(analysis);

    return analysis;
  }

  /**
   * Analyze content uniqueness and originality
   * @param {Object} detections - Detection results
   * @returns {Object} Content uniqueness analysis
   * @private
   */
  _analyzeContentUniqueness(detections) {
    const content = detections.content?.text?.content || '';
    
    return {
      estimatedOriginality: this._estimateContentOriginality(content),
      duplicateRisk: this._assessDuplicateContentRisk(content),
      boilerplateRatio: this._calculateBoilerplateRatio(detections),
      uniqueValueProp: this._assessUniqueValueProposition(content),
      recommendations: this._getUniquenessRecommendations(content),
      score: this._calculateUniquenessScore(content)
    };
  }

  /**
   * Analyze multimedia content integration
   * @param {Object} detections - Detection results
   * @returns {Object} Multimedia analysis
   * @private
   */
  _analyzeMultimediaContent(detections) {
    const images = detections.content?.images;
    const media = detections.content?.media;

    const analysis = {
      images: this._analyzeImageContent(images),
      videos: this._analyzeVideoContent(media?.videos),
      audio: this._analyzeAudioContent(media?.audios),
      integration: this._analyzeMultimediaIntegration(detections),
      accessibility: this._analyzeMultimediaAccessibility(images, media),
      optimization: this._analyzeMultimediaOptimization(images, media),
      score: 0
    };

    analysis.score = this._calculateMultimediaScore(analysis);

    return analysis;
  }

  /**
   * Analyze engagement factors
   * @param {Object} detections - Detection results
   * @returns {Object} Engagement analysis
   * @private
   */
  _analyzeEngagementFactors(detections) {
    const structure = detections.content?.structure;
    const links = detections.links;

    return {
      callsToAction: this._identifyCallsToAction(detections),
      interactiveElements: this._analyzeInteractiveElements(structure),
      internalLinking: this._analyzeInternalLinking(links),
      contentVariety: this._analyzeContentVariety(detections),
      userFriendliness: this._assessUserFriendliness(detections),
      score: this._calculateEngagementScore(detections)
    };
  }

  /**
   * Analyze content accessibility
   * @param {Object} detections - Detection results
   * @returns {Object} Accessibility analysis
   * @private
   */
  _analyzeContentAccessibility(detections) {
    const images = detections.content?.images;
    const headings = detections.headings;
    const links = detections.links;

    return {
      imageAlt: this._analyzeImageAltText(images),
      headingStructure: this._analyzeAccessibleHeadings(headings),
      linkAccessibility: this._analyzeLinkAccessibility(links),
      readabilityAccess: this._analyzeReadabilityAccessibility(detections),
      languageClarity: this._analyzeLanguageClarity(detections),
      score: this._calculateAccessibilityScore(detections)
    };
  }

  /**
   * Analyze content freshness indicators
   * @param {Object} detections - Detection results
   * @returns {Object} Freshness analysis
   * @private
   */
  _analyzeContentFreshness(detections) {
    // This would typically require additional metadata
    // For now, we analyze structural indicators of freshness
    
    return {
      dateIndicators: this._findDateIndicators(detections),
      currentReferences: this._findCurrentReferences(detections),
      outdatedContent: this._identifyOutdatedContent(detections),
      updateFrequency: this._estimateUpdateFrequency(detections),
      recommendations: this._getFreshnessRecommendations(detections),
      score: this._calculateFreshnessScore(detections)
    };
  }

  /**
   * Analyze expertise, authority, trust signals
   * @param {Object} detections - Detection results
   * @returns {Object} Expertise analysis
   * @private
   */
  _analyzeExpertiseSignals(detections) {
    const content = detections.content?.text?.content || '';
    const links = detections.links;
    const structuredData = detections.structuredData;

    return {
      authorInformation: this._findAuthorInformation(detections),
      credentials: this._identifyCredentials(content),
      citations: this._analyzeCitations(links),
      expertise: this._assessContentExpertise(content),
      authority: this._assessAuthoritySignals(detections),
      trustFactors: this._identifyTrustFactors(detections),
      score: this._calculateExpertiseScore(detections)
    };
  }

  /**
   * Identify content quality issues
   * @param {Object} detections - Detection results
   * @returns {Array} Array of content issues
   * @private
   */
  _identifyContentIssues(detections) {
    const issues = [];
    const wordCount = detections.content?.text?.wordCount || 0;
    const readability = detections.content?.text?.readability;

    // Thin content
    if (wordCount < this.options.minimumWordCount) {
      issues.push({
        type: 'thin_content',
        severity: 'high',
        message: `Content is too short (${wordCount} words)`,
        recommendation: `Expand content to at least ${this.options.minimumWordCount} words`,
        impact: 'high'
      });
    }

    // Poor readability
    if (readability && readability.fleschScore < this.options.readabilityThreshold) {
      issues.push({
        type: 'poor_readability',
        severity: 'medium',
        message: `Content readability is poor (Flesch score: ${readability.fleschScore})`,
        recommendation: 'Simplify sentence structure and use more common words',
        impact: 'medium'
      });
    }

    // Missing images
    const imageCount = detections.content?.images?.count || 0;
    if (wordCount > 500 && imageCount === 0) {
      issues.push({
        type: 'no_images',
        severity: 'medium',
        message: 'Long content lacks supporting images',
        recommendation: 'Add relevant images to break up text and enhance understanding',
        impact: 'medium'
      });
    }

    // Poor heading structure
    const h1Count = detections.headings?.statistics?.byLevel?.h1 || 0;
    if (h1Count === 0) {
      issues.push({
        type: 'no_h1',
        severity: 'high',
        message: 'Missing H1 heading',
        recommendation: 'Add a descriptive H1 heading that summarizes the page content',
        impact: 'high'
      });
    }

    // Images without alt text
    const images = detections.content?.images;
    if (images && images.statistics?.withoutAlt > 0) {
      issues.push({
        type: 'missing_image_alt',
        severity: 'medium',
        message: `${images.statistics.withoutAlt} images missing alt text`,
        recommendation: 'Add descriptive alt text to all images for accessibility',
        impact: 'medium'
      });
    }

    return issues;
  }

  /**
   * Identify content optimization opportunities
   * @param {Object} detections - Detection results
   * @returns {Array} Array of opportunities
   * @private
   */
  _identifyContentOpportunities(detections) {
    const opportunities = [];
    const wordCount = detections.content?.text?.wordCount || 0;
    const optimal = this.options.optimalWordCount;

    // Content expansion opportunity
    if (wordCount < optimal.min) {
      opportunities.push({
        type: 'content_expansion',
        priority: 'high',
        message: `Content could be expanded (current: ${wordCount}, optimal: ${optimal.min}-${optimal.max})`,
        impact: 'high',
        effort: 'high'
      });
    }

    // Multimedia enhancement
    const imageCount = detections.content?.images?.count || 0;
    const videoCount = detections.content?.media?.videos?.count || 0;
    
    if (wordCount > 300 && imageCount < 2) {
      opportunities.push({
        type: 'add_images',
        priority: 'medium',
        message: 'Content would benefit from more supporting images',
        impact: 'medium',
        effort: 'medium'
      });
    }

    if (wordCount > 800 && videoCount === 0) {
      opportunities.push({
        type: 'add_video',
        priority: 'medium',
        message: 'Consider adding video content for better engagement',
        impact: 'medium',
        effort: 'high'
      });
    }

    // Structure improvements
    const headingCount = detections.headings?.statistics?.total || 0;
    const expectedHeadings = Math.floor(wordCount / 300); // Roughly one heading per 300 words
    
    if (headingCount < expectedHeadings) {
      opportunities.push({
        type: 'improve_structure',
        priority: 'medium',
        message: 'Content could benefit from better heading structure',
        impact: 'medium',
        effort: 'low'
      });
    }

    // Internal linking
    const internalLinks = detections.links?.anchors?.categories?.internal || 0;
    const expectedLinks = Math.floor(wordCount / 200); // Roughly one link per 200 words
    
    if (internalLinks < expectedLinks) {
      opportunities.push({
        type: 'internal_linking',
        priority: 'medium',
        message: 'Add more internal links to related content',
        impact: 'medium',
        effort: 'medium'
      });
    }

    return opportunities;
  }

  // Helper methods

  /**
   * Assess content length status
   * @param {number} wordCount - Word count
   * @returns {string} Status description
   * @private
   */
  _assessContentLengthStatus(wordCount) {
    const optimal = this.options.optimalWordCount;
    
    if (wordCount < this.options.minimumWordCount) return 'too_short';
    if (wordCount < optimal.min) return 'short';
    if (wordCount <= optimal.max) return 'optimal';
    if (wordCount <= optimal.max * 1.5) return 'long';
    return 'too_long';
  }

  /**
   * Get content length recommendations
   * @param {number} wordCount - Current word count
   * @returns {Array} Array of recommendations
   * @private
   */
  _getContentLengthRecommendations(wordCount) {
    const recommendations = [];
    const optimal = this.options.optimalWordCount;
    
    if (wordCount < this.options.minimumWordCount) {
      recommendations.push('Content is too short for effective SEO');
      recommendations.push(`Expand to at least ${this.options.minimumWordCount} words`);
    } else if (wordCount < optimal.min) {
      recommendations.push('Content could be more comprehensive');
      recommendations.push(`Consider expanding to ${optimal.min}-${optimal.max} words for better coverage`);
    } else if (wordCount > optimal.max * 1.5) {
      recommendations.push('Content is very long - consider breaking into multiple pages');
      recommendations.push('Ensure the content remains focused and valuable throughout');
    }
    
    return recommendations;
  }

  /**
   * Calculate content length score
   * @param {number} wordCount - Word count
   * @returns {number} Score 0-100
   * @private
   */
  _calculateLengthScore(wordCount) {
    const optimal = this.options.optimalWordCount;
    
    if (wordCount < this.options.minimumWordCount) {
      return Math.round((wordCount / this.options.minimumWordCount) * 30);
    }
    
    if (wordCount < optimal.min) {
      return 30 + Math.round(((wordCount - this.options.minimumWordCount) / (optimal.min - this.options.minimumWordCount)) * 40);
    }
    
    if (wordCount <= optimal.max) {
      return 100; // Optimal range
    }
    
    // Diminishing returns for very long content
    const excess = wordCount - optimal.max;
    const penalty = Math.min(30, Math.round(excess / 100) * 5);
    return Math.max(70, 100 - penalty);
  }

  /**
   * Assess readability status
   * @param {number} fleschScore - Flesch reading ease score
   * @returns {string} Readability status
   * @private
   */
  _assessReadabilityStatus(fleschScore) {
    if (fleschScore >= 80) return 'excellent';
    if (fleschScore >= 70) return 'good';
    if (fleschScore >= 60) return 'acceptable';
    if (fleschScore >= 50) return 'difficult';
    return 'very_difficult';
  }

  /**
   * Calculate overall content quality score
   * @param {Object} results - Analysis results
   * @returns {number} Overall score 0-100
   * @private
   */
  _calculateContentQualityScore(results) {
    let totalScore = 0;
    let weights = 0;

    // Content length (20% weight)
    if (results.length?.score !== undefined) {
      totalScore += results.length.score * 0.2;
      weights += 0.2;
    }

    // Readability (15% weight)
    if (results.readability?.score !== undefined) {
      totalScore += results.readability.score * 0.15;
      weights += 0.15;
    }

    // Structure (15% weight)
    if (results.structure?.score !== undefined) {
      totalScore += results.structure.score * 0.15;
      weights += 0.15;
    }

    // Uniqueness (15% weight)
    if (results.uniqueness?.score !== undefined) {
      totalScore += results.uniqueness.score * 0.15;
      weights += 0.15;
    }

    // Multimedia (10% weight)
    if (results.multimedia?.score !== undefined) {
      totalScore += results.multimedia.score * 0.1;
      weights += 0.1;
    }

    // Engagement (10% weight)
    if (results.engagement?.score !== undefined) {
      totalScore += results.engagement.score * 0.1;
      weights += 0.1;
    }

    // Accessibility (10% weight)
    if (results.accessibility?.score !== undefined) {
      totalScore += results.accessibility.score * 0.1;
      weights += 0.1;
    }

    // Expertise (5% weight)
    if (results.expertise?.score !== undefined) {
      totalScore += results.expertise.score * 0.05;
      weights += 0.05;
    }

    return weights > 0 ? Math.round(totalScore / weights) : 0;
  }

  /**
   * Get content grade from score
   * @param {number} score - Content quality score
   * @returns {string} Grade A-F
   * @private
   */
  _getContentGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  // Placeholder methods for advanced features
  _identifyReadabilityIssues() { return []; }
  _getReadabilityRecommendations() { return []; }
  _calculateReadabilityScore(fleschScore) { 
    return Math.max(0, Math.min(100, fleschScore)); 
  }
  _analyzeHeadingStructure() { return { score: 75 }; }
  _analyzeContentOrganization() { return { score: 75 }; }
  _analyzeContentFlow() { return { score: 75 }; }
  _analyzeContentHierarchy() { return { score: 75 }; }
  _analyzeContentNavigation() { return { score: 75 }; }
  _calculateStructureScore() { return 75; }
  _estimateContentOriginality() { return 85; }
  _assessDuplicateContentRisk() { return 'low'; }
  _calculateBoilerplateRatio() { return 0.1; }
  _assessUniqueValueProposition() { return 75; }
  _getUniquenessRecommendations() { return []; }
  _calculateUniquenessScore() { return 75; }
  _analyzeImageContent() { return { score: 75 }; }
  _analyzeVideoContent() { return { score: 75 }; }
  _analyzeAudioContent() { return { score: 75 }; }
  _analyzeMultimediaIntegration() { return { score: 75 }; }
  _analyzeMultimediaAccessibility() { return { score: 75 }; }
  _analyzeMultimediaOptimization() { return { score: 75 }; }
  _calculateMultimediaScore() { return 75; }
  _identifyCallsToAction() { return []; }
  _analyzeInteractiveElements() { return { score: 75 }; }
  _analyzeInternalLinking() { return { score: 75 }; }
  _analyzeContentVariety() { return { score: 75 }; }
  _assessUserFriendliness() { return { score: 75 }; }
  _calculateEngagementScore() { return 75; }
  _analyzeImageAltText() { return { score: 75 }; }
  _analyzeAccessibleHeadings() { return { score: 75 }; }
  _analyzeLinkAccessibility() { return { score: 75 }; }
  _analyzeReadabilityAccessibility() { return { score: 75 }; }
  _analyzeLanguageClarity() { return { score: 75 }; }
  _calculateAccessibilityScore() { return 75; }
  _findDateIndicators() { return []; }
  _findCurrentReferences() { return []; }
  _identifyOutdatedContent() { return []; }
  _estimateUpdateFrequency() { return 'unknown'; }
  _getFreshnessRecommendations() { return []; }
  _calculateFreshnessScore() { return 75; }
  _findAuthorInformation() { return null; }
  _identifyCredentials() { return []; }
  _analyzeCitations() { return { score: 75 }; }
  _assessContentExpertise() { return { score: 75 }; }
  _assessAuthoritySignals() { return { score: 75 }; }
  _identifyTrustFactors() { return []; }
  _calculateExpertiseScore() { return 75; }
}

export default ContentQualityAnalyzer;
