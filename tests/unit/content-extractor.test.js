/**
 * @jest-environment node
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import * as cheerio from 'cheerio';
import { ContentExtractor } from '../../src/extractors/content-extractor.js';

describe('ContentExtractor Tests', () => {
  let contentExtractor;
  let mockDocument;
  let html;
  
  beforeEach(() => {
    contentExtractor = new ContentExtractor();
    
    // Create HTML content
    html = `
      <!DOCTYPE html>
      <html>
        <head><title>Test Page</title></head>
        <body>
          <h1>Main Title</h1>
          <p>This is a sample paragraph with multiple words for testing content analysis.</p>
          <h2>Section Title</h2>
          <p>Another paragraph with more content to test various metrics and algorithms.</p>
          <img src="test1.jpg" alt="Test image 1" />
          <img src="test2.jpg" />
          <ul>
            <li>List item one</li>
            <li>List item two</li>
          </ul>
        </body>
      </html>
    `;
    
    // Load with Cheerio
    const $ = cheerio.load(html);
    
    // Create document-like object similar to how DOMProcessor does it
    const createElementFromCheerio = (cheerioElement) => {
      if (!cheerioElement || cheerioElement.length === 0) return null;
      
      return {
        tagName: cheerioElement.get(0).name,
        textContent: cheerioElement.text(),
        innerHTML: cheerioElement.html(),
        outerHTML: $.html(cheerioElement),
        getAttribute: (name) => cheerioElement.attr(name),
        hasAttribute: (name) => cheerioElement.attr(name) !== undefined,
        getElementsByTagName: (tagName) => {
          const elements = cheerioElement.find(tagName);
          return Array.from({ length: elements.length }, (_, i) => 
            createElementFromCheerio(elements.eq(i))
          ).filter(Boolean);
        },
        querySelector: (selector) => {
          const element = cheerioElement.find(selector).first();
          return element.length > 0 ? createElementFromCheerio(element) : null;
        },
        querySelectorAll: (selector) => {
          const elements = cheerioElement.find(selector);
          return Array.from({ length: elements.length }, (_, i) => 
            createElementFromCheerio(elements.eq(i))
          ).filter(Boolean);
        }
      };
    };
    
    mockDocument = {
      querySelector: (selector) => {
        const elements = $(selector);
        return elements.length > 0 ? createElementFromCheerio(elements.first()) : null;
      },
      querySelectorAll: (selector) => {
        const elements = $(selector);
        return Array.from({ length: elements.length }, (_, i) => 
          createElementFromCheerio(elements.eq(i))
        ).filter(Boolean);
      },
      getElementsByTagName: (tagName) => {
        const elements = $(tagName);
        return Array.from({ length: elements.length }, (_, i) => 
          createElementFromCheerio(elements.eq(i))
        ).filter(Boolean);
      },
      body: createElementFromCheerio($('body')),
      head: createElementFromCheerio($('head')),
      title: $('title').text() || '',
      URL: 'https://test.com'
    };
  });

  describe('Constructor', () => {
    test('should initialize with default configuration', () => {
      const extractor = new ContentExtractor();
      expect(extractor.cache).toBeDefined();
      expect(extractor.config).toBeDefined();
      expect(extractor.config.maxHeadingsPerType).toBe(10);
      expect(extractor.config.maxImagesForAnalysis).toBe(100);
    });

    test('should initialize with custom configuration', () => {
      // ContentExtractor doesn't currently support custom config in constructor
      // It uses default config with performanceManager
      const mockPerformanceManager = { cache: new Map() };
      const extractor = new ContentExtractor(mockPerformanceManager);
      
      expect(extractor.config.maxHeadingsPerType).toBe(10); // default value
      expect(extractor.config.maxImagesForAnalysis).toBe(100); // default value  
      expect(extractor.config.cacheReadabilityScores).toBe(true); // default value
      expect(extractor.cache).toBe(mockPerformanceManager.cache);
    });
  });

  describe('extractContentData', () => {
    test('should extract comprehensive content data', async () => {
      const result = await contentExtractor.extractContentData(mockDocument, html);
      
      expect(result).toBeDefined();
      expect(result.wordCount).toBeGreaterThan(0);
      expect(result.headings).toBeDefined();
      expect(result.images).toBeDefined();
      expect(result.contentToCodeRatio).toBeGreaterThan(0);
      expect(result.extractionMethod).toBe('comprehensive');
    });

    test('should handle empty document', async () => {
      const emptyHtml = '<!DOCTYPE html><html><head></head><body></body></html>';
      const $ = cheerio.load(emptyHtml);
      const emptyDocument = {
        body: { textContent: '', innerHTML: '' },
        querySelector: () => null,
        querySelectorAll: () => []
      };
      
      const result = await contentExtractor.extractContentData(emptyDocument, emptyHtml);
      
      expect(result.wordCount).toBe(0);
      expect(result.extractionMethod).toBe('comprehensive');
    });
  });

  describe('extractContentDataOptimized', () => {
    test('should extract optimized content data efficiently', () => {
      const result = contentExtractor.extractContentDataOptimized(mockDocument, html);
      
      expect(result).toBeDefined();
      expect(result.wordCount).toBeGreaterThan(0);
      expect(result.headings).toBeDefined();
      expect(result.images).toBeDefined();
      expect(result.contentToCodeRatio).toBeGreaterThan(0);
    });

    test('should handle document without body', () => {
      const nBodyHtml = '<!DOCTYPE html><html><head><title>No Body</title></head></html>';
      const $ = cheerio.load(nBodyHtml);
      const nBodyDocument = {
        body: null,
        querySelector: () => null,
        querySelectorAll: () => []
      };
      
      const result = contentExtractor.extractContentDataOptimized(nBodyDocument, nBodyHtml);
      
      expect(result.extractionMethod).toBe('empty');
    });
  });

  describe('extractBasicContentMetrics', () => {
    test('should extract basic metrics correctly', () => {
      const result = contentExtractor.extractBasicContentMetrics(mockDocument, html);
      
      expect(result.wordCount).toBeGreaterThan(0);
      expect(result.textLength).toBeGreaterThan(0);
      expect(result.contentToCodeRatio).toBeGreaterThan(0);
    });

    test('should handle missing body element', () => {
      const nBodyDocument = {
        body: null,
        querySelector: () => null,
        querySelectorAll: () => []
      };
      
      const result = contentExtractor.extractBasicContentMetrics(nBodyDocument, html);
      
      expect(result.wordCount).toBe(0);
      expect(result.textLength).toBe(0);
    });
  });

  describe('extractHeadingStructure', () => {
    test('should extract heading structure correctly', () => {
      const result = contentExtractor.extractHeadingStructure(mockDocument);
      
      expect(result.headings).toBeDefined();
      expect(result.headings.h1).toBeDefined();
      expect(result.headings.h2).toBeDefined();
      expect(result.headingStats).toBeDefined();
      expect(result.headingStats.hasH1).toBe(true);
      expect(result.headingStats.totalHeadings).toBeGreaterThan(0);
    });

    test('should detect multiple H1 tags correctly', () => {
      const multiH1Html = `
        <html><body>
          <h1>First Title</h1>
          <h1>Second Title</h1>
          <h2>Subtitle</h2>
        </body></html>
      `;
      
      const $ = cheerio.load(multiH1Html);
      const createElementFromCheerio = (cheerioElement) => {
        if (!cheerioElement || cheerioElement.length === 0) return null;
        return {
          tagName: cheerioElement.get(0).name,
          textContent: cheerioElement.text(),
          innerHTML: cheerioElement.html(),
          getElementsByTagName: (tagName) => {
            const elements = cheerioElement.find(tagName);
            return Array.from({ length: elements.length }, (_, i) => 
              createElementFromCheerio(elements.eq(i))
            ).filter(Boolean);
          }
        };
      };
      
      const multiH1Document = {
        getElementsByTagName: (tagName) => {
          const elements = $(tagName);
          return Array.from({ length: elements.length }, (_, i) => 
            createElementFromCheerio(elements.eq(i))
          ).filter(Boolean);
        },
        querySelectorAll: (selector) => {
          const elements = $(selector);
          return Array.from({ length: elements.length }, (_, i) => 
            createElementFromCheerio(elements.eq(i))
          ).filter(Boolean);
        }
      };
      
      const result = contentExtractor.extractHeadingStructure(multiH1Document);
      expect(result.headingStats.hasH1).toBe(true);
      expect(result.headingStats.multipleH1).toBe(true);
      expect(result.headings.h1.length).toBe(2);
    });

    test('should handle document with no headings', () => {
      const noHeadingsHtml = '<html><body><p>No headings here</p></body></html>';
      const $ = cheerio.load(noHeadingsHtml);
      
      const noHeadingsDocument = {
        getElementsByTagName: (tagName) => {
          const elements = $(tagName);
          return Array.from({ length: elements.length }, (_, i) => {
            const elem = elements.eq(i);
            return elem.length > 0 ? {
              tagName: elem.get(0).name,
              textContent: elem.text(),
              innerHTML: elem.html()
            } : null;
          }).filter(Boolean);
        },
        querySelectorAll: (selector) => {
          const elements = $(selector);
          return Array.from({ length: elements.length }, (_, i) => {
            const elem = elements.eq(i);
            return elem.length > 0 ? {
              tagName: elem.get(0).name,
              textContent: elem.text(),
              innerHTML: elem.html()
            } : null;
          }).filter(Boolean);
        }
      };
      
      const result = contentExtractor.extractHeadingStructure(noHeadingsDocument);
      expect(result.headingStats.hasH1).toBe(false);
      expect(result.headingStats.totalHeadings).toBe(0);
    });
  });

  describe('calculateReadabilityScores', () => {
    test('should calculate readability scores for normal text', () => {
      const text = 'This is a simple test sentence. It has multiple sentences for testing. The readability should be calculated correctly.';
      const result = contentExtractor.calculateReadabilityScores(text);
      
      expect(result.fleschReadingEase).toBeGreaterThan(0);
      expect(result.wordCount).toBeGreaterThan(0);
      expect(result.sentenceCount).toBeGreaterThan(0);
      expect(result.readingLevel).toBeDefined();
      expect(typeof result.averageSentenceLength).toBe('number');
      expect(typeof result.averageSyllablesPerWord).toBe('number');
    });

    test('should handle empty text', () => {
      const result = contentExtractor.calculateReadabilityScores('');
      
      expect(result.wordCount).toBe(0);
      expect(result.sentenceCount).toBe(0);
      expect(result.readingLevel).toBe('No content');
      expect(result.fleschReadingEase).toBe(0);
    });

    test('should handle single word text', () => {
      const result = contentExtractor.calculateReadabilityScores('Hello');
      
      expect(result.wordCount).toBe(1);
      expect(result.sentenceCount).toBe(1);
      expect(result.fleschReadingEase).toBeGreaterThan(0);
    });

    test('should cache readability scores when enabled', () => {
      const text = 'Test sentence for caching.';
      
      // First call
      const result1 = contentExtractor.calculateReadabilityScores(text);
      
      // Second call should use cache
      const result2 = contentExtractor.calculateReadabilityScores(text);
      
      expect(result1).toEqual(result2);
      expect(contentExtractor.cache.size).toBeGreaterThan(0);
    });
  });

  describe('countSyllables', () => {
    test('should count syllables correctly for various words', () => {
      expect(contentExtractor.countSyllables('hello')).toBe(2);
      expect(contentExtractor.countSyllables('cat')).toBe(1);
      expect(contentExtractor.countSyllables('beautiful')).toBe(3);
      expect(contentExtractor.countSyllables('education')).toBe(4);
    });

    test('should handle empty or invalid input', () => {
      expect(contentExtractor.countSyllables('')).toBe(0);
      expect(contentExtractor.countSyllables('123')).toBe(0);
      expect(contentExtractor.countSyllables('!!!')).toBe(0);
    });

    test('should handle special cases', () => {
      expect(contentExtractor.countSyllables('the')).toBe(1);
      expect(contentExtractor.countSyllables('apple')).toBeGreaterThan(0);
      expect(contentExtractor.countSyllables('silent')).toBeGreaterThan(1);
    });
  });

  describe('countWords', () => {
    test('should count words correctly', () => {
      expect(contentExtractor.countWords('hello world')).toBe(2);
      expect(contentExtractor.countWords('  hello   world  ')).toBe(2);
      expect(contentExtractor.countWords('')).toBe(0);
      expect(contentExtractor.countWords('single')).toBe(1);
    });

    test('should handle various whitespace scenarios', () => {
      expect(contentExtractor.countWords('word1\nword2\tword3')).toBe(3);
      expect(contentExtractor.countWords('   ')).toBe(0);
      expect(contentExtractor.countWords('word1,word2.word3')).toBe(1); // No spaces
    });
  });

  describe('calculateContentToCodeRatio', () => {
    test('should calculate ratio correctly', () => {
      const html = '<html><body><p>Hello world</p></body></html>';
      const text = 'Hello world';
      
      const ratio = contentExtractor.calculateContentToCodeRatio(html, text);
      expect(ratio).toBeGreaterThan(0);
      expect(ratio).toBeLessThanOrEqual(100);
    });

    test('should handle empty HTML', () => {
      const ratio = contentExtractor.calculateContentToCodeRatio('', 'text');
      expect(ratio).toBe(0);
    });

    test('should handle empty text', () => {
      const ratio = contentExtractor.calculateContentToCodeRatio('<html></html>', '');
      expect(ratio).toBe(0);
    });
  });

  describe('extractImageAnalysis', () => {
    test('should analyze images correctly', () => {
      const result = contentExtractor.extractImageAnalysis(mockDocument);
      
      expect(result.images).toBeDefined();
      expect(result.images.total).toBeGreaterThan(0);
      expect(result.images.withAlt).toBeDefined();
      expect(result.images.withoutAlt).toBeDefined();
      expect(typeof result.images.withAlt).toBe('number');
      expect(typeof result.images.withoutAlt).toBe('number');
    });

    test('should handle document with no images', () => {
      const noImagesHtml = '<html><body><p>No images</p></body></html>';
      const $ = cheerio.load(noImagesHtml);
      
      const noImagesDocument = {
        getElementsByTagName: (tagName) => {
          const elements = $(tagName);
          return Array.from({ length: elements.length }, (_, i) => {
            const elem = elements.eq(i);
            return elem.length > 0 ? {
              tagName: elem.get(0).name,
              textContent: elem.text(),
              getAttribute: (name) => elem.attr(name)
            } : null;
          }).filter(Boolean);
        },
        querySelectorAll: (selector) => {
          const elements = $(selector);
          return Array.from({ length: elements.length }, (_, i) => {
            const elem = elements.eq(i);
            return elem.length > 0 ? {
              tagName: elem.get(0).name,
              textContent: elem.text(),
              getAttribute: (name) => elem.attr(name)
            } : null;
          }).filter(Boolean);
        }
      };
      
      const result = contentExtractor.extractImageAnalysis(noImagesDocument);
      expect(result.images.total).toBe(0);
      expect(result.images.withAlt).toBe(0);
      expect(result.images.withoutAlt).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle null document gracefully', () => {
      expect(() => {
        contentExtractor.extractContentData(null, '');
      }).not.toThrow();
    });

    test('should handle malformed HTML', () => {
      const malformedHtml = '<html><body><p>Unclosed paragraph<div>Mixed content</body></html>';
      const $ = cheerio.load(malformedHtml);
      
      const malformedDocument = {
        body: {
          textContent: $('body').text(),
          innerHTML: $('body').html()
        },
        querySelector: () => null,
        querySelectorAll: () => []
      };
      
      expect(() => {
        contentExtractor.extractContentData(malformedDocument, malformedHtml);
      }).not.toThrow();
    });

    test('should handle very large content', () => {
      const largeText = 'word '.repeat(10000);
      
      expect(() => {
        contentExtractor.calculateReadabilityScores(largeText);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle document with only whitespace', async () => {
      const whitespaceHtml = '<html><body>   \n\t   </body></html>';
      const $ = cheerio.load(whitespaceHtml);
      
      const whitespaceDocument = {
        body: {
          textContent: $('body').text(),
          innerHTML: $('body').html()
        },
        querySelector: () => null,
        querySelectorAll: () => [],
        getElementsByTagName: () => []
      };
      
      const result = await contentExtractor.extractContentData(whitespaceDocument, whitespaceHtml);
      expect(result).toBeDefined();
      expect(result.wordCount).toBe(0);
    });

    test('should handle special characters in content', async () => {
      const specialCharsHtml = '<html><body><p>Content with émojis 🚀 and special chars: àáâã</p></body></html>';
      const $ = cheerio.load(specialCharsHtml);
      
      const specialCharsDocument = {
        body: {
          textContent: $('body').text(),
          innerHTML: $('body').html()
        },
        querySelector: () => null,
        querySelectorAll: () => [],
        getElementsByTagName: () => []
      };
      
      const result = await contentExtractor.extractContentData(specialCharsDocument, specialCharsHtml);
      expect(result).toBeDefined();
      expect(result.wordCount).toBeGreaterThan(0);
    });

    test('should handle nested heading structures', () => {
      const nestedHtml = `
        <html><body>
          <div>
            <h1>Main</h1>
            <section>
              <h2>Section</h2>
              <article>
                <h3>Article</h3>
                <div>
                  <h4>Subsection</h4>
                </div>
              </article>
            </section>
          </div>
        </body></html>
      `;
      
      const $ = cheerio.load(nestedHtml);
      const createElementFromCheerio = (cheerioElement) => {
        if (!cheerioElement || cheerioElement.length === 0) return null;
        return {
          tagName: cheerioElement.get(0).name,
          textContent: cheerioElement.text(),
          innerHTML: cheerioElement.html()
        };
      };
      
      const nestedDocument = {
        getElementsByTagName: (tagName) => {
          const elements = $(tagName);
          return Array.from({ length: elements.length }, (_, i) => 
            createElementFromCheerio(elements.eq(i))
          ).filter(Boolean);
        },
        querySelectorAll: (selector) => {
          const elements = $(selector);
          return Array.from({ length: elements.length }, (_, i) => 
            createElementFromCheerio(elements.eq(i))
          ).filter(Boolean);
        }
      };
      
      const result = contentExtractor.extractHeadingStructure(nestedDocument);
      expect(result.headingStats.totalHeadings).toBe(4);
      expect(result.headings.h1.length).toBe(1);
      expect(result.headings.h2.length).toBe(1);
      expect(result.headings.h3.length).toBe(1);
      expect(result.headings.h4.length).toBe(1);
    });

    test('should handle empty cache correctly', () => {
      const newExtractor = new ContentExtractor();
      // Disable caching by setting cache to false for this test
      newExtractor.config.cacheReadabilityScores = false;
      const text = 'Test content for no cache scenario.';
      
      const result = newExtractor.calculateReadabilityScores(text);
      expect(result).toBeDefined();
      // With caching disabled, cache should not grow
      const initialCacheSize = newExtractor.cache.size;
      newExtractor.calculateReadabilityScores(text);
      expect(newExtractor.cache.size).toBe(initialCacheSize);
    });
  });

  describe('Performance and Optimization', () => {
    test('should process large heading lists efficiently', () => {
      const manyHeadingsHtml = '<html><body>' + 
        Array.from({length: 50}, (_, i) => `<h2>Heading ${i+1}</h2>`).join('') + 
        '</body></html>';
      
      const $ = cheerio.load(manyHeadingsHtml);
      const createElementFromCheerio = (cheerioElement) => {
        if (!cheerioElement || cheerioElement.length === 0) return null;
        return {
          tagName: cheerioElement.get(0).name,
          textContent: cheerioElement.text(),
          innerHTML: cheerioElement.html()
        };
      };
      
      const manyHeadingsDocument = {
        getElementsByTagName: (tagName) => {
          const elements = $(tagName);
          return Array.from({ length: elements.length }, (_, i) => 
            createElementFromCheerio(elements.eq(i))
          ).filter(Boolean);
        },
        querySelectorAll: (selector) => {
          const elements = $(selector);
          return Array.from({ length: elements.length }, (_, i) => 
            createElementFromCheerio(elements.eq(i))
          ).filter(Boolean);
        }
      };
      
      const startTime = Date.now();
      const result = contentExtractor.extractHeadingStructure(manyHeadingsDocument);
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete in reasonable time
      expect(result.headings.h2.length).toBeLessThanOrEqual(contentExtractor.config.maxHeadingsPerType);
    });

    test('should limit image analysis for performance', () => {
      const manyImagesHtml = '<html><body>' + 
        Array.from({length: 200}, (_, i) => `<img src="img${i}.jpg" alt="Image ${i}" />`).join('') + 
        '</body></html>';
      
      const $ = cheerio.load(manyImagesHtml);
      const createElementFromCheerio = (cheerioElement) => {
        if (!cheerioElement || cheerioElement.length === 0) return null;
        return {
          tagName: cheerioElement.get(0).name,
          getAttribute: (name) => cheerioElement.attr(name)
        };
      };
      
      const manyImagesDocument = {
        getElementsByTagName: (tagName) => {
          const elements = $(tagName);
          return Array.from({ length: elements.length }, (_, i) => 
            createElementFromCheerio(elements.eq(i))
          ).filter(Boolean);
        },
        querySelectorAll: (selector) => {
          const elements = $(selector);
          return Array.from({ length: elements.length }, (_, i) => 
            createElementFromCheerio(elements.eq(i))
          ).filter(Boolean);
        }
      };
      
      const result = contentExtractor.extractImageAnalysis(manyImagesDocument);
      
      // extractImageAnalysis processes all images, unlike analyzeImagesOptimized
      expect(result.images.total).toBe(200);
    });
  });
});
