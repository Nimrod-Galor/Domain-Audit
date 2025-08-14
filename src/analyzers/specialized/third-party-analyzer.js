/**
 * Third-Party Analyzer - Bridge Implementation
 * 
 * Bridges to the modern Combined Approach implementation while maintaining compatibility.
 * This file serves as the main entry point for third-party service analysis.
 */

import { BaseAnalyzer } from './core/BaseAnalyzer.js';
import { ThirdPartyAnalyzerModern } from './third-party-analyzer-modern.js';

export class ThirdPartyAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('ThirdPartyAnalyzer', options);
    
    this.name = 'ThirdPartyAnalyzer';
    this.category = 'third_party';
    this.version = '2.0.0';
    
    // Initialize modern implementation
    this.modernAnalyzer = new ThirdPartyAnalyzerModern(options);
    
    console.log('🔗 ThirdPartyAnalyzer (Bridge) initialized - delegating to Combined Approach implementation');
    console.log('📊 Implementation: Bridge to #62 in modernization series');
  }

  /**
   * Get analyzer metadata
   */
  getMetadata() {
    return {
      ...this.modernAnalyzer.getMetadata(),
      bridge: {
        version: this.version,
        type: 'bridge_to_modern',
        modernImplementation: 'ThirdPartyAnalyzerModern',
        compatibilityMode: true
      }
    };
  }

  /**
   * Analyze third-party services and dependencies
   */
  async analyze(context) {
    console.log('🔗 ThirdPartyAnalyzer: Delegating to Combined Approach implementation');
    
    try {
      // Delegate to modern implementation
      const modernResults = await this.modernAnalyzer.analyze(context);
      
      // Ensure bridge compatibility
      const bridgeResults = {
        ...modernResults,
        bridge: {
          delegatedTo: 'ThirdPartyAnalyzerModern',
          implementationNumber: 62,
          modernizationComplete: true,
          pattern: 'Combined Approach'
        }
      };
      
      console.log('🔗 ThirdPartyAnalyzer: Successfully bridged to modern implementation');
      return bridgeResults;
      
    } catch (error) {
      console.error('🔗 ThirdPartyAnalyzer: Error in modern implementation, falling back to basic analysis');
      return this.handleError(error, 'third_party_bridge_analysis');
    }
  }

  /**
   * Legacy method support for backward compatibility
   */
  async analyzeBasic(context) {
    console.log('🔗 ThirdPartyAnalyzer: Basic analysis requested - using modern implementation with simplified output');
    
    const modernResults = await this.modernAnalyzer.analyze(context);
    
    // Simplify output for legacy compatibility
    return {
      success: modernResults.success,
      data: {
        scripts: {
          total: modernResults.data.serviceDetection.totalServices,
          external: modernResults.data.serviceDetection.categoryCounts.analytics + 
                   modernResults.data.serviceDetection.categoryCounts.advertising + 
                   modernResults.data.serviceDetection.categoryCounts.social,
          categories: modernResults.data.serviceDetection.categoryCounts
        },
        performance: {
          score: modernResults.data.performanceImpact.overall.score,
          level: modernResults.data.performanceImpact.overall.level
        },
        privacy: {
          riskLevel: modernResults.data.privacySecurity.privacy.riskLevel,
          trackingServices: modernResults.data.privacySecurity.privacy.trackingServices.length
        }
      },
      metadata: {
        ...modernResults.metadata,
        compatibilityMode: 'basic'
      }
    };
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
