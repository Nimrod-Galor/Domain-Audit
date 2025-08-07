/**
 * XSS Prevention Security Tests
 * Tests for REAL Cheerio-based XSS protection in our application
 * Focus: Testing our actual Cheerio implementation, not external packages
 */

import { describe, test, expect } from '@jest/globals';

// Import REAL enterprise security functions from our application
import { 
  validationSchemas,
  XSSProtection,
  SecurityUtils
} from '../../web/lib/enterprise-security.js';

describe('Real XSS Prevention Implementation Tests', () => {
  
  describe('Cheerio-based HTML Sanitization', () => {
    test('should remove dangerous scripts using real Cheerio implementation', () => {
      // Test script tag removal
      const maliciousHTML = '<script>alert("xss")</script><p>Safe content</p>';
      const result = XSSProtection.sanitizeHTML(maliciousHTML);
      
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert("xss")');
      expect(result).toContain('Safe content');
    });
    
    test('should remove dangerous attributes using real Cheerio implementation', () => {
      // Test event handler removal
      const maliciousHTML = '<img src="image.jpg" onerror="alert(1)" onload="malicious()">';
      const result = XSSProtection.sanitizeHTML(maliciousHTML);
      
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('onload');
      expect(result).not.toContain('src'); // Our implementation removes src too for safety
    });
    
    test('should remove dangerous elements using real Cheerio implementation', () => {
      const maliciousHTML = `
        <object data="malicious.swf"></object>
        <embed src="malicious.swf">
        <style>body{background:url('javascript:alert(1)')}</style>
        <link rel="stylesheet" href="malicious.css">
      `;
      const result = XSSProtection.sanitizeHTML(maliciousHTML);
      
      expect(result).not.toContain('<object');
      expect(result).not.toContain('<embed');
      expect(result).not.toContain('<style');
      expect(result).not.toContain('<link');
    });
    
    test('should preserve safe HTML elements using real Cheerio implementation', () => {
      const safeHTML = '<p>Hello <strong>World</strong>!</p><ul><li>Item 1</li><li>Item 2</li></ul>';
      const result = XSSProtection.sanitizeHTML(safeHTML);
      
      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });
    
    test('should handle edge cases in HTML sanitization', () => {
      expect(XSSProtection.sanitizeHTML('')).toBe('');
      expect(XSSProtection.sanitizeHTML(null)).toBe('');
      expect(XSSProtection.sanitizeHTML(undefined)).toBe('');
      
      // Test malformed HTML
      const malformedHTML = '<script>alert(1)<p>content</script>';
      const result = XSSProtection.sanitizeHTML(malformedHTML);
      expect(result).not.toContain('<script>');
    });
  });
  
  describe('Cheerio-based Text Extraction', () => {
    test('should extract clean text using real Cheerio implementation', () => {
      const htmlWithScripts = '<p>Hello <script>alert(1)</script> World</p>';
      const result = XSSProtection.sanitizeText(htmlWithScripts);
      
      // Note: sanitizeText extracts ALL text content, including script content
      // For full security, use sanitizeHTML which removes dangerous elements
      expect(result).toBe('Hello alert(1) World'); // This is what $.text() actually returns
      expect(result).not.toContain('<script>');
    });
    
    test('should handle complex HTML structures', () => {
      const complexHTML = `
        <div>
          <h1>Title</h1>
          <p>Paragraph with <a href="link">link</a></p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      `;
      const result = XSSProtection.sanitizeText(complexHTML);
      
      expect(result).toContain('Title');
      expect(result).toContain('Paragraph');
      expect(result).toContain('link');
      expect(result).toContain('Item 1');
      expect(result).not.toContain('<div>');
      expect(result).not.toContain('<p>');
    });
    
    test('should fallback to regex for invalid HTML', () => {
      // Test with invalid HTML that might break Cheerio
      const invalidHTML = '<<script>alert(1)</script>';
      const result = XSSProtection.sanitizeText(invalidHTML);
      
      expect(result).not.toContain('<script>');
    });
  });
  
  describe('Real HTML Entity Escaping', () => {
    test('should escape dangerous characters using real implementation', () => {
      const dangerous = '<script>alert("xss")</script>';
      const result = XSSProtection.escapeHTML(dangerous);
      
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });
    
    test('should escape all dangerous HTML entities', () => {
      const testCases = [
        { input: '<', expected: '&lt;' },
        { input: '>', expected: '&gt;' },
        { input: '"', expected: '&quot;' },
        { input: "'", expected: '&#x27;' },
        { input: '&', expected: '&amp;' },
        { input: '/', expected: '&#x2F;' }
      ];
      
      testCases.forEach(({ input, expected }) => {
        expect(XSSProtection.escapeHTML(input)).toBe(expected);
      });
    });
    
    test('should handle edge cases in HTML escaping', () => {
      expect(XSSProtection.escapeHTML('')).toBe('');
      expect(XSSProtection.escapeHTML(null)).toBe('');
      expect(XSSProtection.escapeHTML(undefined)).toBe('');
    });
  });
  
  describe('Real Input Sanitization', () => {
    test('should sanitize user input using real implementation', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello World';
      const result = XSSProtection.sanitizeInput(maliciousInput);
      
      expect(result).toBe('Hello World');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('&');
      expect(result).not.toContain('"');
    });
    
    test('should handle long inputs with DoS protection', () => {
      const longInput = 'a'.repeat(20000);
      const result = XSSProtection.sanitizeInput(longInput);
      
      expect(result.length).toBeLessThanOrEqual(10000);
    });
    
    test('should normalize whitespace in user input', () => {
      const messyInput = '  Hello    World   \n\t  ';
      const result = XSSProtection.sanitizeInput(messyInput);
      
      expect(result).toBe('Hello World');
    });
  });
  
  describe('Real URL Sanitization', () => {
    test('should validate safe URLs using real implementation', () => {
      const safeUrls = [
        'https://example.com',
        'http://test.example.com/path',
        'https://secure-site.org/page?param=value'
      ];
      
      safeUrls.forEach(url => {
        expect(XSSProtection.sanitizeURL(url)).toBe(url);
      });
    });
    
    test('should block dangerous URL schemes using real implementation', () => {
      const dangerousUrls = [
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox(1)',
        'file:///etc/passwd'
      ];
      
      dangerousUrls.forEach(url => {
        expect(XSSProtection.sanitizeURL(url)).toBe('');
      });
    });
    
    test('should handle malformed URLs', () => {
      const malformedUrls = [
        'not-a-url',
        'https://',
        'https://.',
        ''
      ];
      
      malformedUrls.forEach(url => {
        expect(XSSProtection.sanitizeURL(url)).toBe('');
      });
    });
  });
  
  describe('Joi URL Validation for XSS Protection', () => {
    test('should block dangerous URL schemes using real Joi validation', () => {
      // Test dangerous protocols - should fail validation
      const { error: jsError } = validationSchemas.url.validate('javascript:alert(1)');
      expect(jsError).toBeDefined();
      
      // Test safe URLs - should pass validation
      const { error: httpsError } = validationSchemas.url.validate('https://example.com');
      expect(httpsError).toBeUndefined();
    });
    
    test('should block SSRF attempts using real Joi validation', () => {
      const ssrfUrls = [
        'http://localhost:8080',
        'https://127.0.0.1/admin',
        'http://192.168.1.1/router',
        'http://10.0.0.1/internal',
        'http://172.16.0.1/service',
        'http://169.254.169.254/metadata'
      ];
      
      ssrfUrls.forEach(url => {
        const { error } = validationSchemas.url.validate(url);
        expect(error).toBeDefined();
      });
    });
  });
  
  describe('Joi User Input Validation for XSS Protection', () => {
    test('should block XSS patterns using real Joi validation', () => {
      const xssInputs = [
        '<script>alert(1)</script>',
        '<img src=x onerror=alert(1)>',
        'javascript:alert(1)',
        '<iframe src="javascript:alert(1)"></iframe>'
      ];
      
      xssInputs.forEach(input => {
        const { error } = validationSchemas.userInput.validate(input);
        expect(error).toBeDefined();
      });
    });
    
    test('should block SQL injection patterns using real Joi validation', () => {
      const sqlInputs = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "admin'/*",
        "1; DELETE FROM users",
        "UNION SELECT * FROM passwords"
      ];
      
      sqlInputs.forEach(input => {
        const { error } = validationSchemas.userInput.validate(input);
        expect(error).toBeDefined();
      });
    });
    
    test('should allow safe user input using real Joi validation', () => {
      const safeInputs = [
        'Hello World',
        'user@example.com',
        'This is a normal comment with punctuation!',
        '123 Main Street, City',
        'Product Name (Model ABC123)'
      ];
      
      safeInputs.forEach(input => {
        const { error } = validationSchemas.userInput.validate(input);
        expect(error).toBeUndefined();
      });
    });
  });
});
