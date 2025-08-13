/**
 * ============================================================================
 * CONTENT ELEMENT DETECTOR - GPT-5 STYLE COMPONENT
 * ============================================================================
 * 
 * Advanced content element detection and analysis for SEO optimization
 * Part of the Combined Approach SEO Analyzer (8th Implementation)
 * 
 * Features:
 * - Comprehensive content element detection
 * - Text quality and readability analysis
 * - Image and media optimization
 * - Internal/external content structure
 * - Content-to-code ratio analysis
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration Combined Approach Pattern - Detector Component
 */

export class ContentElementDetector {
  constructor(config = {}) {
    this.config = {
      includeImages: config.includeImages !== false,
      includeMedia: config.includeMedia !== false,
      includeReadability: config.includeReadability !== false,
      includeContentRatio: config.includeContentRatio !== false,
      analysisDepth: config.analysisDepth || 'comprehensive',
      minContentLength: config.minContentLength || 300,
      optimalContentLength: config.optimalContentLength || 1000,
      ...config
    };

    this.version = '1.0.0';
    this.detectorType = 'content_element';
    
    // Content validation thresholds
    this.thresholds = {
      minTextLength: 300,
      optimalTextLength: 1000,
      maxTextLength: 3000,
      minWordsPerParagraph: 20,
      maxWordsPerParagraph: 150,
      minSentencesPerParagraph: 2,
      maxSentencesPerParagraph: 8,
      minWordLength: 4,
      maxWordLength: 15
    };

    // Content quality indicators
    this.qualityIndicators = {
      keywordDensity: { min: 0.005, max: 0.03, optimal: 0.015 },
      sentenceLength: { min: 8, max: 25, optimal: 16 },
      paragraphLength: { min: 50, max: 200, optimal: 120 },
      readabilityScore: { min: 60, optimal: 80 }
    };

    this.cache = new Map();
  }

  /**
   * Get detector metadata
   * @returns {Object} Detector metadata
   */
  getMetadata() {
    return {
      name: 'ContentElementDetector',
      version: this.version,
      type: this.detectorType,
      description: 'GPT-5 style content element detection and analysis for SEO optimization',
      capabilities: [
        'comprehensive_content_detection',
        'text_quality_analysis',
        'readability_assessment',
        'image_optimization_analysis',
        'media_element_detection',
        'content_structure_analysis',
        'content_to_code_ratio_calculation'
      ],
      thresholds: this.thresholds,
      qualityIndicators: this.qualityIndicators,
      contentSupport: {
        images: this.config.includeImages,
        media: this.config.includeMedia,
        readability: this.config.includeReadability
      },
      performance: 'High',
      accuracy: 'Comprehensive'
    };
  }

  /**
   * Analyze document content elements
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Content element analysis results
   */
  async analyze(context) {
    try {
      const { document, url = '', pageData = {} } = context;
      
      if (!document) {
        throw new Error('Document is required for content element analysis');
      }

      // Check cache
      const cacheKey = this._generateCacheKey(document);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const startTime = Date.now();

      // Phase 1: Detect text content
      const textContent = this._detectTextContent(document);

      // Phase 2: Analyze images and media
      const mediaContent = this._detectMediaContent(document);

      // Phase 3: Analyze content structure
      const structureAnalysis = this._analyzeContentStructure(document, textContent);

      // Phase 4: Quality and readability analysis
      const qualityAnalysis = this._analyzeContentQuality(textContent, document);

      // Phase 5: Content-to-code ratio
      const ratioAnalysis = this._analyzeContentRatio(document, textContent);

      // Phase 6: SEO content optimization
      const seoAnalysis = this._analyzeSEOContent(textContent, mediaContent, structureAnalysis);

      // Phase 7: Validation and scoring
      const validation = this._validateContent(textContent, mediaContent, qualityAnalysis);

      // Compile results
      const results = {
        success: true,
        detectorType: this.detectorType,
        
        // Core content data
        text: textContent,
        media: mediaContent,
        structure: structureAnalysis,
        quality: qualityAnalysis,
        ratio: ratioAnalysis,
        seo: seoAnalysis,
        validation,
        
        // Summary metrics
        summary: {
          totalTextLength: textContent.totalLength,
          totalWords: textContent.totalWords,
          totalParagraphs: textContent.paragraphCount,
          totalImages: mediaContent.images.length,
          totalMedia: mediaContent.all.length,
          contentRatio: ratioAnalysis.ratio,
          qualityScore: qualityAnalysis.overallScore,
          seoScore: seoAnalysis.score,
          overallScore: validation.overallScore,
          optimizationLevel: this._getOptimizationLevel(validation.overallScore)
        },

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
        error: `Content element detection failed: ${error.message}`,
        detectorType: this.detectorType
      };
    }
  }

