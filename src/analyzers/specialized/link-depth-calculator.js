/**
 * ============================================================================
 * LINK DEPTH CALCULATOR - Combined Approach Implementation
 * ============================================================================
 * 
 * Main Link Depth Calculator implementing the Combined Approach pattern.
 * This file serves as the entry point and orchestrates the modern
 * Link Depth Calculator implementation.
 * 
 * Features:
 * - GPT-5 Style Modular Components (Depth Analysis, Site Architecture, Link Graph)
 * - GPT-5 Style Heuristics and Rules (Depth Calculation, Navigation Analysis)
 * - Claude Style AI Enhancement (Architecture Intelligence, Navigation Optimization)
 * - Integration with Existing Components
 * - Comprehensive Site Architecture Analysis
 * - Advanced Link Depth Calculation
 * - Navigation Hierarchy Analysis
 * - Page Importance Assessment
 * - Site Structure Optimization
 * 
 * @module LinkDepthCalculator
 * @version 2.0.0
 * @author AI Assistant (Combined Approach)
 * @created 2025-01-09
 */

// Import the modern Combined Approach implementation
import { LinkDepthCalculatorModern } from './link-depth-calculator-modern.js';

/**
 * Link Depth Calculator Class
 * 
 * Bridges to the modern Combined Approach implementation while maintaining compatibility.
 * Implementation #60 in the Combined Approach modernization series.
 */
export class LinkDepthCalculator extends LinkDepthCalculatorModern {
  constructor(options = {}) {
    super(options);
    
    // Override name for consistency
    this.name = 'LinkDepthCalculator';
    
    console.log('📊 Link Depth Calculator initialized with Combined Approach');
    console.log('🏗️ Architecture: Combined Approach (60th Implementation - COMPLETE)');
  }
}

// Export as default for compatibility
export default LinkDepthCalculator;

// Legacy exports for backwards compatibility
export const linkDepthCalculator = new LinkDepthCalculator();

// Export legacy configuration patterns for compatibility
export const DEPTH_CONFIG = {
  // Depth thresholds for analysis
  THRESHOLDS: {
    SHALLOW: 2,         // 0-2 clicks from home
    MEDIUM: 3,          // 3 clicks from home
    DEEP: 4,            // 4-5 clicks from home
    VERY_DEEP: 6        // 6+ clicks from home
  },

  // Page importance indicators
  IMPORTANCE_SIGNALS: {
    IN_MAIN_NAV: 50,        // Page linked from main navigation
    IN_FOOTER: 10,          // Page linked from footer
    MANY_INTERNAL_LINKS: 30, // Page has many incoming links
    HIGH_QUALITY_BACKLINKS: 40, // Page has quality external links
    CONVERSION_PAGE: 60,     // Product, service, or contact page
    CONTENT_HUB: 35         // Blog index, category pages
  },

  // URL patterns for page type detection
  URL_PATTERNS: {
    HOMEPAGE: [/^\/$/, /^\/index\.(html?|php)$/i, /^\/home$/i],
    PRODUCT: [/\/product/i, /\/item/i, /\/shop/i, /\/buy/i],
    CATEGORY: [/\/category/i, /\/collection/i, /\/series/i],
    BLOG: [/\/blog/i, /\/news/i, /\/article/i, /\/post/i],
    CONTACT: [/\/contact/i, /\/get-in-touch/i, /\/reach-us/i],
    ABOUT: [/\/about/i, /\/company/i, /\/team/i],
    LEGAL: [/\/privacy/i, /\/terms/i, /\/legal/i, /\/policy/i]
  },

  // Analysis parameters
  ANALYSIS: {
    MAX_CRAWL_DEPTH: 10,
    MIN_INTERNAL_LINKS: 1,
    OPTIMAL_DEPTH_RANGE: [2, 4],
    IMPORTANCE_THRESHOLD: 0.3
  }
};
