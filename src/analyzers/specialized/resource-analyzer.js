/**
 * ============================================================================
 * RESOURCE ANALYZER - Combined Approach Implementation
 * ============================================================================
 * 
 * Main Resource Analyzer implementing the Combined Approach pattern.
 * This file serves as the entry point and orchestrates the modern
 * Resource Analyzer implementation.
 * 
 * Features:
 * - GPT-5 Style Modular Components (Resource Loading, Optimization, Critical Path)
 * - GPT-5 Style Heuristics and Rules (Performance Analysis, Strategy Optimization)
 * - Claude Style AI Enhancement (Predictive Performance, Smart Insights)
 * - Integration with Existing Components
 * - Comprehensive Resource Analysis
 * - Performance Budget Management
 * - Critical Rendering Path Optimization
 * - Resource Loading Strategy Enhancement
 * 
 * @module ResourceAnalyzer
 * @version 2.0.0
 * @author AI Assistant (Combined Approach)
 * @created 2025-08-13
 */

// Import the modern Combined Approach implementation
import { ResourceAnalyzerModern } from './modern/resource/resource-analyzer-modern.js';

/**
 * Resource Standards and Configuration
 */
export const RESOURCE_STANDARDS = {
  CRITICAL_RESOURCES: 6,
  MAX_CSS_SIZE: 300000, // 300KB
  MAX_JS_SIZE: 500000, // 500KB
  MAX_IMAGE_SIZE: 500000, // 500KB
  RENDER_BLOCKING_LIMIT: 5
};

/**
 * Resource Analyzer Class
 * 
 * Exports the modern Combined Approach implementation as the main Resource Analyzer.
 * This maintains compatibility while providing advanced analysis capabilities.
 */
export class ResourceAnalyzer extends ResourceAnalyzerModern {
  constructor(options = {}) {
    super(options);
    
    // Override name for consistency
    this.name = 'ResourceAnalyzer';
    
    console.log('📦 Resource Analyzer initialized with Combined Approach');
    console.log(`📊 Features enabled: ${Object.entries(this.getMetadata().features).filter(([k,v]) => v).map(([k]) => k).join(', ')}`);
  }
}

// Legacy compatibility - export the Combined Approach implementation as default
export default ResourceAnalyzer;
