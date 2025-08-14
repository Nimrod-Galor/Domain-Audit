/**
 * ============================================================================
 * CONTENT QUALITY DETECTOR - GPT-5 STYLE MODULAR COMPONENT
 * ============================================================================
 * 
 * Comprehensive content quality analysis detector
 * Part of the Combined Approach modernization pattern
 * 
 * Features:
 * - Content readability analysis
 * - Semantic content structure assessment
 * - Content length and density optimization
 * - Keyword density and distribution analysis
 * - Content freshness and engagement metrics
 * 
 * @version 1.0.0
 * @author Development Team
 */

export class ContentQualityDetector {
  constructor() {
    this.detectorName = 'ContentQualityDetector';
    this.version = '1.0.0';
  }

  /**
   * Detect and analyze content quality
   * @param {Document} document - The HTML document
   * @param {string} url - Page URL
   * @returns {Object} Content quality analysis results
   */
  detectContentQuality(document, url) {
    try {
      const contentAnalysis = this._extractContentMetrics(document);
      const qualityAssessment = this._assessContentQuality(contentAnalysis);
      
      return {
        success: true,
        contentAnalysis,
        qualityAssessment,
        recommendations: this._generateContentRecommendations(qualityAssessment),
        score: this._calculateContentScore(qualityAssessment)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        contentAnalysis: {},
        qualityAssessment: {},
        recommendations: [],
        score: 0
      };
    }
  }

  /**
   * Extract content metrics from document
   * @private
   */
  _extractContentMetrics(document) {
    const textContent = document.body.textContent || '';
    const htmlContent = document.body.innerHTML || '';
    
    return {
      textLength: textContent.length,
      htmlLength: htmlContent.length,
      wordCount: this._countWords(textContent),
      paragraphCount: document.querySelectorAll('p').length,
      headingCount: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
      imageCount: document.querySelectorAll('img').length,
      linkCount: document.querySelectorAll('a').length,
      listCount: document.querySelectorAll('ul, ol').length,
      readabilityMetrics: this._calculateReadability(textContent),
      structureMetrics: this._analyzeContentStructure(document)
    };
  }

