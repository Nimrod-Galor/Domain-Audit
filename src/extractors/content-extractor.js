/**
 * Content Extractor Module
 * 
 * Handles all content analysis, readability scoring, and text extraction functionality.
 * This module extracts and analyzes page content including:
 * - Text content and word counting
 * - Heading structure analysis
 * - Image accessibility analysis
 * - Content-to-code ratios
 * - Readability scoring (Flesch-Kincaid, etc.)
 * - Content quality metrics
 * 
 * @author Domain Link Audit Tool
 * @version 1.0.0
 */

// ============================================================================
// CORE CONTENT EXTRACTION CLASS
// ============================================================================

export class ContentExtractor {
  constructor(performanceManager = null) {
    this.performanceManager = performanceManager;
    this.cache = performanceManager?.cache || new Map();
    this.config = {
      maxHeadingsPerType: 10,
      maxImagesForAnalysis: 100,
      maxContextLength: 100,
      cacheReadabilityScores: true
    };
  }

  /**
   * Extract comprehensive content data from document
   * @param {Document} document - DOM document
   * @param {string} html - Raw HTML content
   * @param {string} url - Page URL for caching
   * @returns {Object} Complete content analysis
   */
  async extractContentData(document, html, url = null) {
    const cacheKey = url ? `content_analysis_${url}` : null;
    
    // Check cache first
    if (cacheKey && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const startTime = Date.now();
    
    try {
      const contentData = {
        ...this.extractBasicContentMetrics(document, html),
        ...this.extractHeadingStructure(document),
        ...this.extractImageAnalysis(document),
        ...this.extractMediaElements(document),
        readability: this.calculateReadabilityScores(document.body?.textContent || ''),
        contentSections: this.analyzeContentSections(document),
        contentQuality: this.assessContentQuality(document, html)
      };

      // Cache the result
      if (cacheKey) {
        this.cache.set(cacheKey, contentData);
      }

      // Track performance if available
      if (this.performanceManager && typeof this.performanceManager.trackOperation === 'function') {
        this.performanceManager.trackOperation('content_extraction', Date.now() - startTime);
      }

      return contentData;
    } catch (error) {
      console.error('Error in content extraction:', error);
      return this.getEmptyContentData();
    }
  }

  /**
   * Optimized version for better performance
   * @param {Document} document - DOM document
   * @param {string} html - Raw HTML content
   * @returns {Object} Basic content metrics
   */
  extractContentDataOptimized(document, html) {
    const body = document.body;
    if (!body) return this.getEmptyContentData();
    
    const textContent = body.textContent || '';
    const wordCount = this.countWords(textContent);
    
    // Batch process headings efficiently
    const headings = this.extractHeadingsOptimized(body);
    
    // Efficient image analysis with limits
    const images = this.analyzeImagesOptimized(body);
    
    // Content to code ratio calculation
    const contentToCodeRatio = this.calculateContentToCodeRatio(html, textContent);

    return {
      wordCount,
      textLength: textContent.length,
      headings,
      images,
      contentToCodeRatio,
      hasVideo: !!body.querySelector('video'),
      hasAudio: !!body.querySelector('audio'),
      hasForms: !!body.querySelector('form'),
      extractionMethod: 'optimized'
    };
  }
}

// ============================================================================
// BASIC CONTENT METRICS
// ============================================================================

ContentExtractor.prototype.extractBasicContentMetrics = function(document, html) {
  const textContent = document.body?.textContent || '';
  const wordCount = this.countWords(textContent);
  const contentToCodeRatio = this.calculateContentToCodeRatio(html, textContent);

  return {
    wordCount,
    textLength: textContent.length,
    contentToCodeRatio,
    extractionMethod: 'comprehensive'
  };
};

ContentExtractor.prototype.countWords = function(text) {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

ContentExtractor.prototype.calculateContentToCodeRatio = function(html, textContent) {
  if (!html) return 0;
  
  // Use string length instead of Buffer for simpler cross-environment compatibility
  const htmlSize = html.length;
  const textSize = textContent.length;
  
  return htmlSize > 0 ? Math.round((textSize / htmlSize * 100) * 100) / 100 : 0;
};

// ============================================================================
// HEADING STRUCTURE ANALYSIS
// ============================================================================

ContentExtractor.prototype.extractHeadingStructure = function(document) {
  const headings = {
    h1: this.extractHeadingsByType(document, 'h1'),
    h2: this.extractHeadingsByType(document, 'h2'),
    h3: this.extractHeadingsByType(document, 'h3'),
    h4: this.extractHeadingsByType(document, 'h4'),
    h5: this.extractHeadingsByType(document, 'h5'),
    h6: this.extractHeadingsByType(document, 'h6')
  };

  return {
    headings,
    headingStats: this.analyzeHeadingStructure(headings)
  };
};

ContentExtractor.prototype.extractHeadingsByType = function(document, tagName) {
  return [...document.querySelectorAll(tagName)]
    .slice(0, this.config.maxHeadingsPerType)
    .map(h => ({
      text: h.textContent.trim(),
      wordCount: this.countWords(h.textContent),
      position: this.getElementPosition(h)
    }));
};

ContentExtractor.prototype.extractHeadingsOptimized = function(body) {
  const headingSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const headings = {};
  
  headingSelectors.forEach(selector => {
    const elements = body.getElementsByTagName(selector);
    headings[selector] = Array.from(elements)
      .slice(0, this.config.maxHeadingsPerType)
      .map(h => h.textContent.trim());
  });
  
  return headings;
};

ContentExtractor.prototype.analyzeHeadingStructure = function(headings) {
  let totalHeadings = 0;
  let hierarchyIssues = 0;
  let duplicateHeadings = new Set();
  
  Object.values(headings).forEach(headingArray => {
    totalHeadings += headingArray.length;
    
    // Check for duplicates
    headingArray.forEach(heading => {
      if (typeof heading === 'string') {
        if (duplicateHeadings.has(heading)) {
          hierarchyIssues++;
        } else {
          duplicateHeadings.add(heading);
        }
      }
    });
  });

  return {
    totalHeadings,
    hierarchyIssues,
    hasH1: headings.h1.length > 0,
    multipleH1: headings.h1.length > 1,
    emptyHeadings: this.countEmptyHeadings(headings)
  };
};

ContentExtractor.prototype.countEmptyHeadings = function(headings) {
  let emptyCount = 0;
  Object.values(headings).forEach(headingArray => {
    headingArray.forEach(heading => {
      const text = typeof heading === 'string' ? heading : heading.text;
      if (!text || text.trim().length === 0) {
        emptyCount++;
      }
    });
  });
  return emptyCount;
};

// ============================================================================
// IMAGE ANALYSIS
// ============================================================================

ContentExtractor.prototype.extractImageAnalysis = function(document) {
  const images = [...document.querySelectorAll('img')];
  
  const imageData = {
    total: images.length,
    withAlt: 0,
    withoutAlt: 0,
    emptyAlt: 0,
    withTitle: 0,
    missingAlt: [],
    oversizedImages: [],
    decorativeImages: 0
  };

  images.forEach((img, index) => {
    const alt = img.getAttribute('alt');
    const title = img.getAttribute('title');
    const src = img.getAttribute('src');
    
    // Alt text analysis
    if (alt === null) {
      imageData.withoutAlt++;
      imageData.missingAlt.push({
        src: src || `Image ${index + 1}`,
        position: this.getElementPosition(img)
      });
    } else if (alt === '') {
      imageData.emptyAlt++;
      imageData.decorativeImages++;
    } else {
      imageData.withAlt++;
    }
    
    // Title attribute
    if (title) {
      imageData.withTitle++;
    }
    
    // Size analysis (if available)
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    if (width > 2000 || height > 2000) {
      imageData.oversizedImages.push({
        src: src || `Image ${index + 1}`,
        dimensions: `${width}x${height}`
      });
    }
  });

  return { images: imageData };
};

ContentExtractor.prototype.analyzeImagesOptimized = function(body) {
  const images = body.getElementsByTagName('img');
  const imageStats = {
    total: images.length,
    withAlt: 0,
    withoutAlt: 0,
    emptyAlt: 0
  };
  
  // Process images in batches for performance
  const limit = Math.min(images.length, this.config.maxImagesForAnalysis);
  for (let i = 0; i < limit; i++) {
    const img = images[i];
    const alt = img.getAttribute('alt');
    
    if (alt === null) {
      imageStats.withoutAlt++;
    } else if (alt === '') {
      imageStats.emptyAlt++;
    } else {
      imageStats.withAlt++;
    }
  }
  
  return imageStats;
};

// ============================================================================
// MEDIA ELEMENTS ANALYSIS
// ============================================================================

ContentExtractor.prototype.extractMediaElements = function(document) {
  return {
    hasVideo: !!document.querySelector('video'),
    hasAudio: !!document.querySelector('audio'),
    hasForms: !!document.querySelector('form'),
    hasIframes: !!document.querySelector('iframe'),
    videoCount: document.querySelectorAll('video').length,
    audioCount: document.querySelectorAll('audio').length,
    formCount: document.querySelectorAll('form').length,
    iframeCount: document.querySelectorAll('iframe').length
  };
};

// ============================================================================
// READABILITY ANALYSIS
// ============================================================================

ContentExtractor.prototype.calculateReadabilityScores = function(text) {
  if (!text || text.trim().length === 0) {
    return this.getEmptyReadabilityScores();
  }

  // Check cache for readability scores
  const cacheKey = `readability_${text.length}_${text.slice(0, 50)}`;
  if (this.config.cacheReadabilityScores && this.cache.has(cacheKey)) {
    return this.cache.get(cacheKey);
  }

  const scores = this.performReadabilityAnalysis(text);
  
  // Cache the result
  if (this.config.cacheReadabilityScores) {
    this.cache.set(cacheKey, scores);
  }
  
  return scores;
};

ContentExtractor.prototype.performReadabilityAnalysis = function(text) {
  // Clean and prepare text
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Count sentences (improved sentence detection)
  const sentences = cleanText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  const sentenceCount = sentences.length || 1;
  
  // Count words
  const words = cleanText.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  if (wordCount === 0) {
    return this.getEmptyReadabilityScores();
  }
  
  // Count syllables for each word
  let totalSyllables = 0;
  let complexWords = 0; // Words with 3+ syllables
  
  words.forEach(word => {
    const syllableCount = this.countSyllables(word);
    totalSyllables += syllableCount;
    if (syllableCount >= 3) {
      complexWords++;
    }
  });
  
  // Calculate metrics
  const averageSentenceLength = wordCount / sentenceCount;
  const averageSyllablesPerWord = totalSyllables / wordCount;
  const complexWordPercentage = (complexWords / wordCount) * 100;
  
  // Flesch Reading Ease Score
  const fleschReadingEase = Math.max(0, Math.min(100, 
    206.835 - (1.015 * averageSentenceLength) - (84.6 * averageSyllablesPerWord)
  ));
  
  // Flesch-Kincaid Grade Level
  const fleschKincaidGradeLevel = Math.max(0,
    (0.39 * averageSentenceLength) + (11.8 * averageSyllablesPerWord) - 15.59
  );
  
  return {
    fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
    fleschKincaidGradeLevel: Math.round(fleschKincaidGradeLevel * 10) / 10,
    averageSentenceLength: Math.round(averageSentenceLength * 10) / 10,
    averageSyllablesPerWord: Math.round(averageSyllablesPerWord * 100) / 100,
    complexWordPercentage: Math.round(complexWordPercentage * 10) / 10,
    readingLevel: this.getReadingLevel(fleschReadingEase),
    sentenceCount,
    wordCount,
    syllableCount: totalSyllables,
    complexWordCount: complexWords
  };
};

ContentExtractor.prototype.countSyllables = function(word) {
  // Remove punctuation and convert to lowercase
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  
  if (word.length === 0) return 0;
  if (word.length <= 3) return 1;
  
  // Count vowel groups
  let syllableCount = 0;
  let previousWasVowel = false;
  const vowels = 'aeiouy';
  
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    
    if (isVowel && !previousWasVowel) {
      syllableCount++;
    }
    
    previousWasVowel = isVowel;
  }
  
  // Handle silent 'e' at the end
  if (word.endsWith('e') && syllableCount > 1) {
    syllableCount--;
  }
  
  // Handle special cases
  if (word.endsWith('le') && word.length > 2 && !vowels.includes(word[word.length - 3])) {
    syllableCount++;
  }
  
  // Ensure at least 1 syllable
  return Math.max(1, syllableCount);
};

ContentExtractor.prototype.getReadingLevel = function(fleschReadingEase) {
  if (fleschReadingEase >= 90) return 'Very Easy (5th grade)';
  else if (fleschReadingEase >= 80) return 'Easy (6th grade)';
  else if (fleschReadingEase >= 70) return 'Fairly Easy (7th grade)';
  else if (fleschReadingEase >= 60) return 'Standard (8th-9th grade)';
  else if (fleschReadingEase >= 50) return 'Fairly Difficult (10th-12th grade)';
  else if (fleschReadingEase >= 30) return 'Difficult (College level)';
  else return 'Very Difficult (Graduate level)';
};

// ============================================================================
// CONTENT SECTIONS ANALYSIS
// ============================================================================

ContentExtractor.prototype.analyzeContentSections = function(document) {
  const sections = {
    header: this.findSection(document, [
      'header', '[role="banner"]', '.header', '.site-header', '.page-header'
    ]),
    navigation: this.findSection(document, [
      'nav', '[role="navigation"]', '.nav', '.navigation', '.menu'
    ]),
    main: this.findSection(document, [
      'main', '[role="main"]', '.main', '.content', 'article', '.post'
    ]),
    sidebar: this.findSection(document, [
      'aside', '[role="complementary"]', '.sidebar', '.widget-area'
    ]),
    footer: this.findSection(document, [
      'footer', '[role="contentinfo"]', '.footer', '.site-footer'
    ])
  };

  return Object.entries(sections).reduce((acc, [name, element]) => {
    acc[name] = element ? {
      exists: true,
      wordCount: this.countWords(element.textContent || ''),
      hasLinks: !!element.querySelector('a'),
      linkCount: element.querySelectorAll('a').length
    } : {
      exists: false,
      wordCount: 0,
      hasLinks: false,
      linkCount: 0
    };
    return acc;
  }, {});
};

ContentExtractor.prototype.findSection = function(document, selectors) {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) return element;
  }
  return null;
};

