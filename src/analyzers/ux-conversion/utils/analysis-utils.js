/**
 * ============================================================================
 * UX ANALYSIS UTILITIES - SHARED OPTIMIZATION HELPERS
 * ============================================================================
 * 
 * Shared utilities for performance optimization, code reuse, and common
 * analysis patterns across all UX detectors.
 * 
 * @version 2.0.0
 * @author Development Team
 * @phase Advanced UX & Conversion Analysis - Optimization
 */

/**
 * Performance optimization utilities
 */
export class UXPerformanceUtils {
  /**
   * Execute DOM queries in parallel for better performance
   * @param {Object} page - Playwright page object
   * @param {Array} selectors - Array of selectors to query
   * @returns {Promise<Map>} Map of selector to elements
   */
  static async parallelQuery(page, selectors) {
    const queries = selectors.map(async (selector) => {
      try {
        const elements = await page.$$(selector);
        return { selector, elements, success: true };
      } catch (error) {
        return { selector, elements: [], success: false, error: error.message };
      }
    });

    const results = await Promise.all(queries);
    const elementMap = new Map();
    
    results.forEach(result => {
      elementMap.set(result.selector, {
        elements: result.elements,
        success: result.success,
        error: result.error
      });
    });

    return elementMap;
  }

  /**
   * Batch element analysis to reduce page evaluation calls
   * @param {Object} page - Playwright page object
   * @param {Array} elements - Elements to analyze
   * @param {Function} analysisFunction - Function to run for each element
   * @returns {Promise<Array>} Analysis results
   */
  static async batchElementAnalysis(page, elements, analysisFunction) {
    // Process elements in chunks to avoid overwhelming the page
    const chunkSize = 10;
    const chunks = [];
    
    for (let i = 0; i < elements.length; i += chunkSize) {
      chunks.push(elements.slice(i, i + chunkSize));
    }

    const results = [];
    
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(element => analysisFunction(page, element));
      const chunkResults = await Promise.allSettled(chunkPromises);
      
      chunkResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            element: chunk[index],
            error: result.reason.message,
            analysisTime: Date.now()
          });
        }
      });
    }

    return results;
  }

  /**
   * Optimized element property extraction
   * @param {Object} page - Playwright page object
   * @param {Array} elements - Elements to extract properties from
   * @returns {Promise<Array>} Element properties
   */
  static async extractElementProperties(page, elements) {
    if (elements.length === 0) return [];

    return await page.evaluate((elementHandles) => {
      return elementHandles.map((el, index) => {
        if (!el) return null;

        try {
          const rect = el.getBoundingClientRect();
          const styles = window.getComputedStyle(el);
          
          return {
            index,
            tagName: el.tagName.toLowerCase(),
            text: el.textContent?.trim() || '',
            href: el.href || '',
            className: el.className || '',
            id: el.id || '',
            
            // Position and size
            boundingBox: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height
            },
            
            // Visibility
            isVisible: rect.width > 0 && rect.height > 0 && 
                      styles.visibility !== 'hidden' && 
                      styles.display !== 'none',
            
            // Styling
            styles: {
              backgroundColor: styles.backgroundColor,
              color: styles.color,
              fontSize: styles.fontSize,
              fontWeight: styles.fontWeight,
              padding: styles.padding,
              margin: styles.margin,
              border: styles.border,
              borderRadius: styles.borderRadius
            },
            
            // Attributes
            attributes: {
              type: el.type || el.getAttribute('type') || '',
              name: el.name || el.getAttribute('name') || '',
              placeholder: el.placeholder || el.getAttribute('placeholder') || '',
              'aria-label': el.getAttribute('aria-label') || '',
              role: el.getAttribute('role') || '',
              disabled: el.disabled || false,
              required: el.required || false
            }
          };
        } catch (error) {
          return { index, error: error.message };
        }
      }).filter(Boolean);
    }, elements);
  }

  /**
   * Debounced execution for frequent operations
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Memory-efficient array processing
   * @param {Array} array - Array to process
   * @param {Function} processor - Processing function
   * @param {number} chunkSize - Size of chunks to process
   * @returns {Promise<Array>} Processed results
   */
  static async processInChunks(array, processor, chunkSize = 5) {
    const results = [];
    
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(chunk.map(processor));
      results.push(...chunkResults);
      
      // Small delay to prevent overwhelming the browser
      if (i + chunkSize < array.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    return results;
  }
}