  /**
   * Detect and analyze text content
   * @param {Document} document - DOM document
   * @returns {Object} Text content analysis
   */
  _detectTextContent(document) {
    // Get main content areas (excluding navigation, header, footer, sidebar)
    const mainContent = this._extractMainContent(document);
    
    // Extract text from paragraphs
    const paragraphs = Array.from(document.querySelectorAll('p')).map(p => ({
      element: p,
      text: p.textContent.trim(),
      wordCount: this._countWords(p.textContent),
      sentenceCount: this._countSentences(p.textContent),
      length: p.textContent.trim().length
    })).filter(p => p.length > 0);

    // Extract all text content
    const allText = mainContent.textContent || '';
    const cleanText = this._cleanText(allText);
    
    // Word analysis
    const words = this._extractWords(cleanText);
    const sentences = this._extractSentences(cleanText);
    
    // Content sections
    const sections = this._identifyContentSections(document);
    
    // Text statistics
    const statistics = {
      totalLength: cleanText.length,
      totalWords: words.length,
      totalSentences: sentences.length,
      averageWordsPerSentence: sentences.length > 0 ? words.length / sentences.length : 0,
      averageSentenceLength: sentences.length > 0 ? 
        sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length : 0,
      longestSentence: sentences.length > 0 ? Math.max(...sentences.map(s => s.length)) : 0,
      shortestSentence: sentences.length > 0 ? Math.min(...sentences.map(s => s.length)) : 0
    };

    return {
      mainContent: {
        text: cleanText,
        element: mainContent,
        wordCount: words.length,
        length: cleanText.length
      },
      paragraphs,
      sections,
      words,
      sentences,
      statistics,
      
      // Content metrics
      paragraphCount: paragraphs.length,
      totalLength: cleanText.length,
      totalWords: words.length,
      totalSentences: sentences.length,
      
      // Quality indicators
      density: this._calculateKeywordDensity(words),
      uniqueWords: new Set(words.map(w => w.toLowerCase())).size,
      averageWordLength: words.length > 0 ? 
        words.reduce((sum, w) => sum + w.length, 0) / words.length : 0
    };
  }

