import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { TechnicalAnalyzer } from '../../../src/analyzers/index.js';
import { TestHelpers } from '../../helpers/TestHelpers.js';

describe('TechnicalAnalyzer', () => {
  let originalDocument;

  beforeEach(() => {
    // Save original document
    originalDocument = global.document;
  });

  afterEach(() => {
    // Restore original document
    global.document = originalDocument;
  });

  test('should analyze basic technical elements', async () => {
    const analyzer = new TechnicalAnalyzer();
    const mockDOM = TestHelpers.createMockDOMForTechnical({
      title: 'Test Technical Page'
    });
    
    const result = await analyzer.analyze({
      dom: mockDOM,
      url: 'https://example.com',
      pageData: {}
    });

    // Based on the BaseAnalyzer format
    expect(result.result).toHaveProperty('success');
    expect(result.result).toHaveProperty('data');
    expect(result.result.data).toHaveProperty('infrastructure');
    expect(result.result.data).toHaveProperty('architecture');
    expect(result.result.data).toHaveProperty('accessibility');
  });

  test('should detect viewport configuration', async () => {
    const analyzer = new TechnicalAnalyzer();
    const mockDOM = TestHelpers.createMockDOMForTechnical();

    const result = await analyzer.analyze({
      dom: mockDOM,
      url: 'https://example.com',
      pageData: {}
    });

    expect(result.result.data.infrastructure).toBeDefined();
    expect(result.result.data.infrastructure.elements.viewport).toBeDefined();
  });

  test('should detect character encoding', async () => {
    const analyzer = new TechnicalAnalyzer();
    const mockDOM = TestHelpers.createMockDOMForTechnical();

    const result = await analyzer.analyze({
      dom: mockDOM,
      url: 'https://example.com', 
      pageData: {}
    });

    expect(result.result.data.infrastructure).toBeDefined();
    expect(result.result.data.infrastructure.elements.charset).toBeDefined();
  });

  test('should analyze resource usage', async () => {
    const analyzer = new TechnicalAnalyzer();
    const mockDOM = TestHelpers.createMockDOMForTechnical();

    const result = await analyzer.analyze({
      dom: mockDOM,
      url: 'https://example.com',
      pageData: {}
    });

    expect(result.result.data.infrastructure).toBeDefined();
    expect(result.result.data.infrastructure.elements.resources).toBeDefined();
  });

  test('should handle missing technical elements gracefully', async () => {
    const analyzer = new TechnicalAnalyzer();
    const mockDOM = {
      window: {
        document: {
          title: 'Test',
          head: {
            querySelector: jest.fn().mockReturnValue(null),
            querySelectorAll: jest.fn().mockReturnValue([]),
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

    expect(result).toBeDefined();
    expect(result.result.success).toBe(true);
    expect(result.result.data).toBeDefined();
  });
});
