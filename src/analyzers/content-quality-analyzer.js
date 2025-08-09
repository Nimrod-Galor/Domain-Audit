/**
 * ============================================================================
 * CONTENT QUALITY ANALYZER MODULE
 * ============================================================================
 * 
 * This module provides comprehensive content quality analysis including:
 * - Reading level and complexity analysis
 * - Keyword density analysis
 * - Content uniqueness scoring
 * - Content-to-code ratio analysis
 * - Duplicate content detection
 * 
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @version 1.0.0
 * @extends BaseAnalyzer
 */

import { BaseAnalyzer } from '../core/base-analyzer.js';
import { AnalyzerCategories } from '../utils/analyzer-categories.js';

/**
 * Content Quality Standards and Thresholds
 */
export const CONTENT_QUALITY_STANDARDS = {
  READING_LEVELS: {
    VERY_EASY: { fleschScore: 90, gradeLevel: '5th grade or below' },
    EASY: { fleschScore: 80, gradeLevel: '6th grade' },
    FAIRLY_EASY: { fleschScore: 70, gradeLevel: '7th grade' },
    STANDARD: { fleschScore: 60, gradeLevel: '8th-9th grade' },
    FAIRLY_DIFFICULT: { fleschScore: 50, gradeLevel: '10th-12th grade' },
    DIFFICULT: { fleschScore: 30, gradeLevel: 'College level' },
    VERY_DIFFICULT: { fleschScore: 0, gradeLevel: 'Graduate level' }
  },
  KEYWORD_DENSITY: {
    OPTIMAL_MIN: 1.0,     // 1% minimum
    OPTIMAL_MAX: 3.0,     // 3% maximum
    WARNING_THRESHOLD: 5.0, // 5% warning
    SPAM_THRESHOLD: 8.0   // 8% potential spam
  },
  CONTENT_RATIOS: {
    MIN_CONTENT_TO_CODE: 15,  // 15% minimum content-to-code ratio
    GOOD_CONTENT_TO_CODE: 25, // 25% good ratio
    EXCELLENT_CONTENT_TO_CODE: 40 // 40% excellent ratio
  },
  WORD_COUNT: {
    MIN_BLOG_POST: 300,
    MIN_PRODUCT_PAGE: 150,
    MIN_CATEGORY_PAGE: 200,
    OPTIMAL_BLOG_POST: 1500,
    OPTIMAL_PRODUCT_PAGE: 300
  }
};

/**
 * Content Quality Analyzer Class
 * @extends BaseAnalyzer
 */