  /**
   * Detect and analyze media content (images, videos, etc.)
   * @param {Document} document - DOM document
   * @returns {Object} Media content analysis
   */
  _detectMediaContent(document) {
    // Images
    const images = Array.from(document.querySelectorAll('img')).map(img => ({
      element: img,
      src: img.src || img.getAttribute('src') || '',
      alt: img.alt || '',
      title: img.title || '',
      width: img.width || img.getAttribute('width'),
      height: img.height || img.getAttribute('height'),
      loading: img.loading || img.getAttribute('loading'),
      srcset: img.srcset || img.getAttribute('srcset'),
      sizes: img.sizes || img.getAttribute('sizes'),
      isDecorative: !img.alt && !img.title,
      hasAltText: !!img.alt,
      altTextLength: (img.alt || '').length,
      isLazy: (img.loading === 'lazy') || img.classList.contains('lazy')
    }));

    // Videos
    const videos = Array.from(document.querySelectorAll('video')).map(video => ({
      element: video,
      src: video.src || video.getAttribute('src'),
      poster: video.poster || video.getAttribute('poster'),
      controls: video.hasAttribute('controls'),
      autoplay: video.hasAttribute('autoplay'),
      loop: video.hasAttribute('loop'),
      muted: video.hasAttribute('muted'),
      width: video.width || video.getAttribute('width'),
      height: video.height || video.getAttribute('height')
    }));

    // Audio
    const audio = Array.from(document.querySelectorAll('audio')).map(aud => ({
      element: aud,
      src: aud.src || aud.getAttribute('src'),
      controls: aud.hasAttribute('controls'),
      autoplay: aud.hasAttribute('autoplay'),
      loop: aud.hasAttribute('loop'),
      muted: aud.hasAttribute('muted')
    }));

    // Iframes (embedded content)
    const iframes = Array.from(document.querySelectorAll('iframe')).map(iframe => ({
      element: iframe,
      src: iframe.src || iframe.getAttribute('src'),
      title: iframe.title || iframe.getAttribute('title'),
      width: iframe.width || iframe.getAttribute('width'),
      height: iframe.height || iframe.getAttribute('height'),
      loading: iframe.loading || iframe.getAttribute('loading'),
      isYouTube: (iframe.src || '').includes('youtube.com'),
      isVimeo: (iframe.src || '').includes('vimeo.com')
    }));

    // SVG graphics
    const svgs = Array.from(document.querySelectorAll('svg')).map(svg => ({
      element: svg,
      width: svg.width || svg.getAttribute('width'),
      height: svg.height || svg.getAttribute('height'),
      viewBox: svg.getAttribute('viewBox'),
      title: svg.querySelector('title')?.textContent || '',
      description: svg.querySelector('desc')?.textContent || ''
    }));

    const allMedia = [...images, ...videos, ...audio, ...iframes, ...svgs];

    return {
      all: allMedia,
      images,
      videos,
      audio,
      iframes,
      svgs,
      
      // Media statistics
      counts: {
        total: allMedia.length,
        images: images.length,
        videos: videos.length,
        audio: audio.length,
        iframes: iframes.length,
        svgs: svgs.length
      },
      
      // SEO-relevant metrics
      optimization: {
        imagesWithAlt: images.filter(img => img.hasAltText).length,
        imagesWithoutAlt: images.filter(img => !img.hasAltText).length,
        lazyLoadedImages: images.filter(img => img.isLazy).length,
        decorativeImages: images.filter(img => img.isDecorative).length,
        videosWithPoster: videos.filter(vid => vid.poster).length,
        iframesWithTitle: iframes.filter(iframe => iframe.title).length
      },
      
      // Quality metrics
      quality: {
        averageAltTextLength: images.length > 0 ? 
          images.reduce((sum, img) => sum + img.altTextLength, 0) / images.length : 0,
        altTextCompliance: images.length > 0 ? 
          (images.filter(img => img.hasAltText).length / images.length) * 100 : 100,
        mediaAccessibility: this._calculateMediaAccessibility(images, videos, iframes)
      }
    };
  }

  /**
   * Analyze content structure and organization
   * @param {Document} document - DOM document
   * @param {Object} textContent - Text content analysis
   * @returns {Object} Content structure analysis
   */
  _analyzeContentStructure(document, textContent) {
    // Article/main content structure
    const mainElements = Array.from(document.querySelectorAll('main, article, [role="main"]'));
    const sectionElements = Array.from(document.querySelectorAll('section'));
    const asideElements = Array.from(document.querySelectorAll('aside'));
    const navElements = Array.from(document.querySelectorAll('nav'));

    // Lists and structured content
    const lists = {
      ordered: Array.from(document.querySelectorAll('ol')),
      unordered: Array.from(document.querySelectorAll('ul')),
      definition: Array.from(document.querySelectorAll('dl'))
    };

    // Tables
    const tables = Array.from(document.querySelectorAll('table')).map(table => ({
      element: table,
      hasCaption: !!table.querySelector('caption'),
      hasHeaders: !!table.querySelector('th'),
      rowCount: table.querySelectorAll('tr').length,
      columnCount: table.querySelector('tr')?.querySelectorAll('td, th').length || 0
    }));

    // Content blocks and divisions
    const contentBlocks = this._identifyContentBlocks(document);
    
    // Reading flow analysis
    const readingFlow = this._analyzeReadingFlow(document, textContent);

    return {
      semantic: {
        hasMain: mainElements.length > 0,
        mainElements: mainElements.length,
        sections: sectionElements.length,
        asides: asideElements.length,
        navElements: navElements.length
      },
      
      lists: {
        total: lists.ordered.length + lists.unordered.length + lists.definition.length,
        ordered: lists.ordered.length,
        unordered: lists.unordered.length,
        definition: lists.definition.length,
        elements: lists
      },
      
      tables: {
        count: tables.length,
        withCaptions: tables.filter(t => t.hasCaption).length,
        withHeaders: tables.filter(t => t.hasHeaders).length,
        tables
      },
      
      contentBlocks,
      readingFlow,
      
      // Structure quality metrics
      organization: {
        hasSemanticStructure: mainElements.length > 0 && sectionElements.length > 0,
        contentHierarchy: this._analyzeContentHierarchy(document),
        visualStructure: this._analyzeVisualStructure(document),
        logicalFlow: readingFlow.score
      }
    };
  }

