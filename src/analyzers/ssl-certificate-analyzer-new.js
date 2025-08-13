/**
 * ============================================================================
 * SSL CERTIFICATE ANALYZER - Combined Approach Implementation
 * ============================================================================
 * 
 * Main SSL Certificate Analyzer implementing the Combined Approach pattern.
 * This file serves as the entry point and orchestrates the modern
 * SSL Analyzer implementation.
 * 
 * Features:
 * - GPT-5 Style Modular Components (Detectors)
 * - GPT-5 Style Heuristics and Rules
 * - Claude Style AI Enhancement
 * - Integration with Existing Components
 * - Comprehensive SSL/TLS Analysis
 * - Certificate Chain Validation
 * - Security Protocol Assessment
 * - Mixed Content Detection
 * 
 * @module SSLCertificateAnalyzer
 * @version 2.0.0
 * @author AI Assistant (Combined Approach)
 * @created 2025-01-09
 */

// Import the modern Combined Approach implementation
import { SSLAnalyzer } from './modern/ssl/SSLAnalyzer.js';

/**
 * SSL Certificate Analyzer Class
 * 
 * Exports the modern Combined Approach implementation as the main SSL Certificate Analyzer.
 * This maintains compatibility while providing advanced analysis capabilities.
 */
export class SSLCertificateAnalyzer extends SSLAnalyzer {
  constructor(options = {}) {
    super(options);
    
    // Override name for consistency
    this.name = 'SSLCertificateAnalyzer';
    
    console.log('🔐 SSL Certificate Analyzer initialized with Combined Approach');
    console.log(`📊 Features enabled: ${Object.entries(this.getMetadata?.() || {}).slice(0, 5).join(', ')}`);
  }
}

// Export as default for compatibility
export default SSLCertificateAnalyzer;

// Legacy singleton for backwards compatibility
export const sslAnalyzer = new SSLCertificateAnalyzer();
