/**
 * ============================================================================
 * TECHNICAL ANALYZER - Combined Approach Implementation
 * ============================================================================
 * 
 * Main Technical Analyzer implementing the Combined Approach pattern.
 * This file serves as the entry point and orchestrates the modern
 * Technical Analyzer implementation.
 * 
 * Features:
 * - GPT-5 Style Modular Components (Infrastructure, Architecture, Mobile, Performance)
 * - GPT-5 Style Heuristics and Rules (Technical Optimization, Compliance, Standards)
 * - Claude Style AI Enhancement (Technical Insights, Infrastructure Recommendations)
 * - Integration with Existing Components
 * - Comprehensive Technical Infrastructure Analysis
 * - Website Architecture Assessment
 * - Mobile Friendliness and Responsive Design Analysis
 * - Performance Optimization Recommendations
 * - Security and Compliance Validation
 * - Technical SEO Optimization
 * 
 * @module TechnicalAnalyzer
 * @version 2.0.0
 * @author AI Assistant (Combined Approach)
 * @created 2025-08-13
 */

// Import the modern Combined Approach implementation
import { TechnicalAnalyzerModern } from './modern/technical/technical-analyzer-modern.js';

/**
 * Technical Standards and Configuration
 */
export const TECHNICAL_STANDARDS = {
  ACCESSIBILITY: {
    MIN_ALT_TEXT_COVERAGE: 0.9,
    MIN_HEADING_STRUCTURE_SCORE: 80,
    MIN_FORM_LABEL_COVERAGE: 0.95,
    MIN_ARIA_COMPLIANCE: 0.8
  },
  MOBILE: {
    REQUIRED_VIEWPORT_ATTRIBUTES: ['width=device-width', 'initial-scale=1'],
    TOUCH_TARGET_MIN_SIZE: 44,
    RESPONSIVE_BREAKPOINTS: [320, 768, 1024, 1200]
  },
  SECURITY: {
    REQUIRED_HEADERS: ['strict-transport-security', 'content-security-policy', 'x-frame-options'],
    MIN_CSP_DIRECTIVES: 3,
    SECURE_COOKIE_ATTRIBUTES: ['secure', 'httponly', 'samesite']
  },
  PERFORMANCE: {
    MAX_RENDER_BLOCKING_RESOURCES: 5,
    MAX_EXTERNAL_RESOURCES: 20,
    MAX_INLINE_SCRIPTS: 3,
    MAX_CSS_FILES: 10
  }
};

/**
 * Technical Analyzer Class
 * 
 * Exports the modern Combined Approach implementation as the main Technical Analyzer.
 * This maintains compatibility while providing advanced technical analysis capabilities.
 */
export class TechnicalAnalyzer extends TechnicalAnalyzerModern {
  constructor(options = {}) {
    super(options);
    
    // Override name for consistency
    this.name = 'TechnicalAnalyzer';
    
    console.log('🔧 Technical Analyzer initialized with Combined Approach');
    console.log(`📊 Analysis scope: ${Object.entries(this.getMetadata().capabilities).filter(([k,v]) => v).map(([k]) => k).join(', ')}`);
    console.log(`⚙️ Features enabled: ${Object.entries(this.getMetadata().features).filter(([k,v]) => v).map(([k]) => k).join(', ')}`);
  }
}

// Legacy compatibility - export the Combined Approach implementation as default
export default TechnicalAnalyzer;
