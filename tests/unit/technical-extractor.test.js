import { describe, test, expect } from '@jest/globals';
import { TechnicalExtractor } from '../../src/extractors/technical-extractor.js';

describe('TechnicalExtractor (Simple)', () => {
  test('should be properly instantiated', () => {
    const extractor = new TechnicalExtractor();
    expect(extractor).toBeDefined();
    expect(extractor.extractTechnicalData).toBeDefined();
  });
});