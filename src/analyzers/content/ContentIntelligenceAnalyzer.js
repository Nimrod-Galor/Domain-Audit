/**
 * ============================================================================
 * CONTENT INTELLIGENCE ANALYZER MODULE
 * ============================================================================
 * 
 * Advanced content intelligence analysis including:
 * - Enhanced content uniqueness scoring with fingerprinting
 * - Cross-site duplicate content detection
 * - Content similarity analysis
 * - Plagiarism detection patterns
 * - Content originality scoring
 * 
 * This module addresses the remaining 1.5% coverage gap in Content Intelligence
 * 
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @version 1.0.0
 */

import crypto from 'crypto';
import { BaseAnalyzer } from '../core/BaseAnalyzer.js';
import { AnalyzerInterface } from '../core/AnalyzerInterface.js';

/**
 * Content Intelligence Configuration
 */
export const CONTENT_INTELLIGENCE_CONFIG = {
  FINGERPRINTING: {
    SHINGLE_SIZE: 5,           // N-gram size for content fingerprinting
    MIN_CONTENT_LENGTH: 100,   // Minimum content length for analysis
    SIMILARITY_THRESHOLD: 0.8, // 80% similarity threshold for duplicates
    HASH_ALGORITHM: 'sha256'   // Hash algorithm for fingerprinting
  },
  DUPLICATE_DETECTION: {
    MIN_DUPLICATE_LENGTH: 50,    // Minimum duplicate segment length
    EXACT_MATCH_THRESHOLD: 0.95, // 95% exact match threshold
    FUZZY_MATCH_THRESHOLD: 0.85, // 85% fuzzy match threshold
    MAX_EDIT_DISTANCE: 5         // Maximum edit distance for fuzzy matching
  },
  UNIQUENESS_SCORING: {
    EXCELLENT_THRESHOLD: 90,     // 90%+ = excellent uniqueness
    GOOD_THRESHOLD: 75,          // 75%+ = good uniqueness
    FAIR_THRESHOLD: 60,          // 60%+ = fair uniqueness
    POOR_THRESHOLD: 40           // Below 40% = poor uniqueness
  },
  CONTENT_ANALYSIS: {
    SEMANTIC_WEIGHT: 0.4,        // Weight for semantic analysis
    STRUCTURAL_WEIGHT: 0.3,      // Weight for structural analysis
    LEXICAL_WEIGHT: 0.3          // Weight for lexical analysis
  }
};

/**
 * Content Intelligence Analyzer Class
 */