export class ContentQualityAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('ContentQualityAnalyzer');
    
    this.category = AnalyzerCategories.CONTENT;
    this.config = {
      includeReadabilityAnalysis: options.includeReadabilityAnalysis !== false,
      includeKeywordAnalysis: options.includeKeywordAnalysis !== false,
      includeContentRatio: options.includeContentRatio !== false,
      includeDuplicateDetection: options.includeDuplicateDetection !== false,
      maxKeywordsToAnalyze: options.maxKeywordsToAnalyze || 20,
      minWordLength: options.minWordLength || 3,
      ...options
    };
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'ContentQualityAnalyzer',
      version: '1.0.0',
      category: AnalyzerCategories.CONTENT,
      description: 'Analyzes content quality including readability, keyword density, and content ratios',
      author: 'Nimrod Galor',
      capabilities: [
        'Reading level analysis',
        'Keyword density analysis',
        'Content uniqueness scoring',
        'Content-to-code ratio analysis',
        'Duplicate content detection'
      ]
    };
  }

  /**
   * Validate the context before analysis
   * @param {Object} context - Analysis context
   * @returns {boolean} Whether the context is valid
   */
  validate(context) {
    return context && 
           context.dom && 
           context.dom.window && 
           context.dom.window.document;
  }

  /**
   * Perform comprehensive content quality analysis
   * @param {Object} context - Analysis context containing dom, pageData, etc.
   * @returns {Object} Content quality analysis
   */
  async analyze(context) {
    try {
      this.log('Starting content quality analysis');
      
      // Validate context
      if (!this.validate(context)) {
        throw new Error('Invalid context provided for content quality analysis');
      }

      const { dom, pageData = {}, rawHTML = '' } = context;
      const document = dom.window.document;
      const textContent = this._extractTextContent(document);
      
      const analysis = {
        // Reading level and complexity
        readability: this._analyzeReadability(textContent),
        
        // Keyword density analysis
        keywordDensity: this._analyzeKeywordDensity(textContent),
        
        // Content-to-code ratio
        contentRatio: this._analyzeContentToCodeRatio(textContent, rawHTML),
        
        // Content structure analysis
        contentStructure: this._analyzeContentStructure(document, textContent),
        
        // Content uniqueness (basic analysis)
        uniqueness: this._analyzeContentUniqueness(textContent),
        
        // Overall content quality score
        qualityScore: 0,
        
        // Recommendations
        recommendations: [],
        
        // Analysis metadata
        wordCount: this._countWords(textContent),
        characterCount: textContent.length,
        analysisTimestamp: new Date().toISOString()
      };

      // Calculate overall quality score and generate comprehensive results
      analysis.qualityScore = this._calculateContentQualityScore(analysis);
      analysis.recommendations = this._generateContentRecommendations(analysis);
      
      // BaseAnalyzer integration: comprehensive scoring and summary
      const comprehensiveScore = this._calculateComprehensiveScore(analysis);
      const recommendations = this._generateContentQualityRecommendations(analysis);
      const summary = this._generateContentQualitySummary(analysis);
      
      this.log('Content quality analysis completed successfully');
      
      return {
        ...analysis,
        score: comprehensiveScore,
        recommendations: [...analysis.recommendations, ...recommendations],
        summary,
        metadata: this.getMetadata()
      };
      
    } catch (error) {
      return this.handleError('Content quality analysis failed', error, {
        readability: null,
        keywordDensity: null,
        contentRatio: null,
        qualityScore: 0,
        recommendations: []
      });
    }
  }

  /**
   * Extract clean text content from document
   */
  _extractTextContent(document) {
    // Remove script and style elements
    const scripts = document.querySelectorAll('script, style, noscript');
    scripts.forEach(element => element.remove());
    
    // Get text from main content areas
    const contentSelectors = [
      'main',
      'article', 
      '.content',
      '.post-content',
      '.entry-content',
      '#content',
      '.page-content'
    ];
    
    let textContent = '';
    
    // Try to find main content area
    for (const selector of contentSelectors) {
      const contentArea = document.querySelector(selector);
      if (contentArea) {
        textContent = contentArea.textContent || '';
        break;
      }
    }
    
    // Fallback to body content
    if (!textContent) {
      textContent = document.body?.textContent || document.textContent || '';
    }
    
    // Clean up the text
    return textContent
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/[^\w\s.,!?;:'"()\-]/g, '') // Remove special characters but keep punctuation
      .trim();
  }

  /**
   * Analyze reading level and complexity using Flesch Reading Ease and other metrics
   */
  _analyzeReadability(text) {
    if (!text || text.length < 100) {
      return {
        fleschScore: 0,
        fleschGrade: 'Insufficient text',
        avgWordsPerSentence: 0,
        avgSyllablesPerWord: 0,
        readingLevel: 'Cannot determine',
        complexity: 'low',
        issues: ['Text too short for analysis']
      };
    }

    const sentences = this._splitIntoSentences(text);
    const words = this._splitIntoWords(text);
    
    if (sentences.length === 0 || words.length === 0) {
      return {
        fleschScore: 0,
        fleschGrade: 'No sentences found',
        readingLevel: 'Cannot determine',
        complexity: 'low'
      };
    }

    const totalSyllables = words.reduce((sum, word) => sum + this._countSyllables(word), 0);
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = totalSyllables / words.length;

    // Flesch Reading Ease Score
    const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    
    // Determine reading level
    const readingLevel = this._getReadingLevel(fleschScore);
    
    // Analyze complexity factors
    const complexity = this._analyzeComplexity(text, words, sentences);
    
    // Identify issues
    const issues = this._identifyReadabilityIssues(avgWordsPerSentence, avgSyllablesPerWord, complexity);

    return {
      fleschScore: Math.max(0, Math.round(fleschScore)),
      fleschGrade: readingLevel.gradeLevel,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 10) / 10,
      readingLevel: readingLevel.level,
      complexity: complexity.level,
      complexityFactors: complexity.factors,
      issues,
      totalSentences: sentences.length,
      totalWords: words.length,
      totalSyllables: totalSyllables
    };
  }

  /**
   * Analyze keyword density
   */
  _analyzeKeywordDensity(text) {
    const words = this._splitIntoWords(text.toLowerCase());
    const wordCount = words.length;
    
    if (wordCount === 0) {
      return {
        totalWords: 0,
        keywords: [],
        issues: ['No words found for analysis']
      };
    }

    // Count word frequencies
    const wordFrequency = {};
    words.forEach(word => {
      if (word.length >= this.config.minWordLength && !this._isStopWord(word)) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });

    // Calculate keyword density and sort by frequency
    const keywords = Object.entries(wordFrequency)
      .map(([word, count]) => ({
        word,
        count,
        density: (count / wordCount) * 100,
        category: this._categorizeKeywordDensity((count / wordCount) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, this.config.maxKeywordsToAnalyze);

    // Analyze n-grams (2-word phrases)
    const bigrams = this._analyzeBigrams(words);

    // Identify issues
    const issues = this._identifyKeywordIssues(keywords);

    return {
      totalWords: wordCount,
      uniqueWords: Object.keys(wordFrequency).length,
      keywords,
      bigrams: bigrams.slice(0, 10), // Top 10 bigrams
      keywordDiversity: Object.keys(wordFrequency).length / wordCount,
      issues,
      topKeywordDensity: keywords.length > 0 ? keywords[0].density : 0
    };
  }

  /**
   * Analyze content-to-code ratio
   */
  _analyzeContentToCodeRatio(textContent, rawHTML) {
    if (!rawHTML) {
      return {
        ratio: 0,
        category: 'unknown',
        textBytes: textContent.length,
        htmlBytes: 0,
        issues: ['Raw HTML not available for analysis']
      };
    }

    const textBytes = new Blob([textContent]).size;
    const htmlBytes = new Blob([rawHTML]).size;
    const ratio = htmlBytes > 0 ? (textBytes / htmlBytes) * 100 : 0;

    const category = this._categorizeContentRatio(ratio);
    const issues = this._identifyContentRatioIssues(ratio);

    return {
      ratio: Math.round(ratio * 10) / 10,
      category,
      textBytes,
      htmlBytes,
      textKB: Math.round(textBytes / 1024 * 10) / 10,
      htmlKB: Math.round(htmlBytes / 1024 * 10) / 10,
      issues
    };
  }

  /**
   * Analyze content structure
   */
  _analyzeContentStructure(document, textContent) {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const paragraphs = document.querySelectorAll('p');
    const lists = document.querySelectorAll('ul, ol');
    const images = document.querySelectorAll('img');
    
    const words = this._splitIntoWords(textContent);
    const sentences = this._splitIntoSentences(textContent);
    
    // Calculate content distribution
    const avgWordsPerParagraph = paragraphs.length > 0 ? words.length / paragraphs.length : 0;
    const avgSentencesPerParagraph = paragraphs.length > 0 ? sentences.length / paragraphs.length : 0;
    
    // Analyze heading distribution
    const headingAnalysis = this._analyzeHeadingDistribution(headings, words.length);
    
    return {
      headings: {
        total: headings.length,
        distribution: headingAnalysis.distribution,
        density: headingAnalysis.density,
        structure: headingAnalysis.structure
      },
      paragraphs: {
        total: paragraphs.length,
        avgWordsPerParagraph: Math.round(avgWordsPerParagraph),
        avgSentencesPerParagraph: Math.round(avgSentencesPerParagraph * 10) / 10
      },
      lists: {
        total: lists.length,
        listDensity: words.length > 0 ? (lists.length / words.length) * 1000 : 0 // Lists per 1000 words
      },
      multimedia: {
        images: images.length,
        imageDensity: words.length > 0 ? (images.length / words.length) * 1000 : 0 // Images per 1000 words
      },
      structure: this._analyzeContentFlow(document)
    };
  }

  /**
   * Basic content uniqueness analysis
   */
  _analyzeContentUniqueness(text) {
    const words = this._splitIntoWords(text.toLowerCase());
    const sentences = this._splitIntoSentences(text);
    
    // Calculate text diversity metrics
    const uniqueWords = new Set(words);
    const wordDiversity = words.length > 0 ? uniqueWords.size / words.length : 0;
    
    // Analyze sentence patterns
    const sentenceLengths = sentences.map(s => this._splitIntoWords(s).length);
    const avgSentenceLength = sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length || 0;
    const sentenceLengthVariance = this._calculateVariance(sentenceLengths);
    
    // Look for potential duplicate content patterns
    const duplicatePatterns = this._findDuplicatePatterns(sentences);
    
    return {
      wordDiversity: Math.round(wordDiversity * 1000) / 1000,
      uniqueWordRatio: Math.round((uniqueWords.size / words.length) * 100 * 10) / 10,
      sentenceLengthVariance: Math.round(sentenceLengthVariance * 10) / 10,
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      duplicatePatterns: duplicatePatterns.slice(0, 5), // Top 5 potential duplicates
      uniquenessScore: this._calculateUniquenessScore(wordDiversity, sentenceLengthVariance, duplicatePatterns.length)
    };
  }

  // Helper methods

  /**
   * Split text into sentences
   */
  _splitIntoSentences(text) {
    return text.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Split text into words
   */
  _splitIntoWords(text) {
    return text.toLowerCase()
      .split(/\s+/)
      .map(word => word.replace(/[^\w]/g, ''))
      .filter(word => word.length > 0);
  }

  /**
   * Count syllables in a word (approximate)
   */
  _countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = word.match(/[aeiouy]/g);
    let syllables = vowels ? vowels.length : 1;
    
    // Adjust for silent e
    if (word.endsWith('e')) syllables--;
    
    // Adjust for double vowels
    const doubleVowels = word.match(/[aeiouy]{2}/g);
    if (doubleVowels) syllables -= doubleVowels.length;
    
    return Math.max(1, syllables);
  }

  /**
   * Get reading level based on Flesch score
   */
  _getReadingLevel(fleschScore) {
    const levels = CONTENT_QUALITY_STANDARDS.READING_LEVELS;
    
    if (fleschScore >= levels.VERY_EASY.fleschScore) return { level: 'Very Easy', gradeLevel: levels.VERY_EASY.gradeLevel };
    if (fleschScore >= levels.EASY.fleschScore) return { level: 'Easy', gradeLevel: levels.EASY.gradeLevel };
    if (fleschScore >= levels.FAIRLY_EASY.fleschScore) return { level: 'Fairly Easy', gradeLevel: levels.FAIRLY_EASY.gradeLevel };
    if (fleschScore >= levels.STANDARD.fleschScore) return { level: 'Standard', gradeLevel: levels.STANDARD.gradeLevel };
    if (fleschScore >= levels.FAIRLY_DIFFICULT.fleschScore) return { level: 'Fairly Difficult', gradeLevel: levels.FAIRLY_DIFFICULT.gradeLevel };
    if (fleschScore >= levels.DIFFICULT.fleschScore) return { level: 'Difficult', gradeLevel: levels.DIFFICULT.gradeLevel };
    return { level: 'Very Difficult', gradeLevel: levels.VERY_DIFFICULT.gradeLevel };
  }

  /**
   * Analyze text complexity factors
   */
  _analyzeComplexity(text, words, sentences) {
    const longWords = words.filter(word => word.length > 6).length;
    const longWordsRatio = words.length > 0 ? longWords / words.length : 0;
    
    const longSentences = sentences.filter(sentence => 
      this._splitIntoWords(sentence).length > 20
    ).length;
    const longSentencesRatio = sentences.length > 0 ? longSentences / sentences.length : 0;
    
    const passiveVoicePatterns = (text.match(/\b(was|were|is|are|been|being)\s+\w+ed\b/gi) || []).length;
    const passiveVoiceRatio = sentences.length > 0 ? passiveVoicePatterns / sentences.length : 0;
    
    let level = 'low';
    if (longWordsRatio > 0.2 || longSentencesRatio > 0.3 || passiveVoiceRatio > 0.2) {
      level = 'high';
    } else if (longWordsRatio > 0.1 || longSentencesRatio > 0.15 || passiveVoiceRatio > 0.1) {
      level = 'medium';
    }
    
    return {
      level,
      factors: {
        longWordsRatio: Math.round(longWordsRatio * 100),
        longSentencesRatio: Math.round(longSentencesRatio * 100),
        passiveVoiceRatio: Math.round(passiveVoiceRatio * 100),
        longWords,
        longSentences,
        passiveVoicePatterns
      }
    };
  }

  /**
   * Check if word is a stop word
   */
  _isStopWord(word) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
      'between', 'among', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we',
      'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their',
      'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'yourselves', 'themselves',
      'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how', 'all', 'any', 'both',
      'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
      'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now'
    ]);
    return stopWords.has(word);
  }

  /**
   * Analyze bigrams (2-word phrases)
   */
  _analyzeBigrams(words) {
    const bigrams = {};
    
    for (let i = 0; i < words.length - 1; i++) {
      if (!this._isStopWord(words[i]) && !this._isStopWord(words[i + 1])) {
        const bigram = `${words[i]} ${words[i + 1]}`;
        bigrams[bigram] = (bigrams[bigram] || 0) + 1;
      }
    }
    
    return Object.entries(bigrams)
      .map(([phrase, count]) => ({ phrase, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Categorize keyword density
   */
  _categorizeKeywordDensity(density) {
    const standards = CONTENT_QUALITY_STANDARDS.KEYWORD_DENSITY;
    
    if (density >= standards.SPAM_THRESHOLD) return 'spam';
    if (density >= standards.WARNING_THRESHOLD) return 'warning';
    if (density >= standards.OPTIMAL_MIN && density <= standards.OPTIMAL_MAX) return 'optimal';
    if (density < standards.OPTIMAL_MIN) return 'low';
    return 'high';
  }

  /**
   * Categorize content-to-code ratio
   */
  _categorizeContentRatio(ratio) {
    const standards = CONTENT_QUALITY_STANDARDS.CONTENT_RATIOS;
    
    if (ratio >= standards.EXCELLENT_CONTENT_TO_CODE) return 'excellent';
    if (ratio >= standards.GOOD_CONTENT_TO_CODE) return 'good';
    if (ratio >= standards.MIN_CONTENT_TO_CODE) return 'acceptable';
    return 'poor';
  }

  /**
   * Count words in text
   */
  _countWords(text) {
    return this._splitIntoWords(text).length;
  }

  /**
   * Calculate variance of an array
   */
  _calculateVariance(numbers) {
    if (numbers.length === 0) return 0;
    
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }

  /**
   * Find potential duplicate content patterns
   */
  _findDuplicatePatterns(sentences) {
    const patterns = {};
    
    sentences.forEach(sentence => {
      const words = this._splitIntoWords(sentence);
      if (words.length >= 5) {
        // Check for 5-word patterns
        for (let i = 0; i <= words.length - 5; i++) {
          const pattern = words.slice(i, i + 5).join(' ');
          patterns[pattern] = (patterns[pattern] || 0) + 1;
        }
      }
    });
    
    return Object.entries(patterns)
      .filter(([pattern, count]) => count > 1)
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate uniqueness score
   */
  _calculateUniquenessScore(wordDiversity, sentenceLengthVariance, duplicateCount) {
    let score = 100;
    
    // Penalize low word diversity
    if (wordDiversity < 0.3) score -= 30;
    else if (wordDiversity < 0.5) score -= 15;
    
    // Penalize low sentence variance (repetitive structure)
    if (sentenceLengthVariance < 10) score -= 20;
    
    // Penalize duplicate patterns
    score -= Math.min(duplicateCount * 10, 50);
    
    return Math.max(0, score);
  }

  /**
   * Analyze heading distribution
   */
  _analyzeHeadingDistribution(headings, wordCount) {
    const distribution = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
    const structure = [];
    
    headings.forEach(heading => {
      const level = heading.tagName.toLowerCase();
      distribution[level]++;
      structure.push({
        level,
        text: heading.textContent.trim().substring(0, 50),
        wordCount: this._countWords(heading.textContent)
      });
    });
    
    const density = wordCount > 0 ? (headings.length / wordCount) * 1000 : 0; // Headings per 1000 words
    
    return { distribution, density: Math.round(density * 10) / 10, structure };
  }

  /**
   * Analyze content flow
   */
  _analyzeContentFlow(document) {
    const mainElements = document.querySelectorAll('main, article, .content, #content');
    const hasMainContent = mainElements.length > 0;
    
    const sectionsElements = document.querySelectorAll('section');
    const hasSections = sectionsElements.length > 0;
    
    const asideElements = document.querySelectorAll('aside');
    const hasSidebar = asideElements.length > 0;
    
    return {
      hasMainContent,
      hasSections,
      hasSidebar,
      structuralElements: mainElements.length + sectionsElements.length + asideElements.length
    };
  }

  /**
   * Identify readability issues
   */
  _identifyReadabilityIssues(avgWordsPerSentence, avgSyllablesPerWord, complexity) {
    const issues = [];
    
    if (avgWordsPerSentence > 25) {
      issues.push('Sentences are too long (average > 25 words)');
    }
    
    if (avgSyllablesPerWord > 2.0) {
      issues.push('Words are too complex (average > 2 syllables per word)');
    }
    
    if (complexity.factors.passiveVoiceRatio > 20) {
      issues.push('High use of passive voice (> 20%)');
    }
    
    if (complexity.factors.longWordsRatio > 30) {
      issues.push('Too many long words (> 30% over 6 characters)');
    }
    
    return issues;
  }

  /**
   * Identify keyword density issues
   */
  _identifyKeywordIssues(keywords) {
    const issues = [];
    const standards = CONTENT_QUALITY_STANDARDS.KEYWORD_DENSITY;
    
    keywords.forEach(keyword => {
      if (keyword.density >= standards.SPAM_THRESHOLD) {
        issues.push(`Potential keyword stuffing: "${keyword.word}" (${keyword.density.toFixed(1)}%)`);
      } else if (keyword.density >= standards.WARNING_THRESHOLD) {
        issues.push(`High keyword density: "${keyword.word}" (${keyword.density.toFixed(1)}%)`);
      }
    });
    
    return issues;
  }

  /**
   * Identify content ratio issues
   */
  _identifyContentRatioIssues(ratio) {
    const issues = [];
    const standards = CONTENT_QUALITY_STANDARDS.CONTENT_RATIOS;
    
    if (ratio < standards.MIN_CONTENT_TO_CODE) {
      issues.push(`Low content-to-code ratio (${ratio.toFixed(1)}% - should be > ${standards.MIN_CONTENT_TO_CODE}%)`);
    }
    
    return issues;
  }

  /**
   * Calculate overall content quality score
   */
  _calculateContentQualityScore(analysis) {
    const weights = {
      readability: 0.3,
      contentRatio: 0.2,
      keywordDensity: 0.2,
      uniqueness: 0.2,
      structure: 0.1
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    // Readability score (based on Flesch score)
    if (analysis.readability && analysis.readability.fleschScore) {
      const readabilityScore = Math.min(100, Math.max(0, analysis.readability.fleschScore));
      totalScore += readabilityScore * weights.readability;
      totalWeight += weights.readability;
    }
    
    // Content ratio score
    if (analysis.contentRatio) {
      let ratioScore = 0;
      switch (analysis.contentRatio.category) {
        case 'excellent': ratioScore = 100; break;
        case 'good': ratioScore = 80; break;
        case 'acceptable': ratioScore = 60; break;
        case 'poor': ratioScore = 30; break;
      }
      totalScore += ratioScore * weights.contentRatio;
      totalWeight += weights.contentRatio;
    }
    
    // Keyword density score (penalize spam, reward optimal)
    if (analysis.keywordDensity) {
      let keywordScore = 80; // Base score
      if (analysis.keywordDensity.issues.length > 0) {
        keywordScore -= analysis.keywordDensity.issues.length * 20;
      }
      totalScore += Math.max(0, keywordScore) * weights.keywordDensity;
      totalWeight += weights.keywordDensity;
    }
    
    // Uniqueness score
    if (analysis.uniqueness) {
      totalScore += analysis.uniqueness.uniquenessScore * weights.uniqueness;
      totalWeight += weights.uniqueness;
    }
    
    // Structure score
    if (analysis.contentStructure) {
      let structureScore = 50; // Base score
      if (analysis.contentStructure.headings.total > 0) structureScore += 20;
      if (analysis.contentStructure.structure.hasMainContent) structureScore += 15;
      if (analysis.contentStructure.structure.hasSections) structureScore += 15;
      totalScore += Math.min(100, structureScore) * weights.structure;
      totalWeight += weights.structure;
    }
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  /**
   * Generate content quality recommendations
   */
  _generateContentRecommendations(analysis) {
    const recommendations = [];
    
    // Readability recommendations
    if (analysis.readability && analysis.readability.fleschScore < 60) {
      recommendations.push({
        type: 'readability',
        priority: 'high',
        title: 'Improve Content Readability',
        description: `Flesch Reading Ease score is ${analysis.readability.fleschScore} (target: 60+)`,
        suggestions: [
          'Use shorter sentences (target: < 20 words per sentence)',
          'Replace complex words with simpler alternatives',
          'Reduce use of passive voice',
          'Break up long paragraphs',
          'Add transition words to improve flow'
        ]
      });
    }
    
    // Content ratio recommendations
    if (analysis.contentRatio && analysis.contentRatio.category === 'poor') {
      recommendations.push({
        type: 'content-ratio',
        priority: 'medium',
        title: 'Increase Content-to-Code Ratio',
        description: `Content-to-code ratio is ${analysis.contentRatio.ratio}% (target: 25%+)`,
        suggestions: [
          'Add more substantive text content',
          'Reduce unnecessary HTML markup',
          'Optimize CSS and JavaScript delivery',
          'Remove redundant code',
          'Focus on valuable, informative content'
        ]
      });
    }
    
    // Keyword density recommendations
    if (analysis.keywordDensity && analysis.keywordDensity.issues.length > 0) {
      recommendations.push({
        type: 'keyword-density',
        priority: 'medium',
        title: 'Optimize Keyword Usage',
        description: `${analysis.keywordDensity.issues.length} keyword density issues found`,
        suggestions: [
          'Reduce overused keywords (target: 1-3% density)',
          'Use synonyms and related terms',
          'Focus on natural language flow',
          'Expand content to dilute keyword concentration',
          'Avoid keyword stuffing'
        ]
      });
    }
    
    // Uniqueness recommendations
    if (analysis.uniqueness && analysis.uniqueness.uniquenessScore < 70) {
      recommendations.push({
        type: 'uniqueness',
        priority: 'medium',
        title: 'Improve Content Uniqueness',
        description: `Content uniqueness score is ${analysis.uniqueness.uniquenessScore}/100`,
        suggestions: [
          'Vary sentence structure and length',
          'Use more diverse vocabulary',
          'Remove repetitive phrases',
          'Add original insights and perspectives',
          'Ensure content adds unique value'
        ]
      });
    }
    
    return recommendations;
  }

  /**
   * Calculate comprehensive content quality score for BaseAnalyzer integration
   * @param {Object} analysis - Content analysis results
   * @returns {number} Comprehensive score (0-100)
   */
  _calculateComprehensiveScore(analysis) {
    try {
      const weights = {
        readability: 0.25,        // 25% - Reading level and complexity
        keywordDensity: 0.20,     // 20% - Keyword optimization
        contentRatio: 0.20,       // 20% - Content-to-code ratio
        contentStructure: 0.15,   // 15% - Content organization
        uniqueness: 0.20          // 20% - Content uniqueness
      };

      let totalScore = 0;
      let totalWeight = 0;

      // Readability score
      if (analysis.readability && analysis.readability.fleschScore !== undefined) {
        const readabilityScore = Math.min(100, Math.max(0, analysis.readability.fleschScore));
        totalScore += readabilityScore * weights.readability;
        totalWeight += weights.readability;
      }

      // Keyword density score (inverse of issues)
      if (analysis.keywordDensity) {
        const issueCount = analysis.keywordDensity.issues ? analysis.keywordDensity.issues.length : 0;
        const keywordScore = Math.max(0, 100 - (issueCount * 10));
        totalScore += keywordScore * weights.keywordDensity;
        totalWeight += weights.keywordDensity;
      }

      // Content ratio score
      if (analysis.contentRatio && analysis.contentRatio.ratio !== undefined) {
        const ratio = analysis.contentRatio.ratio;
        let ratioScore = 0;
        if (ratio >= 40) ratioScore = 100;
        else if (ratio >= 25) ratioScore = 80;
        else if (ratio >= 15) ratioScore = 60;
        else ratioScore = Math.max(0, ratio * 2);
        
        totalScore += ratioScore * weights.contentRatio;
        totalWeight += weights.contentRatio;
      }

      // Content structure score
      if (analysis.contentStructure) {
        const structure = analysis.contentStructure;
        let structureScore = 50; // Base score
        
        if (structure.headingStructure && structure.headingStructure.hasH1) structureScore += 10;
        if (structure.headingStructure && structure.headingStructure.properHierarchy) structureScore += 10;
        if (structure.paragraphCount > 3) structureScore += 10;
        if (structure.averageParagraphLength < 100) structureScore += 10;
        if (structure.averageSentenceLength < 25) structureScore += 10;
        
        totalScore += Math.min(100, structureScore) * weights.contentStructure;
        totalWeight += weights.contentStructure;
      }

      // Uniqueness score
      if (analysis.uniqueness && analysis.uniqueness.uniquenessScore !== undefined) {
        totalScore += analysis.uniqueness.uniquenessScore * weights.uniqueness;
        totalWeight += weights.uniqueness;
      }

      return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    } catch (error) {
      this.log('Error calculating comprehensive score:', error.message);
      return 0;
    }
  }

  /**
   * Generate comprehensive content quality recommendations
   * @param {Object} analysis - Content analysis results
   * @returns {Array} Enhanced recommendations
   */
  _generateContentQualityRecommendations(analysis) {
    const recommendations = [];

    try {
      // Reading level optimization
      if (analysis.readability) {
        const flesch = analysis.readability.fleschScore;
        if (flesch < 30) {
          recommendations.push({
            category: 'readability',
            priority: 'high',
            title: 'Simplify Content for Better Readability',
            description: 'Content is too complex for most readers',
            impact: 'User engagement and comprehension',
            actionItems: [
              'Use shorter sentences (15-20 words)',
              'Choose simpler vocabulary',
              'Break up complex ideas',
              'Add transitional phrases'
            ]
          });
        } else if (flesch > 90) {
          recommendations.push({
            category: 'readability',
            priority: 'medium',
            title: 'Add Depth to Content',
            description: 'Content may be oversimplified',
            impact: 'Professional credibility and expertise demonstration',
            actionItems: [
              'Add more detailed explanations',
              'Include technical terms where appropriate',
              'Expand on key concepts'
            ]
          });
        }
      }

      // Content structure improvements
      if (analysis.contentStructure) {
        const structure = analysis.contentStructure;
        
        if (!structure.headingStructure?.hasH1) {
          recommendations.push({
            category: 'structure',
            priority: 'high',
            title: 'Add Primary Heading (H1)',
            description: 'Page is missing a main heading',
            impact: 'SEO and content hierarchy',
            actionItems: ['Add a descriptive H1 tag to the page']
          });
        }

        if (structure.paragraphCount < 3) {
          recommendations.push({
            category: 'structure',
            priority: 'medium',
            title: 'Improve Content Structure',
            description: 'Content needs better organization',
            impact: 'Readability and user experience',
            actionItems: [
              'Break content into logical paragraphs',
              'Use subheadings to organize topics',
              'Ensure each paragraph has a clear focus'
            ]
          });
        }
      }

      // Content volume recommendations
      if (analysis.wordCount < 300) {
        recommendations.push({
          category: 'volume',
          priority: 'high',
          title: 'Increase Content Volume',
          description: `Content is too short (${analysis.wordCount} words)`,
          impact: 'SEO value and user engagement',
          actionItems: [
            'Expand on existing topics',
            'Add supporting details and examples',
            'Include relevant background information',
            'Target at least 300 words for meaningful content'
          ]
        });
      }

      return recommendations;
    } catch (error) {
      this.log('Error generating content quality recommendations:', error.message);
      return [];
    }
  }

  /**
   * Generate comprehensive content quality summary
   * @param {Object} analysis - Content analysis results
   * @returns {Object} Content quality summary
   */
  _generateContentQualitySummary(analysis) {
    try {
      const summary = {
        totalWords: analysis.wordCount || 0,
        readabilityLevel: 'Unknown',
        contentQuality: 'Poor',
        keyIssues: [],
        strengths: []
      };

      // Determine readability level
      if (analysis.readability && analysis.readability.fleschScore !== undefined) {
        const flesch = analysis.readability.fleschScore;
        if (flesch >= 90) summary.readabilityLevel = 'Very Easy';
        else if (flesch >= 80) summary.readabilityLevel = 'Easy';
        else if (flesch >= 70) summary.readabilityLevel = 'Fairly Easy';
        else if (flesch >= 60) summary.readabilityLevel = 'Standard';
        else if (flesch >= 50) summary.readabilityLevel = 'Fairly Difficult';
        else if (flesch >= 30) summary.readabilityLevel = 'Difficult';
        else summary.readabilityLevel = 'Very Difficult';
      }

      // Determine overall content quality
      const score = this._calculateComprehensiveScore(analysis);
      if (score >= 90) summary.contentQuality = 'Excellent';
      else if (score >= 80) summary.contentQuality = 'Good';
      else if (score >= 70) summary.contentQuality = 'Fair';
      else if (score >= 60) summary.contentQuality = 'Poor';
      else summary.contentQuality = 'Very Poor';

      // Identify key issues
      if (analysis.wordCount < 300) {
        summary.keyIssues.push('Insufficient content length');
      }
      
      if (analysis.keywordDensity?.issues?.length > 0) {
        summary.keyIssues.push('Keyword density issues detected');
      }
      
      if (analysis.contentRatio?.ratio < 15) {
        summary.keyIssues.push('Low content-to-code ratio');
      }

      // Identify strengths
      if (analysis.readability?.fleschScore >= 60 && analysis.readability?.fleschScore <= 80) {
        summary.strengths.push('Good readability level');
      }
      
      if (analysis.contentStructure?.headingStructure?.properHierarchy) {
        summary.strengths.push('Well-structured heading hierarchy');
      }
      
      if (analysis.uniqueness?.uniquenessScore > 80) {
        summary.strengths.push('High content uniqueness');
      }

      return summary;
    } catch (error) {
      this.log('Error generating content quality summary:', error.message);
      return {
        totalWords: 0,
        readabilityLevel: 'Unknown',
        contentQuality: 'Unknown',
        keyIssues: ['Analysis error occurred'],
        strengths: []
      };
    }
  }

  // ============================================================================
  // LEGACY COMPATIBILITY METHODS
  // ============================================================================

  /**
   * @deprecated Use analyze() method instead
   * Legacy method for backward compatibility
   */
  analyzeContentQuality(dom, pageData, rawHTML = '') {
    console.warn('ContentQualityAnalyzer.analyzeContentQuality() is deprecated. Use analyze() method instead.');
    return this.analyze({ dom, pageData, rawHTML });
  }
}

export default ContentQualityAnalyzer;
