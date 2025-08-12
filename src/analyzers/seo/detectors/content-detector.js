/**
 * Content Detector - GPT-5 Style Pure Detection
 * 
 * Detects and extracts content-related elements from the DOM
 * No business logic - pure detection and extraction
 */

export class ContentDetector {
  constructor(options = {}) {
    this.options = {
      extractTextMetrics: options.extractTextMetrics !== false,
      analyzeImages: options.analyzeImages !== false,
      detectLanguage: options.detectLanguage !== false,
      includeStructure: options.includeStructure !== false,
      extractKeywords: options.extractKeywords !== false,
      ...options
    };
  }

  /**
   * Detect all content-related elements
   * @param {Document} document - DOM document
   * @returns {Object} Content detection results
   */
  async detect(document) {
    try {
      const results = {
        success: true,
        text: this._detectTextContent(document),
        images: this.options.analyzeImages ? this._detectImages(document) : null,
        media: this._detectMediaElements(document),
        structure: this.options.includeStructure ? this._detectContentStructure(document) : null,
        language: this.options.detectLanguage ? this._detectLanguageContent(document) : null,
        keywords: this.options.extractKeywords ? this._extractContentKeywords(document) : null,
        statistics: {}
      };

      // Calculate statistics
      results.statistics = this._calculateStatistics(results);

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
   * Detect text content and metrics
   * @param {Document} document - DOM document
   * @returns {Object} Text content data
   * @private
   */
  _detectTextContent(document) {
    const bodyElement = document.body || document.documentElement;
    
    if (!bodyElement) {
      return {
        present: false,
        error: 'No body element found'
      };
    }

    const textContent = this._extractVisibleText(bodyElement);
    const plainText = textContent.replace(/\s+/g, ' ').trim();
    
    const textData = {
      present: plainText.length > 0,
      content: this.options.extractTextMetrics ? plainText : null,
      length: plainText.length,
      wordCount: this._countWords(plainText),
      paragraphCount: this._countParagraphs(document),
      sentenceCount: this._countSentences(plainText),
      characterCount: plainText.length,
      charactersNoSpaces: plainText.replace(/\s/g, '').length
    };

    // Advanced text metrics
    if (this.options.extractTextMetrics) {
      textData.metrics = this._calculateTextMetrics(plainText);
      textData.readability = this._calculateReadability(plainText);
    }

    return textData;
  }

  /**
   * Detect images and their attributes
   * @param {Document} document - DOM document
   * @returns {Object} Image detection data
   * @private
   */
  _detectImages(document) {
    const images = Array.from(document.querySelectorAll('img'));
    
    const imageData = {
      count: images.length,
      images: images.map((img, index) => ({
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt'),
        title: img.getAttribute('title'),
        width: img.getAttribute('width') || img.naturalWidth || null,
        height: img.getAttribute('height') || img.naturalHeight || null,
        loading: img.getAttribute('loading'),
        srcset: img.getAttribute('srcset'),
        sizes: img.getAttribute('sizes'),
        hasAlt: !!img.getAttribute('alt'),
        altLength: (img.getAttribute('alt') || '').length,
        isEmpty: !img.getAttribute('alt') || img.getAttribute('alt').trim().length === 0,
        position: index + 1,
        isDecorative: this._isDecorativeImage(img),
        format: this._detectImageFormat(img.getAttribute('src'))
      })),
      statistics: {}
    };

    // Calculate image statistics
    imageData.statistics = this._calculateImageStatistics(imageData.images);

    return imageData;
  }

  /**
   * Detect media elements (video, audio, etc.)
   * @param {Document} document - DOM document
   * @returns {Object} Media detection data
   * @private
   */
  _detectMediaElements(document) {
    const videos = Array.from(document.querySelectorAll('video'));
    const audios = Array.from(document.querySelectorAll('audio'));
    const iframes = Array.from(document.querySelectorAll('iframe'));
    const embeds = Array.from(document.querySelectorAll('embed, object'));

    return {
      videos: {
        count: videos.length,
        elements: videos.map(video => ({
          src: video.getAttribute('src'),
          poster: video.getAttribute('poster'),
          controls: video.hasAttribute('controls'),
          autoplay: video.hasAttribute('autoplay'),
          muted: video.hasAttribute('muted'),
          loop: video.hasAttribute('loop'),
          width: video.getAttribute('width'),
          height: video.getAttribute('height')
        }))
      },
      audios: {
        count: audios.length,
        elements: audios.map(audio => ({
          src: audio.getAttribute('src'),
          controls: audio.hasAttribute('controls'),
          autoplay: audio.hasAttribute('autoplay'),
          muted: audio.hasAttribute('muted'),
          loop: audio.hasAttribute('loop')
        }))
      },
      iframes: {
        count: iframes.length,
        elements: iframes.map(iframe => ({
          src: iframe.getAttribute('src'),
          title: iframe.getAttribute('title'),
          width: iframe.getAttribute('width'),
          height: iframe.getAttribute('height'),
          loading: iframe.getAttribute('loading'),
          isVideo: this._isVideoEmbed(iframe.getAttribute('src'))
        }))
      },
      embeds: {
        count: embeds.length,
        elements: embeds.map(embed => ({
          src: embed.getAttribute('src'),
          type: embed.getAttribute('type'),
          width: embed.getAttribute('width'),
          height: embed.getAttribute('height')
        }))
      }
    };
  }

  /**
   * Detect content structure elements
   * @param {Document} document - DOM document
   * @returns {Object} Content structure data
   * @private
   */
  _detectContentStructure(document) {
    return {
      main: this._detectMainContent(document),
      articles: this._detectArticles(document),
      sections: this._detectSections(document),
      asides: this._detectAsides(document),
      lists: this._detectLists(document),
      tables: this._detectTables(document),
      forms: this._detectForms(document)
    };
  }

  /**
   * Detect language-related content
   * @param {Document} document - DOM document
   * @returns {Object} Language detection data
   * @private
   */
  _detectLanguageContent(document) {
    const htmlLang = document.documentElement.getAttribute('lang');
    const textContent = this._extractVisibleText(document.body || document.documentElement);
    
    return {
      declared: htmlLang,
      detected: this._detectTextLanguage(textContent),
      multiLanguage: this._detectMultiLanguageContent(document)
    };
  }

  /**
   * Extract content keywords
   * @param {Document} document - DOM document
   * @returns {Object} Keyword extraction data
   * @private
   */
  _extractContentKeywords(document) {
    const textContent = this._extractVisibleText(document.body || document.documentElement);
    const keywords = this._extractKeywords(textContent);
    
    return {
      total: keywords.length,
      unique: [...new Set(keywords)].length,
      keywords: [...new Set(keywords)],
      density: this._calculateKeywordDensity(keywords, textContent),
      phrases: this._extractKeyPhrases(textContent)
    };
  }

  // Helper methods

  /**
   * Extract visible text from element (excluding scripts, styles, etc.)
   * @param {Element} element - DOM element
   * @returns {string} Visible text content
   * @private
   */
  _extractVisibleText(element) {
    if (!element) return '';

    // Clone element to avoid modifying original
    const clone = element.cloneNode(true);

    // Remove script and style elements
    const scriptsAndStyles = clone.querySelectorAll('script, style, noscript');
    scriptsAndStyles.forEach(el => el.remove());

    // Get text content
    return clone.textContent || '';
  }

  /**
   * Count words in text
   * @param {string} text - Text content
   * @returns {number} Word count
   * @private
   */
  _countWords(text) {
    if (!text || text.trim().length === 0) return 0;
    
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Count paragraphs in document
   * @param {Document} document - DOM document
   * @returns {number} Paragraph count
   * @private
   */
  _countParagraphs(document) {
    return document.querySelectorAll('p').length;
  }

  /**
   * Count sentences in text
   * @param {string} text - Text content
   * @returns {number} Sentence count
   * @private
   */
  _countSentences(text) {
    if (!text || text.trim().length === 0) return 0;
    
    // Simple sentence detection
    return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
  }

  /**
   * Calculate advanced text metrics
   * @param {string} text - Text content
   * @returns {Object} Text metrics
   * @private
   */
  _calculateTextMetrics(text) {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (words.length === 0) {
      return {
        avgWordsPerSentence: 0,
        avgCharactersPerWord: 0,
        avgSyllablesPerWord: 0
      };
    }

    return {
      avgWordsPerSentence: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
      avgCharactersPerWord: Math.round(text.replace(/\s/g, '').length / words.length),
      avgSyllablesPerWord: Math.round(this._calculateTotalSyllables(words) / words.length)
    };
  }

  /**
   * Calculate readability metrics
   * @param {string} text - Text content
   * @returns {Object} Readability metrics
   * @private
   */
  _calculateReadability(text) {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const syllables = this._calculateTotalSyllables(words);

    if (words.length === 0 || sentences.length === 0) {
      return {
        fleschScore: 0,
        grade: 'Unknown'
      };
    }

    // Flesch Reading Ease Score
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);

    return {
      fleschScore: Math.round(fleschScore),
      grade: this._getReadingGrade(fleschScore),
      avgSentenceLength,
      avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 10) / 10
    };
  }

  /**
   * Calculate total syllables in words array
   * @param {Array} words - Array of words
   * @returns {number} Total syllables
   * @private
   */
  _calculateTotalSyllables(words) {
    return words.reduce((total, word) => total + this._countSyllables(word), 0);
  }

  /**
   * Count syllables in a word (simple estimation)
   * @param {string} word - Word to analyze
   * @returns {number} Syllable count
   * @private
   */
  _countSyllables(word) {
    if (!word || word.length === 0) return 0;
    
    word = word.toLowerCase();
    let count = 0;
    let previousWasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = 'aeiouy'.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }

    // Handle silent 'e'
    if (word.endsWith('e')) {
      count--;
    }

    // Ensure at least 1 syllable
    return Math.max(1, count);
  }