/**
 * Common analysis patterns
 */
export class UXAnalysisPatterns {
  /**
   * Standard element analysis workflow
   * @param {Object} page - Playwright page object
   * @param {Array} selectors - Selectors to query
   * @param {Function} validator - Element validation function
   * @param {Function} analyzer - Element analysis function
   * @returns {Promise<Array>} Analysis results
   */
  static async standardElementAnalysis(page, selectors, validator, analyzer) {
    // Parallel query for performance
    const elementMap = await UXPerformanceUtils.parallelQuery(page, selectors);
    const allElements = [];

    // Collect all elements
    for (const [selector, result] of elementMap) {
      if (result.success) {
        allElements.push(...result.elements);
      }
    }

    // Extract properties efficiently
    const elementProperties = await UXPerformanceUtils.extractElementProperties(page, allElements);
    
    // Filter valid elements
    const validElements = elementProperties.filter(validator);
    
    // Analyze elements in batches
    return await UXPerformanceUtils.batchElementAnalysis(page, validElements, analyzer);
  }

  /**
   * Standard scoring calculation
   * @param {Object} element - Element to score
   * @param {Object} criteria - Scoring criteria
   * @returns {Object} Scoring results
   */
  static calculateStandardScore(element, criteria) {
    const scores = {};
    let totalWeight = 0;
    let totalScore = 0;

    Object.entries(criteria).forEach(([category, config]) => {
      const { weight, calculator } = config;
      const score = calculator(element);
      
      scores[category] = score;
      totalScore += score * weight;
      totalWeight += weight;
    });

    scores.overall = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    return scores;
  }

  /**
   * Standard recommendation generation
   * @param {Object} element - Element to generate recommendations for
   * @param {Array} rules - Recommendation rules
   * @returns {Array} Generated recommendations
   */
  static generateStandardRecommendations(element, rules) {
    const recommendations = [];

    rules.forEach(rule => {
      const { condition, recommendation } = rule;
      
      if (condition(element)) {
        recommendations.push({
          priority: recommendation.priority || 'medium',
          impact: recommendation.impact || 'medium',
          category: recommendation.category || 'General',
          title: recommendation.title,
          description: recommendation.description,
          details: recommendation.details,
          effort: recommendation.effort || 'medium'
        });
      }
    });

    return recommendations;
  }
}

/**
 * Common scoring utilities
 */
