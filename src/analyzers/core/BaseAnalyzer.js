/**
 * Base Analyzer Class
 * 
 * Abstract base class that all analyzers must extend.
 * Provides common functionality and enforces consistent interface.
 */
export class BaseAnalyzer {
  constructor(name, options = {}) {
    if (this.constructor === BaseAnalyzer) {
      throw new Error('BaseAnalyzer is abstract and cannot be instantiated directly');
    }
    
    this.name = name;
    this.options = {
      timeout: 5000,
      retries: 3,
      enableLogging: false,
      ...options
    };
    
    this.metadata = {
      name: this.name,
      version: '1.0.0',
      description: 'Base analyzer implementation',
      category: 'general',
      ...this.getMetadata()
    };
  }

  /**
   * Main analysis method - must be implemented by subclasses
   * Supports both modern context format and legacy parameter format for backward compatibility
   * @param {Object|Document} contextOrDocument - Analysis context object or legacy document
   * @param {Object} [pageData] - Legacy page data parameter
   * @param {string} [url] - Legacy URL parameter
   * @returns {Promise<Object>} Analysis results
   */
  async analyze(contextOrDocument, pageData, url) {
    // Handle both modern and legacy calling formats
    let context;
    
    if (contextOrDocument && typeof contextOrDocument === 'object' && contextOrDocument.document) {
      // Modern format: analyze({document, url, pageData, options})
      context = contextOrDocument;
    } else if (contextOrDocument && contextOrDocument.nodeType === 9) {
      // Legacy format: analyze(document, pageData, url)
      context = {
        document: contextOrDocument,
        url: url || '',
        pageData: pageData || {},
        options: {}
      };
    } else {
      throw new Error('Invalid context provided - expected {document, url, pageData} or legacy (document, pageData, url)');
    }

    throw new Error('analyze() method must be implemented by subclass');
  }

  /**
   * Get analyzer metadata - should be overridden by subclasses
   * @returns {Object} Metadata object
   */
  getMetadata() {
    return {
      name: this.name,
      version: '1.0.0',
      description: 'Base analyzer implementation',
      category: 'general'
    };
  }

  /**
   * Validate analyzer configuration and context
   * @param {Object} [context] - Analysis context to validate
   * @returns {boolean} True if valid
   */
  validate(context = null) {
    // Validate analyzer configuration
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('Analyzer must have a valid name');
    }

    // Validate context if provided
    if (context) {
      if (typeof context !== 'object') {
        return false;
      }

      // Check for required document
      if (!context.document) {
        return false;
      }

      // Validate document is a proper DOM document
      if (typeof context.document !== 'object' || 
          (context.document.nodeType !== 9 && !context.document.querySelector)) {
        return false;
      }

      // Validate URL if provided
      if (context.url && typeof context.url !== 'string') {
        return false;
      }

      // Validate pageData if provided  
      if (context.pageData && typeof context.pageData !== 'object') {
        return false;
      }
    }