  /**
   * Get reading grade from Flesch score
   * @param {number} score - Flesch reading ease score
   * @returns {string} Reading grade
   * @private
   */
  _getReadingGrade(score) {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  }

  /**
   * Check if image is decorative
   * @param {Element} img - Image element
   * @returns {boolean} True if decorative
   * @private
   */
  _isDecorativeImage(img) {
    const alt = img.getAttribute('alt');
    const role = img.getAttribute('role');
    
    // Decorative if alt is empty or role is presentation
    return alt === '' || role === 'presentation' || role === 'none';
  }

  /**
   * Detect image format from src
   * @param {string} src - Image source
   * @returns {string} Image format
   * @private
   */
  _detectImageFormat(src) {
    if (!src) return 'unknown';
    
    const extension = src.split('.').pop().toLowerCase().split('?')[0];
    const formats = {
      'jpg': 'JPEG',
      'jpeg': 'JPEG',
      'png': 'PNG',
      'gif': 'GIF',
      'webp': 'WebP',
      'svg': 'SVG',
      'bmp': 'BMP',
      'ico': 'ICO',
      'avif': 'AVIF'
    };
    
    return formats[extension] || 'unknown';
  }

  /**
   * Calculate image statistics
   * @param {Array} images - Array of image data
   * @returns {Object} Image statistics
   * @private
   */
  _calculateImageStatistics(images) {
    if (images.length === 0) {
      return {
        withAlt: 0,
        withoutAlt: 0,
        decorative: 0,
        avgAltLength: 0
      };
    }

    const withAlt = images.filter(img => img.hasAlt && !img.isEmpty).length;
    const withoutAlt = images.filter(img => !img.hasAlt || img.isEmpty).length;
    const decorative = images.filter(img => img.isDecorative).length;
    const altLengths = images
      .filter(img => img.hasAlt && !img.isEmpty)
      .map(img => img.altLength);

    return {
      withAlt,
      withoutAlt,
      decorative,
      avgAltLength: altLengths.length > 0 ? 
        Math.round(altLengths.reduce((sum, len) => sum + len, 0) / altLengths.length) : 0
    };
  }

