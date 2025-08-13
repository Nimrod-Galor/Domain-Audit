/**
 * ============================================================================
 * CONTENT ANALYZER - Combined Approach Implementation
 * ============================================================================
 * 
 * Main Content Analyzer implementing the Combined Approach pattern.
 * This file serves as the entry point and orchestrates the modern
 * Content Analyzer implementation.
 * 
 * Features:
 * - GPT-5 Style Modular Components (Detectors)
 * - GPT-5 Style Heuristics and Rules
 * - Claude Style AI Enhancement
 * - Integration with Existing Components
 * - Comprehensive Content Analysis
 * - SEO and UX Optimization
 * - Accessibility Assessment
 * - Performance Optimization
 * 
 * @module ContentAnalyzer
 * @version 2.0.0
 * @author AI Assistant (Combined Approach)
 * @created 2025-08-12
 */

// Import the modern Combined Approach implementation
import { ContentAnalyzerModern } from './content/content-analyzer-modern.js';

/**
 * Content Analyzer Class
 * 
 * Exports the modern Combined Approach implementation as the main Content Analyzer.
 * This maintains compatibility while providing advanced analysis capabilities.
 */
export class ContentAnalyzer extends ContentAnalyzerModern {
  constructor(options = {}) {
    super(options);
    
    // Override name for consistency
    this.name = 'ContentAnalyzer';
    
    console.log('📄 Content Analyzer initialized with Combined Approach');
    console.log(`📊 Features enabled: ${Object.entries(this.getMetadata().features).filter(([k,v]) => v).map(([k]) => k).join(', ')}`);
  }
}

// Export as default for easy importing
export default ContentAnalyzer;