/**
 * ============================================================================
 * ACCESSIBILITY ANALYZER - Combined Approach Implementation
 * ============================================================================
 * 
 * Main Accessibility Analyzer implementing the Combined Approach pattern.
 * This file serves as the entry point and orchestrates the modern
 * Accessibility Analyzer implementation.
 * 
 * Features:
 * - GPT-5 Style Modular Components (WCAG Compliance, Screen Reader, Color Contrast)
 * - GPT-5 Style Heuristics and Rules (Accessibility Assessment, Legal Compliance)
 * - Claude Style AI Enhancement (Accessibility Insights, Remediation Suggestions)
 * - Integration with Existing Components
 * - Comprehensive WCAG 2.1 AA/AAA Analysis
 * - Legal Compliance Assessment (ADA, Section 508, EN 301 549)
 * - Advanced Accessibility Testing and Validation
 * - Automated Remediation Recommendations
 * 
 * @module AccessibilityAnalyzer
 * @version 2.0.0
 * @author AI Assistant (Combined Approach)
 * @created 2025-08-13
 */

// Import the modern Combined Approach implementation
import { AccessibilityAnalyzerModern } from './modern/accessibility/accessibility-analyzer-modern.js';

/**
 * WCAG Accessibility Standards and Configuration
 */
export const ACCESSIBILITY_STANDARDS = {
  CONTRAST_RATIOS: {
    AA_NORMAL: 4.5,      // WCAG AA for normal text
    AA_LARGE: 3.0,       // WCAG AA for large text (18pt+ or 14pt+ bold)
    AAA_NORMAL: 7.0,     // WCAG AAA for normal text
    AAA_LARGE: 4.5       // WCAG AAA for large text
  },
  FONT_SIZES: {
    MIN_READABLE: 12,    // Minimum readable font size (px)
    RECOMMENDED: 16,     // Recommended base font size (px)
    LARGE_TEXT: 18       // Large text threshold (px)
  },
  WCAG_LEVEL: 'AA',      // Default WCAG compliance level
  LEGAL_COMPLIANCE: ['WCAG21_AA', 'SECTION508', 'ADA_TITLE_III']
};

/**
 * Accessibility Analyzer Class
 * 
 * Exports the modern Combined Approach implementation as the main Accessibility Analyzer.
 * This maintains compatibility while providing advanced accessibility analysis capabilities.
 */
export class AccessibilityAnalyzer extends AccessibilityAnalyzerModern {
  constructor(options = {}) {
    super(options);
    
    // Override name for consistency
    this.name = 'AccessibilityAnalyzer';
    
    console.log('♿ Accessibility Analyzer initialized with Combined Approach');
    console.log(`📊 WCAG Level: ${this.config.wcagLevel || 'AA'}, Legal Compliance: ${this.config.legalCompliance || 'US'}`);
    console.log(`🔧 Features enabled: ${Object.entries(this.getMetadata().features).filter(([k,v]) => v).map(([k]) => k).join(', ')}`);
  }
}

// Legacy compatibility - export the Combined Approach implementation as default
export default AccessibilityAnalyzer;
