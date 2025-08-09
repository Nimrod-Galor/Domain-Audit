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
   * @param {Document} document - DOM document
   * @param {Object} pageData - Page data object
   * @param {string} url - Page URL
   * @returns {Promise<Object>} Analysis results
   */
  async analyze(document, pageData, url) {
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
   * Validate analyzer configuration
   * @returns {boolean} True if valid
   */
  validate() {
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('Analyzer must have a valid name');
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
   * Handle errors gracefully
   * @param {Error} error - Error object
   * @param {string} context - Error context
   * @returns {Object} Standardized error response
   */
  handleError(error, context = 'analysis') {
    const errorMessage = `${this.name} ${context} failed: ${error.message}`;
    this.log('error', errorMessage, error);
    
    return {
      error: errorMessage,
      success: false,
      timestamp: new Date().toISOString(),
      analyzer: this.name,
      context
    };
  }

  /**
   * Create success response
   * @param {Object} data - Analysis data
   * @param {number} analysisTime - Time taken for analysis
   * @returns {Object} Standardized success response
   */
  createSuccessResponse(data, analysisTime = 0) {
    return {
      ...data,
      success: true,
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
}
