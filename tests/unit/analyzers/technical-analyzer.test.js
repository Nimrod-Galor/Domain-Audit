import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { technicalAnalyzer } from '../../../src/analyzers/index.js';
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

  test('should analyze basic technical elements', () => {
    const mockDOM = TestHelpers.createMockDOMForTechnical({
      title: 'Test Technical Page'
    });
    
    // Set up global document mock
    global.document = mockDOM;

    const result = technicalAnalyzer.analyze(mockDOM);

    // Based on actual return structure from console output
    expect(result).toHaveProperty('viewport');
    expect(result).toHaveProperty('charset');
    expect(result).toHaveProperty('resources');
    expect(result).toHaveProperty('technicalScore');
  });

  test('should detect viewport configuration', () => {
    const mockDOM = TestHelpers.createMockDOMForTechnical();
    global.document = mockDOM;

    const result = technicalAnalyzer.analyze(mockDOM);

    expect(result.viewport.content).toBe('width=device-width, initial-scale=1');
    expect(result.viewport.isResponsive).toBe(true);
  });

  test('should detect character encoding', () => {
    const mockDOM = TestHelpers.createMockDOMForTechnical();
    global.document = mockDOM;

    const result = technicalAnalyzer.analyze(mockDOM);

    expect(result.charset.value).toBe('utf-8');
    expect(result.charset.isUTF8).toBe(true);
  });

  test('should analyze resource usage', () => {
    const mockDOM = TestHelpers.createMockDOMForTechnical();
    global.document = mockDOM;

    const result = technicalAnalyzer.analyze(mockDOM);

    expect(result.resources).toHaveProperty('externalCSS');
    expect(result.resources).toHaveProperty('externalJS');
    expect(result.resources).toHaveProperty('totalResources');
  });

  test('should handle missing technical elements gracefully', () => {
    const mockDOM = {
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
    };
    
    global.document = mockDOM;

    const result = technicalAnalyzer.analyze(mockDOM);

    expect(result).toHaveProperty('viewport');
    expect(result).toHaveProperty('technicalScore');
  });
});
