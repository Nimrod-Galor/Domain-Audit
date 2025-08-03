// Unit tests for Technical Extractor
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { TechnicalExtractor } from '../../src/extractors/technical-extractor.js';
import { DOMProcessor } from '../../src/dom/dom-processor.js';

describe('TechnicalExtractor', () => {
  let extractor;
  let processor;
  
  beforeEach(() => {
    extractor = new TechnicalExtractor();
    processor = new DOMProcessor();
  });

  describe('extract method', () => {
    test('should extract complete technical data', async () => {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Technical Test Page</title>
  <link rel="stylesheet" href="styles.css">
  <script src="script.js"></script>
</head>
<body>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
  <main>
    <h1>Main Content</h1>
    <img src="image.jpg" alt="Test Image">
    <form>
      <label for="email">Email:</label>
      <input type="email" id="email" name="email">
    </form>
  </main>
  <footer>Footer content</footer>
</body>
</html>`;

      const { document } = await processor.createDOM(html, 'https://example.com');
      const mockHeaders = new Map([
        ['content-type', 'text/html; charset=utf-8'],
        ['server', 'nginx/1.20.1'],
        ['x-powered-by', 'PHP/8.0']
      ]);
      
      const result = await extractor.extract(document, 'https://example.com', mockHeaders);
      
      expect(result).toBeDefined();
      expect(result.infrastructure).toBeDefined();
      expect(result.architecture).toBeDefined();
      expect(result.accessibility).toBeDefined();
      expect(result.mobile).toBeDefined();
      expect(result.security).toBeDefined();
    });

    test('should analyze infrastructure correctly', async () => {
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="external.css">
  <script src="external.js"></script>
  <style>body { margin: 0; }</style>
</head>
<body></body>
</html>`;

      const { document } = await processor.createDOM(html, 'https://example.com');
      const result = await extractor.extract(document, 'https://example.com');
      
      expect(result.infrastructure).toBeDefined();
      expect(result.infrastructure.charset).toBe('UTF-8');
      expect(result.infrastructure.viewport).toContain('width=device-width');
      expect(result.infrastructure.externalResources).toBeDefined();
      expect(result.infrastructure.externalResources.css).toBeGreaterThan(0);
      expect(result.infrastructure.externalResources.js).toBeGreaterThan(0);
    });

    test('should analyze URL architecture', async () => {
      const testUrls = [
        'https://example.com/',
        'https://example.com/about',
        'https://example.com/blog/article-title',
        'https://example.com/category/subcategory/product?id=123&utm_source=test'
      ];

      for (const url of testUrls) {
        const html = '<html><head><title>Test</title></head><body></body></html>';
        const { document } = await processor.createDOM(html, url);
        const result = await extractor.extract(document, url);
        
        expect(result.architecture).toBeDefined();
        expect(result.architecture.urlLength).toBe(url.length);
        expect(typeof result.architecture.urlDepth).toBe('number');
        expect(typeof result.architecture.hasQueryParams).toBe('boolean');
      }
    });

    test('should analyze accessibility features', async () => {
      const accessibleHTML = `<!DOCTYPE html>
<html lang="en">
<head><title>Accessible Page</title></head>
<body>
  <h1>Main Heading</h1>
  <h2>Subheading</h2>
  <img src="image.jpg" alt="Descriptive alt text">
  <img src="decorative.jpg" alt="">
  <form>
    <label for="username">Username:</label>
    <input type="text" id="username" name="username">
    <label for="password">Password:</label>
    <input type="password" id="password" name="password">
  </form>
  <button aria-label="Close dialog">×</button>
</body>
</html>`;

      const { document } = await processor.createDOM(accessibleHTML, 'https://example.com');
      const result = await extractor.extract(document, 'https://example.com');
      
      expect(result.accessibility).toBeDefined();
      expect(result.accessibility.headingStructure).toBeDefined();
      expect(result.accessibility.headingStructure.h1Count).toBe(1);
      expect(result.accessibility.images).toBeDefined();
      expect(result.accessibility.images.withAlt).toBeGreaterThan(0);
      expect(result.accessibility.forms).toBeDefined();
      expect(result.accessibility.forms.withLabels).toBeGreaterThan(0);
    });

    test('should analyze mobile optimization', async () => {
      const mobileOptimizedHTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mobile Optimized</title>
  <style>
    @media (max-width: 768px) {
      .responsive { font-size: 14px; }
    }
  </style>
</head>
<body>
  <div class="responsive">Content</div>
</body>
</html>`;

      const { document } = await processor.createDOM(mobileOptimizedHTML, 'https://example.com');
      const result = await extractor.extract(document, 'https://example.com');
      
      expect(result.mobile).toBeDefined();
      expect(result.mobile.hasViewportMeta).toBe(true);
      expect(result.mobile.viewportContent).toContain('width=device-width');
    });

    test('should calculate overall technical score', async () => {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Well-structured Page</title>
</head>
<body>
  <h1>Main Heading</h1>
  <nav><a href="/">Home</a></nav>
  <main>Content</main>
  <footer>Footer</footer>
</body>
</html>`;

      const { document } = await processor.createDOM(html, 'https://example.com');
      const result = await extractor.extract(document, 'https://example.com');
      
      expect(result.overallScore).toBeDefined();
      expect(typeof result.overallScore).toBe('number');
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });
  });

  describe('error handling', () => {
    test('should handle empty documents gracefully', async () => {
      const emptyHTML = '';
      const { document } = await processor.createDOM(emptyHTML, 'https://example.com');
      
      const result = await extractor.extract(document, 'https://example.com');
      
      expect(result).toBeDefined();
      expect(typeof result.overallScore).toBe('number');
    });

    test('should handle malformed HTML', async () => {
      const malformedHTML = '<html><head><title>Test</head><body><div>Unclosed</body></html>';
      const { document } = await processor.createDOM(malformedHTML, 'https://example.com');
      
      expect(async () => {
        await extractor.extract(document, 'https://example.com');
      }).not.toThrow();
    });

    test('should handle missing URL gracefully', async () => {
      const html = '<html><head><title>Test</title></head><body></body></html>';
      const { document } = await processor.createDOM(html, '');
      
      const result = await extractor.extract(document, '');
      
      expect(result).toBeDefined();
      expect(result.architecture).toBeDefined();
    });
  });

  describe('performance', () => {
    test('should process large documents efficiently', async () => {
      // Create a large HTML document
      const largeContent = Array(1000).fill('<p>Test paragraph with content</p>').join('');
      const largeHTML = `<!DOCTYPE html>
<html>
<head><title>Large Document</title></head>
<body>${largeContent}</body>
</html>`;

      const { document } = await processor.createDOM(largeHTML, 'https://example.com');
      
      const startTime = Date.now();
      const result = await extractor.extract(document, 'https://example.com');
      const endTime = Date.now();
      
      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });
});