  /**
   * Analyze content quality and readability
   * @param {Object} textContent - Text content data
   * @param {Document} document - DOM document
   * @returns {Object} Content quality analysis
   */
  _analyzeContentQuality(textContent, document) {
    const { words, sentences, statistics } = textContent;
    
    // Readability analysis
    const readability = this._calculateReadabilityScores(textContent);
    
    // Content depth analysis
    const depth = this._analyzeContentDepth(textContent);
    
    // Language quality
    const language = this._analyzeLanguageQuality(words, sentences);
    
    // Content freshness and relevance
    const freshness = this._analyzeContentFreshness(document);
    
    // Keyword and topic analysis
    const topics = this._analyzeTopicCoverage(words);
    
    // Content completeness
    const completeness = this._analyzeContentCompleteness(textContent, document);

    // Calculate overall quality score
    const qualityFactors = [
      readability.score,
      depth.score,
      language.score,
      topics.score,
      completeness.score
    ];
    
    const overallScore = qualityFactors.reduce((sum, score) => sum + score, 0) / qualityFactors.length;

    return {
      overallScore,
      grade: this._calculateGrade(overallScore),
      
      readability,
      depth,
      language,
      freshness,
      topics,
      completeness,
      
      // Quality indicators
      indicators: {
        sufficientLength: statistics.totalLength >= this.thresholds.minTextLength,
        goodReadability: readability.score >= 70,
        properStructure: depth.score >= 75,
        diverseVocabulary: language.vocabularyDiversity >= 0.7,
        topicalRelevance: topics.score >= 70
      },
      
      // Recommendations
      recommendations: this._generateQualityRecommendations(
        readability, depth, language, topics, completeness
      )
    };
  }

  /**
   * Analyze content-to-code ratio
   * @param {Document} document - DOM document
   * @param {Object} textContent - Text content data
   * @returns {Object} Content ratio analysis
   */
  _analyzeContentRatio(document, textContent) {
    // Get document HTML size
    const htmlSize = document.documentElement.outerHTML.length;
    
    // Get text content size
    const textSize = textContent.totalLength;
    
    // Calculate ratio
    const ratio = textSize / htmlSize;
    const percentage = (ratio * 100).toFixed(2);
    
    // Analyze code elements
    const codeAnalysis = this._analyzeCodeElements(document);
    
    // Determine optimization level
    let optimizationLevel = 'poor';
    let score = 0;
    
    if (ratio >= 0.25) {
      optimizationLevel = 'excellent';
      score = 100;
    } else if (ratio >= 0.20) {
      optimizationLevel = 'good';
      score = 85;
    } else if (ratio >= 0.15) {
      optimizationLevel = 'fair';
      score = 70;
    } else if (ratio >= 0.10) {
      optimizationLevel = 'poor';
      score = 50;
    } else {
      optimizationLevel = 'critical';
      score = 25;
    }

    return {
      ratio,
      percentage: parseFloat(percentage),
      score,
      optimizationLevel,
      
      sizes: {
        html: htmlSize,
        text: textSize,
        code: htmlSize - textSize
      },
      
      codeAnalysis,
      
      recommendations: this._generateRatioRecommendations(ratio, codeAnalysis)
    };
  }

