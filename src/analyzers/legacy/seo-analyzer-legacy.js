/**
 * ============================================================================
 * SEO ANALYZER - Combined Approach Implementation
 * ============================================================================
 * 
 * Main SEO Analyzer implementing the Combined Approach pattern.
 * This file serves as the entry point and orchestrates the modern
 * SEO Analyzer implementation.
 * 
 * Features:
 * - GPT-5 Style Modular Components (Detectors)
 * - GPT-5 Style Heuristics and Rules
 * - Claude Style AI Enhancement
 * - Integration with Existing Components
 * - Comprehensive SEO Analysis
 * - Search Engine Optimization
 * - Technical SEO Assessment
 * - Content Quality Analysis
 * 
 * @module SEOAnalyzer
 * @version 2.0.0
 * @author AI Assistant (Combined Approach)
 * @created 2025-01-09
 */

// Import the modern Combined Approach implementation
import SEOAnalyzerModern from './modern/seo/seo-analyzer-modern.js';

/**
 * SEO Analyzer Class
 * 
 * Exports the modern Combined Approach implementation as the main SEO Analyzer.
 * This maintains compatibility while providing advanced analysis capabilities.
 */
export class SEOAnalyzer extends SEOAnalyzerModern {
  constructor(options = {}) {
    super(options);
    
    // Override name for consistency
    this.name = 'SEOAnalyzer';
    
    console.log('🔍 SEO Analyzer initialized with Combined Approach');
    console.log(`📊 Features enabled: ${Object.entries(this.getMetadata().capabilities || {}).slice(0, 5).join(', ')}`);
  }
}

// Export as default for compatibility
export default SEOAnalyzer;

// Legacy singleton for backwards compatibility
export const seoAnalyzer = new SEOAnalyzer();