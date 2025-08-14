/**
 * Advanced Link Analyzer - Bridge Implementation
 * 
 * Bridges to the modern Combined Approach implementation while maintaining compatibility.
 * This file serves as the main entry point for advanced link analysis.
 */

import { BaseAnalyzer } from './core/BaseAnalyzer.js';
import { AdvancedLinkAnalyzerModern } from './advanced-link-analyzer-modern.js';

export class AdvancedLinkAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('AdvancedLinkAnalyzer', options);
    
    this.name = 'AdvancedLinkAnalyzer';
    this.category = 'advanced_link_analysis';
    this.version = '2.0.0';
    
    // Initialize modern implementation
    this.modernAnalyzer = new AdvancedLinkAnalyzerModern(options);
    
    console.log('🔗 AdvancedLinkAnalyzer (Bridge) initialized - delegating to Combined Approach implementation');
    console.log('📊 Implementation: Bridge to #63 in modernization series');
  }

  getMetadata() {
    return {
      ...this.modernAnalyzer.getMetadata(),
      bridge: {
        version: this.version,
        type: 'bridge_to_modern',
        modernImplementation: 'AdvancedLinkAnalyzerModern',
        compatibilityMode: true
      }
    };
  }

  async analyze(context) {
    console.log('🔗 AdvancedLinkAnalyzer: Delegating to Combined Approach implementation');
    
    try {
      const modernResults = await this.modernAnalyzer.analyze(context);
      
      return {
        ...modernResults,
        bridge: {
          delegatedTo: 'AdvancedLinkAnalyzerModern',
          implementationNumber: 63,
          modernizationComplete: true,
          pattern: 'Combined Approach'
        }
      };
      
    } catch (error) {
      console.error('🔗 AdvancedLinkAnalyzer: Error in modern implementation');
      return this.handleError(error, 'advanced_link_bridge_analysis');
    }
  }
}

// Export as default for compatibility
export default AdvancedLinkAnalyzer;

// Legacy exports for backwards compatibility
export const advancedLinkAnalyzer = new AdvancedLinkAnalyzer();

// Export legacy configuration patterns for compatibility
export const ANCHOR_TEXT_CONFIG = {
  // Anchor text categories for analysis
  CATEGORIES: {
    EXACT_MATCH: 'exact-match',        // Exact keyword match
    PARTIAL_MATCH: 'partial-match',    // Contains target keywords
    BRANDED: 'branded',                // Brand/company names
    GENERIC: 'generic',                // Click here, read more, etc.
    URL: 'url',                        // Raw URLs as anchor text
    IMAGE: 'image',                    // Image alt text as anchor
    EMPTY: 'empty',                    // Empty or whitespace only
    LONG_TAIL: 'long-tail',           // Long descriptive phrases
    NAVIGATIONAL: 'navigational'       // Navigation-specific terms
  },

  // Generic anchor text patterns (SEO red flags)
  GENERIC_PATTERNS: [
    /^click here$/i,
    /^read more$/i,
    /^more info$/i,
    /^learn more$/i,
    /^see more$/i,
    /^continue reading$/i,
    /^view details$/i,
    /^download$/i,
    /^here$/i,
    /^this$/i,
    /^link$/i,
    /^website$/i,
    /^page$/i,
    /^article$/i
  ],

  // Quality thresholds
  QUALITY_THRESHOLDS: {
    EXCELLENT_DIVERSITY: 90,    // 90%+ anchor text diversity
    GOOD_DIVERSITY: 75,         // 75%+ diversity
    FAIR_DIVERSITY: 60,         // 60%+ diversity
    POOR_DIVERSITY: 40,         // Below 40% diversity
    MAX_ANCHOR_LENGTH: 100,     // Maximum reasonable anchor length
    KEYWORD_DENSITY_WARNING: 5  // Warn if same keyword appears >5 times
  }
};