export class UXScoringUtils {
  /**
   * Calculate contrast ratio between two colors
   * @param {string} color1 - First color
   * @param {string} color2 - Second color
   * @returns {number} Contrast ratio
   */
  static calculateContrastRatio(color1, color2) {
    const getLuminance = (color) => {
      if (!color || color === 'rgba(0, 0, 0, 0)') return 0.5;
      
      const rgb = color.match(/\d+/g);
      if (!rgb || rgb.length < 3) return 0.5;
      
      const [r, g, b] = rgb.map(c => {
        const value = parseInt(c) / 255;
        return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const lightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (lightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Check if element meets touch target requirements
   * @param {Object} boundingBox - Element bounding box
   * @param {number} minSize - Minimum target size
   * @returns {boolean} Whether element meets requirements
   */
  static isTouchFriendly(boundingBox, minSize = 44) {
    return boundingBox && 
           boundingBox.width >= minSize && 
           boundingBox.height >= minSize;
  }

  /**
   * Calculate element visibility score
   * @param {Object} element - Element to check
   * @param {Object} viewport - Viewport dimensions
   * @returns {number} Visibility score (0-100)
   */
  static calculateVisibilityScore(element, viewport) {
    if (!element.isVisible || !element.boundingBox) return 0;

    let score = 50; // Base visibility score
    const box = element.boundingBox;

    // Above the fold bonus
    if (box.y + box.height < viewport.height) score += 30;
    
    // Size visibility bonus
    if (box.width > 100 && box.height > 30) score += 20;
    
    return Math.min(score, 100);
  }

  /**
   * Normalize score to 0-100 range
   * @param {number} score - Raw score
   * @param {number} max - Maximum possible score
   * @returns {number} Normalized score
   */
  static normalizeScore(score, max) {
    return Math.max(0, Math.min(100, Math.round((score / max) * 100)));
  }
}

/**
 * Recommendation utilities
 */
export class UXRecommendationUtils {
  /**
   * Priority levels for recommendations
   */
  static PRIORITIES = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
  };

  /**
   * Impact levels for recommendations
   */
  static IMPACTS = {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
  };

  /**
   * Effort levels for recommendations
   */
  static EFFORTS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
  };

  /**
   * Sort recommendations by priority and impact
   * @param {Array} recommendations - Recommendations to sort
   * @returns {Array} Sorted recommendations
   */
  static sortRecommendations(recommendations) {
    const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
    const impactWeight = { high: 3, medium: 2, low: 1 };

    return recommendations.sort((a, b) => {
      const scoreA = (priorityWeight[a.priority] || 1) * (impactWeight[a.impact] || 1);
      const scoreB = (priorityWeight[b.priority] || 1) * (impactWeight[b.impact] || 1);
      
      return scoreB - scoreA;
    });
  }

  /**
   * Group recommendations by category
   * @param {Array} recommendations - Recommendations to group
   * @returns {Object} Grouped recommendations
   */
  static groupRecommendations(recommendations) {
    return recommendations.reduce((groups, rec) => {
      const category = rec.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(rec);
      return groups;
    }, {});
  }

  /**
   * Create a standardized recommendation
   * @param {Object} config - Recommendation configuration
   * @returns {Object} Standardized recommendation
   */
  static createRecommendation(config) {
    return {
      priority: config.priority || this.PRIORITIES.MEDIUM,
      impact: config.impact || this.IMPACTS.MEDIUM,
      category: config.category || 'General',
      title: config.title,
      description: config.description,
      details: config.details || '',
      effort: config.effort || this.EFFORTS.MEDIUM,
      timestamp: Date.now()
    };
  }
}

/**
 * Error handling utilities
 */
export class UXErrorUtils {
  /**
   * Safe execution wrapper
   * @param {Function} func - Function to execute safely
   * @param {*} fallback - Fallback value if function fails
   * @param {string} context - Context for error logging
   * @returns {*} Function result or fallback
   */
  static async safeExecute(func, fallback = null, context = 'Unknown') {
    try {
      return await func();
    } catch (error) {
      console.warn(`Safe execution failed in ${context}:`, error.message);
      return fallback;
    }
  }

  /**
   * Validate element before analysis
   * @param {Object} element - Element to validate
   * @returns {boolean} Whether element is valid
   */
  static isValidElement(element) {
    return element && 
           element.boundingBox && 
           element.boundingBox.width > 0 && 
           element.boundingBox.height > 0 &&
           element.isVisible;
  }

  /**
   * Create error info object
   * @param {Error} error - Error object
   * @param {string} context - Context where error occurred
   * @returns {Object} Error info
   */
  static createErrorInfo(error, context) {
    return {
      message: error.message,
      context,
      timestamp: Date.now(),
      stack: error.stack?.split('\n').slice(0, 3) // Limit stack trace
    };
  }
}

export default {
  UXPerformanceUtils,
  UXAnalysisPatterns,
  UXScoringUtils,
  UXRecommendationUtils,
  UXErrorUtils
};
