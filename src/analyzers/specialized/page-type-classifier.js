/**
 * ============================================================================
 * PAGE TYPE CLASSIFIER - Combined Approach Implementation
 * ============================================================================
 * 
 * Main Page Type Classifier implementing the Combined Approach pattern.
 * This file serves as the entry point and orchestrates the modern
 * Page Type Classifier implementation.
 * 
 * Features:
 * - GPT-5 Style Modular Components (Content Analysis, Pattern Recognition, Semantic Classification)
 * - GPT-5 Style Heuristics and Rules (Page Type Detection, Content Intelligence)
 * - Claude Style AI Enhancement (Semantic Understanding, Context Analysis)
 * - Integration with Existing Components
 * - Comprehensive Page Type Classification
 * - Intelligent Content Pattern Recognition
 * - Semantic Page Analysis
 * - Structure-Based Classification
 * - Content Intelligence and Insights
 * 
 * @module PageTypeClassifier
 * @version 2.0.0
 * @author AI Assistant (Combined Approach)
 * @created 2025-01-09
 */

// Import the modern Combined Approach implementation
import { PageTypeClassifierModern } from './page-type-classifier-modern.js';

/**
 * Page Type Classifier Class
 * 
 * Bridges to the modern Combined Approach implementation while maintaining compatibility.
 * Implementation #61 in the Combined Approach modernization series.
 */
class PageTypeClassifier extends PageTypeClassifierModern {
  constructor(options = {}) {
    super(options);
    
    // Override name for consistency
    this.name = 'PageTypeClassifier';
    
    console.log('🏷️ Page Type Classifier initialized with Combined Approach');
    console.log('📊 Architecture: Combined Approach (61st Implementation - COMPLETE)');
  }
}

// Export as default for compatibility
export default PageTypeClassifier;

// Named export for direct import
export { PageTypeClassifier };

// Legacy exports for backwards compatibility
export const pageTypeClassifier = new PageTypeClassifier();

// Export legacy configuration patterns for compatibility
export const PAGE_CLASSIFICATION = {
  // Content patterns for different page types
  PATTERNS: {
    HOMEPAGE: {
      url: [/^\/$/, /^\/home/, /^\/index/, /^\/main/],
      title: [/home/i, /welcome/i, /main/i],
      content: [/welcome/i, /about us/i, /our services/i, /get started/i],
      structure: ['hero', 'navigation', 'features', 'testimonials'],
      weight: 1.0
    },
    
    PRODUCT: {
      url: [/\/product/, /\/item/, /\/shop/, /\/buy/],
      title: [/product/i, /item/i, /shop/i, /buy/i],
      content: [/price/i, /add to cart/i, /buy now/i, /purchase/i, /order/i],
      meta: ['product', 'ecommerce', 'price', 'sku'],
      structure: ['price', 'cart', 'reviews', 'specifications'],
      weight: 0.9
    },
    
    ARTICLE: {
      url: [/\/article/, /\/post/, /\/blog/, /\/news/, /\/\d{4}\/\d{2}/],
      title: [/article/i, /post/i, /blog/i, /news/i],
      content: [/published/i, /author/i, /read more/i, /share/i],
      meta: ['article', 'news', 'blog', 'published'],
      structure: ['article', 'author', 'date', 'social-share'],
      weight: 0.8
    },
    
    CATEGORY: {
      url: [/\/category/, /\/section/, /\/archive/, /\/tag/],
      title: [/category/i, /archive/i, /section/i],
      content: [/browse/i, /filter/i, /sort/i, /showing/i, /results/i],
      structure: ['pagination', 'filters', 'listing', 'breadcrumbs'],
      weight: 0.7
    },
    
    CONTACT: {
      url: [/\/contact/, /\/reach/, /\/support/],
      title: [/contact/i, /reach/i, /support/i],
      content: [/email/i, /phone/i, /address/i, /form/i, /message/i],
      structure: ['form', 'contact-info', 'map'],
      weight: 0.8
    }
  },
  
  // Classification thresholds
  THRESHOLDS: {
    HIGH_CONFIDENCE: 0.8,    // 80%+ confidence
    MEDIUM_CONFIDENCE: 0.6,  // 60%+ confidence
    LOW_CONFIDENCE: 0.4,     // 40%+ confidence
    MIN_CONFIDENCE: 0.2      // 20% minimum
  },
  
  // Scoring weights
  WEIGHTS: {
    URL_PATTERN: 0.3,        // 30% weight for URL patterns
    TITLE_CONTENT: 0.25,     // 25% weight for title content
    PAGE_CONTENT: 0.25,      // 25% weight for page content
    STRUCTURE: 0.2           // 20% weight for page structure
  }
};