// ============================================================================
// CONTENT QUALITY ASSESSMENT
// ============================================================================

ContentExtractor.prototype.assessContentQuality = function(document, html) {
  const textContent = document.body?.textContent || '';
  const wordCount = this.countWords(textContent);
  
  const quality = {
    score: 0,
    factors: {},
    recommendations: []
  };

  // Word count factor (0-25 points)
  if (wordCount >= 300) {
    quality.factors.wordCount = 25;
  } else if (wordCount >= 150) {
    quality.factors.wordCount = 15;
    quality.recommendations.push('Consider adding more content (current: ' + wordCount + ' words)');
  } else {
    quality.factors.wordCount = 5;
    quality.recommendations.push('Content is too short (current: ' + wordCount + ' words)');
  }

  // Heading structure factor (0-20 points)
  const headings = this.extractHeadingStructure(document);
  if (headings.headingStats.hasH1 && !headings.headingStats.multipleH1) {
    quality.factors.headingStructure = 20;
  } else if (headings.headingStats.hasH1) {
    quality.factors.headingStructure = 10;
    quality.recommendations.push('Multiple H1 tags detected - use only one H1 per page');
  } else {
    quality.factors.headingStructure = 0;
    quality.recommendations.push('Missing H1 tag - add a main heading');
  }

  // Image accessibility factor (0-15 points)
  const images = this.extractImageAnalysis(document);
  const altCoverage = images.images.total > 0 ? 
    (images.images.withAlt / images.images.total) * 100 : 100;
  
  if (altCoverage >= 90) {
    quality.factors.imageAccessibility = 15;
  } else if (altCoverage >= 70) {
    quality.factors.imageAccessibility = 10;
    quality.recommendations.push('Some images missing alt text');
  } else {
    quality.factors.imageAccessibility = 5;
    quality.recommendations.push('Many images missing alt text');
  }

  // Content-to-code ratio factor (0-20 points)
  const ratio = this.calculateContentToCodeRatio(html, textContent);
  if (ratio >= 15) {
    quality.factors.contentToCodeRatio = 20;
  } else if (ratio >= 10) {
    quality.factors.contentToCodeRatio = 15;
  } else if (ratio >= 5) {
    quality.factors.contentToCodeRatio = 10;
    quality.recommendations.push('Low content-to-code ratio - consider reducing HTML/CSS');
  } else {
    quality.factors.contentToCodeRatio = 5;
    quality.recommendations.push('Very low content-to-code ratio');
  }

  // Readability factor (0-20 points)
  const readability = this.calculateReadabilityScores(textContent);
  if (readability.fleschReadingEase >= 60) {
    quality.factors.readability = 20;
  } else if (readability.fleschReadingEase >= 30) {
    quality.factors.readability = 15;
  } else {
    quality.factors.readability = 10;
    quality.recommendations.push('Content is difficult to read - consider simplifying');
  }

  // Calculate total score
  quality.score = Object.values(quality.factors).reduce((sum, score) => sum + score, 0);
  
  return quality;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

ContentExtractor.prototype.getElementPosition = function(element) {
  // In Node.js environment, we can't use getBoundingClientRect
  // Return a mock position for testing purposes
  if (typeof window === 'undefined') {
    return {
      top: 0,
      left: 0,
      visible: true
    };
  }
  
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    visible: rect.top >= 0 && rect.left >= 0 && 
             rect.bottom <= window.innerHeight && 
             rect.right <= window.innerWidth
  };
};

