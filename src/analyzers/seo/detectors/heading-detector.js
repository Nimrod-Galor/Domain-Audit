/**
 * Heading Detector - GPT-5 Style Pure Detection
 * 
 * Detects and extracts all heading-related elements from the DOM
 * No business logic - pure detection and extraction
 */

export class HeadingDetector {
  constructor(options = {}) {
    this.options = {
      includeEmptyHeadings: options.includeEmptyHeadings !== false,
      extractStructure: options.extractStructure !== false,
      analyzeKeywords: options.analyzeKeywords !== false,
      includeAttributes: options.includeAttributes !== false,
      ...options
    };
  }

  /**
   * Detect all heading elements and their structure
   * @param {Document} document - DOM document
   * @returns {Object} Heading detection results
   */
  async detect(document) {
    try {
      const results = {
        success: true,
        headings: this._detectAllHeadings(document),
        structure: this.options.extractStructure ? 
          this._analyzeHeadingStructure(document) : null,
        statistics: {}
      };

      // Calculate statistics
      results.statistics = this._calculateStatistics(results.headings);

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
   * Detect all heading elements (H1-H6)
   * @param {Document} document - DOM document
   * @returns {Object} All heading data organized by level
   * @private
   */
  _detectAllHeadings(document) {
    const headingData = {
      h1: this._detectHeadingsByLevel(document, 'h1'),
      h2: this._detectHeadingsByLevel(document, 'h2'),
      h3: this._detectHeadingsByLevel(document, 'h3'),
      h4: this._detectHeadingsByLevel(document, 'h4'),
      h5: this._detectHeadingsByLevel(document, 'h5'),
      h6: this._detectHeadingsByLevel(document, 'h6'),
      all: []
    };

    // Create flat array of all headings with order
    const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headingData.all = Array.from(allHeadings).map((element, index) => ({
      level: parseInt(element.tagName.substring(1)),
      tagName: element.tagName.toLowerCase(),
      text: element.textContent.trim(),
      length: element.textContent.trim().length,
      order: index + 1,
      isEmpty: element.textContent.trim().length === 0,
      attributes: this.options.includeAttributes ? this._extractAttributes(element) : null,
      keywords: this.options.analyzeKeywords ? this._extractKeywords(element.textContent) : null,
      element: this.options.includeAttributes ? element : null
    }));

    return headingData;
  }

  /**
   * Detect headings by specific level
   * @param {Document} document - DOM document
   * @param {string} level - Heading level (h1, h2, etc.)
   * @returns {Array} Array of heading data for specific level
   * @private
   */
  _detectHeadingsByLevel(document, level) {
    const elements = document.querySelectorAll(level);
    
    return Array.from(elements).map((element, index) => {
      const text = element.textContent.trim();
      const isEmpty = text.length === 0;

      // Skip empty headings if option is disabled
      if (!this.options.includeEmptyHeadings && isEmpty) {
        return null;
      }

      return {
        text,
        length: text.length,
        isEmpty,
        position: index + 1,
        attributes: this.options.includeAttributes ? this._extractAttributes(element) : null,
        keywords: this.options.analyzeKeywords ? this._extractKeywords(text) : null,
        element: this.options.includeAttributes ? element : null
      };
    }).filter(Boolean);
  }

  /**
   * Analyze heading structure and hierarchy
   * @param {Document} document - DOM document
   * @returns {Object} Heading structure analysis
   * @private
   */
  _analyzeHeadingStructure(document) {
    const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    if (allHeadings.length === 0) {
      return {
        hasHeadings: false,
        structure: [],
        hierarchy: null,
        issues: ['No headings found']
      };
    }

    const structure = [];
    const hierarchy = this._buildHeadingHierarchy(allHeadings);
    const issues = this._detectStructuralIssues(allHeadings);

    // Build flat structure with nesting information
    Array.from(allHeadings).forEach((element, index) => {
      const level = parseInt(element.tagName.substring(1));
      const text = element.textContent.trim();
      
      structure.push({
        level,
        text,
        length: text.length,
        order: index + 1,
        tagName: element.tagName.toLowerCase(),
        isEmpty: text.length === 0,
        parent: this._findParentHeading(allHeadings, index, level),
        children: this._findChildHeadings(allHeadings, index, level)
      });
    });

    return {
      hasHeadings: true,
      structure,
      hierarchy,
      issues,
      metrics: this._calculateStructureMetrics(structure)
    };
  }

  /**
   * Build hierarchical heading structure
   * @param {NodeList} headings - All heading elements
   * @returns {Array} Hierarchical structure
   * @private
   */
  _buildHeadingHierarchy(headings) {
    const hierarchy = [];
    const stack = [];

    Array.from(headings).forEach((element, index) => {
      const level = parseInt(element.tagName.substring(1));
      const text = element.textContent.trim();
      
      const node = {
        level,
        text,
        tagName: element.tagName.toLowerCase(),
        order: index + 1,
        children: []
      };

      // Find the correct parent level
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      if (stack.length === 0) {
        hierarchy.push(node);
      } else {
        stack[stack.length - 1].children.push(node);
      }

      stack.push(node);
    });

    return hierarchy;
  }

  /**
   * Detect structural issues in heading hierarchy
   * @param {NodeList} headings - All heading elements
   * @returns {Array} Array of detected issues
   * @private
   */
  _detectStructuralIssues(headings) {
    const issues = [];
    const headingArray = Array.from(headings);

    if (headingArray.length === 0) {
      return ['No headings found'];
    }

    // Check for missing H1
    const h1Elements = headingArray.filter(h => h.tagName === 'H1');
    if (h1Elements.length === 0) {
      issues.push('No H1 heading found');
    } else if (h1Elements.length > 1) {
      issues.push(`Multiple H1 headings found (${h1Elements.length})`);
    }

    // Check for empty headings
    const emptyHeadings = headingArray.filter(h => h.textContent.trim().length === 0);
    if (emptyHeadings.length > 0) {
      issues.push(`${emptyHeadings.length} empty heading(s) found`);
    }

    // Check for skipped heading levels
    for (let i = 1; i < headingArray.length; i++) {
      const currentLevel = parseInt(headingArray[i].tagName.substring(1));
      const previousLevel = parseInt(headingArray[i - 1].tagName.substring(1));
      
      if (currentLevel > previousLevel + 1) {
        issues.push(`Heading level skipped: ${headingArray[i - 1].tagName} followed by ${headingArray[i].tagName}`);
      }
    }

    // Check for very long headings
    const longHeadings = headingArray.filter(h => h.textContent.trim().length > 70);
    if (longHeadings.length > 0) {
      issues.push(`${longHeadings.length} heading(s) are very long (>70 characters)`);
    }

    // Check for very short headings (but not empty)
    const shortHeadings = headingArray.filter(h => {
      const text = h.textContent.trim();
      return text.length > 0 && text.length < 10;
    });
    if (shortHeadings.length > 0) {
      issues.push(`${shortHeadings.length} heading(s) are very short (<10 characters)`);
    }

    return issues;
  }

  /**
   * Find parent heading for a given heading
   * @param {NodeList} headings - All headings
   * @param {number} currentIndex - Current heading index
   * @param {number} currentLevel - Current heading level
   * @returns {Object|null} Parent heading info
   * @private
   */
  _findParentHeading(headings, currentIndex, currentLevel) {
    for (let i = currentIndex - 1; i >= 0; i--) {
      const level = parseInt(headings[i].tagName.substring(1));
      if (level < currentLevel) {
        return {
          level,
          text: headings[i].textContent.trim(),
          order: i + 1
        };
      }
    }
    return null;
  }

  /**
   * Find child headings for a given heading
   * @param {NodeList} headings - All headings
   * @param {number} currentIndex - Current heading index
   * @param {number} currentLevel - Current heading level
   * @returns {Array} Array of child heading info
   * @private
   */
  _findChildHeadings(headings, currentIndex, currentLevel) {
    const children = [];
    
    for (let i = currentIndex + 1; i < headings.length; i++) {
      const level = parseInt(headings[i].tagName.substring(1));
      
      // Stop if we reach a heading at the same level or higher
      if (level <= currentLevel) {
        break;
      }
      
      // Only include direct children (next level down)
      if (level === currentLevel + 1) {
        children.push({
          level,
          text: headings[i].textContent.trim(),
          order: i + 1
        });
      }
    }
    
    return children;
  }

  /**
   * Extract element attributes
   * @param {Element} element - Heading element
   * @returns {Object} Element attributes
   * @private
   */
  _extractAttributes(element) {
    const attributes = {};
    
    // Common attributes to extract
    const importantAttributes = ['id', 'class', 'title', 'data-*'];
    
    Array.from(element.attributes).forEach(attr => {
      const name = attr.name;
      const value = attr.value;
      
      // Include specific attributes
      if (importantAttributes.includes(name) || name.startsWith('data-')) {
        attributes[name] = value;
      }
    });

    return attributes;
  }

  /**
   * Extract basic keywords from heading text
   * @param {string} text - Heading text
   * @returns {Object} Keyword analysis
   * @private
   */
  _extractKeywords(text) {
    if (!text || text.trim().length === 0) {
      return { words: [], count: 0 };
    }

    // Basic keyword extraction (words longer than 2 characters)
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !this._isStopWord(word));

    return {
      words,
      count: words.length,
      unique: [...new Set(words)],
      uniqueCount: [...new Set(words)].length
    };
  }

  /**
   * Check if a word is a stop word
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
   * Calculate structure metrics
   * @param {Array} structure - Heading structure
   * @returns {Object} Structure metrics
   * @private
   */
  _calculateStructureMetrics(structure) {
    if (structure.length === 0) {
      return {
        depth: 0,
        maxDepth: 0,
        avgLength: 0,
        totalLength: 0
      };
    }

    const levels = structure.map(h => h.level);
    const lengths = structure.map(h => h.length);
    
    return {
      depth: Math.max(...levels) - Math.min(...levels) + 1,
      maxDepth: Math.max(...levels),
      minDepth: Math.min(...levels),
      avgLength: Math.round(lengths.reduce((sum, len) => sum + len, 0) / lengths.length),
      totalLength: lengths.reduce((sum, len) => sum + len, 0),
      distribution: this._calculateLevelDistribution(structure)
    };
  }

  /**
   * Calculate heading level distribution
   * @param {Array} structure - Heading structure
   * @returns {Object} Level distribution
   * @private
   */
  _calculateLevelDistribution(structure) {
    const distribution = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
    
    structure.forEach(heading => {
      const key = `h${heading.level}`;
      if (distribution[key] !== undefined) {
        distribution[key]++;
      }
    });

    return distribution;
  }

  /**
   * Calculate detection statistics
   * @param {Object} headings - Heading detection results
   * @returns {Object} Statistics
   * @private
   */
  _calculateStatistics(headings) {
    const stats = {
      total: headings.all.length,
      byLevel: {
        h1: headings.h1.length,
        h2: headings.h2.length,
        h3: headings.h3.length,
        h4: headings.h4.length,
        h5: headings.h5.length,
        h6: headings.h6.length
      },
      empty: headings.all.filter(h => h.isEmpty).length,
      nonEmpty: headings.all.filter(h => !h.isEmpty).length,
      avgLength: 0,
      maxLength: 0,
      minLength: 0
    };

    if (stats.nonEmpty > 0) {
      const nonEmptyHeadings = headings.all.filter(h => !h.isEmpty);
      const lengths = nonEmptyHeadings.map(h => h.length);
      
      stats.avgLength = Math.round(lengths.reduce((sum, len) => sum + len, 0) / lengths.length);
      stats.maxLength = Math.max(...lengths);
      stats.minLength = Math.min(...lengths);
    }

    return stats;
  }
}

export default HeadingDetector;
