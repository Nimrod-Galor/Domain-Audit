/**
 * ============================================================================
 * THIRD-PARTY ANALYZER - Combined Approach Implementation
 * ============================================================================
 * 
 * Main Third-Party Analyzer implementing the Combined Approach pattern.
 * This file serves as the entry point and orchestrates the modern
 * Third-Party Analyzer implementation.
 * 
 * Features:
 * - GPT-5 Style Modular Components (Detectors)
 * - GPT-5 Style Heuristics and Rules
 * - Claude Style AI Enhancement
 * - Integration with Existing Components
 * - Comprehensive Third-Party Analysis
 * - Performance Impact Assessment
 * - Privacy and Security Analysis
 * - Dependency Mapping and Strategy
 * 
 * @module ThirdPartyAnalyzer
 * @version 2.0.0
 * @author AI Assistant (Combined Approach)
 * @created 2025-01-09
 */

// Import the modern Combined Approach implementation
import ThirdPartyAnalyzerModern from './modern/third-party/third-party-analyzer-modern.js';

/**
 * Third-Party Analyzer Class
 * 
 * Exports the modern Combined Approach implementation as the main Third-Party Analyzer.
 * This maintains compatibility while providing advanced analysis capabilities.
 */
export class ThirdPartyAnalyzer extends ThirdPartyAnalyzerModern {
  constructor(options = {}) {
    super(options);
    
    // Override name for consistency
    this.name = 'ThirdPartyAnalyzer';
    
    console.log('🔗 Third-Party Analyzer initialized with Combined Approach');
    console.log(`📊 Features enabled: ${Object.entries(this.getMetadata().capabilities || {}).slice(0, 5).join(', ')}`);
  }
}

// Export as default for compatibility
export default ThirdPartyAnalyzer;

// Legacy exports for backwards compatibility
export const thirdPartyAnalyzer = new ThirdPartyAnalyzer();

// Export legacy service patterns for compatibility
export const THIRD_PARTY_SERVICES = {
  // Analytics and Tracking
  ANALYTICS: {
    'google-analytics.com': { name: 'Google Analytics', category: 'analytics', impact: 'medium' },
    'googletagmanager.com': { name: 'Google Tag Manager', category: 'analytics', impact: 'medium' },
    'facebook.net': { name: 'Facebook Pixel', category: 'analytics', impact: 'medium' },
    'hotjar.com': { name: 'Hotjar', category: 'analytics', impact: 'low' },
    'mixpanel.com': { name: 'Mixpanel', category: 'analytics', impact: 'low' }
  },
  // Advertising and Marketing
  ADVERTISING: {
    'googleadservices.com': { name: 'Google Ads', category: 'advertising', impact: 'medium' },
    'googlesyndication.com': { name: 'Google AdSense', category: 'advertising', impact: 'medium' },
    'facebook.com': { name: 'Facebook Ads', category: 'advertising', impact: 'medium' }
  },
  // Social Media
  SOCIAL: {
    'platform.twitter.com': { name: 'Twitter Widget', category: 'social', impact: 'low' },
    'connect.facebook.net': { name: 'Facebook SDK', category: 'social', impact: 'medium' },
    'youtube.com': { name: 'YouTube Embed', category: 'social', impact: 'medium' }
  }
};
