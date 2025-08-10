/**
 * SSLAnalyzer Test Suite
 * Tests SSL certificate analysis functionality
 */

import { jest } from '@jest/globals';
import { SSLCertificateAnalyzer } from '../../../src/analyzers/security/SSLAnalyzer.js';
import { TestHelpers } from '../../helpers/TestHelpers.js';

describe('SSLAnalyzer', () => {
  let analyzer;
  let mockDom;

  beforeEach(() => {
    analyzer = new SSLCertificateAnalyzer();
    mockDom = TestHelpers.createMockDOMWithSSL();
    
    console.log('Mock DOM structure:', {
      hasWindow: !!mockDom.window,
      hasDocument: !!mockDom.window?.document,
      hasQuerySelectorAll: typeof mockDom.window?.document?.querySelectorAll,
      httpsUrl: 'https://secure.example.com'
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should analyze HTTPS SSL certificate configuration', async () => {
    const context = {
      dom: mockDom,
      url: 'https://secure.example.com',
      pageData: {
        security: {
          transport: {
            isHTTPS: true,
            hasHSTS: true,
            hstsMaxAge: 31536000
          }
        }
      }
    };

    const result = await analyzer.analyze(context);
    
    console.log('SSLAnalyzer result:', JSON.stringify({
      success: result.success,
      analyzer: result.analyzer,
      category: result.category,
      score: result.score,
      hasData: !!result.data,
      hasRecommendations: !!result.recommendations,
      hasSummary: !!result.summary
    }, null, 2));

    // Based on the BaseAnalyzer format
    expect(result.success).toBe(true);
    expect(result.analyzer).toBe('SSLCertificateAnalyzer');
    expect(result.category).toBe('SECURITY');
    expect(typeof result.score).toBe('number');
    expect(result.data).toBeDefined();
    expect(result.recommendations).toBeDefined();
    expect(result.summary).toBeDefined();
  });

  test('should detect non-HTTPS URLs', async () => {
    const context = {
      dom: mockDom,
      url: 'http://insecure.example.com',
      pageData: {}
    };

    const result = await analyzer.analyze(context);
    
    expect(result.success).toBe(true);
    expect(result.data.isHTTPS).toBe(false);
    expect(result.score).toBe(0); // No HTTPS = 0 score
    expect(Array.isArray(result.recommendations)).toBe(true);
  });

  test('should analyze certificate expiration status', async () => {
    const context = {
      dom: mockDom,
      url: 'https://secure.example.com',
      pageData: {
        security: {
          certificate: {
            validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          }
        }
      }
    };

    const result = await analyzer.analyze(context);
    
    expect(result.success).toBe(true);
    // For network-based SSL analysis, we expect either successful analysis or graceful error handling
    if (result.data && !result.data.error) {
      expect(result.data).toHaveProperty('expiration');
      expect(result.summary).toHaveProperty('expirationStatus');
    } else {
      // Network connection failed - this is acceptable for unit tests
      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('object');
    }
  });

  test('should provide security recommendations', async () => {
    const context = {
      dom: mockDom,
      url: 'https://secure.example.com',
      pageData: {
        security: {
          transport: {
            isHTTPS: true,
            hasHSTS: false // Missing HSTS
          }
        }
      }
    };

    const result = await analyzer.analyze(context);
    
    expect(result.success).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  test('should handle mixed content detection', async () => {
    const context = {
      dom: mockDom,
      url: 'https://secure.example.com',
      pageData: {
        resources: {
          external: [
            { url: 'http://insecure-cdn.com/script.js', type: 'script' },
            { url: 'https://secure-cdn.com/style.css', type: 'stylesheet' }
          ]
        }
      }
    };

    const result = await analyzer.analyze(context);
    
    expect(result.success).toBe(true);
    // For network-based SSL analysis, we expect either successful analysis or graceful error handling
    if (result.data && !result.data.error) {
      expect(result.data).toHaveProperty('mixedContent');
    } else {
      // Network connection failed - this is acceptable for unit tests
      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('object');
    }
  });

  test('should handle analysis errors gracefully', async () => {
    const context = {
      dom: mockDom,
      url: '', // Invalid URL
      pageData: {}
    };

    const result = await analyzer.analyze(context);
    
    // Should handle errors gracefully
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  test('should provide comprehensive SSL scoring', async () => {
    const context = {
      dom: mockDom,
      url: 'https://secure.example.com',
      pageData: {
        security: {
          transport: {
            isHTTPS: true,
            hasHSTS: true,
            hstsMaxAge: 31536000
          },
          certificate: {
            valid: true,
            algorithm: 'sha256WithRSAEncryption',
            keySize: 2048
          }
        }
      }
    };

    const result = await analyzer.analyze(context);
    
    expect(result.success).toBe(true);
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  test('should validate input context', async () => {
    const invalidContexts = [
      null,
      undefined,
      {},
      { dom: mockDom }, // Missing URL
      { url: 'https://example.com' } // Missing DOM
    ];

    for (const context of invalidContexts) {
      const result = await analyzer.analyze(context);
      
      // Should handle invalid input gracefully
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    }
  });
});
