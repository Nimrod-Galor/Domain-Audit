/**
 * ============================================================================
 * UX DETECTOR FACTORY - OPTIMIZED INSTANTIATION
 * ============================================================================
 * 
 * Factory pattern for creating and managing UX detectors with proper
 * dependency injection and shared utilities.
 * 
 * @version 2.0.0
 * @author Development Team
 * @phase Advanced UX & Conversion Analysis - Optimization
 */

import { UXPerformanceUtils, UXAnalysisPatterns, UXScoringUtils, UXRecommendationUtils } from '../utils/analysis-utils.js';
import { UX_STANDARDS, INDUSTRY_WEIGHTS } from '../config/ux-standards.js';

// Detector imports
import { SearchDetector } from '../detectors/search-detector.js';
import { FormDetector } from '../detectors/form-detector.js';
import { CTADetector } from '../detectors/cta-detector.js';
import { ErrorPageDetector } from '../detectors/error-page-detector.js';

/**
 * Shared context and utilities for all detectors
 */
class UXDetectorContext {
  constructor(industryType = 'generic') {
    this.industryType = industryType;
    this.standards = UX_STANDARDS;
    this.industryWeights = INDUSTRY_WEIGHTS[industryType] || INDUSTRY_WEIGHTS.generic;
    this.utils = {
      performance: UXPerformanceUtils,
      patterns: UXAnalysisPatterns,
      scoring: UXScoringUtils,
      recommendations: UXRecommendationUtils
    };
    
    this.cache = new Map();
    this.analysisTime = Date.now();
  }

  /**
   * Get cached result or execute function
   * @param {string} key - Cache key
   * @param {Function} func - Function to execute if not cached
   * @returns {*} Cached or computed result
   */
  async getCached(key, func) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    const result = await func();
    this.cache.set(key, result);
    return result;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

/**
 * Factory for creating UX detectors with shared context
 */
export class UXDetectorFactory {
  constructor() {
    this.detectorClasses = new Map([
      ['search', SearchDetector],
      ['form', FormDetector],
      ['cta', CTADetector],
      ['errorPage', ErrorPageDetector]
    ]);
    
    this.detectorInstances = new Map();
  }

  /**
   * Create a detector with shared context
   * @param {string} detectorType - Type of detector to create
   * @param {Object} context - Shared context
   * @returns {Object} Detector instance
   */
  createDetector(detectorType, context) {
    const DetectorClass = this.detectorClasses.get(detectorType);
    
    if (!DetectorClass) {
      throw new Error(`Unknown detector type: ${detectorType}`);
    }

    // Create instance with shared context
    const detector = new DetectorClass();
    
    // Inject shared utilities and context
    detector.context = context;
    detector.utils = context.utils;
    detector.standards = context.standards;
    detector.industryWeights = context.industryWeights;
    
    return detector;
  }

  /**
   * Create all detectors for analysis
   * @param {string} industryType - Industry type for configuration
   * @returns {Object} All detector instances
   */
  createDetectorSuite(industryType = 'generic') {
    const context = new UXDetectorContext(industryType);
    const detectors = {};

    for (const [type, DetectorClass] of this.detectorClasses) {
      detectors[type] = this.createDetector(type, context);
    }

    return { detectors, context };
  }

  /**
   * Register a new detector type
   * @param {string} type - Detector type name
   * @param {Class} DetectorClass - Detector class
   */
  registerDetector(type, DetectorClass) {
    this.detectorClasses.set(type, DetectorClass);
  }

  /**
   * Get available detector types
   * @returns {Array} Available detector types
   */
  getAvailableDetectors() {
    return Array.from(this.detectorClasses.keys());
  }
}

/**
 * Base detector class with optimization helpers
 */
export class OptimizedBaseDetector {
  constructor() {
    this.name = this.constructor.name;
    this.version = '2.0.0';
    this.context = null;
    this.utils = null;
    this.standards = null;
    this.industryWeights = null;
  }