  /**
   * Count words in text
   * @private
   */
  _countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Calculate readability metrics
   * @private
   */
  _calculateReadability(text) {
    const words = this._countWords(text);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const syllables = this._countSyllables(text);
    
    // Flesch Reading Ease
    const fleschScore = sentences > 0 && words > 0 ? 
      206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words)) : 0;
    
    // Average sentence length
    const avgSentenceLength = sentences > 0 ? words / sentences : 0;
    
    // Average word length
    const avgWordLength = words > 0 ? text.replace(/\s+/g, '').length / words : 0;
    
    return {
      fleschScore: Math.max(0, Math.min(100, fleschScore)),
      readabilityLevel: this._getReadabilityLevel(fleschScore),
      avgSentenceLength,
      avgWordLength,
      syllables,
      sentences,
      complexWords: this._countComplexWords(text)
    };
  }

  /**
   * Count syllables in text (simplified)
   * @private
   */
  _countSyllables(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    let syllableCount = 0;
    
    words.forEach(word => {
      // Simple syllable counting - count vowel groups
      const vowelGroups = word.match(/[aeiouy]+/g);
      syllableCount += vowelGroups ? vowelGroups.length : 1;
      
      // Adjust for silent 'e'
      if (word.endsWith('e') && vowelGroups && vowelGroups.length > 1) {
        syllableCount--;
      }
    });
    
    return syllableCount;
  }

  /**
   * Count complex words (3+ syllables)
   * @private
   */
  _countComplexWords(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    let complexCount = 0;
    
    words.forEach(word => {
      const vowelGroups = word.match(/[aeiouy]+/g);
      let syllables = vowelGroups ? vowelGroups.length : 1;
      
      if (word.endsWith('e') && syllables > 1) {
        syllables--;
      }
      
      if (syllables >= 3) {
        complexCount++;
      }
    });
    
    return complexCount;
  }

  /**
   * Get readability level from Flesch score
   * @private
   */
  _getReadabilityLevel(score) {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  }

  /**
   * Analyze content structure
   * @private
   */
  _analyzeContentStructure(document) {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const paragraphs = document.querySelectorAll('p');
    const lists = document.querySelectorAll('ul, ol');
    const images = document.querySelectorAll('img');
    
    return {
      hasH1: document.querySelector('h1') !== null,
      headingHierarchy: this._analyzeHeadingHierarchy(headings),
      contentDensity: this._calculateContentDensity(document),
      mediaRatio: this._calculateMediaRatio(document),
      structureScore: this._calculateStructureScore(document)
    };
  }

  /**
   * Analyze heading hierarchy
   * @private
   */
  _analyzeHeadingHierarchy(headings) {
    const hierarchy = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
    let proper = true;
    
    for (let i = 1; i < hierarchy.length; i++) {
      if (hierarchy[i] - hierarchy[i-1] > 1) {
        proper = false;
        break;
      }
    }
    
    return {
      levels: hierarchy,
      properHierarchy: proper,
      h1Count: hierarchy.filter(level => level === 1).length,
      deepestLevel: Math.max(...hierarchy, 0)
    };
  }

  /**
   * Calculate content density
   * @private
   */
  _calculateContentDensity(document) {
    const textContent = document.body.textContent || '';
    const htmlContent = document.body.innerHTML || '';
    
    const textLength = textContent.length;
    const htmlLength = htmlContent.length;
    
    return {
      textToHtmlRatio: htmlLength > 0 ? textLength / htmlLength : 0,
      wordsPerParagraph: this._getWordsPerParagraph(document),
      contentToCodeRatio: this._getContentToCodeRatio(document)
    };
  }

  /**
   * Get words per paragraph average
   * @private
   */
  _getWordsPerParagraph(document) {
    const paragraphs = document.querySelectorAll('p');
    if (paragraphs.length === 0) return 0;
    
    const totalWords = Array.from(paragraphs).reduce((sum, p) => {
      return sum + this._countWords(p.textContent || '');
    }, 0);
    
    return totalWords / paragraphs.length;
  }

  /**
   * Calculate content to code ratio
   * @private
   */
  _getContentToCodeRatio(document) {
    const textContent = document.body.textContent || '';
    const htmlContent = document.body.innerHTML || '';
    
    const codeBlocks = document.querySelectorAll('code, pre, script');
    const codeLength = Array.from(codeBlocks).reduce((sum, block) => {
      return sum + (block.textContent || '').length;
    }, 0);
    
    const contentLength = textContent.length - codeLength;
    
    return {
      contentLength,
      codeLength,
      ratio: codeLength > 0 ? contentLength / codeLength : contentLength > 0 ? Infinity : 0
    };
  }

  /**
   * Calculate media ratio
   * @private
   */
  _calculateMediaRatio(document) {
    const images = document.querySelectorAll('img');
    const videos = document.querySelectorAll('video');
    const wordCount = this._countWords(document.body.textContent || '');
    
    return {
      imagesPerWord: wordCount > 0 ? images.length / wordCount : 0,
      videosPerWord: wordCount > 0 ? videos.length / wordCount : 0,
      totalMediaElements: images.length + videos.length,
      mediaToContentRatio: wordCount > 0 ? (images.length + videos.length) / wordCount : 0
    };
  }

  /**
   * Calculate structure score
   * @private
   */
  _calculateStructureScore(document) {
    let score = 0;
    
    // Has H1 (10 points)
    if (document.querySelector('h1')) score += 10;
    
    // Multiple headings (10 points)
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length >= 3) score += 10;
    
    // Paragraphs present (10 points)
    const paragraphs = document.querySelectorAll('p');
    if (paragraphs.length >= 3) score += 10;
    
    // Lists present (5 points)
    if (document.querySelectorAll('ul, ol').length > 0) score += 5;
    
    // Images with alt text (10 points)
    const images = document.querySelectorAll('img');
    const imagesWithAlt = document.querySelectorAll('img[alt]');
    if (images.length > 0 && imagesWithAlt.length === images.length) score += 10;
    
    // Proper heading hierarchy (15 points)
    const hierarchy = this._analyzeHeadingHierarchy(headings);
    if (hierarchy.properHierarchy) score += 15;
    
    // Content length adequacy (10 points)
    const wordCount = this._countWords(document.body.textContent || '');
    if (wordCount >= 300) score += 10;
    
    // Content density (10 points)
    const density = this._calculateContentDensity(document);
    if (density.textToHtmlRatio >= 0.1) score += 10;
    
    // Media balance (10 points)
    const mediaRatio = this._calculateMediaRatio(document);
    if (mediaRatio.totalMediaElements > 0 && mediaRatio.mediaToContentRatio < 0.1) score += 10;
    
    // Links present (10 points)
    if (document.querySelectorAll('a').length > 0) score += 10;
    
    return Math.min(score, 100);
  }

  /**
   * Assess overall content quality
   * @private
   */
  _assessContentQuality(contentAnalysis) {
    const { readabilityMetrics, structureMetrics } = contentAnalysis;
    
    return {
      readability: {
        score: readabilityMetrics.fleschScore,
        level: readabilityMetrics.readabilityLevel,
        optimal: readabilityMetrics.fleschScore >= 60 && readabilityMetrics.fleschScore <= 80,
        issues: this._getReadabilityIssues(readabilityMetrics)
      },
      structure: {
        score: structureMetrics.structureScore,
        optimal: structureMetrics.structureScore >= 70,
        issues: this._getStructureIssues(structureMetrics, contentAnalysis)
      },
      length: {
        wordCount: contentAnalysis.wordCount,
        optimal: contentAnalysis.wordCount >= 300 && contentAnalysis.wordCount <= 2000,
        issues: this._getLengthIssues(contentAnalysis)
      },
      engagement: {
        score: this._calculateEngagementScore(contentAnalysis),
        factors: this._getEngagementFactors(contentAnalysis)
      }
    };
  }

  /**
   * Get readability issues
   * @private
   */
  _getReadabilityIssues(metrics) {
    const issues = [];
    
    if (metrics.fleschScore < 30) issues.push('Text is very difficult to read');
    else if (metrics.fleschScore < 50) issues.push('Text is fairly difficult to read');
    else if (metrics.fleschScore > 90) issues.push('Text may be too simple');
    
    if (metrics.avgSentenceLength > 25) issues.push('Sentences are too long');
    if (metrics.avgWordLength > 6) issues.push('Words are too complex');
    if (metrics.complexWords > metrics.syllables * 0.3) issues.push('Too many complex words');
    
    return issues;
  }

  /**
   * Get structure issues
   * @private
   */
  _getStructureIssues(structureMetrics, contentAnalysis) {
    const issues = [];
    
    if (!structureMetrics.hasH1) issues.push('Missing H1 heading');
    if (!structureMetrics.headingHierarchy.properHierarchy) issues.push('Improper heading hierarchy');
    if (contentAnalysis.paragraphCount < 3) issues.push('Too few paragraphs');
    if (contentAnalysis.imageCount === 0) issues.push('No images for visual engagement');
    if (structureMetrics.contentDensity.textToHtmlRatio < 0.1) issues.push('Low content to code ratio');
    
    return issues;
  }

  /**
   * Get length issues
   * @private
   */
  _getLengthIssues(contentAnalysis) {
    const issues = [];
    
    if (contentAnalysis.wordCount < 300) issues.push('Content too short for SEO');
    if (contentAnalysis.wordCount > 2000) issues.push('Content may be too long');
    if (contentAnalysis.textLength < 1000) issues.push('Very little text content');
    
    return issues;
  }

  /**
   * Calculate engagement score
   * @private
   */
  _calculateEngagementScore(contentAnalysis) {
    let score = 0;
    
    // Word count factor (30 points)
    if (contentAnalysis.wordCount >= 300) score += 15;
    if (contentAnalysis.wordCount >= 600) score += 15;
    
    // Media engagement (20 points)
    if (contentAnalysis.imageCount > 0) score += 10;
    if (contentAnalysis.imageCount >= 3) score += 10;
    
    // Structure engagement (25 points)
    if (contentAnalysis.headingCount >= 2) score += 10;
    if (contentAnalysis.listCount > 0) score += 10;
    if (contentAnalysis.paragraphCount >= 5) score += 5;
    
    // Interactive elements (15 points)
    if (contentAnalysis.linkCount > 0) score += 10;
    if (contentAnalysis.linkCount >= 5) score += 5;
    
    // Readability factor (10 points)
    const readability = contentAnalysis.readabilityMetrics;
    if (readability.fleschScore >= 60 && readability.fleschScore <= 80) score += 10;
    
    return Math.min(score, 100);
  }

  /**
   * Get engagement factors
   * @private
   */
  _getEngagementFactors(contentAnalysis) {
    return {
      hasImages: contentAnalysis.imageCount > 0,
      hasLists: contentAnalysis.listCount > 0,
      hasLinks: contentAnalysis.linkCount > 0,
      properLength: contentAnalysis.wordCount >= 300,
      goodReadability: contentAnalysis.readabilityMetrics.fleschScore >= 60,
      structuredContent: contentAnalysis.headingCount >= 2
    };
  }

  /**
   * Generate content recommendations
   * @private
   */
  _generateContentRecommendations(qualityAssessment) {
    const recommendations = [];
    
    // Readability recommendations
    if (!qualityAssessment.readability.optimal) {
      recommendations.push({
        type: 'readability',
        priority: 'high',
        message: `Improve readability - current score: ${qualityAssessment.readability.score.toFixed(1)}`
      });
    }
    
    // Structure recommendations
    if (!qualityAssessment.structure.optimal) {
      recommendations.push({
        type: 'structure',
        priority: 'high',
        message: 'Improve content structure with proper headings and paragraphs'
      });
    }
    
    // Length recommendations
    if (!qualityAssessment.length.optimal) {
      recommendations.push({
        type: 'length',
        priority: 'medium',
        message: 'Optimize content length for better SEO and user engagement'
      });
    }
    
    // Engagement recommendations
    if (qualityAssessment.engagement.score < 70) {
      recommendations.push({
        type: 'engagement',
        priority: 'medium',
        message: 'Add more engaging elements like images, lists, and internal links'
      });
    }
    
    return recommendations;
  }

  /**
   * Calculate overall content quality score
   * @private
   */
  _calculateContentScore(qualityAssessment) {
    const readabilityWeight = 0.3;
    const structureWeight = 0.3;
    const engagementWeight = 0.2;
    const lengthWeight = 0.2;
    
    const readabilityScore = Math.min(qualityAssessment.readability.score, 100);
    const structureScore = qualityAssessment.structure.score;
    const engagementScore = qualityAssessment.engagement.score;
    const lengthScore = qualityAssessment.length.optimal ? 100 : 60;
    
    const overallScore = (
      readabilityScore * readabilityWeight +
      structureScore * structureWeight +
      engagementScore * engagementWeight +
      lengthScore * lengthWeight
    );
    
    return Math.round(Math.max(0, Math.min(100, overallScore)));
  }
}