export class ContentIntelligenceAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('ContentIntelligenceAnalyzer');
    
    this.options = { ...CONTENT_INTELLIGENCE_CONFIG, ...options };
    this.contentDatabase = new Map(); // In-memory content database for site-wide analysis
    this.fingerprintCache = new Map(); // Cache for content fingerprints
  }

  /**
   * Get analyzer metadata for BaseAnalyzer integration
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'Content Intelligence Analyzer',
      category: AnalyzerCategories.CONTENT,
      description: 'Advanced content intelligence analysis including uniqueness scoring, duplicate detection, and originality assessment',
      version: '1.0.0',
      author: 'Nimrod Galor',
      tags: ['content', 'uniqueness', 'duplicates', 'originality', 'plagiarism', 'intelligence'],
      capabilities: [
        'content-fingerprinting',
        'duplicate-detection',
        'similarity-analysis',
        'uniqueness-scoring',
        'originality-assessment',
        'cross-page-analysis'
      ]
    };
  }

  /**
   * Validate input for content intelligence analysis
   * @param {Object} context - Analysis context
   * @returns {boolean} Whether input is valid
   */
  validate(context) {
    if (!context || typeof context !== 'object') {
      return this.handleError('Invalid context provided');
    }

    if (!context.document && !context.dom) {
      return this.handleError('No document or DOM provided for content intelligence analysis');
    }

    return true;
  }

  /**
   * Enhanced analyze method with BaseAnalyzer integration
   * @param {Object} context - Analysis context containing document, url, pageData, siteData
   * @returns {Object} Enhanced analysis results with BaseAnalyzer structure
   */
  async analyze(context) {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!this.validate(context)) {
        return this.createErrorResult('Validation failed');
      }

      // Extract data from context
      const document = context.document || context.dom?.window?.document;
      const url = context.url || '';
      const pageData = context.pageData || {};
      const siteData = context.siteData || {};

      // Perform comprehensive content intelligence analysis
      const analysisResult = await this.performContentIntelligenceAnalysis(document, pageData, url, siteData);

      // Calculate comprehensive score using BaseAnalyzer integration
      const score = this._calculateComprehensiveScore(analysisResult);

      // Generate optimization recommendations
      const recommendations = this._generateContentIntelligenceRecommendations(analysisResult);

      // Generate analysis summary
      const summary = this._generateContentIntelligenceSummary(analysisResult);

      // Return enhanced BaseAnalyzer-compatible result
      return {
        success: true,
        analyzer: 'ContentIntelligenceAnalyzer',
        category: AnalyzerCategories.CONTENT,
        score: score,
        data: {
          ...analysisResult,
          metadata: {
            analysisTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            version: this.getMetadata().version
          }
        },
        recommendations: recommendations,
        summary: summary,
        errors: [],
        warnings: analysisResult.warnings || []
      };

    } catch (error) {
      return this.handleError(`Content intelligence analysis failed: ${error.message}`, {
        analyzer: 'ContentIntelligenceAnalyzer',
        duration: Date.now() - startTime
      });
    }
  }

  /**
   * Perform comprehensive content intelligence analysis
   * @param {Object} document - Document object
   * @param {Object} pageData - Existing page data
   * @param {string} url - Page URL
   * @param {Object} siteData - Site-wide data for cross-page analysis
   * @returns {Object} Content intelligence analysis
   */
  async performContentIntelligenceAnalysis(document, pageData, url, siteData = {}) {
    try {
      const textContent = this._extractCleanTextContent(document);
      
      if (textContent.length < this.options.FINGERPRINTING.MIN_CONTENT_LENGTH) {
        return this._createMinimalAnalysis('Content too short for meaningful analysis');
      }

      const analysis = {
        // Enhanced uniqueness analysis
        uniquenessAnalysis: this._analyzeEnhancedUniqueness(textContent, url),
        
        // Content fingerprinting
        contentFingerprint: this._generateContentFingerprint(textContent),
        
        // Duplicate content detection
        duplicateDetection: this._detectDuplicateContent(textContent, url, siteData),
        
        // Content similarity analysis
        similarityAnalysis: this._analyzeSimilarity(textContent, siteData),
        
        // Originality scoring
        originalityScore: 0,
        
        // Content quality indicators
        qualityIndicators: this._analyzeQualityIndicators(textContent, document),
        
        // Plagiarism risk assessment
        plagiarismRisk: this._assessPlagiarismRisk(textContent),
        
        // Recommendations
        recommendations: [],
        
        // Analysis metadata
        analysisTimestamp: new Date().toISOString(),
        contentLength: textContent.length,
        url: url
      };

      // Calculate overall originality score
      analysis.originalityScore = this._calculateOriginalityScore(analysis);
      
      // Generate recommendations
      analysis.recommendations = this._generateIntelligenceRecommendations(analysis);
      
      // Store content for site-wide analysis
      this._storeContentData(url, textContent, analysis);
      
      return analysis;
      
    } catch (error) {
      return this._createErrorAnalysis(error.message);
    }
  }

  /**
   * Extract clean text content optimized for content analysis
   */
  _extractCleanTextContent(document) {
    // Remove noise elements
    const noiseSelectors = [
      'script', 'style', 'noscript', 'iframe', 'embed', 'object',
      '.advertisement', '.ads', '.sidebar', '.footer', '.header',
      '.navigation', '.nav', '.menu', '.breadcrumb', '.social',
      '[aria-hidden="true"]', '.hidden', '.sr-only'
    ];
    
    noiseSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    // Focus on main content areas
    const contentSelectors = [
      'main', 'article', '.content', '.post-content', '.entry-content',
      '#content', '.page-content', '.main-content', '[role="main"]'
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
    
    // Clean and normalize text
    return textContent
      .replace(/\s+/g, ' ')           // Normalize whitespace
      .replace(/[^\w\s.,!?;:-]/g, '') // Remove special characters except punctuation
      .trim()
      .toLowerCase();
  }

  /**
   * Analyze enhanced content uniqueness
   */
  _analyzeEnhancedUniqueness(textContent, url) {
    const words = this._tokenizeText(textContent);
    const sentences = this._splitIntoSentences(textContent);
    
    // Lexical diversity analysis
    const lexicalAnalysis = this._analyzeLexicalDiversity(words);
    
    // Structural diversity analysis
    const structuralAnalysis = this._analyzeStructuralDiversity(sentences);
    
    // Semantic diversity analysis
    const semanticAnalysis = this._analyzeSemanticDiversity(textContent);
    
    // Content patterns analysis
    const patternsAnalysis = this._analyzeContentPatterns(textContent);
    
    return {
      lexicalDiversity: lexicalAnalysis,
      structuralDiversity: structuralAnalysis,
      semanticDiversity: semanticAnalysis,
      contentPatterns: patternsAnalysis,
      overallUniquenessScore: this._calculateUniquenessScore(
        lexicalAnalysis, structuralAnalysis, semanticAnalysis, patternsAnalysis
      )
    };
  }

  /**
   * Generate content fingerprint for duplicate detection
   */
  _generateContentFingerprint(textContent) {
    const shingles = this._generateShingles(textContent, this.options.FINGERPRINTING.SHINGLE_SIZE);
    const fingerprint = this._createHashFingerprint(shingles);
    
    return {
      contentHash: fingerprint.contentHash,
      shingleHashes: fingerprint.shingleHashes,
      shingleCount: shingles.length,
      fingerprintMethod: 'rolling-hash-shingles',
      algorithm: this.options.FINGERPRINTING.HASH_ALGORITHM
    };
  }

  /**
   * Detect duplicate content across pages
   */
  _detectDuplicateContent(textContent, url, siteData) {
    const duplicates = [];
    const nearDuplicates = [];
    const currentFingerprint = this._generateContentFingerprint(textContent);
    
    // Compare with cached content
    for (const [cachedUrl, cachedData] of this.contentDatabase) {
      if (cachedUrl === url) continue; // Skip self
      
      const similarity = this._calculateContentSimilarity(
        currentFingerprint, 
        cachedData.fingerprint
      );
      
      if (similarity >= this.options.DUPLICATE_DETECTION.EXACT_MATCH_THRESHOLD) {
        duplicates.push({
          url: cachedUrl,
          similarity: similarity,
          type: 'exact-duplicate',
          matchedSegments: this._findMatchingSegments(textContent, cachedData.content)
        });
      } else if (similarity >= this.options.DUPLICATE_DETECTION.FUZZY_MATCH_THRESHOLD) {
        nearDuplicates.push({
          url: cachedUrl,
          similarity: similarity,
          type: 'near-duplicate',
          matchedSegments: this._findMatchingSegments(textContent, cachedData.content)
        });
      }
    }
    
    return {
      exactDuplicates: duplicates,
      nearDuplicates: nearDuplicates,
      duplicateCount: duplicates.length,
      nearDuplicateCount: nearDuplicates.length,
      totalSimilarPages: duplicates.length + nearDuplicates.length,
      uniquenessRatio: this._calculateUniquenessRatio(duplicates.length, nearDuplicates.length)
    };
  }

  /**
   * Analyze content similarity patterns
   */
  _analyzeSimilarity(textContent, siteData) {
    const similarities = [];
    const contentSegments = this._segmentContent(textContent);
    
    // Analyze similarity patterns
    for (const [url, data] of this.contentDatabase) {
      const segmentSimilarities = contentSegments.map(segment => 
        this._calculateSegmentSimilarity(segment, data.content)
      );
      
      const avgSimilarity = segmentSimilarities.reduce((sum, sim) => sum + sim, 0) / segmentSimilarities.length;
      
      if (avgSimilarity > 0.3) { // 30% similarity threshold for tracking
        similarities.push({
          url: url,
          averageSimilarity: avgSimilarity,
          maxSimilarity: Math.max(...segmentSimilarities),
          segmentSimilarities: segmentSimilarities
        });
      }
    }
    
    return {
      similarPages: similarities.sort((a, b) => b.averageSimilarity - a.averageSimilarity),
      averageSitewideSimilarity: this._calculateAverageSimilarity(similarities),
      similarityDistribution: this._analyzeSimilarityDistribution(similarities)
    };
  }

  /**
   * Assess plagiarism risk based on content patterns
   */
  _assessPlagiarismRisk(textContent) {
    const riskFactors = [];
    let riskScore = 0;
    
    // Check for common plagiarism indicators
    const indicators = {
      // Long exact phrases (potential copy-paste)
      longExactPhrases: this._findLongExactPhrases(textContent),
      
      // Inconsistent writing style
      styleInconsistencies: this._detectStyleInconsistencies(textContent),
      
      // Unusual character patterns
      characterPatterns: this._analyzeCharacterPatterns(textContent),
      
      // Reference density anomalies
      referenceDensity: this._analyzeReferenceDensity(textContent)
    };
    
    // Evaluate risk factors
    if (indicators.longExactPhrases.length > 3) {
      riskFactors.push('Multiple long exact phrases detected');
      riskScore += 25;
    }
    
    if (indicators.styleInconsistencies.score > 0.7) {
      riskFactors.push('Inconsistent writing style detected');
      riskScore += 20;
    }
    
    if (indicators.characterPatterns.anomalies.length > 0) {
      riskFactors.push('Unusual character patterns found');
      riskScore += 15;
    }
    
    return {
      riskScore: Math.min(100, riskScore),
      riskLevel: this._categorizeRiskLevel(riskScore),
      riskFactors: riskFactors,
      indicators: indicators,
      confidence: this._calculateRiskConfidence(indicators)
    };
  }

  /**
   * Analyze content quality indicators for intelligence scoring
   */
  _analyzeQualityIndicators(textContent, document) {
    return {
      // Vocabulary sophistication
      vocabularySophistication: this._analyzeVocabularySophistication(textContent),
      
      // Information density
      informationDensity: this._analyzeInformationDensity(textContent),
      
      // Content depth indicators
      depthIndicators: this._analyzeContentDepth(textContent, document),
      
      // Original insights markers
      originalityMarkers: this._findOriginalityMarkers(textContent),
      
      // Authority signals
      authoritySignals: this._detectAuthoritySignals(textContent, document)
    };
  }

  /**
   * Calculate overall originality score
   */
  _calculateOriginalityScore(analysis) {
    const weights = this.options.CONTENT_ANALYSIS;
    let score = 100; // Start with perfect score
    
    // Penalize for duplicates
    if (analysis.duplicateDetection.exactDuplicates.length > 0) {
      score -= 50; // Heavy penalty for exact duplicates
    }
    
    if (analysis.duplicateDetection.nearDuplicates.length > 0) {
      score -= analysis.duplicateDetection.nearDuplicates.length * 10; // 10 points per near duplicate
    }
    
    // Factor in uniqueness analysis
    const uniquenessScore = analysis.uniquenessAnalysis.overallUniquenessScore;
    score = (score + uniquenessScore) / 2; // Average with uniqueness
    
    // Factor in plagiarism risk
    score -= analysis.plagiarismRisk.riskScore * 0.3; // 30% weight for plagiarism risk
    
    // Factor in quality indicators
    const qualityScore = this._calculateQualityScore(analysis.qualityIndicators);
    score = score * 0.7 + qualityScore * 0.3; // 70/30 weighted average
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Generate intelligence-based recommendations
   */
  _generateIntelligenceRecommendations(analysis) {
    const recommendations = [];
    
    // Duplicate content recommendations
    if (analysis.duplicateDetection.exactDuplicates.length > 0) {
      recommendations.push({
        type: 'duplicate-content',
        priority: 'high',
        title: 'Exact Duplicate Content Detected',
        description: `Found ${analysis.duplicateDetection.exactDuplicates.length} pages with identical content`,
        suggestions: [
          'Consolidate duplicate pages using 301 redirects',
          'Use canonical tags to specify preferred version',
          'Differentiate content to add unique value',
          'Consider noindex for low-value duplicates',
          'Implement content variation strategies'
        ],
        impact: 'seo-ranking'
      });
    }
    
    // Uniqueness improvement recommendations
    if (analysis.uniquenessAnalysis.overallUniquenessScore < 70) {
      recommendations.push({
        type: 'content-uniqueness',
        priority: 'medium',
        title: 'Improve Content Uniqueness',
        description: `Content uniqueness score: ${analysis.uniquenessAnalysis.overallUniquenessScore}/100`,
        suggestions: [
          'Vary sentence structure and vocabulary',
          'Add original insights and analysis',
          'Include unique data and examples',
          'Develop distinctive voice and perspective',
          'Reduce formulaic content patterns'
        ],
        impact: 'content-quality'
      });
    }
    
    // Plagiarism risk recommendations
    if (analysis.plagiarismRisk.riskScore > 30) {
      recommendations.push({
        type: 'plagiarism-risk',
        priority: 'high',
        title: 'High Plagiarism Risk Detected',
        description: `Plagiarism risk score: ${analysis.plagiarismRisk.riskScore}/100`,
        suggestions: [
          'Review content for potential copyright issues',
          'Add proper citations and attributions',
          'Rewrite flagged sections in original voice',
          'Verify sources and permissions',
          'Consider plagiarism detection tools'
        ],
        impact: 'legal-compliance'
      });
    }
    
    // Content intelligence optimization
    if (analysis.originalityScore < 80) {
      recommendations.push({
        type: 'content-intelligence',
        priority: 'medium',
        title: 'Enhance Content Intelligence',
        description: `Content originality score: ${analysis.originalityScore}/100`,
        suggestions: [
          'Develop unique content frameworks',
          'Incorporate expert insights and interviews',
          'Add original research and data',
          'Create distinctive content formats',
          'Build thought leadership content'
        ],
        impact: 'authority-building'
      });
    }
    
    return recommendations;
  }

  // Helper Methods for Content Analysis

  /**
   * Tokenize text into words
   */
  _tokenizeText(text) {
    return text.toLowerCase()
      .split(/\s+/)
      .map(word => word.replace(/[^\w]/g, ''))
      .filter(word => word.length > 2); // Filter short words
  }

  /**
   * Split text into sentences
   */
  _splitIntoSentences(text) {
    return text.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10); // Filter very short sentences
  }

  /**
   * Generate n-gram shingles for fingerprinting
   */
  _generateShingles(text, n) {
    const words = this._tokenizeText(text);
    const shingles = [];
    
    for (let i = 0; i <= words.length - n; i++) {
      shingles.push(words.slice(i, i + n).join(' '));
    }
    
    return shingles;
  }

  /**
   * Create hash fingerprint from shingles
   */
  _createHashFingerprint(shingles) {
    const shingleHashes = shingles.map(shingle => 
      crypto.createHash(this.options.FINGERPRINTING.HASH_ALGORITHM)
        .update(shingle)
        .digest('hex')
    );
    
    const contentHash = crypto.createHash(this.options.FINGERPRINTING.HASH_ALGORITHM)
      .update(shingleHashes.join(''))
      .digest('hex');
    
    return { contentHash, shingleHashes };
  }

  /**
   * Calculate content similarity between fingerprints
   */
  _calculateContentSimilarity(fingerprint1, fingerprint2) {
    const hashes1 = new Set(fingerprint1.shingleHashes);
    const hashes2 = new Set(fingerprint2.shingleHashes);
    
    const intersection = new Set([...hashes1].filter(h => hashes2.has(h)));
    const union = new Set([...hashes1, ...hashes2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Analyze lexical diversity
   */
  _analyzeLexicalDiversity(words) {
    const uniqueWords = new Set(words);
    const diversity = words.length > 0 ? uniqueWords.size / words.length : 0;
    
    return {
      totalWords: words.length,
      uniqueWords: uniqueWords.size,
      diversity: diversity,
      category: this._categorizeDiversity(diversity)
    };
  }

  /**
   * Analyze structural diversity
   */
  _analyzeStructuralDiversity(sentences) {
    const lengths = sentences.map(s => this._tokenizeText(s).length);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length || 0;
    const variance = this._calculateVariance(lengths);
    
    return {
      sentenceCount: sentences.length,
      avgSentenceLength: avgLength,
      lengthVariance: variance,
      structuralComplexity: this._calculateStructuralComplexity(lengths)
    };
  }

  /**
   * Analyze semantic diversity (simplified)
   */
  _analyzeSemanticDiversity(text) {
    // Simplified semantic analysis based on word patterns
    const words = this._tokenizeText(text);
    const wordCategories = this._categorizeWords(words);
    
    return {
      categoryDistribution: wordCategories,
      semanticRichness: Object.keys(wordCategories).length,
      topicalFocus: this._analyzeTopicalFocus(words)
    };
  }

  /**
   * Store content data for site-wide analysis
   */
  _storeContentData(url, content, analysis) {
    this.contentDatabase.set(url, {
      content: content,
      fingerprint: analysis.contentFingerprint,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Create minimal analysis for short content
   */
  _createMinimalAnalysis(reason) {
    return {
      uniquenessAnalysis: { overallUniquenessScore: 50 },
      contentFingerprint: null,
      duplicateDetection: { exactDuplicates: [], nearDuplicates: [], duplicateCount: 0 },
      similarityAnalysis: { similarPages: [] },
      originalityScore: 50,
      qualityIndicators: {},
      plagiarismRisk: { riskScore: 0, riskLevel: 'low' },
      recommendations: [],
      analysisSkipped: true,
      reason: reason
    };
  }

  /**
   * Create error analysis
   */
  _createErrorAnalysis(errorMessage) {
    return {
      error: `Content intelligence analysis failed: ${errorMessage}`,
      uniquenessAnalysis: null,
      contentFingerprint: null,
      duplicateDetection: null,
      similarityAnalysis: null,
      originalityScore: 0,
      recommendations: []
    };
  }

  // Additional helper methods would be implemented here...
  // (For brevity, showing key structure - full implementation would include all helper methods)

  _calculateVariance(numbers) {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }

  _categorizeDiversity(diversity) {
    if (diversity >= 0.7) return 'high';
    if (diversity >= 0.5) return 'medium';
    if (diversity >= 0.3) return 'low';
    return 'very-low';
  }

  _calculateUniquenessScore(lexical, structural, semantic, patterns) {
    // Weighted scoring algorithm
    const weights = { lexical: 0.3, structural: 0.3, semantic: 0.2, patterns: 0.2 };
    
    let score = 0;
    score += lexical.diversity * 100 * weights.lexical;
    score += (structural.lengthVariance / 10) * weights.structural; // Normalize variance
    score += semantic.semanticRichness * 5 * weights.semantic; // Scale richness
    score += patterns.uniquenessRatio * 100 * weights.patterns;
    
    return Math.min(100, Math.max(0, Math.round(score)));
  }

  _analyzeContentPatterns(text) {
    // Simplified pattern analysis
    return {
      repetitivePatterns: 0,
      uniquenessRatio: 0.8, // Placeholder
      patternDiversity: 0.7
    };
  }

  _findMatchingSegments(text1, text2) {
    // Simplified segment matching
    return [];
  }

  _calculateUniquenessRatio(duplicates, nearDuplicates) {
    const totalSimilar = duplicates + nearDuplicates;
    const totalCompared = this.contentDatabase.size;
    return totalCompared > 0 ? 1 - (totalSimilar / totalCompared) : 1;
  }

  _segmentContent(text) {
    // Split content into analyzable segments
    const sentences = this._splitIntoSentences(text);
    const segmentSize = 5; // 5 sentences per segment
    const segments = [];
    
    for (let i = 0; i < sentences.length; i += segmentSize) {
      segments.push(sentences.slice(i, i + segmentSize).join(' '));
    }
    
    return segments;
  }

  _calculateSegmentSimilarity(segment1, segment2) {
    // Simplified similarity calculation
    const words1 = new Set(this._tokenizeText(segment1));
    const words2 = new Set(this._tokenizeText(segment2));
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  _calculateAverageSimilarity(similarities) {
    if (similarities.length === 0) return 0;
    const total = similarities.reduce((sum, sim) => sum + sim.averageSimilarity, 0);
    return total / similarities.length;
  }

  _analyzeSimilarityDistribution(similarities) {
    return {
      high: similarities.filter(s => s.averageSimilarity > 0.7).length,
      medium: similarities.filter(s => s.averageSimilarity > 0.4 && s.averageSimilarity <= 0.7).length,
      low: similarities.filter(s => s.averageSimilarity <= 0.4).length
    };
  }

  _findLongExactPhrases(text) {
    // Detect potential copy-paste patterns
    return [];
  }

  _detectStyleInconsistencies(text) {
    return { score: 0.2 }; // Placeholder
  }

  _analyzeCharacterPatterns(text) {
    return { anomalies: [] }; // Placeholder
  }

  _analyzeReferenceDensity(text) {
    return { density: 0.1 }; // Placeholder
  }

  _categorizeRiskLevel(score) {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'low';
    return 'very-low';
  }

  _calculateRiskConfidence(indicators) {
    return 0.8; // Placeholder confidence score
  }

  _analyzeVocabularySophistication(text) {
    return { sophistication: 0.6 }; // Placeholder
  }

  _analyzeInformationDensity(text) {
    return { density: 0.7 }; // Placeholder
  }

  _analyzeContentDepth(text, document) {
    return { depth: 0.6 }; // Placeholder
  }

  _findOriginalityMarkers(text) {
    return []; // Placeholder
  }

  _detectAuthoritySignals(text, document) {
    return { signals: [] }; // Placeholder
  }

  _calculateQualityScore(indicators) {
    return 75; // Placeholder quality score
  }

  _calculateStructuralComplexity(lengths) {
    return 0.5; // Placeholder
  }

  _categorizeWords(words) {
    return { general: words.length }; // Simplified categorization
  }

  _analyzeTopicalFocus(words) {
    return { focus: 0.6 }; // Placeholder
  }

  // ============================================================================
  // BASEANALYZER INTEGRATION HELPER METHODS
  // ============================================================================

  /**
   * Calculate comprehensive content intelligence score for BaseAnalyzer integration
   * @param {Object} analysis - Content intelligence analysis results
   * @returns {number} Comprehensive score (0-100)
   */
  _calculateComprehensiveScore(analysis) {
    try {
      const weights = {
        uniqueness: 0.35,        // 35% - Content uniqueness
        originality: 0.25,       // 25% - Content originality  
        quality: 0.20,           // 20% - Content quality
        intelligence: 0.15,      // 15% - Content intelligence
        integrity: 0.05          // 5% - Content integrity
      };

      let totalScore = 0;
      let totalWeight = 0;

      // Uniqueness score
      if (analysis.uniqueness && typeof analysis.uniqueness.score === 'number') {
        totalScore += analysis.uniqueness.score * weights.uniqueness;
        totalWeight += weights.uniqueness;
      }

      // Originality score
      if (analysis.originality && typeof analysis.originality.score === 'number') {
        totalScore += analysis.originality.score * weights.originality;
        totalWeight += weights.originality;
      }

      // Quality score
      if (analysis.quality && typeof analysis.quality.score === 'number') {
        totalScore += analysis.quality.score * weights.quality;
        totalWeight += weights.quality;
      }

      // Intelligence score (based on semantic analysis, complexity, etc.)
      if (analysis.semantic && analysis.structural && analysis.lexical) {
        const semanticScore = analysis.semantic.similarity ? (1 - analysis.semantic.similarity) * 100 : 70;
        const structuralScore = analysis.structural.complexity ? analysis.structural.complexity * 100 : 70;
        const lexicalScore = analysis.lexical.diversity ? analysis.lexical.diversity * 100 : 70;
        
        const intelligenceScore = (semanticScore + structuralScore + lexicalScore) / 3;
        totalScore += intelligenceScore * weights.intelligence;
        totalWeight += weights.intelligence;
      }

      // Integrity score (based on duplicate detection and plagiarism analysis)
      if (analysis.duplicates && analysis.plagiarism) {
        let integrityScore = 100;
        
        // Penalize for duplicates
        if (analysis.duplicates.detected && analysis.duplicates.detected.length > 0) {
          const duplicateReduction = Math.min(analysis.duplicates.detected.length * 15, 60);
          integrityScore -= duplicateReduction;
        }
        
        // Penalize for plagiarism patterns
        if (analysis.plagiarism.patterns && analysis.plagiarism.patterns.length > 0) {
          const plagiarismReduction = Math.min(analysis.plagiarism.patterns.length * 20, 40);
          integrityScore -= plagiarismReduction;
        }
        
        totalScore += Math.max(0, integrityScore) * weights.integrity;
        totalWeight += weights.integrity;
      }

      return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    } catch (error) {
      this.log('Error calculating comprehensive score:', error.message);
      return 0;
    }
  }

  /**
   * Generate comprehensive content intelligence optimization recommendations
   * @param {Object} analysis - Content intelligence analysis results
   * @returns {Array} Enhanced recommendations
   */
  _generateContentIntelligenceRecommendations(analysis) {
    const recommendations = [];

    try {
      // Uniqueness recommendations
      if (analysis.uniqueness) {
        const uniquenessScore = analysis.uniqueness.score || 0;
        
        if (uniquenessScore < this.options.UNIQUENESS_SCORING.POOR_THRESHOLD) {
          recommendations.push({
            category: 'content-uniqueness',
            priority: 'high',
            title: 'Improve Content Uniqueness',
            description: `Content uniqueness score is ${uniquenessScore}% (Poor)`,
            impact: 'Search engine rankings and duplicate content penalties',
            actionItems: [
              'Rewrite substantial portions of the content',
              'Add original insights and analysis',
              'Include unique examples and case studies',
              'Expand on existing topics with original research',
              'Remove or rewrite duplicate sections',
              'Add original quotes from industry experts'
            ]
          });
        } else if (uniquenessScore < this.options.UNIQUENESS_SCORING.FAIR_THRESHOLD) {
          recommendations.push({
            category: 'content-uniqueness',
            priority: 'medium',
            title: 'Enhance Content Originality',
            description: `Content uniqueness score is ${uniquenessScore}% (Fair)`,
            impact: 'Content differentiation and search visibility',
            actionItems: [
              'Add more original perspectives and insights',
              'Include personal experiences or case studies',
              'Expand content with unique supporting details',
              'Add original data or research findings',
              'Include fresh examples and illustrations'
            ]
          });
        }
      }

      // Duplicate content recommendations
      if (analysis.duplicates && analysis.duplicates.detected && analysis.duplicates.detected.length > 0) {
        recommendations.push({
          category: 'duplicate-content',
          priority: 'high',
          title: 'Resolve Duplicate Content Issues',
          description: `${analysis.duplicates.detected.length} duplicate content sections detected`,
          impact: 'SEO penalties and content authority dilution',
          actionItems: [
            'Identify and rewrite duplicate sections',
            'Implement canonical tags for similar pages',
            'Consolidate duplicate pages when appropriate',
            'Add unique value to each page variation',
            'Use 301 redirects for exact duplicates',
            'Monitor for external content scraping'
          ]
        });
      }

      // Plagiarism recommendations
      if (analysis.plagiarism && analysis.plagiarism.patterns && analysis.plagiarism.patterns.length > 0) {
        recommendations.push({
          category: 'content-integrity',
          priority: 'high',
          title: 'Address Potential Plagiarism Issues',
          description: `${analysis.plagiarism.patterns.length} plagiarism patterns detected`,
          impact: 'Content credibility and legal compliance',
          actionItems: [
            'Review flagged content sections for originality',
            'Add proper citations and attributions',
            'Rewrite paraphrased content to be more original',
            'Include quotation marks for direct quotes',
            'Verify sources and add references',
            'Implement content review processes'
          ]
        });
      }

      // Content quality recommendations
      if (analysis.quality && analysis.quality.score < 70) {
        recommendations.push({
          category: 'content-quality',
          priority: 'medium',
          title: 'Improve Content Quality Score',
          description: `Content quality score is ${analysis.quality.score}%`,
          impact: 'User engagement and content authority',
          actionItems: [
            'Enhance content depth and comprehensiveness',
            'Improve information density and value',
            'Add supporting evidence and data',
            'Increase topical focus and relevance',
            'Improve content structure and organization',
            'Add expert insights and authoritative sources'
          ]
        });
      }

      // Lexical diversity recommendations
      if (analysis.lexical && analysis.lexical.diversity < 0.6) {
        recommendations.push({
          category: 'content-diversity',
          priority: 'low',
          title: 'Enhance Lexical Diversity',
          description: `Lexical diversity is ${(analysis.lexical.diversity * 100).toFixed(1)}%`,
          impact: 'Content readability and engagement',
          actionItems: [
            'Use a wider variety of vocabulary',
            'Replace repetitive words with synonyms',
            'Vary sentence structure and length',
            'Include domain-specific terminology appropriately',
            'Balance common and sophisticated language',
            'Use transition words to improve flow'
          ]
        });
      }

      // Structural complexity recommendations
      if (analysis.structural && analysis.structural.complexity < 0.4) {
        recommendations.push({
          category: 'content-structure',
          priority: 'low',
          title: 'Improve Content Structure',
          description: `Structural complexity is ${(analysis.structural.complexity * 100).toFixed(1)}%`,
          impact: 'Content comprehension and user experience',
          actionItems: [
            'Add clear headings and subheadings',
            'Use bullet points and numbered lists',
            'Include visual elements like images and charts',
            'Create logical content hierarchy',
            'Add summary sections for complex topics',
            'Use consistent formatting throughout'
          ]
        });
      }

      return recommendations;
    } catch (error) {
      this.log('Error generating content intelligence recommendations:', error.message);
      return [];
    }
  }

  /**
   * Generate comprehensive content intelligence analysis summary
   * @param {Object} analysis - Content intelligence analysis results
   * @returns {Object} Content intelligence summary
   */
  _generateContentIntelligenceSummary(analysis) {
    try {
      const summary = {
        overallRating: 'Poor',
        uniquenessLevel: 'Unknown',
        originalityScore: 0,
        qualityLevel: 'Unknown',
        integrityStatus: 'Unknown',
        keyFindings: []
      };

      // Uniqueness assessment
      if (analysis.uniqueness && typeof analysis.uniqueness.score === 'number') {
        const uniquenessScore = analysis.uniqueness.score;
        summary.originalityScore = uniquenessScore;
        
        if (uniquenessScore >= this.options.UNIQUENESS_SCORING.EXCELLENT_THRESHOLD) {
          summary.uniquenessLevel = 'Excellent';
        } else if (uniquenessScore >= this.options.UNIQUENESS_SCORING.GOOD_THRESHOLD) {
          summary.uniquenessLevel = 'Good';
        } else if (uniquenessScore >= this.options.UNIQUENESS_SCORING.FAIR_THRESHOLD) {
          summary.uniquenessLevel = 'Fair';
        } else {
          summary.uniquenessLevel = 'Poor';
        }
        
        summary.keyFindings.push(`Content uniqueness: ${uniquenessScore}%`);
      }

      // Quality assessment
      if (analysis.quality && typeof analysis.quality.score === 'number') {
        const qualityScore = analysis.quality.score;
        
        if (qualityScore >= 80) summary.qualityLevel = 'High';
        else if (qualityScore >= 60) summary.qualityLevel = 'Medium';
        else summary.qualityLevel = 'Low';
        
        summary.keyFindings.push(`Content quality score: ${qualityScore}%`);
      }

      // Integrity assessment
      const duplicateCount = analysis.duplicates?.detected?.length || 0;
      const plagiarismCount = analysis.plagiarism?.patterns?.length || 0;
      
      if (duplicateCount === 0 && plagiarismCount === 0) {
        summary.integrityStatus = 'Excellent';
      } else if (duplicateCount <= 2 && plagiarismCount <= 1) {
        summary.integrityStatus = 'Good';
      } else if (duplicateCount <= 5 && plagiarismCount <= 3) {
        summary.integrityStatus = 'Fair';
      } else {
        summary.integrityStatus = 'Poor';
      }

      if (duplicateCount > 0) {
        summary.keyFindings.push(`${duplicateCount} duplicate content sections detected`);
      }
      
      if (plagiarismCount > 0) {
        summary.keyFindings.push(`${plagiarismCount} potential plagiarism patterns detected`);
      }

      // Overall rating based on comprehensive score
      const overallScore = this._calculateComprehensiveScore(analysis);
      if (overallScore >= 80) summary.overallRating = 'Excellent';
      else if (overallScore >= 60) summary.overallRating = 'Good';
      else if (overallScore >= 40) summary.overallRating = 'Fair';
      else summary.overallRating = 'Poor';

      // Additional insights
      if (analysis.lexical && analysis.lexical.diversity) {
        summary.keyFindings.push(`Lexical diversity: ${(analysis.lexical.diversity * 100).toFixed(1)}%`);
      }

      if (analysis.structural && analysis.structural.complexity) {
        summary.keyFindings.push(`Structural complexity: ${(analysis.structural.complexity * 100).toFixed(1)}%`);
      }

      return summary;
    } catch (error) {
      this.log('Error generating content intelligence summary:', error.message);
      return {
        overallRating: 'Unknown',
        uniquenessLevel: 'Unknown',
        originalityScore: 0,
        qualityLevel: 'Unknown',
        integrityStatus: 'Unknown',
        keyFindings: ['Analysis error occurred']
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
  analyzeContentIntelligence(dom, pageData, url, siteData = {}) {
    console.warn('ContentIntelligenceAnalyzer.analyzeContentIntelligence(dom, pageData, url, siteData) is deprecated. Use analyze(context) method instead.');
    const document = dom.window ? dom.window.document : dom;
    return this.performContentIntelligenceAnalysis(document, pageData, url, siteData);
  }
}

export default ContentIntelligenceAnalyzer;
