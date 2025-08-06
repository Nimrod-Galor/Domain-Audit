/**
 * Basic Security Tests
 * Simple tests to verify real security functions are working
 * UPDATED: Testing real application functions only
 */

const { describe, test, expect } = require('@jest/globals');

// Import REAL validation functions from the application
const { validateURL, sanitizeURL, validateEmail, validatePassword } = require('../../audit-website/lib/validators.js');

describe('Basic Security Tests', () => {
  
  test('should validate URLs using real validateURL function', () => {
    // Test legitimate URLs
    expect(validateURL('https://example.com')).toBe(true);
    expect(validateURL('http://test.org')).toBe(true);
    
    // Test malicious URLs
    expect(validateURL('javascript:alert("XSS")')).toBe(false);
    expect(validateURL('http://localhost:3306')).toBe(false);
    expect(validateURL('https://169.254.169.254/metadata')).toBe(false);
  });

  test('should validate emails using real validateEmail function', () => {
    // Test legitimate emails
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.email+tag@domain.co.uk')).toBe(true);
    
    // Test invalid emails
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
  });

  test('should validate passwords using real validatePassword function', () => {
    // Test valid passwords (6+ characters)
    expect(validatePassword('password123')).toBe(true);
    expect(validatePassword('MySecurePassword!')).toBe(true);
    
    // Test invalid passwords
    expect(validatePassword('short')).toBe(false);
    expect(validatePassword('')).toBe(false);
    expect(validatePassword(null)).toBe(false);
  });

  test('should sanitize URLs using real sanitizeURL function', () => {
    // Test URL sanitization
    expect(sanitizeURL('example.com')).toBe('https://example.com');
    expect(sanitizeURL('  test.org  ')).toBe('https://test.org');
    expect(sanitizeURL('https://secure.com')).toBe('https://secure.com');
    expect(sanitizeURL('')).toBe('');
  });

  test('should handle edge cases in validation functions', () => {
    // Test edge cases
    expect(validateURL('')).toBe(false);
    expect(validateURL(null)).toBe(false);
    expect(validateURL(undefined)).toBe(false);
    
    expect(validateEmail('')).toBe(false);
    expect(validatePassword(undefined)).toBe(false);
    
    expect(sanitizeURL(null)).toBe('');
  });
});
