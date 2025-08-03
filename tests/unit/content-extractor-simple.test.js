// Unit tests for Content Extractor (simplified)
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { ContentExtractor } from '../../src/extractors/content-extractor.js';
import { DOMProcessor } from '../../src/dom/dom-processor.js';

describe('ContentExtractor', () => {
  let extractor;
  let processor;
  
  beforeEach(() => {
    extractor = new ContentExtractor();
    processor = new DOMProcessor();
  });

  describe('content extraction', () => {
    test('should extract basic content data correctly', async () => {
      const html = `<!DOCTYPE html>
<html>
<head><title>Test Content</title></head>
<body>
  <h1>Main Heading</h1>
  <h2>Secondary Heading</h2>
  <p>This is a paragraph with some content for testing the content extraction functionality.</p>
  <img src="image.jpg" alt="Test image">
  <a href="/internal">Internal Link</a>
  <a href="https://external.com">External Link</a>
</body>
</html>`;
      
      const { document } = await processor.createDOM(html, 'https://example.com');
      const contentData = extractor.extractContentDataOptimized(document, html);
      
      expect(contentData.wordCount).toBeGreaterThan(0);
      expect(contentData.textLength).toBeGreaterThan(0);
      expect(contentData.headings).toBeDefined();
      expect(contentData.images).toBeDefined();
      expect(contentData.extractionMethod).toBe('optimized');
    });

    test('should handle empty content gracefully', async () => {
      const emptyHTML = `<!DOCTYPE html>
<html>
<head><title>Empty Page</title></head>
<body></body>
</html>`;

      const { document } = await processor.createDOM(emptyHTML, 'https://example.com');
      const result = extractor.extractContentDataOptimized(document, emptyHTML);
      
      expect(result).toBeDefined();
      expect(result.wordCount).toBe(0);
      expect(result.textLength).toBeGreaterThanOrEqual(0); // Body might have whitespace
    });

    test('should calculate content metrics correctly', async () => {
      const html = `<!DOCTYPE html>
<html>
<head><title>Content Test</title></head>
<body>
  <h1>Main Title</h1>
  <p>This is a test paragraph with multiple words to test content analysis.</p>
  <h2>Subtitle</h2>
  <p>Another paragraph with more content for testing purposes.</p>
</body>
</html>`;
      
      const { document } = await processor.createDOM(html, 'https://example.com');
      const contentData = extractor.extractContentDataOptimized(document, html);
      
      expect(contentData.wordCount).toBeGreaterThan(10);
      expect(contentData.contentToCodeRatio).toBeGreaterThan(0);
      expect(contentData.headings).toBeDefined();
    });
  });

  describe('readability analysis', () => {
    test('should calculate readability scores', () => {
      const text = 'This is a simple test sentence. It has multiple sentences for testing. The readability should be calculated correctly.';
      
      const scores = extractor.calculateReadabilityScores(text);
      
      expect(scores.fleschReadingEase).toBeGreaterThan(0);
      expect(scores.wordCount).toBeGreaterThan(0);
      expect(scores.sentenceCount).toBeGreaterThan(0);
      expect(scores.readingLevel).toBeDefined();
    });

    test('should handle empty text for readability', () => {
      const scores = extractor.calculateReadabilityScores('');
      
      expect(scores.wordCount).toBe(0);
      expect(scores.sentenceCount).toBe(0);
      expect(scores.readingLevel).toBe('No content');
    });
  });

  describe('utility methods', () => {
    test('should count words correctly', () => {
      expect(extractor.countWords('hello world')).toBe(2);
      expect(extractor.countWords('  hello   world  ')).toBe(2);
      expect(extractor.countWords('')).toBe(0);
      expect(extractor.countWords('single')).toBe(1);
    });

    test('should calculate content to code ratio', () => {
      const html = '<html><body><p>Hello world</p></body></html>';
      const text = 'Hello world';
      
      const ratio = extractor.calculateContentToCodeRatio(html, text);
      
      expect(ratio).toBeGreaterThan(0);
      expect(ratio).toBeLessThanOrEqual(100);
    });
  });

  describe('error handling', () => {
    test('should handle documents without body', async () => {
      const malformedHTML = '<html><head><title>No Body</title></head></html>';
      
      const { document } = await processor.createDOM(malformedHTML, 'https://example.com');
      const result = extractor.extractContentDataOptimized(document, malformedHTML);
      
      expect(result).toBeDefined();
      expect(result.wordCount).toBe(0);
    });

    test('should provide empty data when extraction fails', () => {
      const emptyData = extractor.getEmptyContentData();
      
      expect(emptyData.wordCount).toBe(0);
      expect(emptyData.textLength).toBe(0);
      expect(emptyData.extractionMethod).toBe('empty');
    });
  });
});
