import { describe, test, expect } from '@jest/globals';
import { technicalAnalyzer } from '../src/analyzers/index.js';

describe('Technical Analyzer Test', () => {
  test('should import technicalAnalyzer', () => {
    expect(technicalAnalyzer).toBeDefined();
    expect(typeof technicalAnalyzer.analyze).toBe('function');
  });

  test('should analyze basic technical elements', () => {
    const mockDOM = {
      head: { getElementsByTagName: () => [], querySelectorAll: () => [] },
      body: { getElementsByTagName: () => [], querySelectorAll: () => [] },
      documentElement: { getAttribute: () => 'en' }
    };

    const result = technicalAnalyzer.analyze(mockDOM);
    console.log('Technical result keys:', Object.keys(result));
  });
});
