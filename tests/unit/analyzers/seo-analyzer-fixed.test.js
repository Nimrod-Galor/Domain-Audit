import { describe, test, expect } from '@jest/globals';
import { SEOAnalyzer } from '../../../src/analyzers/seo-analyzer.js';

describe('SEOAnalyzer (Fixed - Simple)', () => {
  test('should be properly instantiated', () => {
    const analyzer = new SEOAnalyzer();
    expect(analyzer).toBeDefined();
    expect(analyzer.analyze).toBeDefined();
  });
});