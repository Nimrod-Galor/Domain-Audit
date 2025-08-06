/**
 * @fileoverview Unit tests for SEO Analyzer
 * Tests SEO analysis functionality including title, meta description, etc.
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { seoAnalyzer } from '../../../src/analyzers/index.js';
import { TestHelpers } from '../../helpers/TestHelpers.js';

describe('SEOAnalyzer', () => {
  let mockDOM;

  beforeEach(() => {
    mockDOM = TestHelpers.createMockDOM();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('analyze', () => {
    test('should analyze basic SEO elements correctly', async () => {
      const mockDOM = {
        title: 'Test Page Title',
        head: {
          getElementsByTagName: jest.fn().mockImplementation((tag) => {
            if (tag === 'meta') {
              return [
                { 
                  getAttribute: jest.fn().mockImplementation((attr) => {
                    if (attr === 'name') return 'description';
                    if (attr === 'content') return 'Test meta description';
                    return null;
                  })
                }
              ];
            }
            return [];
          }),
          querySelectorAll: jest.fn().mockReturnValue([])
        },
        documentElement: {
          getAttribute: jest.fn().mockReturnValue('en')
        }
      };

      const result = seoAnalyzer.analyze(mockDOM);

      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('metaDescription');
      expect(result).toHaveProperty('metaKeywords');
      expect(result.title.text).toBe('Test Page Title');
      expect(result.metaDescription.text).toBe('Test meta description');
    });

    test('should detect missing title tag', async () => {
      const mockDOM = {
        title: '',
        head: {
          getElementsByTagName: jest.fn().mockReturnValue([]),
          querySelectorAll: jest.fn().mockReturnValue([])
        },
        documentElement: {
          getAttribute: jest.fn().mockReturnValue('en')
        }
      };

      const result = seoAnalyzer.analyze(mockDOM);

      expect(result.title.text).toBe('');
      expect(result.title.isEmpty).toBe(true);
    });

    test('should validate title length constraints', async () => {
      const longTitle = 'A'.repeat(70); // Too long
      
      const mockDOM = {
        title: longTitle,
        head: {
          getElementsByTagName: jest.fn().mockReturnValue([]),
          querySelectorAll: jest.fn().mockReturnValue([])
        },
        documentElement: {
          getAttribute: jest.fn().mockReturnValue('en')
        }
      };

      const result = seoAnalyzer.analyze(mockDOM);

      expect(result.title.text).toBe(longTitle);
      expect(result.title.length).toBe(70);
      expect(result.title.isTooLong).toBe(true);
    });

    test('should validate meta description length constraints', async () => {
      const longDescription = 'A'.repeat(170); // Too long
      
      const mockDOM = {
        title: 'Test Title',
        head: {
          getElementsByTagName: jest.fn().mockImplementation((tag) => {
            if (tag === 'meta') {
              return [
                { 
                  getAttribute: jest.fn().mockImplementation((attr) => {
                    if (attr === 'name') return 'description';
                    if (attr === 'content') return longDescription;
                    return null;
                  })
                }
              ];
            }
            return [];
          }),
          querySelectorAll: jest.fn().mockReturnValue([])
        },
        documentElement: {
          getAttribute: jest.fn().mockReturnValue('en')
        }
      };

      const result = seoAnalyzer.analyze(mockDOM);

      expect(result.metaDescription.text).toBe(longDescription);
      expect(result.metaDescription.length).toBe(170);
      expect(result.metaDescription.isTooLong).toBe(true);
    });

    test('should extract Open Graph data', async () => {
      const mockDOM = {
        title: 'Test Title',
        head: {
          getElementsByTagName: jest.fn().mockImplementation((tag) => {
            if (tag === 'meta') {
              return [
                { 
                  getAttribute: jest.fn().mockImplementation((attr) => {
                    if (attr === 'property') return 'og:title';
                    if (attr === 'content') return 'OG Title';
                    return null;
                  })
                }
              ];
            }
            return [];
          }),
          querySelectorAll: jest.fn().mockReturnValue([])
        },
        documentElement: {
          getAttribute: jest.fn().mockReturnValue('en')
        }
      };

      const result = seoAnalyzer.analyze(mockDOM);

      expect(result.openGraph.title).toBe('OG Title');
    });

    test('should extract Twitter Card data', async () => {
      const mockDOM = {
        title: 'Test Title',
        head: {
          getElementsByTagName: jest.fn().mockImplementation((tag) => {
            if (tag === 'meta') {
              return [
                { 
                  getAttribute: jest.fn().mockImplementation((attr) => {
                    if (attr === 'name') return 'twitter:card';
                    if (attr === 'content') return 'summary';
                    return null;
                  })
                }
              ];
            }
            return [];
          }),
          querySelectorAll: jest.fn().mockReturnValue([])
        },
        documentElement: {
          getAttribute: jest.fn().mockReturnValue('en')
        }
      };

      const result = seoAnalyzer.analyze(mockDOM);

      expect(result.twitterCard.card).toBe('summary');
    });

    test('should handle missing meta elements gracefully', async () => {
      const mockDOM = {
        title: 'Test Title',
        head: {
          getElementsByTagName: jest.fn().mockReturnValue([]),
          querySelectorAll: jest.fn().mockReturnValue([])
        },
        documentElement: {
          getAttribute: jest.fn().mockReturnValue('en')
        }
      };

      const result = seoAnalyzer.analyze(mockDOM);

      expect(result.title.isEmpty).toBe(false);
      expect(result.metaDescription.isEmpty).toBe(true);
      expect(result.openGraph.title).toBe('');
      expect(result.twitterCard.card).toBe('');
    });

    test('should extract canonical URL', async () => {
      const mockDOM = {
        title: 'Test Title',
        head: {
          getElementsByTagName: jest.fn().mockImplementation((tag) => {
            if (tag === 'link') {
              return [
                { 
                  getAttribute: jest.fn().mockImplementation((attr) => {
                    if (attr === 'rel') return 'canonical';
                    if (attr === 'href') return 'https://example.com/canonical';
                    return null;
                  })
                }
              ];
            }
            return [];
          }),
          querySelectorAll: jest.fn().mockReturnValue([])
        },
        documentElement: {
          getAttribute: jest.fn().mockReturnValue('en')
        }
      };

      const result = seoAnalyzer.analyze(mockDOM);

      expect(result.canonical).toBe('https://example.com/canonical');
    });

    test('should parse robots meta directives', async () => {
      const mockDOM = {
        title: 'Test Title',
        head: {
          getElementsByTagName: jest.fn().mockImplementation((tag) => {
            if (tag === 'meta') {
              return [
                { 
                  getAttribute: jest.fn().mockImplementation((attr) => {
                    if (attr === 'name') return 'robots';
                    if (attr === 'content') return 'noindex, nofollow';
                    return null;
                  })
                }
              ];
            }
            return [];
          }),
          querySelectorAll: jest.fn().mockReturnValue([])
        },
        documentElement: {
          getAttribute: jest.fn().mockReturnValue('en')
        }
      };

      const result = seoAnalyzer.analyze(mockDOM);

      expect(result.robots).toBe('noindex, nofollow');
      expect(result.robotsDirectives.analysis.allowsIndexing).toBe(false);
      expect(result.robotsDirectives.analysis.allowsFollowing).toBe(false);
    });

    test('should handle structured data', async () => {
      const structuredDataScript = {
        textContent: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Test Organization"
        })
      };

      const mockDOM = {
        title: 'Test Title',
        head: {
          getElementsByTagName: jest.fn().mockReturnValue([]),
          querySelectorAll: jest.fn().mockImplementation((selector) => {
            if (selector === 'script[type="application/ld+json"]') {
              return [structuredDataScript];
            }
            return [];
          })
        },
        documentElement: {
          getAttribute: jest.fn().mockReturnValue('en')
        }
      };

      const result = seoAnalyzer.analyze(mockDOM);

      expect(result.structuredData.count).toBe(1);
      expect(result.structuredData.types).toContain('Organization');
    });
  });

  describe('edge cases and error handling', () => {
    test('should handle null/undefined DOM gracefully', () => {
      expect(() => seoAnalyzer.analyze(null)).not.toThrow();
      expect(() => seoAnalyzer.analyze(undefined)).not.toThrow();
    });

    test('should handle malformed structured data', async () => {
      const invalidStructuredDataScript = {
        textContent: 'invalid json'
      };

      const mockDOM = {
        title: 'Test Title',
        head: {
          getElementsByTagName: jest.fn().mockReturnValue([]),
          querySelectorAll: jest.fn().mockImplementation((selector) => {
            if (selector === 'script[type="application/ld+json"]') {
              return [invalidStructuredDataScript];
            }
            return [];
          })
        },
        documentElement: {
          getAttribute: jest.fn().mockReturnValue('en')
        }
      };

      const result = seoAnalyzer.analyze(mockDOM);

      expect(result.structuredData.count).toBe(0);
      expect(result.structuredData.types).toEqual([]);
    });
  });
});