    return true;
  }

  /**
   * Log message if logging is enabled
   * @param {string} level - Log level (info, warn, error)
   * @param {string} message - Message to log
   * @param {*} data - Additional data
   */
  log(level, message, data = null) {
    if (this.options.enableLogging) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [${this.name}] [${level.toUpperCase()}] ${message}`;
      
      if (data) {
        console[level](logMessage, data);
      } else {
        console[level](logMessage);
      }
    }
  }

  /**
   * Handle errors gracefully with modern BaseAnalyzer response format
   * @param {Error} error - Error object
   * @param {string} context - Error context
   * @param {Object} [defaultData] - Default data to include in error response
   * @returns {Object} Standardized error response
   */
  handleError(error, context = 'analysis', defaultData = {}) {
    const errorMessage = error?.message || 'Unknown error occurred';
    const fullMessage = `${this.name} ${context} failed: ${errorMessage}`;
    
    this.log('error', fullMessage, error);
    
    return {
      success: false,
      error: fullMessage,
      data: defaultData,
      timestamp: new Date().toISOString(),
      analyzer: this.name,
      context,
      analysisTime: 0
    };
  }

  /**
   * Create success response with modern BaseAnalyzer format
   * @param {Object} responseData - Response data (either data object or full response)
   * @param {number} [analysisTime] - Time taken for analysis
   * @returns {Object} Standardized success response
   */
  createSuccessResponse(responseData, analysisTime = 0) {
    // If responseData already has the full structure, use it
    if (responseData.success !== undefined) {
      return {
        ...responseData,
        timestamp: responseData.timestamp || new Date().toISOString(),
        analyzer: responseData.analyzer || this.name,
        analysisTime: responseData.analysisTime || analysisTime
      };
    }

    // If responseData has a 'data' property, use modern nested format
    if (responseData.data !== undefined) {
      return {
        success: true,
        data: responseData.data,
        timestamp: new Date().toISOString(),
        analyzer: this.name,
        analysisTime
      };
    }

    // Otherwise, treat responseData as the data content
    return {
      success: true,
      data: responseData,
      timestamp: new Date().toISOString(),
      analyzer: this.name,
      analysisTime
    };
  }

  /**
   * Measure execution time of a function
   * @param {Function} fn - Function to measure
   * @returns {Promise<{result: *, time: number}>} Result and execution time
   */
  async measureTime(fn) {
    const startTime = Date.now();
    const result = await fn();
    const endTime = Date.now();
    return {
      result,
      time: endTime - startTime
    };
  }

  /**
   * Safe DOM query with error handling
   * @param {Document} document - DOM document
   * @param {string} selector - CSS selector
   * @returns {NodeList|Array} Query results or empty array
   */
  safeQuery(document, selector) {
    try {
      if (!document || !document.querySelectorAll) {
        return [];
      }
      return document.querySelectorAll(selector) || [];
    } catch (error) {
      this.log('warn', `Query failed for selector: ${selector}`, error);
      return [];
    }
  }

  /**
   * Safe DOM query for single element
   * @param {Document} document - DOM document
   * @param {string} selector - CSS selector
   * @returns {Element|null} Query result or null
   */
  safeQueryOne(document, selector) {
    try {
      if (!document || !document.querySelector) {
        return null;
      }
      return document.querySelector(selector);
    } catch (error) {
      this.log('warn', `Query failed for selector: ${selector}`, error);
      return null;
    }
  }

  /**
   * Extract context details from modern or legacy format
   * @param {Object|Document} contextOrDocument - Context object or legacy document
   * @param {Object} [pageData] - Legacy page data
   * @param {string} [url] - Legacy URL
   * @returns {Object} Normalized context object
   */
  extractContext(contextOrDocument, pageData, url) {
    if (contextOrDocument && typeof contextOrDocument === 'object' && contextOrDocument.document) {
      // Modern format
      return {
        document: contextOrDocument.document,
        url: contextOrDocument.url || '',
        pageData: contextOrDocument.pageData || {},
        options: contextOrDocument.options || {}
      };
    } else if (contextOrDocument && contextOrDocument.nodeType === 9) {
      // Legacy format
      return {
        document: contextOrDocument,
        url: url || '',
        pageData: pageData || {},
        options: {}
      };
    } else {
      throw new Error('Invalid context format provided');
    }
  }

  /**
   * Safely get text content from an element
   * @param {Element} element - DOM element
   * @returns {string} Text content or empty string
   */
  getTextContent(element) {
    try {
      return element?.textContent?.trim() || '';
    } catch (error) {
      this.log('warn', 'Failed to get text content', error);
      return '';
    }
  }

  /**
   * Safely get attribute value from an element
   * @param {Element} element - DOM element
   * @param {string} attribute - Attribute name
   * @returns {string} Attribute value or empty string
   */
  getAttribute(element, attribute) {
    try {
      return element?.getAttribute?.(attribute) || '';
    } catch (error) {
      this.log('warn', `Failed to get attribute: ${attribute}`, error);
      return '';
    }
  }

  /**
   * Calculate a score based on multiple criteria
   * @param {Array<{weight: number, score: number}>} criteria - Scoring criteria
   * @returns {number} Weighted score (0-100)
   */
  calculateWeightedScore(criteria) {
    try {
      if (!Array.isArray(criteria) || criteria.length === 0) {
        return 0;
      }

      const totalWeight = criteria.reduce((sum, item) => sum + (item.weight || 0), 0);
      if (totalWeight === 0) {
        return 0;
      }

      const weightedSum = criteria.reduce((sum, item) => {
        const score = Math.max(0, Math.min(100, item.score || 0));
        return sum + (score * (item.weight || 0));
      }, 0);

      return Math.round(weightedSum / totalWeight);
    } catch (error) {
      this.log('warn', 'Failed to calculate weighted score', error);
      return 0;
    }
  }

  /**
   * Convert score to letter grade
   * @param {number} score - Numeric score (0-100)
   * @returns {string} Letter grade (A-F)
   */
  scoreToGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Generate performance-based recommendations
   * @param {number} score - Current score
   * @param {Array<string>} recommendations - Specific recommendations
   * @returns {Array<string>} Prioritized recommendations
   */
  generateRecommendations(score, recommendations = []) {
    const prioritized = [...recommendations];

    // Add score-based recommendations
    if (score < 60) {
      prioritized.unshift('Critical improvements needed - focus on basic optimization');
    } else if (score < 80) {
      prioritized.unshift('Good foundation - target specific improvements');
    } else if (score < 90) {
      prioritized.unshift('Excellent performance - fine-tune for perfection');
    }

    return prioritized.slice(0, 10); // Limit to top 10 recommendations
  }
}
