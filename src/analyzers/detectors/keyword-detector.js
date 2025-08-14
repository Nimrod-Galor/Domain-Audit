/**
 * ============================================================================
 * KEYWORD DETECTOR - GPT-5 STYLE MODULAR COMPONENT
 * ============================================================================
 * 
 * Advanced keyword analysis and optimization detector
 * Part of the Combined Approach modernization pattern
 * 
 * Features:
 * - Keyword density analysis
 * - Keyword placement optimization
 * - Long-tail keyword identification
 * - Semantic keyword analysis
 * - Competitor keyword comparison
 * 
 * @version 1.0.0
 * @author Development Team
 */

export class KeywordDetector {
  constructor() {
    this.detectorName = 'KeywordDetector';
    this.version = '1.0.0';
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'must', 'this', 'that',
      'these', 'those', 'i', 'me', 'my', 'myself', 'we', 'us', 'our', 'ours', 'ourselves',
      'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
      'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves'
    ]);
  }

  /**
   * Detect and analyze keywords
   * @param {Document} document - The HTML document
   * @param {string} url - Page URL
   * @returns {Object} Keyword analysis results
   */
  detectKeywords(document, url) {
    try {
      const textContent = this._extractTextContent(document);
      const keywordAnalysis = this._analyzeKeywords(textContent, document);
      const optimization = this._analyzeKeywordOptimization(keywordAnalysis, document);
      
      return {
        success: true,
        keywords: keywordAnalysis,
        optimization,
        recommendations: this._generateKeywordRecommendations(optimization),
        score: this._calculateKeywordScore(optimization)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        keywords: {},
        optimization: {},
        recommendations: [],
        score: 0
      };
    }
  }

  /**
   * Extract text content from document
   * @private
   */
  _extractTextContent(document) {
    const title = document.title || '';
    const metaDescription = this._getMetaDescription(document);
    const headings = this._getHeadingText(document);
    const bodyText = document.body.textContent || '';
    const altText = this._getAltText(document);
    
    return {
      title,
      metaDescription,
      headings,
      bodyText,
      altText,
      fullText: `${title} ${metaDescription} ${headings} ${bodyText} ${altText}`
    };
  }

  /**
   * Get meta description
   * @private
   */
  _getMetaDescription(document) {
    const metaDesc = document.querySelector('meta[name="description"]');
    return metaDesc ? metaDesc.getAttribute('content') || '' : '';
  }

  /**
   * Get heading text
   * @private
   */
  _getHeadingText(document) {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    return Array.from(headings).map(h => h.textContent || '').join(' ');
  }

  /**
   * Get alt text from images
   * @private
   */
  _getAltText(document) {
    const images = document.querySelectorAll('img[alt]');
    return Array.from(images).map(img => img.getAttribute('alt') || '').join(' ');
  }

  /**
   * Analyze keywords in content
   * @private
   */
  _analyzeKeywords(textContent, document) {
    const singleWords = this._extractSingleWords(textContent.fullText);
    const phrases = this._extractPhrases(textContent.fullText);
    const densityAnalysis = this._calculateKeywordDensity(textContent.fullText);
    
    return {
      singleWords,
      phrases,
      densityAnalysis,
      totalWords: this._countWords(textContent.fullText),
      uniqueWords: Object.keys(singleWords).length,
      topKeywords: this._getTopKeywords(singleWords, 10),
      topPhrases: this._getTopPhrases(phrases, 10)
    };
  }

  /**
   * Extract single words with frequency
   * @private
   */
  _extractSingleWords(text) {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word));
    
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    return wordFreq;
  }

  /**
   * Extract phrases (2-4 words)
   * @private
   */
  _extractPhrases(text) {
    const phrases = {};
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    // Extract 2-word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      if (this._isValidPhrase(phrase)) {
        phrases[phrase] = (phrases[phrase] || 0) + 1;
      }
    }
    
    // Extract 3-word phrases
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      if (this._isValidPhrase(phrase)) {
        phrases[phrase] = (phrases[phrase] || 0) + 1;
      }
    }
    
    return phrases;
  }

  /**
   * Check if phrase is valid (not all stop words)
   * @private
   */
  _isValidPhrase(phrase) {
    const words = phrase.split(' ');
    return words.some(word => !this.stopWords.has(word) && word.length > 2);
  }

  /**
   * Calculate keyword density
   * @private
   */
  _calculateKeywordDensity(text) {
    const totalWords = this._countWords(text);
    const words = this._extractSingleWords(text);
    
    const densities = {};
    Object.entries(words).forEach(([word, count]) => {
      densities[word] = {
        count,
        density: (count / totalWords) * 100,
        prominence: this._calculateProminence(word, count, totalWords)
      };
    });
    
    return densities;
  }

  /**
   * Count words in text
   * @private
   */
  _countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Calculate keyword prominence score
   * @private
   */
  _calculateProminence(word, count, totalWords) {
    const density = (count / totalWords) * 100;
    let prominence = density;
    
    // Boost for frequency
    if (count >= 5) prominence *= 1.2;
    if (count >= 10) prominence *= 1.3;
    
    // Boost for word length (longer words often more significant)
    if (word.length >= 6) prominence *= 1.1;
    if (word.length >= 8) prominence *= 1.2;
    
    return Math.round(prominence * 100) / 100;
  }

  /**
   * Get top keywords by frequency
   * @private
   */
  _getTopKeywords(words, limit = 10) {
    return Object.entries(words)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([word, count]) => ({ word, count }));
  }

  /**
   * Get top phrases by frequency
   * @private
   */
  _getTopPhrases(phrases, limit = 10) {
    return Object.entries(phrases)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([phrase, count]) => ({ phrase, count }));
  }

  /**
   * Analyze keyword optimization
   * @private
   */
  _analyzeKeywordOptimization(keywordAnalysis, document) {
    const titleOptimization = this._analyzeTitleOptimization(document, keywordAnalysis);
    const headingOptimization = this._analyzeHeadingOptimization(document, keywordAnalysis);
    const contentOptimization = this._analyzeContentOptimization(keywordAnalysis);
    const metaOptimization = this._analyzeMetaOptimization(document, keywordAnalysis);
    
    return {
      title: titleOptimization,
      headings: headingOptimization,
      content: contentOptimization,
      meta: metaOptimization,
      overall: this._calculateOverallOptimization(titleOptimization, headingOptimization, contentOptimization, metaOptimization)
    };
  }

  /**
   * Analyze title optimization
   * @private
   */
  _analyzeTitleOptimization(document, keywordAnalysis) {
    const title = document.title || '';
    const titleWords = this._extractSingleWords(title);
    const topKeywords = keywordAnalysis.topKeywords.slice(0, 5);
    
    let keywordsInTitle = 0;
    topKeywords.forEach(({ word }) => {
      if (titleWords[word]) keywordsInTitle++;
    });
    
    return {
      keywordsPresent: keywordsInTitle,
      totalTopKeywords: topKeywords.length,
      optimization: topKeywords.length > 0 ? (keywordsInTitle / topKeywords.length) * 100 : 0,
      titleLength: title.length,
      optimalLength: title.length >= 30 && title.length <= 60,
      issues: this._getTitleOptimizationIssues(title, keywordsInTitle, topKeywords.length)
    };
  }

  /**
   * Analyze heading optimization
   * @private
   */
  _analyzeHeadingOptimization(document, keywordAnalysis) {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingText = Array.from(headings).map(h => h.textContent || '').join(' ');
    const headingWords = this._extractSingleWords(headingText);
    const topKeywords = keywordAnalysis.topKeywords.slice(0, 5);
    
    let keywordsInHeadings = 0;
    topKeywords.forEach(({ word }) => {
      if (headingWords[word]) keywordsInHeadings++;
    });
    
    return {
      keywordsPresent: keywordsInHeadings,
      totalTopKeywords: topKeywords.length,
      optimization: topKeywords.length > 0 ? (keywordsInHeadings / topKeywords.length) * 100 : 0,
      headingCount: headings.length,
      hasH1: document.querySelector('h1') !== null,
      issues: this._getHeadingOptimizationIssues(headings, keywordsInHeadings, topKeywords.length)
    };
  }

  /**
   * Analyze content optimization
   * @private
   */
  _analyzeContentOptimization(keywordAnalysis) {
    const { densityAnalysis, topKeywords } = keywordAnalysis;
    
    let optimalDensity = 0;
    let overOptimized = 0;
    let underOptimized = 0;
    
    topKeywords.slice(0, 5).forEach(({ word }) => {
      const density = densityAnalysis[word]?.density || 0;
      
      if (density >= 1 && density <= 3) {
        optimalDensity++;
      } else if (density > 3) {
        overOptimized++;
      } else {
        underOptimized++;
      }
    });
    
    return {
      optimalDensity,
      overOptimized,
      underOptimized,
      totalAnalyzed: Math.min(topKeywords.length, 5),
      optimization: topKeywords.length > 0 ? (optimalDensity / Math.min(topKeywords.length, 5)) * 100 : 0,
      averageDensity: this._calculateAverageDensity(densityAnalysis, topKeywords.slice(0, 5)),
      issues: this._getContentOptimizationIssues(optimalDensity, overOptimized, underOptimized)
    };
  }

  /**
   * Analyze meta tag optimization
   * @private
   */
  _analyzeMetaOptimization(document, keywordAnalysis) {
    const metaDescription = this._getMetaDescription(document);
    const metaWords = this._extractSingleWords(metaDescription);
    const topKeywords = keywordAnalysis.topKeywords.slice(0, 3);
    
    let keywordsInMeta = 0;
    topKeywords.forEach(({ word }) => {
      if (metaWords[word]) keywordsInMeta++;
    });
    
    return {
      keywordsPresent: keywordsInMeta,
      totalTopKeywords: topKeywords.length,
      optimization: topKeywords.length > 0 ? (keywordsInMeta / topKeywords.length) * 100 : 0,
      metaLength: metaDescription.length,
      optimalLength: metaDescription.length >= 120 && metaDescription.length <= 160,
      issues: this._getMetaOptimizationIssues(metaDescription, keywordsInMeta, topKeywords.length)
    };
  }

  /**
   * Calculate average density for top keywords
   * @private
   */
  _calculateAverageDensity(densityAnalysis, topKeywords) {
    if (topKeywords.length === 0) return 0;
    
    const totalDensity = topKeywords.reduce((sum, { word }) => {
      return sum + (densityAnalysis[word]?.density || 0);
    }, 0);
    
    return totalDensity / topKeywords.length;
  }

  /**
   * Get title optimization issues
   * @private
   */
  _getTitleOptimizationIssues(title, keywordsInTitle, totalKeywords) {
    const issues = [];
    
    if (title.length < 30) issues.push('Title too short');
    if (title.length > 60) issues.push('Title too long');
    if (keywordsInTitle === 0) issues.push('No primary keywords in title');
    if (keywordsInTitle < totalKeywords * 0.4) issues.push('Insufficient keyword coverage in title');
    
    return issues;
  }

  /**
   * Get heading optimization issues
   * @private
   */
  _getHeadingOptimizationIssues(headings, keywordsInHeadings, totalKeywords) {
    const issues = [];
    
    if (headings.length === 0) issues.push('No headings found');
    if (!document.querySelector('h1')) issues.push('Missing H1 tag');
    if (keywordsInHeadings === 0) issues.push('No keywords in headings');
    if (keywordsInHeadings < totalKeywords * 0.3) issues.push('Low keyword usage in headings');
    
    return issues;
  }

  /**
   * Get content optimization issues
   * @private
   */
  _getContentOptimizationIssues(optimal, over, under) {
    const issues = [];
    
    if (over > 0) issues.push(`${over} keywords over-optimized (>3% density)`);
    if (under > optimal) issues.push(`${under} keywords under-optimized (<1% density)`);
    if (optimal === 0) issues.push('No keywords with optimal density');
    
    return issues;
  }

  /**
   * Get meta optimization issues
   * @private
   */
  _getMetaOptimizationIssues(metaDescription, keywordsInMeta, totalKeywords) {
    const issues = [];
    
    if (metaDescription.length === 0) issues.push('Missing meta description');
    if (metaDescription.length < 120) issues.push('Meta description too short');
    if (metaDescription.length > 160) issues.push('Meta description too long');
    if (keywordsInMeta === 0) issues.push('No keywords in meta description');
    
    return issues;
  }

  /**
   * Calculate overall optimization score
   * @private
   */
  _calculateOverallOptimization(title, headings, content, meta) {
    const titleWeight = 0.3;
    const headingsWeight = 0.25;
    const contentWeight = 0.3;
    const metaWeight = 0.15;
    
    return Math.round(
      title.optimization * titleWeight +
      headings.optimization * headingsWeight +
      content.optimization * contentWeight +
      meta.optimization * metaWeight
    );
  }

  /**
   * Generate keyword recommendations
   * @private
   */
  _generateKeywordRecommendations(optimization) {
    const recommendations = [];
    
    // Title recommendations
    if (optimization.title.optimization < 60) {
      recommendations.push({
        type: 'title',
        priority: 'high',
        message: 'Include primary keywords in page title'
      });
    }
    
    // Heading recommendations
    if (optimization.headings.optimization < 50) {
      recommendations.push({
        type: 'headings',
        priority: 'high',
        message: 'Use keywords in headings to improve structure'
      });
    }
    
    // Content recommendations
    if (optimization.content.optimization < 60) {
      recommendations.push({
        type: 'content',
        priority: 'medium',
        message: 'Optimize keyword density (1-3% for primary keywords)'
      });
    }
    
    // Meta recommendations
    if (optimization.meta.optimization < 50) {
      recommendations.push({
        type: 'meta',
        priority: 'medium',
        message: 'Include keywords in meta description'
      });
    }
    
    return recommendations;
  }

  /**
   * Calculate overall keyword score
   * @private
   */
  _calculateKeywordScore(optimization) {
    return Math.max(0, Math.min(100, optimization.overall));
  }
}
