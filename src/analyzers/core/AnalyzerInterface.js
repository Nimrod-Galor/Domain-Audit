/**
 * Analyzer Interface Definition
 * 
 * Defines the standard interface that all analyzers must implement.
 */

/**
 * Standard analyzer interface
 */
export const AnalyzerInterface = {
  /**
   * Initialize analyzer with options
   * @param {Object} options - Configuration options
   */
  constructor: (options = {}) => {},

  /**
   * Perform analysis on provided data
   * @param {Document} document - DOM document to analyze
   * @param {Object} pageData - Additional page data
   * @param {string} url - Page URL
   * @returns {Promise<Object>} Analysis results
   */
  analyze: async (document, pageData, url) => {},

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata: () => {},

  /**
   * Validate analyzer configuration
   * @returns {boolean} True if configuration is valid
   */
  validate: () => {}
};

/**
 * Standard analysis result structure
 */
export const AnalysisResultSchema = {
  // Core fields
  success: Boolean,
  timestamp: String,
  analyzer: String,
  analysisTime: Number,

  // Data fields (vary by analyzer)
  data: Object,

  // Optional error fields
  error: String,
  context: String,

  // Optional metadata
  metadata: Object,
  recommendations: Array,
  score: Number,
  grade: String
};

/**
 * Analyzer categories
 */
export const AnalyzerCategories = {
  PERFORMANCE: 'performance',
  SEO: 'seo',
  ACCESSIBILITY: 'accessibility',
  SECURITY: 'security',
  CONTENT: 'content',
  TECHNICAL: 'technical',
  LINKS: 'links',
  BUSINESS_INTELLIGENCE: 'business-intelligence',
  ECOMMERCE: 'ecommerce',
  CLASSIFICATION: 'classification',
  THIRD_PARTY: 'third-party'
};

/**
 * Analysis priority levels
 */
export const AnalysisPriority = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

/**
 * Utility functions for analyzer development
 */
export const AnalyzerUtils = {
  /**
   * Validate that an object implements the analyzer interface
   * @param {Object} analyzer - Analyzer to validate
   * @returns {boolean} True if valid
   */
  validateInterface(analyzer) {
    const requiredMethods = ['analyze', 'getMetadata', 'validate'];
    
    for (const method of requiredMethods) {
      if (typeof analyzer[method] !== 'function') {
        throw new Error(`Analyzer must implement ${method}() method`);
      }
    }
    
    return true;
  },

  /**
   * Create standardized error response
   * @param {string} analyzer - Analyzer name
   * @param {Error} error - Error object
   * @param {string} context - Error context
   * @returns {Object} Error response
   */
  createErrorResponse(analyzer, error, context = 'analysis') {
    return {
      success: false,
      error: `${analyzer} ${context} failed: ${error.message}`,
      timestamp: new Date().toISOString(),
      analyzer,
      context,
      analysisTime: 0
    };
  },

  /**
   * Create standardized success response
   * @param {string} analyzer - Analyzer name
   * @param {Object} data - Analysis data
   * @param {number} analysisTime - Analysis time in ms
   * @returns {Object} Success response
   */
  createSuccessResponse(analyzer, data, analysisTime = 0) {
    return {
      success: true,
      timestamp: new Date().toISOString(),
      analyzer,
      analysisTime,
      ...data
    };
  }
};
