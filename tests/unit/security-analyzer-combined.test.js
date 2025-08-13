/**
 * Security Analyzer Combined Approach Tests
 * Tests the modern Security Analyzer implementation
 */

import { jest } from '@jest/globals';

// Mock JSDOM and dependencies
jest.unstable_mockModule('jsdom', () => ({
  JSDOM: class MockJSDOM {
    constructor(html, options) {
      this.window = {
        document: {
          querySelectorAll: jest.fn(() => []),
          querySelector: jest.fn(() => null),
          createElement: jest.fn(() => ({})),
          getElementsByTagName: jest.fn(() => []),
          body: {},
          head: {}
        },
        location: { href: options?.url || 'https://example.com' }
      };
    }
  }
}));

// Import after mocking
const { SecurityAnalyzer } = await import('../../src/analyzers/security-analyzer.js');

describe('SecurityAnalyzer - Combined Approach', () => {
  let analyzer;
  let mockContext;

  beforeEach(() => {
    analyzer = new SecurityAnalyzer({
      useModernAnalyzer: true,
      hybridMode: true
    });

    // Create mock context
    mockContext = {
      dom: {
        window: {
          document: {
            querySelectorAll: jest.fn(() => []),
            querySelector: jest.fn(() => null),
            createElement: jest.fn(() => ({})),
            getElementsByTagName: jest.fn(() => []),
            body: {},
            head: {}
          },
          location: { href: 'https://example.com' }
        }
      },
      url: 'https://example.com',
      headers: {
        'strict-transport-security': 'max-age=31536000; includeSubDomains',
        'content-security-policy': "default-src 'self'",
        'x-frame-options': 'DENY',
        'x-content-type-options': 'nosniff'
      },
      pageData: {}
    };
  });

  test('should initialize with Combined Approach configuration', () => {
    expect(analyzer.config.useModernAnalyzer).toBe(true);
    expect(analyzer.config.hybridMode).toBe(true);
    expect(analyzer.modernAnalyzer).toBeDefined();
  });

  test('should perform modern analysis by default', async () => {
    const result = await analyzer.analyze(mockContext);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.metadata).toBeDefined();
  });

  test('should support legacy mode fallback', async () => {
    analyzer.config.legacyMode = true;
    analyzer.config.useModernAnalyzer = false;
    
    const result = await analyzer.analyze(mockContext);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  test('should provide backward compatibility', () => {
    expect(typeof analyzer.performLegacyAnalysis).toBe('function');
    expect(typeof analyzer.mergeLegacyAndModern).toBe('function');
  });
});