  /**
   * Analyze SEO-specific content aspects
   * @param {Object} textContent - Text content data
   * @param {Object} mediaContent - Media content data
   * @param {Object} structureAnalysis - Structure analysis
   * @returns {Object} SEO content analysis
   */
  _analyzeSEOContent(textContent, mediaContent, structureAnalysis) {
    let score = 100;
    const issues = [];
    const recommendations = [];
    const optimizations = [];

    // Content length analysis
    const lengthAnalysis = this._analyzeSEOContentLength(textContent);
    score = (score + lengthAnalysis.score) / 2;
    issues.push(...lengthAnalysis.issues);
    recommendations.push(...lengthAnalysis.recommendations);

    // Media optimization
    const mediaOptimization = this._analyzeSEOMediaOptimization(mediaContent);
    score = (score + mediaOptimization.score) / 2;
    issues.push(...mediaOptimization.issues);
    recommendations.push(...mediaOptimization.recommendations);

    // Content structure for SEO
    const structureOptimization = this._analyzeSEOStructure(structureAnalysis);
    score = (score + structureOptimization.score) / 2;
    issues.push(...structureOptimization.issues);
    recommendations.push(...structureOptimization.recommendations);

    // Identify optimization opportunities
    if (textContent.totalLength >= 1000) {
      optimizations.push('Content length supports comprehensive SEO');
    }
    if (mediaContent.optimization.altTextCompliance >= 90) {
      optimizations.push('Excellent image alt text compliance');
    }
    if (structureAnalysis.organization.hasSemanticStructure) {
      optimizations.push('Good semantic HTML structure');
    }

    return {
      score: Math.max(0, score),
      grade: this._calculateGrade(score),
      issues,
      recommendations,
      optimizations,
      
      length: lengthAnalysis,
      media: mediaOptimization,
      structure: structureOptimization,
      
      opportunities: this._identifyContentSEOOpportunities(textContent, mediaContent, structureAnalysis)
    };
  }