ContentExtractor.prototype.getEmptyContentData = function() {
  return {
    wordCount: 0,
    textLength: 0,
    headings: { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] },
    images: { total: 0, withAlt: 0, withoutAlt: 0, emptyAlt: 0 },
    contentToCodeRatio: 0,
    hasVideo: false,
    hasAudio: false,
    hasForms: false,
    extractionMethod: 'empty'
  };
};

ContentExtractor.prototype.getEmptyReadabilityScores = function() {
  return {
    fleschReadingEase: 0,
    fleschKincaidGradeLevel: 0,
    averageSentenceLength: 0,
    averageSyllablesPerWord: 0,
    complexWordPercentage: 0,
    readingLevel: 'No content',
    sentenceCount: 0,
    wordCount: 0,
    syllableCount: 0,
    complexWordCount: 0
  };
};

// ============================================================================
// STANDALONE FUNCTIONS FOR BACKWARD COMPATIBILITY
// ============================================================================

/**
 * Extract content data (optimized version)
 * @param {Document} document - DOM document
 * @param {string} html - Raw HTML
 * @returns {Object} Content analysis
 */
export function extractContentDataOptimized(document, html) {
  const extractor = new ContentExtractor();
  return extractor.extractContentDataOptimized(document, html);
}

/**
 * Extract comprehensive content data
 * @param {Document} document - DOM document
 * @param {string} html - Raw HTML
 * @returns {Object} Complete content analysis
 */
export function extractContentData(document, html) {
  const extractor = new ContentExtractor();
  return extractor.extractContentData(document, html);
}

/**
 * Calculate readability scores for text
 * @param {string} text - Text to analyze
 * @returns {Object} Readability metrics
 */
export function calculateReadabilityScores(text) {
  const extractor = new ContentExtractor();
  return extractor.calculateReadabilityScores(text);
}

/**
 * Count syllables in a word
 * @param {string} word - Word to analyze
 * @returns {number} Syllable count
 */
export function countSyllables(word) {
  const extractor = new ContentExtractor();
  return extractor.countSyllables(word);
}

// ============================================================================
// MODULE CONFIGURATION
// ============================================================================

export const CONTENT_EXTRACTOR_CONFIG = {
  maxHeadingsPerType: 10,
  maxImagesForAnalysis: 100,
  maxContextLength: 100,
  cacheReadabilityScores: true,
  qualityThresholds: {
    wordCount: { good: 300, fair: 150 },
    contentToCodeRatio: { good: 15, fair: 10, poor: 5 },
    readabilityEase: { good: 60, fair: 30 },
    imageAltCoverage: { good: 90, fair: 70 }
  }
};

export default ContentExtractor;
