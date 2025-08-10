import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { ResourceAnalyzer } from '../../../src/analyzers/performance/ResourceAnalyzer.js';
import { TestHelpers } from '../../helpers/TestHelpers.js';

describe('ResourceAnalyzer', () => {
  let originalDocument;

  beforeEach(() => {
    // Save original document
    originalDocument = global.document;
  });

  afterEach(() => {
    // Restore original document
    global.document = originalDocument;
  });

  test('should analyze basic CDN usage', async () => {
    const analyzer = new CDNAnalyzer();
    const mockDOM = TestHelpers.createMockDOMWithCDN({
      scripts: [
        'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js',
        'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js'
      ],
      stylesheets: [
        'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css'
      ]
    });
    
    const result = await analyzer.analyze({
      dom: mockDOM,
      url: 'https://example.com',
      pageData: {}
    });

    // Based on the BaseAnalyzer format
    expect(result.result).toHaveProperty('success');
    expect(result.result).toHaveProperty('data');
    expect(result.result.data).toHaveProperty('detectedServices');
    expect(result.result.data).toHaveProperty('performanceImpact');
    expect(result.result.data).toHaveProperty('summary');
  });

  test('should detect popular CDN providers', async () => {
    const analyzer = new CDNAnalyzer();
    const mockDOM = TestHelpers.createMockDOMWithCDN({
      scripts: [
        'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js',
        'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js'
      ]
    });

    const result = await analyzer.analyze({
      dom: mockDOM,
      url: 'https://example.com',
      pageData: {}
    });

    expect(result.result.data.detectedServices).toBeDefined();
    expect(Array.isArray(result.result.data.detectedServices)).toBe(true);
  });

  test('should analyze performance impact of CDN usage', async () => {
    const analyzer = new CDNAnalyzer();
    const mockDOM = TestHelpers.createMockDOMWithCDN({
      scripts: ['https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js']
    });

    const result = await analyzer.analyze({
      dom: mockDOM,
      url: 'https://example.com',
      pageData: {}
    });

    expect(result.result.data.performanceImpact).toBeDefined();
    expect(result.result.data.performanceImpact).toHaveProperty('performanceScore');
  });

  test('should provide recommendations for CDN optimization', async () => {
    const analyzer = new CDNAnalyzer();
    const mockDOM = TestHelpers.createMockDOMWithCDN({
      scripts: [
        'https://example.com/js/app.js', // Local resource
        'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js'
      ]
    });

    const result = await analyzer.analyze({
      dom: mockDOM,
      url: 'https://example.com',
      pageData: {}
    });

    expect(result.result.data).toHaveProperty('recommendations');
    expect(Array.isArray(result.result.data.recommendations)).toBe(true);
  });

  test('should handle pages with no CDN usage', async () => {
    const analyzer = new CDNAnalyzer();
    const mockDOM = TestHelpers.createMockDOMWithCDN({
      scripts: ['https://example.com/js/app.js'], // Only local resources
      stylesheets: ['https://example.com/css/style.css']
    });

    const result = await analyzer.analyze({
      dom: mockDOM,
      url: 'https://example.com',
      pageData: {}
    });

    expect(result.result).toBeDefined();
    expect(result.result.success).toBe(true);
    expect(result.result.data).toBeDefined();
    expect(result.result.data.detectedServices).toBeDefined();
  });

  test('should handle malformed URLs gracefully', async () => {
    const analyzer = new CDNAnalyzer();
    const mockDOM = {
      window: {
        document: {
          title: 'Test',
          head: {
            querySelector: jest.fn().mockReturnValue(null),
            querySelectorAll: jest.fn().mockImplementation((selector) => {
              if (selector.includes('script') || selector.includes('link')) {
                return [{
                  getAttribute: jest.fn().mockReturnValue('invalid-url')
                }];
              }
              return [];
            }),
            getElementsByTagName: jest.fn().mockReturnValue([])
          },
          body: {
            querySelector: jest.fn().mockReturnValue(null),
            querySelectorAll: jest.fn().mockReturnValue([]),
            getElementsByTagName: jest.fn().mockReturnValue([])
          },
          documentElement: {
            getAttribute: jest.fn().mockReturnValue('en')
          },
          querySelector: jest.fn().mockReturnValue(null),
          querySelectorAll: jest.fn().mockReturnValue([]),
          getElementsByTagName: jest.fn().mockReturnValue([])
        }
      }
    };

    const result = await analyzer.analyze({
      dom: mockDOM,
      url: 'https://example.com',
      pageData: {}
    });

    expect(result.result).toBeDefined();
    expect(result.result.success).toBe(true);
    expect(result.result.data).toBeDefined();
  });
});
