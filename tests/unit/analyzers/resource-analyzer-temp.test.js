import { describe, test, expect } from '@jest/globals';
import { ResourceAnalyzer } from '../../../src/analyzers/performance/ResourceAnalyzer.js';

describe('ResourceAnalyzer (Temp)', () => {
  test('should be properly instantiated', () => {
    const analyzer = new ResourceAnalyzer();
    expect(analyzer).toBeDefined();
    expect(analyzer.analyze).toBeDefined();
  });
});