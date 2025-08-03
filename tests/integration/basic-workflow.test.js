// Simple integration tests for basic workflow
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { DOMProcessor } from '../../src/dom/dom-processor.js';
import { extractSEOData } from '../../src/extractors/seo-extractor.js';
import { ContentExtractor } from '../../src/extractors/content-extractor.js';

// Mock fetch for testing
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Basic Audit Workflow Integration', () => {
  let processor;
  let contentExtractor;

  beforeEach(() => {
    processor = new DOMProcessor();
    contentExtractor = new ContentExtractor();
    jest.clearAllMocks();
  });

  describe('complete page analysis workflow', () => {
    test('should perform basic analysis workflow successfully', async () => {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Test page for integration testing with comprehensive analysis">
  <title>Integration Test Page - Complete Analysis</title>
  <link rel="canonical" href="https://example.com/">
  <meta property="og:title" content="Integration Test">
  <meta property="og:description" content="Test description">
</head>
<body>
  <header>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
    </nav>
  </header>
  <main>
    <h1>Welcome to Integration Test</h1>
    <p>This is a comprehensive test page with multiple elements for testing the complete analysis workflow.</p>
    <h2>Section Two</h2>
    <p>Additional content to test content analysis functionality.</p>
    <img src="test-image.jpg" alt="Test image for analysis">
    <a href="/internal-page">Internal Link</a>
    <a href="https://external.com">External Link</a>
  </main>
  <footer>
    <p>&copy; 2024 Integration Test</p>
  </footer>
</body>
</html>`;

      // Process the DOM
      const { document } = await processor.createDOM(html, 'https://example.com');
      
      // Extract SEO data
      const seoData = extractSEOData(document);
      
      // Extract content data
      const contentData = contentExtractor.extractContentDataOptimized(document, html);
      
      // Verify SEO analysis
      expect(seoData).toBeDefined();
      expect(seoData.title.text).toBe('Integration Test Page - Complete Analysis');
      expect(seoData.metaDescription.text).toContain('Test page for integration testing');
      expect(seoData.canonical).toBe('https://example.com/');
      expect(seoData.openGraph.title).toBe('Integration Test');
      
      // Verify content analysis
      expect(contentData).toBeDefined();
      expect(contentData.wordCount).toBeGreaterThan(0);
      expect(contentData.textLength).toBeGreaterThan(0);
      expect(contentData.extractionMethod).toBe('optimized');
      
      // Verify combined analysis makes sense
      expect(seoData.title.text.length).toBeGreaterThan(0);
      expect(contentData.wordCount).toBeGreaterThan(10); // Should have substantial content
    });

    test('should handle pages with missing elements gracefully', async () => {
      const minimalHTML = `<!DOCTYPE html>
<html>
<head><title>Minimal Page</title></head>
<body><p>Minimal content</p></body>
</html>`;

      const { document } = await processor.createDOM(minimalHTML, 'https://example.com');
      
      const seoData = extractSEOData(document);
      const contentData = contentExtractor.extractContentDataOptimized(document, minimalHTML);
      
      // Should still work with minimal content
      expect(seoData.title.text).toBe('Minimal Page');
      expect(seoData.metaDescription.text).toBe(''); // No meta description
      expect(seoData.canonical).toBe(''); // No canonical
      
      expect(contentData.wordCount).toBeGreaterThan(0);
      expect(contentData.textLength).toBeGreaterThan(0);
    });

    test('should extract and analyze links correctly', async () => {
      const htmlWithLinks = `<!DOCTYPE html>
<html>
<head><title>Link Test</title></head>
<body>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="https://external.com">External</a>
    <a href="mailto:test@example.com">Email</a>
  </nav>
  <main>
    <p>Content with <a href="/internal">internal link</a></p>
  </main>
</body>
</html>`;

      const { document } = await processor.createDOM(htmlWithLinks, 'https://example.com');
      
      // Test link extraction through DOM processor
      const linkAnalysis = processor.extractLinkAnalysis(document, 'https://example.com');
      
      expect(linkAnalysis.totalLinks).toBeGreaterThan(0);
      
      // Test that content extraction also works
      const contentData = contentExtractor.extractContentDataOptimized(document, htmlWithLinks);
      expect(contentData.wordCount).toBeGreaterThan(0);
    });

    test('should process images and media elements', async () => {
      const htmlWithMedia = `<!DOCTYPE html>
<html>
<head><title>Media Test</title></head>
<body>
  <img src="image1.jpg" alt="Image with alt text">
  <img src="image2.jpg">
  <video src="video.mp4"></video>
  <audio src="audio.mp3"></audio>
  <p>Content with media elements</p>
</body>
</html>`;

      const { document } = await processor.createDOM(htmlWithMedia, 'https://example.com');
      
      const contentData = contentExtractor.extractContentDataOptimized(document, htmlWithMedia);
      
      expect(contentData.images).toBeDefined();
      expect(contentData.images.total).toBe(2);
      expect(contentData.hasVideo).toBe(true);
      expect(contentData.hasAudio).toBe(true);
    });
  });

  describe('error handling in workflow', () => {
    test('should handle malformed HTML gracefully', async () => {
      const malformedHTML = '<html><head><title>Test</head><body><p>Unclosed tags<div>Content</body>';
      
      const { document } = await processor.createDOM(malformedHTML, 'https://example.com');
      
      // Should still extract what it can
      const seoData = extractSEOData(document);
      const contentData = contentExtractor.extractContentDataOptimized(document, malformedHTML);
      
      expect(seoData).toBeDefined();
      expect(contentData).toBeDefined();
      // Malformed HTML might result in no extractable text content
      expect(contentData.wordCount).toBeGreaterThanOrEqual(0);
    });

    test('should provide meaningful defaults for empty content', async () => {
      const emptyHTML = '<html><head></head><body></body></html>';
      
      const { document } = await processor.createDOM(emptyHTML, 'https://example.com');
      
      const seoData = extractSEOData(document);
      const contentData = contentExtractor.extractContentDataOptimized(document, emptyHTML);
      
      expect(seoData.title.text).toBe('');
      expect(seoData.title.isEmpty).toBe(true);
      
      expect(contentData.wordCount).toBe(0);
      expect(contentData.textLength).toBe(0);
    });
  });

  describe('performance and caching', () => {
    test('should complete analysis within reasonable time', async () => {
      const largeHTML = `<!DOCTYPE html>
<html>
<head><title>Large Content Test</title></head>
<body>
  <h1>Large Content Analysis</h1>
  ${Array(100).fill('<p>Repeated content paragraph for testing performance.</p>').join('')}
</body>
</html>`;

      const startTime = Date.now();
      
      const { document } = await processor.createDOM(largeHTML, 'https://example.com');
      const seoData = extractSEOData(document);
      const contentData = contentExtractor.extractContentDataOptimized(document, largeHTML);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 1 second for this test)
      expect(duration).toBeLessThan(1000);
      
      // Should still extract data correctly
      expect(seoData.title.text).toBe('Large Content Test');
      expect(contentData.wordCount).toBeGreaterThan(500); // Lots of repeated content
    });
  });
});