  /**
   * Check if iframe contains video
   * @param {string} src - Iframe source
   * @returns {boolean} True if video embed
   * @private
   */
  _isVideoEmbed(src) {
    if (!src) return false;
    
    const videoHosts = [
      'youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com',
      'twitch.tv', 'facebook.com', 'instagram.com', 'tiktok.com'
    ];
    
    return videoHosts.some(host => src.includes(host));
  }

  /**
   * Detect main content areas
   * @param {Document} document - DOM document
   * @returns {Object} Main content data
   * @private
   */
  _detectMainContent(document) {
    const mainElements = document.querySelectorAll('main, [role="main"]');
    
    return {
      count: mainElements.length,
      present: mainElements.length > 0,
      multiple: mainElements.length > 1
    };
  }

  /**
   * Detect articles
   * @param {Document} document - DOM document
   * @returns {Object} Article data
   * @private
   */
  _detectArticles(document) {
    const articles = document.querySelectorAll('article');
    
    return {
      count: articles.length,
      present: articles.length > 0
    };
  }

  /**
   * Detect sections
   * @param {Document} document - DOM document
   * @returns {Object} Section data
   * @private
   */
  _detectSections(document) {
    const sections = document.querySelectorAll('section');
    
    return {
      count: sections.length,
      present: sections.length > 0
    };
  }

  /**
   * Detect aside elements
   * @param {Document} document - DOM document
   * @returns {Object} Aside data
   * @private
   */
  _detectAsides(document) {
    const asides = document.querySelectorAll('aside');
    
    return {
      count: asides.length,
      present: asides.length > 0
    };
  }

