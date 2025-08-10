/**
 * Analyzer Registry
 * 
 * Central registry for managing all analyzers in the system.
 * Provides discovery, instantiation, and lifecycle management.
 */

import { AnalyzerUtils, AnalyzerCategories } from './AnalyzerInterface.js';

export class AnalyzerRegistry {
  constructor() {
    this.analyzers = new Map();
    this.categories = new Map();
    this.instances = new Map();
  }

  /**
   * Register an analyzer class
   * @param {string} name - Analyzer name
   * @param {Class} AnalyzerClass - Analyzer class
   * @param {Object} metadata - Analyzer metadata
   */
  register(name, AnalyzerClass, metadata = {}) {
    if (this.analyzers.has(name)) {
      throw new Error(`Analyzer ${name} is already registered`);
    }

    // Validate analyzer class
    const tempInstance = new AnalyzerClass();
    AnalyzerUtils.validateInterface(tempInstance);

    const analyzerInfo = {
      name,
      class: AnalyzerClass,
      metadata: {
        category: AnalyzerCategories.GENERAL,
        priority: 'medium',
        version: '1.0.0',
        ...metadata
      },
      registered: new Date().toISOString()
    };

    this.analyzers.set(name, analyzerInfo);

    // Index by category
    const category = analyzerInfo.metadata.category;
    if (!this.categories.has(category)) {
      this.categories.set(category, new Set());
    }
    this.categories.get(category).add(name);

    console.log(`✅ Registered analyzer: ${name} (${category})`);
  }

  /**
   * Unregister an analyzer
   * @param {string} name - Analyzer name
   */
  unregister(name) {
    const analyzerInfo = this.analyzers.get(name);
    if (!analyzerInfo) {
      throw new Error(`Analyzer ${name} is not registered`);
    }

    // Remove from category index
    const category = analyzerInfo.metadata.category;
    if (this.categories.has(category)) {
      this.categories.get(category).delete(name);
      if (this.categories.get(category).size === 0) {
        this.categories.delete(category);
      }
    }

    // Remove instance if exists
    if (this.instances.has(name)) {
      this.instances.delete(name);
    }

    this.analyzers.delete(name);
    console.log(`🗑️ Unregistered analyzer: ${name}`);
  }

  /**
   * Get analyzer instance (creates if doesn't exist)
   * @param {string} name - Analyzer name
   * @param {Object} options - Analyzer options
   * @returns {Object} Analyzer instance
   */
  getInstance(name, options = {}) {
    const analyzerInfo = this.analyzers.get(name);
    if (!analyzerInfo) {
      throw new Error(`Analyzer ${name} is not registered`);
    }

    // Return existing instance if available and no new options
    const instanceKey = `${name}-${JSON.stringify(options)}`;
    if (this.instances.has(instanceKey)) {
      return this.instances.get(instanceKey);
    }

    // Create new instance
    const instance = new analyzerInfo.class(options);
    this.instances.set(instanceKey, instance);
    
    return instance;
  }

  /**
   * Get all analyzers by category
   * @param {string} category - Category name
   * @returns {Array} Array of analyzer names
   */
  getByCategory(category) {
    return Array.from(this.categories.get(category) || []);
  }

  /**
   * Get all registered analyzer names
   * @returns {Array} Array of analyzer names
   */
  getAll() {
    return Array.from(this.analyzers.keys());
  }

  /**
   * Get analyzer metadata
   * @param {string} name - Analyzer name
   * @returns {Object} Analyzer metadata
   */
  getMetadata(name) {
    const analyzerInfo = this.analyzers.get(name);
    if (!analyzerInfo) {
      throw new Error(`Analyzer ${name} is not registered`);
    }
    return analyzerInfo.metadata;
  }

  /**
   * Check if analyzer is registered
   * @param {string} name - Analyzer name
   * @returns {boolean} True if registered
   */
  isRegistered(name) {
    return this.analyzers.has(name);
  }

  /**
   * Get all categories
   * @returns {Array} Array of category names
   */
  getCategories() {
    return Array.from(this.categories.keys());
  }

  /**
   * Run multiple analyzers
   * @param {Array} analyzerNames - Array of analyzer names
   * @param {Document} document - DOM document
   * @param {Object} pageData - Page data
   * @param {string} url - Page URL
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Combined results
   */
  async runAnalyzers(analyzerNames, document, pageData, url, options = {}) {
    const results = {};
    const errors = {};
    const parallel = options.parallel !== false; // Default to parallel

    const runSingleAnalyzer = async (name) => {
      try {
        const analyzer = this.getInstance(name, options[name] || {});
        const startTime = Date.now();
        
        // Use modern context-based calling format
        const context = {
          document,
          url,
          pageData
        };
        const result = await analyzer.analyze(context);
        const endTime = Date.now();
        
        return {
          ...result,
          analysisTime: endTime - startTime,
          analyzer: name
        };
      } catch (error) {
        errors[name] = AnalyzerUtils.createErrorResponse(name, error);
        return null;
      }
    };

    if (parallel) {
      // Run analyzers in parallel
      const promises = analyzerNames.map(name => runSingleAnalyzer(name));
      const analysisResults = await Promise.allSettled(promises);
      
      analysisResults.forEach((result, index) => {
        const name = analyzerNames[index];
        if (result.status === 'fulfilled' && result.value) {
          results[name] = result.value;
        } else if (result.status === 'rejected') {
          errors[name] = AnalyzerUtils.createErrorResponse(name, result.reason);
        }
      });
    } else {
      // Run analyzers sequentially
      for (const name of analyzerNames) {
        const result = await runSingleAnalyzer(name);
        if (result) {
          results[name] = result;
        }
      }
    }

    return {
      results,
      errors,
      totalAnalyzers: analyzerNames.length,
      successfulAnalyzers: Object.keys(results).length,
      failedAnalyzers: Object.keys(errors).length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get registry statistics
   * @returns {Object} Registry statistics
   */
  getStats() {
    const stats = {
      totalAnalyzers: this.analyzers.size,
      totalInstances: this.instances.size,
      categories: {}
    };

    for (const [category, analyzers] of this.categories) {
      stats.categories[category] = analyzers.size;
    }

    return stats;
  }

  /**
   * Clear all instances (for testing/cleanup)
   */
  clearInstances() {
    this.instances.clear();
  }

  /**
   * Reset registry (for testing)
   */
  reset() {
    this.analyzers.clear();
    this.categories.clear();
    this.instances.clear();
  }
}

// Create singleton instance
export const analyzerRegistry = new AnalyzerRegistry();