  /**
   * Optimized analysis workflow
   * @param {Object} page - Playwright page object
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis results
   */
  async analyze(page, options = {}) {
    const startTime = Date.now();
    
    try {
      // Get selectors for this detector
      const selectors = this.getSelectors();
      
      // Use optimized element analysis pattern
      const elements = await this.utils.patterns.standardElementAnalysis(
        page,
        selectors,
        this.validateElement.bind(this),
        this.analyzeElement.bind(this)
      );

      // Calculate scores using standard patterns
      const scores = this.calculateScores(elements);
      
      // Generate recommendations using standard patterns
      const recommendations = this.generateRecommendations(elements);
      
      const analysisTime = Date.now() - startTime;
      
      return {
        detector: this.name,
        version: this.version,
        analysisTime,
        elementsFound: elements.length,
        scores,
        recommendations,
        details: elements,
        metadata: {
          industryType: this.context?.industryType,
          timestamp: Date.now()
        }
      };
      
    } catch (error) {
      return {
        detector: this.name,
        error: error.message,
        analysisTime: Date.now() - startTime,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get selectors for element detection (override in subclasses)
   * @returns {Array} CSS selectors
   */
  getSelectors() {
    return [];
  }

  /**
   * Validate element for analysis (override in subclasses)
   * @param {Object} element - Element to validate
   * @returns {boolean} Whether element is valid
   */
  validateElement(element) {
    return this.utils.errors.isValidElement(element);
  }

  /**
   * Analyze individual element (override in subclasses)
   * @param {Object} page - Playwright page object
   * @param {Object} element - Element to analyze
   * @returns {Promise<Object>} Element analysis
   */
  async analyzeElement(page, element) {
    return { element, analyzed: true };
  }

  /**
   * Calculate scores for elements (override in subclasses)
   * @param {Array} elements - Analyzed elements
   * @returns {Object} Score breakdown
   */
  calculateScores(elements) {
    return { overall: 0, breakdown: {} };
  }

  /**
   * Generate recommendations (override in subclasses)
   * @param {Array} elements - Analyzed elements
   * @returns {Array} Recommendations
   */
  generateRecommendations(elements) {
    return [];
  }

  /**
   * Apply industry weights to scores
   * @param {Object} scores - Raw scores
   * @returns {Object} Weighted scores
   */
  applyIndustryWeights(scores) {
    if (!this.industryWeights) return scores;

    const weighted = { ...scores };
    
    Object.keys(weighted).forEach(key => {
      if (typeof weighted[key] === 'number' && this.industryWeights[key]) {
        weighted[key] = Math.round(weighted[key] * this.industryWeights[key]);
      }
    });

    return weighted;
  }

  /**
   * Get industry-specific recommendations
   * @param {Array} baseRecommendations - Base recommendations
   * @returns {Array} Industry-adjusted recommendations
   */
  getIndustryRecommendations(baseRecommendations) {
    if (!this.context?.industryType || this.context.industryType === 'generic') {
      return baseRecommendations;
    }

    // Apply industry-specific priority adjustments
    return baseRecommendations.map(rec => {
      const adjusted = { ...rec };
      
      // Adjust priority based on industry type
      switch (this.context.industryType) {
        case 'ecommerce':
          if (rec.category === 'Conversion' || rec.category === 'CTA') {
            adjusted.priority = this.increasePriority(rec.priority);
          }
          break;
          
        case 'healthcare':
          if (rec.category === 'Accessibility' || rec.category === 'Error Handling') {
            adjusted.priority = this.increasePriority(rec.priority);
          }
          break;
          
        case 'government':
          if (rec.category === 'Accessibility') {
            adjusted.priority = 'critical';
          }
          break;
      }
      
      return adjusted;
    });
  }

  /**
   * Increase priority level
   * @param {string} currentPriority - Current priority
   * @returns {string} Increased priority
   */
  increasePriority(currentPriority) {
    const priorities = ['low', 'medium', 'high', 'critical'];
    const currentIndex = priorities.indexOf(currentPriority);
    return priorities[Math.min(currentIndex + 1, priorities.length - 1)];
  }
}

// Export singleton factory instance
export const detectorFactory = new UXDetectorFactory();

export default {
  UXDetectorFactory,
  OptimizedBaseDetector,
  UXDetectorContext,
  detectorFactory
};
