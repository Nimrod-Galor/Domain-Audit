// Unit tests for Core Utilities
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { 
  extractMainDomain, 
  isValidUrl, 
  normalizeUrl, 
  getUrlDepth,
  sanitizeFilename,
  formatBytes,
  calculateReadingTime,
  debounce,
  throttle,
  generateCacheKey,
  parseQueryParams
} from '../../src/utils/core-utils.js';

describe('Core Utilities', () => {
  describe('URL utilities', () => {
    test('should extract main domain correctly', () => {
      expect(extractMainDomain('https://www.example.com/path')).toBe('example-com');
      expect(extractMainDomain('https://subdomain.example.co.uk/page')).toBe('example-co-uk');
      expect(extractMainDomain('http://localhost:3000')).toBe('localhost');
      expect(extractMainDomain('https://example.org')).toBe('example-org');
      expect(extractMainDomain('https://blog.example.com')).toBe('example-com');
    });

    test('should validate URLs correctly', () => {
      expect(isValidUrl('https://www.example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://subdomain.example.co.uk/path?query=1')).toBe(true);
      expect(isValidUrl('ftp://files.example.com')).toBe(true);
      
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('http://')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl(null)).toBe(false);
    });

    test('should normalize URLs correctly', () => {
      expect(normalizeUrl('HTTP://WWW.EXAMPLE.COM/PATH/')).toBe('https://www.example.com/path');
      expect(normalizeUrl('https://example.com/path?utm_source=test&id=1')).toBe('https://example.com/path?id=1');
      expect(normalizeUrl('https://example.com/path/../other')).toBe('https://example.com/other');
      expect(normalizeUrl('https://example.com:443/path')).toBe('https://example.com/path');
    });

    test('should calculate URL depth correctly', () => {
      expect(getUrlDepth('https://example.com/')).toBe(0);
      expect(getUrlDepth('https://example.com/about')).toBe(1);
      expect(getUrlDepth('https://example.com/blog/article')).toBe(2);
      expect(getUrlDepth('https://example.com/category/subcategory/product')).toBe(3);
      expect(getUrlDepth('https://example.com/path?query=1')).toBe(1);
    });

    test('should parse query parameters correctly', () => {
      const params1 = parseQueryParams('https://example.com?id=1&name=test&active=true');
      expect(params1).toEqual({ id: '1', name: 'test', active: 'true' });
      
      const params2 = parseQueryParams('https://example.com/path');
      expect(params2).toEqual({});
      
      const params3 = parseQueryParams('https://example.com?utm_source=google&utm_medium=cpc');
      expect(params3).toEqual({ utm_source: 'google', utm_medium: 'cpc' });
    });
  });

  describe('file utilities', () => {
    test('should sanitize filenames correctly', () => {
      expect(sanitizeFilename('example.com')).toBe('example.com');
      expect(sanitizeFilename('file with spaces.txt')).toBe('file-with-spaces.txt');
      expect(sanitizeFilename('file/with\\invalid:chars*.txt')).toBe('file-with-invalid-chars.txt');
      expect(sanitizeFilename('very-long-filename-that-exceeds-normal-limits-for-filesystem-compatibility.txt'))
        .toHaveLength(100);
    });

    test('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
      expect(formatBytes(1536)).toBe('1.5 KB');
      expect(formatBytes(2621440)).toBe('2.5 MB');
    });
  });

  describe('text utilities', () => {
    test('should calculate reading time correctly', () => {
      const shortText = 'This is a short text with about ten words.';
      expect(calculateReadingTime(shortText)).toBe(1); // Should be minimum 1 minute
      
      const mediumText = Array(100).fill('word').join(' '); // 100 words
      expect(calculateReadingTime(mediumText)).toBe(1); // ~0.5 minutes, rounded to 1
      
      const longText = Array(500).fill('word').join(' '); // 500 words
      expect(calculateReadingTime(longText)).toBe(3); // ~2.5 minutes, rounded to 3
    });
  });

  describe('performance utilities', () => {
    test('should debounce function calls correctly', (done) => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 100);

      // Call multiple times rapidly
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      // Should not be called yet
      expect(callCount).toBe(0);
      
      setTimeout(() => {
        // Should be called only once after delay
        expect(callCount).toBe(1);
        done();
      }, 150);
    });

    test('should throttle function calls correctly', (done) => {
      let callCount = 0;
      const throttledFn = throttle(() => {
        callCount++;
      }, 100);

      // Call multiple times rapidly
      throttledFn(); // Should execute immediately
      throttledFn(); // Should be throttled
      throttledFn(); // Should be throttled
      
      // Should be called once immediately
      expect(callCount).toBe(1);
      
      setTimeout(() => {
        throttledFn(); // Should execute after throttle period
        setTimeout(() => {
          expect(callCount).toBe(2);
          done();
        }, 50);
      }, 120);
    });

    test('should generate cache keys consistently', () => {
      const key1 = generateCacheKey('test', 'data', 123);
      const key2 = generateCacheKey('test', 'data', 123);
      const key3 = generateCacheKey('test', 'data', 456);
      
      expect(key1).toBe(key2);
      expect(key1).not.toBe(key3);
      expect(typeof key1).toBe('string');
      expect(key1.length).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    test('should handle invalid inputs gracefully', () => {
      expect(() => extractMainDomain(null)).not.toThrow();
      expect(() => extractMainDomain('')).not.toThrow();
      expect(() => isValidUrl(undefined)).not.toThrow();
      expect(() => normalizeUrl(123)).not.toThrow();
      expect(() => formatBytes('invalid')).not.toThrow();
      expect(() => calculateReadingTime(null)).not.toThrow();
    });

    test('should return sensible defaults for invalid inputs', () => {
      expect(extractMainDomain('')).toBe('');
      expect(isValidUrl('')).toBe(false);
      expect(getUrlDepth('')).toBe(0);
      expect(formatBytes(NaN)).toBe('0 B');
      expect(calculateReadingTime('')).toBe(1);
    });
  });

  describe('edge cases', () => {
    test('should handle Unicode in URLs', () => {
      expect(isValidUrl('https://测试.example.com')).toBe(true);
      expect(extractMainDomain('https://测试.example.com')).toMatch(/example-com/);
    });

    test('should handle very long URLs', () => {
      const longPath = '/' + Array(100).fill('segment').join('/');
      const longUrl = 'https://example.com' + longPath;
      
      expect(isValidUrl(longUrl)).toBe(true);
      expect(getUrlDepth(longUrl)).toBe(100);
    });

    test('should handle special URL schemes', () => {
      expect(isValidUrl('mailto:test@example.com')).toBe(true);
      expect(isValidUrl('tel:+1234567890')).toBe(true);
      expect(isValidUrl('data:text/plain;base64,SGVsbG8=')).toBe(true);
    });

    test('should handle performance utilities with edge cases', () => {
      // Test debounce with zero delay
      const immediateFn = debounce(() => {}, 0);
      expect(() => immediateFn()).not.toThrow();
      
      // Test throttle with zero delay
      const immediateThrottle = throttle(() => {}, 0);
      expect(() => immediateThrottle()).not.toThrow();
    });
  });
});
