// Unit tests for DOMProcessor
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { DOMProcessor } from '../../src/dom/dom-processor.js';

// Simple HTML factory used in tests (was previously missing, causing ReferenceError)
function createMockHTML(title, bodyContent = '') {
  return `<!DOCTYPE html><html><head><title>${title}</title></head><body>${bodyContent}</body></html>`;
}

describe('DOMProcessor', () => {
  let processor;
  
  beforeEach(() => {
    processor = new DOMProcessor();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDOM', () => {
    test('should process valid HTML successfully', async () => {
      const html = createMockHTML('Test Title', '<div id="content">Hello World</div>');
      const url = 'https://example.com';
      
      const result = await processor.createDOM(html, url);
      
      expect(result.error).toBeUndefined();
      expect(result.document).toBeDefined();
      expect(result.document.title).toBe('Test Title');
      expect(result.document.querySelector('#content')).toBeDefined();
    });

    test('should handle malformed HTML gracefully', async () => {
      const malformedHTML = '<html><head><title>Bad HTML</head><body><div>No closing tag</body></html>';
      const url = 'https://example.com';
      
      const result = await processor.createDOM(malformedHTML, url);
      
      // Cheerio should handle malformed HTML gracefully
      expect(result.error).toBeUndefined();
      expect(result.document).toBeDefined();
      expect(result.document.title).toContain('Bad HTML');
    });

    test('should handle empty HTML', async () => {
      const emptyHTML = '';
      const url = 'https://example.com';
      
      const result = await processor.createDOM(emptyHTML, url);
      
      expect(result.error).toBeUndefined();
      expect(result.document).toBeDefined();
    });

    test('should extract links correctly', async () => {
      const htmlWithLinks = createMockHTML('Links Test', `
        <a href="https://external.com">External Link</a>
        <a href="/internal">Internal Link</a>
        <a href="mailto:test@example.com">Email Link</a>
        <a href="tel:+1234567890">Phone Link</a>
      `);
      const url = 'https://example.com';
      
      const result = await processor.createDOM(htmlWithLinks, url);
      
      expect(result.error).toBeUndefined();
      const links = result.document.querySelectorAll('a');
      expect(links.length).toBe(4);
    });

    test('should handle CSS selector errors gracefully', async () => {
      const html = createMockHTML('CSS Test', '<div class="test">Content</div>');
      const url = 'https://example.com';
      
      const result = await processor.createDOM(html, url);
      
      // Test invalid CSS selector (should not throw)
      expect(() => {
        result.document.querySelectorAll(':invalid-pseudo');
      }).not.toThrow();
    });
  });

  describe('performance optimization', () => {
    test('should handle large HTML documents efficiently', async () => {
      // Create a large HTML document
      const largeContent = Array(1000).fill('<p>Test paragraph with some content</p>').join('');
      const largeHTML = createMockHTML('Large Document', largeContent);
      const url = 'https://example.com';
      
      const startTime = Date.now();
      const result = await processor.createDOM(largeHTML, url);
      const endTime = Date.now();
      
      expect(result.error).toBeUndefined();
      expect(result.document).toBeDefined();
      // Should process large document reasonably quickly (under 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