  /**
   * Detect lists
   * @param {Document} document - DOM document
   * @returns {Object} List data
   * @private
   */
  _detectLists(document) {
    const orderedLists = document.querySelectorAll('ol');
    const unorderedLists = document.querySelectorAll('ul');
    const definitionLists = document.querySelectorAll('dl');
    
    return {
      ordered: orderedLists.length,
      unordered: unorderedLists.length,
      definition: definitionLists.length,
      total: orderedLists.length + unorderedLists.length + definitionLists.length
    };
  }

  /**
   * Detect tables
   * @param {Document} document - DOM document
   * @returns {Object} Table data
   * @private
   */
  _detectTables(document) {
    const tables = document.querySelectorAll('table');
    
    return {
      count: tables.length,
      present: tables.length > 0,
      withHeaders: Array.from(tables).filter(table => 
        table.querySelector('th') || table.querySelector('thead')
      ).length
    };
  }

  /**
   * Detect forms
   * @param {Document} document - DOM document
   * @returns {Object} Form data
   * @private
   */
  _detectForms(document) {
    const forms = document.querySelectorAll('form');
    
    return {
      count: forms.length,
      present: forms.length > 0
    };
  }

  /**
   * Simple language detection (basic)
   * @param {string} text - Text to analyze
   * @returns {string} Detected language (rough estimate)
   * @private
   */
  _detectTextLanguage(text) {
    // Very basic language detection - in real implementation you might use a library
    if (!text || text.length < 50) return 'unknown';
    
    // Simple character-based detection
    const englishScore = (text.match(/[a-zA-Z]/g) || []).length / text.length;
    
    if (englishScore > 0.8) return 'en';
    return 'unknown';
  }

  /**
   * Detect multi-language content
   * @param {Document} document - DOM document
   * @returns {Object} Multi-language data
   * @private
   */
  _detectMultiLanguageContent(document) {
    const elementsWithLang = document.querySelectorAll('[lang]');
    const languages = new Set();
    
    elementsWithLang.forEach(el => {
      const lang = el.getAttribute('lang');
      if (lang) languages.add(lang);
    });
    
    return {
      hasMultipleLangs: languages.size > 1,
      languages: Array.from(languages),
      count: languages.size
    };
  }

  /**
   * Extract keywords from text
   * @param {string} text - Text content
   * @returns {Array} Array of keywords
   * @private
   */
  _extractKeywords(text) {
    if (!text) return [];
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this._isStopWord(word));
    
    return words;
  }

  /**
   * Calculate keyword density
   * @param {Array} keywords - Array of keywords
   * @param {string} text - Full text
   * @returns {Object} Keyword density data
   * @private
   */
  _calculateKeywordDensity(keywords, text) {
    const totalWords = this._countWords(text);
    const keywordCounts = {};
    
    keywords.forEach(keyword => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
    
    const densities = {};
    Object.keys(keywordCounts).forEach(keyword => {
      densities[keyword] = Math.round((keywordCounts[keyword] / totalWords) * 10000) / 100;
    });
    
    return densities;
  }

  /**
   * Extract key phrases (simple bigrams and trigrams)
   * @param {string} text - Text content
   * @returns {Array} Array of key phrases
   * @private
   */
  _extractKeyPhrases(text) {
    if (!text) return [];
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    const phrases = [];
    
    // Extract bigrams
    for (let i = 0; i < words.length - 1; i++) {
      if (!this._isStopWord(words[i]) || !this._isStopWord(words[i + 1])) {
        phrases.push(`${words[i]} ${words[i + 1]}`);
      }
    }
    
    // Extract trigrams
    for (let i = 0; i < words.length - 2; i++) {
      if (!this._isStopWord(words[i]) || !this._isStopWord(words[i + 1]) || !this._isStopWord(words[i + 2])) {
        phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
      }
    }
    
    return phrases;
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
      'after', 'above', 'below', 'between', 'among', 'around', 'through',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
      'must', 'can', 'this', 'that', 'these', 'those', 'a', 'an'
    ];
    
    return stopWords.includes(word.toLowerCase());
  }

  /**
   * Calculate overall statistics
   * @param {Object} results - Detection results
   * @returns {Object} Statistics
   * @private
   */
  _calculateStatistics(results) {
    const stats = {
      text: {
        hasContent: results.text.present,
        wordCount: results.text.wordCount,
        readabilityGrade: results.text.readability?.grade || 'Unknown'
      }
    };

    if (results.images) {
      stats.images = {
        total: results.images.count,
        withAlt: results.images.statistics.withAlt,
        accessibility: results.images.statistics.withAlt / Math.max(1, results.images.count)
      };
    }

    if (results.keywords) {
      stats.keywords = {
        total: results.keywords.total,
        unique: results.keywords.unique
      };
    }

    return stats;
  }
}

export default ContentDetector;