  /**
   * Validate overall content quality
   * @param {Object} textContent - Text content data
   * @param {Object} mediaContent - Media content data
   * @param {Object} qualityAnalysis - Quality analysis
   * @returns {Object} Content validation results
   */
  _validateContent(textContent, mediaContent, qualityAnalysis) {
    const scores = [
      qualityAnalysis.overallScore,
      this._validateTextContent(textContent).score,
      this._validateMediaContent(mediaContent).score
    ];

    const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const grade = this._calculateGrade(overallScore);

    // Critical issues
    const criticalIssues = [];
    if (textContent.totalLength < this.thresholds.minTextLength) {
      criticalIssues.push('Insufficient content length');
    }
    if (qualityAnalysis.readability.score < 50) {
      criticalIssues.push('Poor readability');
    }
    if (mediaContent.optimization.altTextCompliance < 50) {
      criticalIssues.push('Poor image accessibility');
    }

    return {
      overallScore,
      grade,
      criticalIssues,
      passesValidation: criticalIssues.length === 0 && overallScore >= 70,
      improvementAreas: this._identifyContentImprovementAreas(qualityAnalysis),
      recommendations: this._generateContentValidationRecommendations(textContent, mediaContent, qualityAnalysis)
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  _extractMainContent(document) {
    // Try to find main content using semantic elements first
    let mainContent = document.querySelector('main') ||
                     document.querySelector('article') ||
                     document.querySelector('[role="main"]') ||
                     document.querySelector('#main') ||
                     document.querySelector('.main') ||
                     document.querySelector('#content') ||
                     document.querySelector('.content');
    
    // Fallback to body if no main content found
    if (!mainContent) {
      mainContent = document.body || document.documentElement;
    }
    
    return mainContent;
  }

  _cleanText(text) {
    return text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s.,!?;:'"()-]/g, '') // Remove special characters
      .trim();
  }

  _extractWords(text) {
    return text
      .toLowerCase()
      .match(/\b\w+\b/g) || [];
  }

  _extractSentences(text) {
    return text
      .split(/[.!?]+/)
      .filter(sentence => sentence.trim().length > 0)
      .map(sentence => sentence.trim());
  }

  _countWords(text) {
    return (text.match(/\b\w+\b/g) || []).length;
  }

  _countSentences(text) {
    return (text.split(/[.!?]+/).filter(s => s.trim().length > 0)).length;
  }

  _calculateKeywordDensity(words) {
    const wordCount = {};
    words.forEach(word => {
      const clean = word.toLowerCase();
      wordCount[clean] = (wordCount[clean] || 0) + 1;
    });
    
    const totalWords = words.length;
    const densities = {};
    
    Object.keys(wordCount).forEach(word => {
      densities[word] = wordCount[word] / totalWords;
    });
    
    return densities;
  }

  _identifyContentSections(document) {
    const sections = [];
    
    // Look for content sections
    const sectionElements = document.querySelectorAll('section, article, div.section, div.content-section');
    
    sectionElements.forEach((section, index) => {
      const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
      const text = section.textContent.trim();
      
      sections.push({
        element: section,
        index,
        heading: heading ? heading.textContent.trim() : null,
        wordCount: this._countWords(text),
        length: text.length
      });
    });
    
    return sections;
  }

  _calculateMediaAccessibility(images, videos, iframes) {
    let score = 100;
    let totalElements = images.length + videos.length + iframes.length;
    
    if (totalElements === 0) return 100; // No media to check
    
    // Check image alt text
    const imagesWithoutAlt = images.filter(img => !img.hasAltText);
    if (imagesWithoutAlt.length > 0) {
      score -= (imagesWithoutAlt.length / images.length) * 30;
    }
    
    // Check iframe titles
    const iframesWithoutTitle = iframes.filter(iframe => !iframe.title);
    if (iframesWithoutTitle.length > 0) {
      score -= (iframesWithoutTitle.length / iframes.length) * 20;
    }
    
    return Math.max(0, score);
  }

  _identifyContentBlocks(document) {
    const blocks = [];
    
    // Common content block selectors
    const selectors = [
      '.content-block',
      '.text-block',
      '.article-content',
      '.post-content',
      '.entry-content',
      'main > div',
      'article > div',
      '.container > div'
    ];
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const text = element.textContent.trim();
        if (text.length > 50) { // Only consider substantial blocks
          blocks.push({
            element,
            selector,
            wordCount: this._countWords(text),
            length: text.length
          });
        }
      });
    });
    
    return blocks;
  }

  _analyzeReadingFlow(document, textContent) {
    // Analyze how content flows for reading comprehension
    let score = 100;
    const issues = [];
    
    // Check paragraph distribution
    if (textContent.paragraphs.length === 0) {
      score -= 30;
      issues.push('No paragraphs found');
    } else {
      const avgParagraphLength = textContent.totalLength / textContent.paragraphs.length;
      if (avgParagraphLength > 300) {
        score -= 15;
        issues.push('Paragraphs too long on average');
      }
    }
    
    // Check for reading aids (lists, headings, etc.)
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
    const lists = document.querySelectorAll('ul, ol').length;
    
    if (headings < 2 && textContent.totalLength > 500) {
      score -= 20;
      issues.push('Insufficient headings for content length');
    }
    
    return { score, issues };
  }

  _analyzeContentHierarchy(document) {
    // Analyze content organization hierarchy
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const sections = document.querySelectorAll('section, article').length;
    
    return {
      headingCount: headings.length,
      sectionCount: sections,
      hasHierarchy: headings.length > 0 && sections > 0,
      score: headings.length > 0 ? 85 : 40
    };
  }

  _analyzeVisualStructure(document) {
    // Analyze visual content structure
    const paragraphs = document.querySelectorAll('p').length;
    const lists = document.querySelectorAll('ul, ol').length;
    const images = document.querySelectorAll('img').length;
    
    return {
      paragraphs,
      lists,
      images,
      hasVisualBreaks: lists > 0 || images > 0,
      score: (paragraphs > 2 && (lists > 0 || images > 0)) ? 80 : 60
    };
  }

  _calculateReadabilityScores(textContent) {
    const { words, sentences, statistics } = textContent;
    
    // Simple readability calculation (Flesch-like)
    const avgWordsPerSentence = statistics.averageWordsPerSentence || 0;
    const avgSyllablesPerWord = 1.5; // Approximation
    
    let score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    score = Math.max(0, Math.min(100, score));
    
    let level = 'Very Difficult';
    if (score >= 90) level = 'Very Easy';
    else if (score >= 80) level = 'Easy';
    else if (score >= 70) level = 'Fairly Easy';
    else if (score >= 60) level = 'Standard';
    else if (score >= 50) level = 'Fairly Difficult';
    else if (score >= 30) level = 'Difficult';
    
    return {
      score,
      level,
      avgWordsPerSentence,
      recommendations: this._getReadabilityRecommendations(score, avgWordsPerSentence)
    };
  }

  _analyzeContentDepth(textContent) {
    const { totalLength, totalWords, sentences } = textContent;
    
    let score = 100;
    const issues = [];
    const recommendations = [];
    
    // Length analysis
    if (totalLength < 300) {
      score -= 40;
      issues.push('Content too short');
      recommendations.push('Expand content to at least 300 characters');
    } else if (totalLength > 3000) {
      score -= 10;
      issues.push('Content very long');
      recommendations.push('Consider breaking into sections');
    }
    
    // Word diversity
    const uniqueWords = new Set(textContent.words.map(w => w.toLowerCase())).size;
    const diversity = uniqueWords / totalWords;
    
    if (diversity < 0.3) {
      score -= 20;
      issues.push('Limited vocabulary diversity');
      recommendations.push('Use more varied vocabulary');
    }
    
    return { score, issues, recommendations, diversity };
  }

  _analyzeLanguageQuality(words, sentences) {
    let score = 100;
    const issues = [];
    
    // Average word length
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    if (avgWordLength < 4) {
      score -= 15;
      issues.push('Words too short on average');
    } else if (avgWordLength > 8) {
      score -= 10;
      issues.push('Words too complex on average');
    }
    
    // Vocabulary diversity
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const vocabularyDiversity = uniqueWords.size / words.length;
    
    if (vocabularyDiversity < 0.5) {
      score -= 20;
      issues.push('Low vocabulary diversity');
    }
    
    return {
      score,
      issues,
      avgWordLength,
      vocabularyDiversity,
      uniqueWordCount: uniqueWords.size
    };
  }

  _analyzeContentFreshness(document) {
    // Look for date indicators
    const dateElements = document.querySelectorAll('time, .date, .published, [datetime]');
    const hasDateInfo = dateElements.length > 0;
    
    return {
      hasDateInfo,
      dateElements: dateElements.length,
      score: hasDateInfo ? 85 : 70
    };
  }

  _analyzeTopicCoverage(words) {
    // Simple topic analysis based on word frequency and distribution
    const wordCount = {};
    words.forEach(word => {
      const clean = word.toLowerCase();
      if (clean.length > 3) { // Ignore very short words
        wordCount[clean] = (wordCount[clean] || 0) + 1;
      }
    });
    
    const topWords = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    const totalWords = Object.values(wordCount).reduce((sum, count) => sum + count, 0);
    const topicFocus = topWords.length > 0 ? topWords[0][1] / totalWords : 0;
    
    let score = 75; // Base score
    if (topicFocus > 0.1) score -= 20; // Too focused on one topic
    if (topicFocus < 0.02) score -= 15; // Too scattered
    
    return {
      score,
      topWords,
      topicFocus,
      wordVariety: Object.keys(wordCount).length
    };
  }

  _analyzeContentCompleteness(textContent, document) {
    let score = 100;
    const issues = [];
    
    // Check for essential content elements
    const hasIntroduction = textContent.totalLength > 0;
    const hasConclusion = document.querySelector('.conclusion, .summary') || 
                         textContent.sentences.length > 3;
    const hasStructure = document.querySelectorAll('h1, h2, h3').length > 1;
    
    if (!hasIntroduction) {
      score -= 30;
      issues.push('Missing introduction content');
    }
    
    if (!hasStructure) {
      score -= 20;
      issues.push('Poor content structure');
    }
    
    return { score, issues, hasIntroduction, hasConclusion, hasStructure };
  }

  _analyzeCodeElements(document) {
    const scripts = document.querySelectorAll('script').length;
    const styles = document.querySelectorAll('style').length;
    const links = document.querySelectorAll('link').length;
    
    return {
      scripts,
      styles,
      links,
      total: scripts + styles + links,
      hasExcessiveCode: scripts > 10 || styles > 5
    };
  }

  // ============================================================================
  // VALIDATION AND RECOMMENDATION METHODS
  // ============================================================================

  _generateQualityRecommendations(readability, depth, language, topics, completeness) {
    const recommendations = [];
    
    if (readability.score < 70) {
      recommendations.push('Improve readability by using shorter sentences');
    }
    
    if (depth.score < 70) {
      recommendations.push('Expand content depth and add more detail');
    }
    
    if (language.vocabularyDiversity < 0.5) {
      recommendations.push('Use more varied vocabulary');
    }
    
    if (topics.score < 70) {
      recommendations.push('Improve topic focus and organization');
    }
    
    return recommendations;
  }

  _generateRatioRecommendations(ratio, codeAnalysis) {
    const recommendations = [];
    
    if (ratio < 0.15) {
      recommendations.push('Increase content-to-code ratio by adding more text content');
    }
    
    if (codeAnalysis.hasExcessiveCode) {
      recommendations.push('Optimize and reduce unnecessary code');
    }
    
    return recommendations;
  }

  _getReadabilityRecommendations(score, avgWordsPerSentence) {
    const recommendations = [];
    
    if (score < 60) {
      recommendations.push('Simplify language and sentence structure');
    }
    
    if (avgWordsPerSentence > 20) {
      recommendations.push('Use shorter sentences for better readability');
    }
    
    return recommendations;
  }

  _analyzeSEOContentLength(textContent) {
    let score = 100;
    const issues = [];
    const recommendations = [];
    
    if (textContent.totalLength < 300) {
      score = 30;
      issues.push('Content too short for SEO');
      recommendations.push('Expand content to at least 300 words');
    } else if (textContent.totalLength < 600) {
      score = 70;
      recommendations.push('Consider expanding content for better SEO');
    }
    
    return { score, issues, recommendations };
  }

  _analyzeSEOMediaOptimization(mediaContent) {
    let score = 100;
    const issues = [];
    const recommendations = [];
    
    if (mediaContent.optimization.altTextCompliance < 80) {
      score -= 30;
      issues.push('Poor image alt text compliance');
      recommendations.push('Add descriptive alt text to all images');
    }
    
    if (mediaContent.optimization.lazyLoadedImages < mediaContent.images.length * 0.5) {
      score -= 10;
      recommendations.push('Consider lazy loading for better performance');
    }
    
    return { score, issues, recommendations };
  }

  _analyzeSEOStructure(structureAnalysis) {
    let score = 100;
    const issues = [];
    const recommendations = [];
    
    if (!structureAnalysis.organization.hasSemanticStructure) {
      score -= 20;
      issues.push('Missing semantic HTML structure');
      recommendations.push('Use semantic HTML elements (main, article, section)');
    }
    
    if (structureAnalysis.organization.logicalFlow < 70) {
      score -= 15;
      issues.push('Poor content flow');
      recommendations.push('Improve content organization and flow');
    }
    
    return { score, issues, recommendations };
  }

  _identifyContentSEOOpportunities(textContent, mediaContent, structureAnalysis) {
    const opportunities = [];
    
    if (textContent.totalLength >= 1000) {
      opportunities.push('Content length supports long-form SEO');
    }
    
    if (mediaContent.images.length > 0 && mediaContent.optimization.altTextCompliance > 90) {
      opportunities.push('Excellent image optimization');
    }
    
    if (structureAnalysis.lists.total > 2) {
      opportunities.push('Good use of structured content');
    }
    
    return opportunities;
  }

  _validateTextContent(textContent) {
    let score = 100;
    
    if (textContent.totalLength < this.thresholds.minTextLength) {
      score -= 40;
    }
    
    if (textContent.paragraphCount < 2) {
      score -= 20;
    }
    
    return { score };
  }

  _validateMediaContent(mediaContent) {
    let score = 100;
    
    if (mediaContent.optimization.altTextCompliance < 70) {
      score -= 30;
    }
    
    return { score };
  }

  _identifyContentImprovementAreas(qualityAnalysis) {
    const areas = [];
    
    if (qualityAnalysis.readability.score < 70) {
      areas.push('readability');
    }
    
    if (qualityAnalysis.depth.score < 70) {
      areas.push('content_depth');
    }
    
    if (qualityAnalysis.language.vocabularyDiversity < 0.5) {
      areas.push('vocabulary_diversity');
    }
    
    return areas;
  }

  _generateContentValidationRecommendations(textContent, mediaContent, qualityAnalysis) {
    const recommendations = [];
    
    if (textContent.totalLength < 500) {
      recommendations.push('Expand content length for better SEO performance');
    }
    
    if (mediaContent.optimization.altTextCompliance < 80) {
      recommendations.push('Improve image accessibility with better alt text');
    }
    
    if (qualityAnalysis.readability.score < 70) {
      recommendations.push('Improve content readability');
    }
    
    return recommendations;
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

  _getOptimizationLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    if (score >= 60) return 'poor';
    return 'critical';
  }

  _generateCacheKey(document) {
    const textContent = document.body ? document.body.textContent.trim() : '';
    const images = document.querySelectorAll('img').length;
    return btoa(`${textContent.substring(0, 100)}_${images}`).slice(0, 20);
  }
}

export default ContentElementDetector;
